# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built as a pure static site with Astro and Tailwind CSS, deployed on Cloudflare Pages. Three sections: Home (hero + about), Portfolio (project listings + detail pages), Blog (Medium-powered).

**Design language:** "Graphic retro futurism" inspired by Marathon (Bungie) — dark mode only, geometric all-caps typography, scan lines, noise grain, dot grid, glitch hover effects, registration mark motifs. All effects are CSS-only — zero JavaScript shipped to the browser.

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
│   ├── Navbar.astro          # Fixed nav, blur backdrop, glitch hover
│   ├── Hero.astro            # Full-viewport hero, CSS parallax, scan lines
│   ├── AboutSection.astro    # Bio + experience + links
│   ├── SectionDivider.astro  # // LABEL with dither divider + reg mark
│   ├── PortfolioCard.astro   # Project card, dot grid, glow on hover
│   └── BlogCard.astro        # Blog post preview card
├── data/
│   └── portfolio.ts          # Portfolio project data (PortfolioProject[])
├── lib/
│   └── medium.ts             # Fetch + parse Medium RSS at build time
├── types/
│   └── index.ts              # MediumPost, PortfolioProject interfaces
├── styles/
│   └── global.css            # Tailwind directives + design system CSS
└── env.d.ts                  # Astro types reference
public/
├── images/                   # Portfolio images, icons
└── favicon.ico
```

### Styling: Tailwind CSS + Design System

- `@astrojs/tailwind` integration
- `@tailwindcss/typography` for `prose prose-invert` blog content
- Design tokens in `tailwind.config.mjs`:
  - Colors: `bg-primary` `#0a0a0a`, `bg-surface` `#141414`, `bg-elevated` `#1e1e1e`, `text-primary` `#e8e8e8`, `text-secondary` `#888888`, `accent-cyan` `#00f0ff`, `accent-magenta` `#ff2d6b`, `accent-yellow` `#ffd23f`, `border-default` `#2a2a2a`
  - Fonts: `font-display` (Space Grotesk), `font-mono` (JetBrains Mono), `font-body` (Inter)
- Utility classes in `src/styles/global.css`:
  - `.noise-overlay` — fixed SVG `feTurbulence` grain over entire page
  - `.scan-lines` — horizontal CRT scan-line pattern (pseudo-element)
  - `.dot-grid` — dot matrix background for cards
  - `.reg-mark` — `+` crosshair pseudo-element in cyan
  - `.dither-divider` — repeating-linear-gradient horizontal divider
  - `.section-label` — monospace `// LABEL` style
  - `.glitch-hover` — CSS clip-path glitch animation on hover
  - `.glow-pulse` — pulsing cyan box-shadow for featured items

### Blog: Medium RSS at Build Time

- `src/lib/medium.ts` fetches `https://medium.com/feed/@qcharlieshi`
- Parsed with `fast-xml-parser`
- Returns `MediumPost[]` with title, slug, description, pubDate, categories, thumbnail, content (HTML), link
- `getStaticPaths()` in `src/pages/blog/[slug].astro` generates one page per Medium post at build time
- Full HTML content rendered in a Tailwind `prose-invert` container via `set:html`
- Errors return empty array (graceful empty state on listing page)

### Parallax: CSS Only

- `perspective` + `transform: translateZ(-1px) scale(2)` on Hero background layer
- No scroll listeners, no client JS

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

- **Zero client JS:** Every visual effect (parallax, glitch, glow, scan lines, noise) is CSS-only
- **Dark mode only:** No light mode toggle
- **Monospace metadata:** Dates, tags, section labels, nav items use `font-mono` to feel like technical annotations
- **All-caps display headings:** `text-transform: uppercase` enforced globally on h1-h6 in `global.css`
- **Featured items:** `featured: true` on a `PortfolioProject` adds `glow-pulse` animation and `md:col-span-2` in the grid

## Documentation

- **Design spec:** `docs/superpowers/specs/2026-04-14-astro-cloudflare-migration-design.md`
- **Implementation plan:** `docs/superpowers/plans/2026-04-14-astro-cloudflare-migration.md`
- **`MODERNIZATION_PLAN.md`** (repo root): stale legacy plan describing a Next.js migration that was abandoned in favor of the Astro + Cloudflare Pages stack described above. Do not treat as authoritative.
