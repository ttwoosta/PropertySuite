import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CardComponent } from '../../components/shared/card/card.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { KindChipComponent } from '../../components/shared/forms/form-primitives';
import { IconComponent } from '../../components/icon/icon.component';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { Category, Receipt } from '../../models/rent.vm';
import { CAT_LABEL } from './rent.constants';

/**
 * Receipts view, ported from `Receipts`: header (count, Upload) and a
 * responsive grid of receipt cards (tinted category icon area, kind chip,
 * merchant, date, amount). Clicking a card opens the viewer.
 */
@Component({
  selector: 'app-receipts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, UiButtonComponent, KindChipComponent, IconComponent],
  template: `
    <div class="ps-fade">
      <div class="rcpt__head">
        <div class="rcpt__head-main">
          <div class="rcpt__title">Receipts · {{ rent.year() }}</div>
          <div class="rcpt__sub">{{ rent.receipts().length }} receipts on file</div>
        </div>
        <ps-button variant="primary" (clicked)="rent.openUpload()">
          <ps-icon name="upload" [size]="16"></ps-icon>Upload receipt
        </ps-button>
      </div>

      <div class="rcpt__grid">
        @for (rc of rent.receipts(); track rc.id) {
          <ps-card padding="0" [interactive]="true" class="rcpt__card" (click)="rent.openViewer(rc)">
            <div class="rcpt__thumb" [style.background]="thumbBg(rc)" [style.color]="cat(rc).color">
              <span class="rcpt__kind"><ps-kind-chip [kind]="rc.kind"></ps-kind-chip></span>
              <ps-icon [name]="cat(rc).icon" [size]="28"></ps-icon>
              <span class="rcpt__cat">{{ cat(rc).label }}</span>
            </div>
            <div class="rcpt__body">
              <div class="rcpt__merchant">{{ rc.merchant }}</div>
              <div class="rcpt__meta">
                <span class="rcpt__date">{{ rc.date }}</span>
                <span class="ps-mono rcpt__amount">{{ currency.format(rc.amount) }}</span>
              </div>
            </div>
          </ps-card>
        }
      </div>
    </div>
  `,
  styleUrl: './receipts.component.scss',
})
export class ReceiptsComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);

  cat(rc: Receipt): Category {
    return (
      this.rent.catById[rc.cat] ?? {
        id: rc.cat,
        color: 'var(--gray-500)',
        icon: 'receipt',
        label: CAT_LABEL[rc.cat] || 'Other',
      }
    );
  }

  thumbBg(rc: Receipt): string {
    return `color-mix(in srgb, ${this.cat(rc).color} 9%, var(--surface-sunken))`;
  }
}
