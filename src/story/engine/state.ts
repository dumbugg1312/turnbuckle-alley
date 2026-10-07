/**
 * Storyline save state. Everything lives in ext('story') as plain JSON
 * (no class instances, no functions) so saves round-trip cleanly.
 */
import { G, ext, type Rank } from '../../core/state';
import { absDay } from '../../core/time';
import { Rng, hashString } from '../../core/rng';
import type { Paper, Segment, Venue } from '../api';
import type {
  BeatKind, BeatPurpose, CardId, CardSource, FlopCause, RoleKey, ShapeId, Stip, StoryAlign, TitleId,
} from '../types';

export interface CharState {
  align: StoryAlign;
  /** Crowd feeling -100 (booed out of the building) .. +100 (adored). */
  sentiment: number;
  /** Consecutive beats past a turn threshold. */
  streak: number;
  morale: number;
  injuredUntil?: number;
  awayUntil?: number;
  lastMatch?: number;
  lastStory?: number;
  matches: number;
  wins: number;
  learnedRedLines: string[];
  turnOffered?: number;
  signaturesDone: string[];
}

export interface TitleState {
  id: TitleId;
  name: string;
  holders: string[];
  since: number;
  prestige: number;
  defenses: number;
  lineage: { holders: string[]; won: number; lost?: number; how: string }[];
}

export interface OwnedCard {
  id: CardId;
  stars: number;
  source: CardSource;
  got: number;
  lastPlayed?: number;
  plays: number;
  isNew?: boolean;
}

export type BeatSrc =
  | { from: 'shape'; act: 0 | 1 | 2; idx: number }
  | { from: 'card'; card: CardId; part: 'beat' | 'declare' | 'payoff' }
  | { from: 'generic'; key: string };

export interface BeatState {
  id: string;
  act: 1 | 2 | 3;
  kind: BeatKind;
  purpose: BeatPurpose;
  src: BeatSrc;
  /** Match sides as role keys ('@any', '@any2'... are outsiders resolved at booking). */
  sides?: RoleKey[][];
  roles?: RoleKey[];
  winner?: number | null;
  cheat?: boolean;
  optional?: boolean;
  /** Outsiders resolved at booking time ('@any' -> char id). */
  outsiders?: Record<string, string>;
  /** Twist text folded into the payoff (twistAt 'finish'). */
  twistText?: string;
  /** Scheduled absolute day. */
  day: number;
  status: 'pending' | 'done' | 'skipped';
  stars?: number;
  /** Resolved text (filled when it's booked or resolved). */
  text?: string;
  headline?: string;
  title?: string;
  /** Held for the player (they missed the show). */
  holds?: number;
  place?: string;
}

export interface NapkinCards {
  hook: CardId;
  twist?: CardId;
  stakes: CardId;
  payoff: CardId;
  segments: CardId[];
}

export type StoryScope = 'for_you' | 'consult' | 'background' | 'board' | 'signature';

export interface Storyline {
  id: string;
  title: string;
  shape: ShapeId;
  scope: StoryScope;
  pitcher?: string;
  signature?: string;
  cast: Record<RoleKey, string>;
  cards: NapkinCards;
  spins: { who: string; from: CardId; to: CardId }[];
  weeks: number;
  start: number;
  end: number;
  beats: BeatState[];
  buzz: number;
  peakBuzz: number;
  buzzFloor: number;
  status: 'running' | 'hot' | 'steady' | 'cooling' | 'flopping';
  lowStreak: number;
  saves: number;
  extended: boolean;
  /** Planned ending id (the crowd and the finish can change it). */
  ending: string;
  stamps: string[];
  lessons: string[];
  decisions: { day: number; what: string; choice: string }[];
  headlines: string[];
  stars: number[];
  seed: number;
  signatures: string[];
  secretTwist?: boolean;
  twistRevealed?: boolean;
  huddleOffered?: boolean;
  extendOffered?: boolean;
  playerIn: boolean;
  wildcards: CardId[];
  flopCauses: FlopCause[];
  log: { day: number; text: string }[];
  winner?: string;
  done?: boolean;
  saved?: boolean;
}

