import { Component, signal, inject, input, output, effect, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MONTH_NAMES } from '../../services/rent.service';
import { HouseVm } from '../../models/rent.vm';
import { CurrencyService } from '../../services/currency.service';

const ECATS = [
  { key: 'maint', label: 'Maintenance' },
  { key: 'tax',   label: 'Property Tax' },
  { key: 'water', label: 'Water' },
  { key: 'elec',  label: 'Electricity' },
  { key: 'gas',   label: 'Gas' },
  { key: 'loan',  label: 'Loan' },
  { key: 'ins',   label: 'Insurance' },
  { key: 'other', label: 'Other' },
];

const CAT_LABELS: Record<string, string> = Object.fromEntries(ECATS.map((c) => [c.key, c.label]));

export interface EntryCtx {
  mode: 'add' | 'edit';
  category?: string;
  houseId?: string;
  month?: number;
  amount?: number;
  notes?: string;
  roomId?: string;
  description?: string;
  contractor?: string;
}

export interface EntrySubmit {
  mode: 'add' | 'edit';
  category: string;
  houseId: string;
  month: number;
  year: number;
  value: number;
  notes: string;
  roomId: string;
  description: string;
  contractor: string;
}

@Component({
  selector: 'ps-entry-wizard',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (ctx()) {
      <div style="position:fixed;inset:0;z-index:200;display:flex;" (click)="closed.emit()" data-testid="entry-wizard-backdrop">
        <div style="flex:1;background:rgba(0,0,0,0.4);"></div>
        <div
          style="width:480px;background:var(--surface-card);height:100%;display:flex;flex-direction:column;"
          (click)="$event.stopPropagation()"
          data-testid="entry-wizard"
        >
          <!-- Header -->
          <div style="padding:20px 24px 16px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;gap:12px;">
            <div style="flex:1;">
              <h2 style="margin:0;font-size:var(--text-lg);font-weight:700;color:var(--text-heading);">
                {{ ctx()!.mode === 'edit' ? 'Edit entry' : 'Add entry' }}
              </h2>
              <p style="margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);">{{ catLabel }}</p>
            </div>
            <button type="button" (click)="closed.emit()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px;padding:4px;line-height:1;" data-testid="btn-close-wizard">✕</button>
          </div>

          <!-- Step rail -->
          <div style="padding:16px 24px 0;">
            <div style="display:flex;align-items:center;gap:6px;">
              @for (lbl of stepLabels; track $index; let i = $index) {
                <span
                  style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;flex:none;border-radius:50%;font-size:var(--text-xs);font-weight:700;"
                  [style.background]="i < step() ? 'var(--brand)' : i === step() ? 'var(--brand-tint)' : 'var(--surface-sunken)'"
                  [style.color]="i < step() ? '#fff' : i === step() ? 'var(--brand-on-tint)' : 'var(--text-faint)'"
                >
                  @if (i < step()) { ✓ } @else { {{ i + 1 }} }
                </span>
                <span
                  style="font-size:var(--text-xs);font-weight:600;"
                  [style.color]="i <= step() ? 'var(--text-heading)' : 'var(--text-faint)'"
                >{{ lbl }}</span>
                @if (i < stepLabels.length - 1) {
                  <span style="flex:1;height:1px;" [style.background]="i < step() ? 'var(--brand)' : 'var(--border-default)'"></span>
                }
              }
            </div>
          </div>

          <!-- Body -->
          <div style="flex:1;overflow-y:auto;padding:20px 24px;">

            <!-- Step 0: Type + House + Month -->
            @if (step() === 0) {
              <div style="display:flex;flex-direction:column;gap:16px;">
                <div>
                  <label style="display:block;font-size:var(--text-sm);font-weight:600;color:var(--text-heading);margin-bottom:8px;">Entry type</label>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;" data-testid="cat-grid">
                    @for (c of ecats; track c.key) {
                      <button
                        type="button"
                        (click)="cat.set(c.key)"
                        style="display:flex;align-items:center;gap:9px;padding:10px 12px;cursor:pointer;border-radius:var(--radius-md);text-align:left;font-size:var(--text-sm);"
                        [style.background]="cat() === c.key ? 'var(--brand-tint)' : 'var(--white, #fff)'"
                        [style.border]="'1px solid ' + (cat() === c.key ? 'var(--brand-on-tint)' : 'var(--border-default)')"
                        [style.color]="cat() === c.key ? 'var(--brand-on-tint)' : 'var(--text-body)'"
                        [style.fontWeight]="cat() === c.key ? '700' : '500'"
                        [attr.data-testid]="'cat-btn-' + c.key"
                      >{{ c.label }}</button>
                    }
                  </div>
                </div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                    House <span style="font-size:11px;color:var(--danger-fg);margin-left:4px;text-transform:uppercase;font-weight:600;">required</span>
                  </label>
                  <select class="ps-select" [(ngModel)]="houseId" name="houseId" data-testid="select-house">
                    <option value="" disabled>Choose a house</option>
                    @for (h of houses(); track h.id) {
                      <option [value]="h.id">{{ h.name }}</option>
                    }
                  </select>
                  @if (touched() && !houseId) {
                    <p style="margin:0;font-size:var(--text-xs);color:var(--danger-fg);">Choose a house.</p>
                  }
                </div>

                <div style="display:flex;gap:12px;">
                  <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Month</label>
                    <select class="ps-select" [(ngModel)]="month" name="month" data-testid="select-month">
                      @for (m of monthNames; track $index; let i = $index) {
                        <option [value]="i">{{ m }}</option>
                      }
                    </select>
                  </div>
                  <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">Year</label>
                    <input class="ps-input" [value]="year()" disabled style="opacity:0.6;cursor:not-allowed;"/>
                  </div>
                </div>
              </div>
            }

            <!-- Step 1: Details -->
            @if (step() === 1) {
              <div style="display:flex;flex-direction:column;gap:16px;">
                @if (cat() === 'maint') {
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                      Room <span style="font-size:11px;color:var(--text-faint);margin-left:4px;text-transform:uppercase;font-weight:600;">optional</span>
                    </label>
                    <select class="ps-select" [(ngModel)]="roomId" name="roomId" data-testid="select-room">
                      <option value="">Whole house</option>
                      @for (r of selectedHouse?.rooms ?? []; track r.id) {
                        <option [value]="r.id">{{ r.unit }}</option>
                      }
                    </select>
                  </div>
                }

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                    Amount <span style="font-size:11px;color:var(--danger-fg);margin-left:4px;text-transform:uppercase;font-weight:600;">required</span>
                  </label>
                  <div style="position:relative;">
                    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:var(--text-sm);pointer-events:none;">{{ currency.getSymbol() }}</span>
                    <input type="number" class="ps-input" [(ngModel)]="amount" name="amount" min="0" step="0.01" placeholder="0.00" style="padding-left:28px;" data-testid="input-amount"/>
                  </div>
                  @if (touched() && !(+amount > 0)) {
                    <p style="margin:0;font-size:var(--text-xs);color:var(--danger-fg);">Enter an amount.</p>
                  }
                </div>

                @if (cat() === 'maint') {
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                      Description <span style="font-size:11px;color:var(--danger-fg);margin-left:4px;text-transform:uppercase;font-weight:600;">required</span>
                    </label>
                    <input class="ps-input" [(ngModel)]="desc" name="desc" placeholder="e.g. HVAC service" data-testid="input-desc"/>
                    @if (touched() && !desc.trim()) {
                      <p style="margin:0;font-size:var(--text-xs);color:var(--danger-fg);">Description is required.</p>
                    }
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                      Contractor <span style="font-size:11px;color:var(--text-faint);margin-left:4px;text-transform:uppercase;font-weight:600;">optional</span>
                    </label>
                    <input class="ps-input" [(ngModel)]="contractor" name="contractor" placeholder="e.g. PlumbPro Ltd" data-testid="input-contractor"/>
                  </div>
                }

                <div style="display:flex;flex-direction:column;gap:6px;">
                  <label style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);">
                    Notes <span style="font-size:11px;color:var(--text-faint);margin-left:4px;text-transform:uppercase;font-weight:600;">optional</span>
                  </label>
                  <textarea class="ps-input" [(ngModel)]="notes" name="notes" rows="3" placeholder="Anything worth recording" style="resize:vertical;" data-testid="input-notes"></textarea>
                </div>
              </div>
            }

            <!-- Step 2: Review -->
            @if (step() === 2) {
              <div>
                <p style="margin:0 0 8px;font-size:var(--text-sm);color:var(--text-muted);">Review the entry before saving.</p>
                <div data-testid="review-rows">
                  @for (row of getReviewRows(); track row.k) {
                    <div style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid var(--border-subtle);">
                      <span style="font-size:var(--text-sm);color:var(--text-muted);">{{ row.k }}</span>
                      <span style="font-size:var(--text-sm);font-weight:600;color:var(--text-heading);text-align:right;">{{ row.v }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (err()) {
              <p style="margin:12px 0 0;font-size:var(--text-xs);color:var(--danger-fg);font-weight:600;" data-testid="entry-err">{{ err() }}</p>
            }
          </div>

          <!-- Footer -->
          <div style="padding:16px 24px;border-top:1px solid var(--border-default);display:flex;justify-content:flex-end;gap:10px;">
            @if (step() === 0) {
              <button type="button" (click)="closed.emit()" class="ps-btn ps-btn-ghost">Cancel</button>
              <button type="button" (click)="next()" class="ps-btn ps-btn-primary" data-testid="btn-next">Next →</button>
            } @else if (step() === 1) {
              <button type="button" (click)="back()" class="ps-btn ps-btn-ghost">← Back</button>
              <button type="button" (click)="next()" class="ps-btn ps-btn-primary" data-testid="btn-next-2">Next →</button>
            } @else {
              <button type="button" (click)="back()" class="ps-btn ps-btn-ghost">← Back</button>
              <button type="button" (click)="submit()" class="ps-btn ps-btn-primary" [disabled]="busy()" data-testid="btn-submit-entry">
                @if (busy()) { Saving… } @else { {{ ctx()!.mode === 'edit' ? 'Save changes' : 'Submit entry' }} }
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class EntryWizardComponent implements OnDestroy {
  readonly ctx    = input<EntryCtx | null>(null);
  readonly houses = input<HouseVm[]>([]);
  readonly year   = input<number>(new Date().getFullYear());

  readonly closed    = output<void>();
  readonly submitted = output<EntrySubmit>();

  readonly currency = inject(CurrencyService);

  readonly step    = signal(0);
  readonly cat     = signal('maint');
  readonly touched = signal(false);
  readonly err     = signal<string | null>(null);
  readonly busy    = signal(false);

  // ngModel-bound form fields
  houseId    = '';
  month      = new Date().getMonth();
  amount     = '';
  notes      = '';
  roomId     = '';
  desc       = '';
  contractor = '';

  readonly ecats      = ECATS;
  readonly monthNames = MONTH_NAMES;
  readonly stepLabels = ['Type', 'Details', 'Review'];

  get catLabel(): string { return CAT_LABELS[this.cat()] ?? 'Other'; }
  get selectedHouse(): HouseVm | undefined { return this.houses().find((h) => h.id === this.houseId); }

  getReviewRows(): Array<{ k: string; v: string }> {
    const house = this.selectedHouse;
    const rows: Array<{ k: string; v: string }> = [
      { k: 'Type',   v: this.catLabel },
      { k: 'House',  v: house?.name ?? '—' },
      { k: 'Period', v: MONTH_NAMES[this.month] + ' ' + this.year() },
      { k: 'Amount', v: this.currency.format(+this.amount || 0) },
    ];
    if (this.cat() === 'maint') {
      rows.push({ k: 'Room', v: this.roomId ? (house?.rooms.find((r) => r.id === this.roomId)?.unit ?? '—') : 'Whole house' });
      rows.push({ k: 'Description', v: this.desc.trim() || '—' });
      if (this.contractor.trim()) rows.push({ k: 'Contractor', v: this.contractor.trim() });
    }
    if (this.notes.trim()) rows.push({ k: 'Notes', v: this.notes.trim() });
    return rows;
  }

  private readonly keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.ctx()) this.closed.emit();
  };

  constructor() {
    effect(() => {
      const c = this.ctx();
      if (c) {
        this.step.set(c.mode === 'edit' ? 1 : 0);
        this.cat.set(c.category ?? 'maint');
        this.houseId    = c.houseId ?? (this.houses()[0]?.id ?? '');
        this.month      = c.month ?? new Date().getMonth();
        this.amount     = c.amount != null ? String(c.amount) : '';
        this.notes      = c.notes ?? '';
        this.roomId     = c.roomId ?? '';
        this.desc       = c.description ?? '';
        this.contractor = c.contractor ?? '';
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

  next(): void {
    const s = this.step();
    if (s === 0 && !this.houseId) {
      this.touched.set(true); this.err.set('Please choose a house.'); return;
    }
    if (s === 1) {
      if (!(+this.amount > 0)) {
        this.touched.set(true); this.err.set('Please enter a valid amount.'); return;
      }
      if (this.cat() === 'maint' && !this.desc.trim()) {
        this.touched.set(true); this.err.set('Description is required.'); return;
      }
    }
    this.touched.set(false);
    this.err.set(null);
    this.step.set(s + 1);
  }

  back(): void {
    this.touched.set(false);
    this.err.set(null);
    this.step.update((s) => Math.max(0, s - 1));
  }

  submit(): void {
    this.busy.set(true);
    setTimeout(() => {
      this.submitted.emit({
        mode:        this.ctx()!.mode,
        category:    this.cat(),
        houseId:     this.houseId,
        month:       +this.month,
        year:        this.year(),
        value:       +this.amount || 0,
        notes:       this.notes.trim(),
        roomId:      this.cat() === 'maint' ? this.roomId : '',
        description: this.cat() === 'maint' ? this.desc.trim() : '',
        contractor:  this.cat() === 'maint' ? this.contractor.trim() : '',
      });
      this.busy.set(false);
    }, 850);
  }
}
