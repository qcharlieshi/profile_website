# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built as a pure static site with Astro and Tailwind CSS, deployed on Cloudflare Pages. Three sections: Home (hero + about), Portfolio (project listings + detail pages), Blog (Medium-powered).

**Design language:** "Antireal" — direct lineage from the artist who inspired Bungie's Marathon. Dark mode only, monospace metadata, blocky geometric typography. Yellow (`#ffd23f`) is the only primary accent; electric blue (`#1860ff`) is reserved for registration marks and hairline rules. Motifs: yellow corner brackets, dashed metadata rails, big yellow file-index numbers, vertical glyph strips (`× ○ ⊞ + ✕`), dashed enclosures, bracketed callout tags. All effects CSS-only — zero JavaScript shipped to the browser.

## Architecture

### Framework: Astro (Static Output)

- `output: 'static'` in `astro.config.mjs` — generates plain HTML/CSS at build time
- All pages are `.astro` files (template syntax, not JSX)
- No UI framework integration (no React, Preact, Svelte)
- No client-side routing — standard MPA navigation
- TypeScript for data and utilities

### Project Structure

```
src/
├── layouts/
│   └── Base.astro            # HTML shell: head, fonts, noise overlay, navbar, slot
├── pages/
│   ├── index.astro           # Home: hero + about
│   ├── portfolio/
│   │   ├── index.astro       # Portfolio listing
│   │   └── [slug].astro      # Portfolio detail (getStaticPaths)
│   └── blog/
│       ├── index.astro       # Blog listing (Medium RSS)
│       └── [slug].astro      # Blog post detail (getStaticPaths)
├── components/
│   ├── Navbar.astro          # Fixed nav, blur backdrop, file-system brand + corner-tick active link
│   ├── Hero.astro            # Full-viewport H2 asymmetric layout (corner frame, file index, glyph strip, meta bar)
│   ├── AboutSection.astro    # Dashed-enclosure prose + stat strips + bracketed link tiles
│   ├── SectionDivider.astro  # Glyph strip + // LABEL + dither rule + RegMark + optional index counter
│   ├── PortfolioCard.astro   # Project card, glyph-grid background, corner ticks, [FEATURED] tag
│   ├── BlogCard.astro        # Blog post preview card (B-prefixed file index, grayscale thumbnail)
│   ├── CornerFrame.astro     # Yellow corner brackets wrapping a slot — page chrome primitive
│   ├── MetaBar.astro         # Dashed-top metadata rail (date + coords + build hash + CTA)
│   ├── FileIndex.astro       # Big yellow display number with mono label
│   ├── RegMark.astro         # Blue `+` registration crosshair
│   └── GlyphStrip.astro      # Vertical or horizontal repeating glyphs (× ○ ⊞ + ✕)
├── content/
│   ├── config.ts             # Collections schema (Zod)
│   └── portfolio/            # One .md file per project (frontmatter + body)
├── lib/
│   ├── medium.ts             # Fetch + parse Medium RSS at build time
│   └── buildMeta.ts          # Module-load-frozen snapshot for MetaBar (date, hex hash, coords)
├── types/
│   └── index.ts              # MediumPost interface
├── styles/
│   └── global.css            # Tailwind directives + design system CSS
└── env.d.ts                  # Astro types reference
public/
├── images/                   # Portfolio images, icons
└── favicon.ico
```

**Motif components:** `CornerFrame`, `MetaBar`, `FileIndex`, `RegMark`, `GlyphStrip` in `src/components/`. These are the reusable antireal primitives; prefer them over ad-hoc absolute-positioned divs when adding new layouts. Build-time metadata for the meta bars comes from `src/lib/buildMeta.ts`.

### Styling: Tailwind CSS + Design System

