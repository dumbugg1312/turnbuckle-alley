/**
 * Pitches (§2): who brings the player a story, the napkin logic for each
 * involvement mode, personality reactions, the forecast and Birdie's verdict.
 * The UI lives in ../ui/napkin.ts; this file is pure logic.
 */
import { G, RANKS, type Rank } from '../../core/state';
import type { Rng } from '../../core/rng';
import { BIRDIE } from '../data/birdie';
import { WRESTLERS } from '../data/roster';
import { SIGNATURES } from '../data/signatures';
import { T } from '../tuning';
import type { BirdieReason, CardDef, CardId, ShapeDef, Slot } from '../types';
import { PLAYER, alignOf, canWrestle, charState, hearts, storyLoad } from './cast';
import {
  CARD, SHAPES, bestCardFor, cardOk, cardsFor, fitOf, hitsAnyRedLine, judge, persona, rawScore, shape as shapeOf, storytellingLevel, type Judgment,
} from './content';
import { buildStoryline, castShape, chooseCards, playerAlly, windowCtx } from './generate';
import { S, cal, clamp, newId, notice, rngFor, today, type NapkinCards, type PitchState, type Storyline } from './state';
import { render } from './text';
import { addToTin, markPlayed, owns, tin } from './tin';

export type Mode = 'drive' | 'together' | 'idea';
export const SLOTS: ('hook' | 'twist' | 'stakes' | 'payoff')[] = ['hook', 'twist', 'stakes', 'payoff'];

export function rankAtLeast(r: Rank): boolean {
  return RANKS.indexOf(G.player.rank) >= RANKS.indexOf(r);
}

export function playerStoryCount(): number {
  return S().stories.filter((st) => !st.done && st.playerIn).length;
}

export function canTakeStory(): boolean {
  return playerStoryCount() < T.playerStories[G.player.rank];
}

// ------------------------------------------------------------------ making pitches

function shapesFor(pitcher: string, scope: PitchState['scope']): ShapeDef[] {
  const liked = persona(pitcher).shapes;
  return SHAPES.filter((s) => {
    if ((s.needs ?? []).some((n) => n === 'retiring' || n === 'romance')) return false;
    if (scope === 'for_you') return s.playerRoles.length > 0;
    return s.background;
  }).sort((a, b) => Number(liked.includes(b.id)) - Number(liked.includes(a.id)));
}

export function makePitch(pitcher: string, trigger: PitchState['trigger'], scope: PitchState['scope'], day: number, rng: Rng, prefer?: string[]): PitchState | null {
  const shapes = shapesFor(pitcher, scope);
  const liked = new Set([...(prefer ?? []), ...persona(pitcher).shapes]);
  for (let attempt = 0; attempt < 10; attempt++) {
    const pool = prefer && attempt < 3 ? shapes.filter((s) => prefer.includes(s.id)) : shapes;
    if (!pool.length) continue;
    const sh = rng.weighted(pool, (s) => {
      let w = liked.has(s.id) ? 4 : 1;
      const last = S().cool.shapes[s.id];
      if (last !== undefined && day - last < T.cooldownDays) w *= 0.3;
      return w;
    });
    let playerRole: string | null = null;
    if (scope === 'for_you') {
      const pa = alignOf(PLAYER);
      const roles = sh.playerRoles;
      playerRole = roles.includes(pa === 'villain' ? 'villain' : 'hero') ? (pa === 'villain' ? 'villain' : 'hero') : roles[0] ?? null;
      if (!playerRole) continue;
    }
    const cast = castShape(sh, { day, rng, playerRole, pitcher: (WRESTLERS as readonly string[]).includes(pitcher) ? pitcher : undefined, allowBusy: [pitcher] });
    if (!cast) continue;
    if (scope === 'consult' && Object.values(cast).includes(PLAYER)) continue;
    const ctx = { cast: { ...cast, hero: cast.hero, villain: cast.villain }, rng };
    const wants = persona(pitcher).wants.length && rng.chance(0.6) ? persona(pitcher).wants : sh.wants;
    const want = render(rng.pick(wants.length ? wants : ['I\'ve got a story. Hear me out.']), ctx);
    return {
      id: newId('p'), pitcher, co: [], trigger, scope, shape: sh.id, cast, want, created: day, nudges: 0, status: 'waiting',
    };
  }
  return null;
}

