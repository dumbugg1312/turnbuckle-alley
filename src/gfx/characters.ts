import type { Dir } from '../core/state';
import { mkSpr, toCanvas } from './kit';
import { EXTRA_SLOT, type Look } from './look';
import { cycleLength, gaitStyle, IDLE_LOOK_A, IDLE_LOOK_B, IDLE_QUIRK0, IDLE_QUIRKS, IDLE_SHIFT, K, metrics, metricsArt, POSES, resolvePose, RUN_FRAMES, solve, totalHeight, WALK_FRAMES, type Expr, type Pose, type Quirk } from './charart/body';
import { buildRaccoon, RACCOON_SHEET } from './charart/critters';
import { B, makeBC } from './charart/garments';
import { drawBearHead, drawFace, drawFaceExtras, drawFacial, drawHair, drawHairBack, drawHead, drawHeadExtras, drawMask, drawPaint, headBox } from './charart/head';
import { drawArm, drawBackExtras, drawHandItem, drawLeg, drawNeck, drawOverExtras, drawShoe, drawSkirt, drawTorso, drawWings } from './charart/parts';
import { buildPortrait } from './charart/portrait';
import { beginLayers, crop, finish, lightPass, mirrorAll, OUTLINE_W, rotateAll, setLight, setLineWeights } from './charart/raster';

/**
 * Turnbuckle Alley character renderer: a parametric, cached paper doll with
 * natural proportions, hue-shifted material ramps, selective outlines and
 * manual anti-aliasing. The painters live in src/gfx/charart/*; this module
 * assembles a sprite per (look, pose, frame, facing) and caches the canvas.
 *
 * Side-view sprites are built facing right and mirrored before the light
 * pass; lying and flying poses are built upright and rotated first. Form
 * shading knows about both transforms, so everything stays lit from the
 * top-left on screen.
 */
export type { Pose, Quirk };
export { POSES, IDLE_QUIRKS, WALK_FRAMES, RUN_FRAMES, cycleLength };

export interface DrawOpts {
  facing: Dir;
  pose?: Pose;
  /** Animation frame counter (walk cycle etc). */
  frame?: number;
  /** Seconds, for idle breathing and blinks. */
  t?: number;
  /** Flash white (hit). */
  flash?: boolean;
  /** Hide hand-held props (mic, book...) for this draw. */
  noItem?: boolean;
  /** A personal idle habit ('tap', 'bounce', 'glasses', 'stretch'). */
  quirk?: Quirk;
}

export type Expression = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'smug' | 'love';
export const EXPRESSIONS: Expression[] = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'smug', 'love'];

export interface PortraitOpts {
  /** Draw the warm gradient background (default true). */
  bg?: boolean;
}

// =====================================================================
//  Assembly
// =====================================================================

function drawHeadStack(expr: Expr, blink: boolean): void {
  const hb = headBox();
  if (B.bear) {
    drawBearHead(hb, expr, blink);
    drawHeadExtras(hb);
    return;
  }
  drawHead(hb);
  drawPaint(hb);
  drawFacial(hb);
  drawMask(hb);
  drawFace(hb, expr, blink);
  drawHair(hb);
  drawFaceExtras(hb);
  drawHeadExtras(hb);
}

function drawBody(expr: Expr, blink: boolean): void {
  const r = B.r;
  const view = B.view;
  const hb = headBox();
  const hand = r.def.hand ?? 'relax';
  if (view === 'front') {
    drawBackExtras();
    drawHairBack(hb);
    drawLeg(r.hipB, r.knB, r.anB, false, -1);
    drawLeg(r.hipF, r.knF, r.anF, true, 1);
    drawShoe(r.anB, false);
    drawShoe(r.anF, true);
    drawNeck();
    drawTorso();
    drawSkirt();
    drawOverExtras();
    drawWings(true);
    // A hand raised to the face (pushing up glasses) goes over the head.
    const upB = !!r.def.armB.reach;
    const upF = !!r.def.armF.reach;
    if (!upB) drawArm(r.shB, r.elB, r.haB, hand, false);
    if (!upF) drawArm(r.shF, r.elF, r.haF, hand, true);
    drawHeadStack(expr, blink);
    if (upB) drawArm(r.shB, r.elB, r.haB, hand, false);
    if (upF) drawArm(r.shF, r.elF, r.haF, hand, true);
    drawHandItem();
    return;
  }
  if (view === 'back') {
    drawWings(true);
    drawLeg(r.hipB, r.knB, r.anB, false, -1);
    drawLeg(r.hipF, r.knF, r.anF, true, 1);
    drawShoe(r.anB, false);
    drawShoe(r.anF, true);
    drawNeck();
    drawTorso();
    drawSkirt();
    drawArm(r.shB, r.elB, r.haB, hand, false);
    drawArm(r.shF, r.elF, r.haF, hand, true);
    drawHeadStack(expr, blink);
    drawOverExtras();
    return;
  }
  // Side view, facing right.
  drawBackExtras();
  B.dark = true;
  drawWings(false);
  drawArm(r.shB, r.elB, r.haB, hand, false);
  drawLeg(r.hipB, r.knB, r.anB, false, -1);
  drawShoe(r.anB, false);
  B.dark = false;
  drawLeg(r.hipF, r.knF, r.anF, true, 1);
  drawShoe(r.anF, true);
  drawNeck();
  drawTorso();
  drawSkirt();
  drawHairBack(hb);
  drawOverExtras();
  drawHeadStack(expr, blink);
  drawWings(true);
  drawArm(r.shF, r.elF, r.haF, hand, true);
  drawHandItem();
}

