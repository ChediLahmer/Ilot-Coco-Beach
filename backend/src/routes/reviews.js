import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";

export async function reviewRoutes(app) {
  app.get(
    "/",
    {
      preHandler: optionalAuth,
      schema: {
        tags: ["Reviews"],
        summary: "List reviews (public: visible only, admin: all)",
        querystring: {
          type: "object",
          properties: {
            cursor: { type: "integer" },
            limit: { type: "integer", maximum: 50 },
          },
        },
      },
    },
    async (request) => {
      const limit = Math.min(Number(request.query.limit) || 20, 50);
      const cursor = request.query.cursor ? Number(request.query.cursor) : null;
      const where = request.admin ? {} : { visible: true };
      if (cursor) where.id = { lt: cursor };

      const items = await prisma.review.findMany({
        where,
        orderBy: { id: "desc" },
        take: limit,
      });

      const nextCursor =
        items.length === limit ? items[items.length - 1].id : null;
      return { items, nextCursor };
    },
  );

  app.post(
    "/",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        tags: ["Reviews"],
        summary: "Submit a new review (pending moderation)",
        body: {
          type: "object",
          required: ["userName", "comment", "rating"],
          additionalProperties: false,
          properties: {
            userName: { type: "string", minLength: 2, maxLength: 100 },
            comment: { type: "string", minLength: 10, maxLength: 2000 },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            deviceId: { type: "string", minLength: 36, maxLength: 36 },
          },
        },
      },
    },
    async (request, reply) => {
      const { userName, comment, rating, deviceId } = request.body;

      const review = await prisma.review.create({
        data: {
          userName,
          comment,
          rating,
          deviceId: deviceId || null,
          visible: false,
        },
      });
      return reply.status(201).send(review);
    },
  );

  app.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Reviews"],
        summary: "Update review visibility (admin)",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        body: {
          type: "object",
          additionalProperties: false,
          properties: { visible: { type: "boolean" } },
        },
      },
    },
    async (request) => {
      return prisma.review.update({
        where: { id: Number(request.params.id) },
        data: { visible: request.body.visible },
      });
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Reviews"],
        summary: "Delete a review (admin)",
        security: [{ BearerAuth: [] }],
        params: { type: "object", properties: { id: { type: "integer" } } },
        response: { 204: { type: "null" } },
      },
    },
    async (request, reply) => {
      await prisma.review.delete({ where: { id: Number(request.params.id) } });
      return reply.status(204).send();
    },
  );
}
