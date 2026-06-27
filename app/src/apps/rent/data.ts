// Rent Tracker — types, static config, seed data, pure helpers, and React hooks.
// All Firestore I/O lives in src/lib/rentService.ts.
import { useEffect, useState } from 'react';
import { firebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import {
  subscribeHouses,
  subscribeReceipts,
  subscribeRentEntries,
} from '../../lib/rentService';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type RoomStatus = 'Occupied' | 'Paid' | 'Partial' | 'Pending' | 'Vacant';

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

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'tax', label: 'Property Tax', icon: 'landmark', color: 'var(--blue-400)' },
  { id: 'water', label: 'Water', icon: 'droplets', color: 'var(--green-400)' },
  { id: 'elec', label: 'Electricity', icon: 'zap', color: 'var(--amber-400)' },
  { id: 'gas', label: 'Gas', icon: 'flame', color: 'var(--red-400)' },
  { id: 'maint', label: 'Maintenance', icon: 'wrench', color: 'var(--gray-500)' },
  { id: 'loan', label: 'Loan Payment', icon: 'banknote', color: 'var(--green-600)' },
];

export interface SeriesPoint { m: string; income: number; expense: number }

// Current-month and YTD expense by category — stub.
export const EXP_MONTH: Record<string, number> = {
  tax: 540, water: 96, elec: 188, gas: 142, maint: 615, loan: 724,
};
export const EXP_YTD: Record<string, number> = {
  tax: 3240, water: 560, elec: 1180, gas: 980, maint: 2140, loan: 4344,
};

// ── Grid types (used by YearGrid) ────────────────────────────────────────────

export interface RoomCol { id: string; label: string; house: string }

export interface GridBase {
  tax: number | null; water: number | null; elec: number | null;
  gas: number | null; maint: number | null; loan: number | null;
  rent: Record<string, number | null>;
}
export interface GridRow extends GridBase {
  month: string; rentTotal: number; net: number;
}

export function gridRow(month: string, base: GridBase, cols: RoomCol[]): GridRow {
  const rentTotal = cols.reduce((s, c) => s + (base.rent[c.id] || 0), 0);
  const exp = (base.tax || 0) + (base.water || 0) + (base.elec || 0) +
              (base.gas || 0) + (base.maint || 0) + (base.loan || 0);
  return { month, ...base, rentTotal, net: rentTotal - exp };
}

export function emptyGrid(cols: RoomCol[]): GridRow[] {
  return MONTHS.map((mo) =>
    gridRow(mo, {
      tax: null, water: null, elec: null, gas: null, maint: null, loan: null,
      rent: Object.fromEntries(cols.map((c) => [c.id, null])),
    }, cols),
  );
}

// ── Receipt types ─────────────────────────────────────────────────────────────

export interface Receipt {
  id: string; merchant: string; cat: string; date: string; amount: number;
}
export interface ReceiptWithKind extends Receipt {
  kind: 'img' | 'pdf' | 'other';
  url?: string | null;
  notes?: string;
  dateLong?: string;
  houseId?: string;
}

// ── Static config ─────────────────────────────────────────────────────────────

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

export { formatCurrency as gbp } from '../../lib/currency';


// ── Rent entry types ──────────────────────────────────────────────────────────

export interface RentEntry {
  id: string;
  houseId: string;
  roomId: string;
  houseName: string;
  roomName: string;
  tenant: string;
  month: number;       // 0–11
  year: number;
  amountDue: number;
  amountPaid: number;
  status: RoomStatus;
  notes?: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export interface HousesState {
  houses: House[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
}

export function useHouses(): HousesState {
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    return subscribeHouses(
      user.uid,
      (data) => { setHouses(data); setLoading(false); },
      (err) => { console.error('[rent] houses snapshot error', err); setError(err); setLoading(false); },
    );
  }, [user?.uid, retryCount]);

  return { houses, setHouses, loading, error, retry: () => setRetryCount((c) => c + 1) };
}

export interface ReceiptsState {
  receipts: ReceiptWithKind[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
  setReceipts: React.Dispatch<React.SetStateAction<ReceiptWithKind[]>>;
}

export function useReceipts(): ReceiptsState {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptWithKind[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    return subscribeReceipts(
      user.uid,
      (data) => { setReceipts(data); setLoading(false); },
      (err) => { console.error('[rent] receipts snapshot error', err); setError(err); setLoading(false); },
    );
  }, [user?.uid, retryCount]);

  return { receipts, setReceipts, loading, error, retry: () => setRetryCount((c) => c + 1) };
}

export interface RentEntriesState {
  entries: RentEntry[];
  loading: boolean;
  error: Error | null;
  retry: () => void;
  setEntries: React.Dispatch<React.SetStateAction<RentEntry[]>>;
}

export function useRentEntries(houseId?: string): RentEntriesState {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    return subscribeRentEntries(
      user.uid,
      houseId,
      (data) => { setEntries(data); setLoading(false); },
      (err) => { console.error('[rent] entries snapshot error', err); setError(err); setLoading(false); },
    );
  }, [user?.uid, houseId, retryCount]);

  return { entries, setEntries, loading, error, retry: () => setRetryCount((c) => c + 1) };
}
