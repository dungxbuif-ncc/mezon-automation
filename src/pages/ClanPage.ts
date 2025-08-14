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

  private readonly clanNameSelectors = [
    '[data-testid="clan-name"]',
    '.clan-name',
    '.clan-header h1',
    '.clan-title',
    'h1:has-text("CLAN")',
    '[aria-label*="clan name" i]'
  ];

  private readonly invitePeopleSelectors = [
    '[data-testid="invite-people"]',
    'button:has-text("Invite People")',
    'a:has-text("Invite People")',
    '[aria-label*="invite people" i]',
    '.invite-button',
    '.invite-people-btn'
  ];

  private readonly createChannelSelectors = [
    '[data-testid="create-channel"]',
    'button:has-text("+")',
    '.create-channel-btn',
    '.add-channel',
    '[aria-label*="create channel" i]',
    '[aria-label*="add channel" i]'
  ];

  private readonly channelListSelectors = [
    '[data-testid="channel-list"]',
    '.channel-list',
    '.channels-container',
    '.sidebar-channels',
    'nav[aria-label*="channel" i]'
  ];

  private readonly messageInputSelectors = [
    'textarea#editorReactMentionChannel',
    'textarea[placeholder="Write your thoughts here..."]',
    'textarea.mentions__input',
    '[data-testid="message-input"]',
    'textarea[placeholder*="thoughts" i]',
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

    for (const selector of this.createClanButtonSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {

          await element.dblclick();

          await this.page.waitForTimeout(2000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    return false;
  }

  async createNewClan(clanName: string): Promise<boolean> {

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
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!nameInput) {
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
          await this.page.waitForTimeout(3000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async clickOnClanName(): Promise<boolean> {
    for (const selector of this.clanNameSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();

          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async openInvitePeopleModal(): Promise<boolean> {
    for (const selector of this.invitePeopleSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();

          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async searchAndInviteUser(username: string): Promise<boolean> {
    const searchSelectors = [
      '[data-testid="user-search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="user" i]',
      '.user-search',
      '.search-input'
    ];

    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          searchInput = element;

          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!searchInput) {

      return false;
    }

    await searchInput.fill(username);
    await this.page.waitForTimeout(1000);

    const inviteButtonSelectors = [
      `button:has-text("Invite"):near(:text("${username}"))`,
      '[data-testid="invite-user-btn"]',
      '.invite-btn',
      'button:has-text("Invite")'
    ];

    for (const selector of inviteButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();

          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async openCreateChannelModal(): Promise<boolean> {
    const channelListFound = await this.findChannelList();
    if (!channelListFound) {

      return false;
    }

    for (const selector of this.createChannelSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();

          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async findChannelList(): Promise<boolean> {
    for (const selector of this.channelListSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {

          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async createChannel(channelName: string, channelType: 'text' | 'voice' = 'text'): Promise<boolean> {
    const channelTypeSelectors = [
      `[data-testid="channel-type-${channelType}"]`,
      `button:has-text("${channelType}")`
    ];

    for (const selector of channelTypeSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();

          break;
        }
      } catch (e) {
        continue;
      }
    }

    const nameInputSelectors = [
      '[data-testid="channel-name-input"]',
      'input[placeholder*="channel name" i]',
      'input[placeholder*="name" i]',
      '.channel-name-input'
    ];

    let nameInput = null;
    for (const selector of nameInputSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          nameInput = element;

          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!nameInput) {

      return false;
    }

    await nameInput.fill(channelName);
    await this.page.waitForTimeout(500);

    const createButtonSelectors = [
      '[data-testid="create-channel-btn"]',
      'button:has-text("Create")',
      'button:has-text("Create Channel")',
      '.create-btn',
      '.create-channel-btn'
    ];

    for (const selector of createButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();

          await this.page.waitForTimeout(2000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async sendFirstMessage(message: string): Promise<boolean> {
    let messageInput = null;
    
    for (const selector of this.messageInputSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          messageInput = element;

          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!messageInput) {

      return false;
    }

    await messageInput.fill(message);
    await this.page.waitForTimeout(500);

    await messageInput.press('Enter');

    await this.page.waitForTimeout(2000);
    
    return true;
  }

  async verifyMessageSent(message: string): Promise<boolean> {
    const messageSelectors = [
      `div:has-text("${message}")`,
      `[data-testid="message"]:has-text("${message}")`,
      `.message:has-text("${message}")`,
      `.chat-message:has-text("${message}")`
    ];

    for (const selector of messageSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {

          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }
}
