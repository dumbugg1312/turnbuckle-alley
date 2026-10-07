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
  AK, FX, FY, HL, L, OUT, P, P1, R, RR, RRB, VG, VL, box, circ, clip, col, curve, dense, dth, ell, hash2, liA, mixc, mkSpr, noclip, poly, rng, selA, shA, toCanvas,
  type Color, type Spr,
} from '../kit';
import { FM, FT, T, TC, TW, glyph } from '../font';

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
  // World art is painted at double density (DECISIONS.md D-018): every
  // primitive still takes world-pixel coordinates, fine detail sits on halves.
  const a = dense(BK, (): Art => {
    const ol = o.outline === false ? 0 : 1;
    const [pl, pt, pr, pb] = o.pad ?? [0, 0, 0, 0];
    let body = mkSpr(w, h, draw);
    if (ol) body = OUT(body, o.out ?? selA);
    const k = body.k ?? 1;
    const full = mkSpr(body.w / k + pl + pr, body.h / k + pt + pb, () => {
      if (o.shadow) o.shadow(pl + ol, pt + ol);
    });
    const fw = full.w;
    for (let y = 0; y < body.h; y++)
      for (let x = 0; x < body.w; x++) {
        const c = body.d[y * body.w + x];
        if (c) full.d[(y + pt * k) * fw + x + pl * k] = c;
      }
    return { cv: toCanvas(full), dx: -Math.floor(w / 2) - ol - pl, dy: -h - ol - pt };
  });
  ART.set(key, a);
  return a;
}
/** Build density for all world art in this file (and props built through art()). */
export const BK = 2;
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
  const cv = dense(BK, () => {
    let crop: Spr;
    if (rel) crop = mkSpr(rw, rh, () => draw(-rx, -ry));
    else {
      const s = mkSpr(w, h, () => draw(0, 0));
      const k = s.k ?? 1;
      const cw = rw * k;
      const chh = rh * k;
      crop = { w: cw, h: chh, d: new Uint32Array(cw * chh), k: s.k };
      for (let y = 0; y < chh; y++)
        for (let x = 0; x < cw; x++) {
          const sx = x + rx * k;
          const sy = y + ry * k;
          if (sx >= 0 && sy >= 0 && sx < s.w && sy < s.h) crop.d[y * cw + x] = s.d[sy * s.w + sx];
        }
    }
    if (outline) crop = OUT(crop, selA);
    return toCanvas(crop);
  });
  const a: Art = { cv, dx: -Math.floor(w / 2) + rx - (outline ? 1 : 0), dy: -h + ry - (outline ? 1 : 0) };
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
//  Fine materials (double density, D-018)
//  Coordinates are world pixels; 0.5 is one fine pixel. Paint callbacks
//  below read the live fine coordinates FX/FY for half-pixel texture.
// =====================================================================
const HF = 0.5;
type FinePaint = (fx: number, fy: number, o: number) => Color | null | undefined;
/** Rect painted per fine pixel; fn gets fine coords and the old colour. */
function FR(x: number, y: number, w: number, h: number, fn: FinePaint): void {
  R(x, y, w, h, (_x: number, _y: number, o: number) => fn(FX, FY, o));
}
/** One-fine-pixel lines (x1 / y1 exclusive). */
function fh(x0: number, x1: number, y: number, c: Color | ((x: number, y: number, o: number) => Color | null)): void {
  R(x0, y, x1 - x0, HF, c);
}
function fv(x: number, y0: number, y1: number, c: Color | ((x: number, y: number, o: number) => Color | null)): void {
  R(x, y0, HF, y1 - y0, c);
}
const tint = (c: Color, a: number) => (_x: number, _y: number, o: number) => (o ? mixc(o, c, a) : null);
/** Enamel lettering: each letter pixel gets a lit fine corner (hand-painted sheen). */
const enamel = (c: Color, k = 0.3) => {
  const lit = liA(c, k);
  const C = col(c);
  return () => ((FX & 1) === 0 && (FY & 1) === 0 ? lit : C);
};
/** Weathered paint lettering: a few fine pixels worn back to the board. */
const worn = (c: Color, seed: number, amt = 0.08) => {
  const C = col(c);
  return (_x: number, _y: number, o: number) => (hash2(FX, FY, seed) < amt ? mixc(C, o || C, 0.6) : C);
};

/** Clapboard: lit lap edge, deep shadow line under each board, grain, butt joints, chipped paint. */
function siding(x: number, y: number, w: number, h: number, base: Color, seed: number, pitch = 4, wear = 0.015): void {
  const B = col(base);
  const lit = liA(B, 0.3);
  const lit2 = liA(B, 0.12);
  const s1 = shA(B, 0.16);
  const s2 = shA(B, 0.42);
  const grain = mixc(B, shA(B, 0.12), 0.6);
  const chip = liA(B, 0.45);
  const pf = pitch * 2;
  const y0 = Math.floor(y * 2);
  FR(x, y, w, h, (fx, fy) => {
    const ry = fy - y0;
    const k = ((ry % pf) + pf) % pf;
    const board = Math.floor(ry / pf);
    if (k === pf - 1) return s2;
    if (k === 0) return lit;
    if ((fx + board * 29 + seed * 7) % 61 === 0) return s1;
    let c = k === pf - 2 ? s1 : k === 1 ? lit2 : B;
    if (hash2(fx >> 3, fy, seed) < 0.1) c = grain;
    if (hash2(fx, fy, seed + 7) < wear) c = chip;
    return c;
  });
}
/** Running-bond brick: 1-fine mortar joints, lit top / shaded bottom per brick, chips, speckle. */
function brickF(x: number, y: number, w: number, h: number, b1: Color, b2: Color, mortar: Color, seed: number, course = 4, len = 8): void {
  const cH = course * 2;
  const bL = len * 2;
  const M = col(mortar);
  const Md = shA(M, 0.3);
  const x0 = Math.floor(x * 2);
  const y0 = Math.floor(y * 2);
  const warm = mixc(b1, '#ffd3a0', 0.22);
  FR(x, y, w, h, (fx, fy) => {
    const ry = fy - y0;
    const rx = fx - x0;
    const row = Math.floor(ry / cH);
    const k = ry - row * cH;
    const off = row % 2 ? bL / 2 : 0;
    const bx = Math.floor((rx + off) / bL);
    const kx = rx + off - bx * bL;
    if (k === cH - 1 || kx === bL - 1) return hash2(fx, fy, seed + 1) < 0.15 ? Md : M;
    const n = hash2(bx, row, seed);
    let c = n < 0.28 ? col(b2) : n < 0.4 ? warm : n > 0.92 ? shA(b1, 0.2) : col(b1);
    if (n > 0.86 && k <= 1 && kx >= bL - 3) return Md;
    if (k === 0) c = liA(c, 0.2);
    else if (k === cH - 2) c = shA(c, 0.18);
    else if (kx === 0) c = liA(c, 0.08);
    const s = hash2(fx, fy, seed + 3);
    if (s < 0.07) c = shA(c, 0.13);
    else if (s > 0.965) c = liA(c, 0.18);
    return c;
  });
}
/** Asphalt / cedar shingles: shadow under each course, lit butt edge, staggered tabs, moss low down. */
function shingleF(x: number, y: number, w: number, h: number, base: Color, seed: number, rowH = 3, tab = 5, moss = 0): void {
  const rf = rowH * 2;
  const tf = tab * 2;
  const x0 = Math.floor(x * 2);
  const y0 = Math.floor(y * 2);
  const top = liA(base, 0.16);
  const bot = shA(base, 0.2);
  FR(x, y, w, h, (fx, fy) => {
    const ry = fy - y0;
    const rx = fx - x0;
    const row = Math.floor(ry / rf);
    const k = ry - row * rf;
    const off = (row * 7) % tf;
    const t = Math.floor((rx + off) / tf);
    const kx = rx + off - t * tf;
    const depth = ry / Math.max(1, h * 2);
    let c = mixc(top, bot, depth);
    const n = hash2(t, row, seed);
    if (n < 0.18) c = liA(c, 0.1);
    else if (n > 0.86) c = shA(c, 0.14);
    if (k === 0) return shA(c, 0.5);
    if (k === 1) c = shA(c, 0.22);
    else if (k === rf - 1) c = liA(c, 0.28);
    if (kx === 0) return shA(c, 0.38);
    if (hash2(fx, fy, seed + 5) < 0.06) c = shA(c, 0.1);
    if (moss && hash2(fx >> 1, fy >> 1, seed + 9) < moss * depth * depth) c = mixc(c, '#6f9a5a', 0.55);
    return c;
  });
}
/** Standing-seam / corrugated metal: ribs every `pitch` px with fine highlight and shade, rust drips. */
function metalF(x: number, y: number, w: number, h: number, base: Color, seed: number, pitch = 4, rust = 0.25): void {
  const pf = pitch * 2;
  const x0 = Math.floor(x * 2);
  const y0 = Math.floor(y * 2);
  const B = col(base);
  const hi = liA(B, 0.38);
  const s1 = shA(B, 0.12);
  const s2 = shA(B, 0.34);
  FR(x, y, w, h, (fx, fy, o) => {
    if (!o) return null;
    const k = (((fx - x0) % pf) + pf) % pf;
    let c = k === 0 ? hi : k === 1 ? liA(B, 0.12) : k === pf - 1 ? s2 : k === pf - 2 ? s1 : B;
    const lane = (fx - x0) >> 1;
    if (hash2(lane, 0, seed) < rust) {
      const t = (fy - y0) / (h * 2);
      if (hash2(fx, fy, seed + 2) < t * 0.7) c = mixc(c, '#b0643c', 0.4);
    }
    return c;
  });
}
/** Hand-troweled plaster/stucco with fine mottling. */
function stucco(x: number, y: number, w: number, h: number, base: Color, seed: number): void {
  const B = col(base);
  const a = liA(B, 0.14);
  const b = shA(B, 0.08);
  const c2 = shA(B, 0.16);
  FR(x, y, w, h, (fx, fy) => {
    const n = hash2(fx, fy, seed);
    const m = hash2(fx >> 3, fy >> 2, seed + 1);
    if (n < 0.06) return a;
    if (n > 0.95) return c2;
    return m < 0.3 ? b : m > 0.85 ? mixc(B, a, 0.5) : B;
  });
}
/** Grime rising from the ground: dithered darkening, densest at the bottom edge. */
function grime(x: number, y: number, w: number, h: number, k = 0.22, tintC?: Color): void {
  const y0 = Math.floor(y * 2);
  FR(x, y, w, h, (fx, fy, o) => {
    if (!o) return null;
    const t = (fy - y0 + 1) / (h * 2);
    if (!dth(fx, fy, Math.round(t * t * 13) + 1)) return o;
    return tintC ? mixc(o, tintC, k * 1.4) : shA(o, k);
  });
}
/** Shade cast down from an eave or overhang (dithered, fading away from y). */
function aoTop(x: number, y: number, w: number, h: number, k = 0.28): void {
  const y0 = Math.floor(y * 2);
  FR(x, y, w, h, (fx, fy, o) => {
    if (!o) return null;
    const t = 1 - (fy - y0) / (h * 2);
    return dth(fx, fy, Math.round(t * 15)) ? shA(o, k) : o;
  });
}
/** Right-hand side shading (sun from the upper left). */
function shadeRight(x: number, y: number, w: number, h: number, k = 0.2): void {
  const x0 = Math.floor(x * 2);
  FR(x, y, w, h, (fx, fy, o) => {
    if (!o) return null;
    const t = (fx - x0 + 1) / (w * 2);
    return dth(fx, fy, Math.round(t * 15)) ? shA(o, k) : o;
  });
}
/** Rain streaks running down from a sill or ledge. */
function streaks(x: number, y: number, w: number, len: number, seed: number, k = 0.14): void {
  for (let i = 0; i < w * 2; i++) {
    if (hash2(i, 0, seed) > 0.3) continue;
    const l = len * (0.4 + hash2(i, 1, seed) * 0.6);
    fv(x + i * HF, y, y + l, (_X: number, _Y: number, o: number) => (o && hash2(FX, FY, seed) < 0.75 ? shA(o, k) : o));
  }
}
/** Glass: interior painted by fn, then sky reflection, a diagonal glint and frame shadow. */
function glassF(x: number, y: number, w: number, h: number, interior: () => void, o: { sky?: Color; glint?: boolean } = {}): void {
  clip(x, y, w, h);
  interior();
  const sky = o.sky ?? '#cfe2f2';
  const x0 = Math.floor(x * 2);
  const y0 = Math.floor(y * 2);
  const fw = w * 2;
  const fhh = h * 2;
  FR(x, y, w, h, (fx, fy, c) => {
    const rx = fx - x0;
    const ry = fy - y0;
    let out = c;
    // reflection of the sky, strongest at the top
    const t = ry / fhh;
    if (t < 0.45 && dth(fx, fy, Math.round((0.45 - t) * 30))) out = mixc(out, sky, 0.32);
    // two diagonal glints
    if (o.glint !== false) {
      const d = (rx + ry * 0.7) % Math.max(24, fw + 6);
      if (d > fw * 0.18 && d < fw * 0.18 + 3) out = mixc(out, '#fff6e0', 0.42);
      else if (d > fw * 0.18 + 5 && d < fw * 0.18 + 6) out = mixc(out, '#fff6e0', 0.25);
    }
    // frame shadow on the top and left inside edge
    if (ry === 0 || rx === 0) out = shA(out, 0.35);
    else if (ry === 1) out = shA(out, 0.15);
    return out;
  });
  noclip();
  P1(x + 0.5, y + 0.5, '#fffaf0');
  if (w > 6 && h > 6) P1(x + 1, y + 0.5, mixc('#fffaf0', sky, 0.4));
}
/** Interior: wallpapered room with a lamp glow, skirting and a shadowed floor. */
function room(x: number, y: number, w: number, h: number, wall: Color = '#e7a468', seed = 1): void {
  const W = col(wall);
  const stripe = shA(W, 0.1);
  FR(x, y, w, h, (fx) => (fx % 6 < 1 ? stripe : W));
  const fl = Math.floor(h * 0.66);
  R(x, y + fl, w, h - fl, shA(W, 0.4));
  fh(x, x + w, y + fl, shA(W, 0.18));
  const r = rng(seed);
  if (w > 7) {
    const lx = x + 2 + Math.floor(r() * (w - 5));
    // a lamp with a soft pool of light
    R(lx, y + fl - 3, 2, 3, shA(W, 0.5));
    RR(lx - 1, y + fl - 6, 4, 3, 1, '#fff0b8');
    for (let k = 1; k < 5; k++) FR(lx - k, y + fl - 6 - k * 0.5, 4 + k * 2, 1, (fx, fy, o) => (dth(fx, fy, 5 - k) ? mixc(o, '#fff0b8', 0.3) : o));
  }
  if (w > 10 && r() < 0.7) {
    // a picture frame
    const px = x + 1 + Math.floor(r() * (w - 6));
    R(px, y + 2, 4, 3, '#c8a050');
    R(px + 0.5, y + 2.5, 3, 2, ['#6a8ab0', '#b06a6a', '#6aa07a'][Math.floor(r() * 3)]);
  }
}
/** A cat loafing on a sill (fits in a window 6+ wide). */
function cat(x: number, y: number, c: Color = '#3a3048', eye: Color = '#c8e070'): void {
  ell(x + 3, y + 2.5, 3, 1.75, c);
  ell(x + 0.75, y + 1, 1.5, 1.4, c);
  P1(x, y - 0.5, c);
  P1(x + 1.5, y - 0.5, c);
  P1(x + 0.5, y + 0.75, eye);
  P1(x + 1.5, y + 0.75, eye);
  curve(x + 6, y + 3, x + 7, y + 1, 0, c);
  P1(x + 3, y + 1, liA(c, 0.25));
  P1(x + 3.5, y + 1, liA(c, 0.25));
}
/** Fine lace curtains gathered to the sides. */
function curtainsF(x: number, y: number, w: number, h: number, c: Color = '#fff4e6'): void {
  const C = col(c);
  const S = shA(C, 0.14);
  for (let yy = 0; yy < h * 2; yy++) {
    const k = Math.max(2, Math.round(6 - Math.abs(yy - h * 1.1) * 0.35));
    for (let i = 0; i < k; i++) {
      const fold = i % 2 ? S : C;
      P1(x + i * HF, y + yy * HF, fold);
      P1(x + w - HF - i * HF, y + yy * HF, i % 2 ? shA(C, 0.22) : S);
    }
  }
  fh(x, x + w, y, C);
  fh(x, x + w, y + HF, S);
}
/** Window: frame with lit and shaded edges, glass, fine muntins, a real sill; options for shutters, box, blinds, cat. */
function win(
  x: number,
  y: number,
  w: number,
  h: number,
  o: {
    frame?: Color;
    wall?: Color;
    seed?: number;
    interior?: () => void;
    curtains?: Color | null;
    cols?: number;
    rows?: number;
    shutters?: Color;
    box?: number;
    boxC?: Color;
    blinds?: Color;
    cat?: boolean;
    plant?: boolean;
    sill?: Color;
    lintel?: Color;
    sky?: Color;
  } = {},
): void {
  const fr = col(o.frame ?? '#fbefd8');
  R(x - 1, y - 1, w + 2, h + 2, fr);
  fh(x - 1, x + w + 1, y - 1, liA(fr, 0.5));
  fv(x - 1, y - 1, y + h + 1, liA(fr, 0.3));
  fv(x + w + HF, y - 1, y + h + 1, shA(fr, 0.25));
  if (o.lintel) {
    R(x - 2, y - 3, w + 4, 2, o.lintel);
    fh(x - 2, x + w + 2, y - 3, liA(o.lintel, 0.35));
    fh(x - 2, x + w + 2, y - 1 - HF, shA(o.lintel, 0.3));
  }
  glassF(
    x,
    y,
    w,
    h,
    () => {
      if (o.interior) o.interior();
      else room(x, y, w, h, o.wall ?? '#e7a468', o.seed ?? x * 3 + y);
      if (o.blinds) {
        for (let yy = 0; yy < h * 0.55; yy += 1) {
          fh(x, x + w, y + yy, o.blinds);
          fh(x, x + w, y + yy + HF, shA(o.blinds, 0.18));
        }
      }
      if (o.curtains !== null && o.curtains !== undefined) curtainsF(x, y, w, h, o.curtains);
      if (o.plant) {
        const px = x + w - 5;
        R(px, y + h - 3, 3, 3, '#c8704f');
        fh(px, px + 3, y + h - 3, '#e8906a');
        ell(px + 1.5, y + h - 4.5, 2.5, 2, '#5f9a5a');
        P1(px + 0.5, y + h - 6, '#8ac070');
        P1(px + 2.5, y + h - 5, '#ff8fae');
      }
      if (o.cat) cat(x + 1, y + h - 4);
    },
    { sky: o.sky },
  );
  const cols = o.cols ?? 2;
  const rows = o.rows ?? (h > 9 ? 2 : 1);
  const mc = shA(fr, 0.05);
  for (let i = 1; i < cols; i++) {
    const mx = x + (w * i) / cols - 0.5;
    R(mx, y, 1, h, mc);
    fv(mx, y, y + h, liA(fr, 0.3));
  }
  for (let j = 1; j < rows; j++) {
    const my = y + Math.round((h * j) / rows) - 0.5;
    R(x, my, w, 1, mc);
    fh(x, x + w, my, liA(fr, 0.3));
  }
  // sill: lit top, shadow underneath
  const sill = col(o.sill ?? shA(fr, 0.08));
  R(x - 2, y + h + 1, w + 4, 1.5, sill);
  fh(x - 2, x + w + 2, y + h + 1, liA(sill, 0.45));
  fh(x - 2, x + w + 2, y + h + 2.5, tint('#3a2848', 0.35));
  fh(x - 1.5, x + w + 1.5, y + h + 3, tint('#3a2848', 0.18));
  if (o.shutters) {
    const S = col(o.shutters);
    for (const sx of [x - 4.5, x + w + 1.5]) {
      R(sx, y - 1, 3, h + 2, S);
      for (let yy = y; yy < y + h; yy += 1) {
        fh(sx + HF, sx + 3 - HF, yy, liA(S, 0.18));
        fh(sx + HF, sx + 3 - HF, yy + HF, shA(S, 0.22));
      }
      fv(sx, y - 1, y + h + 1, liA(S, 0.32));
      fv(sx + 3 - HF, y - 1, y + h + 1, shA(S, 0.35));
      fh(sx, sx + 3, y + h / 2 - 0.5, shA(S, 0.1));
    }
  }
  if (o.box !== undefined) boxF(x - 2, y + h + 1.5, w + 4, o.box, o.boxC);
}
/** Flower box: planks with grain, soil, trailing ivy and fine blooms. */
function boxF(x: number, y: number, w: number, seed: number, c: Color = '#a8604a'): void {
  const r = rng(seed);
  const C = col(c);
  R(x, y + 2, w, 3.5, C);
  fh(x, x + w, y + 2, liA(C, 0.35));
  fh(x, x + w, y + 3.5, shA(C, 0.12));
  fh(x, x + w, y + 5, shA(C, 0.4));
  fv(x, y + 2, y + 5.5, liA(C, 0.2));
  fv(x + w - HF, y + 2, y + 5.5, shA(C, 0.35));
  const blooms = ['#ff8fae', '#ffe070', '#fff8f0', '#e8505a', '#c08ae0', '#ffb04a'];
  const b1 = blooms[seed % blooms.length];
  const b2 = blooms[(seed + 2) % blooms.length];
  for (let xx = 0.5; xx < w - 0.5; xx += 1) {
    const hgt = 1 + r() * 2;
    ell(x + xx, y + 2 - hgt * 0.4, 0.9, hgt * 0.6, r() < 0.5 ? '#5f9a5a' : '#4f8a5a');
    if (r() < 0.35) P1(x + xx, y + 1 - hgt * 0.5, '#8ac070');
    if (r() < 0.45) {
      const bc = r() < 0.6 ? b1 : b2;
      const by = y + 1.5 - hgt;
      P1(x + xx, by, bc);
      P1(x + xx + HF, by, bc);
      P1(x + xx, by + HF, bc);
      P1(x + xx + HF, by + HF, shA(bc, 0.25));
    }
    if (r() < 0.18) fv(x + xx, y + 5, y + 6.5 + r() * 2, '#5a8a5a');
  }
}
/** Panel door: casing, bevelled panels or a glass lite, brass knob, kick plate, hinges and threshold. */
function doorF(
  x: number,
  y: number,
  w: number,
  h: number,
  c: Color,
  o: { frame?: Color; lite?: boolean; liteH?: number; wall?: Color; seed?: number; knobRight?: boolean; kick?: Color; step?: Color | null; transom?: boolean; mail?: boolean; wreath?: boolean; sign?: () => void } = {},
): void {
  const C = col(c);
  const fr = col(o.frame ?? '#fbefd8');
  const lit = liA(C, 0.28);
  const sh = shA(C, 0.32);
  // casing
  R(x - 1.5, y - 1.5, w + 3, h + 1.5, fr);
  fh(x - 1.5, x + w + 1.5, y - 1.5, liA(fr, 0.45));
  fv(x - 1.5, y - 1.5, y + h, liA(fr, 0.25));
  fv(x + w + 1, y - 1.5, y + h, shA(fr, 0.3));
  R(x, y, w, h, C);
  fv(x, y, y + h, lit);
  fv(x + w - HF, y, y + h, sh);
  fh(x, x + w, y, shA(C, 0.45));
  // door slab grain
  FR(x + HF, y + HF, w - 1, h - 1, (fx, fy, oo) => (hash2(fx >> 2, fy, 41) < 0.08 ? shA(oo, 0.07) : oo));
  const panel = (px: number, py: number, pw: number, ph: number) => {
    R(px, py, pw, ph, shA(C, 0.06));
    fh(px, px + pw, py, sh);
    fv(px, py, py + ph, sh);
    fh(px, px + pw, py + ph - HF, lit);
    fv(px + pw - HF, py, py + ph, lit);
  };
  const m = Math.max(1.5, Math.round(w * 0.16));
  const lh = o.liteH ?? Math.round(h * 0.4);
  if (o.lite) {
    const gx = x + m;
    const gy = y + m;
    R(gx - HF, gy - HF, w - 2 * m + 1, lh + 1, sh);
    glassF(gx, gy, w - 2 * m, lh, () => room(gx, gy, w - 2 * m, lh, o.wall ?? '#e7a468', o.seed ?? x));
    fh(gx - HF, gx + w - 2 * m + HF, gy + lh, lit);
  } else panel(x + m, y + m, w - 2 * m, lh);
  const p2y = y + m + lh + m;
  panel(x + m, p2y, w - 2 * m, h - (p2y - y) - m - 2);
  if (o.kick) {
    R(x + HF, y + h - 3, w - 1, 2.5, o.kick);
    fh(x + HF, x + w - HF, y + h - 3, liA(o.kick, 0.5));
  }
  // knob + escutcheon
  const kx = o.knobRight === false ? x + 1 : x + w - 2.5;
  const ky = y + Math.round(h * 0.54);
  R(kx + 0.5, ky - 1, 1, 3.5, '#c8963a');
  ell(kx + 1, ky + 0.5, 1, 1, '#f2c050');
  P1(kx + 0.5, ky, '#fff4c0');
  // hinges
  const hx = o.knobRight === false ? x + w - HF : x;
  R(hx, y + 3, HF, 2, '#8a7a6a');
  R(hx, y + h - 6, HF, 2, '#8a7a6a');
  if (o.mail) {
    R(x + w / 2 - 2, p2y + 2, 4, 1, '#c8963a');
    fh(x + w / 2 - 2, x + w / 2 + 2, p2y + 2, '#f2d080');
  }
  if (o.wreath) {
    const cx = x + w / 2;
    const cy = y + m + 4;
    ell(cx, cy, 3.5, 3.5, '#3f7a4a');
    ell(cx, cy, 2, 2, C);
    for (let a = 0; a < 6.28; a += 0.8) P1(cx + Math.cos(a) * 2.8, cy + Math.sin(a) * 2.8, a < 3 ? '#5f9a5a' : '#2f6a40');
    P1(cx - 1, cy + 2.5, '#d8434b');
    P1(cx + 1, cy + 2.5, '#d8434b');
    P1(cx, cy + 3, '#e86068');
  }
  if (o.sign) o.sign();
  if (o.step !== null) {
    const st = col(o.step ?? '#c8b0a8');
    R(x - 3, y + h - 1.5, w + 6, 1.5, st);
    fh(x - 3, x + w + 3, y + h - 1.5, liA(st, 0.35));
  }
}
/** Gutter along an eave plus an optional downspout. */
function gutter(x0: number, x1: number, y: number, c: Color = '#b8b4c8'): void {
  const C = col(c);
  R(x0, y, x1 - x0, 1.5, C);
  fh(x0, x1, y, liA(C, 0.45));
  fh(x0, x1, y + 1, shA(C, 0.3));
  for (let x = x0 + 4; x < x1; x += 10) P1(x, y + 1.5, shA(C, 0.4));
}
function downspout(x: number, y0: number, y1: number, c: Color = '#b8b4c8'): void {
  const C = col(c);
  R(x, y0, 1.5, y1 - y0, C);
  fv(x, y0, y1, liA(C, 0.4));
  fv(x + 1, y0, y1, shA(C, 0.32));
  for (let y = y0 + 5; y < y1 - 3; y += 9) {
    fh(x - HF, x + 2, y, shA(C, 0.4));
  }
  // elbow and splash block
  R(x - 1, y1 - 1.5, 3, 1.5, C);
  fh(x - 1, x + 2, y1 - 1.5, liA(C, 0.3));
  R(x - 1.5, y1 - HF, 4, HF, '#a8a0a8');
}
/** Window AC unit hanging out of a wall. */
function acUnit(x: number, y: number): void {
  RR(x, y, 9, 6, 1, '#d8d4dc');
  fh(x + 0.5, x + 8.5, y, '#f4f2f6');
  for (let yy = y + 1.5; yy < y + 5; yy += 1) fh(x + 1, x + 6, yy, '#a8a2b4');
  R(x + 6.5, y + 1.5, 2, 3, '#c0bcc8');
  P1(x + 7, y + 2, '#ff6a50');
  fh(x, x + 9, y + 6, tint('#3a2848', 0.4));
  // drip stain
  fv(x + 2, y + 6.5, y + 10, tint('#3a2848', 0.15));
}
/** Small rooftop vent stack with a rain cap. */
function ventF(x: number, y: number, h = 5): void {
  R(x, y, 4, h, '#b8b4c8');
  fv(x, y, y + h, '#e8e4f0');
  fv(x + 3.5, y, y + h, '#8a84a0');
  R(x - 1, y - 1.5, 6, 1.5, '#6e688e');
  fh(x - 1, x + 5, y - 1.5, '#9a94b8');
  fh(x, x + 4, y + h - HF, tint('#3a2848', 0.3));
}
/** Wall sconce / gooseneck lamp with a glow pool on the wall below. */
function sconce(x: number, y: number, shade: Color = '#3f8a86', arm = 3): void {
  R(x - 1, y - arm - 1, 2, 1.5, '#4a3550');
  curve(x, y - arm, x, y - 1, 0, '#4a3550');
  RR(x - 2.5, y - 1, 5, 2.5, 1, shade);
  fh(x - 2, x + 2, y - 1, liA(shade, 0.4));
  fh(x - 1.5, x + 1.5, y + 1.5, '#fff6c8');
  for (let k = 1; k < 7; k++) FR(x - k * 0.75, y + 1.5 + k * 0.75, k * 1.5, 0.75, (fx, fy, o) => (o && dth(fx, fy, 7 - k) ? mixc(o, '#ffefb0', 0.3) : o));
}
/** A paper poster pasted to a wall, torn and weathered. */
function oldPoster(x: number, y: number, w: number, h: number, bg: Color, ink: Color, seed: number): void {
  const r = rng(seed);
  R(x, y, w, h, bg);
  FR(x, y, w, h, (fx, fy, o) => (hash2(fx, fy, seed) < 0.08 ? mixc(o, '#c9a0a0', 0.3) : o));
  R(x + 1, y + 1, w - 2, 2, ink);
  R(x + 1, y + 4, w - 2, h * 0.4, mixc(ink, bg, 0.35));
  for (let yy = y + 5 + h * 0.4; yy < y + h - 1; yy += 1) fh(x + 1, x + 1 + (w - 2) * (0.5 + r() * 0.5), yy, mixc(ink, bg, 0.55));
  // torn corner
  const tc = Math.floor(r() * 4);
  const cx = tc % 2 ? x + w - 2 : x;
  const cy = tc > 1 ? y + h - 2 : y;
  R(cx, cy, 2, 2, 0);
  P1(tc % 2 ? cx - HF : cx + 2, cy + (tc > 1 ? 1.5 : 0), 0);
  P1(tc % 2 ? cx + 1.5 : cx, tc > 1 ? cy - HF : cy + 2, 0);
  fv(x + w, y + HF, y + h + HF, tint('#3a2848', 0.3));
  fh(x + HF, x + w + HF, y + h, tint('#3a2848', 0.3));
  P1(x + 0.5, y + 0.5, '#d8d4dc');
  P1(x + w - 1, y + 0.5, '#d8d4dc');
}
/** Overhead wires sagging between two points. */
function wire(x0: number, y0: number, x1: number, y1: number, sag: number, c: Color = '#3a3048'): void {
  const n = Math.ceil(Math.abs(x1 - x0) * 2 + Math.abs(y1 - y0) * 2);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    P1(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t), c);
  }
}
/** Stone foundation with fine joints, moss and splash grime. */
function footing(x: number, y: number, w: number, h = 4, a: Color = '#b8a0b0', seed = 3): void {
  const A = col(a);
  const x0 = Math.floor(x * 2);
  const y0 = Math.floor(y * 2);
  FR(x, y, w, h, (fx, fy) => {
    const rx = fx - x0;
    const ry = fy - y0;
    const row = ry >> 2;
    const off = row % 2 ? 5 : 0;
    const bi = Math.floor((rx + off) / 11);
    const kx = rx + off - bi * 11;
    const ky = ry & 3;
    if (kx === 10 || ky === 3) return shA(A, 0.35);
    const n = hash2(bi, row, seed);
    let c = n < 0.3 ? liA(A, 0.1) : n > 0.8 ? shA(A, 0.12) : A;
    if (ky === 0) c = liA(c, 0.25);
    if (hash2(fx, fy, seed + 4) < 0.08) c = shA(c, 0.12);
    if (ky === 2 && hash2(fx >> 1, row, seed + 6) < 0.18) c = mixc(c, '#6f9a5a', 0.5);
    return c;
  });
}
/** Microtext: tiny fine-pixel writing (menus, notices). Reads as texture, not words. */
function micro(s: string, x: number, y: number, c: Color, f = FT): void {
  let cx = 0;
  for (const ch of s) {
    if (ch === ' ') {
      cx += f.space;
      continue;
    }
    const g = glyph(f, ch);
    if (!g) continue;
    g.rows.forEach((row: string, r: number) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') P1(x + (cx + i) * HF, y + r * HF, c);
    });
    cx += g.w + f.sp;
  }
}

