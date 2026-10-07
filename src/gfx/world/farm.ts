/**
 * Grandma's backyard (Golden Hour Storybook): debris to clear, the old
 * backyard ring in its three states, training equipment, merch machines and
 * the yard bits. Sprites are cached via art() from interiors.ts; draw() blits.
 */
import { registerObject } from '../../world/registry';
import type { MapObject, ObjectKind } from '../../world/types';
import { FT, T, TC } from '../font';
import { type Color, circ, curve, dth, ell, hash2, HL, L, liA, mixc, P, poly, R, rng, RR, shA, VL } from '../kit';
import { art, blit, drawRing, frame, HONEY, light, OAK, PAL, phaseOf, type RingStyle, sparkle, stampRows, variant, WALNUT } from './interiors';

function reg(kind: string, def: ObjectKind): void {
  registerObject(kind, def);
}
const clearLabel = (o: MapObject) => (o.props.debris ? 'Clear' : null);

// Grass-tuft helper used around bases so things sit in the lawn.
function tufts(x0: number, x1: number, y: number, seed: number, dense = 0.5): void {
  const r = rng(seed);
  for (let x = x0; x < x1; x++) {
    if (r() > dense) continue;
    const h = 1 + Math.floor(r() * 3);
    const c = r() < 0.5 ? '#6f9a5a' : '#8ab868';
    VL(x, y - h, y, c);
    if (h > 2) P(x + (r() < 0.5 ? -1 : 1), y - h + 1, '#9ac870');
  }
}

// ================================================================ debris

reg('weeds', {
  solid: { x: -6, y: -5, w: 12, h: 4 },
  label: clearLabel,
  draw: (ctx, o) => {
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      art(
        `weeds|${v}`,
        16,
        16,
        () => {
          if (v === 0) {
            // tall grass clump with a dandelion
            const blades: [number, number, number][] = [
              [3, 9, -2],
              [5, 12, -1],
              [7, 14, 0],
              [9, 11, 1],
              [11, 13, 2],
              [13, 8, 3],
              [6, 8, 1],
              [10, 7, -1],
            ];
            for (const [x, h, lean] of blades) {
              L(x, 15, x + lean, 15 - h, x % 3 ? '#5e8a5a' : '#6f9a5a');
              P(x + lean, 15 - h, '#9ac870');
            }
            for (let x = 2; x < 14; x++) P(x, 15, '#4f7a5a');
            VL(8, 4, 14, '#6f9a5a');
            circ(8, 3, 1.8, '#ffd050');
            P(7, 2, '#fff1c2');
            P(9, 4, '#e2b244');
          } else if (v === 1) {
            // thistle: spiky leaves and a purple flower
            for (const [x, y, s] of [
              [4, 13, -1],
              [12, 13, 1],
              [5, 9, -1],
              [11, 9, 1],
            ] as [number, number, number][]) {
              L(8, y, x, y - 2, '#5e8a5a');
              L(8, y + 1, x - s, y - 1, '#6f9a5a');
              P(x - s, y - 3, '#9ac870');
            }
            VL(8, 4, 15, '#4f7a5a');
            ell(8, 4, 2.5, 1.5, '#8ab060');
            for (let x = 6; x <= 10; x++) P(x, 2 - (x === 8 ? 1 : 0), x % 2 ? '#b070d0' : '#d090f0');
            P(8, 1, '#e8b0ff');
          } else {
            // bramble mound with tiny white flowers
            ell(8, 11, 7, 5, '#4f7a5a');
            ell(7, 10, 5.5, 3.6, '#6f9a5a');
            ell(6, 9, 3, 2, '#8ab868');
            for (const [x, y] of [
              [4, 9],
              [9, 7],
              [12, 11],
              [6, 13],
              [11, 8],
            ])
              stampRows(['.w.', 'wyw', '.w.'], { w: '#fffaf0', y: '#ffd050' }, x - 1, y - 1);
            P(13, 12, '#a8344a');
            P(3, 12, '#a8344a');
          }
        },
        { shadow: [['e', 9, 15, 6, 2]], shA: 70 },
      ),
    );
  },
});

