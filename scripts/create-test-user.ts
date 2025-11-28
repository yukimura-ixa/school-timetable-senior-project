/**
 * Better Auth - Create Test Admin User
 * Quick script to create an admin user for testing
 */

import prisma from "@/lib/prisma";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  console.log("Creating test admin user...");

  // Hash password using scrypt (matches auth.ts)
  const hashedPassword = await hashPassword("admin123");

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@school.local" },
    update: {
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
    },
    create: {
      email: "admin@school.local",
      name: "ผู้ดูแลระบบ",
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
    },
  });

  console.log("✓ Test admin user created:");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Name: ${admin.name}`);
  console.log(`  Role: ${admin.role}`);
  console.log(`  Password: admin123`);
}

main()
  .catch((e) => {
    console.error("Error creating test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
