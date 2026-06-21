// Maintenance Scheduler — shell + screens (port of maintenance.jsx).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  IconButton,
  NavItem,
} from '../../ds-vendor/components';
import {
  EmptyState,
  Hamburger,
  Icon,
  ResponsiveShell,
  SectionTitle,
  Spinner,
  ThemeToggle,
  ToastHost,
  useDrawer,
  useTheme,
  useToast,
  di,
} from '../../components/ui';
import { useAuth } from '../../lib/auth';
import {
  PROPERTIES,
  STATUS_TONE,
  dueLabel,
  statusOf,
  useTasks,
  type Property,
  type Recurrence,
  type Task,
  type TaskFormData,
} from './data';
import { RecurrenceEditor, SmartPlan, TaskEditor } from './editors';

interface ViewDef {
  id: string;
  label: string;
  icon: string;
  title: string;
  sub: (p: Property) => string;
}
const VIEWS: ViewDef[] = [
  { id: 'home', label: 'Home', icon: 'home', title: 'Home', sub: (p) => 'Maintenance due at ' + p.name },
  { id: 'prep', label: 'Prep', icon: 'clipboard-check', title: 'Task prep', sub: () => 'Gather supplies before you start' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar', title: 'Schedule', sub: () => 'Everything sorted by due date' },
  { id: 'smart', label: 'Smart Plan', icon: 'sparkles', title: 'Smart plan', sub: () => 'Batch tasks into your free time' },
];

/* ---------- task row (Home) ---------- */
function MaintRow({
  task,
  onToggle,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  const st = statusOf(task);
  return (
    <div
      onClick={() => onEdit(task)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '14px var(--card-pad)',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
        opacity: task.done ? 0.6 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background:
            st === 'overdue'
              ? 'var(--danger-solid)'
              : st === 'soon'
                ? 'var(--warn-solid)'
                : st === 'done'
                  ? 'var(--success-solid)'
                  : 'var(--gray-300)',
        }}
      />
      <span
        style={{
          flex: 'none',
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `color-mix(in srgb, ${task.tint} 14%, var(--surface-card))`,
          color: task.tint,
        }}
      >
        <span style={{ display: 'inline-flex', width: 20, height: 20 }}>{di(task.icon)}</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 600,
            color: 'var(--text-heading)',
            textDecoration: task.done ? 'line-through' : 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.name}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 4,
            flexWrap: 'wrap',
          }}
        >
          <Badge tone="neutral" size="sm">
            {task.recurrence}
          </Badge>
          <span
            className="ps-mono"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
          >
            {task.durationMin} min
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 'none' }}>
        <Badge tone={STATUS_TONE[st]} dot={st === 'overdue' || st === 'soon'}>
          {dueLabel(task.dueInDays)}
        </Badge>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
        >
          <Checkbox checked={task.done} onChange={() => {}} />
        </span>
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
function HomeScreen({
  tasks,
  prop,
  onToggle,
  onEdit,
  onAdd,
  onTogglePrep,
}: {
  tasks: Task[];
  prop: Property;
  onToggle: (id: string) => void;
  onEdit: (t: Task) => void;
  onAdd: () => void;
  onTogglePrep: (tid: string, pid: number) => void;
}) {
  const mine = tasks.filter((t) => t.property === prop.id);
  const overdue = mine.filter((t) => statusOf(t) === 'overdue');
  const soon = mine.filter((t) => statusOf(t) === 'soon');
  const [prepOpen, setPrepOpen] = useState(false);
  const visible = [...overdue, ...soon];
  const empty = visible.length === 0;

  return (
    <div className="ps-fade">
      {overdue.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '13px 16px',
            marginBottom: 18,
            background: 'var(--danger-bg)',
            border: '1px solid color-mix(in srgb, var(--danger-solid) 30%, transparent)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-fg)',
          }}
        >
          <Icon name="alert-triangle" size={18} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {overdue.length} overdue {overdue.length === 1 ? 'task needs' : 'tasks need'} attention.
            Safety checks should be actioned first.
          </span>
        </div>
      )}

      {empty ? (
        <Card>
          <EmptyState
            icon="check-circle-2"
            title="You're all caught up"
            body={
              'Nothing is due this week at ' +
              prop.name +
              '. Add a task or check the schedule for what’s coming up.'
            }
            action={
              <Button variant="primary" leadingIcon={di('plus')} onClick={onAdd}>
                Add task
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {overdue.length > 0 && (
            <section style={{ marginBottom: 26 }}>
              <SectionTitle
                count={overdue.length + (overdue.length === 1 ? ' task' : ' tasks')}
                tone="danger"
              >
                Overdue
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {overdue.map((t) => (
                  <MaintRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} />
                ))}
              </div>
            </section>
          )}
          {soon.length > 0 && (
            <section style={{ marginBottom: 26 }}>
              <SectionTitle count={soon.length + (soon.length === 1 ? ' task' : ' tasks')}>
                This week
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {soon.map((t) => (
                  <MaintRow key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} />
                ))}
              </div>
            </section>
          )}

          {/* Get ready collapsible */}
          <Card padding="0" style={{ overflow: 'hidden', marginBottom: 22 }}>
            <button
              onClick={() => setPrepOpen((o) => !o)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '15px var(--card-pad)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="package-check" size={18} style={{ color: 'var(--brand)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-md)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                  }}
                >
                  Get ready
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Prep supplies for this week
                </span>
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  width: 18,
                  height: 18,
                  color: 'var(--text-muted)',
                  transform: prepOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--dur-base) var(--ease-out)',
                }}
              >
                {di('chevron-down')}
              </span>
            </button>
            {prepOpen && (
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  padding: 'var(--card-pad)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                {visible.map((t) => (
                  <div key={t.id}>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 700,
                        color: 'var(--text-heading)',
                        marginBottom: 9,
                      }}
                    >
                      {t.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {t.prep.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                          }}
                        >
                          <span
                            onClick={() => onTogglePrep(t.id, item.id)}
                            style={{ cursor: 'pointer', flex: 1 }}
                          >
                            <Checkbox checked={item.done} onChange={() => {}} label={item.label} />
                          </span>
                          <IconButton label="Add photo" variant="ghost" size="sm">
                            {di('camera')}
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Button variant="secondary" fullWidth leadingIcon={di('plus')} onClick={onAdd}>
        Add task
      </Button>
    </div>
  );
}

