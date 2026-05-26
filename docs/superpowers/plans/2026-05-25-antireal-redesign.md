# Antireal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the portfolio site in the antireal/Marathon visual lineage — Dark Terminal palette (yellow + electric blue accents only), H2 asymmetric hero, new motif library, and a full-site rollout that removes the old dot-grid / glow-pulse / glitch-hover vocabulary.

**Architecture:** Five new Astro motif components (`CornerFrame`, `MetaBar`, `FileIndex`, `RegMark`, `GlyphStrip`) backed by Tailwind tokens and a small set of CSS utilities (`.glyph-grid`, `.dashed-enclosure`, `.callout-tag`, `.scan-line-soft`, hairline rules). A single build-meta utility (`src/lib/buildMeta.ts`) supplies the date/hash/coords used in every meta bar. Existing components and pages are rewritten in place; collection schemas, RSS pipeline, and routing are untouched.

**Tech Stack:** Astro (static), Tailwind, TypeScript, `@tailwindcss/typography`. Zero client JS at runtime.

**Tier:** Prototype. Verification = `npm run build` succeeds + visual screenshot check + zero hits on removed-token grep. No unit tests.

**Spec:** `docs/superpowers/specs/2026-05-25-antireal-redesign-design.md`

**Strategy:** Add new tokens/utilities/components first without removing old, migrate consumers page-by-page, sweep deletions at the end. Site stays buildable after every task.

---

### Task 1: Build-meta utility + design tokens

**Files:**
- Create: `src/lib/buildMeta.ts`
- Modify: `src/styles/global.css` (`:root` block, lines 5–16)
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Create `src/lib/buildMeta.ts`**

```ts
export interface BuildMeta {
  date: string;
  hash: string;
  coords: string;
}

export function getBuildMeta(): BuildMeta {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return {
    date: `${yy}.${mm}.${dd}`,
    hash: `0x${Date.now().toString(16).slice(-4).toUpperCase()}`,
    coords: 'N 42°39′ W 71°08′',
  };
}
```

- [ ] **Step 2: Replace the `:root` block in `src/styles/global.css`**

Replace lines 5–16 with:

```css
@layer base {
  :root {
    --bg-primary: #0a0a0a;
    --bg-surface: #141416;
    --bg-elevated: #1c1c1f;
    --text-primary: #e8e8e8;
    --text-secondary: #8a8a90;
    --accent-yellow: #ffd23f;
    --accent-blue: #1860ff;
    --border: #2a2a2e;
    --frame-pad: 48px;
    --frame-pad-sm: 24px;
    --rule-thin: 1px;
    --rule-mark: 1.5px;
  }
```

(Note: `--accent-cyan` and `--accent-magenta` are intentionally omitted. They will be removed from Tailwind in Task 13 after all consumers are migrated. Leave the rest of the `@layer base` block intact below `}` line 16.)

- [ ] **Step 3: Update `tailwind.config.mjs` colors block**

Replace the `colors` object inside `theme.extend` with:

```js
colors: {
  'bg-primary': '#0a0a0a',
  'bg-surface': '#141416',
  'bg-elevated': '#1c1c1f',
  'text-primary': '#e8e8e8',
  'text-secondary': '#8a8a90',
  'accent-cyan': '#00f0ff',
  'accent-magenta': '#ff2d6b',
  'accent-yellow': '#ffd23f',
  'accent-blue': '#1860ff',
  'border-default': '#2a2a2e',
},
```

`accent-cyan` and `accent-magenta` stay in this task — they are removed in Task 13 once nothing references them.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: completes successfully, no warnings about missing tokens.

- [ ] **Step 5: Commit**

```bash
git add src/lib/buildMeta.ts src/styles/global.css tailwind.config.mjs
git commit -m "feat(design): add build-meta utility and antireal tokens"
```

---

### Task 2: Add new CSS utilities (without removing old)

**Files:**
- Modify: `src/styles/global.css` (append below existing utilities, before the keyframes block)

- [ ] **Step 1: Append the following block to `src/styles/global.css`**

Insert immediately after the existing `.section-label` rule (around line 130) and before the `.name-flicker` block:

```css
/* ============ ANTIREAL UTILITIES ============ */

.glyph-grid {
  background-color: var(--bg-primary);
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 210, 63, 0.08) 1px, transparent 1px);
  background-size: 18px 18px, 54px 54px;
  background-position: 0 0, 9px 9px;
}

.dashed-enclosure {
  border: var(--rule-thin) dashed var(--border);
  padding: 18px 22px;
}

.callout-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  color: var(--accent-yellow);
  text-transform: uppercase;
}

.callout-tag::before { content: '['; color: var(--accent-yellow); }
.callout-tag::after  { content: ']'; color: var(--accent-yellow); }

.scan-line-soft {
  position: relative;
}

.scan-line-soft::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(255, 255, 255, 0.012) 3px,
    rgba(255, 255, 255, 0.012) 4px
  );
  z-index: 1;
}

.hairline-yellow {
  display: inline-block;
  height: var(--rule-thin);
  background: var(--accent-yellow);
  vertical-align: middle;
}

.hairline-blue {
  display: inline-block;
  height: var(--rule-thin);
  background: var(--accent-blue);
  opacity: 0.7;
  vertical-align: middle;
}
```

- [ ] **Step 2: Update `.section-label` color**

Change the existing `.section-label` rule (around line 124–130) to use yellow:

```css
.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-yellow);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(design): add antireal css utilities"
```

---

### Task 3: Add motif Astro components

**Files:**
- Create: `src/components/CornerFrame.astro`
- Create: `src/components/MetaBar.astro`
- Create: `src/components/FileIndex.astro`
- Create: `src/components/RegMark.astro`
- Create: `src/components/GlyphStrip.astro`

- [ ] **Step 1: Create `src/components/CornerFrame.astro`**

