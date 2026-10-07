import type { Dir } from '../core/state';
import type { Look } from '../gfx/look';
import type { GameMap } from './map';
import { findPath } from './pathfind';
import { TILE } from './types';

/** Anything that walks around a map: the player and townsfolk. */
export class Actor {
  id: string;
  look: Look;
  x: number;
  y: number;
  facing: Dir = 'down';
  speed = 62; // px/s
  moving = false;
  walkT = 0;
  path: { x: number; y: number }[] = [];
  /** Called when a path finishes. */
  onArrive: (() => void) | null = null;
  /** Feet collision box half-size. */
  bw = 5;
  bh = 3;
  visible = true;
  /** Emote bubble shown over the head. */
  emote: { icon: string; t: number } | null = null;
  pose: string | null = null;
  constructor(id: string, look: Look, x: number, y: number) {
    this.id = id;
    this.look = look;
    this.x = x;
    this.y = y;
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
    this.walkT += dt;
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
