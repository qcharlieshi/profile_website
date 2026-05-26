// Manual-switch i18n with EN as default render language.
// Active lang is a runtime state (localStorage), swapped by the terminal `lang`
// command. Pages render in EN at build time; on hydration, site.ts swaps
// textContent / innerHTML for every [data-i18n] / [data-i18n-html] element.

export type Lang = 'en' | 'zh' | 'es';

export const LANGS: Lang[] = ['en', 'zh', 'es'];
export const LANG_LABEL: Record<Lang, string> = {
  en: 'ENGLISH',
  zh: '中文',
  es: 'ESPAÑOL',
};

// For glitch: if active is EN, alt is ZH; otherwise alt is EN.
export function altLang(active: Lang): Lang {
  return active === 'en' ? 'zh' : 'en';
}

type Entry = Record<Lang, string>;

// Plain-text translations (textContent swap).
export const T: Record<string, Entry> = {
  // ===== Terminal =====
  'term.cmd':    { en: 'CMD',    zh: '命令', es: 'CMD' },
  'term.path':   { en: 'PATH',   zh: '路径', es: 'RUTA' },
  'term.sector': { en: 'SECTOR', zh: '扇区', es: 'SECTOR' },
  'term.commit': { en: 'COMMIT', zh: '提交', es: 'COMMIT' },
  'term.hint':   { en: '↵ EXEC · ESC · TAB', zh: '↵ 执行 · 退出 · 跳格', es: '↵ EJEC · ESC · TAB' },

  // ===== Hero chrome =====
  'hero.sys':    { en: '// PORTFOLIO.SYS — REV 2026.05', zh: '// 作品集系统 — 版本 2026.05', es: '// PORTAFOLIO.SYS — REV 2026.05' },
  'hero.commit': { en: 'LATEST COMMIT', zh: '最近提交', es: 'ÚLT. COMMIT' },
  'hero.role':   { en: 'STAFF AI ENGINEER', zh: '资深 AI 工程师', es: 'INGENIERO IA SR' },

  // ===== Meta bar =====
  'meta.loc':       { en: '↳ BOSTON, MA',     zh: '↳ 美国 波士顿',   es: '↳ BOSTON, EE.UU.' },
  'meta.enter':     { en: '↗ ENTER',          zh: '↗ 进入',         es: '↗ ENTRAR' },
  'meta.download':  { en: '↗ DOWNLOAD PDF',   zh: '↗ 下载 PDF',     es: '↗ DESCARGAR PDF' },
  'meta.github':    { en: '↗ GITHUB',         zh: '↗ GITHUB',       es: '↗ GITHUB' },
  'meta.medium':    { en: '↗ MEDIUM',         zh: '↗ MEDIUM',       es: '↗ MEDIUM' },

  // ===== Right rail =====
  'rail.sector':    { en: '// SECTOR',    zh: '// 扇区',     es: '// SECTOR' },
  'rail.about':     { en: 'ABOUT',        zh: '关于',        es: 'SOBRE' },
  'rail.resume':    { en: 'RESUME',       zh: '简历',        es: 'CV' },
  'rail.portfolio': { en: 'PORTFOLIO',    zh: '作品集',      es: 'PORTAFOLIO' },
  'rail.blog':      { en: 'BLOG',         zh: '博客',        es: 'BLOG' },

  // ===== About pane =====
  'about.label':    { en: '// ABOUT',     zh: '// 关于',     es: '// SOBRE' },
  'about.now':      { en: '// NOW',       zh: '// 当前',     es: '// AHORA' },
  'about.now.1':    { en: 'Agent-MCP orchestration @ LILT', zh: '在 LILT 做 Agent-MCP 编排', es: 'Orquestación Agent-MCP en LILT' },
  'about.now.2':    { en: 'ML infra · vLLM · eval harnesses', zh: 'ML 基础设施 · vLLM · 评测框架', es: 'Infra ML · vLLM · arneses de eval' },
  'about.now.3':    { en: 'Personal · terminal-led site',  zh: '个人 · 终端风站点',  es: 'Personal · sitio tipo terminal' },

  'about.stat.years':    { en: 'Years',    zh: '年限',  es: 'Años' },
  'about.stat.stack':    { en: 'Stack',    zh: '技术',  es: 'Stack' },
  'about.stat.focus':    { en: 'Focus',    zh: '方向',  es: 'Foco' },
  'about.stat.location': { en: 'Location', zh: '位置',  es: 'Ubicación' },
  'about.stat.status':   { en: 'Status',   zh: '状态',  es: 'Estado' },

  'about.stat.location.v': { en: 'ANDOVER, MA', zh: '安多弗，麻州', es: 'ANDOVER, MA' },
  'about.stat.status.v':   { en: 'BUILDING',    zh: '建设中',       es: 'CONSTRUYENDO' },
  'about.stat.focus.v':    { en: 'AGENT · MCP', zh: '智能体 · MCP', es: 'AGENTE · MCP' },

  'about.link.github':   { en: 'GITHUB ↗',   zh: 'GITHUB ↗',   es: 'GITHUB ↗' },
  'about.link.linkedin': { en: 'LINKEDIN ↗', zh: 'LINKEDIN ↗', es: 'LINKEDIN ↗' },
  'about.link.email':    { en: 'EMAIL ↗',    zh: '邮箱 ↗',     es: 'EMAIL ↗' },

  // ===== Resume pane =====
  'resume.label':      { en: '// RESUME · 11Y · SCROLL ↓', zh: '// 简历 · 11 年 · 滚动 ↓', es: '// CV · 11A · DESPLAZAR ↓' },
  'resume.experience': { en: '// EXPERIENCE', zh: '// 经历',    es: '// EXPERIENCIA' },
  'resume.stack':      { en: '// STACK',      zh: '// 技术栈',  es: '// STACK' },
  'resume.education':  { en: '// EDUCATION',  zh: '// 教育',    es: '// EDUCACIÓN' },

  'resume.role.staff':      { en: 'STAFF AI ENGINEER',    zh: '资深 AI 工程师',     es: 'INGENIERO IA SR' },
  'resume.role.fullstack':  { en: 'SR FULLSTACK ENG',     zh: '资深全栈工程师',     es: 'ING. FULLSTACK SR' },
  'resume.role.uiux':       { en: 'SOFTWARE ENG · UI/UX', zh: '软件工程师 · UI/UX', es: 'ING. SOFTWARE · UI/UX' },
  'resume.role.pm':         { en: 'PM · CONSULTANT',      zh: '产品经理 · 顾问',    es: 'PM · CONSULTOR' },
  'resume.role.edu':        { en: 'BBA · FIN + ORG MGMT', zh: '工商管理学士 · 金融与组织管理', es: 'BBA · FIN + GESTIÓN ORG.' },

  // ===== Section dividers =====
  'sec.portfolio': { en: 'PORTFOLIO', zh: '作品集',  es: 'PORTAFOLIO' },
  'sec.blog':      { en: 'BLOG',      zh: '博客',    es: 'BLOG' },

  // ===== Portfolio / Blog panes =====
  'portfolio.label': { en: '// PORTFOLIO', zh: '// 作品集', es: '// PORTAFOLIO' },
  'blog.label':      { en: '// BLOG',      zh: '// 博客',   es: '// BLOG' },
  'blog.empty':    { en: '// NO POSTS FOUND — CHECK MEDIUM FEED', zh: '// 未找到文章 — 请检查 MEDIUM 源', es: '// SIN PUBLICACIONES — REVISAR MEDIUM' },

  // ===== Terminal command output =====
  'term.help.cmds':     { en: 'commands:', zh: '命令：',      es: 'comandos:' },
  'term.help.shortcuts':{ en: 'shortcuts:', zh: '快捷：',     es: 'atajos:' },
  'term.whoami':        { en: 'charlie shi — staff ai engineer @ lilt', zh: '石千里 — LILT 资深 AI 工程师', es: 'charlie shi — ingeniero ia sr @ lilt' },
};

