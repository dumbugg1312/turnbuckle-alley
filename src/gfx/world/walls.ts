/**
 * Interior wall terrains (Golden Hour Storybook). Every wall id is solid.
 *
 * A wall tile works out its role from its neighbours:
 *  - "face" tiles have floor somewhere below them (within 4 tiles). They draw
 *    the wall's front: wallpaper / boards / brick, a crown molding on the top
 *    row, and a chair rail, wainscot and baseboard on the bottom row.
 *  - "cap" tiles (no floor below: side walls, the bottom wall, thick walls)
 *    draw the top of the wall seen from above, a dark frame around the room.
 *
 * Patterns are computed in (wrapped) world pixels so they run seamlessly
 * across tiles; every tile is cached as a 16x16 canvas.
 *
 * Shadows onto the floor: the ground is pre-rendered row by row, so the floor
 * tile below a wall is drawn after it and would cover anything painted there.
 * Wall tiles therefore queue their floor shadow in a microtask that runs right
 * after the synchronous ground pass, on the same canvas and transform.
 */
import { registerTerrain } from '../../world/registry';
import type { NeighborFn, TerrainId } from '../../world/types';
import { AK, type Color, dth, GP, hash2, HL, liA, mkSpr, P, R, shA, toCanvas, VL } from '../kit';

type Edge = 'none' | 'open' | 'void' | 'cap';
type Side = 'wall' | 'open' | 'void';

interface FaceInfo {
  row: number;
  crown: boolean;
  L: Edge;
  Rt: Edge;
  X0: number;
  Y0: number;
  seed: number;
}

interface Style {
  id: TerrainId;
  seed: number;
  /** Main wall material at a wrapped world pixel. */
  paper: (X: number, Y: number, v: number) => Color;
  /** Bottom-row overlay (chair rail, wainscot, baseboard); j is the row in the tile. */
  lower: (X: number, j: number, v: number) => Color | null;
  /** Top-row overlay (wall top + crown molding), rows 0..crownH-1. */
  crown: (X: number, j: number, v: number) => Color | null;
  crownH: number;
  /** Wall-top colours: base, lit lip, dark lip. */
  cap: [Color, Color, Color];
  /** Texture on the wall top. */
  capTex?: (X: number, Y: number, v: number, base: Color) => Color | null;
  /** Vertical corner trim: lit, dark. */
  trim: [Color, Color];
  deco?: (f: FaceInfo) => void;
}

const isWall = (id: TerrainId) => id.startsWith('wall');
const mod = (a: number, m: number) => ((a % m) + m) % m;

/** Rows of wall below this one before the floor (0 = bottom row of a face), or -1 for caps / non-walls. */
function faceRow(n: NeighborFn, dx: number, dy: number): number {
  if (!isWall(n(dx, dy))) return -1;
  for (let k = 1; k <= 4; k++) {
    const id = n(dx, dy + k);
    if (!isWall(id)) return id === 'void' ? -1 : k - 1;
  }
  return -1;
}

function faceEdge(n: NeighborFn, dx: number): Edge {
  const id = n(dx, 0);
  if (id === 'void') return 'void';
  if (!isWall(id)) return 'open';
  return faceRow(n, dx, 0) >= 0 ? 'none' : 'cap';
}

function capSide(n: NeighborFn, dx: number, dy: number): Side {
  const id = n(dx, dy);
  if (id === 'void') return 'void';
  return isWall(id) ? 'wall' : 'open';
}

// ---------------------------------------------------------------- caching + deferred shadows

const cache = new Map<string, HTMLCanvasElement>();
function tile(key: string, fn: () => void, w = 16, h = 16): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) {
    c = toCanvas(mkSpr(w, h, fn));
    cache.set(key, c);
  }
  return c;
}

/** Plum shadow pixel with alpha (buffers are ABGR). */
const SH = (a: number) => ((a << 24) | (0x40 << 16) | (0x21 << 8) | 0x2b) >>> 0;

const shadowBelow = () =>
  tile(
    'wall-shadow-below',
    () => {
      const rows: [number, number][] = [
        [150, 16],
        [118, 16],
        [96, 13],
        [80, 8],
        [66, 3],
      ];
      rows.forEach(([a, lvl], j) => {
        for (let i = 0; i < 16; i++) if (dth(i, j, lvl)) P(i, j, SH(a));
      });
    },
    16,
    5,
  );
