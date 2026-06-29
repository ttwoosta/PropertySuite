// Launcher (home) — landing screen after sign-in. Full cards on tablet+,
// compact 2-col icon grid on phone. Each card navigates to a sub-app.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ds-vendor/components';
import { LucideIcon, di } from '../lib/icon';
import { useAuth } from '../lib/auth';
import { rememberApp } from '../lib/nav';
import { ThemeToggle, useTheme } from '../components/ui';
import '../styles/launcher.css';

interface AppDef {
  key: string;
  name: string;
  to: string;
  icon: string;
  tile: { bg: string; fg: string };
  tag: string;
  desc: string;
}

const APPS: AppDef[] = [
  {
    key: 'houses',
    name: 'Houses',
    to: '/houses',
    icon: 'building-2',
    tile: { bg: 'var(--brand-tint)', fg: 'var(--brand-on-tint)' },
    tag: 'Properties & rooms',
    desc: 'List every house, add, edit, or remove properties, and manage each room\'s tenant and base rent.',
  },
  {
    key: 'rent',
    name: 'Rent Tracker',
    to: '/rent',
    icon: 'wallet',
    tile: { bg: 'var(--green-50)', fg: 'var(--green-600)' },
    tag: 'Income & expenses',
    desc: 'Track monthly rent, utilities, and receipts across every property — with a year grid and dashboards.',
  },
  {
    key: 'maint',
    name: 'Maintenance Scheduler',
    to: '/maintenance',
    icon: 'calendar-check-2',
    tile: { bg: 'var(--amber-50)', fg: 'var(--amber-700)' },
    tag: 'Stay ahead of every property',
    desc: 'Never miss a boiler service or safety check. Plan, prep, and batch your maintenance with smart scheduling.',
  },
  {
    key: 'tenant',
    name: 'TenantBridge',
    to: '/tenant-bridge',
    icon: 'messages-square',
    tile: { bg: 'var(--blue-50)', fg: 'var(--blue-600)' },
    tag: 'Tenant communication',
    desc: 'A calm hub for tenant messages with AI-assisted drafting, suggestions, and a scheduled send queue.',
  },
];

export function Launcher() {
  const { user } = useAuth();
  const [theme, toggleTheme] = useTheme('launcher');
  const [, forceUpdate] = useState(0);

  // The launcher always sits on the light canvas, even after visiting a dark app.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  // Re-render lucide icons after theme toggle
  useEffect(() => { forceUpdate((n) => n + 1); }, [theme]);

  if (!user) return null;

  const lastIdx = APPS.length - 1;

  return (
    <div className="launch-wrap" style={{ minHeight: '100dvh' }}>
      <header className="launch-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src="/assets/logo-mark.svg" width={34} height={34} alt="" />
          <span
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-heading)',
            }}
          >
            Property Suite
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <Link
            to="/profile"
            title="Profile"
            aria-label="Profile"
            onClick={() => rememberApp('/', 'Apps')}
            style={{
              display: 'flex',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              borderRadius: '50%',
              textDecoration: 'none',
            }}
          >
            <Avatar name={user.name} size="md" />
          </Link>
        </div>
      </header>

      <div className="launch-body ps-fade">
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--text-3xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-heading)',
          }}
        >
          Your apps
        </h1>
        <p
          style={{
            margin: '8px 0 0',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-md)',
          }}
        >
          Welcome back, {user.name.split(' ')[0]}. Pick a tool to get started.
        </p>

        {/* tablet+ : full cards */}
        <div className="app-grid">
          {APPS.map((a, i) => (
            <Link
              key={a.key}
              to={a.to}
              className={'app-card' + (APPS.length % 2 === 1 && i === lastIdx ? ' span2' : '')}
            >
              <span className="tile" style={{ background: a.tile.bg, color: a.tile.fg }}>
                <span>
                  <LucideIcon name={a.icon} />
                </span>
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {a.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    letterSpacing: 'var(--tracking-caps)',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: '5px 0 8px',
                  }}
                >
                  {a.tag}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-body)',
                    lineHeight: 1.55,
                  }}
                >
                  {a.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* phone : icon-only grid */}
        <div className="icon-only">
          {APPS.map((a, i) => (
            <Link
              key={a.key}
              to={a.to}
              className={'icon-cell' + (APPS.length % 2 === 1 && i === lastIdx ? ' span2' : '')}
            >
              <span className="tile" style={{ background: a.tile.bg, color: a.tile.fg }}>
                <span>
                  <LucideIcon name={a.icon} />
                </span>
              </span>
              <span className="nm">{a.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
