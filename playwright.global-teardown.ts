import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Global teardown for E2E tests
 * Runs after all tests to clean up the database
 */
function globalTeardown() {
  console.log('\n🧹 E2E Test Teardown: Cleaning up...\n')

  // Remove .env.local created during global setup
  try {
    const envLocalPath = path.resolve(__dirname, '.env.local')
    if (fs.existsSync(envLocalPath)) {
      fs.unlinkSync(envLocalPath)
      console.log('✅ Removed .env.local\n')
    }
  } catch (error) {
    console.warn('⚠️  Failed to remove .env.local:', error)
  }

  // Only cleanup if we're managing the test database
  if (process.env.MANAGED_TEST_DB === 'true') {
    try {
      console.log('🛑 Stopping test database...')
      execSync('docker compose -f docker-compose.test.yml down', {
        stdio: 'inherit',
      })
      console.log('✅ Test database stopped successfully\n')
    } catch (error) {
      console.error('⚠️  Failed to stop test database:', error)
      // Don't throw - allow tests to complete even if cleanup fails
    }
  } else {
    console.log('ℹ️  Test database managed externally - skipping cleanup\n')
  }
}

export default globalTeardown
