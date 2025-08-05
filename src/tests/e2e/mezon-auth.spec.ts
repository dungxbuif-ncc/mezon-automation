import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { MEZON_TEST_USERS } from '../../data/static/TestUsers';

test.describe('Mezon Authentication Flow', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });

  test('TC01: Complete Mezon Authentication Flow - Navigate to Login to Successful Authentication @e2e', async () => {
    const testUser = MEZON_TEST_USERS.MAIN_USER;

    // Step 1: Navigate to homepage 
    await homePage.navigate();

    // Step 2: Click Login button and navigate to login page
    await homePage.clickLogin();

    // Step 3: Verify login page is loaded and check login elements
    await loginPage.waitForPageLoad();
    await loginPage.verifyOnLoginPage();
    await loginPage.verifyLoginPageElements();

    // Step 4: Check email input elements and enter email
    const emailInput = loginPage.page.locator('input[placeholder="Email address"]');
    await expect(emailInput).toBeVisible();
    await loginPage.enterEmail(testUser.email);

    // Step 5: Verify email is entered correctly
    await expect(emailInput).toHaveValue(testUser.email);

    // Step 6: Click Send OTP button
    await loginPage.clickSendOtp();
    await loginPage.page.waitForLoadState('networkidle');

    // Step 7: Wait for potential auto-login or OTP page
    await loginPage.page.waitForTimeout(5000);
    
    // Check current URL - may have already redirected to success
    const currentUrl = loginPage.page.url();
    console.log('URL after Send OTP:', currentUrl);
    
    if (currentUrl.includes('callback') || currentUrl.includes('dev-mezon.nccsoft.vn')) {
      // Already authenticated! No OTP needed
      console.log('Auto-authentication successful! Redirected to:', currentUrl);
    } else {
      // Still on OTP page, handle manual OTP entry
      try {
        const otpInput = loginPage.page.locator('input[id="otp"]');
        if (await otpInput.isVisible({ timeout: 3000 })) {
          await loginPage.enterOtp(testUser.otp);
          await loginPage.clickLogin();
        }
      } catch (error) {
        console.log('OTP input not found, proceeding...');
      }
    }

    // Step 8: Verify successful authentication (check for successful redirect)
    await loginPage.page.waitForTimeout(3000);
    const finalUrl = loginPage.page.url();
    console.log('Final URL:', finalUrl);
    
    // Authentication successful if redirected away from login
    expect(finalUrl).not.toMatch(/authentication|login/);
    expect(finalUrl).toMatch(/dev-mezon\.nccsoft\.vn|callback/);
    
    console.log('✅ Authentication flow completed successfully!');
  });
});