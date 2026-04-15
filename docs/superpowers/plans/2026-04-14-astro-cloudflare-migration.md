# Astro + Cloudflare Portfolio Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the portfolio as a pure static Astro site with Marathon-inspired graphic realism design, Medium RSS blog, deployed on Cloudflare Pages.

**Architecture:** Astro static output (`output: 'static'`), Tailwind CSS with custom graphic realism design tokens, Medium RSS fetched at build time via `fast-xml-parser`. Zero client-side JavaScript. All interactivity is CSS-only (parallax, glitch hovers, glow effects).

**Tech Stack:** Astro, Tailwind CSS, `@tailwindcss/typography`, `fast-xml-parser`, TypeScript, Cloudflare Pages

**Spec:** `docs/superpowers/specs/2026-04-14-astro-cloudflare-migration-design.md`

**Quality Tier:** Prototype — no tests, only critical-path error handling.

---

## File Map

| File | Responsibility |
|---|---|
| `astro.config.mjs` | Astro config: static output, Tailwind integration |
| `tailwind.config.mjs` | Design tokens: colors, fonts, custom utilities |
| `tsconfig.json` | TypeScript config with `@/*` path alias |
| `package.json` | Dependencies and scripts |
| `src/styles/global.css` | Tailwind directives, CSS custom properties, noise SVG, scan lines, glitch keyframes, registration marks |
| `src/types/index.ts` | `MediumPost` and `PortfolioProject` interfaces |
| `src/data/portfolio.ts` | Portfolio project data (migrated from existing) |
| `src/lib/medium.ts` | Fetch + parse Medium RSS feed |
| `src/layouts/Base.astro` | HTML shell: head (fonts, meta), noise overlay, navbar, slot, footer |
| `src/components/Navbar.astro` | Fixed nav: blurred backdrop, monospace items, glitch hover |
| `src/components/Hero.astro` | Full-viewport hero: CSS parallax, scan lines, all-caps heading |
| `src/components/AboutSection.astro` | Bio section: experience, links, monospace metadata |
| `src/components/SectionDivider.astro` | `// LABEL` divider with registration marks |
| `src/components/PortfolioCard.astro` | Project card: glow border hover, tech tags, dot grid |
| `src/components/BlogCard.astro` | Blog post preview card |
| `src/pages/index.astro` | Home page: Hero + AboutSection + featured projects |
| `src/pages/portfolio/index.astro` | Portfolio listing page |
| `src/pages/portfolio/[slug].astro` | Portfolio detail page with `getStaticPaths` |
| `src/pages/blog/index.astro` | Blog listing from Medium RSS |
| `src/pages/blog/[slug].astro` | Blog post detail with `getStaticPaths` |

---

### Task 1: Scaffold Astro Project and Clean Up Old Code

**Files:**
- Delete: `src/` (entire directory), `next.config.js`, `next-env.d.ts`, `postcss.config.js`, `tailwind.config.ts`, `index.js`, `public/css/`, `public/index.html`, `public/fonts/`
- Create: `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`
- Modify: `package.json`

- [ ] **Step 1: Remove all old source code and config**

```bash
rm -rf src/ next.config.js next-env.d.ts postcss.config.js tailwind.config.ts index.js public/css/ public/index.html public/fonts/
```

- [ ] **Step 2: Remove old dependencies, install new ones**

```bash
rm -rf node_modules package-lock.json yarn.lock
npm init -y
npm install astro @astrojs/tailwind tailwindcss @tailwindcss/typography fast-xml-parser
npm install -D typescript
```

- [ ] **Step 3: Create `package.json` scripts**

Replace the generated `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

- [ ] **Step 4: Create `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
});
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 6: Create `tailwind.config.mjs`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-surface': '#141414',
        'bg-elevated': '#1e1e1e',
        'text-primary': '#e8e8e8',
        'text-secondary': '#888888',
        'accent-cyan': '#00f0ff',
        'accent-magenta': '#ff2d6b',
        'accent-yellow': '#ffd23f',
        'border-default': '#2a2a2a',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-links': '#00f0ff',
            '--tw-prose-code': '#e8e8e8',
            '--tw-prose-pre-bg': '#141414',
            '--tw-prose-pre-code': '#e8e8e8',
            '--tw-prose-quotes': '#e8e8e8',
            '--tw-prose-quote-borders': '#00f0ff',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

