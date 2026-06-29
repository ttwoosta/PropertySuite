// Maintenance Scheduler — "Suggest a maintenance plan" modal.
// Two-step conversational flow: property type → location/setting → suggested task list.
// Non-structural upkeep only (painting, landscaping, gutters, locks, etc.).
// Calls onComplete(tasks[]) with fully-formed tasks; the host writes them.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Checkbox } from '../../ds-vendor/components';
import { di, LucideIcon } from '../../lib/icon';
import type { Bucket, PrepItem, Recurrence, Task } from './data';

// ── Plan catalogue ────────────────────────────────────────────────────────────

type PlanEnv = 'Suburban' | 'Urban' | 'Coastal' | 'Rural';

interface PlanItem {
  id: string; name: string; icon: string; tint: string;
  recurrence: Recurrence; durationMin: number; bucket: Bucket;
  dueInDays: number; prep: string[]; why: string; on: boolean;
}

function planFor(type: string, env: PlanEnv): PlanItem[] {
  const t = (type || '').toLowerCase();
  const isHMO   = /hmo|multiple|share/.test(t);
  const isFlat  = /flat|apartment|studio|maisonette/.test(t);
  const isHouse = /house|bungalow|detached|semi|terrace|cottage/.test(t) || (!isHMO && !isFlat);
  const hasGarden = isHouse || isHMO;
  const coastal = env === 'Coastal', rural = env === 'Rural', urban = env === 'Urban';

  const raw: Omit<PlanItem, 'id' | 'bucket' | 'dueInDays' | 'on'>[] = [];
  const add = (o: typeof raw[0]) => raw.push(o);

  add({ name: 'Interior repaint & touch-ups', icon: 'paint-roller', tint: 'var(--amber-400)',
    recurrence: isHMO ? 'Monthly' : 'Quarterly', durationMin: 90,
    prep: ['Dust sheets', 'Filler & sandpaper', 'Brushes & rollers', 'Matching paint'],
    why: isHMO ? 'High turnover in an HMO scuffs walls fast.' : 'Keeps rooms fresh between tenancies.' });

  if (isHouse) add({ name: 'Exterior paint & woodwork', icon: 'paint-roller', tint: 'var(--amber-400)',
    recurrence: 'Quarterly', durationMin: 90,
    prep: ['Wire brush & scraper', 'Exterior masonry/wood paint', 'Primer & filler'],
    why: coastal ? 'Salt air strips exterior paint quickly here.' : 'Protects render and woodwork from weathering.' });

  if (hasGarden) add({ name: 'Gutter & downpipe clearing', icon: 'droplets', tint: 'var(--blue-400)',
    recurrence: rural ? 'Monthly' : 'Quarterly', durationMin: 60,
    prep: ['Ladder & stabiliser', 'Gloves & scoop', 'Garden waste sack'],
    why: rural ? 'Leaf fall in a rural setting blocks gutters often.' : 'Clears debris before it overflows.' });

  if (hasGarden) add({ name: 'Lawn mowing & edging', icon: 'sprout', tint: 'var(--green-500)',
    recurrence: 'Monthly', durationMin: 45,
    prep: ['Fuel & oil for the mower', 'Check the blade is sharp', 'Clear debris from the lawn'],
    why: 'Keeps the grounds tidy and presentable.' });

  if (hasGarden) add({ name: 'Hedge & shrub trimming', icon: 'sprout', tint: 'var(--green-500)',
    recurrence: 'Quarterly', durationMin: 60,
    prep: ['Hedge trimmer & spare line', 'Gloves & goggles', 'Green waste bags'],
    why: 'Stops boundaries overgrowing onto paths.' });

  add({ name: 'Lock & hinge lubrication', icon: 'key-round', tint: 'var(--gray-500)',
    recurrence: coastal ? 'Monthly' : 'Quarterly', durationMin: 20,
    prep: ['PTFE lubricant spray', 'Cloth', 'Spare keys to test'],
    why: coastal ? 'Coastal salt corrodes locks — lubricate more often.' : 'Keeps doors and windows operating smoothly.' });

  add({ name: 'Window & frame cleaning', icon: 'spray-can', tint: 'var(--blue-400)',
    recurrence: urban ? 'Monthly' : 'Quarterly', durationMin: 30,
    prep: ['Cleaning solution', 'Squeegee & cloths', 'Ladder for upper floors'],
    why: urban ? 'Urban grime films up glass quickly.' : 'Keeps frames clear and free of build-up.' });

  add({ name: 'Shutter & blind check', icon: 'layout-dashboard', tint: 'var(--gray-500)',
    recurrence: 'Quarterly', durationMin: 25,
    prep: ['Lubricant for runners', 'Screwdriver set', 'Cloth'],
    why: coastal ? 'Sea-facing shutters seize without regular care.' : 'Keeps slats and runners moving freely.' });

  if (isHouse) add({ name: 'Fence & gate inspection', icon: 'git-branch', tint: 'var(--amber-400)',
    recurrence: 'Quarterly', durationMin: 40,
    prep: ['Screwdriver & fixings', 'Wood preservative', 'Spare hinges / latch'],
    why: 'Catches loose panels and failing latches early.' });

  add({ name: 'Pest prevention check', icon: 'bug', tint: 'var(--red-500)',
    recurrence: rural ? 'Monthly' : 'Quarterly', durationMin: 30,
    prep: ['Bait / traps', 'Gloves & mask', 'Seal entry points'],
    why: rural ? 'Rural sites see more rodent activity.' : 'Seals gaps before pests get a foothold.' });

  if (hasGarden) add({ name: 'Driveway & path weed control', icon: 'spray-can', tint: 'var(--blue-400)',
    recurrence: 'Quarterly', durationMin: 45,
    prep: ['Weed killer / puller', 'Pressure washer', 'Stiff brush'],
    why: 'Keeps hard surfaces clear and slip-free.' });

  if (isHMO || isFlat) add({ name: 'Communal area clean & touch-up', icon: 'sparkles', tint: 'var(--amber-400)',
    recurrence: 'Monthly', durationMin: 45,
    prep: ['Cleaning supplies', 'Touch-up paint', 'Bin liners'],
    why: 'Shared spaces need frequent upkeep across tenants.' });

  return raw.map((o, i) => ({
    ...o,
    id: 'sg' + i,
    bucket: (o.durationMin < 20 ? 'quick' : 'long') as Bucket,
    dueInDays: 7 + i * 5,
    on: i < 5,
  }));
}

