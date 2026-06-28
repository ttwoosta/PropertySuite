import { Injectable, computed, inject, signal } from '@angular/core';
import { SEED_RENT, buildRoomCols } from '../data/rent.seed';
import {
  Activity,
  AddHousePayload,
  AddRentCtx,
  Category,
  DonutDatum,
  EntryCtx,
  EntrySubmit,
  House,
  PickerCtx,
  Receipt,
  Room,
  RoomCol,
  SeriesPoint,
  ViewerCtx,
} from '../models/rent.vm';
import { ToastService } from './toast.service';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Central Rent Tracker store. Replaces the page-level state that `rent.jsx`
 * held in React hooks with Angular signals. In production, `houses` /
 * `receipts` would hydrate from Firestore via `collectionData()`; here they
 * seed from `SEED_RENT` (demo mode). Also owns the dialog controllers so any
 * view can open a drawer and `RentAppComponent` can host them centrally.
 */
@Injectable({ providedIn: 'root' })
export class RentService {
  private readonly toast = inject(ToastService);

  // ---- static reference data -------------------------------------------
  readonly months = SEED_RENT.months;
  readonly monthNames = MONTH_NAMES;
  readonly categories: Category[] = SEED_RENT.categories;
  readonly series: SeriesPoint[] = SEED_RENT.series;
  readonly expMonth: Record<string, number> = SEED_RENT.expMonth;
  readonly expYtd: Record<string, number> = SEED_RENT.expYtd;
  readonly activity: Activity[] = SEED_RENT.activity;
  readonly catById: Record<string, Category> = Object.fromEntries(
    SEED_RENT.categories.map((c) => [c.id, c]),
  );

  // ---- mutable domain state (signals) ----------------------------------
  readonly houses = signal<House[]>(
    SEED_RENT.houses.map((h) => ({ ...h, rooms: h.rooms.map((r) => ({ ...r })) })),
  );
  readonly receipts = signal<Receipt[]>(SEED_RENT.receipts.map((r) => ({ ...r })));
  /** entry-key (e.g. "gas-5") → receipt id */
  readonly links = signal<Record<string, string>>({ ...SEED_RENT.links });
  /** entry-key → overridden amount (from the Entry wizard) */
  readonly vals = signal<Record<string, number>>({});

  // ---- selection -------------------------------------------------------
  readonly houseId = signal<string>('maple');
  readonly month = signal<number>(5);
  readonly year = signal<number>(2026);

  readonly house = computed<House>(() => {
    const list = this.houses();
    return list.find((h) => h.id === this.houseId()) ?? list[0];
  });
  readonly roomCount = computed(() =>
    this.houses().reduce((s, h) => s + h.rooms.length, 0),
  );
  readonly period = computed(() => `${MONTH_NAMES[this.month()]} ${this.year()}`);
  readonly unlinkedReceipts = computed<Receipt[]>(() => {
    const linked = Object.values(this.links());
    return this.receipts().filter((r) => !linked.includes(r.id));
  });

  // ---- dialog controllers (signals) ------------------------------------
  readonly addHouseOpen = signal(false);
  readonly editRoomCtx = signal<Room | null>(null);
  readonly addRentCtx = signal<AddRentCtx | null>(null);
  readonly entryCtx = signal<EntryCtx | null>(null);
  readonly uploadOpen = signal(false);
  readonly pickerCtx = signal<PickerCtx | null>(null);
  readonly viewerCtx = signal<ViewerCtx | null>(null);

