/**
 * Production Admin Seeding Script
 *
 * Safely initializes the admin user in the production database using the
 * same Better Auth flow as the main seed script (password is properly hashed
 * and Account records are created automatically).
 *
 * Usage (from Vercel or local):
 *   pnpm exec tsx scripts/seed-prod-admin.ts
 *
 * Environment variables (fallbacks match db-backup.ts):
 *   - DATABASE_URL (or POSTGRES_PRISMA_URL / POSTGRES_URL / POSTGRES_URL_NON_POOLING)
 *   - SEED_ADMIN_PASSWORD (recommended in production)
 */

/* eslint-disable no-console */

import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

const root = process.cwd();
const envPaths = [
  path.join(root, ".env.local"),
  path.join(root, ".env.vercel.local"),
  path.join(root, ".env.vercel"),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) dotenv.config({ path: p });
}

if (!process.env.DATABASE_URL) {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter(Boolean) as string[];

  if (candidates.length > 0) {
    process.env.DATABASE_URL = candidates[0];
  }
}

if (!process.env.DATABASE_URL) {
  console.error("❌ Missing DATABASE_URL. Please set it before running.");
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL || "admin@school.local";
const adminPassword =
  process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "admin123";
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && (!process.env.SEED_ADMIN_PASSWORD || adminPassword === "admin123")) {
  console.error(
    "🔒 SECURITY: Set SEED_ADMIN_PASSWORD to a strong password before running in production."
  );
  process.exit(1);
}

async function seedProdAdmin() {
  const [{ default: prisma }, { auth }] = await Promise.all([
    import("../src/lib/prisma"),
    import("../src/lib/auth.js"),
  ]);

  try {
    console.log("\n🔍 Checking for existing admin user...");
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log("✅ Admin user already exists:");
      console.log(`   - ID: ${existing.id}`);
      console.log(
        `   - Email verified: ${existing.emailVerified ? "Yes" : "No"}`
      );
      return;
    }

    console.log("✨ Creating admin user via Better Auth...");
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "System Administrator",
      },
    });

    if (!signUpResult || !signUpResult.user) {
      throw new Error("Failed to create admin user via Better Auth API");
    }

    await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: {
        role: "admin",
        emailVerified: true,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   - ID: ${signUpResult.user.id}`);
    console.log(`   - Email: ${adminEmail}`);
    console.log("\n🔐 Credentials:");
    console.log(`   - Email: ${adminEmail}`);
    console.log("   - Password: <hidden>");
    console.log(
      "\n⚠️  IMPORTANT: Store the password securely and rotate after first login."
    );
  } catch (error) {
    console.error("❌ Error seeding admin user:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n✨ Done!");
  }
}

void seedProdAdmin();
