import { game } from '../core/game';
import type { Scene } from '../core/scene';

/**
 * The first night on the porch: from the rocker, past the porch rail, out
 * over the weeds to Grandma's old ring with fireflies working it, then a
 * slow tilt up into more stars than the city ever had. Drawn in native
 * pixels in the world's night palette (plum ink, never black). The still
 * picture is painted once into a tall buffer; stars twinkle and fireflies
 * blink on top of it.
 */
const INK = '#130e1d';
const SKY = ['#110d1f', '#16122a', '#1d1836', '#262046', '#322a58', '#45396a'];
const HILL = '#1a1428';
const FIELD = '#1e1830';
const WEED = '#251d38';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function hash(n: number): number {
  let t = (n * 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface Fly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  period: number;
}

interface Layout {
  w: number;
  h: number;
  H: number;
  horizon: number;
  ringY: number;
  railY: number;
  bright: { x: number; y: number; s: number }[];
}

export class PorchSky implements Scene {
  private t = 0;
  private flies: Fly[] = [];
  private buf: HTMLCanvasElement | null = null;
  private lay: Layout | null = null;
  /** Seconds for the tilt from the yard up to the sky. */
  readonly pan: number;

  constructor(pan = 9) {
    this.pan = pan;
    for (let i = 0; i < 30; i++) {
      this.flies.push({ x: hash(i * 3 + 1), y: hash(i * 3 + 2), vx: (hash(i * 7) - 0.5) * 4, vy: (hash(i * 11) - 0.5) * 2, phase: hash(i * 13) * 6, period: 2.2 + hash(i * 17) * 2.5 });
    }
  }

  update(dt: number): void {
    this.t += dt;
    for (const f of this.flies) {
      f.x += (f.vx * dt) / 400 + Math.sin(this.t * 0.7 + f.phase * 3) * dt * 0.006;
      f.y += (f.vy * dt) / 300 + Math.sin(this.t * 1.3 + f.phase) * dt * 0.01;
      if (f.x < 0) f.x += 1;
      if (f.x > 1) f.x -= 1;
      if (f.y < 0) f.y = -f.y;
      if (f.y > 1) f.y = 2 - f.y;
    }
  }

  /** Paint the still picture once for this screen size. */
  private build(w: number, h: number): void {
    const H = h * 2;
    const horizon = Math.round(H - h * 0.6);
    const ringY = Math.round(horizon + h * 0.34);
    const railY = Math.round(H - h * 0.13);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = H;
    const g = c.getContext('2d')!;
    const rect = (x: number, y: number, ww: number, hh: number, col: string) => {
      g.fillStyle = col;
      g.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh));
    };
    // Sky: an ordered-dither gradient, darkest at the top, a faint glow at the horizon.
    const img = g.createImageData(w, horizon);
    const pal = SKY.map((s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]);
    for (let y = 0; y < horizon; y++) {
      const v = Math.pow(y / horizon, 1.8) * (pal.length - 1);
      const i0 = Math.floor(v);
      const f = v - i0;
      for (let x = 0; x < w; x++) {
        const k = f * 16 > BAYER[((y & 3) << 2) | (x & 3)] ? Math.min(pal.length - 1, i0 + 1) : i0;
        const p = (y * w + x) * 4;
        img.data[p] = pal[k][0];
        img.data[p + 1] = pal[k][1];
        img.data[p + 2] = pal[k][2];
        img.data[p + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // The milky way: a faint diagonal river of dust.
    for (let i = 0; i < w * 1.6; i++) {
      const u = hash(i * 9 + 1);
      const sx = Math.floor(u * w);
      const band = horizon * 0.12 + u * horizon * 0.45;
      const sy = Math.floor(band + (hash(i * 9 + 2) + hash(i * 9 + 3) - 1) * horizon * 0.1);
      rect(sx, sy, 1, 1, hash(i * 9 + 4) > 0.6 ? '#4a4178' : '#3a3264');
    }
    // Stars, thinning toward the glow.
    const bright: Layout['bright'] = [];
    const n = Math.round((w * horizon) / 180);
    for (let i = 0; i < n; i++) {
      const sx = Math.floor(hash(i * 2 + 7) * w);
      const sy = Math.floor(Math.pow(hash(i * 2 + 8), 1.5) * horizon * 0.95);
      const b = hash(i * 5 + 3);
      if (b > 0.95) bright.push({ x: sx, y: sy, s: hash(i * 5 + 4) * 6 });
      else rect(sx, sy, 1, 1, b > 0.7 ? '#e6def4' : b > 0.4 ? '#a89cc8' : '#6e6298');
    }
    // A thin moon.
    const mx = Math.round(w * 0.8);
    const my = Math.round(horizon * 0.22);
    for (let y = -6; y <= 6; y++)
      for (let x = -6; x <= 6; x++) {
        const d = x * x + y * y;
        const d2 = (x + 3) * (x + 3) + (y - 1) * (y - 1);
        if (d <= 36 && d2 > 30) rect(mx + x, my + y, 1, 1, d > 25 ? '#ebc777' : '#fbf3df');
      }
    // Far tree line, and the water tower on the hill with its one red light.
    for (let x = 0; x < w; x++) {
      const tH = 5 + Math.floor(hash(Math.floor(x / 3) + 400) * 6) + Math.round(Math.sin(x * 0.025) * 3);
      rect(x, horizon - tH, 1, tH + 1, HILL);
    }
    const tx = Math.round(w * 0.16);
    for (const lx of [-6, -1, 4]) rect(tx + lx, horizon - 24, lx === -1 ? 2 : 1, 22, HILL);
    rect(tx - 8, horizon - 33, 16, 10, HILL);
    rect(tx - 6, horizon - 36, 12, 3, HILL);
    rect(tx - 2, horizon - 38, 4, 2, HILL);
    rect(tx, horizon - 40, 1, 2, '#e2445a');
    // The field.
    rect(0, horizon, w, H - horizon, FIELD);
    for (let x = 0; x < w; x += 2) {
      const gh = 2 + Math.floor(hash(x + 900) * 5);
      rect(x, horizon + 6 - gh, 1, gh, WEED);
    }
    // Grandma's ring: four posts, an apron, three sagging ropes, vines.
    const rw = Math.round(Math.min(w * 0.5, h * 0.95));
    const rx = Math.round(w * 0.55 - rw / 2);
    const rh = Math.round(h * 0.15);
    const backY = ringY - Math.round(rh * 0.45);
    rect(rx + 8, backY - rh, 2, rh + 2, INK);
    rect(rx + rw - 10, backY - rh, 2, rh + 2, INK);
    for (let r = 0; r < 3; r++) {
      for (let x = 10; x <= rw - 10; x++) {
        const sag = Math.round(Math.sin(((x - 10) / (rw - 20)) * Math.PI) * (2 + r));
        rect(rx + x, backY - rh + 3 + r * Math.round(rh / 3.3) + sag, 1, 1, '#2e2542');
      }
    }
    rect(rx - 2, ringY - 3, rw + 4, Math.round(rh * 0.4), INK);
    rect(rx - 2, ringY - 4, rw + 4, 1, '#2a2240');
    rect(rx - 1, ringY - rh - 4, 3, rh + 4, INK);
    rect(rx + rw - 2, ringY - rh - 4, 3, rh + 4, INK);
    for (let r = 0; r < 3; r++) {
      for (let x = 0; x <= rw; x++) {
        const sag = Math.round(Math.sin((x / rw) * Math.PI) * (3 + r * 2));
        rect(rx + x, ringY - rh + r * Math.round(rh / 3.2) + sag, 1, 1, '#3a2f52');
      }
    }
    for (let i = 0; i < 40; i++) {
      const vx = rx + Math.floor(hash(i + 70) * rw);
      const vy = ringY - Math.floor(hash(i + 90) * rh);
      rect(vx, vy, 1, 2, '#2a3a32');
    }
    // Weeds in front, taller toward the porch.
    for (let x = 0; x < w; x++) {
      if (hash(x + 1300) < 0.35) continue;
      const base = ringY + Math.round(h * 0.06);
      const gh = 3 + Math.floor(hash(x + 1350) * 14);
      rect(x, base - gh, 1, gh, INK);
      if (hash(x + 1400) > 0.7) rect(x + 1, base - gh - 1, 1, 2, INK);
    }
    rect(0, ringY + Math.round(h * 0.06), w, railY - ringY, INK);
    // The porch: the rail and its balusters, lit warm from the left by the porch light.
    rect(0, railY, w, H - railY, '#1a1326');
    rect(0, railY - 4, w, 4, '#3a2a3a');
    rect(0, railY - 4, w, 1, '#5a4048');
    for (let x = 4; x < w; x += 10) rect(x, railY, 3, H - railY, '#2a1e30');
    for (let y = railY - 4; y < H; y++)
      for (let x = 0; x < Math.round(w * 0.35); x++) {
        const k = 1 - x / (w * 0.35);
        if (k * 16 > BAYER[((y & 3) << 2) | (x & 3)] + 7) rect(x, y, 1, 1, y < railY ? '#8a6448' : '#3a2a30');
      }
    this.buf = c;
    this.lay = { w, h, H, horizon, ringY, railY, bright };
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { w, h } = game.screen;
    if (!this.buf || !this.lay || this.lay.w !== w || this.lay.h !== h) this.build(w, h);
    const L = this.lay!;
    const k = Math.min(1, this.t / this.pan);
    const ease = k * k * (3 - 2 * k);
    const camY = Math.round((L.H - h) * (1 - ease));
    ctx.drawImage(this.buf!, 0, camY, w, h, 0, 0, w, h);
    const px = (x: number, y: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x), Math.round(y - camY), 1, 1);
    };
    // Bright stars twinkle with a little cross.
    for (const s of L.bright) {
      const on = Math.sin(this.t * 1.7 + s.s) > 0.2;
      px(s.x, s.y, on ? '#fbf3df' : '#ebc777');
      if (on) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(s.x + dx, s.y + dy, '#7a6ea8');
    }
    // Fireflies over the weeds and around the ropes.
    const top = L.horizon + 4;
    const span = L.ringY + h * 0.08 - top;
    for (const f of this.flies) {
      const ph = (this.t + f.phase) % f.period;
      const fx = Math.round(f.x * w);
      const fy = Math.round(top + f.y * span);
      if (ph < f.period * 0.4) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffd860';
        ctx.fillRect(fx - 1, fy - camY, 3, 1);
        ctx.fillRect(fx, fy - 1 - camY, 1, 3);
        ctx.globalAlpha = 1;
        px(fx, fy, '#fff2a8');
      } else if (ph < f.period * 0.52) px(fx, fy, '#8a7a3a');
    }
  }
}
