/* Rent Tracker — drawer form primitives + Add House / Edit Room / Add Rent.
   Loaded after ps-ui.jsx + rent-charts.jsx; consumed by rent.jsx. */
const { useState: fS, useEffect: fE, useRef: fR } = React;
const FDS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button: FBtn, IconButton: FIcon, Badge: FBadge, Select: FSel, Input: FInput } = FDS;

const sym = () => window.PS.Currency.symbol();
const money = (n) => window.PS.Currency.format(n);
const num = (s) => { const n = parseFloat(String(s)); return isNaN(n) ? 0 : n; };
const amt2 = (n) => (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + window.PS.Currency.code();
const sanitizeAmt = (s) => {
  s = String(s).replace(/[^0-9.]/g, '');
  const p = s.split('.');
  return p.length > 1 ? p[0] + '.' + p.slice(1).join('').slice(0, 2) : s;
};

/* run a fn after a fake "request" with saving state */
function useSaver() {
  const [busy, setBusy] = fS(false);
  const run = (fn, delay = 850) => { setBusy(true); setTimeout(() => { setBusy(false); fn && fn(); }, delay); };
  return [busy, run];
}
/* reset form fields each time `open` goes falsy -> truthy */
function useOpenReset(open, reset) {
  const prev = fR(false);
  fE(() => { if (open && !prev.current) reset(); prev.current = !!open; }, [open]);
}

/* tiny label tag e.g. "required" / "optional" */
function LabelTag({ tone, children }) {
  return <span style={{ marginLeft: 6, fontSize: '11px', fontWeight: 600, letterSpacing: 0.2,
    color: tone === 'req' ? 'var(--danger-fg)' : 'var(--text-faint)', textTransform: 'uppercase' }}>{children}</span>;
}
function fieldLabel(text, tag) {
  return <span>{text}{tag ? <LabelTag tone={tag.tone}>{tag.label}</LabelTag> : null}</span>;
}

/* two-column field row (stacks on phone via wrap) */
function FieldRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>{children}</div>;
}

/* $-prefixed amount input */
function AmountField({ label, tag, value, onChange, error, hint, placeholder, autoFocus }) {
  return (
    <FInput label={fieldLabel(label, tag)} value={value} error={error} hint={hint} placeholder={placeholder || '0.00'}
      inputMode="decimal" autoFocus={autoFocus}
      onChange={(e) => onChange(sanitizeAmt(e.target.value))}
      leadingIcon={<span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>{sym()}</span>} />
  );
}

function TextArea({ label, value, onChange, placeholder, tag }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label ? <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>{fieldLabel(label, tag)}</label> : null}
      <textarea className="ps-ta" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* −/value/+ stepper */
function Stepper({ value, onChange, min = 1, max = 10 }) {
  const Btn = ({ d, label, dis }) => (
    <button aria-label={label} disabled={dis} onClick={() => onChange(Math.max(min, Math.min(max, value + d)))}
      style={{ width: 40, height: 38, border: 'none', background: 'transparent', cursor: dis ? 'not-allowed' : 'pointer',
        color: dis ? 'var(--text-faint)' : 'var(--text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide={d < 0 ? 'minus' : 'plus'}></i></span>
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)', background: 'var(--white)', width: 'fit-content', overflow: 'hidden' }}>
      <Btn d={-1} label="Fewer" dis={value <= min} />
      <span className="ps-mono" style={{ minWidth: 34, textAlign: 'center', fontSize: 'var(--text-md)', fontWeight: 700,
        color: 'var(--text-heading)', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', padding: '8px 0' }}>{value}</span>
      <Btn d={1} label="More" dis={value >= max} />
    </div>
  );
}

/* light gray summary box: key/value rows + bold total */
function SummaryBlock({ rows, totalLabel, totalValue }) {
  return (
    <div style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)', padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 9 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {r.badge ? <FBadge tone={r.badge.tone} size="sm">{r.badge.label}</FBadge> : null}{r.label}</span>
          <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)' }}>{r.value}</span>
        </div>
      ))}
      <div style={{ height: 1, background: 'var(--border-default)', margin: '1px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>{totalLabel}</span>
        <span className="ps-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>{totalValue}</span>
      </div>
    </div>
  );
}

/* form-level error block (bottom of body) */
function FormError({ children }) {
  if (!children) return null;
  return (
    <div className="ps-fade" style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 13px',
      borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid color-mix(in srgb, var(--danger-fg) 35%, transparent)' }}>
      <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--danger-fg)', flex: 'none', marginTop: 1 }}><i data-lucide="alert-circle"></i></span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger-fg)', fontWeight: 600, lineHeight: 1.45 }}>{children}</span>
    </div>
  );
}

