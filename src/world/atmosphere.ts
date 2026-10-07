/**
 * World atmosphere: time-of-day colour grading, golden-hour rays, sun-cast
 * shadows, the night lightmap (bloom, lamp pools, window spill) and ambient
 * particles. Pure rendering helpers used by world/scene.ts; everything
 * expensive is pre-rendered and cached, per frame it is a handful of blits.
 */
import { G } from '../core/state';
import { getSeason } from '../gfx/world/terrain';

// ---------------------------------------------------------------- grading
export interface Grade {
  /** Ambient multiply colour (255 = untouched). */
  amb: [number, number, number];
  /** Soft-light warm/cool wash [r,g,b,alpha]. */
  soft: [number, number, number, number];
  /** Screen haze [r,g,b,alpha]. */
  haze: [number, number, number, number];
  /** 0..1 how much artificial lights show. */
  lights: number;
  /** Cast-shadow length factor (x sprite height) and strength. */
  shadowL: number;
  shadowA: number;
  /** 0..1 golden-hour rays. */
  rays: number;
}
type Key = [number, [number, number, number], [number, number, number, number], [number, number, number, number], number, number, number, number];
// hour, ambient, soft, haze, lights, shadowL, shadowA, rays
const KEYS: Key[] = [
  [4.0, [60, 64, 150], [40, 30, 90, 0.12], [30, 40, 110, 0.1], 1, 0, 0, 0],
  [5.4, [100, 92, 170], [120, 60, 120, 0.14], [90, 60, 130, 0.1], 0.95, 0, 0, 0],
  [6.0, [232, 186, 205], [255, 160, 180, 0.3], [255, 170, 190, 0.12], 0.55, 1.1, 0.24, 0.35],
  [6.8, [250, 226, 232], [255, 205, 200, 0.16], [255, 215, 210, 0.06], 0.15, 0.85, 0.3, 0.2],
  [8.0, [250, 246, 248], [210, 235, 255, 0.1], [0, 0, 0, 0], 0, 0.55, 0.3, 0.05],
  [10.5, [255, 253, 245], [255, 240, 210, 0.1], [0, 0, 0, 0], 0, 0.32, 0.3, 0],
  [13.0, [255, 255, 250], [255, 236, 200, 0.12], [0, 0, 0, 0], 0, 0.22, 0.3, 0],
  [16.0, [255, 248, 230], [255, 220, 170, 0.2], [0, 0, 0, 0], 0, 0.5, 0.3, 0.1],
  [17.5, [255, 228, 182], [255, 150, 60, 0.42], [255, 180, 90, 0.1], 0.1, 1.0, 0.34, 1],
  [18.5, [250, 200, 160], [255, 130, 70, 0.4], [255, 140, 110, 0.08], 0.35, 1.2, 0.3, 0.8],
  [19.3, [220, 158, 172], [255, 110, 120, 0.34], [255, 110, 150, 0.08], 0.7, 0.95, 0.24, 0.35],
  [19.9, [165, 130, 200], [200, 110, 200, 0.24], [140, 90, 200, 0.07], 0.9, 0.4, 0.14, 0],
  [20.6, [112, 112, 195], [80, 70, 160, 0.14], [50, 60, 140, 0.08], 1, 0.1, 0.06, 0],
  [21.5, [86, 90, 172], [50, 40, 120, 0.12], [40, 50, 120, 0.1], 1, 0, 0, 0],
  [23.0, [70, 74, 155], [40, 30, 100, 0.12], [30, 40, 110, 0.1], 1, 0, 0, 0],
  [26.5, [62, 66, 150], [40, 30, 90, 0.12], [30, 40, 110, 0.1], 1, 0, 0, 0],
];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function gradeAt(minutes: number, weather: string, indoor: boolean, indoorLight = 0.95): Grade {
  const h = Math.max(KEYS[0][0], Math.min(KEYS[KEYS.length - 1][0], minutes / 60));
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  let t = (h - a[0]) / (b[0] - a[0]);
  t = t * t * (3 - 2 * t);
  const v3 = (p: [number, number, number], q: [number, number, number]): [number, number, number] => [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
  const v4 = (p: [number, number, number, number], q: [number, number, number, number]): [number, number, number, number] => [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t), lerp(p[3], q[3], t)];
  const g: Grade = { amb: v3(a[1], b[1]), soft: v4(a[2], b[2]), haze: v4(a[3], b[3]), lights: lerp(a[4], b[4], t), shadowL: lerp(a[5], b[5], t), shadowA: lerp(a[6], b[6], t), rays: lerp(a[7], b[7], t) };
  const wet = weather === 'rain' || weather === 'storm';
  if (wet) {
    // overcast: cool, dim, no sun
    const k = 0.75;
    g.amb = [lerp(g.amb[0], 150, k), lerp(g.amb[1], 158, k), lerp(g.amb[2], 185, k)];
    g.soft = [120, 140, 190, 0.18];
    g.haze = [120, 140, 190, 0.1];
    g.shadowA *= 0.12;
    g.rays = 0;
    g.lights = Math.max(g.lights, 0.6);
  }
  if (indoor) {
    const night = Math.max(0, Math.min(1, (h - 18) / 3));
    const lvl = Math.max(0.35, indoorLight - night * 0.12);
    const warm = lvl * 255;
    g.amb = [warm, warm * 0.96, warm * 0.9];
    g.soft = [255, 220, 170, 0.1];
    g.haze = [0, 0, 0, 0];
    g.lights = Math.max(0.35, 1 - indoorLight + night * 0.5);
    g.shadowL = 0;
    g.shadowA = 0;
    g.rays = 0;
  }
  return g;
}

