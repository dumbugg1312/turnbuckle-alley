import { blit, tick } from '../gfx/world/buildings';
import { dart, H1, L1, shadowF, stroke, V1 } from '../gfx/world/props';
import { AK, ell, liA, P, P1, poly, R, RR, shA } from '../gfx/kit';
import { registerObject } from '../world/registry';

/**
 * Small props the morning surprises and the first evening put into the world
 * at runtime (no map file changes): things left on the porch, Pip's flyer,
 * Hank's hound, a pie on the sill, the drawings on Grandma's fridge, and an
 * invisible hotspot for the porch rocker. Same dense pixel kit and outline as
 * the town's own props.
 */

const PAPER = '#f4ebd6';
const INK = '#5b4a63';

// ------------------------------------------------------------ invisible hotspot
registerObject('sx-hotspot', {
  hit: { x: -9, y: -28, w: 18, h: 28 },
  label: (o) => (typeof o.props.label === 'string' ? o.props.label : null),
  draw: () => {},
});
registerObject('sx-hotspot-wide', {
  hit: { x: -40, y: -28, w: 80, h: 28 },
  label: (o) => (typeof o.props.label === 'string' ? o.props.label : null),
  draw: () => {},
});

// ------------------------------------------------------------ porch bundles
type Bundle = { w: number; h: number; draw: () => void };
const BUNDLES: Record<string, Bundle> = {
  thermos: {
    w: 11,
    h: 10,
    draw: () => {
      // a folded note under a plaid thermos
      poly([[0, 8.5], [6, 7], [7.5, 9.5], [1.5, 10]], PAPER);
      H1(1.5, 5, 8.8, INK);
      RR(5, 0.5, 4.5, 9.5, 1, '#b04a3f');
      R(5, 0.5, 4.5, 1.5, '#e8e4dc');
      for (const y of [3, 5.5, 8]) H1(5, 9.5, y, '#2b5450');
      for (const x of [6.5, 8]) V1(x, 2, 10, '#7a5a5a');
      V1(5.5, 2, 9.5, liA('#b04a3f', 0.4));
      R(9, 2, 0.5, 8, shA('#b04a3f', 0.3));
    },
  },
  flowers: {
    w: 10,
    h: 13,
    draw: () => {
      // wildflowers in a coffee can
      const stems: [number, number, string][] = [[2, 1.5, '#f4b63f'], [4.5, 0, '#e2445a'], [7, 1, '#fbf0d9'], [3.5, 3, '#b8a0d8'], [6.5, 3.5, '#f4b63f']];
      for (const [x, y, c] of stems) {
        L1(5, 7, x, y + 1, '#5a8a4a');
        ell(x, y + 1, 1.2, 1, c);
        P1(x, y + 1, liA(c, 0.4));
      }
      RR(1.5, 6.5, 7, 6.5, 0.5, '#a8a2b8');
      R(1.5, 8, 7, 3, '#b04a3f');
      H1(2, 8, 9.2, '#f4b63f');
      V1(2, 7, 12.5, '#e8e4f0');
      R(7.5, 7, 1, 6, shA('#a8a2b8', 0.25));
    },
  },
  program: {
    w: 12,
    h: 5,
    draw: () => {
      // a rolled-up show program with a rubber band
      RR(0, 0.5, 12, 4, 2, '#efdcae');
      ell(0.8, 2.5, 0.8, 2, '#f8ebc8');
      ell(0.8, 2.5, 0.35, 1, shA('#efdcae', 0.3));
      H1(1, 11, 1.2, liA('#efdcae', 0.5));
      R(1, 3.5, 11, 1, shA('#efdcae', 0.15));
      R(6, 0.5, 1, 4, '#b04a3f');
      for (let x = 2; x < 11; x += 1.5) P1(x, 2.5, '#d8a890');
    },
  },
  planks: {
    w: 15,
    h: 7,
    draw: () => {
      // three offcuts, stacked, a note nailed to the top one
      const wood = ['#b07a50', '#c88a5a', '#a06a44'];
      R(0, 4.5, 14, 2.5, wood[2]);
      R(1, 2, 13, 2.5, wood[0]);
      R(0.5, 0, 12, 2, wood[1]);
      for (const y of [0, 2, 4.5]) H1(0.5, 13.5, y, liA('#c88a5a', 0.35));
      H1(1, 13, 6.5, shA('#a06a44', 0.3));
      poly([[8, -0.5], [12, -1], [12.5, 2], [8.5, 2.2]], PAPER);
      H1(8.8, 11.6, 0.5, INK);
      P1(10.2, -0.3, '#8a8aa0');
    },
  },
  foil: {
    w: 11,
    h: 6,
    draw: () => {
      // tamales in foil, a little paper on top
      RR(0, 1, 11, 5, 1.5, '#c8c4d4');
      for (let x = 1; x < 10; x += 2) L1(x, 1.5, x + 1, 5, '#e8e4f0');
      for (let x = 2; x < 10; x += 2.5) L1(x, 1.5, x - 0.5, 5, '#9a96ac');
      H1(1, 10, 1.2, '#f2eef6');
      poly([[3, 0], [7, -0.5], [7.5, 2.5], [3.5, 2.8]], PAPER);
      H1(3.8, 6.5, 1, INK);
      H1(3.8, 5.5, 1.8, INK);
    },
  },
  cape: {
    w: 14,
    h: 6,
    draw: () => {
      // Pip's bath-towel cape, blown into the weeds
      poly([[0, 5], [3, 1], [8, 0], [13, 2], [14, 5.5], [7, 6]], '#4e6a93');
      for (const [x0, x1] of [[2, 3.5], [6, 7.5], [10, 11.5]]) poly([[x0, 5.8], [x0 + 1.5, 0.6], [x1 + 1.5, 0.8], [x1, 5.8]], '#f4b63f');
      H1(3, 12, 1.5, liA('#4e6a93', 0.4));
      L1(1, 5, 13, 5.2, shA('#4e6a93', 0.35));
      // the safety pin
      H1(2.5, 4.5, 2, '#e8e4f0');
      P1(4.5, 2, '#fffbe0');
    },
  },
  feather: {
    w: 14,
    h: 5,
    draw: () => {
      // a grey feather longer than your forearm
      L1(0, 4, 13.5, 1, '#e8e4dc');
      for (let i = 1; i < 12; i++) {
        const x = i * 1.05;
        const y = 4 - (i / 12) * 3;
        L1(x, y, x + 1.2, y - 1.6 + (i > 9 ? 0.6 : 0), '#9a96ac');
        L1(x, y, x + 1.4, y + 1.2 - (i > 9 ? 0.6 : 0), '#7a7690');
      }
      P1(13.5, 1, '#c8c4d4');
    },
  },
  honey: {
    w: 7,
    h: 8,
    draw: () => {
      // a jar of honey with a gingham top and a paper tag
      RR(0.5, 2, 6, 6, 1.5, '#e6a24a');
      R(1, 3, 1, 4, liA('#f4b63f', 0.5));
      R(5, 3, 1, 4.5, shA('#e6a24a', 0.3));
      poly([[0, 2.2], [3.5, 0], [7, 2.2], [3.5, 3]], '#d8434b');
      P1(2, 1.6, '#fbf0d9');
      P1(4.5, 1.2, '#fbf0d9');
      P1(3.5, 2.2, '#fbf0d9');
      R(2, 4.5, 3, 2, PAPER);
      H1(2.5, 4.5, 5.5, INK);
    },
  },
  parcel: {
    w: 10,
    h: 7,
    draw: () => {
      R(0, 1, 10, 6, '#c8a070');
      R(0, 1, 10, 1, liA('#c8a070', 0.35));
      R(9, 1, 1, 6, shA('#c8a070', 0.25));
      V1(4.8, 1, 7, '#f4ebd6');
      H1(0, 10, 3.8, '#f4ebd6');
      ell(4.8, 0.8, 1.4, 0.8, '#f4ebd6');
    },
  },
};

