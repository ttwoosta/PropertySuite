/* Maintenance Scheduler — shell + screens.
   Depends on: ps-ui.jsx (window globals) and maintenance-data.js (window.MAINT). */
const { useState, useEffect, useMemo, useRef } = React;
const MDS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button, IconButton, Badge, Checkbox, Avatar, Card, Input, StatCard } = MDS;
const { PROPERTIES, statusOf, dueLabel, HISTORY, dateLabel, agoLabel, monthLabel } = window.MAINT;

const VIEWS = [
{ id: 'schedule', label: 'Schedule', icon: 'calendar', title: 'Schedule',
  sub: () => 'Everything sorted by due date' },
{ id: 'prep', label: 'Prep', icon: 'clipboard-check', title: 'Task prep',
  sub: () => 'Gather supplies before you start' },
{ id: 'history', label: 'History', icon: 'history', title: 'History',
  sub: () => 'Completed maintenance across your properties' },
{ id: 'smart', label: 'Smart Plan', icon: 'sparkles', title: 'Smart plan',
  sub: () => 'Batch tasks into your free time' }];


const STATUS_TONE = { overdue: 'danger', soon: 'warning', upcoming: 'neutral', done: 'success' };

/* ---------- task row (Home) ---------- */
function MaintRow({ task, onToggle, onEdit }) {
  const st = statusOf(task);
  return (
    <div onClick={() => onEdit(task)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
      background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
      padding: '14px var(--card-pad)', cursor: 'pointer', overflow: 'hidden',
      boxShadow: 'var(--shadow-xs)', opacity: task.done ? 0.6 : 1 }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: st === 'overdue' ? 'var(--danger-solid)' : st === 'soon' ? 'var(--warn-solid)' : st === 'done' ? 'var(--success-solid)' : 'var(--gray-300)' }} />
      <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `color-mix(in srgb, ${task.tint} 14%, var(--surface-card))`, color: task.tint }}>
        <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide={task.icon}></i></span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-heading)',
          textDecoration: task.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <Badge tone="neutral" size="sm">{task.recurrence}</Badge>
          <span className="ps-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{task.durationMin} min</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
        <Badge tone={STATUS_TONE[st]} dot={st === 'overdue' || st === 'soon'}>{dueLabel(task.dueInDays)}</Badge>
        <span onClick={(e) => {e.stopPropagation();onToggle(task.id);}}>
          <Checkbox checked={task.done} onChange={() => {}} />
        </span>
      </div>
    </div>);

}

