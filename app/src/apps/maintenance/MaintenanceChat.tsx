// Maintenance Scheduler — "Add a schedule with chat" modal.
// Three-step conversational flow: task name → prep steps → timing → confirm.
// Calls onComplete(result) and the host owns the Firestore write.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Checkbox } from '../../ds-vendor/components';
import { di, LucideIcon } from '../../lib/icon';
import type { Bucket, PrepItem, Recurrence } from './data';

// ── Task classifier ───────────────────────────────────────────────────────────

interface TaskMeta { icon: string; tint: string; recurrence: Recurrence; prep: string[] }

const RULES: { re: RegExp; icon: string; tint: string; recurrence: Recurrence; prep: string[] }[] = [
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
  { re: /(lock|door|security|alarm)/, icon: 'shield-check', tint: 'var(--gray-500)', recurrence: 'Quarterly',
    prep: ['Spare keys / fobs', 'Lubricant spray', 'Screwdriver set'] },
];

function classify(name: string): TaskMeta {
  const n = (name || '').toLowerCase();
  const hit = RULES.find((r) => r.re.test(n));
  if (hit) return { icon: hit.icon, tint: hit.tint, recurrence: hit.recurrence, prep: hit.prep.slice() };
  return { icon: 'wrench', tint: 'var(--green-500)', recurrence: 'Monthly',
    prep: ['Tools for the job', 'Replacement parts / consumables', 'Notify tenant if access is needed'] };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const MS_DAY = 86_400_000;
const today = () => new Date().toISOString().slice(0, 10);

function startLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const days = Math.round((d.getTime() - new Date(today() + 'T00:00:00').getTime()) / MS_DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'on ' + d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function dueFrom(iso: string): number {
  return Math.round((new Date(iso + 'T00:00:00').getTime() - new Date(today() + 'T00:00:00').getTime()) / MS_DAY);
}

// ── Chat chrome ───────────────────────────────────────────────────────────────

function Orb({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
      width: size, height: size, borderRadius: '50%', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
      <span style={{ display: 'inline-flex', width: size * 0.5, height: size * 0.5 }}>{di('sparkles')}</span>
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
            animation: `mcd 1.2s ${i * 0.15}s infinite ease-in-out` }} />
        ))}
      </div>
    </div>
  );
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mc-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Orb />
      <div style={{ flex: '0 1 auto', width: 'max-content', maxWidth: '82%', padding: '10px 13px',
        background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
        color: 'var(--text-body)', fontSize: 'var(--text-base)', lineHeight: 1.55, overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mc-in" style={{ textAlign: 'right' }}>
      <div style={{ display: 'inline-block', textAlign: 'left', width: 'max-content', maxWidth: '82%', padding: '10px 13px',
        background: 'var(--brand)', color: 'var(--text-on-brand)', borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-base)', lineHeight: 1.5, fontWeight: 500, overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  );
}

// ── Step 1: task name ─────────────────────────────────────────────────────────

const NAME_CHIPS = ['Lawn mowing', 'Smoke alarm check', 'Boiler maintenance', 'Gutter clearing', 'Gas safety check'];

function NameInput({ initial, error, onSubmit }: {
  initial: string; error: string | null; onSubmit: (v: string) => void;
}) {
  const [val, setVal] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
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
            border: `1px solid ${error ? 'var(--danger-solid)' : 'var(--border-strong)'}`, boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}>
              {di('wrench')}
            </span>
            <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
              placeholder="e.g. Boiler maintenance"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-heading)' }} />
          </div>
          {error && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--danger-fg)' }}>
              <span style={{ display: 'inline-flex', width: 13, height: 13 }}><LucideIcon name="alert-circle" /></span>
              {error}
            </span>
          )}
        </div>
        <Button variant="primary" size="lg" onClick={submit} aria-label="Send">
          <span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="arrow-up" /></span>
        </Button>
      </div>
    </div>
  );
}

// ── Step 2: AI-drafted prep steps ─────────────────────────────────────────────

interface PrepRow { id: string; label: string; on: boolean }

