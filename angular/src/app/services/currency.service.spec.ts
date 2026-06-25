import { TestBed } from '@angular/core/testing';
import { CurrencyService, CURRENCIES } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyService);
  });

  it('defaults to USD', () => {
    expect(service.code()).toBe('USD');
  });

  it('formats USD amount', () => {
    service.setCode('USD');
    expect(service.format(1234)).toContain('1,234');
    expect(service.format(1234)).toContain('$');
  });

  it('switches currency and updates symbol', () => {
    service.setCode('GBP');
    expect(service.code()).toBe('GBP');
    expect(service.getSymbol()).toBe('£');
  });

  it('persists to localStorage', () => {
    service.setCode('EUR');
    expect(localStorage.getItem('ps_currency')).toBe('EUR');
  });

  it('formats decimal correctly', () => {
    service.setCode('USD');
    const result = service.formatDecimal(1234.56);
    expect(result).toContain('1,234.56');
    expect(result).toContain('USD');
  });

  it('ignores unknown currency codes', () => {
    const before = service.code();
    service.setCode('FAKE');
    expect(service.code()).toBe(before);
  });

  it('has all CURRENCIES defined', () => {
    const codes = ['USD', 'GBP', 'EUR', 'JPY', 'SGD'];
    for (const code of codes) {
      expect(CURRENCIES[code]).toBeDefined();
      expect(CURRENCIES[code].symbol).toBeTruthy();
    }
  });
});
