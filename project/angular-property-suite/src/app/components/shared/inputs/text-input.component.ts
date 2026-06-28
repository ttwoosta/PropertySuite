import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { LabelTag } from '../forms/form-utils';

let uid = 0;

/**
 * Labeled text input, ported from the design-system Input. Supports a leading
 * icon (lucide name) or leading text (e.g. a currency symbol), an inline
 * error, and a muted hint. Two-way bindable via `[(value)]`.
 */
@Component({
  selector: 'ps-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="field">
      @if (label) {
        <label class="field__label" [attr.for]="id">
          {{ label }}
          @if (labelTag) {
            <span class="field__tag" [class.field__tag--req]="labelTag.tone === 'req'">{{ labelTag.label }}</span>
          }
        </label>
      }
      <div class="field__control" [class.field__control--icon]="leadingIcon || leadingText">
        @if (leadingIcon) {
          <span class="field__lead"><ps-icon [name]="leadingIcon" [size]="16"></ps-icon></span>
        } @else if (leadingText) {
          <span class="field__lead field__lead--text">{{ leadingText }}</span>
        }
        <input
          class="field__input"
          [class.field__input--error]="!!error"
          [id]="id"
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readOnly]="readonly"
          [attr.inputmode]="inputMode"
          [attr.autocomplete]="autocomplete"
          (input)="onInput($event)"
          (blur)="blurred.emit()"
        />
      </div>
      @if (error) {
        <span class="field__msg field__msg--error">{{ error }}</span>
      } @else if (hint) {
        <span class="field__msg">{{ hint }}</span>
      }
    </div>
  `,
  styleUrl: './inputs.scss',
})
export class TextInputComponent {
  @Input() label = '';
  @Input() labelTag?: LabelTag;
  @Input() type: 'text' | 'email' | 'password' | 'date' = 'text';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() error: string | null = null;
  @Input() hint: string | null = null;
  @Input() leadingIcon?: string;
  @Input() leadingText?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() inputMode?: string;
  @Input() autocomplete?: string;

  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();

  readonly id = `ps-input-${uid++}`;

  onInput(e: Event): void {
    this.value = (e.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }
}
