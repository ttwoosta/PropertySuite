/* Property Suite — shared client helpers (plain JS, no Babel).
   Auth is backed by Firebase Auth (email/password); the signed-in session is
   managed by the Firebase SDK and persists across page navigation. Currency
   and theme remain local display preferences. Loaded AFTER lib/firebase-init.js
   so window.PS_FB is available. */
(function () {
  const CUR_KEY = 'ps_currency_v1';
  const PROFILE_FROM_KEY = 'ps_profile_from_v1';
  const THEME_KEY = 'ps_theme_v1';

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

  // Display theme — a SINGLE shared preference across the whole suite. Every
  // page reads the same key, so the launcher and all four apps always render in
  // the same mode. apply() stamps `data-theme` on <html> (the design-system CSS
  // remaps its tokens off that attribute). Applied immediately below — before
  // any React renders — to avoid a light-mode flash on dark.
  const themeListeners = [];
  const Theme = {
    get() {
      try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
      catch (e) { return 'light'; }
    },
    apply(mode) {
      const m = mode === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', m);
      return m;
    },
    set(mode) {
      const m = mode === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem(THEME_KEY, m); } catch (e) {}
      this.apply(m);
      themeListeners.slice().forEach((cb) => { try { cb(m); } catch (e) {} });
      return m;
    },
    toggle() { return this.set(this.get() === 'dark' ? 'light' : 'dark'); },
    // Subscribe to changes (same page or other tabs). Returns an unsubscribe fn.
    onChange(cb) {
      themeListeners.push(cb);
      return () => { const i = themeListeners.indexOf(cb); if (i >= 0) themeListeners.splice(i, 1); };
    },
  };
  Theme.apply(Theme.get());
  // Keep every open tab in sync when the value changes elsewhere.
  window.addEventListener('storage', (e) => {
    if (e.key !== THEME_KEY) return;
    const m = Theme.apply(Theme.get());
    themeListeners.slice().forEach((cb) => { try { cb(m); } catch (err) {} });
  });

  // Firebase-Auth-backed session. ready() resolves once on the first auth-state
  // callback (signed-in user or null); current()/get() expose the cached user
  // synchronously; onChange(cb) subscribes to future changes.
  const Auth = (function () {
    const fb = window.PS_FB;
    let current = null;
    let listeners = [];
    let settled = false;
    let resolveReady;
    const readyP = new Promise((r) => { resolveReady = r; });

    function shape(u) {
      if (!u) return null;
      const email = u.email || '';
      const name = u.displayName || deriveName(email);
      return { uid: u.uid, email, name, initials: initialsOf(name) };
    }

    if (fb && fb.auth) {
      fb.auth.onAuthStateChanged((u) => {
        current = shape(u);
        if (!settled) { settled = true; resolveReady(current); }
        listeners.slice().forEach((cb) => { try { cb(current); } catch (e) {} });
      });
    } else {
      console.error('[PS] Firebase Auth unavailable.');
      settled = true; resolveReady(null);
    }

    return {
      ready() { return readyP; },
      current() { return current; },
      get() { return current; }, // back-compat sync alias
      onChange(cb) {
        listeners.push(cb);
        // Replay current state to late subscribers (auth may already be settled).
        if (settled) { try { cb(current); } catch (e) {} }
        return () => { listeners = listeners.filter((x) => x !== cb); };
      },
      signIn(email, password) {
        return fb.auth.signInWithEmailAndPassword(email, password).then((c) => shape(c.user));
      },
      signUp(email, password) {
        return fb.auth.createUserWithEmailAndPassword(email, password).then((c) => {
          const name = deriveName(email);
          return c.user.updateProfile({ displayName: name })
            .catch(() => {})
            .then(() => shape(c.user));
        });
      },
      signOut() { return fb.auth.signOut(); },
    };
  })();

  // Human-readable message for a Firebase Auth error.
  function authErrorMessage(err) {
    const code = (err && err.code) || '';
    switch (code) {
      case 'auth/invalid-email': return 'That email address looks invalid.';
      case 'auth/user-disabled': return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Email or password is incorrect.';
      case 'auth/email-already-in-use': return 'An account with that email already exists.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/too-many-requests': return 'Too many attempts — please try again shortly.';
      case 'auth/network-request-failed': return 'Network error — check your connection.';
      case 'auth/operation-not-allowed': return 'Email/password sign-in is not enabled for this project.';
      default: return (err && err.message) || 'Something went wrong. Please try again.';
    }
  }

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

  window.PS = { Auth, authErrorMessage, Currency, Theme, go, rememberApp, profileReturn, icons, iconsSoon, deriveName, initialsOf,
    DS: '_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160' };
})();
