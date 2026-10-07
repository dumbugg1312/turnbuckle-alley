import { cB, cG, col, cR, liA, mixc, OUT, P, shA, type Color, type Spr } from '../kit';
import { ramp, tone, type MatKind, type Ramp } from './palette';

/**
 * Layered raster for the character art.
 *
 * Every body part is painted into the current sprite buffer while a parallel
 * buffer records which layer each pixel belongs to and whether it is a decal
 * (eyes, glints) that lighting must leave alone. Forms are shaded at paint
 * time from their material ramps (limbs as cylinders, heads as spheres, torsos
 * as lit slabs); the light pass afterwards only adds what needs neighbours:
 * contact shadows where a front part covers a back part, contour lines where
 * same-coloured parts overlap and a thin rim light on top-left edges. Finally
 * the selective outline is added and convex corners are anti-aliased.
 */
export interface Mat {
  /** Shade strength for contact shadows cast onto this layer. */
  sh: number;
  /** Rim-light strength on the top edge (0 = none). */
  hl: number;
  /** Also rim-light the left edge. */
  hlLeft: boolean;
  /** Shade the right edge band this many pixels (0 = none; forms shade themselves). */
  band: number;
  /** Shade the bottom edge too. */
  bottom: boolean;
  /** Casts a contact shadow onto layers behind it. */
  cast: boolean;
  /** Skip lighting entirely (glows, decals). */
  flat: boolean;
  /** Anti-alias convex corners of this layer against the outline. */
  aa: boolean;
}

export let BW = 1;
export let BH = 1;
export let LAY = new Uint8Array(1);
export let FLG = new Uint8Array(1);
let curL = 0;
const MATS: Mat[] = [];
export const F_DECAL = 1;

export function beginLayers(w: number, h: number): void {
  BW = w;
  BH = h;
  LAY = new Uint8Array(w * h);
  FLG = new Uint8Array(w * h);
  curL = 0;
  MATS.length = 0;
}

/** Start a new layer (everything drawn next sits in front). */
export function layer(m: Partial<Mat> = {}): number {
  if (curL < 254) curL++;
  MATS[curL] = { sh: 0.3, hl: 0, hlLeft: false, band: 0, bottom: false, cast: true, flat: false, aa: true, ...m };
  return curL;
}
export function curLayer(): number {
  return curL;
}
/** Re-enter an earlier layer (so later paint joins it). */
export function useLayer(id: number): void {
  curL = id;
}

export type Src = Color | ((x: number, y: number) => Color | null | undefined) | null | undefined;

/** Paint for the current layer (records the layer id per pixel). */
export function pt(c: Src): (x: number, y: number) => Color | null {
  return (x: number, y: number) => {
    const v = typeof c === 'function' ? c(x, y) : c;
    if (v == null) return null;
    const i = y * BW + x;
    LAY[i] = curL;
    FLG[i] = 0;
    return v;
  };
}
/** Paint for unlit details (eyes, mouths, glints) that sit on the current pixel's layer. */
export function dc(c: Src): (x: number, y: number, old: number) => Color | null {
  return (x: number, y: number, old: number) => {
    const v = typeof c === 'function' ? c(x, y) : c;
    if (v == null) return null;
    const i = y * BW + x;
    if (!old) LAY[i] = curL;
    FLG[i] = F_DECAL;
    return v;
  };
}

// ---- helpers ----
export const rnd = Math.round;
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const D2R = Math.PI / 180;

export interface Pt {
  x: number;
  y: number;
}

/**
 * Light direction (toward the light): top-left, a little more from above.
 * Builds that will be mirrored or rotated before the light pass set the
 * direction that maps onto top-left afterwards, so forms are always lit
 * consistently on screen.
 */
export let LX = -0.62;
export let LY = -0.78;
export function setLight(mirror: boolean, rot?: 'cw' | 'ccw'): void {
  // Builds are rotated first, then mirrored. Undo the mirror, then the rotation.
  const px0 = mirror ? 0.62 : -0.62;
  const py0 = -0.78;
  if (rot === 'ccw') {
    // ccw maps (dx, dy) -> (dy, -dx).
    LX = -py0;
    LY = px0;
  } else if (rot === 'cw') {
    // cw maps (dx, dy) -> (-dy, dx).
    LX = py0;
    LY = -px0;
  } else {
    LX = px0;
    LY = py0;
  }
}

