#!/usr/bin/env tsx
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load prod env files in priority order
const root = process.cwd();
const envPaths = [
  path.join(root, ".env.local"),
  path.join(root, ".env.vercel.local"),
  path.join(root, ".env.vercel"),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) dotenv.config({ path: p });
}

// Map common Vercel Postgres vars to DATABASE_URL if needed
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

const checkAdmin = async () => {
  // Dynamic import after env to avoid init error
  const { default: prisma } = await import("../src/lib/prisma.js");
  try {
    console.log("🔍 Checking production admin user...");
    
    const admin = await prisma.user.findUnique({
      where: { email: "admin@school.local" },
      include: { accounts: true },
    });

    if (!admin) {
      console.log("❌ No admin user found in production database!");
      console.log("   Email: admin@school.local");
      return;
    }

    console.log("✅ Admin user found:");
    console.log("   ID:", admin.id);
    console.log("   Email:", admin.email);
    console.log("   Name:", admin.name);
    console.log("   Role:", admin.role);
    console.log("   Email Verified:", admin.emailVerified);
    console.log("   Created:", admin.createdAt);
    console.log("   Accounts:", admin.accounts.length);
    
    if (admin.accounts.length > 0) {
      console.log("   Account providers:", admin.accounts.map(a => a.providerId).join(", "));
    }

    console.log("\n📝 Try logging in with:");
    console.log("   Email: admin@school.local");
    console.log("   Password: (from SEED_ADMIN_PASSWORD or 'admin123' if using default)");
  } catch (error) {
    console.error("❌ Error checking admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
