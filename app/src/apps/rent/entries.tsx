// Rent Tracker — Entry wizard + Receipt Upload / Picker / Viewer.
// Port of rent-entries.jsx.
import { useEffect, useRef, useState } from 'react';
import { Button, Badge, IconButton, Input, Select } from '../../ds-vendor/components';
import { RightDrawer } from '../../components/ui';
import { di, Icon } from '../../lib/icon';
import { formatCurrencyDecimal } from '../../lib/currency';
import {
  BtnSpin,
  SaveCta,
  FormError,
  FieldRow,
  AmountField,
  TextArea,
  fieldLabel,
  useOpenReset,
} from './forms';
import { MONTH_NAMES, CATEGORIES, type House, type Receipt } from './data';

/* ---- extended receipt type (with kind/url added at runtime) ---- */
export interface ReceiptWithKind extends Receipt {
  kind: 'img' | 'pdf' | 'other';
  url?: string | null;
  notes?: string;
  dateLong?: string;
}

/* ---- expense categories for the wizard ---- */
const ECATS = [
  { key: 'maint', label: 'Maintenance', icon: 'wrench' },
  { key: 'tax', label: 'Property Tax', icon: 'landmark' },
  { key: 'water', label: 'Water', icon: 'droplets' },
  { key: 'elec', label: 'Electricity', icon: 'zap' },
  { key: 'gas', label: 'Gas', icon: 'flame' },
  { key: 'loan', label: 'Loan', icon: 'banknote' },
  { key: 'ins', label: 'Insurance', icon: 'shield-check' },
  { key: 'other', label: 'Other', icon: 'ellipsis' },
] as const;

const CAT_LABEL: Record<string, string> = {
  ins: 'Insurance',
  other: 'Other',
  maint: 'Maintenance',
  ...Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])),
};

function num(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function useSaver(): [boolean, (fn: () => void, delay?: number) => void] {
  const [busy, setBusy] = useState(false);
  const run = (fn: () => void, delay = 850) => {
    setBusy(true);
    setTimeout(() => { setBusy(false); fn(); }, delay);
  };
  return [busy, run];
}

/* ---- file size helper ---- */
const fileSize = (b: number) =>
  b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

const kindOf = (type: string): 'img' | 'pdf' | 'other' =>
  /pdf/i.test(type) ? 'pdf' : /^image\//i.test(type) ? 'img' : 'other';

/* ---- receipt type chip ---- */
export function KindChip({ kind }: { kind: string }) {
  const map: Record<string, { l: string; c: string }> = {
    pdf: { l: 'PDF', c: 'var(--red-400)' },
    img: { l: 'IMG', c: 'var(--blue-400)' },
  };
  const m = map[kind] ?? { l: '—', c: 'var(--text-faint)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        borderRadius: 999,
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: 0.3,
        color: m.c,
        background: `color-mix(in srgb, ${m.c} 14%, transparent)`,
      }}
    >
      {m.l}
    </span>
  );
}

