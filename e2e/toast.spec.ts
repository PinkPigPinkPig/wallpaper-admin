import { test, expect } from "@playwright/test";

// Test the global error handler toast system

test.describe("Global Error Handler", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");
    // Wait for the login form to be visible
    await expect(page.locator("#username")).toBeVisible({ timeout: 5000 });
  });

  test("shows error toast on login with wrong credentials", async ({ page }) => {
    await page.fill("#username", "wronguser");
    await page.fill("#password", "wrongpassword");
    await page.click("button[type='submit']");

    // Wait for error toast to appear
    await expect(page.locator(".ant-message-error").first()).toBeVisible({ timeout: 5000 });
    const toastText = await page.locator(".ant-message-custom-content").first().textContent();
    expect(toastText).toMatch(/Login failed|Login failed|Something went wrong|error/i);
  });

  test("login page loads correctly without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/auth/signin");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#username")).toBeVisible();

    // Filter out expected auth-related messages
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes("checkAuth") &&
        !e.includes("localStorage") &&
        !e.includes("AuthGuard") &&
        !e.includes("fingerprint")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe("Logout", () => {
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

    await page.goto("/admin/wallpaper");
    await expect(page).toHaveURL(/\/admin\/wallpaper/, { timeout: 10000 });

    await page.locator("button:has-text('Logout')").click();
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });

    const tokens = await page.evaluate(() => localStorage.getItem("tokens"));
    expect(tokens).toBeNull();
  });
});
