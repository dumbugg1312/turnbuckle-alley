/**
 * Storyline generation (§15.5): shape + cast + cards -> beats on the calendar.
 */
import { G } from '../../core/state';
import type { Rng } from '../../core/rng';
import { ALLY_PAIRS, CREW, WRESTLERS } from '../data/roster';
import { T } from '../tuning';
import type { BeatDef, CardDef, CardId, ShapeDef, ShapeRole, Slot } from '../types';
import {
  PLAYER, alignOf, canWrestle, charState, hearts, isMasked, nameOf, realOf, storyLoad, storyRoster,
} from './cast';
import { CARD, SHAPES, cardOk, cardsFor, fitOf, hitsAnyRedLine, persona, rawScore, shape as shapeOf, shapeRedLine, type ReqCtx } from './content';
import { S, cal, clamp, newId, type BeatState, type NapkinCards, type StoryScope, type Storyline } from './state';
import { mentionsRoles } from './text';

const SHOW_KINDS = new Set(['match', 'promo', 'angle', 'contract', 'interview', 'run-in']);
export const isShowBeat = (b: { kind: string }) => SHOW_KINDS.has(b.kind);

// ------------------------------------------------------------------ casting

export interface CastOpts {
  day: number;
  rng: Rng;
  fixed?: Record<string, string>;
  playerRole?: string | null;
  pitcher?: string;
  /** Characters allowed to exceed their story load (the pitcher, a signature lead). */
  allowBusy?: string[];
  /** Background stories never cast the player. */
  noPlayer?: boolean;
}

/** Role keys that crew (non-wrestlers) may fill. */
const CREW_ROLE_HINTS = ['manager', 'wedge', 'officiant', 'collateral', 'mediator', 'detective', 'skeptic', 'doubter', 'witness', 'legend', 'corner'];

function roleWrestles(sh: ShapeDef, role: string): boolean {
  if (role === 'hero' || role === 'villain') return true;
  for (const act of sh.acts) for (const b of act) if (b.kind === 'match' && b.sides?.some((s) => s.includes(role))) return true;
  return false;
}

function allyOf(id: string): string[] {
  const out: string[] = [];
  for (const [a, b] of ALLY_PAIRS) {
    if (a === id) out.push(b);
    if (b === id) out.push(a);
  }
  return out;
}

export function playerAlly(day: number, exclude: string[]): string | null {
  let best: string | null = null;
  let bestH = -1;
  for (const w of WRESTLERS) {
    if (exclude.includes(w) || w === 'mothman' || w === 'lou') continue;
    if (!canWrestle(w, day + 3)) continue;
    const h = hearts(w) + (alignOf(w) === alignOf(PLAYER) ? 2 : 0) + (storyLoad(w).any ? -3 : 0);
    if (h > bestH) {
      bestH = h;
      best = w;
    }
  }
  return best;
}

function canFill(id: string, role: ShapeRole, sh: ShapeDef, o: CastOpts): boolean {
  if (id === PLAYER) return false;
  const wrestles = roleWrestles(sh, role.key);
  const isCrew = (CREW as readonly string[]).includes(id);
  if (isCrew) {
    if (wrestles) return false;
    if (!CREW_ROLE_HINTS.some((h) => role.key.includes(h))) return false;
  }
  if (id === 'mothman') {
    const needsMoth = (sh.needs ?? []).includes('mothman');
    if (!needsMoth && !role.masked) return false;
    if (role.align === 'villain' && !needsMoth) return false;
  }
  if (id === 'lou' && !(role.key.includes('mentor') || role.key.includes('legend') || role.key.includes('corner'))) return false;
  if (role.masked && !isMasked(id)) return false;
  const c = isCrew ? null : charState(id);
  if (c?.injuredUntil !== undefined && o.day < c.injuredUntil && wrestles) return false;
  if (!o.allowBusy?.includes(id)) {
    const load = storyLoad(id);
    if ((role.key === 'hero' || role.key === 'villain') && load.lead >= T.leadLimit) return false;
    if (load.any >= T.castLimit) return false;
  }
  if (shapeRedLine(id, sh.id, role.key)) return false;
  return true;
}

function roleWeight(id: string, role: ShapeRole, o: CastOpts): number {
  const a = (CREW as readonly string[]).includes(id) ? 'hero' : alignOf(id);
  let w = 1;
  if (role.align === 'any') w = 1;
  else if (role.align === a) w = 4;
  else if (a === 'tweener') w = 1.5;
  else w = 0.2;
  const c = (CREW as readonly string[]).includes(id) ? null : charState(id);
  const idle = c?.lastStory === undefined ? 30 : o.day - c.lastStory;
  w *= 1 + clamp(idle, 0, 40) / 20;
  if (id === o.pitcher) w *= 6;
  return w;
}

