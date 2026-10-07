/**
 * Old tapes: the fishing of Turnbuckle Alley. Types shared by the catalog,
 * the crate dig, the VCR mini-game and the library. Pure data, no DOM.
 */

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

/**
 * Where tapes turn up. 'flea' and 'fenwick' have crates on the map. On
 * weekends the third flea-market crate is somebody's yard sale box. 'dump' and
 * 'library' are defined so the world team can drop a crate there any time.
 */
export type BinId = 'flea' | 'fenwick' | 'yard-sale' | 'dump' | 'library';

/** How a tape was made, which decides its look on the TV. */
export type TapeFormat = 'broadcast' | 'camcorder' | 'kinescope' | 'retail' | 'radio';

/** Where the match on the tape happened. */
export type Venue = 'sportatorium' | 'vfw' | 'armory' | 'fairgrounds' | 'barn' | 'arena' | 'backyard' | 'studio' | 'gym';

/** What the TV shows while a moment plays. Move cards pick theirs from the card's animation. */
export type Spot =
  | 'strike' | 'kick' | 'slam' | 'suplex' | 'aerial' | 'hold' | 'pin' | 'taunt' | 'dive' | 'lift' | 'spin' | 'sell'
  | 'promo' | 'crowd' | 'entrance' | 'ladder' | 'table' | 'lights-out' | 'mask' | 'belt-missing' | 'box' | 'parking'
  | 'closeup-belt' | 'scout' | 'teardown' | 'broken-belt' | 'aisle' | 'birthday' | 'porch-light' | 'snow' | 'mud' | 'bars' | 'song';

/** The tracking clear-zone's personality (Stardew-style fish behavior). */
export type Wobble = 'smooth' | 'mixed' | 'dart' | 'sinker' | 'floater';

export type Reward =
  | { kind: 'move'; card: string }
  | { kind: 'story'; card: string }
  | { kind: 'hammers'; edition: string }
  | { kind: 'line'; text: string; line: 'promo' | 'chant' }
  | { kind: 'design'; design: string }
  | { kind: 'clue'; flag: string; title: string; narration: string[] };

export interface MomentDef {
  /** Unique within the tape. Stored in library[tape].caught. */
  id: string;
  /** Shown when caught, e.g. "The Royal Decree". */
  name: string;
  reward: Reward;
  /** 1 (gentle) .. 5 (nasty). Defaults from the tape's rarity. */
  difficulty?: number;
  wobble?: Wobble;
  /** Override what the TV shows. */
  spot?: Spot;
  /** Override who is on screen: [attacker, opponent]. Cast ids from cast.ts. */
  who?: [string, string];
  /** A line of commentary that scrolls under the moment (optional flavor). */
  call?: string;
  /** A second reward granted with the first (e.g. a Hammers edition). */
  also?: Reward;
}

export interface TapeDef {
  id: string;
  /** Sharpie spine label, short and messy, as written on the tape. */
  label: string;
  /** Full title for the library. */
  title: string;
  rarity: Rarity;
  year: number;
  /** Fictional promotion, station or "home video". */
  promo: string;
  /** Base price in dollars (bins scale it). */
  price: number;
  bins: BinId[];
  /** Only found in these seasons (0 spring .. 3 winter). Omit for all year. */
  seasons?: number[];
  /** Found far more often in this weather (x3), e.g. rain. */
  weather?: 'rain' | 'snow';
  /** Only found in this weather. */
  weatherOnly?: 'rain' | 'snow';
  /** Only in weekend crates. */
  weekendOnly?: boolean;
  /** Story gating: all flags must be set and you must own this many tapes. */
  requires?: { flags?: string[]; minOwned?: number };
  /** Names on the tape (library card), fictional plus townsfolk in their youth. */
  wrestlers: string[];
  /** Cast ids (cast.ts) for the match on screen: [a, b]. */
  cast: [string, string];
  /** Referee cast id (e.g. 'danny' for Doc in 1978-83). */
  ref?: string;
  /** Someone at ringside (a manager, a fan with a sign). */
  ringside?: string;
  venue: Venue;
  format: TapeFormat;
  /** Copy generation 1..4: more noise, more bleed. */
  gen: number;
  /** One line for the library card. */
  blurb: string;
  moments: MomentDef[];
  /** Spine look. */
  spine: SpineStyle;
  /** Always shows up with a blank or scraped spine. */
  mystery?: boolean;
  /** Stickers on the spine. */
  stickers?: string[];
  /** Picture tint override (e.g. sepia home movie). */
  tint?: 'bw' | 'sepia' | 'warm' | 'cool';
  /** Opening title card text on the TV. */
  card?: string;
}

export type SpineStyle =
  | { kind: 'bare' } // black cassette, white sticker label
  | { kind: 'white' } // white cardboard sleeve, marker straight on it
  | { kind: 'retail'; color: string; ink: string } // printed sleeve
  | { kind: 'clamshell'; color: string } // chunky plastic case
  | { kind: 'scraped' }; // label peeled off

export interface BinDef {
  id: BinId;
  name: string;
  /** Hand-lettered sign on the crate. */
  sign: string;
  /** Rarity weights. */
  weights: Record<Rarity, number>;
  /** Weekend weights (flea market only). */
  weekendWeights?: Record<Rarity, number>;
  /** How many tapes in the crate: [min, max]. */
  count: [number, number];
  weekdayCount?: [number, number];
  /** Price multiplier. */
  priceMul: number;
  /** Flat price for mystery tapes. */
  mysteryPrice: number;
  /** Chance a tape shows up with its label gone. */
  mysteryChance: number;
  /** Chance that one tape in today's crate is free. */
  freeChance: number;
  /** Fenwick will haggle here. */
  haggle: boolean;
}

/** One tape sitting in today's crate. */
export interface CrateSlot {
  tape: string;
  price: number;
  /** Label hidden until bought. */
  mystery: boolean;
  free: boolean;
}

/** The library entry shape (the pause menu counts Object.keys(library)). */
export interface LibraryEntry {
  watched: boolean;
  caught: string[];
  /** Absolute day it was last watched (one viewing per tape per day). */
  day?: number;
  /** Absolute day it was acquired. */
  got?: number;
}

export interface SavedLine {
  id: string;
  text: string;
  kind: 'promo' | 'chant';
  tape: string;
}

export interface TapesState {
  library: Record<string, LibraryEntry>;
  /** Crate key -> last absolute day it was dug. */
  binSeen: Record<string, number>;
  /** `${crateKey}@${day}` -> tape ids already bought from that crate that day. */
  bought: Record<string, string[]>;
  /** Duplicate copies kept for trading and gifting. */
  spares: Record<string, number>;
  /** Promo lines and crowd chants caught on tapes (for promos and segments). */
  lines: SavedLine[];
  /** Gear design ids (see DESIGNS) Marigold can sew. */
  designs: string[];
  /** Hammers-edition story cards (see HAMMERS_EDITIONS). */
  hammers: string[];
  /** Duplicate story-card catches: gold stars (max 3). */
  storyStars: Record<string, number>;
  /** `${crateKey}:${tape}` -> day Fenwick was haggled with over it. */
  haggled: Record<string, number>;
  /** `${crateKey}:${tape}` -> the price Fenwick came down to (valid on the haggled day). */
  haggledPrice: Record<string, number>;
  tutorial: { dig: boolean; watch: boolean; library: boolean };
  stats: { dug: number; bought: number; watched: number; caught: number; lost: number; perfect: number };
}
