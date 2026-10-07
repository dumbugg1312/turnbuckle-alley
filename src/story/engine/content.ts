/**
 * Content indexes and the personality judge (§6.1): how a character scores a
 * card, red lines, spins, counter-offers.
 */
import { G, RANKS } from '../../core/state';
import { CARDS, STARTER_DECK } from '../data/cards';
import { PERSONALITIES, TRAITS } from '../data/personalities';
import { SHAPES } from '../data/shapes';
import type { Barks, CardDef, CardId, CardReq, Personality, RedLineDef, ShapeDef, Slot, SpinDef } from '../types';
import { PLAYER, hearts, isMasked } from './cast';
import { S, cal, type Storyline } from './state';

export const CARD: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export const SHAPE: Record<string, ShapeDef> = Object.fromEntries(SHAPES.map((s) => [s.id, s]));
export { CARDS, SHAPES, STARTER_DECK, PERSONALITIES, TRAITS };

export function card(id: string): CardDef | undefined {
  return CARD[id];
}
export function shape(id: string): ShapeDef {
  return SHAPE[id] ?? SHAPES[0];
}
export function cardsFor(slot: Slot): CardDef[] {
  return CARDS.filter((c) => c.slot === slot);
}

export const DEFAULT_PERSONALITY: Personality = {
  id: 'nobody', traits: [], loves: [], redLines: [], spins: [], spotlight: 50, ego: 50, lovable: 0, motifs: ['Ruckus'],
  wants: ['I want a story folks will talk about at the bakery.'], nudges: ['*They give you a look that says: later. Somewhere private.*'],
  opener: ['Okay. Hear me out.'], signoff: ['Shake on it.'], booth: ['Good show tonight.'], barks: {}, shapes: [], canPitch: true,
};

export function persona(id: string): Personality {
  return PERSONALITIES[id] ?? DEFAULT_PERSONALITY;
}

// ------------------------------------------------------------------ requirements

export interface ReqCtx {
  cast: string[];
  castMap: Record<string, string>;
  /** Payoff day kind if already known. */
  payoffKind?: 'wednesday' | 'saturday' | 'supershow';
  payoffSeason?: number;
  /** A supershow is reachable inside the story window. */
  superSeason?: number | null;
  /** The story spans a Saturday (almost always). */
  hasSaturday: boolean;
  /** Nights available (Saturday shows). */
  night: boolean;
  /** Being chosen for a pitch the player will see (allows 'never'? no). */
}

function hasTitle(ctx: ReqCtx): boolean {
  const titles = S().titles;
  return Object.values(titles).some((t) => t.id !== 'tag' && t.holders.some((h) => ctx.cast.includes(h)));
}

function historyBetween(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const key = [a, b].sort().join('|');
  return (S().cool.pairs[key] ?? 0) > 0;
}

export function reqOk(r: CardReq, ctx: ReqCtx): boolean {
  switch (r.kind) {
    case 'never': return false;
    case 'allies': {
      const h = ctx.castMap.hero, v = ctx.castMap.villain, a = ctx.castMap.ally;
      return !!h && (!!v || !!a);
    }
    case 'twins': return ctx.cast.includes('bo') && ctx.cast.includes('buck');
    case 'masked': return ctx.cast.some(isMasked);
    case 'mothman': return ctx.night;
    case 'night': return ctx.night;
    case 'saturday': return ctx.hasSaturday && ctx.payoffKind !== 'wednesday';
    case 'supershow': {
      if (ctx.payoffKind === 'supershow') return r.season === undefined || r.season === ctx.payoffSeason;
      if (ctx.payoffKind) return false;
      return ctx.superSeason !== null && ctx.superSeason !== undefined && (r.season === undefined || r.season === ctx.superSeason);
    }
    case 'vfw': return ctx.payoffKind === undefined || ctx.payoffKind === 'wednesday';
    case 'season': return r.seasons.includes(ctx.payoffSeason ?? cal.season(S().lastDay < 0 ? 0 : S().lastDay));
    case 'participants': return r.min <= 12;
    case 'hearts': return hearts(r.who) >= r.min;
    case 'flag': return !!G.flags[r.flag] || !!S().flags[r.flag];
    case 'rank': return RANKS.indexOf(G.player.rank) >= RANKS.indexOf(r.min);
    case 'history': return historyBetween(ctx.castMap.hero, ctx.castMap.villain);
    case 'archive': return S().archive.length > 0;
    case 'returning': return !!S().flags.returning;
    case 'title': return hasTitle(ctx);
  }
}

