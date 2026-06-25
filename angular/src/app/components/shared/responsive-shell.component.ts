import { Component, model } from '@angular/core';

@Component({
  selector: 'ps-responsive-shell',
  standalone: true,
  template: `
    <div
      class="ps-shell"
      [class.drawer-open]="drawerOpen()"
      data-testid="ps-responsive-shell"
    >
      <!-- Mobile scrim -->
      <div
        class="ps-scrim"
        data-testid="ps-shell-scrim"
        (click)="drawerOpen.set(false)"
      ></div>

      <!-- Sidebar -->
      <aside class="ps-sidebar" data-testid="ps-shell-sidebar">
        <ng-content select="[sidebar]"></ng-content>
      </aside>

      <!-- Main area -->
      <div class="ps-main" data-testid="ps-shell-main">
        <div class="ps-topbar" data-testid="ps-shell-topbar">
          <ng-content select="[topbar]"></ng-content>
        </div>
        <ng-content select="[phone-chips]"></ng-content>
        <div class="ps-content" data-testid="ps-shell-content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Base shell grid */
      .ps-shell {
        display: flex;
        height: 100dvh;
        overflow: hidden;
        position: relative;
        background: var(--color-bg, #f8fafc);
      }

      /* Sidebar */
      .ps-sidebar {
        width: var(--sidebar-w, 240px);
        flex-shrink: 0;
        height: 100dvh;
        overflow-y: auto;
        background: var(--color-surface, #ffffff);
        border-right: 1px solid var(--color-border, #e2e8f0);
        display: flex;
        flex-direction: column;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Main */
      .ps-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* Topbar */
      .ps-topbar {
        flex-shrink: 0;
        height: var(--topbar-h, 56px);
        display: flex;
        align-items: center;
        padding: 0 16px;
        background: var(--color-surface, #ffffff);
        border-bottom: 1px solid var(--color-border, #e2e8f0);
      }

      /* Scrollable content area */
      .ps-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--content-pad, 20px);
      }

      /* Scrim — hidden on desktop */
      .ps-scrim {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 49;
      }

      /* Mobile: sidebar slides in from left */
      @media (max-width: 767px) {
        .ps-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 50;
          transform: translateX(-100%);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
        }

        .ps-shell.drawer-open .ps-sidebar {
          transform: translateX(0);
        }

        .ps-shell.drawer-open .ps-scrim {
          display: block;
        }
      }
    `,
  ],
})
export class ResponsiveShellComponent {
  drawerOpen = model(false);
}
