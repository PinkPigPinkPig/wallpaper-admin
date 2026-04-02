import { test, expect } from "@playwright/test";
import { login, cleanupCategory, samplePngPath } from "./fixtures/helpers";

test.describe("Category", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("category list loads with seeded data", async ({ page }) => {
    await page.goto("/admin/category");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState("networkidle");
    const rows = await page.locator(".ant-table-tbody tr.ant-table-row:visible").count();
    expect(rows).toBeGreaterThan(0);
  });

  test("create category with thumbnail upload", async ({ page }) => {
    const categoryName = `Test Category ${Date.now()}`;

    await page.goto("/admin/category/create");
    await page.fill("#category_name", categoryName);
    await page.locator('input[type="file"]').first().setInputFiles(samplePngPath());
    await page.waitForTimeout(500);

    await page.locator("button:has-text('Save')").first().click();
    await expect(page).toHaveURL(/\/admin\/category/, { timeout: 15000 });

    // Wait for the table to finish loading (spinner must disappear)
    await page.waitForFunction(
      () => !document.querySelector(".ant-spin-nested-loading") ||
        document.querySelector(".ant-spin") === null,
      { timeout: 10000 }
    );
    await page.waitForLoadState("networkidle");

    // New category may be on last page — navigate there and verify
    const lastPageBtn = page.locator(".ant-pagination-item").last();
    if (await lastPageBtn.isVisible()) {
      await lastPageBtn.click();
      await page.waitForFunction(
        () => !document.querySelector(".ant-spin-nested-loading") ||
          document.querySelector(".ant-spin") === null,
        { timeout: 10000 }
      );
    }

    await expect(
      page.locator(".ant-table", { hasText: categoryName })
    ).toBeVisible({ timeout: 5000 });

    // Cleanup — find the new category's Edit button and delete it
    const moreBtns = page.locator('[aria-label="more"]');
    const count = await moreBtns.count();
    for (let i = 0; i < count; i++) {
      await moreBtns.nth(i).click();
      await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 2000 });
      const editItem = page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i });
      if (await editItem.isVisible()) {
        await editItem.click();
        await expect(page).toHaveURL(/\/admin\/category\/\d+\/detail/, { timeout: 5000 });
        const match = page.url().match(/\/category\/(\d+)\/detail/);
        if (match) {
          // Skip cleanup for seeded categories (IDs 1-9) to avoid 500 errors
          const id = parseInt(match[1]);
          if (id > 9) await cleanupCategory(page, id);
        }
        break;
      }
      await page.keyboard.press("Escape");
    }
  });

  test("category detail view is read-only", async ({ page }) => {
    await page.goto("/admin/category");
    await page.waitForLoadState("networkidle");
    await page.locator('[aria-label="more"]').first().click();
    await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 3000 });
    await page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i }).click();
    await expect(page).toHaveURL(/\/admin\/category\/\d+\/detail/, { timeout: 5000 });
    const disabledInputs = await page.locator("input[disabled]").count();
    expect(disabledInputs).toBeGreaterThan(0);
  });
});