```astro
---
interface Props {
  inset?: number;
  color?: string;
}

const { inset = 18, color = 'var(--accent-yellow)' } = Astro.props;
---

<div class="cf" style={`--cf-i:${inset}px;--cf-c:${color};`}>
  <span class="cf-tl"></span>
  <span class="cf-tr"></span>
  <span class="cf-bl"></span>
  <span class="cf-br"></span>
  <slot />
</div>

<style>
  .cf { position: relative; }
  .cf > span {
    position: absolute;
    width: 22px;
    height: 22px;
    border: 1.5px solid var(--cf-c);
    pointer-events: none;
  }
  .cf-tl { top: var(--cf-i); left: var(--cf-i); border-right: none; border-bottom: none; }
  .cf-tr { top: var(--cf-i); right: var(--cf-i); border-left: none; border-bottom: none; }
  .cf-bl { bottom: var(--cf-i); left: var(--cf-i); border-right: none; border-top: none; }
  .cf-br { bottom: var(--cf-i); right: var(--cf-i); border-left: none; border-top: none; }

  @media (max-width: 768px) {
    .cf > span { width: 14px; height: 14px; }
  }
</style>
```

- [ ] **Step 2: Create `src/components/MetaBar.astro`**

```astro
---
interface Props {
  date: string;
  coords?: string;
  build?: string;
  cta?: string;
  ctaHref?: string;
}

const { date, coords, build, cta, ctaHref = '#' } = Astro.props;
---

<div class="mb">
  <span class="accent">↳ {date}</span>
  {coords && <span>{coords}</span>}
  {build && <span>BUILD {build}</span>}
  {cta && (
    <a class="cta" href={ctaHref}>{cta}</a>
  )}
</div>

<style>
  .mb {
    display: flex;
    gap: 22px;
    align-items: center;
    flex-wrap: wrap;
    border-top: 1px dashed var(--border);
    padding-top: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .accent { color: var(--accent-yellow); }
  .cta {
    margin-left: auto;
    color: var(--accent-yellow);
    text-decoration: none;
    transition: opacity 200ms ease;
  }
  .cta:hover { opacity: 0.7; }
</style>
```

- [ ] **Step 3: Create `src/components/FileIndex.astro`**

```astro
---
interface Props {
  index: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const { index, label, size = 'lg' } = Astro.props;
---

<div class:list={['fi', `fi-${size}`]}>
  <div class="num">{index}</div>
  {label && <div class="lbl">— {label}</div>}
</div>

<style>
  .fi { display: inline-block; text-align: right; }
  .num {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    color: var(--accent-yellow);
    line-height: 0.85;
  }
  .lbl {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 4px;
  }
  .fi-lg .num { font-size: clamp(60px, 10vw, 140px); }
  .fi-md .num { font-size: clamp(36px, 5vw, 64px); }
  .fi-sm .num { font-size: clamp(24px, 3vw, 36px); }
</style>
```

- [ ] **Step 4: Create `src/components/RegMark.astro`**

```astro
---
interface Props {
  size?: number;
}

const { size = 14 } = Astro.props;
---

<span class="rm" style={`font-size:${size}px;`}>+</span>

<style>
  .rm {
    display: inline-block;
    color: var(--accent-blue);
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
  }
</style>
```

- [ ] **Step 5: Create `src/components/GlyphStrip.astro`**

```astro
---
interface Props {
  direction?: 'v' | 'h';
  count?: number;
  gap?: number;
}

const { direction = 'v', count = 7, gap = 10 } = Astro.props;
const glyphs = ['×', '○', '⊞', '+', '✕'];
const items = Array.from({ length: count }, (_, i) => glyphs[i % glyphs.length]);
---

<div class:list={['gs', `gs-${direction}`]} style={`gap:${gap}px;`}>
  {items.map((g) => <span>{g}</span>)}
</div>

<style>
  .gs {
    display: inline-flex;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.2em;
    color: var(--text-secondary);
  }
  .gs-v { flex-direction: column; }
  .gs-h { flex-direction: row; }
</style>
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: completes successfully. The 5 new components don't yet have consumers, so nothing in the rendered site changes.

- [ ] **Step 7: Commit**

```bash
git add src/components/CornerFrame.astro src/components/MetaBar.astro src/components/FileIndex.astro src/components/RegMark.astro src/components/GlyphStrip.astro
git commit -m "feat(design): add antireal motif components"
```

---

### Task 4: Rewrite Hero (H2 asymmetric manifest)

**Files:**
- Modify: `src/components/Hero.astro` (full rewrite, preserve EN↔ZH flicker)
- Modify: `src/styles/global.css` (extend name-flicker rules for ZH single-line variant)

- [ ] **Step 1: Add ZH single-line size rule to `src/styles/global.css`**

Append to the bottom of `global.css`, after the `@media (prefers-reduced-motion: reduce)` block:

```css
/* H2 hero: ZH renders as a single line filling the EN two-line box. */
.name-flicker.h2 > .name-zh {
  font-size: clamp(72px, 14vw, 140px);
  line-height: 1.0;
  display: flex;
  align-items: center;
}

.name-flicker.h2 > .name-en {
  display: inline-block;
}
```

- [ ] **Step 2: Replace `src/components/Hero.astro` contents entirely**

```astro
---
import CornerFrame from './CornerFrame.astro';
import MetaBar from './MetaBar.astro';
import FileIndex from './FileIndex.astro';
import GlyphStrip from './GlyphStrip.astro';
import { getBuildMeta } from '../lib/buildMeta';

const meta = getBuildMeta();
---

