import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * White surface card on the gray canvas, ported from the design-system Card.
 * `padding="0"` removes the inner padding for full-bleed lists/tables (the
 * inner `--card-pad` variable stays available to children).
 *
 * @example <ps-card padding="0" [interactive]="true">…</ps-card>
 */
@Component({
  selector: 'ps-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        --card-pad: 20px;
        display: block;
        background: var(--surface-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xs);
        padding: var(--pad, 20px);
      }
      :host([data-interactive='true']) {
        transition:
          box-shadow var(--dur-base) var(--ease-out),
          border-color var(--dur-base) var(--ease-out);
        cursor: pointer;
      }
      :host([data-interactive='true']:hover) {
        box-shadow: var(--shadow-sm);
        border-color: var(--border-strong);
      }
    `,
  ],
  host: {
    '[style.--pad]': "padding === '0' ? '0px' : null",
    '[attr.data-interactive]': 'interactive',
  },
})
export class CardComponent {
  /** Pass "0" to remove padding for full-bleed content. */
  @Input() padding: string | null = null;
  @Input() interactive = false;
}
