# Antireal Iteration — Terminal Header + Hero Panes

**Date:** 2026-05-25
**Branch target:** master
**Predecessor spec:** [`2026-05-25-antireal-redesign-design.md`](./2026-05-25-antireal-redesign-design.md)
**Status:** Approved for planning

## 1. Summary

Second iteration on the antireal redesign. Three big moves:

1. **Replace the sticky navbar with a mock terminal header** (prompt + vim-style status row) that is the primary nav UI across the site. Commands are real — a small vanilla JS island parses input and routes.
2. **Fold the About content into the hero** as a centered pane, and **add a Resume pane** (with its own route `/resume/`). About/Resume swap in place with a Marathon-style red-checkerboard transition. Portfolio + Blog stay as real routes (existing `/portfolio/`, `/blog/`) and use the same transition during page nav.
3. **Right-side rail** with the active sector number (big yellow) on top, plus a clean 4-item label list below (ABOUT / RESUME / PORTFOLIO / BLOG). Active is yellow with a `▸` caret.

The site keeps its zero-framework posture (Astro static, no React) but adopts a **small JS budget**: one inline script island (~120 LOC) handles terminal input, pane swap, history.pushState, and the transition trigger.

## 2. Goals & non-goals

### Goals
- Strengthen the antireal "I am a working file system" metaphor — terminal at top, file index on the right, code-listing aesthetic for resume content.
- Make the hero do more work (about + resume content lives there) so the home page reads as a manifest rather than a billboard.
- Add a Marathon-game-flavored transition between hero panes and full-page nav.
- Surface real project state via git: latest commit hash + subject visible in the hero chrome.
- Bring back electric blue (`#1860ff`) as a second accent for *content* highlights (inline links, code spans, key dates/numbers); yellow stays UI-primary.
- Preserve the EN↔ZH name flicker but make it visibly glitchy (chromatic split, clipped bands, micro-jitter).

### Non-goals
- No move to React / Astro UI framework integration. Astro `.astro` template syntax remains the authoring surface.
- No light mode. Still dark mode only.
- No real shell features (no env vars, alias resolution, multi-line input editing, ANSI escape parsing). The terminal is a command palette in costume.
- No PDF generation at build time. Resume PDF, if added, is a hand-maintained static file at `public/resume.pdf`.
- No backwards-compatibility with the v1 sticky navbar — full replacement.

## 3. Locked decisions

| Decision | Value |
|---|---|
| Terminal layout | Two rows — prompt on top, vim-style status strip below. ~52px total height. Sticky across all routes. |
| Terminal implementation | Roll our own vanilla JS (single inline `<script>` island, ~120 LOC). No npm dependency. |
| Hero panes | About (default at `/`) + Resume (default at `/resume/`). Both are real Astro routes; both render the same Hero with a different default-pane prop. |
| In-app pane swap | `history.pushState` updates URL without reload; Marathon checkerboard transition plays during swap. |
| Portfolio + Blog | Real separate routes (existing `/portfolio/`, `/blog/`). Rail clicks here trigger full page nav, wrapped in the same checkerboard transition. |
| Right rail | Sector number (big yellow) at the top, then 4 plain text labels below. **No per-item numbers.** Active label is yellow with `▸` caret; others muted; hover ramps to yellow. |
| Sector transition | When active changes, the big rail number glyph-overtakes (digits dissolve through random glyphs `× ○ ⊞ + ✕ ⊟ ◇`, then re-form). ~400ms. |
| Marathon transition | Red `#ff3a2f` checkerboard grid of `+` plus marks, randomized cell density. Ramps up 300ms over outgoing content, ramps down 300ms over incoming. Total 600ms. Applies only to the hero-inner area on pane swap; covers full viewport on page nav. |
| Name | CHARLIE SHI ↔ 石千里 in bottom-left. **Both white (`#e8e8e8`).** Flicker is glitchy: yellow+blue chromatic text-shadow split, clipped-band slices, micro-jitter, opacity stutter. Loops every ~7s with two short glitch windows per cycle. |
| Top-right of hero | Replaces SECTOR + coords with **real last git commit**: short hash (blue) + `LATEST COMMIT` label + subject preview on second line. |
| Sector display location | Moves from top-right into the right rail (top of rail). |
| Bottom meta bar | Drops coordinates entirely. Now: `date · short-commit-hash · CTA`. |
| Build meta source | Replace synthetic deterministic hash in `src/lib/buildMeta.ts` with **real** git data via `child_process.execSync` during build: `{ shortHash, fullHash, subject, date, branch }`. |
| Glyph strip | Denser than v1. Vertical column down the left edge, randomized character sequence from `× ○ ⊞ + ✕ ⊟ ◇ □ ▽` plus some `+` in blue and some dim grey. Pre-randomized at build time (no client-side randomness, no layout jitter). |
| Second accent (blue) | `#1860ff`. Used in body prose for: inline links, `<code>` spans, key numeric callouts (years, stat values), commit hash. Yellow `#ffd23f` remains UI-primary (chrome, brackets, active state). |
| Mobile | <768px: glyph strip hidden; right rail collapses to a **horizontal bottom strip** with 4 short labels (ABO / RES / PORT / BLOG), active gets a smaller sector number above it; pane scales down; name stays bottom-left but smaller font. |