reg('junk', {
  solid: { x: -11, y: -10, w: 22, h: 9 },
  label: clearLabel,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'junk',
        24,
        20,
        () => {
          // an old rusty washing machine on its side + a busted TV + a hubcap
          RR(1, 4, 13, 14, 2, '#d8d0c0');
          R(1, 4, 13, 14, (x, y, c) => (hash2(x, y, 301) < 0.22 ? (hash2(x, y, 302) < 0.5 ? '#b8784a' : '#a85a3a') : c));
          HL(2, 12, 4, '#f2eade');
          circ(7.5, 11, 4, '#6e688e');
          circ(7.5, 11, 3, '#4a4462');
          P(6, 9, '#9aa2c8');
          R(1, 17, 13, 1, '#8a7a7a');
          // TV with a cracked screen leaning on it
          RR(12, 8, 11, 10, 1, '#8a5a3e');
          R(13, 9, 7, 6, '#4a4a5a');
          L(14, 10, 18, 14, '#9aa2c8');
          L(16, 9, 15, 13, '#9aa2c8');
          circ(21, 11, 0.8, '#d8c8b0');
          // hubcap + a lone boot + a coil of hose
          ell(19, 18, 3, 1.4, '#d8dcf0');
          P(18, 18, '#ffffff');
          R(2, 1, 4, 3, '#6a3e30');
          R(5, 2, 2, 2, '#6a3e30');
          curve(10, 3, 14, 6, 1, '#3f8a5a');
          curve(14, 6, 9, 7, -1, '#3f8a5a');
          // weeds growing through it all
          tufts(0, 24, 19, 303, 0.6);
          VL(15, 2, 7, '#6f9a5a');
          P(15, 1, '#ffd050');
        },
        { shadow: [['r', 2, 16, 23, 5]] },
      ),
    ),
});

reg('stone', {
  solid: { x: -7, y: -7, w: 14, h: 6 },
  label: clearLabel,
  draw: (ctx, o) => {
    const v = variant(o, 2);
    blit(
      ctx,
      o,
      art(
        `stone|${v}`,
        16,
        14,
        () => {
          const c = v ? '#9a92a8' : '#a8a0b0';
          poly(
            [
              [1, 13],
              [1, 8],
              [4, 3],
              [9, 1],
              [13, 3],
              [15, 8],
              [15, 13],
            ],
            c,
          );
          poly(
            [
              [3, 7],
              [5, 3],
              [9, 2],
              [11, 4],
              [7, 6],
            ],
            liA(c, 0.3),
          );
          poly(
            [
              [11, 13],
              [12, 7],
              [15, 8],
              [15, 13],
            ],
            shA(c, 0.22),
          );
          L(6, 8, 9, 11, shA(c, 0.3));
          P(5, 4, '#fff6e6');
          // moss on top
          for (const [x, y] of [
            [8, 2],
            [9, 2],
            [10, 3],
            [7, 3],
            [11, 3],
          ])
            P(x, y, x % 2 ? '#6f9a5a' : '#8ab868');
          tufts(0, 16, 13, 311 + v, 0.5);
        },
        { shadow: [['e', 9, 13, 7, 2]] },
      ),
    );
  },
});

reg('stump', {
  solid: { x: -7, y: -8, w: 14, h: 7 },
  label: clearLabel,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'stump',
        16,
        14,
        () => {
          // bark sides with roots
          R(2, 4, 12, 8, '#7a4a38');
          for (let x = 3; x < 14; x += 2) VL(x, 5, 11, '#5e3830');
          VL(2, 4, 11, '#9a6a4a');
          poly(
            [
              [0, 13],
              [2, 9],
              [4, 13],
            ],
            '#6a4030',
          );
          poly(
            [
              [12, 13],
              [14, 9],
              [16, 13],
            ],
            '#5e3830',
          );
          // cut top with growth rings
          ell(8, 4, 6, 2.6, '#d8a870');
          ell(8, 4, 4.4, 1.8, '#c89060');
          ell(8, 4, 2.8, 1.1, '#d8a870');
          P(8, 4, '#a87048');
          L(8, 4, 12, 3, '#8a5a3e');
          // little mushrooms at the foot
          for (const x of [11, 13]) {
            VL(x, 11, 12, '#f2eade');
            HL(x - 1, x + 1, 10, '#d8434b');
            P(x, 10, '#ffffff');
          }
          tufts(0, 16, 13, 321, 0.5);
        },
        { shadow: [['e', 9, 13, 7, 2]] },
      ),
    ),
});

reg('old-tire', {
  solid: { x: -7, y: -7, w: 14, h: 6 },
  label: clearLabel,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'old-tire',
        16,
        12,
        () => {
          // tire lying flat: tread ring, sidewall, rainwater in the middle
          ell(8, 7, 7.5, 4.5, '#3a3448');
          ell(8, 6.5, 7, 4, '#4e4862');
          for (let k = 0; k < 14; k++) {
            const a = (k / 14) * Math.PI * 2;
            P(8 + Math.cos(a) * 6.5, 6.5 + Math.sin(a) * 3.6, '#3a3448');
          }
          ell(8, 6.5, 3.6, 1.8, '#2b2140');
          ell(8, 6.8, 3, 1.3, '#5a7ab0');
          P(7, 6, '#a8c8f0');
          HL(3, 6, 4, '#6e688e');
          // weeds poking through the hole and around
          VL(9, 2, 6, '#6f9a5a');
          P(10, 2, '#8ab868');
          tufts(0, 16, 11, 331, 0.4);
        },
        { shadow: [['e', 9, 10, 7, 2]] },
      ),
    ),
});

