import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { DashboardPage } from '../pages/learner/DashboardPage';
import { SupportModal } from '../components/SupportModal';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { SignUpRequestsPage } from '../pages/admin/SignUpRequestsPage';

type MyFixtures = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  dashboardPage: DashboardPage;
  supportModal: SupportModal;
  userManagementPage: UserManagementPage;
  signUpRequestsPage: SignUpRequestsPage;
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
  userManagementPage: async ({ page }, use) => {
    await use(new UserManagementPage(page));
  },
  signUpRequestsPage: async ({ page }, use) => {
    await use(new SignUpRequestsPage(page));
  },
});

export { expect } from '@playwright/test';
