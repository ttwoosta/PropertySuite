import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { UiButtonComponent } from '../../ui-button/ui-button.component';
import { BadgeComponent, BadgeTone } from '../badge/badge.component';
import { TextInputComponent } from '../inputs/text-input.component';
import { CurrencyService } from '../../../services/currency.service';
import { LabelTag, sanitizeAmt } from './form-utils';

/* ---- inline saving spinner (BtnSpin) ---- */
@Component({
  selector: 'ps-btn-spin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="spin"></span>`,
  styles: [
    `
      .spin {
        display: inline-flex;
        width: 15px;
        height: 15px;
        border: 2px solid color-mix(in srgb, currentColor 35%, transparent);
        border-top-color: currentColor;
        border-radius: 50%;
        animation: ps-spin 0.7s linear infinite;
      }
    `,
  ],
})
export class BtnSpinComponent {}

/* ---- primary CTA that flips to spinner + busy label (SaveCta) ---- */
@Component({
  selector: 'ps-save-cta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButtonComponent, IconComponent, BtnSpinComponent],
  template: `
    <ps-button variant="primary" [disabled]="busy || disabled" (clicked)="clicked.emit()">
      @if (busy) {
        <ps-btn-spin></ps-btn-spin>
      } @else if (icon) {
        <ps-icon [name]="icon" [size]="16"></ps-icon>
      }
      {{ busy ? busyLabel : label }}
    </ps-button>
  `,
})
export class SaveCtaComponent {
  @Input() busy = false;
  @Input() busyLabel = 'Saving…';
  @Input() label = 'Save';
  @Input() icon?: string;
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}

/* ---- −/value/+ stepper (Stepper) ---- */
@Component({
  selector: 'ps-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="stepper">
      <button class="stepper__btn" aria-label="Fewer" [disabled]="value <= min" (click)="step(-1)">
        <ps-icon name="minus" [size]="16"></ps-icon>
      </button>
      <span class="stepper__val">{{ value }}</span>
      <button class="stepper__btn" aria-label="More" [disabled]="value >= max" (click)="step(1)">
        <ps-icon name="plus" [size]="16"></ps-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .stepper {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        overflow: hidden;
        background: var(--surface-card);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
      }
      .stepper__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 38px;
        border: none;
        background: transparent;
        color: var(--text-body);
        cursor: pointer;
      }
      .stepper__btn:disabled {
        color: var(--text-faint);
        cursor: not-allowed;
      }
      .stepper__val {
        min-width: 34px;
        padding: 8px 0;
        text-align: center;
        font-family: var(--font-mono);
        font-size: var(--text-md);
        font-weight: var(--weight-bold);
        color: var(--text-heading);
        border-left: 1px solid var(--border-subtle);
        border-right: 1px solid var(--border-subtle);
      }
    `,
  ],
})
export class StepperComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 10;
  @Output() valueChange = new EventEmitter<number>();

  step(d: number): void {
    this.valueChange.emit(Math.max(this.min, Math.min(this.max, this.value + d)));
  }
}

/* ---- $-prefixed amount input (AmountField) ---- */
@Component({
  selector: 'ps-amount-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextInputComponent],
  template: `
    <ps-input
      [label]="label"
      [labelTag]="labelTag"
      [value]="value"
      [error]="error"
      [hint]="hint"
      [placeholder]="placeholder || '0.00'"
      [leadingText]="currency.symbol()"
      inputMode="decimal"
      (valueChange)="onChange($event)"
      (blurred)="blurred.emit()"
    ></ps-input>
  `,
})
export class AmountFieldComponent {
  @Input() label = '';
  @Input() labelTag?: LabelTag;
  @Input() value = '';
  @Input() error: string | null = null;
  @Input() hint: string | null = null;
  @Input() placeholder = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();

  readonly currency = inject(CurrencyService);

  onChange(v: string): void {
    this.valueChange.emit(sanitizeAmt(v));
  }
}

/* ---- gray summary box (SummaryBlock) ---- */
export interface SummaryRow {
  label: string;
  value: string;
  badge?: { tone: BadgeTone; label: string };
}

@Component({
  selector: 'ps-summary-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  template: `
    <div class="sum">
      @for (r of rows; track $index) {
        <div class="sum__row">
          <span class="sum__label">
            @if (r.badge) {
              <ps-badge [tone]="r.badge.tone" size="sm">{{ r.badge.label }}</ps-badge>
            }
            {{ r.label }}
          </span>
          <span class="sum__val">{{ r.value }}</span>
        </div>
      }
      <div class="sum__rule"></div>
      <div class="sum__row">
        <span class="sum__total-label">{{ totalLabel }}</span>
        <span class="sum__total-val">{{ totalValue }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .sum {
        display: flex;
        flex-direction: column;
        gap: 9px;
        padding: 13px 15px;
        background: var(--surface-sunken);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }
      .sum__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .sum__label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--text-sm);
        color: var(--text-muted);
      }
      .sum__val {
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        color: var(--text-body);
      }
      .sum__rule {
        height: 1px;
        margin: 1px 0;
        background: var(--border-default);
      }
      .sum__total-label {
        font-size: var(--text-base);
        font-weight: var(--weight-bold);
        color: var(--text-heading);
      }
      .sum__total-val {
        font-family: var(--font-mono);
        font-size: var(--text-md);
        font-weight: var(--weight-bold);
        color: var(--text-heading);
      }
    `,
  ],
})
export class SummaryBlockComponent {
  @Input() rows: SummaryRow[] = [];
  @Input() totalLabel = '';
  @Input() totalValue = '';
}

/* ---- form-level error block (FormError) ---- */
@Component({
  selector: 'ps-form-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (message) {
      <div class="err ps-fade">
        <span class="err__icon"><ps-icon name="alert-circle" [size]="17"></ps-icon></span>
        <span class="err__msg">{{ message }}</span>
      </div>
    }
  `,
  styles: [
    `
      .err {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        padding: 11px 13px;
        border-radius: var(--radius-md);
        background: var(--danger-bg);
        border: 1px solid color-mix(in srgb, var(--danger-fg) 35%, transparent);
      }
      .err__icon {
        display: inline-flex;
        flex: none;
        margin-top: 1px;
        color: var(--danger-fg);
      }
      .err__msg {
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        line-height: 1.45;
        color: var(--danger-fg);
      }
    `,
  ],
})
export class FormErrorComponent {
  @Input() message: string | null = null;
}

