/**
 * Booking show cards (§13.2) and resolving what happened on them.
 */
import { G } from '../../core/state';
import { Rng } from '../../core/rng';
import type { MatchResult } from '../../match/types';
import type { MatchSpec, Segment, ShowCard, Venue } from '../api';
import { MATCH_TEXT } from '../data/matchtext';
import { BIRDIE } from '../data/birdie';
import { WRESTLERS } from '../data/roster';
import { T } from '../tuning';
import type { Stip, TitleId } from '../types';
import {
  NameOf, PLAYER, SideName, alignOf, canWrestle, charState, isAround, levelOf, nameOf, nudgeSentiment, realOf, roleOf, sideName, styleOf,
} from './cast';
import { CARD, shape as shapeOf } from './content';
import { isShowBeat, payoffReq, slideStory } from './generate';
import { changeTitle, resolveBeat, simulateStars, storyCtx, storyRng, titleInStory } from './run';
import { S, cal, clamp, rngFor, today, type BeatState, type PlannedCard, type SegRecord, type ShowRecord, type Storyline } from './state';
import { cap, render, renderOne, renderPre, type RenderCtx } from './text';
import { applyPlayerMatch } from '../career';
import { queuePostShowPitches } from './pitch';

type Kind = 'wednesday' | 'saturday' | 'supershow';

interface Draft {
  rec: SegRecord;
  pos: number;
  /** Non-match segments shouldn't open or close a show. */
  quiet: boolean;
}

/** The player is on the roster once Birdie has hired them and they have a persona. */
export function playerHired(): boolean {
  return !!G.flags['met_birdie'] && !!G.player.persona;
}

export function showName(venue: Venue, supershow: string | null): string {
  return supershow ?? (venue === 'vfw' ? 'Wednesday Night Wrestling' : 'Saturday Night at the Sportatorium');
}

export function toCard(rec: ShowRecord): ShowCard {
  return { venue: rec.venue, name: rec.name, segments: rec.segs.map((r) => r.seg) };
}

function idsOf(st: Storyline, beat: BeatState, roles: string[]): string[] {
  return roles.map((r) => (r.startsWith('@') ? beat.outsiders?.[r] : st.cast[r])).filter((x): x is string => !!x);
}

function beatParticipants(st: Storyline, beat: BeatState): { sides: string[][]; others: string[] } {
  if (beat.sides) return { sides: beat.sides.map((s) => idsOf(st, beat, s)), others: [] };
  return { sides: [], others: idsOf(st, beat, beat.roles ?? ['hero', 'villain']) };
}

function beatPriority(st: Storyline, b: BeatState): number {
  let p = { payoff: 100, twist: 62, stakes: 58, hook: 55, gohome: 52 }[b.purpose as 'payoff'] ?? 40;
  if (st.signature) p += 20;
  if (st.playerIn) p += 25;
  p += st.buzz / 12;
  return p;
}

/** First pending show beat of a story that is due on or before `day`. */
function dueBeat(st: Storyline, day: number): BeatState | undefined {
  const b = st.beats.find((x) => x.status === 'pending' && isShowBeat(x));
  return b && b.day <= day ? b : undefined;
}

// ------------------------------------------------------------------ text helpers

function finishSentence(winnerIds: string[], loserIds: string[], cheat: boolean, rng: Rng, opts: { tag?: boolean; title?: string; upset?: boolean; noContest?: boolean } = {}): string {
  const F = MATCH_TEXT.finishes;
  const pool = opts.noContest ? F.noContest : opts.title ? F.title : opts.tag ? F.tag : cheat ? F.cheat : opts.upset ? F.upset : F.clean;
  const ctx: RenderCtx = { cast: { winner: winnerIds, loser: loserIds }, rng, globals: { title: opts.title ?? 'the title' } };
  return renderOne(pool, ctx, '{winner} won.');
}

function colorSentence(rng: Rng): string {
  return rng.chance(0.35) ? ' ' + renderOne(MATCH_TEXT.color, { cast: {}, rng }) : '';
}

function openerFor(a: string[], b: string[], rng: Rng): string {
  const sa = styleOf(a[0]);
  const sb = styleOf(b[0]);
  const key = [sa, sb].sort().join('|');
  const flip = sa > sb;
  const pool = MATCH_TEXT.openers[key]?.length && rng.chance(0.75) ? MATCH_TEXT.openers[key] : MATCH_TEXT.openers.any ?? [];
  return renderOne(pool, { cast: { a: flip ? b : a, b: flip ? a : b }, rng }, '{a} and {b} went back and forth.');
}

