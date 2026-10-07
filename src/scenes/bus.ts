import { audio } from '../audio';
import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { G } from '../core/state';
import { renderPortrait } from '../gfx/characters';
import { hex, lh, lw, mixc } from '../gfx/kit';
import { defaultLook, type Look } from '../gfx/look';
import { el, uiRoot } from '../ui/dom';
import { buildInterior, layout, type Interior, type Layout } from './bus/interior';
import { buildJourney, type Journey, type Obj } from './bus/journey';
import { CAPTIONS, DURATION, morningAt, pulse, rainAt, ramp, RATE, scroll, SKY, skyAt, speedAt, STOP_T, sunAt, type Layer } from './bus/route';
import { skyStrip } from './bus/sky';

/**
 * The bus ride from the city to Turnbuckle Alley. You sit by the window,
 * seen from behind, while the whole day goes by outside: a rainy grey-blue
 * city dawn (towers, the MaxxMedia billboard, the last overpass), the
 * suburbs, the open highway, farmland at golden hour (silos, barns, cows, a
 * windmill, power lines dipping between poles), then Route 9 into town: the
 * water tower, the Sportatorium roof, and the welcome sign, where the bus
 * stops. Every caption describes what's in the window while it shows.
 */
const LAYER_BASE: Record<Layer, number> = { cloud: 0, far: 3, midfar: 9, mid: 30, near: 62 };
const GROUND_TOP: Record<Layer, number> = { cloud: 0, far: 0, midfar: 1, mid: 10, near: 33 };
const PARALLAX: Layer[] = ['midfar', 'mid', 'near'];
const BEATS: [number, string, number][] = [
  [10.6, 'whoosh', 0.35],
  [46.2, 'door', 0.6],
];

/** Interior light over the day: ambient multiply, rim colour, rim strength. */
const LIGHT: { t: number; amb: string; rim: string; rimA: number }[] = [
  { t: 0, amb: '#7c84ae', rim: '#aeb8e6', rimA: 0.25 },
  { t: 10, amb: '#8a8cb4', rim: '#c8c4e8', rimA: 0.3 },
  { t: 15, amb: '#dcdcea', rim: '#fff0d8', rimA: 0.45 },
  { t: 22, amb: '#f2f0ea', rim: '#fff8e8', rimA: 0.5 },
  { t: 28.5, amb: '#f0c6a6', rim: '#ffc274', rimA: 0.9 },
  { t: 39, amb: '#dca49e', rim: '#ffac6c', rimA: 0.95 },
  { t: 48, amb: '#cc9298', rim: '#ff9c66', rimA: 0.85 },
];
function lightAt(t: number): { amb: string; rim: string; rimA: number } {
  for (let i = 1; i < LIGHT.length; i++) {
    if (t <= LIGHT[i].t) {
      const a = LIGHT[i - 1];
      const b = LIGHT[i];
      const k = (t - a.t) / (b.t - a.t);
      return { amb: hex(mixc(a.amb, b.amb, k)), rim: hex(mixc(a.rim, b.rim, k)), rimA: a.rimA + (b.rimA - a.rimA) * k };
    }
  }
  const z = LIGHT[LIGHT.length - 1];
  return { amb: z.amb, rim: z.rim, rimA: z.rimA };
}

interface Drop {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  run: boolean;
}

export class BusScene implements Scene {
  private t = 0;
  private onDone: () => void;
  private caption: HTMLElement;
  private skip: HTMLElement;
  private shown = -1;
  private done = false;
  private look: Look;
  private L: Layout | null = null;
  private inter: Interior | null = null;
  private jr: Journey | null = null;
  private sizeKey = '';
  private fx: HTMLCanvasElement = document.createElement('canvas');
  private reflect: HTMLCanvasElement | null = null;
  private drops: Drop[] = [];
  private motes: { x: number; y: number; s: number; p: number }[] = [];
  private seed = 1;
  private nearH = 60;
  private beats = new Set<string>();

