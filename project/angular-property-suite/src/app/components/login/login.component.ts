import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { FormFieldComponent } from '../form-field/form-field.component';
import { UiButtonComponent } from '../ui-button/ui-button.component';

type AuthMode = 'in' | 'up';

/**
 * Sign-in / sign-up card. Demo only — any email + password authenticates.
 * Emits the resulting `User` so the root can flip to the launcher.
 */
@Component({
  selector: 'ps-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormFieldComponent, UiButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  /** Fires with the authenticated user on successful submit. */
  @Output() authed = new EventEmitter<User>();

  email = 'dana.reyes@example.com';
  password = 'demo1234';
  mode: AuthMode = 'in';

  constructor(private readonly auth: AuthService) {}

  get heading(): string {
    return this.mode === 'in'
      ? 'Sign in to manage your portfolio'
      : 'Create your landlord account';
  }

  get submitLabel(): string {
    return this.mode === 'in' ? 'Sign in' : 'Create account';
  }

  toggleMode(): void {
    this.mode = this.mode === 'in' ? 'up' : 'in';
  }

  submit(event: Event): void {
    event.preventDefault();
    const email = this.email.trim();
    if (!email) return;
    this.authed.emit(this.auth.signIn(email));
  }
}