function stipLabel(stip: Stip): string {
  const labels: Partial<Record<Stip, string>> = {
    'two-of-three': '2 out of 3 Falls', 'no-dq': 'No DQ', cage: 'Steel Cage', ladder: 'Ladder Match', lumberjack: 'Lumberjack',
    'say-uncle': 'Say Uncle', 'last-standing': 'Last One Standing', 'battle-royal': 'Battle Royal', 'pie-eating': 'Pie-Eating Contest',
    'bingo-brawl': 'Bingo Brawl', 'lights-out': 'Lights Out', 'honey-pot': "Wanda's Honey Pot", 'object-pole': 'On a Pole',
    'pop-quiz': 'Pop Quiz', 'hardware-brawl': 'Hardware Store Brawl', 'iron-hour': 'Iron Hour', bandana: 'Bandana Match',
    'haunted-house': 'Haunted House', snowball: 'Snowball Showdown', 'hay-bale': 'Hay Bale Brawl', 'four-corners': 'Four Corners', farewell: 'Farewell Match',
  };
  return labels[stip] ?? '';
}

// ------------------------------------------------------------------ player match spec

function matchSpec(sides: string[][], winnerSide: number | null, stip: Stip, titleId: TitleId | undefined, intro: string): MatchSpec | undefined {
  const pSide = sides.findIndex((s) => s.includes(PLAYER));
  if (pSide < 0) return undefined;
  const mine = sides[pSide];
  const opp = sides.filter((_, i) => i !== pSide).flat();
  const partner = mine.find((x) => x !== PLAYER);
  const spec: MatchSpec = {
    opponent: opp[0],
    winner: winnerSide === pSide ? 'player' : 'opponent',
    playerRole: roleOf(PLAYER, opp[0]),
    opponentRole: roleOf(opp[0], PLAYER),
    stipulation: stip === 'standard' && (partner || opp.length > 1) ? 'tag' : stip,
    intro,
  };
  if (spec.playerRole === spec.opponentRole && alignOf(PLAYER) === 'tweener') spec.playerRole = spec.opponentRole === 'face' ? 'heel' : 'face';
  if (partner) spec.partner = partner;
  if (opp[1]) spec.opponent2 = opp[1];
  if (titleId) spec.title = titleId;
  return spec;
}

function birdieNote(won: boolean, opp: string, rng: Rng): string {
  const pool = won ? MATCH_TEXT.winNotes : MATCH_TEXT.putOverNotes;
  return renderOne(pool, { cast: { opp }, rng }, won ? 'Go win it, sugar.' : 'Make {opp.real} look like a million bucks, sugar.');
}

function playerIntro(opp: string, won: boolean, rng: Rng, hype?: string): string {
  const h = hype ?? renderOne(MATCH_TEXT.playerIntros, { cast: { player: PLAYER, opp }, rng }, '{player} gets the call against {opp}.');
  return `${h} Birdie: "${birdieNote(won, opp, rng)}"`;
}

// ------------------------------------------------------------------ story beat -> segment

function beatTexts(st: Storyline, beat: BeatState, rng: Rng): { title: string; text: string; headline: string } {
  const sh = shapeOf(st.shape);
  const ctx = storyCtx(st, rng, beat);
  const src = beat.src;
  let title = '';
  let text = '';
  let headline = '';
  if (src.from === 'shape') {
    const def = sh.acts[src.act]?.[src.idx];
    title = def ? render(def.title, ctx) : st.title;
    text = renderOne(def?.text, ctx);
    headline = renderOne(def?.headline, ctx);
  } else if (src.from === 'card') {
    const c = CARD[src.card];
    if (src.part === 'beat' && c?.beat) {
      title = render(c.beat.title, ctx);
      text = renderPre(c.beat.text, ctx);
      headline = renderPre(c.beat.headline, ctx, '{hero} AND {villain}');
    } else if (src.part === 'declare' && c?.stakes) {
      title = render(beat.kind === 'contract' ? 'Contract signing: {hero} & {villain}' : '{hero} and {villain} name the stakes', ctx);
      text = renderPre(c.stakes.declare, ctx, '{hero} and {villain} put {stakes} on the line.');
      headline = renderPre(c.stakes.headline, ctx, '{stakes} ON THE LINE');
    } else if (src.part === 'payoff' && c?.payoff) {
      const win = beat.winner === null || beat.winner === undefined ? [] : idsOf(st, beat, beat.sides?.[beat.winner] ?? []);
      const lose = beat.sides ? beat.sides.filter((_, i) => i !== beat.winner).flatMap((s) => idsOf(st, beat, s)) : [];
      const pctx = storyCtx(st, rng, beat, { winner: win.length ? win : ['nobody'], loser: lose.length ? lose : ['nobody'] });
      title = render(c.payoff.title, pctx);
      const parts: string[] = [];
      if (beat.twistText && st.cards.twist) {
        const tw = CARD[st.cards.twist];
        if (tw?.beat) parts.push(renderOne(tw.beat.text, pctx));
      }
      if (win.length) parts.push(renderOne(c.payoff.text, pctx));
      else parts.push(finishSentence(lose.slice(0, 1), lose.slice(1), false, rng, { noContest: true }));
      const stakes = CARD[st.cards.stakes]?.stakes;
      if (stakes && win.length) parts.push(renderOne(stakes.resolve, pctx));
      const ending = sh.endings.find((e) => e.id === st.ending);
      if (ending) parts.push(renderOne(ending.text, pctx));
      text = parts.filter(Boolean).join(' ');
      headline = renderOne(ending?.headline ?? c.payoff.headline, pctx);
    }
  } else {
    const { genericDef } = generic;
    const def = genericDef(src.key);
    title = def ? render(def.title, ctx) : st.title;
    text = renderOne(def?.text, ctx);
    headline = renderOne(def?.headline, ctx);
  }
  // Card-generated matches don't state the result: add the finish.
  if (beat.kind === 'match' && beat.sides && beat.purpose !== 'payoff' && src.from === 'card') {
    const w = beat.winner;
    if (w === null || w === undefined) text += ' ' + finishSentence(idsOf(st, beat, beat.sides[0]), idsOf(st, beat, beat.sides[1] ?? []), false, rng, { noContest: true });
    else text += ' ' + finishSentence(idsOf(st, beat, beat.sides[w]), beat.sides.filter((_, i) => i !== w).flatMap((s) => idsOf(st, beat, s)), !!beat.cheat, rng);
  }
  if (!title) title = beat.sides ? beat.sides.map((s) => SideName(idsOf(st, beat, s))).join(' vs. ') : st.title;
  return { title: cap(title), text: text.trim(), headline: (headline || st.title).toUpperCase() };
}

