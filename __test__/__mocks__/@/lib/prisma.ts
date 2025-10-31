/**
 * Manual mock for @/lib/prisma
 * Used in unit tests to mock Prisma client
 */

export const mockFindMany = jest.fn();

const mockPrisma = {
  schedule: {
    findMany: mockFindMany,
  },
};

export default mockPrisma;
