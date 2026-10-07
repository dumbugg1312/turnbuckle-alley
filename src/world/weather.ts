import { audio } from '../audio';
import { getSeason } from '../gfx/world/terrain';
import { hash2 } from '../gfx/kit';
import type { TerrainId } from './types';
import { TILE } from './types';

/**
 * Weather you can feel: snowfall with depth, gusts that carry leaves and
 * bend the plants, and storm lightning followed by thunder. Rain streaks
 * stay in the world scene; this adds everything else. Screen-space layers
 * use the camera delta for parallax so flakes and leaves feel like they hang
 * at different depths instead of being painted on the glass.
 */

interface Flake {
  x: number;
  y: number;
  /** Depth 0 (far, small, slow) .. 1 (near, big, quicker). */
  z: number;
  ph: number;
}

interface Blown {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
  life: number;
  color: string;
  dark: string;
}

/** Lightning flash brightness over time (seconds since the strike): a flicker, a dip, the real flash, then a fade. */
export function flashLevel(t: number): number {
  if (t < 0) return 0;
  if (t < 0.06) return 0.55;
  if (t < 0.13) return 0.12;
  if (t < 0.24) return 0.85;
  if (t < 0.85) return 0.85 * Math.pow(1 - (t - 0.24) / 0.61, 2);
  return 0;
}

/** Seconds between the flash and the thunder for a strike `miles` away (sound covers about a mile in five seconds; kept snappy for play). */
export function thunderDelay(miles: number): number {
  return 0.35 + Math.max(0, miles) * 1.1;
}

/** Leaves, petals or powder for a gust in each season. [colour, dark side]. */
const GUST: Record<string, [string, string][]> = {
  spring: [['#ffbcd0', '#e08aa8'], ['#fff0f4', '#f0b8c8'], ['#9ad070', '#5a9a4a']],
  summer: [['#7ab858', '#4a8a44'], ['#9ad070', '#5a9a4a'], ['#f2e2a0', '#c8b070']],
  fall: [['#f2a444', '#c06a2a'], ['#d65a3a', '#9a3a2a'], ['#ffd050', '#c89a2a'], ['#a8704f', '#7a4a3a']],
  winter: [['#f6f8fc', '#c8d0e8'], ['#a8704f', '#7a4a3a'], ['#e4e8f6', '#b8c0dc']],
};

/** How much a terrain holds fresh snow (roads and sidewalks are shovelled). */
const SNOW_HOLD: Partial<Record<TerrainId, number>> = {
  grass: 0.85, 'grass-dark': 1, flowers: 0.8, dirt: 0.7, 'dirt-dark': 0.7, path: 0.5, tilled: 0.65, sand: 0.5, gravel: 0.6, parking: 0.34,
  brick: 0.28, sidewalk: 0.17, concrete: 0.3, stone: 0.4, mud: 0.17,
};
/** World px the drift field repeats over. */
const COVER_SIZE = 128;

export class Weather {
  private flakes: Flake[] = [];
  private blown: Blown[] = [];
  /** Wind lines: thin pale streaks that race across during a gust. */
  private streaks: { x: number; y: number; len: number; life: number; ph: number }[] = [];
  private lastCam: { x: number; y: number } | null = null;
  /** Seconds until the next gust / the current gust's age (wind days). */
  private gustIn = 3;
  gustT = -1;
  /** Current gust strength 0..1 (eases in and out). */
  gust = 0;
  /** Screen x of the gust's leading edge (plants bend as it passes). */
  gustFront = -1;
  private strikeIn = 6;
  private strikeT = -1;
  private thunderAt = -1;
  private thunderVol = 1;
  /** 0..1 lightning flash right now (the world scene lifts its lightmap by this). */
  flash = 0;
  /** A small camera rumble after close thunder, in px. */
  rumble = 0;
  private rumbleT = 0;
  private snowCover: HTMLCanvasElement[] = [];

  update(dt: number, weather: string, outdoor: boolean, view: { x: number; y: number; w: number; h: number }): void {
    const cam = { x: view.x, y: view.y };
    const dcx = this.lastCam ? cam.x - this.lastCam.x : 0;
    const dcy = this.lastCam ? cam.y - this.lastCam.y : 0;
    this.lastCam = cam;
    const jump = Math.abs(dcx) > 60 || Math.abs(dcy) > 60;
    this.updateSnow(dt, weather === 'snow' && outdoor, view, jump ? 0 : dcx, jump ? 0 : dcy);
    this.updateWind(dt, weather === 'wind' && outdoor, view, jump ? 0 : dcx, jump ? 0 : dcy);
    this.updateStorm(dt, weather === 'storm', outdoor);
  }

