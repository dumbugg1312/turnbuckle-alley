/**
 * Terrain art (Golden Hour Storybook). Every ground tile is generated from
 * world-pixel-space texture functions, so neighbouring tiles of the same kind
 * join seamlessly and blended edges line up exactly with the tile next door.
 *
 * Each tile is rendered as:
 *   1. an "owner" grid: which terrain shows at each pixel. Higher-ranked soft
 *      terrain (grass) creeps raggedly into its neighbours (dirt, sand, water),
 *      liquids dither into each other, and grass tufts nibble hard edges.
 *   2. base texture of the owner, then world-space decorations (tufts,
 *      flowers, pebbles, ripples) clipped to the owner's pixels.
 *   3. edge effects from the owner grid: lip shadows (light is top-left),
 *      water foam, earthy banks, wet sand, seams between hard surfaces.
 *   4. per-terrain structure that depends on neighbours (curbs, floor shadow
 *      under walls, bridge stringers, road gutters).
 * Tiles are cached by (season, id, position, 5x5 neighbourhood).
 */
import { registerTerrain } from '../../world/registry';
import type { NeighborFn, TerrainId } from '../../world/types';
import { col, liA, mixc, shA, type Spr } from '../kit';

// ---------------------------------------------------------------- seasons
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
let SEASON: Season = 'spring';
const seasonHooks: (() => void)[] = [];
/** Switch the season for terrain and trees. Clears cached tiles; maps should re-render their ground. */
export function setSeason(s: Season): void {
  if (s === SEASON) return;
  SEASON = s;
  tileCache.clear();
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
/** Three-octave painterly noise, stretched to roughly 0..1. */
export function fbm(x: number, y: number, seed: number, scale = 1): number {
  const n = vnoise(x / (26 * scale), y / (26 * scale), seed) * 0.55 + vnoise(x / (10 * scale), y / (10 * scale), seed + 7) * 0.3 + vnoise(x / (3.6 * scale), y / (3.6 * scale), seed + 13) * 0.15;
  return Math.max(0, Math.min(1, (n - 0.5) * 1.9 + 0.5));
}
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
const FLOWER_COLS: Record<Season, string[]> = {
  spring: ['#ff8fae', '#ffe070', '#fff6ee', '#c08ae0', '#ff8fae', '#fff6ee', '#ffb6cc'],
  summer: ['#ffe070', '#ff6a5a', '#fff6ee', '#ffb040', '#ff8fae', '#9a7ae0'],
  fall: ['#f2903a', '#c070c0', '#ffd060', '#e8505a', '#9a6ad0'],
  winter: ['#fff6ee', '#e8e8ff', '#ffd0dc'],
};
const DIRT = { deep: C('#7a4c46'), dark: C('#996649'), base: C('#b78252'), lite: C('#cc9a62'), hi: C('#e0b47a'), peb: C('#d8c0a8'), pebD: C('#8e6a5e') };
const DIRTD = { deep: C('#583844'), dark: C('#6e4646'), base: C('#875a4a'), lite: C('#9c6c52'), hi: C('#b48462'), peb: C('#b8a09a'), pebD: C('#5e4048') };
const WATER = { deep: C('#2f6688'), dark: C('#387893'), base: C('#438aa0'), lite: C('#5ca4ae'), hi: C('#8ccac4'), spark: C('#e6fff4'), foam: C('#eaf6f0'), foam2: C('#b8e2da') };
const SHALLOW = { dark: C('#4c98a2'), base: C('#5eaeae'), lite: C('#78c2b6'), hi: C('#a6dccc'), peb: C('#8cb4a0'), pebL: C('#b4d4b8') };
const DEEP = { deep: C('#243c6e'), dark: C('#294a78'), base: C('#2f5884'), lite: C('#3c6c92'), hi: C('#6a9cb4') };
const SAND = { dark: C('#d0ac7c'), base: C('#e6c896'), lite: C('#f0d8a8'), hi: C('#f8e8c0'), wet: C('#c6a07a'), wet2: C('#d6b488') };
const ROAD = { d2: C('#5e4a6a'), dark: C('#695474'), base: C('#745e7c'), lite: C('#7e6886'), hi: C('#8a7490'), tar: C('#5a4664') };
const SIDEWALK = { base: C('#dfba9c'), b2: C('#d8b296'), lite: C('#ecc9aa'), hi: C('#f3d8bc'), seam: C('#b8928e'), dark: C('#c9a090'), crack: C('#a07a84') };

// ---------------------------------------------------------------- terrain table
type Cls = 'soft' | 'liquid' | 'hard' | 'floor';
interface TileCtx {
  buf: Uint32Array;
  id: TerrainId;
  tx: number;
  ty: number;
  x0: number;
  y0: number;
  n: (dx: number, dy: number) => TerrainId;
  own: (lx: number, ly: number) => string;
  get: (lx: number, ly: number) => number;
  set: (lx: number, ly: number, c: number) => void;
}
type Put = (wx: number, wy: number, c: number) => void;
interface TInfo {
  cls: Cls;
  rank: number;
  height: number;
  fam: string;
  grassy?: boolean;
  tex: (x: number, y: number) => number;
  deco?: (put: Put, x0: number, y0: number) => void;
  post?: (t: TileCtx) => void;
}
const INFO: Record<string, TInfo> = {};

const isWall = (id: string) => id.startsWith('wall');

// jittered-grid stamps in world space -------------------------------------
function cells(x0: number, y0: number, cw: number, ch: number, seed: number, prob: number, cb: (cx: number, cy: number, h: number, gx: number, gy: number) => void): void {
  for (let gy = Math.floor((y0 - 5) / ch); gy <= Math.floor((y0 + 18) / ch); gy++)
    for (let gx = Math.floor((x0 - 5) / cw); gx <= Math.floor((x0 + 18) / cw); gx++) {
      if (hh(gx, gy, seed) > prob) continue;
      const cx = gx * cw + Math.floor(hh(gx, gy, seed + 1) * cw);
      const cy = gy * ch + Math.floor(hh(gx, gy, seed + 2) * ch);
      cb(cx, cy, hh(gx, gy, seed + 3), gx, gy);
    }
}
function stampRows(put: Put, rows: string[], pal: Record<string, number>, x: number, y: number): void {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let i = 0; i < row.length; i++) {
      const c = pal[row[i]];
      if (c !== undefined) put(x + i, y + r, c);
    }
  }
}

