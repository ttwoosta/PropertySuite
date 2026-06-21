// Rent Tracker — navigable shell with 5 views (port of rent.jsx). View-swapping,
// no routing inside the app.
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  Input,
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
import { Donut, GroupedBars, PeriodPicker, Popover } from './charts';
import {
  ACTIVITY,
  CATEGORIES,
  EXP_MONTH,
  EXP_YTD,
  GRID,
  HOUSES,
  MONTHS,
  MONTH_NAMES,
  NAV,
  RECEIPTS,
  ROOM_COLS,
  SERIES,
  catById,
  gbp,
  type GridRow,
  type House,
  type Room,
  type RoomStatus,
} from './data';

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
function Dashboard() {
  const inc = SERIES[5].income;
  const exp = SERIES[5].expense;
  const pInc = SERIES[4].income;
  const pExp = SERIES[4].expense;
  const dInc = inc - pInc;
  const dExp = exp - pExp;
  return (
    <div className="ps-fade">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}
            >
              Monthly income
            </span>
            <Icon name="trending-up" size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div
            className="ps-mono"
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-heading)',
              margin: '10px 0 6px',
            }}
          >
            {gbp(inc)}
          </div>
          <span
            style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success-fg)' }}
          >
            ▲ {gbp(dInc)} vs May
          </span>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}
            >
              Monthly expenses
            </span>
            <Icon name="trending-down" size={18} style={{ color: 'var(--amber-400)' }} />
          </div>
          <div
            className="ps-mono"
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-heading)',
              margin: '10px 0 6px',
            }}
          >
            {gbp(exp)}
          </div>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: dExp > 0 ? 'var(--danger-fg)' : 'var(--success-fg)',
            }}
          >
            {dExp > 0 ? '▲' : '▼'} {gbp(dExp)} vs May
          </span>
        </Card>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <div
            style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)' }}
          >
            Income vs expenses
          </div>
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--brand)' }} />
              Income
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--amber-400)' }}
              />
              Expenses
            </span>
          </div>
        </div>
        <GroupedBars series={SERIES} />
      </Card>

      <Card padding="0">
        <div
          style={{
            padding: '16px var(--card-pad) 6px',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--text-heading)',
          }}
        >
          Recent activity
        </div>
        <div>
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px var(--card-pad)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{ width: 9, height: 9, borderRadius: '50%', background: a.dot, flex: 'none' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 600,
                    color: 'var(--text-heading)',
                  }}
                >
                  {a.label}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {a.sub} · {a.when}
                </div>
              </div>
              <span
                className="ps-mono"
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 700,
                  color: a.amount < 0 ? 'var(--text-heading)' : 'var(--success-fg)',
                }}
              >
                {a.amount < 0 ? '−' : '+'}
                {gbp(a.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Year Grid ---------------- */
function YearGrid({ house, year, toast }: { house: House; year: number; toast: ToastFn }) {
  const cols = ROOM_COLS.filter((c) => c.house === house.name);
  const [grid, setGrid] = useState<GridRow[]>(() =>
    GRID.map((r) => ({ ...r, rent: { ...r.rent } })),
  );
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
        const num = val === '' ? null : Number(val) || 0;
        if (key.startsWith('rent.')) nr.rent[key.slice(5)] = num;
        else (nr as unknown as Record<string, number | null>)[key] = num;
        const rentTotal =
          cols.reduce((s, c) => s + (nr.rent[c.id] || 0), 0) +
          ROOM_COLS.filter((c) => c.house !== house.name).reduce(
            (s, c) => s + (nr.rent[c.id] || 0),
            0,
          );
        const e =
          (nr.tax || 0) +
          (nr.water || 0) +
          (nr.elec || 0) +
          (nr.gas || 0) +
          (nr.maint || 0) +
          (nr.loan || 0);
        nr.rentTotal = rentTotal;
        nr.net = rentTotal - e;
        return nr;
      }),
    );

  const Cell = ({
    rowIdx,
    k,
    value,
    tint,
  }: {
    rowIdx: number;
    k: string;
    value: number | null;
    tint: string;
  }) => {
    const on = edit && edit.row === rowIdx && edit.key === k;
    return (
      <td
        onClick={() => setEdit({ row: rowIdx, key: k })}
        style={{
          padding: pad,
          textAlign: 'right',
          cursor: 'pointer',
          borderBottom: '1px solid var(--border-subtle)',
          background: tint,
          fontVariantNumeric: 'tabular-nums',
          fontSize: 'var(--text-sm)',
          color: value == null ? 'var(--text-faint)' : 'var(--text-body)',
          whiteSpace: 'nowrap',
        }}
      >
        {on ? (
          <input
            autoFocus
            defaultValue={value == null ? '' : value}
            onBlur={(e) => {
              setCell(rowIdx, k, e.target.value);
              setEdit(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCell(rowIdx, k, (e.target as HTMLInputElement).value);
                setEdit(null);
              }
              if (e.key === 'Escape') setEdit(null);
            }}
            style={{
              width: 56,
              border: '1px solid var(--border-focus)',
              borderRadius: 4,
              padding: '2px 4px',
              textAlign: 'right',
              font: 'inherit',
              background: 'var(--surface-card)',
              color: 'var(--text-heading)',
              outline: 'none',
            }}
          />
        ) : value == null ? (
          '—'
        ) : (
          gbp(value)
        )}
      </td>
    );
  };
  const th: CSSProperties = {
    padding: pad,
    textAlign: 'right',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    background: 'var(--surface-card)',
  };
  const grpTh: CSSProperties = {
    ...th,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-caps)',
    fontSize: '11px',
    borderBottom: '1px solid var(--border-default)',
    color: 'var(--text-faint)',
  };

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <Segmented
          ariaLabel="Filter columns"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'expenses', label: 'Expenses' },
            { value: 'income', label: 'Income' },
          ]}
        />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Click any cell to edit · Enter to save
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Segmented
            ariaLabel="Density"
            value={dense ? 'compact' : 'comfortable'}
            onChange={(v) => setDense(v === 'compact')}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' },
            ]}
          />
          <Button size="sm" variant="secondary" leadingIcon={di('download')} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div className="ps-scroll-x" style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ ...grpTh, textAlign: 'left' }}></th>
                {showExp && (
                  <th style={grpTh} colSpan={4}>
                    Utilities &amp; Tax
                  </th>
                )}
                {showInc && (
                  <th style={{ ...grpTh, color: 'var(--success-fg)' }} colSpan={cols.length}>
                    Rent Income
                  </th>
                )}
                {showExp && (
                  <th style={grpTh} colSpan={2}>
                    Other Expenses
                  </th>
                )}
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
                  <td
                    style={{
                      padding: pad,
                      fontWeight: 600,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-heading)',
                      borderBottom: '1px solid var(--border-subtle)',
                      position: 'sticky',
                      left: 0,
                      background: 'var(--surface-card)',
                    }}
                  >
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
                  {showInc &&
                    cols.map((c) => (
                      <Cell
                        key={c.id}
                        rowIdx={i}
                        k={'rent.' + c.id}
                        value={r.rent[c.id]}
                        tint="color-mix(in srgb, var(--green-500) 5%, transparent)"
                      />
                    ))}
                  {showExp && (
                    <>
                      <Cell rowIdx={i} k="maint" value={r.maint} tint="color-mix(in srgb, var(--gray-400) 7%, transparent)" />
                      <Cell rowIdx={i} k="loan" value={r.loan} tint="color-mix(in srgb, var(--green-600) 6%, transparent)" />
                    </>
                  )}
                  <td
                    style={{
                      padding: pad,
                      textAlign: 'right',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: 'var(--text-sm)',
                      borderBottom: '1px solid var(--border-subtle)',
                      color: r.net < 0 ? 'var(--danger-fg)' : 'var(--success-fg)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.net < 0 ? '−' : ''}
                    {gbp(r.net)}
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
  onAddHouse,
}: {
  house: House;
  onAddRent: (r: Room) => void;
  onAddHouse: () => void;
}) {
  const occ = house.rooms.filter((r) => r.tenant).length;
  return (
    <div className="ps-fade">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--text-heading)',
            }}
          >
            {house.name}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {house.address}
          </div>
        </div>
        <Badge tone={occ === house.rooms.length ? 'success' : 'warning'}>
          {occ}/{house.rooms.length} occupied
        </Badge>
        <Button variant="primary" leadingIcon={di('plus')} onClick={onAddHouse}>
          Add house
        </Button>
      </div>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        {house.rooms.map((r, i) => (
          <div
            key={r.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px var(--card-pad)',
              borderTop: i ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div
              style={{
                width: 70,
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--text-heading)',
              }}
            >
              {r.unit}
            </div>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 'var(--text-base)',
                color: r.tenant ? 'var(--text-body)' : 'var(--text-faint)',
              }}
            >
              {r.tenant || 'Vacant'}
            </div>
            <div
              className="ps-mono"
              style={{
                width: 80,
                textAlign: 'right',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
              }}
            >
              {gbp(r.rent)}
            </div>
            <div
              className="ps-mono"
              style={{
                width: 80,
                textAlign: 'right',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: r.paid ? 'var(--text-heading)' : 'var(--text-faint)',
              }}
            >
              {r.paid ? gbp(r.paid) : '—'}
            </div>
            <div style={{ width: 86, display: 'flex', justifyContent: 'flex-end' }}>
              <Badge tone={STATUS_BADGE[r.status]} size="sm">
                {r.status}
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <IconButton label="Edit room" variant="ghost" size="sm">
                {di('pencil')}
              </IconButton>
              <IconButton label="Add rent" variant="ghost" size="sm" onClick={() => onAddRent(r)}>
                {di('plus-circle')}
              </IconButton>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------------- Expenses ---------------- */
function Expenses({ toast }: { toast: ToastFn }) {
  const [open, setOpen] = useState<string | null>(null);
  const total = Object.values(EXP_MONTH).reduce((a, b) => a + b, 0);
  const donutData = CATEGORIES.map((c) => ({ id: c.id, color: c.color, value: EXP_MONTH[c.id] }));
  return (
    <div className="ps-fade">
      <Card
        style={{
          display: 'flex',
          gap: 28,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <Donut data={donutData} total={total} />
        <div
          style={{
            flex: 1,
            minWidth: 220,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {CATEGORIES.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span
                style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flex: 'none' }}
              />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
                {c.label}
              </span>
              <span
                className="ps-mono"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-heading)',
                }}
              >
                {gbp(EXP_MONTH[c.id])}
              </span>
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
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px var(--card-pad)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `color-mix(in srgb, ${c.color} 14%, var(--surface-card))`,
                    color: c.color,
                    flex: 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di(c.icon)}</span>
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    fontSize: 'var(--text-base)',
                    fontWeight: 600,
                    color: 'var(--text-heading)',
                  }}
                >
                  {c.label}
                </span>
                <span
                  className="ps-mono"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                  }}
                >
                  {gbp(EXP_MONTH[c.id])}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    width: 96,
                    textAlign: 'right',
                  }}
                >
                  YTD {gbp(EXP_YTD[c.id])}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    width: 16,
                    height: 16,
                    color: 'var(--text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}
                >
                  {di('chevron-down')}
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 var(--card-pad) 12px' }}>
                  {MONTHS.slice(0, 6).map((m, mi) => (
                    <div
                      key={m}
                      onClick={() => toast('Open ' + c.label + ' · ' + m)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-sm)',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--surface-hover)')
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ width: 36, color: 'var(--text-muted)' }}>{m}</span>
                      <span className="ps-mono" style={{ flex: 1, color: 'var(--text-body)' }}>
                        {gbp(EXP_MONTH[c.id] - mi * 7)}
                      </span>
                      {mi % 2 === 0 && (
                        <Badge tone="neutral" size="sm">
                          <span
                            style={{ display: 'inline-flex', width: 12, height: 12, marginRight: 3 }}
                          >
                            {di('paperclip')}
                          </span>
                          Receipt
                        </Badge>
                      )}
                    </div>
                  ))}
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
function Receipts({ toast }: { toast: ToastFn }) {
  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}
          >
            Receipts · 2026
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {RECEIPTS.length} receipts on file
          </div>
        </div>
        <Button variant="primary" leadingIcon={di('upload')} onClick={() => toast('Upload receipt')}>
          Upload receipt
        </Button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
        }}
      >
        {RECEIPTS.map((rc) => {
          const c = catById[rc.cat];
          return (
            <Card
              key={rc.id}
              interactive
              padding="0"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => toast(rc.merchant + ' receipt')}
            >
              <div
                style={{
                  height: 110,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: `color-mix(in srgb, ${c.color} 9%, var(--surface-sunken))`,
                  color: c.color,
                }}
              >
                <span style={{ display: 'inline-flex', width: 28, height: 28 }}>{di(c.icon)}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{c.label}</span>
              </div>
              <div style={{ padding: '11px 13px' }}>
                <div
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                  }}
                >
                  {rc.merchant}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {rc.date}
                  </span>
                  <span
                    className="ps-mono"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 700,
                      color: 'var(--text-heading)',
                    }}
                  >
                    {gbp(rc.amount)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Add Rent drawer ---------------- */
function AddRentDrawer({
  room,
  onClose,
  onSave,
}: {
  room: Room | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState('');
  const [due, setDue] = useState('');
  const [recv, setRecv] = useState('');
  useEffect(() => {
    if (room) {
      setName(room.tenant || '');
      setDue(String(room.rent));
      setRecv(room.paid ? String(room.paid) : '');
    }
  }, [room]);
  return (
    <RightDrawer
      open={!!room}
      onClose={onClose}
      title={room ? 'Add rent · ' + room.unit : ''}
      subtitle="Record a rent payment"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </>
      }
    >
      {room && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Renter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tenant name"
          />
          <Input
            label="Amount due"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            leadingIcon={<span style={{ fontWeight: 700 }}>£</span>}
          />
          <Input
            label="Amount received"
            value={recv}
            onChange={(e) => setRecv(e.target.value)}
            leadingIcon={<span style={{ fontWeight: 700 }}>£</span>}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" size="sm" onClick={() => setRecv(due)}>
              Mark paid in full
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRecv('')}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </RightDrawer>
  );
}

/* ---------------- Sidebar nav row ---------------- */
function RentNav({
  n,
  active,
  onClick,
}: {
  n: { id: string; label: string; icon: string };
  active: boolean;
  onClick: (id: string) => void;
}) {
  const { close } = useDrawer();
  return (
    <NavItem
      icon={di(n.icon)}
      label={n.label}
      active={active}
      onClick={() => {
        onClick(n.id);
        close();
      }}
      style={{ margin: '0px', padding: '16px 12px' }}
    />
  );
}

/* ---------------- App ---------------- */
function RentInner() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState('home');
  const [houseId, setHouseId] = useState('maple');
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);
  const [theme, toggleTheme] = useTheme('rent');
  const [houseOpen, setHouseOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [rentRoom, setRentRoom] = useState<Room | null>(null);
  const toast = useToast();

  const house = HOUSES.find((h) => h.id === houseId)!;
  const roomCount = HOUSES.reduce((s, h) => s + h.rooms.length, 0);

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px' }}>
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
            RentTracker
          </span>
        </Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {NAV.map((n) => (
          <RentNav key={n.id} n={n} active={view === n.id} onClick={setView} />
        ))}
      </div>
      <div
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}
        >
          {HOUSES.length} houses · {roomCount} rooms
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
          <span style={{ fontWeight: 600 }}>{house.name}</span>
          <Icon name="chevron-down" size={15} style={{ color: 'var(--text-faint)' }} />
        </button>
        <Popover open={houseOpen} onClose={() => setHouseOpen(false)}>
          {HOUSES.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                setHouseId(h.id);
                setHouseOpen(false);
              }}
              style={menuItem(h.id === houseId)}
            >
              <Icon name="building-2" size={16} style={{ color: 'var(--text-muted)' }} />
              {h.name}
            </button>
          ))}
        </Popover>
      </div>
      <div style={{ position: 'relative', margin: '0 auto' }}>
        <button
          onClick={() => setPeriodOpen((o) => !o)}
          style={{ ...chipBtn, background: 'var(--surface-sunken)' }}
        >
          <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontWeight: 600 }}>
            {MONTH_NAMES[month]} {year}
          </span>
        </button>
        <Popover
          open={periodOpen}
          onClose={() => setPeriodOpen(false)}
          align="left"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <PeriodPicker
            month={month}
            year={year}
            onPick={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
            onClose={() => setPeriodOpen(false)}
          />
        </Popover>
      </div>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserOpen((o) => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Avatar name={user!.name} size="sm" />
        </button>
        <Popover open={userOpen} onClose={() => setUserOpen(false)} align="right">
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}
            >
              {user!.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {user!.email}
            </div>
          </div>
          <button
            onClick={() => {
              setUserOpen(false);
              toast('Profile');
            }}
            style={menuItem(false)}
          >
            <Icon name="user" size={16} style={{ color: 'var(--text-muted)' }} />
            Profile
          </button>
          <button onClick={() => void signOut()} style={menuItem(false)}>
            <Icon name="log-out" size={16} style={{ color: 'var(--text-muted)' }} />
            Sign out
          </button>
        </Popover>
      </div>
    </div>
  );

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar}>
      {view === 'home' && <Dashboard />}
      {view === 'grid' && <YearGrid house={house} year={year} toast={toast} />}
      {view === 'houses' && (
        <Houses house={house} onAddRent={setRentRoom} onAddHouse={() => toast('Add house wizard')} />
      )}
      {view === 'expenses' && <Expenses toast={toast} />}
      {view === 'receipts' && <Receipts toast={toast} />}

      <AddRentDrawer
        room={rentRoom}
        onClose={() => setRentRoom(null)}
        onSave={() => {
          setRentRoom(null);
          toast('Rent recorded');
        }}
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
