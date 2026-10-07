import type { Look } from '../gfx/look';

export type CardType = 'strike' | 'grapple' | 'aerial' | 'submission' | 'sell' | 'taunt' | 'setup' | 'signature' | 'finisher' | 'special' | 'power';
export type OppPos = 'standing' | 'groggy' | 'down' | 'cornered' | 'outside';
export type SelfPos = 'standing' | 'top';
export type Role = 'face' | 'heel';

/** The story phases a match moves through. */
export type PhaseId = 'lockup' | 'shine' | 'heat' | 'comeback' | 'stretch' | 'finish' | 'trade';

export interface PhaseDef {
  id: PhaseId;
  name: string;
  /** Who is meant to be on offense in this phase. */
  offense: 'player' | 'opponent' | 'both';
  goal: Goal;
  maxTurns: number;
  hint: string;
}

export type Goal =
  | { kind: 'play'; types: CardType[]; count: number; label: string }
  | { kind: 'crowd'; amount: number; label: string }
  | { kind: 'sympathy'; amount: number; label: string }
  | { kind: 'combo'; count: number; label: string }
  | { kind: 'nearfalls'; count: number; label: string }
  | { kind: 'finish'; label: string };

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  /** Base crowd gain. */
  pop: number;
  /** Stamina ("gas") cost; negative restores. */
  gas: number;
  text: string;
  /** Soft requirement: full effect only if met, sloppy otherwise. */
  needs?: { opp?: OppPos[]; self?: SelfPos[] };
  /** Resulting positions. */
  sets?: { opp?: OppPos; self?: SelfPos };
  draw?: number;
  energy?: number;
  sympathy?: number;
  /** Multiplier applied to the next card's pop this turn. */
  hype?: number;
  /** Sell cards: multiply the crowd value of the opponent's move this turn. */
  sellMult?: number;
  /** Heel tactic: draws boos, counts as heat for heel goals. */
  cheat?: boolean;
  /** Can attempt a pin during the stretch phase. */
  pin?: boolean;
  /** Removed from the deck for the rest of the match once played. */
  exhaust?: boolean;
  /** Botch risk modifier (0 = safe, 1 = risky). */
  risk?: number;
  /** Power cards: persistent effect id. */
  power?: string;
  rarity?: 'starter' | 'common' | 'uncommon' | 'rare' | 'legendary';
  /** Short shout shown when played (commentary). */
  call?: string;
  /** Pose the wrestler strikes in the ring view. */
  anim?: string;
  /** Upgraded version tweaks. */
  plus?: Partial<Pick<CardDef, 'cost' | 'pop' | 'gas' | 'draw' | 'energy' | 'sympathy' | 'hype' | 'sellMult' | 'text'>>;
}

/** The opponent's telegraphed spot ("calling it in the ring"). */
export interface Call {
  kind: 'offense' | 'setup' | 'finisher' | 'cutoff' | 'fireup' | 'rest' | 'cover';
  name: string;
  /** What the partner whispers (shown in the bubble). */
  whisper: string;
  /** Crowd value if sold well (offense calls). */
  pop: number;
  /** Card types this call rewards when played this turn. */
  favors?: CardType[];
  /** Position change applied at the start of the turn (setup calls). */
  sets?: { opp?: OppPos; self?: SelfPos };
  /** Gas damage if not sold. */
  hurt?: number;
  anim?: string;
}

export interface Combatant {
  id: string;
  name: string;
  role: Role;
  look: Look;
  style: string;
  /** 0..10 relationship chemistry; higher = clearer calls. */
  chemistry: number;
  finisherName: string;
  signatureName: string;
}

export interface MatchConfig {
  player: Combatant & { deck: string[]; gear: string[]; maxGas: number; ringIq: number };
  opponent: Combatant;
  /** Booked winner. */
  winner: 'player' | 'opponent';
  venue: 'vfw' | 'sportatorium' | 'dungeon' | 'backyard' | 'fair';
  stipulation?: string;
  title?: string;
  /** What the crowd likes (multipliers per card type). */
  taste?: Partial<Record<CardType, number>>;
  /** Short exhibition (dungeon spars): fewer phases. */
  short?: boolean;
  seed: number;
  storyline?: string;
}

export interface MatchEvent {
  kind: 'play' | 'oppmove' | 'phase' | 'botch' | 'pop' | 'chant' | 'cover' | 'kickout' | 'finish' | 'info' | 'draw' | 'whisper';
  text: string;
  crowd?: number;
  actor?: 'player' | 'opponent';
  anim?: string;
  big?: boolean;
  card?: string;
}

export interface MatchResult {
  stars: number;
  winner: 'player' | 'opponent';
  breakdown: { label: string; value: number; note: string }[];
  peakCrowd: number;
  finalCrowd: number;
  botches: number;
  turns: number;
  highlights: string[];
  crowdCurve: number[];
}
