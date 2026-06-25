import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';
import { CurrencyService, CURRENCIES } from '../../services/currency.service';

@Component({
  selector: 'ps-profile-app',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div style="min-height:100dvh;background:var(--surface-page);" class="ps-fade" data-testid="profile-page">
      <!-- Header -->
      <div class="launch-top">
        <a [routerLink]="[returnPath()]" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text-heading);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7"/></svg>
          <span style="font-size:var(--text-sm);font-weight:500;">Back to {{ returnLabel() }}</span>
        </a>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:var(--brand);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style="font-weight:700;font-size:var(--text-sm);color:var(--text-heading);">PropertySuite</span>
        </div>
      </div>

      <!-- Content -->
      <div class="launch-body" style="max-width:640px;">
        <!-- Avatar + name -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--brand-tint);display:flex;align-items:center;justify-content:center;font-size:var(--text-xl);font-weight:700;color:var(--brand);">
            {{ initials() }}
          </div>
          <div>
            <h1 style="margin:0;font-size:var(--text-xl);font-weight:700;color:var(--text-heading);">{{ name() }}</h1>
            <p style="margin:4px 0 0;font-size:var(--text-sm);color:var(--text-muted);">Your account</p>
          </div>
        </div>

        <!-- Details card -->
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:16px;">
          <!-- Name row -->
          <div style="display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--border-subtle);" data-testid="profile-name-row">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--surface-sunken);display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style="flex:1;">
              <p class="eyebrow" style="margin:0 0 2px;">Name</p>
              <p style="margin:0;font-size:var(--text-sm);color:var(--text-heading);">{{ name() }}</p>
            </div>
          </div>
          <!-- Email row -->
          <div style="display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--border-subtle);" data-testid="profile-email-row">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--surface-sunken);display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style="flex:1;">
              <p class="eyebrow" style="margin:0 0 2px;">Email</p>
              <p style="margin:0;font-size:var(--text-sm);color:var(--text-heading);">{{ email() }}</p>
            </div>
          </div>
          <!-- Currency row -->
          <div style="display:flex;align-items:center;gap:14px;padding:16px 20px;" data-testid="profile-currency-row">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--surface-sunken);display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div style="flex:1;">
              <p class="eyebrow" style="margin:0 0 6px;">Currency</p>
              <select class="ps-select" [ngModel]="currencyService.code()" (ngModelChange)="setCurrency($event)" name="currency" style="width:auto;min-width:180px;" data-testid="currency-select">
                @for (entry of currencyEntries; track entry.code) {
                  <option [value]="entry.code">{{ entry.code }} — {{ entry.label }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <!-- Sign out -->
        <button (click)="signOut()" class="ps-btn" style="width:100%;background:var(--danger-bg);color:var(--danger-fg);border:none;padding:12px;justify-content:center;" data-testid="btn-sign-out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </div>
  `,
})
export class ProfileAppComponent implements OnInit {
  private authService = inject(AuthService);
  private navService = inject(NavService);
  readonly currencyService = inject(CurrencyService);
  private router = inject(Router);

  readonly currencyEntries = Object.values(CURRENCIES);
  private readonly _return = signal({ path: '/', label: 'Apps' });

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', 'light');
    this._return.set(this.navService.profileReturn());
  }

  returnPath = () => this._return().path;
  returnLabel = () => this._return().label;
  initials = () => this.authService.user()?.initials ?? '?';
  name = () => this.authService.user()?.name ?? '';
  email = () => this.authService.user()?.email ?? '';

  setCurrency(code: string): void {
    this.currencyService.setCode(code);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