function waiting(): PitchState[] {
  return S().pitches.filter((p) => p.status === 'waiting');
}

function hasPitchFrom(id: string): boolean {
  return S().pitches.some((p) => p.pitcher === id);
}

function offerPitch(p: PitchState | null): boolean {
  if (!p) return false;
  const s = S();
  if (waiting().length >= T.maxWaitingPitches && p.trigger !== 'first' && p.trigger !== 'signature' && p.trigger !== 'life') return false;
  s.pitches.push(p);
  if (s.settings.birdieHandles) autoResolve(p);
  return true;
}

/** After a show: 1 to 3 insiders in the booth have ideas (paced). */
export function queuePostShowPitches(day: number): void {
  const s = S();
  const rng = rngFor('booth', day);
  // The very first pitch: Dex (or Earl) after the debut show.
  if (!s.flags.firstPitch) {
    s.flags.firstPitch = day;
    for (const who of ['dex', 'earl', 'tiny']) {
      if (!canWrestle(who, day + 3) && who !== 'earl') continue;
      const p = makePitch(who, 'first', 'for_you', day, rng, ['rookie_first_win', 'odd_couple', 'mentor_student', 'underdog_title']);
      if (p) {
        p.want = who === 'dex'
          ? "You took the Mountain's best and got back up. Folks LOVED that. I've got a story where getting back up is the whole point."
          : p.want;
        offerPitch(p);
        return;
      }
    }
    return;
  }
  if (waiting().length >= T.maxWaitingPitches) return;
  const chance = T.pace[s.settings.pace];
  if (!rng.chance(chance)) return;
  const count = rng.chance(0.3) ? 2 : 1;
  const cands = [...WRESTLERS, 'gus', 'mo', 'june'].filter((w) => w !== 'mothman' && !hasPitchFrom(w) && persona(w).canPitch);
  for (let i = 0; i < count && cands.length; i++) {
    const who = rng.weighted(cands, (w) => 1 + hearts(w) * 0.5 + (storyLoad(w).any === 0 ? 2 : 0) + persona(w).spotlight / 50);
    cands.splice(cands.indexOf(who), 1);
    const forYou = canTakeStory() && rng.chance(0.62) && (WRESTLERS as readonly string[]).includes(who);
    offerPitch(makePitch(who, 'booth', forYou ? 'for_you' : 'consult', day, rng));
  }
}

