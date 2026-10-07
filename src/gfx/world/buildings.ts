/**
 * Exterior buildings and big set pieces (Golden Hour Storybook).
 *
 * Every building is drawn once into a cached canvas with the pixel kit
 * (hue-shifted shading, selective outlines, mockup lettering), with a soft
 * plum cast shadow baked into transparent padding. Animated bits (neon
 * flicker, string lights, ON AIR, flags, the Ferris wheel) are small cached
 * overlay frames picked by time, so draw() is only a couple of drawImage calls.
 *
 * Also exports the shared material helpers used by props.ts.
 */
import { noteCaster } from '../../world/atmosphere';
import { registerObject } from '../../world/registry';
import type { MapObject, ObjectKind } from '../../world/types';
import {
  AK, HL, L, OUT, P, R, RR, RRB, VG, VL, box, circ, clip, col, curve, dth, ell, hash2, liA, mixc, mkSpr, noclip, poly, rng, selA, shA, toCanvas,
  type Color, type Spr,
} from '../kit';
import { FM, FT, T, TC, TW } from '../font';

// =====================================================================
//  Cached art
// =====================================================================
export interface Art {
  cv: HTMLCanvasElement;
  /** Offset from the anchor (bottom-centre) to the canvas top-left. */
  dx: number;
  dy: number;
}
type OutFn = (c: number, side: 'lit' | 'dark', x: number, y: number) => Color;
const ART = new Map<string, Art>();
/**
 * Build (once) a sprite whose footprint is w x h with the anchor at its
 * bottom-centre. draw() paints in local coords (0,0 = top-left of footprint).
 * pad = [left, top, right, bottom] extra transparent room for shadows;
 * shadow(ox, oy) paints the cast shadow with the footprint origin at (ox, oy).
 */
export function art(
  key: string,
  w: number,
  h: number,
  draw: () => void,
  o: { outline?: boolean; out?: OutFn; shadow?: (ox: number, oy: number) => void; pad?: [number, number, number, number] } = {},
): Art {
  const hit = ART.get(key);
  if (hit) return hit;
  const ol = o.outline === false ? 0 : 1;
  const [pl, pt, pr, pb] = o.pad ?? [0, 0, 0, 0];
  let body = mkSpr(w, h, draw);
  if (ol) body = OUT(body, o.out ?? selA);
  const W = body.w + pl + pr;
  const H = body.h + pt + pb;
  const full = mkSpr(W, H, () => {
    if (o.shadow) o.shadow(pl + ol, pt + ol);
  });
  for (let y = 0; y < body.h; y++)
    for (let x = 0; x < body.w; x++) {
      const c = body.d[y * body.w + x];
      if (c) full.d[(y + pt) * W + x + pl] = c;
    }
  const a: Art = { cv: toCanvas(full), dx: -Math.floor(w / 2) - ol - pl, dy: -h - ol - pt };
  ART.set(key, a);
  return a;
}
/**
 * A cached overlay positioned in its parent's local coords. By default draw()
 * paints in the parent's coords and the result is cropped to rect; with
 * rel = true the buffer is rect-sized and draw(ox, oy) must add the offset
 * (use this for things outside the footprint, like chimney smoke).
 */
export function layer(key: string, w: number, h: number, rect: [number, number, number, number], draw: (ox: number, oy: number) => void, outline = false, rel = false): Art {
  const hit = ART.get(key);
  if (hit) return hit;
  const [rx, ry, rw, rh] = rect;
  let crop: Spr;
  if (rel) crop = mkSpr(rw, rh, () => draw(-rx, -ry));
  else {
    const s = mkSpr(w, h, () => draw(0, 0));
    crop = { w: rw, h: rh, d: new Uint32Array(rw * rh) };
    for (let y = 0; y < rh; y++)
      for (let x = 0; x < rw; x++) {
        const sx = x + rx;
        const sy = y + ry;
        if (sx >= 0 && sy >= 0 && sx < s.w && sy < s.h) crop.d[y * rw + x] = s.d[sy * s.w + sx];
      }
  }
  if (outline) crop = OUT(crop, selA);
  const a: Art = { cv: toCanvas(crop), dx: -Math.floor(w / 2) + rx - (outline ? 1 : 0), dy: -h + ry - (outline ? 1 : 0) };
  ART.set(key, a);
  return a;
}
export function blit(ctx: CanvasRenderingContext2D, a: Art, o: MapObject, ox = 0, oy = 0): void {
  const x = Math.round(o.x) + a.dx + ox;
  const y = Math.round(o.y) + a.dy + oy;
  ctx.drawImage(a.cv, x, y);
  noteCaster(a.cv, x, y);
}
/** Blit an animation overlay (never casts a sun shadow). */
export function blitFx(ctx: CanvasRenderingContext2D, a: Art, o: MapObject, ox = 0, oy = 0): void {
  ctx.drawImage(a.cv, Math.round(o.x) + a.dx + ox, Math.round(o.y) + a.dy + oy);
}

// shadows: soft translucent plum, never black --------------------------
const shc = (a: number) => ((((Math.round(a * 255) & 255) << 24) | (0x52 << 16) | (0x28 << 8) | 0x3a) >>> 0);
export const SH1 = shc(0.36);
export const SH2 = shc(0.2);
export const SH3 = shc(0.5);
/** Soft elliptical ground shadow with a dithered rim. */
export function shadowEll(cx: number, cy: number, rx: number, ry: number): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      if (d < 0.55) P(x, y, SH1);
      else if (dth(x, y, 8)) P(x, y, SH2);
    }
}
/** Building cast shadow: a band down the right side plus a contact line along the base. */
export function bShadow(ox: number, oy: number, w: number, h: number, top: number, depth = 7): void {
  poly([[ox + w, oy + top], [ox + w + depth, oy + top + depth], [ox + w + depth, oy + h + 2], [ox + w, oy + h + 2]], SH1);
  for (let y = oy + top + depth; y < oy + h + 2; y++) if (dth(ox + w + depth, y, 8)) P(ox + w + depth, y, SH2);
  R(ox + 1, oy + h, w, 2, SH1);
  for (let x = ox + 1; x < ox + w + depth; x++) if (dth(x, oy + h + 2, 8)) P(x, oy + h + 2, SH2);
}

// =====================================================================
//  Materials (ported from the art-direction mockup)
// =====================================================================
const mix = (a: Color, b: Color, t: number) => mixc(a, b, t);
const over = (c: Color, a: number) => (_x: number, _y: number, o: number) => mixc(o, c, a);
const darken = (k: number) => (_x: number, _y: number, o: number) => (o ? shA(o, k) : null);
const lighten = (k: number) => (_x: number, _y: number, o: number) => (o ? liA(o, k) : null);
export { darken, lighten, over };

/** Horizontal lap siding with weathering and nail heads. */
export function clap(x: number, y: number, w: number, h: number, light: Color, base: Color, shade: Color, seed: number, pitch = 4): void {
  const r = rng(seed);
  for (let yy = 0; yy < h; yy++) {
    const k = yy % pitch;
    R(x, y + yy, w, 1, k === 0 ? light : k === pitch - 1 ? shade : base);
  }
  for (let i = 0; i < (w * h) / 40; i++) {
    const px = x + Math.floor(r() * w);
    const py = y + Math.floor(r() * h);
    if ((py - y) % pitch !== pitch - 1) P(px, py, r() < 0.5 ? mix(base, light, 0.5) : mix(base, shade, 0.5));
  }
}
/** Running-bond brick with lit top-left edges. */
export function brick(x: number, y: number, w: number, h: number, b1: Color, b2: Color, mortar: Color, seed: number): void {
  const r = rng(seed);
  R(x, y, w, h, mortar);
  for (let yy = 0; yy < h; yy += 4) {
    const off = (yy / 4) % 2 ? 4 : 0;
    for (let xx = -off; xx < w; xx += 8) {
      const c = r() < 0.3 ? b2 : r() < 0.15 ? mix(b1, '#ffd3a0', 0.25) : b1;
      const bx = x + Math.max(0, xx);
      const bw = Math.min(7 + Math.min(0, xx), w - Math.max(0, xx));
      R(bx, y + yy, bw, Math.min(3, h - yy), c);
      P(bx, y + yy, mix(c, '#ffe0b0', 0.35));
    }
  }
}
/** Barn board-and-batten as a paint function. */
export function boardPaint(light: Color, base: Color, shade: Color, seed: number, pitch = 6) {
  const Lc = col(light);
  const B = col(base);
  const S = col(shade);
  const m1 = mix(base, shade, 0.45);
  const m2 = mix(base, light, 0.4);
  return (x: number, y: number) => {
    const k = ((x % pitch) + pitch) % pitch;
    let c = k === 0 ? Lc : k === pitch - 1 ? S : B;
    const n = hash2(x, y, seed);
    if (n < 0.03) c = m1;
    else if (n > 0.985) c = m2;
    return c;
  };
}
export function boards(x: number, y: number, w: number, h: number, light: Color, base: Color, shade: Color, seed: number, pitch = 6): void {
  R(x, y, w, h, boardPaint(light, base, shade, seed, pitch));
}
/** Window glass: interior painted by fn, then warm sky reflections. */
export function glass(x: number, y: number, w: number, h: number, interior: () => void): void {
  clip(x, y, w, h);
  interior();
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const s = (xx + yy * 0.8) % 46;
      if (s > 6 && s < 9) P(x + xx, y + yy, over('#fff0d0', 0.35));
      else if (s > 10 && s < 12) P(x + xx, y + yy, over('#fff0d0', 0.2));
      if (yy < 3) P(x + xx, y + yy, over('#ffd9a0', 0.3 - yy * 0.08));
    }
  noclip();
}
/** Warm lit room seen through a window (wallpaper, lamp, silhouette of furniture). */
export function roomA(x: number, y: number, w: number, h: number, wall: Color = '#e7a468', seed = 1): void {
  R(x, y, w, h, wall);
  for (let xx = x + 1; xx < x + w; xx += 3) VL(xx, y, y + h, mix(wall, '#c07a50', 0.35));
  R(x, y + Math.floor(h * 0.62), w, h, mix(wall, '#7a4a4a', 0.55));
  const r = rng(seed);
  if (w > 6 && r() < 0.8) {
    const lx = x + 2 + Math.floor(r() * (w - 4));
    VL(lx, y, y + 2, '#5a4060');
    HL(lx - 1, lx + 1, y + 3, '#fff2b0');
    P(lx, y + 4, over('#fff2b0', 0.5));
  }
}
/** Lace curtains tied back at the sides of a window. */
export function curtains(x: number, y: number, w: number, h: number, c: Color = '#fff4e6'): void {
  for (let yy = 0; yy < h; yy++) {
    const k = Math.max(1, Math.round(3 - Math.abs(yy - h * 0.55) * 0.35));
    R(x, y + yy, k, 1, c);
    R(x + w - k, y + yy, k, 1, shA(c, 0.12));
  }
  HL(x, x + w - 1, y, c);
}
/** Flower box with leaves and blooms (seeded). */
export function flowerBox(x: number, y: number, w: number, seed: number, box1: Color = '#a8604a'): void {
  const r = rng(seed);
  R(x, y + 3, w, 4, box1);
  HL(x, x + w - 1, y + 3, liA(box1, 0.3));
  HL(x, x + w - 1, y + 6, shA(box1, 0.5));
  for (let xx = 1; xx < w - 1; xx += 2) {
    const leaf = r() < 0.5 ? '#6f9a5a' : '#4f7a5a';
    P(x + xx, y + 2, leaf);
    P(x + xx + 1, y + 1 + (r() < 0.5 ? 1 : 0), '#8ab868');
    if (r() < 0.6) {
      const fc = ['#ff8fae', '#ffe070', '#ffffff', '#e8505a', '#c08ae0'][Math.floor(r() * 5)];
      P(x + xx, y + (r() < 0.5 ? 0 : 1), fc);
      if (r() < 0.4) P(x + xx + 1, y, fc);
    }
    if (r() < 0.3) VL(x + xx, y + 7, y + 8 + Math.floor(r() * 2), '#5a8a5a');
  }
}
/** Potted plant (small). */
export function pot(x: number, y: number, c: Color = '#c8704f', leaf: Color = '#5f9a5a', bloom: Color | null = '#ff8fae'): void {
  RR(x, y + 4, 6, 4, 1, c);
  HL(x, x + 5, y + 4, liA(c, 0.3));
  ell(x + 3, y + 2, 3.5, 3, leaf);
  P(x + 1, y + 1, liA(leaf, 0.4));
  P(x + 4, y + 3, shA(leaf, 0.3));
  if (bloom) {
    P(x + 2, y, bloom);
    P(x + 4, y + 1, bloom);
  }
}
/** String of bulbs along a polyline of [x, y, sag]; f = animation frame. */
export function bulbs(pts: [number, number, number?][], f: number, seed: number, wire: Color = '#4a3550', every = 5): void {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1, sag] = pts[i + 1];
    curve(x0, y0, x1, y1, sag ?? 3, wire, (x, y, _t, k) => {
      if (k % every === 2) {
        const tw = (k + i * 3 + seed + f * 3) % 7 === 0;
        P(x, y + 1, tw ? '#fff8e0' : '#ffd77a');
        P(x, y + 2, '#ffb84a');
        P(x - 1, y + 1, over('#ffd77a', 0.35));
        P(x + 1, y + 1, over('#ffd77a', 0.35));
      }
    });
  }
}
/** Neon text: bright core and a coloured glow, drawn over what's there. */
export function neon(str: string, x: number, y: number, core: Color, glow: Color, f = FM, o: Record<string, unknown> = {}, on = true): void {
  const pts: [number, number][] = [];
  T(str, x, y, (xx: number, yy: number) => {
    pts.push([xx, yy]);
    return null;
  }, f, o);
  if (on) {
    const amt = new Map<number, number>();
    for (const [px, py] of pts)
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const d = Math.abs(dx) + Math.abs(dy);
          if (d === 0 || d > 3) continue;
          const k = (py + dy) * 4096 + px + dx;
          const a = d === 1 ? 0.6 : d === 2 ? 0.32 : 0.14;
          if ((amt.get(k) ?? 0) < a) amt.set(k, a);
        }
    for (const [k, a] of amt) P(k % 4096, Math.floor(k / 4096), over(glow, a));
    for (const [px, py] of pts) P(px, py, core);
  } else for (const [px, py] of pts) P(px, py, mix(glow, '#3b2a4f', 0.55));
}
/** Striped awning with a scalloped hem and a soft shadow underneath. */
export function awning(x: number, y: number, w: number, h: number, c1: Color, c2: Color, stripe = 4, scallop = true): void {
  for (let xx = 0; xx < w; xx++) {
    const st = Math.floor(xx / stripe) % 2;
    const c = st ? c2 : c1;
    // slight slope: lighter at the top edge
    for (let yy = 0; yy < h; yy++) P(x + xx, y + yy, yy === 0 ? liA(c, 0.45) : yy < 2 ? liA(c, 0.15) : c);
    const sc = xx % stripe;
    if (scallop) {
      if (sc > 0 && sc < stripe - 1) {
        P(x + xx, y + h, c);
        P(x + xx, y + h + 1, shA(c, 0.35));
      } else P(x + xx, y + h, shA(c, 0.35));
    }
  }
  R(x + w - 3, y + 1, 3, h - 1, darken(0.18));
  for (let xx = 0; xx < w; xx++) for (let yy = h + 2; yy < h + 5; yy++) P(x + xx, y + yy, (X: number, Y: number, o: number) => (o && dth(X, Y, 14 - (yy - h - 2) * 4) ? shA(o, 0.3) : o));
}
/** Shingle roof rows (lit from the top-left). */
export function shingles(x: number, y: number, w: number, h: number, base: Color, seed: number, rowH = 3, tab = 5): void {
  const r = rng(seed);
  for (let yy = 0; yy < h; yy += rowH) {
    const off = (yy / rowH) % 2 ? Math.floor(tab / 2) : 0;
    const shade = yy / h;
    const c0 = mix(liA(base, 0.18), shA(base, 0.25), shade);
    R(x, y + yy, w, rowH, c0);
    HL(x, x + w - 1, y + yy + rowH - 1, shA(c0, 0.35));
    for (let xx = -off; xx < w; xx += tab) {
      VL(x + xx, y + yy, y + yy + rowH - 1, shA(c0, 0.3));
      if (r() < 0.25) R(x + xx + 1, y + yy, Math.min(tab - 1, x + w - (x + xx + 1)), rowH - 1, r() < 0.5 ? liA(c0, 0.12) : shA(c0, 0.1));
      P(x + xx + 1, y + yy, liA(c0, 0.3));
    }
  }
}
/** Flat tar-and-gravel roof seen from above, with a few rooftop odds and ends. */
export function flatRoof(x: number, y: number, w: number, h: number, seed: number, base: Color = '#8c7c9a'): void {
  R(x, y, w, h, (X: number, Y: number) => {
    const n = hash2(X, Y, seed);
    return n < 0.08 ? liA(base, 0.18) : n > 0.93 ? shA(base, 0.15) : base;
  });
  HL(x, x + w - 1, y, liA(base, 0.3));
}
/** Rooftop vent stack. */
export function vent(x: number, y: number): void {
  R(x, y, 4, 5, '#b8b4c8');
  HL(x, x + 3, y, '#e8e4f0');
  VL(x + 3, y + 1, y + 4, '#8a84a0');
  R(x - 1, y - 1, 6, 1, '#6e688e');
}
/** Brick chimney with a cap. */
export function chimney(x: number, y: number, h: number, c: Color = '#b45a4c'): void {
  brick(x, y + 2, 7, h - 2, c, shA(c, 0.15), shA(c, 0.4), x * 7 + y);
  R(x - 1, y, 9, 2, '#6e5a6a');
  HL(x - 1, x + 7, y, '#9a8a9a');
  VL(x + 6, y + 2, y + h - 1, darken(0.25));
}
/** Smoke puff frame (for chimney overlays). */
export function puff(x: number, y: number, f: number): void {
  const k = f % 4;
  const cs = ['#efe6ee', '#ddd2e2', '#c8bed6'];
  ell(x + k * 0.5, y - k * 2, 2 + k * 0.4, 1.6 + k * 0.3, cs[0]);
  ell(x + 2 + k * 0.7, y - 5 - k * 2, 1.8 + k * 0.3, 1.4, cs[1]);
  if (k > 1) ell(x + 4 + k, y - 9 - k, 1.4, 1.2, cs[2]);
}
/** Painted sign board. */
export function signBoard(x: number, y: number, w: number, h: number, border: Color, fill: Color): void {
  RRB(x, y, w, h, 2, border, fill);
  HL(x + 2, x + w - 3, y + 1, liA(fill, 0.5));
  HL(x + 2, x + w - 3, y + h - 2, shA(fill, 0.08));
}
/** Simple framed window with sill (optionally shutters/curtains/flower box). */
export function windowA(
  x: number,
  y: number,
  w: number,
  h: number,
  o: { frame?: Color; wall?: Color; shutters?: Color; curtains?: Color | null; box?: number; mullion?: boolean; seed?: number; sill?: Color } = {},
): void {
  const fr = o.frame ?? '#fbefd8';
  R(x - 1, y - 1, w + 2, h + 2, fr);
  HL(x - 1, x + w, y - 1, liA(fr, 0.5));
  glass(x, y, w, h, () => {
    roomA(x, y, w, h, o.wall ?? '#e7a468', o.seed ?? x * 3 + y);
    if (o.curtains !== null) curtains(x, y, w, h, o.curtains ?? '#fff4e6');
  });
  if (o.mullion !== false) {
    VL(x + Math.floor(w / 2), y, y + h - 1, fr);
    if (h > 7) HL(x, x + w - 1, y + Math.floor(h / 2), fr);
  }
  const sill = o.sill ?? shA(fr, 0.15);
  R(x - 2, y + h + 1, w + 4, 1, sill);
  HL(x - 2, x + w + 1, y + h + 2, darken(0.3));
  if (o.shutters) {
    for (const sx of [x - 4, x + w + 1]) {
      R(sx, y - 1, 3, h + 2, o.shutters);
      for (let yy = y; yy < y + h; yy += 2) HL(sx, sx + 2, yy, shA(o.shutters, 0.25));
      VL(sx, y - 1, y + h, liA(o.shutters, 0.3));
    }
  }
  if (o.box !== undefined) flowerBox(x - 2, y + h + 1, w + 4, o.box);
}
/** Panel door with knob, optional glass and step. */
export function doorA(x: number, y: number, w: number, h: number, c: Color, o: { glass?: boolean; frame?: Color; step?: boolean; knob?: Color; wreath?: boolean } = {}): void {
  const fr = o.frame ?? '#fbefd8';
  R(x - 1, y - 1, w + 2, h + 1, fr);
  R(x, y, w, h, c);
  VL(x, y, y + h - 1, liA(c, 0.3));
  VL(x + w - 1, y, y + h - 1, shA(c, 0.35));
  if (o.glass) {
    glass(x + 2, y + 2, w - 4, Math.floor(h * 0.38), () => roomA(x + 2, y + 2, w - 4, Math.floor(h * 0.38), '#e7a468', x));
    box(x + 2, y + Math.floor(h * 0.5), w - 4, Math.floor(h * 0.4), shA(c, 0.25));
  } else {
    box(x + 2, y + 2, w - 4, Math.floor(h * 0.4), shA(c, 0.25));
    box(x + 2, y + Math.floor(h * 0.5), w - 4, Math.floor(h * 0.4), shA(c, 0.25));
  }
  R(x + w - 3, y + Math.floor(h * 0.55), 2, 2, o.knob ?? '#f2c050');
  if (o.wreath) {
    circ(x + w / 2, y + 6, 3, '#4f8a5a');
    circ(x + w / 2, y + 6, 1.5, c);
    P(x + w / 2, y + 9, '#d8434b');
  }
  if (o.step !== false) {
    R(x - 3, y + h - 2, w + 6, 2, '#c8b0a8');
    HL(x - 3, x + w + 2, y + h - 2, '#e6d4cc');
  }
}
/** Stone foundation strip. */
export function foundation(x: number, y: number, w: number, h = 4, a: Color = '#b8a0b0', b: Color = '#a48ca4'): void {
  for (let xx = x; xx < x + w; xx += 5) {
    const c = ((xx / 5) | 0) % 2 ? a : b;
    R(xx, y, Math.min(5, x + w - xx), h, c);
    HL(xx, Math.min(x + w - 1, xx + 3), y, liA(c, 0.4));
    VL(Math.min(x + w - 1, xx + 4), y + 1, y + h - 1, shA(c, 0.2));
  }
}
/** Folding chair, front view, 8 wide (for shop windows). */
export function chairFront(x: number, y: number, light: Color, base: Color, dark: Color): void {
  RR(x, y, 8, 5, 1, base);
  HL(x + 1, x + 6, y, light);
  R(x + 2, y + 1, 4, 2, dark);
  HL(x + 2, x + 5, y + 3, mix(base, dark, 0.5));
  VL(x, y + 2, y + 15, base);
  VL(x + 7, y + 2, y + 15, dark);
  R(x - 1, y + 8, 10, 2, light);
  HL(x - 1, x + 8, y + 10, dark);
  L(x + 1, y + 11, x + 6, y + 15, dark);
}
/** Little folding chair icon (for sign boards). */
export function chairIcon(x: number, y: number, c: Color, c2: Color): void {
  ['.###.', '.#.#.', '.###.', '#####', '#...#', '#...#'].forEach((row, yy) => [...row].forEach((ch, xx) => {
    if (ch === '#') P(x + xx, y + yy, yy === 3 ? c2 : c);
  }));
}
const MASK_ROWS = [
  '.tt..............tt.', 'tpyt....yyyy....typt', 'tpyyt.yyyyyyyy.tyypt', '.tpyyyyyyyyyyyyyypt.', '..tpyyyyyyyyyyyypt..', '...pywwkyyyykwwyp...',
  '...pyykkyyyykkyyp...', '....yyyyyyyyyyyy....', '....YyyyyyyyyyyY....', '.....YyymmmmyyY.....', '......YyyyyyyY......', '.......YYYYYY.......',
];
export function stampRows(rows: string[], pal: Record<string, Color>, x: number, y: number): void {
  rows.forEach((row, yy) => [...row].forEach((ch, xx) => {
    const c = pal[ch];
    if (c !== undefined) P(x + xx, y + yy, c);
  }));
}
/** Show poster (ported from the mockup), scaled for a w x h frame. */
export function poster(x: number, y: number, w: number, h: number, kind: 'wed' | 'sat'): void {
  const wed = kind === 'wed';
  const paper = wed ? '#fbefd8' : '#ff94b4';
  R(x, y, w, h, paper);
  R(x, y, w, h, (X: number, Y: number, o: number) => (hash2(X, Y, 4) < 0.05 ? mix(o, '#c9a0a0', 0.25) : o));
  const band = Math.min(15, Math.floor(h * 0.42));
  R(x, y, w, band, wed ? '#3f8a86' : '#6e2a78');
  HL(x, x + w - 1, y + band, wed ? '#2d6a70' : '#4e1f5e');
  TC(wed ? 'WED' : 'SAT', x + w / 2, y + 1, '#fff4dc', FT, {});
  TC('NIGHT', x + w / 2, y + 7, '#ffd560', FT, { shadow: wed ? '#245a5e' : '#3e1550' });
  const cx = x + Math.floor(w / 2);
  const by = y + band + 2;
  if (wed) {
    const pl = '#5e2f58';
    const hl = '#8e4a6c';
    ell(cx, by + 9, 8, 3.5, pl);
    R(cx - 10, by + 2, 3, 6, pl);
    R(cx + 8, by + 2, 3, 6, pl);
    circ(cx - 9, by + 2, 2, pl);
    circ(cx + 10, by + 2, 2, pl);
    ell(cx - 6, by + 7, 3, 2, hl);
    ell(cx, by + 4, 3.5, 4, pl);
    ell(cx, by + 7, 3.5, 2.5, '#b89aa8');
    P(cx - 1, by + 4, '#ff5a50');
    P(cx + 1, by + 4, '#ff5a50');
  } else {
    stampRows(MASK_ROWS.filter((_r, i) => i % 1 === 0), { t: '#3ac0b0', p: '#c8307a', y: '#ffd34a', Y: '#d8962a', w: '#fff6d0', k: AK, m: '#9a2a4a' }, cx - 10, by);
  }
  // tape + curled corner + drop shadow
  R(x - 1, y - 1, 4, 2, '#f6eed8');
  R(x + w - 3, y - 1, 4, 2, '#f6eed8');
  P(x + w - 1, y + h - 1, '#d8b0a0');
  VL(x + w, y + 1, y + h, darken(0.4));
  HL(x + 1, x + w, y + h, darken(0.4));
}
/** Tiny generic wrestling poster (12-16 px) for walls and windows. */
export function miniPoster(x: number, y: number, w: number, h: number, bg: Color, ink: Color, seed: number): void {
  R(x, y, w, h, bg);
  R(x, y, w, 3, ink);
  const cx = x + Math.floor(w / 2);
  circ(cx, y + 6, 2, mix(ink, bg, 0.2));
  R(cx - 2, y + 8, 5, Math.max(1, h - 11), mix(ink, bg, 0.2));
  if (h > 12) HL(x + 1, x + w - 2, y + h - 2, ink);
  if (seed % 2) P(x + 1, y + 1, '#fff4dc');
  VL(x + w, y + 1, y + h, darken(0.35));
}

