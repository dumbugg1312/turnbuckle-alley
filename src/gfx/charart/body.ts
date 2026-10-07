import type { Dir } from '../../core/state';
import type { Look } from '../look';
import { clamp, D2R, type Pt } from './raster';

/**
 * Body metrics, poses and kinematics for the character art.
 *
 * Proportions are natural rather than chibi: a standard adult is 30 px tall (D-019)
 * with an 8 px head (about 1/4 of the height), a visible neck, shoulders
 * wider than the waist and real feet. Giants reach the low forties, kids the
 * low twenties.
 */
export type Pose =
  | 'idle' | 'walk' | 'strike' | 'kick' | 'grapple' | 'lift' | 'lifted' | 'down' | 'stagger'
  | 'taunt' | 'climb' | 'perch' | 'aerial' | 'hold' | 'held' | 'pin' | 'pinned' | 'sell'
  | 'celebrate' | 'sit' | 'wave' | 'fireup' | 'run' | 'hop';

export const POSES: Pose[] = ['idle', 'walk', 'strike', 'kick', 'grapple', 'lift', 'lifted', 'down', 'stagger', 'taunt', 'climb', 'perch', 'aerial', 'hold', 'held', 'pin', 'pinned', 'sell', 'celebrate', 'sit', 'wave', 'fireup', 'run', 'hop'];

export interface Met {
  headW: number;
  headH: number;
  neck: number;
  torsoH: number;
  shW: number;
  waistW: number;
  hipW: number;
  belly: number;
  /** Side-view thickness of the torso. */
  depth: number;
  upArm: number;
  foreArm: number;
  armD: number;
  foreD: number;
  handD: number;
  thigh: number;
  shin: number;
  legD: number;
  calfD: number;
  footL: number;
  gap: number;
  shoe: number;
  /** Elders lean forward a little. */
  stoop: number;
  /** Chest muscle definition 0..1. */
  ripped: number;
}

const BODY: Record<string, Met> = {
  petite: { headW: 7, headH: 7, neck: 2, torsoH: 7, shW: 8, waistW: 6, hipW: 7, belly: 0, depth: 5, upArm: 4, foreArm: 3, armD: 2, foreD: 2, handD: 2, thigh: 4, shin: 4, legD: 2, calfD: 2, footL: 4, gap: 1, shoe: 2, stoop: 0, ripped: 0.2 },
  lean: { headW: 7, headH: 8, neck: 2, torsoH: 8, shW: 9, waistW: 6, hipW: 7, belly: 0, depth: 5, upArm: 5, foreArm: 4, armD: 2, foreD: 2, handD: 3, thigh: 5, shin: 5, legD: 3, calfD: 2, footL: 5, gap: 1, shoe: 2, stoop: 0, ripped: 0.5 },
  athletic: { headW: 7, headH: 8, neck: 2, torsoH: 8, shW: 10, waistW: 7, hipW: 8, belly: 0, depth: 6, upArm: 5, foreArm: 4, armD: 3, foreD: 3, handD: 3, thigh: 5, shin: 5, legD: 3, calfD: 3, footL: 5, gap: 1, shoe: 2, stoop: 0, ripped: 1 },
  stocky: { headW: 8, headH: 8, neck: 2, torsoH: 8, shW: 12, waistW: 10, hipW: 10, belly: 1, depth: 8, upArm: 5, foreArm: 3, armD: 4, foreD: 3, handD: 3, thigh: 4, shin: 4, legD: 4, calfD: 4, footL: 5, gap: 2, shoe: 2, stoop: 0, ripped: 0.7 },
  heavy: { headW: 8, headH: 8, neck: 2, torsoH: 9, shW: 12, waistW: 13, hipW: 12, belly: 2, depth: 10, upArm: 5, foreArm: 3, armD: 4, foreD: 4, handD: 3, thigh: 4, shin: 4, legD: 5, calfD: 4, footL: 6, gap: 2, shoe: 2, stoop: 0, ripped: 0 },
  giant: { headW: 9, headH: 9, neck: 2, torsoH: 10, shW: 15, waistW: 12, hipW: 12, belly: 1, depth: 10, upArm: 7, foreArm: 5, armD: 5, foreD: 4, handD: 4, thigh: 6, shin: 6, legD: 5, calfD: 4, footL: 7, gap: 2, shoe: 2, stoop: 0, ripped: 0.8 },
};

/**
 * Art pixels per native (world) pixel. Sprites are painted on a grid K times
 * finer than the world and drawn at 1/K, so silhouettes keep their on-screen
 * size while faces, hands and cloth get K*K the pixels (DECISIONS.md D-017).
 */
export const K = 2;

/** Metrics in art pixels (native metrics scaled by K). */
export function metricsArt(look: Look): Met {
  const m = metrics(look);
  const o = { ...m };
  for (const key of ['headW', 'headH', 'neck', 'torsoH', 'shW', 'waistW', 'hipW', 'belly', 'depth', 'upArm', 'foreArm', 'armD', 'foreD', 'handD', 'thigh', 'shin', 'legD', 'calfD', 'footL', 'gap', 'shoe'] as const) o[key] = m[key] * K;
  return o;
}

