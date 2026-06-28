/* Launcher + auth shell. Mounts the whole Property Suite root. */
const { useState, useEffect } = React;
const DSL = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button, Input, Avatar } = DSL;

const APPS = [
{ key: 'houses', name: 'Houses', href: 'Houses.html', icon: 'building-2',
  tile: { bg: 'var(--brand-tint)', fg: 'var(--brand-on-tint)' },
  tag: 'Properties & rooms',
  desc: 'List every house, add, edit, or remove properties, and manage each room\u2019s tenant and base rent.' },
{ key: 'rent', name: 'Rent Tracker', href: 'Rent Tracker.html', icon: 'wallet',
  tile: { bg: 'var(--green-50)', fg: 'var(--green-600)' },
  tag: 'Income & expenses',
  desc: 'Track monthly rent, utilities, and receipts across every property — with a year grid and dashboards.' },
{ key: 'maint', name: 'Maintenance Scheduler', href: 'Maintenance Scheduler.html', icon: 'calendar-check-2',
  tile: { bg: 'var(--amber-50)', fg: 'var(--amber-700)' },
  tag: 'Stay ahead of every property',
  desc: 'Never miss a boiler service or safety check. Plan, prep, and batch your maintenance with smart scheduling.' },
{ key: 'tenant', name: 'Tenant Bridge', href: 'Tenant Bridge.html', icon: 'messages-square',
  tile: { bg: 'var(--blue-50)', fg: 'var(--blue-600)' },
  tag: 'Tenant communication',
  desc: 'A calm hub for tenant messages with AI-assisted drafting, suggestions, and a scheduled send queue.' }];


/* ---------------- Login ---------------- */
function Login({ onAuthed }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [mode, setMode] = useState('in'); // in | up
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !pw || busy) return;
    setBusy(true); setErr(null);
    try {
      const u = mode === 'in'
        ? await window.PS.Auth.signIn(email.trim(), pw)
        : await window.PS.Auth.signUp(email.trim(), pw);
      onAuthed && onAuthed(u);
    } catch (ex) {
      setErr(window.PS.authErrorMessage(ex));
      setBusy(false);
    }
  };
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--surface-page)' }}>
      <div className="ps-fade" style={{ width: '100%', maxWidth: 384 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, justifyContent: 'center', marginBottom: 8 }}>
          <img src="assets/logo-mark.svg" width="38" height="38" alt="" />
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Property Suite</span>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 24px' }}>
          {mode === 'in' ? 'Sign in to manage your portfolio' : 'Create your landlord account'}
        </p>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 24 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" leadingIcon={di('mail')} autoComplete="email" />
            <Input label="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••" leadingIcon={di('lock')} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
            {err ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', fontWeight: 500,
                color: 'var(--danger-fg)' }}>
                <span style={{ display: 'inline-flex', width: 16, height: 16, flex: 'none' }}><i data-lucide="alert-circle"></i></span>
                {err}
              </div>
            ) : null}
            <Button type="submit" variant="primary" fullWidth size="lg" disabled={busy} style={{ marginTop: 4 }}>
              {busy ? (mode === 'in' ? 'Signing in…' : 'Creating account…') : (mode === 'in' ? 'Sign in' : 'Create account')}
            </Button>
          </form>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {mode === 'in' ? "New here? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode((m) => m === 'in' ? 'up' : 'in'); setErr(null); }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'var(--text-link)', fontWeight: 600, fontSize: 'inherit' }}>
              {mode === 'in' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 'var(--text-xs)', marginTop: 18 }}>
          Secured by Firebase Authentication
        </p>
      </div>
    </div>);

}

/* ---------------- Launcher ---------------- */
function Launcher({ user, onSignOut }) {
  const [theme, toggleTheme] = useTheme();
  // Re-render lucide glyphs after the sun/moon icon swaps on toggle.
  useEffect(() => { window.PS.icons(); }, [theme]);
  return (
    <div className="launch-wrap" style={{ minHeight: '100dvh' }}>
      <header className="launch-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src="assets/logo-mark.svg" width="34" height="34" alt="" />
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Property Suite</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <a href="Profile.html" title="Profile" aria-label="Profile" onClick={() => window.PS.rememberApp()}
          style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
            <Avatar name={user.name} size="md" />
          </a>
        </div>
      </header>

      <div className="launch-body ps-fade">
        <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Your apps</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>
          Welcome back, {user.name.split(' ')[0]}. Pick a tool to get started.
        </p>

        {/* tablet+ : full cards */}
        <div className="app-grid">
          {APPS.map((a, i) =>
          <a key={a.key} href={a.href} className={'app-card' + (APPS.length % 2 === 1 && i === APPS.length - 1 ? ' span2' : '')}>
              <span className="tile" style={{ background: a.tile.bg, color: a.tile.fg }}>
                <span><i data-lucide={a.icon}></i></span>
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>{a.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase', color: 'var(--text-muted)', margin: '5px 0 8px' }}>{a.tag}</div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 1.55 }}>{a.desc}</p>
              </div>
            </a>
          )}
        </div>

        {/* phone : icon-only grid */}
        <div className="icon-only">
          {APPS.map((a, i) =>
          <a key={a.key} href={a.href} className={'icon-cell' + (APPS.length % 2 === 1 && i === APPS.length - 1 ? ' span2' : '')} style={{ height: "170px", width: "170px", alignItems: "center", justifyContent: "center" }}>
              <span className="tile" style={{ background: a.tile.bg, color: a.tile.fg }}>
                <span><i data-lucide={a.icon}></i></span>
              </span>
              <span className="nm">{a.name}</span>
            </a>
          )}
        </div>
      </div>
    </div>);

}

/* ---------------- Root / auth state machine ---------------- */
function Root() {
  const [state, setState] = useState('resolving'); // resolving | out | in
  const [user, setUser] = useState(null);
  const [houses, setHouses] = useState('unknown'); // unknown | empty | has

  useEffect(() => {
    const off = window.PS.Auth.onChange((u) => {
      if (u) { setUser(u); setState('in'); }
      else { setUser(null); setState('out'); setHouses('unknown'); }
    });
    return off;
  }, []);

  // Once signed in, check the portfolio. A brand-new landlord with no
  // properties is taken through the onboarding chat instead of the launcher.
  useEffect(() => {
    if (state !== 'in') return;
    let alive = true;
    (async () => {
      try {
        await window.PS_STORE.ready();
        if (!alive) return;
        const hs = window.PS_STORE.getHouses();
        setHouses(hs && hs.length ? 'has' : 'empty');
      } catch (e) { if (alive) setHouses('has'); }
    })();
    return () => { alive = false; };
  }, [state]);

  useEffect(() => {window.PS.icons();});

  if (state === 'resolving') return <Spinner label="Loading your suite…" />;
  if (state === 'out') return <Login onAuthed={(u) => {setUser(u);setState('in');}} />;
  if (houses === 'unknown') return <Spinner label="Loading your suite…" />;
  const OnboardingPopup = window.OnboardingPopup;
  return (
    <React.Fragment>
      <Launcher user={user} onSignOut={() => { window.PS.Auth.signOut(); }} />
      {houses === 'empty' && OnboardingPopup ? <OnboardingPopup user={user} /> : null}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);