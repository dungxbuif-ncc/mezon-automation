import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  private readonly onboardingGuideSelectors = [
    '[data-testid="onboarding-guide"]',
    '.onboarding-guide',
    'div:has-text("Onboarding guide")',
    '[aria-label*="onboarding" i]',
    '.guide-container',
    '.onboarding-container'
  ];

  private readonly taskSelectors = {
    sendFirstMessage: [
      '[data-testid="task-send-message"]',
      'div:has-text("Send first message")',
      '.task-item:has-text("Send first message")',
      '[aria-label*="send first message" i]'
    ],
    invitePeople: [
      '[data-testid="task-invite-people"]',
      'div:has-text("Invite People")',
      '.task-item:has-text("Invite People")',
      '[aria-label*="invite people" i]'
    ],
    createChannel: [
      '[data-testid="task-create-channel"]',
      'div:has-text("Create channel")',
      '.task-item:has-text("Create channel")',
      '[aria-label*="create channel" i]'
    ]
  };

  private readonly taskDoneIndicators = [
    '.task-done',
    '.task-completed',
    '[data-status="done"]',
    '[data-status="completed"]',
    '.checkmark',
    '.task-check',
    'svg[data-icon="check"]',
    '.fa-check'
  ];

  constructor(page: Page, baseURL?: string) {
    super(page, baseURL);
  }

  async openOnboardingGuide(): Promise<boolean> {
    for (const selector of this.onboardingGuideSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();
          console.log(`Opened onboarding guide using: ${selector}`);
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }

    console.log('Could not find onboarding guide');
    return false;
  }

  async isOnboardingGuideVisible(): Promise<boolean> {
    for (const selector of this.onboardingGuideSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found onboarding guide using: ${selector}`);
          return true;
        }
      } catch (e) {
        continue;
      }
    }
    return false;
  }

  async getTaskStatus(taskType: 'sendFirstMessage' | 'invitePeople' | 'createChannel'): Promise<{
    found: boolean;
    isDone: boolean;
    selector?: string;
  }> {
    const selectors = this.taskSelectors[taskType];

    for (const selector of selectors) {
      try {
        const taskElement = this.page.locator(selector).first();
        if (await taskElement.isVisible({ timeout: 2000 })) {
          let isDone = false;

          for (const doneSelector of this.taskDoneIndicators) {
            try {
              const doneIndicator = taskElement.locator(doneSelector).first();
              if (await doneIndicator.isVisible({ timeout: 1000 })) {
                isDone = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }

          if (!isDone) {
            const parent = taskElement.locator('..');
            for (const doneSelector of this.taskDoneIndicators) {
              try {
                const doneIndicator = parent.locator(doneSelector).first();
                if (await doneIndicator.isVisible({ timeout: 1000 })) {
                  isDone = true;
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }

          console.log(`Task "${taskType}" found using: ${selector}, Done: ${isDone}`);
          return { found: true, isDone, selector };
        }
      } catch (e) {
        continue;
      }
    }

    console.log(`Task "${taskType}" not found`);
    return { found: false, isDone: false };
  }

  async getAllTasksStatus(): Promise<{
    sendFirstMessage: { found: boolean; isDone: boolean };
    invitePeople: { found: boolean; isDone: boolean };
    createChannel: { found: boolean; isDone: boolean };
  }> {
    const sendFirstMessage = await this.getTaskStatus('sendFirstMessage');
    const invitePeople = await this.getTaskStatus('invitePeople');
    const createChannel = await this.getTaskStatus('createChannel');

    return {
      sendFirstMessage: { found: sendFirstMessage.found, isDone: sendFirstMessage.isDone },
      invitePeople: { found: invitePeople.found, isDone: invitePeople.isDone },
      createChannel: { found: createChannel.found, isDone: createChannel.isDone }
    };
  }

  // async waitForTaskToBeMarkedDone(taskType: 'sendFirstMessage' | 'invitePeople' | 'createChannel', timeoutMs: number = 5000): Promise<boolean> {
  //   console.log(`Waiting for task "${taskType}" to be marked as done...`);

  //   const startTime = Date.now();

  //   while (Date.now() - startTime < timeoutMs) {
  //     const taskStatus = await this.getTaskStatus(taskType);

  //     if (taskStatus.found && taskStatus.isDone) {
  //       console.log(`Task "${taskType}" is now marked as done!`);
  //       return true;
  //     }

  //     await this.page.waitForTimeout(500);
  //   }

  //   console.log(`Task "${taskType}" was not marked as done within ${timeoutMs}ms`);
  //   return false;
  // }

  async debugOnboardingTasks(): Promise<void> {
    console.log('Debugging onboarding tasks...');

    await this.takeScreenshot('debug-onboarding-tasks');

    const allTasks = this.page.locator('div:has-text("Send first message"), div:has-text("Invite People"), div:has-text("Create channel"), .task-item, .onboarding-task');
    const count = await allTasks.count();

    console.log(`Found ${count} potential task elements`);

    for (let i = 0; i < Math.min(count, 10); i++) {
      try {
        const task = allTasks.nth(i);
        const isVisible = await task.isVisible();
        const text = await task.textContent();

        if (isVisible && text) {
          console.log(`  Task ${i}: "${text.slice(0, 50)}..."`);

          const hasDoneIndicator = await task.locator(this.taskDoneIndicators.join(', ')).first().isVisible().catch(() => false);
          console.log(`Done indicator: ${hasDoneIndicator}`);
        }
      } catch (e) {
        console.log(`  Task ${i}: Could not inspect`);
      }
    }
  }
}
