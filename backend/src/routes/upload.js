import { authenticate } from "../lib/auth.js";
import {
  uploadFile,
  findExistingByHash,
  createPresignedUpload,
} from "../lib/storage.js";
import { fileTypeFromBuffer } from "file-type";
import { createHash } from "crypto";
import {
  isBrowserMimeAllowed,
  isDetectedMimeAllowed,
  isSvgBuffer,
  processMedia,
  ERROR_MSG_BROWSER,
  ERROR_MSG_CONTENT,
} from "../lib/media.js";

export async function uploadRoutes(app) {
  app.post(
    "/presign",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Upload"],
        summary: "Create a presigned video upload URL",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["filename", "contentType"],
          additionalProperties: false,
          properties: {
            filename: { type: "string", minLength: 1, maxLength: 255 },
            contentType: { type: "string", minLength: 1, maxLength: 100 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              key: { type: "string" },
              url: { type: "string" },
              publicUrl: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { filename, contentType } = request.body;
      if (!contentType?.startsWith("video/")) {
        return reply.status(400).send({
          error: "Presigned uploads are only enabled for videos.",
        });
      }
      const upload = await createPresignedUpload({ filename, contentType });
      return reply.send(upload);
    },
  );

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

      if (!isBrowserMimeAllowed(file.mimetype)) {
        return reply.status(400).send({ error: ERROR_MSG_BROWSER });
      }

      const rawBuffer = await file.toBuffer();

      let detectedMime;
      if (isSvgBuffer(file.mimetype, rawBuffer)) {
        detectedMime = "image/svg+xml";
      } else {
        const detected = await fileTypeFromBuffer(rawBuffer);
        if (!detected || !isDetectedMimeAllowed(detected.mime)) {
          return reply.status(400).send({ error: ERROR_MSG_CONTENT });
        }
        detectedMime = detected.mime;
      }

      const { buffer, mime, ext, baseName } = await processMedia(
        rawBuffer,
        detectedMime,
        file.filename,
      );

      const hash = createHash("sha256").update(buffer).digest("hex");
      const existing = await findExistingByHash(hash);
      if (existing) {
        return reply.status(201).send({ url: existing });
      }

      const finalName = ext
        ? `${baseName || file.filename.replace(/\.[^.]+$/, "")}.${ext}`
        : file.filename;
      const url = await uploadFile(buffer, finalName, mime, hash);
      return reply.status(201).send({ url });
    },
  );
}
