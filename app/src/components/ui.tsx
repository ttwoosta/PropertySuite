// Shared UI building blocks (port of the prototype's ps-ui.jsx) — responsive
// shell with drawer, modal, right drawer, toasts, spinner, segmented control,
// empty/section states, and the per-app theme hook.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Button, IconButton } from '../ds-vendor/components';
import { di, Icon } from '../lib/icon';

export { di, Icon };

/* ---- theme (persisted per app, applied to <html>) ---- */
export function useTheme(appKey: string): [string, () => void] {
  const storeKey = 'ps_theme_' + appKey;
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem(storeKey) || 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(storeKey, theme);
    } catch {
      /* ignore */
    }
  }, [theme, storeKey]);
  const toggle = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );
  return [theme, toggle];
}

export function ThemeToggle({
  theme,
  onToggle,
  size = 'md',
}: {
  theme: string;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <IconButton
      label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      variant="ghost"
      size={size}
      onClick={onToggle}
    >
      {di(theme === 'dark' ? 'sun' : 'moon')}
    </IconButton>
  );
}

/* ---- responsive shell with drawer ---- */
interface DrawerCtxValue {
  open: boolean;
  close: () => void;
  toggle: () => void;
}
const DrawerCtx = createContext<DrawerCtxValue>({
  open: false,
  close: () => {},
  toggle: () => {},
});
export const useDrawer = () => useContext(DrawerCtx);

export function ResponsiveShell({
  sidebar,
  topBar,
  phoneChips,
  children,
  innerStyle,
}: {
  sidebar: ReactNode;
  topBar: ReactNode;
  phoneChips?: ReactNode;
  children: ReactNode;
  innerStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const ctx: DrawerCtxValue = {
    open,
    close: () => setOpen(false),
    toggle: () => setOpen((o) => !o),
  };
  return (
    <DrawerCtx.Provider value={ctx}>
      <div className={'ps-shell' + (open ? ' drawer-open' : '')}>
        <aside className="ps-sidebar">{sidebar}</aside>
        <div className="ps-scrim" onClick={ctx.close} />
        <div className="ps-main">
          {topBar}
          {phoneChips ? <div className="ps-phone-chips">{phoneChips}</div> : null}
          <div className="ps-content">
            <div className="ps-content-inner" style={innerStyle}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </DrawerCtx.Provider>
  );
}

export function Hamburger() {
  const { toggle } = useDrawer();
  return (
    <button
      className="ps-hamburger"
      onClick={toggle}
      aria-label="Open menu"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        flex: 'none',
        background: 'transparent',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-body)',
        cursor: 'pointer',
      }}
    >
      <Icon name="menu" size={20} />
    </button>
  );
}

/* ---- spinner / resolving ---- */
export function Spinner({ label }: { label?: string }) {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--surface-page)',
      }}
    >
      <div className="ps-spin" />
      {label ? (
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}

function useEscape(active: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [active, onClose]);
}

/* ---- centered modal ---- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(24,28,26,0.32)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="ps-fade"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: width,
          maxHeight: '92dvh',
          overflowY: 'auto',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        {(title || subtitle) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              padding: '20px 22px 14px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  color: 'var(--text-heading)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </div>
              {subtitle ? (
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    marginTop: 3,
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
            <IconButton label="Close" variant="ghost" onClick={onClose}>
              {di('x')}
            </IconButton>
          </div>
        )}
        <div style={{ padding: '0 22px 20px' }}>{children}</div>
        {footer ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '14px 22px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---- right-side drawer (slide-in panel) ---- */
export function RightDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = 420,
}: {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEscape(open, onClose);
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(24,28,26,0.32)',
          opacity: open ? 1 : 0,
          transition: 'opacity var(--dur-base) var(--ease-out)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: width,
          background: 'var(--surface-card)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
          transform: open ? 'none' : 'translateX(100%)',
          transition: 'transform var(--dur-slow) var(--ease-out)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            padding: '20px 22px 14px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {icon ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  flex: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-tint)',
                  color: 'var(--brand-on-tint)',
                }}
              >
                <Icon name={icon} size={19} />
              </span>
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  color: 'var(--text-heading)',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </div>
              {subtitle ? (
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
          <IconButton label="Close" variant="ghost" onClick={onClose}>
            {di('x')}
          </IconButton>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {children}
        </div>
        {footer ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '14px 22px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---- toast (bottom-right) ---- */
type ToastTone = 'success' | 'danger';
interface ToastItem {
  id: string;
  msg: string;
  tone: ToastTone;
}
type PushToast = (msg: string, tone?: ToastTone) => void;
const ToastCtx = createContext<PushToast>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback<PushToast>((msg, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="ps-fade"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '11px 15px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--text-heading)',
              maxWidth: 320,
            }}
          >
            <Icon
              name={t.tone === 'danger' ? 'alert-circle' : 'check-circle-2'}
              size={16}
              style={{ color: t.tone === 'danger' ? 'var(--danger-fg)' : 'var(--brand)' }}
            />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---- small section heading used across apps ---- */
export function SectionTitle({
  children,
  count,
  tone,
}: {
  children: ReactNode;
  count?: ReactNode;
  tone?: 'danger' | 'success';
}) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '4px 0 14px' }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
          color: tone === 'danger' ? 'var(--danger-fg)' : tone === 'success' ? 'var(--success-fg)' : 'var(--text-heading)',
        }}
      >
        {children}
      </h2>
      {count != null ? (
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      ) : null}
    </div>
  );
}

/* ---- empty state ---- */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: string;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 12,
        padding: '52px 24px',
        color: 'var(--text-muted)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 54,
          height: 54,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-sunken)',
          color: 'var(--text-faint)',
        }}
      >
        <Icon name={icon} size={26} />
      </span>
      <div
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--text-heading)',
        }}
      >
        {title}
      </div>
      {body ? (
        <div style={{ fontSize: 'var(--text-sm)', maxWidth: 320, lineHeight: 1.5 }}>
          {body}
        </div>
      ) : null}
      {action ? <div style={{ marginTop: 6 }}>{action}</div> : null}
    </div>
  );
}

/* ---- segmented control with roving tabindex ---- */
export interface SegOption {
  value: string;
  label: string;
}
export function Segmented({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<SegOption | string>;
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const valueOf = (o: SegOption | string) => (typeof o === 'string' ? o : o.value);
  const labelOf = (o: SegOption | string) => (typeof o === 'string' ? o : o.label);
  const idx = options.findIndex((o) => valueOf(o) === value);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = options.length;
    const next = e.key === 'ArrowRight' ? (idx + 1) % n : (idx - 1 + n) % n;
    onChange(valueOf(options[next]));
    refs.current[next]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKey}
      style={{
        display: 'inline-flex',
        padding: 3,
        gap: 3,
        background: 'var(--surface-sunken)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {options.map((o, i) => {
        const v = valueOf(o);
        const l = labelOf(o);
        const on = v === value;
        return (
          <button
            key={v}
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            ref={(el) => (refs.current[i] = el)}
            onClick={() => onChange(v)}
            style={{
              padding: '6px 13px',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              background: on ? 'var(--surface-card)' : 'transparent',
              color: on ? 'var(--text-heading)' : 'var(--text-muted)',
              boxShadow: on ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
