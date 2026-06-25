import { Component, signal, inject, input, output, effect, ElementRef, viewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CATEGORIES, MONTH_NAMES } from '../../services/rent.service';
import { HouseVm } from '../../models/rent.vm';
import { CurrencyService } from '../../services/currency.service';

const UPLOAD_CATS = [
  { key: 'maint',    label: 'Maintenance' },
  { key: 'tax',      label: 'Council Tax' },
  { key: 'water',    label: 'Water' },
  { key: 'elec',     label: 'Electricity' },
  { key: 'gas',      label: 'Gas' },
  { key: 'loan',     label: 'Mortgage' },
  { key: 'ins',      label: 'Insurance' },
  { key: 'supplies', label: 'Supplies' },
  { key: 'other',    label: 'Other' },
];

function kindOf(type: string): 'img' | 'pdf' | 'other' {
  if (/pdf/i.test(type)) return 'pdf';
  if (/^image\//i.test(type)) return 'img';
  return 'other';
}

function fileSize(b: number): string {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

export interface UploadedReceiptEvent {
  merchant: string;
  category: string;
  houseId: string;
  date: string;
  amount: number;
  notes: string;
  storagePath: string;
  kind: 'img' | 'pdf' | 'other';
}

@Component({
  selector: 'ps-upload-receipt-drawer',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;" (click)="closed.emit()" data-testid="upload-drawer-backdrop">
        <div style="flex:1;background:rgba(0,0,0,0.4);"></div>
        <div
          style="width:480px;background:var(--surface-card);height:100%;display:flex;flex-direction:column;"
          (click)="$event.stopPropagation()"
          data-testid="upload-drawer"
        >
          <!-- Header -->
          <div style="padding:20px 24px 16px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;gap:12px;">
            <div style="flex:1;">
              <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">Upload receipt</h2>
              <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">Add to your receipt library</p>
            </div>
            <button type="button" (click)="closed.emit()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;padding:4px;line-height:1;" data-testid="btn-close-upload">✕</button>
          </div>

          <!-- Body -->
          <div style="flex:1;overflow-y:auto;padding:20px 24px;">
            <div style="display:flex;flex-direction:column;gap:16px;">

              <!-- Hidden file input -->
              <input
                #fileInput
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                style="display:none;"
                (change)="onFileChange($event)"
                data-testid="file-input"
              />

              <!-- Drop zone / file preview -->
              <div>
                <label style="display:block;font-size:var(--text-sm);font-weight:600;color:var(--text-heading);margin-bottom:8px;">Receipt file</label>

                @if (!pickedFile()) {
                  <div
                    (click)="fileInput.click()"
                    (dragover)="drag.set(true); $event.preventDefault()"
                    (dragleave)="drag.set(false)"
                    (drop)="onDrop($event)"
                    style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:30px 18px;cursor:pointer;text-align:center;border-radius:var(--radius-md);"
                    [style.border]="'1.5px dashed ' + (drag() ? 'var(--brand)' : 'var(--border-strong)')"
                    [style.background]="drag() ? 'var(--brand-tint)' : 'var(--surface-sunken)'"
                    data-testid="drop-zone"
                  >
                    <span style="font-size:var(--text-sm);color:var(--text-body);">Drop image here or <span style="color:var(--brand-on-tint);font-weight:700;">browse</span></span>
                    <span style="font-size:var(--text-xs);color:var(--text-muted);">PNG, JPG or PDF · up to 10 MB</span>
                  </div>
                } @else {
                  <div style="display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--surface-card);" data-testid="file-preview">
                    <div style="width:44px;height:44px;flex:none;border-radius:var(--radius-sm);background:var(--surface-sunken);display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);color:var(--text-muted);font-weight:700;">
                      {{ pickedFile()!.kind === 'pdf' ? 'PDF' : pickedFile()!.kind === 'img' ? 'IMG' : '—' }}
                    </div>
                    <div style="flex:1;min-width:0;">
                      <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ pickedFile()!.name }}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-muted);">{{ pickedFile()!.sizeLabel }}</div>
                    </div>
                    <button type="button" (click)="pickedFile.set(null)" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;" data-testid="btn-remove-file">✕</button>
                  </div>
                }
              </div>

              <!-- Merchant -->
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                  Merchant <span style="font-size:11px;color:var(--danger-fg);margin-left:4px;text-transform:uppercase;font-weight:600;">required</span>
                </label>
                <input class="ps-input" [(ngModel)]="merchant" name="merchant" placeholder="e.g. British Gas" data-testid="input-merchant"/>
                @if (touched() && !merchant.trim()) {
                  <p style="margin:0;font-size:var(--text-xs);color:var(--danger-fg);">Merchant is required.</p>
                }
              </div>

              <!-- Category + House -->
              <div style="display:flex;gap:12px;">
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Category</label>
                  <select class="ps-select" [(ngModel)]="category" name="category" data-testid="select-category">
                    @for (c of uploadCats; track c.key) {
                      <option [value]="c.key">{{ c.label }}</option>
                    }
                  </select>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">House</label>
                  <select class="ps-select" [(ngModel)]="houseId" name="houseId" data-testid="select-house">
                    @for (h of houses(); track h.id) {
                      <option [value]="h.id">{{ h.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Date + Amount -->
              <div style="display:flex;gap:12px;">
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Issue date</label>
                  <input type="date" class="ps-input" [(ngModel)]="date" name="date" data-testid="input-date"/>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                    Total <span style="font-size:11px;color:var(--text-faint);margin-left:4px;text-transform:uppercase;font-weight:600;">optional</span>
                  </label>
                  <div style="position:relative;">
                    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm);pointer-events:none;">{{ currency.getSymbol() }}</span>
                    <input type="number" class="ps-input" [(ngModel)]="total" name="total" min="0" step="0.01" placeholder="0.00" style="padding-left:28px;" data-testid="input-total"/>
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                  Notes <span style="font-size:11px;color:var(--text-faint);margin-left:4px;text-transform:uppercase;font-weight:600;">optional</span>
                </label>
                <textarea class="ps-input" [(ngModel)]="uploadNotes" name="notes" rows="3" style="resize:vertical;" data-testid="input-notes"></textarea>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:16px 24px;border-top:1px solid var(--border-default);display:flex;align-items:center;gap:10px;">
            @if (err() && !busy()) {
              <span style="flex:1;font-size:var(--text-xs);color:var(--danger-fg);font-weight:600;" data-testid="upload-err">{{ err() }}</span>
            } @else {
              <span style="flex:1;"></span>
            }
            <button type="button" (click)="closed.emit()" class="ps-btn ps-btn-ghost">Cancel</button>
            <button type="button" (click)="submit()" class="ps-btn ps-btn-primary" [disabled]="busy() || !pickedFile()" data-testid="btn-upload">
              @if (busy()) { Uploading… } @else { Upload receipt }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UploadReceiptDrawerComponent implements OnDestroy {
  readonly open   = input(false);
  readonly houses = input<HouseVm[]>([]);

  readonly closed   = output<void>();
  readonly uploaded = output<UploadedReceiptEvent>();

  readonly currency = inject(CurrencyService);

  readonly drag      = signal(false);
  readonly touched   = signal(false);
  readonly err       = signal<string | null>(null);
  readonly busy      = signal(false);
  readonly pickedFile = signal<{ name: string; size: number; sizeLabel: string; kind: 'img' | 'pdf' | 'other' } | null>(null);

  // ngModel-bound form fields
  merchant    = '';
  category    = 'maint';
  houseId     = '';
  date        = new Date().toISOString().slice(0, 10);
  total       = '';
  uploadNotes = '';

  readonly uploadCats = UPLOAD_CATS;

  private readonly keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open()) this.closed.emit();
  };

  constructor() {
    effect(() => {
      if (this.open()) {
        const h = this.houses();
        this.merchant    = '';
        this.category    = 'maint';
        this.houseId     = h[0]?.id ?? '';
        this.date        = new Date().toISOString().slice(0, 10);
        this.total       = '';
        this.uploadNotes = '';
        this.pickedFile.set(null);
        this.drag.set(false);
        this.touched.set(false);
        this.err.set(null);
        document.addEventListener('keydown', this.keyHandler);
      } else {
        document.removeEventListener('keydown', this.keyHandler);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyHandler);
  }

  onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  private setFile(f: File): void {
    this.pickedFile.set({ name: f.name, size: f.size, sizeLabel: fileSize(f.size), kind: kindOf(f.type) });
  }

  submit(): void {
    this.touched.set(true);
    if (!this.pickedFile()) { this.err.set('Choose a receipt file to upload.'); return; }
    if (!this.merchant.trim()) { this.err.set('Add the merchant name before uploading.'); return; }
    this.err.set(null);
    this.busy.set(true);
    setTimeout(() => {
      this.uploaded.emit({
        merchant:    this.merchant.trim(),
        category:    this.category,
        houseId:     this.houseId,
        date:        this.date,
        amount:      parseFloat(this.total) || 0,
        notes:       this.uploadNotes.trim(),
        storagePath: this.pickedFile()!.name,
        kind:        this.pickedFile()!.kind,
      });
      this.busy.set(false);
    }, 1000);
  }
}