import * as generic from './generate';

// ------------------------------------------------------------------ booking

interface Ctx {
  day: number;
  kind: Kind;
  venue: Venue;
  used: Set<string>;
  drafts: Draft[];
  rng: Rng;
  storyCount: number;
}

function free(c: Ctx, id: string, opts: { story?: boolean; wrestle?: boolean } = {}): boolean {
  if (c.used.has(id)) return false;
  if (id === PLAYER) return playerHired();
  if (opts.wrestle === false) return isAround(id, c.day);
  return canWrestle(id, c.day, { story: opts.story });
}

function tryStoryBeat(c: Ctx, st: Storyline, beat: BeatState): boolean {
  if (c.storyCount >= T.capacity[c.kind]) return false;
  if (beat.purpose === 'payoff') {
    const req = payoffReq(CARD[st.cards.payoff]);
    if ((req.saturday || req.night) && c.kind === 'wednesday') return false;
    if (req.vfw && c.kind !== 'wednesday') return false;
    if (typeof req.supershow === 'number' && (c.kind !== 'supershow' || cal.season(c.day) !== req.supershow)) return false;
    if (req.supershow === 'any' && c.kind !== 'supershow') return false;
  }
  const wrestles = beat.kind === 'match' || beat.kind === 'run-in';
  // Resolve outsiders now.
  const outsiders: Record<string, string> = {};
  const roles = beat.sides ? beat.sides.flat() : beat.roles ?? ['hero', 'villain'];
  const castIds = new Set(Object.values(st.cast));
  for (const r of roles) {
    if (!r.startsWith('@')) continue;
    const pool = WRESTLERS.filter((w) => w !== 'mothman' && w !== 'lou' && !castIds.has(w) && !Object.values(outsiders).includes(w) && free(c, w));
    if (!pool.length) return false;
    outsiders[r] = c.rng.pick(pool);
  }
  beat.outsiders = outsiders;
  const ids = roles.map((r) => (r.startsWith('@') ? outsiders[r] : st.cast[r])).filter((x): x is string => !!x);
  for (const id of ids) {
    if (!free(c, id, { story: true, wrestle: wrestles })) return false;
  }
  // Commit.
  for (const id of ids) c.used.add(id);
  c.storyCount++;
  const rng = storyRng(st, `b${beat.id}`);
  const t = beatTexts(st, beat, rng);
  beat.title = t.title;
  beat.text = t.text;
  beat.headline = t.headline;
  const { sides, others } = beatParticipants(st, beat);
  const participants = [...new Set([...sides.flat(), ...others])];
  const playerInvolved = participants.includes(PLAYER);
  const stip: Stip = beat.purpose === 'payoff' ? CARD[st.cards.payoff]?.payoff?.stip ?? 'standard' : 'standard';
  const tid = beat.purpose === 'payoff' ? titleInStory(st) : undefined;
  const seg: Segment = {
    id: '',
    kind: beat.kind === 'town' || beat.kind === 'wrsl' || beat.kind === 'booth' ? 'angle' : beat.kind,
    title: t.title + (stip !== 'standard' && stip !== 'tag' && !t.title.toLowerCase().includes(stipLabel(stip).toLowerCase()) ? ` (${stipLabel(stip)})` : ''),
    participants,
    playerInvolved,
    summary: t.text,
    storylineId: st.id,
    slot: 'mid',
  };
  if (playerInvolved && beat.kind === 'match' && sides.length) {
    const winSide = beat.winner ?? null;
    const oppId = sides.find((s) => !s.includes(PLAYER))?.[0] ?? 'earl';
    const won = winSide !== null && sides[winSide]?.includes(PLAYER);
    const hype = `${st.title}: ${t.title}.`;
    seg.match = matchSpec(sides, winSide, stip, tid, playerIntro(oppId, !!won, rng, hype));
  }
  let pos = 45 + st.buzz / 10;
  if (beat.purpose === 'payoff') pos = 100 + (cal.isSuper(c.day) ? 10 : 0);
  else if (beat.purpose === 'twist' || beat.purpose === 'stakes') pos = 62;
  else if (beat.purpose === 'hook') pos = 50;
  if (st.signature) pos += 5;
  c.drafts.push({
    rec: { seg, storyId: st.id, beatId: beat.id, sides: sides.length ? sides : undefined, winnerSide: beat.winner ?? null, cheat: beat.cheat, stip, titleId: tid, headline: t.headline, resolved: false },
    pos,
    quiet: beat.kind !== 'match',
  });
  return true;
}

