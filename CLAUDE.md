# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

```
project/   HTML/CSS/JS design prototypes — source of truth for visual design
chats/     Chat transcripts from the design session — explains design intent
app/       Vite + React + TypeScript implementation (the real app)
```

The `project/` folder is a Claude Design handoff bundle. Read the chat transcripts in `chats/` and the HTML prototypes in `project/` to understand visual intent before making UI changes.

## Commands (run from `app/`)

```sh
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc then vite build
npm run typecheck  # type-check only, no emit
npm run preview    # preview the production build
```

No test suite exists.

## Firebase / environment setup

Copy `app/.env.example` → `app/.env` and fill in Firebase credentials. Without credentials the app runs in **demo mode**: any email/password signs in and the TenantBridge AI assistant is disabled. The runtime flag is `firebaseConfigured` in `src/lib/firebase.ts`.

Firebase products in use:
- **Firebase Auth** — email/password sign-in
- **Firebase AI Logic** — TenantBridge AI assistant (`gemini-2.5-flash` via `GoogleAIBackend`)

## App architecture

`App.tsx` is a thin auth shell. `AuthGate` renders one of three states: `resolving` → `<Spinner>`, `out` → `<Login>`, `in` → the four-route SPA.

| Route | Component |
|---|---|
| `/` | `Launcher` — app grid |
| `/maintenance` | `MaintenanceApp` |
| `/rent` | `RentApp` |
| `/tenant-bridge` | `TenantApp` |

Each sub-app lives under `src/apps/<name>/` with a `data.ts` (static mock data) and one or more component files. There is no backend or database — all state is local to the React tree.

## Design system (`src/ds-vendor/`)

Contains a **pre-compiled third-party bundle** (`ds_bundle.js`) — do not edit it. It registers components (Button, Card, Avatar, Badge, NavItem, etc.) onto a global window namespace at startup via an IIFE.

- `expose-react.ts` — must run first to share the app's React instance with the bundle
- `ds.ts` — loads the bundle and exposes a typed handle to `window.MaintenanceSchedulerDesignSystem_02479c`
- `components.tsx` — hand-written TypeScript prop types for the bundle's components (editor support only; no re-implementation)

## Shared UI components (`src/components/ui.tsx`)

Port of the prototype's `ps-ui.jsx`. Key exports:

- `ResponsiveShell` — sidebar + topbar layout with a mobile slide-in drawer (`useDrawer()`)
- `Modal` / `RightDrawer` — overlay surfaces (close on Escape and backdrop click)
- `ToastHost` / `useToast()` — bottom-right toast stack (2.6 s auto-dismiss)
- `useTheme(appKey)` / `ThemeToggle` — per-app dark/light toggle, persisted to `localStorage`
- `Segmented`, `SectionTitle`, `EmptyState`, `Spinner`, `Hamburger`

## Icon system (`src/lib/icon.tsx`)

All icons are kebab-case Lucide names resolved at runtime via `import * as Lucide from 'lucide-react'`. This matches the prototype's `data-lucide` attribute pattern at the cost of bundle size (intentional for this demo).

- `<Icon name="kebab-name" size={n} />` — sized icon box
- `di('name')` — fill-container icon node (drop-in for the prototype's `di()` helper)

## Styling

- `src/ds-vendor/tokens/` — CSS custom properties for color, spacing, typography, and radius
- `src/ds-vendor/styles.css` — base styles from the design system
- `src/styles/ps-app.css` — app-wide layout classes (`.ps-shell`, `.ps-topbar`, `.ps-content`, etc.)
- `src/styles/launcher.css` — launcher grid only

Theme switching sets `data-theme="dark|light"` on `<html>`; token values respond via CSS attribute selectors. The launcher always forces `light`; each sub-app persists its own preference under `ps_theme_<appKey>` in localStorage.

## Auth (`src/lib/auth.tsx`)

`AuthProvider` wraps the whole app. Consume via `useAuth()` → `{ status, user, signIn, signUp, signOut }`. When Firebase is not configured, signed-in state is stored in `localStorage` under `ps_auth_v1` and any email/password pair is accepted.