  // ------------------------------------------------------------ snow

  private updateSnow(dt: number, on: boolean, view: { w: number; h: number }, dcx: number, dcy: number): void {
    if (!on) {
      this.flakes.length = 0;
      return;
    }
    const want = Math.round(240 * ((view.w * view.h) / (480 * 270)));
    while (this.flakes.length < want) this.flakes.push({ x: Math.random() * view.w, y: Math.random() * view.h, z: Math.pow(Math.random(), 1.25), ph: Math.random() * 6.28 });
    if (this.flakes.length > want) this.flakes.length = want;
    const t = performance.now() / 1000;
    const wind = 5 + Math.sin(t * 0.23) * 4;
    for (const f of this.flakes) {
      const z = f.z;
      // Nearer flakes fall faster and sway wider; all of them drift with the breeze.
      f.y += (9 + 22 * z) * dt;
      f.x += (wind * (0.5 + z) + Math.sin(t * (0.9 + z * 0.8) + f.ph) * (3 + 9 * z)) * dt;
      // Parallax: far flakes barely move with the camera, near ones nearly world-locked.
      const par = 0.25 + 0.65 * z;
      f.x -= dcx * par;
      f.y -= dcy * par;
      const m = 6;
      if (f.y > view.h + m) {
        f.y -= view.h + m * 2;
        f.x = Math.random() * view.w;
      } else if (f.y < -m) f.y += view.h + m * 2;
      if (f.x > view.w + m) f.x -= view.w + m * 2;
      else if (f.x < -m) f.x += view.w + m * 2;
    }
  }

  // ------------------------------------------------------------ wind

  private updateWind(dt: number, on: boolean, view: { x: number; y: number; w: number; h: number }, dcx: number, dcy: number): void {
    for (const b of this.blown) {
      b.life += dt;
      b.ph += dt * (5 + Math.abs(b.vx) * 0.04);
      b.x += (b.vx + Math.sin(b.ph * 0.7) * 12) * dt - dcx * 0.9;
      b.y += (b.vy + Math.sin(b.ph) * 16) * dt - dcy * 0.9;
    }
    this.blown = this.blown.filter((b) => b.life < 6 && b.x < view.w + 20 && b.x > -40 && b.y > -30 && b.y < view.h + 30);
    for (const st of this.streaks) {
      st.life += dt;
      st.x += 260 * dt - dcx;
      st.y -= dcy;
    }
    this.streaks = this.streaks.filter((st) => st.life < 0.9);
    if (!on) {
      this.gust = Math.max(0, this.gust - dt);
      this.gustT = -1;
      this.gustFront = -1;
      return;
    }
    if (this.gustT < 0) {
      this.gustIn -= dt;
      if (this.gustIn <= 0) {
        this.gustT = 0;
        this.gustIn = 5 + Math.random() * 8;
        audio.sfx('whoosh', { volume: 0.18, pitch: 0.55 + Math.random() * 0.15 });
      }
    }
    if (this.gustT >= 0) {
      this.gustT += dt;
      const T = 3;
      const k = this.gustT / T;
      this.gust = Math.sin(Math.min(1, k) * Math.PI);
      this.gustFront = -20 + (view.w + 80) * Math.min(1, k * 1.6);
      // Leaves ride the gust in from the upwind edge.
      if (Math.random() < this.gust * dt * 40) this.spawnBlown(view, false);
      if (Math.random() < this.gust * dt * 5 && this.streaks.length < 6) this.streaks.push({ x: Math.random() * view.w * 0.7 - 40, y: 10 + Math.random() * (view.h - 20), len: 26 + Math.random() * 40, life: 0, ph: Math.random() * 6.28 });
      if (this.gustT > T) {
        this.gustT = -1;
        this.gustFront = -1;
      }
    } else this.gust = Math.max(0, this.gust - dt);
    // A steady trickle between gusts so a windy day never looks still.
    if (Math.random() < dt * 1.6) this.spawnBlown(view, true);
  }

  private spawnBlown(view: { w: number; h: number }, lazy: boolean): void {
    if (this.blown.length > 60) return;
    const pal = GUST[getSeason()] ?? GUST.summer;
    const [color, dark] = pal[(Math.random() * pal.length) | 0];
    const sp = lazy ? 40 + Math.random() * 30 : 90 + Math.random() * 70;
    this.blown.push({ x: -10 - Math.random() * 20, y: Math.random() * view.h * 0.9, vx: sp, vy: (Math.random() - 0.35) * 18, ph: Math.random() * 6.28, life: 0, color, dark });
  }

