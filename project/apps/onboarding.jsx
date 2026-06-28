/* Property Suite — conversational onboarding chat.
   Greets a brand-new (no-data) landlord and collects their first property via a
   chat flow, then writes it to localStorage (mock Firestore) and sends them to
   the Rent Tracker dashboard. Loaded after React, the DS bundle, ps-common.js
   and ps-ui.jsx. Self-contained in an IIFE. */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const ODS = window.MaintenanceSchedulerDesignSystem_02479c;
  const { Button, Card } = ODS;

  const sym = () => window.PS.Currency.symbol();
  const grp = (n) => Number(n || 0).toLocaleString();

  /* ---------- question script ---------- */
  const STEPS = [
    {
      key: 'name', icon: 'building-2', kind: 'text',
      q: "First up \u2014 what should we call this property?",
      placeholder: 'e.g. Main Street House',
      chips: ['Main Street House', 'Maple Court', 'Riverside Flat'],
      ack: (v) => `\u201C${v}\u201D \u2014 love it.`,
      bubble: (v) => v,
      validate: (v) => (v.trim().length < 2 ? 'Give your property a name to continue.' : null),
    },
    {
      key: 'address', icon: 'map-pin', kind: 'text',
      q: "Where is it? Add the full address.",
      placeholder: 'e.g. 14 Main Street, Springfield',
      ack: () => 'Got the address saved.',
      bubble: (v) => v,
      validate: (v) => (v.trim().length < 4 ? 'Add an address so you can find it later.' : null),
    },
    {
      key: 'units', icon: 'door-open', kind: 'number',
      q: "How many rooms or units does it have to let?",
      placeholder: 'Number of units',
      chips: ['1', '2', '3', '4', '5'],
      ack: (v) => `${v} ${Number(v) === 1 ? 'unit' : 'units'} \u2014 nice portfolio start.`,
      bubble: (v) => `${v} ${Number(v) === 1 ? 'unit' : 'units'}`,
      validate: (v) => {
        const n = Number(v);
        if (!v || !Number.isFinite(n) || n < 1) return 'Enter at least 1 unit.';
        if (!Number.isInteger(n)) return 'Use a whole number of units.';
        if (n > 200) return 'That\u2019s a lot \u2014 enter 200 or fewer.';
        return null;
      },
    },
    {
      key: 'rent', icon: 'wallet', kind: 'currency',
      q: "And the monthly rent for each unit?",
      placeholder: '0',
      ack: (v) => `${sym()}${grp(v)} per unit, each month. That\u2019s everything I need.`,
      bubble: (v) => `${sym()}${grp(v)} / month`,
      validate: (v) => {
        const n = Number(v);
        if (!v || !Number.isFinite(n) || n <= 0) return 'Enter the monthly rent.';
        if (n > 1000000) return 'That looks too high \u2014 check the amount.';
        return null;
      },
    },
  ];
  const TOTAL = STEPS.length + 1; // questions + confirmation

  /* ---------- assistant orb ---------- */
  function Orb({ size = 30 }) {
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
        <div style={{ padding: '14px 16px', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', display: 'flex', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-faint)',
              animation: `ob-dot 1.2s ${i * 0.15}s infinite ease-in-out` }} />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- chat bubbles ---------- */
  function AiBubble({ children }) {
    return (
      <div className="ob-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Orb />
        <div style={{ flex: '0 1 auto', width: 'max-content', maxWidth: '78%', padding: '11px 14px', background: 'var(--surface-card)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-body)', fontSize: 'var(--text-base)', lineHeight: 1.55, overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    );
  }

  function UserBubble({ children }) {
    return (
      <div className="ob-in" style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-block', textAlign: 'left', width: 'max-content', maxWidth: '78%', padding: '11px 14px', background: 'var(--brand)', color: 'var(--text-on-brand)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', lineHeight: 1.5, fontWeight: 500, overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    );
  }

  /* ---------- inline answer input ---------- */
  function AnswerInput({ step, error, onSubmit }) {
    const [val, setVal] = useState('');
    const ref = useRef(null);
    useEffect(() => { setVal(''); if (ref.current) ref.current.focus(); window.PS.iconsSoon(); }, [step.key]);

    const numeric = step.kind === 'number' || step.kind === 'currency';
    const submit = () => onSubmit(val);
    const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.chips ? (
          <div className="ps-scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
            {step.chips.map((c) => (
              <button key={c} type="button" onClick={() => onSubmit(c)}
                style={{ flex: 'none', padding: '8px 14px', cursor: 'pointer', background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)', whiteSpace: 'nowrap' }}>
                {numeric ? c : c}
              </button>
            ))}
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 14px',
              background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (error ? 'var(--danger-solid)' : 'var(--border-strong)'),
              boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}>
                <i data-lucide={step.icon}></i>
              </span>
              {step.kind === 'currency' ? (
                <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', fontWeight: 600 }}>{sym()}</span>
              ) : null}
              <input
                ref={ref}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={onKey}
                placeholder={step.placeholder}
                type={numeric ? 'number' : 'text'}
                inputMode={numeric ? 'numeric' : 'text'}
                min={numeric ? '0' : undefined}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-heading)' }}
              />
            </div>
            {error ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--danger-fg)' }}>
                <span style={{ display: 'inline-flex', width: 13, height: 13 }}><i data-lucide="alert-circle"></i></span>
                {error}
              </span>
            ) : null}
          </div>
          <Button variant="primary" size="lg" onClick={submit} aria-label="Send answer">
            <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide="arrow-up"></i></span>
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- confirmation summary ---------- */
  function ConfirmCard({ answers, saving, onEdit, onConfirm }) {
    const rows = [
      { key: 'name', icon: 'building-2', label: 'Property', value: answers.name },
      { key: 'address', icon: 'map-pin', label: 'Address', value: answers.address },
      { key: 'units', icon: 'door-open', label: 'Units', value: `${answers.units} ${Number(answers.units) === 1 ? 'unit' : 'units'}` },
      { key: 'rent', icon: 'wallet', label: 'Rent / unit', value: `${sym()}${grp(answers.rent)} per month` },
    ];
    const monthly = Number(answers.units || 0) * Number(answers.rent || 0);
    useEffect(() => { window.PS.iconsSoon(); }, [saving]);
    return (
      <Card className="ob-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Quick check</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Tap any row to fix it before we create your dashboard.</div>
        </div>
        <div>
          {rows.map((r) => (
            <button key={r.key} type="button" onClick={() => onEdit(r.key)} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                padding: '13px 18px', border: 'none', borderTop: '1px solid var(--border-subtle)',
                background: 'transparent', cursor: saving ? 'default' : 'pointer' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34,
                flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', width: 17, height: 17 }}><i data-lucide={r.icon}></i></span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-heading)', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</div>
              </div>
              <span style={{ display: 'inline-flex', width: 15, height: 15, color: 'var(--text-faint)', flex: 'none' }}>
                <i data-lucide="pencil"></i>
              </span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '13px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--brand-tint)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-on-tint)', fontWeight: 600 }}>Projected monthly income</span>
          <span style={{ fontSize: 'var(--text-lg)', color: 'var(--brand-on-tint)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {sym()}{grp(monthly)}
          </span>
        </div>
        <div style={{ padding: 14 }}>
          <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={onConfirm}
            leadingIcon={<i data-lucide={saving ? 'loader' : 'check'}></i>}>
            {saving ? 'Creating your dashboard\u2026' : 'Looks good \u2014 create my dashboard'}
          </Button>
        </div>
      </Card>
    );
  }

  /* ---------- root ---------- */
  const GREETING = "Welcome to Property Suite! I\u2019m here to get your first property set up. It takes about a minute \u2014 answer a few quick questions and your dashboard will be ready.";

  function Onboarding() {
    const [log, setLog] = useState([]);            // [{ id, role:'ai'|'user', text }]
    const [answers, setAnswers] = useState({});
    const [stepIndex, setStepIndex] = useState(0); // 0..STEPS.length-1 while asking
    const [phase, setPhase] = useState('intro');   // intro | asking | confirm | saving | done
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false); // re-asking from confirm
    const scroller = useRef(null);
    const idRef = useRef(0);
    const timers = useRef([]);
    const nid = () => 'm' + (++idRef.current);

    const push = useCallback((role, text) => setLog((l) => [...l, { id: nid(), role, text }]), []);

    // opening sequence
    useEffect(() => {
      setTyping(true);
      const t1 = setTimeout(() => {
        push('ai', GREETING);
        const t2 = setTimeout(() => {
          push('ai', STEPS[0].q);
          setTyping(false);
          setPhase('asking');
        }, 1100);
        timers.current.push(t2);
      }, 900);
      timers.current.push(t1);
      return () => timers.current.forEach(clearTimeout);
    }, []);

    useEffect(() => {
      const s = scroller.current;
      if (s) s.scrollTop = s.scrollHeight;
      window.PS.icons();
    }, [log, typing, phase, error]);

    const answeredCount = Object.keys(answers).length;
    const stepNo = phase === 'confirm' || phase === 'saving' || phase === 'done'
      ? TOTAL : Math.min(answeredCount + 1, STEPS.length);
    const progress = phase === 'done' ? 1
      : (phase === 'confirm' || phase === 'saving' ? (TOTAL - 1) / TOTAL : answeredCount / TOTAL);

    const askConfirm = () => {
      setTyping(true);
      const t = setTimeout(() => {
        setTyping(false);
        setPhase('confirm');
      }, 800);
      timers.current.push(t);
    };

    const submitAnswer = (raw) => {
      const step = STEPS[stepIndex];
      const value = typeof raw === 'string' ? raw : String(raw);
      const err = step.validate(value);
      if (err) { setError(err); return; }
      setError(null);
      const clean = value.trim();
      push('user', step.bubble(clean));
      setAnswers((a) => ({ ...a, [step.key]: clean }));

      setTyping(true);
      const t = setTimeout(() => {
        push('ai', step.ack(clean));
        const isLast = stepIndex >= STEPS.length - 1;
        if (isLast) {
          setTyping(false);
          askConfirm();
        } else {
          const next = stepIndex + 1;
          const t2 = setTimeout(() => {
            push('ai', STEPS[next].q);
            setStepIndex(next);
            setTyping(false);
          }, 650);
          timers.current.push(t2);
        }
      }, 700);
      timers.current.push(t);
    };

    // editing a single field from the confirm screen
    const editField = (key) => {
      const idx = STEPS.findIndex((s) => s.key === key);
      setEditing(true);
      setError(null);
      setPhase('asking');
      setStepIndex(idx);
      push('ai', `Sure \u2014 ${STEPS[idx].q.charAt(0).toLowerCase()}${STEPS[idx].q.slice(1)}`);
    };

    const submitEdit = (raw) => {
      const step = STEPS[stepIndex];
      const value = String(raw);
      const err = step.validate(value);
      if (err) { setError(err); return; }
      setError(null);
      const clean = value.trim();
      push('user', step.bubble(clean));
      setAnswers((a) => ({ ...a, [step.key]: clean }));
      setEditing(false);
      setTyping(true);
      const t = setTimeout(() => {
        push('ai', 'Updated. Anything else, or shall we create your dashboard?');
        setTyping(false);
        setPhase('confirm');
      }, 650);
      timers.current.push(t);
    };

    const confirmSave = () => {
      setPhase('saving');
      const units = Math.max(1, Number(answers.units) || 1);
      const rent = Number(answers.rent) || 0;
      const hid = 'h' + Date.now().toString(36);
      const rooms = Array.from({ length: units }, (_, i) => ({
        id: hid + 'r' + (i + 1), unit: 'Room ' + (i + 1), beds: 1,
        rent: rent, paid: 0, payStatus: 'Vacant', tenant: null,
      }));
      const house = {
        id: hid, name: answers.name, short: answers.name,
        address: answers.address, color: 'var(--green-500)', rooms: rooms,
      };
      // Persist to Firestore via the central store (requires a signed-in user).
      (async () => {
        try {
          const u = await window.PS.Auth.ready();
          if (u) { await window.PS_STORE.ready(); await window.PS_STORE.addHouse(house); }
        } catch (e) { console.error('[onboarding] save failed', e); }
      })();
      const t = setTimeout(() => {
        setPhase('done');
        push('ai', `All set \u2014 ${answers.name} is live on your dashboard. Taking you there now\u2026`);
        const t2 = setTimeout(() => { window.location.href = 'Rent Tracker.html'; }, 1400);
        timers.current.push(t2);
      }, 1300);
      timers.current.push(t);
    };

    const onSubmit = editing ? submitEdit : submitAnswer;
    const showInput = phase === 'asking';
    const curStep = STEPS[stepIndex];

    return (
      <div className="ob-screen">
        <header className="ob-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="assets/logo-mark.svg" width="28" height="28" alt="" />
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Property Suite</span>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Step {stepNo} of {TOTAL}
          </span>
        </header>
        <div className="ob-progress"><span style={{ width: (progress * 100).toFixed(1) + '%' }} /></div>

        <div ref={scroller} className="ob-chat">
          {log.map((m) => m.role === 'ai'
            ? <AiBubble key={m.id}>{m.text}</AiBubble>
            : <UserBubble key={m.id}>{m.text}</UserBubble>)}
          {typing ? <Typing /> : null}
          {phase === 'confirm' ? (
            <ConfirmCard answers={answers} saving={false} onEdit={editField} onConfirm={confirmSave} />
          ) : null}
          {phase === 'saving' || phase === 'done' ? (
            <ConfirmCard answers={answers} saving={true} onEdit={() => {}} onConfirm={() => {}} />
          ) : null}
        </div>

        {showInput ? (
          <div className="ob-dock">
            <AnswerInput step={curStep} error={error} onSubmit={onSubmit} />
          </div>
        ) : null}
      </div>
    );
  }

  /* keyframes + layout (injected once) */
  if (!document.getElementById('ob-style')) {
    const s = document.createElement('style');
    s.id = 'ob-style';
    s.textContent = `
      @keyframes ob-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
      .ob-screen{display:flex;flex-direction:column;height:100dvh;max-width:520px;margin:0 auto;
        background:var(--surface-card);border-left:1px solid var(--border-default);border-right:1px solid var(--border-default);}
      .ob-top{flex:none;display:flex;align-items:center;justify-content:space-between;
        padding:14px 18px;border-bottom:1px solid var(--border-subtle);}
      .ob-progress{flex:none;height:3px;background:var(--surface-sunken);}
      .ob-progress span{display:block;height:100%;background:var(--brand);border-radius:0 999px 999px 0;
        transition:width var(--dur-slow) var(--ease-out);}
      .ob-chat{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:14px;
        padding:22px 18px;background:var(--surface-page);}
      .ob-dock{flex:none;padding:14px 18px calc(14px + env(safe-area-inset-bottom));
        border-top:1px solid var(--border-subtle);background:var(--surface-card);}
      @media (max-width:520px){.ob-screen{border-left:none;border-right:none;}}
    `;
    document.head.appendChild(s);
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<Onboarding />);
})();
