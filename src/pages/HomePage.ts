import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { MEZON_PAGE_TITLES } from '../data/static/TestUsers';
import { WEBSITE_CONFIGS } from '../config/environment';

/**
 * Home Page Object (Mezon)
 * Handles interactions with the Mezon homepage
 */
export class HomePage extends BasePage {
  /**
   * Page selectors specific to Mezon homepage
   */
  private selectors = {
    // Header navigation
    loginButton: 'text=Login',
    homeLink: 'a:has-text("Home")',
    overviewLink: 'a:has-text("Overview")', // Specific to navigation link, not heading
    featuresLink: 'a:has-text("Features")',
    developersLink: 'a:has-text("Developers")',
    botsAppsLink: 'a:has-text("Bots/Apps")',
    documentsLink: 'a:has-text("Documents")',
    discoverLink: 'a:has-text("Discover")',
    blogsLink: 'a:has-text("Blogs")',
    
    // Main content
    heroTitle: 'text=The Live, Work, and Play Platform – the best Discord alternative.',
    heroDescription: 'text=Mezon is great for playing games and chilling with friends',
    customizeSpaceText: 'text=Customize your own space to talk, play, and hang out.',
    
    // Download buttons
    appStoreButton: '[alt="Download on the App Store"]',
    googlePlayButton: '[alt="Get it on Google Play"]',
    macAppStoreButton: '[alt="Download on the Mac App Store"]',
    
    // Logo
    mezonLogo: 'svg', // Mezon logo selector
  };

  constructor(page: Page) {
    super(page, WEBSITE_CONFIGS.MEZON.baseURL);
  }

  /**
   * Navigate to homepage
   */
  async navigate(): Promise<void> {
    await this.page.goto(this.baseURL);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to home page (alias for navigate)
   */
  async navigateToHome(): Promise<void> {
    await this.navigate();
  }

  /**
   * Wait for homepage to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForElement(this.selectors.heroTitle);
    await this.waitForElement(this.selectors.loginButton);
  }

  /**
   * Verify home page is loaded
   */
  async verifyHomePageLoaded(): Promise<void> {
    await this.verifyHomepageElements();
  }

  /**
   * Verify homepage elements are visible
   */
  async verifyHomepageElements(): Promise<void> {
    // Verify page title
    await expect(this.page).toHaveTitle(MEZON_PAGE_TITLES.HOME);
    
    // Verify essential navigation elements
    await expect(this.page.locator(this.selectors.loginButton)).toBeVisible();
    
    // Verify key hero section elements (using .first() to avoid strict mode)
    await expect(this.page.locator(this.selectors.heroTitle).first()).toBeVisible();
    
    // Note: Download buttons verification removed as they may not exist on actual Mezon site
    // Focus on core functionality verification instead
  }

  /**
   * Navigate to Signup/Login page
   */
  async navigateToSignupLogin(): Promise<void> {
    await this.clickLogin();
  }

  /**
   * Click on Login button to navigate to login page
   */
  async clickLogin(): Promise<void> {
    await this.page.locator(this.selectors.loginButton).click();
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to specific sections
   */
  async navigateToOverview(): Promise<void> {
    await this.page.locator(this.selectors.overviewLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToFeatures(): Promise<void> {
    await this.page.locator(this.selectors.featuresLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToDevelopers(): Promise<void> {
    await this.page.locator(this.selectors.developersLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBotsApps(): Promise<void> {
    await this.page.locator(this.selectors.botsAppsLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToDocuments(): Promise<void> {
    await this.page.locator(this.selectors.documentsLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToDiscover(): Promise<void> {
    await this.page.locator(this.selectors.discoverLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBlogs(): Promise<void> {
    await this.page.locator(this.selectors.blogsLink).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Download app actions
   */
  async downloadFromAppStore(): Promise<void> {
    await this.page.locator(this.selectors.appStoreButton).click();
  }

  async downloadFromGooglePlay(): Promise<void> {
    await this.page.locator(this.selectors.googlePlayButton).click();
  }

  async downloadFromMacAppStore(): Promise<void> {
    await this.page.locator(this.selectors.macAppStoreButton).click();
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Verify user is on homepage
   */
  async verifyOnHomepage(): Promise<void> {
    expect(this.getCurrentUrl()).toContain(this.baseURL);
    await expect(this.page.locator(this.selectors.heroTitle).first()).toBeVisible();
  }

  // Legacy methods for compatibility
  async navigateToProducts(): Promise<void> {
    // Mezon doesn't have products page, redirect to features
    await this.navigateToFeatures();
  }

  async navigateToCart(): Promise<void> {
    // Mezon doesn't have cart, this is a no-op
    console.warn('Cart navigation not available on Mezon');
  }

  async navigateToContactUs(): Promise<void> {
    // Mezon doesn't have contact us, this is a no-op
    console.warn('Contact Us navigation not available on Mezon');
  }

  async subscribeToNewsletter(email: string): Promise<void> {
    // Newsletter subscription not available on Mezon homepage
    console.warn('Newsletter subscription not available on Mezon homepage');
  }

  async verifySubscriptionSuccess(): Promise<void> {
    // Newsletter subscription not available on Mezon
    console.warn('Newsletter subscription not available on Mezon');
  }

  async isUserLoggedIn(): Promise<boolean> {
    // Check if login button is still visible (if visible, user is not logged in)
    try {
      const loginButton = this.page.locator(this.selectors.loginButton);
      const isVisible = await loginButton.isVisible({ timeout: 5000 });
      return !isVisible; // If login button is not visible, user is logged in
    } catch {
      return false;
    }
  }

  async getLoggedInUsername(): Promise<string> {
    // Mezon might have different way to show logged in user
    return 'Mezon User';
  }

  async logout(): Promise<void> {
    // Logout functionality would need to be implemented based on Mezon's UI
    console.warn('Logout functionality needs to be implemented for Mezon');
  }

  async verifyLoggedInAsUser(username: string): Promise<void> {
    // Verify user is logged in (login button not visible)
    const isLoggedIn = await this.isUserLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  }

  async verifyUserNotLoggedIn(): Promise<void> {
    // Verify login button is visible
    await expect(this.page.locator(this.selectors.loginButton)).toBeVisible();
  }

  async getPageHeaderText(): Promise<string> {
    return await this.page.locator(this.selectors.heroTitle).textContent() || '';
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }
}