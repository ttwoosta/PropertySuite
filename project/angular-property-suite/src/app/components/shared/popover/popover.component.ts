import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  inject,
} from '@angular/core';

/**
 * Anchored popover (absolute, below its relatively-positioned parent),
 * ported from the prototype `Popover`. Closes on outside click / Escape.
 * Wrap the trigger + this in a `position: relative` container.
 *
 * @example
 * <div style="position:relative">
 *   <button (click)="open.set(!open())">…</button>
 *   <ps-popover [open]="open()" (closed)="open.set(false)">…</ps-popover>
 * </div>
 */
@Component({
  selector: 'ps-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="pop ps-fade" [class.pop--right]="align === 'right'" [class.pop--center]="align === 'center'">
        <ng-content></ng-content>
      </div>
    }
  `,
  styles: [
    `
      .pop {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: 100;
        min-width: 200px;
        overflow: hidden;
        background: var(--surface-card);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
      }
      .pop--right {
        left: auto;
        right: 0;
      }
      .pop--center {
        left: 50%;
        transform: translateX(-50%);
      }
    `,
  ],
})
export class PopoverComponent {
  @Input() open = false;
  @Input() align: 'left' | 'right' | 'center' = 'left';
  @Output() closed = new EventEmitter<void>();

  private readonly host = inject(ElementRef<HTMLElement>);

  @HostListener('document:mousedown', ['$event'])
  onDocDown(e: MouseEvent): void {
    if (!this.open) return;
    if (!this.host.nativeElement.contains(e.target as Node)) this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open) this.closed.emit();
  }
}
