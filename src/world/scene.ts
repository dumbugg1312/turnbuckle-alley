import { audio } from '../audio';
import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { G, ext, type Dir } from '../core/state';
import { isShowDay, isSupershow, weekday } from '../core/time';
import { currentEntry, NPCS, type DayCtx, type NpcDef } from '../data/npcs';
import { drawCharacter, RUN_FRAMES, WALK_FRAMES, type Pose, type Quirk } from '../gfx/characters';
import { pixelTextOutlined } from '../gfx/draw';
import { Fx } from '../gfx/fx';
import { defaultLook, type Look } from '../gfx/look';
import '../gfx/world';
import { toast } from '../ui/dialog';
import { Hud } from '../ui/hud';
import { Actor } from './actor';
import { drawActorShadow, drawCastShadows, drawGrade, drawRays, gradeAt, lightSprite, Particles, setCollecting, spillSprite, type Grade } from './atmosphere';
import { ACTIONS, DOOR_RULES, ENTER_HOOKS, TICK_HOOKS } from './hooks';
import { linkMaps } from './maps/links';
import { MAPS } from './maps/index';
import { boxesOverlap, GameMap } from './map';
import { findPath } from './pathfind';
import { objectKind } from './registry';
import { StepFx } from './stepfx';
import { TILE, type MapObject, type Warp } from './types';

/** Looks come from the character module when it exists. */
const looksMod = import.meta.glob<{ LOOKS?: Record<string, Look> }>('../data/looks.ts', { eager: true });
export function lookFor(id: string): Look {
  const m = Object.values(looksMod)[0];
  return m?.LOOKS?.[id] ?? fallbackLook(id);
}
function fallbackLook(id: string): Look {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const tops = ['#d8434b', '#3f74d8', '#2fa59a', '#f4b63f', '#ff5d8f', '#6a3fa0', '#5c9a6e'];
  return { ...defaultLook(), topColor: tops[h % tops.length], hair: ['short', 'long', 'bun', 'curly', 'ponytail'][h % 5], skin: ['#f6c3a0', '#e8a982', '#b06d48', '#8d5233', '#ffdbc4'][(h >> 3) % 5] };
}

/** World-owned persistent state. */
export interface WorldState {
  /** Object ids that are collected/cleared (hidden). Value = day index it can respawn (-1 never). */
  hidden: Record<string, number>;
  ringState: 'overgrown' | 'clean' | 'deluxe';
  visited: string[];
}
export function worldState(): WorldState {
  return ext<WorldState>('world', () => ({ hidden: {}, ringState: 'overgrown', visited: [] }));
}

export let WORLD: WorldScene | null = null;

/** Emote icons, two characters per world pixel (# ink, o fill, + highlight). */
const EMOTE_ICONS: Record<string, { px: string[]; ink: string; fill: string; hi: string }> = {
  '♥': {
    ink: '#8a2238', fill: '#e2445a', hi: '#ffb4bc',
    px: [
      '..####..####..',
      '.#oooo##oooo#.',
      '#o++ooooooooo#',
      '#o+oooooooooo#',
      '#oooooooooooo#',
      '.#oooooooooo#.',
      '..#oooooooo#..',
      '...#oooooo#...',
      '....#oooo#....',
      '.....#oo#.....',
      '......##......',
    ],
  },
  '!': {
    ink: '#8a2238', fill: '#d8434b', hi: '#ff9aa0',
    px: ['.##.', '#+o#', '#oo#', '#oo#', '#oo#', '.##.', '....', '.##.', '#oo#', '.##.'],
  },
  '♪': {
    ink: '#2b2140', fill: '#5a4a8a', hi: '#9a8ad0',
    px: ['....####', '....#oo#', '....#.##', '....#...', '....#...', '....#...', '.####...', '#oo+#...', '#ooo#...', '.###....'],
  },
};

/** Main characters' idle habits (gfx/charart/body.ts idlePose). */
const IDLE_QUIRK: Record<string, Quirk> = {
  birdie: 'tap',
  pip: 'bounce',
  earl: 'glasses',
  professor: 'glasses',
  dex: 'stretch',
  hazel: 'stretch',
  clint: 'tap',
  lacey: 'tap',
  bo: 'stretch',
};

class NpcActor extends Actor {
  def: NpcDef;
  idle: string = 'still';
  homeX = 0;
  homeY = 0;
  leaving = false;
  wanderT = Math.random() * 4;
  constructor(def: NpcDef, x: number, y: number) {
    super(def.id, lookFor(def.id), x, y);
    this.def = def;
    // Elders take their time.
    this.speed = this.look.age === 'elder' ? 36 : 42;
  }
}

function dayCtx(): DayCtx {
  const wd = weekday();
  return {
    weekday: wd,
    day: G.time.day,
    season: G.time.season,
    weather: G.weather.today,
    show: isShowDay() ? (wd === 2 ? 'wed' : 'sat') : null,
    supershow: isSupershow(),
    flags: G.flags,
  };
}

/** Which places count as insider spaces (where kayfabe can drop). */
export function placeKind(mapId: string, x: number, y: number): 'public' | 'insider' | 'home' | 'show' {
  if (mapId === 'birdie-office' || mapId === 'lockers' || mapId === 'airstream' || mapId === 'birdie-house') return 'insider';
  if (mapId === 'diner' && x >= 14 && y <= 7) return 'insider';
  if (mapId === 'sportatorium' && !(isShowDay() && G.time.minutes >= 17 * 60)) return 'insider';
  if (mapId === 'grandma-house' || mapId === 'farm') return 'home';
  if ((mapId === 'vfw' || mapId === 'sportatorium') && isShowDay() && G.time.minutes >= 17 * 60) return 'show';
  return 'public';
}

