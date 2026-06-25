import { Component, input } from '@angular/core';
import { BadgeComponent } from './badge.component';

type Tone = 'warn' | 'danger' | 'success' | 'default';

@Component({
  selector: 'ps-section-title',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="ps-section-title" data-testid="ps-section-title">
      <span class="ps-section-label">
        <ng-content></ng-content>
      </span>
      @if (count() !== null) {
        <ps-badge [tone]="tone()" size="sm" data-testid="ps-section-badge">{{ count() }}</ps-badge>
      }
    </div>
  `,
  styles: [
    `
      .ps-section-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 10px;
      }

      .ps-section-label {
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-text-muted, #64748b);
      }
    `,
  ],
})
export class SectionTitleComponent {
  count = input<number | null>(null);
  tone = input<Tone>('default');
}
