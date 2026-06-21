/* @ds-bundle: {"format":3,"namespace":"MaintenanceSchedulerDesignSystem_02479c","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"TaskCard","sourcePath":"components/data/TaskCard.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"20bf310d73a6","components/core/Badge.jsx":"4fec3704a92c","components/core/Button.jsx":"1a95689f9a62","components/core/Card.jsx":"9316af74f7b8","components/core/IconButton.jsx":"c0f15e48d59f","components/data/StatCard.jsx":"1be6cc921cba","components/data/TaskCard.jsx":"19dd5c094897","components/forms/Checkbox.jsx":"a02dfd7194ac","components/forms/Input.jsx":"dde8b77b71f3","components/forms/Select.jsx":"a5ecaf074b45","components/navigation/NavItem.jsx":"2cf017f24c11","ui_kits/app/DashboardScreen.jsx":"9184a95490b1","ui_kits/app/PlanScreen.jsx":"d4a6438fb916","ui_kits/app/ScheduleScreen.jsx":"4a2922a30d8b","ui_kits/app/Sidebar.jsx":"774822dbc228","ui_kits/app/data.js":"4465d802f566"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MaintenanceSchedulerDesignSystem_02479c = window.MaintenanceSchedulerDesignSystem_02479c || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  xs: 24,
  sm: 30,
  md: 38,
  lg: 48
};
function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

// Deterministic tint from name
const TINTS = [['var(--green-100)', 'var(--green-700)'], ['var(--amber-100)', 'var(--amber-700)'], ['var(--blue-50)', 'var(--blue-600)'], ['var(--red-100)', 'var(--red-700)'], ['var(--gray-200)', 'var(--gray-700)']];

/**
 * Circular avatar — image, or auto initials with a deterministic tint.
 */
function Avatar({
  name = '',
  src,
  size = 'md',
  square = false,
  style,
  ...rest
}) {
  const dim = SIZES[size] || SIZES.md;
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  const [bg, fg] = TINTS[h % TINTS.length];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: dim,
      height: dim,
      flex: 'none',
      borderRadius: square ? 'var(--radius-md)' : '50%',
      background: src ? 'var(--gray-100)' : bg,
      color: fg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: dim * 0.4,
      letterSpacing: '-0.01em',
      border: '1px solid rgba(0,0,0,0.04)',
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initialsOf(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: 'var(--gray-100)',
    fg: 'var(--gray-600)',
    dot: 'var(--gray-400)'
  },
  brand: {
    bg: 'var(--brand-tint)',
    fg: 'var(--brand-on-tint)',
    dot: 'var(--green-500)'
  },
  success: {
    bg: 'var(--success-bg)',
    fg: 'var(--success-fg)',
    dot: 'var(--success-solid)'
  },
  warning: {
    bg: 'var(--warn-bg)',
    fg: 'var(--warn-fg)',
    dot: 'var(--warn-solid)'
  },
  danger: {
    bg: 'var(--danger-bg)',
    fg: 'var(--danger-fg)',
    dot: 'var(--danger-solid)'
  }
};

/**
 * Pill-shaped status badge. Overdue alerts use `danger`, due-soon use `warning`.
 */
function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  dot = false,
  solid = false,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const dims = size === 'sm' ? {
    padding: '2px 8px',
    fontSize: '11px',
    gap: 5
  } : {
    padding: '4px 11px',
    fontSize: 'var(--text-xs)',
    gap: 6
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: dims.gap,
      padding: dims.padding,
      borderRadius: 'var(--radius-pill)',
      background: solid ? t.dot : t.bg,
      color: solid ? 'var(--white)' : t.fg,
      fontFamily: 'var(--font-sans)',
      fontSize: dims.fontSize,
      fontWeight: 600,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      letterSpacing: '0.005em',
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: solid ? 'rgba(255,255,255,0.9)' : t.dot,
      flex: 'none'
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    height: 32,
    padding: '0 12px',
    fontSize: 'var(--text-sm)',
    gap: 6,
    icon: 15
  },
  md: {
    height: 38,
    padding: '0 16px',
    fontSize: 'var(--text-base)',
    gap: 7,
    icon: 17
  },
  lg: {
    height: 44,
    padding: '0 22px',
    fontSize: 'var(--text-md)',
    gap: 8,
    icon: 18
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--brand)',
    color: 'var(--text-on-brand)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--brand-hover)',
    '--active-bg': 'var(--brand-active)'
  },
  secondary: {
    background: 'var(--white)',
    color: 'var(--text-body)',
    border: '1px solid var(--border-strong)',
    '--hover-bg': 'var(--gray-50)',
    '--active-bg': 'var(--gray-100)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-body)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--gray-100)',
    '--active-bg': 'var(--gray-150)'
  },
  danger: {
    background: 'var(--danger-solid)',
    color: 'var(--white)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--red-700)',
    '--active-bg': 'var(--red-700)'
  },
  'danger-soft': {
    background: 'var(--danger-bg)',
    color: 'var(--danger-fg)',
    border: '1px solid transparent',
    '--hover-bg': 'var(--red-100)',
    '--active-bg': 'var(--red-100)'
  }
};

