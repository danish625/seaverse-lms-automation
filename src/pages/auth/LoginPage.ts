import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  
  // First Step Locators
  readonly seaverseLogo: Locator;
  readonly pageTitle: Locator;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly signUpButton: Locator;
  readonly helpCenterButton: Locator;

  // Second Step Locators (Password & Login)
  readonly passwordInput: Locator;
  readonly finalLoginButton: Locator; 
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordButton: Locator;
  readonly termsCheckbox: Locator;
  readonly passwordVisibilityToggle: Locator;
  
  // Terms & Privacy Locators
  readonly termsLink: Locator;
  readonly acceptTermsButton: Locator;
  readonly rejectTermsButton: Locator;
  readonly lastTermsSection: Locator;

  // Forgot Password Flow Locators
  readonly forgotPasswordEmailInput: Locator;
  readonly requestResetLinkButton: Locator;
  readonly backToLoginButton: Locator;
  readonly forgotPasswordConsentCheckbox: Locator;

  // General Locators
  readonly errorMessage: Locator;
  readonly fieldValidationError: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Step 1 Locators
    this.seaverseLogo = page.getByAltText('Seaverse Logo').filter({ visible: true });
    this.pageTitle = page.getByRole('heading', { name: 'Login' });
    this.emailInput = page.getByPlaceholder('Enter email address');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.helpCenterButton = page.getByRole('button', { name: /Having trouble logging in/i });

    // Step 2 & Common Locators 
    this.passwordInput = page.getByPlaceholder('Enter password');
    this.finalLoginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.rememberMeCheckbox = page.getByLabel('Remember Me');
    this.forgotPasswordButton = page.getByRole('button', { name: 'Forgot Password?' });
    this.termsCheckbox = page.getByLabel(/I agree/i);
    
    // Terms & Privacy Links inside Step 2
    this.termsLink = page.getByRole('link', { name: /Terms/i }).or(page.locator('a', { hasText: /Terms/i })).first();
    this.acceptTermsButton = page.getByRole('button', { name: 'Accept', exact: true });
    this.rejectTermsButton = page.getByRole('button', { name: 'Reject', exact: true });
    this.lastTermsSection = page.locator('div.flex.flex-col.gap-\\[30px\\] > div.flex.flex-col.gap-\\[20px\\]').last();
    
    // Forgot Password Locators
    this.forgotPasswordEmailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).last();
    this.requestResetLinkButton = page.getByRole('button', { name: /Request Reset Link/i });
    this.backToLoginButton = page.getByRole('button', { name: /Back to Login/i }).or(page.getByText(/Back to Login/i));
    this.forgotPasswordConsentCheckbox = page.locator('input[name="agree"]');

    // Eye icon is usually an SVG/button inside the password field wrapper
    this.passwordVisibilityToggle = page.locator('.eye-icon, svg, [aria-label*="password"]').last();
    
    // Assumes errors appear as Toast notifications with an 'Error' title, or as standard alert elements
    this.errorMessage = page.locator('p:text-is("Error") + p').or(page.locator('[role="alert"], .text-red-500')).first();
    this.fieldValidationError = page.locator('p.text-red-500');
  }

  // --- Step 1 Methods ---
  async navigate() {
    await this.page.goto('/login');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickSignUp() {
    await this.signUpButton.click();
  }

  async clickHelpCenter() {
    await this.helpCenterButton.click();
  }

  async clearEmail() {
    await this.emailInput.clear();
  }

  // --- Step 2 Methods ---
  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clearPassword() {
    await this.passwordInput.clear();
  }

  async clickFinalLogin() {
    await this.finalLoginButton.click();
  }

  async checkRememberMe() {
    if (!(await this.rememberMeCheckbox.isChecked())) {
      await this.rememberMeCheckbox.check();
    }
  }
  
  async clickForgotPassword() {
    await this.forgotPasswordButton.click();
  }

  async clickTermsLink() {
    await this.termsLink.click();
  }

  async clickAcceptTerms() {
    await this.acceptTermsButton.click();
  }

  async clickRejectTerms() {
    await this.rejectTermsButton.click();
  }

  async scrollTermsToBottom() {
    await this.lastTermsSection.scrollIntoViewIfNeeded();
  }

  async checkTermsAndConditions() {
    if (!(await this.termsCheckbox.isChecked())) {
      await this.termsCheckbox.check();
    }
  }

  async togglePasswordVisibility() {
    await this.passwordVisibilityToggle.click();
  }

  // --- Forgot Password Methods ---
  async enterForgotPasswordEmail(email: string) {
    await this.forgotPasswordEmailInput.fill(email);
  }

  async checkForgotPasswordConsent() {
    if (!(await this.forgotPasswordConsentCheckbox.isChecked())) {
      await this.forgotPasswordConsentCheckbox.check();
    }
  }

  async clickRequestResetLink() {
    await this.requestResetLinkButton.click();
  }

  async clickBackToLogin() {
    await this.backToLoginButton.click();
  }

  // --- General Methods ---
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.innerText();
  }

  getNotificationMessage(expectedText: string): Locator {
    return this.page.locator('p', { hasText: expectedText });
  }

  // --- Dynamic Banner Locators ---
  getAlertBannerHeading(title: string): Locator {
    return this.page.getByRole('heading', { name: title });
  }

  getAlertBannerMessage(message: string): Locator {
    return this.page.getByText(message);
  }
}
