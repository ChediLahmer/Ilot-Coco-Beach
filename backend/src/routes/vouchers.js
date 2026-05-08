import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";

export async function vouchersRoutes(app) {
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
    async (request) => {
      const { page, limit: rawLimit, active, search, sort } = request.query;
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
      const limit = Math.min(Number(rawLimit) || 20, 100);
      const offset = page ? (Number(page) - 1) * limit : 0;
      const [items, total] = await Promise.all([
        prisma.voucher.findMany({ where, orderBy, take: limit, skip: offset }),
        prisma.voucher.count({ where }),
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
      const { code, discountPercent, validUntil, isActive, visible } =
        request.body;
      const voucher = await prisma.voucher.create({
        data: {
          code,
          discountPercent,
          validUntil: new Date(validUntil),
          isActive: isActive ?? true,
          visible: visible ?? true,
        },
      });
      return reply.status(201).send(voucher);
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
    async (request) => {
      const { code, discountPercent, validUntil, isActive, visible } =
        request.body;
      const data = { code, discountPercent, isActive, visible };
      if (validUntil) data.validUntil = new Date(validUntil);
      return prisma.voucher.update({
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
        tags: ["Vouchers"],
        summary: "Delete a voucher",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.voucher.delete({ where: { id: Number(request.params.id) } });
      return reply.status(204).send();
    },
  );
}
