# Analysis: Adopting shadcn/ui as the Client UI Library

## Context

The client app (`client/`) is a React 18 + Vite 5 SPA styled with Tailwind CSS 4.1.5. It has two hand-rolled primitives (`Button`, `Card`) built with `class-variance-authority` plus a small set of feature components (landing, layout). There is no Radix UI, no form library, no dialog/dropdown/popover primitives, and no dark mode. As the app grows (forms, auth flows, fan-club interactions), we'll need accessible primitives — Dialog, DropdownMenu, Select, Popover, Toast, Form, Tabs, Sheet — which are exactly shadcn's strength.

This analysis captures **what adoption would require**, the **friction points** against this repo's conventions, and a **recommended path** — but does not implement anything.

---

## Current State (verified)

**Stack relevant to shadcn** (`client/package.json`, `client/tsconfig.json`, `client/src/styles/index.css`):

- React 18.3.1, React Router DOM 7.1.5, Vite 5.4.21
- Tailwind CSS **4.1.5** via `@tailwindcss/vite` (v4 — no `tailwind.config.js`; theme lives in CSS `@theme`)
- `class-variance-authority` 0.7.1 (shadcn's underlying pattern — already familiar)
- `lucide-react` 0.487.0 (shadcn's default icon lib — already installed)
- TanStack Query 5.90.20
- **Not installed**: any `@radix-ui/*`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `zod`, `react-hook-form`

**Path aliases** (`client/tsconfig.json:17-20`, `client/vite.config.ts`):

- `shared` → `../shared/src/index.ts`
- **No `@/*` alias** — shadcn's default expectation

**Existing design tokens** (`client/src/styles/index.css:5-20`):

- `--color-background`, `--color-surface`, `--color-brand` (#ff0017), `--color-brand-hover`, `--color-text-primary/secondary/muted`, `--color-border`, `--color-border-hover`
- Fonts: Outfit (display), Inter (sans) — pre-loaded from Google Fonts
- Custom animations: `fade-up`, `fade-in`, `scale-in` + stagger delays

**Existing primitives** (will collide with shadcn):

- `client/src/components/ui/Button.tsx` — variants: `primary | secondary | ghost`, sizes `sm | md | lg`
- `client/src/components/ui/Card.tsx` — CVA-based interactive card
- `client/src/components/ui/Logo.tsx`

**Repo conventions to respect** (`AGENTS.md`, `eslint.config.js`, `.claude/settings.json`):

- **Named exports only** (no default exports) — shadcn emits named exports for most components ✅, but the `cn` helper and occasional files use defaults — must audit each generated file.
- **Double quotes** — shadcn's CLI emits single quotes; the Prettier Edit/Write hook would auto-rewrite them. Solved by the `.prettierignore` + directory split described in §4.
- **`curly` rule** — shadcn code complies.
- **No `as` casts on untrusted data** — shadcn internal components use `React.forwardRef` generics, not `as` — fine.
- **Exact pinned versions** (no `^`/`~`) — shadcn installs Radix packages with `^`; must manually pin after each `npx shadcn add`.
- **Component files < 150 lines** — most shadcn components comply; Form is largest.
- **Hook enforcement**: Prettier runs on every Edit/Write; `Stop` hook runs typecheck + lint + test before session end — any violation blocks completion.

---

## What Adoption Requires

### 1. Infrastructure (one-time)

| Change                                             | File                                            | Why                                                                                                                        |
| -------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Add `@/*` path alias                               | `client/tsconfig.json`, `client/vite.config.ts` | shadcn components import from `@/components/ui/...` and `@/lib/utils`                                                      |
| Install `clsx`, `tailwind-merge`, `tw-animate-css` | `client/package.json`                           | `cn()` helper + Radix animations (v4 uses `tw-animate-css`, not the old `tailwindcss-animate` plugin)                      |
| Create `client/src/lib/utils.ts` with `cn()`       | new file                                        | shadcn components use it everywhere                                                                                        |
| Create `components.json`                           | `client/components.json`                        | shadcn CLI config — style, base color, path aliases, CSS file, Tailwind v4 flag                                            |
| Extend `@theme` block                              | `client/src/styles/index.css`                   | Add shadcn's semantic tokens (`--color-primary`, `--color-muted`, `--color-destructive`, `--color-ring`, `--radius`, etc.) |

shadcn's Tailwind v4 support (official as of late 2024) uses `@theme inline` CSS variables — compatible with the existing `@theme` block.

### 2. Design-Token Reconciliation (the real work)

shadcn expects semantic names: `primary`, `secondary`, `accent`, `destructive`, `muted`, `card`, `popover`, `background`, `foreground`, `border`, `input`, `ring`. The repo currently uses descriptive names: `brand`, `surface`, `text-primary`, `text-secondary`, `text-muted`.

Two options:

- **(A) Map existing tokens to shadcn semantics** — `--color-primary: var(--color-brand)`, `--color-foreground: var(--color-text-primary)`, etc. Existing components keep working; shadcn components get Pop Red branding for free. **Preferred.**
- **(B) Replace the palette with shadcn's defaults** — adds slate/zinc grays, loses Pop Red brand until re-themed. Not recommended.

Dark mode is not set up. shadcn templates include a `.dark` block. We can add it empty initially (light-only) and fill it in when needed — costs nothing now.

### 3. Primitive Collision

| Existing                                                                               | shadcn equivalent                                                                               | API delta                                                                                                                                             |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` (variants: primary/secondary/ghost; sizes sm/md/lg; bespoke red-shadow hover) | `Button` (variants: default/destructive/outline/secondary/ghost/link; sizes sm/default/lg/icon) | Different variant names; shadcn has no `primary` — use `default`. Hover microinteraction (`-translate-y-0.5`, brand-shadow) is lost unless preserved. |
| `Card` (CVA with interactive variant)                                                  | `Card` + `CardHeader`/`CardTitle`/`CardContent`/`CardFooter`                                    | Compositional API; no interactive variant — replicate via className.                                                                                  |
| `Logo`                                                                                 | n/a                                                                                             | Keep as-is.                                                                                                                                           |

All call sites of `Button` and `Card` need updating if we replace them. Quick grep to estimate scope (deferred until implementation).

### 4. Convention Friction (managed via a scoped `.prettierignore`)

The `.claude/settings.json:21` `PostToolUse` hook runs `npx prettier --write` on every Edit/Write. It would mechanically rewrite shadcn-generated files (quotes, line-wrapping), causing drift from upstream and noisy `shadcn add --overwrite` diffs later.

**Resolution — directory split + `.prettierignore`:**

- Move existing hand-rolled primitives into `client/src/components/ui/brand/`:
  - `Button.tsx`, `Card.tsx`, `Logo.tsx`
  - Update all import sites (`grep -rn "components/ui/Button\|components/ui/Card\|components/ui/Logo" client/src`)
- Reserve `client/src/components/ui/` for shadcn-generated files (shadcn's default lowercase naming: `button.tsx`, `dialog.tsx`, etc.)
- Create `.prettierignore` at repo root with:
  ```
  client/src/components/ui/*.tsx
  ```
  Prettier (and thus the hook) respects `.prettierignore` natively — no hook changes needed.
- Hand-written code in `ui/brand/` and everywhere else still gets formatted on every edit.

Other minor friction:

- **Version pinning**: after `npx shadcn add <component>`, manually strip `^`/`~` from newly added `@radix-ui/*` entries in `client/package.json`.
- **Named exports**: audit each generated file; most shadcn files already use named exports.
- **No `tailwind.config.js`**: shadcn v4 path is correct here — fully supported.

### 5. New Dependencies

Per-component (installed on demand by `npx shadcn add`):

- Each component adds 1–3 `@radix-ui/*` packages (Dialog → `@radix-ui/react-dialog`, etc.)
- Form adds `react-hook-form` + `@hookform/resolvers` + `zod` (zod is already in `shared`, so align the version)
- Toast adds `sonner` (new default, replaces the old `toast`)

Each addition should be pinned to exact versions after install.

---

## Recommended Path

**Phase 1 — Additive (low risk, high leverage):**
Adopt shadcn alongside existing components. Use it _only_ for primitives we don't have yet (Dialog, DropdownMenu, Form, Input, Label, Select, Toast, Tabs, Sheet). Keep existing `Button`/`Card` untouched. This unblocks the auth/fan-club UX work without rewriting what already works.

**Phase 2 — Replace primitives when touched (opportunistic):**
When a feature already requires editing a `Button` or `Card` call site, migrate to shadcn's version at the same time. No bulk migration commit. Over several months, custom primitives fade out naturally.

**Phase 3 — Dark mode (when product asks):**
Fill in the `.dark` block; add a theme toggle. Infrastructure is already in place from Phase 1.

**Do not:** wholesale-replace Button/Card in one PR. The bespoke red-shadow hover, font-display/font-semibold defaults, and Pop Red focus ring are part of the site's identity — porting them onto shadcn's Button is a design task, not a mechanical one, and should be its own branded-primitive PR later.

---

## Critical Files for Phase 1

- `client/tsconfig.json` — add `@/*` path alias under `paths`
- `client/vite.config.ts` — mirror the alias via `resolve.alias`
- `client/package.json` — add `clsx`, `tailwind-merge`, `tw-animate-css` (exact versions)
- `client/src/styles/index.css` — extend `@theme` with shadcn semantic tokens mapped to existing brand tokens; import `tw-animate-css`
- `client/src/lib/utils.ts` — new, exports `cn()`
- `client/components.json` — new, shadcn CLI config (style: `new-york` or `default`, baseColor mapped to existing brand, Tailwind v4 mode, `rsc: false`, path aliases)
- `.prettierignore` — new at repo root, single line: `client/src/components/ui/*.tsx`
- `client/src/components/ui/brand/` — new directory; move `Button.tsx`, `Card.tsx`, `Logo.tsx` here and update import sites
- `client/src/components/ui/` — reserved for shadcn-generated lowercase components (`button.tsx`, `dialog.tsx`, etc.)

## Verification

- `pnpm --filter client exec tsc --noEmit` — passes after alias + new files
- `pnpm run lint` — passes (expect Prettier to rewrite quotes; hook handles it)
- `pnpm --filter client dev` and visually confirm at `http://localhost:9001` that existing pages render unchanged (Pop Red still dominant, fonts intact, no layout shift)
- Add one shadcn component (e.g. `npx shadcn add dialog`), mount it in a throwaway route, confirm it picks up the brand color via the semantic token mapping — this proves the token reconciliation works before we commit to Phase 1
- `pnpm --filter client test` — existing tests must still pass (they don't touch shadcn yet)

## Estimated Scope

- **Phase 1 infra + token mapping**: ~1 focused session (2–4 hours), 1 PR, ~6 files changed, 0 existing components altered.
- **Phase 2 migrations**: folded into feature work, no dedicated PR.
- **Risk level**: low. Additive changes, existing primitives untouched, rollback = revert the alias/config commits.

## Open Questions for the User

1. Phase 1 scope: just infra + `cn` helper + token mapping, or also install a starter set (Dialog, DropdownMenu, Form, Input, Label)?
2. shadcn style variant: `default` (rounded-md, subtle) or `new-york` (rounded-lg, sharper — closer to our current `rounded-lg` buttons)?
3. Is eventual dark-mode support on the roadmap? (affects whether we stub a `.dark` block in Phase 1)
