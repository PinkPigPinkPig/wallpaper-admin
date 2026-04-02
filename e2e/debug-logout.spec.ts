import { test, expect } from "@playwright/test";

// Debug spec — kept for development; uses baseURL from playwright.config
test("debug logout click", { timeout: 60000 }, async ({ page }) => {
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

  const logoutButtons = await page.locator("button").filter({ hasText: /logout/i }).all();
  console.log(`Found ${logoutButtons.length} logout buttons`);

  if (logoutButtons.length > 0) {
    await logoutButtons[0].click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });
    const tokens = await page.evaluate(() => localStorage.getItem("tokens"));
    expect(tokens).toBeNull();
  }
});
