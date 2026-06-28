import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CurrencyService } from '../../../services/currency.service';
import { DonutDatum, SeriesPoint } from '../../../models/rent.vm';

/**
 * Grouped income/expense bars, ported from `GroupedBars`. Brand-green income
 * bars and amber expense bars, 6 months, month labels on the x-axis.
 *
 * @example <app-grouped-bars [series]="rent.series" />
 */
@Component({
  selector: 'app-grouped-bars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bars">
      @for (s of series; track s.m) {
        <div class="bars__group">
          <div class="bars__stack">
            <div
              class="bars__bar bars__bar--income"
              [style.height.%]="(s.income / max) * 100"
              [title]="'Income ' + currency.format(s.income)"
            ></div>
            <div
              class="bars__bar bars__bar--expense"
              [style.height.%]="(s.expense / max) * 100"
              [title]="'Expenses ' + currency.format(s.expense)"
            ></div>
          </div>
          <span class="bars__label">{{ s.m }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .bars {
        display: flex;
        align-items: flex-end;
        gap: 18px;
        height: 200px;
        padding: 8px 0;
      }
      .bars__group {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .bars__stack {
        display: flex;
        align-items: flex-end;
        justify-content: center;
        gap: 5px;
        height: 170px;
        width: 100%;
      }
      .bars__bar {
        width: 38%;
        max-width: 22px;
        border-radius: 4px 4px 0 0;
      }
      .bars__bar--income {
        background: var(--brand);
      }
      .bars__bar--expense {
        background: var(--amber-400);
      }
      .bars__label {
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        color: var(--text-muted);
      }
    `,
  ],
})
export class GroupedBarsComponent {
  @Input({ required: true }) series: SeriesPoint[] = [];
  readonly currency = inject(CurrencyService);

  get max(): number {
    return Math.max(...this.series.flatMap((s) => [s.income, s.expense]));
  }
}

interface DonutSeg {
  color: string;
  dash: string;
  offset: number;
}

/**
 * Proportional donut ring with a center total, ported from `Donut`.
 *
 * @example <app-donut [data]="rent.donutData()" [total]="total" caption="June total" />
 */
@Component({
  selector: 'app-donut',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="donut">
      <svg width="168" height="168" viewBox="0 0 140 140" class="donut__svg">
        @for (seg of segments; track $index) {
          <circle
            cx="70"
            cy="70"
            r="52"
            fill="none"
            [attr.stroke]="seg.color"
            stroke-width="18"
            [attr.stroke-dasharray]="seg.dash"
            [attr.stroke-dashoffset]="seg.offset"
          ></circle>
        }
      </svg>
      <div class="donut__center">
        <span class="donut__caption">{{ caption }}</span>
        <span class="ps-mono donut__total">{{ currency.format(total) }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .donut {
        position: relative;
        width: 168px;
        height: 168px;
        flex: none;
      }
      .donut__svg {
        transform: rotate(-90deg);
      }
      .donut__center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .donut__caption {
        font-size: var(--text-xs);
        font-weight: var(--weight-semibold);
        color: var(--text-muted);
      }
      .donut__total {
        font-size: 16px;
        font-weight: var(--weight-bold);
        color: var(--text-heading);
      }
    `,
  ],
})
export class DonutComponent {
  @Input({ required: true }) data: DonutDatum[] = [];
  @Input({ required: true }) total = 0;
  @Input() caption = 'Total';
  readonly currency = inject(CurrencyService);

  private readonly C = 2 * Math.PI * 52;

  get segments(): DonutSeg[] {
    let off = 0;
    return this.data.map((d) => {
      const frac = this.total ? d.value / this.total : 0;
      const seg: DonutSeg = {
        color: d.color,
        dash: `${frac * this.C} ${this.C}`,
        offset: -off,
      };
      off += frac * this.C;
      return seg;
    });
  }
}
