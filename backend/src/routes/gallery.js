import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import { uploadFile, deleteFile } from "../lib/storage.js";
import { fileTypeFromBuffer } from "file-type";

export async function galleryRoutes(app) {
  // ─── Gallery Categories ───────────────────────────────────────────
  app.get("/categories", async () => {
    return prisma.galleryCategory.findMany({ orderBy: { order: "asc" } });
  });

  app.post(
    "/categories",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gallery"],
        summary: "Create a gallery category",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          additionalProperties: false,
          properties: {
            name: {
              type: "object",
              required: ["fr"],
              properties: {
                fr: { type: "string", minLength: 1, maxLength: 200 },
                en: { type: "string", maxLength: 200 },
                ar: { type: "string", maxLength: 200 },
              },
              additionalProperties: false,
            },
            order: { type: "integer", minimum: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, order } = request.body;
      const cat = await prisma.galleryCategory.create({
        data: { name, order: order ?? 0 },
      });
      return reply.status(201).send(cat);
    },
  );

  app.put(
    "/categories/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gallery"],
        summary: "Update a gallery category",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              type: "object",
              required: ["fr"],
              properties: {
                fr: { type: "string", minLength: 1, maxLength: 200 },
                en: { type: "string", maxLength: 200 },
                ar: { type: "string", maxLength: 200 },
              },
              additionalProperties: false,
            },
            order: { type: "integer", minimum: 0 },
          },
        },
      },
    },
    async (request) => {
      const { name, order } = request.body;
      const data = {};
      if (name !== undefined) data.name = name;
      if (order !== undefined) data.order = order;
      return prisma.galleryCategory.update({
        where: { id: Number(request.params.id) },
        data,
      });
    },
  );

  app.delete(
    "/categories/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Gallery"],
        summary: "Delete a gallery category",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
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
      preHandler: optionalAuth,
      schema: {
        tags: ["Gallery"],
        summary: "List gallery images (cursor pagination)",
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", maximum: 100 },
            cursor: { type: "integer" },
            category: { type: "string" },
            categoryId: { type: "integer" },
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
      if (!request.admin) where.visible = true;

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
      preHandler: optionalAuth,
      schema: {
        tags: ["Gallery"],
        summary: "Get total image count",
        response: {
          200: { type: "object", properties: { total: { type: "integer" } } },
        },
      },
    },
    async (request) => {
      const where = request.admin ? {} : { visible: true };
      const total = await prisma.galleryImage.count({ where });
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

      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm",
      ];
      if (!allowed.includes(file.mimetype)) {
        return reply.status(400).send({ error: "File type not allowed" });
      }

      const buffer = await file.toBuffer();

      const detected = await fileTypeFromBuffer(buffer);
      if (!detected || !allowed.includes(detected.mime)) {
        return reply
          .status(400)
          .send({ error: "File content does not match an allowed type" });
      }

      const url = await uploadFile(buffer, file.filename, detected.mime);
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
          additionalProperties: false,
          properties: {
            order: { type: "integer", minimum: 0 },
            alt: { type: "string", maxLength: 500 },
            category: { type: "string", maxLength: 200 },
            categoryId: { type: "integer", nullable: true },
            visible: { type: "boolean" },
          },
        },
      },
    },
    async (request) => {
      const { order, alt, category, categoryId, visible } = request.body;
      const data = {};
      if (order !== undefined) data.order = order;
      if (alt !== undefined) data.alt = alt;
      if (category !== undefined) data.category = category;
      if (categoryId !== undefined) data.categoryId = categoryId;
      if (visible !== undefined) data.visible = visible;
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
        await prisma.galleryImage.delete({ where: { id: image.id } });
        deleteFile(image.url).catch((err) =>
          request.log.error(err, "Failed to delete S3 file"),
        );
      }
      return reply.status(204).send();
    },
  );
}
