// Rent Tracker — ONLY file that imports firebase/firestore for the Rent domain.
// All functions are pure async I/O with no React or demo-mode logic.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { House, ReceiptWithKind, RentEntry, Room } from '../apps/rent/data';

// ── Collection helpers ────────────────────────────────────────────────────────

function housesCol(uid: string) { return collection(db!, 'users', uid, 'rent_houses'); }
function houseDoc(uid: string, id: string) { return doc(db!, 'users', uid, 'rent_houses', id); }
function receiptsCol(uid: string) { return collection(db!, 'users', uid, 'rent_receipts'); }
function receiptDoc(uid: string, id: string) { return doc(db!, 'users', uid, 'rent_receipts', id); }
function entriesCol(uid: string) { return collection(db!, 'users', uid, 'rent_entries'); }
function entryDoc(uid: string, id: string) { return doc(db!, 'users', uid, 'rent_entries', id); }

// ── Grid cells ───────────────────────────────────────────────────────────────

function gridCol(uid: string) { return collection(db!, 'users', uid, 'rent_grid'); }

export interface GridCellEntry {
  houseId: string; year: number; monthIdx: number; field: string; value: number;
}

export async function saveGridCell(uid: string, entry: GridCellEntry): Promise<void> {
  const id = `${entry.houseId}_${entry.year}_${entry.monthIdx}_${entry.field.replace('.', '_')}`;
  if (entry.value === null) {
    await deleteDoc(doc(gridCol(uid), id));
  } else {
    await setDoc(doc(gridCol(uid), id), entry);
  }
}

export function subscribeGridCells(
  uid: string,
  houseId: string,
  year: number,
  onData: (cells: GridCellEntry[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    query(gridCol(uid), where('houseId', '==', houseId), where('year', '==', year)),
    (snap) => onData(snap.docs.map((d) => d.data() as GridCellEntry)),
    (err) => onError?.(err),
  );
}

// ── Houses ────────────────────────────────────────────────────────────────────

export async function addHouse(uid: string, house: Omit<House, 'id'>): Promise<string> {
  const ref = await addDoc(housesCol(uid), { ...house, createdAt: serverTimestamp() });
  return ref.id;
}

export async function saveRoom(uid: string, houseId: string, rooms: Room[]): Promise<void> {
  await updateDoc(houseDoc(uid, houseId), { rooms });
}

export async function deleteHouse(uid: string, houseId: string): Promise<void> {
  await deleteDoc(houseDoc(uid, houseId));
}

export function subscribeHouses(
  uid: string,
  onData: (houses: House[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    query(housesCol(uid), orderBy('createdAt')),
    (snap) => onData(snap.docs.map((d) => ({ ...(d.data() as Omit<House, 'id'>), id: d.id }))),
    (err) => onError?.(err),
  );
}

// ── Receipts ──────────────────────────────────────────────────────────────────

export async function addReceipt(uid: string, rc: Omit<ReceiptWithKind, 'id'>): Promise<string> {
  const ref = await addDoc(receiptsCol(uid), { ...rc, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteReceipt(uid: string, receiptId: string): Promise<void> {
  await deleteDoc(receiptDoc(uid, receiptId));
}

export function subscribeReceipts(
  uid: string,
  onData: (receipts: ReceiptWithKind[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    query(receiptsCol(uid), orderBy('createdAt', 'desc')),
    (snap) => onData(snap.docs.map((d) => ({ ...(d.data() as Omit<ReceiptWithKind, 'id'>), id: d.id }))),
    (err) => onError?.(err),
  );
}

// ── Rent entries ──────────────────────────────────────────────────────────────

export async function addRentEntry(uid: string, entry: Omit<RentEntry, 'id'>): Promise<string> {
  const ref = await addDoc(entriesCol(uid), { ...entry, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateRentEntry(
  uid: string,
  entryId: string,
  data: Partial<Omit<RentEntry, 'id'>>,
): Promise<void> {
  await updateDoc(entryDoc(uid, entryId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRentEntry(uid: string, entryId: string): Promise<void> {
  await deleteDoc(entryDoc(uid, entryId));
}

export function subscribeRentEntries(
  uid: string,
  houseId: string | undefined,
  onData: (entries: RentEntry[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = houseId
    ? query(entriesCol(uid), where('houseId', '==', houseId), orderBy('createdAt', 'desc'))
    : query(entriesCol(uid), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ ...(d.data() as Omit<RentEntry, 'id'>), id: d.id }))),
    (err) => onError?.(err),
  );
}