## 4. Architecture

### 4.1 Routing model

```
/             →  Hero (active pane = ABOUT)            [index.astro]
/resume/      →  Hero (active pane = RESUME)            [resume/index.astro]  ← NEW
/portfolio/   →  Portfolio listing                      [unchanged]
/portfolio/[slug] → Portfolio detail                    [unchanged]
/blog/        →  Blog listing                           [unchanged]
/blog/[slug]  →  Blog detail                            [unchanged]
```

`/` and `/resume/` render the same `Hero.astro` with prop `initialPane: 'about' | 'resume'`. Direct visits and crawler hits work natively (proper static HTML for each pane state). The JS island synchronizes URL ↔ pane state via `pushState` for in-app navigation.

### 4.2 Components (new + changed)

**New:**
- `src/components/TerminalHeader.astro` — fixed top header, two rows. Renders structural HTML for the prompt input + status strip; JS island enhances behavior.
- `src/components/RightRail.astro` — sector display at top + label list below. Takes `activeKey: 'about' | 'resume' | 'portfolio' | 'blog'`.
- `src/components/PaneTransition.astro` — wrapper that emits the checkerboard overlay markup (CSS-driven, JS toggles a class). One overlay element per page; reused by both pane swap and route nav.
- `src/pages/resume/index.astro` — renders `<Hero initialPane="resume" />`.
- `src/components/panes/AboutPane.astro` — about content (extracted from current `AboutSection.astro` body).
- `src/components/panes/ResumePane.astro` — resume content (experience/stack/education sections in code-listing style; scrolls internally on desktop).

**Changed:**
- `src/components/Hero.astro` — restructured to host the centered pane (driven by `initialPane` prop), keep the name bottom-left, host the right rail, get its top-right commit info chrome.
- `src/components/Navbar.astro` — **deleted**. Replaced by `TerminalHeader.astro`.
- `src/components/SectionDivider.astro` — kept; still used inside resume sections.
- `src/components/FileIndex.astro` — only used by the sector display inside `RightRail.astro` now (no longer in hero top-right).
- `src/layouts/Base.astro` — swap `<Navbar />` for `<TerminalHeader />`; include `<PaneTransition />` slot; mount the JS island.
- `src/lib/buildMeta.ts` — read real git data at module load (`git rev-parse --short HEAD`, `git log -1 --pretty=%s`, etc.). Falls back to `{ shortHash: 'nogit', subject: '', ... }` if git commands fail (e.g. Cloudflare Pages build without `.git`).
- `src/pages/index.astro` — drop the standalone `<SectionDivider label="ABOUT" />` + `<AboutSection />` below the hero. About now lives inside the hero pane. Page becomes `<Base><Hero initialPane="about" /></Base>`.
- `tailwind.config.mjs` — no structural change; verify blue token is exposed for prose-invert overrides (already is from v1).
- `src/styles/global.css` — add glitch flicker keyframes, checkerboard transition keyframes, sector glyph-overtake keyframes; remove the old smooth flicker animation.

