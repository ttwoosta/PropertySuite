import { Component, OnInit, input, signal } from '@angular/core';
import { IconComponent } from './icon.component';

type Theme = 'light' | 'dark';

function getStorageKey(appKey: string): string {
  return `ps_theme_${appKey}`;
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

@Component({
  selector: 'ps-theme-toggle',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ps-theme-toggle"
      [attr.aria-label]="theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.data-theme]="theme()"
      data-testid="ps-theme-toggle"
      (click)="toggle()"
    >
      <ps-icon [name]="theme() === 'dark' ? 'sun' : 'moon'" [size]="18"></ps-icon>
    </button>
  `,
  styles: [
    `
      .ps-theme-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: transparent;
        border-radius: var(--radius-sm, 6px);
        cursor: pointer;
        color: var(--color-text-muted, #64748b);
        transition: background 0.15s, color 0.15s;
      }

      .ps-theme-toggle:hover {
        background: var(--color-surface-raised, #f1f5f9);
        color: var(--color-text, #0f172a);
      }
    `,
  ],
})
export class ThemeToggleComponent implements OnInit {
  appKey = input.required<string>();

  protected readonly theme = signal<Theme>('light');

  ngOnInit(): void {
    const stored = localStorage.getItem(getStorageKey(this.appKey())) as Theme | null;
    const resolved: Theme = stored === 'light' || stored === 'dark' ? stored : getSystemTheme();
    this.theme.set(resolved);
    applyTheme(resolved);
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(getStorageKey(this.appKey()), next);
    applyTheme(next);
  }
}
