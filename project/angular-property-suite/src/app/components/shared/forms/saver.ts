import { signal } from '@angular/core';

/**
 * Fake-request saving controller, ported from the prototype's `useSaver`.
 * Flips `busy` true, waits, then runs the callback — giving drawers an
 * inline spinner for prototype parity. Production swaps the timeout for the
 * real Firestore write promise.
 */
export class Saver {
  readonly busy = signal(false);

  run(fn: () => void, delay = 850): void {
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      fn();
    }, delay);
  }
}
