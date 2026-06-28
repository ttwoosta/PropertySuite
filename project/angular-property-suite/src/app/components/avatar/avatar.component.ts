import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';

type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * Circular initials avatar. Initials are derived from the name, matching
 * the design-system Avatar. (No photo support in the launcher.)
 *
 * @example <ps-avatar name="Dana Reyes" size="md"></ps-avatar>
 */
@Component({
  selector: 'ps-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="avatar" [class]="'avatar--' + size">{{ initials }}</span>`,
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  /** Full display name; initials are computed from it. */
  @Input({ required: true }) name = '';

  /** Visual size. */
  @Input() size: AvatarSize = 'md';

  get initials(): string {
    return AuthService.initialsOf(this.name);
  }
}
