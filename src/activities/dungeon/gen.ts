/**
 * Procedural Dungeon floors. Pure and deterministic: the same (floor, day,
 * seed) always builds the same room, and nothing here touches the DOM or the
 * live game state, so tests can generate hundreds of floors.
 *
 * Every placement is validated so the room stays fully connected: each solid
 * thing (equipment, props) is only kept if every tile that was reachable from
 * the entry before it was placed is still reachable afterwards. That makes all
 * equipment, the hidden trapdoor, the elevator and ghosts reachable by
 * construction (see tests/dungeon-gen.test.ts).
 */
import { hashString, Rng } from '../../core/rng';
import { eraFor, GOLDEN_FLOOR, isElevatorFloor, NODES, type DecorKind, type EraId, type NodeKind } from './eras';

export const T_VOID = 0;
export const T_FLOOR = 1;
export const T_WALL = 2;

export interface Pt {
  x: number;
  y: number;
}

export interface NodeSpec {
  id: string;
  kind: NodeKind;
  tx: number;
  ty: number;
  /** Footprint width in tiles (height is 1). */
  w: number;
  /** Reps to finish it (a good hit = 2 reps, perfect = 3, sloppy = 1). */
  hp: number;
  weight: number;
  /** Energy for the whole set at a steady pace. */
  cost: number;
  seed: number;
}

export interface PropSpec {
  kind: DecorKind;
  tx: number;
  ty: number;
  seed: number;
}

/** A slot on a wall face for era decoration (posters, mirrors, lockers...). */
export interface WallSlot {
  tx: number;
  /** Tile row of the lowest wall-face row above the floor. */
  ty: number;
  w: number;
  seed: number;
}

/** Flat floor decoration (mats, rugs, sawdust rings, puddles). */
export interface FlatSpec {
  tx: number;
  ty: number;
  w: number;
  h: number;
  seed: number;
}

export interface GhostSpawn {
  tx: number;
  ty: number;
  /** Seeded pick used to choose the ghost's identity. */
  pick: number;
}

export interface FloorPlan {
  floor: number;
  day: number;
  seed: number;
  eraId: EraId;
  encore: number;
  w: number;
  h: number;
  tiles: Uint8Array;
  /** Where you land (and the way back up). */
  entry: Pt;
  up: 'stairs' | 'rope';
  /** Left tile of a two-tile freight elevator door set in the top wall (its floor is at y + 1). */
  elevator: Pt | null;
  nodes: NodeSpec[];
  props: PropSpec[];
  wall: WallSlot[];
  flats: FlatSpec[];
  torches: Pt[];
  ghosts: GhostSpawn[];
  /** Node hiding the trapdoor (null on the Golden Ring). */
  trapNode: string | null;
  /** Where the trapdoor appears if you work enough equipment first. */
  trapFallback: Pt;
  /** Equipment you must finish before the fallback trapdoor opens. */
  revealAfter: number;
  golden: null | { ring: { x: number; y: number; w: number; h: number }; pedestal: Pt };
}

export function tileAt(p: FloorPlan, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= p.w || y >= p.h) return T_VOID;
  return p.tiles[y * p.w + x];
}

/** 1 = not walkable: walls, void, equipment that is still standing, props. */
export function blockedGrid(p: FloorPlan, gone: ReadonlySet<string> = new Set()): Uint8Array {
  const b = new Uint8Array(p.w * p.h);
  for (let i = 0; i < b.length; i++) b[i] = p.tiles[i] === T_FLOOR ? 0 : 1;
  for (const n of p.nodes) if (!gone.has(n.id)) for (let k = 0; k < n.w; k++) b[n.ty * p.w + n.tx + k] = 1;
  for (const pr of p.props) b[pr.ty * p.w + pr.tx] = 1;
  return b;
}

