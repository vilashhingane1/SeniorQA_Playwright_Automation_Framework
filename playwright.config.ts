import { defineConfig, devices } from '@playwright/test';
import { applications, type ApplicationName } from './utils/applications';

const appName = process.env.APP?.trim().toLowerCase();

function isApplicationName(name: string): name is ApplicationName {
  return Object.prototype.hasOwnProperty.call(applications, name);
}

function applicationFor(name: string | undefined) {
  if (!name) {
    return undefined;
  }
  if (!isApplicationName(name)) {
    throw new Error(
      `Unknown APP "${name}". Choose one of: ${Object.keys(applications).join(', ')}.`,
    );
  }
  return applications[name];
}

const selectedApplication = applicationFor(appName);
const browserProjects = [
  {
    name: 'chromium',
    use: {
      browserName: 'chromium' as const,
      viewport: process.env.HEADED === 'true' ? null : devices['Desktop Chrome'].viewport,
      launchOptions: {
        slowMo: process.env.HEADED === 'true' ? 500 : 0,
        args: process.env.HEADED === 'true' ? ['--start-maximized'] : [],
      },
    },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'webkit',
    use: { ...devices['Desktop Safari'] },
  },
];

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI || process.env.HEADED === 'true' ? 1 : undefined,
  /* See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['./utils/artifact-folder-reporter.ts'],
  ],
  timeout: 60_000,
  expect: {
    timeout: 60_000,
  },
  /* Shared settings for all the projects below. */
  use: {
    headless: process.env.HEADED !== 'true',
    baseURL: selectedApplication?.baseURL,
    actionTimeout: 60_000,
    navigationTimeout: 60_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  /* Configure projects for major browsers */
  grep: selectedApplication
    ? new RegExp(selectedApplication.tags.join('|'))
    : undefined,
  projects: selectedApplication ? [browserProjects[0]] : browserProjects,
});
