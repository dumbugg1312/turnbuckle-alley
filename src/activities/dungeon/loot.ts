/**
 * Dungeon reward tables. Pure functions over a random source so they can be
 * unit tested. Deeper floors shift the odds from tape and chalk toward
 * sequins, then rhinestones, then gold leaf.
 */
import { eraFor, GOLDEN_FLOOR, NODES, type EraId, type NodeKind } from './eras';

export type Rand = () => number;

export const MATERIALS = ['tape', 'chalk', 'canvas', 'rope', 'iron', 'leather', 'sequins', 'rhinestone', 'gold-leaf'] as const;
export type Material = (typeof MATERIALS)[number];

/** Material weights per depth tier (columns: floors 1–5, 6–10, 11–15, 16–20, 21–25, 26–30, encores). */
export const MATERIAL_TABLE: Record<Material, number[]> = {
  tape: [30, 18, 10, 6, 4, 2, 2],
  chalk: [30, 16, 10, 6, 4, 2, 2],
  canvas: [20, 22, 14, 10, 6, 4, 3],
  rope: [8, 18, 18, 12, 10, 6, 5],
  iron: [6, 16, 22, 16, 14, 10, 8],
  leather: [2, 8, 18, 18, 16, 12, 10],
  sequins: [0, 1, 6, 22, 22, 18, 18],
  rhinestone: [0, 0, 0, 4, 14, 20, 22],
  'gold-leaf': [0, 0, 0, 0, 3, 10, 16],
};

/** 0..6 depth tier. */
export function tierFor(floor: number): number {
  if (floor > GOLDEN_FLOOR) return 6;
  return Math.min(5, Math.floor((Math.max(1, floor) - 1) / 5));
}

/** Relics that turn up in each era (plus the classics everywhere). */
export const RELICS: Record<EraId, string[]> = {
  carnival: ['old-program', 'signed-photo', 'toy-wrestler'],
  territory: ['old-program', 'signed-photo', 'toy-wrestler'],
  boxing: ['old-program', 'signed-photo', 'toy-wrestler', 'vinyl'],
  aerobics: ['old-program', 'signed-photo', 'toy-wrestler', 'cassette', 'vinyl'],
  garage: ['old-program', 'signed-photo', 'toy-wrestler', 'cassette', 'comic', 'trading-card'],
  haunted: ['old-program', 'signed-photo', 'toy-wrestler', 'polaroid', 'mothman-figure'],
};

export function pickMaterial(tier: number, rand: Rand, affinity: string[] = []): Material {
  const t = Math.max(0, Math.min(6, tier));
  let total = 0;
  const ws = MATERIALS.map((m) => {
    let w = MATERIAL_TABLE[m][t];
    // Equipment leans toward its own materials, but only ones this depth already allows.
    if (affinity.includes(m) && w > 0) w = w * 2.5 + 4;
    total += w;
    return w;
  });
  let r = rand() * total;
  for (let i = 0; i < MATERIALS.length; i++) {
    r -= ws[i];
    if (r <= 0) return MATERIALS[i];
  }
  return MATERIALS[0];
}

export interface Drop {
  id: string;
  n: number;
  relic?: boolean;
}

/** Merge duplicate ids. */
export function merge(drops: Drop[]): Drop[] {
  const out: Drop[] = [];
  for (const d of drops) {
    const hit = out.find((o) => o.id === d.id);
    if (hit) hit.n += d.n;
    else out.push({ ...d });
  }
  return out;
}

/**
 * Loot for finishing a piece of equipment.
 * perfectShare: 0..1, how much of the set was perfect hits. streak: current perfect streak.
 */
export function rollNodeLoot(floor: number, kind: NodeKind, perfectShare: number, streak: number, rand: Rand): Drop[] {
  const def = NODES[kind];
  const tier = tierFor(floor);
  const { era } = eraFor(floor);
  const drops: Drop[] = [];
  let rolls = def.weight === 3 ? 2 : def.weight === 2 ? (rand() < 0.5 ? 2 : 1) : 1;
  if (perfectShare > 0) rolls++;
  if (streak >= 3) rolls++;
  for (let i = 0; i < rolls; i++) {
    // Perfect form digs a tier deeper now and then.
    const up = rand() < 0.35 * perfectShare ? 1 : 0;
    drops.push({ id: pickMaterial(tier + up, rand, def.affinity), n: 1 });
  }
  let relicChance = 0.03 + tier * 0.01 + (perfectShare > 0 ? 0.02 : 0);
  if (kind === 'rattling-locker') relicChance *= 3;
  if (kind === 'trophy-heap' || kind === 'gilded-kettlebell') relicChance *= 1.5;
  if (rand() < relicChance) {
    const pool = RELICS[era.id];
    let id = pool[Math.floor(rand() * pool.length)];
    // The Mothman figurine is a once-in-a-blue-moon find.
    if (id === 'mothman-figure' && rand() < 0.7) id = 'polaroid';
    drops.push({ id, n: 1, relic: true });
  }
  return merge(drops);
}

/** The bundle a ghost gives after a 4★+ spar. */
export function rollSparBundle(floor: number, stars: number, rand: Rand): Drop[] {
  const tier = tierFor(floor);
  const drops: Drop[] = [];
  const n = stars >= 5 ? 4 : stars >= 4.5 ? 3 : 2;
  for (let i = 0; i < n; i++) drops.push({ id: pickMaterial(tier + (stars >= 4.5 && i === 0 ? 1 : 0), rand), n: 1 });
  if (stars >= 5) drops.push({ id: pickMaterial(Math.min(6, tier + 2), rand), n: 1 });
  return merge(drops);
}

/** Strength XP for one hit. grade: 2 perfect, 1 good, 0 sloppy. */
export function hitXp(floor: number, weight: number, grade: 0 | 1 | 2): number {
  const base = 2 + weight * 2;
  const depth = 1 + (Math.max(1, floor) - 1) / 20;
  const g = grade === 2 ? 1.6 : grade === 1 ? 1 : 0.5;
  return Math.max(1, Math.round(base * depth * g));
}

/** Bonus Strength XP for finishing a set. */
export function finishXp(floor: number, weight: number): number {
  return Math.round(weight * 3 * (1 + (Math.max(1, floor) - 1) / 20));
}

/** Energy for one swing: a set's cost spread over its expected good swings. Perfect swings cost half. */
export function swingEnergy(cost: number, weight: number, grade: 0 | 1 | 2): number {
  const per = cost / weight;
  return grade === 2 ? per * 0.5 : per;
}

/** Reps a swing does: sloppy 1, good 2, perfect 3. */
export function swingReps(grade: 0 | 1 | 2): number {
  return grade + 1;
}
