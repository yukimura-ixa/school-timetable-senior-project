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
import { sendEmail } from "@/lib/mailer";

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

function redactVerificationUrlForOutbox(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.username = "";
    parsed.password = "";
    parsed.hash = "";

    // Redact tokens in query params.
    for (const key of parsed.searchParams.keys()) {
      parsed.searchParams.set(key, "<redacted>");
    }

    // Defensive: also redact long token-like segments in the path.
    parsed.pathname = parsed.pathname.replace(/[A-Za-z0-9_-]{20,}/g, "<redacted>");

    return parsed.toString();
  } catch {
    return "<redacted>";
  }
}

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
    expiresIn: 60 * 60, // seconds
    sendVerificationEmail: async ({ user, url }, request) => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Persist to outbox for admin-only visibility (do not log URL/token).
      let outbox;
      try {
        const verificationUrlForOutbox =
          process.env.NODE_ENV === "production"
            ? redactVerificationUrlForOutbox(url)
            : url;

        outbox = await prisma.emailOutbox.create({
          data: {
            kind: "EMAIL_VERIFICATION",
            userId: user.id,
            toEmail: user.email,
            subject: "ยืนยันอีเมลของคุณ",
            verificationUrl: verificationUrlForOutbox,
            expiresAt,
          },
        });
      } catch (err) {
        console.error("[Auth] Failed to create email outbox entry:", err);
        // Continue anyway - email will still be sent if SMTP is configured
        return;
      }

      const text =
        `กรุณาคลิกลิงก์เพื่อยืนยันอีเมลของคุณ:\n\n${url}\n\n` +
        `ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง`;
      const html =
        `<p>กรุณาคลิกลิงก์เพื่อยืนยันอีเมลของคุณ:</p>` +
        `<p><a href="${url}">ยืนยันอีเมล</a></p>` +
        `<p>ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>`;

      const sendPromise = (async () => {
        if (!outbox) return; // Outbox creation failed, skip email send

        const res = await sendEmail({
          to: user.email,
          subject: "ยืนยันอีเมลของคุณ",
          text,
          html,
        });

        if (res.success) {
          try {
            await prisma.emailOutbox.update({
              where: { id: outbox.id },
              data: {
                status: "SENT",
                providerMessageId: res.messageId ?? null,
                lastError: null,
              },
            });
          } catch (err) {
            console.error("[Auth] Failed to update outbox status (SENT):", err);
          }
          return;
        }

        const status =
          res.error.includes("not configured") ? "SKIPPED" : "FAILED";
        try {
          await prisma.emailOutbox.update({
            where: { id: outbox.id },
            data: {
              status,
              lastError: res.error.slice(0, 500),
            },
          });
        } catch (err) {
          console.error("[Auth] Failed to update outbox status (FAILED/SKIPPED):", err);
        }
      })();

      const maybeWaitUntil = (
        request as unknown as { waitUntil?: (p: Promise<unknown>) => void }
      )?.waitUntil;
      if (typeof maybeWaitUntil === "function") {
        maybeWaitUntil(sendPromise);
      } else {
        void sendPromise;
      }
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