// =====================================================================
//  Building registration
// =====================================================================
export type Lt = [number, number, number, string];
export type Props = Record<string, unknown>;
export interface Anim {
  /** frames per second */
  fps: number;
  frames: number;
  rect: [number, number, number, number];
  draw: (f: number, p: Props, ox: number, oy: number) => void;
  /** buffer is rect-sized; draw gets an offset (for overlays outside the footprint) */
  rel?: boolean;
  /** optional custom frame picker (e.g. neon that only flickers now and then) */
  pick?: (t: number, o: MapObject) => number;
  /** draw nothing on this frame (saves building an empty overlay) */
  skip?: (f: number) => boolean;
  outline?: boolean;
}
export interface BDef {
  w: number;
  h: number;
  /** solid box relative to the anchor */
  solid?: { x: number; y: number; w: number; h: number } | null;
  /** fraction of the height that is solid (default 0.68) */
  solidFrac?: number;
  draw: (p: Props) => void;
  /** key from props for variants */
  vkey?: (p: Props) => string;
  shadow?: ((ox: number, oy: number, p: Props) => void) | null;
  /** shadow band top (from the top of the sprite) */
  shadowTop?: number;
  pad?: [number, number, number, number];
  anims?: Anim[];
  lights?: Lt[] | ((p: Props) => Lt[]);
  door?: number;
  label?: string;
  outline?: boolean;
  hit?: { x: number; y: number; w: number; h: number };
  flat?: boolean;
  sortY?: number;
}
const WARM = '#ffcf7a';
const LAMP = '#ffd890';