<section class="hero scan-line-soft glyph-grid">
  <CornerFrame inset={18}>
    <div class="hero-inner">
      <div class="top-l">// PORTFOLIO.SYS — REV 2026.05</div>
      <div class="top-r">SECTOR 01/03</div>

      <div class="file-anchor">
        <FileIndex index="01" label="FILE INDEX" size="lg" />
      </div>

      <div class="glyphs">
        <GlyphStrip direction="v" count={7} gap={14} />
      </div>

      <div class="name-block">
        <div class="kicker">— STAFF AI ENGINEER · LILT AI</div>
        <h1 class="name">
          <span class="name-flicker h2">
            <span class="name-en">CHARLIE<br />SHI</span>
            <span class="name-zh" lang="zh">石千里</span>
          </span>
        </h1>
      </div>

      <div class="meta-anchor">
        <MetaBar
          date={meta.date}
          coords={meta.coords}
          build={meta.hash}
          cta="↗ ENTER"
          ctaHref="#about"
        />
      </div>
    </div>
  </CornerFrame>
</section>

<style>
  .hero {
    position: relative;
    height: 100vh;
    overflow: hidden;
  }
  .hero-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .top-l, .top-r {
    position: absolute;
    top: 30px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--accent-yellow);
  }
  .top-l { left: 60px; }
  .top-r { right: 60px; }

  .file-anchor {
    position: absolute;
    top: 90px;
    right: 60px;
  }
  .glyphs {
    position: absolute;
    top: 90px;
    left: 30px;
    height: 60%;
    display: flex;
    align-items: stretch;
  }
  .glyphs :global(.gs) {
    height: 100%;
    justify-content: space-between;
  }

  .name-block {
    position: absolute;
    left: 60px;
    bottom: 70px;
    max-width: 60%;
  }
  .kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 14px;
  }
  .name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    letter-spacing: 0.08em;
    font-size: clamp(48px, 9vw, 92px);
    line-height: 0.9;
    color: var(--text-primary);
    text-transform: uppercase;
    margin: 0;
  }

  .meta-anchor {
    position: absolute;
    bottom: 30px;
    left: 60px;
    right: 60px;
  }

  @media (max-width: 768px) {
    .top-l, .top-r { top: 18px; font-size: 9px; letter-spacing: 0.18em; }
    .top-l { left: 24px; }
    .top-r { right: 24px; }
    .file-anchor { top: 60px; right: 24px; }
    .glyphs { display: none; }
    .name-block { left: 24px; bottom: 60px; max-width: 80%; }
    .meta-anchor { bottom: 18px; left: 24px; right: 24px; }
  }
</style>
```

- [ ] **Step 3: Run the dev server and verify hero**

Run: `npm run dev` (or rely on the existing dev server on port 4321 if already running).
Open: `http://localhost:4321/`
Expected: hero renders with corner brackets, top labels, big yellow `01`, vertical glyph strip on left, name bottom-left, dashed meta bar at bottom. EN↔ZH flicker still cycles. No console errors.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/styles/global.css
git commit -m "feat(design): rewrite hero as H2 asymmetric manifest"
```

---

### Task 5: Rewrite Navbar

**Files:**
- Modify: `src/components/Navbar.astro` (full rewrite)

- [ ] **Step 1: Replace `src/components/Navbar.astro` contents**

```astro
---
const pathname = Astro.url.pathname;

const links = [
  { href: '/', label: 'Home' },
  { href: '/portfolio/', label: 'Portfolio' },
  { href: '/blog/', label: 'Blog' },
];

