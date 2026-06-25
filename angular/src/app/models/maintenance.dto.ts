import { Timestamp } from 'firebase/firestore';

/** Firestore document shape for the 'users/{uid}/tasks' collection. */
export interface TaskDto {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly tint: string;
  readonly property: string;
  /** Stored as absolute epoch ms; converted to dueInDays in the VM. */
  readonly dueDateMs: number;
  readonly recurrence: 'Weekly' | 'Monthly' | 'Quarterly';
  readonly durationMin: number;
  readonly bucket: 'Quick' | 'Long';
  readonly done: boolean;
  readonly prep: PrepItemDto[];
  readonly startDate?: string;
  readonly completedAt?: Timestamp | null;
}

export interface PrepItemDto {
  readonly id: string;
  readonly label: string;
  readonly done: boolean;
  readonly photo?: string;
}
