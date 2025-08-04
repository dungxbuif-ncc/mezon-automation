import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { UserFactory } from '../../data/factories/UserFactory';

/**
 * Homepage End-to-End Tests
 * Tests for homepage functionality and navigation
 * 
 * Test Cases:
 * 1. Verify homepage loads correctly
 * 2. Verify navigation to signup/login page
 * 3. Verify newsletter subscription
 * 4. Verify page title and elements
 */

test.describe('Homepage Tests', () => {
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    
    // Navigate to homepage before each test
    await homePage.navigateToHome();
  });

  test('should load homepage correctly @smoke', async () => {
    // Verify homepage is loaded with all main elements
    await homePage.verifyHomePageLoaded();
    
    // Verify page title
    await homePage.assertPageTitle('Automation Exercise');
    
    // Verify current URL
    await homePage.assertCurrentURL('/');
  });

  test('should navigate to signup/login page @regression', async () => {
    // Click on Signup/Login link
    await homePage.navigateToSignupLogin();
    
    // Verify login page is loaded
    await loginPage.verifyOnLoginPage();
    
    // Verify URL contains login
    await expect(homePage.page).toHaveURL(/.*\/login/);
    
    // Verify login page elements are visible
    await expect(loginPage.page.locator('input[type="email"]')).toBeVisible();
    await expect(loginPage.page.locator('button:has-text("Send OTP")')).toBeVisible();
  });

  test('should navigate to different sections @regression', async () => {
    // Test navigation to Products
    await homePage.navigateToProducts();
    await expect(homePage.page).toHaveURL(/.*\/products/);
    
    // Go back to homepage
    await homePage.navigateToHome();
    await homePage.verifyHomePageLoaded();
    
    // Test navigation to Contact Us
    await homePage.navigateToContactUs();
    await expect(homePage.page).toHaveURL(/.*\/contact_us/);
    
    // Go back to homepage
    await homePage.navigateToHome();
    await homePage.verifyHomePageLoaded();
  });

  test('should subscribe to newsletter successfully @regression', async () => {
    // Generate test email
    const testEmail = UserFactory.generateNewsletterEmail();
    
    // Scroll to subscription section
    await homePage.scrollToBottom();
    
    // Subscribe to newsletter
    await homePage.subscribeToNewsletter(testEmail);
    
    // Verify subscription success
    await homePage.verifySubscriptionSuccess();
  });

  test('should verify homepage elements and content @smoke', async () => {
    // Verify main page elements are visible
    await homePage.assertElementVisible('h2');
    await homePage.assertElementVisible('.carousel-inner');
    await homePage.assertElementVisible('.features_items');
    await homePage.assertElementVisible('.subscription');
    
    // Verify navigation elements
    await homePage.assertElementVisible('a[href="/login"]');
    await homePage.assertElementVisible('a[href="/products"]');
    await homePage.assertElementVisible('a[href="/contact_us"]');
  });

  test('should verify user is not logged in initially @smoke', async () => {
    // Verify user is not logged in
    await homePage.verifyUserNotLoggedIn();
    
    // Verify login/signup link is visible
    const isLoggedIn = await homePage.isUserLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should scroll to different sections @regression', async () => {
    // Test scrolling functionality
    await homePage.scrollToBottom();
    await homePage.scrollToTop();
    
    // Verify we're back at top by checking carousel is visible
    await homePage.assertElementVisible('.carousel-inner');
  });

  test('should verify responsive layout elements @regression', async () => {
    // Verify footer elements
    await homePage.scrollToBottom();
    await homePage.assertElementVisible('.footer-widget');
    
    // Verify subscription section
    await homePage.assertElementVisible('.subscription');
    
    // Scroll back to top
    await homePage.scrollToTop();
    
    // Verify header navigation
    await homePage.assertElementVisible('a[href="/"]'); // Home link
  });

  test('should handle page refresh correctly @regression', async () => {
    // Verify initial state
    await homePage.verifyHomePageLoaded();
    
    // Refresh page
    await homePage.refresh();
    
    // Verify page still loads correctly after refresh
    await homePage.verifyHomePageLoaded();
    await homePage.assertPageTitle('Automation Exercise');
  });

  test('should verify page navigation history @regression', async () => {
    // Go to login page
    await homePage.navigateToSignupLogin();
    await expect(homePage.page).toHaveURL(/.*\/login/);
    
    // Go back using browser back button
    await homePage.goBack();
    
    // Verify we're back on homepage
    await homePage.verifyHomePageLoaded();
    await homePage.assertCurrentURL('/');
  });
});