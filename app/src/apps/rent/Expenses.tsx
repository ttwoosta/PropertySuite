import { useState } from 'react';
import { Card, Button, IconButton } from '../../ds-vendor/components';
import { di } from '../../components/ui';
import { CATEGORIES, MONTHS, gbp } from './data';
import { Donut } from './charts';
import { KindChip, type EntryCtx, type ReceiptWithKind } from './entries';

function isNetworkError(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('unavailable') || m.includes('err_internet_disconnected') || m.includes('offline') || m.includes('network');
}

type ExpensesProps = {
  houseId: string;
  year: number;
  links: Record<string, string>;
  receipts: ReceiptWithKind[];
  vals: Record<string, number>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAddEntry: (category: string) => void;
  onEditEntry: (init: EntryCtx) => void;
  onAttach: (entryId: string, label: string) => void;
  onView: (receipt: ReceiptWithKind, entryId: string) => void;
};

export function Expenses({
  houseId, year, links, receipts, vals,
  isLoading = false, error = null, onRetry,
  onAddEntry, onEditEntry, onAttach, onView,
}: ExpensesProps) {
  const [open, setOpen] = useState<string | null>('maint');

  if (isLoading) {
    return (
      <div data-testid="expenses-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        Loading…
      </div>
    );
  }

  if (error) {
    const offline = isNetworkError(error);
    return (
      <div data-testid={offline ? 'expenses-offline' : 'expenses-error'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240, textAlign: 'center', padding: 40 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: offline ? 'var(--text-muted)' : 'var(--danger-fg)' }}>
          {offline ? 'You appear to be offline. Check your connection.' : 'Failed to load expenses. Please try again.'}
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

  const catTotal = (cid: string) => MONTHS.reduce((s, _, mi) => s + (vals[cid + '-' + mi] ?? 0), 0);
  const total = CATEGORIES.reduce((s, c) => s + catTotal(c.id), 0);
  const donutData = CATEGORIES.map((c) => ({ id: c.id, color: c.color, value: catTotal(c.id) }));
  const rcById = Object.fromEntries(receipts.map((r) => [r.id, r]));
  const amtOf = (cid: string, mi: number): number | null =>
    vals[cid + '-' + mi] != null ? vals[cid + '-' + mi] : null;

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>Expenses · {year}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Tap a month to edit or attach a receipt</div>
        </div>
        <Button variant="primary" leadingIcon={di('plus')} onClick={() => onAddEntry(open ?? 'maint')}>Add entry</Button>
      </div>
      <Card style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <Donut data={donutData} total={total} />
        <div style={{ flex: 1, minWidth: 220, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {CATEGORIES.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flex: 'none' }} />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{c.label}</span>
              <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>{gbp(catTotal(c.id))}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        {CATEGORIES.map((c, i) => {
          const isOpen = open === c.id;
          const ytd = catTotal(c.id);
          return (
            <div key={c.id} style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <button
                onClick={() => setOpen((o) => (o === c.id ? null : c.id))}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px var(--card-pad)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${c.color} 14%, var(--surface-card))`, color: c.color, flex: 'none' }}>
                  <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di(c.icon)}</span>
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>{c.label}</span>
                <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{ytd > 0 ? gbp(ytd) : '—'}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 96, textAlign: 'right' }}>YTD</span>
                <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none' }}>{di('chevron-down')}</span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 var(--card-pad) 12px' }}>
                  {MONTHS.map((m, mi) => {
                    const id = c.id + '-' + mi;
                    const amt = amtOf(c.id, mi);
                    const rc = rcById[links[id]];
                    return (
                      <div
                        key={m}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ width: 36, color: 'var(--text-muted)' }}>{m}</span>
                        <span className="ps-mono" style={{ flex: 1, color: amt != null ? 'var(--text-body)' : 'var(--text-faint)' }}>
                          {amt != null ? gbp(amt) : '—'}
                        </span>
                        {rc ? (
                          <button
                            onClick={() => onView(rc, id)}
                            title="View receipt"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', cursor: 'pointer', borderRadius: 999, border: '1px solid var(--border-default)', background: 'var(--white)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-body)' }}
                          >
                            <KindChip kind={rc.kind} />Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => onAttach(id, c.label + ' · ' + m)}
                            title="Attach receipt"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', cursor: 'pointer', borderRadius: 999, border: '1px dashed var(--border-strong)', background: 'transparent', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}
                          >
                            <span style={{ display: 'inline-flex', width: 12, height: 12 }}>{di('paperclip')}</span>Attach
                          </button>
                        )}
                        <IconButton
                          label="Edit entry"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditEntry({ mode: amt != null ? 'edit' : 'add', category: c.id, houseId, month: mi, amount: amt ?? undefined })}
                        >
                          {di('pencil')}
                        </IconButton>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
