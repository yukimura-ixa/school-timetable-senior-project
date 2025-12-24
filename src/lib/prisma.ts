import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV === "production") {
    // Production: Use Accelerate only when a valid Accelerate URL is provided.
    const accelerateUrl = process.env.ACCELERATE_URL;
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

    // Fallback: standard Prisma client when Accelerate isn't configured.
    return new PrismaClient({ log: ["error"] });
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
