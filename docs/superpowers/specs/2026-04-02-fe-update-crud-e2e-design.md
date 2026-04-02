# FE Update CRUD + E2E Test Suite Design

## Context

The `wallpaper-admin` frontend is missing full CRUD for wallpaper, category, and menu. Currently only Create and Read (detail view) exist. The update flow and delete flow are absent. Additionally, the `file-management` backend has two orphaned file bugs in the category service.

This spec covers:
1. **BE fixes** — orphaned file cleanup in category update/delete
2. **FE update logic** — full update CRUD for wallpaper, category, menu
3. **E2E test suite** — Playwright tests against real backend for all flows

---

## Part 1: BE Fixes

### Bug 1: `PUT /admin/wallpaper/category/:id` — orphan old thumb on update

**File**: `src/wallpaper.category/wallpaper.category.service.ts`

**Problem**: When `thumbUrl` changes, the old thumbnail file is left orphaned on disk.

**Fix**: Before updating, check if `thumbUrl` changed. If so, call `fileUploadService.deleteFileByPath()` on the old path.

**Implementation**:
- Inject `FileUploadService` into `WallpaperCategoryService`
- In `update()`, call `urlToLocalPath()` to convert old thumbUrl → local path
- If new thumbUrl is different, delete the old file

### Bug 2: `DELETE /admin/wallpaper/category/:id` — orphan thumb on delete

**File**: `src/wallpaper.category/wallpaper.category.service.ts`

**Problem**: When a category is deleted, its thumbnail file is left orphaned on disk.

**Fix**: Before deleting, find the category, convert its `thumbUrl` to a local path, delete the file, then proceed with deletion.

---

## Part 2: FE Update CRUD

### Design Principles

- **Update form = Create form reused** — The same form component used for create is reused for update, but with:
  - `initialValues` pre-filled from detail API
  - `readOnly={false}` (create form is not read-only)
  - A Save button that triggers the update mutation
  - Cancel button that navigates back to list
- **Upload first, then save** — Same pattern as create: upload file(s) first to get path(s), then send update payload with `resourceUrl`/`thumbUrl` strings
- **Keep existing URLs if no new file uploaded** — If user doesn't change the file, preserve the existing `resourceUrl`/`thumbUrl` from `initialValues`
- **Navigation**: After successful update → redirect to list page

### 2.1 Wallpaper Update

#### Service (`src/features/wallpaper/services/index.tsx`)

```ts
// Add:
static updateWallpaper(id: number, payload: TSaveWallpaperPayload) {
  return API.put<TWallpaper>(`${WallpaperServices.basePath}/${id}`, payload);
}
```

#### Type (`src/features/wallpaper/data/type.ts`)

`TSaveWallpaperPayload` fields are already optional-compatible on BE side. No type change needed.

#### Edit Page (`src/app/(protected)/admin/wallpaper/[id]/detail/page.tsx`)

- Rename `WallpaperDetailClient` → keep as-is for read mode
- Create new `WallpaperEditClient` component that:
  - Fetches wallpaper detail via `useGetWallpaperDetail(id)`
  - Passes `initialValues` to `WallpaperForm` (same as detail, but `readOnly={false}`)
  - Has Cancel + Save buttons
  - Calls `updateWallpaper` mutation on submit
  - After save → redirect to `/admin/wallpaper`
  - Upload new resource/thumb if changed, keep old URLs if not

#### Form Changes (`src/features/wallpaper/components/form/WallpaperForm.tsx`)

- `TForm.resourceFiles` and `TForm.thumbFiles` need to handle pre-existing files (from `initialValues`) so they show as "already uploaded" in the media upload component
- When submitting:
  - If `resourceFiles` has a new file → upload it → get new `resourceUrl`
  - If `resourceFiles` is empty/unmodified → keep existing `resourceUrl` from `initialValues`
  - Same logic for `thumbFiles`/`thumbUrl`

### 2.2 Category Update

#### Service (`src/features/category/services/index.ts`)

```ts
// Add:
static updateCategory(id: number, payload: TSaveCategoryPayload) {
  return API.put<TCategory>(`${CategoryServices.basePath}/${id}`, payload);
}
```

#### Edit Page (`src/app/(protected)/admin/category/[id]/detail/page.tsx`)

- Create `CategoryEditClient` component:
  - Fetches category detail via `useGetCategoryDetail(id)`
  - Passes `initialValues` to `CategoryForm` (`readOnly={false}`)
  - Cancel + Save buttons
  - Calls `updateCategory` mutation on submit
  - Upload new thumb if changed, keep old `thumbUrl` if not

#### Table Fix (`src/features/category/components/CategoryTable.tsx`)

```tsx
// FIX: Edit link was pointing to wallpaper detail, fix to category detail
href={`/admin/category/${record.id}/detail`}  // was: /wallpaper/${record.id}/detail
```

### 2.3 Menu Update

#### Service (`src/features/menu/services/index.ts`)

```ts
// Add:
static updateMenu(id: number, payload: TSaveMenuPayload) {
  return API.put<TMenu>(`${MenuServices.basePath}/${id}`, payload);
}
```

