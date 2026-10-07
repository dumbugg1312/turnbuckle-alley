/** Low-level pixel drawing helpers shared by every renderer. */

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return c;
}

export function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  return x;
}

export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

/** Horizontal/vertical/diagonal pixel line (Bresenham). */
export function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  ctx.fillStyle = color;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** Filled pixel circle/ellipse. */
export function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string): void {
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.0001))));
    ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
  }
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Ordered dither between two colors; t in 0..1 is the share of color b. */
export function dither(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: string, b: string, t: number | ((xx: number, yy: number) => number)): void {
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const tv = typeof t === 'number' ? t : t(xx, yy);
      const thr = (BAYER4[(y + yy) & 3][(x + xx) & 3] + 0.5) / 16;
      ctx.fillStyle = tv > thr ? b : a;
      ctx.fillRect(x + xx, y + yy, 1, 1);
    }
}

/** Vertical gradient using banded dithering for a crafted pixel look. */
export function gradientV(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, stops: string[]): void {
  if (stops.length === 1) return rect(ctx, x, y, w, h, stops[0]);
  const seg = h / (stops.length - 1);
  for (let i = 0; i < stops.length - 1; i++) {
    const y0 = Math.round(y + i * seg);
    const y1 = Math.round(y + (i + 1) * seg);
    dither(ctx, x, y0, w, y1 - y0, stops[i], stops[i + 1], (_xx, yy) => yy / Math.max(1, y1 - y0));
  }
}

// ---------------------------------------------------------------- colors

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (((h % 360) + 360) % 360) / 360;
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

/**
 * Hue-shifted shading: darker colors drift toward purple, lighter toward
 * warm yellow, so shadows never go muddy grey.
 */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  let nh = h;
  if (amount < 0) {
    // Pull toward 260 (purple).
    const target = 260;
    const diff = ((target - h + 540) % 360) - 180;
    nh = h + diff * Math.min(0.35, -amount * 0.6);
  } else {
    const target = 50;
    const diff = ((target - h + 540) % 360) - 180;
    nh = h + diff * Math.min(0.3, amount * 0.5);
  }
  const ns = Math.max(0, Math.min(1, s + (amount < 0 ? -amount * 0.12 : -amount * 0.15)));
  const nl = Math.max(0, Math.min(1, l + amount * (amount < 0 ? 0.55 : 0.5)));
  const [nr, ng, nb] = hslToRgb(nh, ns, nl);
  return rgbToHex(nr, ng, nb);
}

// ---------------------------------------------------------------- sprites

const spriteCache = new Map<string, HTMLCanvasElement>();

/**
 * Build a sprite from rows of palette characters. '.' and ' ' are transparent.
 * Cached by content, so it is cheap to call every frame.
 */
export function sprite(rows: string[], palette: Record<string, string>, key?: string): HTMLCanvasElement {
  const k = key ?? rows.join('|') + JSON.stringify(palette);
  const hit = spriteCache.get(k);
  if (hit) return hit;
  const w = Math.max(...rows.map((r) => r.length));
  const c = makeCanvas(w, rows.length);
  const x = ctx2d(c);
  rows.forEach((row, yy) => {
    for (let xx = 0; xx < row.length; xx++) {
      const ch = row[xx];
      if (ch === '.' || ch === ' ') continue;
      const col = palette[ch];
      if (!col) continue;
      x.fillStyle = col;
      x.fillRect(xx, yy, 1, 1);
    }
  });
  spriteCache.set(k, c);
  return c;
}

/** Return a copy of a canvas with a 1px outline around opaque pixels. */
export function outlined(src: HTMLCanvasElement, color: string, diagonals = false): HTMLCanvasElement {
  const w = src.width + 2;
  const h = src.height + 2;
  const out = makeCanvas(w, h);
  const o = ctx2d(out);
  const data = ctx2d(src).getImageData(0, 0, src.width, src.height).data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < src.width && y < src.height && data[(y * src.width + x) * 4 + 3] > 0;
  o.fillStyle = color;
  for (let y = -1; y <= src.height; y++)
    for (let x = -1; x <= src.width; x++) {
      if (solid(x, y)) continue;
      const n = solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1);
      const d = diagonals && (solid(x - 1, y - 1) || solid(x + 1, y - 1) || solid(x - 1, y + 1) || solid(x + 1, y + 1));
      if (n || d) o.fillRect(x + 1, y + 1, 1, 1);
    }
  o.drawImage(src, 1, 1);
  return out;
}

/** Flip a canvas horizontally. */
export function flipped(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = makeCanvas(src.width, src.height);
  const x = ctx2d(c);
  x.translate(src.width, 0);
  x.scale(-1, 1);
  x.drawImage(src, 0, 0);
  return c;
}

/** Tint every opaque pixel a flat color (hit flashes, silhouettes). */
export function silhouette(src: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const c = makeCanvas(src.width, src.height);
  const x = ctx2d(c);
  x.drawImage(src, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

// ---------------------------------------------------------------- tiny font

/** 3x5 pixel font for in-world signs and pop numbers. */
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111',
  '9': '111101111001110', '+': '000010111010000', '-': '000000111000000', '!': '010010010000010', '?': '110001010000010',
  '.': '000000000000010', ',': '000000000010100', "'": '010010000000000', ':': '000010000010000', '/': '001001010100100',
  '&': '010101010101011', '*': '000101010101000', '#': '101111101111101', '(': '010100100100010', ')': '010001001001010',
  '"': '101101000000000', ' ': '000000000000000', '$': '011110010011110', '%': '101001010100101', '<': '001010100010001',
  '>': '100010001010100', '=': '000111000111000', '_': '000000000000111',
};

export function textWidth(s: string, scale = 1): number {
  return s.length * 4 * scale - scale;
}

/** Draw text in the tiny pixel font. Returns width drawn. */
export function pixelText(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, color: string, scale = 1, shadow?: string): number {
  s = s.toUpperCase();
  x = Math.round(x);
  y = Math.round(y);
  if (shadow) pixelText(ctx, s, x + scale, y + scale, shadow, scale);
  ctx.fillStyle = color;
  for (let i = 0; i < s.length; i++) {
    const g = GLYPHS[s[i]] ?? GLYPHS['?'];
    for (let p = 0; p < 15; p++) if (g[p] === '1') ctx.fillRect(x + i * 4 * scale + (p % 3) * scale, y + Math.floor(p / 3) * scale, scale, scale);
  }
  return textWidth(s, scale);
}

/** Outlined pixel text (for pops over busy backgrounds). */
export function pixelTextOutlined(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, color: string, outline: string, scale = 1): void {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) pixelText(ctx, s, x + dx, y + dy, outline, scale);
  pixelText(ctx, s, x, y, color, scale);
}
