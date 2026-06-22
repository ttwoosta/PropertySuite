/* Rent Tracker — Entry wizard + Receipt Upload / Picker / Viewer.
   Loaded after rent-forms.jsx; consumed by rent.jsx. */
const { useState: eS, useEffect: eE, useRef: eR, useMemo: eM } = React;
const EDS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button: EBtn, IconButton: EIcon, Badge: EBadge, Select: ESel, Input: EInput } = EDS;

const ECATS = [
  { key: 'maint', label: 'Maintenance', icon: 'wrench' },
  { key: 'tax', label: 'Property Tax', icon: 'landmark' },
  { key: 'water', label: 'Water', icon: 'droplets' },
  { key: 'elec', label: 'Electricity', icon: 'zap' },
  { key: 'gas', label: 'Gas', icon: 'flame' },
  { key: 'loan', label: 'Loan', icon: 'banknote' },
  { key: 'ins', label: 'Insurance', icon: 'shield-check' },
  { key: 'other', label: 'Other', icon: 'ellipsis' },
];
const CAT_LABEL = Object.assign({ ins: 'Insurance', other: 'Other', maint: 'Maintenance' },
  Object.fromEntries(window.RENT.CATEGORIES.map((c) => [c.id, c.label])));
const eBody = { display: 'flex', flexDirection: 'column', gap: 16 };

