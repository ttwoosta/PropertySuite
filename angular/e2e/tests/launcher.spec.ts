import { test, expect } from '@playwright/test';

test.describe('Launcher', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in via demo mode
    await page.goto('/login');
    await page.getByTestId('input-email').fill('demo@example.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('btn-submit').click();
    await page.waitForURL('/');
  });

  test('shows 3 app cards on desktop', async ({ page }) => {
    await expect(page.getByTestId('launcher')).toBeVisible();
    const cards = page.locator('[data-testid^="app-card-"]');
    await expect(cards).toHaveCount(3);
  });

  test('navigates to Rent Tracker', async ({ page }) => {
    await page.getByTestId('app-card-rent').click();
    await expect(page).toHaveURL('/rent');
  });

  test('navigates to Maintenance', async ({ page }) => {
    await page.getByTestId('app-card-maint').click();
    await expect(page).toHaveURL('/maintenance');
  });

  test('navigates to TenantBridge', async ({ page }) => {
    await page.getByTestId('app-card-tenant').click();
    await expect(page).toHaveURL('/tenant-bridge');
  });

  test('profile link stores return path', async ({ page }) => {
    await page.getByTestId('profile-link').click();
    await expect(page).toHaveURL('/profile');
  });
});
