import { describe, expect, it } from 'vitest';
import { barSizeFor, difficultyFor, Tracking } from '../src/activities/tapes/tracking';
import type { Wobble } from '../src/activities/tapes/types';

/**
 * A human-ish player: sees the zone with a reaction delay, aims the bar's
 * center at it with some predictive braking and a little sloppiness.
 */
function play(level: number, wobble: Wobble, ringIq: number, seed: number, skill = 1): { caught: boolean; time: number } {
  const tr = new Tracking({ barSize: barSizeFor(ringIq), difficulty: difficultyFor(level), wobble }, seed);
  const dt = 1 / 60;
  const delay = Math.round((0.2 / skill) * 60);
  const hist: number[] = [];
  let s = seed * 7 + 3;
  const rnd = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
  while (!tr.done) {
    hist.push(tr.zone);
    const seen = hist[Math.max(0, hist.length - 1 - delay)];
    const center = tr.bar + tr.barSize / 2 + tr.vel * 0.22 * skill;
    const holding = center < seen + (rnd() - 0.5) * 0.08 / skill;
    tr.step(dt, holding);
  }
  return { caught: tr.done === 'caught', time: tr.t };
}

function rate(level: number, wobble: Wobble, ringIq: number, skill = 1, n = 200) {
  let c = 0;
  let t = 0;
  for (let i = 1; i <= n; i++) {
    const r = play(level, wobble, ringIq, i * 31 + level, skill);
    if (r.caught) c++;
    t += r.time;
  }
  return { rate: c / n, avgTime: t / n };
}

describe('tapes tracking mini-game feel', () => {
  it('reports catch rates', () => {
    const rows: string[] = [];
    for (const lvl of [1, 2, 3, 4, 5]) for (const w of ['smooth', 'mixed', 'dart'] as Wobble[]) {
      const a = rate(lvl, w, 0);
      const b = rate(lvl, w, 6);
      const sloppy = rate(lvl, w, 0, 0.6);
      rows.push(`L${lvl} ${w.padEnd(7)} iq0 ${(a.rate * 100).toFixed(0)}% ${a.avgTime.toFixed(1)}s | iq6 ${(b.rate * 100).toFixed(0)}% | sloppy ${(sloppy.rate * 100).toFixed(0)}%`);
    }
    console.log(rows.join('\n'));
    expect(rows.length).toBe(15);
  });

  it('commons are forgiving and legendaries are a real challenge', () => {
    expect(rate(1, 'mixed', 0).rate).toBeGreaterThan(0.9);
    expect(rate(2, 'mixed', 0).rate).toBeGreaterThan(0.8);
    const legend = rate(5, 'dart', 0).rate;
    expect(legend).toBeGreaterThan(0.2);
    expect(legend).toBeLessThan(0.97);
    // Ring IQ helps.
    expect(rate(5, 'dart', 8).rate).toBeGreaterThan(legend);
  });

  it('doing nothing loses', () => {
    const tr = new Tracking({ barSize: barSizeFor(0), difficulty: difficultyFor(2), wobble: 'mixed' }, 5);
    while (!tr.done) tr.step(1 / 60, false);
    // The bar sits on the floor: sometimes the zone wanders through it, but it shouldn't be a catch.
    expect(tr.t).toBeGreaterThan(2);
  });
});
