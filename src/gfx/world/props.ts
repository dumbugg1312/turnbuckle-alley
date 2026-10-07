/**
 * Street, nature and town props, plus the collectibles (Golden Hour Storybook).
 * Everything is a cached canvas built once with the pixel kit; small
 * animations (leaf sway, Jobber's tail, twinkles, flags, reeds) are cached
 * frames picked by time.
 */
import { registerObject } from '../../world/registry';
import type { MapObject, ObjectKind } from '../../world/types';
import {
  AK, DS, HL, L, P, R, RR, SP, VL, box, circ, col, dth, ell, hash2, liA, mkSpr, poly, rng, rotL, shA, type Color, type Spr,
} from '../kit';
import { FT, T, TC } from '../font';
import { getSeason } from './terrain';
import { noteCaster } from '../../world/atmosphere';
import { SH1, SH2, art, blit, blitFx, building, flagFrame, glass, layer, over, shadowEll, tick, type Props } from './buildings';

const WARM = '#ffcf7a';
const LAMP = '#ffd890';
const vnum = (p: Props, n: number) => Math.abs(Math.floor(Number(p.variant ?? 0))) % n;
const tiles = (v: unknown, d = 1) => Math.max(1, Math.min(40, Math.floor(Number(v ?? d)) || d));

// =====================================================================
//  Trees (seasonal)
// =====================================================================
interface LeafPal { dark: string; mid: string; base: string; lite: string; hi: string }
const LEAVES: Record<string, LeafPal> = {
  spring: { dark: '#2f6656', mid: '#3f8456', base: '#56a052', lite: '#7cbc58', hi: '#b4d872' },
  summer: { dark: '#2c5a4a', mid: '#3a7646', base: '#4e9040', lite: '#70aa44', hi: '#a8cc5c' },
  fall: { dark: '#8a3a3e', mid: '#c0583a', base: '#e07a3a', lite: '#f2a444', hi: '#ffd070' },
  winter: { dark: '#6a6a80', mid: '#8a8aa0', base: '#a8a8bc', lite: '#d0d4e4', hi: '#f6f8fc' },
};
const BLOSSOM: LeafPal = { dark: '#b0507a', mid: '#d8709a', base: '#f094b4', lite: '#ffbcd0', hi: '#fff0f4' };
const PINE: Record<string, LeafPal> = {
  spring: { dark: '#1f4a4a', mid: '#2a6050', base: '#367656', lite: '#4e9060', hi: '#7ab070' },
  summer: { dark: '#1f4a4a', mid: '#2a6050', base: '#367656', lite: '#4e9060', hi: '#7ab070' },
  fall: { dark: '#24484a', mid: '#2e5c50', base: '#3e7054', lite: '#5a885a', hi: '#8aa868' },
  winter: { dark: '#24484e', mid: '#2e5a54', base: '#3a6a5a', lite: '#e8ecf6', hi: '#ffffff' },
};
/** Clumpy canopy built from overlapping blobs, lit from the top-left. */
function canopy(cx: number, cy: number, rx: number, ry: number, pal: LeafPal, seed: number, n = 13): void {
  const r = rng(seed);
  const blobs: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * 0.72;
    blobs.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 4 + r() * 3.5]);
  }
  blobs.push([cx, cy, Math.min(rx, ry) * 0.8]);
  for (const [x, y, b] of blobs) ell(x, y, b * (rx / ry) * 0.95 + 0.6, b + 0.6, pal.dark);
  for (const [x, y, b] of blobs) ell(x - 0.6, y - 0.8, b * (rx / ry) * 0.9, b * 0.92, pal.mid);
  for (const [x, y, b] of blobs) {
    const up = (x - cx) / rx + (y - cy) / ry;
    if (up < 0.5) ell(x - 1.4, y - 1.8, b * 0.68, b * 0.62, pal.base);
  }
  for (const [x, y, b] of blobs) {
    const up = (x - cx) / rx + (y - cy) / ry;
    if (up < -0.1) ell(x - 1.8, y - 2.4, b * 0.38, b * 0.32, pal.lite);
  }
  // leaf texture flecks
  for (let i = 0; i < rx * ry * 0.5; i++) {
    const x = Math.round(cx + (r() * 2 - 1) * rx);
    const y = Math.round(cy + (r() * 2 - 1) * ry);
    P(x, y, (_a: number, _b: number, o: number) => {
      if (!o) return null;
      if (o === col(pal.base)) return r() < 0.5 ? pal.lite : pal.mid;
      if (o === col(pal.mid)) return r() < 0.5 ? pal.base : pal.dark;
      if (o === col(pal.lite)) return pal.hi;
      return null;
    });
  }
}
function trunk(cx: number, top: number, base: number, w: number, c = '#7a5040'): void {
  R(cx - Math.floor(w / 2), top, w, base - top, c);
  VL(cx - Math.floor(w / 2), top, base - 1, liA(c, 0.25));
  VL(cx + Math.ceil(w / 2) - 1, top, base - 1, shA(c, 0.35));
  for (let y = top + 2; y < base - 1; y += 3) P(cx + ((y * 7) % 3) - 1, y, shA(c, 0.25));
  // root flare
  P(cx - Math.floor(w / 2) - 1, base - 1, c);
  P(cx + Math.ceil(w / 2), base - 1, shA(c, 0.3));
  P(cx - Math.floor(w / 2) - 2, base - 1, shA(c, 0.15));
}
function bareBranches(cx: number, cy: number, seed: number): void {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.4;
    const len = 8 + r() * 6;
    const x1 = cx + Math.cos(a) * len;
    const y1 = cy + 6 + Math.sin(a) * len;
    L(cx, cy + 8, x1, y1, '#6a4a48');
    L(x1, y1, x1 + (r() - 0.5) * 6, y1 - 3, '#7a5a54');
    P(x1, y1 - 1, '#f6f8fc');
  }
}
/** Shift rows above `upto` by dx (leaf sway frames). */
function swayed(s: Spr, upto: number, dx: number): void {
  for (let y = 0; y < s.h; y++) {
    const off = y < upto ? dx : 0;
    for (let x = 0; x < s.w; x++) {
      const c = s.d[y * s.w + x];
      if (c) P(x + off, y, c);
    }
  }
}
const SWAY = [0, 1, 0, -1];
function treeKind(kind: string, w: number, h: number, build: (p: Props, season: string) => Spr, swayRows: number, extra?: (ctx: CanvasRenderingContext2D, o: MapObject, t: number) => void): void {
  const k: ObjectKind = {
    solid: { x: -4, y: -6, w: 8, h: 6 },
    draw(ctx, o, t) {
      const p = o.props ?? {};
      const season = getSeason();
      const v = vnum(p, 3);
      const f = Math.floor(t * 1.4 + o.x * 0.05 + o.y * 0.03) % 4;
      const key = kind + '|' + season + '|' + v;
      const src = SRC.get(key) ?? SRC.set(key, build(p, season)).get(key)!;
      const a = art(key + '|' + f, w, h, () => swayed(src, swayRows, season === 'winter' ? 0 : SWAY[f]), {
        pad: [2, 1, 8, 4],
        shadow: (ox, oy) => shadowEll(ox + w / 2 + 3, oy + h - 1, w * 0.42, 3.5),
      });
      blit(ctx, a, o);
      if (extra) extra(ctx, o, t);
    },
  };
  registerObject(kind, k);
}
const SRC = new Map<string, Spr>();
treeKind('tree', 32, 40, (p, season) => mkSpr(32, 40, () => {
  const v = vnum(p, 3);
  trunk(16, 22, 40, 6, '#7a5040');
  if (season === 'winter') {
    bareBranches(16, 14, 11 + v);
    ell(16, 13, 10, 4, '#f2f4fa');
    ell(14, 12, 6, 2, '#ffffff');
    return;
  }
  const pal = LEAVES[season];
  if (v === 1) {
    canopy(16, 15, 12, 13, pal, 21, 12);
    canopy(15, 9, 8, 7, pal, 23, 6);
  } else canopy(16, 15, 14.5, 12.5, pal, 17 + v * 7, 14);
  if (v === 2 && season !== 'fall') {
    // little apples / blossoms
    const r = rng(41);
    for (let i = 0; i < 9; i++) {
      const x = 5 + Math.floor(r() * 22);
      const y = 6 + Math.floor(r() * 17);
      P(x, y, (_a: number, _b: number, o: number) => (o ? (season === 'spring' ? '#fff0f4' : '#e8303a') : null));
      P(x + 1, y, (_a: number, _b: number, o: number) => (o ? (season === 'spring' ? '#ffb6cc' : '#a82030') : null));
    }
  }
}), 24);
treeKind('tree-pine', 24, 40, (_p, season) => mkSpr(24, 40, () => {
  const pal = PINE[season];
  trunk(12, 30, 40, 4, '#6a4438');
  const tiers: [number, number, number][] = [[2, 12, 5], [8, 20, 8], [15, 28, 10], [22, 33, 12]];
  for (const [top, bot, hw] of tiers) {
    poly([[12, top], [12 + hw, bot], [12 - hw, bot]], pal.dark);
    poly([[12, top + 1], [12 + hw - 2, bot - 1], [12 - hw + 1, bot - 1]], pal.mid);
    poly([[12, top + 1], [12 - 1, top + 1], [12 - hw + 2, bot - 2], [12 - 1, bot - 3]], pal.base);
    for (let x = 12 - hw; x <= 12 + hw; x += 2) P(x, bot, (x / 2) % 2 ? pal.dark : null);
    L(12 - 1, top + 2, 12 - hw + 3, bot - 2, pal.lite);
    if (season === 'winter') {
      for (let x = 12 - hw + 1; x < 12 + hw - 1; x++) P(x, Math.round(top + ((bot - top) * Math.abs(x - 12)) / hw) + 1, '#f6f8fc');
    }
  }
  P(12, 1, pal.hi);
}), 26);
treeKind(
  'tree-blossom',
  32,
  40,
  (p, season) => mkSpr(32, 40, () => {
    trunk(16, 22, 40, 5, '#6e4448');
    L(16, 24, 9, 16, '#6e4448');
    L(16, 24, 23, 15, '#6e4448');
    if (season === 'winter') {
      bareBranches(16, 14, 31);
      return;
    }
    const pal = season === 'spring' ? BLOSSOM : LEAVES[season];
    canopy(16, 14, 14, 11.5, pal, 51 + vnum(p, 3), 15);
    if (season === 'spring') {
      const r = rng(53);
      for (let i = 0; i < 14; i++) P(4 + Math.floor(r() * 24), 4 + Math.floor(r() * 20), (_a: number, _b: number, o: number) => (o ? '#ffffff' : null));
      // fallen petals at the foot
      for (let i = 0; i < 8; i++) P(6 + Math.floor(r() * 20), 37 + Math.floor(r() * 3), i % 2 ? '#ffbcd0' : '#fff0f4');
    }
  }),
  24,
  (ctx, o, t) => {
    if (getSeason() !== 'spring') return;
    // a couple of petals drifting down
    const f = Math.floor(t * 4 + o.x) % 8;
    blitFx(ctx, layer('petals|' + f, 32, 40, [0, 10, 40, 30], () => {
      for (let i = 0; i < 3; i++) {
        const k = (f + i * 3) % 8;
        const x = 6 + i * 10 + Math.round(Math.sin((k + i) * 0.9) * 2) + k;
        const y = 18 + k * 2 + i;
        P(x, y, i % 2 ? '#ffbcd0' : '#fff0f4');
      }
    }), o);
  },
);