// ================================================================ the backyard ring

type RingState = 'overgrown' | 'clean' | 'deluxe';
function ringState(o: MapObject): RingState {
  const s = o.props.state;
  return s === 'clean' || s === 'deluxe' ? s : 'overgrown';
}
const LED = ['#ff5d8f', '#ffd050', '#5ff2d6', '#a888ff'];

function backyardRing(state: RingState, f: number): void {
  const over = state === 'overgrown';
  const deluxe = state === 'deluxe';
  const st: RingStyle = {
    W: 96,
    H: 72,
    mx: 6,
    my: 15,
    mw: 84,
    mh: 37,
    apron: 18,
    ropes: over ? ['#a87a6a', '#c8bcae', '#7a7a9a'] : ['#e8404e', '#f6f0f4', '#4a6ad0'],
    sag: over ? 3 : 0,
    post: over ? ['#b89a8a', '#8a6a5a', '#5a4040'] : deluxe ? ['#f2eef6', '#c8cce0', '#7a80a8'] : ['#d8dcf0', '#9aa2c8', '#5a6290'],
    pads: over ? ['#8a5a5a', '#c8b8a0', '#5a5a7a'] : ['#d8404e', '#f6f0f4', '#4a6ad0'],
    mat: over ? '#cbbfa8' : '#efe6d6',
    skirt: over ? '#5a5a7a' : deluxe ? '#3a3478' : '#4a5a9a',
    postH: 17,
  };
  drawRing(
    st,
    () => {
      const { mx, my, mw, mh } = st;
      if (over) {
        // stained, faded canvas: water marks, fallen leaves, a patch of moss, weeds through the boards
        R(mx, my, mw, mh, (x, y, c) => {
          const h = hash2(x >> 2, y >> 2, 341);
          return h < 0.25 ? mixc(c, '#a89a80', 0.4) : h > 0.9 ? mixc(c, '#e0d6c0', 0.5) : c;
        });
        ell(30, 30, 8, 4, (_x, _y, c) => mixc(c, '#9a8a6a', 0.35));
        const r = rng(342);
        for (let k = 0; k < 26; k++) {
          const x = mx + 2 + Math.floor(r() * (mw - 4));
          const y = my + 2 + Math.floor(r() * (mh - 4));
          const c = ['#d8843a', '#c8603a', '#e8b050', '#a8582a'][k % 4];
          P(x, y, c);
          P(x + 1, y, shA(c, 0.2));
          if (k % 3 === 0) P(x, y + 1, c);
        }
        ell(64, 40, 6, 3, '#7a9a5a');
        ell(63, 39, 4, 2, '#8ab060');
        // a tear in the canvas with grass coming through
        L(44, 22, 52, 24, '#8a7a60');
        tufts(46, 51, 24, 343, 0.8);
        // the faded painted star from Grandma's day, center ring
        stampRows(['....#....', '...###...', '#########', '.#######.', '..#####..', '.##...##.', '##.....##'], { '#': '#d8c090' }, 44, 27);
      } else {
        // clean canvas with the Duchess star repainted bright
        stampRows(['....#....', '...###...', '#########', '.#######.', '..#####..', '.##...##.', '##.....##'], { '#': deluxe ? '#ffd050' : '#f2b84a' }, 44, 27);
        P(48, 28, '#fff4c0');
        HL(mx + 3, mx + mw - 4, my + mh - 3, '#ddd2c0');
        if (deluxe) {
          // fresh ACW logo around the star
          ell(48, 30, 18, 8, (_x, _y, c) => (dth(_x, _y, 3) ? mixc(c, '#d8cce8', 0.5) : c));
        }
      }
    },
    () => {
      const y = st.my + st.mh + 2;
      if (over) {
        // torn, faded skirt: patches, a hole, mud splash, the old hand-painted name barely there
        R(st.mx - 2, y + 2, st.mw + 4, st.apron - 4, (x, yy, c) => (hash2(x >> 1, yy, 344) < 0.2 ? mixc(c, '#8a8aa0', 0.4) : c));
        T('DUPREE', 30, y + 6, '#7a7a96', FT, { ls: 2 });
        R(16, y + 4, 6, 5, '#8a6a5a');
        P(17, y + 5, '#c8a888');
        R(70, y + 9, 4, 4, '#2b2140');
        R(st.mx - 2, y + 12, st.mw + 4, 3, (x, yy, c) => (dth(x, yy, 8) ? '#7a5a40' : c));
        tufts(st.mx - 2, st.mx + st.mw + 2, y + st.apron - 1, 345, 0.7);
      } else {
        TC(deluxe ? 'THE DUCHESS' : 'DUPREE', 48, y + 6, '#ffd560', FT, { ls: deluxe ? 0 : 1 });
        for (const sx of [12, 80]) stampRows(['..#..', '.###.', '#####', '.###.', '.#.#.'], { '#': '#f6f0f4' }, sx, y + 5);
      }
    },
  );
  if (over) {
    // vines climbing the posts and wrapping the ropes, a bird's nest on a turnbuckle
    const vine = (x: number, y0: number, y1: number, seed: number) => {
      for (let y = y0; y < y1; y++) {
        const dx = Math.round(Math.sin(y * 0.8 + seed) * 1.5);
        P(x + dx, y, '#4f7a5a');
        if ((y + seed) % 3 === 0) {
          P(x + dx - 1, y, '#8ab868');
          P(x + dx + 1, y - 1, '#6f9a5a');
        }
      }
    };
    vine(6, 34, 70, 1);
    vine(89, 36, 70, 2);
    vine(8, 0, 14, 3);
    for (let x = 12; x < 86; x += 1) {
      const y = 48 - Math.round(4 * 3 * ((x - 9) / 78) * (1 - (x - 9) / 78) * 4) + Math.round(Math.sin(x * 0.7) * 1);
      if (x % 2 === 0) P(x, y, x % 6 === 0 ? '#8ab868' : '#4f7a5a');
      if (x % 9 === 0) {
        P(x, y - 1, '#ff94b4');
        P(x + 1, y, '#ffb0c8');
      }
    }
    // nest with three eggs on the back-right turnbuckle
    ell(87, 6, 4, 1.8, '#8a6a4a');
    ell(87, 5.5, 3, 1, '#5a4030');
    P(86, 5, '#c8e8f0');
    P(88, 5, '#c8e8f0');
    P(87, 4, '#e8f8ff');
    tufts(0, 96, 71, 346, 0.8);
  } else if (deluxe) {
    // LED post caps cycling through colours + string lights between the back posts
    const backTop = st.my - (st.postH - 4) - 2;
    const frontTop = st.my + st.mh + 2 - st.postH - 2;
    for (const [x, y] of [
      [st.mx, backTop],
      [st.mx + st.mw - 4, backTop],
      [st.mx - 1, frontTop],
      [st.mx + st.mw - 3, frontTop],
    ] as [number, number][]) {
      const c = LED[(f + x) % 4];
      RR(x - 1, y, 6, 3, 1, c);
      HL(x, x + 3, y, '#ffffff');
    }
    curve(st.mx + 4, backTop + 2, st.mx + st.mw - 3, backTop + 2, 5, '#4a3550', (x, y, _t, i) => {
      if (i % 6 === 3) {
        const c = LED[((i / 6) | 0) % 4 === f ? 1 : (((i / 6) | 0) + f) % 4];
        P(x, y + 1, c);
        P(x, y + 2, shA(c, 0.3));
      }
    });
  }
}

