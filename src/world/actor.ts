import type { Dir } from '../core/state';
import { cycleLength, WALK_FRAMES } from '../gfx/characters';
import type { Look } from '../gfx/look';
import type { GameMap } from './map';
import { findPath } from './pathfind';
import { TILE } from './types';

/** Hop timeline (seconds): crouch, airborne until `land`, squash until `end`. */
const HOP = { crouch: 0.07, land: 0.37, end: 0.46, height: 5 };

/** Anything that walks around a map: the player and townsfolk. */
export class Actor {
  id: string;
  look: Look;
  x: number;
  y: number;
  facing: Dir = 'down';
  speed = 62; // px/s
  moving = false;
  /** Running gait (longer stride, flight phase) while moving. */
  running = false;
  /**
   * Gait phase in cycles (two steps per cycle). It advances by distance
   * actually travelled, not time, so planted feet never skate.
   */
  phase = 0.25;
  /** Set when a foot lands; the scene consumes it for dust and step sounds. */
  stepped = 0;
  /** The facing actually drawn: lags `facing` by one quick turn frame. */
  shownFacing: Dir = 'down';
  private turnT = 0;
  private lastFacing: Dir = 'down';
  /** Settling into a stand after stopping mid-stride. */
  settling = false;
  private wasMoving = false;
  private lastMoveAt = 0;
  /** Seconds into a happy hop, or -1. */
  hopT = -1;
  /** Start-up ease for the player's walk (0..1). */
  ramp = 0;
  path: { x: number; y: number }[] = [];
  /** Called when a path finishes. */
  onArrive: (() => void) | null = null;
  /** Feet collision box half-size. */
  bw = 5;
  bh = 3;
  visible = true;
  /** Emote bubble shown over the head (t = seconds left, age = seconds shown). */
  emote: { icon: string; t: number; age?: number } | null = null;
  pose: string | null = null;
  constructor(id: string, look: Look, x: number, y: number) {
    this.id = id;
    this.look = look;
    this.x = x;
    this.y = y;
  }

  /**
   * Legacy walk clock: Math.floor(walkT * 8) is the walk frame. It now reads
   * the distance-driven phase; writes are ignored because move() advances
   * the phase itself (scenes that still add time keep working, now in sync).
   */
  get walkT(): number {
    return (this.phase * WALK_FRAMES) / 8;
  }
  set walkT(_v: number) {
    // Driven by distance in advance().
  }

  /** World px per gait cycle for this actor's body and gait. */
  cycle(): number {
    return cycleLength(this.look, this.running);
  }

