# Portfolio + Blog as Hero Panes

**Date:** 2026-05-26
**Branch target:** master
**Predecessor spec:** [`2026-05-25-antireal-terminal-iteration-design.md`](./2026-05-25-antireal-terminal-iteration-design.md)
**Status:** Approved for planning

## 1. Summary

Today About and Resume live as swappable **panes** inside the Hero's content window, while Portfolio and Blog are separate full pages with large card grids. This iteration folds Portfolio and Blog into the same Hero pane system so all four right-rail sectors swap in place within one unified content window.

Three moves:

1. **Two new panes** — `PortfolioPane.astro` and `BlogPane.astro` — render their listings as a scrollable single column of **stacked mini-cards** inside the existing pane window (same geometry as About/Resume).
2. **All four routes become pane routes.** `/portfolio/` and `/blog/` stay as real static routes but are rewritten to render `<Hero initialPane="portfolio|blog" />`, exactly like `/resume/`. Every Hero page renders all four pane-slots in the DOM, so nav among the four is always an in-place swap with the local checkerboard transition.
3. **Detail pages unchanged.** `[slug]` detail pages stay as separate routes. Clicking a mini-card runs the **global** checkerboard transition and hard-navigates to the detail page.

No change to the zero-framework posture. The existing JS island (`src/scripts/site.ts`) is extended, not replaced.

## 2. Goals & non-goals

### Goals
- Unify navigation: all four primary sectors (ABOUT / RESUME / PORTFOLIO / BLOG) swap inside one content window with no full-page reload.
- Reuse the existing pane-swap machinery (`swapPane`, `data-pane-slot`, local `PaneTransition`) rather than inventing a new mechanism.
- Keep listing content on-aesthetic: stacked mini-cards that echo the terminal/file-listing language, scrolling within the pane like the resume pane.
- Preserve deep links, SEO, and crawlability — `/portfolio/` and `/blog/` remain real static HTML routes.

### Non-goals
- No detail-in-pane. `[slug]` pages stay as full routes reached via the global transition. (Considered and rejected — long Medium prose would be cramped in the pane window.)
- No change to detail page layout/content.
- No client-side data fetching. Listing data is fetched at build time, same as today.
- No new pane window geometry. Listings scroll inside the existing window dimensions.
- No light mode; no framework integration.

## 3. Locked decisions

| Decision | Value |
|---|---|
| Listing format | **Stacked mini-cards**, single column, scrolls in the pane. Each card: index + primary-tag header row, title, one-line description, date, `↗`. Yellow border on hover. Blog cards may carry a small thumbnail. |
| Click behavior | Mini-card is `<a href="/{section}/{slug}/" data-detail-link>`. Click runs the **global** checkerboard transition, then `location.href` at ~300ms (instant nav under reduced-motion). Detail pages unchanged. |
| Routes | `/portfolio/` and `/blog/` stay real static routes, rewritten to render `<Hero initialPane="portfolio|blog" />`. |
| Pane DOM | All four pane-slots (about, resume, portfolio, blog) render in every Hero page so swap is pure show/hide. |
| Sector mapping | about `01`, resume `02`, portfolio `03`, blog `04` (already in RightRail). |
| Per-pane meta CTA | about → `↗ ENTER` (`#about`); resume → `↗ DOWNLOAD PDF` (`/resume.pdf`); portfolio → `↗ GITHUB` (`https://github.com/qcharlieshi`); blog → `↗ MEDIUM` (`https://medium.com/@qcharlieshi`). Driven by a `PANE_META` map in `site.ts`. |
| Medium fetch | `getMediumPosts()` memoized at module level so the four Hero pages share one RSS fetch per build. |
| Data ownership | Each pane fetches its own data in frontmatter: `PortfolioPane` calls `getCollection('portfolio')`; `BlogPane` calls `getMediumPosts()`. Hero stays data-agnostic. |
| Mobile | Mini-cards inherit the resume pane scroll behavior in the same window. No new breakpoints. |
| Removed | `PortfolioCard.astro`, `BlogCard.astro`, and the grid markup + `SectionDivider` import in the two index pages. |

## 4. Architecture

### 4.1 Routing model

```
/             →  Hero (initialPane = about)       [index.astro]           unchanged
/resume/      →  Hero (initialPane = resume)      [resume/index.astro]    unchanged
/portfolio/   →  Hero (initialPane = portfolio)   [portfolio/index.astro] REWRITTEN
/blog/        →  Hero (initialPane = blog)        [blog/index.astro]      REWRITTEN
/portfolio/[slug] → Portfolio detail              [unchanged]
/blog/[slug]      → Blog detail                   [unchanged]
```

