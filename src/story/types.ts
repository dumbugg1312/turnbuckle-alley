/**
 * Storyline system: the content contract (data shapes) shared by the data
 * files in src/story/data/ and the engine. Design: docs/STORYLINES.md §15.
 *
 * TEXT TEMPLATES. Every `string` marked "template" below may use:
 *   {ROLE}            kayfabe display name of whoever fills that role, e.g. {hero}, {villain},
 *                     {ally}, {mentor}. Names that start with "the" are stored lowercase
 *                     ("the Mountain"); sentence starts are capitalised automatically.
 *   {ROLE.real}       real first name (ONLY in insider-voice text: booth/epilogue lines).
 *   {ROLE.finisher}   finisher move name.   {ROLE.signature}  signature move name.
 *   {ROLE.their} {ROLE.them} {ROLE.theirs}  pronouns (safe anywhere).
 *   {ROLE.they} / {ROLE.They}  subject pronoun. AVOID before a verb ("they wins" breaks
 *                     when the player uses they/them). Repeat the name instead.
 *   {winner} {loser}  (payoff / ending / finish text only) display names of the result.
 *   {winner.finisher} etc. also work.
 *   {title}           the belt in play ("the ACW Heavyweight Championship"), or "bragging rights".
 *   {venue}           "the VFW Hall" / "the Sportatorium" / supershow name.
 *   {story}           the storyline's title (Gus names it).
 *   {hook} {twist} {stakes} {payoff}   names of the napkin cards.
 *   [[a|b|c]]         random alternation (options may contain other tokens).
 * Card templates (CardDef) may use only {hero}, {villain}, {winner}, {loser} and the
 * globals, because a card works in any shape.
 * The player can fill ANY role: write in third person, never "you".
 *
 * TONE RULES (absolute): kayfabe holds in every public/show/Tattler text (it is all
 * real to the town). No death or death imagery, ever (no caskets, funerals, graves,
 * wakes, "buried", memorials, "RIP", "killed", "dead"). No gore/blood. Nothing mean:
 * villains are ornery, never cruel. Humor never punches down: never mock bodies,
 * identities, money, intelligence, accents, disabilities. Marks are never targeted,
 * pranked or embarrassed. Kids are never frightened. Animals are always fine.
 * Grandma Dottie's memory is never story material. Tiny's size is never mocked
 * (a villain may mock her CAKES, never her body). Gideon never loses his hair.
 * The Mothman is never unmasked, never speaks, only appears at night (Saturdays).
 */

import type { Rank } from '../core/state';

export type CardId = string;
export type ShapeId = string;
export type RoleKey = string;
export type TraitId =
  | 'vain' | 'anxious' | 'proud' | 'gentle' | 'showboat' | 'traditionalist' | 'mischievous'
  | 'family_first' | 'competitive' | 'romantic' | 'dreamer' | 'loyal' | 'private'
  | 'analytical' | 'superstitious' | 'grumpy' | 'nurturing';

export type Slot = 'hook' | 'twist' | 'stakes' | 'payoff' | 'segment' | 'wildcard';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type CardSource = 'starter' | 'tape' | 'insider_story' | 'life_event' | 'dungeon' | 'fan_mail' | 'town' | 'main_story';
export type StoryAlign = 'hero' | 'villain' | 'tweener';
export type Mood = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'smug' | 'love';

export const CARD_TAGS = [
  'comedy', 'drama', 'heartfelt', 'whimsy', 'spectacle', 'mat_classic',
  'betrayal', 'romance', 'family', 'legacy', 'hometown', 'big_city', 'leaving',
  'mask', 'hair', 'title', 'tag', 'faction', 'outsider', 'mystery',
  'night', 'supernatural', 'violence_low', 'violence_mid', 'hardcore',
  'high_risk', 'cage', 'humiliation_light', 'mess', 'food', 'animal',
  'kids_spotlight', 'public', 'real_life', 'live_mic', 'rehearsed', 'improv',
  'swerve', 'prank', 'rules', 'crime_kayfabe', 'injury_worked', 'career_ending',
  'old_school', 'spotlight', 'entrance', 'gear', 'supershow',
  'clean_finish', 'schmozz', 'slow_build', 'menace', 'solemn',
] as const;
export type CardTag = (typeof CARD_TAGS)[number];

