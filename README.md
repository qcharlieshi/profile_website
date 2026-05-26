# profileWebsite

Personal portfolio site — home, resume, portfolio, and blog — built as a pure static site with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed to [Cloudflare Workers](https://workers.cloudflare.com) (Static Assets).

**Design language:** "Antireal v2" — terminal-led navigation, hero-as-manifest. Dark mode only, monospace metadata, blocky geometric typography, yellow (`#ffd23f`) primary accent with electric blue (`#1860ff`) secondary. A sticky mock terminal header replaces the navbar with a real interactive prompt (`cd / ls / pwd / whoami / clear / help`); the home (`/`) and resume (`/resume/`) routes render the same hero with different default panes, swapped in-app via `history.pushState` and a Marathon-style red checkerboard transition. One small inline JS island handles the terminal and pane swap; everything else is CSS-only.

## Stack

- **Astro 4** with `output: 'static'` — plain HTML/CSS at build time
- **Tailwind CSS** (+ `@tailwindcss/typography` for blog content)
- **TypeScript** for data and utilities
- **fast-xml-parser** for fetching & parsing Medium RSS at build time
- **Cloudflare Workers (Static Assets)** for hosting — no SSR adapter, flat files on the CDN

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
├── layouts/Base.astro              # HTML shell: fonts, noise, TerminalHeader, global PaneTransition, slot
├── pages/
│   ├── index.astro                 # Home: <Hero initialPane="about" />
│   ├── resume/index.astro          # <Hero initialPane="resume" />
│   ├── portfolio/
│   │   ├── index.astro             # Listing
│   │   └── [slug].astro            # Detail (getStaticPaths from content collection)
│   └── blog/
│       ├── index.astro             # Listing (Medium RSS)
│       └── [slug].astro            # Post detail (getStaticPaths)
├── components/
│   ├── TerminalHeader.astro        # Fixed terminal-style prompt + status + output drawer
│   ├── Hero.astro                  # Full-viewport hero hosting the active pane
│   ├── RightRail.astro             # Sector number + ABOUT / RESUME / PORTFOLIO / BLOG list
│   ├── PaneTransition.astro        # Red-checkerboard overlay used for in-app swaps
│   ├── panes/{AboutPane,ResumePane}.astro
│   ├── CornerFrame.astro           # Yellow corner brackets (optional click-to-hide targets)
│   ├── MetaBar.astro               # Dashed metadata rail
│   ├── GlyphStrip.astro            # Vertical / horizontal repeating glyphs
│   ├── RegMark.astro               # Blue + crosshair
│   ├── SectionDivider.astro        # Glyph strip + // LABEL + dither rule + RegMark
│   ├── FileIndex.astro             # Legacy primitive (used inside SectionDivider)
│   ├── PortfolioCard.astro
│   └── BlogCard.astro
├── content/
│   ├── config.ts                   # Collections schema (Zod)
│   └── portfolio/                  # One .md file per project (filename = slug)
├── lib/
│   ├── medium.ts                   # Medium RSS fetch + parse
│   └── buildMeta.ts                # Real git data (shortHash, subject, date, branch)
├── scripts/site.ts                 # Vanilla TS: terminal commands, pane swap, transitions
├── types/index.ts                  # MediumPost interface
└── styles/global.css               # Tailwind directives + design system CSS
public/                             # images, favicon
```

## Blog

Posts are sourced from [@qcharlieshi on Medium](https://medium.com/feed/@qcharlieshi) at build time. `getStaticPaths()` generates one page per post; full HTML renders in a Tailwind `prose-invert` container. Fetch failures fall back to an empty state. Because posts are baked in at build time, publishing a new Medium post requires a rebuild — currently rebuilds only happen on push to `master`.

## Design System

Tokens live in `tailwind.config.mjs`; utility classes in `src/styles/global.css`:

- **Colors:** `bg-primary` `#0a0a0a`, `bg-surface` `#141416`, `bg-elevated` `#1c1c1f`, `text-primary` `#e8e8e8`, `text-secondary` `#8a8a90`, `accent-yellow` `#ffd23f` (primary), `accent-blue` `#1860ff` (secondary), `border-default` `#2a2a2e`
- **Fonts:** `font-display` (Space Grotesk), `font-mono` (JetBrains Mono), `font-body` (Inter)
- **Effects:** `.noise-overlay`, `.scan-line-soft`, `.glyph-grid`, `.dashed-enclosure`, `.callout-tag`, `.dither-divider`, `.section-label`, `.hairline-yellow`, `.hairline-blue`

Display headings (h1–h6) are forced uppercase globally.

## Deployment

Cloudflare Workers (Static Assets), deployed via GitHub Actions:

- `wrangler.jsonc` declares `assets.directory = "./dist"` — no Worker code, just the static bundle
- `.github/workflows/deploy.yml` runs `npm ci && npm run build && wrangler deploy` on push to `master`
- Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## Further Reading

- `CLAUDE.md` — architecture & conventions for Claude Code / contributors
- `docs/superpowers/specs/` — design specs
- `docs/superpowers/plans/` — implementation plans
