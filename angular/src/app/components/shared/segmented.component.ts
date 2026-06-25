import { Component, computed, input, model } from '@angular/core';

export interface SegmentedOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ps-segmented',
  standalone: true,
  template: `
    <div
      class="ps-segmented"
      role="group"
      [attr.aria-label]="ariaLabel()"
      data-testid="ps-segmented"
    >
      @for (opt of options(); track opt.value) {
        <button
          type="button"
          class="ps-seg-btn"
          [class.is-active]="value() === opt.value"
          [attr.aria-pressed]="value() === opt.value"
          [attr.data-value]="opt.value"
          data-testid="ps-seg-btn"
          (click)="select(opt.value)"
        >
          {{ opt.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .ps-segmented {
        display: inline-flex;
        align-items: center;
        background: var(--color-surface-raised, #f1f5f9);
        border-radius: var(--radius-md, 8px);
        padding: 3px;
        gap: 2px;
      }

      .ps-seg-btn {
        padding: 5px 14px;
        border: none;
        background: transparent;
        border-radius: var(--radius-sm, 6px);
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        color: var(--color-text-muted, #64748b);
        transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        white-space: nowrap;
        line-height: 1.5;
      }

      .ps-seg-btn:hover:not(.is-active) {
        background: var(--color-surface-hover, #e2e8f0);
        color: var(--color-text, #0f172a);
      }

      .ps-seg-btn.is-active {
        background: var(--color-surface, #ffffff);
        color: var(--color-brand, #6366f1);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        font-weight: 600;
      }
    `,
  ],
})
export class SegmentedComponent {
  options = input.required<SegmentedOption[]>();
  value = model<string>('');
  ariaLabel = input('');

  // unused but kept in case consumers want to derive the active option
  activeOption = computed(() => this.options().find((o) => o.value === this.value()) ?? null);

  select(val: string): void {
    this.value.set(val);
  }
}
