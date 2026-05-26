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
