import type { Dir } from '../core/state';
import type { TerrainId } from './types';

/**
 * Footstep juice: dust puffs kicked up on dirt and sand, splashes in rain
 * and puddles, and a bigger puff when a hop lands. Drawn on the half-pixel
 * grid (the screen buffer is 2x) as round pixel blobs, never smooth arcs.
 */

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius (px) at birth and at death. */
  r0: number;
  r1: number;
  life: number;
  max: number;
  color: string;
  hi: string;
  alpha: number;
  kind: 'puff' | 'drop' | 'ring' | 'leaf';
  g: number;
  /** Leaves: the ground line they settle on, and a tumble phase. */
  floor?: number;
  spin?: number;
}

// [body, lit top]: a touch lighter than the ground they rise from, so they read.
const DUST: Partial<Record<TerrainId, [string, string]>> = {
  dirt: ['#dcc29a', '#f2e2c2'],
  'dirt-dark': ['#b8996f', '#d8c09a'],
  path: ['#e6d4ae', '#f8ecd2'],
  sand: ['#f6e6c0', '#fffaea'],
  gravel: ['#d2c8b8', '#ece6da'],
  tilled: ['#a8845e', '#c8a680'],
  snow: ['#eef0fa', '#ffffff'],
  parking: ['#cec6b8', '#e8e2d6'],
};
const WET: Partial<Record<TerrainId, [string, string]>> = {
  shallow: ['#a8d0ec', '#e8f6ff'],
  mud: ['#7a5a3e', '#a8865e'],
};
const RAIN_DROP: [string, string] = ['#b8d4ee', '#eef8ff'];

const MAX_BITS = 160;

/** Footstep sound families (sfx ids are `step-<family>`). */
export type StepSound = 'grass' | 'dirt' | 'gravel' | 'stone' | 'wood' | 'carpet' | 'tile' | 'snow' | 'water';

const STEP_SOUND: Partial<Record<TerrainId, StepSound>> = {
  grass: 'grass', 'grass-dark': 'grass', flowers: 'grass',
  dirt: 'dirt', 'dirt-dark': 'dirt', path: 'dirt', tilled: 'dirt', sand: 'dirt',
  gravel: 'gravel',
  sidewalk: 'stone', road: 'stone', 'road-line': 'stone', crosswalk: 'stone', brick: 'stone', concrete: 'stone', stone: 'stone', parking: 'stone', dungeon: 'stone',
  wood: 'wood', 'wood-dark': 'wood', bridge: 'wood',
  carpet: 'carpet', 'carpet-red': 'carpet', mat: 'carpet', rubber: 'carpet',
  tile: 'tile', checker: 'tile',
  snow: 'snow',
  shallow: 'water', mud: 'water', water: 'water',
};
const SOFT_GROUND = new Set<StepSound>(['grass', 'dirt', 'gravel']);

/**
 * Which footstep a foot on terrain `t` makes. On a snow day, open ground is
 * snow underfoot; in the rain, bare dirt squelches.
 */
export function stepSound(t: TerrainId, w: { raining?: boolean; snowy?: boolean } = {}): StepSound {
  const s = STEP_SOUND[t] ?? 'dirt';
  // Sidewalks and roads get shovelled; yards and paths don't.
  if (w.snowy && SOFT_GROUND.has(s)) return 'snow';
  if (w.raining && s === 'dirt' && t !== 'sand') return 'water';
  return s;
}

/** Bits of plant a foot kicks up on flowery or long-grass ground. */
const KICK: Partial<Record<TerrainId, string[]>> = {
  flowers: ['#ffb6cc', '#fff0f4', '#ffd050', '#9ad070'],
  'grass-dark': ['#5a9a4a', '#7ab858', '#4a8a44'],
};

export class StepFx {
  private bits: Bit[] = [];

  private push(b: Bit): void {
    if (this.bits.length >= MAX_BITS) this.bits.shift();
    this.bits.push(b);
  }

