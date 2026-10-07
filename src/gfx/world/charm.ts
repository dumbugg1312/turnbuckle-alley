/**
 * Art for the garden plots and the festival-day decorations (Golden Hour
 * Storybook, painted at double density with the dense helpers from props.ts).
 * Never pure black: the darkest ink is the plum AK.
 *
 * Crop plots read their state through a getter that systems/garden.ts sets,
 * so this file stays free of game logic. Festival pieces draw only when the
 * festival getter says so.
 */
import { registerObject } from '../../world/registry';
import type { MapObject } from '../../world/types';
import { type Color, circ, ell, liA, mixc, P1, poly, R, shA } from '../kit';
import { blit } from './buildings';
import { FT, TC, TW } from '../font';
import { dart, fh, fy, H1, L1, shadowF, V1 } from './props';

// ---------------------------------------------------------------- hooks the systems fill in

export interface PlotView {
  crop: string | null;
  /** -1 empty, 0 seeds, 1 sprout, 2 young, 3 budding, 4 ripe. */
  stage: number;
  watered: boolean;
}
let plotView: (o: MapObject) => PlotView = () => ({ crop: null, stage: -1, watered: false });
export function setPlotView(fn: (o: MapObject) => PlotView): void {
  plotView = fn;
}
let festival: () => { on: boolean; name: string; season: number } = () => ({ on: false, name: '', season: 0 });
export function setFestivalView(fn: () => { on: boolean; name: string; season: number }): void {
  festival = fn;
}

// ---------------------------------------------------------------- crops

const SOIL = '#5a3a30';
const SOIL_WET = '#3f2a2c';
const LEAF = '#5e8a4a';
const STAKE = '#c8a070';

/** A leaf with a lit top edge and a darker belly. */
function leaf(cx: number, cy: number, rx: number, ry: number, c: Color): void {
  ell(cx, cy, rx, ry, shA(c, 0.18));
  ell(cx - rx * 0.15, cy - ry * 0.25, rx * 0.8, ry * 0.7, c);
  P1(cx - rx * 0.4, cy - ry * 0.4, liA(c, 0.4));
}

function mound(wet: boolean): void {
  const s = wet ? SOIL_WET : SOIL;
  ell(8, 26.6, 6.6, 2.6, shA(s, 0.2));
  ell(8, 26, 6, 2.1, () => (fh(611, 2, 1) < 0.2 ? liA(s, 0.25) : fh(612) > 0.93 ? liA(s, 0.45) : s));
  H1(3.5, 12.5, 24.5, liA(s, 0.3));
  if (wet) {
    P1(5, 25.5, '#8aa8c8');
    P1(10.5, 26, '#8aa8c8');
  }
}

/** Little seed marker with the crop's colour on the tag. */
function marker(c: Color): void {
  V1(12.5, 18.5, 26, STAKE);
  V1(13, 18.5, 26, shA(STAKE, 0.3));
  R(11, 17, 4, 2.5, '#fbf6ea');
  H1(11, 15, 19, '#d8d0c4');
  R(12.25, 17.5, 1.5, 1.5, c);
}

const CROP_COLOR: Record<string, Color> = {
  tomato: '#e8404e', peas: '#9ac860', okra: '#6f9a5a', sunflower: '#f4c23f', pumpkin: '#e8843a', collards: '#4f7a7a',
};

function sprout(h: number, c: Color = LEAF): void {
  L1(8, 25, 8, 25 - h, shA(c, 0.15));
  leaf(6.6, 25 - h + 0.4, 1.6, 0.9, c);
  leaf(9.4, 25 - h + 0.1, 1.6, 0.9, liA(c, 0.08));
}

function young(crop: string): void {
  const c = crop === 'collards' ? '#5a8a80' : LEAF;
  L1(8, 25, 8, 17, shA(c, 0.15));
  leaf(5.8, 22.5, 2.4, 1.3, c);
  leaf(10.2, 21.8, 2.4, 1.3, c);
  leaf(6.4, 19, 2, 1.1, liA(c, 0.06));
  leaf(9.6, 18.3, 2, 1.1, liA(c, 0.1));
}

