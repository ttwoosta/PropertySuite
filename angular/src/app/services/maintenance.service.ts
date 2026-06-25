import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  writeBatch,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, from, of, catchError, map } from 'rxjs';
import { TaskDto, PrepItemDto } from '../models/maintenance.dto';
import { TaskVm, TaskStatus, TaskFormData } from '../models/maintenance.vm';

export const PROPERTIES = [
  { id: 'elm',   name: 'Elm Road',   short: 'ELM', color: '#4FAE86' },
  { id: 'birch', name: 'Birch Lane', short: 'BCH', color: '#3E78B8' },
  { id: 'park',  name: 'Park View',  short: 'PRK', color: '#E8852B' },
];

export const ICONS = ['wrench', 'flame', 'droplets', 'zap', 'thermometer', 'fan',
  'leaf', 'shield', 'paint-bucket', 'trash-2', 'wind', 'bug'];

export const TINTS = [
  { id: 'green',  value: '#2D6A4F' },
  { id: 'blue',   value: '#2C5C92' },
  { id: 'amber',  value: '#D2731C' },
  { id: 'red',    value: '#D23A40' },
  { id: 'purple', value: '#6B4E9B' },
];

const SEED_TASKS: Omit<TaskDto, 'id'>[] = [
  { name: 'Boiler service',      icon: 'flame',       tint: '#D2731C', property: 'elm',   dueDateMs: Date.now() - 2 * 86400000,  recurrence: 'Quarterly', durationMin: 90,  bucket: 'Long',  done: false, prep: [] },
  { name: 'Smoke alarm test',    icon: 'shield',      tint: '#D23A40', property: 'birch', dueDateMs: Date.now() - 1 * 86400000,  recurrence: 'Monthly',   durationMin: 30,  bucket: 'Quick', done: false, prep: [] },
  { name: 'Gutters clean',       icon: 'leaf',        tint: '#2D6A4F', property: 'elm',   dueDateMs: Date.now() + 3 * 86400000,  recurrence: 'Quarterly', durationMin: 120, bucket: 'Long',  done: false, prep: [] },
  { name: 'Garden tidy',         icon: 'leaf',        tint: '#2D6A4F', property: 'park',  dueDateMs: Date.now() + 7 * 86400000,  recurrence: 'Monthly',   durationMin: 60,  bucket: 'Quick', done: false, prep: [] },
  { name: 'Electric check',      icon: 'zap',         tint: '#2C5C92', property: 'elm',   dueDateMs: Date.now() + 14 * 86400000, recurrence: 'Quarterly', durationMin: 45,  bucket: 'Quick', done: false, prep: [] },
  { name: 'Window seal',         icon: 'wind',        tint: '#2D6A4F', property: 'birch', dueDateMs: Date.now() + 21 * 86400000, recurrence: 'Quarterly', durationMin: 75,  bucket: 'Long',  done: false, prep: [] },
  { name: 'Pest inspection',     icon: 'bug',         tint: '#8F4E12', property: 'park',  dueDateMs: Date.now() + 30 * 86400000, recurrence: 'Quarterly', durationMin: 60,  bucket: 'Long',  done: false, prep: [] },
  { name: 'Paint touch-up',      icon: 'paint-bucket',tint: '#6B4E9B', property: 'elm',   dueDateMs: Date.now() + 45 * 86400000, recurrence: 'Quarterly', durationMin: 180, bucket: 'Long',  done: true,  prep: [] },
];

function statusOf(dueInDays: number, done: boolean): TaskStatus {
  if (done) return 'done';
  if (dueInDays < 0) return 'overdue';
  if (dueInDays <= 7) return 'soon';
  return 'upcoming';
}

function dtoToVm(dto: TaskDto): TaskVm {
  const dueInDays = Math.round((dto.dueDateMs - Date.now()) / 86400000);
  return {
    ...dto,
    dueInDays,
    completedAt: dto.completedAt ? dto.completedAt.toDate() : null,
    prep: dto.prep ?? [],
    status: statusOf(dueInDays, dto.done),
  };
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private firestore = inject(Firestore);

  getTasks(uid: string): Observable<TaskVm[]> {
    const col = collection(this.firestore, `users/${uid}/tasks`);
    return (collectionData(col, { idField: 'id' }) as Observable<TaskDto[]>).pipe(
      map((docs) => docs.map(dtoToVm)),
      catchError(() => of([])),
    );
  }

  async seedIfEmpty(uid: string): Promise<void> {
    const col = collection(this.firestore, `users/${uid}/tasks`);
    const snap = await getDocs(col);
    if (!snap.empty) return;
    const batch = writeBatch(this.firestore);
    for (const task of SEED_TASKS) {
      batch.set(doc(col), task);
    }
    await batch.commit();
  }

  async saveTask(uid: string, data: TaskFormData): Promise<void> {
    const col = collection(this.firestore, `users/${uid}/tasks`);
    const dueDateMs = Date.now() + data.dueInDays * 86400000;
    const payload: Omit<TaskDto, 'id'> = {
      name: data.name,
      icon: data.icon,
      tint: data.tint,
      property: data.property,
      dueDateMs,
      recurrence: data.recurrence,
      durationMin: data.durationMin,
      bucket: data.bucket,
      done: false,
      prep: [],
      ...(data.startDate ? { startDate: data.startDate } : {}),
    };
    if (data.id) {
      await setDoc(doc(col, data.id), { ...payload, dueDateMs }, { merge: true });
    } else {
      await setDoc(doc(col), payload);
    }
  }

  async deleteTask(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `users/${uid}/tasks/${id}`));
  }

  async toggleDone(uid: string, id: string, done: boolean): Promise<void> {
    await updateDoc(doc(this.firestore, `users/${uid}/tasks/${id}`), {
      done,
      completedAt: done ? serverTimestamp() : null,
    });
  }

  async updatePrepItem(uid: string, taskId: string, prep: PrepItemDto[]): Promise<void> {
    await updateDoc(doc(this.firestore, `users/${uid}/tasks/${taskId}`), { prep });
  }
}