/** Daily triggers: idle wrestlers, Birdie's assignments, friendship milestones, life events, Not-yet napkins coming back. */
export function dailyPitchTriggers(day: number): void {
  const s = S();
  const rng = rngFor('pitchday', day);
  if (!G.flags['met_birdie']) return;
  // Not yet -> back on the table.
  for (const p of s.pitches) {
    if (p.status !== 'not_yet') continue;
    if ((p.notYetUntil === undefined || day >= p.notYetUntil) && (!p.notYetRank || rankAtLeast(p.notYetRank))) {
      p.status = 'waiting';
      p.trigger = 'not_yet';
      p.nudges = 0;
      p.nudgedOn = undefined;
    }
  }
  // Hazel is cleared: her comeback becomes a pitch (real life bleeds in).
  if (s.flags.hazelCleared && !s.flags.hazelPitch) {
    s.flags.hazelPitch = day;
    const p = makePitch('hazel', 'life', canTakeStory() ? 'for_you' : 'consult', day, rng, ['comeback', 'mentor_student', 'grudge_match']);
    if (p) {
      p.want = "Doc cleared me. Seven hundred and some days, and he signed the form. I don't want to come back as the old Hurricane. Help me build the new one?";
      offerPitch(p);
    }
  }
  // Signature storylines: offered at a friendship milestone, gold napkin, slots inked in pen.
  for (const sig of SIGNATURES) {
    if (hearts(sig.of) < sig.hearts || s.flags[`sig_${sig.id}`] || hasPitchFrom(sig.of) || !canTakeStory()) continue;
    if (!SHAPES.some((x) => x.id === sig.shape)) continue;
    const sh = shapeOf(sig.shape);
    const fixed: Record<string, string> = {};
    let playerRole: string | null = null;
    for (const [role, who] of Object.entries(sig.cast)) {
      if (who === PLAYER) playerRole = role;
      else fixed[role] = who;
    }
    const cast = castShape(sh, { day, rng, fixed, playerRole, pitcher: sig.of, allowBusy: Object.values(fixed) });
    if (!cast) continue;
    s.flags[`sig_${sig.id}`] = day;
    offerPitch({
      id: newId('p'), pitcher: sig.of, co: [], trigger: 'signature', scope: 'signature', shape: sh.id, cast, want: sig.want, created: day,
      nudges: 0, status: 'waiting', signature: sig.id, locked: { ...sig.locked }, weeks: sig.weeks,
    });
    break;
  }
  // Friendship milestones: 5 hearts shares a card.
  for (const w of [...WRESTLERS, 'birdie', 'june', 'mo', 'gus', 'hank', 'marigold', 'doc']) {
    if (hearts(w) >= 5 && !s.flags[`gift5_${w}`]) {
      s.flags[`gift5_${w}`] = day;
      const p = persona(w);
      const loved = p.loves.find((l) => CARD[l] && !owns(l)) ?? cardsFor('twist').find((c) => !owns(c.id) && rawScore(w, c) >= 2)?.id;
      if (loved) s.scenes.push({ id: newId('sc'), kind: 'gift_card', who: w, day, card: loved });
    }
  }
  // An idle wrestler gets restless.
  if (rng.chance(0.25) && waiting().length < 2) {
    const idle = WRESTLERS.filter((w) => w !== 'mothman' && w !== 'lou' && !hasPitchFrom(w) && storyLoad(w).any === 0 && day - (charState(w).lastStory ?? -99) >= T.idleDays && canWrestle(w, day + 3));
    if (idle.length) offerPitch(makePitch(rng.pick(idle), 'idle', canTakeStory() && rng.chance(0.7) ? 'for_you' : 'consult', day, rng));
  }
  // Birdie's assignments early on, if the player has no story.
  if (!rankAtLeast('midcard') && playerStoryCount() === 0 && !hasPitchFrom('birdie') && day - Number(s.flags.lastBirdieAssign ?? -99) >= 9 && day >= 6) {
    s.flags.lastBirdieAssign = day;
    const p = makePitch('birdie', 'birdie', 'for_you', day, rng, ['rookie_first_win', 'odd_couple', 'underdog_title', 'grudge_match', 'mentor_student']);
    if (p) {
      p.want = "I need something for the opener, sugar. Make it sing.";
      offerPitch(p);
    }
  }
}

// ------------------------------------------------------------------ the napkin (draft)

export interface Draft {
  pitch: PitchState;
  shape: string;
  cast: Record<string, string>;
  cards: Partial<NapkinCards> & { segments: CardId[] };
  weeks: number;
  spins: Storyline['spins'];
  judgments: Judgment[];
  mode: Mode;
  secretTwist: boolean;
  nudgeUsed: boolean;
  redraws: number;
  vetoes: { player: boolean; pitcher: boolean };
  talkedThrough: string[];
  /** Cards the pitcher brought (the player copies them into the Tin when signed). */
  fromPitcher: CardId[];
}

