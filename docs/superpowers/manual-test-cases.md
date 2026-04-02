# Manual Test Cases — wallpaper-admin

**App:** https://wallpaper-admin-five.vercel.app
**Backend:** https://freshness-wallpaper.xyz/api/v1
**Credentials:** `admin` / `admin`

---

## 0. Pre-test Setup

- [ ] Backend is running (no 502 on `https://freshness-wallpaper.xyz/api/v1/category`)
- [ ] Dev server or Vercel deploy is up
- [ ] Clear browser localStorage before testing (or use incognito)

---

## 1. Authentication

### 1.1 Login — Success
- [ ] Go to `/auth/signin`
- [ ] Fill `admin` / `admin`
- [ ] Click Sign In
- [ ] Expect: redirect to `/admin/wallpaper`, Logout button visible in sidebar
- [ ] Toast "Login successful!" appears (top center)

### 1.2 Login — Wrong credentials
- [ ] Go to `/auth/signin`
- [ ] Fill `wronguser` / `wrongpassword`
- [ ] Click Sign In
- [ ] Expect: stays on `/auth/signin`, error toast appears

### 1.3 Logout
- [ ] While logged in, click Logout in sidebar
- [ ] Expect: redirect to `/auth/signin`, localStorage tokens cleared
- [ ] Navigate to `/admin/wallpaper` — expect: redirected back to signin (auth guard works)

---

## 2. Category

### 2.1 Category List
- [ ] Go to `/admin/category`
- [ ] Expect: table loads with seeded data
- [ ] Click a row → navigates to `/admin/category/{id}/detail`
- [ ] Click More (⋯) → dropdown shows: Edit, Delete
- [ ] Click Edit → navigates to detail
- [ ] Click Delete → confirmation modal appears

### 2.2 Create Category — with thumbnail
- [ ] Go to `/admin/category/create`
- [ ] Fill name (e.g. "Test Cat")
- [ ] Upload a PNG image as thumbnail
- [ ] Click Save
- [ ] Expect: redirect to `/admin/category`, toast "Category saved", new row appears in table
- [ ] Thumbnail image visible in table

### 2.3 Create Category — without thumbnail
- [ ] Go to `/admin/category/create`
- [ ] Fill name only (no image)
- [ ] Click Save
- [ ] Expect: redirect to `/admin/category`, toast "Category saved"

### 2.4 Update Category — change name
- [ ] Go to `/admin/category`
- [ ] Click More → Edit on any category
- [ ] Change name to something new
- [ ] Click Save
- [ ] Expect: redirect to `/admin/category`, toast "Category updated", table shows new name

### 2.5 Update Category — change thumbnail
- [ ] Go to `/admin/category/{id}/detail` for a category with existing thumbnail
- [ ] Click Edit
- [ ] Remove current thumbnail, upload a new one
- [ ] Click Save
- [ ] Expect: new thumbnail visible after save, old thumbnail file gone from disk (BE orphan check)

### 2.6 Update Category — keep thumbnail (no change)
- [ ] Go to `/admin/category/{id}/detail`
- [ ] Click Edit
- [ ] Change only name (do not touch thumbnail)
- [ ] Click Save
- [ ] Expect: thumbnail preserved, not deleted

### 2.7 Delete Category
- [ ] Go to `/admin/category`
- [ ] Click More → Delete on a category
- [ ] Modal: "Are you sure you want to delete `{name}`? This will also remove its thumbnail."
- [ ] Click Cancel → modal closes, row NOT deleted
- [ ] Click More → Delete again
- [ ] Click Delete (danger button)
- [ ] Expect: row removed from table, toast "Category deleted"

---

## 3. Wallpaper

### 3.1 Wallpaper List
- [ ] Go to `/admin/wallpaper`
- [ ] Expect: table loads with pagination
- [ ] Pagination shows correct total (e.g. "1-10 of 3339")
- [ ] Click a row → navigates to `/admin/wallpaper/{id}/detail`
- [ ] Click More (⋯) → dropdown shows: Create Menu, Edit, Delete

### 3.2 Create Wallpaper — with resource + thumbnail
- [ ] Go to `/admin/wallpaper/create`
- [ ] Select a category from dropdown
- [ ] Fill name (e.g. "Test Wallpaper")
- [ ] Fill tags (e.g. "e2e, test")
- [ ] Upload a PNG as Resource file
- [ ] Upload a PNG as Thumbnail
- [ ] "Uploading files..." alert shown during upload
- [ ] Click Save
- [ ] Expect: redirect to `/admin/wallpaper`, wallpaper row appears on LAST page (pagination handled), toast "Wallpaper saved"

### 3.3 Create Wallpaper — resource only (no thumbnail)
- [ ] Go to `/admin/wallpaper/create`
- [ ] Fill name only (no resource, no thumbnail)
- [ ] Click Save
- [ ] Expect: redirects to list, row visible

### 3.4 Update Wallpaper — change name
- [ ] Go to `/admin/wallpaper/{id}/detail`
- [ ] Expect: read-only view, existing resource + thumbnail visible
- [ ] Click Edit
- [ ] Change name
- [ ] Click Save
- [ ] Expect: redirect to `/admin/wallpaper`, toast "Wallpaper updated", new name in table

