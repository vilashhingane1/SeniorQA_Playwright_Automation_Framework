import { expect, type Locator, type Page } from '@playwright/test';
import { appTestId } from '../utils/app-test-id';

export class InventoryPage {
  readonly heading: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;

  constructor(private readonly page: Page) {
    this.heading = appTestId(page, 'title');
    this.sortDropdown = appTestId(page, 'product-sort-container');
    this.cartBadge = appTestId(page, 'shopping-cart-badge');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toHaveText('Products');
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(value);
  }

  product(name: string): Locator {
    return appTestId(this.page, 'inventory-item').filter({ hasText: name });
  }

  async addProduct(name: string): Promise<void> {
    await this.product(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeProduct(name: string): Promise<void> {
    await this.product(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openCart(): Promise<void> {
    await appTestId(this.page, 'shopping-cart-link').click();
  }
}
