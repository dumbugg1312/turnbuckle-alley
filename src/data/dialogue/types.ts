import type { Rank, Weather } from '../../core/state';

/**
 * Dialogue content contract. Each character has one file in this folder
 * exporting a DialogueSet; index.ts collects them.
 *
 * Text supports *red emphasis*, **teal bold**, and placeholders:
 * {name} player's real name, {ring} ring name, {they}/{them}/{their} player
 * pronouns (capitalised variants work too).
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
}

export interface Line {
  /** One string = one box; an array = several boxes in a row. */
  text: string | string[];
  when?: Cond;
  /** Portrait expression for the first box. */
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'smug' | 'love';
  /** Relative pick weight (default 1). */
  weight?: number;
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
  giftReplies: { love: string[]; like: string[]; neutral: string[]; dislike: string[]; birthday?: string[] };
  birthday?: { season: number; day: number };
  events: HeartEvent[];
}
