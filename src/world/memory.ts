import { G, ext } from '../core/state';
import { absDay } from '../core/time';
import { item } from '../data/items';
import { NPC_BY_ID } from '../data/npcs';
import type { MatchResult } from '../match/types';
import type { MatchSpec, Venue } from '../story/api';

/**
 * What the town remembers about you: your last match, the last thing you gave
 * each person, when you last talked, and the news going round. Dialogue reads
 * it through the `lastMatch`, `giftedRecently`, `daysSinceTalk` and `news`
 * conditions (data/dialogue/types.ts) and the {opponent} {finisher} {venue}
 * {stars} {lastGift} {subject} placeholders.
 */

export interface MatchMemory {
  day: number;
  won: boolean;
  /** NPC id of the opponent. */
  opponent: string;
  /** Their ring name, as the crowd knows them. */
  opponentName: string;
  /** The finisher that ended it: yours if you won, theirs if you lost. */
  finisher: string;
  /** Your finisher's name, whatever happened. */
  myFinisher: string;
  stars: number;
  venue: 'vfw' | 'sportatorium';
  /** A belt was on the line (belt id). */
  title?: string;
  stipulation?: string;
  highlights: string[];
}

export interface NewsItem {
  id: string;
  day: number;
  /** Who the news is about, for {subject}. */
  subject?: string;
}

interface MemoryState {
  last: MatchMemory | null;
  /** The last ten matches, newest last. */
  history: MatchMemory[];
  gifts: Record<string, { item: string; day: number; mentioned?: boolean }>;
  /** Talks per NPC: the last day you talked before today, today's day and count. */
  talks: Record<string, { prev: number; day: number; n: number }>;
  news: NewsItem[];
  /** Flags already turned into news. */
  seen: string[];
}

export function memory(): MemoryState {
  const m = ext<MemoryState>('memory', () => ({ last: null, history: [], gifts: {}, talks: {}, news: [], seen: [] }));
  m.history ??= [];
  m.gifts ??= {};
  m.talks ??= {};
  m.news ??= [];
  m.seen ??= [];
  return m;
}

export const VENUE_NAME: Record<string, string> = { vfw: 'the VFW', sportatorium: 'the Sportatorium' };

// ------------------------------------------------------------------ matches

export function recordMatch(m: Omit<MatchMemory, 'day'> & { day?: number }): void {
  const mem = memory();
  // shows.ts bumps the career counters after this runs (the tryout counts as one match).
  const firstEver = mem.history.length === 0 && G.player.matches <= 1;
  const firstWin = m.won && G.player.wins === 0 && !mem.history.some((h) => h.won);
  const rec: MatchMemory = { ...m, day: m.day ?? absDay() };
  mem.last = rec;
  mem.history.push(rec);
  if (mem.history.length > 10) mem.history.shift();
  if (firstEver) pushNews('debut');
  if (firstWin) pushNews('first_win', rec.opponent);
  if (rec.won && rec.title) pushNews('title_win', rec.opponent);
  if (rec.stars >= 4.5) pushNews('five_star', rec.opponent);
  if (!rec.won && rec.stars < 2) pushNews('rough_night', rec.opponent);
}

/** shows.ts calls this right after the player's match. */
export function recordShowMatch(spec: MatchSpec, result: MatchResult, venue: Venue): void {
  const w = NPC_BY_ID[spec.opponent]?.wrestler;
  const mine = G.player.persona?.finisherName || 'Hometown Finish';
  const won = result.winner === 'player';
  recordMatch({
    won,
    opponent: spec.opponent,
    opponentName: w?.ringName ?? NPC_BY_ID[spec.opponent]?.short ?? spec.opponent,
    finisher: won ? mine : w?.finisher ?? 'their finisher',
    myFinisher: mine,
    stars: result.stars,
    venue,
    title: spec.title,
    stipulation: spec.stipulation,
    highlights: result.highlights ?? [],
  });
}

export function lastMatch(): MatchMemory | null {
  return memory().last;
}

export function matchDaysAgo(): number {
  const m = memory().last;
  return m ? absDay() - m.day : Infinity;
}

// ------------------------------------------------------------------ gifts and talks

export function recordGift(npc: string, id: string): void {
  memory().gifts[npc] = { item: id, day: absDay() };
}

export function lastGift(npc: string): { item: string; day: number; mentioned?: boolean } | null {
  return memory().gifts[npc] ?? null;
}

/** Count a talk. Returns how many times you've talked to them today, this one included. */
export function countTalk(npc: string): number {
  const t = (memory().talks[npc] ??= { prev: -1, day: -1, n: 0 });
  const today = absDay();
  if (t.day !== today) {
    if (t.day >= 0) t.prev = t.day;
    t.day = today;
    t.n = 0;
  }
  t.n++;
  return t.n;
}

/** Days since the last talk before today (Infinity if never). */
export function daysSinceTalk(npc: string): number {
  const t = memory().talks[npc];
  if (!t) return Infinity;
  const today = absDay();
  const prev = t.day === today ? t.prev : t.day;
  return prev < 0 ? Infinity : today - prev;
}

// ------------------------------------------------------------------ news

