import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { MEZON_PAGE_TITLES, MEZON_MESSAGES, type MezonTestUser } from '../data/static/TestUsers';
import { WEBSITE_CONFIGS } from '../config/environment';

/**
 * Login Page Object (Mezon)
 * Handles interactions with the Mezon login/authentication page
 */
export class LoginPage extends BasePage {
  /**
   * Page selectors specific to Mezon login page
   */
  private selectors = {
    // Login form elements
    loginTitle: 'text=Log in to Mezon account',
    welcomeMessage: 'text=So glad to meet you again!',
    enterEmailText: 'text=Enter your email to login',
    
    // Form inputs and buttons
    emailInput: 'input[placeholder="Email address"], input[type="email"], input[name="email"]',
    sendOtpButton: 'button:has-text("Send OTP")',
    otpInput: 'input[placeholder="OTP"], input[placeholder="Enter OTP"], input[placeholder="Nhập OTP"], input[name="otp"], input[id="otp"], input[type="text"]:visible, input[type="number"]:visible',
    loginButton: 'button:has-text("Verify OTP"), button:has-text("Login"), button:has-text("Đăng nhập"), button[type="submit"], button:has-text("Verify"), button:has-text("Xác nhận"), [data-testid="login-btn"]',
    
    // Alternative login methods
    loginWithPasswordLink: 'text=Login with Email & Password, text=Đăng nhập bằng mật khẩu',
    passwordInput: 'input[type="password"]',
    
    // QR Code section
    qrCodeImage: 'img[alt="QR Code"]',
    qrCodeSection: '.qr-code-container, [data-testid="qr-code"]',
    
    // Error messages
    errorMessage: '.error-message, .alert-danger, [data-testid="error"]',
    
    // Loading states
    loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
    
    // Form validation
    emailValidationError: '.email-error, [data-testid="email-error"]',
    otpValidationError: '.otp-error, [data-testid="otp-error"]',
  };

  constructor(page: Page) {
    super(page, WEBSITE_CONFIGS.MEZON.baseURL);
  }

