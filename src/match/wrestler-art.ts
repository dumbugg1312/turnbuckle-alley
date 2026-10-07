/**
 * The match-stage wrestler renderer: high-detail side-view (3/4) figures,
 * about 56-66 px tall, built from a Look.
 *
 * How a sprite is made:
 *  1. Metrics come from the body type (petite .. giant) and look.height.
 *  2. A pose is a tiny skeleton: torso lean, head tilt, and two angles for
 *     each limb (near = the leading, camera-side limb; far = the trailing one).
 *  3. Every body part is rasterized as a shaded volume (capsule / tapered
 *     cylinder / sphere) lit by the overhead spotlights with a 5-tone,
 *     hue-shifted ramp (warm skin shadows, plum cloth shadows, butter lights).
 *     Each pixel remembers its part, how far along the part it sits (u), and
 *     its side-to-side position (a), so gear is painted afterwards by
 *     recoloring regions of the already-shaded body: trunks, tights, singlet
 *     straps, laced boots, kneepads, tape, masks, patterns, sequins.
 *  4. Lying and flying poses are authored upright and rotated 90 degrees
 *     losslessly, then mirrored for facing, rim-lit from above, selectively
 *     outlined, cropped and cached per (look, pose, frame, facing).
 */
import { AK, col, dth, hash2, liA, lum, mixc, mkSpr, OUT, selA, shA, toCanvas, type Spr } from '../gfx/kit';
import type { BodyType, Look } from '../gfx/look';

export type WPose =
  | 'idle' | 'walk' | 'strike' | 'kick' | 'grapple' | 'lift' | 'lifted' | 'down' | 'stagger' | 'taunt'
  | 'climb' | 'perch' | 'aerial' | 'hold' | 'held' | 'pin' | 'pinned' | 'sell' | 'celebrate' | 'fireup'
  | 'count' | 'sit' | 'wave';
export type Facing = 'left' | 'right';

export interface WrestlerOpts {
  pose: WPose;
  frame?: number;
  facing: Facing;
  flash?: boolean;
  /** Size multiplier (1 = ring size, 0.5 = card art). */
  scale?: number;
}
export interface WSprite {
  canvas: HTMLCanvasElement;
  ax: number;
  ay: number;
  w: number;
  h: number;
}

const FRAMES: Record<WPose, number> = {
  idle: 2, walk: 4, strike: 3, kick: 3, grapple: 2, lift: 1, lifted: 1, down: 1, stagger: 2, taunt: 2, climb: 2, perch: 1,
  aerial: 1, hold: 2, held: 1, pin: 1, pinned: 1, sell: 2, celebrate: 2, fireup: 2, count: 2, sit: 1, wave: 2,
};
export function poseFrames(pose: WPose): number {
  return FRAMES[pose] ?? 1;
}

/** Referee Mo: striped shirt, bow tie, black slacks. */
export const REF_LOOK: Look = {
  body: 'lean', height: 0, skin: '#e8a982', head: 'round', hair: 'side-part', hairColor: '#3b2419', facial: 'mustache', eyes: 'round', eyeColor: '#3a2a20',
  top: 'referee', topColor: '#f4f2fa', topAccent: '#2b2140', bottom: 'slacks', bottomColor: '#2b2140', bottomAccent: '#1e1426', shoes: 'sneakers', shoesColor: '#2b2140',
  extras: [{ id: 'bowtie', color: '#2b2140' }],
};

// ------------------------------------------------------------------ metrics

interface Met {
  S: number;
  head: number;
  headW: number;
  neck: number;
  neckR: number;
  torso: number;
  shW: number;
  hipW: number;
  armR: number;
  foreR: number;
  legR: number;
  calfR: number;
  upArm: number;
  foreArm: number;
  thigh: number;
  shin: number;
  foot: number;
  footR: number;
  belly: number;
  muscle: number;
}

const BODIES: Record<BodyType, { H: number; head: number; headW: number; torso: number; shW: number; hipW: number; armR: number; legR: number; belly: number; muscle: number }> = {
  petite: { H: 46, head: 10.5, headW: 9.5, torso: 14, shW: 5.5, hipW: 4.5, armR: 2, legR: 2.6, belly: 0, muscle: 0.4 },
  lean: { H: 56, head: 11.5, headW: 10, torso: 18, shW: 6.5, hipW: 5, armR: 2.4, legR: 3, belly: 0, muscle: 0.6 },
  athletic: { H: 58, head: 12, headW: 10.5, torso: 19, shW: 8, hipW: 5.5, armR: 3, legR: 3.6, belly: 0, muscle: 1 },
  stocky: { H: 54, head: 12.5, headW: 11, torso: 18, shW: 8.5, hipW: 6.5, armR: 3.4, legR: 4, belly: 0.35, muscle: 0.8 },
  heavy: { H: 58, head: 12.5, headW: 11.5, torso: 20, shW: 9.5, hipW: 8, armR: 3.8, legR: 4.6, belly: 1, muscle: 0.35 },
  giant: { H: 66, head: 13, headW: 11.5, torso: 22, shW: 9.5, hipW: 6.5, armR: 3.8, legR: 4.4, belly: 0.1, muscle: 0.9 },
};

function metrics(look: Look, S: number): Met {
  const b = BODIES[look.body] ?? BODIES.athletic;
  const H = b.H + (look.height ?? 0) * (look.species === 'raccoon' ? 0.5 : 1);
  const raccoon = look.species === 'raccoon';
  const head = raccoon ? b.head * 1.1 : b.head;
  const neck = raccoon ? 1 : 2.5;
  const legLen = Math.max(14, H - head - neck - b.torso - 2);
  const m: Met = {
    S,
    head: head * S,
    headW: (raccoon ? b.headW * 1.15 : b.headW) * S,
    neck: neck * S,
    neckR: Math.max(1.2, b.shW * 0.34) * S,
    torso: b.torso * S,
    shW: b.shW * S,
    hipW: b.hipW * S,
    armR: b.armR * S,
    foreR: b.armR * 0.82 * S,
    legR: b.legR * S,
    calfR: b.legR * 0.8 * S,
    upArm: b.torso * 0.56 * S,
    foreArm: b.torso * 0.5 * S,
    thigh: legLen * 0.52 * S,
    shin: legLen * 0.48 * S,
    foot: (b.legR * 2.2 + 2) * S,
    footR: b.legR * 0.72 * S,
    belly: b.belly,
    muscle: b.muscle,
  };
  return m;
}

// ------------------------------------------------------------------ poses

type Face = 'neutral' | 'grit' | 'yell' | 'hurt' | 'smile' | 'dizzy' | 'smug';
interface LimbDef {
  /** [shoulder angle, elbow bend] degrees. 0 = hanging down, 90 = forward, 180 = up. */
  arm: [number, number];
  /** [hip angle, knee bend]. Bend swings the shin backward. */
  leg: [number, number];
  /** Foot angle (default flat, forward). */
  foot?: number;
}
interface PoseDef {
  rot?: 'L' | 'R';
  /** Root x nudge. */
  dx?: number;
  torso: number;
  head?: number;
  near: LimbDef;
  far: LimbDef;
  face: Face;
  hands?: 'fist' | 'open';
  /** Smear the near arm / leg from these previous angles (impact frames). */
  smearArm?: [number, number];
  smearLeg?: [number, number];
  /** Stretch the near arm / leg (squash and stretch). */
  stretch?: number;
  /** Chest rise for breathing (px). */
  breath?: number;
  /** The hips are lowered until this joint touches the ground. */
  kneel?: boolean;
  /** Cape / wings shown. */
  cape?: boolean;
  wings?: 'open' | 'closed';
}

function poseDef(pose: WPose, f: number): PoseDef {
  switch (pose) {
    case 'idle':
      return { torso: 8 + f * -2, near: { arm: [72 + f * 3, 96], leg: [22, 18] }, far: { arm: [40 + f * 3, 112], leg: [-16, 12] }, face: 'grit', hands: 'fist', breath: f, cape: true, wings: 'closed' };
    case 'walk': {
      const legs: [[number, number], [number, number]][] = [[[28, 15], [-22, 25]], [[4, 36], [-6, 6]], [[-22, 25], [28, 15]], [[-6, 6], [4, 36]]];
      const arms: [[number, number], [number, number]][] = [[[-24, 20], [30, 60]], [[0, 30], [8, 50]], [[30, 60], [-24, 20]], [[8, 50], [0, 30]]];
      const i = ((f % 4) + 4) % 4;
      return { torso: 6, near: { arm: arms[i][0], leg: legs[i][0] }, far: { arm: arms[i][1], leg: legs[i][1] }, face: 'neutral', hands: 'fist', cape: true, wings: 'closed' };
    }
    case 'strike':
      if (f === 0) return { torso: -8, near: { arm: [-45, 105], leg: [26, 20] }, far: { arm: [62, 95], leg: [-16, 10] }, face: 'grit', hands: 'fist' };
      if (f === 1) return { torso: 22, dx: 3, near: { arm: [98, 0], leg: [38, 16] }, far: { arm: [18, 105], leg: [-32, 12] }, face: 'yell', hands: 'fist', smearArm: [-30, 100], stretch: 1.22 };
      return { torso: 12, dx: 2, near: { arm: [82, 22], leg: [34, 18] }, far: { arm: [30, 95], leg: [-26, 14] }, face: 'grit', hands: 'fist' };
    case 'kick':
      if (f === 0) return { torso: -6, near: { arm: [-20, 60], leg: [72, 112], foot: 20 }, far: { arm: [42, 82], leg: [-6, 6] }, face: 'grit', hands: 'fist' };
      if (f === 1) return { torso: -16, near: { arm: [-42, 32], leg: [104, 0], foot: 150 }, far: { arm: [52, 60], leg: [-12, 6] }, face: 'yell', hands: 'fist', smearLeg: [72, 100], stretch: 1.2 };
      return { torso: -4, near: { arm: [-10, 50], leg: [44, 54], foot: 60 }, far: { arm: [36, 70], leg: [-10, 8] }, face: 'grit', hands: 'fist' };
    case 'grapple':
      return { torso: 20, head: 8, dx: 2, near: { arm: [88 + f * 4, 42], leg: [32, 26] }, far: { arm: [58, 14], leg: [-26, 16] }, face: 'grit', hands: 'open' };
    case 'lift':
      return { torso: -10, head: -8, near: { arm: [172, 0], leg: [26, 26] }, far: { arm: [168, 0], leg: [-22, 20] }, face: 'grit', hands: 'open' };
    case 'lifted':
      return { rot: 'L', torso: 0, head: -18, near: { arm: [-95, 10], leg: [-66, 24], foot: -60 }, far: { arm: [-80, 16], leg: [-74, 20], foot: -60 }, face: 'hurt', hands: 'open' };
    case 'down':
      return { rot: 'L', torso: 2, head: -12, near: { arm: [168, 12], leg: [62, 62] }, far: { arm: [96, 108], leg: [12, 6] }, face: 'hurt', hands: 'open' };
    case 'pinned':
      return { rot: 'L', torso: 2, head: -8, near: { arm: [150, 20], leg: [84, 84] }, far: { arm: [100, 115], leg: [8, 4] }, face: 'dizzy', hands: 'open' };
    case 'pin':
      return { rot: 'L', torso: 12, head: 22, near: { arm: [-58, 64], leg: [42, 62] }, far: { arm: [160, 14], leg: [-18, 22] }, face: 'grit', hands: 'open' };
    case 'held':
      return { rot: 'R', torso: 14, head: -28, near: { arm: [166, 6], leg: [-8, 34], foot: 40 }, far: { arm: [158, 10], leg: [-4, 30], foot: 40 }, face: 'yell', hands: 'open' };
    case 'hold':
      return { torso: 26 + f * 4, head: 6, near: { arm: [72, 52], leg: [90, 90] }, far: { arm: [62, 70], leg: [0, 90] }, face: 'grit', hands: 'open', kneel: true };
    case 'count':
      return f === 0
        ? { torso: 14, head: -6, near: { arm: [168, 8], leg: [90, 90] }, far: { arm: [40, 40], leg: [0, 90] }, face: 'yell', hands: 'open', kneel: true }
        : { torso: 30, head: 10, near: { arm: [66, 4], leg: [90, 90] }, far: { arm: [44, 40], leg: [0, 90] }, face: 'yell', hands: 'open', kneel: true };
    case 'stagger':
      return { torso: -20 - f * 3, head: -16, near: { arm: [52, 28], leg: [36, 10] }, far: { arm: [-44, 22], leg: [-6, 32] }, face: 'dizzy', hands: 'open', cape: true };
    case 'taunt':
      return { torso: -10, head: -12, near: { arm: [112 + f * 10, 0], leg: [22, 6] }, far: { arm: [-118 - f * 8, 0], leg: [-22, 6] }, face: 'smug', hands: 'open', cape: true, wings: 'open' };
    case 'celebrate':
      return f === 0
        ? { torso: -6, head: -14, near: { arm: [166, 0], leg: [20, 4] }, far: { arm: [-164, 0], leg: [-20, 4] }, face: 'smile', hands: 'fist', cape: true, wings: 'open' }
        : { torso: -2, head: -10, near: { arm: [140, 36], leg: [20, 10] }, far: { arm: [-140, 36], leg: [-20, 10] }, face: 'smile', hands: 'fist', cape: true, wings: 'open' };
    case 'fireup':
      return { torso: 16, head: -14, dx: f ? 1 : -1, near: { arm: [-34 + f * 6, 24], leg: [36, 36] }, far: { arm: [-24 - f * 6, 18], leg: [-36, 36] }, face: 'yell', hands: 'fist', cape: true };
    case 'sell':
      return { torso: 34 + f * 4, head: 14, near: { arm: [100, 122], leg: [16, 26] }, far: { arm: [-50, 92], leg: [-10, 36] }, face: 'hurt', hands: 'open' };
    case 'climb':
      return f === 0
        ? { torso: 10, head: -14, near: { arm: [152, 20], leg: [82, 102], foot: 60 }, far: { arm: [138, 32], leg: [-4, 10] }, face: 'grit', hands: 'open' }
        : { torso: 10, head: -14, near: { arm: [138, 32], leg: [-4, 10] }, far: { arm: [152, 20], leg: [82, 102], foot: 60 }, face: 'grit', hands: 'open' };
    case 'perch':
      return { torso: 32, head: -24, near: { arm: [84, 24], leg: [56, 112] }, far: { arm: [-62, 12], leg: [46, 104] }, face: 'grit', hands: 'open' };
    case 'aerial':
      return { rot: 'R', torso: 0, head: -22, near: { arm: [176, 0], leg: [-22, 16], foot: 20 }, far: { arm: [-172, 0], leg: [-10, 10], foot: 20 }, face: 'yell', hands: 'open', wings: 'open' };
    case 'sit':
      return { torso: 6, near: { arm: [30, 60], leg: [90, 90] }, far: { arm: [30, 60], leg: [90, 90] }, face: 'neutral', hands: 'open', kneel: true };
    case 'wave':
      return { torso: 0, near: { arm: [150 + f * 20, 20], leg: [8, 4] }, far: { arm: [0, 10], leg: [-8, 4] }, face: 'smile', hands: 'open', cape: true };
  }
}

