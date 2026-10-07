/**
 * Inside the coach: the window wall (curtain, luggage rack, gasket, sill),
 * the seat in front with its tray (gas-station coffee and a candy bar), and
 * the player from behind, looking out. Built per screen size at double
 * density; the light pass in bus.ts tints these live.
 */
import { circ, col, dense, ell, FX, FY, hash2, L as line, mkSpr, P1, poly, R, RR, toCanvas, type Paint, type Spr } from '../../gfx/kit';
import { FT, T } from '../../gfx/font';
import type { Look } from '../../gfx/look';
import { fn01, grainV, liA, mixc, over, rgba, shA, tooth, vgrad } from './paint';

export interface Layout {
  w: number;
  h: number;
  /** Window opening. */
  wl: number;
  wt: number;
  wr: number;
  wb: number;
  ww: number;
  wh: number;
  /** Corner radius of the window. */
  rad: number;
  /** Horizon, in screen y. */
  yh: number;
  /** Size unit (1 at 216 px tall). */
  u: number;
  head: { x: number; y: number; r: number };
  seat: { x0: number; y0: number };
  tray: { x0: number; x1: number; y: number };
  cup: { x: number; y: number };
}

export function layout(w: number, h: number): Layout {
  const u = Math.max(1, Math.min(1.7, Math.min(h / 216, w / 384)));
  const portrait = h > w * 1.1;
  const side = Math.round(Math.max(14, w * 0.055));
  let wt = Math.round(Math.max(22 * u, h * 0.12));
  let wb = Math.round(h * 0.74);
  if (portrait) {
    const wh = Math.min(wb - wt, Math.round(w * 1.05));
    wt = Math.round(h * 0.42 - wh / 2);
    wb = wt + wh;
  }
  const wl = side + Math.round(10 * u); // room for the curtain
  const wr = w - side;
  const ww = wr - wl;
  const wh = wb - wt;
  const yh = Math.round(wt + wh * (portrait ? 0.56 : 0.5));
  const r = Math.round(24 * u);
  const head = { x: Math.round(wl + Math.min(ww * 0.26, 110 * u)), y: Math.round(wb - r * 0.12), r };
  const seat = { x0: Math.round(wl + ww * 0.66), y0: Math.round(wb - 15 * u) };
  const tray = { x0: seat.x0 - Math.round(10 * u), x1: Math.round(seat.x0 + (w - seat.x0) * 0.66), y: Math.round(wb + 27 * u) };
  const cup = { x: tray.x0 + Math.round(16 * u), y: tray.y };
  return { w, h, wl, wt, wr, wb, ww, wh, rad: Math.round(7 * u), yh, u, head, seat, tray, cup };
}

