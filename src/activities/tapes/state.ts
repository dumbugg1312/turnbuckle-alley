import { game } from '../../core/game';
import { G, ext, skillLevel } from '../../core/state';
import { absDay, weekday } from '../../core/time';
import { TAPES, tapeDef } from './catalog';
import { DESIGNS, HAMMERS_EDITIONS, STORY_CARDS } from './extras';
import type { BinId, CrateSlot, Reward, TapeDef, TapesState } from './types';
import { BINS, binForCrate, generateCrate, type CrateCtx } from './bins';

export function tapesState(): TapesState {
  const s = ext<TapesState>('tapes', () => ({
    library: {},
    binSeen: {},
    bought: {},
    spares: {},
    lines: [],
    designs: [],
    hammers: [],
    storyStars: {},
    haggled: {},
    haggledPrice: {},
    tutorial: { dig: false, watch: false, library: false },
    stats: { dug: 0, bought: 0, watched: 0, caught: 0, lost: 0, perfect: 0 },
  }));
  // Fill fields added after a save was made.
  s.library ??= {};
  s.binSeen ??= {};
  s.bought ??= {};
  s.spares ??= {};
  s.lines ??= [];
  s.designs ??= [];
  s.hammers ??= [];
  s.storyStars ??= {};
  s.haggled ??= {};
  s.haggledPrice ??= {};
  s.tutorial ??= { dig: false, watch: false, library: false };
  s.stats ??= { dug: 0, bought: 0, watched: 0, caught: 0, lost: 0, perfect: 0 };
  return s;
}

/** The storyline engine's owned story cards. */
export function storyCards(): { owned: string[] } {
  return ext('story-cards', () => ({ owned: [] as string[] }));
}

export function ownedIds(): Set<string> {
  return new Set(Object.keys(tapesState().library));
}

export function crateCtx(): CrateCtx {
  return {
    seed: G.seed,
    day: absDay(),
    weekday: weekday(),
    season: G.time.season,
    weather: G.weather.today,
    flags: G.flags,
    owned: ownedIds(),
    hour: G.time.minutes / 60,
  };
}

export function crateKeyFor(bin: string, objectId: string): string {
  return `${bin}:${objectId}`;
}

/** Today's crate for a map object, minus anything already bought from it today. */
export function todaysCrate(bin: string, objectId: string): { bin: BinId; key: string; slots: CrateSlot[] } {
  const c = crateCtx();
  const real = binForCrate(bin, objectId, c.weekday);
  const key = crateKeyFor(real, objectId);
  const bought = tapesState().bought[`${key}@${c.day}`] ?? [];
  const slots = generateCrate(real, key, c).filter((s) => !bought.includes(s.tape));
  return { bin: real, key, slots };
}

export function markBought(key: string, tape: string): void {
  const s = tapesState();
  const day = absDay();
  const k = `${key}@${day}`;
  (s.bought[k] ??= []).push(tape);
  // Forget old days.
  for (const old of Object.keys(s.bought)) {
    const d = Number(old.split('@')[1]);
    if (d < day - 1) delete s.bought[old];
  }
}

/** Add a tape to the collection. Returns false if it was a duplicate (kept as a spare). */
export function acquireTape(id: string): boolean {
  const s = tapesState();
  s.stats.bought++;
  if (s.library[id]) {
    s.spares[id] = (s.spares[id] ?? 0) + 1;
    return false;
  }
  s.library[id] = { watched: false, caught: [], got: absDay() };
  return true;
}

/** Give away a spare copy (for gifting and trading systems). */
export function takeSpareTape(id: string): boolean {
  const s = tapesState();
  if (!s.spares[id]) return false;
  s.spares[id]--;
  if (!s.spares[id]) delete s.spares[id];
  return true;
}

export function completion(t: TapeDef): { caught: number; total: number } {
  const e = tapesState().library[t.id];
  return { caught: e ? t.moments.filter((m) => e.caught.includes(m.id)).length : 0, total: t.moments.length };
}

