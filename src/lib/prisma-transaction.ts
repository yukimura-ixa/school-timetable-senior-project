'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@/prisma/generated';

export type TransactionFn<T> =
  | ((tx: Prisma.TransactionClient) => Promise<T>)
  | ((tx: Prisma.TransactionClient) => Prisma.PrismaPromise<T>);

export async function withPrismaTransaction<T>(
  fn: TransactionFn<T>,
  options?: Parameters<typeof prisma.$transaction>[1]
): Promise<T> {
  return prisma.$transaction(
    (tx) => fn(tx as unknown as Prisma.TransactionClient),
    options
  );
}