/* ---- stepper rail ---- */
function StepRail({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      {labels.map((l, i) => {
        const done = i < step;
        const cur = i === step;
        return (
          <div key={l} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  flex: 'none',
                  borderRadius: '50%',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  background: done ? 'var(--brand)' : cur ? 'var(--brand-tint)' : 'var(--surface-sunken)',
                  color: done ? '#fff' : cur ? 'var(--brand-on-tint)' : 'var(--text-faint)',
                  border: '1px solid ' + (cur ? 'var(--brand-on-tint)' : 'transparent'),
                }}
              >
                {done ? <span style={{ display: 'inline-flex', width: 14, height: 14 }}>{di('check')}</span> : i + 1}
              </span>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: cur || done ? 'var(--text-heading)' : 'var(--text-faint)',
                }}
              >
                {l}
              </span>
            </div>
            {i < labels.length - 1 ? (
              <span style={{ flex: 1, height: 1, background: done ? 'var(--brand)' : 'var(--border-default)' }} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function RowKV({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '9px 0',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{v}</span>
    </div>
  );
}

/* ============ Entry context types ============ */
export interface EntryCtx {
  mode: 'add' | 'edit';
  category?: string;
  houseId?: string;
  month?: number;
  amount?: number;
  notes?: string;
  roomId?: string;
  description?: string;
  contractor?: string;
}

export interface EntrySubmit {
  mode: 'add' | 'edit';
  category: string;
  houseId: string;
  month: number;
  year: number;
  value: number;
  notes: string;
  roomId: string;
  description: string;
  contractor: string;
}

/* ============ 4 · Add / Edit Entry wizard ============ */
export function EntryWizard({
  ctx,
  houses,
  year,
  onClose,
  onSubmit,
}: {
  ctx: EntryCtx | null;
  houses: House[];
  year: number;
  onClose: () => void;
  onSubmit: (p: EntrySubmit) => void;
}) {
  const open = !!ctx;
  const edit = ctx?.mode === 'edit';
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState('maint');
  const [houseId, setHouseId] = useState('');
  const [month, setMonth] = useState(5);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [roomId, setRoomId] = useState('');
  const [desc, setDesc] = useState('');
  const [contractor, setContractor] = useState('');
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, save] = useSaver();

  useOpenReset(open, () => {
    setStep(ctx?.mode === 'edit' ? 1 : 0);
    setCat(ctx?.category ?? 'maint');
    setHouseId(ctx?.houseId ?? (houses[0]?.id ?? ''));
    setMonth(ctx?.month != null ? ctx.month : 5);
    setAmount(ctx?.amount != null ? String(ctx.amount) : '');
    setNotes(ctx?.notes ?? '');
    setRoomId(ctx?.roomId ?? '');
    setDesc(ctx?.description ?? '');
    setContractor(ctx?.contractor ?? '');
    setTouched(false);
    setErr(null);
  });

  const isMaint = cat === 'maint';
  const house = houses.find((h) => h.id === houseId);
  const catLabel = CAT_LABEL[cat] ?? 'Other';

  const validate = (s: number) => {
    if (s === 0) return houseId ? null : { house: 'Choose a house.' };
    if (s === 1) {
      const e: Record<string, string> = {};
      if (num(amount) <= 0) e.amount = 'Enter an amount.';
      if (isMaint && !desc.trim()) e.desc = 'Description is required.';
      return Object.keys(e).length ? e : null;
    }
    return null;
  };

  const stepErrs = touched ? validate(step) : null;

  const next = () => {
    const e = validate(step);
    if (e) { setTouched(true); setErr('Please complete the highlighted fields.'); return; }
    setTouched(false); setErr(null); setStep((s) => s + 1);
  };
  const back = () => { setTouched(false); setErr(null); setStep((s) => Math.max(0, s - 1)); };

  const submit = () =>
    save(() =>
      onSubmit({
        mode: ctx!.mode,
        category: cat,
        houseId,
        month,
        year,
        value: num(amount),
        notes: notes.trim(),
        roomId: isMaint ? roomId : '',
        description: isMaint ? desc.trim() : '',
        contractor: isMaint ? contractor.trim() : '',
      }),
    );

  const foot =
    step === 0 ? (
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" trailingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('arrow-right')}</span>} onClick={next}>Next</Button>
      </>
    ) : step === 1 ? (
      <>
        <Button variant="ghost" leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('arrow-left')}</span>} onClick={back}>Back</Button>
        <Button variant="primary" trailingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('arrow-right')}</span>} onClick={next}>Next</Button>
      </>
    ) : (
      <>
        <Button variant="ghost" leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('arrow-left')}</span>} onClick={back}>Back</Button>
        <SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>{edit ? 'Save changes' : 'Submit entry'}</SaveCta>
      </>
    );

  const bodyStyle = { display: 'flex', flexDirection: 'column' as const, gap: 16 };

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      icon={edit ? 'pencil' : 'plus'}
      title={edit ? 'Edit entry' : 'Add entry'}
      subtitle={catLabel}
      footer={foot}
      width={460}
    >
      {ctx && (
        <div style={bodyStyle}>
          <StepRail step={step} labels={['Type', 'Details', 'Review']} />

          {step === 0 && (
            <div style={bodyStyle}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 8 }}>
                  Entry type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {ECATS.map((c) => {
                    const on = cat === c.key;
                    return (
                      <button
                        key={c.key}
                        onClick={() => setCat(c.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-md)',
                          textAlign: 'left',
                          background: on ? 'var(--brand-tint)' : 'var(--white)',
                          border: '1px solid ' + (on ? 'var(--brand-on-tint)' : 'var(--border-default)'),
                          color: on ? 'var(--brand-on-tint)' : 'var(--text-body)',
                          fontWeight: on ? 700 : 500,
                          fontSize: 'var(--text-sm)',
                        }}
                      >
                        <span style={{ display: 'inline-flex', width: 17, height: 17, flex: 'none' }}>
                          <Icon name={c.icon} size={17} />
                        </span>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Select
                label={fieldLabel('House', { tone: 'req', label: 'required' })}
                value={houseId}
                error={(stepErrs as Record<string, string> | null)?.house}
                options={houses.map((h) => ({ value: h.id, label: h.name }))}
                onChange={(e) => setHouseId(e.target.value)}
              />
              <FieldRow>
                <Select
                  label="Month"
                  value={String(month)}
                  options={MONTH_NAMES.map((m, i) => ({ value: String(i), label: m }))}
                  onChange={(e) => setMonth(+e.target.value)}
                />
                <Input label="Year" value={String(year)} disabled readOnly />
              </FieldRow>
            </div>
          )}

          {step === 1 && !isMaint && (
            <div style={bodyStyle}>
              <AmountField
                label="Amount"
                tag={{ tone: 'req', label: 'required' }}
                value={amount}
                onChange={setAmount}
                error={(stepErrs as Record<string, string> | null)?.amount}
                autoFocus
              />
              <TextArea
                label="Notes"
                tag={{ tone: 'opt', label: 'optional' }}
                value={notes}
                onChange={setNotes}
                placeholder="Anything worth recording"
              />
            </div>
          )}

          {step === 1 && isMaint && (
            <div style={bodyStyle}>
              <Select
                label={fieldLabel('Room', { tone: 'opt', label: 'optional' })}
                value={roomId}
                options={[
                  { value: '', label: 'Whole house' },
                  ...(house?.rooms ?? []).map((r) => ({ value: r.id, label: r.unit })),
                ]}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <AmountField
                label="Amount"
                tag={{ tone: 'req', label: 'required' }}
                value={amount}
                onChange={setAmount}
                error={(stepErrs as Record<string, string> | null)?.amount}
              />
              <Input
                label={fieldLabel('Description', { tone: 'req', label: 'required' })}
                value={desc}
                error={(stepErrs as Record<string, string> | null)?.desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. HVAC service"
              />
              <Input
                label={fieldLabel('Contractor', { tone: 'opt', label: 'optional' })}
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                placeholder="e.g. PlumbPro Ltd"
                leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('hard-hat')}</span>}
              />
              <TextArea label="Notes" tag={{ tone: 'opt', label: 'optional' }} value={notes} onChange={setNotes} />
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>
                Review the entry before saving.
              </div>
              <div>
                <RowKV k="Type" v={catLabel} />
                <RowKV k="House" v={house ? house.name : '—'} />
                <RowKV k="Period" v={MONTH_NAMES[month] + ' ' + year} />
                <RowKV k="Amount" v={formatCurrencyDecimal(num(amount))} />
                {isMaint && (
                  <RowKV
                    k="Room"
                    v={roomId ? (house?.rooms.find((r) => r.id === roomId)?.unit ?? '—') : 'Whole house'}
                  />
                )}
                {isMaint && <RowKV k="Description" v={desc.trim() || '—'} />}
                {isMaint && contractor.trim() ? <RowKV k="Contractor" v={contractor.trim()} /> : null}
                {notes.trim() ? <RowKV k="Notes" v={notes.trim()} /> : null}
              </div>
            </div>
          )}

          <FormError>{err}</FormError>
        </div>
      )}
    </RightDrawer>
  );
}

