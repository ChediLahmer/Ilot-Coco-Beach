import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import { deleteFile } from "../lib/storage.js";

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
        where.isActive = true;
        where.endsAt = { gte: new Date() };
      }
      if (search) {
        where.title = { path: ["fr"], string_contains: search };
      }
      let orderBy;
      switch (sort) {
        case "title":
          orderBy = [{ createdAt: "asc" }, { id: "asc" }];
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
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                priceStandard: true,
                priceExtra: true,
              },
            },
            space: { select: { id: true, name: true, price: true } },
          },
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
          additionalProperties: false,
          properties: {
            title: {
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
            discountPercent: { type: "integer", minimum: 0, maximum: 100 },
            image: { type: "string", maxLength: 500 },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
            visible: { type: "boolean", default: true },
            menuItemId: { type: "integer", nullable: true },
            spaceId: { type: "integer", nullable: true },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        title,
        description,
        discountPercent,
        image,
        endsAt,
        isActive,
        visible,
        menuItemId,
        spaceId,
      } = request.body;
      const sale = await prisma.flashSale.create({
        data: {
          title,
          description: description || {},
          discountPercent,
          image,
          endsAt: new Date(endsAt),
          isActive: isActive ?? true,
          visible: visible ?? true,
          menuItemId: menuItemId || null,
          spaceId: spaceId || null,
        },
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              priceStandard: true,
              priceExtra: true,
            },
          },
          space: { select: { id: true, name: true, price: true } },
        },
      });
      return reply.status(201).send(sale);
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
          additionalProperties: false,
          properties: {
            title: {
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
            discountPercent: { type: "integer", minimum: 0, maximum: 100 },
            image: { type: "string", nullable: true, maxLength: 500 },
            endsAt: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
            visible: { type: "boolean" },
            menuItemId: { type: "integer", nullable: true },
            spaceId: { type: "integer", nullable: true },
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
        menuItemId,
        spaceId,
      } = request.body;
      if (image !== undefined) {
        const existing = await prisma.flashSale.findUnique({
          where: { id: Number(request.params.id) },
          select: { image: true },
        });
        if (existing?.image && existing.image !== image) {
          deleteFile(existing.image).catch(() => {});
        }
      }
      const data = {
        title,
        description,
        discountPercent,
        image,
        isActive,
        visible,
      };
      if (endsAt) data.endsAt = new Date(endsAt);
      if (menuItemId !== undefined) data.menuItemId = menuItemId || null;
      if (spaceId !== undefined) data.spaceId = spaceId || null;
      return prisma.flashSale.update({
        where: { id: Number(request.params.id) },
        data,
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              priceStandard: true,
              priceExtra: true,
            },
          },
          space: { select: { id: true, name: true, price: true } },
        },
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
      const sale = await prisma.flashSale.findUnique({
        where: { id: Number(request.params.id) },
        select: { image: true },
      });
      await prisma.flashSale.delete({
        where: { id: Number(request.params.id) },
      });
      if (sale?.image) deleteFile(sale.image).catch(() => {});
      return reply.status(204).send();
    },
  );
}
