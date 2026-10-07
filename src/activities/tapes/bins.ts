import { hashString, Rng } from '../../core/rng';
import { TAPES } from './catalog';
import type { BinDef, BinId, CrateSlot, Rarity, TapeDef } from './types';

/** Tape bins. Pure data and pure functions (no DOM, no game state) so tests can run them. */
export const BINS: Record<BinId, BinDef> = {
  flea: {
    id: 'flea', name: 'Flea Market Tapes', sign: 'TAPES $1-$5  NO RETURNS',
    weights: { common: 74, uncommon: 21, rare: 4.5, legendary: 0.5 },
    weekendWeights: { common: 58, uncommon: 29, rare: 11, legendary: 2 },
    count: [7, 10], weekdayCount: [3, 5], priceMul: 1, mysteryPrice: 3, mysteryChance: 0.14, freeChance: 0.1, haggle: true,
  },
  fenwick: {
    id: 'fenwick', name: "Fenwick's Back Room", sign: 'BACK ROOM  ask before touching',
    weights: { common: 22, uncommon: 40, rare: 30, legendary: 8 },
    count: [6, 8], priceMul: 1.2, mysteryPrice: 12, mysteryChance: 0.12, freeChance: 0, haggle: true,
  },
  'yard-sale': {
    id: 'yard-sale', name: 'Yard Sale Box', sign: 'EVERYTHING 50¢ (ish)',
    weights: { common: 84, uncommon: 13, rare: 2.6, legendary: 0.4 },
    count: [5, 8], priceMul: 0.5, mysteryPrice: 1, mysteryChance: 0.25, freeChance: 0.3, haggle: false,
  },
  dump: {
    id: 'dump', name: 'The Dump', sign: 'TAKE WHAT YOU WANT',
    weights: { common: 62, uncommon: 26, rare: 10, legendary: 2 },
    count: [4, 7], priceMul: 0, mysteryPrice: 0, mysteryChance: 0.4, freeChance: 0, haggle: false,
  },
  library: {
    id: 'library', name: 'Library Book Sale Cart', sign: 'VHS $1  (Earl says please)',
    weights: { common: 55, uncommon: 35, rare: 10, legendary: 0 },
    count: [4, 6], priceMul: 0.4, mysteryPrice: 1, mysteryChance: 0.05, freeChance: 0, haggle: false,
  },
};

/** Bins that exist on the map today (yard sale = flea crate 3 on weekends). */
export const PLACED_BINS: BinId[] = ['flea', 'fenwick', 'yard-sale'];

export interface CrateCtx {
  seed: number;
  day: number; // absolute day
  weekday: number; // 0 Mon .. 6 Sun
  season: number;
  weather: string;
  flags: Record<string, unknown>;
  owned: Set<string>;
  /** Hour of day (0-26); flea vendors pack up at night. */
  hour: number;
}

export function isWeekend(weekday: number): boolean {
  return weekday >= 5;
}

/** Which bin a crate object really is today. */
export function binForCrate(bin: string, objectId: string, weekday: number): BinId {
  if (bin === 'flea' && objectId.endsWith('-3') && isWeekend(weekday)) return 'yard-sale';
  return (bin in BINS ? bin : 'flea') as BinId;
}

export function tapeAvailable(t: TapeDef, bin: BinId, c: CrateCtx): boolean {
  if (!t.bins.includes(bin)) return false;
  if (t.seasons && !t.seasons.includes(c.season)) return false;
  const rainy = c.weather === 'rain' || c.weather === 'storm';
  if (t.weatherOnly === 'rain' && !rainy) return false;
  if (t.weatherOnly === 'snow' && c.weather !== 'snow') return false;
  if (t.weekendOnly && !isWeekend(c.weekday)) return false;
  if (t.requires) {
    if (t.requires.flags?.some((f) => !c.flags[f])) return false;
    if ((t.requires.minOwned ?? 0) > c.owned.size) return false;
  }
  return true;
}

export function tapePrice(t: TapeDef, bin: BinId): number {
  const p = t.price * BINS[bin].priceMul;
  return p <= 0 ? 0 : Math.max(1, Math.round(p));
}

/**
 * Today's crate: deterministic per (save seed, crate, day). Owned tapes can
 * still show up (marked "already have"), just less often. Story-gated tapes
 * that just unlocked get a big boost so they surface within a few days.
 */
export function generateCrate(bin: BinId, crateKey: string, c: CrateCtx): CrateSlot[] {
  const def = BINS[bin];
  const rng = new Rng(hashString(`${c.seed}:${crateKey}:${c.day}`));
  const weekend = isWeekend(c.weekday);
  const weights: Record<Rarity, number> = { ...(weekend && def.weekendWeights ? def.weekendWeights : def.weights) };
  const rainy = c.weather === 'rain' || c.weather === 'storm';
  if (rainy) {
    weights.rare *= 1.8;
    weights.legendary *= 2;
    weights.uncommon *= 1.2;
  } else if (c.weather === 'snow') {
    weights.rare *= 1.3;
  }
  let [lo, hi] = !weekend && def.weekdayCount ? def.weekdayCount : def.count;
  if (bin === 'flea' && (c.hour >= 18 || c.hour < 7)) [lo, hi] = [3, 4]; // the honor-box crate under the tarp
  if (rainy) hi += 1;
  const n = rng.int(lo, hi);
  const pool = TAPES.filter((t) => tapeAvailable(t, bin, c));
  const slots: CrateSlot[] = [];
  const picked = new Set<string>();
  for (let i = 0; i < n && picked.size < pool.length; i++) {
    const cand = pool.filter((t) => !picked.has(t.id));
    if (!cand.length) break;
    const t = rng.weighted(cand, (t) => {
      let w = weights[t.rarity] / Math.max(1, pool.filter((p) => p.rarity === t.rarity).length);
      if (c.owned.has(t.id)) w *= 0.3;
      else if (t.requires) w *= 6; // newly unlocked story tapes come out fast
      if (t.weather === 'rain' && rainy) w *= 3;
      if (t.weather === 'snow' && c.weather === 'snow') w *= 3;
      return w;
    });
    picked.add(t.id);
    const mystery = !!t.mystery || rng.chance(def.mysteryChance);
    slots.push({ tape: t.id, price: mystery ? def.mysteryPrice : tapePrice(t, bin), mystery, free: false });
  }
  if (slots.length && rng.chance(def.freeChance * (rainy ? 1.5 : 1))) {
    const s = slots[rng.int(0, slots.length - 1)];
    s.free = true;
    s.price = 0;
  }
  return slots;
}