registerObject('sx-bundle', {
  hit: { x: -9, y: -14, w: 18, h: 16 },
  label: () => 'Pick up',
  draw: (ctx, o) => {
    const v = String(o.props.variant ?? 'parcel');
    const b = BUNDLES[v] ?? BUNDLES.parcel;
    const art = dart(`sx-bundle|${v}`, b.w, b.h, b.draw, { pad: [1, 2, 2, 2], shadow: (ox, oy) => shadowF(ox + b.w / 2, oy + b.h, b.w / 2 + 1, 1.6) });
    blit(ctx, art, o);
  },
});

// ------------------------------------------------------------ a pie cooling on the windowsill
function drawPie(f: number): () => void {
  return () => {
    // a whole cherry pie in a tin, seen from a little above: fluted crust, three steam slits
    ell(6, 8.6, 6, 1.5, '#9a96ac');
    ell(6, 8.1, 5.8, 1.5, '#c8c4d4');
    ell(6, 6.8, 5.6, 2.3, '#c8803a');
    ell(6, 6.4, 5.2, 2, '#e8a858');
    ell(5.4, 5.9, 3.6, 1.2, '#f4c47a');
    for (let i = 0; i < 9; i++) P1(1.2 + i * 1.2, 6.9 + Math.sin(i) * 0.4, '#b06a30');
    for (const [x, y] of [[4.2, 6.2], [6, 5.8], [7.8, 6.3]] as const) {
      L1(x - 0.5, y, x + 0.5, y - 0.3, '#8a2a3a');
      P1(x, y + 0.5, '#c0404a');
    }
    // steam, drifting
    const sx = [5, 6.5, 5.8][f];
    for (let k = 0; k < 3; k++) P1(sx + ((k + f) % 2) * 0.5, 3.6 - k * 1.1, '#f6efe6');
    P1(sx + 2, 2.4 - f * 0.4, '#e4dcec');
  };
}
registerObject('sx-pie', {
  // The pie sits on the sill; the anchor stays on the ground in front of the house so it sorts in front.
  hit: { x: -9, y: -34, w: 18, h: 34 },
  label: () => 'Take the pie',
  draw: (ctx, o, t) => {
    const f = Math.floor(tick(t) / 9) % 3;
    const art = dart(`sx-pie|${f}`, 12, 10, drawPie(f), { pad: [1, 1, 1, 1] });
    const lift = Number(o.props.lift ?? 20);
    blit(ctx, art, o, 0, -lift);
  },
});