export function castShape(sh: ShapeDef, o: CastOpts): Record<string, string> | null {
  const cast: Record<string, string> = { ...(o.fixed ?? {}) };
  if (o.playerRole) cast[o.playerRole] = PLAYER;
  const used = () => new Set(Object.values(cast));
  const needs = sh.needs ?? [];
  const pool = [...storyRoster(o.day), ...CREW];

  // Champion roles are fixed by the belts.
  for (const r of sh.roles) {
    if (!r.champion || cast[r.key]) continue;
    const t = S().titles[r.champion];
    const holder = t?.holders.find((h) => !used().has(h));
    if (!holder) return null;
    if (holder !== PLAYER && !canFill(holder, { ...r, champion: undefined }, sh, o) && !o.allowBusy?.includes(holder)) return null;
    cast[r.key] = holder;
  }

  if (needs.includes('twins') && !cast.hero && !cast.villain) {
    if (!canFill('bo', sh.roles.find((r) => r.key === 'hero')!, sh, o) || !canFill('buck', sh.roles.find((r) => r.key === 'villain')!, sh, o)) return null;
    const flip = o.rng.chance(0.5);
    cast.hero = flip ? 'bo' : 'buck';
    cast.villain = flip ? 'buck' : 'bo';
  }

  if (needs.includes('mothman') && !Object.values(cast).includes('mothman')) {
    const key = (sh.roles.find((r) => r.key === 'mothman' || /mothman/i.test(r.label)) ?? sh.roles.find((r) => r.key === 'villain'))?.key;
    if (!key) return null;
    if (storyLoad('mothman').any >= T.castLimit) return null;
    cast[key] = 'mothman';
  }

  if (needs.includes('returning') && !cast.hero) {
    const r = S().flags.returning;
    if (typeof r !== 'string' || used().has(r)) return null;
    cast.hero = r;
  }

  // The pitcher takes a lead role if they fit.
  if (o.pitcher && !used().has(o.pitcher) && (WRESTLERS as readonly string[]).includes(o.pitcher)) {
    const al = alignOf(o.pitcher);
    const order = al === 'villain' ? ['villain', 'hero'] : ['hero', 'villain'];
    for (const k of order) {
      const role = sh.roles.find((r) => r.key === k);
      if (role && !cast[k] && (role.align === 'any' || role.align === al || al === 'tweener') && canFill(o.pitcher, role, sh, { ...o, allowBusy: [...(o.allowBusy ?? []), o.pitcher] })) {
        cast[k] = o.pitcher;
        break;
      }
    }
  }

  const order = [...sh.roles].sort((a, b) => rank(a) - rank(b));
  function rank(r: ShapeRole): number {
    if (r.masked) return 0;
    if (r.key === 'hero') return 1;
    if (r.key === 'villain') return 2;
    return r.optional ? 4 : 3;
  }

  for (const role of order) {
    if (cast[role.key]) continue;
    let cands = pool.filter((id) => !used().has(id) && canFill(id, role, sh, o));
    if (role.key === 'villain' && needs.includes('allies') && cast.hero) {
      const allies = cast.hero === PLAYER ? [] : allyOf(cast.hero);
      const filtered = cands.filter((c) => allies.includes(c));
      if (cast.hero === PLAYER) {
        const pal = playerAlly(o.day, [...used()]);
        cands = pal && cands.includes(pal) ? [pal] : cands.filter((c) => hearts(c) >= 2);
      } else cands = filtered;
    }
    if (role.key === 'villain' && needs.includes('history') && cast.hero) {
      cands = cands.filter((c) => (S().cool.pairs[[c, cast.hero].sort().join('|')] ?? 0) > 0);
    }
    if (!cands.length) {
      if (role.optional) continue;
      return null;
    }
    if (role.optional && !o.rng.chance(0.6)) continue;
    cast[role.key] = o.rng.weighted(cands, (id) => roleWeight(id, role, o));
  }
  if (!cast.hero || !cast.villain) return null;
  if (cast.hero === cast.villain) return null;
  return cast;
}

// ------------------------------------------------------------------ cards

const RARITY_W = { common: 1, uncommon: 0.75, rare: 0.45, legendary: 0.2 } as const;

export interface CardOpts {
  rng: Rng;
  day: number;
  weeks: number;
  pitcher?: string;
  /** Only choose from these card ids (the player's Tin). */
  pool?: string[];
  locked?: Partial<NapkinCards>;
  twistChance?: number;
}

export function windowCtx(_sh: ShapeDef, cast: Record<string, string>, day: number, weeks: number): ReqCtx {
  const first = cal.isShow(day) ? day : cal.nextShow(day);
  const shows = cal.showsFrom(first, Math.max(3, weeks * 2));
  const last = shows[shows.length - 1];
  const sup = cal.nextSuper(first);
  const superSeason = Math.abs(sup - last) <= 7 && sup - first >= 7 ? cal.season(sup) : null;
  return {
    cast: Object.values(cast),
    castMap: cast,
    superSeason,
    payoffSeason: cal.season(last),
    hasSaturday: true,
    night: true,
  };
}

