import { authenticate } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export async function jobsRoutes(app) {
  // Get job run history with pagination
  app.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Jobs"],
        summary: "Get job run history (admin only)",
        security: [{ BearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 50, minimum: 1, maximum: 200 },
            offset: { type: "integer", default: 0, minimum: 0 },
            jobName: { type: "string" },
            status: { type: "string", enum: ["running", "success", "error"] },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              runs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    jobName: { type: "string" },
                    status: { type: "string" },
                    startedAt: { type: "string", format: "date-time" },
                    completedAt: {
                      type: ["string", "null"],
                      format: "date-time",
                    },
                    durationMs: { type: ["integer", "null"] },
                    itemsCount: { type: "integer" },
                    errorMessage: { type: ["string", "null"] },
                  },
                },
              },
              total: { type: "integer" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit = 50, offset = 0, jobName, status } = request.query;

        const where = {};
        if (jobName) where.jobName = jobName;
        if (status) where.status = status;

        const [runs, total] = await Promise.all([
          prisma.jobRun.findMany({
            where,
            orderBy: { startedAt: "desc" },
            take: limit,
            skip: offset,
          }),
          prisma.jobRun.count({ where }),
        ]);

        return reply.send({ runs, total });
      } catch (err) {
        request.log.error(err, "Failed to fetch job history");
        // Return empty array if table doesn't exist
        if (err.code === "P1003" || err.code === "P2021") {
          return reply.send({ runs: [], total: 0 });
        }
        throw err;
      }
    },
  );

  // Get job statistics summary
  app.get(
    "/stats",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Jobs"],
        summary: "Get job statistics (admin only)",
        security: [{ BearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              jobs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    jobName: { type: "string" },
                    totalRuns: { type: "integer" },
                    successCount: { type: "integer" },
                    errorCount: { type: "integer" },
                    lastRun: { type: ["string", "null"], format: "date-time" },
                    avgDurationMs: { type: ["integer", "null"] },
                    totalItemsProcessed: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Get unique job names
        const jobNames = await prisma.jobRun.findMany({
          select: { jobName: true },
          distinct: ["jobName"],
        });

        // If no jobs have run yet, return empty stats
        if (!jobNames || jobNames.length === 0) {
          return reply.send({ jobs: [] });
        }

        const stats = await Promise.all(
          jobNames.map(async ({ jobName }) => {
            const [
              successCount,
              errorCount,
              totalRuns,
              lastRun,
              avgDuration,
              totalItems,
            ] = await Promise.all([
              prisma.jobRun.count({
                where: { jobName, status: "success" },
              }),
              prisma.jobRun.count({
                where: { jobName, status: "error" },
              }),
              prisma.jobRun.count({
                where: { jobName },
              }),
              prisma.jobRun.findFirst({
                where: { jobName },
                orderBy: { startedAt: "desc" },
                select: { startedAt: true },
              }),
              prisma.jobRun.aggregate({
                where: { jobName, status: "success" },
                _avg: { durationMs: true },
              }),
              prisma.jobRun.aggregate({
                where: { jobName },
                _sum: { itemsCount: true },
              }),
            ]);

            return {
              jobName,
              totalRuns,
              successCount,
              errorCount,
              lastRun: lastRun?.startedAt || null,
              avgDurationMs: avgDuration._avg.durationMs || null,
              totalItemsProcessed: totalItems._sum.itemsCount || 0,
            };
          }),
        );

        return reply.send({ jobs: stats });
      } catch (err) {
        request.log.error(err, "Failed to fetch job statistics");
        // Return empty stats instead of 500 error if table doesn't exist
        if (err.code === "P1003" || err.code === "P2021") {
          return reply.send({ jobs: [] });
        }
        throw err;
      }
    },
  );

  // Get details for a specific job
  app.get(
    "/:jobName",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Jobs"],
        summary: "Get run history for a specific job (admin only)",
        security: [{ BearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            jobName: { type: "string" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 20, minimum: 1, maximum: 100 },
            offset: { type: "integer", default: 0, minimum: 0 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              jobName: { type: "string" },
              runs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    status: { type: "string" },
                    startedAt: { type: "string", format: "date-time" },
                    completedAt: {
                      type: ["string", "null"],
                      format: "date-time",
                    },
                    durationMs: { type: ["integer", "null"] },
                    itemsCount: { type: "integer" },
                    errorMessage: { type: ["string", "null"] },
                  },
                },
              },
              total: { type: "integer" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { jobName } = request.params;
      const { limit = 20, offset = 0 } = request.query;

      const [runs, total] = await Promise.all([
        prisma.jobRun.findMany({
          where: { jobName },
          orderBy: { startedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.jobRun.count({ where: { jobName } }),
      ]);

      return reply.send({ jobName, runs, total });
    },
  );
}
