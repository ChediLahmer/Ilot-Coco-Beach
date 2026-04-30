import { authenticate } from "../lib/auth.js";
import { uploadFile } from "../lib/storage.js";

export async function uploadRoutes(app) {
  app.post("/", { preHandler: authenticate }, async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: "No file uploaded" });

    const buffer = await file.toBuffer();
    const url = await uploadFile(buffer, file.filename, file.mimetype);
    return reply.status(201).send({ url });
  });
}
