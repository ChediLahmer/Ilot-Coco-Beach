import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { sendPasswordResetEmail } from "../lib/email.js";

export async function passwordResetRoutes(app) {
  // Request a password reset email
  app.post("/forgot-password", async (request, reply) => {
    const { email } = request.body || {};
    if (!email) {
      return reply.status(400).send({ error: "Email required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (!admin) {
      return { message: "If that email exists, a reset link has been sent." };
    }

    // Invalidate any existing unused tokens for this admin
    await prisma.passwordReset.updateMany({
      where: { adminId: admin.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordReset.create({
      data: { token, adminId: admin.id, expiresAt },
    });

    // Build reset URL
    const adminUrl = process.env.ADMIN_URL || "http://localhost:5174";
    const resetUrl = `${adminUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (err) {
      request.log.error(err, "Failed to send reset email");
      return reply
        .status(500)
        .send({ error: "Failed to send email. Try again later." });
    }

    return { message: "If that email exists, a reset link has been sent." };
  });

  // Reset password with token
  app.post("/reset-password", async (request, reply) => {
    const { token, password } = request.body || {};
    if (!token || !password) {
      return reply.status(400).send({ error: "Token and password required" });
    }

    if (password.length < 6) {
      return reply
        .status(400)
        .send({ error: "Password must be at least 6 characters" });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (
      !resetRecord ||
      resetRecord.usedAt ||
      resetRecord.expiresAt < new Date()
    ) {
      return reply.status(400).send({ error: "Invalid or expired token" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.admin.update({
      where: { id: resetRecord.adminId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    return { message: "Password updated successfully" };
  });
}