All four index routes render the same `Hero.astro` with a different `initialPane`. Direct visits / crawler hits get proper static HTML with the correct pane active. The JS island syncs URL ↔ pane state via `pushState` for in-app swaps among the four.

### 4.2 Pane-swap reachability

`navigate()` already does: if destination has a `paneKey` **and** the current path has a `paneKey`, swap in place; otherwise full-page nav. Once all four `ROUTES` carry a `paneKey`, every rail/terminal nav among the four becomes an in-place swap automatically. The only full-page navigations left are:
- mini-card → `[slug]` detail (destination has no route entry / no paneKey), and
- detail "← BACK" → listing (source path has no paneKey).

Both correctly fall to the global-transition full-nav branch.

### 4.3 Components

**New:**
- `src/components/panes/PortfolioPane.astro` — `getCollection('portfolio')` in frontmatter; renders `// PORTFOLIO · NN ENTRIES` label + scrollable column of mini-cards. Pane root: `<div class="pane" data-pane-key="portfolio">`.
- `src/components/panes/BlogPane.astro` — `getMediumPosts()` in frontmatter; same structure, `data-pane-key="blog"`, empty-state line when no posts (reuse `blog.empty` i18n).

**Changed:**
- `src/components/Hero.astro` — widen `Props.initialPane` to `'about' | 'resume' | 'portfolio' | 'blog'`; extend `sector` map to 03/04; render all four `data-pane-slot` wrappers (add portfolio + blog slots importing the new panes); set the initial meta-bar CTA href/label from the per-pane config based on `initialPane`.
- `src/pages/portfolio/index.astro` — replace grid body with `<Hero initialPane="portfolio" />` inside `Base`.
- `src/pages/blog/index.astro` — replace grid body with `<Hero initialPane="blog" />` inside `Base`.
- `src/scripts/site.ts`:
  - `type PaneKey = 'about' | 'resume' | 'portfolio' | 'blog'`.
  - `ROUTES`: add `paneKey: 'portfolio'` / `'blog'` to entries 03/04.
  - Add `PANE_META: Record<PaneKey, { ctaI18n: string; ctaHref: string }>`; use it in `swapPane` to set the meta CTA for all four panes (replaces the hardcoded about/resume branch).
  - Add a delegated click handler for `a[data-detail-link]` inside `[data-pane-container]`: `preventDefault`, fire global transition, navigate at ~300ms (reduced-motion → immediate `location.href`).
  - `swapPane` scroll-reset already targets `.pane`; mini-card columns scroll within `.pane`, so incoming-pane scroll resets correctly.
- `src/lib/medium.ts` — memoize `getMediumPosts()` with a module-level cached promise.
- `src/lib/i18n.ts` — add `meta.github`, `meta.medium`, `portfolio.label`, `blog.label` keys. (`rail.portfolio`, `rail.blog`, `sec.portfolio`, `sec.blog`, `blog.empty` already exist.)
- `CLAUDE.md` — update the Project Structure + design-language notes to reflect four panes and the new pane components; remove `PortfolioCard`/`BlogCard` from the component list.

**Removed:**
- `src/components/PortfolioCard.astro`
- `src/components/BlogCard.astro`

(The mini-card markup lives inside the pane components; the old standalone cards are not reused.)

### 4.4 Build-time data flow

- `getCollection('portfolio')` — local content, cheap; called by `PortfolioPane` and by `portfolio/[slug].astro`'s `getStaticPaths` (unchanged).
- `getMediumPosts()` — now invoked by `BlogPane` on all four Hero pages **and** by `blog/[slug].astro`. Module-level memoization collapses these to one RSS fetch per build.

## 5. Mini-card markup & styling

Card anatomy (single column, scrolls in `.pane`):

```
┌ 01 ── AGENT·MCP ───────────── ↗ ┐
  GENZED
  multi-agent orchestration…  26.04
└─────────────────────────────────┘
```

- Header row: zero-padded index (muted), primary tag (`tags[0]` / `categories[0]`, yellow mono), trailing `↗`.
- Title: Space Grotesk, uppercase, `text-primary`.
- Description: one line, `-webkit-line-clamp: 1`, `text-secondary` (portfolio `description`; blog `description`).
- Footer: date (blue), optional tag chips.
- Whole card is the anchor; hover ramps border to `--accent-yellow` (reuse existing `.card` hover idiom).
- Blog: optional small thumbnail (e.g. 56px square, grayscale) at the left of the header row; omit if absent.
- Date format: portfolio uses `data.date`; blog uses the existing `YY.MM.DD` derivation from `pubDate`.

