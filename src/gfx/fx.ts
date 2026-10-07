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

export class Fx {
  parts: Particle[] = [];
  texts: FloatText[] = [];

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

  update(dt: number): void {
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