export class WorldScene implements Scene {
  map!: GameMap;
  player: Actor;
  npcs = new Map<string, NpcActor>();
  cam = { x: 0, y: 0 };
  fx = new Fx();
  private maps = new Map<string, GameMap>();
  private interactTarget: { kind: 'npc'; npc: NpcActor } | { kind: 'obj'; obj: MapObject } | { kind: 'warp'; warp: Warp } | null = null;
  private rain: { x: number; y: number; v: number }[] = [];
  private lightCanvas = document.createElement('canvas');
  private particles = new Particles();
  private steps = new StepFx();
  private lastStepSfx = 0;
  private grade: Grade = gradeAt(9 * 60, 'sun', false);
  private warping = false;
  private lastTick = -1;
  /**
   * Nesting depth of things that own the player right now (object use, talks, enter-hook
   * cutscenes). A counter, not a saved-and-restored flag, so two async flows that overlap
   * (e.g. 2 AM passing out while a tape bin is open) can't leave the world stuck busy.
   */
  private busyDepth = 0;
  get busy(): boolean {
    return this.busyDepth > 0;
  }
  private release(): void {
    this.busyDepth = Math.max(0, this.busyDepth - 1);
  }
  /** Called by HUD to show the action button label. */
  onPrompt: ((label: string | null) => void) | null = null;
  private promptLabel: string | null = null;

  /** Attract mode (title screen): scripted camera, no player or HUD. */
  attract: { x0: number; y0: number; x1: number; y1: number; seconds: number; t: number } | null = null;

  constructor(opts: { attract?: { map: string; x0: number; y0: number; x1: number; y1: number; seconds: number } } = {}) {
    linkMaps();
    this.player = new Actor('player', G.player.look, G.player.x, G.player.y);
    this.player.speed = 72;
    if (opts.attract) {
      const a = opts.attract;
      this.attract = { x0: a.x0 * TILE, y0: a.y0 * TILE, x1: a.x1 * TILE, y1: a.y1 * TILE, seconds: a.seconds, t: 0 };
      this.player.visible = false;
      this.loadMap(a.map, a.x0 * TILE, a.y0 * TILE, 'down');
      return;
    }
    // A save can name a map that no longer exists (renamed or removed).
    // Fall back to waking up next to the bed at home.
    if (MAPS.has(G.player.map)) this.loadMap(G.player.map, G.player.x, G.player.y, G.player.facing);
    else this.loadMap('grandma-house', 13 * TILE + TILE / 2, 7 * TILE + TILE - 3, 'down');
    this.ensureSafeSpawn();
    WORLD = this;
  }

  /**
   * Older saves could hold a position from a different map (the actor's spot was
   * never written back), which spawned the player off screen. If the loaded spot
   * is outside the map or inside something solid, move to the nearest open tile.
   */
  private ensureSafeSpawn(): void {
    const m = this.map;
    const p = this.player;
    // Door arrival spots can graze a wall with the full hitbox, so only test the feet.
    if (Number.isFinite(p.x) && Number.isFinite(p.y) && !m.collides({ x: p.x - 1, y: p.y - 2, w: 2, h: 2 })) return;
    const cx = Math.floor(Math.min(Math.max(Number.isFinite(p.x) ? p.x : 0, 0), m.pxW - 1) / TILE);
    const cy = Math.floor(Math.min(Math.max(Number.isFinite(p.y) ? p.y : 0, 0), m.pxH - 1) / TILE);
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (let ty = 0; ty < m.h; ty++)
      for (let tx = 0; tx < m.w; tx++) {
        const d = (tx - cx) ** 2 + (ty - cy) ** 2;
        if (d >= bestD) continue;
        const x = tx * TILE + TILE / 2;
        const y = ty * TILE + TILE - 3;
        // Skip doors and edge warps so loading never bounces the player to another map.
        if (m.warpAt(x, y, true) || m.collides(p.box(x, y))) continue;
        best = { x, y };
        bestD = d;
      }
    if (!best) return;
    p.x = best.x;
    p.y = best.y;
    this.syncPlayerState();
    this.snapCamera();
  }

  /** Write the actor's spot back into the save state so the next save reloads here. */
  private syncPlayerState(): void {
    if (this.attract) return;
    G.player.x = this.player.x;
    G.player.y = this.player.y;
    G.player.facing = this.player.facing;
  }

  hud: Hud | null = null;

  enter(): void {
    if (this.attract) return;
    WORLD = this;
    this.mountHud();
    this.playMapMusic();
    void this.runEnterHooks(this.map.id);
  }

  private mountHud(): void {
    this.hud?.destroy();
    if (G.flags['prologue']) {
      this.hud = null;
      return;
    }
    this.hud = new Hud(
      () => {
        // Same gate as the menu key: saving mid-cutscene stores half-applied story flags.
        if (game.blockers > 0 || this.busy || this.warping || game.sleeping) return;
        void import('../ui/menu').then((m) => m.openMenu());
      },
      () => this.interact(),
    );
    this.onPrompt = (l) => this.hud?.setAction(l);
    void import('../systems/goals').then((m) => this.hud && (this.hud.goalFn = m.currentGoal));
  }

  pause(): void {
    if (this.hud) this.hud.root.style.display = 'none';
  }

  resume(): void {
    WORLD = this;
    this.player.look = G.player.look;
    if (this.hud) this.hud.root.style.display = '';
    this.map.invalidateGround();
    this.refreshObjects();
    this.spawnNpcs(true);
    this.playMapMusic();
  }

  exit(): void {
    this.hud?.destroy();
    this.hud = null;
    if (WORLD === this) WORLD = null;
  }

  // ------------------------------------------------------------ maps

  getMap(id: string): GameMap {
    let m = this.maps.get(id);
    if (!m) {
      const def = MAPS.get(id);
      if (!def) throw new Error(`No map ${id}`);
      m = new GameMap(def);
      this.maps.set(id, m);
    }
    this.applyHidden(m);
    return m;
  }

  /** Apply collected/cleared state and dynamic props to a map's objects. */
  applyHidden(m: GameMap): void {
    const ws = worldState();
    let changed = false;
    for (const o of m.objects) {
      const h = ws.hidden[o.id];
      const hide = h !== undefined && (h < 0 || h > absDayNow());
      if (!!o.hidden !== hide) {
        o.hidden = hide;
        changed = true;
      }
      if (o.kind === 'backyard-ring' && o.props.state !== ws.ringState) {
        o.props.state = ws.ringState;
        changed = true;
      }
    }
    if (changed) {
      m.rebuildBlocked();
      m.invalidateGround();
    }
  }