// ---------------------------------------------------------------- pixel helpers
const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x: number, y: number) => (B4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
function cvs(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0);
  c.height = Math.max(1, h | 0);
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  return [c, x];
}
function fromBuf(w: number, h: number, fill: (x: number, y: number) => number): HTMLCanvasElement {
  const [c, x] = cvs(w, h);
  const img = x.createImageData(w, h);
  const d = new Uint32Array(img.data.buffer);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) d[yy * w + xx] = fill(xx, yy);
  x.putImageData(img, 0, 0);
  return c;
}
const rgba = (r: number, g: number, b: number, a: number) => ((((a | 0) & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
function parse(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ---------------------------------------------------------------- light sprites (pixel-banded, dithered)
const lightCache = new Map<string, HTMLCanvasElement>();
/** Radial light in `color` for the lightmap ('lighter'). squash = ry/rx (ground pools). */
export function lightSprite(color: string, r: number, squash = 1, levels = 6, pow = 1.6): HTMLCanvasElement {
  const rr = Math.max(4, Math.round(r / 2) * 2);
  const key = `${color}|${rr}|${squash}|${levels}|${pow}`;
  const hit = lightCache.get(key);
  if (hit) return hit;
  const [cr, cg, cb] = parse(color);
  const ry = Math.max(2, Math.round(rr * squash));
  const w = rr * 2;
  const h = ry * 2;
  const c = fromBuf(w, h, (x, y) => {
    const dx = (x + 0.5 - rr) / rr;
    const dy = (y + 0.5 - ry) / ry;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d >= 1) return rgba(0, 0, 0, 255);
    const i = Math.pow(1 - d, pow);
    const q = Math.floor(i * levels + bay(x, y)) / levels;
    return rgba(cr * q, cg * q, cb * q, 255);
  });
  lightCache.set(key, c);
  return c;
}
/** Window light spilling onto the ground: a dithered trapezoid fading downward. */
export function spillSprite(color: string, w0: number, h: number): HTMLCanvasElement {
  const key = `spill|${color}|${w0}|${h}`;
  const hit = lightCache.get(key);
  if (hit) return hit;
  const [cr, cg, cb] = parse(color);
  const W = w0 + h + 2;
  const c = fromBuf(W, h, (x, y) => {
    const t = y / h;
    const hw = w0 / 2 + y * 0.5;
    const dx = Math.abs(x + 0.5 - W / 2) / hw;
    if (dx >= 1) return rgba(0, 0, 0, 255);
    const i = Math.pow(1 - t, 1.4) * (1 - dx * dx * 0.7);
    const q = Math.floor(i * 5 + bay(x, y)) / 5;
    return rgba(cr * q, cg * q, cb * q, 255);
  });
  lightCache.set(key, c);
  return c;
}

// ---------------------------------------------------------------- shadows
export interface Caster {
  img: HTMLCanvasElement;
  x: number;
  y: number;
}
/** Blit helpers push here while the scene collects (see noteCaster). */
export const CASTERS: Caster[] = [];
export let collecting = false;
export function setCollecting(on: boolean): void {
  collecting = on;
  if (on) CASTERS.length = 0;
}
export function noteCaster(img: HTMLCanvasElement, x: number, y: number): void {
  if (collecting) CASTERS.push({ img, x, y });
}
interface Mask { a: Uint8Array; w: number; h: number; base: number; top: number }
const masks = new WeakMap<HTMLCanvasElement, Mask | null>();
function maskOf(img: HTMLCanvasElement): Mask | null {
  if (masks.has(img)) return masks.get(img)!;
  let m: Mask | null = null;
  try {
    const w = img.width;
    const h = img.height;
    const d = img.getContext('2d')!.getImageData(0, 0, w, h).data;
    const a = new Uint8Array(w * h);
    let base = -1;
    let top = h;
    for (let i = 0; i < w * h; i++) {
      if (d[i * 4 + 3] > 150) {
        a[i] = 1;
        const y = (i / w) | 0;
        if (y > base) base = y;
        if (y < top) top = y;
      }
    }
    if (base >= 0) m = { a, w, h, base, top };
  } catch {
    m = null;
  }
  masks.set(img, m);
  return m;
}
interface Shadow { cv: HTMLCanvasElement; ox: number; oy: number }
const shadowCache = new WeakMap<HTMLCanvasElement, Map<number, Shadow | null>>();
const SDX = 0.92;
const SDY = 0.34;
const INK = [0x3a, 0x26, 0x50];
/** Sun-cast silhouette of a sprite, sheared along the sun direction (cached per length bucket). */
function castShadow(img: HTMLCanvasElement, bucket: number): Shadow | null {
  let per = shadowCache.get(img);
  if (!per) shadowCache.set(img, (per = new Map()));
  if (per.has(bucket)) return per.get(bucket)!;
  const m = maskOf(img);
  let s: Shadow | null = null;
  if (m) {
    const L = bucket / 12;
    const hgt = m.base - m.top + 1;
    const H = Math.max(2, Math.ceil(hgt * L * SDY) + 1);
    const shift = L * SDX;
    const W = m.w + Math.ceil(hgt * shift) + 1;
    const cv = fromBuf(W, H, (X, Y) => {
      const above = Y / (L * SDY);
      const v = Math.round(m.base - above);
      if (v < m.top || v > m.base) return 0;
      const u = Math.round(X - above * shift);
      if (u < 0 || u >= m.w || !m.a[v * m.w + u]) return 0;
      const fade = 0.62 - 0.3 * (above / Math.max(1, hgt));
      return bay(X, Y) < fade ? rgba(INK[0], INK[1], INK[2], 255) : 0;
    });
    s = { cv, ox: 0, oy: m.base + 1 };
  }
  per.set(bucket, s);
  return s;
}
/** Draw collected casters' shadows (call with the camera translate active, 'destination-over'). */
export function drawCastShadows(ctx: CanvasRenderingContext2D, g: Grade, view: { x: number; y: number; w: number; h: number }): void {
  if (g.shadowL < 0.03 || g.shadowA < 0.02) return;
  const bucket = Math.max(1, Math.round(g.shadowL * 12));
  ctx.globalAlpha = g.shadowA * 1.7;
  for (const c of CASTERS) {
    if (c.x > view.x + view.w || c.x + c.img.width * 2.2 < view.x || c.y > view.y + view.h || c.y + c.img.height * 1.5 < view.y) continue;
    const s = castShadow(c.img, bucket);
    if (s) ctx.drawImage(s.cv, c.x + s.ox, c.y + s.oy);
  }
  ctx.globalAlpha = 1;
}
/** Soft dithered contact ellipse under a character, plus a leaning sun shadow. */
const blobCache = new Map<string, HTMLCanvasElement>();
function blob(rx: number, ry: number, a: number): HTMLCanvasElement {
  const key = `${rx}|${ry}|${a}`;
  const hit = blobCache.get(key);
  if (hit) return hit;
  const w = rx * 2 + 2;
  const h = ry * 2 + 2;
  const c = fromBuf(w, h, (x, y) => {
    const dx = (x + 0.5 - w / 2) / rx;
    const dy = (y + 0.5 - h / 2) / ry;
    const d = dx * dx + dy * dy;
    if (d > 1) return 0;
    const k = d < 0.5 ? a : a * 0.5;
    return bay(x, y) < k ? rgba(INK[0], INK[1], INK[2], 255) : 0;
  });
  blobCache.set(key, c);
  return c;
}
export function drawActorShadow(ctx: CanvasRenderingContext2D, x: number, y: number, g: Grade): void {
  const ax = Math.round(x);
  const ay = Math.round(y);
  ctx.globalAlpha = 0.55;
  const b = blob(7, 3, 0.8);
  ctx.drawImage(b, ax - (b.width >> 1), ay - (b.height >> 1) - 1);
  if (g.shadowL > 0.05 && g.shadowA > 0.02) {
    ctx.globalAlpha = g.shadowA * 1.5;
    const len = g.shadowL * 26;
    const n = Math.max(2, Math.round(len / 4));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const r = Math.max(2, Math.round(4 - t * 2));
      const bb = blob(r + 1, r, 0.7 - t * 0.3);
      ctx.drawImage(bb, Math.round(ax + SDX * len * t) - (bb.width >> 1), Math.round(ay - 1 + SDY * len * t) - (bb.height >> 1));
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- god rays
let rayStrip: HTMLCanvasElement | null = null;
function rays(): HTMLCanvasElement {
  if (rayStrip) return rayStrip;
  const N = 2048;
  let s = 7;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const bands: [number, number, number][] = [];
  let p = 0;
  while (p < N) {
    const w = 14 + rnd() * 70;
    if (rnd() < 0.55) bands.push([p, w, 0.35 + rnd() * 0.65]);
    p += w + 10 + rnd() * 60;
  }
  rayStrip = fromBuf(N, 4, (x, y) => {
    let v = 0;
    for (const [bx, bw, bi] of bands) {
      const t = (x - bx) / bw;
      if (t > 0 && t < 1) v = Math.max(v, Math.sin(t * Math.PI) * bi);
    }
    const q = Math.floor(v * 5 + bay(x, y)) / 5;
    return rgba(255 * q, 225 * q, 150 * q, 255);
  });
  return rayStrip;
}
export function drawRays(ctx: CanvasRenderingContext2D, g: Grade, w: number, h: number, t: number): void {
  if (g.rays < 0.02) return;
  const strip = rays();
  const a = -1.05; // from the top-left
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const D = Math.hypot(w, h) * 1.2;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = g.rays * (0.2 + Math.sin(t * 0.4) * 0.04);
  const drift = (t * 7) % strip.width;
  // strip x-axis runs across the rays; y-axis (4px) is stretched along them
  ctx.setTransform(ca, sa, -sa * (D / 4), ca * (D / 4), w / 2 - drift * ca + sa * D * 0.5, h / 2 - drift * sa - ca * D * 0.5);
  ctx.drawImage(strip, -strip.width / 2, 0);
  ctx.drawImage(strip, strip.width / 2, 0);
  ctx.drawImage(strip, -strip.width * 1.5, 0);
  ctx.restore();
}

// ---------------------------------------------------------------- grading passes
export function drawGrade(ctx: CanvasRenderingContext2D, g: Grade, w: number, h: number): void {
  if (g.soft[3] > 0.005) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = g.soft[3];
    ctx.fillStyle = `rgb(${g.soft[0] | 0},${g.soft[1] | 0},${g.soft[2] | 0})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (g.haze[3] > 0.005) {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = g.haze[3];
    ctx.fillStyle = `rgb(${g.haze[0] | 0},${g.haze[1] | 0},${g.haze[2] | 0})`;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- particles
interface Pt { x: number; y: number; vx: number; vy: number; t: number; life: number; k: 'mote' | 'petal' | 'leaf' | 'fly'; s: number }
export class Particles {
  pts: Pt[] = [];
  private acc = 0;
  update(dt: number, view: { x: number; y: number; w: number; h: number }, g: Grade, outdoor: boolean, t: number): void {
    const season = getSeason();
    const night = g.lights;
    const windy = G.weather.today === 'wind';
    const wet = G.weather.today === 'rain' || G.weather.today === 'storm';
    const area = (view.w * view.h) / (384 * 216);
    const wantMote = outdoor && !wet ? Math.round((8 + 22 * Math.max(g.rays, 0.25)) * area * (1 - night)) : outdoor ? 0 : Math.round(6 * area);
    const wantPetal = outdoor && !wet && (season === 'spring' || season === 'fall') ? Math.round((windy ? 14 : 6) * area) : 0;
    const wantFly = outdoor && !wet && season !== 'winter' ? Math.round(16 * area * night) : 0;
    const count = { mote: 0, petal: 0, leaf: 0, fly: 0 };
    for (const p of this.pts) count[p.k]++;
    this.acc += dt;
    const spawn = (k: Pt['k']) => {
      const x = view.x + Math.random() * view.w;
      const y = view.y + Math.random() * view.h;
      if (k === 'mote') this.pts.push({ x, y, vx: 2 + Math.random() * 4, vy: -3 - Math.random() * 4, t: 0, life: 4 + Math.random() * 5, k, s: Math.random() * 6.28 });
      else if (k === 'petal' || k === 'leaf') this.pts.push({ x, y: view.y - 8, vx: (windy ? 22 : 8) + Math.random() * 8, vy: 10 + Math.random() * 10, t: 0, life: 6 + Math.random() * 6, k: season === 'fall' ? 'leaf' : 'petal', s: Math.random() * 6.28 });
      else this.pts.push({ x, y, vx: 0, vy: 0, t: 0, life: 5 + Math.random() * 6, k: 'fly', s: Math.random() * 6.28 });
    };
    if (this.acc > 0.12) {
      this.acc = 0;
      if (count.mote < wantMote) spawn('mote');
      if (count.petal + count.leaf < wantPetal) spawn('petal');
      if (count.fly < wantFly) spawn('fly');
    }
    for (const p of this.pts) {
      p.t += dt;
      if (p.k === 'mote') {
        p.x += (p.vx + Math.sin(t * 1.3 + p.s) * 4) * dt;
        p.y += (p.vy + Math.cos(t * 0.9 + p.s) * 3) * dt;
      } else if (p.k === 'fly') {
        p.x += Math.sin(t * 0.7 + p.s) * 9 * dt;
        p.y += Math.cos(t * 0.5 + p.s * 2) * 6 * dt;
      } else {
        p.x += (p.vx + Math.sin(t * 2 + p.s) * 10) * dt;
        p.y += (p.vy + Math.sin(t * 3.1 + p.s) * 4) * dt;
      }
    }
    const m = 24;
    this.pts = this.pts.filter((p) => p.t < p.life && p.x > view.x - m && p.x < view.x + view.w + m && p.y > view.y - m && p.y < view.y + view.h + m);
    if (this.pts.length > 90) this.pts.length = 90;
  }
  /** Draw in world space (camera translate active). */
  draw(ctx: CanvasRenderingContext2D, g: Grade, t: number): void {
    const warm = g.rays > 0.3;
    for (const p of this.pts) {
      const x = Math.round(p.x);
      const y = Math.round(p.y);
      const fade = Math.min(1, p.t * 1.5, (p.life - p.t) * 1.5);
      if (p.k === 'mote') {
        const tw = 0.5 + 0.5 * Math.sin(t * 3 + p.s * 3);
        ctx.globalAlpha = fade * (0.25 + 0.45 * tw) * (warm ? 1 : 0.6);
        ctx.fillStyle = warm ? '#fff0b0' : '#fff8e8';
        ctx.fillRect(x, y, 1, 1);
      } else if (p.k === 'petal' || p.k === 'leaf') {
        const flip = Math.sin(p.t * 6 + p.s) > 0;
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.k === 'petal' ? (flip ? '#ffd0dc' : '#ff9ab8') : flip ? '#f2a444' : '#d65a3a';
        ctx.fillRect(x, y, flip ? 2 : 1, flip ? 1 : 2);
      } else {
        const b = Math.max(0, Math.sin(t * 1.6 + p.s * 4));
        if (b < 0.15) continue;
        ctx.globalAlpha = fade * b;
        ctx.globalCompositeOperation = 'lighter';
        const gl = lightSprite('#b8ff70', 6, 1, 4, 2.2);
        ctx.drawImage(gl, x - gl.width / 2, y - gl.height / 2);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#f4ffb0';
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }
}