function isActive(href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
---

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="brand">
      <span class="tick" aria-hidden="true"></span>
      CHARLIE_SHI.SYS
    </a>

    <ul class="links">
      {links.map((link) => (
        <li>
          <a
            href={link.href}
            class:list={['link', isActive(link.href) && 'active']}
          >
            <span class="link-tick" aria-hidden="true"></span>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 50;
    backdrop-filter: blur(12px);
    background: rgba(10, 10, 10, 0.7);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-primary);
    text-decoration: none;
  }
  .brand .tick {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 1.5px solid var(--accent-yellow);
    border-right: none;
    border-bottom: none;
  }
  .links {
    display: flex;
    gap: 32px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .link {
    position: relative;
    display: inline-block;
    padding: 4px 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 200ms ease;
  }
  .link:hover { color: var(--text-primary); }
  .link .link-tick {
    position: absolute;
    top: 0; left: 0;
    width: 6px;
    height: 6px;
    border-top: 1.5px solid var(--accent-yellow);
    border-left: 1.5px solid var(--accent-yellow);
    opacity: 0;
    transition: opacity 200ms ease;
  }
  .link:hover .link-tick { opacity: 0.5; }
  .link.active { color: var(--accent-yellow); }
  .link.active .link-tick { opacity: 1; }
</style>
```

- [ ] **Step 2: Verify dev**

Open `http://localhost:4321/` and `http://localhost:4321/portfolio/`. Expected: brand reads `▙ CHARLIE_SHI.SYS`, active link is yellow with a corner tick, inactive links fade to text-primary on hover with a faint corner tick.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "feat(design): rewrite navbar with file-system brand and corner-tick active state"
```

---

### Task 6: Rewrite SectionDivider

**Files:**
- Modify: `src/components/SectionDivider.astro` (full rewrite)

- [ ] **Step 1: Replace `src/components/SectionDivider.astro` contents**

```astro
---
import RegMark from './RegMark.astro';
import GlyphStrip from './GlyphStrip.astro';

interface Props {
  label: string;
  index?: string;
}

const { label, index } = Astro.props;
---

<div class="div-wrap">
  <div class="div-inner">
    <span class="glyphs"><GlyphStrip direction="h" count={4} gap={12} /></span>
    <span class="lbl">// {label}</span>
    <div class="rule"></div>
    <RegMark size={14} />
    {index && <span class="idx">{index}</span>}
  </div>
</div>

<style>
  .div-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 56px 24px 16px;
  }
  .div-inner {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .lbl {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--accent-yellow);
    text-transform: uppercase;
  }
  .rule {
    flex: 1;
    height: 4px;
    background-image: repeating-linear-gradient(90deg, var(--border) 0 2px, transparent 2px 4px);
  }
  .idx {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
  }
</style>
```

- [ ] **Step 2: Verify dev**

Open `http://localhost:4321/`. The `// ABOUT` divider above the about section now shows a horizontal glyph strip, the label in yellow, the dither rule, a blue `+` reg mark, and (if `index` is passed by a caller) an `02/03` counter.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 4: Commit**

```bash
git add src/components/SectionDivider.astro
git commit -m "feat(design): rewrite section divider with glyph strip + index counter"
```

---

### Task 7: Rewrite AboutSection

**Files:**
- Modify: `src/components/AboutSection.astro` (full rewrite — copy is updated to match the new role title and Andover, MA location)

- [ ] **Step 1: Replace `src/components/AboutSection.astro` contents**

```astro
---
const stats = [
  { k: 'Role', v: 'Staff AI Engineer' },
  { k: 'Company', v: 'LILT AI' },
  { k: 'Location', v: 'Andover, MA' },
  { k: 'Focus', v: 'Agent-MCP · ML Infra · Fullstack' },
];

const links = [
  { href: 'https://github.com/qcharlieshi', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/qcharlieshi/', label: 'LinkedIn' },
  { href: 'https://medium.com/@qcharlieshi', label: 'Medium' },
  { href: 'mailto:charlie.shi@lilt.com', label: 'Email' },
];
---

<section id="about" class="about">
  <div class="about-inner">
    <div class="lhs dashed-enclosure">
      <div class="lhs-label">// PROFILE — DARK-SPACE HAULAGE LOGISTICS</div>
      <p class="lhs-body">
        Staff AI Engineer at <a href="https://lilt.com" class="inline-link">LILT AI</a>, working on Agent-MCP orchestration and ML infrastructure — language-to-language LLM systems and the agentic tooling that operates them.
      </p>
      <p class="lhs-body">
        Day-to-day spans Python and TypeScript on top of PyTorch and the Model Context Protocol, with the Kubernetes, Redis, and Spring services those models run against. Before LILT — multiplayer engines, real-time collaboration, and full-stack web.
      </p>
      <p class="lhs-body">
        Outside of LILT: personal builds, side experiments, and the occasional essay on how to keep small teams moving fast without losing the plot.
      </p>
    </div>

    <div class="rhs">
      {stats.map((s) => (
        <div class="stat">
          <div class="stat-k">{s.k}</div>
          <div class="stat-v">{s.v}</div>
        </div>
      ))}

      <div class="link-row">
        {links.map((l) => (
          <a class="callout-tag" href={l.href} target="_blank" rel="noopener">
            ↗ {l.label}
          </a>
        ))}
      </div>
    </div>
  </div>
</section>

<style>
  .about { padding: 16px 0 64px; }
  .about-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: start;
  }
  .lhs-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent-yellow);
    margin-bottom: 14px;
  }
  .lhs-body {
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    line-height: 1.65;
    color: #c8c8cc;
  }
  .lhs-body + .lhs-body { margin-top: 14px; }
  .inline-link {
    color: var(--accent-yellow);
    text-decoration: none;
    border-bottom: 1px solid var(--accent-yellow);
  }

  .rhs {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .stat {
    border-left: 2px solid var(--accent-yellow);
    padding: 8px 14px;
  }
  .stat-k {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .stat-v {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 2px;
  }

  .link-row {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .link-row .callout-tag {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-decoration: none;
    transition: border-color 200ms ease;
  }
  .link-row .callout-tag:hover {
    border-color: var(--accent-yellow);
  }

  @media (max-width: 768px) {
    .about-inner { grid-template-columns: 1fr; gap: 32px; }
  }
</style>
```

- [ ] **Step 2: Verify dev**

Open `http://localhost:4321/`. About section now shows a dashed enclosure on the left with the new copy and a stat strip column on the right. Below the stats, four bracketed `[ ↗ GITHUB ]` etc. link tiles.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutSection.astro
git commit -m "feat(design): rewrite about section with dashed enclosure + stat strips"
```

---

### Task 8: Rewrite PortfolioCard

**Files:**
- Modify: `src/components/PortfolioCard.astro` (full rewrite)
- Modify: `src/pages/portfolio/index.astro` (pass card index for `FileIndex` numbering)

- [ ] **Step 1: Replace `src/components/PortfolioCard.astro` contents**

```astro
---
import type { CollectionEntry } from 'astro:content';
import FileIndex from './FileIndex.astro';

interface Props {
  project: CollectionEntry<'portfolio'>;
  index: number;
}

const { project, index } = Astro.props;
const { slug, data } = project;
const paddedIndex = String(index).padStart(3, '0');
---

<a
  href={`/portfolio/${slug}/`}
  class:list={['card glyph-grid', data.featured && 'feat']}
>
  {data.featured && <span class="callout-tag tag">FEATURED</span>}

  <div class="card-top">
    <FileIndex index={paddedIndex} size="md" />
    <div class="card-kicker">— {data.tags[0]?.toUpperCase() ?? 'PROJECT'}</div>
    <h3 class="card-title">{data.title}</h3>
  </div>

  <p class="card-desc">{data.description}</p>

  <div class="card-meta">
    <span>{data.date}</span>
    {data.tags.slice(0, 3).map((tag) => <span>{tag.toUpperCase()}</span>)}
    <span class="cta">↗ READ</span>
  </div>

  <span class="corner corner-tl" aria-hidden="true"></span>
  <span class="corner corner-br" aria-hidden="true"></span>
</a>

<style>
  .card {
    position: relative;
    display: block;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    padding: 22px;
    min-height: 220px;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: border-color 200ms ease;
  }
  .card:hover { border-color: var(--accent-yellow); }
  .card.feat { grid-column: span 2; }

  .tag {
    position: absolute;
    top: 14px;
    right: 14px;
  }

  .card-kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 8px;
  }
  .card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 22px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-primary);
    margin: 14px 0 0;
  }
  .card-desc {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 14px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-meta {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 14px;
  }
  .card-meta .cta {
    margin-left: auto;
    color: var(--accent-yellow);
  }

  .corner {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1.5px solid var(--accent-yellow);
    opacity: 0.4;
    transition: opacity 200ms ease;
  }
  .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
  .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; }
  .card:hover .corner { opacity: 1; }
