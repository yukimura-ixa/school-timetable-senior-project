// Setup for DB-backed integration tests.
//
// Unlike vitest.setup.ts, this deliberately does NOT mock "@/lib/prisma":
// these tests run against the real seeded database (the CI "Integration Tests"
// job, or a local docker test DB). It keeps only the environment + Next.js
// Cache Components globals that code paths under test may touch.
import { vi, beforeEach } from "vitest";
import dotenv from "dotenv";

// Load test env files if present. In CI the job sets DATABASE_URL directly, and
// dotenv does not override already-set process.env values, so the real seeded
// connection string wins.
dotenv.config({ path: [".env.test.local", ".env.test"] });

process.env.AUTH_SECRET ??=
  "test-secret-at-least-32-characters-long-for-testing";
process.env.BETTER_AUTH_SECRET ??=
  "test-secret-at-least-32-characters-long-for-testing";

declare global {
  // eslint-disable-next-line no-var
  var cacheTag: ReturnType<typeof vi.fn>;
  // eslint-disable-next-line no-var
  var cacheLife: ReturnType<typeof vi.fn>;
}

global.cacheTag = vi.fn(() => {});
global.cacheLife = vi.fn(() => {});

beforeEach(() => {
  vi.clearAllMocks();
});

if (process.stdout.setEncoding) process.stdout.setEncoding("utf8");
if (process.stderr.setEncoding) process.stderr.setEncoding("utf8");
