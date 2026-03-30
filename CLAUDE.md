# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**wallpaper-admin** is a Next.js 15 admin dashboard for managing wallpaper content on freshness-wallpaper.xyz. It is a pure frontend app that consumes a remote REST API (`NEXT_PUBLIC_API_BASE_URL`).

## Commands

```bash
npm run dev      # Dev server on port 3005
npm run build    # Production build (standalone output)
npm run start    # Production server on port 3005
npm run lint     # ESLint (next lint)
```

No test framework is installed. Feature development uses TDD via hooks in `.claude/settings.json`.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Ant Design 5 + Tailwind CSS 4
- **State/Data**: TanStack React Query 5
- **Forms**: forwardRef + useImperativeHandle for imperative submit
- **Drag & Drop**: @dnd-kit
- **Backend**: External API at `https://freshness-wallpaper.xyz/api/v1` (configurable via `NEXT_PUBLIC_API_BASE_URL`)

## Architecture

### Route Groups

```
src/app/
├── (public)/auth/signin/   # Login page — no auth guard
├── (protected)/admin/       # Protected admin pages (AuthGuard enforced)
│   ├── wallpaper/           # Wallpaper CRUD
│   ├── category/            # Category CRUD
│   └── menu/                # Menu management
├── api/auth/                # Route handlers (login, logout, token, me)
└── layout.tsx               # Root: RqProvider → AntdRegistry → ConfigProvider → AuthGuard
```

### Feature Modules

Each domain is self-contained under `src/features/`:
```
src/features/{auth,wallpaper,category,menu}/
├── components/  # Domain-specific UI components
├── hooks/      # React Query wrappers (useGet*List, useGet*Detail, useCreate*, etc.)
├── services/   # API calls
└── data/       # Types, constants, query keys
```

### Shared Infrastructure

```
src/components/auth/     # AuthGuard.tsx, ProtectedRoute.tsx
src/components/form/     # FormInput, FormMedia, UploadMedia, FormNumber, buttons, etc.
src/components/ui/      # CommonTable, FilterContainer, Show, Message, ToastMessage
src/hooks/               # useAuth, useTableFilter, useURLQueries, useUpload, usePreview
src/lib/
├── auth/               # localStorage auth (client) + cookie auth (server)
├── service/            # API class — base for all fetch calls
├── react-query/        # QueryClient + RqProvider
└── antd/               # Ant Design theme tokens (primary: #3437B3)
src/layouts/            # Sidebar.tsx (dark nav), RootStyleRegistry.tsx
src/context/            # HeaderProvider (page title + breadcrumbs)
src/services/          # upload.service.ts
src/utils/             # countDown, file, formatDate, inputNumberEvent
```

## Authentication

The app uses **localStorage-based auth** (migrated from HTTP-only cookies, see `AUTH_MIGRATION.md`):

- **Login**: `useAuth().login()` → `POST /api/auth/login` → stores token in `localStorage`
- **Auth check**: `AuthGuard.tsx` reads `localStorage` on mount (200ms delay before redirect)
- **API calls**: `src/lib/service/index.ts` reads token from `localStorage` and injects `Authorization: Bearer`
- **Token refresh**: `handleRefreshToken()` on 401 `TOKEN_EXPIRED`
- **Logout**: `clearToken()` wipes `localStorage` → redirects to `/auth/signin`

## Key Patterns

- **URL-driven state**: Pagination, sorting, and filtering live in URL query params via `useTableFilter` / `useURLQueries`
- **Query keys as constants**: Defined in `src/data/constants.ts` (e.g., `WALLPAPER.LIST`, `CATEGORY.DETAIL`)
- **ForwardRef forms**: `WallpaperForm` and `MenuForm` expose `submit()` to parent via `useImperativeHandle`
- **Custom `Link`**: Wrapper around Next.js `Link` that always calls `router.push`
- **`Show` component**: Conditional render wrapper (renders children only when condition is truthy)
- **`'use client'` everywhere**: Nearly all components are client components

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL   # Backend API base (default: https://freshness-wallpaper.xyz/api/v1)
NEXT_PUBLIC_API_TIME_OUT   # Fetch timeout in ms (default: 5000)
```

## Deployment

**Production**: Vercel — pushes to `master` auto-deploy. Environment variables are configured in the Vercel dashboard.

**Local**: `npm run dev`. No Docker needed for local development.

## Development Conventions

- Path alias: `@/*` → `./src/*`
- Ant Design primary color: `#3437B3` (defined in `src/lib/antd/theme.ts`)
- Toast notifications use `window.postMessage` for cross-boundary communication
- `localStorage` is browser-only — guard with `typeof window === 'undefined'` checks for SSR compatibility
