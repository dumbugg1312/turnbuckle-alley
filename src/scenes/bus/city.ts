/**
 * The city at dawn, in the rain: hazy far skyline, glass and stone towers,
 * brick walk-ups with fire escapes, the MaxxMedia billboard, sodium street
 * lamps and the last overpass. Cool, wet light from the left.
 */
import { AK, circ, col as colk, ell, FX, FY, hash2, L, P1, poly, R, RR, rng } from '../../gfx/kit';
import { FM, FT, T, TC, TW } from '../../gfx/font';
import { art, fdth, fn01, grainH, liA, mixc, over, rgba, shA, tint, tooth, vgrad } from './paint';

const LIT = ['#ffe3a0', '#f6c070', '#f2a862'];

/** Far skyline, hazy, tiles horizontally. */
export function farCity(): HTMLCanvasElement {
  const W = 520;
  const H = 70;
  return art('city-far', W, H, () => {
    const r = rng(77);
    for (const [shade, minH, maxH, gap] of [
      ['#8f8cab', 26, 62, 2],
      ['#77759a', 14, 44, 1],
    ] as [string, number, number, number][]) {
      let x = -4;
      while (x < W) {
        const bw = 9 + Math.floor(r() * 18);
        const bh = minH + Math.floor(r() * (maxH - minH));
        const top = H - bh;
        R(x, top, bw, bh, shade);
        R(x, top, 0.5, bh, liA(shade, 0.18));
        // the odd stepped crown or spire
        const k = r();
        if (k < 0.25) R(x + bw * 0.25, top - 4, bw * 0.5, 4, shade);
        else if (k < 0.4) R(x + bw / 2, top - 9, 0.5, 9, shade);
        // a handful of early-riser windows
        for (let wy = top + 3; wy < H - 2; wy += 2.5)
          for (let wx = x + 1.5; wx < x + bw - 1.5; wx += 2) if (r() < 0.035) R(wx, wy, 1, 1, mixc(LIT[0], shade, 0.35));
        x += bw + gap + Math.floor(r() * 3);
      }
    }
    // haze settles at the base
    R(0, H - 22, W, 22, (_x, _y, o) => (o && fdth(Math.round(((FYs() - (H - 22)) / 22) * 9)) ? mixc(o, '#ad9cb0', 0.5) : null));
  });
}
// FY in world pixels for inline callbacks.
const FYs = (): number => FY / 2;

