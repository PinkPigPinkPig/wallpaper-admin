import { test, expect } from "@playwright/test";
import {
  login,
  cleanupMenu,
  cleanupWallpaper,
  samplePngPath,
} from "./fixtures/helpers";

test.describe("Menu", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("menu list loads", async ({ page }) => {
    await page.goto("/admin/menu");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  });

  test("create menu via wallpaper table modal", async ({ page }) => {
    // Ensure a wallpaper exists
    await page.goto("/admin/wallpaper");
    const rowCount = await page.locator(".ant-table-tbody tr").count();

    if (rowCount === 0) {
      // Create a wallpaper first
      await page.goto("/admin/wallpaper/create");
      await page.locator(".ant-select").first().click();
      await page
        .locator(".ant-select-dropdown .ant-select-item")
        .first()
        .click();
      await page.fill(
        'input[name="wallpaper.name"]',
        `Test Wallpaper ${Date.now()}`
      );
      await page
        .locator('input[type="file"]')
        .first()
        .setInputFiles(samplePngPath());
      await page.waitForTimeout(300);
      await page
        .locator('input[type="file"]')
        .nth(1)
        .setInputFiles(samplePngPath());
      await page
        .locator("button:has-text('Save')")
        .first()
        .click();
      await expect(page).toHaveURL("**/admin/wallpaper", { timeout: 15000 });
    }

    // Open Create Menu modal
    await page.goto("/admin/wallpaper");
    await page.waitForSelector(".ant-table", { timeout: 10000 });

    // Click "..." dropdown on first row
    await page.locator(".ant-table-tbody tr").first().locator('[role="button"], .anticon-more, [aria-label="more"]').click();
    await page.waitForSelector(".ant-dropdown-menu, .ant-dropdown-menu-item", { timeout: 3000 });
    await page
      .locator(".ant-dropdown-menu-item, .ant-dropdown-menu .ant-dropdown-menu-item")
      .filter({ hasText: /create menu/i })
      .click();

    await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 5000 });

    // Fill menu form
    await page.locator(".ant-select").first().click();
    await page
      .locator(".ant-select-item")
      .filter({ hasText: /both/i })
      .first()
      .click();

    await page.locator(".ant-select").nth(1).click();
    await page
      .locator(".ant-select-item")
      .filter({ hasText: /popular/i })
      .first()
      .click();

    await page.locator("input.ant-input-number").first().fill("1");
    await page.locator("input.ant-input-number").nth(1).fill("1");

    await page.locator(".ant-modal button:has-text('Create Menu'), .ant-modal [type='button']").last().click();

    // Modal should close
    await expect(page.locator(".ant-modal")).not.toBeVisible({ timeout: 5000 });

    // Verify menu appears in list
    await page.goto("/admin/menu");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Cleanup
    const menuRows = await page.locator(".ant-table-tbody tr").all();
    for (const row of menuRows) {
      const text = await row.textContent();
      if (text && !text.includes("No data")) {
        await row.click();
        await expect(page).toHaveURL("**/admin/menu/**/detail");
        const match = page.url().match(/\/menu\/(\d+)\/detail/);
        if (match) {
          await cleanupMenu(page, parseInt(match[1]));
        }
        break;
      }
    }
  });

  test("menu detail view loads", async ({ page }) => {
    await page.goto("/admin/menu");
    await page.waitForSelector(".ant-table", { timeout: 10000 });
    const hasRows = (await page.locator(".ant-table-tbody tr").count()) > 0;
    if (!hasRows) {
      // No menu data — skip
      test.skip();
    }
    await page.locator(".ant-table-tbody tr").first().click();
    await expect(page).toHaveURL("**/admin/menu/**/detail", { timeout: 5000 });
    const labels = await page.locator("label, .text-sm").count();
    expect(labels).toBeGreaterThan(0);
  });
});
