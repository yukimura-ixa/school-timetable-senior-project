import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// Load .env.local for DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  const envLocalPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  }
}

/**
 * Global setup for E2E tests
 * Runs before all tests to prepare the database
 */
async function globalSetup() {
  console.log('\n🔧 E2E Test Setup: Checking database...\n');
  
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  No DATABASE_URL found - skipping database seeding');
    console.log('ℹ️  Tests will run with dev bypass only (no database)\n');
    return;
  }
  
  console.log('✅ DATABASE_URL found - seeding database...\n');
  
  try {
    // Set environment variable for test mode seeding
    process.env.SEED_FOR_TESTS = 'true';
    
    // Run database seed
    execSync('pnpm db:seed', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SEED_FOR_TESTS: 'true',
      },
    });
    
    console.log('\n✅ Database seeded successfully for E2E tests\n');
  } catch (error) {
    console.error('\n❌ Failed to seed database for E2E tests:', error);
    throw error;
  }
}

export default globalSetup;
