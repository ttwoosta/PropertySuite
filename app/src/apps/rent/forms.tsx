// Rent Tracker — drawer form primitives + Add House / Edit Room / Add Rent.
// Port of rent-forms.jsx.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Badge, Input, Select } from '../../ds-vendor/components';
import { RightDrawer } from '../../components/ui';
import { Icon, di } from '../../lib/icon';
import {
  getCurrencySymbol,
  formatCurrencyDecimal,
} from '../../lib/currency';
import {
  validateHouseForm,
  validateRoomForm,
  isRoomFormValid,
  validateRentEntryForm,
  isRentEntryFormValid,
} from '../../lib/rentValidation';
import { useRentForm } from '../../hooks/useRentForm';
import { type House, type Room, type RoomStatus } from './data';

/* ---- primitives ---- */

function sanitizeAmt(s: string): string {
  s = s.replace(/[^0-9.]/g, '');
  const p = s.split('.');
  return p.length > 1 ? p[0] + '.' + p.slice(1).join('').slice(0, 2) : s;
}

function num(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export function useOpenReset(open: boolean, reset: () => void) {
  const prev = useRef(false);
  useEffect(() => {
    if (open && !prev.current) reset();
    prev.current = !!open;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
}

function LabelTag({ tone, children }: { tone: 'req' | 'opt'; children: ReactNode }) {
  return (
    <span
      style={{
        marginLeft: 6,
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: 0.2,
        color: tone === 'req' ? 'var(--danger-fg)' : 'var(--text-faint)',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}

export function fieldLabel(text: string, tag?: { tone: 'req' | 'opt'; label: string }): ReactNode {
  return <span>{text}{tag ? <LabelTag tone={tag.tone}>{tag.label}</LabelTag> : null}</span>;
}

export function FieldRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
      {children}
    </div>
  );
}

export function AmountField({
  label,
  tag,
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoFocus,
}: {
  label: string;
  tag?: { tone: 'req' | 'opt'; label: string };
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  hint?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <Input
      label={fieldLabel(label, tag)}
      value={value}
      error={error}
      hint={hint}
      placeholder={placeholder ?? '0.00'}
      inputMode="decimal"
      autoFocus={autoFocus}
      onChange={(e) => onChange(sanitizeAmt(e.target.value))}
      leadingIcon={
        <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
          {getCurrencySymbol()}
        </span>
      }
    />
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  tag,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tag?: { tone: 'req' | 'opt'; label: string };
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label ? (
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>
          {fieldLabel(label, tag)}
        </label>
      ) : null}
      <textarea
        className="ps-ta"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const Btn = ({ d, label, dis }: { d: number; label: string; dis: boolean }) => (
    <button
      aria-label={label}
      disabled={dis}
      onClick={() => onChange(Math.max(min, Math.min(max, value + d)))}
      style={{
        width: 40,
        height: 38,
        border: 'none',
        background: 'transparent',
        cursor: dis ? 'not-allowed' : 'pointer',
        color: dis ? 'var(--text-faint)' : 'var(--text-body)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di(d < 0 ? 'minus' : 'plus')}</span>
    </button>
  );
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--white)',
        width: 'fit-content',
        overflow: 'hidden',
      }}
    >
      <Btn d={-1} label="Fewer" dis={value <= min} />
      <span
        className="ps-mono"
        style={{
          minWidth: 34,
          textAlign: 'center',
          fontSize: 'var(--text-md)',
          fontWeight: 700,
          color: 'var(--text-heading)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '8px 0',
        }}
      >
        {value}
      </span>
      <Btn d={1} label="More" dis={value >= max} />
    </div>
  );
}

interface SummaryRow {
  label: string;
  value: string;
  badge?: { tone: 'neutral' | 'success' | 'warning' | 'danger'; label: string };
}

export function SummaryBlock({
  rows,
  totalLabel,
  totalValue,
}: {
  rows: SummaryRow[];
  totalLabel: string;
  totalValue: string;
}) {
  return (
    <div
      style={{
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '13px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
        >
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {r.badge ? <Badge tone={r.badge.tone} size="sm">{r.badge.label}</Badge> : null}
            {r.label}
          </span>
          <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)' }}>
            {r.value}
          </span>
        </div>
      ))}
      <div style={{ height: 1, background: 'var(--border-default)', margin: '1px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>
          {totalLabel}
        </span>
        <span className="ps-mono" style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>
          {totalValue}
        </span>
      </div>
    </div>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      className="ps-fade"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        padding: '11px 13px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--danger-bg)',
        border: '1px solid color-mix(in srgb, var(--danger-fg) 35%, transparent)',
      }}
    >
      <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--danger-fg)', flex: 'none', marginTop: 1 }}>
        {di('alert-circle')}
      </span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger-fg)', fontWeight: 600, lineHeight: 1.45 }}>
        {children}
      </span>
    </div>
  );
}

