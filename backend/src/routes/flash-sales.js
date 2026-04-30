import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function flashSalesRoutes(app) {
  app.get("/", async () => {
    return prisma.flashSale.findMany({
      where: { isActive: true },
      orderBy: { endsAt: "asc" },
    });
  });

  app.get("/all", { preHandler: authenticate }, async () => {
    return prisma.flashSale.findMany({ orderBy: { createdAt: "desc" } });
  });

  app.post("/", { preHandler: authenticate }, async (request) => {
    const { title, description, discountPercent, image, endsAt, isActive } =
      request.body;
    return prisma.flashSale.create({
      data: {
        title,
        description,
        discountPercent,
        image,
        endsAt: new Date(endsAt),
        isActive: isActive ?? true,
      },
    });
  });

  app.put("/:id", { preHandler: authenticate }, async (request) => {
    const data = { ...request.body };
    if (data.endsAt) data.endsAt = new Date(data.endsAt);
    return prisma.flashSale.update({
      where: { id: Number(request.params.id) },
      data,
    });
  });

  app.delete("/:id", { preHandler: authenticate }, async (request, reply) => {
    await prisma.flashSale.delete({
      where: { id: Number(request.params.id) },
    });
    return reply.status(204).send();
  });
}
