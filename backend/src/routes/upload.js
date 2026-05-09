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
      ];
      const allowedVideos = ["video/mp4", "video/webm"];
      const allowed = [...allowedImages, ...allowedVideos];
      const allowedBrowser = [...allowed, "application/octet-stream"];
      if (!allowedBrowser.includes(file.mimetype)) {
        return reply.status(400).send({
          error: `Type de fichier non supporté (${file.mimetype}). Formats acceptés : JPEG, PNG, WebP, GIF, AVIF, MP4, WebM.`,
        });
      }

      const buffer = await file.toBuffer();

      const detected = await fileTypeFromBuffer(buffer);
      if (!detected || !allowed.includes(detected.mime)) {
        const detectedType = detected?.mime || "inconnu";
        return reply.status(400).send({
          error: `Le contenu du fichier (${detectedType}) ne correspond pas à un format supporté. Formats acceptés : JPEG, PNG, WebP, GIF, AVIF, MP4, WebM.`,
        });
      }
      const detectedMime = detected.mime;

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
