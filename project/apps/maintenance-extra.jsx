/* Maintenance Scheduler — Task editor, recurrence editor, Smart Plan board.
   Loaded BEFORE maintenance.jsx; exports to window. */
(function () {
  const { useState } = React;
  const XDS = window.MaintenanceSchedulerDesignSystem_02479c;
  const { Button, IconButton, Badge, Select, Input, Card } = XDS;
  const { ICONS, TINTS, PROPERTIES, statusOf } = window.MAINT;
  const RECUR = ['Weekly', 'Monthly', 'Quarterly'];

  function Field({ label, children }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)' }}>{label}</span>
        {children}
      </div>
    );
  }

  function TaskEditor({ task, defaultProp, onClose, onSave, onDelete, Segmented }) {
    const today = new Date().toISOString().slice(0, 10);
    const [f, setF] = useState(() => task ? { startDate: today, ...task } : {
      name: '', icon: 'wrench', tint: TINTS[0].value, durationMin: 30,
      bucket: 'quick', recurrence: 'Monthly', property: defaultProp, dueInDays: 14, startDate: today,
    });
    const set = (k, v) => setF(s => ({ ...s, [k]: v }));
    const save = () => { if (!f.name.trim()) return; onSave({ ...f, id: task ? task.id : undefined }); };

    return (
      <Modal open onClose={onClose} title={task ? 'Edit task' : 'New task'}
        subtitle={task ? 'Update the details for this maintenance task' : 'Add a maintenance task to this property'}
        width={500}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10 }}>
            <div>{task && <Button variant="danger-soft" leadingIcon={di('trash-2')} onClick={() => onDelete(task.id)}>Delete task</Button>}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={save}>Save</Button>
            </div>
          </div>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input label="Task name" value={f.name} placeholder="e.g. Boiler service" onChange={e => set('name', e.target.value)} />

          <Field label="Icon">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {ICONS.map(ic => {
                const on = f.icon === ic;
                return (
                  <button key={ic} onClick={() => set('icon', ic)} aria-label={ic} style={{ aspectRatio: '1', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)',
                    border: '1px solid ' + (on ? 'var(--brand)' : 'var(--border-default)'),
                    background: on ? 'var(--brand-tint)' : 'var(--surface-card)',
                    color: on ? 'var(--brand)' : 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', width: 19, height: 19 }}><i data-lucide={ic}></i></span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Tint colour">
            <div style={{ display: 'flex', gap: 10 }}>
              {TINTS.map(t => {
                const on = f.tint === t.value;
                return (
                  <button key={t.id} onClick={() => set('tint', t.value)} aria-label={t.id} style={{ width: 30, height: 30,
                    borderRadius: '50%', cursor: 'pointer', background: t.value,
                    border: '2px solid ' + (on ? 'var(--text-heading)' : 'transparent'),
                    outline: on ? '2px solid var(--surface-card)' : 'none', outlineOffset: -4,
                    boxShadow: on ? '0 0 0 2px ' + t.value : 'none' }} />
                );
              })}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Duration">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Input type="number" min="1" value={f.durationMin} onChange={e => set('durationMin', +e.target.value || 0)} />
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>min</span>
              </div>
            </Field>
            <Field label="Bucket">
              <Segmented ariaLabel="Bucket" value={f.bucket} onChange={v => set('bucket', v)}
                options={[{ value: 'quick', label: 'Quick' }, { value: 'long', label: 'Long' }]} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Recurrence">
              <Segmented ariaLabel="Recurrence" value={f.recurrence} onChange={v => set('recurrence', v)} options={RECUR} />
            </Field>
            <Field label="Start date">
              <Input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} />
            </Field>
          </div>

          <Select label="Property" value={f.property} onChange={e => set('property', e.target.value)}
            options={PROPERTIES.map(p => ({ value: p.id, label: p.name }))} />
        </div>
      </Modal>
    );
  }

  function RecurrenceEditor({ task, onClose, onSave, Segmented }) {
    const [rec, setRec] = useState(task.recurrence);
    const [startDate, setStartDate] = useState(task.startDate || '');
    const [property, setProperty] = useState(task.property);
    return (
      <Modal open onClose={onClose} title="Recurrence" subtitle={task.name} width={420}
        footer={<>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(task.id, rec, startDate, property)}>Save cadence</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Select label="Property" value={property} onChange={e => setProperty(e.target.value)}
            options={PROPERTIES.map(p => ({ value: p.id, label: p.name }))} />
          <Field label="Frequency">
            <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>How often should this task repeat?</p>
            <Segmented ariaLabel="Recurrence" value={rec} onChange={setRec} options={RECUR} />
          </Field>
          <Field label="Start date">
            <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Choose the day this cadence begins.</p>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </Field>
        </div>
      </Modal>
    );
  }

  /* -------- Smart Plan -------- */
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const PARTS = ['Morning', 'Afternoon'];

  function SmartPlan({ tasks, prop }) {
    const [unavail, setUnavail] = useState(() => new Set(['Sat', 'Sun']));
    const [assign, setAssign] = useState({}); // slotId -> taskId
    const [sel, setSel] = useState(null);     // selected taskId for click-place

    const mine = tasks.filter(t => t.property === prop.id && !t.done);
    const quick = mine.filter(t => t.bucket === 'quick');
    const long = mine.filter(t => t.bucket === 'long');
    const placed = new Set(Object.values(assign));
    const byId = Object.fromEntries(mine.map(t => [t.id, t]));

    const available = DAYS.filter(d => !unavail.has(d));
    const slots = [];
    available.slice(0, 3).forEach(d => PARTS.forEach(p => slots.push({ id: d + '-' + p, day: d, part: p })));

    const toggleDay = (d) => setUnavail(s => { const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n; });
    const place = (slotId, taskId) => setAssign(a => {
      const n = { ...a };
      for (const k in n) if (n[k] === taskId) delete n[k]; // one slot per task
      n[slotId] = taskId; return n;
    });
    const clearSlot = (slotId) => setAssign(a => { const n = { ...a }; delete n[slotId]; return n; });
    const onSlotClick = (slotId) => {
      if (assign[slotId]) { clearSlot(slotId); return; }
      if (sel) { place(slotId, sel); setSel(null); }
    };

    const Chip = (t) => {
      const on = sel === t.id, isPlaced = placed.has(t.id);
      return (
        <div key={t.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', t.id)}
          onClick={() => setSel(s => s === t.id ? null : t.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', cursor: 'grab',
            borderRadius: 'var(--radius-md)', border: '1px solid ' + (on ? 'var(--brand)' : 'var(--border-default)'),
            background: on ? 'var(--brand-tint)' : 'var(--surface-card)', opacity: isPlaced ? 0.45 : 1,
            boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ flex: 'none', width: 28, height: 28, borderRadius: 'var(--radius-sm)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${t.tint} 14%, var(--surface-card))`, color: t.tint }}>
            <span style={{ display: 'inline-flex', width: 15, height: 15 }}><i data-lucide={t.icon}></i></span>
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          <span className="ps-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.durationMin}m</span>
        </div>
      );
    };

    const Column = ({ title, items, hint }) => (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)' }}>{title}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{hint}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.length ? items.map(Chip) : <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)' }}>None</span>}
        </div>
      </div>
    );

    return (
      <div className="ps-fade">
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>Unavailable days</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 12 }}>Checked days are removed from the schedule.</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map(d => {
              const off = unavail.has(d);
              return (
                <button key={d} onClick={() => toggleDay(d)} aria-pressed={off} style={{ padding: '8px 14px', borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600,
                  border: '1px solid ' + (off ? 'var(--border-default)' : 'var(--brand)'),
                  background: off ? 'var(--surface-sunken)' : 'var(--brand-tint)',
                  color: off ? 'var(--text-faint)' : 'var(--brand-on-tint)',
                  textDecoration: off ? 'line-through' : 'none' }}>{d}</button>
              );
            })}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <Card><Column title="Quick tasks" items={quick} hint="under 20 min" /></Card>
          <Card><Column title="Long tasks" items={long} hint="20 min +" /></Card>
        </div>

        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text-heading)', margin: '4px 0 12px' }}>
          Time slots {sel && <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brand)' }}>· tap a slot to place</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
          {slots.map(s => {
            const t = assign[s.id] ? byId[assign[s.id]] : null;
            return (
              <div key={s.id} onClick={() => onSlotClick(s.id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) place(s.id, id); }}
                style={{ minHeight: 92, padding: 13, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: t ? '1px solid var(--border-default)' : '1.5px dashed var(--border-strong)',
                  background: t ? 'var(--surface-card)' : 'var(--surface-sunken)', boxShadow: t ? 'var(--shadow-xs)' : 'none' }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{s.day} · {s.part}</div>
                {t ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ flex: 'none', width: 28, height: 28, borderRadius: 'var(--radius-sm)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${t.tint} 14%, var(--surface-card))`, color: t.tint }}>
                      <span style={{ display: 'inline-flex', width: 15, height: 15 }}><i data-lucide={t.icon}></i></span>
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                      <div className="ps-mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.durationMin} min</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-faint)' }}>Drop or tap a task</div>
                )}
              </div>
            );
          })}
          {!slots.length && <div style={{ gridColumn: '1/-1', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>All days are marked unavailable — free up a day to schedule tasks.</div>}
        </div>
      </div>
    );
  }

  Object.assign(window, { TaskEditor, RecurrenceEditor, SmartPlan });
})();
