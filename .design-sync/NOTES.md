# Design sync notes — Maintenance Scheduler

## Setup

This design system was **hand-authored** from a product brief (no source package, no npm build, no Storybook). The converter (`package-build.mjs`) cannot run on this repo because there is no `package.json` or `dist/` entry.

The authoritative files live in two places:

| Location | What lives there |
|---|---|
| `_ds/maintenance-scheduler-design-system-02479c68-25b4-4a9d-a0b0-b79eabfdc160/` | Pre-compiled bundle (`_ds_bundle.js`), token CSS, `styles.css`, `_ds_manifest.json`, `readme.md` |
| Claude Design project `02479c68-25b4-4a9d-a0b0-b79eabfdc160` (remote only) | Component JSX source files, `.d.ts`, `.prompt.md`, group card HTMLs, guidelines, UI kit HTML, assets |

The `apps/` directory contains **application-level code** that uses the design system — it is NOT component source and does not belong in the Claude Design project.

## No `_ds_sync.json`

The project predates the sync anchor. Every sync starts with no diff baseline — full comparison only. If the project is re-adopted after a lost config, download and compare locally-present files manually rather than running the converter.

## How to update components

Components can only be updated by editing the files directly in the Claude Design project (`https://claude.ai/design/p/02479c68-25b4-4a9d-a0b0-b79eabfdc160`). After editing there:
1. Download the changed component files and put them in the appropriate `_ds/` subdirectory
2. Rebuild the bundle if source JSX changed (there is currently no local build pipeline)
3. Run `/design-sync` to push updates back

## Re-sync risks

- **Silent divergence**: Component files edited in the claude.ai/design UI will diverge from this repo's `_ds/` copies with no local signal — no git diff, no build output change. The bundle's `sourceHashes` are the only evidence (compare them against what's in the remote project before uploading).
- **Bundle mismatch**: The bundle was compiled from component sources that now only live remotely. If remote component JSX is edited without rebuilding the bundle, the bundle's `sourceHashes` will be stale.
- **No `_ds_sync.json` anchor**: Future syncs can't skip unchanged components. A full file-by-file comparison is the only way to detect drift.
- **`apps/` vs `ui_kits/app/`**: The local `apps/` JSX files are separate from the `ui_kits/app/` files in the remote project. Keep them in sync manually if the UI kit screens are updated.