</style>
```

- [ ] **Step 2: Update `src/pages/portfolio/index.astro` card loop**

Replace the existing `{projects.map(...)}` block (inside the grid `<div>`) with:

```astro
{projects.map((project, i) => (
  <PortfolioCard project={project} index={i + 1} />
))}
```

Keep all other markup in the file unchanged.

- [ ] **Step 3: Verify dev**

Open `http://localhost:4321/portfolio/`. Cards show numbered file indices (`001`, `002`, …), a tag kicker line, uppercase display title, mono meta line ending with `↗ READ`, faint corner ticks at top-left and bottom-right. Featured cards have `[ FEATURED ]` tag in top-right and span 2 columns. Hover brightens the corner ticks and yellows the border.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 5: Commit**

```bash
git add src/components/PortfolioCard.astro src/pages/portfolio/index.astro
git commit -m "feat(design): rewrite portfolio card with file index + corner ticks"
```

---

### Task 9: Rewrite BlogCard

**Files:**
- Modify: `src/components/BlogCard.astro` (full rewrite)
- Modify: `src/pages/blog/index.astro` (pass card index)

- [ ] **Step 1: Replace `src/components/BlogCard.astro` contents**

```astro
---
import type { MediumPost } from '../types/index';
import FileIndex from './FileIndex.astro';

interface Props {
  post: MediumPost;
  index: number;
}

const { post, index } = Astro.props;
const paddedIndex = `B${String(index).padStart(3, '0')}`;

const d = new Date(post.pubDate);
const yy = String(d.getFullYear()).slice(-2);
const mm = String(d.getMonth() + 1).padStart(2, '0');
const dd = String(d.getDate()).padStart(2, '0');
const dateLabel = `${yy}.${mm}.${dd}`;
---

<a href={`/blog/${post.slug}/`} class="card glyph-grid">
  <div class="card-top">
    <FileIndex index={paddedIndex} size="md" />
    <div class="card-kicker">— {post.categories[0]?.toUpperCase() ?? 'TRANSMISSION'}</div>
    <h3 class="card-title">{post.title}</h3>
  </div>

  {post.thumbnail && (
    <img
      src={post.thumbnail}
      alt={post.title}
      class="card-thumb"
      loading="lazy"
    />
  )}

  <p class="card-desc">{post.description}</p>

  <div class="card-meta">
    <span>{dateLabel}</span>
    {post.categories.slice(0, 3).map((c) => <span>{c.toUpperCase()}</span>)}
    <span class="cta">↗ READ</span>
  </div>

  <span class="corner corner-tl" aria-hidden="true"></span>
  <span class="corner corner-br" aria-hidden="true"></span>
</a>

<style>
  .card {
    position: relative;
    display: block;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    padding: 22px;
    min-height: 220px;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: border-color 200ms ease;
  }
  .card:hover { border-color: var(--accent-yellow); }

  .card-kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 8px;
  }
  .card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-primary);
    margin: 14px 0 0;
  }
  .card-thumb {
    width: 100%;
    height: 140px;
    object-fit: cover;
    margin: 14px 0;
    filter: grayscale(1) brightness(0.85);
    transition: filter 300ms ease;
  }
  .card:hover .card-thumb { filter: grayscale(0.6) brightness(0.95); }
  .card-desc {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-meta {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-top: 14px;
  }
  .card-meta .cta { margin-left: auto; color: var(--accent-yellow); }

  .corner {
    position: absolute;
    width: 10px;
    height: 10px;
    border: 1.5px solid var(--accent-yellow);
    opacity: 0.4;
    transition: opacity 200ms ease;
  }
  .corner-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
  .corner-br { bottom: 0; right: 0; border-left: none; border-top: none; }
  .card:hover .corner { opacity: 1; }
</style>
```

- [ ] **Step 2: Update `src/pages/blog/index.astro` card loop**

Replace the existing `{posts.map(...)}` block (inside the grid `<div>`) with:

```astro
{posts.map((post, i) => (
  <BlogCard post={post} index={i + 1} />
))}
```

Keep the empty-state branch and all other markup unchanged.

- [ ] **Step 3: Verify dev**

Open `http://localhost:4321/blog/`. Each card shows `B001`, `B002`, … as the FileIndex, monochrome-tinted thumbnail, mono meta line with `YY.MM.DD` date and `↗ READ` CTA.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: completes successfully. (The Medium RSS fetch happens at build time — be tolerant of network during build; if it fails, the listing falls back to empty per existing behavior.)

- [ ] **Step 5: Commit**

```bash
git add src/components/BlogCard.astro src/pages/blog/index.astro
git commit -m "feat(design): rewrite blog card with B-prefixed file index"
```

---

### Task 10: Add global page-foot MetaBar + scan-line-soft to Base

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Replace the body markup section of `src/layouts/Base.astro`**

Replace the `<body>` block (currently lines 32–44) with:

```astro
  <body class="bg-bg-primary text-text-primary scan-line-soft">
    <svg class="hidden" aria-hidden="true">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
    </svg>
    <div class="noise-overlay" style="filter: url(#noise);"></div>
    <Navbar />
    <slot />
    <footer class="page-foot">
      <div class="page-foot-inner">
        <MetaBar
          date={meta.date}
          coords={meta.coords}
          build={meta.hash}
          cta="↗ TOP"
          ctaHref="#top"
        />
      </div>
    </footer>
  </body>
```

- [ ] **Step 2: Add the imports and `meta` constant to the Base frontmatter**

In the frontmatter at the top of `src/layouts/Base.astro`, add (above the existing `interface Props`):

