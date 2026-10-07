import { audio } from '../audio';
import { AK, circ, dense, ell, hash2, L, mkSpr, OUT, P1, poly, R, selA, toCanvas, type Spr } from '../gfx/kit';
import type { Actor } from './actor';
import type { GameMap } from './map';
import type { StepFx } from './stepfx';
import { TILE, type TerrainId } from './types';

/**
 * Small lives around town. Sparrows and pigeons hop and peck on paths and
 * sidewalks by day and burst away when someone comes close; moths circle the
 * lamps at night; a fish jumps in the creek now and then; and Biscuit, the
 * diner's cat, naps on the step on Main Street and likes a scratch. Spots are
 * seeded per map, so the same flocks come back to the same corners. Nobody
 * is ever hurt: critters only ever flee, and they always come back.
 */

// ===================================================================== rules (pure)

export type Threat = 'player' | 'npc';

/**
 * How close (px) someone can get before a bird takes off. About three tiles
 * for the player on foot, four at a run, and a tile and a half if they stand
 * still and let the birds hop up to them. Townsfolk only scare birds right
 * under their feet.
 */
export function fleeRadius(threat: Threat, running: boolean, moving = true): number {
  if (threat === 'npc') return moving ? 1.6 * TILE : 0;
  if (!moving) return 1.5 * TILE;
  return (running ? 4 : 3) * TILE;
}

export function shouldFlee(dist: number, threat: Threat, running: boolean, moving = true): boolean {
  return dist < fleeRadius(threat, running, moving);
}

const BIRD_WEATHER = new Set(['sun', 'wind']);
/** Birds are out in daylight in fair weather, outdoors. */
export function birdsOut(minutes: number, weather: string, indoor: boolean): boolean {
  return !indoor && BIRD_WEATHER.has(weather) && minutes >= 6 * 60 + 30 && minutes < 19 * 60 + 30;
}

/** Moths come to the lamps after dark when it's dry and not winter. */
export function mothsOut(minutes: number, weather: string, season: number, indoor: boolean): boolean {
  return !indoor && season !== 3 && (weather === 'sun' || weather === 'wind') && (minutes >= 20 * 60 + 30 || minutes < 5 * 60);
}

/** Biscuit naps on the diner step from breakfast till supper, unless it's snowing (she's inside by the radiator then). */
export function catOut(minutes: number, weather: string): boolean {
  return weather !== 'snow' && weather !== 'storm' && minutes >= 7 * 60 && minutes < 19 * 60 + 30;
}

const PERCH: Partial<Record<TerrainId, 'pigeon' | 'sparrow'>> = {
  sidewalk: 'pigeon', brick: 'pigeon', concrete: 'pigeon', parking: 'pigeon',
  path: 'sparrow', dirt: 'sparrow', gravel: 'sparrow', grass: 'sparrow', sand: 'sparrow',
};

export interface Perch {
  x: number;
  y: number;
  kind: 'pigeon' | 'sparrow';
  n: number;
}

/**
 * Stable flock spots for a map: tiles of open walking ground (with open
 * neighbours), well spread apart, chosen by a hash of the map's seed. The
 * same map always gives the same perches.
 */
export function pickPerches(w: number, h: number, terrainAt: (x: number, y: number) => TerrainId, blocked: (x: number, y: number) => boolean, seed: number, want: number, spacing = 9): Perch[] {
  const cands: { x: number; y: number; r: number; kind: 'pigeon' | 'sparrow' }[] = [];
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const kind = PERCH[terrainAt(x, y)];
      if (!kind || blocked(x, y)) continue;
      let open = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (blocked(x + dx, y + dy)) open = false;
      if (!open) continue;
      // Paved spots and paths first; open lawn only now and then.
      const bias = terrainAt(x, y) === 'grass' ? 0.5 : 1;
      cands.push({ x, y, r: hash2(x, y, seed) * bias, kind });
    }
  cands.sort((a, b) => b.r - a.r);
  const out: Perch[] = [];
  // Pigeons on the pavement, sparrows on paths and lawns: neither takes more than its half if the other has room.
  const cap = Math.ceil(want / 2);
  for (const pass of [true, false])
    for (const c of cands) {
      if (out.length >= want) break;
      if (pass && out.filter((p) => p.kind === c.kind).length >= cap) continue;
      if (out.some((p) => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < spacing)) continue;
      out.push({ x: c.x, y: c.y, kind: c.kind, n: 2 + Math.floor(hash2(c.x, c.y, seed + 1) * 3) });
    }
  return out;
}

// ===================================================================== art

const CACHE = new Map<string, HTMLCanvasElement>();
/** A critter sprite: painted at the world's double density with a fine (half-pixel) selective outline. */
function spr(key: string, w: number, h: number, draw: () => void, outline = true): HTMLCanvasElement {
  const hit = CACHE.get(key);
  if (hit) return hit;
  let s: Spr = dense(2, () => mkSpr(w, h, draw));
  if (outline) {
    // A one-fine-pixel outline (OUT on the raw buffer), so tiny animals keep their shape.
    s = OUT({ w: s.w, h: s.h, d: s.d }, selA);
    s.k = 2;
  }
  const c = toCanvas(s);
  CACHE.set(key, c);
  return c;
}