// ------------------------------------------------------------------ skeleton

interface Pt {
  x: number;
  y: number;
}
interface LimbPts {
  sh: Pt;
  el: Pt;
  hand: Pt;
  hipJ: Pt;
  knee: Pt;
  ankle: Pt;
  toe: Pt;
}
interface Skel {
  hip: Pt;
  chest: Pt;
  neckTop: Pt;
  headC: Pt;
  near: LimbPts;
  far: LimbPts;
  torsoAng: number;
  headAng: number;
}

const D2R = Math.PI / 180;
const dir = (a: number): Pt => ({ x: Math.sin(a * D2R), y: Math.cos(a * D2R) });
const add = (p: Pt, d: Pt, k: number): Pt => ({ x: p.x + d.x * k, y: p.y + d.y * k });

function skeleton(m: Met, pd: PoseDef, stretchNear: number): Skel {
  const hip: Pt = { x: 0, y: 0 };
  const up = dir(180 + pd.torso); // torso direction (up, leaning forward when torso > 0)
  const chest = add(hip, up, m.torso + (pd.breath ?? 0) * 0.6 * m.S);
  const neckTop = add(chest, up, m.neck);
  const headDir = dir(180 + pd.torso + (pd.head ?? 0));
  const headC = add(neckTop, headDir, m.head * 0.5);
  const side = (l: LimbDef, sgn: 1 | -1, stretch: number): LimbPts => {
    const sh: Pt = { x: chest.x + sgn * m.shW * 0.68, y: chest.y + m.S * 1.2 };
    const a0 = l.arm[0] + pd.torso;
    const el = add(sh, dir(a0), m.upArm * stretch);
    const hand = add(el, dir(a0 + l.arm[1]), m.foreArm * stretch);
    const hipJ: Pt = { x: hip.x + sgn * m.hipW * 0.5, y: hip.y };
    const knee = add(hipJ, dir(l.leg[0]), m.thigh * stretch);
    const shinA = l.leg[0] - l.leg[1];
    const ankle = add(knee, dir(shinA), m.shin * stretch);
    const toe = add(ankle, dir(l.foot ?? 90), m.foot);
    return { sh, el, hand, hipJ, knee, ankle, toe };
  };
  return { hip, chest, neckTop, headC, near: side(pd.near, 1, stretchNear), far: side(pd.far, -1, 1), torsoAng: pd.torso, headAng: pd.torso + (pd.head ?? 0) };
}

// ------------------------------------------------------------------ raster core

type Ramp = [number, number, number, number, number];
const rampCloth = (c: string | number): Ramp => [shA(c, 0.56), shA(c, 0.3), col(c), liA(c, 0.2), liA(c, 0.42)];
const rampSkin = (c: string | number): Ramp => [mixc(c, '#7a2f4a', 0.5), mixc(c, '#a8505c', 0.27), col(c), liA(c, 0.18), liA(c, 0.42)];
const rampMetal = (c: string | number): Ramp => [shA(c, 0.6), shA(c, 0.3), col(c), liA(c, 0.35), liA(c, 0.7)];

const BW = 128;
const BH = 128;
let D: Uint32Array<ArrayBufferLike> = new Uint32Array(1);
const PART = new Uint8Array(BW * BH);
const UU = new Uint8Array(BW * BH);
const AA = new Int8Array(BW * BH);
const LV = new Uint8Array(BW * BH);
const CL = new Uint8Array(BW * BH);
let LX = 0.15;
let LY = -0.8;
let LZ = 0.58;
const RAMPS: Ramp[] = [];

const enum Part {
  None = 0, Torso = 1, NUp = 2, NFore = 3, NHand = 4, FUp = 5, FFore = 6, FHand = 7,
  NThigh = 8, NShin = 9, NFoot = 10, FThigh = 11, FShin = 12, FFoot = 13, Head = 14, Neck = 15, Hair = 16, NSh = 17, FSh = 18, Prop = 19, Tail = 20,
}
const SKIN_PARTS = new Set<number>([Part.Torso, Part.NUp, Part.NFore, Part.NHand, Part.FUp, Part.FFore, Part.FHand, Part.NThigh, Part.NShin, Part.NFoot, Part.FThigh, Part.FShin, Part.FFoot, Part.Head, Part.Neck, Part.NSh, Part.FSh]);
const isUp = (p: number) => p === Part.NUp || p === Part.FUp;
const isFore = (p: number) => p === Part.NFore || p === Part.FFore;
const isHand = (p: number) => p === Part.NHand || p === Part.FHand;
const isThigh = (p: number) => p === Part.NThigh || p === Part.FThigh;
const isShin = (p: number) => p === Part.NShin || p === Part.FShin;
const isFoot = (p: number) => p === Part.NFoot || p === Part.FFoot;
const isSh = (p: number) => p === Part.NSh || p === Part.FSh;

const clampLv = (l: number) => (l < 0 ? 0 : l > 4 ? 4 : l);
function levelOf(nx: number, ny: number, nz: number): number {
  const i = nx * LX + ny * LY + nz * LZ;
  return i > 0.74 ? 4 : i > 0.46 ? 3 : i > 0.06 ? 2 : i > -0.3 ? 1 : 0;
}

/**
 * Rasterize a shaded volume along the axis p0 -> p1 with a front/back radius
 * profile (u = 0 at p0). Caps are spherical. Writes color, part, u, a, level.
 */
function vol(p0: Pt, p1: Pt, rf: (u: number) => number, rb: (u: number) => number, ramp: Ramp, part: number, o: { cap0?: boolean; cap1?: boolean; lv?: number; dither?: boolean; keep?: boolean } = {}): void {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy);
  const ux = len > 0 ? dx / len : 0;
  const uy = len > 0 ? dy / len : 1;
  const nx = -uy;
  const ny = ux;
  let rmax = 0;
  for (let k = 0; k <= 4; k++) rmax = Math.max(rmax, rf(k / 4), rb(k / 4));
  const x0 = Math.max(0, Math.floor(Math.min(p0.x, p1.x) - rmax - 1));
  const x1 = Math.min(BW - 1, Math.ceil(Math.max(p0.x, p1.x) + rmax + 1));
  const y0 = Math.max(0, Math.floor(Math.min(p0.y, p1.y) - rmax - 1));
  const y1 = Math.min(BH - 1, Math.ceil(Math.max(p0.y, p1.y) + rmax + 1));
  const cap0 = o.cap0 !== false;
  const cap1 = o.cap1 !== false;
  const shift = o.lv ?? 0;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const px = x + 0.5 - p0.x;
      const py = y + 0.5 - p0.y;
      let t = len > 0 ? (px * ux + py * uy) / len : 0;
      const across = px * nx + py * ny;
      if (t < 0) {
        if (!cap0) continue;
        t = 0;
      } else if (t > 1) {
        if (!cap1) continue;
        t = 1;
      }
      const r = across >= 0 ? rf(t) : rb(t);
      if (r <= 0) continue;
      const ex = px - dx * t;
      const ey = py - dy * t;
      const d = Math.hypot(ex, ey);
      if (d > r) continue;
      if (o.dither && !dth(x, y, 5)) continue;
      const i = y * BW + x;
      if (o.keep && D[i]) continue;
      const q = d / r;
      const l = clampLv(levelOf(ex / r, ey / r, Math.sqrt(Math.max(0, 1 - q * q))) + shift);
      D[i] = ramp[l];
      PART[i] = part;
      UU[i] = Math.round(t * 255);
      AA[i] = Math.max(-127, Math.min(127, Math.round((across / r) * 127)));
      LV[i] = l;
      CL[i] = 0;
    }
}

/** Nudge the shade level of a pixel (muscle definition, folds). */
function nudge(x: number, y: number, dl: number, part?: number): void {
  x |= 0;
  y |= 0;
  if (x < 0 || y < 0 || x >= BW || y >= BH) return;
  const i = y * BW + x;
  if (!D[i] || (part !== undefined && PART[i] !== part)) return;
  const l = clampLv(LV[i] + dl);
  LV[i] = l;
  const ramp = CL[i] ? CLRAMPS[CL[i]] : RAMPS[PART[i]];
  if (ramp) D[i] = ramp[l];
}
function put(x: number, y: number, c: number | string, part = Part.Prop): void {
  x |= 0;
  y |= 0;
  if (x < 0 || y < 0 || x >= BW || y >= BH) return;
  const i = y * BW + x;
  D[i] = col(c);
  PART[i] = part;
  LV[i] = 2;
  CL[i] = 0;
}
function rect(x: number, y: number, w: number, h: number, c: number | string, part = Part.Prop): void {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) put(x + xx, y + yy, c, part);
}
function lineTo(x0: number, y0: number, x1: number, y1: number, c: number | string, part = Part.Prop): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    put(x0, y0, c, part);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) {
      e += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      e += dx;
      y0 += sy;
    }
  }
}
function at(x: number, y: number): number {
  x |= 0;
  y |= 0;
  if (x < 0 || y < 0 || x >= BW || y >= BH) return 0;
  return D[y * BW + x];
}

// cloth ramps are registered per clothing id so nudges keep working on cloth
const CLRAMPS: Ramp[] = [];
function clothId(ramp: Ramp): number {
  CLRAMPS.push(ramp);
  return CLRAMPS.length - 1;
}

