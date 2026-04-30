import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function reviewsRoutes(app) {
  // Public: get approved reviews (paginated)
  app.get("/", async (request) => {
    const limit = Math.min(Number(request.query.limit) || 20, 50);
    const cursor = Number(request.query.cursor) || undefined;

    const where = { approved: true };
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = reviews.length > limit;
    const items = hasMore ? reviews.slice(0, limit) : reviews;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor };
  });

  // Public: submit a review (auto-approved for now)
  app.post("/", async (request, reply) => {
    const { userName, comment, rating } = request.body || {};
    if (!userName || !comment) {
      return reply.status(400).send({ error: "userName and comment required" });
    }
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const review = await prisma.review.create({
      data: {
        userName: userName.trim().slice(0, 100),
        comment: comment.trim().slice(0, 1000),
        rating: safeRating,
        approved: true,
      },
    });
    return reply.status(201).send(review);
  });

  // Admin: list all reviews (including unapproved)
  app.get("/all", { preHandler: authenticate }, async (request) => {
    const limit = Math.min(Number(request.query.limit) || 50, 100);
    const offset = Number(request.query.offset) || 0;
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    const total = await prisma.review.count();
    return { items: reviews, total };
  });

  // Admin: approve/reject
  app.put("/:id", { preHandler: authenticate }, async (request) => {
    const { approved } = request.body;
    return prisma.review.update({
      where: { id: Number(request.params.id) },
      data: { approved: Boolean(approved) },
    });
  });

  // Admin: delete
  app.delete("/:id", { preHandler: authenticate }, async (request, reply) => {
    await prisma.review.delete({ where: { id: Number(request.params.id) } });
    return reply.status(204).send();
  });
}
