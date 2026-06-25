import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from '@angular/fire/firestore';
import { Observable, from, Subject, catchError, map, of } from 'rxjs';
import { HouseDto, RoomDto, ReceiptDto, RentEntryDto, ExpenseEntryDto } from '../models/rent.dto';
import { HouseVm, ReceiptVm, RentEntryVm, ExpenseEntryVm, RoomVm } from '../models/rent.vm';

export const CATEGORIES = [
  { id: 'tax',   label: 'Council Tax',  icon: 'landmark',   color: '#3E78B8' },
  { id: 'water', label: 'Water',        icon: 'droplets',   color: '#06B6D4' },
  { id: 'elec',  label: 'Electricity',  icon: 'zap',        color: '#F59E0B' },
  { id: 'gas',   label: 'Gas',          icon: 'flame',       color: '#EF4444' },
  { id: 'maint', label: 'Maintenance',  icon: 'wrench',     color: '#8B5CF6' },
  { id: 'loan',  label: 'Mortgage',     icon: 'building-2', color: '#10B981' },
];

export const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function kindFromPath(p: string): 'img' | 'pdf' | 'other' {
  const ext = p.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'img';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

function houseDtoToVm(dto: HouseDto): HouseVm {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    rooms: (dto.rooms ?? []).map((r) => ({ ...r })),
  };
}

function receiptDtoToVm(dto: ReceiptDto): ReceiptVm {
  return {
    ...dto,
    uploadedAt: dto.uploadedAt.toDate(),
    kind: kindFromPath(dto.storagePath),
  };
}

function rentEntryDtoToVm(dto: RentEntryDto): RentEntryVm {
  return { ...dto };
}

function expenseDtoToVm(dto: ExpenseEntryDto): ExpenseEntryVm {
  return { ...dto };
}

@Injectable({ providedIn: 'root' })
export class RentService {
  private firestore = inject(Firestore);

  getHouses(uid: string): Observable<HouseVm[]> {
    const col = collection(this.firestore, `users/${uid}/rent_houses`);
    return (collectionData(col, { idField: 'id' }) as Observable<HouseDto[]>).pipe(
      map((docs) => docs.map(houseDtoToVm)),
      catchError(() => of([])),
    );
  }

  getReceipts(uid: string): Observable<ReceiptVm[]> {
    const col = collection(this.firestore, `users/${uid}/rent_receipts`);
    const q = query(col, orderBy('uploadedAt', 'desc'));
    return (collectionData(q, { idField: 'id' }) as Observable<ReceiptDto[]>).pipe(
      map((docs) => docs.map(receiptDtoToVm)),
      catchError(() => of([])),
    );
  }

  getRentEntries(uid: string, houseId?: string): Observable<RentEntryVm[]> {
    const col = collection(this.firestore, `users/${uid}/rent_entries`);
    const q = houseId
      ? query(col, where('houseId', '==', houseId))
      : query(col);
    return (collectionData(q, { idField: 'id' }) as Observable<RentEntryDto[]>).pipe(
      map((docs) => docs.map(rentEntryDtoToVm)),
      catchError(() => of([])),
    );
  }

  getExpenseEntries(uid: string, houseId: string, year: number): Observable<ExpenseEntryVm[]> {
    const col = collection(this.firestore, `users/${uid}/expense_entries`);
    const q = query(col, where('houseId', '==', houseId), where('year', '==', year));
    return (collectionData(q, { idField: 'id' }) as Observable<ExpenseEntryDto[]>).pipe(
      map((docs) => docs.map(expenseDtoToVm)),
      catchError(() => of([])),
    );
  }

  async addHouse(uid: string, data: { name: string; address: string; rooms: RoomDto[] }): Promise<string> {
    const col = collection(this.firestore, `users/${uid}/rent_houses`);
    const ref = await addDoc(col, data);
    return ref.id;
  }

  async saveRooms(uid: string, houseId: string, rooms: RoomVm[]): Promise<void> {
    await updateDoc(doc(this.firestore, `users/${uid}/rent_houses/${houseId}`), { rooms });
  }

  async addReceipt(uid: string, data: Omit<ReceiptDto, 'id'>): Promise<string> {
    const col = collection(this.firestore, `users/${uid}/rent_receipts`);
    const ref = await addDoc(col, data);
    return ref.id;
  }

  async addRentEntry(uid: string, data: Omit<RentEntryDto, 'id'>): Promise<string> {
    const col = collection(this.firestore, `users/${uid}/rent_entries`);
    const ref = await addDoc(col, data);
    return ref.id;
  }

  async saveExpenseEntry(uid: string, data: Omit<ExpenseEntryDto, 'id'>): Promise<void> {
    const key = `${data.houseId}_${data.year}_${data.month}_${data.category}`;
    const ref = doc(this.firestore, `users/${uid}/expense_entries/${key}`);
    await setDoc(ref, data, { merge: true });
  }

  async linkExpenseReceipt(uid: string, houseId: string, year: number, month: number, category: string, receiptId: string): Promise<void> {
    const key = `${houseId}_${year}_${month}_${category}`;
    const ref = doc(this.firestore, `users/${uid}/expense_entries/${key}`);
    await setDoc(ref, { receiptId }, { merge: true });
  }

  async deleteHouse(uid: string, houseId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `users/${uid}/rent_houses/${houseId}`));
  }

  async deleteReceipt(uid: string, receiptId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `users/${uid}/rent_receipts/${receiptId}`));
  }
}