reg('backyard-ring', {
  solid: { x: -48, y: -20, w: 96, h: 20 },
  // sorts by the back edge of the mat so anyone on the mat draws over it
  sortY: -58,
  lights: (o) =>
    ringState(o) === 'deluxe'
      ? [light(o, -41, -60, 26, '#ff7ab8'), light(o, 39, -60, 26, '#5ff2d6'), light(o, -42, -22, 26, '#ffd050'), light(o, 40, -22, 26, '#a888ff'), light(o, 0, -60, 40, '#ffe8b0')]
      : [],
  draw: (ctx, o, t) => {
    const s = ringState(o);
    const f = s === 'deluxe' ? frame(t, 4, 2, phaseOf(o)) : 0;
    blit(ctx, o, art(`backyard-ring|${s}|${f}`, 96, 72, () => backyardRing(s, f), { shadow: [['r', 3, 68, 95, 6]] }));
  },
});

// ================================================================ training equipment

reg('heavy-bag', {
  solid: { x: -7, y: -5, w: 14, h: 4 },
  label: () => 'Train',
  draw: (ctx, o, t) => {
    const f = Math.round(Math.sin(t * 1.8 + phaseOf(o)) * 0.8);
    blit(
      ctx,
      o,
      art(
        `heavy-bag|${f}`,
        16,
        32,
        () => {
          // wooden stand: post + arm, chain, red leather bag with tape bands
          R(1, 2, 2, 29, HONEY.b);
          VL(1, 2, 30, HONEY.l);
          R(0, 2, 14, 2, HONEY.b);
          HL(0, 13, 2, HONEY.l);
          R(0, 29, 5, 2, HONEY.s);
          L(10, 4, 10 + f, 8, '#9aa2c8');
          L(10, 4, 10 + f, 8, '#9aa2c8');
          const bx = 6 + f;
          RR(bx, 8, 9, 20, 3, '#c9404c');
          VL(bx + 1, 10, 25, '#e8706a');
          VL(bx + 7, 10, 25, '#8e2c48');
          for (const y of [11, 24]) {
            HL(bx, bx + 8, y, '#fbf6ea');
            HL(bx, bx + 8, y + 1, '#d8d0c4');
          }
          T('A', bx + 3, 15, '#ffd050', FT, {});
          tufts(0, 16, 31, 351, 0.4);
        },
        { shadow: [['e', 11, 31, 6, 2]] },
      ),
    );
  },
});

