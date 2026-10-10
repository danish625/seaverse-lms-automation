import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    // Targeting the h1 using a dynamic, user-agnostic regex for time of day
    this.welcomeHeader = page.getByRole('heading', { name: /(Good Morning|Good Afternoon|Good Evening|Welcome)/i });
  }

  async getWelcomeText() {
    return await this.welcomeHeader.innerText();
  }
}
