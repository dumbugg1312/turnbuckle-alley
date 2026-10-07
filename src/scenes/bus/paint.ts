/**
 * Shared painting helpers for the bus ride. Everything is built at double
 * density (D-018) and cached once per key.
 */
import { col, dense, FX, FY, hash2, liA, mixc, mkSpr, OUT, selA, selAsoft, shA, toCanvas, type Color, type Paint, type Spr } from '../../gfx/kit';

const cache = new Map<string, HTMLCanvasElement>();

/** Build (once) a dense canvas of w x h world pixels. */
export function art(key: string, w: number, h: number, fn: (s: Spr) => void, outline: false | 'hard' | 'soft' = false): HTMLCanvasElement {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = dense(2, () => {
    let s = mkSpr(w, h, fn);
    if (outline) s = OUT(s, outline === 'soft' ? selAsoft : selA);
    return toCanvas(s);
  });
  cache.set(key, c);
  return c;
}

export function dropCache(prefix: string): void {
  for (const k of [...cache.keys()]) if (k.startsWith(prefix)) cache.delete(k);
}

/** A colour with alpha (0..1) for translucent pixels (glass, shadow volumes). */
export function rgba(c: Color, a: number): number {
  const n = col(c);
  return ((Math.round(Math.max(0, Math.min(1, a)) * 255) << 24) | (n & 0xffffff)) >>> 0;
}

/** Fine-pixel noise in the current paint callback. */
export const fn01 = (seed = 0): number => hash2(FX, FY, seed);

/** Paint: base colour with sparse fine flecks lighter/darker (material tooth). */
export function tooth(c: Color, amt = 0.12, seed = 0, density = 0.18): Paint {
  const base = col(c);
  const lo = shA(base, amt);
  const hi = liA(base, amt * 0.9);
  return () => {
    const v = hash2(FX, FY, seed);
    return v < density * 0.6 ? lo : v > 1 - density * 0.4 ? hi : base;
  };
}

/** Paint: vertical wood/board grain with long streaks. */
export function grainV(c: Color, amt = 0.14, seed = 0): Paint {
  const base = col(c);
  const lo = shA(base, amt);
  const hi = liA(base, amt * 0.7);
  return () => {
    const s = hash2(FX, Math.floor(FY / 7), seed);
    const v = hash2(FX, FY, seed + 3);
    if (s < 0.16) return lo;
    if (s > 0.9 && v > 0.3) return hi;
    return v < 0.04 ? lo : base;
  };
}

/** Paint: horizontal streaks (asphalt, concrete, field rows). */
export function grainH(c: Color, amt = 0.1, seed = 0): Paint {
  const base = col(c);
  const lo = shA(base, amt);
  const hi = liA(base, amt * 0.7);
  return () => {
    const s = hash2(Math.floor(FX / 9), FY, seed);
    const v = hash2(FX, FY, seed + 5);
    if (s < 0.14 && v < 0.7) return lo;
    if (s > 0.92 && v < 0.6) return hi;
    return base;
  };
}

/** Paint: vertical gradient over [y0, y1] (world px), finely dithered. */
export function vgrad(y0: number, y1: number, stops: Color[]): Paint {
  const cs = stops.map(col);
  const n = cs.length - 1;
  return () => {
    const t = Math.max(0, Math.min(1, (FY / 2 - y0) / Math.max(1, y1 - y0))) * n;
    const i = Math.min(n - 1, Math.floor(t));
    const f = t - i;
    const b = BAYER[((FY & 3) << 2) | (FX & 3)] / 16;
    return f > b ? cs[i + 1] : cs[i];
  };
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Fine ordered-dither test at the current fine pixel (lvl 0..16). */
export const fdth = (lvl: number): boolean => BAYER[((FY & 3) << 2) | (FX & 3)] < lvl;

/** Paint that only touches existing pixels and shades them (k > 0 darker, k < 0 lighter). */
export function over(k: number, onlyLvl = 16): Paint {
  return (_x: number, _y: number, o: number) => {
    if (!o) return null;
    if (onlyLvl < 16 && !fdth(onlyLvl)) return null;
    return k > 0 ? shA(o, k) : liA(o, -k);
  };
}
/** Paint that tints existing pixels toward a colour. */
export function tint(c: Color, k: number, onlyLvl = 16): Paint {
  const cc = col(c);
  return (_x: number, _y: number, o: number) => {
    if (!o) return null;
    if (onlyLvl < 16 && !fdth(onlyLvl)) return null;
    return mixc(o, cc, k);
  };
}

/** Colour helpers re-exported for painters. */
export { shA, liA, mixc };