/** Is (x, y) inside the rounded window opening? */
function inWindow(L: Layout, x: number, y: number): boolean {
  if (x < L.wl || x >= L.wr || y < L.wt || y >= L.wb) return false;
  const r = L.rad;
  const cx = x < L.wl + r ? L.wl + r : x > L.wr - r ? L.wr - r : x;
  const cy = y < L.wt + r ? L.wt + r : y > L.wb - r ? L.wb - r : y;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

const WALL = '#a69cae';
const WALL_D = '#857b94';
const RUBBER = '#3a3048';
const MOQ = '#3f3a6c';

/** Paint: 90s coach moquette, deep indigo weave with confetti squiggles. */
const CONFETTI = ['#3fb8a8', '#e05a86', '#f0c050', '#9a86e8'];
const MOTIFS: [number, number][][] = [
  // an S squiggle, a little triangle, a dot pair, a zig
  [[0, 2], [1, 1], [2, 1], [3, 2], [4, 3], [5, 3], [6, 2]],
  [[2, 0], [1, 1], [3, 1], [0, 2], [4, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3]],
  [[1, 1], [2, 1], [1, 2], [2, 2], [5, 4], [5, 5]],
  [[0, 3], [1, 2], [2, 1], [3, 2], [4, 3], [5, 2], [6, 1]],
];
function moquette(base: string = MOQ): Paint {
  const b = col(base);
  const lo = shA(base, 0.14);
  const hi = liA(base, 0.07);
  return () => {
    const C = 14;
    const cx = Math.floor(FX / C);
    const cy = Math.floor(FY / C);
    const h = hash2(cx, cy, 99);
    const ox = Math.floor(hash2(cx, cy, 98) * 6);
    const oy = Math.floor(hash2(cx, cy, 97) * 6);
    const lx = FX - cx * C - ox;
    const ly = FY - cy * C - oy;
    if (h < 0.8) {
      const m = MOTIFS[Math.floor(h * 5) % 4];
      for (const [mx, my] of m) if (mx === lx && my === ly) return CONFETTI[Math.floor(hash2(cx, cy, 96) * 4)];
    }
    // woven tooth: alternating fine rows and the odd slub
    if ((FX + FY) % 4 === 0) return lo;
    const n = hash2(FX, FY, 7);
    return n < 0.06 ? lo : n > 0.96 ? hi : b;
  };
}

/** A padded seat back: moquette with piping, edge shading and stitched seams. */
function cushion(x: number, y: number, w: number, h: number, r: number): void {
  RR(x, y, w, h, 4, MOQ);
  R(x, y, w, h, (_x, _y, o) => (o ? (moquette() as (x: number, y: number, o: number) => number)(0, 0, o) : null));
  // form: rounded edges fall into shade, the top swells into the light
  R(x, y, w, h, (_x, _y, o) => {
    if (!o) return null;
    const px = FX / 2;
    const py = FY / 2;
    const ex = Math.min(px - x, x + w - px);
    const ey = py - y;
    if (ex < 3 * r) return shA(o, (1 - ex / (3 * r)) * 0.4);
    if (ey < 4 * r) return liA(o, (1 - ey / (4 * r)) * 0.12);
    return null;
  });
  // piping along the top and a stitched seam
  R(x + 2, y + 0.5, w - 4, 1, '#5a5490');
  R(x + 2, y + 0.5, w - 4, 0.5, '#8a84c0');
  R(x + 2, y + 1.5, w - 4, 0.5, '#24203f');
  for (let sx = x + w * 0.5; sx < x + w * 0.5 + 0.5; sx += 1) for (let yy = y + 3; yy < y + h; yy += 1.5) P1(sx, yy, '#2a2650');
}

export interface Interior {
  frame: HTMLCanvasElement;
  fg: HTMLCanvasElement;
  glass: HTMLCanvasElement;
  mask: HTMLCanvasElement;
  rim: HTMLCanvasElement;
}

export function buildInterior(L: Layout, look: Look): Interior {
  return dense(2, () => {
    const frame = toCanvas(mkSpr(L.w, L.h, () => paintFrame(L)));
    const fgS = mkSpr(L.w, L.h, () => paintForeground(L, look));
    const fg = toCanvas(fgS);
    const glass = toCanvas(mkSpr(L.w, L.h, () => paintGlass(L)));
    const rim = toCanvas(rimOf(fgS, L));
    const mask = document.createElement('canvas');
    mask.width = frame.width;
    mask.height = frame.height;
    const mx = mask.getContext('2d')!;
    mx.drawImage(frame, 0, 0, frame.width, frame.height);
    mx.drawImage(fg, 0, 0, fg.width, fg.height);
    (mask as unknown as { __k: number }).__k = 2;
    return { frame, fg, glass, mask, rim };
  });
}

// ---------------------------------------------------------------- the wall
function paintFrame(L: Layout): void {
  const { w, h, wl, wt, wr, wb, u } = L;
  // the wall panels, with a soft ramp darker toward the floor
  R(0, 0, w, h, (x, y) => (inWindow(L, x, y) ? null : 0x01));
  R(0, 0, w, h, (_x, _y, o) => {
    if (!o) return null;
    const y = FY / 2;
    const base = y < wt ? mixc(WALL, WALL_D, 0.35) : y > wb ? mixc(WALL, WALL_D, Math.min(1, (y - wb) / (h - wb + 1)) * 0.7) : WALL;
    const n = fn01(1);
    return n < 0.05 ? shA(base, 0.06) : base;
  });
  // vertical panel seams
  for (const sx of [Math.round(wl * 0.45), wr + Math.round((w - wr) * 0.55)]) {
    R(sx, 0, 0.5, h, (_x, _y, o) => (o ? shA(o, 0.25) : null));
    R(sx + 0.5, 0, 0.5, h, (_x, _y, o) => (o ? liA(o, 0.15) : null));
  }
  // the luggage rack: shelf underside, lip and two chrome rails
  const rackY = Math.round(wt * 0.42);
  R(0, 0, w, rackY, vgrad(0, rackY, ['#6e6480', '#8a7e98']));
  R(0, rackY, w, 2 * u, '#5a506c');
  R(0, rackY, w, 0.5, '#bdb2c8');
  for (const ry of [rackY + 3 * u, rackY + 6 * u]) {
    R(0, ry, w, 1.5, '#c8c4d8');
    R(0, ry, w, 0.5, '#f4f2ff');
    R(0, ry + 1, w, 0.5, '#6a6680');
  }
  for (let x = 20; x < w; x += 60) {
    R(x, rackY, 1.5, 7 * u, '#9a96b0');
    R(x, rackY, 0.5, 7 * u, '#e8e6f4');
  }
  // things on the rack: a dented suitcase and a paper sack
  const sx0 = Math.round(w * 0.58);
  RR(sx0, rackY - 13 * u, 34 * u, 13 * u, 2, '#8a5a4e');
  R(sx0, rackY - 13 * u, 34 * u, 1, '#b07a64');
  R(sx0 + 3, rackY - 13 * u, 1, 13 * u, '#6a4040');
  R(sx0 + 34 * u - 4, rackY - 13 * u, 1, 13 * u, '#6a4040');
  R(sx0 + 14 * u, rackY - 15 * u, 7 * u, 2, '#4a3a40');
  RR(sx0 + 38 * u, rackY - 10 * u, 14 * u, 10 * u, 1, '#c8a878');
  R(sx0 + 38 * u, rackY - 10 * u, 14 * u, 1.5, '#a88858');
  // reading light pod
  const lx = Math.round(wl + L.ww * 0.3);
  RR(lx, rackY - 6, 14, 5, 1, '#8a8098');
  circ(lx + 4, rackY - 3.5, 1.5, '#f6e6a8');
  circ(lx + 10, rackY - 3.5, 1.5, '#5a5070');
  // the window gasket (rubber), a lit inner lip and a shadowed outer one
  R(wl - 4, wt - 4, L.ww + 8, L.wh + 8, (x, y, o) => {
    if (!o) return null;
    const fx = FX / 2;
    const fyy = FY / 2;
    let d = 99;
    for (let k = 0.5; k <= 3; k += 0.5) {
      if (inWindow(L, fx + k, fyy) || inWindow(L, fx - k, fyy) || inWindow(L, fx, fyy + k) || inWindow(L, fx, fyy - k)) {
        d = k;
        break;
      }
    }
    void x;
    void y;
    if (d <= 2) return d <= 0.5 ? '#5a5070' : RUBBER;
    if (d <= 3) return shA(o, 0.3);
    return null;
  });
  // the sill: a molded ledge with a highlight and a heater grille below
  R(wl - 6, wb + 3, L.ww + 12, 4 * u, '#b8aec0');
  R(wl - 6, wb + 3, L.ww + 12, 0.5, '#e8e0ee');
  R(wl - 6, wb + 3 + 4 * u, L.ww + 12, 1, '#6a6080');
  for (let x = wl + 6; x < wr - 6; x += 2) R(x, wb + 10 * u, 0.5, 4 * u, '#6e6484');
  R(wl + 4, wb + 10 * u - 1, L.ww - 8, 0.5, '#c8bed0');
  // the left pillar: a tied-back curtain in faded mustard stripes
  const cw = Math.round(14 * u) + 4;
  const cx0 = wl - 6;
  const tieY = Math.round(wt + L.wh * 0.58);
  for (let y = wt - 6; y < wb + 4 * u; y += 0.5) {
    const above = y < tieY;
    const k = above ? Math.pow((tieY - y) / (tieY - wt + 6), 0.7) : Math.min(1, (y - tieY) / (12 * u));
    const width = above ? cw * (0.55 + k * 0.45) : cw * (0.55 + k * 0.3);
    R(cx0, y, width, 0.5, () => {
      const xx = (FX / 2 - cx0) / Math.max(1, width);
      const pleat = Math.sin(xx * Math.PI * 4.5);
      const stripe = Math.floor((FX / 2 - cx0) / 2.5) % 3;
      const base = ['#c8964a', '#d8b066', '#a8683e'][stripe];
      return pleat > 0.55 ? liA(base, 0.18) : pleat < -0.5 ? shA(base, 0.3) : base;
    });
    R(cx0 + width - 0.5, y, 0.5, 0.5, '#6a4038');
  }
  R(cx0 - 1, tieY - 1.5, cw * 0.6 + 2, 3, '#8a3a3a');
  R(cx0 - 1, tieY - 1.5, cw * 0.6 + 2, 0.5, '#c86a5a');
  R(cx0, wt - 7, cw + 2, 2, '#c8c4d8');
  // a curtain hem tassel
  for (let i = 0; i < 4; i++) R(cx0 + cw * 0.6 + 1 + i * 0.5, tieY + 1, 0.5, 3 + (i % 2), '#e8c070');
  // the right pillar: the emergency hammer in its little cradle
  const px = wr + Math.round((w - wr) * 0.3);
  const py = Math.round(wt + L.wh * 0.35);
  RR(px - 2, py - 1, 7, 12, 1, '#c8403c');
  R(px - 1.5, py - 0.5, 6, 0.5, '#f08a80');
  R(px + 1, py + 1, 1, 8, '#4a3a4a');
  R(px - 0.5, py + 1, 4, 2, '#5a5a6a');
  // the stop-request cord strung along above the windows, on little brackets
  const cordY = wt - 9;
  if (cordY > rackY + 8 * u) {
    for (let x = 0; x < w; x += 0.5) P1(x, cordY + Math.sin((x / 70) * Math.PI) * 0.6, '#e8c86a');
    for (let x = 0; x < w; x += 0.5) if (hash2(Math.floor(x * 2), 3, 1) < 0.3) P1(x, cordY + 0.5 + Math.sin((x / 70) * Math.PI) * 0.6, '#b08a40');
    for (let x = 35; x < w; x += 70) {
      R(x - 0.5, cordY - 3, 1, 3.5, '#8a8098');
      R(x - 1, cordY - 3.5, 2, 1, '#c8c0d4');
    }
    T('PULL CORD FOR STOP', wr - 74, cordY - 7, '#6a5e7e', FT, {});
  }
  // a no-smoking sticker on the left pillar and the window latch
  const nx = Math.round(wl * 0.45) - 6;
  const ny = Math.round(wt + L.wh * 0.2);
  circ(nx, ny, 4.5, '#f6f0e6');
  circ(nx, ny, 4, '#d8443c');
  circ(nx, ny, 3, '#f6f0e6');
  R(nx - 2, ny - 0.25, 3, 0.75, '#5a5060');
  R(nx + 1, ny - 0.25, 1, 0.75, '#e8a050');
  line(nx - 2, ny + 2, nx + 2, ny - 2, '#d8443c');
  RR(wl + L.ww * 0.5 - 6, wb + 0.5, 12, 3, 1, '#8a8098');
  R(wl + L.ww * 0.5 - 5, wb + 0.5, 10, 0.5, '#d8d0e0');
  // rivets along the lower wall seam
  for (let x = wl; x < wr; x += 18) {
    P1(x, wb + 17 * u, '#6e6484');
    P1(x + 0.5, wb + 17 * u - 0.5, '#c8bed0');
  }
  // shadow from the rack on the top of the window frame
  R(0, rackY + 2 * u, w, 4, over(0.15, 6));
}

// ---------------------------------------------------------------- the glass
function paintGlass(L: Layout): void {
  const { wl, wt, wr, wb, u } = L;
  R(wl, wt, L.ww, L.wh, (x, y) => {
    if (!inWindow(L, FX / 2, FY / 2)) return null;
    void x;
    void y;
    const ex = Math.min(FX / 2 - wl, wr - FX / 2);
    const ey = Math.min(FY / 2 - wt, wb - FY / 2);
    const edge = Math.min(ex, ey * 1.4);
    // road grime creeping in from the frame
    if (edge < 6 && fn01(3) < (6 - edge) / 18) return rgba(fn01(4) < 0.5 ? '#6a5a5a' : '#8a7a70', 0.35);
    // the faint smudge where someone rested their forehead
    const sx = (FX / 2 - (L.head.x + 14 * u)) / (9 * u);
    const sy = (FY / 2 - (L.head.y - L.head.r * 1.5)) / (6 * u);
    if (sx * sx + sy * sy < 1 && fn01(5) < 0.35) return rgba('#e8e0f0', 0.08);
    return null;
  });
  // the emergency-exit decal on the glass, bottom right
  const dx = wr - 44 * u;
  const dy = wb - 9;
  R(dx, dy, 38, 6, rgba('#c8403c', 0.85));
  T('EMERGENCY EXIT', dx + 2, dy + 0.5, rgba('#fff4e8', 0.9), FT, {});
}

// ---------------------------------------------------------------- foreground
function paintForeground(L: Layout, look: Look): void {
  paintSeat(L);
  paintPlayer(L, look);
}

function paintSeat(L: Layout): void {
  const { w, h, u, seat, tray, cup } = L;
  const x0 = seat.x0;
  const y0 = seat.y0;
  const sw = w - x0 + 8;
  // the seat in front, seen from behind: a padded back with a cloth headrest cover
  cushion(x0, y0, sw, h - y0 + 4, u);
  const hw = Math.min(sw - 14, 46 * u);
  const hcx = x0 + 7 * u;
  RR(hcx, y0 + 3, hw, 13 * u, 3, '#efe8dc');
  R(hcx, y0 + 3, hw, 13 * u, (_x, _y, o) => (o ? (FY % 4 === 0 ? shA(o, 0.04) : null) : null));
  R(hcx, y0 + 3 + 13 * u - 1.5, hw, 1.5, '#c8bcb0');
  for (let x = hcx + 2; x < hcx + hw - 2; x += 1.5) P1(x, y0 + 3 + 13 * u - 2.5, '#d4c8bc');
  R(hcx, y0 + 3, 2, 13 * u, (_x, _y, o) => (o ? shA(o, 0.12) : null));
  T('ROUTE 9 LINES', hcx + 4, y0 + 3 + 4 * u, '#5a6aa8', FT, {});
  // chrome grab handle across the top
  const gw = Math.min(sw, 64 * u);
  R(x0 + 3, y0 - 3, 2.5, 5, '#a8a4bc');
  R(x0 + 3, y0 - 4, gw, 2, '#c8c4d8');
  R(x0 + 3, y0 - 4, gw, 0.5, '#ffffff');
  R(x0 + 3, y0 - 2.5, gw, 0.5, '#6a6680');
  // seat-back pocket with a folded route map
  const pky = tray.y + 9 * u;
  RR(x0 + 4, pky, sw - 6, Math.min(h - pky, 26 * u), 2, '#2c2850');
  R(x0 + 4, pky, sw - 6, 1, '#4a4680');
  R(x0 + 4, pky + 1, sw - 6, 0.5, '#1c1834');
  poly([[x0 + 12 * u, pky - 7 * u], [x0 + 30 * u, pky - 9 * u], [x0 + 32 * u, pky + 1], [x0 + 13 * u, pky + 1]], '#f2ead6');
  R(x0 + 14 * u, pky - 7 * u, 16 * u, 1.5, '#4a8ac8');
  line(x0 + 15 * u, pky - 3 * u, x0 + 29 * u, pky - 6 * u, '#c84a4a');
  line(x0 + 20 * u, pky - 1, x0 + 22 * u, pky - 7 * u, '#d8ccb0');
  // the fold-down tray, lowered toward you, a little scuffed
  const ty = tray.y;
  const td = 6 * u;
  poly([[tray.x0 + 5, ty - td], [tray.x1, ty - td], [tray.x1 + 2, ty], [tray.x0, ty]], '#a29ab0');
  R(tray.x0, ty - td, tray.x1 - tray.x0 + 2, td, (_x, _y, o) => (o && fn01(31) < 0.04 ? shA(o, 0.1) : null));
  R(tray.x0, ty, tray.x1 - tray.x0 + 2, 2.5 * u, '#6a6280');
  R(tray.x0, ty - 0.5, tray.x1 - tray.x0 + 2, 0.5, '#e0d8e8');
  R(tray.x0 + 5, ty - td, tray.x1 - tray.x0 - 5, 0.5, '#7a7290');
  ell((tray.x0 + tray.x1) / 2 + 10 * u, ty - td * 0.5, 4 * u, 1.5 * u, (_x, _y, o) => (o ? shA(o, 0.08) : null));
  // the candy bar, half gone, wrapper peeled back
  const bx = cup.x + 10 * u;
  poly([[bx, ty - 3.5 * u], [bx + 13 * u, ty - 4.5 * u], [bx + 14 * u, ty - 1.5], [bx + 1, ty - 1]], '#d8443c');
  R(bx + 1, ty - 3.5 * u, 13 * u, 0.5, '#f07a6a');
  T('CHMP', bx + 2.5, ty - 3.5 * u + 0.5, '#f6d34a', FT, {});
  poly([[bx + 13 * u, ty - 4.5 * u], [bx + 18 * u, ty - 5 * u], [bx + 18 * u, ty - 2], [bx + 14 * u, ty - 1.5]], '#7a4a3a');
  R(bx + 14 * u, ty - 4.5 * u, 4 * u, 0.5, '#a86a50');
  poly([[bx + 13 * u, ty - 4.5 * u], [bx + 15 * u, ty - 7 * u], [bx + 16 * u, ty - 6 * u], [bx + 14 * u, ty - 4]], '#c8c4d8');
  // the gas-station coffee: paper cup, kraft sleeve, white lid
  const ch = 17 * u;
  const cw0 = 5.5 * u;
  const cw1 = 4.2 * u;
  const cx = cup.x;
  for (let y = 0; y < ch; y += 0.5) {
    const half = cw1 + ((cw0 - cw1) * y) / ch;
    const yy = ty - 1.5 - y;
    R(cx - half, yy, half * 2, 0.5, () => {
      const xx = (FX / 2 - (cx - half)) / (half * 2);
      const sleeve = y > ch * 0.22 && y < ch * 0.6;
      const c = sleeve ? '#b88a5e' : '#f4eee6';
      if (sleeve && FY % 6 === 0) return shA(c, 0.15);
      return xx < 0.2 ? shA(c, 0.25) : xx > 0.78 ? liA(c, 0.25) : c;
    });
  }
  T('JOE', cx - 4, ty - 1.5 - ch * 0.52, '#6a3a2a', FT, {});
  RR(cx - cw0 - 0.5, ty - 2 - ch, (cw0 + 0.5) * 2, 2, 1, '#f8f4f0');
  RR(cx - cw0 + 1, ty - 3.5 - ch, cw0 * 2 - 2, 2, 1, '#e8e2dc');
  R(cx - cw0 + 1, ty - 3.5 - ch, cw0 * 2 - 2, 0.5, '#ffffff');
  R(cx + cw0 * 0.3, ty - 3.5 - ch, 1.5, 0.5, '#6a5a5a');
  // shadows on the tray
  R(cx - cw0, ty - 2, cw0 * 3.2, 1.5, rgba('#3a3050', 0.35));
}

// ---------------------------------------------------------------- the player
const SHORT = ['short', 'buzz', 'side-part', 'undercut', 'fauxhawk', 'spiky', 'mohawk', 'flattop', 'pompadour', 'wave', 'shaggy', 'mullet'];
const BUNS = ['bun', 'topknot', 'spacebuns', 'crown-braid'];
const MK_HAIR = 0xff01fefe;
const MK_JAC = 0xfffe01fe;
const MK_HOOD = 0xfffd01fd;

function paintPlayer(L: Layout, look: Look): void {
  const { x: hx, y: hy, r } = L.head;
  const u = L.u;
  const skinB = col(look.skin || '#e0a878');
  const skin = shA(skinB, 0.22);
  const skinD = shA(skinB, 0.42);
  const skinL = liA(shA(skinB, 0.08), 0.06);
  const top = look.topColor || '#3f9a92';
  const hc = look.hairColor || '#5a3a2a';
  const style = look.hair || 'short';
  const species = look.species ?? 'human';

  // ---- body: shoulders in a hoodie, the hood bunched behind the neck
  const bx = hx + r * 0.12;
  const by = hy + r * 2.75;
  ell(bx, by, r * 2.75, r * 1.6, MK_JAC);
  R(bx - r * 2.75, by, r * 5.5, L.h, MK_JAC);
  // neck
  R(hx - r * 0.36, hy + r * 0.3, r * 0.74, r * 1.3, skin);
  R(hx - r * 0.36, hy + r * 0.3, r * 0.22, r * 1.3, skinD);
  R(hx - r * 0.36, hy + r * 0.3, r * 0.74, r * 0.35, skinD);
  // hood
  ell(hx + r * 0.05, hy + r * 1.42, r * 1.25, r * 0.62, MK_HOOD);
  ell(hx + r * 0.05, hy + r * 1.25, r * 0.95, r * 0.3, MK_HOOD);
  shadeFabric(hx, hy, r, bx, by, top);
  // hood seam, shoulder seams and a few soft folds
  const seam = shA(top, 0.62);
  for (let i = 0; i < r * 1.1; i += 0.5) P1(hx + r * 0.05 + Math.sin(i * 0.2) * 0.3, hy + r * 1.0 + i * 0.55, seam);
  curveDots(hx - r * 0.95, hy + r * 1.55, hx - r * 2.3, hy + r * 2.5, -2.5 * u, seam);
  curveDots(hx + r * 1.15, hy + r * 1.55, hx + r * 2.5, hy + r * 2.5, -2.5 * u, seam);
  curveDots(hx - r * 1.6, hy + r * 2.9, hx - r * 0.5, hy + r * 3.4, 1.5 * u, shA(top, 0.5));
  curveDots(hx + r * 0.6, hy + r * 3.1, hx + r * 1.7, hy + r * 2.7, 1.5 * u, shA(top, 0.5));

  // ---- ears
  const big = style === 'afro' || style === 'curly';
  const covered = ['long', 'locs', 'bob', 'braids', 'pigtails', 'curtains', 'shaggy', 'ponybraid'].includes(style) || big;
  if (species === 'bear' || species === 'raccoon') {
    for (const sx of [-1, 1]) {
      circ(hx + sx * r * 0.68, hy - r * 0.82, r * 0.34, skin);
      circ(hx + sx * r * 0.68, hy - r * 0.82, r * 0.18, skinD);
    }
  } else if (!covered) {
    const er = r * 0.19;
    ell(hx - r * 0.92, hy + r * 0.08, er * 0.75, er * 1.25, skinD);
    ell(hx + r * 0.94, hy + r * 0.06, er, er * 1.35, skin);
    ell(hx + r * 0.9, hy + r * 0.1, er * 0.5, er * 0.9, skinD);
    R(hx + r * 0.94, hy - er * 1.2, er, 0.5, skinL);
  }
  // ---- head (the skull, a sliver of cheek: they're turned a touch toward the window)
  ell(hx, hy, r * 0.92, r, skin);
  ell(hx + r * 0.6, hy + r * 0.48, r * 0.32, r * 0.44, skin);
  ell(hx - r * 0.2, hy + r * 0.7, r * 0.5, r * 0.3, skinD);

  // ---- hair
  if (style === 'bald') {
    ell(hx + r * 0.25, hy - r * 0.55, r * 0.35, r * 0.2, skinL);
  } else if (style === 'buzz') {
    ell(hx, hy - r * 0.04, r * 0.95, r * 0.97, (_x, _y, o) => (o && FY / 2 < hy + r * 0.62 ? (hash2(FX, FY, 4) < 0.55 ? shA(hc, 0.25) : skin) : null));
  } else {
    hairMass(hx, hy, r, style, big);
    shadeHair(hx, hy, r, hc, big, style);
  }

  // ---- an earbud cable from the right ear down into the hood
  if (species === 'human') {
    let px = hx + r * 0.88;
    let py = hy + r * 0.3;
    for (let i = 0; i < r * 2.2; i++) {
      P1(px, py, '#efeaf6');
      px -= 0.1 + Math.sin(i * 0.12) * 0.12;
      py += 0.5;
    }
  }

  // ---- their own seat back across the bottom
  const sbY = Math.round(hy + r * 2.45);
  cushion(hx - r * 3.4, sbY, r * 7, L.h - sbY + 4, u);
  const gw = r * 6.2;
  R(hx - r * 3.1, sbY - 3, gw, 2, '#c8c4d8');
  R(hx - r * 3.1, sbY - 3, gw, 0.5, '#ffffff');
  R(hx - r * 3.1, sbY - 1.5, gw, 0.5, '#6a6680');
  for (const sx of [hx - r * 3.1, hx - r * 3.1 + gw - 2.5]) R(sx, sbY - 3, 2.5, 4, '#a8a4bc');
}

function curveDots(x0: number, y0: number, x1: number, y1: number, sag: number, c: number | string): void {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    P1(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + sag * 4 * t * (1 - t), c);
  }
}

