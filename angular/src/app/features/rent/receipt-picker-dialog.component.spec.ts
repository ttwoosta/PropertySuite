import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { ReceiptPickerDialogComponent, PickerCtx } from './receipt-picker-dialog.component';
import { CurrencyService } from '../../services/currency.service';
import { ReceiptVm } from '../../models/rent.vm';

const MOCK_RECEIPTS: ReceiptVm[] = [
  { id: 'r1', merchant: 'British Gas', category: 'gas', houseId: 'h1', date: '2026-01-10', amount: 120, storagePath: 'r1.pdf', uploadedAt: new Date(), kind: 'pdf' },
  { id: 'r2', merchant: 'Thames Water', category: 'water', houseId: 'h1', date: '2026-02-05', amount: 65, storagePath: 'r2.jpg', uploadedAt: new Date(), kind: 'img' },
];

const CTX: PickerCtx = { entryId: 'gas-0', label: 'Gas · Jan' };

describe('ReceiptPickerDialogComponent', () => {
  let fixture: ComponentFixture<ReceiptPickerDialogComponent>;
  let ref: ComponentRef<ReceiptPickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptPickerDialogComponent],
      providers: [CurrencyService],
    }).compileComponents();
    fixture = TestBed.createComponent(ReceiptPickerDialogComponent);
    ref = fixture.componentRef;
  });

  it('should not render when ctx is null', () => {
    ref.setInput('ctx', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="receipt-picker"]')).toBeNull();
  });

  it('should show loading skeleton initially', fakeAsync(() => {
    ref.setInput('ctx', CTX);
    ref.setInput('receipts', MOCK_RECEIPTS);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="picker-loading"]')).toBeTruthy();
    tick(900);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="picker-loading"]')).toBeNull();
  }));

  it('should show receipt list after loading', fakeAsync(() => {
    ref.setInput('ctx', CTX);
    ref.setInput('receipts', MOCK_RECEIPTS);
    fixture.detectChanges();
    tick(900);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="picker-list"]')).toBeTruthy();
  }));

  it('should emit picked when a receipt is clicked', fakeAsync(() => {
    ref.setInput('ctx', CTX);
    ref.setInput('receipts', MOCK_RECEIPTS);
    fixture.detectChanges();
    tick(900);
    fixture.detectChanges();

    const emitted: ReceiptVm[] = [];
    fixture.componentInstance.picked.subscribe((r: ReceiptVm) => emitted.push(r));

    (fixture.nativeElement.querySelector('[data-testid="receipt-r1"]') as HTMLButtonElement).click();
    tick(750);
    expect(emitted.length).toBe(1);
    expect(emitted[0].id).toBe('r1');
  }));

  it('should emit closed on close button', () => {
    ref.setInput('ctx', CTX);
    ref.setInput('receipts', []);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('[data-testid="btn-close-picker"]') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });
});
