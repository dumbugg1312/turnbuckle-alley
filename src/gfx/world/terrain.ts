/**
 * Terrain art (Golden Hour Storybook), painted at double density (D-018).
 *
 * Every ground tile is 16 world pixels square but is generated on the fine
 * grid: 32x32 art pixels. All texture functions take FINE world coordinates
 * (X = worldX * 2), so neighbouring tiles of the same kind join seamlessly and
 * blended edges line up exactly with the tile next door. Large features
 * (crack networks, wear paths, tonal patches) are world-space noise fields,
 * never per-tile stamps, so tiling stays invisible.
 *
 * Each tile is rendered as:
 *   1. an "owner" grid on the fine grid: which terrain shows at each art
 *      pixel. Higher-ranked soft terrain (grass) creeps raggedly into its
 *      neighbours (dirt, sand, water, pavement), liquids dither into each
 *      other. Two octaves of noise keep edges organic.
 *   2. base texture of the owner, then world-space decorations (blades,
 *      tufts, clover, flowers, pebbles) clipped to the owner's pixels. Grass
 *      tufts may overhang onto lower neighbours, softening hard edges.
 *   3. edge effects from the owner grid: lip shadows (light is top-left),
 *      shoreline foam, earthy banks, wet sand, seams between hard surfaces.
 *   4. per-terrain structure that depends on neighbours (curbs, floor AO
 *      under walls, bridge stringers, manholes, road gutters).
 * Tiles are cached by (season, id, position, 5x5 neighbourhood) as pixel
 * buffers and blitted through a tagged dense scratch canvas, so they land on
 * the fine grid. A target without fine pixels gets a box-filtered 1x copy.
 */
import { registerTerrain } from '../../world/registry';
import type { NeighborFn, TerrainId } from '../../world/types';
import { col, liA, mixc, shA } from '../kit';

/** Fine pixels per world pixel for terrain. */
const K = 2;
/** Tile size in fine pixels. */
const TS = 16 * K;

// ---------------------------------------------------------------- seasons
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
let SEASON: Season = 'spring';
const seasonHooks: (() => void)[] = [];
/** Switch the season for terrain and trees. Clears cached tiles; maps should re-render their ground. */
export function setSeason(s: Season): void {
  if (s === SEASON) return;
  SEASON = s;
  tileCache.clear();
  rampCache.clear();
  for (const f of seasonHooks) f();
}
export function getSeason(): Season {
  return SEASON;
}
export function onSeason(f: () => void): void {
  seasonHooks.push(f);
}

// ---------------------------------------------------------------- noise
/** Well-mixed integer hash in 0..1 (murmur3 finaliser); no row/column streaks. */
export function hh(x: number, y: number, s = 0): number {
  let h = (Math.imul(x | 0, 0x27d4eb2d) + Math.imul(y | 0, 0x165667b1) + Math.imul(s | 0, 0x9e3779b9)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Bayer threshold 0..1 at a pixel. */
export const bay = (x: number, y: number) => (B4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
/** Smooth value noise in 0..1. */
export function vnoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let u = x - xi;
  let v = y - yi;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  const a = hh(xi, yi, seed);
  const b = hh(xi + 1, yi, seed);
  const c = hh(xi, yi + 1, seed);
  const d = hh(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** Three-octave painterly noise in WORLD pixels, stretched to roughly 0..1. */
export function fbm(x: number, y: number, seed: number, scale = 1): number {
  const n = vnoise(x / (26 * scale), y / (26 * scale), seed) * 0.55 + vnoise(x / (10 * scale), y / (10 * scale), seed + 7) * 0.3 + vnoise(x / (3.6 * scale), y / (3.6 * scale), seed + 13) * 0.15;
  return Math.max(0, Math.min(1, (n - 0.5) * 1.9 + 0.5));
}
/**
 * Two broad octaves only: the calm base for lawns, earth and pavement (the
 * fine third octave was most of the "uniform noise"), and a third cheaper.
 */
export function fbm2(x: number, y: number, seed: number, scale = 1): number {
  const n = vnoise(x / (26 * scale), y / (26 * scale), seed) * 0.65 + vnoise(x / (10 * scale), y / (10 * scale), seed + 7) * 0.35;
  return Math.max(0, Math.min(1, (n - 0.5) * 1.9 + 0.5));
}
/** fbm at fine coordinates (same world-space field, sampled twice as finely). */
const fbF = (X: number, Y: number, seed: number, scale = 1) => fbm(X / K, Y / K, seed, scale);
/** Pick from a ramp of colours with a soft ordered-dither between neighbours. */
export function band(t: number, cs: number[], x: number, y: number, soft = 0.42): number {
  const n = cs.length - 1;
  let f = Math.max(0, Math.min(0.9999, t)) * n;
  const i = Math.floor(f);
  f -= i;
  f = (f - 0.5) / soft + 0.5;
  if (f <= 0) return cs[i];
  if (f >= 1) return cs[Math.min(n, i + 1)];
  return bay(x, y) < f ? cs[Math.min(n, i + 1)] : cs[i];
}
const C = (h: string) => col(h);
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const md = (a: number, m: number) => ((a % m) + m) % m;

/** Voronoi cells in world units, sampled at a fine pixel. */
interface Vor { d1: number; d2: number; id: number; dx: number; dy: number }
const VOR: Vor = { d1: 0, d2: 0, id: 0, dx: 0, dy: 0 };
function voronoi(X: number, Y: number, cell: number, seed: number, squash = 1.15): Vor {
  const x = (X + 0.5) / K;
  const y = (Y + 0.5) / K;
  const gx = Math.floor(x / cell);
  const gy = Math.floor(y / cell);
  let d1 = 1e9;
  let d2 = 1e9;
  let id = 0;
  let bdx = 0;
  let bdy = 0;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const cx = (gx + i) * cell + 0.6 + hh(gx + i, gy + j, seed) * (cell - 1.2);
      const cy = (gy + j) * cell + 0.6 + hh(gx + i, gy + j, seed + 1) * (cell - 1.2);
      const dx = x - cx;
      const dy = (y - cy) * squash;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = ((gx + i) * 7919 + (gy + j) * 104729) | 0;
        bdx = dx;
        bdy = dy;
      } else if (d < d2) d2 = d;
    }
  VOR.d1 = d1;
  VOR.d2 = d2;
  VOR.id = id;
  VOR.dx = bdx;
  VOR.dy = bdy;
  return VOR;
}

// ---------------------------------------------------------------- palettes
interface GrassPal { deep: number; dark: number; mid: number; base: number; lite: number; hi: number; tip: number }
const GRASS: Record<Season, GrassPal> = {
  spring: { deep: C('#35645a'), dark: C('#467d55'), mid: C('#5b984f'), base: C('#70ab50'), lite: C('#8bbf58'), hi: C('#b3d672'), tip: C('#d6e88e') },
  summer: { deep: C('#36604e'), dark: C('#467845'), mid: C('#5a9141'), base: C('#72a43e'), lite: C('#90b94a'), hi: C('#bfd56a'), tip: C('#e2e690') },
  fall: { deep: C('#5c5446'), dark: C('#7a6c42'), mid: C('#958442'), base: C('#ad9748'), lite: C('#c4ab56'), hi: C('#e0c674'), tip: C('#f0dc96') },
  winter: { deep: C('#68747a'), dark: C('#7c8a86'), mid: C('#909e94'), base: C('#a5b0a2'), lite: C('#bdc6b8'), hi: C('#dbe2d8'), tip: C('#f2f4ee') },
};
const GRASS_DARK: Record<Season, GrassPal> = {
  spring: { deep: C('#2c5052'), dark: C('#376853'), mid: C('#468050'), base: C('#56904c'), lite: C('#6aa252'), hi: C('#93c266'), tip: C('#b8d880') },
  summer: { deep: C('#2c4e48'), dark: C('#386646'), mid: C('#477c42'), base: C('#588e3e'), lite: C('#6ea044'), hi: C('#9cbc5a'), tip: C('#c4d47a') },
  fall: { deep: C('#4a4446'), dark: C('#5e5640'), mid: C('#746a3e'), base: C('#887a40'), lite: C('#a08c4a'), hi: C('#c4ac64'), tip: C('#dcc684') },
  winter: { deep: C('#56606c'), dark: C('#687676'), mid: C('#7a8a84'), base: C('#8e9c92'), lite: C('#a6b2a6'), hi: C('#c8d2c8'), tip: C('#e4eae2') },
};
/** The season's grass ramp, deep to tip (for decals and props that grow out of the lawn). */
export function grassTones(dark = false): number[] {
  const p = (dark ? GRASS_DARK : GRASS)[SEASON];
  return [p.deep, p.dark, p.mid, p.base, p.lite, p.hi, p.tip];
}
const FLOWER_COLS: Record<Season, string[]> = {
  spring: ['#ff8fae', '#ffe070', '#fff6ee', '#c08ae0', '#ff8fae', '#fff6ee', '#ffb6cc'],
  summer: ['#ffe070', '#ff6a5a', '#fff6ee', '#ffb040', '#ff8fae', '#9a7ae0'],
  fall: ['#f2903a', '#c070c0', '#ffd060', '#e8505a', '#9a6ad0'],
  winter: ['#fff6ee', '#e8e8ff', '#ffd0dc'],
};
/** Grass ramps (dark, mid, base, lite) in three hue families: neutral, sun-warmed and cool. */
interface Ramps { n: number[]; w: number[]; c: number[] }
const rampCache = new Map<string, Ramps>();
function ramps(key: string, p: GrassPal): Ramps {
  let r = rampCache.get(key);
  if (!r) {
    const n = [p.deep, p.dark, p.mid, p.base, p.lite, p.hi, p.tip];
    r = { n, w: n.map((c) => mixc(c, '#d8c45c', 0.17)), c: n.map((c) => mixc(c, '#3a7c7c', 0.15)) };
    rampCache.set(key, r);
  }
  return r;
}
const DIRT = { deep: C('#7a4c46'), dark: C('#996649'), base: C('#b78252'), lite: C('#cc9a62'), hi: C('#e0b47a'), peb: C('#d8c0a8'), pebD: C('#8e6a5e') };
const DIRTD = { deep: C('#583844'), dark: C('#6e4646'), base: C('#875a4a'), lite: C('#9c6c52'), hi: C('#b48462'), peb: C('#b8a09a'), pebD: C('#5e4048') };
const WATER = { deep: C('#2f6688'), dark: C('#387893'), base: C('#438aa0'), lite: C('#5ca4ae'), hi: C('#8ccac4'), spark: C('#e6fff4'), foam: C('#eaf6f0'), foam2: C('#b8e2da'), sky: C('#a6c4dc') };
const SHALLOW = { dark: C('#4c98a2'), base: C('#5eaeae'), lite: C('#78c2b6'), hi: C('#a6dccc'), peb: C('#8cb4a0'), pebL: C('#b4d4b8') };
const DEEP = { deep: C('#243c6e'), dark: C('#294a78'), base: C('#2f5884'), lite: C('#3c6c92'), hi: C('#6a9cb4') };
const SAND = { dark: C('#d0ac7c'), base: C('#e6c896'), lite: C('#f0d8a8'), hi: C('#f8e8c0'), wet: C('#c6a07a'), wet2: C('#d6b488') };
const ROAD = { d2: C('#5a4666'), dark: C('#695474'), base: C('#745e7c'), lite: C('#7e6886'), hi: C('#8e7894'), agg: C('#9a8698'), warm: C('#86707a'), tar: C('#54405e'), tarHi: C('#7c6a90') };
const SIDEWALK = { base: C('#dfba9c'), b2: C('#d8b296'), b3: C('#d2aa92'), lite: C('#ecc9aa'), hi: C('#f3d8bc'), seam: C('#a88488'), seamS: C('#c29e94'), dark: C('#c9a090'), crack: C('#9a7482') };

// ---------------------------------------------------------------- terrain table
type Cls = 'soft' | 'liquid' | 'hard' | 'floor';
interface TileCtx {
  buf: Uint32Array;
  id: TerrainId;
  tx: number;
  ty: number;
  /** Fine world coordinates of the tile's top-left art pixel. */
  X0: number;
  Y0: number;
  n: (dx: number, dy: number) => TerrainId;
  /** Owner at a fine local pixel (margins reach a little past the tile). */
  own: (lx: number, ly: number) => string;
  get: (lx: number, ly: number) => number;
  set: (lx: number, ly: number, c: number) => void;
  /** Darken (k > 0) a fine local pixel toward plum. */
  sh: (lx: number, ly: number, k: number) => void;
}
interface DecoCtx {
  X0: number;
  Y0: number;
  /** Paint at fine world coords; over = may overhang onto lower neighbours. */
  put: (X: number, Y: number, c: number, over?: boolean) => void;
  /** Does this terrain own the fine world pixel? */
  mine: (X: number, Y: number) => boolean;
  /** Undecorated texture colour of whatever owns the pixel (deterministic across tiles). */
  base: (X: number, Y: number) => number;
}
interface TInfo {
  cls: Cls;
  rank: number;
  height: number;
  fam: string;
  grassy?: boolean;
  /** Base texture at a fine world pixel. */
  tex: (X: number, Y: number) => number;
  deco?: (d: DecoCtx) => void;
  post?: (t: TileCtx) => void;
}
const INFO: Record<string, TInfo> = {};

const isWall = (id: string) => id.startsWith('wall');

// jittered-grid stamps in fine world space ----------------------------------
const PAD = 12;
function cells(X0: number, Y0: number, cw: number, ch: number, seed: number, prob: number, cb: (cx: number, cy: number, h: number, gx: number, gy: number) => void): void {
  for (let gy = Math.floor((Y0 - PAD) / ch); gy <= Math.floor((Y0 + TS + PAD) / ch); gy++)
    for (let gx = Math.floor((X0 - PAD) / cw); gx <= Math.floor((X0 + TS + PAD) / cw); gx++) {
      if (hh(gx, gy, seed) > prob) continue;
      const cx = gx * cw + Math.floor(hh(gx, gy, seed + 1) * cw);
      const cy = gy * ch + Math.floor(hh(gx, gy, seed + 2) * ch);
      cb(cx, cy, hh(gx, gy, seed + 3), gx, gy);
    }
}
function stampRows(put: (X: number, Y: number, c: number) => void, rows: string[], pal: Record<string, number>, x: number, y: number): void {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let i = 0; i < row.length; i++) {
      const c = pal[row[i]];
      if (c !== undefined) put(x + i, y + r, c);
    }
  }
}