/** Recolor body pixels that match a predicate with a cloth ramp (keeps shading). */
function dress(ramp: Ramp, pred: (part: number, u: number, a: number, x: number, y: number) => boolean, pattern?: (x: number, y: number, u: number, a: number) => Ramp | null): void {
  const id = clothId(ramp);
  for (let y = 0; y < BH; y++)
    for (let x = 0; x < BW; x++) {
      const i = y * BW + x;
      const p = PART[i];
      if (!D[i] || !SKIN_PARTS.has(p)) continue;
      const u = UU[i] / 255;
      const a = AA[i] / 127;
      if (!pred(p, u, a, x, y)) continue;
      const pr = pattern?.(x, y, u, a);
      if (pr) {
        const pid = clothId(pr);
        D[i] = pr[LV[i]];
        CL[i] = pid;
      } else {
        D[i] = ramp[LV[i]];
        CL[i] = id;
      }
    }
}

// ------------------------------------------------------------------ patterns

function patternFn(id: string | undefined, base: string | number, accent: string | number, frame: number, seed: number): ((x: number, y: number, u: number, a: number) => Ramp | null) | undefined {
  if (!id || id === 'solid' || id === 'plain') return undefined;
  const acc = rampCloth(accent);
  const lit: Ramp = [liA(accent, 0.5), liA(accent, 0.7), liA(accent, 0.85), '#fffaf0', '#ffffff'].map(col) as Ramp;
  const dark = rampCloth(shA(base, 0.35));
  switch (id) {
    case 'stripes':
      return (_x, y) => (((y >> 1) + seed) % 4 < 2 ? acc : null);
    case 'pinstripe':
      return (x) => ((x + seed) % 3 === 0 ? acc : null);
    case 'checker':
      return (x, y) => ((((x >> 2) + (y >> 2)) & 1) === 0 ? acc : null);
    case 'plaid':
      return (x, y) => (x % 5 === 0 || y % 5 === 0 ? acc : (x % 5 === 2 && y % 5 === 2 ? dark : null));
    case 'stars':
      return (x, y) => {
        const cx = x - (x % 6) + 2;
        const cy = y - (y % 6) + 2 + ((x / 6) | 0) % 2;
        const dx = Math.abs(x - cx);
        const dy = Math.abs(y - cy);
        return (dx === 0 && dy <= 1) || (dy === 0 && dx <= 1) ? acc : null;
      };
    case 'hearts':
      return (x, y) => {
        const lx = x % 6;
        const ly = y % 6;
        return (ly === 1 && (lx === 1 || lx === 3)) || (ly === 2 && lx >= 0 && lx <= 4) || (ly === 3 && lx >= 1 && lx <= 3) || (ly === 4 && lx === 2) ? acc : null;
      };
    case 'sequins':
      return (x, y) => {
        const h = hash2(x, y, seed);
        if (h < 0.14) return hash2(x, y, seed + 7 + frame) < 0.4 ? lit : acc;
        return null;
      };
    case 'floral':
    case 'hawaiian':
      return (x, y) => {
        const cx = x - (x % 7) + 3;
        const cy = y - (y % 7) + 3;
        const d = Math.abs(x - cx) + Math.abs(y - cy);
        return d === 1 ? acc : d === 0 ? lit : null;
      };
    case 'lightning':
      return (x, y) => {
        const z = ((y >> 1) & 1 ? 1 : -1) + (y >> 2);
        return (x + z + seed) % 7 === 0 ? acc : null;
      };
    case 'flames':
      return (x, y, u) => (u < 0.35 + hash2(x >> 1, 0, seed) * 0.25 && (y + x) % 2 === 0 ? acc : u < 0.2 ? acc : null);
    case 'cow':
      return (x, y) => (hash2(x >> 2, y >> 2, seed) < 0.3 ? dark : null);
    case 'camo':
      return (x, y) => {
        const h = hash2(x >> 2, y >> 2, seed);
        return h < 0.25 ? dark : h < 0.45 ? acc : null;
      };
    case 'logo':
      return (_x, _y, u, a) => (u > 0.55 && u < 0.78 && Math.abs(a) < 0.45 && ((u * 40) | 0) % 2 === 0 ? acc : null);
    default:
      return undefined;
  }
}

// ------------------------------------------------------------------ build

interface Built extends WSprite {
  white?: HTMLCanvasElement;
}
const cache = new Map<string, Built>();
const lookKeys = new WeakMap<Look, { json: string; seed: number }>();
function keyOf(look: Look): { json: string; seed: number } {
  const hit = lookKeys.get(look);
  const json = JSON.stringify(look);
  if (hit && hit.json === json) return hit;
  let h = 2166136261;
  for (let i = 0; i < json.length; i++) h = Math.imul(h ^ json.charCodeAt(i), 16777619);
  const v = { json, seed: (h >>> 0) % 1000 };
  lookKeys.set(look, v);
  return v;
}

export function wrestlerSprite(look: Look, opts: WrestlerOpts): WSprite {
  const k = keyOf(look);
  const S = opts.scale ?? 1;
  const n = poseFrames(opts.pose);
  const frame = (((opts.frame ?? 0) % n) + n) % n;
  const key = `${k.json}|${opts.pose}|${frame}|${opts.facing}|${S}`;
  let b = cache.get(key);
  if (!b) {
    b = build(look, opts.pose, frame, opts.facing, S, k.seed);
    if (cache.size > 900) cache.clear();
    cache.set(key, b);
  }
  if (opts.flash) {
    if (!b.white) {
      const c = document.createElement('canvas');
      c.width = b.w;
      c.height = b.h;
      const x = c.getContext('2d')!;
      x.drawImage(b.canvas, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = '#fff8e8';
      x.fillRect(0, 0, b.w, b.h);
      b.white = c;
    }
    return { canvas: b.white, ax: b.ax, ay: b.ay, w: b.w, h: b.h };
  }
  return b;
}

/** Draw a wrestler with the feet (or the body's mat contact) at (x, y). */
export function drawWrestler(ctx: CanvasRenderingContext2D, look: Look, x: number, y: number, opts: WrestlerOpts): void {
  const s = wrestlerSprite(look, opts);
  ctx.drawImage(s.canvas, Math.round(x) - s.ax, Math.round(y) - s.ay);
}

export function clearWrestlerCache(): void {
  cache.clear();
}

function build(look: Look, pose: WPose, frame: number, facing: Facing, S: number, seed: number): Built {
  const pd = poseDef(pose, frame);
  const m = metrics(look, S);
  const sk = skeleton(m, pd, pd.stretch ?? 1);
  // Light: overhead spotlight, slightly from the front; transformed into the authoring frame
  // so the finished (rotated, mirrored) sprite is always lit from above.
  let lx = 0.15;
  let ly = -0.8;
  if (facing === 'left') lx = -lx;
  if (pd.rot === 'L') [lx, ly] = [-ly, lx];
  else if (pd.rot === 'R') [lx, ly] = [ly, -lx];
  LX = lx;
  LY = ly;
  LZ = 0.58;

  // Ground: lowest sole (or knee when kneeling) sits at groundY.
  const soles: number[] = [sk.near.ankle.y + m.footR, sk.far.ankle.y + m.footR, sk.near.toe.y + m.footR, sk.far.toe.y + m.footR];
  if (pd.kneel) soles.push(sk.near.knee.y + m.legR, sk.far.knee.y + m.legR);
  const lowest = Math.max(...soles);
  const groundY = BH - 6;
  const ox = BW / 2 + (pd.dx ?? 0) * S;
  const oy = groundY - lowest;
  const T = (p: Pt): Pt => ({ x: p.x + ox, y: p.y + oy });

  const spr = mkSpr(BW, BH, (s) => {
    D = s.d;
    PART.fill(0);
    LV.fill(0);
    CL.fill(0);
    CLRAMPS.length = 0;
    CLRAMPS.push(rampCloth('#808080'));
    RAMPS.length = 0;
    paintBody(look, m, pd, sk, T, frame, seed, pose);
  });
  // Rotate for lying / flying poses, mirror for facing.
  let out: Spr = spr;
  if (pd.rot === 'L') out = rotLeft(out);
  else if (pd.rot === 'R') out = rotRight(out);
  if (facing === 'left') out = mirror(out);
  rimLight(out);
  out = OUT(out, selA);
  // Crop to the opaque bounds.
  let x0 = out.w;
  let y0 = out.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < out.h; y++)
    for (let x = 0; x < out.w; x++)
      if (out.d[y * out.w + x]) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) {
    x0 = y0 = 0;
    x1 = y1 = 1;
  }
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const d = new Uint32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) d[y * w + x] = out.d[(y + y0) * out.w + x + x0];
  const canvas = toCanvas({ w, h, d });
  // Anchor: upright poses anchor at the feet center; rotated ones at the bottom center of the body.
  let ax: number;
  let ay: number;
  if (!pd.rot) {
    ax = Math.round(ox) + 1 - x0;
    ay = groundY + 1 - y0;
  } else {
    ax = Math.round(w / 2);
    ay = h - 1;
  }
  return { canvas, ax, ay, w, h };
}

function rotLeft(s: Spr): Spr {
  const d = new Uint32Array(s.w * s.h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[(s.w - 1 - x) * s.h + y] = s.d[y * s.w + x];
  return { w: s.h, h: s.w, d };
}
function rotRight(s: Spr): Spr {
  const d = new Uint32Array(s.w * s.h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[x * s.h + (s.h - 1 - y)] = s.d[y * s.w + x];
  return { w: s.h, h: s.w, d };
}
function mirror(s: Spr): Spr {
  const d = new Uint32Array(s.w * s.h);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) d[y * s.w + (s.w - 1 - x)] = s.d[y * s.w + x];
  return { w: s.w, h: s.h, d };
}
/** Warm rim from the overhead lights along every top edge. */
function rimLight(s: Spr): void {
  const src = s.d.slice();
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const i = y * s.w + x;
      const c = src[i];
      if (!c) continue;
      const up = y > 0 ? src[i - s.w] : 0;
      if (!up) s.d[i] = mixc(c, '#fff3c4', 0.5);
      else if (y > 1 && !src[i - 2 * s.w] && hash2(x, y, 3) < 0.5) s.d[i] = mixc(c, '#fff3c4', 0.18);
    }
}

// ------------------------------------------------------------------ painting the body

