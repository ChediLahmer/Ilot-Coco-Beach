import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import { uploadFile, deleteFile } from "../lib/storage.js";

export async function galleryRoutes(app) {
  // ─── Gallery Categories ───────────────────────────────────────────
  app.get("/categories", async () => {
    return prisma.galleryCategory.findMany({ orderBy: { order: "asc" } });
  });

  app.post(
    "/categories",
    { preHandler: authenticate },
    async (request, reply) => {
      const { name, order } = request.body;
      const cat = await prisma.galleryCategory.create({
        data: { name, order: order ?? 0 },
      });
      return reply.status(201).send(cat);
    },
  );

  app.put("/categories/:id", { preHandler: authenticate }, async (request) => {
    const { name, order } = request.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (order !== undefined) data.order = order;
    return prisma.galleryCategory.update({
      where: { id: Number(request.params.id) },
      data,
    });
  });

  app.delete(
    "/categories/:id",
    { preHandler: authenticate },
    async (request, reply) => {
      await prisma.galleryCategory.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );

  // ─── Gallery Images ───────────────────────────────────────────────

  app.get(
    "/",
    {
      schema: {
        tags: ["Gallery"],
        summary: "List gallery images (cursor pagination)",
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", maximum: 100 },
            cursor: { type: "integer" },
            category: { type: "string" },
          },
        },
      },
    },
    async (request) => {
      const limit = Math.min(Number(request.query.limit) || 20, 100);
      const cursor = Number(request.query.cursor) || undefined;
      const category = request.query.category || undefined;
      const categoryId = Number(request.query.categoryId) || undefined;

      const where = {};
      if (category) where.category = category;
      if (categoryId) where.categoryId = categoryId;

      const images = await prisma.galleryImage.findMany({
        where,
        include: { catRef: true },
        orderBy: { order: "asc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      const hasMore = images.length > limit;
      const items = hasMore ? images.slice(0, limit) : images;
      const nextCursor = hasMore ? items[items.length - 1].id : null;
      return { items, nextCursor };
    },
  );

  app.get(
    "/count",
    {
      schema: {
        tags: ["Gallery"],
        summary: "Get total image count",
        response: {
          200: { type: "object", properties: { total: { type: "integer" } } },
        },
      },
    },
    async () => {
      const total = await prisma.galleryImage.count();
      return { total };
    },
  );

  app.post(
    "/",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gallery"],
        summary: "Upload a gallery image",
        security: [{ BearerAuth: [] }],
        consumes: ["multipart/form-data"],
      },
    },
    async (request, reply) => {
      const file = await request.file();
      if (!file) return reply.status(400).send({ error: "No file uploaded" });
      const buffer = await file.toBuffer();
      const url = await uploadFile(buffer, file.filename, file.mimetype);
      const category = file.fields?.category?.value || null;
      const categoryId = file.fields?.categoryId?.value
        ? Number(file.fields.categoryId.value)
        : null;
      const image = await prisma.galleryImage.create({
        data: { url, alt: file.filename, category, categoryId, order: 0 },
        include: { catRef: true },
      });
      return reply.status(201).send(image);
    },
  );

  app.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gallery"],
        summary: "Update a gallery image",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          properties: {
            order: { type: "integer" },
            alt: { type: "string" },
            category: { type: "string" },
          },
        },
      },
    },
    async (request) => {
      const { order, alt, category, categoryId } = request.body;
      const data = {};
      if (order !== undefined) data.order = order;
      if (alt !== undefined) data.alt = alt;
      if (category !== undefined) data.category = category;
      if (categoryId !== undefined) data.categoryId = categoryId;
      return prisma.galleryImage.update({
        where: { id: Number(request.params.id) },
        data,
        include: { catRef: true },
      });
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gallery"],
        summary: "Delete a gallery image",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      const image = await prisma.galleryImage.findUnique({
        where: { id: Number(request.params.id) },
      });
      if (image) {
        await deleteFile(image.url);
        await prisma.galleryImage.delete({ where: { id: image.id } });
      }
      return reply.status(204).send();
    },
  );
}
