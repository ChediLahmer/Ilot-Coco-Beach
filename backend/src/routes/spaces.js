import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function spacesRoutes(app) {
  app.get("/", async () => {
    return prisma.space.findMany({
      where: { available: true },
      orderBy: { order: "asc" },
    });
  });

  app.get("/all", { preHandler: authenticate }, async () => {
    return prisma.space.findMany({ orderBy: { order: "asc" } });
  });

  app.post("/", { preHandler: authenticate }, async (request) => {
    const { name, description, image, price, capacity, order, available } =
      request.body;
    return prisma.space.create({
      data: {
        name,
        description,
        image,
        price,
        capacity,
        order: order || 0,
        available: available ?? true,
      },
    });
  });

  app.put("/:id", { preHandler: authenticate }, async (request) => {
    const data = request.body;
    return prisma.space.update({
      where: { id: Number(request.params.id) },
      data,
    });
  });

  app.delete("/:id", { preHandler: authenticate }, async (request, reply) => {
    await prisma.space.delete({ where: { id: Number(request.params.id) } });
    return reply.status(204).send();
  });
}