type BirdPose = 'stand' | 'peck' | 'crouch' | 'air' | 'up' | 'down' | 'glide' | 'look';

const SP = { tail: '#6a4436', back: '#9a6648', wing: '#a8704f', streak: '#5e3a32', bar: '#ead6b0', belly: '#efe0c4', bellyS: '#d8c6a6', cap: '#8a4a36', cheek: '#cfc6c8', bib: '#4e3e48', beak: '#6a5a5e', leg: '#c8846a' };
const PG = { tail: '#5a5878', back: '#9496b4', body: '#a8aac6', wing: '#8a8cae', bar: '#4e4870', neck: '#6aa890', neck2: '#9a78b0', head: '#9a9cbc', beak: '#6a5a6a', cere: '#f4f0f8', eye: '#f09048', leg: '#e88a8a' };

/** House sparrow, facing right, in a 10 x 9 box with its feet on the bottom edge. */
function sparrow(p: BirdPose): void {
  const flying = p === 'up' || p === 'down' || p === 'glide';
  const peck = p === 'peck';
  const dy = p === 'crouch' ? 0.5 : p === 'air' || flying ? -0.5 : 0;
  // tail: cocked up when pecking
  poly(peck ? [[0, 2.6], [3.4, 4.6], [3.4, 6], [0.4, 3.8]] : [[0, 4], [3.2, 4.8], [3.2, 6.2], [0.4, 5.4]], SP.tail);
  ell(4.8, 5.6 + dy, 3.1, 2.2, SP.back);
  ell(5.4, 6.5 + dy, 2.5, 1.3, SP.belly);
  R(3.5, 7 + dy, 3.5, 0.5, SP.bellyS);
  if (!flying) {
    ell(4, 5 + dy, 2.4, 1.4, SP.wing);
    P1(3, 4.5 + dy, SP.streak);
    P1(4, 5 + dy, SP.streak);
    P1(2.5, 5.5 + dy, SP.streak);
    P1(4.5, 4.5 + dy, SP.streak);
    P1(4.5, 5.5 + dy, SP.bar);
    P1(3.5, 6 + dy, SP.bar);
  }
  const hx = peck ? 8.2 : p === 'look' ? 7 : 7.3;
  const hy = (peck ? 6.2 : 3.6) + dy;
  circ(hx, hy, 1.8, SP.cap);
  ell(hx + 0.4, hy + 0.6, 1.2, 0.9, SP.cheek);
  P1(hx + 0.5, hy - 0.2, AK);
  P1(hx + 1, hy + 1.1, SP.bib);
  P1(hx + 0.5, hy + 1.4, SP.bib);
  // beak, a little cone; looking back it points up a touch
  const by = hy + (p === 'look' ? 0 : 0.4);
  P1(hx + 1.8, by, SP.beak);
  P1(hx + 2.3, by, SP.beak);
  P1(hx + 1.8, by - 0.5, '#8a7a7e');
  if (p === 'up') poly([[3, 4.6], [6, 4.6], [3, 0.2], [1.6, 0.6]], SP.wing);
  if (p === 'down') poly([[3, 5.6], [6, 5.6], [4, 9], [2.2, 8.6]], SP.wing);
  if (p === 'glide') poly([[2.4, 4.8], [6.2, 4.8], [1, 3.4]], SP.wing);
  if (flying) {
    P1(3.5, p === 'up' ? 2.5 : 7.5, SP.streak);
    P1(4.5, p === 'up' ? 3.5 : 6.5, SP.bar);
  }
  if (!flying && p !== 'air') {
    R(4.6, 7.6 + dy, 0.5, 1.4 - dy, SP.leg);
    R(5.6, 7.6 + dy, 0.5, 1.4 - dy, SP.leg);
  } else {
    P1(4.6, 7.8 + dy, SP.leg);
    P1(5.1, 8 + dy, SP.leg);
  }
}

