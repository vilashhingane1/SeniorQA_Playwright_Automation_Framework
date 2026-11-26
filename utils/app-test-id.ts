import type { Page } from '@playwright/test';

export function appTestId(page: Page, name: string) {
  return page.locator(`[data-test="${name}"]`);
}
