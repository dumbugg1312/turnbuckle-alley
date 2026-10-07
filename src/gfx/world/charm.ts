/**
 * Hand-placed imperfection (the charm pass): small props that make a place
 * look used. A leaning fence post and a missing picket, a bike against the
 * diner, a chalk drawing that changes every week, a lost mitten in winter,
 * a dented bucket and a hose coiled wrong, flyers on a lamp post, puddles
 * the day after rain, a newspaper on a step, a dropped cone in summer.
 *
 * Every piece is a cached dense canvas (D-018); draw() only blits. Props
 * that only show some of the time (mitten, cone, puddle) keep their line in
 * props.text only while they are there, so empty ground never says anything.
 */
import { G, ext } from '../../core/state';
import { absDay } from '../../core/time';
import { onTick } from '../../world/hooks';
import { registerObject } from '../../world/registry';
import type { MapObject } from '../../world/types';
import { AK, P1, R, RR, circ, col, ell, hash2, liA, mixc, poly, rng, shA } from '../kit';
import { blit, type Art } from './buildings';
import { bolt, contactF, dart, fd, fx, fy, H1, L1, ramp, shadowF, V1, woodPaintV } from './props';
import { grassTones } from './terrain';

// ---------------------------------------------------------------- shared state
/** The last day it rained (absolute day), noted while the clock runs. */
const weatherLog = () => ext('charm-weather', () => ({ lastRain: -99 }));
onTick(() => {
  if (G.weather.today === 'rain' || G.weather.today === 'storm') weatherLog().lastRain = absDay();
});
const wet = () => G.weather.today === 'rain' || G.weather.today === 'storm';
/**
 * The calendar season (0 spring .. 3 winter). Seasonal props follow the
 * calendar rather than the terrain art's season, so a mitten shows up in
 * winter even where the ground art has not switched over.
 */
const calendarSeason = () => ((G.time.season % 4) + 4) % 4;
/** Puddles stand while it rains and through the next day. */
export const puddlesOut = () => wet() || weatherLog().lastRain === absDay() - 1;
/** Show or hide an object's line along with the object. */
function speak(o: MapObject, on: boolean, line?: string): void {
  if (o.props.say === undefined) o.props.say = (o.props.text as string | undefined) ?? '';
  const t = line ?? (o.props.say as string);
  if (on && t) o.props.text = t;
  else delete o.props.text;
}
const draw = (ctx: CanvasRenderingContext2D, o: MapObject, a: Art) => blit(ctx, a, o);