/* ---------- Home ---------- */
function HomeScreen({ tasks, prop, onToggle, onEdit, onAdd, onTogglePrep }) {
  const mine = tasks.filter((t) => t.property === prop.id);
  const overdue = mine.filter((t) => statusOf(t) === 'overdue');
  const soon = mine.filter((t) => statusOf(t) === 'soon');
  const done = mine.filter((t) => t.done);
  const [prepOpen, setPrepOpen] = useState(false);
  const visible = [...overdue, ...soon];
  const empty = visible.length === 0 && done.length === 0;

  return (
    <div className="ps-fade">
      {overdue.length > 0 &&
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', marginBottom: 18,
        background: 'var(--danger-bg)', border: '1px solid color-mix(in srgb, var(--danger-solid) 30%, transparent)',
        borderRadius: 'var(--radius-md)', color: 'var(--danger-fg)' }}>
          <Icon name="alert-triangle" size={18} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {overdue.length} overdue {overdue.length === 1 ? 'task needs' : 'tasks need'} attention. Safety checks should be actioned first.
          </span>
        </div>
      }

      {empty ?
      <Card><EmptyState icon="check-circle-2" title="You're all caught up"
        body={'Nothing is due this week at ' + prop.name + '. Add a task or check the schedule for what\u2019s coming up.'}
        action={<Button variant="primary" leadingIcon={di('plus')} onClick={onAdd}>Add task</Button>} /></Card> :

      <>
          {overdue.length > 0 &&
        <section style={{ marginBottom: 26 }}>
              <SectionTitle count={overdue.length + (overdue.length === 1 ? ' task' : ' tasks')} tone="danger">Overdue</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {overdue.map((t) => <MaintRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} />)}
              </div>
            </section>
        }
          {soon.length > 0 &&
        <section style={{ marginBottom: 26 }}>
              <SectionTitle count={soon.length + (soon.length === 1 ? ' task' : ' tasks')}>This week</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {soon.map((t) => <MaintRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} />)}
              </div>
            </section>
        }

          {/* Get ready collapsible */}
          {visible.length > 0 &&
          <Card padding="0" style={{ overflow: 'hidden', marginBottom: 22 }}>
            <button onClick={() => setPrepOpen((o) => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12, padding: '15px var(--card-pad)', background: 'transparent',
            border: 'none', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="package-check" size={18} style={{ color: 'var(--brand)' }} />
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Get ready</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Prep supplies for this week</span>
              </span>
              <span style={{ display: 'inline-flex', width: 18, height: 18, color: 'var(--text-muted)',
              transform: prepOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}>
                <i data-lucide="chevron-down"></i></span>
            </button>
            {prepOpen &&
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--card-pad)', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {visible.map((t) =>
            <div key={t.id}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 9 }}>{t.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {t.prep.map((item) =>
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <span onClick={() => onTogglePrep(t.id, item.id)} style={{ cursor: 'pointer', flex: 1 }}>
                            <Checkbox checked={item.done} onChange={() => {}} label={item.label} />
                          </span>
                          <IconButton label="Add photo" variant="ghost" size="sm">{di('camera')}</IconButton>
                        </div>
                )}
                    </div>
                  </div>
            )}
              </div>
          }
          </Card>
          }

          {done.length > 0 &&
        <section style={{ marginBottom: 26 }}>
              <SectionTitle count={done.length + (done.length === 1 ? ' task' : ' tasks')} tone="success">Done</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {done.map((t) => <MaintRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} />)}
              </div>
            </section>
        }
        </>
      }

      <Button variant="secondary" fullWidth leadingIcon={di('plus')} onClick={onAdd}>Add task</Button>
    </div>);

}

/* ---------- Prep ---------- */
function PrepItem({ tid, item, onToggle, onUpdate, onRemove, onPhoto }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.label);
  const fileRef = useRef(null);
  useEffect(() => { window.PS.icons(); }, [editing]);
  const begin = () => { setDraft(item.label); setEditing(true); };
  const commit = () => { const v = draft.trim(); if (v) onUpdate(tid, item.id, v); setEditing(false); };
  const pick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhoto(tid, item.id, reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <Input value={draft} autoFocus onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }} />
        </div>
        <IconButton label="Save item" variant="ghost" size="sm" onClick={commit}>{di('check')}</IconButton>
        <IconButton label="Cancel" variant="ghost" size="sm" onClick={() => setEditing(false)}>{di('x')}</IconButton>
      </div>);
  }
  const openPicker = () => { if (fileRef.current) fileRef.current.click(); };
  const thumbStyle = { flex: 'none', width: 30, height: 30, padding: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-default)', cursor: 'pointer', background: 'none' };
  return (
    <div className="ps-prep-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      {item.photo ? (
        <button type="button" onClick={openPicker} title="Replace photo" style={thumbStyle}>
          <img src={item.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </button>
      ) : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        <Checkbox checked={item.done} onChange={() => onToggle(tid, item.id)} label={item.label} />
      </span>
      <span className="ps-prep-actions" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pick} style={{ display: 'none' }} />
        <IconButton label={item.photo ? 'Replace photo' : 'Take photo'} variant="ghost" size="sm" onClick={openPicker}>{di('camera')}</IconButton>
        <IconButton label="Edit item" variant="ghost" size="sm" onClick={begin}>{di('pencil')}</IconButton>
        <IconButton label="Remove item" variant="ghost" size="sm" onClick={() => onRemove(tid, item.id)}>{di('trash-2')}</IconButton>
      </span>
    </div>);
}

function AddPrepRow({ tid, onAdd }) {
  const [val, setVal] = useState('');
  const add = () => { const v = val.trim(); if (!v) return; onAdd(tid, v); setVal(''); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <div style={{ flex: 1 }}>
        <Input value={val} placeholder="Add supply…" onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
      </div>
      <IconButton label="Add item" variant="ghost" size="sm" onClick={add}>{di('plus')}</IconButton>
    </div>);
}