export type FlopCause = 'weak_matches' | 'no_heat' | 'personality_mismatch' | 'fatigue' | 'stakes_dont_matter' | 'too_long';

/** What appears on the show card (matches the api.ts Segment kinds) plus off-card beat kinds. */
export type SegKind = 'match' | 'promo' | 'angle' | 'contract' | 'interview' | 'run-in';
export type BeatKind = SegKind | 'town' | 'wrsl' | 'booth';

export type BeatPurpose =
  | 'hook' | 'establish' | 'heat' | 'segment' | 'twist' | 'stakes' | 'gohome' | 'payoff'
  | 'epilogue' | 'town' | 'wrsl' | 'tease' | 'turn' | 'filler';

export type TitleId = 'heavyweight' | 'tag' | 'wednesday';

/** Match stipulation ids passed to the match system as MatchSpec.stipulation. */
export type Stip =
  | 'standard' | 'tag' | 'two-of-three' | 'no-dq' | 'cage' | 'ladder' | 'lumberjack' | 'say-uncle'
  | 'last-standing' | 'battle-royal' | 'pie-eating' | 'bingo-brawl' | 'lights-out' | 'honey-pot'
  | 'object-pole' | 'pop-quiz' | 'hardware-brawl' | 'iron-hour' | 'bandana' | 'haunted-house'
  | 'snowball' | 'hay-bale' | 'four-corners' | 'farewell';

/**
 * Card requirements. The engine checks them when choosing cards; anything unmet
 * is filtered out (the card stays in the Tin).
 */
export type CardReq =
  | { kind: 'allies' }                      // hero and villain (or hero and ally) are partners/tag team
  | { kind: 'twins' }                       // the Bruiser Twins are both in the story
  | { kind: 'masked' }                      // a masked wrestler is in the cast (Mariposa, the Dust Devil, the Mothman)
  | { kind: 'mothman' }                     // the Mothman agrees to appear (night only)
  | { kind: 'night' }                       // a beat that needs a night show (Saturday / supershow)
  | { kind: 'saturday' }                    // payoff must land on a Saturday or supershow
  | { kind: 'supershow'; season?: number }  // payoff must land on a supershow (0 Thaw Brawl, 1 Fairgrounds Fury, 2 Harvest Havoc, 3 Homecoming)
  | { kind: 'vfw' }                         // Wednesday (VFW Hall) only
  | { kind: 'season'; seasons: number[] }   // 0 spring, 1 summer, 2 fall, 3 winter
  | { kind: 'participants'; min: number }   // wrestlers needed in the payoff
  | { kind: 'hearts'; who: string; min: number } // player's hearts with an NPC
  | { kind: 'flag'; flag: string }
  | { kind: 'rank'; min: Rank }
  | { kind: 'history' }                     // hero and villain have wrestled before (archive)
  | { kind: 'archive' }                     // at least one finished storyline exists
  | { kind: 'returning' }                   // someone is returning (injury, road trip, left town)
  | { kind: 'title' }                       // a championship is in the story
  | { kind: 'never' };                      // never chosen procedurally (signature / main story only)

export type StakesOutcome =
  | 'title' | 'pride' | 'leave_town' | 'mask' | 'hair' | 'career' | 'costume' | 'pie' | 'custody'
  | 'main_event' | 'family_name' | 'apology' | 'town_honor' | 'story_hour' | 'building';

export interface CardBeat {
  kind: SegKind | 'town' | 'wrsl';
  /** Show-card line (template), e.g. "Contract signing: {hero} & {villain}". */
  title: string;
  /** 2+ variants, 1–3 kayfabe sentences each (template). */
  text: string[];
  /** 1+ Tattler headline variants, ALL CAPS, written as real news (template). */
  headline: string[];
}