### 3.5 Update Wallpaper — change resource file
- [ ] Go to `/admin/wallpaper/{id}/detail` (with existing resource)
- [ ] Click Edit
- [ ] Upload new resource file (keep thumbnail unchanged)
- [ ] Click Save
- [ ] Expect: new resource URL saved, old file cleaned up on BE

### 3.6 Update Wallpaper — keep resource (no new upload)
- [ ] Go to `/admin/wallpaper/{id}/detail`
- [ ] Click Edit
- [ ] Change name only (do NOT touch resource/thumbnail uploaders)
- [ ] Click Save
- [ ] Expect: existing resource/thumbnail preserved, URL unchanged

### 3.7 Delete Wallpaper
- [ ] Go to `/admin/wallpaper`
- [ ] Click More → Delete on any wallpaper
- [ ] Modal: "Are you sure you want to delete `{name}`? This action cannot be undone."
- [ ] Click Cancel → modal closes, row NOT deleted
- [ ] Click Delete again → click Delete (danger button)
- [ ] Expect: row removed, toast "Wallpaper deleted", table refetches

### 3.8 Create Menu from Wallpaper table
- [ ] Go to `/admin/wallpaper`
- [ ] Click More → Create Menu on any row
- [ ] Modal "Create Menu" opens
- [ ] Select Filter (e.g. "Both")
- [ ] Select Query Order (e.g. "Popular")
- [ ] Set Page = 0 ✅ (verify 0 is accepted — min=0, not min=1)
- [ ] Set Index in Page = 0
- [ ] Click "Create Menu"
- [ ] Expect: modal closes, menu row created, toast "Menu created"

---

## 4. Menu

### 4.1 Menu List
- [ ] Go to `/admin/menu`
- [ ] Expect: table loads with existing menus
- [ ] Click a row → navigates to `/admin/menu/{id}/detail`
- [ ] Click More (⋯) → dropdown shows: Edit, Delete

### 4.2 Create Menu (via wallpaper detail page)
- [ ] Go to `/admin/wallpaper/{id}/detail`
- [ ] While in read mode, "Create Menu" button visible
- [ ] Click "Create Menu"
- [ ] Fill Filter, Query Order, Page=0, Index in Page=0
- [ ] Submit
- [ ] Expect: menu created, toast "Menu created"

### 4.3 Update Menu
- [ ] Go to `/admin/menu/{id}/detail`
- [ ] Click Edit
- [ ] Change any field (e.g. Page = 1)
- [ ] Click Save
- [ ] Expect: changes saved, toast "Menu updated"

### 4.4 Delete Menu
- [ ] Go to `/admin/menu`
- [ ] Click More → Delete
- [ ] Modal: "Are you sure you want to delete this menu?"
- [ ] Click Delete (danger button)
- [ ] Expect: row removed, toast "Menu deleted"

---

## 5. Edge Cases

### 5.1 Filter bar — search wallpaper by name
- [ ] Go to `/admin/wallpaper`
- [ ] Type in search input
- [ ] Expect: table filters by name (debounced)
- [ ] Click "Clear filters" → table resets to full list

### 5.2 Filter bar — filter by category
- [ ] Go to `/admin/wallpaper`
- [ ] Select a category from dropdown
- [ ] Expect: table filters by category
- [ ] Clear filter → table resets

### 5.3 Drag and drop reorder uploads
- [ ] Go to `/admin/wallpaper/create`
- [ ] Upload 2+ files
- [ ] Drag files to reorder
- [ ] Save wallpaper
- [ ] Expect: files saved in new order (order persists to BE)

### 5.4 Empty state — no wallpapers
- [ ] Clear BE data or go to a filtered view with no results
- [ ] Expect: "No data" empty state shown in table

### 5.5 Token expiry — mock 401
- [ ] Manually set an expired token in localStorage
- [ ] Navigate to any admin page
- [ ] Expect: redirected to `/auth/signin`, toast "Session expired"

### 5.6 Duplicate toast bug (verify fix)
- [ ] Login with wrong credentials
- [ ] Expect: only ONE error toast appears (not two — one top-center, one top-right)
- [ ] After ToastMessageProvider fix deploy: duplicate toast should be gone

---

## 6. Upload Validation

### 6.1 Upload wrong file type
- [ ] Go to `/admin/category/create`
- [ ] Try to upload a `.pdf` or `.exe` file
- [ ] Expect: upload rejected, warning/alert shown

### 6.2 Upload size limit
- [ ] Upload a file > 5MB
- [ ] Expect: BE returns 413 or validation error

### 6.3 Network error during upload
- [ ] Throttle network to "Offline" in DevTools
- [ ] Submit form
- [ ] Expect: error toast "Failed to upload files. Please try again." — form stays on page (no redirect)

---

## 7. Known Bugs (do NOT mark as fail — known issues)

| Bug | Workaround |
|-----|-----------|
| DB sequence out of sync → 500 on create | Run SQL: `SELECT setval(...)` on server |
| Update Wallpaper: file upload always uploads RcFile (not real File) | Do not test file change in update flow yet |
| Duplicate toast (old deploy) | Wait for Vercel redeploy or test after fix propagates |
| Menu page filter/query_order may auto-increment | Test with Page=0 explicitly |
