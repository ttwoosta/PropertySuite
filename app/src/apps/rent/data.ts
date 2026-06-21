// Rent Tracker — mock data (port of rent-data.js).
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type RoomStatus = 'Paid' | 'Partial' | 'Pending' | 'Vacant';

export interface Room {
  id: string;
  unit: string;
  tenant: string | null;
  rent: number;
  paid: number;
  status: RoomStatus;
  beds: number;
}

export interface House {
  id: string;
  name: string;
  address: string;
  rooms: Room[];
}

export const HOUSES: House[] = [
  {
    id: 'maple',
    name: 'Maple Court',
    address: '14 Maple Court, Leeds LS6 2AB',
    rooms: [
      { id: 'm1', unit: 'Room 1', tenant: 'Marcus Bell', rent: 620, paid: 620, status: 'Paid', beds: 1 },
      { id: 'm2', unit: 'Room 2', tenant: 'Priya Shah', rent: 640, paid: 320, status: 'Partial', beds: 1 },
      { id: 'm3', unit: 'Room 3', tenant: 'Tom Reilly', rent: 600, paid: 0, status: 'Pending', beds: 1 },
      { id: 'm4', unit: 'Room 4', tenant: null, rent: 600, paid: 0, status: 'Vacant', beds: 1 },
    ],
  },
  {
    id: 'birch',
    name: 'Birchwood House',
    address: '8 Birchwood Rd, Leeds LS4 1QP',
    rooms: [
      { id: 'b1', unit: 'Room 1', tenant: 'Dana Okafor', rent: 700, paid: 700, status: 'Paid', beds: 2 },
      { id: 'b2', unit: 'Room 2', tenant: 'Sam Lin', rent: 580, paid: 580, status: 'Paid', beds: 1 },
      { id: 'b3', unit: 'Room 3', tenant: 'Ava Moreno', rent: 590, paid: 295, status: 'Partial', beds: 1 },
    ],
  },
];

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}
// expense categories with muted accent tints
export const CATEGORIES: Category[] = [
  { id: 'tax', label: 'Property Tax', icon: 'landmark', color: 'var(--blue-400)' },
  { id: 'water', label: 'Water', icon: 'droplets', color: 'var(--green-400)' },
  { id: 'elec', label: 'Electricity', icon: 'zap', color: 'var(--amber-400)' },
  { id: 'gas', label: 'Gas', icon: 'flame', color: 'var(--red-400)' },
  { id: 'maint', label: 'Maintenance', icon: 'wrench', color: 'var(--gray-500)' },
  { id: 'loan', label: 'Loan Payment', icon: 'banknote', color: 'var(--green-600)' },
];

export interface SeriesPoint {
  m: string;
  income: number;
  expense: number;
}
// 6-month income/expense series (Jan–Jun)
export const SERIES: SeriesPoint[] = [
  { m: 'Jan', income: 4030, expense: 2240 },
  { m: 'Feb', income: 4030, expense: 1980 },
  { m: 'Mar', income: 4250, expense: 2620 },
  { m: 'Apr', income: 4250, expense: 2110 },
  { m: 'May', income: 4410, expense: 1890 },
  { m: 'Jun', income: 4475, expense: 2305 },
];

// current-month expense by category (June)
export const EXP_MONTH: Record<string, number> = {
  tax: 540, water: 96, elec: 188, gas: 142, maint: 615, loan: 724,
};
export const EXP_YTD: Record<string, number> = {
  tax: 3240, water: 560, elec: 1180, gas: 980, maint: 2140, loan: 4344,
};

export interface RoomCol {
  id: string;
  label: string;
  house: string;
}
// year grid: per month, utility + per-room income + other + computed net.
export const ROOM_COLS: RoomCol[] = HOUSES.flatMap((h) =>
  h.rooms.map((r) => ({ id: r.id, label: r.unit, house: h.name })),
);