function PrepScreen({ tasks, prop, onTogglePrep, onAddPrep, onUpdatePrep, onRemovePrep, onPhotoPrep }) {
  // Show prep for every task across all properties (matches the unified Schedule view).
  if (!tasks.length) return <Card><EmptyState icon="clipboard" title="No tasks to prep" body="Add a task to build its supply checklist." /></Card>;

  const propName = (id) => { const p = PROPERTIES.find((x) => x.id === id); return p ? (p.short || p.name) : id; };
  const propColor = (id) => { const p = PROPERTIES.find((x) => x.id === id); return p ? p.color : 'var(--text-faint)'; };

  // group tasks by property, ordered to match PROPERTIES then any extras
  const order = [...PROPERTIES.map((p) => p.id), ...new Set(tasks.map((t) => t.property))];
  const seen = new Set();
  const groups = order
    .filter((id) => { if (seen.has(id)) return false; seen.add(id); return true; })
    .map((id) => ({ id, items: tasks.filter((t) => t.property === id) }))
    .filter((g) => g.items.length);

  const TaskCard = (t) => {
    const done = t.prep.filter((p) => p.done).length;
    return (
      <Card key={t.id}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ flex: 'none', width: 36, height: 36, borderRadius: 'var(--radius-md)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${t.tint} 14%, var(--surface-card))`, color: t.tint }}>
            <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide={t.icon}></i></span>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>{t.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{done}/{t.prep.length} ready</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {t.prep.map((item) =>
          <PrepItem key={item.id} tid={t.id} item={item} onToggle={onTogglePrep}
            onUpdate={onUpdatePrep} onRemove={onRemovePrep} onPhoto={onPhotoPrep} />
          )}
          <AddPrepRow tid={t.id} onAdd={onAddPrep} />
        </div>
      </Card>);
  };

  return (
    <div className="ps-fade">
      {groups.map((g) =>
      <section key={g.id} style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', flex: 'none', background: propColor(g.id) }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{propName(g.id)}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {g.items.length} {g.items.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {g.items.map(TaskCard)}
        </div>
      </section>)}
    </div>);

}

/* ---------- conversational "add a schedule" entry ---------- */
function ChatAddCard({ onClick }) {
  return (
    <button onClick={onClick} className="ms-chat-add"
      style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', marginBottom: 20,
        padding: '16px var(--card-pad)', cursor: 'pointer', background: 'var(--surface-card)',
        border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flex: 'none',
        borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
        <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide="sparkles"></i></span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>Add a schedule with chat</span>
        <span style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>Answer three quick questions and we’ll set it up for you.</span>
      </span>
      <span style={{ display: 'inline-flex', width: 18, height: 18, flex: 'none', color: 'var(--text-faint)' }}><i data-lucide="arrow-right"></i></span>
    </button>
  );
}

function PlanAddCard({ onClick }) {
  return (
    <button onClick={onClick} className="ms-chat-add"
      style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', marginBottom: 20,
        padding: '16px var(--card-pad)', cursor: 'pointer', background: 'var(--surface-card)',
        border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', fontFamily: 'inherit' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flex: 'none',
        borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand)' }}>
        <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide="wand-sparkles"></i></span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-heading)' }}>Suggest a plan for this property</span>
        <span style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>Tell us the type & location — we’ll fill the schedule with upkeep tasks.</span>
      </span>
      <span style={{ display: 'inline-flex', width: 18, height: 18, flex: 'none', color: 'var(--text-faint)' }}><i data-lucide="arrow-right"></i></span>
    </button>
  );
}

