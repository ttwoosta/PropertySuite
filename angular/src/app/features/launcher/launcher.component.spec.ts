import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { LauncherComponent } from './launcher.component';
import { AuthService } from '../../services/auth.service';
import { NavService } from '../../services/nav.service';

const mockAuth = {
  status: signal('in'),
  user: signal({ uid: '1', email: 'a@b.com', name: 'Alice Brown', initials: 'AB' }),
};

const mockNav = { rememberApp: jasmine.createSpy() };

describe('LauncherComponent', () => {
  let component: LauncherComponent;
  let fixture: ComponentFixture<LauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LauncherComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        { provide: NavService, useValue: mockNav },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('shows user initials', () => {
    const native: HTMLElement = fixture.nativeElement;
    expect(native.textContent).toContain('AB');
  });

  it('renders app cards', () => {
    const native: HTMLElement = fixture.nativeElement;
    const cards = native.querySelectorAll('[data-testid^="app-card-"]');
    expect(cards.length).toBe(3);
  });

  it('shows first name greeting', () => {
    const native: HTMLElement = fixture.nativeElement;
    expect(native.textContent).toContain('Alice');
  });

  it('calls rememberApp when profile link is clicked', () => {
    component.rememberApps();
    expect(mockNav.rememberApp).toHaveBeenCalledWith('/', 'Apps');
  });
});