/** Town pigeon, facing right, 12 x 10. */
function pigeon(p: BirdPose): void {
  const flying = p === 'up' || p === 'down' || p === 'glide';
  const peck = p === 'peck';
  const dy = p === 'crouch' ? 0.5 : p === 'air' || flying ? -0.5 : 0;
  poly(peck ? [[0, 3.6], [3.6, 5.4], [3.6, 7], [0.2, 4.8]] : [[0, 5.2], [3.6, 5.6], [3.6, 7.2], [0.2, 6.6]], PG.tail);
  P1(0.3, peck ? 4.2 : 5.8, '#3e3a58');
  ell(5.6, 6.4 + dy, 3.8, 2.6, PG.back);
  ell(6.3, 7.4 + dy, 3, 1.5, PG.body);
  if (!flying) {
    ell(4.8, 5.8 + dy, 2.9, 1.7, PG.wing);
    L(3, 5.8 + dy, 5, 6.2 + dy, PG.bar);
    P1(3.5, 6.8 + dy, PG.bar);
    P1(4.5, 7 + dy, PG.bar);
    P1(5.5, 7 + dy, PG.bar);
  }
  const hx = peck ? 10 : p === 'look' ? 8.4 : 9;
  const hy = (peck ? 7.4 : 3.2) + dy;
  // neck with its green and violet sheen
  poly([[7, 5.6 + dy], [hx - 0.6, hy], [hx + 1, hy + 0.6], [9, 6.6 + dy]], PG.neck);
  P1(8, 5.6 + dy, PG.neck2);
  P1(8.5, 6 + dy, PG.neck2);
  P1(7.5, 6 + dy, PG.neck2);
  circ(hx, hy, 1.6, PG.head);
  P1(hx + 0.5, hy - 0.5, PG.eye);
  P1(hx + 1.5, hy, PG.cere);
  P1(hx + 2, hy + 0.5, PG.beak);
  P1(hx + 2.5, hy + 0.5, PG.beak);
  if (p === 'up') poly([[3.4, 5.4], [7.4, 5.4], [3.4, 0], [1.6, 0.6]], PG.wing);
  if (p === 'down') poly([[3.4, 6.6], [7.4, 6.6], [4.4, 10], [2.4, 9.6]], PG.wing);
  if (p === 'glide') poly([[2.6, 5.6], [7.6, 5.6], [0.6, 4]], PG.wing);
  if (flying) {
    P1(3.5, p === 'up' ? 1.5 : 9, PG.bar);
    P1(4, p === 'up' ? 2 : 8.5, PG.bar);
  }
  if (!flying && p !== 'air') {
    R(5.6, 9 + dy, 0.5, 1 - dy, PG.leg);
    R(6.6, 9 + dy, 0.5, 1 - dy, PG.leg);
    P1(7, 9.5, PG.leg);
  } else P1(5.6, 9 + dy, PG.leg);
}

const BIRD_BOX = { sparrow: [10, 9], pigeon: [12, 10] } as const;
function birdArt(kind: 'sparrow' | 'pigeon', p: BirdPose): HTMLCanvasElement {
  const [w, h] = BIRD_BOX[kind];
  return spr(kind + '|' + p, w, h, () => (kind === 'sparrow' ? sparrow(p) : pigeon(p)));
}

type CatPose = 'sleep0' | 'sleep1' | 'awake' | 'happy' | 'flick';
const CAT = { fur: '#e8944a', lit: '#f6b46a', shade: '#c8743a', stripe: '#b0602e', cream: '#fbe6c8', creamS: '#e8c8a0', nose: '#e88a8a', ear: '#f4a8a0', eye: '#9ac860' };
/** Biscuit, an orange tabby loaf facing right, 16 x 10. */
function cat(p: CatPose): void {
  const breathe = p === 'sleep1' ? -0.5 : 0;
  // tail wrapped round the front, cream tip
  ell(7, 9.2, 6.4, 0.9, CAT.shade);
  R(1.5, 8.9, 9, 0.6, CAT.fur);
  const tip = p === 'flick' ? [12.5, 7.4] : [11.6, 8.8];
  ell(tip[0], tip[1], 1, 0.7, CAT.cream);
  // body loaf
  ell(7, 6.6 + breathe / 2, 6.2, 3.2 - breathe / 2, CAT.fur);
  ell(6.4, 5.4 + breathe, 4.6, 1.6, CAT.lit);
  R(2, 8.6, 9, 0.5, CAT.shade);
  for (const x of [3.5, 5.5, 7.5]) {
    L(x, 4.4 + breathe, x - 0.5, 6.5, CAT.stripe);
  }
  P1(2.5, 6, CAT.stripe);
  // head: tucked low when asleep, up when awake
  const up = p === 'awake' || p === 'happy';
  const hx = 12.4;
  const hy = up ? 4.4 : 6.2;
  // ears
  poly([[hx - 2.4, hy - 1.4], [hx - 1.8, hy - 3.8], [hx - 0.4, hy - 2]], CAT.fur);
  poly([[hx + 0.6, hy - 2], [hx + 2, hy - 3.8], [hx + 2.4, hy - 1.2]], p === 'flick' ? CAT.shade : CAT.fur);
  P1(hx - 1.6, hy - 2.6, CAT.ear);
  P1(hx + 1.6, hy - 2.6, CAT.ear);
  ell(hx, hy, 2.8, 2.3, CAT.fur);
  ell(hx - 0.4, hy - 1, 2, 1, CAT.lit);
  P1(hx - 0.5, hy - 2, CAT.stripe);
  P1(hx + 0.5, hy - 2, CAT.stripe);
  P1(hx, hy - 1.5, CAT.stripe);
  // muzzle and nose
  ell(hx + 0.2, hy + 1.1, 1.4, 0.9, CAT.cream);
  P1(hx + 0.2, hy + 0.6, CAT.nose);
  // eyes: shut (sleep), open (awake) or happy arcs
  if (p === 'awake') {
    for (const ex of [hx - 1.3, hx + 1.2]) {
      R(ex - 0.5, hy - 0.3, 1, 0.8, CAT.eye);
      P1(ex, hy - 0.3, AK);
      P1(ex, hy + 0.2, AK);
    }
  } else if (p === 'happy') {
    for (const ex of [hx - 1.3, hx + 1.2]) {
      P1(ex - 0.5, hy, AK);
      P1(ex, hy - 0.5, AK);
      P1(ex + 0.5, hy, AK);
    }
    P1(hx - 2.2, hy + 0.8, CAT.ear);
    P1(hx + 2.2, hy + 0.8, CAT.ear);
  } else {
    for (const ex of [hx - 1.3, hx + 1.2]) {
      P1(ex - 0.5, hy + 0.2, AK);
      P1(ex, hy + 0.5, AK);
      P1(ex + 0.5, hy + 0.2, AK);
    }
  }
  // front paws peeking under the chin
  ell(hx - 1.6, 9.1, 1, 0.6, CAT.cream);
  ell(hx + 0.6, 9.2, 1, 0.6, CAT.cream);
  P1(hx - 1.6, 9.2, CAT.creamS);
}
const catArt = (p: CatPose) => spr('cat|' + p, 16, 10, () => cat(p));

