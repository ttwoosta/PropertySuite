import { Component, signal, inject, input, output, effect, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CATEGORIES } from '../../services/rent.service';
import { ReceiptVm } from '../../models/rent.vm';
import { CurrencyService } from '../../services/currency.service';

export interface PickerCtx { entryId: string; label: string }

const CAT_COLOR: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));

@Component({
  selector: 'ps-receipt-picker-dialog',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (ctx()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;" (click)="closed.emit()" data-testid="picker-backdrop">
        <div style="flex:1;background:rgba(0,0,0,0.4);"></div>
        <div
          style="width:480px;background:var(--surface-card);height:100%;display:flex;flex-direction:column;"
          (click)="$event.stopPropagation()"
          data-testid="receipt-picker"
        >
          <!-- Header -->
          <div style="padding:20px 24px 16px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;gap:12px;">
            <div style="flex:1;">
              <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">Attach receipt</h2>
              @if (ctx()!.label) {
                <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ ctx()!.label }}</p>
              }
            </div>
            <button type="button" (click)="closed.emit()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;padding:4px;line-height:1;" data-testid="btn-close-picker">✕</button>
          </div>

          <!-- Search -->
          <div style="padding:12px 24px;border-bottom:1px solid var(--border-subtle);">
            <div style="position:relative;">
              <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;">🔍</span>
              <input
                class="ps-input"
                [(ngModel)]="query"
                name="query"
                placeholder="Search by merchant"
                style="padding-left:34px;"
                data-testid="picker-search"
              />
            </div>
          </div>

          <!-- Body -->
          <div style="flex:1;overflow-y:auto;padding:16px 24px;">

            @if (loading()) {
              <!-- Skeleton -->
              <div style="display:flex;flex-direction:column;gap:8px;" data-testid="picker-loading">
                @for (i of [0, 1, 2]; track i) {
                  <div style="display:flex;align-items:center;gap:12px;padding:12px 13px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
                    <div class="ps-shimmer" style="width:38px;height:38px;border-radius:var(--radius-sm);flex:none;"></div>
                    <div style="flex:1;display:flex;flex-direction:column;gap:7px;">
                      <div class="ps-shimmer" style="width:55%;height:11px;border-radius:4px;"></div>
                      <div class="ps-shimmer" style="width:32%;height:9px;border-radius:4px;"></div>
                    </div>
                    <div class="ps-shimmer" style="width:46px;height:11px;border-radius:4px;"></div>
                  </div>
                }
              </div>

            } @else if (filteredReceipts().length === 0) {
              <!-- Empty state -->
              <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:38px 18px;" data-testid="picker-empty">
                <div style="width:48px;height:48px;border-radius:var(--radius-lg);background:var(--surface-sunken);display:flex;align-items:center;justify-content:center;font-size:24px;">🖼️</div>
                <div style="font-size:var(--text-base);font-weight:700;color:var(--text-heading);">No unlinked receipts</div>
                <div style="font-size:var(--text-sm);color:var(--text-muted);max-width:240px;">Nothing matches for this property. Upload a receipt to attach it here.</div>
                <button type="button" (click)="uploadRequested.emit()" class="ps-btn ps-btn-ghost" style="margin-top:4px;" data-testid="btn-upload-from-picker">Upload a receipt</button>
              </div>

            } @else {
              <!-- Receipt list -->
              <div
                style="display:flex;flex-direction:column;gap:8px;"
                [style.pointerEvents]="linking() ? 'none' : 'auto'"
                [style.opacity]="linking() ? '0.65' : '1'"
                data-testid="picker-list"
              >
                @for (r of filteredReceipts(); track r.id) {
                  <button
                    type="button"
                    (click)="pick(r)"
                    style="display:flex;align-items:center;gap:12px;padding:11px 13px;cursor:pointer;text-align:left;border-radius:var(--radius-md);background:var(--surface-card);border:1px solid var(--border-default);width:100%;"
                    [attr.data-testid]="'receipt-' + r.id"
                  >
                    <!-- Kind chip -->
                    <span
                      style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.3px;flex:none;"
                      [style.color]="kindChipColor(r.kind)"
                      [style.background]="kindChipBg(r.kind)"
                    >{{ r.kind === 'pdf' ? 'PDF' : r.kind === 'img' ? 'IMG' : '—' }}</span>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-heading);">{{ r.merchant }}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-muted);">{{ r.date }}</div>
                    </div>
                    @if (linking() === r.id) {
                      <span style="font-size:var(--text-xs);color:var(--text-muted);">Linking…</span>
                    } @else {
                      <span class="ps-mono" style="font-size:var(--text-sm);font-weight:700;color:var(--text-heading);">{{ currency.format(r.amount) }}</span>
                    }
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ReceiptPickerDialogComponent implements OnDestroy {
  readonly ctx      = input<PickerCtx | null>(null);
  readonly receipts = input<ReceiptVm[]>([]);

  readonly closed          = output<void>();
  readonly picked          = output<ReceiptVm>();
  readonly uploadRequested = output<void>();

  readonly currency = inject(CurrencyService);

  readonly loading = signal(true);
  readonly linking = signal<string | null>(null);

  // ngModel-bound
  query = '';

  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.ctx()) this.closed.emit();
  };

  constructor() {
    effect(() => {
      const c = this.ctx();
      if (c) {
        this.query = '';
        this.linking.set(null);
        this.loading.set(true);
        this.loadingTimer = setTimeout(() => this.loading.set(false), 850);
        document.addEventListener('keydown', this.keyHandler);
      } else {
        if (this.loadingTimer) clearTimeout(this.loadingTimer);
        document.removeEventListener('keydown', this.keyHandler);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
    document.removeEventListener('keydown', this.keyHandler);
  }

  get filteredReceipts(): () => ReceiptVm[] {
    return () => {
      const q = this.query.trim().toLowerCase();
      return q ? this.receipts().filter((r) => r.merchant.toLowerCase().includes(q)) : this.receipts();
    };
  }

  pick(r: ReceiptVm): void {
    this.linking.set(r.id);
    setTimeout(() => this.picked.emit(r), 700);
  }

  kindChipColor(kind: string): string {
    return kind === 'pdf' ? 'var(--danger-fg)' : kind === 'img' ? 'var(--brand)' : 'var(--text-faint)';
  }

  kindChipBg(kind: string): string {
    if (kind === 'pdf') return 'color-mix(in srgb, var(--danger-fg) 14%, transparent)';
    if (kind === 'img') return 'color-mix(in srgb, var(--brand) 14%, transparent)';
    return 'var(--surface-sunken)';
  }
}
