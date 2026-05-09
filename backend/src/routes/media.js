import {
  extractStorageKeyFromUrl,
  getObjectStream,
  headObject,
} from "../lib/storage.js";

function unwrapProxyUrl(url) {
  let current = url;
  for (let i = 0; i < 3; i++) {
    try {
      const parsed = new URL(current);
      if (!parsed.pathname.endsWith("/api/media/proxy")) break;
      const nested = parsed.searchParams.get("url");
      if (!nested) break;
      current = decodeURIComponent(nested);
    } catch {
      break;
    }
  }
  return current;
}

function parseByteRange(rangeHeader, totalLength) {
  if (!rangeHeader || !rangeHeader.startsWith("bytes=")) return null;
  const [startRaw, endRaw] = rangeHeader.replace("bytes=", "").split("-");
  let start = Number.parseInt(startRaw, 10);
  let end = Number.parseInt(endRaw, 10);
  if (Number.isNaN(start)) {
    const suffix = Number.parseInt(endRaw, 10);
    if (Number.isNaN(suffix) || suffix <= 0) return null;
    start = Math.max(0, totalLength - suffix);
    end = totalLength - 1;
  } else {
    if (Number.isNaN(end) || end >= totalLength) end = totalLength - 1;
  }
  if (start < 0 || end < start || start >= totalLength) return null;
  return { start, end };
}

export async function mediaRoutes(app) {
  app.get(
    "/proxy",
    {
      schema: {
        tags: ["Upload"],
        summary: "Proxy media objects through backend",
        querystring: {
          type: "object",
          required: ["url"],
          additionalProperties: false,
          properties: {
            url: { type: "string", minLength: 1, maxLength: 2000 },
          },
        },
      },
    },
    async (request, reply) => {
      const { url } = request.query;
      const finalUrl = unwrapProxyUrl(url);
      const key = extractStorageKeyFromUrl(finalUrl);
      if (!key) {
        return reply.status(400).send({ error: "Invalid media URL" });
      }

      try {
        const rangeHeader = request.headers.range;
        const meta = await headObject(key);
        const totalLength = Number(meta.ContentLength || 0);
        const range = parseByteRange(rangeHeader, totalLength);

        if (range) {
          const partial = await getObjectStream(
            key,
            `bytes=${range.start}-${range.end}`,
          );
          const length = range.end - range.start + 1;
          const contentType =
            key.toLowerCase().endsWith(".mp4") &&
            partial.ContentType === "video/quicktime"
              ? "video/mp4"
              : partial.ContentType;
          if (contentType) reply.header("Content-Type", contentType);
          reply.header("Accept-Ranges", "bytes");
          reply.header(
            "Content-Range",
            `bytes ${range.start}-${range.end}/${totalLength}`,
          );
          reply.header("Content-Length", String(length));
          reply.header("Cache-Control", "public, max-age=31536000, immutable");
          return reply.status(206).send(partial.Body);
        }

        const full = await getObjectStream(key);
        const contentType =
          key.toLowerCase().endsWith(".mp4") &&
          meta.ContentType === "video/quicktime"
            ? "video/mp4"
            : meta.ContentType || full.ContentType;
        if (contentType) reply.header("Content-Type", contentType);
        if (meta.ContentLength != null) {
          reply.header("Content-Length", String(meta.ContentLength));
        }
        reply.header("Accept-Ranges", "bytes");
        reply.header("Cache-Control", "public, max-age=31536000, immutable");
        return reply.send(full.Body);
      } catch (error) {
        if (
          error?.name === "NoSuchKey" ||
          error?.$metadata?.httpStatusCode === 404
        ) {
          return reply.status(404).send({ error: "Media not found" });
        }
        throw error;
      }
    },
  );
}