export function newDraft(p: PitchState, mode: Mode): Draft {
  const sh = shapeOf(p.shape);
  return {
    pitch: p,
    shape: p.shape,
    cast: { ...(p.draft?.cast ?? p.cast) },
    cards: { segments: [], ...(p.draft?.cards ?? {}), ...(p.locked ?? {}) },
    weeks: p.draft?.weeks ?? p.weeks ?? sh.length[1],
    spins: [],
    judgments: [],
    mode,
    secretTwist: S().settings.twistSecret,
    nudgeUsed: false,
    redraws: 0,
    vetoes: { player: false, pitcher: false },
    talkedThrough: [],
    fromPitcher: [],
  };
}

export function draftNPCs(d: Draft): string[] {
  return [...new Set([d.pitch.pitcher, ...Object.values(d.cast)])].filter((x) => x !== PLAYER && x !== 'birdie' && persona(x).id !== 'nobody');
}

export function draftReqCtx(d: Draft) {
  return windowCtx(shapeOf(d.shape), d.cast, today() + 1, d.weeks);
}

function legal(c: CardDef, d: Draft): boolean {
  if ((c.requires ?? []).some((r) => r.kind === 'never')) return false;
  if (!cardOk(c, draftReqCtx(d))) return false;
  if (c.stakes && ['mask', 'hair', 'career', 'building'].includes(c.stakes.outcome)) return false;
  if (c.stakes?.outcome === 'leave_town' && Object.values(d.cast).includes(PLAYER)) return false;
  return true;
}

/** "You drive": the pitcher fills every slot from their own preferences (score >= 0, nobody's red lines). */
export function pitcherFill(d: Draft, rng: Rng): void {
  const sh = shapeOf(d.shape);
  const cards = chooseCards(sh, d.cast, { rng, day: today() + 1, weeks: d.weeks, pitcher: d.pitch.pitcher, locked: d.cards, twistChance: 0.7 });
  if (!cards) return;
  for (const slot of SLOTS) if (!d.cards[slot] && cards[slot]) {
    d.cards[slot] = cards[slot];
    if (!owns(cards[slot]!)) d.fromPitcher.push(cards[slot]!);
  }
  if (!d.cards.segments.length) d.cards.segments = cards.segments;
  d.judgments = [];
  for (const slot of SLOTS) {
    const id = d.cards[slot];
    if (id) d.judgments.push(...reactAll(d, CARD[id]).filter((j) => j.who !== d.pitch.pitcher || j.reaction === 'love'));
  }
}

/** "Let's build it together": 2-3 offers per slot (1-2 from the pitcher, 1 from the Tin), never anyone's red line. */
export function offersFor(d: Draft, slot: Slot, rng: Rng): CardDef[] {
  const npcs = draftNPCs(d);
  const all = cardsFor(slot).filter((c) => legal(c, d) && !hitsAnyRedLine(c, npcs) && !Object.values(d.cards).includes(c.id as never));
  if (!all.length) return [];
  const sh = shapeOf(d.shape);
  const fit = (sh.cards[slot as 'hook'] ?? []) as string[];
  const scored = all.map((c) => ({ c, s: npcs.reduce((a, n) => a + rawScore(n, c, d.shape), 0) + (fit.includes(c.id) ? 3 : 0) + rawScore(d.pitch.pitcher, c, d.shape) + rng.next() * 3 }));
  scored.sort((a, b) => b.s - a.s);
  const out: CardDef[] = [];
  const top = scored.slice(0, 6 + d.redraws * 3);
  const fromPitcher = top.slice(d.redraws * 2).filter((x) => !owns(x.c.id) || rng.chance(0.4));
  for (const x of fromPitcher.slice(0, rng.chance(0.5) ? 2 : 1)) out.push(x.c);
  const tinCards = tin().map((o) => CARD[o.id]).filter((c): c is CardDef => !!c && c.slot === slot && all.includes(c) && !out.includes(c));
  if (tinCards.length) out.push(rng.weighted(tinCards, (c) => 1 + (fit.includes(c.id) ? 3 : 0)));
  for (const x of scored) if (out.length < 2 && !out.includes(x.c)) out.push(x.c);
  return out.slice(0, 3);
}

