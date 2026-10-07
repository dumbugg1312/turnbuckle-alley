/**
 * The one-tap timing bar. A marker sweeps across and back (about one second
 * total); tap inside the sweet spot. Pure math, so it can be tested.
 */

export interface Timing {
  /** Sweet spot centre, 0..1 along the bar. */
  center: number;
  /** Half-width of the perfect zone. */
  perfect: number;
  /** Half-width of the good zone. */
  good: number;
  /** Seconds for one pass across the bar (the marker goes there and back). */
  pass: number;
}

/** Bar for one swing. Deeper floors are a little quicker; Strength widens the sweet spot. */
export function timingFor(floor: number, weight: number, strengthLevel: number, rand: () => number): Timing {
  const depth = Math.min(1, (Math.max(1, floor) - 1) / 35);
  const widen = 1 + Math.min(10, strengthLevel) * 0.04;
  const pass = 0.62 - depth * 0.17 + (weight === 3 ? 0.04 : 0);
  const good = (0.13 - depth * 0.03) * widen;
  const perfect = (0.045 - depth * 0.012) * widen;
  // Keep the zone fully on the bar, and away from the very start so there is a beat to read it.
  const center = 0.3 + rand() * 0.55;
  return { center, perfect, good, pass };
}

/** Marker position at time t (seconds since the sweep began), or -1 once the sweep is over. */
export function markerAt(t: number, pass: number): number {
  if (t < 0) return 0;
  if (t > pass * 2) return -1;
  const k = t / pass;
  const p = k <= 1 ? k : 2 - k;
  // A touch of ease at the turnaround so the marker "hangs" at the far end.
  return p;
}

/** 2 = perfect, 1 = good, 0 = sloppy. */
export function gradeAt(pos: number, tm: Timing): 0 | 1 | 2 {
  if (pos < 0) return 0;
  const d = Math.abs(pos - tm.center);
  if (d <= tm.perfect) return 2;
  if (d <= tm.good) return 1;
  return 0;
}
