import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load test environment variables (ensure AUTH_SECRET precedence for stable JWT decryption)
const testEnvPath = path.resolve(__dirname, '.env.test');
if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath });
}

// Force AUTH_SECRET explicitly into process.env (Issue #62)
if (process.env.AUTH_SECRET) {
  process.stdout.write(`🔐 Using AUTH_SECRET from .env.test (length=${process.env.AUTH_SECRET.length})\n`);
} else {
  process.stdout.write('⚠️  AUTH_SECRET not found in .env.test; tests may log JWT warnings.\n');
}

// Load .env.local for DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  const envLocalPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  }
}

/**
 * Check if Docker is available
 */
function isDockerAvailable(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
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
    const result = execSync('docker ps --filter "name=timetable-test-db" --format "{{.Status}}"', {
      encoding: 'utf-8',
    });
    return result.trim().startsWith('Up');
  } catch {
    return false;
  }
}

/**
 * Wait for database to be ready
 */
async function waitForDatabase(maxAttempts = 30): Promise<boolean> {
  console.log('⏳ Waiting for database to be ready...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync('docker exec timetable-test-db pg_isready -U test_user', {
        stdio: 'ignore',
      });
      console.log('✅ Database is ready!\n');
      return true;
    } catch {
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
  console.log('\n🔧 E2E Test Setup: Initializing test environment...\n');
  
  // Verify .env.local was created by prepare-e2e-env script
  const envLocalPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    console.warn('⚠️  .env.local not found - run `node scripts/prepare-e2e-env.js` first\n');
  }
  
  // Surface key auth-related env for debugging (masked)
  if (process.env.AUTH_SECRET) {
    console.log('   AUTH_SECRET checksum:', Buffer.from(process.env.AUTH_SECRET).toString('base64').slice(0, 8) + '…');
  }
  
  // Auto-disable Docker management in CI; GitHub Actions provides a Postgres service
  const isCI = process.env.CI === 'true';
  const autoManageDb = !isCI && process.env.AUTO_MANAGE_TEST_DB !== 'false';
  // Quick fallback: if Docker is unavailable and we only need UI smoke (e.g. teacher dropdown #118), allow skip via FAST_UI_ONLY
  const fastUiOnly = process.env.FAST_UI_ONLY === 'true';
  const isDocker = isDockerAvailable();
  if (isCI) {
    console.log('🏁 CI detected - disabling Docker DB management (using service container)');
  }
  
  // Check if we should manage the test database
  if (fastUiOnly) {
    console.log('🚀 FAST_UI_ONLY enabled - skipping database startup for UI selector validation\n');
  } else if (autoManageDb && isDocker) {
    console.log('🐳 Docker Compose lifecycle management: ENABLED\n');
    
    const isRunning = isDatabaseRunning();
    
    if (isRunning) {
      console.log('ℹ️  Test database is already running');
      console.log('   Reusing existing database instance\n');
    } else {
      console.log('🐘 Starting test database container...');
      try {
        execSync('docker compose -f docker-compose.test.yml up -d', {
          stdio: 'inherit',
        });
        
        // Mark that we started the database (for cleanup)
        process.env.MANAGED_TEST_DB = 'true';
        
        // Wait for database to be ready
        const ready = await waitForDatabase();
        if (!ready) {
          throw new Error('Database failed to start within timeout period');
        }
        
        // Run migrations
        console.log('📦 Running database migrations...');
        execSync('pnpm prisma migrate deploy', {
          stdio: 'inherit',
          env: {
            ...process.env,
            DATABASE_URL: 'postgresql://test_user:test_password@localhost:5433/test_timetable?schema=public',
          },
        });
        console.log('✅ Migrations completed\n');
        
      } catch (error) {
        console.error('❌ Failed to start test database:', error);
        throw error;
      }
    }
  } else if (!isDocker) {
    console.log('⚠️  Docker not available - assuming external database');
    console.log('ℹ️  Skipping automatic database lifecycle management\n');
  } else {
    console.log('ℹ️  Automatic database management disabled (AUTO_MANAGE_TEST_DB=false)');
    console.log('ℹ️  Assuming database is managed externally\n');
  }
  
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  No DATABASE_URL found - skipping database seeding');
    console.log('ℹ️  Tests will run with dev bypass only (no database)\n');
    return;
  }
  
  if (fastUiOnly) {
    console.log('⚡ FAST_UI_ONLY: Skipping database seed and proceeding with UI-only tests.\n');
    return; // Exit early; tests rely on dev bypass/mock session
  }
  console.log('🌱 Seeding test database...\n');

  // Clear any residual auth/session cookies between prior runs to avoid mismatched JWT secrets.
  // (Playwright per-test isolation will also help; this is proactive.)
  try {
    const storageStatePath = path.resolve(__dirname, 'playwright/.auth');
    if (fs.existsSync(storageStatePath)) {
      fs.rmSync(storageStatePath, { recursive: true, force: true });
      console.log('🧹 Cleared cached Playwright auth storage state');
    }
  } catch (err) {
    console.warn('⚠️  Failed to clear cached auth storage state:', err);
  }
  
  try {
    // Set environment variable for test mode seeding
    process.env.SEED_FOR_TESTS = 'true';
    
    // Use test:db:seed command which properly loads .env.test via dotenv
    // This ensures DATABASE_URL and other test env vars are available to seed script
    console.log('🌱 Running test database seed with .env.test configuration...');
    
    execSync('pnpm test:db:seed', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SEED_FOR_TESTS: 'true',
      },
    });
    
    console.log('\n✅ Test environment ready!\n');
    console.log('   Database: postgresql://localhost:5433/test_timetable');
    console.log('   Tests: 27 E2E tests ready to run\n');
    
  } catch (error) {
    console.error('\n❌ Failed to seed database for E2E tests:', error);
    throw error;
  }
}

export default globalSetup;