// ---------------------------------------------------------------- grass family
const TUFTS = [
  ['..t..', 'h.d.h', 'd.d.d', '.sss.'],
  ['.t.', 'hdh', 'sds'],
  ['t...', 'd.h.', 'd.d.', '.ss.'],
  ['..h.t', '.d.d.', 'sdsd.'],
];
function grassTexWith(P: () => GrassPal, seed: number) {
  return (x: number, y: number) => {
    const p = P();
    const t = fbm(x, y, seed) * 0.92 + (hh(x, y, seed + 40) - 0.5) * 0.14 + 0.04;
    return band(t, [p.dark, p.mid, p.base, p.lite], x, y);
  };
}
function grassDeco(P: () => GrassPal, seed: number, density: number, extras: boolean) {
  return (put: Put, x0: number, y0: number) => {
    const p = P();
    const pal = { t: p.tip, h: p.hi, d: p.dark, s: p.deep };
    cells(x0, y0, 7, 6, seed, density, (cx, cy, h) => {
      stampRows(put, TUFTS[Math.floor(h * TUFTS.length)], pal, cx - 2, cy - 2);
    });
    // light flecks catching the sun
    cells(x0, y0, 4, 4, seed + 9, 0.22, (cx, cy) => put(cx, cy, p.hi));
    if (!extras) return;
    if (SEASON === 'spring' || SEASON === 'summer') {
      // the odd clover and stray daisy
      cells(x0, y0, 16, 14, seed + 21, 0.18, (cx, cy, h) => {
        if (h < 0.5) {
          put(cx, cy, p.deep);
          put(cx + 1, cy, p.dark);
          put(cx, cy - 1, p.lite);
          put(cx + 1, cy - 1, p.dark);
        } else {
          const fc = h < 0.75 ? C('#fff8ee') : C('#ffe27a');
          put(cx, cy, fc);
          put(cx, cy + 1, p.deep);
          put(cx + 1, cy + 1, p.dark);
        }
      });
    } else if (SEASON === 'fall') {
      const leaves = [C('#e8803a'), C('#d65a3a'), C('#f2b84a'), C('#b8483e')];
      cells(x0, y0, 9, 8, seed + 23, 0.45, (cx, cy, h) => {
        const lc = leaves[Math.floor(h * leaves.length)];
        put(cx, cy, lc);
        put(cx + 1, cy, shA(lc, 0.25));
        if (h > 0.5) put(cx, cy - 1, liA(lc, 0.3));
      });
    } else {
      cells(x0, y0, 6, 6, seed + 25, 0.4, (cx, cy) => {
        put(cx, cy, C('#f6f8f4'));
        put(cx + 1, cy, C('#e2e8e8'));
      });
    }
  };
}
INFO['grass'] = { cls: 'soft', rank: 10, height: 3, fam: 'grass', grassy: true, tex: grassTexWith(() => GRASS[SEASON], 3), deco: grassDeco(() => GRASS[SEASON], 101, 0.42, true) };
INFO['grass-dark'] = {
  cls: 'soft',
  rank: 11,
  height: 3,
  fam: 'grass',
  grassy: true,
  tex: grassTexWith(() => GRASS_DARK[SEASON], 5),
  deco: (put, x0, y0) => {
    grassDeco(() => GRASS_DARK[SEASON], 131, 0.62, false)(put, x0, y0);
    // fallen twigs and the occasional tiny toadstool
    cells(x0, y0, 16, 16, 141, 0.16, (cx, cy, h) => {
      if (h < 0.55) {
        put(cx, cy, C('#7a5448'));
        put(cx + 1, cy, C('#7a5448'));
        put(cx + 2, cy + 1, C('#5e3e44'));
      } else {
        put(cx, cy, C('#e2544a'));
        put(cx + 1, cy, C('#e2544a'));
        put(cx - 1, cy, C('#b03a46'));
        put(cx, cy - 1, C('#ff9a8a'));
        put(cx + 1, cy - 1, C('#fff4e0'));
        put(cx, cy + 1, C('#f2e2d0'));
        put(cx, cy + 2, GRASS_DARK[SEASON].deep);
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
  tex: grassTexWith(() => GRASS[SEASON], 3),
  deco: (put, x0, y0) => {
    const p = GRASS[SEASON];
    grassDeco(() => GRASS[SEASON], 101, 0.35, false)(put, x0, y0);
    const fl = FLOWER_COLS[SEASON];
    cells(x0, y0, 5, 5, 151, SEASON === 'winter' ? 0.25 : 0.78, (cx, cy, h, gx, gy) => {
      const fc = C(fl[Math.floor(hh(gx, gy, 152) * fl.length)]);
      const fd = shA(fc, 0.3);
      const big = h > 0.45;
      // stem + leaf
      put(cx, cy + 1, p.dark);
      put(cx, cy + 2, p.deep);
      if (h > 0.7) put(cx + 1, cy + 2, p.mid);
      if (big) {
        put(cx - 1, cy, fc);
        put(cx + 1, cy, fd);
        put(cx, cy - 1, liA(fc, 0.35));
        put(cx, cy + 1, fd);
        put(cx, cy, C('#ffd860'));
      } else {
        put(cx, cy, fc);
        put(cx + 1, cy, fd);
      }
    });
  },
};

// ---------------------------------------------------------------- earth family
function earthTex(P: typeof DIRT, seed: number) {
  return (x: number, y: number) => {
    const t = fbm(x, y, seed, 0.8) * 0.85 + (hh(x, y, seed + 3) - 0.5) * 0.18 + 0.06;
    return band(t, [P.dark, P.base, P.lite], x, y, 0.5);
  };
}
function earthDeco(P: typeof DIRT, seed: number) {
  return (put: Put, x0: number, y0: number) => {
    // pebbles: lit top-left, shadow bottom-right
    cells(x0, y0, 6, 6, seed, 0.42, (cx, cy, h) => {
      if (h < 0.6) {
        put(cx, cy, P.peb);
        put(cx + 1, cy + 1, P.deep);
        put(cx + 1, cy, P.pebD);
      } else {
        put(cx, cy, P.hi);
        put(cx + 1, cy, P.peb);
        put(cx, cy + 1, P.pebD);
        put(cx + 1, cy + 1, P.deep);
        put(cx + 2, cy + 1, P.dark);
      }
    });
    // little dry cracks
    cells(x0, y0, 14, 13, seed + 5, 0.25, (cx, cy, h) => {
      let x = cx;
      let y = cy;
      for (let i = 0; i < 4; i++) {
        put(x, y, P.deep);
        x += 1;
        y += hh(cx + i, cy, seed) < h ? 1 : 0;
      }
    });
  };
}
INFO['dirt'] = { cls: 'soft', rank: 6, height: 2, fam: 'dirt', tex: earthTex(DIRT, 21), deco: earthDeco(DIRT, 201) };
INFO['dirt-dark'] = { cls: 'soft', rank: 5, height: 2, fam: 'dirt', tex: earthTex(DIRTD, 23), deco: earthDeco(DIRTD, 211) };

// cobble / stepping-stone path (Voronoi stones in world space)
const PATH = { gap: C('#7c5e58'), gapD: C('#5e4652'), moss: C('#6a9a58'), s1: C('#d9c9c0'), s2: C('#c9b6b4'), s3: C('#e6d8c6'), s4: C('#bca8b4'), lit: C('#f4eadc'), sh: C('#9a8496') };
function voronoi(x: number, y: number, cell: number, seed: number): { d1: number; d2: number; id: number; dx: number; dy: number } {
  const gx = Math.floor(x / cell);
  const gy = Math.floor(y / cell);
  let d1 = 1e9;
  let d2 = 1e9;
  let id = 0;
  let bdx = 0;
  let bdy = 0;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const cx = (gx + i) * cell + 1 + hh(gx + i, gy + j, seed) * (cell - 2);
      const cy = (gy + j) * cell + 1 + hh(gx + i, gy + j, seed + 1) * (cell - 2);
      const dx = x + 0.5 - cx;
      const dy = (y + 0.5 - cy) * 1.15;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = (gx + i) * 7919 + (gy + j) * 104729;
        bdx = dx;
        bdy = dy;
      } else if (d < d2) d2 = d;
    }
  return { d1, d2, id, dx: bdx, dy: bdy };
}
INFO['path'] = {
  cls: 'soft',
  rank: 7,
  height: 2,
  fam: 'path',
  tex: (x, y) => {
    const v = voronoi(x, y, 7, 301);
    const edge = v.d2 - v.d1;
    if (edge < 1.1) return hh(x, y, 302) < 0.18 ? PATH.moss : edge < 0.5 ? PATH.gapD : PATH.gap;
    const h = hh(v.id, 0, 303);
    const base = h < 0.3 ? PATH.s1 : h < 0.55 ? PATH.s2 : h < 0.8 ? PATH.s3 : PATH.s4;
    if (edge < 2.1 && v.dx + v.dy < 0) return PATH.lit;
    if (edge < 2.1 && v.dx + v.dy > 0.5) return PATH.sh;
    return hh(x, y, 304) < 0.06 ? shA(base, 0.12) : base;
  },
};
INFO['sand'] = {
  cls: 'soft',
  rank: 2,
  height: 2,
  fam: 'sand',
  tex: (x, y) => {
    const t = fbm(x, y, 41, 1.2) * 0.8 + (hh(x, y, 42) - 0.5) * 0.25 + 0.12;
    // wind ripples
    const rip = Math.sin(x * 0.35 + y * 0.9 + vnoise(x / 9, y / 9, 43) * 5);
    if (rip > 0.93) return SAND.lite;
    if (rip < -0.95) return SAND.dark;
    return band(t, [SAND.dark, SAND.base, SAND.lite], x, y, 0.5);
  },
  deco: (put, x0, y0) => {
    cells(x0, y0, 9, 9, 401, 0.4, (cx, cy, h) => {
      if (h < 0.5) {
        put(cx, cy, C('#b49a8e'));
        put(cx + 1, cy, C('#8e7a7e'));
      } else if (h < 0.8) {
        // tiny shell
        put(cx, cy, C('#fff2e6'));
        put(cx + 1, cy, C('#ffd2c4'));
        put(cx, cy + 1, C('#e8b0a6'));
      } else put(cx, cy, SAND.hi);
    });
  },
};
INFO['mud'] = {
  cls: 'soft',
  rank: 1,
  height: 1,
  fam: 'mud',
  tex: (x, y) => {
    const t = fbm(x, y, 51, 0.7) * 0.9 + (hh(x, y, 52) - 0.5) * 0.12;
    const puddle = vnoise(x / 8, y / 5, 53);
    if (puddle > 0.72) {
      if (puddle < 0.75) return C('#4c3238');
      // sky glints on still water
      const g = ((x * 2 + y * 3) % 11 + 11) % 11;
      return g === 0 ? C('#b8a8cc') : puddle > 0.8 ? C('#5a4a64') : C('#4e3e56');
    }
    return band(t, [C('#5c3c3e'), C('#6e4842'), C('#82584a'), C('#946650')], x, y, 0.5);
  },
  deco: (put, x0, y0) => {
    // wet glints and boot prints
    cells(x0, y0, 6, 5, 501, 0.5, (cx, cy) => {
      put(cx, cy, C('#b8907a'));
      put(cx + 1, cy, C('#a07a68'));
    });
    cells(x0, y0, 15, 15, 503, 0.3, (cx, cy) => {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 4], [1, 4]]) put(cx + dx, cy + dy, C('#4c3238'));
    });
  },
};
INFO['gravel'] = {
  cls: 'soft',
  rank: 4,
  height: 2,
  fam: 'gravel',
  tex: (x, y) => {
    const t = fbm(x, y, 61, 0.9);
    const h = hh(x, y, 62);
    const base = band(t * 0.8 + 0.1, [C('#8e7c80'), C('#a08e8c'), C('#b09e96')], x, y, 0.5);
    if (h < 0.1) return C('#d4c6b8');
    if (h < 0.18) return C('#6e5e6a');
    if (h < 0.24) return C('#c0a894');
    if (h > 0.94) return C('#bcb2b8');
    return base;
  },
  deco: (put, x0, y0) => {
    // scattered pebbles, lit from the top-left
    cells(x0, y0, 4, 4, 601, 0.7, (cx, cy, h) => {
      const pc = h < 0.3 ? C('#d8cabc') : h < 0.55 ? C('#c4ae9a') : h < 0.8 ? C('#b8b0b8') : C('#e0d0b8');
      put(cx, cy, liA(pc, 0.25));
      put(cx + 1, cy, pc);
      put(cx, cy + 1, shA(pc, 0.18));
      put(cx + 1, cy + 1, shA(pc, 0.4));
    });
  },
};
INFO['tilled'] = {
  cls: 'soft',
  rank: 3,
  height: 2,
  fam: 'tilled',
  tex: (x, y) => {
    const r = (((y + Math.floor(vnoise(x / 6, y, 71) * 1.6)) % 4) + 4) % 4;
    const n = hh(x, y, 72);
    let c = r === 0 ? C('#8e5c46') : r === 1 ? C('#74483e') : r === 2 ? C('#62403c') : C('#4c3036');
    if (n < 0.08) c = r < 2 ? C('#a06c50') : C('#58383a');
    return c;
  },
  deco: (put, x0, y0) => {
    cells(x0, y0, 5, 4, 701, 0.35, (cx, cy) => {
      put(cx, cy, C('#a87458'));
      put(cx + 1, cy + 1, C('#4c3036'));
    });
  },
};
INFO['snow'] = {
  cls: 'soft',
  rank: 12,
  height: 3,
  fam: 'snow',
  tex: (x, y) => {
    const t = fbm(x, y, 81, 1.3) * 0.9 + 0.08;
    return band(t, [C('#c8cce8'), C('#dfe2f4'), C('#eef0fa'), C('#f8f8fc')], x, y, 0.5);
  },
  deco: (put, x0, y0) => {
    cells(x0, y0, 5, 5, 801, 0.35, (cx, cy) => put(cx, cy, C('#ffffff')));
    cells(x0, y0, 11, 10, 803, 0.3, (cx, cy) => {
      put(cx, cy, C('#b8bede'));
      put(cx + 1, cy, C('#c8cce8'));
      put(cx + 2, cy, C('#b8bede'));
    });
  },
};

