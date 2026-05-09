import { extractStorageKeyFromUrl, getObjectStream } from "../lib/storage.js";

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
      const key = extractStorageKeyFromUrl(url);
      if (!key) {
        return reply.status(400).send({ error: "Invalid media URL" });
      }

      try {
        const obj = await getObjectStream(key);
        if (obj.ContentType) reply.header("Content-Type", obj.ContentType);
        if (obj.ContentLength != null) {
          reply.header("Content-Length", String(obj.ContentLength));
        }
        reply.header("Cache-Control", "public, max-age=31536000, immutable");
        return reply.send(obj.Body);
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