export function building(kind: string, d: BDef): void {
  const solid = d.solid === null ? undefined : d.solid ?? { x: -Math.floor(d.w / 2), y: -Math.round(d.h * (d.solidFrac ?? 0.68)), w: d.w, h: Math.round(d.h * (d.solidFrac ?? 0.68)) };
  const pad = d.pad ?? [0, 0, 10, 4];
  const k: ObjectKind = {
    solid,
    hit: d.hit,
    flat: d.flat,
    sortY: d.sortY,
    draw(ctx, o, t) {
      const p = o.props ?? {};
      const vk = d.vkey ? d.vkey(p) : '';
      const base = art(kind + '|' + vk, d.w, d.h, () => d.draw(p), {
        outline: d.outline !== false,
        pad,
        shadow: d.shadow === null ? undefined : (ox, oy) => (d.shadow ? d.shadow(ox, oy, p) : bShadow(ox, oy, d.w, d.h, d.shadowTop ?? Math.round(d.h * 0.25))),
      });
      blit(ctx, base, o);
      if (d.anims)
        d.anims.forEach((a, i) => {
          const f = a.pick ? a.pick(t, o) : Math.floor(t * a.fps + (o.x * 0.013)) % a.frames;
          if (a.skip && a.skip(f)) return;
          blitFx(ctx, layer(kind + '|' + vk + '|a' + i + '|' + f, d.w, d.h, a.rect, (ox, oy) => a.draw(f, p, ox, oy), a.outline, a.rel), o);
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
/** Ticks at 12 Hz, like the mockup. */
export const tick = (t: number) => Math.floor(t * 12);
const neonFlicker = (period: number, offs: number[]) => (t: number, o: MapObject) => (offs.includes((tick(t) + Math.floor(o.x)) % period) ? 1 : 0);

// =====================================================================
//  HOT TAG DINER  (96 x 80, door +24)
// =====================================================================
function dinerSign(on: boolean[]): void {
  // rooftop sign: HOT TAG in pink neon, DINER in teal
  RRB(10, 0, 76, 21, 3, '#5e4a72', '#3b2a4f');
  RR(12, 2, 72, 17, 2, '#33243f');
  for (let x = 14; x < 84; x += 8) {
    P(x, 3, '#6e5a82');
    P(x, 17, '#6e5a82');
  }
  const ht = 'HOT TA';
  const wx = 48 - Math.round((TW('HOT TAG', FM, { bold: true }) + 0) / 2);
  neon(ht, wx, 3, '#ffe6f2', '#ff5fa0', FM, { bold: true }, on[0]);
  neon('G', wx + TW(ht, FM, { bold: true }) + 2, 3, '#ffe6f2', '#ff5fa0', FM, { bold: true }, on[1]);
  neon('DINER', 48 - Math.round(TW('DINER', FT, { ls: 2 }) / 2), 12, '#e6fff8', '#38e0c8', FT, { ls: 2 }, on[2]);
  // neon coffee cups
  for (const cx of [15, 76]) {
    const cup = ['.###.#', '.####.', '.###..', '..#...'];
    cup.forEach((row, yy) => [...row].forEach((ch, xx) => {
      if (ch === '#') P(cx + xx, 11 + yy, on[2] ? '#ffe9a8' : '#6a5a6a');
    }));
    if (on[2]) {
      P(cx + 2, 8, over('#ffe9a8', 0.5));
      P(cx + 3, 7, over('#ffe9a8', 0.4));
    }
  }
}
function drawDiner(): void {
  const W = 96;
  const GY = 80;
  // flat roof behind the parapet, sign posts standing on it
  flatRoof(2, 14, 92, 10, 11);
  vent(80, 15);
  R(6, 16, 9, 6, '#a8a4bc');
  HL(6, 14, 16, '#d8d4e8');
  for (let x = 7; x < 14; x += 2) VL(x, 18, 20, '#7a7496');
  for (const sx of [24, 70]) {
    R(sx, 19, 3, 6, '#5a4468');
    P(sx + 1, 21, '#8a6a8a');
  }
  dinerSign([true, true, true]);
  // parapet cap
  R(0, 24, W, 3, '#f6e4c4');
  HL(0, W - 1, 24, '#fff6e2');
  HL(0, W - 1, 26, '#c9a2a2');
  // cherry band with lettering
  R(0, 27, W, 10, '#d0484f');
  HL(0, W - 1, 27, '#e8706a');
  HL(0, W - 1, 36, '#8e2c4c');
  HL(0, W - 1, 28, '#f2c0c0');
  TC('BREAKFAST ALL DAY', W / 2, 30, '#fff0dc', FT, {});
  for (const sx of [5, 90]) {
    P(sx, 32, '#ffd977');
    P(sx - 1, 32, '#ffe9b0');
    P(sx + 1, 32, '#ffe9b0');
    P(sx, 31, '#ffe9b0');
    P(sx, 33, '#ffe9b0');
  }
  // mint enamel panels
  const pT = 37;
  const pB = 70;
  R(0, pT, W, pB - pT, (x: number) => {
    const k = x % 16;
    return k === 0 ? '#cdebd5' : k === 15 ? '#7fb2a6' : '#a9d8bf';
  });
  HL(0, W - 1, pT, '#e2f6e2');
  R(W - 5, pT, 5, pB - pT, (x: number, y: number) => (dth(x, y, 8) ? '#7fb2a6' : '#94c6b4'));
  // chrome strip + cherry kickplate
  R(0, pB, W, 2, '#f2eef6');
  HL(0, W - 1, pB + 1, '#a89cc0');
  R(0, pB + 2, W, GY - pB - 2, '#c9404c');
  HL(0, W - 1, pB + 2, '#e06a64');
  for (let x = 3; x < W; x += 5) VL(x, pB + 4, GY - 2, '#a8344a');
  // big window full of booths
  const wx = 5;
  const wy = 42;
  const ww = 52;
  const wh = 22;
  R(wx - 2, wy - 2, ww + 4, wh + 4, '#efeaf4');
  HL(wx - 2, wx + ww + 1, wy - 2, '#ffffff');
  VL(wx + ww + 1, wy - 2, wy + wh + 1, '#9a8eb4');
  HL(wx - 2, wx + ww + 1, wy + wh + 1, '#8a7ea6');
  glass(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#e7a468');
    for (let x = wx; x < wx + ww; x += 4) VL(x, wy, wy + 9, '#d9955e');
    R(wx, wy + 10, ww, wh - 10, '#b45a4c');
    HL(wx, wx + ww, wy + 10, '#cf7458');
    // framed wrestler photos
    for (const fx of [wx + 9, wx + 23, wx + 37]) {
      box(fx, wy + 2, 6, 6, '#f2c050');
      R(fx + 1, wy + 3, 4, 4, '#6e5a8a');
      P(fx + 2, wy + 4, '#f2c8a0');
      R(fx + 2, wy + 5, 2, 2, '#e0505a');
    }
    // pendant lamps
    for (const lx of [wx + 3, wx + 17, wx + 31, wx + 46]) {
      VL(lx, wy, wy + 2, '#5a4060');
      RR(lx - 2, wy + 3, 5, 2, 1, '#3f8a86');
      HL(lx - 1, lx + 1, wy + 5, '#fff2b0');
      for (let k = 0; k < 5; k++) for (let dx = -k; dx <= k; dx++) P(lx + dx, wy + 6 + k, (a: number, b: number, o: number) => (dth(a, b, 6) ? mix(o, '#ffe6a0', 0.35) : o));
    }
    // booths: tall red backs, tables
    for (let i = 0; i < 3; i++) {
      const bx = wx + 1 + i * 17;
      RR(bx, wy + 9, 4, 13, 2, '#d0444f');
      VL(bx, wy + 10, wy + 21, '#ee7a72');
      VL(bx + 3, wy + 10, wy + 21, '#8e2c48');
      RR(bx + 12, wy + 9, 4, 13, 2, '#d0444f');
      VL(bx + 12, wy + 10, wy + 21, '#ee7a72');
      VL(bx + 15, wy + 10, wy + 21, '#8e2c48');
      R(bx + 4, wy + 15, 8, 2, '#fbe6cc');
      HL(bx + 4, bx + 11, wy + 17, '#c0b0c8');
      VL(bx + 8, wy + 18, wy + 21, '#9a8eb4');
    }
    // patrons: beehive lady with coffee, trucker reading the Tattler, pie
    const pp = (x: number, y: number, shirt: string) => {
      R(x, y + 5, 5, 5, shirt);
      RR(x, y, 5, 6, 2, '#f0b890');
      R(x + 3, y + 2, 2, 4, '#cf8e78');
    };
    pp(wx + 6, wy + 9, '#4f9a9a');
    RR(wx + 5, wy + 4, 7, 7, 3, '#c8b8e0');
    RR(wx + 6, wy + 7, 5, 4, 1, '#f0b890');
    P(wx + 7, wy + 8, AK);
    P(wx + 9, wy + 8, AK);
    R(wx + 11, wy + 13, 2, 2, '#fff');
    pp(wx + 22, wy + 9, '#e2a040');
    RR(wx + 21, wy + 8, 7, 2, 1, '#d84a4a');
    R(wx + 19, wy + 11, 10, 6, '#f4eee0');
    for (let k = 0; k < 3; k++) HL(wx + 20, wx + 28, wy + 13 + k * 1.5, '#a8a0b8');
    T('TT', wx + 20, wy + 11, '#4a3a5a', FT, {});
    R(wx + 42, wy + 14, 4, 2, '#f0c060');
    P(wx + 42, wy + 13, '#d04050');
    P(wx + 43, wy + 13, '#d04050');
    T('PIE', wx + 2, wy + 16, '#ffd977', FT, { ls: 1 });
    T('COFFEE', wx + 27, wy + 16, '#ffd977', FT, {});
  });
  VL(wx + 17, wy, wy + wh - 1, '#d8d2e2');
  VL(wx + 35, wy, wy + wh - 1, '#d8d2e2');
  flowerBox(wx - 2, wy + wh + 1, ww + 4, 5);
  // door with a scalloped awning (door centre at x = 72)
  const dx = 64;
  const dy = 50;
  R(dx - 2, dy - 2, 20, GY - dy + 2, '#efeaf4');
  VL(dx + 17, dy - 2, GY - 1, '#9a8eb4');
  glass(dx, dy, 16, 17, () => {
    R(dx, dy, 16, 17, '#e7a468');
    R(dx, dy + 10, 16, 7, '#b45a4c');
    RR(dx + 6, dy + 3, 5, 8, 2, '#d0444f');
  });
  R(dx, dy + 17, 16, GY - dy - 17, '#d4cbe0');
  HL(dx, dx + 15, dy + 17, '#fff');
  R(dx + 2, dy + 20, 12, 1, '#a89cc0');
  R(dx + 13, dy + 12, 2, 4, '#f2eef6');
  RR(dx + 2, dy + 2, 12, 7, 1, '#2f2440');
  neon('OPEN', dx + 2, dy + 3, '#e6fff8', '#38e0c8', FT, { sp: 0 });
  awning(dx - 4, dy - 9, 24, 5, '#d4464e', '#fff1dc', 3);
  // wall lantern, menu card, house number
  R(85, 46, 3, 2, '#4a3050');
  RR(84, 48, 5, 6, 1, '#4a3050');
  R(85, 49, 3, 3, '#ffe08a');
  P(86, 50, '#fff8e0');
  RRB(82, 56, 13, 12, 1, '#fff4dc', '#f5e6c6');
  T('ACW', 83, 57, '#c9404c', FT, { sp: 0 });
  R(85, 63, 7, 1, '#a89cc0');
  R(85, 65, 5, 1, '#a89cc0');
  RR(83, 39, 9, 6, 1, '#2f5a68');
  T('12', 84, 40, '#fff4dc', FT, { sp: 1 });
  // a chrome edge on the left corner
  VL(0, pT, pB - 1, '#f2eef6');
}
building('b-diner', {
  w: 96,
  h: 80,
  door: 24,
  draw: drawDiner,
  shadowTop: 24,
  label: 'Hot Tag Diner',
  solid: { x: -48, y: -54, w: 96, h: 54 },
  anims: [
    {
      // neon flicker: the G stutters now and then
      fps: 0,
      frames: 2,
      rect: [10, 0, 76, 21],
      pick: neonFlicker(97, [3, 4, 9, 31, 32, 34, 60]),
      skip: (f) => f === 0,
      draw: () => dinerSign([true, false, true]),
    },
    {
      fps: 3,
      frames: 4,
      rect: [0, 36, 96, 6],
      draw: (f) => bulbs([[2, 37], [32, 37, 3], [64, 37, 3], [94, 37, 3]], f, 1),
    },
  ],
  lights: [
    [31, 53, 30, WARM],
    [72, 58, 16, WARM],
    [86, 50, 12, LAMP],
    [36, 10, 26, '#ff7ab0'],
    [60, 14, 22, '#5ff2d6'],
  ],
});

// =====================================================================
//  STEEL CHAIR HARDWARE  (80 x 80, door +16)
// =====================================================================
function drawHardware(): void {
  const W = 80;
  const GY = 80;
  const ffTop = 8;
  const sideTop = 18;
  // roof behind the false front
  flatRoof(0, 12, W, 8, 21, '#7e7090');
  clap(0, sideTop, W, GY - sideTop, '#ffdd92', '#e8b45a', '#b47a4c', 21);
  clap(14, ffTop, W - 28, sideTop - ffTop, '#ffdd92', '#e8b45a', '#b47a4c', 22);
  R(W - 7, sideTop, 7, GY - sideTop, (x: number, y: number, o: number) => (dth(x, y, 6 + (x - W + 7)) ? shA(o, 0.3) : o));
  // cornice + brackets
  R(12, ffTop - 3, W - 24, 3, '#3a6f78');
  HL(12, W - 13, ffTop - 3, '#5aa39a');
  R(0, sideTop - 3, 16, 3, '#3a6f78');
  R(W - 16, sideTop - 3, 16, 3, '#3a6f78');
  HL(0, 15, sideTop - 3, '#5aa39a');
  HL(W - 16, W - 1, sideTop - 3, '#5aa39a');
  for (let x = 14; x < W - 14; x += 5) R(x, ffTop, 2, 2, '#2f5a68');
  VL(0, sideTop, GY - 1, '#5aa39a');
  VL(1, sideTop, GY - 1, '#3a6f78');
  VL(W - 2, sideTop, GY - 1, '#2f5a68');
  VL(W - 1, sideTop, GY - 1, '#24485a');
  // painted sign board
  signBoard(5, 15, 70, 18, '#2f5a68', '#fbefd4');
  TC('STEEL CHAIR', 40, 18, '#a8323e', FM, { shadow: '#e8b48a' });
  TC('HARDWARE', 40, 27, '#2f6a74', FT, { ls: 1 });
  chairIcon(8, 24, '#7a7096', '#4e4870');
  chairIcon(67, 24, '#7a7096', '#4e4870');
  // awning
  awning(3, 36, W - 6, 7, '#5f9a6a', '#fbefd4', 4);
  // display window (left)
  const wx = 6;
  const wy = 49;
  const ww = 40;
  const wh = 24;
  R(wx - 2, wy - 2, ww + 4, wh + 4, '#3a6f78');
  HL(wx - 2, wx + ww + 1, wy - 2, '#5aa39a');
  glass(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#5a4a6e');
    R(wx, wy + 16, ww, wh - 16, '#7a5a5a');
    for (let y = wy + 2; y < wy + 13; y += 3) for (let x = wx + 2; x < wx + ww - 2; x += 3) P(x, y, '#6e5e86');
    L(wx + 3, wy + 3, wx + 3, wy + 10, '#c8b8a0');
    R(wx + 1, wy + 3, 5, 2, '#b8b0c8');
    L(wx + 7, wy + 3, wx + 9, wy + 9, '#c88a5a');
    R(wx + 8, wy + 8, 3, 3, '#9a92b0');
    // fan of folding chairs
    for (let i = 0; i < 3; i++) chairFront(wx + 13 + i * 8, wy + 6 + (i === 1 ? -2 : 0), '#eeeaf6', i === 1 ? '#c8c2da' : '#aaa2c2', '#6e668a');
    const can = (x: number, y: number, c: string) => {
      R(x, y, 4, 4, c);
      HL(x, x + 3, y, '#e8e4f0');
      P(x + 1, y + 2, '#fff4e0');
    };
    can(wx + 2, wy + 19, '#e05a5a');
    can(wx + 6, wy + 19, '#4a8ad0');
    can(wx + 10, wy + 19, '#f2c050');
    can(wx + 4, wy + 15, '#6fb070');
    can(wx + 8, wy + 15, '#c070c0');
    RR(wx + 24, wy + 13, 15, 10, 1, '#fff4dc');
    T('SALE', wx + 25, wy + 14, '#c9404c', FT, { sp: 0 });
    T('$5', wx + 28, wy + 19, '#2f6a74', FT, { sp: 1 });
  });
  VL(wx + 20, wy, wy + wh - 1, '#3a6f78');
  T('CHAIRS', wx + 1, wy + 1, '#ffffff', FT, { sp: 0 });
  // door (centre x = 56)
  const dx = 48;
  const dy = 49;
  R(dx - 2, dy - 2, 20, GY - dy + 2, '#2f5a68');
  R(dx, dy, 16, GY - dy, '#4f9a92');
  VL(dx, dy, GY - 1, '#7fc0a8');
  VL(dx + 15, dy, GY - 1, '#2f6a74');
  glass(dx + 2, dy + 3, 12, 12, () => {
    R(dx + 2, dy + 3, 12, 12, '#5a4a6e');
    R(dx + 2, dy + 10, 12, 5, '#7a5a5a');
  });
  RR(dx + 1, dy + 6, 14, 7, 1, '#fff4dc');
  T('OPEN', dx + 2, dy + 7, '#a8323e', FT, { sp: 0 });
  box(dx + 2, dy + 18, 12, 9, '#3f8a86');
  R(dx + 13, dy + 16, 2, 3, '#f2c050');
  P(dx + 15, dy - 1, '#f2c050');
  R(dx + 14, dy, 3, 2, '#f2c050');
  // rakes + brooms leaning on the wall
  for (const [x, h, c] of [[70, 26, '#c88a5a'], [73, 30, '#b87a4a'], [76, 24, '#d89a6a']] as [number, number, string][]) L(x, GY - 2, x + 2, GY - h, c);
  for (let k = 0; k < 5; k++) P(69 + k, GY - 26, '#9a92b0');
  R(73, GY - 32, 4, 5, '#e8c070');
  for (let k = 0; k < 4; k++) VL(73 + k, GY - 27, GY - 26, '#c89a50');
  R(dx - 2, GY - 2, 20, 2, '#c8b0a8');
  foundation(0, GY - 3, 46, 3, '#c8a888', '#b8987c');
}
building('b-hardware', {
  w: 80,
  h: 80,
  door: 16,
  draw: drawHardware,
  shadowTop: 8,
  label: 'Steel Chair Hardware',
  solid: { x: -40, y: -58, w: 80, h: 58 },
  lights: [
    [26, 60, 26, WARM],
    [56, 58, 14, WARM],
  ],
});

// =====================================================================
//  THE SPORTATORIUM  (176 x 120, door 0, double doors 32 wide)
// =====================================================================
const SP_W = 176;
const SP_H = 120;
const SP_CX = 88;
// gambrel profile of the front facade
const SP_WALL = 70; // eave height (y)
const SP_KNEE = 47; // gambrel break
const SP_PEAK = 30;
const spOutline = (dy = 0): [number, number][] => [
  [16, SP_H],
  [16, SP_WALL + dy],
  [34, SP_KNEE + dy],
  [SP_CX, SP_PEAK + dy],
  [SP_W - 34, SP_KNEE + dy],
  [SP_W - 16, SP_WALL + dy],
  [SP_W - 16, SP_H],
];
function spRoofline(): [number, number][] {
  return [
    [19, SP_WALL + 2],
    [36, SP_KNEE + 3],
    [SP_CX, SP_PEAK + 4],
    [SP_W - 36, SP_KNEE + 3],
    [SP_W - 19, SP_WALL + 2],
  ];
}
function spBulbs(f: number): void {
  const segs = spRoofline();
  let k = 0;
  for (let i = 0; i + 1 < segs.length; i++) {
    const [ax, ay] = segs[i];
    const [bx, by] = segs[i + 1];
    const n = Math.round(Math.hypot(bx - ax, by - ay) / 6);
    for (let j = 0; j < n; j++, k++) {
      const x = Math.round(ax + ((bx - ax) * j) / n);
      const y = Math.round(ay + ((by - ay) * j) / n) + 1;
      const on = (k + f) % 3 !== 0;
      P(x, y, on ? '#fff3b0' : '#d89a6a');
      P(x, y + 1, on ? '#ffc65a' : '#a86a4a');
      if (on) {
        P(x - 1, y, over('#ffd77a', 0.45));
        P(x + 1, y, over('#ffd77a', 0.45));
        P(x, y + 2, over('#ffd77a', 0.35));
      }
    }
  }
}
function spMarquee(f: number): void {
  const sx = 40;
  const sy = 49;
  const sw = 96;
  const sh = 21;
  for (let i = 0; i < sw; i += 4) {
    const on = (i / 4 + f) % 4 < 2;
    P(sx + i + 1, sy, on ? '#fff3b0' : '#b88a5a');
    P(sx + sw - 2 - i, sy + sh - 1, on ? '#fff3b0' : '#b88a5a');
  }
}
function drawSportatorium(): void {
  const GY = SP_H;
  const cx = SP_CX;
  // --- the roof receding behind the gambrel (seen from above)
  const back = spOutline(-12);
  poly([back[1], back[2], back[3], back[4], back[5], [SP_W - 16, SP_WALL + 2], [SP_W - 34, SP_KNEE + 2], [cx, SP_PEAK + 2], [34, SP_KNEE + 2], [16, SP_WALL + 2]], '#5a4a6e');
  // standing-seam metal roof stripes (plum-teal), lit on the left slopes
  R(0, 0, SP_W, SP_WALL + 4, (x: number, _y: number, o: number) => {
    if (o !== col('#5a4a6e')) return null;
    const left = x < cx;
    const base = left ? '#6a6488' : '#4e4670';
    return x % 4 === 0 ? (left ? '#8a84a8' : '#5e5680') : x % 4 === 3 ? shA(base, 0.2) : base;
  });
  // ridge cap
  L(cx, SP_PEAK - 12, cx, SP_PEAK, '#9a94b8');
  // cupola with the masked rooster weathervane
  const cyT = SP_PEAK - 16;
  R(cx - 6, cyT + 4, 12, 9, boardPaint('#e0694f', '#c4473f', '#933248', 9, 4));
  R(cx - 4, cyT + 6, 8, 5, '#3b2a4f');
  for (let x = cx - 4; x < cx + 4; x += 2) VL(x, cyT + 6, cyT + 10, '#fbefd2');
  HL(cx - 6, cx + 5, cyT + 12, '#fbefd2');
  poly([[cx - 8, cyT + 5], [cx, cyT - 1], [cx + 8, cyT + 5]], '#4e4670');
  L(cx - 8, cyT + 5, cx, cyT - 1, '#8a84a8');
  HL(cx - 8, cx + 8, cyT + 5, '#fbefd2');
  VL(cx, cyT - 8, cyT - 1, '#4a3550');
  HL(cx - 3, cx + 3, cyT - 4, '#4a3550');
  P(cx - 4, cyT - 4, '#4a3550');
  P(cx + 4, cyT - 5, '#4a3550');
  P(cx + 4, cyT - 3, '#4a3550');
  ['..##...', '.####..', '#####.#', '.######', '..####.', '...#.#.'].forEach((row, yy) => [...row].forEach((ch, xx) => {
    if (ch === '#') P(cx - 3 + xx, cyT - 14 + yy, '#4a3550');
  }));
  P(cx - 1, cyT - 13, '#ffd34a');
  P(cx - 2, cyT - 14, '#e8505a');
  // --- lean-to wings on both sides
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 0 : SP_W - 18;
    const x1 = side < 0 ? 18 : SP_W;
    const top = 74;
    boards(x0, top + 6, 18, GY - top - 6, '#c86a52', '#a8473f', '#7e3044', 31 + side, 5);
    // shed roof
    for (let x = x0; x < x1; x++) {
      const t = side < 0 ? (x1 - x) / 18 : (x - x0) / 18;
      const y = Math.round(top + t * 4);
      VL(x, y, top + 7, x % 3 === 0 ? '#8a84a8' : '#6a6488');
      P(x, y, '#b8b2d0');
    }
    HL(x0, x1 - 1, top + 7, '#fbefd2');
  }
  // --- the gambrel facade: red board-and-batten
  poly(spOutline(), boardPaint('#e0694f', '#c4473f', '#933248', 77));
  const trim = (a: [number, number], b: [number, number]) => {
    L(a[0], a[1], b[0], b[1], '#fbefd2');
    L(a[0], a[1] + 1, b[0], b[1] + 1, '#fbefd2');
    L(a[0], a[1] + 2, b[0], b[1] + 2, '#c8a0a0');
  };
  const o = spOutline();
  trim([o[1][0] - 1, o[1][1]], o[2]);
  trim(o[2], o[3]);
  trim(o[3], o[4]);
  trim(o[4], [o[5][0] + 1, o[5][1]]);
  R(16, SP_WALL, 2, GY - SP_WALL, '#fbefd2');
  R(SP_W - 18, SP_WALL, 2, GY - SP_WALL, '#fbefd2');
  // shade the right side of the facade (sun from the left)
  R(130, 30, 30, GY - 30, (x: number, y: number, oo: number) => (oo && oo !== col('#fbefd2') && dth(x, y, Math.min(16, (x - 130) >> 1)) ? shA(oo, 0.2) : oo));
  // round hayloft window, glowing
  circ(cx, 40, 5.5, '#fbefd2');
  circ(cx, 40, 4, '#ffd277');
  circ(cx + 1, 41, 2.5, '#f2a85a');
  VL(cx, 35, 45, '#fbefd2');
  HL(cx - 4, cx + 4, 40, '#fbefd2');
  // the big painted sign
  const sx = 40;
  const sy = 49;
  const sw = 96;
  const sh = 21;
  RRB(sx, sy, sw, sh, 2, '#5b3a62', '#fbefd2');
  R(sx + 2, sy + 2, sw - 4, 1, '#fff8e6');
  R(sx + 2, sy + sh - 4, sw - 4, 2, '#f0dcc0');
  TC('SPORTATORIUM', cx, sy + 4, '#b8303e', FM, { bold: true, shadow: '#eba24a' });
  TC('EST. 1931', cx, sy + 13, '#8a5a6a', FT, { sp: 1 });
  for (const sx2 of [sx + 12, sx + sw - 15]) {
    P(sx2, sy + 15, '#e8a24a');
    P(sx2 + 2, sy + 15, '#e8a24a');
    P(sx2 + 1, sy + 14, '#e8a24a');
    P(sx2 + 1, sy + 16, '#e8a24a');
  }
  spMarquee(0);
  // hand-painted "ACW" belt plate under the sign
  RR(cx - 9, 72, 18, 7, 2, '#f4b63f');
  HL(cx - 8, cx + 7, 72, '#ffe08a');
  RR(cx - 6, 73, 12, 5, 1, '#c88a2a');
  T('ACW', cx - 5, 73, '#fff4dc', FT, { sp: 0 });
  R(cx - 16, 74, 7, 3, '#8a2c44');
  R(cx + 9, 74, 7, 3, '#8a2c44');
  // big double barn doors, slightly open with warm light inside (32 wide)
  const dw = 32;
  const dx = cx - dw / 2;
  const dy = 82;
  R(dx - 3, dy - 3, dw + 6, 2, '#4a3550');
  for (let x = dx - 2; x < dx + dw + 2; x += 5) P(x, dy - 2, '#8a7090');
  R(dx - 1, dy - 1, dw + 2, GY - dy + 1, '#fbefd2');
  for (const [ox, w] of [[0, 15], [17, 15]] as [number, number][]) {
    boards(dx + ox, dy, w, GY - dy, '#d65a48', '#b93e3e', '#8a2c44', 90 + ox, 5);
    box(dx + ox, dy, w, GY - dy, '#fbefd2');
    L(dx + ox + 1, dy + 1, dx + ox + w - 2, GY - 2, '#fbefd2');
    L(dx + ox + w - 2, dy + 1, dx + ox + 1, GY - 2, '#fbefd2');
    L(dx + ox + 2, dy + 1, dx + ox + w - 1, GY - 2, '#d8b8b0');
    R(dx + ox + (ox ? 2 : w - 4), dy + 17, 2, 4, '#4a3550');
  }
  R(dx + 15, dy, 2, GY - dy, '#ffd27a');
  VL(dx + 16, dy, GY - 1, '#fff0b8');
  for (let y = dy + 3; y < GY; y++)
    for (let k2 = 1; k2 < 4; k2++) {
      P(dx + 14 - k2, y, (a: number, b: number, oo: number) => (dth(a, b, 8 - k2 * 2) ? mix(oo, '#ffd27a', 0.5) : oo));
      P(dx + 17 + k2, y, (a: number, b: number, oo: number) => (dth(a, b, 8 - k2 * 2) ? mix(oo, '#ffd27a', 0.5) : oo));
    }
  // gooseneck lamps over the doors
  for (const lx of [dx + 4, dx + dw - 5]) {
    VL(lx, dy - 10, dy - 7, '#4a3550');
    R(lx - 2, dy - 7, 5, 2, '#3f8a86');
    HL(lx - 1, lx + 1, dy - 5, '#fff2b0');
    for (let k2 = 1; k2 < 4; k2++) for (let d = -k2; d <= k2; d++) P(lx + d, dy - 5 + k2, (a: number, b: number, oo: number) => (dth(a, b, 6 - k2) ? mix(oo, '#fff0b0', 0.35) : oo));
  }
  // show posters in frames either side of the doors
  for (const [px, kind] of [[26, 'wed'], [124, 'sat']] as [number, 'wed' | 'sat'][]) {
    R(px - 2, 78, 30, 36, '#5b3a62');
    HL(px - 2, px + 27, 78, '#7a5482');
    poster(px, 80, 26, 32, kind);
  }
  // little sign on the left lean-to: BOX OFFICE
  RRB(2, 84, 14, 9, 1, '#5b3a62', '#fbefd2');
  T('BOX', 3, 85, '#b8303e', FT, { sp: 0 });
  R(4, 95, 10, 7, '#3b2a4f');
  glass(5, 96, 8, 5, () => roomA(5, 96, 8, 5, '#e7a468', 3));
  // stacked folding chairs and a bucket by the right lean-to
  for (let i = 0; i < 4; i++) {
    R(161, 104 - i * 2, 10, 2, i % 2 ? '#c8c2da' : '#aaa2c2');
    HL(161, 170, 104 - i * 2, '#eeeaf6');
  }
  VL(162, 106, GY - 1, '#6e668a');
  VL(169, 106, GY - 1, '#6e668a');
  // stone foundation
  foundation(0, GY - 4, SP_W);
  // the bulbs (frame 0; overlay animates them)
  spBulbs(0);
}
building('b-sportatorium', {
  w: SP_W,
  h: SP_H,
  door: 0,
  draw: drawSportatorium,
  label: 'The Sportatorium',
  shadowTop: 47,
  pad: [0, 0, 12, 4],
  solid: { x: -88, y: -80, w: 176, h: 80 },
  anims: [
    { fps: 4, frames: 3, rect: [16, 30, 144, 46], draw: (f) => spBulbs(f) },
    { fps: 6, frames: 4, rect: [38, 47, 100, 25], draw: (f) => spMarquee(f) },
  ],
  lights: [
    [88, 40, 20, WARM],
    [88, 102, 34, WARM],
    [76, 76, 14, LAMP],
    [100, 76, 14, LAMP],
    [88, 58, 46, '#ffc070'],
    [36, 56, 20, '#ffd890'],
    [140, 56, 20, '#ffd890'],
  ],
});


// =====================================================================
//  Main street shopfronts
// =====================================================================
/** Terracotta barrel-tile coping along a parapet. */
function tileCoping(x: number, y: number, w: number): void {
  for (let xx = x; xx < x + w; xx += 4) {
    RR(xx, y, 4, 5, 1, '#d0694a');
    VL(xx, y + 1, y + 3, '#ee9070');
    VL(xx + 3, y + 1, y + 3, '#9a3e3e');
    P(xx + 1, y, '#f6a884');
  }
  HL(x, x + w - 1, y + 5, darken(0.35));
}
/** Papel picado: a string of little cut-paper flags. */
function papel(x0: number, y0: number, x1: number, sag: number, seed: number): void {
  const cs = ['#ff5d8f', '#2fa59a', '#f4b63f', '#9a6ad0', '#ff8a4a', '#5ab0e0'];
  let n = seed;
  curve(x0, y0, x1, y0, sag, '#fff4e6', (x, y, _t, i) => {
    if (i % 6 === 1 && x < x1 - 3) {
      const c = cs[n++ % cs.length];
      R(x, y + 1, 5, 4, c);
      P(x + 1, y + 2, over('#ffffff', 0.5));
      P(x + 3, y + 3, shA(c, 0.25));
      P(x + 1, y + 5, c);
      P(x + 3, y + 5, c);
    }
  });
}
/** Gold butterfly emblem (La Mariposa), hand-pixeled; s = pixel scale. */
const BFLY = ['##.....##', '###...###', '#o##.##o#', '####k####', '.###k###.', '..##k##..', '.#o#k#o#.', '.##...##.'];
function butterfly(cx: number, cy: number, s = 1): void {
  const pal: Record<string, string> = { '#': '#ffd34a', o: '#ff5d8f', k: '#5a2448' };
  const x0 = Math.round(cx - 4.5 * s);
  const y0 = Math.round(cy - 4 * s);
  BFLY.forEach((row, yy) => [...row].forEach((ch, xx) => {
    let c = pal[ch];
    if (!c) return;
    if (ch === '#' && (xx === 0 || yy === 0)) c = '#fff0a0';
    if (ch === '#' && (xx >= 7 || yy >= 6)) c = '#e8a030';
    R(x0 + xx * s, y0 + yy * s, s, s, c);
  }));
  P(x0 + 3 * s, y0 - 1, '#5a2448');
  P(x0 + 5 * s, y0 - 1, '#5a2448');
}
function drawTaqueria(): void {
  const W = 80;
  const GY = 72;
  flatRoof(0, 4, W, 8, 31);
  vent(66, 5);
  // gold butterfly standing on the roof edge
  R(39, 9, 2, 3, '#5a4468');
  butterfly(40, 5, 1);
  tileCoping(0, 10, W);
  // warm stucco with teal + pink trim
  R(0, 16, W, GY - 16, (x: number, y: number) => {
    const n = hash2(x, y, 33);
    return n < 0.06 ? '#fbe2c4' : n > 0.95 ? '#e8bf9c' : '#f6d4b0';
  });
  R(0, 16, W, 2, '#ff5d8f');
  HL(0, W - 1, 18, '#c8406e');
  R(0, 18, 3, GY - 18, '#2fa59a');
  VL(0, 18, GY - 1, '#5ac8b8');
  R(W - 3, 18, 3, GY - 18, '#24807c');
  papel(3, 19, 77, 3, 1);
  // sign board
  signBoard(8, 26, 64, 18, '#1f6e6a', '#2fa59a');
  TC('TAQUERIA', 40, 28, '#fff4dc', FT, { ls: 1 });
  TC('MARIPOSA', 40, 35, '#ffd34a', FM, { shadow: '#1f5a58' });
  butterfly(15, 35, 1);
  butterfly(66, 35, 1);
  // arched teal door, centre x = 24
  const dx = 17;
  const dy = 47;
  RR(dx - 2, dy - 4, 18, GY - dy + 4, 4, '#ff5d8f');
  RR(dx, dy - 2, 14, GY - dy + 2, 3, '#2fa59a');
  VL(dx, dy, GY - 1, '#5ac8b8');
  VL(dx + 13, dy, GY - 1, '#1f6e6a');
  glass(dx + 3, dy, 8, 9, () => roomA(dx + 3, dy, 8, 9, '#f2a868', 7));
  RR(dx + 3, dy - 1, 8, 2, 1, '#2fa59a');
  box(dx + 3, dy + 12, 8, 9, '#24807c');
  R(dx + 11, dy + 13, 2, 2, '#ffd34a');
  R(dx - 4, GY - 2, 22, 2, '#d0694a');
  HL(dx - 4, dx + 17, GY - 2, '#ee9070');
  // chili ristra by the door
  VL(36, 44, 46, '#6a4a3a');
  for (let k = 0; k < 7; k++) {
    P(35 + (k % 2), 47 + k * 1.6, '#e8303a');
    P(36 + (k % 2), 47 + k * 1.6, '#b8202e');
  }
  P(36, 46, '#5a9a4a');
  // arched window with striped awning
  const wx = 42;
  const wy = 52;
  const ww = 32;
  const wh = 14;
  RR(wx - 2, wy - 2, ww + 4, wh + 4, 2, '#ff5d8f');
  glass(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#f2a868');
    R(wx, wy + 9, ww, wh - 9, '#a8603a');
    HL(wx, wx + ww - 1, wy + 9, '#d88a4e');
    // hanging lanterns and a taco plate on the counter
    for (const lx of [wx + 5, wx + 16, wx + 27]) {
      VL(lx, wy, wy + 1, '#5a4060');
      R(lx - 1, wy + 2, 3, 3, ['#ff5d8f', '#ffd34a', '#2fa59a'][(lx >> 2) % 3]);
    }
    ell(wx + 10, wy + 8, 4, 1.5, '#fff4e6');
    for (let k = 0; k < 3; k++) {
      P(wx + 8 + k * 2, wy + 7, '#f2c060');
      P(wx + 8 + k * 2, wy + 6, '#6fb050');
    }
    R(wx + 21, wy + 5, 3, 4, '#ff5d8f');
    R(wx + 25, wy + 6, 3, 3, '#ffd34a');
  });
  VL(wx + 16, wy, wy + wh - 1, '#ff5d8f');
  awning(wx - 3, wy - 9, ww + 6, 4, '#2fa59a', '#ff5d8f', 3);
  R(wx - 2, wy + wh + 2, ww + 4, 2, '#c8406e');
  // marigolds and a little cactus in pots
  pot(wx - 1, GY - 9, '#d0694a', '#5f9a5a', '#ffb030');
  pot(wx + 8, GY - 9, '#2fa59a', '#5f9a5a', '#ff8a30');
  RR(70, GY - 12, 4, 8, 2, '#5a9a5a');
  VL(70, GY - 11, GY - 6, '#7ac070');
  R(68, GY - 4, 8, 4, '#d0694a');
  // painted menu
  RRB(4, 47, 10, 11, 1, '#5a3a3a', '#3a4a4c');
  T('$2', 5, 49, '#ffd34a', FT, { sp: 0 });
  HL(5, 12, 55, '#fff4dc');
  foundation(0, GY - 3, 15, 3, '#d0694a', '#b85a40');
}
building('b-taqueria', {
  w: 80,
  h: 72,
  door: -16,
  draw: drawTaqueria,
  shadowTop: 10,
  label: 'Taqueria Mariposa',
  lights: [
    [24, 54, 14, WARM],
    [58, 58, 22, WARM],
    [40, 34, 20, '#ffe08a'],
  ],
});

// ---------------------------------------------------------------- Tallbridge Bakery
function cake(x: number, y: number, c: Color, c2: Color, tiers = 2): void {
  // tiny cake on a stand
  HL(x - 1, x + 6, y + 6, '#f2eef6');
  VL(x + 2, y + 7, y + 8, '#d8d2e2');
  RR(x, y + 2, 6, 4, 1, c);
  HL(x, x + 5, y + 2, liA(c, 0.5));
  if (tiers > 1) {
    RR(x + 1, y - 1, 4, 3, 1, c2);
    HL(x + 1, x + 4, y - 1, liA(c2, 0.5));
  }
  P(x + 2, y - 2, '#e8303a');
}
function drawBakery(): void {
  const W = 80;
  const GY = 72;
  // gentle mansard roof in lavender shingles, the shop sign mounted on it
  shingles(2, 3, W - 4, 13, '#9a7ab8', 41, 3, 5);
  HL(2, W - 3, 3, '#c8b0e0');
  signBoard(3, 4, 62, 12, '#8a5a8a', '#fff6ee');
  TC('TALLBRIDGE', 34, 6, '#d0507a', FM, { shadow: '#f6c0d0' });
  // a giant cupcake on the roof corner
  RR(64, 0, 14, 8, 4, '#ffb6cc');
  ell(71, 2, 5, 2.5, '#ffd0de');
  circ(71, 0, 1.5, '#e8303a');
  for (const [sx, sy, c] of [[67, 3, '#7ad0e8'], [74, 4, '#ffe070'], [69, 5, '#a8e070'], [75, 2, '#ffffff']] as [number, number, string][]) P(sx, sy, c);
  R(66, 8, 11, 7, (x: number) => (x % 2 ? '#e8b878' : '#d09a5a'));
  // pastel plaster walls
  R(0, 16, W, GY - 16, (x: number, y: number) => {
    const n = hash2(x, y, 43);
    return n < 0.05 ? '#fff0e6' : n > 0.96 ? '#f0cfc4' : '#fbe2d8';
  });
  R(0, 16, W, 2, '#8ad0b8');
  HL(0, W - 1, 18, '#5aa898');
  VL(0, 18, GY - 1, '#fff4ee');
  R(W - 4, 18, 4, GY - 18, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.12) : o));
  // BAKERY painted on the wall with little wheat sprigs
  T('BAKERY', 7, 22, '#5aa898', FM, { shadow: '#c8e8dc' });
  for (const wx2 of [3, 43]) {
    VL(wx2, 22, 28, '#d8a050');
    for (let k = 0; k < 3; k++) {
      P(wx2 - 1, 23 + k * 2, '#f2c870');
      P(wx2 + 1, 23 + k * 2, '#f2c870');
    }
  }
  // pastel striped awning over the window
  awning(3, 32, 40, 6, '#ffb6cc', '#fff6ee', 3);
  for (let x = 3; x < 43; x += 6) P(x + 1, 33, '#8ad0b8');
  // window with tiny cakes
  const wx = 6;
  const wy = 43;
  const ww = 34;
  const wh = 19;
  R(wx - 2, wy - 2, ww + 4, wh + 4, '#fff6ee');
  HL(wx - 2, wx + ww + 1, wy + wh + 1, '#d8b8c8');
  glass(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#ffe2c8');
    for (let x = wx; x < wx + ww; x += 6) VL(x, wy, wy + wh, '#ffd4ba');
    HL(wx, wx + ww - 1, wy + 10, '#e8c0a8');
    HL(wx, wx + ww - 1, wy + 18, '#e8c0a8');
    cake(wx + 2, wy + 3, '#ffb6cc', '#fff6ee');
    cake(wx + 10, wy + 4, '#8ad0b8', '#ffe070', 1);
    cake(wx + 18, wy + 3, '#fff6ee', '#c8a0e0');
    cake(wx + 26, wy + 4, '#e8a868', '#ffb6cc', 1);
    for (let k = 0; k < 5; k++) {
      RR(wx + 2 + k * 6, wy + 13, 4, 3, 1, ['#d09a5a', '#ffb6cc', '#e8c070', '#c8a0e0', '#8ad0b8'][k]);
      P(wx + 3 + k * 6, wy + 13, '#fff6ee');
    }
  });
  VL(wx + 17, wy, wy + wh - 1, '#fff6ee');
  flowerBox(wx - 2, wy + wh + 1, ww + 4, 9, '#8ad0b8');
  // the oversized door (the baker is seven feet tall), centre x = 56
  const dx = 46;
  const dy = 30;
  R(dx - 3, dy - 1, 26, GY - dy + 1, '#8a5a8a');
  RR(dx - 3, dy - 6, 26, 7, 3, '#8a5a8a');
  RR(dx - 1, dy - 4, 22, 5, 2, '#fff6ee');
  R(dx - 1, dy, 22, GY - dy, '#fff6ee');
  R(dx, dy, 20, GY - dy, '#8ad0b8');
  VL(dx, dy, GY - 1, '#b4e8d4');
  VL(dx + 19, dy, GY - 1, '#4a9888');
  glass(dx + 3, dy + 3, 14, 15, () => roomA(dx + 3, dy + 3, 14, 15, '#ffe2c8', 11));
  HL(dx + 3, dx + 16, dy + 10, '#8ad0b8');
  box(dx + 3, dy + 22, 14, 15, '#5aa898');
  R(dx + 16, dy + 20, 2, 3, '#f2c050');
  // rolling pin over the door
  R(dx + 3, dy - 3, 14, 2, '#e8c08a');
  HL(dx + 3, dx + 16, dy - 3, '#ffe0b0');
  R(dx + 1, dy - 3, 2, 1, '#a8704a');
  R(dx + 17, dy - 3, 2, 1, '#a8704a');
  RR(dx + 6, dy + 26, 8, 5, 1, '#fff6ee');
  T('HI', dx + 7, dy + 26, '#d0507a', FT, {});
  R(dx - 3, GY - 2, 26, 2, '#c8b0a8');
  HL(dx - 3, dx + 22, GY - 2, '#e6d4cc');
}
building('b-bakery', {
  w: 80,
  h: 72,
  door: 16,
  draw: drawBakery,
  shadowTop: 6,
  label: 'Tallbridge Bakery',
  lights: [
    [23, 52, 22, WARM],
    [56, 40, 16, WARM],
  ],
});