function legalFor(c: CardDef, cast: Record<string, string>, ctx: ReqCtx): boolean {
  if (!cardOk(c, ctx)) return false;
  if (hitsAnyRedLine(c, Object.values(cast))) return false;
  if (c.stakes?.outcome === 'leave_town' && (Object.values(cast).includes(PLAYER) || Object.values(cast).some((x) => (CREW as readonly string[]).includes(x)))) return false;
  if ((c.stakes?.outcome === 'mask' || c.stakes?.outcome === 'hair' || c.stakes?.outcome === 'career' || c.stakes?.outcome === 'building')) return false;
  return true;
}

export function pickCard(slot: Slot, sh: ShapeDef, cast: Record<string, string>, o: CardOpts, ctx: ReqCtx, exclude: string[] = []): CardDef | undefined {
  const s = S();
  let cands = cardsFor(slot).filter((c) => !exclude.includes(c.id) && legalFor(c, cast, ctx));
  if (o.pool) {
    const inPool = cands.filter((c) => o.pool!.includes(c.id));
    if (inPool.length) cands = inPool;
  }
  if (!cands.length) return undefined;
  const npcs = Object.values(cast).filter((c) => c !== PLAYER && (WRESTLERS as readonly string[]).includes(c));
  const fits = (sh.cards[slot as 'hook'] ?? []) as string[];
  return o.rng.weighted(cands, (c) => {
    let w = (fits.includes(c.id) ? 5 : 1) * RARITY_W[c.rarity];
    const last = s.cool.cards[c.id];
    if (last !== undefined && o.day - last < T.cooldownDays) w *= 0.35;
    let sc = 0;
    for (const n of npcs) sc += rawScore(n, c, sh.id);
    if (o.pitcher) sc += rawScore(o.pitcher, c, sh.id);
    w *= Math.exp(clamp(sc, -12, 12) / 5);
    return w;
  });
}

export function chooseCards(sh: ShapeDef, cast: Record<string, string>, o: CardOpts): NapkinCards | null {
  const ctx = windowCtx(sh, cast, o.day, o.weeks);
  const L = o.locked ?? {};
  const hook = L.hook ? CARD[L.hook] : pickCard('hook', sh, cast, o, ctx);
  const payoff = L.payoff ? CARD[L.payoff] : pickCard('payoff', sh, cast, o, ctx);
  const stakes = L.stakes ? CARD[L.stakes] : pickCard('stakes', sh, cast, o, ctx);
  if (!hook || !payoff || !stakes) return null;
  let twist: CardDef | undefined = L.twist ? CARD[L.twist] : undefined;
  if (!twist && !L.twist && o.rng.chance(o.twistChance ?? 0.65)) twist = pickCard('twist', sh, cast, o, ctx);
  const segments: CardId[] = [];
  const nSeg = o.rng.chance(0.55) ? 1 : o.rng.chance(0.3) ? 2 : 0;
  for (let i = 0; i < nSeg; i++) {
    const sg = pickCard('segment', sh, cast, o, ctx, segments);
    if (sg) segments.push(sg.id);
  }
  return { hook: hook.id, twist: twist?.id, stakes: stakes.id, payoff: payoff.id, segments };
}

// ------------------------------------------------------------------ beats

