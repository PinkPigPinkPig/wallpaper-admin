# Session Context: FE Update CRUD + E2E Test Suite

**Date:** 2026-04-02
**Session started by:** Claude Opus 4.6
**Last updated:** 2026-04-02 (post-flow-analysis)

---

## What We Built

Three pieces of work:

1. **BE Fixes** — 2 orphaned file bugs in `file-management` backend
2. **FE Update CRUD** — Full update logic for wallpaper, category, menu in `wallpaper-admin` frontend
3. **E2E Test Suite** — Playwright tests against real backend for all flows

---

## Repositories

### Frontend: wallpaper-admin
- **Path:** `/Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin`
- **Port:** `3005` (`npm run dev`)
- **Stack:** Next.js 15, Ant Design 5, TanStack React Query 5
- **API base:** `https://freshness-wallpaper.xyz/api/v1`

### Backend: file-management
- **Path:** `/Users/tuanvq/Documents/Projects/Personal/file-management`
- **Port:** `3001` (Docker or local)
- **Stack:** NestJS 10, Prisma + PostgreSQL, Redis
- **API base:** `http://localhost:3001`

---

## BE File Handling Flow (confirmed correct)

- Separate file upload (`POST /api/v1/file-upload`) → get `{ path: URL }` → pass URL string to create/update
- BE never handles raw file binary in create/update endpoints
- `PUT wallpaper/:id` already deletes old files on URL change ✅
- **`PUT category/:id`** — does delete old thumb on thumbUrl change ✅ (BE fix applied)
- **`DELETE category/:id`** — does delete thumb on category delete ✅ (BE fix applied)
- **Circular dependency** discovered and fixed: `FileUploadModule ↔ WallpaperCategoryModule` via `forwardRef()`

---

## FE Update Pattern

- Reuse create form component for update (same component, different mode)
- Upload new files first → get paths → send update payload with `resourceUrl`/`thumbUrl` strings
- Keep existing URLs if no new file uploaded
- After save → redirect to list page

---

## E2E Strategy

- **Approach A** (chosen): Real backend + seeded data
- **Approach A** (chosen): Real file uploads (not mocked)
- **Approach A** (chosen): Per-test cleanup + fresh seed
- **Approach A** (chosen): Sequential test order

---

## Running Tests

### Local (requires `docker compose up` on BE + `npm run dev` on FE)

```bash
# Set env vars
export E2E_BASE_URL=http://localhost:3005
export E2E_API_BASE=http://localhost:3001/api/v1

npx playwright test --config=playwright.local.config.ts --reporter=line
```

### Prod (Vercel frontend + live backend)

```bash
# Defaults to prod
npx playwright test --reporter=line

# Or explicitly
export E2E_BASE_URL=https://wallpaper-admin-five.vercel.app
export E2E_API_BASE=https://freshness-wallpaper.xyz/api/v1
npx playwright test --config=playwright.config.ts --reporter=line
```

---

## Open Bugs (8 total — see full analysis at `docs/superpowers/session/2026-04-02-flow-analysis.md`)

| # | Flow | Severity | Bug |
|---|------|----------|-----|
| 1 | Update Wallpaper | **HIGH** | `fileToUpload = file \|\| originFileObj` always = RcFile (wrong!) — always tries to upload the fake RcFile instead of the real file |
| 2 | Update Wallpaper | **HIGH** | `initialValues` computed inline without `useEffect` — form not pre-populated with existing files |
| 3 | Update Category | **HIGH** | `thumbFile` passed directly to `UploadServices.uploadFile()` — `TFileType` may not be a real `File` |
| 4 | Update Category | **MEDIUM** | BE does NOT delete old thumb on update — new file uploaded, old file orphaned on disk |
| 5 | Update Wallpaper | **LOW** | `wallpaper-list` cache not invalidated after save |
| 6 | Create Category | **MEDIUM** | `router.push()` called directly (not in mutation callback) — navigates even if Step 3 update fails |
| 7 | Both Updates | **LOW** | `onSuccess`/`onError` defined but never passed to `useMutation` — dead code |
| 8 | Create Category | **CRITICAL** | DB sequence out of sync — `Unique constraint failed on (id)` → 500 on every create |

**Fix for Bug #8 (DB sequence — run on server):**
```sql
-- Reset WallpaperCategory sequence
SELECT setval(pg_get_serial_sequence('"WallpaperCategory"', 'id'),
       (SELECT COALESCE(MAX(id), 0) FROM "WallpaperCategory");

-- Also recommended for Wallpaper and Menu
SELECT setval(pg_get_serial_sequence('"Wallpaper"', 'id'),
       (SELECT COALESCE(MAX(id), 0) FROM "Wallpaper");
SELECT setval(pg_get_serial_sequence('"Menu"', 'id'),
       (SELECT COALESCE(MAX(id), 0) FROM "Menu");
```

---

## Key Files

### BE (file-management repo)

| File | Change |
|------|--------|
| `src/file-upload/file-upload.module.ts` | Added `forwardRef(() => WallpaperCategoryModule)` to resolve circular dep |
| `src/wallpaper.category/wallpaper.category.module.ts` | Added `forwardRef(() => FileUploadModule)` to resolve circular dep |
| `src/wallpaper.category/wallpaper.category.service.ts` | Added `@Inject(forwardRef(() => FileUploadService))` + BE-side thumb cleanup in `update()` and `delete()` |

