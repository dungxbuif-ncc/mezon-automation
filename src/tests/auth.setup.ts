import { test as setup, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

const authFile = 'playwright/.auth/user.json';

setup('prepare auth states', async ({ page }) => {
  const homePage = new HomePage(page);
  
  await homePage.navigateToHome();
  
  await homePage.verifyHomePageLoaded();
  
  await homePage.navigateToSignupLogin();
  await expect(page).toHaveURL(/.*\/login/);
  
  await homePage.navigateToHome();
  
  await page.context().storageState({ path: authFile });
  
});