const shadowRight = () =>
  tile(
    'wall-shadow-right',
    () => {
      const cols: [number, number][] = [
        [130, 16],
        [100, 13],
        [80, 7],
        [64, 3],
      ];
      cols.forEach(([a, lvl], i) => {
        for (let j = 0; j < 16; j++) if (dth(i, j, lvl)) P(i, j, SH(a));
      });
    },
    4,
    16,
  );

let pending: (() => void)[] = [];
function later(ctx: CanvasRenderingContext2D, fn: (c: CanvasRenderingContext2D) => void): void {
  const m = ctx.getTransform();
  pending.push(() => {
    ctx.save();
    ctx.setTransform(m);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    fn(ctx);
    ctx.restore();
  });
  if (pending.length === 1)
    queueMicrotask(() => {
      const list = pending;
      pending = [];
      for (const f of list) f();
    });
}

// ---------------------------------------------------------------- tile painters

function paintFace(st: Style, f: FaceInfo): void {
  const { X0, Y0, row, crown } = f;
  for (let j = 0; j < 16; j++)
    for (let i = 0; i < 16; i++) {
      const X = X0 + i;
      const Y = Y0 + j;
      const v = hash2(X, Y, st.seed);
      let c: Color = st.paper(X, Y, v);
      if (row === 0) {
        const lo = st.lower(X, j, v);
        if (lo != null) c = lo;
      }
      if (crown) {
        if (j < st.crownH) {
          const cr = st.crown(X, j, v);
          if (cr != null) c = cr;
        } else if (j === st.crownH) c = shA(c, 0.2);
        else if (j === st.crownH + 1 && dth(i, j, 9)) c = shA(c, 0.12);
        else if (j === st.crownH + 2 && dth(i, j, 3)) c = shA(c, 0.08);
      }
      P(i, j, c);
    }
  st.deco?.(f);
  const top = crown ? 2 : 0;
  // left end of the wall
  if (f.L === 'open' || f.L === 'void') {
    VL(0, 0, 15, f.L === 'void' ? AK : st.cap[0]);
    VL(1, top, 15, st.trim[0]);
  } else if (f.L === 'cap') {
    for (let j = 0; j < 16; j++) {
      P(0, j, shA(GP(0, j), 0.26));
      P(1, j, shA(GP(1, j), 0.14));
      if (dth(2, j, 6)) P(2, j, shA(GP(2, j), 0.08));
    }
  }
  // right end (away from the light)
  if (f.Rt === 'open' || f.Rt === 'void') {
    VL(15, 0, 15, f.Rt === 'void' ? AK : st.cap[2]);
    VL(14, top, 15, st.trim[1]);
  } else if (f.Rt === 'cap') {
    for (let j = 0; j < 16; j++) {
      P(15, j, shA(GP(15, j), 0.3));
      P(14, j, shA(GP(14, j), 0.16));
    }
  }
}

function paintCap(st: Style, X0: number, Y0: number, up: Side, down: Side, left: Side, right: Side): void {
  const [base, lit, dark] = st.cap;
  for (let j = 0; j < 16; j++)
    for (let i = 0; i < 16; i++) {
      const X = X0 + i;
      const Y = Y0 + j;
      const v = hash2(X, Y, st.seed + 7);
      let c: Color = base;
      const t = st.capTex?.(X, Y, v, base);
      if (t != null) c = t;
      else if (v < 0.035) c = shA(base, 0.12);
      else if (v > 0.975) c = liA(base, 0.1);
      P(i, j, c);
    }
  // lips where the wall top meets the room
  if (up === 'open') {
    HL(0, 15, 0, lit);
    HL(0, 15, 1, liA(base, 0.08));
  } else if (up === 'void') HL(0, 15, 0, AK);
  if (left === 'open') {
    VL(0, 0, 15, lit);
  } else if (left === 'void') VL(0, 0, 15, AK);
  if (right === 'open') {
    VL(15, 0, 15, dark);
    VL(14, 0, 15, shA(base, 0.12));
  } else if (right === 'void') VL(15, 0, 15, AK);
  if (down === 'open') {
    // the end of a wall run: show a sliver of its face + baseboard
    HL(0, 15, 9, lit);
    for (let j = 10; j < 16; j++)
      for (let i = 0; i < 16; i++) {
        const X = X0 + i;
        const v = hash2(X, Y0 + j, st.seed);
        let c: Color = st.paper(X, Y0 + j, v);
        if (j >= 13) c = st.lower(X, j, v) ?? c;
        if (j === 10) c = shA(c, 0.2);
        P(i, j, c);
      }
    if (left !== 'wall') VL(0, 9, 15, left === 'void' ? AK : base);
    if (right !== 'wall') VL(15, 9, 15, right === 'void' ? AK : dark);
  } else if (down === 'void') HL(0, 15, 15, AK);
}

