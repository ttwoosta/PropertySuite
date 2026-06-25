import { Timestamp } from 'firebase/firestore';

/** Firestore document shape for 'users/{uid}/rent_houses'. */
export interface HouseDto {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly rooms: RoomDto[];
}

export interface RoomDto {
  readonly id: string;
  readonly unit: string;
  readonly tenant: string;
  readonly rent: number;
  readonly paid: number;
  readonly status: 'Paid' | 'Partial' | 'Pending' | 'Vacant';
  readonly beds: number;
}

/** Firestore document shape for 'users/{uid}/rent_receipts'. */
export interface ReceiptDto {
  readonly id: string;
  readonly merchant: string;
  readonly category: string;
  readonly houseId: string;
  readonly date: string;
  readonly amount: number;
  readonly notes?: string;
  readonly storagePath: string;
  readonly uploadedAt: Timestamp;
}

/** Firestore document shape for 'users/{uid}/rent_entries'. */
export interface RentEntryDto {
  readonly id: string;
  readonly houseId: string;
  readonly roomId: string;
  readonly houseName: string;
  readonly roomName: string;
  readonly tenant: string;
  readonly month: number;
  readonly year: number;
  readonly amountDue: number;
  readonly amountPaid: number;
  readonly status: 'Paid' | 'Partial' | 'Pending' | 'Vacant';
  readonly notes?: string;
}

/** Firestore document shape for expense entries (keyed by composite ID). */
export interface ExpenseEntryDto {
  readonly id: string;
  readonly houseId: string;
  readonly year: number;
  readonly month: number;
  readonly category: string;
  readonly amount: number;
  readonly description?: string;
  readonly contractor?: string;
  readonly notes?: string;
  readonly receiptId?: string;
  readonly roomId?: string;
}
