import { PrismaClient } from '@/prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  console.log('[PRISMA] Connecting to DB:', connectionString.replace(/:[^:@]+@/, ':****@'))
  const adapter = new PrismaPg({
    connectionString,
  })

  return new PrismaClient({
    adapter,
  }).$extends(withAccelerate())
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
