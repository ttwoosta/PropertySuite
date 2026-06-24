import { Card, Button } from '../../ds-vendor/components';
import { di } from '../../components/ui';
import { catById, gbp } from './data';
import { KindChip, type ReceiptWithKind } from './entries';

function isNetworkError(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('unavailable') || m.includes('err_internet_disconnected') || m.includes('offline') || m.includes('network');
}

type ReceiptsProps = {
  receipts: ReceiptWithKind[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onUpload: () => void;
  onView: (r: ReceiptWithKind) => void;
};

export function Receipts({ receipts, isLoading = false, error = null, onRetry, onUpload, onView }: ReceiptsProps) {
  if (isLoading) {
    return (
      <div data-testid="receipts-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        Loading…
      </div>
    );
  }

  if (error) {
    const offline = isNetworkError(error);
    return (
      <div data-testid={offline ? 'receipts-offline' : 'receipts-error'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240, textAlign: 'center', padding: 40 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: offline ? 'var(--text-muted)' : 'var(--danger-fg)' }}>
          {offline ? 'You appear to be offline. Check your connection.' : 'Failed to load receipts. Please try again.'}
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

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>Receipts · 2026</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{receipts.length} receipts on file</div>
        </div>
        <Button variant="primary" leadingIcon={di('upload')} onClick={onUpload}>Upload receipt</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {receipts.map((rc) => {
          const c = catById[rc.cat] ?? { color: 'var(--gray-500)', icon: 'receipt', label: rc.cat };
          return (
            <Card key={rc.id} interactive padding="0" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => onView(rc)}>
              <div style={{ height: 110, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: `color-mix(in srgb, ${c.color} 9%, var(--surface-sunken))`, color: c.color }}>
                <span style={{ position: 'absolute', top: 8, right: 8 }}><KindChip kind={rc.kind} /></span>
                <span style={{ display: 'inline-flex', width: 28, height: 28 }}>{di(c.icon)}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{c.label}</span>
              </div>
              <div style={{ padding: '11px 13px' }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{rc.merchant}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{rc.date}</span>
                  <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{gbp(rc.amount)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
