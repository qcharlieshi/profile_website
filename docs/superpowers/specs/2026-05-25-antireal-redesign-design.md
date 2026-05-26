# Antireal Redesign — Design Spec

**Date:** 2026-05-25
**Status:** Draft, pending user review
**Tier:** Prototype (personal portfolio — happy path only, no formal test coverage required)
**Author:** Charlie Shi (w/ Claude)

## 1. Context & Goals

The portfolio currently ships a "graphic retro futurism" look modeled loosely on Bungie's Marathon — dark mode, monospace metadata, scan lines, dot grid, cyan + magenta accents, glitch-on-hover. The references that originally inspired Marathon's aesthetic come from artist **antireal**, and their work is significantly tighter than the site's current treatment: dense technical compositions, corner-bracket frames, dashed enclosures, glyph-density backgrounds, big yellow display numbers, dashed metadata rails, registration crosshairs.

**Goal:** Re-pitch the site's visual system in the direct lineage of antireal's compositional language — same dark-mode ground, sharper motif vocabulary, fewer accent colors, denser informational chrome. Replace the existing decorative CSS rather than layering more on top.

**Non-goals:**

- No content-collection schema changes. Portfolio entries, Medium RSS pipeline, routing — all unchanged.
- No client-side JavaScript additions. The site stays zero-JS at runtime.
- No light-mode variant. Dark only.
- Existing EN↔ZH name flicker animation (`CHARLIE SHI` ↔ `石千里`) is preserved inside the new hero.
- No blog post body styling overhaul — Tailwind `prose-invert` stays; only the surrounding chrome changes.

## 2. Decisions (resolved during brainstorming)

| Decision | Choice |
|---|---|
| Palette | **A. Dark Terminal (evolved current)** — keep dark ground, drop magenta + cyan, adopt yellow + electric blue as the only accents |
| Hero composition | **H2. Asymmetric Manifest** — name bottom-left, big `01` file index right, glyph strip on left edge, dashed metadata rail at bottom |
| Rollout scope | **Full site** — nav, hero, dividers, about, portfolio listing + detail, blog listing + detail page chrome |
| Cleanup posture | **Replace** — drop magenta token, replace `.dot-grid` with `.glyph-grid`, soften scan lines, remove glitch-hover + glow-pulse |

## 3. Design Tokens

Defined in `tailwind.config.mjs` (Tailwind theme.extend) and mirrored as CSS custom properties in `src/styles/global.css` for use inside `.astro` components that prefer raw CSS.

### 3.1 Color tokens

| Token | Value | Notes |
|---|---|---|
| `bg-primary` | `#0a0a0a` | Unchanged |
| `bg-surface` | `#141416` | Was `#141414`; subtly cooler |
| `bg-elevated` | `#1c1c1f` | Was `#1e1e1e` |
| `text-primary` | `#e8e8e8` | Unchanged |
| `text-secondary` | `#8a8a90` | Was `#888888`; slightly desaturated to match yellow accent better |
| `accent-yellow` | `#ffd23f` | Promoted from "tertiary" to **primary accent**. All active labels, CTAs, corner brackets, file numbers. |
| `accent-blue` | `#1860ff` | New. Reserved for **registration marks** (`+`), hairline rules, and small corner ticks on cards. |
| `border-default` | `#2a2a2e` | Was `#2a2a2a` |

**Removed tokens:** `accent-cyan` (`#00f0ff`), `accent-magenta` (`#ff2d6b`). Delete from `tailwind.config.mjs` and audit all usages.

### 3.2 Typography

No font additions. Existing stack stays: Space Grotesk (display), JetBrains Mono (metadata), Inter (body), Noto Sans SC (Chinese variant for name flicker).

Adjustments:

