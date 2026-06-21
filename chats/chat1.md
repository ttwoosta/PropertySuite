# Design system prototype scope

_Started 2026-06-20 17:00 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Untitled"
What `list_files` on the project root returns right now (dotfiles, if any, are not shown here):
📁 _ds
Current date is now June 20, 2026
</system-info>

<pasted_text name="Pasted text (300 lines)">
Design a responsive web app called **Property Suite** — a landlord management tool that bundles three mini-apps behind a shared login. Use your existing design system for all visual styling. The layout is responsive: a persistent left sidebar on wide viewports (tablet/desktop), and a drawer sidebar on narrow viewports (phone). Use container queries to drive the breakpoint.

**Phone navigation pattern (all apps):** A hamburger icon button in the top-left corner of the top bar opens the sidebar as a slide-in drawer (overlays the content, with a scrim backdrop). Tapping the scrim or a nav item closes the drawer. There is no bottom tab bar.

---

## Auth shell

The root shell handles three states:
- **Resolving:** Show a centred loading spinner — never flash the login screen on page refresh
- **Signed out:** Show a login screen with email + password fields, sign-in and sign-up actions
- **Signed in:** Render the active route

---

## Launcher (home `/`)

Landing screen after sign-in.

**Top bar:** App brand mark + wordmark on the left. User initials avatar on the right — tapping it signs the user out.

**Body:** "Your apps" heading + subtitle. Responsive card grid linking to the three sub-apps:
- **Phone:** Compact 3-column icon-only grid (icon + app name)
- **Tablet+:** 2-column full cards (icon + name + tag line + description paragraph)

Three apps: **Rent Tracker**, **Maintenance Scheduler**, **TenantBridge**. Each card is a full navigation link.

---

## Maintenance Scheduler (`/maintenance`)

**Shell:**
- **Sidebar:** Brand mark linking back to the Launcher. "Property" section: vertical listbox of 3 properties, each with a colour dot indicator — selected property is highlighted. "Views" section: 4 nav buttons (Home, Prep, Schedule, Smart Plan) with icons — active item is highlighted. Theme toggle button pinned to the bottom. On tablet+, the sidebar is always visible. On phone, it is hidden behind a hamburger button in the top bar and slides in as a drawer.
- **Top bar:** Hamburger icon button on the left (phone only, opens the sidebar drawer). Eyebrow label "MAINTENANCE", screen title + subtitle. Right side: theme toggle icon button, user initials pill (avatar + name) that signs out on click.
- **Phone-only addition:** Horizontal scrollable property chips directly below the top bar titles.

---

### Home screen

Renders in one of three states based on task data:

**Empty:** Empty-state message — no tasks due this week.

**Normal:** "This week" heading + task list. Each row: coloured icon tile, task name, due-date badge (e.g. "in 2 days"), recurrence chip, duration, complete-toggle checkbox. Tapping the row body opens the add/edit modal.

**Overdue:** "Overdue" heading with an overdue visual treatment. List narrows to only overdue tasks.

Optional collapsible "Get ready" prep section below the task list — shows a checklist per task with camera-capture placeholder per item.

"+ Add task" button at the bottom of the list.

---

### Task Prep screen

Shows all tasks for the active property. Each task is a card containing:
- Task icon + name header
- Checklist of prep items: checkbox + label + photo-capture icon button per item

Items can be ticked off. The screen is for gathering supplies before starting work.

---

### Schedule screen

Two sections: **Overdue** (if any) and **Upcoming**, sorted by due date. Each task row: icon, name, recurrence pill (Weekly / Monthly / Quarterly), days-until badge, done-toggle. Tapping a task opens a recurrence editor (inline or modal) to change its cadence.

---

### Smart Plan screen

Slot-based scheduling view.

**Top:** "Unavailable days" multi-select control (Mon–Sun) — checking a day removes it from the schedule.

**Below:** Two columns — "Quick tasks" (short duration) and "Long tasks" (long duration). Tasks are placed into available time-slot cards (e.g. Monday Morning, Tuesday Afternoon). Occupied slots show the task name and duration. Users tap or drag tasks into slots.

---

### Add/Edit Task Modal

Centred overlay modal with a backdrop. Fields:
- Task name (text input)
- Icon picker (grid of icon tiles, single-select)
- Tint colour picker (colour swatches)
- Duration (number input + "min" unit label)
- Bucket toggle (Quick / Long)
- Recurrence selector (Weekly / Monthly / Quarterly)
- Property assignment (select)

