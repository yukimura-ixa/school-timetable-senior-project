#!/usr/bin/env node

/**
 * Generate BETTER_AUTH_SECRET
 *
 * Creates a cryptographically secure random secret for better-auth.
 * This secret is used for:
 * - Session cookie signing
 * - Token encryption
 * - CSRF protection
 *
 * Usage:
 *   node scripts/generate-auth-secret.js
 *
 * For CI/Production:
 *   gh secret set BETTER_AUTH_SECRET --body "$(node scripts/generate-auth-secret.js)"
 *
 * For Vercel:
 *   vercel env add BETTER_AUTH_SECRET
 *   (paste the generated value when prompted)
 *
 * @see https://www.better-auth.com/docs/installation#set-environment-variables
 */

import crypto from "crypto";

// Generate 32 random bytes and encode as base64
// This produces a ~43 character string (32 bytes * 8 bits / 6 bits per base64 char)
const secret = crypto.randomBytes(32).toString("base64");

console.log(secret);

// Also provide instructions if run interactively
if (process.stdout.isTTY) {
  console.error("\n========================================");
  console.error("✅ BETTER_AUTH_SECRET generated!");
  console.error("========================================\n");
  console.error("Add to .env.local for local development:");
  console.error(`BETTER_AUTH_SECRET="${secret}"\n`);
  console.error("Add to GitHub Secrets:");
  console.error(`  gh secret set BETTER_AUTH_SECRET --body "${secret}"\n`);
  console.error("Add to Vercel:");
  console.error("  1. Go to Project Settings → Environment Variables");
  console.error("  2. Add BETTER_AUTH_SECRET");
  console.error(`  3. Paste: ${secret}`);
  console.error("  4. Select: Production, Preview, Development");
  console.error("========================================\n");
}
