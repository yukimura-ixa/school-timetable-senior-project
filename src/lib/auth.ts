/**
 * Better Auth Configuration
 *
 * Migration from Next Auth.js v5 to better-auth
 * Provides:
 * - Email/Password authentication with scrypt hashing
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
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Use Node's native scrypt for password hashing
    // More secure than bcrypt and built into Node (no dependencies)
    password: {
      hash: async (password) => {
        const salt = randomBytes(16).toString("hex");
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${salt}:${derivedKey.toString("hex")}`;
      },
      verify: async ({ hash, password }) => {
        const [salt, key] = hash.split(":");
        if (!salt || !key) return false;
        const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
        return key === derivedKey.toString("hex");
      },
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
  // Enable experimental joins for 2-3x performance improvement
  experimental: {
    joins: true,
  },
});
