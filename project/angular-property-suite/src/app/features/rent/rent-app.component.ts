import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ResponsiveShellComponent } from '../../components/shared/responsive-shell/responsive-shell.component';
import { ShellDrawerService } from '../../components/shared/shell-drawer.service';
import { NavItemComponent } from '../../components/shared/nav-item/nav-item.component';
import { PopoverComponent } from '../../components/shared/popover/popover.component';
import { IconComponent } from '../../components/icon/icon.component';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { ThemeToggleComponent } from '../../components/shared/theme-toggle/theme-toggle.component';
import { ToastHostComponent } from '../../components/shared/toast-host/toast-host.component';
import { PeriodPickerComponent } from './period-picker.component';
import { AddHouseDrawerComponent } from './add-house-drawer.component';
import { EditRoomDrawerComponent } from './edit-room-drawer.component';
import { AddRentDrawerComponent } from './add-rent-drawer.component';
import { EntryWizardComponent } from './entry-wizard.component';
import { UploadReceiptDrawerComponent } from './upload-receipt-drawer.component';
import { ReceiptPickerDialogComponent } from './receipt-picker-dialog.component';
import { ReceiptViewerDialogComponent } from './receipt-viewer-dialog.component';
import { RentService } from '../../services/rent.service';
import { AuthService } from '../../services/auth.service';
import { RENT_NAV } from './rent.constants';

/**
 * Rent Tracker layout shell, ported from `RentApp`. Hosts the sidebar (logo,
 * nav, footer) and top bar (hamburger, house picker, period picker, avatar)
 * around a `<router-outlet>`, plus every drawer/dialog and the toast host.
 * Provides `ShellDrawerService` so the hamburger and nav share drawer state.
 */
@Component({
  selector: 'app-rent-app',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ShellDrawerService],
  imports: [
    RouterOutlet,
    ResponsiveShellComponent,
    NavItemComponent,
    PopoverComponent,
    IconComponent,
    AvatarComponent,
    ThemeToggleComponent,
    ToastHostComponent,
    PeriodPickerComponent,
    AddHouseDrawerComponent,
    EditRoomDrawerComponent,
    AddRentDrawerComponent,
    EntryWizardComponent,
    UploadReceiptDrawerComponent,
    ReceiptPickerDialogComponent,
    ReceiptViewerDialogComponent,
  ],
  templateUrl: './rent-app.component.html',
  styleUrl: './rent-app.component.scss',
})
export class RentAppComponent {
  readonly rent = inject(RentService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly drawer = inject(ShellDrawerService);

  readonly nav = RENT_NAV;
  readonly userName = this.auth.current?.name ?? 'You';

  readonly houseOpen = signal(false);
  readonly periodOpen = signal(false);
  readonly currentPath = signal(this.pathFromUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentPath.set(this.pathFromUrl(e.urlAfterRedirects)));
  }

  private pathFromUrl(url: string): string {
    const seg = url.split('?')[0].split('/').filter(Boolean);
    return seg[seg.length - 1] || 'home';
  }

  go(path: string): void {
    this.router.navigate(['/rent', path]);
    this.drawer.close();
  }

  selectHouse(id: string): void {
    this.rent.selectHouse(id);
    this.houseOpen.set(false);
  }
}