export interface GridBase {
  tax: number | null;
  water: number | null;
  elec: number | null;
  gas: number | null;
  maint: number | null;
  loan: number | null;
  rent: Record<string, number | null>;
}
export interface GridRow extends GridBase {
  month: string;
  rentTotal: number;
  net: number;
}

function gridRow(month: string, base: GridBase): GridRow {
  const rentTotal = ROOM_COLS.reduce((s, c) => s + (base.rent[c.id] || 0), 0);
  const exp =
    (base.tax || 0) +
    (base.water || 0) +
    (base.elec || 0) +
    (base.gas || 0) +
    (base.maint || 0) +
    (base.loan || 0);
  return { month, ...base, rentTotal, net: rentTotal - exp };
}

// generate plausible grid (some blanks)
export const GRID: GridRow[] = MONTHS.map((mo, i) => {
  const filled = i <= 5; // Jan–Jun filled, rest blank
  const rent: Record<string, number | null> = {};
  ROOM_COLS.forEach((c) => {
    rent[c.id] = filled
      ? c.id.startsWith('m')
        ? 600 + (c.id.charCodeAt(4) % 5) * 10
        : 580 + (c.id.charCodeAt(1) % 3) * 60
      : null;
  });
  if (filled && i === 5) {
    rent['m3'] = null;
    rent['m4'] = null;
  } // June pending/vacant
  const base: GridBase = filled
    ? {
        tax: i % 3 === 0 ? 540 : null,
        water: 90 + i * 2,
        elec: 150 + i * 8,
        gas: 120 + i * 6,
        maint: i % 2 ? 240 : 615,
        loan: 724,
        rent,
      }
    : { tax: null, water: null, elec: null, gas: null, maint: null, loan: null, rent };
  return gridRow(mo, base);
});

export interface Activity {
  cat: string;
  dot: string;
  label: string;
  sub: string;
  amount: number;
  when: string;
}
export const ACTIVITY: Activity[] = [
  { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Dana Okafor', sub: 'Birchwood · Room 1', amount: 700, when: '2 hours ago' },
  { cat: 'maint', dot: 'var(--gray-500)', label: 'Maintenance — boiler repair', sub: 'Maple Court', amount: -615, when: '1 day ago' },
  { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Marcus Bell', sub: 'Maple · Room 1', amount: 620, when: '2 days ago' },
  { cat: 'loan', dot: 'var(--green-600)', label: 'Loan payment', sub: 'Maple Court mortgage', amount: -724, when: '3 days ago' },
  { cat: 'elec', dot: 'var(--amber-400)', label: 'Electricity bill', sub: 'Birchwood House', amount: -188, when: '5 days ago' },
];

export interface Receipt {
  id: string;
  merchant: string;
  cat: string;
  date: string;
  amount: number;
}
export const RECEIPTS: Receipt[] = [
  { id: 'r1', merchant: 'British Gas', cat: 'gas', date: '4 Jun 2026', amount: 142 },
  { id: 'r2', merchant: 'Yorkshire Water', cat: 'water', date: '2 Jun 2026', amount: 96 },
  { id: 'r3', merchant: 'PlumbPro Ltd', cat: 'maint', date: '28 May 2026', amount: 615 },
  { id: 'r4', merchant: 'EDF Energy', cat: 'elec', date: '20 May 2026', amount: 188 },
  { id: 'r5', merchant: 'Leeds City Council', cat: 'tax', date: '12 May 2026', amount: 540 },
  { id: 'r6', merchant: 'Halifax Mortgage', cat: 'loan', date: '1 May 2026', amount: 724 },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const NAV = [
  { id: 'home', label: 'Home', icon: 'layout-dashboard' },
  { id: 'grid', label: 'Grid', icon: 'table-2' },
  { id: 'houses', label: 'Houses', icon: 'building-2' },
  { id: 'expenses', label: 'Expenses', icon: 'receipt-text' },
  { id: 'receipts', label: 'Receipts', icon: 'image' },
];

export const catById: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export const gbp = (n: number) =>
  '£' + Math.round(Math.abs(n)).toLocaleString('en-GB');