// =====================================================================
//  Public API
// =====================================================================

interface Built {
  c: HTMLCanvasElement;
  ax: number;
  ay: number;
  white?: HTMLCanvasElement;
  coarse?: HTMLCanvasElement;
  coarseWhite?: HTMLCanvasElement;
}

const RING_SHOES = new Set(['wrestling-boots', 'kickpads', 'barefoot']);
const RING_TOPS = new Set(['singlet', 'none', 'bodysuit', 'sportsbra', 'rashguard', 'tank']);
function isRingGear(look: Look): boolean {
  if (look.species === 'raccoon') return false;
  if (look.species === 'bear') return true;
  return RING_SHOES.has(look.shoes) || (RING_TOPS.has(look.top) && (look.bottom === 'trunks' || look.bottom === 'tights'));
}

/** Build-time stats (ms per sprite), readable from the console for tuning. */
export const BUILD_STATS = { n: 0, ms: 0, max: 0 };

function buildSprite(look: Look, pose: Pose, facing: Dir, frame: number, blink: boolean, tw: number): Built {
  const t0 = performance.now();
  const b = buildSpriteInner(look, pose, facing, frame, blink, tw);
  const dt = performance.now() - t0;
  BUILD_STATS.n++;
  BUILD_STATS.ms += dt;
  if (dt > BUILD_STATS.max) BUILD_STATS.max = dt;
  return b;
}

function buildSpriteInner(look: Look, pose: Pose, facing: Dir, frame: number, blink: boolean, tw: number): Built {
  // Silhouette outline one world pixel thick, contact shadows one world pixel deep.
  setLineWeights(K, K);
  if (look.species === 'raccoon') {
    setLight(facing === 'left');
    const spr = buildRaccoon(look, pose === 'run' ? 'walk' : pose === 'hop' ? 'idle' : pose, facing, pose === 'idle' ? frame & 1 : frame, blink);
    if (facing === 'left') mirrorAll(spr);
    lightPass(spr);
    const { s: cs, ox, oy, lay, flg } = crop(spr);
    const out = finish(cs, lay, flg);
    return { c: toCanvas(out), ax: 16 * K - ox + OUTLINE_W, ay: (RACCOON_SHEET - 6) * K - oy + OUTLINE_W };
  }
  const m = metricsArt(look);
  const stance = isRingGear(look);
  const { def, mirror } = resolvePose(pose, facing, frame, stance, m, gaitStyle(look));
  setLight(mirror, def.rot);
  const tall = totalHeight(m);
  const wings = look.extras?.some((e) => e.id === 'moth-wings' || e.id === 'wings' || e.id === 'robe' || e.id === 'cape') ? 12 * K : 0;
  let S = Math.ceil(tall * 1.75 + 14 * K + wings);
  if (S % 2) S++;
  const AX = S >> 1;
  const AY = S - 10 * K;
  beginLayers(S, S);
  const rig = solve(def, m, K);
  makeBC(look, m, rig, AX, AY, tw, metrics(look));
  const spr = mkSpr(S, S, () => drawBody(def.expr, blink));
  if (def.rot) rotateAll(spr, def.rot === 'cw');
  if (mirror) mirrorAll(spr);
  lightPass(spr);
  const { s: cs, ox, oy, lay, flg } = crop(spr);
  const out = finish(cs, lay, flg);
  let ax: number;
  let ay: number;
  if (def.rot) {
    ax = Math.floor(out.w / 2);
    ay = out.h - 1 + (pose === 'lifted' ? Math.round(tall * 0.4) : 0);
  } else {
    ax = AX - ox + OUTLINE_W;
    ay = AY - oy + OUTLINE_W;
  }
  return { c: toCanvas(out), ax, ay };
}

/**
 * Art pixels per native (world) pixel. At 2 the sprites are painted on a grid
 * twice as fine as the world and drawn at half size, so on the doubled screen
 * buffer every art pixel is still a whole buffer pixel (DECISIONS.md D-017).
 */