  constructor(onDone: () => void) {
    this.onDone = onDone;
    this.caption = el('div', 'bus-caption');
    // Longer lines wrap instead of running off a phone screen.
    Object.assign(this.caption.style, { whiteSpace: 'normal', maxWidth: 'min(86vw, 34em)', textAlign: 'center', lineHeight: '1.25', textWrap: 'balance' });
    this.skip = el('button', { class: 'btn small bus-skip' }, 'Skip ▸');
    this.skip.addEventListener('click', () => this.finish());
    let look: Look | undefined;
    try {
      look = G?.player?.look;
    } catch {
      look = undefined;
    }
    this.look = look ?? defaultLook();
    for (let i = 0; i < 46; i++) this.motes.push({ x: this.rand(), y: this.rand(), s: 0.3 + this.rand() * 0.7, p: this.rand() * 6.28 });
  }

  private rand(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  enter(): void {
    uiRoot().append(this.caption, this.skip);
    audio.music('bus');
  }

  exit(): void {
    this.caption.remove();
    this.skip.remove();
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    game.scenes.transition(() => this.onDone());
  }

  update(dt: number): void {
    // Dev: window.__busHold freezes the clock for screenshots.
    if (!(window as unknown as { __busHold?: boolean }).__busHold) this.t += Math.min(dt, 0.1);
    if (game.input.consume('interact') && this.t > 2) this.finish();
    let idx = -1;
    for (let i = 0; i < CAPTIONS.length; i++) if (this.t >= CAPTIONS[i][0]) idx = i;
    if (idx !== this.shown) {
      this.shown = idx;
      this.caption.textContent = idx >= 0 ? CAPTIONS[idx][1] : '';
      this.caption.classList.remove('show');
      void this.caption.offsetWidth;
      if (idx >= 0 && CAPTIONS[idx][1]) this.caption.classList.add('show');
    }
    // a couple of sound beats: rushing under the overpass, the door at the stop
    for (const [at, id, vol] of BEATS) if (this.t >= at && !this.beats.has(id)) {
      this.beats.add(id);
      audio.sfx(id, { volume: vol });
    }
    this.updateRain(dt);
    if (this.t > DURATION) this.finish();
  }

  // ---------------------------------------------------------------- setup
  private ensure(w: number, h: number): void {
    const key = `${w}x${h}`;
    if (key === this.sizeKey && this.L) return;
    this.sizeKey = key;
    const L = layout(w, h);
    this.L = L;
    this.inter = buildInterior(L, this.look);
    const nearTop = L.yh + GROUND_TOP.near;
    const nearH = Math.max(40, Math.min(96, L.wb - nearTop + 2));
    this.nearH = nearH;
    this.jr = buildJourney(nearH, L.wt - 3 - (L.yh + LAYER_BASE.near), L.yh + LAYER_BASE.near);
    this.fx.width = w * 2;
    this.fx.height = h * 2;
    try {
      this.reflect = renderPortrait(this.look, 'neutral', Math.round(L.head.r * 2.6), { bg: false });
    } catch {
      this.reflect = null;
    }
  }

  // ---------------------------------------------------------------- render
  render(ctx: CanvasRenderingContext2D): void {
    const { w, h } = game.screen;
    game.screen.resetTransform(ctx);
    ctx.imageSmoothingEnabled = false;
    this.ensure(w, h);
    const L = this.L!;
    const jr = this.jr!;
    const t = this.t;
    const ww = L.ww;

    ctx.fillStyle = '#2b2140';
    ctx.fillRect(0, 0, w, h);

    // ---- the view through the window
    ctx.save();
    ctx.beginPath();
    ctx.rect(L.wl, L.wt, ww, L.wh);
    ctx.clip();
    ctx.translate(L.wl, 0);

    // sky
    const sk = skyAt(t);
    this.tileY(ctx, skyStrip(sk.a, L.wh), L.wt, ww, 0, 1);
    if (sk.k > 0) this.tileY(ctx, skyStrip(sk.b, L.wh), L.wt, ww, 0, sk.k);
    const horizon = hex(mixc(SKY[sk.a].stops[3], SKY[sk.b].stops[3], sk.k));

    // the sun
    this.drawSun(ctx, L, t);

    // clouds
    this.tileY(ctx, jr.rain, L.wt - 4, ww, scroll('cloud', t) + t * 3, rainAt(t) * 0.95 + 0.05 * (1 - ramp(t, 12, 16)));
    for (const o of jr.objs) if (o.L === 'cloud') this.drawObj(ctx, o, L, t);

    // far: the city skyline recedes into haze, hills take over and change light
    const far = scroll('far', t);
    const yFar = L.yh + LAYER_BASE.far;
    const cityA = 1 - ramp(t, 7, 14);
    if (cityA > 0) this.tileY(ctx, jr.ridges.city, yFar - lh(jr.ridges.city), ww, far, cityA);
    const hillA = ramp(t, 9, 15);
    if (hillA > 0) {
      const rm = jr.ridges;
      const y = yFar - lh(rm.morning);
      const kn = pulse(t, 17, 21, 24, 28);
      const kg = ramp(t, 24, 29);
      const ks = ramp(t, 35, 41);
      this.tileY(ctx, rm.morning, y, ww, far, hillA);
      if (kn > 0) this.tileY(ctx, rm.noon, y, ww, far, kn * hillA);
      if (kg > 0) this.tileY(ctx, rm.golden, y, ww, far, kg);
      if (ks > 0) this.tileY(ctx, rm.sunset, y, ww, far, ks);
    }
    this.haze(ctx, L, horizon, 0.32, 46);

    for (const Ly of PARALLAX) {
      this.drawBands(ctx, Ly, L, t);
      for (const o of jr.objs) if (o.L === Ly) this.drawObj(ctx, o, L, t);
      if (Ly === 'mid') this.drawWires(ctx, L, t);
      if (Ly === 'midfar') this.haze(ctx, L, horizon, 0.16, 60);
    }
    this.drawRoad(ctx, L, t);

    // rain falling outside
    const rain = rainAt(t);
    if (rain > 0) {
      ctx.fillStyle = 'rgba(200,200,232,0.35)';
      ctx.globalAlpha = rain;
      for (let i = 0; i < 90; i++) {
        const sx = (i * 73.13 + t * 40) % (ww + 40) - 20;
        const sy = L.wt + ((i * 37.7 + t * 260) % L.wh);
        for (let k = 0; k < 5; k++) ctx.fillRect(Math.round((sx - k * 0.7) * 2) / 2, Math.round((sy + k * 1.5) * 2) / 2, 0.5, 1);
      }
      ctx.globalAlpha = 1;
    }
    // golden haze over everything outside as the day warms
    const gold = ramp(t, 25, 31);
    if (gold > 0) {
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = gold * 0.35;
      ctx.fillStyle = '#ff9a50';
      ctx.fillRect(0, L.wt, ww, L.wh);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // ---- on the glass
    this.drawGlass(ctx, L, t);

    // ---- inside the bus (with a little road bob)
    const v = speedAt(t);
    const bob = t < STOP_T ? (Math.sin(t * 9.1) * Math.sin(t * 2.3) > 0.55 ? 0.5 : 0) * Math.min(1, v * 2) : 0;
    ctx.save();
    ctx.translate(0, bob);
    const it = this.inter!;
    ctx.drawImage(it.frame, 0, 0);
    ctx.drawImage(it.glass, 0, 0);
    ctx.drawImage(it.fg, 0, 0);
    this.drawSteam(ctx, L, t);
    this.lightPass(ctx, L, t);
    ctx.restore();

    this.drawFlare(ctx, L, t);
    this.drawMotes(ctx, L, t);

    // fade in from the depot, and settle at the end
    const fadeIn = 1 - ramp(t, 0, 1.6);
    if (fadeIn > 0) {
      ctx.globalAlpha = fadeIn;
      ctx.fillStyle = '#0b0712';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }

  /** Tile a canvas horizontally across the window at y, scrolled by off. */
  private tileY(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, y: number, ww: number, off: number, alpha: number): void {
    if (alpha <= 0) return;
    const tw = lw(c);
    const o = ((off % tw) + tw) % tw;
    ctx.globalAlpha = Math.min(1, alpha);
    for (let x = -o; x < ww; x += tw) ctx.drawImage(c, Math.round(x * 2) / 2, Math.round(y * 2) / 2);
    ctx.globalAlpha = 1;
  }

  private haze(ctx: CanvasRenderingContext2D, L: Layout, color: string, a: number, span: number): void {
    const y1 = L.yh + 12;
    const y0 = y1 - span;
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, color + '00');
    g.addColorStop(1, color + Math.round(a * 255).toString(16).padStart(2, '0'));
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, L.ww, span);
  }

  private sx(lx: number, Ly: Layer, t: number, ww: number): number {
    return ww / 2 + lx - scroll(Ly, t);
  }

  private drawBands(ctx: CanvasRenderingContext2D, Ly: Layer, L: Layout, t: number): void {
    const off = scroll(Ly, t);
    const top = L.yh + GROUND_TOP[Ly];
    for (const b of this.jr!.bands) {
      if (b.L !== Ly) continue;
      const x0 = Math.max(0, L.ww / 2 + b.lx0 - off);
      const x1 = Math.min(L.ww, L.ww / 2 + b.lx1 - off);
      if (x1 <= x0) continue;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, L.wt, x1 - x0, L.wh);
      ctx.clip();
      const tw = lw(b.tile);
      const y = top + b.dy;
      if (b.fill && y + lh(b.tile) < L.wb) {
        ctx.fillStyle = b.fill;
        ctx.fillRect(x0, y + lh(b.tile) - 0.5, x1 - x0, L.wb - y - lh(b.tile) + 1);
      }
      const o = ((off % tw) + tw) % tw;
      for (let x = -o; x < L.ww; x += tw) if (x + tw > x0 && x < x1) ctx.drawImage(b.tile, Math.round(x * 2) / 2, Math.round(y * 2) / 2);
      ctx.restore();
    }
  }

