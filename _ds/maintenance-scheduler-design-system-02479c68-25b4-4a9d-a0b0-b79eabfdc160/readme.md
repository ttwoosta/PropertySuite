# Maintenance Scheduler — Design System

A property-management app for landlords: track overdue and upcoming maintenance (boiler servicing, smoke-alarm testing, gas safety, EICR, etc.) across multiple properties, alongside **rent tracking** and **AI-assisted tenant communication** — all in one place. Clean two-panel layout: a left sidebar (logo, property switcher, nav) and a main content area on a light-gray canvas.

> **Sources.** This system was authored from a written product brief only — **no codebase, Figma, or screenshots were provided.** Tokens, components, and the app UI kit are an original interpretation of that brief. When real product source or brand assets become available, reconcile against them. There are two flagged substitutions (see Caveats): the UI **font** and the **icon set**.

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
- **Numbers & dates:** plain and human — "12 days ago", "Due Fri 14 Jun", "Every 12 months". Money and dates use tabular/mono figures for alignment.
- **Status language:** consistent vocabulary — **Overdue**, **Due soon**, **Upcoming**, **Complete**. "Overdue" is always the red/danger word.
- **Microcopy:** short, verb-first CTAs ("Review now", "Send to tenant", "Mark complete", "Reschedule"). Helper text is one calm sentence ("Safety checks should be actioned first to stay compliant.").
- **Emoji:** none. The product reads professional; status is communicated with color, pills, and icons — never emoji.
- **Vibe:** trustworthy, tidy, low-stress. Generous whitespace, soft shadows, no clutter.

## Visual foundations
- **Palette.** Light-gray page (`--gray-50` #F5F6F6) with white cards. Primary accent is **dark forest green** (`--green-500` #2D6A4F) for CTAs, active nav, the logo, and progress. Status: **amber** (#E8852B) for due-soon/warnings, **red/salmon** (#D23A40 / #F08A8D) for overdue/danger, **green** for complete.
- **Type.** `Plus Jakarta Sans` (substitute — see caveats). Headings bold (700) and slightly tight (-0.02em); body regular (400) at 14px; tiny uppercase eyebrows with wide tracking. Mono/tabular figures for money and dates.
- **Spacing & layout.** 4px base grid. Fixed **248px** sidebar; main content capped at ~1080px and centered. Generous card padding (20px). Sticky top search bar and (on Schedule) a sticky calendar rail.
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
- **Usage:** `<i data-lucide="name"></i>` then `lucide.createIcons()`. Components accept icons as a React node so any SVG/icon source works.
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

Each component directory has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a `*.card.html` demo (Design System tab).

**Foundation cards** (`guidelines/`) — color (brand / neutrals / status), type (scale / weights), spacing (scale / radius / elevation).

**UI kit** — `ui_kits/app/` — interactive recreation of the app (Home, Schedule, Smart plan). See its `README.md`.

## Consuming the system
Link `styles.css`, load `_ds_bundle.js` (compiler-generated, project root), then:
```js
const { Button, TaskCard, Badge } = window.MaintenanceSchedulerDesignSystem_02479c;
```
Use CSS custom properties (`var(--brand)`, `var(--radius-md)`, …) for anything custom.