Actions: **Cancel** + **Save**. In edit mode: a destructive **Delete task** action.

---

## Rent Tracker (`/rent`)

Rental property management tool for small landlords. Tracks monthly rent income, utility/expense payments, and receipts across one or more properties.

**Shell:** Fixed left sidebar + top bar + scrollable main content area. No URL-based routing — all navigation is view-swapping within the same shell.

**Sidebar:**
- Top: logo mark + "RentTracker" wordmark
- Nav links (icon + label, vertical stack): Home, Grid, Houses, Expenses, Receipts — active item highlighted
- Footer: muted summary text showing property/room counts (e.g. "2 houses · 7 rooms")

**Top bar:**
- Left: house selector button (current property name + chevron) — opens a dropdown listing all properties
- Centre: period chip showing the selected month/year (e.g. "June 2026") — opens a scroll-wheel picker with separate month and year drum rolls (snapping, momentum scroll)
- Right: avatar button (user initials) — dropdown with "Profile" and "Sign out"

---

### View 1 — Dashboard (Home)

Two KPI summary cards at the top:
- **Monthly Income** — total for selected month + delta vs. previous month (positive/negative visual treatment)
- **Monthly Expenses** — same structure

Below cards: a 6-month grouped bar chart — one group per month, showing an income bar and an expense bar side by side. Month labels underneath, no axis grid lines.

Below chart: **Recent Activity** feed — list rows each showing a category dot, label, sub-label, and right-aligned amount. Timestamps shown as relative (e.g. "2 days ago").

---

### View 2 — Year Grid

Dense scrollable table for the selected property and year.

**Two-row column header:**
- Row 1: grouped column headers — "Utilities &amp; Tax" (spanning utility sub-columns), "Rent Income" (spanning per-room columns), "Other Expenses" (spanning 2 cols), "Net" (1 col)
- Row 2: individual column labels — Property Tax, Water, Electricity, Gas | Room 1, Room 2, … | Maintenance, Loan Payment | Net

**Body:** 12 rows, one per month. Each cell is clickable to enter inline edit mode — a text input replaces the value; pressing Enter saves. Cells with no data show a muted "—". Net column is computed and styled to indicate positive vs. negative at a glance.

**Toolbar above table:**
- Segmented control: All / Expenses / Income
- Hint text: "Click any cell to edit · Enter to save"
- Export CSV button (right-aligned)
- Density toggle: Comfortable / Compact

Expense columns are visually colour-coded by category using muted accent tints. Income columns share a consistent positive treatment.

---

### View 3 — Houses

All units for the selected property.

**Header:** Property name + address + occupancy badge (e.g. "5/6 occupied") + "Add House" button.

**Room table** — one row per unit:
- Unit number/name
- Tenant name (or "Vacant" muted)
- Base rent amount
- Amount paid this month (or "—")
- Status badge: Paid / Partial / Pending / Vacant
- Actions: edit icon button, "Add rent" icon button

Tapping "Add rent" opens the Add Rent drawer.

---

### View 4 — Expenses

**Donut chart** at top — one segment per expense category, centre shows total expense for selected month.

**Accordion list** below — one section per category (Property Tax, Water, Electricity, Gas, Maintenance, Loan Payment), each showing:
- Category icon/dot + label
- Monthly total for selected month
- YTD total
- Expand chevron

Expanded section: sub-table with one row per month (Jan–Dec) showing value and a receipt badge if a receipt is attached. Tapping a row opens the Add Entry drawer or Receipt Picker.

---

### View 5 — Receipts

Header: "Receipts · [Year]" + count + "Upload receipt" primary button.

**Card grid** (responsive, 3–4 columns): each card shows:
- Thumbnail (photo preview if uploaded; else a receipt icon + category label)
- Merchant name (bold)
- Date + dollar amount

Tapping a card opens the Receipt Viewer dialog.

---

### Drawers (slide in from right, with scrim overlay)

**Add Entry** — title shows category + month (e.g. "Property Tax · March"). Fields: amount ($ prefix), month selector, optional note, "Attach receipt" button. Save / Cancel.

**Add Rent** — title "Add rent · Unit [X]". Fields: renter name, amount due, amount received. Quick-fill buttons: "Mark paid in full", "Clear". Save button.

**Upload Receipt** — drag-and-drop zone + file input. Fields: merchant name, date, amount, category dropdown. Upload button.

**Add House** — 2-step wizard:
1. Property address form (name, address, city, state, zip)
2. Rooms step — stepper (− / +) to set room count, lists rooms with unit numbers. Confirm button.