**Removed:**
- `src/components/AboutSection.astro` — content moves to `src/components/panes/AboutPane.astro`. The visual chrome (dashed enclosure, stat strips, link tiles) is preserved inside the pane.
- `src/components/Navbar.astro`.

### 4.3 JS island

Single Astro `<script>` (inline, no hydration framework). Lives in `src/scripts/site.ts` and imported via `<script>import '../scripts/site.ts'</script>` inside `Base.astro` (Astro bundles + hashes it during build). Responsibilities:

- **Terminal input:** capture keys on `<input>`, parse on `Enter`, dispatch to handlers. History buffer (in-memory, no persistence). `↑/↓` walks history. `Tab` does prefix completion against the command vocabulary.
- **Navigation:**
  - `cd /about` / `about` / `home` / `cd /` → in-app pane swap (`pushState`, fire transition, swap pane content, update rail/sector). Stay on `/` for `/about`, `/resume/` for `/resume`.
  - `cd /portfolio` / `portfolio` → full page nav (with transition wrapper).
  - `cd /blog` / `blog` → full page nav.
  - `cd /portfolio/<slug>` → full page nav to detail.
- **Other commands:** `ls` (list routes), `whoami` (print name + role), `clear` (wipe history pane / reset prompt), `help` (cheat sheet), `pwd` (current path).
- **`popstate` listener:** browser back/forward swaps panes correctly without reload.
- **Transition trigger:** add `.transitioning` class to `<body>` for 600ms; the checkerboard overlay's CSS animation fires off that class.
- **Sector update:** when pane changes, kick off the glyph-overtake on the sector number element. ~400ms scripted via `setInterval` swapping the inner text through random glyphs then settling on the new digit.
- **Mobile rail:** clicks on the bottom horizontal rail route through the same dispatcher.

**Estimated size:** ~120 LOC TypeScript, ~3 KB minified.

### 4.4 Build-time data flow

`src/lib/buildMeta.ts`:

```ts
import { execSync } from 'node:child_process';

function safe(cmd: string, fallback = ''): string {
  try { return execSync(cmd).toString().trim(); }
  catch { return fallback; }
}

const meta = Object.freeze({
  shortHash: safe('git rev-parse --short HEAD', 'nogit'),
  fullHash:  safe('git rev-parse HEAD', ''),
  subject:   safe('git log -1 --pretty=%s', ''),
  date:      safe('git log -1 --pretty=%as', new Date().toISOString().slice(0,10)),
  branch:    safe('git rev-parse --abbrev-ref HEAD', ''),
  buildDate: new Date().toISOString().slice(2,10).replace(/-/g,'.'), // YY.MM.DD
});

export function getBuildMeta() { return meta; }
```

Frozen at module load → identical across all pages of one build. Cloudflare Pages provides `.git` so `git` calls succeed in build env; if not, fallbacks keep build green.

## 5. Marathon transition mechanism

Red checkerboard grid of `+` marks, ramps in then out.

**DOM:**
```html
<div class="pane-transition" aria-hidden="true">
  <div class="checker"></div>
</div>
```

`.checker` has a background built from a repeating CSS gradient or a single inline SVG `<pattern>` containing `+` marks (color `#ff3a2f`, scattered density via stochastic stops). Default opacity 0, scale 1.05.

