/**
 * Better Auth Configuration
 *
 * Migration from Next Auth.js v5 to better-auth
 * Provides:
 * - Email/Password authentication
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
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
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
  // Enable experimental joins for 2-3x performance improvement
  experimental: {
    joins: true,
  },
});