/* ---------- Schedule ---------- */
function ScheduleScreen({ tasks, prop, onToggle, onRecur, onAdd, onChatAdd, onPlanAdd, onTogglePrep }) {
  const mine = tasks;
  const SEED_HOUSE = { maple: 'Maple Court', birch: 'Birchwood House', oak: 'Oakfield Lodge' };
  const houseName = (id) => {
    const p = PROPERTIES.find((x) => x.id === id);
    if (p && p.name) return p.name;
    if (SEED_HOUSE[id]) return SEED_HOUSE[id];
    return id ? String(id).charAt(0).toUpperCase() + String(id).slice(1) : '';
  };
  const overdue = mine.filter((t) => statusOf(t) === 'overdue').sort((a, b) => a.dueInDays - b.dueInDays);
  const thisWeek = mine.filter((t) => statusOf(t) === 'soon').sort((a, b) => a.dueInDays - b.dueInDays);
  const upcoming = mine.filter((t) => statusOf(t) === 'upcoming' && !t.done).sort((a, b) => a.dueInDays - b.dueInDays);
  const soon = thisWeek;
  const visible = [...overdue, ...soon];
  const photos = visible.flatMap((t) => t.prep.filter((p) => p.photo).map((p) => ({ id: t.id + '-' + p.id, photo: p.photo, label: p.label })));
  const [prepOpen, setPrepOpen] = useState(false);

  const Row = (t) => {
    const st = statusOf(t);
    return (
      <div key={t.id} onClick={() => onRecur(t)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13,
        padding: '12px 16px', background: 'var(--surface-card)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)', cursor: 'pointer', boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: st === 'overdue' ? 'var(--danger-solid)' : st === 'soon' ? 'var(--warn-solid)' : st === 'done' ? 'var(--success-solid)' : 'var(--gray-300)' }} />
        <span style={{ flex: 'none', width: 34, height: 34, borderRadius: 'var(--radius-sm)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${t.tint} 14%, var(--surface-card))`, color: t.tint }}>
          <span style={{ display: 'inline-flex', width: 18, height: 18 }}><i data-lucide={t.icon}></i></span>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-heading)' }}>{t.name}</div>
          {houseName(t.property) &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            <span style={{ display: 'inline-flex', width: 12, height: 12 }}><i data-lucide="home"></i></span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{houseName(t.property)}</span>
          </div>
          }
        </div>
        <Badge tone="brand" size="sm">{t.recurrence}</Badge>
        <Badge tone={STATUS_TONE[st]} dot={st === 'overdue' || st === 'soon'}>{dueLabel(t.dueInDays)}</Badge>
        <span onClick={(e) => {e.stopPropagation();onToggle(t.id);}}>
          <Checkbox checked={t.done} onChange={() => {}} />
        </span>
      </div>);

  };

  return (
    <div className="ps-fade">
      <ChatAddCard onClick={onChatAdd} />
      <PlanAddCard onClick={onPlanAdd} />
      {overdue.length > 0 &&
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', marginBottom: 18,
        background: 'var(--danger-bg)', border: '1px solid color-mix(in srgb, var(--danger-solid) 30%, transparent)',
        borderRadius: 'var(--radius-md)', color: 'var(--danger-fg)' }}>
          <Icon name="alert-triangle" size={18} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {overdue.length} overdue {overdue.length === 1 ? 'task needs' : 'tasks need'} attention. Safety checks should be actioned first.
          </span>
        </div>
      }
      {overdue.length > 0 &&
      <section style={{ marginBottom: 26 }}>
          <SectionTitle tone="danger" count={overdue.length}>Overdue</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{overdue.map(Row)}</div>
        </section>
      }
      {thisWeek.length > 0 &&
      <section style={{ marginBottom: 26 }}>
          <SectionTitle count={thisWeek.length}>This week</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{thisWeek.map(Row)}</div>
        </section>
      }
      {visible.length > 0 &&
      <Card padding="0" style={{ overflow: 'hidden', marginBottom: 22 }}>
        <button onClick={() => setPrepOpen((o) => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, padding: '15px var(--card-pad)', background: 'transparent',
        border: 'none', cursor: 'pointer' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="package-check" size={18} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>Get ready</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Prep supplies for this week</span>
          </span>
          <span style={{ display: 'inline-flex', width: 18, height: 18, color: 'var(--text-muted)',
          transform: prepOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}>
            <i data-lucide="chevron-down"></i></span>
        </button>
        {prepOpen &&
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--card-pad)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {visible.map((t) =>
          <div key={t.id}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 9 }}>{t.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {t.prep.map((item) =>
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span onClick={() => onTogglePrep(t.id, item.id)} style={{ cursor: 'pointer', flex: 1 }}>
                  <Checkbox checked={item.done} onChange={() => {}} label={item.label} />
                </span>
                <IconButton label="Add photo" variant="ghost" size="sm">{di('camera')}</IconButton>
              </div>
              )}
            </div>
          </div>
          )}
          {photos.length > 0 &&
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
              <Icon name="image" size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>Photos</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {photos.map((p) =>
              <img key={p.id} src={p.photo} alt={p.label} title={p.label}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }} />
              )}
            </div>
          </div>
          }
        </div>
        }
      </Card>
      }
      <section>
        <SectionTitle count={upcoming.length}>Upcoming</SectionTitle>
        {upcoming.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{upcoming.map(Row)}</div> :
        <Card><EmptyState icon="calendar-check" title="Nothing upcoming" body="All scheduled tasks are done for now." /></Card>}
      </section>

      <Button variant="secondary" fullWidth leadingIcon={di('plus')} onClick={onAdd} style={{ marginTop: 22 }}>Add schedule</Button>
    </div>);

}

