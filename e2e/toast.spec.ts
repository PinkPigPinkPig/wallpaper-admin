import { test, expect } from '@playwright/test';

// Test the global error handler toast system

test.describe('Global Error Handler', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to ensure unauthenticated state
    await page.goto('http://localhost:3005/auth/signin');
    // Wait for AuthGuard loading spinner to disappear (200ms delay + auth check)
    try {
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 3000 });
    } catch {
      // Spinner may not appear in headless — ignore
    }
    // Wait for the login card to be visible
    await expect(page.locator('.ant-card', { hasText: 'Login' })).toBeVisible({ timeout: 5000 });
  });

  test('shows error toast on login with wrong credentials', async ({ page }) => {
    // Fill in wrong credentials
    await page.fill('input[placeholder*="username"], input[name="username"]', 'wronguser');
    await page.fill('input[placeholder*="password"], input[name="password"]', 'wrongpassword');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for error toast to appear — Ant Design message slides in from top
    // The notice content div becomes visible when a toast is shown
    await expect(page.locator('.ant-message-notice-content')).toBeVisible({ timeout: 5000 });

    // The toast content should contain an error message
    const toastText = await page.locator('.ant-message-notice-content').textContent();
    expect(toastText).toMatch(/Login failed|Something went wrong|error/i);
  });

  test('login page loads correctly without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Login form should be visible
    await expect(page.locator('.ant-card', { hasText: 'Login' })).toBeVisible();

    // No critical console errors (filter expected auth-related messages)
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('checkAuth') &&
      !e.includes('localStorage') &&
      !e.includes('AuthGuard') &&
      !e.includes('fingerprint')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