function makeDraw(st: Style) {
  return (ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, n: NeighborFn) => {
    const sx = mod(tx, 8);
    const sy = mod(ty, 4);
    const row = faceRow(n, 0, 0);
    if (row >= 0) {
      const f: FaceInfo = { row, crown: faceRow(n, 0, -1) < 0, L: faceEdge(n, -1), Rt: faceEdge(n, 1), X0: sx * 16, Y0: sy * 16, seed: (Math.floor(hash2(tx, ty, 91) * 4) & 3) };
      const key = `${st.id}|f${row}${f.crown ? 'c' : ''}${f.L}${f.Rt}|${sx},${sy},${f.seed}`;
      ctx.drawImage(tile(key, () => paintFace(st, f)), x, y);
      if (row === 0) later(ctx, (c) => c.drawImage(shadowBelow(), x, y + 16));
    } else {
      const up = capSide(n, 0, -1);
      const down = capSide(n, 0, 1);
      const left = capSide(n, -1, 0);
      const right = capSide(n, 1, 0);
      const key = `${st.id}|c${up}${down}${left}${right}|${sx},${sy}`;
      ctx.drawImage(tile(key, () => paintCap(st, sx * 16, sy * 16, up, down, left, right)), x, y);
      if (right === 'open') later(ctx, (c) => c.drawImage(shadowRight(), x + 16, y));
      if (down === 'open') later(ctx, (c) => c.drawImage(shadowBelow(), x, y + 16));
    }
  };
}

// ---------------------------------------------------------------- styles

/** Tiny 4-petal motif test: returns 0 none, 1 petal, 2 centre, 3 leaf. */
function sprig(X: number, Y: number, cx: number, cy: number, per = 16): number {
  const dx = mod(X, per) - cx;
  const dy = mod(Y, per) - cy;
  const d = Math.abs(dx) + Math.abs(dy);
  if (d === 0) return 2;
  if (d === 1) return 1;
  if ((dx === 2 && dy === 1) || (dx === -2 && dy === 1)) return 3;
  return 0;
}

/** Raised panel wainscot rows 6..12 (16 px panels). */
function panel(X: number, j: number, v: number, c: { base: Color; lit: Color; dark: Color; groove: Color; frame: Color; under: Color }): Color {
  const xm = mod(X, 16);
  if (j === 6) return c.under;
  if (xm === 0) return c.groove;
  if (xm >= 2 && xm <= 14 && j >= 7 && j <= 11) {
    if (j === 7 || xm === 2) return c.lit;
    if (j === 11 || xm === 14) return c.dark;
    return v < 0.05 ? shA(c.base, 0.06) : c.base;
  }
  if (xm === 1) return liA(c.frame, 0.2);
  return c.frame;
}

const CREAM: Style = {
  id: 'wall',
  seed: 11,
  paper: (X, Y, v) => {
    const a = sprig(X, Y, 4, 4);
    const b = sprig(X, Y, 12, 12);
    const s = a || b;
    if (s === 2) return '#d9967c';
    if (s === 1) return '#ecc29c';
    if (s === 3) return '#b8c48e';
    if (mod(X, 8) === 0) return '#ead3ab';
    if (v < 0.04) return '#ecd7b2';
    if (v > 0.98) return '#f9edd2';
    return '#f3e2c0';
  },
  lower: (X, j, v) => {
    if (j <= 2) return null;
    if (j === 3) return '#fff6e2';
    if (j === 4) return '#e9d2a8';
    if (j === 5) return '#b8967a';
    if (j <= 12) return panel(X, j, v, { base: '#7cb4a2', lit: '#a8d4be', dark: '#4f8584', groove: '#3f6a70', frame: '#69a194', under: '#4f8784' });
    if (j === 13) return '#fff0d6';
    if (j === 14) return '#e4cba5';
    return '#9c7a6c';
  },
  crown: (X, j) => {
    if (j === 0) return '#6a4a58';
    if (j === 1) return '#4e3448';
    if (j === 2) return '#fff4dc';
    if (j === 3) return mod(X, 4) === 0 ? '#d2b08a' : '#eed7ae';
    return '#c8a482';
  },
  crownH: 5,
  cap: ['#5e4252', '#86636e', '#3e2a40'],
  trim: ['#fff4dc', '#c8a482'],
};

