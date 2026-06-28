/* Maintenance Scheduler — "Suggest a maintenance plan".
   A conversational modal that asks two things — property TYPE and LOCATION /
   setting — pre-filled from what the landlord has already entered for the
   property (address + room count from the store), then proposes a batch of
   NON-STRUCTURAL upkeep schedules tuned to that type + setting. Scope is
   deliberately limited to work that does NOT touch structure, egress, fire
   protection, plumbing, gas or electrical systems — i.e. painting,
   landscaping, locks, gutters, shutters and similar.
   Hands the chosen tasks back via onComplete(tasks[]); the host writes them.
   Loaded after maintenance-chat.jsx. Exports window.MaintenancePlanChat. */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const PDS = window.MaintenanceSchedulerDesignSystem_02479c;
  const { Button, Card, Checkbox } = PDS;

  /* ---------- non-structural upkeep catalogue + planner ---------- */
  // Each item is general property upkeep only. cadence/relevance flexes with
  // property type and local setting so the plan feels tailored, not canned.
  function planFor(type, env) {
    const t = (type || '').toLowerCase();
    const isHMO = /hmo|multiple|share/.test(t);
    const isFlat = /flat|apartment|studio|maisonette/.test(t);
    const isHouse = /house|bungalow|detached|semi|terrace|cottage/.test(t) || (!isHMO && !isFlat);
    const hasGarden = isHouse || isHMO;
    const coastal = env === 'Coastal', rural = env === 'Rural', urban = env === 'Urban';
    const list = [];
    const add = (o) => list.push(o);

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

    add({ name: 'Shutter & blind check', icon: 'blinds', tint: 'var(--gray-500)',
      recurrence: 'Quarterly', durationMin: 25,
      prep: ['Lubricant for runners', 'Screwdriver set', 'Cloth'],
      why: coastal ? 'Sea-facing shutters seize without regular care.' : 'Keeps slats and runners moving freely.' });

    if (isHouse) add({ name: 'Fence & gate inspection', icon: 'fence', tint: 'var(--amber-400)',
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

    // stagger start dates so they don't all land on one day; pre-check the top 5
    return list.map((o, i) => ({
      ...o, bucket: o.durationMin < 20 ? 'quick' : 'long',
      dueInDays: 7 + i * 5, on: i < 5, id: 'sg' + i,
    }));
  }

  /* ---------- read what's already on file for this property ---------- */
  function existing(propId) {
    try {
      const h = (window.PS_STORE.getHouses() || []).find((x) => x.id === propId);
      if (!h) return { address: '', rooms: 0 };
      return { address: h.address || '', rooms: (h.rooms || []).length };
    } catch (e) { return { address: '', rooms: 0 }; }
  }
  function guessType(rooms) {
    if (rooms >= 5) return 'HMO';
    if (rooms === 1) return 'Studio';
    return 'House';
  }

  /* ---------- chat chrome (shares mc- classes) ---------- */
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

  /* ---------- step 1: property type ---------- */
  const TYPE_CHIPS = ['Flat', 'House', 'Bungalow', 'HMO', 'Studio'];
  function TypeInput({ initial, error, onSubmit }) {
    const [val, setVal] = useState(initial || '');
    const ref = useRef(null);
    useEffect(() => { if (ref.current) ref.current.focus(); window.PS.iconsSoon(); }, []);
    const submit = () => onSubmit(val);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 2 }}>
          {TYPE_CHIPS.map((c) => (
            <button key={c} type="button" onClick={() => onSubmit(c)}
              style={{ flex: 'none', padding: '7px 13px', cursor: 'pointer',
                background: val === c ? 'var(--brand-tint)' : 'var(--surface-card)',
                border: '1px solid ' + (val === c ? 'var(--brand)' : 'var(--border-default)'), borderRadius: 'var(--radius-pill)',
                fontSize: 'var(--text-sm)', fontWeight: 600, color: val === c ? 'var(--brand-on-tint)' : 'var(--text-body)', whiteSpace: 'nowrap' }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 13px',
              background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
              border: '1px solid ' + (error ? 'var(--danger-solid)' : 'var(--border-strong)'), boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ display: 'inline-flex', width: 17, height: 17, color: 'var(--text-faint)', flex: 'none' }}><i data-lucide="building-2"></i></span>
              <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
                placeholder="e.g. Semi-detached house"
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

  /* ---------- step 2: location / setting ---------- */
  const ENVS = [
    { id: 'Suburban', icon: 'home' }, { id: 'Urban', icon: 'building' },
    { id: 'Coastal', icon: 'waves' }, { id: 'Rural', icon: 'trees' },
  ];
  function LocationCard({ initialArea, initialEnv, onConfirm }) {
    const [env, setEnv] = useState(initialEnv || 'Suburban');
    const [area, setArea] = useState(initialArea || '');
    useEffect(() => { window.PS.iconsSoon(); }, [env]);
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
                    border: '1px solid ' + (on ? 'var(--brand)' : 'var(--border-default)'),
                    background: on ? 'var(--brand-tint)' : 'var(--surface-card)', color: on ? 'var(--brand-on-tint)' : 'var(--text-body)' }}>
                    <span style={{ display: 'inline-flex', width: 16, height: 16 }}><i data-lucide={e.icon}></i></span>{e.id}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', marginBottom: 9 }}>Area <span style={{ color: 'var(--text-faint)', fontWeight: 500 }}>(optional)</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 13px',
              background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}>
              <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--text-faint)', flex: 'none' }}><i data-lucide="map-pin"></i></span>
              <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Town or postcode"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-heading)' }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="primary" size="lg" fullWidth leadingIcon={<i data-lucide="sparkles"></i>}
            onClick={() => onConfirm({ env, area: area.trim() })}>Suggest a plan</Button>
        </div>
      </Card>
    );
  }

  /* ---------- step 3: suggested plan (toggle + add) ---------- */
  function PlanCard({ type, env, items, onChange, saving, onConfirm }) {
    const [showAll, setShowAll] = useState(false);
    useEffect(() => { window.PS.iconsSoon(); }, [items, saving, showAll]);
    const chosen = items.filter((x) => x.on);
    const toggle = (id) => onChange(items.map((x) => x.id === id ? { ...x, on: !x.on } : x));
    const TOP = 5;
    const shown = showAll ? items : items.slice(0, TOP);
    const hidden = items.length - TOP;
    return (
      <Card className="mc-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px 11px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--brand)' }}><i data-lucide="sparkles"></i></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Suggested plan</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>Top picks for a {type.toLowerCase()} in a {env.toLowerCase()} setting. Untick any, or browse more below.</div>
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
                <span style={{ display: 'inline-flex', width: 17, height: 17 }}><i data-lucide={it.icon}></i></span>
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
        {hidden > 0 ? (
          <button type="button" onClick={() => setShowAll((o) => !o)} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
              padding: '11px 16px', border: 'none', borderTop: '1px solid var(--border-subtle)', cursor: saving ? 'default' : 'pointer',
              background: 'var(--surface-sunken)', color: 'var(--brand)', fontFamily: 'inherit', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {showAll ? 'Show fewer' : `Show ${hidden} more ${hidden === 1 ? 'suggestion' : 'suggestions'}`}
            <span style={{ display: 'inline-flex', width: 15, height: 15, transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}><i data-lucide="chevron-down"></i></span>
          </button>
        ) : null}
        <div style={{ padding: 13, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="primary" size="lg" fullWidth disabled={saving || !chosen.length} onClick={onConfirm}
            leadingIcon={<i data-lucide={saving ? 'loader' : 'calendar-plus'}></i>}>
            {saving ? 'Adding schedules…' : chosen.length ? `Add ${chosen.length} ${chosen.length === 1 ? 'schedule' : 'schedules'}` : 'Select at least one'}
          </Button>
        </div>
      </Card>
    );
  }

  /* ---------- root ---------- */
  function MaintenancePlanChat({ propId, propName, onClose, onComplete }) {
    const seed = existing(propId);
    const [log, setLog] = useState([]);
    const [phase, setPhase] = useState('intro'); // intro | type | location | plan | saving
    const [typing, setTyping] = useState(false);
    const [error, setError] = useState(null);
    const [type, setType] = useState(guessType(seed.rooms));
    const [env, setEnv] = useState('Suburban');
    const [area, setArea] = useState(seed.address);
    const [items, setItems] = useState([]);
    const scroller = useRef(null);
    const idRef = useRef(0);
    const timers = useRef([]);
    const nid = () => 'm' + (++idRef.current);
    const push = useCallback((role, text) => setLog((l) => [...l, { id: nid(), role, text }]), []);
    const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); };

    useEffect(() => {
      setTyping(true);
      const known = seed.rooms ? ` I can see it has ${seed.rooms} ${seed.rooms === 1 ? 'room' : 'rooms'}${seed.address ? ' at ' + seed.address : ''}.` : '';
      after(700, () => {
        push('ai', `Let’s build an upkeep plan for ${propName || 'this property'}.${known} Two quick details and I’ll suggest a schedule — covering general upkeep like painting, landscaping, gutters and locks (nothing structural, gas or electrical).`);
        after(1100, () => { push('ai', 'First — what type of property is it?'); setTyping(false); setPhase('type'); });
      });
      return () => timers.current.forEach(clearTimeout);
    }, []);

    useEffect(() => { const s = scroller.current; if (s) s.scrollTop = s.scrollHeight; window.PS.icons(); }, [log, typing, phase, error, items]);
    useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

    const submitType = (raw) => {
      const v = String(raw || '').trim();
      if (v.length < 2) { setError('Tell me the property type to continue.'); return; }
      setError(null); setType(v); push('user', v);
      setTyping(true);
      after(650, () => { push('ai', `A ${v.toLowerCase()} — got it. And where is it?`); setTyping(false); setPhase('location'); });
    };

    const submitLocation = ({ env: e, area: a }) => {
      setEnv(e); setArea(a);
      push('user', a ? `${e} · ${a}` : e);
      setTyping(true);
      after(900, () => {
        setItems(planFor(type, e));
        push('ai', `Here’s a plan I’d suggest for a ${type.toLowerCase()} in a ${e.toLowerCase()} setting — tap any to skip.`);
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
          dueInDays: it.dueInDays, startDate: new Date(Date.now() + it.dueInDays * 86400000).toISOString().slice(0, 10),
          prep: it.prep.map((label, i) => ({ id: 'p' + i, label, done: false })),
        })));
      });
    };

    const order = { intro: 0, type: 0, location: 1, plan: 2, saving: 2 };
    const TOTAL = 3;
    const progress = ((order[phase] || 0) + (phase === 'saving' ? 1 : 0)) / TOTAL;
    const stepNo = Math.min((order[phase] || 0) + 1, TOTAL);
    const saving = phase === 'saving';

    return (
      <div className="mc-overlay" onMouseDown={onClose}>
        <div className="mc-card ps-fade" onMouseDown={(e) => e.stopPropagation()}>
          <header className="mc-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <img src="assets/logo-mark.svg" width="26" height="26" alt="" />
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Suggest a plan</span>
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
            {phase === 'location' ? <LocationCard initialArea={area} initialEnv={env} onConfirm={submitLocation} /> : null}
            {(phase === 'plan' || saving) ? <PlanCard type={type} env={env} items={items} onChange={setItems} saving={saving} onConfirm={confirmSave} /> : null}
          </div>

          {phase === 'type' ? (
            <div className="mc-dock"><TypeInput initial={type} error={error} onSubmit={submitType} /></div>
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

  window.MaintenancePlanChat = MaintenancePlanChat;
})();
