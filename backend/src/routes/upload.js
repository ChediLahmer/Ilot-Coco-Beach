import { authenticate } from "../lib/auth.js";
import { uploadFile, findExistingByHash } from "../lib/storage.js";
import { fileTypeFromBuffer } from "file-type";
import { createHash } from "crypto";

export async function uploadRoutes(app) {
  app.post(
    "/",
    {
      bodyLimit: 50 * 1024 * 1024,
      preHandler: authenticate,
      schema: {
        tags: ["Upload"],
        summary: "Upload a file to S3/MinIO",
        security: [{ BearerAuth: [] }],
        consumes: ["multipart/form-data"],
        response: {
          201: {
            type: "object",
            properties: { url: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const file = await request.file();
      if (!file) return reply.status(400).send({ error: "No file uploaded" });

      const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
        "image/heic",
        "image/heif",
        "image/tiff",
        "image/bmp",
        "image/svg+xml",
      ];
      const allowedVideos = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-m4v",
        "video/x-msvideo",
        "video/x-matroska",
        "video/3gpp",
        "video/ogg",
      ];
      const allowed = [...allowedImages, ...allowedVideos];
      const allowedBrowser = [...allowed, "application/octet-stream"];
      if (!allowedBrowser.includes(file.mimetype)) {
        return reply.status(400).send({
          error: `Type de fichier non supporté (${file.mimetype}). Formats acceptés : JPEG, PNG, WebP, GIF, AVIF, HEIC, TIFF, BMP, SVG, MP4, WebM, MOV, AVI, MKV, 3GP.`,
        });
      }

      const buffer = await file.toBuffer();

      // SVG is text-based, file-type can't detect it
      const isSvg =
        file.mimetype === "image/svg+xml" &&
        buffer.length < 1_000_000 &&
        buffer
          .toString("utf8", 0, Math.min(buffer.length, 500))
          .includes("<svg");

      let detectedMime;
      if (isSvg) {
        detectedMime = "image/svg+xml";
      } else {
        const detected = await fileTypeFromBuffer(buffer);
        if (!detected || !allowed.includes(detected.mime)) {
          const detectedType = detected?.mime || "inconnu";
          return reply
            .status(400)
            .send({
              error: `Le contenu du fichier (${detectedType}) ne correspond pas à un format supporté. Formats acceptés : JPEG, PNG, WebP, GIF, AVIF, HEIC, TIFF, BMP, MP4, WebM, MOV, AVI, MKV, 3GP.`,
            });
        }
        detectedMime = detected.mime;
      }

      const hash = createHash("sha256").update(buffer).digest("hex");
      const existing = await findExistingByHash(hash);
      if (existing) {
        return reply.status(201).send({ url: existing });
      }

      const url = await uploadFile(buffer, file.filename, detectedMime, hash);
      return reply.status(201).send({ url });
    },
  );
}