export function cardOk(c: CardDef, ctx: ReqCtx): boolean {
  return (c.requires ?? []).every((r) => reqOk(r, ctx));
}

// ------------------------------------------------------------------ red lines

export function redLineFor(charId: string, c: CardDef): RedLineDef | null {
  if (charId === PLAYER) return null;
  const p = persona(charId);
  for (const rl of p.redLines) {
    if (rl.unlessFlag && (G.flags[rl.unlessFlag] || S().flags[rl.unlessFlag])) continue;
    if (rl.cards?.includes(c.id)) return rl;
    if (rl.tags?.some((t) => c.tags.includes(t))) return rl;
  }
  // Engine-level guardrails that hold even if the data forgets them.
  if (charId === 'gideon' && (c.tags.includes('hair') || c.id === 'ST-05')) {
    return { id: 'gideon.hair', line: "No. Not 'no, darling.' Just no. I don't want the *concept* of clippers in the building.", cards: ['ST-05'] };
  }
  if (charId === 'mothman' && ['TW-04', 'ST-04', 'ST-05'].includes(c.id)) {
    return { id: 'mothman.mask', line: '*The Mothman tilts its head. The porch light clicks off. That is a no.*' };
  }
  if (charId === 'hazel' && c.tags.includes('injury_worked')) {
    return { id: 'hazel.knee', line: "My knee is part of the story. It's not the ending. No worked injuries." };
  }
  return null;
}

export function shapeRedLine(charId: string, shapeId: string, role?: string): RedLineDef | null {
  if (charId === PLAYER) return null;
  const p = persona(charId);
  for (const rl of p.redLines) {
    if (rl.unlessFlag && (G.flags[rl.unlessFlag] || S().flags[rl.unlessFlag])) continue;
    if (rl.shapes?.includes(shapeId)) return rl;
    if (role && rl.roles?.includes(role)) return rl;
  }
  return null;
}

export function hitsAnyRedLine(c: CardDef, cast: string[]): { who: string; rl: RedLineDef } | null {
  for (const id of cast) {
    const rl = redLineFor(id, c);
    if (rl) return { who: id, rl };
  }
  return null;
}

// ------------------------------------------------------------------ scoring

/** Has this character done this card or shape in the last 8 weeks? */
function boredom(charId: string, c: CardDef, shapeId?: string): number {
  const s = S();
  const now = s.lastDay;
  for (const a of s.archive.slice(-12)) {
    if (now - a.end > 56) continue;
    if (!Object.values(a.cast).includes(charId)) continue;
    const ids = [a.cards.hook, a.cards.twist, a.cards.stakes, a.cards.payoff];
    if (ids.includes(c.id) || (shapeId && a.shape === shapeId)) return 1;
  }
  return 0;
}

/** Raw score (§6.1) before friendship softening. */
export function rawScore(charId: string, c: CardDef, shapeId?: string): number {
  if (charId === PLAYER) return 1;
  const p = persona(charId);
  let s = 0;
  for (const t of p.traits) {
    const w = TRAITS[t]?.weights;
    if (!w) continue;
    for (const tag of c.tags) s += w[tag] ?? 0;
  }
  for (const l of p.loves) if (l === c.id || (c.tags as string[]).includes(l)) s += 2;
  s -= boredom(charId, c, shapeId);
  return Math.round(s);
}

export type Reaction = 'love' | 'fine' | 'counter' | 'soft_no' | 'red_line';

export interface Judgment {
  who: string;
  card: CardId;
  score: number;
  reaction: Reaction;
  redLine?: RedLineDef;
  spin?: SpinDef;
  /** The card they'd rather have. */
  counter?: CardId;
  /** Talk-through: can the player change their mind (deterministic)? */
  canTalk: boolean;
  persuasion: number;
  resistance: number;
}

export function storytellingLevel(): number {
  const xp = G.player.skills.story ?? 0;
  const table = [0, 100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000];
  let lvl = 0;
  for (let i = 1; i < table.length; i++) if (xp >= table[i]) lvl = i;
  return Math.max(1, Math.min(10, lvl + 1));
}

