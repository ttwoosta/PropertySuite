import { TestBed } from '@angular/core/testing';
import { RentService, CATEGORIES, MONTH_NAMES, MONTHS } from './rent.service';
import { Firestore } from '@angular/fire/firestore';

const mockFirestore = {} as Firestore;

describe('RentService', () => {
  let service: RentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RentService,
        { provide: Firestore, useValue: mockFirestore },
      ],
    });
    service = TestBed.inject(RentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('CATEGORIES has 6 items', () => {
    expect(CATEGORIES.length).toBe(6);
    const ids = CATEGORIES.map((c) => c.id);
    expect(ids).toContain('tax');
    expect(ids).toContain('water');
    expect(ids).toContain('maint');
  });

  it('MONTH_NAMES has 12 items', () => {
    expect(MONTH_NAMES.length).toBe(12);
    expect(MONTH_NAMES[0]).toBe('January');
    expect(MONTH_NAMES[11]).toBe('December');
  });

  it('MONTHS abbreviations has 12 items', () => {
    expect(MONTHS.length).toBe(12);
    expect(MONTHS[0]).toBe('Jan');
  });
});
