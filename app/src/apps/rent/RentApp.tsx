// Rent Tracker — navigable shell with 5 views (port of rent.jsx).
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  NavItem,
} from '../../ds-vendor/components';
import {
  Hamburger,
  Icon,
  ResponsiveShell,
  RightDrawer,
  Segmented,
  ThemeToggle,
  ToastHost,
  di,
  useDrawer,
  useTheme,
  useToast,
} from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { rememberApp } from '../../lib/nav';
import { Donut, PeriodPicker, Popover } from './charts';
import {
  CATEGORIES,
  EXP_MONTH,
  EXP_YTD,
  MONTHS,
  MONTH_NAMES,
  NAV,
  catById,
  emptyGrid,
  gbp,
  gridRow,
  useHouses,
  useReceipts,
  useRentEntries,
  type GridRow,
  type House,
  type RoomCol,
  type Room,
  type RoomStatus,
} from './data';
import { firebaseConfigured } from '../../lib/firebase';
import { addHouse as addHouseFS, saveRoom, addReceipt, addRentEntry } from '../../lib/rentService';
import { AddHouseDrawer, EditRoomDrawer, AddRentDrawer, type AddRentCtx } from './forms';
import {
  EntryWizard,
  UploadReceiptDrawer,
  ReceiptPickerDialog,
  ReceiptViewerDialog,
  KindChip,
  type EntryCtx,
  type EntrySubmit,
  type PickerCtx,
  type ReceiptWithKind,
  type UploadedReceipt,
  type ViewerCtx,
} from './entries';

const STATUS_BADGE: Record<RoomStatus, 'success' | 'warning' | 'neutral'> = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'neutral',
  Vacant: 'neutral',
};

const chipBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  padding: '7px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border-default)',
  background: 'var(--surface-card)',
  cursor: 'pointer',
  fontSize: 'var(--text-sm)',
  color: 'var(--text-body)',
};
const menuItem = (on: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  background: on ? 'var(--surface-active-nav)' : 'transparent',
  color: on ? 'var(--brand-on-tint)' : 'var(--text-body)',
  fontSize: 'var(--text-sm)',
  fontWeight: on ? 600 : 500,
});

type ToastFn = (msg: string, tone?: 'success' | 'danger') => void;


