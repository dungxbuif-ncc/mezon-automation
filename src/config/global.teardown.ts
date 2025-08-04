import { type FullConfig } from '@playwright/test';

/**
 * Global Teardown
 * Runs once after all tests are completed
 * Cleans up resources, generates reports, etc.
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up temporary files
    const fs = await import('fs');
    const path = await import('path');
    
    // Clean up screenshots directory if it exists and is empty
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      if (files.length === 0) {
        fs.rmSync(screenshotsDir, { recursive: true, force: true });
        console.log('🗑️  Cleaned up empty screenshots directory');
      }
    }
    
    // Archive test results if in CI environment
    if (process.env.CI) {
      console.log('📦 Archiving test results for CI...');
      
      const testResultsDir = path.join(process.cwd(), 'test-results');
      const playwrightReportDir = path.join(process.cwd(), 'playwright-report');
      
      // Create archive directory
      const archiveDir = path.join(process.cwd(), 'test-archive');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }
      
      // Copy important files to archive
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (fs.existsSync(testResultsDir)) {
        const archiveTestResults = path.join(archiveDir, `test-results-${timestamp}`);
        fs.cpSync(testResultsDir, archiveTestResults, { recursive: true });
        console.log(`📁 Test results archived to: ${archiveTestResults}`);
      }
      
      if (fs.existsSync(playwrightReportDir)) {
        const archiveReport = path.join(archiveDir, `playwright-report-${timestamp}`);
        fs.cpSync(playwrightReportDir, archiveReport, { recursive: true });
        console.log(`📁 Playwright report archived to: ${archiveReport}`);
      }
    }
    
    // Log test execution summary
    console.log('📊 Test execution completed');
    console.log('📁 Test artifacts available in:');
    console.log('   - test-results/ (traces, videos, screenshots)');
    console.log('   - playwright-report/ (HTML report)');
    
    // Performance metrics (if available)
    if (process.env.CI) {
      const endTime = Date.now();
      const startTime = parseInt(process.env.TEST_START_TIME || '0');
      if (startTime > 0) {
        const duration = Math.round((endTime - startTime) / 1000);
        console.log(`⏱️  Total execution time: ${duration} seconds`);
      }
    }
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;