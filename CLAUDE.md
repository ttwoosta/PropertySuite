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

```sh
npm run test             # all vitest tests (unit + component), excludes integration and Playwright
npm run test:watch       # vitest in watch mode
npm run test:unit        # pure unit tests only (validation + hooks)
npm run test:integration # rentService against Firestore emulator (requires emulators running)
npm run test:e2e         # Playwright browser tests against dev server (auto-starts)
npm run test:all         # unit + integration + e2e
```

To run a single test file: `npx vitest run <path/to/file.test.ts>` (add `--reporter=verbose` for detail).

The test suite has four tiers:

1. **Unit** (`src/lib/*Validation.test.ts`, `src/hooks/*.test.ts`) — pure functions, no mocks needed.
2. **Component** (`src/apps/rent/*.e2e.test.tsx`, `src/apps/rent/forms.test.tsx`) — Vitest + jsdom + @testing-library/react. DS-vendor components, `RightDrawer`, and `currency` helpers are mocked via `vi.mock()`. Note: despite the `.e2e` name, these run under Vitest (not Playwright).
3. **Integration** (`src/lib/rentService.integration.test.ts`) — Vitest against real Firestore emulator on port 9000. Excluded from `npm run test` by vitest config.
4. **E2E** (`app/e2e/`) — Playwright, Chromium only, targets `http://localhost:5173`. Auto-starts the dev server unless it's already running.

## Firebase / environment setup

Copy `app/.env.example` → `app/.env` and fill in Firebase credentials. Without credentials the app runs in **demo mode**: any email/password signs in and the TenantBridge AI assistant is disabled. The runtime flag is `firebaseConfigured` in `src/lib/firebase.ts`.

Firebase products in use:
- **Firebase Auth** — email/password sign-in
- **Firestore** — per-user subcollections under `users/{uid}/`: `tasks`, `rent_houses`, `rent_receipts`, `rent_entries`, `rent_grid`, `expense_entries`
- **Firebase Storage** — receipt uploads in the Rent app
- **Firebase AI Logic** — TenantBridge AI assistant (`gemini-2.5-flash` via `GoogleAIBackend`)

When `firebaseConfigured` is true and the hostname is `localhost`, the app auto-connects to the Firebase emulators (Auth :9099, Firestore :9000, Storage :9199). Start them from the repo root with `npx firebase emulators:start`.

## App architecture

`App.tsx` is a thin auth shell. `AuthGate` renders one of three states: `resolving` → `<Spinner>`, `out` → `<Login>`, `in` → the SPA.

| Route | Component |
|---|---|
| `/` | `Launcher` — app grid |
| `/houses` | `HousesApp` — standalone property & room manager |
| `/maintenance` | `MaintenanceApp` |
| `/rent` | `RentApp` |
| `/tenant-bridge` | `TenantApp` |
| `/profile` | `ProfileApp` |

Each sub-app lives under `src/apps/<name>/`. When Firebase is configured, Maintenance and Rent persist data to Firestore (see collection list above). In demo mode (no Firebase), they seed from static `SEED_*` exports in `data.ts` and mutate local React state.

**HousesApp** (`src/apps/houses/HousesApp.tsx`) is a standalone property and room manager that shares the same data layer as the Rent app — it imports `useHouses()` from `src/apps/rent/data.ts` and calls the same `rentService.ts` functions. When a landlord has no properties, it renders `OnboardingPopup` for conversational property setup; the popup is also callable manually to add properties via chat.

The Rent app is split across multiple files: `RentApp.tsx` (thin orchestration shell), `Dashboard.tsx` (overview), `Houses.tsx` (room list per house), `YearGrid.tsx` (monthly rent grid), `Expenses.tsx` (expense tracking), `Receipts.tsx` (receipt list), `charts.tsx` (income/expense charts), `entries.tsx` (entry wizard + upload/picker/viewer drawers), `forms.tsx` (drawer forms — `AddHouseDrawer`, `EditRoomDrawer`, `AddRentDrawer`).

