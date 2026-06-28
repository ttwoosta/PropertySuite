import { RentSeedDto } from '../models/rent.dto';
import { GridRow, RoomCol } from '../models/rent.vm';

/**
 * Static seed copied from the prototype's `rent-data.js` (`window.RENT`).
 * The `RentService` falls back to this when Firestore has no data
 * (demo mode). In production this is replaced by `collectionData()` reads.
 */
export const SEED_RENT: RentSeedDto = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  houses: [
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
  ],
  categories: [
    { id: 'tax', label: 'Property Tax', icon: 'landmark', color: 'var(--blue-400)' },
    { id: 'water', label: 'Water', icon: 'droplets', color: 'var(--green-400)' },
    { id: 'elec', label: 'Electricity', icon: 'zap', color: 'var(--amber-400)' },
    { id: 'gas', label: 'Gas', icon: 'flame', color: 'var(--red-400)' },
    { id: 'maint', label: 'Maintenance', icon: 'wrench', color: 'var(--gray-500)' },
    { id: 'loan', label: 'Loan Payment', icon: 'banknote', color: 'var(--green-600)' },
  ],
  series: [
    { m: 'Jan', income: 4030, expense: 2240 },
    { m: 'Feb', income: 4030, expense: 1980 },
    { m: 'Mar', income: 4250, expense: 2620 },
    { m: 'Apr', income: 4250, expense: 2110 },
    { m: 'May', income: 4410, expense: 1890 },
    { m: 'Jun', income: 4475, expense: 2305 },
  ],
  expMonth: { tax: 540, water: 96, elec: 188, gas: 142, maint: 615, loan: 724 },
  expYtd: { tax: 3240, water: 560, elec: 1180, gas: 980, maint: 2140, loan: 4344 },
  activity: [
    { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Dana Okafor', sub: 'Birchwood · Room 1', amount: 700, when: '2 hours ago' },
    { cat: 'maint', dot: 'var(--gray-500)', label: 'Maintenance — boiler repair', sub: 'Maple Court', amount: -615, when: '1 day ago' },
    { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Marcus Bell', sub: 'Maple · Room 1', amount: 620, when: '2 days ago' },
    { cat: 'loan', dot: 'var(--green-600)', label: 'Loan payment', sub: 'Maple Court mortgage', amount: -724, when: '3 days ago' },
    { cat: 'elec', dot: 'var(--amber-400)', label: 'Electricity bill', sub: 'Birchwood House', amount: -188, when: '5 days ago' },
  ],
  receipts: [
    { id: 'r1', merchant: 'British Gas', cat: 'gas', date: '4 Jun 2026', amount: 142, kind: 'pdf' },
    { id: 'r2', merchant: 'Yorkshire Water', cat: 'water', date: '2 Jun 2026', amount: 96, kind: 'img' },
    { id: 'r3', merchant: 'PlumbPro Ltd', cat: 'maint', date: '28 May 2026', amount: 615, kind: 'img' },
    { id: 'r4', merchant: 'EDF Energy', cat: 'elec', date: '20 May 2026', amount: 188, kind: 'pdf' },
    { id: 'r5', merchant: 'Leeds City Council', cat: 'tax', date: '12 May 2026', amount: 540, kind: 'pdf' },
    { id: 'r6', merchant: 'Halifax Mortgage', cat: 'loan', date: '1 May 2026', amount: 724, kind: 'img' },
  ],
  links: { 'gas-5': 'r1', 'water-5': 'r2', 'maint-4': 'r3' },
};

/** All room columns across every seeded house (for the year grid). */
export function buildRoomCols(houses = SEED_RENT.houses): RoomCol[] {
  return houses.flatMap((h) => h.rooms.map((r) => ({ id: r.id, label: r.unit, house: h.name })));
}

/**
 * Generate the plausible year grid (Jan–Jun filled, rest blank), ported
 * verbatim from `rent-data.js`'s GRID generator.
 */
export function buildGrid(): GridRow[] {
  const cols = buildRoomCols();
  const gridRow = (
    month: string,
    base: Omit<GridRow, 'month' | 'rentTotal' | 'net'>,
  ): GridRow => {
    const rentTotal = cols.reduce((s, c) => s + (base.rent[c.id] || 0), 0);
    const exp =
      (base.tax || 0) +
      (base.water || 0) +
      (base.elec || 0) +
      (base.gas || 0) +
      (base.maint || 0) +
      (base.loan || 0);
    return { month, ...base, rentTotal, net: rentTotal - exp };
  };

  return SEED_RENT.months.map((mo, i) => {
    const filled = i <= 5;
    const rent: Record<string, number | null> = {};
    cols.forEach((c) => {
      rent[c.id] = filled
        ? c.id.startsWith('m')
          ? 600 + (c.id.charCodeAt(4) % 5) * 10
          : 580 + (c.id.charCodeAt(1) % 3) * 60
        : null;
    });
    if (filled && i === 5) {
      rent['m3'] = null;
      rent['m4'] = null;
    }
    const base: Omit<GridRow, 'month' | 'rentTotal' | 'net'> = filled
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
}