// ---------------------------------------------------------------- liquids
function waterTex(P: { dark: number; base: number; lite: number; hi: number }, deepC: number, seed: number) {
  return (x: number, y: number) => {
    const t = fbm(x + y * 0.3, y * 1.6, seed, 1.1) * 0.85 + 0.08;
    // long horizontal wavelets
    const w = Math.sin(x * 0.42 + Math.sin(y * 0.7) * 2.2 + vnoise(x / 11, y / 5, seed + 1) * 6);
    const band2 = ((y + Math.floor(vnoise(x / 13, y / 7, seed + 2) * 4)) % 5 + 5) % 5;
    let c = band(t, [deepC, P.dark, P.base, P.lite], x, y, 0.5);
    if (band2 === 0 && w > 0.55) c = P.hi;
    else if (band2 === 1 && w > 0.75) c = P.lite;
    else if (band2 === 3 && w < -0.8) c = deepC;
    return c;
  };
}
INFO['water'] = {
  cls: 'liquid',
  rank: 1,
  height: 0,
  fam: 'water',
  tex: waterTex(WATER, WATER.deep, 91),
  deco: (put, x0, y0) => {
    // sun sparkles and soft sky reflections
    cells(x0, y0, 9, 8, 901, 0.4, (cx, cy, h) => {
      if (h < 0.6) {
        put(cx, cy, WATER.spark);
        put(cx - 1, cy, WATER.hi);
        put(cx + 1, cy, WATER.hi);
      } else {
        put(cx, cy, C('#9ab8d0'));
        put(cx + 1, cy, C('#b4c4dc'));
        put(cx + 2, cy, C('#9ab8d0'));
      }
    });
  },
};
INFO['shallow'] = {
  cls: 'liquid',
  rank: 2,
  height: 0,
  fam: 'water',
  tex: (x, y) => {
    const v = voronoi(x, y, 6, 95);
    const w = Math.sin(x * 0.5 + Math.sin(y * 0.8) * 2 + vnoise(x / 9, y / 4, 96) * 5);
    // river pebbles seen through the water
    if (v.d1 < 2.2 && hh(v.id, 2, 97) < 0.6) {
      const pc = hh(v.id, 3, 98) < 0.5 ? SHALLOW.peb : SHALLOW.pebL;
      if (v.dx + v.dy < -0.8) return liA(pc, 0.3);
      if (v.dx + v.dy > 0.8) return shA(pc, 0.2);
      return pc;
    }
    if (((y % 4) + 4) % 4 === 0 && w > 0.6) return SHALLOW.hi;
    const t = fbm(x, y * 1.5, 99) * 0.8 + 0.1;
    return band(t, [SHALLOW.dark, SHALLOW.base, SHALLOW.lite], x, y, 0.5);
  },
  deco: (put, x0, y0) => {
    cells(x0, y0, 8, 8, 951, 0.35, (cx, cy) => {
      put(cx, cy, WATER.spark);
      put(cx + 1, cy, SHALLOW.hi);
    });
  },
};
INFO['deep-water'] = {
  cls: 'liquid',
  rank: 0,
  height: 0,
  fam: 'water',
  tex: waterTex({ dark: DEEP.dark, base: DEEP.base, lite: DEEP.lite, hi: DEEP.hi }, DEEP.deep, 93),
  deco: (put, x0, y0) => {
    cells(x0, y0, 12, 10, 971, 0.28, (cx, cy) => {
      put(cx, cy, C('#8ab4c8'));
      put(cx + 1, cy, DEEP.hi);
    });
  },
};

