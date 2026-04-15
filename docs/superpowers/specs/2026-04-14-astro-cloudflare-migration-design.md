# Portfolio Website: Astro + Cloudflare Migration

## Overview

Rewrite the portfolio website as a pure static site using Astro, deployed on Cloudflare Pages. Replaces the current Next.js/React SPA with zero-JS static HTML output. Blog content sourced from Medium RSS at build time.

## Goals

- Static-first: ship zero JavaScript to the browser
- Minimal dependencies: Astro + Tailwind, nothing else
- Medium-powered blog: fetch RSS at build time, render as static pages
- Cloudflare Pages deployment: flat files on CDN, no server runtime
- Carry over existing static assets (fonts, images, icons)
- **Graphic realism design language** inspired by Marathon (Bungie) — dark, industrial, maximum-minimalist aesthetic

## Design Language: Graphic Retro Futurism

Inspired by Marathon's "graphic realism" aesthetic (coined by Bungie art director Joseph Cross) and The Designers Republic's "maximum minimalism." The portfolio applies this visual vocabulary to a personal site context — every surface communicates purpose, the design itself is the statement.

### Color Palette

Dark mode only. No light mode.

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0a` | Page background — near-black |
| `--bg-surface` | `#141414` | Card/panel surfaces — elevated black |
| `--bg-elevated` | `#1e1e1e` | Hover states, active surfaces |
| `--text-primary` | `#e8e8e8` | Body text — off-white |
| `--text-secondary` | `#888888` | Captions, metadata — muted gray |
| `--text-heading` | `#ffffff` | Headings — pure white |
| `--accent-cyan` | `#00f0ff` | Primary accent — links, highlights, active states |
| `--accent-magenta` | `#ff2d6b` | Secondary accent — tags, alerts, featured badges |
| `--accent-yellow` | `#ffd23f` | Tertiary accent — warnings, hover flashes |
| `--border` | `#2a2a2a` | Default borders — subtle grid lines |
| `--border-accent` | `#00f0ff` | Active borders, focus states |

### Typography

Two font stacks: a geometric display sans-serif and a monospace for data/secondary text.

- **Display/Headings**: `Space Grotesk` (variable weight, geometric sans-serif) — all-caps, bold (700-800), wide letter-spacing (`0.05em`-`0.15em`). Fallback: `system-ui, sans-serif`
- **Monospace/Data**: `JetBrains Mono` or `IBM Plex Mono` — used for metadata, labels, navigation counters, dates, code. Normal weight (400), tight letter-spacing.
- **Body**: `Inter` or `Space Grotesk` at 400 weight, normal case, default letter-spacing.

Heading hierarchy:
- H1: `clamp(2.5rem, 5vw, 5rem)`, all-caps, weight 800, letter-spacing `0.1em`
- H2: `clamp(1.5rem, 3vw, 2.5rem)`, all-caps, weight 700, letter-spacing `0.08em`
- H3: `clamp(1.1rem, 2vw, 1.5rem)`, all-caps, weight 600
- Body: `1rem`/`1.6` line-height

### Graphic Overlay Textures (CSS-only)

These are the Marathon DNA — applied as pseudo-elements and background patterns. All implemented in pure CSS, no images.

**Scan lines**: A subtle horizontal line pattern overlaid on the hero and section backgrounds.
```css
/* Applied via ::after pseudo-element */
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(255, 255, 255, 0.03) 2px,
  rgba(255, 255, 255, 0.03) 4px
);
```

**Noise/grain texture**: SVG `feTurbulence` filter applied as a fixed overlay across the entire page. Adds film-grain texture that unifies all surfaces.
```css
/* Inline SVG filter in the HTML, referenced by CSS */
filter: url(#noise);
opacity: 0.04;
```

**Dot grid pattern**: Subtle dot matrix background on card surfaces and elevated panels.
```css
background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
background-size: 20px 20px;
```

**Registration marks**: Decorative cross-hair/registration mark motifs placed at section boundaries using pseudo-elements or inline SVG. Small `+` or crosshair shapes at corners of cards or section dividers — a direct Marathon reference.

**Dither gradient dividers**: Section transitions use a dithered gradient pattern (CSS `background-image` with small repeating steps) instead of clean gradients, evoking digital rendering artifacts.

### Component Patterns

