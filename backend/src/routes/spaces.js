import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import { deleteFile } from "../lib/storage.js";
import { scheduleIncomingCleanup } from "../lib/upload-cleanup.js";

export async function spacesRoutes(app) {
  app.addSchema({
    $id: "Space",
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "object" },
      description: { type: "object" },
      image: { type: "string", nullable: true },
      price: { type: "number" },
      capacity: { type: "integer" },
      order: { type: "integer" },
      available: { type: "boolean" },
      visible: { type: "boolean" },
    },
  });

  app.get(
    "/",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Spaces"],
        summary:
          "List spaces. Auth=all, public=available only. Supports search, sort, pagination.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer", maximum: 100 },
            available: { type: "string", enum: ["true", "false"] },
            search: { type: "string" },
            sort: {
              type: "string",
              enum: ["order", "name", "price", "capacity"],
            },
          },
        },
      },
    },
    async (request) => {
      const { page, limit: rawLimit, available, search, sort } = request.query;
      const where = {};
      if (request.admin) {
        if (available !== undefined) where.available = available === "true";
      } else {
        where.visible = true;
      }
      if (search) {
        where.name = { path: ["fr"], string_contains: search };
      }
      let orderBy;
      switch (sort) {
        case "name":
          orderBy = [{ order: "asc" }, { id: "asc" }];
          break;
        case "price":
          orderBy = [{ price: "asc" }, { id: "asc" }];
          break;
        case "capacity":
          orderBy = [{ capacity: "desc" }, { id: "asc" }];
          break;
        default:
          orderBy = [{ order: "asc" }, { id: "asc" }];
      }
      const limit = Math.min(Number(rawLimit) || 20, 100);
      const offset = page ? (Number(page) - 1) * limit : 0;
      const [items, total] = await Promise.all([
        prisma.space.findMany({ where, orderBy, take: limit, skip: offset }),
        prisma.space.count({ where }),
      ]);
      return {
        items,
        total,
        page: Number(page) || 1,
        totalPages: Math.ceil(total / limit),
      };
    },
  );

  app.post(
    "/",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Spaces"],
        summary: "Create a space",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "price", "capacity"],
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
            description: {
              type: "object",
              properties: {
                fr: { type: "string", maxLength: 2000 },
                en: { type: "string", maxLength: 2000 },
                ar: { type: "string", maxLength: 2000 },
              },
              additionalProperties: false,
            },
            image: { type: "string", maxLength: 500 },
            price: { type: "number", minimum: 0 },
            capacity: { type: "integer", minimum: 1 },
            order: { type: "integer", minimum: 0 },
            available: { type: "boolean", default: true },
            visible: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        name,
        description,
        image,
        price,
        capacity,
        order,
        available,
        visible,
      } = request.body;
      const space = await prisma.space.create({
        data: {
          name,
          description,
          image,
          price,
          capacity,
          order: order || 0,
          available: available ?? true,
          visible: visible ?? true,
        },
      });
      scheduleIncomingCleanup(request.log, image);
      return reply.status(201).send(space);
    },
  );

  app.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Spaces"],
        summary: "Update a space",
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
            description: {
              type: "object",
              properties: {
                fr: { type: "string", maxLength: 2000 },
                en: { type: "string", maxLength: 2000 },
                ar: { type: "string", maxLength: 2000 },
              },
              additionalProperties: false,
            },
            image: { type: "string", nullable: true, maxLength: 500 },
            price: { type: "number", minimum: 0 },
            capacity: { type: "integer", minimum: 1 },
            order: { type: "integer", minimum: 0 },
            available: { type: "boolean" },
            visible: { type: "boolean" },
          },
        },
      },
    },
    async (request) => {
      const {
        name,
        description,
        image,
        price,
        capacity,
        order,
        available,
        visible,
      } = request.body;
      const spaceId = Number(request.params.id);
      let oldImage = null;
      if (image !== undefined) {
        const existing = await prisma.space.findUnique({
          where: { id: spaceId },
          select: { image: true },
        });
        if (existing?.image && existing.image !== image) {
          oldImage = existing.image;
        }
      }
      return prisma.space
        .update({
          where: { id: spaceId },
          data: {
            name,
            description,
            image,
            price,
            capacity,
            order,
            available,
            visible,
          },
        })
        .then((space) => {
          if (oldImage) {
            deleteFile(oldImage).catch(() => {});
          }
          scheduleIncomingCleanup(request.log, image);
          return space;
        });
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Spaces"],
        summary: "Delete a space",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      try {
        const id = Number(request.params.id);
        const space = await prisma.space.findUnique({
          where: { id },
          select: { image: true },
        });
        if (!space) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Space not found",
          });
        }
        await prisma.space.delete({ where: { id } });
        if (space?.image) deleteFile(space.image).catch(() => {});
        return reply.status(204).send();
      } catch (error) {
        request.log.error(error, "Error deleting space");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to delete space",
        });
      }
    },
  );
}
