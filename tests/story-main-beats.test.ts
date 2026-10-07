import { describe, expect, it } from 'vitest';
import { at, availableBeats, BEATS, done, type Flags, type StoryCtx, type Trigger } from '../src/story-main/chapters/beats';

/**
 * Simulates a player who plays every day of year one, wandering the usual
 * places at the usual times, and checks that every main-story beat fires, in
 * order, in the right season, with no long dead stretches.
 */

const MAPS = ['town', 'farm', 'lockers', 'sportatorium', 'vfw', 'diner', 'birdie-office', 'sunnypines', 'grandma-room', 'airstream', 'tailor'];
const TALKS: [npc: string, map: string][] = [
  ['birdie', 'birdie-office'], ['agnes', 'sunnypines'], ['lou', 'town'], ['june', 'diner'], ['grandma', 'grandma-room'],
  ['doc', 'town'], ['gus', 'town'], ['hank', 'sportatorium'], ['marigold', 'tailor'],
];
const TIMES = [8 * 60, 10 * 60, 13 * 60, 15 * 60, 18 * 60 + 30, 21 * 60 + 30];

function simulate(opts: { tapes: boolean; days?: number }): { log: { id: string; abs: number }[]; flags: Flags } {
  const flags: Flags = {};
  const log: { id: string; abs: number }[] = [];
  const run = (c: StoryCtx, t: Trigger) => {
    const b = availableBeats(c, t)[0];
    if (!b) return;
    flags[`ms_${b.id}`] = c.abs;
    for (const f of b.sets ?? []) flags[f] = true;
    log.push({ id: b.id, abs: c.abs });
  };
  for (let abs = 0; abs < (opts.days ?? 112); abs++) {
    if (abs >= 7) flags.debuted = true;
    if (abs >= 9) flags.lou_key = true;
    // The tapes team's flags, if the player digs tapes: one Hammers tape a week after Grandma arrives.
    if (opts.tapes && flags.grandma_in_town) {
      const n = Math.min(5, Math.floor((abs - at(1, 22)) / 5) + 1);
      for (let i = 1; i <= n; i++) flags[`clue_hammers_${i}`] = true;
      if (done(flags, 'fa_hank') && abs >= Number(flags.ms_fa_hank) + 3) flags.clue_1983 = true;
    }
    const base = { abs, season: Math.floor(abs / 28) % 4, day: (abs % 28) + 1, weekday: abs % 7, hearts: () => 5 };
    const clues = () => [1, 2, 3, 4, 5].filter((i) => flags[`clue_hammers_${i}`]).length;
    run({ ...base, minutes: 360, map: 'grandma-house', flags, clues: clues() }, { on: 'day' });
    for (const minutes of TIMES) {
      for (const map of MAPS) {
        const c: StoryCtx = { ...base, minutes, map, flags, clues: clues() };
        run(c, { on: 'enter', map });
        run(c, { on: 'tick' });
      }
      for (const [npc, map] of TALKS) run({ ...base, minutes, map, flags, clues: clues() }, { on: 'talk', npc });
    }
  }
  return { log, flags };
}

const CHAPTER_END = { spring: 28, summer: 56, fall: 84, winter: 112 } as const;

describe('main story beats', () => {
  for (const tapes of [true, false]) {
    describe(tapes ? 'with tapes' : 'without the tapes system (fallbacks)', () => {
      const { log, flags } = simulate({ tapes });

      it('fires every beat exactly once in year one', () => {
        const ids = log.map((l) => l.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(BEATS.filter((b) => !ids.includes(b.id) && !(tapes && b.fallback)).map((b) => b.id)).toEqual([]);
      });

      it('reaches the ending flags', () => {
        for (const f of ['grandma_in_town', 'tape_quest_ready', 'truth_revealed', 'birdie_knows', 'reunion_set', 'reunion_done', 'credits_seen', 'grandma_attends']) expect(flags[f], f).toBe(true);
      });

      it('keeps the big moments in story order', () => {
        const day = (id: string) => log.find((l) => l.id === id)!.abs;
        const order = ['sp_mural', 'sp_thawbrawl', 'su_arrival', 'su_room7', 'mem_1', 'fa_lou', 'fa_doc', 'fa_gus', 'fa_hank', 'fa_broadcast', 'fa_birdie', 'wi_meeting', 'wi_last_match', 'wi_robe', 'wi_contract', 'wi_house', 'wi_eve', 'wi_homecoming'];
        for (let i = 1; i < order.length; i++) expect(day(order[i]), `${order[i - 1]} before ${order[i]}`).toBeGreaterThanOrEqual(day(order[i - 1]));
        expect(day('wi_homecoming')).toBe(at(3, 27));
        expect(day('su_arrival')).toBe(at(1, 22));
        expect(day('wi_meeting')).toBeGreaterThanOrEqual(at(3, 1));
      });

      it('lands each beat by the end of its chapter', () => {
        for (const b of BEATS) {
          const hit = log.find((l) => l.id === b.id);
          if (!hit && b.fallback) continue;
          const d = hit!.abs;
          expect(d, b.id).toBeLessThan(CHAPTER_END[b.chapter]);
        }
      });

      it('gives Spring at least five moments after week one', () => {
        expect(log.filter((l) => l.abs >= 7 && l.abs < 28).length).toBeGreaterThanOrEqual(5);
      });

      it('never goes more than ten days without a story moment after week one', () => {
        const days = [7, ...log.map((l) => l.abs), at(3, 27)].sort((a, b) => a - b);
        let worst = 0;
        for (let i = 1; i < days.length; i++) worst = Math.max(worst, days[i] - days[i - 1]);
        expect(worst).toBeLessThanOrEqual(10);
      });
    });
  }
});
