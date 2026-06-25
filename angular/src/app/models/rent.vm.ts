/** View models for the Rent Tracker feature. */

export type RoomStatus = 'Paid' | 'Partial' | 'Pending' | 'Vacant';

export interface RoomVm {
  id: string;
  unit: string;
  tenant: string;
  rent: number;
  paid: number;
  status: RoomStatus;
  beds: number;
}

export interface HouseVm {
  id: string;
  name: string;
  address: string;
  rooms: RoomVm[];
}

export interface ReceiptVm {
  id: string;
  merchant: string;
  category: string;
  houseId: string;
  date: string;
  amount: number;
  notes?: string;
  storagePath: string;
  uploadedAt: Date;
  /** 'img' | 'pdf' | 'other' derived from storagePath extension */
  kind: 'img' | 'pdf' | 'other';
}

export interface RentEntryVm {
  id: string;
  houseId: string;
  roomId: string;
  houseName: string;
  roomName: string;
  tenant: string;
  month: number;
  year: number;
  amountDue: number;
  amountPaid: number;
  status: RoomStatus;
  notes?: string;
}

export interface ExpenseEntryVm {
  id: string;
  houseId: string;
  year: number;
  month: number;
  category: string;
  amount: number;
  description?: string;
  contractor?: string;
  notes?: string;
  receiptId?: string;
  roomId?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface SeriesPoint {
  m: number;
  income: number;
  expense: number;
}
