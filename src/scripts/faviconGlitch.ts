// Animated favicon: chromatic-split ("TikTok glitch") loop on the 石 glyph.
// Renders frames to an offscreen canvas and swaps the <link rel="icon"> href
// each tick. The static favicon.svg / favicon.ico in the HTML head remain the
// no-JS fallback; we only upgrade to the animated version once this runs.
// Honors prefers-reduced-motion (renders one clean frame, no loop) and pauses
// while the tab is hidden to spare CPU/battery.

const SIZE = 64;
const CX = SIZE / 2;
const CY = SIZE / 2 + 2; // optical nudge for the glyph's heavy base
const GLYPH = '石';
const FONT =
  '600 52px "PingFang SC","Hiragino Sans GB","Microsoft YaHei","Heiti SC","Noto Sans CJK SC",sans-serif';

const YELLOW = '#ffd23f';
const DARK = '#0a0a0a';
const RED = 'rgba(255,42,60,0.6)';
const BLUE = 'rgba(24,96,255,0.6)';

let timer: number | undefined;
let frame = 0;

function iconLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>('link#fav-glitch');
  if (!link) {
    // Drop the static icon links so the animated one takes precedence.
    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      .forEach((n) => n.remove());
    link = document.createElement('link');
    link.id = 'fav-glitch';
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
  }
  return link;
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  color: string,
  dx: number,
  dy: number,
): void {
  ctx.fillStyle = color;
  ctx.fillText(GLYPH, CX + dx, CY + dy);
}

function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, link: HTMLLinkElement): void {
  frame++;

  // Calm most frames; periodic stronger glitch bursts.
  const burst = frame % 11 === 0 || frame % 17 === 0;
  const amp = burst ? 3 + Math.random() * 3 : Math.random() * 1.2;
  const jitter = () => (Math.random() - 0.5) * 2;

  ctx.fillStyle = YELLOW;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = FONT;

  // Chromatic ghosts split horizontally, dark base glyph on top.
  drawGlyph(ctx, RED, -amp + jitter(), jitter() * 0.4);
  drawGlyph(ctx, BLUE, amp + jitter(), jitter() * 0.4);
  drawGlyph(ctx, DARK, jitter() * amp * 0.3, 0);

  // Clipped band: displace a horizontal slice on burst frames.
  if (burst) {
    const bandY = Math.floor(Math.random() * (SIZE - 14));
    const bandH = 6 + Math.floor(Math.random() * 10);
    const shift = (Math.random() - 0.5) * 14;
    ctx.drawImage(canvas, 0, bandY, SIZE, bandH, shift, bandY, SIZE, bandH);
  }

  link.href = canvas.toDataURL('image/png');
}

function init(): void {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const link = iconLink();

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // Single clean frame, no animation.
    ctx.fillStyle = YELLOW;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = FONT;
    drawGlyph(ctx, DARK, 0, 0);
    link.href = canvas.toDataURL('image/png');
    return;
  }

  const tick = () => render(ctx, canvas, link);
  const start = () => {
    if (timer === undefined) timer = window.setInterval(tick, 90);
  };
  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  tick();
  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
