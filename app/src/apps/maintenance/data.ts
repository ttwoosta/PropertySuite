// Maintenance Scheduler — types, seed data, pure helpers, and Firestore-backed hook.
// All raw Firestore I/O lives in src/lib/maintenanceService.ts.
import { useEffect, useState } from 'react';
import { firebaseConfigured } from '../../lib/firebase';
import {
  subscribeTasksFS,
  saveTaskFS,
  deleteTaskFS,
  updateTaskFieldsFS,
} from '../../lib/maintenanceService';
//
// Firestore path: users/{uid}/tasks/{taskId}
export interface Property {
  id: string;
  name: string;
  short: string;
  color: string;
}

export interface PrepItem {
  id: number;
  label: string;
  done: boolean;
  photo?: string;
}

export type Recurrence = 'Weekly' | 'Monthly' | 'Quarterly';
export type Bucket = 'quick' | 'long';
export type TaskStatus = 'overdue' | 'soon' | 'upcoming' | 'done';

export interface Task {
  id: string;
  name: string;
  icon: string;
  tint: string;
  property: string;
  dueInDays: number;
  recurrence: Recurrence;
  durationMin: number;
  bucket: Bucket;
  done: boolean;
  prep: PrepItem[];
  startDate?: string;
  completedAt?: number | null;
}

export const PROPERTIES: Property[] = [
  { id: 'elm', name: '14 Elm Road', short: 'Elm Road', color: 'var(--green-500)' },
  { id: 'birch', name: '8 Birch Lane', short: 'Birch Lane', color: 'var(--amber-400)' },
  { id: 'park', name: 'Flat 2, Park View', short: 'Park View', color: 'var(--blue-400)' },
];

export const ICONS = [
  'flame', 'bell-ring', 'shield-check', 'zap', 'droplets', 'wind',
  'thermometer', 'lightbulb', 'bug', 'wrench', 'paint-roller', 'plug',
];

export interface Tint {
  id: string;
  value: string;
}
export const TINTS: Tint[] = [
  { id: 'green', value: 'var(--green-500)' },
  { id: 'amber', value: 'var(--amber-400)' },
  { id: 'red', value: 'var(--red-500)' },
  { id: 'blue', value: 'var(--blue-400)' },
  { id: 'slate', value: 'var(--gray-500)' },
];

const prep = (...labels: string[]): PrepItem[] =>
  labels.map((l, i) => ({ id: i, label: l, done: false }));