// =====================================================================
//  Plants
// =====================================================================
building('bush', {
  w: 16,
  h: 14,
  vkey: (p) => getSeason() + vnum(p, 3),
  draw: (p) => {
    const v = vnum(p, 3);
    const pal = getSeason() === 'winter' ? LEAVES.winter : LEAVES[getSeason() === 'fall' ? 'summer' : getSeason()];
    canopy(8, 8, 7.5, 5.8, pal, 61 + v, 7);
    if (v === 1) for (const [x, y] of [[4, 6], [9, 4], [12, 8], [6, 10], [10, 11]]) P(x, y, getSeason() === 'fall' ? '#ffd070' : '#e8303a');
    if (v === 2) for (const [x, y] of [[4, 5], [10, 4], [12, 9], [7, 9]]) {
      P(x, y, '#fff6ee');
      P(x + 1, y, '#ffb6cc');
    }
  },
  solid: { x: -7, y: -6, w: 14, h: 6 },
  shadow: (ox, oy) => shadowEll(ox + 10, oy + 13, 7, 2.5),
  pad: [1, 1, 6, 3],
});
building('flowerbed', {
  w: 32,
  h: 12,
  vkey: () => getSeason(),
  draw: () => {
    // brick-edged bed of soil with flowers
    R(0, 4, 32, 8, '#6e4a3e');
    R(1, 5, 30, 5, '#5a3a3a');
    for (let x = 0; x < 32; x += 4) {
      R(x, 9, 4, 3, x % 8 ? '#c4584a' : '#b04a46');
      HL(x, x + 2, 9, '#e08060');
    }
    const fl = getSeason() === 'fall' ? ['#f2903a', '#c070c0', '#ffd060'] : getSeason() === 'winter' ? ['#fff6ee', '#e8e8ff'] : ['#ff8fae', '#ffe070', '#fff6ee', '#c08ae0', '#e8505a'];
    const r = rng(71);
    for (let x = 2; x < 30; x += 3) {
      const y = 2 + Math.floor(r() * 3);
      VL(x, y + 1, 8, '#4f8a5a');
      P(x + 1, y + 3, '#6fa85a');
      const c = fl[Math.floor(r() * fl.length)];
      P(x, y, c);
      P(x - 1, y + 1, c);
      P(x + 1, y + 1, shA(c, 0.25));
      P(x, y + 1, '#ffd860');
    }
  },
  solid: { x: -16, y: -8, w: 32, h: 8 },
  shadow: (ox, oy) => R(ox + 2, oy + 12, 32, 1, SH1),
  pad: [0, 0, 2, 2],
});

