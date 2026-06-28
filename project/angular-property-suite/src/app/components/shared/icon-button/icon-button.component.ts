import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type IconButtonVariant = 'ghost' | 'solid' | 'danger' | 'danger-soft';
export type IconButtonSize = 'sm' | 'md';

/**
 * Square icon-only button, ported from the design-system IconButton.
 * Projects a `ps-icon` (or any glyph) as content.
 *
 * @example
 * <ps-icon-button label="Edit room" variant="ghost" size="sm" (clicked)="…">
 *   <ps-icon name="pencil" [size]="16" />
 * </ps-icon-button>
 */
@Component({
  selector: 'ps-icon-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="iconbtn"
      [class]="'iconbtn--' + variant + ' iconbtn--' + size"
      [attr.aria-label]="label"
      [title]="label"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      .iconbtn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        color: var(--text-body);
        background: transparent;
        transition:
          background var(--dur-fast) var(--ease-out),
          color var(--dur-fast) var(--ease-out);
      }
      .iconbtn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .iconbtn--sm {
        width: 30px;
        height: 30px;
      }
      .iconbtn--md {
        width: 38px;
        height: 38px;
      }
      .iconbtn--ghost:hover:not(:disabled) {
        background: var(--surface-hover);
      }
      .iconbtn--solid {
        background: var(--brand);
        color: var(--text-on-brand);
      }
      .iconbtn--danger {
        background: var(--danger-solid);
        color: #fff;
      }
      .iconbtn--danger-soft {
        background: var(--danger-bg);
        color: var(--danger-fg);
      }
      .iconbtn:focus-visible {
        outline: none;
        box-shadow: var(--ring);
      }
    `,
  ],
})
export class IconButtonComponent {
  @Input({ required: true }) label = '';
  @Input() variant: IconButtonVariant = 'ghost';
  @Input() size: IconButtonSize = 'md';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
}
