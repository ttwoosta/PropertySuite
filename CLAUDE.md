# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

```
project/   HTML/CSS/JS design prototypes — source of truth for visual design
chats/     Chat transcripts from the design session — explains design intent
app/       Vite + React + TypeScript implementation (the real app)
angular/   Angular 22 implementation (skeleton, in progress)
functions/ Firebase Cloud Functions (Node 24, TypeScript)
```

The `project/` folder is a Claude Design handoff bundle. Read the chat transcripts in `chats/` and the HTML prototypes in `project/` to understand visual intent before making UI changes.

## Commands

### React app (run from `app/`)

```sh
npm run dev        # dev server at http://localhost:5173
npm run build      # tsc then vite build
npm run typecheck  # type-check only, no emit
npm run preview    # preview the production build
```

```sh
npm run test              # run all unit tests once (vitest, excludes integration + e2e)
npm run test:watch        # vitest in watch mode
npm run test:unit         # run named unit/hook test files with verbose output
npm run test:integration  # rentService Firestore integration test (requires emulators)
npm run test:e2e          # Playwright e2e tests (auto-starts dev server)
npm run test:all          # unit + integration + e2e in sequence
```

Unit tests use Vitest + jsdom + @testing-library/react. Integration tests hit real Firestore via the emulators and are excluded from the default `test` run. E2E tests (Playwright, `app/e2e/`) run against `http://localhost:5173` and auto-start the dev server if not already running.

To run a single test file: `npx vitest run src/lib/rentValidation.test.ts`

### Angular app (run from `angular/`)

```sh
npm start          # ng serve (dev server)
npm run build      # ng build
npm run watch      # ng build --watch
npm run test       # ng test
```

### Cloud Functions (run from `functions/`)

```sh
npm run build      # tsc compile to lib/
npm run serve      # build + start functions emulator only
npm run deploy     # firebase deploy --only functions (requires build + lint to pass)
npm run logs       # tail function logs
```

### Firebase emulators (run from repo root)

```sh
npx firebase emulators:start   # Auth :9099, Firestore :9000, Storage :9199, UI enabled
```

## Firebase / environment setup

Copy `app/.env.example` → `app/.env` and fill in Firebase credentials. Without credentials the app runs in **demo mode**: any email/password signs in and the TenantBridge AI assistant is disabled. The runtime flag is `firebaseConfigured` in `src/lib/firebase.ts`.

Firebase products in use:
- **Firebase Auth** — email/password sign-in
- **Firestore** — Maintenance tasks and Rent houses/receipts (per-user subcollections)
- **Firebase Storage** — receipt uploads in the Rent app
- **Firebase AI Logic** — TenantBridge AI assistant (`gemini-2.5-flash` via `GoogleAIBackend`)
- **Cloud Functions** — `functions/src/index.ts` (skeleton; no deployed functions yet)

When `firebaseConfigured` is true and the hostname is `localhost`, the app auto-connects to the Firebase emulators. The `firebase.json` hosting target points to `app/dist`.

## App architecture (React)

`App.tsx` is a thin auth shell. `AuthGate` renders one of three states: `resolving` → `<Spinner>`, `out` → `<Login>`, `in` → the four-route SPA.

| Route | Component |
|---|---|
| `/` | `Launcher` — app grid |
| `/maintenance` | `MaintenanceApp` |
| `/rent` | `RentApp` |
| `/tenant-bridge` | `TenantApp` |
| `/profile` | `ProfileApp` |

Each sub-app lives under `src/apps/<name>/`. When Firebase is configured, Maintenance and Rent persist data to Firestore under `users/{uid}/tasks` and `users/{uid}/rent_houses` / `users/{uid}/rent_receipts` respectively. In demo mode (no Firebase), they seed from static `SEED_*` exports in `data.ts` and mutate local React state.

### Service / validation / hook layering

The codebase uses a three-layer pattern for data-mutating operations:

1. **Validation** (`src/lib/*Validation.ts`) — pure functions, no imports, no side effects. Testable without mocks.
2. **Hooks** (`src/hooks/use*Form.ts`) — state machines (`idle | loading | success | error`) that accept async save functions as params, keeping form components thin and tests injection-friendly.
3. **Services** (`src/lib/*Service.ts`) — the only files that import `firebase/firestore` for their domain. Pure async I/O with no React or demo-mode logic.

### Rent app components

`RentApp.tsx` (shell + state) coordinates these views:
- `Dashboard.tsx` — summary cards and KPIs
- `charts.tsx` — income/expense charts
- `YearGrid.tsx` — monthly rent grid per room
- `entries.tsx` — year grid and receipt list
- `Houses.tsx` / `Receipts.tsx` / `Expenses.tsx` — house management, receipt uploads, expense tracking
- `forms.tsx` — `AddHouseDrawer`, `EditRoomDrawer`, `AddRentDrawer`

Component-level e2e tests (`*.e2e.test.tsx`) live alongside components in `src/apps/rent/`; they are excluded from the default Vitest run by the glob pattern in `vitest.config.ts`.

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

## Shared utilities (`src/lib/`)

- `currency.ts` — multi-currency display helpers (`getCurrencySymbol`, `formatCurrency`, `formatCurrencyDecimal`). Selected currency persisted to `localStorage` under `ps_currency`; default is USD. `CURRENCIES` lists all supported codes.
- `nav.ts` — back-navigation for the Profile page. Sub-apps call `rememberApp(path, label)` on mount; `profileReturn()` reads it to render the "Back to …" link. Persisted under `ps_last_app`.

## Auth (`src/lib/auth.tsx`)

`AuthProvider` wraps the whole app. Consume via `useAuth()` → `{ status, user, signIn, signUp, signOut }`. When Firebase is not configured, signed-in state is stored in `localStorage` under `ps_auth_v1` and any email/password pair is accepted.
