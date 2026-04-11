#!/usr/bin/env node
/**
 * Prepare environment for E2E tests (Issue #4 - HIGH-01)
 *
 * This script copies .env.test to .env.local and .env.test.local BEFORE
 * Playwright starts the Next.js dev server, ensuring the test environment
 * variables are loaded correctly by Next.js (which prioritizes .env.local over .env).
 *
 * IMPORTANT: Keep auth URLs aligned with the default local test port (3000).
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envTestPath = path.resolve(__dirname, "../.env.test");
const envLocalPath = path.resolve(__dirname, "../.env.local");
const envTestLocalPath = path.resolve(__dirname, "../.env.test.local");

try {
  // Kill any existing Next.js dev server to ensure fresh env load
  try {
    // On Windows, kill node processes running next dev
    if (process.platform === "win32") {
      execSync(
        'taskkill /F /IM node.exe /FI "WINDOWTITLE eq *next dev*" 2>nul',
        { stdio: "ignore" },
      );
    } else {
      execSync('pkill -f "next dev"', { stdio: "ignore" });
    }
    console.log("├ Killed existing Next.js dev server (if any)");
  } catch {
    // Ignore errors if no process was running
  }

  if (fs.existsSync(envTestPath)) {
    fs.copyFileSync(envTestPath, envLocalPath);
    console.log("✅ Copied .env.test to .env.local for E2E tests");

    // Also sync .env.test.local to ensure port consistency
    fs.copyFileSync(envTestPath, envTestLocalPath);
    console.log("✅ Copied .env.test to .env.test.local (ensuring default port)");
  } else {
    console.warn("⚠️  .env.test not found - tests may fail");
  }

  // Validate default port (3000) is used in auth URLs
  const envContent = fs.readFileSync(envTestPath, "utf8");
  const urlPatterns = [
    /^BETTER_AUTH_URL=.*:(\d+)/m,
    /^AUTH_URL=.*:(\d+)/m,
    /^BASE_URL=.*:(\d+)/m,
  ];
  let hasWrongPort = false;
  urlPatterns.forEach((pattern) => {
    const match = envContent.match(pattern);
    if (match && match[1] !== "3000") {
      console.warn(`⚠️  Found port ${match[1]} instead of 3000 in .env.test`);
      hasWrongPort = true;
    }
  });
  if (!hasWrongPort) {
    console.log("✅ All auth URLs use port 3000");
  }
} catch (error) {
  console.error("❌ Failed to prepare E2E environment:", error);
  process.exit(1);
}
