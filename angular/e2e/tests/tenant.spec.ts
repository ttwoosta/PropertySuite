import { test, expect } from '@playwright/test';

test.describe('TenantBridge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('input-email').fill('demo@example.com');
    await page.getByTestId('input-password').fill('password');
    await page.getByTestId('btn-submit').click();
    await page.waitForURL('/');
    await page.goto('/tenant-bridge');
  });

  test('loads the tenant app', async ({ page }) => {
    await expect(page.getByTestId('nav-tenants')).toBeVisible();
    await expect(page.getByTestId('nav-ai')).toBeVisible();
    await expect(page.getByTestId('nav-queue')).toBeVisible();
  });

  test('shows tenants view by default', async ({ page }) => {
    await expect(page.getByTestId('tenants-view')).toBeVisible();
    const cards = page.getByTestId('tenant-card');
    await expect(cards.first()).toBeVisible();
  });

  test('can open thread for a tenant', async ({ page }) => {
    await page.getByTestId('tenant-card').first().click();
    await expect(page.getByTestId('thread-view')).toBeVisible();
    await expect(page.getByTestId('composer-input')).toBeVisible();
  });

  test('can send a message in thread', async ({ page }) => {
    await page.getByTestId('tenant-card').first().click();
    await page.getByTestId('composer-input').fill('Hello!');
    await page.getByTestId('btn-send').click();
    const bubbles = page.getByTestId('message-bubble');
    await expect(bubbles.last()).toContainText('Hello!');
  });

  test('shows AI suggestions', async ({ page }) => {
    await page.getByTestId('nav-ai').click();
    await expect(page.getByTestId('ai-suggestions-view')).toBeVisible();
  });

  test('can dismiss a suggestion', async ({ page }) => {
    await page.getByTestId('nav-ai').click();
    const cards = page.getByTestId('suggestion-card');
    const count = await cards.count();
    if (count > 0) {
      await page.getByTestId('btn-dismiss').first().click();
      await expect(cards).toHaveCount(count - 1);
    }
  });
});