- `@astrojs/tailwind` integration
- `@tailwindcss/typography` for `prose prose-invert` blog content
- Design tokens in `tailwind.config.mjs`:
  - Colors: `bg-primary` `#0a0a0a`, `bg-surface` `#141416`, `bg-elevated` `#1c1c1f`, `text-primary` `#e8e8e8`, `text-secondary` `#8a8a90`, `accent-yellow` `#ffd23f` (primary accent), `accent-blue` `#1860ff` (reg marks + hairlines), `border-default` `#2a2a2e`. Raw CSS var name for the border is `--border` (Tailwind utility is `border-default` — same color, different naming context).
  - Fonts: `font-display` (Space Grotesk), `font-mono` (JetBrains Mono), `font-body` (Inter)
- Utility classes in `src/styles/global.css`:
  - `.noise-overlay` — fixed SVG `feTurbulence` grain over entire page
  - `.scan-line-soft` — softened horizontal scan-line pattern (3px stride, 1.2% opacity)
  - `.glyph-grid` — two-layer radial-gradient registration grid (white dots @ 18px, yellow dots @ 54px)
  - `.dashed-enclosure` — 1px dashed border + padding, used for prose blocks
  - `.callout-tag` — `[ LABEL ]` bracketed inline tag (yellow mono)
  - `.dither-divider` — repeating-linear-gradient horizontal divider
  - `.section-label` — monospace `// LABEL` style in yellow
  - `.hairline-yellow`, `.hairline-blue` — 1px decorative rules in accent colors

### Blog: Medium RSS at Build Time

- `src/lib/medium.ts` fetches `https://medium.com/feed/@qcharlieshi`
- Parsed with `fast-xml-parser`
- Returns `MediumPost[]` with title, slug, description, pubDate, categories, thumbnail, content (HTML), link
- `getStaticPaths()` in `src/pages/blog/[slug].astro` generates one page per Medium post at build time
- Full HTML content rendered in a Tailwind `prose-invert` container via `set:html`
- Errors return empty array (graceful empty state on listing page)

### Imports

- Use **relative imports** in `.astro` files (e.g., `'../components/Navbar.astro'`) — the `@/*` alias is only configured for `tsconfig.json` and may not resolve in all `.astro` contexts.

## Development Commands

```bash
npm run dev      # Astro dev server on http://localhost:4321
npm run build    # Production build to dist/ (fetches Medium RSS)
npm run preview  # Serve built dist/ locally
```

## Deployment

- **Platform:** Cloudflare Pages
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **No SSR adapter needed** — pure static output deployed as flat files on Cloudflare's CDN
- **Auto-rebuild for new blog posts:** Set up Cloudflare Pages deploy hook + GitHub Actions cron (see `docs/superpowers/plans/2026-04-14-astro-cloudflare-migration.md` Task 12)

## Key Patterns

- **Zero client JS:** Every visual effect (corner brackets, glyph strips, hairlines, scan-line-soft, noise) is CSS-only. EN↔ZH name flicker on the hero uses CSS keyframes only.
- **Dark mode only:** No light mode toggle
- **Monospace metadata:** Dates, tags, section labels, nav items use `font-mono` to feel like technical annotations
- **All-caps display headings:** `text-transform: uppercase` enforced globally on h1-h6 in `global.css`
- **Featured items:** `featured: true` in a portfolio entry's frontmatter adds `md:col-span-2` in the grid and renders a `[ FEATURED ]` callout-tag in the card's top-right corner
- **Portfolio content:** Astro Content Collections. Schema in `src/content/config.ts`, one `.md` file per project in `src/content/portfolio/` (filename = slug). Load via `getCollection('portfolio')`; render bodies with `await entry.render()` + `<Content />`.

## Documentation

- **Antireal redesign spec:** `docs/superpowers/specs/2026-05-25-antireal-redesign-design.md`
- **Antireal redesign plan:** `docs/superpowers/plans/2026-05-25-antireal-redesign.md`
- **Original Astro migration spec:** `docs/superpowers/specs/2026-04-14-astro-cloudflare-migration-design.md`
- **Original Astro migration plan:** `docs/superpowers/plans/2026-04-14-astro-cloudflare-migration.md`
