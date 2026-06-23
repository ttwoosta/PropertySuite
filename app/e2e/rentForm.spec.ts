import { test, expect } from '@playwright/test';

// Signs in with demo credentials (any email/password works in demo mode).
async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('demo@example.com');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
}

test.describe('Rent Tracker — Add House drawer', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: /rent/i }).click();
    await page.waitForURL('/rent');
  });

  test('opens Add House drawer and closes on Cancel', async ({ page }) => {
    await page.getByRole('button', { name: /add house/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows validation error when rent is 0 and does not close', async ({ page }) => {
    await page.getByRole('button', { name: /add house/i }).click();
    await page.getByPlaceholder('0.00').fill('0');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/rent must be greater than/i)).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('happy path: fills form and submits successfully', async ({ page }) => {
    await page.getByRole('button', { name: /add house/i }).click();
    await page.getByPlaceholder('e.g. 428 Maple Street, Madison WI').fill('99 E2E Lane, Test City');
    await page.getByPlaceholder('0.00').fill('800');
    await page.getByRole('button', { name: /save/i }).click();
    // Drawer should close after a successful save
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // Toast should confirm house was added
    await expect(page.getByText(/house added/i)).toBeVisible();
  });
});

test.describe('Rent Tracker — Edit Room drawer', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: /rent/i }).click();
    await page.waitForURL('/rent');
  });

  test('opens Edit Room drawer for an existing room', async ({ page }) => {
    // Click the first room's edit button (pencil / edit icon button)
    await page.locator('[data-testid="room-edit-btn"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('shows name-required error when room name is cleared', async ({ page }) => {
    await page.locator('[data-testid="room-edit-btn"]').first().click();
    const nameInput = page.getByLabel(/unit name/i).first();
    await nameInput.clear();
    await page.getByRole('button', { name: /save room/i }).click();
    await expect(page.getByText(/room name is required/i)).toBeVisible();
  });
});

test.describe('Rent Tracker — Add Rent drawer', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: /rent/i }).click();
    await page.waitForURL('/rent');
  });

  test('opens Add Rent drawer and shows renter-required error on empty submit', async ({ page }) => {
    await page.locator('[data-testid="room-rent-btn"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const renterInput = page.getByLabel(/renter/i);
    await renterInput.clear();
    await page.getByRole('button', { name: /add rent/i }).click();
    await expect(page.getByText(/renter is required/i)).toBeVisible();
  });

  test('Mark as paid toggles the received amount to full due', async ({ page }) => {
    await page.locator('[data-testid="room-rent-btn"]').first().click();
    await page.getByRole('button', { name: /mark as paid/i }).click();
    const dueInput = page.getByLabel(/amount due/i);
    const receivedInput = page.getByLabel(/received/i);
    const due = await dueInput.inputValue();
    const received = await receivedInput.inputValue();
    expect(due).toBe(received);
  });
});
