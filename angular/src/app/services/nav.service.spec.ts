import { TestBed } from '@angular/core/testing';
import { NavService } from './nav.service';

describe('NavService', () => {
  let service: NavService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavService);
  });

  it('returns default when nothing stored', () => {
    const ref = service.profileReturn();
    expect(ref.path).toBe('/');
    expect(ref.label).toBe('Apps');
  });

  it('remembers and retrieves an app ref', () => {
    service.rememberApp('/rent', 'Rent Tracker');
    const ref = service.profileReturn();
    expect(ref.path).toBe('/rent');
    expect(ref.label).toBe('Rent Tracker');
  });

  it('overwrites previous stored ref', () => {
    service.rememberApp('/maintenance', 'Maintenance');
    service.rememberApp('/rent', 'Rent Tracker');
    expect(service.profileReturn().path).toBe('/rent');
  });
});
