import { test, expect } from "@playwright/test";
import { login, ADMIN_USERNAME, ADMIN_PASSWORD } from "./fixtures/helpers";

test.describe("Auth", () => {
  test("successful login redirects to admin wallpapers", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.fill('input[name="username"]', ADMIN_USERNAME);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click("button[type='submit']");
    await expect(page).toHaveURL("**/admin/wallpaper", { timeout: 10000 });
    await expect(page.locator("button:has-text('Logout')")).toBeVisible();
  });

  test("failed login shows error and stays on signin", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.fill('input[name="username"]', "wronguser");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click("button[type='submit']");
    await expect(page).toHaveURL("**/auth/signin", { timeout: 5000 });
    // Error message appears (toast or inline)
    await expect(
      page.locator(".ant-message-notice-content, .ant-message-error")
    ).toBeVisible({ timeout: 5000 });
  });

  test("logout clears tokens and redirects to signin", async ({ page }) => {
    // Seed valid auth tokens directly (same pattern as toast.spec.ts)
    const futureExpiry = Date.now() + 1000 * 60 * 60;
    await page.goto("/auth/signin");
    await page.evaluate((futureExpiry) => {
      localStorage.setItem("fingerprint", "test-fingerprint");
      localStorage.setItem(
        "tokens",
        JSON.stringify({
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
          expiresAt: futureExpiry,
          remember: true,
        })
      );
      localStorage.setItem(
        "user",
        JSON.stringify({
          user: { id: 1, username: "admin" },
          expiresAt: futureExpiry,
        })
      );
    }, futureExpiry);

    // Navigate to admin — should load since tokens are valid
    await page.goto("/admin/wallpaper");
    await expect(page).toHaveURL("**/admin/wallpaper", { timeout: 10000 });

    // Click Logout
    await page.locator("button:has-text('Logout')").click();
    await expect(page).toHaveURL("**/auth/signin", { timeout: 5000 });

    // Tokens should be cleared
    const tokens = await page.evaluate(() => localStorage.getItem("tokens"));
    expect(tokens).toBeNull();
  });
});
