import { describe, expect, it } from 'vitest';
import { compileSong, songSeconds } from '../src/audio/notation';
import { heightFor, swingFor, sweepAt, tierFor, TIERS } from '../src/activities/strongman/logic';
import {
  canCook, canPlant, CROPS, emptyPlot, GARDEN_ITEMS, growNight, harvest, isRipe, plant, RECIPES, stageOf,
} from '../src/systems/garden-core';

describe('garden', () => {
  it('grows only on watered nights and shows every stage on the way', () => {
    const p = emptyPlot();
    expect(stageOf(p)).toBe(-1);
    plant(p, 'pumpkin', false);
    expect(stageOf(p)).toBe(0);
    growNight(p, false); // never watered: no growth
    expect(p.grown).toBe(0);
    const stages = new Set<number>([stageOf(p)]);
    for (let night = 0; night < 6; night++) {
      p.watered = true;
      growNight(p, false);
      stages.add(stageOf(p));
    }
    expect(isRipe(p)).toBe(true);
    expect([...stages].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it('lets the rain do the watering', () => {
    const p = emptyPlot();
    plant(p, 'peas', true);
    expect(p.watered).toBe(true);
    growNight(p, true);
    growNight(p, true);
    growNight(p, true);
    expect(isRipe(p)).toBe(true);
  });

  it('harvests a yield, and regrowing crops come back sooner', () => {
    const p = emptyPlot();
    plant(p, 'tomato', false);
    p.grown = CROPS.tomato.days;
    expect(harvest(p)).toEqual(['crop-tomato', 3]);
    expect(p.crop).toBe('tomato');
    expect(p.grown).toBe(CROPS.tomato.days - CROPS.tomato.regrow!);
    const q = emptyPlot();
    plant(q, 'sunflower', false);
    q.grown = 5;
    expect(harvest(q)).toEqual(['crop-sunflower', 1]);
    expect(q.crop).toBeNull();
    expect(harvest(q)).toBeNull();
  });

  it('plants in season only, with something for every season', () => {
    for (let s = 0; s < 4; s++) expect(Object.keys(CROPS).some((c) => canPlant(c, s)), `season ${s}`).toBe(true);
    expect(canPlant('pumpkin', 0)).toBe(false);
    expect(canPlant('pumpkin', 2)).toBe(true);
  });

  it('cooks every crop that can be eaten into something, from items that exist', () => {
    const ids = new Set(GARDEN_ITEMS.map((i) => i.id));
    for (const r of RECIPES) {
      expect(ids.has(r.id), r.id).toBe(true);
      for (const [id] of r.needs) expect(ids.has(id), id).toBe(true);
    }
    const bag: Record<string, number> = { 'crop-okra': 1, 'crop-tomato': 1 };
    const has = (id: string, n: number) => (bag[id] ?? 0) >= n;
    expect(canCook(RECIPES.find((r) => r.id === 'dish-gumbo')!, has)).toBe(true);
    expect(canCook(RECIPES.find((r) => r.id === 'dish-salsa')!, has)).toBe(false);
  });
});

describe('strongman bell', () => {
  const s = swingFor(0, () => 0.5);
  it('rings the bell dead centre and barely moves the puck from far away', () => {
    expect(heightFor(s.center, s)).toBe(1);
    expect(tierFor(heightFor(s.center, s))).toBe(TIERS.length - 1);
    expect(heightFor(0, s)).toBeLessThan(0.3);
    expect(tierFor(heightFor(0, s))).toBeLessThan(2);
    expect(heightFor(s.center + s.good, s)).toBeGreaterThan(heightFor(s.center + s.good * 2, s));
  });
  it('widens the sweet spot with strength', () => {
    expect(swingFor(10, () => 0.5).perfect).toBeGreaterThan(s.perfect);
  });
  it('sweeps back and forth', () => {
    expect(sweepAt(0, 1)).toBe(0);
    expect(sweepAt(1, 1)).toBeCloseTo(1);
    expect(sweepAt(1.5, 1)).toBeCloseTo(0.5);
    expect(sweepAt(2.25, 1)).toBeCloseTo(0.25);
  });
});

describe('snippets', () => {
  it('compiles the piano pieces', async () => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.window ??= { addEventListener() {} };
    g.document ??= { addEventListener() {}, hidden: true };
    const { LORE_SONG_IDS } = await import('../src/systems/lore');
    const { getSongDef } = await import('../src/audio/songs');
    for (const id of LORE_SONG_IDS) {
      const c = compileSong(getSongDef(id)!);
      expect(songSeconds(c), id).toBeGreaterThan(3);
    }
  });
});
