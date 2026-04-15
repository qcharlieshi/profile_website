# Portfolio Website: Astro + Cloudflare Migration

## Overview

Rewrite the portfolio website as a pure static site using Astro, deployed on Cloudflare Pages. Replaces the current Next.js/React SPA with zero-JS static HTML output. Blog content sourced from Medium RSS at build time.

## Goals

- Static-first: ship zero JavaScript to the browser
- Minimal dependencies: Astro + Tailwind, nothing else
- Medium-powered blog: fetch RSS at build time, render as static pages
- Cloudflare Pages deployment: flat files on CDN, no server runtime
- Carry over existing static assets (fonts, images, icons)

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

### Styling: Tailwind CSS

- `@astrojs/tailwind` integration
- `@tailwindcss/typography` for `prose` classes on blog content
- Custom font-face declarations for Tungsten and ArcherPro (carried over from `public/fonts/`)
- CSS-only parallax effect on the home hero section

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

- `public/fonts/` — Tungsten, ArcherPro font files
- `public/images/` — portfolio images, tech icons
- `public/favicon.ico`
- `src/data/portfolio.ts` — portfolio project data (rename interface to `PortfolioProject`, drop the `id` field since `slug` is the identifier)

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
