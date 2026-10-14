---
name: metalprogpop-design-system
description: >-
  The site's design system and copy rules: design tokens, the mandatory page
  shell (shared Header/Footer + Container/Section), the eyebrow + heading
  pattern, the brand components (Button, Card, Logo), loading and error
  states, and sentence-case copy. Use when creating or editing anything under
  client/src/pages, a new top-level layout or section, or any user-facing text
  (headings, buttons, labels, nav).
license: MIT
---

This site has one design system. Every page must look like the homepage —
same shell, same tokens, same components. If you're tempted to invent styling,
stop and use what's already here.

## The Source of Truth

- **Tokens**: `client/src/styles/index.css` (`@theme` block).
- **Shared layout**: `client/src/components/landing/Header.tsx`, `Footer.tsx`.
- **Layout primitives**: `client/src/components/layout/{Container,Section}.tsx`.
- **Brand components**: `client/src/components/ui/brand/{Button,Card,Logo}.tsx`.
- **Reference page**: `client/src/pages/LandingPage.tsx` — the canonical shell.

When in doubt, open LandingPage.tsx and copy the shape.

## Mandatory Page Shell

Every page renders this skeleton:

```tsx
<div className="min-h-screen bg-background">
  <Header />
  <main>
    <Section>
      <Container>{/* page content */}</Container>
    </Section>
  </main>
  <Footer />
</div>
```

- `Header` and `Footer` are imported from `components/landing/`. Do **not**
  build a per-page header (no inline `<header>` with just a logo, no custom
  nav). Pages that need a stripped header still use the shared one.
- `Section` provides vertical rhythm (`py-16 lg:py-24`). Use it instead of
  ad-hoc `py-20`.
- `Container` provides the standard max-width and gutters. Use it instead of
  `max-w-Nxl mx-auto px-6`.

## Eyebrow + Heading Pattern

Section/page introductions use this exact pattern (see `LatestEpisodes`,
`PlatformsSection`):

```tsx
<div className="mb-12 text-center">
  <span className="mb-3 inline-block font-display text-sm font-semibold uppercase tracking-widest text-brand">
    Eyebrow
  </span>
  <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
    Heading
  </h2>
</div>
```

For page-level (h1) hero variants, see `HeroSection.tsx` — same anatomy with
`text-4xl sm:text-5xl md:text-6xl` and the optional animation classes
(`animate-on-load animate-fade-up delay-200`).

## Copy: Sentence Case, Never Title Case

All of the site's own copy is written in sentence case: only the first word
and proper nouns are capitalized. This covers headings, eyebrows, buttons,
nav links, labels, placeholders, empty states, and errors.

| Wrong (Title Case)    | Right (sentence case) |
| --------------------- | --------------------- |
| `Nuevos Episodios`    | `Nuevos episodios`    |
| `Escuchar Ahora`      | `Escuchar ahora`      |
| `Todos los Episodios` | `Todos los episodios` |

- **Proper nouns keep their capitals**: `MetalProgPop`, `Fan Clú`,
  `Apple Podcasts`, `Spotify`.
- **External content is left as-is**: episode titles and descriptions come
  from the feed and are rendered exactly as received. Don't transform them.
- **CSS casing doesn't count**: eyebrows render with `uppercase`, but the
  source string is still written in sentence case.

## Color & Typography Tokens

Always use semantic Tailwind tokens. They're wired up via `@theme` in
`styles/index.css` — Tailwind class names map to CSS variables.

| Use case            | Token class                                                      |
| ------------------- | ---------------------------------------------------------------- |
| Page background     | `bg-background`                                                  |
| Card / panel bg     | `bg-surface` (or `<Card>`)                                       |
| Primary text        | `text-text-primary`                                              |
| Secondary text      | `text-text-secondary`                                            |
| Muted/help text     | `text-text-muted`                                                |
| Brand accent        | `text-brand`, `bg-brand`, `border-brand`                         |
| Brand hover         | `hover:bg-brand-hover`, `hover:text-brand-hover`                 |
| Borders             | `border-border`                                                  |
| Error / destructive | `text-destructive`, `bg-destructive/10`, `border-destructive/30` |
| Display font        | `font-display` (Outfit)                                          |
| Body font           | default (Inter — set on `<body>`)                                |

## Brand Components — Use, Don't Re-roll

