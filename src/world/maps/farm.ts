import { MapBuilder, registerMap } from './index';
import { contextDecals } from './decals';
import type { ObjectPlacement } from '../types';

/** Grandma's place: the old blue house, the overgrown backyard ring, the yard to clear. */
const W = 40;
const H = 30;
const b = new MapBuilder(W, H, 'grass');
b.rect(0, 0, W, 2, 'grass-dark');
b.rect(0, H - 2, W, 2, 'grass-dark');
// Gravel drive and the path to the road east
b.rect(8, 10, 5, 2, 'gravel');
b.rect(11, 12, 2, 3, 'dirt');
b.rect(11, 14, 29, 2, 'dirt');
b.rect(36, 13, 4, 4, 'gravel');
// Yard patches
b.blob(20, 19, 9, 6, 'grass-dark', 4);
b.blob(6, 22, 4, 3, 'flowers', 11);
b.blob(31, 23, 3, 2, 'dirt-dark', 2);
b.rect(4, 13, 5, 3, 'tilled');

const objects: ObjectPlacement[] = [];
const o = (kind: string, x: number, y: number, props?: Record<string, unknown>, id?: string) => objects.push({ kind, x, y, props, id });

o('b-grandma', 12, 10, {}, 'grandma-house');
o('b-shed', 21, 8.5, {}, 'farm-shed');
o('mailbox-home', 15.2, 11.4, {}, 'home-mailbox');
o('clothesline', 28, 9, {}, 'clothesline');
o('garden-bed', 6.5, 14.4, {}, 'garden-1');
// Grandma's garden: five plots along the bottom of the tilled patch (systems/garden.ts).
for (let i = 0; i < 5; i++) o('crop-plot', 4.5 + i, 15.95, {}, `plot-${i}`);
o('backyard-ring', 20, 20.5, { state: 'overgrown' }, 'backyard-ring');
// Debris to clear (ids so cleared state persists).
const debris: [string, number, number, number?][] = [
  ['weeds', 14.6, 16.8], ['weeds', 17.4, 25.2, 1], ['weeds', 15.7, 17.6, 2], ['weeds', 25.6, 22.3], ['weeds', 13.4, 20.6, 1], ['weeds', 26.7, 23.2],
  ['weeds', 18.6, 24.5], ['weeds', 28.3, 18.1, 2], ['weeds', 10.4, 18.7], ['weeds', 29.4, 20.5, 1], ['weeds', 8.2, 25.2], ['weeds', 33.4, 25.9, 2],
  ['junk', 27.5, 25], ['junk', 9.5, 17.5], ['stone', 14, 25], ['stone', 25, 26], ['stone', 31.5, 16.8], ['stone', 6, 18],
  ['stump', 34, 21], ['stump', 4, 24], ['old-tire', 24, 15.4], ['old-tire', 17.5, 15.6], ['old-tire', 29.5, 26.5],
];
debris.forEach(([k, x, y, v], i) => o(k, x, y, { variant: v ?? 0, debris: true }, `debris-${i}`));
o('chair', 26.2, 16, {}, 'chair-farm');
// Training equipment Hank can build (hidden until built; see systems/farm.ts).
o('heavy-bag', 28, 18.5, {}, 'eq-heavybag');
o('tire-stack', 30.5, 21.5, {}, 'eq-tires');
o('weight-bench', 11.5, 17.6, {}, 'eq-bench');
o('trampoline', 12.5, 24.6, {}, 'eq-trampoline');
o('speed-bag', 27, 14.6, {}, 'eq-speedbag');
o('merch-press', 24.5, 11.2, {}, 'eq-press');
// Fences and trees
o('fence-h', 2, 12.2, { w: 6 });
o('fence-worn', 30.125, 12.45, { w: 6, gap: 9, solid: { x: -50, y: -9, w: 96, h: 5 }, text: 'One picket gave up and is lying in the grass. The end post leans toward town like it has somewhere to be.' });
o('fence-v', 1.5, 13, { h: 14 });
o('fence-v', 38.5, 17, { h: 10 });
for (const [x, y, v] of [[2, 3, 0], [6, 2.5, 1], [26, 3, 2], [31, 2.5, 0], [35, 3.2, 1], [38, 6, 2], [3, 8, 2], [33, 9, 0]] as const) o('tree', x, y, { variant: v });
for (const [x, y] of [[2.6, 29.3], [9.4, 29.0], [14.7, 29.4], [21.5, 29.1], [26.6, 29.3], [33.3, 29.15], [38.2, 29.4]]) o('tree-pine', x, y, { variant: Math.round(x) % 3 });
// Yard life: a dented bucket by the garden, the hose coiled wrong by the porch, puddles the day after rain.
o('bucket', 8.4, 12.9, { text: "A dented tin bucket. Masking tape on the side says CHICKENS in Grandma's writing. There are no chickens." });
o('hose', 16.2, 10.6, { text: 'The hose is coiled the wrong way, and every loop is fighting the one next to it.' });
o('puddle', 31.6, 15.2, { variant: 1, text: 'A puddle in the wheel rut. It has a tadpole-shaped twig in it.' });
o('puddle', 37.4, 15.7, { variant: 2, text: 'A puddle at the end of the drive. Your boots will remember it.' });
o('tree-blossom', 36, 11.2);
o('sign', 37.2, 13.6, { text: "→ Town. ← Dupree place. (The sign's been here longer than the road.)" });

// Ground decals: the yard wears where people walk, tufts gather at the fences, moss on the stumps.
objects.push(
  ...contextDecals(objects, {
    at: (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 'void' : b.get(x, y)),
    w: W,
    h: H,
    doors: [{ x: 10, y: 10 }, { x: 21, y: 8 }],
    seed: 3,
  }),
);

export const FARM = registerMap({
  id: 'farm',
  name: "Grandma's Place",
  ...b.build(),
  objects,
  warps: [{ x: W - 1, y: 13, w: 1, h: 4, to: 'town', tx: 1, ty: 31, facing: 'right', label: 'To town' }],
  music: 'town',
  outside: '#2f5a3e',
});