#### Detail Page Changes (`src/app/(protected)/admin/menu/[id]/detail/MenuDetailClient.tsx`)

Currently read-only. Add edit mode:

- Show "Edit" + "Back" buttons when `readOnly={true}`
- When Edit clicked → toggle to `readOnly={false}` with `MenuForm`
- Save calls `updateMenu` mutation
- Cancel reverts to read-only view
- NOTE: `category_id` and `wallpaper_id` cannot be changed in update — only filter, queryOrder, page, index_in_page

#### Table Fix (`src/features/menu/components/MenuTable.tsx`)

```tsx
// FIX: Edit link was pointing to wallpaper detail, fix to menu detail
href={`/admin/menu/${record.id}/detail`}  // was: /wallpaper/${record.id}/detail
```

### 2.4 API Service Support (`src/lib/service/index.ts`)

Verify that `API.put()` method exists and works correctly. If not, add it:

```ts
static put<T>(url: string, data: unknown): Promise<T> {
  const token = getToken();
  return fetch(`${this.baseUrl}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token.accessToken}` }),
    },
    body: JSON.stringify(data),
    ...this.getTimeoutSignal(),
  }).then(this.handleResponse);
}
```

---

## Part 3: E2E Test Suite

### Setup

**Dependencies**: Playwright already installed (`@playwright/test@^1.59.0`)

**Config** (`playwright.config.ts`): Already set to `http://localhost:3005`, Chromium only.

**Execution**: Tests run against real backend (`http://localhost:3001`) and real frontend (`http://localhost:3005`).

**Prerequisites**:
- `npm run dev` running on port 3005 (frontend)
- Backend must be accessible (Docker or local)
- Database seeded with admin user + seed data
- `e2e/fixtures/sample.png` — a small test image (~10KB) committed for upload tests

### Seeded Test Data (used by tests)

| Entity | Source | Used by |
|--------|--------|---------|
| Admin user | Existing seed | All tests (login) |
| Category "Nature" (id=1) | Existing seed | Category + Wallpaper tests |
| Category "Anime" (id=2) | Existing seed | Wallpaper tests |
| 0 wallpapers | Test creates + cleans | Wallpaper tests |
| 0 menus | Test creates + cleans | Menu tests |

### Test File Structure

```
e2e/
├── auth.spec.ts
├── category.spec.ts
├── wallpaper.spec.ts
├── menu.spec.ts
└── fixtures/
    ├── helpers.ts
    └── sample.png          # 10KB test image
```

### Helper Functions (`fixtures/helpers.ts`)

```ts
// Set localStorage auth tokens directly (bypass login API for non-auth tests)
export function setAuthTokens(page: Page, accessToken: string, refreshToken: string)

// Standard login via UI form
export async function login(page: Page, username: string, password: string)

// Cleanup helpers — use page.request (Playwright API client) to call DELETE endpoints
export async function cleanupWallpaper(page: Page, id: number)
export async function cleanupCategory(page: Page, id: number)
export async function cleanupMenu(page: Page, id: number)
```

### Test Execution Order

Tests within each file run sequentially. Files run in this order:
`auth.spec.ts` → `category.spec.ts` → `wallpaper.spec.ts` → `menu.spec.ts`

This is enforced by Playwright's default alphabetical file order + naming.

### `auth.spec.ts`

**Test 1: successful login → redirect to admin**
```
1. Visit /auth/signin
2. Fill seeded admin username + password
3. Click Login button
4. Assert URL === /admin/wallpaper
5. Assert sidebar Logout button visible
```

**Test 2: failed login → show error toast**
```
1. Visit /auth/signin
2. Fill wrong credentials
3. Click Login button
4. Assert URL stays /auth/signin
5. Assert error toast visible
```

**Test 3: logout → clear tokens + redirect**
```
1. Login as admin
2. Assert /admin/wallpaper loaded
3. Click Logout button (sidebar)
4. Assert URL === /auth/signin
5. Assert localStorage tokens === null
```

### `category.spec.ts`

**Test 1: category list loads with seeded data**
```
1. Login as admin
2. Navigate to /admin/category
3. Assert table renders
4. Assert seeded categories visible
```

**Test 2: create category with thumbnail upload**
```
1. Login as admin
2. Navigate to /admin/category/create
3. Fill name: "Test Category E2E"
4. Upload e2e/fixtures/sample.png as thumbnail
5. Click Save
6. Assert redirected to /admin/category
7. Assert "Test Category E2E" appears in table
8. Cleanup: DELETE /api/v1/wallpaper/category/:id
```

**Test 3: update category name and thumbnail**
```
1. Login as admin
2. Navigate to /admin/category (ensure seeded category exists)
3. Click Edit on first category row
4. Change name to "Updated Category E2E"
5. Upload new thumbnail (sample.png)
6. Click Save
7. Assert redirected to /admin/category
8. Assert "Updated Category E2E" appears in table
9. Cleanup: DELETE /api/v1/wallpaper/category/:id
```

**Test 4: category detail view (read-only)**
```
1. Login as admin
2. Navigate to /admin/category
3. Click first category row (navigate to detail)
4. Assert all fields visible and read-only
5. Assert thumbnail image renders
```