function tire(x: number, y: number, w: number, seed: number): void {
  // tire on its side seen in 3/4: dark ellipse band with tread
  ell(x + w / 2, y + 3, w / 2, 3.5, '#3a3448');
  ell(x + w / 2, y + 2.4, w / 2 - 0.5, 3, '#4e4862');
  ell(x + w / 2, y + 2.4, w / 2 - 4, 1.4, '#2b2140');
  R(x + 1, y + 3, w - 2, 3, '#3a3448');
  for (let k = x + 2; k < x + w - 2; k += 2) P(k, y + 5, '#2b2140');
  HL(x + 3, x + 6, y + 1, '#6e688e');
  void seed;
}
reg('tire-stack', {
  solid: { x: -9, y: -8, w: 18, h: 7 },
  label: () => 'Train',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'tire-stack',
        20,
        20,
        () => {
          tire(1, 12, 18, 1);
          tire(2, 7, 16, 2);
          tire(1, 2, 18, 3);
          // a painted white stripe on the top tire + a water bottle
          HL(5, 14, 3, '#fbf6ea');
          R(15, 0, 2, 4, '#5ec0a8');
          P(15, -1, '#fbf6ea');
          tufts(0, 20, 19, 361, 0.5);
        },
        { shadow: [['e', 12, 18, 9, 2.5]] },
      ),
    ),
});

reg('weight-bench', {
  solid: { x: -15, y: -10, w: 30, h: 9 },
  label: () => 'Train',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'weight-bench',
        32,
        20,
        () => {
          // uprights + barbell with mismatched plates
          for (const x of [7, 24]) {
            R(x, 2, 2, 14, '#9aa2c8');
            VL(x, 2, 15, '#d8dcf0');
            R(x - 1, 5, 4, 1, '#6e688e');
          }
          HL(0, 31, 4, '#d8dcf0');
          HL(0, 31, 5, '#9aa2c8');
          for (const [x, c, h] of [
            [1, '#d8434b', 8],
            [4, '#3a3448', 6],
            [27, '#3a3448', 6],
            [29, '#4a6ad0', 8],
          ] as [number, Color, number][]) {
            R(x, 5 - h / 2, 2, h, c);
            VL(x, 5 - h / 2, 4 + h / 2, liA(c, 0.3));
          }
          // padded bench on a steel frame
          RR(9, 9, 14, 4, 1, '#d8434b');
          HL(10, 21, 9, '#ff8a80');
          R(9, 12, 14, 2, '#a8344a');
          R(11, 14, 2, 5, '#6e688e');
          R(19, 14, 2, 5, '#6e688e');
          HL(8, 24, 18, '#4e4870');
          // a towel draped on the end
          R(20, 8, 4, 5, '#fbf6ea');
          HL(20, 23, 11, '#3f9a92');
          tufts(0, 32, 19, 371, 0.4);
        },
        { shadow: [['r', 2, 16, 31, 5]] },
      ),
    ),
});

