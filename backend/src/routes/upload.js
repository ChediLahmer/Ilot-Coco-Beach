import { authenticate } from "../lib/auth.js";
import { uploadFile } from "../lib/storage.js";

export async function uploadRoutes(app) {
  app.post(
    "/",
    {
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

      const buffer = await file.toBuffer();
      const url = await uploadFile(buffer, file.filename, file.mimetype);
      return reply.status(201).send({ url });
    },
  );
}
