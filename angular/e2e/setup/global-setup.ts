import { FullConfig } from '@playwright/test';

const PROJECT_ID = 'demo-test';
const FIRESTORE_BASE = `http://localhost:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val: unknown): Record<string, unknown> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean')  return { booleanValue: val };
  if (typeof val === 'number')   return { doubleValue: val };
  if (typeof val === 'string')   return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

async function clearCollection(collection: string): Promise<void> {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/${collection}?pageSize=100`);
    if (!res.ok) return;
    const data = await res.json() as { documents?: Array<{ name: string }> };
    const docs = data.documents ?? [];
    await Promise.all(docs.map((d) =>
      fetch(`https://firestore.googleapis.com/v1/${d.name}`, { method: 'DELETE' })
    ));
  } catch { /* emulator may not be running in all environments */ }
}

async function seedCollection(collection: string, docs: Record<string, unknown>[]): Promise<void> {
  for (const doc of docs) {
    // Expand dueDateMs relative to now if 0
    const payload = { ...doc };
    if ('dueDateMs' in payload && payload['dueDateMs'] === 0) {
      payload['dueDateMs'] = Date.now() - 2 * 86400000;
    }
    try {
      await fetch(`${FIRESTORE_BASE}/users/demo-user/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreFields(payload) }),
      });
    } catch { /* ignore if emulator not running */ }
  }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  // Dynamically import fixtures to avoid issues if files missing
  try {
    const tasks = (await import('../fixtures/tasks.json', { assert: { type: 'json' } })).default;
    const houses = (await import('../fixtures/houses.json', { assert: { type: 'json' } })).default;

    await clearCollection('tasks');
    await clearCollection('rent_houses');
    await seedCollection('tasks', tasks as Record<string, unknown>[]);
    await seedCollection('rent_houses', houses as Record<string, unknown>[]);
  } catch {
    // If fixtures are missing or emulator is not up, proceed silently
    console.warn('[E2E globalSetup] Could not seed Firestore emulator — running without seed data.');
  }
}
