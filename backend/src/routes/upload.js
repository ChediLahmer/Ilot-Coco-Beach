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

      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-m4v",
      ];
      const allowedBrowser = [...allowed, "application/octet-stream"];
      if (!allowedBrowser.includes(file.mimetype)) {
        return reply.status(400).send({ error: "File type not allowed" });
      }

      const buffer = await file.toBuffer();

      const detected = await fileTypeFromBuffer(buffer);
      if (!detected || !allowed.includes(detected.mime)) {
        return reply
          .status(400)
          .send({ error: "File content does not match an allowed type" });
      }

      const hash = createHash("sha256").update(buffer).digest("hex");
      const existing = await findExistingByHash(hash);
      if (existing) {
        return reply.status(201).send({ url: existing });
      }

      const url = await uploadFile(buffer, file.filename, detected.mime, hash);
      return reply.status(201).send({ url });
    },
  );
}
