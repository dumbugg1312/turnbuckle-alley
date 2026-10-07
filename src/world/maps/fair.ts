import { MapBuilder, registerMap } from './index';
import type { ObjectPlacement } from '../types';

/** The fairgrounds east of town: Ferris wheel, Wanda's pen, the strongman bell, the outdoor stage. */
const W = 44;
const H = 32;
const b = new MapBuilder(W, H, 'grass');
b.rect(0, 17, 10, 3, 'road');
b.rect(10, 8, 30, 20, 'gravel');
b.blob(25, 18, 10, 7, 'dirt', 7);
b.blob(36, 25, 3, 2, 'mud', 3);
b.rect(0, 0, W, 2, 'grass-dark');
b.rect(0, H - 2, W, 2, 'grass-dark');

const objects: ObjectPlacement[] = [];
const o = (kind: string, x: number, y: number, props?: Record<string, unknown>, id?: string) => objects.push({ kind, x, y, props, id });
o('ferris-wheel', 31, 13, {}, 'ferris');
o('tent', 16, 13, { color: 'purple' }, 'tent-fortune');
o('tent', 22, 12.5, { color: 'red' }, 'tent-games');
o('bear-pen', 15, 24, {}, 'bear-pen');
o('strongman', 39, 21, {}, 'strongman');
o('fair-stage', 26, 27.5, {}, 'fair-stage');
o('food-stand', 11.5, 13, { variant: 0 }, 'stand-corndog');
o('food-stand', 20.5, 20.5, { variant: 1 }, 'stand-lemonade');
o('food-stand', 35, 9.5, { variant: 2 }, 'stand-funnel');
o('bench', 20, 24.5);
o('bench', 32, 24.5);
o('lamp', 12, 18);
o('lamp', 28, 9);
o('lamp', 38, 15);
o('trashcan', 24, 22.2);
o('chair', 37.5, 26.4, {}, 'chair-fair');
o('sign', 9, 16.4, { text: 'TURNBUCKLE ALLEY FAIRGROUNDS. Home of the Fairgrounds Fury, every summer.' });
for (const x of [2, 7, 13, 19, 25, 31, 37, 42]) o('tree-pine', x, 2.6, { variant: x % 3 });
for (const x of [3, 9, 33, 41]) o('tree', x, 30.5, { variant: x % 3 });

export const FAIR = registerMap({
  id: 'fair',
  name: 'Fairgrounds',
  ...b.build(),
  objects,
  warps: [{ x: 0, y: 17, w: 1, h: 3, to: 'town', tx: 62, ty: 26, facing: 'left', label: 'To town' }],
  music: 'fair',
  outside: '#2f5a3e',
});
