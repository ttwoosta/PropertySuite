/* Rent Tracker — main-content view components (Dashboard, Year grid, Houses, Expenses, Receipts).
   Loaded after ps-ui.jsx + rent-charts.jsx + rent-forms.jsx + rent-entries.jsx, BEFORE rent.jsx.
   This file owns the shared React/DS aliases for the Rent Tracker; rent.jsx consumes them
   (and the exported view components) via shared global scope. Views are props-driven —
   page-level state lives in rent.jsx. */
const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM } = React;
const RD = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button: RBtn, IconButton: RIcon, Badge: RBadge, Avatar: RAv, Card: RCard, Input: RInput, Select: RSel } = RD;
const RR = window.RENT;

const STATUS_BADGE = { Paid: 'success', Partial: 'warning', Pending: 'neutral', Vacant: 'neutral' };

/* ---------------- Dashboard ---------------- */
function Dashboard() {
  const inc = RR.SERIES[5].income,exp = RR.SERIES[5].expense;
  const pInc = RR.SERIES[4].income,pExp = RR.SERIES[4].expense;
  const dInc = inc - pInc,dExp = exp - pExp;
  return (
    <div className="ps-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
        <RCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Monthly income</span>
            <Icon name="trending-up" size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div className="ps-mono" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)', margin: '10px 0 6px' }}>{gbp(inc)}</div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success-fg)' }}>▲ {gbp(dInc)} vs May</span>
        </RCard>
        <RCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Monthly expenses</span>
            <Icon name="trending-down" size={18} style={{ color: 'var(--amber-400)' }} />
          </div>
          <div className="ps-mono" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-heading)', margin: '10px 0 6px' }}>{gbp(exp)}</div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: dExp > 0 ? 'var(--danger-fg)' : 'var(--success-fg)' }}>
            {dExp > 0 ? '▲' : '▼'} {gbp(dExp)} vs May</span>
        </RCard>
      </div>

      <RCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)' }}>Income vs expenses</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--brand)' }} />Income</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--amber-400)' }} />Expenses</span>
          </div>
        </div>
        <GroupedBars series={RR.SERIES} />
      </RCard>

      <RCard padding="0">
        <div style={{ padding: '16px var(--card-pad) 6px', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)' }}>Recent activity</div>
        <div>
          {RR.ACTIVITY.map((a, i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--card-pad)',
            borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: a.dot, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>{a.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.sub} · {a.when}</div>
              </div>
              <span className="ps-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 700,
              color: a.amount < 0 ? 'var(--text-heading)' : 'var(--success-fg)' }}>
                {a.amount < 0 ? '−' : '+'}{gbp(a.amount)}</span>
            </div>
          )}
        </div>
      </RCard>
    </div>);

}

