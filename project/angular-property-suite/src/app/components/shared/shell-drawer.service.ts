import { Injectable, signal } from '@angular/core';

/**
 * Tracks the mobile sidebar drawer open state for `ResponsiveShellComponent`.
 * Shared so the hamburger (in the top bar) and nav items (in the sidebar)
 * can toggle/close it without prop-drilling — the signal equivalent of the
 * prototype's `DrawerCtx`.
 */
@Injectable()
export class ShellDrawerService {
  readonly open = signal(false);

  toggle(): void {
    this.open.update((o) => !o);
  }

  close(): void {
    this.open.set(false);
  }
}
