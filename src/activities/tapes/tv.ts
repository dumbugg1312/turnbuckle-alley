import type { Dir } from '../../core/state';
import { drawCharacter, type Pose } from '../../gfx/characters';
import { pixelText, textWidth } from '../../gfx/draw';
import { castMember } from './cast';
import type { Spot, TapeDef, Venue } from './types';

/**
 * The picture on the tape: a tiny 160x120 frame drawn in pixel art, then run
 * through a VHS pass (chroma bleed, luma noise, dropouts, era grading).
 * The CRT compositor (watch.ts) adds wobble, scanlines, bloom and the curve.
 */
export const PW = 160;
export const PH = 120;

export type PicMode = 'blue' | 'snow' | 'card' | 'show' | 'ad' | 'black';

export interface PicState {
  tape: TapeDef;
  mode: PicMode;
  spot: Spot;
  who: [string, string];
  /** Seconds into the current shot. */
  t: number;
  /** Global seconds (for crowd, flicker). */
  clock: number;
  card?: string;
  ad?: [string, string, string]; // headline, sub, color
  caption?: string;
}

const FLOOR = 88; // wrestlers' feet on the mat
const RING_L = 16;
const RING_R = 144;

function hash(n: number): number {
  n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  n ^= n >>> 13;
  n = Math.imul(n, 0xc2b2ae35);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

const CROWD_COLORS = ['#d8434b', '#3f74d8', '#f4b63f', '#2fa59a', '#ff5d8f', '#e6d6b8', '#7a4f86', '#58b368', '#c8643a', '#f2f2f8', '#5a5a72', '#e2903a'];
const SKINS = ['#ffdbc4', '#f6c3a0', '#e8a982', '#d08b62', '#b06d48', '#8d5233', '#6b3c26'];

interface Venuepal {
  wall: string;
  wall2: string;
  mat: string;
  matShade: string;
  apron: string;
  ropes: [string, string, string];
  post: string;
  light: string;
}

const VENUES: Record<Venue, Venuepal> = {
  sportatorium: { wall: '#1a1230', wall2: '#2b1d48', mat: '#e8e2d4', matShade: '#c4bca8', apron: '#b8243c', ropes: ['#d8434b', '#f2f2f8', '#3f74d8'], post: '#c8c8d8', light: '#fff1c2' },
  vfw: { wall: '#4a3a2e', wall2: '#5e4a3a', mat: '#d8d0c0', matShade: '#b0a690', apron: '#3d5a8a', ropes: ['#f2f2f8', '#f2f2f8', '#f2f2f8'], post: '#8a8a9a', light: '#ffe9a0' },
  armory: { wall: '#3a3a42', wall2: '#4a4a52', mat: '#e0e0e0', matShade: '#b8b8b8', apron: '#5a5a62', ropes: ['#f2f2f2', '#f2f2f2', '#f2f2f2'], post: '#9a9aa2', light: '#ffffff' },
  fairgrounds: { wall: '#2c4166', wall2: '#3d5a8a', mat: '#e6dcc0', matShade: '#c0b090', apron: '#518c5c', ropes: ['#f4b63f', '#f2f2f8', '#f4b63f'], post: '#c8c8d8', light: '#ffe9a0' },
  barn: { wall: '#5a2e22', wall2: '#7a3e2a', mat: '#e6d6b8', matShade: '#c0aa88', apron: '#7a5236', ropes: ['#e6d6b8', '#d8434b', '#e6d6b8'], post: '#8a6a4a', light: '#ffd77a' },
  arena: { wall: '#16122a', wall2: '#241c3c', mat: '#8ab4e0', matShade: '#6a94c0', apron: '#e2903a', ropes: ['#d8434b', '#2fa59a', '#f4b63f'], post: '#c8c8d8', light: '#fff4dc' },
  backyard: { wall: '#6ab0e0', wall2: '#9ad0f0', mat: '#5c9a4e', matShade: '#4a8040', apron: '#7a5236', ropes: ['#f2f2f8', '#f2f2f8', '#f2f2f8'], post: '#8a8a9a', light: '#ffffff' },
  studio: { wall: '#2c4166', wall2: '#30407c', mat: '#d8d0c0', matShade: '#b0a690', apron: '#2c4166', ropes: ['#f2f2f8', '#d8434b', '#f2f2f8'], post: '#a8a8b8', light: '#fff4dc' },
  gym: { wall: '#3a4a5a', wall2: '#4a5a6a', mat: '#d8e0e8', matShade: '#b0bcc8', apron: '#2d6a76', ropes: ['#f2f2f8', '#2d6a76', '#f2f2f8'], post: '#a8a8b8', light: '#f6fbff' },
};

export class TvPicture {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  /** Average color of the last frame (for the glow on the room). */
  avg: [number, number, number] = [60, 60, 120];
  private y = new Float32Array(PW);
  private u = new Float32Array(PW);
  private v = new Float32Array(PW);

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = PW;
    this.canvas.height = PH;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.ctx.imageSmoothingEnabled = false;
  }

  render(p: PicState, distortion: number): void {
    const x = this.ctx;
    x.save();
    x.imageSmoothingEnabled = false;
    switch (p.mode) {
      case 'blue':
        x.fillStyle = '#1b34c8';
        x.fillRect(0, 0, PW, PH);
        break;
      case 'black':
        x.fillStyle = '#05040a';
        x.fillRect(0, 0, PW, PH);
        break;
      case 'snow':
        this.snow(1);
        break;
      case 'card':
        this.titleCard(p);
        break;
      case 'ad':
        this.adCard(p);
        break;
      case 'show':
        this.scene(p);
        break;
    }
    x.restore();
    if (p.mode !== 'snow' && p.mode !== 'blue') this.vhs(p.tape, distortion, p.clock, p.mode === 'black');
    else this.measure();
  }

  // ------------------------------------------------------------ scenes

  private scene(p: PicState): void {
    const s = p.spot;
    if (s === 'promo') return this.promoShot(p);
    if (s === 'crowd') return this.crowdShot(p, null);
    if (s === 'scout') return this.crowdShot(p, 'scout');
    if (s === 'closeup-belt') return this.beltShot(p);
    if (s === 'belt-missing') return this.trophyShot(p);
    if (s === 'birthday') return this.birthdayShot(p);
    if (s === 'parking') return this.parkingShot(p);
    if (s === 'bars') return this.bars(p);
    if (s === 'aisle' || s === 'entrance') return this.aisleShot(p);
    this.ringShot(p);
  }

  private crowdRows(top: number, bottom: number, pal: Venuepal, clock: number, excite: number, seed: number, big = 1): void {
    const x = this.ctx;
    const rows = Math.floor((bottom - top) / (5 * big));
    for (let r = 0; r < rows; r++) {
      const yy = top + r * 5 * big;
      const step = 5 * big;
      for (let c = -1; c < PW / step + 1; c++) {
        const h = hash(seed + r * 977 + c * 131);
        const xx = c * step + (r % 2) * (step / 2) + Math.floor(h * 2);
        const bob = Math.sin(clock * (5 + h * 4) + h * 10) > 0.6 - excite ? -1 * big : 0;
        x.fillStyle = CROWD_COLORS[Math.floor(h * CROWD_COLORS.length)];
        x.fillRect(xx, yy + 3 * big + bob, 4 * big, 3 * big);
        x.fillStyle = SKINS[Math.floor(hash(h * 1e6) * SKINS.length)];
        x.fillRect(xx + big, yy + bob, 2 * big + (big > 1 ? 1 : 0), 3 * big);
        if (excite > 0.5 && h > 0.86) {
          x.fillRect(xx + 3 * big, yy - 2 * big + bob, big, 3 * big); // arm up
        }
      }
    }
    x.fillStyle = pal.wall;
    x.globalAlpha = 0.25;
    x.fillRect(0, top, PW, Math.floor((bottom - top) * 0.4));
    x.globalAlpha = 1;
  }

  private backdrop(p: PicState, pal: Venuepal): void {
    const x = this.ctx;
    const g = x.createLinearGradient(0, 0, 0, 60);
    g.addColorStop(0, pal.wall);
    g.addColorStop(1, pal.wall2);
    x.fillStyle = g;
    x.fillRect(0, 0, PW, PH);
    const v = p.tape.venue;
    if (v === 'barn') {
      x.fillStyle = '#4a2418';
      for (let i = 0; i < PW; i += 12) x.fillRect(i, 0, 1, 50);
      x.fillStyle = '#e6c870';
      for (let i = 0; i < 4; i++) x.fillRect(4 + i * 42, 52, 30, 6); // hay bales
    }
    if (v === 'fairgrounds') {
      x.fillStyle = '#0e1a30';
      x.fillRect(0, 0, PW, 22);
      for (let i = 0; i < 18; i++) {
        const h = hash(i * 13);
        x.fillStyle = '#f6fbff';
        x.fillRect(Math.floor(h * PW), Math.floor(hash(i * 7) * 18), 1, 1);
      }
      x.fillStyle = '#f4b63f';
      x.fillRect(20, 4, 4, 2);
      x.fillRect(136, 4, 4, 2);
    }
    if (v === 'backyard') {
      x.fillStyle = '#f8f8ff';
      x.fillRect(20 + ((p.clock * 3) % 160) - 30, 10, 22, 5);
      x.fillStyle = '#6a4a30';
      for (let i = 0; i < PW; i += 6) x.fillRect(i, 40, 4, 18); // fence
      x.fillStyle = '#5c9a4e';
      x.fillRect(0, 56, PW, 64);
      return;
    }
    if (v === 'studio') {
      x.fillStyle = '#f4b63f';
      const name = (p.tape.card ?? p.tape.promo).toUpperCase().slice(0, 26);
      pixelText(x, name, 80 - textWidth(name) / 2, 14, '#f4b63f', 1, '#1e1426');
      x.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 6; i++) x.fillRect(i * 30 + 6, 26, 14, 26);
    }
    const excite = p.spot === 'crowd' ? 1 : 0.4;
    if (v !== 'studio') this.crowdRows(v === 'vfw' ? 30 : 18, 58, pal, p.clock, excite, p.tape.year);
    else this.crowdRows(44, 58, pal, p.clock, 0.3, p.tape.year);
    // Spotlights from the truss.
    if (v === 'sportatorium' || v === 'arena') {
      x.globalAlpha = 0.07;
      x.fillStyle = pal.light;
      for (const cx of [50, 110]) {
        x.beginPath();
        x.moveTo(cx - 3, 0);
        x.lineTo(cx + 3, 0);
        x.lineTo(cx + 26, FLOOR);
        x.lineTo(cx - 26, FLOOR);
        x.fill();
      }
      x.globalAlpha = 1;
    }
    // Flash bulbs.
    if (p.tape.year >= 1965 && p.tape.year <= 2000 && v !== 'studio') {
      const f = Math.floor(p.clock * 7);
      if (hash(f * 3 + 1) > 0.82) {
        x.fillStyle = '#ffffff';
        const fx = Math.floor(hash(f) * PW);
        const fy = 22 + Math.floor(hash(f + 9) * 30);
        x.fillRect(fx - 1, fy, 3, 1);
        x.fillRect(fx, fy - 1, 1, 3);
      }
    }
  }

  private ring(p: PicState, pal: Venuepal, pass: 'back' | 'front'): void {
    const x = this.ctx;
    if (pass === 'back') {
      // Mat (a gentle trapezoid).
      x.fillStyle = pal.mat;
      x.beginPath();
      x.moveTo(RING_L + 10, 62);
      x.lineTo(RING_R - 10, 62);
      x.lineTo(RING_R + 8, 94);
      x.lineTo(RING_L - 8, 94);
      x.fill();
      x.fillStyle = pal.matShade;
      x.fillRect(RING_L - 8, 92, RING_R - RING_L + 16, 2);
      // Apron.
      x.fillStyle = pal.apron;
      x.fillRect(RING_L - 8, 94, RING_R - RING_L + 16, 12);
      x.fillStyle = 'rgba(0,0,0,0.25)';
      x.fillRect(RING_L - 8, 104, RING_R - RING_L + 16, 2);
      const name = (p.tape.promo.match(/\b[A-Z]/g) ?? ['T', 'A']).join('').slice(0, 5);
      pixelText(x, name, 80 - textWidth(name) / 2, 97, '#fff4dc', 1);
      // Floor.
      x.fillStyle = p.tape.venue === 'backyard' ? '#4a8040' : '#120c1c';
      x.fillRect(0, 106, PW, 14);
      // Back posts and ropes.
      x.fillStyle = pal.post;
      x.fillRect(RING_L + 9, 40, 2, 22);
      x.fillRect(RING_R - 11, 40, 2, 22);
      for (let i = 0; i < 3; i++) {
        x.fillStyle = pal.ropes[i];
        x.fillRect(RING_L + 10, 44 + i * 6, RING_R - RING_L - 20, 1);
      }
    } else {
      x.fillStyle = pal.post;
      x.fillRect(RING_L - 9, 62, 3, 33);
      x.fillRect(RING_R + 6, 62, 3, 33);
      x.fillStyle = pal.ropes[0];
      x.fillRect(RING_L - 10, 64, 5, 4);
      x.fillRect(RING_R + 5, 64, 5, 4);
      for (let i = 0; i < 3; i++) {
        x.fillStyle = pal.ropes[i];
        x.fillRect(RING_L - 8, 68 + i * 7, RING_R - RING_L + 16, 1);
      }
      // Side ropes (perspective).
      x.fillStyle = 'rgba(242,242,248,0.6)';
      for (let i = 0; i < 3; i++) {
        drawLine(x, RING_L + 10, 44 + i * 6, RING_L - 8, 68 + i * 7);
        drawLine(x, RING_R - 10, 44 + i * 6, RING_R + 8, 68 + i * 7);
      }
    }
  }

  private wrestler(id: string, px: number, py: number, facing: Dir, pose: Pose, t: number): void {
    const m = castMember(id);
    try {
      drawCharacter(this.ctx, m.look, px, py, { facing, pose, frame: Math.floor(t * 6), t });
    } catch {
      // The renderer is being upgraded; draw a stand-in so the tape still plays.
      const x = this.ctx;
      x.fillStyle = m.look.topColor;
      x.fillRect(px - 4, py - 22, 8, 14);
      x.fillStyle = m.look.skin;
      x.fillRect(px - 3, py - 28, 6, 6);
      x.fillStyle = m.look.bottomColor;
      x.fillRect(px - 4, py - 8, 8, 8);
    }
  }

  private ringShot(p: PicState): void {
    const pal = VENUES[p.tape.venue];
    const x = this.ctx;
    this.backdrop(p, pal);
    if (p.spot === 'lights-out' || p.spot === 'porch-light') {
      x.fillStyle = 'rgba(5,4,14,0.86)';
      x.fillRect(0, 0, PW, PH);
    }
    if (p.spot === 'teardown') {
      // After the show: empty hall, stacked chairs, one work light.
      x.fillStyle = '#1c1612';
      x.fillRect(0, 0, PW, 62);
      x.fillStyle = '#5a5a62';
      for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) x.fillRect(8 + i * 30, 56 - j * 4, 12, 2);
      const g = x.createRadialGradient(130, 6, 2, 100, 60, 90);
      g.addColorStop(0, 'rgba(255,240,200,0.55)');
      g.addColorStop(1, 'rgba(255,240,200,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, PW, PH);
    }
    this.ring(p, pal, 'back');
    const [a, b] = p.who;
    const t = p.t;
    const ref = p.tape.ref;
    const ringside = p.tape.ringside;
    // Props behind the wrestlers.
    if (p.spot === 'ladder') {
      x.fillStyle = '#c8c8d8';
      x.fillRect(74, 40, 2, 50);
      x.fillRect(86, 40, 2, 50);
      for (let i = 0; i < 7; i++) x.fillRect(74, 44 + i * 7, 14, 1);
      x.fillStyle = '#5a3a2e';
      x.fillRect(77, 10, 8, 6);
      x.fillStyle = '#c8c8d8';
      x.fillRect(80, 0, 1, 10);
    }
    if (p.spot === 'box') {
      x.fillStyle = '#d8434b';
      x.fillRect(73, 74, 14, 12);
      x.fillStyle = '#f4b63f';
      x.fillRect(79, 74, 2, 12);
      x.fillRect(73, 79, 14, 2);
      x.fillRect(76, 71, 8, 3);
    }
    if (p.spot === 'table') {
      const broke = (t % 3) > 2;
      x.fillStyle = '#8a6a4a';
      if (!broke) {
        x.fillRect(64, 76, 32, 3);
        x.fillRect(66, 79, 2, 8);
        x.fillRect(92, 79, 2, 8);
      } else {
        x.fillRect(62, 84, 14, 3);
        x.fillRect(84, 85, 14, 3);
      }
    }
    // Choreography.
    const c = choreo(p.spot, t);
    if (ringside) this.wrestler(ringside, 152, 116, 'left', 'idle', t);
    if (ref && p.spot !== 'porch-light') this.wrestler(ref, c.refX, FLOOR - 4, c.refX > 80 ? 'left' : 'right', c.refPose, t);
    if (p.spot === 'porch-light') {
      // The bare bulb on its cord.
      x.fillStyle = '#5a5a62';
      x.fillRect(80, 0, 1, 28);
      const on = t > 0.6;
      if (on) {
        const g = x.createRadialGradient(80, 30, 1, 80, 30, 46);
        g.addColorStop(0, 'rgba(255,214,120,0.85)');
        g.addColorStop(1, 'rgba(255,190,90,0)');
        x.fillStyle = g;
        x.fillRect(30, 0, 100, 100);
      }
      x.fillStyle = on ? '#fff1c2' : '#6a6a6a';
      x.fillRect(79, 28, 3, 4);
      if (ref) this.wrestler(ref, 40, FLOOR, 'right', 'down', t);
    }
    if (p.spot === 'lights-out') {
      // Truck headlights from the floor.
      x.globalAlpha = 0.18 + 0.04 * Math.sin(p.clock * 3);
      x.fillStyle = '#fff4c0';
      x.beginPath();
      x.moveTo(0, 110);
      x.lineTo(70, 60);
      x.lineTo(100, 80);
      x.lineTo(10, 120);
      x.fill();
      x.beginPath();
      x.moveTo(160, 110);
      x.lineTo(90, 60);
      x.lineTo(60, 80);
      x.lineTo(150, 120);
      x.fill();
      x.globalAlpha = 1;
    }
    const drawB = () => this.wrestler(b, c.bx, c.by, c.bFace, c.bPose, t);
    const drawA = () => this.wrestler(a, c.ax, c.ay, c.aFace, c.aPose, t);
    if (c.aFirst) {
      drawA();
      drawB();
    } else {
      drawB();
      drawA();
    }
    this.ring(p, pal, 'front');
    if (p.spot === 'snow' || (p.tape.venue === 'barn' && p.tape.seasons?.includes(3))) this.weather('snow', p.clock);
    if (p.spot === 'mud') this.weather('rain', p.clock);
    if (p.spot === 'mask' && Math.floor(t * 2) % 4 === 3) {
      x.fillStyle = '#05040a';
      x.fillRect(0, 0, PW, PH);
    }
    if (p.spot === 'broken-belt') {
      // The belt in Dottie's hands, raised.
      if (t % 4 < 2.6) {
        x.fillStyle = '#f4c64f';
        x.fillRect(c.ax - 8, c.ay - 34, 16, 4);
        x.fillStyle = '#d8434b';
        x.fillRect(c.ax - 1, c.ay - 33, 2, 2);
      } else {
        x.fillStyle = '#f4c64f';
        x.fillRect(c.bx - 9, c.by - 4, 7, 3);
        x.fillRect(c.bx + 2, c.by - 3, 7, 3);
      }
    }
    if (p.spot === 'song' || p.spot === 'promo') {
      // A little note or two drifting up.
      for (let i = 0; i < 3; i++) {
        const ph = (p.clock * 0.5 + i / 3) % 1;
        pixelText(x, i % 2 ? '*' : "'", c.ax + 6 + i * 4, c.ay - 30 - ph * 30, '#fff4dc');
      }
    }
  }

  private weather(kind: 'snow' | 'rain', clock: number): void {
    const x = this.ctx;
    for (let i = 0; i < 50; i++) {
      const h = hash(i * 17);
      if (kind === 'snow') {
        x.fillStyle = 'rgba(255,255,255,0.8)';
        x.fillRect(Math.floor((h * PW + Math.sin(clock + i) * 4) % PW), Math.floor((hash(i) * PH + clock * (8 + h * 10)) % PH), 1, 1);
      } else {
        x.fillStyle = 'rgba(200,220,255,0.45)';
        const yy = Math.floor((hash(i) * PH + clock * 160 * (0.7 + h * 0.5)) % PH);
        x.fillRect(Math.floor((h * PW - clock * 30 + 400) % PW), yy, 1, 4);
      }
    }
  }

  private promoShot(p: PicState): void {
    const x = this.ctx;
    const g = x.createLinearGradient(0, 0, PW, PH);
    g.addColorStop(0, '#2c2050');
    g.addColorStop(1, '#5a2a4a');
    x.fillStyle = g;
    x.fillRect(0, 0, PW, PH);
    // Logo wall.
    const name = (p.tape.card ?? p.tape.promo).toUpperCase().slice(0, 24);
    x.globalAlpha = 0.2;
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) pixelText(x, name.slice(0, 8), 6 + c * 54 + (r % 2) * 20, 8 + r * 14, '#f4b63f');
    x.globalAlpha = 1;
    const [a, b] = p.who;
    const t = p.t;
    // Two people, close-ish (double size).
    x.save();
    x.translate(0, 0);
    x.scale(2, 2);
    const pose: Pose = Math.floor(t * 1.5) % 3 === 0 ? 'taunt' : 'idle';
    this.wrestler(b, 26, 62, 'right', 'idle', t);
    this.wrestler(a, 52, 62, 'left', pose, t);
    x.restore();
    // Microphone.
    x.fillStyle = '#2a2236';
    x.fillRect(84, 52, 2, 10);
    x.fillStyle = '#9a9ab0';
    x.fillRect(83, 49, 4, 4);
    // Lower third.
    x.fillStyle = 'rgba(16,10,30,0.82)';
    x.fillRect(0, 98, PW, 14);
    x.fillStyle = '#f4b63f';
    x.fillRect(0, 98, 3, 14);
    const who = castMember(a).name.toUpperCase().replace(/"/g, '');
    pixelText(x, who.slice(0, 38), 6, 100, '#fff4dc');
    pixelText(x, p.tape.promo.toUpperCase().slice(0, 38), 6, 106, '#c8b0e0');
  }

  private crowdShot(p: PicState, special: 'scout' | null): void {
    const x = this.ctx;
    const pal = VENUES[p.tape.venue];
    x.fillStyle = pal.wall;
    x.fillRect(0, 0, PW, PH);
    this.crowdRows(0, PH, pal, p.clock, 0.9, p.tape.year + 7, 3);
    // Signs.
    const signs = special ? ['HAMMERS!', 'BIRDIE', 'DOTTIE'] : [(p.tape.card ?? 'WOOO').split(' ')[0], 'WE LOVE U', '10!'];
    signs.forEach((s, i) => {
      const sx = 10 + i * 52;
      const sy = 30 + Math.sin(p.clock * 4 + i) * 3;
      x.fillStyle = '#fbf0d9';
      x.fillRect(sx, sy, textWidth(s) + 6, 11);
      x.fillStyle = '#7a5236';
      x.fillRect(sx + textWidth(s) / 2 + 2, sy + 11, 2, 16);
      pixelText(x, s, sx + 3, sy + 3, i === 0 ? '#d8434b' : '#1e1426');
    });
    if (special === 'scout') {
      // The man in the gray suit, perfectly still, writing.
      x.fillStyle = 'rgba(10,6,20,0.35)';
      x.fillRect(0, 0, PW, PH);
      x.save();
      x.scale(2, 2);
      this.wrestler('scout', 40, 60, 'right', 'idle', 0);
      x.restore();
      x.fillStyle = '#fbf0d9';
      x.fillRect(90, 96, 10, 7);
      if (Math.floor(p.clock * 3) % 2) {
        x.fillStyle = '#1e1426';
        x.fillRect(92, 98, 5, 1);
      }
    }
  }

  private beltShot(p: PicState): void {
    const x = this.ctx;
    const pal = VENUES[p.tape.venue];
    x.fillStyle = pal.wall2;
    x.fillRect(0, 0, PW, PH);
    this.crowdRows(0, 40, pal, p.clock, 1, 3, 2);
    // Strap.
    x.fillStyle = '#2a1a14';
    x.fillRect(0, 54, PW, 22);
    x.fillStyle = '#3a2418';
    x.fillRect(0, 56, PW, 2);
    // Plate.
    x.fillStyle = '#c8901e';
    x.beginPath();
    x.ellipse(80, 64, 40, 26, 0, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#f4c64f';
    x.beginPath();
    x.ellipse(80, 63, 36, 22, 0, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = '#ffe48e';
    x.fillRect(56, 50, 48, 2);
    pixelText(x, 'TAG TEAM', 80 - textWidth('TAG TEAM') / 2, 54, '#8a5a1a');
    pixelText(x, 'CHAMPIONS', 80 - textWidth('CHAMPIONS') / 2, 72, '#8a5a1a');
    // The red rhinestone.
    const tw = 0.5 + 0.5 * Math.sin(p.clock * 6);
    x.fillStyle = '#b8243c';
    x.fillRect(77, 61, 6, 6);
    x.fillStyle = '#ff6a7a';
    x.fillRect(78, 62, 2, 2);
    if (tw > 0.7) {
      x.fillStyle = '#ffffff';
      x.fillRect(80, 58, 1, 3);
      x.fillRect(79, 59, 3, 1);
    }
    // Two gloved hands.
    x.fillStyle = '#5b2a6e';
    x.fillRect(16, 58, 18, 14);
    x.fillRect(30, 60, 8, 10);
    x.fillStyle = '#b8243c';
    x.fillRect(126, 58, 18, 14);
    x.fillRect(122, 60, 8, 10);
  }

  private trophyShot(p: PicState): void {
    const x = this.ctx;
    x.fillStyle = '#2a1d38';
    x.fillRect(0, 0, PW, PH);
    x.fillStyle = '#5a3a2e';
    x.fillRect(30, 80, 100, 30);
    x.fillStyle = 'rgba(180,220,255,0.18)';
    x.fillRect(36, 24, 88, 56);
    x.fillStyle = 'rgba(255,255,255,0.4)';
    x.fillRect(40, 28, 2, 44);
    x.fillStyle = '#7a5a40';
    x.fillRect(60, 60, 40, 3);
    const flick = Math.sin(p.clock * 9) > 0 ? '?' : '';
    pixelText(x, `EMPTY${flick}`, 80 - textWidth('EMPTY?') / 2, 46, '#d8434b');
  }

  private birthdayShot(p: PicState): void {
    const x = this.ctx;
    x.fillStyle = '#f2d8a8';
    x.fillRect(0, 0, PW, PH);
    x.fillStyle = '#e8c890';
    for (let i = 0; i < PW; i += 10) x.fillRect(i, 0, 5, 60);
    // Streamers.
    for (let i = 0; i < 8; i++) {
      x.fillStyle = CROWD_COLORS[i];
      x.fillRect(i * 20, 4 + (i % 2) * 3, 12, 2);
    }
    x.fillStyle = '#c8643a';
    x.fillRect(10, 80, 140, 8);
    // Cake.
    x.fillStyle = '#fff4dc';
    x.fillRect(64, 66, 32, 14);
    x.fillStyle = '#ff9ec0';
    x.fillRect(64, 66, 32, 3);
    const blown = p.t % 5 > 3.6;
    for (let i = 0; i < 7; i++) {
      x.fillStyle = '#3f74d8';
      x.fillRect(67 + i * 4, 60, 1, 6);
      if (!blown) {
        x.fillStyle = Math.sin(p.clock * 20 + i) > 0 ? '#ffd84a' : '#ff9a3a';
        x.fillRect(67 + i * 4, 58, 1, 2);
      }
    }
    this.wrestler(p.who[0], 50, 100, 'right', blown ? 'celebrate' : 'idle', p.t);
    this.wrestler(p.who[1], 112, 100, 'left', 'wave', p.t);
    pixelText(x, 'HAPPY BDAY PIP', 80 - textWidth('HAPPY BDAY PIP') / 2, 20, '#d8434b', 1, '#fff4dc');
  }

  private parkingShot(p: PicState): void {
    const x = this.ctx;
    x.fillStyle = '#0c0a18';
    x.fillRect(0, 0, PW, PH);
    x.fillStyle = '#2a2836';
    x.fillRect(0, 70, PW, 50);
    x.fillStyle = '#e8e0a0';
    for (let i = 0; i < 6; i++) x.fillRect(i * 30, 100, 14, 1);
    // The one buzzing light.
    const buzz = Math.sin(p.clock * 30) > -0.7 ? 1 : 0.3;
    x.fillStyle = '#5a5a62';
    x.fillRect(120, 14, 2, 60);
    const g = x.createRadialGradient(118, 16, 1, 110, 70, 70);
    g.addColorStop(0, `rgba(255,236,160,${0.6 * buzz})`);
    g.addColorStop(1, 'rgba(255,236,160,0)');
    x.fillStyle = g;
    x.fillRect(30, 0, 130, 120);
    // A car.
    x.fillStyle = '#7a2840';
    x.fillRect(14, 66, 40, 14);
    x.fillRect(22, 58, 24, 9);
    x.fillStyle = '#1e1426';
    x.fillRect(18, 78, 8, 6);
    x.fillRect(42, 78, 8, 6);
    const c = choreo('strike', p.t);
    this.wrestler(p.who[1], 70 + (c.bx - 90) * 0.5, 96, 'left', c.bPose, p.t);
    this.wrestler(p.who[0], 70 + (c.ax - 90) * 0.5, 96, 'right', c.aPose, p.t);
  }

  private aisleShot(p: PicState): void {
    const x = this.ctx;
    const pal = VENUES[p.tape.venue];
    x.fillStyle = pal.wall;
    x.fillRect(0, 0, PW, PH);
    // Aisle converging to the curtain.
    x.fillStyle = '#3a2a44';
    x.beginPath();
    x.moveTo(66, 30);
    x.lineTo(94, 30);
    x.lineTo(130, 120);
    x.lineTo(30, 120);
    x.fill();
    x.fillStyle = '#7a2840';
    x.fillRect(60, 6, 40, 26);
    x.fillStyle = '#9c2537';
    for (let i = 0; i < 5; i++) x.fillRect(62 + i * 8, 6, 3, 26);
    // Crowd both sides, rail.
    for (const side of [0, 1]) {
      x.save();
      x.beginPath();
      if (side === 0) {
        x.moveTo(0, 20);
        x.lineTo(64, 30);
        x.lineTo(28, 120);
        x.lineTo(0, 120);
      } else {
        x.moveTo(160, 20);
        x.lineTo(96, 30);
        x.lineTo(132, 120);
        x.lineTo(160, 120);
      }
      x.clip();
      this.crowdRows(20, PH, pal, p.clock, 0.8, side * 99 + 5, 2);
      x.restore();
    }
    // Spotlight on the walker.
    const leaving = p.spot === 'aisle';
    const prog = leaving ? Math.min(1, (p.t % 6) / 5) : 1 - Math.min(1, (p.t % 6) / 5);
    const wy = 112 - prog * 70;
    const sc = 2 - prog * 1.2;
    x.globalAlpha = 0.18;
    x.fillStyle = '#fff1c2';
    x.beginPath();
    x.ellipse(80, wy, 14 * sc, 5 * sc, 0, 0, Math.PI * 2);
    x.fill();
    x.globalAlpha = 1;
    x.save();
    x.translate(80, wy);
    x.scale(sc, sc);
    this.wrestler(p.who[0], 0, 0, leaving ? 'up' : 'down', 'walk', p.t);
    x.restore();
    if (leaving && p.who[1] && prog < 0.4) {
      // Seat A1, purse raised.
      x.save();
      x.translate(36, 116);
      x.scale(2, 2);
      this.wrestler(p.who[1], 0, 0, 'right', 'strike', p.t);
      x.restore();
    }
  }

  private bars(p: PicState): void {
    const x = this.ctx;
    const cols = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
    cols.forEach((c, i) => {
      x.fillStyle = c;
      x.fillRect(Math.floor((i * PW) / 7), 0, Math.ceil(PW / 7), 80);
    });
    x.fillStyle = '#101010';
    x.fillRect(0, 80, PW, 40);
    // The thing underneath the bars.
    if (p.t % 4 > 2) {
      x.globalAlpha = 0.35;
      this.ringShot({ ...p, spot: 'strike' });
      x.globalAlpha = 1;
    }
  }

  private titleCard(p: PicState): void {
    const x = this.ctx;
    const g = x.createLinearGradient(0, 0, 0, PH);
    g.addColorStop(0, '#1a1240');
    g.addColorStop(1, '#5a1a3a');
    x.fillStyle = g;
    x.fillRect(0, 0, PW, PH);
    // Starburst.
    x.globalAlpha = 0.12;
    x.fillStyle = '#f4b63f';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + p.clock * 0.3;
      x.beginPath();
      x.moveTo(80, 56);
      x.lineTo(80 + Math.cos(a) * 140, 56 + Math.sin(a) * 140);
      x.lineTo(80 + Math.cos(a + 0.18) * 140, 56 + Math.sin(a + 0.18) * 140);
      x.fill();
    }
    x.globalAlpha = 1;
    const words = (p.card ?? p.tape.promo).toUpperCase().split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > 13 && cur) {
        lines.push(cur);
        cur = w;
      } else cur = (cur + ' ' + w).trim();
    }
    if (cur) lines.push(cur);
    const zoom = Math.min(1, p.t * 2.5);
    lines.forEach((l, i) => {
      const s = 2;
      const w = textWidth(l, s);
      const yy = 40 + i * 14 - (lines.length - 1) * 7;
      pixelText(x, l, 80 - w / 2, yy + (1 - zoom) * 20, '#ffd84a', s, '#9c2537');
    });
    pixelText(x, String(p.tape.year), 80 - textWidth(String(p.tape.year)) / 2, 88, '#fff4dc');
  }

  private adCard(p: PicState): void {
    const x = this.ctx;
    const [head, sub, color] = p.ad ?? ['WATCH ACW', 'SATURDAYS', '#3f74d8'];
    x.fillStyle = color;
    x.fillRect(0, 0, PW, PH);
    x.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 10; i++) x.fillRect(0, i * 12 + ((p.clock * 10) % 12), PW, 5);
    const w = textWidth(head, 2);
    pixelText(x, head, 80 - w / 2, 42, '#fff4dc', 2, '#1e1426');
    pixelText(x, sub, 80 - textWidth(sub) / 2, 66, '#fff4dc', 1, '#1e1426');
    if (Math.floor(p.clock * 2) % 2) pixelText(x, 'CALL NOW!', 80 - textWidth('CALL NOW!') / 2, 84, '#ffd84a', 1, '#1e1426');
  }

  // ------------------------------------------------------------ effects

  /** Fill with static. */
  snow(amount: number): void {
    const img = this.ctx.getImageData(0, 0, PW, PH);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = Math.random() * 255 * amount;
      d[i] = d[i + 1] = d[i + 2] = n;
      d[i + 3] = 255;
    }
    this.ctx.putImageData(img, 0, 0);
    this.avg = [110, 110, 120];
  }

  private measure(): void {
    const d = this.ctx.getImageData(0, 0, PW, PH).data;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < d.length; i += 64) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 64;
    this.avg = [r / n, g / n, b / n];
  }

  /** The VHS pass: chroma bleed, luma noise, dropouts, era grading. */
  private vhs(tape: TapeDef, dist: number, clock: number, dark: boolean): void {
    const img = this.ctx.getImageData(0, 0, PW, PH);
    const d = img.data;
    const gen = tape.gen;
    const bw = tape.tint === 'bw' || tape.year < 1962;
    const warm = tape.tint === 'warm' || (tape.year < 1980 && !bw);
    let sat = bw ? 0 : tape.year < 1980 ? 0.72 : tape.year < 1990 ? 0.95 : 0.9;
    sat *= 1 - dist * 0.6;
    const noise = 7 + gen * 5 + dist * 26;
    const bleed = 2 + gen;
    let ar = 0;
    let ag = 0;
    let ab = 0;
    const Y = this.y;
    const U = this.u;
    const V = this.v;
    const dropRow = Math.random() < 0.1 + gen * 0.04 + dist * 0.3 ? Math.floor(Math.random() * PH) : -1;
    for (let y = 0; y < PH; y++) {
      const o = y * PW * 4;
      for (let x = 0; x < PW; x++) {
        const i = o + x * 4;
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const yy = 0.299 * r + 0.587 * g + 0.114 * b;
        Y[x] = yy;
        U[x] = b - yy;
        V[x] = r - yy;
      }
      // Chroma smears to the right (cheap running average).
      let su = 0;
      let sv = 0;
      const lineN = (Math.random() - 0.5) * noise * 0.5;
      for (let x = 0; x < PW; x++) {
        su += U[x];
        sv += V[x];
        if (x >= bleed) {
          su -= U[x - bleed];
          sv -= V[x - bleed];
        }
        const uu = (su / bleed) * sat;
        const vv = (sv / bleed) * sat;
        let yy = Y[x] + (Math.random() - 0.5) * noise + lineN;
        if (y === dropRow && x > 20 && x < 20 + 40 + gen * 10) yy = 235;
        if (y >= PH - 3) yy = yy * 0.6 + Math.random() * 90; // head-switching noise
        let r = yy + vv;
        let b = yy + uu;
        let g = (yy - 0.299 * r - 0.114 * b) / 0.587;
        if (warm) {
          r = r * 1.06 + 6;
          b = b * 0.88;
          g = g * 0.98 + 2;
        }
        if (bw) {
          r = yy * 0.98;
          g = yy;
          b = yy * 1.06 + 4;
        }
        const i = o + x * 4;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        if ((x & 7) === 0 && (y & 7) === 0) {
          ar += r;
          ag += g;
          ab += b;
        }
      }
    }
    void clock;
    void dark;
    this.ctx.putImageData(img, 0, 0);
    const n = (PW / 8) * (PH / 8);
    this.avg = [ar / n, ag / n, ab / n];
  }
}

