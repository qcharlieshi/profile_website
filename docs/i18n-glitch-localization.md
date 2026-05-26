# i18n + Lang-Glitch Localization

Personal portfolio "fake-localization" feature. Three languages (EN / ZH / ES) are switched manually via a terminal `lang` command; every visible UI string periodically flickers to the opposite language, holds it readably for ~1 s, then glitches back.

## Mental model

- **Active language** is a runtime state stored in `localStorage.lang`. Default is `en`. There is no browser auto-detect, no per-route locale.
- **Glitch rule:** if active = `en`, the alt that flickers in is `zh`. If active = `zh` or `es`, alt is `en`. See `altLang()` in `src/lib/i18n.ts`.
- All Astro pages **render in English at build time**. On `DOMContentLoaded`, `applyLang(getLang())` walks every `[data-i18n]` / `[data-i18n-html]` element, wraps it in a `.lang-glitch` shell, and fills in primary + alt language text.
- The name flicker (`.name-glitch` on the hero) is a separate, pre-existing animation. It now also flips primary/alt under `.name-zh-primary` when active = `zh`.

## File map

| File | Role |
|------|------|
| `src/lib/i18n.ts` | Dict of all translations. `T` = plain-text entries, `TH` = inline-HTML entries (for prose with `<code>` / `<a>` inside). |
| `src/scripts/site.ts` (I18N + LANG GLITCH section) | Runtime: `getLang/setLang`, `applyLang`, `ensureGlitchStructure`, terminal `lang` command. |
| `src/styles/global.css` (GENERIC LANG GLITCH section) | `.lang-glitch` + `.lang-glitch-block` shells, `@keyframes lang-glitch-primary` / `lang-glitch-alt`. |
| `src/styles/global.css` (REDUCED MOTION section) | Disables both name-glitch and lang-glitch under `prefers-reduced-motion`. |
| Component `.astro` files | Mark visible strings with `data-i18n="key"` (textContent swap) or `data-i18n-html="key"` (innerHTML swap, used for the about prose). |

Components with i18n attrs: `TerminalHeader.astro`, `Hero.astro`, `RightRail.astro`, `SectionDivider.astro`, `panes/AboutPane.astro`, `panes/ResumePane.astro`, plus `pages/portfolio/index.astro` and `pages/blog/index.astro` (passing `i18nKey` to `SectionDivider` + a `data-i18n` on the blog empty state).

## Glitch animation

11 s cycle on each element, randomized `animation-delay` per element so bursts stagger. Three acts:

| Window | Primary | Alt |
|--------|---------|-----|
| 0 % → 42.9 % | opacity 1 (idle) | opacity 0 |
| 43 % → 44.6 % | strobing out (chromatic offset, clip-path bands) | strobing in |
| **45 % → 54.9 %** | **opacity 0 (hidden)** | **opacity 1 (clean hold ~1.1 s)** |
| 55 % → 56.2 % | strobing in | strobing out |
| 57 % → 100 % | opacity 1 (idle) | opacity 0 |

**Important:** the animation uses `linear` timing, NOT `steps(1, end)`. Chrome interpreted `steps(1, end)` as "hold the 0 % keyframe value for the entire cycle and only jump to the 100 % value at the very end," which made every intermediate keyframe a no-op and prevented the alt from ever becoming visible. If you re-introduce `steps(...)` you will silently break the hold window.

## Structure injected at runtime

`ensureGlitchStructure(el, mode)` wraps the element idempotently:

```html
<!-- mode='text' (default) -->
<span data-i18n="rail.about" class="lang-glitch">
  <span class="lg-primary" style="animation-delay: 4.21s">ABOUT</span>
  <span class="lg-alt" aria-hidden="true" style="animation-delay: 4.21s">关于</span>
</span>

<!-- mode='html' (for [data-i18n-html] — adds .lang-glitch-block) -->
<p class="prose lang-glitch lang-glitch-block" data-i18n-html="about.prose">
  <span class="lg-primary">Building <code>Agent-MCP</code> …</span>
  <span class="lg-alt">在 <a>LILT</a> 构建 <code>Agent-MCP</code> …</span>
</p>
```

