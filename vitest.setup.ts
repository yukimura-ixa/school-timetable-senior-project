// Vitest Setup - Mock Next.js 16 Cache Components
// This file provides mocks for Next.js 16 features that aren't available in the Vitest test environment
import { vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";

// Set required environment variables for tests
process.env.AUTH_SECRET = "test-secret-at-least-32-characters-long-for-testing";
process.env.BETTER_AUTH_SECRET = "test-secret-at-least-32-characters-long-for-testing";

// Mock Next.js Cache Components APIs
// These are only called in tests; production code uses real implementations
declare global {
  // eslint-disable-next-line no-var
  var cacheTag: ReturnType<typeof vi.fn>;
  // eslint-disable-next-line no-var
  var cacheLife: ReturnType<typeof vi.fn>;
}

global.cacheTag = vi.fn(() => {});
global.cacheLife = vi.fn(() => {});

// Mock next/image to avoid Next.js Image component issues in tests
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    // Use React.createElement to return a proper React element
    return React.createElement("img", { src, alt: alt || "", ...rest });
  },
}));

// Mock Prisma client globally for all tests
// This prevents real database connections during unit tests
vi.mock("@/lib/prisma", () => {
  const createMockPrismaClient = () => ({
    // Add mock implementations for Prisma models as needed
    teacher: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    gradelevel: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    subject: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    room: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    timeslot: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      count: vi.fn(),
    },
    class_schedule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    teachers_responsibility: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    table_config: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    program: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    emailOutbox: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((callback: (tx: unknown) => unknown) => {
      // For transaction mocks, individual tests should override this
      return callback({});
    }),
  });

  return {
    default: createMockPrismaClient(),
  };
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Fix UTF-8 encoding for terminal output (Thai characters)
if (process.stdout.setEncoding) {
  process.stdout.setEncoding("utf8");
}
if (process.stderr.setEncoding) {
  process.stderr.setEncoding("utf8");
}

// Suppress console warnings during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   warn: vi.fn(),
// };
