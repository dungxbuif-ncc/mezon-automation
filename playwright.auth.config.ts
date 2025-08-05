import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration for Authentication Tests Only
 * No setup dependencies, standalone execution
 */
export default defineConfig({
  // Test directory
  testDir: './src/tests',
  
  // Global test timeout (30 seconds)
  timeout: 30 * 1000,
  
  // Expect timeout (10 seconds)
  expect: {
    timeout: 10 * 1000,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Output directories
  outputDir: 'test-results/',
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'https://dev-mezon.nccsoft.vn',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshots on failure
    screenshot: 'only-on-failure',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for major browsers - NO SETUP DEPENDENCY
  projects: [
    // Desktop browsers without auth setup
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
  ],
});