// ---------------------------------------------------------------- grass family
/**
 * Overlapping grass clumps, like fish scales: the front-most (lowest) clump
 * containing the pixel wins. Its top edge is serrated into blade tips, lit
 * from the top-left, and it darkens toward its base where the next clump
 * shades it. Returns a ramp index offset (0 = deep .. 6 = tip).
 */
function clump(X: number, Y: number, seed: number, cw: number, ch: number, big: number): number {
  const gx0 = Math.floor((X - 10 * big) / cw);
  const gx1 = Math.floor((X + 10 * big) / cw);
  const gy0 = Math.floor((Y - 6.5 * big) / ch);
  const gy1 = Math.floor((Y + 9 * big) / ch);
  for (let gy = gy1; gy >= gy0; gy--) {
    let bestCy = -1e9;
    let v = 0;
    for (let gx = gx0; gx <= gx1; gx++) {
      const cy = (gy + hh(gx, gy, seed)) * ch;
      if (cy <= bestCy) continue;
      const r = hh(gx, gy, seed + 2);
      const rx = (6 + r * 4) * big;
      const ry = (3.5 + r * 2.5) * big;
      const dx = (X + 0.5 - (gx + hh(gx, gy, seed + 1)) * cw) / rx;
      const dy = (Y + 0.5 - cy) / ry;
      if (dy > 1 || dx > 1 || dx < -1) continue;
      let lim = 1;
      if (dy < 0) lim += (hh(X, gy * 131 + gx, seed + 3) - 0.45) * 0.8 * -dy;
      const d = dx * dx + dy * dy;
      if (d > lim) continue;
      bestCy = cy;
      const s = dy + dx * 0.3;
      v = dy < -0.3 && d > lim - 0.2 ? 4.45 : s < -0.5 ? 3.95 : s < 0.15 ? 3.5 : s < 0.65 ? 3.2 : 2.85;
    }
    if (bestCy > -1e9) return v;
  }
  return 2.45;
}
/**
 * Where life happens: a slow world-space field (0..1) that gathers small
 * detail (tufts, clover, flowers, pebbles, cracks) into clumps and leaves
 * calm stretches between them, the way a hand-painted map places it.
 */
export function lively(wx: number, wy: number, seed: number): number {
  const a = vnoise(wx / 46, wy / 38, seed) * 0.7 + vnoise(wx / 15, wy / 13, seed + 3) * 0.3;
  return Math.max(0, Math.min(1, (a - 0.42) * 2.6));
}
function grassTex(P: () => GrassPal, rk: string, seed: number, big = 1.45) {
  // the ramps change only with the season; don't look them up per pixel
  let r: Ramps | null = null;
  let rSeason = '';
  return (X: number, Y: number) => {
    if (rSeason !== SEASON || !r) {
      r = ramps(SEASON + rk, P());
      rSeason = SEASON;
    }
    const wx = X / K;
    const wy = Y / K;
    // big soft tonal drifts and sun-warmed / cool patches over larger, calmer
    // clumps; only a whisper of per-pixel dither so the lawn can rest the eye
    const t = fbm2(wx, wy, seed, 1.5);
    let i = clump(X, Y, seed + 50, 11 * big, 7 * big, big) + (t - 0.5) * 1.5 + (bay(X, Y) - 0.5) * 0.22;
    const n = hh(X, Y, seed + 40);
    if (n < 0.008) i -= 1;
    else if (n > 0.994) i += 1;
    const hue = vnoise(wx / 30, wy / 30, seed + 60) + (bay(X, Y) - 0.5) * 0.08;
    const ramp = hue > 0.63 ? r.w : hue < 0.3 ? r.c : r.n;
    return ramp[Math.max(0, Math.min(6, Math.floor(i)))];
  };
}
/** One blade from its root upward. */
function blade(d: DecoCtx, X: number, Y: number, len: number, lean: number, cs: number[], over: boolean): void {
  for (let i = 0; i < len; i++) {
    const f = len > 1 ? i / (len - 1) : 1;
    const x = Math.round(X + lean * f * f);
    d.put(x, Y - i, cs[Math.min(cs.length - 1, Math.floor(f * cs.length))], over);
  }
}
function grassDeco(P: () => GrassPal, seed: number, tuftProb: number, extras: boolean) {
  return (d: DecoCtx) => {
    const p = P();
    // 2. tufts: fans of longer blades with a contact shadow, allowed to spill over edges
    cells(d.X0, d.Y0, 13, 11, seed + 1, tuftProb * 1.6, (cx, cy, h, gx, gy) => {
      if (!d.mine(cx, cy)) return;
      // clumps of tufts with calm lawn between them
      if (hh(gx, gy, seed + 4) > lively(cx / K, cy / K, seed + 70) * 0.85) return;
      const n = 4 + Math.floor(h * 4);
      const w = Math.ceil(n * 0.6);
      for (let i = -w; i <= w; i++) {
        const e = Math.abs(i) / w;
        if (e < 0.7 || bay(cx + i, cy) < 0.5) d.put(cx + i, cy + 1, shA(d.base(cx + i, cy + 1), 0.2 - e * 0.1), true);
      }
      const cs = [p.dark, p.mid, p.base, p.lite, p.hi, h > 0.6 ? p.tip : p.hi];
      for (let b = 0; b < n; b++) {
        const off = b - (n - 1) / 2;
        const len = 4 + Math.round((1 - Math.abs(off) / n) * (3 + h * 4) + hh(gx * 13 + b, gy, seed + 7) * 2);
        const lean = off * 1.1 + (hh(gx * 7 + b, gy, seed + 8) - 0.5) * 2;
        blade(d, cx + Math.round(off * 0.9), cy, len, lean, cs, true);
      }
    });
    // 3. sun flecks
    cells(d.X0, d.Y0, 7, 7, seed + 9, 0.16, (cx, cy) => {
      if (d.mine(cx, cy) && lively(cx / K, cy / K, seed + 70) > 0.35) d.put(cx, cy, liA(d.base(cx, cy), 0.32));
    });
    if (!extras) return;
    if (SEASON === 'spring' || SEASON === 'summer') {
      // clover patches
      cells(d.X0, d.Y0, 26, 22, seed + 21, 0.3, (cx, cy, h, gx, gy) => {
        if (lively(cx / K, cy / K, seed + 71) < 0.55) return;
        const n = 2 + Math.floor(h * 4);
        for (let i = 0; i < n; i++) {
          const x = cx + Math.round((hh(gx, gy * 5 + i, seed + 22) - 0.5) * 10);
          const y = cy + Math.round((hh(gx * 3 + i, gy, seed + 23) - 0.5) * 7);
          if (!d.mine(x, y + 3)) continue;
          stampRows(d.put, ['.LM.LM.', 'LMMdMMd', '.MdsMd.', '..LMd..', '..MMd..', '...s...'], { L: p.lite, M: p.mid, d: p.dark, s: p.deep }, x - 3, y - 2);
          if (hh(x, y, seed + 24) < 0.12) {
            d.put(x, y - 3, C('#fff4f4'));
            d.put(x - 1, y - 3, C('#f4c8d8'));
            d.put(x, y - 4, C('#ffe4ec'));
          }
        }
      });
      // tiny wildflowers
      const fl = FLOWER_COLS[SEASON];
      cells(d.X0, d.Y0, 19, 17, seed + 25, 0.34, (cx, cy, h, gx, gy) => {
        if (!d.mine(cx, cy + 2)) return;
        if (hh(gx, gy, seed + 5) > lively(cx / K, cy / K, seed + 72) * 0.9) return;
        const fc = C(h < 0.45 ? '#fff8ee' : h < 0.7 ? '#ffe27a' : fl[Math.floor(hh(gx, gy, seed + 26) * fl.length)]);
        d.put(cx, cy + 1, p.dark);
        d.put(cx, cy + 2, p.deep);
        if (h < 0.45) {
          d.put(cx, cy - 1, fc);
          d.put(cx - 1, cy, fc);
          d.put(cx + 1, cy, shA(fc, 0.12));
          d.put(cx, cy + 1, shA(fc, 0.2));
          d.put(cx, cy, C('#ffd24a'));
          d.put(cx + 1, cy + 1, p.deep);
        } else {
          d.put(cx, cy, fc);
          d.put(cx + 1, cy, shA(fc, 0.3));
          d.put(cx + 1, cy + 1, p.deep);
        }
      });
    } else if (SEASON === 'fall') {
      const leaves = [C('#e8803a'), C('#d65a3a'), C('#f2b84a'), C('#b8483e'), C('#c8763a')];
      cells(d.X0, d.Y0, 11, 10, seed + 23, 0.4, (cx, cy, h, gx, gy) => {
        if (!d.mine(cx, cy)) return;
        if (hh(gx, gy, seed + 6) > lively(cx / K, cy / K, seed + 73) * 0.7) return;
        const lc = leaves[Math.floor(hh(gx, gy, seed + 27) * leaves.length)];
        const flip = h > 0.5;
        d.put(cx + 1, cy + 1, shA(d.base(cx + 1, cy + 1), 0.25));
        d.put(cx, cy, lc);
        d.put(cx + (flip ? 1 : -1), cy, lc);
        d.put(cx, cy - 1, liA(lc, 0.3));
        d.put(cx + (flip ? -1 : 1), cy + 1, shA(lc, 0.25));
        d.put(cx, cy + 1, shA(lc, 0.12));
      });
    } else {
      cells(d.X0, d.Y0, 6, 6, seed + 25, 0.4, (cx, cy) => {
        if (!d.mine(cx, cy)) return;
        d.put(cx, cy, C('#f6f8f4'));
        d.put(cx + 1, cy, C('#e2e8e8'));
      });
    }
  };
}
const gDeco = grassDeco(() => GRASS[SEASON], 101, 0.22, true);
INFO['grass'] = { cls: 'soft', rank: 10, height: 3, fam: 'grass', grassy: true, tex: grassTex(() => GRASS[SEASON], 'g', 3), deco: gDeco };
INFO['grass-dark'] = {
  cls: 'soft',
  rank: 11,
  height: 3,
  fam: 'grass',
  grassy: true,
  tex: grassTex(() => GRASS_DARK[SEASON], 'd', 5),
  deco: (d) => {
    grassDeco(() => GRASS_DARK[SEASON], 131, 0.55, false)(d);
    const p = GRASS_DARK[SEASON];
    // fallen twigs, moss-dark leaf litter and the occasional toadstool
    cells(d.X0, d.Y0, 44, 40, 141, 0.3, (cx, cy, h) => {
      if (!d.mine(cx, cy)) return;
      if (h < 0.8) {
        const len = 5 + Math.floor(h * 6);
        for (let i = 0; i < len; i++) {
          const y = cy + Math.floor(i * (h - 0.25));
          d.put(cx + i, y, i === 0 ? C('#9a7058') : C('#7a5448'));
          d.put(cx + i, y + 1, shA(d.base(cx + i, y + 1), 0.25));
        }
        d.put(cx + 3, cy - 1, C('#7a5448'));
      } else {
        stampRows(d.put, ['.hRRR.', 'RRwRRR', 'rRRRwr', '.rrrr.', '..ss..', '..ss..', '.DDDD.'], { R: C('#e2544a'), h: C('#ff9a8a'), w: C('#fff4e0'), r: C('#a83a46'), s: C('#f2e2d0'), D: p.deep }, cx - 3, cy - 6);
      }
    });
  },
};
INFO['flowers'] = {
  cls: 'soft',
  rank: 9,
  height: 3,
  fam: 'grass',
  grassy: true,
  tex: grassTex(() => GRASS[SEASON], 'g', 3),
  deco: (d) => {
    const p = GRASS[SEASON];
    grassDeco(() => GRASS[SEASON], 101, 0.28, false)(d);
    const fl = FLOWER_COLS[SEASON];
    cells(d.X0, d.Y0, 9, 9, 151, SEASON === 'winter' ? 0.25 : 0.8, (cx, cy, h, gx, gy) => {
      if (!d.mine(cx, cy + 3)) return;
      const fc = C(fl[Math.floor(hh(gx, gy, 152) * fl.length)]);
      const fd = shA(fc, 0.28);
      const fl2 = liA(fc, 0.4);
      // stem, a leaf, and a contact shadow
      const sl = 2 + Math.floor(h * 3);
      for (let i = 1; i <= sl; i++) d.put(cx, cy + i, i === sl ? p.deep : p.dark);
      d.put(cx + 1, cy + sl, shA(d.base(cx + 1, cy + sl), 0.25));
      if (h > 0.5) {
        d.put(cx + 1, cy + 2, p.mid);
        d.put(cx + 2, cy + 1, p.lite);
      } else {
        d.put(cx - 1, cy + 2, p.mid);
        d.put(cx - 2, cy + 1, p.base);
      }
      if (h > 0.4) {
        // five-petal bloom with a sunny eye
        stampRows(d.put, ['.L.', 'LyF', '.F.'], { L: fl2, F: fd, y: C('#ffd24a') }, cx - 1, cy - 1);
        d.put(cx - 1, cy - 1, fc);
        d.put(cx + 1, cy - 1, fc);
        d.put(cx - 1, cy + 1, fc);
        d.put(cx + 1, cy + 1, fd);
      } else {
        d.put(cx, cy, fc);
        d.put(cx, cy - 1, fl2);
        d.put(cx + 1, cy, fd);
      }
    });
  },
};