// ------------------------------------------------------------ a flyer blowing across the yard
registerObject('sx-flyer', {
  hit: { x: -9, y: -16, w: 18, h: 18 },
  label: () => 'Catch it',
  draw: (ctx, o, t) => {
    const f = Math.floor(tick(t) / 5) % 4;
    const art = dart(`sx-flyer|${f}`, 9, 8, () => {
      const skew = [0, 1, 0, -1][f];
      const squash = [0, 1, 2, 1][f];
      poly([[0, 1 + skew], [8, 0 + squash * 0.5], [9, 7 - squash], [1, 8 - skew]], '#f8f2e0');
      H1(1.5, 7, 1.8 + skew * 0.5, '#b04a3f');
      for (let i = 0; i < 3; i++) H1(2, 7 - i, 3.5 + i * 1.2, INK);
      L1(0.5, 1 + skew, 1, 8 - skew, shA('#f8f2e0', 0.2));
    }, { pad: [1, 1, 1, 1] });
    const bob = Math.round(Math.sin(t * 3 + o.x * 0.1) * 2);
    // a little shadow on the ground, under the paper
    ctx.fillStyle = 'rgba(82,40,58,0.25)';
    ctx.fillRect(Math.round(o.x) - 3, Math.round(o.y) - 1, 6, 1);
    blit(ctx, art, o, 0, -8 + bob);
  },
});