  private drawObj(ctx: CanvasRenderingContext2D, o: Obj, L: Layout, t: number): void {
    const ww = L.ww;
    let x = this.sx(o.lx, o.L, t, ww);
    if (o.drift) x -= t * o.drift;
    const cw = lw(o.c);
    if (x + cw / 2 < -4 || x - cw / 2 > ww + 4) return;
    let alpha = 1;
    if (o.fade) alpha = pulse(t, o.fade[0], o.fade[1], o.fade[2], o.fade[3]);
    if (alpha <= 0) return;
    const c = o.alt && t >= (o.altAt ?? 0) ? o.alt : o.c;
    const ch = lh(c);
    let y: number;
    if (o.L === 'cloud') y = L.wt + o.dy;
    else if (o.kind === 'overpass') y = L.wt - 3;
    else y = L.yh + LAYER_BASE[o.L] + o.dy - ch;
    const dx = Math.round((x - cw / 2) * 2) / 2;
    const dy = Math.round(y * 2) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(c, dx, dy);
    ctx.globalAlpha = 1;
    if (o.kind === 'windmill') {
      const wheels = this.jr!.wheels;
      const f = Math.floor(t * 9) % wheels.length;
      ctx.drawImage(wheels[f], dx + 13 - 12, dy + 7 - 12);
    } else if (o.kind === 'lamp') {
      // sodium glow around the lamp head and a pool on the wet road
      const gx = dx + 17;
      const gy = dy + 8;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 18);
      g.addColorStop(0, 'rgba(255,214,140,0.55)');
      g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(gx - 18, gy - 18, 36, 36);
      ctx.globalCompositeOperation = 'source-over';
    } else if (o.kind === 'tower' && Math.floor(t * 1.2 + o.lx) % 2 === 0) {
      ctx.fillStyle = '#ff6a6a';
      ctx.fillRect(dx + cw / 2 - 0.5, dy, 1, 1);
    }
  }

  /** The bus's own lane, only seen on tall (portrait) windows. */
  private drawRoad(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    const y = L.yh + GROUND_TOP.near + this.nearH - 1;
    if (y >= L.wb) return;
    const wet = t < 13;
    ctx.fillStyle = wet ? '#3a3654' : '#57526a';
    ctx.fillRect(0, y, L.ww, L.wb - y);
    ctx.fillStyle = wet ? '#2c2846' : '#46425a';
    ctx.fillRect(0, y, L.ww, 1);
    ctx.fillStyle = '#e8e2d4';
    ctx.fillRect(0, y + 3, L.ww, 1);
    // the centre dashes rush past
    ctx.fillStyle = '#f2c84a';
    const off = (scroll('near', t) * 1.4) % 48;
    const dy = y + Math.min(26, (L.wb - y) * 0.6);
    for (let x = -off; x < L.ww; x += 48) ctx.fillRect(Math.round(x * 2) / 2, dy, 22, 1.5);
  }

  /** Power lines sagging between consecutive poles. */
  private drawWires(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    const ww = L.ww;
    const poles: number[] = [];
    let base = 0;
    for (const o of this.jr!.objs) {
      if (o.kind !== 'pole') continue;
      const x = this.sx(o.lx, 'mid', t, ww);
      if (x < -120 || x > ww + 120) continue;
      poles.push(x);
      base = L.yh + LAYER_BASE.mid + o.dy - lh(o.c);
    }
    if (poles.length < 2) return;
    const gold = ramp(t, 25, 30);
    for (let i = 0; i + 1 < poles.length; i++) {
      const a = poles[i];
      const b = poles[i + 1];
      if (b - a > 140) continue;
      for (const [k, ox] of [[0, -8], [1, 0], [2, 8]] as [number, number][]) {
        const y0 = base + 3.5;
        const sag = 7 + k * 0.6;
        ctx.fillStyle = gold > 0.5 ? (k === 1 ? '#ffd9a0' : '#4a3a56') : '#3f3a56';
        for (let x = Math.max(0, Math.ceil((a + ox) * 2) / 2); x <= Math.min(ww, b + ox); x += 0.5) {
          const u = (x - a - ox) / (b - a);
          const y = y0 + sag * 4 * u * (1 - u);
          ctx.fillRect(x, Math.round(y * 2) / 2, 0.5, 0.5);
        }
      }
    }
  }

  private sunPos(L: Layout, t: number): { x: number; y: number } {
    // morning sun high left (out of frame), golden sun lowering on the right
    const k = ramp(t, 26, 47);
    return { x: L.ww * (0.86 - k * 0.14), y: L.wt + L.wh * (0.12 + k * 0.3) };
  }

  private drawSun(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    // dawn: a pale glow trying to get through the rain deck
    const dawn = pulse(t, 0, 3, 11, 15);
    if (dawn > 0) {
      const gx = L.ww * 0.18;
      const gy = L.yh - 30;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 70);
      g.addColorStop(0, `rgba(255,214,190,${0.35 * dawn})`);
      g.addColorStop(1, 'rgba(255,200,190,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gx - 70, gy - 70, 140, 140);
    }
    const sun = sunAt(t);
    if (sun <= 0) return;
    const { x, y } = this.sunPos(L, t);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 90);
    g.addColorStop(0, `rgba(255,236,190,${0.75 * sun})`);
    g.addColorStop(0.15, `rgba(255,200,130,${0.45 * sun})`);
    g.addColorStop(1, 'rgba(255,160,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 90, y - 90, 180, 180);
    // the disc, finely stepped
    ctx.globalAlpha = sun;
    ctx.fillStyle = '#fff4d0';
    for (let dy = -6; dy <= 6; dy += 0.5) {
      const half = Math.sqrt(Math.max(0, 36 - dy * dy));
      ctx.fillRect(Math.round((x - half) * 2) / 2, Math.round((y + dy) * 2) / 2, Math.round(half * 4) / 2, 0.5);
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- glass
  private updateRain(dt: number): void {
    const L = this.L;
    if (!L) return;
    const rain = rainAt(this.t);
    const target = Math.round(rain * 70);
    while (this.drops.length < target) {
      this.drops.push({ x: L.wl + this.rand() * L.ww, y: L.wt + this.rand() * L.wh, r: 0.5 + this.rand() * 1.1, vx: 0, vy: 0, life: 1, run: this.rand() < 0.35 });
    }
    const v = speedAt(this.t);
    for (const d of this.drops) {
      if (d.run) {
        // pushed back along the glass by the wind of the bus
        d.vx = -(14 + d.r * 10) * (0.4 + v);
        d.vy = 10 + d.r * 14;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      } else if (this.rand() < dt * 0.25) d.run = true;
      if (rain < 0.98) d.life -= dt * (0.25 + this.rand() * 0.3);
      if (d.x < L.wl - 4 || d.y > L.wb + 2 || d.life <= 0) {
        if (rain > 0.2) {
          d.x = L.wl + this.rand() * (L.ww + 40);
          d.y = L.wt + this.rand() * L.wh * 0.6;
          d.run = this.rand() < 0.3;
          d.life = 1;
        } else d.life = 0;
      }
    }
    this.drops = this.drops.filter((d) => d.life > 0);
  }

  private drawGlass(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(L.wl, L.wt, L.ww, L.wh);
    ctx.clip();
    // your reflection, faint over the dark city, gone once the day is up
    const refl = (1 - ramp(t, 8.5, 13.5)) * 0.13 + pulse(t, 10.4, 10.8, 11.3, 12.1) * 0.12;
    if (this.reflect && refl > 0.005) {
      const s = this.reflect.width;
      ctx.save();
      ctx.globalAlpha = refl;
      ctx.globalCompositeOperation = 'screen';
      const rx = L.head.x + L.head.r * 0.9;
      const ry = L.head.y - L.head.r * 2.7;
      ctx.translate(rx + s / 2, ry);
      ctx.scale(-1, 1);
      ctx.drawImage(this.reflect, -s / 2, 0);
      ctx.restore();
    }
    // drops and their trails
    for (const d of this.drops) {
      const a = Math.min(1, d.life);
      if (d.run) {
        ctx.fillStyle = `rgba(214,220,246,${0.18 * a})`;
        for (let k = 1; k < 9; k++) ctx.fillRect(Math.round((d.x - (d.vx / d.vy) * -k * 1.2) * 2) / 2, Math.round((d.y - k * 1.2) * 2) / 2, 0.5, 0.5);
      }
      ctx.fillStyle = `rgba(60,56,92,${0.4 * a})`;
      ctx.fillRect(Math.round(d.x * 2) / 2, Math.round((d.y + d.r * 0.5) * 2) / 2, Math.max(0.5, Math.round(d.r * 2) / 2), 0.5);
      ctx.fillStyle = `rgba(226,230,255,${0.6 * a})`;
      ctx.fillRect(Math.round(d.x * 2) / 2, Math.round((d.y - d.r * 0.5) * 2) / 2, 0.5, 0.5);
    }
    // a soft sheen band across the glass
    const sh = ctx.createLinearGradient(L.wl + L.ww * 0.45, L.wt, L.wl + L.ww * 0.75, L.wb);
    sh.addColorStop(0, 'rgba(255,255,255,0)');
    sh.addColorStop(0.5, `rgba(255,250,240,${0.05 + 0.03 * ramp(t, 25, 30)})`);
    sh.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(L.wl, L.wt, L.ww, L.wh);
    ctx.restore();
  }

  private drawSteam(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    // the coffee steams until it's gone cold
    const a = 1 - ramp(t, 14, 19.5);
    if (a <= 0) return;
    const ch = 13 * L.u;
    for (let i = 0; i < 26; i++) {
      const k = ((t * 0.55 + i / 26) % 1);
      const x = L.cup.x + Math.sin(k * 7 + i) * (1 + k * 3) + (i % 3) - 1;
      const y = L.cup.y - 3 - ch - k * 16 * L.u;
      ctx.fillStyle = `rgba(244,240,255,${0.35 * a * (1 - k)})`;
      ctx.fillRect(Math.round(x * 2) / 2, Math.round(y * 2) / 2, 0.5, 0.5);
    }
  }

  // ---------------------------------------------------------------- light
  private fxCtx(): CanvasRenderingContext2D {
    const c = this.fx.getContext('2d')!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.clearRect(0, 0, this.fx.width, this.fx.height);
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.imageSmoothingEnabled = false;
    return c;
  }
  private masked(c: CanvasRenderingContext2D, mask: HTMLCanvasElement): void {
    c.globalCompositeOperation = 'destination-in';
    c.drawImage(mask, 0, 0);
    c.globalCompositeOperation = 'source-over';
  }
  private blit(ctx: CanvasRenderingContext2D, op: GlobalCompositeOperation, alpha = 1): void {
    ctx.globalCompositeOperation = op;
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.fx, 0, 0, this.L!.w, this.L!.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  /** Under the overpass: 0..1 for how much of the window its deck covers. */
  private underness(L: Layout, t: number): number {
    const o = this.jr!.objs.find((q) => q.kind === 'overpass');
    if (!o) return 0;
    const x = this.sx(o.lx, 'near', t, L.ww);
    const half = lw(o.c) / 2;
    const left = Math.max(0, x - half);
    const right = Math.min(L.ww, x + half);
    return Math.max(0, right - left) / L.ww;
  }

  private lightPass(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    const it = this.inter!;
    const lt = lightAt(t);
    const under = this.underness(L, t);
    const sun = sunAt(t);
    const occ = this.sunOcclusion(L, t);

    // 1. ambient: the whole interior takes the colour of the hour
    let c = this.fxCtx();
    c.fillStyle = under > 0 ? hex(mixc(lt.amb, '#4a4878', under * 0.7)) : lt.amb;
    c.fillRect(0, 0, L.w, L.h);
    this.masked(c, it.mask);
    this.blit(ctx, 'multiply');

    // 2. warm sunlight washing in, with shadows of poles and trees sweeping across
    const morning = morningAt(t);
    if (sun > 0 || morning > 0) {
      c = this.fxCtx();
      // a slanted shaft of window light falling across you and the seats;
      // everything is drawn skewed so the shadow bands lean with the sun
      const sk = 0.45;
      const top = L.wt + L.wh * 0.35;
      c.save();
      c.transform(1, 0, -sk, 1, sk * top, 0);
      const g = c.createLinearGradient(0, top, 0, L.h);
      const col = sun > 0 ? `rgba(255,172,96,${0.5 * sun})` : `rgba(255,240,214,${0.24 * morning})`;
      g.addColorStop(0, 'rgba(255,170,96,0)');
      g.addColorStop(0.25, col);
      g.addColorStop(1, col);
      c.fillStyle = g;
      c.fillRect(L.wl + L.ww * 0.05, top, L.ww * 1.1, L.h - top);
      c.globalCompositeOperation = 'destination-out';
      for (const s of this.shadowBands(L, t)) {
        c.fillStyle = `rgba(0,0,0,${s.a})`;
        c.fillRect(s.x, top, s.w, L.h - top);
        c.fillStyle = `rgba(0,0,0,${s.a * 0.4})`;
        c.fillRect(s.x - 1, top, 1, L.h - top);
        c.fillRect(s.x + s.w, top, 1, L.h - top);
      }
      c.restore();
      c.globalCompositeOperation = 'source-over';
      this.masked(c, it.mask);
      this.blit(ctx, 'screen');
    }

    // 3. sodium street lamps sliding past in the city
    if (t < 11.6) {
      c = this.fxCtx();
      let any = false;
      for (const o of this.jr!.objs) {
        if (o.kind !== 'lamp') continue;
        const x = L.wl + this.sx(o.lx, 'near', t, L.ww) + 12;
        if (x < -80 || x > L.w + 80) continue;
        any = true;
        const sweep = x - 20;
        const g = c.createLinearGradient(sweep - 46, 0, sweep + 46, 0);
        g.addColorStop(0, 'rgba(255,180,100,0)');
        g.addColorStop(0.5, 'rgba(255,190,110,0.32)');
        g.addColorStop(1, 'rgba(255,180,100,0)');
        c.fillStyle = g;
        c.fillRect(sweep - 46, 0, 92, L.h);
      }
      if (any) {
        this.masked(c, it.mask);
        this.blit(ctx, 'screen', 1 - ramp(t, 9.6, 11.1));
      }
    }

    // 4. rim light on the edges facing the window
    const rimA = lt.rimA * (1 - under * 0.8) * (sun > 0 ? 1 - occ * 0.75 : 1);
    if (rimA > 0.01) {
      c = this.fxCtx();
      c.fillStyle = lt.rim;
      c.fillRect(0, 0, L.w, L.h);
      this.masked(c, it.rim);
      this.blit(ctx, 'lighter', Math.min(1, rimA));
    }
  }

  /** Near and mid objects passing between the sun and you cast moving shadow bands. */
  private shadowBands(L: Layout, t: number): { x: number; w: number; a: number }[] {
    const out: { x: number; w: number; a: number }[] = [];
    for (const o of this.jr!.objs) {
      if (o.L !== 'near' && o.L !== 'mid') continue;
      if (o.kind !== 'pole' && o.kind !== 'occluder' && o.kind !== 'windmill') continue;
      const x = L.wl + this.sx(o.lx, o.L, t, L.ww);
      if (x < L.wl - 40 || x > L.wr + 40) continue;
      const near = o.L === 'near';
      const w = o.kind === 'pole' ? 1.5 : o.kind === 'windmill' ? 3 : lw(o.c) * (near ? 0.6 : 0.35);
      // nearer things throw wider, darker shadows a little further left
      out.push({ x: x - (near ? 30 : 14) - w / 2, w, a: near ? 0.8 : o.kind === 'pole' ? 0.55 : 0.5 });
    }
    return out;
  }

  /** How much the sun itself is blocked right now (dims the rim and flare). */
  private sunOcclusion(L: Layout, t: number): number {
    if (sunAt(t) <= 0) return 0;
    const sp = this.sunPos(L, t);
    let occ = 0;
    for (const o of this.jr!.objs) {
      if (o.kind !== 'pole' && o.kind !== 'occluder' && o.kind !== 'windmill') continue;
      const x = this.sx(o.lx, o.L, t, L.ww);
      const half = o.kind === 'pole' ? 2 : lw(o.c) * 0.4;
      const top = L.yh + LAYER_BASE[o.L] + o.dy - lh(o.c);
      if (sp.y < top) continue;
      const d = Math.abs(x - sp.x);
      if (d < half + 4) occ = Math.max(occ, o.kind === 'pole' ? 0.35 : 1 - Math.max(0, d - half) / 4);
    }
    return occ;
  }

  private drawFlare(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    const sun = sunAt(t) * (1 - this.sunOcclusion(L, t) * 0.85);
    if (sun <= 0.02) return;
    const sp = this.sunPos(L, t);
    const sx = L.wl + sp.x;
    const sy = sp.y;
    const cx = L.w / 2;
    const cy = L.h / 2;
    ctx.globalCompositeOperation = 'lighter';
    // a soft anamorphic streak through the sun
    const st = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
    st.addColorStop(0, 'rgba(255,170,110,0)');
    st.addColorStop(0.5, `rgba(255,214,160,${0.2 * sun})`);
    st.addColorStop(1, 'rgba(255,170,110,0)');
    ctx.fillStyle = st;
    ctx.fillRect(sx - 120, sy - 0.5, 240, 1);
    // ghosts down the line through the middle of the frame
    const ghosts: [number, number, string][] = [
      [0.55, 5, '255,200,140'],
      [1.15, 3, '200,240,200'],
      [1.45, 9, '255,160,180'],
      [1.8, 4, '180,200,255'],
    ];
    for (const [k, r, rgb] of ghosts) {
      const gx = sx + (cx - sx) * k;
      const gy = sy + (cy - sy) * k;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0, `rgba(${rgb},${0.08 * sun})`);
      g.addColorStop(0.7, `rgba(${rgb},${0.12 * sun})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawMotes(ctx: CanvasRenderingContext2D, L: Layout, t: number): void {
    const a = Math.max(sunAt(t), morningAt(t) * 0.5) * (1 - this.sunOcclusion(L, t) * 0.6);
    if (a <= 0.02) return;
    for (const m of this.motes) {
      const x = L.wl + ((m.x * L.ww + Math.sin(t * 0.3 + m.p) * 12 + t * 2 * m.s) % L.ww);
      const y = L.wt + L.wh * 0.25 + ((m.y * L.wh * 0.9 + Math.cos(t * 0.23 + m.p) * 8 - t * 1.5 * m.s) % (L.wh * 0.9) + L.wh * 0.9) % (L.wh * 0.9);
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + m.p * 3);
      ctx.fillStyle = `rgba(255,240,200,${0.55 * a * tw * m.s})`;
      ctx.fillRect(Math.round(x * 2) / 2, Math.round(y * 2) / 2, 0.5, 0.5);
    }
  }
}

export { RATE };
