// Firebase wiring. Auth powers sign-in/up; Firebase AI Logic (Gemini) powers the
// TenantBridge AI assistant. Config comes from Vite env vars (see .env.example).
//
// If the project isn't configured yet (placeholder scaffold), `firebaseConfigured`
// is false and the app falls back to a local demo auth so the whole flow still runs.
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  type GenerativeModel,
} from 'firebase/ai';

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

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

export const auth = authInstance;

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