// ---------------------------------------------------------------- earth family
function earthTex(P: typeof DIRT, seed: number) {
  return (X: number, Y: number) => {
    const wx = X / K;
    const wy = Y / K;
    let t = fbm2(wx, wy, seed, 0.8) * 0.78 + 0.1;
    // footpath wear: meandering compacted strips, smoother and paler
    const w = vnoise(wx / 17, wy / 17, seed + 9);
    const ridge = Math.max(0, 1 - Math.abs(w - 0.5) * 11);
    t += ridge * 0.26;
    const g = hh(X, Y, seed + 3);
    t += (g - 0.5) * (0.1 - ridge * 0.06);
    const c = band(t, [P.deep, P.dark, P.base, P.lite, P.hi], X, Y, 0.3);
    // a little grit, gathered where the ground is lively
    if (g < 0.016 && ridge < 0.5 && lively(wx, wy, seed + 8) > 0.4) return P.peb;
    if (g > 0.992) return shA(c, 0.18);
    return c;
  };
}
function earthDeco(P: typeof DIRT, seed: number) {
  return (d: DecoCtx) => {
    // pebbles: lit top-left, a cast shadow bottom-right
    cells(d.X0, d.Y0, 9, 8, seed, 0.5, (cx, cy, h, gx, gy) => {
      if (!d.mine(cx, cy)) return;
      if (hh(gx, gy, seed + 9) > lively(cx / K, cy / K, seed + 8) * 0.75) return;
      const sh = shA(d.base(cx + 1, cy + 1), 0.3);
      if (h < 0.45) {
        d.put(cx, cy, P.peb);
        d.put(cx + 1, cy, P.pebD);
        d.put(cx + 1, cy + 1, sh);
      } else if (h < 0.85) {
        stampRows(d.put, ['hp.', 'ppd', '.ds'], { h: liA(P.peb, 0.4), p: P.peb, d: P.pebD, s: sh }, cx, cy);
      } else {
        stampRows(d.put, ['.hp.', 'hppd', 'pppd', '.dds'], { h: liA(P.peb, 0.45), p: P.peb, d: P.pebD, s: sh }, cx, cy);
      }
    });
    // hairline dry cracks with a lit lower lip
    cells(d.X0, d.Y0, 28, 26, seed + 5, 0.3, (cx, cy, h) => {
      if (lively(cx / K, cy / K, seed + 11) < 0.5) return;
      let x = cx;
      let y = cy;
      const len = 6 + Math.floor(h * 8);
      for (let i = 0; i < len; i++) {
        if (d.mine(x, y)) {
          d.put(x, y, P.deep);
          d.put(x, y + 1, liA(d.base(x, y + 1), 0.15));
        }
        x += 1;
        y += hh(cx + i, cy, seed) < h ? 1 : hh(cx, cy + i, seed + 1) < 0.25 ? -1 : 0;
      }
    });
    // a root or twig poking up now and then
    cells(d.X0, d.Y0, 40, 36, seed + 7, 0.25, (cx, cy, h) => {
      if (!d.mine(cx, cy)) return;
      const len = 4 + Math.floor(h * 5);
      for (let i = 0; i < len; i++) {
        const y = cy + Math.round(Math.sin(i * 0.9 + h * 6) * 0.8);
        d.put(cx + i, y, i % 3 === 0 ? C('#6a4040') : C('#8a5a48'));
        d.put(cx + i, y + 1, shA(d.base(cx + i, y + 1), 0.22));
      }
    });
  };
}
INFO['dirt'] = { cls: 'soft', rank: 6, height: 2, fam: 'dirt', tex: earthTex(DIRT, 21), deco: earthDeco(DIRT, 201) };
INFO['dirt-dark'] = { cls: 'soft', rank: 5, height: 2, fam: 'dirt', tex: earthTex(DIRTD, 23), deco: earthDeco(DIRTD, 211) };

// cobble / stepping-stone path (Voronoi stones in world space)
const PATH = { gap: C('#8a6a5e'), gapD: C('#6a4e54'), moss: C('#6a9a58'), moss2: C('#88b468'), s1: C('#d9c9c0'), s2: C('#c9b6b4'), s3: C('#e6d8c6'), s4: C('#bca8b4'), lit: C('#f6eee0') };
function stoneShade(base: number, edge: number, dx: number, dy: number, X: number, Y: number, rim: number): number {
  // dome light from the top-left, AO into the joints
  const dir = (dx + dy) / Math.max(0.5, Math.hypot(dx, dy));
  let c = base;
  if (edge < rim) {
    const k = 1 - edge / rim;
    if (dir < -0.3) c = edge < rim * 0.45 ? liA(base, 0.45) : liA(base, 0.22);
    else if (dir > 0.25) c = shA(base, 0.12 + k * 0.28);
    else c = shA(base, k * 0.12);
  } else if (dir < -0.5 && edge < rim * 1.8 && bay(X, Y) < 0.4) c = liA(base, 0.12);
  const g = hh(X, Y, 304);
  if (g < 0.07) c = shA(c, 0.1);
  else if (g > 0.95) c = liA(c, 0.15);
  return c;
}
INFO['path'] = {
  cls: 'soft',
  rank: 7,
  height: 2,
  fam: 'path',
  tex: (X, Y) => {
    const v = voronoi(X, Y, 7, 301);
    const edge = v.d2 - v.d1;
    if (edge < 1.05) {
      const m = vnoise(X / 5, Y / 5, 302);
      if (m > 0.62) return hh(X, Y, 305) < 0.3 ? PATH.moss2 : PATH.moss;
      return edge < 0.45 ? PATH.gapD : hh(X, Y, 306) < 0.2 ? PATH.gapD : PATH.gap;
    }
    const h = hh(v.id, 0, 303);
    const base = h < 0.3 ? PATH.s1 : h < 0.55 ? PATH.s2 : h < 0.8 ? PATH.s3 : PATH.s4;
    // the odd weathered stone with a lichen freckle
    if (h > 0.9 && hh(X >> 1, Y >> 1, 307) < 0.12) return C('#c8c48e');
    return stoneShade(base, edge - 1.05, v.dx, v.dy, X, Y, 1.3);
  },
  deco: (d) => {
    // grass blades sprouting from the joints
    cells(d.X0, d.Y0, 6, 6, 311, 0.4, (cx, cy, h) => {
      if (!d.mine(cx, cy)) return;
      const v = voronoi(cx, cy, 7, 301);
      if (v.d2 - v.d1 > 0.6) return;
      const p = GRASS[SEASON];
      blade(d, cx, cy, 2 + Math.floor(h * 3), h > 0.5 ? 1 : -1, [p.dark, p.base, p.hi], false);
    });
  },
};
INFO['sand'] = {
  cls: 'soft',
  rank: 2,
  height: 2,
  fam: 'sand',
  tex: (X, Y) => {
    const wx = X / K;
    const wy = Y / K;
    const t = fbm(wx, wy, 41, 1.2) * 0.8 + (hh(X, Y, 42) - 0.5) * 0.22 + 0.12;
    // wind ripples: a lit crest and a shaded trough
    const rip = Math.sin(wx * 0.35 + wy * 0.9 + vnoise(wx / 9, wy / 9, 43) * 5);
    if (rip > 0.94) return SAND.hi;
    if (rip > 0.86) return SAND.lite;
    if (rip < -0.96) return SAND.dark;
    const g = hh(X, Y, 44);
    if (g < 0.03) return C('#c09a86');
    if (g > 0.985) return C('#fff6dc');
    return band(t, [SAND.dark, SAND.base, SAND.lite], X, Y, 0.5);
  },
  deco: (d) => {
    cells(d.X0, d.Y0, 17, 16, 401, 0.45, (cx, cy, h) => {
      if (!d.mine(cx, cy)) return;
      if (h < 0.45) {
        d.put(cx, cy, C('#b49a8e'));
        d.put(cx + 1, cy, C('#8e7a7e'));
        d.put(cx + 1, cy + 1, SAND.dark);
      } else if (h < 0.8) {
        // tiny scallop shell
        stampRows(d.put, ['.wp.', 'wppr', '.rr.', '..s.'], { w: C('#fff2e6'), p: C('#ffd2c4'), r: C('#e8b0a6'), s: SAND.dark }, cx, cy);
      } else d.put(cx, cy, SAND.hi);
    });
  },
};
INFO['mud'] = {
  cls: 'soft',
  rank: 1,
  height: 1,
  fam: 'mud',
  tex: (X, Y) => {
    const wx = X / K;
    const wy = Y / K;
    const t = fbm(wx, wy, 51, 0.7) * 0.9 + (hh(X, Y, 52) - 0.5) * 0.12;
    const puddle = vnoise(wx / 8, wy / 5, 53);
    if (puddle > 0.72) {
      if (puddle < 0.735) return C('#4c3238');
      if (puddle < 0.75) return C('#5a3e44');
      // sky glints and a soft reflection band on still water
      const g = md(X * 2 + Y * 3, 21);
      if (g === 0) return C('#c8b8dc');
      if (vnoise(wx / 6, wy / 1.5, 54) > 0.7) return C('#6a5a7a');
      return puddle > 0.8 ? C('#5a4a64') : C('#4e3e56');
    }
    return band(t, [C('#5c3c3e'), C('#6e4842'), C('#82584a'), C('#946650')], X, Y, 0.5);
  },
  deco: (d) => {
    // wet glints and boot prints
    cells(d.X0, d.Y0, 11, 9, 501, 0.5, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      d.put(cx, cy, C('#c8a088'));
      d.put(cx + 1, cy, C('#a07a68'));
    });
    cells(d.X0, d.Y0, 30, 30, 503, 0.3, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      const rows = ['.dd.', 'dDDd', 'dDDd', 'dDDd', '.dd.', '....', '.dd.', 'dDDd', '.dd.'];
      stampRows(d.put, rows, { d: C('#5a3a3e'), D: C('#46303a') }, cx, cy);
      stampRows(d.put, rows, { d: C('#5a3a3e'), D: C('#46303a') }, cx + 6, cy - 9);
    });
  },
};
INFO['gravel'] = {
  cls: 'soft',
  rank: 4,
  height: 2,
  fam: 'gravel',
  tex: (X, Y) => {
    // a real pebble field: tiny Voronoi stones, each lit and shaded
    const v = voronoi(X, Y, 2.5, 61, 1.05);
    const edge = v.d2 - v.d1;
    const t = fbm(X / K, Y / K, 62, 0.9);
    if (edge < 0.36 || v.d1 > 1.3) return edge < 0.16 || t > 0.62 ? C('#76646e') : C('#88767c');
    const h = hh(v.id, 0, 63);
    const base = h < 0.25 ? C('#c8baae') : h < 0.45 ? C('#b4a49e') : h < 0.62 ? C('#a2949a') : h < 0.8 ? C('#c2a892') : h < 0.92 ? C('#d8ccc0') : C('#8e8090');
    const lit = v.dx + v.dy;
    let c = lit < -0.4 ? liA(base, 0.32) : lit > 0.45 ? shA(base, 0.3) : lit > 0.15 ? shA(base, 0.12) : base;
    if (t < 0.35) c = shA(c, 0.1);
    return c;
  },
  deco: (d) => {
    cells(d.X0, d.Y0, 14, 14, 601, 0.3, (cx, cy, h) => {
      if (!d.mine(cx, cy)) return;
      // a few bigger stones with a cast shadow
      const pc = h < 0.3 ? C('#d8cabc') : h < 0.6 ? C('#c4ae9a') : C('#b8b0b8');
      stampRows(d.put, ['.hp.', 'hppd', 'pdds', '.ss.'], { h: liA(pc, 0.35), p: pc, d: shA(pc, 0.25), s: C('#5e4e5c') }, cx, cy);
    });
  },
};
INFO['tilled'] = {
  cls: 'soft',
  rank: 3,
  height: 2,
  fam: 'tilled',
  tex: (X, Y) => {
    // furrows 4 world px apart: lit ridge, earthy flank, dark damp trough
    const wob = Math.floor(vnoise(X / 12, Y / 2, 71) * 2.6);
    const r = md(Y + wob, 8);
    const n = hh(X, Y, 72);
    let c = r === 0 ? C('#a06c50') : r <= 2 ? C('#8e5c46') : r <= 4 ? C('#74483e') : r <= 6 ? C('#62403c') : C('#4c3036');
    if (n < 0.07) c = r < 4 ? C('#b07a58') : C('#58383a');
    else if (n > 0.95) c = shA(c, 0.15);
    return c;
  },
  deco: (d) => {
    cells(d.X0, d.Y0, 9, 8, 701, 0.4, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      // clods
      d.put(cx, cy, C('#b48060'));
      d.put(cx + 1, cy, C('#8e5c46'));
      d.put(cx + 1, cy + 1, C('#4c3036'));
      d.put(cx, cy + 1, C('#74483e'));
    });
  },
};
INFO['snow'] = {
  cls: 'soft',
  rank: 12,
  height: 3,
  fam: 'snow',
  tex: (X, Y) => {
    const t = fbF(X, Y, 81, 1.3) * 0.88 + 0.08 + (vnoise(X / 7, Y / 3, 82) - 0.5) * 0.12;
    return band(t, [C('#c4c8e6'), C('#d8dcf2'), C('#e8ecf8'), C('#f6f6fc')], X, Y, 0.5);
  },
  deco: (d) => {
    cells(d.X0, d.Y0, 7, 7, 801, 0.35, (cx, cy) => {
      if (d.mine(cx, cy)) d.put(cx, cy, C('#ffffff'));
    });
    cells(d.X0, d.Y0, 21, 19, 803, 0.3, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      for (let i = 0; i < 5; i++) d.put(cx + i, cy, i === 2 ? C('#b0b6da') : C('#c4c8e6'));
      d.put(cx + 1, cy - 1, C('#ffffff'));
    });
  },
};

