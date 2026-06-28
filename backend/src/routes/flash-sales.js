import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import { deleteFile, isIncomingUrl } from "../lib/storage.js";
import { scheduleIncomingCleanup } from "../lib/upload-cleanup.js";
import { rescheduleExpiryDeactivation } from "../lib/scheduler.js";
import {
  ValidationError,
  validateDateTime,
  validateDiscount,
  validateMultilingual,
  validateIntegerId,
  validateEntityExists,
  handleValidationError,
} from "../lib/validation.js";

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
    async (request, reply) => {
      try {
        const { page, limit: rawLimit, active, search, sort } = request.query;

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

        // Validate limit <= 100
        let limitNum = Number(rawLimit) || 20;
        if (!Number.isInteger(limitNum) || limitNum <= 0) {
          request.log.warn({ limit: rawLimit }, "Invalid limit parameter");
          throw new ValidationError(
            "limit",
            "limit doit être un entier positif",
          );
        }
        limitNum = Math.min(limitNum, 100);

        // Validate active filter is in allowed list
        if (active && !["true", "false"].includes(active)) {
          request.log.warn({ active }, "Invalid active filter");
          throw new ValidationError("active", "active doit être true ou false");
        }

        // Validate sort is in allowed list
        const allowedSorts = ["date", "title", "discount"];
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
        const limit = limitNum;
        const offset = (pageNum - 1) * limit;
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
        const safeItems = request.admin
          ? items
          : items.map((s) =>
              isIncomingUrl(s.image) ? { ...s, image: null } : s,
            );
        return {
          items: safeItems,
          total,
          page: pageNum,
          totalPages: Math.ceil(total / limit),
        };
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
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

        // Business logic validation
        validateMultilingual(title, "title", {
          required: true,
          maxLength: 200,
        });
        if (description) {
          validateMultilingual(description, "description", { maxLength: 2000 });
        }
        const validatedDiscount = validateDiscount(discountPercent);
        const validatedEndsAt = validateDateTime(endsAt, "endsAt", {
          mustBeFuture: true,
        });
        const validatedMenuItemId = validateIntegerId(menuItemId, "menuItemId");
        const validatedSpaceId = validateIntegerId(spaceId, "spaceId");

        // Validate references exist
        if (validatedMenuItemId) {
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: validatedMenuItemId },
          });
          validateEntityExists(menuItem, "menuItemId", "MenuItem");
        }

        if (validatedSpaceId) {
          const space = await prisma.space.findUnique({
            where: { id: validatedSpaceId },
          });
          validateEntityExists(space, "spaceId", "Space");
        }

        // Cannot target both
        if (validatedMenuItemId && validatedSpaceId) {
          throw new Error("Cannot target both menuItem and space");
        }

        const sale = await prisma.flashSale.create({
          data: {
            title,
            description: description || {},
            discountPercent: validatedDiscount,
            image,
            endsAt: validatedEndsAt,
            isActive: isActive ?? true,
            visible: visible ?? true,
            menuItemId: validatedMenuItemId || null,
            spaceId: validatedSpaceId || null,
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
        scheduleIncomingCleanup(request.log, image);
        await rescheduleExpiryDeactivation(request.log);
        return reply.status(201).send(sale);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
    async (request, reply) => {
      try {
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

        // Validate ID
        const saleId = validateIntegerId(Number(request.params.id), "id");
        const existing = await prisma.flashSale.findUnique({
          where: { id: saleId },
        });
        if (!existing) {
          request.log.warn({ id: saleId }, "Flash sale not found");
          throw new ValidationError("id", "Flash sale non trouvé(e)");
        }

        // Validate inputs if provided
        if (title) validateMultilingual(title, "title", { maxLength: 200 });
        if (description)
          validateMultilingual(description, "description", { maxLength: 2000 });
        if (discountPercent !== undefined) validateDiscount(discountPercent);
        if (endsAt) validateDateTime(endsAt, "endsAt", { mustBeFuture: true });

        // Validate foreign key references if provided
        if (menuItemId !== undefined && menuItemId !== null) {
          const validatedMenuItemId = validateIntegerId(
            menuItemId,
            "menuItemId",
          );
          const menuItem = await prisma.menuItem.findUnique({
            where: { id: validatedMenuItemId },
          });
          if (!menuItem) {
            request.log.warn({ id: validatedMenuItemId }, "MenuItem not found");
            throw new ValidationError("menuItemId", "Article non trouvé(e)");
          }
        }

        if (spaceId !== undefined && spaceId !== null) {
          const validatedSpaceId = validateIntegerId(spaceId, "spaceId");
          const space = await prisma.space.findUnique({
            where: { id: validatedSpaceId },
          });
          if (!space) {
            request.log.warn({ id: validatedSpaceId }, "Space not found");
            throw new ValidationError("spaceId", "Espace non trouvé(e)");
          }
        }

        // Cannot target both
        if (menuItemId && spaceId) {
          throw new ValidationError(
            "target",
            "Une flash sale ne peut cibler qu'un article ou un espace, pas les deux",
          );
        }

        let oldImage = null;
        if (image !== undefined) {
          const curr = await prisma.flashSale.findUnique({
            where: { id: saleId },
            select: { image: true },
          });
          if (curr?.image && curr.image !== image) {
            oldImage = curr.image;
          }
        }

        const data = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (discountPercent !== undefined)
          data.discountPercent = discountPercent;
        if (image !== undefined) data.image = image;
        if (isActive !== undefined) data.isActive = isActive;
        if (visible !== undefined) data.visible = visible;
        if (endsAt) data.endsAt = new Date(endsAt);
        if (menuItemId !== undefined) data.menuItemId = menuItemId || null;
        if (spaceId !== undefined) data.spaceId = spaceId || null;

        const updated = await prisma.flashSale.update({
          where: { id: saleId },
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

        if (oldImage) {
          deleteFile(oldImage).catch(() => {});
        }
        scheduleIncomingCleanup(request.log, image);
        await rescheduleExpiryDeactivation(request.log);
        request.log.info({ id: saleId }, "Flash sale updated");
        return reply.status(200).send(updated);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const id = Number(request.params.id);
        const sale = await prisma.flashSale.findUnique({
          where: { id },
          select: { image: true },
        });
        if (!sale) {
          return reply.status(404).send({
            error: "NOT_FOUND_ERROR",
            message: "Vente flash non trouvée",
          });
        }
        await prisma.flashSale.delete({ where: { id } });
        if (sale?.image) deleteFile(sale.image).catch(() => {});
        await rescheduleExpiryDeactivation(request.log);
        return reply.status(204).send();
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
    },
  );
}