- [ ] **Step 7: Create directory structure**

```bash
mkdir -p src/{layouts,pages/portfolio,pages/blog,components,data,lib,types,styles} public/images
```

- [ ] **Step 8: Verify Astro scaffolding works**

Create a minimal `src/pages/index.astro`:
```astro
---
---
<html><body><h1>It works</h1></body></html>
```

Run: `npm run dev`
Expected: Astro dev server starts, page renders at `http://localhost:4321`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, remove Next.js code"
```

---

### Task 2: Design System — Global CSS, Noise Overlay, Glitch Keyframes

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #0a0a0a;
    --bg-surface: #141414;
    --bg-elevated: #1e1e1e;
    --text-primary: #e8e8e8;
    --text-secondary: #888888;
    --accent-cyan: #00f0ff;
    --accent-magenta: #ff2d6b;
    --accent-yellow: #ffd23f;
    --border: #2a2a2a;
  }

  html {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', 'Space Grotesk', system-ui, sans-serif;
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #ffffff;
  }
}

/* ── Noise grain overlay (applied to body via Base.astro inline SVG) ── */
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.04;
}

/* ── Scan lines ── */
.scan-lines::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 2px,
    rgba(255, 255, 255, 0.03) 4px
  );
  z-index: 1;
}

/* ── Dot grid background for cards ── */
.dot-grid {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* ── Registration mark (crosshair) ── */
.reg-mark::before {
  content: '+';
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--accent-cyan);
  opacity: 0.4;
}

/* ── Dither gradient divider ── */
.dither-divider {
  height: 4px;
  background-image: repeating-linear-gradient(
    90deg,
    var(--border) 0px,
    var(--border) 2px,
    transparent 2px,
    transparent 4px
  );
}

/* ── Glitch hover effect ── */
@keyframes glitch {
  0%, 100% {
    clip-path: inset(0 0 0 0);
    transform: translate(0);
  }
  20% {
    clip-path: inset(20% 0 60% 0);
    transform: translate(-2px, 1px);
  }
  40% {
    clip-path: inset(60% 0 10% 0);
    transform: translate(2px, -1px);
  }
  60% {
    clip-path: inset(30% 0 40% 0);
    transform: translate(-1px, -1px);
  }
  80% {
    clip-path: inset(80% 0 5% 0);
    transform: translate(1px, 2px);
  }
}

.glitch-hover {
  position: relative;
}

.glitch-hover:hover {
  animation: glitch 0.3s ease-in-out;
}

/* ── Glow pulse for featured items ── */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.05); }
  50% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.15); }
}

.glow-pulse {
  animation: glow-pulse 3s ease-in-out infinite;
}

/* ── Section label style ── */
.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-secondary);
}
```

- [ ] **Step 2: Import global.css in astro config**

Update `astro.config.mjs` — Astro auto-imports CSS from layouts, so no config change needed. The import happens in `Base.astro` (Task 3).

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add graphic realism design system CSS"
```

---

### Task 3: Base Layout with Noise Overlay and Font Loading

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description = 'Charlie Shi — Full Stack Engineer', ogImage } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {ogImage && <meta property="og:image" content={ogImage} />}
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&family=Space+Grotesk:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <title>{title}</title>
  </head>
  <body class="bg-bg-primary text-text-primary">
    <!-- SVG noise filter definition -->
    <svg class="hidden" aria-hidden="true">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
    </svg>

    <!-- Noise grain overlay -->
    <div class="noise-overlay" style="filter: url(#noise);"></div>

    <slot />
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
```

- [ ] **Step 2: Verify the layout renders**

Update `src/pages/index.astro`:

```astro
---
import Base from '@/layouts/Base.astro';
---

<Base title="Charlie Shi">
  <main class="min-h-screen flex items-center justify-center">
    <h1 class="text-5xl font-display font-bold tracking-widest">CHARLIE SHI</h1>
  </main>
</Base>
```

