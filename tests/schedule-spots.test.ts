import { describe, expect, it } from 'vitest';
import { NPCS, type DayCtx } from '../src/data/npcs';
import '../src/gfx/world';
import { GameMap } from '../src/world/map';
import { MAPS } from '../src/world/maps/index';
import '../src/world/maps/town';
import '../src/world/maps/farm';
import '../src/world/maps/fair';
import '../src/world/maps/interiors';
import { linkMaps } from '../src/world/maps/links';

linkMaps();

// Wanda lives inside her fenced bear pen at the fair (see 'bear-pen' in gfx/world/buildings.ts).
const INTENDED = new Set(['wanda fair 15,22']);

describe('NPC schedule spots', () => {
  it('every scheduled spot is a tile the pathfinder can stand on (objects included)', () => {
    const maps = new Map([...MAPS.values()].map((d) => [d.id, new GameMap(d)]));
    const bad = new Set<string>();
    const flagSets: DayCtx['flags'][] = [{}, { grandma_in_town: true, grandma_attends: true, arlo_in_town: true }, { prologue: true }];
    for (const n of NPCS)
      for (let weekday = 0; weekday < 7; weekday++)
        for (const season of [0, 1, 2, 3])
          for (const weather of ['sun', 'rain', 'storm', 'wind', 'snow'] as const)
            for (const flags of flagSets) {
              const show = weekday === 2 ? 'wed' : weekday === 5 ? 'sat' : null;
              const c: DayCtx = { weekday, day: weekday + 22, season, weather, show, supershow: weekday === 5, flags };
              if (n.appearsWhen && !n.appearsWhen(c)) continue;
              for (const e of n.schedule(c)) {
                const key = `${n.id} ${e.map} ${e.x},${e.y}`;
                const m = maps.get(e.map);
                if (!m) {
                  bad.add(`${key} (no such map)`);
                  continue;
                }
                const tx = Math.floor(e.x);
                const ty = Math.floor(e.y);
                if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h || m.blocked[ty * m.w + tx]) if (!INTENDED.has(key)) bad.add(key);
              }
            }
    expect([...bad]).toEqual([]);
  });
});
