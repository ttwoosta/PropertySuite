// Login screen — email + password, sign-in / sign-up toggle. Uses Firebase Auth
// when configured; otherwise any credentials sign in (demo mode).
import { useState, type FormEvent } from 'react';
import { Button, Input } from '../ds-vendor/components';
import { di } from '../lib/icon';
import { useAuth } from '../lib/auth';
import { firebaseConfigured } from '../lib/firebase';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('dana.reyes@example.com');
  const [pw, setPw] = useState('demo1234');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      if (mode === 'in') await signIn(email.trim(), pw);
      else await signUp(email.trim(), pw);
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : 'Could not sign in.';
      setErr(msg.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--surface-page)',
      }}
    >
      <div className="ps-fade" style={{ width: '100%', maxWidth: 384 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <img src="/assets/logo-mark.svg" width={38} height={38} alt="" />
          <span
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-heading)',
            }}
          >
            Property Suite
          </span>
        </div>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            margin: '0 0 24px',
          }}
        >
          {mode === 'in'
            ? 'Sign in to manage your portfolio'
            : 'Create your landlord account'}
        </p>
        <div
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            padding: 24,
          }}
        >
          <form
            onSubmit={submit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leadingIcon={di('mail')}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              leadingIcon={di('lock')}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            />
            {err ? (
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--danger-fg)',
                  background: 'var(--danger-bg)',
                  border: '1px solid color-mix(in srgb, var(--danger-solid) 30%, transparent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                }}
              >
                {err}
              </div>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={busy}
              style={{ marginTop: 4 }}
            >
              {busy
                ? 'Please wait…'
                : mode === 'in'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </form>
          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
            }}
          >
            {mode === 'in' ? 'New here? ' : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setErr(null);
                setMode((m) => (m === 'in' ? 'up' : 'in'));
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--text-link)',
                fontWeight: 600,
                fontSize: 'inherit',
              }}
            >
              {mode === 'in' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </div>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-faint)',
            fontSize: 'var(--text-xs)',
            marginTop: 18,
          }}
        >
          {firebaseConfigured
            ? 'Secured by Firebase Authentication'
            : 'Demo · any email and password will sign you in'}
        </p>
      </div>
    </div>
  );
}
