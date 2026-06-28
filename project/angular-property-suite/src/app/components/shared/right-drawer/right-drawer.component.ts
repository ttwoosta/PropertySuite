import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

/**
 * Right-side slide-in panel, ported from `RightDrawer`. Header shows an
 * optional tinted icon + title + subtitle and a close button; body is the
 * default projected content; footer is projected via `[drawer-footer]`.
 * Closes on Escape / scrim click. Stays mounted (animates `translateX`) so
 * open/close transitions match the prototype.
 *
 * @example
 * <ps-right-drawer [open]="open" icon="home" title="Add house" subtitle="…"
 *                  (closed)="…">
 *   …body…
 *   <ng-container drawer-footer>…buttons…</ng-container>
 * </ps-right-drawer>
 */
@Component({
  selector: 'ps-right-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="drawer" [class.drawer--open]="open" [style.pointer-events]="open ? 'auto' : 'none'">
      <div class="drawer__scrim" (click)="closed.emit()"></div>
      <div class="drawer__panel" [style.max-width.px]="width">
        <div class="drawer__head">
          <div class="drawer__head-main">
            @if (icon) {
              <span class="drawer__icon">
                <ps-icon [name]="icon" [size]="19"></ps-icon>
              </span>
            }
            <div class="drawer__titles">
              <div class="drawer__title">{{ title }}</div>
              @if (subtitle) {
                <div class="drawer__subtitle">{{ subtitle }}</div>
              }
            </div>
          </div>
          <button class="drawer__close" aria-label="Close" (click)="closed.emit()">
            <ps-icon name="x" [size]="18"></ps-icon>
          </button>
        </div>
        <div class="drawer__body">
          <ng-content></ng-content>
        </div>
        <div class="drawer__footer">
          <ng-content select="[drawer-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './right-drawer.component.scss',
})
export class RightDrawerComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon?: string;
  @Input() width = 420;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open) this.closed.emit();
  }
}