// ---------------------------------------------------------------- hard outdoor
function asphalt(x: number, y: number): number {
  const t = fbm(x, y, 111, 1.4) * 0.7 + 0.15;
  const n = hh(x, y, 112);
  if (n < 0.045) return ROAD.hi;
  if (n > 0.965) return ROAD.d2;
  return band(t, [ROAD.dark, ROAD.base, ROAD.lite], x, y, 0.35);
}
function roadPatch(t: TileCtx): void {
  const h = hh(t.tx, t.ty, 113);
  if (h < 0.08) {
    // an old rectangular tar patch
    const px = 2 + Math.floor(hh(t.tx, t.ty, 114) * 6);
    const py = 2 + Math.floor(hh(t.tx, t.ty, 115) * 6);
    const pw = 5 + Math.floor(hh(t.tx, t.ty, 116) * 5);
    const ph = 4 + Math.floor(hh(t.tx, t.ty, 117) * 4);
    for (let y = py; y < py + ph; y++)
      for (let x = px; x < px + pw; x++) {
        if (t.own(x, y) !== t.id) continue;
        const edge = x === px || y === py || x === px + pw - 1 || y === py + ph - 1;
        t.set(x, y, edge ? (hh(x + t.x0, y + t.y0, 124) < 0.3 ? ROAD.dark : ROAD.tar) : hh(x + t.x0, y + t.y0, 118) < 0.12 ? ROAD.base : mixc(ROAD.dark, ROAD.base, 0.5));
      }
  } else if (h < 0.16) {
    // snaking tar crack
    let x = Math.floor(hh(t.tx, t.ty, 119) * 12) + 2;
    let y = 0;
    while (y < 16) {
      if (t.own(x, y) === t.id) t.set(x, y, ROAD.tar);
      y++;
      x += hh(x, y + t.ty * 16, 120) < 0.35 ? 1 : hh(x, y, 121) < 0.35 ? -1 : 0;
    }
  }
  // leaves blown into the gutter under a curb
  if (INFO[t.n(0, -1)]?.fam === 'sidewalk') {
    const leaves = SEASON === 'fall' ? 6 : 2;
    for (let i = 0; i < leaves; i++) {
      const lx = Math.floor(hh(t.tx, i, 122 + t.ty) * 15);
      const ly = 2 + Math.floor(hh(i, t.ty, 123 + t.tx) * 2);
      const lc = [C('#e8a050'), C('#d06a40'), C('#f2c060'), C('#8ab868')][(i + t.tx) % 4];
      t.set(lx, ly, lc);
    }
  }
}
INFO['road'] = { cls: 'hard', rank: 0, height: 1, fam: 'asphalt', tex: asphalt, post: roadPatch };
INFO['road-line'] = {
  cls: 'hard',
  rank: 0,
  height: 1,
  fam: 'asphalt',
  tex: (x, y) => {
    const ly = ((y % 16) + 16) % 16;
    const lx = ((x % 16) + 16) % 16;
    if ((ly === 7 || ly === 8) && lx >= 3 && lx < 13) {
      const n = hh(x, y, 131);
      return n < 0.1 ? ROAD.lite : ly === 8 ? C('#d8b064') : n > 0.9 ? C('#fbe0a0') : C('#f2cf78');
    }
    return asphalt(x, y);
  },
  post: roadPatch,
};
INFO['crosswalk'] = {
  cls: 'hard',
  rank: 0,
  height: 1,
  fam: 'asphalt',
  tex: (x, y) => {
    const lx = ((x % 8) + 8) % 8;
    const ly = ((y % 16) + 16) % 16;
    if (lx >= 1 && lx <= 5 && ly >= 1 && ly <= 14) {
      const n = hh(x, y, 141);
      if (n < 0.07) return ROAD.lite;
      return lx === 5 ? C('#ccb4b0') : n > 0.92 ? C('#f2e4d8') : C('#e4cfc0');
    }
    return asphalt(x, y);
  },
};
INFO['parking'] = {
  cls: 'hard',
  rank: 0,
  height: 1,
  fam: 'asphalt',
  tex: asphalt,
  post: (t) => {
    if (((t.ty % 2) + 2) % 2 === 0) {
      for (let x = 0; x < 16; x++) {
        if (t.own(x, 1) !== t.id) continue;
        const n = hh(x + t.x0, t.y0, 151);
        t.set(x, 1, n < 0.08 ? ROAD.lite : C('#ece2d8'));
        t.set(x, 2, n > 0.85 ? C('#ece2d8') : t.get(x, 2));
      }
    }
    // oil drip in some stalls
    if (hh(t.tx, t.ty, 152) < 0.18) {
      const cx = 5 + Math.floor(hh(t.tx, t.ty, 153) * 6);
      const cy = 6 + Math.floor(hh(t.tx, t.ty, 154) * 6);
      for (const [dx, dy] of [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2]]) t.set(cx + dx, cy + dy, C('#5a4462'));
      t.set(cx + 1, cy, C('#8a7ab0'));
    }
  },
};
INFO['sidewalk'] = {
  cls: 'hard',
  rank: 0,
  height: 3,
  fam: 'sidewalk',
  tex: (x, y) => {
    const lx = ((x % 16) + 16) % 16;
    const ly = ((y % 16) + 16) % 16;
    if (lx === 0 || ly === 0) return SIDEWALK.seam;
    if (lx === 1 || ly === 1) return SIDEWALK.lite;
    if (lx === 15 || ly === 15) return SIDEWALK.b2;
    const n = hh(x, y, 161);
    if (n < 0.04) return SIDEWALK.lite;
    if (n > 0.97) return SIDEWALK.dark;
    return band(fbm(x, y, 162, 1.5), [SIDEWALK.b2, SIDEWALK.base, SIDEWALK.base], x, y, 0.3);
  },
  post: (t) => {
    const h = hh(t.tx, t.ty, 163);
    if (h < 0.12) {
      // crack with a determined little weed
      let x = 3 + Math.floor(hh(t.tx, t.ty, 164) * 9);
      let y = 2 + Math.floor(hh(t.tx, t.ty, 165) * 4);
      const sx = x;
      const sy = y;
      for (let i = 0; i < 7; i++) {
        if (t.own(x, y) === t.id) t.set(x, y, SIDEWALK.crack);
        x += hh(i, t.tx, 166) < 0.5 ? 1 : -1;
        y += hh(i, t.ty, 167) < 0.6 ? 1 : 0;
      }
      if (h < 0.06) {
        t.set(sx + 1, sy - 1, C('#7aa860'));
        t.set(sx + 2, sy - 2, C('#9ac870'));
        t.set(sx, sy - 2, C('#7aa860'));
      }
    } else if (h < 0.17) {
      // a gum spot
      const gx = 4 + Math.floor(hh(t.tx, t.ty, 168) * 8);
      const gy = 4 + Math.floor(hh(t.tx, t.ty, 169) * 8);
      t.set(gx, gy, C('#a8949e'));
      t.set(gx + 1, gy, C('#968290'));
      t.set(gx, gy + 1, C('#8a7684'));
      t.set(gx + 1, gy + 1, C('#a08c98'));
    } else if (h < 0.2 && SEASON !== 'winter') {
      // chalk drawing: a tiny hopscotch heart
      const gx = 5 + Math.floor(hh(t.tx, t.ty, 170) * 6);
      const gy = 5 + Math.floor(hh(t.tx, t.ty, 171) * 6);
      const ch = hh(t.tx, t.ty, 172) < 0.5 ? C('#ff9ab8') : C('#8ad0e8');
      for (const [dx, dy] of [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) t.set(gx + dx, gy + dy, ch);
    }
    // curbs where the sidewalk meets the street
    const road = (dx: number, dy: number) => INFO[t.n(dx, dy)]?.fam === 'asphalt';
    if (road(0, 1)) {
      for (let x = 0; x < 16; x++) {
        if (t.own(x, 11) !== t.id) continue;
        t.set(x, 11, C('#fbe4c8'));
        t.set(x, 12, C('#f2d8bc'));
        t.set(x, 13, C('#b8949a'));
        t.set(x, 14, C('#a8848e'));
        t.set(x, 15, C('#7a5a76'));
        if ((x + t.tx * 16) % 16 === 0) {
          t.set(x, 12, SIDEWALK.seam);
          t.set(x, 13, C('#94707e'));
        }
      }
    }
    if (road(0, -1)) {
      for (let x = 0; x < 16; x++) {
        t.set(x, 0, C('#8a6a7e'));
        t.set(x, 1, C('#f8e0c4'));
        t.set(x, 2, C('#ecd0b2'));
      }
    }
    if (road(-1, 0)) {
      for (let y = 0; y < 16; y++) {
        t.set(0, y, C('#a8848e'));
        t.set(1, y, C('#f8e0c4'));
        t.set(2, y, C('#ecd0b2'));
      }
    }
    if (road(1, 0)) {
      for (let y = 0; y < 16; y++) {
        t.set(13, y, C('#ecd0b2'));
        t.set(14, y, C('#f8e0c4'));
        t.set(15, y, C('#a8848e'));
      }
    }
    // curb corners
    if (road(0, 1) && road(1, 0)) for (let y = 11; y < 16; y++) t.set(15, y, C('#7a5a76'));
    if (road(0, 1) && road(-1, 0)) for (let y = 11; y < 16; y++) t.set(0, y, C('#94707e'));
  },
};
INFO['concrete'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'concrete',
  tex: (x, y) => {
    const lx = ((x % 32) + 32) % 32;
    const ly = ((y % 32) + 32) % 32;
    if (lx === 0 || ly === 0) return C('#a8969e');
    if (lx === 1 || ly === 1) return C('#dcd0cc');
    const n = hh(x, y, 181);
    if (n < 0.05) return C('#d6cac6');
    if (n > 0.96) return C('#ae9ea4');
    return band(fbm(x, y, 182, 1.6), [C('#bcaeb0'), C('#c6b8b8'), C('#cec2c0')], x, y, 0.4);
  },
  post: (t) => {
    if (hh(t.tx, t.ty, 183) < 0.12) {
      const cx = 3 + Math.floor(hh(t.tx, t.ty, 184) * 9);
      const cy = 3 + Math.floor(hh(t.tx, t.ty, 185) * 9);
      for (const [dx, dy] of [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 2]]) if (t.own(cx + dx, cy + dy) === t.id) t.set(cx + dx, cy + dy, C('#a89aa6'));
    }
  },
};
// basket-weave brick plaza
const BRICKS = [C('#c4584a'), C('#b44c46'), C('#d0664e'), C('#c25c50'), C('#a84648'), C('#d87458')];
INFO['brick'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'brick',
  tex: (x, y) => {
    const bx = Math.floor(x / 8);
    const by = Math.floor(y / 8);
    const lx = x - bx * 8;
    const ly = y - by * 8;
    const horiz = ((bx + by) & 1) === 0;
    // two bricks per 8x8 block
    const a = horiz ? ly : lx; // across
    const along = horiz ? lx : ly;
    const k = a < 4 ? 0 : 1;
    const ia = a - k * 4;
    if (ia === 3 || along === 7) return C('#d9b49a');
    const c = BRICKS[Math.floor(hh(bx * 2 + k, by, 191) * BRICKS.length)];
    if (ia === 0 || along === 0) return liA(c, 0.22);
    if (ia === 2 && along === 6) return shA(c, 0.2);
    return hh(x, y, 192) < 0.07 ? shA(c, 0.12) : c;
  },
  post: (t) => {
    // a few faded bricks and a sprig of moss
    if (hh(t.tx, t.ty, 193) < 0.2) {
      const mx = 1 + Math.floor(hh(t.tx, t.ty, 194) * 13);
      const my = 1 + Math.floor(hh(t.tx, t.ty, 195) * 13);
      t.set(mx, my, C('#7aa860'));
      t.set(mx + 1, my, C('#5a8a5a'));
    }
  },
};
INFO['stone'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'stone',
  tex: (x, y) => {
    const v = voronoi(x, y, 10, 201);
    const edge = v.d2 - v.d1;
    if (edge < 1.1) return edge < 0.5 ? C('#4e4660') : C('#5e5670');
    const h = hh(v.id, 0, 202);
    const base = h < 0.33 ? C('#9a90a4') : h < 0.66 ? C('#aaa0b2') : C('#8e8498');
    if (edge < 2 && v.dx + v.dy < 0) return liA(base, 0.25);
    if (edge < 2 && v.dx + v.dy > 0) return shA(base, 0.18);
    return hh(x, y, 203) < 0.07 ? shA(base, 0.1) : base;
  },
};
INFO['dungeon'] = {
  cls: 'hard',
  rank: 0,
  height: 2,
  fam: 'dungeon',
  tex: (x, y) => {
    const v = voronoi(x, y, 9, 211);
    const edge = v.d2 - v.d1;
    const glow = vnoise(x / 12, y / 12, 212);
    if (edge < 1.1) {
      if (glow > 0.72) return hh(x, y, 213) < 0.5 ? C('#5ad8a0') : C('#3a9a7a');
      return hh(x, y, 214) < 0.3 ? C('#4a7a4a') : C('#262a36');
    }
    const h = hh(v.id, 0, 215);
    let base = h < 0.33 ? C('#4e5e58') : h < 0.66 ? C('#58685e') : C('#46544e');
    if (fbm(x, y, 216) > 0.7) base = mixc(base, C('#5a8a4a'), 0.6);
    if (edge < 2 && v.dx + v.dy < 0) return liA(base, 0.18);
    if (edge < 2 && v.dx + v.dy > 0) return shA(base, 0.22);
    return hh(x, y, 217) < 0.06 ? shA(base, 0.15) : base;
  },
  deco: (put, x0, y0) => {
    // hairline cracks and faint glowing spores
    cells(x0, y0, 13, 12, 221, 0.4, (cx, cy, h) => {
      let x = cx;
      let y = cy;
      for (let i = 0; i < 5; i++) {
        put(x, y, C('#2a2e3a'));
        x += 1;
        y += hh(cx, i, 222) < h ? 1 : -1;
      }
    });
    cells(x0, y0, 10, 9, 223, 0.3, (cx, cy) => {
      put(cx, cy, C('#9affd0'));
    });
  },
};
INFO['bridge'] = {
  cls: 'hard',
  rank: 0,
  height: 4,
  fam: 'bridge',
  tex: (x, y) => {
    const ly = ((y % 4) + 4) % 4;
    const plank = Math.floor(y / 4);
    const h = hh(plank, 0, 231);
    const base = h < 0.3 ? C('#b07a52') : h < 0.6 ? C('#c08a5c') : h < 0.85 ? C('#a46e4c') : C('#c8966a');
    if (ly === 3) return hh(x, plank, 232) < 0.5 ? C('#3a3a52') : C('#4a3e50');
    if (ly === 0) return liA(base, 0.25);
    // occasional seam where two planks butt together
    const seam = Math.floor(hh(plank, 1, 233) * 40);
    if (((x % 40) + 40) % 40 === seam) return C('#5e3e44');
    const g = hh(x >> 2, y, 234);
    if (g < 0.12) return shA(base, 0.15);
    if (ly === 2) return shA(base, 0.1);
    return base;
  },
  post: (t) => {
    const side = (dx: number) => {
      const nid = t.n(dx, 0);
      return INFO[nid]?.fam !== 'bridge';
    };
    // nail heads
    for (let y = 1; y < 16; y += 4) {
      t.set(3, y, C('#8a6a6a'));
      t.set(12, y, C('#8a6a6a'));
    }
    if (side(-1))
      for (let y = 0; y < 16; y++) {
        t.set(0, y, C('#5a3a40'));
        t.set(1, y, C('#8e5e48'));
        t.set(2, y, C('#a8724e'));
      }
    if (side(1))
      for (let y = 0; y < 16; y++) {
        t.set(13, y, C('#a8724e'));
        t.set(14, y, C('#7a4e44'));
        t.set(15, y, C('#4a3040'));
      }
  },
};

