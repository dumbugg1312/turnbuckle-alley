/**
 * The Recipe Tin: the player's story cards (§4.1). Cards taught through the
 * dialogue system's learnStoryCard() land in ext('story-cards'); we merge them.
 */
import { ext } from '../../core/state';
import type { CardSource } from '../types';
import { CARD, STARTER_DECK } from './content';
import { S, notice, today, type OwnedCard } from './state';

/** Merge cards taught elsewhere (heart events call learnStoryCard). */
export function syncTin(): void {
  const taught = ext<{ owned: string[] }>('story-cards', () => ({ owned: [] }));
  for (const id of taught.owned) if (CARD[id] && !S().tin.some((c) => c.id === id)) addToTin(id, 'insider_story', false);
}

export function tin(): OwnedCard[] {
  syncTin();
  return S().tin;
}

export function owns(id: string): boolean {
  return S().tin.some((c) => c.id === id);
}

/** Add a card; a duplicate adds a gold star (max 3). */
export function addToTin(id: string, source: CardSource, announce = true): OwnedCard | null {
  const c = CARD[id];
  if (!c) return null;
  const s = S();
  const have = s.tin.find((o) => o.id === id);
  if (have) {
    if (have.stars < 3) {
      have.stars++;
      if (announce) notice(`★ ${c.name} gets a gold star (${have.stars}/3)`);
    }
    return have;
  }
  const o: OwnedCard = { id, stars: 0, source, got: today(), plays: 0, isNew: true };
  s.tin.push(o);
  const taught = ext<{ owned: string[] }>('story-cards', () => ({ owned: [] }));
  if (!taught.owned.includes(id)) taught.owned.push(id);
  if (announce) notice(`New story card: ${c.name}`);
  return o;
}

export function grantStarterDeck(): void {
  for (const id of STARTER_DECK) addToTin(id, 'starter', false);
}

export function markPlayed(ids: (string | undefined)[]): void {
  const d = today();
  for (const id of ids) {
    const o = id ? S().tin.find((c) => c.id === id) : undefined;
    if (o) {
      o.plays++;
      o.lastPlayed = d;
      o.isNew = false;
    }
  }
}