/* ---------------- Year Grid ---------------- */
function YearGrid({ house, year, toast }) {
  const cols = RR.ROOM_COLS.filter((c) => c.house === house.name);
  const [grid, setGrid] = useS(() => RR.GRID.map((r) => ({ ...r, rent: { ...r.rent } })));
  const [edit, setEdit] = useS(null); // {row, key}
  const [filter, setFilter] = useS('all');
  const [dense, setDense] = useS(false);
  const pad = dense ? '5px 9px' : '9px 12px';

  const showExp = filter !== 'income';
  const showInc = filter !== 'expenses';

  const setCell = (rowIdx, key, val) => setGrid((g) => g.map((r, i) => {
    if (i !== rowIdx) return r;
    const nr = { ...r, rent: { ...r.rent } };
    const num = val === '' ? null : +val || 0;
    if (key.startsWith('rent.')) nr.rent[key.slice(5)] = num;else nr[key] = num;
    const rentTotal = cols.reduce((s, c) => s + (nr.rent[c.id] || 0), 0) +
    RR.ROOM_COLS.filter((c) => c.house !== house.name).reduce((s, c) => s + (nr.rent[c.id] || 0), 0);
    const e = (nr.tax || 0) + (nr.water || 0) + (nr.elec || 0) + (nr.gas || 0) + (nr.maint || 0) + (nr.loan || 0);
    nr.rentTotal = rentTotal;nr.net = rentTotal - e;
    return nr;
  }));

  const Cell = ({ rowIdx, k, value, tint }) => {
    const on = edit && edit.row === rowIdx && edit.key === k;
    return (
      <td onClick={() => setEdit({ row: rowIdx, key: k })} style={{ padding: pad, textAlign: 'right', cursor: 'pointer',
        borderBottom: '1px solid var(--border-subtle)', background: tint, fontVariantNumeric: 'tabular-nums',
        fontSize: 'var(--text-sm)', color: value == null ? 'var(--text-faint)' : 'var(--text-body)', whiteSpace: 'nowrap' }}>
        {on ?
        <input autoFocus defaultValue={value == null ? '' : value}
        onBlur={(e) => {setCell(rowIdx, k, e.target.value);setEdit(null);}}
        onKeyDown={(e) => {if (e.key === 'Enter') {setCell(rowIdx, k, e.target.value);setEdit(null);}if (e.key === 'Escape') setEdit(null);}}
        style={{ width: 56, border: '1px solid var(--border-focus)', borderRadius: 4, padding: '2px 4px',
          textAlign: 'right', font: 'inherit', background: 'var(--surface-card)', color: 'var(--text-heading)', outline: 'none' }} /> :
        value == null ? '—' : gbp(value)}
      </td>);

  };
  const th = { padding: pad, textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', position: 'sticky', top: 0, background: 'var(--surface-card)' };
  const grpTh = { ...th, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', fontSize: '11px', borderBottom: '1px solid var(--border-default)', color: 'var(--text-faint)' };

  const exportCsv = () => {
    const head = ['Month', 'Tax', 'Water', 'Elec', 'Gas', ...cols.map((c) => c.label), 'Maintenance', 'Loan', 'Net'];
    const rows = grid.map((r) => [r.month, r.tax, r.water, r.elec, r.gas, ...cols.map((c) => r.rent[c.id]), r.maint, r.loan, r.net].
    map((v) => v == null ? '' : v).join(','));
    const csv = [head.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = house.name.replace(/\s/g, '-') + '-' + year + '.csv';a.click();
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
          <RBtn size="sm" variant="secondary" leadingIcon={di('download')} onClick={exportCsv}>Export CSV</RBtn>
        </div>
      </div>
      <RCard padding="0" style={{ overflow: 'hidden' }}>
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
              {grid.map((r, i) =>
              <tr key={r.month}>
                  <td style={{ padding: pad, fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-heading)',
                  borderBottom: '1px solid var(--border-subtle)', position: 'sticky', left: 0, background: 'var(--surface-card)' }}>{r.month}</td>
                  {showExp && <>
                    <Cell rowIdx={i} k="tax" value={r.tax} tint="color-mix(in srgb, var(--blue-400) 6%, transparent)" />
                    <Cell rowIdx={i} k="water" value={r.water} tint="color-mix(in srgb, var(--green-400) 6%, transparent)" />
                    <Cell rowIdx={i} k="elec" value={r.elec} tint="color-mix(in srgb, var(--amber-400) 7%, transparent)" />
                    <Cell rowIdx={i} k="gas" value={r.gas} tint="color-mix(in srgb, var(--red-400) 6%, transparent)" />
                  </>}
                  {showInc && cols.map((c) => <Cell key={c.id} rowIdx={i} k={'rent.' + c.id} value={r.rent[c.id]}
                tint="color-mix(in srgb, var(--green-500) 5%, transparent)" />)}
                  {showExp && <>
                    <Cell rowIdx={i} k="maint" value={r.maint} tint="color-mix(in srgb, var(--gray-400) 7%, transparent)" />
                    <Cell rowIdx={i} k="loan" value={r.loan} tint="color-mix(in srgb, var(--green-600) 6%, transparent)" />
                  </>}
                  <td style={{ padding: pad, textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--border-subtle)',
                  color: r.net < 0 ? 'var(--danger-fg)' : 'var(--success-fg)', whiteSpace: 'nowrap' }}>
                    {r.net < 0 ? '−' : ''}{gbp(r.net)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </RCard>
    </div>);

}

/* ---------------- Houses ---------------- */
function Houses({ house, onAddRent, onEditRoom, onAddHouse }) {
  const occ = house.rooms.filter((r) => r.tenant).length;
  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>{house.name}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{house.address}</div>
        </div>
        <RBadge tone={occ === house.rooms.length ? 'success' : 'warning'}>{occ}/{house.rooms.length} occupied</RBadge>
        <RBtn variant="primary" leadingIcon={di('plus')} onClick={onAddHouse}>Add house</RBtn>
      </div>
      <RCard padding="0" style={{ overflow: 'hidden' }}>
        {house.rooms.map((r, i) =>
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px var(--card-pad)',
          borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ width: 70, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{r.unit}</div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-base)', color: r.tenant ? 'var(--text-body)' : 'var(--text-faint)' }}>
              {r.tenant || 'Vacant'}</div>
            <div className="ps-mono" style={{ width: 80, textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{gbp(r.rent)}</div>
            <button onClick={() => onAddRent(r)} title="Record rent" className="ps-mono"
          style={{ width: 86, textAlign: 'right', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
            background: 'transparent', border: 'none', padding: '4px 6px', borderRadius: 'var(--radius-sm)',
            color: r.paid ? 'var(--text-heading)' : 'var(--text-faint)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>{r.paid ? gbp(r.paid) : 'Add +'}</button>
            <div style={{ width: 86, display: 'flex', justifyContent: 'flex-end' }}><RBadge tone={STATUS_BADGE[r.status]} size="sm">{r.status}</RBadge></div>
            <div style={{ display: 'flex', gap: 4 }}>
              <RIcon label="Edit room" variant="ghost" size="sm" onClick={() => onEditRoom(r)}>{di('pencil')}</RIcon>
              <RIcon label="Add rent" variant="ghost" size="sm" onClick={() => onAddRent(r)}>{di('plus-circle')}</RIcon>
            </div>
          </div>
        )}
      </RCard>
    </div>);

}

/* ---------------- Expenses ---------------- */
function Expenses({ houseId, links, receipts, vals, onAddEntry, onEditEntry, onAttach, onView }) {
  const [open, setOpen] = useS('maint');
  const total = Object.values(RR.EXP_MONTH).reduce((a, b) => a + b, 0);
  const donutData = RR.CATEGORIES.map((c) => ({ id: c.id, color: c.color, value: RR.EXP_MONTH[c.id] }));
  const rcById = Object.fromEntries(receipts.map((r) => [r.id, r]));
  const amtOf = (cid, mi) => vals[cid + '-' + mi] != null ? vals[cid + '-' + mi] : Math.max(40, RR.EXP_MONTH[cid] - mi * 7);

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>Expenses · 2026</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Tap a month to edit or attach a receipt</div>
        </div>
        <RBtn variant="primary" leadingIcon={di('plus')} onClick={() => onAddEntry(open)}>Add entry</RBtn>
      </div>
      <RCard style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
        <Donut data={donutData} total={total} />
        <div style={{ flex: 1, minWidth: 220, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {RR.CATEGORIES.map((c) =>
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: "0px" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flex: 'none' }} />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>{c.label}</span>
              <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>{gbp(RR.EXP_MONTH[c.id])}</span>
            </div>
          )}
        </div>
      </RCard>
      <RCard padding="0" style={{ overflow: 'hidden' }}>
        {RR.CATEGORIES.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <div key={c.id} style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <button onClick={() => setOpen((o) => o === c.id ? null : c.id)} style={{ width: '100%', display: 'flex', alignItems: 'center',
                gap: 12, padding: '14px var(--card-pad)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <span style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `color-mix(in srgb, ${c.color} 14%, var(--surface-card))`, color: c.color, flex: 'none' }}>
                  <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide={c.icon}></i></span></span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>{c.label}</span>
                <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{gbp(RR.EXP_MONTH[c.id])}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 96, textAlign: 'right' }}>YTD {gbp(RR.EXP_YTD[c.id])}</span>
                <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-muted)',
                  transform: isOpen ? 'rotate(180deg)' : 'none' }}><i data-lucide="chevron-down"></i></span>
              </button>
              {isOpen &&
              <div style={{ padding: '0 var(--card-pad) 12px' }}>
                  {RR.MONTHS.slice(0, 6).map((m, mi) => {
                  const id = c.id + '-' + mi;
                  const rc = rcById[links[id]];
                  return (
                    <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-sm)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ width: 36, color: 'var(--text-muted)' }}>{m}</span>
                        <span className="ps-mono" style={{ flex: 1, color: 'var(--text-body)' }}>{gbp(amtOf(c.id, mi))}</span>
                        {rc ?
                      <button onClick={() => onView(rc, id)} title="View receipt" style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 9px', cursor: 'pointer', borderRadius: 999, border: '1px solid var(--border-default)', background: 'var(--white)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-body)' }}>
                            <window.KindChip kind={rc.kind} />Receipt</button> :
                      <button onClick={() => onAttach(id, c.label + ' · ' + m)} title="Attach receipt" style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 9px', cursor: 'pointer', borderRadius: 999, border: '1px dashed var(--border-strong)', background: 'transparent',
                        fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                            <span style={{ display: 'inline-flex', width: 12, height: 12 }}><i data-lucide="paperclip"></i></span>Attach</button>}
                        <RIcon label="Edit entry" variant="ghost" size="sm"
                      onClick={() => onEditEntry({ mode: 'edit', category: c.id, houseId, month: mi, amount: amtOf(c.id, mi) })}>{di('pencil')}</RIcon>
                      </div>);
                })}
                </div>
              }
            </div>);

        })}
      </RCard>
    </div>);

}

