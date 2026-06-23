import { describe, it, expect } from 'vitest';
import { validateTaskForm } from './maintenanceValidation';

describe('validateTaskForm', () => {
  it('passes when name is non-empty', () => {
    const r = validateTaskForm({ name: 'Boiler service' });
    expect(r.ok).toBe(true);
    expect(r.error).toBeNull();
  });

  it('fails when name is empty', () => {
    expect(validateTaskForm({ name: '' }).ok).toBe(false);
  });

  it('fails when name is only whitespace', () => {
    const r = validateTaskForm({ name: '   ' });
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  it('passes when name has leading/trailing whitespace but content', () => {
    expect(validateTaskForm({ name: '  Boiler service  ' }).ok).toBe(true);
  });
});
