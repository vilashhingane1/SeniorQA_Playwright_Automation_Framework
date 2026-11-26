import { InventoryPage } from '../pages/inventory.page';
import { applications } from '../utils/applications';
import { expect, test } from './fixtures/role.fixture';

test.use({ userRole: 'standard_user' });

test(
  'sorts inventory and adds then removes an item',
  { tag: [applications.saucedemo.tags[0], '@regression'] },
  async ({ rolePage: page }) => {
    const inventory = new InventoryPage(page);
    await inventory.expectLoaded();

    await inventory.sortBy('lohi');
    await expect(page.locator('[data-test="inventory-item-name"]').first()).toHaveText(
      'Sauce Labs Onesie',
    );

    await inventory.addProduct('Sauce Labs Backpack');
    await expect(inventory.cartBadge).toHaveText('1');
    await inventory.removeProduct('Sauce Labs Backpack');
    await expect(inventory.cartBadge).toHaveCount(0);
  },
);
