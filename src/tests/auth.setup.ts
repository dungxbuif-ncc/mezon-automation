import { test as setup, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ENV_CONFIG } from '../config/environment';

/**
 * Authentication Setup
 * Prepares authentication states for tests
 */

const authFile = 'playwright/.auth/user.json';

setup('prepare auth states', async ({ page }) => {
  console.log('🔐 Setting up authentication states...');
  
  // For AutomationExercise, we don't need persistent login
  // since accounts are created and deleted per test
  // This setup just verifies the site is accessible
  
  const homePage = new HomePage(page);
  
  // Navigate to homepage
  await homePage.navigateToHome();
  
  // Verify homepage loads correctly
  await homePage.verifyHomePageLoaded();
  
  // Verify login page is accessible
  await homePage.navigateToSignupLogin();
  await expect(page).toHaveURL(/.*\/login/);
  
  // Go back to homepage
  await homePage.navigateToHome();
  
  // Save the storage state (just basic cookies, no login state)
  await page.context().storageState({ path: authFile });
  
});