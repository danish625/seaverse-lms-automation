import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';

const adminStoragePath = 'src/auth/storage/admin.json';

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // 1. Navigate to login
  await loginPage.navigate();

  // 2. Log in using Admin credentials
  await loginPage.enterEmail(process.env.ADMIN_EMAIL!);
  await loginPage.clickContinue();
  await loginPage.enterPassword(process.env.ADMIN_PASSWORD!);
  await loginPage.clickFinalLogin();

  // 3. Wait until redirected away from login screen
  await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

  // 4. Save the full browser session (cookies, token, localStorage)
  await page.context().storageState({ path: adminStoragePath });
  console.log(`Admin session saved to ${adminStoragePath}`);
});
