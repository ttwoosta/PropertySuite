/* Maintenance Scheduler — mock data + helpers (plain JS). */
(function () {
  const PROPERTIES = [
    { id: 'elm',  name: '14 Elm Road',       short: 'Elm Road',   color: 'var(--green-500)' },
    { id: 'birch', name: '8 Birch Lane',      short: 'Birch Lane', color: 'var(--amber-400)' },
    { id: 'park', name: 'Flat 2, Park View',  short: 'Park View',  color: 'var(--blue-400)' },
  ];

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
    { id: 't1', name: 'Boiler service', icon: 'flame', tint: 'var(--amber-400)', property: 'elm',
      dueInDays: 2, recurrence: 'Monthly', durationMin: 45, bucket: 'long', done: false,
      prep: prep('Service kit & spares', 'Carbon-monoxide tester', 'Notify tenant of visit') },
    { id: 't2', name: 'Smoke alarm test', icon: 'bell-ring', tint: 'var(--red-500)', property: 'elm',
      dueInDays: -12, recurrence: 'Quarterly', durationMin: 15, bucket: 'quick', done: false,
      prep: prep('Spare 9V batteries', 'Test card / log sheet') },
    { id: 't3', name: 'Gutter clearing', icon: 'droplets', tint: 'var(--blue-400)', property: 'elm',
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
    { id: 't7', name: 'EICR inspection', icon: 'zap', tint: 'var(--amber-400)', property: 'park',
      dueInDays: 6, recurrence: 'Quarterly', durationMin: 90, bucket: 'long', done: false,
      prep: prep('Multifunction tester', 'EICR schedule forms', 'Notify tenant — power off') },
    { id: 't8', name: 'Emergency lighting test', icon: 'lightbulb', tint: 'var(--green-500)', property: 'park',
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

  window.MAINT = { PROPERTIES, ICONS, TINTS, TASKS, statusOf, dueLabel };
})();
