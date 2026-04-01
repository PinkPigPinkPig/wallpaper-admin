# Global Error Handler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a global error/success toast system that intercepts all API errors at the transport and query layers, and provides a shared `showSuccessToast()` helper — replacing 14 scattered `postMessageHandler` and `message.error` calls across the app.

**Architecture:** Two-layer interception: `API.request()` (transport layer catches network/timeout/HTTP errors) + React Query global `mutations.onError` (catches business-logic errors). A shared `showToast()` / `showSuccessToast()` in `src/lib/error/toast.ts` handles message mapping and deterministic deduplication keys. Success toasts are opt-in per-component via `showSuccessToast()`.

**Tech Stack:** TypeScript, TanStack React Query 5, Ant Design 5 `message` API, `window.postMessage` cross-boundary communication.

---

## File Map

```
src/lib/error/          ← NEW
├── toast.ts            ← showToast() + showSuccessToast()
└── index.ts           ← re-exports

src/lib/service/        ← MODIFY
├── index.ts            ← replace postMessageHandler with showToast()
└── utility.ts          ← add showToast() in handleLogout()

src/lib/react-query/    ← MODIFY
└── query.instance.ts   ← add global mutations.onError

src/hooks/              ← MODIFY
└── useAuth.ts          ← replace message.success/error → showSuccessToast/showToast

src/app/                ← MODIFY
├── (public)/auth/signin/page.tsx
└── (protected)/admin/wallpaper/create/page.tsx

src/app/(protected)/admin/category/create/page.tsx  ← MODIFY

src/features/wallpaper/components/   ← MODIFY
└── WallpaperTable.tsx
```

---

## Task 1: Create `src/lib/error/toast.ts`

**Files:**
- Create: `src/lib/error/toast.ts`

- [ ] **Step 1: Write the toast utility**

Create the file with both `showToast()` (error) and `showSuccessToast()` (success). Deterministic keys for Ant Design deduplication.

```ts
import { postMessageHandler } from '@/components/ui/ToastMessage';

// ─── Error toast ───────────────────────────────────────────────────────────

export type TToastType = 'network' | 'timeout' | 'server' | 'unauthorized';

const ERROR_MESSAGES: Record<TToastType, string> = {
  network: 'Network error. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  server: 'An error occurred. Please try again.',
  unauthorized: 'Session expired. Please log in again.',
};

/**
 * Maps a TypeScript error type + optional server message + HTTP metadata
 * to a human-readable message, then fires a toast via postMessageHandler.
 *
 * @param type         — semantic error category
 * @param serverMessage — optional message from API response (overrides default)
 * @param extra.url     — request URL for deduplication key
 * @param extra.status  — HTTP status code for deduplication key
 */
export function showToast(
  type: TToastType,
  serverMessage?: string,
  extra?: { url?: string; status?: number }
): void {
  const message = serverMessage || ERROR_MESSAGES[type];

  // Deterministic key: method not available here, use 'ERR'
  const statusPart = extra?.status?.toString() ?? (type === 'network' ? 'NETWORK' : 'UNKNOWN');
  const key = `ERR:${extra?.url ?? 'unknown'}:${statusPart}:${message.slice(0, 20)}`;

  postMessageHandler({ id: key, type: 'error', text: message });
}

// ─── Success toast ──────────────────────────────────────────────────────────

export type TSuccessAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'save';

const SUCCESS_MESSAGES: Record<TSuccessAction, string> = {
  login: 'Login successful!',
  logout: 'Logged out successfully',
  create: 'Created successfully',
  update: 'Updated successfully',
  delete: 'Deleted successfully',
  save: 'Saved successfully',
};

/**
 * Fires a success toast. Optionally accepts a custom message (e.g. "Wallpaper saved")
 * and a queryKey for deduplication across related operations.
 *
 * @param action        — semantic action type → maps to default message
 * @param queryKey      — optional, included in deduplication key
 * @param customMessage — overrides the default message
 */
export function showSuccessToast(
  action: TSuccessAction,
  queryKey?: string,
  customMessage?: string
): void {
  const message = customMessage || SUCCESS_MESSAGES[action];
  const key = `success:${queryKey ?? ''}:${action}`;
  postMessageHandler({ id: key, type: 'success', text: message });
}
```

- [ ] **Step 2: Run lint to verify no errors**

Run: `cd /Users/tuanvq/Documents/Projects/Personal/wallpaper/wallpaper-admin && npx tsc --noEmit src/lib/error/toast.ts 2>&1`
Expected: No TypeScript errors (may need `tsconfig` path — run from project root instead: `npm run lint` after creating both files)

