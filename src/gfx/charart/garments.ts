import { dth, hash2, liA, mixc, shA, type Color } from '../kit';
import type { Extra, Look } from '../look';
import type { Met, Rig, View } from './body';
import { ramp, tint, type MatKind, type Ramp } from './palette';
import type { Pt } from './raster';

/**
 * Garment tables and the body-local clothing shaders. Shaders answer "what is
 * the base colour of this body pixel", and also report the material kind and
 * a fold offset (in whole tones) through GK / GF so the painters can shade the
 * form with the right ramp.
 */
export type Neck = 'crew' | 'v' | 'scoop' | 'collar' | 'high' | 'hood' | 'none';
export type Cover = 'full' | 'singlet' | 'tank' | 'bra' | 'crop' | 'none';
export interface TopInfo {
  /** Sleeve length as a fraction of the whole arm (0 none, ~0.45 short, 1 long). */
  sleeve: number;
  neck: Neck;
  cover: Cover;
  pat?: string;
  /** Open front showing topAccent (jackets, cardigans). */
  open?: boolean;
  zip?: boolean;
  placket?: boolean;
  pockets?: number;
  /** Loose cloth gets folds; tight cloth shows the body. */
  loose?: boolean;
  kind?: MatKind;
}
export const TOPS: Record<string, TopInfo> = {
  tee: { sleeve: 0.42, neck: 'crew', cover: 'full', loose: true },
  tank: { sleeve: 0, neck: 'scoop', cover: 'tank' },
  singlet: { sleeve: 0, neck: 'scoop', cover: 'singlet' },
  none: { sleeve: 0, neck: 'none', cover: 'none' },
  bodysuit: { sleeve: 0.96, neck: 'high', cover: 'full' },
  rashguard: { sleeve: 0.96, neck: 'crew', cover: 'full' },
  sportsbra: { sleeve: 0, neck: 'scoop', cover: 'bra' },
  crop: { sleeve: 0.38, neck: 'crew', cover: 'crop', loose: true },
  hoodie: { sleeve: 1, neck: 'hood', cover: 'full', pockets: 1, loose: true },
  jacket: { sleeve: 1, neck: 'collar', cover: 'full', open: true, kind: 'leather' },
  track: { sleeve: 1, neck: 'high', cover: 'full', zip: true },
  cardigan: { sleeve: 1, neck: 'v', cover: 'full', open: true, loose: true },
  flannel: { sleeve: 0.85, neck: 'collar', cover: 'full', pat: 'plaid', placket: true, loose: true },
  sweater: { sleeve: 1, neck: 'crew', cover: 'full', loose: true },
  blouse: { sleeve: 0.5, neck: 'collar', cover: 'full', loose: true },
  buttondown: { sleeve: 1, neck: 'collar', cover: 'full', placket: true, loose: true },
  polo: { sleeve: 0.42, neck: 'collar', cover: 'full', loose: true },
  vest: { sleeve: 0, neck: 'v', cover: 'tank' },
  uniform: { sleeve: 0.5, neck: 'collar', cover: 'full', pockets: 2, placket: true, loose: true },
  scrubs: { sleeve: 0.42, neck: 'v', cover: 'full', pockets: 1, loose: true },
  apron: { sleeve: 0.42, neck: 'crew', cover: 'full', loose: true },
  referee: { sleeve: 0.42, neck: 'collar', cover: 'full', pat: 'ref' },
  dress: { sleeve: 0.38, neck: 'scoop', cover: 'full', loose: true },
};
export interface BottomInfo {
  /** Fraction of the leg covered from the hip. */
  len: number;
  /** Waistband rows on the torso. */
  wb: number;
  /** Skirt length as a fraction of the leg (0 = no skirt). */
  skirt?: number;
  wide?: boolean;
  stripe?: boolean;
  kind?: MatKind;
  /** Visible centre seam / fly. */
  seam?: boolean;
}
export const BOTTOMS: Record<string, BottomInfo> = {
  jeans: { len: 1, wb: 2, kind: 'denim', seam: true },
  trunks: { len: 0.2, wb: 2 },
  tights: { len: 1, wb: 2, stripe: true },
  shorts: { len: 0.45, wb: 2, stripe: true },
  cargo: { len: 0.62, wb: 2, seam: true },
  sweats: { len: 1, wb: 2, stripe: true },
  slacks: { len: 1, wb: 2, seam: true },
  wide: { len: 1, wb: 2, wide: true },
  leggings: { len: 0.95, wb: 2 },
  skirt: { len: 0, wb: 2, skirt: 0.55 },
  longskirt: { len: 0, wb: 2, skirt: 1.02 },
  overalls: { len: 1, wb: 2, kind: 'denim', seam: true },
  kilt: { len: 0, wb: 2, skirt: 0.6 },
  none: { len: 0, wb: 0 },
};
export const BOOT_H: Record<string, number> = { 'wrestling-boots': 0.75, kickpads: 0.8, 'cowboy-boots': 0.55, rainboots: 0.7, boots: 0.45, hightops: 0.2 };

