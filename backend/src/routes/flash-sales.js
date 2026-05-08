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
      visible: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
    },
  });

  app.get(
    "/",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Flash Sales"],
        summary:
          "List flash sales. Auth=all, public=active only. Supports search, sort, pagination.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer", maximum: 100 },
            active: { type: "string", enum: ["true", "false"] },
            search: { type: "string" },
            sort: { type: "string", enum: ["date", "title", "discount"] },
          },
        },
      },
    },
    async (request) => {
      const { page, limit: rawLimit, active, search, sort } = request.query;
      const where = {};
      if (request.admin) {
        if (active !== undefined) where.isActive = active === "true";
      } else {
        where.visible = true;
      }
      if (search) {
        where.title = { path: ["fr"], string_contains: search };
      }
      let orderBy;
      switch (sort) {
        case "title":
          orderBy = [{ title: "asc" }, { id: "asc" }];
          break;
        case "discount":
          orderBy = [{ discountPercent: "desc" }, { id: "asc" }];
          break;
        default:
          orderBy = [{ createdAt: "desc" }, { id: "asc" }];
      }
      const limit = Math.min(Number(rawLimit) || 20, 100);
      const offset = page ? (Number(page) - 1) * limit : 0;
      const [items, total] = await Promise.all([
        prisma.flashSale.findMany({
          where,
          orderBy,
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
            discountPercent: { type: "integer", minimum: 0, maximum: 100 },
            image: { type: "string" },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
            visible: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request) => {
      const {
        title,
        description,
        discountPercent,
        image,
        endsAt,
        isActive,
        visible,
      } = request.body;
      return prisma.flashSale.create({
        data: {
          title,
          description: description || {},
          discountPercent,
          image,
          endsAt: new Date(endsAt),
          isActive: isActive ?? true,
          visible: visible ?? true,
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
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          properties: {
            title: { type: "object" },
            description: { type: "object" },
            discountPercent: { type: "integer", minimum: 0, maximum: 100 },
            image: { type: "string", nullable: true },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
            visible: { type: "boolean" },
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
        params: { type: "object", properties: { id: { type: "integer" } } },
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
