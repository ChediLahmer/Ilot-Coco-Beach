import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: node scripts/reset-password.js <email> <new-password>");
  console.error(
    "Example: node scripts/reset-password.js admin@ilotcocobeach.tn newpass123",
  );
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error("Error: Password must be at least 6 characters.");
  process.exit(1);
}

const admin = await prisma.admin.findUnique({ where: { email } });
if (!admin) {
  console.error(`Error: No admin found with email "${email}".`);
  await prisma.$disconnect();
  process.exit(1);
}

const hashed = await bcrypt.hash(newPassword, 10);
await prisma.admin.update({ where: { email }, data: { password: hashed } });
console.log(`Password updated for ${email}.`);
await prisma.$disconnect();
