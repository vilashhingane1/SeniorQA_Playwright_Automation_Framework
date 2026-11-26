import { expect, type Locator, type Page } from '@playwright/test';
import { appTestId } from '../utils/app-test-id';

export class CartPage {
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  item(name: string): Locator {
    return appTestId(this.page, 'inventory-item').filter({ hasText: name });
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
