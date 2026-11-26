import {
  After,
  Before,
  Given,
  Then,
  When,
  World,
  setDefaultTimeout,
  setWorldConstructor,
} from '@cucumber/cucumber';
import { chromium, type Browser, type Page } from '@playwright/test';
import { InventoryPage } from '../../pages/inventory.page';
import { LoginPage } from '../../pages/login.page';
import { credentialsFor } from '../../test-data/user-credentials';

setDefaultTimeout(60_000);

class SauceDemoWorld extends World {
  browser!: Browser;
  page!: Page;
  loginPage!: LoginPage;

  constructor(options: ConstructorParameters<typeof World>[0]) {
    super(options);
  }
}

setWorldConstructor(SauceDemoWorld);

Before({ tags: '@ui or @todomvc or @SauceDemo' }, async function (this: SauceDemoWorld) {
  const isHeaded = process.env.HEADED === 'true';
  this.browser = await chromium.launch({
    headless: !isHeaded,
    slowMo: isHeaded ? 500 : 0,
    args: isHeaded ? ['--start-maximized'] : [],
  });
  this.page = await this.browser.newPage({ viewport: isHeaded ? null : undefined });
  this.page.setDefaultTimeout(60_000);
  this.page.setDefaultNavigationTimeout(60_000);
});

After({ tags: '@ui or @todomvc or @SauceDemo' }, async function (this: SauceDemoWorld) {
  await this.browser.close();
});

Given('I open the Sauce Demo login page', async function (this: SauceDemoWorld) {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.open();
});

When('I log in as the standard user', async function (this: SauceDemoWorld) {
  await this.loginPage.login(credentialsFor('standard_user'));
});

Then('I should see the product inventory', async function (this: SauceDemoWorld) {
  await new InventoryPage(this.page).expectLoaded();
});