```astro
import Navbar from '../components/Navbar.astro';
import MetaBar from '../components/MetaBar.astro';
import { getBuildMeta } from '../lib/buildMeta';

const meta = getBuildMeta();
```

(If `Navbar` import is already present, keep it; add only the missing two.)

- [ ] **Step 3: Add a global `#top` anchor**

Inside the `<body>` and immediately before `<Navbar />`, add:

```astro
<a id="top" tabindex="-1" aria-hidden="true" style="position:absolute;top:0;left:0;"></a>
```

- [ ] **Step 4: Add page-foot styles to the `<style is:global>` block at the bottom of `Base.astro`**

Below the existing `@import '../styles/global.css';` line, append (inside the same `<style is:global>` block):

```css
.page-foot {
  border-top: 1px solid var(--border);
  margin-top: 64px;
}
.page-foot-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 32px;
}
```

- [ ] **Step 5: Verify dev**

Open `http://localhost:4321/` and scroll to the bottom. A dashed metadata strip with `↳ YY.MM.DD`, coords, `BUILD 0x####`, `↗ TOP` should be visible. Click `↗ TOP` and confirm it scrolls to the top.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: completes successfully.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(design): add global scan-line-soft and page-foot meta bar"
```

---

### Task 11: Portfolio detail page chrome

**Files:**
- Modify: `src/pages/portfolio/[slug].astro`

- [ ] **Step 1: Replace `src/pages/portfolio/[slug].astro` contents**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Base from '../../layouts/Base.astro';
import CornerFrame from '../../components/CornerFrame.astro';
import FileIndex from '../../components/FileIndex.astro';
import MetaBar from '../../components/MetaBar.astro';
import { getBuildMeta } from '../../lib/buildMeta';

export async function getStaticPaths() {
  const projects = await getCollection('portfolio');
  return projects.map((project, i) => ({
    params: { slug: project.slug },
    props: { project, index: i + 1 },
  }));
}

interface Props {
  project: CollectionEntry<'portfolio'>;
  index: number;
}

const { project, index } = Astro.props;
const { data, body } = project;
const { Content } = await project.render();
const hasBody = body.trim().length > 0;
const paddedIndex = String(index).padStart(3, '0');
const meta = getBuildMeta();
---

<Base title={`${data.title} — Charlie Shi`}>
  <article class="detail">
    <CornerFrame inset={18}>
      <div class="detail-inner">
        <div class="top-l">// PORTFOLIO / {data.title.toUpperCase()}</div>
        <div class="top-r"><FileIndex index={paddedIndex} label="PORTFOLIO" size="md" /></div>

        <div class="body-wrap">
          <a href="/portfolio/" class="back">← BACK TO PORTFOLIO</a>

          <h1 class="title">{data.title}</h1>

          <div class="meta-line">
            <span>{data.date}</span>
            {data.tags.map((t) => <span class="tag">{t.toUpperCase()}</span>)}
          </div>

          <div class="dashed-enclosure body">
            <p class="lede">{data.description}</p>
            {hasBody && (
              <div class="prose prose-invert max-w-none mt-6">
                <Content />
              </div>
            )}
          </div>

          <div class="ext-links">
            {data.githubUrl && (
              <a href={data.githubUrl} class="callout-tag" target="_blank" rel="noopener">↗ GITHUB</a>
            )}
            {data.liveUrl && (
              <a href={data.liveUrl} class="callout-tag" target="_blank" rel="noopener">↗ LIVE</a>
            )}
          </div>

          <div class="page-meta">
            <MetaBar
              date={meta.date}
              coords={meta.coords}
              build={meta.hash}
              cta="↗ BACK"
              ctaHref="/portfolio/"
            />
          </div>
        </div>
      </div>
    </CornerFrame>
  </article>
</Base>

<style>
  .detail { padding-top: 96px; padding-bottom: 64px; }
  .detail-inner { padding: 32px 48px 48px; }
  .top-l {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--accent-yellow);
  }
  .top-r {
    position: absolute;
    top: 32px;
    right: 48px;
  }
  .body-wrap {
    max-width: 800px;
    margin: 56px auto 0;
  }
  .back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent-yellow);
    text-decoration: none;
  }
  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: clamp(28px, 4vw, 44px);
    margin: 32px 0 16px;
  }
  .meta-line {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .meta-line .tag { color: var(--accent-yellow); }
  .body { margin-top: 24px; }
  .body .lede {
    font-size: 17px;
    line-height: 1.7;
    color: var(--text-primary);
  }
  .ext-links {
    display: flex;
    gap: 10px;
    margin-top: 32px;
  }
  .ext-links .callout-tag {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-decoration: none;
  }
  .page-meta { margin-top: 48px; }
</style>
```

- [ ] **Step 2: Verify dev**

Open `http://localhost:4321/portfolio/<any-existing-slug>/`. Page renders with corner-framed container, `// PORTFOLIO / TITLE` top label, FileIndex top-right, back link, dashed-enclosed prose, bracketed external links, and a meta bar with `↗ BACK`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: completes successfully; all portfolio detail routes regenerate.

- [ ] **Step 4: Commit**

```bash
git add src/pages/portfolio/[slug].astro
git commit -m "feat(design): apply antireal chrome to portfolio detail pages"
```

---

### Task 12: Blog detail page chrome + prose color overrides

**Files:**
- Modify: `src/pages/blog/[slug].astro`
- Modify: `tailwind.config.mjs` (update `typography.invert.css` color overrides)

- [ ] **Step 1: Update typography prose overrides in `tailwind.config.mjs`**

Replace the `typography.invert.css` object inside `theme.extend` with:

```js
typography: {
  invert: {
    css: {
      '--tw-prose-links': '#ffd23f',
      '--tw-prose-code': '#e8e8e8',
      '--tw-prose-pre-bg': '#141416',
      '--tw-prose-pre-code': '#e8e8e8',
      '--tw-prose-quotes': '#e8e8e8',
      '--tw-prose-quote-borders': '#ffd23f',
    },
  },
},
```