/** A downtown tower (mid-far layer). kind: glass, stone, or the MaxxMedia tower. */
export function tower(w: number, h: number, seed: number, kind: 'glass' | 'stone' | 'maxx'): HTMLCanvasElement {
  const top = 16;
  return art(
    `city-tw${w}.${h}.${seed}.${kind}`,
    w,
    h + top,
    () => {
      const r = rng(seed);
      const base = kind === 'stone' ? '#7a7092' : kind === 'maxx' ? '#48507e' : '#58658f';
      const y0 = top;
      R(0, y0, w, h, base);
      if (kind !== 'stone') {
        // glass catches the pale sky up high
        R(0, y0, w, h * 0.55, tint('#b4b0cc', 0.3, 5));
        R(0, y0, w, h * 0.25, tint('#c8bfd2', 0.25, 7));
        for (let x = 2; x < w - 1; x += 4) R(x, y0, 0.5, h, over(0.1));
      } else {
        R(0, y0, w, h, tooth(base, 0.08, seed, 0.1));
      }
      // light from the left: lit edge, shaded right face
      const face = Math.max(3, Math.round(w * 0.3));
      R(w - face, y0, face, h, over(0.24));
      R(w - face, y0, 0.5, h, over(0.4));
      R(0, y0, 0.5, h, liA(base, 0.4));
      // windows
      const step = kind === 'stone' ? 3.5 : 2.5;
      let floor = 0;
      for (let y = y0 + 3; y < y0 + h - 4; y += step, floor++) {
        const litRow = kind === 'maxx' && floor === 9; // Floor 31: still clipping
        for (let x = 1.5; x < w - 1.5; x += 2) {
          const v = r();
          const lit = litRow || v < 0.11;
          const c = lit ? LIT[Math.floor(r() * 3)] : null;
          const shade = x >= w - face;
          if (kind === 'stone') R(x, y, 1, 2, c ? (shade ? shA(c, 0.15) : c) : shA(base, shade ? 0.45 : 0.3));
          else if (c) R(x, y, 1.5, 1, shade ? shA(c, 0.12) : c);
        }
        if (kind !== 'stone') R(0, y + 1.5, w, 0.5, over(0.1));
      }
      // ground floor: a lit lobby strip
      R(1, y0 + h - 4, w - 2, 3, kind === 'stone' ? '#3c3552' : '#33314f');
      for (let x = 2; x < w - 2; x += 3) R(x, y0 + h - 3.5, 1.5, 2, mixc('#ffd889', '#33314f', 0.35));
      // crown
      if (kind === 'stone') {
        R(-0.5, y0, w + 1, 1.5, liA(base, 0.2));
        R(-0.5, y0 + 1.5, w + 1, 0.5, shA(base, 0.4));
        // a wooden rooftop water tank on legs
        const tx = 2 + Math.floor(r() * (w - 10));
        R(tx + 1, y0 - 4, 0.5, 4, AK);
        R(tx + 5, y0 - 4, 0.5, 4, AK);
        RR(tx, y0 - 11, 7, 7, 1, '#7a5a5e');
        R(tx, y0 - 11, 7, 7, (_x, _y, o) => (o && FX_() % 3 === 0 ? shA(o, 0.2) : null));
        R(tx, y0 - 9, 7, 0.5, '#4a3a4e');
        R(tx, y0 - 6, 7, 0.5, '#4a3a4e');
        poly([[tx - 0.5, y0 - 11], [tx + 3.5, y0 - 14], [tx + 7.5, y0 - 11]], '#5a4658');
        R(tx, y0 - 11, 1, 7, (_x, _y, o) => (o ? liA(o, 0.2) : null));
      } else {
        const sb = Math.round(w * 0.18);
        R(sb, y0 - 5, w - sb * 2, 5, shA(base, 0.05));
        R(sb, y0 - 5, 0.5, 5, liA(base, 0.3));
        R(w - sb - 3, y0 - 5, 3, 5, over(0.25));
        // mast with a blinking light (the blink lives in the light pass)
        R(w / 2, 0, 0.5, y0 - 5, '#5a5878');
        P1(w / 2, 0.5, '#ff6a6a');
        if (kind === 'maxx') {
          // the MaxxMedia crown: a rounded pink M
          RR(sb + 1, y0 - 4, w - sb * 2 - 2, 3, 1, '#2e2a52');
          const mx = w / 2;
          for (const [dx, dy] of [[-2, 0], [-2, 1], [-2, 2], [-1.5, 0.5], [-1, 1], [-0.5, 0.5], [0, 0], [0, 1], [0, 2]] as [number, number][]) P1(mx + dx + 0.5, y0 - 3.75 + dy * 0.5 + 0.25, '#ff6fa8');
          R(mx - 2, y0 - 4, 2.5, 0.5, '#ff9cc4');
        }
      }
      // rain streaks down the facade
      R(0, y0, w, h, (_x, _y, o) => (o && fn01(seed) < 0.025 ? liA(o, 0.12) : null));
    },
    'soft',
  );
}
const FX_ = (): number => FX;

const BRICK = ['#8a5c68', '#7c5a72', '#946a62'];
const AWN = [
  ['#3f8a86', '#e8dcc0'],
  ['#c4524f', '#efe2c6'],
  ['#5a6aa8', '#e8dcc0'],
];
const SHOP = ['DELI', 'LAUNDRY', 'OPEN 24'];

