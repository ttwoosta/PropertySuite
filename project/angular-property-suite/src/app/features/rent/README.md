# Rent Tracker — Angular feature

A full Angular port of the `Rent Tracker.html` prototype (sources in
`apps/rent*.jsx`), built into the Property Suite Angular project at
`src/app/features/rent/`.

## Run

```bash
npm install
npm start        # http://localhost:4200  → sign in → "Rent Tracker" card
```

Routing uses hash location, so the feature lives at `#/rent` (lazy-loaded).

## Architecture

- **Standalone components** throughout, `OnPush` change detection.
- **Signals** for all UI/selection/dialog state (`RentService`), `computed()`
  for derived values. (`Observable` + `collectionData()` is where real
  Firestore reads would plug in — see Demo mode.)
- **DTO → VM separation**: `models/rent.dto.ts` (Firestore shapes) vs
  `models/rent.vm.ts` (UI view models, the only thing components import).
- **`inject()`** for all services; **lazy routes** via `loadComponent`.
- **Shared UI** ports live in `src/app/components/shared/` and are reused:
  `ResponsiveShell`, `RightDrawer`, `Popover`, `ToastHost`, `Badge`, `Card`,
  `NavItem`, `Segmented`, `IconButton`, inputs, and the form primitives.

## Map: prototype → Angular

| Prototype | Angular |
|---|---|
| `RentApp` shell | `rent-app.component.ts` (+ `rent.routes.ts`) |
| `Dashboard` | `dashboard.component.ts` |
| `YearGrid` | `year-grid.component.*` |
| `Houses` | `houses.component.ts` |
| `Expenses` | `expenses.component.ts` |
| `Receipts` | `receipts.component.ts` |
| `GroupedBars` + `Donut` | `charts.component.ts` |
| `AddHouseDrawer` / `EditRoomDrawer` / `AddRentDrawer` | `add-house-drawer` / `edit-room-drawer` / `add-rent-drawer` |
| `EntryWizard` | `entry-wizard.component.*` |
| `UploadReceiptDrawer` | `upload-receipt-drawer.component.*` |
| `ReceiptPickerDialog` | `receipt-picker-dialog.component.*` |
| `ReceiptViewerDialog` | `receipt-viewer-dialog.component.*` |
| `PeriodPicker` | `period-picker.component.ts` |
| `Stepper`/`AmountField`/`SummaryBlock`/`StepRail`/`KindChip`/`SaveCta` | `components/shared/forms/form-primitives.ts` |

## Demo mode (seed)

`RentService` seeds from `data/rent.seed.ts` (`SEED_RENT`, copied from
`rent-data.js`). To wire real data, replace the seed signals with
`collectionData()` reads and swap each `Saver.run(...)` timeout for the real
Firestore write promise. Every mutation already calls `ToastService.show(...)`.

## Notes on adaptations

The brief assumed an Angular 22 app with Firestore (`@angular-property-suite/
fire`), pre-existing `RentService` / `CurrencyService` / shared components, and
scaffolded drawer shells. None of that existed in this project yet, so they
were **created** here: the Angular 17 standalone project, all shared
components, the three services (`RentService`, `CurrencyService`,
`ToastService`, plus `ThemeService`), and every rent component. Firestore is
represented by the in-memory seed + `Saver` fake-delay, with clear seams for
swapping in `collectionData()` and real writes.

Theme: `ThemeService` toggles `data-theme` on `<html>` and persists to
`localStorage['ps_theme_rent']`, matching `useTheme('rent')`. Dark tokens are
defined in `src/styles/_tokens.scss`.