/** Built-in filler beats used when a story needs more show beats than its shape gives. */
const GENERIC: Record<string, BeatDef> = {
  heat: {
    key: 'g_heat', kind: 'match', purpose: 'heat', sides: [['villain'], ['@any']], winner: 0, cheat: true,
    title: '{villain} vs. a stand-in',
    text: [
      '{villain} spent the whole match pointing at the curtain, daring {hero} to come out. When {hero} finally did, it cost the poor stand-in the match.',
      'With {hero} watching from the aisle, {villain} won ugly, then mouthed something at the camera that made Agnes Pickett stand up.',
    ],
    headline: ['{villain} SENDS A MESSAGE', 'IS ANYONE SAFE FROM {villain}?'],
  },
  shine: {
    key: 'g_shine', kind: 'match', purpose: 'establish', sides: [['hero'], ['@any']], winner: 0,
    title: '{hero} in action',
    text: [
      '{hero} won a tune-up match with {hero.signature}, then pointed straight at the camera: a message for {villain}.',
      'The crowd counted along as {hero} picked up a win, and Pip held his cardboard belt over his head for the whole three.',
    ],
    headline: ['{hero} IS READY', '{hero} ROLLS ON'],
  },
  promo: {
    key: 'g_promo', kind: 'promo', purpose: 'segment', roles: ['villain', 'hero'],
    title: '{villain} has words for {hero}',
    text: [
      '{villain} took Gus Gravel\'s microphone and spent four minutes explaining everything wrong with {hero}. Most of it was about {hero.their} boots.',
      '{villain} cut a promo so ornery that Mayor Oakes filed a complaint in triplicate before it ended. {hero} answered with one sentence and a stare.',
    ],
    headline: ['{villain} SPEAKS; TOWN DISAGREES', 'HARSH WORDS FOR {hero}'],
  },
  brawl: {
    key: 'g_brawl', kind: 'angle', purpose: 'heat', roles: ['hero', 'villain'],
    title: '{hero} and {villain} brawl backstage',
    text: [
      'The crew camcorder caught {hero} and {villain} brawling past the concession stand. Referee Mo needed three tries to separate them.',
      '{villain} jumped {hero} by the curtain. By the time the locker room emptied, the two of them had rolled halfway to the parking lot.',
    ],
    headline: ['BACKSTAGE BRAWL!', 'CAMCORDER CATCHES CHAOS'],
  },
  gohome: {
    key: 'g_gohome', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
    title: 'Face to face: {hero} and {villain}',
    text: [
      '{hero} and {villain} stood nose to nose in the middle of the ring. Nobody threw a punch. Somehow that was worse.',
      'One last face-off before the big one. {villain} offered a handshake, then yanked it back, and the building nearly came apart.',
    ],
    headline: ['ONE MORE SLEEP', 'THE STARE-DOWN'],
  },
  town: {
    key: 'g_town', kind: 'town', purpose: 'town', roles: ['villain'], place: 'Tallbridge Bakery',
    title: 'Villain surcharge',
    text: [
      'The price board at Tallbridge Bakery has a new line in chalk: VILLAIN SURCHARGE $1, with {villain} written next to it. Twice.',
      'Kids chalked {hero} lifting a belt on the sidewalk outside the library, and {villain} as a very grumpy stick figure.',
    ],
    headline: ['BAKERY TAKES A STAND', 'SIDEWALK ART SHOW TURNS POLITICAL'],
  },
  booth: {
    key: 'g_booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
    title: 'In the booth',
    text: [
      'In the back booth, {hero.real} and {villain.real} split a slice of pie and argued, happily, about who sold the finish better.',
      'June slid two coffees across the back booth. {villain.real} raised a mug to {hero.real}: "Good story. Let\'s do another one someday."',
    ],
  },
};

/** Each '@any' in a match is a different outsider: '@any', '@any2', '@any3'... */
export function uniqueOutsiders(sides: string[][]): string[][] {
  let n = 0;
  return sides.map((side) => side.map((r) => (r.startsWith('@') ? (++n === 1 ? '@any' : `@any${n}`) : r)));
}

function beatFromDef(def: BeatDef, act: 1 | 2 | 3, src: BeatState['src']): BeatState {
  return {
    id: '', act, kind: def.kind, purpose: def.purpose, src,
    sides: def.sides ? uniqueOutsiders(def.sides) : undefined, roles: def.roles ? [...def.roles] : undefined,
    winner: def.winner, cheat: def.cheat, optional: def.optional, day: -1, status: 'pending', place: def.place,
  };
}

function beatOk(def: BeatDef, cast: Record<string, string>): boolean {
  const roles = new Set<string>();
  for (const s of def.sides ?? []) for (const r of s) roles.add(r);
  for (const r of def.roles ?? []) roles.add(r);
  for (const t of [def.title, ...def.text]) for (const m of mentionsRoles(t)) roles.add(m);
  const globals = new Set(['title', 'venue', 'story', 'hook', 'twist', 'stakes', 'payoff', 'winner', 'loser', 'name', 'ring', 'they', 'them', 'their', 'theirs', 'theyre', 'are', 'nick']);
  for (const r of roles) {
    if (r.startsWith('@')) continue;
    if (globals.has(r) || globals.has(r.toLowerCase())) continue;
    if (!cast[r]) return false;
  }
  // The villain never cheats if a hero holds the villain role (respect stories).
  return true;
}

export function genericBeat(key: keyof typeof GENERIC, act: 1 | 2 | 3): BeatState {
  return beatFromDef(GENERIC[key], act, { from: 'generic', key });
}
export function genericDef(key: string): BeatDef | undefined {
  return GENERIC[key];
}

/** Payoff match sides by stipulation. */
export function payoffSides(stip: string, cast: Record<string, string>): string[][] {
  const hero = ['hero'];
  const vil = ['villain'];
  switch (stip) {
    case 'tag': {
      const partners = !!cast.ally && cast.ally !== cast.villain;
      return [partners ? ['hero', 'ally'] : ['hero', '@any'], ['villain', '@any2']];
    }
    case 'four-corners': return [hero, vil, ['@any']];
    case 'battle-royal': return [hero, vil, ['@any'], ['@any2'], ['@any3']];
    default: return [hero, vil];
  }
}

