/**
 * What goes past the window, and when. Every object is placed in its layer's
 * space by the moment it should cross the middle of the window, so the
 * narration in route.ts lines up with what is actually on screen.
 */
import { lh, lw, rng } from '../../gfx/kit';
import { billboard, cityGround, farCity, overpass, streetLamp, tower, walkup } from './city';
import { bale, barn, cow, farmFence, ground, guardrail, highwaySign, house, lawn, mailbox, pine, pole, ridge, silo, sportatoriumRoof, suburbFar, tree, waterTower, welcomeSign, windmillTower, windmillWheel } from './country';
import { dist, RATE, SPEED, STOP_T, type Layer } from './route';
import { cumulus, rainDeck, streak } from './sky';

export type Kind = 'lamp' | 'pole' | 'overpass' | 'windmill' | 'watcher' | 'occluder' | 'tower';
export interface Obj {
  L: Layer;
  /** Layer-space x of the anchor (bottom centre). Screen x = ww/2 + lx - scroll. */
  lx: number;
  /** Offset from the layer's baseline (positive is lower, i.e. nearer). */
  dy: number;
  c: HTMLCanvasElement;
  kind?: Kind;
  /** Alternate canvas after time altAt (the cow that looks up). */
  alt?: HTMLCanvasElement;
  altAt?: number;
  /** Cloud fade window. */
  fade?: [number, number, number, number];
  /** Extra drift speed (px/s) for clouds. */
  drift?: number;
  /** What it is (for caption timing checks). */
  tag?: string;
}
export interface Band {
  L: Layer;
  lx0: number;
  lx1: number;
  tile: HTMLCanvasElement;
  /** Top of the band relative to the layer's ground top. */
  dy: number;
  /** Colour to fill below the tile (near layer on tall windows). */
  fill?: string;
}
export interface Journey {
  objs: Obj[];
  bands: Band[];
  wheels: HTMLCanvasElement[];
  ridges: { morning: HTMLCanvasElement; noon: HTMLCanvasElement; golden: HTMLCanvasElement; sunset: HTMLCanvasElement; city: HTMLCanvasElement };
  rain: HTMLCanvasElement;
  overpassTc: number;
}

/** Layer-space x for something crossing the window centre at time tc (+dx px). */
export const at = (L: Layer, tc: number, dx = 0): number => dist(tc) * SPEED * RATE[L] + dx;

export const OVERPASS_T = 11.0;
const T_SUB = 11.6;
const T_HW = 20.6;
const T_FARM = 26.6;
const T_TOWN = 38.6;

