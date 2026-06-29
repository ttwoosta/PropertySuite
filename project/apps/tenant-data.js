/* TenantBridge — mock data (plain JS). */
(function () {
  // Properties + tenants come from the central store (apps/store.js, Firestore-
  // backed + async); the communication threads / suggestions / queue below are
  // TenantBridge-specific and keyed by the same tenant ids the store assigns.
  // PROPS / TENANTS are filled by fromStore() AFTER PS_STORE.ready(), in place.
  const PROPS = [];
  const TENANTS = [];
  function fromStore() {
    const store = window.PS_STORE.getHouses();
    PROPS.length = 0;
    store.forEach((h) => PROPS.push({ id: h.id, name: h.name, color: h.color }));
    TENANTS.length = 0;
    window.PS_STORE.tenants().forEach((t) => TENANTS.push({
      id: t.id, name: t.name, unit: t.unit, prop: t.houseId,
      score: t.score, lastContact: t.lastContact, phone: t.phone || '', email: t.email || '',
      style: t.style, payment: t.payment, preferTime: t.preferTime,
    }));
  }

  // initial threads per tenant
  const THREADS = {
    marcus: [
      { id: 'm1', who: 'them', channel: 'sms', text: 'Hi — boiler\u2019s making a knocking sound when the heating kicks in. Not urgent but wanted to flag.', when: 'Tue 10:24' },
      { id: 'm2', who: 'you', channel: 'sms', text: 'Thanks Marcus. I\u2019ll get our engineer booked in this week and confirm a time.', when: 'Tue 11:02' },
      { id: 'm3', who: 'note', text: 'Boiler service is overdue at Elm Road — service kit in shed.', when: 'Tue 11:03' },
      { id: 'm4', who: 'them', channel: 'sms', text: 'Cheers, appreciate it.', when: 'Tue 11:14' },
    ],
    priya: [
      { id: 'p1', who: 'them', channel: 'email', text: 'Quick question — when is the next rent date? I want to align my standing order.', when: 'Mon 09:10' },
      { id: 'p2', who: 'you', channel: 'email', text: 'Next collection is the 1st. Happy to update the SO reference if helpful.', when: 'Mon 14:22' },
    ],
    tom: [],
    dana: [
      { id: 'd1', who: 'them', channel: 'sms', text: 'AC unit is humming louder than usual. Filter due?', when: 'Sat 18:42' },
    ],
    sam: [],
    ava: [
      { id: 'a1', who: 'note', text: 'Tenant prefers detailed updates with reference numbers.', when: 'Fri 10:00' },
    ],
  };

  const SUGGESTIONS = [
    { id: 's1', tenant: 'marcus', source: 'Maintenance Scheduler', tone: 'Reminder',
      trigger: 'Boiler service is due in 2 days — Marcus reported the issue last week.',
      draft: "Hi Marcus — quick heads up, the engineer is booked for Thursday between 9 and 11am for the boiler service. They'll knock and announce themselves. Let me know if that doesn't work and I'll move it. Thanks!" },
    { id: 's2', tenant: 'priya', source: 'Rent Tracker', tone: 'Friendly',
      trigger: 'Priya\u2019s rent is due in 3 days and her standing order reference changed.',
      draft: "Hey Priya — just a friendly reminder that rent\u2019s due on the 1st. Your standing order should pull as usual, but let me know if anything looks off on your end. Cheers!" },
    { id: 's3', tenant: 'dana', source: 'Maintenance Scheduler', tone: 'Informational',
      trigger: 'Dana flagged the AC unit; quarterly filter swap is upcoming.',
      draft: "Hi Dana — thanks for flagging the AC. I\u2019ll swap the filter on the quarterly visit next week and check the fan housing while I\u2019m there. I\u2019ll text the day before so you can plan around it." },
  ];

  const QUEUE = [
    { id: 'q1', date: { mon: 'JUN', day: 24 }, tenant: 'priya', channel: 'email', title: 'Monthly rent reminder', countdown: 'in 3 days' },
    { id: 'q2', date: { mon: 'JUN', day: 26 }, tenant: 'marcus', channel: 'sms', title: 'Boiler service confirmation', countdown: 'in 5 days' },
    { id: 'q3', date: { mon: 'JUL', day: 2 }, tenant: 'dana', channel: 'sms', title: 'AC filter swap notice', countdown: 'in 11 days' },
    { id: 'q4', date: { mon: 'JUL', day: 14 }, tenant: 'tom', channel: 'email', title: 'Lease renewal options', countdown: 'in 23 days' },
  ];

  const HISTORY = {
    marcus: [
      { label: 'Boiler service', when: 'Today, scheduled' },
      { label: 'Smoke alarm test', when: '6 months ago' },
      { label: 'Gas safety check', when: '11 months ago' },
    ],
    priya: [
      { label: 'Window seal replaced', when: '2 months ago' },
      { label: 'EICR inspection', when: '8 months ago' },
    ],
    tom: [{ label: 'Move-in inspection', when: '4 months ago' }],
    dana: [
      { label: 'AC filter swap', when: 'next week' },
      { label: 'Quarterly inspection', when: '3 months ago' },
    ],
    sam: [{ label: 'Lock change', when: '5 months ago' }],
    ava: [{ label: 'Damp survey', when: '1 month ago' }],
    hannah: [
      { label: 'EICR inspection', when: '2 weeks ago' },
      { label: 'Smoke alarm test', when: '4 months ago' },
    ],
    leo: [{ label: 'Emergency lighting test', when: '3 weeks ago' }],
  };

  window.TENANT = { PROPS, TENANTS, THREADS, SUGGESTIONS, QUEUE, HISTORY, fromStore };
})();
