/**
 * THE DUNGEON: the game's mining equivalent. Work phantom gym equipment with a
 * one-tap timing bar, collect loot, find the trapdoor, go deeper. Ghost
 * wrestlers drift around offering spars; a freight elevator every five floors
 * saves a checkpoint; the Golden Belt waits on floor 30.
 */
import { audio } from '../../audio';
import { game } from '../../core/game';
import type { Scene } from '../../core/scene';
import { G, addItem, setFlag, skillLevel, type Dir } from '../../core/state';
import { sting } from '../../core/sting';
import { absDay, DAY_END } from '../../core/time';
import { Rng } from '../../core/rng';
import { item, ITEMS } from '../../data/items';
import { drawCharacter, type Pose } from '../../gfx/characters';
import { iconFor } from '../../gfx/icons';
import '../../gfx/world';
import { STARTER_DECK, rewardPool } from '../../match/cards';
import { MatchScene } from '../../match/scene';
import type { MatchResult } from '../../match/types';
import { choose, narrate, say, toast, type Speaker } from '../../ui/dialog';
import { el, uiRoot } from '../../ui/dom';
import { Actor } from '../../world/actor';
import { GameMap } from '../../world/map';
import { findPath } from '../../world/pathfind';
import type { MapDef, MapObject } from '../../world/types';
import { beltSprite, bakeRoom, eraLook, nodeSprite, propSprite, ropeLadder, textSprite, trapdoorSprite, type Built } from './art';
import { ERAS, isElevatorFloor, NODES, eraFor } from './eras';
import { generateFloor, T_FLOOR, tileAt, type FloorPlan, type NodeSpec, type Pt } from './gen';
import { drawGhost, ERA_LINES, ghostFor, ghostPortrait, timekeeper, type GhostDef } from './ghosts';
import { DungeonHud } from './hud';
import { finishXp, hitXp, rollNodeLoot, rollSparBundle, swingEnergy, swingReps, type Drop } from './loot';
import { dungeonSave, todayState } from './save';
import { gradeAt, markerAt, timingFor, type Timing } from './timing';

export type ExitReason = 'leave' | 'carried' | 'late';
export type Arrival = 'stairs' | 'rope' | 'elevator' | 'trapdoor';

const TILE = 16;
const GHOST_TINT = '#7affd4';

interface RtNode {
  spec: NodeSpec;
  hp: number;
  x: number;
  y: number;
  gone: boolean;
  flash: number;
  squash: number;
  wob: number;
  perfects: number;
  swings: number;
  obj: MapObject;
  spr: Built;
}

interface RtGhost {
  def: GhostDef;
  x: number;
  y: number;
  hx: number;
  hy: number;
  gx: number;
  gy: number;
  facing: Dir;
  wait: number;
  alpha: number;
  leaving: boolean;
  noSpar?: boolean;
}

interface Part {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  grav: number;
  add: boolean;
  ring?: boolean;
}

interface Pop {
  img: HTMLCanvasElement;
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
}

interface Fly {
  id: string;
  img: HTMLCanvasElement;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  t: number;
}

interface Work {
  node: RtNode;
  tm: Timing;
  t: number;
  phase: 'windup' | 'sweep' | 'recover';
  grade: 0 | 1 | 2 | -1;
  rt: number;
}

const ERA_DUST: Record<string, string[]> = {
  carnival: ['#e8c890', '#f2e2c4', '#c99a62'],
  territory: ['#f6f6f6', '#e8dcc0', '#d09a5a'],
  boxing: ['#f6f6f6', '#c8c4dc', '#9ad8f0'],
  aerobics: ['#ff9ad8', '#9af0ff', '#f4d860'],
  garage: ['#c8c4d0', '#ffe070', '#ff5d8f'],
  haunted: ['#9affd0', '#c8fff0', '#7affd4'],
};

/** Make sure the Golden Belt is a real item even before data/items.ts lists it. */
export function ensureBeltItem(): void {
  if (!ITEMS['golden-belt']) {
    ITEMS['golden-belt'] = {
      id: 'golden-belt',
      name: 'The Golden Belt',
      desc: 'The legend at the bottom of the Dungeon. Hundreds of names are scratched into the back plate, and now yours is one of them.',
      cat: 'key',
      price: 0,
      icon: { shape: 'belt', color: '#f4b63f', accent: '#8a4a2a' },
    };
  }
}

export class DungeonScene implements Scene {
  floor = 1;
  plan!: FloorPlan;
  private map!: GameMap;
  private ground!: HTMLCanvasElement;
  player: Actor;
  private nodes: RtNode[] = [];
  private props: { x: number; y: number; spr: Built; kind: string }[] = [];
  private ghosts: RtGhost[] = [];
  private trap = { x: 0, y: 0, revealed: false, open: 0 };
  private cam = { x: 0, y: 0 };
  private shake = 0;
  private hitstop = 0;
  private parts: Part[] = [];
  private pops: Pop[] = [];
  private flies: Fly[] = [];
  private motes: { x: number; y: number; s: number; p: number }[] = [];
  private work: Work | null = null;
  private busy = false;
  private leaving = false;
  private fall = 0; // >0 while dropping in from above
  private sink = 0; // >0 while dropping through the trapdoor
  private carry: { t: number; ghost: RtGhost; reason: ExitReason } | null = null;
  private hud: DungeonHud;
  private lightCanvas = document.createElement('canvas');
  private vignette: HTMLCanvasElement | null = null;
  private streak = 0;
  private stepT = 0;
  private rng = new Rng((Date.now() ^ 0x5eed) >>> 0);
  private target: { kind: 'node'; n: RtNode } | { kind: 'ghost'; g: RtGhost } | { kind: 'trap' } | { kind: 'up' } | { kind: 'elevator' } | { kind: 'belt' } | null = null;
  private celebrate = 0;
  private flashWhite = 0;

  constructor(startFloor: number, arrival: Arrival, private onDone: (reason: ExitReason, overlay: HTMLElement) => void) {
    ensureBeltItem();
    this.player = new Actor('player', G.player.look, 0, 0);
    this.player.speed = 74;
    this.hud = new DungeonHud(() => this.pressAction(), () => this.openMenu());
    for (let i = 0; i < 46; i++) this.motes.push({ x: Math.random() * 600, y: Math.random() * 400, s: 0.2 + Math.random() * 0.6, p: Math.random() * 10 });
    this.loadFloor(startFloor, arrival);
  }

  // ------------------------------------------------------------ lifecycle

  enter(): void {
    audio.music('dungeon');
    audio.crowd(0.08);
  }
  pause(): void {
    this.hud.show(false);
    audio.crowd(0);
  }
  resume(): void {
    this.hud.show(true);
    this.player.look = G.player.look;
    audio.music('dungeon');
    audio.crowd(0.08);
  }
  exit(): void {
    this.hud.destroy();
    audio.crowd(0);
  }

  // ------------------------------------------------------------ floors

  private day(): number {
    return absDay();
  }