export function buildJourney(nearH: number, deckTop: number, nearBase: number): Journey {
  const objs: Obj[] = [];
  const bands: Band[] = [];
  const add = (L: Layer, lx: number, c: HTMLCanvasElement, dy = 0, kind?: Kind): Obj => {
    const o: Obj = { L, lx, dy, c, kind };
    objs.push(o);
    return o;
  };
  const r = rng(2026);

  // ---------------------------------------------------------------- city
  // mid-far towers, the MaxxMedia tower among them
  {
    let x = at('midfar', -16);
    const end = at('midfar', 12.2);
    let i = 0;
    while (x < end) {
      const w = 20 + Math.floor(r() * 18);
      const maxx = i === 9;
      const h = maxx ? 112 : 46 + Math.floor(r() * 56);
      const kind = maxx ? 'maxx' : r() < 0.4 ? 'stone' : 'glass';
      add('midfar', x + w / 2, tower(w, h, 40 + i, kind), Math.floor(r() * 2), 'tower');
      x += w + 1 + Math.floor(r() * 4);
      i++;
    }
  }
  // mid walk-ups in a row with the billboard standing over them
  {
    let x = at('mid', -14);
    const end = at('mid', T_SUB - 0.4);
    let v = 0;
    while (x < end) {
      add('mid', x + 25, walkup(v++));
      x += 50;
    }
    add('mid', at('mid', 7.5), billboard(), 2).tag = 'billboard';
  }
  // near street lamps
  for (let x = at('near', -6); x < at('near', OVERPASS_T - 0.8); x += 150) add('near', x, streetLamp(), 0, 'lamp');
  // the overpass (its second pier hides the city/suburb seam on the near band)
  add('near', at('near', OVERPASS_T), overpass(deckTop, nearBase), 0, 'overpass').tag = 'overpass';
  const nearSeam = at('near', OVERPASS_T, 91);

  // ---------------------------------------------------------------- suburbs
  {
    let x = at('mid', T_SUB);
    const end = at('mid', T_HW - 0.2);
    let v = 0;
    while (x < end) {
      const hs = house(v);
      add('mid', x + lw(hs) / 2, hs).tag = 'house';
      add('mid', x + lw(hs) / 2 + 2, lawn(v), 4);
      if (v % 2 === 1) add('mid', x + lw(hs) - 2, mailbox(v), 3);
      x += lw(hs) + 4;
      if (r() < 0.55) {
        add('mid', x + 6, tree(9 + Math.floor(r() * 4), 'morning', v), 2, 'occluder');
        x += 14;
      }
      v++;
    }
  }
  for (let x = at('near', T_SUB + 0.5); x < at('near', T_HW); x += 260 + r() * 200) add('near', x, tree(15 + Math.floor(r() * 5), 'morning', 90 + Math.floor(x)), 4, 'occluder');

  // ---------------------------------------------------------------- highway
  add('midfar', at('midfar', 23.1), highwaySign(), 2).tag = 'sign';
  for (let x = at('midfar', T_HW - 1); x < at('midfar', T_FARM); x += 18 + r() * 30) {
    if (Math.abs(x - at('midfar', 23.1)) < 60) continue;
    add('midfar', x, r() < 0.5 ? pine(14 + Math.floor(r() * 8), 'noon', Math.floor(x)) : tree(5 + Math.floor(r() * 3), 'noon', Math.floor(x)), -1);
  }
  for (let x = at('mid', T_HW + 0.8); x < at('mid', T_FARM); x += 70 + r() * 80) add('mid', x, tree(10 + Math.floor(r() * 5), 'noon', Math.floor(x)), 1, 'occluder');

  // power poles from the highway through the farms (wires are drawn live)
  {
    const p1 = pole('noon');
    const p2 = pole('golden');
    const p3 = pole('sunset');
    for (let x = at('mid', T_HW + 0.3); x < at('mid', T_TOWN + 1.5); x += 84) {
      const t = x < at('mid', T_FARM) ? p1 : x < at('mid', T_TOWN - 2) ? p2 : p3;
      add('mid', x, t, -2, 'pole');
    }
  }

  // ---------------------------------------------------------------- farmland
  add('midfar', at('midfar', 27.5, -30), silo('blue', 50), 0);
  add('midfar', at('midfar', 27.5, -14), silo('stave', 42), 0);
  for (let x = at('midfar', T_FARM); x < at('midfar', T_TOWN); x += 40 + r() * 50) add('midfar', x, tree(5 + Math.floor(r() * 3), 'golden', Math.floor(x)), -1);
  // a far herd for depth
  for (let i = 0; i < 6; i++) add('midfar', at('midfar', 28.5, i * 9 - 20), cow(i % 3 === 1 ? 1 : 0, 'graze', 20 + i), 1);
  // the herd, close enough to count. One of them looks up.
  {
    const herd: [number, number, 'graze' | 'lie', number][] = [
      [26.4, 0, 'graze', 0],
      [26.9, 1, 'graze', 1],
      [27.4, 0, 'lie', 2],
      [27.9, 2, 'graze', 3],
      [28.4, 0, 'graze', 4],
      [29.0, 1, 'graze', 5],
      [30.0, 0, 'graze', 6],
      [30.5, 2, 'graze', 7],
      [31.1, 0, 'lie', 8],
      [31.6, 1, 'graze', 9],
      [32.3, 0, 'graze', 10],
    ];
    herd.forEach(([tc, k, pose, v], i) => (add('mid', at('mid', tc), cow(k, pose, v), (i % 3) - 1).tag = 'cow'));
    const w = add('mid', at('mid', 29.5), cow(0, 'graze', 11), 1, 'watcher');
    w.tag = 'cow';
    w.alt = cow(0, 'look', 11);
    w.altAt = 28.1;
  }
  for (let x = at('mid', 30); x < at('mid', 38); x += 60 + r() * 70) add('mid', x, bale(Math.floor(x)), -1);
  add('mid', at('mid', 33.2), barn(), -1, 'occluder');
  add('mid', at('mid', 34.4), windmillTower(), -2, 'windmill').tag = 'windmill';
  for (const tc of [36.2, 37.3]) add('mid', at('mid', tc), tree(13, 'golden', Math.floor(tc * 10)), 1, 'occluder');
  for (let x = at('near', T_FARM + 1); x < at('near', T_TOWN); x += 300 + r() * 260) add('near', x, tree(16, 'golden', Math.floor(x)), 4, 'occluder');

  // ---------------------------------------------------------------- the town
  add('midfar', at('midfar', 40.3), waterTower(), 0).tag = 'watertower';
  add('midfar', at('midfar', STOP_T, 112), sportatoriumRoof(), 0);
  for (const dx of [-150, -120, 60, 160, 190]) add('midfar', at('midfar', STOP_T, dx), tree(6 + (dx & 3), 'sunset', dx + 400), -1);
  for (const tc of [39.4, 40.6, 41.8]) add('mid', at('mid', tc), tree(12 + Math.floor(tc) % 3, 'sunset', Math.floor(tc * 10)), 1, 'occluder');
  add('mid', at('mid', STOP_T, -150), tree(14, 'sunset', 7), 1);
  add('mid', at('mid', STOP_T, 170), tree(12, 'sunset', 8), 1);
  add('near', at('near', STOP_T), welcomeSign(), 0, 'occluder').tag = 'welcome';

  // ---------------------------------------------------------------- clouds
  {
    const c = (tc: number, dx: number, cv: HTMLCanvasElement, dy: number, fade: [number, number, number, number], drift: number) => {
      const o = add('cloud', at('cloud', tc, dx), cv, dy);
      o.fade = fade;
      o.drift = drift;
    };
    const morn: [number, number, number, number] = [10.5, 14, 25, 28.5];
    c(12, -120, cumulus(0), 12, morn, 2);
    c(12, 70, cumulus(1), 24, morn, 3);
    c(12, 220, cumulus(2), 6, morn, 2.5);
    c(18, 0, cumulus(1), 18, morn, 3);
    c(20, 160, cumulus(0), 30, morn, 2);
    const gold: [number, number, number, number] = [24, 28.5, 60, 61];
    c(30, -160, streak(0, 'golden'), 14, gold, 1.5);
    c(30, 30, streak(1, 'golden'), 30, gold, 1.2);
    c(30, 200, streak(2, 'golden'), 8, gold, 1.8);
    const dusk: [number, number, number, number] = [34, 39, 60, 61];
    c(40, -60, streak(2, 'sunset'), 20, dusk, 1);
    c(40, 140, streak(0, 'sunset'), 40, dusk, 1.4);
  }

  // ---------------------------------------------------------------- ground bands
  const seg = (L: Layer, a: number, b: number, tile: HTMLCanvasElement, dy = 0, fill?: string) => bands.push({ L, lx0: a, lx1: b, tile, dy, fill });
  const FAR_H = 12;
  const MID_H = 26;
  const NEAR = -1e7;
  const END = 1e7;
  const mfSeam1 = at('midfar', 12.2);
  const mfSeam2 = at('midfar', T_HW + 1);
  const mfSeam3 = at('midfar', T_FARM + 0.5);
  seg('midfar', NEAR, mfSeam1, cityGround('far', FAR_H));
  seg('midfar', mfSeam1, mfSeam2, suburbFar(), FAR_H - lh(suburbFar()));
  seg('midfar', mfSeam2, mfSeam3, ground('hw', 'far', FAR_H));
  seg('midfar', mfSeam3, END, ground('farm', 'far', FAR_H));
  const mSeam1 = at('mid', T_SUB - 0.2);
  const mSeam2 = at('mid', T_HW);
  const mSeam3 = at('mid', T_FARM - 0.3);
  const mSeam4 = at('mid', T_TOWN);
  seg('mid', NEAR, mSeam1, cityGround('mid', MID_H));
  seg('mid', mSeam1, mSeam2, ground('sub', 'mid', MID_H));
  seg('mid', mSeam2, mSeam3, ground('hw', 'mid', MID_H));
  seg('mid', mSeam3, mSeam4, ground('farm', 'mid', MID_H));
  seg('mid', mSeam4, END, ground('town', 'mid', MID_H));
  // hide the mid seams behind a tree
  for (const [x, l] of [[mSeam1, 'morning'], [mSeam2, 'noon'], [mSeam3, 'golden'], [mSeam4, 'sunset']] as [number, 'morning' | 'noon' | 'golden' | 'sunset'][]) add('mid', x, tree(12, l, Math.floor(x)), 3, 'occluder');
  for (const [x, l] of [[mfSeam1, 'morning'], [mfSeam2, 'noon'], [mfSeam3, 'golden']] as [number, 'morning' | 'noon' | 'golden'][]) add('midfar', x, tree(7, l, Math.floor(x) + 1), 1);
  const nSeam2 = at('near', T_HW);
  const nSeam3 = at('near', T_FARM);
  const nSeam4 = at('near', T_TOWN);
  seg('near', NEAR, nearSeam, cityGround('near', nearH), 0, '#3a3654');
  seg('near', nearSeam, nSeam2, ground('sub', 'near', nearH), 0, '#6e6a80');
  seg('near', nSeam2, nSeam3, ground('hw', 'near', nearH), 0, '#8a7a7a');
  seg('near', nSeam3, nSeam4, ground('farm', 'near', nearH), 0, '#8a7a7a');
  seg('near', nSeam4, END, ground('town', 'near', nearH), 0, '#8a7a7a');
  // the guardrail and the farm fence ride on top of the near grass
  seg('near', nSeam2 - 30, nSeam3, guardrail('noon'), 4);
  seg('near', nSeam3, nSeam4, farmFence('golden'), 1);
  seg('near', nSeam4, at('near', STOP_T, -100), farmFence('sunset'), 1);
  for (const x of [nSeam2, nSeam3, nSeam4]) add('near', x, tree(17, x === nSeam2 ? 'noon' : x === nSeam3 ? 'golden' : 'sunset', Math.floor(x)), 6, 'occluder');

  // keep draw order stable: by layer order then baseline offset
  const order: Record<Layer, number> = { cloud: 0, far: 1, midfar: 2, mid: 3, near: 4 };
  objs.sort((a, b) => order[a.L] - order[b.L] || a.dy - b.dy);

  const wheels: HTMLCanvasElement[] = [];
  for (let f = 0; f < 6; f++) wheels.push(windmillWheel(f, 6));

  return {
    objs,
    bands,
    wheels,
    ridges: { morning: ridge('morning'), noon: ridge('noon'), golden: ridge('golden'), sunset: ridge('sunset'), city: farCity() },
    rain: rainDeck(),
    overpassTc: OVERPASS_T,
  };
}

export { lw, lh };