/** 0..3 stars for the library. */
export function starsFor(t: TapeDef): number {
  const { caught, total } = completion(t);
  if (!caught) return 0;
  if (caught >= total) return 3;
  return caught / total >= 0.5 ? 2 : 1;
}

export function watchedToday(id: string): boolean {
  return tapesState().library[id]?.day === absDay();
}

export function libraryTapes(): TapeDef[] {
  const lib = tapesState().library;
  return TAPES.filter((t) => lib[t.id]);
}

/** Ring IQ XP with a level-up toast hook. Returns true on level up. */
export function giveRingIq(xp: number): number | null {
  const before = skillLevel('ringiq');
  G.player.skills.ringiq += Math.round(xp);
  const after = skillLevel('ringiq');
  if (after > before) {
    game.bus.emit('skill', { id: 'ringiq', level: after });
    return after;
  }
  return null;
}

export const RARITY_XP: Record<TapeDef['rarity'], number> = { common: 14, uncommon: 24, rare: 40, legendary: 70 };

/**
 * Apply a non-interactive reward (everything except adding a move card, which
 * the player chooses). Returns a short summary for the reward card.
 */
export function applyReward(tape: TapeDef, r: Reward): { title: string; detail: string; dup?: boolean } {
  const s = tapesState();
  switch (r.kind) {
    case 'story': {
      const owned = storyCards().owned;
      const info = STORY_CARDS[r.card];
      if (owned.includes(r.card)) {
        s.storyStars[r.card] = Math.min(3, (s.storyStars[r.card] ?? 0) + 1);
        return { title: info?.name ?? r.card, detail: `Already in the Recipe Tin. +1 gold star (${s.storyStars[r.card]}/3).`, dup: true };
      }
      owned.push(r.card);
      return { title: info?.name ?? r.card, detail: 'Added to the Recipe Tin.' };
    }
    case 'hammers': {
      const ed = HAMMERS_EDITIONS[r.edition];
      if (!s.hammers.includes(r.edition)) s.hammers.push(r.edition);
      G.flags[`hammers_${r.edition}`] = true;
      return { title: ed?.name ?? r.edition, detail: `Hammers edition of ${ed?.baseName ?? 'a classic'}. Grandma would know this one.` };
    }
    case 'line': {
      const id = `${tape.id}:${r.text.slice(0, 16)}`;
      const dup = s.lines.some((l) => l.text === r.text);
      if (!dup) s.lines.push({ id, text: r.text, kind: r.line, tape: tape.id });
      return { title: r.line === 'chant' ? 'Crowd chant' : 'Promo line', detail: dup ? 'You already know this one by heart.' : r.line === 'chant' ? 'Use it to get a crowd going.' : 'Use it in your next promo.', dup };
    }
    case 'design': {
      const d = DESIGNS[r.design];
      const dup = s.designs.includes(r.design);
      if (!dup) s.designs.push(r.design);
      return { title: d?.name ?? r.design, detail: dup ? 'Already in your sketchbook.' : 'Gear design added to your sketchbook. Marigold could sew this.', dup };
    }
    case 'clue': {
      const dup = !!G.flags[r.flag];
      G.flags[r.flag] = true;
      game.bus.emit('flag', r.flag);
      checkTapeQuest();
      return { title: r.title, detail: dup ? 'You already knew. It still hurts a little.' : `*${r.narration[r.narration.length - 1]}*`, dup };
    }
    case 'move':
      return { title: r.card, detail: '' };
  }
}

/** The 1983 broadcast surfaces once the Hammers clues are all caught (or the main story says so). */
export function checkTapeQuest(): void {
  const all = [1, 2, 3, 4, 5].every((i) => G.flags[`clue_hammers_${i}`]);
  if (all && !G.flags['tape_quest_ready']) G.flags['tape_quest_ready'] = true;
}

export function binName(bin: BinId): string {
  return BINS[bin].name;
}

export { tapeDef };