/** Metrics in native pixels (used for layout and the portraits). */
export function metrics(look: Look): Met {
  const m = { ...(BODY[look.body] ?? BODY.athletic) };
  const age = look.age ?? 'adult';
  if (age === 'kid') {
    // Kids: short, with proportionally bigger heads.
    Object.assign(m, { headW: 7, headH: 7, neck: 1, torsoH: 6, shW: 6, waistW: 5, hipW: 6, belly: 0, depth: 4, upArm: 3, foreArm: 3, armD: 2, foreD: 2, handD: 2, thigh: 4, shin: 4, legD: 2, calfD: 2, footL: 4, gap: 1, shoe: 1, ripped: 0 });
  }
  let h = Math.round(clamp(look.height || 0, -3, 8) * 0.45);
  if (age === 'teen') h -= 1;
  if (age === 'elder') {
    h -= 1;
    m.stoop = 1;
  }
  // Spread extra height over the legs and torso, alternating (legs first).
  let legs = 0;
  let torso = 0;
  for (let i = 0; i < Math.abs(h); i++) (i % 2 === 0 ? (legs += Math.sign(h)) : (torso += Math.sign(h)));
  m.thigh = Math.max(3, m.thigh + Math.ceil(legs / 2));
  m.shin = Math.max(3, m.shin + Math.floor(legs / 2));
  m.torsoH = Math.max(5, m.torsoH + torso);
  if (look.species === 'bear') {
    m.headW += 2;
    m.headH += 1;
    m.armD += 1;
    m.foreD += 1;
    m.handD += 1;
    m.legD += 1;
    m.calfD += 1;
    m.thigh = Math.max(3, m.thigh - 1);
    m.waistW += 2;
    m.belly += 1;
    m.ripped = 0;
  }
  if (look.head === 'wide') {
    m.headW += 1;
  } else if (look.head === 'long') {
    m.headH += 1;
  }
  // Arm length follows the body: hanging straight, the wrist lands level with
  // the crotch and the elbow near the waist, as on a real person (the usual
  // anthropometric table, Drillis and Contini, puts the shoulder at 0.818 of
  // height and the wrist at 0.485, just above the crotch). Upper arm to
  // forearm is about 56 to 44. Fixed lengths reached the knee on short torsos.
  const reach = Math.max(3.5, m.torsoH - shoulderJointDown(m, 1) - 0.3);
  m.upArm = reach * 0.56;
  m.foreArm = reach * 0.44;
  return m;
}

/** How far the trapezius falls from the neck to the shoulder point (in `m`'s units; `k` = units per native px). */
export function shoulderDropOf(m: { shW: number; torsoH: number }, k: number): number {
  return Math.max(2 * k, Math.min(m.torsoH * 0.3, m.shW * 0.2));
}

/** Front view: how far the shoulder joint sits below the top of the torso, inside the deltoid. */
export function shoulderJointDown(m: { shW: number; torsoH: number; armD: number }, k: number): number {
  return shoulderDropOf(m, k) * 0.5 + m.armD * 0.35;
}

export function totalHeight(m: Met): number {
  return m.shoe + m.thigh + m.shin + m.torsoH + m.neck + m.headH;
}

// ---------------------------------------------------------------------------
//  Poses
// ---------------------------------------------------------------------------

export type View = 'front' | 'back' | 'side';
export type Expr = 'neutral' | 'happy' | 'grin' | 'pain' | 'angry' | 'yell' | 'dizzy' | 'focus' | 'smug' | 'closed';
export type Hand = 'relax' | 'fist' | 'open' | 'grab';

/** a = upper segment angle, b = lower segment angle (absolute degrees; 0 = straight down, + = forward / outward). */
export interface Lb {
  a: number;
  b: number;
  /** Raise the foot/hand this many px (front-view walk). */
  up?: number;
  /**
   * Front/back view: move the foot down the screen this many px after the
   * body is grounded (a foot stepping toward the camera sits lower).
   */
  dz?: number;
  /** Put the hand here instead (native px from the head centre); the arm solves to reach it. */
  reach?: Pt;
}
export interface PoseDef {
  view: View;
  /** Torso lean in degrees (side view, + forward). */
  torso: number;
  /** Head tilt in degrees (absolute, + chin forward). */
  head: number;
  /** Front-view: screen-right arm; side-view: near arm. */
  armF: Lb;
  armB: Lb;
  legF: Lb;
  legB: Lb;
  expr: Expr;
  rot?: 'cw' | 'ccw';
  /** Ground on feet only (sitting on a chair keeps the hip in the air). */
  feetOnly?: boolean;
  /** Front-view seated (lap). */
  sit?: boolean;
  /** Raise the whole body (hop). */
  lift?: number;
  /** Shift the upper body down (breathing / walk bounce). */
  bob?: number;
  hipX?: number;
  /** Show hand-held props. */
  item?: boolean;
  /** Wings / robe open (arms raised). */
  open?: boolean;
  hand?: Hand;
  /** Hair and cloth secondary motion offset (px, + = trailing down). */
  sway?: number;
  /** Lying flat (built upright, rotated). */
  lying?: boolean;
  /** Front/back view: drop the screen-right shoulder this many px (and raise the other). */
  shTilt?: number;
  /** Side view: swing the near shoulder forward this many px (and the far one back). */
  twist?: number;
  /** Front/back view: extra space between the feet (px). */
  wide?: number;
  /** Front view: glance left (-1) or right (+1). */
  gaze?: number;
}

const lb = (a: number, b: number, up?: number): Lb => ({ a, b, up });

// ---------------------------------------------------------------------------
//  Gaits: walk and run, solved from foot placement
// ---------------------------------------------------------------------------
//
// A gait is built the way an animator keys one: each foot is planted on the
// ground for part of the cycle (stance) and swung forward the rest (swing).
// While planted, a foot slides back at exactly the body's travel speed, so
// as long as the frame rate follows the distance walked (Actor.phase), feet
// stick to the ground. The hip rides as high as the planted legs allow,
// which produces the contact / down / passing / up rhythm by itself; the
// knees come from two-bone IK. Front and back views reuse the same foot
// timeline, mapped to screen depth and leg foreshortening.

/** Frames per walk cycle (two steps). */
export const WALK_FRAMES = 8;
/** Frames per run cycle (two strides). */
export const RUN_FRAMES = 6;
/** A run stride is this much longer than a walk cycle. */
const RUN_STRIDE = 1.55;