function pickWinner(a: string[], b: string[], c: Ctx, champSide?: number): number {
  const la = a.reduce((s, x) => s + levelOf(x), 0) / a.length;
  const lb = b.reduce((s, x) => s + levelOf(x), 0) / b.length;
  let p = 0.5 + (la - lb) * 0.12;
  if (champSide === 0) p += 0.25;
  if (champSide === 1) p -= 0.25;
  return c.rng.chance(clamp(p, 0.15, 0.85)) ? 0 : 1;
}

function addMatch(c: Ctx, sides: string[][], opts: { titleId?: TitleId; pos?: number; winnerSide?: number; stip?: Stip } = {}): void {
  for (const s of sides) for (const id of s) c.used.add(id);
  const t = opts.titleId ? S().titles[opts.titleId] : undefined;
  const champSide = t ? sides.findIndex((s) => s.some((x) => t.holders.includes(x))) : -1;
  const w = opts.winnerSide ?? pickWinner(sides[0], sides[1], c, champSide >= 0 ? champSide : undefined);
  const winners = sides[w];
  const losers = sides.filter((_, i) => i !== w).flat();
  const cheat = alignOf(winners[0]) === 'villain' && c.rng.chance(0.6);
  const tag = sides[0].length > 1;
  const upset = !cheat && levelOf(winners[0]) + 1 < levelOf(losers[0]);
  const rng = c.rng;
  const playerIn = sides.flat().includes(PLAYER);
  const titleLine = t ? `${t.name}` : undefined;
  const summary = [openerFor(sides[0], sides[1], rng), finishSentence(winners, losers, cheat, rng, { tag, title: titleLine, upset }), colorSentence(rng)].join(' ').replace(/\s+/g, ' ').trim();
  const title = sides.map(SideName).join(' vs. ') + (opts.titleId ? ` (${TITLE_SHORT[opts.titleId]})` : '');
  const seg: Segment = { id: '', kind: 'match', title, participants: sides.flat(), playerInvolved: playerIn, summary, slot: 'mid' };
  if (playerIn) {
    const opp = sides.find((s) => !s.includes(PLAYER))![0];
    const won = sides[w].includes(PLAYER);
    seg.match = matchSpec(sides, w, opts.stip ?? 'standard', opts.titleId, playerIntro(opp, won, rng));
    seg.summary = seg.match?.intro ?? summary;
  }
  let pos = opts.pos ?? 18 + (sides.flat().reduce((s, x) => s + levelOf(x), 0) / sides.flat().length) * 3 + rng.next() * 6;
  if (t) pos = opts.titleId === 'heavyweight' ? 80 : opts.titleId === 'tag' ? 55 : 50;
  if (sides.flat().includes('mothman')) pos = Math.max(pos, 56);
  c.drafts.push({ rec: { seg, sides, winnerSide: w, cheat, stip: opts.stip ?? 'standard', titleId: opts.titleId, resolved: false }, pos, quiet: false });
}

const TITLE_SHORT: Record<TitleId, string> = { heavyweight: 'Heavyweight title', tag: 'Tag titles', wednesday: 'Wednesday Night title' };

function freeWrestlers(c: Ctx): string[] {
  return WRESTLERS.filter((w) => w !== 'lou' && free(c, w));
}