/** 4-way BFS distances from a tile (-1 = unreachable). */
export function distances(w: number, h: number, blocked: Uint8Array, from: Pt): Int16Array {
  const d = new Int16Array(w * h).fill(-1);
  if (from.x < 0 || from.y < 0 || from.x >= w || from.y >= h || blocked[from.y * w + from.x]) return d;
  const q = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  q[tail++] = from.y * w + from.x;
  d[from.y * w + from.x] = 0;
  while (head < tail) {
    const i = q[head++];
    const x = i % w;
    const y = (i - x) / w;
    const nd = d[i] + 1;
    if (x > 0 && !blocked[i - 1] && d[i - 1] < 0) (d[i - 1] = nd), (q[tail++] = i - 1);
    if (x < w - 1 && !blocked[i + 1] && d[i + 1] < 0) (d[i + 1] = nd), (q[tail++] = i + 1);
    if (y > 0 && !blocked[i - w] && d[i - w] < 0) (d[i - w] = nd), (q[tail++] = i - w);
    if (y < h - 1 && !blocked[i + w] && d[i + w] < 0) (d[i + w] = nd), (q[tail++] = i + w);
  }
  return d;
}

/** Shortest 4-way distance to stand next to a footprint (-1 if nowhere). */
export function standDistance(p: FloorPlan, dist: Int16Array, tx: number, ty: number, w: number): number {
  let best = -1;
  const consider = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
    const v = dist[y * p.w + x];
    if (v >= 0 && (best < 0 || v < best)) best = v;
  };
  for (let k = 0; k < w; k++) {
    consider(tx + k, ty - 1);
    consider(tx + k, ty + 1);
  }
  consider(tx - 1, ty);
  consider(tx + w, ty);
  return best;
}

function weighted<T extends string>(rng: Rng, table: Partial<Record<T, number>>): T {
  const keys = Object.keys(table) as T[];
  return rng.weighted(keys, (k) => table[k] ?? 0);
}

