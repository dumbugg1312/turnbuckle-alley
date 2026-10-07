import { ctx2d, makeCanvas, rect, shade } from '../gfx/draw';
import type { Look } from '../gfx/look';
import { defaultLook } from '../gfx/look';
import type { CardDef, CardType } from './types';
import { wrestlerSprite, type WPose } from './wrestler-art';

/** Colors per card type: frame, deep, light. */
export const TYPE_COLORS: Record<CardType, [string, string, string]> = {
  strike: ['#d8434b', '#8c1f33', '#ffb3a8'],
  grapple: ['#3f74d8', '#1f3d8c', '#b3d0ff'],
  aerial: ['#29a8c9', '#14607a', '#b8f0ff'],
  submission: ['#8a4fc2', '#4a2378', '#e0c4ff'],
  sell: ['#e8a33a', '#9a5a14', '#ffe2a8'],
  taunt: ['#ff5d8f', '#a62d58', '#ffc4d6'],
  setup: ['#5c9a6e', '#2e5a3c', '#c8f0d0'],
  signature: ['#f4b63f', '#a36a10', '#fff0b8'],
  finisher: ['#ff7a3c', '#a3281a', '#fff0a0'],
  special: ['#f07a3a', '#9a3a14', '#ffd4a8'],
  power: ['#6a5ad8', '#2e2478', '#d0c8ff'],
};

export const TYPE_LABEL: Record<CardType, string> = {
  strike: 'Strike', grapple: 'Grapple', aerial: 'Aerial', submission: 'Hold', sell: 'Sell', taunt: 'Showmanship',
  setup: 'Setup', signature: 'Signature', finisher: 'Finisher', special: 'Moment', power: 'Style',
};

const cache = new Map<string, HTMLCanvasElement>();
const INK = '#1e1426';
const W = 72;
const H = 44;
const MAT = 38; // y of the mat line the figures stand on

/** The two little wrestlers every card shows: a red-singlet hero and a dark heavy. */
const ME: Look = { ...defaultLook(), body: 'athletic', top: 'singlet', topColor: '#d8434b', topAccent: '#fbf0d9', bottom: 'trunks', bottomColor: '#2b2140', shoes: 'wrestling-boots', shoesColor: '#f2f2f2', hair: 'mullet', hairColor: '#a0622f', extras: [{ id: 'kneepads', color: '#f2f2f2' }] };
const THEM: Look = { ...defaultLook(), body: 'heavy', height: 2, skin: '#8d5233', hair: 'bald', facial: 'beard', hairColor: '#1c1418', top: 'singlet', topColor: '#3a3448', topAccent: '#8a8aa0', bottom: 'tights', bottomColor: '#3a3448', shoes: 'wrestling-boots', shoesColor: '#2b2140', extras: [] };

function fig(x: CanvasRenderingContext2D, look: Look, px: number, py: number, pose: WPose, facing: 'left' | 'right', frame = 0): void {
  const s = wrestlerSprite(look, { pose, frame, facing, scale: 0.5 });
  x.drawImage(s.canvas, Math.round(px) - s.ax, Math.round(py) - s.ay);
}

function starburst(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string, c2 = '#ffffff'): void {
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const len = i % 2 ? r : r * 0.6;
    for (let k = 1; k <= len; k++) rect(x, cx + Math.cos(a) * k, cy + Math.sin(a) * k, 1, 1, k > len * 0.6 ? c2 : c);
  }
  rect(x, cx - 1, cy - 1, 3, 3, c2);
}

function speedLines(x: CanvasRenderingContext2D, x0: number, y0: number, dx: number, dy: number, n: number, c: string): void {
  for (let i = 0; i < n; i++) {
    const ox = x0 + (i - n / 2) * 2 * dy;
    const oy = y0 + (i - n / 2) * 2 * -dx;
    for (let k = 0; k < 5 + (i % 3) * 2; k++) rect(x, ox - dx * k, oy - dy * k, 1, 1, c);
  }
}

