// Firebase wiring. Auth powers sign-in/up; Firebase AI Logic (Gemini) powers the
// TenantBridge AI assistant. Config comes from Vite env vars (see .env.example).
//
// If the project isn't configured yet (placeholder scaffold), `firebaseConfigured`
// is false and the app falls back to a local demo auth so the whole flow still runs.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  type GenerativeModel,
} from 'firebase/ai';
import { connectStorageEmulator, FirebaseStorage, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** True when real Firebase credentials are present. Drives auth + AI behaviour. */
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  storageInstance = getStorage(app);

  dbInstance = getFirestore(app);

  const useEmulator =
    import.meta.env.VITE_USE_EMULATOR === 'true' ||
    (typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) &&
      import.meta.env.VITE_USE_EMULATOR !== 'false');

  if (useEmulator) {
    connectFirestoreEmulator(dbInstance, '127.0.0.1', 9000);
    connectAuthEmulator(authInstance, 'http://127.0.0.1:9099', { disableWarnings: false });
    connectStorageEmulator(storageInstance, '127.0.0.1', 9199);
  }
}


export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

let model: GenerativeModel | null = null;
/** Lazily create the Gemini model via Firebase AI Logic. Throws if not configured. */
export function getGeminiModel(): GenerativeModel {
  if (!firebaseConfigured || !app) {
    throw new Error('Firebase AI Logic is not configured. Add your Firebase env vars.');
  }
  if (!model) {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
  }
  return model;
}
