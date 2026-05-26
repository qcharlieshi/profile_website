# Antireal Iteration — Terminal Header + Hero Panes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sticky navbar with a mock terminal header, fold About + Resume into the hero as swappable panes (with real `/` and `/resume/` routes), add a Marathon-style red-checkerboard pane/page transition, restructure the hero with a right rail (sector number + 4-label list), make the EN↔ZH name flicker glitchy, and surface real git commit data in the hero chrome.

**Architecture:** Astro static site, zero-framework. Adds one small inline JS island (~120 LOC TypeScript via `src/scripts/site.ts`) that handles terminal input parsing, in-app pane swap via `history.pushState`, and the transition trigger. About/Resume are real routes (`/`, `/resume/`) rendering the same `Hero.astro` with a different `initialPane` prop, so direct visits and crawler hits produce proper static HTML. Portfolio/Blog stay as separate routes; rail clicks there are real page nav wrapped in the same transition.

**Tech Stack:** Astro 5, Tailwind CSS, TypeScript, vanilla JS (no React/Preact). `child_process.execSync` at build time for git metadata. CSS keyframes for all visual effects.

**Spec:** [`docs/superpowers/specs/2026-05-25-antireal-terminal-iteration-design.md`](../specs/2026-05-25-antireal-terminal-iteration-design.md)

**Verification model:** This repo has no unit-test infrastructure. Each task verifies via `npm run build` (must succeed clean), targeted `rg` greps (must return zero hits for deleted symbols), and visual checks against `npm run dev`. Visual checks describe what to look for so the engineer knows when the task is "done."

---

### Task 1: Replace synthetic build meta with real git data

**Files:**
- Modify: `src/lib/buildMeta.ts` (full rewrite)

- [ ] **Step 1: Rewrite `buildMeta.ts` to read git data**

Replace the file contents entirely:

```ts
import { execSync } from 'node:child_process';

export interface BuildMeta {
  shortHash: string;
  fullHash: string;
  subject: string;
  commitDate: string;
  branch: string;
  buildDate: string;
}

function safe(cmd: string, fallback: string): string {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return fallback; }
}

const buildDate = (() => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
})();

const SNAPSHOT: BuildMeta = Object.freeze({
  shortHash:  safe('git rev-parse --short HEAD', 'nogit'),
  fullHash:   safe('git rev-parse HEAD', ''),
  subject:    safe('git log -1 --pretty=%s', ''),
  commitDate: safe('git log -1 --pretty=%as', buildDate.replace(/\./g, '-')),
  branch:     safe('git rev-parse --abbrev-ref HEAD', ''),
  buildDate,
});

export function getBuildMeta(): BuildMeta {
  return SNAPSHOT;
}
```

- [ ] **Step 2: Build and verify shape**

Run: `npm run build`

Expected: build succeeds, no warnings. The new shape (`shortHash`, `subject`, etc.) breaks the existing `MetaBar` callers — that's expected for now, they get fixed in later tasks. If build fails for *any other reason* (e.g. TypeScript error inside `buildMeta.ts` itself), fix it. If it fails because `MetaBar` callers reference the old `hash` / `coords` keys, leave it — Task 11 + Task 8 fix those.

Actually we can't leave the build broken; later tasks will touch `MetaBar` callers but this task must end with a building project. Workaround: keep a **transitional alias** so existing callers still resolve.

Add at the bottom of `src/lib/buildMeta.ts`:

```ts
// Deprecated alias — remove in Task 11 once all MetaBar callers are updated.
export function getLegacyBuildMeta() {
  return {
    date: SNAPSHOT.buildDate,
    hash: SNAPSHOT.shortHash,
    coords: 'N 42°39′ W 71°08′',
  };
}
```

Then in `src/layouts/Base.astro` and `src/components/Hero.astro` (the only two existing callers of `getBuildMeta` that depend on the old shape), do nothing yet — Task 11 and Task 8 rewrite them. To keep the build green *right now*, also update the in-file imports.

Search for current usages and confirm:
```bash
rg "getBuildMeta\(\)" src/
```

Expected output should show 2 hits in `src/layouts/Base.astro` and `src/components/Hero.astro`. For each, replace `import { getBuildMeta }` with `import { getLegacyBuildMeta as getBuildMeta }` temporarily so the build still passes.

In `src/layouts/Base.astro` line ~4, change:
```ts
import { getBuildMeta } from '../lib/buildMeta';
```
to:
```ts
import { getLegacyBuildMeta as getBuildMeta } from '../lib/buildMeta';
```

In `src/components/Hero.astro` line ~6, the same change.

- [ ] **Step 3: Verify build passes**

Run: `npm run build`

Expected: PASS, `dist/` populated, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/buildMeta.ts src/layouts/Base.astro src/components/Hero.astro
git commit -m "feat(buildMeta): read real git data; keep legacy alias for transition

