import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

/**
 * Sidebar navigation row, ported from the design-system NavItem. Active rows
 * get the subtle green tint + green label.
 */
@Component({
  selector: 'ps-nav-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button class="nav" [class.nav--active]="active" (click)="selected.emit()">
      <ps-icon class="nav__icon" [name]="icon" [size]="18"></ps-icon>
      <span class="nav__label">{{ label }}</span>
    </button>
  `,
  styles: [
    `
      .nav {
        display: flex;
        align-items: center;
        gap: 11px;
        width: 100%;
        padding: 16px 12px;
        border: none;
        border-radius: var(--radius-md);
        background: transparent;
        cursor: pointer;
        text-align: left;
        color: var(--text-body);
        font-family: var(--font-sans);
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        transition: background var(--dur-fast) var(--ease-out);
      }
      .nav:hover {
        background: var(--surface-hover);
      }
      .nav__icon {
        color: var(--text-muted);
      }
      .nav--active {
        background: var(--surface-active-nav);
        color: var(--brand-on-tint);
        font-weight: var(--weight-semibold);
      }
      .nav--active .nav__icon {
        color: var(--brand);
      }
    `,
  ],
})
export class NavItemComponent {
  @Input({ required: true }) icon = '';
  @Input({ required: true }) label = '';
  @Input() active = false;
  @Output() selected = new EventEmitter<void>();
}
