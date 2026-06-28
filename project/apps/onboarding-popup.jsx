/* Property Suite — first-run onboarding POPUP.
   Shown by the launcher (apps/launcher.jsx) when a freshly signed-in landlord
   has NO properties yet. A compact conversational modal that captures just two
   things — the property name and how many rooms it has — then writes the house
   to the store and opens the Houses app. Exports window.OnboardingPopup.
   Loaded after React, the DS bundle, ps-common.js and ps-ui.jsx. */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const ODS = window.MaintenanceSchedulerDesignSystem_02479c;
  const { Button, Card } = ODS;

  /* ---------- question script (name + rooms only) ---------- */
  const STEPS = [
    {
      key: 'name', icon: 'building-2', kind: 'text',
      q: "First up \u2014 what should we call your first property?",
      placeholder: 'e.g. Maple Court',
      chips: ['Maple Court', 'Riverside Flat', 'Main Street House'],
      ack: (v) => `\u201C${v}\u201D \u2014 great name.`,
      bubble: (v) => v,
      validate: (v) => (v.trim().length < 2 ? 'Give your property a name to continue.' : null),
    },
    {
      key: 'rooms', icon: 'door-open', kind: 'number',
      q: "And how many rooms does it have to let?",
      placeholder: 'Number of rooms',
      chips: ['1', '2', '3', '4', '5'],
      ack: (v) => `${v} ${Number(v) === 1 ? 'room' : 'rooms'} \u2014 got it.`,
      bubble: (v) => `${v} ${Number(v) === 1 ? 'room' : 'rooms'}`,
      validate: (v) => {
        const n = Number(v);
        if (!v || !Number.isFinite(n) || n < 1) return 'Enter at least 1 room.';
        if (!Number.isInteger(n)) return 'Use a whole number of rooms.';
        if (n > 200) return 'That\u2019s a lot \u2014 enter 200 or fewer.';
        return null;
      },
    },
    {
      key: 'rent', icon: 'banknote', kind: 'number',
      q: "Last one \u2014 what\u2019s the base rent per room each month?",
      placeholder: 'Monthly rent per room',
      chips: ['500', '600', '750', '900'],
      ack: (v) => `${window.PS.Currency.format(v)} per room \u2014 perfect, that\u2019s everything I need.`,
      bubble: (v) => `${window.PS.Currency.format(v)} / month`,
      validate: (v) => {
        const n = Number(v);
        if (v === '' || !Number.isFinite(n) || n < 0) return 'Enter a monthly rent amount.';
        if (!Number.isInteger(n)) return 'Use a whole number.';
        if (n > 1000000) return 'That seems high \u2014 enter a smaller amount.';
        return null;
      },
    },
  ];

  /* ---------- assistant orb ---------- */
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
              animation: `obp-dot 1.2s ${i * 0.15}s infinite ease-in-out` }} />
          ))}
        </div>
      </div>
    );
  }

  function AiBubble({ children }) {
    return (
      <div className="obp-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Orb />
        <div style={{ flex: '0 1 auto', width: 'max-content', maxWidth: '80%', padding: '10px 13px', background: 'var(--surface-card)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-body)', fontSize: 'var(--text-base)', lineHeight: 1.55, overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    );
  }

  function UserBubble({ children }) {
    return (
      <div className="obp-in" style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-block', textAlign: 'left', width: 'max-content', maxWidth: '80%', padding: '10px 13px', background: 'var(--brand)', color: 'var(--text-on-brand)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', lineHeight: 1.5, fontWeight: 500, overflowWrap: 'anywhere' }}>{children}</div>
      </div>
    );
  }

  /* ---------- inline answer input ---------- */
  function AnswerInput({ step, error, onSubmit }) {
    const [val, setVal] = useState('');
    const ref = useRef(null);
    useEffect(() => { setVal(''); if (ref.current) ref.current.focus(); window.PS.iconsSoon(); }, [step.key]);

    const numeric = step.kind === 'number';
    const submit = () => onSubmit(val);
    const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.chips ? (
          <div className="ps-scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 2 }}>
            {step.chips.map((c) => (
              <button key={c} type="button" onClick={() => onSubmit(c)}
                style={{ flex: 'none', padding: '7px 13px', cursor: 'pointer', background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-pill)',
                  fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)', whiteSpace: 'nowrap' }}>
                {c}
              </button>
            ))}
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 13px',
              background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (error ? 'var(--danger-solid)' : 'var(--border-strong)'),
              boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}>
                <i data-lucide={step.icon}></i>
              </span>
              <input
                ref={ref}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={onKey}
                placeholder={step.placeholder}
                type={numeric ? 'number' : 'text'}
                inputMode={numeric ? 'numeric' : 'text'}
                min={numeric ? '1' : undefined}
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
  function ConfirmCard({ answers, saving, manual, onEdit, onConfirm }) {
    const units = Math.max(1, Number(answers.rooms) || 1);
    const rent = Math.max(0, Number(answers.rent) || 0);
    const rows = [
      { key: 'name', icon: 'building-2', label: 'Property', value: answers.name },
      { key: 'rooms', icon: 'door-open', label: 'Rooms', value: `${units} ${units === 1 ? 'room' : 'rooms'}` },
      { key: 'rent', icon: 'banknote', label: 'Base rent', value: `${window.PS.Currency.format(rent)} / room / month` },
    ];
    useEffect(() => { window.PS.iconsSoon(); }, [saving]);
    return (
      <Card className="obp-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Quick check</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Tap a row to fix it before we set up your house.</div>
        </div>
        <div>
          {rows.map((r) => (
            <button key={r.key} type="button" onClick={() => onEdit(r.key)} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                padding: '12px 16px', border: 'none', borderTop: '1px solid var(--border-subtle)',
                background: 'transparent', cursor: saving ? 'default' : 'pointer' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32,
                flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide={r.icon}></i></span>
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
        <div style={{ padding: 13 }}>
          <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={onConfirm}
            leadingIcon={<i data-lucide={saving ? 'loader' : (manual ? 'plus' : 'arrow-right')}></i>}>
            {saving
              ? (manual ? 'Adding your property\u2026' : 'Setting up your house\u2026')
              : (manual ? 'Add this property' : 'Create house & open Houses')}
          </Button>
        </div>
      </Card>
    );
  }

  /* ---------- root popup ---------- */
  const GREETING_FIRST = "Welcome to Property Suite! Let\u2019s add your first property \u2014 it takes about thirty seconds. Just two quick questions.";
  const GREETING_MORE = "Let\u2019s add another property \u2014 just two quick questions and I\u2019ll set it up for you.";

  /* Props:
       onComplete(answers) -- if provided, the popup runs in "manual" mode: it
         hands { name, rooms } back to the host instead of writing to the store
         and redirecting. Used by the Houses app's "add by chat" button.
       onClose() -- if provided, the popup is dismissable (close button, Esc and
         scrim click). First-run onboarding omits it (the step is required). */
  function OnboardingPopup({ user, onClose, onComplete }) {
    const manual = typeof onComplete === 'function';
    const GREETING = manual ? GREETING_MORE : GREETING_FIRST;
    const [log, setLog] = useState([]);
    const [answers, setAnswers] = useState({});
    const [stepIndex, setStepIndex] = useState(0);
    const [phase, setPhase] = useState('intro'); // intro | asking | confirm | saving | done
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const scroller = useRef(null);
    const idRef = useRef(0);
    const timers = useRef([]);
    const nid = () => 'm' + (++idRef.current);

    const push = useCallback((role, text) => setLog((l) => [...l, { id: nid(), role, text }]), []);

    useEffect(() => {
      setTyping(true);
      const t1 = setTimeout(() => {
        push('ai', GREETING);
        const t2 = setTimeout(() => {
          push('ai', STEPS[0].q);
          setTyping(false);
          setPhase('asking');
        }, 1000);
        timers.current.push(t2);
      }, 800);
      timers.current.push(t1);
      return () => timers.current.forEach(clearTimeout);
    }, []);

    useEffect(() => {
      const s = scroller.current;
      if (s) s.scrollTop = s.scrollHeight;
      window.PS.icons();
    }, [log, typing, phase, error]);

    // Dismissable only in manual mode.
    useEffect(() => {
      if (!onClose) return;
      const h = (e) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const answeredCount = Object.keys(answers).length;
    const TOTAL = STEPS.length + 1;
    const stepNo = phase === 'confirm' || phase === 'saving' || phase === 'done'
      ? TOTAL : Math.min(answeredCount + 1, STEPS.length);
    const progress = phase === 'done' ? 1
      : (phase === 'confirm' || phase === 'saving' ? (TOTAL - 1) / TOTAL : answeredCount / TOTAL);

    const askConfirm = () => {
      setTyping(true);
      const t = setTimeout(() => { setTyping(false); setPhase('confirm'); }, 700);
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
          }, 600);
          timers.current.push(t2);
        }
      }, 650);
      timers.current.push(t);
    };

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
        push('ai', 'Updated. Shall we set up your house?');
        setTyping(false);
        setPhase('confirm');
      }, 600);
      timers.current.push(t);
    };

    const confirmSave = () => {
      setPhase('saving');
      const units = Math.max(1, Number(answers.rooms) || 1);
      const rent = Math.max(0, Number(answers.rent) || 0);

      // Manual mode: hand the answers back to the host (e.g. Houses), which
      // owns the write + view update. We don't touch the store or navigate.
      if (manual) {
        const t = setTimeout(() => { onComplete({ name: answers.name, rooms: units, rent }); }, 550);
        timers.current.push(t);
        return;
      }

      const hid = 'h' + Date.now().toString(36);
      const rooms = Array.from({ length: units }, (_, i) => ({
        id: hid + 'r' + (i + 1), unit: 'Room ' + (i + 1), beds: 1,
        rent: rent, paid: 0, payStatus: 'Vacant', tenant: null,
      }));
      const house = {
        id: hid, name: answers.name, short: answers.name,
        address: '', color: 'var(--green-500)', rooms: rooms,
      };
      (async () => {
        try {
          await window.PS_STORE.ready();
          await window.PS_STORE.addHouse(house);
        } catch (e) { console.error('[onboarding-popup] save failed', e); }
        const t = setTimeout(() => {
          setPhase('done');
          push('ai', `All set \u2014 ${answers.name} is ready. Opening Houses so you can add rooms and tenants\u2026`);
          const t2 = setTimeout(() => { window.PS.rememberApp(); window.location.href = 'Houses.html'; }, 1300);
          timers.current.push(t2);
        }, 700);
        timers.current.push(t);
      })();
    };

    const onSubmit = editing ? submitEdit : submitAnswer;
    const showInput = phase === 'asking';
    const curStep = STEPS[stepIndex];
    const saving = phase === 'saving' || phase === 'done';

    return (
      <div className="obp-overlay" onMouseDown={onClose ? onClose : undefined}>
        <div className="obp-card ps-fade" onMouseDown={(e) => e.stopPropagation()}>
          <header className="obp-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="assets/logo-mark.svg" width="26" height="26" alt="" />
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>{manual ? 'Add a property' : 'Set up your portfolio'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                Step {stepNo} of {TOTAL}
              </span>
              {onClose ? (
                <button type="button" onClick={onClose} aria-label="Close"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
                    flex: 'none', cursor: 'pointer', background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide="x"></i></span>
                </button>
              ) : null}
            </div>
          </header>
          <div className="obp-progress"><span style={{ width: (progress * 100).toFixed(1) + '%' }} /></div>

          <div ref={scroller} className="obp-chat">
            {log.map((m) => m.role === 'ai'
              ? <AiBubble key={m.id}>{m.text}</AiBubble>
              : <UserBubble key={m.id}>{m.text}</UserBubble>)}
            {typing ? <Typing /> : null}
            {phase === 'confirm' ? (
              <ConfirmCard answers={answers} saving={false} manual={manual} onEdit={editField} onConfirm={confirmSave} />
            ) : null}
            {saving ? (
              <ConfirmCard answers={answers} saving={true} manual={manual} onEdit={() => {}} onConfirm={() => {}} />
            ) : null}
          </div>

          {showInput ? (
            <div className="obp-dock">
              <AnswerInput step={curStep} error={error} onSubmit={onSubmit} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  /* keyframes + layout (injected once) */
  if (!document.getElementById('obp-style')) {
    const s = document.createElement('style');
    s.id = 'obp-style';
    s.textContent = `
      @keyframes obp-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
      @keyframes obp-pop{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:none}}
      .obp-in{animation:obp-pop var(--dur-base,200ms) var(--ease-out) both;}
      .obp-overlay{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;
        padding:20px;background:rgba(24,28,26,0.32);backdrop-filter:blur(3px);}
      .obp-card{display:flex;flex-direction:column;width:100%;max-width:460px;height:600px;max-height:92dvh;
        background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-lg);
        box-shadow:var(--shadow-pop);overflow:hidden;animation:obp-pop 240ms var(--ease-out) both;}
      .obp-top{flex:none;display:flex;align-items:center;justify-content:space-between;
        padding:14px 18px;border-bottom:1px solid var(--border-subtle);}
      .obp-progress{flex:none;height:3px;background:var(--surface-sunken);}
      .obp-progress span{display:block;height:100%;background:var(--brand);border-radius:0 999px 999px 0;
        transition:width var(--dur-slow) var(--ease-out);}
      .obp-chat{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:13px;
        padding:20px 18px;background:var(--surface-page);}
      .obp-chat > *{flex-shrink:0;}
      .obp-dock{flex:none;padding:13px 18px;border-top:1px solid var(--border-subtle);background:var(--surface-card);}
      @media (max-width:520px){.obp-overlay{padding:0;}.obp-card{max-width:none;height:100dvh;max-height:none;border:none;border-radius:0;}}
    `;
    document.head.appendChild(s);
  }

  window.OnboardingPopup = OnboardingPopup;
})();
