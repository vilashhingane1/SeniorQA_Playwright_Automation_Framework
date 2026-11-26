import { credentialsFor } from '../test-data/user-credentials';
import { LoginPage } from '../pages/login.page';
import { applications } from '../utils/applications';
import { expect, test } from './fixtures/role.fixture';

test(
  'invalid credentials show a helpful login error',
  { tag: [applications.saucedemo.tags[0], '@regression'] },
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login({
      username: credentialsFor('standard_user').username,
      password: 'invalid-password',
    });

    await loginPage.expectError('Username and password do not match');
  },
);

test(
  'locked-out user is prevented from logging in',
  { tag: [applications.saucedemo.tags[0], '@regression'] },
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(credentialsFor('locked_out_user'));

    await loginPage.expectError('Sorry, this user has been locked out');
  },
);
