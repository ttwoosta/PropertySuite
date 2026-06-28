import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UiButtonComponent } from '../../components/ui-button/ui-button.component';
import { MONTH_NAMES } from './rent.constants';

/**
 * Month/year drum picker, ported from `PeriodPicker`. Two scrolling columns
 * + a Done button. Designed to live inside a `ps-popover` in the top bar.
 *
 * @example
 * <app-period-picker [month]="rent.month()" [year]="rent.year()"
 *   (picked)="rent.setPeriod($event.month, $event.year)" (done)="periodOpen.set(false)" />
 */
@Component({
  selector: 'app-period-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButtonComponent],
  template: `
    <div class="pp">
      <div class="pp__cols">
        <div class="ps-scroll-x pp__col">
          @for (m of monthNames; track m; let i = $index) {
            <button class="pp__opt" [class.pp__opt--on]="i === month" (click)="picked.emit({ month: i, year })">
              {{ m }}
            </button>
          }
        </div>
        <div class="pp__div"></div>
        <div class="ps-scroll-x pp__col">
          @for (y of years; track y) {
            <button class="pp__opt" [class.pp__opt--on]="y === year" (click)="picked.emit({ month, year: y })">
              {{ y }}
            </button>
          }
        </div>
      </div>
      <div class="pp__foot">
        <ps-button variant="primary" size="md" (clicked)="done.emit()">Done</ps-button>
      </div>
    </div>
  `,
  styles: [
    `
      .pp {
        width: 280px;
      }
      .pp__cols {
        display: flex;
        gap: 4px;
        padding: 6px;
      }
      .pp__col {
        flex: 1;
        max-height: 220px;
        overflow-y: auto;
        padding: 4px;
      }
      .pp__div {
        width: 1px;
        background: var(--border-subtle);
      }
      .pp__opt {
        display: block;
        width: 100%;
        padding: 9px 12px;
        border: none;
        cursor: pointer;
        text-align: center;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-body);
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
      }
      .pp__opt:hover {
        background: var(--surface-hover);
      }
      .pp__opt--on {
        background: var(--brand-tint);
        color: var(--brand-on-tint);
        font-weight: var(--weight-bold);
      }
      .pp__foot {
        display: flex;
        justify-content: flex-end;
        padding: 10px;
        border-top: 1px solid var(--border-subtle);
      }
    `,
  ],
})
export class PeriodPickerComponent {
  @Input() month = 5;
  @Input() year = 2026;
  @Output() picked = new EventEmitter<{ month: number; year: number }>();
  @Output() done = new EventEmitter<void>();

  readonly monthNames = MONTH_NAMES;
  readonly years = [2024, 2025, 2026, 2027];
}
