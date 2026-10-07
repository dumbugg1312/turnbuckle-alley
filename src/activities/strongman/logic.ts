/**
 * The strongman bell: one swing, one timing tap. A marker sweeps back and
 * forth along the swing meter; tap it in the gold and the puck rings the bell.
 * Pure math, like the Dungeon's timing bar, so it can be tested.
 */

export interface Swing {
  /** Sweet spot centre, 0..1 along the meter. */
  center: number;
  /** Half-width of the bell-ringing zone. */
  perfect: number;
  /** Half-width of the strong zone. */
  good: number;
  /** Seconds for one pass across the meter. */
  pass: number;
}

/** Strength widens the sweet spot a little; the zone sits toward the far end. */
export function swingFor(strengthLevel: number, rand: () => number): Swing {
  const widen = 1 + Math.min(10, Math.max(0, strengthLevel)) * 0.05;
  return { center: 0.6 + rand() * 0.3, perfect: 0.038 * widen, good: 0.13 * widen, pass: 0.62 };
}

/** Marker position 0..1 at time t: back and forth until the tap. */
export function sweepAt(t: number, pass: number): number {
  if (t <= 0) return 0;
  const k = (t / pass) % 2;
  return k <= 1 ? k : 2 - k;
}

/** How high the puck flies, 0..1. 1 rings the bell. */
export function heightFor(pos: number, s: Swing): number {
  if (pos < 0) return 0.05;
  const d = Math.abs(pos - s.center);
  if (d <= s.perfect) return 1;
  const k = (d - s.perfect) / (s.good * 2.2);
  return Math.max(0.06, Math.min(0.94, 0.94 - k * 0.92));
}

/** Tower marks, bottom to top. The bell is the last one. */
export const TIERS = ['PIP-WEIGHT', 'OPENER', 'UNDERCARD', 'MIDCARD', 'MAIN EVENT', 'HALL OF FAME'] as const;

export function tierFor(h: number): number {
  if (h >= 1) return TIERS.length - 1;
  return Math.max(0, Math.min(TIERS.length - 2, Math.floor(h * (TIERS.length - 1))));
}