export interface CardDef {
  id: CardId;                 // 'HK-01'
  name: string;               // 'The Sneak Attack'
  slot: Slot;
  /** One line for the index card, plain voice (UI). */
  blurb: string;
  rarity: Rarity;
  sources: CardSource[];
  tags: CardTag[];
  requires?: CardReq[];
  /** Hooks, twists, segments, wildcards: the beat this card creates. */
  beat?: CardBeat;
  /** Payoff cards: the match it books. */
  payoff?: {
    stip: Stip;
    /** Card line, e.g. "Steel Cage: {hero} vs. {villain}". */
    title: string;
    /** 2+ variants describing the payoff match with its result ({winner} / {loser}). */
    text: string[];
    headline: string[];
  };
  /** Stakes cards: how they're declared and paid off. */
  stakes?: {
    outcome: StakesOutcome;
    /** Declaration beat summary variants (template; usually a contract signing or promo). */
    declare: string[];
    /** One sentence appended to the payoff summary (template, uses {winner}/{loser}). */
    resolve: string[];
    headline: string[];
  };
  /** Twists and wildcards: rescue power at a huddle (default by rarity 15/20/25/35). */
  rescue?: number;
  /** +10 rescue when the story's flop cause is one of these. */
  fixes?: FlopCause[];
  /** Crowd chants this card tends to produce (ALL CAPS). */
  chants?: string[];
}

// ------------------------------------------------------------------ shapes

export interface ShapeRole {
  /** Every shape has 'hero' and 'villain'. Extra roles use any other key ('ally', 'mentor', 'wedge'...). */
  key: RoleKey;
  /** Napkin label, e.g. "The Betrayed". */
  label: string;
  align: StoryAlign | 'any';
  optional?: boolean;
  /** The player may be cast in this role. */
  player?: boolean;
  /** Must be a masked wrestler (Mariposa, the Dust Devil, the Mothman). */
  masked?: boolean;
  /** Must currently hold this title (the engine casts the champion). */
  champion?: TitleId;
}

export interface BeatDef {
  key: string;
  kind: BeatKind;
  purpose: BeatPurpose;
  /** Matches: the two sides as role keys. '@any' = a wrestler from outside the story. */
  sides?: [RoleKey[], RoleKey[]];
  /** Non-match beats: who appears (role keys). */
  roles?: RoleKey[];
  /** Matches: index of the winning side, or null for a no-contest / schmozz. */
  winner?: 0 | 1 | null;
  /** The winner cheats (villains only). */
  cheat?: boolean;
  /** Dropped first when the story is short. */
  optional?: boolean;
  /** Card line for show beats (template). Off-card beats: a short label for the journal. */
  title: string;
  /** 2+ summary variants, 1–3 sentences, kayfabe (template). Booth beats are insider voice. */
  text: string[];
  /** Tattler headline variants for show/town beats (template). */
  headline?: string[];
  /** Town beats: where it happens ("Tallbridge Bakery", "Main Street", "the water tower"...). */
  place?: string;
}

export interface EndingDef {
  id: string;
  label: string;
  /** Role key of the payoff winner, or null for a draw / no contest. */
  winner: RoleKey | null;
  weight: number;
  /** Extra sentence(s) after the payoff match summary (template). */
  text: string[];
  /** The booth afterward, insider voice (template; may use {ROLE.real}). */
  epilogue: string[];
  headline: string[];
  /** Someone changes alignment as a result. */
  turn?: { who: RoleKey; to: StoryAlign };
}

