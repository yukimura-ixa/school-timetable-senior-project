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

// Ensure we have a valid auth secret
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    "Missing auth secret! Set BETTER_AUTH_SECRET or AUTH_SECRET environment variable.",
  );
}

export const auth = betterAuth({
  secret: authSecret,
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
  // Rate limiting configuration (Issue #150)
  // Enabled in production to prevent brute-force attacks
  // Disabled in development/test/CI for E2E test compatibility
  // CI check: process.env.CI is set at runtime by GitHub Actions
  rateLimit: {
    enabled: process.env.NODE_ENV === "production" && !process.env.CI,
    window: 60, // 60 second window
    max: 50, // 50 attempts per window in production (increased from 10 for visual testing)
  },
  // Enable experimental joins for 2-3x performance improvement
  experimental: {
    joins: true,
  },
});