/* ---------------- Dashboard ---------------- */
function Dashboard({ house }: { house: House }) {
  const nonVacant = house.rooms.filter((r) => r.status !== 'Vacant');
  const totalDue = nonVacant.reduce((s, r) => s + r.rent, 0);
  const totalCollected = house.rooms.reduce((s, r) => s + r.paid, 0);
  const outstanding = Math.max(0, totalDue - totalCollected);
  const occupiedCount = house.rooms.filter((r) => r.tenant !== null).length;
  const collectionPct = totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;
  const allClear = outstanding === 0 && totalDue > 0;

  const { entries } = useRentEntries(house.id);
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
      {/* KPI row */}
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

      {/* Per-room collection progress */}
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

      {/* Activity feed derived from room statuses */}
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

/* ---------------- Year Grid ---------------- */
function YearGrid({ house, year, toast }: { house: House; year: number; toast: ToastFn }) {
  const cols: RoomCol[] = house.rooms.map((r) => ({ id: r.id, label: r.unit, house: house.name }));
  const [grid, setGrid] = useState<GridRow[]>(() => emptyGrid(cols));
  const [edit, setEdit] = useState<{ row: number; key: string } | null>(null);
  const [filter, setFilter] = useState('all');
  const [dense, setDense] = useState(false);
  const pad = dense ? '5px 9px' : '9px 12px';
  const showExp = filter !== 'income';
  const showInc = filter !== 'expenses';

  const setCell = (rowIdx: number, key: string, val: string) =>
    setGrid((g) =>
      g.map((r, i) => {
        if (i !== rowIdx) return r;
        const nr: GridRow = { ...r, rent: { ...r.rent } };
        const n = val === '' ? null : Number(val) || 0;
        if (key.startsWith('rent.')) nr.rent[key.slice(5)] = n;
        else (nr as unknown as Record<string, number | null>)[key] = n;
        const rentTotal = cols.reduce((s, c) => s + (nr.rent[c.id] || 0), 0);
        const e = (nr.tax || 0) + (nr.water || 0) + (nr.elec || 0) + (nr.gas || 0) + (nr.maint || 0) + (nr.loan || 0);
        nr.rentTotal = rentTotal;
        nr.net = rentTotal - e;
        return nr;
      }),
    );

  const Cell = ({ rowIdx, k, value, tint }: { rowIdx: number; k: string; value: number | null; tint: string }) => {
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
  };
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
                      <Cell rowIdx={i} k="tax" value={r.tax} tint="color-mix(in srgb, var(--blue-400) 6%, transparent)" />
                      <Cell rowIdx={i} k="water" value={r.water} tint="color-mix(in srgb, var(--green-400) 6%, transparent)" />
                      <Cell rowIdx={i} k="elec" value={r.elec} tint="color-mix(in srgb, var(--amber-400) 7%, transparent)" />
                      <Cell rowIdx={i} k="gas" value={r.gas} tint="color-mix(in srgb, var(--red-400) 6%, transparent)" />
                    </>
                  )}
                  {showInc && cols.map((c) => (
                    <Cell key={c.id} rowIdx={i} k={'rent.' + c.id} value={r.rent[c.id]} tint="color-mix(in srgb, var(--green-500) 5%, transparent)" />
                  ))}
                  {showExp && (
                    <>
                      <Cell rowIdx={i} k="maint" value={r.maint} tint="color-mix(in srgb, var(--gray-400) 7%, transparent)" />
                      <Cell rowIdx={i} k="loan" value={r.loan} tint="color-mix(in srgb, var(--green-600) 6%, transparent)" />
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

/* ---------------- Houses ---------------- */
function Houses({
  house,
  onAddRent,
  onEditRoom,
  onAddHouse,
}: {
  house: House;
  onAddRent: (r: Room) => void;
  onEditRoom: (r: Room) => void;
  onAddHouse: () => void;
}) {
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

/* ---------------- Expenses ---------------- */
function Expenses({
  houseId,
  links,
  receipts,
  vals,
  onAddEntry,
  onEditEntry,
  onAttach,
  onView,
}: {
  houseId: string;
  links: Record<string, string>;
  receipts: ReceiptWithKind[];
  vals: Record<string, number>;
  onAddEntry: (category: string) => void;
  onEditEntry: (init: EntryCtx) => void;
  onAttach: (entryId: string, label: string) => void;
  onView: (receipt: ReceiptWithKind, entryId: string) => void;
}) {
  const [open, setOpen] = useState<string | null>('maint');
  const total = Object.values(EXP_MONTH).reduce((a, b) => a + b, 0);
  const donutData = CATEGORIES.map((c) => ({ id: c.id, color: c.color, value: EXP_MONTH[c.id] }));
  const rcById = Object.fromEntries(receipts.map((r) => [r.id, r]));
  const amtOf = (cid: string, mi: number) =>
    vals[cid + '-' + mi] != null ? vals[cid + '-' + mi] : Math.max(40, EXP_MONTH[cid] - mi * 7);

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>Expenses · 2026</div>
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
              <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>{gbp(EXP_MONTH[c.id])}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        {CATEGORIES.map((c, i) => {
          const isOpen = open === c.id;
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
                <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{gbp(EXP_MONTH[c.id])}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 96, textAlign: 'right' }}>YTD {gbp(EXP_YTD[c.id])}</span>
                <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none' }}>{di('chevron-down')}</span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 var(--card-pad) 12px' }}>
                  {MONTHS.slice(0, 6).map((m, mi) => {
                    const id = c.id + '-' + mi;
                    const rc = rcById[links[id]];
                    return (
                      <div
                        key={m}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ width: 36, color: 'var(--text-muted)' }}>{m}</span>
                        <span className="ps-mono" style={{ flex: 1, color: 'var(--text-body)' }}>{gbp(amtOf(c.id, mi))}</span>
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
                          onClick={() => onEditEntry({ mode: 'edit', category: c.id, houseId, month: mi, amount: amtOf(c.id, mi) })}
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

/* ---------------- Receipts ---------------- */
function Receipts({
  receipts,
  onUpload,
  onView,
}: {
  receipts: ReceiptWithKind[];
  onUpload: () => void;
  onView: (r: ReceiptWithKind) => void;
}) {
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

/* ---------------- Sidebar nav row ---------------- */
function RentNav({ n, active, onClick }: { n: { id: string; label: string; icon: string }; active: boolean; onClick: (id: string) => void }) {
  const { close } = useDrawer();
  return (
    <NavItem
      icon={di(n.icon)}
      label={n.label}
      active={active}
      onClick={() => { onClick(n.id); close(); }}
      style={{ margin: '0px', padding: '16px 12px' }}
    />
  );
}

/* ---------------- App inner (has toast context) ---------------- */
function RentInner() {
  const { user } = useAuth();
  const [view, setView] = useState('home');
  const [houseId, setHouseId] = useState('maple');
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);
  const [theme, toggleTheme] = useTheme('rent');
  const [houseOpen, setHouseOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const toast = useToast();

  // Firestore-backed domain state (falls back to seed data in demo mode)
  const { houses, setHouses, loading: housesLoading } = useHouses();
  const { receipts, setReceipts } = useReceipts();
  const [links, setLinks] = useState<Record<string, string>>({});
  const [vals, setVals] = useState<Record<string, number>>({});

  // dialog controllers
  const [addHouse, setAddHouse] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [addRent, setAddRent] = useState<AddRentCtx | null>(null);
  const [entry, setEntry] = useState<EntryCtx | null>(null);
  const [upload, setUpload] = useState(false);
  const [picker, setPicker] = useState<PickerCtx | null>(null);
  const [viewer, setViewer] = useState<ViewerCtx | null>(null);


  useEffect(() => {
    if (!housesLoading && houses.length === 0) setAddHouse(true);
  }, [housesLoading]);

  useEffect(() => {
    if (houses.length > 0 && !houses.find((h) => h.id === houseId)) {
      setHouseId(houses[0].id);
    }
  }, [houses, houseId]);

  const house = houses.find((h) => h.id === houseId) ?? houses[0];
  const roomCount = houses.reduce((s, h) => s + h.rooms.length, 0);
  const period = MONTH_NAMES[month] + ' ' + year;
  const linkedIds = Object.values(links);
  const unlinked = receipts.filter((r) => !linkedIds.includes(r.id));

  const updateRoom = async (room: Room) => {
    const targetHouse = houses.find((h) => h.id === houseId);
    if (!targetHouse) {
      console.error('House not found for room update:', houseId);
      return;
    }
    const updatedRooms = targetHouse.rooms.map((r) => (r.id === room.id ? room : r));
    if (firebaseConfigured && user) {
      await saveRoom(user.uid, houseId, updatedRooms);
    } else {
      setHouses((hs) =>
        hs.map((h) => (h.id !== houseId ? h : { ...h, rooms: updatedRooms })),
      );
    }
  };

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px' }}>
        <Link to="/" title="Back to launcher" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/assets/logo-mark.svg" width={30} height={30} alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>
            Rent Tracker
          </span>
        </Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {NAV.map((n) => <RentNav key={n.id} n={n} active={view === n.id} onClick={setView} />)}
      </div>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
          {houses.length} houses · {roomCount} rooms
        </span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} size="sm" />
      </div>
    </div>
  );

  const topBar = (
    <div className="ps-topbar" style={{ gap: 10 }}>
      <Hamburger />
      <div style={{ position: 'relative' }}>
        <button onClick={() => setHouseOpen((o) => !o)} style={chipBtn}>
          <Icon name="house" size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>{house?.name}</span>
          <Icon name="chevron-down" size={15} style={{ color: 'var(--text-faint)' }} />
        </button>
        <Popover open={houseOpen} onClose={() => setHouseOpen(false)}>
          {houses.map((h) => (
            <button key={h.id} onClick={() => { setHouseId(h.id); setHouseOpen(false); }} style={menuItem(h.id === houseId)}>
              <Icon name="building-2" size={16} style={{ color: 'var(--text-muted)' }} />{h.name}
            </button>
          ))}
        </Popover>
      </div>
      <div style={{ position: 'relative', margin: '0 auto' }}>
        <button onClick={() => setPeriodOpen((o) => !o)} style={{ ...chipBtn, background: 'var(--surface-sunken)' }}>
          <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</span>
        </button>
        <Popover open={periodOpen} onClose={() => setPeriodOpen(false)} align="left" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <PeriodPicker month={month} year={year} onPick={(m, y) => { setMonth(m); setYear(y); }} onClose={() => setPeriodOpen(false)} />
        </Popover>
      </div>
      <Link
        to="/profile"
        title="Profile"
        aria-label="Profile"
        onClick={() => rememberApp('/rent', 'Rent Tracker')}
        style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}
      >
        <Avatar name={user!.name} size="md" />
      </Link>
    </div>
  );

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}>
      {view === 'home' && house && <Dashboard house={house} />}
      {view === 'grid' && house && <YearGrid key={house.id} house={house} year={year} toast={toast} />}
      {view === 'houses' && house && (
        <Houses
          house={house}
          onAddHouse={() => setAddHouse(true)}
          onEditRoom={setEditRoom}
          onAddRent={(room) => setAddRent({ room, houseId, houseName: house.name, period, month, year })}
        />
      )}
      {view === 'expenses' && (
        <Expenses
          houseId={houseId}
          links={links}
          receipts={receipts}
          vals={vals}
          onAddEntry={(category) => setEntry({ mode: 'add', category, houseId })}
          onEditEntry={(init) => setEntry(init)}
          onAttach={(entryId, label) => setPicker({ entryId, label })}
          onView={(receipt, entryId) => setViewer({ receipt, entryId })}
        />
      )}
      {view === 'receipts' && (
        <Receipts receipts={receipts} onUpload={() => setUpload(true)} onView={(receipt) => setViewer({ receipt })} />
      )}

      {/* 1 · Add house */}
      <AddHouseDrawer
        open={addHouse}
        onClose={() => setAddHouse(false)}
        _saveHouse={async (p) => {
          const tempId = 'h' + Math.random().toString(36).slice(2, 6);
          const rooms: Room[] = Array.from({ length: p.rooms }, (_, k) => ({
            id: tempId + 'r' + k,
            unit: 'Room ' + (k + 1),
            tenant: null,
            rent: p.rent,
            paid: 0,
            status: 'Vacant' as RoomStatus,
            beds: 1,
          }));
          const newHouse: Omit<House, 'id'> = {
            name: p.address.split(',')[0],
            address: p.address,
            rooms,
          };
          if (firebaseConfigured && user) {
            const id = await addHouseFS(user.uid, newHouse);
            setHouseId(id);
          } else {
            setHouses((hs) => [...hs, { ...newHouse, id: tempId }]);
            setHouseId(tempId);
          }
          toast('House added · ' + p.rooms + ' rooms');
        }}
      />

      {/* 2 · Edit room */}
      <EditRoomDrawer
        room={editRoom}
        houseName={house?.name ?? ''}
        onClose={() => setEditRoom(null)}
        _saveRoom={async (room) => { await updateRoom(room); toast('Room saved'); }}
      />

      {/* 3 · Add rent */}
      <AddRentDrawer
        ctx={addRent}
        onClose={() => setAddRent(null)}
        _saveRentEntry={async (room) => {
          await updateRoom(room);
          if (user && addRent && firebaseConfigured) {
            await addRentEntry(user.uid, {
              houseId: addRent.houseId,
              roomId: room.id,
              houseName: addRent.houseName,
              roomName: room.unit,
              tenant: room.tenant ?? '',
              month: addRent.month,
              year: addRent.year,
              amountDue: room.rent,
              amountPaid: room.paid,
              status: room.status,
            });
          }
          toast('Rent recorded');
        }}
      />

      {/* 4 · Add / edit entry */}
      <EntryWizard
        ctx={entry}
        houses={houses}
        year={year}
        onClose={() => setEntry(null)}
        onSubmit={(p: EntrySubmit) => {
          if (p.category && p.month != null) setVals((v) => ({ ...v, [p.category + '-' + p.month]: p.value }));
          setEntry(null);
          toast(p.mode === 'edit' ? 'Entry updated' : 'Entry added');
        }}
      />

      {/* 5 · Upload receipt */}
      <UploadReceiptDrawer
        open={upload}
        houses={houses}
        onClose={() => setUpload(false)}
        onUpload={async (rc: UploadedReceipt) => {
          if (firebaseConfigured && user) {
            await addReceipt(user.uid, rc);
          } else {
            setReceipts((rs) => [{ ...rc }, ...rs]);
          }
          setUpload(false);
          toast('Receipt uploaded');
        }}
      />

      {/* 6 · Receipt picker */}
      <ReceiptPickerDialog
        ctx={picker}
        receipts={unlinked}
        onClose={() => setPicker(null)}
        onPick={(rc) => { setLinks((l) => ({ ...l, [picker!.entryId]: rc.id })); setPicker(null); toast('Receipt attached'); }}
        onUpload={() => { setPicker(null); setUpload(true); }}
      />

      {/* 7 · Receipt viewer */}
      <ReceiptViewerDialog
        ctx={viewer}
        onClose={() => setViewer(null)}
        onUnlink={(c) => { setLinks((l) => { const n = { ...l }; delete n[c.entryId!]; return n; }); setViewer(null); toast('Receipt unlinked'); }}
      />
    </ResponsiveShell>
  );
}

export function RentApp() {
  return (
    <ToastHost>
      <RentInner />
    </ToastHost>
  );
}