/** A creek fish mid-leap: 0 rising, 1 level, 2 diving. */
function fish(f: number): void {
  const body = '#a8c4d8';
  const back = '#4a7088';
  const belly = '#e4ecf4';
  if (f === 1) {
    ell(3.5, 1.6, 3, 1.2, body);
    R(1, 0.8, 5, 0.5, back);
    R(1.5, 2.2, 4, 0.5, belly);
    poly([[0.6, 1.6], [-0.6, 0.4], [-0.6, 2.8]], back);
    P1(5.5, 1.3, AK);
    P1(3, 0.5, back);
  } else {
    const up = f === 0 ? -1 : 1;
    // angled body: draw along a diagonal
    for (let i = 0; i < 6; i++) {
      const x = 0.5 + i * 0.8;
      const y = 2.5 - up * (i - 2.5) * 0.55;
      ell(x, y, 1.1, 1, i < 2 ? back : body);
    }
    P1(4.6, 2.5 - up * 2.2 - 0.5, AK);
    poly([[0, 2.5 + up * 1.4], [-1, 2.5 + up * 0.4], [-0.6, 2.5 + up * 2.6]], back);
    P1(2.6, 2.6 - up * 0.2 + 0.5, belly);
  }
}
const fishArt = (f: number) => spr('fish|' + f, 7, 5, () => fish(f));

// ===================================================================== runtime

interface Bird {
  kind: 'sparrow' | 'pigeon';
  flock: Flock;
  x: number;
  y: number;
  /** Height above the ground (px). */
  h: number;
  vx: number;
  vy: number;
  vh: number;
  face: 1 | -1;
  state: 'ground' | 'hop' | 'fly' | 'away' | 'land';
  pose: BirdPose;
  /** Seconds left in the current little action. */
  act: number;
  t: number;
  /** Delay before following a startled flockmate. */
  fleeIn: number;
  hopTo?: { x: number; y: number };
  landAt?: { x: number; y: number };
}

interface Flock {
  perch: Perch;
  hx: number;
  hy: number;
  birds: Bird[];
  /** Seconds until the flock comes back after being scattered. */
  away: number;
}

interface Moth {
  cx: number;
  cy: number;
  a: number;
  r: number;
  sp: number;
  ph: number;
}

interface Jump {
  x: number;
  y: number;
  t: number;
  dir: 1 | -1;
}

export interface CritterEnv {
  map: GameMap;
  minutes: number;
  weather: string;
  season: number;
  day: number;
  player: Actor;
  npcs: Actor[];
  view: { x: number; y: number; w: number; h: number };
  steps: StepFx;
  /** 0..1 how dark it is (the grade's lamp level). */
  night: number;
}

/** Where Biscuit sleeps on each map that has her. */
const CAT_SPOTS: Record<string, { x: number; y: number }> = {
  // The Hot Tag's front step, just right of the door (town.ts: diner at x 8.5, door 32 px right of centre, bottoms on row 28).
  town: { x: 8.5 * TILE + 32 + 15, y: 28 * TILE + 3 },
};

export class Critters {
  private mapId = '';
  private flocks: Flock[] = [];
  private moths: Moth[] = [];
  private jump: Jump | null = null;
  private jumpIn = 4;
  private water: { x: number; y: number }[] = [];
  /** Biscuit: where she is, what she's doing, and her mood timers. */
  cat: { x: number; y: number; pose: CatPose; wake: number; pet: number; flick: number; emote: { icon: string; t: number; age: number } | null } | null = null;
  private catT = 0;
  private birdDay = -1;

  private reset(env: CritterEnv): void {
    const m = env.map;
    this.mapId = m.id;
    this.flocks = [];
    this.moths = [];
    this.jump = null;
    this.birdDay = -1;
    let seed = 0;
    for (const c of m.id) seed = (seed * 31 + c.charCodeAt(0)) | 0;
    const want = m.def.indoor ? 0 : Math.max(2, Math.round((m.w * m.h) / 800));
    const perches = want ? pickPerches(m.w, m.h, (x, y) => m.terrainAt(x, y), (x, y) => !!m.blocked[y * m.w + x] || x < 0 || y < 0 || x >= m.w || y >= m.h, seed, want) : [];
    for (const p of perches) this.flocks.push({ perch: p, hx: p.x * TILE + TILE / 2, hy: p.y * TILE + TILE - 4, birds: [], away: 0 });
    // Lamps for the moths, water for the fish.
    this.water = [];
    if (!m.def.indoor)
      for (let y = 0; y < m.h; y++)
        for (let x = 0; x < m.w; x++) {
          const t = m.terrainAt(x, y);
          // Open water only (not right at the bank), so the leap and its rings stay on the water.
          const wet = (tt: TerrainId) => tt === 'water' || tt === 'deep-water';
          if (wet(t) && wet(m.terrainAt(x, y - 1)) && wet(m.terrainAt(x, y + 1)) && wet(m.terrainAt(x - 1, y)) && wet(m.terrainAt(x + 1, y))) this.water.push({ x, y });
        }
  }

