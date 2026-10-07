/**
 * The bus ride's timeline: how fast the bus goes, what time of day it is, and
 * which line of narration plays when. Everything on screen is placed by the
 * moment it should cross the window, so captions can be timed to the visuals
 * exactly (a caption about cows only plays while cows are in the window).
 */

/** Seconds from the first frame until the bus has stopped at the town sign. */
export const STOP_T = 44.5;
/** Total length before the scene hands over. */
export const DURATION = 48.5;
/** Near-layer pixels per second at full speed. */
export const SPEED = 220;

/** Parallax rates (fraction of the near layer's motion). */
export const RATE = { cloud: 0.02, far: 0.05, midfar: 0.28, mid: 0.55, near: 1.25 } as const;
export type Layer = keyof typeof RATE;

// Bus speed (0..1) keyframes: crawling out of the city, open highway, slower
// farm roads, then easing to a full stop beside the town sign.
const V: [number, number][] = [
  [0, 0.22],
  [2.5, 0.5],
  [9, 0.55],
  [10.5, 0.8],
  [20, 0.9],
  [21.5, 1],
  [26, 0.85],
  [28, 0.62],
  [37, 0.62],
  [40, 0.48],
  [STOP_T, 0],
];

function vAt(t: number): number {
  if (t <= V[0][0]) return V[0][1];
  for (let i = 1; i < V.length; i++) {
    if (t <= V[i][0]) {
      const [t0, v0] = V[i - 1];
      const [t1, v1] = V[i];
      const k = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * k;
    }
  }
  return 0;
}

// Distance travelled (in "seconds at full speed"), tabulated for lookups.
const STEP = 0.02;
const TABLE: number[] = (() => {
  const out = [0];
  let d = 0;
  // Start well before t = 0 so objects can already be on screen.
  for (let t = STEP; t <= DURATION + 2; t += STEP) {
    d += ((vAt(t - STEP) + vAt(t)) / 2) * STEP;
    out.push(d);
  }
  return out;
})();

/** Distance travelled by time t. Negative t extrapolates at the starting speed. */
export function dist(t: number): number {
  if (t <= 0) return t * V[0][1] * 2.2;
  const i = t / STEP;
  const a = Math.floor(i);
  if (a >= TABLE.length - 1) return TABLE[TABLE.length - 1];
  return TABLE[a] + (TABLE[a + 1] - TABLE[a]) * (i - a);
}

/** Current speed 0..1 (for road rumble, motion blur and bob). */
export const speedAt = vAt;

/**
 * Screen x (window coordinates) of something placed on layer L so that it
 * crosses window fraction f at time tc.
 */
export function screenX(L: Layer, tc: number, f: number, t: number, ww: number): number {
  return f * ww + (dist(tc) - dist(t)) * SPEED * RATE[L];
}

/** Layer scroll offset at time t (for tiled bands). */
export function scroll(L: Layer, t: number): number {
  return dist(t) * SPEED * RATE[L];
}

// ---------------------------------------------------------------- time of day
/** Sky stops, top to horizon. */
export const SKY: { t: number; stops: string[] }[] = [
  { t: 0, stops: ['#3b3e66', '#565a84', '#837fa2', '#ad9cb0'] }, // rainy city dawn
  { t: 10, stops: ['#45527f', '#6c78a4', '#a9a7c4', '#e2bfb6'] }, // clearing
  { t: 15.5, stops: ['#4c79bb', '#729dd2', '#a6c7e3', '#d9e8ee'] }, // morning
  { t: 22, stops: ['#3d76cc', '#5f98de', '#92c0ec', '#cde6f2'] }, // noon
  { t: 28.5, stops: ['#5a6db2', '#9b8dbf', '#f1b08a', '#ffd79e'] }, // golden hour
  { t: 39, stops: ['#47478e', '#9e649c', '#ec8676', '#ffc27e'] }, // sunset
  { t: 48, stops: ['#3d3c82', '#8a5794', '#e07670', '#ffb576'] },
];

/** Which two sky keyframes to blend, and how far between them. */
export function skyAt(t: number): { a: number; b: number; k: number } {
  for (let i = 1; i < SKY.length; i++) {
    if (t <= SKY[i].t) {
      const k = (t - SKY[i - 1].t) / (SKY[i].t - SKY[i - 1].t);
      // Hold each look a little, then ease across.
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      return { a: i - 1, b: i, k: Math.max(0, Math.min(1, e)) };
    }
  }
  return { a: SKY.length - 1, b: SKY.length - 1, k: 0 };
}

/** 0..1 ramps used all over the scene. */
export const ramp = (t: number, a: number, b: number): number => Math.max(0, Math.min(1, (t - a) / (b - a)));
export const pulse = (t: number, a: number, b: number, c: number, d: number): number => Math.min(ramp(t, a, b), 1 - ramp(t, c, d));

/** Rain on the glass: heavy in the city, gone shortly after the overpass. */
export const rainAt = (t: number): number => 1 - ramp(t, 10.6, 13);
/** Direct low sun (rim light, flares, dust motes). */
export const sunAt = (t: number): number => pulse(t, 25.5, 30, 47, 49) * 1;
/** Morning sun (soft, high, from the left). */
export const morningAt = (t: number): number => pulse(t, 11, 15, 22, 26);

// ---------------------------------------------------------------- narration
/**
 * Every line describes what is in the window while it shows (each caption is
 * on screen for about 4.6 seconds). The scenery in scenery placement below is
 * timed against these.
 */
export const CAPTIONS: [number, string][] = [
  [0.7, 'Route 9 · The City → Turnbuckle Alley'],
  [5.4, 'A MaxxMedia billboard: EVERY MOMENT, CLIPPED. Not this one.'],
  [10.7, 'Under the last overpass, the rain gives up.'],
  [15.6, 'The suburbs. Every lawn a different opinion.'],
  [20.6, 'A green sign: TURNBUCKLE ALLEY, 152 miles. Your coffee has gone cold.'],
  [26.8, 'Cows. So many cows. One of them watches you go.'],
  [32, 'An old windmill, turning slow. Grandma said they only spin for people coming home.'],
  [37.2, 'On the horizon, a water tower shaped like a turnbuckle pad.'],
  [42.2, 'Turnbuckle Alley. Pop. 2,814. Plus one.'],
];
