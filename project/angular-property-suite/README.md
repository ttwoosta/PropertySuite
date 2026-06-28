# Property Suite — Angular 17 (standalone)

A faithful Angular conversion of the **Property Suite launcher** (the auth
shell + "Your apps" home) from the original React/Babel build. Uses
standalone components, OnPush change detection, typed `@Input()` / `@Output()`
interfaces, `@for` `track` (trackBy), and scoped SCSS with BEM. Theming is
driven entirely by CSS custom properties ported from the Maintenance
Scheduler design system.

## Run

```bash
npm install
npm start          # ng serve → http://localhost:4200
npm run build      # production build → dist/property-suite
```

Lucide icons load from CDN in `index.html` (`window.lucide`); the
`ps-icon` component swaps `<i data-lucide>` placeholders for inline SVG.

## Structure

```
src/
├── index.html                 # mounts <ps-root>, loads font + lucide
├── main.ts                    # bootstrapApplication(AppComponent)
├── styles.scss                # global reset + .ps-fade
├── styles/_tokens.scss        # design tokens as CSS variables (theming surface)
├── assets/                    # logo-mark.svg, logo-wordmark.svg
└── app/
    ├── app.component.*        # root auth state machine (resolving | out | in)
    ├── app.config.ts          # ApplicationConfig providers
    ├── models/
    │   ├── user.model.ts       # User
    │   └── app-item.model.ts   # AppItem, AppTile
    ├── data/apps.data.ts       # APPS list
    ├── services/auth.service.ts# demo auth (localStorage, RxJS user$)
    └── components/
        ├── icon/               # ps-icon       — Lucide wrapper
        ├── avatar/             # ps-avatar     — initials avatar
        ├── ui-button/          # ps-button     — brand button (projected content)
        ├── form-field/         # ps-form-field — labeled input + leading icon
        ├── spinner/            # ps-spinner    — boot loader
        ├── login/              # ps-login      — sign-in / sign-up card
        ├── launcher-header/    # ps-launcher-header — top bar (navbar)
        ├── app-card/           # ps-app-card   — tool tile (full | icon variant)
        └── launcher/           # ps-launcher   — "Your apps" home
```

## Component interfaces (key I/O)

- **`ps-form-field`** — `@Input` label, type, value, placeholder, leadingIcon,
  autocomplete · `@Output() valueChange` (supports `[(value)]`).
- **`ps-button`** — `@Input` variant (`primary`|`ghost`), size, type, fullWidth,
  disabled · `@Output() clicked`.
- **`ps-login`** — `@Output() authed: User`.
- **`ps-app-card`** — `@Input` app: `AppItem`, variant (`full`|`icon`).
- **`ps-launcher` / `ps-launcher-header`** — `@Input() user: User`.
- **`ps-avatar`** — `@Input` name, size · **`ps-icon`** — `@Input` name, size.

## Conventions

- **Standalone components** everywhere — no NgModules. Each imports only what
  it renders.
- **`ChangeDetectionStrategy.OnPush`** on every component.
- **SCSS + BEM**, `ViewEncapsulation.Emulated` (Angular default) keeps styles
  scoped per component.
- **CSS variables** in `_tokens.scss` are the only place colors/type/spacing
  are defined — restyle the whole suite by editing tokens.

## Notes / next steps

- The app cards still link to the original multi-page hrefs
  (`Rent Tracker.html`, etc.). When the sub-apps are ported, swap these for
  `routerLink` and add `provideRouter(routes)` in `app.config.ts`.
- Auth is demo-only (any email/password). `AuthService` exposes `user$` for
  reactive consumers and persists to `localStorage`.