  /** (Re)fill today's flocks: a seeded share of the perches is in use each day. */
  private populate(env: CritterEnv): void {
    this.birdDay = env.day;
    for (const f of this.flocks) {
      f.birds = [];
      f.away = 0;
      if (hash2(f.perch.x, env.day, 5) > (env.weather === 'wind' ? 0.45 : 0.8)) continue;
      for (let i = 0; i < f.perch.n; i++) f.birds.push(this.newBird(f, i, false));
    }
  }

  private newBird(f: Flock, i: number, landing: boolean): Bird {
    const a = (i / Math.max(1, f.perch.n)) * Math.PI * 2 + hash2(f.perch.x, i, 9) * 2;
    const r = 3 + hash2(f.perch.y, i, 11) * 9;
    const x = f.hx + Math.cos(a) * r;
    const y = f.hy + Math.sin(a) * r * 0.5;
    const b: Bird = { kind: f.perch.kind === 'pigeon' && hash2(i, f.perch.x, 3) < 0.75 ? 'pigeon' : 'sparrow', flock: f, x, y, h: 0, vx: 0, vy: 0, vh: 0, face: hash2(i, f.perch.y, 4) < 0.5 ? 1 : -1, state: 'ground', pose: 'stand', act: Math.random() * 2, t: Math.random() * 5, fleeIn: -1 };
    if (landing) {
      // Fly in from off to one side, high up, and glide down to the spot.
      const side = Math.random() < 0.5 ? -1 : 1;
      b.landAt = { x, y };
      b.x = x + side * (180 + Math.random() * 60);
      b.y = y - 20 + Math.random() * 40;
      b.h = 70 + Math.random() * 30;
      b.face = side > 0 ? -1 : 1;
      b.state = 'land';
      b.t = Math.random();
    }
    return b;
  }

  update(dt: number, env: CritterEnv): void {
    if (env.map.id !== this.mapId) this.reset(env);
    const out = birdsOut(env.minutes, env.weather, !!env.map.def.indoor);
    if (out && this.birdDay !== env.day) this.populate(env);
    this.updateBirds(dt, env, out);
    this.updateMoths(dt, env);
    this.updateFish(dt, env);
    this.updateCat(dt, env);
  }

  // ------------------------------------------------------------ birds

  private updateBirds(dt: number, env: CritterEnv, out: boolean): void {
    const threats: { a: Actor; kind: Threat }[] = [{ a: env.player, kind: 'player' }, ...env.npcs.map((a) => ({ a, kind: 'npc' as const }))];
    let fluttered = false;
    for (const f of this.flocks) {
      // Come back once the coast is clear (and only while it's still bird weather).
      if (f.away > 0) {
        f.away -= dt;
        if (f.away <= 0) {
          const near = Math.hypot(env.player.x - f.hx, env.player.y - f.hy) < 6 * TILE;
          if (!out || near) f.away = 8;
          else f.birds = Array.from({ length: f.perch.n }, (_, i) => this.newBird(f, i, true));
        }
      }
      for (const b of f.birds) {
        b.t += dt;
        if (b.state === 'ground' || b.state === 'hop') {
          if (!out) this.takeOff(b, b.x + (Math.random() - 0.5) * 10, b.y + 20);
          for (const th of threats) {
            if (!th.a.visible) continue;
            const d = Math.hypot(th.a.x - b.x, (th.a.y - b.y) * 1.3);
            if (shouldFlee(d, th.kind, th.a.running && th.a.moving, th.a.moving)) {
              if (this.takeOff(b, th.a.x, th.a.y)) fluttered = fluttered || Math.hypot(env.player.x - b.x, env.player.y - b.y) < 200;
              // The rest of the flock follows a heartbeat later.
              for (const o of f.birds) if (o !== b && (o.state === 'ground' || o.state === 'hop') && o.fleeIn < 0) o.fleeIn = 0.06 + Math.random() * 0.28;
              break;
            }
          }
          if (b.fleeIn >= 0) {
            b.fleeIn -= dt;
            if (b.fleeIn < 0) this.takeOff(b, env.player.x, env.player.y);
          }
        }
        this.stepBird(b, dt, env);
      }
      if (f.birds.length && f.birds.every((b) => b.state === 'away')) {
        f.birds = [];
        f.away = 25 + Math.random() * 30;
      }
    }
    if (fluttered) audio.sfx('flutter', { volume: 0.5, pitch: 0.9 + Math.random() * 0.25 });
  }

  /** Burst up and away from (fx, fy). Returns true if it actually took off. */
  private takeOff(b: Bird, fx: number, fy: number): boolean {
    if (b.state !== 'ground' && b.state !== 'hop') return false;
    let dx = b.x - fx;
    let dy = b.y - fy;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    // Mostly sideways (birds bank away), a little up the screen.
    const sp = 70 + Math.random() * 40;
    b.vx = dx * sp + (Math.random() - 0.5) * 20;
    b.vy = dy * sp * 0.5 - 10;
    b.vh = 55 + Math.random() * 25;
    b.face = b.vx >= 0 ? 1 : -1;
    b.state = 'fly';
    b.fleeIn = -1;
    b.t = 0;
    return true;
  }

