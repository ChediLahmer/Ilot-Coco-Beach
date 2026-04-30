import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

const paginatedResponse = {
  type: "object",
  properties: {
    items: { type: "array", items: { $ref: "#/components/schemas/FlashSale" } },
    total: { type: "integer" },
    page: { type: "integer" },
    totalPages: { type: "integer" },
  },
};

export async function flashSalesRoutes(app) {
  app.addSchema({
    $id: "FlashSale",
    type: "object",
    properties: {
      id: { type: "integer" },
      title: { type: "object" },
      description: { type: "object" },
      discountPercent: { type: "number" },
      image: { type: "string" },
      endsAt: { type: "string", format: "date-time" },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
    },
  });

  app.get(
    "/",
    {
      schema: {
        tags: ["Flash Sales"],
        summary: "List active flash sales (public)",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20, maximum: 50 },
          },
        },
        response: { 200: paginatedResponse },
      },
    },
    async (request) => {
      const { page, limit: rawLimit } = request.query;
      const limit = Math.min(Number(rawLimit) || 20, 50);
      const offset = ((Number(page) || 1) - 1) * limit;

      const where = { isActive: true };
      const [items, total] = await Promise.all([
        prisma.flashSale.findMany({
          where,
          orderBy: { endsAt: "asc" },
          take: limit,
          skip: offset,
        }),
        prisma.flashSale.count({ where }),
      ]);

      return {
        items,
        total,
        page: Number(page) || 1,
        totalPages: Math.ceil(total / limit),
      };
    },
  );

  app.get(
    "/all",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Flash Sales"],
        summary: "List all flash sales (admin)",
        security: [{ BearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20, maximum: 50 },
            active: { type: "string", enum: ["true", "false"] },
          },
        },
        response: { 200: paginatedResponse },
      },
    },
    async (request) => {
      const { page, limit: rawLimit, active } = request.query;
      const limit = Math.min(Number(rawLimit) || 20, 50);
      const offset = ((Number(page) || 1) - 1) * limit;

      const where = {};
      if (active !== undefined) where.isActive = active === "true";

      const [items, total] = await Promise.all([
        prisma.flashSale.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.flashSale.count({ where }),
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
        tags: ["Flash Sales"],
        summary: "Create a flash sale",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["title", "discountPercent", "endsAt"],
          properties: {
            title: { type: "object" },
            description: { type: "object" },
            discountPercent: { type: "number" },
            image: { type: "string" },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request) => {
      const { title, description, discountPercent, image, endsAt, isActive } =
        request.body;
      return prisma.flashSale.create({
        data: {
          title,
          description,
          discountPercent,
          image,
          endsAt: new Date(endsAt),
          isActive: isActive ?? true,
        },
      });
    },
  );

  app.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Flash Sales"],
        summary: "Update a flash sale",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
        body: {
          type: "object",
          properties: {
            title: { type: "object" },
            description: { type: "object" },
            discountPercent: { type: "number" },
            image: { type: "string" },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
          },
        },
      },
    },
    async (request) => {
      const data = { ...request.body };
      if (data.endsAt) data.endsAt = new Date(data.endsAt);
      return prisma.flashSale.update({
        where: { id: Number(request.params.id) },
        data,
      });
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Flash Sales"],
        summary: "Delete a flash sale",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.flashSale.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );
}
