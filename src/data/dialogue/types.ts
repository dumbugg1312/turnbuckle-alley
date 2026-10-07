import type { Rank, Weather } from '../../core/state';

/**
 * Dialogue content contract. Each character has one file in this folder
 * exporting a DialogueSet; index.ts collects them.
 *
 * Text supports *red emphasis*, **teal bold**, and placeholders:
 * {name} player's real name, {ring} ring name, {they}/{them}/{their} player
 * pronouns (capitalised variants work too).
 *
 * Memory placeholders (world/memory.ts), only safe on lines gated by the
 * matching condition: {opponent} {opp} {finisher} {myFinisher} {venue}
 * {stars} need `lastMatch`; {lastGift} needs `giftedRecently`; {subject}
 * needs `news`. Gift replies can use {item}.
 */
export type Place = 'public' | 'insider' | 'home' | 'show';

export interface Cond {
  /** Inclusive heart range, 0..10 (14 when dating). */
  hearts?: [number, number];
  /** Where the conversation happens. 'insider' = back booth, locker room, Birdie's office, any insider's home with only insiders present. */
  place?: Place[];
  map?: string[];
  weekday?: number[]; // 0 Mon .. 6 Sun
  season?: number[]; // 0 Spring .. 3 Winter
  weather?: Weather[];
  /** Minutes from midnight, inclusive range. */
  time?: [number, number];
  flag?: string;
  notFlag?: string;
  /** True on Wednesday/Saturday show days. */
  showDay?: boolean;
  rank?: Rank[];
  dating?: boolean;
  married?: boolean;
  /** Player alignment in the ring. */
  alignment?: ('face' | 'heel' | 'tweener')[];
  /**
   * The player's most recent show match. Fails if they haven't had one.
   * maxDaysAgo defaults to 7 so nobody brings up a match from last season.
   */
  lastMatch?: {
    won?: boolean;
    maxDaysAgo?: number;
    minDaysAgo?: number;
    /** Opponent NPC ids. Leave it out and the line never fires for the person you wrestled. */
    opponent?: string[];
    venue?: ('vfw' | 'sportatorium')[];
    minStars?: number;
    maxStars?: number;
    /** A belt was on the line. */
    title?: boolean;
  };
  /** You gave this person something between minDays (default 1) and maxDays days ago. */
  giftedRecently?: { maxDays: number; minDays?: number; item?: string[] };
  /** Days since you last talked (before today), inclusive range. Fails when there is no record. */
  daysSinceTalk?: [number, number];
  /** A piece of town news (world/memory.ts) happened in the last `newsDays` days (default 7). */
  news?: string;
  newsDays?: number;
}

export interface Line {
  /** One string = one box; an array = several boxes in a row. */
  text: string | string[];
  when?: Cond;
  /** Portrait expression for the first box. */
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'smug' | 'love';
  /** Relative pick weight (default 1). */
  weight?: number;
  /** Say it once, ever. */
  once?: boolean;
}

/** API given to scripted heart events and story moments. */
export interface EventApi {
  /** A line from a character (id), or 'narrator'. */
  say(who: string, ...lines: string[]): Promise<void>;
  /** Same as say, with a portrait expression. */
  sayMood(who: string, mood: Line['mood'], ...lines: string[]): Promise<void>;
  narrate(...lines: string[]): Promise<void>;
  /** Ask the player; returns the chosen value. */
  choose<T extends string>(prompt: string | null, options: { label: string; value: T; hint?: string }[], who?: string): Promise<T>;
  hearts(npc: string, delta: number): void;
  flag(name: string, value?: number | string | boolean): void;
  hasFlag(name: string): boolean;
  give(item: string, n?: number): void;
  money(delta: number): void;
  /** Fade to black and back (scene break). */
  fade(): Promise<void>;
  /** Teach the player a move card (adds to deck) or a story card. */
  learnCard(cardId: string): void;
  learnStoryCard(cardId: string): void;
  playerName: string;
}

export interface HeartEvent {
  id: string;
  /** Hearts needed (2, 4, 6, 8, 10, 12, 14). */
  hearts: number;
  /** Map id where it can trigger when you talk to them (omit = anywhere). */
  map?: string;
  when?: Cond;
  /** Short title for the relationship journal. */
  title: string;
  script: (api: EventApi) => Promise<void>;
}

export interface DialogueSet {
  npc: string;
  /** First meeting. */
  intro: string[];
  /** If the first meeting happens in public as an insider, kayfabe version (optional). */
  introPublic?: string[];
  lines: Line[];
  gifts: { loves: string[]; likes: string[]; dislikes: string[] };
  giftReplies: {
    love: string[];
    like: string[];
    neutral: string[];
    dislike: string[];
    /** Birthday replies. Each one should be this person's own; {item} names the gift. */
    birthday?: string[];
    /** Checked first: a reply for one particular item, by item id. */
    byItem?: Record<string, string | string[]>;
    /** For items they feel nothing special about, by item category (food, flea, nature...). */
    byCat?: Record<string, string | string[]>;
    /** Brought up a few days later, about the last thing you gave them ({lastGift}). */
    later?: string[];
  };
  /** Talking a second or third time the same day: short brush-offs or continuations. */
  again?: string[];
  /** When nothing else fits. Replaces the old town-wide stock lines. */
  idle?: string[];
  birthday?: { season: number; day: number };
  events: HeartEvent[];
}