/** Fabric: form-shade the hoodie markers, lit from the window (upper right). */
function shadeFabric(hx: number, hy: number, r: number, bx: number, by: number, top: string): void {
  const ramp = [shA(top, 0.66), shA(top, 0.5), shA(top, 0.36), shA(top, 0.22), mixc(shA(top, 0.08), '#ffd8a8', 0.12)];
  R(bx - r * 3, hy + r * 0.6, r * 6, r * 6, (_x, _y, o) => {
    if (o !== MK_JAC && o !== MK_HOOD) return null;
    const px = FX / 2;
    const py = FY / 2;
    let v: number;
    if (o === MK_HOOD) {
      const nx = (px - hx) / (r * 1.25);
      const ny = (py - (hy + r * 1.42)) / (r * 0.62);
      v = 0.15 + nx * 0.35 - ny * 0.4;
    } else {
      const nx = (px - bx) / (r * 2.75);
      const ny = (py - by) / (r * 1.6);
      v = nx * 0.55 - ny * 0.75 - 0.25;
      // the hood throws a soft shadow onto the back below it
      const sx = (px - hx) / (r * 1.3);
      const sy = (py - (hy + r * 1.95)) / (r * 0.45);
      if (sx * sx + sy * sy < 1) v -= 0.35;
    }
    v += (hash2(FX, FY, 12) - 0.5) * 0.12;
    const i = v < -0.55 ? 0 : v < -0.25 ? 1 : v < 0.05 ? 2 : v < 0.38 ? 3 : 4;
    return ramp[i];
  });
}

