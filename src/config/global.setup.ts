import { chromium, type FullConfig } from '@playwright/test';
import { ENV_CONFIG } from './environment';

/**
 * Global Setup
 * Runs once before all tests
 * Sets up browser installation, authentication states, etc.
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  try {
    // Create auth directory if it doesn't exist
    const fs = await import('fs');
    const path = await import('path');
    
    const authDir = path.join(process.cwd(), 'playwright', '.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Launch browser for authentication setup
    const browser = await chromium.launch({
      headless: ENV_CONFIG.browser.headless,
    });
    
    const context = await browser.newContext({
      baseURL: ENV_CONFIG.baseURL,
    });
    
    const page = await context.newPage();
    
    // Navigate to the homepage to verify site accessibility
    console.log('🌐 Verifying site accessibility...');
    await page.goto('/');
    
    // Verify the site is accessible
    const title = await page.title();
    if (!title.includes('Mezon')) {
      throw new Error('Site is not accessible or title is incorrect');
    }
    
    console.log('✅ Site is accessible');
    
    // For Mezon, we don't need persistent login state
    // as accounts are created/deleted per test scenario
    // Just save a basic state for faster test startup
    
    await context.storageState({ path: 'playwright/.auth/user.json' });
    
    await context.close();
    await browser.close();
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;