- [ ] **Step 2: Replace `src/pages/blog/[slug].astro` contents**

```astro
---
import Base from '../../layouts/Base.astro';
import CornerFrame from '../../components/CornerFrame.astro';
import FileIndex from '../../components/FileIndex.astro';
import MetaBar from '../../components/MetaBar.astro';
import { getMediumPosts } from '../../lib/medium';
import { getBuildMeta } from '../../lib/buildMeta';

export async function getStaticPaths() {
  const posts = await getMediumPosts();
  return posts.map((post, i) => ({
    params: { slug: post.slug },
    props: { post, index: i + 1 },
  }));
}

const { post, index } = Astro.props;
const paddedIndex = `B${String(index).padStart(3, '0')}`;
const meta = getBuildMeta();

const d = new Date(post.pubDate);
const yy = String(d.getFullYear()).slice(-2);
const mm = String(d.getMonth() + 1).padStart(2, '0');
const dd = String(d.getDate()).padStart(2, '0');
const dateLabel = `${yy}.${mm}.${dd}`;
---

<Base title={`${post.title} — Charlie Shi`} description={post.description} ogImage={post.thumbnail}>
  <article class="detail">
    <CornerFrame inset={18}>
      <div class="detail-inner">
        <div class="top-l">// BLOG / {post.title.toUpperCase()}</div>
        <div class="top-r"><FileIndex index={paddedIndex} label="TRANSMISSION" size="md" /></div>

        <div class="body-wrap">
          <a href="/blog/" class="back">← BACK TO BLOG</a>

          <h1 class="title">{post.title}</h1>

          <div class="meta-line">
            <span>{dateLabel}</span>
            {post.categories.map((c) => <span class="tag">{c.toUpperCase()}</span>)}
          </div>

          <a class="callout-tag medium-link" href={post.link} target="_blank" rel="noopener">
            ↗ READ ON MEDIUM
          </a>

          <div class="dashed-enclosure body">
            <div class="prose prose-invert prose-lg max-w-none" set:html={post.content} />
          </div>

          <div class="page-meta">
            <MetaBar
              date={meta.date}
              coords={meta.coords}
              build={meta.hash}
              cta="↗ BACK"
              ctaHref="/blog/"
            />
          </div>
        </div>
      </div>
    </CornerFrame>
  </article>
</Base>

<style>
  .detail { padding-top: 96px; padding-bottom: 64px; }
  .detail-inner { padding: 32px 48px 48px; position: relative; }
  .top-l {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--accent-yellow);
  }
  .top-r {
    position: absolute;
    top: 32px;
    right: 48px;
  }
  .body-wrap {
    max-width: 800px;
    margin: 56px auto 0;
  }
  .back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent-yellow);
    text-decoration: none;
  }
  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: clamp(28px, 4vw, 44px);
    margin: 32px 0 16px;
  }
  .meta-line {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .meta-line .tag { color: var(--accent-yellow); }
  .medium-link {
    display: inline-block;
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-decoration: none;
    margin-bottom: 24px;
  }
  .body { margin-top: 8px; }
  .page-meta { margin-top: 48px; }
</style>
```

- [ ] **Step 3: Verify dev**

Open `http://localhost:4321/blog/<any-existing-slug>/`. Page renders with corner-framed container, `// BLOG / TITLE` label, B### index, back link, `[ ↗ READ ON MEDIUM ]` callout, dashed-enclosed prose with yellow prose links, meta bar with `↗ BACK`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: completes successfully; blog detail routes regenerate.

- [ ] **Step 5: Commit**

```bash
git add src/pages/blog/[slug].astro tailwind.config.mjs
git commit -m "feat(design): apply antireal chrome to blog detail pages + prose color overrides"
```

---

### Task 13: Sweep — remove deprecated CSS and tokens

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Pre-sweep grep — find any remaining consumers**

Run:

```bash
rg "dot-grid|glitch-hover|glow-pulse|accent-cyan|accent-magenta|reg-mark\\b" src/
```

Expected: zero hits. If any hit shows up, fix that file before proceeding — it's a missed migration.

- [ ] **Step 2: Remove deprecated rules from `src/styles/global.css`**

Delete the following blocks from `global.css`:

- `.scan-lines::after` (lines around 45–58)
- `.dot-grid` (lines around 60–63)
- `.reg-mark::before` (lines around 65–71)
- `@keyframes glitch` (lines around 84–105)
- `.glitch-hover` and `.glitch-hover:hover` (lines around 107–113)
- `@keyframes glow-pulse` (lines around 115–118)
- `.glow-pulse` (lines around 120–122)

Keep: `.noise-overlay`, `.dither-divider`, `.section-label`, `.name-flicker` + its keyframes + reduced-motion media query, and all the new antireal utilities added in Task 2 / Task 4.

- [ ] **Step 3: Remove `accent-cyan` and `accent-magenta` from `tailwind.config.mjs`**

In the `colors` object inside `theme.extend`, delete the two lines:

```js
'accent-cyan': '#00f0ff',
'accent-magenta': '#ff2d6b',
```

The resulting `colors` object should match Section 3.1 of the spec.

- [ ] **Step 4: Re-grep to verify**

Run:

```bash
rg "dot-grid|glitch-hover|glow-pulse|accent-cyan|accent-magenta|reg-mark\\b|scan-lines" src/ docs/superpowers/specs/ 2>/dev/null | grep -v "specs/"
```

