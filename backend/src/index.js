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

const app = Fastify({
  logger: true,
  trustProxy: true,
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

await app.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: { docExpansion: "list", deepLinking: true },
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
await app.register(multipart, { limits: { fileSize: 100 * 1024 * 1024 } });

app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode < 500 ? error.message : "Internal Server Error";
  request.log.error(error);
  reply.status(statusCode).send({ error: message });
});

// Cache public GET responses for 60s (CDN/browser), revalidate after
app.addHook("onSend", (request, reply, payload, done) => {
  if (
    request.method === "GET" &&
    !request.headers.authorization &&
    reply.statusCode === 200
  ) {
    reply.header(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=120",
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

const port = process.env.PORT || 3000;

try {
  await app.listen({ port, host: "0.0.0.0" });
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
