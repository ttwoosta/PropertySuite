## Using the Maintenance Scheduler design system

**Global**: `window.MaintenanceSchedulerDesignSystem_02479c` — destructure from it:
```js
const { Button, Badge, TaskCard, Card, CardHeader, Avatar, IconButton,
        StatCard, Input, Select, Checkbox, NavItem } = window.MaintenanceSchedulerDesignSystem_02479c;
```

**No provider wrapper needed.** Components are self-contained; drop them directly.

**Load order**: `tokens/fonts.css`, then `styles.css` (which imports all tokens), then `_ds_bundle.js`. Alternatively, link `styles.css` alone — it `@import`s the full token chain.

---

### Styling idiom: CSS custom properties

Style everything with `var(--token)`. Never reach for inline styles or ad-hoc colors.

**Color + surface tokens**
| Token | Use |
|---|---|
| `--brand` / `--brand-hover` / `--brand-active` | Forest-green CTA, active nav, logo |
| `--brand-tint` / `--brand-on-tint` | Green-tinted backgrounds and their text |
| `--surface-page` | Page background (#F5F6F6) |
| `--surface-card` | White card fills |
| `--surface-hover` | Hover state for ghost/nav items |
| `--text-heading` / `--text-body` / `--text-muted` / `--text-faint` | Type hierarchy |
| `--border-default` / `--border-subtle` / `--border-strong` | Hairline dividers |
| `--warn-fg` / `--warn-bg` / `--warn-solid` | Amber — due-soon states |
| `--danger-fg` / `--danger-bg` / `--danger-solid` | Red — overdue / destructive |
| `--success-fg` / `--success-bg` / `--success-solid` | Green — complete states |

**Spacing** (4 px base grid): `--space-2` (4px) → `--space-3` (8px) → `--space-4` (12px) → `--space-5` (16px) → `--space-6` (20px) → `--space-7` (24px) → `--space-8` (32px) → `--space-9` (40px)

**Radius**: `--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (8px — workhorse), `--radius-lg` (12px), `--radius-pill` (999px — badges, chips), `--radius-full` (50% — avatars)

**Shadow**: `--shadow-xs` (resting card), `--shadow-sm` (hover card), `--shadow-md` (popover), `--shadow-lg` (drawer/dialog)

**Type**: `--font-sans` (Plus Jakarta Sans), `--font-mono`. Sizes: `--text-xs` through `--text-4xl`. Weights: `--weight-regular` (400), `--weight-medium`, `--weight-semibold`, `--weight-bold` (700). Line-heights: `--leading-tight` (1.2) through `--leading-relaxed`. Tracking: `--tracking-caps` (0.06em) for uppercase eyebrow labels.

**Motion**: `--dur-fast` (120ms), `--dur-base` (180ms), `--dur-slow` (260ms) with `--ease-out` (`cubic-bezier(0.22,1,0.36,1)`).

---

### Icons

Load Lucide from CDN (`lucide@0.456.0`), then:
```html
<i data-lucide="home"></i>  <!-- rendered by lucide.createIcons() -->
```
Common glyphs: `home`, `calendar`, `sparkles`, `wallet`, `building-2`, `flame`, `bell-ring`, `shield-check`, `shield-alert`, `alert-triangle`, `alert-circle`.

---

### Component quick-reference

**Button** — `variant`: `primary | secondary | ghost | danger | danger-soft`; `size`: `sm | md | lg`; `leadingIcon`, `trailingIcon`, `fullWidth`, `disabled`.
One primary CTA per view; secondary for adjacent actions; ghost for low-emphasis; danger-soft for overdue/destructive.

**Badge** — `tone`: `neutral | brand | success | warning | danger`; `size`: `sm | md`; `dot` (leading status dot); `solid` (filled vs soft tint).

**TaskCard** — `icon`, `title`, `property`, `status` (`overdue | soon | upcoming | done`), `due` (human date string), `action` (trailing node), `onClick`.

**Card / CardHeader** — white surface with `--shadow-xs` and `--border-default`. `CardHeader` renders a section head inside a card.

**StatCard** — dashboard metric tile: `label`, `value`, `trend`, `trendDir` (`up | down`), `icon`.

**NavItem** — sidebar row: `icon`, `label`, `active` (green tint), `badge` (count), `onClick`.

**Input / Select / Checkbox** — standard form controls with DS tokens applied; no special wrapper.

**Avatar** — `src`, `name` (initials fallback), `size` (`sm | md | lg`).

**IconButton** — icon-only button: `label` (a11y), `variant`, `size`.

---

### Idiomatic layout snippet

```jsx
const { Card, CardHeader, Badge, TaskCard, Button } = window.MaintenanceSchedulerDesignSystem_02479c;

function OverdueSection() {
  return (
    <Card style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-md)',
                   boxShadow: 'var(--shadow-xs)', padding: 'var(--card-pad)' }}>
      <CardHeader
        title="Overdue"
        trailing={<Badge tone="danger" dot>3 items</Badge>}
      />
      <TaskCard
        icon={<i data-lucide="flame" />}
        title="Boiler service"
        property="14 Elm Road"
        status="overdue"
        due="12 days ago"
      />
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Button variant="danger-soft" size="sm">Review all</Button>
      </div>
    </Card>
  );
}
```

Where the source files live (in the project): `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts`.