export const TASKS: Task[] = [
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

export function statusOf(t: Task): TaskStatus {
  if (t.done) return 'done';
  if (t.dueInDays < 0) return 'overdue';
  if (t.dueInDays <= 7) return 'soon';
  return 'upcoming';
}

export function dueLabel(d: number): string {
  if (d === 0) return 'Today';
  if (d < 0) return Math.abs(d) + (Math.abs(d) === 1 ? ' day ago' : ' days ago');
  return 'in ' + d + (d === 1 ? ' day' : ' days');
}

export interface HistoryEntry {
  id: string;
  name: string;
  icon: string;
  tint: string;
  property: string;
  recurrence: Recurrence;
  durationMin: number;
  daysAgo: number;
  by: string;
  live?: boolean;
}

export const HISTORY: HistoryEntry[] = [
  { id: 'h1', name: 'Boiler service', icon: 'flame', tint: 'var(--amber-400)', property: 'elm',
    recurrence: 'Monthly', durationMin: 45, daysAgo: 28, by: 'Gas-Safe engineer' },
  { id: 'h2', name: 'Smoke alarm test', icon: 'bell-ring', tint: 'var(--red-500)', property: 'elm',
    recurrence: 'Quarterly', durationMin: 15, daysAgo: 104, by: 'You' },
  { id: 'h3', name: 'Gutter clearing', icon: 'droplets', tint: 'var(--blue-400)', property: 'elm',
    recurrence: 'Quarterly', durationMin: 60, daysAgo: 71, by: 'Contractor' },
  { id: 'h4', name: 'Gas safety check', icon: 'shield-check', tint: 'var(--green-500)', property: 'birch',
    recurrence: 'Monthly', durationMin: 40, daysAgo: 26, by: 'Gas-Safe engineer' },
  { id: 'h5', name: 'AC filter swap', icon: 'wind', tint: 'var(--blue-400)', property: 'birch',
    recurrence: 'Monthly', durationMin: 10, daysAgo: 33, by: 'You' },
  { id: 'h6', name: 'Bleed radiators', icon: 'thermometer', tint: 'var(--amber-400)', property: 'birch',
    recurrence: 'Quarterly', durationMin: 25, daysAgo: 88, by: 'You' },
  { id: 'h7', name: 'EICR inspection', icon: 'zap', tint: 'var(--amber-400)', property: 'park',
    recurrence: 'Quarterly', durationMin: 90, daysAgo: 12, by: 'Electrician' },
  { id: 'h8', name: 'Emergency lighting test', icon: 'lightbulb', tint: 'var(--green-500)', property: 'park',
    recurrence: 'Monthly', durationMin: 20, daysAgo: 19, by: 'You' },
  { id: 'h9', name: 'Boiler service', icon: 'flame', tint: 'var(--amber-400)', property: 'elm',
    recurrence: 'Monthly', durationMin: 45, daysAgo: 58, by: 'Gas-Safe engineer' },
  { id: 'h10', name: 'AC filter swap', icon: 'wind', tint: 'var(--blue-400)', property: 'birch',
    recurrence: 'Monthly', durationMin: 10, daysAgo: 64, by: 'You' },
];

const MS_DAY = 86_400_000;

export function dateLabel(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * MS_DAY);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function agoLabel(daysAgo: number): string {
  if (daysAgo <= 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 14) return daysAgo + ' days ago';
  if (daysAgo < 60) return Math.round(daysAgo / 7) + ' weeks ago';
  return Math.round(daysAgo / 30) + ' months ago';
}

export function monthLabel(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * MS_DAY);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export const STATUS_TONE: Record<TaskStatus, 'danger' | 'warning' | 'neutral' | 'success'> = {
  overdue: 'danger',
  soon: 'warning',
  upcoming: 'neutral',
  done: 'success',
};

export interface TaskFormData {
  id?: string;
  name: string;
  icon: string;
  tint: string;
  durationMin: number;
  bucket: Bucket;
  recurrence: Recurrence;
  property: string;
  dueInDays: number;
  startDate?: string;
}

// ── useTasks hook ─────────────────────────────────────────────────────────────

export interface TaskActions {
  tasks: Task[];
  loading: boolean;
  toggleTask: (id: string) => void;
  togglePrep: (tid: string, pid: number) => void;
  addPrep: (tid: string, label: string) => void;
  updatePrep: (tid: string, pid: number, label: string) => void;
  removePrep: (tid: string, pid: number) => void;
  photoPrep: (tid: string, pid: number, photo: string) => void;
  saveTask: (data: TaskFormData) => void;
  deleteTask: (id: string) => void;
  setRecurrence: (id: string, rec: Recurrence, startDate?: string, property?: string) => void;
}

function seedTasksLocal(): Task[] {
  return TASKS.map((t) => ({ ...t, prep: t.prep.map((p) => ({ ...p })) }));
}

export function useTasks(uid: string | null): TaskActions {
  const [tasks, setTasks] = useState<Task[]>(() =>
    firebaseConfigured ? [] : seedTasksLocal(),
  );
  const [loading, setLoading] = useState(!!firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured || !uid) return;

    let cancelled = false;
    const unsub = subscribeTasksFS(uid, (data) => {
      if (!cancelled) { setTasks(data); setLoading(false); }
    });

    return () => { cancelled = true; unsub(); };
  }, [uid]);

  const toggleTask = (id: string) => {
    if (!firebaseConfigured || !uid) {
      setTasks((ts) => ts.map((t) => t.id === id
        ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null }
        : t));
      return;
    }
    const task = tasks.find((t) => t.id === id);
    if (task) void updateTaskFieldsFS(uid, id, { done: !task.done, completedAt: !task.done ? Date.now() : null });
  };

  const togglePrep = (tid: string, pid: number) => {
    const task = tasks.find((t) => t.id === tid);
    if (!task) { console.error('Task not found for togglePrep:', tid); return; }
    const newPrep = task.prep.map((p) => (p.id === pid ? { ...p, done: !p.done } : p));
    if (!firebaseConfigured || !uid) {
      setTasks((ts) => ts.map((t) => t.id === tid ? { ...t, prep: newPrep } : t));
      return;
    }
    void updateTaskFieldsFS(uid, tid, { prep: newPrep });
  };

  const addPrep = (tid: string, label: string) => {
    const task = tasks.find((t) => t.id === tid);
    if (!task) { console.error('Task not found for addPrep:', tid); return; }
    const newPrep = [...task.prep, { id: Date.now(), label, done: false }];
    setTasks((ts) => ts.map((t) => t.id === tid ? { ...t, prep: newPrep } : t));
    if (firebaseConfigured && uid) void updateTaskFieldsFS(uid, tid, { prep: newPrep });
  };

  const updatePrep = (tid: string, pid: number, label: string) => {
    const task = tasks.find((t) => t.id === tid);
    if (!task) { console.error('Task not found for updatePrep:', tid); return; }
    const newPrep = task.prep.map((p) => (p.id === pid ? { ...p, label } : p));
    setTasks((ts) => ts.map((t) => t.id === tid ? { ...t, prep: newPrep } : t));
    if (firebaseConfigured && uid) void updateTaskFieldsFS(uid, tid, { prep: newPrep });
  };

  const removePrep = (tid: string, pid: number) => {
    const task = tasks.find((t) => t.id === tid);
    if (!task) { console.error('Task not found for removePrep:', tid); return; }
    const newPrep = task.prep.filter((p) => p.id !== pid);
    setTasks((ts) => ts.map((t) => t.id === tid ? { ...t, prep: newPrep } : t));
    if (firebaseConfigured && uid) void updateTaskFieldsFS(uid, tid, { prep: newPrep });
  };

  const photoPrep = (tid: string, pid: number, photo: string) => {
    const task = tasks.find((t) => t.id === tid);
    if (!task) { console.error('Task not found for photoPrep:', tid); return; }
    const newPrep = task.prep.map((p) => (p.id === pid ? { ...p, photo } : p));
    setTasks((ts) => ts.map((t) => t.id === tid ? { ...t, prep: newPrep } : t));
    if (firebaseConfigured && uid) void updateTaskFieldsFS(uid, tid, { prep: newPrep });
  };

  const saveTask = (data: TaskFormData) => {
    if (!firebaseConfigured || !uid) {
      setTasks((ts) => {
        if (data.id) return ts.map((t) => (t.id === data.id ? { ...t, ...data } : t));
        return [...ts, { ...data, id: 'n' + Date.now(), done: false, prep: (data as Task).prep ?? [] } as Task];
      });
      return;
    }
    void saveTaskFS(uid, data);
  };

  const deleteTask = (id: string) => {
    if (!firebaseConfigured || !uid) {
      setTasks((ts) => ts.filter((t) => t.id !== id));
      return;
    }
    void deleteTaskFS(uid, id);
  };

  const setRecurrence = (id: string, rec: Recurrence, startDate?: string, property?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const update: Partial<Task> = { recurrence: rec };
    if (startDate !== undefined) {
      update.startDate = startDate;
      update.dueInDays = Math.round(
        (new Date(startDate + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) / 86_400_000,
      );
    }
    if (property) update.property = property;
    if (!firebaseConfigured || !uid) {
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...update } : t)));
      return;
    }
    void updateTaskFieldsFS(uid, id, update);
  };

  return { tasks, loading, toggleTask, togglePrep, addPrep, updatePrep, removePrep, photoPrep, saveTask, deleteTask, setRecurrence };
}
