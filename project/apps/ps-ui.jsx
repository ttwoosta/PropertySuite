/* Property Suite — shared UI building blocks (Babel/JSX).
   Loaded on every app page AFTER React, the DS bundle, and ps-common.js.
   Exports everything to window so per-app scripts can use them. */

const { useState, useEffect, useRef, useCallback, createContext, useContext } = React;
const DS = window.MaintenanceSchedulerDesignSystem_02479c;
const { Button, IconButton, Avatar, Badge } = DS;

/* ---- icon helper: <i data-lucide> sized box ---- */
function Icon({ name, size = 18, color, style }) {
  return (
    <span style={{ display: 'inline-flex', width: size, height: size, color, flex: 'none', ...style }}>
      <i data-lucide={name}></i>
    </span>
  );
}
const di = (name) => <i data-lucide={name}></i>;

/* refresh lucide after every commit */
function useLucide(dep) {
  useEffect(() => { window.PS.icons(); });
}

/* ---- theme (persisted per app, applied to <html>) ---- */
function useTheme(appKey) {
  const storeKey = 'ps_theme_' + appKey;
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(storeKey) || 'light'; } catch (e) { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(storeKey, theme); } catch (e) {}
  }, [theme]);
  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggle];
}

function ThemeToggle({ theme, onToggle, size = 'md' }) {
  return (
    <IconButton label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'} variant="ghost" size={size} onClick={onToggle}>
      {di(theme === 'dark' ? 'sun' : 'moon')}
    </IconButton>
  );
}

/* ---- responsive shell with drawer ---- */
const DrawerCtx = createContext({ open: false, close: () => {}, toggle: () => {} });
const useDrawer = () => useContext(DrawerCtx);

function ResponsiveShell({ sidebar, topBar, phoneChips, children, innerStyle }) {
  const [open, setOpen] = useState(false);
  const ctx = {
    open,
    close: () => setOpen(false),
    toggle: () => setOpen(o => !o),
  };
  return (
    <DrawerCtx.Provider value={ctx}>
      <div className={'ps-shell' + (open ? ' drawer-open' : '')}>
        <aside className="ps-sidebar">{sidebar}</aside>
        <div className="ps-scrim" onClick={ctx.close}></div>
        <div className="ps-main">
          {topBar}
          {phoneChips ? <div className="ps-phone-chips">{phoneChips}</div> : null}
          <div className="ps-content">
            <div className="ps-content-inner" style={innerStyle}>{children}</div>
          </div>
        </div>
      </div>
    </DrawerCtx.Provider>
  );
}

function Hamburger() {
  const { toggle } = useDrawer();
  return (
    <button className="ps-hamburger" onClick={toggle} aria-label="Open menu"
      style={{ alignItems: 'center', justifyContent: 'center', width: 38, height: 38, flex: 'none',
        background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
        color: 'var(--text-body)', cursor: 'pointer' }}>
      <Icon name="menu" size={20} />
    </button>
  );
}

/* close drawer when a nav item is chosen */
function useNavAndClose(fn) {
  const { close } = useDrawer();
  return (...a) => { close(); fn && fn(...a); };
}

/* ---- spinner / resolving ---- */
function Spinner({ label }) {
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, background: 'var(--surface-page)' }}>
      <div className="ps-spin"></div>
      {label ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div> : null}
    </div>
  );
}