/** Generate one floor. Deterministic per (floor, day, seed). */
export function generateFloor(floor: number, day: number, seed = 0): FloorPlan {
  floor = Math.max(1, Math.floor(floor));
  const rng = new Rng(hashString(`turnbuckle-dungeon|${seed}|${floor}|${day}`));
  if (floor === GOLDEN_FLOOR) return goldenRing(day, seed, rng);
  const { era, encore } = eraFor(floor);
  const W = rng.int(22, 30);
  const H = rng.int(14, 18);
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const TOP = 3; // the top wall is three tiles tall (a face you can decorate)
  for (let y = TOP; y < H - 1; y++) for (let x = 1; x < W - 1; x++) tiles[y * W + x] = T_FLOOR;

  // Notched corners so rooms aren't all plain boxes.
  const corners = rng.shuffle(['tl', 'tr', 'bl', 'br']);
  const notches = rng.chance(0.7) ? (rng.chance(0.4) ? 2 : 1) : 0;
  for (let i = 0; i < notches; i++) {
    const c = corners[i];
    const nw = rng.int(3, 6);
    const nh = rng.int(2, 3);
    const x0 = c[1] === 'l' ? 1 : W - 1 - nw;
    const y0 = c[0] === 't' ? TOP : H - 1 - nh;
    for (let y = y0; y < y0 + nh; y++) for (let x = x0; x < x0 + nw; x++) tiles[y * W + x] = T_WALL;
  }

  const plan: FloorPlan = {
    floor, day, seed, eraId: era.id, encore, w: W, h: H, tiles,
    entry: { x: 0, y: 0 }, up: floor === 1 ? 'stairs' : 'rope', elevator: null,
    nodes: [], props: [], wall: [], flats: [], torches: [], ghosts: [],
    trapNode: null, trapFallback: { x: 0, y: 0 }, revealAfter: 0, golden: null,
  };
  const isFloor = (x: number, y: number) => tileAt(plan, x, y) === T_FLOOR;
  /** Row of the first floor tile in a column (the wall face sits just above it). */
  const faceY = (x: number) => {
    for (let y = 0; y < H; y++) if (isFloor(x, y)) return y;
    return -1;
  };
  const straightTop = (x: number) => faceY(x) === TOP;

  const reserved = new Uint8Array(W * H);
  const reserve = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < W && y < H) reserved[y * W + x] = 1;
  };

  // ---- entry
  if (plan.up === 'stairs') {
    const cols: number[] = [];
    for (let x = 3; x < W - 3; x++) if (straightTop(x - 1) && straightTop(x) && straightTop(x + 1)) cols.push(x);
    const x = cols.length ? rng.pick(cols) : Math.floor(W / 2);
    plan.entry = { x, y: TOP };
  } else {
    const opts: Pt[] = [];
    for (let y = TOP + 1; y < H - 3; y++) for (let x = 3; x < W - 3; x++) {
      let ok = true;
      for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) if (!isFloor(x + dx, y + dy)) ok = false;
      if (ok) opts.push({ x, y });
    }
    plan.entry = rng.pick(opts);
  }
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) reserve(plan.entry.x + dx, plan.entry.y + dy);
  reserve(plan.entry.x, plan.entry.y + 2);

  // ---- freight elevator (every five floors)
  if (isElevatorFloor(floor)) {
    const cols: number[] = [];
    for (let x = 2; x < W - 3; x++) {
      if (!straightTop(x) || !straightTop(x + 1)) continue;
      if (plan.up === 'stairs' && Math.abs(x - plan.entry.x) < 4 && Math.abs(x + 1 - plan.entry.x) < 4) continue;
      if (plan.up === 'stairs' && x <= plan.entry.x + 2 && x + 1 >= plan.entry.x - 2) continue;
      cols.push(x);
    }
    const x = cols.length ? rng.pick(cols) : 2;
    plan.elevator = { x, y: TOP - 1 };
    for (const dx of [0, 1]) {
      reserve(x + dx, TOP);
      reserve(x + dx, TOP + 1);
    }
  }

  let dist = distances(W, H, blockedGrid(plan), plan.entry);
  let maxD = 0;
  for (const v of dist) if (v > maxD) maxD = v;

  // ---- trapdoor fallback spot: far from the entry, kept clear
  {
    const far: Pt[] = [];
    for (let y = TOP + 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const v = dist[y * W + x];
      if (v >= maxD * 0.55 && !reserved[y * W + x]) far.push({ x, y });
    }
    plan.trapFallback = far.length ? rng.pick(far) : { x: W - 3, y: H - 3 };
    reserve(plan.trapFallback.x, plan.trapFallback.y);
  }

  // ---- connectivity-preserving placement
  const reachCount = (d: Int16Array) => {
    let n = 0;
    for (const v of d) if (v >= 0) n++;
    return n;
  };
  let reach = reachCount(dist);
  const canUse = (x: number, y: number) => isFloor(x, y) && !reserved[y * W + x] && dist[y * W + x] >= 0;
  /** Try to make tiles solid; keeps them only if nothing else becomes unreachable. */
  const tryPlace = (cells: Pt[], commit: () => void): boolean => {
    for (const c of cells) if (!canUse(c.x, c.y)) return false;
    commit();
    const nd = distances(W, H, blockedGrid(plan), plan.entry);
    if (reachCount(nd) !== reach - cells.length) return false;
    // Every piece of equipment must still have a free tile to stand on next to it.
    for (const n of plan.nodes) if (standDistance(plan, nd, n.tx, n.ty, n.w) < 0) return false;
    dist = nd;
    reach -= cells.length;
    return true;
  };

  // ---- solid props (benches along walls, barrels, pillars)
  const nearWall = (x: number, y: number) => !isFloor(x - 1, y) || !isFloor(x + 1, y) || !isFloor(x, y - 1) || !isFloor(x, y + 1);
  const propCount = rng.int(4, 7);
  for (let i = 0, tries = 0; i < propCount && tries < 60; tries++) {
    const kind = rng.pick(era.decor);
    const x = rng.int(1, W - 2);
    const y = rng.int(TOP, H - 2);
    const pillar = kind === 'pillar';
    if (pillar ? nearWall(x, y) || y < TOP + 2 : !nearWall(x, y)) continue;
    if (pillar && plan.props.some((p) => Math.abs(p.tx - x) + Math.abs(p.ty - y) < 4)) continue;
    const spec: PropSpec = { kind, tx: x, ty: y, seed: rng.int(0, 1e6) };
    if (tryPlace([{ x, y }], () => plan.props.push(spec))) i++;
    else if (plan.props[plan.props.length - 1] === spec) plan.props.pop();
  }

  // ---- equipment, in gym-like rows and singles
  let floorTiles = 0;
  for (const t of tiles) if (t === T_FLOOR) floorTiles++;
  const target = Math.max(10, Math.min(16, Math.round(floorTiles / 20)));
  let made = 0;
  const pickKind = (): NodeKind => weighted(rng, era.nodes);
  const addNode = (kind: NodeKind, x: number, y: number): boolean => {
    const d = NODES[kind];
    const cells: Pt[] = [];
    for (let k = 0; k < d.w; k++) cells.push({ x: x + k, y });
    // Leave the row right under the top wall mostly clear so wall art reads.
    if (y <= faceY(x) && rng.chance(0.7)) return false;
    const spec: NodeSpec = { id: `n${made}`, kind, tx: x, ty: y, w: d.w, hp: d.weight * 2, weight: d.weight, cost: d.cost, seed: rng.int(0, 1e6) };
    const ok = tryPlace(cells, () => plan.nodes.push(spec));
    if (!ok) {
      if (plan.nodes[plan.nodes.length - 1] === spec) plan.nodes.pop();
      return false;
    }
    made++;
    return true;
  };
  for (let tries = 0; made < target && tries < 400; tries++) {
    const pattern = rng.pick(['row', 'row', 'pair', 'single', 'single', 'column'] as const);
    const x = rng.int(2, W - 3);
    const y = rng.int(TOP, H - 2);
    if (pattern === 'single') addNode(pickKind(), x, y);
    else {
      const n = pattern === 'pair' ? 2 : rng.int(2, 4);
      const same = rng.chance(0.5);
      const k0 = pickKind();
      let cx = x;
      let cy = y;
      for (let i = 0; i < n && made < target; i++) {
        const kind = same ? k0 : pickKind();
        if (addNode(kind, cx, cy)) {
          if (pattern === 'column') cy += 2;
          else cx += NODES[kind].w + 1;
        } else break;
      }
    }
  }

  // ---- the trapdoor hides under one piece of equipment, far from the entry
  dist = distances(W, H, blockedGrid(plan), plan.entry);
  if (plan.nodes.length) {
    const t = rng.weighted(plan.nodes, (n) => Math.pow(Math.max(1, standDistance(plan, dist, n.tx, n.ty, n.w)), 1.5));
    plan.trapNode = t.id;
  }
  plan.revealAfter = Math.max(3, Math.min(plan.nodes.length, Math.round(plan.nodes.length * (0.5 + rng.next() * 0.2))));

  // ---- ghosts (1–3), not right on top of the entry
  const ghostCount = 1 + (rng.chance(0.55) ? 1 : 0) + (rng.chance(0.25) ? 1 : 0);
  placeGhosts(plan, rng, dist, ghostCount);

  // ---- light and decoration along the top wall faces
  decorateWalls(plan, rng);

  // ---- flat floor decoration (mats, rugs, sawdust rings)
  const flatCount = rng.int(1, 3);
  for (let i = 0, tries = 0; i < flatCount && tries < 30; tries++) {
    const w = rng.int(3, 6);
    const h = rng.int(2, 3);
    const x = rng.int(1, W - 1 - w);
    const y = rng.int(TOP, H - 1 - h);
    let ok = true;
    for (let yy = y; yy < y + h && ok; yy++) for (let xx = x; xx < x + w; xx++) if (!isFloor(xx, yy)) ok = false;
    if (!ok || plan.flats.some((f) => x < f.tx + f.w + 1 && x + w + 1 > f.tx && y < f.ty + f.h + 1 && y + h + 1 > f.ty)) continue;
    plan.flats.push({ tx: x, ty: y, w, h, seed: rng.int(0, 1e6) });
    i++;
  }
  return plan;
}