export interface GaitStyle {
  /** Walk cycle length (two steps) as a multiple of leg length. */
  stepK: number;
  /** Fraction of the walk cycle each foot is planted (> 0.5 means double support). */
  duty: number;
  /** How straight the planted leg gets (1 = locked knee). Lower = more knee bend and bob. */
  reach: number;
  /** Knee give just after the heel lands (fraction of leg length). */
  give: number;
  /** Swing-foot clearance (fraction of leg length). */
  lift: number;
  /** Arm swing (degrees each way). */
  arm: number;
  /** Arms carried away from the body (degrees). */
  armOut: number;
  /** Resting elbow bend (degrees). */
  elbow: number;
  /** Forward lean while walking (degrees). */
  lean: number;
  /** Springy rise at the passing position (px). */
  bounce: number;
  /** Side-to-side hip sway in front/back views (px). */
  sway: number;
  /** Shoulder roll against the hips (px). */
  roll: number;
  /** Extra stance width in front/back views (px). */
  width: number;
  /** Belly / chest settle after each footfall (px). */
  jiggle: number;
}

const STYLES: Record<string, GaitStyle> = {
  athletic: { stepK: 1.6, duty: 0.6, reach: 0.985, give: 0.035, lift: 0.2, arm: 26, armOut: 4, elbow: 14, lean: 3, bounce: 0, sway: 0.5, roll: 0.5, width: 0, jiggle: 0 },
  lean: { stepK: 1.7, duty: 0.58, reach: 0.99, give: 0.03, lift: 0.22, arm: 28, armOut: 3, elbow: 12, lean: 2, bounce: 0.5, sway: 0.5, roll: 0.5, width: 0, jiggle: 0 },
  petite: { stepK: 1.66, duty: 0.58, reach: 0.99, give: 0.03, lift: 0.24, arm: 26, armOut: 3, elbow: 12, lean: 2, bounce: 0.5, sway: 0.5, roll: 0.5, width: 0, jiggle: 0 },
  stocky: { stepK: 1.45, duty: 0.62, reach: 0.975, give: 0.04, lift: 0.18, arm: 20, armOut: 8, elbow: 18, lean: 4, bounce: 0, sway: 1, roll: 0.5, width: 0, jiggle: 0.5 },
  heavy: { stepK: 1.3, duty: 0.64, reach: 0.955, give: 0.05, lift: 0.15, arm: 14, armOut: 12, elbow: 16, lean: -1, bounce: 0, sway: 1, roll: 1, width: 0.5, jiggle: 0.5 },
  giant: { stepK: 1.45, duty: 0.63, reach: 0.96, give: 0.05, lift: 0.16, arm: 16, armOut: 10, elbow: 20, lean: 6, bounce: 0, sway: 1, roll: 1, width: 0.5, jiggle: 0.5 },
};

/** How a look walks: lumbering, springy, stooped... */
export function gaitStyle(look: Look): GaitStyle {
  const s = { ...(STYLES[look.body] ?? STYLES.athletic) };
  const age = look.age ?? 'adult';
  if (look.species === 'bear') Object.assign(s, STYLES.heavy, { stepK: 1.35, arm: 18, roll: 1, sway: 1 });
  if (age === 'kid') Object.assign(s, { stepK: 1.75, bounce: 1, lift: 0.26, arm: 30, lean: 1, jiggle: 0 });
  else if (age === 'teen') Object.assign(s, { bounce: Math.max(s.bounce, 0.5), arm: s.arm + 2 });
  else if (age === 'elder') {
    s.stepK *= 0.8;
    s.arm *= 0.5;
    s.lift *= 0.7;
    s.bounce = 0;
    s.reach = Math.min(s.reach, 0.97);
    s.elbow += 10;
    s.lean += 2;
  }
  return s;
}

/** World pixels travelled per gait cycle; the walk frame rate follows this (Actor.phase). */
export function cycleLength(look: Look, run = false): number {
  const m = metrics(look);
  return (m.thigh + m.shin) * gaitStyle(look).stepK * (run ? RUN_STRIDE : 1);
}

interface Foot {
  /** Forward of the hip (art px). */
  x: number;
  /** Off the ground (art px). */
  y: number;
  stance: boolean;
  /** 0..1 through stance or swing. */
  k: number;
}

function footAt(u: number, duty: number, S: number, lift: number): Foot {
  if (u < duty) return { x: S / 2 - (u / duty) * S, y: 0, stance: true, k: u / duty };
  const k = (u - duty) / (1 - duty);
  const e = 0.5 - 0.5 * Math.cos(Math.PI * k);
  // The toe clears early, so the arc peaks before mid-swing.
  return { x: -S / 2 + e * S, y: lift * Math.sin(Math.PI * Math.pow(k, 0.8)), stance: false, k };
}

interface GaitSample {
  near: Foot;
  far: Foot;
  /** Hip joint height above the ground (art px). */
  H: number;
}

interface GaitParams {
  m: Met;
  st: GaitStyle;
  run: boolean;
  C: number;
  duty: number;
  S: number;
  liftH: number;
}

function gaitParams(m: Met, st: GaitStyle, run: boolean): GaitParams {
  const L = m.thigh + m.shin;
  const C = L * st.stepK * (run ? RUN_STRIDE : 1);
  const duty = run ? 0.36 : st.duty;
  return { m, st, run, C, duty, S: duty * C, liftH: L * (run ? st.lift * 1.9 : st.lift) };
}

function stanceHeight(g: GaitParams, f: Foot, hj: number): number {
  const L = g.m.thigh + g.m.shin;
  // Loading response: the knee gives a little just after the heel lands.
  const give = g.st.give * Math.sin(Math.PI * Math.min(1, f.k / 0.45)) * (g.run ? 2.2 : 1);
  const R = L * (g.st.reach - give);
  const dx = f.x - hj;
  return g.m.shoe + Math.sqrt(Math.max(0, R * R - dx * dx));
}