  private stepBird(b: Bird, dt: number, env: CritterEnv): void {
    const blocked = (x: number, y: number) => {
      const m = env.map;
      const tx = Math.floor(x / TILE);
      const ty = Math.floor(y / TILE);
      return tx < 0 || ty < 0 || tx >= m.w || ty >= m.h || !!m.blocked[ty * m.w + tx] || m.terrainAt(tx, ty) === 'water';
    };
    switch (b.state) {
      case 'ground': {
        b.act -= dt;
        if (b.act <= 0) {
          const r = Math.random();
          if (r < 0.38) {
            b.pose = 'peck';
            b.act = 0.35 + Math.random() * 0.5;
          } else if (r < 0.7) {
            // hop a little way, mostly near home
            const f = b.flock;
            const home = Math.hypot(b.x - f.hx, b.y - f.hy) > 14;
            const ang = home ? Math.atan2(f.hy - b.y, f.hx - b.x) + (Math.random() - 0.5) : Math.random() * Math.PI * 2;
            const dist = 3 + Math.random() * 4;
            const tx = b.x + Math.cos(ang) * dist;
            const ty = b.y + Math.sin(ang) * dist * 0.6;
            if (!blocked(tx, ty)) {
              b.hopTo = { x: tx, y: ty };
              b.state = 'hop';
              b.pose = 'crouch';
              b.act = 0.05;
              b.face = tx >= b.x ? 1 : -1;
              b.t = 0;
            } else b.act = 0.3;
          } else if (r < 0.85) {
            b.pose = 'look';
            b.act = 0.4 + Math.random() * 0.6;
            if (Math.random() < 0.5) b.face = (b.face * -1) as 1 | -1;
          } else {
            b.pose = 'stand';
            b.act = 0.5 + Math.random() * 1.5;
          }
        }
        break;
      }
      case 'hop': {
        b.act -= dt;
        if (b.pose === 'crouch' && b.act <= 0) {
          b.pose = 'air';
          b.act = 0.14;
        }
        if (b.pose === 'air' && b.hopTo) {
          const k = 1 - Math.max(0, b.act) / 0.14;
          b.x += (b.hopTo.x - b.x) * Math.min(1, dt * 14);
          b.y += (b.hopTo.y - b.y) * Math.min(1, dt * 14);
          b.h = Math.sin(k * Math.PI) * 2.2;
          if (b.act <= 0) {
            b.h = 0;
            b.pose = 'crouch';
            b.act = 0.06;
            b.hopTo = undefined;
          }
        } else if (b.pose === 'crouch' && !b.hopTo && b.act <= 0) {
          // sometimes a double hop
          b.state = 'ground';
          b.pose = 'stand';
          b.act = Math.random() < 0.3 ? 0 : 0.3 + Math.random() * 0.6;
        }
        break;
      }
      case 'fly': {
        b.vx *= 1 + dt * 0.6;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.h += b.vh * dt;
        b.vh = Math.max(25, b.vh - dt * 30);
        b.pose = b.t < 0.06 ? 'crouch' : Math.floor(b.t * 16) % 2 ? 'up' : 'down';
        const v = env.view;
        if (b.x < v.x - 40 || b.x > v.x + v.w + 40 || b.y - b.h < v.y - 40 || b.h > 160) b.state = 'away';
        break;
      }
      case 'land': {
        const to = b.landAt!;
        const dx = to.x - b.x;
        const dy = to.y - b.y;
        const d = Math.hypot(dx, dy);
        const sp = Math.max(24, Math.min(90, d * 1.4));
        if (d > 1) {
          b.x += (dx / d) * sp * dt;
          b.y += (dy / d) * sp * dt;
        }
        b.face = dx >= 0 ? 1 : -1;
        // Height follows the remaining distance down a gentle glide slope.
        b.h = Math.max(0, Math.min(b.h, d * 0.42));
        const flare = d < 14;
        b.pose = flare ? (Math.floor(b.t * 20) % 2 ? 'up' : 'down') : Math.floor(b.t * 3) % 3 === 0 ? (Math.floor(b.t * 14) % 2 ? 'up' : 'down') : 'glide';
        if (d < 1.2 && b.h < 0.5) {
          b.x = to.x;
          b.y = to.y;
          b.h = 0;
          b.state = 'ground';
          b.pose = 'crouch';
          b.act = 0.2;
        }
        break;
      }
      case 'away':
        break;
    }
  }

  // ------------------------------------------------------------ moths

