import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

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
      priceExtra: { type: "number", nullable: true },
      available: { type: "boolean" },
      categoryId: { type: "integer" },
      order: { type: "integer" },
    },
  });

  app.get(
    "/categories",
    {
      schema: {
        tags: ["Menu"],
        summary: "List categories with available items (public)",
        response: {
          200: {
            type: "array",
            items: { $ref: "#/components/schemas/MenuCategory" },
          },
        },
      },
    },
    async () => {
      return prisma.menuCategory.findMany({
        include: {
          items: { where: { available: true }, orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      });
    },
  );

  app.get(
    "/categories/all",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Menu"],
        summary: "List all categories (admin)",
        security: [{ BearerAuth: [] }],
        querystring: {
          type: "object",
          properties: { search: { type: "string" } },
        },
        response: {
          200: {
            type: "array",
            items: { $ref: "#/components/schemas/MenuCategory" },
          },
        },
      },
    },
    async (request) => {
      const { search } = request.query;
      const where = search
        ? { name: { path: ["fr"], string_contains: search } }
        : {};
      return prisma.menuCategory.findMany({
        where,
        include: {
          items: { orderBy: { order: "asc" } },
        },
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
          properties: {
            name: { type: "object" },
            order: { type: "integer" },
          },
        },
      },
    },
    async (request) => {
      const { name, order } = request.body;
      return prisma.menuCategory.create({
        data: { name, order: order || 0 },
      });
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
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "object" },
            order: { type: "integer" },
          },
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
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
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

  app.get(
    "/items",
    {
      schema: {
        tags: ["Menu"],
        summary: "List menu items (paginated, public)",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20, maximum: 50 },
            categoryId: { type: "integer" },
            search: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/MenuItem" },
              },
              total: { type: "integer" },
              page: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
    },
    async (request) => {
      const { categoryId, search, page, limit: rawLimit } = request.query;
      const limit = Math.min(Number(rawLimit) || 20, 50);
      const offset = ((Number(page) || 1) - 1) * limit;

      const where = { available: true };
      if (categoryId) where.categoryId = Number(categoryId);

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
        page: Number(page) || 1,
        totalPages: Math.ceil(total / limit),
      };
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
        categoryId,
        order,
      } = request.body;
      return prisma.menuItem.create({
        data: {
          name,
          description,
          image,
          priceStandard,
          priceExtra,
          available,
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
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "object" },
            description: { type: "object" },
            image: { type: "string" },
            priceStandard: { type: "number" },
            priceExtra: { type: "number" },
            available: { type: "boolean" },
            categoryId: { type: "integer" },
            order: { type: "integer" },
          },
        },
      },
    },
    async (request) => {
      const data = request.body;
      return prisma.menuItem.update({
        where: { id: Number(request.params.id) },
        data,
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
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
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