function sampleGait(g: GaitParams, p: number, depth = 0): GaitSample {
  const q = ((p % 1) + 1) % 1;
  const near = footAt(q, g.duty, g.S, g.liftH);
  const far = footAt((q + 0.5) % 1, g.duty, g.S, g.liftH);
  let H = Infinity;
  if (near.stance) H = Math.min(H, stanceHeight(g, near, 0.5));
  if (far.stance) H = Math.min(H, stanceHeight(g, far, -0.5));
  if (!Number.isFinite(H)) {
    // Airborne (run): a ballistic arc from take-off to landing.
    if (depth > 0) return { near, far, H: g.m.shoe + (g.m.thigh + g.m.shin) * 0.9 };
    let p0 = q;
    let p1 = q;
    for (let i = 0; i < 50; i++) {
      const a = footAt(((p0 % 1) + 1) % 1, g.duty, g.S, g.liftH);
      const b = footAt((((p0 + 0.5) % 1) + 1) % 1, g.duty, g.S, g.liftH);
      if (a.stance || b.stance) break;
      p0 -= 0.01;
    }
    for (let i = 0; i < 50; i++) {
      const a = footAt(((p1 % 1) + 1) % 1, g.duty, g.S, g.liftH);
      const b = footAt((((p1 + 0.5) % 1) + 1) % 1, g.duty, g.S, g.liftH);
      if (a.stance || b.stance) break;
      p1 += 0.01;
    }
    const h0 = sampleGait(g, p0, 1).H;
    const h1 = sampleGait(g, p1, 1).H;
    const s = (q - p0) / Math.max(0.01, p1 - p0);
    const peak = (g.m.thigh + g.m.shin) * 0.09;
    H = h0 + (h1 - h0) * s + peak * 4 * s * (1 - s);
  }
  return { near, far, H };
}

/** Two-bone IK: hip joint at (hj, -H), ankle at (ax, -ay); y grows downward. Knee bends forward. */
function legIK(m: Met, hj: number, H: number, ax: number, ay: number): Lb {
  const T = m.thigh;
  const Sh = m.shin;
  let dx = ax - hj;
  let dy = H - ay;
  let d = Math.hypot(dx, dy);
  const maxd = T + Sh - 0.01;
  if (d > maxd) {
    dx *= maxd / d;
    dy *= maxd / d;
    d = maxd;
  }
  const th = Math.atan2(dx, dy);
  const al = Math.acos(clamp((T * T + d * d - Sh * Sh) / (2 * T * Math.max(0.01, d)), -1, 1));
  const a = th + al;
  const kx = Math.sin(a) * T;
  const ky = Math.cos(a) * T;
  const b = Math.atan2(dx - kx, dy - ky);
  return { a: a / D2R, b: b / D2R };
}

/** Is this gait frame a footfall? (The world uses it for dust and step sounds.) */
export function gaitPhase(frame: number, run: boolean): number {
  const n = run ? RUN_FRAMES : WALK_FRAMES;
  return (((frame % n) + n) % n) / n;
}

function gaitPose(view: View, p: number, run: boolean, stance: boolean, m: Met, st: GaitStyle): PoseDef {
  const g = gaitParams(m, st, run);
  const smp = sampleGait(g, p);
  const before = sampleGait(g, p - 0.06);
  // H at the passing positions is the top of the bob.
  const top = Math.max(sampleGait(g, 0.25).H, sampleGait(g, 0.75).H);
  const rising = smp.H - before.H;
  const sway = Math.abs(rising) < 0.4 ? 0 : rising > 0 ? 1 : -1;
  // +1 when the near (side) / screen-right (front) leg is forward.
  const c = Math.cos(2 * Math.PI * (p - 0.04));
  const s2 = Math.sin(2 * Math.PI * p);
  const bounce = st.bounce * Math.max(0, Math.sin(4 * Math.PI * (p - 0.125))) * (run ? 0 : 1);
  const jiggle = st.jiggle * Math.max(0, Math.cos(4 * Math.PI * (p - 0.15))) > st.jiggle * 0.6 ? st.jiggle : 0;
  const lowest = Math.min(smp.near.y, smp.far.y);
  const lift = lowest / K + bounce;
  const arm = run ? st.arm + 16 : st.arm;
  const elbow = run ? 78 + st.elbow * 0.3 : st.elbow;
  const lean = (run ? st.lean + 8 : st.lean) + (stance ? 6 : 0);
  if (view === 'side') {
    const legF = legIK(m, 0.5, smp.H, smp.near.x, m.shoe + smp.near.y);
    const legB = legIK(m, -0.5, smp.H, smp.far.x, m.shoe + smp.far.y);
    const fwdN = Math.max(0, -c);
    const fwdF = Math.max(0, c);
    let armF = lb(2 + st.armOut * 0.3 - arm * c, 0);
    armF.b = armF.a + elbow + fwdN * arm * 0.8;
    let armB = lb(-1 + arm * c, 0);
    armB.b = armB.a + elbow + fwdF * arm * 0.8;
    if (stance) {
      armF = lb(36 - c * 8, 146);
      armB = lb(22 + c * 8, 136);
    }
    return {
      view, torso: lean + (run ? 1.5 * Math.cos(4 * Math.PI * p) : 0), head: -lean * 0.5, armF, armB, legF, legB,
      expr: stance ? 'focus' : 'neutral', item: !stance, hand: stance || run ? 'fist' : 'relax',
      lift, bob: jiggle, sway, twist: -st.roll * c,
    };
  }
  // Front / back: the same feet, seen from above. Forward is toward the camera when facing down.
  const toward = view === 'front' ? 1 : -1;
  const L = m.thigh + m.shin;
  const drop = Math.max(0, top - smp.H);
  const hipX = st.sway * s2 * (run ? 0.5 : 1);
  const straight = (dx: number, out: number) => {
    const a = (Math.asin(clamp(dx / L, -0.6, 0.6)) / D2R) * out;
    return { a, b: a };
  };
  // Feet keep their place on the ground while the hips sway over them.
  const legF: Lb = { ...straight(-hipX * K, 1), up: (drop + smp.near.y * 0.8) / K, dz: (toward * smp.near.x * 0.3) / K };
  const legB: Lb = { ...straight(-hipX * K, -1), up: (drop + smp.far.y * 0.8) / K, dz: (toward * smp.far.x * 0.3) / K };
  // An arm swinging forward bends and tucks in front of the body; one swinging back hangs straight.
  const frontArm = (w: number): Lb => {
    const f = Math.max(0, w);
    const bk = Math.max(0, -w);
    const a = 4 + st.armOut * 0.6 + bk * 5 - f * 4;
    const b = a - f * (run ? 70 : 34) + (run ? -20 : 0);
    return { a, b, up: (f * (run ? 2 : 1) + bk * 0.5) * (arm / 26) };
  };
  let armF = frontArm(-c);
  let armB = frontArm(c);
  if (stance) {
    armF = lb(18, 70 - c * 6);
    armB = lb(18, 70 + c * 6);
  }
  return {
    view, torso: 0, head: 0, armF, armB, legF, legB,
    expr: stance ? 'focus' : 'neutral', item: !stance, hand: stance || run ? 'fist' : 'relax',
    lift, bob: jiggle + (drop > 1.2 ? 0.5 : 0), sway, hipX, shTilt: st.roll * 0.5 * s2 > 0.3 ? 0.5 : st.roll * 0.5 * s2 < -0.3 ? -0.5 : 0, wide: st.width,
  };
}