**Navbar**: Fixed top, semi-transparent `backdrop-filter: blur(12px)` background over `--bg-primary`. Monospace font for nav items. All-caps. Active state: `--accent-cyan` underline (2px, offset below text). Registration mark motif in the logo area.

**Cards (Portfolio & Blog)**: `--bg-surface` background with `1px solid var(--border)` border. On hover: border transitions to `--accent-cyan`, subtle `box-shadow: 0 0 20px rgba(0, 240, 255, 0.1)` glow. Technology tags use monospace font with `--accent-magenta` color. Corner registration marks on featured cards.

**Hero Section**: Full-viewport height. CSS parallax (`perspective` + `transform: translateZ`) on background layer. Large all-caps heading with staggered line breaks. Scan-line overlay. Noise texture. Bio text in monospace below heading.

**Section Dividers**: Horizontal rule with registration marks at intervals. Dithered gradient fade at edges. Monospace section label (e.g., `// PORTFOLIO`, `// BLOG`) left-aligned above each section.

**Blog Content**: Tailwind `prose` with custom dark-mode overrides — `prose-invert` base. Links in `--accent-cyan`. Code blocks with `--bg-surface` background and `--border` outline. Blockquotes with `--accent-cyan` left border.

### Hover & Interaction Effects (CSS-only)

**Glitch text hover**: On nav items and card titles, a CSS `clip-path` animation that briefly splits the text into offset RGB channels on hover.
```css
/* Simplified — actual implementation uses @keyframes with clip-path slices */
@keyframes glitch {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 1px); }
  40% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
}
```

**Glow pulse**: Featured elements get a subtle pulsing box-shadow in `--accent-cyan` at low opacity.

**Border trace**: On card hover, the border color animates from one corner to all edges using `background` on the border (gradient technique) or `outline-offset` animation.

### Layout Principles

- **Full-bleed sections** with generous vertical padding (`clamp(4rem, 10vh, 8rem)`)
- **Max content width**: `1200px` centered, but hero and section backgrounds are edge-to-edge
- **Asymmetric grid**: Portfolio cards use a `repeat(auto-fill, minmax(350px, 1fr))` grid with occasional featured items spanning 2 columns
- **Monospace metadata** positioned offset from main content — labels feel like they're annotations on a technical drawing
- **Generous whitespace** between sections, dense information within sections

## Site Structure

Three routes:

| Route | Description |
|---|---|
| `/` | Home page: CSS parallax hero + about/bio section |
| `/portfolio/` | Portfolio listing with project cards |
| `/portfolio/[slug]` | Individual portfolio project detail page |
| `/blog/` | Blog listing with post cards from Medium |
| `/blog/[slug]` | Full blog post rendered from Medium RSS content |

The current `/about` page is folded into the home page as a section. The tech stack carousel (Infobox) is removed entirely.

## Architecture

### Framework: Astro (Static Output)

- `output: 'static'` — generates plain HTML/CSS at build time
- All pages are `.astro` files (template syntax, not JSX)
- No UI framework integration (no React, Preact, Svelte, etc.)
- No client-side routing — standard multi-page navigation
- TypeScript for data files and utility functions

### Styling: Tailwind CSS + Graphic Realism Design System

- `@astrojs/tailwind` integration
- `@tailwindcss/typography` for `prose` classes on blog content (customized for dark mode)
- Tailwind config extended with the graphic realism color tokens, font families, and custom utilities
- Google Fonts: `Space Grotesk` (display) + `JetBrains Mono` (monospace) — loaded via `<link>` in Base layout
- CSS-only parallax, scan lines, noise grain, dot grid, glitch hover effects — see Design Language section
- Tungsten/ArcherPro fonts from existing `public/fonts/` are dropped in favor of the new type system

### Blog: Medium RSS at Build Time

- `src/lib/medium.ts` fetches `https://medium.com/feed/@<username>` during `astro build`
- XML parsed with `fast-xml-parser` (lightweight, zero dependencies)
- Extracts per post: title, description/excerpt, publication date, categories, thumbnail image URL, full HTML content body
- Slug derived from the Medium post URL path
- Blog listing page (`/blog/`) renders cards with title, excerpt, date, thumbnail
- Blog detail pages (`/blog/[slug]`) render the full HTML content inside a Tailwind `prose` container
- `getStaticPaths()` generates one page per Medium post

### Parallax: CSS Only

- `background-attachment: fixed` or CSS `transform` with `perspective` on the hero section
- No JavaScript scroll listeners, no Zustand, no scroll state tracking

