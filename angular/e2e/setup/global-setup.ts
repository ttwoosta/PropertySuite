import { FullConfig } from '@playwright/test';

const PROJECT_ID = 'rental-manager-bc6ba';
const AUTH_EMULATOR = 'http://localhost:9099';
const FIRESTORE_EMULATOR = 'http://localhost:9000';
const FIRESTORE_BASE = `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const TEST_EMAIL = 'demo@example.com';
const TEST_PASSWORD = 'password';

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

/** Creates the test user in the Auth emulator and returns their UID. */
async function setupAuthUser(): Promise<string> {
  // Clear all existing users so each run starts clean
  try {
    await fetch(`${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`, {
      method: 'DELETE',
    });
  } catch { /* emulator may not be running */ }

  // Sign up the test user and capture the assigned UID
  try {
    const res = await fetch(
      `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          returnSecureToken: true,
        }),
      }
    );
    if (!res.ok) return 'demo-user';
    const data = await res.json() as { localId?: string };
    return data.localId ?? 'demo-user';
  } catch {
    return 'demo-user';
  }
}

async function clearUserCollections(uid: string): Promise<void> {
  for (const col of ['tasks', 'rent_houses', 'rent_receipts', 'rent_entries']) {
    try {
      const res = await fetch(`${FIRESTORE_BASE}/users/${uid}/${col}?pageSize=100`);
      if (!res.ok) continue;
      const data = await res.json() as { documents?: Array<{ name: string }> };
      const docs = data.documents ?? [];
      await Promise.all(docs.map((d) =>
        // d.name is "projects/.../databases/.../documents/..." — prefix with emulator host
        fetch(`${FIRESTORE_EMULATOR}/v1/${d.name}`, { method: 'DELETE' })
      ));
    } catch { /* ignore */ }
  }
}

async function seedCollection(uid: string, col: string, docs: Record<string, unknown>[]): Promise<void> {
  for (const docData of docs) {
    const payload = { ...docData };
    if ('dueDateMs' in payload && payload['dueDateMs'] === 0) {
      payload['dueDateMs'] = Date.now() - 2 * 86400000;
    }
    try {
      await fetch(`${FIRESTORE_BASE}/users/${uid}/${col}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreFields(payload) }),
      });
    } catch { /* ignore if emulator not running */ }
  }
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  let uid = 'demo-user';
  try {
    uid = await setupAuthUser();
    console.log(`[E2E globalSetup] Auth user created with uid: ${uid}`);
  } catch {
    console.warn('[E2E globalSetup] Could not set up Auth user — running without auth seed.');
  }

  try {
    const tasks = (await import('../fixtures/tasks.json', { with: { type: 'json' } })).default;
    const houses = (await import('../fixtures/houses.json', { with: { type: 'json' } })).default;

    await clearUserCollections(uid);
    await seedCollection(uid, 'tasks', tasks as Record<string, unknown>[]);
    await seedCollection(uid, 'rent_houses', houses as Record<string, unknown>[]);
    console.log(`[E2E globalSetup] Firestore seeded under users/${uid}`);
  } catch {
    console.warn('[E2E globalSetup] Could not seed Firestore emulator — running without seed data.');
  }
}
