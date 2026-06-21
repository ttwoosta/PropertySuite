/* Rent Tracker — mock data (plain JS). */
(function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const HOUSES = [
    {
      id: 'maple', name: 'Maple Court', address: '14 Maple Court, Leeds LS6 2AB',
      rooms: [
        { id: 'm1', unit: 'Room 1', tenant: 'Marcus Bell', rent: 620, paid: 620, status: 'Paid', beds: 1 },
        { id: 'm2', unit: 'Room 2', tenant: 'Priya Shah', rent: 640, paid: 320, status: 'Partial', beds: 1 },
        { id: 'm3', unit: 'Room 3', tenant: 'Tom Reilly', rent: 600, paid: 0, status: 'Pending', beds: 1 },
        { id: 'm4', unit: 'Room 4', tenant: null, rent: 600, paid: 0, status: 'Vacant', beds: 1 },
      ],
    },
    {
      id: 'birch', name: 'Birchwood House', address: '8 Birchwood Rd, Leeds LS4 1QP',
      rooms: [
        { id: 'b1', unit: 'Room 1', tenant: 'Dana Okafor', rent: 700, paid: 700, status: 'Paid', beds: 2 },
        { id: 'b2', unit: 'Room 2', tenant: 'Sam Lin', rent: 580, paid: 580, status: 'Paid', beds: 1 },
        { id: 'b3', unit: 'Room 3', tenant: 'Ava Moreno', rent: 590, paid: 295, status: 'Partial', beds: 1 },
      ],
    },
  ];

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

  // year grid: per month, utility + per-room income + other + computed net.
  const ROOM_COLS = HOUSES.flatMap(h => h.rooms.map(r => ({ id: r.id, label: r.unit, house: h.name })));

  function gridRow(month, base) {
    const rentTotal = ROOM_COLS.reduce((s, c) => s + (base.rent[c.id] || 0), 0);
    const exp = base.tax + base.water + base.elec + base.gas + base.maint + base.loan;
    return { month, ...base, rentTotal, net: rentTotal - exp };
  }
  // generate plausible grid (some blanks)
  const GRID = MONTHS.map((mo, i) => {
    const filled = i <= 5; // Jan–Jun filled, rest blank
    const rent = {};
    ROOM_COLS.forEach(c => { rent[c.id] = filled ? (c.id.startsWith('m') ? 600 + (c.id.charCodeAt(4) % 5) * 10 : 580 + (c.id.charCodeAt(1) % 3) * 60) : null; });
    if (filled && i === 5) { rent['m3'] = null; rent['m4'] = null; } // June pending/vacant
    const base = filled
      ? { tax: i % 3 === 0 ? 540 : null, water: 90 + i * 2, elec: 150 + i * 8, gas: 120 + i * 6, maint: i % 2 ? 240 : 615, loan: 724, rent }
      : { tax: null, water: null, elec: null, gas: null, maint: null, loan: null, rent };
    return gridRow(mo, base);
  });

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

  window.RENT = { MONTHS, HOUSES, CATEGORIES, SERIES, EXP_MONTH, EXP_YTD, GRID, ROOM_COLS, ACTIVITY, RECEIPTS };
})();