/** The current build (module-level; builds are synchronous). */
export interface BC {
  look: Look;
  m: Met;
  r: Rig;
  view: View;
  AX: number;
  AY: number;
  skin: string;
  skinR: Ramp;
  ex: Map<string, Extra>;
  top: TopInfo;
  bot: BottomInfo;
  sleeveLen: number;
  sleeveCol: string;
  sleeveAcc: string;
  sleevePat?: string;
  sleeveWide: number;
  sleeveKind: MatKind;
  /** Far-side parts are drawn darker. */
  dark: boolean;
  bear: boolean;
  /** Sequin twinkle phase 0..3. */
  tw: number;
  /** Hair / cloth secondary-motion offset. */
  sway: number;
}
export let B: BC = null as unknown as BC;
export const X = (p: Pt) => B.AX + p.x;
export const Y = (p: Pt) => B.AY + p.y;
export const dk = (c: Color): Color => (B.dark ? shA(c, 0.22) : c);
export const ex = (id: string) => B.ex.get(id);

export function makeBC(look: Look, m: Met, r: Rig, AX: number, AY: number, tw = 0): BC {
  const exm = new Map<string, Extra>();
  for (const e of look.extras ?? []) exm.set(e.id, e);
  const top = TOPS[look.top] ?? TOPS.tee;
  const bot = BOTTOMS[look.bottom] ?? BOTTOMS.jeans;
  let sleeveLen = top.sleeve;
  let sleeveCol = look.topColor;
  let sleeveAcc = look.topAccent;
  let sleevePat: string | undefined = look.topPattern ?? top.pat;
  let sleeveWide = 0;
  let sleeveKind: MatKind = top.kind ?? 'cloth';
  for (const id of ['jacket', 'blazer', 'cardigan']) {
    const e = exm.get(id);
    if (e) {
      sleeveLen = 0.95;
      sleeveCol = e.color;
      sleeveAcc = e.accent ?? (shA(e.color, 0.3) as unknown as string);
      sleevePat = e.pattern;
      sleeveKind = id === 'jacket' ? 'leather' : 'cloth';
    }
  }
  for (const id of ['robe', 'duster']) {
    const e = exm.get(id);
    if (e) {
      sleeveLen = 1.02;
      sleeveCol = e.color;
      sleeveAcc = e.accent ?? e.color;
      sleevePat = e.pattern;
      sleeveWide = id === 'robe' ? 1 : 0;
      sleeveKind = 'cloth';
    }
  }
  const bear = look.species === 'bear';
  B = {
    look, m, r, view: r.def.view, AX, AY, skin: look.skin, skinR: ramp(look.skin, bear ? 'fur' : 'skin'), ex: exm, top, bot,
    sleeveLen, sleeveCol, sleeveAcc, sleevePat, sleeveWide, sleeveKind, dark: false, bear, tw, sway: r.def.sway ?? 0,
  };
  return B;
}

/** Material kind and fold offset reported by the last shader call. */
export let GK: MatKind = 'cloth';
export let GF = 0;
export function setG(kind: MatKind, fold = 0): void {
  GK = kind;
  GF = fold;
}

/**
 * Surface pattern for clothing. (x, y) are integer body-local coordinates;
 * `s` is the pattern scale (1 for sprites, ~2 for portraits).
 */