/* ---- centered modal ---- */
function Modal({ open, onClose, title, subtitle, children, footer, width = 460 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
      background: 'rgba(24,28,26,0.32)', backdropFilter: 'blur(2px)' }}>
      <div className="ps-fade" onMouseDown={e => e.stopPropagation()} style={{ width: '100%', maxWidth: width,
        maxHeight: '92dvh', overflowY: 'auto', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-pop)' }}>
        {(title || subtitle) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            padding: '20px 22px 14px' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>{title}</div>
              {subtitle ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div> : null}
            </div>
            <IconButton label="Close" variant="ghost" onClick={onClose}>{di('x')}</IconButton>
          </div>
        )}
        <div style={{ padding: '0 22px 20px' }}>{children}</div>
        {footer ? <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px',
          borderTop: '1px solid var(--border-subtle)' }}>{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---- right-side drawer (slide-in panel) ---- */
function RightDrawer({ open, onClose, title, subtitle, icon, children, footer, width = 420 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: open ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(24,28,26,0.32)',
        opacity: open ? 1 : 0, transition: 'opacity var(--dur-base) var(--ease-out)' }}></div>
      <div className="ps-drawer-panel" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: width,
        background: 'var(--surface-card)', borderLeft: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)',
        transform: open ? 'none' : 'translateX(100%)', transition: 'transform var(--dur-slow) var(--ease-out)',
        display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          padding: '20px 22px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {icon ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38,
                flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--brand-tint)', color: 'var(--brand-on-tint)' }}>
                <span style={{ display: 'inline-flex', width: 19, height: 19 }}><i data-lucide={icon}></i></span>
              </span>
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>{title}</div>
              {subtitle ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</div> : null}
            </div>
          </div>
          <IconButton label="Close" variant="ghost" onClick={onClose}>{di('x')}</IconButton>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>{children}</div>
        {footer ? <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px',
          borderTop: '1px solid var(--border-subtle)' }}>{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---- toast (bottom-right) ---- */
const ToastCtx = createContext(() => {});
const useToast = () => useContext(ToastCtx);
function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 400, display: 'flex',
        flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        {toasts.map(t => (
          <div key={t.id} className="ps-fade" style={{ display: 'flex', alignItems: 'center', gap: 9,
            padding: '11px 15px', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)',
            border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)', fontSize: 'var(--text-sm)',
            fontWeight: 600, color: 'var(--text-heading)', maxWidth: 320 }}>
            <span style={{ display: 'inline-flex', width: 16, height: 16, color: t.tone === 'danger' ? 'var(--danger-fg)' : 'var(--brand)' }}>
              <i data-lucide={t.tone === 'danger' ? 'alert-circle' : 'check-circle-2'}></i>
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---- small section heading used across apps ---- */
function SectionTitle({ children, count, tone }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '4px 0 14px' }}>
      <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.015em',
        color: tone === 'danger' ? 'var(--danger-fg)' : 'var(--text-heading)' }}>{children}</h2>
      {count != null ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span> : null}
    </div>
  );
}

/* ---- empty state ---- */
function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: 12, padding: '52px 24px', color: 'var(--text-muted)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 54,
        borderRadius: 'var(--radius-lg)', background: 'var(--surface-sunken)', color: 'var(--text-faint)' }}>
        <span style={{ display: 'inline-flex', width: 26, height: 26 }}><i data-lucide={icon}></i></span>
      </span>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-heading)' }}>{title}</div>
      {body ? <div style={{ fontSize: 'var(--text-sm)', maxWidth: 320, lineHeight: 1.5 }}>{body}</div> : null}
      {action ? <div style={{ marginTop: 6 }}>{action}</div> : null}
    </div>
  );
}

/* ---- segmented control with roving tabindex ---- */
function Segmented({ options, value, onChange, ariaLabel }) {
  const refs = useRef([]);
  const idx = options.findIndex(o => (o.value ?? o) === value);
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = options.length;
    const next = e.key === 'ArrowRight' ? (idx + 1) % n : (idx - 1 + n) % n;
    const v = options[next].value ?? options[next];
    onChange(v);
    refs.current[next] && refs.current[next].focus();
  };
  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={onKey}
      style={{ display: 'inline-flex', padding: 3, gap: 3, background: 'var(--surface-sunken)',
        border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
      {options.map((o, i) => {
        const v = o.value ?? o, l = o.label ?? o;
        const on = v === value;
        return (
          <button key={v} role="tab" aria-selected={on} tabIndex={on ? 0 : -1}
            ref={el => refs.current[i] = el} onClick={() => onChange(v)}
            style={{ padding: '6px 13px', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)',
              background: on ? 'var(--surface-card)' : 'transparent',
              color: on ? 'var(--text-heading)' : 'var(--text-muted)',
              boxShadow: on ? 'var(--shadow-xs)' : 'none', transition: 'all var(--dur-fast) var(--ease-out)' }}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  Icon, di, useLucide, useTheme, ThemeToggle,
  ResponsiveShell, Hamburger, useDrawer, useNavAndClose,
  Spinner, Modal, RightDrawer, ToastHost, useToast,
  SectionTitle, EmptyState, Segmented,
});