// Translations that contain inline HTML — innerHTML swap.
export const TH: Record<string, Entry> = {
  'about.prose': {
    en: `Building <code>Agent-MCP</code> orchestration and ML infrastructure at
      <a href="https://lilt.com" target="_blank" rel="noopener">LILT</a>.
      Boston native, currently in Andover, MA. Heavy bias toward shipping;
      allergic to abstractions that don't pay for themselves. Background spans
      fullstack ↗ ML infra ↗ agent platforms.`,
    zh: `在 <a href="https://lilt.com" target="_blank" rel="noopener">LILT</a>
      构建 <code>Agent-MCP</code> 编排与 ML 基础设施。
      土生土长的波士顿人，目前在马萨诸塞州安多弗。
      偏向交付；对不能自我证明价值的抽象过敏。
      背景跨越全栈 ↗ ML 基础设施 ↗ 智能体平台。`,
    es: `Construyendo orquestación de <code>Agent-MCP</code> e infraestructura ML en
      <a href="https://lilt.com" target="_blank" rel="noopener">LILT</a>.
      Nativo de Boston, actualmente en Andover, MA. Fuerte sesgo hacia entregar;
      alérgico a abstracciones que no se justifican. Mi experiencia abarca
      fullstack ↗ infra ML ↗ plataformas de agentes.`,
  },
};

export function t(key: string, lang: Lang = 'en'): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}
export function th(key: string, lang: Lang = 'en'): string {
  return TH[key]?.[lang] ?? TH[key]?.en ?? key;
}
