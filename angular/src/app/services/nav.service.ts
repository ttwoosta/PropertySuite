import { Injectable } from '@angular/core';

const LS_KEY = 'ps_last_app';

export interface AppRef {
  path: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class NavService {
  rememberApp(path: string, label: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_KEY, JSON.stringify({ path, label }));
    }
  }

  profileReturn(): AppRef {
    if (typeof localStorage === 'undefined') return { path: '/', label: 'Apps' };
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw) as AppRef;
    } catch { /* ignore */ }
    return { path: '/', label: 'Apps' };
  }
}