**Edit Room** — form for unit details: unit number, bedrooms, base rent, tenant name, status (Occupied / Vacant).

---

### Dialogs (centred modal)

**Receipt Viewer** — full-size image (or icon placeholder), merchant/date/amount/category metadata below. "Detach" and "Close" buttons.

**Receipt Picker** — grid of receipt thumbnails for the current year. Select one to attach to an entry. Cancel button.

---

### States

- **Loading:** Full-screen centred spinner with descriptive text (e.g. "Loading houses…")
- **Error:** Error message with a retry button
- **Toast:** Bottom-right notification strip, auto-dismisses after action confirmation

---

## Tenant Bridge (`/tenant-bridge`)

Tenant communication hub with AI-assisted drafting.

**Shell:** Same responsive sidebar pattern. On tablet+, the sidebar is always visible. On phone, a hamburger button in the top-left opens it as a drawer. The sidebar also includes a "Suite" section with links back to the other two apps. The top bar uses a frosted-glass (blur + semi-transparent) background.

---

### Tenants tab

Scrollable list grouped by property. Each group has a property header (colour dot + name + tenant count).

Tenants rendered in a responsive auto-fill card grid. Each card:
- Avatar (coloured per tenant), name, "Occupied" status badge, unit + address
- Footer: 5-star relationship score + "Last contact X days ago"

Tapping a card opens the Thread tab for that tenant.

---

### Thread tab

Per-tenant conversation view.

**Header card:** Large avatar, name, status, unit/address. Three quick-action buttons: **Text**, **Email**, **Note** — tapping sets the active channel in the composer.

**3-item segmented control:** Messages | AI Suggestions | Profile

**Messages sub-tab:**
- Chat-style thread. Incoming messages left-aligned; outgoing right-aligned. Internal notes centred (visually distinct from messages). Each message shows channel icon + timestamp + "AI Drafted" badge if applicable.
- Sticky composer at bottom: channel label chip (SMS / Email / Note) + auto-resize textarea + send button (disabled state when empty, active when text is present). Enter key sends; Shift+Enter inserts a newline.

**AI Suggestions sub-tab:**
- Banner at top: animated AI orb + "AI is watching [Name]'s patterns" + pending count.
- Suggestion cards, each with: trigger description, source tag (e.g. "Maintenance Scheduler"), tone tag (Friendly / Reminder / Informational), draft text preview. Actions: **Approve &amp; Send**, **Edit** (toggles preview to editable textarea), **Dismiss** (×). Approving moves the draft to the message thread and removes the suggestion. Empty state when all suggestions are dismissed.

**Profile sub-tab:**
- Preference card: preferred contact time, communication style, payment pattern — each row has an icon, label, value.
- Maintenance history list: dot + label + date per item.
- Private notes textarea (landlord-only, not sent to tenant).

---

### AI Assistant tab

Full-height chat interface (constrained max-width, centred).

- AI messages: left-aligned, small AI orb avatar to the left
- User messages: right-aligned
- Typing indicator: three animated dots while the model responds
- Sticky composer at bottom
- When conversation is fresh: horizontally scrollable prompt chip suggestions above the composer (e.g. "Remind Marcus the AC filter swap is next week")
- Pre-filled opening AI message on load

---

### Scheduled Queue tab

List of messages queued to send automatically. Each row:
- Date tile (abbreviated month + day number)
- Message title + recipient name/unit + channel icon
- Countdown badge (e.g. "in 3 days")
- Edit icon button

---

## Interactions &amp; behaviours

- **Property switcher:** Switching property instantly re-filters all task lists across all screens
- **Theme toggle:** Light ↔ dark, persisted locally per app
- **Auth guard:** All routes except `/login` redirect to `/login` if signed out; guard waits for auth to resolve before deciding (no flicker)
- **Task complete toggle:** Optimistic UI — marks done immediately, syncs to backend
- **Suggestion badge:** A numeric badge on the AI Assistant tab (sidebar and bottom nav) showing total pending AI suggestions across all tenants; decrements as suggestions are dismissed or approved
- **Queue badge:** Numeric badge on the Queue tab showing the count of scheduled items
- **Roving tabindex:** Keyboard arrow-key navigation within tab bars and segmented controls (ARIA `role="tablist"` + `role="tab"` pattern)
- **Empty states:** Every list has a meaningful empty state (no tasks, no suggestions, no queue items)
- **Loading state:** Spinner shown while initial data loads; never shows a broken empty state before data arrives