/** Fill the hair silhouette with the marker colour. */
function hairMass(hx: number, hy: number, r: number, style: string, big: boolean): void {
  const M = MK_HAIR;
  if (big) {
    const rx = style === 'afro' ? r * 1.45 : r * 1.16;
    const ry = style === 'afro' ? r * 1.32 : r * 1.1;
    const cy = hy - r * 0.16;
    ell(hx, cy, rx, ry, M);
    for (let a = 0; a < Math.PI * 2; a += 0.11) circ(hx + Math.cos(a) * rx * 0.97, cy + Math.sin(a) * ry * 0.97, r * (style === 'afro' ? 0.15 : 0.19), M);
    return;
  }
  const isShort = SHORT.includes(style);
  const nape = isShort ? hy + r * 0.66 : hy + r * 0.92;
  // the cap over the back of the head, with a ragged nape line
  ell(hx, hy - r * 0.06, r * 0.98, r * 1.02, (_x, _y, o) => (FY / 2 < nape - hash2(FX, 1, 2) * 1.2 ? M : o || null));
  if (style === 'mohawk' || style === 'fauxhawk' || style === 'undercut') {
    const keep = style === 'mohawk' ? 0.24 : 0.48;
    ell(hx, hy, r * 0.99, r * 1.03, (_x, _y, o) => (o === M && Math.abs(FX / 2 - hx) > r * keep && FY / 2 > hy - r * 0.55 ? (hash2(FX, FY, 3) < 0.5 ? 0xff3a2a3a : null) : null));
    if (style === 'mohawk') for (let i = -3; i <= 3; i++) poly([[hx - r * 0.22, hy - r * 0.55 + i * r * 0.16], [hx + i * 0.6, hy - r * 1.3 + Math.abs(i) * r * 0.09], [hx + r * 0.22, hy - r * 0.55 + i * r * 0.16]], M);
  }
  if (style === 'spiky')
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (1.05 + (i / 7) * 0.9);
      const bx2 = hx + Math.cos(a) * r * 0.86;
      const by2 = hy - r * 0.06 + Math.sin(a) * r * 0.96;
      poly([[bx2 - r * 0.2, by2 + r * 0.12], [bx2 + Math.cos(a) * r * 0.4, by2 + Math.sin(a) * r * 0.4], [bx2 + r * 0.2, by2 + r * 0.12]], M);
    }
  if (style === 'flattop') RR(hx - r * 0.84, hy - r * 1.3, r * 1.68, r * 0.55, 2, M);
  if (style === 'pompadour') ell(hx + r * 0.12, hy - r * 0.98, r * 0.82, r * 0.38, M);
  if (style === 'mullet' || style === 'shaggy' || style === 'wave' || style === 'side-part') {
    const len = style === 'mullet' ? r * 1.75 : style === 'shaggy' ? r * 1.15 : r * 0.78;
    R(hx - r * 0.72, hy + r * 0.3, r * 1.44, len - r * 0.3, M);
    for (let x = hx - r * 0.72; x < hx + r * 0.72; x += 0.5) R(x, hy + len, 0.5, 0.5 + hash2(Math.round(x * 2), 2, 3) * 3, M);
  }
  if (isShort || BUNS.includes(style)) {
    if (style === 'bun' || style === 'topknot') {
      const by2 = style === 'topknot' ? hy - r * 1.08 : hy - r * 0.5;
      circ(hx, by2, r * 0.44, M);
    }
    if (style === 'spacebuns') for (const sx of [-1, 1]) circ(hx + sx * r * 0.62, hy - r * 0.78, r * 0.38, M);
    return;
  }
  if (style === 'bob' || style === 'curtains') {
    RR(hx - r * 1.04, hy - r * 0.2, r * 2.08, r * 1.28, 4, M);
    return;
  }
  if (style === 'braids' || style === 'pigtails') {
    for (const sx of [-1, 1]) {
      const bx2 = hx + sx * r * 0.62;
      for (let y = hy + r * 0.62; y < hy + r * (style === 'braids' ? 3 : 2.3); y += r * 0.3) ell(bx2, y, r * 0.23, r * 0.18, M);
    }
    return;
  }
  if (style === 'ponytail' || style === 'highpony' || style === 'ponybraid') {
    const ty = style === 'highpony' ? hy - r * 0.55 : hy + r * 0.1;
    const len = r * (style === 'highpony' ? 2.5 : 2.2);
    for (let y = 0; y < len; y += 0.5) {
      const half = r * (0.3 - (y / len) * 0.17);
      const sway = Math.sin((y / len) * Math.PI) * r * 0.14;
      R(hx - half + sway, ty + r * 0.1 + y, half * 2, 0.5, M);
    }
    return;
  }
  // long / locs: down the back
  const len = r * 3;
  for (let y = hy; y < hy + len; y += 0.5) {
    const half = r * (0.96 + Math.min(0.25, (y - hy) / (len * 2)));
    R(hx - half, y, half * 2, 0.5, M);
  }
  for (let x = hx - r * 1.1; x < hx + r * 1.1; x += 0.5) R(x, hy + len, 0.5, 0.5 + hash2(Math.round(x * 2), 4, 5) * 3, M);
}

