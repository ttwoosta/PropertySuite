/* Launcher + auth shell. Mounts the whole Property Suite root. */
const { useState, useEffect } = React;
const DSL = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button, Input, Avatar } = DSL;

const APPS = [
  { key: 'rent', name: 'Rent Tracker', href: 'Rent Tracker.html', icon: 'wallet',
    tile: { bg: 'var(--green-50)', fg: 'var(--green-600)' },
    tag: 'Income & expenses',
    desc: 'Track monthly rent, utilities, and receipts across every property — with a year grid and dashboards.' },
  { key: 'maint', name: 'Maintenance Scheduler', href: 'Maintenance Scheduler.html', icon: 'calendar-check-2',
    tile: { bg: 'var(--amber-50)', fg: 'var(--amber-700)' },
    tag: 'Stay ahead of every property',
    desc: 'Never miss a boiler service or safety check. Plan, prep, and batch your maintenance with smart scheduling.' },
  { key: 'tenant', name: 'TenantBridge', href: 'Tenant Bridge.html', icon: 'messages-square',
    tile: { bg: 'var(--blue-50)', fg: 'var(--blue-600)' },
    tag: 'Tenant communication',
    desc: 'A calm hub for tenant messages with AI-assisted drafting, suggestions, and a scheduled send queue.' },
];

/* ---------------- Login ---------------- */
function Login({ onAuthed }) {
  const [email, setEmail] = useState('dana.reyes@example.com');
  const [pw, setPw] = useState('demo1234');
  const [mode, setMode] = useState('in'); // in | up
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onAuthed(window.PS.Auth.signIn(email.trim()));
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
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" leadingIcon={di('mail')} autoComplete="email" />
            <Input label="Password" type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••" leadingIcon={di('lock')} autoComplete="current-password" />
            <Button type="submit" variant="primary" fullWidth size="lg" style={{ marginTop: 4 }}>
              {mode === 'in' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {mode === 'in' ? "New here? " : 'Already have an account? '}
            <button onClick={() => setMode(m => (m === 'in' ? 'up' : 'in'))}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: 'var(--text-link)', fontWeight: 600, fontSize: 'inherit' }}>
              {mode === 'in' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 'var(--text-xs)', marginTop: 18 }}>
          Demo · any email and password will sign you in
        </p>
      </div>
    </div>
  );
}

/* ---------------- Launcher ---------------- */
function Launcher({ user, onSignOut }) {
  return (
    <div className="launch-wrap" style={{ minHeight: '100dvh' }}>
      <header className="launch-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src="assets/logo-mark.svg" width="34" height="34" alt="" />
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Property Suite</span>
        </div>
        <a href="Profile.html" title="Profile" aria-label="Profile"
          style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
          <Avatar name={user.name} size="md" />
        </a>
      </header>

      <div className="launch-body ps-fade">
        <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Your apps</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>
          Welcome back, {user.name.split(' ')[0]}. Pick a tool to get started.
        </p>

        {/* tablet+ : full cards */}
        <div className="app-grid">
          {APPS.map((a, i) => (
            <a key={a.key} href={a.href} className={'app-card' + (i === 2 ? ' span2' : '')}>
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
          ))}
        </div>

        {/* phone : icon-only grid */}
        <div className="icon-only">
          {APPS.map(a => (
            <a key={a.key} href={a.href} className="icon-cell">
              <span className="tile" style={{ background: a.tile.bg, color: a.tile.fg }}>
                <span><i data-lucide={a.icon}></i></span>
              </span>
              <span className="nm">{a.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Root / auth state machine ---------------- */
function Root() {
  const [state, setState] = useState('resolving'); // resolving | out | in
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const u = window.PS.Auth.get();
      if (u) { setUser(u); setState('in'); } else { setState('out'); }
    }, 480);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { window.PS.icons(); });

  if (state === 'resolving') return <Spinner label="Loading your suite…" />;
  if (state === 'out') return <Login onAuthed={(u) => { setUser(u); setState('in'); }} />;
  return <Launcher user={user} onSignOut={() => { window.PS.Auth.signOut(); setUser(null); setState('out'); }} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