function drawLine(x: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 0; s <= steps; s++) x.fillRect(Math.round(x0 + ((x1 - x0) * s) / steps), Math.round(y0 + ((y1 - y0) * s) / steps), 1, 1);
}

interface Choreo {
  ax: number;
  ay: number;
  aPose: Pose;
  aFace: 'left' | 'right';
  bx: number;
  by: number;
  bPose: Pose;
  bFace: 'left' | 'right';
  refX: number;
  refPose: Pose;
  aFirst: boolean;
}

/** Where the two wrestlers are and what they're doing, t seconds into a spot. Loops. */
export function choreo(spot: Spot, t: number): Choreo {
  const c: Choreo = { ax: 62, ay: FLOOR, aPose: 'idle', aFace: 'right', bx: 98, by: FLOOR, bPose: 'idle', bFace: 'left', refX: 124, refPose: 'idle', aFirst: false };
  const cyc = (len: number) => t % len;
  switch (spot) {
    case 'strike': {
      const k = cyc(2.4);
      c.ax = 66 + Math.min(1, k * 2) * 14;
      const hit = Math.floor(k * 3) % 2 === 1;
      c.aPose = hit ? 'strike' : 'idle';
      c.bPose = hit ? 'stagger' : 'sell';
      c.bx = 98 + (hit ? 2 : 0);
      break;
    }
    case 'kick': {
      const k = cyc(2.6);
      c.aPose = k > 0.8 && k < 1.3 ? 'kick' : 'idle';
      c.bPose = k > 1.0 ? (k < 2.0 ? 'down' : 'stagger') : 'idle';
      c.bx = k > 1.0 && k < 2.0 ? 104 : 96;
      break;
    }
    case 'slam':
    case 'suplex':
    case 'lift': {
      const k = cyc(3);
      if (k < 0.8) {
        c.ax = 74;
        c.bx = 86;
        c.aPose = 'grapple';
        c.bPose = 'grapple';
      } else if (k < 1.7) {
        c.ax = 78;
        c.bx = 78;
        c.by = FLOOR - 26 - Math.sin(((k - 0.8) / 0.9) * Math.PI) * 6;
        c.aPose = 'lift';
        c.bPose = 'lifted';
        c.aFirst = true;
      } else {
        c.ax = 70;
        c.bx = 92;
        c.aPose = k < 2.3 ? 'grapple' : 'taunt';
        c.bPose = 'down';
      }
      break;
    }
    case 'spin': {
      const a = t * 9;
      c.ax = 80;
      c.bx = 80 + Math.cos(a) * 18;
      c.by = FLOOR - 4 + Math.sin(a) * 3;
      c.aPose = 'grapple';
      c.bPose = 'lifted';
      c.bFace = Math.cos(a) > 0 ? 'left' : 'right';
      c.aFace = Math.cos(a) > 0 ? 'right' : 'left';
      c.aFirst = Math.sin(a) < 0;
      break;
    }
    case 'aerial':
    case 'dive': {
      const k = cyc(3.2);
      c.bx = 96;
      c.bPose = 'down';
      if (k < 0.9) {
        c.ax = 34;
        c.ay = FLOOR - 12;
        c.aPose = 'climb';
      } else if (k < 1.5) {
        c.ax = 30;
        c.ay = FLOOR - 26;
        c.aPose = 'perch';
      } else if (k < 2.2) {
        const f = (k - 1.5) / 0.7;
        c.ax = 30 + f * 62;
        c.ay = FLOOR - 26 - Math.sin(f * Math.PI) * 18 + f * 22;
        c.aPose = 'aerial';
        c.aFirst = false;
      } else {
        c.ax = 92;
        c.aPose = 'pin';
        c.ay = FLOOR - 2;
      }
      break;
    }
    case 'hold':
    case 'mask': {
      c.ax = 84;
      c.bx = 90;
      c.aPose = 'hold';
      c.bPose = 'held';
      c.aFirst = true;
      if (spot === 'mask') c.aPose = Math.floor(t * 3) % 2 ? 'grapple' : 'hold';
      break;
    }
    case 'pin': {
      const k = cyc(3.6);
      c.bx = 86;
      c.bPose = 'pinned';
      c.ax = 84;
      c.ay = FLOOR - 3;
      c.aPose = 'pin';
      c.aFirst = true;
      c.refX = 104;
      c.refPose = Math.floor(k * 1.6) % 2 === 1 ? 'down' : 'idle';
      break;
    }
    case 'taunt':
    case 'sell':
    case 'song':
    case 'promo':
    case 'entrance': {
      c.ax = 72;
      c.aPose = Math.floor(t * 1.4) % 2 ? 'taunt' : 'celebrate';
      c.bPose = spot === 'sell' ? 'down' : 'idle';
      if (spot === 'song') {
        c.ax = 80;
        c.bx = 116;
        c.aPose = Math.floor(t * 1.2) % 2 ? 'wave' : 'idle';
      }
      break;
    }
    case 'table': {
      const k = cyc(3);
      c.ax = 66;
      c.bx = 94;
      c.aPose = k > 2 ? 'lift' : 'grapple';
      c.bPose = k > 2 ? 'down' : 'grapple';
      break;
    }
    case 'ladder': {
      const k = cyc(3);
      c.ax = 81;
      c.ay = FLOOR - Math.min(1, k / 2) * 34;
      c.aPose = 'climb';
      c.bx = 110;
      c.bPose = 'sell';
      c.aFirst = true;
      break;
    }
    case 'box': {
      c.ax = 54 + Math.sin(t) * 4;
      c.bx = 106 - Math.sin(t) * 4;
      break;
    }
    case 'porch-light': {
      const k = cyc(5);
      c.ax = 82;
      c.ay = FLOOR + Math.max(0, 1 - k) * 18;
      c.aPose = k < 1.6 ? 'fireup' : k < 3.2 ? 'lift' : 'pin';
      c.bx = k < 1.6 ? 104 : 84;
      c.by = k >= 1.6 && k < 3.2 ? FLOOR - 26 : FLOOR;
      c.bPose = k < 1.6 ? 'stagger' : k < 3.2 ? 'lifted' : 'pinned';
      c.aFirst = k >= 1.6 && k < 3.2;
      break;
    }
    case 'teardown': {
      const k = cyc(4);
      c.ax = 70;
      c.bx = 92;
      c.aPose = k < 1 ? 'sit' : k < 2 ? 'grapple' : k < 3 ? 'pin' : 'celebrate';
      c.bPose = k < 1 ? 'idle' : k < 3 ? 'grapple' : 'celebrate';
      break;
    }
    case 'broken-belt': {
      const k = cyc(4);
      c.ax = 70;
      c.aPose = k < 2.6 ? 'taunt' : 'strike';
      c.bx = 92;
      c.bPose = k < 2.6 ? 'stagger' : 'down';
      c.refX = 112;
      break;
    }
    case 'mud':
    case 'snow':
    case 'lights-out':
    case 'crowd':
    default: {
      const k = cyc(2.8);
      c.aPose = k < 1.4 ? 'strike' : 'grapple';
      c.bPose = k < 1.4 ? 'stagger' : 'grapple';
      c.ax = 70 + Math.sin(t * 2) * 6;
      c.bx = 94 + Math.sin(t * 2) * 6;
    }
  }
  return c;
}
