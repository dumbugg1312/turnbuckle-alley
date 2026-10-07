/**
 * Street, nature and town props, plus the collectibles (Golden Hour Storybook).
 * Everything is a cached canvas built once with the pixel kit at double density
 * (DECISIONS.md D-018) and sized against a 30 px adult (D-019). Small
 * animations (leaf sway, Jobber's tail, twinkles, flags, reeds) are cached
 * frames picked by time.
 *
 * The dense build helpers here (dart / dlayer / prop and the fine-pixel
 * brushes) are also used by farm.ts.
 */
import { registerObject } from '../../world/registry';
import type { MapObject, ObjectKind } from '../../world/types';
import {
  AK, DS, FX, FY, GP, OUT, P, P1, R, RR, SP, circ, col, dense, dth, ell, hash2, liA, mixc, mkSpr, poly, rng, rotL, selA, shA, toCanvas,
  type Color, type Paint, type Spr,
} from '../kit';
import { FT, T, TC, glyph } from '../font';
import { getSeason } from './terrain';
import { noteCaster } from '../../world/atmosphere';
import { SH1, SH2, SH3, blit, blitFx, flagFrame, over, tick, type Anim, type Art, type BDef, type Lt, type Props } from './buildings';

const WARM = '#ffcf7a';
const LAMP = '#ffd890';
const vnum = (p: Props, n: number) => Math.abs(Math.floor(Number(p.variant ?? 0))) % n;
const tiles = (v: unknown, d = 1) => Math.max(1, Math.min(40, Math.floor(Number(v ?? d)) || d));
const TAU = Math.PI * 2;

// =====================================================================
//  Dense build helpers (D-018). Primitives take world-pixel coordinates;
//  detail goes on half pixels.
// =====================================================================
/** Art density for world props. */
export const KK = 2;
/** Current fine pixel's logical centre (inside a paint callback). */
export const fx = () => (FX + 0.5) / KK;
export const fy = () => (FY + 0.5) / KK;
/** Ordered dither on the fine grid (inside a paint callback). */
export const fd = (lvl: number) => dth(FX, FY, lvl);
/** Hash of the current fine pixel, optionally in sx x sy fine blocks. */
export const fh = (seed: number, sx = 1, sy = 1) => hash2(Math.floor(FX / sx), Math.floor(FY / sy), seed);
/** A 1-fine-pixel line. */
export function L1(x0: number, y0: number, x1: number, y1: number, c: Paint): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * KK));
  for (let i = 0; i <= n; i++) P1(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
}
/** Fine horizontal / vertical hairlines (x1 / y1 exclusive). */
export const H1 = (x0: number, x1: number, y: number, c: Paint) => R(x0, y, x1 - x0, 1 / KK, c);
export const V1 = (x: number, y0: number, y1: number, c: Paint) => R(x, y0, 1 / KK, y1 - y0, c);
/** Tapered stroke through [x, y, radius] points (branches, roots, chains). */
export function stroke(pts: [number, number, number][], c: Paint): void {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0, r0] = pts[i];
    const [x1, y1, r1] = pts[i + 1];
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * KK * 2));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const r = r0 + (r1 - r0) * t;
      if (r < 0.3) P1(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, c);
      else ell(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, r, c);
    }
  }
}
/** Five-step hue-shifted ramp: [deep, shade, base, lit, highlight]. */
export const ramp = (c: Color): number[] => [shA(c, 0.5), shA(c, 0.24), col(c), liA(c, 0.28), liA(c, 0.56)];
const pick = (r: number[], s: number) => r[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
/** Cylinder shading across [x, x+w), lit from the left. */
export function cylPaint(x: number, w: number, c: Color, seed = 0, grain = 0): Paint {
  const rp = ramp(c);
  return () => {
    const u = (fx() - x) / w;
    let s = u < 0.12 ? 0.62 : u < 0.34 ? 0.95 : u < 0.62 ? 0.62 : u < 0.86 ? 0.36 : 0.15;
    if (grain) s += (fh(seed, 1, 3) - 0.5) * grain;
    return pick(rp, s);
  };
}
/** Weathered horizontal wood grain (boards, slats). */
export function woodPaint(c: Color, seed: number, wear = 0.15): Paint {
  const rp = ramp(c);
  return () => {
    const g = hash2(Math.floor(FX / 7), FY, seed);
    const streak = hash2(Math.floor(FX / 3) + FY * 13, 0, seed + 1);
    let s = 0.62 + (g - 0.5) * 0.28;
    if (streak < wear) s -= 0.22;
    if (streak > 0.97) s += 0.3;
    return pick(rp, s);
  };
}
/** Vertical grain (pickets, posts). */
export function woodPaintV(c: Color, seed: number, wear = 0.15): Paint {
  const rp = ramp(c);
  return () => {
    const g = hash2(FX, Math.floor(FY / 7), seed);
    const streak = hash2(Math.floor(FY / 3) + FX * 13, 0, seed + 1);
    let s = 0.62 + (g - 0.5) * 0.28;
    if (streak < wear) s -= 0.22;
    if (streak > 0.97) s += 0.3;
    return pick(rp, s);
  };
}
/** Fine soft ground shadow: dense core, dithered rim. */
export function shadowF(cx: number, cy: number, rx: number, ry: number, k = 1): void {
  ell(cx, cy, rx, ry, () => {
    const dx = (fx() - cx) / rx;
    const dy = (fy() - cy) / ry;
    const d = dx * dx + dy * dy;
    if (d < 0.45 * k) return SH1;
    return fd(d < 0.75 ? 10 : 5) ? SH2 : null;
  });
}
/** Contact-shadow line under a thing that touches the ground. */
export function contactF(x: number, y: number, w: number): void {
  R(x, y, w, 0.5, SH3);
  R(x - 0.5, y + 0.5, w + 1, 0.5, () => (fd(9) ? SH1 : SH2));
}
/** Glass: interior, sky gradient, two diagonal reflection streaks. */
export function glassF(x: number, y: number, w: number, h: number, base: Color, interior?: () => void, k = 1): void {
  R(x, y, w, h, () => mixc(base, '#fff4dc', Math.max(0, 0.32 - ((fy() - y) / h) * 0.4)));
  if (interior) interior();
  R(x, y, w, h, (_x, _y, o) => {
    const s = (fx() - x + (fy() - y) * 0.9) % 14;
    if (s > 2 && s < 3.5) return mixc(o, '#fff8e8', 0.55 * k);
    if (s > 4.5 && s < 5) return mixc(o, '#fff8e8', 0.35 * k);
    return o;
  });
}
/** Little rivet / bolt head. */
export function bolt(x: number, y: number, c: Color): void {
  P1(x, y, liA(c, 0.5));
  P1(x + 0.5, y + 0.5, shA(c, 0.4));
}
/** Grass tufts on the fine grid so things sit in the lawn. */
export function tuftsF(x0: number, x1: number, y: number, seed: number, dens = 0.5, pal: Color[] = ['#4f7a5a', '#6f9a5a', '#8ab868', '#b4d48e']): void {
  const r = rng(seed);
  for (let x = x0; x < x1; x += 0.5) {
    if (r() > dens) continue;
    const h = 0.5 + Math.floor(r() * 5) * 0.5;
    const lean = (r() - 0.5) * 1.2;
    L1(x, y, x + lean, y - h, pal[1]);
    P1(x + lean, y - h, pal[r() < 0.5 ? 2 : 3]);
    P1(x, y, pal[0]);
  }
}

/** Micro text: the FT glyphs at one fine pixel per glyph pixel (half size). */
export function TF(s: string, x: number, y: number, c: Paint): number {
  let cx = x;
  for (const ch of s) {
    if (ch === ' ') {
      cx += 1;
      continue;
    }
    const g = glyph(FT, ch) as { w: number; rows: string[] } | null;
    if (!g) continue;
    g.rows.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') P1(cx + i / KK, y + r / KK, c);
    });
    cx += (g.w + 1) / KK;
  }
  return cx;
}
export function TFW(s: string): number {
  let w = 0;
  for (const ch of s) {
    const g = ch === ' ' ? null : (glyph(FT, ch) as { w: number } | null);
    w += g ? (g.w + 1) / KK : 1;
  }
  return w - 1 / KK;
}
/** Centred micro text. */
export const TFC = (s: string, cx: number, y: number, c: Paint) => TF(s, Math.round((cx - TFW(s) / 2) * KK) / KK, y, c);

export interface DArtOpts {
  outline?: boolean;
  out?: (c: number, side: 'lit' | 'dark', x: number, y: number) => Color;
  shadow?: (ox: number, oy: number) => void;
  pad?: [number, number, number, number];
}
const DART = new Map<string, Art>();
/**
 * Dense twin of buildings.ts art(): footprint w x h, anchor at bottom-centre,
 * draw() paints in local world-pixel coords, shadow(ox, oy) paints the baked
 * cast shadow into the transparent pad.
 */
export function dart(key: string, w: number, h: number, draw: () => void, o: DArtOpts = {}): Art {
  const hit = DART.get(key);
  if (hit) return hit;
  return dense(KK, () => {
    const ol = o.outline === false ? 0 : 1;
    const [pl, pt, pr, pb] = o.pad ?? [0, 0, 0, 0];
    let body = mkSpr(w, h, draw);
    if (ol) body = OUT(body, o.out ?? selA);
    const W = w + 2 * ol + pl + pr;
    const H = h + 2 * ol + pt + pb;
    const full = mkSpr(W, H, () => {
      if (o.shadow) o.shadow(pl + ol, pt + ol);
      DS(body, pl, pt);
    });
    const a: Art = { cv: toCanvas(full), dx: -Math.floor(w / 2) - ol - pl, dy: -h - ol - pt };
    DART.set(key, a);
    return a;
  });
}
/** Dense twin of buildings.ts layer() (animation overlays). */
export function dlayer(key: string, w: number, h: number, rect: [number, number, number, number], draw: (ox: number, oy: number) => void, outline = false, rel = false): Art {
  const hit = DART.get(key);
  if (hit) return hit;
  return dense(KK, () => {
    const [rx, ry, rw, rh] = rect;
    let crop = rel
      ? mkSpr(rw, rh, () => draw(-rx, -ry))
      : mkSpr(rw, rh, () => {
          const s = mkSpr(w, h, () => draw(0, 0));
          DS(s, -rx, -ry);
        });
    if (outline) crop = OUT(crop, selA);
    const a: Art = { cv: toCanvas(crop), dx: -Math.floor(w / 2) + rx - (outline ? 1 : 0), dy: -h + ry - (outline ? 1 : 0) };
    DART.set(key, a);
    return a;
  });
}
/** Dense twin of buildings.ts building(): registers a static prop with optional anims and lights. */
export function prop(kind: string, d: BDef): void {
  const solid = d.solid === null ? undefined : d.solid ?? { x: -Math.floor(d.w / 2), y: -Math.round(d.h * 0.4), w: d.w, h: Math.round(d.h * 0.4) };
  const pad = d.pad ?? [0, 0, 6, 4];
  const k: ObjectKind = {
    solid,
    hit: d.hit,
    flat: d.flat,
    sortY: d.sortY,
    draw(ctx, o, t) {
      const p = o.props ?? {};
      const vk = d.vkey ? d.vkey(p) : '';
      const base = dart(kind + '|' + vk, d.w, d.h, () => d.draw(p), {
        outline: d.outline !== false,
        pad,
        shadow: d.shadow ? (ox, oy) => d.shadow!(ox, oy, p) : undefined,
      });
      blit(ctx, base, o);
      if (d.anims)
        d.anims.forEach((a: Anim, i) => {
          const f = a.pick ? a.pick(t, o) : Math.floor(t * a.fps + o.x * 0.013) % a.frames;
          if (a.skip && a.skip(f)) return;
          blitFx(ctx, dlayer(kind + '|' + vk + '|a' + i + '|' + f, d.w, d.h, a.rect, (ox, oy) => a.draw(f, p, ox, oy), a.outline, a.rel), o);
        });
    },
    lights: d.lights
      ? (o) => {
          const ls = typeof d.lights === 'function' ? d.lights(o.props ?? {}) : (d.lights as Lt[]);
          const x0 = Math.round(o.x) - Math.floor(d.w / 2);
          const y0 = Math.round(o.y) - d.h;
          return ls.map(([x, y, r, color]) => ({ x: x0 + x, y: y0 + y, r, color }));
        }
      : undefined,
    label: d.label ? () => d.label ?? null : undefined,
  };
  registerObject(kind, k);
}

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
  winter: { dark: '#24484e', mid: '#2e5a54', base: '#3a6a5a', lite: '#5a8270', hi: '#8aa890' },
};
const palTones = (p: LeafPal) => [p.dark, p.mid, p.base, p.lite, p.hi].map(col);
/**
 * One leaf clump: lit from the top-left, leafy breakup on the fine grid, a
 * darker bottom-right rim, little leaf tips poking out of the silhouette.
 */
