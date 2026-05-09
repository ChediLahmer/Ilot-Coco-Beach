import { prisma } from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../lib/auth.js";
import {
  adjustReviewStatsForDelete,
  adjustReviewStatsForVisibilityChange,
  getStoredReviewStats,
} from "../lib/review-stats.js";
import {
  ValidationError,
  validateRating,
  validateIntegerId,
  validateEntityExists,
  handleValidationError,
} from "../lib/validation.js";

export async function reviewRoutes(app) {
  // Public stats — always based on visible reviews only
  app.get(
    "/stats",
    {
      schema: {
        tags: ["Reviews"],
        summary: "Get review stats (visible reviews only)",
        response: {
          200: {
            type: "object",
            properties: {
              count: { type: "integer" },
              average: { type: "number" },
              recommendRate: { type: "integer" },
            },
          },
        },
      },
    },
    async () => {
      return getStoredReviewStats();
    },
  );

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
    async (request, reply) => {
      try {
        // Validate limit
        let limitNum = Number(request.query.limit) || 20;
        if (!Number.isInteger(limitNum) || limitNum <= 0) {
          throw new ValidationError(
            "limit",
            "limit must be a positive integer",
          );
        }
        limitNum = Math.min(limitNum, 50);

        // Validate cursor
        let cursor = null;
        if (request.query.cursor) {
          cursor = Number(request.query.cursor);
          if (!Number.isInteger(cursor) || cursor <= 0) {
            throw new ValidationError(
              "cursor",
              "cursor must be a positive integer",
            );
          }
        }

        const limit = limitNum;
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
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const { userName, comment, rating, deviceId } = request.body;
        const clientIp = request.ip;

        // Validate user name
        if (!userName || userName.trim().length < 2) {
          request.log.warn({ field: "userName", value: userName }, "Invalid userName");
          throw new ValidationError(
            "userName",
            "Le nom d'utilisateur doit faire au moins 2 caractères",
          );
        }

        // Validate comment
        if (!comment || comment.trim().length < 10) {
          request.log.warn({ field: "comment", length: comment?.length }, "Invalid comment");
          throw new ValidationError(
            "comment",
            "Le commentaire doit faire au moins 10 caractères",
          );
        }

        // Validate rating using new validator
        const validatedRating = validateRating(rating, "rating");

        // Log successful rate limit pass for tracking
        request.log.info(
          { clientIp, endpoint: "/reviews" },
          "Rate limit check passed",
        );

        const review = await prisma.review.create({
          data: {
            userName: userName.trim(),
            comment: comment.trim(),
            rating: validatedRating,
            deviceId: deviceId || null,
            visible: false,
          },
        });
        request.log.info({ reviewId: review.id, rating: validatedRating }, "Review created");
        return reply.status(201).send(review);
      } catch (error) {
        // Log rate limit exceeded if it's a 429
        if (error.statusCode === 429) {
          request.log.warn({ clientIp: request.ip }, "Rate limit exceeded");
        }
        return handleValidationError(error, reply, request.log);
      }
    },
  );
      }
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
    async (request, reply) => {
      try {
        const reviewId = validateIntegerId(Number(request.params.id), "id");
        const existing = await prisma.review.findUnique({
          where: { id: reviewId },
        });
        validateEntityExists(existing, "id", "Review");

        const updated = await prisma.$transaction(async (tx) => {
          const result = await tx.review.update({
            where: { id: reviewId },
            data: { visible: request.body.visible },
          });
          await adjustReviewStatsForVisibilityChange(existing, result, tx);
          return result;
        });
        return reply.status(200).send(updated);
      } catch (error) {
        return handleValidationError(error, reply, request.log);
      }
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
      try {
        const id = Number(request.params.id);
        const existing = await prisma.review.findUnique({ where: { id } });
        if (!existing) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Review not found",
          });
        }
        await prisma.$transaction(async (tx) => {
          await tx.review.delete({ where: { id } });
          await adjustReviewStatsForDelete(existing, tx);
        });
        return reply.status(204).send();
      } catch (error) {
        request.log.error(error, "Error deleting review");
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to delete review",
        });
      }
    },
  );
}
