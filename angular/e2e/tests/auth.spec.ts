import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page when not signed in', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
    await expect(page.getByTestId('btn-submit')).toBeVisible();
  });

  test('toggles between sign-in and sign-up', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('btn-submit')).toContainText('Sign in');
    await page.getByTestId('btn-toggle-mode').click();
    await expect(page.getByTestId('btn-submit')).toContainText('Create account');
    await page.getByTestId('btn-toggle-mode').click();
    await expect(page.getByTestId('btn-submit')).toContainText('Sign in');
  });

  test('signs in with demo credentials and reaches launcher', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('input-email').fill('demo@example.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('btn-submit').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('launcher')).toBeVisible();
  });

  test('redirects unauthenticated user from protected route to login', async ({ page }) => {
    // Clear any stored session
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/maintenance');
    await expect(page).toHaveURL(/login/);
  });
});