function clump(x: number, y: number, rx: number, ry: number, tones: number[], bias: number, seed: number): void {
  ell(x, y, rx, ry, () => {
    const dx = (fx() - x) / rx;
    const dy = (fy() - y) / ry;
    let s = 0.5 + bias - dx * 0.34 - dy * 0.52;
    // leaf-shaped breakup: 2x1 fine flecks
    s += (hash2(FX >> 1, FY, seed) - 0.5) * 0.42;
    const e = dx * dx + dy * dy;
    if (e > 0.62 && dx + dy > 0.25) s -= 0.28;
    return tones[s < 0.18 ? 0 : s < 0.44 ? 1 : s < 0.74 ? 2 : s < 1.02 ? 3 : 4];
  });
  // leaf tips break the silhouette (only into empty pixels)
  const r = rng(seed * 7 + 3);
  for (let i = 0; i < 9; i++) {
    const a = r() * TAU;
    const px = x + Math.cos(a) * (rx + 0.25);
    const py = y + Math.sin(a) * (ry + 0.25);
    if (GP(px, py)) continue;
    const lit = Math.cos(a) * -0.6 + Math.sin(a) * -0.8 > 0.2;
    P1(px, py, lit ? tones[3] : tones[1]);
    if (r() < 0.5) P1(px + Math.cos(a) * 0.5, py + Math.sin(a) * 0.5, lit ? tones[2] : tones[0]);
  }
}
/** A crown of clumps: dark interior mass, then clumps from the bottom up. */
function crown(cx: number, cy: number, rx: number, ry: number, pal: LeafPal, seed: number, n: number): void {
  const tones = palTones(pal);
  const r = rng(seed);
  ell(cx, cy + 1, rx * 0.86, ry * 0.86, tones[0]);
  // clumps on jittered rings so the whole silhouette is bumpy, not just one side
  const cl: [number, number, number][] = [];
  const outer = Math.max(6, Math.round(n * 0.55));
  const inner = Math.max(3, n - outer - 1);
  const a0 = r() * TAU;
  for (let i = 0; i < outer; i++) {
    const a = a0 + (i / outer) * TAU + (r() - 0.5) * 0.4;
    const d = 0.7 + r() * 0.08;
    cl.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 3.6 + r() * 2.6]);
  }
  for (let i = 0; i < inner; i++) {
    const a = a0 + 0.5 + (i / inner) * TAU + (r() - 0.5) * 0.5;
    const d = 0.32 + r() * 0.12;
    cl.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 4.4 + r() * 2.8]);
  }
  cl.push([cx + (r() - 0.5) * 2, cy + (r() - 0.5) * 2, 5 + r() * 2]);
  // a top-left crest catches the sun
  cl.push([cx - rx * 0.2, cy - ry * 0.55, 5.2]);
  cl.sort((a, b) => b[1] - a[1]);
  cl.forEach(([x, y, b], i) => {
    const bias = -0.22 * ((x - cx) / rx) - 0.32 * ((y - cy) / ry);
    clump(x, y, b * 1.1, b * 0.92, tones, bias, seed + i * 11);
  });
  // sun-glints on the very top leaves
  for (let i = 0; i < n; i++) {
    const x = cx - rx * 0.6 + r() * rx * 0.9;
    const y = cy - ry * 0.85 + r() * ry * 0.6;
    if (GP(x, y) === tones[3]) P1(x, y, tones[4]);
  }
}
/** Tapered trunk with bark streaks, root flare and a knot. */
function trunkF(cx: number, top: number, base: number, wTop: number, wBase: number, c: Color, seed: number): void {
  const rp = ramp(c);
  const hw = (y: number) => (wTop + (wBase - wTop) * ((y - top) / (base - top))) / 2;
  const paint: Paint = () => {
    const y = fy();
    const u = (fx() - (cx - hw(y))) / (2 * hw(y));
    let s = u < 0.16 ? 0.95 : u < 0.5 ? 0.62 : u < 0.78 ? 0.36 : 0.14;
    // vertical bark furrows
    const f = hash2(FX, FY >> 2, seed);
    if (f < 0.22) s -= 0.25;
    else if (f > 0.93 && u < 0.6) s += 0.25;
    return pick(rp, s);
  };
  poly([[cx - wBase / 2, base], [cx - wTop / 2, top], [cx + wTop / 2, top], [cx + wBase / 2, base]], paint);
  // roots: left lit, right in shade
  poly([[cx - wBase / 2 - 4, base], [cx - wBase / 2 + 0.5, base - 4], [cx - wBase / 2 + 2, base]], rp[3]);
  L1(cx - wBase / 2 - 3.5, base - 0.5, cx - wBase / 2 + 0.5, base - 3.5, rp[4]);
  poly([[cx + wBase / 2 + 4.5, base], [cx + wBase / 2 - 0.5, base - 4.5], [cx + wBase / 2 - 2, base]], rp[1]);
  poly([[cx - 1.5, base], [cx + 0.5, base - 2], [cx + 2, base]], rp[2]);
  H1(cx - wBase / 2 - 4, cx + wBase / 2 + 4.5, base - 0.5, rp[0]);
  // a knot hole
  ell(cx + 0.6, top + (base - top) * 0.55, 0.9, 1.2, rp[0]);
  P1(cx, top + (base - top) * 0.55 - 1, rp[4]);
}
/** Bare winter branches with snow on top of each limb. */
function bareTree(cx: number, top: number, seed: number, c: Color): void {
  const r = rng(seed);
  const rp = ramp(c);
  const limb = (x: number, y: number, a: number, len: number, rad: number, depth: number) => {
    const x1 = x + Math.cos(a) * len;
    const y1 = y + Math.sin(a) * len;
    stroke([[x, y, rad], [x1, y1, Math.max(0.25, rad * 0.55)]], rp[depth > 1 ? 2 : 1]);
    if (rad > 0.5) L1(x - rad * 0.5, y - rad * 0.5, x1 - 0.3, y1 - 0.5, '#f6f8fc');
    if (depth > 0) {
      const n = depth > 1 ? 3 : 2;
      for (let i = 0; i < n; i++) limb(x1, y1, a + (r() - 0.5) * 1.3, len * (0.55 + r() * 0.2), rad * 0.6, depth - 1);
    } else P1(x1, y1 - 0.5, '#ffffff');
  };
  for (let i = 0; i < 5; i++) limb(cx + (i - 2) * 0.6, top + 6, -Math.PI / 2 + (i - 2) * 0.42 + (r() - 0.5) * 0.2, 9 + r() * 4, 1.2, 2);
}
/** Fine leaf-sway: rows above `upto` lean by dx, tapering toward the trunk. */
function swayedFine(s: Spr, upto: number, dx: number): void {
  const k = s.k ?? 1;
  for (let y = 0; y < s.h; y++) {
    const ly = y / k;
    const off = ly < upto ? Math.round(dx * (1 - ly / upto) * 0.6 * k + dx * 0.4 * k) / k : 0;
    for (let x = 0; x < s.w; x++) {
      const c = s.d[y * s.w + x];
      if (c) P1(x / k + off, ly, c);
    }
  }
}
const SWAY = [0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5];
const SRC = new Map<string, Spr>();
function treeKind(kind: string, w: number, h: number, build: (p: Props, season: string) => void, swayRows: number, extra?: (ctx: CanvasRenderingContext2D, o: MapObject, t: number) => void): void {
  const k: ObjectKind = {
    solid: { x: -5, y: -6, w: 10, h: 6 },
    draw(ctx, o, t) {
      const p = o.props ?? {};
      const season = getSeason();
      const v = vnum(p, 3);
      const f = Math.floor(t * 2.2 + o.x * 0.05 + o.y * 0.03) % SWAY.length;
      const key = kind + '|' + season + '|' + v;
      const src = SRC.get(key) ?? SRC.set(key, dense(KK, () => mkSpr(w, h, () => build(p, season)))).get(key)!;
      const a = dart(key + '|' + f, w, h, () => swayedFine(src, swayRows, season === 'winter' ? 0 : SWAY[f]), {
        pad: [2, 1, 10, 4],
        shadow: (ox, oy) => shadowF(ox + w / 2 + 3, oy + h - 1, w * 0.36, 3.6),
      });
      blit(ctx, a, o);
      if (extra) extra(ctx, o, t);
    },
  };
  registerObject(kind, k);
}
function fallenLeaves(x0: number, x1: number, y: number, seed: number, cols: Color[]): void {
  const r = rng(seed);
  for (let i = 0; i < 12; i++) {
    const x = x0 + r() * (x1 - x0);
    const yy = y - r() * 2;
    const c = cols[i % cols.length];
    P1(x, yy, c);
    P1(x + 0.5, yy, shA(c, 0.2));
  }
}
// Shade tree: 48 x 60, a 30 px adult reaches the lowest branches.
treeKind('tree', 48, 60, (p, season) => {
  const v = vnum(p, 3);
  const bark = v === 1 ? '#6e4a40' : '#7a5040';
  trunkF(24, 34, 59, 5, 8, bark, 91 + v);
  if (season === 'winter') {
    bareTree(24, 22, 11 + v, bark);
    tuftsF(14, 34, 59.5, 5 + v, 0.15, ['#c8cce0', '#e8ecf6', '#f6f8fc', '#ffffff']);
    return;
  }
  // limbs into the crown, visible in the gaps underneath
  const rp = ramp(bark);
  stroke([[24, 40, 2.2], [16, 31, 1.3], [10, 27, 0.6]], rp[1]);
  stroke([[24, 39, 2.2], [32, 30, 1.3], [38, 26, 0.6]], rp[0]);
  stroke([[24, 37, 1.6], [23, 26, 1], [25, 18, 0.5]], rp[1]);
  const pal = LEAVES[season];
  if (v === 1) {
    // tall oval elm with a second crown on top
    crown(24, 27, 18, 15, pal, 21, 18);
    crown(22, 14, 12, 10, pal, 23, 10);
  } else crown(24, 25, 20, 18, pal, 17 + v * 7, 24);
  if (v === 2 && season !== 'fall') {
    // apples in summer, blossom in spring
    const r = rng(41);
    for (let i = 0; i < 14; i++) {
      const x = 8 + r() * 32;
      const y = 8 + r() * 24;
      if (!GP(x, y)) continue;
      if (season === 'spring') {
        P1(x, y, '#fff0f4');
        P1(x + 0.5, y, '#ffb6cc');
        P1(x, y + 0.5, '#ffb6cc');
      } else {
        ell(x, y, 0.9, 0.9, '#d8303a');
        P1(x - 0.5, y - 0.5, '#ff9a80');
        P1(x, y - 1, '#5a3a2a');
      }
    }
  }
  if (season === 'fall') fallenLeaves(10, 40, 59.5, 31 + v, [pal.base, pal.lite, pal.mid, pal.hi]);
  tuftsF(15, 34, 59.5, 7 + v, 0.35);
}, 38);
// Pine: 32 x 64, drooping bough tiers with needle texture.
treeKind('tree-pine', 32, 64, (p, season) => {
  const pal = PINE[season];
  const v = vnum(p, 3);
  const tones = palTones(pal);
  trunkF(16, 46, 63, 3, 5, '#6a4438', 101 + v);
  const tiers: [number, number, number][] = [[1, 16, 6], [8, 27, 9.5], [16, 38, 12], [25, 49, 14.5]];
  tiers.forEach(([top, bot, hw], ti) => {
    // bough cone with a scalloped, drooping hem
    const hem = (x: number) => bot - Math.abs(Math.sin((x - 16) * 0.9 + ti + v)) * 2.2;
    poly([[16, top], [16 + hw, bot - 1], [16 - hw, bot - 1]], tones[0]);
    for (let x = 16 - hw; x <= 16 + hw; x += 0.5) {
      const yb = hem(x);
      const yt = top + ((bot - 1 - top) * Math.abs(x - 16)) / hw;
      if (yb > yt) R(x, yt, 0.5, yb - yt, tones[0]);
    }
    R(16 - hw, top, hw * 2, bot - top + 1, (_x, _y, o) => {
      if (!o) return null;
      const u = (fx() - (16 - hw)) / (2 * hw);
      const vv = (fy() - top) / (bot - top);
      // needles: short diagonal streaks fanning out from the centre
      const dir = fx() < 16 ? 1 : -1;
      const n = hash2(Math.floor((FX + FY * dir) / 2), FY >> 1, 7 + ti);
      let s = 0.95 - u * 0.75 - vv * 0.25 + (n - 0.5) * 0.5;
      if (vv > 0.86) s -= 0.3;
      return tones[s < 0.18 ? 0 : s < 0.42 ? 1 : s < 0.7 ? 2 : s < 0.95 ? 3 : 4];
    });
    // needle tips along the hem
    for (let x = 16 - hw + 0.5; x < 16 + hw; x += 1.5) {
      const yb = hem(x);
      L1(x, yb - 1, x - 0.5, yb + 0.5, x < 16 ? tones[2] : tones[1]);
    }
    if (season === 'winter') {
      // snow resting on each tier's upper slope
      for (let x = 16 - hw + 1; x < 16 + hw - 1; x += 0.5) {
        const yt = top + ((bot - 1 - top) * Math.abs(x - 16)) / hw;
        const th = 0.5 + (hash2(Math.floor(x * 2), ti, 5) < 0.5 ? 0.5 : 1);
        R(x, yt, 0.5, th, x < 16 ? '#ffffff' : '#dfe4f2');
      }
    }
  });
  if (season === 'winter') P1(16, 0.5, '#ffffff');
  else P1(16, 0.5, tones[4]);
  tuftsF(9, 24, 63.5, 13 + v, 0.3);
}, 50);
// Blossom tree: 44 x 54, a gnarled ornamental with a rounder crown.
treeKind(
  'tree-blossom',
  44,
  54,
  (p, season) => {
    const v = vnum(p, 3);
    const bark = '#6e4448';
    const rp = ramp(bark);
    trunkF(22, 30, 53, 4, 7, bark, 111 + v);
    stroke([[22, 33, 1.8], [15, 25, 1.1], [10, 22, 0.5]], rp[1]);
    stroke([[22, 32, 1.8], [29, 24, 1.1], [34, 21, 0.5]], rp[0]);
    if (season === 'winter') {
      bareTree(22, 20, 31, bark);
      return;
    }
    const pal = season === 'spring' ? BLOSSOM : LEAVES[season];
    crown(22, 19, 19, 15, pal, 51 + v, 18);
    if (season === 'spring') {
      const r = rng(53);
      for (let i = 0; i < 26; i++) {
        const x = 5 + r() * 34;
        const y = 5 + r() * 26;
        if (GP(x, y)) P1(x, y, '#ffffff');
      }
      // fallen petals at the foot
      fallenLeaves(8, 36, 53.5, 55, ['#ffbcd0', '#fff0f4', '#f094b4']);
    } else if (season === 'fall') fallenLeaves(8, 36, 53.5, 57, [pal.base, pal.lite, pal.mid]);
    tuftsF(13, 31, 53.5, 17 + v, 0.35);
  },
  34,
  (ctx, o, t) => {
    if (getSeason() !== 'spring') return;
    // a couple of petals drifting down
    const f = Math.floor(t * 4 + o.x) % 8;
    blitFx(ctx, dlayer('petals|' + f, 44, 54, [0, 14, 44, 40], () => {
      for (let i = 0; i < 3; i++) {
        const k = (f + i * 3) % 8;
        const x = 8 + i * 13 + Math.sin((k + i) * 0.9) * 2 + k;
        const y = 26 + k * 2.5 + i;
        P1(x, y, i % 2 ? '#ffbcd0' : '#fff0f4');
        P1(x + 0.5, y + 0.5, '#f094b4');
      }
    }), o);
  },
);

