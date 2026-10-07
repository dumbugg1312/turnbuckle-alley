/**
 * The Turnbuckle Alley pixel kit: the drawing toolkit the art direction
 * ("Golden Hour Storybook", mockups/style-a.html) was made with, ported for the
 * game. Sprites are built procedurally into Uint32 buffers with these
 * primitives, then converted once to canvases with toCanvas() and cached.
 *
 * Usage:
 *   const tree = sprite(24, 32, () => { ell(12, 10, 10, 9, '#3f8a5a'); R(11, 18, 3, 14, '#6a4030'); });
 *   ctx.drawImage(tree, x, y);
 */

export type Color = string | number;
export type Paint = Color | ((x: number, y: number, old: number) => Color | null | undefined) | null | undefined;
export interface Spr {
  w: number;
  h: number;
  d: Uint32Array<ArrayBufferLike>;
  name?: string;
}

// ---------- colour helpers (buffers are little-endian ABGR) ----------
const _cc = new Map<string, number>();
export function col(h: Color): number {
  if (typeof h === 'number') return h;
  let c = _cc.get(h);
  if (c !== undefined) return c;
  let s = h.charAt(0) === '#' ? h.slice(1) : h;
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const n = parseInt(s, 16);
  c = (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | ((n >>> 16) & 255)) >>> 0;
  _cc.set(h, c);
  return c;
}
export const cR = (c: number) => c & 255;
export const cG = (c: number) => (c >>> 8) & 255;
export const cB = (c: number) => (c >>> 16) & 255;
export function pk(r: number, g: number, b: number): number {
  r = r < 0 ? 0 : r > 255 ? 255 : r | 0;
  g = g < 0 ? 0 : g > 255 ? 255 : g | 0;
  b = b < 0 ? 0 : b > 255 ? 255 : b | 0;
  return (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
}
export function hex(c: Color): string {
  const n = col(c);
  return '#' + [cR(n), cG(n), cB(n)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
export function mixc(a: Color, b: Color, t: number): number {
  const A = col(a);
  const B = col(b);
  return pk(cR(A) + (cR(B) - cR(A)) * t, cG(A) + (cG(B) - cG(A)) * t, cB(A) + (cB(B) - cB(A)) * t);
}
export function mul(a: Color, b: Color): number {
  const A = col(a);
  const B = col(b);
  return pk((cR(A) * cR(B)) / 255, (cG(A) * cG(B)) / 255, (cB(A) * cB(B)) / 255);
}
export function scr(a: Color, b: Color): number {
  const A = col(a);
  const B = col(b);
  return pk(255 - ((255 - cR(A)) * (255 - cR(B))) / 255, 255 - ((255 - cG(A)) * (255 - cG(B))) / 255, 255 - ((255 - cB(A)) * (255 - cB(B))) / 255);
}
export function lum(c: Color): number {
  const n = col(c);
  return (cR(n) * 0.3 + cG(n) * 0.59 + cB(n) * 0.11) / 255;
}

/** Deepest plum "ink". Never use pure black. */
export const AK = '#2b2140';
/** Hue-shifted darken: pulls toward plum, never toward black. k 0..1. */
export function shA(c: Color, k: number): number {
  const n = col(c);
  return pk(cR(n) * (1 - k * 0.72) + 34 * k, cG(n) * (1 - k * 0.84) + 16 * k, cB(n) * (1 - k * 0.5) + 50 * k);
}
/** Warm highlight: toward butter yellow. */
export function liA(c: Color, k: number): number {
  return mixc(c, '#fff1c2', k);
}
/** Selective outline color picker for OUT(). */
export const selA = (c: number, side: 'lit' | 'dark') => (side === 'dark' ? shA(c, 0.74) : shA(c, 0.5));
export const selAsoft = (c: number, side: 'lit' | 'dark') => (side === 'dark' ? shA(c, 0.6) : shA(c, 0.36));

// ---------- render target ----------
let TB: Uint32Array<ArrayBufferLike> = new Uint32Array(1);
let TWD = 1;
let THT = 1;
let CX0 = 0;
let CY0 = 0;
let CX1 = 1;
let CY1 = 1;

export function clip(x: number, y: number, w: number, h: number): void {
  CX0 = Math.max(0, x | 0);
  CY0 = Math.max(0, y | 0);
  CX1 = Math.min(TWD, (x + w) | 0);
  CY1 = Math.min(THT, (y + h) | 0);
}
export function noclip(): void {
  CX0 = 0;
  CY0 = 0;
  CX1 = TWD;
  CY1 = THT;
}

/** Build a sprite procedurally: fn draws with the primitives into a w x h buffer (0 = transparent). */
export function mkSpr(w: number, h: number, fn: (s: Spr) => void, name?: string): Spr {
  const s: Spr = { w, h, d: new Uint32Array(w * h), name };
  const sv = [TB, TWD, THT, CX0, CY0, CX1, CY1] as const;
  TB = s.d;
  TWD = w;
  THT = h;
  CX0 = 0;
  CY0 = 0;
  CX1 = w;
  CY1 = h;
  try {
    fn(s);
  } finally {
    [TB, TWD, THT, CX0, CY0, CX1, CY1] = sv as unknown as [Uint32Array<ArrayBufferLike>, number, number, number, number, number, number];
  }
  return s;
}

// ---------- primitives ----------
export function P(x: number, y: number, c: Paint): void {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < CX0 || y < CY0 || x >= CX1 || y >= CY1 || c == null) return;
  const i = y * TWD + x;
  if (typeof c === 'function') {
    const v = c(x, y, TB[i]);
    if (v != null) TB[i] = col(v);
  } else TB[i] = typeof c === 'number' ? c : col(c);
}
/** Read a pixel from the current target. */
export function GP(x: number, y: number): number {
  x |= 0;
  y |= 0;
  if (x < 0 || y < 0 || x >= TWD || y >= THT) return 0;
  return TB[y * TWD + x];
}
export function R(x: number, y: number, w: number, h: number, c: Paint): void {
  if (c == null) return;
  const x0 = Math.max(CX0, Math.floor(x));
  const y0 = Math.max(CY0, Math.floor(y));
  const x1 = Math.min(CX1, Math.floor(x + w));
  const y1 = Math.min(CY1, Math.floor(y + h));
  if (x1 <= x0) return;
  if (typeof c === 'function') {
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) {
        const i = yy * TWD + xx;
        const v = c(xx, yy, TB[i]);
        if (v != null) TB[i] = col(v);
      }
    return;
  }
  const cc = col(c);
  for (let yy = y0; yy < y1; yy++) TB.fill(cc, yy * TWD + x0, yy * TWD + x1);
}
export function HL(x0: number, x1: number, y: number, c: Paint): void {
  if (x1 < x0) [x0, x1] = [x1, x0];
  R(x0, y, x1 - x0 + 1, 1, c);
}
export function VL(x: number, y0: number, y1: number, c: Paint): void {
  if (y1 < y0) [y0, y1] = [y1, y0];
  R(x, y0, 1, y1 - y0 + 1, c);
}
export function L(x0: number, y0: number, x1: number, y1: number, c: Paint): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    P(x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) {
      e += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      e += dx;
      y0 += sy;
    }
  }
}
export function box(x: number, y: number, w: number, h: number, c: Paint): void {
  HL(x, x + w - 1, y, c);
  HL(x, x + w - 1, y + h - 1, c);
  VL(x, y, y + h - 1, c);
  VL(x + w - 1, y, y + h - 1, c);
}
/** Rounded rectangle fill (r = corner radius 1..4). */
export function RR(x: number, y: number, w: number, h: number, r: number, c: Paint): void {
  const cut = r === 1 ? [1] : r === 2 ? [2, 1] : r === 3 ? [3, 1, 1] : r >= 4 ? [4, 2, 1, 1] : [];
  for (let yy = 0; yy < h; yy++) {
    let k = 0;
    if (yy < cut.length) k = cut[yy];
    else if (h - 1 - yy < cut.length) k = cut[h - 1 - yy];
    R(x + k, y + yy, w - 2 * k, 1, c);
  }
}
export function RRB(x: number, y: number, w: number, h: number, r: number, border: Paint, fill?: Paint): void {
  RR(x, y, w, h, r, border);
  if (fill != null) RR(x + 1, y + 1, w - 2, h - 2, Math.max(0, r - 1), fill);
}
export function poly(pts: [number, number][], c: Paint): void {
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    if (p[1] < y0) y0 = p[1];
    if (p[1] > y1) y1 = p[1];
  }
  y0 = Math.max(CY0, Math.floor(y0));
  y1 = Math.min(CY1 - 1, Math.ceil(y1));
  const xs: number[] = [];
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5;
    xs.length = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0];
      const yi = pts[i][1];
      const xj = pts[j][0];
      const yj = pts[j][1];
      if (yi > yc !== yj > yc) xs.push(xi + ((yc - yi) * (xj - xi)) / (yj - yi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.ceil(xs[k] - 0.5);
      const xb = Math.floor(xs[k + 1] - 0.5);
      for (let x = xa; x <= xb; x++) P(x, y, c);
    }
  }
}
export function ell(cx: number, cy: number, rx: number, ry: number, c: Paint): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) P(x, y, c);
    }
}
export function circ(cx: number, cy: number, r: number, c: Paint): void {
  ell(cx, cy, r, r, c);
}
/** Curved line (quadratic sag) for ropes, wires, bunting. */
export function curve(x0: number, y0: number, x1: number, y1: number, sag: number, c: Paint, cb?: (x: number, y: number, t: number, i: number) => void): void {
  const n = Math.max(2, Math.ceil(Math.abs(x1 - x0) + Math.abs(y1 - y0)));
  let px: number | null = null;
  let py: number | null = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t);
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (rx !== px || ry !== py) {
      P(rx, ry, c);
      if (cb) cb(rx, ry, t, i);
      px = rx;
      py = ry;
    }
  }
}

