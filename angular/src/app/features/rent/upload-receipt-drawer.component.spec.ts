import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { UploadReceiptDrawerComponent } from './upload-receipt-drawer.component';
import { CurrencyService } from '../../services/currency.service';
import { HouseVm } from '../../models/rent.vm';

const MOCK_HOUSE: HouseVm = { id: 'h1', name: 'Maple House', address: '12 Maple St', rooms: [] };

describe('UploadReceiptDrawerComponent', () => {
  let fixture: ComponentFixture<UploadReceiptDrawerComponent>;
  let ref: ComponentRef<UploadReceiptDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadReceiptDrawerComponent],
      providers: [CurrencyService],
    }).compileComponents();
    fixture = TestBed.createComponent(UploadReceiptDrawerComponent);
    ref = fixture.componentRef;
  });

  it('should not render when closed', () => {
    ref.setInput('open', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="upload-drawer"]')).toBeNull();
  });

  it('should render when open', () => {
    ref.setInput('open', true);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="upload-drawer"]')).toBeTruthy();
  });

  it('should show error when submit clicked with no file', () => {
    ref.setInput('open', true);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-testid="btn-upload"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="upload-err"]')).toBeTruthy();
  });

  it('should emit closed on close button click', () => {
    ref.setInput('open', true);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('[data-testid="btn-close-upload"]') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });

  it('should show file preview after file is picked', () => {
    ref.setInput('open', true);
    ref.setInput('houses', [MOCK_HOUSE]);
    fixture.detectChanges();

    fixture.componentInstance.pickedFile.set({ name: 'receipt.pdf', size: 102400, sizeLabel: '100 KB', kind: 'pdf' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="file-preview"]')).toBeTruthy();
  });
});