- Display: tracking `0.08em` (was `0.12em` on hero; tighten to match antireal's blockier feel), weight `800`, `text-transform: uppercase` enforced globally on h1–h6 (existing rule kept).
- Mono labels: tracking `0.22–0.25em`, sizes `10–11px` for chrome labels, `11px` for nav links.

### 3.3 Spacing tokens

New CSS variables in `:root`:

```css
--frame-pad: 48px;       /* hero/page inset for corner frames */
--frame-pad-sm: 24px;    /* mobile */
--rule-thin: 1px;        /* hairline rules */
--rule-mark: 1.5px;      /* corner brackets, reg marks, card ticks */
```

## 4. Motif Library

Hybrid: **Astro components** for structural reusable pieces; **CSS utility classes** for textures. Matches existing pattern (`Navbar.astro`, `SectionDivider.astro`).

### 4.1 Astro components

All under `src/components/`. Each is small (under 60 lines), props-driven, no client JS.

| Component | Purpose | Props |
|---|---|---|
| `CornerFrame.astro` | 4 yellow corner brackets via absolute-positioned pseudo-elements; wraps any section that wants the "framed plate" feel. | `inset?: number` (default 18px), `color?: string` (default yellow), default slot |
| `MetaBar.astro` | Dashed-top metadata rail. Used at bottom of hero and at the foot of every page. | `date: string`, `coords?: string`, `build?: string`, `cta?: string`, `ctaHref?: string` |
| `FileIndex.astro` | Big yellow display number with mono label underneath. Used in hero (`01`) and on portfolio cards (`001`, `002`…). | `index: string`, `label?: string`, `size?: 'lg' \| 'md' \| 'sm'` |
| `RegMark.astro` | Blue `+` registration crosshair. | `size?: number` |
| `GlyphStrip.astro` | Vertical or horizontal strip of geometric glyphs drawn from a fixed set: `× ○ ⊞ + ✕`. | `direction: 'v' \| 'h'`, `count?: number` (default 7), `gap?: number` |

### 4.2 CSS utilities (`src/styles/global.css`)

| Class | Purpose |
|---|---|
| `.glyph-grid` | Two-layer radial-gradient background: white dots every 18px + yellow dots every 54px. Replaces `.dot-grid`. |
| `.dashed-enclosure` | `border: 1px dashed var(--border-default); padding: 18px 22px;` — for content blocks like about. |
| `.callout-tag` | `[ LABEL ]` bracketed inline tag in mono yellow. Used for featured cards (replaces `.glow-pulse`). |
| `.scan-line-soft` | New scan-line texture: 3px stride, 1.2% white opacity. Replaces existing `.scan-lines`. |
| `.hairline-yellow`, `.hairline-blue` | 1px decorative rules in accent colors. |
| `.section-label` | Existing `// LABEL` mono treatment — kept, tightened (color flips to yellow when used as section header). |
| `.dither-divider` | Existing — kept as-is. |

### 4.3 Removed CSS / animations

| Removed | Replacement |
|---|---|
| `.dot-grid` | `.glyph-grid` |
| `.scan-lines::after` (current CRT version) | `.scan-line-soft` |
| `.glitch-hover` (nav link glitch) | Yellow corner-tick that fades in from top-left of active link |
| `.glow-pulse` (featured cards) | `.callout-tag` `[ FEATURED ]` in card top-right |
| `.reg-mark` (cyan `+`) | `<RegMark>` Astro component (blue `+`) |

## 5. Hero (H2 — Asymmetric Manifest)

File: `src/components/Hero.astro` — full rewrite.

### 5.1 Layout

```
┌─ // PORTFOLIO.SYS — REV 2026.05            SECTOR 01/03 ─┐
│                                                          │
│  ×                                              ▆▆       │
│  ○                                              ▆ ▆ 01   │
│  ⊞                                              ▆▆▆▆     │
│  +                                              — FILE   │
│  ✕                                                INDEX   │
│  ○                                                       │
│  ×                                                       │
│                                                          │
│  — STAFF AI ENGINEER · LILT AI                           │
│  CHARLIE                                                 │
│  SHI                                                     │
│                                                          │
│  ↳ 26.05.25 · N 42°39′ W 71°08′ · BUILD 0x4F2A  ↗ ENTER │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Composition rules

- Full-viewport section (`h-screen`), `--frame-pad` inset.
- Four yellow corner brackets via `<CornerFrame>` (1.5px stroke, 22px arms).
- Top-left: `// PORTFOLIO.SYS — REV 2026.05` mono label, yellow.
- Top-right: `SECTOR 01/03` mono label, yellow.
- Right column (centered vertically in top half): big yellow `01` (Space Grotesk 800, ~140px desktop / clamp), with `— FILE INDEX` mono label below.
- Left edge: vertical `<GlyphStrip direction="v" count={7}>` spanning ~60% of the hero height.
- Bottom-left: name block. Mono kicker `— STAFF AI ENGINEER · LILT AI`, then two-line stacked display `CHARLIE / SHI` (Space Grotesk 800, ~92px desktop / clamp, line-height 0.9). EN↔ZH flicker animation preserved. The Chinese variant (`石千里`) renders on a **single** line at a larger size (~140px clamp, line-height 1.0) so it visually fills the same bounding box as the two-line English name; both share the same grid cell via the existing `display: inline-grid; grid-template-areas: 'n'` pattern.
- Bottom edge: `<MetaBar date="26.05.25" coords="N 42°39′ W 71°08′" build="0x4F2A" cta="↗ ENTER" />` — dashed top border, mono labels.
- Background: `.glyph-grid` + `.scan-line-soft` overlay. Existing radial-gradient ambient light kept but desaturated (drop magenta tint).

### 5.3 Copy (locked)

- Kicker: `— STAFF AI ENGINEER · LILT AI`
- Name: `CHARLIE SHI` (English) / `石千里` (Chinese) — same flicker as today.
- Meta date: dynamic — formatted as `YY.MM.DD` from build time (compute in frontmatter; static-site, so this freezes to deploy date).
- Coords: `N 42°39′ W 71°08′` (Andover, MA).
- Build hash: pseudo-random hex token rendered as `0x` + 4 uppercase hex chars (e.g. `0x4F2A`). Computed once at build time from `Date.now().toString(16).slice(-4).toUpperCase()`. Purely decorative — freezes at deploy, refreshes on each Cloudflare Pages build.
- CTA: `↗ ENTER` linking to `#about` (smooth scroll via CSS `scroll-behavior` already in repo).

### 5.4 Responsive

- Below `md` (768px): glyph strip hides, file index shrinks to ~80px, corner brackets shrink to 14px, frame inset becomes `--frame-pad-sm`. Name drops to single line if needed.

## 6. Site-wide Application

### 6.1 `Navbar.astro` (rewrite)

- Brand becomes `[▙] CHARLIE_SHI.SYS` — a small 10×10 yellow corner-tick glyph + mono brand text. Replaces current bare name.
- Link treatment: mono labels (`HOME`, `PORTFOLIO`, `BLOG`) in `text-secondary`. Active route: yellow text + small yellow corner-tick at top-left of the link (no underline). Hover on inactive: link fades to `text-primary` and a faint yellow corner-tick fades in (CSS only, no JS).
- Glitch hover removed.

### 6.2 `SectionDivider.astro` (rewrite)

Horizontal layout: `<GlyphStrip direction="h" count={4}> // LABEL ━━━━━━ <RegMark /> 02/03`

- Leading glyph strip (×, ○, ⊞, +) in `text-secondary`.
- `// LABEL` (yellow, mono, tracking 0.3em).
- Dither rule (existing `.dither-divider`) flexes to fill.
- Blue `<RegMark>` (+).
- File-counter (`02/03`) in mono `text-secondary`.

Props: `label: string`, `index?: string` (defaults to next auto-increment if not provided).

### 6.3 `AboutSection.astro` (rewrite — biggest restructure)

Two-column grid (collapses to single column below `md`):

- **Left:** `.dashed-enclosure` containing the prose. Heading is a `// PROFILE — DARK-SPACE HAULAGE LOGISTICS` style mono label in yellow.
- **Right:** Stacked stat strips. Each strip is a yellow-left-rule (`border-left: 2px solid var(--accent-yellow)`) with a mono key (`ROLE`, `LOCATION`, `FOCUS`) and a Space Grotesk value below. Below the stat strips: a bracketed link row (`[ GITHUB ] [ LINKEDIN ] [ MEDIUM ] [ EMAIL ]` — each is a `<a>` styled as a `.callout-tag` with a leading `↗`).

Copy stays content-driven (sourced from existing about copy); only the layout changes.

### 6.4 `PortfolioCard.astro` (rewrite)

- Card surface: `bg-surface` with `.glyph-grid` background and `border: 1px solid var(--border-default)`.
- Corner ticks: faint yellow ticks at top-left and bottom-right (10px, opacity 0.4) — replaces glitch-hover.
- Top: large yellow `<FileIndex>` `001`, `002`, … (zero-padded to 3 digits, derived from collection order).
- Title: Space Grotesk 600, uppercase, tracking 0.04em, ~22px.
- Meta line at bottom: mono year, tags, then `↗ READ` CTA right-aligned in yellow.
- **Featured:** `featured: true` in collection frontmatter adds `md:col-span-2` (existing behavior) **and** absolute-positioned `.callout-tag` `[ FEATURED ]` in card top-right (replaces glow-pulse).
- Hover: top-left + bottom-right corner ticks animate to opacity 1.0 over 200ms; no other change.

### 6.5 `BlogCard.astro` (rewrite)

Mirror of PortfolioCard but with:

- `FileIndex` shows the post number (`B001`, `B002`…) — prefix to distinguish from portfolio.
- Title-row excerpt: 2-line clamp.
- Meta line: published date in `YY.MM.DD`, then tags, then `↗ READ`.
- Thumbnail (from Medium RSS): rendered as a small monochrome-tinted strip below the title (cyan removed; if thumbnail is colorful, apply CSS `filter: grayscale(1) brightness(0.85);` to keep it muted under the antireal language).

### 6.6 Portfolio detail (`src/pages/portfolio/[slug].astro`)

- Page top: `<CornerFrame>` wraps the article container.
- Top label: `// PORTFOLIO / [TITLE]` mono yellow.
- File index `<FileIndex>` large at top-right.
- Body content (`<Content />` from collection entry) stays inside a `.dashed-enclosure` for prose framing.
- Page-foot `<MetaBar>` with project metadata (year, stack, role) and `↗ BACK` to `/portfolio`.

### 6.7 Blog detail (`src/pages/blog/[slug].astro`)

- Same chrome as portfolio detail: corner frame, top label `// BLOG / [TITLE]`, file index, dashed enclosure around the Medium content.
- Prose stays inside Tailwind `prose prose-invert` — token overrides updated: `--tw-prose-links: var(--accent-yellow)` (was cyan), `--tw-prose-quote-borders: var(--accent-yellow)` (was cyan).
- Page-foot meta bar: pub date, original Medium link as `↗ READ ON MEDIUM`.

### 6.8 `Base.astro`

- Background `<div class="noise-overlay">` stays.
- New global `<div class="scan-line-soft">` overlay (fixed, low opacity) — replaces removed scan-line treatment.
- Page-foot `<MetaBar>` rendered globally below the slot, on every page. This is **distinct from the hero's inline `<MetaBar>`** — the hero one sits inside the hero frame and uses `↗ ENTER` to scroll to about; the page-foot one sits at the very bottom of the document and uses `↗ TOP` to scroll-up. Pages that don't ship the hero (portfolio/blog listings + detail pages) only show the page-foot meta bar.

## 7. Acceptance Criteria

The redesign is "done" when:

1. `npm run dev` renders the new hero matching the H2 mockup at 1280×900 within ±10% margin of the spec composition.
2. Magenta and cyan tokens are deleted from `tailwind.config.mjs`. `rg "accent-magenta|accent-cyan"` returns zero hits across `src/`.
3. `.dot-grid`, `.glitch-hover`, `.glow-pulse` CSS classes are removed from `src/styles/global.css`. `rg "dot-grid|glitch-hover|glow-pulse"` returns zero hits across `src/`.
4. Every page (home, portfolio listing, portfolio detail, blog listing, blog detail) renders the new global `<MetaBar>` at the bottom of the slot.
5. `npm run build` succeeds with no new TypeScript or Astro warnings introduced.
6. EN↔ZH name flicker remains functional in the new hero.

## 8. Out of Scope

- Animations beyond the existing EN↔ZH flicker and the small fade-in/out on nav + card corner ticks.
- Mobile-first redesign — desktop is the primary target; mobile gets reasonable defaults but is not the design driver.
- Light mode.
- Search, comments, dynamic blog content, dark/light toggle.
- Accessibility audit beyond preserving current contrast ratios (existing color-on-color contrast should not regress; yellow on `#0a0a0a` is `~11:1`, exceeds AA).
- SEO changes.
- Performance work (already a static site).

## 9. File-level Change Summary

| File | Change |
|---|---|
| `tailwind.config.mjs` | Remove `accent-cyan`, `accent-magenta` from colors. Add `accent-blue: #1860ff`. Update `text-secondary`, `bg-surface`, `bg-elevated`, `border-default`. Update `typography.invert.css` color overrides. |
| `src/styles/global.css` | Remove `.dot-grid`, `.glitch-hover`, `.glow-pulse`, current `.scan-lines::after`. Add `.glyph-grid`, `.dashed-enclosure`, `.callout-tag`, `.scan-line-soft`, `.hairline-yellow`, `.hairline-blue`. Update `.section-label` color to yellow. Add new CSS vars (`--frame-pad`, `--rule-thin`, `--rule-mark`). |
| `src/components/Hero.astro` | Full rewrite to H2 composition. Preserve EN↔ZH flicker. |
| `src/components/Navbar.astro` | Rewrite — brand becomes `[▙] CHARLIE_SHI.SYS`, active link gets corner tick, glitch-hover removed. |
| `src/components/SectionDivider.astro` | Rewrite — glyph strip + label + dither + reg mark + file counter. |
| `src/components/AboutSection.astro` | Rewrite — two-column with dashed enclosure + stat strips + bracketed link row. |
| `src/components/PortfolioCard.astro` | Rewrite — file index, corner ticks, callout-tag for featured. |
| `src/components/BlogCard.astro` | Rewrite — same vocabulary as PortfolioCard with `B###` index. |
| `src/layouts/Base.astro` | Add global scan-line-soft overlay + global page-foot MetaBar. |
| `src/pages/portfolio/[slug].astro` | Add page chrome (corner frame, top label, file index, dashed enclosure, foot meta bar). |
| `src/pages/blog/[slug].astro` | Same chrome as portfolio detail; update prose color overrides. |
| **New:** `src/components/CornerFrame.astro` | New motif component. |
| **New:** `src/components/MetaBar.astro` | New motif component. |
| **New:** `src/components/FileIndex.astro` | New motif component. |
| **New:** `src/components/RegMark.astro` | New motif component (replaces inline `.reg-mark`). |
| **New:** `src/components/GlyphStrip.astro` | New motif component. |
| `CLAUDE.md` | Update "Design language" section to reflect the antireal restatement and update token/utility class lists. |

## 10. Open Questions

None at sign-off time. Spec is implementable as written.