/** "I've got an idea": everything in the Tin for that slot (red lines included; known ones are flagged). */
export function tinFor(d: Draft, slot: Slot): { card: CardDef; legal: boolean; knownRedLine: boolean; stars: number }[] {
  const learned = new Set(draftNPCs(d).flatMap((n) => charState(n).learnedRedLines));
  return tin()
    .map((o) => ({ o, c: CARD[o.id] }))
    .filter((x) => x.c && x.c.slot === slot)
    .map(({ o, c }) => {
      const hit = hitsAnyRedLine(c, draftNPCs(d));
      return { card: c, legal: legal(c, d), knownRedLine: !!hit && learned.has(hit.rl.id), stars: o.stars };
    })
    .sort((a, b) => Number(b.legal) - Number(a.legal) || a.card.name.localeCompare(b.card.name));
}

/** Everyone on the napkin reacts to a card. */
export function reactAll(d: Draft, c: CardDef): Judgment[] {
  const npcs = draftNPCs(d);
  return npcs.map((n) => judge(n, c, { shapeId: d.shape, cast: npcs, reqCtx: draftReqCtx(d) }));
}

/** The strongest reaction among the cast (red line > soft no > counter > love > fine). */
export function headline(js: Judgment[]): Judgment | undefined {
  const order = { red_line: 0, soft_no: 1, counter: 2, love: 3, fine: 4 } as const;
  return [...js].sort((a, b) => order[a.reaction] - order[b.reaction])[0];
}

export function learnRedLine(j: Judgment): void {
  if (j.reaction !== 'red_line' || !j.redLine) return;
  const c = charState(j.who);
  if (!c.learnedRedLines.includes(j.redLine.id)) c.learnedRedLines.push(j.redLine.id);
}

export function place(d: Draft, slot: Slot, id: CardId | undefined, opts: { fromPitcher?: boolean } = {}): void {
  if (slot === 'segment') {
    if (id && !d.cards.segments.includes(id)) d.cards.segments.push(id);
    return;
  }
  if (slot === 'wildcard') return;
  d.cards[slot] = id;
  if (id && opts.fromPitcher && !owns(id)) d.fromPitcher.push(id);
}

export function spinTo(d: Draft, j: Judgment, slot: Slot): void {
  if (!j.counter) return;
  if (j.spin) d.spins.push({ who: j.who, from: j.card, to: j.counter });
  place(d, slot, j.counter, { fromPitcher: true });
}

// ------------------------------------------------------------------ forecast (§2.5 step 6)

export interface Forecast {
  rings: number;
  feeling: string;
  tip?: string;
  fatigue: boolean;
}

export function forecast(d: Draft): Forecast {
  const cards = { hook: d.cards.hook ?? '', twist: d.cards.twist, stakes: d.cards.stakes ?? '', payoff: d.cards.payoff ?? '', segments: d.cards.segments };
  const f = fitOf({ shape: d.shape, cast: d.cast, cards });
  const loves = d.judgments.filter((j) => j.reaction === 'love').length;
  const winces = d.judgments.filter((j) => j.reaction === 'counter' || j.reaction === 'soft_no').length;
  const npcs = draftNPCs(d);
  const villainLovable = d.cast.villain && d.cast.villain !== PLAYER ? persona(d.cast.villain).lovable : 0;
  let score = 2.2 + f.fit * 0.35 + Math.min(3, loves) * 0.35 - winces * 0.3 - f.fatigue * 0.35 + (d.cards.twist ? 0.3 : 0);
  const aligns = [d.cast.hero, d.cast.villain].map((x) => (x ? alignOf(x) : 'hero'));
  if (aligns[0] === aligns[1] && aligns[0] !== 'tweener') score -= 0.3;
  if (d.weeks > shapeOf(d.shape).length[2]) score -= 0.4;
  const rings = clamp(Math.round(score), 1, 5);
  const lvl = storytellingLevel();
  const feeling = rings >= 4 ? 'Folks are going to talk about this one.' : rings === 3 ? 'The crowd will like this.' : rings === 2 ? 'Folks might like this.' : 'Hmm. Could be a quiet one.';
  let tip: string | undefined;
  if (lvl >= 2) {
    if (f.fatigue >= 2) tip = 'The crowd has seen some of this lately. Freshen a card.';
    else if (!d.cards.twist && rings < 4) tip = 'A twist could give the middle some kick.';
    else if (aligns[0] === aligns[1]) tip = 'Two of a kind. Somebody has to bring the fire.';
    else if (villainLovable >= 2) tip = `${npcs.includes(d.cast.villain) ? 'The villain' : 'Somebody'} might get cheered.`;
    else if (winces) tip = 'Somebody at the table is wincing. Listen to them.';
    else tip = 'Good bones. Let it breathe.';
  }
  return { rings, feeling, tip, fatigue: f.fatigue >= 2 };
}