  private updateMoths(dt: number, env: CritterEnv): void {
    const on = mothsOut(env.minutes, env.weather, env.season, !!env.map.def.indoor) && env.night > 0.5;
    if (!on) {
      this.moths.length = 0;
      return;
    }
    if (!this.moths.length) {
      for (const o of env.map.objects) {
        if (o.kind !== 'lamp' || o.hidden) continue;
        const n = 2 + Math.floor(hash2(Math.round(o.x), Math.round(o.y), 21) * 3);
        for (let i = 0; i < n; i++) this.moths.push({ cx: o.x, cy: o.y - 46, a: Math.random() * 6.28, r: 4 + Math.random() * 9, sp: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2.5), ph: Math.random() * 6.28 });
      }
    }
    for (const m of this.moths) {
      // Loopy orbits that wander in and bump the glass now and then.
      m.a += m.sp * dt;
      m.ph += dt;
      m.r = 7 + Math.sin(m.ph * 0.9) * 5 + Math.sin(m.ph * 2.3) * 2;
    }
  }

  // ------------------------------------------------------------ fish

  private updateFish(dt: number, env: CritterEnv): void {
    if (this.jump) {
      const j = this.jump;
      j.t += dt;
      if (j.t >= 0.62 && j.t - dt < 0.62) {
        env.steps.ripple(j.x + j.dir * 10, j.y, 1);
        this.plip(env, j.x, j.y, 0.6);
      }
      if (j.t > 0.7) this.jump = null;
      return;
    }
    if (!this.water.length || env.weather === 'snow') return;
    this.jumpIn -= dt;
    if (this.jumpIn > 0) return;
    this.jumpIn = 6 + Math.random() * 10;
    // Somewhere in view, on open water.
    const v = env.view;
    const vis = this.water.filter((w) => w.x * TILE > v.x + 16 && w.x * TILE < v.x + v.w - 16 && w.y * TILE > v.y + 8 && w.y * TILE < v.y + v.h - 8);
    if (!vis.length) return;
    const w = vis[(Math.random() * vis.length) | 0];
    const dir = Math.random() < 0.5 ? 1 : -1;
    const x = w.x * TILE + 8 - dir * 5;
    const y = w.y * TILE + 9;
    const tx = Math.floor((x + dir * 10) / TILE);
    const tt = env.map.terrainAt(tx, w.y);
    if (tt !== 'water' && tt !== 'deep-water') return;
    this.jump = { x, y, t: 0, dir: dir as 1 | -1 };
    env.steps.ripple(x, y, 1.4);
    this.plip(env, x, y, 1);
  }

  private plip(env: CritterEnv, x: number, y: number, v: number): void {
    const d = Math.hypot(env.player.x - x, env.player.y - y);
    if (d < 220) audio.sfx('plip', { volume: v * Math.max(0.15, 1 - d / 220), pitch: 0.9 + Math.random() * 0.25 });
  }

  // ------------------------------------------------------------ Biscuit

  private updateCat(dt: number, env: CritterEnv): void {
    const spot = CAT_SPOTS[env.map.id];
    if (!spot || !catOut(env.minutes, env.weather)) {
      this.cat = null;
      return;
    }
    if (!this.cat) this.cat = { x: spot.x, y: spot.y, pose: 'sleep0', wake: 0, pet: 0, flick: 4, emote: null };
    const c = this.cat;
    this.catT += dt;
    const near = Math.hypot(env.player.x - c.x, (env.player.y - c.y) * 1.4) < 26;
    // She lifts her head when you come close, and dozes off again once you go.
    c.wake = near ? Math.min(1.5, c.wake + dt) : Math.max(0, c.wake - dt * 0.5);
    c.pet = Math.max(0, c.pet - dt);
    c.flick -= dt;
    if (c.flick < -0.25) c.flick = 3 + Math.random() * 5;
    if (c.emote) {
      c.emote.age += dt;
      c.emote.t -= dt;
      if (c.emote.t <= 0) c.emote = null;
    }
    if (c.pet > 0) c.pose = 'happy';
    else if (c.wake > 0.35) c.pose = 'awake';
    else if (c.flick < 0) c.pose = 'flick';
    else c.pose = Math.sin(this.catT * 2.4) > 0 ? 'sleep1' : 'sleep0';
  }

  /** Is (x, y) — the spot the player is reaching toward — on Biscuit? */
  catAt(x: number, y: number): boolean {
    const c = this.cat;
    return !!c && Math.abs(x - c.x) < 12 && y > c.y - 14 && y < c.y + 12;
  }

  /** A scratch behind the ears: purr, a heart, and a happy wiggle. */
  pet(): void {
    const c = this.cat;
    if (!c) return;
    c.pet = 1.6;
    c.wake = 1.5;
    c.emote = { icon: '♥', t: 1.8, age: 0 };
    audio.sfx('purr', { volume: 0.9 });
  }

  // ------------------------------------------------------------ drawing

  /** Push depth-sorted drawables (ground y) and high fliers (drawn above everything). */
  collect(list: { y: number; draw: () => void }[], above: (() => void)[], ctx: CanvasRenderingContext2D, t: number): void {
    for (const f of this.flocks)
      for (const b of f.birds) {
        if (b.state === 'away') continue;
        const d = () => this.drawBird(ctx, b);
        if (b.h > 14) above.push(d);
        else list.push({ y: b.y, draw: d });
      }
    if (this.cat) {
      const c = this.cat;
      list.push({ y: c.y, draw: () => this.drawCat(ctx, t) });
    }
    if (this.jump) {
      const j = this.jump;
      list.push({ y: j.y + 2, draw: () => this.drawJump(ctx, j) });
    }
  }

  /** Moths are drawn after the lighting: they live in the lamp's glow. World space (camera translate active). */
  drawLit(ctx: CanvasRenderingContext2D, t: number): void {
    if (this.moths.length) this.drawMoths(ctx, t);
  }

  private drawBird(ctx: CanvasRenderingContext2D, b: Bird): void {
    // Pecking bobs the head down and back up.
    const pose = b.pose === 'peck' && Math.floor(b.t * 7) % 3 === 2 ? 'stand' : b.pose;
    const img = birdArt(b.kind, pose);
    const [w, h] = BIRD_BOX[b.kind];
    // a soft round shadow that shrinks as the bird climbs
    const sr = Math.max(0.5, (b.kind === 'pigeon' ? 3 : 2.5) * (1 - Math.min(1, b.h / 60)));
    ctx.globalAlpha = 0.28 * (1 - Math.min(1, b.h / 90));
    ctx.fillStyle = AK;
    const sx = Math.round(b.x * 2) / 2;
    const sy = Math.round(b.y * 2) / 2;
    ctx.fillRect(sx - sr, sy - 0.5, sr * 2, 1);
    ctx.fillRect(sx - sr + 0.5, sy - 1, sr * 2 - 1, 0.5);
    ctx.globalAlpha = 1;
    const x = Math.round(b.x * 2) / 2;
    const y = Math.round((b.y - b.h) * 2) / 2;
    ctx.save();
    ctx.translate(x, y);
    if (b.face < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2 - 0.5, -h - 0.5);
    ctx.restore();
  }

  private drawCat(ctx: CanvasRenderingContext2D, t: number): void {
    const c = this.cat!;
    const img = catArt(c.pose);
    // soft contact shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = AK;
    ctx.fillRect(c.x - 7, c.y - 0.5, 15, 1);
    ctx.fillRect(c.x - 6, c.y + 0.5, 13, 0.5);
    ctx.globalAlpha = 1;
    // a happy wiggle while being petted
    const wig = c.pet > 0 ? Math.round(Math.sin(t * 22) * 1) / 2 : 0;
    ctx.drawImage(img, Math.round(c.x) - 8.5 + wig, Math.round(c.y) - 10.5);
    if (c.pose === 'sleep0' || c.pose === 'sleep1') {
      // a slow "z" drifting up now and then
      const k = (t * 0.35) % 1;
      if (k < 0.7) {
        ctx.globalAlpha = Math.min(1, (0.7 - k) * 3) * 0.85;
        ctx.fillStyle = '#e8e0f4';
        const zx = Math.round((c.x + 6 + k * 5 + Math.sin(k * 9)) * 2) / 2;
        const zy = Math.round((c.y - 12 - k * 10) * 2) / 2;
        ctx.fillRect(zx, zy, 1.5, 0.5);
        ctx.fillRect(zx + 0.5, zy + 0.5, 0.5, 0.5);
        ctx.fillRect(zx, zy + 1, 1.5, 0.5);
        ctx.globalAlpha = 1;
      }
    }
  }

  private drawJump(ctx: CanvasRenderingContext2D, j: Jump): void {
    const T = 0.62;
    if (j.t > T) return;
    const k = j.t / T;
    const x = j.x + j.dir * 10 * k;
    const y = j.y - Math.sin(k * Math.PI) * 9;
    const f = k < 0.38 ? 0 : k < 0.62 ? 1 : 2;
    const img = fishArt(f);
    ctx.save();
    ctx.translate(Math.round(x * 2) / 2, Math.round(y * 2) / 2);
    if (j.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -3.5, -3);
    ctx.restore();
    // droplets shed on the way up
    if (k < 0.45) {
      ctx.fillStyle = '#e8f6ff';
      ctx.fillRect(Math.round((x - j.dir * 3) * 2) / 2, Math.round((y + 3) * 2) / 2, 0.5, 0.5);
      ctx.fillRect(Math.round((x - j.dir * 5) * 2) / 2, Math.round((y + 5) * 2) / 2, 0.5, 0.5);
    }
  }

  private drawMoths(ctx: CanvasRenderingContext2D, t: number): void {
    for (const m of this.moths) {
      const x = Math.round((m.cx + Math.cos(m.a) * m.r) * 2) / 2;
      const y = Math.round((m.cy + Math.sin(m.a * 1.3) * m.r * 0.55 + Math.sin(m.ph * 3) * 1.5) * 2) / 2;
      const open = Math.sin(t * 38 + m.ph * 7) > 0;
      // Dusty pale wings catching the lamplight, a darker body.
      ctx.fillStyle = '#fff4dc';
      if (open) {
        ctx.fillRect(x - 1.5, y - 0.5, 1.5, 1);
        ctx.fillRect(x + 0.5, y - 0.5, 1.5, 1);
        ctx.fillStyle = '#e8d4b0';
        ctx.fillRect(x - 1, y + 0.5, 1, 0.5);
        ctx.fillRect(x + 0.5, y + 0.5, 1, 0.5);
      } else {
        ctx.fillRect(x - 0.5, y - 1, 0.5, 1);
        ctx.fillRect(x + 0.5, y - 1, 0.5, 1);
      }
      ctx.fillStyle = '#8a7660';
      ctx.fillRect(x, y - 0.5, 0.5, 1.5);
    }
  }
}
