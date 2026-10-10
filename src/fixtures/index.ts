import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/learner/DashboardPage';
import { SupportModal } from '../components/SupportModal';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  supportModal: SupportModal;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  supportModal: async ({ page }, use) => {
    await use(new SupportModal(page));
  },
});

export { expect } from '@playwright/test';
