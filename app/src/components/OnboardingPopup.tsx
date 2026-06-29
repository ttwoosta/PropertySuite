// Conversational onboarding popup — shown when a new landlord has no properties.
// Also used in "manual" mode by HousesApp for chat-driven property addition.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card } from '../ds-vendor/components';
import { LucideIcon } from '../lib/icon';
import { formatCurrency } from '../lib/currency';

interface Step {
  key: string;
  icon: string;
  kind: 'text' | 'number';
  q: string;
  placeholder: string;
  chips: string[];
  ack: (v: string) => string;
  bubble: (v: string) => string;
  validate: (v: string) => string | null;
}

const STEPS: Step[] = [
  {
    key: 'name', icon: 'building-2', kind: 'text',
    q: 'First up — what should we call your first property?',
    placeholder: 'e.g. Maple Court',
    chips: ['Maple Court', 'Riverside Flat', 'Main Street House'],
    ack: (v) => `"${v}" — great name.`,
    bubble: (v) => v,
    validate: (v) => (v.trim().length < 2 ? 'Give your property a name to continue.' : null),
  },
  {
    key: 'rooms', icon: 'door-open', kind: 'number',
    q: 'And how many rooms does it have to let?',
    placeholder: 'Number of rooms',
    chips: ['1', '2', '3', '4', '5'],
    ack: (v) => `${v} ${Number(v) === 1 ? 'room' : 'rooms'} — got it.`,
    bubble: (v) => `${v} ${Number(v) === 1 ? 'room' : 'rooms'}`,
    validate: (v) => {
      const n = Number(v);
      if (!v || !Number.isFinite(n) || n < 1) return 'Enter at least 1 room.';
      if (!Number.isInteger(n)) return 'Use a whole number of rooms.';
      if (n > 200) return 'That\'s a lot — enter 200 or fewer.';
      return null;
    },
  },
  {
    key: 'rent', icon: 'banknote', kind: 'number',
    q: 'Last one — what\'s the base rent per room each month?',
    placeholder: 'Monthly rent per room',
    chips: ['500', '600', '750', '900'],
    ack: (v) => `${formatCurrency(Number(v))} per room — perfect, that's everything I need.`,
    bubble: (v) => `${formatCurrency(Number(v))} / month`,
    validate: (v) => {
      const n = Number(v);
      if (v === '' || !Number.isFinite(n) || n < 0) return 'Enter a monthly rent amount.';
      if (!Number.isInteger(n)) return 'Use a whole number.';
      if (n > 1_000_000) return 'That seems high — enter a smaller amount.';
      return null;
    },
  },
];

interface LogEntry { id: string; role: 'ai' | 'user'; text: string }
interface Answers { name?: string; rooms?: string; rent?: string }

function Orb({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
      width: size, height: size, borderRadius: '50%', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
      <span style={{ display: 'inline-flex', width: size * 0.5, height: size * 0.5 }}>
        <LucideIcon name="sparkles" />
      </span>
    </span>
  );
}

function TypingIndicator() {
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

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="obp-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Orb />
      <div style={{ flex: '0 1 auto', width: 'max-content', maxWidth: '80%', padding: '10px 13px',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)', color: 'var(--text-body)', fontSize: 'var(--text-base)',
        lineHeight: 1.55, overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="obp-in" style={{ textAlign: 'right' }}>
      <div style={{ display: 'inline-block', textAlign: 'left', width: 'max-content', maxWidth: '80%',
        padding: '10px 13px', background: 'var(--brand)', color: 'var(--text-on-brand)',
        borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', lineHeight: 1.5,
        fontWeight: 500, overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  );
}

function AnswerInput({ step, error, onSubmit }: { step: Step; error: string | null; onSubmit: (v: string) => void }) {
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setVal(''); ref.current?.focus(); }, [step.key]);

  const submit = () => onSubmit(val);
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {step.chips.length > 0 && (
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
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 13px',
            background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--danger-solid)' : 'var(--border-strong)'}`,
            boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}>
              <LucideIcon name={step.icon} />
            </span>
            <input
              ref={ref}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={onKey}
              placeholder={step.placeholder}
              type={step.kind === 'number' ? 'number' : 'text'}
              inputMode={step.kind === 'number' ? 'numeric' : 'text'}
              min={step.kind === 'number' ? '1' : undefined}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-heading)' }}
            />
          </div>
          {error && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--danger-fg)' }}>
              <span style={{ display: 'inline-flex', width: 13, height: 13 }}><LucideIcon name="alert-circle" /></span>
              {error}
            </span>
          )}
        </div>
        <Button variant="primary" size="lg" onClick={submit} aria-label="Send answer">
          <span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="arrow-up" /></span>
        </Button>
      </div>
    </div>
  );
}

function ConfirmCard({ answers, saving, manual, onEdit, onConfirm }: {
  answers: Answers; saving: boolean; manual: boolean;
  onEdit: (key: string) => void; onConfirm: () => void;
}) {
  const units = Math.max(1, Number(answers.rooms) || 1);
  const rent = Math.max(0, Number(answers.rent) || 0);
  const rows = [
    { key: 'name', icon: 'building-2', label: 'Property', value: answers.name ?? '' },
    { key: 'rooms', icon: 'door-open', label: 'Rooms', value: `${units} ${units === 1 ? 'room' : 'rooms'}` },
    { key: 'rent', icon: 'banknote', label: 'Base rent', value: `${formatCurrency(rent)} / room / month` },
  ];
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
              <span style={{ display: 'inline-flex', width: 16, height: 16 }}><LucideIcon name={r.icon} /></span>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-heading)', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</div>
            </div>
            <span style={{ display: 'inline-flex', width: 15, height: 15, color: 'var(--text-faint)', flex: 'none' }}>
              <LucideIcon name="pencil" />
            </span>
          </button>
        ))}
      </div>
      <div style={{ padding: 13 }}>
        <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={onConfirm}
          leadingIcon={<span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name={saving ? 'loader' : (manual ? 'plus' : 'arrow-right')} /></span>}>
          {saving
            ? (manual ? 'Adding your property…' : 'Setting up your house…')
            : (manual ? 'Add this property' : 'Create house & go to Houses')}
        </Button>
      </div>
    </Card>
  );
}