Reads short/full hash, subject, commit date, branch via execSync.
Falls back gracefully if git not present. Legacy alias kept so
existing MetaBar callers still resolve; removed in later task."
```

---

### Task 2: Add new CSS keyframes (glitch flicker, marathon ramp, sector overtake) + remove old smooth flicker

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Remove the old smooth flicker animations**

Open `src/styles/global.css`. Delete lines 131–202 inclusive (everything from `.name-flicker {` through the closing brace of `.name-flicker.h2 > .name-en { display: inline-block; }`). This removes:
- `.name-flicker` and its child rules
- The three old keyframes: `name-flicker-en`, `name-flicker-zh`, `name-jitter`
- The H2-variant override
- The old `prefers-reduced-motion` block (we'll add a new comprehensive one at the end)

Verify the file is well-formed:
```bash
node -e "require('fs').readFileSync('src/styles/global.css','utf-8').length" && echo OK
```

- [ ] **Step 2: Append the new keyframes and helper classes at the bottom of `global.css`**

Append the following block after the last existing rule:

```css
/* ============ GLITCHY NAME FLICKER (v2) ============ */

.name-glitch {
  position: relative;
  display: inline-block;
}

.name-glitch > .name-en,
.name-glitch > .name-zh {
  display: block;
  color: #e8e8e8;
}

.name-glitch > .name-zh {
  position: absolute;
  top: 0;
  left: 0;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif;
  opacity: 0;
}

.name-glitch > .name-en { animation: glitch-en 7s steps(1, end) infinite; }
.name-glitch > .name-zh { animation: glitch-zh 7s steps(1, end) infinite; }

@keyframes glitch-en {
  0%, 44%   { opacity: 1; clip-path: inset(0); transform: translate(0,0); text-shadow: none; }
  44.5%     { opacity: 1; clip-path: inset(45% 0 30% 0); transform: translate(-2px, 0); text-shadow: 2px 0 var(--accent-yellow), -2px 0 var(--accent-blue); }
  45%       { opacity: 0.6; clip-path: inset(10% 0 65% 0); transform: translate(3px, -1px); text-shadow: -3px 0 var(--accent-yellow), 2px 0 var(--accent-blue); }
  45.5%     { opacity: 0.4; clip-path: inset(70% 0 5% 0); transform: translate(-2px, 1px); text-shadow: 2px 0 var(--accent-yellow), -2px 0 var(--accent-blue); }
  46%       { opacity: 0.2; clip-path: inset(25% 0 50% 0); transform: translate(1px, 0); }
  46.5%, 93%{ opacity: 0; }
  93.5%     { opacity: 0.2; clip-path: inset(60% 0 20% 0); transform: translate(-1px, 0); text-shadow: 2px 0 var(--accent-yellow), -2px 0 var(--accent-blue); }
  94%       { opacity: 0.5; clip-path: inset(20% 0 30% 0); transform: translate(2px, -1px); }
  94.5%     { opacity: 0.8; clip-path: inset(0); transform: translate(0,0); text-shadow: 2px 0 var(--accent-yellow), -2px 0 var(--accent-blue); }
  95%, 100% { opacity: 1; clip-path: inset(0); transform: translate(0,0); text-shadow: none; }
}

@keyframes glitch-zh {
  0%, 44%   { opacity: 0; }
  44.5%     { opacity: 0.2; clip-path: inset(55% 0 25% 0); transform: translate(2px, 0); text-shadow: -2px 0 var(--accent-yellow), 2px 0 var(--accent-blue); }
  45%       { opacity: 0.5; clip-path: inset(15% 0 60% 0); transform: translate(-3px, 1px); }
  45.5%     { opacity: 0.8; clip-path: inset(0); transform: translate(2px, 0); text-shadow: -2px 0 var(--accent-yellow), 2px 0 var(--accent-blue); }
  46%, 93%  { opacity: 1; clip-path: inset(0); transform: translate(0,0); }
  93.5%     { opacity: 0.6; clip-path: inset(40% 0 35% 0); transform: translate(-2px, 0); text-shadow: -2px 0 var(--accent-yellow), 2px 0 var(--accent-blue); }
  94%       { opacity: 0.3; clip-path: inset(70% 0 10% 0); transform: translate(3px, -1px); }
  94.5%     { opacity: 0.1; }
  95%, 100% { opacity: 0; }
}

/* ============ MARATHON CHECKERBOARD TRANSITION ============ */

.pane-transition {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 40;
  overflow: hidden;
}

.pane-transition.global {
  position: fixed;
  z-index: 9990;
}

.pane-transition .checker {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, #ff3a2f 1.4px, transparent 1.6px),
    radial-gradient(circle, #ff3a2f 1.4px, transparent 1.6px);
  background-size: 8px 8px, 24px 24px;
  background-position: 0 0, 4px 4px;
  mix-blend-mode: screen;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

.pane-transition .checker.layer-2 {
  background-position: 2px 2px, 8px 8px;
  mask-image: radial-gradient(ellipse at 30% 70%, black 20%, transparent 60%);
  animation-delay: 80ms !important;
}

.pane-transition .checker.layer-3 {
  background-position: 6px 6px, 14px 14px;
  mask-image: radial-gradient(ellipse at 70% 30%, black 25%, transparent 65%);
  animation-delay: 160ms !important;
}

body.transitioning .pane-transition,
.pane-transition.firing { opacity: 1; }

body.transitioning .pane-transition .checker,
.pane-transition.firing .checker {
  animation: marathon-ramp 600ms ease-in-out 1;
}

@keyframes marathon-ramp {
  0%   { opacity: 0; transform: scale(1.02); }
  40%  { opacity: 0.85; transform: scale(1.0); }
  60%  { opacity: 0.85; transform: scale(0.98); }
  100% { opacity: 0; transform: scale(1); }
}

/* ============ SECTOR DISPLAY ============ */

.sector-display {
  text-align: right;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 10px;
}

.sector-display .sector-lbl {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.sector-display .sector-num {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 800;
  font-size: 96px;
  line-height: 0.85;
  letter-spacing: -0.02em;
  color: var(--accent-yellow);
  font-variant-numeric: tabular-nums;
  display: inline-block;
}

.sector-display .sector-denom {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 0.18em;
  margin-left: 4px;
}

/* ============ REDUCED MOTION ============ */

@media (prefers-reduced-motion: reduce) {
  .name-glitch > .name-en,
  .name-glitch > .name-zh {
    animation: none !important;
  }
  .name-glitch > .name-en { opacity: 1; }
  .name-glitch > .name-zh { opacity: 0; }

  .pane-transition,
  .pane-transition .checker {
    animation: none !important;
    opacity: 0 !important;
  }
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`

Expected: PASS. Some old `.name-flicker` references in `Hero.astro` may still exist — they'll just render as plain spans (no styling) for now. Hero gets rewritten in Task 8.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(css): add glitch flicker, marathon checkerboard, sector display utilities

Removes the old smooth name-flicker animations and adds:
- .name-glitch keyframes (chromatic split, clip bands, micro-jitter)
- .pane-transition (red checkerboard, 3-layer staggered ramp)
- .sector-display (big yellow number + denom on dashed-bottom rail header)
- comprehensive prefers-reduced-motion overrides"
```

---

### Task 3: Create `PaneTransition.astro` overlay component

**Files:**
- Create: `src/components/PaneTransition.astro`

- [ ] **Step 1: Create the component**

```astro
---
interface Props {
  global?: boolean; // if true, position: fixed (full viewport) — used in Base.astro
}
const { global = false } = Astro.props;
---

<div
  class:list={['pane-transition', global && 'global']}
  data-pane-transition
  aria-hidden="true"
>
  <div class="checker layer-1"></div>
  <div class="checker layer-2"></div>
  <div class="checker layer-3"></div>
</div>
```

That's the entire file. All styles live in `global.css` (Task 2).

- [ ] **Step 2: Build to confirm component compiles**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/PaneTransition.astro
git commit -m "feat(components): add PaneTransition overlay

Three stacked checker layers; CSS keyframes do the work.
Default position: absolute (pane-scoped); global prop makes it fixed."
```

---

### Task 4: Create `TerminalHeader.astro` (visual shell + structural input field)

**Files:**
- Create: `src/components/TerminalHeader.astro`

- [ ] **Step 1: Create the component**

```astro
---
import { getBuildMeta } from '../lib/buildMeta';

const meta = getBuildMeta();
const pathname = Astro.url.pathname;

// Derive sector number from current path
function sectorFor(p: string): { num: string; total: string } {
  if (p === '/' || p.startsWith('/about')) return { num: '01', total: '04' };
  if (p.startsWith('/resume')) return { num: '02', total: '04' };
  if (p.startsWith('/portfolio')) return { num: '03', total: '04' };
  if (p.startsWith('/blog')) return { num: '04', total: '04' };
  return { num: '--', total: '04' };
}

const sector = sectorFor(pathname);
const promptPath = pathname === '/' ? '~/about' : `~${pathname.replace(/\/$/, '')}`;
---

<header class="term-header" data-terminal>
  <div class="row prompt-row">
    <span class="reg" aria-hidden="true">+</span>
    <span class="dim">charlie_shi.sys</span>
    <span class="dim">:</span>
    <span class="path-label" data-term-path>{promptPath}</span>
    <span class="dim">$</span>
    <input
      class="prompt-input"
      type="text"
      autocomplete="off"
      spellcheck="false"
      data-term-input
      aria-label="terminal command input"
    />
    <span class="cursor" aria-hidden="true"></span>
    <span class="sp"></span>
    <span class="dim hint">↵ EXEC · ESC · TAB</span>
  </div>
  <div class="row status-row">
    <span class="pill on">CMD</span>
    <span class="dim">PATH</span><span class="y" data-term-status-path>{pathname === '/' ? '/about' : pathname.replace(/\/$/, '')}</span>
    <span class="dim">SECTOR</span><span class="y" data-term-status-sector>{sector.num}/{sector.total}</span>
    <span class="dim">COMMIT</span><span class="b">{(meta as any).shortHash ?? (meta as any).hash}</span>
    <span class="sp"></span>
    <span class="dim">{(meta as any).buildDate ?? (meta as any).date}</span>
  </div>
  <div class="term-output" data-term-output aria-live="polite"></div>
</header>

<style>
  .term-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 50;
    background: #050505;
    border-bottom: 1px solid var(--accent-yellow);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
  }
  .row { padding: 8px 22px; display: flex; gap: 14px; align-items: center; }
  .prompt-row { border-bottom: 1px dashed var(--border); }
  .status-row { padding: 5px 22px; font-size: 10px; gap: 22px; color: #6f6f74; }

  .reg { color: var(--accent-blue); font-weight: 700; }
  .y   { color: var(--accent-yellow); }
  .b   { color: var(--accent-blue); font-weight: 700; }
  .dim { color: var(--text-secondary); }
  .sp  { flex: 1; }

  .pill { padding: 1px 6px; background: var(--bg-elevated); border: 1px solid var(--border); }
  .pill.on { background: var(--accent-yellow); color: #0a0a0a; border-color: var(--accent-yellow); }

  .path-label { color: var(--accent-yellow); }

  .prompt-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font: inherit;
    letter-spacing: inherit;
    min-width: 0;
    caret-color: transparent;  /* we draw our own */
  }
  .cursor {
    display: inline-block;
    width: 7px; height: 11px;
    background: var(--accent-yellow);
    animation: term-blink 1s steps(2) infinite;
  }
  @keyframes term-blink { 50% { opacity: 0; } }

  .hint { font-size: 9px; }

  .term-output {
    padding: 0 22px;
    color: var(--text-secondary);
    font-size: 10px;
    line-height: 1.6;
    max-height: 0;
    overflow: hidden;
    transition: max-height 200ms ease;
  }
  .term-output.has-content {
    max-height: 120px;
    padding: 6px 22px 8px;
    border-top: 1px dashed var(--border);
  }
  .term-output .err { color: #ff5a4a; }
  .term-output .out { color: var(--text-primary); }
  .term-output .out b { color: var(--accent-yellow); }

  @media (max-width: 768px) {
    .row { padding: 7px 14px; gap: 8px; }
    .status-row { padding: 4px 14px; font-size: 9px; gap: 10px; flex-wrap: wrap; }
    .hint { display: none; }
  }
</style>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/TerminalHeader.astro
git commit -m "feat(components): add TerminalHeader

Two-row sticky header. Live input field, vim-style status strip,
hidden output drawer (revealed when commands print). Behavior wired
in a later task; this is the visual + structural shell only."
```

---

### Task 5: Create `RightRail.astro`

**Files:**
- Create: `src/components/RightRail.astro`

- [ ] **Step 1: Create the component**

```astro
---
interface Props {
  activeKey: 'about' | 'resume' | 'portfolio' | 'blog';
}
const { activeKey } = Astro.props;

const items = [
  { key: 'about',     href: '/',           label: 'ABOUT',     sector: '01' },
  { key: 'resume',    href: '/resume/',    label: 'RESUME',    sector: '02' },
  { key: 'portfolio', href: '/portfolio/', label: 'PORTFOLIO', sector: '03' },
  { key: 'blog',      href: '/blog/',      label: 'BLOG',      sector: '04' },
] as const;

const active = items.find(i => i.key === activeKey)!;
---

<aside class="rail" data-rail>
  <div class="sector-display">
    <div class="sector-lbl">// SECTOR</div>
    <div>
      <span class="sector-num" data-rail-sector>{active.sector}</span>
      <span class="sector-denom">/ 04</span>
    </div>
  </div>

  <ul class="rail-list">
    {items.map((item) => (
      <li>
        <a
          href={item.href}
          class:list={['rail-item', item.key === activeKey && 'active']}
          data-rail-link
          data-key={item.key}
          data-sector={item.sector}
        >
          <span class="caret" aria-hidden="true">▸</span>
          {item.label}
        </a>
      </li>
    ))}
  </ul>
</aside>

<style>
  .rail {
    position: absolute;
    top: 130px; right: 56px;
    width: 180px;
    z-index: 3;
  }

  .rail-list { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }

  .rail-item {
    display: block;
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.22em;
    color: #6a6a6e;
    text-decoration: none;
    padding: 4px 0;
    position: relative;
    transition: color 200ms ease;
  }
  .rail-item:hover { color: var(--accent-yellow); }
  .rail-item.active { color: var(--accent-yellow); }
  .rail-item .caret {
    position: absolute;
    left: -16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent-yellow);
    font-size: 10px;
    opacity: 0;
    transition: opacity 200ms ease;
  }
  .rail-item.active .caret { opacity: 1; }

  @media (max-width: 768px) {
    .rail {
      position: absolute;
      top: auto; right: 22px; left: 22px;
      bottom: 80px;
      width: auto;
    }
    .sector-display {
      display: none; /* sector shown above active label only on mobile */
    }
    .rail-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 0;
    }
    .rail-list li { text-align: center; }
    .rail-item {
      text-align: center;
      font-size: 9px;
      letter-spacing: 0.18em;
      padding-top: 8px;
      border-top: 1px dashed var(--border);
    }
    .rail-item.active::before {
      content: attr(data-sector);
      display: block;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 800;
      font-size: 22px;
      color: var(--accent-yellow);
      letter-spacing: 0;
      margin-bottom: 2px;
    }
    .rail-item .caret { display: none; }
  }
</style>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/RightRail.astro
git commit -m "feat(components): add RightRail

Sector-number-at-top + 4 plain label items below. Active gets yellow
color + caret. Mobile collapses to a horizontal bottom strip with the
active sector number above the active label."
```

---

### Task 6: Create `panes/AboutPane.astro` (content migrated from `AboutSection.astro`)

**Files:**
- Create: `src/components/panes/AboutPane.astro`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/components/panes
```

Create `src/components/panes/AboutPane.astro`:

```astro
---
const stats = [
  { k: 'Years',  v: '11',                 accent: true  },
  { k: 'Stack',  v: 'TS · PY · JAVA',     accent: false },
  { k: 'Focus',  v: 'AGENT · MCP',        accent: false },
];

const links = [
  { href: 'https://github.com/qcharlieshi',          label: 'GITHUB ↗' },
  { href: 'https://www.linkedin.com/in/qcharlieshi/', label: 'LINKEDIN ↗' },
  { href: 'mailto:charlie.shi@lilt.com',              label: 'EMAIL ↗' },
];
---

<div class="pane" data-pane-key="about">
  <div class="pane-label">// ABOUT</div>

  <p class="prose">
    Building <code>Agent-MCP</code> orchestration and ML infrastructure at
    <a href="https://lilt.com" target="_blank" rel="noopener">LILT</a>.
    Boston native, currently in Andover, MA. Heavy bias toward shipping;
    allergic to abstractions that don't pay for themselves. Background spans
    fullstack ↗ ML infra ↗ agent platforms.
  </p>

  <div class="stat-row">
    {stats.map((s) => (
      <div class="stat">
        <div class="stat-k">// {s.k}</div>
        <div class:list={['stat-v', s.accent && 'blue']}>{s.v}</div>
      </div>
    ))}
  </div>

  <div class="tag-row">
    {links.map((l) => (
      <a class="tag" href={l.href} target="_blank" rel="noopener">[ {l.label} ]</a>
    ))}
  </div>
</div>

<style>
  .pane {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
    overflow: hidden;
  }
  .pane-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: var(--accent-yellow);
  }
  .prose {
    color: #c8c8ce;
    font-size: 14px;
    line-height: 1.65;
    margin: 0;
  }
  .prose a {
    color: var(--accent-blue);
    text-decoration: none;
    border-bottom: 1px solid rgba(24,96,255,0.55);
  }
  .prose code {
    color: var(--accent-blue);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }

  .stat-row { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 4px; }
  .stat { border-top: 1px solid var(--border); padding-top: 6px; min-width: 100px; }
  .stat-k {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.18em;
    color: var(--text-secondary);
  }
  .stat-v {
    font-family: 'Space Grotesk', sans-serif;
    color: var(--accent-yellow);
    font-size: 16px; margin-top: 4px;
  }
  .stat-v.blue { color: var(--accent-blue); }

  .tag-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
  .tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.18em;
    color: var(--accent-yellow);
    padding: 3px 10px;
    border: 1px solid var(--accent-yellow);
    text-decoration: none;
    transition: background 200ms;
  }
  .tag:hover { background: rgba(255,210,63,0.08); }

  @media (max-width: 768px) {
    .prose { font-size: 12px; }
    .stat { min-width: 80px; }
    .tag { font-size: 9px; padding: 2px 6px; }
  }
</style>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/panes/AboutPane.astro
git commit -m "feat(panes): add AboutPane

Content migrated from AboutSection.astro and tightened for the
hero-pane layout: paragraph + 3 stat columns + 3 link tiles.
Adds inline blue accents on links and code spans (years stat too)."
```

---

### Task 7: Create `panes/ResumePane.astro`

**Files:**
- Create: `src/components/panes/ResumePane.astro`

- [ ] **Step 1: Create the file**

```astro
---
const experience = [
  { ln: '01', role: 'STAFF AI ENGINEER',       org: 'LILT',            yr: '2023 →' },
  { ln: '02', role: 'SR FULLSTACK ENG',        org: 'OWN UP',          yr: '2018–22' },
  { ln: '03', role: 'SOFTWARE ENG · UI/UX',    org: 'BOSTON CAPITAL',  yr: '2017–18' },
  { ln: '04', role: 'PM · CONSULTANT',         org: 'WLH CONSULTING',  yr: '2014–16' },
];

const stack = ['TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C', 'React', 'Node', 'Spring', 'K8s', 'LLMs', 'MCP', 'RAG', 'Redis', 'GCP', 'AWS'];
const stackHighlighted = new Set(['TypeScript', 'Python', 'Java']);

const education = [
  { ln: '01', role: 'BBA · FIN + ORG MGMT', org: 'EMORY UNIVERSITY', yr: '2013' },
];
---

<div class="pane" data-pane-key="resume">
  <div class="pane-label">// RESUME · 11Y · SCROLL ↓</div>

  <div class="doc-section">
    <h4>// EXPERIENCE</h4>
    {experience.map((e) => (
      <div class="doc-line">
        <span class="ln">{e.ln}</span>
        <span class="role">{e.role}</span>
        <span class="sp"></span>
        <span class="org">{e.org}</span>
        <span class="yr">{e.yr}</span>
      </div>
    ))}
  </div>

  <div class="doc-section">
    <h4>// STACK</h4>
    <div class="stack-line">
      {stack.map((s, i) => (
        <>{i > 0 && ' · '}{stackHighlighted.has(s) ? <b>{s}</b> : <span>{s}</span>}</>
      ))}
    </div>
  </div>

  <div class="doc-section">
    <h4>// EDUCATION</h4>
    {education.map((e) => (
      <div class="doc-line">
        <span class="ln">{e.ln}</span>
        <span class="role">{e.role}</span>
        <span class="sp"></span>
        <span class="org">{e.org}</span>
        <span class="yr">{e.yr}</span>
      </div>
    ))}
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
    margin-bottom: 4px;
  }

  .doc-section {
    border-left: 1px dashed var(--border);
    padding-left: 16px;
  }
  .doc-section h4 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.22em;
    color: var(--accent-yellow);
    margin: 0 0 8px; font-weight: 500;
  }

  .doc-line {
    display: flex;
    gap: 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 3px 0;
  }
  .doc-line .ln  { color: #4a4a4f; min-width: 28px; text-align: right; }
  .doc-line .role{ color: var(--text-primary); }
  .doc-line .org { color: var(--accent-yellow); }
  .doc-line .yr  { color: var(--accent-blue); }
  .doc-line .sp  { flex: 1; }

  .stack-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; line-height: 1.8;
    color: #c8c8ce;
  }
  .stack-line b { color: var(--accent-blue); font-weight: 500; }

  @media (max-width: 768px) {
    .doc-line { font-size: 10px; gap: 8px; flex-wrap: wrap; }
    .stack-line { font-size: 10px; }
  }
</style>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/panes/ResumePane.astro
git commit -m "feat(panes): add ResumePane

Code-listing format: experience / stack / education sections, each
under a // SECTION label inside a dashed-left rule. Line numbers
in the gutter, dates highlighted in blue (content accent), three
primary languages bolded in blue. Scrolls internally."
```

---

### Task 8: Restructure `Hero.astro` (initialPane prop, new chrome, embedded pane + rail)

**Files:**
- Modify: `src/components/Hero.astro` (full rewrite)

- [ ] **Step 1: Rewrite the file**

Replace the entire contents:

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

<section class="hero glyph-grid" data-hero data-initial-pane={initialPane}>
  <CornerFrame inset={18}>
    <div class="hero-inner">
      <div class="top-l">// PORTFOLIO.SYS — REV 2026.05</div>

      <div class="top-r">
        <div class="commit-line">
          <b>{meta.shortHash}</b>LATEST COMMIT
        </div>
        {meta.subject && <div class="commit-sub" title={meta.subject}>"{meta.subject}"</div>}
      </div>

      <div class="glyphs">
        <GlyphStrip direction="v" count={13} gap={18} />
      </div>

      <div class="pane-container" data-pane-container>
        <PaneTransition />
        <div class="pane-frame" data-pane-frame>
          <div class="pane-slot" data-pane-slot="about" data-active={initialPane === 'about'}>
            <AboutPane />
          </div>
          <div class="pane-slot" data-pane-slot="resume" data-active={initialPane === 'resume'}>
            <ResumePane />
          </div>
        </div>
      </div>

      <RightRail activeKey={initialPane} />

      <div class="name-block">
        <div class="kicker">— STAFF AI ENGINEER · LILT AI</div>
        <h1 class="name name-glitch">
          <span class="name-en">CHARLIE<br/>SHI</span>
          <span class="name-zh" lang="zh">石千里</span>
        </h1>
      </div>

      <div class="meta-bar">
        <span class="meta-date">↳ {meta.buildDate}</span>
        <span class="meta-sep">·</span>
        <span class="meta-hash">{meta.shortHash}</span>
        {meta.subject && (
          <span class="meta-sub" title={meta.subject}>"{meta.subject}"</span>
        )}
        <span class="sp"></span>
        <a class="meta-cta" href={initialPane === 'about' ? '#about' : '/resume.pdf'} data-cta-href>
          {initialPane === 'about' ? '↗ ENTER' : '↗ DOWNLOAD PDF'}
        </a>
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
  .hero :global(.cf) {
    display: block;
    width: 100%;
    height: 100%;
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
  }
  .top-l { left: 60px; color: var(--accent-yellow); }
  .top-r { right: 60px; text-align: right; }
  .top-r .commit-line { font-size: 10px; letter-spacing: 0.12em; color: var(--text-secondary); }
  .top-r .commit-line b { color: var(--accent-blue); font-weight: 700; margin-right: 6px; }
  .top-r .commit-sub {
    font-size: 9px; color: #6a6a6e; letter-spacing: 0.1em;
    margin-top: 3px;
    max-width: 280px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .glyphs {
    position: absolute;
    top: 90px;
    left: 30px;
    height: 70%;
    display: flex;
    align-items: stretch;
  }
  .glyphs :global(.gs) {
    height: 100%;
    justify-content: space-between;
  }

  .pane-container {
    position: absolute;
    top: 110px;
    bottom: 230px;
    left: 90px;
    right: 260px;
  }
  .pane-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px dashed #3a3a3e;
    padding: 22px 28px;
    background: rgba(10,10,10,0.55);
    overflow: hidden;
  }
  .pane-slot {
    position: absolute;
    inset: 22px 28px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms;
  }
  .pane-slot[data-active="true"] {
    opacity: 1;
    pointer-events: auto;
  }

  .name-block {
    position: absolute;
    left: 60px;
    bottom: 70px;
    max-width: 50%;
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
    letter-spacing: 0.06em;
    font-size: clamp(48px, 8vw, 80px);
    line-height: 0.9;
    color: var(--text-primary);
    text-transform: uppercase;
    margin: 0;
  }
  .name .name-zh {
    font-size: clamp(48px, 8vw, 80px);
    letter-spacing: 0.06em;
  }

  .meta-bar {
    position: absolute;
    bottom: 30px;
    left: 60px; right: 60px;
    border-top: 1px dashed var(--border);
    padding-top: 10px;
    display: flex;
    gap: 18px;
    align-items: baseline;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }
  .meta-bar .meta-date { color: var(--accent-yellow); }
  .meta-bar .meta-sep { color: var(--text-secondary); }
  .meta-bar .meta-hash { color: var(--accent-blue); font-weight: 700; }
  .meta-bar .meta-sub {
    color: #6a6a6e;
    max-width: 320px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    text-transform: none;
    letter-spacing: 0.05em;
  }
  .meta-bar .sp { flex: 1; }
  .meta-bar .meta-cta {
    color: var(--accent-yellow);
    text-decoration: none;
    transition: opacity 200ms;
  }
  .meta-bar .meta-cta:hover { opacity: 0.7; }

  @media (max-width: 768px) {
    .top-l, .top-r { top: 18px; font-size: 9px; letter-spacing: 0.18em; }
    .top-l { left: 24px; }
    .top-r { right: 24px; }
    .top-r .commit-sub { display: none; }
    .glyphs { display: none; }
    .pane-container {
      top: 70px; bottom: 220px; left: 24px; right: 24px;
    }
    .pane-frame { padding: 14px 16px; }
    .pane-slot { inset: 14px 16px; }
    .name-block { left: 24px; bottom: 140px; max-width: 80%; }
    .name { font-size: 44px; }
    .name .name-zh { font-size: 44px; }
    .kicker { font-size: 9px; margin-bottom: 8px; }
    .meta-bar { bottom: 16px; left: 24px; right: 24px; }
    .meta-bar .meta-sub { display: none; }
  }
</style>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Expected: PASS. There will be a runtime issue where `index.astro` still uses `<Hero />` without the new prop — that's fixed in Task 10.

If the build fails because of the missing `initialPane` prop, the type is required, so it WILL fail. To keep the build green until Task 10:

Temporarily update `src/pages/index.astro` to pass the prop. Open it and change:
```astro
<Hero />
```
to:
```astro
<Hero initialPane="about" />
```

Run `npm run build` again — should pass now.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat(hero): restructure for terminal-iteration layout

- accepts initialPane prop ('about' | 'resume')
- embeds AboutPane + ResumePane in dual slots (data-active toggles)
- right rail moved into hero; sector + 4-label list
- top-right replaced with real commit hash + subject
- name stays bottom-left; flicker uses new .name-glitch class
- meta bar drops coords, shows date · hash · subject · CTA
- glyph strip count bumped to 13; mobile hides it"
```

---

### Task 9: Create `/resume/` route

**Files:**
- Create: `src/pages/resume/index.astro`

- [ ] **Step 1: Create the route**

```bash
mkdir -p src/pages/resume
```

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
---

<Base title="Charlie Shi — Resume" description="Resume — Staff AI Engineer @ LILT">
  <Hero initialPane="resume" />
</Base>
```

- [ ] **Step 2: Build and verify the route exists**

Run: `npm run build`

Expected: PASS.

Run: `ls dist/resume/`

Expected: `index.html` present.

- [ ] **Step 3: Commit**

```bash
git add src/pages/resume/index.astro
git commit -m "feat(routes): add /resume/ static route

Renders the same Hero with initialPane='resume'. Direct visits work;
the JS island layers in-app pushState navigation on top in a later task."
```

---

### Task 10: Update `src/pages/index.astro` to drop standalone about + divider

**Files:**
- Modify: `src/pages/index.astro` (full rewrite)

- [ ] **Step 1: Rewrite the page**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Charlie Shi',
  url: 'https://www.charlieshi.com',
  jobTitle: 'Staff AI Engineer',
  worksFor: {
    '@type': 'Organization',
    name: 'LILT',
    url: 'https://lilt.com',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Andover',
    addressRegion: 'MA',
    addressCountry: 'US',
  },
  knowsAbout: [
    'Large Language Models',
    'Machine Translation',
    'Agent Orchestration',
    'Model Context Protocol',
    'ML Infrastructure',
    'Full Stack Development',
  ],
  sameAs: [
    'https://github.com/qcharlieshi',
    'https://www.linkedin.com/in/qcharlieshi/',
  ],
};
---

<Base title="Charlie Shi — Staff AI Engineer">
  <script
    type="application/ld+json"
    is:inline
    set:html={JSON.stringify(personSchema)}
  />
  <Hero initialPane="about" />
</Base>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(pages): collapse home to a single Hero with about pane

Removes the standalone SectionDivider + AboutSection below the hero
(content lives inside the hero pane now). Updates the JSON-LD schema
to reflect current title (Staff AI Engineer) and Andover, MA location."
```

---

### Task 11: Update `Base.astro` — swap Navbar for TerminalHeader + mount PaneTransition + JS script

**Files:**
- Modify: `src/layouts/Base.astro` (full rewrite)
- Modify: `src/lib/buildMeta.ts` (remove legacy alias from Task 1)

- [ ] **Step 1: Rewrite `Base.astro`**

```astro
---
import TerminalHeader from '../components/TerminalHeader.astro';
import PaneTransition from '../components/PaneTransition.astro';
import MetaBar from '../components/MetaBar.astro';
import { getBuildMeta } from '../lib/buildMeta';

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
}

const { title, description = 'Charlie Shi — Staff AI Engineer', ogImage } = Astro.props;
const meta = getBuildMeta();
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
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&family=Noto+Sans+SC:wght@800&family=Space+Grotesk:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <title>{title}</title>
  </head>
  <body class="bg-bg-primary text-text-primary scan-line-soft">
    <a id="top" tabindex="-1" aria-hidden="true" style="position:absolute;top:0;left:0;"></a>
    <svg class="hidden" aria-hidden="true">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
    </svg>
    <div class="noise-overlay" style="filter: url(#noise);"></div>

    <TerminalHeader />
    <PaneTransition global />

    <main class="page-body">
      <slot />
    </main>

    <footer class="page-foot">
      <div class="page-foot-inner">
        <MetaBar
          date={meta.buildDate}
          build={meta.shortHash}
          cta="↗ TOP"
          ctaHref="#top"
        />
      </div>
    </footer>

    <script>
      import '../scripts/site.ts';
    </script>
  </body>
</html>

<style is:global>
  @import '../styles/global.css';

  .page-body {
    padding-top: 64px; /* clear the fixed TerminalHeader */
  }

  .page-foot {
    border-top: 1px solid var(--border);
    margin-top: 64px;
  }
  .page-foot-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 24px 32px;
  }

  @media (max-width: 768px) {
    .page-body { padding-top: 70px; }
  }
</style>
```

- [ ] **Step 2: Remove the legacy alias and old import from `buildMeta.ts`**

Open `src/lib/buildMeta.ts`. Delete the entire `getLegacyBuildMeta` function block at the bottom (the deprecated alias added in Task 1).

In `src/components/Hero.astro`, the import line currently reads:
```ts
import { getLegacyBuildMeta as getBuildMeta } from '../lib/buildMeta';
```
That was a temporary alias from Task 1. Hero.astro was already rewritten in Task 8 to use the new shape via `import { getBuildMeta } from '../lib/buildMeta';`, so verify that line reads correctly:

```bash
rg "getLegacyBuildMeta" src/
```

Expected: zero hits. If any remain, fix them — they should be replaced with `getBuildMeta` (new shape: `shortHash`, `subject`, `buildDate`, etc.).

- [ ] **Step 3: Build and verify**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Visual smoke check**

Run: `npm run dev` and open `http://localhost:4321`.

Look for:
- Terminal header at top (yellow underline, prompt + status row).
- Hero with corner brackets, name bottom-left, right rail visible.
- Page-foot meta bar with date + commit hash (no coords).
- No console errors (the JS island isn't there yet — terminal input non-functional is expected).

Kill the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/lib/buildMeta.ts src/components/Hero.astro
git commit -m "feat(base): swap Navbar for TerminalHeader; mount global PaneTransition

Removes the legacy alias from buildMeta. MetaBar no longer receives
a coords prop. Body gets padding-top to clear the fixed terminal."
```

---

### Task 12: Implement the JS island (`src/scripts/site.ts`)

**Files:**
- Create: `src/scripts/site.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/scripts
```

Create `src/scripts/site.ts`:

```ts
// Antireal terminal-iteration site script.
// Handles: terminal command parsing, in-app pane swap via pushState,
// Marathon transition trigger, sector glyph-overtake animation, and
// the horizontal mobile rail clicks.

type PaneKey = 'about' | 'resume';

interface RouteEntry {
  pathname: string;
  paneKey?: PaneKey;       // present = hero pane, swap in place
  sector: string;
  label: string;
}

const ROUTES: RouteEntry[] = [
  { pathname: '/',            paneKey: 'about',  sector: '01', label: 'ABOUT' },
  { pathname: '/resume/',     paneKey: 'resume', sector: '02', label: 'RESUME' },
  { pathname: '/portfolio/',                     sector: '03', label: 'PORTFOLIO' },
  { pathname: '/blog/',                          sector: '04', label: 'BLOG' },
];

const GLYPHS = ['×', '○', '⊞', '+', '✕', '⊟', '◇'];

const $  = <T extends Element>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

function getRouteByPath(p: string): RouteEntry | undefined {
  // normalize trailing slash
  if (p !== '/' && !p.endsWith('/')) p = p + '/';
  return ROUTES.find(r => r.pathname === p);
}

function getRouteByKeyword(kw: string): RouteEntry | undefined {
  const lower = kw.toLowerCase().replace(/^\/+|\/+$/g, '');
  if (lower === '' || lower === 'about' || lower === 'home') return ROUTES[0];
  if (lower === 'resume') return ROUTES[1];
  if (lower === 'portfolio') return ROUTES[2];
  if (lower === 'blog') return ROUTES[3];
  return undefined;
}

// ============ TRANSITION ============

function fireTransition(scope: 'pane' | 'global'): Promise<void> {
  return new Promise(resolve => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { resolve(); return; }
    if (scope === 'global') {
      document.body.classList.add('transitioning');
      setTimeout(() => {
        document.body.classList.remove('transitioning');
        resolve();
      }, 600);
    } else {
      const local = $('[data-pane-container] .pane-transition:not(.global)');
      if (!local) { resolve(); return; }
      local.classList.add('firing');
      setTimeout(() => {
        local.classList.remove('firing');
        resolve();
      }, 600);
    }
  });
}

// ============ SECTOR GLYPH-OVERTAKE ============

function glitchSector(toSector: string): void {
  const el = $<HTMLElement>('[data-rail-sector]');
  if (!el) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = toSector; return; }
  const iterations = 6;
  let i = 0;
  const tick = () => {
    if (i++ < iterations) {
      const a = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const b = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = a + b;
    } else {
      el.textContent = toSector;
      return;
    }
    setTimeout(tick, 55);
  };
  tick();
}

