import { describe, expect, it } from 'vitest';
import { birdsOut, catOut, fleeRadius, mothsOut, pickPerches, shouldFlee } from '../src/world/critters';
import { wobble } from '../src/world/foliage';
import { stepSound } from '../src/world/stepfx';
import { flashLevel, thunderDelay } from '../src/world/weather';
import { popHeight } from '../src/gfx/fx';
import { SFX } from '../src/audio/sfx';
import { MAPS } from '../src/world/maps/index';
import '../src/world/maps/town';
import '../src/world/maps/farm';
import type { TerrainId } from '../src/world/types';

describe('critters: who flees and when', () => {
  it('birds take off when the player comes within about three tiles', () => {
    expect(shouldFlee(47, 'player', false)).toBe(true);
    expect(shouldFlee(49, 'player', false)).toBe(false);
    // Running scares them from further out.
    expect(shouldFlee(60, 'player', true)).toBe(true);
    // Standing still lets them hop close.
    expect(shouldFlee(30, 'player', false, false)).toBe(false);
    expect(shouldFlee(20, 'player', false, false)).toBe(true);
  });
  it('townsfolk only scare birds right under their feet, and only while walking', () => {
    expect(fleeRadius('npc', false)).toBeLessThan(fleeRadius('player', false));
    expect(shouldFlee(20, 'npc', false)).toBe(true);
    expect(shouldFlee(20, 'npc', false, false)).toBe(false);
  });
  it('birds are out on fair days only, moths only on dry nights, Biscuit naps by day', () => {
    expect(birdsOut(9 * 60, 'sun', false)).toBe(true);
    expect(birdsOut(9 * 60, 'rain', false)).toBe(false);
    expect(birdsOut(9 * 60, 'snow', false)).toBe(false);
    expect(birdsOut(22 * 60, 'sun', false)).toBe(false);
    expect(birdsOut(9 * 60, 'sun', true)).toBe(false);
    expect(mothsOut(22 * 60, 'sun', 1, false)).toBe(true);
    expect(mothsOut(12 * 60, 'sun', 1, false)).toBe(false);
    expect(mothsOut(22 * 60, 'rain', 1, false)).toBe(false);
    expect(mothsOut(22 * 60, 'sun', 3, false)).toBe(false);
    expect(catOut(10 * 60, 'sun')).toBe(true);
    expect(catOut(10 * 60, 'rain')).toBe(true);
    expect(catOut(10 * 60, 'snow')).toBe(false);
    expect(catOut(23 * 60, 'sun')).toBe(false);
  });
});

describe('critters: perches are stable and sensible', () => {
  for (const id of ['town', 'farm']) {
    it(`${id}: same spots every time, on open walking ground, spread apart`, () => {
      const def = MAPS.get(id)!;
      const at = (x: number, y: number) => (def.legend[def.ground[y]?.[x] ?? ' '] ?? 'void') as TerrainId;
      const solid = (x: number, y: number) => ['water', 'void', 'shallow', 'deep-water'].includes(at(x, y));
      const w = Math.max(...def.ground.map((r) => r.length));
      const a = pickPerches(w, def.ground.length, at, solid, 42, 8);
      const b = pickPerches(w, def.ground.length, at, solid, 42, 8);
      expect(a).toEqual(b);
      expect(a.length).toBeGreaterThan(1);
      for (const p of a) {
        expect(solid(p.x, p.y)).toBe(false);
        expect(p.n).toBeGreaterThanOrEqual(2);
        expect(p.n).toBeLessThanOrEqual(4);
      }
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) expect(Math.abs(a[i].x - a[j].x) + Math.abs(a[i].y - a[j].y)).toBeGreaterThanOrEqual(9);
    });
  }
  it('town gets both pigeons on the pavement and sparrows on the paths', () => {
    const def = MAPS.get('town')!;
    const at = (x: number, y: number) => (def.legend[def.ground[y]?.[x] ?? ' '] ?? 'void') as TerrainId;
    const w = Math.max(...def.ground.map((r) => r.length));
    const kinds = new Set(pickPerches(w, def.ground.length, at, () => false, 7, 9).map((p) => p.kind));
    expect(kinds).toEqual(new Set(['pigeon', 'sparrow']));
  });
});

describe('footsteps: the surface picks the sound', () => {
  it('maps every footstep family to a real sfx recipe', () => {
    const fams = ['grass', 'dirt', 'gravel', 'stone', 'wood', 'carpet', 'tile', 'snow', 'water'];
    for (const f of fams) expect(SFX['step-' + f], f).toBeTypeOf('function');
  });
  it('picks by terrain', () => {
    expect(stepSound('grass')).toBe('grass');
    expect(stepSound('flowers')).toBe('grass');
    expect(stepSound('path')).toBe('dirt');
    expect(stepSound('gravel')).toBe('gravel');
    expect(stepSound('sidewalk')).toBe('stone');
    expect(stepSound('brick')).toBe('stone');
    expect(stepSound('wood')).toBe('wood');
    expect(stepSound('bridge')).toBe('wood');
    expect(stepSound('carpet-red')).toBe('carpet');
    expect(stepSound('checker')).toBe('tile');
    expect(stepSound('shallow')).toBe('water');
    expect(stepSound('snow')).toBe('snow');
  });
  it('weather changes what is underfoot', () => {
    expect(stepSound('grass', { snowy: true })).toBe('snow');
    expect(stepSound('path', { snowy: true })).toBe('snow');
    // Shovelled sidewalks stay stone.
    expect(stepSound('sidewalk', { snowy: true })).toBe('stone');
    expect(stepSound('dirt', { raining: true })).toBe('water');
    expect(stepSound('grass', { raining: true })).toBe('grass');
    expect(stepSound('wood', { raining: true })).toBe('wood');
  });
});

describe('juice curves', () => {
  it('a touched plant wobbles both ways and settles', () => {
    const samples = Array.from({ length: 40 }, (_, i) => wobble(i * 0.02, 2));
    expect(Math.max(...samples)).toBeGreaterThan(0.8);
    expect(Math.min(...samples)).toBeLessThan(-0.3);
    expect(Math.abs(wobble(1, 2))).toBeLessThan(0.01);
    expect(wobble(-0.1, 2)).toBe(0);
  });
  it('lightning flickers, dips, flashes and fades, never to full white', () => {
    const lv = Array.from({ length: 100 }, (_, i) => flashLevel(i * 0.01));
    expect(Math.max(...lv)).toBeLessThan(1);
    expect(flashLevel(0.1)).toBeLessThan(flashLevel(0.03));
    expect(flashLevel(0.2)).toBeGreaterThan(flashLevel(0.03));
    expect(flashLevel(1)).toBe(0);
    expect(thunderDelay(1)).toBeGreaterThan(thunderDelay(0));
    expect(thunderDelay(0)).toBeGreaterThan(0);
  });
  it('popped items bounce lower each time and come to rest', () => {
    const g = 330;
    const v = 100;
    const first = (2 * v) / g;
    expect(popHeight(first / 2, v, g)).toBeCloseTo((v * v) / (2 * g), 1);
    // Mid second bounce is lower than the first peak.
    const second = popHeight(first + (first * 0.42) / 2, v, g);
    expect(second).toBeGreaterThan(0);
    expect(second).toBeLessThan((v * v) / (2 * g));
    expect(popHeight(10, v, g)).toBe(0);
  });
});
