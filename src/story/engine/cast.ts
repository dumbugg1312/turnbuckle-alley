/**
 * Character helpers for the storyline engine: names, pronouns, moves,
 * alignment, availability and crowd sentiment.
 */
import { G, hearts as heartsOf } from '../../core/state';
import { NPC_BY_ID } from '../../data/npcs';
import { KAYFABE_NAME, MASKED, REAL_NAME, START_ALIGN, START_SENTIMENT, WRESTLERS } from '../data/roster';
import type { StoryAlign } from '../types';
import { S, cal, clamp, type CharState } from './state';

export const PLAYER = 'player';

export function playerAlign(): StoryAlign {
  const a = G.player.persona?.alignment;
  return a === 'heel' ? 'villain' : a === 'tweener' ? 'tweener' : 'hero';
}

export function charState(id: string): CharState {
  const s = S();
  let c = s.chars[id];
  if (!c) {
    c = s.chars[id] = {
      align: START_ALIGN[id] ?? 'hero',
      sentiment: START_SENTIMENT[id] ?? 0,
      streak: 0,
      morale: 70,
      matches: 0,
      wins: 0,
      learnedRedLines: [],
      signaturesDone: [],
    };
  }
  return c;
}

export function alignOf(id: string): StoryAlign {
  if (id === PLAYER) return playerAlign();
  return charState(id).align;
}

/** face/heel for the match system. */
export function roleOf(id: string, opposite?: string): 'face' | 'heel' {
  const a = alignOf(id);
  if (a === 'hero') return 'face';
  if (a === 'villain') return 'heel';
  if (opposite) return alignOf(opposite) === 'villain' ? 'face' : 'heel';
  return 'face';
}

export function playerRingName(): string {
  return G.player.persona?.ringName || G.player.name || 'the Rookie';
}

/** Kayfabe display name (lowercase "the" for "the Mountain"). */
export function nameOf(id: string): string {
  if (id === PLAYER) return playerRingName();
  return KAYFABE_NAME[id] ?? NPC_BY_ID[id]?.short ?? id;
}

/** Display name with a capital first letter (for card titles and headers). */
export function NameOf(id: string): string {
  const n = nameOf(id);
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export function realOf(id: string): string {
  if (id === PLAYER) return G.player.name || 'kid';
  return REAL_NAME[id] ?? NPC_BY_ID[id]?.short ?? id;
}

export function finisherOf(id: string): string {
  if (id === PLAYER) return G.player.persona?.finisherName || 'the finisher';
  return NPC_BY_ID[id]?.wrestler?.finisher ?? 'a finisher';
}

export function signatureOf(id: string): string {
  if (id === PLAYER) return G.player.persona?.signatureName || 'a signature move';
  return NPC_BY_ID[id]?.wrestler?.signature ?? 'a signature move';
}

export function styleOf(id: string): string {
  if (id === PLAYER) return 'rookie';
  return NPC_BY_ID[id]?.wrestler?.style ?? 'brawler';
}

export function levelOf(id: string): number {
  if (id === PLAYER) {
    const ranks = ['rookie', 'opener', 'undercard', 'midcard', 'main', 'assistant', 'pencil', 'owner'];
    return 2 + Math.min(3, ranks.indexOf(G.player.rank) * 0.5);
  }
  return NPC_BY_ID[id]?.wrestler?.level ?? 3;
}

export interface Pronouns { they: string; them: string; their: string; theirs: string }
export function pronounsOf(id: string): Pronouns {
  const p = id === PLAYER ? G.player.pronouns : id === 'mothman' ? 'it' : NPC_BY_ID[id]?.pronouns ?? 'they';
  switch (p) {
    case 'she': return { they: 'she', them: 'her', their: 'her', theirs: 'hers' };
    case 'he': return { they: 'he', them: 'him', their: 'his', theirs: 'his' };
    case 'it': return { they: 'it', them: 'it', their: 'its', theirs: 'its' };
    default: return { they: 'they', them: 'them', their: 'their', theirs: 'theirs' };
  }
}

export function isMasked(id: string): boolean {
  return MASKED.includes(id);
}

export function isWrestler(id: string): boolean {
  return id === PLAYER || (WRESTLERS as readonly string[]).includes(id);
}

export function hearts(id: string): number {
  if (id === PLAYER) return 10;
  return heartsOf(id);
}

/**
 * Can this wrestler work a match on this day? `story` relaxes Sweet Lou's
 * one-match-a-year rule for storyline beats.
 */
export function canWrestle(id: string, day: number, opts: { story?: boolean } = {}): boolean {
  if (id === PLAYER) return true;
  if (!isWrestler(id)) return false;
  const c = charState(id);
  if (S().flags[`retired_${id}`] && !opts.story) return false;
  if (c.injuredUntil !== undefined && day < c.injuredUntil) return false;
  if (c.awayUntil !== undefined && day < c.awayUntil) return false;
  if (id === 'mothman' && !cal.isSat(day)) return false;
  if (id === 'lou') {
    if (!opts.story) return false;
    if (c.lastMatch !== undefined && day - c.lastMatch < 100) return false;
  }
  return true;
}

/** Can appear at all (segments, promos, town moments)? */
export function isAround(id: string, day: number): boolean {
  if (id === PLAYER) return true;
  const c = charState(id);
  if (c.awayUntil !== undefined && day < c.awayUntil) return false;
  if (id === 'mothman' && !cal.isSat(day)) return false;
  return true;
}

/** Wrestlers who could headline a story right now (not away). */
export function storyRoster(day: number): string[] {
  return WRESTLERS.filter((w) => {
    const c = charState(w);
    if (c.awayUntil !== undefined && day < c.awayUntil) return false;
    return true;
  });
}

/** How many active storylines a character is in (lead = hero/villain). */
export function storyLoad(id: string): { lead: number; any: number } {
  let lead = 0;
  let any = 0;
  for (const st of S().stories) {
    if (st.done) continue;
    const roles = Object.entries(st.cast).filter(([, v]) => v === id).map(([k]) => k);
    if (!roles.length) continue;
    any++;
    if (roles.includes('hero') || roles.includes('villain')) lead++;
  }
  return { lead, any };
}

export function nudgeSentiment(id: string, delta: number): void {
  if (id === PLAYER) return;
  const c = charState(id);
  c.sentiment = clamp(Math.round(c.sentiment + delta), -100, 100);
}

export function sideName(ids: string[]): string {
  if (ids.length === 2 && ids.includes('bo') && ids.includes('buck')) return 'the Bruiser Twins';
  if (ids.length <= 1) return ids[0] ? nameOf(ids[0]) : 'nobody';
  return ids.slice(0, -1).map(nameOf).join(', ') + ' & ' + nameOf(ids[ids.length - 1]);
}

export function SideName(ids: string[]): string {
  const n = sideName(ids);
  return n.charAt(0).toUpperCase() + n.slice(1);
}
