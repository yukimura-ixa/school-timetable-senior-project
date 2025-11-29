import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

export const TEST_PATH_IGNORE_PATTERNS = [
  "/node_modules/",
  "/.next/",
  "/e2e/",
  "/__test__/stores/", // Skip until React 19 + Testing Library compatible (Issue #53)
  "/__test__/integration/", // Skip until converted to E2E tests (Issue #55)
  "/__test__/features/teaching-assignment/teaching-assignment\\.repository\\.test\\.ts", // Covered by heavy Playwright regression workflow
  "/__test__/features/teaching-assignment/teacher-validation\\.service\\.test\\.ts", // Duplicated by dedicated heavysuite run
  "/__test__/component/PDFCustomizationDialog\\.test\\.tsx", // Skipped: Next 16 + Jest recursion
  "/__test__/features/conflict/",
  "/__test__/features/program/",
  "/src/features/schedule-arrangement/",
  "/__test__/moe-standards/",
  "/__test__/features/dashboard/",
  "/__test__/features/lock/",
  "/__test__/lib/feature-flags\\.test\\.ts",
  "/__test__/config/",
  "/__test__/seed-validation\\.test\\.ts",
  "/__test__/features/room/",
  "/__test__/features/semester/",
  "/__test__/management-server-actions\\.test\\.ts",
];

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config: Config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],

  // Coverage provider (v8 is faster than babel)
  coverageProvider: "v8",
  setupFiles: ["<rootDir>/jest.polyfills.ts"],

  // Test environment
  // Use 'jsdom' for client components, 'node' for server components
  // Per-file override available via @jest-environment docblock
  testEnvironment: "jest-environment-node",

  // Parallel execution optimization
  // Use 50% of available CPU cores for better CI performance
  // In CI: typically 2 cores available, so uses 1 worker
  // Locally: e.g., 8 cores = 4 workers for faster test execution
  maxWorkers: "50%",

  // Module name mapper for path aliases
  // Match tsconfig.json paths configuration
  moduleNameMapper: {
    "^next-auth$": "<rootDir>/__mocks__/next-auth.js",
    "^@auth/core$": "<rootDir>/__mocks__/@auth/core.js",
    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

    // Handle image imports
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i":
      "<rootDir>/__mocks__/fileMock.js",

    // Handle module aliases from tsconfig.json paths
    "^@/public/(.*)$": "<rootDir>/public/$1",
    "^@/prisma/generated/client$": "<rootDir>/prisma/generated/client",
    "^@/prisma/generated$": "<rootDir>/app/generated/prisma",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Exclude E2E tests - these should be run with Playwright test runner
  testPathIgnorePatterns: TEST_PATH_IGNORE_PATTERNS,

  // Transform patterns - allow ESM modules from @auth and @prisma to be transformed
  transformIgnorePatterns: [
    "/node_modules/(?!.*(?:next-auth|@auth|@prisma))",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  // Force Jest to exit after all tests complete
  // Workaround for Next.js 16 + Jest incompatibility causing stack overflow
  // See: nextjs_16_jest_stack_overflow_issue memory for details (Issue #46)
  forceExit: true,

  // Detect async operations that prevent Jest from exiting cleanly
  detectOpenHandles: true,

  // Recycle workers that exceed 20% of system memory
  // Helps prevent memory leaks in long-running test suites (CI environments)
  workerIdleMemoryLimit: 0.2,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
