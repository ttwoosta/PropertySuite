import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CardComponent } from '../../components/shared/card/card.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { IconButtonComponent } from '../../components/shared/icon-button/icon-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { KindChipComponent } from '../../components/shared/forms/form-primitives';
import { DonutComponent } from './charts.component';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { Category } from '../../models/rent.vm';

/**
 * Expenses view, ported from `Expenses`: donut + legend grid, then an
 * accordion per category. Expanded rows show 6 months each with amount,
 * an attach/view-receipt button, and an edit icon.
 */
@Component({
  selector: 'app-expenses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    UiButtonComponent,
    IconButtonComponent,
    IconComponent,
    KindChipComponent,
    DonutComponent,
  ],
  template: `
    <div class="ps-fade">
      <div class="exp__head">
        <div class="exp__head-main">
          <div class="exp__title">Expenses · {{ rent.year() }}</div>
          <div class="exp__sub">Tap a month to edit or attach a receipt</div>
        </div>
        <ps-button variant="primary" (clicked)="rent.openAddEntry(open())">
          <ps-icon name="plus" [size]="16"></ps-icon>Add entry
        </ps-button>
      </div>

      <ps-card class="exp__summary">
        <app-donut [data]="rent.donutData()" [total]="total" caption="June total"></app-donut>
        <div class="exp__legend">
          @for (c of rent.categories; track c.id) {
            <div class="legend__row">
              <span class="legend__dot" [style.background]="c.color"></span>
              <span class="legend__label">{{ c.label }}</span>
              <span class="ps-mono legend__amount">{{ currency.format(rent.expMonth[c.id]) }}</span>
            </div>
          }
        </div>
      </ps-card>

      <ps-card padding="0">
        @for (c of rent.categories; track c.id; let i = $index) {
          <div class="acc" [class.acc--divided]="i > 0">
            <button class="acc__head" (click)="toggle(c.id)">
              <span class="acc__icon" [style.background]="iconBg(c)" [style.color]="c.color">
                <ps-icon [name]="c.icon" [size]="16"></ps-icon>
              </span>
              <span class="acc__label">{{ c.label }}</span>
              <span class="ps-mono acc__amount">{{ currency.format(rent.expMonth[c.id]) }}</span>
              <span class="acc__ytd">YTD {{ currency.format(rent.expYtd[c.id]) }}</span>
              <ps-icon class="acc__chev" [class.acc__chev--open]="open() === c.id" name="chevron-down" [size]="16"></ps-icon>
            </button>

            @if (open() === c.id) {
              <div class="acc__body">
                @for (m of months; track m; let mi = $index) {
                  <div class="month">
                    <span class="month__abbr">{{ m }}</span>
                    <span class="ps-mono month__amount">{{ currency.format(rent.amountOf(c.id, mi)) }}</span>
                    @if (receiptFor(c.id, mi); as rc) {
                      <button class="month__chip month__chip--has" title="View receipt" (click)="rent.openViewer(rc, c.id + '-' + mi)">
                        <ps-kind-chip [kind]="rc.kind"></ps-kind-chip>Receipt
                      </button>
                    } @else {
                      <button class="month__chip month__chip--attach" title="Attach receipt" (click)="rent.openPicker(c.id + '-' + mi, c.label + ' · ' + m)">
                        <ps-icon name="paperclip" [size]="12"></ps-icon>Attach
                      </button>
                    }
                    <ps-icon-button label="Edit entry" variant="ghost" size="sm" (clicked)="editEntry(c.id, mi)">
                      <ps-icon name="pencil" [size]="16"></ps-icon>
                    </ps-icon-button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </ps-card>
    </div>
  `,
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);

  readonly open = signal<string | null>('maint');
  readonly months = this.rent.months.slice(0, 6);

  get total(): number {
    return Object.values(this.rent.expMonth).reduce((a, b) => a + b, 0);
  }

  toggle(id: string): void {
    this.open.update((o) => (o === id ? null : id));
  }

  iconBg(c: Category): string {
    return `color-mix(in srgb, ${c.color} 14%, var(--surface-card))`;
  }

  receiptFor(catId: string, monthIdx: number) {
    return this.rent.receiptById(this.rent.links()[catId + '-' + monthIdx]);
  }

  editEntry(catId: string, monthIdx: number): void {
    this.rent.openEditEntry({
      mode: 'edit',
      category: catId,
      houseId: this.rent.houseId(),
      month: monthIdx,
      amount: this.rent.amountOf(catId, monthIdx),
    });
  }
}
