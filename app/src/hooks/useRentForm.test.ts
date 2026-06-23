import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRentForm } from './useRentForm';
import type { Room } from '../apps/rent/data';

const mockRoom: Room = {
  id: 'r1',
  unit: 'Room 1',
  tenant: 'Alice',
  rent: 600,
  paid: 600,
  status: 'Paid',
  beds: 1,
};

// ── submitHouse ───────────────────────────────────────────────────────────────

describe('useRentForm — submitHouse', () => {
  it('transitions idle → loading → success on a resolved save', async () => {
    const saveHouse = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRentForm({ saveHouse }));

    expect(result.current.status).toBe('idle');

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submitHouse({ address: '1 Test St', rooms: 3, rent: 600 });
    });

    expect(ok!).toBe(true);
    expect(result.current.status).toBe('success');
    expect(saveHouse).toHaveBeenCalledWith({ address: '1 Test St', rooms: 3, rent: 600 });
  });

  it('transitions to error when saveHouse rejects', async () => {
    const saveHouse = vi.fn().mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useRentForm({ saveHouse }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submitHouse({ address: '1 Test St', rooms: 3, rent: 600 });
    });

    expect(ok!).toBe(false);
    expect(result.current.status).toBe('error');
  });

  it('resolves with true and busy=false when no saveHouse is provided', async () => {
    const { result } = renderHook(() => useRentForm());

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submitHouse({ address: '', rooms: 1, rent: 0 });
    });

    expect(ok!).toBe(true);
    expect(result.current.busy).toBe(false);
  });
});

// ── submitRoom ────────────────────────────────────────────────────────────────

describe('useRentForm — submitRoom', () => {
  it('calls saveRoom with the room and returns true on success', async () => {
    const saveRoom = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRentForm({ saveRoom }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submitRoom(mockRoom);
    });

    expect(ok!).toBe(true);
    expect(saveRoom).toHaveBeenCalledWith(mockRoom);
  });

  it('returns false when saveRoom rejects', async () => {
    const saveRoom = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useRentForm({ saveRoom }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submitRoom(mockRoom);
    });

    expect(ok!).toBe(false);
    expect(result.current.status).toBe('error');
  });
});

// ── submitRentEntry ───────────────────────────────────────────────────────────

describe('useRentForm — submitRentEntry', () => {
  it('calls saveRentEntry with the room and returns true on success', async () => {
    const saveRentEntry = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useRentForm({ saveRentEntry }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submitRentEntry(mockRoom);
    });

    expect(ok!).toBe(true);
    expect(saveRentEntry).toHaveBeenCalledWith(mockRoom);
  });
});
