// Profile page — shows the signed-in user's name, email, and sign-out.
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Button, Card } from '../../ds-vendor/components';
import { di, LucideIcon } from '../../lib/icon';
import { useAuth } from '../../lib/auth';

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0' }}>
      <span
        style={{
          flex: 'none',
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-hover)',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'inline-flex', width: 18, height: 18 }}>
          <LucideIcon name={icon} />
        </span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">{label}</div>
        <div
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: 'var(--text-heading)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function ProfileApp() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Force light theme on the profile page (same as launcher).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100dvh' }}>
      <header className="launch-top">
        <Link
          to="/"
          title="Back to apps"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
            color: 'var(--text-body)',
          }}
        >
          <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{di('chevron-left')}</span>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Apps</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/assets/logo-mark.svg" width={28} height={28} alt="" />
          <span
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-heading)',
            }}
          >
            Property Suite
          </span>
        </div>
      </header>

      <div className="launch-body ps-fade">
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-heading)',
          }}
        >
          Profile
        </h1>
        <p style={{ margin: '6px 0 28px', color: 'var(--text-muted)', fontSize: 'var(--text-md)' }}>
          Your account details
        </p>

        <Card style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 8 }}>
            <Avatar name={user.name} style={{ width: 76, height: 76, fontSize: 30 }} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  color: 'var(--text-heading)',
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {user.email}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 18 }}>
            <DetailRow icon="user" label="Name" value={user.name} />
            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />
            <DetailRow icon="mail" label="Email" value={user.email} />
          </div>

          <Button
            variant="secondary"
            fullWidth
            leadingIcon={di('log-out')}
            onClick={() => void signOut().then(() => navigate('/'))}
            style={{ marginTop: 22 }}
          >
            Sign out
          </Button>
        </Card>
      </div>
    </div>
  );
}