- [ ] **Step 3: Commit**

```bash
git add src/lib/error/toast.ts
git commit -m "feat: add showToast and showSuccessToast utilities"
```

---

## Task 2: Create `src/lib/error/index.ts`

**Files:**
- Create: `src/lib/error/index.ts`

- [ ] **Step 1: Write the barrel export**

```ts
export { showToast, showSuccessToast } from './toast';
export type { TToastType, TSuccessAction } from './toast';
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/error/index.ts
git commit -m "feat: add error lib barrel export"
```

---

## Task 3: Wire `showToast` into `src/lib/service/index.ts`

**Files:**
- Modify: `src/lib/service/index.ts`

Read the file first to confirm exact line numbers before editing.

The current `private static async request<R>()` method (around line 48) does:
1. `fetchWithTimeout` — can throw `TypeError` on network failure or timeout
2. `parseJSON` — parses response body
3. `!response.ok` check — shows toast via inline `postMessageHandler`, then handles 401/token refresh
4. Returns data

Changes needed:

1. **Replace import** — change `import { postMessageHandler } from '@/components/ui/ToastMessage'` → `import { showToast } from '@/lib/error'`

2. **After `fetchWithTimeout` fails** — wrap the call in try/catch to catch `TypeError` (network/timeout):

   Find the current `getWithAbort` / `getNormally` / `delete` / `post` / `put` / `patch` calls that go through `API.request`. The simplest approach: wrap the `fetchWithTimeout` call inside `API.request` with a try/catch. Replace the `await fetchWithTimeout(...)` line with:

   ```ts
   let response: Response;
   try {
     response = await fetchWithTimeout(url, options, API.timeout);
   } catch (err) {
     if (err instanceof TypeError && err.message.includes('fetch')) {
       showToast('network', err.message, { url });
     } else {
       showToast('timeout', 'Request timed out. Please try again.', { url });
     }
     throw err;
   }
   ```

   Find: `const response = await fetchWithTimeout(url, options, API.timeout);` (line 49 of the original file) and wrap as above.

3. **Replace inline `postMessageHandler`** (lines 53–58) — remove the inline toast call:

   Find:
   ```ts
   if (data.status !== 401 && (!data.errorCode || !Errors[data.errorCode as keyof typeof Errors])) {
     postMessageHandler({
       text: data.message || 'Something went wrong',
       type: 'error',
       id: crypto.randomUUID()
     });
   }
   ```

   Replace with:
   ```ts
   if (data.status !== 401 && (!data.errorCode || !Errors[data.errorCode as keyof typeof Errors])) {
     showToast('server', data.message, { url, status: data.status });
   }
   ```

   Note: Remove `crypto.randomUUID` import if it's only used here now.

- [ ] **Step 1: Verify current code before editing**

Run: `grep -n "crypto.randomUUID\|postMessageHandler\|fetchWithTimeout\|const response" src/lib/service/index.ts`
Expected: Shows exact lines for each item above.

- [ ] **Step 2: Replace import**

Change line 5 from:
```ts
import { postMessageHandler } from '@/components/ui/ToastMessage';
```
to:
```ts
import { showToast } from '@/lib/error';
```

- [ ] **Step 3: Add network/timeout try/catch around fetchWithTimeout**

Wrap the `const response = await fetchWithTimeout(...)` call in try/catch as shown above.

- [ ] **Step 4: Replace inline postMessageHandler**

Replace the inline `postMessageHandler` block with `showToast('server', ...)` as shown above.

- [ ] **Step 5: Remove crypto.randomUUID if unused**

Check if `crypto` is used elsewhere in the file. If not, remove the `crypto` import (it's a browser global, not imported explicitly, so just verify `crypto.randomUUID()` is gone).

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: No errors related to our changes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/service/index.ts
git commit -m "feat: wire showToast into API layer with network/timeout catch"
```

---

## Task 4: Add global React Query mutation error handler

**Files:**
- Modify: `src/lib/react-query/query.instance.ts`

- [ ] **Step 1: Read current file to confirm structure**

```ts
// Current content:
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export default queryClient;
```

- [ ] **Step 2: Add global mutations.onError**

Add import and `mutations.defaultOptions`:

```ts
import { QueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/error/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
    mutations: {
      onError: (error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          showToast('server', error.message || 'An error occurred. Please try again.');
        }
      },
    },
  },
});

export default queryClient;
```

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/react-query/query.instance.ts
git commit -m "feat: add global React Query mutation onError handler"
```