export interface Archived {
  id: string;
  title: string;
  shape: ShapeId;
  scope: StoryScope;
  cast: Record<RoleKey, string>;
  cards: NapkinCards;
  start: number;
  end: number;
  ending: string;
  endingLabel: string;
  winner?: string;
  bestStars: number;
  avgStars: number;
  peakBuzz: number;
  headlines: string[];
  stamps: string[];
  signatures: string[];
  playerIn: boolean;
  lesson?: string;
  pitcher?: string;
}

export interface PitchState {
  id: string;
  pitcher: string;
  co: string[];
  trigger: 'first' | 'booth' | 'idle' | 'birdie' | 'milestone' | 'life' | 'signature' | 'player' | 'not_yet' | 'crowd' | 'board';
  scope: 'for_you' | 'consult' | 'signature' | 'board';
  shape: ShapeId;
  cast: Record<RoleKey, string>;
  want: string;
  created: number;
  nudgedOn?: number;
  nudges: number;
  status: 'waiting' | 'not_yet';
  notYetUntil?: number;
  notYetRank?: Rank;
  signature?: string;
  locked?: Partial<Record<'hook' | 'twist' | 'stakes' | 'payoff', CardId>>;
  weeks?: number;
  /** A saved napkin (Not yet / Sleep on it). */
  draft?: { cards: Partial<NapkinCards>; weeks: number; cast: Record<RoleKey, string> };
}

export interface SegRecord {
  seg: Segment;
  storyId?: string;
  beatId?: string;
  /** Booked result: sides as char ids, winning side index or null. */
  sides?: string[][];
  winnerSide?: number | null;
  cheat?: boolean;
  stip?: Stip;
  titleId?: TitleId;
  headline?: string;
  stars?: number;
  resolved: boolean;
  playerWon?: boolean;
}

export interface ShowRecord {
  day: number;
  venue: Venue;
  name: string;
  supershow: string | null;
  segs: SegRecord[];
  rating?: number;
  reviewed: boolean;
  attended: boolean | null;
  bookedBy: 'birdie' | 'player';
  offscreen?: boolean;
  closed?: boolean;
}

export interface QueuedScene {
  id: string;
  kind: 'turn' | 'huddle' | 'extend' | 'offscript' | 'booth' | 'gift_card' | 'birdie_note' | 'held';
  storyId?: string;
  who?: string;
  day: number;
  card?: CardId;
}

export interface NewsItem {
  day: number;
  headline: string;
  text: string;
  storyId?: string;
  weight: number;
}

export interface PlannedSeg {
  kind: 'match' | 'promo';
  sides: string[][];
  winnerSide: number | null;
  stip: Stip;
  titleId?: TitleId;
  /** A storyline beat placed by the booker. */
  storyId?: string;
}

export interface PlannedCard {
  day: number;
  segs: PlannedSeg[];
  savedOn: number;
}

export interface StoryState {
  v: 1;
  init: boolean;
  nextId: number;
  tin: OwnedCard[];
  stories: Storyline[];
  archive: Archived[];
  pitches: PitchState[];
  cool: { shapes: Record<string, number>; cards: Record<string, number>; pairs: Record<string, number> };
  chars: Record<string, CharState>;
  titles: Record<TitleId, TitleState>;
  career: {
    ledger: number;
    history: { rank: Rank; day: number }[];
    pending: Rank | null;
    noteDay?: number;
    completed: number;
    consults: number;
    bestMain: number;
  };
  shows: ShowRecord[];
  lastDay: number;
  paper: { day: number; key: string; paper: Paper | null } | null;
  news: NewsItem[];
  scenes: QueuedScene[];
  plans: Record<string, PlannedCard>;
  settings: { pace: 'chatty' | 'steady' | 'quiet'; birdieHandles: boolean; twistSecret: boolean };
  flags: Record<string, number | boolean | string>;
  /** Pending player-facing notices (toasts) for the UI layer. */
  notices: string[];
  recentText: string[];
  /** Seeds for future stories ("the one who leaves comes back"). */
  seeds: { shape: ShapeId; cast: Record<RoleKey, string>; after: number }[];
  daily: { day: number; nudged: string[]; marks: string[]; talked: string[] };
}