// ---------------------------------------------------------------- liquids
function waterTex(P: { dark: number; base: number; lite: number; hi: number }, deepC: number, seed: number, caustic: number) {
  return (X: number, Y: number) => {
    const wx = X / K;
    const wy = Y / K;
    const t = fbm(wx + wy * 0.3, wy * 1.6, seed, 1.1) * 0.85 + 0.08;
    let c = band(t, [deepC, P.dark, P.base, P.lite], X, Y, 0.5);
    // long horizontal wavelets: lit crest over a dark trough
    const w = Math.sin(wx * 0.42 + Math.sin(wy * 0.7) * 2.2 + vnoise(wx / 11, wy / 5, seed + 1) * 6);
    const b2 = md(Y + Math.floor(vnoise(wx / 13, wy / 7, seed + 2) * 8), 10);
    if (b2 === 0 && w > 0.5) return P.hi;
    if (b2 === 1 && w > 0.5) return deepC;
    if (b2 === 0 && w > 0.2) c = P.lite;
    // caustic net shimmering just under the surface
    if (caustic > 0) {
      const v = voronoi(X, Y, 4.2, seed + 3, 1.6);
      const e = v.d2 - v.d1;
      if (e < 0.22 * caustic && vnoise(wx / 7, wy / 7, seed + 4) > 0.42) return bay(X, Y) < 0.6 ? P.lite : c;
    }
    // sky reflection bands drifting across
    const sky = vnoise(wx / 24, wy / 3.2, seed + 5);
    if (sky > 0.78 && bay(X, Y) < (sky - 0.78) * 4) return mixc(c, WATER.sky, 0.45);
    return c;
  };
}
INFO['water'] = {
  cls: 'liquid',
  rank: 1,
  height: 0,
  fam: 'water',
  tex: waterTex(WATER, WATER.deep, 91, 1),
  deco: (d) => {
    // sun sparkles: a bright core with a soft cross
    cells(d.X0, d.Y0, 17, 15, 901, 0.42, (cx, cy, h) => {
      if (!d.mine(cx, cy)) return;
      if (h < 0.6) {
        d.put(cx, cy, WATER.spark);
        d.put(cx - 1, cy, WATER.hi);
        d.put(cx + 1, cy, WATER.hi);
        if (h < 0.25) {
          d.put(cx, cy - 1, WATER.hi);
          d.put(cx, cy + 1, WATER.lite);
          d.put(cx - 2, cy, WATER.lite);
          d.put(cx + 2, cy, WATER.lite);
        }
      } else {
        for (let i = 0; i < 5; i++) d.put(cx + i, cy, i === 2 ? C('#c4d4e8') : C('#9ab8d0'));
      }
    });
  },
};
INFO['shallow'] = {
  cls: 'liquid',
  rank: 2,
  height: 0,
  fam: 'water',
  tex: (X, Y) => {
    const wx = X / K;
    const wy = Y / K;
    // river pebbles seen through the water
    const v = voronoi(X, Y, 6, 95);
    if (v.d1 < 2.2 && hh(v.id, 2, 97) < 0.6) {
      const pc = hh(v.id, 3, 98) < 0.5 ? SHALLOW.peb : SHALLOW.pebL;
      const l = v.dx + v.dy;
      if (v.d1 > 1.8) return shA(pc, 0.18);
      if (l < -0.9) return liA(pc, 0.3);
      if (l > 0.8) return shA(pc, 0.16);
      return pc;
    }
    const w = Math.sin(wx * 0.5 + Math.sin(wy * 0.8) * 2 + vnoise(wx / 9, wy / 4, 96) * 5);
    if (md(Y, 8) === 0 && w > 0.6) return SHALLOW.hi;
    // bright caustics dancing over the bed
    const cv = voronoi(X, Y, 3.4, 94, 1.4);
    if (cv.d2 - cv.d1 < 0.2) return bay(X, Y) < 0.7 ? SHALLOW.hi : SHALLOW.lite;
    const t = fbm(wx, wy * 1.5, 99) * 0.8 + 0.1;
    return band(t, [SHALLOW.dark, SHALLOW.base, SHALLOW.lite], X, Y, 0.5);
  },
  deco: (d) => {
    cells(d.X0, d.Y0, 15, 15, 951, 0.35, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      d.put(cx, cy, WATER.spark);
      d.put(cx + 1, cy, SHALLOW.hi);
      d.put(cx - 1, cy, SHALLOW.hi);
    });
  },
};
INFO['deep-water'] = {
  cls: 'liquid',
  rank: 0,
  height: 0,
  fam: 'water',
  tex: waterTex({ dark: DEEP.dark, base: DEEP.base, lite: DEEP.lite, hi: DEEP.hi }, DEEP.deep, 93, 0.6),
  deco: (d) => {
    cells(d.X0, d.Y0, 23, 19, 971, 0.3, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      d.put(cx, cy, C('#8ab4c8'));
      d.put(cx + 1, cy, DEEP.hi);
      d.put(cx - 1, cy, DEEP.lite);
    });
  },
};

