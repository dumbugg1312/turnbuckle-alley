import { Rng } from '../core/rng';

/**
 * Small morning surprises: which one (if any) happens today. Pure and seeded,
 * so a save always gets the same mornings; the world side (placing a pie on
 * the windowsill, a raccoon in the bin) lives in surprises.ts.
 */
export const SURPRISE_IDS = [
  'tiny-pie', 'raccoon-bin', 'pip-drawing', 'stray-chair', 'lost-flyer', 'plumb-visit', 'june-thermos', 'wildflowers',
  'old-program', 'arlo-postcard', 'hank-offcuts', 'tamales', 'pip-cape', 'grey-feather', 'honey-jar', 'agnes-bulletin',
] as const;
export type SurpriseId = (typeof SURPRISE_IDS)[number];

export interface SurpriseCtx {
  /** 0-based absolute day. */
  abs: number;
  season: number;
  weekday: number;
  weather: string;
  hearts: (id: string) => number;
  flags: Record<string, unknown>;
  /** How many of Pip's drawings are already on the fridge. */
  drawings: number;
  seed: number;
}

export interface SurpriseRecord {
  id: SurpriseId;
  day: number;
}

/** About three mornings in ten. */
export const SURPRISE_CHANCE = 0.3;
/** The same surprise never comes back within this many days. */
export const REPEAT_GAP = 7;
/** Pip has this many drawings to give. */
export const PIP_DRAWINGS = 8;

const debuted = (c: SurpriseCtx) => !!c.flags['debuted'];

/** Relative weight of each surprise today; 0 means it can't happen. */
export const SURPRISE_WEIGHT: Record<SurpriseId, (c: SurpriseCtx) => number> = {
  'tiny-pie': (c) => 1 + c.hearts('tiny') * 0.25,
  'raccoon-bin': (c) => (c.season === 3 ? 0.3 : 1.1),
  'pip-drawing': (c) => (c.flags['met_pip'] && c.drawings < PIP_DRAWINGS ? 1 + c.hearts('pip') * 0.35 : 0),
  'stray-chair': () => 1,
  'lost-flyer': (c) => (c.weather === 'rain' || c.weather === 'storm' ? 0 : c.weather === 'wind' ? 3 : 0.8),
  'plumb-visit': (c) => (debuted(c) ? 0.7 + c.hearts('hank') * 0.3 : 0),
  'june-thermos': (c) => (debuted(c) ? 0.6 + c.hearts('june') * 0.2 : 0),
  wildflowers: (c) => [1.3, 1, 0.4, 0][c.season % 4],
  'old-program': (c) => (debuted(c) ? 0.5 + c.hearts('lou') * 0.15 : 0),
  'arlo-postcard': (c) => (c.abs >= 4 && !c.flags['arlo_in_town'] ? 0.7 + c.hearts('arlo') * 0.2 : 0),
  'hank-offcuts': (c) => (debuted(c) || c.flags['yard_cleared'] ? 0.6 : 0),
  tamales: (c) => (debuted(c) ? 0.6 + c.hearts('mariposa') * 0.2 : 0),
  'pip-cape': (c) => (c.flags['met_pip'] && !c.flags['sx_pip_cape'] ? (c.weather === 'wind' || c.weather === 'storm' ? 2.5 : 0.15) : 0),
  'grey-feather': () => 0.3,
  'honey-jar': (c) => (debuted(c) ? [0.3, 0.9, 0.9, 0.2][c.season % 4] : 0),
  'agnes-bulletin': (c) => (debuted(c) ? (c.weekday === 6 ? 1.2 : 0.4) + c.hearts('agnes') * 0.15 : 0),
};

/** Ids still allowed today: not seen within the repeat gap, and weighted above zero. */
export function eligible(c: SurpriseCtx, history: readonly SurpriseRecord[]): SurpriseId[] {
  return SURPRISE_IDS.filter((id) => SURPRISE_WEIGHT[id](c) > 0 && !history.some((h) => h.id === id && c.abs - h.day < REPEAT_GAP));
}

/** Today's surprise, or null (most mornings). The first two days stay quiet. */
export function rollSurprise(c: SurpriseCtx, history: readonly SurpriseRecord[]): SurpriseId | null {
  if (c.abs < 2) return null;
  const rng = new Rng((Math.imul(c.seed | 0, 2654435761) ^ Math.imul(c.abs + 1, 40503) ^ 0x5eed) >>> 0);
  if (!rng.chance(SURPRISE_CHANCE)) return null;
  const pool = eligible(c, history);
  if (!pool.length) return null;
  return rng.weighted(pool, (id) => SURPRISE_WEIGHT[id](c));
}
