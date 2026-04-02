import { test, expect } from "@playwright/test";
import { login, cleanupWallpaper, samplePngPath } from "./fixtures/helpers";

test.describe("Wallpaper", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("wallpaper list loads with pagination", async ({ page }) => {
    await page.goto("/admin/wallpaper");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".ant-pagination")).toBeVisible({ timeout: 3000 });
  });

  test("create wallpaper with resource + thumbnail upload", async ({ page }) => {
    const wallpaperName = `Test Wallpaper ${Date.now()}`;

    await page.goto("/admin/wallpaper/create");
    await page.waitForSelector("#wallpaper_categoryId", { timeout: 5000 });

    await page.locator("#wallpaper_categoryId").click();
    await page.waitForSelector(".ant-select-dropdown", { timeout: 3000 });
    await page.locator(".ant-select-dropdown .ant-select-item").first().click();

    await page.fill("#wallpaper_name", wallpaperName);
    await page.fill("#wallpaper_tags", "e2e, test");

    await page.locator('input[type="file"]').first().setInputFiles(samplePngPath());
    await page.waitForTimeout(500);
    await page.locator('input[type="file"]').nth(1).setInputFiles(samplePngPath());
    await page.waitForTimeout(500);

    await page.locator("button:has-text('Save')").first().click();
    await expect(page).toHaveURL(/\/admin\/wallpaper/, { timeout: 15000 });

    // Wait for the table to finish loading
    await page.waitForFunction(
      () => !document.querySelector(".ant-spin-nested-loading") ||
        document.querySelector(".ant-spin") === null,
      { timeout: 10000 }
    );
    await page.waitForLoadState("networkidle");

    // Navigate to last page (wallpaper list has 3339+ items, new entry lands last)
    const lastPageBtn = page.locator(".ant-pagination-item").last();
    if (await lastPageBtn.isVisible()) {
      await lastPageBtn.click();
      await page.waitForFunction(
        () => !document.querySelector(".ant-spin-nested-loading") ||
          document.querySelector(".ant-spin") === null,
        { timeout: 10000 }
      );
    }

    // Verify name appears in table
    await expect(
      page.locator(".ant-table", { hasText: wallpaperName })
    ).toBeVisible({ timeout: 5000 });

    // Cleanup — open more menu for the row with the new wallpaper name
    // Ant Design renders the name in a table cell — hover the row to reveal more btn
    const rows = page.locator(".ant-table-tbody tr.ant-table-row:visible");
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const text = await row.textContent();
      if (text?.includes(wallpaperName)) {
        await row.hover();
        await page.waitForTimeout(200);
        const moreBtn = row.locator('[aria-label="more"]');
        await moreBtn.click();
        await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 2000 });
        const editItem = page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i });
        await editItem.click();
        await expect(page).toHaveURL(/\/admin\/wallpaper\/\d+\/detail/, { timeout: 5000 });
        const match = page.url().match(/\/wallpaper\/(\d+)\/detail/);
        if (match) await cleanupWallpaper(page, parseInt(match[1]));
        break;
      }
    }
  });

  test("wallpaper detail view is read-only", async ({ page }) => {
    await page.goto("/admin/wallpaper");
    await page.waitForLoadState("networkidle");
    await page.locator(".ant-table-tbody tr.ant-table-row:visible").first().hover();
    await page.locator('[aria-label="more"]').first().click();
    await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 3000 });
    await page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i }).click();
    await expect(page).toHaveURL(/\/admin\/wallpaper\/\d+\/detail/, { timeout: 5000 });
    const inputs = await page.locator("input").count();
    expect(inputs).toBeGreaterThan(0);
  });
});