// ---------------------------------------------------------------- WRSL 1340 AM
function onAir(on: boolean): void {
  RR(18, 35, 28, 8, 2, '#3a2a40');
  if (on) {
    RR(19, 36, 26, 6, 1, '#e8303a');
    HL(20, 43, 36, '#ff8a80');
    neon('ON AIR', 32 - Math.round(TW('ON AIR', FT) / 2), 37, '#fff0e8', '#ff4a50', FT);
  } else {
    RR(19, 36, 26, 6, 1, '#7a3a48');
    T('ON AIR', 32 - Math.round(TW('ON AIR', FT) / 2), 37, '#a85a64', FT);
  }
}
function drawRadio(): void {
  const W = 64;
  const GY = 72;
  flatRoof(0, 4, W, 9, 51);
  // little roof antenna and dish
  VL(52, 0, 10, '#9a94b8');
  for (let y = 1; y < 10; y += 3) HL(50, 54, y, '#9a94b8');
  P(52, 0, '#ff4a50');
  ell(12, 9, 4, 2, '#d8d4e8');
  ell(12, 9, 2.5, 1, '#a8a4c0');
  VL(12, 10, 12, '#6e688e');
  // brick body
  brick(0, 12, W, GY - 12, '#b4584a', '#9a4a46', '#6e3a48', 52);
  R(0, 12, W, 3, '#d8c8b8');
  HL(0, W - 1, 12, '#f2e6d6');
  HL(0, W - 1, 14, '#9a8a8a');
  R(W - 5, 15, 5, GY - 15, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.2) : o));
  // vintage deco sign
  RRB(6, 16, 52, 18, 4, '#2f5a68', '#fbefd4');
  RR(8, 18, 48, 14, 3, '#f6e2bc');
  TC('WRSL', 32, 19, '#b8303e', FM, { bold: true, shadow: '#e8a24a' });
  TC('1340 AM', 32, 27, '#2f6a74', FT, {});
  // lightning zigzags either side
  for (const sx of [10, 50]) {
    L(sx, 19, sx + 2, 22, '#e8a24a');
    L(sx + 2, 22, sx, 23, '#e8a24a');
    L(sx, 23, sx + 2, 27, '#e8a24a');
  }
  onAir(false);
  // glass-block windows
  for (const gx of [5, 46]) {
    R(gx - 1, 44, 15, 17, '#d8c8b8');
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++) {
        const bx = gx + x * 4 + 1;
        const by = 45 + y * 5 + 1;
        R(bx, by, 3, 4, '#a8d0d8');
        P(bx, by, '#e8f8f8');
        P(bx + 2, by + 3, '#6a9aaa');
        R(bx + 1, by + 1, 1, 2, over('#ffd890', 0.5));
      }
  }
  // door with a little deco canopy (centre x = 32)
  R(22, 44, 20, 2, '#2f5a68');
  HL(22, 41, 44, '#5aa39a');
  for (let x = 23; x < 41; x += 3) P(x, 46, '#24485a');
  doorA(26, 48, 12, 24, '#4f9a92', { glass: true, frame: '#d8c8b8' });
  // record decals
  for (const [rx, ry] of [[22, 58], [41, 58]] as [number, number][]) {
    circ(rx, ry, 2.5, '#2b2140');
    P(rx, ry, '#ff5d8f');
    P(rx - 1, ry - 1, '#6a6088');
  }
  foundation(0, GY - 3, W, 3, '#c8b0a8', '#b8a098');
}
building('b-radio', {
  w: 64,
  h: 72,
  door: 0,
  draw: drawRadio,
  shadowTop: 8,
  label: 'WRSL 1340 AM',
  anims: [
    {
      fps: 0,
      frames: 2,
      rect: [16, 33, 32, 12],
      pick: (t, o) => {
        const k = (tick(t) + Math.floor(o.x)) % 90;
        return k < 2 || k === 5 || (k > 40 && k < 43) ? 0 : 1;
      },
      skip: (f) => f === 0,
      draw: () => onAir(true),
    },
    { fps: 2, frames: 2, rect: [50, 0, 5, 3], skip: (f) => f === 1, draw: () => P(52, 0, '#ffb0a8') },
  ],
  lights: [
    [32, 39, 16, '#ff4a50'],
    [12, 52, 12, WARM],
    [53, 52, 12, WARM],
    [32, 56, 12, WARM],
    [52, 0, 8, '#ff4a50'],
  ],
});

// ---------------------------------------------------------------- Sew What? (Marigold's)
function spool(x: number, y: number): void {
  R(x, y, 9, 2, '#a8704a');
  HL(x, x + 8, y, '#d8a070');
  R(x + 1, y + 2, 7, 7, '#e8505a');
  for (let yy = y + 2; yy < y + 9; yy += 2) HL(x + 1, x + 7, yy, '#ff8a8a');
  VL(x + 7, y + 2, y + 8, '#a83040');
  R(x, y + 9, 9, 2, '#a8704a');
  HL(x, x + 8, y + 10, '#7a4a3a');
  L(x + 7, y + 6, x + 11, y + 12, '#e8505a');
  P(x + 11, y + 13, '#d8d4e8');
}
function drawTailor(): void {
  const W = 64;
  const GY = 72;
  // front gable with scalloped shingles
  poly([[0, 22], [32, 2], [64, 22]], '#c8a0d8');
  for (let y = 6; y < 22; y += 3)
    for (let x = 0; x < W; x += 4) {
      const inside = y > 2 + Math.abs(x + 2 - 32) * 0.62;
      if (inside) {
        RR(x + ((y / 3) % 2 ? 2 : 0), y, 4, 3, 1, (y / 3) % 2 ? '#b48ccc' : '#c8a0d8');
        P(x + ((y / 3) % 2 ? 2 : 0) + 1, y, '#e0c8ec');
      }
    }
  L(0, 22, 32, 2, '#fbefd8');
  L(32, 2, 64, 22, '#fbefd8');
  L(1, 23, 32, 4, '#d8b8c8');
  // a big wooden spool emblem in the gable
  spool(28, 8);
  // plum clapboard walls with marigold trim
  clap(0, 22, W, GY - 22, '#b898d0', '#a084bc', '#7a5e9a', 61);
  R(0, 22, 2, GY - 22, '#f4b63f');
  R(W - 2, 22, 2, GY - 22, '#c8902a');
  // sign
  signBoard(10, 25, 44, 11, '#7a3a7a', '#fff4dc');
  TC('SEW WHAT?', 32, 27, '#b8307a', FM, { shadow: '#f4b63f' });
  // hanging spool sign
  HL(56, 63, 37, '#4a3550');
  VL(57, 37, 40, '#4a3550');
  VL(62, 37, 40, '#4a3550');
  spool(55, 40);
  // left window: a mannequin in a sequined robe
  const wy = 42;
  windowA(5, wy, 16, 20, { frame: '#f4b63f', curtains: null, mullion: false, wall: '#f2c8d8' });
  glass(5, wy, 16, 20, () => {
    R(5, wy, 16, 20, '#f2c8d8');
    for (let x = 5; x < 21; x += 3) VL(x, wy, wy + 20, '#ecbcd0');
    // mannequin
    circ(13, wy + 3, 2, '#e8d8c8');
    poly([[9, wy + 6], [17, wy + 6], [19, wy + 18], [7, wy + 18]], '#d0307a');
    for (let k = 0; k < 14; k++) P(8 + ((k * 5) % 11), wy + 7 + ((k * 7) % 10), k % 2 ? '#ffd34a' : '#ffffff');
    HL(9, 17, wy + 6, '#f4b63f');
    VL(13, wy + 6, wy + 17, '#a8205a');
    VL(13, wy + 18, wy + 19, '#8a7a6a');
  });
  // right window: bolts of fabric
  windowA(43, wy, 16, 20, { frame: '#f4b63f', curtains: null, mullion: false });
  glass(43, wy, 16, 20, () => {
    R(43, wy, 16, 20, '#f6dcc4');
    const bolts = ['#3f9a92', '#f4b63f', '#d8434b', '#9a6ad0', '#ff94b4', '#5a8ad0'];
    for (let i = 0; i < 6; i++) {
      const bx = 44 + (i % 3) * 5;
      const by = wy + 2 + Math.floor(i / 3) * 9;
      R(bx, by, 4, 8, bolts[i]);
      VL(bx, by, by + 7, liA(bolts[i], 0.4));
      VL(bx + 3, by, by + 7, shA(bolts[i], 0.3));
    }
  });
  // door (centre x = 32)
  doorA(26, 46, 12, 26, '#f4b63f', { glass: true, frame: '#fff4dc' });
  RR(26, 60, 12, 6, 1, '#fff4dc');
  T('SEW', 27, 60, '#7a3a7a', FT, {});
  foundation(0, GY - 3, 24, 3);
  foundation(40, GY - 3, 24, 3);
}
building('b-tailor', {
  w: 64,
  h: 72,
  door: 0,
  draw: drawTailor,
  shadowTop: 10,
  label: 'Sew What?',
  lights: [
    [13, 52, 14, WARM],
    [51, 52, 14, WARM],
    [32, 54, 10, WARM],
  ],
});

// ---------------------------------------------------------------- Halloran Chiropractic
function spineLogo(cx: number, y: number, c: Color, c2: Color): void {
  for (let k = 0; k < 6; k++) {
    const off = Math.round(Math.sin(k * 0.9) * 1.2);
    RR(cx - 2 + off, y + k * 2, 5, 2, 1, k % 2 ? c2 : c);
  }
}
function drawClinic(): void {
  const W = 64;
  const GY = 72;
  flatRoof(0, 4, W, 9, 71, '#9a92ae');
  vent(8, 5);
  R(44, 6, 12, 5, '#c8c4d8');
  HL(44, 55, 6, '#eeeaf6');
  // crisp white siding with teal trim
  clap(0, 12, W, GY - 12, '#ffffff', '#f2f0ec', '#d4d0d8', 72, 5);
  R(0, 12, W, 3, '#3f9a92');
  HL(0, W - 1, 12, '#6ac0b0');
  R(0, 15, 2, GY - 15, '#3f9a92');
  R(W - 2, 15, 2, GY - 15, '#2f7a76');
  // sign with spine logo
  signBoard(3, 17, 58, 17, '#2f7a76', '#ffffff');
  TC('HALLORAN', 32, 19, '#2f6a74', FM, {});
  TC('CHIROPRACTIC', 32, 27, '#3f9a92', FT, { ls: -0 });
  // projecting blade sign with the spine logo
  R(57, 38, 6, 12, '#ffffff');
  box(57, 38, 6, 12, '#2f7a76');
  spineLogo(60, 39, '#3f9a92', '#7fd0c0');
  // teal awning
  awning(3, 36, 58, 4, '#3f9a92', '#ffffff', 4);
  // windows with blinds
  for (const wx of [5, 45]) {
    R(wx - 1, 45, 16, 16, '#3f9a92');
    glass(wx, 46, 14, 14, () => {
      R(wx, 46, 14, 14, '#dcecec');
      for (let y = 46; y < 60; y += 2) HL(wx, wx + 13, y, '#b8d0d4');
      R(wx + 4, 52, 6, 8, '#9ac0b0');
    });
    R(wx - 2, 61, 18, 2, '#ffffff');
  }
  pot(56, GY - 9, '#3f9a92', '#5f9a5a', null);
  // door (centre x = 32)
  doorA(26, 46, 12, 26, '#3f9a92', { glass: true, frame: '#ffffff' });
  RR(27, 39, 10, 5, 1, '#ffffff');
  spineLogo(32, 39, '#3f9a92', '#7fd0c0');
  foundation(0, GY - 3, W, 3, '#d8d4e0', '#c8c4d4');
}
building('b-clinic', {
  w: 64,
  h: 72,
  door: 0,
  draw: drawClinic,
  shadowTop: 8,
  label: 'Halloran Chiropractic',
  lights: [
    [12, 53, 14, WARM],
    [52, 53, 14, WARM],
    [32, 54, 10, WARM],
  ],
});

// ---------------------------------------------------------------- Hurricane Physio & Yoga
function lotusBolt(cx: number, cy: number): void {
  // lotus petals with a little lightning bolt through the middle
  ell(cx - 4, cy + 1, 3, 2, '#f6b8c8');
  ell(cx + 4, cy + 1, 3, 2, '#f6b8c8');
  ell(cx, cy - 1, 2.5, 4, '#ffd0dc');
  HL(cx - 6, cx + 6, cy + 3, '#5a8a5a');
  L(cx + 1, cy - 4, cx - 1, cy, '#f4b63f');
  L(cx - 1, cy, cx + 1, cy, '#f4b63f');
  L(cx + 1, cy, cx - 1, cy + 4, '#f4b63f');
}
function drawStudio(): void {
  const W = 64;
  const GY = 72;
  // low hip roof in sage-teal shingles
  shingles(1, 2, W - 2, 12, '#5a8a7a', 81, 3, 4);
  HL(1, W - 2, 2, '#8ab8a0');
  // sage plaster
  R(0, 14, W, GY - 14, (x: number, y: number) => {
    const n = hash2(x, y, 83);
    return n < 0.05 ? '#c4dcb8' : n > 0.96 ? '#98b890' : '#b0ccA4'.toLowerCase();
  });
  HL(0, W - 1, 14, '#e0ecd4');
  R(W - 4, 15, 4, GY - 15, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.15) : o));
  // sign
  signBoard(3, 16, 58, 18, '#4a6a5a', '#f6f2e6');
  TC('HURRICANE', 32, 18, '#3a6a6a', FM, {});
  TC('PHYSIO & YOGA', 32, 27, '#7a9a6a', FT, {});
  // two calm windows: yoga mats and plants on the left, a fern and a ball on the right
  const wy = 42;
  for (const [wx, left] of [[4, true], [43, false]] as [number, boolean][]) {
    R(wx - 1, wy - 1, 19, 20, '#f6f2e6');
    glass(wx, wy, 17, 18, () => {
      R(wx, wy, 17, 18, '#f2e2c4');
      R(wx, wy + 12, 17, 6, '#d8b890');
      if (left) {
        for (const [mx, c] of [[wx + 1, '#7a9ad0'], [wx + 9, '#e88aa0']] as [number, string][]) {
          R(mx, wy + 14, 7, 3, c);
          HL(mx, mx + 6, wy + 14, liA(c, 0.4));
        }
        ell(wx + 4, wy + 6, 2, 3, '#5f9a5a');
        R(wx + 3, wy + 9, 3, 3, '#a8704a');
      } else {
        VL(wx + 12, wy, wy + 3, '#6a5a4a');
        ell(wx + 12, wy + 5, 3, 2, '#5f9a5a');
        for (let k = 0; k < 4; k++) P(wx + 10 + k, wy + 7 + (k % 2), '#4f8a5a');
        circ(wx + 5, wy + 12, 3.5, '#8ac0d0');
        P(wx + 4, wy + 10, '#d8f0f4');
      }
    });
    VL(wx + 8, wy, wy + 17, '#f6f2e6');
    flowerBox(wx - 2, wy + 18, 21, wx, '#7a9a6a');
  }
  // door (centre x = 32)
  doorA(25, 44, 14, 28, '#7aa890', { glass: true, frame: '#f6f2e6' });
  RR(26, 38, 12, 5, 1, '#4a6a5a');
  lotusBolt(32, 40);
  foundation(0, GY - 3, W, 3, '#c8c0b0', '#b8b0a0');
}
building('b-studio', {
  w: 64,
  h: 72,
  door: 0,
  draw: drawStudio,
  shadowTop: 6,
  label: 'Hurricane Physio & Yoga',
  lights: [
    [12, 50, 14, WARM],
    [51, 50, 14, WARM],
    [32, 54, 12, WARM],
  ],
});

