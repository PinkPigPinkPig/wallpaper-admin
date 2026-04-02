# Session Context: FE Update CRUD + E2E Test Suite

**Date:** 2026-04-02
**Session started by:** Claude Opus 4.6

---

## What We're Building

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
- **DB:** PostgreSQL on port `5432`
- **API base:** `http://localhost:3001`

---

## What Was Decided During Brainstorming

### BE File Handling Flow (confirmed correct)
- Separate file upload (`POST /api/v1/file-upload`) → get `{ path: URL }` → pass URL string to create/update
- BE never handles raw file binary in create/update endpoints
- `PUT wallpaper/:id` already deletes old files on URL change
- **`PUT category/:id`** — currently does NOT delete old thumb (BUG to fix)
- **`DELETE category/:id`** — currently does NOT delete thumb (BUG to fix)

### FE Update Pattern
- Reuse create form component for update (same component, different mode)
- Upload new files first → get paths → send update payload with `resourceUrl`/`thumbUrl` strings
- Keep existing URLs if no new file uploaded
- After save → redirect to list page

### E2E Strategy
- **Approach A** (chosen): Real backend + seeded data
- **Approach A** (chosen): Real file uploads (not mocked)
- **Approach A** (chosen): Per-test cleanup + fresh seed
- **Approach A** (chosen): Sequential test order

### Out of Scope
- No separate edit pages (edit happens on detail page)
- Menu `wallpaper_id`/`category_id` cannot be changed in update
- No parallel test execution

---

## Key BE Files

### `wallpaper.category.service.ts` (to fix)
- Location: `src/wallpaper.category/wallpaper.category.service.ts`
- Needs: Inject `FileUploadService` + `ConfigService`, add `urlToLocalPath()` helper, modify `update()` and `delete()` to clean old thumb files

### `wallpaper.category.module.ts` (to verify)
- Location: `src/wallpaper.category/wallpaper.category.module.ts`
- Needs: Import `FileUploadModule` so `FileUploadService` can be injected

### `file-upload.module.ts` (to verify)
- Location: `src/file-upload/file-upload.module.ts`
- Needs: `FileUploadService` in `exports` array

---

## Key FE Files to Change

### Wallpaper
| File | Change |
|------|--------|
| `src/features/wallpaper/services/index.tsx` | Add `updateWallpaper()` |
| `src/features/wallpaper/components/form/WallpaperForm.tsx` | Handle pre-existing `resourceUrl`/`thumbUrl` from `initialValues` |
| `src/app/(protected)/admin/wallpaper/[id]/detail/WallpaperDetailClient.tsx` | Add edit mode toggle |

### Category
| File | Change |
|------|--------|
| `src/features/category/services/index.ts` | Add `updateCategory()` |
| `src/app/(protected)/admin/category/[id]/detail/CategoryDetailClient.tsx` | Add edit mode toggle |
| `src/features/category/components/CategoryTable.tsx` | Fix Edit link: `/admin/wallpaper/...` → `/admin/category/...` |

### Menu
| File | Change |
|------|--------|
| `src/features/menu/services/index.ts` | Add `updateMenu()` |
| `src/app/(protected)/admin/menu/[id]/detail/MenuDetailClient.tsx` | Add edit mode toggle |
| `src/features/menu/components/MenuTable.tsx` | Fix Edit link: `/admin/wallpaper/...` → `/admin/menu/...` |

### E2E
| File | Change |
|------|--------|
| `e2e/fixtures/sample.png` | Create small test image (~10KB) |
| `e2e/fixtures/helpers.ts` | Create helpers: `login`, `cleanupWallpaper`, `cleanupCategory`, `cleanupMenu` |
| `e2e/auth.spec.ts` | 3 tests: login success, login fail, logout |
| `e2e/category.spec.ts` | 3 tests: list, create with upload, detail read-only |
| `e2e/wallpaper.spec.ts` | 3 tests: list, create with upload, detail read-only |
| `e2e/menu.spec.ts` | 2 tests: list, create via modal, detail view |

---

## Important Type Notes

### `TMimeType` (shared type)
```ts
// src/data/type.ts
export type TMimeType = {
  type: 'MimeType.Static';  // Note: BE uses 'MimeType.Static'
  value: string;
};
```

### `TSaveWallpaperPayload`
```ts
// src/features/wallpaper/data/type.ts
// All fields optional on BE side (UpdateWallpaperRequestDto)
// Only name + categoryId are required for create
export type TSaveWallpaperPayload = {
  name: string;
  categoryId: number;
  tags: string;       // optional on BE
  resolution: string; // optional on BE
  size: string;       // optional on BE
  mime: TMimeType;    // optional on BE
  resourceUrl: string; // optional on BE
  thumbUrl: string;    // optional on BE
};
```

### Seeded Data (for E2E)
- Admin username/password: check `prisma/seed/index.ts` in `file-management`
- Seeded categories exist: "Nature" (id=1), "Anime" (id=2) etc.
- Tests create their own data and clean up after

---

## Implementation Plan

Full plan at: `docs/superpowers/plans/2026-04-02-fe-update-crud-e2e-plan.md`

