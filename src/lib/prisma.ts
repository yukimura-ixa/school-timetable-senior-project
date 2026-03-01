import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === "production") {
    // Production: Use Accelerate when an Accelerate URL is provided.
    // Supports both ACCELERATE_URL (custom) and PRISMA_DATABASE_URL
    // (automatically injected by the Vercel Prisma Postgres integration).
    const accelerateUrl =
      process.env.ACCELERATE_URL ?? process.env.PRISMA_DATABASE_URL;
    if (accelerateUrl) {
      if (
        !accelerateUrl.startsWith("prisma://") &&
        !accelerateUrl.startsWith("prisma+postgres://")
      ) {
        throw new Error(
          "ACCELERATE_URL must start with prisma:// or prisma+postgres://",
        );
      }

      return new PrismaClient({
        accelerateUrl,
        log: ["error"],
      }).$extends(withAccelerate()) as unknown as PrismaClient;
    }

    // Fallback: use adapter with direct database connection.
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL in production");
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: ["error"],
    });
  } else {
    // Development/Test: Prefer Accelerate when an Accelerate URL is provided.
    const connectionString = process.env.DATABASE_URL;
    const accelerateUrl =
      process.env.ACCELERATE_URL ??
      process.env.PRISMA_DATABASE_URL ??
      (connectionString &&
      (connectionString.startsWith("prisma://") ||
        connectionString.startsWith("prisma+postgres://"))
        ? connectionString
        : undefined);

    if (accelerateUrl) {
      if (
        !accelerateUrl.startsWith("prisma://") &&
        !accelerateUrl.startsWith("prisma+postgres://")
      ) {
        throw new Error(
          "ACCELERATE_URL must start with prisma:// or prisma+postgres://",
        );
      }

      return new PrismaClient({
        accelerateUrl,
        log: ["query", "info", "warn", "error"],
      }).$extends(withAccelerate()) as unknown as PrismaClient;
    }

    // Fallback: use direct database connection (pg adapter).
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL in development");
    }
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
