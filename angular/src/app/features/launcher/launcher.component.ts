import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';

interface AppDef {
  key: string;
  name: string;
  to: string;
  icon: string;
  tileBg: string;
  tileFg: string;
  tag: string;
  desc: string;
  span2?: boolean;
}

const APPS: AppDef[] = [
  {
    key: 'rent',
    name: 'Rent Tracker',
    to: '/rent',
    icon: 'wallet',
    tileBg: '#EAF3EE',
    tileFg: '#2D6A4F',
    tag: 'Finance',
    desc: 'Track rent collection, receipts, and property expenses.',
  },
  {
    key: 'maint',
    name: 'Maintenance Scheduler',
    to: '/maintenance',
    icon: 'wrench',
    tileBg: '#E9F0F7',
    tileFg: '#2C5C92',
    tag: 'Operations',
    desc: 'Schedule and track maintenance across all your properties.',
  },
  {
    key: 'tenant',
    name: 'TenantBridge',
    to: '/tenant-bridge',
    icon: 'message-circle',
    tileBg: '#FDF2E4',
    tileFg: '#8F4E12',
    tag: 'Communication',
    desc: 'AI-powered tenant messaging and communication hub.',
    span2: true,
  },
];

const ICON_PATHS: Record<string, string> = {
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4 M3 5v14a2 2 0 0 0 2 2h16v-5 M18 12a2 2 0 0 0 0 4h4v-4z',
  wrench: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  'message-circle': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
};

@Component({
  selector: 'ps-launcher',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="launch-wrap" style="min-height:100dvh;background:var(--surface-page);" data-testid="launcher">
      <!-- Top bar -->
      <div class="launch-top">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:var(--brand);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style="font-weight:700;font-size:var(--text-md);color:var(--text-heading);">PropertySuite</span>
        </div>
        <a [routerLink]="['/profile']" (click)="rememberApps()" style="text-decoration:none;" data-testid="profile-link">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-sm);font-weight:700;color:var(--brand);">
            {{ initials() }}
          </div>
        </a>
      </div>

      <!-- Body -->
      <div class="launch-body">
        <p class="eyebrow" style="margin:0 0 4px;">Your workspace</p>
        <h1 style="margin:0 0 4px;font-size:var(--text-3xl);font-weight:800;color:var(--text-heading);">Good day, {{ firstName() }}</h1>
        <p style="margin:0;color:var(--text-muted);font-size:var(--text-md);">What would you like to manage today?</p>

        <!-- Tablet+: card grid -->
        <div class="app-grid">
          @for (app of apps; track app.key) {
            <a [routerLink]="[app.to]" class="app-card" [class.span2]="app.span2" [attr.data-testid]="'app-card-' + app.key">
              <div class="tile" [style.background]="app.tileBg">
                <span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" [attr.stroke]="app.tileFg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="getIconPath(app.icon)"/>
                  </svg>
                </span>
              </div>
              <div>
                <p style="margin:0 0 2px;font-weight:700;font-size:var(--text-md);color:var(--text-heading);">{{ app.name }}</p>
                <p style="margin:0 0 8px;font-size:var(--text-xs);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);">{{ app.tag }}</p>
                <p style="margin:0;font-size:var(--text-sm);color:var(--text-body);line-height:1.5;">{{ app.desc }}</p>
              </div>
            </a>
          }
        </div>

        <!-- Phone: icon-only grid -->
        <div class="icon-only">
          @for (app of apps; track app.key) {
            <a [routerLink]="[app.to]" class="icon-cell" [attr.data-testid]="'icon-cell-' + app.key">
              <div class="tile" [style.background]="app.tileBg">
                <span>
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" [attr.stroke]="app.tileFg" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path [attr.d]="getIconPath(app.icon)"/>
                  </svg>
                </span>
              </div>
              <span class="nm">{{ app.name }}</span>
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class LauncherComponent implements OnInit {
  private authService = inject(AuthService);
  private navService = inject(NavService);

  readonly apps = APPS;

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  initials(): string {
    return this.authService.user()?.initials ?? '?';
  }

  firstName(): string {
    const name = this.authService.user()?.name ?? 'there';
    return name.split(' ')[0];
  }

  rememberApps(): void {
    this.navService.rememberApp('/', 'Apps');
  }

  getIconPath(icon: string): string {
    return ICON_PATHS[icon] ?? '';
  }
}