// ---------------------------------------------------------------- Fenwick's Pawn & Tapes
function vhs(x: number, y: number, c: Color): void {
  R(x, y, 2, 5, '#2b2140');
  VL(x + 1, y + 1, y + 3, c);
}
function pawnNeon(on: boolean): void {
  RR(43, 39, 18, 7, 1, '#2f2440');
  neon('OPEN', 44, 40, '#ffe6f2', '#ff5fa0', FT, {}, on);
}
function drawPawn(): void {
  const W = 64;
  const GY = 72;
  flatRoof(0, 4, W, 9, 91, '#857590');
  vent(50, 5);
  // tired mustard brick
  brick(0, 12, W, GY - 12, '#c89a5a', '#b4884e', '#7a5a48', 92);
  R(0, 12, W, 3, '#6a5a6a');
  HL(0, W - 1, 12, '#8a7a8a');
  // the three gold pawn balls
  HL(54, 63, 16, '#4a3550');
  VL(58, 16, 19, '#4a3550');
  for (const [bx, by] of [[55, 21], [61, 21], [58, 25]] as [number, number][]) {
    circ(bx, by, 2.4, '#f4b63f');
    P(bx - 1, by - 1, '#fff0a0');
  }
  // sign
  signBoard(3, 16, 48, 17, '#7a2a3a', '#fbefd4');
  TC("FENWICK'S", 27, 18, '#b8303e', FM, {});
  TC('PAWN & TAPES', 27, 27, '#2f6a74', FT, {});
  // cluttered windows: VHS towers on the left, old TVs and a guitar on the right
  const wy = 40;
  const wh = 22;
  for (const wx of [3, 41]) {
    R(wx - 1, wy - 1, 22, wh + 2, '#4a3a4a');
    glass(wx, wy, 20, wh, () => {
      R(wx, wy, 20, wh, '#5a4a5e');
      R(wx, wy + 16, 20, 6, '#7a5a4a');
      if (wx < 30) {
        for (let i = 0; i < 9; i++) vhs(wx + 1 + i * 2, wy + 10, ['#e8505a', '#3f9a92', '#f4b63f', '#9a6ad0', '#fff4dc'][i % 5]);
        for (let i = 0; i < 7; i++) vhs(wx + 2 + i * 2, wy + 4, ['#5a8ad0', '#ff94b4', '#f4b63f'][i % 3]);
        for (let i = 0; i < 4; i++) vhs(wx + 4 + i * 2, wy + 16, ['#fff4dc', '#3f9a92'][i % 2]);
      } else {
        for (const [tx, ty] of [[wx + 1, wy + 8], [wx + 9, wy + 11]] as [number, number][]) {
          RR(tx, ty, 10, 8, 1, '#8a7a6a');
          R(tx + 1, ty + 1, 6, 5, '#7ae0d0');
          HL(tx + 1, tx + 6, ty + 2, '#b8fff0');
          P(tx + 8, ty + 2, '#d8d4e8');
          P(tx + 8, ty + 4, '#d8d4e8');
        }
        ell(wx + 17, wy + 7, 2, 3, '#d8843a');
        VL(wx + 17, wy, wy + 4, '#6a4a3a');
      }
    });
    for (let x = wx + 3; x < wx + 20; x += 5) VL(x, wy, wy + wh - 1, '#3a3048');
    HL(wx, wx + 19, wy + 11, '#3a3048');
  }
  pawnNeon(true);
  // door (centre x = 32)
  doorA(26, 42, 12, 30, '#6a5a7a', { glass: true, frame: '#d8c8b8' });
  R(27, 58, 10, 6, '#fff4dc');
  T('BUY', 27, 58, '#b8303e', FT, {});
  // milk crate of records
  R(58, GY - 7, 6, 7, '#3f6ab0');
  for (let x = 58; x < 64; x += 2) VL(x, GY - 7, GY - 1, '#2f4a80');
  foundation(0, GY - 3, 24, 3, '#a8908a', '#988080');
  foundation(40, GY - 3, 24, 3, '#a8908a', '#988080');
}
building('b-pawn', {
  w: 64,
  h: 72,
  door: 0,
  draw: drawPawn,
  shadowTop: 8,
  label: "Fenwick's Pawn & Tapes",
  anims: [
    {
      fps: 0,
      frames: 2,
      rect: [42, 37, 20, 10],
      pick: neonFlicker(73, [5, 6, 12, 40, 41]),
      skip: (f) => f === 0,
      draw: () => pawnNeon(false),
    },
  ],
  lights: [
    [13, 50, 14, WARM],
    [51, 50, 14, WARM],
    [52, 42, 14, '#ff6aa8'],
    [32, 54, 10, WARM],
  ],
});

// ---------------------------------------------------------------- GORGEOUS (Gideon's salon)
function barberPole(x: number, y: number, h: number, f: number): void {
  RR(x - 1, y - 2, 6, 3, 1, '#f4b63f');
  RR(x - 1, y + h - 1, 6, 3, 1, '#f4b63f');
  R(x, y + 1, 4, h - 2, '#fff4f8');
  for (let yy = 1; yy < h - 1; yy++)
    for (let xx = 0; xx < 4; xx++) {
      const s = (((xx + yy + f) % 6) + 6) % 6;
      if (s < 2) P(x + xx, y + yy, '#ff5d8f');
      else if (s === 2) P(x + xx, y + yy, '#f4b63f');
    }
  VL(x + 3, y + 1, y + h - 2, darken(0.2));
  VL(x, y + 1, y + h - 2, lighten(0.4));
}
function drawSalon(): void {
  const W = 64;
  const GY = 72;
  flatRoof(0, 4, W, 8, 101, '#9a84a8');
  // gold scalloped parapet
  for (let x = 0; x < W; x += 6) {
    RR(x, 9, 6, 4, 2, '#f4b63f');
    P(x + 2, 9, '#fff0a0');
  }
  HL(0, W - 1, 13, '#c8902a');
  // pink walls with cream pinstripes
  R(0, 14, W, GY - 14, (x: number) => (x % 8 === 0 ? '#ffd4e0' : '#f6b0c4'));
  R(W - 4, 14, 4, GY - 14, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.15) : o));
  // the glamorous script sign
  signBoard(4, 16, 56, 17, '#c8902a', '#3a2440');
  const s = 'Gorgeous';
  const tw = TW(s, FM, { bold: true });
  T(s, 32 - Math.round(tw / 2), 18, '#ffd34a', FM, { bold: true, shadow: '#c8307a' });
  // flourish underline + sparkles
  curve(10, 30, 54, 30, -2, '#ff8ab0');
  for (const [sx, sy] of [[8, 19], [56, 22], [53, 18]] as [number, number][]) {
    P(sx, sy, '#fff8e0');
    P(sx - 1, sy, '#ffd34a');
    P(sx + 1, sy, '#ffd34a');
    P(sx, sy - 1, '#ffd34a');
    P(sx, sy + 1, '#ffd34a');
  }
  // pink and gold awning
  awning(3, 36, 58, 5, '#ff5d8f', '#ffe8a0', 3);
  // left window: bonnet hair dryers
  const wy = 46;
  R(1, wy - 2, 21, 20, '#f4b63f');
  glass(3, wy, 17, 16, () => {
    R(3, wy, 17, 16, '#ffe0e8');
    R(3, wy + 11, 17, 5, '#d8a0b8');
    for (const dx2 of [3, 11]) {
      ell(dx2 + 4, wy + 4, 3.5, 3.5, '#d8d4e8');
      ell(dx2 + 3, wy + 3, 1.5, 1.5, '#ffffff');
      R(dx2 + 3, wy + 7, 2, 3, '#a8a0b8');
      RR(dx2 + 1, wy + 9, 6, 4, 1, '#ff5d8f');
      HL(dx2 + 1, dx2 + 6, wy + 9, '#ff9ab8');
    }
  });
  // right window: a gold mirror and a styling chair
  R(42, wy - 2, 21, 20, '#f4b63f');
  glass(44, wy, 17, 16, () => {
    R(44, wy, 17, 16, '#ffe0e8');
    R(44, wy + 11, 17, 5, '#d8a0b8');
    RR(47, wy + 1, 9, 9, 3, '#f4b63f');
    RR(48, wy + 2, 7, 7, 2, '#c8e0f0');
    P(49, wy + 3, '#ffffff');
    RR(48, wy + 8, 7, 5, 1, '#3a2440');
    HL(48, 54, wy + 8, '#6a4a70');
    VL(51, wy + 13, wy + 15, '#a8a0b8');
  });
  barberPole(21, 42, 20, 0);
  // door (centre x = 32)
  doorA(25, 44, 14, 28, '#3a2440', { glass: true, frame: '#f4b63f', knob: '#ffd34a' });
  RR(25, 59, 14, 7, 1, '#ffd34a');
  T('IN', 29, 60, '#3a2440', FT, {});
  foundation(0, GY - 3, W, 3, '#d8b8c8', '#c8a8b8');
}
building('b-salon', {
  w: 64,
  h: 72,
  door: 0,
  draw: drawSalon,
  shadowTop: 9,
  label: 'Gorgeous',
  anims: [{ fps: 6, frames: 6, rect: [19, 39, 7, 26], draw: (f) => barberPole(21, 42, 20, f) }],
  lights: [
    [11, 54, 14, WARM],
    [52, 54, 14, WARM],
    [32, 52, 10, WARM],
    [32, 24, 18, '#ffd34a'],
  ],
});

// =====================================================================
//  Civic buildings
// =====================================================================
/** Cut-stone block wall. */
function stoneWall(x: number, y: number, w: number, h: number, base: Color, seed: number): void {
  const r = rng(seed);
  R(x, y, w, h, shA(base, 0.3));
  for (let yy = 0; yy < h; yy += 5) {
    const off = (yy / 5) % 2 ? 5 : 0;
    for (let xx = -off; xx < w; xx += 10) {
      const c = r() < 0.25 ? liA(base, 0.12) : r() < 0.2 ? shA(base, 0.08) : base;
      const bx = x + Math.max(0, xx);
      const bw = Math.min(9 + Math.min(0, xx), w - Math.max(0, xx));
      R(bx, y + yy, bw, Math.min(4, h - yy), c);
      HL(bx, bx + bw - 1, y + yy, liA(c, 0.3));
    }
  }
}
function column(x: number, y0: number, y1: number): void {
  R(x - 1, y0, 7, 2, '#f4eee8');
  R(x, y0 + 2, 5, y1 - y0 - 4, '#e8e0dc');
  VL(x, y0 + 2, y1 - 3, '#fffaf4');
  VL(x + 2, y0 + 2, y1 - 3, '#d8d0d0');
  VL(x + 4, y0 + 2, y1 - 3, '#b8a8b4');
  R(x - 1, y1 - 2, 7, 2, '#d8d0d0');
  HL(x - 1, x + 5, y1 - 2, '#f4eee8');
}
function drawLibrary(): void {
  const W = 96;
  const GY = 80;
  // slate roof behind the pediment
  shingles(0, 4, W, 16, '#6a6488', 111, 3, 4);
  HL(0, W - 1, 4, '#9a94b8');
  // wings: stone with tall arched windows
  stoneWall(0, 20, W, GY - 20, '#c8bccc', 112);
  for (const wx of [5, 81]) {
    RR(wx - 1, 34, 12, 26, 4, '#f4eee8');
    glass(wx, 36, 10, 23, () => {
      roomA(wx, 36, 10, 23, '#e7a468', wx);
      for (let k = 0; k < 4; k++) R(wx + 1, 40 + k * 5, 8, 3, ['#c9424f', '#4c6ab2', '#e2b244', '#518c5c'][k]);
    });
    RR(wx, 35, 10, 3, 1, '#e8a868');
    VL(wx + 5, 36, 58, '#f4eee8');
    R(wx - 2, 60, 14, 2, '#e8e0dc');
  }
  // portico: pediment, frieze, four columns
  poly([[18, 26], [48, 6], [78, 26]], '#efe6e4');
  poly([[24, 24], [48, 10], [72, 24]], '#ddd2d4');
  L(18, 26, 48, 6, '#fffaf4');
  L(48, 6, 78, 26, '#b8a8b4');
  // an open book in the pediment
  R(42, 15, 12, 6, '#fff8ee');
  VL(48, 15, 20, '#c8b8c0');
  for (let k = 0; k < 3; k++) {
    HL(43, 46, 16 + k * 2, '#a898b0');
    HL(50, 53, 16 + k * 2, '#a898b0');
  }
  R(16, 26, 64, 9, '#efe6e4');
  HL(16, 79, 26, '#fffaf4');
  HL(16, 79, 34, '#b8a8b4');
  TC('PUBLIC LIBRARY', 48, 28, '#5a4a7a', FT, {});
  R(18, 35, 60, 35, '#a89cb4');
  // shadowy portico interior with the door
  for (let x = 18; x < 78; x++) for (let y = 35; y < 40; y++) P(x, y, (X: number, Y: number) => (dth(X, Y, 10 - (y - 35) * 2) ? '#8a7e9a' : '#a89cb4'));
  doorA(42, 46, 12, 24, '#7a4a3a', { glass: true, frame: '#e8e0dc', step: false });
  RR(41, 41, 14, 5, 2, '#e8e0dc');
  for (const cx of [21, 31, 60, 70]) column(cx, 35, 70);
  // the stone steps
  for (let k = 0; k < 3; k++) {
    R(30 - k * 4, 70 + k * 3, 36 + k * 8, 3, ['#e8e0dc', '#d8d0d0', '#c8c0c4'][k]);
    HL(30 - k * 4, 65 + k * 4, 70 + k * 3, '#fffaf4');
  }
  // Story Time sandwich board
  L(3, GY - 1, 5, GY - 18, '#8a5a4a');
  L(21, GY - 1, 19, GY - 18, '#6e3a48');
  RR(1, GY - 21, 22, 19, 1, '#a8704f');
  HL(2, 21, GY - 21, '#d09a6a');
  R(2, GY - 20, 20, 17, '#3a4a4c');
  TC('STORY', 12, GY - 19, '#fff4dc', FT, {});
  TC('TIME', 12, GY - 13, '#ffd977', FT, {});
  TC('4PM', 12, GY - 7, '#ff9ab0', FT, {});
  // the blue book-return box
  RR(81, GY - 16, 11, 16, 2, '#4a68b8');
  R(83, GY - 13, 7, 2, '#2b2140');
  VL(82, GY - 15, GY - 2, '#7aa0e0');
  T('B', 85, GY - 9, '#fff4dc', FT, {});
  R(82, GY - 1, 2, 1, '#30407c');
  R(89, GY - 1, 2, 1, '#30407c');
}
building('b-library', {
  w: 96,
  h: 80,
  door: 0,
  draw: drawLibrary,
  shadowTop: 6,
  label: 'Public Library',
  lights: [
    [10, 46, 14, WARM],
    [86, 46, 14, WARM],
    [48, 54, 16, WARM],
  ],
});

// ---------------------------------------------------------------- VFW Post 316
export function flagFrame(x: number, y: number, f: number, w = 14, h = 9): void {
  // a little stars-and-stripes flag rippling in the breeze
  for (let xx = 0; xx < w; xx++) {
    const off = Math.round(Math.sin(xx * 0.55 - f * 1.6) * 1.2 * (xx / w));
    for (let yy = 0; yy < h; yy++) {
      const inCanton = xx < 6 && yy < 5;
      let c = inCanton ? '#3a4a9a' : Math.floor(yy / 1.5) % 2 ? '#fbf0e4' : '#d8434b';
      if (inCanton && (xx + yy) % 2 === 0 && xx > 0 && yy > 0) c = '#fbf0e4';
      const shade = Math.sin(xx * 0.55 - f * 1.6) < -0.3;
      P(x + xx, y + yy + off, shade ? shA(c, 0.2) : c);
    }
  }
}
function vfwFlag(f: number): void {
  flagFrame(7, 3, f);
}
function drawVFW(): void {
  const W = 112;
  const GY = 80;
  flatRoof(0, 10, W, 10, 121);
  vent(90, 11);
  vent(30, 12);
  brick(0, 20, W, GY - 20, '#a8504a', '#924442', '#6a3444', 122);
  R(0, 18, W, 3, '#f2ece4');
  HL(0, W - 1, 18, '#ffffff');
  HL(0, W - 1, 20, '#b8a8b0');
  R(W - 6, 21, 6, GY - 21, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.2) : o));
  // name band
  R(20, 23, 72, 10, '#2f3a6a');
  HL(20, 91, 23, '#4a5a9a');
  TC('VFW POST 316', 56, 25, '#fbf0e4', FM, {});
  P(23, 28, '#f4b63f');
  P(88, 28, '#f4b63f');
  // the changeable-letter marquee
  R(10, 35, 92, 19, '#f2ece4');
  box(10, 35, 92, 19, '#5a5a7a');
  HL(11, 100, 36, '#ffffff');
  HL(12, 99, 44, '#d8d0d8');
  HL(12, 99, 52, '#d8d0d8');
  TC('WED NIGHT WRESTLING', 56, 38, '#2b2140', FT, {});
  TC('BINGO AFTER', 56, 46, '#c9404c', FT, {});
  // windows
  for (const wx of [9, 85]) windowA(wx, 58, 18, 12, { frame: '#f2ece4', curtains: '#fff4e6', seed: wx });
  // double doors with canopy (centre x = 56)
  R(42, 54, 28, 3, '#2f3a6a');
  HL(42, 69, 54, '#4a5a9a');
  doorA(46, 60, 10, 20, '#5a6a9a', { glass: true, frame: '#f2ece4', step: false });
  doorA(56, 60, 10, 20, '#5a6a9a', { glass: true, frame: '#f2ece4', step: false });
  R(43, GY - 2, 26, 2, '#c8c0c4');
  HL(43, 68, GY - 2, '#e6dee0');
  // flagpole in front of the left corner
  VL(5, 2, GY - 1, '#c8c4d8');
  VL(6, 3, GY - 1, '#8a84a0');
  circ(6, 2, 1.5, '#f4b63f');
  R(3, GY - 3, 6, 3, '#9a92a8');
  vfwFlag(0);
  // a bench and an ashtray-urn by the door
  R(74, GY - 7, 8, 2, '#a8704f');
  R(75, GY - 5, 1, 5, '#6e4a3a');
  R(80, GY - 5, 1, 5, '#6e4a3a');
}
building('b-vfw', {
  w: 112,
  h: 80,
  door: 0,
  draw: drawVFW,
  shadowTop: 18,
  label: 'VFW Post 316',
  anims: [{ fps: 5, frames: 4, rect: [6, 0, 18, 16], draw: (f) => vfwFlag(f) }],
  lights: [
    [18, 64, 14, WARM],
    [94, 64, 14, WARM],
    [56, 66, 18, WARM],
    [56, 44, 30, '#fff0d0'],
  ],
});

// ---------------------------------------------------------------- Turnbuckle Alley High gym
function tigerFace(cx: number, cy: number): void {
  ell(cx, cy, 7, 6, '#f2903a');
  ell(cx - 5, cy - 5, 2, 2, '#f2903a');
  ell(cx + 5, cy - 5, 2, 2, '#f2903a');
  P(cx - 5, cy - 5, '#ffd0a0');
  P(cx + 5, cy - 5, '#ffd0a0');
  ell(cx, cy + 2, 4, 3, '#fff4e6');
  for (const sx of [-6, -4, 4, 6]) VL(cx + sx, cy - 3, cy - 1, '#3a2440');
  HL(cx - 1, cx + 1, cy - 5, '#3a2440');
  VL(cx, cy - 6, cy - 4, '#3a2440');
  P(cx - 3, cy - 1, '#3a2440');
  P(cx + 3, cy - 1, '#3a2440');
  P(cx - 3, cy - 2, '#a8e070');
  P(cx + 3, cy - 2, '#a8e070');
  R(cx - 1, cy + 1, 3, 1, '#d8434b');
  P(cx, cy + 3, '#3a2440');
}
function drawSchool(): void {
  const W = 112;
  const GY = 88;
  // barrel roof receding behind the arched front
  for (let x = 2; x < W - 2; x++) {
    const t = (x - W / 2) / (W / 2 - 2);
    const top = Math.round(6 + t * t * 20);
    for (let y = top; y < top + 12; y++) P(x, y, x % 5 === 0 ? '#9a94b8' : x < W / 2 ? '#7a7498' : '#625c84');
    P(x, top, '#c8c4dc');
  }
  // arched brick front
  const archTop = (x: number) => {
    const t = (x - W / 2) / (W / 2);
    return Math.round(16 + t * t * 18);
  };
  for (let x = 0; x < W; x++) {
    const top = archTop(x);
    R(x, top, 1, GY - top, (X: number, Y: number) => {
      const row = Math.floor((Y - 2) / 4);
      const k = (Y - 2) % 4;
      const off = row % 2 ? 4 : 0;
      if (k === 3 || (X + off) % 8 === 0) return '#8a5a5a';
      const n = hash2(Math.floor((X + off) / 8), row, 131);
      return n < 0.3 ? '#a85048' : n < 0.4 ? '#c46a58' : '#b45a4c';
    });
    P(x, top, '#f2ece4');
    P(x, top + 1, '#f2ece4');
    P(x, top + 2, '#c8b0b0');
  }
  R(W - 6, 30, 6, GY - 30, (x: number, y: number, o: number) => (o && dth(x, y, 8) ? shA(o, 0.2) : o));
  // painted tiger in the arch
  RR(46, 18, 20, 16, 4, '#2f3a6a');
  tigerFace(56, 26);
  // name band
  R(8, 36, 96, 9, '#2f3a6a');
  HL(8, 103, 36, '#4a5a9a');
  TC('TURNBUCKLE ALLEY HIGH', 56, 38, '#f4b63f', FT, {});
  // clerestory windows
  for (const wx of [6, 96]) {
    R(wx - 1, 47, 12, 9, '#f2ece4');
    glass(wx, 48, 10, 7, () => roomA(wx, 48, 10, 7, '#f2c890', wx));
    VL(wx + 5, 48, 54, '#f2ece4');
  }
  // banner
  R(20, 47, 72, 15, '#f2903a');
  for (let x = 20; x < 92; x += 4) P(x + 1, 62, '#f2903a');
  HL(20, 91, 47, '#ffc078');
  TC('HOME OF THE', 56, 49, '#3a2440', FT, {});
  TC('TURNBUCKLE TIGERS', 56, 55, '#fff4e6', FT, {});
  for (const sx of [22, 88]) {
    VL(sx, 49, 59, '#3a2440');
    VL(sx + 2, 49, 59, '#3a2440');
  }
  // big double doors with push bars (centre x = 56)
  R(42, 63, 28, 3, '#2f3a6a');
  for (const dx of [44, 56]) {
    R(dx, 66, 12, 22, '#3f9a92');
    VL(dx, 66, 87, '#6ac0b0');
    VL(dx + 11, 66, 87, '#2f7a76');
    glass(dx + 3, 68, 6, 8, () => roomA(dx + 3, 68, 6, 8, '#f2c890', dx));
    R(dx + 1, 78, 10, 2, '#d8d4e8');
    HL(dx + 1, dx + 10, 78, '#ffffff');
  }
  R(40, GY - 2, 32, 2, '#c8c0c4');
  // windows low on the sides + a trophy case
  for (const wx of [10, 88]) windowA(wx, 66, 14, 12, { frame: '#f2ece4', curtains: null, seed: wx * 7 });
  // bike rack
  for (let k = 0; k < 4; k++) {
    RR(26 + k * 4, GY - 7, 4, 7, 2, '#8a84a0');
    R(27 + k * 4, GY - 6, 2, 6, '#b4584a');
  }
  // tiger paw prints on the steps
  for (const [px, py] of [[74, 84], [80, 82]] as [number, number][]) {
    R(px, py, 2, 2, '#f2903a');
    P(px - 1, py - 1, '#f2903a');
    P(px + 2, py - 1, '#f2903a');
  }
}
building('b-school', {
  w: 112,
  h: 88,
  door: 0,
  draw: drawSchool,
  shadowTop: 20,
  label: 'Turnbuckle Alley High',
  solid: { x: -56, y: -60, w: 112, h: 60 },
  lights: [
    [56, 76, 18, WARM],
    [11, 51, 10, WARM],
    [101, 51, 10, WARM],
    [17, 72, 12, WARM],
    [95, 72, 12, WARM],
  ],
});

