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

    // Restore terminal status strip + prompt path so they match the URL.
    const statusPath = $<HTMLElement>('[data-term-status-path]');
    const statusSector = $<HTMLElement>('[data-term-status-sector]');
    const promptPath = $<HTMLElement>('[data-term-path]');
    if (statusPath)   statusPath.textContent   = r.pathname === '/' ? '/about' : r.pathname.replace(/\/$/, '');
    if (statusSector) statusSector.textContent = r.sector + '/04';
    if (promptPath)   promptPath.textContent   = r.pathname === '/' ? '~/about' : '~' + r.pathname.replace(/\/$/, '');
  });
}

// ============ BOOT ============

document.addEventListener('DOMContentLoaded', () => {
  initTerminal();
  initRail();
  initPopstate();
});