// ---------------------------------------------------------------------------
//  Idle life
// ---------------------------------------------------------------------------
//
// Idle frames are numbered state * 2 + breath. States: 0 rest, 1 weight on
// one hip, 2 / 3 glance one way / the other, then two frames per quirk.

/** Per-character idle habits, in frame order (see idleFrame in characters.ts). */
export const IDLE_QUIRKS = ['tap', 'bounce', 'glasses', 'stretch'] as const;
export type Quirk = (typeof IDLE_QUIRKS)[number];
export const IDLE_REST = 0;
export const IDLE_SHIFT = 1;
export const IDLE_LOOK_A = 2;
export const IDLE_LOOK_B = 3;
export const IDLE_QUIRK0 = 4;

function idlePose(view: View, frame: number, stance: boolean, st: GaitStyle): PoseDef {
  const side = view === 'side';
  const state = frame >> 1;
  const breath = frame & 1;
  const base: PoseDef = side
    ? { view, torso: 0, head: 0, armF: lb(5, 12), armB: lb(-4, 4), legF: lb(3, 0), legB: lb(-3, 0), expr: 'neutral', item: true, hand: 'relax' }
    : { view, torso: 0, head: 0, armF: lb(4 + st.armOut * 0.4, 1 + st.armOut * 0.3), armB: lb(4 + st.armOut * 0.4, 1 + st.armOut * 0.3), legF: lb(0, 0), legB: lb(0, 0), expr: 'neutral', item: true, hand: 'relax', wide: st.width };
  let d: PoseDef = base;
  if (stance) {
    d = side
      ? { ...base, torso: 12, head: -6, armF: lb(42, 150), armB: lb(26, 140), legF: lb(22, -4), legB: lb(-18, -8), expr: 'focus', item: false, hand: 'fist' }
      : { ...base, armF: lb(18, 70), armB: lb(18, 70), legF: lb(10, 4), legB: lb(10, 4), expr: 'focus', item: false, hand: 'fist' };
  }
  // Breathing: the chest settles one art pixel and the hands drift out a touch.
  d = { ...d, bob: breath / K };
  if (breath && !side) {
    d.armF = { ...d.armF, a: d.armF.a + 1.5 };
    d.armB = { ...d.armB, a: d.armB.a + 1.5 };
  }
  if (state === IDLE_SHIFT) {
    // Weight onto one hip: the other knee relaxes, the shoulders tilt against the hips.
    if (side) d = { ...d, torso: d.torso - 2, legF: lb(d.legF.a + 4, d.legF.b - 6), legB: lb(d.legB.a - 1, d.legB.b) };
    else {
      d = { ...d, hipX: 0.5, legF: { ...d.legF, a: d.legF.a - 3, b: d.legF.b - 3 }, legB: { ...d.legB, a: d.legB.a + 4, b: d.legB.b - 2, up: 0.5 }, shTilt: -0.5 };
    }
  } else if (state === IDLE_LOOK_A || state === IDLE_LOOK_B) {
    const dir = state === IDLE_LOOK_A ? -1 : 1;
    if (side) d = { ...d, head: d.head + (dir < 0 ? 9 : -12) };
    else d = { ...d, gaze: dir, shTilt: view === 'back' ? dir * 0.5 : 0 };
  } else if (state >= IDLE_QUIRK0) {
    const q = IDLE_QUIRKS[(state - IDLE_QUIRK0) >> 1];
    const sub = (state - IDLE_QUIRK0) & 1;
    d = { ...d, bob: 0 };
    switch (q) {
      case 'tap':
        // Toe tapping, impatient.
        if (side) d = { ...d, legF: { ...lb(d.legF.a + 8, d.legF.b + 4), up: sub ? 1 : 0 } };
        else d = { ...d, legF: { ...d.legF, a: d.legF.a + 4, b: d.legF.b + 2, up: sub ? 1 : 0, dz: 0.5 } };
        break;
      case 'bounce':
        if (sub === 0) d = { ...d, bob: 0.5, legF: { ...d.legF, up: 0.5 }, legB: { ...d.legB, up: 0.5 } };
        else d = { ...d, lift: 1.5, armF: { ...d.armF, a: d.armF.a + 14, b: d.armF.b + 30 }, armB: { ...d.armB, a: d.armB.a + 14, b: d.armB.b + 30 }, expr: 'happy' };
        break;
      case 'glasses':
        // Push the glasses up the nose with the free (back) hand.
        if (side) d = { ...d, armF: sub ? { a: 0, b: 0, reach: { x: 2.5, y: -0.5 } } : lb(40, 120), item: false, head: d.head - 4 };
        else d = { ...d, armB: sub ? { a: 0, b: 0, reach: { x: -0.5, y: 0 } } : lb(-14, -150), expr: 'neutral' };
        break;
      case 'stretch':
        d = sub
          ? { ...d, armF: lb(168, 176), armB: lb(168, 176), lift: 0.5, expr: 'closed', item: false, open: true, hand: 'open', torso: side ? -6 : 0, head: side ? -14 : 0 }
          : { ...d, armF: lb(110, 150), armB: lb(110, 150), expr: 'closed', item: false, hand: 'open' };
        break;
    }
  }
  return d;
}

