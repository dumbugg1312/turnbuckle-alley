/**
 * The career ladder (§7.5): rookie -> opener -> undercard -> midcard -> main ->
 * assistant -> pencil -> owner. Driven by respect, fans, match stars and
 * finished storylines. Birdie delivers each promotion in person (ui/scenes.ts).
 */
import { G, RANKS, type Rank } from '../core/state';
import type { MatchResult } from '../match/types';
import { RANK_REQS, T, type RankReq } from './tuning';
import { PLAYER, levelOf } from './engine/cast';
import { S, clamp, notice, today, type SegRecord, type ShowRecord } from './engine/state';

export function nextRank(): Rank | null {
  const i = RANKS.indexOf(G.player.rank);
  return i >= 0 && i < RANKS.length - 1 ? RANKS[i + 1] : null;
}

export interface Progress {
  rank: Rank;
  req: RankReq;
  have: { respect: number; matches: number; stories: number; bestStars: number; fans: number; ledger: number; day: number };
  met: boolean;
  parts: { label: string; have: number; need: number }[];
}

export function progress(): Progress | null {
  const r = nextRank();
  if (!r) return null;
  const req = RANK_REQS[r];
  if (!req) return null;
  const s = S();
  const have = {
    respect: G.player.respect,
    matches: G.player.matches,
    stories: s.career.completed + Math.floor(s.career.consults / 2),
    bestStars: G.player.bestStars,
    fans: G.player.fans,
    ledger: s.career.ledger,
    day: today(),
  };
  const parts = [
    { label: 'Respect', have: have.respect, need: req.respect },
    { label: 'Matches', have: have.matches, need: req.matches },
    { label: 'Stories told', have: have.stories, need: req.stories },
    { label: 'Best match ★', have: have.bestStars, need: req.bestStars },
    { label: 'Fans', have: have.fans, need: req.fans },
    { label: "Birdie's Ledger", have: have.ledger, need: req.ledger },
  ].filter((p) => p.need > 0);
  const met = parts.every((p) => p.have >= p.need) && have.day >= req.minDay;
  return { rank: r, req, have, met, parts };
}

/** Check thresholds; if met, Birdie has a promotion waiting (delivered by a scene). */
export function checkPromotion(): void {
  const s = S();
  if (s.career.pending) return;
  if (!G.flags['met_birdie'] || !G.player.persona) return;
  const p = progress();
  if (p?.met) {
    s.career.pending = p.rank;
    s.career.noteDay = today();
    notice('Birdie wants a word. (Find her, or stop by her office.)');
  }
}

/** Birdie hands over the new rank. */
export function promote(): Rank | null {
  const s = S();
  const r = s.career.pending;
  if (!r) return null;
  G.player.rank = r;
  G.flags[`rank_${r}`] = true;
  s.career.history.push({ rank: r, day: today() });
  s.career.pending = null;
  return r;
}

/** Respect, fans and momentum after the player's match (§5 of the brief). */
export function applyPlayerMatch(rec: SegRecord, result: MatchResult, show: ShowRecord): void {
  const p = G.player;
  const R = T.respect;
  const M = T.momentum;
  const pSide = rec.sides?.findIndex((x) => x.includes(PLAYER)) ?? 0;
  const bookedWin = rec.winnerSide === pSide;
  const won = result.winner === 'player';
  const opp = rec.sides?.find((x) => !x.includes(PLAYER))?.[0];
  const established = opp ? levelOf(opp) >= 3 : false;
  let respect = R.worked;
  if (!bookedWin && !won && established) respect += R.putOver; // putting people over earns respect
  if (won === bookedWin) respect += R.finish;
  else respect += result.stars >= 3.75 ? 1 : R.offScriptHit;
  respect += Math.max(0, Math.round((result.stars - 2.5) * R.perStarAbove));
  if (result.stars >= 4) respect += R.fourStar;
  p.respect = Math.max(0, p.respect + respect);
  p.fans = Math.max(0, p.fans + Math.round(result.stars * 8 + (won ? 10 : 3) + (show.venue === 'sportatorium' ? 6 : 0) + (show.supershow ? 12 : 0)));
  let mom = won ? M.win : !bookedWin && established ? M.putOverLoss : M.loss;
  if (result.stars >= 4) mom += M.fourStar;
  p.momentum = clamp(Math.round(p.momentum + mom), -100, 100);
  // matches / wins / bestStars are counted by the show system (src/systems/shows.ts).
  S().career.ledger += result.stars >= 4 ? 1 : 0;
  checkPromotion();
}

/** Weekly drift. */
export function weeklyCareer(): void {
  G.player.momentum = Math.round(G.player.momentum * T.momentum.weeklyDecay);
}

/** Who books what: assistant books Wednesdays, the Pencil books everything. */
export function canBook(day: number): boolean {
  const r = G.player.rank;
  const i = RANKS.indexOf(r);
  if (i >= RANKS.indexOf('pencil')) return true;
  if (r === 'assistant') return day % 7 === 2;
  return false;
}