export function expandBeats(st: Storyline, sh: ShapeDef, rng: Rng): BeatState[] {
  const out: BeatState[] = [];
  const hookCard = CARD[st.cards.hook];
  const twistCard = st.cards.twist ? CARD[st.cards.twist] : undefined;
  const stakesCard = CARD[st.cards.stakes];
  const payoffCard = CARD[st.cards.payoff];

  // Act I
  if (hookCard?.beat) {
    const k = hookCard.beat.kind;
    const b: BeatState = { id: '', act: 1, kind: k, purpose: 'hook', src: { from: 'card', card: hookCard.id, part: 'beat' }, day: -1, status: 'pending', roles: ['hero', 'villain'] };
    if (k === 'match') {
      b.sides = [['hero'], ['villain']];
      b.winner = rng.chance(0.55) ? 0 : 1;
      b.cheat = b.winner === 1;
    }
    out.push(b);
  }
  sh.acts[0].forEach((d, i) => { if (beatOk(d, st.cast)) out.push(beatFromDef(d, 1, { from: 'shape', act: 0, idx: i })); });

  // Act II
  const act2: BeatState[] = [];
  sh.acts[1].forEach((d, i) => { if (beatOk(d, st.cast)) act2.push(beatFromDef(d, 2, { from: 'shape', act: 1, idx: i })); });
  for (const sg of st.cards.segments) {
    const c = CARD[sg];
    if (!c?.beat) continue;
    const b: BeatState = { id: '', act: 2, kind: c.beat.kind, purpose: 'segment', src: { from: 'card', card: c.id, part: 'beat' }, day: -1, status: 'pending', roles: ['hero', 'villain'], optional: true };
    if (c.beat.kind === 'match') {
      b.sides = [['hero'], ['villain']];
      b.winner = rng.chance(0.5) ? 0 : 1;
      b.cheat = b.winner === 1;
    }
    act2.splice(rng.int(0, act2.length), 0, b);
  }
  let twistBeat: BeatState | null = null;
  if (twistCard?.beat) {
    twistBeat = { id: '', act: 2, kind: twistCard.beat.kind, purpose: 'twist', src: { from: 'card', card: twistCard.id, part: 'beat' }, day: -1, status: 'pending', roles: ['hero', 'villain'] };
    if (twistCard.beat.kind === 'match') {
      twistBeat.sides = [['hero'], ['villain']];
      twistBeat.winner = 1;
      twistBeat.cheat = true;
    }
    if (sh.twistAt === 'midpoint') act2.splice(Math.floor(act2.length / 2), 0, twistBeat);
    else if (sh.twistAt === 'end_act2') act2.push(twistBeat);
  }
  if (stakesCard?.stakes) {
    act2.push({ id: '', act: 2, kind: rng.chance(0.6) ? 'contract' : 'promo', purpose: 'stakes', src: { from: 'card', card: stakesCard.id, part: 'declare' }, day: -1, status: 'pending', roles: ['hero', 'villain'] });
  }
  out.push(...act2);

  // Act III
  const act3: BeatState[] = [];
  sh.acts[2].forEach((d, i) => { if (beatOk(d, st.cast)) act3.push(beatFromDef(d, 3, { from: 'shape', act: 2, idx: i })); });
  if (!act3.some((b) => b.purpose === 'gohome')) act3.unshift(genericBeat('gohome', 3));
  if (!act3.some((b) => b.kind === 'booth')) act3.push(genericBeat('booth', 3));
  const payoff: BeatState = {
    id: '', act: 3, kind: 'match', purpose: 'payoff', src: { from: 'card', card: payoffCard?.id ?? 'PO-01', part: 'payoff' }, day: -1, status: 'pending',
    sides: payoffSides(payoffCard?.payoff?.stip ?? 'standard', st.cast),
  };
  if (twistBeat && sh.twistAt === 'finish') payoff.twistText = 'pending';
  // The booked finish comes from the planned ending.
  const ending = sh.endings.find((e) => e.id === st.ending);
  const wr = ending?.winner ?? null;
  payoff.winner = wr ? Math.max(0, payoff.sides!.findIndex((side) => side.includes(wr))) : null;
  const twins = [st.cast.hero, st.cast.villain].sort().join('|') === 'bo|buck';
  if (twins) payoff.winner = null; // the twins never pin each other clean
  if (payoff.winner !== null && wr && st.cast[wr] && alignOf(st.cast[wr]) === 'villain') payoff.cheat = rng.chance(0.45);
  const boothIdx = act3.findIndex((b) => b.kind === 'booth');
  act3.splice(boothIdx >= 0 ? boothIdx : act3.length, 0, payoff);
  out.push(...act3);

  // At least one town moment per story.
  if (!out.some((b) => b.kind === 'town')) out.splice(Math.min(2, out.length), 0, genericBeat('town', 1));
  return out;
}

// ------------------------------------------------------------------ scheduling

export interface PayoffReq {
  saturday?: boolean;
  vfw?: boolean;
  supershow?: number | 'any';
  night?: boolean;
}

export function payoffReq(c: CardDef | undefined): PayoffReq {
  const r: PayoffReq = {};
  for (const q of c?.requires ?? []) {
    if (q.kind === 'saturday') r.saturday = true;
    if (q.kind === 'vfw') r.vfw = true;
    if (q.kind === 'night') r.night = true;
    if (q.kind === 'supershow') r.supershow = q.season ?? 'any';
  }
  if (c?.payoff && ['cage', 'ladder', 'last-standing', 'iron-hour', 'lights-out'].includes(c.payoff.stip)) r.saturday = true;
  if (c?.payoff?.stip === 'bingo-brawl') r.vfw = true;
  return r;
}

