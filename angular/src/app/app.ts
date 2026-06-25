import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (status() === 'resolving') {
      <div style="display:flex;align-items:center;justify-content:center;height:100dvh;background:var(--surface-page);">
        <div class="ps-spin"></div>
      </div>
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  private auth = inject(AuthService);
  readonly status = this.auth.status;
}