/* ---------- Prep ---------- */
function PrepScreen({
  tasks,
  prop,
  onTogglePrep,
}: {
  tasks: Task[];
  prop: Property;
  onTogglePrep: (tid: string, pid: number) => void;
}) {
  const mine = tasks.filter((t) => t.property === prop.id);
  if (!mine.length)
    return (
      <Card>
        <EmptyState
          icon="clipboard"
          title="No tasks to prep"
          body="Add a task to build its supply checklist."
        />
      </Card>
    );
  return (
    <div
      className="ps-fade"
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
    >
      {mine.map((t) => {
        const done = t.prep.filter((p) => p.done).length;
        return (
          <Card key={t.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span
                style={{
                  flex: 'none',
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `color-mix(in srgb, ${t.tint} 14%, var(--surface-card))`,
                  color: t.tint,
                }}
              >
                <span style={{ display: 'inline-flex', width: 18, height: 18 }}>{di(t.icon)}</span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--text-md)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {done}/{t.prep.length} ready
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {t.prep.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <span
                    onClick={() => onTogglePrep(t.id, item.id)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <Checkbox checked={item.done} onChange={() => {}} label={item.label} />
                  </span>
                  <IconButton label="Capture photo" variant="ghost" size="sm">
                    {di('camera')}
                  </IconButton>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Schedule ---------- */
function ScheduleScreen({
  tasks,
  prop,
  onToggle,
  onRecur,
}: {
  tasks: Task[];
  prop: Property;
  onToggle: (id: string) => void;
  onRecur: (t: Task) => void;
}) {
  const mine = tasks.filter((t) => t.property === prop.id);
  const overdue = mine
    .filter((t) => statusOf(t) === 'overdue')
    .sort((a, b) => a.dueInDays - b.dueInDays);
  const upcoming = mine
    .filter((t) => statusOf(t) !== 'overdue' && !t.done)
    .sort((a, b) => a.dueInDays - b.dueInDays);

  const Row = (t: Task) => {
    const st = statusOf(t);
    return (
      <div
        key={t.id}
        onClick={() => onRecur(t)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          padding: '12px 16px',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span
          style={{
            flex: 'none',
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `color-mix(in srgb, ${t.tint} 14%, var(--surface-card))`,
            color: t.tint,
          }}
        >
          <span style={{ display: 'inline-flex', width: 18, height: 18 }}>{di(t.icon)}</span>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 600,
              color: 'var(--text-heading)',
            }}
          >
            {t.name}
          </div>
        </div>
        <Badge tone="brand" size="sm">
          {t.recurrence}
        </Badge>
        <Badge tone={STATUS_TONE[st]} dot={st === 'overdue' || st === 'soon'}>
          {dueLabel(t.dueInDays)}
        </Badge>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggle(t.id);
          }}
        >
          <Checkbox checked={t.done} onChange={() => {}} />
        </span>
      </div>
    );
  };

  return (
    <div className="ps-fade">
      {overdue.length > 0 && (
        <section style={{ marginBottom: 26 }}>
          <SectionTitle tone="danger" count={overdue.length}>
            Overdue
          </SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {overdue.map(Row)}
          </div>
        </section>
      )}
      <section>
        <SectionTitle count={upcoming.length}>Upcoming</SectionTitle>
        {upcoming.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {upcoming.map(Row)}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon="calendar-check"
              title="Nothing upcoming"
              body="All scheduled tasks are done for now."
            />
          </Card>
        )}
      </section>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({
  properties,
  propId,
  onProp,
  view,
  onView,
  theme,
  onToggleTheme,
}: {
  properties: Property[];
  propId: string;
  onProp: (id: string) => void;
  view: string;
  onView: (id: string) => void;
  theme: string;
  onToggleTheme: () => void;
}) {
  const { close } = useDrawer();
  const pick = <T,>(fn: (v: T) => void, v: T) => {
    fn(v);
    close();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '18px 16px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          title="Back to launcher"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <img src="/assets/logo-mark.svg" width={30} height={30} alt="" />
          <span
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--text-heading)',
            }}
          >
            Maintenance
          </span>
        </Link>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px 12px' }}>
        <div className="eyebrow" style={{ padding: '10px 8px 7px' }}>
          Property
        </div>
        <div role="listbox" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {properties.map((p) => {
            const on = p.id === propId;
            return (
              <button
                key={p.id}
                role="option"
                aria-selected={on}
                onClick={() => pick(onProp, p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 10px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: on ? 'var(--surface-active-nav)' : 'transparent',
                  color: on ? 'var(--brand-on-tint)' : 'var(--text-body)',
                  fontSize: 'var(--text-base)',
                  fontWeight: on ? 600 : 500,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: p.color,
                    flex: 'none',
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </span>
                {on && <Icon name="check" size={15} style={{ color: 'var(--brand)' }} />}
              </button>
            );
          })}
        </div>

        <div className="eyebrow" style={{ padding: '18px 8px 7px' }}>
          Views
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {VIEWS.map((vw) => (
            <NavItem
              key={vw.id}
              icon={di(vw.icon)}
              label={vw.label}
              active={view === vw.id}
              onClick={() => pick(onView, vw.id)}
            />
          ))}
        </div>
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onToggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '9px 12px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--text-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 500,
          }}
        >
          <Icon
            name={theme === 'dark' ? 'sun' : 'moon'}
            size={18}
            style={{ color: 'var(--text-muted)' }}
          />
          {theme === 'dark' ? 'Light theme' : 'Dark theme'}
        </button>
      </div>
    </div>
  );
}

/* ---------- App root ---------- */
function MaintInner() {
  const { user, signOut } = useAuth();
  const {
    tasks,
    loading,
    toggleTask,
    togglePrep,
    saveTask: persistTask,
    deleteTask: persistDelete,
    setRecurrence: persistRecurrence,
  } = useTasks(user?.uid ?? null);
  const [propId, setPropId] = useState('elm');
  const [view, setView] = useState('home');
  const [theme, toggleTheme] = useTheme('maint');
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [recurring, setRecurring] = useState<Task | null>(null);
  const toast = useToast();

  const prop = PROPERTIES.find((p) => p.id === propId)!;

  const saveTask = (data: TaskFormData) => {
    persistTask(data);
    toast(data.id ? 'Task updated' : 'Task added');
    setEditing(null);
  };
  const deleteTask = (id: string) => {
    persistDelete(id);
    toast('Task deleted', 'danger');
    setEditing(null);
  };
  const setRecurrence = (id: string, rec: Recurrence) => {
    persistRecurrence(id, rec);
    toast('Cadence updated');
    setRecurring(null);
  };

  const v = VIEWS.find((x) => x.id === view)!;

  const sidebar = (
    <Sidebar
      properties={PROPERTIES}
      propId={propId}
      onProp={setPropId}
      view={view}
      onView={setView}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );

  const topBar = (
    <div className="ps-topbar">
      <Hamburger />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow">Maintenance</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'var(--text-heading)',
            }}
          >
            {v.title}
          </h1>
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 1 }}>
          {v.sub(prop)}
        </div>
      </div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <button
        onClick={() => void signOut()}
        title="Sign out"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 10px 5px 5px',
          background: 'transparent',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
        }}
      >
        <Avatar name={user!.name} size="sm" />
        <span
          style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)' }}
        >
          {user!.name.split(' ')[0]}
        </span>
      </button>
    </div>
  );

  const phoneChips = PROPERTIES.map((p) => (
    <button
      key={p.id}
      onClick={() => setPropId(p.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        flex: 'none',
        padding: '7px 13px',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        border: '1px solid ' + (p.id === propId ? 'var(--brand)' : 'var(--border-default)'),
        background: p.id === propId ? 'var(--brand-tint)' : 'var(--surface-card)',
        color: p.id === propId ? 'var(--brand-on-tint)' : 'var(--text-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
      {p.short}
    </button>
  ));

  return (
    <ResponsiveShell sidebar={sidebar} topBar={topBar} phoneChips={phoneChips}>
      {loading ? (
        <Spinner label="Loading tasks…" />
      ) : (
        <>
      {view === 'home' && (
        <HomeScreen
          tasks={tasks}
          prop={prop}
          onToggle={toggleTask}
          onEdit={setEditing}
          onAdd={() => setEditing('new')}
          onTogglePrep={togglePrep}
        />
      )}
      {view === 'prep' && <PrepScreen tasks={tasks} prop={prop} onTogglePrep={togglePrep} />}
      {view === 'schedule' && (
        <ScheduleScreen tasks={tasks} prop={prop} onToggle={toggleTask} onRecur={setRecurring} />
      )}
      {view === 'smart' && <SmartPlan tasks={tasks} prop={prop} />}
        </>
      )}

      {editing && (
        <TaskEditor
          task={editing === 'new' ? null : editing}
          defaultProp={propId}
          onClose={() => setEditing(null)}
          onSave={saveTask}
          onDelete={deleteTask}
        />
      )}
      {recurring && (
        <RecurrenceEditor
          task={recurring}
          onClose={() => setRecurring(null)}
          onSave={setRecurrence}
        />
      )}
    </ResponsiveShell>
  );
}

export function MaintenanceApp() {
  return (
    <ToastHost>
      <MaintInner />
    </ToastHost>
  );
}
