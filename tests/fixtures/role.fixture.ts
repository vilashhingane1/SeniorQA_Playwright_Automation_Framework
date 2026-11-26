import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { expect, test as base, type Browser, type Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { InventoryPage } from '../../pages/inventory.page';
import { appConfig } from '../../utils/app-config';
import { credentialsFor, type SauceUserRole } from '../../test-data/user-credentials';

type TestFixtures = {
  storageState: string | undefined;
  rolePage: Page;
};

type WorkerFixtures = {
  userRole: SauceUserRole | null;
  workerStorageState: string | undefined;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  userRole: [null, { scope: 'worker', option: true }],
  workerStorageState: [
    async ({ browser, userRole }, use, workerInfo) => {
      if (!userRole) {
        await use(undefined);
        return;
      }

      const stateDirectory = path.resolve(__dirname, '../../playwright/.auth');
      await mkdir(stateDirectory, { recursive: true });
      const statePath = path.join(
        stateDirectory,
        `${userRole}-${workerInfo.workerIndex}-${process.pid}.json`,
      );
      await createStorageState(browser, userRole, statePath);
      try {
        await use(statePath);
      } finally {
        await rm(statePath);
      }
    },
    { scope: 'worker', timeout: 60_000 },
  ],
  storageState: async ({ workerStorageState }, use) => {
    await use(workerStorageState);
  },
  rolePage: async ({ page, userRole }, use) => {
    if (!userRole) {
      throw new Error('Set userRole with test.use() before requesting the authenticated rolePage.');
    }
    await page.goto(new URL('/inventory.html', appConfig.sauceBaseURL).toString());
    await use(page);
  },
});

async function createStorageState(
  browser: Browser,
  role: SauceUserRole,
  statePath: string,
): Promise<void> {
  const context = await browser.newContext({ baseURL: appConfig.sauceBaseURL });
  try {
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(credentialsFor(role));
    await new InventoryPage(page).expectLoaded();
    await context.storageState({ path: statePath });
  } finally {
    await context.close();
  }
}

export { expect };
