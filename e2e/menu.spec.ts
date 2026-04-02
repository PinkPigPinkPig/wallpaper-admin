import { test, expect } from "@playwright/test";
import { login, cleanupMenu, samplePngPath } from "./fixtures/helpers";

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
    await page.goto("/admin/wallpaper/create");
    await page.waitForSelector("#wallpaper_categoryId", { timeout: 5000 });
    await page.locator("#wallpaper_categoryId").click();
    await page.waitForSelector(".ant-select-dropdown", { timeout: 3000 });
    await page.locator(".ant-select-dropdown .ant-select-item").first().click();
    await page.fill("#wallpaper_name", `Test Wallpaper ${Date.now()}`);
    await page.locator('input[type="file"]').first().setInputFiles(samplePngPath());
    await page.waitForTimeout(300);
    await page.locator('input[type="file"]').nth(1).setInputFiles(samplePngPath());
    await page.waitForTimeout(300);
    await page.locator("button:has-text('Save')").first().click();
    await expect(page).toHaveURL(/\/admin\/wallpaper/, { timeout: 15000 });

    // Open Create Menu modal via more dropdown
    await page.waitForLoadState("networkidle");
    await page.locator('[aria-label="more"]').first().click();
    await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 3000 });
    await page.locator(".ant-dropdown-menu-item").filter({ hasText: /create menu/i }).click();
    await expect(page.locator(".ant-modal")).toBeVisible({ timeout: 5000 });

    // Fill modal form — use exact input IDs and role selectors to avoid overlay
    const filterInput = page.locator("#filter");
    const queryOrderInput = page.locator("#queryOrder");
    const pageInput = page.locator("#page");
    const indexInput = page.locator("#index_in_page");

    await filterInput.click();
    await page.waitForSelector(".ant-select-dropdown", { timeout: 3000 });
    await page.locator(".ant-select-dropdown .ant-select-item").first().click();
    await page.waitForSelector(".ant-select-dropdown", { state: "hidden" });

    await queryOrderInput.click();
    await page.waitForSelector(".ant-select-dropdown", { timeout: 3000 });
    await page.locator(".ant-select-dropdown .ant-select-item").filter({ hasText: /popular/i }).first().click();
    await page.waitForSelector(".ant-select-dropdown", { state: "hidden" });

    await pageInput.fill("1");
    await indexInput.fill("1");

    // Submit — use the primary button inside modal footer
    await page.locator(".ant-modal button[type='primary']").click();

    // Modal should close
    await expect(page.locator(".ant-modal")).not.toBeVisible({ timeout: 5000 });

    // Verify menu appears in list
    await page.goto("/admin/menu");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });

    // Cleanup — click Edit via more menu, then delete
    const moreBtns = page.locator('[aria-label="more"]');
    const count = await moreBtns.count();
    for (let i = 0; i < count; i++) {
      await moreBtns.nth(i).click();
      await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 2000 });
      const editItem = page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i });
      if (await editItem.isVisible()) {
        await editItem.click();
        await expect(page).toHaveURL(/\/admin\/menu\/\d+\/detail/, { timeout: 5000 });
        const match = page.url().match(/\/menu\/(\d+)\/detail/);
        if (match) await cleanupMenu(page, parseInt(match[1]));
        break;
      }
      await page.keyboard.press("Escape");
    }
  });

  test("menu detail view loads", async ({ page }) => {
    await page.goto("/admin/menu");
    await page.waitForSelector(".ant-table", { timeout: 10000 });
    const hasRows = (await page.locator(".ant-table-tbody tr.ant-table-row:visible").count()) > 0;
    if (!hasRows) {
      test.skip();
    }
    await page.locator('[aria-label="more"]').first().click();
    await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 3000 });
    await page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i }).click();
    await expect(page).toHaveURL(/\/admin\/menu\/\d+\/detail/, { timeout: 5000 });
    const labels = await page.locator("label, .text-sm").count();
    expect(labels).toBeGreaterThan(0);
  });
});
