/* eslint-disable no-console */
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

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

const connectionString = process.env.DATABASE_URL;
const isAccelerate = connectionString.startsWith("prisma+");

let prisma: PrismaClient;

if (isAccelerate) {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    accelerateUrl: connectionString,
  }).$extends(withAccelerate()) as unknown as PrismaClient;
} else {
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    adapter,
  });
}

async function main() {
  try {
    console.log("🔍 Looking for admin user...");
    const admin = await prisma.user.findUnique({
      where: { email: "admin@school.local" },
    });

    if (admin) {
      console.log("🗑️  Deleting existing admin user...");
      // Delete related Account records first
      await prisma.account.deleteMany({
        where: { userId: admin.id },
      });
      // Delete the user
      await prisma.user.delete({
        where: { id: admin.id },
      });
      console.log("✅ Admin user deleted");
    } else {
      console.log("ℹ️  No existing admin user found");
    }

    console.log("✨ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
