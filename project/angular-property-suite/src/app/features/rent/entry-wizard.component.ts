import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RightDrawerComponent } from '../../components/shared/right-drawer/right-drawer.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { TextInputComponent } from '../../components/shared/inputs/text-input.component';
import { SelectInputComponent, SelectOption } from '../../components/shared/inputs/select-input.component';
import { TextareaInputComponent } from '../../components/shared/inputs/textarea-input.component';
import {
  AmountFieldComponent,
  FieldRowComponent,
  FormErrorComponent,
  SaveCtaComponent,
  StepRailComponent,
} from '../../components/shared/forms/form-primitives';
import { Saver } from '../../components/shared/forms/saver';
import { num } from '../../components/shared/forms/form-utils';
import { CurrencyService } from '../../services/currency.service';
import { RentService } from '../../services/rent.service';
import { House } from '../../models/rent.vm';
import { CAT_LABEL, ECATS, MONTH_NAMES } from './rent.constants';

interface StepErrs {
  house?: string;
  amount?: string;
  desc?: string;
}

/**
 * Add / Edit Entry wizard, ported from `EntryWizard`: 3 steps (Type →
 * Details → Review). Driven by `RentService.entryCtx`. Maintenance entries
 * get extra fields (room, description, contractor).
 */
@Component({
  selector: 'app-entry-wizard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RightDrawerComponent,
    UiButtonComponent,
    IconComponent,
    TextInputComponent,
    SelectInputComponent,
    TextareaInputComponent,
    AmountFieldComponent,
    FieldRowComponent,
    FormErrorComponent,
    SaveCtaComponent,
    StepRailComponent,
  ],
  templateUrl: './entry-wizard.component.html',
  styleUrl: './entry-wizard.component.scss',
})
export class EntryWizardComponent {
  readonly rent = inject(RentService);
  readonly currency = inject(CurrencyService);
  readonly saver = new Saver();
  readonly num = num;

  readonly ecats = ECATS;

  readonly step = signal(0);
  readonly cat = signal('maint');
  readonly houseId = signal('');
  readonly month = signal(5);
  readonly amount = signal('');
  readonly notes = signal('');
  readonly roomId = signal('');
  readonly desc = signal('');
  readonly contractor = signal('');
  readonly touched = signal(false);
  readonly err = signal<string | null>(null);

  readonly edit = computed(() => this.rent.entryCtx()?.mode === 'edit');
  readonly isMaint = computed(() => this.cat() === 'maint');
  readonly catLabel = computed(() => CAT_LABEL[this.cat()] || 'Other');
  readonly monthName = computed(() => MONTH_NAMES[this.month()]);
  readonly house = computed<House | undefined>(() => this.rent.houses().find((h) => h.id === this.houseId()));

  readonly houseOptions = computed<SelectOption[]>(() =>
    this.rent.houses().map((h) => ({ value: h.id, label: h.name })),
  );
  readonly monthOptions: SelectOption[] = MONTH_NAMES.map((m, i) => ({ value: String(i), label: m }));
  readonly roomOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Whole house' },
    ...((this.house()?.rooms ?? []).map((r) => ({ value: r.id, label: r.unit }))),
  ]);

  readonly stepErrs = computed<StepErrs | null>(() => (this.touched() ? this.validate(this.step()) : null));

  private wasOpen = false;

  constructor() {
    effect(() => {
      const c = this.rent.entryCtx();
      const open = !!c;
      if (open && !this.wasOpen && c) {
        this.step.set(c.mode === 'edit' ? 1 : 0);
        this.cat.set(c.category || 'maint');
        this.houseId.set(c.houseId || this.rent.houses()[0]?.id || '');
        this.month.set(c.month != null ? c.month : 5);
        this.amount.set(c.amount != null ? String(c.amount) : '');
        this.notes.set(c.notes || '');
        this.roomId.set(c.roomId || '');
        this.desc.set(c.description || '');
        this.contractor.set(c.contractor || '');
        this.touched.set(false);
        this.err.set(null);
      }
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  private validate(s: number): StepErrs | null {
    if (s === 0) return this.houseId() ? null : { house: 'Choose a house.' };
    if (s === 1) {
      const e: StepErrs = {};
      if (num(this.amount()) <= 0) e.amount = 'Enter an amount.';
      if (this.isMaint() && !this.desc().trim()) e.desc = 'Description is required.';
      return Object.keys(e).length ? e : null;
    }
    return null;
  }

  roomLabel(): string {
    if (!this.roomId()) return 'Whole house';
    return this.house()?.rooms.find((r) => r.id === this.roomId())?.unit || '—';
  }

  next(): void {
    const e = this.validate(this.step());
    if (e) {
      this.touched.set(true);
      this.err.set('Please complete the highlighted fields.');
      return;
    }
    this.touched.set(false);
    this.err.set(null);
    this.step.update((s) => s + 1);
  }

  back(): void {
    this.touched.set(false);
    this.err.set(null);
    this.step.update((s) => Math.max(0, s - 1));
  }

  submit(): void {
    const ctx = this.rent.entryCtx();
    if (!ctx) return;
    this.saver.run(() =>
      this.rent.submitEntry({
        mode: ctx.mode,
        category: this.cat(),
        houseId: this.houseId(),
        month: this.month(),
        year: this.rent.year(),
        value: num(this.amount()),
        notes: this.notes().trim(),
        roomId: this.isMaint() ? this.roomId() : '',
        description: this.isMaint() ? this.desc().trim() : '',
        contractor: this.isMaint() ? this.contractor().trim() : '',
      }),
    );
  }
}
