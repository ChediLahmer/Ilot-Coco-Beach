import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function vouchersRoutes(app) {
  app.get("/", async () => {
    return prisma.voucher.findMany({
      where: { isActive: true },
      orderBy: { validUntil: "asc" },
    });
  });

  app.get("/all", { preHandler: authenticate }, async () => {
    return prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
  });

  app.post("/", { preHandler: authenticate }, async (request) => {
    const { code, discountPercent, validUntil, isActive } = request.body;
    return prisma.voucher.create({
      data: {
        code,
        discountPercent,
        validUntil: new Date(validUntil),
        isActive: isActive ?? true,
      },
    });
  });

  app.put("/:id", { preHandler: authenticate }, async (request) => {
    const data = { ...request.body };
    if (data.validUntil) data.validUntil = new Date(data.validUntil);
    return prisma.voucher.update({
      where: { id: Number(request.params.id) },
      data,
    });
  });

  app.delete("/:id", { preHandler: authenticate }, async (request, reply) => {
    await prisma.voucher.delete({
      where: { id: Number(request.params.id) },
    });
    return reply.status(204).send();
  });
}
