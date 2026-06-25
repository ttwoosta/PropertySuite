import { Component, signal, inject, input, output, effect, OnDestroy } from '@angular/core';
import { CATEGORIES } from '../../services/rent.service';
import { ReceiptVm } from '../../models/rent.vm';
import { CurrencyService } from '../../services/currency.service';

export interface ViewerCtx { receipt: ReceiptVm; entryId?: string }

const CAT_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

@Component({
  selector: 'ps-receipt-viewer-dialog',
  standalone: true,
  template: `
    @if (ctx()) {
      <!-- Backdrop -->
      <div
        style="position:fixed;inset:0;z-index:200;"
        (click)="closed.emit()"
        data-testid="viewer-backdrop"
      ></div>

      <!-- Panel -->
      <div
        style="position:fixed;top:0;right:0;bottom:0;width:100%;max-width:480px;background:var(--surface-card);border-left:1px solid var(--border-default);box-shadow:var(--shadow-lg);display:flex;flex-direction:column;z-index:201;"
        (click)="$event.stopPropagation()"
        data-testid="receipt-viewer"
      >
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--border-subtle);">
          <div style="flex:1;min-width:0;display:flex;align-items:center;gap:10px;">
            <span style="font-size:var(--text-lg);font-weight:700;color:var(--text-heading);letter-spacing:-0.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" data-testid="viewer-merchant">
              {{ ctx()!.receipt.merchant }}
            </span>
            <span
              style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:var(--radius-pill);font-size:var(--text-xs);font-weight:600;"
              style="background:var(--surface-sunken);color:var(--text-muted);"
              data-testid="viewer-category"
            >{{ catLabel(ctx()!.receipt.category) }}</span>
          </div>
          <div style="display:flex;gap:2px;">
            @if (ctx()!.receipt.storagePath) {
              <button type="button" title="Open in new tab" style="background:none;border:none;cursor:pointer;padding:6px;color:var(--text-muted);border-radius:var(--radius-sm);" (click)="openExternal()">↗</button>
            }
            <button type="button" title="Close" style="background:none;border:none;cursor:pointer;padding:6px;color:var(--text-muted);border-radius:var(--radius-sm);" (click)="closed.emit()" data-testid="btn-close-viewer">✕</button>
          </div>
        </div>

        <!-- Receipt preview area -->
        <div style="flex:1;overflow-y:auto;padding:22px;background:var(--surface-sunken);">
          <!-- Faux receipt mock -->
          <div style="min-height:260px;display:flex;align-items:center;justify-content:center;">
            <div
              style="position:relative;width:230px;max-width:88%;margin:0 auto;background:#fff;color:#1a1a1a;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,0.22);padding:20px 20px 26px;"
              data-testid="faux-receipt"
            >
              @if (ctx()!.receipt.kind === 'pdf') {
                <span style="position:absolute;top:10px;right:10px;font-size:10px;font-weight:800;color:#D23A40;letter-spacing:0.5px;">PDF</span>
              }
              @if (ctx()!.receipt.kind === 'img') {
                <span style="position:absolute;top:10px;right:10px;font-size:10px;font-weight:800;color:#3E78B8;letter-spacing:0.5px;">IMG</span>
              }
              <div style="text-align:center;font-weight:800;font-size:15px;letter-spacing:-0.01em;">{{ ctx()!.receipt.merchant }}</div>
              <div style="text-align:center;font-size:10px;color:#888;margin-top:2px;">{{ ctx()!.receipt.date }}</div>
              <div style="border-top:1px dashed #ccc;margin:14px 0 10px;"></div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#444;padding:3px 0;">
                <span>Subtotal</span>
                <span>{{ currency.format(ctx()!.receipt.amount * 0.83) }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#444;padding:3px 0;">
                <span>Tax</span>
                <span>{{ currency.format(ctx()!.receipt.amount * 0.17) }}</span>
              </div>
              <div style="border-top:1px solid #222;margin:8px 0;"></div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;">
                <span>TOTAL</span>
                <span>{{ currency.format(ctx()!.receipt.amount) }}</span>
              </div>
              <div style="text-align:center;font-size:9px;color:#aaa;margin-top:16px;letter-spacing:1px;">· · · · · · · · · · ·</div>
            </div>
          </div>

          <!-- Metadata card -->
          <div style="margin-top:18px;background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:14px 16px;" data-testid="viewer-meta">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
              <span style="font-size:var(--text-sm);color:var(--text-muted);">{{ ctx()!.receipt.date }}</span>
              <span class="ps-mono" style="font-size:var(--text-lg);font-weight:700;color:var(--brand-on-tint);">{{ currency.format(ctx()!.receipt.amount) }}</span>
            </div>
            @if (ctx()!.receipt.notes) {
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);line-height:1.5;" data-testid="viewer-notes">
                {{ ctx()!.receipt.notes }}
              </div>
            }
          </div>
        </div>

        <!-- Footer (unlink, only when opened from an expense entry) -->
        @if (ctx()!.entryId != null) {
          <div style="display:flex;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--border-subtle);" data-testid="viewer-footer">
            <button
              type="button"
              (click)="unlink()"
              [disabled]="busy()"
              style="display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:var(--radius-md);cursor:pointer;font-size:var(--text-sm);font-weight:600;border:none;"
              [style.background]="confirm() ? 'var(--danger-solid)' : 'var(--danger-bg)'"
              [style.color]="confirm() ? '#fff' : 'var(--danger-fg)'"
              data-testid="btn-unlink"
            >
              @if (busy()) { Unlinking… }
              @else if (confirm()) { ⚠ Confirm unlink }
              @else { Unlink from entry }
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class ReceiptViewerDialogComponent implements OnDestroy {
  readonly ctx = input<ViewerCtx | null>(null);

  readonly closed   = output<void>();
  readonly unlinked = output<ViewerCtx>();

  readonly currency = inject(CurrencyService);

  readonly confirm = signal(false);
  readonly busy    = signal(false);

  private readonly keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.ctx()) this.closed.emit();
  };

  constructor() {
    effect(() => {
      if (this.ctx()) {
        this.confirm.set(false);
        this.busy.set(false);
        document.addEventListener('keydown', this.keyHandler);
      } else {
        document.removeEventListener('keydown', this.keyHandler);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyHandler);
  }

  catLabel(id: string): string { return CAT_LABEL[id] ?? 'Other'; }

  openExternal(): void {
    const path = this.ctx()?.receipt.storagePath;
    if (path) window.open(path, '_blank');
  }

  unlink(): void {
    if (!this.confirm()) { this.confirm.set(true); return; }
    this.busy.set(true);
    setTimeout(() => {
      this.unlinked.emit(this.ctx()!);
      this.busy.set(false);
    }, 750);
  }
}