// ------------------------------------------------------------------ Birdie's verdict (§7)

export interface Verdict {
  verdict: 'approve' | 'tweak' | 'veto' | 'not_yet';
  reasons: BirdieReason[];
  line: string;
  tweaks: { kind: 'weeks' | 'swap' | 'twist' | 'stakes'; slot?: Slot; to?: CardId; weeks?: number; label: string }[];
}

function maxWeeksFor(_rank: Rank): number {
  return rankAtLeast('main') ? 12 : rankAtLeast('midcard') ? 8 : rankAtLeast('undercard') ? 6 : 5;
}

export function birdieReview(d: Draft, rng: Rng): Verdict {
  const reasons: BirdieReason[] = [];
  const tweaks: Verdict['tweaks'] = [];
  const fc = forecast(d);
  if (rankAtLeast('pencil')) return { verdict: 'approve', reasons, line: "It's your pencil, sugar. Well. It's your pencil.", tweaks };
  if (fc.rings <= 1) {
    reasons.push('draw');
    if (!d.cards.twist) {
      const tw = bestCardFor(d.pitch.pitcher, 'twist', { shapeId: d.shape, cast: draftNPCs(d), reqCtx: draftReqCtx(d) });
      if (tw) tweaks.push({ kind: 'twist', slot: 'twist', to: tw.id, label: `Add a twist: ${tw.name}` });
    }
  }
  if (fc.fatigue) {
    reasons.push('fatigue');
    const s = S();
    for (const slot of SLOTS) {
      const id = d.cards[slot];
      if (!id || d.pitch.locked?.[slot]) continue;
      const last = s.cool.cards[id];
      if (last !== undefined && today() - last < T.cooldownDays) {
        const fresh = bestCardFor(d.pitch.pitcher, slot, { shapeId: d.shape, cast: draftNPCs(d), reqCtx: draftReqCtx(d) }, id);
        if (fresh && fresh.id !== id) {
          tweaks.push({ kind: 'swap', slot, to: fresh.id, label: `Swap ${CARD[id]?.name} for ${fresh.name}` });
          break;
        }
      }
    }
  }
  const busy = Object.values(d.cast).filter((x) => x !== PLAYER && storyLoad(x).any >= 2);
  if (busy.length) reasons.push('roster_wellbeing');
  if (d.weeks > maxWeeksFor(G.player.rank)) {
    reasons.push('rank');
    tweaks.push({ kind: 'weeks', weeks: maxWeeksFor(G.player.rank), label: `Cut it to ${maxWeeksFor(G.player.rank)} weeks` });
  }
  const playerIn = Object.values(d.cast).includes(PLAYER);
  if (playerIn && !d.pitch.locked?.stakes && CARD[d.cards.stakes ?? '']?.stakes?.outcome === 'title' && !rankAtLeast('undercard')) {
    reasons.push('rank');
    tweaks.push({ kind: 'stakes', slot: 'stakes', to: 'ST-02', label: 'Bragging rights, not the belt (yet)' });
  }
  const payoff = CARD[d.cards.payoff ?? ''];
  if (payoff?.payoff && !d.pitch.locked?.payoff && ['cage', 'ladder'].includes(payoff.payoff.stip) && !rankAtLeast('undercard') && playerIn) {
    reasons.push('venue');
    tweaks.push({ kind: 'swap', slot: 'payoff', to: 'PO-03', label: 'Two Out of Three Falls instead (Hank needs time)' });
  }
  const uniq = [...new Set(reasons)];
  const pickLine = (pool: string[] | undefined, fallback: string) => render(rng.pick(pool?.length ? pool : [fallback]), { cast: {}, rng });
  if (!uniq.length) return { verdict: 'approve', reasons: uniq, line: pickLine(BIRDIE.approve, "Sugar, that's the dumbest thing I ever heard. Do it."), tweaks };
  if (uniq.length >= 3) {
    return { verdict: 'veto', reasons: uniq, line: pickLine(BIRDIE.veto[uniq[0]], "Not this one, sugar. Keep it in your tin."), tweaks: [] };
  }
  if (uniq.length === 1 && uniq[0] === 'rank' && !tweaks.length) {
    return { verdict: 'not_yet', reasons: uniq, line: pickLine(BIRDIE.notYet, 'Not yet. Put it in your tin. It\'ll keep.'), tweaks };
  }
  if (!tweaks.length && uniq.includes('roster_wellbeing')) {
    return { verdict: 'tweak', reasons: uniq, line: pickLine(BIRDIE.tweak.roster_wellbeing, 'Spread the butter, sugar.'), tweaks: [{ kind: 'weeks', weeks: Math.max(2, d.weeks - 1), label: `Keep it tight: ${Math.max(2, d.weeks - 1)} weeks` }] };
  }
  return { verdict: 'tweak', reasons: uniq, line: pickLine(BIRDIE.tweak[uniq[0]], 'Love it. Cut it to four weeks. Folks got jobs.'), tweaks };
}