// ---------- dithering ----------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Ordered dither test; lvl 0..16. */
export const dth = (x: number, y: number, lvl: number) => BAYER[((y & 3) << 2) | (x & 3)] < lvl;
/** Dithered rect between two colors. */
export function DR(x: number, y: number, w: number, h: number, c1: Color, c2: Color, lvl: number): void {
  const a = col(c1);
  const b = col(c2);
  R(x, y, w, h, (xx, yy) => (dth(xx, yy, lvl) ? b : a));
}
/** Vertical gradient: stops = colors, soft = fraction of each band that dithers. */
export function VG(x: number, y: number, w: number, h: number, stops: Color[], soft = 0.5): void {
  const n = stops.length - 1;
  const cs = stops.map(col);
  for (let yy = 0; yy < h; yy++) {
    const t = (yy / Math.max(1, h - 1)) * n;
    const i = Math.min(n - 1, Math.floor(t));
    let f = t - i;
    f = Math.max(0, Math.min(1, (f - 0.5) / Math.max(0.001, soft) + 0.5));
    const a = cs[i];
    const b = cs[i + 1];
    const lvl = Math.round(f * 16);
    R(x, y + yy, w, 1, (xx, py) => (dth(xx, py, lvl) ? b : a));
  }
}
/** Apply a function to every pixel in a rect. */
export function MAP(x: number, y: number, w: number, h: number, fn: (old: number, x: number, y: number) => Color | null): void {
  R(x, y, w, h, (xx, yy, old) => fn(old, xx, yy));
}