/**
 * Primary action button. The forest-green `primary` is the default CTA.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled = false,
  type = 'button',
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const bg = disabled ? v.background : active ? v['--active-bg'] : hover ? v['--hover-bg'] : v.background;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : undefined,
      fontFamily: 'var(--font-sans)',
      fontSize: s.fontSize,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: '-0.005em',
      whiteSpace: 'nowrap',
      background: bg,
      color: v.color,
      border: v.border,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: active && !disabled ? 'translateY(0.5px)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      outline: 'none',
      boxShadow: hover && variant === 'primary' && !disabled ? 'var(--shadow-sm)' : 'none',
      ...style
    }
  }, rest), leadingIcon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, leadingIcon) : null, children, trailingIcon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: s.icon,
      height: s.icon
    }
  }, trailingIcon) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * White content card with light border + generous padding — the core surface.
 */
function Card({
  children,
  padding = 'var(--card-pad)',
  interactive = false,
  elevated = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding,
      boxShadow: elevated ? 'var(--shadow-md)' : hover ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
      borderColor: hover ? 'var(--border-strong)' : 'var(--border-default)',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), children);
}

/** Optional card header row: title + trailing slot. */
function CardHeader({
  title,
  subtitle,
  action,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-5)',
      marginBottom: 'var(--space-5)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      letterSpacing: '-0.01em'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, subtitle) : null), action ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, action) : null);
}
Object.assign(__ds_scope, { Card, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 30,
  md: 36,
  lg: 42
};
const ICON = {
  sm: 16,
  md: 18,
  lg: 20
};

/**
 * Square icon-only button. Used for toolbar/row actions.
 */
function IconButton({
  children,
  label,
  size = 'md',
  variant = 'ghost',
  active = false,
  disabled = false,
  style,
  ...rest
}) {
  const dim = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const base = {
    ghost: {
      bg: 'transparent',
      hover: 'var(--gray-100)',
      color: 'var(--text-muted)'
    },
    solid: {
      bg: 'var(--brand)',
      hover: 'var(--brand-hover)',
      color: 'var(--white)'
    },
    outline: {
      bg: 'var(--white)',
      hover: 'var(--gray-50)',
      color: 'var(--text-body)'
    }
  }[variant] || {
    bg: 'transparent',
    hover: 'var(--gray-100)',
    color: 'var(--text-muted)'
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flex: 'none',
      background: active ? 'var(--brand-tint)' : hover && !disabled ? base.hover : base.bg,
      color: active ? 'var(--brand-on-tint)' : base.color,
      border: variant === 'outline' ? '1px solid var(--border-strong)' : '1px solid transparent',
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
      outline: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: ICON[size],
      height: ICON[size]
    }
  }, children));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: 'var(--text-heading)',
  brand: 'var(--brand)',
  warning: 'var(--warn-fg)',
  danger: 'var(--danger-fg)'
};

/**
 * Dashboard stat tile — big number, label, optional icon and delta.
 */
