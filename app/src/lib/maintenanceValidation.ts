// Pure validation functions for maintenance forms — no imports, no side effects.

export function validateTaskForm(data: { name: string }): { ok: boolean; error: string | null } {
  if (!data.name.trim()) return { ok: false, error: 'Task name is required.' };
  return { ok: true, error: null };
}
