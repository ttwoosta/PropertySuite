import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Per-app theme, ported from `useTheme('rent')`. Applies `data-theme` to
 * `<html>` and persists to `localStorage` under `ps_theme_rent`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'ps_theme_rent';
  private readonly themeSig = signal<Theme>(this.read());

  readonly theme = this.themeSig.asReadonly();

  constructor() {
    this.apply(this.themeSig());
  }

  toggle(): void {
    const next: Theme = this.themeSig() === 'dark' ? 'light' : 'dark';
    this.themeSig.set(next);
    this.apply(next);
    try {
      localStorage.setItem(this.key, next);
    } catch {
      /* ignore */
    }
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private read(): Theme {
    try {
      return (localStorage.getItem(this.key) as Theme) || 'light';
    } catch {
      return 'light';
    }
  }
}
