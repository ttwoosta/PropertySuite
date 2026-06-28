import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RightDrawerComponent } from '../../components/shared/right-drawer/right-drawer.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { TextInputComponent } from '../../components/shared/inputs/text-input.component';
import { BtnSpinComponent, KindChipComponent } from '../../components/shared/forms/form-primitives';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { Receipt } from '../../models/rent.vm';

/**
 * Receipt Picker dialog, ported from `ReceiptPickerDialog`: a `RightDrawer`
 * that lists unlinked receipts with a search box, skeleton loading, an empty
 * state, and a per-row linking spinner. Driven by `RentService.pickerCtx`.
 */
@Component({
  selector: 'app-receipt-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RightDrawerComponent, UiButtonComponent, IconComponent, TextInputComponent, BtnSpinComponent, KindChipComponent],
  template: `
    <ps-right-drawer
      [open]="!!rent.pickerCtx()"
      title="Attach receipt"
      [subtitle]="rent.pickerCtx()?.label || ''"
      (closed)="rent.pickerCtx.set(null)"
    >
      <div class="pick">
        <ps-input placeholder="Search by merchant" [value]="q()" leadingIcon="search" (valueChange)="q.set($event)"></ps-input>

        @if (loading()) {
          <div class="skel">
            @for (i of [0, 1, 2]; track i) {
              <div class="skel__row">
                <div class="ps-shimmer skel__thumb"></div>
                <div class="skel__lines">
                  <div class="ps-shimmer skel__line skel__line--lg"></div>
                  <div class="ps-shimmer skel__line skel__line--sm"></div>
                </div>
                <div class="ps-shimmer skel__amt"></div>
              </div>
            }
          </div>
        } @else if (list().length === 0) {
          <div class="empty">
            <span class="empty__icon"><ps-icon name="image-off" [size]="23"></ps-icon></span>
            <div class="empty__title">No unlinked receipts</div>
            <div class="empty__body">Nothing matches for this property. Upload a receipt to attach it here.</div>
            <ps-button variant="ghost" (clicked)="goUpload()"><ps-icon name="upload" [size]="16"></ps-icon>Upload a receipt</ps-button>
          </div>
        } @else {
          <div class="list" [class.list--linking]="!!linking()">
            @for (r of list(); track r.id) {
              <button class="item" (click)="pick(r)">
                <ps-kind-chip [kind]="r.kind"></ps-kind-chip>
                <div class="item__main">
                  <div class="item__merchant">{{ r.merchant }}</div>
                  <div class="item__date">{{ r.date }}</div>
                </div>
                @if (linking() === r.id) {
                  <ps-btn-spin></ps-btn-spin>
                } @else {
                  <span class="ps-mono item__amount">{{ currency.format(r.amount) }}</span>
                }
              </button>
            }
          </div>
        }
      </div>
    </ps-right-drawer>
  `,
  styleUrl: './receipt-picker-dialog.component.scss',
})
export class ReceiptPickerDialogComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);

  readonly loading = signal(true);
  readonly q = signal('');
  readonly linking = signal<string | null>(null);

  readonly list = computed<Receipt[]>(() => {
    const query = this.q().trim().toLowerCase();
    return this.rent.unlinkedReceipts().filter((r) => r.merchant.toLowerCase().includes(query));
  });

  private wasOpen = false;
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const open = !!this.rent.pickerCtx();
      if (open && !this.wasOpen) {
        this.loading.set(true);
        this.q.set('');
        this.linking.set(null);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.loading.set(false), 850);
      }
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  pick(r: Receipt): void {
    if (this.linking()) return;
    this.linking.set(r.id);
    const ctx = this.rent.pickerCtx();
    setTimeout(() => {
      if (ctx) this.rent.attachReceipt(ctx.entryId, r.id);
    }, 700);
  }

  goUpload(): void {
    this.rent.pickerCtx.set(null);
    this.rent.openUpload();
  }
}