export interface ShapeDef {
  id: ShapeId;
  name: string;
  register: string;
  /** One line for the napkin / journal (plain voice). */
  blurb: string;
  tags: CardTag[];
  roles: ShapeRole[];
  /** Weeks: [min, default, max]. */
  length: [number, number, number];
  /** Best-fit cards per slot (others may still be used, with less buzz). */
  cards: { hook: CardId[]; twist: CardId[]; stakes: CardId[]; payoff: CardId[] };
  twistAt: 'end_act2' | 'midpoint' | 'finish';
  /** Cast constraints the engine must satisfy to run this shape. */
  needs?: ('twins' | 'allies' | 'masked' | 'title' | 'night' | 'history' | 'returning' | 'mothman' | 'retiring' | 'romance')[];
  /** Act I, II, III outline beats (the hook, twist, stakes and payoff beats come from the napkin cards; don't duplicate them). */
  acts: [BeatDef[], BeatDef[], BeatDef[]];
  endings: EndingDef[];
  /** Words Gus uses to name the story ("Heartbreak", "Turncoat"). */
  gusWords: string[];
  /** Opening "want" lines a pitcher might say (insider voice; may use {hero.real} etc.). */
  wants: string[];
  /** May run as a background NPC-only story. */
  background: boolean;
  /** Roles the player may take when the story is "for you". */
  playerRoles: RoleKey[];
}

// ------------------------------------------------------------------ personalities

export interface Barks {
  love: string[];
  fine: string[];
  counter: string[];
  softNo: string[];
}

export interface TraitDef {
  id: TraitId;
  name: string;
  /** Weight per card tag, typically -3..+3. */
  weights: Partial<Record<CardTag, number>>;
  /** Generic reactions (insider voice) used when a character has no personal bark. */
  barks: Barks;
}

export interface RedLineDef {
  id: string;                       // 'gideon.hair'
  cards?: CardId[];
  tags?: CardTag[];
  shapes?: ShapeId[];
  /** Roles they will never play (e.g. 'betrayer' style roles as role keys). */
  roles?: RoleKey[];
  /** Spoken when the red line is hit (insider voice, in character). */
  line: string;
  /** A self-chosen crossing (signature storylines only). */
  unlessFlag?: string;
}

export interface SpinDef {
  replaces: CardId;
  with: CardId;
  /** What they say offering the spin (insider voice). */
  line: string;
}

export interface Personality {
  id: string;                       // npc id ('mariposa', 'earl', ...)
  traits: TraitId[];
  loves: (CardTag | CardId)[];
  redLines: RedLineDef[];
  spins: SpinDef[];
  /** 0..100 how much screen time they crave. */
  spotlight: number;
  /** 0..100 how much losing stings. */
  ego: number;
  /** -2..+3 how easily the crowd starts cheering them as a villain (or stays with them as a hero). */
  lovable: number;
  /** Nouns Gus can build a story title from ("Sequin", "Library", "Cruller"). */
  motifs: string[];
  /** Pitch openers: what they WANT (insider voice). 4+. */
  wants: string[];
  /** Public nudges: in-character, kayfabe-safe hints that they want to talk in private. 4+. */
  nudges: string[];
  /** Said when the player agrees to hear a pitch (insider voice). 2+. */
  opener: string[];
  /** Said when the napkin gets signed (insider voice). 2+. */
  signoff: string[];
  /** Post-show booth chatter, insider voice (not pitches). 3+. */
  booth: string[];
  /** Personal reactions, overriding trait barks (insider voice). */
  barks: Partial<Barks>;
  /** Shapes they like to pitch. */
  shapes: ShapeId[];
  /** Can sit down and pitch (false for the Mothman, who leaves notes). */
  canPitch: boolean;
}

// ------------------------------------------------------------------ Tattler, match text, Birdie

export interface TownItem {
  text: string;
  /** Only in these seasons (0..3). */
  season?: number[];
  /** Only on these weekdays (0 Mon .. 6 Sun). */
  weekday?: number[];
  weight?: number;
}

export type ReviewTier = 'snooze' | 'meh' | 'solid' | 'great' | 'rave';

