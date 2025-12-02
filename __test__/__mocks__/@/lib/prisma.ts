/**
 * Manual mock for @/lib/prisma
 * Used in unit tests to mock Prisma client
 */
import { vi } from "vitest";

export const mockFindMany = vi.fn();

const mockPrisma = {
  schedule: {
    findMany: mockFindMany,
  },
};

export default mockPrisma;
