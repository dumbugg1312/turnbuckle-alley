import { beforeEach, describe, expect, it } from 'vitest';
import { G, newState, setState } from '../src/core/state';
import { DIALOGUE } from '../src/data/dialogue';
import { HANDWRITTEN } from '../src/data/dialogue/handwritten';
import { ITEMS } from '../src/data/items';
import { fillMemory, freshNews, lastMatch, memory, recordGift, recordMatch, syncNews } from '../src/world/memory';

const MAIN = ['birdie', 'grandma', 'pip', 'dex', 'lou', 'june', 'agnes', 'mariposa', 'mo', 'hank', 'earl', 'marigold', 'bev', 'tiny'];

describe('handwritten lines', () => {
  it('loads, with a list for every main character', () => {
    for (const id of MAIN) expect(Array.isArray(HANDWRITTEN[id]), id).toBe(true);
    for (const [id, lines] of Object.entries(HANDWRITTEN)) {
      expect(DIALOGUE[id], `${id} has no dialogue file`).toBeTruthy();
      for (const l of lines) expect(typeof l.text === 'string' || Array.isArray(l.text)).toBe(true);
    }
  });
});

describe('town memory', () => {
  beforeEach(() => setState(newState()));

  it('records the last match and fills placeholders from it', () => {
    G.player.matches = 1;
    recordMatch({ won: true, opponent: 'earl', opponentName: 'The Mountain', finisher: 'Alley Oop Bomb', myFinisher: 'Alley Oop Bomb', stars: 3.5, venue: 'vfw', highlights: [] });
    expect(lastMatch()?.opponent).toBe('earl');
    expect(fillMemory('{opponent} at {venue}, {stars} stars, {finisher}.', 'lou')).toBe('The Mountain at the VFW, 3.5 stars, Alley Oop Bomb.');
    expect(freshNews('debut')).toBeTruthy();
    expect(freshNews('first_win')).toBeTruthy();
  });

  it('remembers gifts per person', () => {
    recordGift('mo', 'feather');
    expect(fillMemory('the {lastGift}', 'mo')).toBe('the moth wing');
    expect(fillMemory('the {lastGift}', 'birdie')).toBe('the gift');
  });

  it('turns story flags into news once, and treats an old save as old news', () => {
    memory(); // a fresh save: nothing set yet
    G.flags['earl_book'] = 'pebble';
    syncNews();
    expect(freshNews('earl_book_pebble')).toBeTruthy();
    expect(freshNews('earl_book_own')).toBeNull();

    setState(newState());
    G.flags['reunion_done'] = true; // happened before the town had a memory
    syncNews();
    expect(freshNews('reunion_done')).toBeNull();
  });

  it('only reports the Dust Devil unmasking when it happened in the ring', () => {
    memory();
    G.flags['clint_last_match'] = true;
    syncNews();
    expect(freshNews('dust_devil_unmasked')).toBeNull();
    G.flags['clint_unmask_ring'] = true;
    syncNews();
    expect(freshNews('dust_devil_unmasked')).toBeTruthy();
  });
});

describe('gift replies', () => {
  it('every byItem reply belongs to a real item, and Mo answers the moth wing about the moth wing', () => {
    const mo = DIALOGUE['mo'].giftReplies.byItem?.['feather'];
    const text = Array.isArray(mo) ? mo.join(' ') : mo ?? '';
    expect(text.toLowerCase()).toContain('wing');
    for (const ds of Object.values(DIALOGUE)) for (const id of Object.keys(ds.giftReplies.byItem ?? {})) expect(ITEMS[id], `${ds.npc}:${id}`).toBeTruthy();
  });

  it('news reactions exist for at least fifteen events, three or more people each', () => {
    const by: Record<string, Set<string>> = {};
    for (const ds of Object.values(DIALOGUE)) for (const l of ds.lines) if (l.when?.news) (by[l.when.news] ??= new Set()).add(ds.npc);
    const wellCovered = Object.entries(by).filter(([, s]) => s.size >= 3).map(([k]) => k);
    expect(wellCovered.length, Object.keys(by).join(', ')).toBeGreaterThanOrEqual(15);
  });
});
