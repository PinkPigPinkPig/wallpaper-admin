import { test, expect } from "@playwright/test";
import {
  login,
  cleanupWallpaper,
  samplePngPath,
} from "./fixtures/helpers";

test.describe("Wallpaper", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("wallpaper list loads with pagination", async ({ page }) => {
    await page.goto("/admin/wallpaper");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".ant-pagination")).toBeVisible({
      timeout: 3000,
    });
  });

  test("create wallpaper with resource + thumbnail upload", async ({
    page,
  }) => {
    const wallpaperName = `Test Wallpaper ${Date.now()}`;

    await page.goto("/admin/wallpaper/create");

    // Select first category
    await page.locator(".ant-select").first().click();
    await page
      .locator(".ant-select-dropdown .ant-select-item")
      .first()
      .click();

    await page.fill('input[name="wallpaper.name"]', wallpaperName);
    await page.fill('input[name="wallpaper.tags"]', "e2e, test");

    // Upload resource file
    await page.locator('input[type="file"]').first().setInputFiles(samplePngPath());
    await page.waitForTimeout(500);
    await page.locator('input[type="file"]').nth(1).setInputFiles(samplePngPath());

    await page.locator("button:has-text('Save'), button[type='submit']").first().click();
    await expect(page).toHaveURL("**/admin/wallpaper", { timeout: 15000 });
    await expect(
      page.locator(".ant-table", { hasText: wallpaperName })
    ).toBeVisible({ timeout: 5000 });

    // Cleanup
    const rows = await page.locator(".ant-table-tbody tr").all();
    for (const row of rows) {
      const text = await row.textContent();
      if (text?.includes(wallpaperName)) {
        await row.click();
        await expect(page).toHaveURL("**/admin/wallpaper/**/detail");
        const match = page.url().match(/\/wallpaper\/(\d+)\/detail/);
        if (match) {
          await cleanupWallpaper(page, parseInt(match[1]));
        }
        break;
      }
    }
  });

  test("wallpaper detail view is read-only", async ({ page }) => {
    await page.goto("/admin/wallpaper");
    await page.locator(".ant-table-tbody tr").first().click();
    await expect(page).toHaveURL("**/admin/wallpaper/**/detail", {
      timeout: 5000,
    });
    const disabledInputs = await page.locator(
      "input[disabled], input[readonly]"
    ).count();
    expect(disabledInputs).toBeGreaterThan(0);
  });
});
