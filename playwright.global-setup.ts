import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables (ensure AUTH_SECRET precedence for stable JWT decryption)
const testEnvPath = path.resolve(__dirname, ".env.test");
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

// Force AUTH_SECRET explicitly into process.env (Issue #62)
if (process.env.AUTH_SECRET) {
  process.stdout.write(
    `🔐 Using AUTH_SECRET from .env.test (length=${process.env.AUTH_SECRET.length})\n`,
  );
} else {
  process.stdout.write(
    "⚠️  AUTH_SECRET not found in .env.test; tests may log JWT warnings.\n",
  );
}

// Load .env.local for DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  const envLocalPath = path.resolve(__dirname, ".env.local");
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  }
}

/**
 * Check if Docker is available
 */
function isDockerAvailable(): boolean {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if test database is running
 */
function isDatabaseRunning(): boolean {
  try {
    const result = execSync(
      'docker ps --filter "name=timetable-test-db" --format "{{.Status}}"',
      {
        encoding: "utf-8",
      },
    );
    return result.trim().startsWith("Up");
  } catch {
    return false;
  }
}

/**
 * Wait for database to be ready
 */
async function waitForDatabase(maxAttempts = 30): Promise<boolean> {
  console.log("⏳ Waiting for database to be ready...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync("docker exec timetable-test-db pg_isready -U test_user", {
        stdio: "ignore",
      });
      console.log("✅ Database is ready!\n");
      return true;
    } catch {
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (attempt % 5 === 0) {
          console.log(`   Still waiting... (${attempt}/${maxAttempts})`);
        }
      }
    }
  }

  return false;
}

/**
 * Global setup for E2E tests with automatic Docker Compose lifecycle management
 * Runs before all tests to prepare the database
 */