  private loadMap(id: string, px: number, py: number, facing: Dir): void {
    this.map = this.getMap(id);
    this.player.x = px;
    this.player.y = py;
    this.player.facing = facing;
    this.player.stop();
    G.player.map = id;
    this.syncPlayerState();
    const ws = worldState();
    if (!ws.visited.includes(id)) ws.visited.push(id);
    this.npcs.clear();
    this.spawnNpcs(true);
    this.snapCamera();
  }

  /** Teleport to a map tile with a fade. Runs enter hooks afterwards. */
  warpTo(mapId: string, tx: number, ty: number, facing: Dir = 'down', silent = false): Promise<void> {
    return new Promise((resolve) => {
      if (this.warping) return resolve();
      this.warping = true;
      if (!silent) audio.sfx('door');
      const ok = game.scenes.transition(() => {
        const prevMusic = this.mapMusic();
        this.loadMap(mapId, tx * TILE + TILE / 2, ty * TILE + TILE - 3, facing);
        if (this.mapMusic() !== prevMusic) this.playMapMusic();
        this.warping = false;
        void this.runEnterHooks(mapId).then(resolve);
      });
      // Another fade already owns the screen: never leave `warping` stuck on.
      if (!ok) {
        this.warping = false;
        resolve();
      }
    });
  }

  private async runEnterHooks(mapId: string): Promise<void> {
    // Enter hooks are cutscenes. Between their lines (and during NPC walks) no
    // dialog is open, so without this the player could walk off or talk to a
    // cutscene NPC and start a second, interleaved conversation.
    this.busyDepth++;
    try {
      for (const h of ENTER_HOOKS) {
        if (await h(mapId)) break;
      }
    } finally {
      this.release();
    }
  }

  mapMusic(): string {
    const m = this.map.def.music;
    const id = typeof m === 'function' ? m() : m ?? 'town';
    if (id === 'town') {
      if (G.weather.today === 'rain' || G.weather.today === 'storm') return 'rain';
      if (G.time.minutes >= 20 * 60 + 30) return 'night';
      if (G.time.minutes >= 17 * 60) return 'town-evening';
    }
    return id;
  }

  playMapMusic(): void {
    audio.music(this.mapMusic());
  }

  // ------------------------------------------------------------ NPCs

  private spawnNpcs(initial: boolean): void {
    const ctx = dayCtx();
    const minutes = G.time.minutes;
    for (const def of NPCS) {
      if (def.appearsWhen && !def.appearsWhen(ctx)) {
        this.npcs.delete(def.id);
        continue;
      }
      if (def.id === 'mothman' && (minutes < 22 * 60 || minutes > 25 * 60)) {
        this.npcs.delete(def.id);
        continue;
      }
      const e = currentEntry(def, ctx, minutes);
      if (!e) continue;
      const here = this.npcs.get(def.id);
      if (e.map === this.map.id) {
        // Several NPCs can share a schedule spot (the flea market, the square):
        // spread them to neighbouring free tiles so they don't stack on top of each other.
        const spot = e.idle === 'sit' ? { x: e.x, y: e.y } : this.freeTile(def.id, e.x, e.y);
        const gx = spot.x * TILE + TILE / 2;
        const gy = spot.y * TILE + TILE - 3;
        if (!here) {
          let sx = gx;
          let sy = gy;
          if (!initial) {
            // Walk in from the nearest exit.
            const w = this.nearestWarp(gx, gy);
            if (w) {
              sx = (w.x + 0.5) * TILE;
              sy = (w.y + 1) * TILE - 3;
            }
          }
          const a = new NpcActor(def, sx, sy);
          a.idle = e.idle ?? 'still';
          a.homeX = gx;
          a.homeY = gy;
          a.facing = (e.facing ?? 'down') as Dir;
          this.npcs.set(def.id, a);
          if (!initial) a.goTo(this.map, spot.x, spot.y, () => (a.facing = (e.facing ?? 'down') as Dir));
        } else if (Math.abs(here.homeX - gx) > 1 || Math.abs(here.homeY - gy) > 1 || here.leaving) {
          here.leaving = false;
          here.homeX = gx;
          here.homeY = gy;
          here.idle = e.idle ?? 'still';
          here.goTo(this.map, spot.x, spot.y, () => (here.facing = (e.facing ?? 'down') as Dir));
        }
      } else if (here && !here.leaving) {
        here.leaving = true;
        const w = this.warpToward(e.map) ?? this.nearestWarp(here.x, here.y);
        if (w && !initial) here.goTo(this.map, w.x, w.y, () => this.npcs.delete(def.id));
        else this.npcs.delete(def.id);
      }
    }
  }