/* inline spinner for the saving CTA */
function BtnSpin() {
  return <span style={{ display: 'inline-flex', width: 15, height: 15, border: '2px solid color-mix(in srgb, currentColor 35%, transparent)',
    borderTopColor: 'currentColor', borderRadius: '50%', animation: 'ps-spin 0.7s linear infinite' }} />;
}
/* primary CTA that flips to a spinner + busy label while saving */
function SaveCta({ busy, busyLabel, icon, children, onClick, disabled }) {
  return (
    <FBtn variant="primary" disabled={busy || disabled} onClick={onClick}
      leadingIcon={busy ? <BtnSpin /> : (icon ? <i data-lucide={icon}></i> : undefined)}>
      {busy ? busyLabel : children}
    </FBtn>
  );
}

const bodyCol = { display: 'flex', flexDirection: 'column', gap: 16 };

/* ============ 1 · Add House ============ */
function AddHouseDrawer({ open, onClose, onSave }) {
  const [addr, setAddr] = fS('');
  const [rooms, setRooms] = fS(3);
  const [rent, setRent] = fS('600');
  const [err, setErr] = fS(null);
  const [busy, save] = useSaver();
  useOpenReset(open, () => { setAddr(''); setRooms(3); setRent('600'); setErr(null); });
  fE(() => { window.PS.icons(); });

  const per = num(rent);
  const total = per * rooms;
  const submit = () => {
    if (per <= 0) { setErr('Enter a base rent greater than ' + amt2(0) + ' before saving.'); return; }
    setErr(null);
    save(() => onSave({ address: addr.trim() || 'New house', rooms, rent: per }));
  };

  return (
    <RightDrawer open={open} onClose={onClose} icon="home" title="Add house"
      subtitle={addr.trim() ? addr.trim() : 'New property'}
      footer={<><FBtn variant="ghost" onClick={onClose}>Cancel</FBtn>
        <SaveCta busy={busy} busyLabel="Saving…" icon="plus" onClick={submit}>Save</SaveCta></>}>
      <div style={bodyCol}>
        <FInput label="Address" value={addr} onChange={(e) => setAddr(e.target.value)}
          placeholder="e.g. 428 Maple Street, Madison WI"
          leadingIcon={<i data-lucide="map-pin"></i>} />
        <FieldRow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>Number of rooms</label>
            <Stepper value={rooms} onChange={setRooms} min={1} max={10} />
          </div>
          <AmountField label="Base rent" tag={{ tone: 'opt', label: 'per room' }} value={rent} onChange={setRent} />
        </FieldRow>
        <SummaryBlock
          rows={[{ label: rooms + ' rooms × ' + amt2(per), value: amt2(total) }]}
          totalLabel="Monthly rent income" totalValue={amt2(total)} />
        <FormError>{err}</FormError>
      </div>
    </RightDrawer>
  );
}

/* ============ 2 · Edit Room ============ */
function EditRoomDrawer({ room, houseName, onClose, onSave }) {
  const open = !!room;
  const [name, setName] = fS('');
  const [status, setStatus] = fS('Vacant');
  const [renter, setRenter] = fS('');
  const [rent, setRent] = fS('');
  const [touched, setTouched] = fS({});
  const [err, setErr] = fS(null);
  const [busy, save] = useSaver();
  useOpenReset(open, () => {
    setName(room ? room.unit : ''); setStatus(room && room.tenant ? 'Occupied' : 'Vacant');
    setRenter(room ? (room.tenant || '') : ''); setRent(room ? String(room.rent) : '');
    setTouched({}); setErr(null);
  });
  fE(() => { window.PS.icons(); });

  const occupied = status === 'Occupied';
  const errs = {
    name: !name.trim() ? 'Room name is required.' : null,
    renter: occupied && !renter.trim() ? 'A renter is required for occupied rooms.' : null,
    rent: num(rent) <= 0 ? 'Enter the monthly rent.' : null,
  };
  const show = (k) => touched[k] ? errs[k] : null;
  const submit = () => {
    setTouched({ name: 1, renter: 1, rent: 1 });
    if (errs.name || errs.renter || errs.rent) { setErr('Fix the highlighted fields before saving.'); return; }
    setErr(null);
    save(() => onSave({ ...room, unit: name.trim(), tenant: occupied ? renter.trim() : null, rent: num(rent) }));
  };

  return (
    <RightDrawer open={open} onClose={onClose} icon="building-2" title="Edit room" subtitle={houseName}
      footer={<><FBtn variant="ghost" onClick={onClose}>Cancel</FBtn>
        <SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>Save room</SaveCta></>}>
      {room && (
        <div style={bodyCol}>
          <FieldRow>
            <FInput label={fieldLabel('Room name', { tone: 'req', label: 'required' })} value={name} error={show('name')}
              onChange={(e) => setName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: 1 }))} placeholder="e.g. Room 3" />
            <FSel label="Status" value={status} options={['Occupied', 'Vacant']} onChange={(e) => setStatus(e.target.value)} />
          </FieldRow>
          <FInput label={fieldLabel('Renter', { tone: occupied ? 'req' : 'opt', label: occupied ? 'required' : 'optional' })}
            value={renter} error={show('renter')} onChange={(e) => setRenter(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, renter: 1 }))} placeholder={occupied ? 'Tenant name' : 'No renter'}
            leadingIcon={<i data-lucide="user"></i>} />
          <AmountField label="Base rent" tag={{ tone: 'opt', label: 'per month' }} value={rent} onChange={setRent}
            error={show('rent')} />
          <SummaryBlock rows={[{ label: 'Monthly rent', value: amt2(num(rent)) }]} totalLabel="Monthly rent" totalValue={amt2(num(rent))} />
          <FormError>{err}</FormError>
        </div>
      )}
    </RightDrawer>
  );
}

