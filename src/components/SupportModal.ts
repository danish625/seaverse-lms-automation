import { Page, Locator } from '@playwright/test';

export class SupportModal {
  readonly page: Page;
  
  readonly modalContainer: Locator;
  readonly closeButton: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageTextarea: Locator;
  readonly consentCheckbox: Locator;
  readonly cancelButton: Locator;
  readonly sendButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Locators based on the provided screenshot
    this.modalContainer = page.getByRole('dialog');
    this.emailInput = page.locator('#email');
    this.subjectInput = page.locator('#subject');
    this.messageTextarea = page.locator('#message');
    
    // Using Regex to match the long consent string flexibly
    this.consentCheckbox = page.getByLabel(/I consent to the processing of my personal data/i);
    
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.sendButton = page.getByRole('button', { name: 'Send' });
    this.successMessage = page.locator('p', { hasText: /The team will contact the user within 24.48 hours/i });
    
    // Close button (the 'X' at the top right)
    this.closeButton = page.getByRole('button').filter({ hasText: '✕' }).or(page.locator('.close, button[aria-label="Close"]'));
  }

  /**
   * Utility to fill out the entire support form in one go
   */
  async fillSupportForm(email: string, subject: string, message: string) {
    if (email !== undefined) await this.emailInput.fill(email);
    if (subject !== undefined) await this.subjectInput.fill(subject);
    if (message !== undefined) await this.messageTextarea.fill(message);
  }

  async checkConsent() {
    if (!(await this.consentCheckbox.isChecked())) {
      await this.consentCheckbox.check();
    }
  }

  async uncheckConsent() {
    if (await this.consentCheckbox.isChecked()) {
      await this.consentCheckbox.uncheck();
    }
  }

  async clickSend() {
    await this.sendButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }
}