function addCrew(c: Ctx): boolean {
  const pool = MATCH_TEXT.crew.filter((x) => (!x.venue || x.venue === c.venue) && x.participants.every((p) => !c.used.has(p) && isAround(p, c.day)));
  if (!pool.length) return false;
  const pick = c.rng.pick(pool);
  for (const p of pick.participants) c.used.add(p);
  const ctx: RenderCtx = { cast: {}, rng: c.rng };
  c.drafts.push({
    rec: { seg: { id: '', kind: 'promo', title: render(pick.title, ctx), participants: [...pick.participants], playerInvolved: false, summary: renderOne(pick.text, ctx), slot: 'mid' }, resolved: false },
    pos: 30 + c.rng.next() * 10,
    quiet: true,
  });
  return true;
}

function addPromo(c: Ctx): boolean {
  const pool = freeWrestlers(c).filter((w) => w !== 'mothman');
  if (pool.length < 2 || !MATCH_TEXT.promos.length) return false;
  const a = c.rng.pick(pool.filter((w) => alignOf(w) === 'villain').concat(pool).slice(0, 6));
  const b = c.rng.pick(pool.filter((w) => w !== a && alignOf(w) !== alignOf(a)).concat(pool.filter((w) => w !== a)));
  c.used.add(a);
  const ctx: RenderCtx = { cast: { a, b }, rng: c.rng };
  c.drafts.push({
    rec: { seg: { id: '', kind: 'promo', title: `${NameOf(a)} has something to say`, participants: [a], playerInvolved: false, summary: renderOne(MATCH_TEXT.promos, ctx), slot: 'mid' }, resolved: false },
    pos: 34 + c.rng.next() * 8,
    quiet: true,
  });
  return true;
}

function addBackgroundMatch(c: Ctx): boolean {
  const s = S();
  const pool = freeWrestlers(c);
  // Title defenses.
  const tryTitle = (tid: TitleId, chance: number) => {
    const t = s.titles[tid];
    if (!t || !c.rng.chance(chance)) return false;
    if (!t.holders.every((h) => h !== PLAYER && pool.includes(h))) return false;
    const challengers = pool.filter((w) => !t.holders.includes(w) && w !== 'mothman');
    if (tid === 'tag') {
      const team = challengers.filter((w) => alignOf(w) !== alignOf(t.holders[0])).slice(0, 2);
      if (team.length < 2) return false;
      addMatch(c, [t.holders, c.rng.shuffle(team)], { titleId: tid });
      return true;
    }
    const opp = challengers.filter((w) => alignOf(w) !== alignOf(t.holders[0]));
    if (!opp.length) return false;
    addMatch(c, [t.holders, [c.rng.pick(opp)]], { titleId: tid });
    return true;
  };
  if (c.kind !== 'wednesday' && tryTitle('heavyweight', c.kind === 'supershow' ? 0.7 : 0.3)) return true;
  if (c.kind === 'wednesday' && tryTitle('wednesday', 0.4)) return true;
  if (tryTitle('tag', 0.18)) return true;
  if (pool.length < 2) return false;
  // Tag match with the twins.
  if (pool.includes('bo') && pool.includes('buck') && pool.length >= 4 && c.rng.chance(0.3)) {
    const opp = pool.filter((w) => w !== 'bo' && w !== 'buck' && w !== 'mothman' && alignOf(w) === 'hero');
    if (opp.length >= 2) {
      addMatch(c, [['bo', 'buck'], c.rng.shuffle([...opp]).slice(0, 2)]);
      return true;
    }
  }
  const lastPairs = new Set(S().shows.slice(-3).flatMap((r) => r.segs.filter((x) => x.sides?.length === 2).map((x) => x.sides!.flat().sort().join('|'))));
  const a = c.rng.weighted(pool, (w) => (w === 'mothman' ? 2.5 : 1) * (charState(w).lastMatch === undefined ? 2 : 1 + clamp(c.day - (charState(w).lastMatch ?? 0), 0, 7) / 4));
  const bPool = pool.filter((w) => w !== a && !(['bo', 'buck'].includes(a) && ['bo', 'buck'].includes(w)) && !lastPairs.has([a, w].sort().join('|')));
  if (!bPool.length) return false;
  const b = c.rng.weighted(bPool, (w) => (alignOf(w) !== alignOf(a) ? 4 : 1));
  addMatch(c, [[a], [b]]);
  return true;
}