// ============ PANE SWAP ============

function swapPane(targetKey: PaneKey, targetSector: string, targetPath: string): void {
  const slots = $$<HTMLElement>('[data-pane-slot]');
  if (slots.length === 0) return; // hero not present on this page

  fireTransition('pane').then(() => {
    /* applied during ramp-down */
  });

  // Mid-ramp swap: at ~250ms (when the checker is darkest), flip slots.
  setTimeout(() => {
    slots.forEach(slot => {
      const isTarget = slot.dataset.paneSlot === targetKey;
      slot.dataset.active = String(isTarget);
      if (isTarget) slot.scrollTo({ top: 0 });
    });

    // Update rail active state
    $$<HTMLAnchorElement>('[data-rail-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.key === targetKey);
    });

    // Update meta-bar CTA
    const cta = $<HTMLAnchorElement>('[data-cta-href]');
    if (cta) {
      if (targetKey === 'about') {
        cta.textContent = '↗ ENTER';
        cta.setAttribute('href', '#about');
      } else {
        cta.textContent = '↗ DOWNLOAD PDF';
        cta.setAttribute('href', '/resume.pdf');
      }
    }

    // Update terminal status strip
    const pathEl   = $<HTMLElement>('[data-term-status-path]');
    const sectorEl = $<HTMLElement>('[data-term-status-sector]');
    const promptPathEl = $<HTMLElement>('[data-term-path]');
    if (pathEl)   pathEl.textContent   = targetPath === '/' ? '/about' : targetPath.replace(/\/$/, '');
    if (sectorEl) sectorEl.textContent = targetSector + '/04';
    if (promptPathEl) promptPathEl.textContent = targetPath === '/' ? '~/about' : '~' + targetPath.replace(/\/$/, '');

    // Sector glyph overtake
    glitchSector(targetSector);

    // pushState
    if (location.pathname !== targetPath) {
      history.pushState({ pane: targetKey }, '', targetPath);
    }
  }, 240);
}