// =====================================================================
//  Plants
// =====================================================================
prop('bush', {
  w: 20,
  h: 16,
  vkey: (p) => getSeason() + vnum(p, 3),
  draw: (p) => {
    const v = vnum(p, 3);
    const s = getSeason();
    const pal = s === 'winter' ? LEAVES.winter : LEAVES[s === 'fall' ? 'summer' : s];
    crown(10, 9, 9, 6.5, pal, 61 + v, 9);
    if (v === 1) for (const [x, y] of [[5, 7], [10, 4.5], [14, 8.5], [7, 11], [12, 12]]) {
      // berries
      ell(x, y, 0.8, 0.8, s === 'fall' ? '#ffb030' : '#d8303a');
      P1(x - 0.5, y - 0.5, '#ffd8c0');
    }
    if (v === 2) for (const [x, y] of [[5, 6], [11, 4], [14, 9.5], [8, 10]]) {
      // little white roses
      ell(x, y, 1, 0.9, '#fff6ee');
      P1(x, y, '#ffb6cc');
      P1(x + 0.5, y + 0.5, '#e8c8c8');
    }
    if (s === 'winter') for (let x = 3; x < 17; x += 0.5) {
      const top = 3 + Math.abs(x - 10) * 0.45;
      R(x, top, 0.5, hash2(Math.floor(x * 2), 1, 9) < 0.5 ? 1 : 1.5, x < 11 ? '#ffffff' : '#dfe4f2');
    }
    tuftsF(3, 17, 15.5, 63 + v, 0.3);
  },
  solid: { x: -8, y: -6, w: 16, h: 6 },
  shadow: (ox, oy) => shadowF(ox + 12, oy + 15, 8, 2.5),
  pad: [1, 1, 6, 3],
});
function brickRun(x: number, y: number, w: number, h: number, seed: number): void {
  // brick edging: staggered bricks, mortar lines, chips and a lit top edge
  const B = ['#c4584a', '#b04a46', '#cc6450', '#a84846'];
  R(x, y, w, h, '#8a5a52');
  for (let row = 0; row * 2 < h; row++) {
    const off = row % 2 ? 2 : 0;
    for (let bx = x - off; bx < x + w; bx += 4) {
      const c = B[Math.floor(hash2(bx, row, seed) * 4)];
      const x0 = Math.max(x, bx);
      const x1 = Math.min(x + w, bx + 3.5);
      R(x0, y + row * 2, x1 - x0, 1.5, c);
      H1(x0, x1, y + row * 2, liA(c, 0.3));
      if (hash2(bx, row, seed + 1) < 0.3) P1(x1 - 0.5, y + row * 2 + 1, '#8a5a52');
    }
  }
}
prop('flowerbed', {
  w: 32,
  h: 13,
  vkey: () => getSeason(),
  draw: () => {
    R(0, 5, 32, 8, '#5a3a3a');
    R(1, 5, 30, 4, () => (fh(71, 2, 1) < 0.25 ? '#6e4a3e' : fh(72) < 0.1 ? '#3e2830' : '#58383a'));
    brickRun(0, 9, 32, 4, 73);
    const s = getSeason();
    const fl = s === 'fall' ? ['#f2903a', '#c070c0', '#ffd060'] : s === 'winter' ? ['#fff6ee', '#e8e8ff'] : ['#ff8fae', '#ffe070', '#fff6ee', '#c08ae0', '#e8505a'];
    const r = rng(71);
    for (let x = 2; x < 30.5; x += 2.5) {
      const y = 2 + r() * 3;
      // stem and leaves
      L1(x, y + 1, x + (r() - 0.5), 9, '#4f8a5a');
      P1(x + 0.5, y + 3, '#6fa85a');
      P1(x + 1, y + 3.5, '#8ab868');
      P1(x - 0.5, y + 4.5, '#6fa85a');
      if (s === 'winter') continue;
      // five-petal bloom with a sunny eye
      const c = fl[Math.floor(r() * fl.length)];
      for (const [dx, dy] of [[0, -0.5], [-0.5, 0], [0.5, 0], [-0.5, 0.5], [0.5, 0.5]]) P1(x + dx, y + dy, c);
      P1(x - 1, y, shA(c, 0.15));
      P1(x + 1, y + 0.5, shA(c, 0.3));
      P1(x, y, '#ffd860');
      P1(x - 0.5, y - 0.5, liA(c, 0.5));
    }
    if (s === 'winter') R(1, 4.5, 30, 1, '#f6f8fc');
  },
  solid: { x: -16, y: -8, w: 32, h: 8 },
  shadow: (ox, oy) => contactF(ox + 1, oy + 13, 32),
  pad: [0, 0, 2, 2],
});

// ---------------------------------------------------------------- variable-length props
/** Fill the per-instance collision box (length depends on props.w / props.h). */
function setSolid(o: MapObject, s: { x: number; y: number; w: number; h: number }): void {
  if (!o.props.solid) o.props.solid = s;
}
function hedgeArt(n: number, season: string): Art {
  const w = n * 16;
  return dart('hedge|' + n + '|' + season, w, 18, () => {
    const pal = season === 'winter' ? LEAVES.winter : LEAVES[season === 'fall' ? 'summer' : season];
    const tones = palTones(pal);
    // clipped box hedge: lit top surface, leafy front face, dark base
    RR(0, 2, w, 16, 3, tones[0]);
    R(0.5, 6, w - 1, 11, () => {
      const v = (fy() - 6) / 11;
      let s = 0.62 - v * 0.5 + (hash2(FX >> 1, FY, 81) - 0.5) * 0.5;
      if (hash2(FX >> 2, FY >> 2, 82) < 0.12) s -= 0.3;
      return tones[s < 0.18 ? 0 : s < 0.44 ? 1 : s < 0.74 ? 2 : 3];
    });
    RR(0.5, 1, w - 1, 6, 2, () => {
      const s = 0.9 + (hash2(FX >> 1, FY, 83) - 0.5) * 0.5 - ((fy() - 1) / 6) * 0.2;
      return tones[s < 0.6 ? 2 : s < 1.02 ? 3 : 4];
    });
    // ragged leafy top edge
    for (let x = 1; x < w - 1; x += 0.5) if (hash2(Math.floor(x * 2), 0, 84) < 0.35) P1(x, 0.5, tones[3]);
    for (let x = 0; x < w; x += 0.5) if (hash2(Math.floor(x * 2), 1, 85) < 0.4) P1(x, 17.5, tones[0]);
    if (season === 'winter') {
      R(0.5, 0.5, w - 1, 2, '#f6f8fc');
      for (let x = 0.5; x < w - 0.5; x += 0.5) if (hash2(Math.floor(x * 2), 2, 86) < 0.5) P1(x, 2.5, '#dfe4f2');
    }
  }, { pad: [0, 0, 4, 3], shadow: (ox, oy) => contactF(ox + 1, oy + 18, w) });
}
registerObject('hedge', {
  draw(ctx, o) {
    const n = tiles(o.props.w);
    setSolid(o, { x: -n * 8, y: -10, w: n * 16, h: 10 });
    const a = hedgeArt(n, getSeason());
    const x = Math.round(o.x) - n * 8 - 1;
    const y = Math.round(o.y) - 19;
    ctx.drawImage(a.cv, x, y);
    noteCaster(a.cv, x, y);
  },
});
/** A weathered picket: grain, flaking paint showing grey wood, nail heads. */
function picket(x: number, y: number, h: number, seed: number): void {
  const paint = '#f2ece4';
  poly([[x, y + 1.5], [x + 1.5, y], [x + 3, y + 1.5], [x + 3, y + h], [x, y + h]], () => {
    const u = (fx() - x) / 3;
    let c: number = col(u < 0.3 ? '#ffffff' : u < 0.75 ? paint : '#cfc4c4');
    const peel = hash2(FX >> 1, FY >> 2, seed);
    if (peel < 0.08) c = col(u < 0.5 ? '#a89a90' : '#8a7c7a');
    else if (hash2(FX, FY >> 3, seed + 3) < 0.12) c = shA(c, 0.08);
    // grime splashed up from the ground
    if (fy() > y + h - 2.5 && fd(6)) c = mixc(c, '#8a7a6a', 0.35);
    return c;
  });
  bolt(x + 1, y + 4, '#9a9098');
  bolt(x + 1, y + h - 5, '#9a9098');
}
registerObject('fence-h', {
  draw(ctx, o) {
    const n = tiles(o.props.w);
    setSolid(o, { x: -n * 8, y: -5, w: n * 16, h: 5 });
    const w = n * 16;
    const a = dart('fence-h|' + n, w, 18, () => {
      // two rails behind the pickets, then pickets with a 1 px gap
      for (const ry of [5, 12]) {
        R(0, ry, w, 2, woodPaint('#d8d0cc', 91 + ry, 0.12));
        H1(0, w, ry, '#ffffff');
        H1(0, w, ry + 1.5, '#9a8e92');
      }
      for (let x = 0; x < w; x += 4) picket(x + 0.5, (x / 4) % 2 ? 0.5 : 0, 18 - ((x / 4) % 2 ? 0.5 : 0), 93 + x);
    }, { pad: [0, 0, 3, 3], shadow: (ox, oy) => contactF(ox, oy + 18, w) });
    blit(ctx, a, o);
  },
});
registerObject('fence-v', {
  draw(ctx, o) {
    const n = tiles(o.props.h);
    setSolid(o, { x: -2, y: -n * 16, w: 4, h: n * 16 });
    const h = n * 16 + 10;
    const a = dart('fence-v|' + n, 6, h, () => {
      // seen end-on: the rail runs away from us, pickets overlap down its length
      R(2, 2, 2, h - 3, woodPaintV('#d8d0cc', 95, 0.1));
      V1(2, 2, h - 1, '#ffffff');
      for (let y = 0; y < h - 10; y += 4) {
        R(1, y + 1, 4, 10, () => {
          const u = (fx() - 1) / 4;
          const peel = fh(97 + y, 2, 4) < 0.07;
          if (peel) return '#a89a90';
          return u < 0.3 ? '#ffffff' : u < 0.75 ? '#f2ece4' : '#c8bcc0';
        });
        poly([[1, y + 1.5], [3, y], [5, y + 1.5]], '#ffffff');
        H1(1, 5, y + 10.5, '#9a8e92');
        bolt(2.5, y + 3, '#9a9098');
      }
    }, { pad: [0, 0, 3, 2], shadow: (ox, oy) => R(ox + 5, oy + 4, 2, h - 4, () => (fd(9) ? SH1 : SH2)) });
    blit(ctx, a, o);
  },
});
registerObject('bridge-rail', {
  draw(ctx, o) {
    const n = tiles(o.props.w);
    setSolid(o, { x: -n * 8, y: -4, w: n * 16, h: 4 });
    const w = n * 16;
    const a = dart('bridge-rail|' + n, w, 16, () => {
      // top rail with grain, X-braces, square posts with caps and bolts
      for (let x = 0; x < w; x += 16) {
        const xe = Math.min(w - 3, x + 16);
        L1(x + 3, 6, xe, 14, '#7a4c3a');
        L1(x + 3, 6.5, xe, 14.5, '#b07a58');
        L1(x + 3, 14, xe, 6, '#6e4438');
      }
      R(0, 2.5, w, 3, woodPaint('#a8704f', 101, 0.2));
      H1(0, w, 2.5, '#e0aa78');
      H1(0, w, 5, '#5e3a3a');
      const post = (x: number) => {
        R(x, 0.5, 3, 15.5, woodPaintV('#8a5a44', 103 + x, 0.2));
        V1(x, 0.5, 16, '#c08e62');
        V1(x + 2.5, 1, 16, '#4e3034');
        R(x - 0.5, 0, 4, 1, '#b88a60');
        bolt(x + 1.5, 3.5, '#c8c4d8');
        bolt(x + 1.5, 12, '#c8c4d8');
        P1(x + 1, 15, '#5a8a4a');
      };
      for (let x = 0; x < w - 3; x += 16) post(x);
      post(w - 3);
    }, { pad: [0, 0, 2, 3], shadow: (ox, oy) => contactF(ox, oy + 16, w) });
    blit(ctx, a, o);
  },
});

