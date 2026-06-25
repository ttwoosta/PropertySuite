import {
  Component,
  OnDestroy,
  effect,
  input,
  output,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'ps-right-drawer',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (open()) {
      <!-- Scrim -->
      <div
        class="ps-drawer-scrim"
        data-testid="ps-drawer-scrim"
        (click)="closed.emit()"
      ></div>
    }

    <!-- Panel — always in DOM so transition works -->
    <div
      class="ps-drawer-panel"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()"
      [class.is-open]="open()"
      [style.width]="width()"
      data-testid="ps-right-drawer"
    >
      <!-- Header -->
      <div class="ps-drawer-header">
        <div class="ps-drawer-icon-slot">
          <ng-content select="[icon]"></ng-content>
        </div>
        <div class="ps-drawer-titles">
          @if (title()) {
            <h2 class="ps-drawer-title" data-testid="ps-drawer-title">{{ title() }}</h2>
          }
          @if (subtitle()) {
            <p class="ps-drawer-subtitle" data-testid="ps-drawer-subtitle">{{ subtitle() }}</p>
          }
        </div>
        <button
          class="ps-drawer-close"
          type="button"
          aria-label="Close drawer"
          data-testid="ps-drawer-close"
          (click)="closed.emit()"
        >
          <ps-icon name="x" [size]="18"></ps-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="ps-drawer-body">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <ng-content select="[footer]"></ng-content>
    </div>
  `,
  styles: [
    `
      .ps-drawer-scrim {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 900;
      }

      .ps-drawer-panel {
        position: fixed;
        top: 0;
        right: 0;
        height: 100dvh;
        max-width: 100vw;
        background: var(--color-surface, #ffffff);
        box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
        z-index: 901;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .ps-drawer-panel.is-open {
        transform: translateX(0);
      }

      .ps-drawer-header {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 20px 20px 0;
        flex-shrink: 0;
      }

      .ps-drawer-icon-slot {
        display: contents;
      }

      .ps-drawer-titles {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ps-drawer-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text, #0f172a);
        line-height: 1.3;
      }

      .ps-drawer-subtitle {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--color-text-muted, #64748b);
      }

      .ps-drawer-close {
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

      .ps-drawer-close:hover {
        background: var(--color-surface-raised, #f1f5f9);
        color: var(--color-text, #0f172a);
      }

      .ps-drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
      }
    `,
  ],
})
export class RightDrawerComponent implements OnDestroy {
  open = input(false);
  title = input('');
  subtitle = input('');
  width = input('480px');

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
