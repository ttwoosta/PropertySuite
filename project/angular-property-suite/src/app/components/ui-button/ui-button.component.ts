import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost';
export type ButtonSize = 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * Brand button, ported from the design-system Button. Content is projected,
 * so callers pass label text (and optionally a `ps-icon`) as children.
 *
 * @example
 * <ps-button variant="primary" size="lg" [fullWidth]="true" type="submit">
 *   Sign in
 * </ps-button>
 */
@Component({
  selector: 'ps-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="btn"
      [class.btn--primary]="variant === 'primary'"
      [class.btn--ghost]="variant === 'ghost'"
      [class.btn--lg]="size === 'lg'"
      [class.btn--block]="fullWidth"
      [attr.type]="type"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: ButtonType = 'button';
  @Input() fullWidth = false;
  @Input() disabled = false;

  /** Emits the native click event. */
  @Output() clicked = new EventEmitter<MouseEvent>();
}