### SEO

- Per-page `<title>`, `<meta description>`, Open Graph tags set in Astro layout frontmatter
- Blog posts get their own OG metadata derived from Medium post data

## Project Structure

```
src/
├── layouts/
│   └── Base.astro            # HTML shell: <head>, nav, footer, slot
├── pages/
│   ├── index.astro           # Home: parallax hero + about section
│   ├── portfolio/
│   │   ├── index.astro       # Portfolio listing
│   │   └── [slug].astro      # Portfolio detail (getStaticPaths from data)
│   └── blog/
│       ├── index.astro       # Blog listing (getStaticPaths from Medium RSS)
│       └── [slug].astro      # Blog post detail
├── components/
│   ├── Navbar.astro          # Site navigation
│   ├── Hero.astro            # CSS parallax hero section
│   ├── AboutSection.astro    # Bio, experience, links
│   ├── PortfolioCard.astro   # Project card for listings
│   └── BlogCard.astro        # Blog post preview card
├── data/
│   └── portfolio.ts          # Portfolio project data (carried over)
├── lib/
│   └── medium.ts             # Fetch + parse Medium RSS feed
├── types/
│   └── index.ts              # MediumPost, PortfolioProject interfaces
└── styles/
    └── global.css            # Tailwind directives + custom font-faces
public/
├── fonts/                    # Tungsten, ArcherPro (carried over)
├── images/                   # Portfolio images, icons (carried over)
└── favicon.ico
```

## Dependencies

### Added

- `astro` — framework
- `@astrojs/tailwind` — Tailwind integration
- `tailwindcss` — utility-first CSS
- `@tailwindcss/typography` — prose styling for blog content
- `fast-xml-parser` — parse Medium RSS XML at build time

### Removed (all current deps)

- `react`, `react-dom` — no UI framework
- `next` — replaced by Astro
- `zustand`, `reselect` — no client-side state
- `next-mdx-remote`, `gray-matter`, `reading-time`, `date-fns` — no local MDX pipeline
- All `rehype-*`, `remark-*` plugins — no markdown processing
- `highlight.js` — no code syntax highlighting needed (Medium handles it)
- `@types/react`, `@types/react-dom` — no React types

## Deployment

### Cloudflare Pages

- Connect GitHub repo to Cloudflare Pages dashboard
- Build command: `astro build`
- Output directory: `dist/`
- No server runtime — purely static file hosting on Cloudflare's CDN
- No `@astrojs/cloudflare` adapter needed (that's for SSR); static output works out of the box

### Auto-Rebuild for New Blog Posts

- Cloudflare Pages provides a deploy hook (webhook URL)
- Trigger via GitHub Actions cron schedule (e.g., daily) or a Cloudflare Worker on a timer
- New Medium posts appear on the site after the next rebuild

## Migration: What Gets Deleted

All existing `src/` code is replaced. Specifically removed:

- `src/app/` — all Next.js App Router pages
- `src/components/` — all React/TSX components
- `src/content/blog/` — local MDX blog posts
- `src/stores/` — Zustand stores
- `src/lib/blog.ts`, `src/lib/mdx.ts`, `src/lib/store.ts`, `src/lib/utils.ts`
- `src/data/about.ts`, `src/data/skills.ts`, `src/data/index.ts` (about data folded into AboutSection component; skills removed with carousel)
- Root config files: `next.config.js`, `next-env.d.ts`, `postcss.config.js`, `tailwind.config.ts` (replaced by Astro equivalents)
- `public/css/` — legacy CSS files
- `public/index.html` — unused in any framework
- `index.js` — legacy Express entry point

## Migration: What Gets Carried Over

- `public/images/` — portfolio images, tech icons
- `public/favicon.ico`
- `src/data/portfolio.ts` — portfolio project data (rename interface to `PortfolioProject`, drop the `id` field since `slug` is the identifier)

Note: `public/fonts/` (Tungsten, ArcherPro) is NOT carried over — replaced by Google Fonts (Space Grotesk, JetBrains Mono) to match the new graphic realism type system.

## Types

```typescript
// src/types/index.ts

export interface MediumPost {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  categories: string[];
  thumbnail: string;
  content: string;       // HTML from Medium RSS
  link: string;          // Original Medium URL
}

export interface PortfolioProject {
  slug: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}
```