function PrepCard({ meta, initial, onConfirm }: {
  meta: TaskMeta;
  initial: PrepItem[];
  onConfirm: (items: { label: string }[]) => void;
}) {
  const seed: PrepRow[] = (initial.length ? initial.map((p) => p.label) : meta.prep)
    .map((l, i) => ({ id: 'p' + i, label: l, on: true }));
  const [items, setItems] = useState<PrepRow[]>(seed);
  const [draft, setDraft] = useState('');
  const idRef = useRef(seed.length);

  const toggle = (id: string) => setItems((xs) => xs.map((x) => x.id === id ? { ...x, on: !x.on } : x));
  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems((xs) => [...xs, { id: 'p' + (++idRef.current), label: v, on: true }]);
    setDraft('');
  };
  const chosen = items.filter((x) => x.on);

  return (
    <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--brand)' }}>{di('sparkles')}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Suggested prep</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>Untick anything you don't need, or add your own.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it) => (
          <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ flex: 1, minWidth: 0, opacity: it.on ? 1 : 0.5 }}>
              <Checkbox checked={it.on} onChange={() => toggle(it.id)} label={it.label} />
            </span>
            <button type="button" onClick={() => remove(it.id)} aria-label="Remove"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, flex: 'none',
                cursor: 'pointer', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-faint)' }}>
              <span style={{ display: 'inline-flex', width: 15, height: 15 }}>{di('x')}</span>
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-faint)', flex: 'none' }}>{di('plus')}</span>
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Add a supply or step…"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }} />
      </div>
      <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="primary" size="lg" fullWidth onClick={() => onConfirm(chosen.map((x) => ({ label: x.label })))}
          leadingIcon={<span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="check" /></span>}>
          {chosen.length ? `Use these ${chosen.length} ${chosen.length === 1 ? 'step' : 'steps'}` : 'Continue without prep'}
        </Button>
      </div>
    </Card>
  );
}

// ── Step 3: duration + start ──────────────────────────────────────────────────

const DURATIONS = [10, 20, 30, 45, 60, 90];
const START_CHIPS = [{ label: 'Today', d: 0 }, { label: 'In 3 days', d: 3 }, { label: 'Next week', d: 7 }, { label: 'Next month', d: 30 }];

function TimingCard({ initial, onConfirm }: {
  initial: { durationMin: number; startDate: string };
  onConfirm: (v: { durationMin: number; startDate: string; dueInDays: number }) => void;
}) {
  const [dur, setDur] = useState(initial.durationMin);
  const [start, setStart] = useState(initial.startDate);

  const isoFor = (d: number) => {
    const x = new Date(today() + 'T00:00:00');
    x.setDate(x.getDate() + d);
    return x.toISOString().slice(0, 10);
  };

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
                  border: `1px solid ${on ? 'var(--brand)' : 'var(--border-default)'}`,
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
                  border: `1px solid ${on ? 'var(--brand)' : 'var(--border-default)'}`,
                  background: on ? 'var(--brand-tint)' : 'var(--surface-card)',
                  color: on ? 'var(--brand-on-tint)' : 'var(--text-body)' }}>{c.label}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 13px',
            background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}>
            <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-faint)', flex: 'none' }}>{di('calendar')}</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="primary" size="lg" fullWidth
          leadingIcon={<span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="arrow-right" /></span>}
          onClick={() => onConfirm({ durationMin: dur, startDate: start, dueInDays: dueFrom(start) })}>
          Review schedule
        </Button>
      </div>
    </Card>
  );
}

// ── Step 4: confirm summary ───────────────────────────────────────────────────

interface ChatAnswers {
  name: string;
  meta: TaskMeta;
  prep: { label: string }[];
  durationMin: number;
  startDate: string;
  dueInDays: number;
  recurrence: Recurrence;
}

