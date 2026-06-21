/* TenantBridge — main shell + Tenants tab + Queue tab.
   Loaded after tenant-data.js, ps-ui.jsx, tenant-thread.jsx. */
const { useState: useT, useEffect: useTE, useMemo: useTM } = React;
const TDS2 = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button: TBtn, IconButton: TIcon, Badge: TBadge, Avatar: TAv, Card: TCard } = TDS2;
const TX = window.TENANT;

const TABS = [
  { id: 'tenants', label: 'Tenants', icon: 'users' },
  { id: 'thread', label: 'Thread', icon: 'message-circle' },
  { id: 'ai', label: 'AI Assistant', icon: 'sparkles' },
  { id: 'queue', label: 'Queue', icon: 'calendar-clock' },
];
const SUITE_LINKS = [
  { label: 'Rent Tracker', icon: 'wallet', href: 'Rent Tracker.html' },
  { label: 'Maintenance Scheduler', icon: 'calendar-check-2', href: 'Maintenance Scheduler.html' },
];

function Stars({ n }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--amber-400)' }}>
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{ display: 'inline-flex', width: 13, height: 13, opacity: i < n ? 1 : 0.25 }}>
          <i data-lucide={i < n ? 'star' : 'star'}></i>
        </span>
      ))}
    </span>
  );
}

