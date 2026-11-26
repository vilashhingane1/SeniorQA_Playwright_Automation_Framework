import { expect, test } from './fixtures/role.fixture';
import { applications } from '../utils/applications';

test.use({ userRole: 'problem_user' });

test(
  'problem_user displays the expected backpack product image',
  { tag: [applications.saucedemo.tags[0], '@regression'] },
  async ({ rolePage: page }) => {
    test.fail(true, 'Known Sauce Demo defect: problem_user can display another product image.');
    await expect(
      page.locator('[data-test="inventory-item-sauce-labs-backpack-img"]'),
    ).toHaveAttribute('src', /sauce-backpack/, { timeout: 5_000 });
  },
);