const WOOD: Style = {
  id: 'wall-wood',
  seed: 23,
  paper: (X, Y, v) => {
    const xm = mod(X, 8);
    const board = Math.floor(X / 8);
    const tone = hash2(board, 3, 23);
    const base = tone < 0.33 ? '#a86c46' : tone < 0.66 ? '#b0744a' : '#9e6442';
    if (xm === 0) return '#5e3a36';
    if (xm === 1) return '#c8925e';
    if (xm === 7) return '#7e4c3a';
    // grain streaks run down the board
    const g = hash2(X, Math.floor(Y / 3), 24);
    if (g < 0.09) return shA(base, 0.14);
    if (g > 0.95) return liA(base, 0.14);
    // a knot now and then
    const kn = hash2(board, Math.floor(Y / 16), 25);
    if (kn < 0.1) {
      const kx = 2 + Math.floor(kn * 40);
      const ky = 4 + (Math.floor(kn * 400) % 8);
      const dx = xm - kx;
      const dy = mod(Y, 16) - ky;
      const e = (dx * dx) / 1.4 + (dy * dy) / 3.4;
      if (e <= 1) return dx === 0 && Math.abs(dy) <= 1 ? '#5a3434' : dy < 0 && dx < 0 ? liA(base, 0.12) : '#7a4a38';
    }
    return v < 0.03 ? shA(base, 0.08) : base;
  },
  lower: (X, j, v) => {
    if (j <= 2) return null;
    if (j === 3) return '#e0aa70';
    if (j === 4) return '#a86a44';
    if (j === 5) return '#6a4034';
    if (j <= 12) {
      // horizontal plank wainscot, darker walnut
      if (j === 6) return '#4e3034';
      if (j === 9) return '#5e3a36';
      if (j === 7 || j === 10) return '#9a6248';
      const base = '#84523e';
      if (mod(X + (j > 9 ? 7 : 0), 24) === 0) return '#5e3a36';
      return v < 0.07 ? shA(base, 0.12) : base;
    }
    if (j === 13) return '#c48a5a';
    if (j === 14) return '#7a4a38';
    return '#4a2c38';
  },
  crown: (X, j) => {
    if (j === 0) return '#5a3640';
    if (j === 1) return '#3e2636';
    if (j === 2) return '#e0aa70';
    if (j === 3) return mod(X, 6) === 0 ? '#8a5640' : '#b07448';
    return '#7a4a38';
  },
  crownH: 5,
  cap: ['#4f3238', '#74504a', '#33202e'],
  capTex: (_X, Y, v, base) => (mod(Y, 5) === 0 ? shA(base, 0.18) : v < 0.06 ? liA(base, 0.08) : null),
  trim: ['#d29a66', '#6a4034'],
};

function brickColor(X: number, Y: number, v: number, seed: number): Color {
  const row = Y >> 2;
  const yr = Y & 3;
  const off = row & 1 ? 4 : 0;
  const bx = (X + off) >> 3;
  const xr = (X + off) & 7;
  if (yr === 3 || xr === 7) return v < 0.2 ? '#c49e8a' : '#d6b6a0';
  const r = hash2(bx, row, seed);
  let c: Color = r < 0.14 ? '#94403f' : r < 0.34 ? '#c05c4a' : r > 0.92 ? '#d27a5c' : r > 0.86 ? '#a8584e' : '#b24f46';
  if (yr === 0 || xr === 0) c = liA(c, 0.14);
  else if (yr === 2 && xr === 6) c = shA(c, 0.16);
  if (v < 0.07) c = shA(c, 0.12);
  // the odd chipped corner
  if (r > 0.97 && xr >= 5 && yr === 0) c = '#d6b6a0';
  return c;
}

