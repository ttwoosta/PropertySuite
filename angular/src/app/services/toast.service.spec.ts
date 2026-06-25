import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('starts with empty toasts', () => {
    expect(service.toasts().length).toBe(0);
  });

  it('adds a toast with show()', () => {
    service.show('Hello');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Hello');
    expect(service.toasts()[0].tone).toBe('success');
  });

  it('adds error tone toast', () => {
    service.show('Failed', 'error');
    expect(service.toasts()[0].tone).toBe('error');
  });

  it('dismisses a toast by id', () => {
    service.show('One');
    service.show('Two');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Two');
  });

  it('auto-dismisses after 2600ms', fakeAsync(() => {
    service.show('Auto');
    expect(service.toasts().length).toBe(1);
    tick(2600);
    expect(service.toasts().length).toBe(0);
  }));
});
