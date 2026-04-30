import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function menuRoutes(app) {
  app.get("/categories", async () => {
    return prisma.menuCategory.findMany({
      include: {
        items: { where: { available: true }, orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });
  });

  app.get("/categories/all", { preHandler: authenticate }, async () => {
    return prisma.menuCategory.findMany({
      include: {
        items: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });
  });

  app.post("/categories", { preHandler: authenticate }, async (request) => {
    const { name, order } = request.body;
    return prisma.menuCategory.create({
      data: { name, order: order || 0 },
    });
  });

  app.put("/categories/:id", { preHandler: authenticate }, async (request) => {
    const { name, order } = request.body;
    return prisma.menuCategory.update({
      where: { id: Number(request.params.id) },
      data: { name, order },
    });
  });

  app.delete(
    "/categories/:id",
    { preHandler: authenticate },
    async (request, reply) => {
      await prisma.menuCategory.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );

  app.get("/items", async (request) => {
    const where = request.query.categoryId
      ? { categoryId: Number(request.query.categoryId) }
      : {};
    return prisma.menuItem.findMany({ where, orderBy: { order: "asc" } });
  });

  app.post("/items", { preHandler: authenticate }, async (request) => {
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
  });

  app.put("/items/:id", { preHandler: authenticate }, async (request) => {
    const data = request.body;
    return prisma.menuItem.update({
      where: { id: Number(request.params.id) },
      data,
    });
  });

  app.delete(
    "/items/:id",
    { preHandler: authenticate },
    async (request, reply) => {
      await prisma.menuItem.delete({
        where: { id: Number(request.params.id) },
      });
      return reply.status(204).send();
    },
  );
}
