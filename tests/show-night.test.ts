import { describe, expect, it } from 'vitest';
import { currentEntry, NPCS, type DayCtx } from '../src/data/npcs';

const H = (h: number, m = 0) => h * 60 + m;

describe('show night schedules', () => {
  for (const show of ['wed', 'sat'] as const) {
    const venue = show === 'wed' ? 'vfw' : 'sportatorium';
    const ctx: DayCtx = { weekday: show === 'wed' ? 2 : 5, day: show === 'wed' ? 3 : 6, season: 0, weather: 'sun', show, supershow: false, flags: {} };
    it(`everyone booked at the ${venue} is still there at the bell`, () => {
      const stray: string[] = [];
      for (const n of NPCS) {
        if (n.appearsWhen && !n.appearsWhen(ctx)) continue;
        const booked = n.schedule(ctx).some((e) => e.map === venue && e.at === H(17, 30));
        if (!booked) continue;
        for (const t of [H(18, 30), H(19), H(19, 30), H(20, 30)]) {
          const e = currentEntry(n, ctx, t);
          if (e?.map !== venue) stray.push(`${n.id} at ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')} -> ${e?.map}`);
        }
      }
      expect(stray).toEqual([]);
    });
  }
});
