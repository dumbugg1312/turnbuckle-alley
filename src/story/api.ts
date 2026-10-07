import type { MatchResult } from '../match/types';

/**
 * Contract between the show-night system (src/systems/shows.ts) and the
 * storyline engine (src/story/). The story engine books every show.
 */
export type Venue = 'vfw' | 'sportatorium';

export interface MatchSpec {
  /** NPC id of the opponent (see src/data/npcs.ts). */
  opponent: string;
  /** Tag partner for the player (NPC id), and second opponent for tag matches. */
  partner?: string;
  opponent2?: string;
  /** The booked finish. */
  winner: 'player' | 'opponent';
  playerRole: 'face' | 'heel';
  opponentRole: 'face' | 'heel';
  /** e.g. 'standard', 'ladder', 'cage', 'mud', 'hay-wagon', 'lumberjack', 'mask-vs-hair'. */
  stipulation?: string;
  /** Title on the line (belt id), if any. */
  title?: string;
  /** One-line hype shown before the bell. */
  intro?: string;
}

export interface Segment {
  id: string;
  kind: 'match' | 'promo' | 'angle' | 'contract' | 'interview' | 'run-in';
  /** Short card line, e.g. "Big Earl vs. Tiny Tallbridge". */
  title: string;
  participants: string[]; // npc ids and/or 'player'
  /** The player is in this segment (their match, promo or run-in). */
  playerInvolved: boolean;
  match?: MatchSpec;
  /** What happens, shown if the player watches (non-player segments) or as a recap. */
  summary?: string;
  storylineId?: string;
  /** Where on the card: 'opener' | 'mid' | 'main'. */
  slot: 'opener' | 'mid' | 'main';
}

export interface ShowCard {
  venue: Venue;
  /** "Wednesday Night Wrestling" / "Saturday Night at the Sportatorium" / supershow name. */
  name: string;
  segments: Segment[];
}

export interface Paper {
  headline: string;
  /** Short paragraphs: the Tattler's coverage, rumors, ads. */
  body: string[];
  /** Clementine's star review of last night's show, if there was one. */
  review?: { stars: number; text: string };
}

export interface StoryApi {
  /** Called at the start of every show night to build tonight's card. */
  bookTonight(venue: Venue, supershow: string | null): ShowCard;
  /** Report the player's match result for a segment. */
  reportMatch(segmentId: string, result: MatchResult): void;
  /** Report a non-player segment that resolved (always, whether watched or not). */
  reportSegment(segmentId: string): void;
  /** The player skipped tonight's show (it still happened). */
  reportSkipped(card: ShowCard): void;
  /** Tomorrow morning's Turnbuckle Tattler (null if nothing to report). */
  morningPaper(): Paper | null;
  /** Open the storyline journal / Birdie's corkboard UI. */
  openJournal(): Promise<void>;
}
