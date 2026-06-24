# Property Suite

A landlord management suite that bundles three mini-apps behind a shared login:

- **Rent Tracker** — monthly rent income, utilities/expenses, year grid, receipts.
- **Maintenance Scheduler** — overdue & upcoming maintenance across properties, prep
  checklists, and a Smart Plan board. *(Fully built.)*
- **TenantBridge** — tenant communication hub with AI-assisted drafting. *(Navigable
  shell; the AI Assistant uses live Gemini.)*

This is the production implementation of the Claude Design handoff under `../project`
(an HTML/CSS/JS prototype). It is rebuilt as a **Vite + React + TypeScript** SPA that
composes the bound **Maintenance Scheduler Design System** and uses **Firebase** for
auth and **Firebase AI Logic (Gemini)** for the TenantBridge assistant.

## Stack

- Vite 5 + React 18 + TypeScript
- React Router (one SPA, routes `/`, `/maintenance`, `/rent`, `/tenant-bridge`)
- Firebase Auth (email/password) + Firebase AI Logic (Gemini)
- lucide-react icons
- The design-system component bundle, loaded as a single shared-React global (see
  `src/ds-vendor/`)

## Getting started

```bash
npm install
cp .env.example .env   # optional — see "Firebase" below
npm run dev            # http://localhost:5173
```

Other scripts: `npm run build` (typecheck + production build), `npm run preview`,
`npm run typecheck`.

## Firebase

Auth and the AI assistant are powered by Firebase. Fill `.env` with your project's web
config (see `.env.example`), then in the Firebase console:

1. **Authentication → Sign-in method:** enable **Email/Password**.
2. **Firebase AI Logic:** enable it (Gemini Developer API) so the TenantBridge AI
   Assistant can generate drafts client-side.

**Demo mode (no config):** if `.env` is absent or empty the app still runs end-to-end —
any email/password signs you in, and the AI Assistant explains how to enable live
replies. Domain data (tasks, rent, tenants, messages) is in-memory mock data and resets
on reload, matching the prototype's scope.

## Project layout

```
src/
  main.tsx                 # entry: loads design system + CSS, mounts <App/>
  App.tsx                  # auth shell (resolving → out → in) + router
  auth/Login.tsx           # email/password sign-in & sign-up
  apps/
    Launcher.tsx           # home grid linking to the three apps
    maintenance/           # Maintenance Scheduler (full app)
    rent/                  # Rent Tracker (5 views)
    tenant/                # TenantBridge (+ Gemini AI assistant)
  components/ui.tsx        # shared shell, modal, drawer, toast, segmented control…
  lib/
    auth.tsx               # Firebase Auth (with demo fallback)
    firebase.ts            # Firebase app + AI Logic model
    icon.tsx               # lucide-react icon helpers (di / Icon)
  ds-vendor/               # the design-system bundle, tokens, and typed wrappers
  styles/                  # shared app CSS (incl. dark theme) + launcher CSS
```

### How the design system is consumed

The bound design system ships as a precompiled bundle (`src/ds-vendor/ds_bundle.js`)
that references a **global `React`** and registers components on
`window.MaintenanceSchedulerDesignSystem_02479c`. `src/ds-vendor/expose-react.ts`
publishes our single npm React instance onto the global object *before*
`ds.ts` runs the bundle, so the DS components and the app share one React (hooks and
context work across the boundary). `components.tsx` re-exports them with TypeScript prop
types.


cd /Users/tutong/CS2050/PropertySuite && npx firebase-tools@latest deploy --only hosting 2>&1
