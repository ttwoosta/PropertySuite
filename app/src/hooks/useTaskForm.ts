// State machine hook for maintenance task form submissions.
import { useState } from 'react';
import type { TaskFormData } from '../apps/maintenance/data';

export type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseTaskFormParams {
  saveTask?: (data: TaskFormData) => Promise<void>;
  deleteTask?: (id: string) => Promise<void>;
}

async function runSave(
  fn: () => Promise<void>,
  setStatus: (s: SaveStatus) => void,
): Promise<boolean> {
  setStatus('loading');
  try {
    await fn();
    setStatus('success');
    return true;
  } catch {
    setStatus('error');
    return false;
  }
}

export function useTaskForm({ saveTask, deleteTask }: UseTaskFormParams = {}) {
  const [status, setStatus] = useState<SaveStatus>('idle');

  return {
    status,
    busy: status === 'loading',
    submit: (data: TaskFormData) =>
      runSave(() => (saveTask ? saveTask(data) : Promise.resolve()), setStatus),
    remove: (id: string) =>
      runSave(() => (deleteTask ? deleteTask(id) : Promise.resolve()), setStatus),
  };
}