  /** A foot lands at (x, y) on `t`. `dir` is the walking direction (dust trails behind). */
  step(x: number, y: number, dir: Dir, t: TerrainId, raining: boolean, strength = 1, snowy = false): void {
    const bx = dir === 'left' ? 1 : dir === 'right' ? -1 : 0;
    const by = dir === 'up' ? 0.5 : dir === 'down' ? -0.5 : 0;
    const kick = KICK[t];
    if (kick && !snowy && Math.random() < 0.45 * strength) this.leaves(x, y - 1, kick, strength > 1 ? 2 : 1, 4, y + 1, -bx);
    if (snowy && (t === 'grass' || t === 'grass-dark' || t === 'flowers' || DUST[t])) t = 'snow';
    const wet = WET[t] ?? (raining ? (DUST[t] && t !== 'snow' ? ['#8a6e52', '#b09070'] as [string, string] : RAIN_DROP) : null);
    if (wet) {
      this.splash(x, y, wet, strength);
      return;
    }
    const dust = DUST[t];
    if (!dust) return;
    const n = strength > 1 ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const s = (i / Math.max(1, n - 1)) * 2 - 1;
      this.push({
        x: x + s * 1.5, y: y - 0.5, vx: (bx * 9 + s * 7 * strength) * (0.7 + Math.random() * 0.6), vy: -9 - Math.random() * 5 + by * 6,
        r0: 0.8, r1: 2.1 + Math.random() * 0.7 + (strength - 1) * 0.9, life: 0, max: 0.4 + Math.random() * 0.15,
        color: dust[0], hi: dust[1], alpha: 0.8, kind: 'puff', g: 6,
      });
    }
  }

  private splash(x: number, y: number, c: [string, string], strength: number): void {
    this.push({ x, y, vx: 0, vy: 0, r0: 1, r1: 3.5 + strength, life: 0, max: 0.32, color: c[1], hi: c[1], alpha: 0.6, kind: 'ring', g: 0 });
    const n = 3 + (strength > 1 ? 3 : 0);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.15 + (0.7 * i) / Math.max(1, n - 1));
      const s = 22 + Math.random() * 14;
      this.push({ x, y: y - 0.5, vx: -Math.cos(a) * s * 0.8, vy: -Math.sin(a) * s, r0: 0.25, r1: 0.25, life: 0, max: 0.32 + Math.random() * 0.1, color: c[0], hi: c[1], alpha: 1, kind: 'drop', g: 150 });
    }
  }

  /**
   * Leaves or petals knocked loose: they pop up, then see-saw down to `floor`
   * and lie there a moment before fading. `push` biases them sideways.
   */
  leaves(x: number, y: number, colors: string[], n: number, spread: number, floor: number, push = 0, up = 1): void {
    for (let i = 0; i < n; i++) {
      const c = colors[(Math.random() * colors.length) | 0];
      this.push({
        x: x + (Math.random() - 0.5) * spread, y: y - Math.random() * 2, vx: (Math.random() - 0.5) * 22 + push * 10, vy: (-16 - Math.random() * 14) * up,
        r0: 0, r1: 0, life: 0, max: 1.3 + Math.random() * 0.7, color: c, hi: c, alpha: 1, kind: 'leaf', g: 60,
        floor: floor + Math.random() * 3, spin: Math.random() * 6.28,
      });
    }
  }

  /** Rings spreading on water (a fish, a skipped stone). */
  ripple(x: number, y: number, size = 1): void {
    this.push({ x, y, vx: 0, vy: 0, r0: 1, r1: 4 * size, life: 0, max: 0.7, color: '#e8f6ff', hi: '#e8f6ff', alpha: 0.75, kind: 'ring', g: 0 });
    this.push({ x, y, vx: 0, vy: 0, r0: 0.5, r1: 2.4 * size, life: -0.15, max: 0.6, color: '#c8e4f6', hi: '#c8e4f6', alpha: 0.6, kind: 'ring', g: 0 });
    for (let i = 0; i < 3 * size; i++) {
      const a = Math.PI * (0.2 + 0.6 * Math.random());
      this.push({ x, y: y - 0.5, vx: -Math.cos(a) * 18, vy: -Math.sin(a) * 26, r0: 0.25, r1: 0.25, life: 0, max: 0.3, color: '#a8d0ec', hi: '#e8f6ff', alpha: 1, kind: 'drop', g: 150 });
    }
  }

  /** A raindrop landing: a tiny ring and a fleck or two. */
  drip(x: number, y: number): void {
    this.push({ x, y, vx: 0, vy: 0, r0: 0.5, r1: 2.2, life: 0, max: 0.26, color: RAIN_DROP[1], hi: RAIN_DROP[1], alpha: 0.45, kind: 'ring', g: 0 });
    if (Math.random() < 0.5) this.push({ x, y: y - 0.5, vx: (Math.random() - 0.5) * 14, vy: -14 - Math.random() * 8, r0: 0.25, r1: 0.25, life: 0, max: 0.2, color: RAIN_DROP[0], hi: RAIN_DROP[1], alpha: 0.8, kind: 'drop', g: 150 });
  }

  update(dt: number): void {
    for (const b of this.bits) {
      b.life += dt;
      if (b.kind === 'leaf') {
        // See-saw fall with drag; rest on the floor once there.
        if (b.y < b.floor!) {
          b.vy = Math.min(b.vy + b.g * dt, 14);
          b.vx *= 1 - Math.min(1, dt * 2.2);
          b.spin! += dt * 7;
          b.x += (b.vx + Math.sin(b.spin!) * 9) * dt;
          b.y += b.vy * dt;
        } else b.y = b.floor!;
        continue;
      }
      b.vy += b.g * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.kind === 'puff') {
        b.vx *= 1 - Math.min(1, dt * 5);
        b.vy *= 1 - Math.min(1, dt * 3);
      }
    }
    this.bits = this.bits.filter((b) => b.life < b.max);
  }

  /**
   * Draw in world space (the caller has translated by the camera). The
   * ground pass goes under everything; the air pass (leaves still falling)
   * goes over the scenery so a tree's leaves fall in front of it.
   */
  draw(ctx: CanvasRenderingContext2D, air = false): void {
    if (!this.bits.length) return;
    const q = (v: number) => Math.round(v * 2) / 2;
    for (const b of this.bits) {
      if (b.life < 0) continue;
      if ((b.kind === 'leaf' && b.y < b.floor! - 0.5) !== air) continue;
      const k = b.life / b.max;
      const r = b.r0 + (b.r1 - b.r0) * Math.sqrt(k);
      const a = b.alpha * (1 - k * k);
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      const cx = q(b.x);
      const cy = q(b.y);
      if (b.kind === 'leaf') {
        // A little leaf that turns as it tumbles: face-on (a lit blade with a
        // darker edge), edge-on (a sliver), or lying flat once it lands.
        ctx.globalAlpha = Math.min(1, (b.max - b.life) * 3);
        const landed = b.y >= b.floor!;
        const turn = landed ? 1 : Math.sin(b.spin! * 1.7);
        ctx.fillStyle = b.color;
        if (Math.abs(turn) < 0.35) {
          ctx.fillRect(cx, cy - 0.5, 0.5, 1.5);
          continue;
        }
        const dir = turn > 0 ? 1 : -1;
        ctx.fillRect(cx - 0.5, cy, 2, 0.5);
        ctx.fillRect(dir > 0 ? cx : cx - 0.5, cy - 0.5, 1, 0.5);
        ctx.fillStyle = 'rgba(43,33,64,0.4)';
        ctx.fillRect(dir > 0 ? cx + 1 : cx - 0.5, cy + 0.5, 1, 0.5);
        continue;
      }
      if (b.kind === 'drop') {
        ctx.fillStyle = b.color;
        ctx.fillRect(cx, cy, 0.5, b.vy < 0 ? 1 : 0.5);
        ctx.fillStyle = b.hi;
        ctx.fillRect(cx, cy, 0.5, 0.5);
        continue;
      }
      if (b.kind === 'ring') {
        // A flat ellipse outline on the ground.
        ctx.fillStyle = b.color;
        const rx = q(r);
        const ry = Math.max(0.5, q(r * 0.4));
        const pts = Math.ceil(Math.PI * 2 * rx * 2.2);
        for (let i = 0; i < pts; i++) {
          const t = (i / pts) * Math.PI * 2;
          ctx.fillRect(q(cx + Math.cos(t) * rx), q(cy + Math.sin(t) * ry), 0.5, 0.5);
        }
        continue;
      }
      // A round pixel blob, lit from above.
      const rx = q(r);
      const ry = Math.max(0.5, q(r * 0.8));
      for (let yy = -ry; yy < ry; yy += 0.5) {
        const t = (yy + 0.25) / ry;
        const w = q(rx * Math.sqrt(Math.max(0, 1 - t * t)));
        if (w <= 0) continue;
        ctx.fillStyle = yy < -ry * 0.2 ? b.hi : b.color;
        ctx.fillRect(cx - w, cy + yy, w * 2, 0.5);
      }
    }
    ctx.globalAlpha = 1;
  }
}