// ------------------------------------------------------------ Plumb, Hank's three-legged hound
function drawDog(f: number): () => void {
  const tan = '#c8935a';
  const ear = '#7a4a2e';
  return () => {
    // tail (wagging)
    const tip = [[21.5, 3.5], [22, 6], [20.5, 2.6]][f];
    stroke([[18.5, 7.5, 0.7], [20.5, 5.8, 0.5], [tip[0], tip[1], 0.3]], tan);
    // body lying down
    ell(12.5, 8.5, 7, 3.2, (_x, y) => (y < 7 ? liA(tan, 0.25) : y > 10 ? shA(tan, 0.25) : tan));
    // the one hind leg, tucked
    ell(16.5, 10.3, 3, 1.5, shA(tan, 0.12));
    ell(14, 11.2, 1.4, 0.8, '#f2e6d0');
    // white chest and a front leg stretched out
    ell(8, 9.6, 2.6, 1.8, '#f2e6d0');
    R(2.5, 10.4, 5.5, 1.6, tan);
    ell(2.6, 11.2, 1.2, 0.8, '#f2e6d0');
    // head up, chin on nothing in particular
    ell(5.5, 5.6, 3.2, 2.7, tan);
    ell(5, 4.4, 2.2, 1.2, liA(tan, 0.3));
    ell(2.6, 6.7, 2.2, 1.5, '#e8c08a');
    ell(0.9, 6.2, 0.8, 0.7, AK);
    P1(0.6, 5.9, '#8a7a9a');
    // happy closed eye
    H1(3.8, 5.3, 4.9, AK);
    P1(3.6, 4.6, AK);
    // the long ear
    poly([[5.2, 3.6], [8, 4.2], [7.8, 9.2], [6, 9.6]], ear);
    L1(6.2, 4.4, 6.8, 9, liA(ear, 0.3));
    // red collar with a brass tag
    L1(8.4, 4.6, 9.2, 8.6, '#b04a3f');
    L1(8.9, 4.6, 9.7, 8.6, '#b04a3f');
    P1(9.4, 8.9, '#ebc777');
    // breathing highlight along the back
    H1(10, 16, 5.5 + (f === 1 ? 0.5 : 0), liA(tan, 0.45));
  };
}
registerObject('sx-dog', {
  hit: { x: -13, y: -16, w: 26, h: 18 },
  label: () => 'Pat',
  draw: (ctx, o, t) => {
    const wag = o.props.wag ? Math.floor(tick(t) / 2) % 3 : Math.floor(tick(t) / 14) % 2;
    const art = dart(`sx-dog|${wag}`, 23, 12, drawDog(wag), { pad: [1, 2, 2, 2], shadow: (ox, oy) => shadowF(ox + 11, oy + 11.5, 10, 1.8) });
    blit(ctx, art, o);
  },
});

// ------------------------------------------------------------ the fridge door: Grandma's note and Pip's drawings
const CRAYON = ['#e2445a', '#4e6a93', '#f4b63f', '#5c9a6e', '#6a4f88', '#e07b39', '#ff5d8f', '#3e7a6e'];
function drawFridge(note: boolean, drawings: number): () => void {
  return () => {
    if (note) {
      R(0, 6, 5, 6, PAPER);
      for (let i = 0; i < 4; i++) H1(0.8, 4.2 - (i % 2), 7.5 + i * 1.1, '#6a4f88');
      ell(2.5, 6, 1, 0.8, '#e07b39');
    }
    const spots: [number, number][] = [[6, 0.5], [6.5, 6.5], [1, 0], [8.5, 3]];
    for (let i = 0; i < Math.min(drawings, spots.length); i++) {
      const [x, y] = spots[i];
      R(x, y, 5, 5, '#fbf6ea');
      const c1 = CRAYON[(i * 3) % CRAYON.length];
      const c2 = CRAYON[(i * 3 + 2) % CRAYON.length];
      // a crayon figure with a belt, and a sun or a ring
      ell(x + 1.5, y + 1.5, 0.6, 0.6, c1);
      V1(x + 1.5, y + 2, y + 4, c1);
      H1(x + 0.8, x + 2.4, y + 3, c2);
      if (i % 2) ell(x + 3.8, y + 1.2, 0.7, 0.7, '#f4b63f');
      else R(x + 3, y + 2.5, 1.6, 1.6, c2);
      P(x + 2.5, y - 0.2, CRAYON[(i + 5) % CRAYON.length]);
    }
  };
}
registerObject('sx-fridge', {
  hit: { x: -7, y: -30, w: 14, h: 30 },
  label: () => 'Look',
  draw: (ctx, o) => {
    const note = !!o.props.note;
    const n = Number(o.props.drawings ?? 0);
    if (!note && !n) return;
    const art = dart(`sx-fridge|${note ? 1 : 0}|${Math.min(4, n)}`, 14, 12, drawFridge(note, n), { outline: false });
    blit(ctx, art, o, Number(o.props.dx ?? 0), Number(o.props.dy ?? -20));
  },
});