/** A brick walk-up with a fire escape and a shop at street level (mid layer). */
export function walkup(v: number): HTMLCanvasElement {
  const W = 50;
  const H = 66;
  return art(
    `city-walk${v}`,
    W,
    H,
    () => {
      const r = rng(300 + v);
      const brick = BRICK[v % 3];
      const top = 6;
      // brick body: mortar rows on half pixels, staggered joints, chipped bricks
      R(0, top, W, H - top, () => {
        const row = Math.floor(FY / 3);
        if (FY % 3 === 0) return mixc(brick, '#c8b8c0', 0.28);
        if ((FX + (row % 2) * 4) % 8 === 0) return mixc(brick, '#c8b8c0', 0.2);
        const n = fn01(v);
        if (n < 0.06) return shA(brick, 0.18);
        if (n > 0.95) return liA(brick, 0.12);
        return brick;
      });
      // light from the left, wet sheen up top
      R(W - 9, top, 9, H - top, over(0.2));
      R(0, top, 1, H - top, (_x, _y, o) => (o ? liA(o, 0.18) : null));
      // cornice with dentils
      R(-1, top - 3, W + 2, 3, '#a89cb0');
      R(-1, top - 3, W + 2, 0.5, '#d0c6d4');
      R(-1, top - 0.5, W + 2, 0.5, '#5e5070');
      for (let x = 0; x < W; x += 2) R(x, top, 1, 1, '#8e8098');
      R(W - 9, top - 3, 10, 3, over(0.2));
      // windows: three floors, three columns
      const cols = [6, 21, 36];
      for (let f = 0; f < 3; f++) {
        const wy = top + 5 + f * 14;
        for (let i = 0; i < 3; i++) {
          const wx = cols[i];
          const lit = r() < 0.32;
          // lintel and sill
          R(wx - 1, wy - 1.5, 9, 1.5, '#b8a8b4');
          R(wx - 1, wy + 9, 9, 1, '#b8a8b4');
          R(wx - 1, wy + 10, 9, 0.5, shA(brick, 0.4));
          R(wx, wy, 7, 9, lit ? vgrad(wy, wy + 9, ['#ffe8b0', '#f6b866']) : vgrad(wy, wy + 9, ['#8e93b6', '#4a4a6e']));
          if (!lit) R(wx + 1, wy + 0.5, 0.5, 3, '#b8bcd6');
          // curtains or a plant on the lit ones
          if (lit) {
            R(wx, wy, 1.5, 9, '#d08a6a');
            R(wx + 5.5, wy, 1.5, 9, '#d08a6a');
            if (r() < 0.5) {
              ell(wx + 3.5, wy + 7, 1.5, 1.2, '#4f7a5a');
              R(wx + 2.5, wy + 8, 2, 1, '#a0583e');
            }
          }
          R(wx + 3, wy, 0.5, 9, '#6a5a72');
          R(wx, wy + 4, 7, 0.5, '#6a5a72');
        }
      }
      // fire escape down the right side: platforms, rails and zigzag stairs
      const iron = '#3b3352';
      const fx0 = 19;
      for (let f = 0; f < 3; f++) {
        const py = top + 15 + f * 14;
        R(fx0, py, 26, 1, iron);
        R(fx0, py - 4, 26, 0.5, iron);
        for (let x = fx0; x <= fx0 + 26; x += 2) R(x, py - 4, 0.5, 4, iron);
        if (f < 2) L(fx0 + 4, py + 1, fx0 + 20, py + 13, iron);
        if (f < 2) L(fx0 + 5, py + 1, fx0 + 21, py + 13, '#5a5270');
        R(fx0, py + 1, 26, 0.5, '#6a6288');
      }
      // storefront
      const sy = H - 14;
      R(0, sy, W, 14, '#4a4060');
      const [aw, aw2] = AWN[v % 3];
      R(2, sy + 4, W - 4, 9, vgrad(sy + 4, sy + 13, ['#ffe2a0', '#f2a862']));
      for (let x = 2; x < W - 2; x += 8) R(x, sy + 4, 0.5, 9, '#3b3352');
      R(W / 2 - 3, sy + 5, 6, 8, '#3b3352');
      R(W / 2 - 2, sy + 6, 4, 7, '#c88a5a');
      // striped awning with scalloped hem
      for (let x = 0; x < W; x += 1) R(x, sy, 1, 4, Math.floor(x / 3) % 2 ? aw : aw2);
      R(0, sy + 3, W, 1, (_x, _y, o) => (o ? shA(o, 0.25) : null));
      for (let x = 1.5; x < W; x += 3) ell(x, sy + 4, 1.5, 0.8, Math.floor((x - 1.5) / 3) % 2 ? aw : aw2);
      R(0, sy, W, 0.5, liA(aw2, 0.3));
      // the shop sign, glowing
      const sign = SHOP[v % 3];
      const sw = TW(sign, FT) + 4;
      RR(W / 2 - sw / 2, sy - 7, sw, 6, 1, '#2e2a48');
      TC(sign, W / 2, sy - 6.5 + 0.5, v % 3 === 2 ? '#ff7aa0' : '#ffe2a0', FT, {});
    },
    'soft',
  );
}

