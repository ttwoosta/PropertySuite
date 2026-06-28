import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { APPS } from '../../data/apps.data';
import { AppItem } from '../../models/app-item.model';
import { User } from '../../models/user.model';
import { AppCardComponent } from '../app-card/app-card.component';
import { LauncherHeaderComponent } from '../launcher-header/launcher-header.component';

/**
 * The "Your apps" home surface: header + greeting + two responsive grids
 * (descriptive cards on tablet+, an icon grid on phones). Both grids render
 * the same `AppItem` list through `ps-app-card`.
 */
@Component({
  selector: 'ps-launcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LauncherHeaderComponent, AppCardComponent],
  templateUrl: './launcher.component.html',
  styleUrl: './launcher.component.scss',
})
export class LauncherComponent {
  /** Signed-in user. */
  @Input({ required: true }) user!: User;

  readonly apps = APPS;

  get firstName(): string {
    return this.user.name.split(' ')[0];
  }

  trackByKey(_index: number, app: AppItem): string {
    return app.key;
  }
}
