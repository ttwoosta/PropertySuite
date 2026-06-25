import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  User,
} from '@angular/fire/auth';
import { SuiteUser, AuthStatus } from '../models/auth.vm';
import { environment } from '../../environments/environment';

const LS_KEY = 'ps_auth_v1';
const isConfigured = environment.firebaseConfig.apiKey !== 'YOUR_API_KEY';

function deriveName(email: string): string {
  const local = email.split('@')[0];
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function buildUser(uid: string, email: string, displayName?: string | null): SuiteUser {
  const name = displayName ?? deriveName(email);
  return { uid, email, name, initials: initialsOf(name) };
}

function userFromFb(u: User): SuiteUser {
  return buildUser(u.uid, u.email ?? '', u.displayName);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  private readonly _status = signal<AuthStatus>('resolving');
  private readonly _user = signal<SuiteUser | null>(null);

  readonly status = this._status.asReadonly();
  readonly user = this._user.asReadonly();

  constructor() {
    if (isConfigured) {
      onAuthStateChanged(this.auth, (fbUser) => {
        if (fbUser) {
          this._user.set(userFromFb(fbUser));
          this._status.set('in');
        } else {
          this._user.set(null);
          this._status.set('out');
        }
      });
    } else {
      // Demo mode: resolve from localStorage after a short delay
      setTimeout(() => {
        const raw = typeof localStorage !== 'undefined'
          ? localStorage.getItem(LS_KEY)
          : null;
        if (raw) {
          try {
            this._user.set(JSON.parse(raw) as SuiteUser);
            this._status.set('in');
          } catch {
            this._status.set('out');
          }
        } else {
          this._status.set('out');
        }
      }, 480);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    if (isConfigured) {
      await signInWithEmailAndPassword(this.auth, email, password);
    } else {
      const user = buildUser(`demo-${Date.now()}`, email);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(user));
      }
      this._user.set(user);
      this._status.set('in');
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    if (isConfigured) {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } else {
      await this.signIn(email, password);
    }
  }

  async signOut(): Promise<void> {
    if (isConfigured) {
      await fbSignOut(this.auth);
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LS_KEY);
      }
      this._user.set(null);
      this._status.set('out');
    }
  }
}
