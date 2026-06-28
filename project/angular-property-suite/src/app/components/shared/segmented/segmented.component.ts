import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface SegmentOption {
  value: string;
  label: string;
}

/**
 * Segmented control with roving arrow-key support, ported from `Segmented`.
 *
 * @example
 * <ps-segmented [options]="filters" [value]="filter()" (changed)="filter.set($event)" />
 */
@Component({
  selector: 'ps-segmented',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seg" role="tablist" [attr.aria-label]="ariaLabel" (keydown)="onKey($event)">
      @for (o of options; track o.value; let i = $index) {
        <button
          class="seg__btn"
          role="tab"
          [class.seg__btn--on]="o.value === value"
          [attr.aria-selected]="o.value === value"
          [attr.tabindex]="o.value === value ? 0 : -1"
          (click)="changed.emit(o.value)"
        >
          {{ o.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .seg {
        display: inline-flex;
        gap: 3px;
        padding: 3px;
        background: var(--surface-sunken);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
      }
      .seg__btn {
        padding: 6px 13px;
        border: none;
        cursor: pointer;
        border-radius: var(--radius-sm);
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        background: transparent;
        color: var(--text-muted);
        transition: all var(--dur-fast) var(--ease-out);
      }
      .seg__btn--on {
        background: var(--surface-card);
        color: var(--text-heading);
        box-shadow: var(--shadow-xs);
      }
      .seg__btn:focus-visible {
        outline: none;
        box-shadow: var(--ring);
      }
    `,
  ],
})
export class SegmentedComponent {
  @Input({ required: true }) options: SegmentOption[] = [];
  @Input({ required: true }) value = '';
  @Input() ariaLabel = '';
  @Output() changed = new EventEmitter<string>();

  onKey(e: KeyboardEvent): void {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = this.options.length;
    const idx = this.options.findIndex((o) => o.value === this.value);
    const next = e.key === 'ArrowRight' ? (idx + 1) % n : (idx - 1 + n) % n;
    this.changed.emit(this.options[next].value);
    const btns = (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('.seg__btn');
    btns[next]?.focus();
  }
}
