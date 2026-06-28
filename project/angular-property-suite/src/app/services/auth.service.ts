import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

const AUTH_KEY = 'ps_auth_v1';

/**
 * Demo auth service — ports `window.PS.Auth` from the original suite.
 * Persists the signed-in user to localStorage so a refresh keeps the
 * session. There is no backend: any email/password is accepted and the
 * user's name/initials are derived from the email.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<User | null>(this.read());

  /** Reactive current user (null when signed out). */
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  /** Synchronous snapshot of the current user. */
  get current(): User | null {
    return this.userSubject.value;
  }

  /** Sign in with an email; derives name + initials and persists. */
  signIn(email: string): User {
    const name = AuthService.deriveName(email);
    const user: User = { email, name, initials: AuthService.initialsOf(name) };
    this.write(user);
    this.userSubject.next(user);
    return user;
  }

  /** Clear the session. */
  signOut(): void {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* storage unavailable — ignore */
    }
    this.userSubject.next(null);
  }

  // --- persistence ---------------------------------------------------------

  private read(): User | null {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null') as User | null;
    } catch {
      return null;
    }
  }

  private write(user: User): void {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch {
      /* storage unavailable — ignore */
    }
  }

  // --- derivation helpers (ported verbatim from ps-common.js) --------------

  /** Title-case the email local-part into a display name. */
  static deriveName(email: string): string {
    const local = String(email ?? '').split('@')[0] || 'You';
    return (
      local
        .split(/[._-]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'You'
    );
  }

  /** First + last initial, uppercased. */
  static initialsOf(name: string): string {
    const parts = String(name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }
}
