import { Injectable, signal } from '@angular/core';

export interface CurrencyDef {
  code: string;
  symbol: string;
  locale: string;
  label: string;
}

export const CURRENCIES: Record<string, CurrencyDef> = {
  USD: { code: 'USD', symbol: '$',  locale: 'en-US', label: 'US Dollar' },
  GBP: { code: 'GBP', symbol: '£',  locale: 'en-GB', label: 'British Pound' },
  EUR: { code: 'EUR', symbol: '€',  locale: 'de-DE', label: 'Euro' },
  CAD: { code: 'CAD', symbol: 'CA$', locale: 'en-CA', label: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', label: 'Australian Dollar' },
  JPY: { code: 'JPY', symbol: '¥',  locale: 'ja-JP', label: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '¥',  locale: 'zh-CN', label: 'Chinese Yuan' },
  TWD: { code: 'TWD', symbol: 'NT$', locale: 'zh-TW', label: 'New Taiwan Dollar' },
  HKD: { code: 'HKD', symbol: 'HK$', locale: 'zh-HK', label: 'Hong Kong Dollar' },
  VND: { code: 'VND', symbol: '₫',  locale: 'vi-VN', label: 'Vietnamese Dong' },
  KRW: { code: 'KRW', symbol: '₩',  locale: 'ko-KR', label: 'South Korean Won' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', label: 'Singapore Dollar' },
  INR: { code: 'INR', symbol: '₹',  locale: 'en-IN', label: 'Indian Rupee' },
  THB: { code: 'THB', symbol: '฿',  locale: 'th-TH', label: 'Thai Baht' },
};

const LS_KEY = 'ps_currency';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly _code = signal<string>(
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem(LS_KEY) ?? 'USD')
      : 'USD'
  );

  readonly code = this._code.asReadonly();

  get def(): CurrencyDef {
    return CURRENCIES[this._code()] ?? CURRENCIES['USD'];
  }

  setCode(code: string): void {
    if (!CURRENCIES[code]) return;
    localStorage.setItem(LS_KEY, code);
    this._code.set(code);
  }

  getSymbol(): string { return this.def.symbol; }

  format(n: number): string {
    const { symbol, locale, code } = this.def;
    const rounded = Math.round(n);
    try {
      return symbol + ' ' + rounded.toLocaleString(locale);
    } catch {
      return `${code} ${rounded}`;
    }
  }

  formatDecimal(n: number): string {
    const { locale, code } = this.def;
    try {
      return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + code;
    } catch {
      return `${n.toFixed(2)} ${code}`;
    }
  }
}