const ESSENTIAL = new Set(['hook', 'twist', 'stakes', 'gohome', 'payoff']);

export function scheduleBeats(st: Storyline, rng: Rng): void {
  const first = cal.isShow(st.start) ? st.start : cal.nextShow(st.start);
  const nShows = Math.max(3, st.weeks * 2);
  let shows = cal.showsFrom(first, nShows);
  let payoffDay = shows[shows.length - 1];
  const req = payoffReq(CARD[st.cards.payoff]);
  const sup = cal.nextSuper(first);
  if (req.supershow !== undefined) {
    payoffDay = sup;
    if (req.supershow !== 'any') {
      let d = sup;
      while (cal.season(d) !== req.supershow && d < first + 120) d = cal.nextSuper(d + 1);
      payoffDay = d;
    }
  } else if (Math.abs(sup - payoffDay) <= 7 && sup - first >= 6 && rng.chance(0.8)) payoffDay = sup;
  if ((req.saturday || req.night) && cal.isWed(payoffDay)) payoffDay += 3;
  if (req.vfw && !cal.isWed(payoffDay)) payoffDay = cal.isSat(payoffDay) ? payoffDay + 4 : cal.nextShow(payoffDay);
  while (req.vfw && !cal.isWed(payoffDay)) payoffDay = cal.nextShow(payoffDay);
  shows = cal.showsBetween(first, payoffDay);
  if (shows.length < 2) {
    payoffDay = cal.nextShow(payoffDay);
    while ((req.saturday || req.night) && !cal.isSat(payoffDay)) payoffDay = cal.nextShow(payoffDay);
    while (req.vfw && !cal.isWed(payoffDay)) payoffDay = cal.nextShow(payoffDay);
    shows = cal.showsBetween(first, payoffDay);
  }

  const slots = shows.length - 1;
  let showBeats = st.beats.filter((b) => isShowBeat(b) && b.purpose !== 'payoff');
  const target = clamp(Math.round(shows.length * T.showUse) - 1 + (shows.length <= 4 ? 1 : 0), Math.min(2, slots), slots);
  const drop = (b: BeatState) => {
    st.beats = st.beats.filter((x) => x !== b);
    showBeats = showBeats.filter((x) => x !== b);
  };
  const dropOrder = () => {
    const opt = [...showBeats].reverse().find((b) => b.optional && !ESSENTIAL.has(b.purpose));
    if (opt) return opt;
    const nonEss = [...showBeats].reverse().find((b) => !ESSENTIAL.has(b.purpose) && b.act === 2) ?? [...showBeats].reverse().find((b) => !ESSENTIAL.has(b.purpose));
    if (nonEss) return nonEss;
    return showBeats.find((b) => b.purpose === 'gohome') ?? showBeats.find((b) => b.purpose === 'stakes');
  };
  while (showBeats.length > target) {
    const d = dropOrder();
    if (!d) break;
    drop(d);
  }
  while (showBeats.length > slots && showBeats.length) drop(showBeats[showBeats.length - 1]);
  // Too few? Pad Act II with filler.
  while (showBeats.length < Math.min(target, 2) && slots > showBeats.length) {
    const g = genericBeat(showBeats.length % 2 ? 'promo' : 'heat', 2);
    const idx = st.beats.findIndex((b) => b.purpose === 'stakes' || b.purpose === 'twist' || b.act === 3);
    st.beats.splice(idx >= 0 ? idx : st.beats.length, 0, g);
    showBeats = st.beats.filter((b) => isShowBeat(b) && b.purpose !== 'payoff');
  }

  // Spread show beats across the shows before the payoff.
  const k = showBeats.length;
  const idxs: number[] = [];
  for (let i = 0; i < k; i++) idxs.push(k === 1 ? 0 : Math.round((i * (slots - 1)) / (k - 1)));
  for (let i = 1; i < k; i++) if (idxs[i] <= idxs[i - 1]) idxs[i] = idxs[i - 1] + 1;
  for (let i = k - 1; i >= 0; i--) if (idxs[i] > slots - 1 - (k - 1 - i)) idxs[i] = slots - 1 - (k - 1 - i);
  showBeats.forEach((b, i) => (b.day = shows[Math.max(0, idxs[i])]));

  // Off-card beats land on the quiet days after the show beat before them.
  const usedDays = new Set<number>();
  let prevShow = first - 1;
  let prevPayoff = false;
  for (const b of st.beats) {
    if (b.purpose === 'payoff') {
      b.day = payoffDay;
      prevShow = payoffDay;
      prevPayoff = true;
      continue;
    }
    if (isShowBeat(b)) {
      prevShow = b.day;
      continue;
    }
    if (b.kind === 'booth') {
      b.day = prevPayoff ? payoffDay : prevShow;
      continue;
    }
    let d = prevShow + 1;
    for (let guard = 0; guard < 10; guard++) {
      const wd = cal.weekday(d);
      const okDay = b.kind === 'wrsl' ? wd === 0 || wd === 3 : !cal.isShow(d);
      if (okDay && !usedDays.has(d)) break;
      d++;
    }
    usedDays.add(d);
    b.day = d;
  }
  st.end = payoffDay;
  st.beats.forEach((b, i) => (b.id = `${st.id}-b${i}`));
}

