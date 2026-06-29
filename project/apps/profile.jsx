/* Profile page — shows the signed-in user's name, email, and sign out. */
const { useState, useEffect } = React;
const PDS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button, Avatar, Card } = PDS;

function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0' }}>
      <span style={{ flex: 'none', width: 38, height: 38, borderRadius: 'var(--radius-md)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
        <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide={icon}></i></span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">{label}</div>
        <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  );
}

function CurrencyRow() {
  const [code, setCode] = useState(window.PS.Currency.code());
  const list = window.PS.Currency.list;
  useEffect(() => { window.PS.icons(); });
  const onChange = (e) => { setCode(window.PS.Currency.set(e.target.value)); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0' }}>
      <span style={{ flex: 'none', width: 38, height: 38, borderRadius: 'var(--radius-md)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
        <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide="banknote"></i></span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">Default currency</div>
        <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>
          {list[code].label} · {list[code].symbol}{code}</div>
      </div>
      <div style={{ position: 'relative', flex: 'none' }}>
        <select value={code} onChange={onChange} aria-label="Default currency"
          style={{ appearance: 'none', WebkitAppearance: 'none', font: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 600,
            color: 'var(--text-heading)', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)', padding: '9px 34px 9px 13px', cursor: 'pointer', outline: 'none' }}>
          {Object.keys(list).map(k => (
            <option key={k} value={k}>{list[k].symbol}  {k} — {list[k].label}</option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
          display: 'inline-flex', width: 16, height: 16, color: 'var(--text-muted)' }}><i data-lucide="chevron-down"></i></span>
      </div>
    </div>
  );
}

function Profile({ user, onSignOut }) {
  const back = window.PS.profileReturn();
  return (
    <div className="prof-wrap" style={{ minHeight: '100dvh' }}>
      <header className="launch-top">
        <a href={back.href} title={'Back to ' + back.label}
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'var(--text-body)' }}>
          <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide="chevron-left"></i></span>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{back.label}</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="assets/logo-mark.svg" width="28" height="28" alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Property Suite</span>
        </div>
      </header>

      <div className="prof-body ps-fade">
        <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)' }}>Profile</h1>
        <p style={{ margin: '6px 0 28px', color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>Your account details</p>

        <Card style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 8 }}>
            <Avatar name={user.name} style={{ width: 76, height: 76, fontSize: 30 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>{user.name}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 18 }}>
            <DetailRow icon="user" label="Name" value={user.name} />
            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <DetailRow icon="mail" label="Email" value={user.email} />
            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <CurrencyRow />
          </div>

          <Button variant="secondary" fullWidth leadingIcon={<i data-lucide="log-out"></i>} onClick={onSignOut}
            style={{ marginTop: 22 }}>Sign out</Button>
        </Card>
      </div>
    </div>
  );
}

function ProfileRoot() {
  const [state, setState] = useState('resolving'); // resolving | in
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    window.PS.Auth.ready().then((u) => {
      if (!alive) return;
      if (!u) { window.location.href = 'Property Suite.html'; return; }
      setUser(u); setState('in');
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => { window.PS.icons(); });

  if (state === 'resolving') return <Spinner label="Loading your profile…" />;
  return <Profile user={user} onSignOut={() => { window.PS.Auth.signOut().finally(() => { window.location.href = 'Property Suite.html'; }); }} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<ProfileRoot />);