// ---------------------------------------------------------------- variable-length props
/** Fill the per-instance collision box (length depends on props.w / props.h). */
function setSolid(o: MapObject, s: { x: number; y: number; w: number; h: number }): void {
  if (!o.props.solid) o.props.solid = s;
}
function hedgeArt(n: number, season: string): HTMLCanvasElement {
  const w = n * 16;
  return art('hedge|' + n + '|' + season, w, 16, () => {
    const pal = season === 'winter' ? LEAVES.winter : LEAVES[season === 'fall' ? 'summer' : season];
    RR(0, 1, w, 15, 3, pal.dark);
    RR(0, 1, w, 12, 3, pal.mid);
    RR(1, 1, w - 2, 5, 2, pal.base);
    HL(2, w - 3, 1, pal.lite);
    const r = rng(81 + n);
    for (let i = 0; i < w * 3; i++) {
      const x = Math.floor(r() * w);
      const y = 2 + Math.floor(r() * 12);
      P(x, y, (_a: number, _b: number, o: number) => (o ? (y < 6 ? (r() < 0.5 ? pal.lite : pal.mid) : r() < 0.5 ? pal.base : pal.dark) : null));
    }
    for (let x = 1; x < w - 1; x += 3) P(x, 1, r() < 0.5 ? pal.hi : pal.lite);
    if (season === 'winter') for (let x = 1; x < w - 1; x++) P(x, 1, '#f6f8fc');
  }, { pad: [0, 0, 4, 3], shadow: (ox, oy) => R(ox + 2, oy + 16, w, 2, SH1) }).cv;
}
registerObject('hedge', {
  draw(ctx, o) {
    const n = tiles(o.props.w);
    setSolid(o, { x: -n * 8, y: -10, w: n * 16, h: 10 });
    const c = hedgeArt(n, getSeason());
    ctx.drawImage(c, Math.round(o.x) - n * 8 - 1, Math.round(o.y) - 17);
    noteCaster(c, Math.round(o.x) - n * 8 - 1, Math.round(o.y) - 17);
  },
});
function picket(x: number, y: number, h: number): void {
  R(x, y + 1, 3, h - 1, '#f6f0e8');
  P(x + 1, y, '#ffffff');
  VL(x, y + 1, y + h - 1, '#ffffff');
  VL(x + 2, y + 1, y + h - 1, '#c8bcc0');
}
registerObject('fence-h', {
  draw(ctx, o) {
    const n = tiles(o.props.w);
    setSolid(o, { x: -n * 8, y: -5, w: n * 16, h: 5 });
    const w = n * 16;
    const a = art('fence-h|' + n, w, 14, () => {
      HL(0, w - 1, 4, '#f6f0e8');
      HL(0, w - 1, 5, '#c8bcc0');
      HL(0, w - 1, 10, '#f6f0e8');
      HL(0, w - 1, 11, '#c8bcc0');
      for (let x = 0; x < w; x += 4) picket(x, 0, 14);
    }, { pad: [0, 0, 3, 3], shadow: (ox, oy) => R(ox + 1, oy + 14, w, 2, SH2) });
    blit(ctx, a, o);
  },
});
registerObject('fence-v', {
  draw(ctx, o) {
    const n = tiles(o.props.h);
    setSolid(o, { x: -2, y: -n * 16, w: 4, h: n * 16 });
    const h = n * 16 + 8;
    const a = art('fence-v|' + n, 6, h, () => {
      VL(2, 2, h - 2, '#f6f0e8');
      VL(3, 2, h - 2, '#c8bcc0');
      for (let y = 0; y < h - 8; y += 4) {
        R(1, y, 3, 10, '#f6f0e8');
        P(2, y - 1, '#ffffff');
        VL(1, y, y + 9, '#ffffff');
        VL(3, y, y + 9, '#c8bcc0');
      }
    }, { pad: [0, 0, 3, 2], shadow: (ox, oy) => R(ox + 5, oy + 4, 2, h - 4, SH2) });
    blit(ctx, a, o);
  },
});
registerObject('bridge-rail', {
  draw(ctx, o) {
    const n = tiles(o.props.w);
    setSolid(o, { x: -n * 8, y: -4, w: n * 16, h: 4 });
    const w = n * 16;
    const a = art('bridge-rail|' + n, w, 14, () => {
      R(0, 2, w, 3, '#a8704f');
      HL(0, w - 1, 2, '#d8a070');
      HL(0, w - 1, 4, '#6e4438');
      for (let x = 0; x < w; x += 16) {
        R(x, 0, 3, 14, '#8a5a44');
        VL(x, 0, 13, '#b88a60');
        VL(x + 2, 1, 13, '#5e3a3a');
        L(x + 3, 6, x + 13, 11, '#9a6a4c');
      }
      R(w - 3, 0, 3, 14, '#8a5a44');
      VL(w - 3, 0, 13, '#b88a60');
    }, { pad: [0, 0, 2, 3], shadow: (ox, oy) => R(ox + 1, oy + 14, w, 2, SH2) });
    blit(ctx, a, o);
  },
});