export function BtnSpin() {
  return (
    <span
      style={{
        display: 'inline-flex',
        width: 15,
        height: 15,
        border: '2px solid color-mix(in srgb, currentColor 35%, transparent)',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'ps-spin 0.7s linear infinite',
      }}
    />
  );
}

export function SaveCta({
  busy,
  busyLabel,
  icon,
  children,
  onClick,
  disabled,
}: {
  busy: boolean;
  busyLabel: string;
  icon?: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="primary"
      disabled={busy || disabled}
      onClick={onClick}
      leadingIcon={busy ? <BtnSpin /> : icon ? <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di(icon)}</span> : undefined}
    >
      {busy ? busyLabel : children}
    </Button>
  );
}

const bodyCol = { display: 'flex', flexDirection: 'column' as const, gap: 16 };

/* ============ 1 · Add House ============ */
export function AddHouseDrawer({
  open,
  onClose,
  _saveHouse = async () => {},
}: {
  open: boolean;
  onClose: () => void;
  _saveHouse?: (p: { address: string; rooms: number; rent: number }) => Promise<void>;
}) {
  const [addr, setAddr] = useState('');
  const [rooms, setRooms] = useState(3);
  const [rent, setRent] = useState('600');
  const [err, setErr] = useState<string | null>(null);
  const { busy, submitHouse } = useRentForm({ saveHouse: _saveHouse });

  useOpenReset(open, () => { setAddr(''); setRooms(3); setRent('600'); setErr(null); });

  const per = num(rent);
  const total = per * rooms;

  const submit = async () => {
    const v = validateHouseForm(per);
    if (!v.ok) { setErr(v.error); return; }
    setErr(null);
    const ok = await submitHouse({ address: addr.trim() || 'New house', rooms, rent: per });
    if (ok) onClose();
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      icon="home"
      title="Add house"
      subtitle={addr.trim() ? addr.trim() : 'New property'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <SaveCta busy={busy} busyLabel="Saving…" icon="plus" onClick={submit}>Save</SaveCta>
        </>
      }
    >
      <div style={bodyCol}>
        <Input
          label="Address"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="e.g. 428 Maple Street, Madison WI"
          leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('map-pin')}</span>}
        />
        <FieldRow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>
              Number of rooms
            </label>
            <Stepper value={rooms} onChange={setRooms} min={1} max={10} />
          </div>
          <AmountField label="Base rent" tag={{ tone: 'opt', label: 'per room' }} value={rent} onChange={setRent} />
        </FieldRow>
        <SummaryBlock
          rows={[{ label: rooms + ' rooms × ' + formatCurrencyDecimal(per), value: formatCurrencyDecimal(total) }]}
          totalLabel="Monthly rent income"
          totalValue={formatCurrencyDecimal(total)}
        />
        <FormError>{err}</FormError>
      </div>
    </RightDrawer>
  );
}

/* ============ 2 · Edit Room ============ */
export function EditRoomDrawer({
  room,
  houseName,
  onClose,
  _saveRoom = async () => {},
}: {
  room: Room | null;
  houseName: string;
  onClose: () => void;
  _saveRoom?: (r: Room) => Promise<void>;
}) {
  const open = !!room;
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Occupied' | 'Vacant'>('Vacant');
  const [renter, setRenter] = useState('');
  const [rent, setRent] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const { busy, submitRoom } = useRentForm({ saveRoom: _saveRoom });

  useOpenReset(open, () => {
    setName(room?.unit ?? '');
    setStatus(room?.tenant ? 'Occupied' : 'Vacant');
    setRenter(room?.tenant ?? '');
    setRent(room ? String(room.rent) : '');
    setTouched({});
    setFormErr(null);
  });

  const occupied = status === 'Occupied';
  const errs = validateRoomForm({ name, renter, rent: num(rent), occupied });
  const show = (k: keyof typeof errs) => (touched[k] ? errs[k] : null);

  useEffect(() => {
    if (renter && status === 'Vacant') setStatus('Occupied');
  }, [renter]);

  const submit = async () => {
    setTouched({ name: true, renter: true, rent: true });
    if (!isRoomFormValid(errs)) { setFormErr('Fix the highlighted fields before saving.'); return; }
    setFormErr(null);
    const nextStatus = occupied ? (room!.status === 'Vacant' ? 'Pending' : room!.status) : 'Vacant';
    const ok = await submitRoom({ ...room!, unit: name.trim(), tenant: occupied ? renter.trim() : null, rent: num(rent), status: nextStatus });
    if (ok) onClose();
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      icon="building-2"
      title="Edit room"
      subtitle={houseName}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>Save room</SaveCta>
        </>
      }
    >
      {room && (
        <div style={bodyCol}>
          <FieldRow>
            <Input
              label={fieldLabel('Room name', { tone: 'req', label: 'required' })}
              value={name}
              error={show('name')}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="e.g. Room 3"
            />
            <Select
              label="Status"
              value={status}
              options={['Occupied', 'Vacant']}
              onChange={(e) => setStatus(e.target.value as 'Occupied' | 'Vacant')}
            />
          </FieldRow>
          <Input
            label={fieldLabel('Renter', { tone: occupied ? 'req' : 'opt', label: occupied ? 'required' : 'optional' })}
            value={renter}
            error={show('renter')}
            onChange={(e) => setRenter(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, renter: true }))}
            placeholder={occupied ? 'Tenant name' : 'No renter'}
            leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('user')}</span>}
          />
          <AmountField
            label="Base rent"
            tag={{ tone: 'opt', label: 'per month' }}
            value={rent}
            onChange={setRent}
            error={show('rent')}
          />
          <SummaryBlock
            rows={[{ label: 'Monthly rent', value: formatCurrencyDecimal(num(rent)) }]}
            totalLabel="Monthly rent"
            totalValue={formatCurrencyDecimal(num(rent))}
          />
          <FormError>{formErr}</FormError>
        </div>
      )}
    </RightDrawer>
  );
}

