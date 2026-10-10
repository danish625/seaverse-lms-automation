import { test, expect } from '../../src/fixtures/index';

test.describe('Support Request Scenarios', () => {

  test.beforeEach(async ({ loginPage, supportModal }) => {
    // Navigate to login and open the help center modal before each test
    await loginPage.navigate();
    await loginPage.clickHelpCenter();
    
    // Verify the modal is open
    await expect(supportModal.sendButton).toBeVisible();
  });

  test('TC_SR_001: Verify unauthenticated user can submit support request @smoke', async ({ supportModal, page }) => {
    await supportModal.fillSupportForm('learner@example.com', 'Cannot login', 'I forgot my password');
    await supportModal.checkConsent();
    
    // Click Send
    await supportModal.clickSend();

    // Note: Assuming a success toast appears. Update locator text if it differs in actual UI.
    await expect(supportModal.successMessage).toBeVisible();
  });

  test('TC_SR_005: Verify support request fails without consent @regression', async ({ supportModal, page }) => {
    await supportModal.fillSupportForm('learner@example.com', 'Login Issue', 'Cannot login');
    
    // Ensure consent is unchecked
    await supportModal.uncheckConsent();
    await supportModal.clickSend();

    // Note: Assuming a validation error appears. Update locator text if it differs.
    const errorMessage = page.getByText(/Please accept the terms and conditions/i);
    await expect(errorMessage).toBeVisible();
  });

  test('TC_SR_006: Verify support request validates email format @regression', async ({ supportModal, page }) => {
    await supportModal.fillSupportForm('notanemail', 'Login Issue', 'Cannot login');
    await supportModal.checkConsent();
    await supportModal.clickSend();

    const errorMessage = page.getByText(/Please enter a valid email address/i);
    await expect(errorMessage).toBeVisible();
  });

  test('TC_SR_007: Verify support request requires Email field @regression', async ({ supportModal, page }) => {
    // Leaving email empty
    await supportModal.fillSupportForm('', 'Login Issue', 'Cannot login');
    await supportModal.checkConsent();
    await supportModal.clickSend();

    const errorMessage = page.getByText(/Email is required/i);
    await expect(errorMessage).toBeVisible();
  });

  test('TC_SR_008: Verify support request subject is required @regression', async ({ supportModal, page }) => {
    // Leaving subject empty
    await supportModal.fillSupportForm('learner@example.com', '', 'Cannot login');
    await supportModal.checkConsent();
    await supportModal.clickSend();

    const errorMessage = page.getByText(/Subject is required/i);
    await expect(errorMessage).toBeVisible();
  });

  test('TC_SR_009: Verify support request message is required @regression', async ({ supportModal, page }) => {
    // Leaving message empty
    await supportModal.fillSupportForm('learner@example.com', 'Login Issue', '');
    await supportModal.checkConsent();
    await supportModal.clickSend();

    const errorMessage = page.getByText(/Message is required/i);
    await expect(errorMessage).toBeVisible();
  });

});