function grown(crop: string, ripe: boolean): void {
  switch (crop) {
    case 'tomato': {
      // a staked vine; green fruit, then red
      V1(10.5, 6, 26, STAKE);
      V1(11, 6, 26, shA(STAKE, 0.3));
      for (const [x, y, r] of [[7, 21, 3], [9.5, 16, 3.2], [7.5, 11.5, 2.8], [10, 8, 2.4]] as const) leaf(x, y, r, r * 0.8, LEAF);
      L1(8, 25, 10, 8, '#4f7a4a');
      for (const [x, y] of [[6, 18], [10.5, 13], [7, 13.5], [9, 20]] as const) {
        ell(x, y, 1.2, 1.2, ripe ? '#e8404e' : '#9ac860');
        P1(x - 0.5, y - 0.5, ripe ? '#ffb0a0' : '#d8f0a0');
        P1(x, y - 1.2, '#4f7a4a');
      }
      break;
    }
    case 'peas': {
      // a little twig trellis with curling vines
      for (const x of [4, 12]) {
        V1(x, 8, 26, '#a8804e');
        V1(x + 0.5, 8, 26, shA('#a8804e', 0.3));
      }
      H1(4, 12.5, 10, '#a8804e');
      H1(4, 12.5, 16.5, '#a8804e');
      for (const [x, y] of [[6, 22], [10, 19], [6.5, 14], [9.5, 11.5]] as const) leaf(x, y, 2, 1.2, '#7aa858');
      L1(8, 25, 6, 13, '#5e8a4a');
      L1(8, 25, 10, 10, '#5e8a4a');
      if (ripe) for (const [x, y] of [[5.5, 18], [10.5, 15], [7, 12], [9, 21]] as const) {
        ell(x, y, 0.7, 1.8, '#9ac860');
        P1(x - 0.25, y - 1, '#d8f0a0');
      }
      else for (const [x, y] of [[6, 17], [10, 13]] as const) circ(x, y, 0.8, '#fbf6ea');
      break;
    }
    case 'okra': {
      // a tall stalk with broad leaves, a pale flower, upright pods
      V1(8, 6, 26, '#5e8a4a');
      V1(8.5, 6, 26, '#4f7a4a');
      for (const [x, y, s] of [[5, 21, 1], [11, 18, 1], [5.5, 13.5, 0.85], [10.5, 10, 0.8]] as const) leaf(x, y, 3 * s, 1.6 * s, '#6f9a5a');
      ell(8.25, 6, 1.6, 1.4, '#f6e6a0');
      P1(8.25, 6, '#a8344a');
      if (ripe) for (const [x, y] of [[6.5, 12], [10, 15], [6.5, 17.5]] as const) {
        poly([[x - 0.6, y + 2], [x + 0.6, y + 2], [x, y - 1.6]], '#6f9a5a');
        P1(x - 0.2, y, '#a8d080');
      }
      break;
    }
    case 'sunflower': {
      V1(8, 4, 26, '#5e8a4a');
      V1(8.5, 4, 26, '#4f7a4a');
      for (const [x, y] of [[5, 20], [11, 16], [5.5, 12]] as const) leaf(x, y, 2.8, 1.5, LEAF);
      if (ripe) {
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          ell(8.25 + Math.cos(a) * 3.2, 4 + Math.sin(a) * 3, 1.3, 1.3, k % 2 ? '#f4c23f' : '#ffd860');
        }
        circ(8.25, 4, 2.2, '#6a3a28');
        P1(7.5, 3.5, '#8a5a38');
      } else {
        ell(8.25, 4.5, 1.8, 2.2, '#7aa858');
        P1(8.25, 2.6, '#f4c23f');
      }
      break;
    }
    case 'pumpkin': {
      // sprawling vine and broad leaves, a pumpkin sitting in the middle
      for (const [x, y, r] of [[3.5, 22, 2.8], [12.5, 21.5, 2.8], [5, 17, 2.4], [11.5, 17.5, 2.2]] as const) leaf(x, y, r, r * 0.75, '#5e8a4a');
      L1(2, 23, 14, 22, '#4f7a4a');
      const pc = ripe ? '#e8843a' : '#9ac860';
      ell(8, 22.5, ripe ? 4.6 : 2.6, ripe ? 3.4 : 2.1, shA(pc, 0.2));
      ell(7.6, 22, ripe ? 4 : 2.2, ripe ? 2.9 : 1.8, pc);
      if (ripe) {
        V1(6, 20, 24.5, shA(pc, 0.25));
        V1(9.5, 20, 24.5, shA(pc, 0.25));
        P1(5.5, 20.5, liA(pc, 0.4));
      }
      R(7.5, ripe ? 18.6 : 20, 1, 1.5, '#6a5a2a');
      break;
    }
    default: {
      // collards: a broad blue-green rosette
      const c = '#4f7a7a';
      for (const [x, y, r] of [[4.5, 22, 3.4], [11.5, 22, 3.4], [6, 17.5, 3.2], [10, 17, 3.2], [8, 13, ripe ? 3.4 : 2.4]] as const) {
        leaf(x, y, r, r * 0.8, c);
        L1(8, 24, x, y, liA(c, 0.35));
      }
      if (ripe) leaf(8, 9.5, 2.6, 2, liA(c, 0.1));
      break;
    }
  }
}

