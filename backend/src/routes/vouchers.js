import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

const paginatedResponse = {
  type: "object",
  properties: {
    items: { type: "array", items: { $ref: "#/components/schemas/Voucher" } },
    total: { type: "integer" },
    page: { type: "integer" },
    totalPages: { type: "integer" },
  },
};

export async function vouchersRoutes(app) {
  app.addSchema({
    $id: "Voucher",
    type: "object",
    properties: {
      id: { type: "integer" },
      code: { type: "string" },
      discountPercent: { type: "number" },
      validUntil: { type: "string", format: "date-time" },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
    },
  });

  app.get(
    "/",
    {
      schema: {
        tags: ["Vouchers"],
        summary: "List active vouchers (public)",
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
        prisma.voucher.findMany({
          where,
          orderBy: { validUntil: "asc" },
          take: limit,
          skip: offset,
        }),
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

  app.get(
    "/all",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Vouchers"],
        summary: "List all vouchers (admin)",
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
        prisma.voucher.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
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
          properties: {
            code: { type: "string" },
            discountPercent: { type: "number" },
            validUntil: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request) => {
      const { code, discountPercent, validUntil, isActive } = request.body;
      return prisma.voucher.create({
        data: {
          code,
          discountPercent,
          validUntil: new Date(validUntil),
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
        tags: ["Vouchers"],
        summary: "Update a voucher",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
        body: {
          type: "object",
          properties: {
            code: { type: "string" },
            discountPercent: { type: "number" },
            validUntil: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
          },
        },
      },
    },
    async (request) => {
      const data = { ...request.body };
      if (data.validUntil) data.validUntil = new Date(data.validUntil);
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
        params: {
          type: "object",
          properties: { id: { type: "integer" } },
        },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.voucher.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );
}