export function pushNews(id: string, subject?: string, day = absDay()): void {
  const mem = memory();
  mem.news = mem.news.filter((n) => n.id !== id);
  mem.news.push({ id, day, subject });
  if (mem.news.length > 40) mem.news.shift();
}

/** News within `within` days (default a week). */
export function freshNews(id: string, within = 7): NewsItem | null {
  const n = memory().news.find((x) => x.id === id);
  if (!n) return null;
  const age = absDay() - n.day;
  return age >= 0 && age <= within ? n : null;
}

/**
 * Story flags that become town talk. Some are only known to insiders: the
 * lines that react to those stay in insider places (kayfabe).
 */
export const NEWS_FLAGS: { flag: string; value?: string | number | boolean; news: string; subject?: string }[] = [
  { flag: 'earl_book', value: 'pebble', news: 'earl_book_pebble' },
  { flag: 'earl_book', value: 'own', news: 'earl_book_own', subject: 'earl' },
  { flag: 'mothman_revealed', news: 'mothman_revealed' },
  { flag: 'hank_new_ring', news: 'hank_new_ring', subject: 'hank' },
  { flag: 'tiny_pie', news: 'tiny_pie', subject: 'tiny' },
  { flag: 'hazel_belt', news: 'hazel_belt', subject: 'hazel' },
  { flag: 'gideon_hair_match', news: 'gideon_hair_match', subject: 'gideon' },
  { flag: 'jobber_won', news: 'jobber_won', subject: 'jobber' },
  { flag: 'bev_badge', news: 'bev_badge', subject: 'bev' },
  { flag: 'patty_regionals', news: 'patty_regionals', subject: 'patty' },
  { flag: 'wanda_ten', news: 'wanda_ten', subject: 'wanda' },
  { flag: 'clint_unmask_ring', news: 'clint_unmask', subject: 'clint' },
  { flag: 'pip_ten', news: 'pip_ten', subject: 'pip' },
  { flag: 'grandma_in_town', news: 'grandma_in_town', subject: 'grandma' },
  { flag: 'truth_revealed', news: 'truth_revealed', subject: 'birdie' },
  { flag: 'reunion_done', news: 'reunion_done', subject: 'grandma' },
  { flag: 'birdie_roof', news: 'birdie_roof', subject: 'birdie' },
  { flag: 'earl_romance_onscreen', news: 'dating_public', subject: 'earl' },
  { flag: 'dex_romance_onscreen', news: 'dating_public', subject: 'dex' },
  { flag: 'hazel_romance_onscreen', news: 'dating_public', subject: 'hazel' },
  { flag: 'gideon_romance_onscreen', news: 'dating_public', subject: 'gideon' },
  { flag: 'rosa_romance_onscreen', news: 'dating_public', subject: 'mariposa' },
  { flag: 'engaged_mo', news: 'engaged', subject: 'mo' },
  { flag: 'engaged_marigold', news: 'engaged', subject: 'marigold' },
];

/** Turn newly set story flags into dated news. Cheap; call it whenever. */
export function syncNews(): void {
  const mem = memory();
  for (const nf of NEWS_FLAGS) {
    const v = G.flags[nf.flag];
    if (!v || (nf.value !== undefined && v !== nf.value)) continue;
    const key = `${nf.flag}=${nf.value ?? ''}`;
    if (mem.seen.includes(key)) continue;
    mem.seen.push(key);
    pushNews(nf.news, nf.subject);
  }
}

/** A heart event just played: the people closest to that person hear about it. */
export function heartNews(npc: string, eventId: string): void {
  pushNews(`heart:${npc}`, npc);
  pushNews(`event:${eventId}`, npc);
}

// ------------------------------------------------------------------ text

function nameOf(id: string | undefined): string {
  if (!id) return 'somebody';
  return NPC_BY_ID[id]?.short ?? id;
}

/**
 * Fill memory placeholders for a line said by `npc`. Unknown keys are left
 * alone for ui/text.ts ({name}, {ring}, {they}...).
 */
export function fillMemory(s: string, npc: string, extra: Record<string, string> = {}): string {
  if (!s.includes('{')) return s;
  const m = memory().last;
  const g = lastGift(npc);
  return s.replace(/\{(\w+)\}/g, (all, key: string) => {
    if (key in extra) return extra[key];
    switch (key) {
      case 'opponent':
        return m?.opponentName ?? 'your opponent';
      case 'opp':
        return m ? nameOf(m.opponent) : 'them';
      case 'finisher':
        return m?.finisher ?? 'the finish';
      case 'myFinisher':
        return m?.myFinisher ?? G.player.persona?.finisherName ?? 'your finisher';
      case 'venue':
        return m ? VENUE_NAME[m.venue] : 'the show';
      case 'stars':
        return m ? String(Math.round(m.stars * 2) / 2) : 'some';
      case 'lastGift':
        return g ? item(g.item).name.replace(/^(The|Your) /, '').toLowerCase() : 'that thing';
      case 'Opponent':
        return m?.opponentName ?? 'Your opponent';
      default:
        return all;
    }
  });
}

export { nameOf as shortName };
