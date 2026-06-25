import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { ReceiptViewerDialogComponent, ViewerCtx } from './receipt-viewer-dialog.component';
import { CurrencyService } from '../../services/currency.service';
import { ReceiptVm } from '../../models/rent.vm';

const MOCK_RECEIPT: ReceiptVm = {
  id: 'r1', merchant: 'British Gas', category: 'gas', houseId: 'h1',
  date: '2026-01-10', amount: 120, storagePath: 'receipts/r1.pdf',
  uploadedAt: new Date(), kind: 'pdf',
};

describe('ReceiptViewerDialogComponent', () => {
  let fixture: ComponentFixture<ReceiptViewerDialogComponent>;
  let ref: ComponentRef<ReceiptViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptViewerDialogComponent],
      providers: [CurrencyService],
    }).compileComponents();
    fixture = TestBed.createComponent(ReceiptViewerDialogComponent);
    ref = fixture.componentRef;
  });

  it('should not render when ctx is null', () => {
    ref.setInput('ctx', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="receipt-viewer"]')).toBeNull();
  });

  it('should render receipt viewer when ctx is set', () => {
    ref.setInput('ctx', { receipt: MOCK_RECEIPT } as ViewerCtx);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="receipt-viewer"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="viewer-merchant"]').textContent.trim()).toBe('British Gas');
  });

  it('should not show unlink footer when no entryId', () => {
    ref.setInput('ctx', { receipt: MOCK_RECEIPT } as ViewerCtx);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="viewer-footer"]')).toBeNull();
  });

  it('should show unlink footer when entryId is set', () => {
    ref.setInput('ctx', { receipt: MOCK_RECEIPT, entryId: 'gas-0' } as ViewerCtx);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="viewer-footer"]')).toBeTruthy();
  });

  it('should require confirmation before unlinking', () => {
    ref.setInput('ctx', { receipt: MOCK_RECEIPT, entryId: 'gas-0' } as ViewerCtx);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="btn-unlink"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirm()).toBeTrue();
    // No unlinked event yet
  });

  it('should emit unlinked on second click (confirm)', fakeAsync(() => {
    ref.setInput('ctx', { receipt: MOCK_RECEIPT, entryId: 'gas-0' } as ViewerCtx);
    fixture.detectChanges();

    const emitted: ViewerCtx[] = [];
    fixture.componentInstance.unlinked.subscribe((c: ViewerCtx) => emitted.push(c));

    const btn = fixture.nativeElement.querySelector('[data-testid="btn-unlink"]') as HTMLButtonElement;
    btn.click(); // first click → confirm
    fixture.detectChanges();
    btn.click(); // second click → unlink
    tick(800);
    expect(emitted.length).toBe(1);
  }));

  it('should emit closed when close button clicked', () => {
    ref.setInput('ctx', { receipt: MOCK_RECEIPT } as ViewerCtx);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('[data-testid="btn-close-viewer"]') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });
});
