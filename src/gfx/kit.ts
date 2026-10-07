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
  /** Buffer size in fine pixels (logical size x k). */
  w: number;
  h: number;
  d: Uint32Array<ArrayBufferLike>;
  name?: string;
  /** Density: fine pixels per logical (world) pixel. Missing = 1. */
  k?: number;
}

// ---------- density (DECISIONS.md D-018) ----------
/**
 * Sprites built inside dense(2, ...) get a buffer twice as fine. Every
 * primitive keeps taking LOGICAL (world-pixel) coordinates, so old drawing
 * code renders the same, ellipses and polygons come out smoother, and new
 * detail can sit on half-pixels: fractional coordinates, P1() for a single
 * fine pixel, and the live FX/FY (fine pixel coordinates) inside paint
 * callbacks. Paint callbacks still get whole logical x, y, so existing
 * patterns and dithers don't change. Canvases from dense sprites are tagged,
 * and drawImage() treats them at their logical size, so draw calls stay in
 * world pixels. Use lw()/lh() for a canvas's logical size.
 */
let KD = 1;
/** Fine pixel coordinates of the pixel a paint callback is being asked about. */
export let FX = 0;
export let FY = 0;
/** Current build density (1 outside dense()). */
export function density(): number {
  return KD;
}
/** Build sprites at density k inside fn (nests; restores after). */
export function dense<T>(k: number, fn: () => T): T {
  const prev = KD;
  KD = Math.max(1, Math.round(k));
  try {
    return fn();
  } finally {
    KD = prev;
  }
}
type Dense = { __k?: number };
/** Logical width/height of a canvas (dense canvases are k times bigger). */
export const lw = (c: HTMLCanvasElement): number => c.width / ((c as Dense).__k ?? 1);
export const lh = (c: HTMLCanvasElement): number => c.height / ((c as Dense).__k ?? 1);
export const kOf = (c: CanvasImageSource): number => ((c as Dense).__k ?? 1);
if (typeof CanvasRenderingContext2D !== 'undefined' && !(CanvasRenderingContext2D.prototype as unknown as { __kPatched?: boolean }).__kPatched) {
  const proto = CanvasRenderingContext2D.prototype as unknown as { __kPatched: boolean; drawImage: (...a: unknown[]) => void };
  const orig = proto.drawImage;
  proto.__kPatched = true;
  proto.drawImage = function (this: CanvasRenderingContext2D, ...a: unknown[]) {
    const img = a[0] as HTMLCanvasElement & Dense;
    const k = img && img.__k;
    if (k && k > 1) {
      if (a.length === 3) return orig.call(this, img, a[1], a[2], img.width / k, img.height / k);
      if (a.length === 9) return orig.call(this, img, (a[1] as number) * k, (a[2] as number) * k, (a[3] as number) * k, (a[4] as number) * k, a[5], a[6], a[7], a[8]);
    }
    return orig.apply(this, a);
  };
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
  CX0 = Math.max(0, Math.floor(x * KD));
  CY0 = Math.max(0, Math.floor(y * KD));
  CX1 = Math.min(TWD, Math.floor((x + w) * KD));
  CY1 = Math.min(THT, Math.floor((y + h) * KD));
}
export function noclip(): void {
  CX0 = 0;
  CY0 = 0;
  CX1 = TWD;
  CY1 = THT;
}

/** Build a sprite procedurally: fn draws with the primitives into a w x h buffer (0 = transparent). */
export function mkSpr(w: number, h: number, fn: (s: Spr) => void, name?: string): Spr {
  const k = KD;
  const fw = Math.ceil(w * k);
  const fh = Math.ceil(h * k);
  const s: Spr = { w: fw, h: fh, d: new Uint32Array(fw * fh), name };
  if (k > 1) s.k = k;
  const sv = [TB, TWD, THT, CX0, CY0, CX1, CY1] as const;
  TB = s.d;
  TWD = fw;
  THT = fh;
  CX0 = 0;
  CY0 = 0;
  CX1 = fw;
  CY1 = fh;
  try {
    fn(s);
  } finally {
    [TB, TWD, THT, CX0, CY0, CX1, CY1] = sv as unknown as [Uint32Array<ArrayBufferLike>, number, number, number, number, number, number];
  }
  return s;
}

