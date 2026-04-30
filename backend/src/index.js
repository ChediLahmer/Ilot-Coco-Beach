import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
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

const app = Fastify({ logger: true });

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
    "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176"
  ).split(","),
});
await app.register(multipart, { limits: { fileSize: 100 * 1024 * 1024 } });

app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode < 500 ? error.message : "Internal Server Error";
  request.log.error(error);
  reply.status(statusCode).send({ error: message });
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

const port = process.env.PORT || 3000;

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
