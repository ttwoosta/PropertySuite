import { Injectable, signal } from '@angular/core';

interface CurrencyMeta {
  code: string;
  symbol: string;
  locale: string;
  label: string;
}

const CURRENCIES: Record<string, CurrencyMeta> = {
  GBP: { code: 'GBP', symbol: '\u00A3', locale: 'en-GB', label: 'British Pound' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '\u20AC', locale: 'de-DE', label: 'Euro' },
};

const CUR_KEY = 'ps_currency_v1';

/**
 * Display-currency helper, ported from `window.PS.Currency`. Defaults to
 * GBP for the Leeds-based demo portfolio. `format(n)` produces a grouped
 * integer with a currency-code suffix, e.g. "4,475 GBP".
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly codeSig = signal<string>(this.read());

  /** Reactive currency code. */
  readonly currentCode = this.codeSig.asReadonly();

  code(): string {
    return this.codeSig();
  }

  private meta(): CurrencyMeta {
    return CURRENCIES[this.codeSig()] ?? CURRENCIES['GBP'];
  }

  symbol(): string {
    return this.meta().symbol;
  }

  set(code: string): string {
    if (CURRENCIES[code]) {
      this.codeSig.set(code);
      try {
        localStorage.setItem(CUR_KEY, code);
      } catch {
        /* ignore */
      }
    }
    return this.codeSig();
  }

  /** Grouped absolute integer + code suffix, e.g. "4,475 GBP". */
  format(n: number): string {
    const m = this.meta();
    return Math.round(Math.abs(Number(n) || 0)).toLocaleString(m.locale) + ' ' + m.code;
  }

  /** Two-decimal amount + code suffix, e.g. "600.00 GBP" (form summaries). */
  amount2(n: number): string {
    return (
      (Math.round(n * 100) / 100).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) +
      ' ' +
      this.meta().code
    );
  }

  private read(): string {
    try {
      const v = localStorage.getItem(CUR_KEY);
      return v && CURRENCIES[v] ? v : 'GBP';
    } catch {
      return 'GBP';
    }
  }
}