  // ------------------------------------------------------------ storm

  private updateStorm(dt: number, on: boolean, outdoor: boolean): void {
    if (this.strikeT >= 0) {
      this.strikeT += dt;
      this.flash = flashLevel(this.strikeT) * (outdoor ? 1 : 0.35);
      if (this.strikeT > 1) this.strikeT = -1;
    } else this.flash = 0;
    if (this.thunderAt >= 0) {
      this.thunderAt -= dt;
      if (this.thunderAt < 0) {
        audio.sfx('thunder', { volume: this.thunderVol * (outdoor ? 1 : 0.55), pitch: 0.8 + Math.random() * 0.3 });
        if (this.thunderVol > 0.8 && outdoor) this.rumbleT = 0.45;
      }
    }
    if (this.rumbleT > 0) {
      this.rumbleT -= dt;
      this.rumble = this.rumbleT > 0 ? Math.round(Math.sin(this.rumbleT * 70) * Math.min(1, this.rumbleT * 4)) : 0;
    } else this.rumble = 0;
    if (!on) {
      this.strikeIn = 4 + Math.random() * 6;
      return;
    }
    this.strikeIn -= dt;
    if (this.strikeIn <= 0) this.strike();
  }

  /** A lightning strike now (also handy for playtests). */
  strike(): void {
    this.strikeIn = 10 + Math.random() * 16;
    this.strikeT = 0;
    const miles = Math.random() * 1.6;
    this.thunderAt = thunderDelay(miles);
    this.thunderVol = Math.max(0.35, 1 - miles * 0.4);
  }

  // ------------------------------------------------------------ drawing

  /**
   * Snow lying on the ground, drawn with destination-over between the cast
   * shadows and the ground, so it tints only the ground. One seamless field
   * of soft drifts (smooth noise in world space, cut at several depths) is
   * sampled per visible tile at a depth that suits the terrain, so yards are
   * blanketed, paths are patchy and the shovelled street keeps a dusting at
   * the kerbs.
   */
  drawSnowCover(ctx: CanvasRenderingContext2D, terrainAt: (tx: number, ty: number) => TerrainId, cam: { x: number; y: number }, w: number, h: number): void {
    if (!this.snowCover.length) this.buildCover();
    const S = COVER_SIZE;
    const x0 = Math.floor(cam.x / TILE);
    const y0 = Math.floor(cam.y / TILE);
    const x1 = Math.ceil((cam.x + w) / TILE);
    const y1 = Math.ceil((cam.y + h) / TILE);
    const LV = this.snowCover.length;
    const hold = (tx: number, ty: number) => SNOW_HOLD[terrainAt(tx, ty)] ?? 0;
    const Q = TILE / 2;
    for (let ty = y0; ty <= y1; ty++)
      for (let tx = x0; tx <= x1; tx++) {
        const here = hold(tx, ty);
        if (!here) continue;
        // Each quarter tile leans toward its neighbours' depth, so drifts thin out across a border instead of stopping at a tile edge.
        for (let q = 0; q < 4; q++) {
          const dx = q & 1 ? 1 : -1;
          const dy = q & 2 ? 1 : -1;
          const v = (here * 2 + hold(tx + dx, ty) + hold(tx, ty + dy)) / 4;
          const lvl = Math.round(v * LV) - 1;
          if (lvl < 0) continue;
          const px = tx * TILE + (q & 1 ? Q : 0);
          const py = ty * TILE + (q & 2 ? Q : 0);
          ctx.drawImage(this.snowCover[Math.min(LV - 1, lvl)], ((px % S) + S) % S, ((py % S) + S) % S, Q, Q, px, py, Q, Q);
        }
      }
  }

