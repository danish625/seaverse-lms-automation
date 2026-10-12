import { Page, Locator } from '@playwright/test';

export class SignupPage {
  readonly page: Page;

  // Locators based on the Signup screenshot
  readonly pageTitle: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly termsCheckbox: Locator;
  readonly termsLink: Locator;
  readonly signUpButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators
    this.pageTitle = page.getByRole('heading', { name: 'Create an account' });
    this.emailInput = page.getByPlaceholder('Enter email address');
    this.firstNameInput = page.getByPlaceholder('Enter first name');
    this.lastNameInput = page.getByPlaceholder('Enter last name');

    // Checkbox and Links
    this.termsCheckbox = page.getByLabel(/I agree to the/i);
    this.termsLink = page.getByRole('link', { name: 'Terms & Conditions' });

    // Buttons
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' });
    this.loginLink = page.getByRole('link', { name: 'Log in' });
  }

  // --- Methods ---
  async navigate() {
    console.log('Navigating to signup page');

    await this.page.goto('https://qa.squadramedia.site/sign-up');

    console.log('Signup page opened');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async checkTermsAndConditions() {
    if (!(await this.termsCheckbox.isChecked())) {
      await this.termsCheckbox.check();
    }
  }

  async clickTermsLink() {
    await this.termsLink.click();
  }

  async clickSignUp() {
    await this.signUpButton.click();
  }

  async clickLoginLink() {
    await this.loginLink.click();
  }
}
