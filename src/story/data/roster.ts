/**
 * Who's on the roster as far as storylines are concerned: kayfabe names,
 * starting alignments, titles, natural partners and old history.
 * Ring moves and styles come from src/data/npcs.ts (the match system's source).
 */
import type { StoryAlign, TitleId } from '../types';

/** Wrestlers who can be booked. Sweet Lou is limited (one match a year); the Mothman works Saturdays at night only. */
export const WRESTLERS = ['mariposa', 'earl', 'dex', 'gideon', 'bo', 'buck', 'hazel', 'clint', 'tiny', 'professor', 'lou', 'mothman'] as const;
export type WrestlerId = (typeof WRESTLERS)[number];

/** Crew who appear in segments but don't wrestle. */
export const CREW = ['birdie', 'gus', 'mo', 'june', 'hank', 'marigold', 'doc'] as const;

/** How the town says their name (kayfabe). Names starting with "the" are lowercase; sentence starts get capitalised. */
export const KAYFABE_NAME: Record<string, string> = {
  mariposa: 'La Mariposa',
  earl: 'the Mountain',
  dex: 'Dex Delgado',
  gideon: 'Gorgeous Gideon',
  bo: 'Bo Bruiser',
  buck: 'Buck Bruiser',
  hazel: 'Hurricane Hazel',
  clint: 'the Dust Devil',
  tiny: 'Tiny Tallbridge',
  professor: 'Professor Pinfall',
  lou: 'Sweet Lou',
  mothman: 'the Mothman',
  birdie: 'Commissioner Birdie',
  gus: 'Gus Gravel',
  mo: 'Referee Mo',
  june: 'June Oyelaran',
  hank: 'Hank Szabo',
  marigold: 'Marigold',
  doc: 'Doc Halloran',
  pip: 'Pip',
  agnes: 'Agnes Pickett',
  bev: 'Sheriff Bev',
  patty: 'Coach Patty',
  clementine: 'Clementine',
  fenwick: 'Fenwick',
  oakes: 'Mayor Oakes',
  nadia: 'Dr. Nadia',
};

/** Real first names for insider talk. */
export const REAL_NAME: Record<string, string> = {
  mariposa: 'Rosa', earl: 'Earl', dex: 'Dex', gideon: 'Gideon', bo: 'Bo', buck: 'Buck', hazel: 'Hazel',
  clint: 'Clint', tiny: 'Tiny', professor: 'Odessa', lou: 'Lou', mothman: 'the Mothman', birdie: 'Birdie',
  gus: 'Gus', mo: 'Mo', june: 'June', hank: 'Hank', marigold: 'Marigold', doc: 'Doc',
};

/** Starting alignments (CAST.md is authoritative: the Professor is a villain, the Mothman a tweener). */
export const START_ALIGN: Record<string, StoryAlign> = {
  mariposa: 'hero', earl: 'villain', dex: 'hero', gideon: 'villain', bo: 'villain', buck: 'villain',
  hazel: 'hero', clint: 'villain', tiny: 'hero', professor: 'villain', lou: 'hero', mothman: 'tweener',
};

/** Starting crowd sentiment. */
export const START_SENTIMENT: Record<string, number> = {
  mariposa: 55, earl: -45, dex: 50, gideon: -35, bo: -30, buck: -25, hazel: 60, clint: -60, tiny: 50,
  professor: -30, lou: 80, mothman: 20,
};

/** Masked wrestlers. */
export const MASKED = ['mariposa', 'clint', 'mothman'];

/** Natural partners for "allies" stories (tag teams, best friends, mentors). */
export const ALLY_PAIRS: [string, string][] = [
  ['bo', 'buck'], ['earl', 'tiny'], ['gideon', 'hazel'], ['dex', 'mariposa'], ['dex', 'hazel'],
  ['gideon', 'earl'], ['professor', 'lou'], ['clint', 'hazel'], ['tiny', 'dex'], ['mariposa', 'tiny'],
];

/** Pairs with a feud already in the town's memory (for Grudge Match / Rematch Clause). */
export const OLD_HISTORY: [string, string][] = [
  ['gideon', 'mariposa'], ['earl', 'tiny'], ['dex', 'professor'], ['hazel', 'clint'], ['buck', 'dex'],
  ['bo', 'mariposa'], ['professor', 'hazel'], ['earl', 'lou'],
];

export const TITLE_DEFS: Record<TitleId, { name: string; short: string; holders: string[]; prestige: number }> = {
  heavyweight: { name: 'the ACW Heavyweight Championship', short: 'Heavyweight title', holders: ['gideon'], prestige: 62 },
  tag: { name: 'the ACW Tag Team Championship', short: 'Tag titles', holders: ['bo', 'buck'], prestige: 55 },
  wednesday: { name: 'the Wednesday Night Championship', short: 'Wednesday Night title', holders: ['professor'], prestige: 40 },
};

/** Days Hazel stays on the injured list at the start (she's at the commentary desk until Doc clears her). */
export const HAZEL_CLEARED_DAY = 11;
