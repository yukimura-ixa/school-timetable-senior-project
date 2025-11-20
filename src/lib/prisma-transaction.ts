'use server'

import prisma from '@/lib/prisma'

// Derive the interactive transaction client type directly from prisma.$transaction
export type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0]

export async function withPrismaTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: Parameters<typeof prisma.$transaction>[1]
): Promise<T> {
  return prisma.$transaction((tx: any) => fn(tx), options)
}