/* ---------------- Receipts ---------------- */
function Receipts({ receipts, onUpload, onView }) {
  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)' }}>Receipts · 2026</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{receipts.length} receipts on file</div>
        </div>
        <RBtn variant="primary" leadingIcon={di('upload')} onClick={onUpload}>Upload receipt</RBtn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {receipts.map((rc) => {
          const c = catById[rc.cat] || { color: 'var(--gray-500)', icon: 'receipt', label: window.CAT_LABEL[rc.cat] || 'Other' };
          return (
            <RCard key={rc.id} interactive padding="0" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => onView(rc)}>
              <div style={{ height: 110, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: `color-mix(in srgb, ${c.color} 9%, var(--surface-sunken))`, color: c.color }}>
                <span style={{ position: 'absolute', top: 8, right: 8 }}><window.KindChip kind={rc.kind} /></span>
                <span style={{ display: 'inline-flex', width: 28, height: 28 }}><i data-lucide={c.icon}></i></span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{c.label}</span>
              </div>
              <div style={{ padding: '11px 13px' }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{rc.merchant}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{rc.date}</span>
                  <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{gbp(rc.amount)}</span>
                </div>
              </div>
            </RCard>);

        })}
      </div>
    </div>);

}

Object.assign(window, { Dashboard, YearGrid, Houses, Expenses, Receipts });