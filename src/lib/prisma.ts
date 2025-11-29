import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const isAccelerate = connectionString.startsWith("prisma+");

  // Avoid logging raw secrets; only log protocol + host
  const safeConnection =
    connectionString.split("?")[0]?.replace(/:[^:@]+@/, ":****@") ?? "unknown";
  console.warn("[PRISMA] Connecting to DB:", safeConnection);

  // Use Prisma Accelerate (Data Proxy) when prisma+ protocol is provided
  if (isAccelerate) {
    return new PrismaClient({
      accelerateUrl: connectionString,
    }).$extends(withAccelerate());
  }

  // Fallback to direct Postgres adapter for standard URLs
  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  }).$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
