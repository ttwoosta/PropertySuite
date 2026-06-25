import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from './icon.component';

const TONE_ICON: Record<string, string> = {
  success: 'check',
  error: 'alert-circle',
  info: 'sparkles',
};

@Component({
  selector: 'ps-toast-host',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      class="ps-toast-container"
      data-testid="ps-toast-host"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="ps-toast"
          [class]="'tone-' + toast.tone"
          role="alert"
          data-testid="ps-toast"
          [attr.data-tone]="toast.tone"
        >
          <span class="ps-toast-icon">
            <ps-icon [name]="toneIcon(toast.tone)" [size]="16"></ps-icon>
          </span>
          <span class="ps-toast-message" data-testid="ps-toast-message">{{ toast.message }}</span>
          <button
            class="ps-toast-dismiss"
            type="button"
            aria-label="Dismiss"
            data-testid="ps-toast-dismiss"
            (click)="toastService.dismiss(toast.id)"
          >
            <ps-icon name="x" [size]="14"></ps-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .ps-toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      }

      .ps-toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: var(--radius-md, 8px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
        font-size: 0.875rem;
        font-weight: 500;
        pointer-events: all;
        min-width: 240px;
        max-width: 380px;
        animation: ps-toast-in 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        background: var(--color-surface, #fff);
        color: var(--color-text, #0f172a);
        border-left: 3px solid transparent;
      }

      @keyframes ps-toast-in {
        from {
          opacity: 0;
          transform: translateX(24px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .ps-toast.tone-success {
        border-left-color: var(--color-success, #16a34a);
        background: var(--color-success-subtle, #f0fdf4);
        color: var(--color-success, #15803d);
      }

      .ps-toast.tone-error {
        border-left-color: var(--color-danger, #dc2626);
        background: var(--color-danger-subtle, #fff1f1);
        color: var(--color-danger, #dc2626);
      }

      .ps-toast.tone-info {
        border-left-color: var(--color-brand, #6366f1);
        background: var(--color-brand-subtle, #eef2ff);
        color: var(--color-brand, #4f46e5);
      }

      .ps-toast-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .ps-toast-message {
        flex: 1;
        min-width: 0;
        line-height: 1.4;
      }

      .ps-toast-dismiss {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        color: inherit;
        opacity: 0.6;
        flex-shrink: 0;
        padding: 0;
        transition: opacity 0.15s;
      }

      .ps-toast-dismiss:hover {
        opacity: 1;
      }
    `,
  ],
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);

  toneIcon(tone: string): string {
    return TONE_ICON[tone] ?? 'sparkles';
  }
}