registerObject('crop-plot', {
  hit: { x: -7, y: -14, w: 14, h: 14 },
  label: (o) => {
    const v = plotView(o);
    if (v.stage < 0) return 'Plant';
    if (v.stage >= 4) return 'Harvest';
    return v.watered ? 'Check' : 'Water';
  },
  draw: (ctx, o) => {
    const v = plotView(o);
    const key = `crop|${v.crop ?? '-'}|${v.stage}|${v.watered ? 1 : 0}`;
    blit(
      ctx,
      dart(key, 16, 30, () => {
        mound(v.watered);
        if (v.stage < 0 || !v.crop) return;
        if (v.stage === 0) marker(CROP_COLOR[v.crop] ?? LEAF);
        else if (v.stage === 1) sprout(3);
        else if (v.stage === 2) young(v.crop);
        else grown(v.crop, v.stage >= 4);
      }, { outline: false, pad: [3, 3, 3, 3], shadow: (ox, oy) => shadowF(ox + 8, oy + 27.5, 7, 1.6) }),
      o,
    );
  },
});

// ---------------------------------------------------------------- festival decorations

const FLAG_COLORS: Color[] = ['#c9404c', '#e8b84a', '#3e8a7a', '#fbf0d9', '#7a4a8a'];
const SEASON_ACCENT: Color[] = ['#ff9ec0', '#f4c23f', '#e8843a', '#a8c8f0'];

function pole(x: number, h: number): void {
  R(x, 34 - h, 1.5, h, '#a8804e');
  V1(x, 34 - h, 34, liA('#a8804e', 0.3));
  ell(x + 0.75, 34 - h, 1.2, 1, '#e8b84a');
}

/** Pennant bunting strung between two poles, props.w tiles wide. */
registerObject('festival-bunting', {
  draw: (ctx, o) => {
    const f = festival();
    if (!f.on) return;
    const w = Math.max(2, Math.min(12, Number(o.props.w ?? 4)));
    const W = w * 16;
    blit(
      ctx,
      dart(`fest-bunting|${w}|${f.season}`, W, 34, () => {
        pole(0.5, 30);
        pole(W - 2, 30);
        const sag = 7;
        const y0 = 5;
        const ry = (t: number) => y0 + sag * 4 * t * (1 - t);
        for (let x = 1.5; x < W - 2; x += 0.5) P1(x, ry((x - 1) / (W - 3)), '#8a6a5a');
        let k = 0;
        for (let x = 4; x < W - 5; x += 6, k++) {
          const y = ry((x - 1) / (W - 3));
          const c = k % 3 === 2 ? SEASON_ACCENT[f.season] : FLAG_COLORS[k % FLAG_COLORS.length];
          poly([[x - 2, y], [x + 2, y], [x, y + 5]], c);
          L1(x - 2, y, x, y + 5, shA(c, 0.25));
          P1(x - 1, y + 0.5, liA(c, 0.35));
        }
      }, { outline: false, pad: [2, 2, 2, 4], shadow: (ox, oy) => { shadowF(ox + 1.25, oy + 34, 2, 0.8); shadowF(ox + W - 1.25, oy + 34, 2, 0.8); } }),
      o,
    );
  },
});