function paintBody(look: Look, m: Met, pd: PoseDef, sk: Skel, T: (p: Pt) => Pt, frame: number, seed: number, pose: WPose): void {
  const species = look.species ?? 'human';
  const skinC = species === 'bear' ? look.skin || '#3a3040' : species === 'raccoon' ? '#8a8aa0' : look.skin;
  const skin = rampSkin(skinC);
  const skinFar: Ramp = skin;
  RAMPS[Part.Torso] = skin;
  RAMPS[Part.Head] = skin;
  RAMPS[Part.Neck] = skin;
  for (const p of [Part.NUp, Part.NFore, Part.NHand, Part.NThigh, Part.NShin, Part.NFoot, Part.NSh]) RAMPS[p] = skin;
  for (const p of [Part.FUp, Part.FFore, Part.FHand, Part.FThigh, Part.FShin, Part.FFoot, Part.FSh]) RAMPS[p] = skinFar;

  const near = sk.near;
  const far = sk.far;
  const neckTop = T(sk.neckTop);
  const headC = T(sk.headC);
  const fist = pd.hands !== 'open';
  const handR = fist ? m.foreR * 1.25 : m.foreR * 1.05;

  const limb = (p0: Pt, p1: Pt, r0: number, r1: number, part: number, farSide: boolean, dither = false) =>
    vol(T(p0), T(p1), (u) => r0 + (r1 - r0) * u, (u) => r0 + (r1 - r0) * u, RAMPS[part], part, { lv: farSide ? -1 : 0, dither });

  const arm = (l: LimbPts, farSide: boolean, parts: [number, number, number, number], dither = false) => {
    // deltoid cap
    vol(T(l.sh), T(l.sh), () => m.armR * 1.35, () => m.armR * 1.35, RAMPS[parts[3]], parts[3], { lv: farSide ? -1 : 0, dither });
    limb(l.sh, l.el, m.armR, m.foreR * 1.05, parts[0], farSide, dither);
    limb(l.el, l.hand, m.foreR * 1.1, m.foreR * 0.9, parts[1], farSide, dither);
    vol(T(l.hand), T(l.hand), () => handR, () => handR, RAMPS[parts[2]], parts[2], { lv: farSide ? -1 : 0, dither });
    // bicep bulge
    if (m.muscle > 0.5 && !dither) {
      const b = T(add(l.sh, { x: l.el.x - l.sh.x, y: l.el.y - l.sh.y }, 0.45));
      nudge(b.x - 1, b.y - 1, 1, parts[0]);
      nudge(b.x, b.y - 1, 1, parts[0]);
    }
  };
  const leg = (l: LimbPts, farSide: boolean, parts: [number, number, number], dither = false) => {
    limb(l.hipJ, l.knee, m.legR, m.calfR * 1.05, parts[0], farSide, dither);
    limb(l.knee, l.ankle, m.calfR * 1.15, m.calfR * 0.8, parts[1], farSide, dither);
    // foot: a low capsule from ankle to toe
    vol(T(l.ankle), T(l.toe), () => m.footR, () => m.footR, RAMPS[parts[2]], parts[2], { lv: farSide ? -1 : 0, dither });
    if (m.muscle > 0.5 && !dither) {
      // calf highlight and quad line
      const c = T(add(l.knee, { x: l.ankle.x - l.knee.x, y: l.ankle.y - l.knee.y }, 0.3));
      nudge(c.x - 1, c.y, 1, parts[1]);
      const q = T(add(l.hipJ, { x: l.knee.x - l.hipJ.x, y: l.knee.y - l.hipJ.y }, 0.5));
      nudge(q.x + 1, q.y, -1, parts[0]);
      nudge(q.x - 1, q.y - 1, 1, parts[0]);
    }
  };

  // ---- back layer: cape / wings / tail / long hair behind the head
  if (pd.cape || pd.wings) backExtras(look, m, pd, sk, T, frame, seed);
  if (species === 'raccoon') {
    const tail = rampCloth('#6a6a80');
    const p0 = add(sk.hip, { x: -1, y: 0 }, m.hipW);
    const p1 = add(p0, dir(-120), m.torso * 0.9);
    vol(T(p0), T(p1), (u) => m.legR * (0.8 + u * 0.6), (u) => m.legR * (0.8 + u * 0.6), tail, Part.Tail);
    const ringsC = col('#2b2140');
    for (let k = 1; k <= 3; k++) {
      const q = T(add(p0, { x: p1.x - p0.x, y: p1.y - p0.y }, k / 3.6));
      for (let dd = -4; dd <= 4; dd++) for (let ee = -1; ee <= 0; ee++) if (at(q.x + dd, q.y + ee) && PART[((q.y + ee) | 0) * BW + ((q.x + dd) | 0)] === Part.Tail) put(q.x + dd, q.y + ee, ringsC, Part.Tail);
    }
  }
  hairBack(look, m, headC, sk.headAng, seed);

  // ---- smears (impact frames)
  // Thin, sparse motion trails behind the striking limb.
  if (pd.smearArm) {
    const a0 = pd.smearArm[0] + pd.torso;
    for (let k = 0; k < 2; k++) {
      const f = (k + 1) / 3;
      const ang = a0 + (pd.near.arm[0] + pd.torso - a0) * f;
      const bend = pd.smearArm[1] + (pd.near.arm[1] - pd.smearArm[1]) * f;
      const el = add(near.sh, dir(ang), m.upArm);
      const hand = add(el, dir(ang + bend), m.foreArm * (1 + k * 0.15));
      limb(near.sh, el, m.armR * 0.55, m.foreR * 0.5, Part.NUp, true, true);
      limb(el, hand, m.foreR * 0.55, m.foreR * 0.4, Part.NFore, true, true);
    }
  }
  if (pd.smearLeg) {
    const a0 = pd.smearLeg[0];
    for (let k = 0; k < 2; k++) {
      const f = (k + 1) / 3;
      const ang = a0 + (pd.near.leg[0] - a0) * f;
      const bend = pd.smearLeg[1] + (pd.near.leg[1] - pd.smearLeg[1]) * f;
      const knee = add(near.hipJ, dir(ang), m.thigh);
      const ankle = add(knee, dir(ang - bend), m.shin * (1 + k * 0.15));
      limb(near.hipJ, knee, m.legR * 0.55, m.calfR * 0.5, Part.NThigh, true, true);
      limb(knee, ankle, m.calfR * 0.55, m.calfR * 0.4, Part.NShin, true, true);
    }
  }

  // ---- far limbs, torso, near leg, neck, head, near arm
  arm(far, true, [Part.FUp, Part.FFore, Part.FHand, Part.FSh]);
  leg(far, true, [Part.FThigh, Part.FShin, Part.FFoot]);
  torso(m, sk, T, look);
  leg(near, false, [Part.NThigh, Part.NShin, Part.NFoot]);
  vol(T(add(sk.chest, dir(180 + sk.torsoAng), -m.S)), neckTop, () => m.neckR, () => m.neckR, skin, Part.Neck, { cap0: false, cap1: true });
  head(look, m, headC, sk.headAng, pd.face, seed, frame);
  arm(near, false, [Part.NUp, Part.NFore, Part.NHand, Part.NSh]);

  // ---- clothing and gear (recolor the shaded body)
  gear(look, m, sk, T, frame, seed, pose, pd);
  // ---- head gear last (hair cap, mask, face paint, hats, glasses)
  headGear(look, m, headC, sk.headAng, pd.face, seed, frame);
}

function torso(m: Met, sk: Skel, T: (p: Pt) => Pt, look: Look): void {
  const hip = T(sk.hip);
  const chest = T(sk.chest);
  const belly = m.belly;
  const taper = m.muscle;
  const front = (u: number) => {
    // hip -> chest. V-taper: wider at the shoulders; belly bulges forward low.
    const base = m.hipW * 1.05 + (m.shW * 0.95 - m.hipW * 1.05) * smooth(Math.min(1, u * 1.15));
    const lat = taper * m.shW * 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.45) / 0.55)));
    const b = belly * m.shW * 0.55 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u + 0.05) / 0.75)));
    return base + lat + b;
  };
  const back = (u: number) => {
    const base = m.hipW * 1.0 + (m.shW * 0.95 - m.hipW) * smooth(Math.min(1, u * 1.15));
    const lat = taper * m.shW * 0.16 * Math.sin(Math.PI * Math.min(1, Math.max(0, (u - 0.4) / 0.6)));
    return base + lat + belly * m.shW * 0.12;
  };
  vol(hip, chest, front, back, RAMPS[Part.Torso], Part.Torso, { cap0: true, cap1: true });
  // Muscle definition on the chest and belly (reads through singlets too).
  const up = dir(180 + sk.torsoAng);
  const side = { x: -up.y, y: up.x }; // front direction
  const at = (u: number, a: number): Pt => ({ x: hip.x + up.x * m.torso * u + side.x * a, y: hip.y + up.y * m.torso * u + side.y * a });
  const hw = m.shW * 0.9;
  if (m.muscle >= 0.5) {
    // pec line (shadow under the pecs) and the cleft
    for (let a = -hw * 0.55; a <= hw * 0.6; a += 1) {
      const p = at(0.62, a);
      nudge(p.x, p.y, -1, Part.Torso);
    }
    for (let u = 0.64; u <= 0.86; u += 0.04) {
      const p = at(u, 0.05 * hw);
      nudge(p.x, p.y, -1, Part.Torso);
    }
    // pec highlights
    for (let a = hw * 0.2; a <= hw * 0.55; a += 1) {
      const p = at(0.74, a);
      nudge(p.x, p.y, 1, Part.Torso);
    }
    for (let a = -hw * 0.5; a <= -hw * 0.2; a += 1) {
      const p = at(0.76, a);
      nudge(p.x, p.y, 1, Part.Torso);
    }
  }
  if (m.muscle >= 0.75 && (look.top === 'none' || look.top === 'sportsbra' || look.top === 'crop') && look.species !== 'bear') {
    // abs: center line + two rows
    for (let u = 0.2; u < 0.58; u += 0.04) {
      const p = at(u, 0);
      nudge(p.x, p.y, -1, Part.Torso);
    }
    for (const u of [0.32, 0.46]) {
      for (let a = -hw * 0.35; a <= hw * 0.35; a += 1) {
        const p = at(u, a);
        nudge(p.x, p.y, -1, Part.Torso);
      }
      for (const a of [-hw * 0.25, hw * 0.25]) {
        const p = at(u + 0.08, a);
        nudge(p.x, p.y, 1, Part.Torso);
      }
    }
  }
  if (m.belly > 0.5) {
    for (let a = hw * 0.15; a <= hw * 0.55; a += 1) {
      const p = at(0.3, a);
      nudge(p.x, p.y, 1, Part.Torso);
    }
    const nv = at(0.22, hw * 0.2);
    nudge(nv.x, nv.y, -1, Part.Torso);
  }
}
const smooth = (t: number) => t * t * (3 - 2 * t);

// ------------------------------------------------------------------ head

function head(look: Look, m: Met, c: Pt, ang: number, face: Face, seed: number, frame: number): void {
  const hw = m.headW / 2;
  const hh = m.head / 2;
  const shape = look.head ?? 'round';
  const w = shape === 'wide' ? hw * 1.12 : shape === 'long' ? hw * 0.92 : shape === 'heart' ? hw * 1.02 : hw;
  const h = shape === 'long' ? hh * 1.12 : shape === 'wide' ? hh * 0.95 : hh;
  const up = dir(180 + ang);
  const top = add(c, up, h - w * 0.95);
  const bot = add(c, up, -(h - w * 0.95));
  const species = look.species ?? 'human';
  // skull: capsule; square jaws widen the bottom, heart narrows it
  const rf = (u: number) => (shape === 'square' ? w * (1 - u * 0.02) : shape === 'heart' ? w * (1 - u * 0.2) : w * (1 - u * 0.06));
  vol(top, bot, rf, rf, RAMPS[Part.Head], Part.Head);
  if (shape === 'square') {
    // jaw block
    vol(add(bot, up, 0.5), add(bot, up, -0.8), () => w * 0.9, () => w * 0.9, RAMPS[Part.Head], Part.Head, { keep: false });
  }
  if (species === 'bear') {
    // round ears + muzzle
    const earR = m.headW * 0.22;
    for (const sx of [-0.55, 0.45]) {
      const e = add(add(c, up, h * 0.85), { x: 1, y: 0 }, sx * m.headW);
      vol(e, e, () => earR, () => earR, RAMPS[Part.Head], Part.Head, { keep: true });
      put(e.x, e.y, mixc(look.skin, '#ffb0a0', 0.5), Part.Head);
    }
    const mz = add(c, { x: 1, y: 0 }, w * 0.55);
    const muzzle = rampSkin(mixc(look.skin, '#f6d8b8', 0.55));
    vol(add(mz, { x: 0, y: 1 }, 1), add(mz, { x: 0, y: 1 }, 3), () => w * 0.5, () => w * 0.5, muzzle, Part.Head);
    put(mz.x + w * 0.5 - 1, mz.y + 1, AK, Part.Head);
    put(mz.x + w * 0.5 - 2, mz.y + 1, AK, Part.Head);
  } else if (species === 'raccoon') {
    const earR = m.headW * 0.2;
    for (const sx of [-0.5, 0.4]) {
      const e = add(add(c, up, h * 0.95), { x: 1, y: 0 }, sx * m.headW);
      vol(e, e, () => earR, () => earR, RAMPS[Part.Head], Part.Head, { keep: true });
    }
    const muzzle = rampSkin('#e8e4f0');
    const mz = add(c, { x: 1, y: 0 }, w * 0.5);
    vol(add(mz, { x: 0, y: 1 }, 1), add(mz, { x: 0, y: 1 }, 2.5), () => w * 0.42, () => w * 0.42, muzzle, Part.Head);
    put(mz.x + w * 0.42 - 1, mz.y + 1, AK, Part.Head);
  }
  faceFeatures(look, m, c, w, h, face, seed, frame);
}