/* ---------- Tenants tab ---------- */
function TenantsTab({ onOpen }) {
  return (
    <div className="ps-fade">
      {TX.PROPS.map(p => {
        const mine = TX.TENANTS.filter(t => t.prop === p.id);
        return (
          <section key={p.id} style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: p.color }} />
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>{p.name}</span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{mine.length} tenants</span>
            </div>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {mine.map(t => (
                <TCard key={t.id} interactive onClick={() => onOpen(t.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                    <TAv name={t.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{t.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.unit} · {p.name}</div>
                    </div>
                    <TBadge tone="success" size="sm">Occupied</TBadge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <Stars n={t.score} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Last contact {t.lastContact}d ago</span>
                  </div>
                </TCard>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Queue tab ---------- */
function QueueTab({ items, onEdit }) {
  if (!items.length) return <TCard><EmptyState icon="calendar-clock" title="No scheduled sends" body="Drafts you approve with a send time will queue up here." /></TCard>;
  return (
    <div className="ps-fade" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(q => {
        const t = TX.TENANTS.find(x => x.id === q.tenant);
        return (
          <TCard key={q.id} interactive>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 'none', width: 54, height: 54, borderRadius: 'var(--radius-md)',
                background: 'var(--surface-sunken)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: 'var(--tracking-caps)' }}>{q.date.mon}</span>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1 }}>{q.date.day}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{q.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <Icon name={q.channel === 'email' ? 'mail' : 'message-square'} size={13} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{t ? t.name + ' · ' + t.unit : ''}</span>
                </div>
              </div>
              <TBadge tone="warning">{q.countdown}</TBadge>
              <TIcon label="Edit" variant="ghost" onClick={onEdit}>{di('pencil')}</TIcon>
            </div>
          </TCard>
        );
      })}
    </div>
  );
}

/* ---------- App ---------- */
function TenantApp() {
  const [auth, setAuth] = useT('resolving');
  const [user, setUser] = useT(null);
  const [view, setView] = useT('tenants');
  const [tenantId, setTenantId] = useT('marcus');
  const [threads, setThreads] = useT(() => JSON.parse(JSON.stringify(TX.THREADS)));
  const [suggs, setSuggs] = useT(TX.SUGGESTIONS);
  const [queue] = useT(TX.QUEUE);
  const [theme, toggleTheme] = useTheme('tenant');
  const toast = useToast();

  useTE(() => {
    const t = setTimeout(() => {
      const u = window.PS.Auth.get();
      if (!u) { window.location.href = 'Property Suite.html'; return; }
      setUser(u); setAuth('in');
    }, 360);
    return () => clearTimeout(t);
  }, []);
  useTE(() => { window.PS.icons(); });

  if (auth === 'resolving') return <Spinner label="Loading TenantBridge…" />;
  const tenant = TX.TENANTS.find(t => t.id === tenantId);
  const tenantSuggs = suggs.filter(s => s.tenant === tenantId);
  const signOut = () => { window.PS.Auth.signOut(); window.location.href = 'Property Suite.html'; };

  const sendMsg = (msg) => setThreads(th => ({ ...th, [tenantId]: [...(th[tenantId] || []), msg] }));
  const approveSugg = (id, text) => {
    const s = suggs.find(x => x.id === id); if (!s) return;
    setThreads(th => ({ ...th, [s.tenant]: [...(th[s.tenant] || []), { id: 'a' + Date.now(), who: 'you', channel: 'sms', text, when: 'Just now', aiDrafted: true }] }));
    setSuggs(ls => ls.filter(x => x.id !== id));
    toast('Sent to ' + (TX.TENANTS.find(t => t.id === s.tenant)?.name || 'tenant'));
  };
  const dismissSugg = (id) => { setSuggs(ls => ls.filter(x => x.id !== id)); toast('Suggestion dismissed'); };
  const editDraft = (id, draft) => setSuggs(ls => ls.map(x => x.id === id ? { ...x, draft } : x));
  const openTenant = (id) => { setTenantId(id); setView('thread'); };

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="Property Suite.html" title="Back to launcher" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="assets/logo-mark.svg" width="30" height="30" alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>TenantBridge</span>
        </a>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {TABS.map(t => {
          let badge;
          if (t.id === 'ai') badge = suggs.length || undefined;
          else if (t.id === 'queue') badge = queue.length || undefined;
          return (
            <TenantNav key={t.id} item={t} active={view === t.id} onClick={() => setView(t.id)} badge={badge} />
          );
        })}
        <div className="eyebrow" style={{ padding: '18px 8px 8px' }}>Suite</div>
        {SUITE_LINKS.map(l => (
          <a key={l.label} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
            borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-body)',
            fontSize: 'var(--text-base)', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon name={l.icon} size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ flex: 1 }}>{l.label}</span>
            <Icon name="arrow-up-right" size={14} style={{ color: 'var(--text-faint)' }} />
          </a>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '9px 12px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          background: 'transparent', color: 'var(--text-body)', fontSize: 'var(--text-base)', fontWeight: 500 }}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} style={{ color: 'var(--text-muted)' }} />
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </div>
    </div>
  );

  const tabMeta = TABS.find(t => t.id === view);
  const topBar = (
    <div className="ps-topbar">
      <Hamburger />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">TenantBridge</div>
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>
          {view === 'thread' ? tenant.name : tabMeta.label}
        </h1>
      </div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <a href="Profile.html" title="Profile" aria-label="Profile"
        style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
        <TAv name={user.name} size="md" />
      </a>
    </div>
  );

  const fill = view === 'thread' || view === 'ai';
  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}
      innerStyle={fill ? { height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 24px 24px', maxWidth: 'none' } : undefined}>
      <div style={fill ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } : {}}>
        {view === 'tenants' && <TenantsTab onOpen={openTenant} />}
        {view === 'thread' && <ThreadView tenant={tenant} msgs={threads[tenantId] || []}
          suggestions={tenantSuggs} onSend={sendMsg} onApprove={approveSugg}
          onDismiss={dismissSugg} onEditDraft={editDraft} />}
        {view === 'ai' && <AIAssistant />}
        {view === 'queue' && <QueueTab items={queue} onEdit={() => toast('Edit queued send')} />}
      </div>
    </ResponsiveShell>
  );
}

function TenantNav({ item, active, onClick, badge }) {
  const { close } = useDrawer();
  return (
    <TDS2.NavItem icon={di(item.icon)} label={item.label} active={active}
      badge={badge} onClick={() => { onClick(); close(); }} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ToastHost><TenantApp /></ToastHost>);