function ConfirmCard({ answers, saving, onEdit, onConfirm }: {
  answers: ChatAnswers; saving: boolean;
  onEdit: (key: string) => void; onConfirm: () => void;
}) {
  const rows = [
    { key: 'name', icon: answers.meta.icon, label: 'Task', value: answers.name },
    { key: 'prep', icon: 'clipboard-check', label: 'Prep steps',
      value: answers.prep.length ? `${answers.prep.length} ${answers.prep.length === 1 ? 'step' : 'steps'}` : 'None' },
    { key: 'timing', icon: 'clock', label: 'Time & start',
      value: `${answers.durationMin} min · starts ${startLabel(answers.startDate)}` },
    { key: 'cadence', icon: 'repeat', label: 'Repeats', value: answers.recurrence, plain: true as const },
  ];
  return (
    <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Quick check</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Tap a row to fix it before we add it to the schedule.</div>
      </div>
      <div>
        {rows.map((r) => (
          <button key={r.key} type="button" onClick={() => !r.plain && onEdit(r.key)}
            disabled={saving || !!r.plain}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
              padding: '12px 16px', border: 'none', borderTop: '1px solid var(--border-subtle)',
              background: 'transparent', cursor: (saving || r.plain) ? 'default' : 'pointer' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flex: 'none',
              borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', width: 16, height: 16 }}><LucideIcon name={r.icon} /></span>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-heading)', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</div>
            </div>
            {!r.plain && (
              <span style={{ display: 'inline-flex', width: 15, height: 15, color: 'var(--text-faint)', flex: 'none' }}>
                <LucideIcon name="pencil" />
              </span>
            )}
          </button>
        ))}
      </div>
      <div style={{ padding: 13 }}>
        <Button variant="primary" size="lg" fullWidth disabled={saving} onClick={onConfirm}
          leadingIcon={<span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name={saving ? 'loader' : 'plus'} /></span>}>
          {saving ? 'Adding to schedule…' : 'Add to schedule'}
        </Button>
      </div>
    </Card>
  );
}

// ── Public result type ────────────────────────────────────────────────────────

export interface ChatTaskResult {
  name: string;
  icon: string;
  tint: string;
  recurrence: Recurrence;
  durationMin: number;
  bucket: Bucket;
  property: string;
  dueInDays: number;
  startDate: string;
  prep: PrepItem[];
}

// ── Root component ────────────────────────────────────────────────────────────

type Phase = 'intro' | 'name' | 'prep' | 'timing' | 'confirm' | 'saving';

interface LogEntry { id: string; role: 'ai' | 'user'; text: string }

