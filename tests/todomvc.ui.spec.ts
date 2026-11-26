import { expect, test } from '@playwright/test';
import { TodoPage } from '../pages/todomvc/todo.page';
import { applications } from '../utils/applications';

test.beforeEach(async ({ page }) => {
  await new TodoPage(page).open();
});

test(
  'adds a todo',
  { tag: [applications.todomvc.tags[0], '@smoke', '@regression'] },
  async ({ page }) => {
  const todos = new TodoPage(page);

  await todos.addTodo('Prepare test plan');

  await expect(todos.items).toHaveCount(1);
  await expect(todos.item('Prepare test plan').label).toHaveText('Prepare test plan');
  },
);

test(
  'marks a todo as completed',
  { tag: [applications.todomvc.tags[0], '@regression'] },
  async ({ page }) => {
    const todos = new TodoPage(page);
    await todos.addTodo('Review test results');

    await todos.item('Review test results').toggle();

    await expect(todos.item('Review test results').checkbox).toBeChecked();
  },
);

test(
  'filters completed todos from the active list',
  { tag: [applications.todomvc.tags[0], '@regression'] },
  async ({ page }) => {
    const todos = new TodoPage(page);
    await todos.addTodo('Active task');
    await todos.addTodo('Completed task');
    await todos.item('Completed task').toggle();

    await todos.activeFilter.click();

    await expect(todos.items).toHaveCount(1);
    await expect(todos.item('Active task').label).toBeVisible();
    await expect(todos.item('Completed task').row).toBeHidden();
  },
);

test(
  'deletes a todo',
  { tag: [applications.todomvc.tags[0], '@regression'] },
  async ({ page }) => {
    const todos = new TodoPage(page);

    await todos.addTodo('Remove this task');

    await todos.item('Remove this task').remove();

    await expect(todos.items).toHaveCount(0);
  },
);
