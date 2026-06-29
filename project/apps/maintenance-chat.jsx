/* Maintenance Scheduler — "Add a schedule with chat".
   A conversational modal that captures a maintenance schedule in three
   questions: (1) what's the task, (2) prep steps (AI-drafted, editable),
   (3) how long it takes and when it starts. Hands the finished task back to
   the host via onComplete(task); the host owns the write.
   Loaded after React, the DS bundle, ps-common.js, ps-ui.jsx and
   maintenance-data.js. Exports window.MaintenanceChat. */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const CDS = window.MaintenanceSchedulerDesignSystem_02479c;
  const { Button, Card, Checkbox } = CDS;
  const MS_DAY = 86400000;

  /* ---------- task classifier: icon, tint, cadence + suggested prep ---------- */
  const RULES = [
    { re: /(lawn|mow|grass|hedge|garden|weed)/, icon: 'sprout', tint: 'var(--green-500)', recurrence: 'Monthly',
      prep: ['Fuel & oil for the mower', 'Check the blade is sharp', 'Clear toys & debris from the lawn'] },
    { re: /(smoke|co alarm|carbon)/, icon: 'bell-ring', tint: 'var(--red-500)', recurrence: 'Quarterly',
      prep: ['Spare 9V batteries', 'Test card / log sheet'] },
    { re: /(boiler|heating)/, icon: 'flame', tint: 'var(--amber-400)', recurrence: 'Monthly',
      prep: ['Service kit & spares', 'Carbon-monoxide tester', 'Notify tenant of visit'] },
    { re: /(gutter|downpipe|drain)/, icon: 'droplets', tint: 'var(--blue-400)', recurrence: 'Quarterly',
      prep: ['Ladder & stabiliser', 'Gloves & scoop', 'Garden waste sack'] },
    { re: /(gas|cp12)/, icon: 'shield-check', tint: 'var(--green-500)', recurrence: 'Monthly',
      prep: ['Gas analyser', 'CP12 certificate pad', 'Confirm engineer Gas-Safe ID'] },
    { re: /(ac|air con|filter|hvac|vent)/, icon: 'wind', tint: 'var(--blue-400)', recurrence: 'Monthly',
      prep: ['Correct filter size', 'Vacuum & cloth'] },
    { re: /(radiator|bleed)/, icon: 'thermometer', tint: 'var(--amber-400)', recurrence: 'Quarterly',
      prep: ['Radiator key', 'Towel & catch tray'] },
    { re: /(eicr|electric|fuse|wiring|pat)/, icon: 'zap', tint: 'var(--amber-400)', recurrence: 'Quarterly',
      prep: ['Multifunction tester', 'EICR schedule forms', 'Notify tenant — power off'] },
    { re: /(emergency light|exit light)/, icon: 'lightbulb', tint: 'var(--green-500)', recurrence: 'Monthly',
      prep: ['Test key / switch', 'Log book'] },
    { re: /(paint|decorat|render)/, icon: 'paint-roller', tint: 'var(--amber-400)', recurrence: 'Quarterly',
      prep: ['Dust sheets', 'Filler & sandpaper', 'Brushes & rollers', 'Matching paint'] },
    { re: /(pest|bug|mouse|rodent|infest)/, icon: 'bug', tint: 'var(--red-500)', recurrence: 'Quarterly',
      prep: ['Bait / traps', 'Gloves & mask', 'Seal entry points'] },
    { re: /(window|glaz|clean)/, icon: 'spray-can', tint: 'var(--blue-400)', recurrence: 'Monthly',
      prep: ['Cleaning solution', 'Squeegee & cloths', 'Ladder for upper floors'] },
    { re: /(plumb|leak|tap|pipe|water)/, icon: 'droplets', tint: 'var(--blue-400)', recurrence: 'Quarterly',
      prep: ['Wrench set', 'Replacement washers', 'Bucket & towels'] },
    { re: /(lock|door|security|alarm)/, icon: 'shield-check', tint: 'var(--slate-500, var(--gray-500))', recurrence: 'Quarterly',
      prep: ['Spare keys / fobs', 'Lubricant spray', 'Screwdriver set'] },
  ];
  function classify(name) {
    const n = (name || '').toLowerCase();
    const hit = RULES.find((r) => r.re.test(n));
    if (hit) return { icon: hit.icon, tint: hit.tint, recurrence: hit.recurrence, prep: hit.prep.slice() };
    return { icon: 'wrench', tint: 'var(--green-500)', recurrence: 'Monthly',
      prep: ['Tools for the job', 'Replacement parts / consumables', 'Notify tenant if access is needed'] };
  }

  const today = () => new Date().toISOString().slice(0, 10);
  const startLabel = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    const days = Math.round((d - new Date(today() + 'T00:00:00')) / MS_DAY);
    if (days <= 0) return 'today';
    if (days === 1) return 'tomorrow';
    return 'on ' + d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  const dueFrom = (iso) => Math.round((new Date(iso + 'T00:00:00') - new Date(today() + 'T00:00:00')) / MS_DAY);

  /* ---------- chat chrome ---------- */
  function Orb({ size = 28 }) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        width: size, height: size, borderRadius: '50%', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
        <span style={{ display: 'inline-flex', width: size * 0.5, height: size * 0.5 }}><i data-lucide="sparkles"></i></span>
      </span>
    );
  }
  function Typing() {
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Orb />
        <div style={{ padding: '13px 15px', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', display: 'flex', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-faint)',
              animation: `mcd 1.2s ${i * 0.15}s infinite ease-in-out` }} />
          ))}
        </div>
      </div>
    );
  }
  function AiBubble({ children }) {
    return (
      <div className="mc-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Orb />
        <div style={{ flex: '0 1 auto', width: 'max-content', maxWidth: '82%', padding: '10px 13px', background: 'var(--surface-card)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-body)', fontSize: 'var(--text-base)', lineHeight: 1.55, overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    );
  }
  function UserBubble({ children }) {
    return (
      <div className="mc-in" style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-block', textAlign: 'left', width: 'max-content', maxWidth: '82%', padding: '10px 13px',
          background: 'var(--brand)', color: 'var(--text-on-brand)', borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-base)', lineHeight: 1.5, fontWeight: 500, overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    );
  }

  /* ---------- step 1: task name input ---------- */
  const NAME_CHIPS = ['Lawn mowing', 'Smoke alarm check', 'Boiler maintenance', 'Gutter clearing', 'Gas safety check'];
  function NameInput({ initial, error, onSubmit }) {
    const [val, setVal] = useState(initial || '');
    const ref = useRef(null);
    useEffect(() => { if (ref.current) ref.current.focus(); window.PS.iconsSoon(); }, []);
    const submit = () => onSubmit(val);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 2 }}>
          {NAME_CHIPS.map((c) => (
            <button key={c} type="button" onClick={() => onSubmit(c)}
              style={{ flex: 'none', padding: '7px 13px', cursor: 'pointer', background: 'var(--surface-card)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)', whiteSpace: 'nowrap' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 13px',
              background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (error ? 'var(--danger-solid)' : 'var(--border-strong)'), boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}>
                <i data-lucide="wrench"></i>
              </span>
              <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
                placeholder="e.g. Boiler maintenance"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-heading)' }} />
            </div>
            {error ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--danger-fg)' }}>
                <span style={{ display: 'inline-flex', width: 13, height: 13 }}><i data-lucide="alert-circle"></i></span>{error}
              </span>
            ) : null}
          </div>
          <Button variant="primary" size="lg" onClick={submit} aria-label="Send">
            <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide="arrow-up"></i></span>
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- step 2: AI-drafted prep steps (editable) ---------- */
  function PrepCard({ meta, initial, onConfirm }) {
    const seed = (initial && initial.length ? initial : meta.prep).map((p, i) => ({
      id: 'p' + i, label: typeof p === 'string' ? p : p.label, on: true,
    }));
    const [items, setItems] = useState(seed);
    const [draft, setDraft] = useState('');
    const idRef = useRef(seed.length);
    useEffect(() => { window.PS.iconsSoon(); }, [items, draft]);
    const toggle = (id) => setItems((xs) => xs.map((x) => x.id === id ? { ...x, on: !x.on } : x));
    const remove = (id) => setItems((xs) => xs.filter((x) => x.id !== id));
    const add = () => { const v = draft.trim(); if (!v) return; setItems((xs) => [...xs, { id: 'p' + (++idRef.current), label: v, on: true }]); setDraft(''); };
    const chosen = items.filter((x) => x.on);
    return (
      <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--brand)' }}><i data-lucide="sparkles"></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Suggested prep</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>Untick anything you don’t need, or add your own.</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((it) => (
            <div key={it.id} className="mc-prep-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ flex: 1, minWidth: 0, opacity: it.on ? 1 : 0.5 }}>
                <Checkbox checked={it.on} onChange={() => toggle(it.id)} label={it.label} />
              </span>
              <button type="button" onClick={() => remove(it.id)} aria-label="Remove"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, flex: 'none',
                  cursor: 'pointer', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-faint)' }}>
                <span style={{ display: 'inline-flex', width: 15, height: 15 }}><i data-lucide="x"></i></span>
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-faint)', flex: 'none' }}><i data-lucide="plus"></i></span>
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="Add a supply or step…"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }} />
        </div>
        <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => onConfirm(chosen.map((x) => ({ label: x.label })))}
            leadingIcon={<i data-lucide="check"></i>}>
            {chosen.length ? `Use these ${chosen.length} ${chosen.length === 1 ? 'step' : 'steps'}` : 'Continue without prep'}
          </Button>
        </div>
      </Card>
    );
  }

  /* ---------- step 3: duration + start ---------- */
  const DURATIONS = [10, 20, 30, 45, 60, 90];
  const START_CHIPS = [{ label: 'Today', d: 0 }, { label: 'In 3 days', d: 3 }, { label: 'Next week', d: 7 }, { label: 'Next month', d: 30 }];
  function TimingCard({ initial, onConfirm }) {
    const [dur, setDur] = useState(initial ? initial.durationMin : 30);
    const [start, setStart] = useState(initial ? initial.startDate : today());
    useEffect(() => { window.PS.iconsSoon(); }, [dur, start]);
    const isoFor = (d) => { const x = new Date(today() + 'T00:00:00'); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
    return (
      <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '13px 16px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Time & start</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>Roughly how long, and when it should kick off.</div>
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 9 }}>How long does it take?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DURATIONS.map((m) => {
                const on = dur === m;
                return (
                  <button key={m} type="button" onClick={() => setDur(m)} style={{ padding: '8px 14px', cursor: 'pointer',
                    borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', fontWeight: 600,
                    border: '1px solid ' + (on ? 'var(--brand)' : 'var(--border-default)'),
                    background: on ? 'var(--brand-tint)' : 'var(--surface-card)',
                    color: on ? 'var(--brand-on-tint)' : 'var(--text-body)' }}>{m} min</button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 9 }}>When does it start?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {START_CHIPS.map((c) => {
                const iso = isoFor(c.d);
                const on = start === iso;
                return (
                  <button key={c.label} type="button" onClick={() => setStart(iso)} style={{ padding: '8px 14px', cursor: 'pointer',
                    borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', fontWeight: 600,
                    border: '1px solid ' + (on ? 'var(--brand)' : 'var(--border-default)'),
                    background: on ? 'var(--brand-tint)' : 'var(--surface-card)',
                    color: on ? 'var(--brand-on-tint)' : 'var(--text-body)' }}>{c.label}</button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 13px',
              background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}>
              <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-faint)', flex: 'none' }}><i data-lucide="calendar"></i></span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="primary" size="lg" fullWidth leadingIcon={<i data-lucide="arrow-right"></i>}
            onClick={() => onConfirm({ durationMin: dur, startDate: start, dueInDays: dueFrom(start) })}>
            Review schedule
          </Button>
        </div>
      </Card>
    );
  }

  /* ---------- confirmation ---------- */
  function ConfirmCard({ answers, saving, onEdit, onConfirm }) {
    const prepCount = answers.prep.length;
    const rows = [
      { key: 'name', icon: answers.meta.icon, label: 'Task', value: answers.name },
      { key: 'prep', icon: 'clipboard-check', label: 'Prep steps', value: prepCount ? `${prepCount} ${prepCount === 1 ? 'step' : 'steps'}` : 'None' },
      { key: 'timing', icon: 'clock', label: 'Time & start', value: `${answers.durationMin} min · starts ${startLabel(answers.startDate)}` },
      { key: 'cadence', icon: 'repeat', label: 'Repeats', value: answers.recurrence, plain: true },
    ];
    useEffect(() => { window.PS.iconsSoon(); }, [saving]);
    return (
      <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Quick check</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Tap a row to fix it before we add it to the schedule.</div>
        </div>
        <div>
          {rows.map((r) => (
            <button key={r.key} type="button" onClick={() => !r.plain && onEdit(r.key)} disabled={saving || r.plain}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                padding: '12px 16px', border: 'none', borderTop: '1px solid var(--border-subtle)',
                background: 'transparent', cursor: (saving || r.plain) ? 'default' : 'pointer' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flex: 'none',
                borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide={r.icon}></i></span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-heading)', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</div>
              </div>
              {!r.plain ? (
                <span style={{ display: 'inline-flex', width: 15, height: 15, color: 'var(--text-faint)', flex: 'none' }}><i data-lucide="pencil"></i></span>
              ) : null}
            </button>
          ))}
        </div>
        <div style={{ padding: 13 }}>
          <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={onConfirm}
            leadingIcon={<i data-lucide={saving ? 'loader' : 'plus'}></i>}>
            {saving ? 'Adding to schedule…' : 'Add to schedule'}
          </Button>
        </div>
      </Card>
    );
  }

  /* ---------- root ---------- */
  function MaintenanceChat({ propId, propName, onClose, onComplete }) {
    const [log, setLog] = useState([]);
    const [phase, setPhase] = useState('intro'); // intro | name | prep | timing | confirm | saving | done
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({ name: '', meta: classify(''), prep: [], durationMin: 30, startDate: today(), dueInDays: 0, recurrence: 'Monthly' });
    const scroller = useRef(null);
    const idRef = useRef(0);
    const timers = useRef([]);
    const nid = () => 'm' + (++idRef.current);
    const push = useCallback((role, text) => setLog((l) => [...l, { id: nid(), role, text }]), []);

    useEffect(() => {
      setTyping(true);
      const t1 = setTimeout(() => {
        push('ai', `Let’s schedule some maintenance for ${propName || 'this property'}. Three quick questions and I’ll set it up.`);
        const t2 = setTimeout(() => { push('ai', 'First — what’s the task?'); setTyping(false); setPhase('name'); }, 950);
        timers.current.push(t2);
      }, 700);
      timers.current.push(t1);
      return () => timers.current.forEach(clearTimeout);
    }, []);

    useEffect(() => { const s = scroller.current; if (s) s.scrollTop = s.scrollHeight; window.PS.icons(); }, [log, typing, phase, error]);
    useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

    const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); };

    const submitName = (raw) => {
      const name = String(raw || '').trim();
      if (name.length < 2) { setError('Give the task a name to continue.'); return; }
      setError(null);
      const meta = classify(name);
      push('user', name);
      setAnswers((a) => ({ ...a, name, meta, recurrence: meta.recurrence, prep: a.prep.length ? a.prep : meta.prep.map((l) => ({ label: l })) }));
      setTyping(true);
      after(700, () => {
        push('ai', `“${name}” — got it. Based on that, here are some prep steps I’d line up.`);
        setTyping(false); setPhase('prep');
      });
    };

    const confirmPrep = (prep) => {
      setAnswers((a) => ({ ...a, prep }));
      push('user', prep.length ? `${prep.length} ${prep.length === 1 ? 'prep step' : 'prep steps'}` : 'No prep needed');
      setTyping(true);
      after(650, () => {
        push('ai', 'Nice. Last one — how long does it take, and when should it start?');
        setTyping(false); setPhase('timing');
      });
    };

    const confirmTiming = ({ durationMin, startDate, dueInDays }) => {
      setAnswers((a) => ({ ...a, durationMin, startDate, dueInDays }));
      push('user', `${durationMin} min · starts ${startLabel(startDate)}`);
      setTyping(true);
      after(650, () => { push('ai', 'Perfect — that’s everything. Here’s the schedule.'); setTyping(false); setPhase('confirm'); });
    };

    const editField = (key) => {
      setError(null);
      if (key === 'name') { push('ai', 'Sure — what’s the task?'); setPhase('name'); }
      else if (key === 'prep') { push('ai', 'No problem — adjust the prep steps below.'); setPhase('prep'); }
      else if (key === 'timing') { push('ai', 'Of course — set the time and start.'); setPhase('timing'); }
    };

    const confirmSave = () => {
      setPhase('saving');
      after(550, () => {
        const a = answers;
        onComplete({
          name: a.name, icon: a.meta.icon, tint: a.meta.tint, recurrence: a.recurrence,
          durationMin: a.durationMin, bucket: a.durationMin < 20 ? 'quick' : 'long',
          property: propId, dueInDays: a.dueInDays, startDate: a.startDate,
          prep: a.prep.map((p, i) => ({ id: 'p' + i, label: p.label, done: false })),
        });
      });
    };

    const order = { intro: 0, name: 0, prep: 1, timing: 2, confirm: 3, saving: 3, done: 4 };
    const TOTAL = 4;
    const progress = (order[phase] || 0) / TOTAL;
    const stepNo = Math.min((order[phase] || 0) + 1, TOTAL);
    const saving = phase === 'saving';

    return (
      <div className="mc-overlay" onMouseDown={onClose}>
        <div className="mc-card ps-fade" onMouseDown={(e) => e.stopPropagation()}>
          <header className="mc-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="assets/logo-mark.svg" width="26" height="26" alt="" />
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Add a schedule</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>Step {stepNo} of {TOTAL}</span>
              <button type="button" onClick={onClose} aria-label="Close"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, flex: 'none',
                  cursor: 'pointer', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide="x"></i></span>
              </button>
            </div>
          </header>
          <div className="mc-progress"><span style={{ width: (progress * 100).toFixed(1) + '%' }} /></div>

          <div ref={scroller} className="mc-chat">
            {log.map((m) => m.role === 'ai' ? <AiBubble key={m.id}>{m.text}</AiBubble> : <UserBubble key={m.id}>{m.text}</UserBubble>)}
            {typing ? <Typing /> : null}
            {phase === 'prep' ? <PrepCard meta={answers.meta} initial={answers.prep} onConfirm={confirmPrep} /> : null}
            {phase === 'timing' ? <TimingCard initial={{ durationMin: answers.durationMin, startDate: answers.startDate }} onConfirm={confirmTiming} /> : null}
            {(phase === 'confirm' || saving) ? <ConfirmCard answers={answers} saving={saving} onEdit={editField} onConfirm={confirmSave} /> : null}
          </div>

          {phase === 'name' ? (
            <div className="mc-dock">
              <NameInput initial={answers.name} error={error} onSubmit={submitName} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!document.getElementById('mc-style')) {
    const s = document.createElement('style');
    s.id = 'mc-style';
    s.textContent = `
      @keyframes mcd{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
      @keyframes mcpop{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:none}}
      .mc-in{animation:mcpop var(--dur-base,200ms) var(--ease-out) both;}
      .mc-overlay{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;
        padding:20px;background:rgba(24,28,26,0.32);backdrop-filter:blur(3px);}
      .mc-card{display:flex;flex-direction:column;width:100%;max-width:460px;height:600px;max-height:92dvh;
        background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);
        box-shadow:var(--shadow-pop);overflow:hidden;animation:mcpop 240ms var(--ease-out) both;}
      .mc-top{flex:none;display:flex;align-items:center;justify-content:space-between;
        padding:14px 18px;border-bottom:1px solid var(--border-subtle);}
      .mc-progress{flex:none;height:3px;background:var(--surface-sunken);}
      .mc-progress span{display:block;height:100%;background:var(--brand);border-radius:0 999px 999px 0;
        transition:width var(--dur-slow) var(--ease-out);}
      .mc-chat{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:13px;
        padding:20px 18px;background:var(--surface-page);}
      .mc-chat > *{flex-shrink:0;}
      .mc-dock{flex:none;padding:13px 18px;border-top:1px solid var(--border-subtle);background:var(--surface-card);}
      .mc-prep-row label, .mc-prep-row label span{text-decoration:none !important;}
      @media (max-width:520px){.mc-overlay{padding:0;}.mc-card{max-width:none;height:100dvh;max-height:none;border:none;border-radius:0;}}
    `;
    document.head.appendChild(s);
  }

  window.MaintenanceChat = MaintenanceChat;
})();
