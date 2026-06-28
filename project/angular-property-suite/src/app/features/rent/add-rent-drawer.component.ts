import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RightDrawerComponent } from '../../components/shared/right-drawer/right-drawer.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { TextInputComponent } from '../../components/shared/inputs/text-input.component';
import { IconComponent } from '../../components/icon/icon.component';
import {
  AmountFieldComponent,
  FormErrorComponent,
  SaveCtaComponent,
  SummaryBlockComponent,
} from '../../components/shared/forms/form-primitives';
import { BadgeTone } from '../../components/shared/badge/badge.component';
import { Saver } from '../../components/shared/forms/saver';
import { num } from '../../components/shared/forms/form-utils';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { RoomStatus } from '../../models/rent.vm';

/**
 * Add Rent drawer, ported from `AddRentDrawer`: renter, amount due, amount
 * received, a "mark as paid" shortcut, and a status summary. Driven by
 * `RentService.addRentCtx`.
 */
@Component({
  selector: 'app-add-rent-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RightDrawerComponent,
    UiButtonComponent,
    TextInputComponent,
    IconComponent,
    AmountFieldComponent,
    FormErrorComponent,
    SaveCtaComponent,
    SummaryBlockComponent,
  ],
  template: `
    <ps-right-drawer
      [open]="!!rent.addRentCtx()"
      icon="wallet"
      [title]="'Add rent' + (ctx() ? ' · ' + ctx()!.room.unit : '')"
      [subtitle]="ctx()?.houseName || ''"
      (closed)="rent.addRentCtx.set(null)"
    >
      @if (ctx(); as c) {
        <div class="body">
          <div class="ctx">{{ c.houseName }} · {{ c.period }}</div>

          <ps-input
            label="Renter"
            [labelTag]="{ tone: 'req', label: 'required' }"
            [value]="renter()"
            [error]="show('renter')"
            placeholder="Tenant name"
            leadingIcon="user"
            (valueChange)="renter.set($event)"
            (blurred)="touch('renter')"
          ></ps-input>

          <ps-amount-field
            label="Amount due"
            [labelTag]="{ tone: 'req', label: 'required' }"
            [value]="due()"
            [error]="show('due')"
            (valueChange)="due.set($event)"
            (blurred)="touch('due')"
          ></ps-amount-field>

          <ps-amount-field
            label="Amount received"
            [labelTag]="{ tone: 'opt', label: 'leave 0 if not yet paid' }"
            [value]="recv()"
            (valueChange)="recv.set($event)"
          ></ps-amount-field>

          <button class="mark" [class.mark--on]="paidFull()" (click)="togglePaid()">
            <span class="mark__icon" [class.mark__icon--on]="paidFull()">
              <ps-icon [name]="paidFull() ? 'check' : 'badge-check'" [size]="16"></ps-icon>
            </span>
            <span class="mark__text">
              <span class="mark__title">Mark as paid</span>
              <span class="mark__sub">Fill received with {{ currency.amount2(dueN()) }} due</span>
            </span>
          </button>

          <ps-summary-block
            [rows]="[{ label: 'Received', badge: { tone: badgeTone(), label: status() }, value: currency.amount2(recvN()) }]"
            totalLabel="Rent due"
            [totalValue]="currency.amount2(dueN())"
          ></ps-summary-block>

          <ps-form-error [message]="err()"></ps-form-error>
        </div>
      }

      <ng-container drawer-footer>
        <ps-button variant="ghost" (clicked)="rent.addRentCtx.set(null)">Cancel</ps-button>
        <ps-save-cta [busy]="saver.busy()" busyLabel="Saving…" icon="check" label="Add rent" (clicked)="submit()"></ps-save-cta>
      </ng-container>
    </ps-right-drawer>
  `,
  styleUrl: './add-rent-drawer.component.scss',
})
export class AddRentDrawerComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);
  readonly saver = new Saver();

  readonly ctx = this.rent.addRentCtx;

  readonly renter = signal('');
  readonly due = signal('');
  readonly recv = signal('');
  readonly touched = signal<Record<string, boolean>>({});
  readonly err = signal<string | null>(null);

  readonly dueN = computed(() => num(this.due()));
  readonly recvN = computed(() => num(this.recv()));
  readonly status = computed<RoomStatus>(() =>
    this.recvN() <= 0 ? 'Pending' : this.recvN() >= this.dueN() ? 'Paid' : 'Partial',
  );
  readonly paidFull = computed(() => this.recvN() > 0 && this.recvN() >= this.dueN());

  private wasOpen = false;

  constructor() {
    effect(() => {
      const c = this.rent.addRentCtx();
      const open = !!c;
      if (open && !this.wasOpen && c) {
        this.renter.set(c.room.tenant || '');
        this.due.set(String(c.room.rent));
        this.recv.set(c.room.paid ? String(c.room.paid) : '');
        this.touched.set({});
        this.err.set(null);
      }
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  badgeTone(): BadgeTone {
    return this.status() === 'Paid' ? 'success' : this.status() === 'Partial' ? 'warning' : 'neutral';
  }

  show(k: 'renter' | 'due'): string | null {
    if (!this.touched()[k]) return null;
    if (k === 'renter') return !this.renter().trim() ? 'Renter is required.' : null;
    return this.dueN() <= 0 ? 'Enter the amount due.' : null;
  }

  touch(k: string): void {
    this.touched.update((t) => ({ ...t, [k]: true }));
  }

  togglePaid(): void {
    this.recv.set(this.paidFull() ? '0' : this.dueN() ? String(this.dueN()) : '');
  }

  submit(): void {
    this.touched.set({ renter: true, due: true });
    if (!this.renter().trim() || this.dueN() <= 0) {
      this.err.set('Fix the highlighted fields before saving.');
      return;
    }
    this.err.set(null);
    const c = this.rent.addRentCtx();
    if (!c) return;
    const updated = {
      ...c.room,
      tenant: this.renter().trim(),
      rent: this.dueN(),
      paid: this.recvN(),
      status: this.status(),
    };
    this.saver.run(() => this.rent.recordRent(updated));
  }
}