export type Plea = 'crowd' | 'heart' | 'roster' | 'history';
const PLEA_FOR: Partial<Record<BirdieReason, Plea>> = { draw: 'crowd', fatigue: 'history', card_fit: 'roster', roster_wellbeing: 'heart', venue: 'roster' };

export function plead(v: Verdict, arg: Plea, rng: Rng): { won: boolean; line: string } {
  const won = v.reasons.some((r) => PLEA_FOR[r] === arg);
  const pool = won ? BIRDIE.pleaWin : BIRDIE.pleaLose;
  S().career.ledger += won ? 2 : 0;
  return { won, line: render(rng.pick(pool.length ? pool : [won ? "Well, now. You've been listening." : "Heart's fine, sugar. It's the calendar I'm worried about."]), { cast: {}, rng }) };
}

export function applyTweaks(d: Draft, v: Verdict): void {
  for (const t of v.tweaks) {
    if (t.kind === 'weeks' && t.weeks) d.weeks = t.weeks;
    if ((t.kind === 'swap' || t.kind === 'twist' || t.kind === 'stakes') && t.slot && t.to && !d.pitch.locked?.[t.slot as 'hook']) place(d, t.slot, t.to);
  }
}

// ------------------------------------------------------------------ signing

/** Shake on it: the napkin becomes a storyline on the calendar. */
export function signDraft(d: Draft, rng: Rng): Storyline | null {
  const sh = shapeOf(d.shape);
  if (!d.cards.hook || !d.cards.stakes || !d.cards.payoff) {
    const filled = chooseCards(sh, d.cast, { rng, day: today() + 1, weeks: d.weeks, pitcher: d.pitch.pitcher, locked: d.cards });
    if (!filled) return null;
    d.cards.hook ??= filled.hook;
    d.cards.stakes ??= filled.stakes;
    d.cards.payoff ??= filled.payoff;
  }
  const loves = d.judgments.filter((j) => j.reaction === 'love').length;
  const stars = [d.cards.hook, d.cards.twist, d.cards.stakes, d.cards.payoff].reduce((a, id) => a + (S().tin.find((o) => o.id === id)?.stars ?? 0), 0);
  const scope = d.pitch.scope === 'consult' ? 'consult' : d.pitch.scope === 'board' ? 'board' : d.pitch.scope === 'signature' ? 'signature' : 'for_you';
  const st = buildStoryline({
    scope,
    shapeId: d.shape,
    cast: d.cast,
    cards: { hook: d.cards.hook!, twist: d.cards.twist, stakes: d.cards.stakes!, payoff: d.cards.payoff!, segments: d.cards.segments },
    weeks: d.weeks,
    start: today() + 1,
    rng,
    pitcher: d.pitch.pitcher,
    spins: d.spins,
    signatures: draftNPCs(d).concat(PLAYER),
    secretTwist: d.mode === 'drive' && d.secretTwist,
    buzzBonus: Math.min(2, loves) * 2 + stars * 3,
    signature: d.pitch.signature,
    wildcards: tin().filter((o) => CARD[o.id]?.slot === 'wildcard').map((o) => o.id),
  });
  S().stories.push(st);
  S().pitches = S().pitches.filter((p) => p.id !== d.pitch.id);
  for (const id of d.fromPitcher) addToTin(id, 'insider_story', true);
  markPlayed([d.cards.hook, d.cards.twist, d.cards.stakes, d.cards.payoff, ...d.cards.segments]);
  st.decisions.push({ day: today(), what: 'mode', choice: d.mode });
  // Rewards (§2.6): You drive = friendship, together = balance, my idea = Storytelling + Ledger.
  const xp = d.mode === 'idea' ? 70 : d.mode === 'together' ? 45 : 20;
  G.player.skills.story = (G.player.skills.story ?? 0) + xp;
  S().career.ledger += d.mode === 'idea' ? 2 : d.mode === 'together' ? 1 : 0;
  notice(`New storyline: "${st.title}"`);
  return st;
}