// ============ NAV DISPATCH ============

function navigate(route: RouteEntry, opts: { fromPopstate?: boolean } = {}): void {
  if (route.paneKey && getRouteByPath(location.pathname)?.paneKey) {
    // Both source and dest are hero panes → in-place swap.
    swapPane(route.paneKey, route.sector, route.pathname);
    return;
  }

  // Full page navigation, wrapped in global transition.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    location.href = route.pathname;
    return;
  }
  fireTransition('global').then(() => {
    // Navigate just before ramp-down finishes so the new page paints under the checker.
  });
  setTimeout(() => { location.href = route.pathname; }, 300);
}

// ============ TERMINAL ============

interface CmdContext {
  raw: string;
  cmd: string;
  args: string[];
  output: HTMLElement;
}

function termPrint(output: HTMLElement, html: string, kind: 'out' | 'err' = 'out'): void {
  const line = document.createElement('div');
  line.className = kind;
  line.innerHTML = html;
  output.appendChild(line);
  output.classList.add('has-content');
}

function termClear(output: HTMLElement): void {
  output.innerHTML = '';
  output.classList.remove('has-content');
}

const HISTORY: string[] = [];
let historyIdx = -1;

function runCommand(raw: string, output: HTMLElement): void {
  termClear(output);
  if (!raw.trim()) return;
  HISTORY.push(raw);
  historyIdx = HISTORY.length;

  const tokens = raw.trim().split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  // Aliases: bare keywords → cd
  const KEYWORDS = ['about', 'resume', 'portfolio', 'blog', 'home'];
  if (KEYWORDS.includes(cmd)) {
    const r = getRouteByKeyword(cmd);
    if (r) navigate(r);
    else termPrint(output, `command not found: <b>${cmd}</b>`, 'err');
    return;
  }

  switch (cmd) {
    case 'cd': {
      const target = args[0] ?? '/';
      const r = getRouteByKeyword(target) ?? getRouteByPath(target);
      if (r) navigate(r);
      else termPrint(output, `cd: no such route: <b>${target}</b>`, 'err');
      return;
    }
    case 'ls':
      ROUTES.forEach(r => termPrint(output, `<b>${r.sector}</b>  ${r.pathname.padEnd(14, ' ')}  ${r.label}`));
      return;
    case 'pwd':
      termPrint(output, location.pathname);
      return;
    case 'whoami':
      termPrint(output, '<b>charlie shi</b> — staff ai engineer @ lilt');
      return;
    case 'clear':
      termClear(output);
      return;
    case 'help':
      termPrint(output, 'commands: <b>cd</b> &lt;route&gt; · <b>ls</b> · <b>pwd</b> · <b>whoami</b> · <b>clear</b> · <b>help</b>');
      termPrint(output, 'shortcuts: <b>about</b> · <b>resume</b> · <b>portfolio</b> · <b>blog</b> · <b>home</b>');
      return;
    default:
      termPrint(output, `command not found: <b>${cmd}</b>`, 'err');
  }
}

