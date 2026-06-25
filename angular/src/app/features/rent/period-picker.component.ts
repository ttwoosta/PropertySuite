import { Component, input, output, effect, OnDestroy } from '@angular/core';
import { MONTH_NAMES } from '../../services/rent.service';

@Component({
  selector: 'ps-period-picker',
  standalone: true,
  template: `
    @if (open()) {
      <!-- Backdrop -->
      <div
        style="position:fixed;inset:0;z-index:199;"
        (click)="closed.emit()"
        data-testid="period-picker-backdrop"
      ></div>

      <!-- Panel (centered overlay) -->
      <div
        class="ps-fade"
        style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);box-shadow:var(--shadow-md);width:290px;overflow:hidden;"
        (click)="$event.stopPropagation()"
        data-testid="period-picker"
      >
        <div style="display:flex;gap:4px;padding:6px;">
          <!-- Month column -->
          <div style="flex:1;max-height:220px;overflow-y:auto;padding:4px;" data-testid="month-column">
            @for (m of monthNames; track $index; let i = $index) {
              <button
                type="button"
                (click)="pickMonth(i)"
                style="display:block;width:100%;padding:9px 12px;border:none;cursor:pointer;text-align:center;border-radius:var(--radius-sm);font-size:var(--text-sm);"
                [style.background]="month() === i ? 'var(--brand-tint)' : 'transparent'"
                [style.color]="month() === i ? 'var(--brand-on-tint)' : 'var(--text-body)'"
                [style.fontWeight]="month() === i ? '700' : '500'"
                [attr.data-testid]="'month-' + i"
              >{{ m }}</button>
            }
          </div>

          <div style="width:1px;background:var(--border-subtle);flex:none;"></div>

          <!-- Year column -->
          <div style="flex:1;max-height:220px;overflow-y:auto;padding:4px;" data-testid="year-column">
            @for (y of years; track y) {
              <button
                type="button"
                (click)="pickYear(y)"
                style="display:block;width:100%;padding:9px 12px;border:none;cursor:pointer;text-align:center;border-radius:var(--radius-sm);font-size:var(--text-sm);"
                [style.background]="year() === y ? 'var(--brand-tint)' : 'transparent'"
                [style.color]="year() === y ? 'var(--brand-on-tint)' : 'var(--text-body)'"
                [style.fontWeight]="year() === y ? '700' : '500'"
                [attr.data-testid]="'year-' + y"
              >{{ y }}</button>
            }
          </div>
        </div>

        <div style="padding:10px;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
          <button
            type="button"
            (click)="closed.emit()"
            class="ps-btn ps-btn-primary"
            style="padding:6px 16px;font-size:var(--text-sm);"
            data-testid="period-picker-done"
          >Done</button>
        </div>
      </div>
    }
  `,
})
export class PeriodPickerComponent implements OnDestroy {
  open  = input(false);
  month = input(new Date().getMonth());
  year  = input(new Date().getFullYear());

  closed  = output<void>();
  picked  = output<{ month: number; year: number }>();

  readonly monthNames = MONTH_NAMES;
  readonly years = [2023, 2024, 2025, 2026, 2027];

  private readonly keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open()) this.closed.emit();
  };

  constructor() {
    effect(() => {
      if (this.open()) {
        document.addEventListener('keydown', this.keyHandler);
      } else {
        document.removeEventListener('keydown', this.keyHandler);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyHandler);
  }

  pickMonth(m: number): void {
    this.picked.emit({ month: m, year: this.year() });
  }

  pickYear(y: number): void {
    this.picked.emit({ month: this.month(), year: y });
  }
}
