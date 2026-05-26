/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-surface': '#141416',
        'bg-elevated': '#1c1c1f',
        'text-primary': '#e8e8e8',
        'text-secondary': '#8a8a90',
        'accent-cyan': '#00f0ff',
        'accent-magenta': '#ff2d6b',
        'accent-yellow': '#ffd23f',
        'accent-blue': '#1860ff',
        'border-default': '#2a2a2e',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-links': '#ffd23f',
            '--tw-prose-code': '#e8e8e8',
            '--tw-prose-pre-bg': '#141416',
            '--tw-prose-pre-code': '#e8e8e8',
            '--tw-prose-quotes': '#e8e8e8',
            '--tw-prose-quote-borders': '#ffd23f',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
