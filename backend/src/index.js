import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { menuRoutes } from "./routes/menu.js";
import { spacesRoutes } from "./routes/spaces.js";
import { galleryRoutes } from "./routes/gallery.js";
import { authRoutes } from "./routes/auth.js";
import { configRoutes } from "./routes/config.js";
import { flashSalesRoutes } from "./routes/flash-sales.js";
import { vouchersRoutes } from "./routes/vouchers.js";
import { uploadRoutes } from "./routes/upload.js";

const app = Fastify({ logger: true });

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

const port = process.env.PORT || 3000;

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