// =====================================================================
//  Street furniture
// =====================================================================
building('lamp', {
  w: 22,
  h: 38,
  draw: () => {
    const x = 11;
    const base = 38;
    R(x - 2, base - 3, 5, 3, '#3f3256');
    HL(x - 2, x + 2, base - 3, '#6a5a86');
    VL(x, 8, base - 3, '#4a3a62');
    VL(x - 1, 10, base - 3, '#7a6a96');
    for (let y = 16; y < base - 4; y += 7) HL(x - 1, x + 1, y, '#6a5a86');
    // lantern head
    R(x - 3, 2, 7, 2, '#3f3256');
    R(x - 2, 4, 5, 5, '#ffe38a');
    VL(x - 2, 4, 8, '#fff4c0');
    P(x + 1, 6, '#ffd060');
    R(x - 3, 9, 7, 1, '#3f3256');
    P(x, 1, '#3f3256');
    // hanging flower basket
    L(x + 1, 10, x + 6, 12, '#3f3256');
    RR(x + 4, 13, 7, 4, 1, '#8a5a4a');
    for (const [dx, dy, c] of [[4, 12, '#ff8fae'], [6, 11, '#ffe070'], [8, 12, '#ff8fae'], [10, 12, '#fff'], [5, 17, '#6f9a5a'], [9, 18, '#6f9a5a'], [7, 19, '#4f7a5a']] as [number, number, string][]) P(x + dx, dy, c);
    // town banner with a turnbuckle
    HL(x - 10, x - 1, 15, '#3f3256');
    R(x - 9, 16, 8, 14, '#3f8a86');
    VL(x - 9, 16, 29, '#5ab0a0');
    R(x - 9, 30, 3, 2, '#3f8a86');
    R(x - 4, 30, 3, 2, '#3f8a86');
    R(x - 6, 18, 2, 10, '#e8e4f0');
    RR(x - 7, 19, 4, 2, 1, '#e8505a');
    RR(x - 7, 22, 4, 2, 1, '#e8505a');
    RR(x - 7, 25, 4, 2, 1, '#e8505a');
  },
  solid: { x: -2, y: -4, w: 5, h: 4 },
  shadow: (ox, oy) => {
    shadowEll(ox + 12, oy + 37, 4, 1.5);
    for (let k = 0; k < 10; k++) P(ox + 13 + k, oy + 37 + Math.floor(k * 0.2), SH2);
  },
  lights: [[11, 7, 34, LAMP]],
});
building('bench', {
  w: 32,
  h: 16,
  draw: () => {
    // cast iron ends
    for (const x of [2, 27]) {
      R(x, 2, 3, 14, '#3f3256');
      VL(x, 2, 15, '#6a5a86');
      P(x - 1, 15, '#3f3256');
      P(x + 3, 15, '#3f3256');
    }
    // backrest slats
    for (let k = 0; k < 2; k++) {
      R(1, 1 + k * 3, 30, 2, '#c88a5a');
      HL(1, 30, 1 + k * 3, '#e8b078');
    }
    // seat slats
    for (let k = 0; k < 2; k++) {
      R(0, 8 + k * 2, 32, 2, k ? '#a8704f' : '#c88a5a');
      HL(0, 31, 8 + k * 2, '#e8b078');
    }
    HL(0, 31, 12, '#6e4438');
    // a little brass plaque
    R(14, 2, 4, 1, '#f4b63f');
  },
  solid: { x: -15, y: -6, w: 30, h: 6 },
  shadow: (ox, oy) => R(ox + 2, oy + 15, 32, 2, SH1),
  label: 'Sit',
});
building('mailbox', {
  w: 12,
  h: 18,
  draw: () => {
    RR(0, 0, 11, 14, 3, '#4a68b8');
    R(0, 7, 11, 1, '#30407c');
    VL(1, 2, 12, '#7aa0e0');
    R(2, 3, 6, 1, '#e8e4f0');
    R(3, 9, 5, 2, '#30407c');
    VL(10, 3, 12, '#30407c');
    T('M', 3, 9, '#e8e4f0', FT, {});
    R(1, 14, 2, 4, '#30407c');
    R(8, 14, 2, 4, '#30407c');
  },
  solid: { x: -5, y: -4, w: 10, h: 4 },
  shadow: (ox, oy) => shadowEll(ox + 8, oy + 17, 6, 2),
});
building('hydrant', {
  w: 10,
  h: 14,
  draw: () => {
    RR(2, 0, 6, 3, 1, '#d8484e');
    P(4, 0, '#ff9a90');
    RR(2, 2, 6, 10, 2, '#d8484e');
    R(0, 5, 10, 2, '#b8304a');
    P(0, 5, '#e8606a');
    VL(3, 3, 10, '#ff8a80');
    VL(7, 3, 10, '#8a2a48');
    R(1, 12, 8, 2, '#8a2a48');
  },
  solid: { x: -4, y: -4, w: 8, h: 4 },
  shadow: (ox, oy) => shadowEll(ox + 7, oy + 13, 5, 1.5),
});