function faceFeatures(look: Look, m: Met, c: Pt, w: number, h: number, face: Face, seed: number, frame: number): void {
  const S = m.S;
  const eyeY = Math.round(c.y - h * 0.08);
  const nearX = Math.round(c.x - w * 0.28);
  const farX = Math.round(c.x + w * 0.48);
  const frontX = Math.round(c.x + w - 1);
  const eyeC = col(look.eyeColor || '#3a2a20');
  const eyeC2 = look.eyeColor2 ? col(look.eyeColor2) : eyeC;
  const white = col('#fffaf0');
  const species = look.species ?? 'human';
  const ink = col(AK);
  const brow = col(shA(look.hairColor || '#3b2419', 0.3));
  const closed = face === 'hurt';
  const blink = face !== 'hurt' && ((seed + frame * 3) % 7 === 3);
  if (species === 'raccoon') {
    // bandit mask
    for (let x = c.x - w + 1; x <= c.x + w - 1; x++) for (let y = eyeY - 1; y <= eyeY + 1; y++) if (at(x, y)) put(x, y, col('#2b2140'), Part.Head);
    put(nearX, eyeY, white, Part.Head);
    put(farX, eyeY, white, Part.Head);
    return;
  }
  if (closed || blink) {
    put(nearX, eyeY, ink, Part.Head);
    put(nearX + 1, eyeY, ink, Part.Head);
    put(farX, eyeY, ink, Part.Head);
  } else if (face === 'dizzy') {
    put(nearX, eyeY - 1, ink, Part.Head);
    put(nearX + 1, eyeY, ink, Part.Head);
    put(nearX, eyeY + 1, ink, Part.Head);
    put(farX, eyeY - 1, ink, Part.Head);
    put(farX, eyeY + 1, ink, Part.Head);
  } else {
    // near eye: white + pupil looking forward; far eye: pupil
    put(nearX, eyeY, white, Part.Head);
    put(nearX + 1, eyeY, eyeC, Part.Head);
    put(farX, eyeY, eyeC2, Part.Head);
    if (look.eyes === 'wide' || face === 'yell') {
      put(nearX, eyeY - 1, white, Part.Head);
      put(nearX + 1, eyeY - 1, white, Part.Head);
      put(farX, eyeY - 1, white, Part.Head);
    }
    if (look.eyes === 'lashes') {
      put(nearX - 1, eyeY - 1, ink, Part.Head);
      put(farX + 1, eyeY - 1, ink, Part.Head);
    }
  }
  // brows
  const angry = face === 'grit' || face === 'yell' || look.eyes === 'sharp';
  if (angry) {
    put(nearX, eyeY - 2, brow, Part.Head);
    put(nearX + 1, eyeY - 1 - (closed ? 1 : 0), brow, Part.Head);
    put(farX, eyeY - 1 - (closed ? 1 : 0), brow, Part.Head);
    put(farX - 1, eyeY - 2, brow, Part.Head);
  } else {
    put(nearX, eyeY - 2, brow, Part.Head);
    put(nearX + 1, eyeY - 2, brow, Part.Head);
    put(farX, eyeY - 2, brow, Part.Head);
  }
  // nose: a bump on the front edge
  const noseY = eyeY + Math.round(2 * S);
  put(frontX + 1, noseY, RAMPS[Part.Head][1], Part.Head);
  put(frontX, noseY + 1, RAMPS[Part.Head][0], Part.Head);
  if (S >= 0.9) put(frontX + 1, noseY + 1, RAMPS[Part.Head][0], Part.Head);
  // mouth
  const mouthY = noseY + Math.round(2.5 * S);
  const mx = Math.round(c.x + w * 0.25);
  const lip = col('#a8435a');
  if (face === 'yell') {
    rect(mx - 1, mouthY - 1, 3, 3, col('#5a1e34'), Part.Head);
    put(mx, mouthY - 1, white, Part.Head);
  } else if (face === 'smile' || face === 'smug') {
    put(mx - 1, mouthY - 1, lip, Part.Head);
    put(mx, mouthY, lip, Part.Head);
    put(mx + 1, mouthY, lip, Part.Head);
    put(mx + 2, mouthY - 1, lip, Part.Head);
    if (face === 'smile') put(mx, mouthY - 1, white, Part.Head);
  } else if (face === 'hurt' || face === 'dizzy') {
    put(mx - 1, mouthY, lip, Part.Head);
    put(mx, mouthY - 1, lip, Part.Head);
    put(mx + 1, mouthY, lip, Part.Head);
  } else {
    put(mx - 1, mouthY, lip, Part.Head);
    put(mx, mouthY, lip, Part.Head);
    put(mx + 1, mouthY, lip, Part.Head);
    if (face === 'grit') put(mx, mouthY, white, Part.Head);
  }
  // ear on the back side
  const ex = Math.round(c.x - w + 1);
  put(ex, eyeY, RAMPS[Part.Head][1], Part.Head);
  put(ex, eyeY + 1, RAMPS[Part.Head][0], Part.Head);
  put(ex - 1, eyeY + 1, RAMPS[Part.Head][1], Part.Head);
  // cheek / features
  const feats = look.features ?? [];
  if (feats.includes('blush')) {
    put(nearX, mouthY - 1, mixc(look.skin, '#ff7a8a', 0.4), Part.Head);
    put(farX, mouthY - 1, mixc(look.skin, '#ff7a8a', 0.4), Part.Head);
  }
  if (feats.includes('freckles')) for (const [dx, dy] of [[0, 1], [2, 2], [4, 1]]) put(nearX + dx, noseY + dy - 1, RAMPS[Part.Head][1], Part.Head);
  if (feats.includes('beauty-mark')) put(mx + 3, mouthY - 1, ink, Part.Head);
  if (feats.includes('scar-brow')) put(nearX - 1, eyeY - 3, mixc(look.skin, '#d8434b', 0.4), Part.Head);
  if (feats.includes('bandage')) {
    rect(frontX - 2, noseY, 3, 1, col('#f2e6c9'), Part.Head);
  }
  // facial hair
  const fh = look.facial ?? 'none';
  const hair = col(look.hairColor || '#3b2419');
  const hairD = col(shA(look.hairColor || '#3b2419', 0.3));
  const chinY = Math.round(c.y + h - 1);
  if (fh === 'mustache' || fh === 'handlebar' || fh === 'walrus' || fh === 'pencil') {
    const wide = fh === 'walrus' || fh === 'handlebar' ? 1 : 0;
    for (let x = mx - 2 - wide; x <= mx + 2 + wide; x++) if (at(x, mouthY - 1)) put(x, mouthY - 1, fh === 'pencil' ? hairD : hair, Part.Head);
    if (fh === 'walrus') for (let x = mx - 2; x <= mx + 2; x++) put(x, mouthY, hairD, Part.Head);
    if (fh === 'handlebar') {
      put(mx - 4, mouthY - 2, hair, Part.Head);
      put(mx + 4, mouthY - 2, hair, Part.Head);
    }
  }
  if (fh === 'beard' || fh === 'square' || fh === 'wild' || fh === 'goatee' || fh === 'mutton') {
    for (let y = mouthY + 1; y <= chinY + (fh === 'wild' ? 2 : 0); y++)
      for (let x = c.x - w + 2; x <= frontX + 1; x++) {
        if (!at(x, y) && !(fh === 'wild' && y > chinY)) continue;
        if (fh === 'goatee' && x < mx - 1) continue;
        if (fh === 'mutton' && x > mx - 2 && y > mouthY) continue;
        const i = ((y | 0) * BW + (x | 0)) | 0;
        if (PART[i] !== Part.Head && at(x, y)) continue;
        put(x, y, (x + y) % 3 === 0 ? hairD : hair, Part.Head);
      }
    // mustache that joins the beard
    if (fh !== 'goatee' && fh !== 'mutton') for (let x = mx - 2; x <= mx + 2; x++) put(x, mouthY - 1, hair, Part.Head);
  }
  if (fh === 'stubble') for (let y = mouthY; y <= chinY; y++) for (let x = c.x - w + 2; x <= frontX; x++) if (at(x, y) && dth(x, y, 6)) put(x, y, mixc(look.skin, look.hairColor || '#3b2419', 0.35), Part.Head);
  if (fh === 'soulpatch') put(mx, mouthY + 1, hair, Part.Head);
}

// ------------------------------------------------------------------ hair

function hairBack(look: Look, m: Met, c: Pt, ang: number, seed: number): void {
  const style = look.hair;
  if (look.species && look.species !== 'human') return;
  if (['long', 'mullet', 'locs', 'curly', 'afro', 'shaggy', 'bob', 'wave'].includes(style)) {
    const len = style === 'long' || style === 'locs' ? m.torso * 0.75 : style === 'mullet' ? m.torso * 0.5 : style === 'bob' ? m.head * 0.45 : m.head * 0.35;
    const ramp = rampCloth(look.hairColor);
    const up = dir(180 + ang);
    const back = { x: up.y, y: -up.x };
    const top = add(add(c, up, m.head * 0.25), back, m.headW * 0.25);
    const bot = add(add(c, up, -(m.head * 0.5 + len)), back, m.headW * 0.3);
    const wr = style === 'afro' ? m.headW * 0.85 : m.headW * 0.5;
    vol(top, bot, (u) => wr * (1 - u * 0.2), (u) => wr * (1 - u * 0.2), ramp, Part.Hair);
    if (style === 'locs') for (let k = 0; k < 4; k++) {
      const p0 = add(top, back, -wr * 0.6 + k * wr * 0.45);
      const p1 = add(bot, back, -wr * 0.6 + k * wr * 0.45 + 1);
      lineTo(p0.x, p0.y, p1.x, p1.y, ramp[1], Part.Hair);
    }
    if (style === 'curly' || style === 'afro') for (let k = 0; k < 8; k++) {
      const p = add(add(top, { x: bot.x - top.x, y: bot.y - top.y }, hash2(k, 1, seed)), back, (hash2(k, 2, seed) - 0.5) * wr * 2);
      put(p.x, p.y, ramp[3], Part.Hair);
    }
  }
  if (style === 'ponytail' || style === 'ponybraid' || style === 'highpony' || style === 'braids' || style === 'pigtails') {
    const ramp = rampCloth(look.hairColor);
    const up = dir(180 + ang);
    const back = { x: up.y, y: -up.x };
    const high = style === 'highpony';
    const root = add(add(c, up, high ? m.head * 0.45 : m.head * 0.1), back, m.headW * 0.4);
    const tip = add(add(root, back, high ? m.headW * 0.5 : m.headW * 0.45), up, -(style === 'ponybraid' ? m.torso * 0.9 : m.torso * 0.55));
    const r0 = m.headW * 0.2;
    vol(root, tip, (u) => r0 * (1 + 0.5 * Math.sin(u * Math.PI)) * (1 - u * 0.4), (u) => r0 * (1 + 0.5 * Math.sin(u * Math.PI)) * (1 - u * 0.4), ramp, Part.Hair);
    if (style === 'ponybraid' || style === 'braids') for (let k = 1; k < 6; k++) {
      const p = add(root, { x: tip.x - root.x, y: tip.y - root.y }, k / 6);
      put(p.x + (k % 2 ? 1 : -1), p.y, ramp[k % 2 ? 1 : 3], Part.Hair);
    }
    if (style === 'braids' || style === 'pigtails') {
      const root2 = add(add(c, up, m.head * 0.15), { x: 1, y: 0 }, -m.headW * 0.55);
      const tip2 = add(root2, up, -m.torso * 0.5);
      vol(root2, tip2, (u) => r0 * (1 - u * 0.3), (u) => r0 * (1 - u * 0.3), ramp, Part.Hair);
    }
    // scrunchie
    put(root.x, root.y, col(look.hairAccent ?? '#d8434b'), Part.Hair);
  }
}

