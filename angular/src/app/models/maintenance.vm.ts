/** View model for a maintenance task (UI-ready, with computed fields). */
export interface PrepItemVm {
  id: string;
  label: string;
  done: boolean;
  photo?: string;
}

export interface TaskVm {
  id: string;
  name: string;
  icon: string;
  tint: string;
  property: string;
  /** Days relative to today: negative = overdue, 0 = today, positive = future. */
  dueInDays: number;
  recurrence: 'Weekly' | 'Monthly' | 'Quarterly';
  durationMin: number;
  bucket: 'Quick' | 'Long';
  done: boolean;
  prep: PrepItemVm[];
  startDate?: string;
  completedAt?: Date | null;
  status: TaskStatus;
}

export type TaskStatus = 'overdue' | 'soon' | 'upcoming' | 'done';

export interface TaskFormData {
  id?: string;
  name: string;
  icon: string;
  tint: string;
  durationMin: number;
  bucket: 'Quick' | 'Long';
  recurrence: 'Weekly' | 'Monthly' | 'Quarterly';
  property: string;
  dueInDays: number;
  startDate?: string;
}

export interface Property {
  id: string;
  name: string;
  short: string;
  color: string;
}

export interface TintOption {
  id: string;
  value: string;
}

export interface HistoryEntryVm {
  id: string;
  name: string;
  icon: string;
  tint: string;
  property: string;
  recurrence: 'Weekly' | 'Monthly' | 'Quarterly';
  durationMin: number;
  daysAgo: number;
  by: string;
  live?: boolean;
}
