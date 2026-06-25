import {
  Component,
  OnDestroy,
  effect,
  input,
  output,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'ps-modal',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (open()) {
      <!-- Backdrop -->
      <div
        class="ps-modal-backdrop"
        data-testid="ps-modal-backdrop"
        (click)="closed.emit()"
      ></div>

      <!-- Card -->
      <div
        class="ps-modal-card"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        [style.width]="width()"
        data-testid="ps-modal"
      >
        <!-- Header -->
        <div class="ps-modal-header">
          <div class="ps-modal-titles">
            @if (title()) {
              <h2 class="ps-modal-title" data-testid="ps-modal-title">{{ title() }}</h2>
            }
            @if (subtitle()) {
              <p class="ps-modal-subtitle" data-testid="ps-modal-subtitle">{{ subtitle() }}</p>
            }
          </div>
          <button
            class="ps-modal-close"
            type="button"
            aria-label="Close"
            data-testid="ps-modal-close"
            (click)="closed.emit()"
          >
            <ps-icon name="x" [size]="18"></ps-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="ps-modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer slot -->
        <ng-content select="[footer]"></ng-content>
      </div>
    }
  `,
  styles: [
    `
      .ps-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 1000;
      }

      .ps-modal-card {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1001;
        background: var(--color-surface, #ffffff);
        border-radius: var(--radius-lg, 12px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        max-width: calc(100vw - 32px);
        max-height: calc(100dvh - 32px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .ps-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 20px 20px 0;
        flex-shrink: 0;
      }

      .ps-modal-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .ps-modal-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text, #0f172a);
        line-height: 1.3;
      }

      .ps-modal-subtitle {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--color-text-muted, #64748b);
      }

      .ps-modal-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: var(--radius-sm, 6px);
        cursor: pointer;
        color: var(--color-text-muted, #64748b);
        flex-shrink: 0;
        transition: background 0.15s;
      }

      .ps-modal-close:hover {
        background: var(--color-surface-raised, #f1f5f9);
        color: var(--color-text, #0f172a);
      }

      .ps-modal-body {
        padding: 16px 20px 20px;
        overflow-y: auto;
        flex: 1;
      }
    `,
  ],
})
export class ModalComponent implements OnDestroy {
  open = input(false);
  title = input('');
  subtitle = input('');
  width = input('520px');

  closed = output<void>();

  private readonly keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open()) {
      this.closed.emit();
    }
  };

  constructor() {
    effect(() => {
      if (this.open()) {
        document.addEventListener('keydown', this.keyHandler);
      } else {
        document.removeEventListener('keydown', this.keyHandler);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyHandler);
  }
}