// ---------------------------------------------------------------- trash can + Jobber
const CAN = { g: '#c3c6dc', G: '#9298b8', n: '#666c90', N: '#464a6c', w: '#eef0fa' };
function canBody(top: number): void {
  // galvanised can with ribs
  R(1, top, 10, 15 - top + 1, CAN.g);
  for (let y = top; y < 16; y++) {
    P(1, y, CAN.w);
    R(7, y, 3, 1, CAN.G);
    P(10, y, CAN.n);
  }
  for (const ry of [top + 3, top + 8]) HL(1, 10, ry, CAN.n);
  HL(2, 9, 15, CAN.N);
}
function drawCan(raccoon: boolean): void {
  if (!raccoon) {
    canBody(4);
    RR(0, 2, 12, 3, 1, CAN.g);
    HL(1, 10, 2, CAN.w);
    HL(0, 11, 4, CAN.n);
    R(4, 0, 4, 2, CAN.G);
    HL(4, 7, 0, CAN.w);
    return;
  }
  canBody(9);
  // the lid tipped back on Jobber's head
  poly([[0, 3], [11, 1], [12, 3], [1, 5]], CAN.g);
  L(0, 3, 11, 1, CAN.w);
  L(1, 5, 12, 3, CAN.n);
  // Jobber peeking out: grey head, black bandit mask, bright eyes, white brow
  R(2, 6, 8, 4, '#8e7a72');
  P(2, 5, '#8e7a72');
  P(9, 5, '#8e7a72');
  P(2, 4, '#4e3e48');
  P(9, 4, '#4e3e48');
  HL(3, 8, 6, '#f2e6d6');
  R(2, 7, 8, 2, AK);
  P(3, 7, '#fffbe0');
  P(7, 7, '#fffbe0');
  P(5, 9, AK);
  P(6, 9, AK);
  HL(3, 8, 9, '#f2e6d6');
  // little paws on the rim
  P(2, 10, '#4e3e48');
  P(9, 10, '#4e3e48');
  HL(1, 10, 10, CAN.n);
}
const TAIL = [
  ['rr......', 'qrr.....', '.qqrr...', '..rrqq..', '...qqrr.', '....rrq.', '.....qr.', '......q.'],
  ['rr......', 'qrr.....', '.qqrr...', '..rrqqr.', '...qqrrq', '.....rqq', '......r.', '........'],
];
const tailPal = { r: '#8e7a72', q: '#4e3e48' };
registerObject('trashcan', {
  solid: { x: -5, y: -5, w: 10, h: 5 },
  label: (o) => (o.props?.raccoon ? 'Jobber' : null),
  draw(ctx, o, t) {
    const rac = !!o.props?.raccoon;
    const base = art('trashcan|' + rac, 12, 16, () => drawCan(rac), { pad: [0, 0, 5, 3], shadow: (ox, oy) => shadowEll(ox + 8, oy + 15, 7, 2) });
    blit(ctx, base, o);
    if (!rac) return;
    const tk = tick(t) + Math.floor(o.x);
    // blink now and then
    if (tk % 70 < 2) blitFx(ctx, layer('jobber|blink', 12, 16, [2, 7, 8, 1], () => HL(2, 9, 7, AK)), o);
    // the tail swishes over the side
    const f = Math.floor(tk / 8) % 2;
    blitFx(ctx, layer('jobber|tail|' + f, 12, 16, [10, 8, 10, 9], (ox, oy) => {
      const s = SP(TAIL[f], tailPal);
      DS(s, ox + 11, oy + 9);
    }, true, true), o);
  },
});
building('sign', {
  w: 16,
  h: 18,
  draw: () => {
    R(7, 8, 2, 10, '#7a4a3a');
    VL(7, 8, 17, '#a8704f');
    RR(0, 0, 16, 10, 1, '#a8704f');
    R(1, 1, 14, 8, '#c88a5a');
    HL(1, 14, 1, '#e8b078');
    HL(1, 14, 8, '#8a5a44');
    for (let k = 0; k < 3; k++) HL(3, 12 - k * 2, 3 + k * 2, '#8a5a44');
    P(2, 2, '#6e4438');
    P(13, 2, '#6e4438');
  },
  solid: { x: -2, y: -3, w: 4, h: 3 },
  shadow: (ox, oy) => shadowEll(ox + 10, oy + 17, 5, 1.5),
  label: 'Read',
});
building('phone-booth', {
  w: 20,
  h: 36,
  draw: () => {
    // a cherry-red booth with a lit PHONE header
    RR(0, 0, 20, 8, 1, '#c8303e');
    R(1, 1, 18, 6, '#fff4dc');
    TC('PHONE', 10, 1, '#c8303e', FT, {});
    R(0, 7, 20, 29, '#c8303e');
    VL(0, 5, 35, '#e8606a');
    VL(19, 5, 35, '#8a2040');
    // glass door panes with the payphone inside
    glass(3, 9, 14, 22, () => {
      R(3, 9, 14, 22, '#e8c8a0');
      R(7, 10, 6, 9, '#4a4a6a');
      R(8, 11, 4, 3, '#a8a8c0');
      for (let k = 0; k < 3; k++) HL(8, 11, 15 + k, '#8a8aa8');
      VL(6, 12, 18, '#2b2140');
      R(5, 12, 2, 3, '#2b2140');
      R(3, 26, 14, 5, '#c8a888');
    });
    for (const y of [15, 23]) HL(3, 16, y, '#c8303e');
    VL(10, 9, 30, '#c8303e');
    R(15, 18, 1, 3, '#f4b63f');
    R(0, 33, 20, 3, '#8a2040');
  },
  solid: { x: -9, y: -7, w: 18, h: 7 },
  shadow: (ox, oy) => {
    R(ox + 20, oy + 6, 3, 30, SH2);
    R(ox + 1, oy + 36, 22, 2, SH1);
  },
  pad: [0, 0, 5, 3],
  lights: [[10, 18, 20, WARM], [10, 4, 10, '#fff4dc']],
  label: 'Call',
});
building('newsstand', {
  w: 14,
  h: 18,
  draw: () => {
    RR(0, 0, 14, 13, 1, '#f4b63f');
    VL(0, 1, 12, '#ffd870');
    VL(13, 1, 12, '#c88a2a');
    R(1, 1, 12, 3, '#2f6a74');
    T('TT', 4, -1 + 0, '#fff4dc', FT, {});
    R(2, 5, 10, 6, '#3a3048');
    R(3, 6, 8, 4, '#f4eee0');
    HL(4, 9, 7, '#4a3a5a');
    HL(4, 8, 9, '#a8a0b8');
    R(5, 11, 4, 1, '#3a3048');
    R(2, 13, 2, 5, '#5a5a7a');
    R(10, 13, 2, 5, '#5a5a7a');
  },
  solid: { x: -6, y: -4, w: 12, h: 4 },
  shadow: (ox, oy) => shadowEll(ox + 9, oy + 17, 6, 1.5),
  label: 'Tattler',
});
function vendingGlow(on: boolean): void {
  R(2, 3, 10, 13, on ? '#fff0d8' : '#e8d8c0');
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) R(3 + k * 3, 4 + r * 4, 2, 3, ['#d8434b', '#3f9a92', '#f4b63f', '#9a6ad0'][(r + k) % 4]);
}
building('vending', {
  w: 18,
  h: 28,
  draw: () => {
    RR(0, 0, 18, 28, 1, '#d8434b');
    VL(0, 1, 26, '#ff7a70');
    VL(17, 1, 26, '#8a2040');
    R(1, 1, 16, 2, '#ff8a80');
    vendingGlow(true);
    R(13, 4, 3, 10, '#3a3048');
    for (let k = 0; k < 4; k++) P(14, 5 + k * 2, '#7ae0d0');
    R(2, 18, 14, 3, '#fff4e6');
    TC('POP', 9, 18, '#d8434b', FT, {});
    R(3, 22, 12, 4, '#2b2140');
    HL(3, 14, 22, '#5a4a6a');
  },
  solid: { x: -8, y: -6, w: 16, h: 6 },
  shadow: (ox, oy) => {
    R(ox + 18, oy + 4, 3, 24, SH2);
    R(ox + 1, oy + 28, 20, 2, SH1);
  },
  pad: [0, 0, 5, 3],
  lights: [[9, 10, 18, '#fff0d0']],
  label: 'Buy',
});
building('picnic-table', {
  w: 32,
  h: 20,
  draw: () => {
    // far bench, table top, near bench
    R(3, 2, 26, 2, '#a8704f');
    HL(3, 28, 2, '#c88a5a');
    R(1, 5, 30, 7, '#c88a5a');
    for (let y = 5; y < 12; y += 2) HL(1, 30, y, '#d89a6a');
    HL(1, 30, 11, '#8a5a44');
    L(5, 12, 3, 18, '#7a4a3a');
    L(26, 12, 28, 18, '#7a4a3a');
    R(2, 14, 28, 3, '#b87a4a');
    HL(2, 29, 14, '#d89a6a');
    HL(2, 29, 16, '#6e4438');
    // a gingham cloth corner and a jug of lemonade
    R(18, 5, 10, 5, '#fbf0e4');
    for (let y = 5; y < 10; y++) for (let x = 18; x < 28; x++) if ((x >> 1) % 2 !== (y >> 1) % 2) P(x, y, '#e86a70');
    R(8, 3, 3, 4, '#fff4b0');
    HL(8, 10, 3, '#ffffff');
  },
  solid: { x: -15, y: -12, w: 30, h: 10 },
  shadow: (ox, oy) => R(ox + 2, oy + 19, 32, 2, SH1),
  label: 'Sit',
});
function flagpoleFlag(f: number): void {
  flagFrame(6, 2, f, 14, 9);
}
building('flagpole', {
  w: 24,
  h: 56,
  draw: () => {
    VL(5, 2, 54, '#c8c4d8');
    VL(6, 2, 54, '#8a84a0');
    circ(5.5, 1.5, 1.5, '#f4b63f');
    R(3, 53, 6, 3, '#9a92a8');
    HL(3, 8, 53, '#c8c0d0');
    flagpoleFlag(0);
  },
  solid: { x: -9, y: -3, w: 6, h: 3 },
  shadow: (ox, oy) => {
    for (let k = 0; k < 18; k++) P(ox + 7 + k, oy + 55 + Math.floor(k * 0.15), SH2);
    shadowEll(ox + 7, oy + 55, 4, 1.5);
  },
  anims: [{ fps: 5, frames: 4, rect: [6, 0, 18, 14], draw: (f) => flagpoleFlag(f) }],
});