// ---------------------------------------------------------------- interior floors
function floorPost(extra?: (t: TileCtx) => void) {
  return (t: TileCtx) => {
    if (extra) extra(t);
    // soft ambient shadow under walls (light comes from the room, top-left)
    const wallUp = isWall(t.n(0, -1));
    const wallL = isWall(t.n(-1, 0));
    if (wallUp)
      for (let x = 0; x < 16; x++)
        for (let y = 0; y < 4; y++) {
          const k = [0.42, 0.28, 0.16, 0.08][y];
          if (y < 2 || bay(x + t.x0, y + t.y0) < 0.5) t.set(x, y, shA(t.get(x, y), k));
        }
    if (wallL)
      for (let y = 0; y < 16; y++)
        for (let x = 0; x < 3; x++) {
          const k = [0.3, 0.16, 0.07][x];
          if (x < 1 || bay(x + t.x0, y + t.y0) < 0.5) t.set(x, y, shA(t.get(x, y), k));
        }
    if (isWall(t.n(1, 0)))
      for (let y = 0; y < 16; y++) t.set(15, y, shA(t.get(15, y), 0.18));
  };
}
function boards(P: { seam: number; dark: number; base: number; lite: number; hi: number; grain: number }, seed: number) {
  return (x: number, y: number) => {
    const row = Math.floor(y / 4);
    const ly = y - row * 4;
    // staggered board ends
    const len = 24;
    const off = Math.floor(hh(row, 0, seed) * len);
    const bxi = Math.floor((x + off) / len);
    const lx = x + off - bxi * len;
    if (ly === 3) return P.seam;
    if (lx === 0) return P.seam;
    const h = hh(bxi, row, seed + 1);
    const base = h < 0.3 ? P.dark : h < 0.75 ? P.base : P.lite;
    if (ly === 0) return lx === 1 ? P.hi : liA(base, 0.18);
    // grain streaks along the board
    const g = vnoise(x / 6, row * 3 + ly * 0.7, seed + 2);
    if (g > 0.72) return P.grain;
    if (hh(x, y, seed + 3) < 0.03) return P.hi;
    // knot
    if (h > 0.93 && lx === 11 && ly === 1) return P.seam;
    return base;
  };
}
INFO['wood'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'wood',
  tex: boards({ seam: C('#94583e'), dark: C('#cc8a52'), base: C('#d99a5c'), lite: C('#e4a868'), hi: C('#f6cc8a'), grain: C('#c47e4c') }, 241),
  post: floorPost(),
};
INFO['wood-dark'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'wood-dark',
  tex: boards({ seam: C('#4a2a3c'), dark: C('#7a4c44'), base: C('#8a5848'), lite: C('#98644e'), hi: C('#b88466'), grain: C('#6e4240') }, 251),
  post: floorPost(),
};
INFO['tile'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'tile',
  tex: (x, y) => {
    // cream squares with a little teal star where four corners meet
    const lx = ((x % 8) + 8) % 8;
    const ly = ((y % 8) + 8) % 8;
    const ix = lx === 7 ? 0 : lx + 1; // distance from the grout cross
    const iy = ly === 7 ? 0 : ly + 1;
    const ax = Math.min(ix, 8 - ix);
    const ay = Math.min(iy, 8 - iy);
    if (ax + ay === 0) return C('#2f8a86');
    if (ax + ay === 1) return C('#4fb0a4');
    if (lx === 7 || ly === 7) return C('#ddd0bc');
    if (lx === 0 || ly === 0) return C('#fffaf0');
    if (lx === 6 || ly === 6) return C('#efe4d0');
    return hh(x, y, 261) < 0.04 ? C('#ece0cc') : C('#f6eedc');
  },
  post: floorPost(),
};
INFO['checker'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'checker',
  tex: (x, y) => {
    const red = ((Math.floor(x / 8) + Math.floor(y / 8)) & 1) === 0;
    const lx = ((x % 8) + 8) % 8;
    const ly = ((y % 8) + 8) % 8;
    // a glossy diagonal sheen across the floor
    const sheen = ((x + y * 2) % 37 + 37) % 37 < 3;
    if (red) {
      if (lx === 0 || ly === 0) return C('#e46a64');
      if (lx === 7 || ly === 7) return C('#a83848');
      return sheen ? C('#e8706a') : C('#d0464e');
    }
    if (lx === 0 || ly === 0) return C('#fffaf2');
    if (lx === 7 || ly === 7) return C('#d8c4b4');
    return sheen ? C('#fffcf4') : hh(x, y, 271) < 0.05 ? C('#eadcca') : C('#f4e8d6');
  },
  post: floorPost(),
};
INFO['carpet'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'carpet',
  tex: (x, y) => {
    const lx = ((x % 8) + 8) % 8;
    const ly = ((y % 8) + 8) % 8;
    const d = Math.abs(lx - 3.5) + Math.abs(ly - 3.5);
    const n = hh(x, y, 281);
    if (d < 1) return C('#a8b4dc');
    if (d > 2.4 && d < 3.6) return n < 0.3 ? C('#5c6aa0') : C('#6876ac');
    return n < 0.08 ? C('#6876ac') : n > 0.94 ? C('#4c5888') : C('#56639a');
  },
  post: floorPost(),
};
INFO['carpet-red'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'carpet-red',
  tex: (x, y) => {
    const lx = ((x % 12) + 12) % 12;
    const ly = ((y % 12) + 12) % 12;
    const d = Math.abs(lx - 5.5) + Math.abs(ly - 5.5);
    const n = hh(x, y, 291);
    // gold lattice of little fleurs on theater red
    if (Math.round(d) === 5) return C('#c89040');
    if (d < 1.1) return C('#f2c45a');
    if (d < 2.1 && (lx === 5 || lx === 6 || ly === 5 || ly === 6)) return C('#d8a040');
    return n < 0.08 ? C('#b23e44') : n > 0.94 ? C('#7e2438') : C('#9c3040');
  },
  post: floorPost(),
};
INFO['mat'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'mat',
  tex: (x, y) => {
    const n = hh(x, y, 301);
    const weave = ((x + y) & 1) === 0;
    const t = fbm(x, y, 302, 1.8);
    if (t > 0.78 && n < 0.5) return C('#a8aed0');
    if (n < 0.05) return C('#d6dbee');
    return weave ? C('#bcc2de') : C('#b4bad8');
  },
  post: floorPost(),
};
INFO['rubber'] = {
  cls: 'floor',
  rank: 0,
  height: 2,
  fam: 'rubber',
  tex: (x, y) => {
    const n = hh(x, y, 311);
    const lx = ((x % 32) + 32) % 32;
    const ly = ((y % 32) + 32) % 32;
    if (lx === 0 || ly === 0) return C('#2a2436');
    if (n < 0.03) return C('#6aa0a0');
    if (n < 0.06) return C('#a06a7a');
    if (n < 0.1) return C('#8a8098');
    if (n > 0.95) return C('#2e283a');
    return band(fbm(x, y, 312, 1.5), [C('#363044'), C('#3c3548'), C('#42394e')], x, y, 0.5);
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
      if (H.rank > L.rank) r = H.grassy && L.grassy ? { mode: 'dith', reach: 9, seed } : { mode: 'rag', reach: H.grassy || H.fam === 'snow' ? 3.6 : 2.8, seed };
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

/** Which terrain shows at a pixel. ids5 = 5x5 neighbourhood of the tile being rendered. */
function ownerAt(ids5: string[], tx: number, ty: number, lx: number, ly: number): string {
  const ox = lx < 0 ? -1 : lx >= 16 ? 1 : 0;
  const oy = ly < 0 ? -1 : ly >= 16 ? 1 : 0;
  const at = (dx: number, dy: number) => ids5[(dy + 2) * 5 + dx + 2];
  const base = at(ox, oy);
  if (!INFO[base]) return base;
  const px = lx - ox * 16 + 0.5;
  const py = ly - oy * 16 + 0.5;
  const wx = (tx + ox) * 16 + lx - ox * 16;
  const wy = (ty + oy) * 16 + ly - oy * 16;
  let best = base;
  let bestRank = -1e9;
  // group neighbours by terrain id
  const seen: string[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nid = at(ox + dx, oy + dy);
      if (nid === base || seen.includes(nid)) continue;
      seen.push(nid);
      const rule = intrude(nid, base);
      if (!rule) continue;
      let d = 1e9;
      for (let ey = -1; ey <= 1; ey++)
        for (let ex = -1; ex <= 1; ex++) {
          if ((!ex && !ey) || at(ox + ex, oy + ey) !== nid) continue;
          const dd = distTo(px, py, ex, ey);
          d = d === 1e9 ? dd : smin(d, dd, 7);
        }
      let claim: boolean;
      if (rule.mode === 'rag') {
        const f = rule.f ?? 2.6;
        const nz = (vnoise(wx / f, wy / f, rule.seed) - 0.5) * rule.reach * 1.25 + (hh(wx, wy, rule.seed + 5) - 0.5) * 0.9;
        claim = d < rule.reach + nz;
      } else {
        const wob = 0.75 + vnoise(wx / 9, wy / 9, rule.seed) * 0.5;
        claim = d < rule.reach * wob * (1 - bay(wx, wy));
      }
      if (claim && INFO[nid].rank > bestRank) {
        best = nid;
        bestRank = INFO[nid].rank;
      }
    }
  return best;
}

// ---------------------------------------------------------------- tile renderer
const M = 2;
const GW = 16 + M * 2;
function renderTile(id: TerrainId, tx: number, ty: number, ids5: string[]): Spr {
  const buf = new Uint32Array(256);
  const own: string[] = new Array(GW * GW);
  // which of the 3x3 tiles around us actually blend with a neighbour?
  const blends: boolean[] = [];
  for (let oy = -1; oy <= 1; oy++)
    for (let ox = -1; ox <= 1; ox++) {
      const base = ids5[(oy + 2) * 5 + ox + 2];
      let b = false;
      for (let dy = -1; dy <= 1 && !b; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nid = ids5[(oy + dy + 2) * 5 + ox + dx + 2];
          if (nid !== base && intrude(nid, base)) {
            b = true;
            break;
          }
        }
      blends.push(b);
    }
  for (let ly = -M; ly < 16 + M; ly++)
    for (let lx = -M; lx < 16 + M; lx++) {
      const ox = lx < 0 ? -1 : lx >= 16 ? 1 : 0;
      const oy = ly < 0 ? -1 : ly >= 16 ? 1 : 0;
      own[(ly + M) * GW + lx + M] = blends[(oy + 1) * 3 + ox + 1] ? ownerAt(ids5, tx, ty, lx, ly) : ids5[(oy + 2) * 5 + ox + 2];
    }
  const O = (lx: number, ly: number) => own[(ly + M) * GW + lx + M] ?? id;
  const infoG: (TInfo | undefined)[] = new Array(GW * GW);
  const hG = new Float32Array(GW * GW);
  for (let i = 0; i < GW * GW; i++) {
    const inf = INFO[own[i]];
    infoG[i] = inf;
    hG[i] = inf ? inf.height : isWall(own[i]) ? 9 : -1;
  }
  const IA = (lx: number, ly: number) => infoG[(ly + M) * GW + lx + M];
  const HA = (lx: number, ly: number) => hG[(ly + M) * GW + lx + M];
  const x0 = tx * 16;
  const y0 = ty * 16;
  const self = INFO[id];
  // 1. base texture
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const info = IA(x, y) ?? self;
      buf[y * 16 + x] = info.tex(x0 + x, y0 + y);
    }
  // 2. decorations, clipped to each owner's pixels
  const owners = new Set<string>([id]);
  if (blends[4]) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) owners.add(O(x, y));
  for (const oid of owners) {
    const info = INFO[oid];
    if (!info?.deco) continue;
    info.deco((wx, wy, c) => {
      const lx = wx - x0;
      const ly = wy - y0;
      if (lx < 0 || ly < 0 || lx > 15 || ly > 15 || O(lx, ly) !== oid) return;
      buf[ly * 16 + lx] = c;
    }, x0, y0);
  }
  // 3. edge effects from the owner grid (skipped when the whole 5x5 is one terrain)
  let uniform = true;
  for (let i = 1; i < 25; i++) if (ids5[i] !== ids5[0]) uniform = false;
  if (!uniform)
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const I = IA(x, y);
        if (!I) continue;
        let c = buf[y * 16 + x];
        const h = I.height;
        const U = IA(x, y - 1);
        const Lf = IA(x - 1, y);
        if (I.cls === 'liquid') {
          // foam where water laps against soft ground
          let near = 9;
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              const nb = IA(x + dx, y + dy);
              if (nb && nb.cls === 'soft') near = Math.min(near, Math.max(Math.abs(dx), Math.abs(dy)));
            }
          if (near <= 2) {
            const wx = x0 + x;
            const wy = y0 + y;
            const fz = vnoise(wx / 3, wy / 3, 993);
            if (near === 1) c = fz < 0.3 ? WATER.foam2 : hh(wx, wy, 991) < 0.12 ? liA(c, 0.4) : WATER.foam;
            else c = fz > 0.62 && bay(wx, wy) < 0.5 ? WATER.foam2 : bay(wx, wy) < 0.25 ? liA(c, 0.3) : c;
          }
        }
        const softOverWater = (n: TInfo | undefined) => I.cls === 'liquid' && n?.cls === 'soft';
        if (HA(x, y - 1) > h && !softOverWater(U)) c = shA(c, 0.3);
        else if (HA(x - 1, y) > h && !softOverWater(Lf)) c = shA(c, 0.18);
        else if (HA(x, y - 2) > h && IA(x, y - 2)?.cls !== 'soft' && bay(x0 + x, y0 + y) < 0.5) c = shA(c, 0.15);
        if (I.cls === 'soft') {
          if (I.fam === 'sand') {
            let wet = 9;
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (IA(x + dx, y + dy)?.cls === 'liquid') wet = Math.min(wet, Math.max(Math.abs(dx), Math.abs(dy)));
            if (wet === 1) c = SAND.wet;
            else if (wet === 2) c = bay(x0 + x, y0 + y) < 0.5 ? SAND.wet2 : c;
          } else if (IA(x, y + 1)?.cls === 'liquid') c = C('#6e4a46');
          else if (IA(x, y + 2)?.cls === 'liquid') c = C('#93664c');
        }
        if ((I.cls === 'hard' || I.cls === 'floor') && I.fam !== 'asphalt') {
          if (U && (U.cls === 'hard' || U.cls === 'floor') && U.fam !== I.fam) c = shA(c, 0.28);
          else if (Lf && (Lf.cls === 'hard' || Lf.cls === 'floor') && Lf.fam !== I.fam) c = shA(c, 0.2);
        }
        buf[y * 16 + x] = c;
      }
  // 4. structure that depends on neighbours
  if (self.post) {
    self.post({
      buf,
      id,
      tx,
      ty,
      x0,
      y0,
      n: (dx, dy) => ids5[(dy + 2) * 5 + dx + 2] as TerrainId,
      own: O,
      get: (lx, ly) => (lx >= 0 && ly >= 0 && lx < 16 && ly < 16 ? buf[ly * 16 + lx] : 0),
      set: (lx, ly, c) => {
        if (lx >= 0 && ly >= 0 && lx < 16 && ly < 16) buf[ly * 16 + lx] = c;
      },
    });
  }
  // road gutters below curbs
  if (self.fam === 'asphalt' && INFO[ids5[1 * 5 + 2]]?.fam === 'sidewalk') {
    for (let x = 0; x < 16; x++) {
      buf[x] = shA(buf[x], 0.42);
      buf[16 + x] = shA(buf[16 + x], 0.24);
      if (bay(x0 + x, y0 + 2) < 0.5) buf[32 + x] = shA(buf[32 + x], 0.12);
    }
  }
  return { w: 16, h: 16, d: buf };
}

