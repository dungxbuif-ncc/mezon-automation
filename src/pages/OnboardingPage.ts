import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class OnboardingPage extends BasePage {
  private readonly onboardingGuideSelectors = [
    '[data-testid="onboarding-guide"]',
    '.onboarding-guide',
    'div:has-text("Onboarding guide")',
    'div:has-text("Invite your friends")',
    '.invite-friends-container',
    '[aria-label*="onboarding" i]',
    '.guide-container',
    '.onboarding-container',
    'div:has(div:has-text("Invite your friends"))'
  ];

  private readonly taskSelectors = {
    sendFirstMessage: [
      'div:has-text("Send your first message")',
      'div.flex-1:has-text("Send your first message")',
      '[data-testid="task-send-message"]',
      'div:has-text("Send first message")',
      '.task-item:has-text("Send first message")',
      '[aria-label*="send first message" i]'
    ],
    invitePeople: [
      '[data-testid="task-invite-people"]',
      'div:has-text("Invite your friends")',
      'div:has-text("Invite People")',
      '.task-item:has-text("Invite")',
      '[aria-label*="invite" i]'
    ],
    createChannel: [
      '[data-testid="task-create-channel"]',
      'div:has-text("Create channel")',
      'div:has-text("Create your first channel")',
      '.task-item:has-text("Create channel")',
      '[aria-label*="create channel" i]'
    ]
  };

  private readonly taskDoneIndicators = [
    'div.rounded-full.bg-green-600',
    'div.flex.items-center.justify-center.rounded-full.aspect-square.h-8.bg-green-600',
    '.bg-green-600.rounded-full',
    '.bg-green-600',
    'div.bg-green-600'
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
          await this.page.waitForTimeout(1000);
          return true;
        }
      } catch (e) {
        continue;
      }
    }


    return false;
  }

  async isOnboardingGuideVisible(): Promise<boolean> {
    for (const selector of this.onboardingGuideSelectors) {
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

  async getTaskStatus(taskType: 'sendFirstMessage' | 'invitePeople' | 'createChannel'): Promise<{
    found: boolean;
    isDone: boolean;
    selector?: string;
  }> {

    const onboardingArea = this.page.locator('div:has-text("Invite your friends")').first();
    const allTaskRows = onboardingArea.locator('div.w-\\[400px\\].gap-4');
    const rowCount = await allTaskRows.count();
    
    for (let i = 0; i < rowCount; i++) {
      try {
        const row = allTaskRows.nth(i);
        const rowText = await row.textContent();
        
        const isCorrectRow = (taskType === 'sendFirstMessage' && rowText?.includes('Send your first message')) ||
                           (taskType === 'invitePeople' && rowText?.includes('Invite your friends')) ||
                           (taskType === 'createChannel' && rowText?.includes('Create your channel'));
        
        if (isCorrectRow) {

          
          let isDone = false;
          for (const doneSelector of this.taskDoneIndicators) {
            try {
              const doneIndicator = row.locator(doneSelector).first();
              if (await doneIndicator.isVisible({ timeout: 1000 })) {
                isDone = true;

                break;
              }
            } catch (e) {
              continue;
            }
          }
          

          

          return { found: true, isDone, selector: `row-${i}` };
        }
      } catch (e) {
        continue;
      }
    }


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

  async waitForTaskToBeMarkedDone(taskType: 'sendFirstMessage' | 'invitePeople' | 'createChannel', timeoutMs: number = 5000): Promise<boolean> {

    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const taskStatus = await this.getTaskStatus(taskType);
      
      if (taskStatus.found && taskStatus.isDone) {

        return true;
      }
      
      await this.page.waitForTimeout(500);
    }
    

    return false;
  }

  async debugOnboardingTasks(): Promise<void> {

    await this.takeScreenshot('debug-onboarding-tasks');
    
    // Debug specific onboarding guide area
    const onboardingArea = this.page.locator('div:has-text("Invite your friends")').first();
    
    // Look for all task rows in onboarding area
    const taskRows = onboardingArea.locator('div.w-\\[400px\\].gap-4');
    const rowCount = await taskRows.count();

    for (let i = 0; i < rowCount; i++) {
      try {
        const row = taskRows.nth(i);
        const text = await row.textContent();
        const hasGreenTick = await row.locator(this.taskDoneIndicators.join(', ')).first().isVisible().catch(() => false);
        


        
        if (hasGreenTick) {
          const greenTickElement = await row.locator(this.taskDoneIndicators.join(', ')).first();
          const tickClass = await greenTickElement.getAttribute('class');

        }
      } catch (e) {

      }
    }
  }
}
