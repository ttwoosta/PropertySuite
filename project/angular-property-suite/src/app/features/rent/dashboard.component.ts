import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CardComponent } from '../../components/shared/card/card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { GroupedBarsComponent } from './charts.component';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';

/**
 * Home dashboard, ported from `Dashboard`: two KPI cards (income / expenses
 * with vs-prior-month delta), the income-vs-expenses bar chart with a legend,
 * and a recent-activity list.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, IconComponent, GroupedBarsComponent],
  template: `
    <div class="ps-fade dash">
      <div class="dash__kpis">
        <ps-card>
          <div class="kpi__top">
            <span class="kpi__label">Monthly income</span>
            <ps-icon name="trending-up" [size]="18" class="kpi__icon kpi__icon--up"></ps-icon>
          </div>
          <div class="ps-mono kpi__value">{{ currency.format(inc()) }}</div>
          <span class="kpi__delta kpi__delta--up">▲ {{ currency.format(dInc()) }} vs May</span>
        </ps-card>

        <ps-card>
          <div class="kpi__top">
            <span class="kpi__label">Monthly expenses</span>
            <ps-icon name="trending-down" [size]="18" class="kpi__icon kpi__icon--down"></ps-icon>
          </div>
          <div class="ps-mono kpi__value">{{ currency.format(exp()) }}</div>
          <span class="kpi__delta" [class.kpi__delta--up]="dExp() <= 0" [class.kpi__delta--down]="dExp() > 0">
            {{ dExp() > 0 ? '▲' : '▼' }} {{ currency.format(dExp()) }} vs May
          </span>
        </ps-card>
      </div>

      <ps-card class="dash__chart">
        <div class="chart__head">
          <div class="chart__title">Income vs expenses</div>
          <div class="chart__legend">
            <span class="legend__item"><span class="legend__dot legend__dot--income"></span>Income</span>
            <span class="legend__item"><span class="legend__dot legend__dot--expense"></span>Expenses</span>
          </div>
        </div>
        <app-grouped-bars [series]="rent.series"></app-grouped-bars>
      </ps-card>

      <ps-card padding="0">
        <div class="activity__title">Recent activity</div>
        @for (a of rent.activity; track $index) {
          <div class="activity__row">
            <span class="activity__dot" [style.background]="a.dot"></span>
            <div class="activity__main">
              <div class="activity__label">{{ a.label }}</div>
              <div class="activity__sub">{{ a.sub }} · {{ a.when }}</div>
            </div>
            <span class="ps-mono activity__amount" [class.activity__amount--pos]="a.amount >= 0">
              {{ a.amount < 0 ? '−' : '+' }}{{ currency.format(a.amount) }}
            </span>
          </div>
        }
      </ps-card>
    </div>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);

  readonly inc = computed(() => this.rent.series[5].income);
  readonly exp = computed(() => this.rent.series[5].expense);
  readonly dInc = computed(() => this.rent.series[5].income - this.rent.series[4].income);
  readonly dExp = computed(() => this.rent.series[5].expense - this.rent.series[4].expense);
}