function hopPose(view: View, frame: number, st: GaitStyle): PoseDef {
  const side = view === 'side';
  const base = idlePose(view, 0, false, st);
  if ((frame & 1) === 0) {
    // Crouch: anticipation before, squash after.
    return side
      ? { ...base, torso: 14, head: -8, legF: lb(42, -18), legB: lb(30, -34), armF: lb(-20, 10), armB: lb(-30, 0), expr: 'happy' }
      : { ...base, bob: 0.5, legF: { a: 10, b: -8, up: 1 }, legB: { a: 10, b: -8, up: 1 }, armF: lb(20, 40), armB: lb(20, 40), expr: 'happy' };
  }
  // Stretch: airborne, arms flung up and out, toes pointed.
  return side
    ? { ...base, torso: -6, head: -10, armF: lb(150, 170), armB: lb(130, 160), legF: lb(6, 14), legB: lb(-10, -2), expr: 'happy', item: false, hand: 'open', sway: 1, open: true }
    : { ...base, armF: lb(140, 160), armB: lb(140, 160), legF: lb(-2, 0), legB: lb(-2, 0), expr: 'happy', item: false, hand: 'open', sway: 1, open: true };
}

export function sidePose(pose: Pose, frame: number, stance: boolean, m: Met, st: GaitStyle): PoseDef {
  const base: PoseDef = { view: 'side', torso: 0, head: 0, armF: lb(5, 12), armB: lb(-4, 4), legF: lb(3, 0), legB: lb(-3, 0), expr: 'neutral', item: true, hand: 'relax' };
  switch (pose) {
    case 'idle':
      return idlePose('side', frame, stance, st);
    case 'walk':
      return gaitPose('side', gaitPhase(frame, false), false, stance, m, st);
    case 'run':
      return gaitPose('side', gaitPhase(frame, true), true, stance, m, st);
    case 'hop':
      return hopPose('side', frame, st);
    case 'strike':
      return { ...base, torso: 22, head: 6, armF: lb(96, 92), armB: lb(-42, -76), legF: lb(40, 10), legB: lb(-36, -32), expr: 'angry', item: false, hand: 'fist' };
    case 'kick':
      return { ...base, torso: -12, head: 2, armF: lb(52, 104), armB: lb(-62, -40), legF: lb(88, 92), legB: lb(-6, -4), expr: 'yell', item: false, hand: 'fist' };
    case 'grapple':
      return { ...base, torso: 32, head: 8, armF: lb(82, 122), armB: lb(70, 112), legF: lb(36, 4), legB: lb(-34, -24), expr: 'angry', item: false, hand: 'grab' };
    case 'lift':
      return { ...base, torso: -8, head: -16, armF: lb(166, 178), armB: lb(158, 176), legF: lb(20, -6), legB: lb(-20, -10), expr: 'yell', item: false, open: true, hand: 'open' };
    case 'stagger':
      return { ...base, torso: -20, head: -16, armF: lb(130, 170), armB: lb(-60, -100), legF: lb(28, 10), legB: lb(-30, -20), expr: 'dizzy', item: false, open: true, hand: 'open' };
    case 'climb':
      return { ...base, torso: 12, head: -14, armF: lb(160, 172), armB: lb(150, 168), legF: lb(85, 0), legB: lb(-4, -2), expr: 'focus', item: false, hand: 'grab' };
    case 'perch':
      return { ...base, torso: 30, head: -10, armF: lb(110, 150), armB: lb(-70, -40), legF: lb(70, -70), legB: lb(60, -75), expr: 'grin', item: false, open: true, hand: 'fist' };
    case 'hold':
      return { ...base, torso: 40, head: 20, armF: lb(60, 30), armB: lb(50, 20), legF: lb(85, 0), legB: lb(-40, -90), expr: 'angry', item: false, hand: 'grab' };
    case 'held':
      return { ...base, torso: -30, head: -20, armF: lb(140, 170), armB: lb(-40, -70), legF: lb(80, 70), legB: lb(84, 76), expr: 'pain', item: false, hand: 'open', hipX: -2 };
    case 'pin':
      return { ...base, torso: 80, head: 30, armF: lb(10, -10), armB: lb(-20, 10), legF: lb(20, -80), legB: lb(0, -90), expr: 'focus', item: false, hand: 'grab' };
    case 'sell':
      return { ...base, torso: -28, head: -18, armF: lb(130, 200), armB: lb(30, 70), legF: lb(34, -10), legB: lb(-14, -30), expr: 'pain', item: false, hand: 'open' };
    case 'sit':
      return { ...base, torso: -2, armF: lb(32, 84), armB: lb(26, 78), legF: lb(88, 0), legB: lb(84, -4), feetOnly: true };
    case 'wave': {
      const f = frame & 1;
      return { ...base, armF: lb(150, f ? 195 : 160), expr: 'happy', item: false, hand: 'open' };
    }
    default:
      return base;
  }
}

