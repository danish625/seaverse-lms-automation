import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { DashboardPage } from '../pages/learner/DashboardPage';
import { SupportModal } from '../components/SupportModal';

type MyFixtures = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  dashboardPage: DashboardPage;
  supportModal: SupportModal;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  supportModal: async ({ page }, use) => {
    await use(new SupportModal(page));
  },
});

export { expect } from '@playwright/test';
