import type { Locator, Page } from '@playwright/test';
import { applications } from '../../utils/applications';
import { TodoItem } from './todo-item.component';

export class TodoPage {
  readonly newTodoInput: Locator;
  readonly todoList: Locator;
  readonly items: Locator;
  readonly activeFilter: Locator;

  constructor(private readonly page: Page) {
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoList = page.locator('.todo-list');
    this.items = this.todoList.locator('li');
    this.activeFilter = page.getByRole('link', { name: 'Active', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto(applications.todomvc.baseURL);
  }

  async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  item(title: string): TodoItem {
    return new TodoItem(this.todoList, this.page, title);
  }
}