function guessType(rooms: number): string {
  if (rooms >= 5) return 'HMO';
  if (rooms === 1) return 'Studio';
  return 'House';
}

// ── Chat chrome (reuses mc-* CSS from MaintenanceChat) ────────────────────────

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

// ── Step 1: property type ─────────────────────────────────────────────────────

const TYPE_CHIPS = ['Flat', 'House', 'Bungalow', 'HMO', 'Studio'];

function TypeInput({ initial, error, onSubmit }: {
  initial: string; error: string | null; onSubmit: (v: string) => void;
}) {
  const [val, setVal] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => onSubmit(val);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 2 }}>
        {TYPE_CHIPS.map((c) => {
          const on = val === c;
          return (
            <button key={c} type="button" onClick={() => onSubmit(c)} style={{ flex: 'none', padding: '7px 13px', cursor: 'pointer',
              background: on ? 'var(--brand-tint)' : 'var(--surface-card)',
              border: `1px solid ${on ? 'var(--brand)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-sm)', fontWeight: 600, color: on ? 'var(--brand-on-tint)' : 'var(--text-body)', whiteSpace: 'nowrap' }}>{c}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 13px',
            background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--danger-solid)' : 'var(--border-strong)'}`, boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}>{di('building-2')}</span>
            <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
              placeholder="e.g. Semi-detached house"
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

// ── Step 2: location / setting ────────────────────────────────────────────────

const ENVS: { id: PlanEnv; icon: string }[] = [
  { id: 'Suburban', icon: 'home' },
  { id: 'Urban',    icon: 'building' },
  { id: 'Coastal',  icon: 'waves' },
  { id: 'Rural',    icon: 'trees' },
];

function LocationCard({ initialArea, initialEnv, onConfirm }: {
  initialArea: string; initialEnv: PlanEnv;
  onConfirm: (v: { env: PlanEnv; area: string }) => void;
}) {
  const [env, setEnv] = useState<PlanEnv>(initialEnv);
  const [area, setArea] = useState(initialArea);
  return (
    <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '13px 16px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Where is it?</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>
          {initialArea ? 'Pulled from the address on file — adjust if needed.' : 'The setting shapes which upkeep matters most.'}
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 9 }}>Setting</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {ENVS.map((e) => {
              const on = env === e.id;
              return (
                <button key={e.id} type="button" onClick={() => setEnv(e.id)} style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600,
                  border: `1px solid ${on ? 'var(--brand)' : 'var(--border-default)'}`,
                  background: on ? 'var(--brand-tint)' : 'var(--surface-card)', color: on ? 'var(--brand-on-tint)' : 'var(--text-body)' }}>
                  <span style={{ display: 'inline-flex', width: 16, height: 16 }}><LucideIcon name={e.icon} /></span>{e.id}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 9 }}>
            Area <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>(optional)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 13px',
            background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}>
            <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-faint)', flex: 'none' }}>{di('map-pin')}</span>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Town or postcode"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="primary" size="lg" fullWidth
          leadingIcon={<span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name="sparkles" /></span>}
          onClick={() => onConfirm({ env, area: area.trim() })}>Suggest a plan</Button>
      </div>
    </Card>
  );
}

// ── Step 3: suggested plan list ───────────────────────────────────────────────

const TOP = 5;

function PlanCard({ type, env, items, onChange, saving, onConfirm }: {
  type: string; env: PlanEnv; items: PlanItem[];
  onChange: (items: PlanItem[]) => void; saving: boolean; onConfirm: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const chosen = items.filter((x) => x.on);
  const toggle = (id: string) => onChange(items.map((x) => x.id === id ? { ...x, on: !x.on } : x));
  const shown = showAll ? items : items.slice(0, TOP);
  const hidden = items.length - TOP;

  return (
    <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--brand)' }}>{di('sparkles')}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Suggested plan</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>
            Top picks for a {type.toLowerCase()} in a {env.toLowerCase()} setting. Untick any, or browse more below.
          </div>
        </div>
      </div>
      <div>
        {shown.map((it) => (
          <button key={it.id} type="button" onClick={() => toggle(it.id)} disabled={saving}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left',
              padding: '12px 16px', border: 'none', borderTop: '1px solid var(--border-subtle)',
              background: 'transparent', cursor: saving ? 'default' : 'pointer', opacity: it.on ? 1 : 0.5 }}>
            <span style={{ flex: 'none', width: 34, height: 34, marginTop: 1, borderRadius: 'var(--radius-md)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${it.tint} 14%, var(--surface-card))`, color: it.tint }}>
              <span style={{ display: 'inline-flex', width: 17, height: 17 }}><LucideIcon name={it.icon} /></span>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>{it.name}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>{it.recurrence} · {it.durationMin} min</span>
              </span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{it.why}</span>
            </span>
            <span style={{ flex: 'none', marginTop: 2 }}><Checkbox checked={it.on} onChange={() => {}} /></span>
          </button>
        ))}
      </div>
      {hidden > 0 && (
        <button type="button" onClick={() => setShowAll((o) => !o)} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
            padding: '11px 16px', border: 'none', borderTop: '1px solid var(--border-subtle)',
            cursor: saving ? 'default' : 'pointer', background: 'var(--surface-sunken)',
            color: 'var(--brand)', fontFamily: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
          {showAll ? 'Show fewer' : `Show ${hidden} more ${hidden === 1 ? 'suggestion' : 'suggestions'}`}
          <span style={{ display: 'inline-flex', width: 15, height: 15,
            transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}>
            <LucideIcon name="chevron-down" />
          </span>
        </button>
      )}
      <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
        <Button variant="primary" size="lg" fullWidth disabled={saving || !chosen.length} onClick={onConfirm}
          leadingIcon={<span style={{ display: 'inline-flex', width: 18, height: 18 }}><LucideIcon name={saving ? 'loader' : 'calendar-plus'} /></span>}>
          {saving ? 'Adding schedules…' : chosen.length
            ? `Add ${chosen.length} ${chosen.length === 1 ? 'schedule' : 'schedules'}`
            : 'Select at least one'}
        </Button>
      </div>
    </Card>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

type Phase = 'intro' | 'type' | 'location' | 'plan' | 'saving';
interface LogEntry { id: string; role: 'ai' | 'user'; text: string }

export function MaintenancePlanChat({ propId, propName, rooms = 0, address = '', onClose, onComplete }: {
  propId: string;
  propName: string;
  rooms?: number;
  address?: string;
  onClose: () => void;
  onComplete: (tasks: Omit<Task, 'id' | 'done' | 'completedAt'>[]) => void;
}) {
  const [log, setLog]       = useState<LogEntry[]>([]);
  const [phase, setPhase]   = useState<Phase>('intro');
  const [typing, setTyping] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [type, setType]     = useState(guessType(rooms));
  const [env, setEnv]       = useState<PlanEnv>('Suburban');
  const [area, setArea]     = useState(address);
  const [items, setItems]   = useState<PlanItem[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const idRef    = useRef(0);
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nid = () => 'm' + (++idRef.current);
  const push = useCallback((role: 'ai' | 'user', text: string) =>
    setLog((l) => [...l, { id: nid(), role, text }]), []);

  useEffect(() => {
    setTyping(true);
    const known = rooms
      ? ` I can see it has ${rooms} ${rooms === 1 ? 'room' : 'rooms'}${address ? ' at ' + address : ''}.`
      : '';
    const t1 = setTimeout(() => {
      push('ai', `Let's build an upkeep plan for ${propName || 'this property'}.${known} Two quick details and I'll suggest a schedule — covering general upkeep like painting, landscaping, gutters and locks (nothing structural, gas or electrical).`);
      const t2 = setTimeout(() => { push('ai', 'First — what type of property is it?'); setTyping(false); setPhase('type'); }, 1100);
      timers.current.push(t2);
    }, 700);
    timers.current.push(t1);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [log, typing, phase, error, items]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const submitType = (raw: string) => {
    const v = raw.trim();
    if (v.length < 2) { setError('Tell me the property type to continue.'); return; }
    setError(null); setType(v); push('user', v);
    setTyping(true);
    after(650, () => {
      push('ai', `A ${v.toLowerCase()} — got it. And where is it?`);
      setTyping(false); setPhase('location');
    });
  };

  const submitLocation = ({ env: e, area: a }: { env: PlanEnv; area: string }) => {
    setEnv(e); setArea(a);
    push('user', a ? `${e} · ${a}` : e);
    setTyping(true);
    after(900, () => {
      setItems(planFor(type, e));
      push('ai', `Here's a plan I'd suggest for a ${type.toLowerCase()} in a ${e.toLowerCase()} setting — tap any to skip.`);
      setTyping(false); setPhase('plan');
    });
  };

  const confirmSave = () => {
    const chosen = items.filter((x) => x.on);
    if (!chosen.length) return;
    setPhase('saving');
    after(600, () => {
      onComplete(chosen.map((it) => ({
        name: it.name, icon: it.icon, tint: it.tint, recurrence: it.recurrence,
        durationMin: it.durationMin, bucket: it.bucket, property: propId,
        dueInDays: it.dueInDays,
        startDate: new Date(Date.now() + it.dueInDays * 86_400_000).toISOString().slice(0, 10),
        prep: it.prep.map((label, i): PrepItem => ({ id: i, label, done: false })),
      })));
    });
  };

  const ORDER: Record<Phase, number> = { intro: 0, type: 0, location: 1, plan: 2, saving: 2 };
  const TOTAL = 3;
  const saving = phase === 'saving';
  const progress = (ORDER[phase] + (saving ? 1 : 0)) / TOTAL;
  const stepNo = Math.min(ORDER[phase] + 1, TOTAL);

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
                Suggest a plan
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
            {phase === 'location' && (
              <LocationCard initialArea={area} initialEnv={env} onConfirm={submitLocation} />
            )}
            {(phase === 'plan' || saving) && (
              <PlanCard type={type} env={env} items={items} onChange={setItems} saving={saving} onConfirm={confirmSave} />
            )}
          </div>

          {phase === 'type' && (
            <div style={{ flex: 'none', padding: '13px 18px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}>
              <TypeInput initial={type} error={error} onSubmit={submitType} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
