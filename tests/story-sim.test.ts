import { describe, expect, it } from 'vitest';
import { G, newState, setState } from '../src/core/state';
import { fromAbsDay } from '../src/core/time';
import { Rng } from '../src/core/rng';
import type { MatchResult } from '../src/match/types';
import type { Paper, ShowCard } from '../src/story/api';
import { story, storyDebug } from '../src/story';
import { autoResolve } from '../src/story/engine/pitch';
import { S, cal } from '../src/story/engine/state';
import { CARDS } from '../src/story/data/cards';
import { SHAPES } from '../src/story/data/shapes';

const BANNED = /\b(casket|funeral|grave|buried|memorial|RIP|dead|died|death|killed|blood)\b/i;

function setDay(d: number): void {
  const t = fromAbsDay(d);
  G.time.year = t.year;
  G.time.season = t.season;
  G.time.day = t.day;
  G.time.minutes = 9 * 60;
}

function fakeResult(win: 'player' | 'opponent', stars: number): MatchResult {
  return { stars, winner: win, breakdown: [], peakCrowd: 70, finalCrowd: 60, botches: 0, turns: 12, highlights: [], crowdCurve: [] };
}

function freshGame(seed: number): void {
  setState(newState(seed));
  G.player.name = 'Robin';
  G.player.persona = {
    ringName: 'Robin Ruckus', nickname: 'The Rookie', hailingFrom: 'the big city', catchphrase: 'Let\'s go!', alignment: 'face',
    signatureName: 'Hometown Spinebuster', finisherName: 'Alley Oop Bomb', finisherStyle: 'power',
    entrance: { walk: 'strut', taunt: 'point', pyro: 'none', light: 'warm' }, theme: { style: 'rock', tempo: 120, seed: 1 },
  };
  G.flags['met_birdie'] = true;
}

interface SimStats {
  cards: ShowCard[];
  papers: Paper[];
  texts: string[];
}

function simulate(seed: number, days: number, opts: { skipRate: number; autoPitch: boolean }): SimStats {
  freshGame(seed);
  const rng = new Rng(seed * 31 + 7);
  const out: SimStats = { cards: [], papers: [], texts: [] };
  for (let d = 0; d < days; d++) {
    setDay(d);
    storyDebug.processDay();
    const paper = story.morningPaper();
    if (paper) {
      out.papers.push(paper);
      out.texts.push(paper.headline, ...paper.body, paper.review?.text ?? '');
    }
    if (opts.autoPitch) for (const p of S().pitches.filter((x) => x.status === 'waiting')) if (rng.chance(0.6)) autoResolve(p);
    if (!cal.isShow(d)) continue;
    G.time.minutes = 19 * 60;
    const venue = cal.isWed(d) ? 'vfw' : 'sportatorium';
    const supershow = cal.isSuper(d) ? ['Thaw Brawl', 'Fairgrounds Fury', 'Harvest Havoc', 'Homecoming'][cal.season(d)] : null;
    const card = story.bookTonight(venue, supershow);
    out.cards.push(card);
    // Idempotent: booking twice the same night gives the same card.
    expect(story.bookTonight(venue, supershow).segments.map((s) => s.id)).toEqual(card.segments.map((s) => s.id));
    for (const seg of card.segments) out.texts.push(seg.title, seg.summary ?? '', seg.match?.intro ?? '');
    if (rng.chance(opts.skipRate)) {
      story.reportSkipped(card);
      continue;
    }
    for (const seg of card.segments) {
      if (seg.playerInvolved && seg.match) {
        const stars = Math.round((1.5 + rng.next() * 3.4) * 4) / 4;
        const winner = rng.chance(0.95) ? seg.match.winner : seg.match.winner === 'player' ? 'opponent' : 'player';
        story.reportMatch(seg.id, fakeResult(winner, stars));
        // What src/systems/shows.ts does after a match.
        G.player.matches++;
        if (winner === 'player') G.player.wins++;
        G.player.bestStars = Math.max(G.player.bestStars, stars);
        G.flags['debuted'] = true;
      } else story.reportSegment(seg.id);
    }
  }
  return out;
}

describe('story content', () => {
  it('has all 109 cards and 31 shapes', () => {
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(109);
    expect(SHAPES.length).toBe(31);
    for (const sh of SHAPES) {
      expect(sh.roles.some((r) => r.key === 'hero')).toBe(true);
      expect(sh.roles.some((r) => r.key === 'villain')).toBe(true);
    }
  });
});

