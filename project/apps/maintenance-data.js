/* Maintenance Scheduler — mock data + helpers (plain JS). */
(function () {
  // Properties come from the central store (apps/store.js, Firestore-backed +
  // async) so Maintenance schedules against the same houses as the rest of the
  // suite. Filled by fromStore() AFTER PS_STORE.ready(), mutated in place.
  const PROPERTIES = [];
  function fromStore() {
    const store = window.PS_STORE.getHouses();
    PROPERTIES.length = 0;
    store.forEach((h) => PROPERTIES.push({ id: h.id, name: h.name, short: h.short, color: h.color }));
  }

  // icon + tint palette offered in the editor
  const ICONS = ['flame', 'bell-ring', 'shield-check', 'zap', 'droplets', 'wind',
    'thermometer', 'lightbulb', 'bug', 'wrench', 'paint-roller', 'plug'];
  const TINTS = [
    { id: 'green', value: 'var(--green-500)' },
    { id: 'amber', value: 'var(--amber-400)' },
    { id: 'red',   value: 'var(--red-500)' },
    { id: 'blue',  value: 'var(--blue-400)' },
    { id: 'slate', value: 'var(--gray-500)' },
  ];

  const prep = (...labels) => labels.map((l, i) => ({ id: i, label: l, done: false }));

  const TASKS = [
    { id: 't1', name: 'Boiler service', icon: 'flame', tint: 'var(--amber-400)', property: 'maple',
      dueInDays: 2, recurrence: 'Monthly', durationMin: 45, bucket: 'long', done: false,
      prep: prep('Service kit & spares', 'Carbon-monoxide tester', 'Notify tenant of visit') },
    { id: 't2', name: 'Smoke alarm test', icon: 'bell-ring', tint: 'var(--red-500)', property: 'maple',
      dueInDays: -12, recurrence: 'Quarterly', durationMin: 15, bucket: 'quick', done: false,
      prep: prep('Spare 9V batteries', 'Test card / log sheet') },
    { id: 't3', name: 'Gutter clearing', icon: 'droplets', tint: 'var(--blue-400)', property: 'maple',
      dueInDays: 21, recurrence: 'Quarterly', durationMin: 60, bucket: 'long', done: false,
      prep: prep('Ladder & stabiliser', 'Gloves & scoop', 'Garden waste sack') },
    { id: 't4', name: 'Gas safety check', icon: 'shield-check', tint: 'var(--green-500)', property: 'birch',
      dueInDays: 5, recurrence: 'Monthly', durationMin: 40, bucket: 'long', done: false,
      prep: prep('Gas analyser', 'CP12 certificate pad', 'Confirm engineer Gas-Safe ID') },
    { id: 't5', name: 'AC filter swap', icon: 'wind', tint: 'var(--blue-400)', property: 'birch',
      dueInDays: -3, recurrence: 'Monthly', durationMin: 10, bucket: 'quick', done: false,
      prep: prep('Correct filter size', 'Vacuum & cloth') },
    { id: 't6', name: 'Bleed radiators', icon: 'thermometer', tint: 'var(--amber-400)', property: 'birch',
      dueInDays: 30, recurrence: 'Quarterly', durationMin: 25, bucket: 'quick', done: false,
      prep: prep('Radiator key', 'Towel & catch tray') },
    { id: 't7', name: 'EICR inspection', icon: 'zap', tint: 'var(--amber-400)', property: 'oak',
      dueInDays: 6, recurrence: 'Quarterly', durationMin: 90, bucket: 'long', done: false,
      prep: prep('Multifunction tester', 'EICR schedule forms', 'Notify tenant — power off') },
    { id: 't8', name: 'Emergency lighting test', icon: 'lightbulb', tint: 'var(--green-500)', property: 'oak',
      dueInDays: 14, recurrence: 'Monthly', durationMin: 20, bucket: 'quick', done: false,
      prep: prep('Test key / switch', 'Log book') },
  ];

  function statusOf(t) {
    if (t.done) return 'done';
    if (t.dueInDays < 0) return 'overdue';
    if (t.dueInDays <= 7) return 'soon';
    return 'upcoming';
  }
  function dueLabel(d) {
    if (d === 0) return 'Today';
    if (d < 0) return Math.abs(d) + (Math.abs(d) === 1 ? ' day ago' : ' days ago');
    return 'in ' + d + (d === 1 ? ' day' : ' days');
  }

  // ---- completed-task history (log of past maintenance) ----
  const HISTORY = [
    { id: 'h1', name: 'Boiler service', icon: 'flame', tint: 'var(--amber-400)', property: 'maple',
      recurrence: 'Monthly', durationMin: 45, daysAgo: 28, by: 'Gas-Safe engineer' },
    { id: 'h2', name: 'Smoke alarm test', icon: 'bell-ring', tint: 'var(--red-500)', property: 'maple',
      recurrence: 'Quarterly', durationMin: 15, daysAgo: 104, by: 'You' },
    { id: 'h3', name: 'Gutter clearing', icon: 'droplets', tint: 'var(--blue-400)', property: 'maple',
      recurrence: 'Quarterly', durationMin: 60, daysAgo: 71, by: 'Contractor' },
    { id: 'h4', name: 'Gas safety check', icon: 'shield-check', tint: 'var(--green-500)', property: 'birch',
      recurrence: 'Monthly', durationMin: 40, daysAgo: 26, by: 'Gas-Safe engineer' },
    { id: 'h5', name: 'AC filter swap', icon: 'wind', tint: 'var(--blue-400)', property: 'birch',
      recurrence: 'Monthly', durationMin: 10, daysAgo: 33, by: 'You' },
    { id: 'h6', name: 'Bleed radiators', icon: 'thermometer', tint: 'var(--amber-400)', property: 'birch',
      recurrence: 'Quarterly', durationMin: 25, daysAgo: 88, by: 'You' },
    { id: 'h7', name: 'EICR inspection', icon: 'zap', tint: 'var(--amber-400)', property: 'oak',
      recurrence: 'Quarterly', durationMin: 90, daysAgo: 12, by: 'Electrician' },
    { id: 'h8', name: 'Emergency lighting test', icon: 'lightbulb', tint: 'var(--green-500)', property: 'oak',
      recurrence: 'Monthly', durationMin: 20, daysAgo: 19, by: 'You' },
    { id: 'h9', name: 'Boiler service', icon: 'flame', tint: 'var(--amber-400)', property: 'maple',
      recurrence: 'Monthly', durationMin: 45, daysAgo: 58, by: 'Gas-Safe engineer' },
    { id: 'h10', name: 'AC filter swap', icon: 'wind', tint: 'var(--blue-400)', property: 'birch',
      recurrence: 'Monthly', durationMin: 10, daysAgo: 64, by: 'You' },
  ];

  const MS_DAY = 86400000;
  function dateLabel(daysAgo) {
    const d = new Date(Date.now() - daysAgo * MS_DAY);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function agoLabel(daysAgo) {
    if (daysAgo <= 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 14) return daysAgo + ' days ago';
    if (daysAgo < 60) return Math.round(daysAgo / 7) + ' weeks ago';
    return Math.round(daysAgo / 30) + ' months ago';
  }
  function monthLabel(daysAgo) {
    const d = new Date(Date.now() - daysAgo * MS_DAY);
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  window.MAINT = { PROPERTIES, ICONS, TINTS, TASKS, HISTORY, statusOf, dueLabel, dateLabel, agoLabel, monthLabel, fromStore };
})();