/** The MaxxMedia billboard on its steel stilts (mid layer). */
export function billboard(): HTMLCanvasElement {
  const W = 120;
  const H = 84;
  return art(
    'city-billboard',
    W,
    H,
    () => {
      const steel = '#4e4a6c';
      // the I-beam leg and braces
      R(W / 2 - 3, 44, 6, H - 44, steel);
      R(W / 2 - 3, 44, 1, H - 44, '#7a76a0');
      R(W / 2 + 2, 44, 1, H - 44, '#34304e');
      for (let y = 50; y < H - 4; y += 8) {
        L(W / 2 - 3, y, W / 2 + 2, y + 6, '#34304e');
        L(W / 2 + 2, y, W / 2 - 3, y + 6, '#34304e');
      }
      L(W / 2 - 3, 48, 18, 44, steel);
      L(W / 2 + 2, 48, W - 18, 44, steel);
      // catwalk with three lamps leaning over the board
      R(4, 44, W - 8, 1.5, '#3b3352');
      for (let x = 4; x < W - 4; x += 3) R(x, 41, 0.5, 3, '#3b3352');
      R(4, 41, W - 8, 0.5, '#3b3352');
      for (const lx of [22, 58, 94]) {
        L(lx, 41, lx + 3, 36, '#3b3352');
        RR(lx + 1, 34, 5, 2.5, 1, '#5a5478');
        R(lx + 1.5, 36, 4, 0.5, '#fff0c0');
      }
      // the board: deep navy to violet, framed
      RR(0, 0, W, 40, 1, '#2a2546');
      R(2, 2, W - 4, 36, vgrad(2, 38, ['#3c2f78', '#2b2a5e', '#1f2a52']));
      // lamp wash: the top glows warm
      R(2, 2, W - 4, 10, (_x, _y, o) => (o && fdth(Math.round(16 - (FY / 2 - 2) * 1.6)) ? mixc(o, '#8a6aa8', 0.45) : null));
      // a magenta "play" badge
      circ(15, 20, 9, '#ff5f9e');
      circ(15, 20, 7.5, '#e8407f');
      R(8, 14, 14, 3, (_x, _y, o) => (o ? liA(o, 0.25) : null));
      poly([[12.5, 15.5], [12.5, 24.5], [20, 20]], '#fff2f6');
      // a scissor snip through a strip of film frames
      for (let x = 30; x < W - 8; x += 5) {
        RR(x, 30, 4, 4, 1, '#4a4a86');
        R(x + 1, 31, 2, 2, '#8a8ad0');
      }
      R(29, 29.5, W - 36, 0.5, '#6a6ab0');
      R(29, 34.5, W - 36, 0.5, '#6a6ab0');
      L(72, 27, 76, 37, '#e6e2f6');
      L(76, 27, 72, 37, '#e6e2f6');
      circ(71.5, 37.5, 1.5, '#ff6fa8');
      circ(76.5, 37.5, 1.5, '#ff6fa8');
      // MAXXMEDIA wordmark
      T('MAXXMEDIA', 32, 7, '#3a1f48', FM, { bold: true });
      T('MAXXMEDIA', 32, 6, '#ff7ab0', FM, { bold: true });
      R(32, 6, 64, 2, (_x, _y, o) => (o && o === col_('#ff7ab0') ? liA(o, 0.45) : null));
      T('EVERY MOMENT, CLIPPED.', 30, 18, '#f6eedc', FT, {});
      // weather: a peeling corner and rain-dark streaks
      poly([[W - 2, 2], [W - 12, 2], [W - 2, 10]], '#d8d0e0');
      poly([[W - 12, 2], [W - 2, 10], [W - 9, 8]], '#b0a8c4');
      R(2, 2, W - 4, 36, (_x, _y, o) => (o && hashCol() < 0.05 ? shA(o, 0.15) : null));
      // rim of rain-light along the top edge
      R(0, 0, W, 0.5, '#8a86b0');
    },
    'soft',
  );
}
const col_ = (c: string): number => colk(c);
const hashCol = (): number => hash2(FX, Math.floor(FY / 9), 5);

