import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function analyticsRoutes(app) {
  app.post(
    "/event",
    {
      config: {
        rateLimit: { max: 30, timeWindow: "1 minute" },
      },
      schema: {
        tags: ["Analytics"],
        summary: "Track an analytics event (page_view, click_reserve)",
        body: {
          type: "object",
          required: ["event"],
          properties: {
            event: { type: "string", enum: ["page_view", "click_reserve"] },
            path: { type: "string" },
          },
        },
        response: {
          201: { type: "object", properties: { ok: { type: "boolean" } } },
        },
      },
    },
    async (request, reply) => {
      const { event, path } = request.body;
      await prisma.analyticsEvent.create({ data: { event, path } });
      return reply.status(201).send({ ok: true });
    },
  );

  app.get(
    "/stats",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Analytics"],
        summary: "Get conversion stats (admin only)",
        security: [{ BearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            days: { type: "integer", default: 30 },
          },
        },
      },
    },
    async (request) => {
      const days = Number(request.query.days) || 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const [pageViews, reserveClicks] = await Promise.all([
        prisma.analyticsEvent.count({
          where: { event: "page_view", createdAt: { gte: since } },
        }),
        prisma.analyticsEvent.count({
          where: { event: "click_reserve", createdAt: { gte: since } },
        }),
      ]);

      const conversionRate =
        pageViews > 0 ? ((reserveClicks / pageViews) * 100).toFixed(2) : 0;

      return {
        pageViews,
        reserveClicks,
        conversionRate: Number(conversionRate),
        days,
      };
    },
  );
}
