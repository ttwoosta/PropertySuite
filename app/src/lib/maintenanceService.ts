// Maintenance Scheduler — ONLY file that imports firebase/firestore for the Maintenance domain.
// All functions are pure async I/O with no React or demo-mode logic.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, TaskFormData } from '../apps/maintenance/data';

// ── Firestore ↔ Task converters ───────────────────────────────────────────────

interface FirestoreTaskDoc extends Omit<Task, 'id' | 'dueInDays'> {
  dueDateMs: number;
}

export function taskToDoc(task: Task): FirestoreTaskDoc {
  const { id: _id, dueInDays, ...rest } = task;
  return { ...rest, dueDateMs: Date.now() + dueInDays * 86_400_000 };
}

export function docToTask(id: string, data: FirestoreTaskDoc): Task {
  const { dueDateMs, ...rest } = data;
  return {
    ...rest,
    id,
    dueInDays: Math.round((dueDateMs - Date.now()) / 86_400_000),
  };
}

// ── Collection helpers ────────────────────────────────────────────────────────

function tasksCol(uid: string) { return collection(db!, 'users', uid, 'tasks'); }
function taskDoc(uid: string, id: string) { return doc(db!, 'users', uid, 'tasks', id); }

// ── Subscription ──────────────────────────────────────────────────────────────

export function subscribeTasksFS(
  uid: string,
  onData: (tasks: Task[]) => void,
): () => void {
  return onSnapshot(tasksCol(uid), (snap) =>
    onData(snap.docs.map((d) => docToTask(d.id, d.data() as FirestoreTaskDoc))),
  );
}

// ── Seeding ───────────────────────────────────────────────────────────────────

export async function seedTasksIfEmpty(uid: string, seedTasks: Task[]): Promise<void> {
  const snap = await getDocs(tasksCol(uid));
  if (!snap.empty) return;
  const batch = writeBatch(db!);
  seedTasks.forEach((t) => batch.set(doc(tasksCol(uid), t.id), taskToDoc(t)));
  await batch.commit();
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function saveTaskFS(uid: string, data: TaskFormData): Promise<void> {
  const { id, dueInDays, ...rest } = data;
  const firestoreFields = { ...rest, dueDateMs: Date.now() + dueInDays * 86_400_000 };
  if (id) {
    await updateDoc(taskDoc(uid, id), firestoreFields);
  } else {
    const newRef = doc(tasksCol(uid));
    await setDoc(newRef, { ...firestoreFields, done: false, prep: [] });
  }
}

export async function deleteTaskFS(uid: string, id: string): Promise<void> {
  await deleteDoc(taskDoc(uid, id));
}

export async function updateTaskFieldsFS(
  uid: string,
  id: string,
  fields: Partial<Omit<Task, 'id'>>,
): Promise<void> {
  await updateDoc(taskDoc(uid, id), fields);
}
