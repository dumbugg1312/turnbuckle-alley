import type { Dir } from '../../core/state';
import type { Look } from '../look';
import { clamp, D2R, type Pt } from './raster';

/**
 * Body metrics, poses and kinematics for the character art.
 *
 * Proportions are natural rather than chibi: a standard adult is 33 px tall
 * with an 8 px head (about 1/4 of the height), a visible neck, shoulders
 * wider than the waist and real feet. Giants reach the low forties, kids the
 * low twenties.
 */
export type Pose =
  | 'idle' | 'walk' | 'strike' | 'kick' | 'grapple' | 'lift' | 'lifted' | 'down' | 'stagger'
  | 'taunt' | 'climb' | 'perch' | 'aerial' | 'hold' | 'held' | 'pin' | 'pinned' | 'sell'
  | 'celebrate' | 'sit' | 'wave' | 'fireup';

export const POSES: Pose[] = ['idle', 'walk', 'strike', 'kick', 'grapple', 'lift', 'lifted', 'down', 'stagger', 'taunt', 'climb', 'perch', 'aerial', 'hold', 'held', 'pin', 'pinned', 'sell', 'celebrate', 'sit', 'wave', 'fireup'];

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
  petite: { headW: 7, headH: 7, neck: 2, torsoH: 8, shW: 8, waistW: 6, hipW: 7, belly: 0, depth: 5, upArm: 4, foreArm: 4, armD: 2, foreD: 2, handD: 2, thigh: 5, shin: 5, legD: 2, calfD: 2, footL: 4, gap: 1, shoe: 2, stoop: 0, ripped: 0.2 },
  lean: { headW: 7, headH: 8, neck: 2, torsoH: 9, shW: 9, waistW: 6, hipW: 7, belly: 0, depth: 5, upArm: 5, foreArm: 5, armD: 2, foreD: 2, handD: 3, thigh: 6, shin: 6, legD: 3, calfD: 2, footL: 5, gap: 1, shoe: 2, stoop: 0, ripped: 0.5 },
  athletic: { headW: 7, headH: 8, neck: 2, torsoH: 9, shW: 10, waistW: 7, hipW: 8, belly: 0, depth: 6, upArm: 5, foreArm: 5, armD: 3, foreD: 3, handD: 3, thigh: 6, shin: 6, legD: 3, calfD: 3, footL: 5, gap: 1, shoe: 2, stoop: 0, ripped: 1 },
  stocky: { headW: 8, headH: 8, neck: 2, torsoH: 9, shW: 12, waistW: 10, hipW: 10, belly: 1, depth: 8, upArm: 5, foreArm: 4, armD: 4, foreD: 3, handD: 3, thigh: 5, shin: 5, legD: 4, calfD: 4, footL: 5, gap: 2, shoe: 2, stoop: 0, ripped: 0.7 },
  heavy: { headW: 8, headH: 8, neck: 2, torsoH: 10, shW: 12, waistW: 13, hipW: 12, belly: 2, depth: 10, upArm: 5, foreArm: 4, armD: 4, foreD: 4, handD: 3, thigh: 5, shin: 5, legD: 5, calfD: 4, footL: 6, gap: 2, shoe: 2, stoop: 0, ripped: 0 },
  giant: { headW: 9, headH: 9, neck: 2, torsoH: 11, shW: 15, waistW: 12, hipW: 12, belly: 1, depth: 10, upArm: 7, foreArm: 6, armD: 5, foreD: 4, handD: 4, thigh: 7, shin: 7, legD: 5, calfD: 4, footL: 7, gap: 2, shoe: 2, stoop: 0, ripped: 0.8 },
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
  return m;
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
}

const lb = (a: number, b: number, up?: number): Lb => ({ a, b, up });

