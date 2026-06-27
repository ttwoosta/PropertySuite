import { Card, Badge, Button, IconButton } from '../../ds-vendor/components';
import { di } from '../../components/ui';
import { type House, type Room, type RoomStatus, gbp } from './data';

const STATUS_BADGE: Record<RoomStatus, 'success' | 'warning' | 'neutral'> = {
  Occupied: 'neutral',
  Paid: 'success',
  Partial: 'warning',
  Pending: 'neutral',
  Vacant: 'neutral',
};

function isNetworkError(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('unavailable') || m.includes('err_internet_disconnected') || m.includes('offline') || m.includes('network');
}

type HousesProps = {
  house: House | undefined;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAddRent: (r: Room) => void;
  onEditRoom: (r: Room) => void;
  onAddHouse: () => void;
};

export function Houses({ house, isLoading = false, error = null, onRetry, onAddRent, onEditRoom, onAddHouse }: HousesProps) {
  if (isLoading || !house) {
    return (
      <div data-testid="houses-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        Loading…
      </div>
    );
  }

  if (error) {
    const offline = isNetworkError(error);
    return (
      <div data-testid={offline ? 'houses-offline' : 'houses-error'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240, textAlign: 'center', padding: 40 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: offline ? 'var(--text-muted)' : 'var(--danger-fg)' }}>
          {offline ? 'You appear to be offline. Check your connection.' : 'Failed to load houses. Please try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            aria-label="Retry"
            style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const occ = house.rooms.filter((r) => r.tenant).length;
  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>{house.name}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{house.address}</div>
        </div>
        <Badge tone={occ === house.rooms.length ? 'success' : 'warning'}>{occ}/{house.rooms.length} occupied</Badge>
        <Button variant="primary" leadingIcon={di('plus')} onClick={onAddHouse}>Add house</Button>
      </div>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        {house.rooms.map((r, i) => (
          <div
            key={r.id}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px var(--card-pad)', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}
          >
            <div style={{ width: 70, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{r.unit}</div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-base)', color: r.tenant ? 'var(--text-body)' : 'var(--text-faint)' }}>
              {r.tenant || 'Vacant'}
            </div>
            <div className="ps-mono" style={{ width: 80, textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              {gbp(r.rent)}
            </div>
            <button
              onClick={() => onAddRent(r)}
              title="Record rent"
              className="ps-mono"
              style={{ width: 86, textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px 6px', borderRadius: 'var(--radius-sm)', color: r.paid ? 'var(--text-heading)' : 'var(--text-faint)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {r.paid ? gbp(r.paid) : 'Add +'}
            </button>
            <div style={{ width: 86, display: 'flex', justifyContent: 'flex-end' }}>
              <Badge tone={STATUS_BADGE[r.status]} size="sm">{r.status}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <IconButton label="Edit room" variant="ghost" size="sm" onClick={() => onEditRoom(r)}>{di('pencil')}</IconButton>
              <IconButton label="Add rent" variant="ghost" size="sm" onClick={() => onAddRent(r)}>{di('plus-circle')}</IconButton>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