  loadFloor(floor: number, arrival: Arrival): void {
    this.floor = floor;
    const save = dungeonSave();
    const today = todayState(this.day());
    const plan = generateFloor(floor, this.day(), G.seed);
    this.plan = plan;
    const gone = new Set(today.gone[String(floor)] ?? []);
    // GameMap gives us collision and pathfinding.
    const ground = [];
    for (let y = 0; y < plan.h; y++) {
      let r = '';
      for (let x = 0; x < plan.w; x++) r += plan.tiles[y * plan.w + x] === T_FLOOR ? '.' : '#';
      ground.push(r);
    }
    const objects: MapDef['objects'] = [];
    for (const n of plan.nodes) objects.push({ kind: 'dg-node', id: n.id, x: n.tx + n.w / 2, y: n.ty + 1 - 1 / 16, props: { solid: { x: -n.w * 8 + 1, y: -15, w: n.w * 16 - 2, h: 14 } } });
    plan.props.forEach((p, i) => objects.push({ kind: 'dg-prop', id: `p${i}`, x: p.tx + 0.5, y: p.ty + 1 - 1 / 16, props: { solid: { x: -6, y: -14, w: 12, h: 13 } } }));
    const def: MapDef = { id: `dungeon-${floor}`, name: `Floor ${floor}`, ground, legend: { '.': 'dungeon', '#': 'wall-dungeon' }, objects, warps: [], indoor: true };
    this.map = new GameMap(def);
    this.ground = bakeRoom(plan);
    this.nodes = plan.nodes.map((spec) => {
      const obj = this.map.objectById(spec.id)!;
      const isGone = gone.has(spec.id);
      obj.hidden = isGone;
      return { spec, hp: spec.hp, x: (spec.tx + spec.w / 2) * TILE, y: (spec.ty + 1) * TILE - 1, gone: isGone, flash: 0, squash: 0, wob: 0, perfects: 0, swings: 0, obj, spr: nodeSprite(spec.kind) };
    });
    this.map.rebuildBlocked();
    this.props = plan.props.map((p) => ({ x: (p.tx + 0.5) * TILE, y: (p.ty + 1) * TILE - 1, spr: propSprite(p.kind, plan.eraId, p.seed), kind: p.kind }));
    // trapdoor
    const trapNode = plan.nodes.find((n) => n.id === plan.trapNode);
    const revealed = today.revealed.includes(floor);
    if (trapNode && gone.has(trapNode.id)) this.trap = { x: trapNode.tx, y: trapNode.ty, revealed: true, open: 1 };
    else if (revealed || (plan.golden && save.goldenBelt)) this.trap = { x: plan.trapFallback.x, y: plan.trapFallback.y, revealed: true, open: 1 };
    else this.trap = { x: plan.trapFallback.x, y: plan.trapFallback.y, revealed: false, open: 0 };
    // ghosts
    const taken = new Set<string>();
    const { era } = eraFor(floor);
    this.ghosts = plan.ghosts.map((s) => {
      const d = ghostFor(plan.eraId, era.year, s.pick, taken);
      const x = (s.tx + 0.5) * TILE;
      const y = (s.ty + 1) * TILE - 3;
      return { def: d, x, y, hx: x, hy: y, gx: x, gy: y, facing: 'down' as Dir, wait: Math.random() * 3, alpha: 0, leaving: false };
    });
    if (plan.golden) {
      const tk = timekeeper();
      this.ghosts.unshift({ def: tk, x: 14.5 * TILE, y: 13.6 * TILE, hx: 14.5 * TILE, hy: 13.6 * TILE, gx: 14.5 * TILE, gy: 13.6 * TILE, facing: 'down', wait: 99, alpha: 0, leaving: false, noSpar: true });
    }
    // player position
    const p = this.player;
    p.stop();
    if (arrival === 'elevator' && plan.elevator) {
      p.x = (plan.elevator.x + 1) * TILE;
      p.y = (plan.elevator.y + 2) * TILE - 3;
      p.facing = 'down';
    } else {
      p.x = plan.entry.x * TILE + 8;
      p.y = plan.entry.y * TILE + 13 + (plan.up === 'stairs' ? 0 : TILE);
      p.facing = 'down';
    }
    this.fall = arrival === 'trapdoor' ? 0.55 : 0;
    this.sink = 0;
    this.work = null;
    this.parts = [];
    this.pops = [];
    this.flies = [];
    this.target = null;
    this.snapCamera();
    // progress
    save.deepest = Math.max(save.deepest, floor);
    this.hud.setFloor(floor);
    this.hud.titleCard(floor);
    this.updateHint();
    if (isElevatorFloor(floor) && save.elevator < floor) {
      save.elevator = floor;
      setTimeout(() => {
        toast(`Freight elevator found! Floor ${floor} checkpoint unlocked.`);
        audio.sfx('door');
        sting('item-get');
      }, 1200);
    }
    if (arrival !== 'trapdoor') void this.arrivalStory();
  }

  private async arrivalStory(): Promise<void> {
    const save = dungeonSave();
    const id = this.plan.golden ? 'golden' : this.plan.eraId;
    if (save.erasSeen.includes(id)) return;
    save.erasSeen.push(id);
    await this.wait(0.9);
    if (this.plan.golden) {
      await narrate(
        'The air turns gold. Rows and rows of ghostly fans fill the bleachers, and every one of them goes quiet as you walk in.',
        'In the middle of it all, a ring with golden ropes. And on a pedestal in the centre of the ring, something catches the light like a sunrise.',
      );
    } else if (id !== 'carnival' || this.floor !== 1) {
      await narrate(ERAS[this.plan.eraId].arrive);
    }
  }

  private wait(s: number): Promise<void> {
    return new Promise((r) => setTimeout(r, s * 1000));
  }

  // ------------------------------------------------------------ input

  private get blocked(): boolean {
    return game.blockers > 0 || this.busy || this.leaving || game.scenes.transitioning || this.carry !== null || this.fall > 0 || this.sink > 0;
  }

  private pressAction(): void {
    if (this.work) this.strike();
    else if (!this.blocked) this.interact();
  }

  private openMenu(): void {
    if (this.blocked) return;
    void import('../../ui/menu').then((m) => m.openMenu());
  }