export function freshState(): StoryState {
  return {
    v: 1,
    init: false,
    nextId: 1,
    tin: [],
    stories: [],
    archive: [],
    pitches: [],
    cool: { shapes: {}, cards: {}, pairs: {} },
    chars: {},
    titles: {} as Record<TitleId, TitleState>,
    career: { ledger: 0, history: [], pending: null, completed: 0, consults: 0, bestMain: 0 },
    shows: [],
    lastDay: -1,
    paper: null,
    news: [],
    scenes: [],
    plans: {},
    settings: { pace: 'steady', birdieHandles: false, twistSecret: false },
    flags: {},
    notices: [],
    recentText: [],
    seeds: [],
    daily: { day: -1, nudged: [], marks: [], talked: [] },
  };
}

/** The live story state. */
export function S(): StoryState {
  return ext<StoryState>('story', freshState);
}

export function newId(prefix: string): string {
  const s = S();
  return `${prefix}${s.nextId++}`;
}

export function today(): number {
  return absDay(G.time);
}

/** Absolute-day calendar helpers (day 0 is Monday, spring, year 1). */
export const cal = {
  weekday: (d: number) => ((d % 7) + 7) % 7,
  isWed: (d: number) => cal.weekday(d) === 2,
  isSat: (d: number) => cal.weekday(d) === 5,
  isShow: (d: number) => cal.isWed(d) || cal.isSat(d),
  isSuper: (d: number) => d % 28 === 26,
  season: (d: number) => Math.floor((d % 112) / 28),
  venue: (d: number): Venue => (cal.isWed(d) ? 'vfw' : 'sportatorium'),
  kind: (d: number): 'wednesday' | 'saturday' | 'supershow' => (cal.isWed(d) ? 'wednesday' : cal.isSuper(d) ? 'supershow' : 'saturday'),
  nextShow(after: number): number {
    let d = after + 1;
    while (!cal.isShow(d)) d++;
    return d;
  },
  /** Show days d with from <= d (inclusive), count of them. */
  showsFrom(from: number, count: number): number[] {
    const out: number[] = [];
    let d = from;
    while (out.length < count) {
      if (cal.isShow(d)) out.push(d);
      d++;
    }
    return out;
  },
  showsBetween(from: number, to: number): number[] {
    const out: number[] = [];
    for (let d = from; d <= to; d++) if (cal.isShow(d)) out.push(d);
    return out;
  },
  nextSuper(from: number): number {
    let d = from;
    while (!cal.isSuper(d)) d++;
    return d;
  },
  dayLabel(d: number): string {
    const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][cal.weekday(d)];
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    return `${wd} ${(d % 28) + 1} ${seasons[cal.season(d)]}`;
  },
  relLabel(d: number, now: number): string {
    const diff = d - now;
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (diff === 0) return 'Tonight';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1 && diff < 7) return names[cal.weekday(d)];
    if (diff >= 7 && diff < 14) return `Next ${names[cal.weekday(d)].slice(0, 3)}`;
    return cal.dayLabel(d);
  },
};

/** Seeded RNG for a given purpose (save seed + day + salt), so reloads never reroll. */
export function rngFor(salt: string, day = today()): Rng {
  return new Rng(hashString(`${G.seed}:${day}:${salt}`));
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function notice(text: string): void {
  const s = S();
  s.notices.push(text);
  if (s.notices.length > 12) s.notices.shift();
}

export function pushNews(item: Omit<NewsItem, 'day'> & { day?: number }): void {
  const s = S();
  s.news.push({ day: item.day ?? today(), headline: item.headline.toUpperCase(), text: item.text, storyId: item.storyId, weight: item.weight });
  if (s.news.length > 30) s.news.splice(0, s.news.length - 30);
}

export function storyLog(st: Storyline, text: string, day = today()): void {
  st.log.push({ day, text });
  if (st.log.length > 40) st.log.shift();
}
