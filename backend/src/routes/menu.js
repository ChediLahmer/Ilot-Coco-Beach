import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";

export async function menuRoutes(app) {
  app.addSchema({
    $id: "MenuCategory",
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "object" },
      order: { type: "integer" },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/MenuItem" },
      },
    },
  });

  app.addSchema({
    $id: "MenuItem",
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "object" },
      description: { type: "object" },
      image: { type: "string", nullable: true },
      priceStandard: { type: "number" },
      priceExtra: { type: "number" },
      available: { type: "boolean" },
      visible: { type: "boolean" },
      categoryId: { type: "integer" },
      order: { type: "integer" },
    },
  });

  // GET /categories — auth=all items visible, public=available items only
  app.get(
    "/categories",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Menu"],
        summary:
          "List categories with items. Auth=all, public=available items only. Supports search, sort.",
        querystring: {
          type: "object",
          properties: {
            search: { type: "string" },
            sort: { type: "string", enum: ["order", "name", "price"] },
          },
        },
      },
    },
    async (request) => {
      const { search, sort } = request.query;
      const where = search
        ? { name: { path: ["fr"], string_contains: search } }
        : {};
      const itemWhere = request.admin ? {} : { visible: true };
      let itemOrderBy;
      switch (sort) {
        case "name":
          itemOrderBy = { name: "asc" };
          break;
        case "price":
          itemOrderBy = { priceStandard: "asc" };
          break;
        default:
          itemOrderBy = { order: "asc" };
      }
      return prisma.menuCategory.findMany({
        where,
        include: { items: { where: itemWhere, orderBy: itemOrderBy } },
        orderBy: { order: "asc" },
      });
    },
  );

  app.post(
    "/categories",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "Create a category",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: { name: { type: "object" }, order: { type: "integer" } },
        },
      },
    },
    async (request) => {
      const { name, order } = request.body;
      return prisma.menuCategory.create({ data: { name, order: order || 0 } });
    },
  );

  app.put(
    "/categories/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "Update a category",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          properties: { name: { type: "object" }, order: { type: "integer" } },
        },
      },
    },
    async (request) => {
      const { name, order } = request.body;
      return prisma.menuCategory.update({
        where: { id: Number(request.params.id) },
        data: { name, order },
      });
    },
  );

  app.delete(
    "/categories/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "Delete a category",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.menuCategory.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );

  // GET /items — same pattern, ?page for pagination
  app.get(
    "/items",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Menu"],
        summary:
          "List menu items. Auth=all, public=available only. ?page for pagination.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer", maximum: 100 },
            categoryId: { type: "integer" },
          },
        },
      },
    },
    async (request) => {
      const { categoryId, page, limit: rawLimit } = request.query;
      const where = request.admin ? {} : { visible: true };
      if (categoryId) where.categoryId = Number(categoryId);

      if (page) {
        const limit = Math.min(Number(rawLimit) || 20, 100);
        const offset = (Number(page) - 1) * limit;
        const [items, total] = await Promise.all([
          prisma.menuItem.findMany({
            where,
            orderBy: { order: "asc" },
            take: limit,
            skip: offset,
          }),
          prisma.menuItem.count({ where }),
        ]);
        return {
          items,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / limit),
        };
      }
      return prisma.menuItem.findMany({ where, orderBy: { order: "asc" } });
    },
  );

  app.post(
    "/items",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "Create a menu item",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "categoryId", "priceStandard"],
          properties: {
            name: { type: "object" },
            description: { type: "object" },
            image: { type: "string" },
            priceStandard: { type: "number" },
            priceExtra: { type: "number" },
            available: { type: "boolean" },
            visible: { type: "boolean" },
            categoryId: { type: "integer" },
            order: { type: "integer" },
          },
        },
      },
    },
    async (request) => {
      const {
        name,
        description,
        image,
        priceStandard,
        priceExtra,
        available,
        visible,
        categoryId,
        order,
      } = request.body;
      return prisma.menuItem.create({
        data: {
          name,
          description,
          image,
          priceStandard,
          priceExtra: priceExtra || 0,
          available,
          visible: visible ?? true,
          categoryId,
          order: order || 0,
        },
      });
    },
  );

  app.put(
    "/items/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "Update a menu item",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          properties: {
            name: { type: "object" },
            description: { type: "object" },
            image: { type: "string", nullable: true },
            priceStandard: { type: "number" },
            priceExtra: { type: "number" },
            available: { type: "boolean" },
            visible: { type: "boolean" },
            categoryId: { type: "integer" },
            order: { type: "integer" },
          },
        },
      },
    },
    async (request) => {
      const {
        name,
        description,
        image,
        priceStandard,
        priceExtra,
        available,
        visible,
        categoryId,
        order,
      } = request.body;
      return prisma.menuItem.update({
        where: { id: Number(request.params.id) },
        data: {
          name,
          description,
          image,
          priceStandard,
          priceExtra,
          available,
          visible,
          categoryId,
          order,
        },
      });
    },
  );

  app.delete(
    "/items/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "Delete a menu item",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.menuItem.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );
}
