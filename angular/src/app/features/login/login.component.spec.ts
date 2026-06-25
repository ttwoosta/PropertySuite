import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

const mockAuth = {
  status: signal('out' as const),
  user: signal(null),
  signIn: vi.fn().mockResolvedValue(undefined),
  signUp: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAuth.signIn.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders without error', () => {
    expect(component).toBeTruthy();
  });

  it('shows sign-in mode by default', () => {
    const native: HTMLElement = fixture.nativeElement;
    expect(native.querySelector('[data-testid="btn-submit"]')?.textContent).toContain('Sign in');
  });

  it('toggles to sign-up mode', () => {
    const native: HTMLElement = fixture.nativeElement;
    (native.querySelector('[data-testid="btn-toggle-mode"]') as HTMLElement)?.click();
    fixture.detectChanges();
    expect(native.querySelector('[data-testid="btn-submit"]')?.textContent).toContain('Create account');
  });

  it('shows error when signIn rejects', async () => {
    mockAuth.signIn.mockRejectedValueOnce(new Error('Wrong password'));
    component.email = 'a@b.com';
    component.password = 'wrong';
    await component.submit();
    fixture.detectChanges();
    const err = fixture.nativeElement.querySelector('[data-testid="login-error"]');
    expect(err).toBeTruthy();
    expect(err.textContent).toContain('Wrong password');
  });

  it('calls signIn with email and password', async () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    await component.submit();
    expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