function addPlayerMatch(c: Ctx): void {
  const s = S();
  // The debut (Birdie's tryout promise): face vs the Mountain, the Mountain wins, opener.
  if (!G.flags['debuted'] && !s.flags.debutBooked) {
    s.flags.debutBooked = c.day;
    c.used.add('earl');
    c.used.add(PLAYER);
    const rng = c.rng;
    const intro = `The new kid against the Mountain. Birdie: "${renderOne(MATCH_TEXT.putOverNotes, { cast: { opp: 'earl' }, rng }, 'Make Earl look like a million bucks, sugar.')}"`;
    const seg: Segment = {
      id: '', kind: 'match', title: `${cap(nameOf(PLAYER))} vs. the Mountain`, participants: [PLAYER, 'earl'], playerInvolved: true, slot: 'opener',
      summary: 'A debut at the VFW Hall. Fifty folding chairs, one rookie, and the biggest man in the county.',
      match: { opponent: 'earl', winner: 'opponent', playerRole: 'face', opponentRole: 'heel', stipulation: 'standard', intro: intro.replace('the Mountain', 'The Mountain') },
    };
    c.drafts.push({ rec: { seg, sides: [[PLAYER], ['earl']], winnerSide: 1, stip: 'standard', resolved: false }, pos: -100, quiet: false });
    return;
  }
  const pool = WRESTLERS.filter((w) => w !== 'lou' && w !== 'mothman' && free(c, w));
  if (!pool.length) return;
  const rank = G.player.rank;
  const pAlign = alignOf(PLAYER);
  // Tag match now and then, with a friend.
  if (pool.length >= 3 && c.rng.chance(0.2)) {
    const friends = pool.filter((w) => alignOf(w) === pAlign || pAlign === 'tweener');
    const partner = friends.sort((x, y) => hearts(y) - hearts(x))[0];
    const opp = pool.filter((w) => w !== partner && (alignOf(w) !== pAlign || pAlign === 'tweener'));
    if (partner && opp.length >= 2) {
      const pair = opp.includes('bo') && opp.includes('buck') ? ['bo', 'buck'] : c.rng.shuffle([...opp]).slice(0, 2);
      const win = c.rng.chance(clamp(T.playerWinChance[rank] + 0.1, 0, 0.9)) ? 0 : 1;
      addMatch(c, [[PLAYER, partner], pair], { winnerSide: win, pos: playerPos(c) });
      return;
    }
  }
  const opp = c.rng.weighted(pool, (w) => (alignOf(w) !== pAlign ? 3 : 1) * (levelOf(w) >= 3 ? 1.5 : 1));
  const p = clamp(T.playerWinChance[rank] + G.player.momentum / 250 - (levelOf(opp) - 3) * 0.05, 0.05, 0.85);
  const win = c.rng.chance(p) ? 0 : 1;
  addMatch(c, [[PLAYER], [opp]], { winnerSide: win, pos: playerPos(c) });
}

function hearts(id: string): number {
  return Math.floor((G.relationships[id]?.points ?? 0) / 250);
}

function playerPos(c: Ctx): number {
  const byRank: Record<string, number> = { rookie: 4, opener: 10, undercard: 24, midcard: 40, main: 70, assistant: 66, pencil: 66, owner: 66 };
  return (byRank[G.player.rank] ?? 20) + c.rng.next() * 6;
}

function applyPlan(c: Ctx, plan: PlannedCard): void {
  for (const p of plan.segs) {
    const ids = p.sides.flat();
    if (!ids.length || ids.some((id) => !free(c, id))) continue;
    if (p.kind === 'match' && p.sides.length >= 2) addMatch(c, p.sides, { titleId: p.titleId, winnerSide: p.winnerSide ?? undefined, stip: p.stip });
  }
}

