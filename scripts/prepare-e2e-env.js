#!/usr/bin/env node
/**
 * Prepare environment for E2E tests
 *
 * This script copies .env.test to .env.local BEFORE Playwright starts
 * the Next.js dev server, ensuring the test environment variables are
 * loaded correctly by Next.js (which prioritizes .env.local over .env).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const envTestPath = path.resolve(__dirname, "../.env.test");
const envLocalPath = path.resolve(__dirname, "../.env.local");

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
  } else {
    console.warn("⚠️  .env.test not found - tests may fail");
  }
} catch (error) {
  console.error("❌ Failed to prepare E2E environment:", error);
  process.exit(1);
}