/* ============ 3 · Add Rent ============ */
function AddRentDrawer({ ctx, onClose, onSave }) {
  const open = !!ctx;
  const room = ctx ? ctx.room : null;
  const [renter, setRenter] = fS('');
  const [due, setDue] = fS('');
  const [recv, setRecv] = fS('');
  const [touched, setTouched] = fS({});
  const [err, setErr] = fS(null);
  const [busy, save] = useSaver();
  useOpenReset(open, () => {
    setRenter(room ? (room.tenant || '') : ''); setDue(room ? String(room.rent) : '');
    setRecv(room && room.paid ? String(room.paid) : ''); setTouched({}); setErr(null);
  });
  fE(() => { window.PS.icons(); });

  const dueN = num(due), recvN = num(recv);
  const status = recvN <= 0 ? 'Pending' : recvN >= dueN ? 'Paid' : 'Partial';
  const badgeTone = status === 'Paid' ? 'success' : status === 'Partial' ? 'warning' : 'neutral';
  const paidFull = recvN > 0 && recvN >= dueN;
  const errs = { renter: !renter.trim() ? 'Renter is required.' : null, due: dueN <= 0 ? 'Enter the amount due.' : null };
  const show = (k) => touched[k] ? errs[k] : null;
  const submit = () => {
    setTouched({ renter: 1, due: 1 });
    if (errs.renter || errs.due) { setErr('Fix the highlighted fields before saving.'); return; }
    setErr(null);
    save(() => onSave({ ...room, tenant: renter.trim(), rent: dueN, paid: recvN, status }));
  };

  return (
    <RightDrawer open={open} onClose={onClose} icon="wallet" title={'Add rent' + (room ? ' · ' + room.unit : '')}
      subtitle={ctx ? ctx.houseName : ''}
      footer={<><FBtn variant="ghost" onClick={onClose}>Cancel</FBtn>
        <SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>Add rent</SaveCta></>}>
      {room && (
        <div style={bodyCol}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{ctx.houseName} · {ctx.period}</div>
          <FInput label={fieldLabel('Renter', { tone: 'req', label: 'required' })} value={renter} error={show('renter')}
            onChange={(e) => setRenter(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, renter: 1 }))}
            placeholder="Tenant name" leadingIcon={<i data-lucide="user"></i>} />
          <AmountField label="Amount due" tag={{ tone: 'req', label: 'required' }} value={due} onChange={setDue} error={show('due')} />
          <AmountField label="Amount received" tag={{ tone: 'opt', label: 'leave 0 if not yet paid' }} value={recv} onChange={setRecv} />
          <button onClick={() => setRecv(paidFull ? '0' : (dueN ? String(dueN) : ''))}
            style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', cursor: 'pointer',
              padding: '11px 13px', borderRadius: 'var(--radius-md)', background: paidFull ? 'var(--brand-tint)' : 'var(--white)',
              border: '1px solid ' + (paidFull ? 'var(--brand-on-tint)' : 'var(--border-default)') }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, flex: 'none',
              borderRadius: '50%', background: paidFull ? 'var(--brand)' : 'var(--surface-sunken)', color: paidFull ? '#fff' : 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide={paidFull ? 'check' : 'badge-check'}></i></span></span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>Mark as paid</span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Fill received with {amt2(dueN)} due</span>
            </span>
          </button>
          <SummaryBlock rows={[{ label: 'Received', badge: { tone: badgeTone, label: status }, value: amt2(recvN) }]}
            totalLabel="Rent due" totalValue={amt2(dueN)} />
          <FormError>{err}</FormError>
        </div>
      )}
    </RightDrawer>
  );
}

Object.assign(window, {
  sym, money, num, amt2, sanitizeAmt, useSaver, useOpenReset,
  FieldRow, AmountField, TextArea, Stepper, SummaryBlock, FormError, BtnSpin, SaveCta, fieldLabel, LabelTag,
  AddHouseDrawer, EditRoomDrawer, AddRentDrawer,
});
