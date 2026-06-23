// Rent Tracker — types, static config, and Firestore service layer.
import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, firebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';

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

// 6-month income/expense series — stub until we aggregate from Firestore entries.
export const SERIES: SeriesPoint[] = [
  { m: 'Jan', income: 4030, expense: 2240 },
  { m: 'Feb', income: 4030, expense: 1980 },
  { m: 'Mar', income: 4250, expense: 2620 },
  { m: 'Apr', income: 4250, expense: 2110 },
  { m: 'May', income: 4410, expense: 1890 },
  { m: 'Jun', income: 4475, expense: 2305 },
];

// Current-month and YTD expense by category — stub.
export const EXP_MONTH: Record<string, number> = {
  tax: 540, water: 96, elec: 188, gas: 142, maint: 615, loan: 724,
};
export const EXP_YTD: Record<string, number> = {
  tax: 3240, water: 560, elec: 1180, gas: 980, maint: 2140, loan: 4344,
};

export interface Activity {
  cat: string; dot: string; label: string; sub: string; amount: number; when: string;
}
// Recent activity feed — stub until we aggregate from Firestore entries.
export const ACTIVITY: Activity[] = [
  { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Dana Okafor', sub: 'Birchwood · Room 1', amount: 700, when: '2 hours ago' },
  { cat: 'maint', dot: 'var(--gray-500)', label: 'Maintenance — boiler repair', sub: 'Maple Court', amount: -615, when: '1 day ago' },
  { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Marcus Bell', sub: 'Maple · Room 1', amount: 620, when: '2 days ago' },
  { cat: 'loan', dot: 'var(--green-600)', label: 'Loan payment', sub: 'Maple Court mortgage', amount: -724, when: '3 days ago' },
  { cat: 'elec', dot: 'var(--amber-400)', label: 'Electricity bill', sub: 'Birchwood House', amount: -188, when: '5 days ago' },
];

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

// ── Demo-mode seed data ───────────────────────────────────────────────────────

export const SEED_HOUSES: House[] = [
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

const SEED_RECEIPTS: ReceiptWithKind[] = [
  { id: 'r1', merchant: 'British Gas', cat: 'gas', date: '4 Jun 2026', amount: 142, kind: 'pdf' },
  { id: 'r2', merchant: 'Yorkshire Water', cat: 'water', date: '2 Jun 2026', amount: 96, kind: 'img' },
  { id: 'r3', merchant: 'PlumbPro Ltd', cat: 'maint', date: '28 May 2026', amount: 615, kind: 'img' },
  { id: 'r4', merchant: 'EDF Energy', cat: 'elec', date: '20 May 2026', amount: 188, kind: 'pdf' },
  { id: 'r5', merchant: 'Leeds City Council', cat: 'tax', date: '12 May 2026', amount: 540, kind: 'pdf' },
  { id: 'r6', merchant: 'Halifax Mortgage', cat: 'loan', date: '1 May 2026', amount: 724, kind: 'img' },
];

// ── Firestore collection helpers ──────────────────────────────────────────────

function housesCol(uid: string) {
  return collection(db!, 'users', uid, 'rent_houses');
}

function houseDoc(uid: string, houseId: string) {
  return doc(db!, 'users', uid, 'rent_houses', houseId);
}

function receiptsCol(uid: string) {
  return collection(db!, 'users', uid, 'rent_receipts');
}

function receiptDoc(uid: string, receiptId: string) {
  return doc(db!, 'users', uid, 'rent_receipts', receiptId);
}

// ── Houses hook ───────────────────────────────────────────────────────────────

export interface HousesState {
  houses: House[];
  loading: boolean;
  /** Only used in demo mode (no Firestore) — mutates local state directly. */
  setHouses: React.Dispatch<React.SetStateAction<House[]>>;
}

export function useHouses(): HousesState {
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (!firebaseConfigured || !db) {
      setHouses(SEED_HOUSES.map((h) => ({ ...h, rooms: h.rooms.map((r) => ({ ...r })) })));
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      query(housesCol(user.uid), orderBy('createdAt')),
      (snap) => {
        setHouses(snap.docs.map((d) => ({ ...(d.data() as Omit<House, 'id'>), id: d.id })));
        setLoading(false);
      },
      (err) => { console.error('[rent] houses snapshot error', err); setLoading(false); },
    );
    return unsub;
  }, [user?.uid]);

  return { houses, setHouses, loading };
}

// ── House CRUD ────────────────────────────────────────────────────────────────

export async function dbAddHouse(uid: string, house: Omit<House, 'id'>): Promise<string> {
  const ref = await addDoc(housesCol(uid), { ...house, createdAt: serverTimestamp() });
  return ref.id;
}

export async function dbSaveRoom(uid: string, houseId: string, rooms: Room[]): Promise<void> {
  await updateDoc(houseDoc(uid, houseId), { rooms });
}

export async function dbDeleteHouse(uid: string, houseId: string): Promise<void> {
  await deleteDoc(houseDoc(uid, houseId));
}

// ── Receipts hook ─────────────────────────────────────────────────────────────

export interface ReceiptsState {
  receipts: ReceiptWithKind[];
  loading: boolean;
  setReceipts: React.Dispatch<React.SetStateAction<ReceiptWithKind[]>>;
}

export function useReceipts(): ReceiptsState {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptWithKind[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (!firebaseConfigured || !db) {
      setReceipts(SEED_RECEIPTS.map((r) => ({ ...r })));
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      query(receiptsCol(user.uid), orderBy('createdAt', 'desc')),
      (snap) => {
        setReceipts(snap.docs.map((d) => ({ ...(d.data() as Omit<ReceiptWithKind, 'id'>), id: d.id })));
        setLoading(false);
      },
      (err) => { console.error('[rent] receipts snapshot error', err); setLoading(false); },
    );
    return unsub;
  }, [user?.uid]);

  return { receipts, setReceipts, loading };
}

// ── Receipt CRUD ──────────────────────────────────────────────────────────────

export async function dbAddReceipt(uid: string, rc: Omit<ReceiptWithKind, 'id'>): Promise<string> {
  const ref = await addDoc(receiptsCol(uid), { ...rc, createdAt: serverTimestamp() });
  return ref.id;
}

export async function dbDeleteReceipt(uid: string, receiptId: string): Promise<void> {
  await deleteDoc(receiptDoc(uid, receiptId));
}
