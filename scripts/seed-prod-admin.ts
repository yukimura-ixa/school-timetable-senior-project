/**
 * Production Admin Seeding Script
 * 
 * This script safely initializes the admin user in the production database.
 * It uses Prisma Accelerate for secure connection to prod Postgres.
 * 
 * Usage (from Vercel):
 * 1. Set environment variables:
 *    - POSTGRES_PRISMA_URL (for Accelerate)
 *    - DATABASE_URL (for direct connection)
 * 
 * 2. Run: pnpm exec tsx scripts/seed-prod-admin.ts
 * 
 * This is idempotent - it will:
 * - Create admin user if it doesn't exist
 * - Skip if admin@school.local already exists
 * - NOT delete any existing data
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const requiredEnv = ["DATABASE_URL"];

// Validate environment
const missingEnv = requiredEnv.filter((e) => !process.env[e]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnv.join(", ")}`);
  console.error("\nFor local use, ensure .env.local contains DATABASE_URL");
  console.error(
    "For production, set DATABASE_URL via Vercel environment variables"
  );
  process.exit(1);
}

async function seedProdAdmin() {
  let pool: Pool | null = null;
  let prisma: PrismaClient | null = null;

  try {
    // Create Postgres connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Test connection
    console.log("🔗 Testing database connection...");
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("✅ Database connection successful");

    // Create Prisma client with adapter
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });

    // Check if admin already exists
    console.log("\n🔍 Checking for existing admin user...");
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@school.local" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists (admin@school.local)");
      console.log(`   - ID: ${existingAdmin.id}`);
      console.log(
        `   - Email verified: ${existingAdmin.emailVerified ? "Yes" : "No"}`
      );
      return;
    }

    // Create admin user using Better Auth method
    // Password hash for "admin123" (bcrypt)
    const passwordHash =
      "$2b$10$e4sR0cHuDZA7fS4EH1Z0heUGvVLJ6Lg/VXtd3fLZ1Y5YZvbWJ0cZa"; // bcrypt of "admin123"

    console.log("✨ Creating admin user...");
    const newAdmin = await prisma.user.create({
      data: {
        id: "admin-user-001",
        email: "admin@school.local",
        emailVerified: true,
        name: "System Administrator",
        password: passwordHash, // Hashed password for admin123
        accounts: {},
        sessions: [],
        authenticators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   - ID: ${newAdmin.id}`);
    console.log(`   - Email: ${newAdmin.email}`);
    console.log(`   - Email verified: Yes`);
    console.log(`   - Name: ${newAdmin.name}`);
    console.log("\n🔐 Admin credentials:");
    console.log("   - Email: admin@school.local");
    console.log("   - Password: admin123");
    console.log(
      "\n⚠️  IMPORTANT: Change the password immediately in production!"
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
    // Cleanup
    if (prisma) {
      await prisma.$disconnect();
    }
    if (pool) {
      await pool.end();
    }
    console.log("\n✨ Done!");
  }
}

// Run the seeding
seedProdAdmin();
