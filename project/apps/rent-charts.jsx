/* Rent Tracker — navigable shell with 5 views. View-swapping (no routing). */
const { useState, useEffect, useRef, useMemo } = React;
const RDS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button, IconButton, Badge, Avatar, Card, Input, Select } = RDS;
const R = window.RENT;

const gbp = (n) => '£' + Math.round(Math.abs(n)).toLocaleString('en-GB');
const NAV = [
  { id: 'home', label: 'Home', icon: 'layout-dashboard' },
  { id: 'grid', label: 'Grid', icon: 'table-2' },
  { id: 'houses', label: 'Houses', icon: 'building-2' },
  { id: 'expenses', label: 'Expenses', icon: 'receipt-text' },
  { id: 'receipts', label: 'Receipts', icon: 'image' },
];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const catById = Object.fromEntries(R.CATEGORIES.map(c => [c.id, c]));

/* ---------- popover ---------- */
function Popover({ open, onClose, children, align = 'left', style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', h));
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="ps-fade" style={{ position: 'absolute', top: 'calc(100% + 8px)', [align]: 0, zIndex: 100,
      background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)', minWidth: 200, overflow: 'hidden', ...style }}>{children}</div>
  );
}

/* ---------- period drum picker ---------- */
function PeriodPicker({ month, year, onPick, onClose }) {
  const years = [2024, 2025, 2026, 2027];
  const Col = ({ items, val, fmt, set }) => (
    <div className="ps-scroll-x" style={{ maxHeight: 220, overflowY: 'auto', flex: 1, padding: 4 }}>
      {items.map(it => {
        const on = it === val;
        return (
          <button key={it} onClick={() => set(it)} style={{ display: 'block', width: '100%', padding: '9px 12px',
            border: 'none', cursor: 'pointer', textAlign: 'center', borderRadius: 'var(--radius-sm)',
            background: on ? 'var(--brand-tint)' : 'transparent', color: on ? 'var(--brand-on-tint)' : 'var(--text-body)',
            fontSize: 'var(--text-sm)', fontWeight: on ? 700 : 500 }}>{fmt ? fmt(it) : it}</button>
        );
      })}
    </div>
  );
  return (
    <div style={{ width: 280 }}>
      <div style={{ display: 'flex', gap: 4, padding: 6 }}>
        <Col items={MONTH_NAMES.map((_, i) => i)} val={month} fmt={i => MONTH_NAMES[i]} set={m => onPick(m, year)} />
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <Col items={years} val={year} set={y => onPick(month, y)} />
      </div>
      <div style={{ padding: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="sm" variant="primary" onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

/* ---------- charts ---------- */
function GroupedBars({ series }) {
  const max = Math.max(...series.flatMap(s => [s.income, s.expense]));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 200, padding: '8px 0' }}>
      {series.map(s => (
        <div key={s.m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 170, width: '100%', justifyContent: 'center' }}>
            <div title={'Income ' + gbp(s.income)} style={{ width: '38%', maxWidth: 22, height: (s.income / max * 100) + '%',
              background: 'var(--brand)', borderRadius: '4px 4px 0 0' }} />
            <div title={'Expenses ' + gbp(s.expense)} style={{ width: '38%', maxWidth: 22, height: (s.expense / max * 100) + '%',
              background: 'var(--amber-400)', borderRadius: '4px 4px 0 0' }} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{s.m}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ data, total }) {
  const C = 2 * Math.PI * 52;
  let off = 0;
  return (
    <div style={{ position: 'relative', width: 168, height: 168, flex: 'none' }}>
      <svg width="168" height="168" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        {data.map(d => {
          const frac = d.value / total;
          const seg = (
            <circle key={d.id} cx="70" cy="70" r="52" fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-off} />
          );
          off += frac * C; return seg;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>June total</span>
        <span className="ps-mono" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-heading)' }}>{gbp(total)}</span>
      </div>
    </div>
  );
}

Object.assign(window, { Popover, PeriodPicker, GroupedBars, Donut, gbp, catById, NAV, MONTH_NAMES });
