import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/auth.js";

export async function authRoutes(app) {
  app.post(
    "/login",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        tags: ["Auth"],
        summary: "Admin login",
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", maxLength: 128 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: { token: { type: "string" } },
          },
          401: {
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body || {};
      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password required" });
      }

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return reply.status(401).send({ error: "Invalid credentials" });
      }

      const token = signToken({ id: admin.id, email: admin.email });
      return { token };
    },
  );
}