| Need                | Use                                                              |
| ------------------- | ---------------------------------------------------------------- |
| Any button          | `<Button variant="primary\|secondary\|ghost" size="sm\|md\|lg">` |
| Card / framed panel | `<Card padding="md">` (variants: `default`, `interactive`)       |
| Logo                | `<Logo size="sm\|md\|hero">`                                     |
| Page wrapper        | `<Container>` inside `<Section>`                                 |
| Page chrome         | `<Header />` + `<Footer />`                                      |

Do not write `<button className="bg-[...] rounded-lg ...">`. If a button
variant you need doesn't exist, extend `Button.tsx`'s CVA config rather than
hand-rolling at the call site.

## Anti-Patterns (Forbidden)

These all produce style drift. If you see one, fix it.

| Anti-pattern                                               | Replacement                                                                   |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `bg-zinc-*`, `text-zinc-*`, `border-zinc-*` on a page      | Brand tokens above (`bg-surface`, `text-text-secondary`, …)                   |
| `var(--color-pop-red)` anywhere                            | `text-brand` / `bg-brand` (the var doesn't exist — silently renders unstyled) |
| Hex colors or arbitrary values (`bg-[#1a1a1a]`)            | Brand tokens                                                                  |
| Inline `<button>` with custom Tailwind                     | `<Button>` component                                                          |
| Per-page `<header>` with logo + custom layout              | Shared `<Header />`                                                           |
| Page missing `<Footer />`                                  | Add it — every page has it                                                    |
| `max-w-Nxl mx-auto px-6` directly on a page wrapper        | `<Container>`                                                                 |
| `py-20`, `py-16`, etc. on a page section                   | `<Section>`                                                                   |
| Different fonts / weights than `font-display` + body Inter | Stick to the two-font system                                                  |
| Dark backgrounds (`bg-zinc-900`, etc.)                     | Site is light-themed; use `bg-background` / `bg-surface`                      |
| Title Case copy (`Ver Episodios`)                          | Sentence case (`Ver episodios`)                                               |

## Forms (inputs, fields)

Match the `EpisodesPage` search input and `FanCluPage` email input:

```tsx
<input className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-display text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
```

## Loading & Error States

Lists and grids whose shape is known (episodes, tables) show a skeleton of
the final layout instead of a spinner, so the page never looks empty: see
`EpisodeGridSkeleton` (cards) and the admin grid (shadcn `Skeleton`).
Episode artwork loads progressively through `EpisodeArtwork` (blurred tiny
copy, then the sized image); never point an `<img>` at a raw Audioboom upload.

Spinner, for anything without a known shape:

```tsx
<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
```

Error banner inside a card:

```tsx
<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
  …
</div>
```

## Pre-Flight Checklist

Before considering a page-level change done, verify:

1. **Shell**: `<Header />` and `<Footer />` from `components/landing/` are present.
2. **Wrappers**: content is inside `<Section>` → `<Container>`.
3. **Tokens**: no `zinc-*`, no `var(--color-pop-red)`, no hex colors, no arbitrary `bg-[...]` / `text-[...]`.
4. **Components**: every button is `<Button>`; every framed panel is `<Card>` (or matches its visual).
5. **Typography**: headings use `font-display` + `tracking-tight`; eyebrows use the standard `uppercase tracking-widest text-brand` chip.
6. **Copy**: every string the site authors is sentence case (proper nouns and feed content excepted).
7. **Visual parity**: open the dev server and side-by-side compare against `/` (the homepage). Background tone, header, footer, eyebrow color, heading weight should match.
8. **Tests**: `pnpm --filter client test` and `pnpm --filter client exec tsc --noEmit` both pass.

## When to Add a New Token or Component

If the design genuinely needs something not in the system (e.g., a new CTA
size, a new surface tone), add it to the **shared** location:

- New color / spacing → extend `@theme` in `client/src/styles/index.css`.
- New button variant → extend the `cva` config in `Button.tsx`.
- New layout primitive → add to `components/layout/`.

Then use it. Don't introduce one-off styling on a page "just this once" — that's
how divergence starts.

## TL;DR

Page = `Header` + `Section` + `Container` + content + `Footer`. Use brand
tokens (`bg-background`, `text-text-primary`, `text-brand`, …), `<Button>` for
buttons, `<Card>` for panels. Copy in sentence case. No zinc, no hex, no `var(--color-pop-red)`, no
homemade headers. When unsure, mirror `LandingPage.tsx`.
