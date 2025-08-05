import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

/**
 * Homepage End-to-End Tests
 * Đơn giản hóa chỉ verify 8 elements chính có tồn tại hay không
 */

test.describe('Homepage Tests - Element Verification', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    
    // Navigate to homepage before each test
    await homePage.navigateToHome();
  });

  test('should verify 8 main homepage elements exist @smoke', async () => {
    // Verify 8 main navigation elements exist
    await expect(homePage.page.locator('a:has-text("Home")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Overview")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Features")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Developers")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Bots/Apps")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Documents")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Discover")')).toBeVisible();
    await expect(homePage.page.locator('a:has-text("Blogs")')).toBeVisible();
  });

  test('should verify Login button exists @smoke', async () => {
    // Verify Login button exists
    await expect(homePage.page.locator('a[href="/mezon"]:has-text("Login")')).toBeVisible();
  });
});