# Global Error Handler — Design Spec

## Overview

Intercept all API errors at the transport and query layers and surface them as toast notifications automatically — no per-component error handling required.

## Error Flow

```
HTTP Request / React Query Mutation
           │
           ▼
    API.request() (transport layer)
    ├─ Network failure ──► showToast("Network error. Please check your connection.")
    ├─ Timeout          ──► showToast("Request timed out. Please try again.")
    ├─ HTTP 4xx/5xx     ──► showToast(serverMessage || "An error occurred. Please try again.")
    │   └─ 401 + refresh fails ──► showToast("Session expired. Please log in again.") → redirect
    └─ HTTP 2xx         ──► return data
           │
           ▼
    React Query (business logic layer — after retries)
    └─ showToast(serverMessage || "An error occurred. Please try again.")

All toasts use a deterministic key (URL + status + message hash) for Ant Design deduplication.
```

## Toast Messages

| Error type             | Message                                       | When shown                         |
|------------------------|----------------------------------------------|------------------------------------|
| Network failure        | "Network error. Please check your connection." | `TypeError`, `Failed to fetch`      |
| Timeout                | "Request timed out. Please try again."        | Request exceeds `NEXT_PUBLIC_API_TIME_OUT` |
| HTTP error with message | Server `data.message`                         | API returns `{ message: "..." }`  |
| HTTP error no message  | "An error occurred. Please try again."         | API returns non-OK without message |
| Session expired        | "Session expired. Please log in again."       | 401 + token refresh fails          |

## Silent Errors (excluded)

- `Errors.UNPROCESSABLE_ENTITY` — unchanged, no toast
- `TOKEN_EXPIRED` with successful refresh — unchanged, silent
- HTTP 401 with successful retry — unchanged, silent
- Success toasts (e.g. "Successfully saved") — unchanged, handled per-component

## Deduplication

Ant Design's `messageApi.open({ key })` handles deduplication automatically. The key is deterministic:

```
`${method}:${url}:${status || 'NETWORK'}:${hash(message)}`
// e.g. "GET:/admin/wallpaper:500:a3f2b1"
```

No custom deduplication Map needed. Rapid repeated errors show only the first toast.

## New Files

### `src/lib/error/toast.ts`

Exports a single `showToast()` function:

```ts
export type TToastType = 'network' | 'timeout' | 'server' | 'unauthorized';

export function showToast(
  type: TToastType,
  message: string,
  extra?: { url?: string; status?: number }
): void
```

Messages are mapped from type internally. `postMessageHandler` is called with a deterministic `id` derived from the error signature.

### `src/lib/error/index.ts`

Re-exports `showToast`, `TToastType`, and any future error utilities.

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
        // Only toast if not already shown by API layer (check via error type)
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

## Cleanup — Remove Scattered Error Toasts

After the global handler is in place, remove redundant `postMessageHandler` error calls from:

| File | Lines | Action |
|------|-------|--------|
| `src/features/wallpaper/components/WallpaperTable.tsx` | 69, 83 | Delete `postMessageHandler` calls; `onError` callbacks become no-ops |
| `src/app/(protected)/admin/wallpaper/create/page.tsx` | 55, 120 | Delete `postMessageHandler` calls |
| `src/app/(protected)/admin/category/create/page.tsx` | 53, 105 | Delete `postMessageHandler` calls |

Mutation `onError` callbacks that only set `errorCode` can be removed entirely if no other logic depends on them.

## Edge Cases

- **Multiple rapid errors** — Ant Design deduplicates by key; only first toast shown per unique error signature.
- **Timeout during token refresh** — Falls under network/timeout toast, then `handleLogout()` fires.
- **Toast position** — Already fixed to `right: 20px` in `ToastMessage.tsx`, unchanged.
- **AbortController cancellations** — `AbortError` is not shown as a toast (expected user action).

## Implementation Order

1. Create `src/lib/error/toast.ts` + `src/lib/error/index.ts`
2. Update `src/lib/service/index.ts` — replace inline `postMessageHandler` with `showToast()`, add network/timeout catches
3. Update `src/lib/react-query/query.instance.ts` — add global mutation `onError`
4. Update `src/lib/service/utility.ts` — add session expired toast in `handleLogout()`
5. Clean up scattered `postMessageHandler` error calls in components
6. `npm run lint` + `npm run build` verification
