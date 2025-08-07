import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MEZON_TEST_USERS } from '../data/static/TestUsers';

const authFile = 'playwright/.auth/user.json';

setup('prepare mezon auth state', async ({ page }) => {
  const fs = await import('fs');
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile);
    const ageInMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
    
    if (ageInMinutes < 60) {
      console.log('✅ Setup: Auth state already exists and is recent, skipping login');
      return;
    }
  }
  
  const loginPage = new LoginPage(page);
  const testUser = MEZON_TEST_USERS.MAIN_USER;
  
  try {
    await loginPage.navigate();
    
    await loginPage.enterEmail(testUser.email);
    await loginPage.clickSendOtp();
    await loginPage.enterOtp(testUser.otp);
    
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login/callback') || currentUrl.includes('/chat')) {
      console.log('✅ Setup: Auto-redirected after OTP, authentication successful!');
    } else {
      try {
        await loginPage.clickVerifyOtp();
        console.log('✅ Setup: Clicked verify OTP button');
      } catch {
        console.log('⚠️ Setup: Verify button not found, checking if already authenticated');
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error('❌ Setup failed:', error);
    await page.screenshot({ path: 'debug-auth-setup.png', fullPage: true });
    await page.context().storageState({ path: authFile });
  }
});