---

## Task 5: Add session expired toast to `handleLogout`

**Files:**
- Modify: `src/lib/service/utility.ts`

- [ ] **Step 1: Add import at top of file**

Add after existing imports (line 1–4):
```ts
import { showToast } from '@/lib/error/toast';
```

- [ ] **Step 2: Add toast call at start of handleLogout**

Find `const handleLogout = async () => {` (line 53) and add the toast as the first line inside the function body:

```ts
const handleLogout = async () => {
  showToast('unauthorized', 'Session expired. Please log in again.');
  clearToken();
  // ... rest unchanged
```

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/service/utility.ts
git commit -m "feat: show session expired toast before logout redirect"
```

---

## Task 6: Replace scattered success toasts

**Files:**
- Modify: `src/hooks/useAuth.ts` (lines 79, 101)
- Modify: `src/app/(protected)/admin/wallpaper/create/page.tsx` (line 55)
- Modify: `src/app/(protected)/admin/category/create/page.tsx` (line 53)
- Modify: `src/features/wallpaper/components/WallpaperTable.tsx` (line 69)

### 6a. `src/hooks/useAuth.ts`

- [ ] **Step 1: Add import**

Find: `import { message } from 'antd';`
Add after it:
```ts
import { showSuccessToast, showToast } from '@/lib/error';
```

- [ ] **Step 2: Replace `message.success('Login successful!')` (line 79)**

Find: `message.success('Login successful!');`
Replace with: `showSuccessToast('login');`

- [ ] **Step 3: Replace `message.success('Logged out successfully')` (line 101)**

Find: `message.success('Logged out successfully');`
Replace with: `showSuccessToast('logout');`

- [ ] **Step 4: Remove unused `message` import**

After changes, if `message` is no longer used anywhere in the file, remove `import { message } from 'antd';`. Run lint to check.

### 6b. `src/app/(protected)/admin/wallpaper/create/page.tsx`

- [ ] **Step 1: Add import**

Add after existing imports:
```ts
import { showSuccessToast, showToast } from '@/lib/error';
```

- [ ] **Step 2: Replace `postMessageHandler` success (lines 55–59)**

Find:
```ts
postMessageHandler({
  id: "successfully",
  type: "success",
  text: "Successfully saved",
});
```
Replace with:
```ts
showSuccessToast('save', WALLPAPER.LIST, 'Wallpaper saved');
```

- [ ] **Step 3: Remove old `postMessageHandler` import if unused**

Check if `postMessageHandler` is still used elsewhere in the file (it's also used for the error toast at line 120, so keep the import for now).

### 6c. `src/app/(protected)/admin/category/create/page.tsx`

- [ ] **Step 1: Add import**

Add after existing imports:
```ts
import { showSuccessToast } from '@/lib/error';
```

- [ ] **Step 2: Replace `postMessageHandler` success (lines 53–56)**

Find:
```ts
postMessageHandler({
  id: "successfully",
  type: "success",
  text: "Successfully saved",
});
```
Replace with:
```ts
showSuccessToast('save', CATEGORY.LIST, 'Category saved');
```

### 6d. `src/features/wallpaper/components/WallpaperTable.tsx`

- [ ] **Step 1: Add import**

Find: `import { postMessageHandler } from "@/components/ui/ToastMessage";`
Replace with:
```ts
import { showSuccessToast, showToast } from '@/lib/error';
```

- [ ] **Step 2: Replace `postMessageHandler` success (lines 69–73)**

Find:
```ts
postMessageHandler({
  id: "successfully",
  type: "success",
  text: "Successfully created menu",
});
```
Replace with:
```ts
showSuccessToast('create', 'menu-list', 'Menu created');
```

- [ ] **Step 3: Commit all success toast replacements**

```bash
git add src/hooks/useAuth.ts src/app/\(protected\)/admin/wallpaper/create/page.tsx src/app/\(protected\)/admin/category/create/page.tsx src/features/wallpaper/components/WallpaperTable.tsx
git commit -m "refactor: replace scattered success toasts with showSuccessToast"
```

---

## Task 7: Replace scattered error toasts

**Files:**
- Modify: `src/hooks/useAuth.ts` (lines 91, 105)
- Modify: `src/app/(public)/auth/signin/page.tsx` (line 27)
- Modify: `src/app/(protected)/admin/wallpaper/create/page.tsx` (line 120)
- Modify: `src/app/(protected)/admin/category/create/page.tsx` (line 105)
- Modify: `src/features/wallpaper/components/WallpaperTable.tsx` (line 83)

### 7a. `src/hooks/useAuth.ts`

- [ ] **Step 1: Replace `message.error(errorMessage)` (line 91)**

Find: `message.error(errorMessage);`
Replace with: `showToast('server', errorMessage);`

- [ ] **Step 2: Replace `message.error('Logout failed')` (line 105)**

Find: `message.error('Logout failed');`
Replace with: `showToast('server', 'Logout failed');`

- [ ] **Step 3: Remove `message` import**

After both replacements, `message` from `antd` is no longer used. Remove `import { message } from 'antd';`.

### 7b. `src/app/(public)/auth/signin/page.tsx`

- [ ] **Step 1: Add import**

Add after existing imports:
```ts
import { showToast } from '@/lib/error';
```

- [ ] **Step 2: Replace `message.error(...)` (line 27)**

Find: `message.error(error.message || "Login failed");`
Replace with: `showToast('server', error.message || 'Login failed');`

- [ ] **Step 3: Remove `message` from Spin import**

Find: `import { message, Spin } from "antd";`
Replace with: `import { Spin } from "antd";`

### 7c. `src/app/(protected)/admin/wallpaper/create/page.tsx`

- [ ] **Step 1: Replace `postMessageHandler` error (lines 120–124)**

Find:
```ts
postMessageHandler({
  id: "upload-error",
  type: "error",
  text: "Failed to upload files. Please try again.",
});
```
Replace with:
```ts
showToast('server', 'Failed to upload files. Please try again.');
```

- [ ] **Step 2: Remove `postMessageHandler` import if unused**

`postMessageHandler` was used for the success toast (now `showSuccessToast`) and this error toast (now `showToast`). Remove the line:
```ts
import { postMessageHandler } from "@/components/ui/ToastMessage";
```

### 7d. `src/app/(protected)/admin/category/create/page.tsx`

- [ ] **Step 1: Replace `postMessageHandler` error (lines 105–109)**

Find:
```ts
postMessageHandler({
  id: "upload-error",
  type: "error",
  text: "Failed to upload files. Please try again.",
});
```
Replace with:
```ts
showToast('server', 'Failed to upload files. Please try again.');
```

- [ ] **Step 2: Remove `postMessageHandler` import if unused**

Same as 7c — remove if no longer needed.

### 7e. `src/features/wallpaper/components/WallpaperTable.tsx`

- [ ] **Step 1: Replace `postMessageHandler` error (lines 83–87)**

Find:
```ts
postMessageHandler({
  id: "error",
  type: "error",
  text: "Failed to create menu. Please try again.",
});
```
Replace with:
```ts
showToast('server', 'Failed to create menu. Please try again.');
```

- [ ] **Step 2: Commit all error toast replacements**

```bash
git add src/hooks/useAuth.ts "src/app/(public)/auth/signin/page.tsx" src/app/\(protected\)/admin/wallpaper/create/page.tsx src/app/\(protected\)/admin/category/create/page.tsx src/features/wallpaper/components/WallpaperTable.tsx
git commit -m "refactor: replace scattered error toasts with showToast"
```

---

## Task 8: Verification

**Files:** N/A (verification only)

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Production build succeeds with no TypeScript or Next.js errors.

- [ ] **Step 3: Final commit (if no prior issues)**

```bash
git add -A
git commit -m "chore: run lint and build verification for global error handler"
```

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| `showToast()` function with type → message mapping | Task 1 |
| `showSuccessToast()` function with action → message mapping | Task 1 |
| Deterministic deduplication keys (Ant Design `key`) | Task 1 |
| `src/lib/error/toast.ts` + `index.ts` | Tasks 1–2 |
| API layer: network/timeout catch → `showToast()` | Task 3 |
| API layer: replace `crypto.randomUUID` with deterministic key | Task 3 |
| API layer: replace inline `postMessageHandler` with `showToast()` | Task 3 |
| React Query global `mutations.onError` | Task 4 |
| `handleLogout()` → session expired toast | Task 5 |
| `useAuth.ts`: replace 4 scattered toasts | Task 6a + 7a |
| `signin/page.tsx`: replace `message.error` | Task 7b |
| `wallpaper/create`: replace 1 success + 1 error toast | Task 6b + 7c |
| `category/create`: replace 1 success + 1 error toast | Task 6c + 7d |
| `WallpaperTable.tsx`: replace 1 success + 1 error toast | Task 6d + 7e |
| `npm run lint` + `npm run build` | Task 8 |