/** Paper lanterns on a line between two poles; they glow at night. */
registerObject('festival-lanterns', {
  lights: (o) => {
    if (!festival().on) return [];
    const w = Math.max(2, Math.min(12, Number(o.props.w ?? 4)));
    const out: { x: number; y: number; r: number; color: string }[] = [];
    for (let x = 8; x < w * 16 - 8; x += 16) out.push({ x: o.x - (w * 16) / 2 + x, y: o.y - 26, r: 18, color: '#ffcf7a' });
    return out;
  },
  draw: (ctx, o) => {
    const f = festival();
    if (!f.on) return;
    const w = Math.max(2, Math.min(12, Number(o.props.w ?? 4)));
    const W = w * 16;
    blit(
      ctx,
      dart(`fest-lanterns|${w}`, W, 34, () => {
        pole(0.5, 30);
        pole(W - 2, 30);
        const ry = (t: number) => 5 + 5 * 4 * t * (1 - t);
        for (let x = 1.5; x < W - 2; x += 0.5) P1(x, ry((x - 1) / (W - 3)), '#8a6a5a');
        let k = 0;
        for (let x = 8; x < W - 6; x += 8, k++) {
          const y = ry((x - 1) / (W - 3)) + 3;
          const c: Color = k % 2 ? '#e8843a' : '#f4c23f';
          V1(x, y - 3, y - 1.5, '#8a6a5a');
          ell(x, y, 2.4, 2, shA(c, 0.2));
          ell(x - 0.3, y - 0.3, 2, 1.6, c);
          H1(x - 1.5, x + 1.5, y - 1.5, shA(c, 0.35));
          H1(x - 1.5, x + 1.5, y + 1.4, shA(c, 0.35));
          P1(x - 1, y - 0.5, mixc(c, '#fff4dc', 0.6));
        }
      }, { outline: false, pad: [2, 2, 2, 4] }),
      o,
    );
  },
});

/** The festival sign at the fairgrounds gate, with the day's name on it. */
registerObject('festival-sign', {
  draw: (ctx, o) => {
    const f = festival();
    if (!f.on) return;
    const name = f.name.toUpperCase();
    const W = Math.max(60, Math.ceil(TW(name, FT) / 2) * 2 + 12);
    blit(
      ctx,
      dart(`fest-sign|${name}|${f.season}`, W, 36, () => {
        for (const x of [3, W - 5]) {
          R(x, 10, 2, 26, '#8a6a4a');
          V1(x, 10, 36, liA('#8a6a4a', 0.3));
        }
        // board with a painted edge and the name in cream
        R(0, 4, W, 15, shA('#7a2f31', 0.1));
        R(1, 5, W - 2, 13, '#b04a3f');
        H1(1, W - 1, 5, liA('#b04a3f', 0.3));
        R(2.5, 6.5, W - 5, 10, () => (fy() < 7.5 ? '#c9604c' : '#b04a3f'));
        TC(name, W / 2, 9, '#fbf0d9', FT);
        // pennants hanging off the bottom edge
        for (let x = 4, k = 0; x < W - 3; x += 5, k++) poly([[x, 19], [x + 3, 19], [x + 1.5, 22.5]], k % 2 ? SEASON_ACCENT[f.season] : '#e8b84a');
        // a garland across the top
        for (let x = 1; x < W - 1; x += 2) circ(x, 3.6 + Math.sin(x * 0.8) * 0.6, 1.1, x % 4 < 2 ? '#5e8a4a' : '#7aa858');
      }, { pad: [3, 3, 3, 3], shadow: (ox, oy) => { shadowF(ox + 4, oy + 36, 2.5, 0.8); shadowF(ox + W - 4, oy + 36, 2.5, 0.8); } }),
      o,
    );
  },
});
