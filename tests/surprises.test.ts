import { describe, expect, it } from 'vitest';
import { eligible, REPEAT_GAP, rollSurprise, SURPRISE_IDS, type SurpriseCtx, type SurpriseId, type SurpriseRecord } from '../src/systems/surprise-pick';

const ctx = (abs: number, seed: number, over: Partial<SurpriseCtx> = {}): SurpriseCtx => ({
  abs,
  season: Math.floor((abs % 112) / 28),
  weekday: abs % 7,
  weather: ['sun', 'sun', 'rain', 'wind', 'sun'][abs % 5],
  hearts: () => 2,
  flags: { met_pip: true, debuted: abs >= 7 },
  drawings: 0,
  seed,
  ...over,
});

/** Play a year of mornings and keep the history the way surprises.ts does. */
function year(seed: number): SurpriseRecord[] {
  const history: SurpriseRecord[] = [];
  let drawings = 0;
  for (let abs = 0; abs < 112; abs++) {
    const id = rollSurprise(ctx(abs, seed, { drawings }), history);
    if (id) {
      history.push({ id, day: abs });
      if (id === 'pip-drawing') drawings++;
    }
  }
  return history;
}

describe('morning surprises', () => {
  it('has at least fifteen kinds', () => {
    expect(SURPRISE_IDS.length).toBeGreaterThanOrEqual(15);
  });

  it('is seeded: the same save gets the same mornings', () => {
    expect(year(1234)).toEqual(year(1234));
    expect(year(1234)).not.toEqual(year(98765));
  });

  it('happens on roughly three mornings in ten', () => {
    let hits = 0;
    let days = 0;
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      hits += year(seed).length;
      days += 110;
    }
    const rate = hits / days;
    expect(rate).toBeGreaterThan(0.22);
    expect(rate).toBeLessThan(0.38);
  });

  it('never repeats the same surprise within a week', () => {
    for (const seed of [11, 22, 33, 44, 55, 66, 77, 88, 99, 1010]) {
      const last = new Map<SurpriseId, number>();
      for (const h of year(seed)) {
        const prev = last.get(h.id);
        if (prev !== undefined) expect(h.day - prev).toBeGreaterThanOrEqual(REPEAT_GAP);
        last.set(h.id, h.day);
      }
    }
  });

  it('keeps the first two mornings quiet', () => {
    for (let seed = 0; seed < 50; seed++) {
      expect(rollSurprise(ctx(0, seed), [])).toBeNull();
      expect(rollSurprise(ctx(1, seed), [])).toBeNull();
    }
  });

  it('respects season, weather and story gates', () => {
    expect(eligible(ctx(90, 5, { season: 3 }), [])).not.toContain('wildflowers');
    expect(eligible(ctx(30, 5, { weather: 'rain' }), [])).not.toContain('lost-flyer');
    const early = ctx(3, 5, { flags: { met_pip: true } });
    for (const id of ['plumb-visit', 'june-thermos', 'tamales', 'honey-jar', 'agnes-bulletin'] as SurpriseId[]) expect(eligible(early, [])).not.toContain(id);
    expect(eligible(ctx(30, 5, { drawings: 8 }), [])).not.toContain('pip-drawing');
  });

  it('a surprise seen within the week is not eligible, and is again after it', () => {
    const c = ctx(20, 5);
    expect(eligible(c, [{ id: 'stray-chair', day: 14 }])).not.toContain('stray-chair');
    expect(eligible(c, [{ id: 'stray-chair', day: 13 }])).toContain('stray-chair');
  });

  it('uses a variety of surprises over a year', () => {
    const kinds = new Set<string>();
    for (const seed of [3, 4, 5]) for (const h of year(seed)) kinds.add(h.id);
    expect(kinds.size).toBeGreaterThanOrEqual(10);
  });
});
