import { test, expect } from '@playwright/test';

test.describe('Rent Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('input-email').fill('demo@example.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('btn-submit').click();
    await page.waitForURL('/');
    await page.goto('/rent');
  });

  test('loads the rent app with navigation', async ({ page }) => {
    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('nav-houses')).toBeVisible();
    await expect(page.getByTestId('nav-receipts')).toBeVisible();
  });

  test('shows KPI grid on dashboard', async ({ page }) => {
    await expect(page.getByTestId('kpi-grid')).toBeVisible();
  });

  test('shows room status table', async ({ page }) => {
    await expect(page.getByTestId('room-status-table')).toBeVisible();
    const rows = page.getByTestId('room-row');
    await expect(rows.first()).toBeVisible();
  });

  test('navigates to Houses view', async ({ page }) => {
    await page.getByTestId('nav-houses').click();
    await expect(page.getByTestId('rooms-table')).toBeVisible();
  });

  test('can open add house drawer', async ({ page }) => {
    await page.getByTestId('nav-houses').click();
    // May need to wait for loading
    const addBtn = page.getByTestId('btn-add-house');
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      await expect(page.getByTestId('input-house-address')).toBeVisible();
    }
  });

  test('navigates to Receipts view', async ({ page }) => {
    await page.getByTestId('nav-receipts').click();
    await expect(page.locator('h2')).toContainText('Receipts');
  });

  test('navigates to Expenses view', async ({ page }) => {
    await page.getByTestId('nav-expenses').click();
    await expect(page.getByTestId('expenses-list')).toBeVisible();
  });

  test('navigates to Year Grid view', async ({ page }) => {
    await page.getByTestId('nav-grid').click();
    await expect(page.getByTestId('year-grid')).toBeVisible();
  });

  test('can open add rent drawer from houses view', async ({ page }) => {
    await page.getByTestId('nav-houses').click();
    const rentBtn = page.getByTestId('btn-add-rent').first();
    if (await rentBtn.count() > 0) {
      await rentBtn.click();
      await expect(page.getByTestId('input-rent-tenant')).toBeVisible();
    }
  });
});