// ---------- primitives ----------
/** Write one fine pixel (fine coordinates); callbacks get logical coords. */
function put(fx: number, fy: number, c: Paint): void {
  if (fx < CX0 || fy < CY0 || fx >= CX1 || fy >= CY1) return;
  const i = fy * TWD + fx;
  if (typeof c === 'function') {
    FX = fx;
    FY = fy;
    const v = KD === 1 ? c(fx, fy, TB[i]) : c(Math.floor(fx / KD), Math.floor(fy / KD), TB[i]);
    if (v != null) TB[i] = col(v);
  } else TB[i] = typeof c === 'number' ? c : col(c as Color);
}
export function P(x: number, y: number, c: Paint): void {
  if (c == null) return;
  if (KD === 1) {
    put(Math.floor(x), Math.floor(y), c);
    return;
  }
  const fx = Math.floor(x * KD);
  const fy = Math.floor(y * KD);
  for (let j = 0; j < KD; j++) for (let i = 0; i < KD; i++) put(fx + i, fy + j, c);
}
/** One fine pixel at logical (x, y), e.g. P1(10.5, 3, c) on a density-2 sprite. */
export function P1(x: number, y: number, c: Paint): void {
  if (c == null) return;
  put(Math.floor(x * KD), Math.floor(y * KD), c);
}
/** Read a pixel from the current target (logical coords; fractional reach fine pixels). */
export function GP(x: number, y: number): number {
  const fx = Math.floor(x * KD);
  const fy = Math.floor(y * KD);
  if (fx < 0 || fy < 0 || fx >= TWD || fy >= THT) return 0;
  return TB[fy * TWD + fx];
}
export function R(x: number, y: number, w: number, h: number, c: Paint): void {
  if (c == null) return;
  const x0 = Math.max(CX0, Math.floor(x * KD));
  const y0 = Math.max(CY0, Math.floor(y * KD));
  const x1 = Math.min(CX1, Math.floor((x + w) * KD));
  const y1 = Math.min(CY1, Math.floor((y + h) * KD));
  if (x1 <= x0) return;
  if (typeof c === 'function') {
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) put(xx, yy, c);
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
  // Scan-convert on the fine grid (KD = 1 is the classic behaviour).
  const K = KD;
  y0 = Math.max(CY0, Math.floor(y0 * K));
  y1 = Math.min(CY1 - 1, Math.ceil(y1 * K));
  const xs: number[] = [];
  for (let y = y0; y <= y1; y++) {
    const yc = (y + 0.5) / K;
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
      const xa = Math.ceil(xs[k] * K - 0.5);
      const xb = Math.floor(xs[k + 1] * K - 0.5);
      for (let x = xa; x <= xb; x++) put(x, y, c);
    }
  }
}
export function ell(cx: number, cy: number, rx: number, ry: number, c: Paint): void {
  if (c == null) return;
  const K = KD;
  for (let y = Math.floor((cy - ry) * K); y <= Math.ceil((cy + ry) * K); y++)
    for (let x = Math.floor((cx - rx) * K); x <= Math.ceil((cx + rx) * K); x++) {
      const dx = ((x + 0.5) / K - cx) / rx;
      const dy = ((y + 0.5) / K - cy) / ry;
      if (dx * dx + dy * dy <= 1) put(x, y, c);
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
  const flip = o?.flip;
  const fn = o?.fn;
  const sk = s.k ?? 1;
  if (sk === KD && KD > 1) {
    // Same density: copy fine pixels; fn sees logical coords.
    const fx0 = Math.round(x * KD);
    const fy0 = Math.round(y * KD);
    for (let yy = 0; yy < s.h; yy++)
      for (let xx = 0; xx < s.w; xx++) {
        const c = s.d[yy * s.w + (flip ? s.w - 1 - xx : xx)];
        if (!c) continue;
        const fx = fx0 + xx;
        const fy = fy0 + yy;
        put(fx, fy, fn ? fn(c, Math.floor(fx / KD), Math.floor(fy / KD)) : c);
      }
    return;
  }
  if (sk > 1) {
    // A dense sprite into a coarser target: sample it.
    const step = sk / KD;
    s = { w: Math.floor(s.w / step), h: Math.floor(s.h / step), d: sampleDown(s, step) };
  }
  x = Math.round(x);
  y = Math.round(y);
  for (let yy = 0; yy < s.h; yy++)
    for (let xx = 0; xx < s.w; xx++) {
      const c = s.d[yy * s.w + (flip ? s.w - 1 - xx : xx)];
      if (!c) continue;
      P(x + xx, y + yy, fn ? fn(c, x + xx, y + yy) : c);
    }
}
function sampleDown(s: Spr, step: number): Uint32Array {
  const w = Math.floor(s.w / step);
  const h = Math.floor(s.h / step);
  const d = new Uint32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d[y * w + x] = s.d[Math.floor(y * step) * s.w + Math.floor(x * step)];
  return d;
}
export function stamp(rows: string | string[], pal: Record<string, Color | [Color, Color, number] | null>, x: number, y: number, o?: { flip?: boolean }): void {
  DS(SP(rows, pal), x, y, o);
}
/**
 * Add a 1px outline whose color depends on the neighboring fill color
 * (selective outlining). fn(fill, side) where side = 'lit' or 'dark'.
 */
export function OUT(s: Spr, fn: (c: number, side: 'lit' | 'dark', x: number, y: number) => Color = selA, diag = false): Spr {
  const k = s.k ?? 1;
  if (k > 1) return outDense(s, k, fn, diag);
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
/**
 * Dense selective outline: k fine pixels thick, so the line weight matches
 * the world's 1-pixel outlines. The first ring picks its colour like OUT();
 * outer rings repeat the ring colour next to them. Pads by k fine pixels.
 */
function outDense(s: Spr, k: number, fn: (c: number, side: 'lit' | 'dark', x: number, y: number) => Color, diag: boolean): Spr {
  const w = s.w + 2 * k;
  const h = s.h + 2 * k;
  const d = new Uint32Array(w * h);
  const ring = new Uint8Array(w * h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[(y + k) * w + x + k] = s.d[y * s.w + x];
  for (let r = 1; r <= k; r++) {
    const src = d.slice();
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src[y * w + x]);
    const isRing = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && ring[y * w + x] > 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (src[y * w + x]) continue;
        const nb: [number, number, 'lit' | 'dark'][] = [[x, y - 1, 'dark'], [x - 1, y, 'dark'], [x + 1, y, 'lit'], [x, y + 1, 'lit']];
        if (diag) nb.push([x - 1, y - 1, 'dark'], [x + 1, y - 1, 'dark'], [x - 1, y + 1, 'dark'], [x + 1, y + 1, 'dark']);
        for (const [nx, ny, side] of nb) {
          const n = at(nx, ny);
          if (!n) continue;
          if (r === 1) d[y * w + x] = col(fn(n, side, Math.floor(x / k), Math.floor(y / k)));
          else if (isRing(nx, ny)) d[y * w + x] = n;
          else continue;
          ring[y * w + x] = r;
          break;
        }
      }
  }
  return { w, h, d, name: s.name, k };
}

/** Rotate 90 degrees counter-clockwise. */
export function rotL(s: Spr): Spr {
  const d = new Uint32Array(s.w * s.h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[(s.w - 1 - x) * s.h + y] = s.d[y * s.w + x];
  return { w: s.h, h: s.w, d, name: s.name, k: s.k };
}
export function recolor(s: Spr, map: Record<string, Color>): Spr {
  const m = new Map(Object.entries(map).map(([a, b]) => [col(a), col(b)]));
  return { w: s.w, h: s.h, d: s.d.map((c) => (m.has(c) ? m.get(c)! : c)), name: s.name, k: s.k };
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
  if (s.k && s.k > 1) (c as Dense).__k = s.k;
  return c;
}

const canvasCache = new Map<string, HTMLCanvasElement>();
/**
 * Build-and-cache helper: draw a sprite once with the kit primitives and get a
 * canvas back. Key must uniquely describe the sprite (include colors/variants).
 */
export function sprite(key: string, w: number, h: number, fn: (s: Spr) => void, opts: { outline?: boolean | ((c: number, side: 'lit' | 'dark', x: number, y: number) => Color); diag?: boolean } = {}): HTMLCanvasElement {
  key = KD > 1 ? `${key}@${KD}` : key;
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
