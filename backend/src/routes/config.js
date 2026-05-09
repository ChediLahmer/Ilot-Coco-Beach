import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

let configCache = null;

export function invalidateConfigCache() {
  configCache = null;
}

const ALLOWED_CONFIG_KEYS = new Set([
  "name",
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "messenger",
  "facebook",
  "tiktok",
  "address",
  "lat",
  "lng",
  "satisfaction_rate",
  "hours",
  "hero_video_url",
  "hero_poster_url",
  "section_video_url",
  "section_poster_url",
  "show_reviews",
  "about_image_1",
  "about_image_2",
]);

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
      if (configCache) return configCache;
      const configs = await prisma.siteConfig.findMany();
      configCache = Object.fromEntries(configs.map((c) => [c.key, c.value]));
      return configCache;
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
          properties: { key: { type: "string", maxLength: 50 } },
        },
        body: {
          type: "object",
          required: ["value"],
          additionalProperties: false,
          properties: { value: { type: "string", maxLength: 10000 } },
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
    async (request, reply) => {
      const { key } = request.params;
      if (!ALLOWED_CONFIG_KEYS.has(key)) {
        return reply.status(400).send({ error: `Invalid config key: ${key}` });
      }
      const { value } = request.body;
      return prisma.siteConfig
        .upsert({
          where: { key: request.params.key },
          update: { value },
          create: { key: request.params.key, value },
        })
        .then((r) => {
          invalidateConfigCache();
          return r;
        });
    },
  );

  // Batch update multiple config values in a single transaction
  app.put(
    "/",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Config"],
        summary: "Batch update config values",
        security: [{ BearerAuth: [] }],
        body: {
          type: "object",
          additionalProperties: { type: "string", maxLength: 10000 },
        },
      },
    },
    async (request, reply) => {
      const entries = Object.entries(request.body);
      const invalid = entries.filter(([k]) => !ALLOWED_CONFIG_KEYS.has(k));
      if (invalid.length) {
        return reply.status(400).send({
          error: `Invalid config key(s): ${invalid.map(([k]) => k).join(", ")}`,
        });
      }
      await prisma.$transaction(
        entries.map(([key, value]) =>
          prisma.siteConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          }),
        ),
      );
      invalidateConfigCache();
      const configs = await prisma.siteConfig.findMany();
      return Object.fromEntries(configs.map((c) => [c.key, c.value]));
    },
  );
}