// ---------------------------------------------------------------- The Evening Bell Residence (b-sunnypines)
function bellIcon(cx: number, y: number, c: Color, c2: Color): void {
  P(cx, y, c2);
  RR(cx - 2, y + 1, 5, 4, 2, c);
  HL(cx - 3, cx + 3, y + 5, c);
  P(cx - 1, y + 2, liA(c as string, 0.5));
  P(cx, y + 6, c2);
}
function rocker(x: number, y: number, c: Color): void {
  R(x + 1, y, 5, 6, c);
  HL(x + 1, x + 5, y, liA(c, 0.4));
  R(x, y + 5, 7, 2, shA(c, 0.15));
  curve(x - 1, y + 9, x + 8, y + 9, 1, shA(c, 0.4));
  VL(x + 1, y + 7, y + 8, shA(c, 0.3));
  VL(x + 5, y + 7, y + 8, shA(c, 0.3));
}
function drawSunnyPines(): void {
  const W = 128;
  const GY = 80;
  // hip roof with three dormers
  shingles(4, 2, W - 8, 18, '#8a6a8a', 141, 3, 5);
  poly([[4, 2], [12, 2], [4, 12]], 0);
  HL(8, W - 9, 2, '#b89ab8');
  for (const dx of [26, 60, 94]) {
    poly([[dx - 1, 10], [dx + 4, 4], [dx + 9, 10]], '#9a7a9a');
    R(dx, 10, 8, 8, '#fff6e0');
    glass(dx + 1, 11, 6, 6, () => roomA(dx + 1, 11, 6, 6, '#f2c890', dx));
    VL(dx + 4, 11, 16, '#fff6e0');
  }
  // upper storey: soft butter clapboard
  clap(2, 20, W - 4, 26, '#fff2c8', '#f6e0a8', '#d8b884', 142);
  for (const wx of [6, 20, 100, 114]) windowA(wx, 26, 9, 12, { frame: '#ffffff', shutters: '#7aa890', seed: wx + 3 });
  // the name, with a little bell either side
  RRB(34, 23, 60, 17, 3, '#5a8a7a', '#fffaf0');
  HL(36, 91, 24, '#ffffff');
  TC('EVENING BELL', 64, 25, '#4a5a8a', FT, {});
  bellIcon(64, 31, '#f4b63f', '#a8702a');
  bellIcon(40, 30, '#f4b63f', '#a8702a');
  bellIcon(88, 30, '#f4b63f', '#a8702a');
  for (const sx of [50, 78]) {
    P(sx, 34, '#7aa890');
    P(sx + 1, 33, '#7aa890');
    P(sx + 2, 34, '#7aa890');
  }
  // porch roof
  R(0, 45, W, 4, '#9a7a9a');
  HL(0, W - 1, 45, '#c8a8c8');
  HL(0, W - 1, 48, '#6a4a6a');
  // ground floor behind the porch
  clap(2, 49, W - 4, GY - 49, '#fff2c8', '#f6e0a8', '#d8b884', 143);
  for (let x = 2; x < W - 2; x++) for (let y = 49; y < 54; y++) P(x, y, (X: number, Y: number, o: number) => (dth(X, Y, 12 - (y - 49) * 3) ? shA(o, 0.25) : o));
  for (const wx of [10, 30, 86, 106]) windowA(wx, 56, 12, 12, { frame: '#ffffff', seed: wx });
  doorA(57, 54, 14, 24, '#7aa890', { glass: true, frame: '#ffffff', step: false, wreath: true });
  // porch posts and railing
  for (const px of [2, 22, 46, 80, 104, 124]) {
    R(px, 49, 3, GY - 51, '#ffffff');
    VL(px + 2, 49, GY - 3, '#d8d0c8');
  }
  for (let x = 2; x < W - 2; x++) {
    if (x >= 52 && x < 76) continue;
    if (x % 3 === 0) VL(x, GY - 9, GY - 3, '#f4eee8');
  }
  HL(2, 51, GY - 10, '#ffffff');
  HL(76, W - 3, GY - 10, '#ffffff');
  R(0, GY - 3, W, 3, '#c8b0a0');
  HL(0, W - 1, GY - 3, '#e6d4c4');
  // rocking chairs and hanging ferns
  rocker(32, GY - 15, '#a8704f');
  rocker(88, GY - 15, '#7aa890');
  for (const fx of [12, 116]) {
    VL(fx, 49, 51, '#6a5a4a');
    ell(fx, 54, 4, 2.5, '#5f9a5a');
    for (let k = -3; k <= 3; k += 2) VL(fx + k, 55, 57 + Math.abs(k % 3), '#4f8a5a');
  }
  // planters on the steps
  for (const px of [48, 76]) {
    R(px, GY - 7, 6, 6, '#c8704f');
    HL(px, px + 5, GY - 7, '#e8906a');
    ell(px + 3, GY - 9, 4, 3, '#5f9a5a');
    P(px + 1, GY - 10, '#ff8fae');
    P(px + 4, GY - 11, '#ffe070');
    P(px + 3, GY - 9, '#ff8fae');
  }
}
building('b-sunnypines', {
  w: 128,
  h: 80,
  door: 0,
  draw: drawSunnyPines,
  shadowTop: 6,
  label: 'The Evening Bell Residence',
  lights: [
    [10, 32, 10, WARM],
    [24, 32, 10, WARM],
    [104, 32, 10, WARM],
    [118, 32, 10, WARM],
    [16, 62, 12, WARM],
    [36, 62, 12, WARM],
    [92, 62, 12, WARM],
    [112, 62, 12, WARM],
    [64, 64, 16, WARM],
    [30, 14, 8, WARM],
    [98, 14, 8, WARM],
  ],
});

// =====================================================================
//  Homes
// =====================================================================
const HOUSE_PALS = [
  { wall: ['#fff0c0', '#f6dc98', '#d4b478'], roof: '#b05a4a', trim: '#ffffff', door: '#3f8a86', shut: '#5a9a8a' }, // butter
  { wall: ['#d4e8c4', '#b8d4a8', '#8eb488'], roof: '#5a5a7a', trim: '#fffaf0', door: '#c8584a', shut: '#4a7a6a' }, // sage
  { wall: ['#ffd8d8', '#f4b8bc', '#d0909c'], roof: '#6a4a6a', trim: '#fffaf0', door: '#5a7ab8', shut: '#c86a7a' }, // rose
  { wall: ['#d4e4f8', '#b4ccec', '#8aa4cc'], roof: '#8a5a48', trim: '#ffffff', door: '#f4b63f', shut: '#4a6aa8' }, // sky
];
function drawHouse(p: Props): void {
  const v = Math.abs(Math.floor(Number(p.variant ?? 0))) % 4;
  const pal = HOUSE_PALS[v];
  const W = 64;
  const GY = 64;
  // chimney behind the roof
  chimney(44, 0, 14, v === 1 ? '#a85a4a' : '#b4644e');
  // side-gabled roof with a dormer
  shingles(0, 7, W, 20, pal.roof, 151 + v, 3, 5);
  HL(1, W - 2, 7, liA(pal.roof, 0.4));
  HL(0, W - 1, 26, shA(pal.roof, 0.5));
  if (v % 2 === 0) {
    poly([[26, 16], [33, 9], [40, 16]], shA(pal.roof, 0.1));
    L(26, 16, 33, 9, liA(pal.roof, 0.3));
    R(28, 16, 10, 8, pal.trim);
    glass(29, 17, 8, 6, () => roomA(29, 17, 8, 6, '#f2c890', v));
    VL(33, 17, 22, pal.trim);
  } else {
    circ(16, 17, 4, pal.trim);
    glass(13, 14, 7, 7, () => roomA(13, 14, 7, 7, '#f2c890', v));
    circ(16, 17, 4, (x: number, y: number, o: number) => (Math.hypot(x + 0.5 - 16, y + 0.5 - 17) > 3 ? pal.trim : o));
    VL(16, 14, 20, pal.trim);
    HL(13, 19, 17, pal.trim);
  }
  // siding
  clap(1, 27, W - 2, GY - 27, pal.wall[0], pal.wall[1], pal.wall[2], 152 + v);
  R(W - 5, 27, 4, GY - 27, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.15) : o));
  VL(1, 27, GY - 1, pal.trim);
  VL(W - 2, 27, GY - 1, shA(pal.trim, 0.15));
  // door with a little gabled porch hood (centre x = 20)
  poly([[11, 36], [20, 30], [29, 36]], pal.roof);
  L(11, 36, 20, 30, liA(pal.roof, 0.4));
  HL(11, 29, 36, pal.trim);
  doorA(15, 39, 10, 25, pal.door, { glass: v === 3, frame: pal.trim, wreath: v === 2 });
  // porch light
  R(28, 40, 2, 3, '#4a3550');
  P(28, 43, '#ffe08a');
  P(29, 43, '#ffd060');
  // window with shutters + flowerbox
  windowA(39, 38, 14, 12, { frame: pal.trim, shutters: pal.shut, box: 160 + v, seed: v * 5 + 1 });
  // little details per variant
  if (v === 0) {
    // a garden gnome
    R(7, GY - 5, 3, 4, '#3f6ab0');
    poly([[7, GY - 5], [8, GY - 9], [10, GY - 5]], '#d8434b');
    P(8, GY - 4, '#f2c8a0');
  } else if (v === 1) pot(4, GY - 9, '#c8704f', '#5f9a5a', '#ffe070');
  else if (v === 2) {
    // bicycle leaning on the wall
    circ(56, GY - 3, 2.5, '#5a5a7a');
    circ(62, GY - 3, 2.5, '#5a5a7a');
    circ(56, GY - 3, 1.5, pal.wall[1]);
    circ(62, GY - 3, 1.5, pal.wall[1]);
    L(56, GY - 3, 59, GY - 7, '#d8434b');
    L(59, GY - 7, 62, GY - 3, '#d8434b');
  } else {
    // wind chime and a cat in the window
    VL(33, 37, 40, '#a8a4bc');
    for (let k = 0; k < 3; k++) VL(32 + k, 41, 43 + k, '#d8d4e8');
    R(42, 46, 4, 3, '#3a3048');
    P(42, 45, '#3a3048');
    P(45, 45, '#3a3048');
  }
}
building('b-house', {
  w: 64,
  h: 64,
  door: -12,
  draw: drawHouse,
  vkey: (p) => String(Math.abs(Math.floor(Number(p.variant ?? 0))) % 4),
  shadowTop: 6,
  solid: { x: -32, y: -44, w: 64, h: 44 },
  lights: [
    [46, 44, 14, WARM],
    [29, 43, 8, LAMP],
    [33, 20, 8, WARM],
  ],
  anims: [{ fps: 4, frames: 4, rect: [42, -12, 14, 14], rel: true, draw: (f, _p, ox, oy) => puff(47 + ox, -1 + oy, f) }],
  pad: [0, 12, 10, 4],
});

// ---------------------------------------------------------------- Birdie's house
function drawBirdie(): void {
  const W = 80;
  const GY = 72;
  // front-gabled cottage with gingerbread trim
  shingles(0, 8, W, 18, '#6a4a6a', 171, 3, 5);
  HL(0, W - 1, 8, '#9a7a9a');
  poly([[6, 30], [28, 4], [50, 30]], '#ffe2ea');
  for (let y = 10; y < 30; y += 4) HL(Math.round(28 - (y - 4) * 0.85) + 1, Math.round(28 + (y - 4) * 0.85) - 1, y, '#f4c4d0');
  L(5, 30, 28, 3, '#ff7aa0');
  L(28, 3, 51, 30, '#ff7aa0');
  L(6, 31, 28, 5, '#d0507a');
  for (let k = 0; k < 6; k++) P(10 + k * 7, 31 - (k < 3 ? k : 5 - k) * 0, '#ff9ab8');
  // attic window with the faded Velvet Hammers banner
  RR(20, 14, 16, 12, 2, '#ff7aa0');
  glass(21, 15, 14, 10, () => {
    roomA(21, 15, 14, 10, '#e8b088', 3);
    R(22, 16, 12, 7, '#c8a0c0');
    T('VH', 23, 17, '#f6e6f0', FT, { ls: 1 });
    HL(22, 33, 22, '#a880a8');
  });
  // walls: cream clapboard with pink trim
  clap(0, 30, W, GY - 30, '#fffaf0', '#f4ece0', '#d8ccc0', 172);
  R(W - 4, 30, 4, GY - 30, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.15) : o));
  // porch on the right with a swing
  R(44, 34, 36, 3, '#ff7aa0');
  HL(44, 79, 34, '#ffb0c8');
  for (let x = 44; x < 80; x += 4) P(x + 2, 37, '#ff7aa0');
  for (const px of [45, 77]) {
    R(px, 37, 2, GY - 39, '#fffaf0');
    VL(px + 1, 37, GY - 3, '#d8ccc0');
  }
  // porch swing
  VL(52, 37, 50, '#8a7a8a');
  VL(68, 37, 50, '#8a7a8a');
  R(51, 50, 19, 3, '#ff9ab8');
  R(51, 46, 19, 4, '#ffb6cc');
  HL(51, 69, 46, '#ffd0de');
  RR(55, 47, 4, 3, 1, '#7aa890');
  // window under the porch
  windowA(58, 39, 10, 6, { frame: '#ff7aa0', curtains: '#fff4f8', seed: 9 });
  // front door (centre x = 24)
  doorA(18, 44, 12, 26, '#ff7aa0', { glass: true, frame: '#fffaf0' });
  RR(19, 39, 10, 4, 1, '#d0507a');
  T('B', 22, 39, '#fff4f8', FT, {});
  // window left with flowerbox
  windowA(4, 42, 10, 12, { frame: '#ff7aa0', shutters: '#d0507a', box: 173, seed: 11 });
  // the pink flamingo
  VL(39, GY - 7, GY - 1, '#d0507a');
  ell(39, GY - 9, 3, 2, '#ff7aa0');
  L(41, GY - 10, 42, GY - 15, '#ff7aa0');
  P(42, GY - 16, '#ff7aa0');
  P(43, GY - 16, '#3a2440');
  R(0, GY - 3, W, 3, '#c8b0b8');
  HL(0, W - 1, GY - 3, '#e6d0d8');
}
building('b-birdie', {
  w: 80,
  h: 72,
  door: -16,
  draw: drawBirdie,
  shadowTop: 6,
  label: "Birdie's house",
  lights: [
    [28, 20, 12, WARM],
    [9, 48, 12, WARM],
    [63, 42, 10, WARM],
    [24, 52, 10, WARM],
  ],
});

// ---------------------------------------------------------------- Grandma's house
function drawGrandma(): void {
  const W = 96;
  const GY = 88;
  // big front gable, weathered shingles with a few missing
  shingles(0, 12, W, 22, '#5a5a78', 181, 3, 5);
  const r = rng(182);
  for (let i = 0; i < 9; i++) {
    const sx = Math.floor(r() * 90);
    const sy = 13 + Math.floor(r() * 18);
    R(sx, sy, 4, 2, '#3e3a56');
  }
  HL(0, W - 1, 12, '#8a84a8');
  chimney(70, 0, 18, '#9a5a4e');
  poly([[8, 40], [40, 4], [72, 40]], '#8aa0c0');
  // weathered blue clapboard with peeling patches
  const peel = (x: number, y: number, w: number, h: number) =>
    R(x, y, w, h, (X: number, Y: number, o: number) => (hash2(X >> 2, Y >> 1, 183) < 0.12 ? '#c8c0b8' : o));
  clap(0, 40, W, GY - 40, '#a8bcd8', '#8aa0c0', '#6a7c9c', 184);
  peel(0, 40, W, GY - 40);
  for (let y = 10; y < 40; y += 4) {
    const half = Math.round((y - 4) * 0.89);
    HL(40 - half + 1, 40 + half - 1, y, '#7a90b0');
  }
  peel(10, 8, 60, 32);
  L(7, 40, 40, 3, '#e8e4dc');
  L(40, 3, 73, 40, '#e8e4dc');
  L(8, 41, 40, 5, '#b8b4ac');
  // attic window, one pane cracked
  R(33, 18, 14, 14, '#e8e4dc');
  glass(34, 19, 12, 12, () => roomA(34, 19, 12, 12, '#c89a6a', 5));
  VL(40, 19, 30, '#e8e4dc');
  HL(34, 45, 25, '#e8e4dc');
  L(42, 20, 45, 24, '#fff8f0');
  // porch roof (sagging slightly)
  for (let x = 0; x < W; x++) {
    const sag = Math.round(Math.sin((x / W) * Math.PI) * 1.5);
    R(x, 46 + sag, 1, 4, x % 3 === 0 ? '#6a6488' : '#5a5478');
    P(x, 46 + sag, '#8a84a8');
  }
  for (let x = 2; x < W - 2; x++) for (let y = 50; y < 55; y++) P(x, y, (X: number, Y: number, o: number) => (dth(X, Y, 12 - (y - 50) * 3) ? shA(o, 0.25) : o));
  // windows either side of the door
  windowA(50, 58, 14, 14, { frame: '#e8e4dc', curtains: '#f0e6d8', seed: 21 });
  windowA(74, 58, 14, 14, { frame: '#e8e4dc', curtains: '#f0e6d8', seed: 22 });
  HL(75, 87, 62, '#fff8f0');
  // door (centre x = 28)
  doorA(22, 58, 12, 26, '#7a4a5a', { frame: '#e8e4dc', step: false });
  // posts
  for (const px of [3, 40, 92]) {
    R(px, 50, 2, GY - 54, '#e8e4dc');
    VL(px + 1, 50, GY - 5, '#b8b4ac');
  }
  // porch floor with the faded painted star
  R(0, GY - 4, W, 4, '#9a8a8a');
  HL(0, W - 1, GY - 4, '#b8a8a8');
  for (let x = 0; x < W; x += 6) VL(x, GY - 3, GY - 1, '#7a6a72');
  const star = ['..#..', '.###.', '#####', '.###.', '.#.#.'];
  star.forEach((row, yy) => [...row].forEach((ch, xx) => {
    if (ch === '#') R(42 + xx * 2, GY - 4 + Math.floor(yy * 0.8), 2, 1, mix('#f4b63f', '#9a8a8a', 0.4));
  }));
  // rocking chair on the porch
  rocker(8, GY - 17, '#8a6a5a');
  // overgrown planters
  for (const px of [44, 66]) {
    R(px, GY - 10, 8, 6, '#a8704f');
    HL(px, px + 7, GY - 10, '#c88a5a');
    for (let k = 0; k < 6; k++) L(px + 1 + k, GY - 10, px + k + (k % 2 ? 2 : -1), GY - 16 - (k % 3) * 2, k % 2 ? '#6a8a4a' : '#8aa858');
  }
  // vine creeping up the corner post
  for (let y = 50; y < GY - 4; y += 2) {
    P(93 + ((y >> 1) % 2), y, '#5a8a4a');
    if (y % 6 === 0) P(91, y, '#7aa858');
  }
}
building('b-grandma', {
  w: 96,
  h: 88,
  door: -20,
  draw: drawGrandma,
  shadowTop: 8,
  label: "Grandma's house",
  solid: { x: -48, y: -60, w: 96, h: 60 },
  lights: [
    [40, 25, 12, WARM],
    [57, 65, 14, WARM],
    [81, 65, 14, WARM],
  ],
  anims: [{ fps: 3, frames: 4, rect: [68, -12, 16, 14], rel: true, draw: (f, _p, ox, oy) => puff(73 + ox, -1 + oy, f) }],
  pad: [0, 12, 10, 4],
});

// ---------------------------------------------------------------- tool shed
function drawShed(): void {
  const W = 48;
  const GY = 48;
  shingles(0, 2, W, 14, '#6a6488', 191, 3, 4);
  HL(0, W - 1, 2, '#9a94b8');
  poly([[6, 20], [24, 6], [42, 20]], '#b44a42');
  boards(0, 18, W, GY - 18, '#d0644e', '#b44a42', '#86324a', 192, 4);
  R(0, 18, W, 2, '#fbefd2');
  L(5, 20, 24, 5, '#fbefd2');
  L(24, 5, 43, 20, '#fbefd2');
  // little window in the gable
  R(20, 10, 8, 6, '#fbefd2');
  glass(21, 11, 6, 4, () => R(21, 11, 6, 4, '#5a4a6e'));
  // double doors (centre x = 24)
  R(13, 24, 22, GY - 24, '#fbefd2');
  for (const ox of [14, 24]) {
    boards(ox, 25, 10, GY - 25, '#d65a48', '#b93e3e', '#8a2c44', ox, 4);
    L(ox + 1, 26, ox + 8, GY - 2, '#fbefd2');
    box(ox, 25, 10, GY - 25, '#fbefd2');
  }
  R(22, 34, 1, 3, '#4a3550');
  R(25, 34, 1, 3, '#4a3550');
  // tools hanging outside
  L(4, GY - 2, 6, 22, '#c88a5a');
  R(3, 21, 5, 2, '#9a92b0');
  L(42, GY - 2, 44, 24, '#c88a5a');
  for (let k = 0; k < 4; k++) VL(41 + k, 22, 24, '#9a92b0');
  R(0, GY - 2, W, 2, '#9a8a8a');
}
building('b-shed', {
  w: 48,
  h: 48,
  door: 0,
  draw: drawShed,
  shadowTop: 4,
  solid: { x: -24, y: -32, w: 48, h: 32 },
  label: 'Tool shed',
});

