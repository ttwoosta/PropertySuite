import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Centered loading spinner shown while the auth state resolves.
 *
 * @example <ps-spinner label="Loading your suite…"></ps-spinner>
 */
@Component({
  selector: 'ps-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner">
      <span class="spinner__ring" aria-hidden="true"></span>
      @if (label) {
        <span class="spinner__label">{{ label }}</span>
      }
    </div>
  `,
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  /** Optional caption under the ring. */
  @Input() label = '';
}
