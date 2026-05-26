# i18n Corpus Refactor — Design

Refactor the existing manual-switch i18n system so the translation corpus lives in a single, editable, machine-readable place that a future translation connector can read/write without touching component code.

## Background

Current state (`docs/i18n-glitch-localization.md`):

- Translation strings live in `src/lib/i18n.ts` as two TS objects (`T` for plain text, `TH` for inline HTML).
- `.astro` components also hardcode the English source string inline next to the `data-i18n` attribute, because pages render in EN at build time and the runtime swap happens on `DOMContentLoaded`.
- Result: every EN string exists in two places. Editing requires touching both — and the inline values in `AboutPane.astro` (`stats[].k`, `stats[].v`, `now[].text`, `links[].label`) drift from `i18n.ts` silently because nothing enforces parity.

Goal: a single editable source of truth for English copy, with translations stored in a format a connector can overwrite cleanly.

## Corpus model

**EN is authoritative. ZH and ES are generated outputs.**

- You edit `en.json` only.
- A future connector script reads `en.json`, calls a translation API, and overwrites `zh.json` / `es.json`. Those files should be treated like build artifacts (still committed for now so the site works without a connector run, but never hand-edited as the long-term workflow).

## File layout

```
src/i18n/
├── en.json   ← authoritative
├── zh.json   ← generated (hand-seeded initially with current values from i18n.ts)
└── es.json   ← generated (same)

src/lib/i18n.ts   ← thin loader, public API unchanged
```

### JSON shape

One flat map per file, keys identical to the current `T`/`TH` keys:

```json
{
  "about.now.1": "Agent-MCP orchestration @ LILT",
  "about.prose": "Building <code>Agent-MCP</code> orchestration and ML infrastructure at <a href=\"https://lilt.com\" target=\"_blank\" rel=\"noopener\">LILT</a>. ..."
}
```

Decisions:

- **Flat keys** (`"about.now.1"`), not nested objects. Matches the existing runtime lookup (`applyLang` does `STRINGS[lang][key]`), so nothing in the runtime DOM walk has to change.
- **No `T` vs `TH` split in the corpus.** The runtime already distinguishes plain-text from inline-HTML via the DOM attribute (`data-i18n` vs `data-i18n-html`). A value happens to contain HTML when the consuming element uses `data-i18n-html`. The corpus is just `key → string`.
- **One file per lang** (not one combined `corpus.json`). Matches the natural connector I/O shape: one output file per target language.
- **Order/grouping in the file** preserves the current section markers' utility by keeping related keys adjacent (`about.*` together, `term.*` together, etc.). JSON loses comments, so this is the only organizational signal. Editors fold by depth.

## `src/lib/i18n.ts` (thin loader)

Public API preserved:

```ts
export type Lang = 'en' | 'zh' | 'es';
export const LANGS: Lang[];
export const LANG_LABEL: Record<Lang, string>;
export function altLang(active: Lang): Lang;
export function t(key: I18nKey, lang?: Lang): string;
export function th(key: I18nKey, lang?: Lang): string;
```

Internally:

- Import `en.json`, `zh.json`, `es.json` as JSON modules.
- Merge into `const STRINGS: Record<Lang, Record<string, string>>`.
- Derive `type I18nKey = keyof typeof en` so component call sites get autocomplete and TS errors on missing keys.
- `t()` and `th()` behave identically (both just `STRINGS[lang][key] ?? STRINGS.en[key] ?? key`). Keep both functions for back-compat with existing call sites; they exist purely to signal intent at the call site.
- `T` and `TH` named exports go away. Any code that imported them is updated to use `t`/`th` or the JSON directly.

`LANGS`, `LANG_LABEL`, and `altLang` remain plain TS constants in `i18n.ts` — they're not translation strings, they're configuration.

## Components

Pattern: components import the EN corpus once and reference keys.

Before (`AboutPane.astro`):

```astro
---
const now = [
  { key: 'about.now.1', text: 'Agent-MCP orchestration @ LILT' },
  { key: 'about.now.2', text: 'ML infra · vLLM · eval harnesses' },
  ...
];
---
<ul>{now.map((n) => <li><span data-i18n={n.key}>{n.text}</span></li>)}</ul>
```