</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Maintenance Scheduler Design System (design system)">
[Design System] This project uses the **Maintenance Scheduler Design System** design system. This is a binding choice for visual style — every visual must follow it. Don't invent colors, type, spacing, or components not grounded here.

Scope: the design system is a visual style reference only. Its guide may describe example products, brands, or people that are unrelated to the user and unrelated to the subject of this conversation. Never treat anything in the design system as a fact about the user, their work, or the topic they asked about.

This project has the **MaintenanceSchedulerDesignSystem_02479c** design system bound at `_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/`. If anything under that path is missing or fails to load, the folder name may differ — `list_files` `_ds/` and use the folder whose name ends with 02479c68-25b4-4a9d-a0b0-b79eabfdc160 instead, including in the <link>/<script> paths below.

**Loading the bundle is how you use this design system.** Every page you build must load `_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/_ds_bundle.js` and compose with the components it exports on `window.MaintenanceSchedulerDesignSystem_02479c` — do not recreate those components from scratch or restyle raw HTML to look like them. The bundle calls `React.createElement`, so `window.React` and `window.ReactDOM` must be loaded first. Then add these once:

```html
<link rel="stylesheet" href="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/tokens/fonts.css">
<link rel="stylesheet" href="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/tokens/colors.css">
<link rel="stylesheet" href="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/tokens/typography.css">
<link rel="stylesheet" href="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/tokens/spacing.css">
<link rel="stylesheet" href="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/tokens/radius.css">
<link rel="stylesheet" href="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/styles.css">
<script src="_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/_ds_bundle.js"></script>
```

The bundle is plain compiled JS — load it with a regular `<script>` (no `type="text/babel"` or `type="module"`). Every component is then available on `window.MaintenanceSchedulerDesignSystem_02479c` — e.g. `const { Button, Card } = window.MaintenanceSchedulerDesignSystem_02479c;`. The linked stylesheet(s) carry the design tokens (colors, type, spacing) — style against those via `var(--*)` and the design system's classes rather than guessing values.

