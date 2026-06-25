import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { EntryWizardComponent, EntryCtx } from './entry-wizard.component';
import { CurrencyService } from '../../services/currency.service';
import { HouseVm } from '../../models/rent.vm';

const MOCK_HOUSE: HouseVm = {
  id: 'h1', name: 'Maple House', address: '12 Maple St',
  rooms: [{ id: 'r1', unit: 'Room 1', tenant: '', rent: 800, paid: 0, status: 'Vacant', beds: 1 }],
};

describe('EntryWizardComponent', () => {
  let fixture: ComponentFixture<EntryWizardComponent>;
  let ref: ComponentRef<EntryWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryWizardComponent],
      providers: [CurrencyService],
    }).compileComponents();
    fixture = TestBed.createComponent(EntryWizardComponent);
    ref = fixture.componentRef;
  });

  it('should not render when ctx is null', () => {
    ref.setInput('ctx', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="entry-wizard"]')).toBeNull();
  });

  it('should render step 0 when ctx is set with mode add', () => {
    ref.setInput('ctx', { mode: 'add' } as EntryCtx);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="entry-wizard"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="cat-grid"]')).toBeTruthy();
  });

  it('should start at step 1 when mode is edit', () => {
    ref.setInput('ctx', { mode: 'edit', category: 'tax', houseId: 'h1' } as EntryCtx);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();
    expect(fixture.componentInstance.step()).toBe(1);
  });

  it('should show error when Next pressed without house selected', () => {
    ref.setInput('ctx', { mode: 'add' } as EntryCtx);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();

    fixture.componentInstance.houseId = '';
    (fixture.nativeElement.querySelector('[data-testid="btn-next"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="entry-err"]')).toBeTruthy();
  });

  it('should advance to step 1 when house is selected and Next clicked', () => {
    ref.setInput('ctx', { mode: 'add' } as EntryCtx);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();

    fixture.componentInstance.houseId = 'h1';
    (fixture.nativeElement.querySelector('[data-testid="btn-next"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe(1);
  });

  it('should emit closed when close button clicked', () => {
    ref.setInput('ctx', { mode: 'add' } as EntryCtx);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('[data-testid="btn-close-wizard"]') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });
});
