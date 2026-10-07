import { describe, expect, it } from 'vitest';
import storylinesDoc from '../docs/STORYLINES.md?raw';
import { BINS, generateCrate, PLACED_BINS, tapeAvailable, type CrateCtx } from '../src/activities/tapes/bins';
import { CAST } from '../src/activities/tapes/cast';
import { TAPES } from '../src/activities/tapes/catalog';
import { DESIGNS, HAMMERS_EDITIONS, STORY_CARDS } from '../src/activities/tapes/extras';
import { CARDS } from '../src/match/cards';

/** Story card ids and names from the tables in docs/STORYLINES.md section 4: | HK-04 | **The Crashed Entrance** | */
const DOC_CARDS = new Map<string, string>();
for (const m of storylinesDoc.matchAll(/^\|\s*([A-Z]{2}-\d{2})\s*\|\s*\*\*(.+?)\*\*\s*\|/gm)) DOC_CARDS.set(m[1], m[2]);

const ctx = (o: Partial<CrateCtx> = {}): CrateCtx => ({
  seed: 1234, day: 10, weekday: 5, season: 0, weather: 'sun', flags: {}, owned: new Set(), hour: 10, ...o,
});

describe('tape catalog', () => {
  it('has a healthy spread of tapes', () => {
    expect(TAPES.length).toBeGreaterThanOrEqual(40);
    const by = (r: string) => TAPES.filter((t) => t.rarity === r).length;
    expect(by('legendary')).toBeGreaterThanOrEqual(5);
    expect(by('common')).toBeGreaterThan(by('rare'));
  });

  it('has unique tape ids and unique moment ids per tape', () => {
    const ids = TAPES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TAPES) {
      const mids = t.moments.map((m) => m.id);
      expect(new Set(mids).size, t.id).toBe(mids.length);
      expect(t.moments.length, t.id).toBeGreaterThanOrEqual(2);
      expect(t.moments.length, t.id).toBeLessThanOrEqual(4);
    }
  });

  it('every tape has at least one valid location, reachable from a crate on the map', () => {
    for (const t of TAPES) {
      expect(t.bins.length, t.id).toBeGreaterThan(0);
      for (const b of t.bins) expect(BINS[b], `${t.id} bin ${b}`).toBeTruthy();
      expect(t.bins.some((b) => PLACED_BINS.includes(b)), `${t.id} reachable`).toBe(true);
      if (t.seasons) {
        expect(t.seasons.length, t.id).toBeGreaterThan(0);
        for (const s of t.seasons) expect(s >= 0 && s <= 3, t.id).toBe(true);
      }
      expect(t.price, t.id).toBeGreaterThan(0);
    }
  });

  it('every tape can actually turn up somewhere once its requirements are met', () => {
    const flags = { tape_quest_ready: true, clue_hammers_1: true, clue_hammers_2: true, clue_hammers_3: true, clue_hammers_4: true, clue_hammers_5: true };
    const owned = new Set(Array.from({ length: 30 }, (_, i) => `x${i}`));
    for (const t of TAPES) {
      let ok = false;
      for (const bin of t.bins) for (let season = 0; season < 4; season++) for (const weather of ['sun', 'rain', 'snow']) {
        if (tapeAvailable(t, bin, ctx({ season, weather, flags, owned }))) ok = true;
      }
      expect(ok, t.id).toBe(true);
    }
  });

  it('move card ids exist in CARDS', () => {
    for (const t of TAPES) for (const m of t.moments) for (const r of [m.reward, m.also]) {
      if (r?.kind === 'move') expect(CARDS[r.card], `${t.id}/${m.id} ${r.card}`).toBeTruthy();
    }
  });

  it('story card ids (and names) match docs/STORYLINES.md section 4', () => {
    expect(DOC_CARDS.size).toBeGreaterThanOrEqual(100);
    for (const [id, info] of Object.entries(STORY_CARDS)) {
      expect(DOC_CARDS.get(id), id).toBe(info.name);
    }
    for (const t of TAPES) for (const m of t.moments) for (const r of [m.reward, m.also]) {
      if (r?.kind === 'story') {
        expect(DOC_CARDS.has(r.card), `${t.id}/${m.id} ${r.card}`).toBe(true);
        expect(STORY_CARDS[r.card], r.card).toBeTruthy();
      }
    }
  });

  it('Hammers editions point at real story cards, designs and cast exist', () => {
    for (const ed of Object.values(HAMMERS_EDITIONS)) expect(DOC_CARDS.get(ed.base), ed.id).toBe(ed.baseName);
    for (const t of TAPES) {
      for (const id of [...t.cast, t.ref, t.ringside].filter(Boolean) as string[]) expect(CAST[id], `${t.id} cast ${id}`).toBeTruthy();
      for (const m of t.moments) {
        for (const id of m.who ?? []) expect(CAST[id], `${t.id}/${m.id} who ${id}`).toBeTruthy();
        for (const r of [m.reward, m.also]) {
          if (r?.kind === 'hammers') expect(HAMMERS_EDITIONS[r.edition], r.edition).toBeTruthy();
          if (r?.kind === 'design') expect(DESIGNS[r.design], r.design).toBeTruthy();
        }
      }
    }
  });

  it('sets all five Velvet Hammers clue flags, gated in order, and gates the 1983 broadcast', () => {
    const clueTapes = new Map<string, string>();
    for (const t of TAPES) for (const m of t.moments) if (m.reward.kind === 'clue') clueTapes.set(m.reward.flag, t.id);
    for (let i = 1; i <= 5; i++) expect(clueTapes.has(`clue_hammers_${i}`), `clue_hammers_${i}`).toBe(true);
    for (let i = 2; i <= 5; i++) {
      const t = TAPES.find((x) => x.id === clueTapes.get(`clue_hammers_${i}`))!;
      expect(t.requires?.flags, t.id).toContain(`clue_hammers_${i - 1}`);
    }
    const belt = TAPES.find((t) => t.id === 'broken-belt-83')!;
    expect(belt.rarity).toBe('legendary');
    expect(belt.requires?.flags).toContain('tape_quest_ready');
    for (const id of ['mothman-first', 'blizzard-bowl-78', 'hammers-gold-81', 'lous-last-stand-91']) {
      expect(TAPES.find((t) => t.id === id)?.rarity, id).toBe('legendary');
    }
  });
});

