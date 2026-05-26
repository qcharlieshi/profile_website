# Portfolio + Blog as Hero Panes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold the Portfolio and Blog listings into the Hero's pane system so all four right-rail sectors (ABOUT / RESUME / PORTFOLIO / BLOG) swap in place inside one content window, with mini-card listings whose clicks fall through to the existing detail pages via the global transition.

**Architecture:** Two new pane components (`PortfolioPane`, `BlogPane`) render scrollable stacked mini-cards and are mounted as additional `data-pane-slot`s inside `Hero.astro`. `/portfolio/` and `/blog/` stay as real static routes but render `<Hero initialPane="portfolio|blog" />`, exactly like `/resume/`. Giving all four `ROUTES` a `paneKey` makes inter-pane nav an in-place swap automatically; a new delegated click handler sends mini-card clicks through the global checkerboard to the unchanged `[slug]` detail pages. A shared `src/lib/paneMeta.ts` keeps the per-pane meta-bar CTA in sync between SSR and runtime.

**Tech Stack:** Astro (static output, `.astro` templates), TypeScript, Tailwind, vanilla JS island (`src/scripts/site.ts`). No test runner in this repo — verification is `npm run build` (must stay green) plus targeted `npm run dev` visual checks. Prototype tier.

**Spec:** `docs/superpowers/specs/2026-05-26-portfolio-blog-panes-design.md`

---

## Verification conventions

- **Build gate:** `npm run build` must exit 0 with no new warnings. This compiles every imported `.astro`/`.ts` and fetches the Medium RSS feed.
- **Visual gate:** `npm run dev` → open `http://localhost:4321`. Steps name the exact route(s) to check.
- A component file that is not yet imported is not compiled by the build; tasks note when a file's first real validation happens.

---

## File structure

**Create:**
- `src/lib/paneMeta.ts` — `PaneKey` type + `PANE_META` map (href / i18n key / EN label / external flag) per pane. Single source of truth for the meta-bar CTA.
- `src/components/panes/PortfolioPane.astro` — portfolio listing as stacked mini-cards.
- `src/components/panes/BlogPane.astro` — blog listing as stacked mini-cards.

**Modify:**
- `src/lib/i18n.ts` — add `meta.github`, `meta.medium`, `portfolio.label`, `blog.label`.
- `src/lib/medium.ts` — memoize `getMediumPosts()`.
- `src/components/Hero.astro` — widen `initialPane` to four keys, render four pane-slots, set initial CTA from `PANE_META`.
- `src/pages/portfolio/index.astro` — render `<Hero initialPane="portfolio" />`.
- `src/pages/blog/index.astro` — render `<Hero initialPane="blog" />`.
- `src/scripts/site.ts` — import `PANE_META`/`PaneKey`, add `paneKey` to the portfolio/blog routes, drive the swap CTA from `PANE_META`, add `initDetailLinks()`.
- `CLAUDE.md` — reflect four panes, new pane/lib files, removed cards.

**Delete:**
- `src/components/PortfolioCard.astro`
- `src/components/BlogCard.astro`

---

## Task 1: Shared pane-meta module

**Files:**
- Create: `src/lib/paneMeta.ts`

- [ ] **Step 1: Create the module**

```ts
// src/lib/paneMeta.ts
// Single source of truth for pane identity + the meta-bar CTA per pane.
// Imported by Hero.astro (server-rendered initial CTA) and
// site.ts (runtime CTA update on in-place swap).

export type PaneKey = 'about' | 'resume' | 'portfolio' | 'blog';

export interface PaneMeta {
  /** href for the bottom meta-bar CTA when this pane is active. */
  href: string;
  /** i18n key for the CTA label (runtime text swap). */
  i18n: string;
  /** EN default label, used for the server-rendered initial CTA. */
  label: string;
  /** Opens in a new tab (external destination). */
  external: boolean;
}

export const PANE_META: Record<PaneKey, PaneMeta> = {
  about:     { href: '#about',                          i18n: 'meta.enter',    label: '↗ ENTER',        external: false },
  resume:    { href: '/resume.pdf',                     i18n: 'meta.download', label: '↗ DOWNLOAD PDF', external: false },
  portfolio: { href: 'https://github.com/qcharlieshi',  i18n: 'meta.github',   label: '↗ GITHUB',       external: true  },
  blog:      { href: 'https://medium.com/@qcharlieshi', i18n: 'meta.medium',   label: '↗ MEDIUM',       external: true  },
};
```

