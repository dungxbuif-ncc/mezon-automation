import { defineConfig, devices } from '@playwright/test';
import { OrtoniReportConfig } from 'ortoni-report';
import dotenv from 'dotenv';
dotenv.config();

const reportConfig: OrtoniReportConfig = {
  logo: "",
  open: process.env.CI ? "never" : "always",
  folderPath: "ortoni-reports",
  filename: "index.html",
  title: "Mezon Automation Test Report",
  showProject: true,
  projectName: "Mezon-Automation",
  testType: "e2e",
  authorName: "mezoner",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light",
  chartType: "doughnut",
  meta: {
    project: "Mezon Automation",
    version: "1.0.0",
    description: "Playwright E2E test report for Mezon platform",
    testCycle: "Main",
    release: "1.0.0",
    environment: process.env.BASE_URL || 'https://dev-mezon.nccsoft.vn',
  },
};

/**
 * Playwright Configuration
 * Standard setup for Playwright + Page Object Model framework
 */
export default defineConfig({
  // Test directory - Exclude auth tests and homepage  
  testDir: './src/tests',
  // testIgnore: ['**/*.auth.spec.ts', '**/homepage.spec.ts'],
  
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
    ['ortoni-report', reportConfig],
    ['json', { outputFile: 'ortoni-reports/results.json' }],
    ['junit', { outputFile: 'ortoni-reports/results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Global setup and teardown
  globalSetup: './src/config/global.setup.ts',
  globalTeardown: './src/config/global.teardown.ts',

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

  // Configure projects for major browsers
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
    
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },

    // Mobile browsers
    // {
    //   name: 'Mobile Chrome',
    //   use: { 
    //     ...devices['Pixel 5'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
    
    // {
    //   name: 'Mobile Safari',
    //   use: { 
    //     ...devices['iPhone 12'],
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },

    // Microsoft Edge
    // {
    //   name: 'Microsoft Edge',
    //   use: { 
    //     ...devices['Desktop Edge'], 
    //     channel: 'msedge',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   dependencies: ['setup'],
    // },
  ],

  // Development server (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});