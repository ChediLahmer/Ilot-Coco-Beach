import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";

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
    },
  });

  app.get(
    "/",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Spaces"],
        summary: "List spaces. Auth=all, public=available only. ?page for pagination.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer", maximum: 100 },
            available: { type: "string", enum: ["true", "false"] },
          },
        },
      },
    },
    async (request) => {
      const { page, limit: rawLimit, available } = request.query;
      const where = {};
      if (request.admin) {
        if (available !== undefined) where.available = available === "true";
      } else {
        where.available = true;
      }
      if (page) {
        const limit = Math.min(Number(rawLimit) || 20, 100);
        const offset = (Number(page) - 1) * limit;
        const [items, total] = await Promise.all([
          prisma.space.findMany({ where, orderBy: { order: "asc" }, take: limit, skip: offset }),
          prisma.space.count({ where }),
        ]);
        return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) };
      }
      return prisma.space.findMany({ where, orderBy: { order: "asc" } });
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
          required: ["name"],
          properties: {
            name: { type: "object" },
            description: { type: "object" },
            image: { type: "string" },
            price: { type: "number" },
            capacity: { type: "integer" },
            order: { type: "integer" },
            available: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request) => {
      const { name, description, image, price, capacity, order, available } = request.body;
      return prisma.space.create({
        data: { name, description, image, price, capacity, order: order || 0, available: available ?? true },
      });
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
          properties: {
            name: { type: "object" },
            description: { type: "object" },
            image: { type: "string" },
            price: { type: "number" },
            capacity: { type: "integer" },
            order: { type: "integer" },
            available: { type: "boolean" },
          },
        },
      },
    },
    async (request) => {
      return prisma.space.update({ where: { id: Number(request.params.id) }, data: request.body });
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
      await prisma.space.delete({ where: { id: Number(request.params.id) } });
      return reply.status(204).send();
    },
  );
}
