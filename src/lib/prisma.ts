import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === "production") {
    // Production: Use Accelerate Extension (WASM compatible)
    // The WASM engine requires 'accelerateUrl' in the constructor options.
    const url = process.env.ACCELERATE_URL || process.env.DATABASE_URL;
    if (!url)
      throw new Error("Missing ACCELERATE_URL or DATABASE_URL in production");

    return new PrismaClient({
      accelerateUrl: url,
      log: ["error"],
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  } else {
    // Development/Test: Use Driver Adapter (pg) for local Docker/Postgres compatibility
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }
};

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