// ---------- seeded random ----------
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const hash2 = (x: number, y: number, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// ---------- sprites ----------
/** Sprite from rows of palette chars. pal values: color | [c1, c2, ditherLevel] | null. */
export function SP(rows: string | string[], pal: Record<string, Color | [Color, Color, number] | null>, name?: string): Spr {
  if (typeof rows === 'string') rows = rows.split('\n').map((r) => r.trim()).filter((r) => r.length);
  const h = rows.length;
  let w = 0;
  for (const r of rows) w = Math.max(w, r.length);
  const d = new Uint32Array(w * h);
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const ch = r[x];
      if (ch === '.' || ch === ' ') continue;
      let v = pal[ch];
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) v = dth(x, y, v[2]) ? v[1] : v[0];
      d[y * w + x] = col(v);
    }
  });
  return { w, h, d, name };
}
/** Draw a sprite into the current target; flip mirrors; fn remaps colors. */
export function DS(s: Spr, x: number, y: number, o?: { flip?: boolean; fn?: (c: number, x: number, y: number) => number }): void {
  x = Math.round(x);
  y = Math.round(y);
  const flip = o?.flip;
  const fn = o?.fn;
  for (let yy = 0; yy < s.h; yy++)
    for (let xx = 0; xx < s.w; xx++) {
      const c = s.d[yy * s.w + (flip ? s.w - 1 - xx : xx)];
      if (!c) continue;
      P(x + xx, y + yy, fn ? fn(c, x + xx, y + yy) : c);
    }
}
export function stamp(rows: string | string[], pal: Record<string, Color | [Color, Color, number] | null>, x: number, y: number, o?: { flip?: boolean }): void {
  DS(SP(rows, pal), x, y, o);
}
/**
 * Add a 1px outline whose color depends on the neighboring fill color
 * (selective outlining). fn(fill, side) where side = 'lit' or 'dark'.
 */
