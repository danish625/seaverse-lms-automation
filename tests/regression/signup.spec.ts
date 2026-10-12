import { test, expect } from '../../src/fixtures/index';

test.describe('Seaverse Signup Scenarios', () => {

  test.beforeEach(async ({ signupPage }) => {
    // Navigate to the sign up page before each test

    await signupPage.navigate();
  });

  // test('TC_SU_001: Successful Account Creation @smoke @regression', async ({ signupPage }) => {
  //   // Verify we are on the right page
  //   await expect(signupPage.pageTitle).toBeVisible();

  //   // Generate a unique email for a successful signup
  //   const uniqueEmail = `newuser${Date.now()}@squadramedia.com`;
  //   await signupPage.enterEmail(uniqueEmail);
  //   await signupPage.enterFirstName('John');
  //   await signupPage.enterLastName('Doe');

  //   // Accept terms and submit
  //   await signupPage.checkTermsAndConditions();
  //   await signupPage.clickSignUp();

  //   // Expected Result: Wait for the next screen (e.g., OTP or verification)
  //   // await expect(signupPage.page).toHaveURL(/.*verification/);
  // });

  test('TC_SU_003: Existing Email Validation @regression', async ({ signupPage }) => {
    // Verify we are on the right page
    await expect(signupPage.pageTitle).toBeVisible();

    // Fill out the signup form with the existing email
    await signupPage.enterEmail('ramasubramanian@squadramedia.com');
    await signupPage.enterFirstName('John');
    await signupPage.enterLastName('Doe');

    // Accept terms and submit
    await signupPage.checkTermsAndConditions();
    await signupPage.clickSignUp();

    // Validate the exact error message appears on the screen
    // We use .first() because the UI actually renders this text in 3 different places (e.g., Toast + Form Error)
    const errorMessage = signupPage.page.getByText(/Email entered already exists/i).first();
    await expect(errorMessage).toBeVisible();
  });

  test('TC_SU_004: Signup Email field validation - Missing @ symbol @regression', async ({ signupPage }) => {
    // 1. Enter an email missing '@'
    await signupPage.enterEmail('danishsquadramedia.com');

    // 2. Assert the exact error message 'Invalid email address' is displayed
    const errorMessage = signupPage.page.getByText('Invalid email address').first();
    await expect(errorMessage).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_005: Signup Email field validation - Missing domain extension (.com) @regression', async ({ signupPage }) => {
    // 1. Enter an email missing '.com' or top-level domain
    await signupPage.enterEmail('danish@squadramedia');

    // 2. Verify whether 'Invalid email address' is displayed
    const errorMessage = signupPage.page.getByText('Invalid email address').first();
    await expect(errorMessage).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_006: Signup Email field validation - Missing username before @ @regression', async ({ signupPage }) => {
    // 1. Enter an email missing username before '@'
    await signupPage.enterEmail('@squadramedia.com');

    // 2. Verify error message is displayed
    const errorMessage = signupPage.page.getByText('Invalid email address').first();
    await expect(errorMessage).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_007: Signup Email field validation - Missing domain after @ @regression', async ({ signupPage }) => {
    // 1. Enter an email missing domain after '@'
    await signupPage.enterEmail('danish@');

    // 2. Verify error message is displayed
    const errorMessage = signupPage.page.getByText('Invalid email address').first();
    await expect(errorMessage).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_008: Signup Email field validation - Multiple @ symbols @regression', async ({ signupPage }) => {
    // 1. Enter an email with multiple '@' symbols
    await signupPage.enterEmail('danish@@squadramedia.com');

    // 2. Verify error message is displayed
    const errorMessage = signupPage.page.getByText('Invalid email address').first();
    await expect(errorMessage).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_009: Signup Email field validation - Empty email after clear @regression', async ({ signupPage }) => {
    // 1. Fill then clear email input to trigger dirty state
    await signupPage.enterEmail('temp@example.com');
    await signupPage.emailInput.clear();

    // 2. Verify error message appears (App shows 'Invalid email address')
    const errorMessage = signupPage.page.getByText('Invalid email address').first();
    await expect(errorMessage).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_010: First Name validation - Empty first name shows error @regression', async ({ signupPage }) => {
    // 1. Enter first name and clear it to trigger dirty state
    await signupPage.enterFirstName('John');
    await signupPage.firstNameInput.clear();
    await signupPage.firstNameInput.blur();

    // 2. Assert exact error message 'First Name is required'
    const errorMsg = signupPage.page.getByText('First Name is required').first();
    await expect(errorMsg).toBeVisible();

    // 3. Verify Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_011: First Name validation - Does not accept numbers and special characters @regression', async ({ signupPage }) => {
    // 1. Type letters mixed with numbers and special characters
    await signupPage.firstNameInput.pressSequentially('John123!@#');

    // 2. Validate that the UI physically blocked/ignored the numbers and special characters
    await expect(signupPage.firstNameInput).toHaveValue('John');

    // 3. Clear and type ONLY numbers and special characters
    await signupPage.firstNameInput.clear();
    await signupPage.firstNameInput.pressSequentially('12345!@#$%');

    // 4. Verify field remains empty
    await expect(signupPage.firstNameInput).toHaveValue('');
  });

  test('TC_SU_012: Valid email, last name entered, empty first name, terms agreed -> Sign Up button disabled @regression', async ({ signupPage }) => {
    // 1. Enter valid email
    await signupPage.enterEmail('validuser@example.com');

    // 2. Leave First Name empty and enter Last Name
    await signupPage.enterLastName('Doe');

    // 3. Agree to terms & conditions
    await signupPage.checkTermsAndConditions();

    // 4. Assert Sign Up button remains disabled
    await expect(signupPage.signUpButton).toBeDisabled();
  });

  test('TC_SU_013: All valid fields including First Name -> Sign Up button enabled @regression', async ({ signupPage }) => {
    // 1. Enter valid email
    await signupPage.enterEmail(`user${Date.now()}@example.com`);

    // 2. Enter valid First Name (only letters)
    await signupPage.enterFirstName('John');

    // 3. Enter valid Last Name
    await signupPage.enterLastName('Doe');

    // 4. Agree to terms & conditions
    await signupPage.checkTermsAndConditions();

    // 5. Assert Sign Up button is enabled
    await expect(signupPage.signUpButton).toBeEnabled();
  });

  test('TC_SU_014: Last Name validation - Optional field verification @regression', async ({ signupPage }) => {
    // 1. Enter last name and clear it
    await signupPage.enterLastName('Doe');
    await signupPage.lastNameInput.clear();
    await signupPage.lastNameInput.blur();

    // 2. Last Name is an optional field (no asterisk), so no validation error appears
    const errors = signupPage.page.locator('p.text-red-500');
    await expect(errors).toHaveCount(0);
  });

  test('TC_SU_015: Last Name validation - Does not accept numbers and special characters @regression', async ({ signupPage }) => {
    // 1. Type letters mixed with numbers and special characters
    await signupPage.lastNameInput.pressSequentially('Doe123!@#');

    // 2. Validate that the UI physically blocked/ignored the numbers and special characters
    await expect(signupPage.lastNameInput).toHaveValue('Doe');

    // 3. Clear and type ONLY numbers and special characters
    await signupPage.lastNameInput.clear();
    await signupPage.lastNameInput.pressSequentially('12345!@#$%');

    // 4. Verify field remains empty
    await expect(signupPage.lastNameInput).toHaveValue('');
  });

  test('TC_SU_016: Valid email, first name entered, empty last name, terms agreed -> Sign Up button is enabled @regression', async ({ signupPage }) => {
    // 1. Enter valid email
    await signupPage.enterEmail(`user${Date.now()}@example.com`);

    // 2. Enter valid First Name
    await signupPage.enterFirstName('John');

    // 3. Leave Last Name empty (optional field)

    // 4. Agree to terms & conditions
    await signupPage.checkTermsAndConditions();

    // 5. Assert Sign Up button is enabled because Last Name is optional
    await expect(signupPage.signUpButton).toBeEnabled();
  });

});
