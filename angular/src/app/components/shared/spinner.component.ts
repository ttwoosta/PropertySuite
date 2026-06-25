import { Component, input } from '@angular/core';

@Component({
  selector: 'ps-spinner',
  standalone: true,
  template: `
    <div
      class="ps-spinner-root"
      data-testid="ps-spinner"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100dvh;
        width: 100%;
        gap: 12px;
      "
    >
      <div class="ps-spin" data-testid="ps-spin-indicator"></div>
      @if (label()) {
        <span class="ps-spinner-label" data-testid="ps-spinner-label">{{ label() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .ps-spin {
        width: 36px;
        height: 36px;
        border: 3px solid var(--color-border, #e2e8f0);
        border-top-color: var(--color-brand, #6366f1);
        border-radius: 50%;
        animation: ps-spin 0.7s linear infinite;
      }

      @keyframes ps-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .ps-spinner-label {
        font-size: 0.875rem;
        color: var(--color-text-muted, #64748b);
      }
    `,
  ],
})
export class SpinnerComponent {
  label = input('');
}