Styling is scoped inside each pane component; reuse design tokens (`--border`, `--accent-yellow`, `--accent-blue`, fonts) — no new global utilities required.

## 6. Behavior details

- **Rail / terminal nav among the four** → in-place `swapPane` (local checkerboard, `pushState`, sector glyph-overtake, rail caret, terminal status strip, per-pane meta CTA). Existing mechanism; now reaches all four.
- **Mini-card click** → global checkerboard, hard-nav to `[slug]`.
- **`cd /portfolio/<slug>`** in terminal → unchanged (synthesized route, full nav).
- **Back/forward** → `popstate` handler already snaps panes for any `paneKey` route; now covers all four. Hard-refresh of `/portfolio/` or `/blog/` renders the right pane natively (real static route).

## 7. Mobile (<768px)

- Pane window geometry already adapts (`top:130 bottom:230 left:40 right:40`). Mini-cards stack full-width and scroll inside the pane, same as the resume pane.
- Blog thumbnails: keep small or drop under a tight width; decided during implementation by eye.
- Rail already collapses to the horizontal bottom strip with all four labels — no change.

## 8. Out of scope / known compromises

- **Detail-in-pane:** explicitly deferred/rejected.
- **Featured/`md:col-span-2` layout:** the old grid's featured spanning does not carry into the single-column pane; a featured project instead gets a `[ FEATURED ]` callout-tag on its mini-card. Spanning layout is dropped.
- **Pagination / "load more":** not needed at current entry counts; the column scrolls. Revisit if listings grow large.
- **Per-pane OG images:** unchanged from prior deferral.

## 9. Risks

- **Build cost:** `BlogPane` renders on four pages → memoize `getMediumPosts()` or the RSS endpoint is hit 4×. Mitigated by §4.4.
- **DOM weight:** all four panes' content ships in every Hero page's HTML. Listings are small (text rows); acceptable. If blog grows large, revisit.
- **Scroll reset on swap:** incoming mini-card column must start at top — verify `swapPane`'s `.pane` scroll reset covers the new panes (it should, since panes use `.pane` as the scroll root).
- **Card click vs. pane swap:** ensure the `a[data-detail-link]` handler fires the **global** transition, not the local pane one, and that it doesn't get shadowed by the rail handler.

## 10. Verification checklist

- [ ] Hard refresh of `/portfolio/` and `/blog/` renders the correct pane (no flash of about).
- [ ] Rail click ABOUT→PORTFOLIO→BLOG→RESUME swaps in place, no reload, local checkerboard plays, sector glyph-overtakes to 03/04, caret + terminal status update.
- [ ] Terminal `portfolio` / `blog` / `cd /blog` swap in place from any pane.
- [ ] Mini-card click plays the **global** checkerboard and lands on the correct `[slug]` detail page.
- [ ] Detail "← BACK" returns to the listing pane (full nav) and the pane is active.
- [ ] Browser back/forward swaps among all four panes correctly.
- [ ] Per-pane meta CTA shows ENTER / DOWNLOAD PDF / GITHUB / MEDIUM with correct hrefs.
- [ ] `getMediumPosts()` fetches the RSS feed once per build (memo works).
- [ ] No references to deleted `PortfolioCard` / `BlogCard` remain.
- [ ] `prefers-reduced-motion: reduce` → card click navigates instantly, no transition.
- [ ] Mobile @ 375px: mini-cards stack + scroll inside the pane; rail strip unchanged.
- [ ] `npm run build` clean, no warnings.

## 11. File inventory (planned)

**Add:**
- `src/components/panes/PortfolioPane.astro`
- `src/components/panes/BlogPane.astro`

**Modify:**
- `src/components/Hero.astro`
- `src/pages/portfolio/index.astro`
- `src/pages/blog/index.astro`
- `src/scripts/site.ts`
- `src/lib/medium.ts`
- `src/lib/i18n.ts`
- `CLAUDE.md`

**Delete:**
- `src/components/PortfolioCard.astro`
- `src/components/BlogCard.astro`

## 12. References

- Predecessor: `docs/superpowers/specs/2026-05-25-antireal-terminal-iteration-design.md`
- Pane-swap machinery: `src/scripts/site.ts` (`swapPane`, `navigate`, `ROUTES`)
- Existing pane examples: `src/components/panes/AboutPane.astro`, `src/components/panes/ResumePane.astro`
