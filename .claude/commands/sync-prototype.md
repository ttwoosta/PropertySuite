# Sync Prototype to App

Apply staged/unstaged changes from `project/apps/` (the HTML/JSX design prototype) into the corresponding TypeScript source files under `app/src/`.

## When to use

Run this after modifying any file in `project/apps/` — the prototype is the source of truth for visual design and UX logic. This skill translates those changes into the real React + TypeScript app.

## Steps

1. **Discover what changed** — run `git diff HEAD project/apps/` (and `git diff --cached project/apps/` for staged changes) to get the full diff. If there are new files (`A` in git status), show their full contents.

2. **Map each changed file to its app counterpart** — for every file that appeared in the diff, derive the target using these rules (only process files that actually changed):

   **General convention** — `project/apps/<name>.jsx` maps to `app/src/apps/<name>/<PascalName>App.tsx`. If the target directory/file does not exist, create it.

   **Known exceptions** (non-obvious mappings):
   | Prototype file | App file |
   |---|---|
   | `project/apps/ps-ui.jsx` | `app/src/components/ui.tsx` |
   | `project/apps/<name>-extra.jsx` | `app/src/apps/<name>/editors.tsx` |

   **New top-level pages** (files with no existing app counterpart) also need a route added to `app/src/App.tsx`.

3. **Read the relevant app files** before editing them.

4. **Apply each logical change** — translate JSX/JS patterns to TypeScript:
   - `href="Page.html"` → `<Link to="/route">` (React Router)
   - `window.PS.Auth.signOut()` → `signOut()` from `useAuth()`
   - `onClick={signOut}` sign-out buttons → `<Link to="/profile">` profile pill links
   - `data-lucide` icons → `di()` or `<LucideIcon name="">` from `src/lib/icon`
   - DS bundle globals → typed imports from `src/ds-vendor/components`
   - Add missing prop types if the DS `InputProps` / other interfaces lack them (edit `src/ds-vendor/components.tsx`, which is the hand-written types file — **not** `ds_bundle.js`)
   - New routes: import the component and add `<Route path="/..." element={<.../>} />` in `App.tsx`

5. **Run `npm run typecheck`** from `app/` after all edits and fix any errors before reporting done.

## Key rules

- Never edit `app/src/ds-vendor/ds_bundle.js` — it is a pre-compiled third-party bundle.
- `app/src/ds-vendor/components.tsx` **is** editable — it's hand-written TypeScript prop types.
- The prototype uses multi-page HTML (`href="Profile.html"`); the app is a single SPA — always convert to React Router `<Link to="...">`.
- State that was local to the prototype (e.g. `window.PS.Auth`) maps to `useAuth()` from `src/lib/auth`.
- Firestore persistence lives in `data.ts` hooks; when the prototype adds new mutations (prep CRUD, extended recurrence), add them to both the local-state path and the Firestore path in `useTasks`.