Expected: zero hits in `src/`. (Hits inside the spec file are fine — that's documentation.)

- [ ] **Step 5: Verify build + dev**

Run: `npm run build` — expected: completes successfully.
Open `http://localhost:4321/` and click through home, portfolio listing, a portfolio detail, blog listing, a blog detail. Expected: every page renders without missing styles. No magenta or cyan anywhere.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css tailwind.config.mjs
git commit -m "chore(design): remove deprecated CSS and unused tokens"
```

---

### Task 14: Update CLAUDE.md design language section

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the "Design language" paragraph + the "Utility classes in `src/styles/global.css`" list**

In `CLAUDE.md`, find the line starting with `**Design language:**` (in the Project Overview section) and replace it with:

```md
**Design language:** "Antireal" — direct lineage from the artist who inspired Bungie's Marathon. Dark mode only, monospace metadata, blocky geometric typography. Yellow (`#ffd23f`) is the only primary accent; electric blue (`#1860ff`) is reserved for registration marks and hairline rules. Motifs: yellow corner brackets, dashed metadata rails, big yellow file-index numbers, vertical glyph strips (`× ○ ⊞ + ✕`), dashed enclosures, bracketed callout tags. All effects CSS-only — zero JavaScript shipped to the browser.
```

- [ ] **Step 2: Replace the utility class list**

Find the `- Utility classes in `src/styles/global.css`:` bullet list and replace its sub-bullets with:

```md
- `.noise-overlay` — fixed SVG `feTurbulence` grain over entire page
- `.scan-line-soft` — softened horizontal scan-line pattern (3px stride, 1.2% opacity)
- `.glyph-grid` — two-layer radial-gradient registration grid (white dots @ 18px, yellow dots @ 54px)
- `.dashed-enclosure` — 1px dashed border + padding, used for prose blocks
- `.callout-tag` — `[ LABEL ]` bracketed inline tag (yellow mono)
- `.dither-divider` — repeating-linear-gradient horizontal divider
- `.section-label` — monospace `// LABEL` style in yellow
- `.hairline-yellow`, `.hairline-blue` — 1px decorative rules in accent colors
```

- [ ] **Step 3: Replace the color tokens line**

Find the existing `- Colors:` bullet and replace with:

```md
- Colors: `bg-primary` `#0a0a0a`, `bg-surface` `#141416`, `bg-elevated` `#1c1c1f`, `text-primary` `#e8e8e8`, `text-secondary` `#8a8a90`, `accent-yellow` `#ffd23f` (primary accent), `accent-blue` `#1860ff` (reg marks + hairlines), `border-default` `#2a2a2e`
```

- [ ] **Step 4: Update Key Patterns section**

Find the `**Featured items:**` bullet under "Key Patterns" and replace with:

```md
- **Featured items:** `featured: true` in a portfolio entry's frontmatter adds `md:col-span-2` in the grid and renders a `[ FEATURED ]` callout-tag in the card's top-right corner
```

- [ ] **Step 5: Add motif component note**

Below the "Project Structure" tree, append a short paragraph:

```md
**Motif components:** `CornerFrame`, `MetaBar`, `FileIndex`, `RegMark`, `GlyphStrip` in `src/components/`. These are the reusable antireal primitives; prefer them over ad-hoc absolute-positioned divs when adding new layouts.
```

- [ ] **Step 6: Verify the file still reads cleanly**

Run: `cat CLAUDE.md | head -60`

Spot-check that bullet structure is preserved and there are no orphaned references to removed tokens (`accent-cyan`, `accent-magenta`, `dot-grid`, `glitch-hover`, `glow-pulse`).

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md design language for antireal redesign"
```

---

### Task 15: Visual verification

**Files:** none — verification only.

- [ ] **Step 1: Restart dev server (clean state)**

If the dev server is running, stop it. Then:

```bash
npm run dev
```

- [ ] **Step 2: Compare each page against the mockups in the spec**

Open in a browser at 1280×900 (or use chrome-devtools MCP):

| Route | Expectation |
|---|---|
| `/` | Hero matches `homepage-preview.png` mockup ±10% — corner brackets, `// PORTFOLIO.SYS` label, `SECTOR 01/03`, big yellow `01`, glyph strip, name bottom-left with EN↔ZH flicker, dashed meta bar |
| `/` | Below hero: `// ABOUT` divider, dashed-enclosed about copy with stat strips + bracketed link row, `// PORTFOLIO` divider, card grid with file indices + corner ticks, page-foot meta bar |
| `/portfolio/` | Listing of portfolio cards with `001` `002` … indices, `[ FEATURED ]` tags where applicable |
| `/portfolio/<any-slug>/` | Detail page with corner-framed container, `// PORTFOLIO / TITLE`, FileIndex top-right, dashed-enclosed body, ext-link callouts, back meta bar |
| `/blog/` | Cards with `B001` `B002` … indices, monochrome-tinted thumbnails |
| `/blog/<any-slug>/` | Detail page with corner-framed container, `// BLOG / TITLE`, `[ ↗ READ ON MEDIUM ]` callout, dashed-enclosed prose with yellow links |
| Every page | Page-foot dashed meta bar with `↗ TOP` |

- [ ] **Step 3: Check for regressions**

- Open DevTools console on each page → no errors.
- Confirm no magenta or cyan pixels anywhere.
- Confirm EN↔ZH flicker still cycles on the hero.
- Confirm nav active state shows yellow + corner tick on the current page.

- [ ] **Step 4: Final build sanity**

```bash
npm run build
```

Expected: clean exit, no warnings.

- [ ] **Step 5: Commit (only if any docs/touch-ups land during verification)**

If verification surfaced no fixes, skip this commit. Otherwise, group fixes into a single follow-up commit:

```bash
git commit -m "fix(design): post-verification touch-ups"
```

---

## Verification Summary

After all 15 tasks, the redesign is complete when:

1. `npm run build` succeeds.
2. `rg "dot-grid|glitch-hover|glow-pulse|accent-cyan|accent-magenta|reg-mark\\b|scan-lines" src/` returns zero hits.
3. All seven routes listed in Task 15 Step 2 render as described.
4. CLAUDE.md describes the antireal language; no orphaned references to old utilities.
5. Spec acceptance criteria (`§7` of `2026-05-25-antireal-redesign-design.md`) all met.