const BRICK: Style = {
  id: 'wall-brick',
  seed: 37,
  paper: (X, Y, v) => brickColor(X, Y, v, 37),
  lower: (X, j, v) => {
    if (j < 10) return null;
    if (j === 10 || j === 11) return dth(X, j, j === 10 ? 4 : 9) ? shA(brickColor(X, j + 48, v, 37), 0.16) : null;
    if (j === 12) return '#d6c4bc';
    if (j === 15) return '#6e5a6a';
    return v < 0.1 ? '#968490' : v > 0.93 ? '#bcaab0' : '#a8969e';
  },
  crown: (X, j) => {
    if (j === 0) return '#3a2f48';
    if (j === 1) return '#2b2440';
    if (j === 2) return '#9a9ab8';
    if (j === 3) return mod(X, 8) === 4 ? '#d8d8ec' : '#74749a';
    return '#504c70';
  },
  crownH: 5,
  cap: ['#583440', '#7e4e52', '#38222e'],
  capTex: (X, Y, v, base) => ((Y & 3) === 3 || ((X + ((Y >> 2) & 1 ? 4 : 0)) & 7) === 7 ? shA(base, 0.2) : v < 0.08 ? liA(base, 0.08) : null),
  trim: ['#d6b6a0', '#7a3c42'],
};

const PANEL: Style = {
  id: 'wall-panel',
  seed: 41,
  paper: (X, Y, v) => {
    const row = Y >> 3;
    const yr = Y & 7;
    const off = row & 1 ? 8 : 0;
    const xr = (X + off) & 15;
    if (yr === 7 || xr === 15) return '#2c3350';
    let c: Color = '#3f4d6e';
    if (yr === 0) c = '#55638a';
    else if (xr === 0) c = '#4b5980';
    else if (yr === 6) c = '#36425f';
    if (v < 0.05) c = '#46557a';
    else if (v > 0.985) c = '#303b58';
    return c;
  },
  lower: (_X, j, v) => {
    if (j <= 1) return null;
    if (j === 2) return '#c88a2a';
    if (j === 3) return '#f4b63f';
    if (j === 4) return '#ee6a5a';
    if (j === 5 || j === 6) return v < 0.04 ? '#c83a46' : '#d8434b';
    if (j === 7) return '#a7384c';
    if (j === 8) return '#f4b63f';
    if (j === 9) return '#8a6a3a';
    if (j <= 12) return null;
    if (j === 13) return '#4a4462';
    if (j === 14) return '#342e4a';
    return AK;
  },
  crown: (X, j) => {
    if (j === 0) return '#262a40';
    if (j === 1) return '#1f2236';
    if (j === 2) return '#7a84a2';
    if (j === 3) return '#566082';
    // conduit pipe with brackets
    const br = mod(X, 32);
    if (j === 4) return br < 2 ? '#3a3f58' : '#d8dcf0';
    if (j === 5) return br < 2 ? '#3a3f58' : '#9aa2c8';
    return br < 2 ? '#2a2e44' : '#5a6290';
  },
  crownH: 7,
  cap: ['#2c3046', '#4a5070', '#1e2034'],
  capTex: (X, Y, v, base) => ((Y & 7) === 7 || ((X + ((Y >> 3) & 1 ? 8 : 0)) & 15) === 15 ? shA(base, 0.2) : v < 0.06 ? liA(base, 0.1) : null),
  trim: ['#6a7698', '#262a40'],
};

