// Antireal terminal-iteration site script.
// Handles: terminal command parsing, in-app pane swap via pushState,
// Marathon transition trigger, sector glyph-overtake animation, and
// the horizontal mobile rail clicks.

import { T, TH, altLang, LANGS, LANG_LABEL, type Lang } from '../lib/i18n';
import { PANE_META, type PaneKey } from '../lib/paneMeta';

interface RouteEntry {
  pathname: string;
  paneKey?: PaneKey;       // present = hero pane, swap in place
  sector: string;
  label: string;
}

const ROUTES: RouteEntry[] = [
  { pathname: '/',            paneKey: 'about',  sector: '01', label: 'ABOUT' },
  { pathname: '/resume/',     paneKey: 'resume', sector: '02', label: 'RESUME' },
  { pathname: '/portfolio/', paneKey: 'portfolio', sector: '03', label: 'PORTFOLIO' },
  { pathname: '/blog/',      paneKey: 'blog',      sector: '04', label: 'BLOG' },
];

const HEX_DIGITS = '0123456789ABCDEF';

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
  const randHex = () => HEX_DIGITS[Math.floor(Math.random() * HEX_DIGITS.length)];
  const tick = () => {
    if (i++ < iterations) {
      el.textContent = randHex() + randHex();
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
      if (isTarget) {
        slot.removeAttribute('aria-hidden');
        slot.querySelector('.pane')?.scrollTo({ top: 0 });
      } else {
        slot.setAttribute('aria-hidden', 'true');
      }
    });

    // Update rail active state
    $$<HTMLAnchorElement>('[data-rail-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.key === targetKey);
    });

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

function navigate(route: RouteEntry): void {
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
  // Fire transition (runs to ~600ms); we navigate at 300ms so the new
  // page paints under the darkest checker frame.
  fireTransition('global');
  setTimeout(() => { location.href = route.pathname; }, 300);
}

// ============ TERMINAL ============

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
      if (r) { navigate(r); return; }
      // Fall back: subroute under a known prefix (e.g. /portfolio/genzed)
      if (target.startsWith('/portfolio/') || target.startsWith('/blog/')) {
        const path = target.endsWith('/') ? target : target + '/';
        // Synthesize a RouteEntry so navigate() can wrap the transition.
        const parent = target.startsWith('/portfolio/') ? ROUTES[2] : ROUTES[3];
        navigate({ pathname: path, sector: parent.sector, label: parent.label });
        return;
      }
      termPrint(output, `cd: no such route: <b>${target}</b>`, 'err');
      return;
    }
    case 'ls':
      ROUTES.forEach(r => termPrint(output, `<b>${r.sector}</b>  ${r.pathname.padEnd(14, ' ')}  ${r.label}`));
      return;
    case 'pwd':
      termPrint(output, location.pathname);
      return;
    case 'whoami':
      termPrint(output, lookupT('term.whoami', getLang()) ?? 'charlie shi — staff ai engineer @ lilt');
      return;
    case 'lang': {
      const sub = args[0]?.toLowerCase();
      if (!sub) {
        const cur = getLang();
        termPrint(output, `current: <b>${LANG_LABEL[cur]}</b> (${cur})`);
        termPrint(output, `available: ${LANGS.map(l => `<b>${l}</b>`).join(' · ')} — usage: <b>lang &lt;code&gt;</b>`);
        return;
      }
      if (!(LANGS as string[]).includes(sub)) {
        termPrint(output, `lang: unknown code <b>${sub}</b>. try: ${LANGS.join(', ')}`, 'err');
        return;
      }
      setLang(sub as Lang);
      termPrint(output, `↻ switched to <b>${LANG_LABEL[sub as Lang]}</b>`);
      return;
    }
    case 'clear':
      termClear(output);
      return;
    case 'help':
      termPrint(output, 'commands: <b>cd</b> &lt;route&gt; · <b>ls</b> · <b>pwd</b> · <b>whoami</b> · <b>lang</b> &lt;code&gt; · <b>clear</b> · <b>help</b>');
      termPrint(output, 'shortcuts: <b>about</b> · <b>resume</b> · <b>portfolio</b> · <b>blog</b> · <b>home</b>');
      return;
    default:
      termPrint(output, `command not found: <b>${cmd}</b>`, 'err');
  }
}

function initTerminal(): void {
  const input  = $<HTMLInputElement>('[data-term-input]');
  const output = $<HTMLElement>('[data-term-output]');
  const mirror = $<HTMLElement>('[data-term-mirror]');
  if (!input || !output) return;

  const syncMirror = () => { if (mirror) mirror.textContent = input.value; };

  input.addEventListener('input', syncMirror);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input.value, output);
      input.value = '';
      syncMirror();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; input.value = HISTORY[historyIdx] ?? ''; }
      syncMirror();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < HISTORY.length - 1) { historyIdx++; input.value = HISTORY[historyIdx] ?? ''; }
      else { historyIdx = HISTORY.length; input.value = ''; }
      syncMirror();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const prefix = input.value.toLowerCase();
      const candidates = ['cd', 'ls', 'pwd', 'whoami', 'lang', 'clear', 'help', 'about', 'resume', 'portfolio', 'blog', 'home']
        .filter(c => c.startsWith(prefix));
      if (candidates.length === 1) { input.value = candidates[0]; syncMirror(); }
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

  // Any printable keypress on body (nothing else focused) routes to the prompt.
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) return; // skip Shift, Tab, Arrow*, etc.
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
    input.focus();
  });

  // Click anywhere outside the terminal header blurs the prompt.
  const header = $<HTMLElement>('[data-terminal]');
  document.addEventListener('mousedown', (e) => {
    if (!header) return;
    if (header.contains(e.target as Node)) return;
    if (document.activeElement === input) input.blur();
  });

  // Auto-focus on load so visitors can just start typing.
  input.focus({ preventScroll: true });
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