/* ============ 5 · Upload Receipt ============ */
interface FileInfo { name: string; size: number; kind: 'img' | 'pdf' | 'other'; url: string | null }

export interface UploadedReceipt {
  id: string;
  merchant: string;
  cat: string;
  houseId: string;
  date: string;
  amount: number;
  kind: 'img' | 'pdf' | 'other';
  url: string | null;
  notes: string;
}

export function UploadReceiptDrawer({
  open,
  houses,
  onClose,
  onUpload,
}: {
  open: boolean;
  houses: House[];
  onClose: () => void;
  onUpload: (rc: UploadedReceipt) => void;
}) {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [merchant, setMerchant] = useState('');
  const [cat, setCat] = useState('maint');
  const [houseId, setHouseId] = useState('');
  const [date, setDate] = useState('');
  const [total, setTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [drag, setDrag] = useState(false);
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, save] = useSaver();
  const inputRef = useRef<HTMLInputElement>(null);

  useOpenReset(open, () => {
    setFile(null); setMerchant(''); setCat('maint');
    setHouseId(houses[0]?.id ?? '');
    setDate('2026-06-12'); setTotal(''); setNotes('');
    setDrag(false); setTouched(false); setErr(null);
  });

  const take = (f: File | null | undefined) => {
    if (!f) return;
    const kind = kindOf(f.type);
    setFile({ name: f.name, size: f.size, kind, url: kind === 'img' ? URL.createObjectURL(f) : null });
  };

  const merchErr = touched && !merchant.trim() ? 'Merchant is required.' : null;

  const submit = () => {
    setTouched(true);
    if (!file) { setErr('Choose a receipt file to upload.'); return; }
    if (!merchant.trim()) { setErr('Add the merchant name before uploading.'); return; }
    setErr(null);
    save(() =>
      onUpload({
        id: 'up' + Math.random().toString(36).slice(2, 7),
        merchant: merchant.trim(),
        cat,
        houseId,
        date: date || '2026-06-12',
        amount: parseFloat(total) || 0,
        kind: file.kind,
        url: file.url,
        notes: notes.trim(),
      }),
    1000);
  };

  const uploadCatOptions = [
    ...ECATS.filter((c) => c.key !== 'loan').map((c) => ({ value: c.key, label: c.label })),
    { value: 'supplies', label: 'Supplies' },
  ];

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      icon="receipt"
      title="Upload receipt"
      subtitle="Add to your receipt library"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          {err && !busy ? (
            <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--danger-fg)', fontWeight: 600 }}>{err}</span>
          ) : <span style={{ flex: 1 }} />}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <SaveCta busy={busy} busyLabel="Uploading…" icon="download" onClick={submit} disabled={!file}>
            Upload receipt
          </SaveCta>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 8 }}>
            Receipt file
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,application/pdf"
            style={{ display: 'none' }}
            onChange={(e) => take(e.target.files?.[0])}
          />
          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '30px 18px',
                cursor: 'pointer',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed ' + (drag ? 'var(--brand)' : 'var(--border-strong)'),
                background: drag ? 'var(--brand-tint)' : 'var(--surface-sunken)',
              }}
            >
              <span style={{ display: 'inline-flex', width: 30, height: 30, color: 'var(--text-faint)' }}>
                <Icon name="receipt" size={30} />
              </span>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
                Drop image here or{' '}
                <span style={{ color: 'var(--brand-on-tint)', fontWeight: 700 }}>browse</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>PNG, JPG or PDF · up to 10 MB</div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 13px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--white)',
              }}
            >
              {file.kind === 'img' && file.url ? (
                <img src={file.url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flex: 'none' }} />
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    flex: 'none',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface-sunken)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Icon name="file-text" size={20} />
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fileSize(file.size)}</div>
              </div>
              <IconButton label="Remove file" variant="ghost" size="sm" onClick={() => setFile(null)}>
                {di('x')}
              </IconButton>
            </div>
          )}
        </div>
        <Input
          label={fieldLabel('Merchant', { tone: 'req', label: 'required' })}
          value={merchant}
          error={merchErr}
          onChange={(e) => setMerchant(e.target.value)}
          placeholder="e.g. British Gas"
          leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('store')}</span>}
        />
        <FieldRow>
          <Select
            label="Category"
            value={cat}
            options={uploadCatOptions}
            onChange={(e) => setCat(e.target.value)}
          />
          <Select
            label="House"
            value={houseId}
            options={houses.map((h) => ({ value: h.id, label: h.name }))}
            onChange={(e) => setHouseId(e.target.value)}
          />
        </FieldRow>
        <FieldRow>
          <Input label="Issue date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <AmountField label="Total amount" tag={{ tone: 'opt', label: 'optional' }} value={total} onChange={setTotal} />
        </FieldRow>
        <TextArea label="Notes" tag={{ tone: 'opt', label: 'optional' }} value={notes} onChange={setNotes} />
      </div>
    </RightDrawer>
  );
}