reg('trampoline', {
  solid: { x: -15, y: -12, w: 30, h: 11 },
  label: () => 'Train',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'trampoline',
        32,
        20,
        () => {
          // legs
          for (const x of [3, 15, 27]) {
            R(x, 10, 2, 9, '#6e688e');
            VL(x, 10, 18, '#9aa2c8');
          }
          // blue safety pad ring + springs + black bed
          ell(16, 8, 15.5, 7.5, '#3f7ad0');
          ell(16, 7.5, 15, 7, '#5a9ae8');
          ell(16, 8, 12, 5, '#d8dcf0');
          for (let k = 0; k < 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            P(16 + Math.cos(a) * 12.5, 8 + Math.sin(a) * 5.4, '#9aa2c8');
          }
          ell(16, 8, 11, 4.4, '#2b2140');
          ell(14, 7, 6, 2, '#3a3050');
          // a star sticker on the pad, a dropped sneaker
          stampRows(['.#.', '###', '.#.'], { '#': '#ffd050' }, 4, 9);
          R(26, 17, 4, 2, '#fbf6ea');
          P(26, 17, '#d8434b');
          tufts(0, 32, 19, 381, 0.3);
        },
        { shadow: [['e', 18, 17, 15, 3]] },
      ),
    ),
});

reg('rope-lane', {
  flat: true,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'rope-lane',
        48,
        16,
        () => {
          // agility rope ladder pegged into the grass, cones at either end
          for (const y of [3, 12]) {
            HL(4, 43, y, '#f6d38a');
            HL(4, 43, y + 1, '#c8963a');
          }
          for (let x = 6; x < 44; x += 6) {
            VL(x, 4, 12, '#e8404e');
            VL(x + 1, 4, 12, '#a8344a');
          }
          for (const [x, y] of [
            [4, 3],
            [43, 3],
            [4, 12],
            [43, 12],
          ])
            P(x, y, '#6e688e');
          for (const x of [1, 46]) {
            poly(
              [
                [x - 1, 11],
                [x, 5],
                [x + 1, 5],
                [x + 2, 11],
              ],
              '#ff8a3a',
            );
            HL(x - 1, x + 2, 8, '#fbf6ea');
            HL(x - 2, x + 3, 11, '#c8602a');
          }
        },
        { outline: false },
      ),
    ),
});

reg('speed-bag', {
  solid: { x: -6, y: -4, w: 12, h: 3 },
  label: () => 'Train',
  draw: (ctx, o, t) => {
    const f = frame(t, 3, 6, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `speed-bag|${f}`,
        16,
        28,
        () => {
          // post + round platform + swivel + bouncing teardrop bag
          R(2, 4, 2, 23, '#6e688e');
          VL(2, 4, 26, '#9aa2c8');
          R(0, 26, 6, 2, '#4e4870');
          R(1, 3, 14, 3, WALNUT.b);
          HL(1, 14, 3, WALNUT.l);
          HL(1, 14, 5, WALNUT.d);
          P(10, 6, '#9aa2c8');
          const off = [0, 2, -1][f];
          const bx = 10 + off;
          L(10, 6, bx, 8, '#9aa2c8');
          ell(bx, 10.5, 2.4, 3.2, '#d8434b');
          P(bx - 1, 9, '#ff8a80');
          VL(bx + 1, 10, 12, '#8e2c48');
          if (f === 1) {
            P(14, 8, '#fff4c0');
            P(15, 10, '#fff4c0');
          }
        },
        { shadow: [['e', 4, 27, 4, 1.4]] },
      ),
    );
  },
});

// ================================================================ machines

reg('merch-press', {
  solid: { x: -11, y: -9, w: 22, h: 8 },
  label: (o) => (o.props.ready ? 'Collect' : 'Use'),
  lights: (o) => (o.props.ready ? [light(o, 0, -14, 24, '#fff0b0')] : []),
  draw: (ctx, o, t) => {
    const ready = !!o.props.ready;
    const f = ready ? frame(t, 8, 6, phaseOf(o)) : 0;
    blit(
      ctx,
      o,
      art(
        `merch-press|${ready ? 1 : 0}|${f}`,
        24,
        24,
        () => {
          // little workbench
          R(0, 12, 24, 3, OAK.l);
          HL(0, 23, 12, liA(OAK.l, 0.3));
          R(0, 15, 24, 2, OAK.s);
          for (const x of [1, 21]) R(x, 17, 2, 7, OAK.b);
          HL(3, 20, 21, OAK.s);
          // clamshell heat press: base platen, arm, upper platen
          R(4, 9, 16, 3, '#4e4870');
          HL(4, 19, 9, '#6e688e');
          if (ready) {
            // the press is open, a finished shirt sits on the platen
            R(4, 2, 16, 3, '#9aa2c8');
            HL(4, 19, 2, '#d8dcf0');
            L(19, 4, 22, 0, '#6e688e');
            const sc = '#e8404e';
            poly(
              [
                [7, 6],
                [10, 5],
                [14, 5],
                [17, 6],
                [18, 8],
                [16, 9],
                [16, 11],
                [8, 11],
                [8, 9],
                [6, 8],
              ],
              sc,
            );
            HL(10, 13, 5, '#fbf6ea');
            stampRows(['.#.', '###', '.#.'], { '#': '#ffd050' }, 11, 7);
          } else {
            // closed, a stack of blank shirts waiting beside it
            R(4, 6, 16, 3, '#9aa2c8');
            HL(4, 19, 6, '#d8dcf0');
            L(18, 6, 22, 2, '#6e688e');
            R(1, 7, 3, 5, '#fbf6ea');
            HL(1, 3, 9, '#e0d8cc');
          }
          // control box with a dial and a red light
          R(20, 7, 4, 5, '#3a3448');
          P(21, 8, ready ? '#7fe8a8' : '#ff5050');
          circ(22, 10, 0.8, '#d8dcf0');
          RR(21, 0, 3, 3, 1, '#2b2140');
          if (ready && f < 3) sparkle(15 - f, 6, f === 1);
        },
        { shadow: [['r', 2, 21, 23, 4]] },
      ),
    );
  },
});