function initTerminal(): void {
  const input  = $<HTMLInputElement>('[data-term-input]');
  const output = $<HTMLElement>('[data-term-output]');
  if (!input || !output) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input.value, output);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; input.value = HISTORY[historyIdx] ?? ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < HISTORY.length - 1) { historyIdx++; input.value = HISTORY[historyIdx] ?? ''; }
      else { historyIdx = HISTORY.length; input.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const prefix = input.value.toLowerCase();
      const candidates = ['cd', 'ls', 'pwd', 'whoami', 'clear', 'help', 'about', 'resume', 'portfolio', 'blog', 'home']
        .filter(c => c.startsWith(prefix));
      if (candidates.length === 1) input.value = candidates[0];
    } else if (e.key === 'Escape') {
      input.blur();
      termClear(output);
    }
  });

  // '/' from anywhere focuses the prompt (unless inside another text field).
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/') return;
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
    e.preventDefault();
    input.focus();
  });
}

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

// ============ POPSTATE ============

function initPopstate(): void {
  window.addEventListener('popstate', () => {
    const r = getRouteByPath(location.pathname);
    if (!r || !r.paneKey) return;
    // Skip transition on back/forward — just snap.
    $$<HTMLElement>('[data-pane-slot]').forEach(slot => {
      slot.dataset.active = String(slot.dataset.paneSlot === r.paneKey);
    });
    $$<HTMLAnchorElement>('[data-rail-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.key === r.paneKey);
    });
    const sectorEl = $<HTMLElement>('[data-rail-sector]');
    if (sectorEl) sectorEl.textContent = r.sector;
  });
}

