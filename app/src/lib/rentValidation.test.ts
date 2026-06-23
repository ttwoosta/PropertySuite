import { describe, it, expect } from 'vitest';
import {
  validateHouseForm,
  validateRoomForm,
  isRoomFormValid,
  validateRentEntryForm,
  isRentEntryFormValid,
} from './rentValidation';

// ── validateHouseForm ─────────────────────────────────────────────────────────

describe('validateHouseForm', () => {
  it('fails when rent is 0', () => {
    expect(validateHouseForm(0).ok).toBe(false);
  });

  it('fails when rent is negative', () => {
    expect(validateHouseForm(-100).ok).toBe(false);
  });

  it('passes when rent is positive', () => {
    const r = validateHouseForm(600);
    expect(r.ok).toBe(true);
    expect(r.error).toBeNull();
  });

  it('returns a non-null error message when invalid', () => {
    expect(validateHouseForm(0).error).toBeTruthy();
  });
});

// ── validateRoomForm ──────────────────────────────────────────────────────────

describe('validateRoomForm', () => {
  const valid = { name: 'Room 1', renter: 'Alice', rent: 500, occupied: true };

  it('returns all nulls for a valid occupied room', () => {
    const e = validateRoomForm(valid);
    expect(isRoomFormValid(e)).toBe(true);
  });

  it('flags name when blank', () => {
    const e = validateRoomForm({ ...valid, name: '  ' });
    expect(e.name).toBe('Room name is required.');
    expect(e.renter).toBeNull();
    expect(e.rent).toBeNull();
  });

  it('flags renter when occupied and blank', () => {
    const e = validateRoomForm({ ...valid, renter: '' });
    expect(e.renter).toBe('A renter is required for occupied rooms.');
  });

  it('does not flag renter when vacant and blank', () => {
    const e = validateRoomForm({ ...valid, renter: '', occupied: false });
    expect(e.renter).toBeNull();
  });

  it('flags rent when zero', () => {
    const e = validateRoomForm({ ...valid, rent: 0 });
    expect(e.rent).toBe('Enter the monthly rent.');
  });

  it('can return multiple errors at once', () => {
    const e = validateRoomForm({ name: '', renter: '', rent: 0, occupied: true });
    expect(isRoomFormValid(e)).toBe(false);
    expect(e.name).toBeTruthy();
    expect(e.renter).toBeTruthy();
    expect(e.rent).toBeTruthy();
  });

  it('returns valid for a vacant room with no renter', () => {
    const e = validateRoomForm({ name: 'Room 4', renter: '', rent: 600, occupied: false });
    expect(isRoomFormValid(e)).toBe(true);
  });
});

// ── validateRentEntryForm ─────────────────────────────────────────────────────

describe('validateRentEntryForm', () => {
  const valid = { renter: 'Bob', amountDue: 640 };

  it('returns all nulls for valid data', () => {
    const e = validateRentEntryForm(valid);
    expect(isRentEntryFormValid(e)).toBe(true);
  });

  it('flags renter when blank', () => {
    const e = validateRentEntryForm({ ...valid, renter: '' });
    expect(e.renter).toBe('Renter is required.');
  });

  it('flags renter when only whitespace', () => {
    const e = validateRentEntryForm({ ...valid, renter: '   ' });
    expect(e.renter).toBeTruthy();
  });

  it('flags due when zero', () => {
    const e = validateRentEntryForm({ ...valid, amountDue: 0 });
    expect(e.due).toBe('Enter the amount due.');
  });

  it('flags due when negative', () => {
    const e = validateRentEntryForm({ ...valid, amountDue: -1 });
    expect(e.due).toBeTruthy();
  });

  it('can return multiple errors at once', () => {
    const e = validateRentEntryForm({ renter: '', amountDue: 0 });
    expect(isRentEntryFormValid(e)).toBe(false);
  });
});
