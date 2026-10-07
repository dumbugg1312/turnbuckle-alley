import { describe, expect, it } from 'vitest';
import { freshLog, summarize, type DaySnapshot } from '../src/systems/daylog';
import { allNightLines, pickNightLine, type NightCtx } from '../src/systems/goodnight-lines';

const snap = (over: Partial<DaySnapshot> = {}): DaySnapshot => ({
  day: 4,
  money: 150,
  chairs: 2,
  matches: 1,
  wins: 0,
  met: ['pip', 'birdie'],
  flags: ['arrived', 'met_pip'],
  talkedToday: [],
  ...over,
});

describe('daily stats slice', () => {
  it('starts each day from a snapshot and reports the differences at bedtime', () => {
    const log = freshLog(snap());
    const s = summarize(log, snap({ money: 212, chairs: 5, matches: 2, wins: 1, met: ['pip', 'birdie', 'june'], talkedToday: ['june', 'pip'] }));
    expect(s.moneyDelta).toBe(62);
    expect(s.chairs).toBe(3);
    expect(s.matches).toBe(1);
    expect(s.wins).toBe(1);
    expect(s.talked).toEqual(['june', 'pip']);
    expect(s.newPeople).toEqual(['june']);
  });

  it('counts people met in cutscenes through story flags and noted talks', () => {
    const log = freshLog(snap({ met: [], flags: ['arrived'] }));
    log.talked.push('arlo');
    const s = summarize(log, snap({ met: [], flags: ['arrived', 'met_birdie'] }));
    expect(s.talked).toEqual(['arlo', 'birdie', 'dex']);
    // A coworker from the city is somebody you talked to, not somebody new.
    expect(s.newPeople).toEqual(['birdie', 'dex']);
  });

  it('a fresh log carries only the last line over', () => {
    const log = freshLog(snap(), 'old line');
    log.notes.push('porch');
    log.talked.push('pip');
    const next = freshLog(snap({ day: 5 }), log.lastLine);
    expect(next.day).toBe(5);
    expect(next.notes).toEqual([]);
    expect(next.talked).toEqual([]);
    expect(next.lastLine).toBe('old line');
  });

  it('spending shows as a negative delta, and nothing found is zero', () => {
    const s = summarize(freshLog(snap()), snap({ money: 90, chairs: 2 }));
    expect(s.moneyDelta).toBe(-60);
    expect(s.chairs).toBe(0);
  });
});

describe('goodnight lines', () => {
  const base = (over: Partial<NightCtx> = {}): NightCtx => ({
    summary: summarize(freshLog(snap()), snap()),
    abs: 10,
    weekday: 2,
    season: 0,
    weather: 'sun',
    passedOut: false,
    late: false,
    ...over,
  });

  it('there are a few dozen, all in the house style', () => {
    const all = allNightLines();
    expect(all.length).toBeGreaterThanOrEqual(36);
    for (const ln of all) {
      expect(ln.text).not.toMatch(/eleven|Don't tell|It's not .*\. It's /i);
      expect(ln.date).toMatch(/'\d\d$/);
    }
  });

  it('keys the line to what happened', () => {
    const won = base({ summary: { ...base().summary, wins: 1, matches: 1, show: { stars: 4, venue: 'vfw', missed: false } } });
    expect(['Won in Lafayette', 'Hand raised in Beaumont', 'Won tonight'].some((w) => pickNightLine(won).text.startsWith(w))).toBe(true);
    expect(pickNightLine(base({ abs: 0 })).date).toBe("Oct. '83");
    expect(pickNightLine(base({ passedOut: true })).text).toMatch(/boots|parking lot/);
    expect(pickNightLine(base({ weather: 'storm' })).text).toMatch(/gin/);
  });

  it('never repeats last night', () => {
    const c = base({ weather: 'storm' });
    const first = pickNightLine(c);
    expect(pickNightLine(c, first.text).text).not.toBe(first.text);
  });
});