// =====================================================================
//  Vehicles
// =====================================================================
const CAR_COLS = ['#d8434b', '#2fa59a', '#f2c860', '#9a7ac8'];
function wheel(x: number, y: number): void {
  circ(x, y, 4.5, '#2b2140');
  circ(x, y, 2.5, '#c8c4d8');
  P(x - 1, y - 1, '#ffffff');
  P(x, y, '#8a84a0');
}
function drawCar(p: Props): void {
  const c = CAR_COLS[vnum(p, 4)];
  const cd = shA(c, 0.32);
  const cl = liA(c, 0.35);
  // body: a rounded 50s sedan facing right
  RR(1, 12, 46, 11, 4, c);
  poly([[11, 13], [16, 3], [32, 3], [38, 13]], c);
  HL(16, 31, 3, cl);
  L(11, 13, 16, 3, cl);
  // windows
  poly([[14, 12], [18, 5], [24, 5], [24, 12]], '#8ab8d0');
  poly([[26, 12], [26, 5], [31, 5], [35, 12]], '#8ab8d0');
  L(15, 11, 18, 6, '#d8f0f8');
  L(27, 11, 28, 6, '#d8f0f8');
  // chrome trim stripe and bumpers
  HL(2, 45, 16, '#f2eef6');
  HL(2, 45, 17, cd);
  R(44, 18, 4, 3, '#e8e4f0');
  R(0, 18, 3, 3, '#e8e4f0');
  R(43, 14, 3, 2, '#fff4c0');
  P(1, 14, '#e8303a');
  // shading
  R(1, 20, 46, 3, (_x: number, _y: number, o: number) => (o && o !== col('#e8e4f0') ? shA(o, 0.22) : o));
  HL(4, 42, 12, cl);
  // door seams and handles
  VL(24, 12, 21, cd);
  R(20, 15, 2, 1, '#f2eef6');
  R(28, 15, 2, 1, '#f2eef6');
  wheel(11, 22);
  wheel(37, 22);
}
building('car', {
  w: 48,
  h: 28,
  draw: drawCar,
  vkey: (p) => String(vnum(p, 4)),
  solid: { x: -23, y: -12, w: 46, h: 10 },
  shadow: (ox, oy) => {
    R(ox + 2, oy + 24, 48, 3, SH1);
    for (let x = ox + 2; x < ox + 50; x++) if (dth(x, oy + 27, 8)) P(x, oy + 27, SH2);
  },
  pad: [0, 0, 4, 4],
});
building('pickup', {
  w: 52,
  h: 30,
  draw: () => {
    const c = '#4f9a92';
    const cd = shA(c, 0.3);
    // bed with a stack of folding chairs
    R(1, 12, 26, 12, c);
    HL(1, 26, 12, liA(c, 0.35));
    for (let i = 0; i < 3; i++) {
      R(4 + i, 6 - i * 2 + 4, 16, 2, i % 2 ? '#c8c2da' : '#aaa2c2');
      HL(4 + i, 19 + i, 10 - i * 2, '#eeeaf6');
    }
    // cab
    RR(26, 4, 16, 20, 2, c);
    R(28, 6, 11, 7, '#8ab8d0');
    L(29, 12, 32, 7, '#d8f0f8');
    // hood
    RR(40, 11, 12, 13, 2, c);
    HL(26, 51, 11, liA(c, 0.35));
    R(49, 13, 3, 2, '#fff4c0');
    // rust patches and a sticker
    P(8, 20, '#c86a3a');
    P(9, 21, '#a85a3a');
    P(44, 20, '#c86a3a');
    R(10, 15, 6, 3, '#fbf0e4');
    T('ACW', 10, 14, '#d8434b', FT, {});
    R(1, 20, 51, 4, (_x: number, _y: number, o: number) => (o ? shA(o, 0.2) : o));
    R(0, 22, 52, 3, '#e8e4f0');
    HL(0, 51, 22, '#ffffff');
    VL(26, 13, 21, cd);
    wheel(10, 25);
    wheel(42, 25);
  },
  solid: { x: -25, y: -13, w: 50, h: 11 },
  shadow: (ox, oy) => R(ox + 2, oy + 27, 52, 3, SH1),
  pad: [0, 0, 4, 4],
});

