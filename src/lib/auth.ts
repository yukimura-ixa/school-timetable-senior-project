/**
 * Better Auth Configuration
 *
 * Migration from Next Auth.js v5 to better-auth
 * Provides:
 * - Email/Password authentication with better-auth's default scrypt hashing
 * - Google OAuth
 * - Database-backed sessions with Prisma
 * - Custom role field for authorization (admin, guest/user)
 * - Admin plugin for user management and impersonation
 *
 * @see https://www.better-auth.com/docs
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  baseURL:
    process.env.AUTH_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Using better-auth's default scrypt hashing
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    },
  },
  plugins: [
    admin({
      defaultRole: "guest",
      adminRoles: ["admin"],
    }),
  ],
  // Configure rate limiting to prevent 429 errors during E2E tests
  // The useSession hook on client makes frequent requests to /api/auth/session
  // Default: 10s window, 100 max requests
  // Increased to handle multiple simultaneous E2E test shards
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 500, // 500 requests per minute (up from default 100/10s)
    storage: "database", // Persist rate limit state across server restarts
  },
  // Enable experimental joins for 2-3x performance improvement
  experimental: {
    joins: true,
  },
});