export function sidePose(pose: Pose, frame: number, stance: boolean): PoseDef {
  const base: PoseDef = { view: 'side', torso: 0, head: 0, armF: lb(5, 12), armB: lb(-4, 4), legF: lb(3, 0), legB: lb(-3, 0), expr: 'neutral', item: true, hand: 'relax' };
  switch (pose) {
    case 'idle':
      if (stance) return { ...base, torso: 12, head: -6, armF: lb(42, 150), armB: lb(26, 140), legF: lb(22, -4), legB: lb(-18, -8), expr: 'focus', item: false, hand: 'fist' };
      return base;
    case 'walk': {
      const f = ((frame % 6) + 6) % 6;
      // contact, down, pass (near leg leading), then the same with the far leg leading.
      const W: [Lb, Lb, Lb, Lb, number][] = [
        [lb(-24, -12), lb(22, 34), lb(26, 10), lb(-22, -40), 1],
        [lb(-12, -4), lb(12, 22), lb(14, -10), lb(-10, -50), 0],
        [lb(0, 6), lb(0, 10), lb(2, 0), lb(6, -58), -1],
        [lb(22, 34), lb(-24, -12), lb(-22, -40), lb(26, 10), 1],
        [lb(12, 22), lb(-12, -4), lb(-10, -50), lb(14, -10), 0],
        [lb(0, 10), lb(0, 6), lb(6, -58), lb(2, 0), -1],
      ];
      const [aF, aB, gF, gB, bob] = W[f];
      if (stance) return { ...base, torso: 10, head: -4, armF: lb(aF.a * 0.3 + 36, 146), armB: lb(aB.a * 0.3 + 22, 136), legF: gF, legB: gB, expr: 'focus', item: false, hand: 'fist', bob, sway: -bob };
      return { ...base, torso: 3, armF: aF, armB: aB, legF: gF, legB: gB, bob, sway: -bob };
    }
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

export function frontPose(pose: Pose, frame: number, view: View, stance: boolean): PoseDef {
  const base: PoseDef = { view, torso: 0, head: 0, armF: lb(7, 3), armB: lb(7, 3), legF: lb(0, 0), legB: lb(0, 0), expr: 'neutral', item: true, hand: 'relax' };
  switch (pose) {
    case 'idle':
      if (stance) return { ...base, armF: lb(18, 70), armB: lb(18, 70), legF: lb(10, 4), legB: lb(10, 4), expr: 'focus', item: false, hand: 'fist' };
      return base;
    case 'walk': {
      const f = ((frame % 4) + 4) % 4;
      if (f === 0) return { ...base, armF: lb(4, 16, 1), armB: lb(10, 0), legF: lb(0, 0, 1), legB: lb(0, 0), sway: 1 };
      if (f === 2) return { ...base, armF: lb(10, 0), armB: lb(4, 16, 1), legF: lb(0, 0), legB: lb(0, 0, 1), sway: 1 };
      return { ...base, bob: -1, sway: -1 };
    }
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
const WORLD_POSES = new Set<Pose>(['idle', 'walk', 'sit', 'wave']);

export function resolvePose(pose: Pose, facing: Dir, frame: number, stance: boolean): { def: PoseDef; mirror: boolean } {
  if (FRONT_POSES.has(pose)) return { def: frontPose(pose, frame, facing === 'up' ? 'back' : 'front', stance), mirror: false };
  if (LYING_POSES.has(pose)) return { def: frontPose(pose, frame, 'front', stance), mirror: facing === 'left' };
  if (WORLD_POSES.has(pose) && (facing === 'down' || facing === 'up')) return { def: frontPose(pose, frame, facing === 'up' ? 'back' : 'front', stance), mirror: false };
  return { def: sidePose(pose, frame, stance), mirror: facing === 'left' };
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
 * offsets (lift, bob, hipX, up) are in native pixels; `k` converts them to
 * the metric units in use (K for art-pixel metrics).
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
  const legX = side ? 0.5 : m.gap / 2 + m.legD / 2;
  let LF = legJ(def.legF, side ? 0.5 : legX, 1);
  let LB = legJ(def.legB, side ? -0.5 : -legX, -1);
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
  const bob = (def.bob ?? 0) * k;
  const torsoBase = { x: hip.x, y: hip.y + bob };
  const neck = add(torsoBase, up, m.torsoH);
  const hd = (side ? def.head + lean * 0.5 + m.stoop * 6 : 0) * D2R;
  const upH = side ? { x: Math.sin(hd), y: -Math.cos(hd) } : { x: 0, y: -1 };
  const head = add(neck, upH, m.neck + m.headH / 2 - 0.5);
  let shF: Pt;
  let shB: Pt;
  if (side) {
    const s0 = add(torsoBase, up, m.torsoH - Math.max(1.5, m.armD * 0.6));
    shF = add(s0, fw, 0.5);
    shB = add(s0, fw, -1);
  } else {
    const sy = torsoBase.y - m.torsoH + m.armD / 2 + 0.5;
    const ax = m.shW / 2 + m.armD / 2 - 1;
    shF = { x: hip.x + ax, y: sy };
    shB = { x: hip.x - ax, y: sy };
  }
  const armJ = (s: Pt, a: Lb, out: number) => {
    const el = add(s, dirv(a.a, out), m.upArm);
    const ha = add(el, dirv(a.b, out), m.foreArm);
    ha.y -= (a.up ?? 0) * k;
    return { el, ha };
  };
  const AF = armJ(shF, def.armF, 1);
  const AB = armJ(shB, def.armB, side ? 1 : -1);
  return { def, m, hip, th, neck, head, shF, shB, elF: AF.el, haF: AF.ha, elB: AB.el, haB: AB.ha, hipF: LF.h0, hipB: LB.h0, knF: LF.kn, anF: LF.an, knB: LB.kn, anB: LB.an, up, fw, upH };
}