After:

```astro
---
import EN from '../../i18n/en.json';
const nowKeys = ['about.now.1', 'about.now.2', 'about.now.3'] as const;
---
<ul>{nowKeys.map((k) => <li><span data-i18n={k}>{EN[k]}</span></li>)}</ul>
```

For inline-HTML prose:

```astro
<p class="prose" data-i18n-html="about.prose" set:html={EN['about.prose']} />
```

Apply the same pattern wherever a component currently colocates a hardcoded EN string with a `data-i18n` / `data-i18n-html` attribute:

- `src/components/panes/AboutPane.astro` — `stats`, `now`, `links`, prose
- `src/components/panes/ResumePane.astro`
- `src/components/Hero.astro`
- `src/components/RightRail.astro`
- `src/components/TerminalHeader.astro`
- `src/components/SectionDivider.astro`
- `src/pages/portfolio/index.astro`, `src/pages/blog/index.astro` (the `data-i18n` on the blog empty state and any `i18nKey` passed into `SectionDivider`)

After the refactor, no `.astro` file should contain a string that is also a key in `en.json`.

## Runtime: unchanged

The following stay exactly as they are:

- `applyLang(lang)` DOM walk over `[data-i18n]` and `[data-i18n-html]`.
- `ensureGlitchStructure(el, mode)` and the `.lg-primary` / `.lg-alt` wrapper.
- The 11s glitch keyframes in `src/styles/global.css`.
- Terminal `lang` command, localStorage persistence, fallback chain (`requested → en → key`).
- Reduced-motion handling.
- Build-time EN render (with the same FOUC gotcha for non-EN visitors documented in `docs/i18n-glitch-localization.md`).

The only runtime change is the data source: `applyLang` now reads from `STRINGS[lang][key]` (loaded from JSON) instead of `T[key][lang]` / `TH[key][lang]`.

## Out of scope (deferred)

- **Translator connector script.** Corpus is shaped for one, but `scripts/translate.ts` is not built here. When built, it reads `en.json`, calls the chosen API (LILT or otherwise), writes `zh.json` / `es.json`.
- **Stale-detection.** When an EN entry changes, ZH/ES become stale. No mechanism for this yet; defer to when the connector lands (likely a snapshot file or hash per key).
- **Extracting other content.** Portfolio MD bodies, Medium blog post bodies, `<title>` / meta descriptions, the `[ FEATURED ]` callout tag — same scope decisions as the current localization doc.
- **Build-time FOUC fix.** Same gotcha as today; acceptable for a personal site.
- **Removing the `t` vs `th` function distinction.** Could collapse to one function in a future cleanup, but back-compat for now.

## Risks

- **JSON loses comments.** The `// ===== About pane =====` markers in `i18n.ts` aren't carryable. Mitigation: keep related keys adjacent so structure is visible from indentation/order alone.
- **`resolveJsonModule`.** Astro's default tsconfig already enables this (`extends: "astro/tsconfigs/strictest"`). Verify during implementation; if not, set it in `tsconfig.json`.
- **Typed JSON imports.** Deriving `I18nKey` from the JSON requires the JSON to be type-narrowed (TS sees JSON as `Record<string, string>` by default unless `resolveJsonModule` + a const-asserted import). Fallback: maintain a tiny `keys.ts` listing valid keys, generated by hand or by a one-shot script. Decide during implementation based on what TS actually infers.
- **Inline-HTML escaping.** The `about.prose` string contains `<code>` and `<a>` tags with attributes. JSON requires escaping `"` inside the string. Mitigation: write the file once correctly and let the connector handle escaping going forward; no human will hand-write nested-quote HTML inside JSON often enough for this to be a real burden.

## Verification

After implementation, the existing verification recipe in `docs/i18n-glitch-localization.md` must still pass: parking every glitch in the alt-hold window via the Web Animations API should show every `[data-i18n]` / `[data-i18n-html]` element settle into the alt language. This confirms the corpus reshape didn't break the runtime swap.

Additional spot-check: change a single string in `en.json`, run `npm run dev`, confirm it appears in the rendered page without touching any `.astro` file.