/* ---------- History ---------- */
function HistoryScreen({ tasks, prop }) {
  const propName = (id) => { const p = PROPERTIES.find((x) => x.id === id); return p ? (p.short || p.name) : id; };
  const propColor = (id) => { const p = PROPERTIES.find((x) => x.id === id); return p ? p.color : 'var(--text-faint)'; };
  // every task completed in-session across all properties → log entries
  const sessionDone = tasks
    .filter((t) => t.done)
    .map((t) => ({
      id: 'live-' + t.id, name: t.name, icon: t.icon, tint: t.tint, property: t.property,
      recurrence: t.recurrence, durationMin: t.durationMin,
      daysAgo: Math.max(0, Math.floor((Date.now() - (t.completedAt || Date.now())) / 86400000)),
      by: 'You', live: true,
    }));
  const entries = [...sessionDone, ...HISTORY].sort((a, b) => a.daysAgo - b.daysAgo);

  if (!entries.length)
    return <Card><EmptyState icon="history" title="No history yet"
      body="Completed tasks across your properties will be logged here as you tick them off." /></Card>;

  // group by month
  const groups = [];
  entries.forEach((e) => {
    const key = monthLabel(e.daysAgo);
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, items: [] }; groups.push(g); }
    g.items.push(e);
  });

  const totalMin = entries.reduce((s, e) => s + e.durationMin, 0);
  const hrs = Math.floor(totalMin / 60), mins = totalMin % 60;

  return (
    <div className="ps-fade">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
        <StatCard label="Tasks completed" value={entries.length} icon={di('check-circle-2')} tone="brand" />
        <StatCard label="Time logged" value={hrs ? hrs + 'h ' + mins + 'm' : mins + 'm'} icon={di('clock')} />
      </div>

      {groups.map((g) =>
      <section key={g.key} style={{ marginBottom: 26 }}>
          <SectionTitle count={g.items.length + (g.items.length === 1 ? ' task' : ' tasks')} tone="success">{g.key}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {g.items.map((e) =>
            <div key={e.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
              background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
              padding: '14px var(--card-pad)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--success-solid)' }} />
                <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `color-mix(in srgb, ${e.tint} 14%, var(--surface-card))`, color: e.tint }}>
                  <span style={{ display: 'inline-flex', width: 20, height: 20 }}><i data-lucide={e.icon}></i></span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-heading)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: propColor(e.property) }} />
                      {propName(e.property)}</span>
                    <Badge tone="neutral" size="sm">{e.recurrence}</Badge>
                    <span className="ps-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{e.durationMin} min</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>· {e.by}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flex: 'none' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)' }}>{dateLabel(e.daysAgo)}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{agoLabel(e.daysAgo)}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>);

}

