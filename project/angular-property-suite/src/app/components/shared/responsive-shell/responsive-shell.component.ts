import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ShellDrawerService } from '../shell-drawer.service';

/**
 * Two-panel app shell, ported from `ResponsiveShell`: a fixed 248px sidebar
 * + a main column (sticky top bar over a scrolling, centered content area).
 * On phones the sidebar becomes an off-canvas drawer with a scrim.
 *
 * Project content into the three slots:
 * - `[shell-sidebar]` — sidebar contents
 * - `[shell-topbar]` — top bar contents
 * - default — page content
 *
 * Reads `ShellDrawerService` (provide it on the host component) so the
 * hamburger and nav items can open/close the drawer.
 */
@Component({
  selector: 'ps-responsive-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell" [class.shell--open]="drawer.open()">
      <aside class="shell__sidebar">
        <ng-content select="[shell-sidebar]"></ng-content>
      </aside>
      <div class="shell__scrim" (click)="drawer.close()"></div>
      <div class="shell__main">
        <div class="shell__topbar">
          <ng-content select="[shell-topbar]"></ng-content>
        </div>
        <div class="shell__content">
          <div class="shell__inner">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './responsive-shell.component.scss',
})
export class ResponsiveShellComponent {
  readonly drawer = inject(ShellDrawerService);
}