/* ---- two-column field row (FieldRow) ---- */
@Component({
  selector: 'ps-field-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="row"><ng-content></ng-content></div>`,
  styles: [
    `
      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 14px;
      }
    `,
  ],
})
export class FieldRowComponent {}

/* ---- wizard step rail (StepRail) ---- */
@Component({
  selector: 'ps-step-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="rail">
      @for (l of labels; track l; let i = $index) {
        <div class="rail__node">
          <span
            class="rail__dot"
            [class.rail__dot--done]="i < step"
            [class.rail__dot--cur]="i === step"
          >
            @if (i < step) {
              <ps-icon name="check" [size]="14"></ps-icon>
            } @else {
              {{ i + 1 }}
            }
          </span>
          <span class="rail__label" [class.rail__label--on]="i <= step">{{ l }}</span>
        </div>
        @if (i < labels.length - 1) {
          <span class="rail__line" [class.rail__line--done]="i < step"></span>
        }
      }
    </div>
  `,
  styles: [
    `
      .rail {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }
      .rail__node {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .rail__dot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        flex: none;
        border-radius: 50%;
        font-size: var(--text-xs);
        font-weight: var(--weight-bold);
        background: var(--surface-sunken);
        color: var(--text-faint);
        border: 1px solid transparent;
      }
      .rail__dot--done {
        background: var(--brand);
        color: #fff;
      }
      .rail__dot--cur {
        background: var(--brand-tint);
        color: var(--brand-on-tint);
        border-color: var(--brand-on-tint);
      }
      .rail__label {
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        color: var(--text-faint);
      }
      .rail__label--on {
        color: var(--text-heading);
      }
      .rail__line {
        flex: 1;
        height: 1px;
        background: var(--border-default);
      }
      .rail__line--done {
        background: var(--brand);
      }
    `,
  ],
})
export class StepRailComponent {
  @Input() step = 0;
  @Input() labels: string[] = [];
}

/* ---- receipt type chip (KindChip) ---- */
@Component({
  selector: 'ps-kind-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="chip" [style.color]="color" [style.background]="bg">{{ text }}</span>`,
  styles: [
    `
      .chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 7px;
        border-radius: var(--radius-pill);
        font-size: 11px;
        font-weight: var(--weight-bold);
        letter-spacing: 0.3px;
      }
    `,
  ],
})
export class KindChipComponent {
  @Input() kind = 'img';

  get color(): string {
    return this.kind === 'pdf' ? 'var(--red-400)' : this.kind === 'img' ? 'var(--blue-400)' : 'var(--text-faint)';
  }
  get bg(): string {
    return `color-mix(in srgb, ${this.color} 14%, transparent)`;
  }
  get text(): string {
    return this.kind === 'pdf' ? 'PDF' : this.kind === 'img' ? 'IMG' : '—';
  }
}
