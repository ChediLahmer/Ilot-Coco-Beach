import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import { deleteFile } from "../lib/storage.js";
import { scheduleIncomingCleanup } from "../lib/upload-cleanup.js";
import {
  ValidationError,
  validateMultilingual,
  validateIntegerId,
  validateEntityExists,
  handleValidationError,
} from "../lib/validation.js";

let publicMenuCache = null;

export function invalidateMenuCache() {
  publicMenuCache = null;
}

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
    async (request, reply) => {
      try {
        const { search, sort } = request.query;

        // Validate sort parameter against allowed values
        const allowedSorts = ["order", "name", "price"];
        if (sort && !allowedSorts.includes(sort)) {
          request.log.warn(
            { sort, allowed: allowedSorts },
            "Invalid sort parameter",
          );
          throw new ValidationError(
            "sort",
            `sort doit être parmi: ${allowedSorts.join(", ")}`,
          );
        }

        // Serve cached result for public requests with no filters
        if (!request.admin && !search && (!sort || sort === "order")) {
          if (publicMenuCache) {
            return publicMenuCache;
          }
        }

        const where = search
          ? { name: { path: ["fr"], string_contains: search } }
          : {};
        const itemWhere = request.admin
          ? {}
          : { visible: true, available: true };
        let itemOrderBy;
        switch (sort) {
          case "name":
            itemOrderBy = { order: "asc" };
            break;
          case "price":
            itemOrderBy = { priceStandard: "asc" };
            break;
          default:
            itemOrderBy = { order: "asc" };
        }
        const result = await prisma.menuCategory.findMany({
          where,
          include: { items: { where: itemWhere, orderBy: itemOrderBy } },
          orderBy: { order: "asc" },
        });

        if (!request.admin && !search && (!sort || sort === "order")) {
          publicMenuCache = result;
        }

        return result;
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const { name, order } = request.body;
        validateMultilingual(name, "name", { required: true, maxLength: 200 });

        const cat = await prisma.menuCategory.create({
          data: { name, order: order || 0 },
        });
        invalidateMenuCache();
        return reply.status(201).send(cat);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const { name, order } = request.body;
        validateMultilingual(name, "name", { required: true, maxLength: 200 });

        const categoryId = validateIntegerId(Number(request.params.id), "id");
        const category = await prisma.menuCategory.findUnique({
          where: { id: categoryId },
        });
        validateEntityExists(category, "id", "MenuCategory");

        const updated = await prisma.menuCategory.update({
          where: { id: categoryId },
          data: { name, order },
        });
        invalidateMenuCache();
        return reply.status(200).send(updated);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      const items = await prisma.menuItem.findMany({
        where: { categoryId: Number(request.params.id) },
        select: { image: true },
      });
      await prisma.menuCategory.delete({
        where: { id: Number(request.params.id) },
      });
      for (const item of items) {
        if (item.image) deleteFile(item.image).catch(() => {});
      }
      invalidateMenuCache();
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
    async (request, reply) => {
      try {
        const { categoryId, page, limit: rawLimit } = request.query;

        // Validate categoryId reference
        if (categoryId) {
          const catId = validateIntegerId(categoryId, "categoryId");
          const category = await prisma.menuCategory.findUnique({
            where: { id: catId },
          });
          if (!category) {
            request.log.warn({ categoryId: catId }, "Category not found");
            throw new ValidationError("categoryId", "Catégorie non trouvée");
          }
        }

        // Validate page >= 1
        let pageNum = 1;
        if (page) {
          pageNum = Number(page);
          if (!Number.isInteger(pageNum) || pageNum <= 0) {
            request.log.warn({ page }, "Invalid page parameter");
            throw new ValidationError(
              "page",
              "page doit être un entier positif",
            );
          }
        }

        // Validate and apply limit <= 100
        let limitNum = Number(rawLimit) || 20;
        if (!Number.isInteger(limitNum) || limitNum <= 0) {
          request.log.warn({ limit: rawLimit }, "Invalid limit parameter");
          throw new ValidationError(
            "limit",
            "limit doit être un entier positif",
          );
        }
        limitNum = Math.min(limitNum, 100);

        const where = request.admin ? {} : { visible: true, available: true };
        if (categoryId)
          where.categoryId = validateIntegerId(categoryId, "categoryId");

        if (page) {
          const limit = limitNum;
          const offset = (pageNum - 1) * limit;
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
            page: pageNum,
            totalPages: Math.ceil(total / limit),
          };
        }
        return prisma.menuItem.findMany({
          where,
          orderBy: { order: "asc" },
          take: 200,
        });
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
            priceStandard: { type: "number", minimum: 0 },
            priceExtra: { type: "number", minimum: 0 },
            available: { type: "boolean" },
            visible: { type: "boolean" },
            categoryId: { type: "integer", minimum: 1 },
            order: { type: "integer", minimum: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
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

        // Validate input
        validateMultilingual(name, "name", { required: true, maxLength: 200 });
        if (description)
          validateMultilingual(description, "description", { maxLength: 2000 });

        const validatedCategoryId = validateIntegerId(categoryId, "categoryId");
        const category = await prisma.menuCategory.findUnique({
          where: { id: validatedCategoryId },
        });
        validateEntityExists(category, "categoryId", "MenuCategory");

        const item = await prisma.menuItem.create({
          data: {
            name,
            description,
            image,
            priceStandard,
            priceExtra: priceExtra || 0,
            available: available ?? true,
            visible: visible ?? true,
            categoryId: validatedCategoryId,
            order: order || 0,
          },
        });
        invalidateMenuCache();
        scheduleIncomingCleanup(request.log, image);
        return reply.status(201).send(item);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
            priceStandard: { type: "number", minimum: 0 },
            priceExtra: { type: "number", minimum: 0 },
            available: { type: "boolean" },
            visible: { type: "boolean" },
            categoryId: { type: "integer", minimum: 1 },
            order: { type: "integer", minimum: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
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

        // Validate input
        if (name) validateMultilingual(name, "name", { maxLength: 200 });
        if (description)
          validateMultilingual(description, "description", { maxLength: 2000 });

        const itemId = validateIntegerId(Number(request.params.id), "id");
        const item = await prisma.menuItem.findUnique({
          where: { id: itemId },
        });
        validateEntityExists(item, "id", "MenuItem");

        if (categoryId) {
          const validatedCategoryId = validateIntegerId(
            categoryId,
            "categoryId",
          );
          const category = await prisma.menuCategory.findUnique({
            where: { id: validatedCategoryId },
          });
          validateEntityExists(category, "categoryId", "MenuCategory");
        }

        let oldImage = null;
        if (image !== undefined) {
          const existing = await prisma.menuItem.findUnique({
            where: { id: itemId },
            select: { image: true },
          });
          if (existing?.image && existing.image !== image) {
            oldImage = existing.image;
          }
        }

        const updated = await prisma.menuItem.update({
          where: { id: itemId },
          data: {
            ...(name && { name }),
            ...(description && { description }),
            ...(image !== undefined && { image }),
            ...(priceStandard !== undefined && { priceStandard }),
            ...(priceExtra !== undefined && { priceExtra }),
            ...(available !== undefined && { available }),
            ...(visible !== undefined && { visible }),
            ...(categoryId && { categoryId }),
            ...(order !== undefined && { order }),
          },
        });

        if (oldImage) {
          deleteFile(oldImage).catch(() => {});
        }
        invalidateMenuCache();
        scheduleIncomingCleanup(request.log, image);
        return reply.status(200).send(updated);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const id = Number(request.params.id);
        const item = await prisma.menuItem.findUnique({
          where: { id },
          select: { image: true },
        });
        if (!item) {
          return reply.status(404).send({
            error: "NOT_FOUND_ERROR",
            message: "Article du menu non trouvé",
          });
        }
        await prisma.menuItem.delete({ where: { id } });
        if (item?.image) deleteFile(item.image).catch(() => {});
        invalidateMenuCache();
        return reply.status(204).send();
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
    },
  );
}