export function pattern(id: string | undefined, x: number, y: number, base: Color, acc: Color, s = 1, tw = 0): Color {
  if (!id || id === 'solid') return base;
  const X = Math.floor(x / s);
  const Y = Math.floor(y / s);
  switch (id) {
    case 'stripes':
      return ((Y % 2) + 2) % 2 === 0 ? acc : base;
    case 'pinstripe':
      return ((X % 3) + 3) % 3 === 0 ? liA(base, 0.22) : base;
    case 'plaid': {
      const a = ((X % 4) + 4) % 4 === 0;
      const b = ((Y % 4) + 4) % 4 === 0;
      if (a && b) return shA(acc, 0.3);
      if (a || b) return mixc(base, acc, 0.6);
      return ((X + Y) & 1) && ((X % 4) + 4) % 4 === 2 ? shA(base, 0.12) : base;
    }
    case 'checker':
      return (((X >> 1) + (Y >> 1)) & 1) === 0 ? acc : base;
    case 'stars': {
      const h = hash2(Math.floor(X / 3), Math.floor(Y / 3), 7);
      const cx = Math.floor(X / 3) * 3 + 1;
      const cy = Math.floor(Y / 3) * 3 + 1;
      if (h < 0.45 && ((X === cx && Math.abs(Y - cy) <= 1) || (Y === cy && Math.abs(X - cx) <= 1))) return acc;
      return base;
    }
    case 'hearts': {
      const gx = ((X % 4) + 4) % 4;
      const gy = ((Y % 4) + 4) % 4;
      const odd = (Math.floor(Y / 4) & 1) === 1;
      const hx = odd ? (gx + 2) % 4 : gx;
      if ((gy === 0 && (hx === 0 || hx === 2)) || (gy === 1 && hx <= 2)) return hx === 1 && gy === 0 ? base : acc;
      return base;
    }
    case 'sequins': {
      const h = hash2(X, Y, 3);
      const t = hash2(X, Y, 11 + tw);
      if (t < 0.05) return '#fffbe8';
      if (h < 0.16) return liA(base, 0.5);
      if (h > 0.84) return shA(base, 0.2);
      return dth(X, Y, 6) ? mixc(base, acc, 0.3) : base;
    }
    case 'floral':
    case 'hawaiian': {
      const cxh = Math.floor(X / 4);
      const cyh = Math.floor(Y / 4);
      const h = hash2(cxh, cyh, id === 'floral' ? 11 : 13);
      const fx = cxh * 4 + 1 + ((h * 7) | 0) % 2;
      const fy = cyh * 4 + 1 + ((h * 13) | 0) % 2;
      if (X === fx && Y === fy) return id === 'floral' ? '#fff1c2' : '#ffe48e';
      if (Math.abs(X - fx) + Math.abs(Y - fy) === 1) return acc;
      if (id === 'hawaiian' && X === fx + 1 && Y === fy + 1) return '#518c5c';
      return base;
    }
    case 'lightning': {
      const zig = ((Y % 4) + 4) % 4;
      const lx = (((Math.floor(Y / 4) & 1) === 0 ? zig : 3 - zig) + 8) % 8;
      return ((X % 8) + 8) % 8 === lx ? acc : base;
    }
    case 'flames': {
      const h = Math.sin(X * 1.7) * 1.5 + Math.sin(X * 0.6 + 1) * 1.2;
      return Y < 2.5 + h ? (Y < 1 + h * 0.5 ? '#ffd84a' : acc) : base;
    }
    case 'cow': {
      const v = Math.sin(X * 0.9 + Math.cos(Y * 0.7) * 2) + Math.sin(Y * 0.8 + X * 0.3);
      return v > 1.1 ? acc : base;
    }
    case 'camo': {
      const v = Math.sin(X * 0.8 + Math.cos(Y * 0.9) * 1.5) + Math.cos(Y * 0.7 - X * 0.4);
      return v > 0.9 ? shA(base, 0.35) : v < -0.9 ? acc : base;
    }
    default:
      return base;
  }
}

export function topColorAt(px0: number, py0: number, s = 1): Color {
  const L = B.look;
  const pat = L.topPattern ?? B.top.pat;
  if (pat === 'ref') return ((Math.floor(px0 / (2 * s)) % 2) + 2) % 2 === 0 ? L.topColor : L.topAccent;
  return pattern(pat, px0, py0, L.topColor, L.topAccent, s, B.tw);
}
export function bottomColorAt(px0: number, py0: number, s = 1): Color {
  const L = B.look;
  return pattern(L.bottomPattern, px0, py0, L.bottomColor, L.bottomAccent, s, B.tw);
}