// ============ POPSTATE ============

function initPopstate(): void {
  window.addEventListener('popstate', () => {
    const r = getRouteByPath(location.pathname);
    if (!r || !r.paneKey) return;
    // Skip transition on back/forward — just snap.
    $$<HTMLElement>('[data-pane-slot]').forEach(slot => {
      const isTarget = slot.dataset.paneSlot === r.paneKey;
      slot.dataset.active = String(isTarget);
      if (isTarget) slot.removeAttribute('aria-hidden');
      else slot.setAttribute('aria-hidden', 'true');
    });
    $$<HTMLAnchorElement>('[data-rail-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.key === r.paneKey);
    });
    const sectorEl = $<HTMLElement>('[data-rail-sector]');
    if (sectorEl) sectorEl.textContent = r.sector;

    // Restore terminal status strip + prompt path so they match the URL.
    const statusPath = $<HTMLElement>('[data-term-status-path]');
    const statusSector = $<HTMLElement>('[data-term-status-sector]');
    const promptPath = $<HTMLElement>('[data-term-path]');
    if (statusPath)   statusPath.textContent   = r.pathname === '/' ? '/about' : r.pathname.replace(/\/$/, '');
    if (statusSector) statusSector.textContent = r.sector + '/04';
    if (promptPath)   promptPath.textContent   = r.pathname === '/' ? '~/about' : '~' + r.pathname.replace(/\/$/, '');
  });
}

// ============ I18N + LANG GLITCH ============

const LANG_KEY = 'lang';

function getLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    if (raw && (LANGS as string[]).includes(raw)) return raw as Lang;
  } catch {/* localStorage blocked */}
  return 'en';
}
function setLang(l: Lang): void {
  try { localStorage.setItem(LANG_KEY, l); } catch {/* ignore */}
  document.documentElement.lang = l;
  applyLang(l);
}

function lookupT(key: string, lang: Lang): string | undefined {
  return T[key]?.[lang] ?? T[key]?.en;
}
function lookupTH(key: string, lang: Lang): string | undefined {
  return TH[key]?.[lang] ?? TH[key]?.en;
}

// Deterministic 0..1 hash of the i18n key, used to decide which elements
// glitch. Stable across reloads so the same elements always burst.
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// Roughly this fraction of i18n elements get the strobe burst. The rest
// language-switch silently — keeps the motif sparse instead of frenetic.
const GLITCH_FRACTION = 0.35;

function shouldGlitch(key: string): boolean {
  return hash01(key) < GLITCH_FRACTION;
}

// Wrap an i18n element with .lang-glitch structure (idempotent).
// `mode='text'` swaps textContent on the inner spans; `mode='html'` swaps
// innerHTML and uses the block-layout variant so multi-line prose lines up.
function ensureGlitchStructure(
  el: HTMLElement,
  mode: 'text' | 'html' = 'text'
): { primary: HTMLElement; alt: HTMLElement } {
  let primary = el.querySelector<HTMLElement>(':scope > .lg-primary');
  let alt     = el.querySelector<HTMLElement>(':scope > .lg-alt');
  if (!primary || !alt) {
    primary = document.createElement(mode === 'html' ? 'span' : 'span');
    primary.className = 'lg-primary';
    if (mode === 'html') {
      primary.innerHTML = el.innerHTML;
    } else {
      primary.textContent = el.textContent ?? '';
    }
    alt = document.createElement('span');
    alt.className = 'lg-alt';
    alt.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.appendChild(primary);
    el.appendChild(alt);
    el.classList.add('lang-glitch');
    if (mode === 'html') el.classList.add('lang-glitch-block');
    // Random delay so bursts stagger across the page (0–11s).
    const d = (Math.random() * 11).toFixed(2) + 's';
    primary.style.animationDelay = d;
    alt.style.animationDelay = d;
  }
  return { primary, alt };
}

function applyLang(lang: Lang): void {
  const alt = altLang(lang);

  // Plain text nodes: [data-i18n="key"]
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n!;
    const main = lookupT(key, lang);
    const altText = lookupT(key, alt);
    if (main === undefined) return;
    if (el.hasAttribute('data-i18n-noglitch')) {
      el.textContent = main;
      return;
    }
    // Always wrap so .lg-primary is a consistent target for alignment.
    // Non-glitching elements get .lang-glitch-still to disable the strobe.
    const parts = ensureGlitchStructure(el);
    parts.primary.textContent = main;
    parts.alt.textContent = altText ?? main;
    el.classList.toggle('alt-en', alt === 'en');
    el.classList.toggle('lang-glitch-still', !shouldGlitch(key));
  });

  // Inline-HTML nodes: [data-i18n-html="key"] — same glitch hold/transition,
  // but swap innerHTML instead of textContent.
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml!;
    const main = lookupTH(key, lang);
    const altHtml = lookupTH(key, alt);
    if (main === undefined) return;
    const parts = ensureGlitchStructure(el, 'html');
    parts.primary.innerHTML = main;
    parts.alt.innerHTML = altHtml ?? main;
    el.classList.toggle('alt-en', alt === 'en');
    el.classList.toggle('lang-glitch-still', !shouldGlitch(key));
  });

  // Name flicker: when active is ZH, swap which span is primary.
  document.querySelectorAll<HTMLElement>('.name-glitch').forEach(el => {
    el.classList.toggle('name-zh-primary', lang === 'zh');
  });
}

function initI18n(): void {
  const l = getLang();
  document.documentElement.lang = l;
  applyLang(l);
}

// ============ BOOT ============

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initTerminal();
  initRail();
  initDetailLinks();
  initPopstate();
});
