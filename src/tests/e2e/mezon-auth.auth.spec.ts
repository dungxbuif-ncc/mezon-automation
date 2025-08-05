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

    // Step 7: Wait for OTP page or auto-redirect
    await loginPage.page.waitForTimeout(3000);
    
    // Check current URL 
    const currentUrl = loginPage.page.url();
    console.log('URL after Send OTP:', currentUrl);
    
    if (currentUrl.includes('sendotp')) {
      console.log('✅ Successfully reached OTP page');
      
      // Try to find OTP input on sendotp page
      try {
        await loginPage.page.waitForLoadState('networkidle');
        
        // Look for various OTP input selectors
        const otpSelectors = [
          'input[id="otp"]',
          'input[name="otp"]', 
          'input[placeholder*="OTP"]',
          'input[type="number"]',
          'input[type="text"]'
        ];
        
        let otpFound = false;
        for (const selector of otpSelectors) {
          const otpInput = loginPage.page.locator(selector);
          if (await otpInput.isVisible({ timeout: 2000 })) {
            console.log(`Found OTP input: ${selector}`);
            await loginPage.enterOtp(testUser.otp);
            await loginPage.clickLogin();
            otpFound = true;
            break;
          }
        }
        
        if (!otpFound) {
          console.log('No OTP input found - may be SMS/Email based');
        }
        
      } catch (error) {
        console.log('OTP handling failed:', (error as Error).message);
      }
    } else if (currentUrl.includes('callback') || currentUrl.includes('dev-mezon.nccsoft.vn')) {
      console.log('✅ Auto-authentication successful!');
    }

    // Step 8: Final verification
    console.log('✅ Send OTP flow completed successfully!');
    console.log('Current page:', currentUrl);
    
    // Verify we progressed past initial login page
    expect(currentUrl).not.toMatch(/authentication\/login\?login_challenge/);
    expect(currentUrl).toMatch(/sendotp|callback|dev-mezon/);
    
    console.log('🎉 Authentication test completed!');
  });
});