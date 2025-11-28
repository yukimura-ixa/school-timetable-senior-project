/**
 * Production Admin Password Reset Script
 * Resets the admin@school.local password to use scrypt hashing
 *
 * This is SAFE to run on production - it only updates the admin user
 *
 * Usage:
 *   # Using production DATABASE_URL from .env
 *   pnpm tsx scripts/reset-production-admin.ts
 *
 *   # Or specify DATABASE_URL explicitly
 *   DATABASE_URL="your-prod-url" pnpm tsx scripts/reset-production-admin.ts
 */

import prisma from "../src/lib/prisma";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import readline from "readline";

const scryptAsync = promisify(scrypt);

/**
 * Hash password using scrypt (matches auth.ts)
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Prompt user for confirmation
 */
async function confirmReset(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "\n⚠️  This will reset admin@school.local password. Continue? (yes/no): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      },
    );
  });
}

async function main() {
  console.log("🔐 Production Admin Password Reset");
  console.log("==================================\n");

  // Check database connection
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  // Show (safe) connection info
  const safeUrl =
    dbUrl.split("?")[0]?.replace(/:[^:@]+@/, ":****@") ?? "unknown";
  console.log("📊 Database:", safeUrl);

  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: "admin@school.local" },
  });

  if (!admin) {
    console.log("\n❌ Admin user (admin@school.local) not found");
    console.log("   Create it first with: pnpm tsx scripts/create-admin.ts");
    return;
  }

  console.log("\n✅ Found admin user:");
  console.log("   Email:", admin.email);
  console.log("   Name:", admin.name);
  console.log("   Role:", admin.role);

  if (admin.password) {
    const hashPreview = admin.password.substring(0, 30);
    const hashType = admin.password.startsWith("$2")
      ? "bcrypt (OLD)"
      : admin.password.includes(":")
        ? "scrypt (CURRENT)"
        : "unknown";
    console.log(`   Current hash: ${hashPreview}... (${hashType})`);
  } else {
    console.log("   Current hash: (none - OAuth only)");
  }

  // Confirm reset
  const confirmed = await confirmReset();
  if (!confirmed) {
    console.log("\n❌ Reset cancelled");
    return;
  }

  // Reset password
  console.log("\n🔄 Resetting password...");
  const newPassword = "admin123"; // Default password
  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email: "admin@school.local" },
    data: {
      password: hashedPassword,
      emailVerified: true, // Ensure email is verified
    },
  });

  console.log("\n✅ Password reset successful!");
  console.log("\n📝 New login credentials:");
  console.log("   Email: admin@school.local");
  console.log("   Password: admin123");
  console.log("   Hash format: scrypt");
  console.log("\n🔒 IMPORTANT: Change this password after logging in!");
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