/** Slide every pending show beat of a story to later shows (a beat couldn't fit tonight). */
export function slideStory(st: Storyline, fromDay: number): void {
  let cursor = fromDay;
  let delta = 0;
  for (const b of st.beats) {
    if (b.status !== 'pending') continue;
    if (isShowBeat(b)) {
      const old = b.day;
      if (b.day <= cursor) {
        let d = cal.nextShow(cursor);
        if (b.purpose === 'payoff') {
          const req = payoffReq(CARD[st.cards.payoff]);
          while ((req.saturday || req.night) && !cal.isSat(d)) d = cal.nextShow(d);
          while (req.vfw && !cal.isWed(d)) d = cal.nextShow(d);
        }
        b.day = d;
      }
      delta = b.day - old;
      cursor = b.day;
    } else if (b.day <= cursor || delta > 0) {
      b.day = Math.max(b.day + Math.max(0, delta), b.kind === 'booth' ? cursor : cursor + 1);
      if (b.kind !== 'booth') while (cal.isShow(b.day)) b.day++;
    }
  }
  const payoff = st.beats.find((b) => b.purpose === 'payoff');
  if (payoff) st.end = payoff.day;
}

// ------------------------------------------------------------------ naming

const CONFLICTS = [
  'Conflict', 'Clash', 'Caper', 'Calamity', 'Crusade', 'Showdown', 'Saga', 'Affair', 'Uprising', 'Feud', 'Fracas',
  'Fiasco', 'Kerfuffle', 'Brouhaha', 'Rumble', 'Ruckus', 'Standoff', 'Scandal', 'Squabble', 'Tussle', 'Ballad',
  'Business', 'Blowup', 'Mystery', 'Matter', 'Muddle', 'Melee', 'War', 'Hullabaloo', 'Hoedown', 'Grudge', 'Gambit',
  'Debacle', 'Dust-Up', 'Donnybrook', 'Tangle', 'Tempest', 'Pickle', 'Predicament', 'Rivalry', 'Riddle', 'Wrangle',
  'Lament', 'Legend', 'Jamboree', 'Jumble', 'Imbroglio', 'Incident', 'Quarrel', 'Quandary', 'Vendetta',
];

function motifsFor(id: string): string[] {
  if (id === PLAYER) {
    const p = G.player.persona;
    const first = (p?.ringName ?? G.player.name ?? 'Rookie').split(/\s+/)[0].replace(/[^A-Za-z]/g, '');
    return [first || 'Rookie', 'Rookie', 'Hometown', 'Greenhorn'];
  }
  const m = persona(id).motifs;
  return m.length ? m : [realOf(id)];
}

export function gusTitle(st: Pick<Storyline, 'cast' | 'shape'>, rng: Rng): string {
  const sh = shapeOf(st.shape);
  const words = [...(sh.gusWords ?? []), ...CONFLICTS];
  const motifs = [...motifsFor(st.cast.hero), ...motifsFor(st.cast.villain)];
  const m = rng.pick(motifs);
  const pattern = rng.int(0, 9);
  if (pattern <= 5) {
    const allit = words.filter((w) => w[0].toLowerCase() === m[0].toLowerCase());
    const w = allit.length && rng.chance(0.8) ? rng.pick(allit) : rng.pick(words);
    return `The ${m} ${w}`;
  }
  if (pattern <= 7) {
    const m2 = rng.pick(motifsFor(st.cast.villain).filter((x) => x !== m).concat(motifsFor(st.cast.hero)));
    return m2 && m2 !== m ? `${m} vs. ${m2}` : `The ${m} ${rng.pick(words)}`;
  }
  const lead = st.cast.hero === PLAYER ? nameOf(PLAYER) : realOf(st.cast.hero);
  return `${lead.split(' ')[0]}'s ${rng.pick(sh.gusWords?.length ? sh.gusWords : words)}`;
}

// ------------------------------------------------------------------ building

export interface BuildOpts {
  scope: StoryScope;
  shapeId: string;
  cast: Record<string, string>;
  cards: NapkinCards;
  weeks: number;
  start: number;
  rng: Rng;
  pitcher?: string;
  signature?: string;
  ending?: string;
  spins?: Storyline['spins'];
  signatures?: string[];
  secretTwist?: boolean;
  buzzBonus?: number;
  buzzFloor?: number;
  title?: string;
  wildcards?: CardId[];
}

