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

const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const auth = betterAuth({
  secret: authSecret,
  // Keep a strict, explicit origin list to avoid "Invalid origin" errors
  // in Vercel preview/production. Order of precedence:
  // 1) AUTH_URL (manual override)
  // 2) BETTER_AUTH_URL (better-auth recommended env)
  // 3) NEXTAUTH_URL (legacy env used elsewhere)
  // 4) VERCEL_URL (auto-set by Vercel, needs https:// prefix)
  // 5) localhost fallback for local dev
  baseURL:
    process.env.AUTH_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    vercelUrl ||
    "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Using better-auth's default scrypt hashing
  },
  // User profile configuration
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  // Email verification for email change flow
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: Integrate with email service (Resend, SendGrid) in production
      // For now, log to console in development
      console.log(`📧 [Email Verification] To: ${user.email}`);
      console.log(`📧 [Email Verification] URL: ${url}`);

      // In production, you would send an actual email:
      // await sendEmail({
      //   to: user.email,
      //   subject: "ยืนยันอีเมลของคุณ",
      //   html: `<a href="${url}">คลิกที่นี่เพื่อยืนยันอีเมล</a>`
      // });
    },
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