/** A cobra-head street lamp (near layer). The glow is added live. */
export function streetLamp(): HTMLCanvasElement {
  return art(
    'city-lamp',
    22,
    96,
    () => {
      const pole = '#45405e';
      R(3, 14, 2.5, 82, pole);
      R(3, 14, 0.5, 82, '#6e6a90');
      R(5, 14, 0.5, 82, '#2f2a44');
      // the arm sweeping out over the road
      for (let i = 0; i <= 16; i++) {
        const x = 4 + i;
        const y = 14 - Math.sin((i / 16) * Math.PI * 0.5) * 8;
        R(x, y, 1, 1.5, pole);
        R(x, y, 1, 0.5, '#6e6a90');
      }
      // the head
      RR(12, 4, 10, 4, 1, '#58547a');
      R(13, 4, 8, 0.5, '#8a86b0');
      R(13, 7.5, 8, 1, '#ffe8b0');
      R(14, 8, 6, 0.5, '#fff6d8');
      // base plate
      RR(1, 92, 7, 4, 1, pole);
    },
    'soft',
  );
}

/**
 * The last overpass: a concrete deck across the top of the window and two
 * graffiti'd piers. The space under the deck is a translucent shadow.
 */
export function overpass(deckTop: number, base: number): HTMLCanvasElement {
  const W = 260;
  const H = Math.max(80, base - deckTop);
  return art(
    `city-overpass${H}`,
    W,
    H,
    () => {
      const conc = '#7c7896';
      const deckH = 30;
      // the shadow under the deck: deep up top, thinning toward the road,
      // feathered at both ends where the dawn leaks in
      R(0, deckH, W, H - deckH, () => {
        const y = (FY / 2 - deckH) / (H - deckH);
        const x = FX / 2;
        const feather = Math.min(1, Math.min(x, W - x) / 14);
        const a = (0.86 - y * 0.42) * feather;
        if (a <= 0.02) return null;
        return rgba(mixc('#1a1530', '#262040', fn01(2) * 0.4), a);
      });
      // a far pier and the far edge of the deck, hazy in the gloom
      R(W / 2 - 8, deckH + 10, 16, H - deckH - 10, rgba('#5a5676', 0.85));
      R(W / 2 - 8, deckH + 10, 1, H - deckH - 10, rgba('#7a7696', 0.85));
      R(14, deckH + 6, W - 28, 5, rgba('#3a3554', 0.9));
      R(14, deckH + 6, W - 28, 0.5, rgba('#5a5676', 0.9));
      // underside girders receding: dark stripes running away from you
      for (let i = 0; i < 5; i++) R(10, deckH + 0.5 + i * 1.2, W - 20, 0.5, rgba('#121024', 0.7));
      // the girder face toward you, dimly lit from the left
      R(0, 0, W, deckH, tooth(conc, 0.08, 4, 0.2));
      R(0, 0, W, deckH, (_x, _y, o) => (o ? mixc(o, '#4a4870', (FX / 2 / W) * 0.35) : null));
      R(0, 0, W, 4, '#4e4a6a'); // railing in shadow
      for (let x = 0; x < W; x += 3) R(x, 0, 1, 3, '#8a86a6');
      R(0, 3, W, 0.5, '#3a3654');
      R(0, 6, W, 1, liA(conc, 0.2));
      R(0, deckH - 7, W, 7, vgrad(deckH - 7, deckH, [shA(conc, 0.25), shA(conc, 0.6)]));
      R(0, deckH, W, 1, '#2a2440');
      // stains running down from the joints
      for (let x = 30; x < W; x += 64) {
        R(x, 4, 1, deckH - 4, '#4e4a6a');
        R(x + 1, 7, 2, 12, (_x, _y, o) => (o && fdth(6) ? shA(o, 0.25) : null));
      }
      // the route shield on the deck
      RR(W / 2 - 7, 9, 14, 12, 3, '#e8e2da');
      RR(W / 2 - 6, 10, 12, 10, 2, '#2f2a48');
      TC('9', W / 2, 12.5, '#e8e2da', FM, { bold: true });
      // the near piers, mostly in shade, a cool lit edge on the left
      for (const px of [26, W - 52]) {
        R(px, deckH, 26, H - deckH, tooth('#6a6688', 0.08, px, 0.18));
        R(px, deckH, 1.5, H - deckH, '#9a98b8');
        R(px + 1.5, deckH, 0.5, H - deckH, '#7e7ca0');
        R(px + 16, deckH, 10, H - deckH, over(0.3));
        R(px, deckH, 26, 10, (_x, _y, o) => (o ? shA(o, 0.4 - ((FY / 2 - deckH) / 10) * 0.3) : null));
        R(px, H - 10, 26, 10, over(0.18, 8));
        // wet streaks
        for (let x = px + 3; x < px + 24; x += 5) R(x, deckH + 10, 0.5, H - deckH - 20, (_x, _y, o) => (o && fn01(x) < 0.7 ? liA(o, 0.06) : null));
      }
      // graffiti on the first pier: a heart and a tag (nobody knows who)
      const gx = 30;
      const gy = deckH + 26;
      for (const [dx, dy] of [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [3, 1], [6, 1], [0, 2], [6, 2], [1, 3], [5, 3], [2, 4], [4, 4], [3, 5]] as [number, number][]) R(gx + dx, gy + dy, 1, 1, '#c8486e');
      T('VH 4EVA', gx + 1, gy + 9, '#4fa898', FT, {});
      R(gx, gy + 15, 18, 0.5, '#4fa898');
    },
    false,
  );
}