function hairCap(look: Look, m: Met, c: Pt, ang: number, seed: number, frame: number): void {
  const style = look.hair;
  if (style === 'bald' || (look.species && look.species !== 'human')) {
    if (style === 'bald') {
      const p = add(c, dir(180 + ang), m.head * 0.3);
      put(p.x - 1, p.y, liA(look.skin, 0.55), Part.Head);
      put(p.x - 2, p.y + 1, liA(look.skin, 0.35), Part.Head);
    }
    return;
  }
  const ramp = rampCloth(look.hairColor);
  const hi = col(liA(look.hairColor, 0.38));
  const accent = look.hairAccent ? col(look.hairAccent) : null;
  const hw = m.headW / 2;
  const hh = m.head / 2;
  const up = dir(180 + ang);
  const back = { x: up.y, y: -up.x };
  // thickness and hairline per style
  let th = 1.6 * m.S;
  let line = 0.42; // fraction of the head height above center where hair stops (front)
  let backLine = 0.1;
  switch (style) {
    case 'buzz': th = 0.9 * m.S; break;
    case 'pompadour': th = 3.2 * m.S; line = 0.5; break;
    case 'flattop': th = 3 * m.S; break;
    case 'afro': th = 4.5 * m.S; line = 0.35; backLine = -0.2; break;
    case 'curly': th = 2.8 * m.S; break;
    case 'bun': case 'topknot': case 'spacebuns': case 'crown-braid': th = 1.3 * m.S; break;
    case 'undercut': case 'fauxhawk': case 'mohawk': th = 1.2 * m.S; break;
    case 'long': case 'locs': case 'shaggy': case 'curtains': th = 2 * m.S; line = 0.38; backLine = -0.3; break;
    case 'bob': case 'wave': th = 2.2 * m.S; backLine = -0.3; break;
    case 'side-part': line = 0.46; break;
    default: break;
  }
  const w = hw + th;
  const h = hh + th;
  const dotted = style === 'buzz';
  for (let y = Math.floor(c.y - h - 2); y <= Math.ceil(c.y + h); y++)
    for (let x = Math.floor(c.x - w - 2); x <= Math.ceil(c.x + w + 2); x++) {
      const px = x + 0.5 - c.x;
      const py = y + 0.5 - c.y;
      // head frame coords: v along up, b along back
      const v = -(px * up.x + py * up.y) * -1; // positive = up
      const b = px * back.x + py * back.y; // positive = back of the head
      const vv = px * up.x + py * up.y;
      void v;
      const ex = b / w;
      const ey = vv / h;
      const inside = ex * ex + ey * ey <= 1;
      if (!inside) continue;
      // hairline: front side stops higher, back side lower
      const frontness = Math.max(0, -b / hw); // 0 at center, 1 at the front edge
      const lineAt = line * hh + (backLine - line) * hh * Math.max(0, b / hw) * 0.6;
      const yAbove = vv; // up positive
      const inner = (b / hw) * (b / hw) + (vv / hh) * (vv / hh) <= 1;
      const over = inner && yAbove < lineAt + frontness * hh * 0.4;
      if (over) continue;
      if (vv < -hh * 0.2 && b < hw * 0.6) continue; // never below the ears on the face side
      if (dotted && !dth(x, y, 9)) continue;
      // mohawk / fauxhawk: only a center ridge
      if (style === 'mohawk' || style === 'fauxhawk') {
        if (Math.abs(b) > hw * 0.35 && vv < hh * 0.6) continue;
      }
      const i = y * BW + x;
      const under = D[i];
      if (under && PART[i] !== Part.Head && PART[i] !== Part.Hair && PART[i] !== Part.Neck) continue;
      const nx = ex;
      const ny = ey;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const l = levelOf(nx * back.x + ny * -up.x, nx * back.y + ny * -up.y, nz);
      D[i] = ramp[l];
      PART[i] = Part.Hair;
      LV[i] = l;
      CL[i] = 0;
    }
  // extra volume per style
  const crown = add(c, up, hh + th * 0.5);
  if (style === 'mohawk') for (let k = -3; k <= 3; k++) {
    const p = add(add(crown, back, k * m.S * 1.4), up, 3 * m.S - Math.abs(k) * 0.4 * m.S);
    lineTo(p.x, p.y, p.x + back.x * 0.3, p.y + 3, k % 2 ? ramp[2] : ramp[3], Part.Hair);
  }
  if (style === 'spiky') for (let k = -3; k <= 3; k++) {
    const p = add(add(crown, back, k * m.S * 1.5), up, 2.4 * m.S);
    const q = add(add(crown, back, k * m.S * 1.5 - 0.5), up, -0.5);
    lineTo(p.x, p.y, q.x, q.y, k % 2 ? ramp[2] : ramp[3], Part.Hair);
  }
  if (style === 'pompadour') {
    const p = add(add(crown, back, -hw * 0.5), up, 1.5 * m.S);
    vol(p, add(p, back, hw * 0.6), () => 2.6 * m.S, () => 2.6 * m.S, ramp, Part.Hair);
  }
  if (style === 'flattop') {
    for (let k = -hw * 0.8; k <= hw * 0.8; k++) {
      const p = add(add(crown, back, k), up, 1.4 * m.S);
      put(p.x, p.y, ramp[3], Part.Hair);
    }
  }
  if (style === 'bun' || style === 'topknot' || style === 'spacebuns') {
    const r = m.headW * 0.22;
    const p = style === 'topknot' ? add(crown, up, r) : style === 'bun' ? add(add(c, up, hh * 0.6), back, hw * 0.9) : add(add(crown, back, -hw * 0.5), up, r * 0.6);
    vol(p, p, () => r, () => r, ramp, Part.Hair);
    if (style === 'spacebuns') {
      const q = add(add(crown, back, hw * 0.5), up, r * 0.6);
      vol(q, q, () => r, () => r, ramp, Part.Hair);
    }
  }
  if (style === 'crown-braid') for (let k = -hw * 0.9; k <= hw * 0.9; k += 2) {
    const p = add(add(c, up, hh * 0.78), back, k);
    put(p.x, p.y, ramp[(k / 2) % 2 ? 1 : 3], Part.Hair);
  }
  if (style === 'curtains' || style === 'shaggy') {
    // bangs over the brow
    for (let k = -hw * 0.3; k <= hw * 0.9; k += 1) {
      const p = add(add(c, up, hh * 0.35 - ((k | 0) % 3 === 0 ? 1 : 0)), back, -k);
      if (at(p.x, p.y)) put(p.x, p.y, ramp[2], Part.Hair);
    }
  }
  // strands and highlights (flow from the crown back and down)
  const n = 4 + Math.round(th);
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    const p0 = add(add(crown, back, (t - 0.5) * hw * 1.6), up, -1);
    const p1 = add(p0, back, 1 + hash2(k, seed, 5) * 2);
    const q = add(p1, up, -(1 + hash2(k, seed, 9) * 2.5));
    const colr = accent && (k === 1 || k === 2) ? accent : hi;
    if (PART[((p0.y | 0) * BW + (p0.x | 0)) | 0] === Part.Hair) put(p0.x, p0.y, colr, Part.Hair);
    if (PART[((q.y | 0) * BW + (q.x | 0)) | 0] === Part.Hair) put(q.x, q.y, k % 2 ? colr : ramp[3], Part.Hair);
  }
  if (style === 'side-part') {
    const p = add(add(c, up, hh * 0.55), back, -hw * 0.3);
    for (let k = 0; k < 4; k++) put(p.x + back.x * k, p.y + back.y * k - 0.2 * k, ramp[0], Part.Hair);
  }
  void frame;
}

// ------------------------------------------------------------------ gear