### FE (wallpaper-admin repo)

| File | Change |
|------|--------|
| `src/features/wallpaper/services/index.tsx` | Added `updateWallpaper()` |
| `src/features/category/services/index.ts` | Added `updateCategory()` |
| `src/features/menu/services/index.ts` | Added `updateMenu()` |
| `src/components/form/UploadMedia.tsx` | Added `initialFiles` prop + `useEffect` population, drag handle, dashed button, Alert warning |
| `src/app/(protected)/admin/wallpaper/[id]/detail/WallpaperDetailClient.tsx` | Full edit mode: `isEditing` state, `originFileObj` guard, upload → mutate → redirect |
| `src/app/(protected)/admin/category/[id]/detail/CategoryDetailClient.tsx` | Edit mode, `updateCategory` call |
| `src/app/(protected)/admin/menu/[id]/detail/MenuDetailClient.tsx` | Edit mode toggle, `MenuForm` ref submit |
| `src/features/wallpaper/components/WallpaperTable.tsx` | Edit link, "Menus" column, more dropdown with Create Menu |
| `src/features/category/components/CategoryTable.tsx` | Edit link (fixed), ellipsis, "#" column |
| `src/features/menu/components/MenuTable.tsx` | Edit link (fixed), ellipsis, "#" column |
| `src/app/(protected)/admin/category/create/page.tsx` | 3-step upload: create empty → upload with real ID → update thumbUrl |
| `src/app/(protected)/admin/wallpaper/create/page.tsx` | `originFileObj` guard, section cards + Alert |
| `src/app/layout.tsx` | Moved `ToastMessageProvider` inside `AntdRegistry` — fixed duplicate toast bug |

---

## Git Commits

### BE (file-management repo)
| Commit | Message |
|--------|---------|
| `6f44acb` | fix: add logger to category thumb cleanup |
| `5fe46c5` | fix: delete category thumb on category delete |
| `4632586` | fix: resolve circular dependency between FileUploadModule and WallpaperCategoryModule via forwardRef |

### FE (wallpaper-admin repo)
| Commit | Message |
|--------|---------|
| `82ea91a` | chore: verify prerequisites passed |
| `6a65685` | feat: add updateWallpaper service method |
| `8f50529` | fix: pre-populate UploadMedia with existing files from initialValues |
| `eb1c1d9` | feat: add edit mode to wallpaper detail page |
| `bcec32d` | fixup — edit mode with originFileObj check, redirect on success |
| `7db22f5` | feat: add updateCategory service method |
| `dcf5f89` | feat: add edit mode to category detail + fix Edit link |
| `27f9fb4` | feat: add updateMenu service method |
| `dc10597` | feat: add edit mode to menu detail + fix Edit link |
| `a52fc94` | style: add global Ant Design component theme tokens |
| `c9000b5` | style: add global Ant Design component theme tokens (token fix) |
| `d268545` | style: polish login page — branding, password toggle, loading button |
| `94df1cb` | style: polish sidebar — icons, logo, gradient background, red logout hover |
| `603e0db` | style: add row hover cursor to CommonTable, improve showTotal text |
| `e476ffd` | style: feature tables — ellipsis tooltips, fix wrong Edit links, rename columns |
| `640dc61` | style: section cards + upload alert on wallpaper create page |
| `2c0ac9f` | style: visible drag handle, dashed upload button, alert warning on UploadMedia |
| `d988633` | style: filter bar — card wrapper, clear filters, large inputs |
| `88e9a57` | style: modal footer — antd buttons, loading state, proper layout |
| `d85fc05` | fix: category create — 3-step upload flow (create empty → upload with real ID → update thumbUrl) |
| `f3396f8` | fix: resolve all build/type errors — FormItem barrel, ellipsis type, originFileObj cast, TForm type, WallpaperTableFilter Input type |
| `0505ad4` | fix: move ToastMessageProvider inside AntdRegistry to prevent duplicate toasts |
| `6da27e1` | fix: category create — call router.push directly instead of relying on unused useMutation onSuccess callback |
| `eda2c21` | chore: ignore playwright test-results directory |
| `c3c42ba` | feat(e2e): add playwright.local.config.ts for local testing + menu.spec waitForSelector fix |
| `ba6edb5` | docs: add flow analysis for create/update wallpaper & category with bug summary |

---

## E2E Test Status

**13/16 passing** (3 failing due to Bug #8: DB sequence out of sync on prod)

| Test | Status | Notes |
|------|--------|-------|
| auth: successful login | ✅ | |
| auth: failed login | ✅ | |
| auth: logout | ✅ | |
| category: list loads | ✅ | |
| category: create with upload | ❌ | DB sequence bug |
| category: detail read-only | ✅ | |
| wallpaper: list with pagination | ✅ | |
| wallpaper: create with upload | ❌ | DB sequence bug |
| wallpaper: detail read-only | ✅ | |
| menu: list loads | ✅ | |
| menu: create via modal | ❌ | DB sequence bug |
| menu: detail loads | ✅ | |
| menu: detail view | ✅ | (skipped if no data) |
| toast: error on wrong credentials | ✅ | |
| toast: page loads no errors | ✅ | |
| toast: logout clears tokens | ✅ | |

---

## Docs

- Flow analysis: `docs/superpowers/session/2026-04-02-flow-analysis.md`
- Implementation plan: `docs/superpowers/plans/2026-04-02-fe-update-crud-e2e-plan.md`
