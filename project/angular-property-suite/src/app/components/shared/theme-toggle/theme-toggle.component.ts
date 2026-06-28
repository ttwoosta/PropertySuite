import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../../icon/icon.component';
import { ThemeService } from '../../../services/theme.service';

/** Sun/moon theme toggle, ported from `ThemeToggle`. */
@Component({
  selector: 'ps-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconButtonComponent, IconComponent],
  template: `
    <ps-icon-button
      [label]="theme.theme() === 'dark' ? 'Switch to light' : 'Switch to dark'"
      variant="ghost"
      [size]="size"
      (clicked)="theme.toggle()"
    >
      <ps-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18"></ps-icon>
    </ps-icon-button>
  `,
})
export class ThemeToggleComponent {
  @Input() size: 'sm' | 'md' = 'md';
  readonly theme = inject(ThemeService);
}
