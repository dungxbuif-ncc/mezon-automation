import { test, expect } from '@playwright/test';
import { CategoryPage } from '../../pages/CategoryPage';
import { HomePage } from '../../pages/HomePage';

test.describe('Create Category', () => {
    test.beforeEach(async ({ page }) => {
        const homePage = new HomePage(page);
        await homePage.navigate();

        const currentUrl = page.url();
        if (currentUrl.includes('dev-mezon.nccsoft.vn') && !currentUrl.includes('/chat')) {
            console.log('On landing page, clicking "Open Mezon" button...');

            const openMezonSelectors = [
                'button:has-text("Open Mezon")',
                'a:has-text("Open Mezon")',
                '[data-testid="open-mezon"]',
                '.open-mezon-btn',
                'button[class*="open"]',
                'a[href*="/chat"]'
            ];

            let buttonFound = false;
            for (const selector of openMezonSelectors) {
                try {
                    const button = page.locator(selector).first();
                    if (await button.isVisible({ timeout: 3000 })) {
                        console.log(`Found "Open Mezon" button using: ${selector}`);
                        await button.click();
                        buttonFound = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!buttonFound) {
                console.log('Button not found, trying direct navigation...');
                await page.goto('/chat');
            }

            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);

            console.log(`After navigation: ${page.url()}`);
        }

        const finalUrl = page.url();
        expect(finalUrl).not.toMatch(/login|signin|authentication/);
    });

    const textCategorylPrivate = 'category-private8';
    const textCategoryPublic = 'category-public';
    const textCategoryCancel = 'category-cancel';

    test('should create private category', async ({ page }) => {
        const categoryPage = new CategoryPage(page);

        await page.goto('https://dev-mezon.nccsoft.vn/chat/clans/1955152072231882752/channels/1955152072282214400');

        await test.step(`Create private voice channel named "${textCategorylPrivate}"`, async () => {
            const created = await categoryPage.createCategory(textCategorylPrivate, 'private');
            expect(created).toBeTruthy();
            console.log(`Created private voice channel: ${textCategorylPrivate}`);
        });

        await test.step('Verify private voice channel exists', async () => {
            const exists = await categoryPage.isCategoryPresent(textCategorylPrivate);
            expect(exists).toBe(true);
        });
    });

    test('should create public category', async ({ page }) => {
        const categoryPage = new CategoryPage(page);

        await page.goto('https://dev-mezon.nccsoft.vn/chat/clans/1955152072231882752/channels/1955152072282214400');

        await test.step(`Create public voice channel named "${textCategoryPublic}"`, async () => {
            const created = await categoryPage.createCategory(textCategoryPublic, 'public');
            expect(created).toBeTruthy();
            console.log(`Created public voice channel: ${textCategoryPublic}`);
        });

        await test.step('Verify public voice channel exists', async () => {
            const exists = await categoryPage.isCategoryPresent(textCategoryPublic);
            expect(exists).toBe(true);
        });
    });

    test('should cancel creation of category with name containing special characters', async ({ page }) => {
        const categoryPage = new CategoryPage(page);

        await page.goto('https://dev-mezon.nccsoft.vn/chat/clans/1955152072231882752/channels/1955152072282214400');

        await test.step(`Attempt to create voice channel named "${textCategoryCancel}" and cancel`, async () => {
            const cancelled = await categoryPage.cancelCreateCategory(textCategoryCancel);
            expect(cancelled).toBe(true);
            console.log(`Cancelled creation of voice channel: ${textCategoryCancel}`);
        });

        await test.step('Verify voice channel was NOT created', async () => {
            const exists = await categoryPage.isCategoryPresent(textCategoryCancel);
            expect(exists).toBe(false);
        });
    });
});
