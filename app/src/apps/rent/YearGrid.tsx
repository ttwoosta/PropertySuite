import { useEffect, useState, type CSSProperties } from 'react';
import { Card, Button } from '../../ds-vendor/components';
import { Segmented, di } from '../../components/ui';
import { type House, type RoomCol, type GridRow, emptyGrid, gbp } from './data';
import { firebaseConfigured } from '../../lib/firebase';
import { saveGridCell, subscribeGridCells } from '../../lib/rentService';

type ToastFn = (msg: string, tone?: 'success' | 'danger') => void;

function isNetworkError(err: Error): boolean {
  const m = err.message.toLowerCase();
  return m.includes('unavailable') || m.includes('err_internet_disconnected') || m.includes('offline') || m.includes('network');
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

function Cell({
  rowIdx, k, value, tint, pad, edit, setEdit, setCell,
}: {
  rowIdx: number; k: string; value: number | null; tint: string; pad: string;
  edit: { row: number; key: string } | null;
  setEdit: (v: { row: number; key: string } | null) => void;
  setCell: (rowIdx: number, key: string, val: string) => void;
}) {
  const on = edit && edit.row === rowIdx && edit.key === k;
  return (
    <td
      onClick={() => setEdit({ row: rowIdx, key: k })}
      style={{ padding: pad, textAlign: 'right', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', background: tint, fontVariantNumeric: 'tabular-nums', fontSize: 'var(--text-sm)', color: value == null ? 'var(--text-faint)' : 'var(--text-body)', whiteSpace: 'nowrap' }}
    >
      {on ? (
        <input
          autoFocus
          defaultValue={value == null ? '' : value}
          onBlur={(e) => { setCell(rowIdx, k, e.target.value); setEdit(null); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { setCell(rowIdx, k, (e.target as HTMLInputElement).value); setEdit(null); }
            if (e.key === 'Escape') setEdit(null);
          }}
          style={{ width: 56, border: '1px solid var(--border-focus)', borderRadius: 4, padding: '2px 4px', textAlign: 'right', font: 'inherit', background: 'var(--surface-card)', color: 'var(--text-heading)', outline: 'none' }}
        />
      ) : value == null ? '—' : gbp(value)}
    </td>
  );
}

export function YearGrid({ house, year, toast, uid }: { house: House; year: number; toast: ToastFn; uid: string | null }) {
  const cols: RoomCol[] = house.rooms.map((r) => ({ id: r.id, label: r.unit, house: house.name }));
  const [grid, setGrid] = useState<GridRow[]>(() => emptyGrid(cols));
  const [edit, setEdit] = useState<{ row: number; key: string } | null>(null);
  const [filter, setFilter] = useState('all');
  const [dense, setDense] = useState(false);

  const [loadingCells, setLoadingCells] = useState(() => !!(firebaseConfigured && uid));
  const [gridError, setGridError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const pad = dense ? '5px 9px' : '9px 12px';
  const showExp = filter !== 'income';
  const showInc = filter !== 'expenses';

  useEffect(() => {
    if (!firebaseConfigured || !uid) { setLoadingCells(false); return; }
    setLoadingCells(true);
    setGridError(null);
    return subscribeGridCells(uid, house.id, year, (cells) => {
      setGrid((g) => {
        const next = g.map((r) => ({ ...r, rent: { ...r.rent } }));
        for (const c of cells) {
          const r = next[c.monthIdx];
          if (!r) continue;
          if (c.field.startsWith('rent.')) r.rent[c.field.slice(5)] = c.value;
          else (r as unknown as Record<string, number | null>)[c.field] = c.value;
        }
        for (const r of next) {
          r.rentTotal = cols.reduce((s, c) => s + (r.rent[c.id] || 0), 0);
          const e = (r.tax || 0) + (r.water || 0) + (r.elec || 0) + (r.gas || 0) + (r.maint || 0) + (r.loan || 0);
          r.net = r.rentTotal - e;
        }
        return next;
      });
      setLoadingCells(false);
    }, (err) => {
      setGridError(err);
      setLoadingCells(false);
    });
  }, [uid, house.id, year, retryCount]);

  const setCell = (rowIdx: number, key: string, val: string) => {
    const n = val === '' ? null : Number(val) || 0;
    setGrid((g) =>
      g.map((r, i) => {
        if (i !== rowIdx) return r;
        const nr: GridRow = { ...r, rent: { ...r.rent } };
        if (key.startsWith('rent.')) nr.rent[key.slice(5)] = n;
        else (nr as unknown as Record<string, number | null>)[key] = n;
        const rentTotal = cols.reduce((s, c) => s + (nr.rent[c.id] || 0), 0);
        const e = (nr.tax || 0) + (nr.water || 0) + (nr.elec || 0) + (nr.gas || 0) + (nr.maint || 0) + (nr.loan || 0);
        nr.rentTotal = rentTotal;
        nr.net = rentTotal - e;
        return nr;
      }),
    );
    if (firebaseConfigured && uid && n !== null) {
      saveGridCell(uid, { houseId: house.id, year, monthIdx: rowIdx, field: key, value: n }).catch(console.error);
    }
  };

  if (loadingCells) {
    return (
      <div data-testid="yeargrid-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
        Loading…
      </div>
    );
  }

  if (gridError) {
    const offline = isNetworkError(gridError);
    return (
      <div data-testid={offline ? 'yeargrid-offline' : 'yeargrid-error'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240, textAlign: 'center', padding: 40 }}>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: offline ? 'var(--text-muted)' : 'var(--danger-fg)' }}>
          {offline ? 'You appear to be offline. Check your connection.' : 'Failed to load grid data. Please try again.'}
        </p>
        <RetryButton onRetry={() => setRetryCount((c) => c + 1)} />
      </div>
    );
  }

  const cp = { pad, edit, setEdit, setCell };

  const th: CSSProperties = { padding: pad, textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', position: 'sticky', top: 0, background: 'var(--surface-card)' };
  const grpTh: CSSProperties = { ...th, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', fontSize: '11px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-faint)' };

  const exportCsv = () => {
    const head = ['Month', 'Tax', 'Water', 'Elec', 'Gas', ...cols.map((c) => c.label), 'Maintenance', 'Loan', 'Net'];
    const rows = grid.map((r) =>
      [r.month, r.tax, r.water, r.elec, r.gas, ...cols.map((c) => r.rent[c.id]), r.maint, r.loan, r.net]
        .map((v) => (v == null ? '' : v))
        .join(','),
    );
    const csv = [head.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = house.name.replace(/\s/g, '-') + '-' + year + '.csv';
    a.click();
    toast('Exported ' + year + ' CSV');
  };

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <Segmented ariaLabel="Filter columns" value={filter} onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'expenses', label: 'Expenses' }, { value: 'income', label: 'Income' }]} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Click any cell to edit · Enter to save</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Segmented ariaLabel="Density" value={dense ? 'compact' : 'comfortable'} onChange={(v) => setDense(v === 'compact')}
            options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} />
          <Button size="sm" variant="secondary" leadingIcon={di('download')} onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div className="ps-scroll-x" style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ ...grpTh, textAlign: 'left' }}></th>
                {showExp && <th style={grpTh} colSpan={4}>Utilities &amp; Tax</th>}
                {showInc && <th style={{ ...grpTh, color: 'var(--success-fg)' }} colSpan={cols.length}>Rent Income</th>}
                {showExp && <th style={grpTh} colSpan={2}>Other Expenses</th>}
                <th style={grpTh}>Net</th>
              </tr>
              <tr>
                <th style={{ ...th, textAlign: 'left' }}>Month</th>
                {showExp && ['Tax', 'Water', 'Elec', 'Gas'].map((h) => <th key={h} style={th}>{h}</th>)}
                {showInc && cols.map((c) => <th key={c.id} style={th}>{c.label}</th>)}
                {showExp && ['Maint.', 'Loan'].map((h) => <th key={h} style={th}>{h}</th>)}
                <th style={th}>Net</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((r, i) => (
                <tr key={r.month}>
                  <td style={{ padding: pad, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-heading)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', left: 0, background: 'var(--surface-card)' }}>
                    {r.month}
                  </td>
                  {showExp && (
                    <>
                      <Cell {...cp} rowIdx={i} k="tax" value={r.tax} tint="color-mix(in srgb, var(--blue-400) 6%, transparent)" />
                      <Cell {...cp} rowIdx={i} k="water" value={r.water} tint="color-mix(in srgb, var(--green-400) 6%, transparent)" />
                      <Cell {...cp} rowIdx={i} k="elec" value={r.elec} tint="color-mix(in srgb, var(--amber-400) 7%, transparent)" />
                      <Cell {...cp} rowIdx={i} k="gas" value={r.gas} tint="color-mix(in srgb, var(--red-400) 6%, transparent)" />
                    </>
                  )}
                  {showInc && cols.map((c) => (
                    <Cell {...cp} key={c.id} rowIdx={i} k={'rent.' + c.id} value={r.rent[c.id]} tint="color-mix(in srgb, var(--green-500) 5%, transparent)" />
                  ))}
                  {showExp && (
                    <>
                      <Cell {...cp} rowIdx={i} k="maint" value={r.maint} tint="color-mix(in srgb, var(--gray-400) 7%, transparent)" />
                      <Cell {...cp} rowIdx={i} k="loan" value={r.loan} tint="color-mix(in srgb, var(--green-600) 6%, transparent)" />
                    </>
                  )}
                  <td style={{ padding: pad, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--border-subtle)', color: r.net < 0 ? 'var(--danger-fg)' : 'var(--success-fg)', whiteSpace: 'nowrap' }}>
                    {r.net < 0 ? '−' : ''}{gbp(r.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
