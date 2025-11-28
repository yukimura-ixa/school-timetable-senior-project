/**
 * Quick Admin User Creation Script for Test Database
 * Uses scrypt password hashing to match auth.ts
 */

import { PrismaClient } from "./prisma/generated/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

// Override DATABASE_URL for this script
process.env.DATABASE_URL =
  "postgresql://test_user:test_password@localhost:5433/test_timetable";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating admin user in test database...");

  const adminPassword = await hashPassword("admin123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.local" },
    update: {
      password: adminPassword,
      role: "admin",
      emailVerified: true,
    },
    create: {
      email: "admin@school.local",
      name: "System Administrator",
      password: adminPassword,
      role: "admin",
      emailVerified: true,
      banned: false,
    },
  });

  console.log("✅ Admin user created/updated:");
  console.log("   Email:", admin.email);
  console.log("   Password: admin123");
  console.log("   Hash preview:", admin.password?.substring(0, 50) + "...");
  console.log(
    "   Hash format:",
    admin.password?.includes(":") ? "scrypt ✓" : "unknown",
  );
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
