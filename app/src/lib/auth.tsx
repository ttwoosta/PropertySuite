// Auth shell: resolving → signed-out → signed-in, backed by Firebase Auth when
// configured, or a local demo store otherwise (any email signs in — matching the
// prototype). Exposes a `useAuth()` hook for the router guard and app shells.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User as FbUser,
} from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase';

export interface SuiteUser {
  uid: string;
  email: string;
  name: string;
  initials: string;
}

export type AuthStatus = 'resolving' | 'out' | 'in';

interface AuthContextValue {
  status: AuthStatus;
  user: SuiteUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---- name/initials helpers (ported from the prototype's ps-common.js) ----
function deriveName(email: string): string {
  const local = String(email || '').split('@')[0] || 'You';
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'You'
  );
}
function initialsOf(name: string): string {
  const p = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}
function buildUser(uid: string, email: string, displayName?: string | null): SuiteUser {
  const name = displayName && displayName.trim() ? displayName.trim() : deriveName(email);
  return { uid, email, name, initials: initialsOf(name) };
}
function userFromFb(u: FbUser): SuiteUser {
  return buildUser(u.uid, u.email || 'you@example.com', u.displayName);
}

const DEMO_KEY = 'ps_auth_v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('resolving');
  const [user, setUser] = useState<SuiteUser | null>(null);

  useEffect(() => {
    if (firebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          setUser(userFromFb(u));
          setStatus('in');
        } else {
          setUser(null);
          setStatus('out');
        }
      });
      return unsub;
    }
    // Demo fallback: resolve from localStorage after a short beat (no login flash).
    // Stored objects may predate the uid field; patch them on read.
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(DEMO_KEY);
        const parsed = raw ? (JSON.parse(raw) as Partial<SuiteUser>) : null;
        const u: SuiteUser | null = parsed?.email
          ? buildUser(parsed.uid ?? parsed.email, parsed.email)
          : null;
        if (u) {
          setUser(u);
          setStatus('in');
        } else {
          setStatus('out');
        }
      } catch {
        setStatus('out');
      }
    }, 480);
    return () => clearTimeout(t);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (firebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    const u = buildUser(email, email);
    localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    setUser(u);
    setStatus('in');
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (firebaseConfigured && auth) {
      await createUserWithEmailAndPassword(auth, email, password);
      return;
    }
    await signIn(email, password);
  }, [signIn]);

  const signOut = useCallback(async () => {
    if (firebaseConfigured && auth) {
      await fbSignOut(auth);
      return;
    }
    localStorage.removeItem(DEMO_KEY);
    setUser(null);
    setStatus('out');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