reg('sewing-machine', {
  solid: { x: -9, y: -8, w: 18, h: 7 },
  label: () => 'Sew',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'sewing-machine',
        20,
        20,
        () => {
          // treadle table with iron legs
          R(0, 10, 20, 3, WALNUT.l);
          HL(0, 19, 10, liA(WALNUT.l, 0.3));
          R(0, 13, 20, 2, WALNUT.s);
          for (const x of [1, 17]) {
            L(x, 15, x + 1, 19, '#3a3448');
            L(x + 1, 15, x, 19, '#3a3448');
          }
          R(5, 17, 10, 2, '#4e4870');
          // vintage mint machine with gold decals
          R(3, 6, 14, 4, '#a9d8bf');
          R(3, 2, 4, 5, '#a9d8bf');
          R(3, 2, 12, 3, '#a9d8bf');
          HL(3, 14, 2, '#d8f0e0');
          R(13, 5, 2, 4, '#7fb2a6');
          VL(14, 5, 7, '#d8dcf0');
          P(14, 9, '#d8dcf0');
          HL(8, 12, 3, PAL.gold2);
          P(4, 7, PAL.gold2);
          // hand wheel + spool of red thread
          circ(4, 4, 1.6, '#9aa2c8');
          R(9, 0, 2, 2, '#d8434b');
          P(9, 0, '#ff8a80');
          // fabric being sewn: sequined purple
          R(9, 9, 9, 2, '#b448a8');
          P(11, 9, '#ffd8f8');
          P(15, 10, '#ffffff');
          // pin cushion
          circ(1.5, 9, 1.4, '#d8434b');
          P(1, 8, '#d8dcf0');
        },
        { shadow: [['r', 2, 17, 19, 4]] },
      ),
    ),
});

// ================================================================ yard

reg('garden-bed', {
  solid: { x: -16, y: -9, w: 32, h: 8 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'garden-bed',
        32,
        16,
        () => {
          const wd = HONEY;
          // raised bed: plank frame around dark soil
          R(0, 4, 32, 12, wd.b);
          HL(0, 31, 4, wd.l);
          R(2, 5, 28, 7, '#5a3a30');
          R(2, 5, 28, 7, (x, y, c) => (hash2(x, y, 401) < 0.2 ? '#6e4a3a' : (x + y) % 5 === 0 ? '#4a2c28' : c));
          R(0, 12, 32, 4, wd.b);
          HL(0, 31, 12, wd.l);
          HL(0, 31, 15, wd.d);
          for (const x of [0, 15, 30]) R(x, 4, 2, 12, wd.s);
          // lettuce, carrot tops, a staked tomato plant
          for (const x of [5, 9]) {
            circ(x, 7, 2, '#8ab868');
            circ(x - 0.5, 6.5, 1.2, '#b4d48e');
          }
          for (const x of [14, 16, 18]) {
            VL(x, 4, 8, '#6f9a5a');
            P(x - 1, 4, '#8ab868');
            P(x + 1, 5, '#8ab868');
            P(x, 9, '#e8843a');
          }
          VL(25, 0, 9, '#c8a070');
          circ(25, 4, 3, '#5e8a5a');
          circ(24, 3, 1.6, '#6f9a5a');
          for (const [x, y] of [
            [23, 5],
            [26, 3],
            [27, 6],
          ]) {
            P(x, y, '#e8404e');
            P(x, y - 1, '#ff8a80');
          }
          // hand-painted seed marker
          R(29, 1, 2, 3, '#fbf6ea');
          VL(30, 4, 8, '#c8a070');
        },
        { shadow: [['r', 2, 13, 31, 4]] },
      ),
    ),
});

