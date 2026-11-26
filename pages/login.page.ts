import { expect, type Locator, type Page } from '@playwright/test';
import type { Credentials } from '../test-data/user-credentials';
import { appConfig } from '../utils/app-config';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto(appConfig.sauceBaseURL);
  }

  async login(credentials: Credentials): Promise<void> {
    await this.username.fill(credentials.username);
    await this.password.fill(credentials.password);
    await this.loginButton.click();
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }
}