const PINK: Style = {
  id: 'wall-pink',
  seed: 53,
  paper: (X, Y, v) => {
    const xm = mod(X, 8);
    const a = sprig(X, Y, 4, 5);
    const b = sprig(X, Y, 12, 13);
    const s = a || b;
    if (s === 2) return '#c8406a';
    if (s === 1) return '#e8789a';
    if (s === 3) return '#7aa078';
    if (xm === 0 || xm === 1) return v < 0.05 ? '#f6cccc' : '#fadada';
    if (xm === 2) return '#eaa4b0';
    if (v < 0.04) return '#f0b0bc';
    return '#f4bac4';
  },
  lower: (X, j, v) => {
    if (j <= 2) return null;
    if (j === 3) return '#fff6ee';
    if (j === 4) return '#f0d4d2';
    if (j === 5) return '#c08c98';
    if (j <= 12) {
      if (j === 6) return '#d6aab2';
      return mod(X, 3) === 0 ? '#e6c2c4' : v < 0.04 ? '#f4dcd8' : '#fbe9e4';
    }
    if (j === 13) return '#fff4ee';
    if (j === 14) return '#ebc8ca';
    return '#a07080';
  },
  crown: (X, j) => {
    if (j === 0) return '#7a4466';
    if (j === 1) return '#5e3452';
    if (j === 2) return '#fff6ee';
    if (j === 3) return '#f4dad6';
    const xm = mod(X, 4);
    return xm === 1 || xm === 2 ? '#e8c4c4' : null;
  },
  crownH: 5,
  cap: ['#6a3a58', '#94607c', '#46263e'],
  trim: ['#fff6ee', '#c08c98'],
};

const BLUE: Style = {
  id: 'wall-blue',
  seed: 67,
  paper: (X, Y, v) => {
    const a = sprig(X, Y, 4, 5);
    const b = sprig(X, Y, 12, 13);
    const s = a || b;
    if (s === 2) return '#ee98a6';
    if (s === 1) return '#f6ecd8';
    if (s === 3) return '#6f9a8a';
    if (mod(X + Y, 4) === 0 && v < 0.45) return '#8a9fc8';
    if (v > 0.97) return '#a2b4d8';
    return '#93a8cf';
  },
  lower: (X, j, v) => {
    if (j <= 2) return null;
    if (j === 3) return '#c89060';
    if (j === 4) return '#8e5a42';
    if (j === 5) return '#5a3a48';
    if (j <= 12) {
      if (j === 6) return '#c8b89a';
      return mod(X, 3) === 0 ? '#d8c6a4' : v < 0.05 ? '#ece0c6' : '#f4e8d0';
    }
    if (j === 13) return '#fff4dc';
    if (j === 14) return '#e0d0b0';
    return '#8a7a7e';
  },
  crown: (X, j) => {
    if (j === 0) return '#43426a';
    if (j === 1) return '#33325a';
    if (j === 2) return '#f6ecd8';
    if (j === 3) return mod(X, 3) === 0 ? '#c4b8a6' : '#e8dcc4';
    return '#9a96b0';
  },
  crownH: 5,
  cap: ['#3e3e62', '#62648a', '#2a2a48'],
  trim: ['#f6ecd8', '#6a7aa8'],
};

function stoneTone(X: number, Y: number, seed: number): { tone: Color; xr: number; yr: number; bx: number; row: number } {
  const row = Y >> 3;
  const yr = Y & 7;
  const off = row & 1 ? 8 : 3;
  const bx = (X + off) >> 4;
  const xr = (X + off) & 15;
  const r = hash2(bx, row, seed);
  const tone = r < 0.25 ? '#5a5670' : r < 0.5 ? '#625c78' : r < 0.75 ? '#524e68' : '#6a6680';
  return { tone, xr, yr, bx, row };
}

