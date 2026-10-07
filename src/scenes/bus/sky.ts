/**
 * Sky pieces: dithered gradients per time-of-day keyframe, a low rain deck
 * for the city, puffy morning cumulus, and long golden-hour streaks.
 */
import { col, dense, ell, FX, FY, mkSpr, R, rng, toCanvas } from '../../gfx/kit';
import { art, fn01, liA, mixc, rgba, shA } from './paint';
import { SKY } from './route';

const skyCache = new Map<string, HTMLCanvasElement>();
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** A 32-wide sky gradient for keyframe i at height h (tiles horizontally). */
export function skyStrip(i: number, h: number): HTMLCanvasElement {
  const key = `${i}.${h}`;
  const hit = skyCache.get(key);
  if (hit) return hit;
  const cs = SKY[i].stops.map(col);
  const n = cs.length - 1;
  // Interpolate the stops finely and dither only between neighbouring
  // steps, so the gradient reads smooth instead of a checkerboard.
  const STEPS = 40;
  const ramp: number[] = [];
  for (let k = 0; k <= STEPS; k++) {
    const u = (k / STEPS) * n;
    const a = Math.min(n - 1, Math.floor(u));
    ramp.push(mixc(cs[a], cs[a + 1], u - a));
  }
  const c = dense(2, () =>
    toCanvas(
      mkSpr(32, h, () => {
        R(0, 0, 32, h, () => {
          // ease toward the horizon so the glow hugs it
          const u = Math.pow(Math.max(0, Math.min(1, FY / 2 / Math.max(1, h - 1))), 1.35) * STEPS;
          const a = Math.min(STEPS - 1, Math.floor(u));
          const f = u - a;
          return f * 16 > BAYER[((FY & 3) << 2) | (FX & 3)] ? ramp[a + 1] : ramp[a];
        });
      }),
    ),
  );
  skyCache.set(key, c);
  return c;
}

/** The low, heavy rain deck over the city, with grey rain curtains. Tiles. */
export function rainDeck(): HTMLCanvasElement {
  const W = 320;
  const H = 56;
  return art('sky-rain', W, H, () => {
    const r = rng(12);
    const top = '#5c5a7e';
    const body = '#6a6788';
    const under = '#4c4a6c';
    R(0, 0, W, 16, top);
    for (let x = -10; x < W + 10; x += 6 + r() * 8) {
      const s = 6 + r() * 9;
      ell(x, 16 + r() * 4, s, s * 0.55, body);
    }
    // wrap the lumps so the tile seams vanish
    for (let x = -10; x < 10; x += 7) ell(W + x, 18, 8, 4.5, body);
    R(0, 0, W, 30, (_x, _y, o) => {
      if (!o) return null;
      const y = FY / 2;
      if (o === col(body) && y > 18 && fn01(3) < 0.6) return under;
      if (y < 12 && fn01(5) < 0.12) return liA(top, 0.12);
      return null;
    });
    // bright seams where the dawn leaks through
    for (let x = 0; x < W; x += 0.5) if (Math.sin(x / 23) > 0.86) R(x, 8 + Math.sin(x / 7) * 2, 0.5, 0.5, '#b8a6be');
    // rain curtains
    R(0, 18, W, H - 18, () => {
      const lane = Math.floor(FX / 3);
      const k = Math.sin(lane * 0.37) * 0.5 + 0.5;
      const y = FY / 2 - 18;
      const fade = 1 - y / (H - 18);
      if (fn01(lane) > 0.5 + k * 0.4) return rgba('#8a88a8', 0.28 * fade);
      return null;
    });
  });
}

/** A puffy morning cumulus, lit from the upper left. */
export function cumulus(v: number): HTMLCanvasElement {
  const W = [74, 52, 96][v % 3];
  const H = Math.round(W * 0.42);
  return art(`sky-cu${v}`, W, H, () => {
    const r = rng(40 + v);
    const white = '#fbf6f2';
    const shade = '#cbc6de';
    const deep = '#a9a8c8';
    const puffs: [number, number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const x = 8 + r() * (W - 16);
      const rr = 5 + r() * (H * 0.45);
      puffs.push([x, H - rr * 0.6 - 2, rr]);
    }
    for (const [x, y, s] of puffs) ell(x, y + 1.5, s, s * 0.8, deep);
    for (const [x, y, s] of puffs) ell(x - 0.5, y, s * 0.92, s * 0.74, shade);
    for (const [x, y, s] of puffs) ell(x - s * 0.25, y - s * 0.2, s * 0.62, s * 0.5, white);
    R(0, H - 3, W, 3, (_x, _y, o) => (o ? deep : null));
    R(0, 0, W, H, (_x, _y, o) => (o === col(shade) && fn01(v) < 0.1 ? liA(o, 0.3) : null));
  });
}

/** A long golden-hour streak: lavender above, lit coral underneath. */
export function streak(v: number, warm: 'golden' | 'sunset'): HTMLCanvasElement {
  const W = [130, 90, 170][v % 3];
  const H = 16;
  return art(`sky-st${v}${warm}`, W, H, () => {
    const r = rng(90 + v);
    const top = warm === 'golden' ? '#b39ac4' : '#9a76a8';
    const mid = warm === 'golden' ? '#e6a8a0' : '#e08088';
    const lit = warm === 'golden' ? '#ffd29a' : '#ffb07a';
    for (let i = 0; i < 7; i++) {
      const x = W * (0.12 + r() * 0.76);
      const rx = W * (0.12 + r() * 0.2);
      const ry = 2 + r() * 3;
      const y = 7 + (r() - 0.5) * 4;
      ell(x, y, rx, ry, top);
      ell(x + 1, y + ry * 0.45, rx * 0.92, ry * 0.6, mid);
      ell(x + rx * 0.15, y + ry * 0.8, rx * 0.6, ry * 0.3, lit);
    }
    // tattered fine edges
    R(0, 0, W, H, (_x, _y, o) => (o && fn01(v + 7) < 0.015 ? 0 : o === col(mid) && fn01(v) < 0.1 ? mixc(mid, lit, 0.5) : null));
  });
}

export { shA };