// =====================================================================
//  Street furniture (sized against a 30 px adult)
// =====================================================================
const IRON = '#3f3256';
const ironR = ramp(IRON);
/** Cast iron fill: soft gleam on the left edge of each piece, plum-black body. */
const ironPaint = (x: number, w: number): Paint => cylPaint(x, w, '#4a3c62', 0, 0);
prop('lamp', {
  w: 24,
  h: 54,
  draw: () => {
    const x = 12;
    const base = 54;
    // stepped plinth with fluting and an acanthus collar
    R(x - 3.5, base - 4, 7, 4, ironPaint(x - 3.5, 7));
    R(x - 4, base - 1, 8, 1, ironR[0]);
    H1(x - 3.5, x + 3.5, base - 4, ironR[3]);
    R(x - 2.5, base - 9, 5, 5, ironPaint(x - 2.5, 5));
    for (let k = -1.5; k <= 1.5; k += 1) V1(x + k, base - 8.5, base - 4.5, ironR[0]);
    H1(x - 3, x + 3, base - 9, ironR[3]);
    // the fluted column
    R(x - 1.5, 13, 3, base - 22, ironPaint(x - 1.5, 3));
    V1(x - 0.5, 14, base - 10, ironR[0]);
    V1(x + 0.5, 14, base - 10, ironR[1]);
    // collar rings
    for (const y of [14, 26, base - 10]) {
      R(x - 2, y, 4, 1.5, ironPaint(x - 2, 4));
      H1(x - 2, x + 2, y, ironR[4]);
    }
    // crossarm with scrolls (ladder rest)
    R(x - 5, 17, 10, 1, ironR[1]);
    H1(x - 5, x + 5, 17, ironR[3]);
    for (const s of [-1, 1]) {
      circ(x + s * 5, 18.5, 1.2, ironR[1]);
      circ(x + s * 5, 18.5, 0.5, 0);
      P1(x + s * 5.5, 19, 0);
      ell(x + s * 5.25, 17.4, 0.4, 0.4, ironR[4]);
    }
    // lantern: cap, glowing panes, cage bars, finial
    poly([[x - 5, 4], [x, 0.5], [x + 5, 4]], ironPaint(x - 5, 10));
    R(x - 5.5, 4, 11, 1, ironR[1]);
    H1(x - 5.5, x + 5.5, 4, ironR[4]);
    circ(x, 0.5, 0.8, ironR[3]);
    poly([[x - 4, 5], [x + 4, 5], [x + 3, 12], [x - 3, 12]], () => {
      const dy = (fy() - 5) / 7;
      const dx = Math.abs(fx() - x) / 4;
      const g = 1 - dx * 0.6 - Math.abs(dy - 0.45) * 0.8;
      return g > 0.65 ? '#fffbe0' : g > 0.42 ? '#ffe9a0' : g > 0.2 ? '#ffd070' : '#f2b050';
    });
    ell(x, 8, 1.2, 1.6, '#ffffff');
    for (const bx of [-2, 0, 2]) L1(x + bx * 1.05, 5, x + bx * 0.85, 12, ironR[1]);
    R(x - 3.5, 12, 7, 1.5, ironPaint(x - 3.5, 7));
    poly([[x - 2, 13.5], [x + 2, 13.5], [x + 0.5, 15], [x - 0.5, 15]], ironR[1]);
    // hanging flower basket on the right arm
    L1(x + 5, 19, x + 6.5, 22, ironR[2]);
    L1(x + 5, 19, x + 3.5, 22, ironR[2]);
    RR(x + 2.5, 22, 7, 3.5, 1, () => (fh(117, 1, 1) < 0.5 ? '#8a5a4a' : '#7a4c40'));
    H1(x + 2.5, x + 9.5, 22, '#b07a5a');
    const blooms: [number, number, string][] = [[3.5, 21.5, '#ff8fae'], [5, 21, '#ffe070'], [6.5, 21.5, '#ff8fae'], [8.5, 21.5, '#fff6ee'], [4.5, 22.5, '#e8505a'], [7.5, 22.5, '#c08ae0']];
    for (const [dx, dy, c] of blooms) {
      ell(x + dx, dy, 0.7, 0.6, c);
      P1(x + dx, dy, '#ffd860');
    }
    for (const [dx, dy] of [[3, 25.5], [3.5, 27], [8.5, 26], [9, 27.5], [6, 26.5]]) {
      P1(x + dx, dy, '#6f9a5a');
      P1(x + dx + 0.5, dy + 0.5, '#4f7a5a');
    }
    // town banner with a turnbuckle on the left arm
    L1(x - 11, 28.5, x - 1.5, 28.5, ironR[1]);
    R(x - 10.5, 29, 8, 15, () => {
      const u = (fx() - (x - 10.5)) / 8;
      const fold = Math.sin(u * 7) * 0.5 + 0.5;
      return mixc('#2f7a76', '#5ab0a0', fold * 0.6 + (u < 0.15 ? 0.3 : 0));
    });
    poly([[x - 10.5, 44], [x - 6.5, 42], [x - 2.5, 44], [x - 2.5, 45.5], [x - 6.5, 43.5], [x - 10.5, 45.5]], '#2f7a76');
    H1(x - 10, x - 3, 30, '#f4b63f');
    H1(x - 10, x - 3, 42, '#f4b63f');
    R(x - 7.5, 31.5, 2, 9, '#e8e4f0');
    V1(x - 6, 31.5, 40.5, '#a8a2c0');
    for (const py of [32, 34.5, 37]) {
      RR(x - 9, py, 5, 2, 1, '#e8505a');
      H1(x - 8.5, x - 4.5, py, '#ff8a80');
    }
    // grime at the foot
    R(x - 4, base - 1.5, 8, 1.5, (_x, _y, o) => (fd(6) ? mixc(o, '#6a5a4a', 0.4) : o));
  },
  solid: { x: -3, y: -4, w: 7, h: 4 },
  shadow: (ox, oy) => {
    shadowF(ox + 13, oy + 53, 5, 1.6);
    // the long late-day pole shadow, fading out
    for (let k = 0; k < 20; k += 0.5) {
      P1(ox + 15 + k, oy + 53 + k * 0.18, SH2);
      if (k < 12) P1(ox + 15 + k, oy + 53.5 + k * 0.18, SH2);
    }
  },
  lights: [[12, 8, 44, LAMP]],
});
prop('bench', {
  w: 32,
  h: 18,
  draw: () => {
    // cast iron scroll ends
    const end = (x: number) => {
      stroke([[x + 1, 1, 0.9], [x + 1, 6, 0.9], [x + 2, 10, 0.9], [x + 0.5, 17, 0.9]], ironR[1]);
      stroke([[x + 2, 10, 0.9], [x + 3.5, 17, 0.9]], ironR[1]);
      L1(x + 0.6, 1, x + 0.6, 6, ironR[3]);
      L1(x + 1.5, 10, x + 0.2, 16.5, ironR[3]);
      circ(x + 2.5, 13, 1.1, ironR[1]);
      circ(x + 2.5, 13, 0.4, 0);
      R(x - 0.5, 16.5, 2, 1.5, ironR[0]);
      R(x + 2.5, 16.5, 2, 1.5, ironR[0]);
    };
    // backrest slats
    for (let k = 0; k < 3; k++) {
      R(1, 1 + k * 2.5, 30, 2, woodPaint('#c88a5a', 121 + k));
      H1(1, 31, 1 + k * 2.5, '#f0bc84');
      H1(1, 31, 2.5 + k * 2.5, '#8a5a44');
    }
    // a brass plaque on the middle slat
    R(14, 3.5, 4, 1.5, '#f4b63f');
    H1(14, 18, 3.5, '#ffe090');
    P1(14.5, 4, '#a8742a');
    P1(17, 4, '#a8742a');
    // seat slats seen from above, then the front edge
    for (let k = 0; k < 3; k++) {
      R(0, 9 + k * 1.5, 32, 1.5, woodPaint(k ? '#b87a4a' : '#d09460', 125 + k));
      H1(0, 32, 9 + k * 1.5, k ? '#d89a6a' : '#f2c08a');
    }
    R(0, 13.5, 32, 1, woodPaint('#8a5a44', 128));
    H1(0, 32, 14, '#5e3a3a');
    // carved initials and a gum wad
    L1(23, 10, 24, 11, '#7a4a3a');
    L1(24.5, 10, 25.5, 11, '#7a4a3a');
    P1(8, 12.5, '#ff94b4');
    end(2);
    end(26);
  },
  solid: { x: -15, y: -6, w: 30, h: 6 },
  shadow: (ox, oy) => {
    R(ox + 2, oy + 15, 32, 3, () => (fd(12) ? SH1 : SH2));
    contactF(ox + 1, oy + 18, 4);
    contactF(ox + 26, oy + 18, 4);
  },
  label: 'Sit',
});
prop('mailbox', {
  w: 14,
  h: 22,
  draw: () => {
    // a blue collection box on four little legs, about a 30 px adult's chest height
    const B = '#4a68b8';
    const rp = ramp(B);
    RR(0.5, 0, 13, 17, 4, cylPaint(0.5, 13, B));
    // the domed top catches the sun
    ell(7, 2.5, 5.5, 2, rp[3]);
    ell(5.5, 1.8, 2.5, 0.8, rp[4]);
    // pull-down chute handle
    R(2.5, 5, 9, 3, rp[1]);
    R(3, 5.5, 8, 1.5, rp[0]);
    H1(3, 11, 5, rp[4]);
    R(6, 7.5, 2, 1, '#c8c4d8');
    H1(6, 8, 7.5, '#ffffff');
    // label plate and stencilled MAIL
    R(2, 10, 10, 4.5, '#e8e4f0');
    H1(2, 12, 10, '#ffffff');
    H1(2, 12, 14, '#a8a8c8');
    TFC('MAIL', 7, 10.5, '#30407c');
    H1(3, 11, 13.5, '#d8434b');
    // paint scuffs and a sticker
    R(0.5, 0, 13, 17, (_x, _y, o) => (o && fh(131, 2, 2) < 0.04 ? '#9aa2c8' : o));
    R(10, 14.5, 2, 1.5, '#f4b63f');
    // legs
    for (const lx of [1.5, 10.5]) {
      R(lx, 17, 2, 5, rp[0]);
      V1(lx, 17, 22, rp[2]);
      R(lx - 0.5, 21.5, 3, 0.5, '#2f3a6a');
    }
  },
  solid: { x: -6, y: -4, w: 12, h: 4 },
  shadow: (ox, oy) => shadowF(ox + 9, oy + 21.5, 7, 2),
});
prop('hydrant', {
  w: 12,
  h: 14,
  draw: () => {
    const C = '#d8484e';
    const rp = ramp(C);
    // bonnet with operating nut
    R(5, 0, 2, 1.5, '#b8b4c8');
    H1(5, 7, 0, '#ffffff');
    ell(6, 2.5, 3.2, 1.6, rp[3]);
    ell(5.5, 2, 1.5, 0.6, rp[4]);
    // barrel
    R(3, 3, 6, 8, cylPaint(3, 6, C));
    R(2.5, 3, 7, 1, rp[1]);
    // side nozzles with caps and a chain
    for (const s of [-1, 1]) {
      const nx = s < 0 ? 0.5 : 9;
      R(nx, 5, 2.5, 2.5, s < 0 ? rp[3] : rp[1]);
      R(s < 0 ? 0 : 11, 5.5, 1, 1.5, '#b8b4c8');
      bolt(nx + 1, 6, '#ffffff');
    }
    for (let k = 0; k < 4; k++) P1(2 + k * 0.5, 7.5 + Math.sin(k) * 0.5, '#c8c4d8');
    // front pumper nozzle
    ell(6, 6.5, 1.4, 1.4, rp[2]);
    ell(6, 6.5, 0.8, 0.8, '#b8b4c8');
    P1(5.5, 6, '#ffffff');
    // flange, bolts, base
    R(2, 10.5, 8, 1.5, rp[1]);
    for (const bx of [3, 5, 7, 9]) bolt(bx - 0.5, 11, '#ffb0a0');
    R(1.5, 12, 9, 2, rp[0]);
    H1(1.5, 10.5, 12, rp[2]);
    // chipped paint and a dog-height rust ring
    R(3, 3, 6, 8, (_x, _y, o) => (o && fh(141, 1, 2) < 0.05 ? '#a87048' : o));
    R(1.5, 12, 9, 2, (_x, _y, o) => (fd(5) ? mixc(o, '#8a5a3a', 0.5) : o));
  },
  solid: { x: -4, y: -4, w: 8, h: 4 },
  shadow: (ox, oy) => shadowF(ox + 8, oy + 13.5, 5.5, 1.6),
});

