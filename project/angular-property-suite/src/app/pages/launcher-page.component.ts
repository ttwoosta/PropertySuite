import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LauncherComponent } from '../components/launcher/launcher.component';
import { User } from '../models/user.model';

/**
 * Route component for the launcher (`''`). Pulls the signed-in user from
 * `AuthService` and renders the launcher grid.
 */
@Component({
  selector: 'ps-launcher-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LauncherComponent],
  template: `<ps-launcher [user]="user"></ps-launcher>`,
})
export class LauncherPageComponent {
  private readonly auth = inject(AuthService);
  readonly user: User = this.auth.current ?? { email: '', name: 'You', initials: 'Y' };
}