/**
 * Light value of a slab-like form: t is the lateral position (-1..1) along
 * `lat`, u the position (-1..1) along `up` (1 = the top), both unit vectors
 * in screen space.
 */
export function formV(t: number, u: number, lat: Pt, up: Pt): number {
  t = clamp(t, -1, 1);
  u = clamp(u, -1, 1);
  const nz = Math.sqrt(Math.max(0, 1 - t * t * 0.8));
  return t * 0.8 * (lat.x * LX + lat.y * LY) + u * 0.3 * (up.x * LX + up.y * LY) + nz * 0.5 - 0.22;
}
/** Quantise a light value to a ramp index (-2..2). Small forms skip the deep shadow. */
export function toneIdx(v: number, big = true): number {
  if (v > 0.45) return 1;
  if (big && v < -0.44) return -2;
  if (v < -0.15) return -1;
  return 0;
}

export function px(x: number, y: number, c: Src): void {
  P(rnd(x), rnd(y), pt(c));
}
export function rect(x: number, y: number, w: number, h: number, c: Src): void {
  const x0 = rnd(x);
  const y0 = rnd(y);
  const x1 = x0 + rnd(w);
  const y1 = y0 + rnd(h);
  const paint = pt(c);
  for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) P(xx, yy, paint);
}
export function dpx(x: number, y: number, c: Color): void {
  P(rnd(x), rnd(y), dc(c));
}
export function drect(x: number, y: number, w: number, h: number, c: Color): void {
  const x0 = rnd(x);
  const y0 = rnd(y);
  const paint = dc(c);
  for (let yy = y0; yy < y0 + rnd(h); yy++) for (let xx = x0; xx < x0 + rnd(w); xx++) P(xx, yy, paint);
}
export function line(x0: number, y0: number, x1: number, y1: number, c: Src): void {
  bres(rnd(x0), rnd(y0), rnd(x1), rnd(y1), pt(c));
}
export function dline(x0: number, y0: number, x1: number, y1: number, c: Color): void {
  bres(rnd(x0), rnd(y0), rnd(x1), rnd(y1), dc(c));
}
function bres(x0: number, y0: number, x1: number, y1: number, paint: (x: number, y: number, old: number) => Color | null): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    P(x0, y0, paint);
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

/** Filled ellipse; c may be a function of pixel coords. */
export function oval(cx: number, cy: number, rx: number, ry: number, c: Src): void {
  const paint = pt(c);
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) P(x, y, paint);
    }
}
/** Filled polygon. */
export function shape(pts: [number, number][], c: Src): void {
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    if (p[1] < y0) y0 = p[1];
    if (p[1] > y1) y1 = p[1];
  }
  const paint = pt(c);
  const xs: number[] = [];
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
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
      for (let x = xa; x <= xb; x++) P(x, y, paint);
    }
  }
}

/** Disc of integer diameter d centred at (cx, cy). */
export function disc(cx: number, cy: number, d: number, c: Src): void {
  const di = Math.max(1, rnd(d));
  const x0 = rnd(cx - di / 2);
  const y0 = rnd(cy - di / 2);
  const r = di / 2;
  const lim = r * r + di * 0.15;
  const paint = pt(c);
  for (let j = 0; j < di; j++)
    for (let i = 0; i < di; i++) {
      if (di > 3) {
        const dx = i + 0.5 - r;
        const dy = j + 0.5 - r;
        if (dx * dx + dy * dy > lim) continue;
      }
      P(x0 + i, y0 + j, paint);
    }
}

// ---------------------------------------------------------------------------
//  Shaded forms
// ---------------------------------------------------------------------------

