import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CardComponent } from '../../components/shared/card/card.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SegmentedComponent, SegmentOption } from '../../components/shared/segmented/segmented.component';
import { CurrencyService } from '../../services/currency.service';
import { ToastService } from '../../services/toast.service';
import { RentService } from '../../services/rent.service';
import { buildGrid } from '../../data/rent.seed';
import { GridRow, RoomCol } from '../../models/rent.vm';

type GridFilter = 'all' | 'expenses' | 'income';
interface EditCell {
  row: number;
  key: string;
}

const UTIL_COLS: { key: string; label: string; tint: string }[] = [
  { key: 'tax', label: 'Tax', tint: 'color-mix(in srgb, var(--blue-400) 6%, transparent)' },
  { key: 'water', label: 'Water', tint: 'color-mix(in srgb, var(--green-400) 6%, transparent)' },
  { key: 'elec', label: 'Elec', tint: 'color-mix(in srgb, var(--amber-400) 7%, transparent)' },
  { key: 'gas', label: 'Gas', tint: 'color-mix(in srgb, var(--red-400) 6%, transparent)' },
];
const OTHER_COLS: { key: string; label: string; tint: string }[] = [
  { key: 'maint', label: 'Maint.', tint: 'color-mix(in srgb, var(--gray-400) 7%, transparent)' },
  { key: 'loan', label: 'Loan', tint: 'color-mix(in srgb, var(--green-600) 6%, transparent)' },
];
const RENT_TINT = 'color-mix(in srgb, var(--green-500) 5%, transparent)';

/**
 * Year Grid, ported from `YearGrid`: a sticky-first-column table with 12
 * month rows, grouped columns (Utilities & Tax / Rent Income per room / Other
 * Expenses / Net), inline-editable cells, an All/Expenses/Income filter, a
 * density toggle, and CSV export. The grid is editable in-place (local
 * signal); production would persist edits to Firestore.
 */
@Component({
  selector: 'app-year-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, UiButtonComponent, IconComponent, SegmentedComponent],
  templateUrl: './year-grid.component.html',
  styleUrl: './year-grid.component.scss',
})
export class YearGridComponent {
  private readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);
  private readonly toast = inject(ToastService);

  readonly utilCols = UTIL_COLS;
  readonly otherCols = OTHER_COLS;
  readonly rentTint = RENT_TINT;

  readonly filterOptions: SegmentOption[] = [
    { value: 'all', label: 'All' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'income', label: 'Income' },
  ];
  readonly densityOptions: SegmentOption[] = [
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ];

  readonly grid = signal<GridRow[]>(buildGrid());
  readonly filter = signal<GridFilter>('all');
  readonly dense = signal(false);
  readonly editing = signal<EditCell | null>(null);

  readonly cols = computed<RoomCol[]>(() => this.rent.roomColsForActive());
  readonly showExp = computed(() => this.filter() !== 'income');
  readonly showInc = computed(() => this.filter() !== 'expenses');

  // -- cell access -------------------------------------------------------
  cellValue(row: GridRow, key: string): number | null {
    if (key.startsWith('rent.')) return row.rent[key.slice(5)] ?? null;
    return (row[key as 'tax' | 'water' | 'elec' | 'gas' | 'maint' | 'loan']) ?? null;
  }

  isEditing(rowIdx: number, key: string): boolean {
    const e = this.editing();
    return !!e && e.row === rowIdx && e.key === key;
  }

  /** String value for the edit `<input>` (empty for blank cells). */
  editValue(row: GridRow, key: string): string {
    const v = this.cellValue(row, key);
    return v == null ? '' : String(v);
  }

  startEdit(rowIdx: number, key: string): void {
    this.editing.set({ row: rowIdx, key });
  }

  commit(rowIdx: number, key: string, raw: string): void {
    const num = raw === '' ? null : +raw || 0;
    this.grid.update((g) =>
      g.map((r, i) => {
        if (i !== rowIdx) return r;
        const nr: GridRow = { ...r, rent: { ...r.rent } };
        if (key.startsWith('rent.')) nr.rent[key.slice(5)] = num;
        else (nr as unknown as Record<string, number | null>)[key] = num;
        const rentTotal = this.rent.roomCols().reduce((s, c) => s + (nr.rent[c.id] || 0), 0);
        const e =
          (nr.tax || 0) + (nr.water || 0) + (nr.elec || 0) + (nr.gas || 0) + (nr.maint || 0) + (nr.loan || 0);
        nr.rentTotal = rentTotal;
        nr.net = rentTotal - e;
        return nr;
      }),
    );
    this.editing.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  display(value: number | null): string {
    return value == null ? '—' : this.currency.format(value);
  }

  // -- export ------------------------------------------------------------
  exportCsv(): void {
    const cols = this.cols();
    const head = ['Month', 'Tax', 'Water', 'Elec', 'Gas', ...cols.map((c) => c.label), 'Maintenance', 'Loan', 'Net'];
    const rows = this.grid().map((r) =>
      [r.month, r.tax, r.water, r.elec, r.gas, ...cols.map((c) => r.rent[c.id]), r.maint, r.loan, r.net]
        .map((v) => (v == null ? '' : v))
        .join(','),
    );
    const csv = [head.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = this.rent.house().name.replace(/\s/g, '-') + '-' + this.rent.year() + '.csv';
    a.click();
    this.toast.show('Exported ' + this.rent.year() + ' CSV');
  }
}