function sparkles(x: CanvasRenderingContext2D, seed: number, n: number, c: string): void {
  for (let i = 0; i < n; i++) {
    const px = ((seed * 37 + i * 53) % (W - 8)) + 4;
    const py = ((seed * 11 + i * 29) % 24) + 3;
    rect(x, px - 1, py, 3, 1, c);
    rect(x, px, py - 1, 1, 3, c);
  }
}

/** Backdrop: crowd dots, spotlight, posts, ropes and the mat. */
function ring(x: CanvasRenderingContext2D, frame: string, deep: string, light: string, spot = false): void {
  // sky of the card: dark top, type-colored glow at the bottom
  for (let y = 0; y < H; y++) {
    const t = y / H;
    rect(x, 0, y, W, 1, t < 0.5 ? shade(deep, -0.35 + t * 0.4) : shade(frame, -0.1 + (t - 0.5) * 0.3));
  }
  // crowd heads as dots
  for (let i = 0; i < 40; i++) {
    const px = (i * 7 + ((i * 13) % 5)) % W;
    const py = 3 + ((i * 5) % 9);
    rect(x, px, py, 2, 2, shade(deep, (i % 3) * 0.12 - 0.1));
    rect(x, px, py + 2, 2, 2, shade(light, -0.5 + (i % 4) * 0.05));
  }
  if (spot) {
    x.save();
    x.globalAlpha = 0.3;
    x.fillStyle = '#fff6d0';
    x.beginPath();
    x.moveTo(W / 2 - 4, 0);
    x.lineTo(W / 2 + 4, 0);
    x.lineTo(W / 2 + 22, MAT + 4);
    x.lineTo(W / 2 - 22, MAT + 4);
    x.fill();
    x.restore();
  }
  // mat
  for (let y = MAT - 8; y < H; y++) rect(x, 0, y, W, 1, y === MAT - 8 ? '#a89cbd' : (y + 0) % 5 === 0 ? '#c4bad2' : '#cbc1d8');
  rect(x, 0, H - 3, W, 3, '#3a3478');
  rect(x, 0, H - 3, W, 1, '#f2eef8');
  // ropes
  const ropes = ['#e8404e', '#f6f0f4', '#4a6ad0'];
  ropes.forEach((c, i) => {
    const y = MAT - 10 - i * 6;
    rect(x, 2, y, W - 4, 1, c);
    rect(x, 2, y + 1, W - 4, 1, shade(c, -0.3));
  });
  // posts
  for (const px of [2, W - 4]) {
    rect(x, px, MAT - 26, 2, 20, '#9aa2c8');
    rect(x, px, MAT - 26, 1, 20, '#d8dcf0');
    ropes.forEach((_c, i) => rect(x, px - 1, MAT - 11 - i * 6, 4, 3, i === 1 ? '#ffd050' : '#d8404e'));
  }
  void light;
}