// ============ BOOT ============

document.addEventListener('DOMContentLoaded', () => {
  initTerminal();
  initRail();
  initPopstate();
});
```

- [ ] **Step 2: Build and verify TypeScript compiles**

Run: `npm run build`

Expected: PASS. Astro picks up the `<script>import '../scripts/site.ts'</script>` in Base and bundles it.

- [ ] **Step 3: Visual smoke check end-to-end**

Run: `npm run dev` and open `http://localhost:4321`.

Test sequence:
1. Page loads with terminal at top, hero below, ABOUT pane visible, right rail caret on ABOUT.
2. Click the input field, type `resume`, press Enter. → red checkerboard ramps over the pane, mid-ramp content swaps to RESUME, sector counter does the glyph dance and lands on `02`, URL becomes `/resume/`, rail caret moves to RESUME.
3. Press browser back. → pane snaps back to ABOUT (no transition), URL is `/`.
4. Click `PORTFOLIO` in the rail. → global checkerboard ramps over the whole viewport, mid-ramp navigates to `/portfolio/`.
5. Type `cd /` from `/portfolio/` (after page has loaded). → navigates back to home with transition.
6. Type `ls`. → output drawer shows the 4 routes.
7. Type `whoami`, `help`, `clear`. → each behaves as documented.
8. Watch the bottom-left name for ~8s. → glitchy EN ↔ ZH transitions visible.
9. Press `/` from anywhere on the page. → terminal input focuses.