  // ---- selectors -------------------------------------------------------
  roomCols(): RoomCol[] {
    return buildRoomCols(this.houses());
  }
  roomColsForActive(): RoomCol[] {
    return this.roomCols().filter((c) => c.house === this.house().name);
  }
  donutData(): DonutDatum[] {
    return this.categories.map((c) => ({ id: c.id, color: c.color, value: this.expMonth[c.id] }));
  }
  /** Effective monthly amount for a category/month (override or derived). */
  amountOf(catId: string, monthIdx: number): number {
    const key = `${catId}-${monthIdx}`;
    const v = this.vals()[key];
    return v != null ? v : Math.max(40, this.expMonth[catId] - monthIdx * 7);
  }
  receiptById(id: string | undefined): Receipt | undefined {
    if (!id) return undefined;
    return this.receipts().find((r) => r.id === id);
  }

  // ---- mutations -------------------------------------------------------
  selectHouse(id: string): void {
    this.houseId.set(id);
  }
  setPeriod(month: number, year: number): void {
    this.month.set(month);
    this.year.set(year);
  }

  addHouse(p: AddHousePayload): void {
    const id = 'h' + Math.random().toString(36).slice(2, 6);
    const rooms: Room[] = Array.from({ length: p.rooms }, (_, k) => ({
      id: id + 'r' + k,
      unit: 'Room ' + (k + 1),
      tenant: null,
      rent: p.rent,
      paid: 0,
      status: 'Vacant',
    }));
    const name = p.address.split(',')[0];
    this.houses.update((hs) => [...hs, { id, name, address: p.address, rooms }]);
    this.houseId.set(id);
    this.addHouseOpen.set(false);
    this.toast.show('House added · ' + p.rooms + ' rooms');
  }

  updateRoom(room: Room): void {
    const hid = this.houseId();
    this.houses.update((hs) =>
      hs.map((h) =>
        h.id !== hid ? h : { ...h, rooms: h.rooms.map((r) => (r.id === room.id ? room : r)) },
      ),
    );
  }

  saveRoom(room: Room): void {
    this.updateRoom(room);
    this.editRoomCtx.set(null);
    this.toast.show('Room saved');
  }

  recordRent(room: Room): void {
    this.updateRoom(room);
    this.addRentCtx.set(null);
    this.toast.show('Rent recorded');
  }

  setEntryValue(category: string, month: number, value: number): void {
    this.vals.update((v) => ({ ...v, [category + '-' + month]: value }));
  }

  submitEntry(p: EntrySubmit): void {
    if (p.category && p.month != null) this.setEntryValue(p.category, p.month, p.value);
    this.entryCtx.set(null);
    this.toast.show(p.mode === 'edit' ? 'Entry updated' : 'Entry added');
  }

  addReceipt(rc: Receipt): void {
    this.receipts.update((rs) => [{ ...rc }, ...rs]);
    this.uploadOpen.set(false);
    this.toast.show('Receipt uploaded');
  }

  attachReceipt(entryId: string, receiptId: string): void {
    this.links.update((l) => ({ ...l, [entryId]: receiptId }));
    this.pickerCtx.set(null);
    this.toast.show('Receipt attached');
  }

  unlinkReceipt(entryId: string): void {
    this.links.update((l) => {
      const next = { ...l };
      delete next[entryId];
      return next;
    });
    this.viewerCtx.set(null);
    this.toast.show('Receipt unlinked');
  }

  // ---- dialog openers --------------------------------------------------
  openAddHouse(): void {
    this.addHouseOpen.set(true);
  }
  openEditRoom(room: Room): void {
    this.editRoomCtx.set(room);
  }
  openAddRent(room: Room): void {
    this.addRentCtx.set({ room, houseName: this.house().name, period: this.period() });
  }
  openAddEntry(category: string): void {
    this.entryCtx.set({ mode: 'add', category, houseId: this.houseId() });
  }
  openEditEntry(ctx: EntryCtx): void {
    this.entryCtx.set(ctx);
  }
  openUpload(): void {
    this.uploadOpen.set(true);
  }
  openPicker(entryId: string, label: string): void {
    this.pickerCtx.set({ entryId, label });
  }
  openViewer(receipt: Receipt, entryId?: string): void {
    this.viewerCtx.set({ receipt, entryId });
  }
}