- [ ] **Step 2: Build gate**

Run: `npm run build`
Expected: exit 0. (The module is not imported yet, so this just confirms nothing broke; first real validation is Task 6/8.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/paneMeta.ts
git commit -m "feat: add shared paneMeta map for four hero panes"
```

---

## Task 2: i18n keys for new CTAs + pane labels

**Files:**
- Modify: `src/lib/i18n.ts`

- [ ] **Step 1: Add the two CTA keys**

In `src/lib/i18n.ts`, in the `T` object, find:

```ts
  'meta.enter':     { en: '↗ ENTER',          zh: '↗ 进入',         es: '↗ ENTRAR' },
  'meta.download':  { en: '↗ DOWNLOAD PDF',   zh: '↗ 下载 PDF',     es: '↗ DESCARGAR PDF' },
```

Replace with:

```ts
  'meta.enter':     { en: '↗ ENTER',          zh: '↗ 进入',         es: '↗ ENTRAR' },
  'meta.download':  { en: '↗ DOWNLOAD PDF',   zh: '↗ 下载 PDF',     es: '↗ DESCARGAR PDF' },
  'meta.github':    { en: '↗ GITHUB',         zh: '↗ GITHUB',       es: '↗ GITHUB' },
  'meta.medium':    { en: '↗ MEDIUM',         zh: '↗ MEDIUM',       es: '↗ MEDIUM' },
```

- [ ] **Step 2: Add the two pane-label keys**

Find:

```ts
  'sec.portfolio': { en: 'PORTFOLIO', zh: '作品集',  es: 'PORTAFOLIO' },
  'sec.blog':      { en: 'BLOG',      zh: '博客',    es: 'BLOG' },
```

Replace with:

```ts
  'sec.portfolio': { en: 'PORTFOLIO', zh: '作品集',  es: 'PORTAFOLIO' },
  'sec.blog':      { en: 'BLOG',      zh: '博客',    es: 'BLOG' },

  // ===== Portfolio / Blog panes =====
  'portfolio.label': { en: '// PORTFOLIO', zh: '// 作品集', es: '// PORTAFOLIO' },
  'blog.label':      { en: '// BLOG',      zh: '// 博客',   es: '// BLOG' },
```

- [ ] **Step 2: Build gate**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "feat: add i18n keys for portfolio/blog pane CTAs and labels"
```

---

## Task 3: Memoize the Medium fetch

`BlogPane` renders on all four Hero pages, so the RSS feed would be fetched 4× per build without memoization.

**Files:**
- Modify: `src/lib/medium.ts`

- [ ] **Step 1: Wrap the fetch in a module-level cache**

In `src/lib/medium.ts`, find:

```ts
export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const response = await fetch(MEDIUM_FEED_URL);
```

Replace with:

```ts
let _cache: Promise<MediumPost[]> | null = null;

// Memoized so the four Hero pages (each renders BlogPane) share one RSS
// fetch per build. The cached promise resolves to [] on failure, matching
// the graceful-empty behavior below.
export function getMediumPosts(): Promise<MediumPost[]> {
  if (!_cache) _cache = fetchMediumPosts();
  return _cache;
}

async function fetchMediumPosts(): Promise<MediumPost[]> {
  try {
    const response = await fetch(MEDIUM_FEED_URL);
```

(The rest of the function body — parser setup, `.map(...)`, and the `catch` returning `[]` — stays exactly as-is. Only the signature line and the cache wrapper above it change.)

- [ ] **Step 2: Build gate**

Run: `npm run build`
Expected: exit 0. Blog listing still renders (verify in Task 7).

- [ ] **Step 3: Commit**

```bash
git add src/lib/medium.ts
git commit -m "perf: memoize getMediumPosts across hero pages"
```

---

## Task 4: PortfolioPane component

**Files:**
- Create: `src/components/panes/PortfolioPane.astro`

First validated in Task 6 (when Hero imports it).

- [ ] **Step 1: Create the component**

```astro
---
import { getCollection } from 'astro:content';

const projects = await getCollection('portfolio');
// Newest first by frontmatter date string (YYYY-MM-DD or YY.MM.DD sort lexically fine for same format).
projects.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
const count = String(projects.length).padStart(2, '0');
---

<div class="pane" data-pane-key="portfolio">
  <div class="pane-label">
    <span data-i18n="portfolio.label">// PORTFOLIO</span>
    <span class="pane-count"> · {count} ENTRIES · SCROLL ↓</span>
  </div>

  <div class="card-col">
    {projects.map((project, i) => {
      const idx = String(i + 1).padStart(2, '0');
      const tag = (project.data.tags?.[0] ?? 'PROJECT').toUpperCase();
      return (
        <a class="mini-card" href={`/portfolio/${project.slug}/`} data-detail-link>
          <div class="mc-head">
            <span class="mc-idx">{idx}</span>
            <span class="mc-tag">{tag}</span>
            {project.data.featured && <span class="mc-feat">[ FEATURED ]</span>}
            <span class="mc-arrow">↗</span>
          </div>
          <h3 class="mc-title">{project.data.title}</h3>
          <p class="mc-desc">{project.data.description}</p>
          <div class="mc-foot">
            <span class="mc-date">{project.data.date}</span>
            {project.data.tags?.slice(0, 3).map((t) => <span class="mc-chip">{t.toUpperCase()}</span>)}
          </div>
        </a>
      );
    })}
  </div>
</div>

<style>
  .pane {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    overflow-y: auto;
    padding-right: 6px;
  }
  .pane::-webkit-scrollbar { width: 6px; }
  .pane::-webkit-scrollbar-track { background: transparent; }
  .pane::-webkit-scrollbar-thumb { background: var(--accent-yellow); }

  .pane-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--accent-yellow);
    flex-shrink: 0;
  }
  .pane-count { color: var(--text-secondary); }

  .card-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mini-card {
    display: block;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    padding: 12px 14px;
    text-decoration: none;
    color: inherit;
    transition: border-color 200ms ease;
  }
  .mini-card:hover { border-color: var(--accent-yellow); }

  .mc-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .mc-idx { color: #4a4a4f; }
  .mc-tag { color: var(--accent-yellow); }
  .mc-feat { color: var(--accent-yellow); border: 1px solid var(--accent-yellow); padding: 0 6px; }
  .mc-arrow { margin-left: auto; color: var(--accent-yellow); }

  .mc-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-primary);
    margin: 8px 0 0;
  }
  .mc-desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 6px 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .mc-foot {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 10px;
  }
  .mc-date { color: var(--accent-blue); }

  @media (max-width: 768px) {
    .mc-title { font-size: 16px; }
    .mc-desc { font-size: 12px; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/panes/PortfolioPane.astro
git commit -m "feat: add PortfolioPane mini-card listing"
```

---

## Task 5: BlogPane component

**Files:**
- Create: `src/components/panes/BlogPane.astro`

First validated in Task 6.

- [ ] **Step 1: Create the component**

```astro
---
import { getMediumPosts } from '../../lib/medium';

const posts = await getMediumPosts();
const count = String(posts.length).padStart(2, '0');

function dateLabel(pubDate: string): string {
  const d = new Date(pubDate);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}
---

<div class="pane" data-pane-key="blog">
  <div class="pane-label">
    <span data-i18n="blog.label">// BLOG</span>
    <span class="pane-count"> · {count} ENTRIES · SCROLL ↓</span>
  </div>

  {posts.length === 0 ? (
    <p class="empty" data-i18n="blog.empty">// NO POSTS FOUND — CHECK MEDIUM FEED</p>
  ) : (
    <div class="card-col">
      {posts.map((post, i) => {
        const idx = `B${String(i + 1).padStart(2, '0')}`;
        const cat = (post.categories?.[0] ?? 'TRANSMISSION').toUpperCase();
        return (
          <a class="mini-card" href={`/blog/${post.slug}/`} data-detail-link>
            <div class="mc-head">
              <span class="mc-idx">{idx}</span>
              <span class="mc-tag">{cat}</span>
              <span class="mc-arrow">↗</span>
            </div>
            <div class="mc-row">
              {post.thumbnail && <img class="mc-thumb" src={post.thumbnail} alt="" loading="lazy" />}
              <div class="mc-main">
                <h3 class="mc-title">{post.title}</h3>
                <p class="mc-desc">{post.description}</p>
              </div>
            </div>
            <div class="mc-foot">
              <span class="mc-date">{dateLabel(post.pubDate)}</span>
              {post.categories?.slice(0, 3).map((c) => <span class="mc-chip">{c.toUpperCase()}</span>)}
            </div>
          </a>
        );
      })}
    </div>
  )}
</div>

<style>
  .pane {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    overflow-y: auto;
    padding-right: 6px;
  }
  .pane::-webkit-scrollbar { width: 6px; }
  .pane::-webkit-scrollbar-track { background: transparent; }
  .pane::-webkit-scrollbar-thumb { background: var(--accent-yellow); }

  .pane-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--accent-yellow);
    flex-shrink: 0;
  }
  .pane-count { color: var(--text-secondary); }

  .empty {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
  }

  .card-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mini-card {
    display: block;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    padding: 12px 14px;
    text-decoration: none;
    color: inherit;
    transition: border-color 200ms ease;
  }
  .mini-card:hover { border-color: var(--accent-yellow); }

  .mc-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .mc-idx { color: #4a4a4f; }
  .mc-tag { color: var(--accent-yellow); }
  .mc-arrow { margin-left: auto; color: var(--accent-yellow); }

  .mc-row { display: flex; gap: 12px; }
  .mc-thumb {
    width: 56px;
    height: 56px;
    object-fit: cover;
    flex-shrink: 0;
    filter: grayscale(1) brightness(0.85);
    margin-top: 8px;
  }
  .mc-main { min-width: 0; }

  .mc-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--text-primary);
    margin: 8px 0 0;
  }
  .mc-desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 6px 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .mc-foot {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.18em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 10px;
  }
  .mc-date { color: var(--accent-blue); }

  @media (max-width: 768px) {
    .mc-title { font-size: 16px; }
    .mc-desc { font-size: 12px; }
    .mc-thumb { width: 44px; height: 44px; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/panes/BlogPane.astro
git commit -m "feat: add BlogPane mini-card listing"
```

---

## Task 6: Wire all four panes into Hero

**Files:**
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Update the frontmatter (imports, prop type, sector, CTA)**

In `src/components/Hero.astro`, find the frontmatter block:

```astro
---
import CornerFrame from './CornerFrame.astro';
import GlyphStrip from './GlyphStrip.astro';
import RightRail from './RightRail.astro';
import PaneTransition from './PaneTransition.astro';
import AboutPane from './panes/AboutPane.astro';
import ResumePane from './panes/ResumePane.astro';
import { getBuildMeta } from '../lib/buildMeta';

interface Props {
  initialPane: 'about' | 'resume';
}
const { initialPane } = Astro.props;
const meta = getBuildMeta();

const sector = initialPane === 'about' ? '01' : '02';
---
```

Replace with:

```astro
---
import CornerFrame from './CornerFrame.astro';
import GlyphStrip from './GlyphStrip.astro';
import RightRail from './RightRail.astro';
import PaneTransition from './PaneTransition.astro';
import AboutPane from './panes/AboutPane.astro';
import ResumePane from './panes/ResumePane.astro';
import PortfolioPane from './panes/PortfolioPane.astro';
import BlogPane from './panes/BlogPane.astro';
import { getBuildMeta } from '../lib/buildMeta';
import { PANE_META, type PaneKey } from '../lib/paneMeta';

interface Props {
  initialPane: PaneKey;
}
const { initialPane } = Astro.props;
const meta = getBuildMeta();

const SECTOR: Record<PaneKey, string> = { about: '01', resume: '02', portfolio: '03', blog: '04' };
const sector = SECTOR[initialPane];
const cta = PANE_META[initialPane];
---
```

- [ ] **Step 2: Render four pane-slots**

Find:

```astro
        <div class="pane-frame" data-pane-frame>
          <div class="pane-slot" data-pane-slot="about" data-active={initialPane === 'about' ? 'true' : 'false'} aria-hidden={initialPane !== 'about'}>
            <AboutPane />
          </div>
          <div class="pane-slot" data-pane-slot="resume" data-active={initialPane === 'resume' ? 'true' : 'false'} aria-hidden={initialPane !== 'resume'}>
            <ResumePane />
          </div>
        </div>
```

Replace with:

```astro
        <div class="pane-frame" data-pane-frame>
          <div class="pane-slot" data-pane-slot="about" data-active={initialPane === 'about' ? 'true' : 'false'} aria-hidden={initialPane !== 'about'}>
            <AboutPane />
          </div>
          <div class="pane-slot" data-pane-slot="resume" data-active={initialPane === 'resume' ? 'true' : 'false'} aria-hidden={initialPane !== 'resume'}>
            <ResumePane />
          </div>
          <div class="pane-slot" data-pane-slot="portfolio" data-active={initialPane === 'portfolio' ? 'true' : 'false'} aria-hidden={initialPane !== 'portfolio'}>
            <PortfolioPane />
          </div>
          <div class="pane-slot" data-pane-slot="blog" data-active={initialPane === 'blog' ? 'true' : 'false'} aria-hidden={initialPane !== 'blog'}>
            <BlogPane />
          </div>
        </div>
```

- [ ] **Step 3: Generalize the meta-bar CTA to all four panes**

Find:

```astro
        <a class="meta-cta" href={initialPane === 'about' ? '#about' : '/resume.pdf'} data-cta-href data-i18n={initialPane === 'about' ? 'meta.enter' : 'meta.download'}>
          {initialPane === 'about' ? '↗ ENTER' : '↗ DOWNLOAD PDF'}
        </a>
```

Replace with:

```astro
        <a
          class="meta-cta"
          href={cta.href}
          data-cta-href
          data-i18n={cta.i18n}
          {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {cta.label}
        </a>
```

- [ ] **Step 4: Build gate**

Run: `npm run build`
Expected: exit 0. This is the first build that compiles `PortfolioPane`, `BlogPane`, and `paneMeta.ts`.

- [ ] **Step 5: Visual gate**

Run: `npm run dev`, open `http://localhost:4321/` (about) and `http://localhost:4321/resume/`.
Expected: home shows the About pane as before; resume shows the Resume pane as before; no console errors. (Portfolio/Blog panes are present but hidden until Task 7 makes them the initial pane.)

- [ ] **Step 6: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: render portfolio and blog panes in Hero"
```

---

## Task 7: Point /portfolio/ and /blog/ at the Hero

**Files:**
- Modify: `src/pages/portfolio/index.astro`
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Rewrite the portfolio index**

Replace the entire contents of `src/pages/portfolio/index.astro` with:

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
---

<Base title="Portfolio — Charlie Shi" description="Portfolio — Charlie Shi">
  <Hero initialPane="portfolio" />
</Base>
```

- [ ] **Step 2: Rewrite the blog index**

Replace the entire contents of `src/pages/blog/index.astro` with:

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
---

<Base title="Blog — Charlie Shi" description="Blog — Charlie Shi">
  <Hero initialPane="blog" />
</Base>
```

- [ ] **Step 3: Build gate**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 4: Visual gate**

Run: `npm run dev`.
- `http://localhost:4321/portfolio/` → Portfolio pane active in the content window: `// PORTFOLIO · NN ENTRIES`, stacked mini-cards, scrolls inside the pane, sector reads `03`, rail caret on PORTFOLIO.
- `http://localhost:4321/blog/` → Blog pane active: posts as mini-cards (thumbnails small/grayscale), sector `04`, caret on BLOG. (If the live Medium feed is empty, the `// NO POSTS FOUND` line shows — acceptable.)
- Mini-card hover ramps the border to yellow.

Note: rail/terminal nav into portfolio/blog still does a full-page reload at this point (routes lack `paneKey` until Task 8) — that's expected and functional.

- [ ] **Step 5: Commit**

```bash
git add src/pages/portfolio/index.astro src/pages/blog/index.astro
git commit -m "feat: render /portfolio/ and /blog/ as hero panes"
```

---

## Task 8: Make all four panes swap in place + card click-through

**Files:**
- Modify: `src/scripts/site.ts`

- [ ] **Step 1: Import PANE_META and PaneKey; drop the local PaneKey type**

In `src/scripts/site.ts`, find:

```ts
import { T, TH, altLang, LANGS, LANG_LABEL, type Lang } from '../lib/i18n';

type PaneKey = 'about' | 'resume';
```

Replace with:

```ts
import { T, TH, altLang, LANGS, LANG_LABEL, type Lang } from '../lib/i18n';
import { PANE_META, type PaneKey } from '../lib/paneMeta';
```

- [ ] **Step 2: Give the portfolio/blog routes a paneKey**

Find:

```ts
  { pathname: '/portfolio/',                     sector: '03', label: 'PORTFOLIO' },
  { pathname: '/blog/',                          sector: '04', label: 'BLOG' },
```

Replace with:

```ts
  { pathname: '/portfolio/', paneKey: 'portfolio', sector: '03', label: 'PORTFOLIO' },
  { pathname: '/blog/',      paneKey: 'blog',      sector: '04', label: 'BLOG' },
```

- [ ] **Step 3: Drive the swap CTA from PANE_META**

Find, inside `swapPane`:

```ts
    // Update meta-bar CTA: swap the i18n key + re-apply for current lang.
    const cta = $<HTMLAnchorElement>('[data-cta-href]');
    if (cta) {
      if (targetKey === 'about') {
        cta.dataset.i18n = 'meta.enter';
        cta.setAttribute('href', '#about');
      } else {
        cta.dataset.i18n = 'meta.download';
        cta.setAttribute('href', '/resume.pdf');
      }
      applyLang(getLang());
    }
```

Replace with:

```ts
    // Update meta-bar CTA from the shared per-pane map, then re-apply lang.
    const cta = $<HTMLAnchorElement>('[data-cta-href]');
    if (cta) {
      const m = PANE_META[targetKey];
      cta.dataset.i18n = m.i18n;
      cta.setAttribute('href', m.href);
      if (m.external) {
        cta.setAttribute('target', '_blank');
        cta.setAttribute('rel', 'noopener noreferrer');
      } else {
        cta.removeAttribute('target');
        cta.removeAttribute('rel');
      }
      applyLang(getLang());
    }
```

- [ ] **Step 4: Add the detail-link click handler**

Find the `initRail` function:

```ts
// ============ RAIL CLICKS ============

function initRail(): void {
  $$<HTMLAnchorElement>('[data-rail-link]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const r = getRouteByPath(a.getAttribute('href') ?? '/');
      if (r) navigate(r);
    });
  });
}
```

Immediately after it, add:

```ts
// ============ DETAIL LINKS (pane → full page) ============

// Mini-cards inside a listing pane link to a [slug] detail page. Intercept
// the click, play the full-viewport checkerboard, then hard-navigate.
function initDetailLinks(): void {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[data-detail-link]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      location.href = href;
      return;
    }
    fireTransition('global');
    setTimeout(() => { location.href = href; }, 300);
  });
}
```

- [ ] **Step 5: Call initDetailLinks on boot**

Find:

```ts
document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initTerminal();
  initRail();
  initPopstate();
});
```

Replace with:

```ts
document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initTerminal();
  initRail();
  initDetailLinks();
  initPopstate();
});
```

- [ ] **Step 6: Build gate**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 7: Visual gate (the core behavior)**

Run: `npm run dev`, open `http://localhost:4321/`.
- Click rail ABOUT → RESUME → PORTFOLIO → BLOG: each swaps **in place** (no full reload), local red checkerboard plays, sector glyph-overtakes to 01/02/03/04, caret moves, terminal status path/sector update, and the meta-bar CTA changes to ENTER / DOWNLOAD PDF / ↗ GITHUB (new tab) / ↗ MEDIUM (new tab).
- Terminal: type `portfolio`, then `blog`, then `cd /about` — each swaps in place.
- On the Portfolio pane, click a mini-card → **global** checkerboard plays, then lands on `/portfolio/<slug>/`. Same for a blog card → `/blog/<slug>/`.
- From a detail page, click "← BACK" → returns to `/portfolio/` (or `/blog/`) with that pane active.
- Browser Back/Forward steps through the panes correctly.
- Swapping to a long listing then to another pane and back: the listing starts scrolled to top.

- [ ] **Step 8: Commit**

```bash
git add src/scripts/site.ts
git commit -m "feat: swap portfolio/blog panes in place + card click-through"
```

---

## Task 9: Delete the obsolete card components

The mini-card markup now lives inside the panes; `PortfolioCard`/`BlogCard` are unused.

**Files:**
- Delete: `src/components/PortfolioCard.astro`
- Delete: `src/components/BlogCard.astro`

- [ ] **Step 1: Confirm nothing imports them**

Run: `grep -rn "PortfolioCard\|BlogCard" src/`
Expected: no matches (the old index pages that imported them were rewritten in Task 7).

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/PortfolioCard.astro src/components/BlogCard.astro
```

- [ ] **Step 3: Build gate**

Run: `npm run build`
Expected: exit 0 (proves the deletions broke no imports).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove unused PortfolioCard and BlogCard"
```

---

## Task 10: Update CLAUDE.md

Bring project docs in line with the four-pane model.

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the design-language description**

Find:

```
The home (`/`) and resume (`/resume/`) routes render the same hero with different default panes; in-app swap uses `history.pushState` + a Marathon-style red-checkerboard transition.
```

Replace with:

```
All four routes (`/`, `/resume/`, `/portfolio/`, `/blog/`) render the same hero with different default panes; in-app swap between any of the four uses `history.pushState` + a Marathon-style red-checkerboard transition. Portfolio and Blog render their listings as stacked mini-cards inside the pane; clicking a card plays the full-viewport transition and navigates to the `[slug]` detail page.
```

- [ ] **Step 2: Update the pages tree comments**

Find:

```
│   ├── portfolio/
│   │   ├── index.astro       # Portfolio listing
│   │   └── [slug].astro      # Portfolio detail (getStaticPaths)
│   └── blog/
│       ├── index.astro       # Blog listing (Medium RSS)
│       └── [slug].astro      # Blog post detail (getStaticPaths)
```

Replace with:

```
│   ├── portfolio/
│   │   ├── index.astro       # <Hero initialPane="portfolio" />
│   │   └── [slug].astro      # Portfolio detail (getStaticPaths)
│   └── blog/
│       ├── index.astro       # <Hero initialPane="blog" />
│       └── [slug].astro      # Blog post detail (getStaticPaths)
```

- [ ] **Step 3: Update the panes list**

Find:

```
│   │   ├── AboutPane.astro   # About content: prose + 3 stats + 3 link tiles
│   │   └── ResumePane.astro  # Resume content: experience / stack / education in code-listing format
```

Replace with:

```
│   │   ├── AboutPane.astro       # About content: prose + 3 stats + 3 link tiles
│   │   ├── ResumePane.astro      # Resume content: experience / stack / education in code-listing format
│   │   ├── PortfolioPane.astro   # Portfolio listing: stacked mini-cards (getCollection)
│   │   └── BlogPane.astro        # Blog listing: stacked mini-cards (getMediumPosts)
```

- [ ] **Step 4: Drop the removed card components from the tree**

Find:

```
│   ├── PortfolioCard.astro   # Portfolio listing card
│   ├── BlogCard.astro        # Blog listing card
```

Delete both lines.

- [ ] **Step 5: Add paneMeta.ts to the lib list**

Find:

```
│   ├── medium.ts             # Fetch + parse Medium RSS at build time
│   └── buildMeta.ts          # Real git data (shortHash, subject, date, branch) snapshot
```

Replace with:

```
│   ├── medium.ts             # Fetch + parse Medium RSS at build time (memoized)
│   ├── buildMeta.ts          # Real git data (shortHash, subject, date, branch) snapshot
│   └── paneMeta.ts           # PaneKey + per-pane meta-bar CTA map (shared by Hero + site.ts)
```

- [ ] **Step 6: Update the site.ts description**

Find:

```
│   └── site.ts               # Vanilla TS: terminal commands, pane swap, transitions, sector glyph-overtake
```

Replace with:

```
│   └── site.ts               # Vanilla TS: terminal commands, 4-pane swap, transitions, sector glyph-overtake, detail-link click-through
```

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for four-pane hero"
```

---

## Task 11: Final QA pass against the spec checklist

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: exit 0, no warnings. Confirm the Medium feed is fetched once (watch build logs — a single fetch line, not four).

- [ ] **Step 2: Walk the spec §10 verification checklist** in `npm run dev`:

- [ ] Hard refresh of `/portfolio/` and `/blog/` renders the correct pane (no flash of about).
- [ ] Rail click cycles all four panes in place; sector glyph-overtakes 01→02→03→04; caret + terminal status update.
- [ ] Terminal `portfolio` / `blog` / `cd /blog` swap in place from any pane.
- [ ] Mini-card click plays the global checkerboard and lands on the right `[slug]`.
- [ ] Detail "← BACK" returns to the listing pane.
- [ ] Browser back/forward swaps among all four panes.
- [ ] Per-pane meta CTA = ENTER / DOWNLOAD PDF / GITHUB / MEDIUM with correct hrefs; GITHUB/MEDIUM open in a new tab.
- [ ] No references to deleted `PortfolioCard` / `BlogCard` remain (`grep -rn "PortfolioCard\|BlogCard" src/`).
- [ ] `prefers-reduced-motion: reduce` → card click navigates instantly (emulate in DevTools rendering panel).
- [ ] Mobile @ 375px: mini-cards stack + scroll inside the pane; rail strip unchanged.

- [ ] **Step 3:** Fix anything that fails (with a targeted commit per fix). If all pass, the feature is complete.

---

## Self-review

**Spec coverage:** every spec section maps to a task — listing format/mini-cards (Tasks 4–5), routes render Hero (Task 7), four pane-slots + sector/CTA (Task 6), `paneKey` swap reachability + detail click-through (Task 8), Medium memo (Task 3), i18n keys (Task 2), shared CTA map (Task 1, a refinement of the spec's "map in site.ts"), removed cards (Task 9), CLAUDE.md (Task 10), verification checklist (Task 11). The dropped featured-span and `[ FEATURED ]` tag are handled in Task 4. Mobile is covered by the panes' media queries (Tasks 4–5) and verified in Task 11.

**Placeholder scan:** no TBD/TODO; every code step shows complete content; no "handle edge cases" hand-waves.

**Type consistency:** `PaneKey` and `PANE_META` (fields `href`/`i18n`/`label`/`external`) are defined once in `src/lib/paneMeta.ts` (Task 1) and consumed identically in `Hero.astro` (Task 6) and `site.ts` (Task 8). `data-detail-link` and `data-pane-slot` values match between the panes (Tasks 4–5) and the handlers (Task 8). i18n keys added in Task 2 (`meta.github`, `meta.medium`, `portfolio.label`, `blog.label`) are exactly the keys referenced by `PANE_META` and the pane labels.