/** Torso skin with muscle definition. */
function torsoSkin(lx: number, ly: number, H: number, wb: number, sideView: boolean): Color {
  const sk = B.skin;
  if (B.bear) {
    setG('fur');
    const inBelly = sideView ? lx > 0 && ly < H * 0.75 : Math.abs(lx) < B.m.waistW * 0.3 && ly < H * 0.8 && ly > wb;
    return inBelly ? mixc(sk, '#d8a878', 0.55) : sk;
  }
  const rip = B.m.ripped;
  const pecY = Math.round(H * 0.6);
  setG('skin');
  if (!sideView) {
    const ax = Math.abs(lx);
    const fy = Math.floor(ly);
    if (rip > 0.4 && fy === pecY - 1 && ax > 0.5 && ax < B.m.shW * 0.34) setG('skin', -1);
    else if (rip > 0.6 && lx >= 0 && lx < 1 && ly > wb + 0.5 && ly < pecY - 1 && fy % 2 === 0) setG('skin', -1);
    else if (rip > 0.4 && lx >= -1 && lx < 0 && fy === pecY + 1) setG('skin', 1);
    else if (lx >= 0 && lx < 1 && fy === wb + 1 && rip > 0.3) setG('skin', -1);
  } else if (rip > 0.4 && Math.floor(ly) === pecY - 1 && lx > 0) setG('skin', -1);
  return sk;
}

/** Front/back torso garment shader. lx: lateral from centre, ly: height above hip. */
export function torsoFront(lx: number, ly: number, hw: number, back: boolean): Color {
  const L = B.look;
  const m = B.m;
  const T = B.top;
  const H = m.torsoH;
  const bi = B.bot;
  const ax = Math.abs(lx);
  const pxl = Math.floor(lx + 64);
  const pyl = Math.floor(ly);
  const dress = L.top === 'dress';
  setG(T.kind ?? 'cloth');
  if (ly < bi.wb && !dress) {
    setG(bi.kind ?? 'cloth');
    if (ly >= bi.wb - 1 && L.bottom !== 'none') {
      setG(bi.kind ?? 'cloth', 0);
      return L.bottomAccent;
    }
    if (bi.seam && lx >= -0.5 && lx < 0.5) setG(bi.kind ?? 'cloth', -1);
    return bottomColorAt(pxl, pyl);
  }
  if (L.bottom === 'overalls') {
    if (!back) {
      if (ax < hw * 0.55 && ly < H * 0.7) {
        setG('denim', ly > H * 0.7 - 1.5 ? -1 : 0);
        return ly > H * 0.7 - 1.5 && ax < 1 ? L.bottomAccent : L.bottomColor;
      }
      if (Math.abs(ax - hw * 0.42) < 0.75) {
        setG('denim');
        return L.bottomColor;
      }
    } else {
      const k = (H - ly) / H;
      if (Math.abs(ax - hw * 0.5 * (1 - k * 0.9)) < 0.8 && ly > bi.wb) {
        setG('denim');
        return L.bottomColor;
      }
    }
  }
  let covered = true;
  switch (T.cover) {
    case 'none':
      covered = false;
      break;
    case 'singlet':
      covered = ly < H * 0.56 || (ax > hw * 0.22 && ax < hw * 0.62);
      break;
    case 'tank':
      covered = !(ax > hw - 1.3 && ly > H * 0.45);
      break;
    case 'bra':
      covered = (ly >= H * 0.42 && ly < H * 0.82) || (ly >= H * 0.82 && Math.abs(ax - hw * 0.45) < 0.8);
      break;
    case 'crop':
      covered = ly >= H * 0.42;
      break;
  }
  if (covered && !back) {
    const top = H - ly;
    if (T.neck === 'crew' && top < 1 && ax < 1.6) covered = false;
    else if (T.neck === 'v' && top < 3.2 && ax < (3.2 - top) * 0.55 + 0.4) covered = false;
    else if (T.neck === 'scoop' && top < 2 && ax < hw * 0.4) covered = false;
    else if ((T.neck === 'collar' || T.neck === 'hood') && top < 1 && ax < 1.6) covered = false;
  }
  if (!covered) return torsoSkin(lx, ly, H, bi.wb, false);
  // Folds for loose cloth: a crease under the chest on the shadow side, a lit ridge opposite, a tuck shadow at the waist.
  const fy = Math.floor(ly);
  const creaseY = Math.round(H * 0.5);
  if (T.loose) {
    if (fy === creaseY && lx > hw * 0.15 && lx < hw * 0.8) setG(GK, -1);
    else if (fy === creaseY + 1 && lx < -hw * 0.2 && lx > -hw * 0.7) setG(GK, 1);
    else if (fy === bi.wb && L.bottom !== 'none' && !dress) setG(GK, -1);
  } else if (T.cover !== 'none') {
    // Tight cloth shows the chest: a sternum line and the pec underside.
    const rip = m.ripped;
    if (rip > 0.4 && lx >= 0 && lx < 1 && ly > H * 0.45 && ly < H * 0.66) setG(GK, -1);
    else if (rip > 0.4 && fy === Math.round(H * 0.58) - 1 && ax > 0.8 && ax < hw * 0.75) setG(GK, -1);
  }
  if (!back) {
    const top = H - ly;
    if (T.neck === 'collar' && top < 1.5 && ax >= 1.6 && ax < 3.2) {
      setG(GK, 1);
      return liA(L.topAccent, 0.1);
    }
    if (T.open && ax < 1.6) {
      setG(GK, 0);
      return L.topAccent;
    }
    if (T.open && ax < 2.6 && top < H * 0.5) setG(GK, -1);
    if (T.zip && lx >= -0.5 && lx < 0.5) {
      setG('metal');
      return fy % 2 === 0 ? L.topAccent : shA(L.topAccent, 0.25);
    }
    if (T.placket && lx >= -0.5 && lx < 0.5) {
      setG(GK, -1);
      return fy % 3 === 0 ? L.topAccent : topColorAt(pxl, pyl);
    }
    if (T.pockets === 2 && top > 2 && top < 4 && ax > 1.2 && ax < 3.5) setG(GK, -1);
    if (T.pockets === 1 && L.top === 'hoodie' && ly > bi.wb && ly < bi.wb + 2.5 && ax < hw * 0.55) setG(GK, -1);
    if (T.pockets === 1 && L.top === 'scrubs' && top > 2.5 && top < 4.5 && lx < -1 && lx > -4) setG(GK, -1);
    if (T.neck === 'hood' && top < 1.8 && ax < 2.5) {
      setG(GK, 0);
      return L.topAccent;
    }
    if (L.top === 'apron' && ax < hw * 0.55 && ly < H * 0.78) {
      setG('cloth', fy === Math.round(H * 0.78) - 1 ? -1 : 0);
      return L.topAccent;
    }
    if (L.topPattern === 'logo' && top > 2 && top < 5 && ax < 1.6) {
      setG(GK, 0);
      return L.topAccent;
    }
    if (dress && ly < bi.wb) {
      setG('cloth', 0);
      return ly >= bi.wb - 1 ? L.topAccent : L.topColor;
    }
  } else {
    if (T.neck === 'hood' && H - ly < 3 && ax < hw * 0.6) setG(GK, -1);
    // Spine.
    else if (lx >= -0.5 && lx < 0.5 && ly > bi.wb + 1 && ly < H - 1.5) setG(GK, -1);
  }
  return topColorAt(pxl, pyl);
}

