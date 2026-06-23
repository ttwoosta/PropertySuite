import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskForm } from './useTaskForm';
import type { TaskFormData } from '../apps/maintenance/data';

const mockTaskData: TaskFormData = {
  name: 'Boiler service',
  icon: 'flame',
  tint: 'var(--amber-400)',
  durationMin: 45,
  bucket: 'long',
  recurrence: 'Monthly',
  property: 'elm',
  dueInDays: 14,
};

// ── submit ────────────────────────────────────────────────────────────────────

describe('useTaskForm — submit', () => {
  it('transitions idle → success on a resolved save', async () => {
    const saveTask = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useTaskForm({ saveTask }));

    expect(result.current.status).toBe('idle');

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submit(mockTaskData);
    });

    expect(ok!).toBe(true);
    expect(result.current.status).toBe('success');
    expect(saveTask).toHaveBeenCalledWith(mockTaskData);
  });

  it('transitions to error when saveTask rejects', async () => {
    const saveTask = vi.fn().mockRejectedValue(new Error('Firestore error'));
    const { result } = renderHook(() => useTaskForm({ saveTask }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submit(mockTaskData);
    });

    expect(ok!).toBe(false);
    expect(result.current.status).toBe('error');
  });

  it('resolves with true when no saveTask provided (no-op)', async () => {
    const { result } = renderHook(() => useTaskForm());

    let ok: boolean;
    await act(async () => {
      ok = await result.current.submit(mockTaskData);
    });

    expect(ok!).toBe(true);
  });

  it('sets busy=true while loading', async () => {
    let resolveFn!: () => void;
    const saveTask = vi.fn().mockReturnValue(new Promise<void>((r) => { resolveFn = r; }));
    const { result } = renderHook(() => useTaskForm({ saveTask }));

    act(() => { void result.current.submit(mockTaskData); });
    expect(result.current.busy).toBe(true);

    await act(async () => { resolveFn(); });
    expect(result.current.busy).toBe(false);
  });
});

// ── remove ────────────────────────────────────────────────────────────────────

describe('useTaskForm — remove', () => {
  it('calls deleteTask with the id and returns true', async () => {
    const deleteTask = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useTaskForm({ deleteTask }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.remove('t1');
    });

    expect(ok!).toBe(true);
    expect(deleteTask).toHaveBeenCalledWith('t1');
  });

  it('returns false when deleteTask rejects', async () => {
    const deleteTask = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useTaskForm({ deleteTask }));

    let ok: boolean;
    await act(async () => {
      ok = await result.current.remove('t1');
    });

    expect(ok!).toBe(false);
    expect(result.current.status).toBe('error');
  });
});
