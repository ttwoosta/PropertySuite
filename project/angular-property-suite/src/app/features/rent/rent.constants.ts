import { SelectOption } from '../../components/shared/inputs/select-input.component';
import { SEED_RENT } from '../../data/rent.seed';

/** Sidebar nav model (label + lucide icon + route path). */
export interface RentNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export const RENT_NAV: RentNavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: 'home' },
  { id: 'grid', label: 'Year Grid', icon: 'table-2', path: 'grid' },
  { id: 'houses', label: 'Houses', icon: 'building-2', path: 'houses' },
  { id: 'expenses', label: 'Expenses', icon: 'receipt', path: 'expenses' },
  { id: 'receipts', label: 'Receipts', icon: 'image', path: 'receipts' },
];

/** Entry-wizard / upload category options, ported from `ECATS`. */
export interface EntryCat {
  key: string;
  label: string;
  icon: string;
}

export const ECATS: EntryCat[] = [
  { key: 'maint', label: 'Maintenance', icon: 'wrench' },
  { key: 'tax', label: 'Property Tax', icon: 'landmark' },
  { key: 'water', label: 'Water', icon: 'droplets' },
  { key: 'elec', label: 'Electricity', icon: 'zap' },
  { key: 'gas', label: 'Gas', icon: 'flame' },
  { key: 'loan', label: 'Loan', icon: 'banknote' },
  { key: 'ins', label: 'Insurance', icon: 'shield-check' },
  { key: 'other', label: 'Other', icon: 'ellipsis' },
];

/** Category id → human label, ported from `CAT_LABEL`. */
export const CAT_LABEL: Record<string, string> = {
  ins: 'Insurance',
  other: 'Other',
  maint: 'Maintenance',
  ...Object.fromEntries(SEED_RENT.categories.map((c) => [c.id, c.label])),
};

/** Upload-drawer category select options (loan dropped, supplies added). */
export const UPLOAD_CAT_OPTIONS: SelectOption[] = [
  ...ECATS.filter((c) => c.key !== 'loan').map((c) => ({ value: c.key, label: c.label })),
  { value: 'supplies', label: 'Supplies' },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
