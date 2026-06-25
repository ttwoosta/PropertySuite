import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MaintenanceService } from './maintenance.service';
import { Firestore } from '@angular/fire/firestore';

// Mock AngularFire Firestore
const mockFirestore = {} as Firestore;

describe('MaintenanceService', () => {
  let service: MaintenanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MaintenanceService,
        { provide: Firestore, useValue: mockFirestore },
      ],
    });
    service = TestBed.inject(MaintenanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('PROPERTIES has 3 entries', () => {
    const { PROPERTIES } = require('./maintenance.service');
    expect(PROPERTIES.length).toBe(3);
    expect(PROPERTIES[0].id).toBe('elm');
  });

  it('ICONS has at least 8 entries', () => {
    const { ICONS } = require('./maintenance.service');
    expect(ICONS.length).toBeGreaterThanOrEqual(8);
  });
});