  update(dt: number): void {
    this.hud.update();
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      this.updateFx(dt * 0.15);
      return;
    }
    const inp = game.input;
    if (!this.blocked) {
      // The clock runs while you train. Never let it hit 2 AM down here.
      if (G.time.minutes >= DAY_END - 12) this.startCarry('late');
      else game.clock.update(dt);
      if (this.work) this.updateWork(dt);
      else this.handleMove(dt);
      for (const t of inp.takeTaps()) this.onTap(t.x, t.y);
      if (inp.consume('interact')) this.pressAction();
      if (inp.consume('menu') || inp.consume('cancel')) this.openMenu();
    } else {
      inp.takeTaps();
      if (this.work && !this.busy && game.blockers === 0) this.updateWork(dt);
    }
    if (this.fall > 0) {
      this.fall -= dt;
      if (this.fall <= 0) this.land();
    }
    if (this.sink > 0) {
      this.sink -= dt;
      if (this.sink <= 0) game.scenes.transition(() => this.loadFloor(this.floor + 1, 'trapdoor'));
    }
    if (this.carry) this.updateCarry(dt);
    this.updateGhosts(dt);
    for (const n of this.nodes) {
      n.flash = Math.max(0, n.flash - dt * 5);
      n.squash *= Math.pow(0.0005, dt);
      n.wob *= Math.pow(0.002, dt);
    }
    if (this.trap.revealed && this.trap.open < 1) this.trap.open = Math.min(1, this.trap.open + dt * 2.2);
    this.shake = Math.max(0, this.shake - dt * 14);
    this.flashWhite = Math.max(0, this.flashWhite - dt * 3);
    this.celebrate = Math.max(0, this.celebrate - dt);
    this.updateFx(dt);
    this.updateCamera(dt);
    this.updatePrompt();
  }

  private handleMove(dt: number): void {
    const inp = game.input;
    const p = this.player;
    let vx = 0;
    let vy = 0;
    const kv = inp.moveVector();
    if (kv.x || kv.y) {
      vx = kv.x;
      vy = kv.y;
      p.stop();
    } else if (inp.pointer.down && performance.now() - inp.pointer.startedAt > 220) {
      const sx = p.x - this.cam.x;
      const sy = p.y - 12 - this.cam.y;
      const dx = inp.pointer.x - sx;
      const dy = inp.pointer.y - sy;
      const d = Math.hypot(dx, dy);
      if (d > 6) {
        vx = dx / d;
        vy = dy / d;
        p.stop();
        }
    }
    const run = inp.isHeld('run') ? 1.45 : 1;
    if (vx || vy) {
      const moved = p.move(this.map, vx * p.speed * run * dt, vy * p.speed * run * dt);
      p.moving = moved;
      if (moved) p.walkT += dt * run;
      this.stepSound(dt * run);
    } else if (p.path.length) {
      p.followPath(this.map, dt);
      this.stepSound(dt);
    } else p.moving = false;
    // Stepping onto an open trapdoor drops you through.
    if (this.trap.revealed && this.trap.open >= 1 && Math.floor(p.x / TILE) === this.trap.x && Math.floor((p.y - 3) / TILE) === this.trap.y && (vx || vy || !p.path.length)) this.descend();
  }

  private stepSound(dt: number): void {
    this.stepT += dt;
    if (this.stepT > 0.32) {
      this.stepT = 0;
      audio.sfx('step', { volume: 0.35, pitch: 0.85 + Math.random() * 0.2 });
    }
  }

  private toWorld(sx: number, sy: number): Pt {
    return { x: sx + this.cam.x, y: sy + this.cam.y };
  }

  private onTap(sx: number, sy: number): void {
    if (this.work) {
      this.strike();
      return;
    }
    const wp = this.toWorld(sx, sy);
    for (const g of this.ghosts) {
      if (g.alpha < 0.3) continue;
      if (Math.abs(g.x - wp.x) < 11 && wp.y < g.y + 4 && wp.y > g.y - 34) {
        this.walkThen(Math.floor(g.x / TILE), Math.floor((g.y - 3) / TILE), () => void this.talkGhost(g));
        return;
      }
    }
    for (const n of this.nodes) {
      if (n.gone) continue;
      const w = n.spec.w * 8 + 3;
      if (wp.x > n.x - w && wp.x < n.x + w && wp.y < n.y + 3 && wp.y > n.y - Math.max(18, n.spr.h)) {
        this.walkNextTo(n.spec.tx, n.spec.ty, n.spec.w, () => this.startWork(n));
        return;
      }
    }
    const tx = Math.floor(wp.x / TILE);
    const ty = Math.floor(wp.y / TILE);
    if (this.plan.golden) {
      const pd = this.plan.golden.pedestal;
      if (Math.abs(tx - pd.x) <= 1 && ty >= pd.y - 2 && ty <= pd.y) {
        this.walkNextTo(pd.x, pd.y, 1, () => void this.claimBelt());
        return;
      }
    }
    if (this.trap.revealed && tx === this.trap.x && ty === this.trap.y) {
      if (!this.player.goTo(this.map, tx, ty)) audio.sfx('error', { volume: 0.3 });
      return;
    }
    const el = this.plan.elevator;
    if (el && (tx === el.x || tx === el.x + 1) && ty <= el.y + 1 && ty >= el.y - 1) {
      this.walkThen(el.x, el.y + 1, () => void this.useElevator());
      return;
    }
    const e = this.plan.entry;
    if (Math.abs(tx - e.x) <= 0 && ty <= e.y && ty >= e.y - (this.plan.up === 'stairs' ? 2 : 3)) {
      this.walkThen(e.x, e.y + (this.plan.up === 'stairs' ? 0 : 1), () => void this.useUp());
      return;
    }
    if (!this.player.goTo(this.map, tx, ty)) audio.sfx('error', { volume: 0.3 });
    this.burst(wp.x, wp.y, 4, ['#fff4dc', '#7affd4'], 18, 0, 0.35, false);
  }

  private walkThen(tx: number, ty: number, fn: () => void): void {
    const p = this.player;
    if (Math.hypot(p.tx - tx, p.ty - ty) <= 1.5) {
      p.stop();
      fn();
      return;
    }
    let best: Pt | null = null;
    let bl = Infinity;
    for (const [dx, dy] of [[0, 1], [0, -1], [-1, 0], [1, 0], [0, 0]]) {
      const nx = tx + dx;
      const ny = ty + dy;
      if (nx < 0 || ny < 0 || nx >= this.map.w || ny >= this.map.h || this.map.blocked[ny * this.map.w + nx]) continue;
      const path = findPath(this.map, p.tx, p.ty, nx, ny);
      if (path && path.length < bl) {
        bl = path.length;
        best = { x: nx, y: ny };
      }
    }
    if (!best) return void audio.sfx('error', { volume: 0.3 });
    p.goTo(this.map, best.x, best.y, fn);
  }

  /** Walk to a free tile beside a footprint, then face it and run fn. */
  private walkNextTo(tx: number, ty: number, w: number, fn: () => void): void {
    const p = this.player;
    const cands: { x: number; y: number; f: Dir }[] = [];
    for (let k = 0; k < w; k++) cands.push({ x: tx + k, y: ty + 1, f: 'up' }, { x: tx + k, y: ty - 1, f: 'down' });
    cands.push({ x: tx - 1, y: ty, f: 'right' }, { x: tx + w, y: ty, f: 'left' });
    let best: { x: number; y: number; f: Dir } | null = null;
    let bl = Infinity;
    for (const c of cands) {
      if (c.x < 0 || c.y < 0 || c.x >= this.map.w || c.y >= this.map.h || this.map.blocked[c.y * this.map.w + c.x]) continue;
      const path = findPath(this.map, p.tx, p.ty, c.x, c.y);
      if (path && path.length < bl) {
        bl = path.length;
        best = c;
      }
    }
    if (!best) return void audio.sfx('error', { volume: 0.3 });
    const b = best;
    p.goTo(this.map, b.x, b.y, () => {
      p.facing = b.f;
      fn();
    });
  }

  /** What's in front of the player (or right next to them). */
  private findTarget(): DungeonScene['target'] {
    const p = this.player;
    const dx = p.facing === 'left' ? -1 : p.facing === 'right' ? 1 : 0;
    const dy = p.facing === 'up' ? -1 : p.facing === 'down' ? 1 : 0;
    const fx = p.x + dx * 12;
    const fy = p.y + dy * 12 - 4;
    for (const g of this.ghosts) if (g.alpha > 0.5 && !g.leaving && Math.hypot(g.x - fx, g.y - fy) < 18) return { kind: 'ghost', g };
    let bestN: RtNode | null = null;
    let bd = 99;
    for (const n of this.nodes) {
      if (n.gone) continue;
      const left = n.spec.tx * TILE - 3;
      const right = (n.spec.tx + n.spec.w) * TILE + 3;
      const top = n.spec.ty * TILE - 4;
      const bottom = (n.spec.ty + 1) * TILE + 3;
      const inFront = fx >= left && fx <= right && fy >= top && fy <= bottom;
      const cx = Math.max(left, Math.min(right, p.x));
      const cy = Math.max(top, Math.min(bottom, p.y - 4));
      const d = Math.hypot(cx - p.x, cy - (p.y - 4));
      if (inFront) return { kind: 'node', n };
      if (d < 7 && d < bd) {
        bd = d;
        bestN = n;
      }
    }
    if (bestN) return { kind: 'node', n: bestN };
    const ptx = Math.floor(p.x / TILE);
    const pty = Math.floor((p.y - 3) / TILE);
    if (this.plan.golden && !dungeonSave().goldenBelt) {
      const pd = this.plan.golden.pedestal;
      if (Math.abs(ptx - pd.x) + Math.abs(pty - pd.y) <= 1) return { kind: 'belt' };
    }
    if (this.trap.revealed && Math.abs(ptx - this.trap.x) + Math.abs(pty - this.trap.y) <= 1) return { kind: 'trap' };
    const el = this.plan.elevator;
    if (el && pty === el.y + 1 && (ptx === el.x || ptx === el.x + 1)) return { kind: 'elevator' };
    const e = this.plan.entry;
    if (Math.abs(ptx - e.x) <= (this.plan.up === 'stairs' ? 0 : 1) && Math.abs(pty - e.y) <= (this.plan.up === 'stairs' ? 0 : 1)) return { kind: 'up' };
    return null;
  }

  private updatePrompt(): void {
    const t = this.blocked || this.work ? null : this.findTarget();
    this.target = t;
    let label: string | null = null;
    if (this.work) label = NODES[this.work.node.spec.kind].verb.replace('!', '');
    else if (t?.kind === 'node') label = 'Work';
    else if (t?.kind === 'ghost') label = 'Talk';
    else if (t?.kind === 'trap') label = 'Jump in';
    else if (t?.kind === 'elevator') label = 'Elevator';
    else if (t?.kind === 'up') label = 'Climb out';
    else if (t?.kind === 'belt') label = 'The Belt';
    this.hud.setAction(label);
  }

  interact(): void {
    const t = this.findTarget();
    if (!t) return;
    this.player.stop();
    if (t.kind === 'node') {
      this.player.faceToward(t.n.x, t.n.y - 6);
      this.startWork(t.n);
    } else if (t.kind === 'ghost') void this.talkGhost(t.g);
    else if (t.kind === 'trap') this.descend();
    else if (t.kind === 'elevator') void this.useElevator();
    else if (t.kind === 'up') void this.useUp();
    else if (t.kind === 'belt') void this.claimBelt();
  }

  // ------------------------------------------------------------ working the equipment

  private startWork(n: RtNode): void {
    if (n.gone || this.work || this.blocked) return;
    if (G.player.energy <= 0) {
      this.startCarry('carried');
      return;
    }
    this.player.stop();
    this.player.faceToward(n.x, n.y - 6);
    audio.sfx('equipment', { volume: 0.6 });
    this.work = { node: n, tm: timingFor(this.floor, n.spec.weight, skillLevel('strength'), () => this.rng.next()), t: -0.22, phase: 'windup', grade: -1, rt: 0 };
    game.input.clear();
  }

  private updateWork(dt: number): void {
    const w = this.work!;
    // Walking away cancels the set.
    const kv = game.input.moveVector();
    if ((kv.x || kv.y) && w.phase !== 'sweep') {
      this.work = null;
      return;
    }
    if (w.phase === 'windup') {
      w.t += dt;
      if (w.t >= 0) w.phase = 'sweep';
    } else if (w.phase === 'sweep') {
      w.t += dt;
      if (markerAt(w.t, w.tm.pass) < 0) {
        // Too slow: no rep, no energy, try again.
        this.popText('TOO SLOW', '#c8c4dc', w.node.x, w.node.y - w.node.spr.h - 6, false);
        audio.sfx('whoosh', { volume: 0.4, pitch: 0.7 });
        this.work = null;
      }
    } else {
      w.rt -= dt;
      if (w.rt <= 0) {
        if (w.node.gone || G.player.energy <= 0) {
          this.work = null;
          if (G.player.energy <= 0) this.startCarry('carried');
        } else {
          w.tm = timingFor(this.floor, w.node.spec.weight, skillLevel('strength'), () => this.rng.next());
          w.t = -0.12;
          w.phase = 'windup';
          w.grade = -1;
        }
      }
    }
  }

  private strike(): void {
    const w = this.work;
    if (!w || w.phase !== 'sweep') return;
    const pos = markerAt(w.t, w.tm.pass);
    const grade = gradeAt(pos, w.tm);
    w.grade = grade;
    w.phase = 'recover';
    w.rt = grade === 2 ? 0.42 : 0.34;
    this.hit(w.node, grade);
  }

  private hit(n: RtNode, grade: 0 | 1 | 2): void {
    const def = NODES[n.spec.kind];
    const lvlBefore = skillLevel('strength');
    const cost = swingEnergy(n.spec.cost, n.spec.weight, grade);
    G.player.energy = Math.max(0, G.player.energy - cost);
    const xp = hitXp(this.floor, n.spec.weight, grade);
    G.player.skills.strength += xp;
    n.hp -= swingReps(grade);
    n.swings++;
    if (grade === 2) n.perfects++;
    n.flash = 1;
    n.squash = grade === 2 ? 1.4 : grade === 1 ? 1 : 0.5;
    n.wob = (Math.random() < 0.5 ? -1 : 1) * (grade + 1);
    this.player.pose = def.pose;
    setTimeout(() => (this.player.pose = null), 160);
    const cx = n.x;
    const cy = n.y - Math.min(14, n.spr.h / 2);
    const dust = ERA_DUST[this.plan.eraId];
    if (grade === 2) {
      this.streak++;
      dungeonSave().totals.perfects++;
      this.hitstop = 0.11;
      this.shake = 4.5;
      this.flashWhite = 0.35;
      this.burst(cx, cy, 16, ['#ffe48e', '#fff8d8', '#f4b63f'], 80, 120, 0.6, true);
      this.burst(cx, cy, 10, dust, 50, 140, 0.7, false);
      this.ring(cx, cy, '#ffe48e');
      this.popText('PERFECT!', '#ffe48e', cx, cy - n.spr.h / 2 - 10, true);
      audio.sfx('slam', { pitch: 1.1 });
      audio.sfx('star', { pitch: 1 + Math.min(0.6, this.streak * 0.08) });
      audio.crowdReact('pop', Math.min(1, 0.25 + this.streak * 0.1));
    } else if (grade === 1) {
      this.hitstop = 0.06;
      this.shake = 2.5;
      this.burst(cx, cy, 12, dust, 55, 150, 0.6, false);
      this.popText('GOOD!', '#7affd4', cx, cy - n.spr.h / 2 - 10, true);
      audio.sfx('thud', { pitch: 0.9 + Math.random() * 0.2 });
    } else {
      this.streak = 0;
      this.hitstop = 0.03;
      this.shake = 1;
      this.burst(cx, cy, 5, dust, 30, 150, 0.5, false);
      this.popText('SLOPPY', '#ff9ec0', cx, cy - n.spr.h / 2 - 10, false);
      audio.sfx('whoosh', { volume: 0.6, pitch: 0.8 });
    }
    // sweat
    this.burst(this.player.x, this.player.y - 22, 2 + grade, ['#9ad8f0', '#d8f4ff'], 30, 200, 0.5, false);
    this.popText(`+${xp} STR`, '#fbf0d9', cx + 10, cy - n.spr.h / 2 + 2, false);
    this.hud.setStreak(this.streak);
    if (n.hp <= 0) this.finishSet(n);
    const lvl = skillLevel('strength');
    if (lvl > lvlBefore) {
      sting('level-up');
      toast(`Strength up! You're now level ${lvl}. The sweet spot feels a little wider.`);
      game.bus.emit('skill', { id: 'strength', level: lvl });
    }
  }

  private finishSet(n: RtNode): void {
    n.gone = true;
    n.obj.hidden = true;
    this.map.rebuildBlocked();
    const save = dungeonSave();
    const today = todayState(this.day());
    (today.gone[String(this.floor)] ??= []).push(n.spec.id);
    save.totals.sets++;
    const bonus = finishXp(this.floor, n.spec.weight);
    G.player.skills.strength += bonus;
    // The phantom equipment poofs into ghostlight.
    const cx = n.x;
    const cy = n.y - 8;
    this.burst(cx, cy, 26, ['#7affd4', '#c8fff0', '#9affd0', '#ffffff'], 45, -30, 1.1, true);
    this.burst(cx, cy, 14, ERA_DUST[this.plan.eraId], 70, 120, 0.8, false);
    this.ring(cx, cy, '#7affd4');
    audio.sfx('whoosh', { pitch: 1.3, volume: 0.7 });
    const share = n.perfects / Math.max(1, n.swings);
    const drops = rollNodeLoot(this.floor, n.spec.kind, share, this.streak, () => this.rng.next());
    this.spawnDrops(drops, cx, cy);
    const goneCount = today.gone[String(this.floor)].length;
    if (n.spec.id === this.plan.trapNode && !this.trap.revealed) this.revealTrap(n.spec.tx, n.spec.ty, false);
    else if (!this.trap.revealed && !this.plan.golden && goneCount >= this.plan.revealAfter) this.revealTrap(this.plan.trapFallback.x, this.plan.trapFallback.y, true);
    this.updateHint();
  }

  private spawnDrops(drops: Drop[], x: number, y: number): void {
    for (const d of drops) {
      for (let i = 0; i < d.n; i++) {
        const a = Math.random() * Math.PI * 2;
        this.flies.push({ id: d.id, img: iconFor(d.id), x, y, z: 0, vx: Math.cos(a) * 40, vy: Math.sin(a) * 18, vz: 70 + Math.random() * 40, t: 0 });
      }
      if (d.relic) {
        dungeonSave().totals.relics++;
        setTimeout(() => {
          sting('item-get');
          toast(`A relic! **${item(d.id).name}**. It looks like it's been waiting for you.`, iconFor(d.id));
        }, 500);
      }
    }
  }

  private revealTrap(x: number, y: number, fallback: boolean): void {
    this.trap = { x, y, revealed: true, open: 0 };
    todayState(this.day()).revealed.push(this.floor);
    const px = x * TILE + 8;
    const py = y * TILE + 8;
    this.shake = Math.max(this.shake, 3);
    for (let i = 0; i < 24; i++) this.parts.push({ x: px + (Math.random() - 0.5) * 12, y: py, vx: (Math.random() - 0.5) * 10, vy: -40 - Math.random() * 60, life: 0, max: 0.9 + Math.random() * 0.6, color: i & 1 ? '#ffe48e' : '#f4b63f', size: 1, grav: 0, add: true });
    audio.sfx('door', { pitch: 0.7 });
    setTimeout(() => audio.sfx('star', { pitch: 0.8 }), 180);
    this.popText('TRAPDOOR!', '#ffe48e', px, py - 18, true);
    if (fallback) toast('With a creak, a trapdoor swings open somewhere on this floor.');
    this.updateHint();
  }

  private updateHint(): void {
    const today = todayState(this.day());
    const gone = today.gone[String(this.floor)]?.length ?? 0;
    if (this.plan.golden && !dungeonSave().goldenBelt) this.hud.setHint('The Golden Belt waits in the ring', true);
    else if (this.trap.revealed) this.hud.setHint(this.plan.golden ? '⬇ The Encore floors wait below' : '⬇ Trapdoor open: jump in to go deeper', true);
    else this.hud.setHint(`The trapdoor hides under the equipment · opens for sure in ${Math.max(0, this.plan.revealAfter - gone)} sets`);
  }

  // ------------------------------------------------------------ moving between floors

  private descend(): void {
    if (this.blocked || this.sink > 0) return;
    this.work = null;
    this.player.stop();
    this.player.x = this.trap.x * TILE + 8;
    this.player.y = this.trap.y * TILE + 12;
    this.sink = 0.42;
    audio.sfx('whoosh', { pitch: 0.6 });
  }

  private land(): void {
    this.shake = 4;
    audio.sfx('slam', { volume: 0.8, pitch: 0.8 });
    const p = this.player;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.parts.push({ x: p.x, y: p.y - 1, vx: Math.cos(a) * 50, vy: Math.sin(a) * 18, life: 0, max: 0.45, color: ERA_DUST[this.plan.eraId][i % 3], size: 1, grav: 0, add: false });
    }
    void this.arrivalStory();
  }

  private async useUp(): Promise<void> {
    if (this.blocked) return;
    this.busy = true;
    try {
      const c = await choose(null, this.plan.up === 'stairs' ? 'Take the stairs back up to the locker room?' : 'Climb the rope back up to the locker room?', [
        { label: 'Head up', value: 'yes', style: 'primary' },
        { label: 'Keep training', value: 'no' },
      ], { cancelValue: 'no' });
      if (c === 'yes') this.finish('leave');
    } finally {
      this.busy = false;
    }
  }

  private async useElevator(): Promise<void> {
    if (this.blocked) return;
    this.busy = true;
    try {
      audio.sfx('door');
      const c = await choose(null, `The freight elevator. A brass plate reads FLOOR ${this.floor}. Ride it up to the locker room?`, [
        { label: 'Ride up', value: 'yes', style: 'teal' },
        { label: 'Not yet', value: 'no' },
      ], { cancelValue: 'no' });
      if (c === 'yes') this.finish('leave');
    } finally {
      this.busy = false;
    }
  }

  /** Fade to black and hand control back to the entry module. */
  finish(reason: ExitReason): void {
    if (this.leaving) return;
    this.leaving = true;
    this.work = null;
    const overlay = el('div', 'dg-black');
    overlay.style.opacity = '0';
    uiRoot().append(overlay);
    requestAnimationFrame(() => (overlay.style.opacity = '1'));
    setTimeout(() => this.onDone(reason, overlay), 300);
  }

  // ------------------------------------------------------------ passing out

  startCarry(reason: ExitReason): void {
    if (this.carry || this.leaving) return;
    this.work = null;
    this.player.stop();
    const p = this.player;
    const tmpl = this.ghosts.find((g) => !g.noSpar) ?? null;
    const def = tmpl?.def ?? ghostFor(this.plan.eraId, eraFor(this.floor).era.year, 7, new Set());
    const g: RtGhost = { def, x: p.x - 70, y: p.y, hx: p.x, hy: p.y, gx: p.x - 12, gy: p.y, facing: 'right', wait: 99, alpha: 0, leaving: false, noSpar: true };
    this.ghosts.push(g);
    this.carry = { t: 0, ghost: g, reason };
    audio.sfx('sleep');
    this.popText(reason === 'late' ? 'SO LATE...' : 'ZZZ...', '#c8c4dc', p.x, p.y - 34, false);
  }

  private updateCarry(dt: number): void {
    const c = this.carry!;
    c.t += dt;
    const g = c.ghost;
    const p = this.player;
    g.alpha = Math.min(1, g.alpha + dt * 2);
    if (c.t < 1.3) {
      g.x += (p.x - 12 - g.x) * Math.min(1, dt * 3);
      g.y += (p.y - g.y) * Math.min(1, dt * 3);
    } else if (c.t < 3) {
      // up, up and away
      g.y -= dt * 30;
      p.y -= dt * 30;
      if (Math.random() < 0.5) this.parts.push({ x: p.x + (Math.random() - 0.5) * 10, y: p.y, vx: 0, vy: 20, life: 0, max: 0.8, color: GHOST_TINT, size: 1, grav: 0, add: true });
    } else if (!this.leaving) {
      this.finish(c.reason);
    }
  }

  // ------------------------------------------------------------ ghosts

  private updateGhosts(dt: number): void {
    const p = this.player;
    for (const g of this.ghosts) {
      g.alpha = g.leaving ? Math.max(0, g.alpha - dt * 1.2) : Math.min(1, g.alpha + dt * 0.8);
      if (this.carry?.ghost === g) continue;
      const near = Math.hypot(p.x - g.x, p.y - g.y) < 44;
      if (near && !this.blocked) {
        g.facing = Math.abs(p.x - g.x) > Math.abs(p.y - g.y) ? (p.x > g.x ? 'right' : 'left') : p.y > g.y ? 'down' : 'up';
        continue;
      }
      g.wait -= dt;
      const dx = g.gx - g.x;
      const dy = g.gy - g.y;
      const d = Math.hypot(dx, dy);
      if (d > 1) {
        const s = Math.min(d, 13 * dt);
        g.x += (dx / d) * s;
        g.y += (dy / d) * s;
        g.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      } else if (g.wait <= 0) {
        g.wait = 3 + Math.random() * 4;
        for (let k = 0; k < 8; k++) {
          const tx = Math.floor(g.hx / TILE) + Math.round((Math.random() - 0.5) * 8);
          const ty = Math.floor(g.hy / TILE) + Math.round((Math.random() - 0.5) * 5);
          if (tileAt(this.plan, tx, ty) === T_FLOOR) {
            g.gx = (tx + 0.5) * TILE;
            g.gy = (ty + 1) * TILE - 3;
            break;
          }
        }
      }
    }
    this.ghosts = this.ghosts.filter((g) => !(g.leaving && g.alpha <= 0));
  }

  private speaker(d: GhostDef): Speaker {
    return { name: d.name, sub: d.year, color: '#2f8a80', portrait: () => ghostPortrait(d), portraitBg: '#1e3a3a', voice: 'ghost' };
  }

  private async talkGhost(g: RtGhost): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.player.stop();
    this.player.faceToward(g.x, g.y);
    const sp = this.speaker(g.def);
    const today = todayState(this.day());
    try {
      if (g.def.id === 'ghost-timekeeper') {
        await say(sp, dungeonSave().goldenBelt ? 'Champion. The bell rings a little brighter since you came through.' : g.def.hello, dungeonSave().goldenBelt ? 'Go on and see what is below. Encores are the best part of any show.' : 'The belt is yours if you want it. It always was. Go on up to the pedestal.');
        return;
      }
      const lines = ERA_LINES[g.def.era];
      const first = !today.sparred.includes(g.def.id) && Math.random() < 0.6 ? g.def.hello : lines[Math.floor(Math.random() * lines.length)];
      await say(sp, first);
      if (today.sparred.includes(g.def.id)) {
        await say(sp, "That was a good one today, kid. Come back tomorrow and we'll go again. I'm not going anywhere. Literally.");
        return;
      }
      const c = await choose(sp, 'Fancy a quick spar? Nothing on the line. Just two workers having a go.', [
        { label: 'Lock up! (quick spar)', value: 'spar', style: 'teal', hint: '3★ teaches a move · 4★ earns materials' },
        { label: 'Tell me about the old days', value: 'story' },
        { label: 'Maybe later', value: 'no' },
      ], { cancelValue: 'no' });
      if (c === 'story') await say(sp, lines[Math.floor(Math.random() * lines.length)], 'Lou knows. Ask Lou sometime. He was down here more than anybody.');
      else if (c === 'spar') await this.spar(g, sp);
    } finally {
      this.busy = false;
    }
  }

  private async spar(g: RtGhost, sp: Speaker): Promise<void> {
    const ghostWins = Math.random() < 0.5;
    await say(sp, ghostWins ? `Here's the finish: I go over with the ${g.def.finisher}. You make it look like a million bucks.` : `Here's the finish: you go over. I've been pinned by better... but not since ${g.def.year}.`);
    const p = G.player;
    const deck = p.deck.length >= 8 ? [...p.deck] : [...STARTER_DECK];
    const pool = rewardPool(g.def.style);
    const picks: string[] = [];
    while (picks.length < 3 && picks.length < pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (!picks.includes(c)) picks.push(c);
    }
    const result = await new Promise<{ r: MatchResult; reward: string | null }>((resolve) => {
      let scene: MatchScene | null = null;
      const opts = {
        config: {
          player: {
            id: 'player',
            name: p.persona?.ringName || p.name,
            role: 'face' as const,
            look: p.persona ? p.ringLook : p.look,
            style: 'brawler',
            chemistry: 0,
            finisherName: p.persona?.finisherName || 'Hometown Finish',
            signatureName: p.persona?.signatureName || 'Signature Slam',
            deck,
            gear: [...p.gear],
            maxGas: 30 + skillLevel('strength') * 2,
            ringIq: skillLevel('ringiq'),
          },
          opponent: { id: g.def.id, name: g.def.name, role: 'face' as const, look: g.def.look, style: g.def.style, chemistry: 3, finisherName: g.def.finisher, signatureName: g.def.signature },
          winner: (ghostWins ? 'opponent' : 'player') as 'opponent' | 'player',
          venue: 'dungeon' as const,
          short: true,
          seed: (Date.now() & 0xffff) ^ this.floor,
        },
        intro: { title: 'SPAR!', subtitle: g.def.name },
        // Only a 3★+ spar teaches a move: the choices appear once the result is in.
        get rewardChoices(): string[] | undefined {
          return scene?.m.result && scene.m.result.stars >= 3 ? picks : undefined;
        },
        onDone: (r: MatchResult, reward: string | null) => {
          const back = () => {
            game.scenes.pop();
            resolve({ r, reward });
          };
          // If another fade owns the screen, switch without one rather than hang with `busy` on.
          if (!game.scenes.transition(back)) back();
        },
      };
      scene = new MatchScene(opts);
      if (!game.scenes.transition(() => game.scenes.push(scene!))) game.scenes.push(scene);
    });
    while (game.scenes.transitioning) await this.wait(0.05);
    const { r, reward } = result;
    todayState(this.day()).sparred.push(g.def.id);
    dungeonSave().totals.spars++;
    G.player.skills.ringiq += 10 + Math.round(r.stars * 4);
    G.player.skills.strength += 5;
    if (reward) {
      G.player.deck.push(reward);
      toast('New move added to your deck!');
    }
    if (r.stars >= 4) {
      const bundle = rollSparBundle(this.floor, r.stars, () => this.rng.next());
      for (const d of bundle) {
        addItem(d.id, d.n);
        this.hud.addLoot(d.id, d.n);
      }
      await say(sp, `${r.stars}★! Now THAT is how we did it in ${g.def.year}. Here, take these. I can't carry them where I'm going. Which is nowhere. I'm staying right here.`);
      toast(`Spar bundle: ${bundle.map((d) => `${d.n} ${item(d.id).name}`).join(', ')}`);
      sting('item-get');
    } else if (r.stars >= 3) await say(sp, `${r.stars}★. Not bad at all. Keep that move, it suits you.`);
    else await say(sp, 'Rough around the edges, but so was I. Come back tomorrow and we will run it again.');
  }

  // ------------------------------------------------------------ the Golden Belt

  private async claimBelt(): Promise<void> {
    if (this.busy || !this.plan.golden) return;
    const save = dungeonSave();
    if (save.goldenBelt) {
      await narrate('The pedestal is empty now, but it still glows. Somewhere in the bleachers, a ghost starts a slow clap.');
      return;
    }
    this.busy = true;
    try {
      const tk = this.speaker(timekeeper());
      audio.music(null);
      audio.crowd(0.35);
      await narrate(
        'The Golden Belt. The leather is soft as an old baseball glove, and the plate is warm, like somebody just set it down.',
        'On the back, hundreds of names are scratched into the gold. Strongmen, cowboys, boxers, high-flyers. Every wrestler who ever trained down here.',
        'Near the bottom, two sets of initials, scratched side by side: *B.M. & D.D. · 1979.* Right underneath them there is a space. Just enough room for one more name.',
      );
      await say(tk, 'Ladies and gentlemen... and everyone who used to be...', 'Your NEW... GOLDEN... BELT... HOLDER!');
      for (let i = 0; i < 3; i++) {
        audio.sfx('beat', { pitch: 1.4 });
        this.shake = 2;
        await this.wait(0.35);
      }
      ensureBeltItem();
      addItem('golden-belt', 1);
      setFlag('golden_belt', true);
      save.goldenBelt = true;
      this.hud.setHint('★ Golden Belt holder ★', true);
      sting('story-beat');
      audio.crowdReact('cheer', 1);
      audio.sfx('star');
      this.celebrate = 6;
      this.flashWhite = 0.8;
      this.player.pose = 'celebrate';
      for (let i = 0; i < 120; i++) this.parts.push({ x: this.cam.x + Math.random() * game.screen.w, y: this.cam.y - Math.random() * 60, vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 30, life: 0, max: 3 + Math.random() * 2, color: ['#ffe48e', '#f4b63f', '#fff8d8', '#7affd4'][i % 4], size: 1, grav: 6, add: i % 3 === 0 });
      await this.wait(1.6);
      this.player.pose = null;
      await narrate(
        'The ghosts in the bleachers are on their feet, stomping, cheering, chanting your name, some of them in accents nobody has used in eighty years.',
        'You think of Sweet Lou pressing the key into your hand with a wink. He knew. Of course he knew.',
        'Below the ring, a trapdoor you never noticed creaks open. The Dungeon, it seems, has an encore.',
      );
      this.revealTrap(this.plan.trapFallback.x, this.plan.trapFallback.y, false);
      audio.music('dungeon');
      audio.crowd(0.12);
    } finally {
      this.busy = false;
      this.player.pose = null;
    }
  }

  // ------------------------------------------------------------ effects

  private burst(x: number, y: number, n: number, colors: string[], speed: number, grav: number, max: number, add: boolean): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.35, life: 0, max: max * (0.6 + Math.random() * 0.6), color: colors[i % colors.length], size: Math.random() < 0.25 ? 2 : 1, grav, add });
    }
  }
  private ring(x: number, y: number, color: string): void {
    this.parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 0.32, color, size: 1, grav: 0, add: true, ring: true });
  }
  private popText(s: string, color: string, x: number, y: number, big: boolean): void {
    this.pops.push({ img: textSprite(s, color, big), x, y, vy: -26, life: 0, max: big ? 0.9 : 0.8 });
  }

  private updateFx(dt: number): void {
    for (const p of this.parts) {
      p.life += dt;
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.4, dt);
    }
    this.parts = this.parts.filter((p) => p.life < p.max);
    for (const t of this.pops) {
      t.life += dt;
      t.y += t.vy * dt;
      t.vy *= Math.pow(0.05, dt);
    }
    this.pops = this.pops.filter((t) => t.life < t.max);
    // Loot pops out, bounces, then zips into your pockets.
    const p = this.player;
    for (const f of this.flies) {
      f.t += dt;
      if (f.t < 0.55) {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vz -= 260 * dt;
        f.z = Math.max(0, f.z + f.vz * dt);
        if (f.z === 0 && f.vz < 0) f.vz = -f.vz * 0.4;
      } else {
        const dx = p.x - f.x;
        const dy = p.y - 10 - (f.y - f.z);
        const d = Math.hypot(dx, dy);
        const s = Math.min(d, (120 + (f.t - 0.55) * 500) * dt);
        f.x += (dx / Math.max(1, d)) * s;
        f.y += (dy / Math.max(1, d)) * s;
        f.z *= 0.9;
        if (d < 6) {
          f.t = 99;
          addItem(f.id, 1);
          this.hud.addLoot(f.id, 1);
          audio.sfx('pickup', { pitch: 0.9 + Math.random() * 0.3 });
          this.burst(p.x, p.y - 12, 4, ['#fff8d8', '#ffe48e'], 25, 0, 0.3, true);
        }
      }
    }
    this.flies = this.flies.filter((f) => f.t < 99);
  }

  // ------------------------------------------------------------ camera

  private snapCamera(): void {
    this.updateCamera(1000);
  }
  private updateCamera(dt: number): void {
    const { w, h } = game.screen;
    const p = this.player;
    const mw = this.plan.w * TILE;
    const mh = this.plan.h * TILE;
    let tx = p.x - w / 2;
    let ty = p.y - 14 - h / 2;
    tx = mw <= w ? (mw - w) / 2 : Math.max(0, Math.min(mw - w, tx));
    ty = mh <= h ? (mh - h) / 2 : Math.max(0, Math.min(mh - h, ty));
    const k = Math.min(1, dt * 7);
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
  }

  // ------------------------------------------------------------ render

  render(ctx: CanvasRenderingContext2D): void {
    const { w, h } = game.screen;
    const lk = eraLook(this.plan);
    const t = game.t;
    const sx = this.shake > 0 ? Math.round((Math.random() - 0.5) * this.shake) : 0;
    const sy = this.shake > 0 ? Math.round((Math.random() - 0.5) * this.shake) : 0;
    const cx = Math.round(this.cam.x) - sx;
    const cy = Math.round(this.cam.y) - sy;
    ctx.fillStyle = lk.outside;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(this.ground, -cx, -cy);
    ctx.save();
    ctx.translate(-cx, -cy);

    this.renderFixtures(ctx, t);

    // depth-sorted sprites
    type D = { y: number; draw: () => void };
    const list: D[] = [];
    for (const n of this.nodes) if (!n.gone) list.push({ y: n.y, draw: () => this.drawNode(ctx, n, t) });
    for (const pr of this.props) list.push({ y: pr.y, draw: () => ctx.drawImage(pr.spr.c, Math.round(pr.x + pr.spr.ox), Math.round(pr.y + pr.spr.oy)) });
    if (this.plan.up === 'rope') {
      const rl = ropeLadder();
      const rx = this.plan.entry.x * TILE + 8;
      const ry = this.plan.entry.y * TILE + 4;
      list.push({ y: ry, draw: () => ctx.drawImage(rl.c, Math.round(rx + rl.ox + Math.sin(t * 1.3) * 0.8), Math.round(ry + rl.oy)) });
    }
    if (this.plan.golden && !dungeonSave().goldenBelt) {
      const pd = this.plan.golden.pedestal;
      const b = beltSprite();
      const bx = pd.x * TILE + 8;
      const by = pd.y * TILE - 2 + Math.sin(t * 2) * 2;
      list.push({ y: (pd.y + 1) * TILE, draw: () => ctx.drawImage(b.c, Math.round(bx + b.ox), Math.round(by + b.oy)) });
    }
    const p = this.player;
    list.push({ y: p.y, draw: () => this.drawPlayer(ctx, t) });
    for (const g of this.ghosts) list.push({ y: g.y, draw: () => this.drawGhostActor(ctx, g, t) });
    list.sort((a, b) => a.y - b.y);
    for (const d of list) d.draw();
    if (this.plan.golden) this.renderRingFront(ctx);
    // A faint silhouette so tall equipment never hides you completely.
    ctx.globalAlpha = 0.3;
    this.drawPlayer(ctx, t, true);
    ctx.globalAlpha = 1;

    // particles (normal)
    for (const q of this.parts) if (!q.add && !q.ring) this.drawPart(ctx, q);
    // loot in flight
    for (const f of this.flies) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(Math.round(f.x) - 3, Math.round(f.y) + 2, 7, 2);
      ctx.globalAlpha = 1;
      ctx.drawImage(f.img, Math.round(f.x - f.img.width / 2), Math.round(f.y - f.z - f.img.height / 2));
    }
    // interaction marker
    this.renderMarker(ctx, t);
    ctx.restore();

    this.renderLighting(ctx, cx, cy, w, h, t);

    // glow particles + motes on top of the darkness
    ctx.save();
    ctx.translate(-cx, -cy);
    ctx.globalCompositeOperation = 'lighter';
    for (const q of this.parts) if (q.add || q.ring) this.drawPart(ctx, q);
    ctx.restore();
    this.renderMotes(ctx, w, h, t);
    // number pops
    ctx.save();
    ctx.translate(-cx, -cy);
    for (const pp of this.pops) {
      const k = pp.life / pp.max;
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      const bounce = pp.life < 0.08 ? -2 : 0;
      ctx.drawImage(pp.img, Math.round(pp.x - pp.img.width / 2), Math.round(pp.y + bounce));
    }
    ctx.globalAlpha = 1;
    this.renderBar(ctx);
    ctx.restore();
    this.renderTrapArrow(ctx, cx, cy, w, h, t);
    if (this.flashWhite > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = this.flashWhite * 0.35;
      ctx.fillStyle = '#fff4d0';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  private renderFixtures(ctx: CanvasRenderingContext2D, t: number): void {
    // trapdoor
    if (this.trap.revealed) {
      const s = trapdoorSprite(this.trap.open);
      ctx.drawImage(s.c, this.trap.x * TILE + 8 + s.ox, (this.trap.y + 1) * TILE + s.oy);
    }
    // freight elevator in the top wall
    const el = this.plan.elevator;
    if (el) {
      const x = el.x * TILE;
      const y = (el.y - 1) * TILE + 2;
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(x - 1, y - 1, 34, 31);
      ctx.fillStyle = '#4a4256';
      ctx.fillRect(x, y, 32, 30);
      ctx.fillStyle = '#1a1226';
      ctx.fillRect(x + 2, y + 5, 28, 25);
      ctx.fillStyle = '#c8a050';
      for (let i = 0; i < 7; i++) ctx.fillRect(x + 3 + i * 4, y + 5, 1, 25);
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 2, y + 8 + i * 6, 28, 1);
      ctx.fillStyle = Math.sin(t * 3) > 0 ? '#7affd4' : '#3a9a7a';
      ctx.fillRect(x + 15, y + 1, 3, 3);
      ctx.drawImage(textSprite(`F${this.floor}`, '#ffe48e', false), x + 3, y - 1);
    }
    // golden ring
    if (this.plan.golden) {
      const r = this.plan.golden.ring;
      const x = r.x * TILE + 4;
      const y = r.y * TILE;
      const w = r.w * TILE - 8;
      const h = r.h * TILE - 4;
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(x - 2, y - 2, w + 4, h + 10);
      ctx.fillStyle = '#5a3a6a';
      ctx.fillRect(x - 1, y + h, w + 2, 8);
      ctx.drawImage(textSprite('THE GOLDEN RING', '#ffe48e', false), Math.round(x + w / 2 - 34), y + h + 1);
      ctx.fillStyle = '#f6ead2';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#e8d8b8';
      for (let i = 0; i < w; i += 6) ctx.fillRect(x + i, y, 1, h);
      ctx.fillStyle = 'rgba(244,182,63,0.35)';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 3, h / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // back ropes
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i === 1 ? '#fff0b0' : '#f4b63f';
        ctx.fillRect(x, y - 10 + i * 4, w, 1);
      }
      // ghost crowd in the bleachers
      ctx.save();
      for (let row = 0; row < 3; row++)
        for (let i = 0; i < this.plan.w * 2; i++) {
          const fx = i * 8 + (row & 1) * 4 + 4;
          if (fx < 20 || fx > this.plan.w * TILE - 20) continue;
          const fy = 12 + row * 7 + Math.round(Math.sin(t * (this.celebrate > 0 ? 9 : 2) + i * 1.7 + row) * (this.celebrate > 0 ? 2 : 0.6));
          ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t + i);
          ctx.fillStyle = (i + row) % 5 === 0 ? '#c8fff0' : '#7affd4';
          ctx.fillRect(fx - 2, fy, 5, 4);
          ctx.fillRect(fx - 3, fy + 4, 7, 3);
          if (this.celebrate > 0 && (i + row) % 3 === 0) ctx.fillRect(fx - 4, fy - 3 + Math.round(Math.sin(t * 12 + i) * 1.5), 1, 3);
        }
      ctx.restore();
    }
    // stairs light shaft / rope light
    void t;
  }

  private renderRingFront(ctx: CanvasRenderingContext2D): void {
    const r = this.plan.golden!.ring;
    const x = r.x * TILE + 4;
    const y = (r.y + r.h) * TILE - 4;
    const w = r.w * TILE - 8;
    // front ropes draw over anyone inside the ring
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 1 ? '#fff0b0' : '#f4b63f';
      ctx.fillRect(x, y - 14 + i * 4, w, 1);
    }
  }

  private drawNode(ctx: CanvasRenderingContext2D, n: RtNode, t: number): void {
    const s = n.spr;
    const hpk = Math.max(0, n.hp / n.spec.hp);
    // squash and stretch on impact, wobble after
    const sq = n.squash * 0.18;
    const wob = Math.sin(t * 40) * n.wob * 0.6;
    const dw = s.c.width * (1 + sq);
    const dh = s.c.height * (1 - sq * 0.7);
    const x = n.x + s.ox * (1 + sq) + wob;
    const y = n.y + s.oy * (1 - sq * 0.7);
    // phantom equipment fades as you finish your reps
    ctx.globalAlpha = 0.6 + 0.4 * hpk;
    ctx.drawImage(s.c, Math.round(x), Math.round(y), Math.round(dw), Math.round(dh));
    ctx.globalAlpha = 1;
    if (n.flash > 0 || hpk < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = n.flash * 0.8 + (1 - hpk) * (0.12 + 0.06 * Math.sin(t * 6));
      ctx.drawImage(s.c, Math.round(x), Math.round(y), Math.round(dw), Math.round(dh));
      ctx.restore();
    }
    // sparkles leaking from worked equipment
    if (hpk < 1 && Math.random() < 0.05) this.parts.push({ x: n.x + (Math.random() - 0.5) * 12, y: n.y - Math.random() * s.h, vx: 0, vy: -12, life: 0, max: 0.8, color: GHOST_TINT, size: 1, grav: 0, add: true });
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, t: number, ghostPass = false): void {
    const p = this.player;
    let yOff = 0;
    let alpha = ghostPass ? 0.3 : 1;
    if (this.fall > 0) yOff = -Math.pow(this.fall / 0.55, 2) * 90;
    if (this.sink > 0) {
      yOff = (1 - this.sink / 0.42) * 14;
      alpha *= this.sink / 0.42;
    }
    if (!ghostPass) {
      ctx.globalAlpha = 0.28 * alpha;
      ctx.fillStyle = '#2b2140';
      ctx.beginPath();
      ctx.ellipse(Math.round(p.x), Math.round(p.y) - 1, 6 * (this.fall > 0 ? 1 - this.fall : 1), 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = alpha * (ghostPass ? 1 : 1);
    let pose: Pose = p.moving ? 'walk' : 'idle';
    if (this.work && this.work.phase !== 'recover') pose = NODES[this.work.node.spec.kind].pose === 'climb' ? 'climb' : 'idle';
    if (p.pose) pose = p.pose as Pose;
    if (this.carry && this.carry.t > 0.3) pose = 'lifted';
    if (this.fall > 0) pose = 'aerial';
    try {
      drawCharacter(ctx, G.player.look, p.x, p.y + yOff, { facing: p.facing, pose, frame: Math.floor(p.walkT * 8), t });
    } catch {
      ctx.fillStyle = '#d9544d';
      ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y + yOff) - 20, 8, 20);
    }
    if (this.celebrate > 0) {
      const b = beltSprite();
      ctx.drawImage(b.c, Math.round(p.x + b.ox), Math.round(p.y - 34 + Math.sin(t * 6) * 1.5 + b.oy + 8));
    }
    ctx.globalAlpha = 1;
  }

  private drawGhostActor(ctx: CanvasRenderingContext2D, g: RtGhost, t: number): void {
    const bob = Math.sin(t * 2 + g.hx) * 2 - 3;
    ctx.globalAlpha = 0.15 * g.alpha;
    ctx.fillStyle = GHOST_TINT;
    ctx.beginPath();
    ctx.ellipse(Math.round(g.x), Math.round(g.y) - 1, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    const sparred = todayState(this.day()).sparred.includes(g.def.id);
    const pose = this.celebrate > 0 ? 'celebrate' : Math.sin(t * 1.3 + g.hx) > 0.85 ? 'wave' : 'idle';
    drawGhost(ctx, g.def.look, g.x, g.y + bob, g.facing, t + g.hx, 0.7 * g.alpha * (sparred ? 0.75 : 1), pose);
    if (Math.random() < 0.04 * g.alpha) this.parts.push({ x: g.x + (Math.random() - 0.5) * 10, y: g.y - Math.random() * 20, vx: 0, vy: -10, life: 0, max: 0.9, color: GHOST_TINT, size: 1, grav: 0, add: true });
  }

  private drawPart(ctx: CanvasRenderingContext2D, q: Part): void {
    const k = 1 - q.life / q.max;
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.fillStyle = q.color;
    if (q.ring) {
      const r = 4 + (q.life / q.max) * 22;
      for (let a = 0; a < 24; a++) {
        const ang = (a / 24) * Math.PI * 2;
        ctx.fillRect(Math.round(q.x + Math.cos(ang) * r), Math.round(q.y + Math.sin(ang) * r * 0.55), 1, 1);
      }
    } else ctx.fillRect(Math.round(q.x), Math.round(q.y), q.size, q.size);
    ctx.globalAlpha = 1;
  }

  private renderMarker(ctx: CanvasRenderingContext2D, t: number): void {
    const tg = this.target;
    if (!tg || this.blocked || this.work) return;
    let mx = 0;
    let my = 0;
    if (tg.kind === 'node') {
      mx = tg.n.x;
      my = tg.n.y - tg.n.spr.h - 12;
    } else if (tg.kind === 'ghost') {
      mx = tg.g.x;
      my = tg.g.y - 44;
    } else if (tg.kind === 'trap') {
      mx = this.trap.x * TILE + 8;
      my = this.trap.y * TILE - 10;
    } else if (tg.kind === 'belt') {
      mx = this.plan.golden!.pedestal.x * TILE + 8;
      my = this.plan.golden!.pedestal.y * TILE - 26;
    } else if (tg.kind === 'elevator') {
      mx = (this.plan.elevator!.x + 1) * TILE;
      my = (this.plan.elevator!.y - 1) * TILE - 6;
    } else {
      mx = this.plan.entry.x * TILE + 8;
      my = this.plan.entry.y * TILE - (this.plan.up === 'stairs' ? 44 : 20);
    }
    const bob = Math.round(Math.sin(t * 5) * 1.5);
    ctx.fillStyle = '#2b2140';
    ctx.fillRect(Math.round(mx) - 4, Math.round(my) + bob - 1, 9, 9);
    ctx.fillStyle = '#fbf0d9';
    ctx.fillRect(Math.round(mx) - 3, Math.round(my) + bob, 7, 7);
    ctx.fillStyle = '#2fa59a';
    ctx.fillRect(Math.round(mx), Math.round(my) + bob + 1, 1, 3);
    ctx.fillRect(Math.round(mx), Math.round(my) + bob + 5, 1, 1);
  }

  /** The timing bar: crunchy, readable, right above the equipment. */
  private renderBar(ctx: CanvasRenderingContext2D): void {
    const w = this.work;
    if (!w) return;
    const n = w.node;
    const BW = 64;
    const x0 = Math.round(Math.max(this.cam.x + 4, Math.min(this.cam.x + game.screen.w - BW - 4, n.x - BW / 2)));
    let y0 = Math.round(n.y - n.spr.h - 20);
    if (y0 < this.cam.y + 14) y0 = Math.round(n.y + 8);
    const pop = w.phase === 'windup' ? Math.round(Math.max(0, -w.t) * 18) : 0;
    const y = y0 + pop;
    // verb
    const verb = textSprite(NODES[n.spec.kind].verb, '#fbf0d9', true);
    ctx.drawImage(verb, Math.round(x0 + BW / 2 - verb.width / 2), y - 12);
    // frame + shadow
    ctx.fillStyle = 'rgba(43,33,64,0.5)';
    ctx.fillRect(x0, y + 2, BW + 2, 9);
    ctx.fillStyle = '#2b2140';
    ctx.fillRect(x0 - 1, y - 1, BW + 2, 9);
    ctx.fillStyle = '#fbf0d9';
    ctx.fillRect(x0, y, BW, 7);
    ctx.fillStyle = '#e8d6b4';
    ctx.fillRect(x0, y + 5, BW, 2);
    const tm = w.tm;
    const gx0 = Math.round(x0 + (tm.center - tm.good) * BW);
    const gx1 = Math.round(x0 + (tm.center + tm.good) * BW);
    ctx.fillStyle = '#2fa59a';
    ctx.fillRect(gx0, y, gx1 - gx0, 7);
    ctx.fillStyle = '#5ed8c8';
    ctx.fillRect(gx0, y, gx1 - gx0, 1);
    const px0 = Math.round(x0 + (tm.center - tm.perfect) * BW);
    const px1 = Math.max(px0 + 2, Math.round(x0 + (tm.center + tm.perfect) * BW));
    ctx.fillStyle = '#f4b63f';
    ctx.fillRect(px0, y, px1 - px0, 7);
    ctx.fillStyle = '#fff4c0';
    ctx.fillRect(px0, y, px1 - px0, 1);
    if (Math.sin(game.t * 12) > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round((px0 + px1) / 2), y - 3, 1, 2);
    }
    // marker
    const m = w.phase === 'sweep' ? markerAt(w.t, tm.pass) : w.phase === 'recover' ? -2 : 0;
    if (m >= 0) {
      const mx = Math.round(x0 + m * BW);
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(mx - 2, y - 3, 5, 13);
      ctx.fillStyle = '#d8434b';
      ctx.fillRect(mx - 1, y - 2, 3, 11);
      ctx.fillStyle = '#ff9a9a';
      ctx.fillRect(mx - 1, y - 2, 1, 11);
    }
    // reps left as pips
    const left = Math.max(0, Math.ceil(n.hp / 2));
    for (let i = 0; i < Math.ceil(n.spec.hp / 2); i++) {
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(x0 + BW / 2 - 6 + i * 5 - 1, y + 9, 4, 4);
      ctx.fillStyle = i < left ? '#7affd4' : '#4a4256';
      ctx.fillRect(x0 + BW / 2 - 6 + i * 5, y + 10, 2, 2);
    }
  }

  private renderTrapArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number): void {
    if (!this.trap.revealed || this.sink > 0) return;
    const tx = this.trap.x * TILE + 8 - cx;
    const ty = this.trap.y * TILE + 8 - cy;
    if (tx > 8 && tx < w - 8 && ty > 8 && ty < h - 8) return;
    const ax = Math.max(14, Math.min(w - 14, tx));
    const ay = Math.max(30, Math.min(h - 30, ty));
    const ang = Math.atan2(ty - ay, tx - ax);
    const pulse = 1 + Math.sin(t * 6) * 0.15;
    ctx.save();
    ctx.translate(Math.round(ax), Math.round(ay));
    ctx.rotate(ang);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#2b2140';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -6);
    ctx.lineTo(-5, 6);
    ctx.fill();
    ctx.fillStyle = '#f4b63f';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-4, 4);
    ctx.fill();
    ctx.restore();
  }

  private renderLighting(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number): void {
    const lk = eraLook(this.plan);
    const lc = this.lightCanvas;
    if (lc.width !== w || lc.height !== h) {
      lc.width = w;
      lc.height = h;
      this.vignette = null;
    }
    const l = lc.getContext('2d')!;
    l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, w, h);
    const dark = this.plan.golden ? 0.5 : this.plan.encore ? 0.66 : 0.6;
    l.fillStyle = `${lk.dark}${dark})`;
    l.fillRect(0, 0, w, h);
    const lights: { x: number; y: number; r: number; c: string; a?: number }[] = [];
    for (const tc of this.plan.torches) {
      const fl = 1 + Math.sin(t * 9 + tc.x * 3) * 0.04 + Math.sin(t * 23 + tc.x) * 0.03;
      lights.push({ x: tc.x * TILE + 8, y: tc.y * TILE + 4, r: 64 * fl, c: lk.light });
    }
    const p = this.player;
    lights.push({ x: p.x, y: p.y - 12, r: 46, c: '#fff0d0', a: 0.5 });
    for (const g of this.ghosts) lights.push({ x: g.x, y: g.y - 14, r: 34 * g.alpha, c: GHOST_TINT });
    if (this.trap.revealed) lights.push({ x: this.trap.x * TILE + 8, y: this.trap.y * TILE + 8, r: 40 + Math.sin(t * 4) * 4, c: '#ffd060' });
    if (this.plan.elevator) lights.push({ x: (this.plan.elevator.x + 1) * TILE, y: this.plan.elevator.y * TILE, r: 36, c: '#9affc8' });
    lights.push({ x: this.plan.entry.x * TILE + 8, y: this.plan.entry.y * TILE - 4, r: 44, c: '#fff0c0' });
    for (const pr of this.props) if (pr.kind === 'candelabra' || pr.kind === 'tv-cart') lights.push({ x: pr.x, y: pr.y - 18, r: 44, c: pr.kind === 'tv-cart' ? '#9ad8f0' : '#ffd890' });
    for (const n of this.nodes) if (n.flash > 0.2) lights.push({ x: n.x, y: n.y - 10, r: 34 * n.flash, c: '#fff8d8' });
    if (this.plan.golden) {
      const r = this.plan.golden.ring;
      lights.push({ x: (r.x + r.w / 2) * TILE, y: (r.y + r.h / 2) * TILE, r: 120 + Math.sin(t) * 6, c: '#ffd870' });
    }
    l.globalCompositeOperation = 'destination-out';
    for (const li of lights) {
      if (li.r <= 1) continue;
      const x = li.x - cx;
      const y = li.y - cy;
      if (x < -li.r || x > w + li.r || y < -li.r || y > h + li.r) continue;
      const g = l.createRadialGradient(x, y, 0, x, y, li.r);
      g.addColorStop(0, 'rgba(0,0,0,0.95)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.5)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      l.fillStyle = g;
      l.fillRect(x - li.r, y - li.r, li.r * 2, li.r * 2);
    }
    ctx.drawImage(lc, 0, 0);
    // additive colored glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const li of lights) {
      if (li.r <= 1) continue;
      const x = li.x - cx;
      const y = li.y - cy;
      if (x < -li.r || x > w + li.r || y < -li.r || y > h + li.r) continue;
      const g = ctx.createRadialGradient(x, y, 0, x, y, li.r * 0.85);
      g.addColorStop(0, li.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = li.a ?? 0.28;
      ctx.fillStyle = g;
      ctx.fillRect(x - li.r, y - li.r, li.r * 2, li.r * 2);
    }
    ctx.restore();
    // torch flames (drawn after the darkness so they stay bright)
    for (const tc of this.plan.torches) {
      const x = tc.x * TILE + 8 - cx;
      const y = tc.y * TILE + 4 - cy;
      const f = Math.floor(t * 10 + tc.x) % 3;
      ctx.fillStyle = '#ff9a3a';
      ctx.fillRect(x - 2, y + 1 - f, 4, 4 + f);
      ctx.fillStyle = '#ffe48e';
      ctx.fillRect(x - 1, y + 2 - f, 2, 3 + f);
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(x - 0, y + 3, 1, 2);
    }
    // vignette
    if (!this.vignette) {
      const v = document.createElement('canvas');
      v.width = w;
      v.height = h;
      const vx = v.getContext('2d')!;
      const g = vx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      g.addColorStop(0, 'rgba(10,6,18,0)');
      g.addColorStop(1, 'rgba(10,6,18,0.6)');
      vx.fillStyle = g;
      vx.fillRect(0, 0, w, h);
      this.vignette = v;
    }
    ctx.drawImage(this.vignette, 0, 0);
  }

  private renderMotes(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const m of this.motes) {
      const x = (((m.x + t * 6 * m.s - this.cam.x * 0.4) % (w + 20)) + w + 20) % (w + 20) - 10;
      const y = (((m.y + Math.sin(t * 0.7 + m.p) * 6 - t * 3 * m.s - this.cam.y * 0.4) % (h + 20)) + h + 20) % (h + 20) - 10;
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + m.p);
      ctx.fillStyle = m.p > 5 ? '#ffe9a0' : GHOST_TINT;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    ctx.restore();
  }
}