export function OUT(s: Spr, fn: (c: number, side: 'lit' | 'dark', x: number, y: number) => Color = selA, diag = false): Spr {
  const w = s.w + 2;
  const h = s.h + 2;
  const d = new Uint32Array(w * h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[(y + 1) * w + x + 1] = s.d[y * s.w + x];
  const src = d.slice();
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src[y * w + x]);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (src[y * w + x]) continue;
      let n = at(x, y - 1);
      let side: 'lit' | 'dark' = 'dark';
      if (!n) {
        n = at(x - 1, y);
        side = 'dark';
      }
      if (!n) {
        n = at(x + 1, y);
        side = 'lit';
      }
      if (!n) {
        n = at(x, y + 1);
        side = 'lit';
      }
      if (!n && diag) {
        n = at(x - 1, y - 1) || at(x + 1, y - 1) || at(x - 1, y + 1) || at(x + 1, y + 1);
        side = 'dark';
      }
      if (n) d[y * w + x] = col(fn(n, side, x, y));
    }
  return { w, h, d, name: s.name };
}
/** Rotate 90 degrees counter-clockwise. */
export function rotL(s: Spr): Spr {
  const d = new Uint32Array(s.w * s.h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[(s.w - 1 - x) * s.h + y] = s.d[y * s.w + x];
  return { w: s.h, h: s.w, d, name: s.name };
}
export function recolor(s: Spr, map: Record<string, Color>): Spr {
  const m = new Map(Object.entries(map).map(([a, b]) => [col(a), col(b)]));
  return { w: s.w, h: s.h, d: s.d.map((c) => (m.has(c) ? m.get(c)! : c)), name: s.name };
}
export function eachPx(s: Spr, cb: (x: number, y: number, c: number) => void): void {
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.d[y * s.w + x]) cb(x, y, s.d[y * s.w + x]);
}

// ---------- canvas conversion ----------
/** Convert a sprite buffer to a canvas (do this once and cache). */
export function toCanvas(s: Spr): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = s.w;
  c.height = s.h;
  const x = c.getContext('2d')!;
  const img = x.createImageData(s.w, s.h);
  new Uint32Array(img.data.buffer).set(s.d);
  x.putImageData(img, 0, 0);
  return c;
}

const canvasCache = new Map<string, HTMLCanvasElement>();
/**
 * Build-and-cache helper: draw a sprite once with the kit primitives and get a
 * canvas back. Key must uniquely describe the sprite (include colors/variants).
 */
export function sprite(key: string, w: number, h: number, fn: (s: Spr) => void, opts: { outline?: boolean | ((c: number, side: 'lit' | 'dark', x: number, y: number) => Color); diag?: boolean } = {}): HTMLCanvasElement {
  const hit = canvasCache.get(key);
  if (hit) return hit;
  let s = mkSpr(w, h, fn, key);
  if (opts.outline) s = OUT(s, typeof opts.outline === 'function' ? opts.outline : selA, opts.diag);
  const c = toCanvas(s);
  canvasCache.set(key, c);
  return c;
}

/** Cached canvas from palette rows (optionally outlined). */
export function rowsCanvas(key: string, rows: string | string[], pal: Record<string, Color | [Color, Color, number] | null>, outline = false): HTMLCanvasElement {
  const hit = canvasCache.get(key);
  if (hit) return hit;
  let s = SP(rows, pal, key);
  if (outline) s = OUT(s, selA);
  const c = toCanvas(s);
  canvasCache.set(key, c);
  return c;
}
