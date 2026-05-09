import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import {
  ValidationError,
  validateDateTime,
  validateDiscount,
  validatePattern,
  handleValidationError,
} from "../lib/validation.js";

export async function vouchersRoutes(app) {
  function parseValidUntil(val) {
    if (!val) return undefined;
    // Date-only "YYYY-MM-DD" → end of that day (23:59:59.999 UTC)
    if (!val.includes("T")) return new Date(val + "T23:59:59.999Z");
    return new Date(val);
  }
  app.addSchema({
    $id: "Voucher",
    type: "object",
    properties: {
      id: { type: "integer" },
      code: { type: "string" },
      discountPercent: { type: "integer" },
      validUntil: { type: "string", format: "date-time" },
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
        tags: ["Vouchers"],
        summary:
          "List vouchers. Auth=all, public=active only. Supports search, sort, pagination.",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer", maximum: 100 },
            active: { type: "string", enum: ["true", "false"] },
            search: { type: "string" },
            sort: { type: "string", enum: ["date", "code", "discount"] },
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
        const allowedSorts = ["date", "code", "discount"];
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
          where.validUntil = { gte: new Date() };
        }
        if (search) {
          where.code = { contains: search, mode: "insensitive" };
        }
        let orderBy;
        switch (sort) {
          case "code":
            orderBy = [{ code: "asc" }, { id: "asc" }];
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
          prisma.voucher.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset,
          }),
          prisma.voucher.count({ where }),
        ]);
        return {
          items,
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
        tags: ["Vouchers"],
        summary: "Create a voucher",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          required: ["code", "discountPercent", "validUntil"],
          additionalProperties: false,
          properties: {
            code: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              pattern: "^[A-Za-z0-9_-]+$",
            },
            discountPercent: { type: "integer", minimum: 0, maximum: 100 },
            validUntil: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
            visible: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { code, discountPercent, validUntil, isActive, visible } =
          request.body;

        // Business logic validation
        validatePattern(code, "code", "^[A-Za-z0-9_-]+$");
        const validatedDiscount = validateDiscount(discountPercent);
        const validatedValidUntil = validateDateTime(validUntil, "validUntil", {
          mustBeFuture: true,
        });

        // Check for duplicate code
        const existing = await prisma.voucher.findUnique({
          where: { code },
        });
        if (existing) {
          return reply.status(409).send({
            error: "DUPLICATE_ERROR",
            message: "Un voucher avec ce code existe déjà",
            field: "code",
          });
        }

        const voucher = await prisma.voucher.create({
          data: {
            code,
            discountPercent: validatedDiscount,
            validUntil: validatedValidUntil,
            isActive: isActive ?? true,
            visible: visible ?? true,
          },
        });
        return reply.status(201).send(voucher);
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
        tags: ["Vouchers"],
        summary: "Update a voucher",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          additionalProperties: false,
          properties: {
            code: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              pattern: "^[A-Za-z0-9_-]+$",
            },
            discountPercent: { type: "integer", minimum: 0, maximum: 100 },
            validUntil: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
            visible: { type: "boolean" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { code, discountPercent, validUntil, isActive, visible } =
          request.body;

        // Validate ID
        const voucherId = validateIntegerId(Number(request.params.id), "id");
        const existing = await prisma.voucher.findUnique({
          where: { id: voucherId },
        });
        if (!existing) {
          request.log.warn({ id: voucherId }, "Voucher not found");
          throw new ValidationError("id", "Voucher non trouvé");
        }

        // Validate inputs if provided
        if (code) validatePattern(code, "code", "^[A-Za-z0-9_-]+$");
        if (discountPercent !== undefined) validateDiscount(discountPercent);
        if (validUntil)
          validateDateTime(validUntil, "validUntil", { mustBeFuture: true });

        const data = {};
        if (code !== undefined) data.code = code;
        if (discountPercent !== undefined)
          data.discountPercent = discountPercent;
        if (isActive !== undefined) data.isActive = isActive;
        if (visible !== undefined) data.visible = visible;
        if (validUntil) data.validUntil = parseValidUntil(validUntil);

        const updated = await prisma.voucher.update({
          where: { id: voucherId },
          data,
        });
        request.log.info({ id: voucherId }, "Voucher updated");
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
        tags: ["Vouchers"],
        summary: "Delete a voucher",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      try {
        const id = Number(request.params.id);
        const voucher = await prisma.voucher.findUnique({ where: { id } });
        if (!voucher) {
          return reply.status(404).send({
            error: "NOT_FOUND_ERROR",
            message: "Voucher non trouvé",
          });
        }
        await prisma.voucher.delete({ where: { id } });
        return reply.status(204).send();
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
    },
  );
}