/* ============ 6 · Receipt Picker ============ */
export interface PickerCtx { entryId: string; label: string }

export function ReceiptPickerDialog({
  ctx,
  receipts,
  onClose,
  onPick,
  onUpload,
}: {
  ctx: PickerCtx | null;
  receipts: ReceiptWithKind[];
  onClose: () => void;
  onPick: (r: ReceiptWithKind) => void;
  onUpload: () => void;
}) {
  const open = !!ctx;
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [linking, setLinking] = useState<string | null>(null);

  useOpenReset(open, () => { setLoading(true); setQ(''); setLinking(null); });

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, [open]);

  const list = receipts.filter((r) =>
    r.merchant.toLowerCase().includes(q.trim().toLowerCase()),
  );

  const pick = (r: ReceiptWithKind) => {
    setLinking(r.id);
    setTimeout(() => onPick(r), 700);
  };

  return (
    <RightDrawer open={open} onClose={onClose} title="Attach receipt" subtitle={ctx?.label}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          placeholder="Search by merchant"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('search')}</span>}
        />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 13px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="ps-shimmer" style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', flex: 'none' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div className="ps-shimmer" style={{ width: '55%', height: 11, borderRadius: 4 }} />
                  <div className="ps-shimmer" style={{ width: '32%', height: 9, borderRadius: 4 }} />
                </div>
                <div className="ps-shimmer" style={{ width: 46, height: 11, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 10,
              padding: '38px 18px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface-sunken)',
                color: 'var(--text-faint)',
              }}
            >
              <Icon name="image-off" size={23} />
            </span>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>
              No unlinked receipts
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: 240 }}>
              Nothing matches for this property. Upload a receipt to attach it here.
            </div>
            <Button
              variant="ghost"
              leadingIcon={<span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di('upload')}</span>}
              onClick={onUpload}
            >
              Upload a receipt
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              pointerEvents: linking ? 'none' : 'auto',
              opacity: linking ? 0.65 : 1,
            }}
          >
            {list.map((r) => (
              <button
                key={r.id}
                onClick={() => pick(r)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--white)',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-focus)';
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.background = 'var(--white)';
                }}
              >
                <KindChip kind={r.kind} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{r.merchant}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.date}</div>
                </div>
                {linking === r.id ? (
                  <BtnSpin />
                ) : (
                  <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {formatCurrencyDecimal(r.amount)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </RightDrawer>
  );
}

/* ---- faux scanned-document preview ---- */
function FauxReceipt({ r }: { r: ReceiptWithKind }) {
  if (r.kind === 'other' || r.kind === 'none' as string) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', color: 'var(--text-faint)' }}>
        <Icon name="image-off" size={34} />
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>No preview available</span>
      </div>
    );
  }
  if (r.kind === 'img' && r.url) {
    return <img src={r.url} alt="" style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />;
  }
  return (
    <div
      style={{
        position: 'relative',
        width: 230,
        maxWidth: '88%',
        margin: '0 auto',
        background: '#fff',
        color: '#1a1a1a',
        borderRadius: 6,
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        padding: '20px 20px 26px',
      }}
    >
      {r.kind === 'pdf' ? (
        <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 800, color: '#D23A40', letterSpacing: 0.5 }}>PDF</span>
      ) : null}
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>{r.merchant}</div>
      <div style={{ textAlign: 'center', fontSize: 10, color: '#888', marginTop: 2 }}>{r.date}</div>
      <div style={{ borderTop: '1px dashed #ccc', margin: '14px 0 10px' }} />
      {([['Subtotal', r.amount * 0.83], ['Tax', r.amount * 0.17]] as [string, number][]).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444', padding: '3px 0' }}>
          <span>{k}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyDecimal(v)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #222', margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
        <span>TOTAL</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyDecimal(r.amount)}</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 9, color: '#aaa', marginTop: 16, letterSpacing: 1 }}>· · · · · · · · · · · ·</div>
    </div>
  );
}