function placeGhosts(plan: FloorPlan, rng: Rng, dist: Int16Array, n: number): void {
  const blocked = blockedGrid(plan);
  const opts: Pt[] = [];
  for (let y = 0; y < plan.h; y++) for (let x = 0; x < plan.w; x++) {
    const i = y * plan.w + x;
    if (!blocked[i] && dist[i] >= 4) opts.push({ x, y });
  }
  rng.shuffle(opts);
  for (const o of opts) {
    if (plan.ghosts.length >= n) break;
    if (plan.ghosts.some((g) => Math.abs(g.tx - o.x) + Math.abs(g.ty - o.y) < 6)) continue;
    plan.ghosts.push({ tx: o.x, ty: o.y, pick: rng.int(0, 1e6) });
  }
}

function decorateWalls(plan: FloorPlan, rng: Rng): void {
  const { w: W } = plan;
  const used = new Uint8Array(W);
  const faceY = (x: number) => {
    for (let y = 0; y < plan.h; y++) if (tileAt(plan, x, y) === T_FLOOR) return y;
    return -1;
  };
  // Stairs and elevator take wall space.
  if (plan.up === 'stairs') for (let dx = -1; dx <= 1; dx++) used[plan.entry.x + dx] = 1;
  if (plan.elevator) for (let dx = -1; dx <= 2; dx++) if (plan.elevator.x + dx >= 0) used[plan.elevator.x + dx] = 1;
  // Torches every 4–6 columns.
  let x = rng.int(1, 3);
  while (x < W - 1) {
    const fy = faceY(x);
    if (fy > 0 && !used[x] && tileAt(plan, x, fy - 1) === T_WALL) {
      plan.torches.push({ x, y: fy - 1 });
      used[x] = 1;
      x += rng.int(4, 6);
    } else x++;
  }
  // Decoration slots in between (1–2 tiles wide on a level stretch of wall).
  for (let x0 = 1; x0 < W - 1; x0++) {
    if (used[x0]) continue;
    const fy = faceY(x0);
    if (fy <= 0) continue;
    const w = rng.chance(0.45) && x0 + 1 < W - 1 && !used[x0 + 1] && faceY(x0 + 1) === fy ? 2 : 1;
    if (rng.chance(0.62)) {
      plan.wall.push({ tx: x0, ty: fy - 1, w, seed: rng.int(0, 1e6) });
      for (let k = 0; k < w; k++) used[x0 + k] = 1;
      x0 += w;
    }
  }
}

