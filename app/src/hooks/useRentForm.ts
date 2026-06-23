// State machine hook for rent form submissions.
// Accepts async save functions as params so each form component stays thin
// and tests can inject vi.fn() without touching Firestore.
import { useState } from 'react';
import type { Room } from '../apps/rent/data';

export type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseRentFormParams {
  saveHouse?: (data: { address: string; rooms: number; rent: number }) => Promise<void>;
  saveRoom?: (room: Room) => Promise<void>;
  saveRentEntry?: (room: Room) => Promise<void>;
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

export function useRentForm({
  saveHouse,
  saveRoom,
  saveRentEntry,
}: UseRentFormParams = {}) {
  const [status, setStatus] = useState<SaveStatus>('idle');

  return {
    status,
    busy: status === 'loading',
    submitHouse: (data: { address: string; rooms: number; rent: number }) =>
      runSave(() => (saveHouse ? saveHouse(data) : Promise.resolve()), setStatus),
    submitRoom: (room: Room) =>
      runSave(() => (saveRoom ? saveRoom(room) : Promise.resolve()), setStatus),
    submitRentEntry: (room: Room) =>
      runSave(() => (saveRentEntry ? saveRentEntry(room) : Promise.resolve()), setStatus),
  };
}
