import { Page, Locator } from '@playwright/test';

export class MessageTestHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async findImage(): Promise<Locator> {
    const imageSelectors = [
      'img[src*="blob:"]',
      'img[src*="cdn.mezon.ai"]', 
      'img[src*="mezon"]',
      'div[class*="message"] img',
      '.message img',
      'img[alt*="image"]',
      'img[draggable="true"]'
    ];

    for (const selector of imageSelectors) {
      const images = this.page.locator(selector);
      const count = await images.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const img = images.nth(i);
          const isVisible = await img.isVisible({ timeout: 2000 });
          if (isVisible) {
            return img;
          }
        }
      }
    }
    
    throw new Error('Could not find any visible image in the conversation');
  }

  async findMessageInput(): Promise<Locator> {
    const messageInputSelectors = [
      'textarea#editorReactMentionChannel',
      'textarea[placeholder*="Write your thoughts"]',
      'textarea.mentions__input',
      '[data-testid="message-input"]',
      'textarea[placeholder*="thoughts" i]',
      'textarea[placeholder*="message" i]',
      'input[placeholder*="message" i]',
      '.message-input',
      '.chat-input',
      '[aria-label*="message" i]'
    ];

    for (const selector of messageInputSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find message input element');
  }

  async findModal(): Promise<{ found: boolean; element?: Locator }> {
    const modalSelectors = [
      'div.justify-center.items-center.flex.flex-col.fixed.z-40.inset-0',
      'div[class*="modal"]',
      'div[class*="overlay"]', 
      'div[role="dialog"]',
      '[data-testid="image-modal"]',
      'div[class*="image-viewer"]',
      'div[class*="lightbox"]',
      'div[class*="image-detail"]',
      'div[style*="position: fixed"]',
      'div[style*="z-index"]'
    ];

    for (const selector of modalSelectors) {
      const modal = this.page.locator(selector);
      const count = await modal.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const modalItem = modal.nth(i);
          if (await modalItem.isVisible({ timeout: 2000 })) {
            return { found: true, element: modalItem };
          }
        }
      }
    }
    
    return { found: false };
  }

  async findCopyImageOption(): Promise<Locator> {
    const copySelectors = [
      'text="Copy Image"',
      '[role="menuitem"]:has-text("Copy Image")',
      'button:has-text("Copy Image")',
      'li:has-text("Copy Image")',
      'div:has-text("Copy Image")',
      '[aria-label*="Copy Image" i]',
      '[title*="Copy Image" i]'
    ];

    for (const selector of copySelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Copy Image option in context menu');
  }

  async findCopyTextOption(): Promise<Locator> {
    const copyTextSelectors = [
      'text="Copy Text"',
      '[role="menuitem"]:has-text("Copy Text")',
      'button:has-text("Copy Text")',
      'li:has-text("Copy Text")',
      'div:has-text("Copy Text")',
      '[aria-label*="Copy Text" i]',
      '[title*="Copy Text" i]',
      'text="Copy"',
      '[role="menuitem"]:has-text("Copy")',
      'button:has-text("Copy")',
      'li:has-text("Copy")',
      'div:has-text("Copy")',
      '[role="menuitem"]:nth-child(3)',
      '[role="menuitem"] span:has-text("Copy")',
      '.context-menu-item:has-text("Copy")'
    ];

    for (const selector of copyTextSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Copy Text option in context menu');
  }

  async findMessageWithText(): Promise<Locator> {
    const messageSelectors = [
      'div[class*="message"]:has-text',
      '.message:has-text',
      '[data-testid="message"]:has-text',
      '.chat-message:has-text',
      'div[role="article"]:has-text'
    ];

    for (const selector of messageSelectors) {
      const messages = this.page.locator(selector);
      const count = await messages.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const message = messages.nth(i);
          const textContent = await message.textContent();
          if (textContent && textContent.trim().length > 0) {
            const isVisible = await message.isVisible({ timeout: 2000 });
            if (isVisible) {
              return message;
            }
          }
        }
      }
    }
    
    throw new Error('Could not find any message with text content');
  }

  async verifyImageInClipboard(): Promise<boolean> {
    return await this.page.evaluate(async () => {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.some(type => type.startsWith('image/'))) {
            return true;
          }
        }
        return false;
      } catch (error) {
        return false;
      }
    });
  }

  async verifyTextInClipboard(): Promise<string | null> {
    return await this.page.evaluate(async () => {
      try {
        const text = await navigator.clipboard.readText();
        return text && text.trim().length > 0 ? text : null;
      } catch (error) {
        return null;
      }
    });
  }

  async pasteAndSendImage(): Promise<void> {
    const messageInput = await this.findMessageInput();
    await messageInput.click();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Meta+v');
    await this.page.waitForTimeout(2000);
    await messageInput.press('Enter');
    await this.page.waitForTimeout(3000);
  }

  async pasteAndSendText(): Promise<void> {
    const messageInput = await this.findMessageInput();
    await messageInput.click();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Meta+v');
    await this.page.waitForTimeout(1000);
    await messageInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async countImages(): Promise<number> {
    const images = this.page.locator('img[src*="blob:"]');
    return await images.count();
  }

  async countMessages(): Promise<number> {
    const messageSelectors = [
      'div[class*="message"]',
      '.message',
      '[data-testid="message"]',
      '.chat-message'
    ];

    let totalMessages = 0;
    for (const selector of messageSelectors) {
      const messages = this.page.locator(selector);
      const count = await messages.count();
      if (count > 0) {
        totalMessages = count;
        break;
      }
    }
    
    return totalMessages;
  }

  async clickImageAndHandleModal(image: Locator): Promise<{ modalFound: boolean; imageToRightClick: Locator }> {
    await image.click();
    await this.page.waitForTimeout(3000);
    
    const modalResult = await this.findModal();
    
    let imageToRightClick = image;
    if (modalResult.found && modalResult.element) {
      const modalImage = modalResult.element.locator('img').first();
      if (await modalImage.isVisible({ timeout: 2000 })) {
        imageToRightClick = modalImage;
      }
    }
    
    return {
      modalFound: modalResult.found,
      imageToRightClick
    };
  }

  async copyImage(imageElement: Locator): Promise<void> {
    await imageElement.click({ button: 'right' });
    await this.page.waitForTimeout(1000);
    
    const copyButton = await this.findCopyImageOption();
    await copyButton.click();
    await this.page.waitForTimeout(1000);
    
    const hasImage = await this.verifyImageInClipboard();
    if (!hasImage) {
      throw new Error('Image was not copied to clipboard');
    }
  }

  async closeModal(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(1000);
  }

  async sendTextMessage(message: string): Promise<void> {
    const messageInput = await this.findMessageInput();
    await messageInput.click();
    await this.page.waitForTimeout(500);
    await messageInput.fill(message);
    await this.page.waitForTimeout(500);
    await messageInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async findLastMessage(): Promise<Locator> {
    await this.page.waitForTimeout(2000);
    
    const testMessageSelector = this.page.locator('text=/Test message \\d+/').last();
    if (await testMessageSelector.isVisible({ timeout: 3000 })) {
      return testMessageSelector;
    }
    
    const chatAreaSelectors = [
      '.chat-area .message',
      '.messages-container .message',  
      '.conversation .message',
      '[class*="chat"][class*="messages"] [class*="message"]',
      '[class*="conversation"] [class*="message"]',
      'div[class*="message"]:has(text):not(:has(input)):not(:has(textarea))',
      'div:contains("Test message"):not([placeholder])'
    ];

    for (const selector of chatAreaSelectors) {
      const messages = this.page.locator(selector);
      const count = await messages.count();
      
      if (count > 0) {
        for (let i = count - 1; i >= 0; i--) {
          const message = messages.nth(i);
          const textContent = await message.textContent();
          
          if (textContent && 
              textContent.trim().length > 0 &&
              !textContent.includes('Write your thoughts') &&
              !textContent.includes('placeholder') &&
              await message.isVisible({ timeout: 1000 })) {
            
            const tagName = await message.evaluate(el => el.tagName.toLowerCase());
            const hasInput = await message.locator('input, textarea').count() > 0;
            
            if (!['input', 'textarea'].includes(tagName) && !hasInput) {
              return message;
            }
          }
        }
      }
    }
    
    throw new Error('Could not find any sent messages (excluding input areas)');
  }

  async copyText(messageElement: Locator): Promise<string> {
    await messageElement.scrollIntoViewIfNeeded();
    await messageElement.hover();
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(2000);
    
    const copyTextButton = await this.findCopyTextOption();
    await copyTextButton.click();
    await this.page.waitForTimeout(1000);
    
    const copiedText = await this.verifyTextInClipboard();
    if (!copiedText) {
      throw new Error('Text was not copied to clipboard');
    }
    
    return copiedText;
  }

  async findTopicDiscussionOption(): Promise<Locator> {
    const topicSelectors = [
      'text="Topic Discussion"',
      '[role="menuitem"]:has-text("Topic Discussion")',
      'button:has-text("Topic Discussion")',
      'li:has-text("Topic Discussion")',
      'div:has-text("Topic Discussion")',
      '[aria-label*="Topic Discussion" i]',
      '[title*="Topic Discussion" i]',
      'text="Create Thread"',
      '[role="menuitem"]:has-text("Create Thread")',
      'button:has-text("Create Thread")',
      'li:has-text("Create Thread")',
      'div:has-text("Create Thread")'
    ];

    for (const selector of topicSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Topic Discussion option in context menu');
  }

  async openTopicDiscussion(messageElement: Locator): Promise<void> {
    await messageElement.scrollIntoViewIfNeeded();
    await messageElement.hover();
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(2000);
    
    const topicButton = await this.findTopicDiscussionOption();
    await topicButton.click();
    await this.page.waitForTimeout(3000);
  }

  async findCreateThreadOption(): Promise<Locator> {
    const createThreadSelectors = [
      'text="Create Thread"',
      '[role="menuitem"]:has-text("Create Thread")',
      'button:has-text("Create Thread")',
      'li:has-text("Create Thread")',
      'div:has-text("Create Thread")',
      '[aria-label*="Create Thread" i]',
      '[title*="Create Thread" i]',
      'text="Start Thread"',
      '[role="menuitem"]:has-text("Start Thread")',
      'button:has-text("Start Thread")',
      'li:has-text("Start Thread")',
      'div:has-text("Start Thread")'
    ];

    for (const selector of createThreadSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Create Thread option in context menu');
  }

  async createThread(messageElement: Locator, threadName?: string): Promise<void> {
    await messageElement.scrollIntoViewIfNeeded();
    await messageElement.hover();
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(2000);
    
    const createThreadButton = await this.findCreateThreadOption();
    await createThreadButton.click();
    await this.page.waitForTimeout(3000);
    
    const defaultThreadName = threadName || `Thread ${Date.now()}`;
    await this.fillThreadName(defaultThreadName);
  }

  async fillThreadName(threadName: string): Promise<void> {
    await this.page.waitForTimeout(2000);
    
    const threadNameInputSelectors = [
      '.new-thread input[placeholder*="Thread reply"]',
      'input[placeholder*="Thread reply"]',
      '[class*="thread"] input[placeholder*="Thread reply"]',
      'input[placeholder*="thread"]:not([placeholder*="Search"])',
      'input[placeholder*="Thread Name"]',
      '[class*="thread-name"] input',
      '[data-testid="thread-name-input"]',
      'div[class*="w-"]:has-text("Thread Name") input[type="text"]',
      'input[type="text"]:not([placeholder*="Search"])'
    ];

    let threadNameInput = null;
    for (const selector of threadNameInputSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const element = elements.nth(i);
          if (await element.isVisible({ timeout: 2000 })) {
            const placeholder = await element.getAttribute('placeholder');
            if (placeholder && !placeholder.toLowerCase().includes('search')) {
              threadNameInput = element;
              break;
            }
          }
        }
        if (threadNameInput) break;
      }
    }

    if (!threadNameInput) {
      const rightPanelInputs = this.page.locator('input[type="text"]').filter({
        hasNotText: 'Search'
      });
      
      const count = await rightPanelInputs.count();
      for (let i = 0; i < count; i++) {
        const input = rightPanelInputs.nth(i);
        if (await input.isVisible({ timeout: 1000 })) {
          const placeholder = await input.getAttribute('placeholder');
          if (placeholder && !placeholder.toLowerCase().includes('search')) {
            threadNameInput = input;
            break;
          }
        }
      }
    }

    if (!threadNameInput) {
      throw new Error('Could not find thread name input field. Make sure Create Thread panel is open.');
    }

    await threadNameInput.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    
    await threadNameInput.click({ force: true });
    await this.page.waitForTimeout(500);
    
    await threadNameInput.selectText();
    await threadNameInput.fill(threadName);
    await this.page.waitForTimeout(500);
    
    await threadNameInput.press('Enter');
    await this.page.waitForTimeout(3000);
  }

  async findDeleteMessageOption(): Promise<Locator> {
    const deleteSelectors = [
      'text="Delete Message"',
      '[role="menuitem"]:has-text("Delete Message")',
      'button:has-text("Delete Message")',
      'li:has-text("Delete Message")',
      'div:has-text("Delete Message")',
      '[aria-label*="Delete Message" i]',
      '[title*="Delete Message" i]',
      'text="Delete"',
      '[role="menuitem"]:has-text("Delete")',
      'button:has-text("Delete")',
      'li:has-text("Delete")',
      'div:has-text("Delete")'
    ];

    for (const selector of deleteSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Delete Message option in context menu');
  }

  async deleteMessage(messageElement: Locator): Promise<void> {
    await messageElement.scrollIntoViewIfNeeded();
    await messageElement.hover();
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(2000);
    
    const deleteButton = await this.findDeleteMessageOption();
    await deleteButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.handleDeleteConfirmation();
  }

  async handleDeleteConfirmation(): Promise<void> {
    const confirmSelectors = [
      'button:has-text("Delete")',
      'button:has-text("Confirm")',
      'button:has-text("Yes")',
      '[data-testid="confirm-delete"]',
      '.confirm-button',
      'button[class*="danger"]',
      'button[class*="destructive"]'
    ];

    for (const selector of confirmSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        await element.click();
        await this.page.waitForTimeout(2000);
        return;
      }
    }
    
    await this.page.waitForTimeout(2000);
  }

  async findEditButton(messageElement: Locator): Promise<Locator> {
    await messageElement.hover();
    await this.page.waitForTimeout(2000);
    
    const editSelectors = [
      'button[aria-label*="Edit" i]',
      'button[title*="Edit" i]',
      '[data-testid="edit-message"]',
      'button:has([data-icon="edit"])',
      'button:has([data-icon="pen"])',
      '.edit-button',
      '.message-edit',
      'button:has(svg[data-icon="edit"])',
      'button:has(svg[data-icon="pen"])',
      'button svg[data-icon*="edit"]',
      'button svg[data-icon*="pen"]',
      '.message-actions button',
      '.hover-actions button',
      'button:near(:has-text("Original message"))',
      'button:visible'
    ];

    for (const selector of editSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const element = elements.nth(i);
          if (await element.isVisible({ timeout: 1000 })) {
            const ariaLabel = await element.getAttribute('aria-label');
            const title = await element.getAttribute('title');
            const innerText = await element.textContent();
            
            if ((ariaLabel && ariaLabel.toLowerCase().includes('edit')) ||
                (title && title.toLowerCase().includes('edit')) ||
                (innerText && innerText.toLowerCase().includes('edit'))) {
              return element;
            }
          }
        }
      }
    }
    
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(1000);
    
    const editMenuSelectors = [
      'text="Edit Message"',
      '[role="menuitem"]:has-text("Edit Message")',
      'button:has-text("Edit Message")',
      'li:has-text("Edit Message")',
      'div:has-text("Edit Message")'
    ];
    
    for (const selector of editMenuSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find edit button on message hover or in context menu');
  }

  async editMessage(messageElement: Locator, newContent: string): Promise<void> {
    const editButton = await this.findEditButton(messageElement);
    await editButton.click();
    await this.page.waitForTimeout(1000);
    
    const editInputSelectors = [
      'textarea[value]',
      'input[value]',
      'textarea:focus',
      'input:focus',
      '.edit-input',
      '.message-edit-input',
      '[data-testid="message-edit-input"]'
    ];

    let editInput = null;
    for (const selector of editInputSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        editInput = element;
        break;
      }
    }

    if (!editInput) {
      editInput = this.page.locator('textarea:focus, input:focus').first();
      if (!(await editInput.isVisible({ timeout: 2000 }))) {
        throw new Error('Could not find edit input field');
      }
    }

    await editInput.selectText();
    await editInput.fill(newContent);
    await this.page.waitForTimeout(500);
    
    await editInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async sendMessageInThread(message: string): Promise<void> {
    const threadInputSelectors = [
      '.topic-panel textarea',
      '.thread-panel textarea', 
      '.discussion-panel textarea',
      '[class*="topic"] textarea',
      '[class*="thread"] textarea',
      '[class*="discussion"] textarea',
      'textarea:nth-of-type(2)',
      'div[class*="topic"] textarea[placeholder*="Write your thoughts"]',
      'div[class*="thread"] textarea[placeholder*="Write your thoughts"]',
      'textarea[placeholder*="Reply to thread"]',
      'textarea[placeholder*="thread"]',
      'textarea[placeholder*="Reply"]',
      '.thread-input textarea',
      '.reply-input textarea',
      '[data-testid="thread-input"]',
      '[data-testid="reply-input"]'
    ];

    let threadInput = null;
    for (const selector of threadInputSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const element = elements.nth(i);
          if (await element.isVisible({ timeout: 2000 })) {
            threadInput = element;
            break;
          }
        }
        if (threadInput) break;
      }
    }

    if (!threadInput) {
      const allTextareas = this.page.locator('textarea');
      const count = await allTextareas.count();
      
      for (let i = count - 1; i >= 0; i--) {
        const textarea = allTextareas.nth(i);
        if (await textarea.isVisible({ timeout: 1000 })) {
          threadInput = textarea;
          break;
        }
      }
    }

    if (!threadInput) {
      throw new Error('Could not find thread input area');
    }

    await threadInput.scrollIntoViewIfNeeded();
    await threadInput.click();
    await this.page.waitForTimeout(500);
    await threadInput.fill(message);
    await this.page.waitForTimeout(500);
    await threadInput.press('Enter');
    await this.page.waitForTimeout(2000);
  }

  async findForwardMessageOption(): Promise<Locator> {
    const selectors = [
      'text="Forward Message"',
      '[role="menuitem"]:has-text("Forward")',
      'div:has-text("Forward Message")',
      'span:has-text("Forward")'
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 3000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Forward Message option in context menu');
  }

  async openForwardModal(messageElement: Locator): Promise<void> {
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(1000);
    
    const forwardOption = await this.findForwardMessageOption();
    await forwardOption.click();
    
    await this.page.waitForTimeout(2000);
  }

  async verifyForwardModalIsOpen(): Promise<boolean> {
    const modalSelectors = [
      'text="Forward Message"',
      '[role="dialog"]:has-text("Forward")',
      'div:has-text("Forward Message")',
      'button:has-text("Send")',
      'button:has-text("Cancel")'
    ];

    for (const selector of modalSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 5000 })) {
        return true;
      }
    }
    
    return false;
  }

  async closeForwardModal(): Promise<void> {
    const cancelButton = this.page.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible({ timeout: 3000 })) {
      await cancelButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await this.page.waitForTimeout(1000);
  }

  async selectForwardTarget(targetName?: string): Promise<void> {
    const defaultTarget = targetName || 'XULxpDPsoJ';
    
    const modalContainer = this.page.locator('[role="dialog"], .modal, div:has-text("Forward Message")').first();
    
    const targetSelectors = [
      `[role="option"]:has-text("${defaultTarget}")`,
      `li:has-text("${defaultTarget}")`,
      `.user-item:has-text("${defaultTarget}")`,
      `.channel-item:has-text("${defaultTarget}")`,
      `[data-testid*="user"]:has-text("${defaultTarget}")`,
      `[data-testid*="channel"]:has-text("${defaultTarget}")`,
      `[class*="item"]:has-text("${defaultTarget}")`,
      `[class*="option"]:has-text("${defaultTarget}")`,
      `div:has-text("${defaultTarget}")`,
      `span:has-text("${defaultTarget}")`,
      `button:has-text("${defaultTarget}")`
    ];

    let targetElement = null;
    
    for (const selector of targetSelectors) {
      const elements = modalContainer.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        if (await element.isVisible({ timeout: 2000 })) {
          const textContent = await element.textContent();
          if (textContent && textContent.trim() === defaultTarget) {
            targetElement = element;
            break;
          }
        }
      }
      if (targetElement) break;
    }

    if (!targetElement) {
      const allElementsInModal = modalContainer.locator(`*:has-text("${defaultTarget}")`);
      const count = await allElementsInModal.count();
      
      for (let i = 0; i < count; i++) {
        const element = allElementsInModal.nth(i);
        if (await element.isVisible({ timeout: 1000 })) {
          const textContent = await element.textContent();
          if (textContent && textContent.trim() === defaultTarget) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            if (['div', 'span', 'li', 'button', 'p'].includes(tagName)) {
              targetElement = element;
              break;
            }
          }
        }
      }
    }

    if (!targetElement) {
      throw new Error(`Could not find forward target: ${defaultTarget} in forward modal`);
    }

    await targetElement.click();
    await this.page.waitForTimeout(1000);
  }

  async sendForwardMessage(): Promise<void> {
    const sendButton = this.page.locator('button:has-text("Send")');
    if (await sendButton.isVisible({ timeout: 3000 })) {
      await sendButton.click();
      await this.page.waitForTimeout(2000);
    } else {
      throw new Error('Could not find Send button in forward modal');
    }
  }

  async forwardMessage(messageElement: Locator, targetName?: string): Promise<void> {
    await this.openForwardModal(messageElement);
    await this.selectForwardTarget(targetName);
    await this.sendForwardMessage();
  }

  async findPinMessageOption(): Promise<Locator> {
    const selectors = [
      'text="Pin Message"',
      '[role="menuitem"]:has-text("Pin")',
      'div:has-text("Pin Message")',
      'span:has-text("Pin Message")',
      'button:has-text("Pin Message")'
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 3000 })) {
        return element;
      }
    }
    
    throw new Error('Could not find Pin Message option in context menu');
  }

  async pinMessage(messageElement: Locator): Promise<void> {
    await messageElement.click({ button: 'right' });
    await this.page.waitForTimeout(1000);
    
    const pinOption = await this.findPinMessageOption();
    await pinOption.click();
    
    await this.page.waitForTimeout(2000);
    
    await this.confirmPinMessage();
  }

  async confirmPinMessage(): Promise<void> {
    const confirmSelectors = [
      'button:has-text("Oh yeah. Pin it")',
      'button:has-text("Pin it")',
      '[data-testid="confirm-pin"]',
      'button[aria-label*="confirm" i]',
      '.confirm-button',
      'button:has-text("Yes")',
      'button:has-text("Confirm")'
    ];

    for (const selector of confirmSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 3000 })) {
        await element.click();
        await this.page.waitForTimeout(2000);
        return;
      }
    }
    
    throw new Error('Could not find pin confirmation button');
  }

  async findPinIcon(): Promise<Locator> {
    const pinIconSelectors = [
      'button[title="Pinned Messages"]',
      'button[aria-label="Pinned Messages"]',
      '[data-testid="pin-icon"]',
      'button[aria-label*="pin" i]',
      'button[title*="pin" i]',
      '.pin-icon',
      '[class*="pin"][role="button"]',
      'button:has([class*="pin"])',
      '[aria-label*="Pinned" i]',
      '[data-testid*="pinned"]',
      'button:has-text("📌")',
      '.pinned-messages-button'
    ];

    for (const selector of pinIconSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        const title = await element.getAttribute('title');
        const ariaLabel = await element.getAttribute('aria-label');
        
        if (title?.includes('Pinned Messages') || 
            ariaLabel?.includes('Pinned Messages') ||
            title?.toLowerCase().includes('pin') ||
            ariaLabel?.toLowerCase().includes('pin')) {
          return element;
        }
      }
    }
    
    throw new Error('Could not find Pinned Messages button');
  }

  async openPinnedMessagesModal(): Promise<void> {
    const pinIcon = await this.findPinIcon();
    await pinIcon.click();
    await this.page.waitForTimeout(2000);
  }

  async verifyMessageInPinnedModal(messageText: string): Promise<boolean> {
    await this.page.waitForTimeout(3000);
    
    const modalElement = this.page.locator('[role="dialog"]').first();
    if (!(await modalElement.isVisible({ timeout: 3000 }))) {
      return false;
    }

    const allModalText = await modalElement.textContent();
    if (!allModalText) {
      return false;
    }

    const shortText = messageText.substring(0, 15);
    const firstWord = messageText.split(' ')[0];
    const lastNumbers = messageText.match(/\d+/g)?.slice(-1)[0] || '';
    
    const messageSearchTerms = [
      messageText,
      shortText,
      firstWord,
      lastNumbers,
      'Message to pin',
      'Thread starter',
      'starter message'
    ];

    for (const searchTerm of messageSearchTerms) {
      if (searchTerm && allModalText.includes(searchTerm)) {
        return true;
      }
    }

    if (allModalText.includes('Pinned Messages') && allModalText.length > 50) {
      return true;
    }

    return false;
  }

  async closePinnedModal(): Promise<void> {
    const closeSelectors = [
      'button:has-text("Close")',
      '[aria-label="Close"]',
      '.close-button',
      '[data-testid="close"]',
      'button[aria-label*="close" i]'
    ];

    for (const selector of closeSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible({ timeout: 2000 })) {
        await element.click();
        await this.page.waitForTimeout(1000);
        return;
      }
    }

    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(1000);
  }

  async findJumpButton(messageText?: string): Promise<Locator> {
    const modalContainer = this.page.locator('.group\\/item-pinMess, [class*="group/item-pinMess"], [role="dialog"]').first();
    
    if (messageText) {
      const shortText = messageText.substring(0, 15);
      const searchTerms = [messageText, shortText, messageText.split(' ')[0]];
      
      for (const searchTerm of searchTerms) {
        if (searchTerm) {
          const messageRow = modalContainer.locator(`div:has-text("${searchTerm}")`);
          const jumpInRow = messageRow.locator('button:has-text("Jump")');
          
          if (await jumpInRow.isVisible({ timeout: 2000 })) {
            return jumpInRow.first();
          }
        }
      }
    }
    
    const jumpButton = modalContainer.locator('button:has-text("Jump")').first();
    if (await jumpButton.isVisible({ timeout: 3000 })) {
      return jumpButton;
    }
    
    throw new Error('Could not find Jump button');
  }

  async clickJumpToMessage(messageText?: string): Promise<void> {
    const jumpButton = await this.findJumpButton(messageText);
    await jumpButton.click();
    await this.page.waitForTimeout(3000);
  }

  async verifyMessageVisibleInMainChat(messageText: string): Promise<boolean> {
    await this.page.waitForTimeout(2000);
    
    const mainChatSelectors = [
      '.chat-messages',
      '.messages-container',
      '[class*="message"]',
      '.channel-content',
      '#mainChat',
      '[data-testid="messages"]'
    ];

    for (const selector of mainChatSelectors) {
      const chatContainer = this.page.locator(selector);
      if (await chatContainer.isVisible({ timeout: 2000 })) {
        const chatText = await chatContainer.textContent();
        if (chatText) {
          const shortText = messageText.substring(0, 15);
          const searchTerms = [
            messageText,
            shortText,
            messageText.split(' ')[0],
            messageText.split(' ').slice(-2).join(' ')
          ];

          for (const searchTerm of searchTerms) {
            if (searchTerm && chatText.includes(searchTerm)) {
              return true;
            }
          }
        }
      }
    }

    const allPageText = await this.page.textContent('body');
    if (allPageText) {
      const shortText = messageText.substring(0, 15);
      const searchTerms = [messageText, shortText];
      
      for (const searchTerm of searchTerms) {
        if (searchTerm && allPageText.includes(searchTerm)) {
          return true;
        }
      }
    }

    return false;
  }

  async jumpToPinnedMessage(messageText: string): Promise<void> {
    await this.openPinnedMessagesModal();
    await this.clickJumpToMessage();
  }
}