// ---------------------------------------------------------------- hard outdoor
function asphalt(X: number, Y: number): number {
  const wx = X / K;
  const wy = Y / K;
  // calm, broad tone: worn lanes and patches rather than per-pixel fizz
  const t = fbm2(wx, wy, 111, 2.2) * 0.34 + 0.33 + (vnoise(wx / 48, wy / 48, 119) - 0.5) * 0.24;
  // aggregate: pale stones, warm grit, dark pits (sparser, and only where the surface is old)
  const n = hh(X, Y, 112);
  const old = vnoise(wx / 30, wy / 22, 120);
  const grit = 0.006 + old * old * 0.03;
  if (n < grit) return hh(X, Y, 113) < 0.5 ? ROAD.agg : ROAD.hi;
  if (n < grit * 1.5) return ROAD.warm;
  if (n > 1 - grit) return ROAD.d2;
  // a world-space crack network, only in the older stretches: raw hairlines and tar-sealed seams
  const m = vnoise(wx / 15, wy / 15, 118) * 0.5 + vnoise(wx / 70, wy / 40, 121) * 0.5;
  if (m > 0.7) {
    const v = voronoi(X, Y, 21, 117, 1);
    const e = v.d2 - v.d1;
    if (m > 0.77) {
      if (e < 0.75) return e < 0.25 && hh(X, Y, 114) < 0.35 ? ROAD.tarHi : ROAD.tar;
      if (e < 1.05 && bay(X, Y) < 0.5) return ROAD.dark;
    } else if (e < 0.28) return ROAD.d2;
  }
  return band(t, [ROAD.dark, ROAD.base, ROAD.lite], X, Y, 0.2);
}
const isAsphalt = (id: string) => INFO[id]?.fam === 'asphalt';
function manhole(t: TileCtx): void {
  const c = TS / 2;
  const R = 10.5;
  for (let y = 0; y < TS; y++)
    for (let x = 0; x < TS; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      const d = Math.hypot(dx, dy);
      if (d > R + 2) continue;
      const ang = (dx + dy) / Math.max(0.01, d);
      let col: number;
      if (d > R + 1) col = shA(t.get(x, y), 0.28);
      else if (d > R) col = C('#3e3448');
      else if (d > R - 1.6) col = ang < -0.2 ? C('#9a8aa2') : ang > 0.3 ? C('#4a3e56') : C('#6e6078');
      else if (d > R - 2.4) col = C('#40364c');
      else {
        // cast-iron lid: a raised diamond grid with a lit and a shaded side
        const a = md(x + y, 5);
        const b = md(x - y, 5);
        col = a === 0 || b === 0 ? C('#7a6c84') : a === 1 || b === 1 ? C('#4e4258') : C('#5e5068');
        if (hh(x, y, t.tx * 31 + t.ty) < 0.06) col = C('#7a5a5a');
        if (Math.abs(dy) < 1.2 && Math.abs(Math.abs(dx) - 5) < 1.2) col = C('#2e2638');
      }
      t.set(x, y, col);
    }
}
function roadPost(t: TileCtx): void {
  const h = hh(t.tx, t.ty, 113);
  const open = [t.n(0, -1), t.n(0, 1), t.n(-1, 0), t.n(1, 0)].every(isAsphalt);
  if (t.id === 'road' && open && h < 0.03) manhole(t);
  else if (h < 0.075 && t.id === 'road') {
    // a newer rectangular patch: darker, finer, with a crisp tar seam
    const px = 2 + Math.floor(hh(t.tx, t.ty, 114) * 8);
    const py = 2 + Math.floor(hh(t.tx, t.ty, 115) * 8);
    const pw = 16 + Math.floor(hh(t.tx, t.ty, 116) * 10);
    const ph = 12 + Math.floor(hh(t.tx, t.ty, 117) * 10);
    for (let y = py; y < py + ph; y++)
      for (let x = px; x < px + pw; x++) {
        if (t.own(x, y) !== t.id) continue;
        const X = x + t.X0;
        const Y = y + t.Y0;
        // slightly wobbly hand-cut edges, softly rounded corners
        const cx = Math.min(x - px, px + pw - 1 - x);
        const cy = Math.min(y - py, py + ph - 1 - y);
        if (cx + cy < 2) continue;
        const edge = cx === 0 || cy === 0 || cx + cy === 2;
        const n = hh(X, Y, 118);
        if (edge) t.set(x, y, n < 0.3 ? ROAD.dark : y === py && n < 0.6 ? ROAD.tarHi : ROAD.tar);
        else t.set(x, y, n < 0.04 ? ROAD.agg : n > 0.95 ? ROAD.d2 : band(fbF(X, Y, 124, 0.4), [mixc(ROAD.dark, ROAD.d2, 0.5), ROAD.dark, mixc(ROAD.dark, ROAD.base, 0.5)], X, Y, 0.5));
      }
  } else if (h < 0.2 && t.id !== 'crosswalk' && (t.id === 'parking' || INFO[t.n(0, -1)]?.fam === 'sidewalk' || INFO[t.n(0, 1)]?.fam === 'sidewalk' ? h > 0.075 : h < 0.09)) {
    // an oil stain where cars stand (by the curb, in the lot): soft dark core, dithered halo, a rare rainbow sheen
    const cx = 8 + hh(t.tx, t.ty, 125) * 16;
    const cy = 8 + hh(t.tx, t.ty, 126) * 16;
    const rx = 4 + hh(t.tx, t.ty, 127) * 4;
    const ry = rx * 0.6;
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
      for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        if (t.own(x, y) !== t.id) continue;
        const nx = (x + 0.5 - cx) / rx;
        const ny = (y + 0.5 - cy) / ry;
        const d = Math.sqrt(nx * nx + ny * ny) + (vnoise(x / 2, y / 2, 128 + t.tx) - 0.5) * 0.35;
        const b = bay(x + t.X0, y + t.Y0);
        if (d < 0.55) t.set(x, y, hh(x, y, 129 + t.ty) < 0.07 ? (hh(x, y, 130) < 0.5 ? C('#7a8ab0') : C('#9a7aac')) : C('#4c3a56'));
        else if (d < 0.8 && b < 0.6) t.set(x, y, C('#584462'));
        else if (d < 1 && b < 0.25) t.sh(x, y, 0.15);
      }
  } else if (h > 0.965 && t.id === 'road') {
    // a ghost of an old painted stripe, mostly worn away
    const y0 = 6 + Math.floor(hh(t.tx, t.ty, 131) * 18);
    for (let y = y0; y < y0 + 3; y++)
      for (let x = 0; x < TS; x++) {
        if (t.own(x, y) !== t.id) continue;
        if (vnoise((x + t.X0) / 3, y, 132) > 0.45 && hh(x + t.X0, y, 133) > 0.3) t.set(x, y, mixc(t.get(x, y), C('#e8dcc8'), 0.3));
      }
  }
  // leaves and grit blown into the gutter under a curb
  if (INFO[t.n(0, -1)]?.fam === 'sidewalk') {
    const leaves = SEASON === 'fall' ? 7 : 2;
    const lcs = [C('#e8a050'), C('#d06a40'), C('#f2c060'), C('#8ab868')];
    for (let i = 0; i < leaves; i++) {
      const lx = Math.floor(hh(t.tx, i, 122 + t.ty) * 30);
      const ly = 3 + Math.floor(hh(i, t.ty, 123 + t.tx) * 4);
      const lc = lcs[(i + t.tx) % 4];
      t.set(lx, ly, lc);
      t.set(lx + 1, ly, shA(lc, 0.2));
      t.set(lx, ly - 1, liA(lc, 0.3));
      t.sh(lx + 1, ly + 1, 0.25);
    }
    for (let x = 0; x < TS; x++) if (hh(x + t.X0, t.Y0, 134) < 0.18) t.set(x, 5 + Math.floor(hh(x, t.ty, 135) * 3), ROAD.agg);
  }
}
INFO['road'] = { cls: 'hard', rank: 0, height: 1, fam: 'asphalt', tex: asphalt, post: roadPost };
/** Worn paint: chips show the asphalt, aggregate peeks through, edges soften. */
function paint(X: number, Y: number, c: number, lit: number, dark: number, top: boolean, bottom: boolean): number {
  const n = hh(X, Y, 131);
  const wear = vnoise(X / 5, Y / 3, 136);
  if (n < 0.06 + Math.max(0, wear - 0.6) * 0.8) return asphalt(X, Y);
  if (n > 0.95) return ROAD.agg;
  if (top) return lit;
  if (bottom) return dark;
  return wear < 0.3 && bay(X, Y) < 0.3 ? lit : c;
}
INFO['road-line'] = {
  cls: 'hard',
  rank: 0,
  height: 1,
  fam: 'asphalt',
  tex: (X, Y) => {
    const ly = md(Y, TS);
    const lx = md(X, TS);
    // dashed centre line, slightly ragged at the ends
    const end = Math.floor(hh(Math.floor(X / TS), Math.floor(Y / TS), 137) * 2);
    if (ly >= 14 && ly <= 17 && lx >= 6 + end && lx < 26 - end) return paint(X, Y, C('#f2cf78'), C('#fbe2a2'), C('#d4a85e'), ly === 14, ly === 17);
    return asphalt(X, Y);
  },
  post: roadPost,
};
INFO['crosswalk'] = {
  cls: 'hard',
  rank: 0,
  height: 1,
  fam: 'asphalt',
  tex: (X, Y) => {
    const lx = md(X, 16);
    const ly = md(Y, TS);
    if (lx >= 2 && lx <= 11 && ly >= 2 && ly <= 29) return paint(X, Y, C('#e4cfc0'), C('#f4e6da'), C('#c8b0aa'), lx === 2, lx === 11);
    return asphalt(X, Y);
  },
  post: roadPost,
};
INFO['parking'] = {
  cls: 'hard',
  rank: 0,
  height: 1,
  fam: 'asphalt',
  tex: asphalt,
  post: (t) => {
    if (md(t.ty, 2) === 0) {
      for (let x = 0; x < TS; x++)
        for (let y = 2; y <= 4; y++) {
          if (t.own(x, y) !== t.id) continue;
          t.set(x, y, paint(x + t.X0, y + t.Y0, C('#ece2d8'), C('#fff4ea'), C('#c8bab4'), y === 2, y === 4));
        }
    }
    // oil drips in some stalls
    if (hh(t.tx, t.ty, 152) < 0.3) roadPost({ ...t, tx: t.tx + 7, ty: t.ty + 3, id: 'parking' as TerrainId });
    else roadPost(t);
  },
};
// sidewalk slabs ----------------------------------------------------------
function sidewalkTex(X: number, Y: number): number {
  const lx = md(X, TS);
  const ly = md(Y, TS);
  // expansion joints: a dark groove, a shaded inner wall and a lit far bevel
  if (lx === 0 || ly === 0) return hh(X, Y, 160) < 0.12 ? SIDEWALK.crack : SIDEWALK.seam;
  if (lx === 1 || ly === 1) return SIDEWALK.seamS;
  if (lx === 2 || ly === 2) return SIDEWALK.hi;
  if (lx === 31 || ly === 31) return SIDEWALK.b3;
  const wx = X / K;
  const wy = Y / K;
  const n = hh(X, Y, 161);
  if (n < 0.012) return SIDEWALK.lite;
  if (n > 0.99) return SIDEWALK.dark;
  // broom finish: faint horizontal streaks across each slab
  let t = fbm2(wx, wy, 162, 1.8) * 0.4 + 0.4 + (vnoise(X / 7, Y / 0.9, 164 + Math.floor(X / TS)) - 0.5) * 0.12;
  // weathering: rain stains and foot-polished paths
  const st = vnoise(wx / 20, wy / 20, 165);
  if (st > 0.66) t -= (st - 0.66) * 1.4;
  return band(t, [SIDEWALK.dark, SIDEWALK.b3, SIDEWALK.b2, SIDEWALK.base, SIDEWALK.lite], X, Y, 0.3);
}
function sidewalkPost(t: TileCtx): void {
  const own = (x: number, y: number) => t.own(x, y) === t.id;
  const h = hh(t.tx, t.ty, 163);
  // chipped slab corners
  for (const [cx, cy, s] of [[1, 1, 0], [30, 1, 1], [1, 30, 2], [30, 30, 3]] as [number, number, number][]) {
    if (hh(t.tx * 4 + s, t.ty, 170) > 0.08 + lively(t.tx * 16, t.ty * 16, 171) * 0.2) continue;
    const dx = cx < 16 ? 1 : -1;
    const dy = cy < 16 ? 1 : -1;
    for (let j = 0; j < 3; j++)
      for (let i = 0; i < 3 - j; i++) {
        const x = cx + i * dx;
        const y = cy + j * dy;
        if (own(x, y)) t.set(x, y, i + j === 2 ? SIDEWALK.dark : SIDEWALK.crack);
      }
  }
  if (h < 0.03 + lively(t.tx * 16, t.ty * 16, 172) * 0.22) {
    // a crack that wanders off a joint, a determined weed in it (gathered in the older stretches)
    let x = 4 + Math.floor(hh(t.tx, t.ty, 164) * 22);
    let y = 3;
    const len = 9 + Math.floor(hh(t.tx, t.ty, 165) * 10);
    const pts: [number, number][] = [];
    for (let i = 0; i < len; i++) {
      if (own(x, y)) {
        t.set(x, y, SIDEWALK.crack);
        if (own(x + 1, y + 1)) t.set(x + 1, y + 1, SIDEWALK.hi);
      }
      pts.push([x, y]);
      x += hh(i, t.tx, 166) < 0.5 ? 1 : -1;
      y += hh(i, t.ty, 167) < 0.7 ? 1 : 0;
    }
    if (h < 0.08 && SEASON !== 'winter') {
      const [wx, wy] = pts[Math.floor(len * 0.6)];
      const g = GRASS[SEASON];
      for (const [dx, len2, lean] of [[0, 4, -1], [1, 5, 1], [-1, 3, -1], [2, 3, 1]] as [number, number, number][])
        for (let i = 0; i < len2; i++) t.set(wx + dx + Math.round((lean * i * i) / (len2 * 2)), wy - i, i === len2 - 1 ? g.hi : i === 0 ? g.deep : g.base);
    }
  }
  // gum spots: flattened discs, older ones darker
  const gums = h > 0.86 ? 1 + Math.floor(hh(t.tx, t.ty, 168) * 2) : 0;
  for (let i = 0; i < gums; i++) {
    const gx = 4 + Math.floor(hh(t.tx, t.ty + i, 169) * 23);
    const gy = 4 + Math.floor(hh(t.tx + i, t.ty, 171) * 23);
    const old = hh(gx, gy, 172) < 0.5;
    const g = old ? C('#b09ca2') : C('#c8b4b2');
    stampRows((x, y, c) => own(x, y) && t.set(x, y, c), hh(gx, gy, 173) < 0.5 ? ['lg.', 'ggd', '.d.'] : ['lg', 'gd'], { l: liA(g, 0.3), g, d: shA(g, 0.14) }, gx, gy);
  }
  if (h > 0.2 && h < 0.214 && SEASON !== 'winter') {
    // chalk drawing: a tiny heart
    const gx = 9 + Math.floor(hh(t.tx, t.ty, 173) * 12);
    const gy = 9 + Math.floor(hh(t.tx, t.ty, 174) * 12);
    const ch = hh(t.tx, t.ty, 175) < 0.5 ? C('#ff9ab8') : C('#8ad0e8');
    stampRows((x, y, c) => own(x, y) && hh(x, y, 176) > 0.15 && t.set(x, y, c), ['.c..c.', 'c.cc.c', 'c....c', '.c..c.', '..cc..'], { c: ch }, gx, gy);
  }
  // grass and moss creeping up the joints, more where turf is next door
  const nearGrass = [t.n(0, -1), t.n(0, 1), t.n(-1, 0), t.n(1, 0)].some((id) => INFO[id]?.grassy);
  if (SEASON !== 'winter') {
    const g = GRASS[SEASON];
    const tries = nearGrass ? 4 : 1;
    for (let i = 0; i < tries; i++) {
      const r = hh(t.tx * 5 + i, t.ty, 177);
      if (r > 0.6) continue;
      const along = 3 + Math.floor(hh(t.tx, t.ty * 5 + i, 178) * 26);
      const vert = r < 0.3;
      const x = vert ? 0 : along;
      const y = vert ? along : 0;
      if (!own(x, y)) continue;
      t.set(x, y, g.dark);
      if (vert) {
        t.set(x + 1, y, g.mid);
        t.set(x, y - 1, g.base);
        t.set(x + 1, y - 2, g.hi);
      } else {
        t.set(x, y + 1, g.deep);
        t.set(x + 1, y, g.base);
        t.set(x + 1, y - 1, g.hi);
        t.set(x - 1, y, g.mid);
      }
    }
  }
  // curbs where the sidewalk meets the street
  const road = (dx: number, dy: number) => isAsphalt(t.n(dx, dy));
  if (road(0, 1)) {
    for (let x = 0; x < TS; x++) {
      if (!own(x, 22)) continue;
      const X = x + t.X0;
      const n = hh(X, t.Y0, 179);
      t.set(x, 21, SIDEWALK.seamS);
      t.set(x, 22, C('#fff2dc'));
      t.set(x, 23, C('#fae2c6'));
      t.set(x, 24, n < 0.1 ? C('#e6c8ae') : C('#f2d8bc'));
      t.set(x, 25, C('#e8ccb2'));
      t.set(x, 26, C('#c8a6a0'));
      t.set(x, 27, C('#b8949a'));
      t.set(x, 28, n > 0.9 ? C('#a07c88') : C('#b08c94'));
      t.set(x, 29, C('#a8848e'));
      t.set(x, 30, C('#94707e'));
      t.set(x, 31, C('#7a5a76'));
      if (md(X, TS) === 0) for (let y = 22; y < 31; y++) t.set(x, y, y < 26 ? SIDEWALK.seam : C('#86647a'));
      // chipped curb lip now and then
      if (hh(X >> 2, t.Y0, 180) < 0.1 && md(X, 4) < 2) {
        t.set(x, 22, C('#c8a6a0'));
        t.set(x, 23, C('#b8949a'));
      }
    }
  }
  if (road(0, -1)) {
    for (let x = 0; x < TS; x++) {
      t.set(x, 0, C('#7a5a76'));
      t.set(x, 1, C('#94707e'));
      t.set(x, 2, C('#fff0d8'));
      t.set(x, 3, C('#f6dcc0'));
      t.set(x, 4, C('#ecd0b2'));
      t.set(x, 5, SIDEWALK.seamS);
    }
  }
  if (road(-1, 0)) {
    for (let y = 0; y < TS; y++) {
      t.set(0, y, C('#94707e'));
      t.set(1, y, C('#a8848e'));
      t.set(2, y, C('#fff0d8'));
      t.set(3, y, C('#f6dcc0'));
      t.set(4, y, C('#ecd0b2'));
      t.set(5, y, SIDEWALK.seamS);
    }
  }
  if (road(1, 0)) {
    for (let y = 0; y < TS; y++) {
      t.set(26, y, SIDEWALK.seamS);
      t.set(27, y, C('#ecd0b2'));
      t.set(28, y, C('#f6dcc0'));
      t.set(29, y, C('#fff0d8'));
      t.set(30, y, C('#a8848e'));
      t.set(31, y, C('#7a5a76'));
    }
  }
  // curb corners
  if (road(0, 1) && road(1, 0)) for (let y = 22; y < TS; y++) for (let x = 30; x < TS; x++) t.set(x, y, C('#7a5a76'));
  if (road(0, 1) && road(-1, 0)) for (let y = 22; y < TS; y++) for (let x = 0; x < 2; x++) t.set(x, y, C('#94707e'));
}
INFO['sidewalk'] = { cls: 'hard', rank: 0, height: 3, fam: 'sidewalk', tex: sidewalkTex, post: sidewalkPost };
INFO['concrete'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'concrete',
  tex: (X, Y) => {
    const lx = md(X, 64);
    const ly = md(Y, 64);
    // saw-cut joints with a lit far edge
    if (lx === 0 || ly === 0) return C('#9a8892');
    if (lx === 1 || ly === 1) return C('#b0a0a6');
    if (lx === 2 || ly === 2) return C('#ddd2ce');
    const wx = X / K;
    const wy = Y / K;
    const n = hh(X, Y, 181);
    if (n < 0.04) return C('#d8ccc8');
    if (n > 0.965) return C('#a8989e');
    // trowel swirls: faint arcs in the finish
    const sw = Math.sin(Math.hypot(md(wx, 11) - 5.5, md(wy, 9) - 4.5) * 1.6 + vnoise(wx / 6, wy / 6, 186) * 3);
    let t = fbm(wx, wy, 182, 1.6) * 0.75 + 0.12 + (sw > 0.92 ? 0.12 : 0);
    const st = vnoise(wx / 22, wy / 22, 187);
    if (st > 0.68) t -= (st - 0.68) * 1.2;
    return band(t, [C('#b0a2a6'), C('#bcaeb0'), C('#c6b8b8'), C('#d0c4c2')], X, Y, 0.4);
  },
  post: (t) => {
    const h = hh(t.tx, t.ty, 183);
    if (h < 0.12) {
      // an old stain
      const cx = 6 + hh(t.tx, t.ty, 184) * 20;
      const cy = 6 + hh(t.tx, t.ty, 185) * 20;
      const r = 3 + h * 30;
      for (let y = Math.floor(cy - r); y <= cy + r; y++)
        for (let x = Math.floor(cx - r * 1.4); x <= cx + r * 1.4; x++) {
          if (t.own(x, y) !== t.id) continue;
          const d = Math.hypot((x - cx) / 1.4, y - cy) / r + (vnoise(x / 3, y / 3, 188) - 0.5) * 0.4;
          if (d < 0.7) t.sh(x, y, 0.12);
          else if (d < 1 && bay(x, y) < 0.5) t.sh(x, y, 0.07);
        }
    } else if (h < 0.2) {
      // hairline crack
      let x = 3 + Math.floor(hh(t.tx, t.ty, 189) * 24);
      for (let y = 0; y < TS; y++) {
        if (t.own(x, y) === t.id) {
          t.set(x, y, C('#948490'));
          t.set(x + 1, y, C('#dcd0cc'));
        }
        x += hh(y, t.tx, 190) < 0.3 ? 1 : hh(y, t.ty, 191) < 0.3 ? -1 : 0;
      }
    }
  },
};
// basket-weave brick plaza
const BRICKS = [C('#c4584a'), C('#b44c46'), C('#d0664e'), C('#c25c50'), C('#a84648'), C('#d87458'), C('#b85a4e')];
const MORTAR = C('#d9b49a');
INFO['brick'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'brick',
  tex: (X, Y) => {
    const bx = Math.floor(X / 16);
    const by = Math.floor(Y / 16);
    const lx = X - bx * 16;
    const ly = Y - by * 16;
    const horiz = ((bx + by) & 1) === 0;
    // two bricks per 8x8 world block
    const a = horiz ? ly : lx;
    const along = horiz ? lx : ly;
    const k = a < 8 ? 0 : 1;
    const ia = a - k * 8;
    const id = bx * 2 + k;
    if (ia === 7 || along === 15) {
      // mortar, darker where it is recessed, with the odd tuft of moss
      if (hh(X >> 1, Y >> 1, 196) < 0.07) return C('#7aa860');
      return hh(X, Y, 197) < 0.3 ? C('#c49e8a') : MORTAR;
    }
    if (ia === 6 || along === 14) return shA(BRICKS[Math.floor(hh(id, by, 191) * BRICKS.length)], 0.3);
    let c = BRICKS[Math.floor(hh(id, by, 191) * BRICKS.length)];
    // chipped faces: a pale broken corner
    const ch = hh(id, by, 198);
    if (ch < 0.18) {
      const cx = ch < 0.09 ? 0 : 13;
      if (Math.abs(along - cx) + ia < 3) return ia === 0 ? MORTAR : C('#e0a080');
    }
    // a face with tooling marks and soot
    const f = vnoise(X / 3, Y / 3, 199 + id);
    if (f > 0.72) c = shA(c, 0.12);
    else if (f < 0.2) c = liA(c, 0.08);
    if (ia === 0 || along === 0) return liA(c, 0.24);
    if (ia === 1 && along > 0 && along < 13 && bay(X, Y) < 0.3) return liA(c, 0.12);
    const n = hh(X, Y, 192);
    if (n < 0.06) return shA(c, 0.16);
    if (n > 0.96) return liA(c, 0.2);
    return c;
  },
};
INFO['stone'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'stone',
  tex: (X, Y) => {
    const v = voronoi(X, Y, 10, 201);
    const edge = v.d2 - v.d1;
    if (edge < 0.9) return edge < 0.4 ? C('#463e58') : C('#5a5270');
    const h = hh(v.id, 0, 202);
    const base = h < 0.33 ? C('#9a90a4') : h < 0.66 ? C('#aaa0b2') : C('#8e8498');
    let c = stoneShade(base, edge - 0.9, v.dx, v.dy, X, Y, 1.6);
    // pitted, weathered faces
    if (vnoise(X / 4, Y / 4, 203 + (v.id & 15)) > 0.74) c = shA(c, 0.1);
    return c;
  },
};
INFO['dungeon'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'dungeon',
  tex: (X, Y) => {
    const v = voronoi(X, Y, 9, 211);
    const edge = v.d2 - v.d1;
    const glow = vnoise(X / 24, Y / 24, 212);
    if (edge < 1) {
      if (glow > 0.72) return hh(X, Y, 213) < 0.5 ? C('#5ad8a0') : C('#3a9a7a');
      return hh(X, Y, 214) < 0.3 ? C('#4a7a4a') : edge < 0.45 ? C('#1e2230') : C('#262a36');
    }
    const h = hh(v.id, 0, 215);
    let base = h < 0.33 ? C('#4e5e58') : h < 0.66 ? C('#58685e') : C('#46544e');
    if (fbF(X, Y, 216) > 0.7) base = mixc(base, C('#5a8a4a'), 0.6);
    return stoneShade(base, edge - 1, v.dx, v.dy, X, Y, 1.4);
  },
  deco: (d) => {
    // hairline cracks and faint glowing spores
    cells(d.X0, d.Y0, 26, 24, 221, 0.4, (cx, cy, h) => {
      let x = cx;
      let y = cy;
      for (let i = 0; i < 9; i++) {
        if (d.mine(x, y)) d.put(x, y, C('#22262f'));
        x += 1;
        y += hh(cx, i, 222) < h ? 1 : hh(cy, i, 224) < 0.3 ? -1 : 0;
      }
    });
    cells(d.X0, d.Y0, 19, 17, 223, 0.3, (cx, cy) => {
      if (!d.mine(cx, cy)) return;
      d.put(cx, cy, C('#c8ffe6'));
      d.put(cx + 1, cy, C('#5ad8a0'));
      d.put(cx, cy + 1, C('#3a9a7a'));
    });
  },
};
INFO['bridge'] = {
  cls: 'hard',
  rank: 0,
  height: 4,
  fam: 'bridge',
  tex: (X, Y) => {
    const ly = md(Y, 8);
    const plank = Math.floor(Y / 8);
    const h = hh(plank, 0, 231);
    const base = h < 0.3 ? C('#b07a52') : h < 0.6 ? C('#c08a5c') : h < 0.85 ? C('#a46e4c') : C('#c8966a');
    // gaps between planks show the dark water below
    if (ly === 7) return hh(X >> 1, plank, 232) < 0.5 ? C('#2e3450') : C('#3e3a50');
    if (ly === 6) return shA(base, 0.3);
    if (ly === 0) return liA(base, 0.28);
    // an occasional seam where two planks butt together
    const seam = Math.floor(hh(plank, 1, 233) * 80);
    const sx = md(X, 80);
    if (sx === seam) return C('#5e3e44');
    if (sx === seam + 1) return liA(base, 0.2);
    // weathered grain running along the plank
    const g = vnoise(X / 9, ly * 1.3 + plank * 5, 234);
    if (g > 0.68) return shA(base, 0.16);
    if (g < 0.22) return liA(base, 0.1);
    return hh(X, Y, 235) < 0.04 ? shA(base, 0.2) : base;
  },
  post: (t) => {
    const side = (dx: number) => INFO[t.n(dx, 0)]?.fam !== 'bridge';
    // nail heads
    for (let y = 2; y < TS; y += 8) {
      for (const x of [6, 24]) {
        t.set(x, y, C('#9a8a8e'));
        t.set(x + 1, y, C('#6a5a62'));
        t.set(x, y + 1, C('#6a4a4a'));
      }
    }
    if (side(-1))
      for (let y = 0; y < TS; y++) {
        const cs = [C('#4a3040'), C('#5a3a40'), C('#8e5e48'), C('#b07a52'), C('#a8724e'), C('#7a4e44')];
        for (let x = 0; x < 6; x++) t.set(x, y, hh(x, y + t.Y0, 236) < 0.08 ? shA(cs[x], 0.15) : cs[x]);
      }
    if (side(1))
      for (let y = 0; y < TS; y++) {
        const cs = [C('#9a6848'), C('#a8724e'), C('#8e5e48'), C('#6a4440'), C('#4a3040'), C('#3a2638')];
        for (let x = 0; x < 6; x++) t.set(26 + x, y, hh(x, y + t.Y0, 237) < 0.08 ? shA(cs[x], 0.15) : cs[x]);
      }
  },
};

