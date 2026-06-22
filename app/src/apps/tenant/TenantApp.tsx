// TenantBridge — main shell + Tenants tab + Queue tab (port of tenant.jsx).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, Card, IconButton, NavItem } from '../../ds-vendor/components';
import {
  EmptyState,
  Hamburger,
  Icon,
  ResponsiveShell,
  ThemeToggle,
  ToastHost,
  di,
  useDrawer,
  useTheme,
  useToast,
} from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { rememberApp } from '../../lib/nav';
import { AIAssistant, ThreadView } from './thread';
import {
  PROPS,
  QUEUE,
  SUGGESTIONS,
  TENANTS,
  THREADS,
  type Message,
  type QueueItem,
  type Suggestion,
} from './data';

const TABS = [
  { id: 'tenants', label: 'Tenants', icon: 'users' },
  { id: 'thread', label: 'Thread', icon: 'message-circle' },
  { id: 'ai', label: 'AI Assistant', icon: 'sparkles' },
  { id: 'queue', label: 'Queue', icon: 'calendar-clock' },
];
const SUITE_LINKS = [
  { label: 'Rent Tracker', icon: 'wallet', to: '/rent' },
  { label: 'Maintenance Scheduler', icon: 'calendar-check-2', to: '/maintenance' },
];

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: 'var(--amber-400)' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          style={{ display: 'inline-flex', width: 13, height: 13, opacity: i < n ? 1 : 0.25 }}
        >
          {di('star')}
        </span>
      ))}
    </span>
  );
}

