import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import { uploadFile, deleteFile } from "../lib/storage.js";

export async function galleryRoutes(app) {
  // Public: list gallery images (paginated)
  app.get("/", async (request) => {
    const limit = Math.min(Number(request.query.limit) || 20, 50);
    const cursor = Number(request.query.cursor) || undefined;
    const category = request.query.category || undefined;

    const where = category ? { category } : {};
    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { order: "asc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = images.length > limit;
    const items = hasMore ? images.slice(0, limit) : images;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor };
  });

  // Public: count (for dashboard)
  app.get("/count", async () => {
    const total = await prisma.galleryImage.count();
    return { total };
  });

  // Admin: upload image
  app.post("/", { preHandler: authenticate }, async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: "No file uploaded" });

    const buffer = await file.toBuffer();
    const url = await uploadFile(buffer, file.filename, file.mimetype);
    const category = file.fields?.category?.value || null;
    const image = await prisma.galleryImage.create({
      data: { url, alt: file.filename, category, order: 0 },
    });
    return reply.status(201).send(image);
  });

  // Admin: reorder / update
  app.put("/:id", { preHandler: authenticate }, async (request) => {
    const { order, alt, category } = request.body;
    const data = {};
    if (order !== undefined) data.order = order;
    if (alt !== undefined) data.alt = alt;
    if (category !== undefined) data.category = category;
    return prisma.galleryImage.update({
      where: { id: Number(request.params.id) },
      data,
    });
  });

  // Admin: delete image
  app.delete("/:id", { preHandler: authenticate }, async (request, reply) => {
    const image = await prisma.galleryImage.findUnique({
      where: { id: Number(request.params.id) },
    });
    if (image) {
      await deleteFile(image.url);
      await prisma.galleryImage.delete({ where: { id: image.id } });
    }
    return reply.status(204).send();
  });
}