**Trigger:** JS adds `body.transitioning`. CSS keyframe `marathon-ramp`:
- `0%`: `opacity: 0; mask-position: 0 0;`
- `40%`: `opacity: 0.85; mask-position: 40px 40px;` (squares visible)
- `60%`: `opacity: 0.85; mask-position: -40px -40px;`
- `100%`: `opacity: 0; mask-position: 0 0;`

A CSS `mask-image` of a random-noise SVG gives the "appearing at random offsets" feel — different cells of the checker reveal at different times. Combined with `animation-delay` on a few stacked layers (3 layers, staggered ~80ms) it gives the chaotic appearance the user referenced.

**Scope:** On pane swap, transition's container is `.hero-inner` (only the hero content area gets covered). On page nav, container is `<body>` so it covers the whole viewport during the navigate-out → next-page-load cycle. The transition starts on the outgoing page; the incoming page reads a query param or sessionStorage flag to fade *out* the checker on load (so the ramp-down completes after the new page renders).

## 6. Glitch name flicker

EN ↔ ZH every ~7s with two short glitch windows per cycle. Both layers position-absolute over each other.

**Per layer keyframes** (simplified):
- Long stable stretch (opacity 1 or 0 depending on layer).
- ~300–500ms glitch window with sub-stepped frames at 0.5% intervals: clip-path inset bands (e.g. `inset(45% 0 30% 0)`), translateX/Y micro-jitter ±2–3px, `text-shadow: 2px 0 #ffd23f, -2px 0 #1860ff` for chromatic split, opacity stutter 0.2–0.8.
- Re-settle to the other layer's stable state.

Both EN and ZH layers are `color: #e8e8e8` (white). Color only appears via the chromatic `text-shadow` during glitch frames.

`steps(1)` timing on the wrapping animation gives the hard-cut frame look (no smoothing between keyframes).

## 7. Sector glyph-overtake

When active rail link changes:

1. JS finds the sector `.num` element (current text e.g. `01`).
2. Runs `setInterval` every ~50ms for ~6 iterations, replacing inner text with two random glyphs picked from `× ○ ⊞ + ✕ ⊟ ◇`.
3. Settles on the new value (`02`).

CSS sets `font-feature-settings: "tnum"` so the box doesn't reflow during character swaps.

## 8. Terminal command vocabulary

| Command | Action |
|---|---|
| `cd /about`, `about`, `home`, `cd /` | In-app pane swap → about (URL → `/`) |
| `cd /resume`, `resume` | In-app pane swap → resume (URL → `/resume/`) |
| `cd /portfolio`, `portfolio` | Page nav → `/portfolio/` |
| `cd /portfolio/<slug>` | Page nav → `/portfolio/<slug>/` |
| `cd /blog`, `blog` | Page nav → `/blog/` |
| `cd /blog/<slug>` | Page nav → `/blog/<slug>/` |
| `ls` | Print available routes inline below prompt (transient toast that auto-clears on next command). |
| `whoami` | Print `charlie shi — staff ai engineer @ lilt`. |
| `pwd` | Print current path. |
| `clear` | Wipe transient output area. |
| `help` | List commands. |

Unknown command: print `command not found: <cmd>` in red. Tab completion runs against command names and known paths.

The prompt input is a visible `<input>` field. Always focusable via click on the terminal row; keyboard shortcut `/` also focuses it (unless the user is already inside another input/textarea).

## 9. Mobile layout (<768px)

- Terminal header keeps both rows but tighter padding; input shrinks; status row hides COMMIT field (keeps PATH + SECTOR + DATE).
- Corner brackets remain but at 14×14 instead of 22×22, tighter inset.
- Glyph strip: hidden.
- Top-right commit info: hides subject line (just keeps `2b8d14d`).
- Pane: full width minus 24px gutters; smaller font sizes.
- Name: stays bottom-left, font drops from ~76px to ~44px clamp.
- Right rail: replaced by **horizontal bottom strip** above meta bar — 4 short labels (`ABO / RES / PORT / BLOG`), each takes 1/4 width, dashed top-border. Active label is yellow with the small sector number above it.
- Meta bar: drops commit subject; just date + short hash + CTA.

