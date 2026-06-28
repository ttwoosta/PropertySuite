import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'danger';

export interface Toast {
  id: string;
  msg: string;
  tone: ToastTone;
}

/**
 * Bottom-right toast queue, ported from `ToastHost` / `useToast`. Components
 * read `toasts()` (rendered by `ToastHostComponent`) and call `show()` on
 * every mutation.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly list = signal<Toast[]>([]);

  /** Reactive toast list. */
  readonly toasts = this.list.asReadonly();

  show(msg: string, tone: ToastTone = 'success'): void {
    const id = Math.random().toString(36).slice(2);
    this.list.update((t) => [...t, { id, msg, tone }]);
    setTimeout(() => {
      this.list.update((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }
}
