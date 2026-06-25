import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

const isConfigured = environment.firebaseConfig.apiKey !== 'YOUR_API_KEY';

@Component({
  selector: 'ps-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="ps-fade" style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--surface-page);padding:24px;">
      <div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:24px;">
        <!-- Logo -->
        <div style="text-align:center;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:var(--brand);border-radius:var(--radius-md);margin-bottom:12px;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style="margin:0;font-size:var(--text-xl);font-weight:700;color:var(--text-heading);">PropertySuite</h1>
          <p style="margin:6px 0 0;color:var(--text-muted);font-size:var(--text-sm);">
            {{ mode() === 'in' ? 'Sign in to your account' : 'Create an account' }}
          </p>
        </div>

        <!-- Card -->
        <div style="background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:28px;box-shadow:var(--shadow-sm);">
          <form (ngSubmit)="submit()" style="display:flex;flex-direction:column;gap:14px;">
            <!-- Email -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Email</label>
              <input
                type="email"
                class="ps-input"
                [(ngModel)]="email"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
                data-testid="input-email"
              />
            </div>

            <!-- Password -->
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Password</label>
              <input
                type="password"
                class="ps-input"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                data-testid="input-password"
              />
            </div>

            <!-- Error -->
            @if (err()) {
              <div style="background:var(--danger-bg);color:var(--danger-fg);border-radius:var(--radius-md);padding:10px 14px;font-size:var(--text-sm);" data-testid="login-error">
                {{ err() }}
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              class="ps-btn ps-btn-primary"
              style="width:100%;margin-top:4px;"
              [disabled]="busy()"
              data-testid="btn-submit"
            >
              @if (busy()) {
                <span class="ps-spin" style="width:18px;height:18px;border-width:2px;"></span>
              } @else {
                {{ mode() === 'in' ? 'Sign in' : 'Create account' }}
              }
            </button>
          </form>
        </div>

        <!-- Toggle -->
        <p style="text-align:center;font-size:var(--text-sm);color:var(--text-muted);margin:0;">
          @if (mode() === 'in') {
            Don't have an account?
            <button (click)="toggleMode()" style="background:none;border:none;color:var(--brand);font-weight:600;cursor:pointer;padding:0;" data-testid="btn-toggle-mode">Sign up</button>
          } @else {
            Already have an account?
            <button (click)="toggleMode()" style="background:none;border:none;color:var(--brand);font-weight:600;cursor:pointer;padding:0;" data-testid="btn-toggle-mode">Sign in</button>
          }
        </p>

        <!-- Footer note -->
        <p style="text-align:center;font-size:var(--text-xs);color:var(--text-faint);margin:0;">
          @if (isConfigured) {
            Secured by Firebase Authentication
          } @else {
            Demo mode — any email &amp; password will work
          }
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly isConfigured = isConfigured;
  readonly mode = signal<'in' | 'up'>('in');
  readonly err = signal<string | null>(null);
  readonly busy = signal(false);

  email = '';
  password = '';

  toggleMode(): void {
    this.mode.update((m) => (m === 'in' ? 'up' : 'in'));
    this.err.set(null);
  }

  async submit(): Promise<void> {
    this.err.set(null);
    this.busy.set(true);
    try {
      if (this.mode() === 'in') {
        await this.auth.signIn(this.email, this.password);
      } else {
        await this.auth.signUp(this.email, this.password);
      }
      this.router.navigate(['/']);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.err.set(msg.replace('Firebase: ', '').replace(/\s*\(.*\)/, ''));
    } finally {
      this.busy.set(false);
    }
  }
}
