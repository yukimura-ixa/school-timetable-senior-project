import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * E2E Test Configuration for School Timetable System
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true, // ✅ Run tests in parallel
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined, // ✅ 4 parallel workers in CI, all cores locally
  
  /* Global setup/teardown - manages test database lifecycle */
  globalSetup: require.resolve('./playwright.global-setup.ts'),
  globalTeardown: require.resolve('./playwright.global-teardown.ts'),
  
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,  // Reduced from 15s → 10s (actions should be faster)
    navigationTimeout: 20000, // Reduced from 30s → 20s (pages should load faster)
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use Playwright's bundled Chromium (headless by default)
        // This will work after running: npx playwright install chromium
      },
    },
    // Brave browser disabled for CI performance (2x faster)
    // Uncomment for local cross-browser testing if needed
    // {
    //   name: 'brave',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     launchOptions: {
    //       executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    //       args: [
    //         '--disable-blink-features=AutomationControlled',
    //         '--disable-dev-shm-usage',
    //         '--no-sandbox',
    //       ],
    //     },
    //   },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* Test output directories */
  outputDir: 'test-results/artifacts',
});