Run: `npm run dev`
Expected: Dark page with white all-caps heading, noise grain visible, Space Grotesk font loaded.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro
git commit -m "feat: add Base layout with noise overlay and font loading"
```

---

### Task 4: Navbar Component

**Files:**
- Create: `src/components/Navbar.astro`

- [ ] **Step 1: Create `src/components/Navbar.astro`**

```astro
---
const pathname = Astro.url.pathname;

const links = [
  { href: '/', label: 'Home' },
  { href: '/portfolio/', label: 'Portfolio' },
  { href: '/blog/', label: 'Blog' },
];
---

<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-bg-primary/70 border-b border-border-default">
  <div class="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
    <a href="/" class="font-mono text-xs tracking-[0.2em] text-accent-cyan reg-mark flex items-center gap-2">
      CS
    </a>

    <ul class="flex gap-8">
      {links.map((link) => (
        <li>
          <a
            href={link.href}
            class:list={[
              'font-mono text-xs uppercase tracking-[0.15em] py-1 transition-colors duration-200 glitch-hover',
              pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                ? 'text-accent-cyan border-b-2 border-accent-cyan'
                : 'text-text-secondary hover:text-text-primary',
            ]}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
</nav>
```

- [ ] **Step 2: Add Navbar to Base layout**

In `src/layouts/Base.astro`, add the import and component between the noise overlay and `<slot />`:

```astro
---
import Navbar from '@/components/Navbar.astro';
// ... existing props
---
```

Insert after the noise overlay `<div>`:

```html
<Navbar />
```

- [ ] **Step 3: Verify navbar renders**

Run: `npm run dev`
Expected: Fixed top nav with blurred background, "CS" logo in cyan, Home/Portfolio/Blog links in monospace, glitch animation on hover.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.astro src/layouts/Base.astro
git commit -m "feat: add Navbar with blur backdrop and glitch hover"
```

---

### Task 5: Types and Portfolio Data

**Files:**
- Create: `src/types/index.ts`, `src/data/portfolio.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export interface MediumPost {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  categories: string[];
  thumbnail: string;
  content: string;
  link: string;
}

export interface PortfolioProject {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}
```

- [ ] **Step 2: Create `src/data/portfolio.ts`**

```typescript
import type { PortfolioProject } from '@/types/index';

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: 'genzed',
    title: 'GENZED | Online Multiplayer Arena Shooter',
    description: 'GENZED was developed utilizing the Phaser Javascript game engine and socket technology to achieve real time multiplayer gameplay. We utilized various techniques to handle our client server architecture for smooth latency compensation. Pathfinding and lighting were default achieved by using a modified A* algorithm and our own raycasting formula.',
    tags: ['Javascript', 'React', 'Phaser', 'Socket.io'],
    date: 'April 2017',
    featured: true,
  },
  {
    slug: 'project-2',
    title: 'Project Title 2',
    description: 'Description for project 2',
    tags: ['TypeScript', 'Node.js'],
    date: 'March 2017',
  },
  {
    slug: 'project-3',
    title: 'Project Title 3',
    description: 'Description for project 3',
    tags: ['React', 'Redux'],
    date: 'February 2017',
  },
  {
    slug: 'project-4',
    title: 'Project Title 4',
    description: 'Description for project 4',
    tags: ['Express', 'PostgreSQL'],
    date: 'January 2017',
  },
  {
    slug: 'project-5',
    title: 'Project Title 5',
    description: 'Description for project 5',
    tags: ['Next.js', 'Tailwind'],
    date: 'December 2016',
  },
  {
    slug: 'project-6',
    title: 'Project Title 6',
    description: 'Description for project 6',
    tags: ['Python', 'Django'],
    date: 'November 2016',
  },
  {
    slug: 'project-7',
    title: 'Project Title 7',
    description: 'Description for project 7',
    tags: ['Vue.js', 'Vuex'],
    date: 'October 2016',
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/data/portfolio.ts
git commit -m "feat: add types and portfolio data"
```

---

### Task 6: Hero, AboutSection, and SectionDivider Components

**Files:**
- Create: `src/components/Hero.astro`, `src/components/AboutSection.astro`, `src/components/SectionDivider.astro`

- [ ] **Step 1: Create `src/components/SectionDivider.astro`**

```astro
---
interface Props {
  label: string;
}

const { label } = Astro.props;
---

<div class="max-w-[1200px] mx-auto px-6 py-4">
  <div class="flex items-center gap-4">
    <span class="section-label">// {label}</span>
    <div class="flex-1 dither-divider"></div>
    <span class="reg-mark"></span>
  </div>
</div>
```

- [ ] **Step 2: Create `src/components/Hero.astro`**

```astro
---
---

<section class="relative h-screen flex items-center justify-center overflow-hidden scan-lines" style="perspective: 1px;">
  <!-- Parallax background layer -->
  <div
    class="absolute inset-0 -z-10"
    style="transform: translateZ(-1px) scale(2); background: radial-gradient(ellipse at 30% 50%, rgba(0, 240, 255, 0.05), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(255, 45, 107, 0.03), transparent 60%);"
  ></div>

  <div class="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
    <h1 class="font-display font-extrabold tracking-[0.12em] leading-tight" style="font-size: clamp(2.5rem, 5vw, 5rem);">
      CHARLIE SHI
    </h1>
    <p class="font-mono text-sm text-text-secondary tracking-[0.2em] mt-4 uppercase">
      Full Stack Engineer
    </p>
    <div class="flex justify-center gap-3 mt-6">
      <span class="reg-mark"></span>
      <div class="w-16 h-px bg-accent-cyan opacity-40"></div>
      <span class="reg-mark"></span>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/AboutSection.astro`**

```astro
---
---

<section class="py-16 md:py-24">
  <div class="max-w-[1200px] mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
      <!-- Metadata column -->
      <div class="space-y-4">
        <div>
          <span class="font-mono text-xs text-text-secondary tracking-widest uppercase block">Location</span>
          <span class="font-mono text-sm text-text-primary">San Francisco, CA</span>
        </div>
        <div>
          <span class="font-mono text-xs text-text-secondary tracking-widest uppercase block">Focus</span>
          <span class="font-mono text-sm text-text-primary">Full Stack / ML</span>
        </div>
        <div>
          <span class="font-mono text-xs text-text-secondary tracking-widest uppercase block">Current</span>
          <span class="font-mono text-sm text-accent-cyan">LILT AI</span>
        </div>
      </div>

      <!-- Bio column -->
      <div class="space-y-4">
        <p class="text-lg leading-relaxed text-text-primary">
          Engineer focused on building language technology at the intersection of machine translation and large language models. Previously built multiplayer game engines, real-time collaboration tools, and full-stack web applications.
        </p>
        <div class="flex gap-4 mt-6">
          <a href="https://github.com/qcharlieshi" class="font-mono text-xs text-accent-cyan hover:text-accent-yellow transition-colors uppercase tracking-widest glitch-hover">
            GitHub
          </a>
          <a href="https://linkedin.com/in/qcharlieshi" class="font-mono text-xs text-accent-cyan hover:text-accent-yellow transition-colors uppercase tracking-widest glitch-hover">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/components/AboutSection.astro src/components/SectionDivider.astro
git commit -m "feat: add Hero, AboutSection, and SectionDivider components"
```

---

### Task 7: Home Page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Build the home page**

```astro
---
import Base from '@/layouts/Base.astro';
import Hero from '@/components/Hero.astro';
import AboutSection from '@/components/AboutSection.astro';
import SectionDivider from '@/components/SectionDivider.astro';
---

<Base title="Charlie Shi — Full Stack Engineer">
  <Hero />
  <SectionDivider label="ABOUT" />
  <AboutSection />
</Base>
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Expected: Full-viewport hero with parallax gradient background, scan-line overlay, noise grain, "CHARLIE SHI" heading, about section with metadata sidebar and bio text. All on dark background.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build home page with Hero and About sections"
```

---

### Task 8: PortfolioCard Component and Portfolio Pages

**Files:**
- Create: `src/components/PortfolioCard.astro`, `src/pages/portfolio/index.astro`, `src/pages/portfolio/[slug].astro`

- [ ] **Step 1: Create `src/components/PortfolioCard.astro`**

```astro
---
import type { PortfolioProject } from '@/types/index';

interface Props {
  project: PortfolioProject;
}

const { project } = Astro.props;
---

<a
  href={`/portfolio/${project.slug}/`}
  class:list={[
    'block bg-bg-surface border border-border-default rounded-none p-6 transition-all duration-300 dot-grid',
    'hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]',
    project.featured && 'glow-pulse md:col-span-2',
  ]}
>
  {project.featured && (
    <span class="inline-block font-mono text-[10px] text-accent-magenta tracking-[0.2em] uppercase mb-3 border border-accent-magenta px-2 py-0.5">
      Featured
    </span>
  )}

  <h3 class="font-display text-lg font-bold tracking-wider mb-2">{project.title}</h3>

  <p class="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">
    {project.description}
  </p>

  <div class="flex flex-wrap gap-2">
    {project.tags.map((tag) => (
      <span class="font-mono text-[10px] text-accent-magenta tracking-widest uppercase">
        {tag}
      </span>
    ))}
  </div>

  <span class="font-mono text-[10px] text-text-secondary tracking-widest mt-4 block">
    {project.date}
  </span>
</a>
```

- [ ] **Step 2: Create `src/pages/portfolio/index.astro`**

```astro
---
import Base from '@/layouts/Base.astro';
import SectionDivider from '@/components/SectionDivider.astro';
import PortfolioCard from '@/components/PortfolioCard.astro';
import { portfolioProjects } from '@/data/portfolio';
---

<Base title="Portfolio — Charlie Shi">
  <div class="pt-20">
    <SectionDivider label="PORTFOLIO" />
  </div>

  <section class="py-12">
    <div class="max-w-[1200px] mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
        {portfolioProjects.map((project) => (
          <PortfolioCard project={project} />
        ))}
      </div>
    </div>
  </section>
</Base>
```

- [ ] **Step 3: Create `src/pages/portfolio/[slug].astro`**

```astro
---
import Base from '@/layouts/Base.astro';
import SectionDivider from '@/components/SectionDivider.astro';
import { portfolioProjects } from '@/data/portfolio';

export function getStaticPaths() {
  return portfolioProjects.map((project) => ({
    params: { slug: project.slug },
    props: { project },
  }));
}

const { project } = Astro.props;
---

<Base title={`${project.title} — Charlie Shi`}>
  <div class="pt-20">
    <SectionDivider label="PROJECT" />
  </div>

  <article class="py-12">
    <div class="max-w-[800px] mx-auto px-6">
      <a href="/portfolio/" class="font-mono text-xs text-accent-cyan tracking-widest uppercase hover:text-accent-yellow transition-colors glitch-hover">
        &larr; Back to Portfolio
      </a>

      <h1 class="font-display font-extrabold tracking-[0.1em] mt-8 mb-4" style="font-size: clamp(1.5rem, 3vw, 2.5rem);">
        {project.title}
      </h1>

      <div class="flex items-center gap-4 mb-8">
        <span class="font-mono text-xs text-text-secondary tracking-widest">{project.date}</span>
        <div class="flex gap-2">
          {project.tags.map((tag) => (
            <span class="font-mono text-[10px] text-accent-magenta tracking-widest uppercase">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div class="dither-divider mb-8"></div>

      <p class="text-lg leading-relaxed text-text-primary">{project.description}</p>

      <div class="flex gap-4 mt-8">
        {project.githubUrl && (
          <a href={project.githubUrl} class="font-mono text-xs text-accent-cyan tracking-widest uppercase hover:text-accent-yellow transition-colors">
            GitHub &rarr;
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} class="font-mono text-xs text-accent-cyan tracking-widest uppercase hover:text-accent-yellow transition-colors">
            Live &rarr;
          </a>
        )}
      </div>
    </div>
  </article>
</Base>
```

- [ ] **Step 4: Verify portfolio pages**

Run: `npm run dev`
Expected: `/portfolio/` shows grid of cards with dot-grid texture, glow on hover, featured GENZED card spanning 2 cols. `/portfolio/genzed/` shows detail page with back link, title, tags, description.

- [ ] **Step 5: Commit**

```bash
git add src/components/PortfolioCard.astro src/pages/portfolio/
git commit -m "feat: add portfolio listing and detail pages"
```

---

### Task 9: Medium RSS Integration

**Files:**
- Create: `src/lib/medium.ts`

- [ ] **Step 1: Create `src/lib/medium.ts`**

```typescript
import { XMLParser } from 'fast-xml-parser';
import type { MediumPost } from '@/types/index';

const MEDIUM_FEED_URL = 'https://medium.com/feed/@qcharlieshi';

function extractSlug(link: string): string {
  const url = new URL(link);
  const parts = url.pathname.split('-');
  const idPart = parts.pop() || '';
  return url.pathname.split('/').pop()?.replace(`-${idPart}`, '') || idPart;
}

function extractThumbnail(content: string): string {
  const match = content.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1] || '';
}

function stripHtmlForExcerpt(html: string, maxLength = 200): string {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const response = await fetch(MEDIUM_FEED_URL);
    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      isArray: (name) => name === 'item' || name === 'category',
    });
    const feed = parser.parse(xml);
    const items = feed?.rss?.channel?.item || [];

    return items.map((item: any) => ({
      title: item.title || '',
      slug: extractSlug(item.link || ''),
      description: stripHtmlForExcerpt(item['content:encoded'] || item.description || ''),
      pubDate: item.pubDate || '',
      categories: (item.category || []).map((c: any) => (typeof c === 'string' ? c : c['#text'] || '')),
      thumbnail: extractThumbnail(item['content:encoded'] || ''),
      content: item['content:encoded'] || item.description || '',
      link: item.link || '',
    }));
  } catch (error) {
    console.error('Failed to fetch Medium RSS feed:', error);
    return [];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/medium.ts
git commit -m "feat: add Medium RSS fetch and parse utility"
```

---

### Task 10: BlogCard Component and Blog Pages

**Files:**
- Create: `src/components/BlogCard.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`

- [ ] **Step 1: Create `src/components/BlogCard.astro`**

```astro
---
import type { MediumPost } from '@/types/index';

interface Props {
  post: MediumPost;
}

const { post } = Astro.props;

const date = new Date(post.pubDate).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});
---

<a
  href={`/blog/${post.slug}/`}
  class="block bg-bg-surface border border-border-default p-6 transition-all duration-300 dot-grid hover:border-accent-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
>
  {post.thumbnail && (
    <img
      src={post.thumbnail}
      alt={post.title}
      class="w-full h-48 object-cover mb-4 grayscale hover:grayscale-0 transition-all duration-500"
      loading="lazy"
    />
  )}

  <h3 class="font-display text-lg font-bold tracking-wider mb-2 glitch-hover">{post.title}</h3>

  <p class="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">
    {post.description}
  </p>

  <div class="flex items-center justify-between">
    <span class="font-mono text-[10px] text-text-secondary tracking-widest">{date}</span>
    <div class="flex gap-2">
      {post.categories.slice(0, 3).map((cat) => (
        <span class="font-mono text-[10px] text-accent-magenta tracking-widest uppercase">
          {cat}
        </span>
      ))}
    </div>
  </div>
</a>
```

- [ ] **Step 2: Create `src/pages/blog/index.astro`**

```astro
---
import Base from '@/layouts/Base.astro';
import SectionDivider from '@/components/SectionDivider.astro';
import BlogCard from '@/components/BlogCard.astro';
import { getMediumPosts } from '@/lib/medium';

const posts = await getMediumPosts();
---

<Base title="Blog — Charlie Shi">
  <div class="pt-20">
    <SectionDivider label="BLOG" />
  </div>

  <section class="py-12">
    <div class="max-w-[1200px] mx-auto px-6">
      {posts.length === 0 ? (
        <p class="font-mono text-sm text-text-secondary tracking-widest text-center py-20">
          // NO POSTS FOUND — CHECK MEDIUM FEED
        </p>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard post={post} />
          ))}
        </div>
      )}
    </div>
  </section>
</Base>
```

- [ ] **Step 3: Create `src/pages/blog/[slug].astro`**

```astro
---
import Base from '@/layouts/Base.astro';
import SectionDivider from '@/components/SectionDivider.astro';
import { getMediumPosts } from '@/lib/medium';

export async function getStaticPaths() {
  const posts = await getMediumPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;

const date = new Date(post.pubDate).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<Base title={`${post.title} — Charlie Shi`} description={post.description} ogImage={post.thumbnail}>
  <div class="pt-20">
    <SectionDivider label="BLOG POST" />
  </div>

  <article class="py-12">
    <div class="max-w-[800px] mx-auto px-6">
      <a href="/blog/" class="font-mono text-xs text-accent-cyan tracking-widest uppercase hover:text-accent-yellow transition-colors glitch-hover">
        &larr; Back to Blog
      </a>

      <h1 class="font-display font-extrabold tracking-[0.1em] mt-8 mb-4" style="font-size: clamp(1.5rem, 3vw, 2.5rem);">
        {post.title}
      </h1>

      <div class="flex items-center gap-4 mb-2">
        <span class="font-mono text-xs text-text-secondary tracking-widest">{date}</span>
        <div class="flex gap-2">
          {post.categories.map((cat) => (
            <span class="font-mono text-[10px] text-accent-magenta tracking-widest uppercase">
              {cat}
            </span>
          ))}
        </div>
      </div>

      <a href={post.link} class="font-mono text-[10px] text-text-secondary tracking-widest hover:text-accent-cyan transition-colors" target="_blank" rel="noopener">
        View on Medium &rarr;
      </a>

      <div class="dither-divider my-8"></div>

      <div class="prose prose-invert prose-lg max-w-none" set:html={post.content} />
    </div>
  </article>
</Base>
```

- [ ] **Step 4: Verify blog pages**

Run: `npm run build && npm run preview`
Expected: Build fetches Medium RSS. `/blog/` shows post cards (or empty state if no posts). `/blog/[slug]/` renders full HTML content in prose styling with dark mode.

Note: `npm run dev` may also work if Astro fetches at dev time, but `build` is the true test since Medium fetch happens at build time.

- [ ] **Step 5: Commit**

```bash
git add src/components/BlogCard.astro src/pages/blog/
git commit -m "feat: add blog listing and detail pages from Medium RSS"
```

---

### Task 11: Build Verification and CLAUDE.md Update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build completes without errors. `dist/` directory contains static HTML files for all routes.

- [ ] **Step 2: Preview and spot-check all routes**

```bash
npm run preview
```

Check in browser:
- `http://localhost:4321/` — Hero + About
- `http://localhost:4321/portfolio/` — Project cards grid
- `http://localhost:4321/portfolio/genzed/` — Project detail
- `http://localhost:4321/blog/` — Blog listing (may be empty if no Medium posts)

- [ ] **Step 3: Update CLAUDE.md with new project info**

Replace the contents of `CLAUDE.md` with updated architecture documentation reflecting the Astro project.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Astro migration"
```

---

### Task 12: Cloudflare Pages Deployment Setup

**Files:**
- No code changes — manual Cloudflare dashboard setup + optional GitHub Actions

- [ ] **Step 1: Push to GitHub**

```bash
git push origin master
```

- [ ] **Step 2: Connect Cloudflare Pages**

In the Cloudflare dashboard:
1. Go to Pages → Create a project → Connect to Git
2. Select the `profileWebsite` repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

- [ ] **Step 3: Verify deployment**

Expected: Site is live on `<project-name>.pages.dev` with all routes working.

- [ ] **Step 4: (Optional) Set up deploy hook for blog auto-rebuild**

In Cloudflare Pages → Settings → Builds & deployments → Deploy hooks:
1. Create a hook named "Medium Blog Rebuild"
2. Save the webhook URL
3. Create a GitHub Actions workflow to trigger daily:

```yaml
# .github/workflows/rebuild.yml
name: Rebuild for new blog posts
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am UTC
  workflow_dispatch:

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST "${{ secrets.CLOUDFLARE_DEPLOY_HOOK_URL }}"
```