## 10. Out of scope / known compromises

- **Real shell features** (env vars, multi-line input, ANSI parsing): not in scope; explicitly defer.
- **Resume PDF generation**: not in scope; if added, hand-maintained at `public/resume.pdf`.
- **Search command in terminal** (e.g. `find <query>`): nice-to-have, deferred.
- **OG images per pane**: deferred (covered as latent in v1 spec).
- **404 page antireal styling**: deferred.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` should disable the Marathon transition (instant swap), disable the name glitch (instant cut), and disable the sector glyph-overtake. Cursor blink can stay.
- **Mobile horizontal rail crowding** at <340px (e.g., iPhone SE 1st gen 320 wide): not a target viewport. Site assumes 375px floor.

## 11. Risks

- **Cloudflare Pages build env without `.git`**: build meta falls back. Verify by testing a `npm run build` from a non-git directory.
- **JS island getting hydrated late on slow connections**: terminal input field will be unresponsive until script loads. Acceptable for this site's scale; if it becomes a problem, swap in a `<noscript>` fallback that renders the rail items as plain `<a>` tags (already the case for non-JS users since the rail is structurally `<a>`s).
- **Pane-swap transition disrupts scroll position**: resume pane scrolls internally. Pane swap must reset scroll on incoming pane.
- **`pushState` + Cloudflare Pages 404 on hard refresh of `/resume/`**: mitigated because `/resume/` is a real static route — `/resume/index.html` exists in `dist/`.

## 12. Verification checklist

- [ ] Hard refresh of `/resume/` renders the resume pane (no flash of about content).
- [ ] Terminal `cd /resume` from `/` updates URL to `/resume/` without reload, plays transition, swaps pane content, swaps rail caret, updates sector to `02`.
- [ ] Browser back/forward correctly swaps panes (popstate listener).
- [ ] `cd /portfolio` navigates to `/portfolio/` with the transition wrapping the page swap.
- [ ] Sector glyph-overtake fires on every rail link click and terminal nav.
- [ ] Name flicker glitch visibly stutters (chromatic split, clip bands) — not a smooth fade.
- [ ] Last git commit hash + subject visible in hero top-right and meta bar; matches `git log -1`.
- [ ] Coords no longer appear anywhere on any page.
- [ ] Mobile @ 375px: glyph strip absent, rail at bottom, name shrunken, terminal still legible.
- [ ] `prefers-reduced-motion: reduce` disables Marathon transition + glitch + glyph-overtake.
- [ ] Zero references to deleted `Navbar` component remain.
- [ ] Build clean (`npm run build`) with no warnings.

## 13. File inventory (planned)

**Add:**
- `src/components/TerminalHeader.astro`
- `src/components/RightRail.astro`
- `src/components/PaneTransition.astro`
- `src/components/panes/AboutPane.astro`
- `src/components/panes/ResumePane.astro`
- `src/pages/resume/index.astro`
- `src/scripts/site.ts` (imported by `Base.astro`)

**Modify:**
- `src/components/Hero.astro`
- `src/lib/buildMeta.ts`
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/styles/global.css`
- `CLAUDE.md` (design language section update)

**Delete:**
- `src/components/Navbar.astro`
- `src/components/AboutSection.astro` (content migrated)

## 14. References

- Predecessor: `docs/superpowers/specs/2026-05-25-antireal-redesign-design.md`
- Predecessor handoff: `docs/antireal-redesign/context.md`
- Marathon transition reference image: provided in chat 2026-05-25 (Bungie Marathon red checkerboard reveal effect)
- Resume source: `~/Downloads/Charlie Shi - Resume 2025.docx`
- Visual companion mockup snapshots: `.superpowers/brainstorm/83107-1779761297/content/hero-layout-v5.html`
