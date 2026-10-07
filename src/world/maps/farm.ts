import { MapBuilder, registerMap } from './index';
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
o('backyard-ring', 20, 20.5, { state: 'overgrown' }, 'backyard-ring');
// Debris to clear (ids so cleared state persists).
const debris: [string, number, number, number?][] = [
  ['weeds', 15, 17], ['weeds', 16, 23, 1], ['weeds', 24.5, 17.2, 2], ['weeds', 26, 22], ['weeds', 13.5, 21, 1], ['weeds', 22, 24.5],
  ['weeds', 18, 25], ['weeds', 28, 18, 2], ['weeds', 10, 19], ['weeds', 30, 20, 1], ['weeds', 8, 25], ['weeds', 33, 25.5, 2],
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
o('fence-h', 30, 12.2, { w: 6 });
o('fence-v', 1.5, 13, { h: 14 });
o('fence-v', 38.5, 17, { h: 10 });
for (const [x, y, v] of [[2, 3, 0], [6, 2.5, 1], [26, 3, 2], [31, 2.5, 0], [35, 3.2, 1], [38, 6, 2], [3, 8, 2], [33, 9, 0]] as const) o('tree', x, y, { variant: v });
for (const x of [3, 9, 15, 21, 27, 33, 38]) o('tree-pine', x, 29.3, { variant: x % 3 });
o('tree-blossom', 36, 11.2);
o('sign', 37.2, 13.6, { text: "→ Town. ← Dupree place. (The sign's been here longer than the road.)" });

export const FARM = registerMap({
  id: 'farm',
  name: "Grandma's Place",
  ...b.build(),
  objects,
  warps: [{ x: W - 1, y: 13, w: 1, h: 4, to: 'town', tx: 1, ty: 31, facing: 'right', label: 'To town' }],
  music: 'town',
  outside: '#2f5a3e',
});
