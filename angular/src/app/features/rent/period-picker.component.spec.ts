import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodPickerComponent } from './period-picker.component';
import { ComponentRef } from '@angular/core';

describe('PeriodPickerComponent', () => {
  let fixture: ComponentFixture<PeriodPickerComponent>;
  let ref: ComponentRef<PeriodPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodPickerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PeriodPickerComponent);
    ref = fixture.componentRef;
  });

  it('should not render panel when closed', () => {
    ref.setInput('open', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="period-picker"]')).toBeNull();
  });

  it('should render panel when open', () => {
    ref.setInput('open', true);
    ref.setInput('month', 3);
    ref.setInput('year', 2026);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="period-picker"]')).toBeTruthy();
  });

  it('should emit picked when a month button is clicked', () => {
    ref.setInput('open', true);
    ref.setInput('month', 0);
    ref.setInput('year', 2026);
    fixture.detectChanges();

    const emitted: { month: number; year: number }[] = [];
    fixture.componentInstance.picked.subscribe((v: { month: number; year: number }) => emitted.push(v));

    const btn = fixture.nativeElement.querySelector('[data-testid="month-5"]') as HTMLButtonElement;
    btn.click();
    expect(emitted.length).toBe(1);
    expect(emitted[0].month).toBe(5);
  });

  it('should emit closed when done is clicked', () => {
    ref.setInput('open', true);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));

    (fixture.nativeElement.querySelector('[data-testid="period-picker-done"]') as HTMLButtonElement).click();
    expect(closed).toBeTrue();
  });
});
