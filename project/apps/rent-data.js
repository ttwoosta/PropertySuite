/* Rent Tracker — mock data (plain JS).
   Houses/rooms + the year-grid columns and rows derive from the central store
   (apps/store.js, Firestore-backed + async). They are rebuilt via fromStore()
   AFTER PS_STORE.ready(); the rest of the data below is static mock content. */
(function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---- store-derived (filled by fromStore) ----
  const HOUSES = [];     // [{ id, name, address, rooms:[{ id, unit, rent, tenant, paid, status, beds }] }]
  const ROOM_COLS = [];  // [{ id, label, house }]
  const GRID = [];       // [{ month, tax, water, ..., rent:{}, rentTotal, net }]

  // expense categories with muted accent tints
  const CATEGORIES = [
    { id: 'tax', label: 'Property Tax', icon: 'landmark', color: 'var(--blue-400)' },
    { id: 'water', label: 'Water', icon: 'droplets', color: 'var(--green-400)' },
    { id: 'elec', label: 'Electricity', icon: 'zap', color: 'var(--amber-400)' },
    { id: 'gas', label: 'Gas', icon: 'flame', color: 'var(--red-400)' },
    { id: 'maint', label: 'Maintenance', icon: 'wrench', color: 'var(--gray-500)' },
    { id: 'loan', label: 'Loan Payment', icon: 'banknote', color: 'var(--green-600)' },
  ];

  // 6-month income/expense series (Jan–Jun)
  const SERIES = [
    { m: 'Jan', income: 4030, expense: 2240 },
    { m: 'Feb', income: 4030, expense: 1980 },
    { m: 'Mar', income: 4250, expense: 2620 },
    { m: 'Apr', income: 4250, expense: 2110 },
    { m: 'May', income: 4410, expense: 1890 },
    { m: 'Jun', income: 4475, expense: 2305 },
  ];

  // current-month expense by category (June)
  const EXP_MONTH = { tax: 540, water: 96, elec: 188, gas: 142, maint: 615, loan: 724 };
  const EXP_YTD = { tax: 3240, water: 560, elec: 1180, gas: 980, maint: 2140, loan: 4344 };

  function gridRow(month, base) {
    const rentTotal = ROOM_COLS.reduce((s, c) => s + (base.rent[c.id] || 0), 0);
    const exp = base.tax + base.water + base.elec + base.gas + base.maint + base.loan;
    return Object.assign({ month }, base, { rentTotal, net: rentTotal - exp });
  }

  // Rebuild HOUSES / ROOM_COLS / GRID from the current store snapshot, mutating
  // the exported arrays IN PLACE so any references captured at load stay valid.
  function fromStore() {
    const store = window.PS_STORE.getHouses();
    HOUSES.length = 0;
    store.forEach((h) => HOUSES.push({
      id: h.id, name: h.name, address: h.address,
      rooms: (h.rooms || []).map((r) => ({
        id: r.id, unit: r.unit, rent: r.rent,
        tenant: r.tenant ? r.tenant.name : null,
        paid: r.paid, status: r.payStatus, beds: r.beds,
      })),
    }));

    ROOM_COLS.length = 0;
    HOUSES.forEach((h) => h.rooms.forEach((r) => ROOM_COLS.push({ id: r.id, label: r.unit, house: h.name })));

    GRID.length = 0;
    MONTHS.forEach((mo, i) => {
      const filled = i <= 5; // Jan–Jun filled, rest blank
      const rent = {};
      ROOM_COLS.forEach((c) => {
        rent[c.id] = filled ? (c.id.startsWith('m') ? 600 + (c.id.charCodeAt(4) % 5) * 10 : 580 + (c.id.charCodeAt(1) % 3) * 60) : null;
      });
      if (filled && i === 5) { rent['m3'] = null; rent['m4'] = null; } // June pending/vacant
      const base = filled
        ? { tax: i % 3 === 0 ? 540 : null, water: 90 + i * 2, elec: 150 + i * 8, gas: 120 + i * 6, maint: i % 2 ? 240 : 615, loan: 724, rent }
        : { tax: null, water: null, elec: null, gas: null, maint: null, loan: null, rent };
      GRID.push(gridRow(mo, base));
    });
  }

  // recent activity feed
  const ACTIVITY = [
    { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Dana Okafor', sub: 'Birchwood · Room 1', amount: 700, when: '2 hours ago' },
    { cat: 'maint', dot: 'var(--gray-500)', label: 'Maintenance — boiler repair', sub: 'Maple Court', amount: -615, when: '1 day ago' },
    { cat: 'rent', dot: 'var(--green-500)', label: 'Rent received — Marcus Bell', sub: 'Maple · Room 1', amount: 620, when: '2 days ago' },
    { cat: 'loan', dot: 'var(--green-600)', label: 'Loan payment', sub: 'Maple Court mortgage', amount: -724, when: '3 days ago' },
    { cat: 'elec', dot: 'var(--amber-400)', label: 'Electricity bill', sub: 'Birchwood House', amount: -188, when: '5 days ago' },
  ];

  const RECEIPTS = [
    { id: 'r1', merchant: 'British Gas', cat: 'gas', date: '4 Jun 2026', amount: 142 },
    { id: 'r2', merchant: 'Yorkshire Water', cat: 'water', date: '2 Jun 2026', amount: 96 },
    { id: 'r3', merchant: 'PlumbPro Ltd', cat: 'maint', date: '28 May 2026', amount: 615 },
    { id: 'r4', merchant: 'EDF Energy', cat: 'elec', date: '20 May 2026', amount: 188 },
    { id: 'r5', merchant: 'Leeds City Council', cat: 'tax', date: '12 May 2026', amount: 540 },
    { id: 'r6', merchant: 'Halifax Mortgage', cat: 'loan', date: '1 May 2026', amount: 724 },
  ];

  window.RENT = { MONTHS, HOUSES, CATEGORIES, SERIES, EXP_MONTH, EXP_YTD, GRID, ROOM_COLS, ACTIVITY, RECEIPTS, fromStore };
})();