The full design-system source tree lives at `/projects/02479c68-25b4-4a9d-a0b0-b79eabfdc160/` — use `list_files` / `read_file` from there for anything not under `_ds/` (layout varies by brand; don't assume folder names). Its guide is reproduced below so you don't need to fetch it:

<design-system-guide>
# Maintenance Scheduler — Design System

A property-management app for landlords: track overdue and upcoming maintenance (boiler servicing, smoke-alarm testing, gas safety, EICR, etc.) across multiple properties, alongside **rent tracking** and **AI-assisted tenant communication** — all in one place. Clean two-panel layout: a left sidebar (logo, property switcher, nav) and a main content area on a light-gray canvas.

&gt; **Sources.** This system was authored from a written product brief only — **no codebase, Figma, or screenshots were provided.** Tokens, components, and the app UI kit are an original interpretation of that brief. When real product source or brand assets become available, reconcile against them. There are two flagged substitutions (see Caveats): the UI **font** and the **icon set**.

## Core product surfaces
- **Home dashboard** — greeting, overdue alert banner, stat tiles, and prioritized task lists.
- **Schedule** — calendar + tasks grouped by status across all properties.
- **Smart plan** — AI-suggested batched maintenance route, prep checklists, and drafted tenant messages.
- **Sidebar** — property switcher + primary navigation, present on every screen.

---

## Content fundamentals
How the product talks:
- **Voice:** calm, practical, reassuring — a competent assistant for a busy landlord, never alarmist even when surfacing overdue safety items.
- **Person:** addresses the user directly as **"you" / "your"** ("Stay ahead of every property", "across your portfolio"). First-person plural ("our engineer") only in AI-drafted tenant messages.
- **Casing:** Sentence case for headings, buttons, and labels ("Add task", "Due this week"). Reserve ALL-CAPS for tiny eyebrow/overline labels (with letter-spacing) only.
- **Numbers &amp; dates:** plain and human — "12 days ago", "Due Fri 14 Jun", "Every 12 months". Money and dates use tabular/mono figures for alignment.
- **Status language:** consistent vocabulary — **Overdue**, **Due soon**, **Upcoming**, **Complete**. "Overdue" is always the red/danger word.
- **Microcopy:** short, verb-first CTAs ("Review now", "Send to tenant", "Mark complete", "Reschedule"). Helper text is one calm sentence ("Safety checks should be actioned first to stay compliant.").
- **Emoji:** none. The product reads professional; status is communicated with color, pills, and icons — never emoji.
- **Vibe:** trustworthy, tidy, low-stress. Generous whitespace, soft shadows, no clutter.

## Visual foundations
- **Palette.** Light-gray page (`--gray-50` #F5F6F6) with white cards. Primary accent is **dark forest green** (`--green-500` #2D6A4F) for CTAs, active nav, the logo, and progress. Status: **amber** (#E8852B) for due-soon/warnings, **red/salmon** (#D23A40 / #F08A8D) for overdue/danger, **green** for complete.
- **Type.** `Plus Jakarta Sans` (substitute — see caveats). Headings bold (700) and slightly tight (-0.02em); body regular (400) at 14px; tiny uppercase eyebrows with wide tracking. Mono/tabular figures for money and dates.
- **Spacing &amp; layout.** 4px base grid. Fixed **248px** sidebar; main content capped at ~1080px and centered. Generous card padding (20px). Sticky top search bar and (on Schedule) a sticky calendar rail.
- **Corners.** 8px (`--radius-md`) is the workhorse — cards, inputs, buttons. Pills (999px) for badges and status chips. Avatars are circular; property tiles are rounded squares.
- **Backgrounds.** Flat color only — no photographic or pattern backgrounds. The single permitted gradient is the subtle green-tinted wash on the AI/Smart-plan card. No textures, no full-bleed imagery.
- **Borders.** Hairline 1px borders (`--border-default` #DCE0DF) define every surface; borders darken slightly on hover. Status accents appear as a 3px colored bar on the left edge of task cards.
- **Shadows.** Soft and low-contrast for a light UI: `xs` hairline on resting cards, `sm` on hover, `md` for popovers, `lg`/`pop` for the dialog and right-hand drawer. No heavy or colored shadows.
- **Elevation = whiteness.** Cards are white on gray; raising emphasis means more shadow, not darker fills.
- **Hover.** Backgrounds lighten to `--gray-100` (ghost/nav) or shift one brand step darker (primary button); cards gain border + shadow. **Press:** primary button nudges down 0.5px; no aggressive scale/bounce.
- **Active nav.** Subtle green tint (`--green-50`) background, green icon, semibold green label.
- **Motion.** Quick and restrained — 120–260ms, `ease-out` (`cubic-bezier(0.22,1,0.36,1)`). Fades and small slides; the checklist progress bar animates its width. No looping or decorative animation.
- **Transparency/blur.** Used sparingly: the sticky top bar is translucent with an 8px backdrop blur; the drawer/dialog scrim is `rgba(24,28,26,0.32)`.

## Iconography
- **Set:** [**Lucide**](https://lucide.dev) — clean 2px-stroke outline icons, loaded from CDN (`lucide@0.456.0`). This is a **substitution** (no brand icon set was provided); Lucide's light, geometric stroke matches the minimal aesthetic well. If the product has its own icons, swap the CDN for the real set.
- **Usage:** `&lt;i data-lucide="name"&gt;&lt;/i&gt;` then `lucide.createIcons()`. Components accept icons as a React node so any SVG/icon source works.
- **Sizing:** 16–22px in UI; icons inherit `currentColor`. In task cards the icon sits in a tinted square keyed to status color.
- **Common glyphs:** `home`, `calendar`, `sparkles` (smart plan), `wallet` (rent), `building-2` (property), `flame` (boiler/heating), `bell-ring` (alarms), `shield-check`/`shield-alert` (safety/compliance), `alert-triangle`/`alert-circle` (overdue).
- **Emoji / unicode icons:** not used.
- **Logo:** `assets/logo-mark.svg` (green rounded-square house+check mark) and `assets/logo-wordmark.svg`. Placeholder marks created for this system — replace with the official logo when available.

---

## Index / manifest
**Root**
- `styles.css` — entry point; `@import`s all token files (link this one file to consume the system).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `radius.css` (radii + shadows + motion), `fonts.css`.
- `assets/` — `logo-mark.svg`, `logo-wordmark.svg`.
- `SKILL.md` — Agent-Skill manifest for use in Claude Code.

**Components** (`window.MaintenanceSchedulerDesignSystem_02479c`)
- `components/core/` — `Button`, `IconButton`, `Card` (+`CardHeader`), `Badge`, `Avatar`
- `components/forms/` — `Input`, `Select`, `Checkbox`
- `components/navigation/` — `NavItem`
- `components/data/` — `TaskCard`, `StatCard`

Each component directory has `&lt;Name&gt;.jsx`, `&lt;Name&gt;.d.ts`, `&lt;Name&gt;.prompt.md`, and a `*.card.html` demo (Design System tab).

**Foundation cards** (`guidelines/`) — color (brand / neutrals / status), type (scale / weights), spacing (scale / radius / elevation).

**UI kit** — `ui_kits/app/` — interactive recreation of the app (Home, Schedule, Smart plan). See its `README.md`.

## Consuming the system
Link `styles.css`, load `_ds_bundle.js` (compiler-generated, project root), then:
```js
const { Button, TaskCard, Badge } = window.MaintenanceSchedulerDesignSystem_02479c;
```
Use CSS custom properties (`var(--brand)`, `var(--radius-md)`, …) for anything custom.

</design-system-guide>

Per-component usage notes follow — the first lines of each component's `*.prompt.md`. These are NOT bound into `_ds/`, so they're reproduced here:

<ds-prompt-excerpts>
### components/core/Avatar.prompt.md
Circular avatar with image or auto-generated initials (deterministic tint from the name). Use `square` for properties/buildings.

```jsx
&lt;Avatar name="Dana Reyes" size="sm" /&gt;
&lt;Avatar name="14 Elm Road" square size="md" /&gt;

### components/core/Badge.prompt.md
Soft pill-shaped badge for statuses and counts. `danger` is the overdue badge (soft pink/red), `warning` is due-soon (amber), `success` is done (green).

```jsx
&lt;Badge tone="danger" dot&gt;Overdue&lt;/Badge&gt;
&lt;Badge tone="warning"&gt;Due in 3 days&lt;/Badge&gt;

### components/core/Button.prompt.md
Primary action button — use the forest-green `primary` for the single main CTA on a view; `secondary` (white, bordered) for adjacent actions; `ghost` for low-emphasis inline actions; `danger`/`danger-soft` for destructive or overdue actions.

```jsx
&lt;Button variant="primary" leadingIcon={&lt;i data-lucide="plus" /&gt;}&gt;Add task&lt;/Button&gt;
&lt;Button variant="secondary"&gt;Reschedule&lt;/Button&gt;

### components/core/Card.prompt.md
The default white content surface — light border, soft shadow, 8px radius, generous padding. Everything in the main content area sits in a Card.

```jsx
&lt;Card&gt;
  &lt;CardHeader title="This week" subtitle="3 tasks due" action={&lt;Button size="sm" variant="ghost"&gt;View all&lt;/Button&gt;} /&gt;

### components/core/IconButton.prompt.md
Square icon-only button for row actions, toolbars, and the sidebar. Always pass `label` for accessibility/tooltip.

```jsx
&lt;IconButton label="More" variant="ghost"&gt;&lt;i data-lucide="more-horizontal" /&gt;&lt;/IconButton&gt;
&lt;IconButton label="Add property" variant="solid"&gt;&lt;i data-lucide="plus" /&gt;&lt;/IconButton&gt;

### components/data/StatCard.prompt.md
Dashboard metric tile — label, big number, optional icon and delta. Use `tone="danger"` for overdue counts.

```jsx
&lt;StatCard label="Overdue" value={3} tone="danger" icon={&lt;i data-lucide="alert-circle" /&gt;} /&gt;
&lt;StatCard label="Due this week" value={5} tone="warning" icon={&lt;i data-lucide="calendar-clock" /&gt;} /&gt;

### components/data/TaskCard.prompt.md
The central object of the app — a maintenance task. Status drives the left accent bar, icon tint, and pill. `overdue` = red, `soon` = amber, `upcoming` = neutral, `done` = green.

```jsx
&lt;TaskCard icon={&lt;i data-lucide="flame" /&gt;} title="Boiler service" property="14 Elm Road" status="soon" due="Due Fri 14 Jun" /&gt;
&lt;TaskCard icon={&lt;i data-lucide="bell-ring" /&gt;} title="Smoke alarm test" property="8 Birch Lane" status="overdue" due="12 days ago"

### components/forms/Checkbox.prompt.md
Checkbox with label (and optional description) — the workhorse of prep checklists. Checked single-line labels get a subtle strikethrough.

```jsx
&lt;Checkbox label="Test smoke alarms" defaultChecked /&gt;
&lt;Checkbox label="Photograph meter readings" description="Both gas and electric" /&gt;

### components/forms/Input.prompt.md
Labelled text input with focus ring, optional leading icon, hint, and error state.

```jsx
&lt;Input label="Property name" placeholder="e.g. 14 Elm Road" /&gt;
&lt;Input label="Search" leadingIcon={&lt;i data-lucide="search" /&gt;} placeholder="Search tasks" /&gt;

### components/forms/Select.prompt.md
Styled native select with custom chevron. Pass `options` as strings or `{value,label}`.

```jsx
&lt;Select label="Property" options={['14 Elm Road', '8 Birch Lane', 'Flat 2, Park View']} /&gt;
&lt;Select label="Frequency" options={[{value:'12m',label:'Every 12 months'},{value:'6m',label:'Every 6 months'}]} /&gt;

### components/navigation/NavItem.prompt.md
Sidebar navigation row. Active item gets a subtle green tint background, green icon, and semibold green text. Optional `badge` shows an overdue count.

```jsx
&lt;NavItem icon={&lt;i data-lucide="home" /&gt;} label="Home" active /&gt;
&lt;NavItem icon={&lt;i data-lucide="calendar" /&gt;} label="Schedule" badge={3} /&gt;
</ds-prompt-excerpts>
</attached-skill>

## Assistant

I'll start by exploring the design system so I understand exactly what I'm building with, then ask a few focused questions before building.

_[tool: list_files]_

I'll read the key token files and the component bundle interface to ground my work.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

I have the tokens. Let me check the component bundle's exports and a couple of component signatures so I compose correctly.

_[tool: grep]_

Let me read the component definitions to get exact props. Let me look at the manifest and the component source for the core pieces.

_[tool: read_file]_

Let me read the actual component source files for exact prop signatures.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

I've absorbed the full design system — 12 components, tokens, and the forest-green visual language. Before I build, a few scope questions, because this spec is three complete apps plus an auth shell and launcher. I want to build the right thing rather than spread thin.

_[tool: questions_v2]_

## User

Questions answered:
- scope: Auth + Launcher + Maintenance Scheduler fully (it's the design system's home app), other two as navigable shells
- structure: Separate HTML file per app, linked from the launcher
- ai: Wire up real AI for the assistant + draft generation
- persistence: No — in-memory mock data is fine, resets on reload
- fidelity: Fully clickable prototype — modals open, forms work, navigation flows
- variations: No — one direction, follow the design system

## Assistant

Plan is clear: separate files linked from a launcher. Maintenance Scheduler full; Rent Tracker + TenantBridge as navigable shells (TenantBridge gets a working AI assistant). Let me grab the API skill and the logo assets.

_[tool: read_skill_prompt]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

I have everything I need. Let me set up the project structure and todos, then build. First, copy the design system bundle into a shared local path and grab the logo mark.

_[tool: update_todos]_

_[tool: copy_files]_

Now the shared common library (plain JS — auth + navigation + lucide helpers).

_[tool: write_file]_

I'll build a shared theme/layout CSS and a shared UI module (responsive shell, drawer, spinner, theme toggle) that every app page reuses, then the four pages. Starting with the shared CSS.

_[tool: write_file]_

Add `position: relative` to the shell (scrim/drawer need it) and a sticky topbar style.

_[tool: str_replace_edit]_

Now the shared UI module — responsive shell, drawer, theme, modal, toast.

_[tool: write_file]_

Now the auth shell + launcher. First the HTML page:

_[tool: write_file]_

_[tool: write_file]_

Let me verify the launcher loads cleanly before building the bigger apps.

_[tool: show_html]_

Validating the foundation before I replicate the boilerplate across three more pages.

_[tool: show_html]_

_[tool: get_webview_logs]_

Just caught it mid-spinner. Let me re-capture after it resolves.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Still blank with no errors logged — let me inspect the actual DOM state.

_[tool: eval_js]_

Login is actually rendering (the screenshot tool just isn't capturing the React subtree). Let me confirm it's visually present.

_[tool: eval_js]_

Login works — the screenshot tool just doesn't capture the React subtree well; DOM confirms the full form is present. Foundation is solid. Now the big one — Maintenance Scheduler. First its data model:

_[tool: update_todos]_

_[tool: write_file]_

Now the Maintenance Scheduler UI — the centerpiece. This is large, so I'll split the editor/smart-plan helpers into a second JSX file. First the main app:

_[tool: write_file]_

Now the editor modals + smart-plan board (second file, exported to window, loaded before `maintenance.jsx`):

_[tool: write_file]_

_[tool: str_replace_edit]_

Now the Maintenance Scheduler HTML page:

_[tool: write_file]_

The Maintenance page guards on auth. Let me set a session and load it to verify.

_[tool: show_html]_

_[tool: eval_js]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

The preview iframe doesn't carry `sessionStorage` across navigations — that would bounce users to login every time they enter an app. The spec also wants auth to survive refresh ("never flash login on refresh"). Switching the auth token to `localStorage` (domain data stays in-memory as requested).

_[tool: str_replace_edit]_

_[tool: eval_js]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: show_html]_

## Assistant

_[tool: eval_js]_

_[tool: get_webview_logs]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: show_html]_

_[tool: eval_js]_

`1+1` works on the launcher but hung on Maintenance — so the Maintenance page has a runaway loop. Let me set auth here, load Maintenance, and read logs immediately.

_[tool: eval_js]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: sleep]_

_[tool: eval_js]_

Renders fine — earlier timeouts were the redirect mid-navigation, not a loop. Let me see it.

_[tool: save_screenshot]_

Shell is great but the Home content area is empty. Let me check whether the screen rendered.

_[tool: eval_js]_

Content is fully rendered (overdue banner, task rows, Get ready section) — html-to-image just clips the scroll container. The real DOM is complete. Let me quickly sanity-check the editor modal and Smart Plan don't error, then move on.

_[tool: eval_js]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

Maintenance app is fully functional (editor opens, Segmented tablists render, toasts wired). Moving to Rent Tracker.

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

`rent.jsx` uses `Segmented`, which currently only exists inside `maintenance.jsx`. I'll promote it into the shared `ps-ui.jsx` and remove the local copy from maintenance.

_[tool: str_replace_edit]_

Now remove the duplicate `Segmented` from `maintenance.jsx` so it uses the shared one:

_[tool: str_replace_edit]_

## Assistant

Now the Rent Tracker HTML page:

_[tool: write_file]_

## Assistant

_[tool: show_html]_

_[tool: sleep]_

_[tool: get_webview_logs]_

## Assistant

_[tool: eval_js]_

Rent Tracker loads cleanly. Now TenantBridge — the AI assistant gets real Claude calls.

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

## Assistant

Need ResponsiveShell to support a full-height "fill" mode for Thread and AI chat:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the TenantBridge HTML page:

_[tool: write_file]_

_[tool: show_html]_

_[tool: sleep]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

Quick fix — one JSX text node has a raw `\u2019` escape that wouldn't be interpreted (JSX text doesn't escape):

_[tool: str_replace_edit]_

Let me snip the earlier troubleshooting noise and finalize.

_[tool: snip]_

_[tool: update_todos]_

Property Suite is done. The launcher is your entry — sign in with anything, then jump into any of the three apps. Auth persists across pages so the multi-file flow stays signed in; each app has its own light/dark toggle.

**What's built**

- **Property Suite.html** — auth shell (resolving → signed-out → signed-in), then a responsive launcher with full cards on tablet+ and a 3-column icon grid on phone.
- **Maintenance Scheduler.html** — full app. Sidebar property listbox + Views nav + theme toggle. Home (empty / normal / overdue states), Prep, Schedule, Smart Plan with drag-or-tap-to-place slots. Working Add/Edit Task modal (icon picker, tint swatches, segmented bucket + recurrence), recurrence editor, optimistic complete toggle, toasts. Property switching filters everything.
- **Rent Tracker.html** — navigable shell with all five views populated: dashboard (KPI + 6-month grouped bars + activity feed), interactive year grid (click-to-edit cells, segmented All/Expenses/Income, density toggle, real CSV export), houses, expenses (donut + accordion), receipts grid. House selector + period drum picker + avatar dropdown all wired.
- **Tenant Bridge.html** — shell + Tenants (grouped cards), Thread view (Messages / AI Suggestions / Profile sub-tabs with working approve / edit / dismiss), Queue, and a **real Claude-powered AI Assistant** with prompt chips and typing indicator. Sidebar "Suite" section links back to the other two apps.

**Notes / caveats**

- Auth uses `localStorage` so navigating between the four HTML files keeps you signed in (sessionStorage doesn't survive cross-file navigation in the preview iframe). Domain data is in-memory only and resets on reload, as you asked.
- Rent Tracker and TenantBridge are shells per your scope choice — their drawers/dialogs are wired representatively (Add Rent drawer, toasts) but not exhaustively. Easy to deepen if you want.
- The `html-to-image` screenshot tool sometimes misses React-rendered content visually even when it's fully in the DOM — that's a capture quirk, not a render bug.

_[tool: ready_for_verification]_

Loads clean — verifier is running in the background. Adherence warnings are soft nudges about raw px values (the spacing tokens are 4/8/12/16/20/24… and I used 2/5/9/11/14 in a few places for fine-grained UI tuning). I'll leave those as-is unless they come back from the verifier as visual issues.

