import { LoginPage } from '../pages/login.page';
import { appConfig } from '../utils/app-config';
import { applications } from '../utils/applications';
import { expect, test } from './fixtures/role.fixture';

test(
  'redirects logged-out users away from the protected inventory URL',
  { tag: [applications.saucedemo.tags[0], '@smoke', '@regression'] },
  async ({ page }) => {
    await page.goto(new URL('/inventory.html', appConfig.sauceBaseURL).toString());

    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(new LoginPage(page).loginButton).toBeVisible();
  },
);