/** Floor 30: the Golden Ring, a hand-built arena with the Golden Belt on a pedestal. */
function goldenRing(day: number, seed: number, rng: Rng): FloorPlan {
  const W = 30;
  const H = 20;
  const TOP = 3;
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  for (let y = TOP; y < H - 1; y++) for (let x = 1; x < W - 1; x++) tiles[y * W + x] = T_FLOOR;
  const ring = { x: 10, y: 7, w: 9, h: 6 };
  const plan: FloorPlan = {
    floor: GOLDEN_FLOOR, day, seed, eraId: 'haunted', encore: 0, w: W, h: H, tiles,
    entry: { x: 14, y: 17 }, up: 'rope', elevator: { x: 3, y: TOP - 1 },
    nodes: [], props: [], wall: [], flats: [], torches: [], ghosts: [],
    trapNode: null, trapFallback: { x: 24, y: 15 }, revealAfter: 999,
    golden: { ring, pedestal: { x: 14, y: 9 } },
  };
  // Ring posts and the pedestal are solid; the ring canvas is walkable.
  for (const [x, y] of [[ring.x, ring.y], [ring.x + ring.w - 1, ring.y], [ring.x, ring.y + ring.h - 1], [ring.x + ring.w - 1, ring.y + ring.h - 1]]) plan.props.push({ kind: 'pillar', tx: x, ty: y, seed: 30 });
  plan.props.push({ kind: 'pedestal', tx: 14, ty: 9, seed: 31 });
  const gilded: Pt[] = [{ x: 4, y: 8 }, { x: 4, y: 13 }, { x: 25, y: 8 }, { x: 25, y: 13 }, { x: 7, y: 16 }, { x: 21, y: 16 }];
  gilded.forEach((p, i) => plan.nodes.push({ id: `n${i}`, kind: 'gilded-kettlebell', tx: p.x, ty: p.y, w: 1, hp: 4, weight: 2, cost: 3, seed: 3000 + i }));
  plan.props.push({ kind: 'candelabra', tx: 7, ty: 5, seed: 1 }, { kind: 'candelabra', tx: 22, ty: 5, seed: 2 });
  const dist = distances(W, H, blockedGrid(plan), plan.entry);
  placeGhosts(plan, rng, dist, 2);
  decorateWalls(plan, rng);
  return plan;
}
