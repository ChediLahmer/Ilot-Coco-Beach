import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";

export async function flashSalesRoutes(app) {
  app.addSchema({
    $id: "FlashSale",
    type: "object",
    properties: {
      id: { type: "integer" },
      title: { type: "object" },
      description: { type: "object" },
      discountPercent: { type: "integer" },
      image: { type: "string", nullable: true },
      endsAt: { type: "string", format: "date-time" },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
    },
  });

  app.get(
    "/",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Flash Sales"],
        summary: "List flash sales. Auth=all, public=active only. ?page for pagination.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer", maximum: 100 },
            active: { type: "string", enum: ["true", "false"] },
          },
        },
      },
    },
    async (request) => {
      const { page, limit: rawLimit, active } = request.query;
      const where = {};
      if (request.admin) {
        if (active !== undefined) where.isActive = active === "true";
      } else {
        where.isActive = true;
      }
      if (page) {
        const limit = Math.min(Number(rawLimit) || 20, 100);
        const offset = (Number(page) - 1) * limit;
        const [items, total] = await Promise.all([
          prisma.flashSale.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
          prisma.flashSale.count({ where }),
        ]);
        return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) };
      }
      return prisma.flashSale.findMany({ where, orderBy: { createdAt: "desc" } });
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
            discountPercent: { type: "integer" },
            image: { type: "string" },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request) => {
      const { title, description, discountPercent, image, endsAt, isActive } = request.body;
      return prisma.flashSale.create({
        data: { title, description: description || {}, discountPercent, image, endsAt: new Date(endsAt), isActive: isActive ?? true },
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
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          properties: {
            title: { type: "object" },
            description: { type: "object" },
            discountPercent: { type: "integer" },
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
      return prisma.flashSale.update({ where: { id: Number(request.params.id) }, data });
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
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.flashSale.delete({ where: { id: Number(request.params.id) } });
      return reply.status(204).send();
    },
  );
}