async function globalSetup() {
  console.log("\n🔧 E2E Test Setup: Initializing test environment...\n");

  // Verify .env.local was created by prepare-e2e-env script
  const envLocalPath = path.resolve(__dirname, ".env.local");
  if (!fs.existsSync(envLocalPath)) {
    console.warn(
      "⚠️  .env.local not found - run `node scripts/prepare-e2e-env.js` first\n",
    );
  }

  // Surface key auth-related env for debugging (masked)
  if (process.env.AUTH_SECRET) {
    console.log(
      "   AUTH_SECRET checksum:",
      Buffer.from(process.env.AUTH_SECRET).toString("base64").slice(0, 8) + "…",
    );
  }

  // Auto-disable Docker management in CI; GitHub Actions provides a Postgres service
  const isCI = process.env.CI === "true";
  const autoManageDb =
    !isCI &&
    process.env.AUTO_MANAGE_TEST_DB !== "false" &&
    process.env.SKIP_DB_LIFECYCLE !== "true";
  // Quick fallback: if Docker is unavailable and we only need UI smoke (e.g. teacher dropdown #118), allow skip via FAST_UI_ONLY
  const fastUiOnly = process.env.FAST_UI_ONLY === "true";
  const skipDbSeed =
    process.env.SKIP_DB_SEED === "true" || process.env.FAST_UI_ONLY === "true";
  const isDocker = isDockerAvailable();
  if (isCI) {
    console.log(
      "🏁 CI detected - disabling Docker DB management (using service container)",
    );
  }

  // Check if we should manage the test database
  if (fastUiOnly) {
    console.log(
      "🚀 FAST_UI_ONLY enabled - skipping database startup for UI selector validation\n",
    );
  } else if (autoManageDb && isDocker) {
    console.log("🐳 Docker Compose lifecycle management: ENABLED\n");

    const isRunning = isDatabaseRunning();

    if (isRunning) {
      console.log("ℹ️  Test database is already running");
      console.log("   Reusing existing database instance\n");
    } else {
      console.log("🐘 Starting test database container...");
      try {
        execSync("docker compose -f docker-compose.test.yml up -d", {
          stdio: "inherit",
        });

        // Mark that we started the database (for cleanup)
        process.env.MANAGED_TEST_DB = "true";

        // Wait for database to be ready
        const ready = await waitForDatabase();
        if (!ready) {
          throw new Error("Database failed to start within timeout period");
        }
      } catch (error) {
        console.error("❌ Failed to start test database:", error);
        throw error;
      }
    }

    // Run migrations unless explicitly skipped (e.g., when using db push locally)
    if (process.env.SKIP_MIGRATIONS === "true") {
      console.log("⏭️  Skipping migrations (SKIP_MIGRATIONS=true)");
    } else {
      console.log("?? Running database migrations...");
      execSync("pnpm prisma migrate deploy", {
        stdio: "inherit",
        env: {
          ...process.env,
          DATABASE_URL:
            "postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public",
        },
      });
      console.log("? Migrations completed\n");
    }
  } else if (!isDocker) {
    console.log("⚠️  Docker not available - assuming external database");
    console.log("ℹ️  Skipping automatic database lifecycle management\n");
  } else {
    console.log(
      "ℹ️  Automatic database management disabled (AUTO_MANAGE_TEST_DB=false)",
    );
    console.log("ℹ️  Assuming database is managed externally\n");
  }

  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.log("⚠️  No DATABASE_URL found - skipping database seeding");
    console.log("ℹ️  Tests will run with dev bypass only (no database)\n");
    return;
  }

  if (skipDbSeed) {
    console.log(
      "⚡ Skipping database seed (FAST_UI_ONLY or SKIP_DB_SEED=true). Proceeding without seed.\n",
    );
    return; // Exit early; tests rely on dev bypass/mock session
  }

  // Wait for dev server to be ready before seeding
  // This ensures the server has compiled and is ready to accept requests
  const maxServerAttempts = 10;
  let serverReady = false;
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3005";

  console.log("⏳ Waiting for dev server to be ready...\n");

  for (let attempt = 1; attempt <= maxServerAttempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/api/health/db`);
      if (response.ok) {
        serverReady = true;
        console.log("✅ Dev server is ready!\n");
        break;
      }
    } catch {
      if (attempt < maxServerAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (attempt % 3 === 0) {
          console.log(`   Still waiting... (${attempt}/${maxServerAttempts})`);
        }
      }
    }
  }

  if (!serverReady) {
    console.warn(
      "⚠️  Dev server did not respond to health check - attempting to seed anyway\n",
    );
  }

  console.log("🌱 Seeding test database...\n");

  // Clear any residual auth/session cookies between prior runs to avoid mismatched JWT secrets.
  // (Playwright per-test isolation will also help; this is proactive.)
  try {
    const storageStatePath = path.resolve(__dirname, "playwright/.auth");
    if (fs.existsSync(storageStatePath)) {
      fs.rmSync(storageStatePath, { recursive: true, force: true });
      console.log("🧹 Cleared cached Playwright auth storage state");
    }
  } catch (err) {
    console.warn("⚠️  Failed to clear cached auth storage state:", err);
  }

  try {
    // Set environment variable for test mode seeding
    process.env.SEED_FOR_TESTS = "true";

    // Use test:db:seed command which properly loads .env.test via dotenv
    // This ensures DATABASE_URL and other test env vars are available to seed script
    console.log(
      "🌱 Running test database seed with .env.test configuration...",
    );

    execSync("pnpm test:db:seed", {
      stdio: "inherit",
      env: {
        ...process.env,
        SEED_FOR_TESTS: "true",
      },
    });

    console.log("\n✅ Test environment ready!\n");
    console.log("   Database: postgresql://localhost:5433/test_timetable");
    console.log("   Tests: 27 E2E tests ready to run\n");
  } catch (error) {
    console.error("\n❌ Failed to seed database for E2E tests:", error);
    throw error;
  }
}

export default globalSetup;