/**
 * A tapered cylinder from (x0,y0) to (x1,y1) with diameters d0 → d1, shaded
 * across its width from its material ramp. `paint(s, v)` may override: s is
 * 0..1 along the segment, v the light value (-1..1); return null to skip.
 */
export function cyl(x0: number, y0: number, x1: number, y1: number, d0: number, d1: number, r: Ramp | ((s: number) => Ramp), opts: { vShift?: number; paint?: (s: number, v: number, x: number, y: number, c: number, t: number) => Color | null } = {}): void {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = len > 0 ? (x1 - x0) / len : 0;
  const uy = len > 0 ? (y1 - y0) / len : 1;
  // Perpendicular pointing toward the light side gets positive t.
  let nx = -uy;
  let ny = ux;
  let lit = nx * LX + ny * LY;
  if (lit < 0) {
    nx = -nx;
    ny = -ny;
    lit = -lit;
  }
  const dMax = Math.max(d0, d1);
  const minX = Math.floor(Math.min(x0, x1) - dMax / 2 - 1);
  const maxX = Math.ceil(Math.max(x0, x1) + dMax / 2 + 1);
  const minY = Math.floor(Math.min(y0, y1) - dMax / 2 - 1);
  const maxY = Math.ceil(Math.max(y0, y1) + dMax / 2 + 1);
  const vShift = opts.vShift ?? 0;
  const paint = pt((x: number, y: number) => {
    const cx = x + 0.5 - x0;
    const cy = y + 0.5 - y0;
    let s = len > 0 ? (cx * ux + cy * uy) / len : 0;
    const dd = cx * nx + cy * ny;
    const sc = clamp(s, 0, 1);
    const rad = lerp(d0, d1, sc) / 2;
    // Rounded caps.
    let inside: boolean;
    if (s < 0 || s > 1) {
      const ex = s < 0 ? cx : cx - (x1 - x0);
      const ey = s < 0 ? cy : cy - (y1 - y0);
      inside = ex * ex + ey * ey <= rad * rad + rad * 0.3;
    } else inside = Math.abs(dd) <= rad + 0.001;
    if (!inside) return null;
    s = sc;
    const t = rad > 0 ? clamp(dd / rad, -1, 1) : 0;
    // Light value: cylinder normal dotted with the light, plus a camera-facing term.
    let v = t * lit * 1.15 + (1 - t * t) * 0.35 - 0.12 + vShift;
    if (rad < 1.3) v = t > 0.2 ? 0.35 : t < -0.4 ? -0.3 : 0.1;
    const rr = typeof r === 'function' ? r(s) : r;
    const c = tone(rr, v);
    if (opts.paint) {
      const o = opts.paint(s, v, x, y, c, t);
      return o == null ? null : o;
    }
    return c;
  });
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) P(x, y, paint);
}

/** A shaded ellipsoid (heads, buns, muzzles). */
export function ball(cx: number, cy: number, rx: number, ry: number, r: Ramp, opts: { vShift?: number; paint?: (v: number, x: number, y: number, c: number) => Color | null; flatCenter?: number } = {}): void {
  const vShift = opts.vShift ?? 0;
  const paint = pt((x: number, y: number) => {
    const dx = (x + 0.5 - cx) / rx;
    const dy = (y + 0.5 - cy) / ry;
    const q = dx * dx + dy * dy;
    if (q > 1) return null;
    const nz = Math.sqrt(Math.max(0, 1 - q));
    let v = dx * LX + dy * LY + nz * 0.55 - 0.25 + vShift;
    if (opts.flatCenter && q < opts.flatCenter) v = Math.max(v, 0.05);
    const c = tone(r, v);
    if (opts.paint) {
      const o = opts.paint(v, x, y, c);
      return o == null ? null : o;
    }
    return c;
  });
  for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry) + 1; y++) for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++) P(x, y, paint);
}