// =====================================================================
//  Clutter and nature
// =====================================================================
building('barrel', {
  w: 14,
  h: 16,
  draw: () => {
    RR(1, 0, 12, 16, 3, '#a8704f');
    for (let x = 1; x < 13; x += 3) VL(x, 1, 14, '#8a5a44');
    VL(2, 1, 14, '#c88a5a');
    for (const y of [3, 12]) HL(0, 13, y, '#6a6488');
    ell(7, 1.5, 5.5, 1.6, '#c88a5a');
    ell(7, 1.5, 4, 1, '#7a4a3a');
  },
  solid: { x: -6, y: -6, w: 12, h: 6 },
  shadow: (ox, oy) => shadowEll(ox + 10, oy + 15, 7, 2),
});
building('crate', {
  w: 16,
  h: 16,
  draw: () => {
    R(0, 0, 16, 16, '#c88a5a');
    for (let y = 0; y < 16; y += 4) HL(0, 15, y, '#a8704f');
    box(0, 0, 16, 16, '#8a5a44');
    L(1, 1, 14, 14, '#a8704f');
    HL(1, 14, 1, '#e8b078');
    T('ACW', 3, 6, '#6e4438', FT, {});
  },
  solid: { x: -8, y: -8, w: 16, h: 8 },
  shadow: (ox, oy) => R(ox + 2, oy + 16, 16, 2, SH1),
});
building('tire', {
  w: 14,
  h: 10,
  draw: () => {
    ell(7, 5, 7, 5, '#3a3048');
    ell(7, 5, 3.5, 2, '#6a5a6a');
    ell(7, 4.5, 3.5, 1.6, '#2b2140');
    for (let a = 0; a < 6.28; a += 0.6) P(7 + Math.cos(a) * 5.5, 5 + Math.sin(a) * 3.8, '#5a4a62');
    HL(3, 8, 1, '#6a5a72');
  },
  solid: { x: -6, y: -5, w: 12, h: 5 },
  shadow: (ox, oy) => shadowEll(ox + 9, oy + 9, 6, 1.5),
});
building('rock', {
  w: 16,
  h: 12,
  vkey: (p) => String(vnum(p, 3)),
  draw: (p) => {
    const v = vnum(p, 3);
    const [rx, ry] = v === 0 ? [6, 4.5] : v === 1 ? [7.5, 5.5] : [4, 3];
    const cy = 12 - ry;
    ell(8, cy, rx, ry, '#7a7090');
    ell(7, cy - 1, rx - 1, ry - 1, '#9a92aa');
    ell(6, cy - 2, rx * 0.45, ry * 0.4, '#c0b8cc');
    P(5, cy - 2, '#e0dce8');
    if (v === 1) {
      P(10, cy + 1, '#6a9a58');
      P(11, cy + 1, '#5a8a4a');
      P(10, cy + 2, '#5a8a4a');
    }
  },
  solid: { x: -6, y: -5, w: 12, h: 5 },
  shadow: (ox, oy) => shadowEll(ox + 10, oy + 11, 6, 1.6),
});
building('log', {
  w: 24,
  h: 10,
  draw: () => {
    R(3, 1, 18, 8, '#8a5a44');
    HL(3, 20, 1, '#b88a60');
    HL(3, 20, 8, '#5e3a3a');
    for (let x = 5; x < 20; x += 4) HL(x, x + 2, 4 + ((x >> 2) % 2), '#6e4438');
    ell(3, 5, 3, 4, '#c8a070');
    ell(3, 5, 1.8, 2.5, '#e0bc88');
    P(3, 5, '#a8704f');
    ell(21, 5, 2, 4, '#6e4438');
    P(12, 1, '#5a8a4a');
    P(13, 0, '#7aa858');
  },
  solid: { x: -11, y: -6, w: 22, h: 6 },
  shadow: (ox, oy) => R(ox + 3, oy + 10, 22, 1, SH1),
});
function reeds(f: number): void {
  const stalks: [number, number][] = [[3, 3], [6, 0], [9, 2], [12, 5], [14, 4]];
  stalks.forEach(([x, top], i) => {
    const sw = (i + f) % 4 === 0 ? 1 : 0;
    L(x, 15, x + sw, top + 4, i % 2 ? '#5a8a4a' : '#6f9a5a');
    if (i % 2 === 0) {
      R(x + sw, top, 2, 4, '#8a5a44');
      P(x + sw, top, '#a8704f');
      P(x + sw, top - 1, '#6f9a5a');
    }
  });
  L(1, 15, 4, 8, '#7aa858');
  L(15, 15, 12, 9, '#7aa858');
}
building('reeds', {
  w: 16,
  h: 16,
  draw: () => reeds(0),
  shadow: null,
  solid: null,
  anims: [{ fps: 2, frames: 4, rect: [0, 0, 16, 16], skip: (f) => f === 0, draw: (f) => reeds(f) }],
});
building('lilypad', {
  w: 14,
  h: 8,
  flat: true,
  outline: false,
  vkey: (p) => String(vnum(p, 2)),
  draw: (p) => {
    ell(7, 4, 7, 3.6, '#3f7a52');
    ell(6.5, 3.6, 6, 3, '#5a9a58');
    poly([[7, 4], [12, 2], [13, 4]], 0);
    for (let x = 7; x < 14; x++) for (let y = 2; y < 5; y++) if (y - 4 >= -(x - 7) * 0.35 && y <= 4) P(x, y, null);
    L(7, 4, 3, 2, '#7ab868');
    if (vnum(p, 2) === 1) {
      ell(5, 3, 2, 1.5, '#ffd0de');
      P(5, 2, '#fff4f8');
      P(5, 3, '#ffe070');
    }
  },
  shadow: null,
  solid: null,
});
building('poster-board', {
  w: 20,
  h: 28,
  draw: () => {
    R(9, 16, 2, 12, '#7a4a3a');
    VL(9, 16, 27, '#a8704f');
    RR(0, 0, 20, 18, 1, '#8a5a44');
    R(1, 1, 18, 16, '#c8925a');
    R(1, 1, 18, 16, (x: number, y: number, o: number) => (hash2(x, y, 3) < 0.15 ? '#b8824a' : o));
    // flyers: ACW show, lost cat, bake sale
    R(2, 2, 8, 9, '#fbefd8');
    R(2, 2, 8, 3, '#3f8a86');
    circ(6, 7, 1.5, '#5e2f58');
    R(11, 3, 7, 6, '#fff6ee');
    T('?', 13, 3, '#d8434b', FT, {});
    R(4, 12, 9, 4, '#ff94b4');
    HL(5, 11, 13, '#c8307a');
    R(14, 10, 4, 6, '#f6e2a0');
    for (const [px, py] of [[6, 2], [14, 3], [8, 12], [16, 10]] as [number, number][]) P(px, py, '#e8303a');
  },
  solid: { x: -3, y: -3, w: 6, h: 3 },
  shadow: (ox, oy) => shadowEll(ox + 13, oy + 27, 6, 1.5),
  label: 'Read',
});

