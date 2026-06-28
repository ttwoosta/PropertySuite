import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';
import { ToastService } from '../../../services/toast.service';

/**
 * Renders the bottom-right toast stack from `ToastService`. Mount once at the
 * app shell root, the signal equivalent of the prototype's `ToastHost`.
 */
@Component({
  selector: 'ps-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="toasts">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast ps-fade">
          <span class="toast__icon" [class.toast__icon--danger]="t.tone === 'danger'">
            <ps-icon [name]="t.tone === 'danger' ? 'alert-circle' : 'check-circle-2'" [size]="16"></ps-icon>
          </span>
          {{ t.msg }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toasts {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 400;
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
        pointer-events: none;
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 9px;
        max-width: 320px;
        padding: 11px 15px;
        border-radius: var(--radius-md);
        background: var(--surface-card);
        border: 1px solid var(--border-default);
        box-shadow: var(--shadow-lg);
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        color: var(--text-heading);
      }
      .toast__icon {
        display: inline-flex;
        color: var(--brand);
      }
      .toast__icon--danger {
        color: var(--danger-fg);
      }
    `,
  ],
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
