import { test, expect } from '../../src/fixtures/index';

test.describe('Seaverse Login Scenarios', () => {

  test.beforeEach(async ({ loginPage }) => {
    // Navigate before every test
    await loginPage.navigate();
  });

  test('TC_LN_001: TS 1.1 - Valid Login Credentials @smoke @regression', async ({ loginPage, dashboardPage }) => {
    // Step 1: Enter email and continue
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();

    // Step 2: Enter password, check remember me, and login
    await loginPage.enterPassword(process.env.TEST_PASSWORD!);
   // await loginPage.checkRememberMe();
    await loginPage.clickFinalLogin();
    
    // Expected: User is successfully logged in and redirected away from the login page
    // Using auto-waiting expect to wait for the API response to complete
    // await expect(loginPage.page).not.toHaveURL(/.*login/, { timeout: 15000 });
    
    // Verify the dashboard welcome message appears
    await expect(dashboardPage.welcomeHeader).toBeVisible();
    
    // Retrieve the text and explicitly assert it includes a greeting
    const welcomeText = await dashboardPage.getWelcomeText();
    expect(welcomeText).toMatch(/(Good Morning|Good Afternoon|Good Evening)/i);
  });

  test('TC_LN_002: TS 1.2 - Invalid Login Credentials @regression', async ({ loginPage }) => {
    await loginPage.enterEmail('unregistered@example.com');
    await loginPage.clickContinue();
    
    // Some systems throw error on the first step for unregistered emails. 
    // If it allows proceeding to password step:
    await loginPage.enterPassword('AnyPassword123');
    await loginPage.clickFinalLogin();

    // Expected: App should show error message
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('incorrect');
  });

  test('TC_LN_004: TS 1.4 - Invalid Password Format @regression', async ({ loginPage }) => {
    // 1. Enter a valid email ID.
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    // 2. Enter an incorrect password.
    await loginPage.enterPassword('WrongPassword123');
    await loginPage.clickFinalLogin();

    // Expected: App should show error message
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('incorrect');
  });

  test('TC_LN_005: TS 1.5 - Empty Email or Password @regression', async ({ loginPage }) => {
    // 1. Enter text, perform clear action, then check if Continue button is disabled
    await loginPage.enterEmail('test@example.com');
    await loginPage.clearEmail();
    await expect(loginPage.continueButton).toBeDisabled();
    await expect(loginPage.page.getByText(/Email is required/i)).toBeVisible();

    // Enter a valid email to reach the password screen
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();

    // 2. Enter password, perform clear action, then check if final Login button is disabled
    await loginPage.enterPassword('temp_password');
    await loginPage.clearPassword();
    await expect(loginPage.finalLoginButton).toBeDisabled();
    await expect(loginPage.page.getByText(/Password is required/i)).toBeVisible();
  });

  test('TC_LN_003: TS 1.3 - Invalid Email Format @regression', async ({ loginPage }) => {
    await loginPage.enterEmail('invalidemailformat');
    await loginPage.clickContinue();
    
    // Expected: Error message indicating incorrect email format
    const errorText = await loginPage.getErrorMessage();
    expect(errorText.toLowerCase()).toContain('invalid');
  });

  test('TC_LN_007: TS 1.7 - Forgot Password with a valid email @smoke @regression', async ({ loginPage }) => {
    // Navigate to Forgot Password page
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();

    await loginPage.enterForgotPasswordEmail(process.env.TEST_EMAIL!);
    await loginPage.checkForgotPasswordConsent();
    await loginPage.clickRequestResetLink();
    
    await expect(loginPage.getNotificationMessage('If an account exists with this email, you will receive a password reset link shortly.')).toBeVisible();
  });

  test('TC_LN_007b: TS 1.7b - Forgot Password Back to Login routing @regression', async ({ loginPage }) => {
    // Navigate to Forgot Password page
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();

    // Click back to login and verify it successfully routes back to the email step
    await loginPage.clickBackToLogin();
    
    // Verify email input is visible and editable
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.emailInput).toBeEditable();

    // Explicitly retrieve the text from the field and validate with the filled email
    const text = await loginPage.emailInput.inputValue();
    expect(text).toBe(process.env.TEST_EMAIL!);
  });

  test('TC_LN_008: TS 1.8 - Forgot Password with an invalid (unregistered) email @regression', async ({ loginPage }) => {
    // Navigate to Forgot Password page
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();

    await loginPage.enterForgotPasswordEmail('danish+100@squadramedia.com');
    await loginPage.checkForgotPasswordConsent();
    await loginPage.clickRequestResetLink();
    
    await expect(loginPage.getNotificationMessage('If an account exists with this email, you will receive a password reset link shortly.')).toBeVisible();
  });

  test('TC_LN_009: TS 1.9 - Forgot Password email field validation (invalid format) @regression', async ({ loginPage }) => {
    // Navigate to Forgot Password page
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();

    await loginPage.enterForgotPasswordEmail('invalidemailformat');
   // await loginPage.checkForgotPasswordConsent();
   // await loginPage.clickRequestResetLink();
    
    await expect(loginPage.getNotificationMessage('Invalid email format')).toBeVisible();
  });

  test('TC_LN_006: TS 1.6 - Password Visibility Toggle @regression', async ({ loginPage }) => {
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    await loginPage.enterPassword('SecretPass123');
    
    // Expected: Type should be 'password' initially
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle
    await loginPage.togglePasswordVisibility();
    
    // Expected: Type should change to 'text'
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  test('TC_LN_011: TS 1.11 - Verify forgot password link is provided @smoke', async ({ loginPage }) => {
    // Navigate to step 2 to expose the forgot password link
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    // Assert the forgot password link is provided and clickable
    await expect(loginPage.forgotPasswordButton).toBeVisible();
    await expect(loginPage.forgotPasswordButton).toBeEnabled();
  });

  test('TC_LN_012: TS 1.12 - Verify if the password reset email is received @regression', async ({ loginPage }) => {
    // Navigate to Forgot Password page
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();

    await loginPage.enterForgotPasswordEmail(process.env.TEST_EMAIL!);
    await loginPage.checkForgotPasswordConsent();
    await loginPage.clickRequestResetLink();
    
    // Verify toast message. Note: Actual email receipt verification requires Mailosaur/API integration later.
    await expect(loginPage.getNotificationMessage('If an account exists with this email, you will receive a password reset link shortly.')).toBeVisible();
  });

  test('TC_LN_013: TS 1.13 - Verify if a non existing user gets a password reset link @regression', async ({ loginPage }) => {
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();

    await loginPage.enterForgotPasswordEmail('unregistered@example.com');
    await loginPage.checkForgotPasswordConsent();
    await loginPage.clickRequestResetLink();
    
    await expect(loginPage.getNotificationMessage('No account found')).toBeVisible();
  });

  test('TC_LN_014: TS 1.14 - Verify Accept Terms and privacy page @regression', async ({ loginPage }) => {
    // Step 2 Screen
    await loginPage.enterEmail(process.env.TEST_EMAIL!); // assuming new users also hit step 2
    await loginPage.clickContinue();

    // 1. The 'I Agree' checkbox should be unchecked by default
    await expect(loginPage.termsCheckbox).not.toBeChecked();

    // 2. Click on Terms and Conditions link
    await loginPage.clickTermsLink();
    
    // 3. User should see Accept and Reject buttons
    await expect(loginPage.acceptTermsButton).toBeVisible();
    await expect(loginPage.rejectTermsButton).toBeVisible();

    // Scroll to the bottom of the terms to enable the buttons
    await loginPage.scrollTermsToBottom();
    await loginPage.page.pause(); // Playwright Inspector pause
    await expect(loginPage.acceptTermsButton).toBeEnabled();

    // 4. Click Accept
    await loginPage.clickAcceptTerms();

    // 5. User should be redirected to login screen and checkbox should be checked now
    await expect(loginPage.passwordInput).toBeVisible(); // Confirms we are back to login step 2
    await expect(loginPage.termsCheckbox).toBeChecked();
  });

  test('TC_LN_015: TS 1.15 - Verify Reject Terms and privacy agreement @regression', async ({ loginPage }) => {
    await loginPage.enterEmail('newuser@example.com');
    await loginPage.clickContinue();

    await expect(loginPage.termsCheckbox).not.toBeChecked();
    
    // Click on Terms link
    await loginPage.clickTermsLink();
    await expect(loginPage.rejectTermsButton).toBeVisible();
    
    // Scroll to the bottom to enable the buttons
    await loginPage.scrollTermsToBottom();
    await loginPage.page.pause(); // Added for debugging as requested
    await expect(loginPage.rejectTermsButton).toBeEnabled();

    // Click Reject
    await loginPage.clickRejectTerms();

    // User is redirected to login screen, checkbox is NOT checked
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.termsCheckbox).not.toBeChecked();
  });

  test('TC_LN_021: TS 1.21 - Login -> Forgot Password -> Contact Support @regression', async ({ loginPage, supportModal }) => {
    // 1. Validate button is present at Step 1 (Entering Email)
    await expect(loginPage.helpCenterButton).toBeVisible();
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    // 2. Validate button is present at Step 2 (Entering Password)
    await expect(loginPage.helpCenterButton).toBeVisible();
    // Navigate to Forgot Password screen
    await loginPage.clickForgotPassword();
    // 3. Validate button is present at Forgot Password screen
    await expect(loginPage.helpCenterButton).toBeVisible();
    // Click Contact Support
    await loginPage.clickHelpCenter();
    // Fill and submit using existing SupportModal POM logic
    await supportModal.fillSupportForm(process.env.TEST_EMAIL!, 'Login Issue', 'Testing support from forgot password.');
    await supportModal.checkConsent();
    await supportModal.clickSend();
    
    // Verify success toast
    await expect(supportModal.successMessage).toBeVisible();
  });

  test('TC_LN_022: TS 1.22 - Login -> Forgot Password -> Check your Mail -> Contact Support @regression', async ({ loginPage, supportModal }) => {
    // Navigate to Forgot Password and request reset link
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    await loginPage.clickForgotPassword();
    await loginPage.enterForgotPasswordEmail(process.env.TEST_EMAIL!);
    await loginPage.checkForgotPasswordConsent();
    await loginPage.clickRequestResetLink();
    
    // Wait for the "Check your mail" security toast
    await expect(loginPage.getNotificationMessage('If an account exists with this email, you will receive a password reset link shortly.')).toBeVisible();

    // Click Contact Support from this screen
    await loginPage.clickHelpCenter();

    // STRICTLY use existing SupportModal POM logic
    await supportModal.fillSupportForm(process.env.TEST_EMAIL!, 'Login Issue', 'Testing support from check mail screen.');
    await supportModal.checkConsent();
    await supportModal.clickSend();
    
    // Verify success toast
    await expect(supportModal.successMessage).toBeVisible();
  });

//  test('TC_LN_023: Verify Password field validation - Empty Password @regression', async ({ loginPage }) => {
 //   await loginPage.enterEmail(process.env.TEST_EMAIL!);
//    await loginPage.clickContinue();
    
    // Click final login without entering a password
 //   await loginPage.clickFinalLogin();
    
    // Validate the exact red text from your screenshot appears
 //   await expect(loginPage.fieldValidationError).toHaveText('Password is required');
//  });

  test('TC_LN_024: Verify Password field prevents space character input @regression', async ({ loginPage }) => {
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    // Mimic a human typing a password with spaces, keystroke-by-keystroke
    await loginPage.passwordInput.pressSequentially('P a s s 1 2 3 !');
    
    // Validate that the UI physically blocked/ignored the spaces
    await expect(loginPage.passwordInput).toHaveValue('Pass123!');
  });

  test('TC_LN_025: Verify Password field boundary - Invalid 7 characters @regression', async ({ loginPage }) => {
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    // Enter exactly 7 characters (just below the 8 character boundary)
    await loginPage.enterPassword('Pass123');
   // await loginPage.clickFinalLogin();
    
    // Validate the exact minimum length error message
    await expect(loginPage.fieldValidationError).toHaveText('Password must be minimum 8 characters');
  });

  test('TC_LN_026: Verify Password field boundary - Valid exactly 8 mixed characters @regression', async ({ loginPage }) => {
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    // Enter exactly 8 characters (mixed alphabet, numeric, special) right on the boundary
    await loginPage.enterPassword('A1!b2@C#');
    
    // Verify that NO red validation error appears 
    await expect(loginPage.fieldValidationError).not.toBeVisible();
  });

  test.only('TC_LN_027: Verify Login with valid email but wrong password @regression', async ({ loginPage }) => {
    // 1. Enter a valid, registered email
    await loginPage.enterEmail(process.env.TEST_EMAIL!);
    await loginPage.clickContinue();
    
    // 2. Enter a wrong password (must be >= 8 chars)
    await loginPage.enterPassword('WrongPass123!');
    await loginPage.clickFinalLogin();
    
    // 3. Validate the exact backend error toast appears
    await expect(loginPage.getNotificationMessage('incorrect Email or password')).toBeVisible();
  });

});
