import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { applications } from '../utils/applications';
import { expect, test } from './fixtures/role.fixture';

test.use({ userRole: 'standard_user' });

test(
  'completes a purchase from inventory through order confirmation',
  { tag: [applications.saucedemo.tags[0], '@smoke', '@regression'] },
  async ({ rolePage: page }) => {
    const inventory = new InventoryPage(page);
    await inventory.addProduct('Sauce Labs Backpack');
    await inventory.openCart();

    const cart = new CartPage(page);
    await expect(cart.item('Sauce Labs Backpack')).toBeVisible();
    await cart.checkout();

    const checkout = new CheckoutPage(page);
    await checkout.enterCustomerDetails({
      firstName: 'Alex',
      lastName: 'Tester',
      postalCode: '10001',
    });
    await checkout.continue();
    await checkout.expectOverview();
    await checkout.finish();
    await checkout.expectOrderConfirmation();
  },
);

test(
  'checkout rejects a missing last name',
  { tag: [applications.saucedemo.tags[0], '@regression'] },
  async ({ rolePage: page }) => {
    const inventory = new InventoryPage(page);
    await inventory.addProduct('Sauce Labs Backpack');
    await inventory.openCart();
    await new CartPage(page).checkout();

    const checkout = new CheckoutPage(page);
    await checkout.firstName.fill('Alex');
    await checkout.postalCode.fill('10001');
    await checkout.continue();
    await expect(checkout.errorMessage).toContainText('Error: Last Name is required');
  },
);