describe('tape bins', () => {
  it('are deterministic per (crate, day) and change day to day', () => {
    const a = generateCrate('flea', 'flea:bin-flea-1', ctx());
    const b = generateCrate('flea', 'flea:bin-flea-1', ctx());
    const c = generateCrate('flea', 'flea:bin-flea-1', ctx({ day: 11, weekday: 6 }));
    expect(a).toEqual(b);
    expect(a.map((s) => s.tape)).not.toEqual(c.map((s) => s.tape));
    expect(a.length).toBeGreaterThanOrEqual(6);
    expect(a.length).toBeLessThanOrEqual(11);
  });

  it('weekday flea crates are sparse; the back room is full', () => {
    expect(generateCrate('flea', 'k', ctx({ weekday: 1 })).length).toBeLessThanOrEqual(6);
    expect(generateCrate('fenwick', 'k', ctx({ weekday: 1 })).length).toBeGreaterThanOrEqual(6);
  });

  it('never offers a story-gated tape early', () => {
    for (let day = 0; day < 200; day++) {
      for (const bin of ['flea', 'fenwick'] as const) {
        const ids = generateCrate(bin, `${bin}:x`, ctx({ day, weekday: day % 7, season: Math.floor(day / 28) % 4, weather: day % 5 ? 'sun' : 'rain' })).map((s) => s.tape);
        expect(ids).not.toContain('broken-belt-83');
        expect(ids).not.toContain('acw-102983');
        expect(ids).not.toContain('teardown-cam-83');
      }
    }
  });

  it('rain makes rare tapes more likely', () => {
    const count = (weather: string) => {
      let n = 0;
      for (let day = 0; day < 300; day++) for (const s of generateCrate('flea', 'flea:y', ctx({ day, weather, weekday: 5 }))) {
        const t = TAPES.find((x) => x.id === s.tape)!;
        if (t.rarity === 'rare' || t.rarity === 'legendary') n++;
      }
      return n;
    };
    expect(count('rain')).toBeGreaterThan(count('sun'));
  });
});
