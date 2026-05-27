import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the test env that nulls PRISMA_DATABASE_URL/ACCELERATE_URL and forces
// the local docker postgres on :5433 (see prisma seed-publish-happy guard).
const envPath = path.resolve(__dirname, ".env.test");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const LOCAL_DB =
  "postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public";

function isDockerAvailable(): boolean {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function isDatabaseRunning(): boolean {
  try {
    const out = execSync(
      'docker ps --filter "name=timetable-test-db" --format "{{.Status}}"',
      { encoding: "utf-8" },
    );
    return out.trim().startsWith("Up");
  } catch {
    return false;
  }
}

async function waitForDatabase(maxAttempts = 30): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync("docker exec timetable-test-db pg_isready -U test_user", {
        stdio: "ignore",
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

/**
 * Isolated setup for the clean-publish happy-path suite (task kjm).
 * Brings up the local docker postgres, applies migrations, then TRUNCATEs and
 * seeds a tiny globally-MOE-compliant world. Deliberately does NOT run the
 * 18-grade demo seed — that world can never be "ready".
 */
async function globalSetup() {
  console.log("\n🔧 publish-happy E2E setup\n");

  const isCI = process.env.CI === "true";
  if (!isCI && process.env.SKIP_DB_LIFECYCLE !== "true" && isDockerAvailable()) {
    if (isDatabaseRunning()) {
      console.log("ℹ️  Reusing running test database");
    } else {
      console.log("🐘 Starting test database container...");
      execSync("docker compose -f docker-compose.test.yml up -d", {
        stdio: "inherit",
      });
      const ready = await waitForDatabase();
      if (!ready) throw new Error("Database failed to start within timeout");
    }

    if (process.env.SKIP_MIGRATIONS !== "true") {
      console.log("📦 Applying migrations...");
      execSync("pnpm prisma migrate deploy", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: LOCAL_DB },
      });
    }
  }

  console.log("🌱 Seeding minimal publish-happy world...");
  execSync(
    "pnpm exec dotenv -e .env.test.local -- tsx prisma/seed-publish-happy.ts",
    { stdio: "inherit", env: { ...process.env } },
  );
  console.log("\n✅ publish-happy environment ready\n");
}

export default globalSetup;
