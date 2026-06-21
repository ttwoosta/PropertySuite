// TenantBridge — mock data (port of tenant-data.js).
export interface TenantProp {
  id: string;
  name: string;
  color: string;
}

export const PROPS: TenantProp[] = [
  { id: 'elm', name: '14 Elm Road', color: 'var(--green-500)' },
  { id: 'birch', name: '8 Birch Lane', color: 'var(--amber-400)' },
];

export interface Tenant {
  id: string;
  name: string;
  unit: string;
  prop: string;
  score: number;
  lastContact: number;
  style: string;
  payment: string;
  preferTime: string;
}

export const TENANTS: Tenant[] = [
  { id: 'marcus', name: 'Marcus Bell', unit: 'Room 1', prop: 'elm', score: 5, lastContact: 2,
    style: 'Direct, brief replies', payment: 'On time, monthly', preferTime: 'Evenings after 6pm' },
  { id: 'priya', name: 'Priya Shah', unit: 'Room 2', prop: 'elm', score: 5, lastContact: 7,
    style: 'Friendly, prefers texts', payment: 'Pays in two halves', preferTime: 'Lunch hours' },
  { id: 'tom', name: 'Tom Reilly', unit: 'Room 3', prop: 'elm', score: 3, lastContact: 21,
    style: 'Formal email tone', payment: 'Often 1–2 days late', preferTime: 'Weekday mornings' },
  { id: 'dana', name: 'Dana Okafor', unit: 'Room 1', prop: 'birch', score: 5, lastContact: 4,
    style: 'Warm, conversational', payment: 'Standing order, on time', preferTime: 'Anytime' },
  { id: 'sam', name: 'Sam Lin', unit: 'Room 2', prop: 'birch', score: 4, lastContact: 12,
    style: 'Short bullet points', payment: 'Reliable', preferTime: 'After 5pm' },
  { id: 'ava', name: 'Ava Moreno', unit: 'Room 3', prop: 'birch', score: 4, lastContact: 6,
    style: 'Likes detail and context', payment: 'Reliable', preferTime: 'Lunch' },
];

export type Channel = 'sms' | 'email' | 'note';

export interface Message {
  id: string;
  who: 'them' | 'you' | 'note';
  channel?: Channel;
  text: string;
  when: string;
  aiDrafted?: boolean;
}

export const THREADS: Record<string, Message[]> = {
  marcus: [
    { id: 'm1', who: 'them', channel: 'sms', text: 'Hi — boiler’s making a knocking sound when the heating kicks in. Not urgent but wanted to flag.', when: 'Tue 10:24' },
    { id: 'm2', who: 'you', channel: 'sms', text: 'Thanks Marcus. I’ll get our engineer booked in this week and confirm a time.', when: 'Tue 11:02' },
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

export interface Suggestion {
  id: string;
  tenant: string;
  source: string;
  tone: 'Friendly' | 'Reminder' | 'Informational';
  trigger: string;
  draft: string;
}

export const SUGGESTIONS: Suggestion[] = [
  { id: 's1', tenant: 'marcus', source: 'Maintenance Scheduler', tone: 'Reminder',
    trigger: 'Boiler service is due in 2 days — Marcus reported the issue last week.',
    draft: "Hi Marcus — quick heads up, the engineer is booked for Thursday between 9 and 11am for the boiler service. They'll knock and announce themselves. Let me know if that doesn't work and I'll move it. Thanks!" },
  { id: 's2', tenant: 'priya', source: 'Rent Tracker', tone: 'Friendly',
    trigger: 'Priya’s rent is due in 3 days and her standing order reference changed.',
    draft: "Hey Priya — just a friendly reminder that rent’s due on the 1st. Your standing order should pull as usual, but let me know if anything looks off on your end. Cheers!" },
  { id: 's3', tenant: 'dana', source: 'Maintenance Scheduler', tone: 'Informational',
    trigger: 'Dana flagged the AC unit; quarterly filter swap is upcoming.',
    draft: "Hi Dana — thanks for flagging the AC. I’ll swap the filter on the quarterly visit next week and check the fan housing while I’m there. I’ll text the day before so you can plan around it." },
];

export interface QueueItem {
  id: string;
  date: { mon: string; day: number };
  tenant: string;
  channel: Channel;
  title: string;
  countdown: string;
}

export const QUEUE: QueueItem[] = [
  { id: 'q1', date: { mon: 'JUN', day: 24 }, tenant: 'priya', channel: 'email', title: 'Monthly rent reminder', countdown: 'in 3 days' },
  { id: 'q2', date: { mon: 'JUN', day: 26 }, tenant: 'marcus', channel: 'sms', title: 'Boiler service confirmation', countdown: 'in 5 days' },
  { id: 'q3', date: { mon: 'JUL', day: 2 }, tenant: 'dana', channel: 'sms', title: 'AC filter swap notice', countdown: 'in 11 days' },
  { id: 'q4', date: { mon: 'JUL', day: 14 }, tenant: 'tom', channel: 'email', title: 'Lease renewal options', countdown: 'in 23 days' },
];

export interface HistoryItem {
  label: string;
  when: string;
}

export const HISTORY: Record<string, HistoryItem[]> = {
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
};
