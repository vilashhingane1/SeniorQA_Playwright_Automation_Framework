import type { Locator, Page } from '@playwright/test';

export class TodoItem {
  readonly row: Locator;
  readonly label: Locator;
  readonly checkbox: Locator;

  constructor(todoList: Locator, page: Page, title: string) {
    this.row = todoList.locator('li').filter({
      has: page.getByText(title, { exact: true }),
    });
    this.label = this.row.locator('label');
    this.checkbox = this.row.locator('input.toggle');
  }

  async toggle(): Promise<void> {
    await this.checkbox.check();
  }

  async remove(): Promise<void> {
    await this.row.hover();
    await this.row.locator('button.destroy').click();
  }
}
