import { describe, expect, it } from 'vitest';
import { MAPS } from '../src/world/maps/index';
import '../src/world/maps/town';
import '../src/world/maps/farm';
import '../src/world/maps/fair';
import '../src/world/maps/interiors';
import { linkMaps } from '../src/world/maps/links';
import { NPCS, type DayCtx } from '../src/data/npcs';
import type { MapDef } from '../src/world/types';

linkMaps();

const SOLID = new Set(['water', 'shallow', 'deep-water', 'void', 'wall', 'wall-wood', 'wall-brick', 'wall-dungeon', 'wall-panel', 'wall-pink', 'wall-blue']);

function terrainAt(def: MapDef, x: number, y: number): string {
  const row = def.ground[y];
  if (!row || x < 0 || x >= row.length) return 'void';
  return def.legend[row[x]] ?? 'void';
}

describe('maps', () => {
  it('every warp points at a real map and a walkable tile', () => {
    const problems: string[] = [];
    for (const def of MAPS.values()) {
      for (const w of def.warps) {
        const to = MAPS.get(w.to);
        if (!to) {
          problems.push(`${def.id} → missing map ${w.to}`);
          continue;
        }
        const t = terrainAt(to, w.tx, w.ty);
        if (SOLID.has(t)) problems.push(`${def.id} → ${w.to} lands on ${t} at ${w.tx},${w.ty}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('every interior has a way out', () => {
    for (const def of MAPS.values()) {
      if (!def.indoor) continue;
      if (def.id === 'maxx-office' || def.id === 'apartment') continue; // prologue rooms are scripted
      expect(def.warps.length, `${def.id} has no exits`).toBeGreaterThan(0);
    }
  });

  it('NPC schedule spots are on real maps and walkable terrain', () => {
    const problems: string[] = [];
    const ctxs: DayCtx[] = [];
    for (let wd = 0; wd < 7; wd++)
      for (const weather of ['sun', 'rain'] as const)
        ctxs.push({ weekday: wd, day: wd + 1, season: 0, weather, show: wd === 2 ? 'wed' : wd === 5 ? 'sat' : null, supershow: false, flags: { grandma_in_town: true, grandma_attends: true, prologue: false } });
    for (const n of NPCS) {
      for (const c of ctxs) {
        for (const e of n.schedule(c)) {
          const def = MAPS.get(e.map);
          if (!def) {
            problems.push(`${n.id}: unknown map ${e.map}`);
            continue;
          }
          const t = terrainAt(def, e.x, e.y);
          if (SOLID.has(t)) problems.push(`${n.id}: ${e.map} ${e.x},${e.y} is ${t}`);
        }
      }
    }
    expect([...new Set(problems)]).toEqual([]);
  });
});
