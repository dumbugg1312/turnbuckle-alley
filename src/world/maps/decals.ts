import type { ObjectPlacement } from '../types';

/**
 * Context for the ground decals (gfx/world/decals.ts): looks at what is
 * placed on a map and drops worn grass at doors, tufts and clover along
 * fences and hedges, moss on the north side of rocks and trunks, leaf litter
 * under trees, and cracks off the curbs, gathered into clumps by a slow
 * seeded field so there are calm stretches between them. Deterministic:
 * the same map always gets the same decals.
 */

/** Small seeded hash in 0..1. */
function hsh(x: number, y: number, s: number): number {
  let h = (Math.imul(Math.floor(x * 16) | 0, 0x27d4eb2d) + Math.imul(Math.floor(y * 16) | 0, 0x165667b1) + Math.imul(s | 0, 0x9e3779b9)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** Slow clumping field over tiles (0..1). */
function field(x: number, y: number, s: number): number {
  const xi = Math.floor(x / 7);
  const yi = Math.floor(y / 6);
  const u = x / 7 - xi;
  const v = y / 6 - yi;
  const a = hsh(xi, yi, s);
  const b = hsh(xi + 1, yi, s);
  const c = hsh(xi, yi + 1, s);
  const d = hsh(xi + 1, yi + 1, s);
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}

export interface DecalCtx {
  /** Terrain id at a tile. */
  at: (x: number, y: number) => string;
  w: number;
  h: number;
  /** Door zones (tile coords): where you stand to go in. */
  doors: { x: number; y: number }[];
  seed: number;
}
const grassy = (t: string) => t === 'grass' || t === 'grass-dark' || t === 'flowers';
const asphalt = (t: string) => t === 'road' || t === 'road-line' || t === 'parking';

export function contextDecals(objects: ObjectPlacement[], c: DecalCtx): ObjectPlacement[] {
  const out: ObjectPlacement[] = [];
  let n = 0;
  // tufts stand up and sort with the objects (so a fence can't paint over them); the rest lie flat
  const add = (k: string, x: number, y: number, props: Record<string, unknown> = {}) => out.push({ kind: k === 'tufts' ? 'decal-up' : 'decal', x, y, props: { k, s: c.seed * 131 + n++, ...props } });
  const tileAt = (x: number, y: number) => c.at(Math.floor(x), Math.floor(y));

  // 1. doors: feet wear the ground in front of every door
  for (const d of c.doors) {
    const t = c.at(d.x, d.y);
    const below = c.at(d.x, d.y + 1);
    if (t === 'sidewalk') add('scuff', d.x + 0.5, d.y + 0.55, { w: 18 + Math.floor(hsh(d.x, d.y, 1) * 6), h: 7 });
    else if (grassy(t)) {
      add('worn', d.x + 0.5, d.y + 0.65, { w: 22 + Math.floor(hsh(d.x, d.y, 2) * 8), h: 10 });
      // the desire line keeps going a little way
      if (grassy(below)) add('worn', d.x + 0.4 + (hsh(d.x, d.y, 3) - 0.5) * 0.6, d.y + 1.6, { w: 14, h: 7 });
    }
  }

  for (const o of objects) {
    const p = o.props ?? {};
    // 2. fences and hedges: tufts and clover gather along the foot
    if (o.kind === 'fence-h' || o.kind === 'hedge' || o.kind === 'fence-worn') {
      const w = Number(p.w ?? 3);
      if (!grassy(tileAt(o.x, o.y + 0.2))) continue;
      // in pieces, not one long strip
      for (let x0 = o.x - w / 2; x0 < o.x + w / 2; ) {
        const seg = 1 + Math.floor(hsh(x0, o.y, 5) * 2.5);
        const x1 = Math.min(o.x + w / 2, x0 + seg);
        if (hsh(x0, o.y, 6) < 0.88 && grassy(tileAt((x0 + x1) / 2, o.y + 0.2))) add('tufts', (x0 + x1) / 2, o.y + 0.12, { w: Math.round((x1 - x0) * 16) + 4, h: 9 });
        if (hsh(x0, o.y, 7) < 0.45) add('clover', x0 + hsh(x0, o.y, 8) * seg, o.y + 0.55);
        x0 = x1 + 0.5 + hsh(x0, o.y, 9) * 1.5;
      }
    }
    if (o.kind === 'fence-v') {
      const hh = Number(p.h ?? 3);
      for (let y = o.y - hh + 0.5; y < o.y; y += 1.5 + hsh(o.x, y, 10) * 2) if (grassy(tileAt(o.x, y)) && hsh(o.x, y, 11) < 0.55) add('tufts', o.x + 0.2, y, { w: 10, h: 9 });
    }
    // 3. trees: leaf litter (fall), moss and a few tall tufts at the trunk
    if (o.kind === 'tree' || o.kind === 'tree-blossom') {
      if (!grassy(tileAt(o.x, o.y))) continue;
      add('leaves', o.x + 0.15, o.y + 0.05, { w: 40, h: 18 });
      if (hsh(o.x, o.y, 12) < 0.6) add('moss', o.x - 0.05, o.y - 0.3);
      if (hsh(o.x, o.y, 13) < 0.7) add('tufts', o.x + (hsh(o.x, o.y, 14) < 0.5 ? -0.55 : 0.6), o.y + 0.06, { w: 12, h: 9 });
    }
    if (o.kind === 'tree-pine' && grassy(tileAt(o.x, o.y)) && hsh(o.x, o.y, 15) < 0.4) add('moss', o.x, o.y - 0.25);
    // 4. rocks, logs, stumps, stones: moss on the north side
    if (['rock', 'log', 'stump', 'stone'].includes(o.kind) && grassy(tileAt(o.x, o.y))) {
      add('moss', o.x - 0.1, o.y - 0.55, { w: 10, h: 4 });
      if (hsh(o.x, o.y, 16) < 0.6) add('tufts', o.x + 0.55, o.y + 0.04, { w: 10, h: 9 });
    }
  }

  // 5. curbs: cracks spider off them in the older stretches; oil where cars stand
  for (let y = 1; y < c.h - 1; y++)
    for (let x = 0; x < c.w; x++) {
      const t = c.at(x, y);
      if (!asphalt(t)) continue;
      const up = c.at(x, y - 1);
      const dn = c.at(x, y + 1);
      const old = field(x, y, c.seed + 20);
      if (up === 'sidewalk' && hsh(x, y, 21) < 0.04 + old * old * 0.3) add('crackv', x + 0.2 + hsh(x, y, 22) * 0.6, y + 0.5 + hsh(x, y, 23) * 0.2, { h: 12 + Math.floor(hsh(x, y, 24) * 10) });
      if (dn === 'sidewalk' && hsh(x, y, 25) < 0.02 + old * old * 0.22) add('crack', x + 0.5, y + 0.6, { w: 14 + Math.floor(hsh(x, y, 26) * 10) });
      if (t === 'parking' && hsh(x, y, 27) < 0.22) add('oil', x + 0.5, y + 0.45 + hsh(x, y, 28) * 0.3, { w: 10 + Math.floor(hsh(x, y, 29) * 6) });
    }

  // 6. worn patches where paths open onto lawn, gathered in clumps
  for (let y = 1; y < c.h - 1; y++)
    for (let x = 1; x < c.w - 1; x++) {
      const t = c.at(x, y);
      if (t !== 'path' && t !== 'dirt') continue;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
        if (!grassy(c.at(x + dx, y + dy))) continue;
        if (hsh(x * 3 + dx, y * 3 + dy, 30) > field(x, y, c.seed + 31) * 0.12) continue;
        add('worn', x + 0.5 + dx * 0.75, y + 0.5 + dy * 0.7, { w: 12 + Math.floor(hsh(x, y, 32) * 8), h: 6 + Math.floor(hsh(x, y, 33) * 3) });
      }
    }
  return out;
}
