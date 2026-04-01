# Global Error Handler — Design Spec

## Overview

Intercept all API errors at the transport and query layers and surface them as toast notifications automatically. Also provide a shared `showSuccessToast()` helper for consistent success toasts across the app — replacing scattered per-component success handlers.

## Toast Messages

### Error Toasts

| Type             | Message                                       | When shown                         |
|------------------|----------------------------------------------|------------------------------------|
| `network`        | "Network error. Please check your connection." | `TypeError`, `Failed to fetch`      |
| `timeout`        | "Request timed out. Please try again."        | Request exceeds `NEXT_PUBLIC_API_TIME_OUT` |
| `server`         | Server `data.message`                         | API returns `{ message: "..." }`   |
| `server` (fallback) | "An error occurred. Please try again."        | API returns non-OK without message |
| `unauthorized`   | "Session expired. Please log in again."       | 401 + token refresh fails          |

### Success Toasts

| Action    | Message                    | Deduplication key                   |
|-----------|---------------------------|-------------------------------------|
| Login     | "Login successful!"        | `success:login`                     |
| Logout    | "Logged out successfully"  | `success:logout`                    |
| Create    | "Created successfully"     | `success:${queryKey}:create`        |
| Update    | "Updated successfully"     | `success:${queryKey}:update`       |
| Delete    | "Deleted successfully"     | `success:${queryKey}:delete`       |
| Save      | "Saved successfully"       | `success:${queryKey}:save`         |

Deduplication keys for success toasts are intentionally distinct per action to avoid collisions with error toasts.

## Silent Errors (excluded)

- `Errors.UNPROCESSABLE_ENTITY` — unchanged, no toast
- `TOKEN_EXPIRED` with successful refresh — unchanged, silent
- HTTP 401 with successful retry — unchanged, silent

## Deduplication

Ant Design's `messageApi.open({ key })` handles deduplication automatically. The key is deterministic:

```
Error key: `${method}:${url}:${status || 'NETWORK'}:${hash(message)}`
// e.g. "GET:/admin/wallpaper:500:a3f2b1"

Success key: `${type}:${queryKey || ''}:${action}`
// e.g. "success:wallpaper-list:create"
```

No custom deduplication Map needed. Rapid repeated errors show only the first toast.

## New Files

### `src/lib/error/toast.ts`

Exports two functions:

```ts
export type TToastType = 'network' | 'timeout' | 'server' | 'unauthorized';

export function showToast(
  type: TToastType,
  message: string,
  extra?: { url?: string; status?: number }
): void

export type TSuccessAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'save';

export function showSuccessToast(
  action: TSuccessAction,
  queryKey?: string,
  customMessage?: string
): void
```

`showToast` maps error type to message internally. `showSuccessToast` accepts an optional `customMessage` override (for cases like "Category saved" where the entity name is known). Both call `postMessageHandler` with a deterministic `id`.

### `src/lib/error/index.ts`

Re-exports `showToast`, `showSuccessToast`, `TToastType`, `TSuccessAction`, and any future error utilities.

## Modified Files

### `src/lib/service/index.ts` — API layer

In `API.request()`:

```ts
// After fetchWithTimeout, before parseJSON:
if (error instanceof TypeError && error.message.includes('fetch')) {
  showToast('network', error.message, { url });
  throw error;
}

// After parseJSON, after !response.ok check:
} else if (data.status === 401 && data.errorCode === 'TOKEN_EXPIRED' && ...) {
  // existing refresh logic unchanged
} else if (data.status === 401 && stopRefresh) {
  // existing handleLogout path unchanged
} else {
  // remove existing inline postMessageHandler — replace with:
  showToast('server', data.message || 'An error occurred. Please try again.', {
    url,
    status: data.status,
  });
}
```

**Key:** `crypto.randomUUID()` removed; deterministic key from `showToast()` replaces it.

### `src/lib/react-query/query.instance.ts` — React Query global defaults

```ts
import { showToast } from '@/lib/error/toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { /* existing */ },
    mutations: {
      onError: (error: unknown) => {
        if (error instanceof Error && error.message !== 'Aborted') {
          showToast('server', error.message || 'An error occurred. Please try again.');
        }
      },
    },
  },
});
```

### `src/lib/service/utility.ts` — `handleLogout()`

```ts
import { showToast } from '@/lib/error/toast';

const handleLogout = async () => {
  showToast('unauthorized', 'Session expired. Please log in again.');
  clearToken();
  localStorage.clear();
  sessionStorage.clear();
  queryClient.invalidateQueries({ queryKey: [AUTH.TOKEN] });
  window.location.href = '/auth/signin';
};
```

## Cleanup — Remove Scattered Toasts

After the global handler is in place, replace scattered `postMessageHandler` calls with `showSuccessToast()` / `showToast()` imports from `@/lib/error`.

### Replace success toasts

| File | Lines | Replace with |
|------|-------|-------------|
| `src/hooks/useAuth.ts` | 79 | `showSuccessToast('login')` |
| `src/hooks/useAuth.ts` | 101 | `showSuccessToast('logout')` |
| `src/hooks/useAuth.ts` | 91 | `showToast('server', errorMessage)` |
| `src/hooks/useAuth.ts` | 105 | `showToast('server', 'Logout failed')` |
| `src/app/(public)/auth/signin/page.tsx` | 27 | `showToast('server', error.message \|\| 'Login failed')` |
| `src/app/(protected)/admin/wallpaper/create/page.tsx` | 55 | `showSuccessToast('save', WALLPAPER.LIST, 'Wallpaper saved')` |
| `src/app/(protected)/admin/wallpaper/create/page.tsx` | 120 | `showToast('server', 'Failed to upload files. Please try again.')` |
| `src/app/(protected)/admin/category/create/page.tsx` | 53 | `showSuccessToast('save', CATEGORY.LIST, 'Category saved')` |
| `src/app/(protected)/admin/category/create/page.tsx` | 105 | `showToast('server', 'Failed to upload files. Please try again.')` |
| `src/features/wallpaper/components/WallpaperTable.tsx` | 69 | `showSuccessToast('create', 'menu-list', 'Menu created')` |
| `src/features/wallpaper/components/WallpaperTable.tsx` | 83 | `showToast('server', 'Failed to create menu. Please try again.')` |

Mutation `onError` callbacks that only set `errorCode` can be removed entirely if no other logic depends on them.

## Edge Cases

- **Multiple rapid errors** — Ant Design deduplicates by key; only first toast shown per unique error signature.
- **Timeout during token refresh** — Falls under network/timeout toast, then `handleLogout()` fires.
- **Toast position** — Already fixed to `right: 20px` in `ToastMessage.tsx`, unchanged.
- **AbortController cancellations** — `AbortError` is not shown as a toast (expected user action).

## Implementation Order

1. Create `src/lib/error/toast.ts` + `src/lib/error/index.ts` — both `showToast()` and `showSuccessToast()`
2. Update `src/lib/service/index.ts` — replace inline `postMessageHandler` with `showToast()`, add network/timeout catches
3. Update `src/lib/react-query/query.instance.ts` — add global mutation `onError` with `showToast()`
4. Update `src/lib/service/utility.ts` — add session expired toast in `handleLogout()`
5. Replace scattered success `postMessageHandler` calls with `showSuccessToast()` in `useAuth.ts`, `wallpaper/create`, `category/create`, `WallpaperTable.tsx`
6. Replace scattered error `postMessageHandler` calls with `showToast()` in `useAuth.ts`, `wallpaper/create`, `category/create`, `WallpaperTable.tsx`
7. `npm run lint` + `npm run build` verification
