/* Property Suite — shared client helpers (plain JS, no Babel).
   Auth lives in sessionStorage so multi-file navigation stays signed in
   within a tab session; all domain data is in-memory mock per page. */
(function () {
  const AUTH_KEY = 'ps_auth_v1';
  const CUR_KEY = 'ps_currency_v1';
  const PROFILE_FROM_KEY = 'ps_profile_from_v1';

  // Supported display currencies. Default is US Dollar.
  const CURRENCIES = {
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

  const Currency = {
    list: CURRENCIES,
    code() {
      try { return CURRENCIES[localStorage.getItem(CUR_KEY)] ? localStorage.getItem(CUR_KEY) : 'USD'; }
      catch (e) { return 'USD'; }
    },
    meta() { return CURRENCIES[this.code()] || CURRENCIES.USD; },
    symbol() { return this.meta().symbol; },
    set(code) {
      if (CURRENCIES[code]) { try { localStorage.setItem(CUR_KEY, code); } catch (e) {} }
      return this.code();
    },
    // Grouped absolute integer + currency code suffix, e.g. "4,475 VND".
    format(n) {
      const m = this.meta();
      return Math.round(Math.abs(Number(n) || 0)).toLocaleString(m.locale) + ' ' + m.code;
    },
  };

  const Auth = {
    get() {
      try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
      catch (e) { return null; }
    },
    signIn(email) {
      const name = deriveName(email);
      const user = { email, name, initials: initialsOf(name) };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      return user;
    },
    signOut() { localStorage.removeItem(AUTH_KEY); },
  };

  function deriveName(email) {
    const local = String(email || '').split('@')[0] || 'You';
    return local.split(/[._-]+/).filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'You';
  }
  function initialsOf(name) {
    const p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  }

  // Guarded navigation: if signed out, send to launcher login.
  function go(path) { window.location.href = path; }

  // Remember which app the user is leaving (called before opening Profile),
  // so Profile's back link can return them to that app.
  const APP_LABELS = {
    'Property Suite.html': 'Apps',
    'Rent Tracker.html': 'Rent Tracker',
    'Maintenance Scheduler.html': 'Maintenance Scheduler',
    'Tenant Bridge.html': 'Tenant Bridge',
  };
  function currentPage() { return decodeURIComponent((location.pathname.split('/').pop()) || ''); }
  function rememberApp() {
    try {
      const p = currentPage();
      if (p && p !== 'Profile.html') sessionStorage.setItem(PROFILE_FROM_KEY, p);
    } catch (e) {}
  }
  function profileReturn() {
    let from = '';
    try { from = sessionStorage.getItem(PROFILE_FROM_KEY) || ''; } catch (e) {}
    const href = (from && from !== 'Profile.html') ? from : 'Property Suite.html';
    return { href, label: APP_LABELS[href] || 'Apps' };
  }

  // Re-render lucide icons; safe to call repeatedly.
  function icons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
  // Convenience: run icons() shortly after a React commit.
  function iconsSoon() { requestAnimationFrame(() => requestAnimationFrame(icons)); }

  window.PS = { Auth, Currency, go, rememberApp, profileReturn, icons, iconsSoon, deriveName, initialsOf,
    DS: '_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160' };
})();