const DUNGEON: Style = {
  id: 'wall-dungeon',
  seed: 79,
  paper: (X, Y, v) => {
    const s = stoneTone(X, Y, 79);
    const { xr, yr } = s;
    if (yr === 7 || xr === 15) {
      // mortar, with moss creeping along it
      return hash2(X >> 1, Y, 80) < 0.3 ? (v < 0.5 ? '#4e7a52' : '#3e6248') : '#2e2a40';
    }
    if ((xr === 0 || xr === 14) && (yr === 0 || yr === 6)) return '#3a3550';
    let c: Color = s.tone;
    if (yr === 0) c = hash2(X, Y, 81) < 0.35 ? '#6f9a5a' : liA(s.tone, 0.16);
    else if (xr === 0) c = liA(s.tone, 0.08);
    else if (yr === 6) c = shA(s.tone, 0.22);
    // hairline crack on some stones
    const cr = hash2(s.bx, s.row, 82);
    if (cr < 0.22 && yr > 0 && yr < 6 && xr === 4 + Math.floor(cr * 30) % 8 + (yr >> 1)) c = '#3a3550';
    if (v < 0.06) c = shA(c, 0.12);
    else if (v > 0.97) c = liA(c, 0.1);
    return c;
  },
  lower: (X, j, v) => {
    if (j < 11) return null;
    if (j === 15) return v < 0.3 ? '#2e5a4a' : '#24323a';
    // moss rising from the damp floor
    const m = hash2(X, j, 83);
    if (m < (j - 10) * 0.16) return m < 0.08 ? '#7aa860' : '#4e7a52';
    return null;
  },
  crown: (X, j, v) => {
    if (j === 0) return '#1e1a28';
    if (j === 1) return '#2a2636';
    if (j === 2) return v < 0.18 ? '#4e4a62' : '#7a7690';
    if (j === 3) return hash2(X, 3, 84) < 0.45 ? '#6f9a5a' : '#5a5670';
    return hash2(X, 4, 84) < 0.25 ? '#4e7a52' : null;
  },
  crownH: 5,
  cap: ['#2a2734', '#45405a', '#1a1824'],
  capTex: (X, Y, v, base) => {
    const m = hash2(X >> 2, Y >> 2, 85);
    if (m < 0.16 && hash2(X >> 1, Y >> 1, 89) < 0.7) return v < 0.4 ? '#34503e' : '#3e6248';
    if (((Y & 7) === 7 || ((X + ((Y >> 3) & 1 ? 8 : 3)) & 15) === 15)) return shA(base, 0.25);
    return null;
  },
  trim: ['#7a7690', '#2e2a40'],
  deco: (f) => {
    const k = hash2(f.X0, f.Y0 + f.seed, 86);
    // moss drips hanging from the top lip
    if (f.crown) {
      for (let i = 1; i < 15; i++) {
        const d = hash2(f.X0 + i, f.Y0, 87);
        if (d < 0.22) {
          const len = 1 + Math.floor(d * 18);
          VL(i, 5, 5 + len, '#4e7a52');
          P(i, 5 + len, d < 0.06 ? '#9dffc8' : '#6f9a5a');
        }
      }
      // cobwebs in the corners where the wall ends
      const web = (cx: number, dir: number) => {
        const W1 = '#c8c4dc';
        const W2 = '#9a96b4';
        for (let t = 0; t < 7; t++) {
          P(cx + dir * t, 2, W2);
          P(cx, 2 + t, W2);
          if (t < 5) P(cx + dir * t, 2 + t, W1);
        }
        // sagging threads between the spokes
        for (const [a, b] of [[3, 1], [1, 3], [5, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 5]] as [number, number][]) P(cx + dir * a, 2 + b, W1);
      };
      if (f.L !== 'none') web(1, 1);
      if (f.Rt !== 'none') web(14, -1);
    }
    // a faintly glowing crack (the Dungeon is alive)
    if (k < 0.2 && !f.crown) {
      let x = 3 + Math.floor(k * 40);
      for (let y = 3; y < 12; y++) {
        P(x, y, '#2e4a40');
        if (y > 4 && y < 10) P(x, y, '#8dffc0');
        x += hash2(x, y, 88) < 0.5 ? 1 : 0;
      }
    }
    // a little glowing mushroom at the foot of the wall
    if (f.row === 0 && k > 0.6 && k < 0.85) {
      const mx = 2 + Math.floor((k - 0.6) * 44);
      VL(mx + 1, 12, 14, '#d8d0c0');
      HL(mx, mx + 2, 11, '#7fe8a8');
      P(mx + 1, 10, '#c8ffe0');
    }
    // a grinning skull mortared into the wall (spooky, but friendly)
    if (f.row === 1 && k > 0.94) {
      const sx = 5;
      const sy = 4;
      R(sx, sy, 5, 4, '#e8e0cc');
      R(sx + 1, sy + 4, 3, 2, '#d8ceb8');
      P(sx + 1, sy + 2, AK);
      P(sx + 3, sy + 2, AK);
      P(sx + 2, sy + 4, '#8a8070');
      P(sx + 4, sy + 1, '#fff8e8');
    }
  },
};

for (const st of [CREAM, WOOD, BRICK, PANEL, PINK, BLUE, DUNGEON]) registerTerrain(st.id, { solid: true, step: 'hard', draw: makeDraw(st) });
