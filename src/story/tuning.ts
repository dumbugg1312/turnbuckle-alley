/**
 * Every storyline number in one place (STORYLINES.md §15.9 "Tuning").
 */
import type { Rank } from '../core/state';

export const T = {
  /** Background NPC-vs-NPC storylines kept running (about one per three roster members). */
  backgroundTarget: 4,
  /** Max storylines a wrestler can lead (hero/villain) at once. */
  leadLimit: 1,
  /** Max storylines a wrestler can appear in at all. */
  castLimit: 2,
  /** Show beats per storyline per show, and show capacity for story beats. */
  capacity: { wednesday: 3, saturday: 5, supershow: 7 } as Record<'wednesday' | 'saturday' | 'supershow', number>,
  /** Segments on a card [min, max]. */
  cardSize: { wednesday: [4, 5], saturday: [5, 6], supershow: [7, 8] } as Record<'wednesday' | 'saturday' | 'supershow', [number, number]>,
  /** Share of a storyline's shows it actually uses. */
  showUse: 0.65,

  // Buzz (§8.2)
  buzzStart: 50,
  buzzPerStar: 6,
  buzzChant: 2,
  fitBonus: 3,
  loveBonus: 5,
  shapeFatigue: 8,
  cardFatigue: 4,
  cooldownDays: 56,
  hot: 75,
  steady: 40,
  cooling: 30,
  signatureFloor: 25,
  maxSaves: 2,
  rescueByRarity: { common: 15, uncommon: 20, rare: 25, legendary: 35 } as const,

  // Sentiment and turns (§8.3)
  turnVillainAbove: 30,
  turnHeroBelow: -20,
  turnStreak: 3,

  // Pitches (§2.3)
  pace: { chatty: 0.75, steady: 0.5, quiet: 0.22 } as Record<'chatty' | 'steady' | 'quiet', number>,
  maxWaitingPitches: 4,
  idleDays: 14,
  /** For-you storylines the player can be in at once, by rank (§7.5). */
  playerStories: { rookie: 1, opener: 1, undercard: 2, midcard: 2, main: 3, assistant: 3, pencil: 4, owner: 4 } as Record<Rank, number>,

  // Player bookings
  /** Chance the player is booked to WIN a non-story match, by rank (early on you put people over). */
  playerWinChance: { rookie: 0.12, opener: 0.22, undercard: 0.36, midcard: 0.5, main: 0.6, assistant: 0.62, pencil: 0.65, owner: 0.65 } as Record<Rank, number>,
  /** Chance the player wins the payoff of their own storyline, by rank. */
  playerPayoffWin: { rookie: 0.45, opener: 0.5, undercard: 0.55, midcard: 0.6, main: 0.68, assistant: 0.7, pencil: 0.7, owner: 0.7 } as Record<Rank, number>,

  // Respect / momentum / fans
  respect: { worked: 3, putOver: 3, finish: 2, perStarAbove: 2, fourStar: 5, offScriptHit: -2, storyDone: 8, storyGreat: 4, consultDone: 3, skipped: 0 },
  momentum: { win: 12, loss: -5, putOverLoss: -2, fourStar: 8, weeklyDecay: 0.85 },
} as const;

/** Career ladder thresholds (src/story/career.ts). */
export interface RankReq {
  respect: number;
  matches: number;
  stories: number;
  bestStars: number;
  fans: number;
  ledger: number;
  minDay: number;
}
export const RANK_REQS: Partial<Record<Rank, RankReq>> = {
  opener: { respect: 15, matches: 2, stories: 0, bestStars: 0, fans: 0, ledger: 0, minDay: 3 },
  undercard: { respect: 45, matches: 5, stories: 0, bestStars: 2.5, fans: 40, ledger: 0, minDay: 10 },
  midcard: { respect: 95, matches: 10, stories: 1, bestStars: 3, fans: 120, ledger: 8, minDay: 24 },
  main: { respect: 175, matches: 18, stories: 2, bestStars: 3.5, fans: 260, ledger: 16, minDay: 49 },
  assistant: { respect: 285, matches: 28, stories: 4, bestStars: 4, fans: 420, ledger: 28, minDay: 98 },
  pencil: { respect: 420, matches: 40, stories: 7, bestStars: 4, fans: 600, ledger: 45, minDay: 160 },
  owner: { respect: 620, matches: 60, stories: 11, bestStars: 4.5, fans: 900, ledger: 65, minDay: 252 },
};
