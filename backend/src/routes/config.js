import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import { deleteFile, isIncomingUrl } from "../lib/storage.js";
import { scheduleIncomingCleanup } from "../lib/upload-cleanup.js";
import {
  ValidationError,
  validatePattern,
  handleValidationError,
} from "../lib/validation.js";

let configCache = null;
let publicConfigCache = null;

export function invalidateConfigCache() {
  configCache = null;
  publicConfigCache = null;
}

const MEDIA_KEYS = new Set([
  "hero_video_url",
  "hero_poster_url",
  "spaces_hero_image_url",
  "section_video_url",
  "section_poster_url",
  "about_image_1",
  "about_image_2",
  "og_image",
]);

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
  "spaces_hero_image_url",
  "section_video_url",
  "section_poster_url",
  "show_reviews",
  "about_image_1",
  "about_image_2",
  "seo_title",
  "seo_description",
  "og_image",
]);

export async function configRoutes(app) {
  app.get(
    "/",
    {
      preHandler: optionalAuth,
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
    async (request) => {
      if (!configCache) {
        const configs = await prisma.siteConfig.findMany();
        configCache = Object.fromEntries(configs.map((c) => [c.key, c.value]));
      }
      // Admins see raw values (incl. media still processing, for the UI badge).
      if (request.admin) return configCache;
      if (!publicConfigCache) {
        publicConfigCache = { ...configCache };
        for (const key of MEDIA_KEYS) {
          if (isIncomingUrl(publicConfigCache[key])) {
            publicConfigCache[key] = "";
          }
        }
      }
      return publicConfigCache;
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
      try {
        const { key } = request.params;

        // Validate key is in allowed list
        if (!ALLOWED_CONFIG_KEYS.has(key)) {
          return reply.status(400).send({
            error: "VALIDATION_ERROR",
            message: `Clé de configuration invalide : ${key}`,
            field: "key",
          });
        }

        const { value } = request.body;
        let oldValue = null;

        if (MEDIA_KEYS.has(key)) {
          const old = await prisma.siteConfig.findUnique({ where: { key } });
          if (old?.value && old.value !== value) {
            oldValue = old.value;
          }
        }

        const result = await prisma.siteConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });

        invalidateConfigCache();
        if (oldValue) {
          deleteFile(oldValue).catch(() => {});
        }
        if (MEDIA_KEYS.has(key)) {
          scheduleIncomingCleanup(request.log, value);
        }

        return reply.status(200).send(result);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const entries = Object.entries(request.body);
        const invalid = entries.filter(([k]) => !ALLOWED_CONFIG_KEYS.has(k));

        if (invalid.length) {
          return reply.status(400).send({
            error: "VALIDATION_ERROR",
            message: `Clé(s) de configuration invalide(s) : ${invalid.map(([k]) => k).join(", ")}`,
            fields: invalid.map(([k]) => k),
          });
        }

        const mediaEntries = entries.filter(([k]) => MEDIA_KEYS.has(k));
        const oldMediaToDelete = [];

        if (mediaEntries.length) {
          const oldConfigs = await prisma.siteConfig.findMany({
            where: { key: { in: mediaEntries.map(([k]) => k) } },
          });
          const oldMap = Object.fromEntries(
            oldConfigs.map((c) => [c.key, c.value]),
          );
          for (const [k, v] of mediaEntries) {
            if (oldMap[k] && oldMap[k] !== v) {
              oldMediaToDelete.push(oldMap[k]);
            }
          }
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
        for (const url of oldMediaToDelete) {
          deleteFile(url).catch(() => {});
        }
        for (const [, value] of mediaEntries) {
          scheduleIncomingCleanup(request.log, value);
        }

        const configs = await prisma.siteConfig.findMany();
        return reply
          .status(200)
          .send(Object.fromEntries(configs.map((c) => [c.key, c.value])));
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
    },
  );
}