// =====================================================================
//  Collectibles (gameplay-critical: readable and sparkly)
// =====================================================================
const CHAIR_PAL = { w: '#f8f6fc', g: '#cfcae0', G: '#9c96b8', n: '#6e688e', N: '#4e4870', k: '#3a3048' };
const CHAIR_STAND = [
  '..wwwwwwwwww..', '.wggggggggggG.', '.wgnnnnnnnngG.', '.wgnnnnnnnngG.', '.wggggggggggG.', '..GGGGGGGGGG..', '..g........G..', '..g........G..', '.wwwwwwwwwwwwG',
  '.wggggggggggGG', '.wggggggggggGG', '.GGGGGGGGGGGGN', '.g.g......G.N.', '.g.g......G.N.', '.g.gggggggG.N.', '.g.g......G.N.', '.g.g......G.N.', '.g.k......k.N.', '.k..........k.',
];
let chairSpr: Spr | null = null;
/** 4-point star glint centred at (x, y); size 0 small .. 2 big. */
function glint(x: number, y: number, size: number): void {
  P(x, y, '#ffffff');
  const arms = size + 1;
  for (let k = 1; k <= arms; k++) {
    const c = k === arms ? '#ffe9a0' : '#fff8d8';
    P(x - k, y, c);
    P(x + k, y, c);
    P(x, y - k, c);
    P(x, y + k, c);
  }
  if (size >= 2) {
    P(x - 1, y - 1, over('#fff8d8', 0.6));
    P(x + 1, y - 1, over('#fff8d8', 0.6));
    P(x - 1, y + 1, over('#fff8d8', 0.6));
    P(x + 1, y + 1, over('#fff8d8', 0.6));
  }
}
/** Twinkle overlay frames: a glint grows and shrinks every `period` seconds. */
function twinkle(kind: string, w: number, h: number, spots: [number, number][], period: number) {
  return (ctx: CanvasRenderingContext2D, o: MapObject, t: number) => {
    const ph = (t + (o.x * 0.37 + o.y * 0.11)) % period;
    if (ph > 0.75) return;
    const i = Math.floor((t + o.x) / period) % spots.length;
    const f = Math.min(2, Math.floor(ph / 0.13)) - (ph > 0.5 ? 1 : 0);
    const [sx, sy] = spots[i];
    blitFx(ctx, layer(kind + '|tw|' + i + '|' + f, w, h, [sx - 4, sy - 4, 9, 9], (ox, oy) => glint(sx + ox, sy + oy, Math.max(0, f)), false, true), o);
  };
}
{
  const tw = twinkle('chair', 19, 14, [[5, 2], [14, 3], [9, 8]], 2.6);
  registerObject('chair', {
    solid: { x: -8, y: -6, w: 16, h: 6 },
    label: () => 'Pick up',
    draw(ctx, o, t) {
      if (!chairSpr) chairSpr = rotL(SP(CHAIR_STAND, CHAIR_PAL));
      const a = art('chair', 19, 14, () => DS(chairSpr!, 0, 0), { pad: [0, 0, 4, 3], shadow: (ox, oy) => R(ox + 2, oy + 13, 19, 2, SH1) });
      blit(ctx, a, o);
      tw(ctx, o, t);
    },
  });
}
function vhsSpine(x: number, y: number, c: Color, label: Color): void {
  R(x, y, 3, 6, '#2b2140');
  VL(x + 1, y + 1, y + 4, label);
  P(x + 2, y, c);
}
{
  const tw = twinkle('tapebin', 20, 16, [[4, 3], [15, 4]], 3.1);
  registerObject('tapebin', {
    solid: { x: -9, y: -6, w: 18, h: 6 },
    label: () => 'Dig',
    draw(ctx, o, t) {
      const a = art('tapebin', 20, 16, () => {
        // tapes sticking up out of a milk crate
        const cs = ['#e8505a', '#3f9a92', '#f4b63f', '#9a6ad0', '#fff4dc', '#5a8ad0'];
        for (let i = 0; i < 6; i++) vhsSpine(2 + i * 3, 1 + (i % 2), cs[i], cs[(i + 2) % 6]);
        R(0, 6, 20, 10, '#d8a040');
        for (let x = 0; x < 20; x += 3) VL(x, 7, 15, '#b8802a');
        HL(0, 19, 6, '#f4c870');
        HL(0, 19, 15, '#8a5a2a');
        R(6, 9, 8, 4, '#fbf0e4');
        T('VHS', 6, 9, '#c8303e', FT, {});
      }, { pad: [0, 0, 4, 3], shadow: (ox, oy) => R(ox + 2, oy + 16, 20, 2, SH1) });
      blit(ctx, a, o);
      tw(ctx, o, t);
    },
  });
}
registerObject('sparkle', {
  label: () => 'Forage',
  draw(ctx, o, t) {
    const f = Math.floor(t * 6 + o.x * 0.7) % 6;
    const size = [0, 1, 2, 1, 0, -1][f];
    const a = layer('sparkle|' + f, 8, 8, [0, 0, 9, 9], () => {
      if (size >= 0) glint(4, 4, size);
      else {
        P(4, 4, '#fff8d8');
        P(2, 6, over('#ffe9a0', 0.6));
      }
      P(1, 1, size === 2 ? '#fff8d8' : over('#ffe9a0', 0.4));
    });
    ctx.drawImage(a.cv, Math.round(o.x) - 4, Math.round(o.y) - 9);
  },
  lights: (o) => [{ x: o.x, y: o.y - 5, r: 8, color: '#fff4c0' }],
});
{
  const tw = twinkle('card-pack', 8, 10, [[2, 2], [5, 6]], 2.2);
  registerObject('card-pack', {
    label: () => 'Pick up',
    draw(ctx, o, t) {
      const a = art('card-pack', 8, 10, () => {
        // a foil trading-card pack with crimped ends
        R(0, 1, 8, 8, '#8a5ac8');
        for (let x = 0; x < 8; x += 2) {
          P(x, 0, '#c8a0f0');
          P(x + 1, 9, '#5a3a8a');
        }
        R(0, 1, 8, 8, (x: number, y: number, o2: number) => ((x + y) % 5 === 0 ? '#c8a0f0' : o2));
        R(1, 3, 6, 4, '#ffd34a');
        P(3, 4, '#d8434b');
        P(4, 4, '#d8434b');
        P(3, 5, '#d8434b');
        P(4, 5, '#d8434b');
        VL(7, 1, 8, '#5a3a8a');
      }, { pad: [0, 0, 2, 2], shadow: (ox, oy) => R(ox + 1, oy + 10, 8, 1, SH1) });
      blit(ctx, a, o);
      tw(ctx, o, t);
    },
  });
}

