import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function configRoutes(app) {
  app.get(
    "/",
    {
      schema: {
        tags: ["Config"],
        summary: "Get all site configuration",
        response: {
          200: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
    },
    async () => {
      const configs = await prisma.siteConfig.findMany();
      return Object.fromEntries(configs.map((c) => [c.key, c.value]));
    },
  );

  app.put(
    "/:key",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Config"],
        summary: "Update a config value",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: { key: { type: "string" } },
        },
        body: {
          type: "object",
          required: ["value"],
          properties: { value: { type: "string" } },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "integer" },
              key: { type: "string" },
              value: { type: "string" },
            },
          },
        },
      },
    },
    async (request) => {
      const { value } = request.body;
      return prisma.siteConfig.upsert({
        where: { key: request.params.key },
        update: { value },
        create: { key: request.params.key, value },
      });
    },
  );
}