/* ---------- stepper rail ---------- */
function StepRail({ step, labels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      {labels.map((l, i) => {
        const done = i < step, cur = i === step;
        return (
          <React.Fragment key={l}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, flex: 'none',
                borderRadius: '50%', fontSize: 'var(--text-xs)', fontWeight: 700,
                background: done ? 'var(--brand)' : cur ? 'var(--brand-tint)' : 'var(--surface-sunken)',
                color: done ? '#fff' : cur ? 'var(--brand-on-tint)' : 'var(--text-faint)',
                border: '1px solid ' + (cur ? 'var(--brand-on-tint)' : 'transparent') }}>
                {done ? <span style={{ display: 'inline-flex', width: 14, height: 14 }}><i data-lucide="check"></i></span> : i + 1}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: cur || done ? 'var(--text-heading)' : 'var(--text-faint)' }}>{l}</span>
            </div>
            {i < labels.length - 1 ? <span style={{ flex: 1, height: 1, background: done ? 'var(--brand)' : 'var(--border-default)' }} /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RowKV({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', textAlign: 'right' }}>{v}</span>
    </div>
  );
}

/* ============ 4 · Add / Edit Entry wizard ============ */
function EntryWizard({ ctx, houses, year, onClose, onSubmit }) {
  const open = !!ctx;
  const edit = ctx && ctx.mode === 'edit';
  const [step, setStep] = eS(0);
  const [cat, setCat] = eS('maint');
  const [houseId, setHouseId] = eS('');
  const [month, setMonth] = eS(5);
  const [amount, setAmount] = eS('');
  const [notes, setNotes] = eS('');
  const [roomId, setRoomId] = eS('');
  const [desc, setDesc] = eS('');
  const [contractor, setContractor] = eS('');
  const [touched, setTouched] = eS(false);
  const [err, setErr] = eS(null);
  const [busy, save] = window.useSaver();

  window.useOpenReset(open, () => {
    const c = ctx || {};
    setStep(c.mode === 'edit' ? 1 : 0);
    setCat(c.category || 'maint'); setHouseId(c.houseId || (houses[0] && houses[0].id) || '');
    setMonth(c.month != null ? c.month : 5); setAmount(c.amount != null ? String(c.amount) : '');
    setNotes(c.notes || ''); setRoomId(c.roomId || ''); setDesc(c.description || ''); setContractor(c.contractor || '');
    setTouched(false); setErr(null);
  });
  eE(() => { window.PS.icons(); });

  const isMaint = cat === 'maint';
  const house = houses.find((h) => h.id === houseId);
  const catLabel = CAT_LABEL[cat] || 'Other';

  const validate = (s) => {
    if (s === 0) return houseId ? null : { house: 'Choose a house.' };
    if (s === 1) {
      const e = {};
      if (window.num(amount) <= 0) e.amount = 'Enter an amount.';
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
  const submit = () => save(() => onSubmit({
    mode: ctx.mode, category: cat, houseId, month, year, value: window.num(amount), notes: notes.trim(),
    roomId: isMaint ? roomId : '', description: isMaint ? desc.trim() : '', contractor: isMaint ? contractor.trim() : '',
  }));

  const foot = (
    step === 0 ? <><EBtn variant="ghost" onClick={onClose}>Cancel</EBtn><EBtn variant="primary" trailingIcon={<i data-lucide="arrow-right"></i>} onClick={next}>Next</EBtn></>
    : step === 1 ? <><EBtn variant="ghost" leadingIcon={<i data-lucide="arrow-left"></i>} onClick={back}>Back</EBtn><EBtn variant="primary" trailingIcon={<i data-lucide="arrow-right"></i>} onClick={next}>Next</EBtn></>
    : <><EBtn variant="ghost" leadingIcon={<i data-lucide="arrow-left"></i>} onClick={back}>Back</EBtn>
        <window.SaveCta busy={busy} busyLabel="Saving…" icon="check" onClick={submit}>{edit ? 'Save changes' : 'Submit entry'}</window.SaveCta></>
  );

  return (
    <RightDrawer open={open} onClose={onClose} icon={edit ? 'pencil' : 'plus'}
      title={(edit ? 'Edit entry' : 'Add entry')} subtitle={catLabel}
      footer={foot} width={460}>
      {ctx && (
        <div style={eBody}>
          <StepRail step={step} labels={['Type', 'Details', 'Review']} />

          {step === 0 && (
            <div style={eBody}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 8 }}>Entry type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {ECATS.map((c) => {
                    const on = cat === c.key;
                    return (
                      <button key={c.key} onClick={() => setCat(c.key)} style={{ display: 'flex', alignItems: 'center', gap: 9,
                        padding: '10px 12px', cursor: 'pointer', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        background: on ? 'var(--brand-tint)' : 'var(--white)', border: '1px solid ' + (on ? 'var(--brand-on-tint)' : 'var(--border-default)'),
                        color: on ? 'var(--brand-on-tint)' : 'var(--text-body)', fontWeight: on ? 700 : 500, fontSize: 'var(--text-sm)' }}>
                        <span style={{ display: 'inline-flex', width: 17, height: 17, flex: 'none' }}><i data-lucide={c.icon}></i></span>{c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <ESel label={window.fieldLabel('House', { tone: 'req', label: 'required' })} value={houseId}
                error={stepErrs && stepErrs.house} options={houses.map((h) => ({ value: h.id, label: h.name }))}
                onChange={(e) => setHouseId(e.target.value)} />
              <window.FieldRow>
                <ESel label="Month" value={String(month)} options={window.MONTH_NAMES.map((m, i) => ({ value: String(i), label: m }))}
                  onChange={(e) => setMonth(+e.target.value)} />
                <EInput label="Year" value={String(year)} disabled readOnly />
              </window.FieldRow>
            </div>
          )}

          {step === 1 && !isMaint && (
            <div style={eBody}>
              <window.AmountField label="Amount" tag={{ tone: 'req', label: 'required' }} value={amount} onChange={setAmount}
                error={stepErrs && stepErrs.amount} autoFocus />
              <window.TextArea label="Notes" tag={{ tone: 'opt', label: 'optional' }} value={notes} onChange={setNotes} placeholder="Anything worth recording" />
            </div>
          )}
          {step === 1 && isMaint && (
            <div style={eBody}>
              <ESel label={window.fieldLabel('Room', { tone: 'opt', label: 'optional' })} value={roomId}
                options={[{ value: '', label: 'Whole house' }, ...((house && house.rooms) || []).map((r) => ({ value: r.id, label: r.unit }))]}
                onChange={(e) => setRoomId(e.target.value)} />
              <window.AmountField label="Amount" tag={{ tone: 'req', label: 'required' }} value={amount} onChange={setAmount}
                error={stepErrs && stepErrs.amount} />
              <EInput label={window.fieldLabel('Description', { tone: 'req', label: 'required' })} value={desc}
                error={stepErrs && stepErrs.desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. HVAC service" />
              <EInput label={window.fieldLabel('Contractor', { tone: 'opt', label: 'optional' })} value={contractor}
                onChange={(e) => setContractor(e.target.value)} placeholder="e.g. PlumbPro Ltd" leadingIcon={<i data-lucide="hard-hat"></i>} />
              <window.TextArea label="Notes" tag={{ tone: 'opt', label: 'optional' }} value={notes} onChange={setNotes} />
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>Review the entry before saving.</div>
              <div>
                <RowKV k="Type" v={catLabel} />
                <RowKV k="House" v={house ? house.name : '—'} />
                <RowKV k="Period" v={window.MONTH_NAMES[month] + ' ' + year} />
                <RowKV k="Amount" v={window.amt2(window.num(amount))} />
                {isMaint && <RowKV k="Room" v={roomId ? ((house.rooms.find((r) => r.id === roomId) || {}).unit || '—') : 'Whole house'} />}
                {isMaint && <RowKV k="Description" v={desc.trim() || '—'} />}
                {isMaint && contractor.trim() ? <RowKV k="Contractor" v={contractor.trim()} /> : null}
                {notes.trim() ? <RowKV k="Notes" v={notes.trim()} /> : null}
              </div>
            </div>
          )}

          <window.FormError>{err}</window.FormError>
        </div>
      )}
    </RightDrawer>
  );
}

/* ---------- file size formatter ---------- */
const fileSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const kindOf = (type) => /pdf/i.test(type) ? 'pdf' : /^image\//i.test(type) ? 'img' : 'other';

/* ============ 5 · Upload Receipt ============ */
function UploadReceiptDrawer({ open, houses, onClose, onUpload }) {
  const [file, setFile] = eS(null);
  const [merchant, setMerchant] = eS('');
  const [cat, setCat] = eS('maint');
  const [houseId, setHouseId] = eS('');
  const [date, setDate] = eS('');
  const [total, setTotal] = eS('');
  const [notes, setNotes] = eS('');
  const [drag, setDrag] = eS(false);
  const [touched, setTouched] = eS(false);
  const [err, setErr] = eS(null);
  const [busy, save] = window.useSaver();
  const inputRef = eR(null);

  window.useOpenReset(open, () => {
    setFile(null); setMerchant(''); setCat('maint'); setHouseId((houses[0] && houses[0].id) || '');
    setDate('2026-06-12'); setTotal(''); setNotes(''); setDrag(false); setTouched(false); setErr(null);
  });
  eE(() => { window.PS.icons(); });

  const take = (f) => {
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
    save(() => onUpload({
      id: 'up' + Math.random().toString(36).slice(2, 7), merchant: merchant.trim(), cat,
      houseId, date: date || '2026-06-12', amount: window.num(total), kind: file.kind, url: file.url, notes: notes.trim(),
    }), 1000);
  };

  return (
    <RightDrawer open={open} onClose={onClose} icon="receipt" title="Upload receipt" subtitle="Add to your receipt library"
      footer={<div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
        {err && !busy ? <span style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--danger-fg)', fontWeight: 600 }}>{err}</span> : <span style={{ flex: 1 }} />}
        <EBtn variant="ghost" onClick={onClose}>Cancel</EBtn>
        <window.SaveCta busy={busy} busyLabel="Uploading…" icon="download" onClick={submit} disabled={!file}>Upload receipt</window.SaveCta>
      </div>}>
      <div style={eBody}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 8 }}>Receipt file</label>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,application/pdf" style={{ display: 'none' }}
            onChange={(e) => take(e.target.files[0])} />
          {!file ? (
            <div onClick={() => inputRef.current && inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '30px 18px', cursor: 'pointer',
                textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1.5px dashed ' + (drag ? 'var(--brand)' : 'var(--border-strong)'),
                background: drag ? 'var(--brand-tint)' : 'var(--surface-sunken)' }}>
              <span style={{ display: 'inline-flex', width: 30, height: 30, color: 'var(--text-faint)' }}><i data-lucide="receipt"></i></span>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
                Drop image here or <span style={{ color: 'var(--brand-on-tint)', fontWeight: 700 }}>browse</span></div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>PNG, JPG or PDF · up to 10 MB</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)', background: 'var(--white)' }}>
              {file.kind === 'img' && file.url
                ? <img src={file.url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flex: 'none' }} />
                : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flex: 'none',
                    borderRadius: 'var(--radius-sm)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide="file-text"></i></span></span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fileSize(file.size)}</div>
              </div>
              <EIcon label="Remove file" variant="ghost" size="sm" onClick={() => setFile(null)}><i data-lucide="x"></i></EIcon>
            </div>
          )}
        </div>
        <EInput label={window.fieldLabel('Merchant', { tone: 'req', label: 'required' })} value={merchant} error={merchErr}
          onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. British Gas" leadingIcon={<i data-lucide="store"></i>} />
        <window.FieldRow>
          <ESel label="Category" value={cat} options={[...ECATS.filter((c) => c.key !== 'loan').map((c) => ({ value: c.key, label: c.label })), { value: 'supplies', label: 'Supplies' }]}
            onChange={(e) => setCat(e.target.value)} />
          <ESel label="House" value={houseId} options={houses.map((h) => ({ value: h.id, label: h.name }))} onChange={(e) => setHouseId(e.target.value)} />
        </window.FieldRow>
        <window.FieldRow>
          <EInput label="Issue date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <window.AmountField label="Total amount" tag={{ tone: 'opt', label: 'optional' }} value={total} onChange={setTotal} />
        </window.FieldRow>
        <window.TextArea label="Notes" tag={{ tone: 'opt', label: 'optional' }} value={notes} onChange={setNotes} />
      </div>
    </RightDrawer>
  );
}

/* ---------- receipt type chip ---------- */
function KindChip({ kind }) {
  const map = { pdf: { l: 'PDF', c: 'var(--red-400)' }, img: { l: 'IMG', c: 'var(--blue-400)' } };
  const m = map[kind] || { l: '—', c: 'var(--text-faint)' };
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 999, fontSize: '11px', fontWeight: 700,
    letterSpacing: 0.3, color: m.c, background: 'color-mix(in srgb, ' + m.c + ' 14%, transparent)' }}>{m.l}</span>;
}

/* ============ 6 · Receipt Picker ============ */
function ReceiptPickerDialog({ ctx, receipts, onClose, onPick, onUpload }) {
  const open = !!ctx;
  const [loading, setLoading] = eS(true);
  const [q, setQ] = eS('');
  const [linking, setLinking] = eS(null);
  window.useOpenReset(open, () => { setLoading(true); setQ(''); setLinking(null); });
  eE(() => {
    if (!open) return;
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, [open]);
  eE(() => { window.PS.icons(); });

  const list = (receipts || []).filter((r) => r.merchant.toLowerCase().includes(q.trim().toLowerCase()));
  const pick = (r) => { setLinking(r.id); setTimeout(() => onPick(r), 700); };

  return (
    <RightDrawer open={open} onClose={onClose} title="Attach receipt" subtitle={ctx ? ctx.label : ''}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <EInput placeholder="Search by merchant" value={q} onChange={(e) => setQ(e.target.value)} leadingIcon={<i data-lucide="search"></i>} />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 13px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, padding: '38px 18px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-sunken)', color: 'var(--text-faint)' }}><span style={{ display: 'inline-flex', width: 23, height: 23 }}><i data-lucide="image-off"></i></span></span>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>No unlinked receipts</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: 240 }}>Nothing matches for this property. Upload a receipt to attach it here.</div>
            <EBtn variant="ghost" leadingIcon={<i data-lucide="upload"></i>} onClick={onUpload}>Upload a receipt</EBtn>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: linking ? 'none' : 'auto', opacity: linking ? 0.65 : 1 }}>
            {list.map((r) => (
              <button key={r.id} onClick={() => pick(r)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', cursor: 'pointer',
                textAlign: 'left', borderRadius: 'var(--radius-md)', background: 'var(--white)', border: '1px solid var(--border-default)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--white)'; }}>
                <KindChip kind={r.kind} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{r.merchant}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.date}</div>
                </div>
                {linking === r.id
                  ? <window.BtnSpin />
                  : <span className="ps-mono" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{window.money(r.amount)}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </RightDrawer>
  );
}

