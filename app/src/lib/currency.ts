// Currency utility — persists the user's preferred display currency to localStorage.
const STORE_KEY = 'ps_currency';

// Supported display currencies. Default is US Dollar.
export const CURRENCIES: Record<string, { code: string; symbol: string; locale: string; label: string }> = {
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar' },
  GBP: { code: 'GBP', symbol: '\u00A3', locale: 'en-GB', label: 'British Pound' },
  EUR: { code: 'EUR', symbol: '\u20AC', locale: 'de-DE', label: 'Euro' },
  CAD: { code: 'CAD', symbol: '$', locale: 'en-CA', label: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: '$', locale: 'en-AU', label: 'Australian Dollar' },
  JPY: { code: 'JPY', symbol: '\u00A5', locale: 'ja-JP', label: 'Japanese Yen' },
  CNY: { code: 'CNY', symbol: '\u00A5', locale: 'zh-CN', label: 'Chinese Yuan' },
  TWD: { code: 'TWD', symbol: 'NT$', locale: 'zh-TW', label: 'New Taiwan Dollar' },
  HKD: { code: 'HKD', symbol: 'HK$', locale: 'zh-HK', label: 'Hong Kong Dollar' },
  VND: { code: 'VND', symbol: '\u20AB', locale: 'vi-VN', label: 'Vietnamese Dong' },
  KRW: { code: 'KRW', symbol: '\u20A9', locale: 'ko-KR', label: 'South Korean Won' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', label: 'Singapore Dollar' },
  INR: { code: 'INR', symbol: '\u20B9', locale: 'en-IN', label: 'Indian Rupee' },
  THB: { code: 'THB', symbol: '\u0E3F', locale: 'th-TH', label: 'Thai Baht' },
};


export function getCurrencyCode(): string {
  try { return localStorage.getItem(STORE_KEY) || 'USD'; } catch { return 'USD'; }
}

export function setCurrencyCode(code: string): string {
  try { localStorage.setItem(STORE_KEY, code); } catch { /* ignore */ }
  return code;
}

export function getCurrencySymbol(): string {
  return CURRENCIES[getCurrencyCode()]?.symbol ?? '$';
}

export function formatCurrency(n: number): string {
  return getCurrencySymbol() + Math.round(Math.abs(n)).toLocaleString();
}

export function formatCurrencyDecimal(n: number): string {
  return (
    (Math.round(n * 100) / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    ' ' +
    getCurrencyCode()
  );
}