// ---------------------------------------------------------------- trash can + Jobber
const CAN = { g: '#c3c6dc', G: '#9298b8', n: '#666c90', N: '#464a6c', w: '#eef0fa' };
function canBody(top: number): void {
  // galvanised can: corrugated ribs, a dent, grime creeping up from the base
  R(1, top, 12, 17 - top, () => {
    const u = (fx() - 1) / 12;
    const rib = Math.floor(FX / 2) % 2 === 0;
    let s = u < 0.14 ? 0.95 : u < 0.4 ? 0.75 : u < 0.7 ? 0.5 : u < 0.9 ? 0.3 : 0.14;
    if (rib) s -= 0.1;
    const c = s > 0.9 ? CAN.w : s > 0.6 ? CAN.g : s > 0.35 ? CAN.G : s > 0.2 ? CAN.n : CAN.N;
    if (fy() > 14.5 && fd(7)) return mixc(c, '#7a6a5a', 0.4);
    return c;
  });
  for (const ry of [top + 3, top + 9]) {
    R(0.5, ry, 13, 1, CAN.G);
    H1(0.5, 13.5, ry, CAN.w);
  }
  // a dent
  ell(9, top + 6, 1.5, 1.2, CAN.n);
  P1(8.5, top + 5.5, CAN.w);
  R(1.5, 16.5, 11, 0.5, CAN.N);
}
function drawCan(raccoon: boolean): void {
  if (!raccoon) {
    canBody(4);
    // domed lid with a handle
    ell(7, 3.5, 7, 2, CAN.g);
    ell(6, 3, 4.5, 1.2, CAN.w);
    R(0, 3.5, 14, 1, CAN.n);
    RR(4.5, 0, 5, 2, 1, CAN.G);
    H1(5, 9, 0, CAN.w);
    // a pizza box poking out
    poly([[9, 2.5], [13, 1], [13.5, 2], [10, 3.5]], '#e8c890');
    return;
  }
  canBody(9);
  // the lid tipped back on Jobber's head
  poly([[0, 3.5], [12.5, 1], [13.5, 3], [1, 5.5]], CAN.g);
  L1(0, 3.5, 12.5, 1, CAN.w);
  L1(1, 5.5, 13.5, 3, CAN.n);
  // Jobber peeking out: grey head, bandit mask, bright eyes, white brow
  RR(2, 6, 10, 4.5, 1, '#8e7a72');
  P(2, 5, '#8e7a72');
  P(11, 5, '#8e7a72');
  P1(2.5, 5, '#4e3e48');
  P1(11, 5, '#4e3e48');
  P1(2.5, 5.5, '#c8a8a0');
  P1(11, 5.5, '#c8a8a0');
  H1(3, 11, 6.5, '#f2e6d6');
  R(2, 7, 10, 2, AK);
  ell(4.5, 8, 0.9, 0.8, '#fffbe0');
  ell(9.5, 8, 0.9, 0.8, '#fffbe0');
  P1(4.5, 8, AK);
  P1(9.5, 8, AK);
  ell(7, 9.5, 0.8, 0.5, AK);
  P1(6.5, 9, '#8a7a8a');
  H1(3, 11, 9.5, '#f2e6d6');
  // little paws on the rim
  R(2.5, 10, 1.5, 1, '#4e3e48');
  R(10, 10, 1.5, 1, '#4e3e48');
  R(0.5, 10.5, 13, 0.5, CAN.n);
}
const TAIL = [
  ['rr......', 'qrr.....', '.qqrr...', '..rrqq..', '...qqrr.', '....rrq.', '.....qr.', '......q.'],
  ['rr......', 'qrr.....', '.qqrr...', '..rrqqr.', '...qqrrq', '.....rqq', '......r.', '........'],
];
const tailPal = { r: '#8e7a72', q: '#4e3e48' };
registerObject('trashcan', {
  solid: { x: -6, y: -5, w: 12, h: 5 },
  label: (o) => (o.props?.raccoon ? 'Jobber' : null),
  draw(ctx, o, t) {
    const rac = !!o.props?.raccoon;
    const base = dart('trashcan|' + rac, 14, 17, () => drawCan(rac), { pad: [0, 0, 5, 3], shadow: (ox, oy) => shadowF(ox + 9, oy + 16.5, 7.5, 2) });
    blit(ctx, base, o);
    if (!rac) return;
    const tk = tick(t) + Math.floor(o.x);
    // blink now and then
    if (tk % 70 < 2) blitFx(ctx, dlayer('jobber|blink', 14, 17, [3, 7, 8, 2], () => {
      H1(3.5, 5.5, 8, AK);
      H1(8.5, 10.5, 8, AK);
    }), o);
    // the tail swishes over the side
    const f = Math.floor(tk / 8) % 2;
    blitFx(ctx, dlayer('jobber|tail|' + f, 14, 17, [12, 9, 10, 9], (ox, oy) => {
      const s = SP(TAIL[f], tailPal);
      DS(s, ox + 13, oy + 10);
    }, true, true), o);
  },
});
prop('sign', {
  w: 18,
  h: 20,
  draw: () => {
    // a hand-made board on a post, nailed, rained on, sun-faded
    R(8, 9, 2.5, 11, woodPaintV('#7a4a3a', 151));
    V1(8, 9, 20, '#a8704f');
    RR(0, 0, 18, 11, 1, '#8a5a44');
    R(1, 1, 16, 4.5, woodPaint('#c88a5a', 152, 0.2));
    R(1, 5.5, 16, 4.5, woodPaint('#b87c50', 153, 0.2));
    H1(1, 17, 5.5, '#7a4a3a');
    H1(1, 17, 1, '#f0bc84');
    // hand-lettered scrawl
    for (let k = 0; k < 3; k++) {
      const y = 2.5 + k * 2.5;
      for (let x = 3; x < 15 - k * 2; x += 0.5) if (hash2(Math.floor(x * 2), k, 154) < 0.7) P1(x, y + (hash2(Math.floor(x * 2), k, 155) < 0.3 ? 0.5 : 0), '#5e3a3a');
    }
    for (const [nx, ny] of [[2, 2], [15.5, 2], [2, 8.5], [15.5, 8.5]]) bolt(nx, ny, '#a8a2b8');
    // water stain running down from a nail
    V1(15.5, 3, 7, '#a87048');
    tuftsF(5, 13, 19.5, 156, 0.5);
  },
  solid: { x: -2, y: -3, w: 4, h: 3 },
  shadow: (ox, oy) => shadowF(ox + 11, oy + 19.5, 5, 1.5),
  label: 'Read',
});
prop('phone-booth', {
  w: 22,
  h: 40,
  draw: () => {
    const C = '#c8303e';
    const rp = ramp(C);
    // a cherry-red booth (~7 ft) with a lit PHONE header
    R(0, 7, 22, 33, cylPaint(0, 22, C));
    RR(0, 0, 22, 8, 1, rp[2]);
    H1(1, 21, 0, rp[4]);
    R(1.5, 1.5, 19, 5, '#fff4dc');
    R(1.5, 5.5, 19, 1, '#f2dcb0');
    TC('PHONE', 11, 1, C, FT, {});
    // roof cap
    R(-0.5, 7, 23, 1.5, rp[1]);
    H1(-0.5, 22.5, 7, rp[3]);
    // glass door panes with the payphone inside
    glassF(3, 10, 16, 24, '#8a9ab8', () => {
      R(3, 10, 16, 24, () => mixc('#c8a888', '#e8c8a0', 1 - (fy() - 10) / 24));
      RR(8, 11.5, 7, 10, 1, '#4a4a6a');
      R(9, 12.5, 5, 3, '#a8b8c8');
      H1(9, 14, 12.5, '#e8f0f8');
      for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) R(9.5 + j * 1.5, 16.5 + k * 1, 1, 0.5, '#c8c4d8');
      R(14, 15, 0.5, 6, '#c8c4d8');
      // the handset on its hook, cord coiling down
      R(7, 13, 1.5, 5, AK);
      for (let y = 18; y < 24; y += 0.5) P1(7.5 + Math.sin(y * 3) * 0.5, y, AK);
      // phone book on its shelf
      R(4, 27, 14, 1, '#8a5a44');
      R(6, 25, 6, 2, '#f4d860');
      H1(6, 12, 25, '#fff0a0');
      R(3, 31, 16, 3, '#b89878');
    }, 0.9);
    // door frame: two leaves and the brass handle
    for (const y of [17, 26]) {
      R(3, y, 16, 1, rp[1]);
      H1(3, 19, y, rp[3]);
    }
    R(10.5, 10, 1, 24, rp[1]);
    V1(10.5, 10, 34, rp[3]);
    R(16, 20, 1, 3, '#f4b63f');
    P1(16, 20, '#ffe8a0');
    // kick plate, scuffs, a sticker
    R(0, 35, 22, 5, rp[0]);
    H1(0, 22, 35, rp[2]);
    R(0, 35, 22, 5, (_x, _y, o) => (fh(161, 2, 1) < 0.08 ? '#9a8a8a' : o));
    R(19.5, 28, 2, 2.5, '#5ec0a8');
  },
  solid: { x: -10, y: -7, w: 20, h: 7 },
  shadow: (ox, oy) => {
    R(ox + 22, oy + 6, 3, 34, () => (fd(10) ? SH1 : SH2));
    contactF(ox + 1, oy + 40, 23);
  },
  pad: [0, 0, 5, 3],
  lights: [[11, 20, 22, WARM], [11, 4, 12, '#fff4dc']],
  label: 'Call',
});
prop('newsstand', {
  w: 14,
  h: 21,
  draw: () => {
    // the Tattler box: yellow steel, a window on today's front page, coin slot
    const Y = '#f4b63f';
    const rp = ramp(Y);
    RR(0, 0, 14, 15, 1, cylPaint(0, 14, Y));
    R(0.5, 0.5, 13, 3.5, '#2f6a74');
    H1(0.5, 13.5, 0.5, '#5aa0a8');
    TFC('TATTLER', 7, 1, '#fff4dc');
    // window: the paper inside with a headline and a photo
    R(1.5, 5, 11, 7, '#3a3048');
    glassF(2, 5.5, 10, 6, '#f4eee0', () => {
      R(2.5, 6, 9, 5.5, '#f4eee0');
      TFC('CHAMP!', 7, 6, '#4a3a5a');
      R(3, 8, 3.5, 3, '#a8a0b8');
      P1(4.5, 9, '#6a5a7a');
      for (let y = 8; y < 11; y += 1) H1(7, 11, y, '#b8b0c4');
    }, 0.7);
    // handle, coin slot, price sticker
    R(4.5, 12.5, 5, 1, rp[0]);
    H1(4.5, 9.5, 12.5, rp[4]);
    R(11, 12, 1.5, 2, '#5a5a7a');
    P1(11.5, 12.5, AK);
    R(1, 12.5, 2.5, 1.5, '#ff5d8f');
    // pedestal
    R(5.5, 15, 3, 5, '#5a5a7a');
    V1(5.5, 15, 20, '#8a8aaa');
    R(3.5, 20, 7, 1, '#464a6c');
    H1(3.5, 10.5, 20, '#8a8aaa');
    R(0, 0, 14, 15, (_x, _y, o) => (o && fh(171, 2, 2) < 0.04 ? '#c88a2a' : o));
  },
  solid: { x: -6, y: -4, w: 12, h: 4 },
  shadow: (ox, oy) => shadowF(ox + 9, oy + 20.5, 6.5, 1.6),
  label: 'Tattler',
});
prop('vending', {
  w: 20,
  h: 33,
  draw: () => {
    const C = '#d8434b';
    const rp = ramp(C);
    R(0, 0, 20, 33, cylPaint(0, 20, C));
    R(0.5, 0.5, 19, 2.5, rp[3]);
    H1(0.5, 19.5, 0.5, rp[4]);
    // lit display of cans behind glass
    glassF(2, 4, 12, 16, '#fff0d8', () => {
      R(2, 4, 12, 16, () => mixc('#fff6e4', '#e8d8c0', (fy() - 4) / 16));
      const cs = ['#d8434b', '#3f9a92', '#f4b63f', '#9a6ad0'];
      for (let r = 0; r < 3; r++) {
        H1(2, 14, 8.5 + r * 5, '#a89888');
        for (let k = 0; k < 4; k++) {
          const c = cs[(r + k) % 4];
          R(2.5 + k * 3, 5 + r * 5, 2, 3.5, cylPaint(2.5 + k * 3, 2, c));
          H1(2.5 + k * 3, 4.5 + k * 3, 5 + r * 5, '#e8e4f0');
        }
      }
    }, 0.6);
    // selection buttons and coin slot
    R(15, 4, 3.5, 12, '#3a3048');
    for (let k = 0; k < 5; k++) {
      R(15.5, 4.5 + k * 2, 2.5, 1.5, '#5a4a6a');
      P1(16, 5 + k * 2, '#7ae0d0');
    }
    R(16, 15, 1, 1, '#c8c4d8');
    // POP badge and the dispenser flap
    R(2, 21, 16, 4, '#fff4e6');
    H1(2, 18, 21, '#ffffff');
    TC('POP', 10, 21, C, FT, {});
    R(3, 26.5, 14, 4.5, AK);
    H1(3, 17, 26.5, '#5a4a6a');
    R(4, 27.5, 12, 2, '#4a3a5a');
    // stickers and scuffs at kick height
    R(15, 22, 3, 2, '#ffd050');
    R(0, 31, 20, 2, (_x, _y, o) => (fd(6) ? mixc(o, '#5a4a4a', 0.4) : o));
  },
  solid: { x: -9, y: -6, w: 18, h: 6 },
  shadow: (ox, oy) => {
    R(ox + 20, oy + 4, 3, 29, () => (fd(10) ? SH1 : SH2));
    contactF(ox + 1, oy + 33, 21);
  },
  pad: [0, 0, 5, 3],
  lights: [[10, 12, 20, '#fff0d0']],
  label: 'Buy',
});
prop('picnic-table', {
  w: 34,
  h: 20,
  draw: () => {
    // far bench, table top, splayed legs, near bench
    R(4, 2, 26, 2, woodPaint('#a8704f', 181));
    H1(4, 30, 2, '#d09a6a');
    R(1, 5, 32, 7, woodPaint('#c88a5a', 182, 0.18));
    for (let y = 5; y < 12; y += 1.75) H1(1, 33, y, '#e8b078');
    for (let y = 6.75; y < 12; y += 1.75) H1(1, 33, y - 0.5, '#8a5a44');
    H1(1, 33, 11.5, '#6e4438');
    stroke([[6, 12, 0.8], [3.5, 19, 0.8]], '#7a4a3a');
    stroke([[28, 12, 0.8], [30.5, 19, 0.8]], '#6a3e34');
    R(2, 14, 30, 3, woodPaint('#b87a4a', 183));
    H1(2, 32, 14, '#e0a874');
    H1(2, 32, 16.5, '#5e3a3a');
    // a gingham cloth corner and a jug of lemonade with a glass
    R(19, 5, 11, 5.5, () => ((Math.floor(fx()) + Math.floor(fy())) % 2 ? '#fbf0e4' : '#e86a70'));
    R(19, 10, 11, 0.5, '#c8505a');
    RR(8, 2, 4, 5.5, 1, '#fff4b0');
    R(8.5, 3, 3, 4, '#ffe060');
    H1(8.5, 11.5, 3, '#ffffff');
    V1(9, 3.5, 6.5, '#fffbe0');
    R(13.5, 5, 1.5, 2.5, '#fff8d0');
    H1(13.5, 15, 5, '#ffffff');
  },
  solid: { x: -16, y: -12, w: 32, h: 10 },
  shadow: (ox, oy) => R(ox + 2, oy + 18, 34, 3, () => (fd(10) ? SH1 : SH2)),
  label: 'Sit',
});
function flagpoleFlag(f: number): void {
  flagFrame(6, 2, f, 14, 9);
}
prop('flagpole', {
  w: 24,
  h: 64,
  draw: () => {
    R(5, 2, 1.5, 59, cylPaint(5, 1.5, '#b8b4cc'));
    circ(5.75, 1.5, 1.5, '#f4b63f');
    P1(5, 0.5, '#fff0a0');
    // halyard and cleat
    L1(6.5, 3, 6.5, 52, '#f2ece4');
    R(6.5, 50, 1, 2, '#9a92a8');
    // concrete footing with a plaque
    R(2, 60, 8, 4, () => (fh(191, 1, 1) < 0.2 ? '#8a8298' : '#a8a0b8'));
    H1(2, 10, 60, '#d8d0e0');
    R(4, 61, 4, 1.5, '#c8a050');
    flagpoleFlag(0);
  },
  solid: { x: -9, y: -3, w: 6, h: 3 },
  shadow: (ox, oy) => {
    for (let k = 0; k < 24; k += 0.5) P1(ox + 8 + k, oy + 63 + k * 0.12, SH2);
    shadowF(ox + 7, oy + 63, 5, 1.5);
  },
  anims: [{ fps: 5, frames: 4, rect: [6, 0, 18, 14], draw: (f) => flagpoleFlag(f) }],
});