export function frontPose(pose: Pose, frame: number, view: View, stance: boolean, m: Met, st: GaitStyle): PoseDef {
  const base: PoseDef = { view, torso: 0, head: 0, armF: lb(7, 3), armB: lb(7, 3), legF: lb(0, 0), legB: lb(0, 0), expr: 'neutral', item: true, hand: 'relax' };
  switch (pose) {
    case 'idle':
      return idlePose(view, frame, stance, st);
    case 'walk':
      return gaitPose(view, gaitPhase(frame, false), false, stance, m, st);
    case 'run':
      return gaitPose(view, gaitPhase(frame, true), true, stance, m, st);
    case 'hop':
      return hopPose(view, frame, st);
    case 'taunt':
      return { ...base, armF: lb(100, 172), armB: lb(100, 172), legF: lb(10, 2), legB: lb(10, 2), expr: 'smug', item: false, hand: 'fist', open: true };
    case 'celebrate': {
      const f = frame & 1;
      return f
        ? { ...base, armF: lb(168, 178), armB: lb(168, 178), legF: lb(12, -12), legB: lb(12, -12), lift: 3, expr: 'happy', item: false, hand: 'fist', open: true, sway: 2 }
        : { ...base, armF: lb(150, 165), armB: lb(150, 165), legF: lb(8, 2), legB: lb(8, 2), expr: 'happy', item: false, hand: 'fist', open: true };
    }
    case 'fireup':
      return { ...base, armF: lb(42, -30), armB: lb(42, -30), legF: lb(18, 8), legB: lb(18, 8), expr: 'yell', item: false, hand: 'fist', hipX: frame & 1 };
    case 'wave': {
      const f = frame & 1;
      return { ...base, armF: lb(150, f ? 200 : 156), expr: 'happy', item: false, hand: 'open' };
    }
    case 'sit':
      return { ...base, sit: true, armF: lb(14, 34), armB: lb(14, 34), expr: 'neutral' };
    // Lying and flying poses: built in front view, then rotated.
    case 'down':
      return { ...base, armF: lb(55, 70), armB: lb(62, 82), legF: lb(12, 6), legB: lb(18, 2), expr: 'dizzy', item: false, hand: 'open', rot: 'ccw', lying: true };
    case 'pinned':
      return { ...base, armF: lb(92, 100), armB: lb(34, 150), legF: lb(22, 10), legB: lb(8, 4), expr: 'pain', item: false, hand: 'open', rot: 'ccw', lying: true };
    case 'lifted':
      return { ...base, armF: lb(44, 60), armB: lb(40, 56), legF: lb(14, 10), legB: lb(10, 8), expr: 'pain', item: false, hand: 'open', rot: 'ccw', lying: true };
    case 'aerial':
      return { ...base, armF: lb(150, 165), armB: lb(150, 165), legF: lb(26, 20), legB: lb(26, 20), expr: 'yell', item: false, hand: 'open', rot: 'cw', lying: true, open: true };
    default:
      return base;
  }
}

const FRONT_POSES = new Set<Pose>(['taunt', 'celebrate', 'fireup']);
const LYING_POSES = new Set<Pose>(['down', 'pinned', 'lifted', 'aerial']);
const WORLD_POSES = new Set<Pose>(['idle', 'walk', 'run', 'hop', 'sit', 'wave']);

export function resolvePose(pose: Pose, facing: Dir, frame: number, stance: boolean, m: Met, st: GaitStyle): { def: PoseDef; mirror: boolean } {
  if (FRONT_POSES.has(pose)) return { def: frontPose(pose, frame, facing === 'up' ? 'back' : 'front', stance, m, st), mirror: false };
  if (LYING_POSES.has(pose)) return { def: frontPose(pose, frame, 'front', stance, m, st), mirror: facing === 'left' };
  if (WORLD_POSES.has(pose) && (facing === 'down' || facing === 'up')) return { def: frontPose(pose, frame, facing === 'up' ? 'back' : 'front', stance, m, st), mirror: false };
  return { def: sidePose(pose, frame, stance, m, st), mirror: facing === 'left' };
}

// ---------------------------------------------------------------------------
//  Kinematics
// ---------------------------------------------------------------------------

export interface Rig {
  def: PoseDef;
  m: Met;
  hip: Pt;
  th: number;
  neck: Pt;
  head: Pt;
  shF: Pt;
  shB: Pt;
  elF: Pt;
  haF: Pt;
  elB: Pt;
  haB: Pt;
  hipF: Pt;
  hipB: Pt;
  knF: Pt;
  anF: Pt;
  knB: Pt;
  anB: Pt;
  /** Torso local frame. */
  up: Pt;
  fw: Pt;
  /** Head local up vector. */
  upH: Pt;
}

export const dirv = (deg: number, outward = 1): Pt => ({ x: Math.sin(deg * D2R) * outward, y: Math.cos(deg * D2R) });
export const add = (p: Pt, v: Pt, k: number): Pt => ({ x: p.x + v.x * k, y: p.y + v.y * k });

/**
 * Solve joints relative to the feet anchor (0, 0); y grows downward. Pose
 * offsets (lift, bob, hipX, up, dz, shTilt, twist, reach) are in native
 * pixels; `k` converts them to the metric units in use (K for art-pixel metrics).
 */
