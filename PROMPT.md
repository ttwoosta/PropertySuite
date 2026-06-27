# Export Rent Tracker prototype to Angular 22

You are exporting the `Rent Tracker.html` prototype (sources in `apps/rent*.jsx`) to the Angular 22 app at `angular-property-suite/src/app/features/rent/`. Read every JSX source file listed below before writing any code.

## Source files to read first

- `apps/rent-data.js` — seed data (`RENT.HOUSES`, `RENT.RECEIPTS`, `RENT.SERIES`, etc.)
- `apps/rent-charts.jsx` — `GroupedBars`, `Donut` chart components
- `apps/rent-forms.jsx` — `AddHouseDrawer`, `EditRoomDrawer`, `AddRentDrawer` and form primitives (`Stepper`, `AmountField`, `SummaryBlock`, `FieldRow`, `SaveCta`, etc.)
- `apps/rent-entries.jsx` — `EntryWizard`, `UploadReceiptDrawer`, `ReceiptPickerDialog`, `ReceiptViewerDialog`, `StepRail`, `KindChip`
- `apps/rent-views.jsx` — `Dashboard`, `YearGrid`, `Houses`, `Expenses`, `Receipts`
- `apps/rent.jsx` — `RentApp` orchestrator (all state, dialog controllers, topbar, sidebar)
- `apps/ps-ui.jsx` — shared primitives: `ResponsiveShell`, `RightDrawer`, `Modal`, `Popover`, `Segmented`, `Spinner`, `ToastHost`, `useToast`, `useTheme`, `ThemeToggle`, `Icon`, `di`

## Angular architecture conventions (strictly follow these)

1. **Standalone components only** — no NgModules. Every component has `standalone: true` and imports its own dependencies.
2. **Signals for UI/auth state** — use `signal<T>()` and `computed()` instead of RxJS subjects. Data reads from Firestore still use `Observable` via `collectionData()` from `@angular-property-suite/fire/firestore`.
3. **DTO → VM separation** — Firestore document shapes live in `src/app/models/*.dto.ts`; UI-ready view models in `src/app/models/*.vm.ts`. Components import VMs only, never DTOs directly.
4. **Inject services via `inject()`** — not constructor injection.
5. **Lazy-loaded routes** — components are loaded via `loadComponent` in the router.
6. **`RentService`** — already injectable at `src/app/services/rent.service.ts`. Extend it rather than creating a new service.
7. **Shared UI components** — ports of `ps-ui.jsx` live at `src/app/components/shared/`. Reuse `ResponsiveShellComponent`, `RightDrawerComponent`, `ModalComponent`, `SpinnerComponent`, `ToastHostComponent`, `IconComponent`. Do not re-implement them.
8. **Design tokens** — use CSS custom properties (`var(--text-heading)`, `var(--brand)`, `var(--surface-card)`, etc.) from the prototype as-is. They are already loaded globally.
9. **Lucide icons** — use `<app-icon name="kebab-name" [size]="18" />` (the `IconComponent` wrapper), matching `<Icon name="…" />` from the prototype.
10. **Currency** — use `CurrencyService` (already exists) for `symbol()`, `format(n)`, and `code()`.

## What already exists — do not recreate

- `rent-app.component.ts` — the main shell (already scaffolded, may need wiring)
- `entry-wizard.component.ts` — `EntryWizard` (3-step wizard)
- `period-picker.component.ts` — `PeriodPicker` month/year popover
- `receipt-picker-dialog.component.ts` — `ReceiptPickerDialog`
- `receipt-viewer-dialog.component.ts` — `ReceiptViewerDialog`
- `upload-receipt-drawer.component.ts` — `UploadReceiptDrawer`

## What needs to be created