// ---------------------------------------------------------------- interior floors
function floorPost(extra?: (t: TileCtx) => void) {
  return (t: TileCtx) => {
    if (extra) extra(t);
    // contact AO under walls (light comes from the room, top-left)
    const wallUp = isWall(t.n(0, -1));
    const wallL = isWall(t.n(-1, 0));
    if (wallUp)
      for (let x = 0; x < TS; x++)
        for (let y = 0; y < 8; y++) {
          const k = [0.46, 0.38, 0.3, 0.23, 0.17, 0.12, 0.08, 0.05][y];
          if (y < 3 || bay(x + t.X0, y + t.Y0) < 0.6) t.sh(x, y, k);
        }
    if (wallL)
      for (let y = 0; y < TS; y++)
        for (let x = 0; x < 6; x++) {
          const k = [0.3, 0.22, 0.15, 0.1, 0.06, 0.03][x];
          if (x < 2 || bay(x + t.X0, y + t.Y0) < 0.6) t.sh(x, y, k);
        }
    if (isWall(t.n(1, 0)))
      for (let y = 0; y < TS; y++) {
        t.sh(31, y, 0.22);
        t.sh(30, y, 0.1);
      }
  };
}
interface WoodPal { seam: number; dark: number; base: number; lite: number; hi: number; grain: number; knot: number }
function boards(P: WoodPal, seed: number) {
  return (X: number, Y: number) => {
    const row = Math.floor(Y / 8);
    const ly = Y - row * 8;
    // staggered board ends
    const len = 48;
    const off = Math.floor(hh(row, 0, seed) * len);
    const bxi = Math.floor((X + off) / len);
    const lx = X + off - bxi * len;
    if (ly === 7) return P.seam;
    if (lx === 0) return P.seam;
    if (lx === 1) return liA(P.base, 0.12);
    if (lx === len - 1) return shA(P.base, 0.15);
    const h = hh(bxi, row, seed + 1);
    const base = h < 0.3 ? P.dark : h < 0.75 ? P.base : P.lite;
    if (ly === 0) return lx === 2 ? P.hi : liA(base, 0.2);
    if (ly === 6) return shA(base, 0.1);
    // nail heads near each board end
    if ((lx === 3 || lx === len - 4) && (ly === 2 || ly === 5)) return P.seam;
    // a knot, with the grain flowing around it
    const kx = 8 + Math.floor(hh(bxi, row, seed + 4) * 30);
    const ky = 2.5 + hh(bxi, row, seed + 5) * 2;
    const hasKnot = h > 0.55 && hh(bxi, row, seed + 6) < 0.45;
    let gy = ly;
    if (hasKnot) {
      const dx = (lx - kx) / 3.2;
      const dy = (ly - ky) / 1.6;
      const d = dx * dx + dy * dy;
      if (d < 0.35) return P.knot;
      if (d < 1) return d < 0.6 ? liA(P.knot, 0.12) : P.grain;
      gy += (ly < ky ? -1 : 1) * 1.6 * Math.exp(-d * 0.6);
    }
    // grain lines running along the board
    const g = Math.sin(gy * 2.1 + vnoise(X / 14, row * 3, seed + 2) * 5 + h * 9);
    if (g > 0.86) return P.grain;
    if (g < -0.9 && bay(X, Y) < 0.5) return liA(base, 0.1);
    // a soft polished sheen drifting across the room
    const sheen = md(X / K + Y * 0.8, 70);
    if (sheen < 5 && bay(X, Y) < 0.5 - Math.abs(sheen - 2.5) * 0.15) return liA(base, 0.18);
    if (hh(X, Y, seed + 3) < 0.025) return shA(base, 0.12);
    return base;
  };
}
INFO['wood'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'wood',
  tex: boards({ seam: C('#8a5038'), dark: C('#cc8a52'), base: C('#d99a5c'), lite: C('#e4a868'), hi: C('#f6cc8a'), grain: C('#c47e4c'), knot: C('#9a5a3c') }, 241),
  post: floorPost(),
};
INFO['wood-dark'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'wood-dark',
  tex: boards({ seam: C('#40243a'), dark: C('#7a4c44'), base: C('#8a5848'), lite: C('#98644e'), hi: C('#b88466'), grain: C('#6e4240'), knot: C('#523038') }, 251),
  post: floorPost(),
};
/** A soft window reflection band across glossy floors. */
const gloss = (X: number, Y: number) => {
  const s = md(X - Y * 0.55, 120);
  return s < 10 ? 1 - Math.abs(s - 5) / 5 : 0;
};
INFO['tile'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'tile',
  tex: (X, Y) => {
    // cream squares with a little teal star where four corners meet
    const lx = md(X, 16);
    const ly = md(Y, 16);
    const ix = lx === 15 ? 0 : lx + 1;
    const iy = ly === 15 ? 0 : ly + 1;
    const ax = Math.min(ix, 16 - ix);
    const ay = Math.min(iy, 16 - iy);
    if (ax + ay <= 1) return C('#2f8a86');
    if (ax + ay <= 3) return ax + ay === 2 ? C('#3e9e96') : C('#5ab6aa');
    if (lx === 15 || ly === 15) return C('#cbbca8');
    if (lx === 14 || ly === 14) return C('#e6d8c4');
    if (lx === 0 || ly === 0) return C('#fffaf0');
    const tone = hh(Math.floor(X / 16), Math.floor(Y / 16), 262);
    let c = tone < 0.2 ? C('#f2e8d4') : tone > 0.85 ? C('#f8f2e2') : C('#f6eedc');
    const gl = gloss(X, Y);
    if (gl > 0 && bay(X, Y) < gl * 0.8) c = C('#fffcf4');
    return hh(X, Y, 261) < 0.035 ? C('#e8dcc8') : c;
  },
  post: floorPost(),
};
INFO['checker'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'checker',
  tex: (X, Y) => {
    const red = ((Math.floor(X / 16) + Math.floor(Y / 16)) & 1) === 0;
    const lx = md(X, 16);
    const ly = md(Y, 16);
    const gl = gloss(X, Y);
    const sheen = gl > 0 && bay(X, Y) < gl * 0.85;
    if (lx === 15 || ly === 15) return C('#a89090');
    if (red) {
      if (lx === 0 || ly === 0) return C('#e46a64');
      if (lx === 14 || ly === 14) return C('#a83848');
      if (sheen) return C('#ec7a72');
      return hh(X, Y, 272) < 0.04 ? C('#c03e48') : C('#d0464e');
    }
    if (lx === 0 || ly === 0) return C('#fffaf2');
    if (lx === 14 || ly === 14) return C('#d8c4b4');
    return sheen ? C('#fffdf6') : hh(X, Y, 271) < 0.05 ? C('#eadcca') : C('#f4e8d6');
  },
  post: floorPost(),
};
INFO['carpet'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'carpet',
  tex: (X, Y) => {
    const lx = md(X, 16);
    const ly = md(Y, 16);
    const d = Math.abs(lx - 7.5) + Math.abs(ly - 7.5);
    const n = hh(X, Y, 281);
    // soft pile: dithered tufts
    const pile = vnoise(X / 1.6, Y / 1.6, 282);
    if (d < 1.5) return C('#c4cce8');
    if (d < 2.6) return C('#a8b4dc');
    if (d > 5 && d < 7) return d < 5.6 ? C('#7684b8') : pile < 0.4 ? C('#5c6aa0') : C('#6876ac');
    if (pile > 0.72) return C('#6270a4');
    return n < 0.05 ? C('#6876ac') : n > 0.95 ? C('#4c5888') : pile < 0.25 ? C('#505d92') : C('#56639a');
  },
  post: floorPost(),
};
INFO['carpet-red'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'carpet-red',
  tex: (X, Y) => {
    const lx = md(X, 24);
    const ly = md(Y, 24);
    const d = Math.abs(lx - 11.5) + Math.abs(ly - 11.5);
    const n = hh(X, Y, 291);
    const pile = vnoise(X / 1.6, Y / 1.6, 292);
    // gold lattice of little fleurs on theater red
    if (Math.abs(d - 11) < 0.6) return C('#c89040');
    if (Math.abs(d - 11) < 1.1) return C('#8a3036');
    if (d < 1.6) return C('#ffe08a');
    if (d < 2.6) return C('#f2c45a');
    if (d < 4.6 && (Math.abs(lx - 11.5) < 1 || Math.abs(ly - 11.5) < 1)) return C('#d8a040');
    if (pile > 0.72) return C('#a83644');
    return n < 0.06 ? C('#b23e44') : n > 0.95 ? C('#7e2438') : pile < 0.25 ? C('#922c3c') : C('#9c3040');
  },
  post: floorPost(),
};
INFO['mat'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'mat',
  tex: (X, Y) => {
    const n = hh(X, Y, 301);
    // woven vinyl with seams every 32 world px and scuffs
    if (md(X, 64) === 0) return C('#9aa0c4');
    if (md(X, 64) === 1) return C('#d0d6ec');
    const weave = ((X >> 1) + (Y >> 1)) & 1;
    const t = fbF(X, Y, 302, 1.8);
    if (t > 0.78 && n < 0.5) return C('#a8aed0');
    if (n < 0.04) return C('#d6dbee');
    return weave ? (md(X + Y, 2) ? C('#bcc2de') : C('#c2c8e2')) : md(X - Y, 2) ? C('#b4bad8') : C('#aeb4d4');
  },
  post: floorPost(),
};
INFO['rubber'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'rubber',
  tex: (X, Y) => {
    const n = hh(X, Y, 311);
    const lx = md(X, 64);
    const ly = md(Y, 64);
    if (lx === 0 || ly === 0) return C('#221e2e');
    if (lx === 1 || ly === 1) return C('#4a4258');
    // recycled-rubber flecks, sparse and muted
    if (n < 0.012) return C('#5a8a8e');
    if (n < 0.022) return C('#8a5e70');
    if (n < 0.04) return C('#5e566e');
    if (n > 0.96) return C('#2e2838');
    if (lx === 2 || ly === 2) return C('#463e54');
    return band(fbF(X, Y, 312, 1.5), [C('#363044'), C('#3c3548'), C('#42394e')], X, Y, 0.5);
  },
  post: floorPost(),
};

