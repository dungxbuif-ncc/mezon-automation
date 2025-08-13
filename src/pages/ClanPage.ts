import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ClanPage extends BasePage {
  private readonly createClanButtonSelectors = [
    'div[onclick*="openCreateClanModal"]',
    'div.flex.items-center.justify-between.text-theme-primary.group[onclick*="openCreateClanModal"]',
    'div.group:has(p.text-2xl.font-semibold:has-text("+"))',
    'div:has(p:has-text("+"))',
    'p.text-2xl.font-semibold:has-text("+"):up(div)',
    '[onclick*="openCreateClanModal"]',
    '[data-testid="create-clan"]',
    'button:has-text("+")',
    '.create-clan-btn',
    '.add-clan-btn',
    '[aria-label*="create clan" i]',
    '[aria-label*="add clan" i]'
  ];

  private readonly messageInputSelectors = [
    '[data-testid="message-input"]',
    'textarea[placeholder*="message" i]',
    'input[placeholder*="message" i]',
    '.message-input',
    '.chat-input',
    '[aria-label*="message" i]'
  ];

  constructor(page: Page, baseURL?: string) {
    super(page, baseURL);
  }

  async clickCreateClanButton(): Promise<boolean> {
    console.log('🔍 Looking for create clan button (+)...');

    for (const selector of this.createClanButtonSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          console.log(`✅ Found create clan button using: ${selector}`);
          await element.dblclick();
          console.log('🖱️ Double clicked on create clan button');
          await this.page.waitForTimeout(2000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    console.log('❌ Could not find create clan button');
    return false;
  }

  async createNewClan(clanName: string): Promise<boolean> {
    console.log(`🏰 Creating new clan: ${clanName}`);

    const clanNameInputSelectors = [
      '[data-testid="clan-name-input"]',
      'input[placeholder*="clan name" i]',
      'input[placeholder*="name" i]',
      '.clan-name-input',
      'input[type="text"]'
    ];

    let nameInput = null;
    for (const selector of clanNameInputSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          nameInput = element;
          console.log(`✅ Found clan name input using: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!nameInput) {
      console.log('❌ Could not find clan name input');
      return false;
    }

    await nameInput.fill(clanName);
    await this.page.waitForTimeout(500);

    const createButtonSelectors = [
      '[data-testid="create-clan-btn"]',
      'button:has-text("Create")',
      'button:has-text("Create Clan")',
      '.create-btn',
      '.create-clan-btn'
    ];

    for (const selector of createButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log(`✅ Created clan "${clanName}" using: ${selector}`);
          await this.page.waitForTimeout(3000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    console.log(`❌ Could not find create clan button`);
    return false;
  }
}
