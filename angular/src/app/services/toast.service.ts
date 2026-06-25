import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  show(message: string, tone: Toast['tone'] = 'success'): void {
    const id = ++this.nextId;
    this._toasts.update((list) => [...list, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), 2600);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
