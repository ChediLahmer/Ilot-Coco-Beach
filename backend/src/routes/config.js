import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function configRoutes(app) {
  // Public: get all site config
  app.get("/", async () => {
    const configs = await prisma.siteConfig.findMany();
    return Object.fromEntries(configs.map((c) => [c.key, c.value]));
  });

  // Admin: update config value
  app.put("/:key", { preHandler: authenticate }, async (request) => {
    const { value } = request.body;
    return prisma.siteConfig.upsert({
      where: { key: request.params.key },
      update: { value },
      create: { key: request.params.key, value },
    });
  });
}