export function MaintenanceChat({ propId, propName, onClose, onComplete }: {
  propId: string;
  propName: string;
  onClose: () => void;
  onComplete: (result: ChatTaskResult) => void;
}) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<Phase>('intro');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<ChatAnswers>({
    name: '', meta: classify(''), prep: [],
    durationMin: 30, startDate: today(), dueInDays: 0, recurrence: 'Monthly',
  });
  const scroller = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nid = () => 'm' + (++idRef.current);
  const push = useCallback((role: 'ai' | 'user', text: string) =>
    setLog((l) => [...l, { id: nid(), role, text }]), []);

  useEffect(() => {
    setTyping(true);
    const t1 = setTimeout(() => {
      push('ai', `Let's schedule some maintenance for ${propName || 'this property'}. Three quick questions and I'll set it up.`);
      const t2 = setTimeout(() => { push('ai', "First — what's the task?"); setTyping(false); setPhase('name'); }, 950);
      timers.current.push(t2);
    }, 700);
    timers.current.push(t1);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [log, typing, phase, error]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const submitName = (raw: string) => {
    const name = raw.trim();
    if (name.length < 2) { setError('Give the task a name to continue.'); return; }
    setError(null);
    const meta = classify(name);
    push('user', name);
    setAnswers((a) => ({ ...a, name, meta, recurrence: meta.recurrence,
      prep: a.prep.length ? a.prep : meta.prep.map((l) => ({ label: l })) }));
    setTyping(true);
    after(700, () => {
      push('ai', `"${name}" — got it. Based on that, here are some prep steps I'd line up.`);
      setTyping(false); setPhase('prep');
    });
  };

  const confirmPrep = (prep: { label: string }[]) => {
    setAnswers((a) => ({ ...a, prep }));
    push('user', prep.length ? `${prep.length} ${prep.length === 1 ? 'prep step' : 'prep steps'}` : 'No prep needed');
    setTyping(true);
    after(650, () => {
      push('ai', 'Nice. Last one — how long does it take, and when should it start?');
      setTyping(false); setPhase('timing');
    });
  };

  const confirmTiming = ({ durationMin, startDate, dueInDays }: { durationMin: number; startDate: string; dueInDays: number }) => {
    setAnswers((a) => ({ ...a, durationMin, startDate, dueInDays }));
    push('user', `${durationMin} min · starts ${startLabel(startDate)}`);
    setTyping(true);
    after(650, () => {
      push('ai', "Perfect — that's everything. Here's the schedule.");
      setTyping(false); setPhase('confirm');
    });
  };

  const editField = (key: string) => {
    setError(null);
    if (key === 'name') { push('ai', "Sure — what's the task?"); setPhase('name'); }
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
        prep: a.prep.map((p, i) => ({ id: i, label: p.label, done: false })),
      });
    });
  };

  const order: Record<Phase, number> = { intro: 0, name: 0, prep: 1, timing: 2, confirm: 3, saving: 3 };
  const TOTAL = 4;
  const progress = (order[phase] ?? 0) / TOTAL;
  const stepNo = Math.min((order[phase] ?? 0) + 1, TOTAL);
  const saving = phase === 'saving';

  return (
    <>
      <style>{`
        @keyframes mcd{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}
        @keyframes mcpop{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:none}}
        .mc-in{animation:mcpop var(--dur-base,200ms) var(--ease-out) both;}
        .mc-chat>*{flex-shrink:0;}
        @media(max-width:520px){.mc-overlay{padding:0!important}.mc-card{max-width:none!important;height:100dvh!important;max-height:none!important;border:none!important;border-radius:0!important}}
      `}</style>
      <div className="mc-overlay" style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20, background: 'rgba(24,28,26,0.32)', backdropFilter: 'blur(3px)' }}
        onMouseDown={onClose}>
        <div className="mc-card" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 460,
          height: 600, maxHeight: '92dvh', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-pop)', overflow: 'hidden',
          animation: 'mcpop 240ms var(--ease-out) both' }}
          onMouseDown={(e) => e.stopPropagation()}>

          <header style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="/assets/logo-mark.svg" width={26} height={26} alt="" />
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>
                Add a schedule
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>Step {stepNo} of {TOTAL}</span>
              <button type="button" onClick={onClose} aria-label="Close"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30,
                  flex: 'none', cursor: 'pointer', background: 'transparent', border: 'none',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="x" /></span>
              </button>
            </div>
          </header>

          <div style={{ flex: 'none', height: 3, background: 'var(--surface-sunken)' }}>
            <span style={{ display: 'block', height: '100%', background: 'var(--brand)',
              borderRadius: '0 999px 999px 0', transition: 'width var(--dur-slow) var(--ease-out)',
              width: `${(progress * 100).toFixed(1)}%` }} />
          </div>

          <div ref={scroller} className="mc-chat" style={{ flex: 1, minHeight: 0, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 13, padding: '20px 18px', background: 'var(--surface-page)' }}>
            {log.map((m) => m.role === 'ai'
              ? <AiBubble key={m.id}>{m.text}</AiBubble>
              : <UserBubble key={m.id}>{m.text}</UserBubble>)}
            {typing && <TypingIndicator />}
            {phase === 'prep' && (
              <PrepCard meta={answers.meta} initial={answers.prep.map((p, i) => ({ id: i, label: p.label, done: false }))} onConfirm={confirmPrep} />
            )}
            {phase === 'timing' && (
              <TimingCard initial={{ durationMin: answers.durationMin, startDate: answers.startDate }} onConfirm={confirmTiming} />
            )}
            {(phase === 'confirm' || saving) && (
              <ConfirmCard answers={answers} saving={saving} onEdit={editField} onConfirm={confirmSave} />
            )}
          </div>

          {phase === 'name' && (
            <div style={{ flex: 'none', padding: '13px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
              <NameInput initial={answers.name} error={error} onSubmit={submitName} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
