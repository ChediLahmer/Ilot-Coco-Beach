import Fastify from "fastify";
import cors from "@fastify/cors";
import compress from "@fastify/compress";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { prisma } from "./lib/prisma.js";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { menuRoutes } from "./routes/menu.js";
import { spacesRoutes } from "./routes/spaces.js";
import { galleryRoutes } from "./routes/gallery.js";
import { authRoutes } from "./routes/auth.js";
import { configRoutes } from "./routes/config.js";
import { flashSalesRoutes } from "./routes/flash-sales.js";
import { vouchersRoutes } from "./routes/vouchers.js";
import { uploadRoutes } from "./routes/upload.js";
import { passwordResetRoutes } from "./routes/password-reset.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { reviewRoutes } from "./routes/reviews.js";
import { mediaRoutes } from "./routes/media.js";
import { jobsRoutes } from "./routes/jobs.js";
import { startScheduler } from "./lib/scheduler.js";
import helmet from "@fastify/helmet";

const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 600000);
const CONNECTION_TIMEOUT_MS = Number(
  process.env.CONNECTION_TIMEOUT_MS || 600000,
);

const app = Fastify({
  logger: true,
  trustProxy: process.env.TRUST_PROXY || 1,
  requestTimeout: REQUEST_TIMEOUT_MS,
  connectionTimeout: CONNECTION_TIMEOUT_MS,
});

await app.register(swagger, {
  openapi: {
    info: {
      title: "Ilot Coco Beach API",
      description:
        "Backend API for the Ilot Coco Beach website and admin panel",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    tags: [
      { name: "Auth", description: "Authentication & password reset" },
      { name: "Config", description: "Site configuration (public + admin)" },
      { name: "Menu", description: "Menu categories & items" },
      { name: "Spaces", description: "Beach spaces/cabins" },
      { name: "Gallery", description: "Photo gallery" },
      { name: "Flash Sales", description: "Promotional flash sales" },
      { name: "Vouchers", description: "Discount vouchers" },
      { name: "Upload", description: "File upload to S3/MinIO" },
      {
        name: "Jobs",
        description: "Job scheduler & execution history (admin only)",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
  });
}

await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
await app.register(cors, {
  origin: (
    process.env.CORS_ORIGIN ||
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177"
  ).split(","),
});
await app.register(rateLimit, {
  max: 200,
  timeWindow: "1 minute",
});
await app.register(compress, { global: true });
await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });

app.setErrorHandler((error, request, reply) => {
  if (error.code === "P2025") {
    return reply.status(404).send({ error: "Record not found" });
  }
  if (error.code === "P2002") {
    return reply
      .status(409)
      .send({ error: "A record with this value already exists" });
  }
  if (error.code === "P2003") {
    return reply
      .status(400)
      .send({ error: "Referenced record does not exist" });
  }
  if (error.validation) {
    const details = error.validation.map((v) => v.message).join("; ");
    return reply.status(400).send({ error: `Validation failed: ${details}` });
  }
  const statusCode = error.statusCode || 500;
  const message = statusCode < 500 ? error.message : "Internal Server Error";
  request.log.error(error);
  reply.status(statusCode).send({ error: message });
});

// Cache public GET responses — client revalidates each time but can use 304
app.addHook("onSend", (request, reply, payload, done) => {
  if (
    request.method === "GET" &&
    !request.headers.authorization &&
    reply.statusCode === 200
  ) {
    reply.header(
      "Cache-Control",
      "public, no-cache, max-age=0, must-revalidate",
    );
  }
  done();
});

app.get("/api/health", () => ({ status: "ok" }));

await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(menuRoutes, { prefix: "/api/menu" });
await app.register(spacesRoutes, { prefix: "/api/spaces" });
await app.register(galleryRoutes, { prefix: "/api/gallery" });
await app.register(configRoutes, { prefix: "/api/config" });
await app.register(flashSalesRoutes, { prefix: "/api/flash-sales" });
await app.register(vouchersRoutes, { prefix: "/api/vouchers" });
await app.register(uploadRoutes, { prefix: "/api/upload" });
await app.register(passwordResetRoutes, { prefix: "/api/auth" });
await app.register(analyticsRoutes, { prefix: "/api/analytics" });
await app.register(reviewRoutes, { prefix: "/api/reviews" });
await app.register(mediaRoutes, { prefix: "/api/media" });
await app.register(jobsRoutes, { prefix: "/api/jobs" });

const port = process.env.PORT || 3000;

try {
  await app.listen({ port, host: "0.0.0.0" });
  startScheduler(app.log);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Graceful shutdown
async function shutdown(signal) {
  app.log.info(`${signal} received, shutting down...`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