| Prototype component | Angular file to create |
|---|---|
| `Dashboard` | `dashboard.component.ts` |
| `YearGrid` | `year-grid.component.ts` |
| `Houses` | `houses.component.ts` |
| `Expenses` | `expenses.component.ts` |
| `Receipts` | `receipts.component.ts` |
| `AddHouseDrawer` | `add-house-drawer.component.ts` |
| `EditRoomDrawer` | `edit-room-drawer.component.ts` |
| `AddRentDrawer` | `add-rent-drawer.component.ts` |
| `GroupedBars` + `Donut` | `charts.component.ts` (two components) |
| Form primitives (`Stepper`, `AmountField`, `SummaryBlock`, `StepRail`, `KindChip`) | inline inside the drawers/views that use them, or a shared `form-primitives.component.ts` |

## Specific fidelity requirements

### Dashboard
Two KPI cards (monthly income, monthly expenses with vs-prior-month delta), a `GroupedBars` chart titled "Income vs expenses" with a legend, and a "Recent activity" list with colored dots, label, sub-label, and signed amount. Wire data from `RentService` or seed from `RENT.SERIES` and `RENT.ACTIVITY`.

### YearGrid
Sticky-first-column table with 12 rows (months). Column groups: Utilities & Tax (Tax, Water, Elec, Gas), Rent Income (one column per room for the active house), Other Expenses (Maint., Loan), Net. Cells are inline-editable on click (input auto-focuses, saves on Enter/blur). Color tints per column group using `color-mix`. Toolbar: `Segmented` filter (All / Expenses / Income), density toggle (Comfortable / Compact), Export CSV button.

### Houses
Header with house name/address, occupied/total badge, "Add house" button. Rooms list: unit name, tenant name (or "Vacant"), base rent (monospace), paid amount button ("Add +" if zero), status badge, pencil + plus-circle icon buttons.

### Expenses
Header with "Expenses · {year}", "Add entry" button. Donut chart + legend grid. Accordion list per category: icon badge, label, monthly amount, YTD amount, chevron. Expanded row: 6 month sub-rows each with month abbrev, amount, attach/view receipt button (dashed "Attach" or solid receipt chip), pencil edit icon.

### Receipts
Header with "Receipts · {year}", receipt count, "Upload receipt" button. Responsive grid of receipt cards: tinted icon area at top (category color), KindChip badge, merchant name, date, amount.

### AddHouseDrawer / EditRoomDrawer / AddRentDrawer
Exactly match the `RightDrawer`-based layout in `rent-forms.jsx` — icon, title, subtitle, footer with Cancel + Save CTA. Include `Stepper`, `AmountField`, `SummaryBlock`, `FormError`, and a `SaveCta` that shows an inline spinner while saving (850 ms fake delay is fine for prototype parity; real Firestore write in production).

### Charts
`GroupedBars` renders an SVG bar chart with brand-colored income bars and amber expense bars, month labels on the x-axis, 6 months of data. `Donut` renders a proportional donut ring with a center total.

### Topbar (in `rent-app.component.ts`)
House picker chip (popover with house list), period picker chip (opens `PeriodPickerComponent` popover centered), avatar link to `/profile`.

### Sidebar
Logo mark + "Rent Tracker" wordmark at top, `NavItem` list (Home, Year Grid, Houses, Expenses, Receipts — icons: `home`, `table-2`, `building-2`, `receipt`, `image`), footer showing "N houses · M rooms" + `ThemeToggle`.

### Demo mode
If `RentService` has no real Firestore data, seed from the static `RENT.*` data in `rent-data.js` (copy as a `SEED_RENT` constant in a `rent.seed.ts` file and import it into the service).

### Toast
Call `ToastService.show(message)` on every mutation (house added, room saved, rent recorded, entry added/updated, receipt uploaded/attached/unlinked).

### Theme
Toggle `data-theme` on `<html>` and persist to `localStorage` under `ps_theme_rent`, matching the `useTheme('rent')` pattern from the prototype.

## Output format

One `.ts` file per component with inline template and styles using `:host` and CSS custom properties. Keep templates as close to the prototype's DOM structure and inline styles as possible — use `[style]` bindings where the prototype uses inline styles. No separate `.html` or `.css` files unless a template exceeds ~150 lines.