/* faux scanned-document preview (no real asset files) */
function FauxReceipt({ r }) {
  if (!r || r.kind === 'other' || r.kind === 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: '100%', color: 'var(--text-faint)' }}>
        <span style={{ display: 'inline-flex', width: 34, height: 34 }}><i data-lucide={r && r.kind === 'none' ? 'file-x' : 'image-off'}></i></span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{r && r.kind === 'none' ? 'No file attached' : 'No preview available'}</span>
      </div>
    );
  }
  if (r.kind === 'img' && r.url) {
    return <img src={r.url} alt="" style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }} />;
  }
  return (
    <div style={{ position: 'relative', width: 230, maxWidth: '88%', margin: '0 auto', background: '#fff', color: '#1a1a1a',
      borderRadius: 6, boxShadow: '0 10px 30px rgba(0,0,0,0.22)', padding: '20px 20px 26px', fontFamily: 'var(--font-sans)' }}>
      {r.kind === 'pdf' ? <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 800, color: '#D23A40', letterSpacing: 0.5 }}>PDF</span> : null}
      <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>{r.merchant}</div>
      <div style={{ textAlign: 'center', fontSize: 10, color: '#888', marginTop: 2 }}>{r.date}</div>
      <div style={{ borderTop: '1px dashed #ccc', margin: '14px 0 10px' }} />
      {[['Subtotal', r.amount * 0.83], ['Tax', r.amount * 0.17]].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444', padding: '3px 0' }}>
          <span>{k}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{window.money(v)}</span></div>
      ))}
      <div style={{ borderTop: '1px solid #222', margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
        <span>TOTAL</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{window.money(r.amount)}</span></div>
      <div style={{ textAlign: 'center', fontSize: 9, color: '#aaa', marginTop: 16, letterSpacing: 1 }}>· · · · · · · · · · · ·</div>
    </div>
  );
}

