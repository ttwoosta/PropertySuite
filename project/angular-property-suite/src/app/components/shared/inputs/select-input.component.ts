import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LabelTag } from '../forms/form-utils';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Labeled native `<select>`, ported from the design-system Select. Accepts
 * `{value,label}` options. Two-way bindable via `[(value)]`.
 */
@Component({
  selector: 'ps-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      <div class="field__control">
        <select
          class="field__input field__select"
          [class.field__input--error]="!!error"
          [id]="id"
          [value]="value"
          [disabled]="disabled"
          (change)="onChange($event)"
        >
          @for (o of options; track o.value) {
            <option [value]="o.value">{{ o.label }}</option>
          }
        </select>
      </div>
      @if (error) {
        <span class="field__msg field__msg--error">{{ error }}</span>
      }
    </div>
  `,
  styleUrl: './inputs.scss',
})
export class SelectInputComponent {
  @Input() label = '';
  @Input() labelTag?: LabelTag;
  @Input() value = '';
  @Input() options: SelectOption[] = [];
  @Input() error: string | null = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();

  private static seq = 0;
  readonly id = `ps-select-${SelectInputComponent.seq++}`;

  onChange(e: Event): void {
    this.value = (e.target as HTMLSelectElement).value;
    this.valueChange.emit(this.value);
  }
}