/** Material kit, referenced so builds stay clean while buildings adopt it. */
export const FINE_KIT = { worn, siding, brickF, shingleF, stucco, streaks, win, doorF, acUnit, ventF };

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
//  HOT TAG DINER  (96 x 96, door +24)
//  A chrome-and-mint 1950s diner: neon on the roof, booths in the window.
// =====================================================================
function dinerSign(on: boolean[]): void {
  // rooftop sign box: HOT TAG in pink neon, DINER in teal
  RRB(10, 0, 76, 21, 3, '#5e4a72', '#3b2a4f');
  fh(12, 84, 0, '#8a76a0');
  RR(12, 2, 72, 17, 2, '#33243f');
  FR(12, 2, 72, 17, (fx, fy, o) => (o && (fy & 3) === 0 && hash2(fx, fy, 3) < 0.4 ? mixc(o, '#4a3a5a', 0.4) : o));
  for (let x = 14; x < 84; x += 8) {
    P1(x, 3, '#8a76a0');
    P1(x, 17.5, '#8a76a0');
  }
  const ht = 'HOT TA';
  const wx = 48 - Math.round(TW('HOT TAG', FM, { bold: true }) / 2);
  neon(ht, wx, 3, '#ffe6f2', '#ff5fa0', FM, { bold: true }, on[0]);
  neon('G', wx + TW(ht, FM, { bold: true }) + 2, 3, '#ffe6f2', '#ff5fa0', FM, { bold: true }, on[1]);
  neon('DINER', 48 - Math.round(TW('DINER', FT, { ls: 2 }) / 2), 12, '#e6fff8', '#38e0c8', FT, { ls: 2 }, on[2]);
  // neon coffee cups with steam
  for (const cx of [15, 76]) {
    const cup = ['.###.#', '.####.', '.###..', '..#...'];
    cup.forEach((row, yy) => [...row].forEach((ch, xx) => {
      if (ch === '#') P(cx + xx, 11 + yy, on[2] ? '#ffe9a8' : '#6a5a6a');
    }));
    if (on[2]) {
      P1(cx + 2, 8.5, over('#ffe9a8', 0.6));
      P1(cx + 2.5, 8, over('#ffe9a8', 0.5));
      P1(cx + 3, 7, over('#ffe9a8', 0.5));
      P1(cx + 2.5, 6.5, over('#ffe9a8', 0.35));
    }
  }
}
function drawDiner(): void {
  const W = 96;
  const GY = 96;
  // flat roof behind the parapet, sign legs standing on it
  flatRoof(2, 18, 92, 12, 11);
  FR(2, 18, 92, 12, (fx, fy, o) => (hash2(fx, fy, 12) < 0.12 ? shA(o, 0.12) : o));
  ventF(80, 20, 5);
  acUnit(5, 21);
  R(14, 22, 5, 5, '#8a84a0');
  fh(14, 19, 22, '#c8c4d8');
  wire(19, 24, 30, 27, 2, '#3a3048');
  for (const sx of [24, 70]) {
    R(sx, 20, 3, 9, '#5a4468');
    fv(sx, 20, 29, '#8a6a8a');
    fh(sx - 1, sx + 4, 28.5, '#3a2a48');
    L(sx + 3, 21, sx + 7, 28, '#5a4468');
  }
  dinerSign([true, true, true]);
  // parapet cap
  R(0, 29, W, 3, '#f6e4c4');
  fh(0, W, 29, '#fffaf0');
  fh(0, W, 31.5, '#c9a2a2');
  // cherry band with lettering
  R(0, 32, W, 11, '#d0484f');
  fh(0, W, 32, '#f2a0a0');
  fh(0, W, 32.5, '#e8706a');
  fh(0, W, 42.5, '#8e2c4c');
  FR(0, 33, W, 9, (fx, fy, o) => ((fx & 7) === 0 ? shA(o, 0.08) : hash2(fx, fy, 14) < 0.03 ? liA(o, 0.15) : o));
  TC('BREAKFAST ALL DAY', W / 2 + 0.5, 35.5, '#8e2c4c', FT, {});
  TC('BREAKFAST ALL DAY', W / 2, 35, enamel('#fff0dc'), FT, {});
  for (const sx of [5, 90]) {
    P(sx, 37, '#ffd977');
    P1(sx - 1, 37, '#ffe9b0');
    P1(sx + 1.5, 37, '#ffe9b0');
    P1(sx + 0.5, 36, '#ffe9b0');
    P1(sx + 0.5, 38.5, '#ffe9b0');
  }
  // mint enamel panels with fine seams and rivets
  const pT = 43;
  const pB = 85;
  R(0, pT, W, pB - pT, (x: number) => {
    const k = x % 16;
    return k === 0 ? '#cdebd5' : k === 15 ? '#7fb2a6' : '#a9d8bf';
  });
  FR(0, pT, W, pB - pT, (fx, fy, o) => {
    const k = fx % 32;
    if (k === 1) return '#e8faf0';
    if (k === 30) return '#6a9a90';
    if ((k === 3 || k === 28) && (fy - pT * 2) % 14 === 6) return '#6a9a90';
    if (hash2(fx, fy, 15) < 0.025) return liA(o, 0.2);
    return o;
  });
  fh(0, W, pT, '#e2f6e2');
  fh(0, W, pT + HF, '#f4fff8');
  aoTop(0, pT, W, 4, 0.18);
  shadeRight(W - 8, pT, 8, pB - pT, 0.18);
  // chrome strip + cherry kickplate with ribbing
  R(0, pB, W, 2, '#f2eef6');
  fh(0, W, pB, '#ffffff');
  fh(0, W, pB + 1, '#c8c0d8');
  fh(0, W, pB + 1.5, '#8a7ea6');
  R(0, pB + 2, W, GY - pB - 2, '#c9404c');
  fh(0, W, pB + 2, '#e06a64');
  FR(0, pB + 3, W, GY - pB - 4, (fx, _fy, o) => ((fx % 6) === 0 ? '#a8344a' : (fx % 6) === 1 ? '#e06a64' : o));
  grime(0, GY - 6, W, 6, 0.25);
  // big window full of booths
  const wx = 5;
  const wy = 49;
  const ww = 52;
  const wh = 28;
  R(wx - 2, wy - 2, ww + 4, wh + 4, '#efeaf4');
  fh(wx - 2, wx + ww + 2, wy - 2, '#ffffff');
  fv(wx + ww + 1.5, wy - 2, wy + wh + 2, '#9a8eb4');
  fh(wx - 2, wx + ww + 2, wy + wh + 1.5, '#8a7ea6');
  fv(wx - 2, wy - 2, wy + wh + 2, '#ffffff');
  glassF(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#e7a468');
    FR(wx, wy, ww, 12, (fx) => (fx % 8 === 0 ? '#d9955e' : null));
    // back counter, pie case and stools behind the booths
    R(wx, wy + 9, ww, 3, '#c8b8a8');
    fh(wx, wx + ww, wy + 9, '#f2eef6');
    R(wx + 30, wy + 6, 10, 3, '#cfe8f0');
    fh(wx + 30, wx + 40, wy + 6, '#ffffff');
    for (let k = 0; k < 3; k++) {
      ell(wx + 32 + k * 3, wy + 8, 1.2, 0.7, ['#f0c060', '#e87a8a', '#c8905a'][k]);
    }
    R(wx, wy + 12, ww, wh - 12, '#b45a4c');
    fh(wx, wx + ww, wy + 12, '#cf7458');
    R(wx, wy + 26, ww, 2, '#8a4a4a');
    FR(wx, wy + 26, ww, 2, (fx, fy) => ((fx >> 1) + (fy >> 1)) % 2 ? '#d8c8d0' : '#5a3a4a');
    // framed wrestler photos
    for (const fx of [wx + 9, wx + 23, wx + 37]) {
      R(fx, wy + 1.5, 6, 6, '#f2c050');
      fh(fx, fx + 6, wy + 1.5, '#fff0a0');
      R(fx + 1, wy + 2.5, 4, 4, '#6e5a8a');
      P1(fx + 2.5, wy + 3, '#f2c8a0');
      P1(fx + 3, wy + 3, '#f2c8a0');
      R(fx + 2, wy + 4, 2, 2, '#e0505a');
    }
    // pendant lamps
    for (const lx of [wx + 3, wx + 17, wx + 31, wx + 46]) {
      fv(lx, wy, wy + 3, '#5a4060');
      RR(lx - 2, wy + 3, 5, 2, 1, '#3f8a86');
      fh(lx - 1.5, lx + 2, wy + 3, '#6ac0b0');
      fh(lx - 1, lx + 1.5, wy + 5, '#fff2b0');
      for (let k = 0; k < 6; k++) FR(lx - k * 0.7, wy + 5.5 + k * 0.6, 1 + k * 1.4, 0.6, (a, b, o) => (dth(a, b, 7 - k) ? mixc(o, '#ffe6a0', 0.35) : o));
    }
    // booths: tall red backs, tables
    for (let i = 0; i < 3; i++) {
      const bx = wx + 1 + i * 17;
      for (const ox of [0, 12]) {
        RR(bx + ox, wy + 12, 4, 16, 2, '#d0444f');
        fv(bx + ox, wy + 13, wy + 28, '#ee7a72');
        fv(bx + ox + 3.5, wy + 13, wy + 28, '#8e2c48');
        for (let y = wy + 15; y < wy + 26; y += 3) fh(bx + ox + 0.5, bx + ox + 3.5, y, '#b8384a');
      }
      R(bx + 4, wy + 18, 8, 2, '#fbe6cc');
      fh(bx + 4, bx + 12, wy + 18, '#ffffff');
      fh(bx + 4, bx + 12, wy + 19.5, '#c0b0c8');
      fv(bx + 8, wy + 20, wy + 28, '#9a8eb4');
    }
    // patrons: beehive lady with coffee, trucker reading the Tattler, a slice of pie
    const pp = (x: number, y: number, shirt: string) => {
      R(x, y + 5, 5, 5, shirt);
      fv(x, y + 5, y + 10, liA(shirt, 0.3));
      RR(x, y, 5, 6, 2, '#f0b890');
      R(x + 3, y + 2, 2, 4, '#cf8e78');
    };
    pp(wx + 6, wy + 12, '#4f9a9a');
    RR(wx + 5, wy + 6, 7, 8, 3, '#c8b8e0');
    FR(wx + 5, wy + 6, 7, 8, (fx, fy, o) => (o && (fx + fy) % 3 === 0 ? liA(o, 0.2) : o));
    RR(wx + 6, wy + 10, 5, 4, 1, '#f0b890');
    P1(wx + 7, wy + 11, AK);
    P1(wx + 9, wy + 11, AK);
    P1(wx + 8, wy + 12.5, '#d06070');
    R(wx + 11, wy + 16, 2, 2, '#fff');
    P1(wx + 11.5, wy + 15, over('#ffffff', 0.5));
    pp(wx + 22, wy + 12, '#e2a040');
    RR(wx + 21, wy + 11, 7, 2, 1, '#d84a4a');
    R(wx + 19, wy + 14, 10, 6, '#f4eee0');
    fv(wx + 24, wy + 14, wy + 20, '#c8c0b8');
    for (let k = 0; k < 4; k++) fh(wx + 20, wx + 23.5, wy + 16.5 + k, '#a8a0b8');
    for (let k = 0; k < 3; k++) fh(wx + 25, wx + 28, wy + 16.5 + k, '#a8a0b8');
    micro('TATTLER', wx + 19.5, wy + 14.5, '#4a3a5a');
    ell(wx + 44, wy + 18, 2.5, 0.75, '#ffffff');
    poly([[wx + 42, wy + 17.5], [wx + 46, wy + 17.5], [wx + 44.5, wy + 16]], '#f0c060');
    P1(wx + 44, wy + 16, '#d04050');
    T('PIE', wx + 2, wy + 21.5, enamel('#ffd977'), FT, { ls: 1, shadow: '#7a2a3a' });
    T('COFFEE', wx + 28, wy + 21.5, enamel('#ffd977'), FT, { shadow: '#7a2a3a' });
  });
  for (const mx of [wx + 17, wx + 35]) {
    R(mx - 0.5, wy, 1.5, wh, '#d8d2e2');
    fv(mx - 0.5, wy, wy + wh, '#ffffff');
  }
  boxF(wx - 2, wy + wh + 1.5, ww + 4, 5, '#d0484f');
  // door with a scalloped awning (door centre at x = 72)
  const dx = 64;
  const dy = 60;
  R(dx - 2, dy - 2, 20, GY - dy + 2, '#efeaf4');
  fv(dx - 2, dy - 2, GY, '#ffffff');
  fv(dx + 17.5, dy - 2, GY, '#9a8eb4');
  glassF(dx, dy, 16, 20, () => {
    R(dx, dy, 16, 20, '#e7a468');
    R(dx, dy + 12, 16, 8, '#b45a4c');
    RR(dx + 6, dy + 4, 5, 10, 2, '#d0444f');
    fh(dx, dx + 16, dy + 12, '#f2eef6');
  });
  R(dx, dy + 20, 16, GY - dy - 20, '#d4cbe0');
  fh(dx, dx + 16, dy + 20, '#ffffff');
  fh(dx, dx + 16, dy + 20.5, '#f2eef6');
  R(dx + 2, dy + 24, 12, 1, '#a89cc0');
  fh(dx + 2, dx + 14, dy + 24, '#e8e4f0');
  FR(dx, GY - 4, 16, 4, (fx, _fy, o) => (fx % 3 === 0 ? '#a89cc0' : o));
  R(dx + 13, dy + 14, 2, 5, '#f2eef6');
  fv(dx + 13, dy + 14, dy + 19, '#ffffff');
  RR(dx + 2, dy + 2, 12, 7, 1, '#2f2440');
  neon('OPEN', dx + 2, dy + 3, '#e6fff8', '#38e0c8', FT, { sp: 0 });
  awning(dx - 4, dy - 9, 24, 5, '#d4464e', '#fff1dc', 3);
  // wall lantern, menu card, house number
  R(85, 54, 3, 2, '#4a3050');
  RR(84, 56, 5, 7, 1, '#4a3050');
  R(85, 57, 3, 4, '#ffe08a');
  P1(86, 58, '#fffbe8');
  fh(85, 88, 61, '#f2b84a');
  R(82, 66, 13, 14, '#fff4dc');
  fh(82, 95, 66, '#ffffff');
  fv(82, 66, 80, '#ffffff');
  fv(94.5, 66, 80, '#c8b8a0');
  T('ACW', 83, 67, enamel('#c9404c'), FT, { sp: 0 });
  for (let k = 0; k < 5; k++) micro(['EGGS 2.50', 'PIE .90', 'BLT 3', 'MELT 3.25', 'JOE .45'][k], 83, 73 + k * 1.5, '#7a6a8a');
  fh(82.5, 95.5, 80, tint('#2b2140', 0.35));
  RR(83, 45, 9, 6, 1, '#2f5a68');
  fh(84, 91, 45, '#4a8090');
  T('12', 84, 46, '#fff4dc', FT, { sp: 1 });
  // a chrome edge on the left corner
  fv(0, pT, pB, '#ffffff');
  fv(HF, pT, pB, '#f2eef6');
}
building('b-diner', {
  w: 96,
  h: 96,
  door: 24,
  draw: drawDiner,
  shadowTop: 29,
  label: 'Hot Tag Diner',
  solid: { x: -48, y: -66, w: 96, h: 66 },
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
      rect: [0, 42, 96, 6],
      draw: (f) => bulbs([[2, 42], [32, 42, 3], [64, 42, 3], [94, 42, 3]], f, 1),
    },
  ],
  lights: [
    [31, 63, 32, WARM],
    [72, 72, 18, WARM],
    [86, 59, 12, LAMP],
    [36, 10, 26, '#ff7ab0'],
    [60, 14, 22, '#5ff2d6'],
  ],
});