/** Side-view torso shader. lf: forward offset (front +), ly: height above hip. */
export function torsoSide(lf: number, ly: number, dF: number): Color {
  const L = B.look;
  const H = B.m.torsoH;
  const T = B.top;
  const bi = B.bot;
  const pxl = Math.floor(lf + 64);
  const pyl = Math.floor(ly);
  const dress = L.top === 'dress';
  setG(T.kind ?? 'cloth');
  if (ly < bi.wb && !dress) {
    setG(bi.kind ?? 'cloth', 0);
    return ly >= bi.wb - 1 && L.bottom !== 'none' ? L.bottomAccent : bottomColorAt(pxl, pyl);
  }
  if (L.bottom === 'overalls' && ((lf > dF - 2.2 && ly < H * 0.7) || Math.abs(lf) < 0.8)) {
    setG('denim');
    return L.bottomColor;
  }
  let covered = true;
  switch (T.cover) {
    case 'none':
      covered = false;
      break;
    case 'singlet':
      covered = ly < H * 0.56 || Math.abs(lf) < 1;
      break;
    case 'tank':
      covered = !(ly > H - 1.2 && lf > 0.5);
      break;
    case 'bra':
      covered = (ly >= H * 0.42 && ly < H * 0.82) || Math.abs(lf) < 0.8;
      break;
    case 'crop':
      covered = ly >= H * 0.42;
      break;
  }
  const top = H - ly;
  if (covered && T.neck !== 'high' && T.neck !== 'none' && top < (T.neck === 'v' || T.neck === 'scoop' ? 2.2 : 1) && lf > 0.5) covered = false;
  if (!covered) return torsoSkin(lf, ly, H, bi.wb, true);
  const fy = Math.floor(ly);
  if (T.loose) {
    if (fy === Math.round(H * 0.5) && lf > 0) setG(GK, -1);
    else if (fy === bi.wb && L.bottom !== 'none' && !dress) setG(GK, -1);
  }
  if (T.open && lf > dF - 1.6) {
    setG(GK, 0);
    return L.topAccent;
  }
  if (T.neck === 'collar' && top < 1.5 && lf > -0.5) {
    setG(GK, 1);
    return liA(L.topAccent, 0.1);
  }
  if (T.neck === 'hood' && top < 2.4 && lf < 0) setG(GK, -1);
  if (L.top === 'apron' && lf > dF - 1.6 && ly < H * 0.78) {
    setG('cloth');
    return L.topAccent;
  }
  if (dress && ly < bi.wb) {
    setG('cloth');
    return ly >= bi.wb - 1 ? L.topAccent : L.topColor;
  }
  return topColorAt(pxl, pyl);
}