reg('clothesline', {
  label: () => null,
  draw: (ctx, o, t) => {
    const f = frame(t, 2, 1.5, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `clothesline|${f}`,
        48,
        32,
        () => {
          // two T-posts and a sagging line
          for (const x of [2, 45]) {
            R(x, 4, 2, 28, '#9a8a8a');
            VL(x, 4, 31, '#c8b8b8');
            R(x - 2, 4, 6, 2, '#9a8a8a');
            HL(x - 2, x + 3, 4, '#c8b8b8');
          }
          curve(3, 6, 46, 6, 4, '#e8e0d0');
          // laundry pegged on, gently swaying: a singlet, a towel, socks, Grandma's flowered apron
          const sag = (x: number) => Math.round(6 + 4 * 4 * ((x - 3) / 43) * (1 - (x - 3) / 43));
          const sway = f ? 1 : 0;
          const hang = (x: number, w: number, h: number, c: Color, deco: (x0: number, y0: number) => void) => {
            const y0 = sag(x + w / 2) + 1;
            poly(
              [
                [x, y0],
                [x + w, y0],
                [x + w + sway, y0 + h],
                [x + sway, y0 + h],
              ],
              c,
            );
            HL(x, x + w - 1, y0, liA(c, 0.3));
            P(x + 1, y0 - 1, '#c8a070');
            P(x + w - 2, y0 - 1, '#c8a070');
            deco(x, y0);
          };
          hang(6, 7, 11, '#d8434b', (x, y) => {
            R(x + 2, y, 3, 2, '#e8e0d0');
            HL(x, x + 6, y + 6, '#ffd050');
          });
          hang(15, 9, 9, '#5ec0a8', (x, y) => {
            HL(x, x + 8, y + 6, '#fbf6ea');
            HL(x, x + 8, y + 7, '#fbf6ea');
          });
          hang(26, 3, 5, '#fbf6ea', (x, y) => P(x, y + 4, '#d8434b'));
          hang(30, 3, 5, '#f6d38a', (x, y) => P(x, y + 4, '#4a6ad0'));
          hang(35, 8, 12, '#93a8cf', (x, y) => {
            for (let k = 0; k < 6; k++) P(x + 1 + ((k * 3) % 7), y + 2 + k * 2, k % 2 ? '#f6ecd8' : '#ee98a6');
            HL(x + 1, x + 7, y + 5, '#fbf6ea');
          });
          // laundry basket + tufts
          RR(19, 25, 10, 6, 2, '#d8a870');
          for (let x = 20; x < 28; x += 2) VL(x, 26, 30, '#b8885a');
          R(20, 23, 8, 3, '#fbf6ea');
          P(23, 23, '#ff94b4');
          tufts(0, 48, 31, 411, 0.4);
        },
        { shadow: [['e', 4, 31, 3, 1.4], ['e', 47, 31, 3, 1.4], ['r', 20, 29, 11, 3]] },
      ),
    );
  },
});

reg('mailbox-home', {
  solid: { x: -4, y: -4, w: 8, h: 3 },
  label: () => 'Check',
  draw: (ctx, o, t) => {
    const flag = Math.floor((t + phaseOf(o)) / 3) % 4 !== 3 ? 1 : 0;
    blit(
      ctx,
      o,
      art(
        `mailbox-home|${flag}`,
        12,
        20,
        () => {
          // weathered post with a vine
          R(5, 8, 2, 12, '#8a6a4a');
          VL(5, 8, 19, '#a8845a');
          for (let y = 10; y < 19; y += 2) P(4 + (y % 4 === 0 ? 0 : 3), y, '#6f9a5a');
          // rural mailbox: rounded top, faded blue paint, DUPREE stencil, red flag
          RR(0, 1, 11, 8, 3, '#7a8ab8');
          HL(2, 8, 1, '#a8b8e0');
          R(0, 4, 11, 4, (x, y, c) => (hash2(x, y, 421) < 0.15 ? '#a8a0a0' : c));
          R(0, 2, 2, 6, '#5a6a98');
          HL(1, 9, 8, '#4a5888');
          T('DD', 3, 3, '#e8e0f0', FT, {});
          if (flag) {
            R(10, 0, 1, 5, '#d8434b');
            R(10, 0, 2, 2, '#e8404e');
          } else R(10, 5, 2, 1, '#d8434b');
          tufts(2, 11, 19, 422, 0.6);
        },
        { shadow: [['e', 7, 19, 4, 1.5]] },
      ),
    );
  },
});