/** Light value across a slab of half-width hw at lateral offset lx (-hw..hw), from the top-left. */
export function slabV(lx: number, hw: number, ly = 0, hh = 1): number {
  const t = hw > 0 ? clamp(lx / hw, -1, 1) : 0;
  const u = hh > 0 ? clamp(ly / hh, -1, 1) : 0;
  const nz = Math.sqrt(Math.max(0, 1 - t * t * 0.8));
  // Normal (t*0.8, u*0.3, nz) dotted with the light (LX, LY, 0.5), less a bias.
  return t * 0.8 * LX + u * 0.3 * LY + nz * 0.5 - 0.22;
}

// ---------------------------------------------------------------------------
//  Buffer transforms (sprite + layer + flags together)
// ---------------------------------------------------------------------------

export function mirrorAll(s: Spr): void {
  const w = s.w;
  for (let y = 0; y < s.h; y++) {
    const o = y * w;
    for (let x = 0; x < w >> 1; x++) {
      const a = o + x;
      const b = o + w - 1 - x;
      let t = s.d[a];
      s.d[a] = s.d[b];
      s.d[b] = t;
      t = LAY[a];
      LAY[a] = LAY[b];
      LAY[b] = t;
      t = FLG[a];
      FLG[a] = FLG[b];
      FLG[b] = t;
    }
  }
}

/** Rotate a square buffer 90 degrees. cw: top goes right. ccw: top goes left. */
export function rotateAll(s: Spr, cw: boolean): void {
  const n = s.w;
  const d = new Uint32Array(n * n);
  const la = new Uint8Array(n * n);
  const fl = new Uint8Array(n * n);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      const j = cw ? x * n + (n - 1 - y) : (n - 1 - x) * n + y;
      d[j] = s.d[i];
      la[j] = LAY[i];
      fl[j] = FLG[i];
    }
  s.d = d;
  LAY = la;
  FLG = fl;
}

function similar(a: number, b: number, lim: number): boolean {
  return Math.abs(cR(a) - cR(b)) + Math.abs(cG(a) - cG(b)) + Math.abs(cB(a) - cB(b)) < lim;
}

/** The light pass (see header). */
export function lightPass(s: Spr): void {
  const W = s.w;
  const H = s.h;
  const src = s.d.slice();
  const d = s.d;
  const lay = LAY;
  const outside = (x: number, y: number, Lr: number) => x < 0 || y < 0 || x >= W || y >= H || src[y * W + x] === 0 || lay[y * W + x] < Lr;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const c = src[i];
      if (!c || FLG[i] & F_DECAL) continue;
      const Lr = lay[i];
      const m = MATS[Lr];
      if (!m || m.flat) continue;
      // Contour where this part overlaps a near-identical part behind it.
      let contour = false;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1]] as const) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (src[j] && lay[j] < Lr && !(FLG[j] & F_DECAL) && similar(src[j], c, 36)) {
          contour = true;
          break;
        }
      }
      if (contour) {
        d[i] = shA(c, 0.42);
        continue;
      }
      let shade = false;
      for (let k = 1; k <= m.band; k++)
        if (outside(x + k, y, Lr)) {
          shade = true;
          break;
        }
      if (!shade && m.bottom && outside(x, y + 1, Lr)) shade = true;
      if (!shade) {
        const up = y > 0 ? lay[i - W] : 0;
        const lf = x > 0 ? lay[i - 1] : 0;
        if ((up > Lr && src[i - W] && MATS[up]?.cast && !(FLG[i - W] & F_DECAL)) || (lf > Lr && src[i - 1] && MATS[lf]?.cast && !(FLG[i - 1] & F_DECAL))) shade = true;
      }
      if (shade) d[i] = shA(c, m.sh);
      else if (m.hl > 0 && (outside(x, y - 1, Lr) || (m.hlLeft && outside(x - 1, y, Lr)))) d[i] = liA(c, m.hl);
    }
}