### `wallpaper.spec.ts`

**Test 1: wallpaper list loads with pagination**
```
1. Login as admin
2. Navigate to /admin/wallpaper
3. Assert table renders with columns: Thumbnail, Name, Category, Linked Menu, Type, Actions
4. Assert pagination controls visible
```

**Test 2: create wallpaper with resource + thumbnail upload**
```
1. Login as admin
2. Navigate to /admin/wallpaper/create
3. Select seeded category (e.g. "Nature")
4. Fill name: "Test Wallpaper E2E"
5. Fill tags: "e2e, test"
6. Upload e2e/fixtures/sample.png as resource file
7. Upload e2e/fixtures/sample.png as thumbnail
8. Click Save
9. Wait for redirect to /admin/wallpaper
10. Assert "Test Wallpaper E2E" appears in table
11. Cleanup: DELETE /api/v1/admin/wallpaper/:id
```

**Test 3: update wallpaper (name, tags, thumbnail)**
```
1. First create a wallpaper (reuse Test 2 steps)
2. Click Edit on the created wallpaper row
3. Change name to "Updated Wallpaper E2E"
4. Change tags to "updated, e2e"
5. Upload new thumbnail (sample.png)
6. Click Save
7. Assert redirected to /admin/wallpaper
8. Assert "Updated Wallpaper E2E" appears in table
9. Cleanup: DELETE /api/v1/admin/wallpaper/:id
```

**Test 4: wallpaper detail view (read-only)**
```
1. Login as admin
2. Navigate to /admin/wallpaper
3. Click first wallpaper row
4. Assert all form fields visible and read-only
5. Assert thumbnail + resource images render
```

### `menu.spec.ts`

**Test 1: menu list loads**
```
1. Login as admin
2. Navigate to /admin/menu
3. Assert table renders with columns: Thumbnail, Wallpaper Name, Category, Filter, Query Order, Actions
```

**Test 2: create menu via wallpaper table modal**
```
PREREQUISITE: A wallpaper must exist — create one first if none exist
1. Login as admin
2. Navigate to /admin/wallpaper
3. Click "..." dropdown on first wallpaper row → "Create Menu"
4. Modal opens with MenuForm
5. Select filter: "both"
6. Select queryOrder: "popular"
7. Fill page: 1
8. Fill index_in_page: 1
9. Click "Create Menu" button in modal
10. Assert modal closes
11. Navigate to /admin/menu
12. Assert new menu entry visible in table
13. Cleanup: DELETE /api/v1/admin/wallpaper/menu/:id
```

**Test 3: update menu (filter, page, index_in_page)**
```
PREREQUISITE: A menu entry must exist — create one first if none exist
1. Login as admin
2. Navigate to /admin/menu
3. Click Edit on first menu row
4. Change filter: "live"
5. Change queryOrder: "recent"
6. Change page: 2
7. Change index_in_page: 5
8. Click Save
9. Assert redirected to /admin/menu
10. Assert updated values appear in table
11. Cleanup: DELETE /api/v1/admin/wallpaper/menu/:id
```

**Test 4: menu detail view (read-only)**
```
1. Login as admin
2. Navigate to /admin/menu
3. Click first menu row
4. Assert detail page loads with all fields visible
5. Assert thumbnail image renders
```

---

## Scope Summary

| Area | Task | Files Touched |
|------|------|--------------|
| BE fix | Category update: delete old thumb | `wallpaper.category.service.ts` |
| BE fix | Category delete: delete thumb | `wallpaper.category.service.ts` |
| FE | Wallpaper update service | `wallpaper/services/index.tsx` |
| FE | Wallpaper edit page | `wallpaper/[id]/detail/page.tsx` |
| FE | Category update service | `category/services/index.ts` |
| FE | Category edit page | `category/[id]/detail/page.tsx` |
| FE | Category table fix edit link | `category/components/CategoryTable.tsx` |
| FE | Menu update service | `menu/services/index.ts` |
| FE | Menu edit in detail page | `menu/[id]/detail/MenuDetailClient.tsx` |
| FE | Menu table fix edit link | `menu/components/MenuTable.tsx` |
| FE | Form pre-fill logic | `wallpaper/components/form/WallpaperForm.tsx`, `category/components/form/CategoryForm.tsx` |
| E2E | Auth tests | `e2e/auth.spec.ts` |
| E2E | Category tests | `e2e/category.spec.ts` |
| E2E | Wallpaper tests | `e2e/wallpaper.spec.ts` |
| E2E | Menu tests | `e2e/menu.spec.ts` |
| E2E | Test fixtures | `e2e/fixtures/helpers.ts`, `e2e/fixtures/sample.png` |

---

## Out of Scope

- Creating a separate `/admin/wallpaper/:id/edit` page (edit happens on the detail page)
- Menu `wallpaper_id` / `category_id` change in update (BE doesn't support reassigning menu to different wallpaper/category)
- File sync service testing
- Parallel test execution
- Database-level seed reset between tests (relies on test-level cleanup)