  /** The scheduled tile, or the nearest free walkable one if another NPC already holds it. */
  private freeTile(id: string, tx: number, ty: number): { x: number; y: number } {
    const taken = (x: number, y: number) => {
      for (const [k, n] of this.npcs) if (k !== id && !n.leaving && Math.floor(n.homeX / TILE) === x && Math.floor(n.homeY / TILE) === y) return true;
      return false;
    };
    if (!taken(tx, ty)) return { x: tx, y: ty };
    for (let r = 1; r <= 3; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const x = tx + dx;
          const y = ty + dy;
          if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h || this.map.blocked[y * this.map.w + x] || taken(x, y)) continue;
          return { x, y };
        }
      }
    }
    return { x: tx, y: ty };
  }

  private nearestWarp(x: number, y: number): Warp | null {
    let best: Warp | null = null;
    let bd = Infinity;
    for (const w of this.map.def.warps) {
      const d = Math.hypot((w.x + 0.5) * TILE - x, (w.y + 0.5) * TILE - y);
      if (d < bd) {
        bd = d;
        best = w;
      }
    }
    return best;
  }

  private warpToward(mapId: string): Warp | null {
    return this.map.def.warps.find((w) => w.to === mapId) ?? (this.map.id !== 'town' ? this.map.def.warps.find((w) => w.to === 'town') ?? null : null);
  }

  npcActor(id: string): NpcActor | undefined {
    return this.npcs.get(id);
  }

  // ------------------------------------------------------------ objects

  /** Hide an object (collected/cleared). respawnDays < 0 = forever. */
  hideObject(o: MapObject, respawnDays = -1): void {
    worldState().hidden[o.id] = respawnDays < 0 ? -1 : absDayNow() + respawnDays;
    o.hidden = true;
    this.map.rebuildBlocked();
    if (objectKind(o.kind).flat) this.map.invalidateGround();
  }

  refreshObjects(): void {
    this.applyHidden(this.map);
  }

  // ------------------------------------------------------------ update

  update(dt: number): void {
    if (this.attract) {
      const a = this.attract;
      a.t += dt;
      const k = (1 - Math.cos((a.t / a.seconds) * Math.PI)) / 2;
      this.player.x = a.x0 + (a.x1 - a.x0) * k;
      this.player.y = a.y0 + (a.y1 - a.y0) * k;
      for (const n of this.npcs.values()) if (n.path.length) n.followPath(this.map, dt, []);
      this.animateActors([this.player, ...this.npcs.values()], dt);
      this.updateCamera(dt * 0.6);
      this.fx.update(dt);
      this.updateAtmosphere(dt);
      return;
    }
    const blocked = game.blockers > 0 || this.busy || this.warping;
    if (!blocked) {
      if (!G.flags['prologue']) game.clock.update(dt);
      this.handleInput(dt);
    }
    this.syncPlayerState();
    // 10-minute ticks: NPC schedules, hooks, music changes.
    const tick = Math.floor(G.time.minutes / 10);
    if (tick !== this.lastTick) {
      this.lastTick = tick;
      if (!blocked) {
        this.spawnNpcs(false);
        for (const h of TICK_HOOKS) h(G.time.minutes);
        const mm = this.mapMusic();
        audio.music(mm);
      }
    }
    // NPCs move even during dialogue, unless a cutscene owns them.
    const actors = [this.player, ...this.npcs.values()];
    for (const n of this.npcs.values()) {
      if (n.path.length) n.followPath(this.map, dt, [this.player]);
      else {
        n.moving = false;
        if (n.idle === 'wander' && !blocked) {
          n.wanderT -= dt;
          if (n.wanderT <= 0) {
            n.wanderT = 3 + Math.random() * 5;
            const tx = Math.floor(n.homeX / TILE) + Math.round((Math.random() - 0.5) * 6);
            const ty = Math.floor(n.homeY / TILE) + Math.round((Math.random() - 0.5) * 4);
            if (tx >= 0 && ty >= 0 && tx < this.map.w && ty < this.map.h && !this.map.blocked[ty * this.map.w + tx]) n.goTo(this.map, tx, ty);
          }
        }
      }
    }
    this.animateActors(actors, dt);
    this.updateCamera(dt);
    this.hud?.update();
    this.fx.update(dt);
    this.updateWeather(dt);
    this.updateAtmosphere(dt);
    this.updatePrompt();
  }

  /** Time-of-day grade and ambient particles (rendering state only). */
  private updateAtmosphere(dt: number): void {
    const indoor = !!this.map.def.indoor;
    this.grade = gradeAt(G.time.minutes, G.weather.today, indoor, this.map.def.indoorLight ?? 0.95);
    const { w, h } = game.screen;
    this.particles.update(dt, { x: this.cam.x, y: this.cam.y, w, h }, this.grade, !indoor, game.t);
  }

  private handleInput(dt: number): void {
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
      // Hold-to-walk toward the finger.
      const sp = this.toScreen(p.x, p.y - 12);
      const dx = inp.pointer.x - sp.x;
      const dy = inp.pointer.y - sp.y;
      const d = Math.hypot(dx, dy);
      if (d > 6) {
        vx = dx / d;
        vy = dy / d;
        p.stop();
      }
    }
    const run = inp.isHeld('run') ? 1.45 : 1;
    if (vx || vy) {
      // A quick ease into the walk (about a tenth of a second), so starts aren't a jolt.
      p.ramp = Math.min(1, p.ramp + dt / 0.1);
      const sp = p.speed * run * (0.55 + 0.45 * p.ramp);
      p.running = run > 1;
      const moved = p.move(this.map, vx * sp * dt, vy * sp * dt, [...this.npcs.values()]);
      p.moving = moved;
      // Walking up into a door enters it.
      if (vy < -0.5) this.tryDoor(true);
    } else if (p.path.length) {
      p.running = false;
      p.followPath(this.map, dt, [...this.npcs.values()]);
    } else {
      p.moving = false;
    }
    // Walk-on warps (edges, interior exits).
    const w = this.map.warpAt(p.x, p.y - 2, false);
    if (w && !w.door) {
      void this.useWarp(w);
      return;
    }
    // Taps.
    for (const t of inp.takeTaps()) this.onTap(t.x, t.y);
    if (inp.consume('interact')) this.interact();
    if ((inp.consume('menu') || inp.consume('cancel')) && !game.sleeping) void import('../ui/menu').then((m) => m.openMenu());
  }

  /** Turn frames, hops, emotes; footfalls become dust, splashes and step sounds. */
  private animateActors(actors: Actor[], dt: number): void {
    const raining = (G.weather.today === 'rain' || G.weather.today === 'storm') && !this.map.def.indoor;
    const now = performance.now();
    for (const a of actors) {
      const hopping = a.hopT >= 0;
      a.animate(dt);
      if (hopping && a.hopT < 0 && a.visible) this.footfall(a, raining, 1.6, 0);
      if (!a.stepped) continue;
      a.stepped = 0;
      if (!a.visible) continue;
      this.footfall(a, raining, a.running ? 1.4 : 1, a.phase);
      if (a === this.player && now - this.lastStepSfx > 170) {
        this.lastStepSfx = now;
        // Alternate feet a touch, like real footfalls.
        const left = Math.floor(a.phase * 2) & 1;
        audio.sfx('step', { volume: a.running ? 0.42 : 0.34, pitch: (left ? 0.92 : 1.02) + Math.random() * 0.08 });
      }
    }
    this.steps.update(dt);
  }

  /** Dust or a splash where a foot just landed. */
  private footfall(a: Actor, raining: boolean, strength: number, phase: number): void {
    const left = Math.floor(phase * 2) & 1;
    const f = a.facing;
    let x = a.x;
    let y = a.y;
    if (f === 'left' || f === 'right') x += (f === 'right' ? 1 : -1) * 3;
    else {
      x += left ? -2 : 2;
      y += f === 'down' ? 1 : -1;
    }
    const t = this.map.terrainAt(Math.floor(x / TILE), Math.floor((y - 1) / TILE));
    this.steps.step(x, y, f, t, raining, strength);
  }

  private async useWarp(w: Warp): Promise<void> {
    // tryDoor() fires every frame while walking up into a door; without this
    // guard a locked door queued several stacked "closed" dialogs before the
    // first one blocked input (stacked dialogs hang on touch-only devices).
    if (this.busy || this.warping) return;
    const locked = w.locked?.() ?? DOOR_RULES.get(w.to)?.() ?? null;
    if (locked) {
      this.busyDepth++;
      try {
        this.player.stop();
        // Step back off the warp so it doesn't retrigger.
        this.player.y += w.door ? 0 : -4;
        const { say } = await import('../ui/dialog');
        await say(null, locked);
        // Don't let a still-held key re-open the same message instantly.
        game.input.clear();
      } finally {
        this.release();
      }
      return;
    }
    await this.warpTo(w.to, w.tx, w.ty, w.facing ?? 'down');
  }

  private tryDoor(walking: boolean): boolean {
    const p = this.player;
    const w = this.map.warpAt(p.x, p.y - 2, true) ?? this.map.warpAt(p.x, p.y - 10, true);
    if (w && w.door && (!walking || p.facing === 'up')) {
      void this.useWarp(w);
      return true;
    }
    return false;
  }

  toScreen(x: number, y: number): { x: number; y: number } {
    return { x: Math.round(x - this.cam.x), y: Math.round(y - this.cam.y) };
  }

  toWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: sx + this.cam.x, y: sy + this.cam.y };
  }

  private onTap(sx: number, sy: number): void {
    const wp = this.toWorld(sx, sy);
    const p = this.player;
    // Tapped an NPC?
    for (const n of this.npcs.values()) {
      if (Math.abs(n.x - wp.x) < 10 && wp.y < n.y + 3 && wp.y > n.y - 32) {
        this.walkThen(n.tx, n.ty, () => {
          p.faceToward(n.x, n.y);
          void this.talk(n);
        });
        return;
      }
    }
    // Tapped an interactable object?
    for (const o of this.map.objects) {
      if (o.hidden) continue;
      if (!this.isInteractable(o)) continue;
      const hb = this.map.objectHit(o);
      if (hb && wp.x >= hb.x - 2 && wp.x <= hb.x + hb.w + 2 && wp.y >= hb.y - 18 && wp.y <= hb.y + hb.h + 2) {
        const tx = Math.floor((hb.x + hb.w / 2) / TILE);
        const ty = Math.floor((hb.y + hb.h + 4) / TILE);
        this.walkThen(tx, ty, () => {
          p.faceToward(o.x, o.y - 4);
          void this.useObject(o);
        });
        return;
      }
    }
    // Tapped a door?
    const tx = Math.floor(wp.x / TILE);
    const ty = Math.floor(wp.y / TILE);
    for (const w of this.map.def.warps) {
      if (!w.door) continue;
      if (tx >= w.x - 1 && tx <= w.x + w.w && ty >= w.y - 3 && ty <= w.y + w.h) {
        this.walkThen(w.x, w.y + w.h - 1, () => {
          p.facing = 'up';
          void this.useWarp(w);
        });
        return;
      }
    }
    // Otherwise walk there.
    if (!p.goTo(this.map, tx, ty)) audio.sfx('error', { volume: 0.3 });
    this.fx.burst(wp.x, wp.y, 4, ['#fff4dc', '#f4b63f'], { speed: 20, gravity: 0, max: 0.35 });
  }

  private walkThen(tx: number, ty: number, fn: () => void): void {
    const p = this.player;
    const d = Math.hypot(p.tx - tx, p.ty - ty);
    if (d <= 1.5) {
      p.stop();
      fn();
      return;
    }
    // Path to the nearest walkable neighbor of the target tile.
    let best: { x: number; y: number } | null = null;
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
    if (!best) {
      audio.sfx('error', { volume: 0.3 });
      return;
    }
    p.goTo(this.map, best.x, best.y, () => fn());
  }

  /** Find what the player would interact with right now. */
  private findTarget(): WorldScene['interactTarget'] {
    const p = this.player;
    const dx = p.facing === 'left' ? -1 : p.facing === 'right' ? 1 : 0;
    const dy = p.facing === 'up' ? -1 : p.facing === 'down' ? 1 : 0;
    const fx = p.x + dx * 12;
    const fy = p.y + dy * 12 - 3;
    let bestN: NpcActor | null = null;
    let bd = 20;
    for (const n of this.npcs.values()) {
      const d = Math.hypot(n.x - fx, n.y - fy);
      if (d < bd) {
        bd = d;
        bestN = n;
      }
    }
    if (bestN) return { kind: 'npc', npc: bestN };
    const probe = { x: fx - 4, y: fy - 4, w: 8, h: 8 };
    for (const o of this.map.objects) {
      if (o.hidden || !this.isInteractable(o)) continue;
      const hb = this.map.objectHit(o);
      if (hb && boxesOverlap(probe, hb)) return { kind: 'obj', obj: o };
    }
    const w = this.map.warpAt(p.x, p.y - 2, true) ?? this.map.warpAt(fx, fy, true);
    if (w?.door) return { kind: 'warp', warp: w };
    return null;
  }

  isInteractable(o: MapObject): boolean {
    return ACTIONS.has(String(o.props.action ?? '')) || ACTIONS.has(o.id) || ACTIONS.has(o.kind) || typeof o.props.text === 'string';
  }

  private updatePrompt(): void {
    const t = game.blockers > 0 || this.busy ? null : this.findTarget();
    this.interactTarget = t;
    let label: string | null = null;
    if (t?.kind === 'npc') label = 'Talk';
    else if (t?.kind === 'warp') label = t.warp.label ?? 'Enter';
    else if (t?.kind === 'obj') label = objectKind(t.obj.kind).label?.(t.obj) ?? (typeof t.obj.props.text === 'string' ? 'Read' : 'Check');
    if (label !== this.promptLabel) {
      this.promptLabel = label;
      this.onPrompt?.(label);
    }
  }

  interact(): void {
    const t = this.findTarget();
    if (!t) return;
    this.player.stop();
    if (t.kind === 'npc') void this.talk(t.npc);
    else if (t.kind === 'obj') void this.useObject(t.obj);
    else if (t.kind === 'warp') void this.useWarp(t.warp);
  }

  private async talk(n: NpcActor): Promise<void> {
    if (this.busy) return;
    this.busyDepth++;
    try {
      n.faceToward(this.player.x, this.player.y);
      this.player.faceToward(n.x, n.y);
      const { talkTo } = await import('./talk');
      await talkTo(n.def.id, placeKind(this.map.id, n.tx, n.ty));
    } finally {
      this.release();
      n.facing = (n.def.schedule(dayCtx()).find((e) => e.map === this.map.id)?.facing ?? n.facing) as Dir;
    }
  }

  private async useObject(o: MapObject): Promise<void> {
    if (this.busy) return;
    this.busyDepth++;
    try {
      const fn = ACTIONS.get(String(o.props.action ?? '')) ?? ACTIONS.get(o.id) ?? ACTIONS.get(o.kind);
      if (fn) await fn({ object: o, mapId: this.map.id });
      else if (typeof o.props.text === 'string') {
        const { say } = await import('../ui/dialog');
        await say(null, o.props.text);
      }
    } finally {
      this.release();
    }
  }

  // ------------------------------------------------------------ camera & weather

  private snapCamera(): void {
    this.updateCamera(1000);
  }

  private updateCamera(dt: number): void {
    const { w, h } = game.screen;
    const p = this.player;
    let tx = p.x - w / 2;
    let ty = p.y - 12 - h / 2;
    if (this.map.pxW <= w) tx = (this.map.pxW - w) / 2;
    else tx = Math.max(0, Math.min(this.map.pxW - w, tx));
    if (this.map.pxH <= h) ty = (this.map.pxH - h) / 2;
    else ty = Math.max(0, Math.min(this.map.pxH - h, ty));
    const k = Math.min(1, dt * 8);
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
    if (Math.abs(tx - this.cam.x) < 0.3) this.cam.x = tx;
    if (Math.abs(ty - this.cam.y) < 0.3) this.cam.y = ty;
  }

  private updateWeather(dt: number): void {
    const raining = (G.weather.today === 'rain' || G.weather.today === 'storm') && !this.map.def.indoor;
    const { w, h } = game.screen;
    if (raining) {
      const want = G.weather.today === 'storm' ? 220 : 120;
      while (this.rain.length < want) this.rain.push({ x: Math.random() * w, y: Math.random() * h, v: 180 + Math.random() * 80 });
      for (const r of this.rain) {
        r.y += r.v * dt;
        r.x -= r.v * 0.25 * dt;
        if (r.y > h) {
          r.y = -6;
          r.x = Math.random() * (w + 40);
        }
      }
    } else this.rain.length = 0;
  }

  // ------------------------------------------------------------ render

  render(ctx: CanvasRenderingContext2D): void {
    const { w, h } = game.screen;
    const g = this.grade;
    const cx = Math.round(this.cam.x);
    const cy = Math.round(this.cam.y);
    // Objects are drawn first onto a cleared buffer while their sprites are
    // collected as shadow casters; the sun shadows and the ground then go in
    // behind them with destination-over, so shadows land on the ground only.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);

    // Depth-sorted drawables.
    type D = { y: number; draw: () => void };
    const list: D[] = [];
    const above: (() => void)[] = [];
    const view = { x: cx - 120, y: cy - 160, w: w + 240, h: h + 240 };
    ctx.save();
    ctx.translate(-cx, -cy);
    setCollecting(true);
    for (const o of this.map.objects) {
      if (o.hidden) continue;
      if (o.x < view.x || o.x > view.x + view.w || o.y < view.y || o.y > view.y + view.h + 140) continue;
      const k = objectKind(o.kind);
      if (k.flat) continue;
      if (k.above) above.push(() => k.draw(ctx, o, game.t));
      else list.push({ y: o.y + (k.sortY ?? 0), draw: () => k.draw(ctx, o, game.t) });
    }
    const drawActor = (a: Actor, npc?: NpcActor) => {
      // Soft dithered contact shadow, leaning with the sun.
      const hop = a.hopState();
      drawActorShadow(ctx, a.x, a.y, g);
      const walking = a.moving || a.settling;
      let pose: Pose = walking ? (a.running && a.moving ? 'run' : 'walk') : 'idle';
      if (npc && !walking) {
        if (npc.idle === 'sit') pose = 'sit';
        else if (npc.idle === 'wave' && Math.sin(game.t * 2 + a.x) > 0.6) pose = 'wave';
      }
      let frame = Math.floor(a.phase * (pose === 'run' ? RUN_FRAMES : WALK_FRAMES));
      let y = a.y;
      if (hop && !a.moving && pose !== 'sit') {
        pose = 'hop';
        frame = hop.frame;
        y -= Math.round(hop.h * 2) / 2;
      }
      if (a.pose) pose = a.pose as Pose;
      drawCharacter(ctx, a.look, a.x, y, { facing: a.shownFacing, pose, frame, t: game.t + (npc ? a.x * 0.01 : 0), quirk: npc ? IDLE_QUIRK[npc.id] : undefined });
      if (a.emote) this.drawEmote(ctx, a, y - a.y);
    };
    this.steps.draw(ctx);
    if (this.player.visible) list.push({ y: this.player.y, draw: () => drawActor(this.player) });
    for (const n of this.npcs.values()) if (n.visible) list.push({ y: n.y, draw: () => drawActor(n, n) });
    list.sort((a, b) => a.y - b.y);
    for (const d of list) d.draw();
    for (const a of above) a();
    setCollecting(false);
    // Ambient particles (pollen, petals, fireflies) float above the scenery.
    this.particles.draw(ctx, g, game.t);
    // Interaction marker above target.
    const t = this.interactTarget;
    // (An emote bubble takes the spot over an NPC's head while it shows.)
    if (t && game.blockers === 0 && !this.busy && !(t.kind === 'npc' && t.npc.emote)) {
      let mx = 0;
      let my = 0;
      if (t.kind === 'npc') {
        mx = t.npc.x;
        my = t.npc.y - 36;
      } else if (t.kind === 'obj') {
        const hb = this.map.objectHit(t.obj)!;
        mx = hb.x + hb.w / 2;
        my = hb.y - 14;
      } else {
        mx = (t.warp.x + t.warp.w / 2) * TILE;
        my = t.warp.y * TILE - 14;
      }
      const bob = Math.round(Math.sin(game.t * 5) * 1.5);
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(Math.round(mx) - 4, Math.round(my) + bob - 1, 9, 9);
      ctx.fillStyle = '#fbf0d9';
      ctx.fillRect(Math.round(mx) - 3, Math.round(my) + bob, 7, 7);
      ctx.fillStyle = '#d8434b';
      ctx.fillRect(Math.round(mx), Math.round(my) + bob + 1, 1, 3);
      ctx.fillRect(Math.round(mx), Math.round(my) + bob + 5, 1, 1);
    }
    this.fx.render(ctx);
    // Sun shadows, then the ground, then the outside colour: all behind what is drawn.
    ctx.globalCompositeOperation = 'destination-over';
    drawCastShadows(ctx, g, { x: cx, y: cy, w, h });
    ctx.drawImage(this.map.ground(), 0, 0);
    ctx.restore();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = this.map.def.outside ?? '#1d1626';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    this.renderLighting(ctx, cx, cy, w, h);
    // Rain on top.
    if (this.rain.length) {
      ctx.fillStyle = 'rgba(200,215,255,0.55)';
      for (const r of this.rain) ctx.fillRect(Math.round(r.x), Math.round(r.y), 1, 4);
    }
    // Map name card on arrival.
    if (game.debug) pixelTextOutlined(ctx, `${this.map.id} ${this.player.tx},${this.player.ty}`, 4, h - 10, '#fff', '#2b2140');
  }

  private drawEmote(ctx: CanvasRenderingContext2D, a: Actor, yOff = 0): void {
    const e = a.emote!;
    const age = e.age ?? 0;
    // Pop in with squash and stretch: shoot up tall and thin, splat wide, settle; then a gentle float.
    const K = [
      [0, 0.2, 1.7],
      [0.07, 1.25, 0.8],
      [0.13, 0.9, 1.12],
      [0.2, 1.05, 0.96],
      [0.27, 1, 1],
    ];
    let sx = 1;
    let sy = 1;
    for (let i = 0; i < K.length - 1; i++) {
      if (age >= K[i][0] && age < K[i + 1][0]) {
        const k = (age - K[i][0]) / (K[i + 1][0] - K[i][0]);
        sx = K[i][1] + (K[i + 1][1] - K[i][1]) * k;
        sy = K[i][2] + (K[i + 1][2] - K[i][2]) * k;
      }
    }
    // Shrink away in the last tenth of a second.
    if (e.t < 0.12) {
      const k = Math.max(0, e.t / 0.12);
      sx *= 0.4 + 0.6 * k;
      sy *= 1.3 - 0.3 * k;
    }
    const rise = age < 0.2 ? (1 - age / 0.2) * 4 : 0;
    const float = age > 0.27 ? Math.round(Math.sin((age - 0.27) * 4) * 1) : 0;
    const x = Math.round(a.x);
    const by = Math.round(a.y + yOff - 34 + rise + float);
    const w = Math.max(3, Math.round(13 * sx));
    const h = Math.max(3, Math.round(11 * sy));
    const x0 = x + 0.5 - w / 2;
    // The bubble sits on its tail, so it grows upward from it.
    const y0 = by - h;
    ctx.fillStyle = '#2b2140';
    ctx.fillRect(Math.round(x0), y0, w, h);
    ctx.fillRect(x - 1, by, 3, 1);
    ctx.fillRect(x, by + 1, 1, 1);
    ctx.fillStyle = '#fbf0d9';
    ctx.fillRect(Math.round(x0) + 1, y0 + 1, w - 2, h - 2);
    ctx.fillRect(x, by, 1, 1);
    if (sx > 0.7 && sy > 0.7 && sy < 1.3) {
      const ic = EMOTE_ICONS[e.icon];
      if (!ic) pixelTextOutlined(ctx, e.icon, x - 1, y0 + Math.round((h - 5) / 2), '#d8434b', '#fbf0d9');
      else {
        // Hand-placed icons on the half-pixel grid: ink, fill and a highlight.
        const rows = ic.px;
        const iw = rows[0].length / 2;
        const ih = rows.length / 2;
        const ix = x + 0.5 - iw / 2;
        // A heart gives a little beat.
        const beat = e.icon === '♥' && age > 0.27 && (age - 0.27) % 0.9 < 0.12 ? 0.5 : 0;
        const iy = y0 + Math.round((h - ih) / 2) - beat;
        for (let r = 0; r < rows.length; r++)
          for (let c = 0; c < rows[r].length; c++) {
            const ch = rows[r][c];
            if (ch === '.') continue;
            ctx.fillStyle = ch === '#' ? ic.ink : ch === 'o' ? ic.fill : ic.hi;
            ctx.fillRect(ix + c / 2, iy + r / 2, 0.5, 0.5);
          }
      }
    }
  }

  private renderLighting(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number): void {
    if (w < 1 || h < 1) return;
    const g = this.grade;
    const indoor = !!this.map.def.indoor;
    // Light sources in view (plus a faint glow on the player outdoors so they never vanish).
    const amb = g.amb;
    const lights: { x: number; y: number; r: number; color: string; base: number; kind: string; wallH: number }[] = [];
    if (g.lights > 0.02) {
      for (const o of this.map.objects) {
        if (o.hidden) continue;
        const k = objectKind(o.kind);
        if (!k.lights) continue;
        for (const li of k.lights(o)) {
          if (li.x - cx < -li.r * 1.5 || li.x - cx > w + li.r * 1.5 || li.y - cy < -li.r * 1.5 || li.y - cy > h + li.r * 1.5) continue;
          lights.push({ x: li.x, y: li.y, r: li.r, color: li.color, base: o.y, kind: o.kind, wallH: k.solid?.h ?? 0 });
        }
      }
      // Only in real darkness: at dawn or dusk it would punch a daylight hole in the grade.
      if (!indoor && g.lights > 0.85 && amb[0] < 140) lights.push({ x: this.player.x, y: this.player.y - 10, r: 30, color: '#ffe8c0', base: this.player.y, kind: 'player', wallH: 0 });
    }
    // 1. Lightmap: the ambient colour with every light added, multiplied over the scene.
    if (amb[0] < 252 || amb[1] < 252 || amb[2] < 252 || lights.length) {
      const lc = this.lightCanvas;
      if (lc.width !== w || lc.height !== h) {
        lc.width = w;
        lc.height = h;
      }
      const l = lc.getContext('2d')!;
      l.imageSmoothingEnabled = false;
      l.globalCompositeOperation = 'source-over';
      l.globalAlpha = 1;
      l.fillStyle = `rgb(${amb[0] | 0},${amb[1] | 0},${amb[2] | 0})`;
      l.fillRect(0, 0, w, h);
      if (lights.length) {
        l.globalCompositeOperation = 'lighter';
        l.globalAlpha = g.lights;
        for (const li of lights) {
          const spr = lightSprite(li.color, li.r);
          l.drawImage(spr, Math.round(li.x - cx - spr.width / 2), Math.round(li.y - cy - spr.height / 2));
          if (li.kind === 'player') continue;
          const above = li.base - li.y;
          const facade = li.kind.startsWith('b-') || li.kind === 'airstream' || li.kind === 'gazebo' || li.kind === 'bus-stop' || li.kind === 'tent';
          if (facade) {
            // windows and doors spill a warm trapezoid onto the sidewalk
            if (above > 6 && above < li.wallH * 1.15 + 8) {
              const sp = spillSprite(li.color, Math.round(li.r * 0.9), Math.round(li.r * 0.75));
              l.drawImage(sp, Math.round(li.x - cx - sp.width / 2), Math.round(li.base - cy - 1));
            }
          } else if (above > 10 && !indoor) {
            // lamps pool light on the ground under them
            const pool = lightSprite(li.color, Math.round(li.r * 1.1), 0.45);
            l.drawImage(pool, Math.round(li.x - cx - pool.width / 2), Math.round(li.base - cy - pool.height / 2 + 2));
          }
        }
      }
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 1;
      ctx.drawImage(lc, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    }
    // 2. Colour grade, then golden-hour rays.
    drawGrade(ctx, g, w, h);
    drawRays(ctx, g, w, h, game.t);
    // 3. Bloom: a soft additive halo on every light.
    if (lights.length && g.lights > 0.05) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.22 * g.lights;
      for (const li of lights) {
        if (li.kind === 'player') continue;
        const spr = lightSprite(li.color, Math.round(li.r * 0.7), 1, 5, 2.2);
        ctx.drawImage(spr, Math.round(li.x - cx - spr.width / 2), Math.round(li.y - cy - spr.height / 2));
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }

  // ------------------------------------------------------------ cutscene helpers

  /** Place an NPC on this map for a scripted scene (outside their schedule). */
  spawnTemp(id: string, tx: number, ty: number, facing: Dir = 'down'): NpcActor | null {
    const def = NPCS.find((n) => n.id === id);
    if (!def) return null;
    let a = this.npcs.get(id);
    if (!a) {
      a = new NpcActor(def, tx * TILE + TILE / 2, ty * TILE + TILE - 3);
      this.npcs.set(id, a);
    } else {
      a.x = tx * TILE + TILE / 2;
      a.y = ty * TILE + TILE - 3;
    }
    a.homeX = a.x;
    a.homeY = a.y;
    a.facing = facing;
    a.idle = 'still';
    a.leaving = false;
    a.stop();
    return a;
  }

  /** Walk an actor (NPC id or 'player') to a tile; resolves on arrival. */
  walkTo(id: string, tx: number, ty: number, facing?: Dir): Promise<void> {
    const a = id === 'player' ? this.player : this.npcs.get(id);
    if (!a) return Promise.resolve();
    return new Promise((resolve) => {
      const ok = a.goTo(this.map, tx, ty, () => {
        if (facing) a.facing = facing;
        if (a instanceof NpcActor) {
          a.homeX = a.x;
          a.homeY = a.y;
        }
        resolve();
      });
      if (!ok) resolve();
      // Safety: never hang a cutscene.
      setTimeout(resolve, 9000);
    });
  }

  /** Remove a temp NPC from the map. */
  despawn(id: string): void {
    this.npcs.delete(id);
  }

  /** Small helper for systems: show an emote over an actor. */
  emote(id: string, icon: string, seconds = 1.8): void {
    const a = id === 'player' ? this.player : this.npcs.get(id);
    if (!a) return;
    a.emote = { icon, t: seconds, age: 0 };
    // Hearts and delight get a happy little hop.
    if (icon === '♥' || icon === '♪' || icon === '!') a.hop();
  }

  /** A happy hop (gifts that land, heart events). */
  hop(id: string): void {
    const a = id === 'player' ? this.player : this.npcs.get(id);
    a?.hop();
  }

  notify(text: string): void {
    toast(text);
  }
}

function absDayNow(): number {
  return (G.time.year - 1) * 112 + G.time.season * 28 + (G.time.day - 1);
}
