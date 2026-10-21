import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { EnvManager } from './config/environment';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const envConfig = EnvManager.getConfig();

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: envConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // 1. Setup Project: Generates admin.json storageState session
    {
      name: 'setup',
      testMatch: /src\/auth\/.*\.setup\.ts/,
    },

    // 2. Unauthenticated Project: Runs Login and Support tests in fresh browser
    {
      name: 'unauthenticated',
      testMatch: /tests\/regression\/(login|supportRequest)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // 3. Admin Project: Runs Admin features pre-authenticated using admin.json
    {
      name: 'admin',
      testMatch: /tests\/regression\/signUpRequests\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        // storageState: 'src/auth/storage/admin.json',
      },
    },
  ],
});
