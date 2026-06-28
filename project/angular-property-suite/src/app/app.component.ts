import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './models/user.model';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

/** Auth-resolution states for the suite shell. */
type ShellState = 'resolving' | 'out' | 'in';

/**
 * Root of the Property Suite. Auth gate: briefly resolves the persisted
 * session, then renders either the login or the routed app (launcher + lazy
 * feature areas) through `<router-outlet>`.
 */
@Component({
  selector: 'ps-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent, LoginComponent, RouterOutlet],
  template: `
    @switch (state) {
      @case ('resolving') {
        <ps-spinner label="Loading your suite…"></ps-spinner>
      }
      @case ('out') {
        <ps-login (authed)="onAuthed($event)"></ps-login>
      }
      @case ('in') {
        <router-outlet></router-outlet>
      }
    }
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  state: ShellState = 'resolving';

  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      this.state = this.auth.current ? 'in' : 'out';
      this.cdr.markForCheck();
    }, 480);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  onAuthed(_user: User): void {
    this.state = 'in';
  }
}
