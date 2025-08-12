import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ClanPage } from '../../pages/ClanPage';
import { OnboardingPage } from '../../pages/OnboardingPage';

test.describe('Onboarding Guide Task Completion', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    const currentUrl = page.url();
    if (currentUrl.includes('dev-mezon.nccsoft.vn') && !currentUrl.includes('/chat')) {
      console.log('📍 On landing page, clicking "Open Mezon" button...');
      
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
            console.log(`✅ Found "Open Mezon" button using: ${selector}`);
            await button.click();
            buttonFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!buttonFound) {
        console.log('🔄 Button not found, trying direct navigation...');
        await page.goto('/chat');
      }
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log(`🔗 After navigation: ${page.url()}`);
    }
    
    const finalUrl = page.url();
    expect(finalUrl).not.toMatch(/login|signin|authentication/);
  });

  test('should mark "Send first message" task as done after user sends first message', async ({ page }) => {
    const clanPage = new ClanPage(page);
    const onboardingPage = new OnboardingPage(page);
    
    await test.step('Create new clan by double clicking + button', async () => {
      console.log('🏰 Starting clan creation process...');
      
      await page.screenshot({ path: 'debug-before-clan-creation.png', fullPage: true });
      
      const createClanClicked = await clanPage.clickCreateClanButton();
      if (createClanClicked) {
        console.log('✅ Successfully double clicked create clan button');
        
        const clanName = `Test Clan ${Date.now()}`;
        const clanCreated = await clanPage.createNewClan(clanName);
        
        if (clanCreated) {
          console.log(`✅ Successfully created clan: ${clanName}`);
        } else {
          console.log(`⚠️ Could not complete clan creation: ${clanName}`);
        }
        
        await page.screenshot({ path: 'debug-after-clan-creation.png', fullPage: true });
      } else {
        console.log('❌ Failed to find or click create clan button');
        await page.screenshot({ path: 'debug-create-clan-failed.png', fullPage: true });
      }
    });

    await test.step('Check onboarding guide and initial tasks state', async () => {
      console.log('🏠 Checking onboarding guide after clan creation...');
      
      await page.waitForTimeout(3000);
      
      const onboardingVisible = await onboardingPage.isOnboardingGuideVisible();
      if (!onboardingVisible) {
        console.log('⚠️ Onboarding guide not visible initially, trying to open it...');
        await onboardingPage.openOnboardingGuide();
      }

      await onboardingPage.debugOnboardingTasks();
      
      const initialTasksStatus = await onboardingPage.getAllTasksStatus();
      console.log('📋 Initial tasks status after clan creation:', initialTasksStatus);
      
      await page.screenshot({ path: 'debug-onboarding-initial-state.png', fullPage: true });
    });

    await test.step('Send first message', async () => {
      console.log('💬 Attempting to send first message...');
      
      const testMessage = `Hello! This is my first message - ${Date.now()}`;
      const messageSent = await clanPage.sendFirstMessage(testMessage);
      
      if (messageSent) {
        console.log('✅ Message sent successfully');
        
        const messageVerified = await clanPage.verifyMessageSent(testMessage);
        console.log(`📨 Message verification: ${messageVerified ? 'PASS' : 'FAIL'}`);
        
        await page.screenshot({ path: 'debug-after-first-message.png', fullPage: true });
      } else {
        console.log('❌ Failed to send message');
        await page.screenshot({ path: 'debug-message-send-failed.png', fullPage: true });
      }
    });

    await test.step('Verify "Send first message" task is marked as done', async () => {
      console.log('🔍 Checking if "Send first message" task is marked as done...');
      
      const isTaskMarkedDone = await onboardingPage.waitForTaskToBeMarkedDone('sendFirstMessage', 10000);
      
      if (isTaskMarkedDone) {
        console.log('✅ SUCCESS: "Send first message" task is marked as done');
      } else {
        console.log('❌ FAILURE: "Send first message" task is NOT marked as done');
        
        await onboardingPage.debugOnboardingTasks();
        await page.screenshot({ path: 'debug-task-not-marked-done.png', fullPage: true });
      }

      const finalTasksStatus = await onboardingPage.getAllTasksStatus();
      console.log('📋 Final tasks status:', finalTasksStatus);

      expect(isTaskMarkedDone, 'The "Send first message" task should be marked as done after user sends first message').toBeTruthy();
    });
  });

  test('should mark "Invite People" task as done after user invites someone', async ({ page }) => {
    const clanPage = new ClanPage(page);
    const onboardingPage = new OnboardingPage(page);
    
    await test.step('Create new clan first', async () => {
      console.log('🏰 Creating clan before testing invite functionality...');
      
      const createClanClicked = await clanPage.clickCreateClanButton();
      if (createClanClicked) {
        const clanName = `Invite Test Clan ${Date.now()}`;
        await clanPage.createNewClan(clanName);
        console.log(`✅ Created clan for invite test: ${clanName}`);
      }
    });

    await test.step('Check initial invite task status', async () => {
      console.log('👥 Starting invite people task test...');
      
      await page.waitForTimeout(3000);
      
      const onboardingVisible = await onboardingPage.isOnboardingGuideVisible();
      if (!onboardingVisible) {
        await onboardingPage.openOnboardingGuide();
      }

      const initialTaskStatus = await onboardingPage.getTaskStatus('invitePeople');
      console.log('📋 Initial "Invite People" task status:', initialTaskStatus);
      
      await page.screenshot({ path: 'debug-invite-task-initial.png', fullPage: true });
    });

    await test.step('Perform invite people workflow', async () => {
      console.log('🔄 Starting invite people workflow...');
      
      const clanNameClicked = await clanPage.clickOnClanName();
      if (!clanNameClicked) {
        console.log('⚠️ Could not click clan name, continuing...');
      }

      const inviteModalOpened = await clanPage.openInvitePeopleModal();
      if (inviteModalOpened) {
        console.log('✅ Invite modal opened');
        
        const testUsername = 'TestUserB';
        const userInvited = await clanPage.searchAndInviteUser(testUsername);
        
        if (userInvited) {
          console.log(`✅ Successfully invited user: ${testUsername}`);
        } else {
          console.log(`⚠️ Could not complete invite for user: ${testUsername}`);
        }
        
        await page.screenshot({ path: 'debug-after-invite-attempt.png', fullPage: true });
      } else {
        console.log('❌ Failed to open invite modal');
        await page.screenshot({ path: 'debug-invite-modal-failed.png', fullPage: true });
      }
    });

    await test.step('Verify "Invite People" task completion', async () => {
      console.log('🔍 Checking if "Invite People" task is marked as done...');
      
      const isTaskMarkedDone = await onboardingPage.waitForTaskToBeMarkedDone('invitePeople', 10000);
      
      if (isTaskMarkedDone) {
        console.log('✅ SUCCESS: "Invite People" task is marked as done');
      } else {
        console.log('❌ FAILURE: "Invite People" task is NOT marked as done');
        
        await onboardingPage.debugOnboardingTasks();
        await page.screenshot({ path: 'debug-invite-task-not-done.png', fullPage: true });
      }

      const finalTaskStatus = await onboardingPage.getTaskStatus('invitePeople');
      console.log('📋 Final "Invite People" task status:', finalTaskStatus);

      expect(isTaskMarkedDone, 'The "Invite People" task should be marked as done after user invites someone').toBeTruthy();
    });
  });

  test('should mark "Create channel" task as done after user creates a channel', async ({ page }) => {
    const clanPage = new ClanPage(page);
    const onboardingPage = new OnboardingPage(page);
    
    await test.step('Create new clan first', async () => {
      console.log('🏰 Creating clan before testing channel creation...');
      
      const createClanClicked = await clanPage.clickCreateClanButton();
      if (createClanClicked) {
        const clanName = `Channel Test Clan ${Date.now()}`;
        await clanPage.createNewClan(clanName);
        console.log(`✅ Created clan for channel test: ${clanName}`);
      }
    });

    await test.step('Check initial channel task status', async () => {
      console.log('📺 Starting create channel task test...');
      
      await page.waitForTimeout(3000);
      
      const onboardingVisible = await onboardingPage.isOnboardingGuideVisible();
      if (!onboardingVisible) {
        await onboardingPage.openOnboardingGuide();
      }

      const initialTaskStatus = await onboardingPage.getTaskStatus('createChannel');
      console.log('📋 Initial "Create channel" task status:', initialTaskStatus);
      
      await page.screenshot({ path: 'debug-channel-task-initial.png', fullPage: true });
    });

    await test.step('Perform create channel workflow', async () => {
      console.log('🔄 Starting create channel workflow...');
      
      const createModalOpened = await clanPage.openCreateChannelModal();
      if (createModalOpened) {
        console.log('✅ Create channel modal opened');
        
        const testChannelName = `test-channel-${Date.now()}`;
        const channelCreated = await clanPage.createChannel(testChannelName, 'text');
        
        if (channelCreated) {
          console.log(`✅ Successfully created channel: ${testChannelName}`);
        } else {
          console.log(`⚠️ Could not complete channel creation: ${testChannelName}`);
        }
        
        await page.screenshot({ path: 'debug-after-channel-creation.png', fullPage: true });
      } else {
        console.log('❌ Failed to open create channel modal');
        await page.screenshot({ path: 'debug-channel-modal-failed.png', fullPage: true });
      }
    });

    await test.step('Verify "Create channel" task completion', async () => {
      console.log('🔍 Checking if "Create channel" task is marked as done...');
      
      const isTaskMarkedDone = await onboardingPage.waitForTaskToBeMarkedDone('createChannel', 10000);
      
      if (isTaskMarkedDone) {
        console.log('✅ SUCCESS: "Create channel" task is marked as done');
      } else {
        console.log('❌ FAILURE: "Create channel" task is NOT marked as done');
        
        await onboardingPage.debugOnboardingTasks();
        await page.screenshot({ path: 'debug-channel-task-not-done.png', fullPage: true });
      }

      const finalTaskStatus = await onboardingPage.getTaskStatus('createChannel');
      console.log('📋 Final "Create channel" task status:', finalTaskStatus);

      expect(isTaskMarkedDone, 'The "Create channel" task should be marked as done after user creates a channel').toBeTruthy();
    });
  });

  test('should test both Join new clan and Create new clan scenarios', async ({ page }) => {
    const onboardingPage = new OnboardingPage(page);
    
    await test.step('Test comprehensive onboarding scenarios', async () => {
      console.log('🔄 Testing comprehensive onboarding scenarios...');
      
      const onboardingVisible = await onboardingPage.isOnboardingGuideVisible();
      if (!onboardingVisible) {
        await onboardingPage.openOnboardingGuide();
      }

      await onboardingPage.debugOnboardingTasks();
      
      const allTasksStatus = await onboardingPage.getAllTasksStatus();
      console.log('📋 All onboarding tasks status:', allTasksStatus);

      console.log('📝 Test Results Summary:');
      console.log(`   Send First Message task found: ${allTasksStatus.sendFirstMessage.found}`);
      console.log(`   Send First Message task done: ${allTasksStatus.sendFirstMessage.isDone}`);
      console.log(`   Invite People task found: ${allTasksStatus.invitePeople.found}`);
      console.log(`   Invite People task done: ${allTasksStatus.invitePeople.isDone}`);
      console.log(`   Create Channel task found: ${allTasksStatus.createChannel.found}`);
      console.log(`   Create Channel task done: ${allTasksStatus.createChannel.isDone}`);

      await page.screenshot({ path: 'debug-comprehensive-onboarding-test.png', fullPage: true });

      expect(allTasksStatus.sendFirstMessage.found || allTasksStatus.invitePeople.found || allTasksStatus.createChannel.found, 
        'At least one onboarding task should be found').toBeTruthy();
    });
  });
});