export function judge(charId: string, c: CardDef, ctx: { shapeId?: string; cast: string[]; reqCtx?: ReqCtx }): Judgment {
  const rl = redLineFor(charId, c);
  const spin = persona(charId).spins.find((sp) => sp.replaces === c.id && !!CARD[sp.with]);
  const base: Judgment = { who: charId, card: c.id, score: 0, reaction: 'fine', canTalk: false, persuasion: 0, resistance: 0 };
  if (rl) {
    return { ...base, score: -99, reaction: 'red_line', redLine: rl, spin, counter: spin?.with ?? bestCardFor(charId, c.slot, ctx)?.id };
  }
  let score = rawScore(charId, c, ctx.shapeId);
  if (score < 0) score = Math.min(0, score + Math.min(2, Math.floor(hearts(charId) / 3)));
  let reaction: Reaction = score >= 3 ? 'love' : score >= 0 ? 'fine' : score >= -3 ? 'counter' : 'soft_no';
  const persuasion = storytellingLevel() + Math.floor(hearts(charId) / 2);
  const resistance = reaction === 'counter' || reaction === 'soft_no' ? Math.abs(score) + 1 + (reaction === 'soft_no' ? 2 : 0) : 0;
  // 9 hearts: "just surprise me" — only gentle pushback.
  if (hearts(charId) >= 9 && reaction === 'soft_no') reaction = 'counter';
  const counter = reaction === 'counter' || reaction === 'soft_no' ? spin?.with ?? bestCardFor(charId, c.slot, ctx, c.id)?.id : undefined;
  return { ...base, score, reaction, spin: reaction === 'counter' || reaction === 'soft_no' ? spin : undefined, counter, canTalk: persuasion >= resistance, persuasion, resistance };
}

/** The best card for a slot in this character's eyes, avoiding everyone's red lines. */
export function bestCardFor(charId: string, slot: Slot, ctx: { shapeId?: string; cast: string[]; reqCtx?: ReqCtx }, exclude?: string): CardDef | undefined {
  const sh = ctx.shapeId ? SHAPE[ctx.shapeId] : undefined;
  let best: CardDef | undefined;
  let bestScore = -Infinity;
  for (const c of cardsFor(slot)) {
    if (c.id === exclude) continue;
    if ((c.requires ?? []).some((r) => r.kind === 'never')) continue;
    if (ctx.reqCtx && !cardOk(c, ctx.reqCtx)) continue;
    if (hitsAnyRedLine(c, ctx.cast)) continue;
    let sc = rawScore(charId, c, ctx.shapeId);
    if (sh && (sh.cards[slot as 'hook' | 'twist' | 'stakes' | 'payoff'] ?? []).includes(c.id)) sc += 3;
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  return best;
}

export function barksFor(charId: string): Barks {
  const p = persona(charId);
  const merged: Barks = { love: [], fine: [], counter: [], softNo: [] };
  for (const k of ['love', 'fine', 'counter', 'softNo'] as const) {
    merged[k] = [...(p.barks[k] ?? [])];
    if (merged[k].length < 2) for (const t of p.traits) merged[k].push(...(TRAITS[t]?.barks[k] ?? []));
    if (!merged[k].length) merged[k] = k === 'love' ? ['Oh, I love that.'] : k === 'fine' ? ['Sure. That works.'] : k === 'counter' ? ['Hmm. How about this instead?'] : ["I don't know about that one..."];
  }
  return merged;
}

/** Fit of a card to a shape and cast (for buzz and forecasts). */
export function fitOf(st: Pick<Storyline, 'shape' | 'cast' | 'cards'>): { fit: number; loves: number; fatigue: number } {
  const sh = shape(st.shape);
  const cast = Object.values(st.cast).filter((c) => c !== PLAYER);
  let fit = 0;
  let loves = 0;
  let fatigue = 0;
  const s = S();
  const now = s.lastDay;
  const ids: [Slot, string | undefined][] = [['hook', st.cards.hook], ['twist', st.cards.twist], ['stakes', st.cards.stakes], ['payoff', st.cards.payoff]];
  for (const [slot, id] of ids) {
    if (!id) continue;
    const c = CARD[id];
    if (!c) continue;
    if ((sh.cards[slot as 'hook'] ?? []).includes(id)) fit++;
    for (const who of cast) if (rawScore(who, c, st.shape) >= 3) loves++;
    const last = s.cool.cards[id];
    if (last !== undefined && now - last < 56) fatigue++;
  }
  const lastShape = s.cool.shapes[st.shape];
  if (lastShape !== undefined && now - lastShape < 56) fatigue += 2;
  return { fit, loves, fatigue };
}