/** Crop to content; returns the crop offset. Also crops the layer buffer. */
export function crop(s: Spr): { s: Spr; ox: number; oy: number; lay: Uint8Array; flg: Uint8Array } {
  let x0 = s.w;
  let y0 = s.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++)
      if (s.d[y * s.w + x]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return { s: { w: 1, h: 1, d: new Uint32Array(1) }, ox: 0, oy: 0, lay: new Uint8Array(1), flg: new Uint8Array(1) };
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const d = new Uint32Array(w * h);
  const lay = new Uint8Array(w * h);
  const flg = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    d.set(s.d.subarray((y + y0) * s.w + x0, (y + y0) * s.w + x0 + w), y * w);
    lay.set(LAY.subarray((y + y0) * s.w + x0, (y + y0) * s.w + x0 + w), y * w);
    flg.set(FLG.subarray((y + y0) * s.w + x0, (y + y0) * s.w + x0 + w), y * w);
  }
  return { s: { w, h, d }, ox: x0, oy: y0, lay, flg };
}

/** Selective outline: plum ink on the dark side, a softer colour on the lit side. */
export function outlineColor(c: number, side: 'lit' | 'dark'): number {
  return side === 'dark' ? shA(c, 0.74) : shA(c, 0.52);
}
export function outlineSoft(c: number, side: 'lit' | 'dark'): number {
  return side === 'dark' ? shA(c, 0.62) : shA(c, 0.4);
}

/**
 * Outline then anti-alias: convex corners of large shapes get a half-tone
 * pixel between the fill and the outline so curves read smoothly.
 */
export function finish(cs: Spr, lay: Uint8Array, flg: Uint8Array, soft = false): Spr {
  const out = OUT(cs, soft ? outlineSoft : outlineColor);
  const W = out.w;
  const H = out.h;
  const src = out.d.slice();
  const layAt = (x: number, y: number) => (x < 1 || y < 1 || x > cs.w || y > cs.h ? 0 : lay[(y - 1) * cs.w + (x - 1)]);
  const flgAt = (x: number, y: number) => (x < 1 || y < 1 || x > cs.w || y > cs.h ? 0 : flg[(y - 1) * cs.w + (x - 1)]);
  const fillAt = (x: number, y: number) => (x < 1 || y < 1 || x > cs.w || y > cs.h ? 0 : cs.d[(y - 1) * cs.w + (x - 1)]);
  const isOutline = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && src[y * W + x] !== 0 && fillAt(x, y) === 0;
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      const f = fillAt(x, y);
      if (!f) continue;
      const L0 = layAt(x, y);
      const m = MATS[L0];
      if (!m || !m.aa || flgAt(x, y) & F_DECAL) continue;
      const up = isOutline(x, y - 1);
      const dn = isOutline(x, y + 1);
      const lf = isOutline(x - 1, y);
      const rt = isOutline(x + 1, y);
      // Convex corner: outline on two orthogonal sides, same layer on the other two.
      let corner = false;
      let oc = 0;
      if (up && lf && layAt(x + 1, y) === L0 && layAt(x, y + 1) === L0 && fillAt(x + 1, y) && fillAt(x, y + 1)) {
        corner = true;
        oc = src[(y - 1) * W + x];
      } else if (up && rt && layAt(x - 1, y) === L0 && layAt(x, y + 1) === L0 && fillAt(x - 1, y) && fillAt(x, y + 1)) {
        corner = true;
        oc = src[(y - 1) * W + x];
      } else if (dn && lf && layAt(x + 1, y) === L0 && layAt(x, y - 1) === L0 && fillAt(x + 1, y) && fillAt(x, y - 1)) {
        corner = true;
        oc = src[(y + 1) * W + x];
      } else if (dn && rt && layAt(x - 1, y) === L0 && layAt(x, y - 1) === L0 && fillAt(x - 1, y) && fillAt(x, y - 1)) {
        corner = true;
        oc = src[(y + 1) * W + x];
      }
      if (!corner) continue;
      // Only soften a corner that is part of a run (skip 1-px features).
      let same = 0;
      for (const [ddx, ddy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) if (layAt(x + ddx, y + ddy) === L0 && fillAt(x + ddx, y + ddy)) same++;
      if (same < 2) continue;
      out.d[y * W + x] = mixc(f, oc, 0.5);
    }
  return out;
}

/** Ramp lookup helper shared by the painters. */
export function rampOf(c: Color, kind: MatKind): Ramp {
  return ramp(c, kind);
}

export { col };