export function shelvePitch(d: Draft, until: { day?: number; rank?: Rank }): void {
  const p = d.pitch;
  p.status = 'not_yet';
  p.notYetUntil = until.day;
  p.notYetRank = until.rank;
  p.draft = { cards: { ...d.cards }, weeks: d.weeks, cast: { ...d.cast } };
}

/** "Let Birdie handle it": built by the pitcher, approved by Birdie, no UI. */
export function autoResolve(p: PitchState): Storyline | null {
  const rng = rngFor(`auto${p.id}`);
  const d = newDraft(p, 'drive');
  pitcherFill(d, rng);
  const v = birdieReview(d, rng);
  if (v.verdict === 'veto' || v.verdict === 'not_yet') {
    S().pitches = S().pitches.filter((x) => x.id !== p.id);
    return null;
  }
  if (v.verdict === 'tweak') applyTweaks(d, v);
  return signDraft(d, rng);
}

/** The player brings their own idea to someone (from the corkboard). */
export function playerPitch(target: string): PitchState | null {
  const rng = rngFor(`mine${target}${S().nextId}`);
  const p = makePitch(target, 'player', canTakeStory() ? 'for_you' : 'consult', today(), rng);
  if (p) p.want = "You've got that look. Go on. What've you got?";
  return p;
}

/** A booker's story (assistant and up): any two NPCs, the player fills the napkin. */
export function boardPitch(hero: string, villain: string, shapeId: string): PitchState | null {
  const sh = shapeOf(shapeId);
  const rng = rngFor(`board${hero}${villain}${S().nextId}`);
  const cast = castShape(sh, { day: today(), rng, fixed: { hero, villain }, allowBusy: [hero, villain], noPlayer: true });
  if (!cast) return null;
  return { id: newId('p'), pitcher: 'birdie', co: [], trigger: 'board', scope: 'board', shape: sh.id, cast, want: '', created: today(), nudges: 0, status: 'waiting' };
}

export { playerAlly, cal };
