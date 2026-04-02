# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: category.spec.ts >> Category >> create category with thumbnail upload
- Location: e2e/category.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.ant-table').filter({ hasText: 'Test Category 1775117649566' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.ant-table').filter({ hasText: 'Test Category 1775117649566' })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - complementary [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]:
            - img "picture" [ref=e9]:
              - img [ref=e10]
            - heading "Wallpaper Admin" [level=5] [ref=e12]
          - menu [ref=e13]:
            - menuitem "picture Wallpaper" [ref=e14] [cursor=pointer]:
              - img "picture" [ref=e15]:
                - img [ref=e16]
              - link "Wallpaper" [ref=e19]:
                - /url: /admin/wallpaper
            - menuitem "folder Category" [ref=e20] [cursor=pointer]:
              - img "folder" [ref=e21]:
                - img [ref=e22]
              - link "Category" [ref=e25]:
                - /url: /admin/category
            - menuitem "appstore Menu" [ref=e26] [cursor=pointer]:
              - img "appstore" [ref=e27]:
                - img [ref=e28]
              - link "Menu" [ref=e31]:
                - /url: /admin/menu
          - button "logout Logout" [ref=e33] [cursor=pointer]:
            - img "logout" [ref=e35]:
              - img [ref=e36]
            - generic [ref=e38]: Logout
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic [ref=e41]: Category
          - button "user Admin Admin down" [ref=e42] [cursor=pointer]:
            - img "user" [ref=e44]:
              - img [ref=e45]
            - generic [ref=e47]:
              - strong [ref=e49]: Admin
              - generic [ref=e50]: Admin
            - img "down" [ref=e51]:
              - img [ref=e52]
        - main [ref=e54]:
          - navigation:
            - list
          - generic [ref=e57]:
            - generic [ref=e58]:
              - heading "Create Category" [level=4] [ref=e59]
              - generic [ref=e60]:
                - link "close Cancel" [ref=e61] [cursor=pointer]:
                  - /url: /admin/category
                  - generic [ref=e62]:
                    - img "close" [ref=e63]:
                      - img [ref=e64]
                    - generic [ref=e66]: Cancel
                - button "save Save" [active] [ref=e67] [cursor=pointer]:
                  - generic [ref=e68]:
                    - img "save" [ref=e69]:
                      - img [ref=e70]
                    - generic [ref=e72]: Save
            - generic [ref=e73]:
              - generic [ref=e77]:
                - generic "Category Name" [ref=e79]:
                  - generic [ref=e80]:
                    - generic [ref=e81]: Category Name
                    - generic [ref=e82]: "*"
                - generic [ref=e86]:
                  - textbox "Category Name *" [ref=e87]:
                    - /placeholder: Enter category name
                    - text: Test Category 1775117649566
                  - button "close-circle" [ref=e89] [cursor=pointer]:
                    - img "close-circle" [ref=e90]:
                      - img [ref=e91]
              - generic [ref=e96]:
                - generic "Thumbnail File" [ref=e98]:
                  - generic [ref=e99]:
                    - generic [ref=e100]: Thumbnail File
                    - generic [ref=e101]: "*"
                - generic [ref=e104]:
                  - button "sample.png eye delete" [ref=e108]:
                    - generic [ref=e109]:
                      - link "sample.png" [ref=e110] [cursor=pointer]:
                        - /url: blob:https://wallpaper-admin-five.vercel.app/a165383b-a218-4868-b0f8-627e3f26ca4e
                        - img "sample.png" [ref=e111]
                      - generic [ref=e112]:
                        - link "eye" [ref=e113] [cursor=pointer]:
                          - /url: blob:https://wallpaper-admin-five.vercel.app/a165383b-a218-4868-b0f8-627e3f26ca4e
                          - img "eye" [ref=e114]:
                            - img [ref=e115]
                        - button "delete" [ref=e117] [cursor=pointer]:
                          - img "delete" [ref=e119]:
                            - img [ref=e120]
                  - status [ref=e122]
  - alert [ref=e123]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { login, cleanupCategory, samplePngPath } from "./fixtures/helpers";
  3  | 
  4  | test.describe("Category", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await login(page);
  7  |   });
  8  | 
  9  |   test("category list loads with seeded data", async ({ page }) => {
  10 |     await page.goto("/admin/category");
  11 |     await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });
  12 |     await page.waitForLoadState("networkidle");
  13 |     const rows = await page.locator(".ant-table-tbody tr.ant-table-row:visible").count();
  14 |     expect(rows).toBeGreaterThan(0);
  15 |   });
  16 | 
  17 |   test("create category with thumbnail upload", async ({ page }) => {
  18 |     const categoryName = `Test Category ${Date.now()}`;
  19 | 
  20 |     await page.goto("/admin/category/create");
  21 |     await page.fill("#category_name", categoryName);
  22 |     await page.locator('input[type="file"]').first().setInputFiles(samplePngPath());
  23 |     await page.waitForTimeout(500);
  24 | 
  25 |     await page.locator("button:has-text('Save')").first().click();
  26 |     await expect(page).toHaveURL(/\/admin\/category/, { timeout: 15000 });
  27 | 
  28 |     // Wait for the table to finish loading (spinner must disappear)
  29 |     await page.waitForFunction(
  30 |       () => !document.querySelector(".ant-spin-nested-loading") ||
  31 |         document.querySelector(".ant-spin") === null,
  32 |       { timeout: 10000 }
  33 |     );
  34 |     await page.waitForLoadState("networkidle");
  35 | 
  36 |     // New category may be on last page — navigate there and verify
  37 |     const lastPageBtn = page.locator(".ant-pagination-item").last();
  38 |     if (await lastPageBtn.isVisible()) {
  39 |       await lastPageBtn.click();
  40 |       await page.waitForFunction(
  41 |         () => !document.querySelector(".ant-spin-nested-loading") ||
  42 |           document.querySelector(".ant-spin") === null,
  43 |         { timeout: 10000 }
  44 |       );
  45 |     }
  46 | 
  47 |     await expect(
  48 |       page.locator(".ant-table", { hasText: categoryName })
> 49 |     ).toBeVisible({ timeout: 5000 });
     |       ^ Error: expect(locator).toBeVisible() failed
  50 | 
  51 |     // Cleanup — find the new category's Edit button and delete it
  52 |     const moreBtns = page.locator('[aria-label="more"]');
  53 |     const count = await moreBtns.count();
  54 |     for (let i = 0; i < count; i++) {
  55 |       await moreBtns.nth(i).click();
  56 |       await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 2000 });
  57 |       const editItem = page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i });
  58 |       if (await editItem.isVisible()) {
  59 |         await editItem.click();
  60 |         await expect(page).toHaveURL(/\/admin\/category\/\d+\/detail/, { timeout: 5000 });
  61 |         const match = page.url().match(/\/category\/(\d+)\/detail/);
  62 |         if (match) {
  63 |           // Skip cleanup for seeded categories (IDs 1-9) to avoid 500 errors
  64 |           const id = parseInt(match[1]);
  65 |           if (id > 9) await cleanupCategory(page, id);
  66 |         }
  67 |         break;
  68 |       }
  69 |       await page.keyboard.press("Escape");
  70 |     }
  71 |   });
  72 | 
  73 |   test("category detail view is read-only", async ({ page }) => {
  74 |     await page.goto("/admin/category");
  75 |     await page.waitForLoadState("networkidle");
  76 |     await page.locator('[aria-label="more"]').first().click();
  77 |     await expect(page.locator(".ant-dropdown")).toBeVisible({ timeout: 3000 });
  78 |     await page.locator(".ant-dropdown-menu-item").filter({ hasText: /Edit/i }).click();
  79 |     await expect(page).toHaveURL(/\/admin\/category\/\d+\/detail/, { timeout: 5000 });
  80 |     const disabledInputs = await page.locator("input[disabled]").count();
  81 |     expect(disabledInputs).toBeGreaterThan(0);
  82 |   });
  83 | });
  84 | 
```