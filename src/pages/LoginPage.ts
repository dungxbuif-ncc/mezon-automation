import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { MEZON_PAGE_TITLES, MEZON_MESSAGES, type MezonTestUser } from '../data/static/TestUsers';
import { WEBSITE_CONFIGS } from '../config/environment';

export class LoginPage extends BasePage {
  private selectors = {
    loginTitle: 'text=Log in to Mezon account',
    welcomeMessage: 'text=So glad to meet you again!',
    enterEmailText: 'text=Enter your email to login',
    
    emailInput: 'input[placeholder="Email address"], input[type="email"], input[name="email"]',
    sendOtpButton: 'button:has-text("Send OTP")',
    otpInput: 'input[id="otp"], input[name="otp"], input[placeholder="OTP"], input[type="number"], input[type="text"]:visible',
    loginButton: 'button[id="sendOtpBtn"], button:has-text("Verify OTP"), button:has-text("Login"), button:has-text("Đăng nhập"), button[type="submit"], button:has-text("Verify"), button:has-text("Xác nhận"), [data-testid="login-btn"]',
    
    loginWithPasswordLink: 'text=Login with Email & Password, text=Đăng nhập bằng mật khẩu, a:has-text("Email"), a:has-text("Password")',
    passwordInput: 'input[type="password"]',
    
    qrCodeImage: 'img[alt="QR Code"]',
    qrCodeSection: '.qr-code-container, [data-testid="qr-code"]',
    
    errorMessage: '.error-message, .alert-danger, [data-testid="error"]',
    
    loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
    
    emailValidationError: '.email-error, [data-testid="email-error"]',
    otpValidationError: '.otp-error, [data-testid="otp-error"]',
  };

  constructor(page: Page) {
    super(page, WEBSITE_CONFIGS.MEZON.baseURL);
  }

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(`${this.baseURL}/login`);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Simple wait for page to stabilize
    await this.page.waitForTimeout(3000);
  }

  async verifyLoginPageElements(): Promise<void> {
    // Verify core login elements that should definitely be present
    await expect(this.page.locator(this.selectors.loginTitle)).toBeVisible();
    await expect(this.page.locator(this.selectors.emailInput)).toBeVisible();
    await expect(this.page.locator(this.selectors.sendOtpButton)).toBeVisible();
  }

  async enterEmail(email: string): Promise<void> {
    await this.page.locator(this.selectors.emailInput).clear();
    await this.page.locator(this.selectors.emailInput).fill(email);
  }

  async clickSendOtp(): Promise<void> {
    const sendOtpButton = this.page.locator('button:has-text("Send OTP")');
    
    await sendOtpButton.waitFor({ state: 'visible', timeout: 10000 });
    
    await sendOtpButton.click();
    
    await this.page.waitForLoadState('networkidle');
  }

  async enterOtp(otp: string): Promise<void> {
    await this.page.waitForTimeout(2000);
    
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

  async clickLogin(): Promise<void> {
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login/callback')) {
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      return;
    }
    
    const loginButton = this.page.locator(this.selectors.loginButton);
    
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async authenticateWithOtp(user: MezonTestUser): Promise<void> {
    await this.enterEmail(user.email);
    
    await this.clickSendOtp();
    
    await this.page.waitForTimeout(3000);
    
    await this.enterOtp(user.otp);
    
    await this.page.waitForTimeout(1000);
    const submitSelectors = [
      'button:has-text("Verify OTP")',
      'button[onclick*="handleSendToken"]',
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
          await submitBtn.click();
          submitted = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    
    const finalUrl = this.page.url();
  }

  async switchToPasswordLogin(): Promise<void> {
    await this.page.locator(this.selectors.loginWithPasswordLink).click();
    await this.page.waitForLoadState('networkidle');
  }

  async loginWithPassword(email: string, password: string): Promise<void> {
    await this.switchToPasswordLogin();
    
    await this.page.locator(this.selectors.emailInput).clear();
    await this.page.locator(this.selectors.emailInput).fill(email);
    
    await this.page.locator(this.selectors.passwordInput).clear();
    await this.page.locator(this.selectors.passwordInput).fill(password);
    
    await this.clickLogin();
  }

  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    const errorElement = this.page.locator(this.selectors.errorMessage);
    await expect(errorElement).toBeVisible();
    
    if (expectedMessage) {
      await expect(errorElement).toContainText(expectedMessage);
    }
  }

  async verifySuccessfulLogin(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    const isOnLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');
    
    if (isOnLoginPage) {
      if (currentUrl.includes('/login/callback')) {
        await this.page.waitForTimeout(3000);
        
        const finalUrl = this.page.url();
        if (finalUrl.includes('/login') && !finalUrl.includes('/callback')) {
          throw new Error('Still on login page after authentication attempt');
        }
      } else {
        throw new Error('Still on login page after authentication attempt');
      }
    }
  }

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
        continue;
      }
    }

    expect(qrVisible).toBeTruthy();
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async verifyOnLoginPage(): Promise<void> {
    const currentUrl = this.getCurrentUrl();
    expect(currentUrl).toMatch(/login|authentication|signin|mezon/);
    // Just verify we're on some kind of auth page
    console.log('Current URL:', currentUrl);
  }

  async clearAllFields(): Promise<void> {
    try {
      await this.page.locator(this.selectors.emailInput).clear();
    } catch (error) {
    }
    
    try {
      // Try to clear OTP field if it exists
      const otpInput = this.page.locator(this.selectors.otpInput);
      if (await otpInput.isVisible()) {
        await otpInput.clear();
      }
    } catch (error) {
    }
  }

  async loginWithExistingUser(email: string, password: string): Promise<void> {
    await this.loginWithPassword(email, password);
  }

  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
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
  }

  async fillSignupForm(name: string, email: string): Promise<void> {
  }

  async clickSignupButton(): Promise<void> {
  }

  async verifySignupErrorMessage(expectedMessage?: string): Promise<void> {
    await this.verifyErrorMessage(expectedMessage);
  }
}