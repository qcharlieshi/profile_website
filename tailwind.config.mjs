/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-surface': '#141414',
        'bg-elevated': '#1e1e1e',
        'text-primary': '#e8e8e8',
        'text-secondary': '#888888',
        'accent-cyan': '#00f0ff',
        'accent-magenta': '#ff2d6b',
        'accent-yellow': '#ffd23f',
        'border-default': '#2a2a2a',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-links': '#00f0ff',
            '--tw-prose-code': '#e8e8e8',
            '--tw-prose-pre-bg': '#141414',
            '--tw-prose-pre-code': '#e8e8e8',
            '--tw-prose-quotes': '#e8e8e8',
            '--tw-prose-quote-borders': '#00f0ff',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