// ---------------------------------------------------------------- blending rules
interface Rule { mode: 'rag' | 'dith'; reach: number; seed: number; f?: number }
const ruleCache = new Map<string, Rule | null>();
function intrude(hi: string, lo: string): Rule | null {
  const key = hi + '>' + lo;
  const hit = ruleCache.get(key);
  if (hit !== undefined) return hit;
  const H = INFO[hi];
  const L = INFO[lo];
  let r: Rule | null = null;
  const seed = (hi.length * 31 + lo.length * 7 + hi.charCodeAt(0) * 3 + lo.charCodeAt(0)) % 997;
  if (H && L && hi !== lo) {
    if (H.cls === 'liquid' && L.cls === 'liquid') r = H.rank > L.rank ? { mode: 'dith', reach: 8, seed } : null;
    else if (H.cls === 'soft' && L.cls === 'liquid') r = { mode: 'rag', reach: 3.4, seed };
    else if (H.cls === 'soft' && L.cls === 'soft') {
      if (H.rank > L.rank) r = H.grassy && L.grassy ? { mode: 'rag', reach: 5, seed, f: 4 } : { mode: 'rag', reach: H.grassy || H.fam === 'snow' ? 3.6 : 2.8, seed };
    } else if (H.cls === 'soft' && L.cls === 'hard' && L.fam !== 'bridge') r = { mode: 'rag', reach: H.grassy ? 1.1 : 0.8, seed, f: 1.2 };
  }
  ruleCache.set(key, r);
  return r;
}
function distTo(cx: number, cy: number, dx: number, dy: number): number {
  const ex = dx < 0 ? cx : dx > 0 ? 16 - cx : 0;
  const ey = dy < 0 ? cy : dy > 0 ? 16 - cy : 0;
  if (dx === 0) return ey;
  if (dy === 0) return ex;
  return Math.sqrt(ex * ex + ey * ey);
}

interface Grp { nid: string; rank: number; rule: Rule; dirs: number[] }
/** Intruding neighbour groups around the sub-tile at (ox, oy) of the 5x5. */
function groupsAt(ids5: string[], ox: number, oy: number): Grp[] {
  const at = (dx: number, dy: number) => ids5[(dy + 2) * 5 + dx + 2];
  const base = at(ox, oy);
  const out: Grp[] = [];
  if (!INFO[base]) return out;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nid = at(ox + dx, oy + dy);
      if (nid === base) continue;
      const rule = intrude(nid, base);
      if (!rule) continue;
      let g = out.find((q) => q.nid === nid);
      if (!g) {
        g = { nid, rank: INFO[nid].rank, rule, dirs: [] };
        out.push(g);
      }
      g.dirs.push(dx, dy);
    }
  return out;
}
/** Which terrain shows at a fine pixel; px, py are world px inside the sub-tile; X, Y fine world coords. */
function ownerFine(base: string, grps: Grp[], px: number, py: number, X: number, Y: number): string {
  let best = base;
  let bestRank = -1e9;
  const wx = X / K;
  const wy = Y / K;
  for (const g of grps) {
    let d = 1e9;
    for (let i = 0; i < g.dirs.length; i += 2) {
      const dd = distTo(px, py, g.dirs[i], g.dirs[i + 1]);
      d = d === 1e9 ? dd : smin(d, dd, 7);
    }
    const rule = g.rule;
    if (d > rule.reach * 2.4 + 1) continue;
    let claim: boolean;
    if (rule.mode === 'rag') {
      const f = rule.f ?? 2.6;
      const nz =
        (vnoise(wx / f, wy / f, rule.seed) - 0.5) * rule.reach * 1.2 +
        (vnoise(wx / (f * 3.3), wy / (f * 3.3), rule.seed + 11) - 0.5) * rule.reach * 0.9 +
        (hh(X, Y, rule.seed + 5) - 0.5) * 0.5;
      claim = d < rule.reach + nz;
    } else {
      const wob = 0.75 + vnoise(wx / 9, wy / 9, rule.seed) * 0.5;
      claim = d < rule.reach * wob * (1 - (bay(X, Y) * 0.45 + hh(X, Y, rule.seed + 9) * 0.55));
    }
    if (claim && g.rank > bestRank) {
      best = g.nid;
      bestRank = g.rank;
    }
  }
  return best;
}