/* ============ 3 · Add Rent ============ */
export interface AddRentCtx {
  room: Room;
  houseId: string;
  houseName: string;
  period: string;
  month: number;
  year: number;
}

export function AddRentDrawer({
  ctx,
  onClose,
  _saveRentEntry = async () => {},
}: {
  ctx: AddRentCtx | null;
  onClose: () => void;
  _saveRentEntry?: (r: Room) => Promise<void>;
}) {
  const open = !!ctx;
  const room = ctx?.room ?? null;
  const [renter, setRenter] = useState('');
  const [due, setDue] = useState('');
  const [recv, setRecv] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const { busy, submitRentEntry } = useRentForm({ saveRentEntry: _saveRentEntry });

  useOpenReset(open, () => {
    setRenter(room?.tenant ?? '');
    setDue(room ? String(room.rent) : '');
    setRecv(room?.paid ? String(room.paid) : '');
    setTouched({});
    setFormErr(null);
  });

  const dueN = num(due);
  const recvN = num(recv);
  const status: RoomStatus = recvN <= 0 ? 'Pending' : recvN >= dueN ? 'Paid' : 'Partial';
  const badgeTone = status === 'Paid' ? 'success' : status === 'Partial' ? 'warning' : 'neutral';
  const paidFull = recvN > 0 && recvN >= dueN;

  const errs = validateRentEntryForm({ renter, amountDue: dueN });
  const show = (k: keyof typeof errs) => (touched[k] ? errs[k] : null);

  const submit = async () => {
    setTouched({ renter: true, due: true });
    if (!isRentEntryFormValid(errs)) { setFormErr('Fix the highlighted fields before saving.'); return; }
    setFormErr(null);
    const ok = await submitRentEntry({ ...room!, tenant: renter.trim(), rent: dueN, paid: recvN, status });
    if (ok) onClose();
  };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      icon="wallet"
      title={room ? 'Add rent · ' + room.unit : 'Add rent'}
      subtitle={ctx?.houseName}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>Add rent</SaveCta>
        </>
      }
    >
      {room && (
        <div style={bodyCol}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {ctx?.houseName} · {ctx?.period}
          </div>
          <Input
            label={fieldLabel('Renter', { tone: 'req', label: 'required' })}
            value={renter}
            error={show('renter')}
            onChange={(e) => setRenter(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, renter: true }))}
            placeholder="Tenant name"
            leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('user')}</span>}
          />
          <AmountField label="Amount due" tag={{ tone: 'req', label: 'required' }} value={due} onChange={setDue} error={show('due')} />
          <AmountField label="Amount received" tag={{ tone: 'opt', label: 'leave 0 if not yet paid' }} value={recv} onChange={setRecv} />
          <button
            onClick={() => setRecv(paidFull ? '0' : dueN ? String(dueN) : '')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '11px 13px',
              borderRadius: 'var(--radius-md)',
              background: paidFull ? 'var(--brand-tint)' : 'var(--white)',
              border: '1px solid ' + (paidFull ? 'var(--brand-on-tint)' : 'var(--border-default)'),
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                flex: 'none',
                borderRadius: '50%',
                background: paidFull ? 'var(--brand)' : 'var(--surface-sunken)',
                color: paidFull ? '#fff' : 'var(--text-muted)',
              }}
            >
              <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di(paidFull ? 'check' : 'badge-check')}</span>
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>
                Mark as paid
              </span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Fill received with {formatCurrencyDecimal(dueN)} due
              </span>
            </span>
          </button>
          <SummaryBlock
            rows={[{ label: 'Received', badge: { tone: badgeTone, label: status }, value: formatCurrencyDecimal(recvN) }]}
            totalLabel="Rent due"
            totalValue={formatCurrencyDecimal(dueN)}
          />
          <FormError>{formErr}</FormError>
        </div>
      )}
    </RightDrawer>
  );
}