export const CHAR_DENSITY: number = K;

const cache = new Map<string, Built>();
const CACHE_MAX = 2500;
const lookKeys = new WeakMap<Look, { json: string; key: string; seed: number; sequins: boolean }>();

function lookKey(look: Look): { key: string; seed: number; sequins: boolean } {
  const json = JSON.stringify(look);
  const hit = lookKeys.get(look);
  if (hit && hit.json === json) return hit;
  let h = 2166136261;
  for (let i = 0; i < json.length; i++) h = Math.imul(h ^ json.charCodeAt(i), 16777619);
  const v = { json, key: json, seed: ((h >>> 0) % 1000) / 1000, sequins: json.includes('sequins') };
  lookKeys.set(look, v);
  return v;
}

function getBuilt(look: Look, pose: Pose, facing: Dir, frame: number, blink: boolean, tw: number): Built {
  const lk = lookKey(look);
  const k = `${lk.key}|${facing}|${pose}|${frame}|${blink ? 1 : 0}|${tw}`;
  let b = cache.get(k);
  if (b) return b;
  b = buildSprite(look, pose, facing, frame, blink, tw);
  if (cache.size >= CACHE_MAX) {
    let n = 0;
    for (const key of cache.keys()) {
      cache.delete(key);
      if (++n > CACHE_MAX / 4) break;
    }
  }
  cache.set(k, b);
  return b;
}

/** A smooth native-density copy, for drawing into native-resolution offscreen canvases. */
function coarseOf(src: HTMLCanvasElement, b: Built, flash: boolean): HTMLCanvasElement {
  const hit = flash ? b.coarseWhite : b.coarse;
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(src.width / CHAR_DENSITY));
  c.height = Math.max(1, Math.round(src.height / CHAR_DENSITY));
  const x = c.getContext('2d')!;
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, c.width, c.height);
  if (flash) b.coarseWhite = c;
  else b.coarse = c;
  return c;
}

