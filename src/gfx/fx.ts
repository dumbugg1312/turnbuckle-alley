import { pixelTextOutlined } from './draw';

/** Pixel particles and floating text, usable by any scene. */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  gravity: number;
  kind: 'dot' | 'star' | 'confetti' | 'sweat' | 'dust' | 'spark';
  spin?: number;
}

export interface FloatText {
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  scale: number;
}

/**
 * A picked-up thing in flight: it pops out of the ground, bounces, then
 * swoops into whoever picked it up (world space, with a height above its
 * ground point so its shadow stays on the floor).
 */
export interface Flight {
  img: CanvasImageSource & { width: number; height: number };
  /** Drawn size in world px (item icons show at their full 16 px, like a tile). */
  w: number;
  h: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  t: number;
  delay: number;
  bounces: number;
  squash: number;
  homing: number;
  target: () => { x: number; y: number };
  onArrive?: () => void;
}

/** Height (px) of a popped item `t` seconds after launch with upward speed `vz` under gravity `g`, bouncing with `rest`itution. Pure, for tests. */
export function popHeight(t: number, vz: number, g: number, rest = 0.42): number {
  let v = vz;
  let tt = t;
  for (let i = 0; i < 4; i++) {
    const land = (2 * v) / g;
    if (tt <= land) return Math.max(0, v * tt - 0.5 * g * tt * tt);
    tt -= land;
    v *= rest;
  }
  return 0;
}

export class Fx {
  parts: Particle[] = [];
  texts: FloatText[] = [];
  flights: Flight[] = [];

  burst(x: number, y: number, n: number, colors: string[], opts: Partial<Particle> & { speed?: number } = {}): void {
    const speed = opts.speed ?? 60;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.4 + Math.random() * 0.8);
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - speed * 0.3,
        life: 0,
        max: opts.max ?? 0.5 + Math.random() * 0.4,
        color: colors[i % colors.length],
        size: opts.size ?? 1,
        gravity: opts.gravity ?? 160,
        kind: opts.kind ?? 'dot',
        spin: Math.random() * 6,
      });
    }
  }

  confetti(w: number, n: number): void {
    const colors = ['#ff5d8f', '#f4b63f', '#2fa59a', '#3f74d8', '#fbf0d9', '#d8434b', '#7ae0ff'];
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: Math.random() * w,
        y: -Math.random() * 40,
        vx: (Math.random() - 0.5) * 20,
        vy: 20 + Math.random() * 25,
        life: 0,
        max: 3 + Math.random() * 2,
        color: colors[i % colors.length],
        size: 1,
        gravity: 4,
        kind: 'confetti',
        spin: Math.random() * 6,
      });
    }
  }

  text(text: string, x: number, y: number, color = '#fff4dc', scale = 1, life = 1.1): void {
    this.texts.push({ text, x, y, vy: -18, life: 0, max: life, color, scale });
  }

  /**
   * Pop an item out at (x, y) and fly it into `target()` (usually the player),
   * calling onArrive when it's absorbed. `delay` staggers several pickups.
   */
  fly(img: Flight['img'], x: number, y: number, target: () => { x: number; y: number }, onArrive?: () => void, opts: { delay?: number; w?: number; h?: number; spread?: number } = {}): void {
    const k = (img as unknown as { __k?: number }).__k ?? 1;
    const spread = opts.spread ?? 1;
    this.flights.push({
      img, w: opts.w ?? img.width / k, h: opts.h ?? img.height / k,
      x, y, z: 4, vx: (Math.random() - 0.5) * 46 * spread, vy: (Math.random() - 0.3) * 16 * spread, vz: 92 + Math.random() * 18,
      t: 0, delay: opts.delay ?? 0, bounces: 0, squash: 0, homing: 0, target, onArrive,
    });
  }

  update(dt: number): void {
    for (const f of this.flights) {
      if (f.delay > 0) {
        f.delay -= dt;
        continue;
      }
      f.t += dt;
      f.squash = Math.max(0, f.squash - dt);
      if (f.t < 0.62) {
        // Pop and bounce.
        f.vz -= 330 * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.z += f.vz * dt;
        if (f.z <= 0) {
          f.z = 0;
          if (f.bounces < 2) {
            f.vz = -f.vz * 0.42;
            f.bounces++;
            f.squash = 0.07;
          } else f.vz = 0;
          f.vx *= 0.55;
          f.vy *= 0.55;
        }
      } else {
        // Swoop in, faster and faster, and lift to chest height on the way.
        f.homing = Math.min(1, f.homing + dt * 2.2);
        const tg = f.target();
        const dx = tg.x - f.x;
        const dy = tg.y - f.y;
        const d = Math.hypot(dx, dy);
        const sp = (70 + 340 * f.homing * f.homing) * dt;
        if (d <= sp + 3) {
          f.t = -1;
          f.onArrive?.();
          continue;
        }
        f.x += (dx / d) * sp;
        f.y += (dy / d) * sp;
        f.z += (14 - f.z) * Math.min(1, dt * 6);
      }
    }
    this.flights = this.flights.filter((f) => f.t >= 0);
    for (const p of this.parts) {
      p.life += dt;
      p.vy += p.gravity * dt;
      if (p.kind === 'confetti') p.vx += Math.sin(p.life * 4 + (p.spin ?? 0)) * 10 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.parts = this.parts.filter((p) => p.life < p.max);
    for (const t of this.texts) {
      t.life += dt;
      t.y += t.vy * dt;
      t.vy *= 0.94;
    }
    this.texts = this.texts.filter((t) => t.life < t.max);
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const f of this.flights) {
      if (f.delay > 0) continue;
      const q = (v: number) => Math.round(v * 2) / 2;
      // Shadow on the ground under it, smaller the higher it goes.
      const sr = Math.max(1, (f.w / 2) * (1 - Math.min(0.7, f.z / 40)));
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = '#2b2140';
      ctx.fillRect(q(f.x - sr), q(f.y - 0.5), sr * 2, 1);
      ctx.globalAlpha = 1;
      // Squash on each bounce, stretch on the swoop.
      let sx = 1;
      let sy = 1;
      if (f.squash > 0) {
        sx = 1.25;
        sy = 0.75;
      } else if (f.homing > 0) {
        sx = 1 - f.homing * 0.3;
        sy = 1 + f.homing * 0.15;
      }
      const w = f.w * sx;
      const h = f.h * sy;
      ctx.drawImage(f.img, q(f.x - w / 2), q(f.y - f.z - h), q(w), q(h));
    }
    for (const p of this.parts) {
      const fade = 1 - p.life / p.max;
      ctx.globalAlpha = Math.min(1, fade * 2);
      ctx.fillStyle = p.color;
      const x = Math.round(p.x);
      const y = Math.round(p.y);
      if (p.kind === 'star') {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      } else if (p.kind === 'confetti') {
        const flip = Math.sin(p.life * 8 + (p.spin ?? 0)) > 0;
        ctx.fillRect(x, y, flip ? 2 : 1, flip ? 1 : 2);
      } else ctx.fillRect(x, y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const t of this.texts) {
      const fade = 1 - t.life / t.max;
      ctx.globalAlpha = Math.min(1, fade * 3);
      const pop = t.life < 0.1 ? 1 + (0.1 - t.life) * 4 : 1;
      const s = Math.max(1, Math.round(t.scale * pop));
      const w = t.text.length * 4 * s;
      pixelTextOutlined(ctx, t.text, t.x - w / 2, t.y, t.color, '#1e1426', s);
    }
    ctx.globalAlpha = 1;
  }
}