/** Build tonight's card (idempotent for the same day). */
export function bookShow(day: number, venue: Venue, supershow: string | null): ShowRecord {
  const s = S();
  const existing = s.shows.find((r) => r.day === day);
  if (existing) return existing;
  const kind: Kind = supershow ? 'supershow' : venue === 'vfw' ? 'wednesday' : 'saturday';
  const c: Ctx = { day, kind, venue, used: new Set(), drafts: [], rng: rngFor('book', day), storyCount: 0 };
  const hired = playerHired();
  if (!hired) c.used.add(PLAYER);

  // The debut goes first so the Mountain is free for it.
  if (hired && !G.flags['debuted'] && !s.flags.debutBooked) addPlayerMatch(c);

  // Story beats that are due, by priority.
  const due = s.stories.filter((st) => !st.done).map((st) => ({ st, b: dueBeat(st, day) })).filter((x): x is { st: Storyline; b: BeatState } => !!x.b);
  due.sort((x, y) => beatPriority(y.st, y.b) - beatPriority(x.st, x.b));
  for (const { st, b } of due) {
    const involvesPlayer = (b.sides?.flat() ?? b.roles ?? []).some((r) => st.cast[r] === PLAYER);
    if (involvesPlayer && !hired) {
      slideStory(st, day);
      continue;
    }
    if (!tryStoryBeat(c, st, b)) slideStory(st, day);
  }

  // The player's own match.
  const plan = s.plans[String(day)];
  if (plan) applyPlan(c, plan);
  if (hired && !c.drafts.some((d) => d.rec.seg.playerInvolved && d.rec.seg.kind === 'match')) {
    c.used.delete(PLAYER);
    if (!c.used.has(PLAYER)) addPlayerMatch(c);
  }

  // Fill the card.
  const [lo, hi] = T.cardSize[kind];
  const target = c.rng.int(lo, hi);
  let nonMatch = c.drafts.filter((d) => d.quiet).length;
  for (let guard = 0; c.drafts.length < target && guard < 20; guard++) {
    if (nonMatch === 0 && c.drafts.length >= 2 && c.rng.chance(0.55)) {
      if (c.rng.chance(0.5) ? addCrew(c) : addPromo(c)) {
        nonMatch++;
        continue;
      }
    }
    if (!addBackgroundMatch(c)) {
      if (nonMatch < 2 && (addCrew(c) || addPromo(c))) nonMatch++;
      else break;
    }
  }

  // Running order: open hot, take a breath, build, blow the roof off.
  const drafts = c.drafts.sort((a, b) => a.pos - b.pos);
  if (drafts.length > 2) {
    if (drafts[0].quiet) {
      const i = drafts.findIndex((d) => !d.quiet);
      if (i > 0) [drafts[0], drafts[i]] = [drafts[i], drafts[0]];
    }
    const last = drafts.length - 1;
    if (drafts[last].quiet) {
      let i = last - 1;
      while (i > 0 && drafts[i].quiet) i--;
      if (i > 0) {
        const [d] = drafts.splice(i, 1);
        drafts.push(d);
      }
    }
  }
  drafts.forEach((d, i) => {
    d.rec.seg.id = `d${day}s${i}`;
    d.rec.seg.slot = i === 0 ? 'opener' : i === drafts.length - 1 ? 'main' : 'mid';
  });
  const rec: ShowRecord = {
    day, venue, name: showName(venue, supershow), supershow, segs: drafts.map((d) => d.rec), reviewed: false, attended: null,
    bookedBy: plan ? 'player' : 'birdie',
  };
  s.shows.push(rec);
  if (s.shows.length > 40) s.shows.splice(0, s.shows.length - 40);
  if (hired) queuePostShowPitches(day);
  return rec;
}

// ------------------------------------------------------------------ results

export function findSeg(segId: string): { show: ShowRecord; rec: SegRecord } | null {
  const s = S();
  for (let i = s.shows.length - 1; i >= 0; i--) {
    const rec = s.shows[i].segs.find((r) => r.seg.id === segId);
    if (rec) return { show: s.shows[i], rec };
  }
  return null;
}

function storyAndBeat(rec: SegRecord): { st: Storyline; beat: BeatState } | null {
  if (!rec.storyId) return null;
  const st = S().stories.find((x) => x.id === rec.storyId);
  const beat = st?.beats.find((b) => b.id === rec.beatId);
  return st && beat ? { st, beat } : null;
}

function resolveSeg(show: ShowRecord, rec: SegRecord, stars: number, attended: boolean, actualWinner?: number | null): void {
  if (rec.resolved) return;
  rec.resolved = true;
  rec.stars = Math.round(clamp(stars, 0.5, 5) * 4) / 4;
  const sb = storyAndBeat(rec);
  if (sb) {
    resolveBeat(sb.st, sb.beat, { stars: rec.stars, attended, actualWinner });
    if (sb.beat.headline) sb.st.headlines.push(sb.beat.headline);
    if (rec.titleId && rec.sides && sb.beat.purpose !== 'payoff') {
      // Titles only change at payoffs inside stories.
    }
    return;
  }
  // Background match bookkeeping.
  if (rec.sides && rec.sides.length >= 2) {
    const w = actualWinner !== undefined && actualWinner !== null ? actualWinner : rec.winnerSide ?? 0;
    rec.sides.forEach((side, i) => {
      for (const id of side) {
        if (id === PLAYER) continue;
        const ch = charState(id);
        ch.matches++;
        if (i === w) ch.wins++;
        ch.lastMatch = show.day;
        const a = alignOf(id);
        nudgeSentiment(id, a === 'hero' ? (i === w ? 2 : 0) + (rec.stars! - 3) * 2 : a === 'villain' ? (i === w && rec.cheat ? -3 : -1) + (rec.stars! >= 4 ? 3 : 0) : 0);
      }
    });
    if (rec.titleId) changeTitle(rec.titleId, rec.sides[w], show.day, `${show.name}`);
    const key = rec.sides.flat().slice(0, 2).sort().join('|');
    S().cool.pairs[key] = (S().cool.pairs[key] ?? 0) + 0.25;
  }
}

export function reportPlayerMatch(segId: string, result: MatchResult): void {
  const f = findSeg(segId);
  if (!f || f.rec.resolved) return;
  const { show, rec } = f;
  show.attended = true;
  const pSide = rec.sides?.findIndex((s) => s.includes(PLAYER)) ?? 0;
  const won = result.winner === 'player';
  const actual = rec.sides ? (won ? pSide : rec.sides.findIndex((_, i) => i !== pSide)) : undefined;
  rec.playerWon = won;
  if (!G.flags['debuted'] && S().flags.debutBooked === show.day) S().flags.debutDone = show.day;
  resolveSeg(show, rec, result.stars, true, actual);
  applyPlayerMatch(rec, result, show);
  maybeClose(show);
}