export function chooseEnding(sh: ShapeDef, cast: Record<string, string>, rng: Rng): string {
  const isPlayer = Object.values(cast).includes(PLAYER);
  let endings = sh.endings.filter((e) => !e.winner || cast[e.winner]);
  // A player's payoff always has a winner (the match system has no draws).
  if (isPlayer && endings.some((e) => e.winner)) endings = endings.filter((e) => e.winner);
  if (!endings.length) return sh.endings[0]?.id ?? 'default';
  const playerRole = Object.entries(cast).find(([, v]) => v === PLAYER)?.[0];
  const pWin = T.playerPayoffWin[G.player.rank];
  const e = rng.weighted(endings, (en) => {
    let w = en.weight;
    if (playerRole && en.winner) w *= en.winner === playerRole ? pWin * 2 : (1 - pWin) * 2;
    if (sh.id === 'rookie_first_win' && playerRole === 'hero' && en.winner === 'hero') w *= 8;
    // Twins never pin each other clean.
    if (cast.hero && cast.villain && [cast.hero, cast.villain].sort().join('|') === 'bo|buck' && en.winner) w *= 0.3;
    return w;
  });
  return e.id;
}

export function buildStoryline(o: BuildOpts): Storyline {
  const sh = shapeOf(o.shapeId);
  const id = newId('st');
  const st: Storyline = {
    id,
    title: o.title ?? gusTitle({ cast: o.cast, shape: sh.id }, o.rng),
    shape: sh.id,
    scope: o.scope,
    pitcher: o.pitcher,
    signature: o.signature,
    cast: { ...o.cast },
    cards: { ...o.cards, segments: [...o.cards.segments] },
    spins: o.spins ?? [],
    weeks: clamp(o.weeks, 2, 12),
    start: o.start,
    end: o.start,
    beats: [],
    buzz: T.buzzStart,
    peakBuzz: T.buzzStart,
    buzzFloor: o.buzzFloor ?? (o.signature ? T.signatureFloor : 0),
    status: 'running',
    lowStreak: 0,
    saves: 0,
    extended: false,
    ending: o.ending ?? chooseEnding(sh, o.cast, o.rng),
    stamps: o.signature ? ['signature'] : [],
    lessons: [],
    decisions: [],
    headlines: [],
    stars: [],
    seed: Math.floor(o.rng.next() * 2 ** 31),
    signatures: o.signatures ?? [],
    secretTwist: o.secretTwist,
    playerIn: Object.values(o.cast).includes(PLAYER),
    wildcards: o.wildcards ?? [],
    flopCauses: [],
    log: [],
  };
  // Twins: a breakup never ends in a clean pin.
  st.beats = expandBeats(st, sh, o.rng);
  scheduleBeats(st, o.rng);
  const f = fitOf(st);
  st.buzz = clamp(T.buzzStart + f.fit * T.fitBonus + Math.min(2, f.loves) * T.loveBonus - f.fatigue * T.cardFatigue + (o.buzzBonus ?? 0), 20, 80);
  st.peakBuzz = st.buzz;
  const s = S();
  s.cool.shapes[sh.id] = o.start;
  for (const c of [st.cards.hook, st.cards.twist, st.cards.stakes, st.cards.payoff, ...st.cards.segments]) if (c) s.cool.cards[c] = o.start;
  for (const who of Object.values(st.cast)) if (who !== PLAYER && (WRESTLERS as readonly string[]).includes(who)) charState(who).lastStory = o.start;
  return st;
}

/** Shapes a background (NPC-only) story can use. */
export function backgroundShapes(): ShapeDef[] {
  return SHAPES.filter((s) => s.background && !(s.needs ?? []).some((n) => n === 'retiring' || n === 'romance' || n === 'returning'));
}

/** Generate a complete NPC-vs-NPC background story, or null if nothing fits today. */
export function generateBackground(day: number, rng: Rng, opts: { shapeId?: string; fixed?: Record<string, string>; startOffset?: number } = {}): Storyline | null {
  const shapes = opts.shapeId ? [shapeOf(opts.shapeId)] : backgroundShapes();
  const s = S();
  for (let attempt = 0; attempt < 8; attempt++) {
    const sh = rng.weighted(shapes, (x) => {
      const last = s.cool.shapes[x.id];
      const rare = (x.needs ?? []).includes('mothman') || (x.needs ?? []).includes('masked') ? 0.3 : 1;
      return (last !== undefined && day - last < T.cooldownDays ? 0.15 : 1) * rare;
    });
    const cast = castShape(sh, { day, rng, fixed: opts.fixed, noPlayer: true });
    if (!cast) continue;
    const weeks = clamp(rng.int(sh.length[0], Math.min(sh.length[1] + 1, sh.length[2])), 2, 6);
    const cards = chooseCards(sh, cast, { rng, day, weeks });
    if (!cards) continue;
    return buildStoryline({ scope: 'background', shapeId: sh.id, cast, cards, weeks, start: day + (opts.startOffset ?? 0), rng });
  }
  return null;
}

export { roleWrestles };