const GREETING_FIRST = 'Welcome to Property Suite! Let\'s add your first property — it takes about thirty seconds. Just two quick questions.';
const GREETING_MORE = 'Let\'s add another property — just two quick questions and I\'ll set it up for you.';

export interface OnboardingResult { name: string; rooms: number; rent: number }

interface OnboardingPopupProps {
  onClose?: () => void;
  onComplete?: (result: OnboardingResult) => void;
  onNavigateToHouses?: () => void;
}

export function OnboardingPopup({ onClose, onComplete, onNavigateToHouses }: OnboardingPopupProps) {
  const manual = typeof onComplete === 'function';
  const GREETING = manual ? GREETING_MORE : GREETING_FIRST;
  const [log, setLog] = useState<LogEntry[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'asking' | 'confirm' | 'saving' | 'done'>('intro');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nid = () => 'm' + (++idRef.current);

  const push = useCallback((role: 'ai' | 'user', text: string) =>
    setLog((l) => [...l, { id: nid(), role, text }]), []);

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
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [log, typing, phase, error]);

  useEffect(() => {
    if (!onClose) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
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

  const submitAnswer = (raw: string) => {
    const step = STEPS[stepIndex];
    const err = step.validate(raw);
    if (err) { setError(err); return; }
    setError(null);
    const clean = raw.trim();
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

  const editField = (key: string) => {
    const idx = STEPS.findIndex((s) => s.key === key);
    setEditing(true);
    setError(null);
    setPhase('asking');
    setStepIndex(idx);
    push('ai', `Sure — ${STEPS[idx].q.charAt(0).toLowerCase()}${STEPS[idx].q.slice(1)}`);
  };

  const submitEdit = (raw: string) => {
    const step = STEPS[stepIndex];
    const err = step.validate(raw);
    if (err) { setError(err); return; }
    setError(null);
    const clean = raw.trim();
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

    if (manual) {
      const t = setTimeout(() => { onComplete!({ name: answers.name!, rooms: units, rent }); }, 550);
      timers.current.push(t);
      return;
    }

    const t = setTimeout(() => {
      setPhase('done');
      push('ai', `All set — ${answers.name} is ready. Opening Houses so you can add rooms and tenants…`);
      const t2 = setTimeout(() => { onNavigateToHouses?.(); }, 1300);
      timers.current.push(t2);
    }, 700);
    timers.current.push(t);
  };

  const onSubmit = editing ? submitEdit : submitAnswer;
  const showInput = phase === 'asking';
  const curStep = STEPS[stepIndex];
  const saving = phase === 'saving' || phase === 'done';

  return (
    <>
      <style>{`
        @keyframes obp-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes obp-pop{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:none}}
        .obp-in{animation:obp-pop var(--dur-base,200ms) var(--ease-out) both;}
        .obp-chat>*{flex-shrink:0;}
        @media(max-width:520px){.obp-overlay{padding:0!important}.obp-card{max-width:none!important;height:100dvh!important;max-height:none!important;border:none!important;border-radius:0!important}}
      `}</style>
      <div className="obp-overlay" style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, background: 'rgba(24,28,26,0.32)', backdropFilter: 'blur(3px)' }}
        onMouseDown={onClose}>
        <div className="obp-card" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 460, height: 600, maxHeight: '92dvh',
          background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-pop)', overflow: 'hidden', animation: 'obp-pop 240ms var(--ease-out) both' }}
          onMouseDown={(e) => e.stopPropagation()}>
          <header style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="/assets/logo-mark.svg" width={26} height={26} alt="" />
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>
                {manual ? 'Add a property' : 'Set up your portfolio'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
                Step {stepNo} of {TOTAL}
              </span>
              {onClose && (
                <button type="button" onClick={onClose} aria-label="Close"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
                    flex: 'none', cursor: 'pointer', background: 'transparent', border: 'none',
                    borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="x" /></span>
                </button>
              )}
            </div>
          </header>

          <div style={{ flex: 'none', height: 3, background: 'var(--surface-sunken)' }}>
            <span style={{ display: 'block', height: '100%', background: 'var(--brand)',
              borderRadius: '0 999px 999px 0', transition: 'width var(--dur-slow) var(--ease-out)',
              width: `${(progress * 100).toFixed(1)}%` }} />
          </div>

          <div ref={scroller} className="obp-chat" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            gap: 13, padding: '20px 18px', background: 'var(--surface-page)' }}>
            {log.map((m) => m.role === 'ai'
              ? <AiBubble key={m.id}>{m.text}</AiBubble>
              : <UserBubble key={m.id}>{m.text}</UserBubble>)}
            {typing && <TypingIndicator />}
            {phase === 'confirm' && (
              <ConfirmCard answers={answers} saving={false} manual={manual} onEdit={editField} onConfirm={confirmSave} />
            )}
            {saving && (
              <ConfirmCard answers={answers} saving={true} manual={manual} onEdit={() => {}} onConfirm={() => {}} />
            )}
          </div>

          {showInput && (
            <div style={{ flex: 'none', padding: '13px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
              <AnswerInput step={curStep} error={error} onSubmit={onSubmit} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