/**
 * Turn the hair marker into hair: strands fanning from the crown, form light
 * from the window (upper right), a soft sheen band and darker roots.
 */
function shadeHair(hx: number, hy: number, r: number, hc: string, big: boolean, style: string): void {
  const ramp = [shA(hc, 0.6), shA(hc, 0.44), shA(hc, 0.28), shA(hc, 0.12), mixc(liA(hc, 0.12), '#ffe0b0', 0.18)];
  const cx = hx + r * 0.06;
  const cy = hy - r * 0.48;
  const locs = style === 'locs' || style === 'braids' || style === 'pigtails' || style === 'ponybraid';
  R(hx - r * 1.8, hy - r * 1.8, r * 3.6, r * 5.2, (_x, _y, o) => {
    if (o !== MK_HAIR) return null;
    const px = FX / 2;
    const py = FY / 2;
    const dx = px - cx;
    const dy = py - cy;
    const d = Math.hypot(dx, dy);
    const onHead = big || py < hy + r * 0.85;
    const nx = (px - hx) / (big ? r * 1.4 : r);
    const ny = (py - hy) / (big ? r * 1.3 : r);
    // locks: wide clumps flowing out and down from the crown, broken into
    // short segments so it reads as hair rather than rays
    let clumpF: number;
    let along: number;
    if (big) {
      clumpF = (Math.atan2(dy, dx) + Math.PI) * r * 0.5;
      along = d / 2;
    } else if (onHead) {
      clumpF = (Math.atan2(dy, dx * 1.4) + Math.PI) * r * 0.3;
      along = d / 3.5;
    } else {
      clumpF = (px - hx) * (locs ? 0.45 : 0.7) + Math.sin(py * 0.15) * 0.8;
      along = py / 6;
    }
    const clump = Math.floor(clumpF);
    const seg = Math.floor(along + hash2(clump, 1, 9) * 3);
    const cOff = hash2(clump, seg, 7) - 0.5;
    const edge = clumpF - clump;
    let v = onHead ? nx * 0.45 - ny * 0.5 : nx * 0.35 - ((py - hy) / (r * 3)) * 0.5 + 0.1;
    v += cOff * (big ? 0.6 : 0.4) + (hash2(FX, FY, 3) - 0.5) * 0.12;
    if (edge < 0.18) v -= 0.22;
    // broken highlights on the lit locks
    if (v > 0.15 && hash2(clump, seg, 5) > 0.55 && edge > 0.35 && edge < 0.75) v += 0.3;
    // roots at the whorl sit in shadow
    if (onHead && !big && d < r * 0.14) v -= 0.35;
    const i = v < -0.5 ? 0 : v < -0.2 ? 1 : v < 0.12 ? 2 : v < 0.42 ? 3 : 4;
    return ramp[i];
  });
  // a whorl at the crown and a few flyaway strands against the light
  if (!big) for (let a = 0; a < 7; a += 0.45) P1(cx + Math.cos(a) * a * 0.32, cy + Math.sin(a) * a * 0.28, ramp[0]);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (1.15 + i * 0.09);
    const rr = big ? r * 1.4 : r * 1.0;
    const x0 = hx + Math.cos(a) * rr;
    const y0 = hy - r * 0.06 + Math.sin(a) * rr;
    for (let k = 0; k < 3; k++) P1(x0 + Math.cos(a) * k * 0.5 + k * 0.25, y0 + Math.sin(a) * k * 0.5, ramp[3]);
  }
  // hair ties on the gathered styles
  if (style === 'ponytail' || style === 'ponybraid') R(hx - r * 0.18, hy + r * 0.02, r * 0.36, r * 0.16, '#e8507a');
  if (style === 'highpony') R(hx - r * 0.18, hy - r * 0.62, r * 0.36, r * 0.16, '#e8507a');
  if (style === 'braids' || style === 'pigtails') for (const sx of [-1, 1]) R(hx + sx * r * 0.62 - r * 0.13, hy + r * 0.64, r * 0.26, r * 0.13, '#e8507a');
}

/**
 * Rim light mask: the fine pixels on the foreground's edges that face the
 * window (up and to the right strongest). White with alpha; tinted live.
 */
function rimOf(s: Spr, L: Layout): Spr {
  const out: Spr = { w: s.w, h: s.h, d: new Uint32Array(s.w * s.h), k: s.k };
  const wTop = Math.floor(L.wt * 2);
  const wBot = Math.floor((L.wb + 30 * L.u) * 2);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= s.w || y >= s.h ? 0 : s.d[y * s.w + x]);
  for (let y = Math.max(1, wTop); y < Math.min(s.h - 1, wBot); y++)
    for (let x = 1; x < s.w - 1; x++) {
      if (!at(x, y)) continue;
      let a = 0;
      if (!at(x, y - 1)) a = 1;
      else if (!at(x, y - 2) || !at(x + 1, y - 1)) a = 0.6;
      else if (!at(x + 1, y) || !at(x + 2, y)) a = 0.75;
      else if (!at(x - 1, y)) a = 0.35;
      if (a > 0) out.d[y * s.w + x] = ((Math.round(a * 255) << 24) | 0xffffff) >>> 0;
    }
  return out;
}

export { grainV, tooth };