function gear(look: Look, m: Met, sk: Skel, T: (p: Pt) => Pt, frame: number, seed: number, pose: WPose, pd: PoseDef): void {
  const S = m.S;
  const species = look.species ?? 'human';
  const extras = look.extras ?? [];
  const ex = (id: string) => extras.find((e) => e.id === id);
  const topC = look.topColor;
  const topA = look.topAccent || shA(topC, 0.3);
  const botC = look.bottomColor;
  const botA = look.bottomAccent || shA(botC, 0.3);
  const shoeC = look.shoesColor;
  // bear fur texture over all skin
  if (species === 'bear') {
    const fur = rampCloth(look.skin);
    dress(fur, (p) => SKIN_PARTS.has(p) && p !== Part.Head, (x, y) => (hash2(x, y, seed) < 0.12 ? rampCloth(liA(look.skin, 0.2)) : null));
  }

  // ---- bottoms
  const bottom = look.bottom;
  const botRamp = rampCloth(botC);
  const botPat = patternFn(look.bottomPattern, botC, botA, frame, seed);
  const bootTop = look.shoes === 'wrestling-boots' ? 0.22 : look.shoes === 'kickpads' ? 0.12 : look.shoes === 'boots' || look.shoes === 'cowboy-boots' || look.shoes === 'rainboots' ? 0.5 : 1.1;
  const waist = 0.16; // torso u below which the waistband sits
  if (bottom === 'trunks' || bottom === 'shorts') {
    const lenU = bottom === 'trunks' ? 0.32 : 0.62;
    dress(botRamp, (p, u) => (p === Part.Torso && u < waist) || (isThigh(p) && u < lenU), botPat);
  } else if (bottom === 'tights' || bottom === 'leggings' || bottom === 'jeans' || bottom === 'slacks' || bottom === 'sweats' || bottom === 'cargo' || bottom === 'wide' || bottom === 'overalls') {
    dress(botRamp, (p, u) => (p === Part.Torso && u < waist) || isThigh(p) || (isShin(p) && u < bootTop), botPat);
    if (bottom === 'overalls') {
      const bib = rampCloth(botC);
      dress(bib, (p, u, a) => p === Part.Torso && u < 0.62 && a > -0.75 && a < 0.8);
      dress(bib, (p, u, a) => p === Part.Torso && u >= 0.62 && u < 0.98 && (Math.abs(a - 0.45) < 0.14 || Math.abs(a + 0.35) < 0.14));
      // buckles
      const up = dir(180 + sk.torsoAng);
      const side = { x: -up.y, y: up.x };
      const chest = T(sk.chest);
      for (const a of [0.45, -0.35]) {
        const p = add(add(chest, up, -m.torso * 0.38), side, a * m.shW * 0.9);
        put(p.x, p.y, col(botA), Part.Torso);
      }
    }
  } else if (bottom === 'kilt' || bottom === 'skirt' || bottom === 'longskirt') {
    const len = bottom === 'longskirt' ? 1.1 : 0.7;
    dress(botRamp, (p, u) => (p === Part.Torso && u < waist) || (isThigh(p) && u < len) || (bottom === 'longskirt' && isShin(p) && u < 0.8), botPat ?? (bottom === 'kilt' ? patternFn('plaid', botC, botA, frame, seed) : undefined));
  }
  // waistband
  if (bottom !== 'none' && bottom !== 'kilt') {
    dress(rampCloth(botA), (p, u) => p === Part.Torso && u >= waist - 0.05 && u < waist + 0.02);
  }

  // ---- tops
  const top = look.top;
  const topRamp = rampCloth(topC);
  const topPat = patternFn(look.topPattern, topC, topA, frame, seed);
  const shortSleeve = ['tee', 'polo', 'buttondown', 'blouse', 'flannel', 'uniform', 'scrubs', 'apron', 'vest', 'dress', 'referee'].includes(top);
  const longSleeve = ['bodysuit', 'rashguard', 'hoodie', 'jacket', 'track', 'cardigan', 'sweater'].includes(top);
  const refStripes = top === 'referee' ? (x: number) => (((x + seed) >> 1) & 1 ? rampCloth(topA) : null) : undefined;
  if (top === 'singlet') {
    dress(topRamp, (p, u, a) => (p === Part.Torso && (u < 0.84 || Math.abs(a - 0.5) < 0.16 || Math.abs(a + 0.42) < 0.16)) || (isThigh(p) && u < 0.3 && bottom === 'none'), topPat);
    // neckline trim
    dress(rampCloth(topA), (p, u, a) => p === Part.Torso && u >= 0.8 && u < 0.85 && Math.abs(a) < 0.3);
  } else if (top === 'tank') {
    dress(topRamp, (p, u, a) => p === Part.Torso && (u < 0.82 || Math.abs(a - 0.5) < 0.24 || Math.abs(a + 0.4) < 0.24), topPat);
  } else if (shortSleeve) {
    dress(topRamp, (p, u) => (p === Part.Torso && u < 0.97) || isSh(p) || (isUp(p) && u < 0.55), topPat ?? refStripes);
    if (top === 'buttondown' || top === 'uniform' || top === 'polo') {
      const up = dir(180 + sk.torsoAng);
      const side = { x: -up.y, y: up.x };
      const chest = T(sk.chest);
      for (let k = 0; k < 4; k++) {
        const p = add(add(chest, up, -m.torso * (0.12 + k * 0.2)), side, m.shW * 0.1);
        put(p.x, p.y, col(topA), Part.Torso);
      }
    }
  } else if (longSleeve) {
    dress(topRamp, (p, u) => (p === Part.Torso && u < 0.97) || isSh(p) || isUp(p) || (isFore(p) && u < 0.86), topPat);
    // cuffs / zipper
    dress(rampCloth(topA), (p, u) => isFore(p) && u >= 0.78 && u < 0.86);
    if (top === 'track' || top === 'jacket' || top === 'hoodie') {
      const up = dir(180 + sk.torsoAng);
      const chest = T(sk.chest);
      for (let k = 0; k < 6; k++) {
        const p = add(chest, up, -m.torso * (0.1 + k * 0.15));
        put(p.x, p.y, col(topA), Part.Torso);
      }
    }
  } else if (top === 'sportsbra') {
    dress(topRamp, (p, u, a) => p === Part.Torso && ((u > 0.55 && u < 0.84) || (u >= 0.84 && (Math.abs(a - 0.45) < 0.16 || Math.abs(a + 0.4) < 0.16))), topPat);
    dress(rampCloth(topA), (p, u) => p === Part.Torso && u > 0.55 && u < 0.6);
  } else if (top === 'crop') {
    dress(topRamp, (p, u) => (p === Part.Torso && u > 0.5) || isSh(p) || (isUp(p) && u < 0.4), topPat);
  }

  // ---- shoes
  if (look.shoes === 'wrestling-boots') {
    const boot = rampCloth(shoeC);
    dress(boot, (p, u) => (isShin(p) && u >= bootTop) || isFoot(p));
    // top band in the accent (bottom accent, or a light trim)
    const band = rampCloth(botA === botC ? liA(shoeC, 0.3) : botA);
    dress(band, (p, u) => isShin(p) && u >= bootTop && u < bootTop + 0.1);
    laces(sk, T, m, shoeC);
    // sole
    dress(rampCloth(shA(shoeC, 0.5)), (p, u, a) => isFoot(p) && a < -0.55 && u > 0.1);
  } else if (look.shoes === 'kickpads') {
    const pad = rampCloth(shoeC);
    dress(pad, (p, u) => (isShin(p) && u >= bootTop) || isFoot(p));
    dress(rampCloth(botA), (p, u, a) => isShin(p) && u >= bootTop + 0.08 && a > 0.1 && ((u * 20) | 0) % 2 === 0);
  } else if (look.shoes === 'boots' || look.shoes === 'cowboy-boots' || look.shoes === 'rainboots') {
    dress(rampCloth(shoeC), (p, u) => (isShin(p) && u >= bootTop) || isFoot(p));
    dress(rampCloth(shA(shoeC, 0.4)), (p, u, a) => isFoot(p) && a < -0.5 && u > 0.1);
  } else if (look.shoes !== 'barefoot' && look.shoes !== 'sandals' && look.shoes !== 'flipflops') {
    const hi = look.shoes === 'hightops';
    dress(rampCloth(shoeC), (p, u) => isFoot(p) || (isShin(p) && u > (hi ? 0.8 : 0.9)));
    dress(rampCloth('#f6f2ea'), (p, u, a) => isFoot(p) && a < -0.45 && u > 0.1);
  }

  // ---- socks / kneepads / braces
  if (ex('socks')) dress(rampCloth(ex('socks')!.color), (p, u) => isShin(p) && u > 0.3 && u < bootTop);
  const kp = ex('kneepads') ?? ex('knee-brace');
  if (kp) {
    const pad = rampCloth(kp.color);
    dress(pad, (p, u) => (isThigh(p) && u > 0.8) || (isShin(p) && u < 0.24));
    for (const l of [sk.near, sk.far]) {
      const k = T(l.knee);
      put(k.x - 1, k.y - 1, pad[4], Part.NShin);
      if (kp.id === 'knee-brace') put(k.x, k.y, col(kp.accent ?? '#8a8aa0'), Part.NShin);
    }
  }
  // ---- arms: elbow pads, wrist tape, gloves, bangles
  const ep = ex('elbow-pads');
  if (ep) dress(rampCloth(ep.color), (p, u) => (isUp(p) && u > 0.8) || (isFore(p) && u < 0.22));
  const wt = ex('wrist-tape');
  if (wt) {
    dress(rampCloth(wt.color), (p, u) => isFore(p) && u > 0.74 && u < 0.95);
    dress(rampCloth(shA(wt.color, 0.2)), (p, u) => isFore(p) && u > 0.8 && u < 0.84);
  }
  const gl = ex('gloves');
  if (gl) dress(rampCloth(gl.color), (p, u) => isHand(p) || (isFore(p) && u > 0.88));
  const bg = ex('bangles');
  if (bg) dress(rampMetal(bg.color), (p, u) => isFore(p) && u > 0.82 && u < 0.9);
  // ---- belts
  const belt = ex('title-belt') ?? ex('cardboard-belt') ?? ex('tool-belt');
  if (belt && !pd.rot) {
    const metal = belt.id === 'title-belt';
    const strap = rampCloth(belt.accent ?? (metal ? '#3a3448' : '#a07850'));
    dress(strap, (p, u) => p === Part.Torso && u > 0.1 && u < 0.24);
    const up = dir(180 + sk.torsoAng);
    const side = { x: -up.y, y: up.x };
    const hip = T(sk.hip);
    const plate = metal ? rampMetal(belt.color) : rampCloth(belt.color);
    const pc = add(add(hip, up, m.torso * 0.17), side, m.shW * 0.25);
    vol(add(pc, side, -m.shW * 0.3), add(pc, side, m.shW * 0.35), () => 2.2 * S, () => 2.2 * S, plate, Part.Prop);
    if (metal) put(pc.x, pc.y - 1, col('#fff6d0'), Part.Prop);
    else put(pc.x, pc.y, col('#d8434b'), Part.Prop);
  }
  // ---- neck: bow tie, scarf, pearls, medal
  const neck = T(sk.neckTop);
  if (ex('bowtie')) {
    const c = col(ex('bowtie')!.color);
    const p = add(neck, dir(180 + sk.torsoAng), -m.neck * 0.5 - 1);
    put(p.x - 1, p.y, c, Part.Prop);
    put(p.x + 1, p.y, c, Part.Prop);
    put(p.x - 2, p.y - 1, c, Part.Prop);
    put(p.x + 2, p.y - 1, c, Part.Prop);
    put(p.x - 2, p.y + 1, c, Part.Prop);
    put(p.x + 2, p.y + 1, c, Part.Prop);
    put(p.x, p.y, col('#c8c0e0'), Part.Prop);
  }
  if (ex('pearls') || ex('medal') || ex('scarf') || ex('bandana')) {
    const e = (ex('pearls') ?? ex('medal') ?? ex('scarf') ?? ex('bandana'))!;
    const p = add(neck, dir(180 + sk.torsoAng), -m.neck - 1);
    for (let k = -2; k <= 2; k++) put(p.x + k, p.y + (Math.abs(k) === 2 ? -1 : 0), e.id === 'pearls' ? col('#fff6ea') : col(e.color), Part.Prop);
    if (e.id === 'medal') put(p.x, p.y + 2, col(e.accent ?? '#f4b63f'), Part.Prop);
  }
  void pose;
}

function laces(sk: Skel, T: (p: Pt) => Pt, m: Met, shoeC: string): void {
  // dotted lace line down the front of each boot (dark laces on light boots)
  const light = lum(shoeC) > 0.55;
  const lace = col(light ? shA(shoeC, 0.3) : liA(shoeC, 0.5));
  const eye = col(light ? shA(shoeC, 0.55) : shA(shoeC, 0.5));
  for (const l of [sk.near, sk.far]) {
    const k = T(l.knee);
    const a = T(l.ankle);
    const dx = a.x - k.x;
    const dy = a.y - k.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    // the front of the shin is the side the toe points to
    const toe = T(l.toe);
    const sgn = (toe.x - a.x) * nx + (toe.y - a.y) * ny >= 0 ? 1 : -1;
    for (let u = 0.3; u < 0.96; u += 0.11) {
      const px = k.x + dx * u + nx * sgn * (m.calfR * 0.55);
      const py = k.y + dy * u + ny * sgn * (m.calfR * 0.55);
      const i = ((py | 0) * BW + (px | 0)) | 0;
      if (D[i] && isShin(PART[i])) {
        D[i] = ((u * 9) | 0) % 2 ? lace : eye;
      }
    }
  }
}

function backExtras(look: Look, m: Met, pd: PoseDef, sk: Skel, T: (p: Pt) => Pt, frame: number, seed: number): void {
  const extras = look.extras ?? [];
  const cape = extras.find((e) => e.id === 'robe' || e.id === 'cape' || e.id === 'duster');
  const wings = extras.find((e) => e.id === 'wings' || e.id === 'moth-wings');
  if (cape && pd.cape) {
    const ramp = rampCloth(cape.color);
    const pat = patternFn(cape.pattern, cape.color, cape.accent ?? liA(cape.color, 0.4), frame, seed);
    const up = dir(180 + sk.torsoAng);
    const back = { x: up.y, y: -up.x };
    const chest = T(sk.chest);
    const top = add(add(chest, up, m.S * 2), back, m.shW * 0.5);
    const len = cape.id === 'duster' ? m.torso + m.thigh * 0.9 : m.torso + m.thigh * 0.6;
    const sway = Math.sin(frame * 1.5 + seed) * 2 * m.S;
    const bot = add(add(top, back, m.shW * 0.9 + sway), { x: 0, y: 1 }, len);
    vol(top, bot, (u) => m.shW * (0.9 + u * 0.9), (u) => m.shW * (0.5 + u * 0.5), ramp, Part.Prop);
    if (pat) {
      for (let y = 0; y < BH; y++)
        for (let x = 0; x < BW; x++) {
          const i = y * BW + x;
          if (!D[i] || PART[i] !== Part.Prop) continue;
          const r = pat(x, y, 0.5, 0);
          if (r) D[i] = r[LV[i]];
        }
    }
    // hem and collar trim
    const trim = col(cape.accent ?? liA(cape.color, 0.4));
    for (let k = -m.shW * 1.6; k <= m.shW * 1.6; k += 2) put(bot.x + k, bot.y + m.shW * 0.4, trim, Part.Prop);
  }
  if (wings && pd.wings) {
    const open = pd.wings === 'open';
    const ramp = rampCloth(wings.color);
    const acc = col(wings.accent ?? liA(wings.color, 0.4));
    const chest = T(sk.chest);
    const up = dir(180 + sk.torsoAng);
    const back = { x: up.y, y: -up.x };
    const root = add(chest, back, m.shW * 0.4);
    if (open) {
      for (const [a, l, r] of [[-150, 1.1, 0.55], [-110, 1.0, 0.5], [-70, 0.8, 0.42]] as [number, number, number][]) {
        const tip = add(root, dir(a + sk.torsoAng * 0.5), m.torso * l);
        vol(root, tip, (u) => m.shW * r * (0.3 + u * 1.1), (u) => m.shW * r * (0.3 + u * 1.1), ramp, Part.Prop);
        const e = add(root, { x: tip.x - root.x, y: tip.y - root.y }, 0.75);
        put(e.x, e.y, acc, Part.Prop);
        put(e.x + 1, e.y, acc, Part.Prop);
      }
    } else {
      const tip = add(root, dir(-168), m.torso * 0.95);
      vol(root, tip, (u) => m.shW * 0.35 * (1 - u * 0.3), (u) => m.shW * 0.55 * (1 - u * 0.4), ramp, Part.Prop);
    }
  }
}

