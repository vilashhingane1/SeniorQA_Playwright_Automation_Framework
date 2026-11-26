import { expect, type Locator, type Page } from '@playwright/test';
import { appTestId } from '../utils/app-test-id';

export class CheckoutPage {
  readonly title: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.title = appTestId(page, 'title');
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.errorMessage = page.getByRole('alert');
    this.completeHeader = appTestId(page, 'complete-header');
  }

  async enterCustomerDetails(details: {
    firstName: string;
    lastName: string;
    postalCode: string;
  }): Promise<void> {
    await this.firstName.fill(details.firstName);
    await this.lastName.fill(details.lastName);
    await this.postalCode.fill(details.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async expectOverview(): Promise<void> {
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async expectOrderConfirmation(): Promise<void> {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