/** Card illustration (72x44 native pixels): a little scene with the two wrestlers. */
export function cardArt(c: CardDef): HTMLCanvasElement {
  const key = c.id;
  const hit = cache.get(key);
  if (hit) return hit;
  const can = makeCanvas(W, H);
  const x = ctx2d(can);
  const [frame, deep, light] = TYPE_COLORS[c.type];
  const anim = c.anim ?? c.type;
  const seed = [...c.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const spot = anim === 'taunt' || anim === 'fireup' || anim === 'finisher' || anim === 'celebrate';
  ring(x, frame, deep, light, spot);
  const burst = '#fff4a0';
  switch (anim) {
    case 'strike':
      fig(x, THEM, 50, MAT, 'stagger', 'left');
      fig(x, ME, 28, MAT, 'strike', 'right', 1);
      starburst(x, 44, MAT - 20, 5, burst);
      break;
    case 'kick':
      fig(x, THEM, 52, MAT, 'stagger', 'left');
      fig(x, ME, 26, MAT, 'kick', 'right', 1);
      starburst(x, 46, MAT - 18, 5, burst);
      break;
    case 'slam':
    case 'bomb':
      fig(x, THEM, 38, MAT - 18, 'lifted', 'left');
      fig(x, ME, 36, MAT, 'lift', 'right');
      speedLines(x, 56, MAT - 24, 0, -1, 3, '#ffffff');
      break;
    case 'suplex':
      fig(x, THEM, 24, MAT - 14, 'lifted', 'right');
      fig(x, ME, 40, MAT, 'lift', 'left');
      for (let i = 0; i < 10; i++) rect(x, 44 + Math.round(Math.cos(i * 0.3) * 14), MAT - 28 + Math.round(Math.sin(i * 0.3) * 10), 1, 1, '#ffffff');
      break;
    case 'lift':
      fig(x, THEM, 38, MAT - 24, 'lifted', 'left');
      fig(x, ME, 36, MAT, 'lift', 'right');
      sparkles(x, seed, 4, '#fff4a0');
      break;
    case 'spin':
      fig(x, THEM, 44, MAT - 10, 'lifted', 'left');
      fig(x, ME, 34, MAT, 'lift', 'right');
      for (let i = 0; i < 14; i++) rect(x, 36 + Math.round(Math.cos(i / 2.2) * 18), MAT - 12 + Math.round(Math.sin(i / 2.2) * 5), 1, 1, '#ffffff');
      break;
    case 'aerial':
    case 'dive':
      fig(x, THEM, 52, MAT, 'down', 'left');
      fig(x, ME, 30, MAT - 16, 'aerial', 'right');
      speedLines(x, 18, MAT - 22, 1, 0.3, 3, '#ffffff');
      break;
    case 'drop':
      fig(x, THEM, 40, MAT, 'down', 'left');
      fig(x, ME, 38, MAT - 12, 'aerial', 'right');
      speedLines(x, 38, MAT - 26, 0, 1, 3, '#ffffff');
      break;
    case 'hold':
      fig(x, THEM, 46, MAT, 'held', 'left');
      fig(x, ME, 30, MAT, 'hold', 'right');
      starburst(x, 56, MAT - 16, 3, '#ff9ec0');
      break;
    case 'pin':
      fig(x, THEM, 38, MAT, 'pinned', 'left');
      fig(x, ME, 36, MAT + 1, 'pin', 'right');
      rect(x, 50, MAT - 22, 1, 5, '#ffffff');
      rect(x, 49, MAT - 21, 1, 1, '#ffffff');
      break;
    case 'taunt':
      fig(x, ME, 36, MAT, 'taunt', 'right');
      sparkles(x, seed, 5, '#ffffff');
      break;
    case 'fireup':
      fig(x, ME, 36, MAT, 'fireup', 'right');
      for (let i = 0; i < 12; i++) rect(x, 26 + ((i * 7) % 20), MAT - 30 - ((i * 5) % 12), 1, 2, i % 2 ? '#ff7a3c' : '#f4b63f');
      sparkles(x, seed, 3, '#fff4a0');
      break;
    case 'sell':
      fig(x, ME, 36, MAT, 'sell', 'right');
      starburst(x, 44, MAT - 30, 4, burst);
      rect(x, 50, MAT - 34, 1, 1, burst);
      rect(x, 28, MAT - 32, 1, 1, burst);
      break;
    case 'climb':
      fig(x, ME, 60, MAT - 18, 'climb', 'right', 0);
      sparkles(x, seed, 3, '#ffffff');
      break;
    case 'grapple':
      fig(x, THEM, 46, MAT, 'grapple', 'left');
      fig(x, ME, 28, MAT, 'grapple', 'right');
      break;
    case 'finisher':
      fig(x, THEM, 38, MAT - 22, 'lifted', 'left');
      fig(x, ME, 36, MAT, 'lift', 'right');
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        for (let k = 14; k < 20; k++) rect(x, 36 + Math.round(Math.cos(a) * k), MAT - 18 + Math.round(Math.sin(a) * k * 0.6), 1, 1, k % 2 ? '#fff4a0' : '#ffffff');
      }
      break;
    default:
      fig(x, ME, 36, MAT, 'idle', 'right');
      if (c.type === 'setup') fig(x, THEM, 54, MAT, 'stagger', 'left');
  }
  // Frame
  rect(x, 0, 0, W, 1, deep);
  rect(x, 0, H - 1, W, 1, INK);
  cache.set(key, can);
  return can;
}
