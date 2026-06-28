import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LabelTag } from '../forms/form-utils';

/** Labeled textarea, ported from the prototype `TextArea`. */
@Component({
  selector: 'ps-textarea',
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
      <textarea
        class="field__input field__textarea"
        [id]="id"
        [value]="value"
        [placeholder]="placeholder"
        rows="3"
        (input)="onInput($event)"
      ></textarea>
    </div>
  `,
  styleUrl: './inputs.scss',
})
export class TextareaInputComponent {
  @Input() label = '';
  @Input() labelTag?: LabelTag;
  @Input() value = '';
  @Input() placeholder = '';

  @Output() valueChange = new EventEmitter<string>();

  private static seq = 0;
  readonly id = `ps-textarea-${TextareaInputComponent.seq++}`;

  onInput(e: Event): void {
    this.value = (e.target as HTMLTextAreaElement).value;
    this.valueChange.emit(this.value);
  }
}