function whiteOf(b: Built): HTMLCanvasElement {
  if (b.white) return b.white;
  const c = document.createElement('canvas');
  c.width = b.c.width;
  c.height = b.c.height;
  const x = c.getContext('2d')!;
  x.drawImage(b.c, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = '#fffaf0';
  x.fillRect(0, 0, c.width, c.height);
  b.white = c;
  return c;
}

/** Nominal sprite size (feet anchor is bottom-center). */
export function characterSize(look: Look): { w: number; h: number } {
  if (look.species === 'raccoon') return { w: 18, h: 16 };
  const m = metrics(look);
  return { w: m.shW + m.armD * 2 + 2, h: totalHeight(m) + 2 };
}

function hash1(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Sub-frame of a quirk `u` seconds into it, or -1 once it is over. */
function quirkSub(q: Quirk, u: number): number {
  if (u < 0) return -1;
  switch (q) {
    case 'tap':
      return u < 2.2 ? Math.floor(u * 5) & 1 : -1;
    case 'bounce':
      return u < 1.65 ? Math.floor(u * 6) & 1 : -1;
    case 'glasses':
      return u < 0.22 ? 0 : u < 0.75 ? 1 : u < 0.95 ? 0 : -1;
    case 'stretch':
      return u < 0.3 ? 0 : u < 1.7 ? 1 : u < 2 ? 0 : -1;
  }
}

/**
 * The idle program: slow uneven breathing, and every few seconds a chance
 * to shift weight, glance around or indulge a personal quirk. Each look
 * gets its own breathing rate and slot length (seed), so a crowd never
 * moves in step. Frames are state * 2 + breath (see idlePose in body.ts).
 */
function idleFrame(t: number, seed: number, quirk: number): number {
  const bp = 2.9 + seed * 0.9;
  const breath = (t / bp) % 1 < 0.46 ? 0 : 1;
  const slot = 4.5 + seed * 2.5;
  const n = Math.floor(t / slot);
  const u = t - n * slot;
  const h = hash1(n + seed * 977);
  if (h < 0.28) return IDLE_SHIFT * 2 + breath;
  if (h < 0.48) {
    if (u > 0.8 && u < 1.9) return IDLE_LOOK_A * 2;
    if (u > 2.3 && u < 3.2) return IDLE_LOOK_B * 2;
  } else if (h < 0.74 && quirk >= 0) {
    const sub = quirkSub(IDLE_QUIRKS[quirk], u - 0.6);
    if (sub >= 0) return (IDLE_QUIRK0 + quirk * 2 + sub) * 2;
  }
  return breath;
}

/** Which animation frame a pose shows at time t (shared by drawCharacter and previews). */
function frameFor(pose: Pose, opts: DrawOpts, seed: number, sequins: boolean): { frame: number; blink: boolean; tw: number } {
  const t = (opts.t ?? 0) + seed * 7;
  let frame = opts.frame ?? 0;
  let canBlink = true;
  if (pose === 'idle') {
    // Without a clock, an explicit frame picks the idle state (previews, tests).
    frame = opts.t === undefined ? (opts.frame ?? 0) : idleFrame(t, seed, opts.quirk ? IDLE_QUIRKS.indexOf(opts.quirk) : -1);
    canBlink = frame >> 1 <= IDLE_SHIFT;
  } else if (pose === 'celebrate') frame = Math.floor(t * 4) & 1;
  else if (pose === 'wave') frame = Math.floor(t * 3.5) & 1;
  else if (pose === 'fireup') frame = Math.floor(t * 14) & 1;
  else if (pose === 'walk' || pose === 'run') {
    // Walk frames are driven by distance (Actor.phase), so feet stay planted.
    const n = pose === 'run' ? RUN_FRAMES : WALK_FRAMES;
    frame = ((frame % n) + n) % n;
    canBlink = false;
  } else if (pose === 'hop') frame &= 1;
  else frame = 0;
  const eyesOpen = canBlink && !['down', 'pinned', 'held', 'sell', 'lifted', 'aerial', 'kick'].includes(pose);
  // Blinks: every ~4 s, with the odd double blink.
  const bt = t % 3.9;
  const blink = opts.t !== undefined && eyesOpen && (bt < 0.13 || (hash1(Math.floor(t / 3.9) + seed * 31) < 0.2 && bt > 0.26 && bt < 0.37));
  const tw = sequins && opts.t !== undefined ? Math.floor(t * 6) & 3 : 0;
  return { frame, blink, tw };
}

/** Draw a character with feet at (x, y). */
export function drawCharacter(ctx: CanvasRenderingContext2D, look: Look, x: number, y: number, opts: DrawOpts): void {
  const pose = opts.pose ?? 'idle';
  const facing = opts.facing ?? 'down';
  const lk = lookKey(look);
  const { frame, blink, tw } = frameFor(pose, opts, lk.seed, lk.sequins);
  let l = look;
  if (opts.noItem && look.extras?.some((e) => EXTRA_SLOT[e.id] === 'hand')) l = { ...look, extras: look.extras.filter((e) => EXTRA_SLOT[e.id] !== 'hand') };
  const b = getBuilt(l, pose, facing, frame, blink, tw);
  const img = opts.flash ? whiteOf(b) : b.c;
  const d = CHAR_DENSITY;
  if (d === 1) {
    ctx.drawImage(img, Math.round(x) - b.ax, Math.round(y) - b.ay);
    return;
  }
  // On the doubled screen buffer the fine art lands 1:1 on buffer pixels.
  // Native-resolution offscreen canvases (the VHS TV, ghosts) get a smooth copy.
  const fine = Math.abs(ctx.getTransform().a) >= d - 0.01;
  if (fine) {
    ctx.drawImage(img, Math.round(x * d) / d - b.ax / d, Math.round(y * d) / d - b.ay / d, img.width / d, img.height / d);
  } else {
    const c = coarseOf(img, b, !!opts.flash);
    ctx.drawImage(c, Math.round(x - b.ax / d), Math.round(y - b.ay / d));
  }
}

/** The cached sprite canvas and its anchor, in art pixels (CHAR_DENSITY per native pixel). */
export function characterSprite(look: Look, opts: DrawOpts): { canvas: HTMLCanvasElement; ax: number; ay: number } {
  const pose = opts.pose ?? 'idle';
  const lk = lookKey(look);
  const { frame, blink, tw } = frameFor(pose, opts, lk.seed, lk.sequins);
  const b = getBuilt(look, pose, opts.facing ?? 'down', frame, blink, tw);
  return { canvas: opts.flash ? whiteOf(b) : b.c, ax: b.ax, ay: b.ay };
}

const portraitCache = new Map<string, HTMLCanvasElement>();

/** Drop every cached sprite (e.g. after editing looks in a tool). */
export function clearCharacterCache(): void {
  cache.clear();
  portraitCache.clear();
}

/** Square bust portrait for dialogue boxes, painted natively at `size`. */
export function renderPortrait(look: Look, expression: string = 'neutral', size = 48, opts: PortraitOpts = {}): HTMLCanvasElement {
  const expr = (EXPRESSIONS as string[]).includes(expression) ? (expression as Expression) : 'neutral';
  const bg = opts.bg !== false;
  const S = Math.max(24, Math.round(size));
  const key = `${lookKey(look).key}|${expr}|${S}|${bg ? 1 : 0}`;
  const hit = portraitCache.get(key);
  if (hit) return hit;
  const c = buildPortrait(look, expr, S, bg);
  if (portraitCache.size > 400) portraitCache.clear();
  portraitCache.set(key, c);
  return c;
}