function headGear(look: Look, m: Met, c: Pt, ang: number, face: Face, seed: number, frame: number): void {
  const S = m.S;
  const hw = m.headW / 2;
  const hh = m.head / 2;
  const up = dir(180 + ang);
  const back = { x: up.y, y: -up.x };
  const mask = look.mask ?? 'none';
  const extras = look.extras ?? [];
  const ex = (id: string) => extras.find((e) => e.id === id);
  if (mask !== 'none' && look.species !== 'raccoon') {
    const mc = look.maskColor ?? '#d8434b';
    const ma = look.maskAccent ?? liA(mc, 0.5);
    const ramp = rampCloth(mc);
    const acc = col(ma);
    const eyeY = Math.round(c.y - hh * 0.08);
    const mouthY = eyeY + Math.round(2 * S) + Math.round(2.5 * S);
    const nearX = Math.round(c.x - hw * 0.28);
    const farX = Math.round(c.x + hw * 0.48);
    const pat = patternFn(look.maskPattern === 'stripe' ? 'solid' : look.maskPattern, mc, ma, frame, seed);
    for (let y = Math.floor(c.y - hh - 3); y <= Math.ceil(c.y + hh + (mask === 'hood' || mask === 'moth' ? m.neck + 3 : 1)); y++)
      for (let x = Math.floor(c.x - hw - 3); x <= Math.ceil(c.x + hw + 3); x++) {
        const i = y * BW + x;
        if (!D[i]) continue;
        const p = PART[i];
        const isNeck = p === Part.Neck && (mask === 'hood' || mask === 'moth');
        if (p !== Part.Head && p !== Part.Hair && !isNeck) continue;
        if (p === Part.Hair && mask !== 'hood' && mask !== 'moth' && mask !== 'luchador') continue;
        // openings
        const isEye = (Math.abs(x - nearX - 0.5) <= 1.2 && Math.abs(y - eyeY) <= 0.6) || (Math.abs(x - farX) <= 0.6 && Math.abs(y - eyeY) <= 0.6);
        const isMouth = y >= mouthY - 1 && x >= c.x - hw * 0.1;
        if (mask === 'domino') {
          if (Math.abs(y - eyeY) > 1.4 || isEye) continue;
        } else if (mask === 'half') {
          if (y > mouthY - 2 || isEye) continue;
        } else if (isEye) continue;
        else if (mask === 'luchador' && isMouth && y <= c.y + hh) continue;
        else if (mask === 'luchador' && y > c.y + hh - 1 && x > c.x) continue;
        const lv = LV[i] || 2;
        const pr = pat?.(x, y, 0.5, (x - c.x) / hw);
        D[i] = pr ? pr[lv] : ramp[lv];
        PART[i] = Part.Head;
        CL[i] = 0;
      }
    // trim around the eyes and mouth
    for (const [ex0, ew] of [[nearX - 1, 3], [farX - 1, 2]] as [number, number][]) {
      for (let x = ex0 - 1; x <= ex0 + ew; x++) {
        if (at(x, eyeY - 1) && mask !== 'domino') put(x, eyeY - 1, acc, Part.Head);
        if (at(x, eyeY + 1) && mask !== 'domino') put(x, eyeY + 1, acc, Part.Head);
      }
      if (at(ex0 - 1, eyeY)) put(ex0 - 1, eyeY, acc, Part.Head);
      if (at(ex0 + ew, eyeY)) put(ex0 + ew, eyeY, acc, Part.Head);
    }
    if (mask === 'luchador') {
      for (let x = c.x - hw * 0.1 - 1; x <= c.x + hw; x++) if (at(x, mouthY - 2)) put(x, mouthY - 2, acc, Part.Head);
      // lace at the back
      for (let k = 0; k < 4; k++) {
        const p = add(add(c, up, hh * 0.3 - k * 2), back, hw - 1);
        put(p.x, p.y, k % 2 ? acc : col(shA(mc, 0.4)), Part.Head);
      }
      // center stripe / pattern crest
      if (look.maskPattern === 'stripe' || look.maskPattern === 'split') {
        for (let k = -hh; k <= hh * 0.3; k++) {
          const p = add(add(c, up, -k), back, -hw * 0.1);
          if (at(p.x, p.y)) put(p.x, p.y, acc, Part.Head);
        }
      }
      if (look.maskPattern === 'wings' || look.maskPattern === 'flames') {
        for (let k = 0; k < 5; k++) {
          const p = add(add(c, up, hh * 0.55 + k * 0.6), back, -hw * 0.3 + k * 1.4);
          if (at(p.x, p.y)) put(p.x, p.y, acc, Part.Head);
          const q = add(add(c, up, hh * 0.5 + k * 0.4), back, hw * 0.1 + k * 1.2);
          if (at(q.x, q.y)) put(q.x, q.y, acc, Part.Head);
        }
      }
      if (look.maskPattern === 'star' || look.maskPattern === 'heart' || look.maskPattern === 'lightning') {
        const p = add(c, up, hh * 0.55);
        put(p.x, p.y - 1, acc, Part.Head);
        put(p.x - 1, p.y, acc, Part.Head);
        put(p.x, p.y, acc, Part.Head);
        put(p.x + 1, p.y, acc, Part.Head);
        put(p.x, p.y + 1, acc, Part.Head);
      }
    }
    if (mask === 'moth') {
      // antennae and big round lenses
      for (const sx of [-1, 1]) {
        const p = add(add(c, up, hh + 1), back, sx * hw * 0.35);
        lineTo(p.x, p.y, p.x + sx * 2, p.y - 4, acc, Part.Head);
      }
      for (const [x0, r] of [[nearX, 2], [farX, 1]] as [number, number][]) {
        vol({ x: x0 + 0.5, y: eyeY + 0.5 }, { x: x0 + 0.5, y: eyeY + 0.5 }, () => r, () => r, rampMetal('#e8343c'), Part.Head);
      }
    }
    // eyes stay visible: re-dot the pupils
    const eyeC = col(look.eyeColor || '#3a2a20');
    if (face !== 'hurt' && mask !== 'moth') {
      put(nearX, eyeY, col('#fffaf0'), Part.Head);
      put(nearX + 1, eyeY, eyeC, Part.Head);
      put(farX, eyeY, eyeC, Part.Head);
    }
  } else {
    hairCap(look, m, c, ang, seed, frame);
  }
  // face paint
  const paint = look.paint ?? 'none';
  if (paint !== 'none') {
    const pc = col(look.paintColor ?? '#f4f2fa');
    const eyeY = Math.round(c.y - hh * 0.08);
    const nearX = Math.round(c.x - hw * 0.28);
    const farX = Math.round(c.x + hw * 0.48);
    const onFace = (x: number, y: number) => at(x, y) && PART[((y | 0) * BW + (x | 0)) | 0] === Part.Head;
    switch (paint) {
      case 'stripes':
        for (let k = 0; k < 3; k++) for (let y = eyeY + 1; y <= eyeY + 4; y++) if (onFace(nearX - 1 + k * 3, y) && y !== eyeY) put(nearX - 1 + k * 3, y, pc, Part.Head);
        break;
      case 'skull':
        for (let y = eyeY - 3; y <= eyeY + 6; y++) for (let x = c.x - hw + 1; x <= c.x + hw; x++) if (onFace(x, y) && (y < eyeY - 1 || y > eyeY + 1)) put(x, y, pc, Part.Head);
        for (let y = eyeY + 4; y <= eyeY + 6; y++) for (let x = c.x; x <= c.x + hw - 1; x += 2) if (onFace(x, y)) put(x, y, AK, Part.Head);
        break;
      case 'star':
        put(nearX + 1, eyeY - 2, pc, Part.Head);
        put(nearX - 1, eyeY, pc, Part.Head);
        put(nearX + 2, eyeY, pc, Part.Head);
        put(nearX, eyeY + 2, pc, Part.Head);
        put(nearX + 1, eyeY + 2, pc, Part.Head);
        break;
      case 'tears':
        for (let y = eyeY + 1; y <= eyeY + 4; y++) {
          if (onFace(nearX, y)) put(nearX, y, pc, Part.Head);
          if (onFace(farX, y)) put(farX, y, pc, Part.Head);
        }
        break;
      case 'split':
        for (let y = c.y - hh; y <= c.y + hh; y++) for (let x = c.x; x <= c.x + hw; x++) if (onFace(x, y) && Math.abs(y - eyeY) > 0) put(x, y, mixc(at(x, y), pc, 0.7), Part.Head);
        break;
      case 'peak':
        for (let y = c.y - hh; y <= eyeY - 2; y++) for (let x = c.x - hw; x <= c.x + hw; x++) if (onFace(x, y) && Math.abs(x - c.x) < (y - (c.y - hh)) * 1.2) put(x, y, pc, Part.Head);
        break;
      case 'sparkle':
        for (const [dx, dy] of [[-2, 1], [1, 2], [3, 0], [0, -3]]) if (onFace(nearX + dx, eyeY + dy)) put(nearX + dx, eyeY + dy, pc, Part.Head);
        break;
      case 'heart':
        put(nearX - 1, eyeY + 2, pc, Part.Head);
        put(nearX + 1, eyeY + 2, pc, Part.Head);
        put(nearX - 1, eyeY + 3, pc, Part.Head);
        put(nearX, eyeY + 3, pc, Part.Head);
        put(nearX + 1, eyeY + 3, pc, Part.Head);
        put(nearX, eyeY + 4, pc, Part.Head);
        break;
      case 'tribal':
        for (let k = 0; k < 5; k++) if (onFace(nearX - 2 + k, eyeY + 2 + (k >> 1))) put(nearX - 2 + k, eyeY + 2 + (k >> 1), pc, Part.Head);
        break;
      default:
        break;
    }
  }
  // glasses
  const glasses = ex('glasses') ?? ex('round-glasses') ?? ex('cateye') ?? ex('halfmoon') ?? ex('sunglasses') ?? ex('aviators') ?? ex('safety-glasses');
  if (glasses && glasses.id !== 'safety-glasses') {
    const eyeY = Math.round(c.y - hh * 0.08);
    const nearX = Math.round(c.x - hw * 0.28);
    const farX = Math.round(c.x + hw * 0.48);
    const fc = col(glasses.color);
    const dark = glasses.id === 'sunglasses' || glasses.id === 'aviators';
    for (const [x0, w] of [[nearX - 1, 4], [farX - 1, 3]] as [number, number][]) {
      for (let x = x0; x < x0 + w; x++) {
        put(x, eyeY - 1, fc, Part.Head);
        put(x, eyeY + 1, fc, Part.Head);
        if (dark) put(x, eyeY, col('#2b2140'), Part.Head);
      }
      put(x0 - 1, eyeY, fc, Part.Head);
      put(x0 + w, eyeY, fc, Part.Head);
    }
    if (dark) put(nearX, eyeY, col('#6a7ab0'), Part.Head);
  }
  // headband / crown / hats
  const band = ex('headband') ?? ex('head-bandana') ?? ex('headwrap');
  if (band) {
    const p = add(c, up, hh * 0.45);
    for (let k = -hw - 1; k <= hw + 1; k++) {
      const q = add(p, back, k);
      if (at(q.x, q.y) && at(q.x, q.y + 1)) {
        put(q.x, q.y, col(band.color), Part.Head);
        put(q.x, q.y + 1, col(shA(band.color, 0.3)), Part.Head);
      }
    }
  }
  if (ex('crown')) {
    const cr = ex('crown')!;
    const p = add(c, up, hh + 1.5 * S);
    const g = rampMetal(cr.color);
    for (let k = -3; k <= 3; k++) {
      const q = add(p, back, k * S * 1.2);
      put(q.x, q.y, g[2], Part.Prop);
      put(q.x, q.y + 1, g[1], Part.Prop);
      if (k % 2 === 0) {
        put(q.x, q.y - 1, g[3], Part.Prop);
        if (k === 0) put(q.x, q.y - 2, col(cr.accent ?? '#e8343c'), Part.Prop);
      }
    }
  }
  const hat = ex('cowboy-hat') ?? ex('cap') ?? ex('chef-hat') ?? ex('mortarboard') ?? ex('hat') ?? ex('beanie') ?? ex('bucket-hat') ?? ex('sheriff-hat');
  if (hat) {
    const hc = rampCloth(hat.color);
    const brim = col(shA(hat.color, 0.4));
    const base = add(c, up, hh * 0.55);
    const top = add(c, up, hh + (hat.id === 'chef-hat' ? 6 : hat.id === 'cowboy-hat' ? 4 : 3) * S);
    vol(add(base, up, 1), top, () => hw * (hat.id === 'mortarboard' ? 0.95 : hat.id === 'chef-hat' ? 1.0 : 0.85), () => hw * 0.85, hc, Part.Prop);
    const bw = hat.id === 'cowboy-hat' || hat.id === 'sheriff-hat' ? hw * 1.8 : hat.id === 'mortarboard' ? hw * 1.6 : hat.id === 'cap' ? hw * 0.6 : hw * 1.1;
    const bstart = hat.id === 'cap' ? 0 : -bw;
    for (let k = bstart; k <= bw; k++) {
      const q = add(base, back, -k);
      put(q.x, q.y, brim, Part.Prop);
      if (hat.id === 'cowboy-hat' && Math.abs(k) > bw - 2) put(q.x, q.y - 1, brim, Part.Prop);
    }
    if (hat.id === 'mortarboard') {
      const q = add(top, back, -hw);
      lineTo(q.x, q.y, q.x - 1, q.y + 4, col(hat.accent ?? '#ffd84a'), Part.Prop);
    }
  }
  void seed;
}
