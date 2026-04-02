import { test, expect } from "@playwright/test";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "./fixtures/helpers";

test.describe("Auth", () => {
  test("successful login redirects to admin wallpapers", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.fill("#username", ADMIN_USERNAME);
    await page.fill("#password", ADMIN_PASSWORD);
    await page.click("button[type='submit']");
    // Wait for redirect to /admin/wallpaper
    await expect(page).toHaveURL(/\/admin\/wallpaper/, { timeout: 10000 });
    await expect(page.locator("button:has-text('Logout')")).toBeVisible();
  });

  test("failed login shows error and stays on signin", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.fill("#username", "wronguser");
    await page.fill("#password", "wrongpassword");
    await page.click("button[type='submit']");
    // Stay on signin page
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });
    // Error toast appears (use .first() — there may be 2 due to legacy deployment lag)
    await expect(page.locator(".ant-message-error").first()).toBeVisible({ timeout: 5000 });
  });

  test("logout clears tokens and redirects to signin", async ({ page }) => {
    const futureExpiry = Date.now() + 1000 * 60 * 60;
    await page.goto("/auth/signin");
    await page.evaluate((expiry) => {
      localStorage.setItem("fingerprint", "test-fingerprint");
      localStorage.setItem(
        "tokens",
        JSON.stringify({
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          expiresAt: expiry,
          remember: true,
        })
      );
      localStorage.setItem(
        "user",
        JSON.stringify({ user: { id: 1, username: "admin" }, expiresAt: expiry })
      );
    }, futureExpiry);

    // Navigate to admin — should load since tokens are valid
    await page.goto("/admin/wallpaper");
    await expect(page).toHaveURL(/\/admin\/wallpaper/, { timeout: 10000 });

    // Click Logout
    await page.locator("button:has-text('Logout')").click();
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });

    // Tokens should be cleared
    const tokens = await page.evaluate(() => localStorage.getItem("tokens"));
    expect(tokens).toBeNull();
  });
});
