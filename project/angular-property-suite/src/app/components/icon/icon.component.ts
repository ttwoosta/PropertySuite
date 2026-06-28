import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  inject,
} from '@angular/core';

declare global {
  interface Window {
    lucide?: { createIcons: (opts?: { nameAttr?: string; icons?: unknown }) => void };
  }
}

/**
 * Thin wrapper around a Lucide glyph. Writes a fresh `<i data-lucide="name">`
 * into its host on every change and asks the global lucide UMD bundle (loaded
 * in index.html) to swap it for an inline SVG. Re-creating the placeholder on
 * change means dynamic icon names (toggles) update correctly even though
 * lucide replaces the node in-place. Inherits `currentColor`, fills `size`.
 *
 * @example <ps-icon name="wallet" [size]="20"></ps-icon>
 */
@Component({
  selector: 'ps-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  styleUrl: './icon.component.scss',
})
export class IconComponent implements AfterViewInit, OnChanges {
  /** Lucide icon name, e.g. "wallet", "mail", "lock". */
  @Input({ required: true }) name!: string;

  /** Square size in px. */
  @Input() size = 18;

  private readonly host = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    this.render();
  }

  private render(): void {
    const el = this.host.nativeElement;
    if (!el) return;
    el.style.width = `${this.size}px`;
    el.style.height = `${this.size}px`;
    // Recreate the placeholder so name changes re-render (lucide swaps in place).
    el.innerHTML = `<i data-lucide="${this.name}"></i>`;
    window.lucide?.createIcons();
  }
}
