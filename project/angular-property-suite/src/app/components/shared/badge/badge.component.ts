import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeTone = 'success' | 'warning' | 'neutral' | 'danger';
export type BadgeSize = 'sm' | 'md';

/**
 * Status pill, ported from the design-system Badge.
 *
 * @example <ps-badge tone="success" size="sm">Paid</ps-badge>
 */
@Component({
  selector: 'ps-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge--' + tone + ' badge--' + size"><ng-content></ng-content></span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        border-radius: var(--radius-pill);
        font-weight: var(--weight-semibold);
        line-height: 1;
      }
      .badge--md {
        padding: 4px 10px;
        font-size: var(--text-xs);
      }
      .badge--sm {
        padding: 3px 8px;
        font-size: 11px;
      }
      .badge--success {
        color: var(--success-fg);
        background: var(--success-bg);
      }
      .badge--warning {
        color: var(--warn-fg);
        background: var(--warn-bg);
      }
      .badge--danger {
        color: var(--danger-fg);
        background: var(--danger-bg);
      }
      .badge--neutral {
        color: var(--text-muted);
        background: var(--surface-sunken);
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
  @Input() size: BadgeSize = 'md';
}