// ---------------------------------------------------------------- the farm fence: one post leans, one picket is gone
function picketL(x: number, y: number, h: number, lean: number, seed: number): void {
  poly([[x + lean, y + 1.5], [x + 1.5 + lean, y], [x + 3 + lean, y + 1.5], [x + 3, y + h], [x, y + h]], () => {
    const u = (fx() - x) / 3;
    let c: number = col(u < 0.3 ? '#ffffff' : u < 0.75 ? '#f2ece4' : '#cfc4c4');
    const peel = hash2(Math.floor(fx() * 2) >> 1, Math.floor(fy() * 2) >> 2, seed);
    if (peel < 0.1) c = col(u < 0.5 ? '#a89a90' : '#8a7c7a');
    if (fy() > y + h - 2.5 && fd(6)) c = mixc(c, '#8a7a6a', 0.35);
    return c;
  });
  bolt(x + 1 + lean * 0.8, y + 4, '#9a9098');
}
registerObject('fence-worn', {
  draw(ctx, o) {
    const n = Math.max(2, Math.floor(Number(o.props.w ?? 3)));
    const gap = Math.floor(Number(o.props.gap ?? n * 2));
    const w = n * 16;
    const a = dart(`fence-worn|${n}|${gap}`, w + 4, 22, () => {
      // rails sag toward the leaning end post on the right
      for (const ry of [5, 12]) {
        poly([[0, ry], [w - 10, ry], [w + 2, ry + 2.5], [w + 2, ry + 4.5], [w - 10, ry + 2], [0, ry + 2]], () => {
          const t = hash2(Math.floor(fx() * 2 / 7), Math.floor(fy() * 2), 91 + ry);
          return t < 0.15 ? '#bab0ae' : '#d8d0cc';
        });
        H1(0, w - 10, ry, '#ffffff');
        H1(0, w - 10, ry + 1.5, '#9a8e92');
      }
      const count = Math.floor(w / 4);
      for (let i = 0; i < count; i++) {
        if (i === gap) continue;
        const x = i * 4 + 0.5;
        const end = count - i;
        const lean = end <= 3 ? (4 - end) * 0.9 : 0;
        const top = i % 2 ? 0.5 : 0;
        picketL(x, top + (end <= 3 ? (4 - end) * 0.5 : 0), 18 - top - (end <= 3 ? (4 - end) * 0.5 : 0), lean, 93 + i);
      }
      // the end post, leaning out, and the missing picket lying in the grass
      poly([[w - 1, 18], [w + 2, 18], [w + 4.5, 1], [w + 1.5, 1]], woodPaintV('#d8d0cc', 97, 0.2));
      L1(w + 1.6, 1, w - 0.9, 17.5, '#ffffff');
      R(w + 1.4, 0.5, 3, 1, '#f2ece4');
      const gx = gap * 4 + 0.5;
      poly([[gx - 3, 20], [gx + 12, 19.5], [gx + 13.5, 20.5], [gx + 12, 21.5], [gx - 3, 21.5]], '#e6ded8');
      H1(gx - 3, gx + 12, 19.5, '#ffffff');
      H1(gx - 3, gx + 12, 21.5, '#a89a90');
      P1(gx + 3, 20.5, '#9a9098');
    }, { pad: [0, 0, 3, 3], shadow: (ox, oy) => contactF(ox, oy + 18, w) });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- a kid's bike leaning on the diner
registerObject('bike', {
  solid: { x: -11, y: -3, w: 22, h: 3 },
  draw(ctx, o) {
    const a = dart('bike', 30, 20, () => {
      const wheel = (cx: number) => {
        circ(cx, 13.5, 6, '#3a3048');
        circ(cx, 13.5, 5, 0);
        circ(cx, 13.5, 4.6, 0);
        for (let k = 0; k < 8; k++) L1(cx, 13.5, cx + Math.cos(k * 0.785) * 4.6, 13.5 + Math.sin(k * 0.785) * 4.6, '#b8b4c8');
        circ(cx, 13.5, 0.8, '#d8d4e4');
        // a tyre highlight
        L1(cx - 4.5, 10.5, cx - 2.5, 8.2, '#6a6080');
      };
      wheel(7);
      wheel(23);
      const red = ramp('#d8434b');
      // the frame: chain stay, seat tube, top tube, down tube, fork
      L1(7, 13.5, 14, 13.5, red[1]);
      L1(14, 13.5, 11.5, 5.5, red[2]);
      L1(11.5, 5.5, 21, 6, red[3]);
      L1(14, 13.5, 21.5, 6.5, red[2]);
      L1(21, 5, 23, 13.5, red[1]);
      L1(7, 13.5, 11.5, 5.5, red[1]);
      // seat, bars with streamers (one gone limp), a taped-over bell
      RR(9.5, 3.5, 5, 1.5, 1, '#3a3048');
      L1(20.5, 2.5, 21, 5, '#9a94b0');
      H1(18.5, 23.5, 2.5, '#9a94b0');
      for (const [sx, c] of [[18.5, '#ff94b4'], [23.5, '#5ab0e0']] as [number, string][]) {
        L1(sx, 2.5, sx - 1.5, 6.5, c);
        L1(sx + 0.5, 2.5, sx - 0.5, 6, liA(c, 0.3));
      }
      circ(22.5, 3.2, 0.9, '#c8c4d8');
      R(22, 2.6, 1.2, 0.6, '#e8dcb8');
      // a playing card in the spokes
      R(8.5, 11, 1.5, 2, '#fff8ee');
      P1(9, 11.5, '#d8434b');
      // kickstand down
      L1(14, 13.5, 16, 19, '#6a6488');
    }, { pad: [2, 0, 4, 3], shadow: (ox, oy) => { shadowF(ox + 7, oy + 19.5, 5, 1.2); shadowF(ox + 23, oy + 19.5, 5, 1.2); } });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- the chalk drawing outside the diner (new every week)
const CHALK = ['#ffffff', '#ff7aa8', '#5ab8e0', '#ffd040', '#7ac86a', '#b088e8'];
function chalkLine(pts: [number, number][], c: string, seed: number): void {
  const r = rng(seed);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
    for (let k = 0; k <= n; k++) if (r() > 0.12) P1(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, c);
  }
}
function chalkCircle(cx: number, cy: number, rx: number, ry: number, c: string, seed: number): void {
  const pts: [number, number][] = [];
  for (let k = 0; k <= 24; k++) pts.push([cx + Math.cos((k / 24) * Math.PI * 2) * rx, cy + Math.sin((k / 24) * Math.PI * 2) * ry]);
  chalkLine(pts, c, seed);
}
const CHALK_ART: ((s: number) => void)[] = [
  // hopscotch
  (s) => {
    const boxes: [number, number][] = [[10, 12], [10, 8], [7, 4], [13, 4], [10, 0]];
    boxes.forEach(([x, y], i) => {
      chalkLine([[x, y], [x + 5, y], [x + 5, y + 4], [x, y + 4], [x, y]], CHALK[0], s + i);
      P1(x + 2.5, y + 2, CHALK[(i % 5) + 1]);
      P1(x + 2.5, y + 2.5, CHALK[(i % 5) + 1]);
    });
    R(17.5, 4.5, 4, 3, CHALK[1]);
  },
  // a stick wrestler hoisting a belt three times their size
  (s) => {
    chalkCircle(6, 3, 1.6, 1.6, CHALK[0], s);
    chalkLine([[6, 4.6], [6, 10], [4, 14], [6, 10], [8, 14]], CHALK[0], s + 1);
    chalkLine([[6, 6], [3, 2], [6, 6], [9, 2]], CHALK[0], s + 2);
    chalkLine([[2, 1], [22, 1], [22, 4], [2, 4], [2, 1]], CHALK[3], s + 3);
    chalkCircle(12, 2.5, 3, 2.4, CHALK[3], s + 4);
    for (let k = 0; k < 4; k++) P1(16 + k * 1.5, 2.5, CHALK[1]);
  },
  // a sun in sunglasses with two lawn chairs
  (s) => {
    chalkCircle(7, 6, 4, 3.6, CHALK[3], s);
    for (let k = 0; k < 8; k++) chalkLine([[7 + Math.cos(k * 0.785) * 5, 6 + Math.sin(k * 0.785) * 4.6], [7 + Math.cos(k * 0.785) * 7, 6 + Math.sin(k * 0.785) * 6.4]], CHALK[3], s + k);
    R(4.5, 5, 2, 1, CHALK[2]);
    R(7.5, 5, 2, 1, CHALK[2]);
    chalkLine([[15, 12], [17, 8], [21, 8], [19, 12]], CHALK[1], s + 9);
    chalkLine([[17, 8], [16, 5]], CHALK[1], s + 10);
    chalkLine([[21, 13], [22, 11], [24, 11], [23, 13]], CHALK[4], s + 11);
  },
  // a heart with initials, one set redone bigger
  (s) => {
    chalkLine([[12, 13], [5, 6], [5, 3], [8, 1], [12, 4], [16, 1], [19, 3], [19, 6], [12, 13]], CHALK[1], s);
    chalkLine([[8, 6], [9, 4], [10, 6], [9, 5]], CHALK[0], s + 1);
    chalkLine([[13, 7], [13, 4], [15, 4], [15, 5.5], [13, 5.5], [15, 7]], CHALK[0], s + 2);
    for (let k = 0; k < 6; k++) P1(13 + (k % 3) * 0.5, 8.5 + Math.floor(k / 3) * 0.5, CHALK[1]);
  },
  // a ring: two stick wrestlers, one mid-air, an arrow
  (s) => {
    chalkLine([[2, 3], [20, 3], [20, 13], [2, 13], [2, 3]], CHALK[2], s);
    chalkLine([[2, 6], [20, 6]], CHALK[1], s + 1);
    chalkLine([[2, 9], [20, 9]], CHALK[1], s + 2);
    chalkCircle(7, 9, 1, 1, CHALK[0], s + 3);
    chalkLine([[7, 10], [7, 12.5]], CHALK[0], s + 4);
    chalkCircle(15, 1.5, 1, 1, CHALK[0], s + 5);
    chalkLine([[15, 2.5], [17, 4], [19, 3]], CHALK[0], s + 6);
    chalkLine([[22, 0], [17.5, 1], [19, 0], [17.5, 1], [19, 2.2]], CHALK[3], s + 7);
  },
  // a rocket aimed at the diner, flames all the way down
  (s) => {
    chalkLine([[10, 0], [13, 4], [13, 10], [7, 10], [7, 4], [10, 0]], CHALK[0], s);
    chalkCircle(10, 5.5, 1.2, 1.2, CHALK[2], s + 1);
    chalkLine([[7, 8], [5, 11], [7, 10]], CHALK[1], s + 2);
    chalkLine([[13, 8], [15, 11], [13, 10]], CHALK[1], s + 3);
    for (let k = 0; k < 5; k++) chalkLine([[8 + k, 10.5], [7.5 + k * 1.2, 13 + (k % 2)]], k % 2 ? CHALK[3] : CHALK[1], s + 4 + k);
  },
];
registerObject('chalk', {
  sortY: -300,
  hit: { x: -13, y: -15, w: 26, h: 16 },
  draw(ctx, o) {
    const week = Math.floor(absDay() / 7);
    const v = (week + Math.floor(Number(o.props.seed ?? 0))) % CHALK_ART.length;
    const lines = o.props.lines as string[] | undefined;
    if (lines) speak(o, true, lines[v % lines.length]);
    // rain washes it to a ghost
    const faint = wet() ? 1 : 0;
    const a = dart(`chalk|${v}|${faint}`, 24, 14, () => {
      CHALK_ART[v](v * 31 + 5);
      if (faint) R(0, 0, 24, 14, (_x, _y, c) => (c ? ((col('#d8c8c0') & 0x00ffffff) | (0x50 << 24)) >>> 0 : null));
    }, { outline: false });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- winter: a red mitten on a fence post
registerObject('mitten', {
  sortY: 2,
  hit: { x: -8, y: -18, w: 16, h: 18 },
  draw(ctx, o) {
    const on = calendarSeason() === 3;
    speak(o, on);
    if (!on) return;
    const a = dart('mitten', 6, 14, () => {
      // thumb up, cuff folded, a little snow on top
      const red = ramp('#d8434b');
      RR(1, 3, 4, 5, 2, red[2]);
      RR(4, 2.5, 1.5, 3, 1, red[2]);
      R(1, 2.5, 3, 0.5, red[3]);
      R(1, 7.5, 4, 2, '#fbf0d9');
      for (let k = 0; k < 4; k++) P1(1.25 + k, 8, '#d8c8c0');
      P1(2, 4.5, red[4]);
      R(1.5, 2, 3, 0.5, '#ffffff');
      P1(3, 5.5, red[1]);
    }, { outline: true });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- the farm: a dented bucket, a hose coiled wrong
registerObject('bucket', {
  solid: { x: -4, y: -3, w: 8, h: 3 },
  draw(ctx, o) {
    const a = dart('bucket', 11, 11, () => {
      // galvanized: cool grey with a warm sun side; a dent in the front
      poly([[1, 2], [10, 2], [9, 10.5], [2, 10.5]], () => {
        const u = (fx() - 1) / 9;
        const dent = Math.hypot(fx() - 6.5, fy() - 6.5) < 1.6;
        let c: number = col(u < 0.2 ? '#e8ecf2' : u < 0.5 ? '#c8ccd8' : u < 0.8 ? '#a8acbc' : '#8a8ca0');
        if (dent) c = fx() < 6.5 ? shA(c, 0.2) : liA(c, 0.25);
        if (hash2(Math.floor(fx() * 2), Math.floor(fy() * 4), 31) < 0.06) c = shA(c, 0.12);
        return c;
      });
      ell(5.5, 2, 4.5, 1.2, '#7a7c90');
      ell(5.5, 2.3, 3.8, 0.8, '#5a8aa8');
      P1(4, 2, '#a8d0e8');
      for (const y of [4, 8.5]) H1(1.5, 9.5, y, '#8a8ca0');
      // the wire bail flopped to one side
      L1(1, 2.5, -0.5, 6.5, '#6a6488');
      L1(-0.5, 6.5, 2, 8.5, '#6a6488');
      // masking tape label
      R(3, 5, 4, 1.5, '#f2e2b8');
      for (let k = 0; k < 3; k++) P1(3.5 + k, 5.5, '#8a6a5a');
    }, { pad: [2, 0, 4, 3], shadow: (ox, oy) => shadowF(ox + 6.5, oy + 10.5, 5, 1.4) });
    draw(ctx, o, a);
  },
});
registerObject('hose', {
  draw(ctx, o) {
    const a = dart('hose', 34, 14, () => {
      const g = ramp('#4f9a5a');
      // a coil that has given up being round, a kink, and a tail off to the spigot
      const loop = (cx: number, cy: number, rx: number, ry: number, tilt: number, seed: number) => {
        for (let t = 0; t < Math.PI * 2; t += 0.07) {
          const x = cx + Math.cos(t) * rx + Math.sin(t * 2 + seed) * 0.6;
          const y = cy + Math.sin(t) * ry + Math.cos(t) * tilt;
          ell(x, y, 0.8, 0.8, Math.sin(t) < -0.2 ? g[3] : Math.sin(t) > 0.5 ? g[1] : g[2]);
        }
      };
      loop(10, 8, 7, 3.6, 0.8, 1);
      loop(11.5, 7.5, 5.5, 2.8, -0.6, 2);
      loop(9, 8.5, 8, 3.2, 0.3, 3);
      // the kink, folded flat
      poly([[17, 6], [20, 4.5], [20.5, 6], [18, 7.5]], g[1]);
      H1(17.5, 20, 5, g[4]);
      // the tail, wandering off right
      for (let t = 0; t < 1; t += 0.02) ell(20 + t * 13, 6 + Math.sin(t * 6) * 1.5 + t * 2, 0.8, 0.8, g[2]);
      // brass nozzle
      RR(30.5, 8, 3, 2, 1, '#e8b84a');
      P1(31, 8.5, '#fff0b0');
    }, { pad: [1, 1, 3, 3], shadow: (ox, oy) => shadowF(ox + 11, oy + 10, 9, 2.4) });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- flyers taped to a lamp post (one half torn)
registerObject('flyers', {
  sortY: 1,
  hit: { x: -8, y: -30, w: 16, h: 32 },
  draw(ctx, o) {
    const a = dart('flyers', 16, 51, () => {
      // positioned on the lamp column (the lamp's centre is x = 8 here)
      // the lost-cowbell flyer, tape at the corners, a fringe of tear-off tabs
      R(4, 20, 7, 9, '#fbf6ea');
      R(4.5, 21, 6, 1, '#3a3048');
      R(5, 22.5, 2.5, 2.5, '#c8a050');
      P1(6, 25, '#3a3048');
      for (let k = 0; k < 3; k++) R(8, 23 + k, 2, 0.5, '#8a84a0');
      for (let k = 0; k < 6; k++) if (k !== 2 && k !== 4) R(4.25 + k * 1.1, 29, 0.75, 2.5, '#fbf6ea');
      R(4, 19.5, 2, 1, '#f2e8c0');
      R(9, 19.5, 2, 1, '#f2e8c0');
      // the tryouts flyer, torn in half: only the bottom half left, ragged top
      poly([[5, 34], [6, 33], [7, 34.5], [8.5, 33.2], [10, 34.2], [11.5, 33.5], [11.5, 40], [5, 40]], '#ffb6cc');
      R(5.5, 35.5, 5.5, 0.5, '#8a2c44');
      R(5.5, 37, 4, 0.5, '#8a2c44');
      R(6, 38.5, 3, 0.5, '#8a2c44');
      R(10, 39, 2, 1, '#f2e8c0');
      // an old staple and a scrap of a much older flyer
      P1(5, 16, '#c8c4d8');
      R(10, 15, 1.5, 2, '#a8d8e0');
    }, { outline: true });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- puddles: through the rain and the day after
registerObject('puddle', {
  sortY: -300,
  hit: { x: -12, y: -10, w: 24, h: 10 },
  draw(ctx, o) {
    const on = puddlesOut();
    speak(o, on);
    if (!on) return;
    const v = Math.abs(Math.floor(Number(o.props.variant ?? 0))) % 3;
    const raining = wet() ? 1 : 0;
    const t = performance.now() / 1000;
    const ring = raining ? Math.floor((t * 3 + o.x * 0.1) % 4) : -1;
    const a = dart(`puddle|${v}|${raining}|${ring}`, 26, 10, () => {
      const r = rng(v * 17 + 3);
      const blobs: [number, number, number, number][] = [[13, 5, 10, 3.6], [6 + r() * 3, 6, 4, 2.4], [19 + r() * 2, 4.5, 5, 2.4]];
      // the dark wet rim, then sky in the water
      const rim = ((col('#3a2848') & 0x00ffffff) | (0x60 << 24)) >>> 0;
      for (const [x, y, rx, ry] of blobs) ell(x, y, rx + 0.8, ry + 0.6, rim);
      for (const [x, y, rx, ry] of blobs)
        ell(x, y, rx, ry, () => {
          const k = (fy() - 1) / 8;
          return mixc(raining ? '#8a96b0' : '#a8c8e8', raining ? '#5a6280' : '#6a88b8', Math.max(0, Math.min(1, k)));
        });
      // a bright streak of sky and a floating leaf
      H1(7, 12, 3.5, raining ? '#c8d0e0' : '#e8f4ff');
      H1(15, 18, 5, raining ? '#b8c0d0' : '#d8ecff');
      if (!raining) {
        P1(17, 6, '#e8803a');
        P1(17.5, 6, '#c8602a');
      }
      if (ring >= 0) ell(8 + ring * 3, 5, 1 + (ring % 2), 0.6, (_x, _y, c) => (c ? liA(c, 0.35) : null));
    }, { outline: false });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- the morning paper on a step
registerObject('newspaper', {
  sortY: -2,
  draw(ctx, o) {
    const a = dart('newspaper', 10, 5, () => {
      // rolled, rubber-banded, a corner of the headline showing
      RR(0.5, 0.5, 9, 4, 2, '#f4eee0');
      for (let k = 1; k < 9; k += 1.5) P1(k, 2.5, '#c8c0b8');
      R(2, 1, 3, 1, '#3a3048');
      R(6.5, 0.5, 1, 4.5, '#d8434b');
      H1(1, 9, 4.5, '#b8b0a8');
    }, { pad: [1, 0, 3, 2], shadow: (ox, oy) => shadowF(ox + 5, oy + 4.5, 5, 1) });
    draw(ctx, o, a);
  },
});

// ---------------------------------------------------------------- summer: a dropped ice cream cone
registerObject('dropped-cone', {
  sortY: -4,
  draw(ctx, o) {
    const on = calendarSeason() === 1;
    speak(o, on);
    if (!on) return;
    const a = dart('dropped-cone', 12, 7, () => {
      // the scoop flat on the ground, melting, the cone on top pointing up
      ell(5, 5, 4.5, 1.8, '#ffc0d0');
      ell(4, 4.6, 2.5, 0.8, '#ffe0ea');
      ell(8.5, 5.8, 2, 0.8, '#ffb0c4');
      poly([[3, 4.5], [7, 4.5], [5, 0]], '#e0a858');
      L1(3.8, 3.2, 6, 2.6, '#b87a3a');
      L1(4.3, 1.8, 5.6, 4, '#b87a3a');
      // three ants on business
      for (const [x, y] of [[10, 6.5], [11, 5.5], [9.5, 3.5]] as [number, number][]) {
        P1(x, y, AK);
        P1(x + 0.5, y, AK);
      }
      V1(11.5, 5.5, 6.5, grassTones()[1]);
    }, { pad: [1, 0, 3, 2], shadow: (ox, oy) => shadowF(ox + 5, oy + 5.5, 5, 1.2) });
    draw(ctx, o, a);
  },
});