  /** Advance the gait by a distance moved; flags footfalls. */
  advance(dist: number): void {
    if (dist <= 0) return;
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.004, (now - this.lastMoveAt) / 1000));
    this.lastMoveAt = now;
    // Planted feet need cadence = speed / stride. Past a brisk cap the
    // stride stretches instead (a little skate beats frantic legs).
    const cap = this.running ? 3.4 : 3.1;
    const C = Math.max(this.cycle(), dist / dt / cap);
    const before = this.phase;
    this.phase += dist / C;
    this.settling = false;
    // Footfalls at phase 0 and 0.5 (contact frames).
    if (Math.floor(before * 2) !== Math.floor(this.phase * 2)) this.stepped++;
    if (this.phase > 1e6) this.phase -= 1e6;
  }

  /** Per-frame animation upkeep: turn frames, stop settling, hops, emotes. */
  animate(dt: number): void {
    // Turning round: show the in-between facing for a beat.
    if (this.facing !== this.lastFacing) {
      const opp = (this.facing === 'left' && this.lastFacing === 'right') || (this.facing === 'right' && this.lastFacing === 'left') || (this.facing === 'up' && this.lastFacing === 'down') || (this.facing === 'down' && this.lastFacing === 'up');
      if (opp) {
        this.shownFacing = this.facing === 'left' || this.facing === 'right' ? 'down' : this.facing === 'up' ? 'left' : 'right';
        this.turnT = 0.07;
      } else {
        this.shownFacing = this.facing;
        this.turnT = 0;
      }
      this.lastFacing = this.facing;
    }
    if (this.turnT > 0) {
      this.turnT -= dt;
      if (this.turnT <= 0) this.shownFacing = this.facing;
    } else this.shownFacing = this.facing;
    // Stopping: finish the step into the passing pose rather than snapping to a stand.
    if (this.wasMoving && !this.moving) {
      const q = this.phase % 0.5;
      this.settling = q > 0.02 && q < 0.25 - 0.02;
    }
    if (!this.moving) this.ramp = 0;
    this.wasMoving = this.moving;
    if (this.settling) {
      const target = Math.floor(this.phase / 0.5) * 0.5 + 0.25;
      this.phase = Math.min(target, this.phase + dt * 3.5);
      if (this.phase >= target - 1e-4) this.settling = false;
    }
    if (this.hopT >= 0) {
      this.hopT += dt;
      if (this.hopT > HOP.end) this.hopT = -1;
    }
    if (this.emote) {
      this.emote.age = (this.emote.age ?? 0) + dt;
      this.emote.t -= dt;
      if (this.emote.t <= 0) this.emote = null;
    }
  }

  /** A happy little hop (heart events, gifts that land). */
  hop(): void {
    if (this.hopT < 0) this.hopT = 0;
  }

  /** Hop state for drawing: pose frame (0 crouch, 1 airborne) and height in px. */
  hopState(): { frame: number; h: number } | null {
    const t = this.hopT;
    if (t < 0) return null;
    if (t < HOP.crouch) return { frame: 0, h: 0 };
    if (t < HOP.land) {
      const k = (t - HOP.crouch) / (HOP.land - HOP.crouch);
      return { frame: 1, h: HOP.height * 4 * k * (1 - k) };
    }
    return { frame: 0, h: 0 };
  }

  get tx(): number {
    return Math.floor(this.x / TILE);
  }
  get ty(): number {
    return Math.floor((this.y - 2) / TILE);
  }

  box(x = this.x, y = this.y) {
    return { x: x - this.bw, y: y - this.bh, w: this.bw * 2, h: this.bh * 2 };
  }

  /** Try to move by (dx, dy) with sliding collision. Returns true if moved. */
  move(map: GameMap, dx: number, dy: number, blockers: Actor[] = []): boolean {
    let moved = false;
    const x0 = this.x;
    const y0 = this.y;
    const hits = (bx: number, by: number) => {
      if (map.collides(this.box(bx, by))) return true;
      for (const a of blockers) {
        if (a === this || !a.visible) continue;
        const b = a.box();
        const m = this.box(bx, by);
        if (m.x < b.x + b.w && m.x + m.w > b.x && m.y < b.y + b.h && m.y + m.h > b.y) return true;
      }
      return false;
    };
    if (dx && !hits(this.x + dx, this.y)) {
      this.x += dx;
      moved = true;
    } else if (dx && !dy) {
      // Corner assist: nudge around tile edges.
      for (const ny of [-2, 2, -4, 4]) if (!hits(this.x + dx, this.y + ny) && !hits(this.x, this.y + ny)) {
        this.y += Math.sign(ny);
        moved = true;
        break;
      }
    }
    if (dy && !hits(this.x, this.y + dy)) {
      this.y += dy;
      moved = true;
    } else if (dy && !dx) {
      for (const nx of [-2, 2, -4, 4]) if (!hits(this.x + nx, this.y + dy) && !hits(this.x + nx, this.y)) {
        this.x += Math.sign(nx);
        moved = true;
        break;
      }
    }
    if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
    else if (dy) this.facing = dy > 0 ? 'down' : 'up';
    if (moved) this.advance(Math.hypot(this.x - x0, this.y - y0));
    return moved;
  }

  /** Path to a tile; returns false if unreachable. */
  goTo(map: GameMap, tx: number, ty: number, onArrive?: () => void): boolean {
    const p = findPath(map, this.tx, this.ty, tx, ty);
    if (!p) return false;
    this.path = p;
    this.onArrive = onArrive ?? null;
    if (!p.length) {
      const cb = this.onArrive;
      this.onArrive = null;
      cb?.();
    }
    return true;
  }

  /** Follow the current path. Returns true while moving. */
  followPath(map: GameMap, dt: number, blockers: Actor[] = []): boolean {
    if (!this.path.length) return false;
    const n = this.path[0];
    const gx = n.x * TILE + TILE / 2;
    const gy = n.y * TILE + TILE - 4;
    const dx = gx - this.x;
    const dy = gy - this.y;
    const d = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (d <= step + 0.5) {
      // Snap only if free; otherwise let sliding resolve it.
      if (!map.collides(this.box(gx, gy))) {
        this.advance(Math.hypot(gx - this.x, gy - this.y));
        this.x = gx;
        this.y = gy;
      }
      this.path.shift();
      if (!this.path.length) {
        const cb = this.onArrive;
        this.onArrive = null;
        cb?.();
      }
    } else {
      const before = { x: this.x, y: this.y };
      this.move(map, (dx / d) * step, (dy / d) * step, blockers);
      if (Math.abs(before.x - this.x) < 0.01 && Math.abs(before.y - this.y) < 0.01) {
        // Stuck: drop this node.
        this.path.shift();
      }
    }
    this.moving = true;
    return true;
  }

  stop(): void {
    this.path = [];
    this.onArrive = null;
    this.moving = false;
  }

  faceToward(x: number, y: number): void {
    const dx = x - this.x;
    const dy = y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
    else this.facing = dy > 0 ? 'down' : 'up';
  }
}