// =====================================================================
//  Gas station (Dex's workplace)  112 x 72, door +32
// =====================================================================
function gasPump(x: number, y: number, body: Color, trim: Color): void {
  // vintage pump: rounded top, glowing globe, dial face, hose
  circ(x + 5, y + 2, 3, '#fff4dc');
  circ(x + 5, y + 2, 2, mix(body, '#ffffff', 0.4));
  T('G', x + 4, y, body, FT, {});
  R(x + 4, y + 5, 3, 2, '#c8c4d8');
  RR(x, y + 7, 11, 18, 3, body);
  VL(x, y + 9, y + 23, liA(body, 0.35));
  VL(x + 10, y + 9, y + 23, shA(body, 0.35));
  R(x + 2, y + 9, 7, 6, '#fff8ee');
  box(x + 2, y + 9, 7, 6, trim);
  HL(x + 3, x + 7, y + 11, '#3a3048');
  P(x + 5, y + 13, '#d8434b');
  HL(x + 1, x + 9, y + 17, trim);
  R(x + 1, y + 25, 9, 2, '#6a6488');
  // nozzle holstered on the side + hose loop
  R(x + 11, y + 12, 2, 4, '#3a3048');
  curve(x + 12, y + 16, x + 9, y + 25, 3, '#2b2140');
}
function drawGasStation(): void {
  const W = 112;
  const GY = 72;
  // --- the shop on the right (x 62..112)
  flatRoof(62, 10, 50, 8, 201);
  vent(100, 11);
  R(62, 18, 50, GY - 18, (x: number, y: number) => {
    const n = hash2(x, y, 202);
    return n < 0.05 ? '#fff6e6' : n > 0.96 ? '#e0d4c4' : '#f4ead8';
  });
  R(62, 18, 50, 4, '#3f9a92');
  HL(62, 111, 18, '#6ac0b0');
  R(W - 4, 22, 4, GY - 22, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.15) : o));
  // BAIT sign with a fish, over the coolers
  RRB(88, 24, 22, 10, 2, '#2f6a74', '#fff4dc');
  T('BAIT', 90, 26, '#2f6a74', FT, {});
  ell(106, 28, 2.5, 1.5, '#5ab0e0');
  P(103, 27, '#5ab0e0');
  P(103, 29, '#5ab0e0');
  P(107, 27, AK);
  // window full of snacks
  R(65, 37, 16, 18, '#3f9a92');
  glass(66, 38, 14, 16, () => {
    R(66, 38, 14, 16, '#f6e6c8');
    for (let r = 0; r < 3; r++) {
      HL(66, 79, 43 + r * 5, '#c8a888');
      for (let k = 0; k < 5; k++) R(67 + k * 3, 40 + r * 5, 2, 3, ['#d8434b', '#f4b63f', '#3f9a92', '#9a6ad0', '#ff94b4'][(k + r) % 5]);
    }
  });
  RR(64, 25, 24, 8, 1, '#2f2440');
  neon('SNACKS', 65, 26, '#fff4e6', '#ff8a4a', FT, {});
  // door (centre x = 88)
  doorA(82, 44, 12, 28, '#3f9a92', { glass: true, frame: '#fff4dc' });
  RR(83, 56, 10, 7, 1, '#fff4dc');
  T('HI', 85, 57, '#d8434b', FT, {});
  // ice chest + soda cooler
  R(97, GY - 14, 12, 14, '#e8f0f8');
  box(97, GY - 14, 12, 14, '#5a8ac8');
  T('ICE', 98, GY - 11, '#3a6ab0', FT, {});
  HL(97, 108, GY - 14, '#ffffff');
  R(96, 37, 14, 10, '#d8434b');
  R(97, 38, 12, 7, '#ff9a90');
  T('POP', 97, 39, '#fff4e6', FT, {});
  // --- canopy over the pumps (x 0..62)
  R(0, 10, 64, 4, '#6a6488');
  HL(0, 63, 10, '#9a94b8');
  R(0, 14, 64, 10, (x: number, y: number) => (y === 14 ? '#ffffff' : Math.floor(x / 4) % 2 ? '#fbf0e4' : '#d8434b'));
  R(2, 15, 60, 8, '#fbf0e4');
  HL(2, 61, 23, '#b8a8b0');
  T('GAS', 4, 17, '#d8434b', FT, {});
  P(17, 19, '#3f9a92');
  T('BAIT', 21, 17, '#2f6a74', FT, {});
  P(38, 19, '#3f9a92');
  T('SNACKS', 41, 17, '#d8434b', FT, {});
  // under-canopy lights
  for (const lx of [12, 32, 52]) {
    R(lx - 2, 24, 5, 1, '#fff8d8');
    for (let k = 1; k < 4; k++) for (let d = -k - 1; d <= k + 1; d++) P(lx + d, 24 + k, (a: number, b: number, o: number) => (o && dth(a, b, 5 - k) ? mix(o, '#fff4c8', 0.3) : o));
  }
  // posts
  for (const px of [3, 57]) {
    R(px, 24, 4, GY - 24, '#e8e4f0');
    VL(px, 24, GY - 1, '#ffffff');
    VL(px + 3, 24, GY - 1, '#a8a0c0');
    R(px - 1, GY - 3, 6, 3, '#c8c4d8');
  }
  // pump island and two vintage pumps
  RR(10, GY - 6, 44, 6, 2, '#d8d0d4');
  HL(11, 52, GY - 6, '#f4eef0');
  HL(10, 53, GY - 1, '#a8a0a8');
  gasPump(14, GY - 32, '#d8434b', '#8a2c44');
  gasPump(36, GY - 32, '#3f9a92', '#2f6a74');
  // price board on the post
  R(58, 34, 10, 12, '#3a3048');
  T('$1', 59, 35, '#ffd34a', FT, {});
  T('09', 59, 41, '#ffd34a', FT, {});
}
building('b-gasstation', {
  w: 112,
  h: 72,
  door: 32,
  draw: drawGasStation,
  label: 'Gas Station',
  solid: { x: 6, y: -52, w: 50, h: 52 },
  shadow: (ox, oy) => {
    // soft shade under the canopy, and the shop's cast shadow
    for (let y = oy + 24; y < oy + 72; y++) for (let x = ox; x < ox + 62; x++) if (dth(x, y, 6)) P(x, y, SH2);
    bShadow(ox + 62, oy, 50, 72, 10);
  },
  lights: [
    [12, 30, 22, '#fff4d0'],
    [32, 30, 22, '#fff4d0'],
    [52, 30, 22, '#fff4d0'],
    [73, 46, 14, WARM],
    [88, 52, 12, WARM],
    [76, 29, 12, '#ff8a4a'],
    [19, 34, 6, '#ffffff'],
    [41, 34, 6, '#ffffff'],
  ],
});

// =====================================================================
//  Sweet Lou's Airstream  72 x 40, door +18
// =====================================================================
function airLights(f: number): void {
  bulbs([[34, 13], [52, 15, 2], [70, 13, 2]], f, 4, '#4a3550', 4);
}
function drawAirstream(): void {
  // fishing rods leaning on the back end
  L(2, 38, 8, 2, '#c8a070');
  L(4, 38, 12, 4, '#a88050');
  curve(8, 2, 14, 18, 4, '#e8e4f0');
  // hitch
  R(0, 30, 6, 2, '#6a6488');
  R(0, 32, 2, 6, '#6a6488');
  // the aluminium body (rounded loaf)
  RR(4, 4, 64, 30, 10, '#c8ccdc');
  R(4, 4, 64, 30, (x: number, y: number, o: number) => {
    if (!o) return null;
    const v = (y - 4) / 30;
    // bright band of reflected sky near the top, dark band near the belly
    if (v < 0.12) return '#f4f6fc';
    if (v < 0.28) return '#e2e6f2';
    if (v > 0.82) return '#8a8eac';
    if (v > 0.7) return '#a8acc4';
    return x % 9 === 0 ? '#b8bcd0' : '#c8ccdc';
  });
  // rivet seams
  for (const sy of [10, 20, 28]) for (let x = 8; x < 64; x += 3) P(x, sy, '#9a9eb8');
  // windows
  for (const wx of [12, 24]) {
    RR(wx - 1, 11, 10, 7, 2, '#7a7e9a');
    glass(wx, 12, 8, 5, () => roomA(wx, 12, 8, 5, '#f2c890', wx));
  }
  // door (centre x = 54)
  RR(48, 12, 12, 21, 2, '#7a7e9a');
  RR(49, 13, 10, 20, 2, '#d8dcea');
  glass(51, 15, 6, 5, () => roomA(51, 15, 6, 5, '#f2c890', 2));
  R(57, 23, 2, 2, '#f4b63f');
  R(47, 33, 14, 2, '#9a94b0');
  HL(47, 60, 33, '#c8c4d8');
  // striped awning over the door, poles out front
  for (let x = 32; x < 70; x++) {
    const c = Math.floor((x - 32) / 4) % 2 ? '#fbf0e4' : '#3f9a92';
    VL(x, 8, 12, c);
    P(x, 8, liA(c, 0.4));
    if ((x - 32) % 4 > 0 && (x - 32) % 4 < 3) P(x, 13, c);
  }
  VL(33, 13, 38, '#8a84a0');
  VL(69, 13, 38, '#8a84a0');
  // wheel
  R(20, 31, 16, 3, '#6a6e8a');
  circ(28, 34, 4.5, '#3a3048');
  circ(28, 34, 2.5, '#9a9eb8');
  P(28, 34, '#e8ecf6');
  // lawn chair (webbed) and a cooler
  R(37, 28, 8, 1, '#3f9a92');
  for (let y = 24; y < 30; y += 2) HL(38, 43, y, '#f4b63f');
  VL(38, 24, 30, '#c8c4d8');
  VL(43, 24, 30, '#c8c4d8');
  L(37, 30, 44, 37, '#c8c4d8');
  L(44, 30, 37, 37, '#c8c4d8');
  R(62, 32, 8, 6, '#d8434b');
  R(62, 32, 8, 2, '#fbf0e4');
  airLights(0);
}
building('airstream', {
  w: 72,
  h: 40,
  door: 18,
  draw: drawAirstream,
  label: "Sweet Lou's Airstream",
  solid: { x: -32, y: -26, w: 66, h: 26 },
  shadow: (ox, oy) => {
    shadowEll(ox + 38, oy + 36, 34, 4);
  },
  anims: [{ fps: 3, frames: 4, rect: [32, 12, 40, 6], draw: (f) => airLights(f) }],
  lights: [
    [16, 15, 10, WARM],
    [28, 15, 10, WARM],
    [54, 18, 10, WARM],
    [44, 16, 16, '#ffd77a'],
    [62, 16, 16, '#ffd77a'],
  ],
});

// =====================================================================
//  Bus stop  48 x 40
// =====================================================================
function drawBusStop(): void {
  // roof
  R(2, 2, 40, 4, '#3f9a92');
  HL(2, 41, 2, '#6ac0b0');
  HL(2, 41, 5, '#2f6a74');
  // back panel (glass with a show poster)
  R(4, 6, 36, 22, '#a8d0d8');
  R(4, 6, 36, 22, (x: number, y: number, o: number) => ((x + y) % 11 === 0 ? '#d8f0f4' : o));
  R(6, 8, 12, 17, '#fbefd8');
  R(6, 8, 12, 5, '#3f8a86');
  T('ACW', 7, 9, '#fff4dc', FT, { ls: -1 });
  circ(12, 17, 2, '#5e2f58');
  R(10, 19, 5, 5, '#5e2f58');
  // frame posts
  for (const px of [3, 40]) {
    R(px, 6, 2, 30, '#2f6a74');
    VL(px, 6, 35, '#5aa39a');
  }
  // bench
  R(8, 26, 30, 3, '#c88a5a');
  HL(8, 37, 26, '#e8b078');
  R(10, 29, 2, 6, '#6e4a3a');
  R(34, 29, 2, 6, '#6e4a3a');
  // route sign pole
  VL(45, 4, 39, '#8a84a0');
  VL(46, 4, 39, '#5e5878');
  RR(42, 0, 6, 9, 2, '#d8434b');
  T('B', 44, 2, '#fff4e6', FT, {});
  R(41, 10, 7, 5, '#fbf0e4');
  T('7', 43, 10, '#2f6a74', FT, {});
}
building('bus-stop', {
  w: 48,
  h: 40,
  draw: drawBusStop,
  label: 'Bus stop',
  solid: { x: -22, y: -16, w: 40, h: 6 },
  shadow: (ox, oy) => {
    for (let y = oy + 8; y < oy + 36; y++) for (let x = ox + 4; x < ox + 46; x++) if (dth(x, y, 5)) P(x, y, SH2);
    R(ox + 4, oy + 38, 40, 2, SH1);
  },
});

// =====================================================================
//  The water tower shaped like a ring turnbuckle  48 x 112
// =====================================================================
function drawWaterTower(): void {
  const cx = 24;
  // legs + bracing
  const legs: [number, number, number, number][] = [
    [8, 50, 3, 110],
    [17, 50, 13, 110],
    [31, 50, 35, 110],
    [40, 50, 45, 110],
  ];
  for (const [x0, y0, x1, y1] of legs) {
    L(x0, y0, x1, y1, '#6a5a7a');
    L(x0 + 1, y0, x1 + 1, y1, '#8a7a9a');
  }
  for (let y = 58; y < 104; y += 12) {
    const sp = (y - 50) / 60;
    const xl = 8 - sp * 5;
    const xr = 41 + sp * 5;
    L(xl, y, xr, y + 10, '#5a4a6a');
    L(xr, y, xl, y + 10, '#5a4a6a');
    HL(Math.round(xl), Math.round(xr), y, '#7a6a8a');
  }
  // ladder up one leg
  for (let y = 54; y < 108; y += 3) HL(30, 33, y, '#9a8aaa');
  VL(30, 52, 108, '#7a6a8a');
  VL(33, 52, 108, '#7a6a8a');
  // footings
  for (const fx of [2, 12, 34, 44]) R(fx - 1, 108, 5, 4, '#a89cb4');
  // catwalk ring
  R(4, 48, 40, 3, '#5a4a6a');
  HL(4, 43, 48, '#8a7a9a');
  for (let x = 4; x < 44; x += 4) VL(x, 44, 48, '#7a6a8a');
  HL(4, 43, 44, '#8a7a9a');
  // the post through the pad, with a cap
  R(cx - 3, 0, 6, 16, '#c8c0d8');
  VL(cx - 3, 0, 15, '#eeeaf6');
  VL(cx + 2, 0, 15, '#8a80a0');
  RR(cx - 4, 0, 8, 3, 1, '#eeeaf6');
  // the padded tank: a giant turnbuckle cushion
  RR(cx - 18, 10, 36, 36, 6, '#d0414c');
  RR(cx - 18, 10, 12, 36, 5, '#e06a64');
  R(cx + 10, 14, 7, 28, '#9a2c48');
  R(cx - 18, 10, 36, 36, (x: number, y: number, o: number) => (o && dth(x, y, 3) && y < 14 ? liA(o, 0.3) : o));
  for (const sy of [19, 28, 37]) {
    HL(cx - 17, cx + 16, sy, '#8a2440');
    for (let x = cx - 16; x <= cx + 16; x += 2) P(x, sy - 1, '#f08a80');
  }
  // the strap bands
  R(cx - 19, 14, 38, 3, '#2f2a40');
  HL(cx - 19, cx + 18, 14, '#4a4460');
  R(cx - 19, 40, 38, 3, '#2f2a40');
  HL(cx - 19, cx + 18, 40, '#4a4460');
  RR(cx - 9, 21, 18, 13, 2, '#fff0d8');
  RR(cx - 8, 22, 16, 11, 1, '#f6e2c4');
  TC('TA', cx, 23, '#c9404c', FM, { bold: true, shadow: '#e8a0a0' });
  // three loose rope ends, red, white and blue
  for (const [ry, c] of [[22, '#e84a5a'], [28, '#f6efe6'], [34, '#5a7ad0']] as [number, string][]) {
    curve(cx - 18, ry, cx - 23, ry + 6, 2, c);
    curve(cx + 17, ry, cx + 22, ry + 6, 2, c);
  }
  // aviation light
  P(cx, 0, '#ff5a5a');
}
building('watertower', {
  w: 48,
  h: 112,
  draw: drawWaterTower,
  label: 'Water tower',
  solid: { x: -12, y: -10, w: 24, h: 10 },
  shadow: (ox, oy) => {
    poly([[ox + 4, oy + 110], [ox + 44, oy + 110], [ox + 60, oy + 116], [ox + 20, oy + 116]], SH2);
    shadowEll(ox + 34, oy + 114, 18, 3);
  },
  pad: [0, 0, 18, 6],
  anims: [{ fps: 1.2, frames: 2, rect: [22, 0, 5, 3], skip: (f) => f === 1, draw: () => {
    P(24, 0, '#fff0e8');
    P(23, 0, '#ff8a80');
    P(25, 0, '#ff8a80');
  } }],
  lights: [[24, 0, 10, '#ff4a50'], [24, 28, 26, '#ffd890']],
});

// =====================================================================
//  WRSL radio tower  24 x 120
// =====================================================================
function drawRadioTower(): void {
  const cx = 12;
  const top = 6;
  const bot = 112;
  const half = (y: number) => 1.5 + ((y - top) / (bot - top)) * 7.5;
  for (let y = top; y <= bot; y++) {
    const h = half(y);
    const seg = Math.floor((y - top) / 13) % 2;
    const c = seg ? '#fbf0e4' : '#d8434b';
    const cd = seg ? '#c8b8c0' : '#9a2c44';
    P(Math.round(cx - h), y, c);
    P(Math.round(cx + h), y, cd);
  }
  for (let y = top + 4; y < bot; y += 6) {
    const h0 = half(y);
    const h1 = half(y + 6);
    const seg = Math.floor((y - top) / 13) % 2;
    const c = seg ? '#e8dcd8' : '#b83a48';
    L(cx - h0, y, cx + h1, y + 6, c);
    L(cx + h0, y, cx - h1, y + 6, c);
    HL(Math.round(cx - h0), Math.round(cx + h0), y, c);
  }
  VL(cx, 0, top, '#c8c4d8');
  // little platforms
  for (const py of [40, 80]) {
    const h = half(py) + 2;
    HL(Math.round(cx - h), Math.round(cx + h), py, '#5a5a7a');
  }
  // base block
  R(cx - 7, bot, 14, 8, '#b8b0c0');
  HL(cx - 7, cx + 6, bot, '#e0d8e4');
  VL(cx + 6, bot, bot + 7, '#8a8096');
  RR(cx - 5, bot + 2, 6, 4, 1, '#d8434b');
  P(cx - 3, bot + 3, '#fff4e6');
  P(cx, 0, '#ff5a5a');
}
building('radio-tower', {
  w: 24,
  h: 120,
  draw: drawRadioTower,
  label: 'Radio tower',
  solid: { x: -6, y: -8, w: 12, h: 8 },
  shadow: (ox, oy) => {
    poly([[ox + 6, oy + 118], [ox + 18, oy + 118], [ox + 34, oy + 122], [ox + 22, oy + 122]], SH2);
    R(ox + 5, oy + 120, 16, 2, SH1);
  },
  pad: [0, 0, 14, 4],
  anims: [{ fps: 1.5, frames: 2, rect: [10, 0, 5, 3], skip: (f) => f === 1, draw: () => {
    P(12, 0, '#fff0e8');
    P(11, 0, '#ff8a80');
    P(13, 0, '#ff8a80');
  } }],
  lights: [[12, 0, 10, '#ff4a50'], [12, 40, 5, '#ff4a50']],
});

// =====================================================================
//  Town gazebo  64 x 56
// =====================================================================
function drawGazebo(): void {
  const cx = 32;
  // floor platform (front edge visible) + steps at the front centre
  ell(cx, 46, 30, 8, '#e8dcd4');
  ell(cx, 45, 29, 7, '#f6eee8');
  R(2, 46, 60, 6, '#d8ccc8');
  ell(cx, 51, 30, 4, '#c8b8bc');
  for (let x = 4; x < 60; x += 4) VL(x, 47, 53, '#b8a8b0');
  for (let k = 0; k < 2; k++) {
    R(cx - 8, 50 + k * 3, 16, 3, k ? '#d8ccc8' : '#ece4e0');
    HL(cx - 8, cx + 7, 50 + k * 3, '#ffffff');
  }
  // back railing (seen through)
  HL(8, 56, 36, '#e8e0dc');
  for (let x = 9; x < 56; x += 3) VL(x, 37, 43, '#ddd4d4');
  // posts
  for (const px of [3, 14, 26, 37, 49, 59]) {
    R(px, 18, 3, 30, '#ffffff');
    VL(px + 2, 19, 47, '#c8bcc8');
  }
  // front railings with balusters, gap in the middle for the entrance
  for (const [x0, x1] of [[4, 24], [40, 60]] as [number, number][]) {
    HL(x0, x1, 38, '#ffffff');
    HL(x0, x1, 39, '#d8d0d4');
    for (let x = x0 + 1; x < x1; x += 2) VL(x, 40, 46, '#f4eef0');
    HL(x0, x1, 46, '#d8d0d4');
  }
  // octagonal roof in teal shingles with a finial
  poly([[0, 20], [10, 8], [24, 2], [40, 2], [54, 8], [64, 20]], '#3f9a92');
  R(0, 0, 64, 21, (x: number, y: number, o: number) => {
    if (o !== col('#3f9a92')) return null;
    const row = Math.floor(y / 3);
    const lit = x < 30;
    const c = lit ? '#4fb0a4' : '#2f7a76';
    if (y % 3 === 2) return shA(c, 0.25);
    if ((x + (row % 2) * 2) % 4 === 0) return shA(c, 0.15);
    return c;
  });
  L(0, 20, 10, 8, '#7fd0c0');
  L(10, 8, 24, 2, '#7fd0c0');
  HL(0, 63, 20, '#fbf0e4');
  HL(0, 63, 21, '#d8c8c8');
  VL(32, -0, 3, '#f4b63f');
  R(31, 0, 3, 2, '#f4b63f');
  // bunting swags along the eaves
  const cs = ['#d8434b', '#fbf0e4', '#4a6ad0'];
  for (let i = 0; i < 4; i++) {
    const x0 = 2 + i * 15;
    curve(x0, 22, x0 + 15, 22, 4, '#8a7a9a', (x, y, _t, k) => {
      if (k % 3 === 0) {
        const c = cs[(k / 3 + i) % 3];
        P(x, y + 1, c);
        P(x, y + 2, c);
        P(x + 1, y + 1, c);
      }
    });
  }
}
building('gazebo', {
  w: 64,
  h: 56,
  draw: drawGazebo,
  label: 'Gazebo',
  // One solid rect only: the back railing, so the gazebo can be walked into from the front.
  solid: { x: -30, y: -22, w: 60, h: 6 },
  shadow: (ox, oy) => shadowEll(ox + 36, oy + 50, 32, 7),
  lights: [[32, 30, 30, '#ffe6a8']],
});

// =====================================================================
//  The Velvet Hammers mural (alley wall)  64 x 48
// =====================================================================
function hammer(x: number, y: number, flip: boolean, suit: Color, suitD: Color, hair: Color, hairD: Color): void {
  // an 80s lady wrestler, one arm raised to the belt, big permed hair
  const fx = (dx: number) => (flip ? x - dx : x + dx);
  const R2 = (dx: number, dy: number, w: number, h: number, c: Color) => R(flip ? x - dx - w + 1 : x + dx, y + dy, w, h, c);
  // big hair
  ell(fx(5), y + 4, 6, 5, hair);
  ell(fx(7), y + 6, 4, 4, hairD);
  // face
  RR(flip ? x - 7 : x + 3, y + 3, 5, 6, 2, '#f2c4a0');
  P(fx(5), y + 5, AK);
  R2(2, 3, 7, 1, '#ff5d8f'); // headband
  // raised arm toward the belt
  L(fx(7), y + 10, fx(12), y - 2, '#f2c4a0');
  L(fx(8), y + 10, fx(13), y - 2, '#f2c4a0');
  // shoulder-padded leotard
  R2(1, 9, 9, 10, suit);
  R2(0, 9, 3, 3, suitD);
  R2(8, 9, 3, 3, suitD);
  R2(1, 16, 9, 3, suitD);
  for (let k = 0; k < 6; k++) P(fx(2 + ((k * 3) % 7)), y + 10 + ((k * 5) % 7), '#fff8e0');
  // other arm flexing down
  L(fx(1), y + 10, fx(-2), y + 16, '#f2c4a0');
  // legs + legwarmers + boots
  R2(2, 19, 3, 6, '#f2c4a0');
  R2(6, 19, 3, 6, '#f2c4a0');
  R2(2, 23, 3, 3, '#ffe070');
  R2(6, 23, 3, 3, '#ffe070');
  R2(1, 26, 4, 2, '#fbf0e4');
  R2(6, 26, 4, 2, '#fbf0e4');
}
function drawMural(): void {
  const W = 64;
  const H = 48;
  // brick wall with a coping
  brick(0, 2, W, H - 2, '#a85048', '#924442', '#6a3444', 241);
  R(0, 0, W, 3, '#c8b8b8');
  HL(0, W - 1, 0, '#e8dcdc');
  // painted panel: dithered golden-hour sky
  clip(3, 5, 58, 38);
  VG(3, 5, 58, 38, ['#5a5f9f', '#907fbb', '#dc9bab', '#f8c393', '#fde6b4'], 0.6);
  circ(32, 22, 9, '#fff0c6');
  for (let k = 0; k < 8; k++) L(32, 22, 32 + Math.cos(k * 0.785) * 30, 22 + Math.sin(k * 0.785) * 30, over('#fff4d0', 0.25));
  // a ring rope across the bottom
  HL(3, 60, 36, '#e84a5a');
  HL(3, 60, 39, '#f6efe6');
  HL(3, 60, 42, '#5a7ad0');
  noclip();
  // the two Velvet Hammers raising the belt together
  hammer(8, 13, false, '#ff5d8f', '#c8307a', '#ffd870', '#e0a840');
  hammer(55, 13, true, '#2fa59a', '#1f6e6a', '#7a3a4a', '#5a2a3a');
  // the championship belt held up between them
  RR(20, 8, 24, 6, 2, '#a8602a');
  RR(26, 6, 12, 10, 3, '#ffd34a');
  RR(28, 8, 8, 6, 2, '#f4b63f');
  P(32, 10, '#d8434b');
  P(29, 7, '#fff8d0');
  // title painted along the top
  TC('VELVET HAMMERS', 32, 6, '#fff4dc', FT, { shadow: '#5a2448' });
  // paint flecks and a little graffiti heart
  P(5, 44, '#ff5d8f');
  P(58, 45, '#ffd34a');
  R(50, 2, 3, 1, '#c8b8b8');
}
building('mural', {
  w: 64,
  h: 48,
  draw: drawMural,
  label: 'The Velvet Hammers',
  solid: { x: -32, y: -8, w: 64, h: 8 },
  shadowTop: 2,
  lights: [],
});

