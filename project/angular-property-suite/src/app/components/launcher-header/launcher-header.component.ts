import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from '../../models/user.model';
import { AvatarComponent } from '../avatar/avatar.component';

/**
 * Launcher top bar (navbar): logo + wordmark on the left, an avatar link
 * to the Profile page on the right. The avatar mirrors the original
 * `window.PS.rememberApp()` behavior by stamping the current page into
 * sessionStorage so Profile can offer a "back" link.
 */
@Component({
  selector: 'ps-launcher-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent],
  templateUrl: './launcher-header.component.html',
  styleUrl: './launcher-header.component.scss',
})
export class LauncherHeaderComponent {
  /** Signed-in user (drives the avatar). */
  @Input({ required: true }) user!: User;

  /** Where the avatar links to. */
  @Input() profileHref = 'Profile.html';

  /** Remember the current page before navigating to Profile. */
  rememberApp(): void {
    try {
      const page = decodeURIComponent(location.pathname.split('/').pop() ?? '');
      if (page && page !== 'Profile.html') {
        sessionStorage.setItem('ps_profile_from_v1', page);
      }
    } catch {
      /* storage unavailable — ignore */
    }
  }
}
