import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RightDrawerComponent } from '../../components/shared/right-drawer/right-drawer.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { TextInputComponent } from '../../components/shared/inputs/text-input.component';
import { SelectInputComponent } from '../../components/shared/inputs/select-input.component';
import {
  AmountFieldComponent,
  FieldRowComponent,
  FormErrorComponent,
  SaveCtaComponent,
  SummaryBlockComponent,
} from '../../components/shared/forms/form-primitives';
import { Saver } from '../../components/shared/forms/saver';
import { num } from '../../components/shared/forms/form-utils';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';

/**
 * Edit Room drawer, ported from `EditRoomDrawer`: room name, status, renter
 * (required when occupied), base rent, with per-field validation. Driven by
 * `RentService.editRoomCtx`.
 */
@Component({
  selector: 'app-edit-room-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RightDrawerComponent,
    UiButtonComponent,
    TextInputComponent,
    SelectInputComponent,
    AmountFieldComponent,
    FieldRowComponent,
    FormErrorComponent,
    SaveCtaComponent,
    SummaryBlockComponent,
  ],
  template: `
    <ps-right-drawer
      [open]="!!rent.editRoomCtx()"
      icon="building-2"
      title="Edit room"
      [subtitle]="rent.house().name"
      (closed)="rent.editRoomCtx.set(null)"
    >
      @if (rent.editRoomCtx(); as room) {
        <div class="body">
          <ps-field-row>
            <ps-input
              label="Room name"
              [labelTag]="{ tone: 'req', label: 'required' }"
              [value]="name()"
              [error]="show('name')"
              placeholder="e.g. Room 3"
              (valueChange)="name.set($event)"
              (blurred)="touch('name')"
            ></ps-input>
            <ps-select
              label="Status"
              [value]="status()"
              [options]="statusOptions"
              (valueChange)="status.set($event)"
            ></ps-select>
          </ps-field-row>

          <ps-input
            label="Renter"
            [labelTag]="{ tone: occupied() ? 'req' : 'opt', label: occupied() ? 'required' : 'optional' }"
            [value]="renter()"
            [error]="show('renter')"
            [placeholder]="occupied() ? 'Tenant name' : 'No renter'"
            leadingIcon="user"
            (valueChange)="renter.set($event)"
            (blurred)="touch('renter')"
          ></ps-input>

          <ps-amount-field
            label="Base rent"
            [labelTag]="{ tone: 'opt', label: 'per month' }"
            [value]="rentStr()"
            [error]="show('rent')"
            (valueChange)="rentStr.set($event)"
            (blurred)="touch('rent')"
          ></ps-amount-field>

          <ps-summary-block
            [rows]="[{ label: 'Monthly rent', value: currency.amount2(num(rentStr())) }]"
            totalLabel="Monthly rent"
            [totalValue]="currency.amount2(num(rentStr()))"
          ></ps-summary-block>

          <ps-form-error [message]="err()"></ps-form-error>
        </div>
      }

      <ng-container drawer-footer>
        <ps-button variant="ghost" (clicked)="rent.editRoomCtx.set(null)">Cancel</ps-button>
        <ps-save-cta [busy]="saver.busy()" busyLabel="Saving…" icon="check" label="Save room" (clicked)="submit()"></ps-save-cta>
      </ng-container>
    </ps-right-drawer>
  `,
  styles: [
    `
      .body {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    `,
  ],
})
export class EditRoomDrawerComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);
  readonly saver = new Saver();
  readonly num = num;

  readonly statusOptions = [
    { value: 'Occupied', label: 'Occupied' },
    { value: 'Vacant', label: 'Vacant' },
  ];

  readonly name = signal('');
  readonly status = signal('Vacant');
  readonly renter = signal('');
  readonly rentStr = signal('');
  readonly touched = signal<Record<string, boolean>>({});
  readonly err = signal<string | null>(null);

  readonly occupied = computed(() => this.status() === 'Occupied');
  readonly errs = computed(() => ({
    name: !this.name().trim() ? 'Room name is required.' : null,
    renter: this.occupied() && !this.renter().trim() ? 'A renter is required for occupied rooms.' : null,
    rent: num(this.rentStr()) <= 0 ? 'Enter the monthly rent.' : null,
  }));

  private wasOpen = false;

  constructor() {
    effect(() => {
      const room = this.rent.editRoomCtx();
      const open = !!room;
      if (open && !this.wasOpen && room) {
        this.name.set(room.unit);
        this.status.set(room.tenant ? 'Occupied' : 'Vacant');
        this.renter.set(room.tenant || '');
        this.rentStr.set(String(room.rent));
        this.touched.set({});
        this.err.set(null);
      }
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  show(k: 'name' | 'renter' | 'rent'): string | null {
    return this.touched()[k] ? this.errs()[k] : null;
  }

  touch(k: string): void {
    this.touched.update((t) => ({ ...t, [k]: true }));
  }

  submit(): void {
    this.touched.set({ name: true, renter: true, rent: true });
    const e = this.errs();
    if (e.name || e.renter || e.rent) {
      this.err.set('Fix the highlighted fields before saving.');
      return;
    }
    this.err.set(null);
    const room = this.rent.editRoomCtx();
    if (!room) return;
    const updated = {
      ...room,
      unit: this.name().trim(),
      tenant: this.occupied() ? this.renter().trim() : null,
      rent: num(this.rentStr()),
    };
    this.saver.run(() => this.rent.saveRoom(updated));
  }
}