  /**
   * Navigate to login page
   */
  async navigateToLoginPage(): Promise<void> {
    // For Mezon, login is accessed via direct link or from homepage
    await this.page.goto(`${this.baseURL}/login`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for login page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForElement(this.selectors.loginTitle);
    await this.waitForElement(this.selectors.emailInput);
  }

  /**
   * Verify login page elements are visible
   */
  async verifyLoginPageElements(): Promise<void> {
    // Verify page title and main elements
    await expect(this.page).toHaveTitle(MEZON_PAGE_TITLES.LOGIN);
    await expect(this.page.locator(this.selectors.loginTitle)).toBeVisible();
    await expect(this.page.locator(this.selectors.welcomeMessage)).toBeVisible();
    await expect(this.page.locator(this.selectors.enterEmailText)).toBeVisible();
    
    // Verify form elements
    await expect(this.page.locator(this.selectors.emailInput)).toBeVisible();
    await expect(this.page.locator(this.selectors.sendOtpButton)).toBeVisible();
    
    // Verify alternative login method
    await expect(this.page.locator(this.selectors.loginWithPasswordLink)).toBeVisible();
  }

  /**
   * Enter email address
   */
  async enterEmail(email: string): Promise<void> {
    await this.page.locator(this.selectors.emailInput).clear();
    await this.page.locator(this.selectors.emailInput).fill(email);
  }

  /**
   * Click Send OTP button
   */
  async clickSendOtp(): Promise<void> {
    // Use direct selector since we know the exact text
    const sendOtpButton = this.page.locator('button:has-text("Send OTP")');
    
    // Wait for button to be visible 
    await sendOtpButton.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('Clicking Send OTP button...');
    await sendOtpButton.click();
    
    // Wait for any network requests to complete
    await this.page.waitForLoadState('networkidle');
    console.log('Send OTP clicked successfully');
  }

  /**
   * Enter OTP code
   * Note: In real scenarios, OTP might appear in a different input or modal
   */
  async enterOtp(otp: string): Promise<void> {
    // Wait for OTP input to appear (it might be dynamically loaded)
    await this.page.waitForTimeout(2000); // Wait for UI to update
    
    // Try different possible OTP input selectors
    const otpSelectors = [
      'input[placeholder*="OTP"]',
      'input[placeholder*="otp"]',
      'input[placeholder*="code"]', 
      'input[placeholder*="Code"]',
      'input[placeholder*="Nhập"]',
      'input[name="otp"]',
      'input[id="otp"]',
      'input[name="code"]',
      'input[id="code"]',
      '.otp-input input',
      '[data-testid="otp-input"]',
      'input[type="text"]:visible',
      'input[type="number"]:visible',
      '.auth-form input:visible',
      '.login-form input:visible'
    ];

    let otpInput = null;
    for (const selector of otpSelectors) {
      try {
        otpInput = this.page.locator(selector);
        if (await otpInput.isVisible()) {
          break;
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }

    if (otpInput && await otpInput.isVisible()) {
      await otpInput.clear();
      await otpInput.fill(otp);
    } else {
      throw new Error('OTP input field not found or not visible');
    }
  }

  /**
   * Click login button (after OTP is entered)
   */
  async clickLogin(): Promise<void> {
    // Check if we're on callback page (after OTP submission)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login/callback')) {
      // On callback page, authentication is automatic - just wait for redirect
      console.log('On callback page - authentication is automatic');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000); // Wait for redirect
      return;
    }
    
    // Normal login flow - look for login button
    const loginButton = this.page.locator(this.selectors.loginButton);
    
    // Wait for login button to be visible and enabled
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Complete full OTP authentication flow
   */
  async authenticateWithOtp(user: MezonTestUser): Promise<void> {
    console.log('Starting OTP authentication flow...');
    
    // Step 1: Enter email
    console.log('Step 1: Entering email...');
    await this.enterEmail(user.email);
    
    // Step 2: Click Send OTP
    console.log('Step 2: Clicking Send OTP...');
    await this.clickSendOtp();
    
    // Wait for OTP input to appear
    console.log('Waiting for OTP input to appear...');
    await this.page.waitForTimeout(3000);
    
    // Step 3: Enter OTP
    console.log('Step 3: Entering OTP...');
    await this.enterOtp(user.otp);
    
    // Step 4: Wait a moment and check for submit button
    await this.page.waitForTimeout(1000);
    
    // Try to submit the OTP (look for submit/verify button)
    console.log('Step 4: Looking for submit button...');
    const submitSelectors = [
      'button:has-text("Verify OTP")',  // The actual button text from UI
      'button[onclick*="handleSendToken"]', // Based on HTML we saw
      'button:has-text("Login")',
      'button:has-text("Đăng nhập")', 
      'button:has-text("Verify")',
      'button:has-text("Xác nhận")',
      'button:has-text("Submit")',
      'button[type="submit"]',
      'input[type="submit"]',
      'button:visible:last-of-type'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const submitBtn = this.page.locator(selector);
        if (await submitBtn.isVisible() && await submitBtn.isEnabled()) {
          console.log(`Found submit button with selector: ${selector}`);
          await submitBtn.click();
          submitted = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }
    
    if (!submitted) {
      console.log('No submit button found, checking if auto-redirect happens...');
    }
    
    // Wait for authentication to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    
    // Check final URL
    const finalUrl = this.page.url();
    console.log(`Final URL after authentication: ${finalUrl}`);
  }

  /**
   * Switch to password-based login
   */
  async switchToPasswordLogin(): Promise<void> {
    await this.page.locator(this.selectors.loginWithPasswordLink).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with email and password (alternative method)
   */
  async loginWithPassword(email: string, password: string): Promise<void> {
    await this.switchToPasswordLogin();
    
    await this.page.locator(this.selectors.emailInput).clear();
    await this.page.locator(this.selectors.emailInput).fill(email);
    
    await this.page.locator(this.selectors.passwordInput).clear();
    await this.page.locator(this.selectors.passwordInput).fill(password);
    
    await this.clickLogin();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    const errorElement = this.page.locator(this.selectors.errorMessage);
    await expect(errorElement).toBeVisible();
    
    if (expectedMessage) {
      await expect(errorElement).toContainText(expectedMessage);
    }
  }

  /**
   * Verify successful login (user is redirected)
   */
  async verifySuccessfulLogin(): Promise<void> {
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000); // Additional wait for redirects
    
    // Check if we're no longer on login page
    const currentUrl = this.page.url();
    const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');
    
    if (isOnLoginPage) {
      // If still on login page, check if it's a callback page (which is OK)
      if (currentUrl.includes('/login/callback')) {
        console.log('On callback page - authentication in progress');
        // Wait a bit more for potential redirect
        await this.page.waitForTimeout(3000);
        
        // Check final URL
        const finalUrl = this.page.url();
        if (finalUrl.includes('/login') && !finalUrl.includes('/callback')) {
          throw new Error('Still on login page after authentication attempt');
        }
      } else {
        throw new Error('Still on login page after authentication attempt');
      }
    }
    
    // Additional verification: check if user is logged in
    console.log('Authentication appears successful - no longer on login page');
  }

  /**
   * Verify QR code is visible (alternative login method)
   */
  async verifyQrCodeVisible(): Promise<void> {
    const qrElements = [
      this.selectors.qrCodeImage,
      this.selectors.qrCodeSection,
    ];

    let qrVisible = false;
    for (const selector of qrElements) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible()) {
          qrVisible = true;
          break;
        }
      } catch (error) {
        // Continue checking other selectors
        continue;
      }
    }

    expect(qrVisible).toBeTruthy();
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Verify user is on login page
   */
  async verifyOnLoginPage(): Promise<void> {
    const currentUrl = this.getCurrentUrl();
    expect(currentUrl).toMatch(/login|authentication|signin/);
    await expect(this.page.locator(this.selectors.loginTitle)).toBeVisible();
  }

  /**
   * Clear all form fields
   */
  async clearAllFields(): Promise<void> {
    try {
      await this.page.locator(this.selectors.emailInput).clear();
    } catch (error) {
      // Field might not be visible or available
    }
    
    try {
      // Try to clear OTP field if it exists
      const otpInput = this.page.locator(this.selectors.otpInput);
      if (await otpInput.isVisible()) {
        await otpInput.clear();
      }
    } catch (error) {
      // OTP field might not be visible
    }
  }

  // Legacy methods for compatibility with existing test structure
  async loginWithExistingUser(email: string, password: string): Promise<void> {
    // For Mezon, use password login method
    await this.loginWithPassword(email, password);
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    // For OTP flow, we'll need to handle OTP instead of password
    console.warn('Mezon uses OTP flow, not traditional password. Use authenticateWithOtp() instead.');
  }

  async clickLoginButton(): Promise<void> {
    await this.clickLogin();
  }

  async verifyLoginErrorMessage(expectedMessage?: string): Promise<void> {
    await this.verifyErrorMessage(expectedMessage);
  }

  async verifyOnSignupLoginPage(): Promise<void> {
    await this.verifyOnLoginPage();
  }

  async verifyLoginSectionVisible(): Promise<void> {
    await this.verifyLoginPageElements();
  }

  async verifySignupSectionVisible(): Promise<void> {
    // Mezon doesn't have separate signup section on login page
    console.warn('Mezon does not have separate signup section on login page');
  }

  async fillSignupForm(name: string, email: string): Promise<void> {
    // Mezon signup would be different flow
    console.warn('Mezon signup flow is different from traditional name/email signup');
  }

  async clickSignupButton(): Promise<void> {
    // Mezon signup would be different
    console.warn('Mezon signup process is different');
  }

  async verifySignupErrorMessage(expectedMessage?: string): Promise<void> {
    await this.verifyErrorMessage(expectedMessage);
  }
}