/** Arm surface colour at distance s from the shoulder (total = whole arm). */
export function armColor(s: number, total: number): Color {
  const L = B.look;
  if (B.bear) {
    setG('fur');
    return B.skin;
  }
  const gl = ex('gloves');
  if (gl && s > total - 1.2) {
    setG('leather');
    return gl.color;
  }
  const wt = ex('wrist-tape');
  if (wt && s > total - 1.9 && s <= total - 0.2) {
    setG('cloth', Math.floor(s) % 2 ? -1 : 0);
    return wt.color;
  }
  const bg = ex('bangles');
  if (bg && s > total - 1.6 && s < total - 0.6) {
    setG('metal');
    return bg.color;
  }
  const ep = ex('elbow-pads');
  if (ep && Math.abs(s - B.m.upArm) < 1.2) {
    setG('cloth');
    return ep.color;
  }
  if (s <= B.sleeveLen * total + 0.01) {
    setG(B.sleeveKind);
    if (L.top === 'track' && !ex('jacket') && Math.abs(s - total * 0.5) < 0.6) return L.topAccent;
    if (s > B.sleeveLen * total - 1 && B.sleeveLen > 0.9 && (L.top === 'hoodie' || L.top === 'sweater' || L.top === 'track')) setG(B.sleeveKind, -1);
    else if (B.sleeveLen < 0.9 && s > B.sleeveLen * total - 0.9) setG(B.sleeveKind, -1);
    return pattern(B.sleevePat, 66, Math.floor(s), B.sleeveCol, B.sleeveAcc, 1, B.tw);
  }
  setG('skin');
  return B.skin;
}

/** Leg surface colour at distance s from the hip. */
export function legColor(s: number, total: number, near: boolean): Color {
  const L = B.look;
  if (B.bear) {
    setG('fur');
    return B.skin;
  }
  const bh = BOOT_H[L.shoes];
  if (bh !== undefined && s > total - B.m.shin * bh) {
    setG('leather', s > total - B.m.shin * bh + 1 ? 0 : 1);
    return L.shoesColor;
  }
  const kp = ex('kneepads');
  if (kp && Math.abs(s - B.m.thigh) < 1.2) {
    setG('cloth');
    return kp.color;
  }
  const kb = ex('knee-brace');
  if (kb && near && Math.abs(s - B.m.thigh) < 1.4) {
    setG('cloth');
    return kb.color;
  }
  const so = ex('socks');
  if (so && s > total - B.m.shin * 0.7) {
    setG('cloth');
    return so.color;
  }
  const cov = B.bot.len * total;
  if (s <= cov + 0.3) {
    setG(B.bot.kind ?? 'cloth');
    if (L.bottom === 'trunks' && s > cov - 0.9) return L.bottomAccent;
    if (L.bottom === 'sweats' && s > total - 0.8) return L.bottomAccent;
    // Knee crease on long pants.
    if (B.bot.len > 0.9 && Math.abs(s - B.m.thigh - 0.5) < 0.6) setG(GK, -1);
    else if (s > cov - 0.9 && B.bot.len < 0.9) setG(GK, -1);
    return bottomColorAt(70, Math.floor(s));
  }
  setG('skin');
  return B.skin;
}

/** Tone-shift a base colour through its ramp by the current fold offset plus a form value. */
export function shade(c: Color, formIdx: number): number {
  return tint(c, formIdx + GF, GK);
}