// =====================================================================
//  Carnival tent  64 x 56, door 0
// =====================================================================
const TENT_COLS: Record<string, [string, string]> = { red: ['#d8434b', '#9a2c44'], teal: ['#2fa59a', '#1f6e6a'], purple: ['#8a5ac8', '#5a3a8a'] };
function tentFlag(f: number, c: Color): void {
  for (let xx = 0; xx < 8; xx++) {
    const off = Math.round(Math.sin(xx * 0.8 - f * 1.7) * (xx / 8) * 1.4);
    for (let yy = 0; yy < 4 - (xx > 5 ? 1 : 0); yy++) P(33 + xx, 1 + yy + off, yy === 0 ? liA(c, 0.3) : c);
  }
}
function drawTent(p: Props): void {
  const [c1, c2] = TENT_COLS[String(p.color ?? 'red')] ?? TENT_COLS.red;
  const cream = '#fbf0e4';
  const cx = 32;
  // flag pole
  VL(cx, 0, 10, '#6a5a7a');
  // conical big-top roof with radiating stripes
  poly([[2, 26], [cx, 8], [62, 26]], c1);
  R(0, 6, 64, 21, (x: number, y: number, o: number) => {
    if (!o) return null;
    const a = Math.atan2(x + 0.5 - cx, y + 0.5 - 8);
    const st = Math.floor((a + Math.PI) / 0.22) % 2;
    let c = st ? cream : c1;
    if (x > cx) c = st ? '#e8dcd0' : c2;
    return c;
  });
  // scalloped valance
  for (let x = 2; x < 62; x++) {
    const st = Math.floor((x - 2) / 5) % 2;
    const c = st ? cream : c1;
    VL(x, 26, 29, c);
    const k = (x - 2) % 5;
    if (k > 0 && k < 4) P(x, 30, c);
    if (k === 2) P(x, 31, c);
  }
  HL(2, 61, 26, '#f4b63f');
  // walls with vertical stripes
  for (let x = 4; x < 60; x++) {
    const st = Math.floor((x - 4) / 6) % 2;
    let c = st ? cream : c1;
    if (x > 46) c = st ? '#e0d4c8' : c2;
    VL(x, 31, 55, c);
  }
  for (let x = 4; x < 60; x++) for (let y = 31; y < 35; y++) P(x, y, (X: number, Y: number, o: number) => (dth(X, Y, 12 - (y - 31) * 3) ? shA(o, 0.25) : o));
  // the entrance: flaps tied back, warm glow inside (centre x = 32)
  poly([[cx - 9, 55], [cx - 4, 33], [cx + 4, 33], [cx + 9, 55]], '#3a2440');
  poly([[cx - 6, 55], [cx - 2, 38], [cx + 2, 38], [cx + 6, 55]], '#7a4a4a');
  for (let y = 40; y < 55; y++) for (let x = cx - 6; x <= cx + 6; x++) P(x, y, (X: number, Y: number, o: number) => (o === col('#7a4a4a') && dth(X, Y, 6) ? '#f2a85a' : o));
  poly([[cx - 10, 33], [cx - 4, 33], [cx - 9, 46], [cx - 12, 55], [cx - 10, 55]], c1);
  poly([[cx + 4, 33], [cx + 10, 33], [cx + 10, 55], [cx + 12, 55], [cx + 9, 46]], c2);
  R(cx - 11, 45, 3, 2, '#f4b63f');
  R(cx + 8, 45, 3, 2, '#f4b63f');
  // stakes and ropes
  L(4, 31, 0, 55, '#c8b8a0');
  L(59, 31, 63, 55, '#c8b8a0');
  tentFlag(0, c1);
}
building('tent', {
  w: 64,
  h: 56,
  door: 0,
  draw: drawTent,
  vkey: (p) => String(p.color ?? 'red'),
  label: 'Tent',
  shadowTop: 14,
  solid: { x: -28, y: -24, w: 56, h: 24 },
  anims: [{ fps: 5, frames: 4, rect: [32, 0, 10, 7], draw: (f, p) => tentFlag(f, (TENT_COLS[String(p.color ?? 'red')] ?? TENT_COLS.red)[0]) }],
  lights: [[32, 46, 18, WARM], [32, 26, 30, '#ffd890']],
});

// =====================================================================
//  Wanda's bear pen  80 x 48
// =====================================================================
function fenceRun(x0: number, x1: number, y: number, h: number): void {
  for (let x = x0; x <= x1; x += 8) {
    R(x, y - h, 3, h + 2, '#a8704f');
    VL(x, y - h, y + 1, '#c88a5a');
    VL(x + 2, y - h, y + 1, '#7a4a3a');
    P(x + 1, y - h, '#e8b078');
  }
  for (const ry of [y - h + 2, y - 2]) {
    HL(x0, x1 + 2, ry, '#c88a5a');
    HL(x0, x1 + 2, ry + 1, '#8a5a44');
  }
}
function drawBearPen(): void {
  // the back fence (low, so Wanda's head clears it)
  fenceRun(2, 74, 10, 7);
  // hay bale, honey pot, a tire swing on a post
  R(8, 12, 16, 9, '#e8c070');
  for (let x = 8; x < 24; x += 2) VL(x, 12, 20, '#d0a050');
  HL(8, 23, 12, '#f8dc90');
  VL(12, 12, 20, '#a87838');
  VL(19, 12, 20, '#a87838');
  RR(58, 12, 10, 9, 3, '#c8704f');
  R(59, 11, 8, 2, '#ffd34a');
  T('H', 61, 14, '#fff4dc', FT, {});
  P(66, 13, '#ffb030');
  P(66, 14, '#ffb030');
  // side fences (receding)
  for (const sx of [2, 76]) {
    for (let y = 10; y <= 44; y += 8) {
      R(sx, y - 7, 3, 8, '#a8704f');
      VL(sx, y - 7, y, '#c88a5a');
    }
    VL(sx + 1, 4, 44, '#8a5a44');
  }
  // front fence with a sign, a gap-less gate
  fenceRun(2, 74, 46, 9);
  RR(26, 31, 28, 9, 1, '#fbf0d8');
  box(26, 31, 28, 9, '#7a4a3a');
  TC('WANDA', 40, 33, '#7a4a3a', FT, {});
  P(29, 34, '#ffb030');
  P(51, 34, '#ffb030');
}
building('bear-pen', {
  w: 80,
  h: 48,
  draw: drawBearPen,
  label: "Wanda's pen",
  // One rect only: the whole pen is fenced off (Wanda is an NPC inside).
  solid: { x: -40, y: -40, w: 80, h: 40 },
  shadow: (ox, oy) => {
    R(ox + 2, oy + 48, 78, 2, SH1);
    R(ox + 78, oy + 4, 3, 44, SH2);
  },
});

// =====================================================================
//  Test-your-strength tower  24 x 64
// =====================================================================
function drawStrongman(): void {
  const cx = 12;
  // the bell on top
  RR(cx - 5, 0, 10, 7, 3, '#ffd34a');
  HL(cx - 4, cx + 3, 0, '#fff0a0');
  VL(cx + 4, 2, 6, '#c88a2a');
  P(cx, 7, '#c88a2a');
  // the tall board with a painted scale
  R(cx - 6, 8, 12, 46, '#fbf0e4');
  box(cx - 6, 8, 12, 46, '#7a3a7a');
  const bands = ['#d8434b', '#ff8a4a', '#f4b63f', '#a8d060', '#5ab0a0'];
  for (let i = 0; i < 5; i++) {
    R(cx - 5, 9 + i * 9, 3, 9, bands[i]);
    HL(cx - 5, cx - 3, 9 + i * 9, liA(bands[i], 0.4));
  }
  // rail and puck
  VL(cx + 1, 9, 52, '#8a84a0');
  VL(cx + 2, 9, 52, '#c8c4d8');
  RR(cx, 40, 4, 3, 1, '#d8434b');
  T('MAX', cx - 1, 10, '#7a3a7a', FT, { ls: -1 });
  // the base: striking pad + sign
  R(cx - 9, 54, 18, 10, '#7a3a7a');
  HL(cx - 9, cx + 8, 54, '#a85aa8');
  RR(cx - 4, 51, 8, 3, 1, '#2b2140');
  HL(cx - 3, cx + 2, 51, '#5a4a6a');
  T('TRY', cx - 6, 56, '#ffd34a', FT, {});
  // mallet leaning against it
  L(cx + 10, 63, cx + 8, 46, '#c88a5a');
  R(cx + 5, 43, 7, 4, '#a8704f');
  HL(cx + 5, cx + 11, 43, '#d8a070');
}
building('strongman', {
  w: 24,
  h: 64,
  draw: drawStrongman,
  label: 'Test your strength',
  solid: { x: -10, y: -10, w: 20, h: 10 },
  shadow: (ox, oy) => {
    poly([[ox + 2, oy + 63], [ox + 22, oy + 63], [ox + 32, oy + 66], [ox + 12, oy + 66]], SH2);
    R(ox + 3, oy + 64, 20, 2, SH1);
  },
  pad: [0, 0, 12, 4],
  lights: [[12, 4, 12, '#ffe08a']],
});

// =====================================================================
//  Fairgrounds stage  96 x 56
// =====================================================================
function drawFairStage(): void {
  const W = 96;
  // backdrop wall with painted stars
  R(6, 6, W - 12, 30, '#3a3478');
  for (let x = 6; x < W - 6; x += 8) VL(x, 6, 35, '#332e6c');
  for (const [sx, sy] of [[14, 12], [30, 20], [70, 14], [84, 22], [48, 10], [22, 28], [76, 30]] as [number, number][]) {
    P(sx, sy, '#fff4c0');
    P(sx - 1, sy, '#f4b63f');
    P(sx + 1, sy, '#f4b63f');
    P(sx, sy - 1, '#f4b63f');
    P(sx, sy + 1, '#f4b63f');
  }
  TC('FAIRGROUNDS', 48, 16, '#ffd34a', FT, { shadow: '#1f1a4a' });
  TC('FURY', 48, 23, '#ff5d8f', FM, { bold: true, shadow: '#1f1a4a' });
  // proscenium frame and roof
  R(0, 2, W, 5, '#d8434b');
  HL(0, W - 1, 2, '#ff8a80');
  HL(0, W - 1, 6, '#8a2c44');
  for (const px of [0, W - 6]) {
    R(px, 2, 6, 38, '#d8434b');
    VL(px, 2, 39, '#ff8a80');
    VL(px + 5, 7, 39, '#8a2c44');
  }
  // bunting
  const cs = ['#d8434b', '#fbf0e4', '#4a6ad0', '#ffd050'];
  for (let i = 0; i < 6; i++) {
    const x0 = 3 + i * 15;
    curve(x0, 7, x0 + 15, 7, 4, '#5a4a6a', (x, y, _t, k) => {
      if (k % 3 === 1) {
        const c = cs[(k + i) % 4];
        for (let d = 0; d < 3; d++) HL(x - 1 + Math.floor(d / 2), x + 1 - Math.floor(d / 2), y + 1 + d, c);
      }
    });
  }
  // stage deck
  R(4, 36, W - 8, 4, '#c88a5a');
  HL(4, W - 5, 36, '#e8b078');
  for (let x = 6; x < W - 6; x += 7) VL(x, 37, 39, '#a8704f');
  // ring-apron skirt
  R(4, 40, W - 8, 14, '#3a3478');
  for (let x = 4; x < W - 4; x += 8) VL(x, 41, 53, '#332e6c');
  HL(4, W - 5, 40, '#f2eef8');
  TC('ACW', 48, 44, '#ffd560', FM, { bold: true });
  for (const sx of [14, 78]) stampRows(['..#..', '.###.', '#####', '.###.', '.#.#.'], { '#': '#f6f0f4' }, sx, 44);
  HL(4, W - 5, 53, '#2a2458');
  // speakers + steps on the right
  for (const sx of [8, 82]) {
    R(sx, 24, 7, 12, '#2b2140');
    circ(sx + 3, 28, 2, '#5a4a6a');
    circ(sx + 3, 33, 1.5, '#5a4a6a');
  }
  for (let k = 0; k < 3; k++) R(W - 4 + 0, 42 + k * 4, 4, 4, ['#c88a5a', '#b87a4a', '#a8704f'][k]);
}
building('fair-stage', {
  w: 96,
  h: 56,
  draw: drawFairStage,
  label: 'Stage',
  solid: { x: -48, y: -22, w: 96, h: 22 },
  shadowTop: 4,
  lights: [[48, 22, 40, '#ffd890'], [20, 8, 12, '#ffd77a'], [76, 8, 12, '#ffd77a']],
});

// =====================================================================
//  Food stand  48 x 48 (variant 0 corn dogs, 1 lemonade, 2 cotton candy)
// =====================================================================
const STAND = [
  { c1: '#d8434b', c2: '#ffd34a', name: 'CORN DOGS' },
  { c1: '#ffd34a', c2: '#fbf0e4', name: 'LEMONADE' },
  { c1: '#ff94b4', c2: '#8ad0e8', name: 'COTTON' },
];
function drawFoodStand(p: Props): void {
  const v = Math.abs(Math.floor(Number(p.variant ?? 0))) % 3;
  const s = STAND[v];
  // giant product on the roof
  if (v === 0) {
    VL(24, 0, 6, '#e8c08a');
    RR(19, 2, 10, 12, 4, '#e8a040');
    VL(20, 4, 11, '#ffc868');
    curve(21, 4, 26, 12, 1, '#d8434b');
  } else if (v === 1) {
    ell(24, 7, 7, 6, '#ffe070');
    ell(22, 5, 3, 2, '#fff4b0');
    P(30, 6, '#c8a030');
    P(31, 5, '#6fb050');
    P(31, 4, '#6fb050');
  } else {
    VL(24, 8, 14, '#fbf0e4');
    ell(24, 6, 7, 6, '#ff94b4');
    ell(22, 4, 4, 3, '#ffc0d4');
    ell(28, 8, 3, 3, '#8ad0e8');
  }
  // striped roof
  for (let x = 2; x < 46; x++) {
    const st = Math.floor((x - 2) / 4) % 2;
    const c = st ? s.c2 : s.c1;
    VL(x, 14, 19, c);
    P(x, 14, liA(c, 0.4));
    if ((x - 2) % 4 > 0 && (x - 2) % 4 < 3) P(x, 20, c);
  }
  // booth body
  R(4, 20, 40, 26, '#fbf0e4');
  R(4, 20, 40, 26, boardPaint('#fff8ee', '#f4e8d8', '#d8c8b8', 251 + v, 5));
  R(4, 21, 40, 3, (x: number, y: number, o: number) => (dth(x, y, 8) ? shA(o, 0.2) : o));
  // serving window
  R(8, 24, 32, 10, '#5a3a4a');
  R(9, 25, 30, 8, '#f2a868');
  for (let k = 0; k < 4; k++) R(11 + k * 7, 28, 3, 5, v === 1 ? '#ffe070' : v === 0 ? '#e8a040' : '#ff94b4');
  R(6, 33, 36, 3, s.c1);
  HL(6, 41, 33, liA(s.c1, 0.4));
  // sign
  R(6, 37, 36, 8, s.c1);
  TC(s.name, 24, 38, v === 1 ? '#8a5a2a' : '#fff4e6', FT, {});
  R(4, 45, 40, 3, '#c8b0a8');
  if (v === 1) {
    // pitcher on the counter
    R(36, 29, 4, 4, '#fff4b0');
    HL(36, 39, 29, '#ffffff');
  }
}
building('food-stand', {
  w: 48,
  h: 48,
  draw: drawFoodStand,
  vkey: (p) => String(Math.abs(Math.floor(Number(p.variant ?? 0))) % 3),
  label: 'Food stand',
  solid: { x: -20, y: -22, w: 40, h: 22 },
  shadowTop: 14,
  lights: [[24, 30, 18, WARM]],
});

// =====================================================================
//  Ferris wheel  112 x 128 (rotating; solid base 64 x 12)
// =====================================================================
const FW_W = 112;
const FW_H = 128;
const FW_CX = 56;
const FW_CY = 52;
const FW_R = 46;
const FW_STEPS = 18;
const FW_CARS = ['#d8434b', '#2fa59a', '#ffd34a', '#ff94b4'];
function fwLegs(front: boolean): void {
  const c = front ? '#e8e4f0' : '#a8a0c0';
  const cd = front ? '#a8a0c0' : '#7a7096';
  for (const [x0, x1] of [[FW_CX, 18], [FW_CX, 94]] as [number, number][]) {
    L(x0, FW_CY, x1, 116, c);
    L(x0 + (x1 < x0 ? -1 : 1), FW_CY, x1 + (x1 < x0 ? -1 : 1), 116, cd);
  }
  if (front) {
    for (const y of [76, 98]) {
      const t = (y - FW_CY) / (116 - FW_CY);
      HL(Math.round(FW_CX - t * 38), Math.round(FW_CX + t * 38), y, c);
    }
    circ(FW_CX, FW_CY, 4, '#f4b63f');
    circ(FW_CX, FW_CY, 2, '#c88a2a');
    P(FW_CX - 1, FW_CY - 2, '#fff0a0');
  }
}
function drawFerrisBase(): void {
  fwLegs(false);
  // boarding platform + ticket booth
  R(28, 114, 56, 6, '#c88a5a');
  HL(28, 83, 114, '#e8b078');
  R(28, 120, 56, 8, '#3a3478');
  for (let x = 28; x < 84; x += 6) VL(x, 121, 127, '#332e6c');
  TC('RIDE', 56, 122, '#ffd560', FT, {});
  R(86, 108, 14, 20, '#d8434b');
  R(86, 108, 14, 3, '#fbf0e4');
  R(88, 113, 10, 6, '#f2a868');
  T('$1', 89, 121, '#fff4e6', FT, {});
}
function drawFerrisWheel(k: number): void {
  const base = (k / FW_STEPS) * (Math.PI / 4);
  // rim (double) with bulbs
  for (let a = 0; a < 360; a += 0.5) {
    const r = (a * Math.PI) / 180;
    P(FW_CX + Math.cos(r) * FW_R, FW_CY + Math.sin(r) * FW_R, '#e8e4f0');
    P(FW_CX + Math.cos(r) * (FW_R - 6), FW_CY + Math.sin(r) * (FW_R - 6), '#c8c0dc');
  }
  for (let i = 0; i < 8; i++) {
    const a = base + (i * Math.PI) / 4;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    L(FW_CX, FW_CY, FW_CX + ca * FW_R, FW_CY + sa * FW_R, '#d8d0e8');
    // cross-brace between rims
    const a2 = a + Math.PI / 8;
    L(FW_CX + ca * FW_R, FW_CY + sa * FW_R, FW_CX + Math.cos(a2) * (FW_R - 6), FW_CY + Math.sin(a2) * (FW_R - 6), '#b8b0cc');
  }
  for (let i = 0; i < 16; i++) {
    const a = base + (i * Math.PI) / 8 + Math.PI / 16;
    const x = Math.round(FW_CX + Math.cos(a) * FW_R);
    const y = Math.round(FW_CY + Math.sin(a) * FW_R);
    P(x, y, i % 2 ? '#fff3b0' : '#ffc65a');
  }
}
function fwCar(c: string): void {
  // hanging gondola: pivot at (4, 0)
  VL(4, 0, 2, '#8a84a0');
  RR(0, 2, 9, 3, 1, c);
  HL(1, 7, 2, liA(c, 0.45));
  R(1, 5, 7, 3, '#fbf0e4');
  RR(0, 7, 9, 4, 1, shA(c, 0.1));
  HL(0, 8, 7, liA(c, 0.25));
}
{
  const kind: ObjectKind = {
    solid: { x: -32, y: -12, w: 64, h: 12 },
    label: () => 'Ferris wheel',
    draw(ctx, o, t) {
      const base = art('ferris|base', FW_W, FW_H, drawFerrisBase, { pad: [0, 0, 8, 4], shadow: (ox, oy) => shadowEll(ox + 58, oy + 124, 40, 5) });
      blit(ctx, base, o);
      const turn = t * 0.11;
      const step = Math.floor((turn / (Math.PI / 4)) * FW_STEPS);
      const k = ((step % FW_STEPS) + FW_STEPS) % FW_STEPS;
      blit(ctx, layer('ferris|wheel|' + k, FW_W, FW_H, [6, 2, 100, 100], () => drawFerrisWheel(k), true), o);
      const a0 = (step / FW_STEPS) * (Math.PI / 4);
      const x0 = Math.round(o.x) - FW_W / 2;
      const y0 = Math.round(o.y) - FW_H;
      for (let i = 0; i < 8; i++) {
        const a = a0 + (i * Math.PI) / 4 + Math.PI / 8;
        const car = art('ferris|car|' + (i % 4), 9, 11, () => fwCar(FW_CARS[i % 4]), {});
        ctx.drawImage(car.cv, Math.round(x0 + FW_CX + Math.cos(a) * (FW_R - 1)) - 5, Math.round(y0 + FW_CY + Math.sin(a) * (FW_R - 1)) - 1);
      }
      blit(ctx, layer('ferris|front', FW_W, FW_H, [14, 46, 84, 72], () => fwLegs(true), true), o);
    },
    lights: (o) => {
      const x0 = Math.round(o.x) - FW_W / 2;
      const y0 = Math.round(o.y) - FW_H;
      const ls = [{ x: x0 + FW_CX, y: y0 + FW_CY, r: 60, color: '#ffd890' }, { x: x0 + 93, y: y0 + 116, r: 12, color: WARM }];
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        ls.push({ x: x0 + FW_CX + Math.cos(a) * FW_R, y: y0 + FW_CY + Math.sin(a) * FW_R, r: 16, color: i % 2 ? '#ff7ab0' : '#5ff2d6' });
      }
      return ls;
    },
  };
  registerObject('ferris-wheel', kind);
}
