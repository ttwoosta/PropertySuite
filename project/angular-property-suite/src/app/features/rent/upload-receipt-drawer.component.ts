import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RightDrawerComponent } from '../../components/shared/right-drawer/right-drawer.component';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { IconComponent } from '../../components/icon/icon.component';
import { IconButtonComponent } from '../../components/shared/icon-button/icon-button.component';
import { TextInputComponent } from '../../components/shared/inputs/text-input.component';
import { SelectInputComponent, SelectOption } from '../../components/shared/inputs/select-input.component';
import { TextareaInputComponent } from '../../components/shared/inputs/textarea-input.component';
import {
  AmountFieldComponent,
  FieldRowComponent,
  SaveCtaComponent,
} from '../../components/shared/forms/form-primitives';
import { Saver } from '../../components/shared/forms/saver';
import { fileSize, kindOf, num } from '../../components/shared/forms/form-utils';
import { RentService } from '../../services/rent.service';
import { ReceiptKind } from '../../models/rent.vm';
import { UPLOAD_CAT_OPTIONS } from './rent.constants';

interface PickedFile {
  name: string;
  size: number;
  kind: ReceiptKind;
  url: string | null;
}

/**
 * Upload Receipt drawer, ported from `UploadReceiptDrawer`: drag-and-drop /
 * browse file picker, merchant, category, house, date, total, notes. Driven
 * by `RentService.uploadOpen`.
 */
@Component({
  selector: 'app-upload-receipt-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RightDrawerComponent,
    UiButtonComponent,
    IconComponent,
    IconButtonComponent,
    TextInputComponent,
    SelectInputComponent,
    TextareaInputComponent,
    AmountFieldComponent,
    FieldRowComponent,
    SaveCtaComponent,
  ],
  templateUrl: './upload-receipt-drawer.component.html',
  styleUrl: './upload-receipt-drawer.component.scss',
})
export class UploadReceiptDrawerComponent {
  readonly rent = inject(RentService);
  readonly saver = new Saver();
  readonly fileSize = fileSize;

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly catOptions = UPLOAD_CAT_OPTIONS;
  readonly houseOptions = computed<SelectOption[]>(() =>
    this.rent.houses().map((h) => ({ value: h.id, label: h.name })),
  );

  readonly file = signal<PickedFile | null>(null);
  readonly merchant = signal('');
  readonly cat = signal('maint');
  readonly houseId = signal('');
  readonly date = signal('2026-06-12');
  readonly total = signal('');
  readonly notes = signal('');
  readonly drag = signal(false);
  readonly touched = signal(false);
  readonly err = signal<string | null>(null);

  readonly merchErr = computed(() => (this.touched() && !this.merchant().trim() ? 'Merchant is required.' : null));

  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = this.rent.uploadOpen();
      if (open && !this.wasOpen) {
        this.file.set(null);
        this.merchant.set('');
        this.cat.set('maint');
        this.houseId.set(this.rent.houses()[0]?.id || '');
        this.date.set('2026-06-12');
        this.total.set('');
        this.notes.set('');
        this.drag.set(false);
        this.touched.set(false);
        this.err.set(null);
      }
      this.wasOpen = open;
    }, { allowSignalWrites: true });
  }

  browse(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileInput(e: Event): void {
    this.take((e.target as HTMLInputElement).files?.[0]);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(false);
    this.take(e.dataTransfer?.files?.[0]);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.drag.set(true);
  }

  private take(f: File | undefined | null): void {
    if (!f) return;
    const kind = kindOf(f.type);
    this.file.set({
      name: f.name,
      size: f.size,
      kind,
      url: kind === 'img' ? URL.createObjectURL(f) : null,
    });
  }

  submit(): void {
    this.touched.set(true);
    const f = this.file();
    if (!f) {
      this.err.set('Choose a receipt file to upload.');
      return;
    }
    if (!this.merchant().trim()) {
      this.err.set('Add the merchant name before uploading.');
      return;
    }
    this.err.set(null);
    this.saver.run(
      () =>
        this.rent.addReceipt({
          id: 'up' + Math.random().toString(36).slice(2, 7),
          merchant: this.merchant().trim(),
          cat: this.cat(),
          date: this.date() || '2026-06-12',
          amount: num(this.total()),
          kind: f.kind,
          url: f.url,
          notes: this.notes().trim(),
        }),
      1000,
    );
  }
}
