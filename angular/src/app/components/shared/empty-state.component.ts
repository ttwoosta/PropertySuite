import { Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'ps-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      class="ps-empty-state"
      data-testid="ps-empty-state"
    >
      <div class="ps-empty-icon" data-testid="ps-empty-icon">
        <ps-icon [name]="icon()" [size]="40"></ps-icon>
      </div>
      @if (title()) {
        <h3 class="ps-empty-title" data-testid="ps-empty-title">{{ title() }}</h3>
      }
      @if (body()) {
        <p class="ps-empty-body" data-testid="ps-empty-body">{{ body() }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .ps-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 48px 24px;
        text-align: center;
      }

      .ps-empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--color-surface-raised, #f1f5f9);
        color: var(--color-text-muted, #94a3b8);
        margin-bottom: 4px;
      }

      .ps-empty-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text, #0f172a);
      }

      .ps-empty-body {
        margin: 0;
        font-size: 0.875rem;
        color: var(--color-text-muted, #64748b);
        max-width: 320px;
        line-height: 1.5;
      }

      /* Action slot — add a little top gap */
      :host ::ng-deep > *:not(.ps-empty-state) {
        margin-top: 8px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  icon = input('inbox');
  title = input('');
  body = input('');
}
