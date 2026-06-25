/** View models for the TenantBridge feature. */

export type Channel = 'sms' | 'email' | 'note';

export interface TenantProp {
  id: string;
  name: string;
  color: string;
}

export interface TenantVm {
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

export interface MessageVm {
  id: string;
  tenantId: string;
  who: 'them' | 'you' | 'note';
  channel?: Channel;
  text: string;
  when: Date;
  aiDrafted?: boolean;
}

export interface Suggestion {
  id: string;
  tenant: string;
  source: string;
  tone: 'Friendly' | 'Reminder' | 'Informational';
  trigger: string;
  draft: string;
}

export interface QueueItem {
  id: string;
  date: { mon: string; day: string };
  tenant: string;
  channel: Channel;
  title: string;
  countdown: string;
}

export interface HistoryItem {
  label: string;
  when: string;
}
