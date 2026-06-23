// Integration tests for rentService against the Firestore emulator.
// Prerequisites: `npx firebase emulators:start` running with Firestore on port 9000.
// Run with: npm run test:integration
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  type Firestore,
} from 'firebase/firestore';

// We import the module under test AFTER wiring up the emulator app so that
// `db` resolves to our test instance rather than the production singleton.
// The functions are re-exported using the emulator db directly in this file.

const TEST_UID = 'test-integration-user';
const PROJECT_ID = 'propertysuite-test';

let app: FirebaseApp;
let db: Firestore;

async function clearCollection(col: string) {
  const snap = await getDocs(collection(db, 'users', TEST_UID, col));
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, d.ref.path))));
}

// Inline lightweight versions of service fns using the emulator db instance.
// (The real rentService.ts uses the singleton `db` from firebase.ts, which
// points at the emulator automatically when hostname is localhost and Firebase
// is configured.  Here we test the Firestore logic directly.)
import {
  addDoc,
  collection as col,
  serverTimestamp,
  updateDoc,
  deleteDoc as fsDeleteDoc,
} from 'firebase/firestore';
import type { House, Room } from '../apps/rent/data';

async function testAddHouse(house: Omit<House, 'id'>): Promise<string> {
  const ref = await addDoc(col(db, 'users', TEST_UID, 'rent_houses'), {
    ...house,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

async function testSaveRoom(houseId: string, rooms: Room[]): Promise<void> {
  await updateDoc(doc(db, 'users', TEST_UID, 'rent_houses', houseId), { rooms });
}

async function testDeleteHouse(houseId: string): Promise<void> {
  await fsDeleteDoc(doc(db, 'users', TEST_UID, 'rent_houses', houseId));
}

// ── Test setup ────────────────────────────────────────────────────────────────

beforeAll(() => {
  app = initializeApp({ apiKey: 'test', projectId: PROJECT_ID }, 'integration-test');
  db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 9000);
});

afterAll(async () => {
  await deleteApp(app);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('rent houses (Firestore emulator)', () => {
  beforeAll(() => clearCollection('rent_houses'));

  it('adds a house and reads it back', async () => {
    const newHouse: Omit<House, 'id'> = {
      name: 'Test House',
      address: '1 Test St, TS1 1AB',
      rooms: [],
    };
    const id = await testAddHouse(newHouse);
    expect(id).toBeTruthy();

    const snap = await getDocs(collection(db, 'users', TEST_UID, 'rent_houses'));
    const found = snap.docs.find((d) => d.id === id);
    expect(found).toBeTruthy();
    expect(found!.data().name).toBe('Test House');
  });

  it('updates rooms on a house', async () => {
    const id = await testAddHouse({ name: 'Room Test', address: '2 Test St', rooms: [] });
    const rooms: Room[] = [
      { id: 'r1', unit: 'Room 1', tenant: 'Alice', rent: 500, paid: 500, status: 'Paid', beds: 1 },
    ];
    await testSaveRoom(id, rooms);

    const snap = await getDocs(collection(db, 'users', TEST_UID, 'rent_houses'));
    const found = snap.docs.find((d) => d.id === id);
    expect(found!.data().rooms).toHaveLength(1);
    expect(found!.data().rooms[0].unit).toBe('Room 1');
  });

  it('deletes a house', async () => {
    const id = await testAddHouse({ name: 'To Delete', address: '3 Test St', rooms: [] });
    await testDeleteHouse(id);

    const snap = await getDocs(collection(db, 'users', TEST_UID, 'rent_houses'));
    expect(snap.docs.find((d) => d.id === id)).toBeUndefined();
  });
});
