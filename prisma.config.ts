import { config as loadEnv } from "dotenv";

// Next.js reads .env.local before .env; mirror that so `prisma generate`
// (postinstall) and `prisma migrate` see the same DATABASE_URL as `next dev`.
// dotenv never overrides vars already in process.env, so CI/E2E injection wins.
loadEnv({ path: [".env.local", ".env"], quiet: true });
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: `tsx prisma/seed.ts`,
  },
  // engine: 'classic',
  datasource: {
    url: env("DATABASE_URL"),
  },
});
