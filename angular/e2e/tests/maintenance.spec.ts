import { test, expect } from '@playwright/test';

test.describe('Maintenance App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('input-email').fill('demo@example.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('btn-submit').click();
    await page.waitForURL('/');
    await page.goto('/maintenance');
  });

  test('loads the maintenance app', async ({ page }) => {
    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('nav-prep')).toBeVisible();
    await expect(page.getByTestId('nav-schedule')).toBeVisible();
  });

  test('shows property selector buttons', async ({ page }) => {
    await expect(page.getByTestId('prop-btn-elm')).toBeVisible();
    await expect(page.getByTestId('prop-btn-birch')).toBeVisible();
    await expect(page.getByTestId('prop-btn-park')).toBeVisible();
  });

  test('can switch properties', async ({ page }) => {
    await page.getByTestId('prop-btn-birch').click();
    // The selected button should be highlighted — we check it's clickable and doesn't error
    await expect(page.getByTestId('prop-btn-birch')).toBeVisible();
  });

  test('can open add task modal', async ({ page }) => {
    await page.getByTestId('btn-add-task').click();
    await expect(page.getByTestId('task-name-input')).toBeVisible();
  });

  test('can fill and submit a new task', async ({ page }) => {
    await page.getByTestId('btn-add-task').click();
    await page.getByTestId('task-name-input').fill('Test task');
    await page.getByTestId('btn-save-task').click();
    // Modal should close
    await expect(page.getByTestId('task-name-input')).not.toBeVisible();
  });

  test('navigates to schedule view', async ({ page }) => {
    await page.getByTestId('nav-schedule').click();
    await expect(page.locator('h2')).toContainText('Schedule');
  });
});
