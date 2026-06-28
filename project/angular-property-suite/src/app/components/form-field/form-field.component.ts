import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

let uid = 0;

/**
 * Labeled text input with an optional leading Lucide icon — the launcher's
 * reusable form field (ported from the design-system Input). Two-way
 * bindable via `[(value)]`.
 *
 * @example
 * <ps-form-field label="Email" type="email" leadingIcon="mail"
 *                [(value)]="email" placeholder="you@example.com">
 * </ps-form-field>
 */
@Component({
  selector: 'ps-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() leadingIcon?: string;
  @Input() autocomplete?: string;

  /** Two-way binding output: `[(value)]`. */
  @Output() valueChange = new EventEmitter<string>();

  /** Stable id linking label ↔ input. */
  readonly id = `ps-field-${uid++}`;

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(this.value);
  }
}