export interface TattlerData {
  /** Clementine's review text by tier. Tokens: {show} show name, {best} best match line, {worst}, {mainEvent}, {venue}, {crowd} attendance word. 2–3 sentences. */
  reviews: Record<ReviewTier, string[]>;
  /** After a flop gets saved. */
  retractions: string[];
  /** Front-page headlines about a show by tier. Tokens: {show}, {mainWinner}, {mainLoser}. */
  showHeadlines: Record<ReviewTier, string[]>;
  /** Generic storyline headlines if a beat has none. Tokens: {hero}, {villain}, {story}. */
  storyHeadlines: Partial<Record<BeatPurpose, string[]>>;
  /** Organic turn headlines. Tokens: {who}. */
  turnHeadlines: string[];
  /** Small-town items. 150+. */
  townItems: TownItem[];
  /** Sheriff Bev's police blotter (kayfabe "crimes" by villains, real tiny-town calls). Tokens: {villain}. */
  blotter: string[];
  /** Letters to the editor (Lavinia's commas, Agnes on refereeing...). */
  letters: string[];
  /** Small ads for town businesses. */
  ads: string[];
  /** Pip's cardboard sign of the week. Tokens: {hero}, {villain}. */
  pipSigns: string[];
  /** "Ringside Stars" horoscopes. */
  horoscopes: string[];
  /** Sweet Lou's fishing report. */
  fishing: string[];
  /** Fenwick's Mothman corner (never reveals anything). */
  mothman: string[];
}

export interface MatchTextData {
  /** Openers keyed by style pair "a|b" (alphabetical, from NPC wrestler styles: powerhouse giant highflyer luchador technician brawler showman, plus "rookie") or "any". Tokens {a} {b}. */
  openers: Record<string, string[]>;
  /** Finishes. Tokens {winner} {loser} {winner.finisher} {winner.signature}. */
  finishes: { clean: string[]; cheat: string[]; upset: string[]; tag: string[]; title: string[]; noContest: string[] };
  /** Optional color sentences (mark reactions, Gus, Jobber...). */
  color: string[];
  /** Background (non-story) promo segments. Tokens {a} (speaker), {b} (target). */
  promos: string[];
  /** Non-wrestler crew segments to fill a card. */
  crew: { title: string; text: string[]; participants: string[]; venue?: 'vfw' | 'sportatorium' }[];
  /** Pre-bell hype for the player's match. Tokens {player} {opp} {opp.finisher}, insider hint from Birdie allowed in a separate list. */
  playerIntros: string[];
  /** Birdie's backstage note before a booked loss ("make him look like a million bucks"). Tokens {opp}, {opp.real}. */
  putOverNotes: string[];
  /** Birdie's note before a booked win. */
  winNotes: string[];
}

export interface SceneLine {
  /** 'birdie', 'narrator', 'player', or another npc id. */
  who: string;
  text: string;
  mood?: Mood;
}

export type BirdieReason = 'draw' | 'card_fit' | 'roster_wellbeing' | 'ornery_line' | 'rank' | 'venue' | 'fatigue' | 'prop_unready' | 'main_story';

export interface BirdieData {
  approve: string[];
  tweak: Partial<Record<BirdieReason, string[]>>;
  veto: Partial<Record<BirdieReason, string[]>>;
  notYet: string[];
  pleaWin: string[];
  pleaLose: string[];
  /** Promotion scenes. `publicLines`: Commissioner voice, kayfabe-safe (only used up to 'main'). `scene`: the private scene in her office. */
  promotions: Partial<Record<Rank, { publicLines: string[]; note: string; scene: SceneLine[] }>>;
  /** "Birdie's two cents" on a booked card. */
  twoCents: { good: string[]; weakOpener: string[]; flatMain: string[]; noVillains: string[]; noHeroes: string[]; repetitive: string[]; empty: string[] };
  /** Huddle / flop / turn-pressure / extension lines (insider). */
  huddle: string[];
  flopTease: string[];
  extend: string[];
  offScript: string[];
  /** After a show, Birdie's one-liner to the player about their match. Tokens {opp}. */
  afterPutOver: string[];
  afterWin: string[];
  /** When the player books a show she has filled holes in. */
  filledHoles: string[];
}