export function reportNpcSegment(segId: string): void {
  const f = findSeg(segId);
  if (!f || f.rec.resolved) return;
  const { show, rec } = f;
  const sb = storyAndBeat(rec);
  const rng = rngFor(`seg${segId}`, show.day);
  if (rec.seg.playerInvolved) {
    // A player segment with no match (a promo, a run-in): it went fine.
    show.attended = true;
    const stars = 2.8 + (G.player.skills.charisma ?? 0) / 1500 + rng.next() * 0.8;
    resolveSeg(show, rec, stars, true);
    G.player.respect += 1;
  } else {
    const ids = rec.seg.participants;
    resolveSeg(show, rec, simulateStars(ids, sb?.st ?? null, sb?.beat.purpose ?? 'filler', rec.seg.kind, rng, show.day), false);
  }
  maybeClose(show);
}

/** The player missed the show: everything still happened, and their beats wait for them. */
export function reportShowSkipped(show: ShowRecord): void {
  if (show.closed) return;
  show.attended = show.attended ?? false;
  for (const rec of show.segs) {
    if (rec.resolved) continue;
    if (rec.seg.playerInvolved) {
      rec.resolved = true;
      rec.stars = undefined;
      const sb = storyAndBeat(rec);
      if (sb) {
        sb.beat.holds = (sb.beat.holds ?? 0) + 1;
        sb.beat.status = 'pending';
        slideStory(sb.st, show.day);
        if (sb.beat.holds === 2) {
          const { queueScene } = runMod;
          queueScene('held', sb.st, show.day, { who: sb.st.pitcher });
        }
      }
      continue;
    }
    reportNpcSegment(rec.seg.id);
  }
  closeShow(show);
}

import * as runMod from './run';

function maybeClose(show: ShowRecord): void {
  if (show.segs.every((r) => r.resolved)) closeShow(show);
}

/** Finalize a show: resolve anything unreported, compute Birdie's Curve rating. */
export function closeShow(show: ShowRecord): void {
  if (show.closed) return;
  for (const rec of show.segs) if (!rec.resolved) {
    if (rec.seg.playerInvolved) {
      reportShowSkipped(show);
      return;
    }
    reportNpcSegment(rec.seg.id);
    if (show.closed) return;
  }
  show.closed = true;
  show.rating = showRating(show);
  if (show.attended === null) show.attended = false;
  const best = Math.max(0, ...show.segs.filter((r) => r.seg.playerInvolved).map((r) => r.stars ?? 0));
  if (best > 0 && show.segs[show.segs.length - 1].seg.playerInvolved) S().career.bestMain = Math.max(S().career.bestMain, best);
}

/** Birdie's Curve (§13.2). */
export function showRating(show: ShowRecord): number {
  const segs = show.segs.filter((r) => r.stars !== undefined);
  if (!segs.length) return 2.5;
  const n = show.segs.length;
  let sum = 0;
  let wsum = 0;
  show.segs.forEach((r, i) => {
    if (r.stars === undefined) return;
    const w = i === n - 1 ? 1.5 : i === n - 2 ? 1.2 : 1;
    sum += r.stars * w;
    wsum += w;
  });
  let rating = sum / Math.max(1, wsum);
  const first = show.segs[0]?.stars ?? 0;
  const main = show.segs[n - 1]?.stars ?? 0;
  const breath = show.segs.slice(1, -2).some((r) => r.seg.kind !== 'match' || (r.stars ?? 5) < first);
  if (first >= 3 && breath && main >= Math.max(...segs.map((r) => r.stars ?? 0))) rating += 0.5;
  const stips = show.segs.map((r) => r.stip).filter((x) => x && x !== 'standard');
  rating -= (stips.length - new Set(stips).size) * 0.2;
  return Math.round(clamp(rating, 0.5, 5) * 4) / 4;
}

/** Simulate a whole show nobody reported (the show system didn't run it). */
export function runOffscreen(day: number): void {
  const venue = cal.venue(day);
  const supershow = cal.isSuper(day) ? ['Thaw Brawl', 'Fairgrounds Fury', 'Harvest Havoc', 'Homecoming'][cal.season(day)] : null;
  const show = bookShow(day, venue, supershow);
  show.offscreen = true;
  reportShowSkipped(show);
}

export function lastShow(): ShowRecord | undefined {
  const s = S();
  return s.shows[s.shows.length - 1];
}

export { realOf, sideName };
export const _bookDebug = { BIRDIE, today, TITLE_SHORT };
