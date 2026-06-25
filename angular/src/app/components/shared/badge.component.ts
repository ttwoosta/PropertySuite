import { Component, computed, input } from '@angular/core';

type Tone = 'success' | 'warn' | 'danger' | 'info' | 'default';
type Size = 'sm' | 'md';

@Component({
  selector: 'ps-badge',
  standalone: true,
  template: `
    <span
      class="ps-badge"
      [class]="toneClass()"
      [attr.data-tone]="tone()"
      [attr.data-size]="size()"
      data-testid="ps-badge"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .ps-badge {
        display: inline-flex;
        align-items: center;
        border-radius: 9999px;
        font-weight: 500;
        white-space: nowrap;
        line-height: 1;
      }

      /* Sizes */
      .ps-badge.size-md {
        font-size: 0.75rem;
        padding: 2px 8px;
      }

      .ps-badge.size-sm {
        font-size: 0.6875rem;
        padding: 1px 6px;
      }

      /* Tones */
      .ps-badge.tone-default {
        background: var(--color-surface-raised, #f1f5f9);
        color: var(--color-text-muted, #64748b);
      }

      .ps-badge.tone-success {
        background: var(--color-success-subtle, #dcfce7);
        color: var(--color-success, #16a34a);
      }

      .ps-badge.tone-warn {
        background: var(--color-warn-subtle, #fef9c3);
        color: var(--color-warn, #ca8a04);
      }

      .ps-badge.tone-danger {
        background: var(--color-danger-subtle, #fee2e2);
        color: var(--color-danger, #dc2626);
      }

      .ps-badge.tone-info {
        background: var(--color-info-subtle, #dbeafe);
        color: var(--color-info, #2563eb);
      }
    `,
  ],
})
export class BadgeComponent {
  tone = input<Tone>('default');
  size = input<Size>('md');

  toneClass = computed(() => `tone-${this.tone()} size-${this.size()}`);
}
