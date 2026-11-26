import { Given, Then, When, World } from '@cucumber/cucumber';
import { expect, type Page } from '@playwright/test';
import { TodoPage } from '../../pages/todomvc/todo.page';

interface TodoWorld extends World {
  page: Page;
  todoPage?: TodoPage;
}

function todoPage(world: TodoWorld): TodoPage {
  if (!world.todoPage) {
    throw new Error('TodoMVC page was not initialized.');
  }
  return world.todoPage;
}

Given('I open TodoMVC', async function (this: TodoWorld) {
  this.todoPage = new TodoPage(this.page);
  await this.todoPage.open();
});

Given('I add a todo called {string}', async function (this: TodoWorld, title: string) {
  await todoPage(this).addTodo(title);
});

When('I create a todo called {string}', async function (this: TodoWorld, title: string) {
  await todoPage(this).addTodo(title);
});

Then('I should see a todo called {string}', async function (this: TodoWorld, title: string) {
  await expect(todoPage(this).item(title).label).toBeVisible();
});

When(
  'I mark the todo {string} as complete',
  async function (this: TodoWorld, title: string) {
    await todoPage(this).item(title).toggle();
  },
);

Then('the todo {string} should be completed', async function (this: TodoWorld, title: string) {
  await expect(todoPage(this).item(title).checkbox).toBeChecked();
});

When('I filter to active todos', async function (this: TodoWorld) {
  await todoPage(this).activeFilter.click();
});

Then('I should see only the todo {string}', async function (this: TodoWorld, title: string) {
  const todos = todoPage(this);
  await expect(todos.items).toHaveCount(1);
  await expect(todos.item(title).label).toBeVisible();
});

When('I delete the todo {string}', async function (this: TodoWorld, title: string) {
  await todoPage(this).item(title).remove();
});

Then('I should have no todos', async function (this: TodoWorld) {
  await expect(todoPage(this).items).toHaveCount(0);
});
