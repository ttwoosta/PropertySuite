/**
 * Firestore document shapes for Rent Tracker. These mirror what would be
 * stored in Firestore collections. Components never import these directly —
 * the `RentService` maps DTOs to view models (`*.vm.ts`).
 */

export type RoomStatusDto = 'Paid' | 'Partial' | 'Pending' | 'Vacant';

export interface RoomDto {
  id: string;
  unit: string;
  tenant: string | null;
  rent: number;
  paid: number;
  status: RoomStatusDto;
  beds?: number;
}

export interface HouseDto {
  id: string;
  name: string;
  address: string;
  rooms: RoomDto[];
}

export type ReceiptKindDto = 'pdf' | 'img' | 'other' | 'none';

export interface ReceiptDto {
  id: string;
  merchant: string;
  cat: string;
  date: string;
  amount: number;
  kind?: ReceiptKindDto;
  url?: string | null;
  notes?: string;
}

export interface CategoryDto {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface SeriesPointDto {
  m: string;
  income: number;
  expense: number;
}

export interface ActivityDto {
  cat: string;
  dot: string;
  label: string;
  sub: string;
  amount: number;
  when: string;
}

/** Aggregate seed document shape (the whole `RENT.*` blob). */
export interface RentSeedDto {
  months: string[];
  houses: HouseDto[];
  categories: CategoryDto[];
  series: SeriesPointDto[];
  expMonth: Record<string, number>;
  expYtd: Record<string, number>;
  activity: ActivityDto[];
  receipts: ReceiptDto[];
  /** Initial entry→receipt links, e.g. `{ 'gas-5': 'r1' }`. */
  links: Record<string, string>;
}