## Service and validation layers

Each domain has a dedicated service and validation file in `src/lib/`:

- **`*Service.ts`** — the *only* files that import `firebase/firestore` for their domain. Pure async I/O, no React, no demo-mode logic. The component tree calls these directly.
- **`*Validation.ts`** — pure functions with no imports or side effects. Return typed error objects used by forms.
- **`src/hooks/useTaskForm.ts` / `useRentForm.ts`** — state machine hooks (`idle → loading → success|error`). Accept async save functions as parameters so forms stay thin and tests can inject `vi.fn()` without touching Firestore.

## Design system (`src/ds-vendor/`)

Contains a **pre-compiled third-party bundle** (`ds_bundle.js`) — do not edit it. It registers components (Button, Card, Avatar, Badge, NavItem, etc.) onto a global window namespace at startup via an IIFE.

- `expose-react.ts` — must run first to share the app's React instance with the bundle
- `ds.ts` — loads the bundle and exposes a typed handle to `window.MaintenanceSchedulerDesignSystem_02479c`
- `components.tsx` — hand-written TypeScript prop types for the bundle's components (editor support only; no re-implementation)

## Shared UI components

**`src/components/ui.tsx`** — port of the prototype's `ps-ui.jsx`. Key exports:

- `ResponsiveShell` — sidebar + topbar layout with a mobile slide-in drawer (`useDrawer()`)
- `Modal` / `RightDrawer` — overlay surfaces (close on Escape and backdrop click)
- `ToastHost` / `useToast()` — bottom-right toast stack (2.6 s auto-dismiss)
- `useTheme(appKey)` / `ThemeToggle` — per-app dark/light toggle, persisted to `localStorage`
- `Segmented`, `SectionTitle`, `EmptyState`, `Spinner`, `Hamburger`

**`src/components/OnboardingPopup.tsx`** — step-by-step conversational popup for adding a property via chat-style Q&A. Used by `HousesApp` on empty state and on demand.

## Icon system (`src/lib/icon.tsx`)

All icons are kebab-case Lucide names resolved at runtime via `import * as Lucide from 'lucide-react'`. This matches the prototype's `data-lucide` attribute pattern at the cost of bundle size (intentional for this demo).

- `<Icon name="kebab-name" size={n} />` — sized icon box
- `di('name')` — fill-container icon node (drop-in for the prototype's `di()` helper)
- `LucideIcon` — raw wrapper around a resolved Lucide component, for custom sizing/styling

## Styling

- `src/ds-vendor/tokens/` — CSS custom properties for color, spacing, typography, and radius
- `src/ds-vendor/styles.css` — base styles from the design system
- `src/styles/ps-app.css` — app-wide layout classes (`.ps-shell`, `.ps-topbar`, `.ps-content`, etc.)
- `src/styles/launcher.css` — launcher grid only

Theme switching sets `data-theme="dark|light"` on `<html>`; token values respond via CSS attribute selectors. The launcher always forces `light`; each sub-app persists its own preference under `ps_theme_<appKey>` in localStorage.

## Shared utilities (`src/lib/`)

- `currency.ts` — multi-currency display helpers (`getCurrencySymbol`, `formatCurrency`, `formatCurrencyDecimal`). Selected currency persisted to `localStorage` under `ps_currency`; default is USD. `CURRENCIES` lists all supported codes.
- `nav.ts` — back-navigation for the Profile page. Sub-apps call `rememberApp(path, label)` on mount; `profileReturn()` reads it to render the "Back to …" link. Persisted under `ps_last_app`.

## Auth (`src/lib/auth.tsx`)

`AuthProvider` wraps the whole app. Consume via `useAuth()` → `{ status, user, signIn, signUp, signOut }`. When Firebase is not configured, signed-in state is stored in `localStorage` under `ps_auth_v1` and any email/password pair is accepted.