// ---------------------------------------------------------------- ground bands
/** City ground bands (tile horizontally). */
export function cityGround(which: 'far' | 'mid' | 'near', h: number): HTMLCanvasElement {
  const W = 128;
  return art(`city-g-${which}${h}`, W, h, () => {
    if (which === 'far') {
      R(0, 0, W, h, grainH('#5c5c7e', 0.1, 1));
      R(0, 0, W, 1, '#7c7a9c');
      // a rail line with a lit signal
      R(0, 4, W, 0.5, '#8e8aa8');
      R(0, 5.5, W, 0.5, '#8e8aa8');
      for (let x = 0; x < W; x += 2) R(x, 4.5, 0.5, 1, '#4a4664');
      R(60, 1, 0.5, 3, '#3b3352');
      P1(60, 1, '#ff8a6a');
    } else if (which === 'mid') {
      // sidewalk, curb, then wet asphalt full of reflections
      R(0, 0, W, 5, tooth('#827f9c', 0.08, 3, 0.15));
      for (let x = 0; x < W; x += 16) R(x, 0, 0.5, 5, '#6a6688');
      R(0, 5, W, 1, '#a8a4bc');
      R(0, 6, W, 0.5, '#3b3352');
      R(0, 6.5, W, h - 6.5, grainH('#4b4a6a', 0.08, 7));
      // smeared reflections of warm windows and the pale sky
      for (const [x, c] of [[8, '#c89a7a'], [40, '#8a8aae'], [70, '#c0906e'], [104, '#8a8aae']] as [number, string][])
        R(x, 7, 5, h - 8, (_x, _y, o) => (o && fdth(Math.round(9 - (FY / 2 - 7) * 0.6)) ? mixc(o, c, 0.55) : null));
      for (let x = 0; x < W; x += 32) R(x + 6, h - 4, 12, 0.5, '#d8c890');
    } else {
      // gutter and puddles right beside the bus
      R(0, 0, W, h, grainH('#423f5e', 0.08, 9));
      R(0, 0, W, 2, '#6c6888');
      R(0, 2, W, 0.5, '#2f2a44');
      for (const [x, w] of [[10, 26], [70, 18], [100, 14]] as [number, number][]) {
        ell(x + w / 2, 7, w / 2, 2.5, '#6c6e98');
        ell(x + w / 2, 6.6, w / 2 - 2, 1.5, '#9a98ba');
        R(x + 3, 6, w - 6, 0.5, '#c8c0d4');
      }
      R(0, 12, W, h - 12, (_x, _y, o) => (o && fn01(11) < 0.05 ? liA(o, 0.15) : null));
    }
  });
}