// =====================================================================
//  Vehicles: 50s sedan 68 px long, step-side pickup 72 px (D-019)
// =====================================================================
const CHROME = ['#5a5878', '#8a88a8', '#c8c6dc', '#eeeef8', '#ffffff'].map(col);
/** Whitewall tyre with a domed chrome hubcap. */
function wheelF(x: number, y: number, r = 5.5): void {
  ell(x, y, r, r, AK);
  ell(x, y, r - 0.5, r - 0.5, '#3a3048');
  // tread blocks on the visible rim
  for (let a = 0; a < TAU; a += TAU / 18) P1(x + Math.cos(a) * (r - 0.25), y + Math.sin(a) * (r - 0.25), '#4a4060');
  ell(x, y, r * 0.7, r * 0.7, '#f2ecf2');
  ell(x + 0.25, y + 0.25, r * 0.7, r * 0.7, (_x, _y, o) => (fx() > x + 1 && fy() > y + 1 ? '#c8c0d0' : o));
  ell(x, y, r * 0.52, r * 0.52, () => {
    const dx = fx() - x;
    const dy = fy() - y;
    const s = 0.6 - dx * 0.18 - dy * 0.22;
    return CHROME[s < 0.2 ? 0 : s < 0.45 ? 1 : s < 0.8 ? 2 : s < 1.05 ? 3 : 4];
  });
  // spinner spokes and the centre cap
  for (let k = 0; k < 4; k++) {
    const a = k * (TAU / 4) + 0.4;
    L1(x + Math.cos(a) * 0.8, y + Math.sin(a) * 0.8, x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, CHROME[1]);
  }
  ell(x, y, 0.9, 0.9, CHROME[3]);
  P1(x - 0.5, y - 0.5, CHROME[4]);
  P1(x - r * 0.3, y - r * 0.32, CHROME[4]);
}
/** Body paint for a car side: shoulder highlight, mid tone, shaded rocker. */
function carSidePaint(c: Color, y0: number, y1: number): Paint {
  const rp = ramp(c);
  return () => {
    const v = (fy() - y0) / (y1 - y0);
    let s = v < 0.08 ? 1.0 : v < 0.2 ? 0.86 : v < 0.55 ? 0.62 : v < 0.82 ? 0.4 : 0.18;
    s += (fh(7, 3, 1) - 0.5) * 0.04;
    return pick(rp, s);
  };
}
/** Two-tone schemes: body, roof / sweep panel. */
const CAR_TONES: [string, string][] = [['#d8434b', '#f6eed8'], ['#2fa59a', '#f2f0e8'], ['#f2c860', '#8a5a44'], ['#9a7ac8', '#f6eed8']];
function drawCar(p: Props): void {
  const v = vnum(p, 4);
  const [c, c2] = CAR_TONES[v];
  const rp = ramp(c);
  const rp2 = ramp(c2);
  const GL = '#7aa8c8';
  // ---- greenhouse: two-tone roof, pillars, glass seen a little from above
  poly([[17.5, 15.5], [24.5, 4.5], [44.5, 4.5], [52, 15.5]], rp2[2]);
  RR(24, 2.5, 21, 3, 1, () => (fy() < 3.5 ? rp2[4] : rp2[3]));
  glassF(17, 5.5, 36, 10, GL, () => {
    // interior: seat backs, steering wheel, a fuzzy die on the mirror
    R(27, 10.5, 6, 5, '#4a3a5a');
    H1(27, 33, 10.5, '#6a5a7a');
    R(40, 10.5, 4.5, 5, '#4a3a5a');
    H1(40, 44.5, 10.5, '#6a5a7a');
    ell(47, 10.5, 1.6, 2.2, '#3a3048');
    ell(47, 10.5, 1, 1.5, GL);
    V1(38.5, 6, 7.5, '#e8e4f0');
    R(38, 7.5, 1, 1, '#ffffff');
    P1(38, 8, AK);
  }, 0.9);
  // trim the glass back to the window shapes
  poly([[16.5, 5.5], [25.3, 5.5], [18, 15.5], [16.5, 15.5]], 0);
  poly([[43.7, 5.5], [53.5, 5.5], [53.5, 15.5], [52, 15.5]], 0);
  // pillars: wide C pillar with a chrome script badge, B pillar, slim A pillar
  poly([[18.5, 15.5], [24.5, 5.2], [28, 5.2], [24.5, 15.5]], rp2[2]);
  L1(24.5, 5.4, 18.7, 15.3, rp2[4]);
  L1(27.8, 5.4, 24.3, 15.3, rp2[0]);
  L1(21.5, 11.5, 23.5, 11.5, CHROME[3]);
  R(34, 5.2, 2, 10.3, rp2[1]);
  V1(34, 5.2, 15.5, rp2[3]);
  poly([[43.2, 5.2], [44.8, 5.2], [51.5, 15.5], [49.5, 15.5]], rp2[1]);
  H1(25, 44.5, 5, CHROME[3]);
  // ---- body: sculpted profile with a low tail fin and a rounded nose
  const body: [number, number][] = [
    [0.5, 27], [0.5, 17.5], [1, 15], [8, 14.6], [17, 14.8], [19, 15.4], [51, 15.4], [61, 15.4], [65, 16], [67, 17.5], [67.8, 20], [67.8, 27], [60, 28.6], [8, 28.6],
  ];
  poly(body, () => {
    const y = fy();
    const x = fx();
    const vv = (y - 15) / 13.6;
    // sky reflection up top, a crisp horizon line, ground warmth down low
    let s = vv < 0.07 ? 1.0 : vv < 0.24 ? 0.86 : vv < 0.62 ? 0.64 : vv < 0.84 ? 0.4 : 0.16;
    s += (0.5 - x / 68) * 0.08;
    // soft diagonal speculars on the rear quarter and the front door
    const d1 = x - 9 - (y - 16) * 0.8;
    const d2 = x - 40 - (y - 16) * 0.8;
    if ((d1 > 0 && d1 < 1.5) || (d2 > 0 && d2 < 1)) s += 0.22;
    return pick(rp, s);
  });
  // tail fin with a stacked tail light; chrome hood ornament
  poly([[0.5, 15.5], [1, 13.6], [2.5, 13.6], [11, 14.9], [11, 15.4]], rp[3]);
  L1(1.5, 13.6, 10, 14.7, rp[4]);
  R(0.5, 14, 1.5, 5, '#e8303a');
  P1(0.5, 14.5, '#ffb0a0');
  H1(0.5, 2, 16.5, '#a82030');
  P1(60, 15, CHROME[4]);
  // two-tone sweep panel between chrome spears
  poly([[23, 20.5], [27, 19.5], [63, 19.5], [63, 21], [23, 21]], rp2[2]);
  H1(27, 63, 19.5, rp2[4]);
  L1(23, 20.3, 27, 19.2, CHROME[3]);
  H1(27, 63.5, 19, CHROME[3]);
  H1(23, 63.5, 21, CHROME[1]);
  P1(44, 19, CHROME[4]);
  P1(44.5, 19, CHROME[4]);
  // panel lines: doors, hood, trunk lid; chrome handles and a keyhole
  V1(34.5, 15.5, 27.5, rp[0]);
  V1(19.5, 15.5, 26.5, rp[0]);
  V1(50, 15.5, 26.5, rp[0]);
  H1(51, 65, 16.2, rp[1]);
  H1(2, 17, 16, rp[1]);
  R(30, 17.5, 2.5, 0.5, CHROME[3]);
  R(45.5, 17.5, 2.5, 0.5, CHROME[3]);
  P1(6, 17, AK);
  // front wheel in an open arch; rear wheel half hidden by a fender skirt
  ell(53, 28, 6.8, 6.5, rp[0]);
  ell(53, 28, 6.2, 6, '#3a3048');
  wheelF(53, 28);
  ell(15, 28, 6.4, 6, '#3a3048');
  wheelF(15, 28);
  R(7.5, 21.5, 15, 6, carSkirtPaint(c));
  H1(8, 22.5, 27.5, CHROME[2]);
  H1(8, 22.5, 27, CHROME[4]);
  // rocker shade under the doors
  R(22.5, 27, 23.5, 1.6, rp[0]);
  R(61, 27, 6.5, 1.6, rp[0]);
  // ---- nose: round headlight in a chrome hood, grille, bumper with bullets
  ell(65.8, 18, 1.9, 1.9, CHROME[2]);
  ell(66, 18.2, 1.3, 1.3, '#fff4c0');
  P1(65.5, 17.5, '#ffffff');
  L1(64, 16.3, 67, 16.3, rp[4]);
  R(64.5, 21, 3.5, 3.5, CHROME[0]);
  for (let y = 21.5; y < 24.5; y += 1) H1(64.5, 68, y, CHROME[3]);
  RR(60, 24.5, 8.5, 3.5, 1, chromeBar(24.5, 3.5));
  ell(64, 25.5, 1, 0.9, CHROME[4]);
  // ---- tail: bumper and the licence plate
  RR(-0.5, 24, 7, 3.5, 1, chromeBar(24, 3.5));
  R(1, 20.5, 4, 2.5, '#f6eed8');
  H1(1, 5, 20.5, '#3a4a9a');
  for (let k = 0; k < 4; k++) P1(1.5 + k * 0.75, 21.5, '#3a4a9a');
  P1(1, 22.5, '#d8434b');
  // road grime and a rust bubble on the rocker
  R(22, 26, 40, 2, (_x, _y, o) => (o && fd(4) ? mixc(o, '#7a6a5a', 0.3) : o));
  P1(27, 26.5, '#a8603a');
  P1(27.5, 27, '#c87a4a');
}
/** Chrome bar shaded top-to-bottom. */
function chromeBar(y: number, h: number): Paint {
  return () => {
    const u = (fy() - y) / h;
    return CHROME[u < 0.2 ? 4 : u < 0.45 ? 3 : u < 0.7 ? 2 : u < 0.88 ? 1 : 0];
  };
}
function carSkirtPaint(c: Color): Paint {
  const rp = ramp(c);
  return () => {
    const y = fy();
    const s = y < 22.5 ? 0.62 : y < 25 ? 0.5 : 0.32;
    return pick(rp, s + (fh(9, 3, 1) - 0.5) * 0.04);
  };
}
prop('car', {
  w: 68,
  h: 34,
  draw: drawCar,
  vkey: (p) => String(vnum(p, 4)),
  solid: { x: -32, y: -12, w: 64, h: 10 },
  shadow: (ox, oy) => {
    shadowF(ox + 36, oy + 32, 34, 4);
    R(ox + 8, oy + 29, 54, 3, SH1);
  },
  pad: [0, 0, 5, 4],
});
prop('pickup', {
  w: 72,
  h: 36,
  draw: () => {
    const c = '#4f9a92';
    const rp = ramp(c);
    // ---- the bed with a stack of folding chairs (ACW's ring crew truck)
    R(1, 15, 34, 14, carSidePaint(c, 15, 29));
    R(1, 13, 34, 2, rp[3]);
    H1(1, 35, 13, rp[4]);
    // folding chairs leaning in the bed
    for (let i = 0; i < 4; i++) {
      const x = 5 + i * 2;
      const y = 6 + i * 1.5;
      poly([[x, y + 7], [x + 1.5, y], [x + 18, y + 1], [x + 17, y + 7]], i % 2 ? '#c8c2da' : '#aaa2c2');
      L1(x + 1.5, y, x + 18, y + 1, '#eeeaf6');
      L1(x + 3, y + 1, x + 2, y + 6.5, '#8a84a0');
    }
    R(1, 13, 34, 2, rp[3]);
    H1(1, 35, 13, rp[4]);
    // stake pockets, rope tie, ACW sticker, rust
    for (const sx of [3, 18, 32]) R(sx, 15, 1.5, 3, rp[1]);
    L1(4, 13, 8, 15, '#e8d8a0');
    R(12, 18, 9, 4, '#fbf0e4');
    H1(12, 21, 18, '#ffffff');
    T('ACW', 12.5, 17.5, '#d8434b', FT, {});
    R(1, 15, 34, 14, (_x, _y, o) => (o && fh(201, 2, 2) < 0.05 ? '#c86a3a' : o));
    ell(6, 25.5, 2, 1.2, '#a85a3a');
    P1(5.5, 25, '#d88a5a');
    // ---- cab with a rounded roof and big glass
    RR(35, 4, 19, 25, 3, carSidePaint(c, 4, 29));
    R(36, 3, 16, 2, rp[3]);
    H1(37, 51, 3, rp[4]);
    glassF(38, 6, 12, 8, '#7aa8c8', () => {
      R(40, 10, 4, 4, '#4a3a5a');
      ell(48, 10, 1.4, 1.8, '#3a3048');
      // a pine tree air freshener
      poly([[45, 7.5], [46, 10], [44, 10]], '#4f9a5a');
    }, 0.9);
    R(36.5, 5.5, 1.5, 9, rp[2]);
    V1(35.5, 15, 28, rp[0]);
    H1(36, 53, 15, rp[1]);
    R(39, 17, 3, 0.5, CHROME[3]);
    // side mirror
    R(52.5, 8, 2, 2, CHROME[2]);
    P1(52.5, 8, CHROME[4]);
    // ---- hood and front fender
    RR(52, 13, 19, 16, 3, carSidePaint(c, 13, 29));
    R(53, 12.5, 17, 1.5, rp[3]);
    H1(54, 70, 12.5, rp[4]);
    H1(54, 70, 14.5, rp[1]);
    ell(69.5, 17, 1.6, 1.6, CHROME[2]);
    ell(69.5, 17, 1.1, 1.1, '#fff4c0');
    P1(69, 16.5, '#ffffff');
    R(68, 20, 4, 5, CHROME[1]);
    for (let y = 20.5; y < 25; y += 1) H1(68, 72, y, CHROME[3]);
    RR(66, 25, 6.5, 3, 1, CHROME[2]);
    H1(66.5, 72, 25, CHROME[4]);
    // rear bumper, plate, tail light
    R(0, 25, 3, 3, CHROME[2]);
    H1(0, 3, 25, CHROME[4]);
    R(1, 16, 1.5, 3, '#e8303a');
    // fender arches + wheels
    ell(13, 30, 7, 6.5, rp[0]);
    ell(59, 30, 7, 6.5, rp[0]);
    R(5, 30, 62, 6, 0);
    R(1, 28, 70, 1.5, rp[0]);
    // running board
    R(20, 28.5, 32, 1.5, CHROME[1]);
    H1(20, 52, 28.5, CHROME[3]);
    wheelF(13, 30, 5.8);
    wheelF(59, 30, 5.8);
    ell(64, 22, 1.4, 1, '#c86a3a');
  },
  solid: { x: -34, y: -13, w: 68, h: 11 },
  shadow: (ox, oy) => {
    shadowF(ox + 38, oy + 34, 36, 4);
    R(ox + 6, oy + 31, 62, 3, SH1);
  },
  pad: [0, 0, 5, 4],
});

