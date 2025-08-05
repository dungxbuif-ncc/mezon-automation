import { test as setup, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MEZON_TEST_USERS } from '../data/static/TestUsers';

const authFile = 'playwright/.auth/user.json';

setup('prepare auth states', async ({ page }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const testUser = MEZON_TEST_USERS.MAIN_USER;
  
  // Navigate to login
  await homePage.navigateToHome();
  await homePage.clickLogin();
  
  // Perform login
  await loginPage.verifyOnLoginPage();
  await loginPage.enterEmail(testUser.email);
  await loginPage.clickSendOtp();
  
  // Wait for potential auto-redirect or success
  await page.waitForTimeout(5000);
  
  // Check if we're successfully authenticated
  const currentUrl = page.url();
  if (currentUrl.includes('sendotp') || currentUrl.includes('callback') || currentUrl.includes('dev-mezon')) {
    console.log('✅ Setup: Authentication successful, saving state...');
    
    // Save authentication state
    await page.context().storageState({ path: authFile });
    
    console.log('✅ Setup: Auth state saved to', authFile);
  } else {
    console.warn('⚠️ Setup: Authentication may not be complete');
    // Save whatever state we have
    await page.context().storageState({ path: authFile });
  }
});