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
      createdAt: { type: "string", format: "date-time" },
    },
  });

  app.get(
    "/",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Vouchers"],
        summary: "List vouchers. Auth=all, public=active only. ?page for pagination.",
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
          prisma.voucher.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
          prisma.voucher.count({ where }),
        ]);
        return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) };
      }
      return prisma.voucher.findMany({ where, orderBy: { createdAt: "desc" } });
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
            discountPercent: { type: "integer" },
            validUntil: { type: "string", format: "date-time" },
            isActive: { type: "boolean", default: true },
          },
        },
      },
    },
    async (request) => {
      const { code, discountPercent, validUntil, isActive } = request.body;
      return prisma.voucher.create({
        data: { code, discountPercent, validUntil: new Date(validUntil), isActive: isActive ?? true },
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
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          properties: {
            code: { type: "string" },
            discountPercent: { type: "integer" },
            validUntil: { type: "string", format: "date-time" },
            isActive: { type: "boolean" },
          },
        },
      },
    },
    async (request) => {
      const data = { ...request.body };
      if (data.validUntil) data.validUntil = new Date(data.validUntil);
      return prisma.voucher.update({ where: { id: Number(request.params.id) }, data });
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
