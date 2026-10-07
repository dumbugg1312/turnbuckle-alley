import { describe, expect, it } from 'vitest';
import { eraFor, ERAS, floorTitle, GOLDEN_FLOOR, NODES } from '../src/activities/dungeon/eras';
import { blockedGrid, distances, generateFloor, standDistance, T_FLOOR, tileAt, type FloorPlan } from '../src/activities/dungeon/gen';
import { MATERIAL_TABLE, rollNodeLoot, tierFor } from '../src/activities/dungeon/loot';
import { gradeAt, markerAt, timingFor } from '../src/activities/dungeon/timing';

const DAYS = [0, 1, 2, 3, 7, 13, 27, 55, 111, 400];
const SEEDS = [0, 1234, 987654];

function check(plan: FloorPlan): void {
  const tag = `floor ${plan.floor} day ${plan.day} seed ${plan.seed}`;
  const blocked = blockedGrid(plan);
  const dist = distances(plan.w, plan.h, blocked, plan.entry);
  expect(dist[plan.entry.y * plan.w + plan.entry.x], `${tag}: entry walkable`).toBe(0);

  // Every piece of equipment can be stood next to.
  for (const n of plan.nodes) {
    for (let k = 0; k < n.w; k++) expect(tileAt(plan, n.tx + k, n.ty), `${tag}: ${n.id} on floor`).toBe(T_FLOOR);
    expect(standDistance(plan, dist, n.tx, n.ty, n.w), `${tag}: ${n.id} (${n.kind}) reachable`).toBeGreaterThanOrEqual(0);
  }
  // The trapdoor node exists and is reachable (it is one of the nodes above).
  if (plan.floor !== GOLDEN_FLOOR) {
    expect(plan.trapNode, `${tag}: has a trapdoor`).not.toBeNull();
    expect(plan.nodes.some((n) => n.id === plan.trapNode), `${tag}: trapdoor under a node`).toBe(true);
    expect(plan.revealAfter).toBeGreaterThanOrEqual(3);
    expect(plan.revealAfter).toBeLessThanOrEqual(plan.nodes.length);
  }
  // Fallback trapdoor spot is walkable and reachable.
  expect(dist[plan.trapFallback.y * plan.w + plan.trapFallback.x], `${tag}: fallback trapdoor reachable`).toBeGreaterThan(0);
  // Elevator floor in front of the door is reachable.
  if (plan.elevator) {
    for (const dx of [0, 1]) expect(dist[(plan.elevator.y + 1) * plan.w + plan.elevator.x + dx], `${tag}: elevator reachable`).toBeGreaterThanOrEqual(0);
  }
  for (const g of plan.ghosts) expect(dist[g.ty * plan.w + g.tx], `${tag}: ghost spawn reachable`).toBeGreaterThanOrEqual(0);
  if (plan.golden) {
    const p = plan.golden.pedestal;
    expect(standDistance(plan, dist, p.x, p.y, 1), `${tag}: Golden Belt reachable`).toBeGreaterThanOrEqual(0);
  }

  // Breaking any node (in particular the trapdoor node) keeps everything reachable,
  // and the trapdoor tile under it becomes reachable.
  if (plan.trapNode) {
    const open = distances(plan.w, plan.h, blockedGrid(plan, new Set([plan.trapNode])), plan.entry);
    const t = plan.nodes.find((n) => n.id === plan.trapNode)!;
    expect(open[t.ty * plan.w + t.tx], `${tag}: trapdoor tile reachable once revealed`).toBeGreaterThan(0);
  }
  // Every walkable tile is in one connected piece.
  for (let i = 0; i < blocked.length; i++) if (!blocked[i]) expect(dist[i], `${tag}: tile ${i % plan.w},${Math.floor(i / plan.w)} connected`).toBeGreaterThanOrEqual(0);
}