**26 tasks (0-16, UI-1 to UI-9):**
- Task 0: Verify prerequisites
- Task 1-2: BE fixes (category update/delete orphan thumb)
- Task 3: FE wallpaper update service
- Task 4: FE WallpaperForm submit logic
- Task 5: FE UploadMedia pre-populate existing files (CRITICAL)
- Task 6: FE wallpaper edit client component
- Task 7: FE category update service
- Task 8: FE category edit client + table link fix
- Task 9: FE menu update service
- Task 10: FE menu detail edit mode + table link fix
- Task 11-16: E2E tests (fixture, helpers, auth, category, wallpaper, menu)
- UI-1: Theme tokens — global Ant Design polish
- UI-2: Login page — branding, password toggle, loading state
- UI-3: Sidebar — icons, logo, token-based styling
- UI-4: CommonTable — row hover, cursor, empty state
- UI-5: Feature tables — ellipsis, icons, badge column
- UI-6: Wallpaper create page — section cards, better loading
- UI-7: UploadMedia — dashed upload, drag handle, alert
- UI-8: Filter bar — labels, clear filters, card wrapper
- UI-9: Modal footer — Ant Design buttons + loading state

---

## Running Tests

```bash
# Frontend
cd /Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin
npm run dev  # http://localhost:3005

# Backend (Docker)
cd /Users/tuanvq/Documents/Projects/Personal/file-management
docker compose up  # or docker compose -f docker-compose.prod.yaml up

# Run E2E
npx playwright test e2e/auth.spec.ts --reporter=line
npx playwright test e2e/category.spec.ts --reporter=line
npx playwright test e2e/wallpaper.spec.ts --reporter=line
npx playwright test e2e/menu.spec.ts --reporter=line

# Run all
npx playwright test --reporter=line
```

---

## Important Code Patterns

### API.put already exists
`src/lib/service/index.ts` line 164 — no need to add

### ButtonSave/ButtonCancel
Both spread `ButtonProps` from Ant Design — they support both `onClick` and `href`:
```tsx
const ButtonSave = (props: ButtonProps) => <Button {...props} type="primary">...
const ButtonCancel = ({ text = 'Cancel', ...props }: TProps) => <Button {...props}>...
```
Safe to use `<ButtonSave onClick={...} />` and `<ButtonCancel onClick={...} />` in edit mode.

### ForwardRef forms
`WallpaperForm`, `CategoryForm`, `MenuForm` all use `forwardRef` + `useImperativeHandle` to expose `submit()`. Wire up via `ref.current?.submit()`.

### UploadMedia does NOT pre-populate existing files ⚠️ CRITICAL

**File:** `src/components/form/UploadMedia.tsx`

**Problem:** `UploadMedia` manages `fileList` internally via `useUpload` hook (ref-based). The `fileList` prop passed to Ant Design's `<Upload>` is always `mediaHandler.fileList` — not the `rest.fileList` prop. So when `initialValues` contains existing `resourceFiles`/`thumbFiles`, the upload component shows as **empty**.

**Fix needed in plan:** Before `WallpaperDetailClient` and `CategoryDetailClient`, add a task to modify `UploadMedia` to accept and display existing files:

```tsx
// In UploadMedia.tsx, add:
const { initialFiles, ...restProps } = props;

// After useUpload() call, add:
useEffect(() => {
  if (initialFiles && initialFiles.length > 0) {
    const previewList = initialFiles.map((file: TFileType) => ({
      ...file,
      uid: file.uid ?? `initial-${Date.now()}`,
      url: file.url ?? file.thumbUrl ?? '',
      status: 'done' as const,
    }));
    mediaHandler.setFileList(previewList);
    setLocalFiles(initialFiles);
  }
}, [initialFiles, mediaHandler]);
```

Then update `FormMedia` to forward `initialFiles` and `UploadMedia` to accept it.

### MenuForm is read-only detail
`MenuForm` in `src/features/menu/components/form/MenuForm.tsx` — for the detail page edit mode, reuse this form with a ref.

---

## Git Commits Made So Far in This Session

## Final Status: ALL TASKS COMPLETE ✅

All 26 tasks (0–16 + UI-1 to UI-9) completed successfully.

### BE Commits (file-management repo)
| Commit | Message |
|--------|---------|
| `6f44acb` | fix: add logger to category thumb cleanup |
| `5fe46c5` | fix: delete category thumb on category delete |

### FE Commits (wallpaper-admin repo)
| Commit | Message |
|--------|---------|
| `82ea91a` | chore: verify prerequisites passed |
| `6a65685` | feat: add updateWallpaper service method |
| `8f50529` | fix: pre-populate UploadMedia with existing files from initialValues |
| `eb1c1d9` | feat: add edit mode to wallpaper detail page |
| `bcec32d` | (fixup — edit mode with originFileObj check, redirect on success) |
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
| `3f5a5d0` | test(e2e): add sample.png fixture for upload tests |
| `7a143c0` | test(e2e): add helpers — login, cleanup, setAuthTokens |
| `2753358` | test(e2e): add auth spec — login success, login fail, logout |
| `aec3383` | test(e2e): add category spec — list, create with upload, detail view |
| `5436358` | test(e2e): add wallpaper spec — list, create with upload, detail view |
| `02c38d1` | test(e2e): add menu spec — list, create via modal, detail view |

## Next Steps

1. **Start BE** — `docker compose up` (or `docker compose -f docker-compose.prod.yaml up`) in `file-management`
2. **Start FE** — `npm run dev` in `wallpaper-admin` (port 3005)
3. **Run E2E tests**:
   ```bash
   npx playwright test e2e/auth.spec.ts --reporter=line
   npx playwright test e2e/category.spec.ts --reporter=line
   npx playwright test e2e/wallpaper.spec.ts --reporter=line
   npx playwright test e2e/menu.spec.ts --reporter=line
   ```