/* ---------- Tenants tab ---------- */
function TenantsTab({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="ps-fade">
      {PROPS.map((p) => {
        const mine = TENANTS.filter((t) => t.prop === p.id);
        return (
          <section key={p.id} style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: p.color }} />
              <span
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--text-heading)',
                }}
              >
                {p.name}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {mine.length} tenants
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gap: 14,
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              }}
            >
              {mine.map((t) => (
                <Card key={t.id} interactive onClick={() => onOpen(t.id)}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}
                  >
                    <Avatar name={t.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 700,
                          color: 'var(--text-heading)',
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {t.unit} · {p.name}
                      </div>
                    </div>
                    <Badge tone="success" size="sm">
                      Occupied
                    </Badge>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Stars n={t.score} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Last contact {t.lastContact}d ago
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ---------- Queue tab ---------- */
function QueueTab({ items, onEdit }: { items: QueueItem[]; onEdit: () => void }) {
  if (!items.length)
    return (
      <Card>
        <EmptyState
          icon="calendar-clock"
          title="No scheduled sends"
          body="Drafts you approve with a send time will queue up here."
        />
      </Card>
    );
  return (
    <div className="ps-fade" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((q) => {
        const t = TENANTS.find((x) => x.id === q.tenant);
        return (
          <Card key={q.id} interactive>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  flex: 'none',
                  width: 54,
                  height: 54,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-sunken)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: 'var(--tracking-caps)',
                  }}
                >
                  {q.date.mon}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    lineHeight: 1,
                  }}
                >
                  {q.date.day}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                  }}
                >
                  {q.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <Icon
                    name={q.channel === 'email' ? 'mail' : 'message-square'}
                    size={13}
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {t ? t.name + ' · ' + t.unit : ''}
                  </span>
                </div>
              </div>
              <Badge tone="warning">{q.countdown}</Badge>
              <IconButton label="Edit" variant="ghost" onClick={onEdit}>
                {di('pencil')}
              </IconButton>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function TenantNav({
  item,
  active,
  onClick,
  badge,
}: {
  item: { id: string; label: string; icon: string };
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const { close } = useDrawer();
  return (
    <NavItem
      icon={di(item.icon)}
      label={item.label}
      active={active}
      badge={badge}
      onClick={() => {
        onClick();
        close();
      }}
    />
  );
}

/* ---------- App ---------- */
function TenantInner() {
  const { user } = useAuth();
  const [view, setView] = useState('tenants');
  const [tenantId, setTenantId] = useState('marcus');
  const [threads, setThreads] = useState<Record<string, Message[]>>(() =>
    JSON.parse(JSON.stringify(THREADS)),
  );
  const [suggs, setSuggs] = useState<Suggestion[]>(SUGGESTIONS);
  const [queue] = useState<QueueItem[]>(QUEUE);
  const [theme, toggleTheme] = useTheme('tenant');
  const toast = useToast();

  const tenant = TENANTS.find((t) => t.id === tenantId)!;
  const tenantSuggs = suggs.filter((s) => s.tenant === tenantId);

  const sendMsg = (msg: Message) =>
    setThreads((th) => ({ ...th, [tenantId]: [...(th[tenantId] || []), msg] }));
  const approveSugg = (id: string, text: string) => {
    const s = suggs.find((x) => x.id === id);
    if (!s) return;
    setThreads((th) => ({
      ...th,
      [s.tenant]: [
        ...(th[s.tenant] || []),
        { id: 'a' + Date.now(), who: 'you', channel: 'sms', text, when: 'Just now', aiDrafted: true },
      ],
    }));
    setSuggs((ls) => ls.filter((x) => x.id !== id));
    toast('Sent to ' + (TENANTS.find((t) => t.id === s.tenant)?.name || 'tenant'));
  };
  const dismissSugg = (id: string) => {
    setSuggs((ls) => ls.filter((x) => x.id !== id));
    toast('Suggestion dismissed');
  };
  const editDraft = (id: string, draft: string) =>
    setSuggs((ls) => ls.map((x) => (x.id === id ? { ...x, draft } : x)));
  const openTenant = (id: string) => {
    setTenantId(id);
    setView('thread');
  };

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link
          to="/"
          title="Back to launcher"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <img src="/assets/logo-mark.svg" width={30} height={30} alt="" />
          <span
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--text-heading)',
            }}
          >
            TenantBridge
          </span>
        </Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {TABS.map((t) => {
          let badge: number | undefined;
          if (t.id === 'ai') badge = suggs.length || undefined;
          else if (t.id === 'queue') badge = queue.length || undefined;
          return (
            <TenantNav
              key={t.id}
              item={t}
              active={view === t.id}
              onClick={() => setView(t.id)}
              badge={badge}
            />
          );
        })}
        <div className="eyebrow" style={{ padding: '18px 8px 8px' }}>
          Suite
        </div>
        {SUITE_LINKS.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'var(--text-body)',
              fontSize: 'var(--text-base)',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Icon name={l.icon} size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ flex: 1 }}>{l.label}</span>
            <Icon name="arrow-up-right" size={14} style={{ color: 'var(--text-faint)' }} />
          </Link>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '9px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--text-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 500,
          }}
        >
          <Icon
            name={theme === 'dark' ? 'sun' : 'moon'}
            size={18}
            style={{ color: 'var(--text-muted)' }}
          />
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </div>
    </div>
  );

  const tabMeta = TABS.find((t) => t.id === view)!;
  const topBar = (
    <div className="ps-topbar">
      <Hamburger />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">TenantBridge</div>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'var(--text-heading)',
          }}
        >
          {view === 'thread' ? tenant.name : tabMeta.label}
        </h1>
      </div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <Link
        to="/profile"
        title="Profile"
        aria-label="Profile"
        onClick={() => rememberApp('/tenant-bridge', 'TenantBridge')}
        style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}
      >
        <Avatar name={user!.name} size="md" />
      </Link>
    </div>
  );

  const fill = view === 'thread' || view === 'ai';
  return (
    <ResponsiveShell
      sidebar={sidebar}
      topBar={topBar}
      innerStyle={
        fill
          ? {
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 24px 24px',
              maxWidth: 'none',
            }
          : undefined
      }
    >
      <div style={fill ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } : {}}>
        {view === 'tenants' && <TenantsTab onOpen={openTenant} />}
        {view === 'thread' && (
          <ThreadView
            tenant={tenant}
            msgs={threads[tenantId] || []}
            suggestions={tenantSuggs}
            onSend={sendMsg}
            onApprove={approveSugg}
            onDismiss={dismissSugg}
            onEditDraft={editDraft}
          />
        )}
        {view === 'ai' && <AIAssistant />}
        {view === 'queue' && <QueueTab items={queue} onEdit={() => toast('Edit queued send')} />}
      </div>
    </ResponsiveShell>
  );
}

export function TenantApp() {
  return (
    <ToastHost>
      <TenantInner />
    </ToastHost>
  );
}
