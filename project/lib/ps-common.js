/* Property Suite — shared client helpers (plain JS, no Babel).
   Auth lives in sessionStorage so multi-file navigation stays signed in
   within a tab session; all domain data is in-memory mock per page. */
(function () {
  const AUTH_KEY = 'ps_auth_v1';

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

  // Re-render lucide icons; safe to call repeatedly.
  function icons() {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }
  // Convenience: run icons() shortly after a React commit.
  function iconsSoon() { requestAnimationFrame(() => requestAnimationFrame(icons)); }

  window.PS = { Auth, go, icons, iconsSoon, deriveName, initialsOf,
    DS: '_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160' };
})();
