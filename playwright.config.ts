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
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  
  /* Global setup - seeds database before tests */
  globalSetup: require.resolve('./playwright.global-setup.ts'),
  
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
    actionTimeout: 15000,
    navigationTimeout: 30000,
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
    {
      name: 'brave',
      use: {
        ...devices['Desktop Chrome'],
        // Use installed Brave browser
        // Note: Do NOT set `channel` when using a custom `executablePath`.
        // Setting both will cause Playwright to ignore the executablePath and try to launch the channel instead.
        // Launch options for better automation
          launchOptions: {
            executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
          args: [
            '--disable-blink-features=AutomationControlled', // Hide automation
            '--disable-dev-shm-usage', // Overcome limited resource problems
            '--no-sandbox', // Required for some environments
          ],
        },
      },
    },
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
