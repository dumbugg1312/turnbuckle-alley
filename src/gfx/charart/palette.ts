import { cB, cG, col, cR, liA, lum, mixc, pk, shA, type Color } from '../kit';

/**
 * Material ramps for the character art. Every surface is painted from a
 * five-tone ramp whose shadows and highlights hue-shift the way painted pixel
 * art does: skin falls into warm red-orange, cloth into cool plum, and every
 * highlight leans toward butter yellow.
 */
export type MatKind = 'skin' | 'cloth' | 'hair' | 'metal' | 'leather' | 'fur' | 'denim' | 'glow';

export interface Ramp {
  /** Deep shadow. */
  d2: number;
  /** Shadow. */
  d1: number;
  /** Mid tone. */
  m: number;
  /** Light. */
  l1: number;
  /** Highlight. */
  l2: number;
}

const cache = new Map<string, Ramp>();

/** Hue-shift a colour toward a target while darkening (k 0..1). */
function toward(c: Color, target: Color, dark: number, hue: number): number {
  const n = col(c);
  const t = col(target);
  const r = cR(n) * (1 - dark) + (cR(t) - cR(n)) * hue * (1 - dark) * 0.5;
  const g = cG(n) * (1 - dark) + (cG(t) - cG(n)) * hue * (1 - dark) * 0.5;
  const b = cB(n) * (1 - dark) + (cB(t) - cB(n)) * hue * (1 - dark) * 0.5;
  return pk(r, g, b);
}

export function ramp(base: Color, kind: MatKind = 'cloth'): Ramp {
  const key = (typeof base === 'number' ? base.toString(16) : base) + '|' + kind;
  const hit = cache.get(key);
  if (hit) return hit;
  const L = lum(base);
  let r: Ramp;
  switch (kind) {
    case 'skin':
      r = {
        d2: toward(base, '#a0383a', 0.4, 0.75),
        d1: toward(base, '#c8503c', 0.2, 0.6),
        m: col(base),
        l1: mixc(base, '#fff0d0', 0.22),
        l2: mixc(base, '#fff6dc', 0.46),
      };
      break;
    case 'hair':
      r = {
        d2: shA(base, L > 0.75 ? 0.42 : 0.52),
        d1: shA(base, L > 0.75 ? 0.22 : 0.3),
        m: col(base),
        l1: L > 0.8 ? liA(base, 0.3) : mixc(liA(base, 0.3), '#ffd9a0', 0.15),
        l2: L > 0.8 ? col('#fffaf0') : liA(base, 0.58),
      };
      break;
    case 'fur':
      r = { d2: shA(base, 0.5), d1: shA(base, 0.28), m: col(base), l1: liA(base, 0.18), l2: liA(base, 0.36) };
      break;
    case 'metal':
      r = { d2: shA(base, 0.62), d1: shA(base, 0.32), m: col(base), l1: liA(base, 0.4), l2: col('#fff8e4') };
      break;
    case 'leather':
      r = { d2: shA(base, 0.58), d1: shA(base, 0.32), m: col(base), l1: liA(base, 0.1), l2: liA(base, 0.42) };
      break;
    case 'denim':
      r = { d2: shA(base, 0.46), d1: shA(base, 0.24), m: col(base), l1: mixc(base, '#a8c0e0', 0.22), l2: mixc(base, '#d8e4f4', 0.4) };
      break;
    case 'glow':
      r = { d2: col(base), d1: col(base), m: col(base), l1: liA(base, 0.4), l2: liA(base, 0.7) };
      break;
    default:
      r = {
        d2: shA(base, L > 0.8 ? 0.4 : 0.5),
        d1: shA(base, L > 0.8 ? 0.2 : 0.27),
        m: col(base),
        l1: liA(base, L > 0.85 ? 0.3 : 0.17),
        l2: liA(base, L > 0.85 ? 0.5 : 0.38),
      };
  }
  cache.set(key, r);
  return r;
}

/** Pick a tone from a ramp by light value v in [-1, 1]. */
export function tone(r: Ramp, v: number): number {
  if (v < -0.62) return r.d2;
  if (v < -0.18) return r.d1;
  if (v < 0.42) return r.m;
  if (v < 0.8) return r.l1;
  return r.l2;
}

/** Tone index -2..2 → colour. */
export function toneAt(r: Ramp, i: number): number {
  return i <= -2 ? r.d2 : i === -1 ? r.d1 : i === 0 ? r.m : i === 1 ? r.l1 : r.l2;
}

/** Shift a colour by whole tones through its ramp (kind picks the hue shift). */
export function tint(c: Color, i: number, kind: MatKind = 'cloth'): number {
  return toneAt(ramp(c, kind), i);
}

/** Deep plum ink (never pure black) and a few shared accents. */
export const INK = '#2b2140';
export const EYE_WHITE = '#fff6ea';
export const EYE_SHINE = '#ffffff';
export const BLUSH = '#f2927e';
export const LIP = '#a8435a';
export const LIP_DARK = '#6e2a48';
export const TOOTH = '#fff6ea';
export const TONGUE = '#d8607a';
export const CREAM = '#fbf0d9';
