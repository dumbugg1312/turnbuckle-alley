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
  kind: 'puff' | 'drop' | 'ring';
  g: number;
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

export class StepFx {
  private bits: Bit[] = [];

  private push(b: Bit): void {
    if (this.bits.length >= MAX_BITS) this.bits.shift();
    this.bits.push(b);
  }

  /** A foot lands at (x, y) on `t`. `dir` is the walking direction (dust trails behind). */
  step(x: number, y: number, dir: Dir, t: TerrainId, raining: boolean, strength = 1): void {
    const bx = dir === 'left' ? 1 : dir === 'right' ? -1 : 0;
    const by = dir === 'up' ? 0.5 : dir === 'down' ? -0.5 : 0;
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

  update(dt: number): void {
    for (const b of this.bits) {
      b.life += dt;
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

  /** Draw in world space (the caller has translated by the camera). */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.bits.length) return;
    const q = (v: number) => Math.round(v * 2) / 2;
    for (const b of this.bits) {
      const k = b.life / b.max;
      const r = b.r0 + (b.r1 - b.r0) * Math.sqrt(k);
      const a = b.alpha * (1 - k * k);
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      const cx = q(b.x);
      const cy = q(b.y);
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
