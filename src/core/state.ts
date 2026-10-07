import { defaultLook, type Look } from '../gfx/look';

export type Dir = 'down' | 'up' | 'left' | 'right';
export type SkillId = 'strength' | 'ringiq' | 'charisma' | 'craft' | 'story';
export type Alignment = 'face' | 'heel' | 'tweener';
export type BackgroundId = 'backyard' | 'amateur' | 'theater' | 'gymrat' | 'superfan';
export type InvolvementMode = 'ask' | 'drive' | 'together' | 'idea';

/** Career ladder. Earning the pencil is the long-term prize. */
export const RANKS = ['rookie', 'opener', 'undercard', 'midcard', 'main', 'assistant', 'pencil', 'owner'] as const;
export type Rank = (typeof RANKS)[number];
export const RANK_NAMES: Record<Rank, string> = {
  rookie: 'Greenhorn',
  opener: 'Opener',
  undercard: 'Undercard',
  midcard: 'Midcard',
  main: 'Main Eventer',
  assistant: 'Assistant Booker',
  pencil: 'Holds the Pencil',
  owner: 'Owner',
};

export interface Persona {
  ringName: string;
  nickname: string;
  hailingFrom: string;
  catchphrase: string;
  alignment: Alignment;
  signatureName: string;
  finisherName: string;
  finisherStyle: 'power' | 'aerial' | 'submission' | 'strike' | 'flashy';
  entrance: { walk: string; taunt: string; pyro: string; light: string };
  theme: { style: string; tempo: number; seed: number };
}

export interface Relationship {
  points: number; // 250 per heart, 10 hearts max (14 when dating)
  talkedToday: boolean;
  giftedToday: boolean;
  giftsThisWeek: number;
  dating?: boolean;
  married?: boolean;
  eventsSeen: string[];
}

export interface ShowResult {
  day: number; // absolute day index
  venue: 'vfw' | 'sportatorium';
  attendance: number;
  gate: number;
  playerStars: number | null;
  headline: string;
  review: string;
}

export interface GameState {
  version: number;
  seed: number;
  createdAt: number;
  playMinutes: number;
  player: {
    name: string;
    pronouns: string;
    background: BackgroundId;
    look: Look;
    ringLook: Look;
    persona: Persona | null;
    money: number;
    energy: number;
    maxEnergy: number;
    skills: Record<SkillId, number>; // xp
    deck: string[]; // card ids; an upgraded card ends with '+'
    gear: string[]; // equipped relic ids
    ownedGear: string[];
    inventory: Record<string, number>;
    map: string;
    x: number;
    y: number;
    facing: Dir;
    fans: number;
    respect: number;
    momentum: number;
    rank: Rank;
    matches: number;
    wins: number;
    bestStars: number;
  };
  time: { year: number; season: number; day: number; minutes: number };
  weather: { today: Weather; tomorrow: Weather };
  relationships: Record<string, Relationship>;
  flags: Record<string, number | string | boolean>;
  showHistory: ShowResult[];
  /** Per-module state, each module owns its own key (see ext()). */
  ext: Record<string, unknown>;
  settings: Settings;
}

export type Weather = 'sun' | 'rain' | 'storm' | 'wind' | 'snow';

export interface Settings {
  involvement: InvolvementMode;
  textSpeed: number; // characters per second
  music: number; // 0..1
  sfx: number; // 0..1
  reduceMotion: boolean;
  autoKickout: boolean;
  showHints: boolean;
}

export const SAVE_VERSION = 1;

export function newState(seed = (Math.random() * 2 ** 31) | 0): GameState {
  return {
    version: SAVE_VERSION,
    seed,
    createdAt: Date.now(),
    playMinutes: 0,
    player: {
      name: 'Rookie',
      pronouns: 'they',
      background: 'backyard',
      look: defaultLook(),
      ringLook: defaultLook(),
      persona: null,
      money: 150,
      energy: 100,
      maxEnergy: 100,
      skills: { strength: 0, ringiq: 0, charisma: 0, craft: 0, story: 0 },
      deck: [],
      gear: [],
      ownedGear: [],
      inventory: {},
      map: 'town',
      x: 0,
      y: 0,
      facing: 'down',
      fans: 0,
      respect: 0,
      momentum: 0,
      rank: 'rookie',
      matches: 0,
      wins: 0,
      bestStars: 0,
    },
    time: { year: 1, season: 0, day: 1, minutes: 360 },
    weather: { today: 'sun', tomorrow: 'sun' },
    relationships: {},
    flags: {},
    showHistory: [],
    ext: {},
    settings: {
      involvement: 'ask',
      textSpeed: 55,
      music: 0.7,
      sfx: 0.8,
      reduceMotion: false,
      autoKickout: false,
      showHints: true,
    },
  };
}

/** The live game state. Replaced wholesale on load/new game. */
export let G: GameState = newState();
export function setState(s: GameState): void {
  G = s;
}

/** Module-owned state slice, created with defaults on first access. */
export function ext<T extends object>(key: string, defaults: () => T): T {
  if (!(key in G.ext)) G.ext[key] = defaults();
  return G.ext[key] as T;
}

export function rel(id: string): Relationship {
  return (G.relationships[id] ??= { points: 0, talkedToday: false, giftedToday: false, giftsThisWeek: 0, eventsSeen: [] });
}

export function hearts(id: string): number {
  return Math.floor(rel(id).points / 250);
}

export function flag(name: string): number | string | boolean | undefined {
  return G.flags[name];
}

export function setFlag(name: string, v: number | string | boolean = true): void {
  G.flags[name] = v;
}

export function addItem(id: string, n = 1): void {
  G.player.inventory[id] = (G.player.inventory[id] ?? 0) + n;
  if (G.player.inventory[id] <= 0) delete G.player.inventory[id];
}

export function hasItem(id: string, n = 1): boolean {
  return (G.player.inventory[id] ?? 0) >= n;
}

/** XP thresholds for skill levels 1..10. */
export const SKILL_XP = [0, 100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000];
export function skillLevel(id: SkillId): number {
  const xp = G.player.skills[id];
  let lvl = 0;
  for (let i = 1; i < SKILL_XP.length; i++) if (xp >= SKILL_XP[i]) lvl = i;
  return Math.min(10, lvl);
}