  /** The drift field at several depths: seamless, on the half-pixel grid. */
  private buildCover(): void {
    const S = COVER_SIZE;
    const F = S * 2;
    // Tileable value noise: two octaves of bilinear hashes on a wrapped grid.
    const vn = (x: number, y: number, cell: number, seed: number) => {
      const n = F / cell;
      const gx = x / cell;
      const gy = y / cell;
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const fx = gx - ix;
      const fy = gy - iy;
      const sm = (t: number) => t * t * (3 - 2 * t);
      const hh = (a: number, b: number) => hash2(((a % n) + n) % n, ((b % n) + n) % n, seed);
      const a = hh(ix, iy) + (hh(ix + 1, iy) - hh(ix, iy)) * sm(fx);
      const b = hh(ix, iy + 1) + (hh(ix + 1, iy + 1) - hh(ix, iy + 1)) * sm(fx);
      return a + (b - a) * sm(fy);
    };
    const field = new Float32Array(F * F);
    for (let y = 0; y < F; y++) for (let x = 0; x < F; x++) field[y * F + x] = 0.65 * vn(x, y, 32, 91) + 0.35 * vn(x, y, 12, 93);
    const LV = 6;
    for (let l = 0; l < LV; l++) {
      const c = document.createElement('canvas');
      c.width = F;
      c.height = F;
      (c as unknown as { __k: number }).__k = 2;
      const x = c.getContext('2d')!;
      const img = x.createImageData(F, F);
      const d = new Uint32Array(img.data.buffer);
      // Deeper levels cover more ground.
      const cut = 0.22 + (l / (LV - 1)) * 0.62;
      for (let py = 0; py < F; py++)
        for (let px = 0; px < F; px++) {
          const v = field[py * F + px];
          if (v > cut) continue;
          // The drift's rim is a lilac shadow on the lower side and dithered so it melts into the ground.
          const rim = cut - v;
          if (rim < 0.035 && ((px + py) & 1)) continue;
          const below = py + 2 < F ? field[(py + 2) * F + px] : v;
          const shade = rim < 0.06 || below > cut;
          // ABGR: soft blue-white body, lilac rim.
          d[py * F + px] = shade ? 0xb8e8d6d0 : 0xe0fcf7f2;
        }
      x.putImageData(img, 0, 0);
      this.snowCover.push(c);
    }
  }

  /** Screen-space layers: blown leaves and snowflakes. Call with an identity (native-pixel) transform. */
  drawScreen(ctx: CanvasRenderingContext2D): void {
    const q = (v: number) => Math.round(v * 2) / 2;
    // Wind lines: a slight wave, fading in and out.
    ctx.fillStyle = '#f6f8fc';
    for (const st of this.streaks) {
      const a = Math.sin((st.life / 0.9) * Math.PI) * 0.35;
      for (let i = 0; i < st.len; i += 0.5) {
        const k = i / st.len;
        ctx.globalAlpha = a * Math.sin(k * Math.PI);
        ctx.fillRect(q(st.x + i), q(st.y + Math.sin(k * 5 + st.ph) * 1.5), 0.5, 0.5);
      }
    }
    for (const b of this.blown) {
      const fade = Math.min(1, b.life * 4, (6 - b.life) * 2);
      ctx.globalAlpha = fade;
      const x = q(b.x);
      const y = q(b.y);
      const flip = Math.sin(b.ph * 1.3);
      // A leaf seen edge-on, flat, or turned over as it tumbles.
      ctx.fillStyle = flip > 0.3 ? b.color : b.dark;
      if (Math.abs(flip) < 0.3) ctx.fillRect(x - 1, y, 3.5, 0.5);
      else {
        // a leaf: pointed ends, a fat middle, a shaded underside and a stem nub
        ctx.fillRect(x - 1, y, 3.5, 1);
        ctx.fillRect(x - 0.5, y - 0.5, 2.5, 0.5);
        ctx.fillRect(x, y + 1, 1.5, 0.5);
        ctx.fillStyle = flip > 0.3 ? b.dark : b.color;
        ctx.fillRect(x - 0.5, y + 0.5, 2.5, 0.5);
        ctx.fillRect(x - 1.5, y + 0.5, 0.5, 0.5);
      }
    }
    for (const f of this.flakes) {
      const x = q(f.x);
      const y = q(f.y);
      if (f.z < 0.35) {
        ctx.globalAlpha = 0.6 + f.z;
        ctx.fillStyle = '#eef0fa';
        ctx.fillRect(x, y, 0.5, 0.5);
      } else if (f.z < 0.8) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#f6f8fc';
        ctx.fillRect(x, y, 1, 1);
        ctx.fillStyle = '#c8d0e8';
        ctx.fillRect(x + 0.5, y + 0.5, 0.5, 0.5);
      } else {
        // Near flakes: a little round clump, lit on top, a touch see-through.
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#d4dcf0';
        ctx.fillRect(x - 0.5, y, 2, 1);
        ctx.fillRect(x, y - 0.5, 1, 2);
        ctx.fillStyle = '#f6f8fc';
        ctx.fillRect(x, y - 0.5, 1, 1);
        ctx.fillRect(x - 0.5, y, 0.5, 0.5);
      }
    }
    ctx.globalAlpha = 1;
  }

  /** The lightning flash over the finished frame: lavender, screened, never a white blowout. */
  drawFlash(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (this.flash <= 0.01) return;
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.min(0.42, this.flash * 0.5);
    ctx.fillStyle = '#cfc8f4';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}
