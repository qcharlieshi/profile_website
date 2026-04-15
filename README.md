# profileWebsite

Personal portfolio site — home, portfolio, and blog — built as a pure static site with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to [Cloudflare Pages](https://pages.cloudflare.com).

**Design language:** "Graphic retro futurism" inspired by Marathon (Bungie) — dark mode only, geometric all-caps typography, scan lines, noise grain, dot grid, glitch hover, registration marks. Every visual effect is CSS-only — zero JavaScript ships to the browser.

## Stack

- **Astro 4** with `output: 'static'` — generates plain HTML/CSS at build time
- **Tailwind CSS** (+ `@tailwindcss/typography` for blog content)
- **TypeScript** for data and utilities
- **fast-xml-parser** for fetching & parsing Medium RSS at build time
- **Cloudflare Pages** for hosting — no SSR adapter, just flat files on the CDN

No React, no client-side routing, no runtime framework.

## Development

```bash
npm install
npm run dev      # dev server on http://localhost:4321
npm run build    # production build to dist/ (fetches Medium RSS)
npm run preview  # serve built dist/ locally
```

## Project Structure

```
src/
├── layouts/Base.astro          # HTML shell: fonts, noise overlay, navbar, slot
├── pages/
│   ├── index.astro             # Home: hero + about
│   ├── portfolio/
│   │   ├── index.astro         # Portfolio listing
│   │   └── [slug].astro        # Portfolio detail (getStaticPaths)
│   └── blog/
│       ├── index.astro         # Blog listing (Medium RSS)
│       └── [slug].astro        # Blog post detail (getStaticPaths)
├── components/                 # Navbar, Hero, AboutSection, *Card, etc.
├── data/portfolio.ts           # PortfolioProject[] source of truth
├── lib/medium.ts               # Medium RSS fetch + parse
├── types/index.ts              # MediumPost, PortfolioProject interfaces
└── styles/global.css           # Tailwind directives + design system CSS
public/                         # images, favicon
```

## Blog

Posts are sourced from [@qcharlieshi on Medium](https://medium.com/feed/@qcharlieshi) at build time. `getStaticPaths()` generates one page per post; full HTML renders in a Tailwind `prose-invert` container. Fetch failures fall back to an empty state.

Because posts are baked in at build time, publishing a new Medium post requires a rebuild — wire a Cloudflare Pages deploy hook to a GitHub Actions cron to automate this.

## Design System

Tokens live in `tailwind.config.mjs`; utility classes in `src/styles/global.css`:

- Colors: `bg-primary` `#0a0a0a`, `bg-surface` `#141414`, `bg-elevated` `#1e1e1e`, `text-primary` `#e8e8e8`, `text-secondary` `#888888`, `accent-cyan` `#00f0ff`, `accent-magenta` `#ff2d6b`, `accent-yellow` `#ffd23f`, `border-default` `#2a2a2a`
- Fonts: `font-display` (Space Grotesk), `font-mono` (JetBrains Mono), `font-body` (Inter)
- Effects: `.noise-overlay`, `.scan-lines`, `.dot-grid`, `.reg-mark`, `.dither-divider`, `.section-label`, `.glitch-hover`, `.glow-pulse`

Display headings (h1–h6) are forced uppercase globally.

## Deployment

Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Astro (or None)

## Further Reading

- `CLAUDE.md` — architecture & conventions for Claude Code / contributors
- `docs/superpowers/specs/` — design specs
- `docs/superpowers/plans/` — implementation plans