describe('dungeon floor generation', () => {
  it('every floor 1–30 is fully reachable across many days and seeds', () => {
    let floors = 0;
    for (const seed of SEEDS)
      for (const day of DAYS)
        for (let f = 1; f <= 30; f++) {
          check(generateFloor(f, day, seed));
          floors++;
        }
    expect(floors).toBe(SEEDS.length * DAYS.length * 30);
  });

  it('encore floors below the Golden Ring are reachable too', () => {
    for (const day of DAYS.slice(0, 4)) for (let f = 31; f <= 66; f++) check(generateFloor(f, day));
  });

  it('is deterministic per (floor, day) and varies by day', () => {
    const a = generateFloor(7, 12);
    const b = generateFloor(7, 12);
    expect(JSON.stringify({ ...a, tiles: [...a.tiles] })).toBe(JSON.stringify({ ...b, tiles: [...b.tiles] }));
    const c = generateFloor(7, 13);
    expect(JSON.stringify({ ...a, tiles: [...a.tiles] })).not.toBe(JSON.stringify({ ...c, tiles: [...c.tiles] }));
  });

  it('rooms are the right size, with 10–16 pieces of equipment and 1–3 ghosts', () => {
    for (const day of DAYS)
      for (let f = 1; f < 30; f++) {
        const p = generateFloor(f, day);
        expect(p.w).toBeGreaterThanOrEqual(22);
        expect(p.w).toBeLessThanOrEqual(30);
        expect(p.h).toBeGreaterThanOrEqual(14);
        expect(p.h).toBeLessThanOrEqual(18);
        expect(p.nodes.length).toBeGreaterThanOrEqual(10);
        expect(p.nodes.length).toBeLessThanOrEqual(16);
        expect(p.ghosts.length).toBeGreaterThanOrEqual(1);
        expect(p.ghosts.length).toBeLessThanOrEqual(3);
        expect(p.elevator !== null).toBe(f % 5 === 0);
        expect(p.up).toBe(f === 1 ? 'stairs' : 'rope');
        // Era-appropriate equipment only.
        const era = ERAS[p.eraId];
        for (const n of p.nodes) expect(era.nodes[n.kind], `${n.kind} in ${era.id}`).toBeGreaterThan(0);
      }
  });

  it('maps floors to eras', () => {
    expect(eraFor(1).era.id).toBe('carnival');
    expect(eraFor(5).era.id).toBe('carnival');
    expect(eraFor(6).era.id).toBe('territory');
    expect(eraFor(11).era.id).toBe('boxing');
    expect(eraFor(16).era.id).toBe('aerobics');
    expect(eraFor(21).era.id).toBe('garage');
    expect(eraFor(26).era.id).toBe('haunted');
    expect(eraFor(31)).toEqual({ era: ERAS.carnival, encore: 1 });
    expect(floorTitle(30)).toBe('The Golden Ring');
    expect(floorTitle(7)).toBe('The Territory Gym');
    const g = generateFloor(30, 3);
    expect(g.golden).not.toBeNull();
    expect(g.elevator).not.toBeNull();
  });
});

describe('dungeon loot and timing', () => {
  it('rarer materials only show up deeper', () => {
    expect(MATERIAL_TABLE.sequins[0]).toBe(0);
    expect(MATERIAL_TABLE.rhinestone[2]).toBe(0);
    expect(MATERIAL_TABLE['gold-leaf'][3]).toBe(0);
    let s = 7;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const seen = (floor: number) => {
      const ids = new Set<string>();
      for (let i = 0; i < 600; i++) for (const d of rollNodeLoot(floor, 'kettlebell', 0, 0, rand)) if (!d.relic) ids.add(d.id);
      return ids;
    };
    expect(seen(2).has('gold-leaf')).toBe(false);
    expect(seen(2).has('sequins')).toBe(false);
    expect(seen(28).has('gold-leaf')).toBe(true);
    expect(tierFor(1)).toBe(0);
    expect(tierFor(30)).toBe(5);
    expect(tierFor(31)).toBe(6);
  });

  it('every node kind has sane stats', () => {
    for (const [k, d] of Object.entries(NODES)) {
      expect(d.cost, k).toBeGreaterThanOrEqual(2);
      expect(d.cost, k).toBeLessThanOrEqual(4);
      expect([1, 2, 3]).toContain(d.weight);
    }
  });

  it('the timing bar grades taps', () => {
    const tm = timingFor(1, 1, 0, () => 0.5);
    expect(gradeAt(tm.center, tm)).toBe(2);
    expect(gradeAt(tm.center + tm.good * 0.9, tm)).toBe(1);
    expect(gradeAt(tm.center + tm.good + 0.05, tm)).toBe(0);
    expect(markerAt(tm.pass, tm.pass)).toBeCloseTo(1);
    expect(markerAt(tm.pass * 2 + 0.01, tm.pass)).toBe(-1);
    // About a second for the whole there-and-back sweep.
    expect(tm.pass * 2).toBeGreaterThan(0.9);
    expect(tm.pass * 2).toBeLessThan(1.5);
  });
});
