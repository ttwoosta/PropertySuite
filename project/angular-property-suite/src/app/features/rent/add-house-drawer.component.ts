import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RightDrawerComponent } from '../../components/shared/right-drawer/right-drawer.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { TextInputComponent } from '../../components/shared/inputs/text-input.component';
import {
  AmountFieldComponent,
  FieldRowComponent,
  FormErrorComponent,
  SaveCtaComponent,
  StepperComponent,
  SummaryBlockComponent,
} from '../../components/shared/forms/form-primitives';
import { Saver } from '../../components/shared/forms/saver';
import { num } from '../../components/shared/forms/form-utils';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';

/**
 * Add House drawer, ported from `AddHouseDrawer`: address, room stepper, base
 * rent, a live summary, and validation. Driven by `RentService.addHouseOpen`.
 */
@Component({
  selector: 'app-add-house-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RightDrawerComponent,
    UiButtonComponent,
    TextInputComponent,
    AmountFieldComponent,
    FieldRowComponent,
    FormErrorComponent,
    SaveCtaComponent,
    StepperComponent,
    SummaryBlockComponent,
  ],
  template: `
    <ps-right-drawer
      [open]="rent.addHouseOpen()"
      icon="home"
      title="Add house"
      [subtitle]="addr().trim() || 'New property'"
      (closed)="rent.addHouseOpen.set(false)"
    >
      <div class="body">
        <ps-input
          label="Address"
          [value]="addr()"
          placeholder="e.g. 428 Maple Street, Madison WI"
          leadingIcon="map-pin"
          (valueChange)="addr.set($event)"
        ></ps-input>

        <ps-field-row>
          <div class="stack">
            <label class="lbl">Number of rooms</label>
            <ps-stepper [value]="rooms()" [min]="1" [max]="10" (valueChange)="rooms.set($event)"></ps-stepper>
          </div>
          <ps-amount-field
            label="Base rent"
            [labelTag]="{ tone: 'opt', label: 'per room' }"
            [value]="rentStr()"
            (valueChange)="rentStr.set($event)"
          ></ps-amount-field>
        </ps-field-row>

        <ps-summary-block
          [rows]="[{ label: rooms() + ' rooms × ' + currency.amount2(per()), value: currency.amount2(total()) }]"
          totalLabel="Monthly rent income"
          [totalValue]="currency.amount2(total())"
        ></ps-summary-block>

        <ps-form-error [message]="err()"></ps-form-error>
      </div>

      <ng-container drawer-footer>
        <ps-button variant="ghost" (clicked)="rent.addHouseOpen.set(false)">Cancel</ps-button>
        <ps-save-cta [busy]="saver.busy()" busyLabel="Saving…" icon="plus" label="Save" (clicked)="submit()"></ps-save-cta>
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
      .stack {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .lbl {
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        color: var(--text-heading);
      }
    `,
  ],
})
export class AddHouseDrawerComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);
  readonly saver = new Saver();

  readonly addr = signal('');
  readonly rooms = signal(3);
  readonly rentStr = signal('600');
  readonly err = signal<string | null>(null);

  readonly per = computed(() => num(this.rentStr()));
  readonly total = computed(() => this.per() * this.rooms());

  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = this.rent.addHouseOpen();
      if (open && !this.wasOpen) this.reset();
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  private reset(): void {
    this.addr.set('');
    this.rooms.set(3);
    this.rentStr.set('600');
    this.err.set(null);
  }

  submit(): void {
    if (this.per() <= 0) {
      this.err.set('Enter a base rent greater than ' + this.currency.amount2(0) + ' before saving.');
      return;
    }
    this.err.set(null);
    const payload = { address: this.addr().trim() || 'New house', rooms: this.rooms(), rent: this.per() };
    this.saver.run(() => this.rent.addHouse(payload));
  }
}