// ---------------------------------------------------------------- tile renderer
/** Owner-grid margin in fine pixels (tufts up to this tall overhang consistently across tiles). */
const M = 10;
const GW = TS + M * 2;
function renderTile(id: TerrainId, tx: number, ty: number, ids5: string[]): Uint32Array {
  const buf = new Uint32Array(TS * TS);
  // Fast path: the 3x3 around us is all one terrain, so every pixel of the
  // owner grid is ours and the per-pixel ownership work can be skipped.
  let same9 = true;
  for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) if (ids5[(oy + 2) * 5 + ox + 2] !== id) same9 = false;
  const own: string[] = same9 ? [] : new Array(GW * GW);
  // which of the 3x3 tiles around us actually blend with a neighbour?
  const grps: Grp[][] = [];
  if (!same9) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) grps.push(groupsAt(ids5, ox, oy));
  const X0 = tx * TS;
  const Y0 = ty * TS;
  if (!same9)
  for (let ly = -M; ly < TS + M; ly++)
    for (let lx = -M; lx < TS + M; lx++) {
      const ox = lx < 0 ? -1 : lx >= TS ? 1 : 0;
      const oy = ly < 0 ? -1 : ly >= TS ? 1 : 0;
      const g = grps[(oy + 1) * 3 + ox + 1];
      const base = ids5[(oy + 2) * 5 + ox + 2];
      own[(ly + M) * GW + lx + M] = g.length ? ownerFine(base, g, (lx - ox * TS + 0.5) / K, (ly - oy * TS + 0.5) / K, X0 + lx, Y0 + ly) : base;
    }
  const inG = (lx: number, ly: number) => lx >= -M && ly >= -M && lx < TS + M && ly < TS + M;
  const self = INFO[id];
  const O = same9 ? () => id : (lx: number, ly: number) => (inG(lx, ly) ? own[(ly + M) * GW + lx + M] : id);
  const infoG: (TInfo | undefined)[] = new Array(GW * GW);
  const hG = new Float32Array(GW * GW);
  if (same9) {
    infoG.fill(self);
    hG.fill(self ? self.height : -1);
  } else
    for (let i = 0; i < GW * GW; i++) {
      const inf = INFO[own[i]];
      infoG[i] = inf;
      hG[i] = inf ? inf.height : isWall(own[i]) ? 9 : -1;
    }
  const IA = (lx: number, ly: number) => (inG(lx, ly) ? infoG[(ly + M) * GW + lx + M] : undefined);
  const HA = (lx: number, ly: number) => (inG(lx, ly) ? hG[(ly + M) * GW + lx + M] : -1);
  // 1. base texture
  if (same9) {
    const tex = self.tex;
    for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) buf[y * TS + x] = tex(X0 + x, Y0 + y);
  } else
    for (let y = 0; y < TS; y++)
      for (let x = 0; x < TS; x++) {
        const info = IA(x, y) ?? self;
        buf[y * TS + x] = info.tex(X0 + x, Y0 + y);
      }
  // undecorated texture memo (tile + margins) so decorations can shade relative to it
  const memo = new Uint32Array(GW * GW);
  for (let y = 0; y < TS; y++) memo.set(buf.subarray(y * TS, y * TS + TS), (y + M) * GW + M);
  const baseAt = (X: number, Y: number) => {
    const lx = X - X0;
    const ly = Y - Y0;
    if (!inG(lx, ly)) return (IA(lx, ly) ?? self).tex(X, Y);
    const i = (ly + M) * GW + lx + M;
    return memo[i] || (memo[i] = (infoG[i] ?? self).tex(X, Y));
  };
  // 2. decorations, clipped to each owner's pixels (grass may overhang lower ground)
  const owners = new Set<string>([id]);
  if (!same9 && grps.some((g) => g.length)) for (let i = 0; i < GW * GW; i++) if (INFO[own[i]]) owners.add(own[i]);
  for (const oid of owners) {
    const info = INFO[oid];
    if (!info?.deco) continue;
    const mine = (X: number, Y: number) => O(X - X0, Y - Y0) === oid;
    info.deco({
      X0,
      Y0,
      mine,
      base: baseAt,
      put: (X, Y, c, over) => {
        const lx = X - X0;
        const ly = Y - Y0;
        if (lx < 0 || ly < 0 || lx >= TS || ly >= TS) return;
        const o = O(lx, ly);
        if (o !== oid) {
          if (!over) return;
          const I = INFO[o];
          if (!I || I.cls === 'liquid' || I.cls === 'floor' || I.rank >= info.rank || I.fam === 'bridge') return;
        }
        buf[ly * TS + lx] = c;
      },
    });
  }
  // 3. edge effects from the owner grid (skipped when the whole 5x5 is one terrain)
  let uniform = true;
  for (let i = 1; i < 25; i++) if (ids5[i] !== ids5[0]) uniform = false;
  if (!uniform)
    for (let y = 0; y < TS; y++)
      for (let x = 0; x < TS; x++) {
        const I = IA(x, y);
        if (!I) continue;
        let c = buf[y * TS + x];
        const h = I.height;
        const X = X0 + x;
        const Y = Y0 + y;
        const b = bay(X, Y);
        if (I.cls === 'liquid') {
          // shoreline: a bright foam line, a darker wet band, a dotted second line
          let near = 9;
          for (let r = 1; r <= 6 && near === 9; r++)
            for (let dy = -r; dy <= r && near === 9; dy++)
              for (let dx = -r; dx <= r; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
                if (IA(x + dx, y + dy)?.cls === 'soft') {
                  near = r;
                  break;
                }
              }
          if (near <= 6) {
            const fz = vnoise(X / 5, Y / 5, 993);
            const gap = vnoise(X / 9, Y / 9, 994);
            if (near <= 2) c = near === 1 || gap > 0.35 ? (fz < 0.3 ? WATER.foam2 : WATER.foam) : liA(c, 0.3);
            else if (near === 3) c = gap > 0.5 && b < 0.5 ? WATER.foam2 : shA(c, 0.12);
            else if (near === 5 && fz > 0.55 && gap > 0.3) c = b < 0.6 ? WATER.foam2 : liA(c, 0.25);
            else if (near === 6 && fz > 0.7 && b < 0.3) c = liA(c, 0.25);
          }
        }
        const softOverWater = (n: TInfo | undefined) => I.cls === 'liquid' && n?.cls === 'soft';
        const U = IA(x, y - 1);
        const Lf = IA(x - 1, y);
        if (HA(x, y - 1) > h && !softOverWater(U)) c = shA(c, 0.32);
        else if (HA(x, y - 2) > h && !softOverWater(IA(x, y - 2))) c = shA(c, 0.22);
        else if (HA(x - 1, y) > h && !softOverWater(Lf)) c = shA(c, 0.2);
        else if (HA(x, y - 3) > h && IA(x, y - 3)?.cls !== 'liquid' && b < 0.55) c = shA(c, 0.14);
        else if (HA(x - 2, y) > h && !softOverWater(IA(x - 2, y)) && b < 0.5) c = shA(c, 0.1);
        else if (HA(x, y - 4) > h && IA(x, y - 4)?.cls !== 'soft' && IA(x, y - 4)?.cls !== 'liquid' && b < 0.3) c = shA(c, 0.1);
        if (I.cls === 'soft') {
          if (I.fam === 'sand') {
            let wet = 9;
            for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if (IA(x + dx, y + dy)?.cls === 'liquid') wet = Math.min(wet, Math.max(Math.abs(dx), Math.abs(dy)));
            if (wet <= 2) c = wet === 1 ? SAND.wet : hh(X, Y, 995) < 0.1 ? SAND.hi : SAND.wet;
            else if (wet <= 4) c = b < (wet === 3 ? 0.6 : 0.3) ? SAND.wet2 : c;
          } else {
            // an earthy bank where the ground drops into water
            let bank = 0;
            for (let k = 1; k <= 4; k++)
              if (IA(x, y + k)?.cls === 'liquid') {
                bank = k;
                break;
              }
            if (bank) {
              const n = hh(X, Y, 996);
              if (bank <= 2) c = n < 0.15 ? C('#5a3c42') : bank === 1 ? C('#6a4644') : C('#7a5248');
              else c = b < 0.6 ? (n < 0.2 ? C('#a8785a') : C('#93664c')) : c;
            }
          }
        }
        if ((I.cls === 'hard' || I.cls === 'floor') && I.fam !== 'asphalt') {
          const U2 = IA(x, y - 2);
          if (U && (U.cls === 'hard' || U.cls === 'floor') && U.fam !== I.fam) c = shA(c, 0.28);
          else if (U2 && (U2.cls === 'hard' || U2.cls === 'floor') && U2.fam !== I.fam) c = shA(c, 0.14);
          else if (Lf && (Lf.cls === 'hard' || Lf.cls === 'floor') && Lf.fam !== I.fam) c = shA(c, 0.2);
        }
        buf[y * TS + x] = c;
      }
  // 4. structure that depends on neighbours
  if (self.post) {
    const get = (lx: number, ly: number) => (lx >= 0 && ly >= 0 && lx < TS && ly < TS ? buf[ly * TS + lx] : 0);
    const set = (lx: number, ly: number, c: number) => {
      if (lx >= 0 && ly >= 0 && lx < TS && ly < TS) buf[ly * TS + lx] = c;
    };
    self.post({
      buf,
      id,
      tx,
      ty,
      X0,
      Y0,
      n: (dx, dy) => ids5[(dy + 2) * 5 + dx + 2] as TerrainId,
      own: O,
      get,
      set,
      sh: (lx, ly, k) => {
        if (lx >= 0 && ly >= 0 && lx < TS && ly < TS) buf[ly * TS + lx] = shA(buf[ly * TS + lx], k);
      },
    });
  }
  // road gutters below curbs
  if (self.fam === 'asphalt' && INFO[ids5[1 * 5 + 2]]?.fam === 'sidewalk') {
    const ks = [0.46, 0.36, 0.26, 0.18, 0.12, 0.07];
    for (let y = 0; y < ks.length; y++)
      for (let x = 0; x < TS; x++) if (y < 3 || bay(X0 + x, Y0 + y) < 0.6) buf[y * TS + x] = shA(buf[y * TS + x], ks[y]);
  }
  return buf;
}

// ---------------------------------------------------------------- blitting
interface Scratch { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: ImageData; d32: Uint32Array }
function mkScratch(n: number, k: number): Scratch {
  const cv = document.createElement('canvas');
  cv.width = n;
  cv.height = n;
  const sctx = cv.getContext('2d', { willReadFrequently: true })!;
  const img = sctx.createImageData(n, n);
  if (k > 1) (cv as unknown as { __k: number }).__k = k;
  return { cv, ctx: sctx, img, d32: new Uint32Array(img.data.buffer) };
}
let fineScratch: Scratch | null = null;
let coarseScratch: Scratch | null = null;
/** Does this context put more than one device pixel on each world pixel? */
export function isFineTarget(ctx: CanvasRenderingContext2D): boolean {
  const m = ctx.getTransform();
  return Math.hypot(m.a, m.b) >= 1.99;
}
/** Box-filter a 2x buffer down to 1x (for targets without fine pixels). */
function down2(d: Uint32Array, n: number): Uint32Array {
  const h = n >> 1;
  const o = new Uint32Array(h * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < h; x++) {
      const i = y * 2 * n + x * 2;
      const a = d[i];
      const b = d[i + 1];
      const c = d[i + n];
      const e = d[i + n + 1];
      const r = ((a & 255) + (b & 255) + (c & 255) + (e & 255) + 2) >> 2;
      const g = (((a >>> 8) & 255) + ((b >>> 8) & 255) + ((c >>> 8) & 255) + ((e >>> 8) & 255) + 2) >> 2;
      const bl = (((a >>> 16) & 255) + ((b >>> 16) & 255) + ((c >>> 16) & 255) + ((e >>> 16) & 255) + 2) >> 2;
      o[y * h + x] = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0;
    }
  return o;
}
/** Blit a cached tile. A CPU-backed scratch canvas keeps put+draw cheap (GPU scratch canvases stall badly). */
function blit(ctx: CanvasRenderingContext2D, key: string, d: Uint32Array, x: number, y: number): void {
  if (isFineTarget(ctx)) {
    if (!fineScratch) fineScratch = mkScratch(TS, K);
    fineScratch.d32.set(d);
    fineScratch.ctx.putImageData(fineScratch.img, 0, 0);
    ctx.drawImage(fineScratch.cv, x, y);
    return;
  }
  if (!coarseScratch) coarseScratch = mkScratch(16, 1);
  let c = coarseCache.get(key);
  if (!c) {
    c = down2(d, TS);
    coarseCache.set(key, c);
  }
  coarseScratch.d32.set(c);
  coarseScratch.ctx.putImageData(coarseScratch.img, 0, 0);
  ctx.drawImage(coarseScratch.cv, x, y);
}

// ---------------------------------------------------------------- registration
const tileCache = new Map<string, Uint32Array>();
const coarseCache = new Map<string, Uint32Array>();
const MAX_CACHE = 6000;
function makeDraw(id: TerrainId) {
  return (ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, n: NeighborFn) => {
    const ids5: string[] = new Array(25);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) ids5[(dy + 2) * 5 + dx + 2] = dx === 0 && dy === 0 ? id : n(dx, dy) ?? 'void';
    const key = SEASON + '|' + id + '|' + tx + ',' + ty + '|' + ids5.join(',');
    let d = tileCache.get(key);
    if (!d) {
      if (tileCache.size > MAX_CACHE) {
        tileCache.clear();
        coarseCache.clear();
      }
      d = renderTile(id, tx, ty, ids5);
      tileCache.set(key, d);
    }
    blit(ctx, key, d, x, y);
  };
}
const STEP: Record<string, 'soft' | 'hard' | 'wood' | 'water'> = {
  soft: 'soft',
  liquid: 'water',
  hard: 'hard',
  floor: 'hard',
};
const IDS: TerrainId[] = [
  'grass', 'grass-dark', 'flowers', 'dirt', 'dirt-dark', 'path', 'sidewalk', 'road', 'road-line', 'crosswalk', 'brick', 'concrete', 'parking', 'gravel',
  'water', 'shallow', 'deep-water', 'sand', 'mud', 'bridge', 'wood', 'wood-dark', 'tile', 'checker', 'carpet', 'carpet-red', 'mat', 'rubber', 'stone',
  'dungeon', 'tilled', 'snow',
];
for (const id of IDS) {
  const info = INFO[id];
  let step = STEP[info.cls];
  if (id === 'wood' || id === 'wood-dark' || id === 'bridge') step = 'wood';
  if (id === 'carpet' || id === 'carpet-red' || id === 'mat' || id === 'rubber') step = 'soft';
  registerTerrain(id, { solid: info.cls === 'liquid', step, draw: makeDraw(id) });
}
