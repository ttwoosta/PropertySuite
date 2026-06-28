import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { IconComponent } from '../../components/icon/icon.component';
import { IconButtonComponent } from '../../components/shared/icon-button/icon-button.component';
import { BadgeComponent } from '../../components/shared/badge/badge.component';
import { BtnSpinComponent } from '../../components/shared/forms/form-primitives';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { Receipt } from '../../models/rent.vm';
import { CAT_LABEL } from './rent.constants';

/**
 * Receipt Viewer dialog, ported from `ReceiptViewerDialog`: a custom
 * right-side panel showing a faux scanned-document preview, amount/date/notes,
 * and (when opened from an entry) an unlink-with-confirm action. Driven by
 * `RentService.viewerCtx`.
 */
@Component({
  selector: 'app-receipt-viewer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, IconButtonComponent, BadgeComponent, BtnSpinComponent],
  templateUrl: './receipt-viewer-dialog.component.html',
  styleUrl: './receipt-viewer-dialog.component.scss',
})
export class ReceiptViewerDialogComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);

  readonly confirm = signal(false);
  readonly busy = signal(false);

  readonly ctx = this.rent.viewerCtx;
  readonly receipt = computed<Receipt | null>(() => this.ctx()?.receipt ?? null);
  readonly fromEntry = computed(() => this.ctx()?.entryId);

  /** Faux-preview branch: 'placeholder' | 'image' | 'paper'. */
  readonly previewMode = computed<'placeholder' | 'image' | 'paper'>(() => {
    const r = this.receipt();
    if (!r || r.kind === 'other' || r.kind === 'none') return 'placeholder';
    if (r.kind === 'img' && r.url) return 'image';
    return 'paper';
  });

  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = !!this.ctx();
      if (open && !this.wasOpen) {
        this.confirm.set(false);
        this.busy.set(false);
      }
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  catLabel(r: Receipt): string {
    return CAT_LABEL[r.cat] || 'Other';
  }

  /** Subtotal/Tax split for the faux paper preview. */
  split(r: Receipt): { k: string; v: number }[] {
    return [
      { k: 'Subtotal', v: r.amount * 0.83 },
      { k: 'Tax', v: r.amount * 0.17 },
    ];
  }

  openExternal(): void {
    const url = this.receipt()?.url;
    if (url) window.open(url, '_blank');
  }

  unlink(): void {
    if (!this.confirm()) {
      this.confirm.set(true);
      return;
    }
    this.busy.set(true);
    const ctx = this.ctx();
    setTimeout(() => {
      if (ctx?.entryId) this.rent.unlinkReceipt(ctx.entryId);
    }, 750);
  }
}
