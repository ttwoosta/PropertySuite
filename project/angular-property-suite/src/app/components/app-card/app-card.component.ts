import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppItem } from '../../models/app-item.model';
import { IconComponent } from '../icon/icon.component';

/** Display mode: full descriptive card (tablet+) or compact icon cell (phone). */
export type AppCardVariant = 'full' | 'icon';

/**
 * A single launcher tile linking to one of the suite's tools. Renders
 * either the full card (icon tile + name + tag + description) or the
 * compact icon-only cell used in the phone grid. Ported apps use
 * `routerLink` (via `app.routePath`); others keep their static href.
 */
@Component({
  selector: 'ps-app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink, NgTemplateOutlet],
  templateUrl: './app-card.component.html',
  styleUrl: './app-card.component.scss',
})
export class AppCardComponent {
  /** The app this card represents. */
  @Input({ required: true }) app!: AppItem;

  /** Layout variant. */
  @Input() variant: AppCardVariant = 'full';
}