describe('story simulation (120 days)', () => {
  for (const seed of [1, 42, 2026]) {
    it(`books full, varied cards and resolves storylines (seed ${seed})`, () => {
      const res = simulate(seed, 120, { skipRate: 0.15, autoPitch: true });
      const s = S();
      // Full cards every night.
      expect(res.cards.length).toBeGreaterThan(30);
      for (const c of res.cards) {
        const n = c.segments.length;
        const min = c.venue === 'vfw' ? 3 : 4;
        expect(n).toBeGreaterThanOrEqual(min);
        expect(n).toBeLessThanOrEqual(9);
        expect(new Set(c.segments.map((x) => x.id)).size).toBe(n);
        expect(c.segments.filter((x) => x.playerInvolved && x.match).length).toBeLessThanOrEqual(1);
        expect(c.segments[n - 1].slot).toBe('main');
        // Nobody wrestles twice in one night.
        const seen = new Set<string>();
        for (const seg of c.segments) {
          if (seg.kind !== 'match') continue;
          for (const p of seg.participants) {
            expect(seen.has(p), `${p} twice on ${c.name}`).toBe(false);
            seen.add(p);
          }
        }
      }
      // The debut: player vs the Mountain, the Mountain wins, opener.
      const debut = res.cards.find((c) => c.segments.some((x) => x.playerInvolved));
      const dseg = debut!.segments.find((x) => x.playerInvolved)!;
      expect(dseg.match?.opponent).toBe('earl');
      expect(dseg.match?.winner).toBe('opponent');
      expect(dseg.slot).toBe('opener');
      // Variety.
      const summaries = new Set(res.cards.flatMap((c) => c.segments.map((x) => x.summary)));
      expect(summaries.size).toBeGreaterThan(120);
      // Storylines resolve, and new ones keep coming.
      expect(s.archive.length).toBeGreaterThan(8);
      expect(new Set(s.archive.map((a) => a.shape)).size).toBeGreaterThan(3);
      expect(s.archive.some((a) => a.playerIn)).toBe(true);
      expect(s.stories.filter((x) => !x.done).length).toBeGreaterThanOrEqual(3);
      // The paper keeps coming.
      expect(res.papers.length).toBeGreaterThan(40);
      expect(res.papers.filter((p) => p.review).length).toBeGreaterThan(25);
      // Career moves.
      expect(['rookie', 'opener']).not.toContain(G.player.rank === 'rookie' && s.career.pending ? 'x' : G.player.rank === 'rookie' ? 'rookie' : 'ok');
      // Clean text: no unresolved tokens, nothing grim.
      for (const t of res.texts) {
        expect(t, t).not.toMatch(/\{[a-zA-Z@]/);
        expect(t, t).not.toMatch(/\[\[/);
        expect(t, t).not.toMatch(BANNED);
      }
    });
  }

  it('a player who skips every show still sees the town move on', () => {
    simulate(7, 60, { skipRate: 1, autoPitch: false });
    const s = S();
    expect(s.archive.length).toBeGreaterThan(3);
    expect(s.shows.length).toBeGreaterThan(10);
  });

  it('catches up when the show system never runs (offscreen shows)', () => {
    freshGame(99);
    setDay(0);
    storyDebug.processDay();
    setDay(30);
    storyDebug.processDay();
    expect(S().shows.length).toBeGreaterThan(5);
    expect(S().shows.every((r) => r.closed)).toBe(true);
  });

  it('first pitch arrives in week one, from Dex or Earl', () => {
    freshGame(5);
    for (let d = 0; d <= 3; d++) {
      setDay(d);
      storyDebug.processDay();
    }
    story.bookTonight('vfw', null);
    const first = S().pitches.find((p) => p.trigger === 'first');
    expect(first).toBeTruthy();
    expect(['dex', 'earl', 'tiny']).toContain(first!.pitcher);
  });
});

describe('signature storylines and the paper', () => {
  it('offers a gold-napkin signature story at 7 hearts and runs it with locked slots', () => {
    freshGame(11);
    for (let d = 0; d <= 13; d++) {
      setDay(d);
      storyDebug.processDay();
    }
    G.relationships['tiny'] = { points: 1800, talkedToday: false, giftedToday: false, giftsThisWeek: 0, eventsSeen: [] };
    setDay(14);
    storyDebug.processDay();
    const sig = S().pitches.find((p) => p.scope === 'signature');
    expect(sig?.pitcher).toBe('tiny');
    const st = autoResolve(sig!);
    expect(st).toBeTruthy();
    expect(st!.cards.hook).toBe('HK-05');
    expect(st!.cards.payoff).toBe('PO-11');
    expect(st!.buzzFloor).toBe(25);
    expect(st!.stamps).toContain('signature');
  });

  it('keeps the Tattler fresh over months', () => {
    const res = simulate(321, 120, { skipRate: 0.1, autoPitch: true });
    const around = res.papers.flatMap((p) => p.body.filter((b) => b.startsWith('AROUND TOWN')));
    expect(new Set(around).size).toBeGreaterThan(around.length * 0.8);
    const reviews = res.papers.map((p) => p.review?.text).filter(Boolean);
    expect(new Set(reviews).size).toBeGreaterThan(reviews.length * 0.6);
    const heads = new Set(res.papers.map((p) => p.headline));
    expect(heads.size).toBeGreaterThan(res.papers.length * 0.6);
  });
});
