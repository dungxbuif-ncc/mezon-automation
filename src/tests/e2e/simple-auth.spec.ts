import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Simple Auth Test', () => {
  test('should be authenticated after setup', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.navigate();
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    await page.screenshot({ path: 'auth-test.png', fullPage: true });
    
    expect(currentUrl).not.toMatch(/login|signin|authentication/);
  });
});