/* ============ 7 · Receipt Viewer ============ */
function ReceiptViewerDialog({ ctx, onClose, onUnlink }) {
  const open = !!ctx;
  const r = ctx ? ctx.receipt : null;
  const fromEntry = ctx && ctx.entryId;
  const [confirm, setConfirm] = eS(false);
  const [busy, setBusy] = eS(false);
  window.useOpenReset(open, () => { setConfirm(false); setBusy(false); });
  eE(() => { window.PS.icons(); });
  if (!open) return null;

  const unlink = () => {
    if (!confirm) { setConfirm(true); return; }
    setBusy(true); setTimeout(() => onUnlink(ctx), 750);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(24,28,26,0.32)' }}></div>
      <div className="ps-drawer-panel" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 480,
        background: 'var(--surface-card)', borderLeft: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.merchant}</span>
            <EBadge tone="neutral" size="sm">{CAT_LABEL[r.cat] || 'Other'}</EBadge>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            <EIcon label="Open in new tab" variant="ghost" size="sm" onClick={() => r.url && window.open(r.url, '_blank')}><i data-lucide="external-link"></i></EIcon>
            <EIcon label="Download" variant="ghost" size="sm"><i data-lucide="download"></i></EIcon>
            <EIcon label="Close" variant="ghost" size="sm" onClick={onClose}><i data-lucide="x"></i></EIcon>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, background: 'var(--surface-sunken)' }}>
          <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FauxReceipt r={r} />
          </div>
          <div style={{ marginTop: 18, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{r.dateLong || r.date}</span>
              <span className="ps-mono" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--brand-on-tint)' }}>{window.money(r.amount)}</span>
            </div>
            {r.notes ? <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)', color: 'var(--text-body)', lineHeight: 1.5 }}>{r.notes}</div> : null}
          </div>
        </div>
        {fromEntry ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 18px', borderTop: '1px solid var(--border-subtle)' }}>
            <EBtn variant={confirm ? 'danger' : 'danger-soft'} disabled={busy}
              leadingIcon={busy ? <window.BtnSpin /> : <i data-lucide={confirm ? 'alert-triangle' : 'unlink'}></i>} onClick={unlink}>
              {busy ? 'Unlinking…' : confirm ? 'Confirm unlink' : 'Unlink from entry'}</EBtn>
          </div>
        ) : null}
      </div>
    </div>
  );
}

Object.assign(window, {
  ECATS, CAT_LABEL, EntryWizard, UploadReceiptDrawer, ReceiptPickerDialog, ReceiptViewerDialog, KindChip, fileSize, kindOf,
});