/* ---------- App root ---------- */
function MaintApp() {
  const [authState, setAuthState] = useState('resolving');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(() => window.MAINT.TASKS.map((t) => ({ ...t, prep: t.prep.map((p) => ({ ...p })) })));
  const [propId, setPropId] = useState(null);
  const [, setTick] = useState(0);   // bump to re-render when MAINT.PROPERTIES changes in place
  const [view, setView] = useState('schedule');
  const [theme, toggleTheme] = useTheme('maint');
  const [editing, setEditing] = useState(null); // task | 'new' | null
  const [recurring, setRecurring] = useState(null);
  const [chat, setChat] = useState(false);
  const [plan, setPlan] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let unsub = null, alive = true;
    (async () => {
      const u = await window.PS.Auth.ready();
      if (!alive) return;
      if (!u) { window.location.href = 'Property Suite.html'; return; }
      await window.PS_STORE.ready();
      if (!alive) return;
      window.MAINT.fromStore();
      setUser(u);
      setPropId((p) => p || (PROPERTIES[0] && PROPERTIES[0].id) || 'maple');
      setAuthState('in');
      unsub = window.PS_STORE.subscribe(() => { window.MAINT.fromStore(); setTick((n) => n + 1); });
    })();
    return () => { alive = false; if (unsub) unsub(); };
  }, []);
  useEffect(() => {window.PS.icons();});

  const prop = PROPERTIES.find((p) => p.id === propId);

  const toggle = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t));
  const togglePrep = (tid, pid) => setTasks((ts) => ts.map((t) => t.id === tid ?
  { ...t, prep: t.prep.map((p) => p.id === pid ? { ...p, done: !p.done } : p) } : t));
  const addPrep = (tid, label) => setTasks((ts) => ts.map((t) => t.id === tid ?
  { ...t, prep: [...t.prep, { id: 'p' + Date.now(), label, done: false }] } : t));
  const updatePrep = (tid, pid, label) => setTasks((ts) => ts.map((t) => t.id === tid ?
  { ...t, prep: t.prep.map((p) => p.id === pid ? { ...p, label } : p) } : t));
  const removePrep = (tid, pid) => setTasks((ts) => ts.map((t) => t.id === tid ?
  { ...t, prep: t.prep.filter((p) => p.id !== pid) } : t));
  const photoPrep = (tid, pid, photo) => setTasks((ts) => ts.map((t) => t.id === tid ?
  { ...t, prep: t.prep.map((p) => p.id === pid ? { ...p, photo } : p) } : t));
  const saveTask = (data) => {
    setTasks((ts) => {
      if (data.id) return ts.map((t) => t.id === data.id ? { ...t, ...data } : t);
      return [...ts, { ...data, id: 'n' + Date.now(), done: false, completedAt: null, prep: data.prep || [] }];
    });
    toast(data.id ? 'Task updated' : 'Task added');
    setEditing(null);
  };
  const addFromChat = (data) => {
    setTasks((ts) => [...ts, { ...data, id: 'n' + Date.now(), done: false, completedAt: null, prep: data.prep || [] }]);
    setChat(false);
    toast('Schedule added · ' + data.name);
  };
  const addPlan = (list) => {
    setTasks((ts) => [...ts, ...list.map((d, i) => ({ ...d, id: 'n' + Date.now() + '_' + i, done: false, completedAt: null, prep: d.prep || [] }))]);
    setPlan(false);
    toast(list.length + (list.length === 1 ? ' schedule added' : ' schedules added'));
  };
  const deleteTask = (id) => {setTasks((ts) => ts.filter((t) => t.id !== id));toast('Task deleted', 'danger');setEditing(null);};
  const setRecurrence = (id, rec, startDate, property) => {
    const today = new Date().toISOString().slice(0, 10);
    const dueInDays = startDate
      ? Math.round((new Date(startDate + 'T00:00:00').getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000)
      : undefined;
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, recurrence: rec, startDate,
      ...(dueInDays != null ? { dueInDays } : {}), ...(property ? { property } : {}) } : t));
    toast('Cadence updated');setRecurring(null);
  };

  if (authState === 'resolving') return <Spinner label="Loading Maintenance Scheduler…" />;

  const v = VIEWS.find((x) => x.id === view);
  const signOut = () => { window.PS.Auth.signOut().finally(() => { window.location.href = 'Property Suite.html'; }); };

  const sidebar = <Sidebar properties={PROPERTIES} propId={propId} onProp={setPropId}
  view={view} onView={setView} theme={theme} onToggleTheme={toggleTheme} />;

  const topBar =
  <div className="ps-topbar">
      <Hamburger />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--text-heading)' }}>{v.title}</h1>
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 1 }}>{v.sub(prop)}</div>
      </div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <a href="Profile.html" title="Profile" aria-label="Profile" onClick={() => window.PS.rememberApp()}
      style={{ display: 'flex', background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', textDecoration: 'none' }}>
        <Avatar name={user.name} size="md" />
      </a>
    </div>;


  const phoneChips = PROPERTIES.map((p) =>
  <button key={p.id} onClick={() => setPropId(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 7,
    flex: 'none', padding: '7px 13px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
    border: '1px solid ' + (p.id === propId ? 'var(--brand)' : 'var(--border-default)'),
    background: p.id === propId ? 'var(--brand-tint)' : 'var(--surface-card)',
    color: p.id === propId ? 'var(--brand-on-tint)' : 'var(--text-body)',
    fontSize: 'var(--text-sm)', fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
      {p.short}
    </button>
  );

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar} phoneChips={phoneChips}>
      {view === 'prep' && <PrepScreen tasks={tasks} prop={prop} onTogglePrep={togglePrep}
      onAddPrep={addPrep} onUpdatePrep={updatePrep} onRemovePrep={removePrep} onPhotoPrep={photoPrep} />}
      {view === 'schedule' && <ScheduleScreen tasks={tasks} prop={prop} onToggle={toggle} onRecur={setRecurring} onAdd={() => setEditing('new')} onChatAdd={() => setChat(true)} onPlanAdd={() => setPlan(true)} onTogglePrep={togglePrep} />}
      {view === 'history' && <HistoryScreen tasks={tasks} prop={prop} />}
      {view === 'smart' && <SmartPlan tasks={tasks} prop={prop} />}

      {editing && <TaskEditor task={editing === 'new' ? null : editing} defaultProp={propId}
      onClose={() => setEditing(null)} onSave={saveTask} onDelete={deleteTask} Segmented={Segmented} />}
      {recurring && <RecurrenceEditor task={recurring} onClose={() => setRecurring(null)} onSave={setRecurrence} Segmented={Segmented} />}
      {chat && window.MaintenanceChat &&
        <MaintenanceChat propId={propId} propName={prop ? prop.name : ''} onClose={() => setChat(false)} onComplete={addFromChat} />}
      {plan && window.MaintenancePlanChat &&
        <MaintenancePlanChat propId={propId} propName={prop ? prop.name : ''} onClose={() => setPlan(false)} onComplete={addPlan} />}
    </ResponsiveShell>);

}

/* ---------- Sidebar ---------- */
function Sidebar({ properties, propId, onProp, view, onView, theme, onToggleTheme }) {
  const { close } = useDrawer();
  const pick = (fn, v) => {fn(v);close();};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '18px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="Property Suite.html" title="Back to launcher" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="assets/logo-mark.svg" width="30" height="30" alt="" />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-heading)' }}>Maintenance</span>
        </a>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px 12px' }}>
        <div className="eyebrow" style={{ padding: '10px 8px 7px' }}>Views</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {VIEWS.map((vw) =>
          <MDS.NavItem key={vw.id} icon={di(vw.icon)} label={vw.label} active={view === vw.id} onClick={() => pick(onView, vw.id)} style={{ padding: "16px 12px" }} />
          )}
        </div>
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <div className="eyebrow" style={{ padding: '2px 8px 7px' }}>Apps</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
          {[
          { name: 'Houses', href: 'Houses.html', icon: 'building-2' },
          { name: 'Rent Tracker', href: 'Rent Tracker.html', icon: 'wallet' },
          { name: 'Tenant Bridge', href: 'Tenant Bridge.html', icon: 'messages-square' },
          ].map((a) =>
          <a key={a.href} href={a.href} className="ms-app-link" style={{ display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 12px', borderRadius: 'var(--radius-md)', textDecoration: 'none',
            color: 'var(--text-body)', fontSize: 'var(--text-base)', fontWeight: 500 }}>
            <Icon name={a.icon} size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ flex: 1 }}>{a.name}</span>
            <Icon name="arrow-up-right" size={14} style={{ color: 'var(--text-faint)' }} />
          </a>
          )}
        </div>
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0 8px' }}></div>
        <button onClick={onToggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '9px 12px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          background: 'transparent', color: 'var(--text-body)', fontSize: 'var(--text-base)', fontWeight: 500 }}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} style={{ color: 'var(--text-muted)' }} />
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastHost><MaintApp /></ToastHost>
);