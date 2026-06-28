/**
 * UI-ready view models for Rent Tracker. Components import these only.
 */

export type RoomStatus = 'Paid' | 'Partial' | 'Pending' | 'Vacant';

export interface Room {
  id: string;
  unit: string;
  tenant: string | null;
  rent: number;
  paid: number;
  status: RoomStatus;
  beds?: number;
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

export interface SeriesPoint {
  m: string;
  income: number;
  expense: number;
}

export interface Activity {
  cat: string;
  dot: string;
  label: string;
  sub: string;
  amount: number;
  when: string;
}

export type ReceiptKind = 'pdf' | 'img' | 'other' | 'none';

export interface Receipt {
  id: string;
  merchant: string;
  cat: string;
  date: string;
  amount: number;
  kind: ReceiptKind;
  url?: string | null;
  notes?: string;
  dateLong?: string;
}

/** One income column in the Year Grid (per room of the active house). */
export interface RoomCol {
  id: string;
  label: string;
  house: string;
}

/** One month row of the Year Grid. */
export interface GridRow {
  month: string;
  tax: number | null;
  water: number | null;
  elec: number | null;
  gas: number | null;
  maint: number | null;
  loan: number | null;
  rent: Record<string, number | null>;
  rentTotal: number;
  net: number;
}

/** Donut datum. */
export interface DonutDatum {
  id: string;
  color: string;
  value: number;
}

// ---- dialog / wizard context shapes -------------------------------------

export interface AddHousePayload {
  address: string;
  rooms: number;
  rent: number;
}

export interface AddRentCtx {
  room: Room;
  houseName: string;
  period: string;
}

export interface EntryCtx {
  mode: 'add' | 'edit';
  category?: string;
  houseId?: string;
  month?: number;
  amount?: number;
  roomId?: string;
  description?: string;
  contractor?: string;
  notes?: string;
}

export interface EntrySubmit {
  mode: 'add' | 'edit';
  category: string;
  houseId: string;
  month: number;
  year: number;
  value: number;
  notes: string;
  roomId: string;
  description: string;
  contractor: string;
}

export interface PickerCtx {
  entryId: string;
  label: string;
}

export interface ViewerCtx {
  receipt: Receipt;
  entryId?: string;
}