function StatCard({
  icon,
  label,
  value,
  tone = 'neutral',
  delta,
  deltaDir,
  style,
  ...rest
}) {
  const valColor = TONES[tone] || TONES.neutral;
  const deltaColor = deltaDir === 'down' ? 'var(--success-fg)' : deltaDir === 'up' ? 'var(--danger-fg)' : 'var(--text-muted)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--card-pad)',
      boxShadow: 'var(--shadow-xs)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-muted)'
    }
  }, label), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--gray-100)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 16,
      height: 16
    }
  }, icon)) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: '-0.02em',
      color: valColor
    }
  }, value), delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: deltaColor
    }
  }, delta) : null));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/TaskCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATUS = {
  overdue: {
    tone: 'danger',
    label: 'Overdue',
    accent: 'var(--danger-solid)'
  },
  soon: {
    tone: 'warning',
    label: 'Due soon',
    accent: 'var(--warn-solid)'
  },
  upcoming: {
    tone: 'neutral',
    label: 'Upcoming',
    accent: 'var(--gray-300)'
  },
  done: {
    tone: 'success',
    label: 'Complete',
    accent: 'var(--success-solid)'
  }
};

/**
 * Maintenance task card — icon, title, property, status pill, due meta.
 */
function TaskCard({
  icon,
  title,
  property,
  status = 'upcoming',
  due,
  statusLabel,
  action,
  onClick,
  style,
  ...rest
}) {
  const st = STATUS[status] || STATUS.upcoming;
  const [hover, setHover] = React.useState(false);
  const clickable = !!onClick;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => clickable && setHover(true),
    onMouseLeave: () => clickable && setHover(false),
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderColor: hover ? 'var(--border-strong)' : 'var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--card-pad)',
      overflow: 'hidden',
      boxShadow: hover ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
      cursor: clickable ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: st.accent
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-md)',
      background: `color-mix(in srgb, ${st.accent} 12%, white)`,
      color: st.accent
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 20,
      height: 20
    }
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, property, due ? ` · ${due}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: st.tone,
    dot: status === 'overdue' || status === 'soon'
  }, statusLabel || st.label), action));
}
Object.assign(__ds_scope, { TaskCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TaskCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Checkbox with label — used heavily in prep checklists.
 */
function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const cbId = id || React.useId();
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const on = isControlled ? checked : internal;
  const toggle = e => {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange?.(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: cbId,
    style: {
      display: 'flex',
      alignItems: description ? 'flex-start' : 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: 'none',
      marginTop: description ? 1 : 0
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: cbId,
    type: "checkbox",
    checked: on,
    onChange: toggle,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 18,
      height: 18,
      margin: 0,
      cursor: 'inherit'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 18,
      height: 18,
      borderRadius: 'var(--radius-xs)',
      background: on ? 'var(--brand)' : 'var(--white)',
      border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)'
    }
  }, on ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12.5l4.5 4.5L19 7",
    stroke: "#fff",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : null)), label || description ? /*#__PURE__*/React.createElement("span", null, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      fontWeight: 500,
      color: 'var(--text-heading)',
      textDecoration: on && !description ? 'line-through' : 'none',
      textDecorationColor: 'var(--text-faint)'
    }
  }, label) : null, description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, description) : null) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text input with optional label, leading icon, and error state.
 */
function Input({
  label,
  hint,
  error,
  leadingIcon,
  size = 'md',
  id,
  style,
  disabled = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;
  const borderColor = error ? 'var(--danger-solid)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: h,
      padding: '0 12px',
      background: disabled ? 'var(--gray-100)' : 'var(--white)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, leadingIcon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 17,
      height: 17,
      color: 'var(--text-faint)',
      flex: 'none'
    }
  }, leadingIcon) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-heading)'
    }
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--danger-fg)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Native select styled to match the design system.
 */
function Select({
  label,
  hint,
  error,
  options = [],
  size = 'md',
  id,
  style,
  disabled = false,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const selId = id || React.useId();
  const h = size === 'sm' ? 32 : size === 'lg' ? 44 : 38;
  const borderColor = error ? 'var(--danger-solid)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: selId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      width: '100%',
      height: h,
      padding: '0 36px 0 12px',
      background: disabled ? 'var(--gray-100)' : 'var(--white)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focus ? 'var(--ring)' : 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--text-heading)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      outline: 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, rest), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lbl = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: 'absolute',
      right: 11,
      pointerEvents: 'none',
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--danger-fg)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-muted)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Sidebar nav item. Active state uses a subtle green tint + green text.
 */
function NavItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      width: '100%',
      padding: '9px 12px',
      border: 'none',
      textAlign: 'left',
      background: active ? 'var(--surface-active-nav)' : hover ? 'var(--gray-100)' : 'transparent',
      color: active ? 'var(--brand-on-tint)' : 'var(--text-body)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      fontWeight: active ? 600 : 500,
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: 18,
      height: 18,
      flex: 'none',
      color: active ? 'var(--brand)' : 'var(--text-muted)'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, label), badge != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      borderRadius: 'var(--radius-pill)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: active ? 'var(--green-100)' : 'var(--danger-bg)',
      color: active ? 'var(--brand-on-tint)' : 'var(--danger-fg)',
      fontSize: '11px',
      fontWeight: 700
    }
  }, badge) : null);
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/DashboardScreen.jsx
try { (() => {
// Dashboard / Home screen. Exposes window.DashboardScreen.
const {
  StatCard,
  TaskCard,
  Button,
  IconButton,
  Card,
  Badge
} = window.MaintenanceSchedulerDesignSystem_02479c;
const DIcon = n => React.createElement('i', {
  'data-lucide': n
});
function SectionTitle({
  children,
  count,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '4px 0 12px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: 'var(--text-heading)'
    }
  }, children), count != null ? /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    size: "sm"
  }, count) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), action);
}
function DashboardScreen({
  tasks,
  onOpenTask
}) {
  const overdue = tasks.filter(t => t.status === 'overdue');
  const week = tasks.filter(t => t.status === 'soon');
  const moreAction = t => /*#__PURE__*/React.createElement(IconButton, {
    label: "More",
    size: "sm",
    onClick: e => {
      e.stopPropagation();
    }
  }, DIcon('more-horizontal'));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '28px 32px 56px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: 4
    }
  }, "Thursday, 12 June"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--text-heading)'
    }
  }, "Good morning, Dana")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leadingIcon: DIcon('plus')
  }, "Add task")), overdue.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px',
      marginBottom: 22,
      background: 'var(--danger-bg)',
      border: '1px solid var(--red-100)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: 'var(--white)',
      color: 'var(--danger-solid)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "alert-triangle",
    style: {
      width: 19,
      height: 19
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      fontWeight: 700,
      color: 'var(--danger-fg)'
    }
  }, overdue.length, " tasks are overdue across your portfolio"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--red-700)',
      opacity: 0.85
    }
  }, "Safety checks should be actioned first to stay compliant.")), /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    size: "sm"
  }, "Review now")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 14,
      marginBottom: 30
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Overdue",
    value: overdue.length,
    tone: "danger",
    icon: DIcon('alert-circle')
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Due this week",
    value: week.length,
    tone: "warning",
    icon: DIcon('calendar-clock')
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Properties",
    value: 4,
    icon: DIcon('building-2')
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Compliance",
    value: "92%",
    tone: "brand",
    icon: DIcon('shield-check')
  })), /*#__PURE__*/React.createElement(SectionTitle, {
    count: overdue.length,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      trailingIcon: DIcon('arrow-right')
    }, "All overdue")
  }, "Overdue"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginBottom: 30
    }
  }, overdue.map(t => /*#__PURE__*/React.createElement(TaskCard, {
    key: t.id,
    icon: DIcon(t.icon),
    title: t.title,
    property: t.property,
    status: t.status,
    due: t.due,
    action: moreAction(t),
    onClick: () => onOpenTask(t)
  }))), /*#__PURE__*/React.createElement(SectionTitle, {
    count: week.length,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      trailingIcon: DIcon('arrow-right')
    }, "Schedule")
  }, "This week"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, week.map(t => /*#__PURE__*/React.createElement(TaskCard, {
    key: t.id,
    icon: DIcon(t.icon),
    title: t.title,
    property: t.property,
    status: t.status,
    due: t.due,
    action: moreAction(t),
    onClick: () => onOpenTask(t)
  }))));
}
window.DashboardScreen = DashboardScreen;
window.SectionTitle = SectionTitle;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/PlanScreen.jsx
try { (() => {
// Smart plan screen — AI-suggested batched plan + prep checklist + AI message draft.
// Exposes window.PlanScreen.
const {
  Card,
  Button,
  Badge,
  Checkbox,
  Avatar,
  IconButton
} = window.MaintenanceSchedulerDesignSystem_02479c;
const PIcon = n => React.createElement('i', {
  'data-lucide': n
});
function PrepChecklist({
  prep
}) {
  const [items, setItems] = React.useState(prep);
  const doneCount = items.filter(i => i.done).length;
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, "Prep checklist"), /*#__PURE__*/React.createElement(Badge, {
    tone: doneCount === items.length ? 'success' : 'neutral',
    size: "sm"
  }, doneCount, "/", items.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--gray-100)',
      overflow: 'hidden',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${doneCount / items.length * 100}%`,
      background: 'var(--brand)',
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, items.map(it => /*#__PURE__*/React.createElement(Checkbox, {
    key: it.id,
    label: it.label,
    checked: it.done,
    onChange: e => setItems(arr => arr.map(x => x.id === it.id ? {
      ...x,
      done: e.target.checked
    } : x))
  }))));
}
function PlanStop({
  stop,
  last
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: '50%',
      background: 'var(--brand-tint)',
      color: 'var(--brand)',
      fontWeight: 700,
      fontSize: 'var(--text-sm)',
      flex: 'none'
    }
  }, stop.n), !last ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      width: 2,
      background: 'var(--border-default)',
      margin: '4px 0'
    }
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingBottom: last ? 0 : 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, stop.property), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    size: "sm"
  }, stop.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8
    }
  }, stop.tasks.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      background: 'var(--gray-50)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-pill)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check",
    style: {
      width: 13,
      height: 13,
      color: 'var(--brand)'
    }
  }), t)))));
}
function AiDraft() {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      background: 'linear-gradient(180deg, var(--green-50), var(--white) 70%)',
      borderColor: 'var(--green-100)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--brand)',
      color: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sparkles",
    style: {
      width: 16,
      height: 16
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, "Drafted tenant message"), /*#__PURE__*/React.createElement(Badge, {
    tone: "brand",
    size: "sm"
  }, "AI")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: 14,
      fontSize: 'var(--text-base)',
      lineHeight: 'var(--leading-relaxed)',
      color: 'var(--text-body)'
    }
  }, "Hi Marcus, your annual boiler service is booked for ", /*#__PURE__*/React.createElement("strong", null, "Friday 14 June, 9\u201311am"), ". Our engineer will need access to the airing cupboard. Reply here to confirm or reschedule \u2014 thanks!"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    leadingIcon: PIcon('send')
  }, "Send to tenant"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    leadingIcon: PIcon('refresh-cw')
  }, "Regenerate")));
}
function PlanScreen() {
  const stops = [{
    n: 1,
    property: '14 Elm Road',
    time: '9:00 am',
    tasks: ['Boiler service', 'EICR inspection']
  }, {
    n: 2,
    property: '8 Birch Lane',
    time: '11:30 am',
    tasks: ['Smoke & CO alarm test', 'Legionella check']
  }, {
    n: 3,
    property: 'Flat 2, Park View',
    time: '2:00 pm',
    tasks: ['Gas safety certificate']
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '28px 32px 56px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--text-heading)'
    }
  }, "Smart plan"), /*#__PURE__*/React.createElement(Badge, {
    tone: "brand",
    dot: true
  }, "AI suggested")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-muted)',
      marginBottom: 22
    }
  }, "One efficient route batches 5 tasks into a single day \u2014 saving an estimated 2 trips."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 22,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, "Friday 14 June \xB7 suggested route"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, "3 stops \xB7 5 tasks \xB7 ~6 hrs")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    leadingIcon: PIcon('calendar-check')
  }, "Accept plan")), /*#__PURE__*/React.createElement("div", null, stops.map((s, i) => /*#__PURE__*/React.createElement(PlanStop, {
    key: s.n,
    stop: s,
    last: i === stops.length - 1
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PrepChecklist, {
    prep: window.MOCK.prep
  }), /*#__PURE__*/React.createElement(AiDraft, null))));
}
window.PlanScreen = PlanScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/PlanScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ScheduleScreen.jsx
try { (() => {
// Schedule screen — month strip + tasks grouped by status. Exposes window.ScheduleScreen.
const {
  TaskCard,
  Button,
  IconButton,
  Badge
} = window.MaintenanceSchedulerDesignSystem_02479c;
const ScIcon = n => React.createElement('i', {
  'data-lucide': n
});
function MiniCalendar() {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const start = 27; // grid starts late May
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const dayNum = start + i;
    const inMonth = dayNum > 31;
    const label = inMonth ? dayNum - 31 : dayNum;
    cells.push({
      label,
      inMonth,
      today: inMonth && label === 12,
      due: [14, 18].includes(label) && inMonth,
      overdue: [7].includes(label) && inMonth
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      boxShadow: 'var(--shadow-xs)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, "June 2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Previous",
    size: "sm"
  }, ScIcon('chevron-left')), /*#__PURE__*/React.createElement(IconButton, {
    label: "Next",
    size: "sm"
  }, ScIcon('chevron-right')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 2,
      marginBottom: 6
    }
  }, days.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: 700,
      color: 'var(--text-faint)',
      padding: '2px 0'
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 2
    }
  }, cells.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'relative',
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--text-sm)',
      fontWeight: c.today ? 700 : 500,
      borderRadius: 'var(--radius-sm)',
      color: !c.inMonth ? 'var(--gray-300)' : c.today ? 'var(--white)' : 'var(--text-body)',
      background: c.today ? 'var(--brand)' : 'transparent',
      cursor: 'pointer'
    }
  }, c.label, (c.due || c.overdue) && !c.today ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 5,
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: c.overdue ? 'var(--danger-solid)' : 'var(--warn-solid)'
    }
  }) : null))));
}
function Legend() {
  const items = [['var(--danger-solid)', 'Overdue'], ['var(--warn-solid)', 'Due soon'], ['var(--brand)', 'Today']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      boxShadow: 'var(--shadow-xs)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      marginBottom: 12
    }
  }, "Legend"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, items.map(([c, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: c
    }
  }), l))));
}
function ScheduleScreen({
  tasks,
  onOpenTask
}) {
  const groups = [['Overdue', tasks.filter(t => t.status === 'overdue')], ['This week', tasks.filter(t => t.status === 'soon')], ['Upcoming', tasks.filter(t => t.status === 'upcoming')]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '28px 32px 56px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--text-heading)'
    }
  }, "Schedule"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, "All maintenance across your 4 properties.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    leadingIcon: ScIcon('sliders-horizontal')
  }, "Filter"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    leadingIcon: ScIcon('plus')
  }, "Add task"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: 22,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, groups.map(([name, list]) => /*#__PURE__*/React.createElement("div", {
    key: name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)'
    }
  }, name), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    size: "sm"
  }, list.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, list.map(t => /*#__PURE__*/React.createElement(TaskCard, {
    key: t.id,
    icon: ScIcon(t.icon),
    title: t.title,
    property: t.property,
    status: t.status,
    due: t.due,
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, t.cat),
    onClick: () => onOpenTask(t)
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'sticky',
      top: 28
    }
  }, /*#__PURE__*/React.createElement(MiniCalendar, null), /*#__PURE__*/React.createElement(Legend, null))));
}
window.ScheduleScreen = ScheduleScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ScheduleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Sidebar.jsx
try { (() => {
// Sidebar — logo, property switcher, nav, user. Exposes window.Sidebar.
const {
  NavItem,
  Avatar,
  Badge
} = window.MaintenanceSchedulerDesignSystem_02479c;
const SbIcon = n => React.createElement('i', {
  'data-lucide': n
});
function PropertySwitcher({
  properties,
  current,
  onChange
}) {
  const [open, setOpen] = React.useState(false);
  const prop = properties.find(p => p.id === current) || properties[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '8px 10px',
      background: 'var(--white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-xs)',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: prop.name,
    square: true,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, prop.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, prop.sub)), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevrons-up-down",
    style: {
      width: 15,
      height: 15,
      color: 'var(--text-faint)'
    }
  })), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      right: 0,
      zIndex: 20,
      background: 'var(--white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: 6
    }
  }, properties.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => {
      onChange(p.id);
      setOpen(false);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '7px 8px',
      background: p.id === current ? 'var(--surface-active-nav)' : 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.name,
    square: true,
    size: "xs"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--text-heading)'
    }
  }, p.name), p.overdue > 0 ? /*#__PURE__*/React.createElement(Badge, {
    tone: "danger",
    size: "sm",
    solid: true
  }, p.overdue) : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      margin: '6px 4px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      padding: '7px 8px',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      color: 'var(--brand)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus",
    style: {
      width: 15,
      height: 15
    }
  }), " Add property")) : null);
}
function Sidebar({
  nav,
  active,
  onNav,
  properties,
  current,
  onProperty
}) {
  const items = [['home', 'Home', 'home', null], ['schedule', 'Schedule', 'calendar', 3], ['plan', 'Smart plan', 'sparkles', null], ['rent', 'Rent', 'wallet', null], ['messages', 'Messages', 'message-square', null], ['properties', 'Properties', 'building-2', null]];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--sidebar-width)',
      flex: 'none',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 16,
      background: 'var(--white)',
      borderRight: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '4px 6px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    alt: "",
    width: "30",
    height: "30"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-md)',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: 'var(--text-heading)'
    }
  }, "Maintenance")), /*#__PURE__*/React.createElement(PropertySwitcher, {
    properties: properties,
    current: current,
    onChange: onProperty
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, items.map(([id, label, icon, badge]) => /*#__PURE__*/React.createElement(NavItem, {
    key: id,
    icon: SbIcon(icon),
    label: label,
    active: active === id,
    badge: badge,
    onClick: () => onNav(id)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(NavItem, {
    icon: SbIcon('settings'),
    label: "Settings",
    active: active === 'settings',
    onClick: () => onNav('settings')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      marginTop: 4,
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Dana Reyes",
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-heading)'
    }
  }, "Dana Reyes"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, "Landlord")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "log-out",
    style: {
      width: 16,
      height: 16,
      color: 'var(--text-faint)'
    }
  }))));
}
window.Sidebar = Sidebar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
// Shared mock data for the Maintenance Scheduler UI kit.
window.MOCK = {
  properties: [{
    id: 'elm',
    name: '14 Elm Road',
    sub: 'Bristol · BS6',
    tenants: 2,
    overdue: 2
  }, {
    id: 'birch',
    name: '8 Birch Lane',
    sub: 'Bath · BA1',
    tenants: 1,
    overdue: 1
  }, {
    id: 'park',
    name: 'Flat 2, Park View',
    sub: 'Bristol · BS8',
    tenants: 3,
    overdue: 0
  }, {
    id: 'oak',
    name: '21 Oak Crescent',
    sub: 'Bristol · BS9',
    tenants: 2,
    overdue: 0
  }],
  tasks: [{
    id: 't1',
    icon: 'bell-ring',
    title: 'Smoke & CO alarm test',
    property: '8 Birch Lane',
    status: 'overdue',
    due: '12 days ago',
    cat: 'Safety'
  }, {
    id: 't2',
    icon: 'shield-alert',
    title: 'EICR electrical inspection',
    property: '14 Elm Road',
    status: 'overdue',
    due: '5 days ago',
    cat: 'Safety'
  }, {
    id: 't3',
    icon: 'flame',
    title: 'Boiler annual service',
    property: '14 Elm Road',
    status: 'soon',
    due: 'Fri 14 Jun',
    cat: 'Heating'
  }, {
    id: 't4',
    icon: 'shield-check',
    title: 'Gas safety certificate',
    property: 'Flat 2, Park View',
    status: 'soon',
    due: 'Tue 18 Jun',
    cat: 'Safety'
  }, {
    id: 't5',
    icon: 'droplets',
    title: 'Gutter clearing',
    property: '21 Oak Crescent',
    status: 'upcoming',
    due: 'Mon 24 Jun',
    cat: 'Exterior'
  }, {
    id: 't6',
    icon: 'thermometer',
    title: 'Legionella risk check',
    property: '8 Birch Lane',
    status: 'upcoming',
    due: 'Thu 27 Jun',
    cat: 'Safety'
  }, {
    id: 't7',
    icon: 'paintbrush',
    title: 'Repaint communal hallway',
    property: 'Flat 2, Park View',
    status: 'upcoming',
    due: '2 Jul',
    cat: 'Cosmetic'
  }],
  prep: [{
    id: 'p1',
    label: 'Notify tenant 24h in advance',
    done: true
  }, {
    id: 'p2',
    label: 'Confirm engineer booking window',
    done: true
  }, {
    id: 'p3',
    label: 'Locate boiler service history',
    done: false
  }, {
    id: 'p4',
    label: 'Clear access to airing cupboard',
    done: false
  }, {
    id: 'p5',
    label: 'Photograph meter readings',
    done: false
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TaskCard = __ds_scope.TaskCard;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.NavItem = __ds_scope.NavItem;

})();
