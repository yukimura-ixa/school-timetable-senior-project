/**
 * Create Admin User Script
 * Simple script to create admin user without running full seed
 */

import prisma from "../src/lib/prisma";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  console.log("👤 Creating admin user...\n");

  // Hash password using scrypt (matches auth.ts)
  const adminPassword = await hashPassword("admin123");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@school.local" },
  });

  if (existingAdmin) {
    console.log("ℹ️  Admin user already exists!");
    console.log("📧 Email:", existingAdmin.email);
    console.log("👤 Name:", existingAdmin.name);
    console.log("🔑 Role:", existingAdmin.role);
    console.log("\n✅ You can login at: http://localhost:3000/signin");
    console.log("   Email: admin@school.local");
    console.log("   Password: admin123");
    return;
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@school.local",
      name: "System Administrator",
      password: adminPassword,
      role: "admin",
      emailVerified: true,
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log("📧 Email:", admin.email);
  console.log("👤 Name:", admin.name);
  console.log("🔑 Role:", admin.role);
  console.log("\n📝 Login Credentials:");
  console.log("   Email: admin@school.local");
  console.log("   Password: admin123");
  console.log("\n🌐 Test at: http://localhost:3000/signin");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