// =====================================================================
//  Clutter and nature
// =====================================================================
prop('barrel', {
  w: 14,
  h: 17,
  draw: () => {
    // bellied staves, iron hoops with rivets, a dark open top
    R(1, 0.5, 12, 16.5, () => {
      const u = (fx() - 1) / 12;
      const stave = Math.floor((fx() - 1) / 2);
      let s = u < 0.18 ? 0.95 : u < 0.5 ? 0.66 : u < 0.8 ? 0.4 : 0.18;
      s += (hash2(stave, Math.floor(FY / 5), 211) - 0.5) * 0.2;
      if ((fx() - 1) % 2 < 0.5) s -= 0.25;
      return pick(ramp('#a8704f'), s);
    });
    // belly: widen the middle by a fine pixel each side
    R(0.5, 4, 0.5, 9, '#c88a5a');
    R(13, 4, 0.5, 9, '#7a4a3a');
    for (const y of [2.5, 13.5]) {
      R(0.5, y, 13, 1.5, cylPaint(0.5, 13, '#6a6488'));
      for (const bx of [3, 7, 11]) bolt(bx, y + 0.5, '#9a94b8');
    }
    ell(7, 1.2, 5.5, 1.3, '#c88a5a');
    ell(7, 1.4, 4.5, 0.9, '#3a2a30');
    ell(6, 1.2, 1.5, 0.4, '#5a8ab0');
  },
  solid: { x: -6, y: -6, w: 12, h: 6 },
  shadow: (ox, oy) => shadowF(ox + 10, oy + 16, 7, 2),
});
prop('crate', {
  w: 16,
  h: 16,
  draw: () => {
    // slatted crate: top boards, front slats, corner posts, stencil, a nail
    R(0, 0, 16, 4, woodPaint('#e0a874', 221));
    H1(0, 16, 0, '#f4c890');
    for (let y = 4; y < 16; y += 3) {
      R(1, y, 14, 2.5, woodPaint('#c88a5a', 222 + y));
      H1(1, 15, y, '#e0a874');
      H1(1, 15, y + 2.5, '#6e4438');
    }
    R(0, 4, 2, 12, woodPaintV('#a8704f', 226));
    R(14, 4, 2, 12, woodPaintV('#8a5a44', 227));
    V1(0, 4, 16, '#d8a070');
    L1(2, 5, 13.5, 15, '#a8704f');
    T('ACW', 3.5, 6.5, '#6e4438', FT, {});
    for (const [bx, by] of [[1, 5], [14.5, 5], [1, 14.5], [14.5, 14.5]]) bolt(bx, by, '#9a94a8');
  },
  solid: { x: -8, y: -8, w: 16, h: 8 },
  shadow: (ox, oy) => R(ox + 2, oy + 16, 16, 2, () => (fd(10) ? SH1 : SH2)),
});
prop('tire', {
  w: 15,
  h: 10,
  draw: () => {
    ell(7.5, 5, 7.5, 5, '#3a3048');
    ell(7.5, 4.6, 7, 4.4, '#4a4060');
    for (let a = 0; a < TAU; a += TAU / 22) {
      P1(7.5 + Math.cos(a) * 6.5, 5 + Math.sin(a) * 4.2, AK);
      P1(7.5 + Math.cos(a + 0.12) * 6, 5 + Math.sin(a + 0.12) * 3.9, '#5a4a6a');
    }
    ell(7.5, 5, 3.5, 2, '#6a5a6a');
    ell(7.5, 4.6, 3.2, 1.6, '#2b2140');
    L1(3, 2, 7, 1, '#7a6a88');
    P1(4, 1.5, '#9a8aa8');
  },
  solid: { x: -6, y: -5, w: 12, h: 5 },
  shadow: (ox, oy) => shadowF(ox + 9, oy + 9.5, 6.5, 1.6),
});
prop('rock', {
  w: 16,
  h: 12,
  vkey: (p) => String(vnum(p, 3)),
  draw: (p) => {
    const v = vnum(p, 3);
    const [rx, ry] = v === 0 ? [6, 4.5] : v === 1 ? [7.5, 5.5] : [4, 3];
    const cy = 12 - ry;
    const rp = ramp('#8a82a0');
    ell(8, cy, rx, ry, () => {
      const dx = (fx() - 8) / rx;
      const dy = (fy() - cy) / ry;
      // faceted: quantised light direction plus speckle
      let s = 0.55 - dx * 0.4 - dy * 0.5 + (fh(231 + v, 2, 2) - 0.5) * 0.3;
      if (fh(233 + v) < 0.06) s += 0.3;
      return pick(rp, s);
    });
    L1(8 - rx * 0.3, cy - ry * 0.2, 8 + rx * 0.2, cy + ry * 0.5, rp[0]);
    if (v === 1) {
      // moss and lichen
      ell(10, cy - ry * 0.6, 2.5, 1, '#6a9a58');
      P1(9, cy - ry * 0.75, '#8ab868');
      P1(5, cy, '#d8c890');
      P1(5.5, cy + 0.5, '#d8c890');
    }
    tuftsF(8 - rx, 8 + rx, 11.5, 235 + v, 0.25);
  },
  solid: { x: -6, y: -5, w: 12, h: 5 },
  shadow: (ox, oy) => shadowF(ox + 10, oy + 11, 6.5, 1.6),
});
prop('log', {
  w: 24,
  h: 10,
  draw: () => {
    R(3, 1, 18, 8, () => {
      const v = (fy() - 1) / 8;
      let s = v < 0.15 ? 0.9 : v < 0.5 ? 0.62 : v < 0.8 ? 0.38 : 0.16;
      if (fh(241, 4, 1) < 0.25) s -= 0.22;
      return pick(ramp('#8a5a44'), s);
    });
    // bark plates
    for (let x = 5; x < 20; x += 3.5) L1(x, 3 + (x % 2), x + 2, 3 + (x % 2), '#5e3a3a');
    // cut end with growth rings and a crack
    ell(3, 5, 3, 4, '#c8a070');
    for (const k of [0.75, 0.5, 0.25]) ell(3, 5, 3 * k, 4 * k, k === 0.5 ? '#c8a070' : '#e0bc88');
    L1(3, 5, 4.5, 2, '#8a5a44');
    ell(21, 5, 2, 4, '#6e4438');
    // moss and a toadstool
    ell(12, 1.2, 3, 0.8, '#5a8a4a');
    P1(11, 0.5, '#8ab868');
    V1(17, 0, 1.5, '#f2eade');
    ell(17, 0, 1.2, 0.6, '#d8434b');
    P1(16.5, -0.5, '#ffffff');
  },
  solid: { x: -11, y: -6, w: 22, h: 6 },
  shadow: (ox, oy) => R(ox + 3, oy + 10, 22, 1, () => (fd(10) ? SH1 : SH2)),
});
function reeds(f: number): void {
  const stalks: [number, number][] = [[3, 3], [6, 0], [9, 2], [12, 5], [14, 4]];
  stalks.forEach(([x, top], i) => {
    const sw = (i + f) % 4 === 0 ? 1 : (i + f) % 4 === 2 ? 0.5 : 0;
    L1(x, 15.5, x + sw, top + 4, i % 2 ? '#5a8a4a' : '#6f9a5a');
    L1(x + 0.5, 15.5, x + sw + 0.5, top + 5, '#4a7a4a');
    if (i % 2 === 0) {
      // cattail head
      RR(x + sw - 0.5, top, 2, 4.5, 1, '#8a5a44');
      V1(x + sw - 0.5, top + 0.5, top + 4, '#a8704f');
      V1(x + sw, top - 1, top, '#6f9a5a');
    }
  });
  L1(1, 15.5, 4, 8, '#7aa858');
  L1(15, 15.5, 12, 9, '#7aa858');
  L1(8, 15.5, 7, 10, '#8ab868');
}
prop('reeds', {
  w: 16,
  h: 16,
  draw: () => reeds(0),
  solid: null,
  anims: [{ fps: 2, frames: 4, rect: [0, 0, 16, 16], skip: (f) => f === 0, draw: (f) => reeds(f) }],
});
prop('lilypad', {
  w: 14,
  h: 8,
  flat: true,
  outline: false,
  vkey: (p) => String(vnum(p, 2)),
  draw: (p) => {
    ell(7, 4, 7, 3.6, '#3f7a52');
    ell(6.5, 3.6, 6, 3, () => (fh(251, 2, 1) < 0.15 ? '#6aaa62' : '#5a9a58'));
    // the notch
    poly([[7, 4], [13.5, 1.5], [14, 4]], 0);
    for (let a = -2.4; a < 0.5; a += 0.5) L1(7, 4, 7 + Math.cos(a) * 5, 4 + Math.sin(a) * 2.5, '#7ab868');
    if (vnum(p, 2) === 1) {
      ell(5, 3, 2, 1.5, '#ffd0de');
      for (const [dx, dy] of [[-1.5, 0], [1.5, 0], [0, -1]]) P1(5 + dx, 3 + dy, '#fff4f8');
      P1(5, 3, '#ffe070');
    }
  },
  shadow: null,
  solid: null,
});
prop('poster-board', {
  w: 20,
  h: 28,
  draw: () => {
    R(9, 16, 2, 12, woodPaintV('#7a4a3a', 261));
    V1(9, 16, 28, '#a8704f');
    RR(0, 0, 20, 18, 1, '#8a5a44');
    // cork
    R(1, 1, 18, 16, () => (fh(262) < 0.15 ? '#b8824a' : fh(263) < 0.08 ? '#dca870' : '#c8925a'));
    // flyers: ACW show, lost cat, bake sale, a torn tab sheet
    R(2, 2, 8, 9, '#fbefd8');
    R(2, 2, 8, 3, '#3f8a86');
    H1(2.5, 9.5, 3, '#ffd050');
    circ(6, 7, 1.5, '#5e2f58');
    H1(3, 9, 9.5, '#8a7a8a');
    R(11, 3, 7, 6, '#fff6ee');
    T('?', 13, 3, '#d8434b', FT, {});
    ell(14.5, 7.5, 1.5, 1, '#a8a0b0');
    R(4, 12, 9, 4, '#ff94b4');
    H1(5, 12, 13, '#c8307a');
    H1(5, 11, 14.5, '#ffffff');
    R(14, 10, 4, 6, '#f6e2a0');
    for (let x = 14; x < 18; x += 1) V1(x + 0.5, 14, 16, '#c8b070');
    for (const [px, py] of [[6, 2], [14, 3], [8, 12], [16, 10]] as [number, number][]) {
      ell(px, py, 0.6, 0.6, '#e8303a');
      P1(px - 0.5, py - 0.5, '#ffb0a0');
    }
  },
  solid: { x: -3, y: -3, w: 6, h: 3 },
  shadow: (ox, oy) => shadowF(ox + 13, oy + 27.5, 6, 1.5),
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
    blitFx(ctx, dlayer(kind + '|tw|' + i + '|' + f, w, h, [sx - 4, sy - 4, 9, 9], (ox, oy) => glint(sx + ox, sy + oy, Math.max(0, f)), false, true), o);
  };
}
{
  const tw = twinkle('chair', 19, 14, [[5, 2], [14, 3], [9, 8]], 2.6);
  registerObject('chair', {
    solid: { x: -8, y: -6, w: 16, h: 6 },
    label: () => 'Pick up',
    draw(ctx, o, t) {
      if (!chairSpr) chairSpr = rotL(SP(CHAIR_STAND, CHAIR_PAL));
      const a = dart('chair', 19, 14, () => {
        DS(chairSpr!, 0, 0);
        // steel sheen on the seat and a scuff
        L1(2, 1.5, 9, 1.5, '#ffffff');
        P1(12, 9.5, '#8a84a0');
      }, { pad: [0, 0, 4, 3], shadow: (ox, oy) => R(ox + 2, oy + 13, 19, 2, () => (fd(10) ? SH1 : SH2)) });
      blit(ctx, a, o);
      tw(ctx, o, t);
    },
  });
}
function vhsSpine(x: number, y: number, c: Color, label: Color): void {
  R(x, y, 3, 6, '#2b2140');
  R(x + 0.5, y + 1, 2, 3.5, label);
  H1(x + 0.5, x + 2.5, y + 2, shA(label, 0.4));
  P(x + 2, y, c);
}
{
  const tw = twinkle('tapebin', 20, 16, [[4, 3], [15, 4]], 3.1);
  registerObject('tapebin', {
    solid: { x: -9, y: -6, w: 18, h: 6 },
    label: () => 'Dig',
    draw(ctx, o, t) {
      const a = dart('tapebin', 20, 16, () => {
        // tapes sticking up out of a milk crate
        const cs = ['#e8505a', '#3f9a92', '#f4b63f', '#9a6ad0', '#fff4dc', '#5a8ad0'];
        for (let i = 0; i < 6; i++) vhsSpine(2 + i * 3, 1 + (i % 2), cs[i], cs[(i + 2) % 6]);
        R(0, 6, 20, 10, '#d8a040');
        for (let x = 0; x < 20; x += 3) {
          V1(x, 7, 15, '#b8802a');
          R(x + 1, 8, 1.5, 1, '#a8701a');
          R(x + 1, 12, 1.5, 1, '#a8701a');
        }
        H1(0, 20, 6, '#f4c870');
        H1(0, 20, 15.5, '#8a5a2a');
        R(6, 9, 8, 4, '#fbf0e4');
        T('VHS', 6, 9, '#c8303e', FT, {});
      }, { pad: [0, 0, 4, 3], shadow: (ox, oy) => R(ox + 2, oy + 16, 20, 2, () => (fd(10) ? SH1 : SH2)) });
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
    const a = dlayer('sparkle|' + f, 8, 8, [0, 0, 9, 9], () => {
      if (size >= 0) glint(4, 4, size);
      else {
        P(4, 4, '#fff8d8');
        P1(2, 6, over('#ffe9a0', 0.6));
      }
      P1(1, 1, size === 2 ? '#fff8d8' : over('#ffe9a0', 0.4));
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
      const a = dart('card-pack', 8, 10, () => {
        // a foil trading-card pack with crimped ends and a holo sheen
        R(0, 1, 8, 8, () => ((Math.floor(FX + FY) % 5) === 0 ? '#c8a0f0' : (Math.floor(FX - FY + 40) % 7) === 0 ? '#a8e0f0' : '#8a5ac8'));
        for (let x = 0; x < 8; x += 1) {
          P1(x, 0.5, '#c8a0f0');
          P1(x + 0.5, 9, '#5a3a8a');
        }
        R(1, 3, 6, 4, '#ffd34a');
        H1(1, 7, 3, '#fff0a0');
        R(3, 4, 2, 2, '#d8434b');
        P1(3, 4, '#ff9a90');
        V1(7.5, 1, 9, '#5a3a8a');
      }, { pad: [0, 0, 2, 2], shadow: (ox, oy) => R(ox + 1, oy + 10, 8, 1, SH1) });
      blit(ctx, a, o);
      tw(ctx, o, t);
    },
  });
}