// ---------------------------------------------------------------- registration
const tileCache = new Map<string, Uint32Array>();
const MAX_CACHE = 4000;
let scratch: { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: ImageData; d32: Uint32Array } | null = null;
/** Blit a 16x16 pixel buffer. A CPU-backed scratch canvas keeps put+draw cheap (GPU scratch canvases stall badly). */
function blit(ctx: CanvasRenderingContext2D, d: Uint32Array, x: number, y: number): void {
  if (!scratch) {
    const cv = document.createElement('canvas');
    cv.width = 16;
    cv.height = 16;
    const sctx = cv.getContext('2d', { willReadFrequently: true })!;
    const img = sctx.createImageData(16, 16);
    scratch = { cv, ctx: sctx, img, d32: new Uint32Array(img.data.buffer) };
  }
  scratch.d32.set(d);
  scratch.ctx.putImageData(scratch.img, 0, 0);
  ctx.drawImage(scratch.cv, x, y);
}
function makeDraw(id: TerrainId) {
  return (ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, n: NeighborFn) => {
    const ids5: string[] = new Array(25);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) ids5[(dy + 2) * 5 + dx + 2] = dx === 0 && dy === 0 ? id : n(dx, dy) ?? 'void';
    const key = SEASON + '|' + id + '|' + tx + ',' + ty + '|' + ids5.join(',');
    let d = tileCache.get(key);
    if (!d) {
      if (tileCache.size > MAX_CACHE) tileCache.clear();
      d = renderTile(id, tx, ty, ids5).d as Uint32Array;
      tileCache.set(key, d);
    }
    blit(ctx, d, x, y);
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