export function solve(def: PoseDef, m: Met, k = 1): Rig {
  const side = def.view === 'side';
  const lean = def.torso + (side ? m.stoop * 5 : 0);
  const th = lean * D2R;
  const up = side ? { x: Math.sin(th), y: -Math.cos(th) } : { x: 0, y: -1 };
  const fw = side ? { x: Math.cos(th), y: Math.sin(th) } : { x: 1, y: 0 };
  let hip: Pt = { x: (def.hipX ?? 0) * k, y: 0 };
  const legJ = (lg: Lb, hx: number, out: number) => {
    const h0 = { x: hip.x + hx, y: hip.y };
    const kn = add(h0, dirv(lg.a, out), m.thigh);
    const an = add(kn, dirv(lg.b, out), m.shin);
    an.y -= (lg.up ?? 0) * k;
    return { h0, kn, an };
  };
  const legX = side ? 0.5 : m.gap / 2 + m.legD / 2 + ((def.wide ?? 0) * k) / 2;
  // Side view: + is forward for both legs. Front view: + is outward.
  let LF = legJ(def.legF, side ? 0.5 : legX, 1);
  let LB = legJ(def.legB, side ? -0.5 : -legX, side ? 1 : -1);
  if (def.sit) {
    // Front-view seated: thighs point at the camera, so only shins show.
    LF = { h0: LF.h0, kn: { x: LF.h0.x, y: hip.y + 1 }, an: { x: LF.h0.x, y: hip.y + 1 + m.shin + 1 } };
    LB = { h0: LB.h0, kn: { x: LB.h0.x, y: hip.y + 1 }, an: { x: LB.h0.x, y: hip.y + 1 + m.shin + 1 } };
  }
  // Ground: lowest foot (or knee / seat) touches y = 0.
  let low = Math.max(LF.an.y + m.shoe, LB.an.y + m.shoe);
  if (!def.feetOnly) {
    low = Math.max(low, LF.kn.y + m.legD / 2, LB.kn.y + m.legD / 2);
    if (side) low = Math.max(low, hip.y + m.hipW * 0.25);
  }
  const dy = -low - (def.lift ?? 0) * k;
  hip = { x: hip.x, y: hip.y + dy };
  const sh = (o: Pt) => ({ x: o.x, y: o.y + dy });
  LF = { h0: sh(LF.h0), kn: sh(LF.kn), an: sh(LF.an) };
  LB = { h0: sh(LB.h0), kn: sh(LB.kn), an: sh(LB.an) };
  // Depth: a foot nearer the camera sits lower on screen (after grounding, so the body stays put).
  for (const [L, lg] of [[LF, def.legF], [LB, def.legB]] as const) {
    const z = (lg.dz ?? 0) * k;
    if (!z) continue;
    L.an.y += z;
    L.kn.y += z * 0.5;
  }
  const bob = (def.bob ?? 0) * k;
  const torsoBase = { x: hip.x, y: hip.y + bob };
  const neck = add(torsoBase, up, m.torsoH);
  const hd = (side ? def.head + lean * 0.5 + m.stoop * 6 : 0) * D2R;
  const upH = side ? { x: Math.sin(hd), y: -Math.cos(hd) } : { x: 0, y: -1 };
  const head = add(neck, upH, m.neck + m.headH / 2 - 0.5);
  let shF: Pt;
  let shB: Pt;
  if (side) {
    const s0 = add(torsoBase, up, m.torsoH - Math.max(1.5, m.armD * 0.6) - shoulderDropOf(m, k) * 0.3);
    const tw = (def.twist ?? 0) * k;
    shF = add(s0, fw, 0.5 + tw);
    shB = add(s0, fw, -1 - tw);
  } else {
    // The shoulder joint sits inside the deltoid, below the sloping trapezius,
    // so the arm hangs against the body instead of pegging out of a box corner.
    const sy = torsoBase.y - m.torsoH + shoulderJointDown(m, k);
    const ax = m.shW / 2 - m.armD * 0.15;
    const tl = (def.shTilt ?? 0) * k;
    shF = { x: hip.x + ax, y: sy + tl };
    shB = { x: hip.x - ax, y: sy - tl };
  }
  const armJ = (s: Pt, a: Lb, out: number) => {
    if (a.reach) return armReach(s, { x: head.x + a.reach.x * k, y: head.y + a.reach.y * k }, m, side ? -1 : out, side);
    const el = add(s, dirv(a.a, out), m.upArm);
    const ha = add(el, dirv(a.b, out), m.foreArm);
    ha.y -= (a.up ?? 0) * k;
    return { el, ha };
  };
  const AF = armJ(shF, def.armF, 1);
  const AB = armJ(shB, def.armB, side ? 1 : -1);
  return { def, m, hip, th, neck, head, shF, shB, elF: AF.el, haF: AF.ha, elB: AB.el, haB: AB.ha, hipF: LF.h0, hipB: LB.h0, knF: LF.kn, anF: LF.an, knB: LB.kn, anB: LB.an, up, fw, upH };
}

/** Two-bone arm IK toward a target; the elbow swings outward (front) or down and back (side). */
function armReach(s: Pt, target: Pt, m: Met, out: number, side: boolean): { el: Pt; ha: Pt } {
  const A = m.upArm;
  const F = m.foreArm;
  let dx = target.x - s.x;
  let dy = target.y - s.y;
  let d = Math.hypot(dx, dy);
  const maxd = A + F - 0.01;
  if (d > maxd) {
    dx *= maxd / d;
    dy *= maxd / d;
    d = maxd;
  }
  const base = Math.atan2(dy, dx);
  const al = Math.acos(clamp((A * A + d * d - F * F) / (2 * A * Math.max(0.01, d)), -1, 1));
  const c1 = { x: s.x + Math.cos(base + al) * A, y: s.y + Math.sin(base + al) * A };
  const c2 = { x: s.x + Math.cos(base - al) * A, y: s.y + Math.sin(base - al) * A };
  // Front: the elbow on the outer side of the body; side: the lower elbow.
  const pick = side ? (c1.y > c2.y ? c1 : c2) : (c1.x - s.x) * out > (c2.x - s.x) * out ? c1 : c2;
  return { el: pick, ha: { x: s.x + dx, y: s.y + dy } };
}
