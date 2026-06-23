import { test, expect } from '@playwright/test';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('demo@example.com');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
}

test.describe('Maintenance App — Task CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: /maintenance/i }).click();
    await page.waitForURL('/maintenance');
  });

  test('opens TaskEditor via Add Task button', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows validation error when task name is blank', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    // Clear the name field if there's a default value
    const nameInput = page.getByLabel(/task name/i);
    await nameInput.clear();
    await page.getByRole('button', { name: /save/i }).click();
    // Save should not proceed — dialog stays open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('happy path: adds a new task', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByLabel(/task name/i).fill('E2E Test Task');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('E2E Test Task')).toBeVisible();
    await expect(page.getByText(/task added/i)).toBeVisible();
  });

  test('toggles a task to done and back', async ({ page }) => {
    // Click the first task's status toggle (checkbox / done button)
    const firstToggle = page.locator('[data-testid="task-done-btn"]').first();
    await firstToggle.click();
    // After toggling done the task should show a done indicator
    await expect(firstToggle).toHaveAttribute('data-done', 'true');
    // Toggle back
    await firstToggle.click();
    await expect(firstToggle).not.toHaveAttribute('data-done', 'true');
  });

  test('edits an existing task and sees updated name', async ({ page }) => {
    await page.locator('[data-testid="task-edit-btn"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const nameInput = page.getByLabel(/task name/i);
    await nameInput.fill('Updated Task Name');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Updated Task Name')).toBeVisible();
    await expect(page.getByText(/task updated/i)).toBeVisible();
  });
});
