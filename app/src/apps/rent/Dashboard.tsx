import { type CSSProperties } from 'react';
import { Card, Badge } from '../../ds-vendor/components';
import { Icon } from '../../components/ui';
import { useRentEntries, type House, type RoomStatus, MONTH_NAMES, gbp } from './data';

const STATUS_BADGE: Record<RoomStatus, 'success' | 'warning' | 'neutral'> = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'neutral',
  Vacant: 'neutral',
};

function isNetworkError(err: Error): boolean {
  const m = err.message.toLowerCase();
  return m.includes('unavailable') || m.includes('err_internet_disconnected') || m.includes('offline') || m.includes('network');
}

function StatusShell({ children, testId }: { children: React.ReactNode; testId: string }) {
  return (
    <div data-testid={testId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240, textAlign: 'center', padding: 40 }}>
      {children}
    </div>
  );
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <button
      onClick={onRetry}
      aria-label="Retry"
      style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}
    >
      Retry
    </button>
  );
}

export function Dashboard({ house }: { house: House }) {
  const { entries, loading, error, retry } = useRentEntries(house.id);

  if (loading) {
    return (
      <StatusShell testId="dashboard-loading">
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Loading…</span>
      </StatusShell>
    );
  }

  if (error) {
    const offline = isNetworkError(error);
    return (
      <StatusShell testId={offline ? 'dashboard-offline' : 'dashboard-error'}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: offline ? 'var(--text-muted)' : 'var(--danger-fg)' }}>
          {offline ? 'You appear to be offline. Check your connection.' : 'Failed to load activity. Please try again.'}
        </p>
        <RetryButton onRetry={retry} />
      </StatusShell>
    );
  }

  const nonVacant = house.rooms.filter((r) => r.status !== 'Vacant');
  const totalDue = nonVacant.reduce((s, r) => s + r.rent, 0);
  const totalCollected = house.rooms.reduce((s, r) => s + r.paid, 0);
  const outstanding = Math.max(0, totalDue - totalCollected);
  const occupiedCount = house.rooms.filter((r) => r.tenant !== null).length;
  const collectionPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
  const allClear = outstanding === 0 && totalDue > 0;

  const activity = entries.slice(0, 5).map((e) => ({
    dot: e.status === 'Paid' ? 'var(--green-500)'
      : e.status === 'Partial' ? 'var(--amber-400)'
      : 'var(--text-faint)',
    label: e.status === 'Paid' ? 'Rent received — ' + e.tenant
      : e.status === 'Partial' ? 'Partial payment — ' + e.tenant
      : 'Rent pending — ' + e.tenant,
    sub: e.houseName + ' · ' + e.roomName + ' · ' + MONTH_NAMES[e.month] + ' ' + e.year,
    amount: e.amountPaid,
  }));

  const kpiNum: CSSProperties = {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: 'var(--text-4xl)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'var(--text-heading)',
    margin: '10px 0 6px',
  };
  const kpiSub: CSSProperties = { fontSize: 'var(--text-sm)', fontWeight: 600 };

  return (
    <div className="ps-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Collected</span>
            <Icon name="trending-up" size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div className="ps-mono" style={kpiNum}>{gbp(totalCollected)}</div>
          <span style={{ ...kpiSub, color: 'var(--text-muted)' }}>{collectionPct}% of {gbp(totalDue)} due</span>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Outstanding</span>
            <Icon
              name={allClear ? 'check-circle-2' : 'alert-circle'}
              size={18}
              style={{ color: allClear ? 'var(--green-500)' : outstanding > 0 ? 'var(--amber-400)' : 'var(--text-faint)' }}
            />
          </div>
          <div className="ps-mono" style={{ ...kpiNum, color: allClear ? 'var(--success-fg)' : outstanding > 0 ? 'var(--amber-400)' : 'var(--text-heading)' }}>
            {gbp(outstanding)}
          </div>
          <span style={{ ...kpiSub, color: 'var(--text-muted)' }}>{allClear ? 'fully collected' : 'remaining to collect'}</span>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Occupancy</span>
            <Icon name="users" size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div className="ps-mono" style={kpiNum}>{occupiedCount}/{house.rooms.length}</div>
          <span style={{ ...kpiSub, color: 'var(--text-muted)' }}>rooms occupied</span>
        </Card>
      </div>

      <Card padding="0" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px var(--card-pad) 6px', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)' }}>
          Collection status
        </div>
        {house.rooms.map((r, i) => {
          const pct = r.rent > 0 ? Math.round((r.paid / r.rent) * 100) : 0;
          const vacant = r.status === 'Vacant';
          const barColor = pct === 100 ? 'var(--green-500)' : pct > 0 ? 'var(--amber-400)' : 'var(--border-strong)';
          return (
            <div
              key={r.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px var(--card-pad)', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}
            >
              <div style={{ width: 62, fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{r.unit}</div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)', color: r.tenant ? 'var(--text-body)' : 'var(--text-faint)' }}>
                {r.tenant ?? 'Vacant'}
              </div>
              {!vacant && (
                <div style={{ width: 100, height: 5, background: 'var(--surface-sunken)', borderRadius: 99, overflow: 'hidden', flex: 'none' }}>
                  <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 99, transition: 'width 0.35s' }} />
                </div>
              )}
              <div className="ps-mono" style={{ width: 110, textAlign: 'right', fontSize: 'var(--text-sm)', color: vacant ? 'var(--text-faint)' : 'var(--text-body)', flex: 'none' }}>
                {vacant ? '—' : gbp(r.paid) + ' / ' + gbp(r.rent)}
              </div>
              <div style={{ width: 68, display: 'flex', justifyContent: 'flex-end', flex: 'none' }}>
                <Badge tone={STATUS_BADGE[r.status]} size="sm">{r.status}</Badge>
              </div>
            </div>
          );
        })}
      </Card>

      {activity.length > 0 && (
        <Card padding="0">
          <div style={{ padding: '16px var(--card-pad) 6px', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)' }}>
            Recent activity
          </div>
          <div>
            {activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--card-pad)', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: a.dot, flex: 'none' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>{a.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.sub}</div>
                </div>
                {a.amount > 0 && (
                  <span className="ps-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--success-fg)' }}>
                    +{gbp(a.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
