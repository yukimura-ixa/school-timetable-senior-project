#!/usr/bin/env node

/**
 * E2E Test Runner with Automatic Database Lifecycle Management
 *
 * This script wraps Playwright test execution with automatic Docker Compose
 * lifecycle management for the test database.
 *
 * Usage:
 *   node scripts/run-e2e-tests.mjs [playwright-args]
 *
 * Examples:
 *   node scripts/run-e2e-tests.mjs                    # Run all tests
 *   node scripts/run-e2e-tests.mjs --ui               # Run with UI mode
 *   node scripts/run-e2e-tests.mjs --headed           # Run headed mode
 *   node scripts/run-e2e-tests.mjs e2e/01-*.spec.ts  # Run specific test
 *
 * Environment Variables:
 *   AUTO_MANAGE_TEST_DB=false  - Disable automatic database management
 *   SKIP_DB_CLEANUP=true       - Keep database running after tests
 */

import { execSync, spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function isDockerAvailable() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isDatabaseRunning() {
  try {
    const result = execSync(
      'docker ps --filter "name=timetable-test-db" --format "{{.Status}}"',
      {
        encoding: "utf-8",
        cwd: projectRoot,
      },
    );
    return result.trim().startsWith("Up");
  } catch {
    return false;
  }
}

async function startDatabase() {
  log("\n🐘 Starting test database container...", "cyan");

  try {
    execSync("docker compose -f docker-compose.test.yml up -d", {
      stdio: "inherit",
      cwd: projectRoot,
    });

    log("⏳ Waiting for database to be ready...", "yellow");

    // Wait for database
    const maxAttempts = 30;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        execSync("docker exec timetable-test-db pg_isready -U test_user", {
          stdio: "ignore",
          cwd: projectRoot,
        });
        log("✅ Database is ready!\n", "green");
        return true;
      } catch {
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (attempt % 5 === 0) {
            log(`   Still waiting... (${attempt}/${maxAttempts})`, "gray");
          }
        }
      }
    }

    log("❌ Database failed to start within timeout", "red");
    return false;
  } catch (error) {
    log(`❌ Failed to start database: ${error.message}`, "red");
    return false;
  }
}

function stopDatabase() {
  log("\n🛑 Stopping test database...", "cyan");

  try {
    execSync("docker compose -f docker-compose.test.yml down", {
      stdio: "inherit",
      cwd: projectRoot,
    });
    log("✅ Test database stopped\n", "green");
  } catch (error) {
    log(`⚠️  Failed to stop database: ${error.message}`, "yellow");
  }
}

function runPlaywright(args) {
  return new Promise((resolve) => {
    log("\n🎭 Starting Playwright tests...\n", "cyan");

    const playwrightArgs = ["exec", "playwright", "test", ...args];
    const child = spawn("pnpm", playwrightArgs, {
      stdio: "inherit",
      cwd: projectRoot,
      shell: true,
    });

    child.on("close", (code) => {
      resolve(code);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const autoManage = process.env.AUTO_MANAGE_TEST_DB !== "false";
  const skipCleanup = process.env.SKIP_DB_CLEANUP === "true";

  let dbWasStarted = false;
  let exitCode = 0;

  try {
    log("\n🚀 E2E Test Runner with Automatic Database Management\n", "cyan");

    // Kill any existing dev server
    log("🔄 Killing any existing dev server on port 3000...", "cyan");
    try {
      execSync("node scripts/kill-dev-server.mjs", {
        stdio: "inherit",
        cwd: projectRoot,
      });
    } catch (error) {
      log("⚠️  Could not kill existing server (may not be running)", "yellow");
    }

    // Check Docker availability
    if (!isDockerAvailable()) {
      log("⚠️  Docker not available", "yellow");
      log("ℹ️  Assuming external database management\n", "gray");
    } else if (autoManage) {
      // Check if database is already running
      const isRunning = isDatabaseRunning();

      if (isRunning) {
        log("ℹ️  Test database is already running", "gray");
        log("   Reusing existing instance\n", "gray");
      } else {
        // Start database
        const started = await startDatabase();
        if (!started) {
          log("⚠️  Failed to start Docker database", "yellow");
          log("ℹ️  Attempting to use local PostgreSQL instead...", "gray");
          log(
            "   Make sure local PostgreSQL is running with test_timetable database\n",
            "gray",
          );
          // Don't exit - allow tests to try local database
        } else {
          dbWasStarted = true;
        }
      }
    } else {
      log("ℹ️  Automatic database management disabled", "gray");
      log("   (AUTO_MANAGE_TEST_DB=false)\n", "gray");
    }

    // Run Playwright tests
    exitCode = await runPlaywright(args);

    // Show test summary
    if (exitCode === 0) {
      log("\n✅ All tests passed!\n", "green");
    } else {
      log(`\n⚠️  Tests completed with exit code: ${exitCode}\n`, "yellow");
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}\n`, "red");
    exitCode = 1;
  } finally {
    // Cleanup database if we started it
    if (dbWasStarted && !skipCleanup) {
      stopDatabase();
    } else if (dbWasStarted && skipCleanup) {
      log("\nℹ️  Keeping database running (SKIP_DB_CLEANUP=true)", "gray");
      log(
        "   Stop manually with: docker compose -f docker-compose.test.yml down\n",
        "gray",
      );
    }
  }

  process.exit(exitCode);
}

main();
