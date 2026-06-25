import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { AuthService } from './services/auth.service';

const mockAuth = {
  status: signal('resolving' as const),
  user: signal(null),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows spinner while resolving', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const native: HTMLElement = fixture.nativeElement;
    expect(native.querySelector('.ps-spin')).toBeTruthy();
  });
});