/* ============ 7 · Receipt Viewer ============ */
export interface ViewerCtx { receipt: ReceiptWithKind; entryId?: string }

export function ReceiptViewerDialog({
  ctx,
  onClose,
  onUnlink,
}: {
  ctx: ViewerCtx | null;
  onClose: () => void;
  onUnlink: (c: ViewerCtx) => void;
}) {
  const open = !!ctx;
  const r = ctx?.receipt ?? null;
  const fromEntry = ctx?.entryId != null;
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useOpenReset(open, () => { setConfirm(false); setBusy(false); });

  if (!open || !r) return null;

  const unlink = () => {
    if (!confirm) { setConfirm(true); return; }
    setBusy(true);
    setTimeout(() => onUnlink(ctx!), 750);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(24,28,26,0.32)' }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 480,
          background: 'var(--surface-card)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 18px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--text-heading)',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.merchant}
            </span>
            <Badge tone="neutral" size="sm">{CAT_LABEL[r.cat] ?? 'Other'}</Badge>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <IconButton label="Open in new tab" variant="ghost" size="sm" onClick={() => r.url && window.open(r.url, '_blank')}>
              {di('external-link')}
            </IconButton>
            <IconButton label="Download" variant="ghost" size="sm">{di('download')}</IconButton>
            <IconButton label="Close" variant="ghost" size="sm" onClick={onClose}>{di('x')}</IconButton>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, background: 'var(--surface-sunken)' }}>
          <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FauxReceipt r={r} />
          </div>
          <div
            style={{
              marginTop: 18,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{r.dateLong ?? r.date}</span>
              <span className="ps-mono" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--brand-on-tint)' }}>
                {formatCurrencyDecimal(r.amount)}
              </span>
            </div>
            {r.notes ? (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-body)',
                  lineHeight: 1.5,
                }}
              >
                {r.notes}
              </div>
            ) : null}
          </div>
        </div>
        {fromEntry ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 18px', borderTop: '1px solid var(--border-subtle)' }}>
            <Button
              variant={confirm ? 'danger' : 'danger-soft'}
              disabled={busy}
              leadingIcon={
                busy ? <BtnSpin /> : <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{di(confirm ? 'alert-triangle' : 'unlink')}</span>
              }
              onClick={unlink}
            >
              {busy ? 'Unlinking…' : confirm ? 'Confirm unlink' : 'Unlink from entry'}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