If any step fails, fix before moving on. Common gotcha: if `pushState` to `/resume/` then a hard refresh 404s, the static file isn't being generated — re-check Task 9.

Kill the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/site.ts
git commit -m "feat(script): vanilla terminal command island + pane swap + transition

~250 LOC including transition orchestration. Terminal commands:
cd / ls / pwd / whoami / clear / help, plus bare keywords as cd
shortcuts. Rail clicks dispatch through the same routing layer.
Hero pane swap happens mid-ramp of the checkerboard. Page nav uses
the global transition + a delayed location.href. popstate snaps
without transition (back/forward UX)."
```

---

### Task 13: Verify reduced motion behavior

**Files:**
- Read: `src/styles/global.css`, `src/scripts/site.ts`

- [ ] **Step 1: Verify the CSS block exists**

```bash
rg "prefers-reduced-motion" src/styles/global.css
```

Expected: at least one hit pointing at the block we added in Task 2.

- [ ] **Step 2: Verify JS respects it**

```bash
rg "prefers-reduced-motion" src/scripts/site.ts
```

Expected: 3+ hits (in `fireTransition`, `glitchSector`, `navigate`).

- [ ] **Step 3: Manual test via DevTools**

Run: `npm run dev`. Open DevTools → Rendering panel → "Emulate CSS media feature: prefers-reduced-motion" → reduce.

Refresh page. Verify:
- Name shows EN only, no glitch animation.
- Pane swap (via terminal `resume`) happens instantly, no checkerboard visible.
- Sector number changes instantly (no glyph dance).
- Page nav (clicking PORTFOLIO) happens instantly without transition.

Kill dev server.

- [ ] **Step 4: Commit (only if any fixes were needed)**

If everything passed, no commit needed. If anything was missing, add the fixes and:

```bash
git add -p
git commit -m "fix(motion): respect prefers-reduced-motion across transitions and flicker"
```

---

### Task 14: Delete obsolete files and verify zero stale references

**Files:**
- Delete: `src/components/Navbar.astro`
- Delete: `src/components/AboutSection.astro`

- [ ] **Step 1: Verify nothing imports them**

```bash
rg "from.*Navbar" src/
rg "from.*AboutSection" src/
```

Expected: zero hits. If anything shows up, fix the importer first (route it through `TerminalHeader` / `AboutPane`).

- [ ] **Step 2: Delete the files**

```bash
rm src/components/Navbar.astro src/components/AboutSection.astro
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`

Expected: PASS, no warnings.

- [ ] **Step 4: Scrub any remaining stale references**

Run:
```bash
rg "Navbar|AboutSection|getLegacyBuildMeta|name-flicker|name-jitter" src/ docs/
```

Expected: zero hits in `src/`. Hits in `docs/` are OK (historical context).

If anything in `src/` matches, replace or delete. The `.name-flicker` rule was deleted in Task 2 — its class shouldn't appear anywhere in `src/` anymore.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete Navbar and AboutSection components

Replaced by TerminalHeader and panes/AboutPane respectively. No
remaining references in src/."
```

---

### Task 15: Update `CLAUDE.md` design language section

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the design language paragraph**

In `CLAUDE.md`, locate the "Project Overview" section (around line 7). The current paragraph ends with the antireal v1 description. Update the **Design language** paragraph and the **Architecture → Project Structure** tree to reflect the iteration.

Replace the **Design language** paragraph with:

```markdown
**Design language:** "Antireal v2" — terminal-led navigation, hero-as-manifest. Dark mode only, monospace metadata, blocky geometric typography. Yellow (`#ffd23f`) is the primary UI accent; electric blue (`#1860ff`) is a secondary accent for content highlights (inline links, code spans, key dates/numbers). Sticky **mock terminal header** replaces the navbar — real interactive prompt with commands `cd / ls / pwd / whoami / clear / help`. The home (`/`) and resume (`/resume/`) routes render the same hero with different default panes; in-app swap uses `history.pushState` + a Marathon-style red-checkerboard transition. A **right rail** holds the active sector number (big yellow) above a 4-item label list (ABOUT / RESUME / PORTFOLIO / BLOG). Motifs: yellow corner brackets, dashed metadata rails, dense vertical glyph strips (`× ○ ⊞ + ✕ ⊟ ◇`), bracketed callout tags, glitchy EN↔ZH name flicker (chromatic split, clipped bands), real git commit info in the hero chrome. One small inline JS island (~250 LOC) handles terminal + transitions; everything else is CSS-only.
```

Update the **Project Structure** tree under `src/components/` to reflect:
- `Navbar.astro` → removed
- `Hero.astro` updated description
- new `TerminalHeader.astro`, `RightRail.astro`, `PaneTransition.astro`
- new `panes/` directory with `AboutPane.astro`, `ResumePane.astro`
- `AboutSection.astro` → removed (content in `panes/AboutPane.astro`)
- new `src/scripts/site.ts`
- new `src/pages/resume/index.astro`

Replace the existing `src/` tree block in CLAUDE.md with:

```
src/
├── layouts/
│   └── Base.astro            # HTML shell: head, fonts, noise, TerminalHeader, global PaneTransition, slot, page-foot MetaBar
├── pages/
│   ├── index.astro           # Home: <Hero initialPane="about" />
│   ├── resume/
│   │   └── index.astro       # Resume: <Hero initialPane="resume" />
│   ├── portfolio/
│   │   ├── index.astro       # Portfolio listing
│   │   └── [slug].astro      # Portfolio detail (getStaticPaths)
│   └── blog/
│       ├── index.astro       # Blog listing (Medium RSS)
│       └── [slug].astro      # Blog post detail (getStaticPaths)
├── components/
│   ├── TerminalHeader.astro  # Fixed terminal-style top bar with prompt input + status row + output drawer
│   ├── Hero.astro            # Full-viewport hero hosting active pane (about|resume), name bottom-left, right rail, top-right commit
│   ├── RightRail.astro       # Sector number + 4-label nav list (about/resume/portfolio/blog)
│   ├── PaneTransition.astro  # Three-layer red checkerboard overlay (.global variant for full-viewport)
│   ├── panes/
│   │   ├── AboutPane.astro   # About content: prose + 3 stats + 3 link tiles
│   │   └── ResumePane.astro  # Resume content: experience / stack / education in code-listing format
│   ├── SectionDivider.astro  # Glyph strip + // LABEL + dither rule + RegMark (still used in resume content)
│   ├── PortfolioCard.astro   # Portfolio listing card
│   ├── BlogCard.astro        # Blog listing card
│   ├── CornerFrame.astro     # Yellow corner brackets wrapping a slot
│   ├── MetaBar.astro         # Dashed-top metadata rail (date + build + CTA) — coords prop removed
│   ├── FileIndex.astro       # (legacy primitive — kept for now, used inside SectionDivider)
│   ├── RegMark.astro         # Blue + crosshair
│   └── GlyphStrip.astro      # Vertical or horizontal repeating glyphs
├── content/
│   ├── config.ts             # Collections schema (Zod)
│   └── portfolio/            # One .md file per project
├── lib/
│   ├── medium.ts             # Fetch + parse Medium RSS at build time
│   └── buildMeta.ts          # Real git data (shortHash, subject, date, branch) snapshot
├── scripts/
│   └── site.ts               # Vanilla TS: terminal commands, pane swap, transitions, sector glyph-overtake
├── types/
│   └── index.ts              # MediumPost interface
├── styles/
│   └── global.css            # Tailwind directives + design system CSS + new keyframes
└── env.d.ts
```

Also update the **Documentation** section at the bottom to add the new spec/plan:

```markdown
- **Antireal iteration spec:** `docs/superpowers/specs/2026-05-25-antireal-terminal-iteration-design.md`
- **Antireal iteration plan:** `docs/superpowers/plans/2026-05-25-antireal-terminal-iteration.md`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(CLAUDE): update design language + structure tree for v2 antireal

Documents the terminal header, hero-pane model, right rail, JS island,
new files under src/components/panes/ and src/scripts/, removed Navbar
and AboutSection. Adds spec + plan paths to Documentation section."
```

---

### Task 16: Final cross-route visual verification

**Files:** none (verification only)

- [ ] **Step 1: Build and serve the production output**

```bash
npm run build && npm run preview
```

Open `http://localhost:4321/` (or whatever port preview reports).

- [ ] **Step 2: Walk every route**

For each of these URLs, check the items below:

**`/`**
- Terminal header at top with `~/about` in the path label, status row reads `PATH /about · SECTOR 01/04 · COMMIT <hash>`.
- Hero shows ABOUT pane (prose + stats + tags).
- Right rail: sector `01 / 04`, ABOUT label has yellow color + ▸ caret; others muted.
- Bottom-left: CHARLIE SHI name; watch ~8s for glitchy flicker to 石千里 and back.
- Top-right: short commit hash (blue) + `LATEST COMMIT` label + subject preview.
- Meta bar at bottom: date · short hash · subject · `↗ ENTER`.
- No coordinates anywhere on the page.

**`/resume/`**
- Hard refresh works (no flash of about content).
- Hero shows RESUME pane (experience / stack / education).
- Right rail: sector `02 / 04`, RESUME has caret.
- Meta bar CTA: `↗ DOWNLOAD PDF`.

**`/portfolio/`**
- Existing portfolio listing renders fine.
- Terminal header still at top with `~/portfolio`, status row shows `SECTOR 03/04`.
- Page-foot meta bar shows date · short hash · `↗ TOP` (no coords).
- Right rail not present on this page (rail is hero-only).

**`/portfolio/<slug>/`** (try `/portfolio/genzed/`)
- Detail page renders, terminal header has correct path.

**`/blog/`**
- Listing renders. Terminal header path is `~/blog`. Sector 04.

**`/blog/<slug>/`**
- Detail renders.

- [ ] **Step 3: Test mobile viewport**

In DevTools, switch to iPhone SE (375×667) or similar.

For `/` and `/resume/`:
- Glyph strip hidden.
- Terminal header still readable; hint text hidden; status row may wrap.
- Right rail collapses to bottom horizontal strip — 4 short labels, active gets a small sector number above it.
- Name is smaller (~44px), still bottom-left.
- Top-right commit subject hidden, just hash visible.

- [ ] **Step 4: Test the terminal interactions on production build**

From `/`:
- Type `resume`. → checkerboard fires, pane swaps to resume, URL becomes `/resume/`, sector counter does the glyph dance.
- Type `cd /portfolio`. → global checkerboard, navigates to `/portfolio/`.
- Type `ls`. → output drawer expands showing 4 routes.
- Press `/` from anywhere → input focuses.
- Browser back → snaps panes without transition.

- [ ] **Step 5: Final scrub**

```bash
rg "Navbar|AboutSection|getLegacyBuildMeta|name-flicker|name-jitter|N 42°|coords:" src/
```

Expected: zero hits.

```bash
git status
```

Expected: clean working tree.

- [ ] **Step 6: Wrap-up commit only if anything changed**

If any fixes during this verification were needed:

```bash
git add -A
git commit -m "fix: final verification pass — touch-ups across <files>"
```

If nothing changed, no commit needed. Iteration complete.

---

## Self-review notes (author)

- **Spec coverage:** Every spec section maps to one or more tasks. Sections 4.1 routes → Task 9 + 10. 4.2 components → Tasks 3-8, 14. 4.3 JS island → Task 12. 4.4 build meta → Task 1, 11. Section 5 transition → Task 2 (CSS) + 3 (component) + 12 (trigger). Section 6 flicker → Task 2. Section 7 sector overtake → Task 2 + 12. Section 8 terminal vocabulary → Task 12. Section 9 mobile → Tasks 4-8 inline media queries + Task 16 verification. Section 10 reduced motion → Task 2 + 12 + 13.
- **Placeholder scan:** none — every step has the actual code or command.
- **Type consistency:** `BuildMeta` shape from Task 1 (`shortHash`, `subject`, `buildDate`) is used uniformly by Hero (Task 8) and TerminalHeader (Task 4). `PaneKey = 'about' | 'resume'` consistent between Hero and site.ts. Rail item `key` matches `data-rail-link` selectors.
- **Known compromise:** TerminalHeader's status row currently reads `data-term-status-path` etc. and is updated by JS only on pane swap. For page nav (portfolio/blog), the next page's TerminalHeader renders with correct values at SSR time, so no JS sync needed there. This works because TerminalHeader is per-page, not persistent across nav.