// =====================================================================
//  STEEL CHAIR HARDWARE  (80 x 96, door +16)
//  A western false-front in mustard clapboard, chairs fanned in the window.
// =====================================================================
function drawHardware(): void {
  const W = 80;
  const GY = 96;
  const ffTop = 8;
  const sideTop = 22;
  // roof behind the false front
  flatRoof(0, 14, W, 10, 21, '#7e7090');
  ventF(4, 16, 4);
  // clapboard walls
  siding(0, sideTop, W, GY - sideTop, '#e8b45a', 21, 4, 0.02);
  siding(14, ffTop, W - 28, sideTop - ffTop, '#e8b45a', 22, 4, 0.02);
  shadeRight(W - 9, sideTop, 9, GY - sideTop, 0.24);
  // cornice + brackets
  R(12, ffTop - 3, W - 24, 3, '#3a6f78');
  fh(12, W - 12, ffTop - 3, '#7ac0b0');
  fh(12, W - 12, ffTop - 0.5, '#24485a');
  for (const [x0, x1] of [[0, 16], [W - 16, W]] as [number, number][]) {
    R(x0, sideTop - 3, x1 - x0, 3, '#3a6f78');
    fh(x0, x1, sideTop - 3, '#7ac0b0');
    fh(x0, x1, sideTop - 0.5, '#24485a');
  }
  for (let x = 14; x < W - 14; x += 5) {
    R(x, ffTop, 2, 2, '#2f5a68');
    P1(x, ffTop, '#5aa39a');
  }
  aoTop(14, ffTop, W - 28, 3, 0.25);
  // corner boards
  for (const [x, lit] of [[0, true], [W - 2, false]] as [number, boolean][]) {
    R(x, sideTop, 2, GY - sideTop, lit ? '#3a6f78' : '#2f5a68');
    fv(x, sideTop, GY, lit ? '#7ac0b0' : '#3a6f78');
    fv(x + 1.5, sideTop, GY, '#24485a');
  }
  // painted sign board
  signBoardF(5, 17, 70, 20, '#2f5a68', '#fbefd4');
  TC('STEEL CHAIR', 40.5, 21.5, '#e8b48a', FM, {});
  TC('STEEL CHAIR', 40, 21, enamel('#a8323e'), FM, {});
  TC('HARDWARE', 40, 30, worn('#2f6a74', 31, 0.06), FT, { ls: 1 });
  chairIcon(8, 27, '#7a7096', '#4e4870');
  chairIcon(67, 27, '#7a7096', '#4e4870');
  for (const [sx, sy] of [[7, 18.5], [72.5, 18.5], [7, 35], [72.5, 35]] as [number, number][]) P1(sx, sy, '#8a7a6a');
  // gutter and awning
  awning(3, 42, W - 6, 7, '#5f9a6a', '#fbefd4', 4);
  // display window (left)
  const wx = 6;
  const wy = 56;
  const ww = 40;
  const wh = 30;
  R(wx - 2, wy - 2, ww + 4, wh + 4, '#3a6f78');
  fh(wx - 2, wx + ww + 2, wy - 2, '#7ac0b0');
  fv(wx - 2, wy - 2, wy + wh + 2, '#5aa39a');
  fh(wx - 2, wx + ww + 2, wy + wh + 1.5, '#24485a');
  glassF(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#5a4a6e');
    // pegboard with tools
    FR(wx, wy, ww, 18, (fx, fy) => ((fx % 6 === 2 && fy % 6 === 2) ? '#4a3a5e' : '#6e5e86'));
    R(wx, wy + 22, ww, wh - 22, '#7a5a5a');
    fh(wx, wx + ww, wy + 22, '#a87a6a');
    L(wx + 3, wy + 3, wx + 3, wy + 11, '#c8b8a0');
    R(wx + 1, wy + 3, 5, 2, '#b8b0c8');
    fh(wx + 1, wx + 6, wy + 3, '#e8e4f0');
    L(wx + 7, wy + 3, wx + 9, wy + 10, '#c88a5a');
    R(wx + 8, wy + 9, 3, 3, '#9a92b0');
    ell(wx + 4, wy + 15, 2.5, 1.2, '#d84a4a');
    fv(wx + 4, wy + 13, wy + 15, '#4a3a5e');
    // fan of folding chairs
    for (let i = 0; i < 3; i++) chairFront(wx + 13 + i * 8, wy + 7 + (i === 1 ? -2 : 0), '#eeeaf6', i === 1 ? '#c8c2da' : '#aaa2c2', '#6e668a');
    const can = (x: number, y: number, c: string) => {
      R(x, y, 4, 4, c);
      fh(x, x + 4, y, '#e8e4f0');
      fh(x, x + 4, y + 3.5, shA(c, 0.35));
      R(x + 0.5, y + 1.5, 3, 1, '#fff4e0');
      P1(x + 1, y + 2, c);
    };
    can(wx + 2, wy + 25, '#e05a5a');
    can(wx + 6, wy + 25, '#4a8ad0');
    can(wx + 10, wy + 25, '#f2c050');
    can(wx + 4, wy + 21, '#6fb070');
    can(wx + 8, wy + 21, '#c070c0');
    RR(wx + 24, wy + 19, 15, 10, 1, '#fff4dc');
    fh(wx + 24.5, wx + 38.5, wy + 19, '#ffffff');
    T('SALE', wx + 25, wy + 20, enamel('#c9404c'), FT, { sp: 0 });
    T('$5', wx + 28, wy + 25, '#2f6a74', FT, { sp: 1 });
    cat(wx + 33, wy + 15, '#e8a050', '#4a8a4a');
  });
  R(wx + 19.5, wy, 1.5, wh, '#3a6f78');
  fv(wx + 19.5, wy, wy + wh, '#5aa39a');
  T('CHAIRS', wx + 1, wy + 1, '#ffffff', FT, { sp: 0 });
  micro('KEYS CUT', wx + 21.5, wy + 1.5, '#ffffff');
  // door (centre x = 56)
  doorF(49, 60, 14, 36, '#4f9a92', { frame: '#2f5a68', lite: true, liteH: 13, wall: '#7a5a6e', kick: '#c8c4d8', step: '#c8b0a8' });
  RR(50, 66, 12, 6, 1, '#fff4dc');
  T('OPEN', 50.5, 66.5, enamel('#a8323e'), FT, { sp: 0 });
  P1(56, 65, '#8a7a6a');
  // shop bell bracket
  fh(62, 65, 58, '#f2c050');
  ell(64.5, 59.5, 1, 1, '#f2c050');
  // nail keg + rakes and brooms leaning on the wall
  for (const [x, h, c] of [[70, 30, '#c88a5a'], [73, 34, '#b87a4a'], [76, 28, '#d89a6a']] as [number, number, string][]) {
    L(x, GY - 2, x + 2, GY - h, c);
    L(x + 0.5, GY - 2, x + 2.5, GY - h, shA(c, 0.3));
  }
  for (let k = 0; k < 6; k++) fv(69 + k, GY - 30, GY - 28.5, '#9a92b0');
  R(73, GY - 37, 4, 5, '#e8c070');
  FR(73, GY - 32, 4, 2, (fx) => (fx % 2 ? '#c89a50' : '#e8c070'));
  RR(64, GY - 9, 7, 8, 2, '#a8704f');
  fh(64, 71, GY - 9, '#d09a6a');
  fh(64, 71, GY - 6, '#5a4a4a');
  fh(64, 71, GY - 3, '#5a4a4a');
  FR(64.5, GY - 10, 6, 1.5, (fx, fy) => (hash2(fx, fy, 23) < 0.6 ? '#c8c4d8' : null));
  downspout(W - 4, sideTop, GY - 1, '#8aa0a8');
  grime(0, GY - 10, W, 10, 0.22);
  footing(0, GY - 3, 46, 3, '#c8a888', 21);
}
building('b-hardware', {
  w: 80,
  h: 96,
  door: 16,
  draw: drawHardware,
  shadowTop: 8,
  label: 'Steel Chair Hardware',
  solid: { x: -40, y: -70, w: 80, h: 70 },
  lights: [
    [26, 71, 28, WARM],
    [56, 70, 14, WARM],
  ],
});
// =====================================================================
//  THE SPORTATORIUM  (176 x 140, door 0, barn doors 36 wide)
//  A 1931 hay barn that became the town's arena: red board-and-batten
//  gambrel, a standing-seam roof, the masked-rooster cupola, a bulb-lit
//  painted sign, tin lean-tos (box office left, the back door right).
// =====================================================================
const SP_W = 176;
const SP_H = 140;
const SP_CX = 88;
const SP_WALL = 90; // eave height (y)
const SP_KNEE = 62; // gambrel break
const SP_PEAK = 40;
const spOutline = (dy = 0): [number, number][] => [
  [16, SP_H],
  [16, SP_WALL + dy],
  [34, SP_KNEE + dy],
  [SP_CX, SP_PEAK + dy],
  [SP_W - 34, SP_KNEE + dy],
  [SP_W - 16, SP_WALL + dy],
  [SP_W - 16, SP_H],
];
/** y of the gambrel profile at x (front face, dy shifts it up/down). */
function spY(x: number, dy = 0): number {
  const o = spOutline(dy);
  for (let i = 1; i < 5; i++) {
    const [ax, ay] = o[i];
    const [bx, by] = o[i + 1];
    if (x >= ax && x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return SP_WALL + dy;
}
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
    // the wire itself, a fine line with a little sag between bulbs
    for (let j = 0; j < n; j++) {
      const x0 = ax + ((bx - ax) * j) / n;
      const y0 = ay + ((by - ay) * j) / n;
      const x1 = ax + ((bx - ax) * (j + 1)) / n;
      const y1 = ay + ((by - ay) * (j + 1)) / n;
      wire(x0, y0 + 0.5, x1, y1 + 0.5, 0.8, '#4a3550');
    }
    for (let j = 0; j < n; j++, k++) {
      const x = Math.round(ax + ((bx - ax) * j) / n);
      const y = Math.round(ay + ((by - ay) * j) / n) + 1;
      const on = (k + f) % 3 !== 0;
      P1(x + 0.5, y, '#5a4a5a');
      R(x, y + 0.5, 1, 1, on ? '#ffc65a' : '#a86a4a');
      P1(x, y + 0.5, on ? '#fff8d8' : '#d89a6a');
      if (on) {
        P1(x - 0.5, y + 1, over('#ffd77a', 0.5));
        P1(x + 1, y + 1, over('#ffd77a', 0.5));
        P1(x + 0.5, y + 1.5, over('#ffd77a', 0.4));
        P1(x, y + 2, over('#ffd77a', 0.3));
      }
    }
  }
}
// the painted sign (bulb-framed), shared by the base and the chase overlay
const SG_X = 36;
const SG_Y = 57;
const SG_W = 104;
const SG_H = 25;
function spSignBulbs(f: number): void {
  let k = 0;
  const bulb = (x: number, y: number) => {
    const on = (k + f) % 4 < 2;
    k++;
    R(x - 0.5, y - 0.5, 1.5, 1.5, on ? '#ffc65a' : '#9a6a4a');
    P1(x - 0.5, y - 0.5, on ? '#fffbe8' : '#c89a6a');
    if (on) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) P1(x + dx * 1, y + dy * 1, over('#ffd77a', 0.35));
  };
  for (let x = SG_X + 3; x < SG_X + SG_W - 2; x += 4) bulb(x, SG_Y + 1);
  for (let x = SG_X + SG_W - 4; x > SG_X + 2; x -= 4) bulb(x, SG_Y + SG_H - 1.5);
}
/** Board-and-batten paint with fine battens, grain, knots, sun fade high up and grime low. */
function battenPaint(base: Color, seed: number, top: number, bot: number, pitch = 6) {
  const B = col(base);
  const pf = pitch * 2;
  return () => {
    const fx = FX;
    const fy = FY;
    const k = ((fx % pf) + pf) % pf;
    const t = (fy / 2 - top) / Math.max(1, bot - top);
    let c = mixc(liA(B, 0.16), shA(B, 0.1), Math.max(0, Math.min(1, t)));
    if (k === 0) return liA(c, 0.34);
    if (k === 1) return liA(c, 0.12);
    if (k === 2) return shA(c, 0.42);
    if (k === 3) c = shA(c, 0.16);
    const g = hash2(fx, fy >> 3, seed);
    if (g < 0.12) c = shA(c, 0.08);
    else if (g > 0.95) c = liA(c, 0.1);
    // knots
    const kn = hash2(fx >> 2, fy >> 3, seed + 3);
    if (kn > 0.994) return shA(c, 0.35);
    // nail heads on the battens' neighbours
    if (k === 3 && fy % 24 === 0) return '#5a3a48';
    if (hash2(fx, fy, seed + 5) < 0.012) return liA(c, 0.4);
    return c;
  };
}
function drawSportatorium(): void {
  const GY = SP_H;
  const cx = SP_CX;
  // ---- the roof receding behind the gambrel, standing seams parallel to the profile
  FR(16, SP_PEAK - 12, 144, SP_WALL - SP_PEAK + 16, (fx, fy) => {
    const x = (fx + 0.5) / 2;
    const y = (fy + 0.5) / 2;
    const front = spY(x, 0);
    const back = spY(x, -12);
    if (y < back || y >= front + 2) return null;
    const d = front - y;
    const left = x < cx;
    const upper = x > 34 && x < SP_W - 34;
    let base = left ? (upper ? '#77709a' : '#625b88') : upper ? '#57507c' : '#4a4370';
    const sd = Math.floor(d * 2) % 7;
    if (sd === 0) return liA(base, 0.32);
    if (sd === 1) return shA(base, 0.2);
    let c = col(base);
    if (d > 10) c = mixc(c, '#8a84b0', 0.35); // the far end catches more sky
    if (hash2(fx >> 1, Math.floor(d * 2 / 7), 501) < 0.1 && hash2(fx, fy, 502) < 0.5) c = mixc(c, '#a8643c', 0.35);
    return c;
  });
  // ridge cap running back from the peak
  R(cx - 0.5, SP_PEAK - 12, 1.5, 12, '#a8a2c8');
  fv(cx - 0.5, SP_PEAK - 12, SP_PEAK, '#d8d4ec');
  // ---- cupola on the ridge with the masked rooster weathervane
  const cyB = SP_PEAK - 5; // cupola sill
  R(cx - 8, cyB, 16, 2, '#4e4670');
  fh(cx - 8, cx + 8, cyB, '#8a84a8');
  R(cx - 7, cyB - 12, 14, 12, battenPaint('#c4473f', 9, cyB - 12, cyB, 4));
  R(cx - 5, cyB - 10, 10, 8, '#3b2a4f');
  for (let x = cx - 5; x < cx + 5; x += 1.5) {
    R(x, cyB - 10, 1, 8, '#fbefd2');
    fh(x, x + 1, cyB - 10, '#ffffff');
    fv(x + 0.5, cyB - 9.5, cyB - 2, '#c8b0a8');
  }
  fh(cx - 7, cx + 7, cyB - HF, '#5a2a3a');
  R(cx - 7, cyB - 3, 14, 1, '#fbefd2');
  // pyramid cap
  poly([[cx - 9.5, cyB - 11], [cx, cyB - 20], [cx + 9.5, cyB - 11]], '#5a5280');
  FR(cx - 10, cyB - 21, 20, 11, (fx, _fy, o) => {
    if (!o) return null;
    const x = (fx + 0.5) / 2;
    return x < cx ? ((fx & 3) === 0 ? '#9a94c0' : '#78729e') : (fx & 3) === 3 ? '#3e3862' : '#544c7a';
  });
  fh(cx - 10, cx + 10, cyB - 11, '#fbefd2');
  fh(cx - 10, cx + 10, cyB - 10.5, '#c8a0a0');
  // finial, rod, compass arms
  ell(cx, cyB - 21, 1.25, 1.25, '#f4b63f');
  P1(cx - 0.5, cyB - 21.5, '#fff0a0');
  fv(cx, cyB - 30, cyB - 21, '#4a3550');
  fh(cx - 3, cx + 3.5, cyB - 25, '#4a3550');
  micro('W', cx - 5.5, cyB - 26.25, '#4a3550');
  micro('E', cx + 4, cyB - 26.25, '#4a3550');
  // the rooster, in a luchador mask
  const rx = cx - 4;
  const ry = cyB - 35;
  ['...##....', '..####...', '#######.#', '.########', '..######.', '...####..', '....#.#..'].forEach((row, yy) =>
    [...row].forEach((ch, xx) => {
      if (ch === '#') P(rx + xx, ry + yy, '#4a3550');
    }),
  );
  P1(rx + 3, ry + 0.5, '#e8505a');
  P1(rx + 3.5, ry, '#e8505a');
  P1(rx + 4, ry + 0.5, '#e8505a');
  R(rx + 2, ry + 1.5, 2.5, 1, '#ffd34a');
  P1(rx + 2.5, ry + 1.5, '#4a3550');
  P1(rx + 3.5, ry + 1.5, '#4a3550');
  P1(rx + 1, ry + 2, '#f4b63f');
  fh(rx + 3, rx + 8, ry + 3, '#6a5070');
  // ---- tin lean-to wings either side
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 0 : SP_W - 18;
    const top = SP_WALL + 1;
    // walls: corrugated tin, a later addition
    R(x0, top + 5, 18, GY - top - 5, '#8aa0a8');
    metalF(x0, top + 5, 18, GY - top - 5, '#8aa0a8', 31 + side, 2, 0.35);
    // shed roof sloping away from the barn
    for (let i = 0; i < 36; i++) {
      const x = x0 + i * HF;
      const t = side < 0 ? (18 - i * HF) / 18 : (i * HF) / 18;
      const y = top + t * 4;
      fv(x, y, top + 6.5, i % 4 === 0 ? '#9a94b8' : i % 4 === 3 ? '#4e4670' : '#6a6488');
      P1(x, y, '#c8c2e0');
    }
    gutter(x0, x0 + 18, top + 5.5, '#a8a4bc');
    aoTop(x0, top + 7, 18, 5, 0.3);
    grime(x0, GY - 12, 18, 9, 0.24);
  }
  // left: the box office
  {
    signBoardF(2, 98, 14, 7, '#5b3a62', '#fbefd2');
    T('TIX', 3.5, 99, enamel('#b8303e'), FT, { sp: 0 });
    R(2, 107, 14, 13, '#4a3a4a');
    glassF(3, 108, 12, 11, () => {
      R(3, 108, 12, 11, '#e7a468');
      FR(3, 108, 12, 11, (fx) => (fx % 4 === 0 ? '#d9955e' : null));
      R(3, 115, 12, 4, '#a8603a');
      // Birdie's beehive behind the glass, and the cash box
      ell(8, 110.5, 2.25, 2.5, '#d8c0e8');
      RR(6.5, 111.5, 3, 3.5, 1, '#f0b890');
      P1(7.5, 113, AK);
      P1(8.5, 113, AK);
      R(6, 115, 4, 3, '#4f9a9a');
      R(11, 114, 3, 2, '#7a7a90');
      fh(11, 14, 114, '#a8a8c0');
    });
    // speaking hole and the trough
    ell(9, 112, 1.25, 1.25, (_x: number, _y: number, o: number) => mixc(o, '#5a4a5a', 0.35));
    R(1.5, 119, 15, 1.5, '#c8a888');
    fh(1.5, 16.5, 119, '#e8c8a8');
    RR(4, 121, 10, 5, 1, '#fff4dc');
    T('$5', 5.5, 121, enamel('#2f6a74'), FT, { sp: 1 });
    fh(4, 14, 126, tint('#3a2848', 0.3));
    // the wire to the meter on the barn
    wire(1, 96, 15, 96, 1.5, '#3a3048');
  }
  // right: the stage door side
  {
    const x0 = SP_W - 18;
    // electric meter + conduit up to the roof
    fv(x0 + 4, SP_WALL + 2, 104, '#7a7890');
    fv(x0 + 4.5, SP_WALL + 2, 104, '#a8a6bc');
    RR(x0 + 2, 104, 5, 7, 1, '#9a98ac');
    ell(x0 + 4.5, 106.5, 1.5, 1.5, '#e8f0f0');
    fh(x0 + 3.5, x0 + 5.5, 106.5, AK);
    // tin NO REFUNDS sign, a little crooked
    poly([[x0 + 8, 98], [x0 + 17, 97], [x0 + 17.5, 104], [x0 + 8.5, 105]], '#fbefd2');
    micro('NO', x0 + 9.5, 98.5, '#b8303e');
    micro('REFUNDS', x0 + 9, 101.5, '#b8303e');
    P1(x0 + 9, 98.5, '#8a7a7a');
    P1(x0 + 16.5, 97.5, '#8a7a7a');
    oldPoster(x0 + 9, 108, 7, 9, '#ff94b4', '#6e2a78', 77);
    downspout(SP_W - 2, SP_WALL + 7, GY - 1, '#a8a4bc');
    // stacked folding chairs
    for (let i = 0; i < 5; i++) {
      const y = 132 - i * 2;
      R(x0 + 2, y, 11, 2, i % 2 ? '#c8c2da' : '#aaa2c2');
      fh(x0 + 2, x0 + 13, y, '#f2eef8');
      fh(x0 + 2, x0 + 13, y + 1.5, '#6e668a');
    }
    fv(x0 + 3, 134, GY - 0.5, '#6e668a');
    fv(x0 + 12, 134, GY - 0.5, '#6e668a');
    L(x0 + 3, GY - 1, x0 + 12, 134, '#8a84a0');
  }
  // ---- the gambrel facade: red board-and-batten
  poly(spOutline(), battenPaint('#c4473f', 77, SP_PEAK, GY));
  // gambrel trim: two fine light rows and a shadow line beneath
  const o = spOutline();
  const edge = (a: [number, number], b: [number, number]) => {
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      P1(x, y, '#fffaf0');
      P1(x, y + 0.5, '#fbefd2');
      P1(x, y + 1, '#fbefd2');
      P1(x, y + 1.5, '#e8d4c0');
      P1(x, y + 2, (_X: number, _Y: number, oo: number) => (oo ? shA(oo, 0.4) : null));
      P1(x, y + 2.5, (_X: number, _Y: number, oo: number) => (oo ? shA(oo, 0.2) : null));
    }
  };
  edge([o[1][0] - 1, o[1][1]], o[2]);
  edge(o[2], o[3]);
  edge(o[3], o[4]);
  edge(o[4], [o[5][0] + 1, o[5][1]]);
  // corner boards
  for (const x of [16, SP_W - 18]) {
    R(x, SP_WALL + 1, 2, GY - SP_WALL - 1, '#fbefd2');
    fv(x, SP_WALL + 1, GY, '#fffaf0');
    fv(x + 1.5, SP_WALL + 1, GY, '#d8c0b0');
  }
  // sun from the left: the right of the facade falls into soft shade
  shadeRight(118, SP_PEAK, 40, GY - SP_PEAK, 0.18);
  // hay hood at the peak with its old pulley
  poly([[cx - 6, SP_PEAK + 6], [cx, SP_PEAK - 0.5], [cx + 6, SP_PEAK + 6]], '#9a3442');
  L(cx - 6, SP_PEAK + 6, cx, SP_PEAK, '#fbefd2');
  L(cx, SP_PEAK, cx + 6, SP_PEAK + 6, '#e8d4c0');
  R(cx - 0.5, SP_PEAK + 2, 1, 4, '#5a3a48');
  ell(cx, SP_PEAK + 6.5, 1.25, 1.25, '#4a3550');
  P1(cx - 0.5, SP_PEAK + 6, '#8a7a8a');
  fv(cx + 1, SP_PEAK + 6.5, SP_PEAK + 9, '#c8a878');
  // round hayloft window, the spotlight booth glowing inside
  const facadeP = battenPaint('#c4473f', 77, SP_PEAK, GY);
  glassF(cx - 4, 47, 8, 8, () => {
    R(cx - 4, 47, 8, 8, '#ffcf7a');
    circ(cx + 1, 52, 2.5, '#f2a85a');
    ell(cx - 1.5, 53, 1.5, 2, '#7a4a4a'); // the light op's head
  });
  FR(cx - 6, 45, 12, 12, (fx, fy, oo) => {
    const d = Math.hypot((fx + 0.5) / 2 - cx, (fy + 0.5) / 2 - 51);
    if (d <= 4) return oo;
    if (d <= 4.6) return '#5a3a48';
    if (d <= 5.6) return fy / 2 < 51 ? '#fffaf0' : '#e0c8b8';
    if (d <= 6.1) return shA(facadeP(), 0.3);
    return facadeP();
  });
  R(cx - 0.25, 46.5, 0.5, 9, '#fbefd2');
  R(cx - 4.5, 50.75, 9, 0.5, '#fbefd2');
  // ---- the big painted sign, bulb-framed, standing proud of the facade
  R(SG_X + 6, SG_Y + SG_H, 2, 3, '#4a3550');
  R(SG_X + SG_W - 8, SG_Y + SG_H, 2, 3, '#4a3550');
  RR(SG_X, SG_Y, SG_W, SG_H, 2, '#5b3a62');
  fh(SG_X + 2, SG_X + SG_W - 2, SG_Y, '#8a5a8e');
  RR(SG_X + 1.5, SG_Y + 2.5, SG_W - 3, SG_H - 5, 2, '#d8a040');
  RR(SG_X + 2, SG_Y + 3, SG_W - 4, SG_H - 6, 2, '#fbefd2');
  FR(SG_X + 2, SG_Y + 3, SG_W - 4, SG_H - 6, (fx, fy, oo) => {
    if (!oo) return null;
    const n = hash2(fx, fy, 511);
    if (n < 0.05) return '#f0dcc0';
    if (fy % 10 === 0) return mixc(oo, '#e8d0b0', 0.25); // planks under the paint
    return oo;
  });
  fh(SG_X + 3, SG_X + SG_W - 3, SG_Y + 3, '#fffaf0');
  fh(SG_X + 3, SG_X + SG_W - 3, SG_Y + SG_H - 3.5, '#e0c8a8');
  TC('SPORTATORIUM', cx + 1, SG_Y + 7, '#eba24a', FM, { bold: true });
  TC('SPORTATORIUM', cx + 0.5, SG_Y + 6.5, '#7a2034', FM, { bold: true });
  TC('SPORTATORIUM', cx, SG_Y + 6, enamel('#c0343f', 0.25), FM, { bold: true });
  // the hand-painted ribbon with the date
  const rw = 40;
  R(cx - rw / 2, SG_Y + 15.5, rw, 5, '#3f8a86');
  fh(cx - rw / 2, cx + rw / 2, SG_Y + 15.5, '#6ab8a8');
  fh(cx - rw / 2, cx + rw / 2, SG_Y + 20, '#2a5a5e');
  poly([[cx - rw / 2 - 4, SG_Y + 16], [cx - rw / 2, SG_Y + 16], [cx - rw / 2, SG_Y + 20.5], [cx - rw / 2 - 4, SG_Y + 20.5], [cx - rw / 2 - 2.5, SG_Y + 18.25]], '#2f6a70');
  poly([[cx + rw / 2 + 4, SG_Y + 16], [cx + rw / 2, SG_Y + 16], [cx + rw / 2, SG_Y + 20.5], [cx + rw / 2 + 4, SG_Y + 20.5], [cx + rw / 2 + 2.5, SG_Y + 18.25]], '#2f6a70');
  TC('EST. 1931', cx, SG_Y + 16, enamel('#fff4dc'), FT, { sp: 1 });
  for (const sx2 of [SG_X + 10, SG_X + SG_W - 11]) {
    const st = ['..#..', '.###.', '#####', '.###.', '.#.#.'];
    st.forEach((row, yy) => [...row].forEach((ch, xx) => ch === '#' && P(sx2 - 2 + xx, SG_Y + 14 + yy, yy === 0 || xx === 0 ? '#ffd060' : '#e8a24a')));
  }
  spSignBulbs(0);
  // ---- the ACW belt plate under the sign
  R(cx - 17, 85, 34, 3, '#7a2a40');
  fh(cx - 17, cx + 17, 85, '#a84060');
  for (let x = cx - 16; x < cx + 16; x += 2) P1(x, 86.5, '#c8a050');
  RR(cx - 9, 82.5, 18, 8, 2, '#f4b63f');
  fh(cx - 8, cx + 8, 82.5, '#fff0a0');
  fh(cx - 8, cx + 8, 90, '#a8702a');
  RR(cx - 6.5, 84, 13, 5, 1, '#c88a2a');
  T('ACW', cx - 5.5, 84, enamel('#fff4dc', 0.4), FT, { sp: 0 });
  for (const sx of [cx - 8, cx + 7.5]) {
    P1(sx, 84, '#e84a5a');
    P1(sx, 88, '#5a7ad0');
  }
  // ---- door track with rollers, and the big barn doors standing a little open
  const dw = 36;
  const dx = cx - dw / 2;
  const dy = 95;
  R(dx - 6, dy - 3.5, dw + 12, 2, '#4a3a4a');
  fh(dx - 6, dx + dw + 6, dy - 3.5, '#8a7a8a');
  fh(dx - 6, dx + dw + 6, dy - 1.5, tint('#2b2140', 0.45));
  for (const rx2 of [dx + 3, dx + 13, dx + dw - 14, dx + dw - 4]) {
    ell(rx2, dy - 2.5, 1.5, 1.5, '#3a3048');
    P1(rx2 - 0.5, dy - 3, '#9a8aa0');
    R(rx2 - 0.25, dy - 1.5, 0.5, 2, '#3a3048');
  }
  // casing
  R(dx - 1, dy - 1, dw + 2, GY - dy + 1, '#fbefd2');
  fv(dx - 1, dy - 1, GY, '#fffaf0');
  // the gap between the doors: the ring inside, ropes and the crowd's glow
  const gx = cx - 3;
  R(gx, dy, 6, GY - dy, '#ffd07a');
  FR(gx, dy, 6, GY - dy, (fx, fy) => {
    const y = fy / 2;
    const t = (y - dy) / (GY - dy);
    let c: Color = mixc('#fff0b8', '#e89a5a', t);
    const ry = y - dy;
    if (ry >= 24 && ry < 25.5) c = ry < 24.5 ? '#ff8a90' : '#d8343f';
    else if (ry >= 28 && ry < 29.5) c = ry < 28.5 ? '#ffffff' : '#d8d0d8';
    else if (ry >= 32 && ry < 33.5) c = ry < 32.5 ? '#8aa8f0' : '#4a64c0';
    else if (ry > 35 && y > GY - 4 - hash2(fx >> 2, 1, 513) * 4) c = hash2(fx >> 2, 2, 513) < 0.5 ? '#6a3a5a' : '#8a4a5a';
    return c;
  });
  R(gx + 3.5, dy + 21, 2, 17, '#c8c0d8');
  fv(gx + 3.5, dy + 21, dy + 38, '#ffffff');
  R(gx + 3, dy + 20, 3, 1.5, '#3a3048');
  for (const [ox, w] of [[0, 15], [21, 15]] as [number, number][]) {
    const bx = dx + ox;
    R(bx, dy, w, GY - dy, battenPaint('#b93e3e', 90 + ox, dy, GY, 5));
    // frame and the X braces in cream
    const tr = '#fbefd2';
    R(bx, dy, w, 1.5, tr);
    R(bx, GY - 1.5, w, 1.5, tr);
    R(bx, dy + (GY - dy) / 2 - 0.75, w, 1.5, tr);
    R(bx, dy, 1.5, GY - dy, tr);
    R(bx + w - 1.5, dy, 1.5, GY - dy, tr);
    const mid = dy + (GY - dy) / 2;
    for (const [y0, y1] of [[dy + 1, mid], [mid, GY - 1]] as [number, number][]) {
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const yy = y0 + (y1 - y0) * t;
        R(bx + 1 + (w - 3) * t, yy, 1.25, 0.5, tr);
        R(bx + w - 2.25 - (w - 3) * t, yy, 1.25, 0.5, tr);
        P1(bx + 1.5 + (w - 3) * t, yy + 0.5, '#c8a8a0');
      }
    }
    fh(bx, bx + w, dy + 1.5, '#d8b8b0');
    // iron strap hinges and a handle
    for (const hy of [dy + 5, GY - 8]) {
      const hx = ox ? bx + w - 7 : bx;
      R(hx, hy, 7, 1.5, '#3a3048');
      fh(hx, hx + 7, hy, '#6a5a70');
      P1(ox ? hx + 1 : hx + 5.5, hy + 0.5, '#9a8aa0');
    }
    const kx = ox ? bx + 2 : bx + w - 3.5;
    R(kx, dy + 17, 1.5, 6, '#3a3048');
    fv(kx, dy + 17, dy + 23, '#7a6a80');
  }
  // light spilling across the door faces by the gap
  for (let k = 1; k < 6; k++) {
    FR(gx - k, dy + 2, 1, GY - dy - 3, (fx, fy, oo) => (dth(fx, fy, 9 - k * 1.6) ? mixc(oo, '#ffd27a', 0.45) : oo));
    FR(gx + 5 + k, dy + 2, 1, GY - dy - 3, (fx, fy, oo) => (dth(fx, fy, 9 - k * 1.6) ? mixc(oo, '#ffd27a', 0.45) : oo));
  }
  // gooseneck lamps over the doors
  sconce(dx - 3, dy - 7, '#3f8a86', 4);
  sconce(dx + dw + 3, dy - 7, '#3f8a86', 4);
  // ---- show posters in glass cases either side, old bills pasted between
  for (const [px, kind] of [[26, 'wed'], [124, 'sat']] as [number, 'wed' | 'sat'][]) {
    oldPoster(px < 80 ? px - 7 : px + 29, 103, 4, 11, px < 80 ? '#fbefd8' : '#ffe070', px < 80 ? '#3f8a86' : '#c8307a', px);
    R(px - 2, 98, 30, 36, '#5b3a62');
    fh(px - 2, px + 28, 98, '#8a5a8e');
    fv(px - 2, 98, 134, '#7a5482');
    fv(px + 27.5, 98, 134, '#3a2440');
    poster(px, 100, 26, 32, kind);
    // the case glass
    FR(px, 100, 26, 32, (fx, fy, oo) => {
      const d = (fx - px * 2 + (fy - 200) * 0.6) % 70;
      return d > 10 && d < 13 ? mixc(oo, '#fff8e8', 0.35) : d > 15 && d < 16 ? mixc(oo, '#fff8e8', 0.2) : oo;
    });
    fh(px - 2, px + 28, 134, tint('#2b2140', 0.4));
    sconce(px + 13, 95, '#3f8a86', 2);
  }
  // ---- grime, splash and the stone footing
  grime(18, GY - 14, SP_W - 36, 10, 0.2);
  footing(0, GY - 4, SP_W, 4, '#b8a0b0', 7);
  // the bulbs (frame 0; overlay animates them)
  spBulbs(0);
}
/** Painted sign board with fine bevel and grain. */
function signBoardF(x: number, y: number, w: number, h: number, border: Color, fill: Color): void {
  RRB(x, y, w, h, 1, border, fill);
  fh(x + 1, x + w - 1, y + 1, liA(fill, 0.5));
  fh(x + 1, x + w - 1, y + h - 1.5, shA(fill, 0.1));
  fh(x + 1, x + w - 1, y, liA(border, 0.3));
  FR(x + 1, y + 1, w - 2, h - 2, (fx, fy, o) => (hash2(fx, fy, x * 7 + y) < 0.04 ? shA(o, 0.06) : o));
  fh(x + 0.5, x + w, y + h, tint('#2b2140', 0.35));
}
building('b-sportatorium', {
  w: SP_W,
  h: SP_H,
  door: 0,
  draw: drawSportatorium,
  label: 'The Sportatorium',
  shadowTop: 62,
  pad: [0, 0, 12, 4],
  solid: { x: -88, y: -94, w: 176, h: 94 },
  anims: [
    { fps: 4, frames: 3, rect: [16, 40, 144, 56], draw: (f) => spBulbs(f) },
    { fps: 6, frames: 4, rect: [SG_X, SG_Y - 1, SG_W, SG_H + 2], draw: (f) => spSignBulbs(f) },
  ],
  lights: [
    [88, 51, 18, WARM],
    [88, 120, 34, WARM],
    [67, 90, 14, LAMP],
    [109, 90, 14, LAMP],
    [39, 98, 14, LAMP],
    [137, 98, 14, LAMP],
    [88, 70, 48, '#ffc070'],
    [9, 113, 12, WARM],
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
  const GY = 88;
  flatRoof(0, 4, W, 11, 31);
  FR(0, 4, W, 11, (fx, fy, o) => (hash2(fx, fy, 32) < 0.1 ? shA(o, 0.1) : o));
  ventF(66, 6, 5);
  // rooftop water tank on legs
  R(6, 3, 10, 7, '#8aa0a8');
  metalF(6, 3, 10, 7, '#8aa0a8', 33, 2, 0.4);
  ell(11, 3, 5, 1, '#b8c8d0');
  for (const lx of [7, 14]) R(lx, 10, 1, 4, '#5a4a5a');
  // gold butterfly standing on the roof edge
  R(39, 9, 2, 5, '#5a4468');
  fv(39, 9, 14, '#8a6a8a');
  butterfly(40, 5, 1);
  tileCoping(0, 14, W);
  // warm stucco with teal + pink trim
  stucco(0, 20, W, GY - 20, '#f6d4b0', 33);
  R(0, 20, W, 2, '#ff5d8f');
  fh(0, W, 20, '#ff9ab8');
  fh(0, W, 21.5, '#c8406e');
  R(0, 22, 3, GY - 22, '#2fa59a');
  fv(0, 22, GY, '#7ad8c8');
  fv(2.5, 22, GY, '#1f6e6a');
  R(W - 3, 22, 3, GY - 22, '#24807c');
  fv(W - 3, 22, GY, '#3fb0a4');
  aoTop(3, 22, W - 6, 4, 0.2);
  papel(3, 23, 77, 3, 1);
  // sign board
  signBoardF(8, 31, 64, 18, '#1f6e6a', '#2fa59a');
  FR(9, 32, 62, 16, (fx, fy, o) => ((fx + fy) % 12 === 0 ? liA(o, 0.08) : o));
  TC('TAQUERIA', 40, 33, enamel('#fff4dc'), FT, { ls: 1 });
  TC('MARIPOSA', 40.5, 40.5, '#1f5a58', FM, {});
  TC('MARIPOSA', 40, 40, enamel('#ffd34a', 0.35), FM, {});
  butterfly(15, 40, 1);
  butterfly(66, 40, 1);
  // a crack in the stucco and a patched spot
  L(74, 52, 76, 58, (_x: number, _y: number, o: number) => shA(o, 0.25));
  R(58, 50, 6, 4, '#fbe2c4');
  // arched teal door, centre x = 24
  const dx = 17;
  const dy = 52;
  RR(dx - 2.5, dy - 5, 19, GY - dy + 5, 4, '#ff5d8f');
  fh(dx, dx + 14, dy - 5, '#ff9ab8');
  RR(dx - 1, dy - 3.5, 16, GY - dy + 3.5, 3, '#c8406e');
  RR(dx, dy - 3, 14, GY - dy + 3, 3, '#2fa59a');
  R(dx, dy, 14, GY - dy, battenPaint('#2fa59a', 34, dy, GY, 3.5));
  fv(dx, dy - 2, GY, '#7ad8c8');
  fv(dx + 13.5, dy - 2, GY, '#1f6e6a');
  glassF(dx + 3, dy, 8, 11, () => room(dx + 3, dy, 8, 11, '#f2a868', 7));
  RR(dx + 3, dy - 1.5, 8, 2, 1, '#2fa59a');
  R(dx + 6.75, dy, 0.5, 11, '#2fa59a');
  R(dx + 3, dy + 14, 8, 10, '#24807c');
  fh(dx + 3, dx + 11, dy + 14, '#1f6e6a');
  fh(dx + 3, dx + 11, dy + 23.5, '#5ac8b8');
  R(dx + 11, dy + 17, 2, 2, '#ffd34a');
  P1(dx + 11, dy + 17, '#fff0a0');
  R(dx - 4, GY - 2, 22, 2, '#d0694a');
  fh(dx - 4, dx + 18, GY - 2, '#ee9070');
  FR(dx - 4, GY - 2, 22, 2, (fx, _fy, o) => (fx % 8 === 0 ? '#9a3e3e' : o));
  // chili ristra by the door
  fv(36, 48, 51, '#6a4a3a');
  for (let k = 0; k < 9; k++) {
    const yy = 51 + k * 1.4;
    ell(36 + (k % 2) * 0.5, yy, 1, 0.9, k % 3 === 0 ? '#b8202e' : '#e8303a');
    P1(35.5 + (k % 2) * 0.5, yy - 0.5, '#ff8a80');
  }
  P1(36, 50, '#5a9a4a');
  P1(36.5, 50.5, '#7ab060');
  // arched window with striped awning
  const wx = 42;
  const wy = 61;
  const ww = 32;
  const wh = 18;
  RR(wx - 2, wy - 2, ww + 4, wh + 4, 2, '#ff5d8f');
  fh(wx, wx + ww, wy - 2, '#ff9ab8');
  glassF(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#f2a868');
    FR(wx, wy, ww, 12, (fx) => (fx % 10 === 0 ? '#e09858' : null));
    R(wx, wy + 12, ww, wh - 12, '#a8603a');
    fh(wx, wx + ww, wy + 12, '#d88a4e');
    // hanging lanterns, a menu board, the taco plate and a cook
    for (const lx of [wx + 5, wx + 16, wx + 27]) {
      fv(lx, wy, wy + 2, '#5a4060');
      const lc = ['#ff5d8f', '#ffd34a', '#2fa59a'][(lx >> 2) % 3];
      RR(lx - 1.5, wy + 2, 3, 3.5, 1, lc);
      fh(lx - 1, lx + 1, wy + 2, liA(lc, 0.4));
      P1(lx, wy + 5.5, over('#fff0b0', 0.5));
    }
    R(wx + 9, wy + 1, 5, 4, '#3a4a4c');
    for (let k = 0; k < 3; k++) micro('$1', wx + 9.5, wy + 1.5 + k * 1, '#fff4dc');
    RR(wx + 18, wy + 6, 5, 6, 2, '#fff4e6');
    R(wx + 18.5, wy + 4.5, 4, 2, '#fff4e6');
    RR(wx + 19, wy + 7, 3, 3, 1, '#c88a68');
    P1(wx + 19.5, wy + 8, AK);
    P1(wx + 21, wy + 8, AK);
    ell(wx + 8, wy + 11, 4, 1.25, '#fff4e6');
    for (let k = 0; k < 3; k++) {
      ell(wx + 6 + k * 2, wy + 10, 1, 0.7, '#f2c060');
      P1(wx + 6 + k * 2, wy + 9.5, '#6fb050');
      P1(wx + 6.5 + k * 2, wy + 9.5, '#e8303a');
    }
    R(wx + 25, wy + 8, 3, 4, '#ff5d8f');
    R(wx + 28.5, wy + 9, 2.5, 3, '#ffd34a');
    fh(wx + 25, wx + 28, wy + 8, '#ff9ab8');
  });
  R(wx + 15.5, wy, 1, wh, '#ff5d8f');
  fv(wx + 15.5, wy, wy + wh, '#ff9ab8');
  awning(wx - 3, wy - 9, ww + 6, 4, '#2fa59a', '#ff5d8f', 3);
  R(wx - 2, wy + wh + 2, ww + 4, 1.5, '#c8406e');
  fh(wx - 2, wx + ww + 2, wy + wh + 2, '#ff8ab0');
  // talavera tile wainscot along the base
  const tY = GY - 6;
  FR(3, tY, W - 6, 3, (fx, fy) => {
    const kx = fx % 6;
    const ky = (fy - tY * 2) % 6;
    if (kx === 0 || ky === 0) return '#e8dcc8';
    const d = Math.abs(kx - 3) + Math.abs(ky - 3);
    return d <= 1 ? '#2f5ab0' : d === 2 ? '#fff8ec' : (kx + ky) % 4 === 0 ? '#ffb030' : '#fff8ec';
  });
  fh(3, W - 3, tY, '#c8b8a0');
  // marigolds and a little cactus in pots
  pot(wx - 1, GY - 10, '#d0694a', '#5f9a5a', '#ffb030');
  pot(wx + 8, GY - 10, '#2fa59a', '#5f9a5a', '#ff8a30');
  RR(70, GY - 13, 4, 9, 2, '#5a9a5a');
  fv(70.5, GY - 12, GY - 5, '#7ac070');
  RR(67.5, GY - 11, 2, 4, 1, '#5a9a5a');
  R(68.5, GY - 8, 2, 1, '#5a9a5a');
  for (let k = 0; k < 4; k++) P1(71 + (k % 2) * 2, GY - 12 + k * 2, '#e8f0c0');
  P1(72, GY - 13.5, '#ff5d8f');
  R(68, GY - 4, 8, 4, '#d0694a');
  fh(68, 76, GY - 4, '#ee9070');
  // painted menu
  R(4, 52, 10, 13, '#5a3a3a');
  R(4.5, 52.5, 9, 12, '#3a4a4c');
  FR(4.5, 52.5, 9, 12, (fx, fy, o) => (hash2(fx, fy, 35) < 0.06 ? mixc(o, '#fff4dc', 0.2) : o));
  T('$2', 5, 53.5, enamel('#ffd34a'), FT, { sp: 0 });
  for (let k = 0; k < 4; k++) micro(['TACO', 'SOPA', 'AGUA', 'MOLE'][k], 5, 59 + k * 1.4, '#fff4dc');
  wire(0, 26, 8, 30, 2, '#3a3048');
  grime(3, GY - 12, W - 6, 6, 0.16);
}
building('b-taqueria', {
  w: 80,
  h: 88,
  door: -16,
  draw: drawTaqueria,
  shadowTop: 14,
  label: 'Taqueria Mariposa',
  solid: { x: -40, y: -62, w: 80, h: 62 },
  lights: [
    [24, 60, 14, WARM],
    [58, 69, 22, WARM],
    [40, 39, 20, '#ffe08a'],
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
  const GY = 88;
  // gentle mansard roof in lavender shingles, the shop sign mounted on it
  shingleF(2, 4, W - 4, 17, '#9a7ab8', 41, 3, 5, 0.12);
  fh(2, W - 2, 4, '#d8c0ec');
  fh(2, W - 2, 20.5, '#5a4070');
  ventF(56, 1, 4);
  signBoardF(3, 6, 62, 13, '#8a5a8a', '#fff6ee');
  TC('TALLBRIDGE', 34.5, 9.5, '#f6c0d0', FM, {});
  TC('TALLBRIDGE', 34, 9, enamel('#d0507a'), FM, {});
  // a giant cupcake on the roof corner
  R(66, 9, 11, 9, '#d09a5a');
  FR(66, 9, 11, 9, (fx) => (fx % 3 === 0 ? '#a8703a' : fx % 3 === 1 ? '#e8b878' : '#d09a5a'));
  fh(66, 77, 9, '#f0c888');
  RR(64, 0, 14, 10, 4, '#ffb6cc');
  ell(71, 2.5, 5.5, 2.75, '#ffd0de');
  ell(70, 2, 2.5, 1.25, '#ffe8f0');
  FR(64, 6, 14, 4, (fx, fy, o) => (o && (fx + (fy >> 1)) % 5 === 0 ? '#ff9ab8' : o));
  circ(71, 0.5, 1.5, '#e8303a');
  P1(70.5, 0, '#ff9a9a');
  for (const [sx, sy, c] of [[67, 4, '#7ad0e8'], [74, 5, '#ffe070'], [69, 6, '#a8e070'], [75, 3, '#ffffff'], [72, 6.5, '#7ad0e8'], [66, 6, '#ffe070']] as [number, number, string][]) {
    P1(sx, sy, c);
    P1(sx + 0.5, sy, c);
  }
  // pastel plaster walls
  stucco(0, 21, W, GY - 21, '#fbe2d8', 43);
  R(0, 21, W, 2, '#8ad0b8');
  fh(0, W, 21, '#b8f0dc');
  fh(0, W, 22.5, '#5aa898');
  fv(0, 23, GY, '#fff4ee');
  shadeRight(W - 6, 23, 6, GY - 23, 0.14);
  aoTop(0, 23, W, 4, 0.18);
  // BAKERY painted on the wall with little wheat sprigs
  T('BAKERY', 7.5, 27.5, '#c8e8dc', FM, {});
  T('BAKERY', 7, 27, worn('#5aa898', 44, 0.07), FM, {});
  for (const wx2 of [3, 43]) {
    fv(wx2 + 0.25, 27, 34, '#c89040');
    for (let k = 0; k < 4; k++) {
      ell(wx2 - 0.75, 28 + k * 1.6, 0.9, 0.6, '#f2c870');
      ell(wx2 + 1.25, 28 + k * 1.6, 0.9, 0.6, '#e8b858');
    }
  }
  // pastel striped awning over the window
  awning(3, 38, 40, 6, '#ffb6cc', '#fff6ee', 3);
  for (let x = 3; x < 43; x += 6) P1(x + 1, 39, '#8ad0b8');
  // window with tiny cakes, loaves on the lower shelf
  const wx = 6;
  const wy = 50;
  const ww = 34;
  const wh = 22;
  R(wx - 2, wy - 2, ww + 4, wh + 4, '#fff6ee');
  fh(wx - 2, wx + ww + 2, wy - 2, '#ffffff');
  fh(wx - 2, wx + ww + 2, wy + wh + 1.5, '#d8b8c8');
  glassF(wx, wy, ww, wh, () => {
    R(wx, wy, ww, wh, '#ffe2c8');
    FR(wx, wy, ww, wh, (fx) => (fx % 12 === 0 ? '#ffd4ba' : null));
    for (const sy of [wy + 10, wy + 18]) {
      R(wx, sy, ww, 1, '#e8c0a8');
      fh(wx, wx + ww, sy, '#fff0e0');
    }
    cake(wx + 2, wy + 3, '#ffb6cc', '#fff6ee');
    cake(wx + 10, wy + 4, '#8ad0b8', '#ffe070', 1);
    cake(wx + 18, wy + 3, '#fff6ee', '#c8a0e0');
    cake(wx + 26, wy + 4, '#e8a868', '#ffb6cc', 1);
    for (let k = 0; k < 5; k++) {
      const c = ['#d09a5a', '#ffb6cc', '#e8c070', '#c8a0e0', '#8ad0b8'][k];
      RR(wx + 2 + k * 6, wy + 14, 4, 3, 1, c);
      fh(wx + 2.5 + k * 6, wx + 5.5 + k * 6, wy + 14, liA(c, 0.5));
      P1(wx + 3 + k * 6, wy + 14.5, '#fff6ee');
    }
    for (let k = 0; k < 4; k++) {
      ell(wx + 5 + k * 8, wy + 20.5, 3, 1.4, '#c8843a');
      fh(wx + 3 + k * 8, wx + 7 + k * 8, wy + 19.5, '#e8b060');
      for (let j = 0; j < 3; j++) P1(wx + 3.5 + k * 8 + j * 1.5, wy + 20, '#f8d898');
    }
    micro('FRESH DAILY', wx + 1, wy + 1, '#d0507a');
  });
  R(wx + 16.5, wy, 1, wh, '#fff6ee');
  boxF(wx - 2, wy + wh + 1.5, ww + 4, 9, '#8ad0b8');
  // the oversized door (the baker is seven feet tall), centre x = 56
  const dx = 46;
  const dy = 40;
  R(dx - 3, dy - 1, 26, GY - dy + 1, '#8a5a8a');
  RR(dx - 3, dy - 7, 26, 8, 3, '#8a5a8a');
  fh(dx - 1, dx + 21, dy - 7, '#b07ab0');
  RR(dx - 1, dy - 5, 22, 6, 2, '#fff6ee');
  R(dx - 1, dy, 22, GY - dy, '#fff6ee');
  doorF(dx, dy, 20, GY - dy, '#8ad0b8', { frame: '#fff6ee', lite: true, liteH: 18, wall: '#ffe2c8', seed: 11, kick: '#5aa898', step: '#c8b0a8' });
  // rolling pin over the door
  R(dx + 3, dy - 4, 14, 2, '#e8c08a');
  fh(dx + 3, dx + 17, dy - 4, '#ffe0b0');
  fh(dx + 3, dx + 17, dy - 2.5, '#b8885a');
  R(dx + 1, dy - 3.5, 2, 1, '#a8704a');
  R(dx + 17, dy - 3.5, 2, 1, '#a8704a');
  RR(dx + 6, dy + 26, 8, 5, 1, '#fff6ee');
  T('HI', dx + 7, dy + 26, enamel('#d0507a'), FT, {});
  // chalkboard easel
  L(70, GY - 1, 72, GY - 14, '#a8704f');
  L(78, GY - 1, 76, GY - 14, '#7a4a3a');
  RR(69, GY - 15, 10, 11, 1, '#a8704f');
  R(70, GY - 14, 8, 9, '#3a4a4c');
  micro('ROLLS', 70.5, GY - 13, '#fff4dc');
  micro('PIE', 70.5, GY - 11, '#ffb6cc');
  micro('$1', 70.5, GY - 9, '#ffd977');
  ell(75, GY - 7, 1.5, 1, '#e8b060');
  grime(0, GY - 9, W, 8, 0.18);
  footing(0, GY - 3, 43, 3, '#c8b0b8', 45);
}
building('b-bakery', {
  w: 80,
  h: 88,
  door: 16,
  draw: drawBakery,
  shadowTop: 6,
  label: 'Tallbridge Bakery',
  solid: { x: -40, y: -62, w: 80, h: 62 },
  lights: [
    [23, 61, 22, WARM],
    [56, 52, 16, WARM],
  ],
});

// ---------------------------------------------------------------- WRSL 1340 AM
const OA_Y = 42;
function onAir(on: boolean): void {
  const y = OA_Y;
  RR(18, y, 28, 8, 2, '#3a2a40');
  fh(19, 45, y, '#5a4a60');
  if (on) {
    RR(19, y + 1, 26, 6, 1, '#e8303a');
    fh(20, 44, y + 1, '#ff8a80');
    neon('ON AIR', 32 - Math.round(TW('ON AIR', FT) / 2), y + 2, '#fff0e8', '#ff4a50', FT);
  } else {
    RR(19, y + 1, 26, 6, 1, '#7a3a48');
    fh(20, 44, y + 1, '#9a5060');
    T('ON AIR', 32 - Math.round(TW('ON AIR', FT) / 2), y + 2, '#a85a64', FT);
  }
}
function drawRadio(): void {
  const W = 64;
  const GY = 88;
  flatRoof(0, 4, W, 12, 51);
  // little roof antenna and dish
  fv(52, 0, 12, '#9a94b8');
  fv(52.5, 0, 12, '#5a5478');
  for (let y = 1; y < 12; y += 3) fh(50, 55, y, '#9a94b8');
  P(52, 0, '#ff4a50');
  ell(12, 9, 4, 2, '#d8d4e8');
  ell(12, 9, 2.5, 1, '#a8a4c0');
  ell(11, 8.5, 1.5, 0.5, '#f4f2fa');
  L(12, 9, 15, 6, '#6e688e');
  fv(12, 10, 14, '#6e688e');
  wire(14, 13, 52, 11, 1.5, '#3a3048');
  // brick body
  brickF(0, 15, W, GY - 15, '#b4584a', '#9a4a46', '#7a4a52', 52);
  R(0, 15, W, 3, '#d8c8b8');
  fh(0, W, 15, '#f2e6d6');
  fh(0, W, 17.5, '#9a8a8a');
  FR(0, 15.5, W, 2, (fx, _fy, o) => (fx % 8 === 0 ? '#b8a898' : o));
  aoTop(0, 18, W, 3, 0.25);
  shadeRight(W - 6, 18, 6, GY - 18, 0.22);
  // deco pilasters
  for (const px of [1, W - 4]) {
    R(px, 18, 3, GY - 21, '#d8c8b8');
    fv(px, 18, GY - 3, '#f2e6d6');
    fv(px + 2.5, 18, GY - 3, '#a89888');
    for (let y = 22; y < GY - 4; y += 6) fh(px, px + 3, y, '#b8a898');
  }
  // vintage deco sign
  RRB(6, 20, 52, 20, 4, '#2f5a68', '#fbefd4');
  fh(9, 55, 20, '#5a8a98');
  RR(8, 22, 48, 16, 3, '#f6e2bc');
  FR(8, 22, 48, 16, (fx, fy, o) => (o && hash2(fx, fy, 53) < 0.05 ? '#e8d0a8' : o));
  TC('WRSL', 32.5, 24.5, '#e8a24a', FM, { bold: true });
  TC('WRSL', 32, 24, enamel('#b8303e'), FM, { bold: true });
  TC('1340 AM', 32, 32, enamel('#2f6a74'), FT, {});
  // lightning zigzags either side
  for (const sx of [10, 50]) {
    L(sx, 24, sx + 2, 27, '#e8a24a');
    L(sx + 2, 27, sx, 28, '#e8a24a');
    L(sx, 28, sx + 2, 33, '#e8a24a');
    P1(sx + 0.5, 24, '#fff0a0');
  }
  onAir(false);
  // glass-block windows
  for (const gx of [6, 45]) {
    R(gx - 1, 55, 15, 20, '#d8c8b8');
    fh(gx - 1, gx + 14, 55, '#f2e6d6');
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 3; x++) {
        const bx = gx + x * 4 + 0.5;
        const by = 56 + y * 4.5 + 0.5;
        R(bx, by, 3.5, 4, '#a8d0d8');
        FR(bx, by, 3.5, 4, (fx, fy) => ((fx + fy) % 3 === 0 ? '#c8e8ec' : (fx * 3 + fy) % 7 === 0 ? '#7aa8b8' : null));
        fh(bx, bx + 3.5, by, '#e8f8f8');
        fv(bx, by, by + 4, '#e8f8f8');
        fv(bx + 3, by, by + 4, '#6a9aaa');
        R(bx + 1, by + 1, 1.5, 2, over('#ffd890', 0.45));
      }
    R(gx - 2, 75, 17, 1.5, '#e8d8c8');
    fh(gx - 2, gx + 15, 75, '#fff4e4');
    fh(gx - 2, gx + 15, 76.5, tint('#2b2140', 0.35));
    streaks(gx - 1, 77, 15, 5, gx);
  }
  // door with a little deco canopy (centre x = 32)
  R(21, 50, 22, 2.5, '#2f5a68');
  fh(21, 43, 50, '#7ac0b0');
  fh(21, 43, 52, '#1a3a48');
  for (let x = 22; x < 42; x += 2.5) P1(x, 52.5, '#24485a');
  aoTop(22, 53, 20, 2, 0.3);
  doorF(25, 55, 14, 33, '#4f9a92', { frame: '#d8c8b8', lite: true, liteH: 12, seed: 54, kick: '#c8c4d8', step: '#c8b0a8' });
  micro('STUDIO', 27.5, 72, '#fff4dc');
  // record decals
  for (const [rx, ry] of [[21.5, 66], [42.5, 66]] as [number, number][]) {
    circ(rx, ry, 2.5, '#2b2140');
    FR(rx - 2.5, ry - 2.5, 5, 5, (fx, fy, o) => (o === col('#2b2140') && (fx + fy) % 3 === 0 ? '#3a3050' : o));
    R(rx - 0.5, ry - 0.5, 1, 1, '#ff5d8f');
    P1(rx - 1.5, ry - 1.5, '#6a6088');
  }
  downspout(W - 2, 18, GY - 1, '#a8a4bc');
  grime(0, GY - 10, W, 8, 0.22);
  footing(0, GY - 3, W, 3, '#c8b0a8', 55);
}
building('b-radio', {
  w: 64,
  h: 88,
  door: 0,
  draw: drawRadio,
  shadowTop: 10,
  label: 'WRSL 1340 AM',
  solid: { x: -32, y: -62, w: 64, h: 62 },
  anims: [
    {
      fps: 0,
      frames: 2,
      rect: [16, OA_Y - 2, 32, 12],
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
    [32, OA_Y + 4, 16, '#ff4a50'],
    [13, 65, 12, WARM],
    [52, 65, 12, WARM],
    [32, 65, 12, WARM],
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
  const GY = 88;
  const gB = 26; // gable base
  // front gable with scalloped fish-scale shingles
  poly([[0, gB], [32, 4], [64, gB]], '#c8a0d8');
  FR(0, 4, W, gB - 4, (fx, fy, o) => {
    if (!o) return null;
    const rf = 6;
    const row = Math.floor(fy / rf);
    const k = fy % rf;
    const off = row % 2 ? 4 : 0;
    const kx = (fx + off) % 8;
    const base = row % 2 ? '#b48ccc' : '#c8a0d8';
    const dx = kx - 3.5;
    const edge = (dx * dx) / 16 + ((k - 1) * (k - 1)) / 25;
    if (k >= 4 && edge > 0.9) return shA(base, 0.35);
    if (k === 0) return shA(base, 0.25);
    return k === 5 ? liA(base, 0.3) : hash2(fx, fy, 61) < 0.05 ? liA(base, 0.15) : base;
  });
  L(0, gB, 32, 4, '#fbefd8');
  L(32, 4, 64, gB, '#fbefd8');
  L(1, gB + 1, 32, 6, '#d8b8c8');
  L(32, 5, 63, gB, '#d8b8c8');
  // a big wooden spool emblem in the gable
  spool(28, 10);
  // plum clapboard walls with marigold trim
  siding(0, gB, W, GY - gB, '#a084bc', 61, 4, 0.02);
  aoTop(0, gB + 1, W, 4, 0.25);
  R(0, gB, 2, GY - gB, '#f4b63f');
  fv(0, gB, GY, '#ffe08a');
  R(W - 2, gB, 2, GY - gB, '#c8902a');
  fv(W - 0.5, gB, GY, '#9a6a1a');
  shadeRight(W - 8, gB, 6, GY - gB, 0.16);
  // sign
  signBoardF(4, 29, 56, 12, '#7a3a7a', '#fff4dc');
  TC('SEW WHAT?', 32.5, 31.5, '#f4b63f', FM, {});
  TC('SEW WHAT?', 32, 31, enamel('#b8307a'), FM, {});
  // hanging spool sign on an iron bracket
  fh(55, 64, 43, '#4a3550');
  L(56, 43, 62, 40, '#4a3550');
  fv(57, 43, 46, '#4a3550');
  fv(62, 43, 46, '#4a3550');
  spool(55, 46);
  // left window: a mannequin in a sequined robe
  const wy = 54;
  const wh = 22;
  win(5, wy, 16, wh, {
    frame: '#f4b63f',
    cols: 1,
    rows: 1,
    interior: () => {
      R(5, wy, 16, wh, '#f2c8d8');
      FR(5, wy, 16, wh, (fx) => (fx % 6 === 0 ? '#ecbcd0' : null));
      R(5, wy + 18, 16, 4, '#c898b0');
      circ(13, wy + 3, 2, '#e8d8c8');
      P1(12.5, wy + 2, '#fff8f0');
      poly([[9, wy + 6], [17, wy + 6], [19, wy + 19], [7, wy + 19]], '#d0307a');
      FR(7, wy + 6, 12, 13, (fx, fy, o) => (o === col('#d0307a') && hash2(fx, fy, 62) < 0.18 ? (hash2(fx, fy, 63) < 0.5 ? '#ffd34a' : '#ffffff') : o));
      fh(9, 17, wy + 6, '#f4b63f');
      fv(13, wy + 6, wy + 19, '#a8205a');
      fv(13, wy + 19, wy + 21, '#8a7a6a');
      fh(11, 15, wy + 21.5, '#8a7a6a');
    },
  });
  // right window: bolts of fabric and a tape measure
  win(43, wy, 16, wh, {
    frame: '#f4b63f',
    cols: 1,
    rows: 1,
    cat: true,
    interior: () => {
      R(43, wy, 16, wh, '#f6dcc4');
      const bolts = ['#3f9a92', '#f4b63f', '#d8434b', '#9a6ad0', '#ff94b4', '#5a8ad0'];
      for (let i = 0; i < 6; i++) {
        const bx = 44 + (i % 3) * 5;
        const by = wy + 1 + Math.floor(i / 3) * 9;
        R(bx, by, 4, 8, bolts[i]);
        fv(bx, by, by + 8, liA(bolts[i], 0.4));
        fv(bx + 3.5, by, by + 8, shA(bolts[i], 0.3));
        for (let y = by + 1; y < by + 8; y += 1.5) fh(bx + 0.5, bx + 3.5, y, shA(bolts[i], 0.12));
      }
      curve(44, wy + 19, 58, wy + 19, 1.5, '#ffe070');
    },
  });
  // door (centre x = 32)
  doorF(25, 54, 14, 34, '#f4b63f', { frame: '#fff4dc', lite: true, liteH: 12, wall: '#f2c8d8', seed: 64, step: '#c8b0a8' });
  RR(26.5, 70, 11, 5, 1, '#fff4dc');
  T('SEW', 27.5, 70, enamel('#7a3a7a'), FT, {});
  fv(32, 68, 70, '#8a7a6a');
  // pincushion tomato pot by the step
  ell(42, GY - 3, 2, 1.5, '#e8303a');
  P1(41.5, GY - 4, '#ff8a80');
  P1(42, GY - 5, '#5a9a4a');
  grime(0, GY - 9, W, 7, 0.2);
  footing(0, GY - 3, 24, 3, '#b8a0b0', 65);
  footing(40, GY - 3, 24, 3, '#b8a0b0', 66);
}
building('b-tailor', {
  w: 64,
  h: 88,
  door: 0,
  draw: drawTailor,
  shadowTop: 12,
  label: 'Sew What?',
  solid: { x: -32, y: -62, w: 64, h: 62 },
  lights: [
    [13, 65, 14, WARM],
    [51, 65, 14, WARM],
    [32, 63, 10, WARM],
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
  const GY = 88;
  flatRoof(0, 4, W, 12, 71, '#9a92ae');
  ventF(8, 6, 5);
  R(44, 7, 12, 6, '#c8c4d8');
  fh(44, 56, 7, '#eeeaf6');
  FR(45, 8.5, 10, 3.5, (fx) => (fx % 2 ? '#9a94b0' : '#c8c4d8'));
  // crisp white siding with teal trim
  siding(0, 15, W, GY - 15, '#f2f0ec', 72, 5, 0.01);
  R(0, 15, W, 3, '#3f9a92');
  fh(0, W, 15, '#7ad0c0');
  fh(0, W, 17.5, '#2a6a66');
  aoTop(0, 18, W, 3, 0.2);
  R(0, 18, 2, GY - 18, '#3f9a92');
  fv(0, 18, GY, '#7ad0c0');
  R(W - 2, 18, 2, GY - 18, '#2f7a76');
  shadeRight(W - 8, 18, 6, GY - 18, 0.14);
  // sign with spine logo
  signBoardF(3, 20, 58, 18, '#2f7a76', '#ffffff');
  TC('HALLORAN', 32, 22, enamel('#2f6a74'), FM, {});
  TC('CHIROPRACTIC', 32, 31, enamel('#3f9a92'), FT, {});
  // projecting blade sign with the spine logo
  fh(56, 64, 44, '#4a3550');
  R(57, 45, 6, 13, '#ffffff');
  box(57, 45, 6, 13, '#2f7a76');
  fv(57.5, 45.5, 57.5, '#e8f4f0');
  spineLogo(60, 46, '#3f9a92', '#7fd0c0');
  // teal awning
  awning(3, 41, 58, 4, '#3f9a92', '#ffffff', 4);
  // windows with blinds and a skeleton model
  const wy = 54;
  for (const wx of [5, 45]) {
    win(wx, wy, 14, 18, {
      frame: '#3f9a92',
      cols: 1,
      rows: 1,
      interior: () => {
        R(wx, wy, 14, 18, '#dcecec');
        if (wx < 30) {
          circ(wx + 7, wy + 9, 1.5, '#f4f0e8');
          fv(wx + 7, wy + 10, wy + 16, '#f4f0e8');
          for (let k = 0; k < 3; k++) fh(wx + 5.5, wx + 8.5, wy + 11.5 + k * 1.2, '#f4f0e8');
          fv(wx + 7, wy + 16, wy + 18, '#8a8aa0');
        } else {
          RR(wx + 2, wy + 10, 10, 6, 1, '#9ac0b0');
          fh(wx + 2, wx + 12, wy + 10, '#c8e8dc');
          fv(wx + 3, wy + 16, wy + 18, '#6a8a80');
          fv(wx + 11, wy + 16, wy + 18, '#6a8a80');
        }
      },
      blinds: '#c8dcdc',
    });
  }
  pot(56, GY - 10, '#3f9a92', '#5f9a5a', null);
  R(56.5, GY - 15, 0.5, 6, '#4f8a5a');
  ell(57, GY - 15, 1.5, 2.5, '#6fb070');
  // door (centre x = 32)
  doorF(25, 54, 14, 34, '#3f9a92', { frame: '#ffffff', lite: true, liteH: 13, wall: '#dcecec', seed: 73, kick: '#c8c4d8', step: '#d8d0d8' });
  RR(27, 46, 10, 6, 1, '#ffffff');
  spineLogo(32, 46.5, '#3f9a92', '#7fd0c0');
  RR(26.5, 70, 11, 4, 1, '#fff4dc');
  micro('WALK INS', 27, 70.5, '#2f6a74');
  micro('WELCOME', 27, 72, '#2f6a74');
  downspout(1.5, 18, GY - 1, '#c8c4d8');
  grime(0, GY - 9, W, 7, 0.16);
  footing(0, GY - 3, W, 3, '#d8d4e0', 74);
}
building('b-clinic', {
  w: 64,
  h: 88,
  door: 0,
  draw: drawClinic,
  shadowTop: 10,
  label: 'Halloran Chiropractic',
  solid: { x: -32, y: -62, w: 64, h: 62 },
  lights: [
    [12, 63, 14, WARM],
    [52, 63, 14, WARM],
    [32, 63, 10, WARM],
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
  const GY = 88;
  // low hip roof in sage-teal shingles
  shingleF(1, 3, W - 2, 15, '#5a8a7a', 81, 3, 4, 0.2);
  fh(1, W - 1, 3, '#a8d0b8');
  poly([[1, 3], [6, 3], [1, 9]], 0);
  poly([[W - 1, 3], [W - 6, 3], [W - 1, 9]], 0);
  fh(1, W - 1, 17.5, '#2a4a40');
  // sage plaster
  stucco(0, 18, W, GY - 18, '#b0cca4', 83);
  fh(0, W, 18, '#e0ecd4');
  aoTop(0, 18, W, 4, 0.22);
  shadeRight(W - 7, 18, 7, GY - 18, 0.16);
  // sign
  signBoardF(3, 21, 58, 18, '#4a6a5a', '#f6f2e6');
  TC('HURRICANE', 32, 23, enamel('#3a6a6a'), FM, {});
  TC('PHYSIO & YOGA', 32, 32, enamel('#7a9a6a'), FT, {});
  // a vine of morning glories over the sign
  for (let x = 4; x < 60; x += 1.5) {
    const y = 20 + Math.sin(x * 0.4) * 1.2;
    P1(x, y, '#5f9a5a');
    if (hash2(x * 2, 0, 84) < 0.25) {
      P1(x, y - 0.5, '#9ab0f0');
      P1(x + 0.5, y - 0.5, '#c8d4ff');
    }
  }
  // two calm windows: yoga mats and plants on the left, a fern and a ball on the right
  const wy = 52;
  for (const [wx, left] of [[4, true], [43, false]] as [number, boolean][]) {
    win(wx, wy, 17, 19, {
      frame: '#f6f2e6',
      cols: 2,
      rows: 1,
      box: wx,
      boxC: '#7a9a6a',
      interior: () => {
        R(wx, wy, 17, 19, '#f2e2c4');
        R(wx, wy + 13, 17, 6, '#d8b890');
        FR(wx, wy + 13, 17, 6, (fx) => (fx % 6 === 0 ? '#c8a880' : null));
        if (left) {
          for (const [mx, c] of [[wx + 1, '#7a9ad0'], [wx + 9, '#e88aa0']] as [number, string][]) {
            R(mx, wy + 15, 7, 3, c);
            fh(mx, mx + 7, wy + 15, liA(c, 0.4));
            fh(mx, mx + 7, wy + 17.5, shA(c, 0.3));
          }
          ell(wx + 4, wy + 6, 2, 3, '#5f9a5a');
          P1(wx + 3.5, wy + 4, '#8ac070');
          R(wx + 3, wy + 9, 3, 3, '#a8704a');
          // a stretcher mid-pose
          circ(wx + 12, wy + 5, 1.25, '#c88a68');
          L(wx + 12, wy + 6, wx + 12, wy + 11, '#7a9ad0');
          L(wx + 12, wy + 7, wx + 9, wy + 4, '#c88a68');
          L(wx + 12, wy + 7, wx + 15, wy + 4, '#c88a68');
          L(wx + 12, wy + 11, wx + 10, wy + 14, '#4a5a7a');
          L(wx + 12, wy + 11, wx + 14, wy + 14, '#4a5a7a');
        } else {
          fv(wx + 12, wy, wy + 3, '#6a5a4a');
          ell(wx + 12, wy + 5, 3, 2, '#5f9a5a');
          for (let k = 0; k < 5; k++) P1(wx + 10 + k, wy + 7 + (k % 2) * 0.5, '#4f8a5a');
          circ(wx + 5, wy + 13, 3.5, '#8ac0d0');
          ell(wx + 4, wy + 11.5, 1.2, 0.8, '#d8f0f4');
          fh(wx + 2, wx + 8, wy + 13, '#6aa0b4');
        }
      },
    });
  }
  // door (centre x = 32)
  doorF(25, 54, 14, 34, '#7aa890', { frame: '#f6f2e6', lite: true, liteH: 14, wall: '#f2e2c4', seed: 85, step: '#c8c0b0' });
  RR(26, 46, 12, 6, 1, '#4a6a5a');
  fh(27, 37, 46, '#6a8a7a');
  lotusBolt(32, 48.5);
  // a rolled mat leaning by the door and a bamboo pot
  RR(40.5, GY - 13, 3, 12, 1, '#e88aa0');
  fv(40.5, GY - 13, GY - 1, '#ffb0c0');
  ell(42, GY - 13, 1.5, 0.75, '#c86a80');
  R(18.5, GY - 6, 4, 5, '#c8b8a0');
  fh(18.5, 22.5, GY - 6, '#e8dcc8');
  for (const [bx, h] of [[19.5, 12], [21, 15], [20.5, 9]] as [number, number][]) {
    fv(bx, GY - 6 - h, GY - 6, '#7ab060');
    for (let y = GY - 6 - h + 2; y < GY - 6; y += 3) fh(bx - 0.5, bx + 0.5, y, '#5a8a4a');
    P1(bx + 0.5, GY - 6 - h + 1, '#9ad070');
  }
  grime(0, GY - 9, W, 7, 0.16);
  footing(0, GY - 3, W, 3, '#c8c0b0', 86);
}
building('b-studio', {
  w: 64,
  h: 88,
  door: 0,
  draw: drawStudio,
  shadowTop: 8,
  label: 'Hurricane Physio & Yoga',
  solid: { x: -32, y: -62, w: 64, h: 62 },
  lights: [
    [12, 61, 14, WARM],
    [51, 61, 14, WARM],
    [32, 63, 12, WARM],
  ],
});

// ---------------------------------------------------------------- Fenwick's Pawn & Tapes
function vhs(x: number, y: number, c: Color): void {
  R(x, y, 2, 5, '#2b2140');
  VL(x + 1, y + 1, y + 3, c);
}
const PN_Y = 46;
function pawnNeon(on: boolean): void {
  RR(43, PN_Y, 18, 7, 1, '#2f2440');
  fh(44, 60, PN_Y, '#4a3a5a');
  neon('OPEN', 44, PN_Y + 1, '#ffe6f2', '#ff5fa0', FT, {}, on);
}
function drawPawn(): void {
  const W = 64;
  const GY = 88;
  flatRoof(0, 4, W, 12, 91, '#857590');
  ventF(50, 6, 5);
  // tired mustard brick
  brickF(0, 15, W, GY - 15, '#c89a5a', '#b4884e', '#8a6a58', 92);
  R(0, 15, W, 3, '#6a5a6a');
  fh(0, W, 15, '#9a8a9a');
  fh(0, W, 17.5, '#3a2a40');
  aoTop(0, 18, W, 3, 0.25);
  shadeRight(W - 6, 18, 6, GY - 18, 0.2);
  // a faded ghost ad painted on the brick, mostly gone
  FR(4, 38, 40, 6, (fx, fy, o) => {
    const ix = Math.floor(fx / 3);
    return hash2(ix, fy >> 2, 93) < 0.35 && hash2(fx, fy, 94) < 0.7 ? mixc(o, '#fff4dc', 0.28) : o;
  });
  // the three gold pawn balls on a scrolled bracket
  fh(52, 64, 19, '#4a3550');
  L(54, 19, 60, 23, '#4a3550');
  fv(58, 19, 23, '#4a3550');
  for (const [bx, by] of [[55, 25], [61, 25], [58, 29.5]] as [number, number][]) {
    circ(bx, by, 2.4, '#f4b63f');
    ell(bx + 0.5, by + 0.75, 1.75, 1.5, '#d89a2a');
    P1(bx - 1, by - 1, '#fff0a0');
    P1(bx - 0.5, by - 1.5, '#fffbe0');
  }
  // sign
  signBoardF(3, 20, 48, 17, '#7a2a3a', '#fbefd4');
  TC("FENWICK'S", 27.5, 22.5, '#e8b090', FM, {});
  TC("FENWICK'S", 27, 22, enamel('#b8303e'), FM, {});
  TC('PAWN & TAPES', 27, 31, worn('#2f6a74', 95, 0.08), FT, {});
  // cluttered windows behind security bars
  const wy = 54;
  const wh = 24;
  for (const wx of [3, 41]) {
    R(wx - 1, wy - 1, 22, wh + 2, '#4a3a4a');
    fh(wx - 1, wx + 21, wy - 1, '#6a5a6a');
    glassF(wx, wy, 20, wh, () => {
      R(wx, wy, 20, wh, '#5a4a5e');
      R(wx, wy + 18, 20, 6, '#7a5a4a');
      fh(wx, wx + 20, wy + 18, '#9a7a6a');
      if (wx < 30) {
        for (let i = 0; i < 9; i++) vhs(wx + 1 + i * 2, wy + 12, ['#e8505a', '#3f9a92', '#f4b63f', '#9a6ad0', '#fff4dc'][i % 5]);
        for (let i = 0; i < 7; i++) vhs(wx + 2 + i * 2, wy + 6, ['#5a8ad0', '#ff94b4', '#f4b63f'][i % 3]);
        for (let i = 0; i < 4; i++) vhs(wx + 4 + i * 2, wy + 18, ['#fff4dc', '#3f9a92'][i % 2]);
        R(wx + 2, wy + 1, 12, 3, '#ffe070');
        micro('2 FOR $1', wx + 2.5, wy + 1.5, '#b8303e');
      } else {
        for (const [tx, ty] of [[wx + 1, wy + 9], [wx + 9, wy + 12]] as [number, number][]) {
          RR(tx, ty, 10, 8, 1, '#8a7a6a');
          fh(tx + 0.5, tx + 9.5, ty, '#b8a898');
          R(tx + 1, ty + 1, 6, 5, '#7ae0d0');
          FR(tx + 1, ty + 1, 6, 5, (fx, fy) => (fy % 2 ? '#5ac0b0' : hash2(fx, fy, 96) < 0.2 ? '#d8fff8' : null));
          P1(tx + 8, ty + 2, '#d8d4e8');
          P1(tx + 8, ty + 4, '#d8d4e8');
        }
        ell(wx + 17, wy + 8, 2, 3, '#d8843a');
        ell(wx + 17, wy + 5, 1.5, 1.5, '#d8843a');
        P1(wx + 17, wy + 7, AK);
        fv(wx + 17, wy, wy + 5, '#6a4a3a');
        fv(wx + 17.5, wy + 1, wy + 9, '#e8e4d8');
        R(wx + 1, wy + 1, 6, 4, '#f4b63f');
        micro('GOLD', wx + 1.5, wy + 1.5, '#7a2a3a');
      }
    });
    // bars
    for (let x = wx + 2.5; x < wx + 20; x += 3) {
      R(x, wy, 1, wh, '#3a3048');
      fv(x, wy, wy + wh, '#6a6080');
    }
    R(wx, wy + 11.5, 20, 1, '#3a3048');
    fh(wx, wx + 20, wy + 11.5, '#6a6080');
    R(wx - 2, wy + wh + 1, 24, 1.5, '#a8988a');
    fh(wx - 2, wx + 22, wy + wh + 1, '#c8b8a8');
  }
  pawnNeon(true);
  acUnit(4, 43);
  // door (centre x = 32)
  doorF(25, 54, 14, 34, '#6a5a7a', { frame: '#d8c8b8', lite: true, liteH: 14, wall: '#5a4a5e', seed: 97, kick: '#9a92a8', step: '#b8a8a0' });
  for (let x = 27.5; x < 37; x += 2.5) R(x, 56, 0.5, 14, '#3a3048');
  R(27, 72, 10, 5, '#fff4dc');
  fh(27, 37, 72, '#ffffff');
  T('BUY', 27.5, 72, enamel('#b8303e'), FT, {});
  // milk crate of records and a cracked step
  R(57, GY - 8, 7, 8, '#3f6ab0');
  FR(57, GY - 8, 7, 8, (fx, fy) => (fx % 3 === 0 || fy % 4 === 0 ? '#2f4a80' : null));
  for (let k = 0; k < 4; k++) R(57.5 + k * 1.5, GY - 10, 1, 3, k % 2 ? '#2b2140' : '#e8505a');
  L(28, GY - 1, 31, GY - 2, '#7a6a72');
  grime(0, GY - 10, W, 9, 0.24);
  footing(0, GY - 3, 24, 3, '#a8908a', 98);
  footing(40, GY - 3, 24, 3, '#a8908a', 99);
}
building('b-pawn', {
  w: 64,
  h: 88,
  door: 0,
  draw: drawPawn,
  shadowTop: 10,
  label: "Fenwick's Pawn & Tapes",
  solid: { x: -32, y: -62, w: 64, h: 62 },
  anims: [
    {
      fps: 0,
      frames: 2,
      rect: [42, PN_Y - 3, 20, 10],
      pick: neonFlicker(73, [5, 6, 12, 40, 41]),
      skip: (f) => f === 0,
      draw: () => pawnNeon(false),
    },
  ],
  lights: [
    [13, 64, 14, WARM],
    [51, 64, 14, WARM],
    [52, PN_Y + 3, 14, '#ff6aa8'],
    [32, 63, 10, WARM],
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
const BP_Y = 50;
function drawSalon(): void {
  const W = 64;
  const GY = 88;
  flatRoof(0, 4, W, 10, 101, '#9a84a8');
  ventF(52, 5, 4);
  // gold scalloped parapet
  for (let x = 0; x < W; x += 6) {
    RR(x, 11, 6, 5, 2, '#f4b63f');
    fh(x + 1, x + 5, 11, '#fff0a0');
    P1(x + 2, 12, '#fffbe0');
    fh(x + 1, x + 5, 15.5, '#c8902a');
    ell(x + 3, 13.5, 1, 1, '#ff8ab0');
  }
  fh(0, W, 16, '#9a6a1a');
  // pink walls with cream pinstripes
  R(0, 16.5, W, GY - 16.5, (x: number) => (x % 8 === 0 ? '#ffd4e0' : '#f6b0c4'));
  FR(0, 16.5, W, GY - 16.5, (fx, fy, o) => (fx % 16 === 1 ? '#e898b0' : hash2(fx, fy, 102) < 0.04 ? liA(o, 0.15) : o));
  aoTop(0, 16.5, W, 4, 0.2);
  shadeRight(W - 6, 17, 6, GY - 17, 0.15);
  // the glamorous script sign
  signBoardF(4, 19, 56, 18, '#c8902a', '#3a2440');
  FR(5, 20, 54, 16, (fx, fy, o) => (hash2(fx, fy, 103) < 0.02 ? '#ffd34a' : o));
  const s = 'Gorgeous';
  const tw = TW(s, FM, { bold: true });
  T(s, 32 - Math.round(tw / 2) + 1, 22, '#c8307a', FM, { bold: true });
  T(s, 32 - Math.round(tw / 2), 21, enamel('#ffd34a', 0.4), FM, { bold: true });
  curve(10, 33, 54, 33, -2, '#ff8ab0');
  for (const [sx, sy] of [[8, 22], [56, 25], [53, 21]] as [number, number][]) {
    P(sx, sy, '#fff8e0');
    P1(sx - 1, sy + 0.25, '#ffd34a');
    P1(sx + 1.5, sy + 0.25, '#ffd34a');
    P1(sx + 0.25, sy - 1, '#ffd34a');
    P1(sx + 0.25, sy + 1.5, '#ffd34a');
  }
  // pink and gold awning
  awning(3, 40, 58, 5, '#ff5d8f', '#ffe8a0', 3);
  // left window: bonnet hair dryers
  const wy = 54;
  const wh = 20;
  R(1, wy - 2, 21, wh + 4, '#f4b63f');
  fh(1, 22, wy - 2, '#fff0a0');
  glassF(3, wy, 17, wh, () => {
    R(3, wy, 17, wh, '#ffe0e8');
    FR(3, wy, 17, 14, (fx, fy) => ((fx + fy) % 8 === 0 ? '#ffd0dc' : null));
    R(3, wy + 14, 17, 6, '#d8a0b8');
    for (const dx2 of [3, 11]) {
      ell(dx2 + 4, wy + 5, 3.5, 3.5, '#d8d4e8');
      ell(dx2 + 4, wy + 6, 3, 2, '#b8b0c8');
      ell(dx2 + 3, wy + 4, 1.5, 1.5, '#ffffff');
      R(dx2 + 3, wy + 8, 2, 4, '#a8a0b8');
      RR(dx2 + 1, wy + 11, 6, 4, 1, '#ff5d8f');
      fh(dx2 + 1, dx2 + 7, wy + 11, '#ff9ab8');
      fv(dx2 + 4, wy + 15, wy + 20, '#a8a0b8');
    }
    circ(8, wy + 9.5, 1.5, '#e8b090');
    ell(8, wy + 8, 2, 1.25, '#d8d4e8');
  });
  // right window: a gold mirror and a styling chair
  R(42, wy - 2, 21, wh + 4, '#f4b63f');
  fh(42, 63, wy - 2, '#fff0a0');
  glassF(44, wy, 17, wh, () => {
    R(44, wy, 17, wh, '#ffe0e8');
    R(44, wy + 14, 17, 6, '#d8a0b8');
    RR(47, wy + 1, 9, 10, 3, '#f4b63f');
    RR(48, wy + 2, 7, 8, 2, '#c8e0f0');
    L(49, wy + 7, 52, wy + 3, '#ffffff');
    RR(48, wy + 10, 7, 5, 1, '#3a2440');
    fh(48, 55, wy + 10, '#6a4a70');
    fv(51.5, wy + 15, wy + 18, '#a8a0b8');
    fh(49, 54, wy + 18.5, '#a8a0b8');
    for (let k = 0; k < 3; k++) R(45 + k * 1.5, wy + 12 - k * 0.5, 1, 3 + k * 0.5, ['#ff5d8f', '#9a6ad0', '#3f9a92'][k]);
  });
  barberPole(21, BP_Y, 22, 0);
  // door (centre x = 32)
  doorF(25, 54, 14, 34, '#3a2440', { frame: '#f4b63f', lite: true, liteH: 14, wall: '#ffe0e8', seed: 104, kick: '#f4b63f', step: '#d8b8c8' });
  RR(26, 71, 12, 5, 1, '#ffd34a');
  T('IN', 29.5, 71, enamel('#3a2440'), FT, {});
  // star decals on the glass, a potted palm
  for (const [sx, sy] of [[29, 58], [35, 61]] as [number, number][]) {
    P1(sx, sy, '#ffd34a');
    P1(sx - 0.5, sy + 0.5, '#ffd34a');
    P1(sx + 0.5, sy + 0.5, '#ffd34a');
    P1(sx, sy + 1, '#ffd34a');
  }
  R(55, GY - 7, 6, 6, '#3a2440');
  fh(55, 61, GY - 7, '#6a4a70');
  for (let k = -2; k <= 2; k++) L(58, GY - 8, 58 + k * 2.5, GY - 13 + Math.abs(k), k % 2 ? '#4f8a5a' : '#6fb070');
  fv(58, GY - 12, GY - 7, '#8a6a4a');
  grime(0, GY - 9, W, 7, 0.16);
  footing(0, GY - 3, W, 3, '#d8b8c8', 105);
}
building('b-salon', {
  w: 64,
  h: 88,
  door: 0,
  draw: drawSalon,
  shadowTop: 11,
  label: 'Gorgeous',
  solid: { x: -32, y: -62, w: 64, h: 62 },
  anims: [{ fps: 6, frames: 6, rect: [19, BP_Y - 3, 7, 28], draw: (f) => barberPole(21, BP_Y, 22, f) }],
  lights: [
    [11, 64, 14, WARM],
    [52, 64, 14, WARM],
    [32, 63, 10, WARM],
    [32, 28, 18, '#ffd34a'],
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
  const GY = 96;
  // slate roof behind the pediment
  shingleF(0, 4, W, 20, '#6a6488', 111, 3, 4, 0.15);
  fh(0, W, 4, '#a8a2c8');
  ventF(84, 3, 4);
  // wings: cut stone with tall arched windows
  stoneWall(0, 24, W, GY - 24, '#c8bccc', 112);
  FR(0, 24, W, GY - 24, (fx, fy, o) => (hash2(fx, fy, 113) < 0.05 ? shA(o, 0.1) : hash2(fx, fy, 114) > 0.985 ? liA(o, 0.2) : o));
  R(0, 24, W, 2, '#efe6e4');
  fh(0, W, 24, '#fffaf4');
  fh(0, W, 25.5, '#a898b0');
  aoTop(0, 26, W, 4, 0.2);
  shadeRight(W - 8, 26, 8, GY - 26, 0.18);
  for (const wx of [5, 81]) {
    RR(wx - 1.5, 39, 13, 34, 5, '#f4eee8');
    fh(wx + 1, wx + 9, 39, '#fffaf4');
    glassF(wx, 41, 10, 31, () => {
      room(wx, 41, 10, 31, '#e7a468', wx);
      for (let k = 0; k < 5; k++) {
        const sy = 46 + k * 5;
        R(wx, sy + 3, 10, 1, '#7a4a3a');
        for (let b = 0; b < 9; b++) {
          const c = ['#c9424f', '#4c6ab2', '#e2b244', '#518c5c', '#9a6ad0', '#e8e0d0'][(b + k * 2) % 6];
          R(wx + 0.5 + b, sy + (b % 3 === 0 ? 0.5 : 0), 1, 3 - (b % 3 === 0 ? 0.5 : 0), c);
          fv(wx + 0.5 + b, sy + 0.5, sy + 3, liA(c, 0.25));
        }
      }
    });
    RR(wx, 40, 10, 3, 1, '#e8a868');
    R(wx + 4.75, 41, 0.5, 31, '#f4eee8');
    for (const yy of [52, 62]) R(wx, yy, 10, 0.5, '#f4eee8');
    // keystone
    R(wx + 3.5, 37.5, 3, 3, '#e0d8d4');
    fh(wx + 3.5, wx + 6.5, 37.5, '#fffaf4');
    R(wx - 2.5, 73, 15, 1.5, '#e8e0dc');
    fh(wx - 2.5, wx + 12.5, 73, '#fffaf4');
    fh(wx - 2.5, wx + 12.5, 74.5, tint('#2b2140', 0.3));
  }
  // ivy climbing the left corner
  for (let y = 40; y < GY - 4; y += 1) {
    const x = 1 + Math.sin(y * 0.35) * 1.2;
    P1(x, y, '#4f7a4a');
    if (y % 3 === 0) {
      ell(x + 1, y, 1, 0.8, hash2(y, 0, 115) < 0.5 ? '#5f9a5a' : '#3f6a4a');
    }
  }
  // portico: pediment, frieze, four columns
  poly([[16, 31], [48, 9], [80, 31]], '#efe6e4');
  poly([[23, 29], [48, 13], [73, 29]], '#ddd2d4');
  FR(23, 13, 50, 16, (fx, fy, o) => (o === col('#ddd2d4') && hash2(fx, fy, 116) < 0.06 ? shA(o, 0.06) : o));
  L(16, 31, 48, 9, '#fffaf4');
  L(48, 9, 80, 31, '#b8a8b4');
  for (let i = 0; i < 20; i++) P1(18 + i * 1.5, 30 - i * 1.03, '#d8ccd0');
  // an open book in the pediment
  R(42, 19, 12, 7, '#fff8ee');
  fv(48, 19, 26, '#c8b8c0');
  fh(42, 54, 26, '#c8b8c0');
  for (let k = 0; k < 4; k++) {
    fh(43, 47, 20.5 + k * 1.3, '#a898b0');
    fh(49, 53, 20.5 + k * 1.3, '#a898b0');
  }
  R(14, 31, 68, 10, '#efe6e4');
  fh(14, 82, 31, '#fffaf4');
  fh(14, 82, 40.5, '#b8a8b4');
  for (let x = 15; x < 82; x += 3) R(x, 31.5, 1, 1, '#ddd2d4');
  TC('PUBLIC LIBRARY', 48.5, 34.5, '#c8b8c8', FT, {});
  TC('PUBLIC LIBRARY', 48, 34, '#5a4a7a', FT, {});
  // shadowy portico interior with the door
  R(18, 41, 60, 44, '#a89cb4');
  stoneWall(18, 41, 60, 44, '#a89cb4', 117);
  aoTop(18, 41, 60, 10, 0.32);
  doorF(41, 51, 14, 34, '#7a4a3a', { frame: '#e8e0dc', lite: true, liteH: 12, seed: 118, step: null, transom: true });
  RR(40, 45, 16, 5, 2, '#e8e0dc');
  fh(41, 55, 45, '#fffaf4');
  glassF(42, 46, 12, 3, () => R(42, 46, 12, 3, '#ffcf7a'));
  // hanging lantern
  fv(48, 41, 43, '#4a3550');
  // a banner between the columns
  R(57, 46, 7, 14, '#4c6ab2');
  poly([[57, 60], [60.5, 57], [64, 60], [64, 61], [57, 61]], '#4c6ab2');
  fv(57, 46, 61, '#6a8ad0');
  micro('READ', 57.5, 48, '#fff4dc');
  ell(60.5, 53.5, 2, 1.5, '#fff4dc');
  fv(60.5, 52, 55, '#4c6ab2');
  for (const cx of [21, 31, 60, 70]) column(cx, 41, 85);
  // the stone steps
  for (let k = 0; k < 3; k++) {
    const sx = 28 - k * 4;
    const sw = 40 + k * 8;
    R(sx, 85 + k * 3.5, sw, 3.5, ['#e8e0dc', '#d8d0d0', '#c8c0c4'][k]);
    fh(sx, sx + sw, 85 + k * 3.5, '#fffaf4');
    fh(sx, sx + sw, 88 + k * 3.5, tint('#5a4a6a', 0.3));
    FR(sx, 85 + k * 3.5, sw, 3.5, (fx, fy, o) => (hash2(fx, fy, 119 + k) < 0.05 ? shA(o, 0.08) : o));
  }
  // Story Time sandwich board
  L(3, GY - 1, 5, GY - 20, '#8a5a4a');
  L(21, GY - 1, 19, GY - 20, '#6e3a48');
  RR(1, GY - 23, 22, 20, 1, '#a8704f');
  fh(2, 22, GY - 23, '#d09a6a');
  R(2, GY - 22, 20, 18, '#3a4a4c');
  FR(2, GY - 22, 20, 18, (fx, fy, o) => (hash2(fx, fy, 120) < 0.05 ? mixc(o, '#ffffff', 0.15) : o));
  TC('STORY', 12, GY - 21, '#fff4dc', FT, {});
  TC('TIME', 12, GY - 15, '#ffd977', FT, {});
  TC('4PM', 12, GY - 9, '#ff9ab0', FT, {});
  // the blue book-return box
  RR(81, GY - 17, 11, 17, 2, '#4a68b8');
  fh(82, 91, GY - 17, '#8aa8f0');
  R(83, GY - 14, 7, 2, '#2b2140');
  fh(83, 90, GY - 12, '#7aa0e0');
  fv(81.5, GY - 15, GY - 2, '#7aa0e0');
  fv(91.5, GY - 15, GY - 2, '#30407c');
  T('B', 85, GY - 9, '#fff4dc', FT, {});
  R(82, GY - 1, 2, 1, '#30407c');
  R(89, GY - 1, 2, 1, '#30407c');
  grime(0, GY - 8, 18, 7, 0.18);
  grime(78, GY - 8, 18, 7, 0.18);
}
building('b-library', {
  w: 96,
  h: 96,
  door: 0,
  draw: drawLibrary,
  shadowTop: 8,
  label: 'Public Library',
  solid: { x: -48, y: -66, w: 96, h: 66 },
  lights: [
    [10, 56, 14, WARM],
    [86, 56, 14, WARM],
    [48, 66, 16, WARM],
    [48, 47, 10, WARM],
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
  const GY = 96;
  flatRoof(0, 12, W, 12, 121);
  FR(0, 12, W, 12, (fx, fy, o) => (hash2(fx, fy, 122) < 0.12 ? shA(o, 0.1) : o));
  ventF(90, 14, 5);
  ventF(30, 15, 4);
  acUnit(60, 15);
  brickF(0, 24, W, GY - 24, '#a8504a', '#924442', '#7a4a52', 122);
  R(0, 22, W, 3, '#f2ece4');
  fh(0, W, 22, '#ffffff');
  fh(0, W, 24.5, '#b8a8b0');
  aoTop(0, 25, W, 4, 0.22);
  shadeRight(W - 8, 25, 8, GY - 25, 0.2);
  // name band
  R(20, 27, 72, 11, '#2f3a6a');
  fh(20, 92, 27, '#6a7ab8');
  fh(20, 92, 37.5, '#1a2048');
  TC('VFW POST 316', 56.5, 30, '#1a2048', FM, {});
  TC('VFW POST 316', 56, 29.5, enamel('#fbf0e4'), FM, {});
  for (const sx of [23, 88]) {
    const st = ['..#..', '.###.', '#####', '.###.', '.#.#.'];
    st.forEach((row, yy) => [...row].forEach((ch, xx) => ch === '#' && P1(sx - 1 + xx * 0.5, 30.5 + yy * 0.5, '#f4b63f')));
  }
  // the changeable-letter marquee on its frame
  R(10, 40, 92, 20, '#f2ece4');
  box(10, 40, 92, 20, '#5a5a7a');
  fh(11, 101, 41, '#ffffff');
  for (const yy of [48.5, 56.5]) {
    fh(12, 100, yy, '#d8d0d8');
    fh(12, 100, yy + HF, '#ffffff');
  }
  const letters = (str: string, y: number, c: string) => {
    const w = TW(str, FT, {});
    let x = 56 - w / 2;
    for (const ch of str) {
      if (ch !== ' ') {
        R(x - 0.5, y - 0.5, 4, 6, '#ffffff');
        fh(x - 0.5, x + 3.5, y + 5, '#d8d0d8');
      }
      x = T(ch, x, y, c, FT, {});
    }
  };
  letters('WED NIGHT WRESTLING', 42.5, '#2b2140');
  letters('BINGO AFTER', 50.5, '#c9404c');
  // legs of the marquee frame
  for (const lx of [12, 99]) {
    R(lx, 60, 1.5, 4, '#5a5a7a');
    fv(lx, 60, 64, '#8a8aa0');
  }
  // windows
  for (const wx of [9, 85]) win(wx, 66, 18, 14, { frame: '#f2ece4', curtains: '#fff4e6', seed: wx, lintel: '#e0d8d0', cols: 3, rows: 2 });
  // memorial plaque
  RR(31, 70, 7, 9, 1, '#a8803a');
  R(32, 71, 5, 7, '#c8a04a');
  fh(32, 37, 71, '#f0d080');
  for (let k = 0; k < 4; k++) fh(32.5, 36.5, 73 + k * 1.2, '#8a6a2a');
  // double doors with canopy (centre x = 56)
  R(41, 56, 30, 3.5, '#2f3a6a');
  fh(41, 71, 56, '#6a7ab8');
  fh(41, 71, 59, '#1a2048');
  aoTop(42, 59.5, 28, 2.5, 0.3);
  doorF(45, 62, 11, 34, '#5a6a9a', { frame: '#f2ece4', lite: true, liteH: 12, step: null, seed: 123, kick: '#c8c4d8' });
  doorF(56, 62, 11, 34, '#5a6a9a', { frame: '#f2ece4', lite: true, liteH: 12, step: null, seed: 124, knobRight: false, kick: '#c8c4d8' });
  R(43, GY - 2, 26, 2, '#c8c0c4');
  fh(43, 69, GY - 2, '#e6dee0');
  // flagpole in front of the left corner
  R(5, 2, 1.5, GY - 2, '#c8c4d8');
  fv(5, 2, GY, '#eeeaf6');
  fv(6, 3, GY, '#8a84a0');
  circ(5.75, 2, 1.5, '#f4b63f');
  P1(5.25, 1.5, '#fff0a0');
  R(3, GY - 3, 6, 3, '#9a92a8');
  fh(3, 9, GY - 3, '#c8c0d0');
  vfwFlag(0);
  // a bench and an ashtray urn by the door
  R(74, GY - 8, 10, 2, '#a8704f');
  fh(74, 84, GY - 8, '#d09a6a');
  R(74, GY - 11, 10, 1.5, '#a8704f');
  fh(74, 84, GY - 11, '#d09a6a');
  R(75, GY - 6, 1, 6, '#6e4a3a');
  R(82, GY - 6, 1, 6, '#6e4a3a');
  RR(87, GY - 8, 4, 8, 1, '#6a6a80');
  fh(87, 91, GY - 8, '#9a9ab0');
  ell(89, GY - 8, 1.5, 0.5, '#e8e0d0');
  grime(0, GY - 9, W, 8, 0.22);
  footing(0, GY - 3, 43, 3, '#b8a8b0', 125);
  footing(69, GY - 3, 43, 3, '#b8a8b0', 126);
}
building('b-vfw', {
  w: 112,
  h: 96,
  door: 0,
  draw: drawVFW,
  shadowTop: 22,
  label: 'VFW Post 316',
  solid: { x: -56, y: -66, w: 112, h: 66 },
  anims: [{ fps: 5, frames: 4, rect: [6, 0, 18, 16], draw: (f) => vfwFlag(f) }],
  lights: [
    [18, 73, 14, WARM],
    [94, 73, 14, WARM],
    [56, 74, 18, WARM],
    [56, 50, 30, '#fff0d0'],
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
  const GY = 104;
  // arched brick front
  const archTop = (x: number) => {
    const t = (x - W / 2) / (W / 2);
    return 18 + t * t * 20;
  };
  brickF(0, 18, W, GY - 18, '#b45a4c', '#a85048', '#8a5a5a', 131);
  FR(0, 18, W, 21, (fx, fy, o) => ((fy + 0.5) / 2 < archTop((fx + 0.5) / 2) ? 0 : o));
  // barrel roof receding behind the arched front, standing seams
  for (let x = 2; x < W - 2; x += 0.5) {
    const t = (x - W / 2) / (W / 2 - 2);
    const top = 6 + t * t * 22;
    const lit = x < W / 2;
    const xi = Math.round(x * 2);
    const c = xi % 10 === 0 ? '#a8a2c8' : xi % 10 === 9 ? '#4e486e' : lit ? '#7a7498' : '#625c84';
    R(x, top, 0.5, 14, (_X: number, _Y: number, o: number) => (o ? o : col(c)));
    P1(x, top, (_X: number, _Y: number, o: number) => (o ? o : col('#d8d4ec')));
  }
  ventF(26, 14, 4);
  ventF(84, 13, 4);
  for (let x = 0; x < W; x += 0.5) {
    const top = archTop(x);
    R(x, top - 0.5, 0.5, 2, '#f2ece4');
    P1(x, top - 0.5, '#ffffff');
    P1(x, top + 1.5, '#c8b0b0');
  }
  aoTop(0, 30, W, 6, 0.2);
  shadeRight(W - 8, 30, 8, GY - 30, 0.2);
  // painted tiger in the arch
  RR(46, 21, 20, 16, 4, '#2f3a6a');
  fh(48, 64, 21, '#4a5a9a');
  tigerFace(56, 29);
  // name band
  R(8, 40, 96, 10, '#2f3a6a');
  fh(8, 104, 40, '#6a7ab8');
  fh(8, 104, 49.5, '#1a2048');
  TC('TURNBUCKLE ALLEY HIGH', 56.5, 42.5, '#8a5a1a', FT, {});
  TC('TURNBUCKLE ALLEY HIGH', 56, 42, enamel('#f4b63f'), FT, {});
  // clerestory windows
  for (const wx of [6, 96]) win(wx, 53, 10, 8, { frame: '#f2ece4', wall: '#f2c890', seed: wx, cols: 2, rows: 1 });
  // banner, tied at the corners and sagging a touch
  R(20, 52, 72, 15, '#f2903a');
  FR(20, 52, 72, 15, (fx, fy, o) => (fy % 6 === 0 ? shA(o, 0.06) : (fx + fy) % 23 === 0 ? liA(o, 0.12) : o));
  for (let x = 20; x < 92; x += 4) P1(x + 1, 67, '#f2903a');
  fh(20, 92, 52, '#ffc078');
  fh(20, 92, 66.5, '#c86a2a');
  TC('HOME OF THE', 56, 54, '#3a2440', FT, {});
  TC('TURNBUCKLE TIGERS', 56.5, 60.5, '#8a4a1a', FT, {});
  TC('TURNBUCKLE TIGERS', 56, 60, enamel('#fff4e6'), FT, {});
  for (const sx of [20.5, 91]) {
    fv(sx, 53, 66, '#c86a2a');
    P1(sx, 51.5, '#e8e0d0');
    P1(sx, 52, '#a89888');
  }
  // big double doors with push bars (centre x = 56), and a canopy
  R(40, 67.5, 32, 3, '#2f3a6a');
  fh(40, 72, 67.5, '#6a7ab8');
  fh(40, 72, 70, '#1a2048');
  aoTop(42, 70.5, 28, 2, 0.3);
  for (const [dx, kr] of [[44, true], [56, false]] as [number, boolean][]) {
    doorF(dx, 71, 12, 33, '#3f9a92', { frame: '#f2ece4', lite: true, liteH: 10, wall: '#f2c890', step: null, seed: dx, knobRight: kr, kick: '#c8c4d8' });
    R(dx + 1, 87, 10, 2, '#d8d4e8');
    fh(dx + 1, dx + 11, 87, '#ffffff');
    fh(dx + 1, dx + 11, 88.5, '#8a84a0');
  }
  R(40, GY - 2, 32, 2, '#c8c0c4');
  fh(40, 72, GY - 2, '#e6dee0');
  // windows low on the sides
  for (const wx of [10, 88]) win(wx, 74, 14, 14, { frame: '#f2ece4', seed: wx * 7, cols: 2, rows: 2, plant: wx < 50, blinds: wx > 50 ? '#e8e0d0' : undefined });
  // trophy glimpse, a lost-and-found sweater on the bike rack
  for (let k = 0; k < 4; k++) {
    RR(26 + k * 4, GY - 8, 4, 8, 2, '#8a84a0');
    fv(26 + k * 4, GY - 7, GY, '#b8b4c8');
    R(27 + k * 4, GY - 7, 2, 7, '#b4584a');
  }
  circ(30, GY - 4, 2.5, '#3a3048');
  R(34, GY - 9, 5, 3, '#f2903a');
  fh(34, 39, GY - 9, '#ffc078');
  // tiger paw prints on the walk
  for (const [px, py] of [[74, 100], [80, 98]] as [number, number][]) {
    R(px, py, 2, 2, '#f2903a');
    P1(px - 0.5, py - 1, '#f2903a');
    P1(px + 0.75, py - 1.5, '#f2903a');
    P1(px + 2, py - 1, '#f2903a');
  }
  downspout(1, 36, GY - 1, '#c8c4d8');
  downspout(W - 2.5, 36, GY - 1, '#a8a4bc');
  grime(0, GY - 10, W, 9, 0.2);
  footing(0, GY - 3, 40, 3, '#b8a8b0', 132);
  footing(72, GY - 3, 40, 3, '#b8a8b0', 133);
}
building('b-school', {
  w: 112,
  h: 104,
  door: 0,
  draw: drawSchool,
  shadowTop: 24,
  label: 'Turnbuckle Alley High',
  solid: { x: -56, y: -72, w: 112, h: 72 },
  lights: [
    [56, 86, 18, WARM],
    [11, 57, 10, WARM],
    [101, 57, 10, WARM],
    [17, 81, 12, WARM],
    [95, 81, 12, WARM],
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
  const GY = 100;
  // hip roof with three dormers and a chimney
  chimney(104, 0, 10, '#b4644e');
  shingleF(4, 4, W - 8, 21, '#8a6a8a', 141, 3, 5, 0.15);
  poly([[4, 4], [14, 4], [4, 16]], 0);
  poly([[W - 4, 4], [W - 14, 4], [W - 4, 16]], 0);
  for (let i = 0; i < 24; i++) {
    P1(4 + i * 0.42, 15.5 - i * 0.5, '#c8a8c8');
    P1(W - 4 - i * 0.42, 15.5 - i * 0.5, '#5a4a6a');
  }
  fh(14, W - 14, 4, '#c8aac8');
  for (const dx of [26, 60, 94]) {
    poly([[dx - 2, 12], [dx + 4, 5], [dx + 10, 12]], '#9a7a9a');
    L(dx - 2, 12, dx + 4, 5, '#c8aac8');
    fh(dx - 2, dx + 10, 12, '#fff6e0');
    R(dx, 12.5, 8, 10, '#fff6e0');
    fv(dx + 7.5, 12.5, 22.5, '#d8c8b0');
    glassF(dx + 1, 13.5, 6, 8, () => room(dx + 1, 13.5, 6, 8, '#f2c890', dx));
    R(dx + 3.75, 13.5, 0.5, 8, '#fff6e0');
    R(dx + 1, 17.25, 6, 0.5, '#fff6e0');
    fh(dx - 1, dx + 9, 22.5, tint('#3a2848', 0.35));
  }
  fh(4, W - 4, 24.5, '#4a3a5a');
  gutter(3, W - 3, 24.5, '#e8e0e8');
  // upper storey: soft butter clapboard
  siding(2, 26, W - 4, 30, '#f6e0a8', 142, 4, 0.015);
  aoTop(2, 26, W - 4, 4, 0.22);
  shadeRight(W - 10, 26, 8, 30, 0.14);
  for (const wx of [8, 22, 98, 112]) win(wx, 31, 9, 15, { frame: '#ffffff', shutters: '#7aa890', seed: wx + 3, curtains: '#fff4e6', cols: 2, rows: 2, cat: wx === 112 });
  // the name, with a little bell either side
  RRB(34, 28, 60, 19, 3, '#5a8a7a', '#fffaf0');
  fh(36, 92, 29, '#ffffff');
  FR(35, 29, 58, 17, (fx, fy, o) => (o === col('#fffaf0') && hash2(fx, fy, 143) < 0.04 ? '#f0e8d8' : o));
  TC('EVENING BELL', 64, 30.5, enamel('#4a5a8a'), FT, {});
  bellIcon(64, 37, '#f4b63f', '#a8702a');
  bellIcon(40, 36, '#f4b63f', '#a8702a');
  bellIcon(88, 36, '#f4b63f', '#a8702a');
  for (const sx of [50, 78]) {
    P1(sx, 40, '#7aa890');
    P1(sx + 0.5, 39.5, '#7aa890');
    P1(sx + 1, 39, '#7aa890');
    P1(sx + 1.5, 39.5, '#7aa890');
    P1(sx + 2, 40, '#7aa890');
  }
  micro('RESIDENCE', 55, 43.5, '#5a8a7a');
  // porch roof
  R(0, 55, W, 5, '#9a7a9a');
  metalF(0, 55, W, 5, '#9a7a9a', 144, 3, 0.1);
  fh(0, W, 55, '#d8b8d8');
  fh(0, W, 59.5, '#5a4a6a');
  for (let x = 2; x < W; x += 4) {
    P1(x, 60, '#fff6e0');
    P1(x + 1, 60, '#fff6e0');
  }
  // ground floor behind the porch
  siding(2, 60, W - 4, GY - 60, '#f6e0a8', 145, 4, 0.015);
  aoTop(2, 60, W - 4, 8, 0.3);
  for (const wx of [10, 30, 86, 106]) win(wx, 68, 12, 14, { frame: '#ffffff', seed: wx, curtains: '#fff4e6', cols: 2, rows: 2, plant: wx === 30 });
  doorF(56, 64, 16, 34, '#7aa890', { frame: '#ffffff', lite: true, liteH: 12, step: null, wreath: false, seed: 146, mail: true });
  RR(58, 59.5, 12, 3, 1, '#5a8a7a');
  micro('WELCOME', 59, 60, '#fffaf0');
  // porch posts and railing
  for (const px of [2, 22, 46, 80, 104, 124]) {
    R(px, 60, 3, GY - 62, '#ffffff');
    fv(px, 60, GY - 2, '#ffffff');
    fv(px + 2.5, 60, GY - 2, '#c8c0b8');
    R(px - 0.5, 60, 4, 1.5, '#fff6e0');
    R(px - 0.5, GY - 4, 4, 2, '#e8e0d8');
  }
  for (let x = 2; x < W - 2; x += 1.5) {
    if (x >= 52 && x < 76) continue;
    fv(x, GY - 10, GY - 3, '#f4eee8');
    fv(x + 0.5, GY - 10, GY - 3, '#c8c0b8');
  }
  for (const [a, b] of [[2, 52], [76, W - 2]] as [number, number][]) {
    R(a, GY - 11, b - a, 1.5, '#ffffff');
    fh(a, b, GY - 9.5, tint('#3a2848', 0.3));
  }
  R(0, GY - 3, W, 3, '#c8b0a0');
  fh(0, W, GY - 3, '#e6d4c4');
  FR(0, GY - 2.5, W, 2.5, (fx, _fy, o) => (fx % 12 === 0 ? shA(o, 0.2) : o));
  // rocking chairs, a knitting basket and hanging ferns
  rocker(33, GY - 16, '#a8704f');
  rocker(89, GY - 16, '#7aa890');
  ell(44, GY - 4, 2.5, 1.5, '#c8a070');
  P1(43.5, GY - 6, '#d8434b');
  P1(44.5, GY - 6, '#5a7ad0');
  for (const fx of [12, 116]) {
    fv(fx, 60, 63, '#6a5a4a');
    R(fx - 2, 63, 4, 2, '#c8704f');
    ell(fx, 65, 4.5, 2.5, '#5f9a5a');
    for (let k = -4; k <= 4; k += 1) fv(fx + k * 0.9, 66, 68 + Math.abs((k * 7) % 3), k % 2 ? '#4f8a5a' : '#6fb070');
  }
  // planters on the steps
  for (const px of [48, 76]) {
    R(px, GY - 7, 6, 6, '#c8704f');
    fh(px, px + 6, GY - 7, '#e8906a');
    fh(px, px + 6, GY - 1.5, '#9a4a3a');
    ell(px + 3, GY - 9, 4, 3, '#5f9a5a');
    P1(px + 1, GY - 10, '#ff8fae');
    P1(px + 4, GY - 11, '#ffe070');
    P1(px + 3, GY - 9, '#ff8fae');
    P1(px + 5, GY - 9.5, '#fff8f0');
  }
}
building('b-sunnypines', {
  w: 128,
  h: 100,
  door: 0,
  draw: drawSunnyPines,
  shadowTop: 8,
  label: 'The Evening Bell Residence',
  solid: { x: -64, y: -68, w: 128, h: 68 },
  lights: [
    [12, 38, 10, WARM],
    [26, 38, 10, WARM],
    [102, 38, 10, WARM],
    [116, 38, 10, WARM],
    [16, 75, 12, WARM],
    [36, 75, 12, WARM],
    [92, 75, 12, WARM],
    [112, 75, 12, WARM],
    [64, 76, 16, WARM],
    [30, 17, 8, WARM],
    [64, 17, 8, WARM],
    [98, 17, 8, WARM],
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
  const GY = 80;
  const eave = 32;
  // chimney behind the roof
  chimney(44, 0, 16, v === 1 ? '#a85a4a' : '#b4644e');
  // side-gabled roof
  shingleF(0, 8, W, eave - 8, pal.roof, 151 + v, 3, 5, 0.18);
  fh(1, W - 1, 8, liA(pal.roof, 0.45));
  fh(0, W, eave - 0.5, shA(pal.roof, 0.55));
  if (v % 2 === 0) {
    // gabled dormer
    poly([[25, 20], [33, 11], [41, 20]], shA(pal.roof, 0.1));
    L(25, 20, 33, 11, liA(pal.roof, 0.35));
    R(27, 20, 12, 10, pal.trim);
    fv(38.5, 20, 30, shA(pal.trim, 0.2));
    glassF(28.5, 21.5, 9, 7, () => room(28.5, 21.5, 9, 7, '#f2c890', v));
    R(32.75, 21.5, 0.5, 7, pal.trim);
    curtainsF(28.5, 21.5, 9, 7, '#fff4e6');
  } else {
    // round attic window
    circ(16, 20, 4.5, pal.trim);
    glassF(12.5, 16.5, 7, 7, () => room(12.5, 16.5, 7, 7, '#f2c890', v));
    FR(11, 15, 10, 10, (fx, fy, o) => {
      const d = Math.hypot((fx + 0.5) / 2 - 16, (fy + 0.5) / 2 - 20);
      return d > 3.5 && d <= 4.5 ? (fy / 2 < 20 ? liA(pal.trim, 0.3) : shA(pal.trim, 0.15)) : d > 4.5 && d < 5 ? shA(pal.roof, 0.35) : o;
    });
    R(15.75, 16.5, 0.5, 7, pal.trim);
    R(12.5, 19.75, 7, 0.5, pal.trim);
  }
  gutter(0, W, eave, '#e8e4ec');
  // siding
  siding(1, eave + 1.5, W - 2, GY - eave - 1.5, pal.wall[1], 152 + v, 4, 0.02);
  aoTop(1, eave + 1.5, W - 2, 4, 0.25);
  shadeRight(W - 7, eave, 6, GY - eave, 0.16);
  R(1, eave + 1.5, 1.5, GY - eave - 1.5, pal.trim);
  fv(1, eave + 1.5, GY, liA(pal.trim, 0.3));
  R(W - 2.5, eave + 1.5, 1.5, GY - eave - 1.5, shA(pal.trim, 0.15));
  downspout(W - 4, eave + 1, GY - 1, '#e8e4ec');
  // door with a little gabled porch hood (centre x = 20)
  poly([[10, 43], [20, 36], [30, 43]], pal.roof);
  L(10, 43, 20, 36, liA(pal.roof, 0.4));
  FR(10, 36, 20, 7, (_fx, fy, o) => (o === col(pal.roof) && fy % 3 === 0 ? shA(o, 0.15) : o));
  R(10, 43, 20, 1.5, pal.trim);
  fh(10, 30, 43, liA(pal.trim, 0.4));
  for (const bx of [11, 28]) {
    poly([[bx, 44.5], [bx + 1, 44.5], [bx + 1, 47]], pal.trim);
  }
  aoTop(12, 44.5, 16, 2, 0.3);
  doorF(14, 46, 12, 34, pal.door, { frame: pal.trim, lite: v === 3, liteH: 10, wreath: v === 2, seed: 153 + v, mail: v !== 3, step: '#c8b0a8' });
  // porch light and house number
  R(28, 47, 2, 1, '#4a3550');
  RR(27.5, 48, 3, 4, 1, '#4a3550');
  R(28, 48.5, 2, 2.5, '#ffe08a');
  P1(28.5, 49, '#fffbe8');
  micro(String(10 + v * 4), 6, 49, shA(pal.trim, 0.5));
  // window with shutters + flower box
  win(39, 47, 14, 14, { frame: pal.trim, shutters: pal.shut, box: 160 + v, seed: v * 5 + 1, curtains: '#fff4e6', cols: 2, rows: 2, cat: v === 3 });
  // little details per variant
  if (v === 0) {
    // a garden gnome
    R(7, GY - 6, 3, 5, '#3f6ab0');
    fv(7, GY - 6, GY - 1, '#6a8ad0');
    poly([[6.5, GY - 6], [8.5, GY - 11], [10.5, GY - 6]], '#d8434b');
    P1(8, GY - 10, '#ff8a80');
    R(7.5, GY - 6, 2, 1.5, '#f2c8a0');
    R(7.5, GY - 4.5, 2, 1.5, '#fff8f0');
  } else if (v === 1) pot(4, GY - 9, '#c8704f', '#5f9a5a', '#ffe070');
  else if (v === 2) {
    // bicycle leaning on the wall
    for (const wx of [55, 61]) {
      FR(wx - 3, GY - 6, 6, 6, (fx, fy, o) => {
        const d = Math.hypot((fx + 0.5) / 2 - wx, (fy + 0.5) / 2 - (GY - 3));
        return d > 2.1 && d <= 2.8 ? '#5a5a7a' : d < 0.6 ? '#c8c4d8' : o;
      });
    }
    L(55, GY - 3, 58, GY - 7, '#d8434b');
    L(58, GY - 7, 61, GY - 3, '#d8434b');
    L(58, GY - 7, 57, GY - 3, '#d8434b');
    fh(56.5, 59, GY - 8, '#3a3048');
    fh(60, 62, GY - 8.5, '#c8c4d8');
  } else {
    // wind chime
    fv(33, 44.5, 47, '#a8a4bc');
    for (let k = 0; k < 4; k++) fv(31.5 + k, 48, 50 + k * 0.6, '#d8d4e8');
  }
  grime(1, GY - 8, W - 2, 7, 0.18);
  footing(1, GY - 3, 12, 3, '#b8a0b0', 154 + v);
  footing(27, GY - 3, W - 28, 3, '#b8a0b0', 155 + v);
}
building('b-house', {
  w: 64,
  h: 80,
  door: -12,
  draw: drawHouse,
  vkey: (p) => String(Math.abs(Math.floor(Number(p.variant ?? 0))) % 4),
  shadowTop: 8,
  solid: { x: -32, y: -54, w: 64, h: 54 },
  lights: [
    [46, 54, 14, WARM],
    [29, 50, 8, LAMP],
    [33, 25, 8, WARM],
  ],
  anims: [{ fps: 4, frames: 4, rect: [42, -12, 14, 14], rel: true, draw: (f, _p, ox, oy) => puff(47 + ox, -1 + oy, f) }],
  pad: [0, 12, 10, 4],
});

// ---------------------------------------------------------------- Birdie's house
function drawBirdie(): void {
  const W = 80;
  const GY = 88;
  const gB = 38; // gable base
  // front-gabled cottage with gingerbread trim, roof running back
  shingleF(0, 10, W, 22, '#6a4a6a', 171, 3, 5, 0.15);
  fh(0, W, 10, '#a888a8');
  poly([[5, gB], [28, 6], [51, gB]], '#ffe2ea');
  FR(5, 6, 46, gB - 6, (fx, fy, o) => {
    if (o !== col('#ffe2ea')) return o;
    const k = fy % 8;
    if (k === 7) return '#e8b4c4';
    if (k === 0) return '#fff4f8';
    return (fx + (Math.floor(fy / 8) % 2) * 6) % 12 === 0 ? '#f4c4d0' : o;
  });
  L(4, gB, 28, 5, '#ff7aa0');
  L(28, 5, 52, gB, '#ff7aa0');
  L(5, gB + 1, 28, 7, '#d0507a');
  L(28, 7, 51, gB + 1, '#d0507a');
  // gingerbread drops along the bargeboard
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const lx = 5 + t * 23;
    const rx = 51 - t * 23;
    const y = gB - t * 32 + 1.5;
    for (const x of [lx, rx]) {
      P1(x, y, '#ff9ab8');
      P1(x, y + 0.5, '#ff9ab8');
      P1(x, y + 1, '#ffd0de');
    }
  }
  ell(28, 7, 1.5, 1.5, '#ff7aa0');
  // attic window with the faded Velvet Hammers banner
  RR(20, 17, 16, 13, 2, '#ff7aa0');
  fh(21, 35, 17, '#ffb0c8');
  glassF(21.5, 18.5, 13, 10, () => {
    room(21.5, 18.5, 13, 10, '#e8b088', 3);
    R(22.5, 19.5, 11, 7, '#c8a0c0');
    FR(22.5, 19.5, 11, 7, (fx, fy, o) => (hash2(fx, fy, 172) < 0.12 ? '#d8b8d0' : o));
    T('VH', 24, 20.5, '#f6e6f0', FT, { ls: 1 });
    fh(22.5, 33.5, 25.5, '#a880a8');
  });
  R(27.75, 18.5, 0.5, 10, '#ff7aa0');
  // walls: cream clapboard with pink trim
  siding(0, gB, W, GY - gB, '#f4ece0', 172, 4, 0.015);
  shadeRight(W - 6, gB, 6, GY - gB, 0.15);
  // porch on the right with a swing
  R(52, 41, 28, 3, '#ff7aa0');
  fh(52, 80, 41, '#ffb0c8');
  fh(52, 80, 43.5, '#c8406a');
  for (let x = 52; x < 80; x += 3) {
    P1(x + 1, 44, '#ff7aa0');
    P1(x + 1.5, 44, '#ff7aa0');
    P1(x + 1.25, 44.5, '#ff7aa0');
  }
  FR(52, 44, 28, GY - 47, (fx, fy, o) => (o && dth(fx, fy, 6) ? shA(o, 0.18) : o));
  aoTop(52, 44, 28, 6, 0.3);
  for (const px of [53, 77]) {
    R(px, 44, 2, GY - 47, '#fffaf0');
    fv(px + 1.5, 44, GY - 3, '#d8ccc0');
  }
  // porch swing on chains
  for (const cx of [58, 75]) for (let y = 44; y < 63; y += 1) P1(cx + (y % 2) * 0.5, y, '#8a7a8a');
  R(57, 62, 19, 3, '#ff9ab8');
  fh(57, 76, 62, '#ffd0de');
  fh(57, 76, 64.5, '#c8507a');
  R(57, 57, 19, 5, '#ffb6cc');
  FR(57, 57, 19, 5, (fx) => (fx % 4 === 0 ? '#ff9ab8' : null));
  fh(57, 76, 57, '#ffd0de');
  RR(61, 58, 5, 4, 1, '#7aa890');
  fh(61.5, 65.5, 58, '#a8d0b8');
  FR(56, 66, 21, 2, (fx, fy, o) => (o && dth(fx, fy, 8) ? shA(o, 0.2) : o));
  // window under the porch
  win(64, 46, 10, 6, { frame: '#ff7aa0', curtains: '#fff4f8', seed: 9, cols: 2, rows: 1 });
  // front door (centre x = 24)
  doorF(17, 54, 14, 34, '#ff7aa0', { frame: '#fffaf0', lite: true, liteH: 11, seed: 173, wreath: false, step: '#c8b0b8' });
  RR(19, 48, 10, 5, 1, '#d0507a');
  fh(20, 28, 48, '#ff7aa0');
  T('B', 22, 48.5, enamel('#fff4f8'), FT, {});
  // window left with flower box
  win(4, 52, 9, 14, { frame: '#ff7aa0', shutters: '#d0507a', box: 173, boxC: '#ff9ab8', seed: 11, curtains: '#fff4f8', cols: 2, rows: 2 });
  // the pink flamingo
  fv(39, GY - 8, GY - 1, '#d0507a');
  fv(39.5, GY - 8, GY - 3, '#d0507a');
  ell(39, GY - 10, 3, 2, '#ff7aa0');
  ell(38, GY - 10.5, 1.5, 0.75, '#ffb0c8');
  L(41, GY - 11, 42, GY - 17, '#ff7aa0');
  ell(42.5, GY - 17.5, 1, 1, '#ff7aa0');
  P1(43.5, GY - 17.5, '#3a2440');
  P1(43.5, GY - 17, '#3a2440');
  grime(0, GY - 8, W, 6, 0.16);
  R(0, GY - 3, W, 3, '#c8b0b8');
  fh(0, W, GY - 3, '#e6d0d8');
  FR(0, GY - 2.5, W, 2.5, (fx, _fy, o) => (fx % 10 === 0 ? shA(o, 0.15) : o));
}
building('b-birdie', {
  w: 80,
  h: 88,
  door: -16,
  draw: drawBirdie,
  shadowTop: 8,
  label: "Birdie's house",
  solid: { x: -40, y: -60, w: 80, h: 60 },
  lights: [
    [28, 23, 12, WARM],
    [9, 59, 12, WARM],
    [69, 49, 10, WARM],
    [24, 62, 10, WARM],
  ],
});

// ---------------------------------------------------------------- Grandma's house
function drawGrandma(): void {
  const W = 96;
  const GY = 104;
  const gB = 48;
  // big roof, weathered shingles with a few missing
  shingleF(0, 14, W, 26, '#5a5a78', 181, 3, 5, 0.35);
  const r = rng(182);
  for (let i = 0; i < 11; i++) {
    const sx = Math.floor(r() * 90);
    const sy = 15 + Math.floor(r() * 22);
    R(sx, sy, 4, 2, '#3e3a56');
    fh(sx, sx + 4, sy, '#2e2a46');
  }
  fh(0, W, 14, '#8a84a8');
  chimney(70, 0, 22, '#9a5a4e');
  poly([[8, gB], [40, 6], [72, gB]], '#8aa0c0');
  // weathered blue clapboard with peeling patches
  const peel = (x: number, y: number, w: number, h: number) =>
    FR(x, y, w, h, (fx, fy, o) => {
      if (!o) return null;
      const n = hash2(fx >> 3, fy >> 2, 183);
      if (n < 0.05) return mixc(o, hash2(fx, fy, 184) < 0.7 ? '#d8d0c8' : '#a8a098', 0.55);
      if (n < 0.06) return shA(o, 0.15);
      return o;
    });
  siding(0, gB, W, GY - gB, '#8aa0c0', 184, 4, 0.03);
  peel(0, gB, W, GY - gB);
  FR(8, 6, 64, gB - 6, (_fx, fy, o) => {
    if (o !== col('#8aa0c0')) return o;
    const k = fy % 8;
    return k === 7 ? '#5a6c8c' : k === 0 ? '#a8bcd8' : o;
  });
  peel(10, 8, 60, gB - 8);
  L(7, gB, 40, 5, '#e8e4dc');
  L(40, 5, 73, gB, '#e8e4dc');
  L(8, gB + 1, 40, 7, '#b8b4ac');
  L(40, 7, 72, gB + 1, '#b8b4ac');
  shadeRight(W - 8, gB, 8, GY - gB, 0.2);
  // attic window, one pane cracked
  R(33, 22, 14, 15, '#e8e4dc');
  fh(33, 47, 22, '#fffaf0');
  glassF(34, 23, 12, 13, () => {
    room(34, 23, 12, 13, '#c89a6a', 5);
    curtainsF(34, 23, 12, 13, '#f0e6d8');
  });
  R(39.75, 23, 0.5, 13, '#e8e4dc');
  R(34, 29.25, 12, 0.5, '#e8e4dc');
  L(42, 24, 45, 28, '#fff8f0');
  P1(43, 26, '#fff8f0');
  R(32, 37, 16, 1.5, '#d8d4cc');
  // porch roof (sagging slightly)
  for (let x = 0; x < W; x += 0.5) {
    const sag = Math.sin((x / W) * Math.PI) * 1.5;
    const xi = Math.round(x * 2);
    R(x, 56 + sag, 0.5, 4, xi % 6 === 0 ? '#6a6488' : '#5a5478');
    P1(x, 56 + sag, '#8a84a8');
    P1(x, 59.5 + sag, '#3e3a56');
  }
  aoTop(2, 60, W - 4, 6, 0.3);
  // windows either side of the door
  win(50, 70, 14, 16, { frame: '#e8e4dc', curtains: '#f0e6d8', seed: 21, cols: 2, rows: 2, plant: true });
  win(74, 70, 14, 16, { frame: '#e8e4dc', curtains: '#f0e6d8', seed: 22, cols: 2, rows: 2, cat: true });
  // door (centre x = 28)
  doorF(21, 66, 14, 34, '#7a4a5a', { frame: '#e8e4dc', step: null, lite: true, liteH: 11, seed: 185, mail: true });
  // posts
  for (const px of [3, 40, 92]) {
    R(px, 60, 2, GY - 64, '#e8e4dc');
    fv(px, 60, GY - 4, '#fffaf0');
    fv(px + 1.5, 60, GY - 4, '#b8b4ac');
  }
  // porch floor with the faded painted star
  R(0, GY - 4, W, 4, '#9a8a8a');
  fh(0, W, GY - 4, '#b8a8a8');
  FR(0, GY - 3.5, W, 3.5, (fx, fy, o) => (fx % 12 === 0 ? '#7a6a72' : hash2(fx, fy, 186) < 0.05 ? shA(o, 0.12) : o));
  const star = ['..#..', '.###.', '#####', '.###.', '.#.#.'];
  star.forEach((row, yy) => [...row].forEach((ch, xx) => {
    if (ch === '#') R(42 + xx * 2, GY - 4 + yy * 0.7, 2, 0.7, mixc('#f4b63f', '#9a8a8a', 0.45));
  }));
  // rocking chair on the porch, a quilt over it
  rocker(8, GY - 18, '#8a6a5a');
  R(9, GY - 16, 5, 3, '#c8584a');
  FR(9, GY - 16, 5, 3, (fx, fy) => ((fx + fy) % 4 === 0 ? '#f4b63f' : null));
  // overgrown planters
  for (const px of [44, 66]) {
    R(px, GY - 11, 8, 7, '#a8704f');
    fh(px, px + 8, GY - 11, '#c88a5a');
    fh(px, px + 8, GY - 4.5, '#6a4a3a');
    for (let k = 0; k < 6; k++) L(px + 1 + k, GY - 11, px + k + (k % 2 ? 2 : -1), GY - 17 - (k % 3) * 2, k % 2 ? '#6a8a4a' : '#8aa858');
    P1(px + 3, GY - 18, '#ffe070');
  }
  // vine creeping up the corner post
  for (let y = 60; y < GY - 4; y += 1) {
    P1(93 + ((y >> 1) % 2) * 0.5, y, '#5a8a4a');
    if (y % 4 === 0) ell(91.5, y, 1, 0.75, '#7aa858');
  }
}
building('b-grandma', {
  w: 96,
  h: 104,
  door: -20,
  draw: drawGrandma,
  shadowTop: 10,
  label: "Grandma's house",
  solid: { x: -48, y: -72, w: 96, h: 72 },
  lights: [
    [40, 30, 12, WARM],
    [57, 78, 14, WARM],
    [81, 78, 14, WARM],
    [28, 74, 8, WARM],
  ],
  anims: [{ fps: 3, frames: 4, rect: [68, -12, 16, 14], rel: true, draw: (f, _p, ox, oy) => puff(73 + ox, -1 + oy, f) }],
  pad: [0, 12, 10, 4],
});

// ---------------------------------------------------------------- tool shed
function drawShed(): void {
  const W = 48;
  const GY = 56;
  shingleF(0, 2, W, 16, '#6a6488', 191, 3, 4, 0.3);
  fh(0, W, 2, '#9a94b8');
  poly([[5, 22], [24, 7], [43, 22]], '#b44a42');
  R(0, 20, W, GY - 20, battenPaint('#b44a42', 192, 20, GY, 4));
  poly([[6, 22], [24, 8], [42, 22]], battenPaint('#b44a42', 193, 8, 22, 4));
  R(0, 20, W, 2, '#fbefd2');
  fh(0, W, 20, '#fffaf0');
  fh(0, W, 21.5, '#c8a8a0');
  L(5, 22, 24, 6, '#fbefd2');
  L(24, 6, 43, 22, '#fbefd2');
  aoTop(0, 22, W, 3, 0.25);
  // little window in the gable, a cobweb in the corner
  R(20, 12, 8, 7, '#fbefd2');
  glassF(21, 13, 6, 5, () => {
    R(21, 13, 6, 5, '#5a4a6e');
    R(22, 15, 2, 3, '#8a7a5a');
  });
  R(23.75, 13, 0.5, 5, '#fbefd2');
  L(21, 13, 22.5, 14.5, '#d8d4e8');
  P1(21.5, 14, '#d8d4e8');
  // double doors (centre x = 24)
  R(13, 28, 22, GY - 28, '#fbefd2');
  for (const ox of [14, 24]) {
    R(ox, 29, 10, GY - 29, battenPaint('#b93e3e', ox, 29, GY, 4));
    const tr = '#fbefd2';
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      R(ox + 1 + t * 7, 30 + t * (GY - 33), 1.25, 0.5, tr);
    }
    box(ox, 29, 10, GY - 29, tr);
    R(ox, 29 + (GY - 29) / 2, 10, 1, tr);
    for (const hy of [32, GY - 6]) {
      const hx = ox === 14 ? ox : ox + 5;
      R(hx, hy, 5, 1, '#3a3048');
      fh(hx, hx + 5, hy, '#6a5a70');
    }
  }
  R(22.5, 40, 1, 4, '#4a3550');
  R(24.5, 40, 1, 4, '#4a3550');
  RR(23, 43, 2, 2, 1, '#9a92b0');
  // tools hanging outside, a watering can
  L(4, GY - 2, 6, 25, '#c88a5a');
  R(3, 24, 5, 2, '#9a92b0');
  fh(3, 8, 24, '#d8d4e8');
  L(42, GY - 2, 44, 27, '#c88a5a');
  for (let k = 0; k < 4; k++) fv(41 + k, 25, 27, '#9a92b0');
  RR(37, GY - 6, 5, 5, 1, '#5a9a8a');
  fh(37.5, 41.5, GY - 6, '#8ac8b8');
  L(37, GY - 4, 34, GY - 7, '#5a9a8a');
  grime(0, GY - 7, W, 6, 0.24);
  R(0, GY - 2, W, 2, '#9a8a8a');
  fh(0, W, GY - 2, '#b8a8a8');
}
building('b-shed', {
  w: 48,
  h: 56,
  door: 0,
  draw: drawShed,
  shadowTop: 4,
  solid: { x: -24, y: -38, w: 48, h: 38 },
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