`.lg-alt` is `position: absolute; top: 0; left: 0` over the primary. In the `block` variant, alt also gets `right: 0` and `white-space: normal` so wrapped prose lines line up over the primary.

## Terminal command

```
lang              # print current + available
lang en|zh|es     # switch + persist + re-apply
```

Added to `case 'lang'` in `runCommand`, to the help line, and to tab-completion candidates in `src/scripts/site.ts`.

## Adding a new translatable string

1. Add an entry to `T` in `src/lib/i18n.ts`:
   ```ts
   'some.key': { en: 'HELLO', zh: '你好', es: 'HOLA' },
   ```
2. In the component, attach `data-i18n="some.key"` to the element. The build-time content is the English fallback.
3. No rebuild plumbing needed — `applyLang` picks it up on next page load.

For inline-HTML strings (paragraphs with `<code>` / `<a>`), use `TH` and `data-i18n-html`. Note: any `<code>` / `<a>` styles inside the swapped HTML must use `:global(...)` in the component's `<style>` block, otherwise Astro's scoped-CSS data attributes won't be on the injected children and the styling drops.

## Adding a new language

1. Add the code to `LANGS` and `LANG_LABEL` in `src/lib/i18n.ts`.
2. Extend every entry in `T` and `TH` with that lang's string.
3. Decide what the new lang's alt is. Current rule: `altLang(l) = l === 'en' ? 'zh' : 'en'`. If you want a different pairing for the new lang, edit `altLang()`.

## Gotchas / known gaps

- **Scoped CSS dropout for swapped HTML.** Already fixed for `AboutPane.prose` (`:global(code)`, `:global(a)`). If you add a new `data-i18n-html` element with inline tags, do the same in its component's `<style>`.
- **Build-time English render is the default.** Non-EN visitors with `lang=zh` in localStorage briefly see EN before `applyLang` runs on `DOMContentLoaded`. Acceptable for a personal site; if it ever matters, inline a `<head>` script that reads localStorage and replaces text before paint.
- **Pane-swap CTA.** The hero CTA text was previously swapped by setting `textContent` directly. It now sets `data-i18n` to `meta.enter` / `meta.download` and calls `applyLang(getLang())` to re-render through the i18n layer. Don't regress to direct textContent writes — that bypasses the glitch wrapper.
- **`popstate` does NOT update the CTA.** Pre-existing inconsistency, unrelated to i18n. Back/forward between `/` and `/resume/` will leave a stale CTA. Not fixed in this pass.
- **Not translated:**
  - Portfolio MD frontmatter / body (author content).
  - Medium blog post bodies (external content).
  - `[ FEATURED ]` callout tag on portfolio cards. Small follow-up if desired.
  - Page `<title>` and meta description in `Base.astro`. SEO English-only is fine.
- **Pausing animations for screenshot debugging.** The CSS `animation-delay` (set per-element to stagger bursts) interferes with naive `el.style.animationDelay = '-5.5s'` parking. Use the Web Animations API instead:
  ```js
  el.style.cssText = '';                       // clear inline animation-delay
  for (const a of el.getAnimations()) { a.pause(); a.currentTime = 5500; }
  ```

## Verification recipe

Dev server, then in DevTools console:

```js
// Park every glitch in the alt-hold window:
document.querySelectorAll('.lang-glitch > .lg-primary, .lang-glitch > .lg-alt').forEach(el => {
  el.style.cssText = '';
  for (const a of el.getAnimations()) { a.pause(); a.currentTime = 5500; }
});
// (To restore: reload the page.)
```

You should see every i18n element settle into the alt language while the page is in EN mode. Confirms keyframes, JS wiring, and structure all line up.
