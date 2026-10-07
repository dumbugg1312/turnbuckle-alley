import { describe, expect, it } from 'vitest';
import { defaultLook } from '../src/gfx/look';
import { BACKGROUND_CARDS, STARTER_DECK } from '../src/match/cards';
import { Match } from '../src/match/engine';
import type { MatchConfig } from '../src/match/types';

type Bot = (m: Match) => number | null; // hand index to play, or null to end turn

const randomBot: Bot = (m) => {
  const playable = m.hand.map((_, i) => i).filter((i) => m.canPlay(i).ok);
  if (!playable.length || m.rng.chance(0.25)) return null;
  return playable[Math.floor(Math.random() * playable.length)];
};

const greedyBot: Bot = (m) => {
  let best = -1;
  let bestPop = 0;
  m.hand.forEach((_, i) => {
    if (!m.canPlay(i).ok) return;
    const p = m.preview(i).pop;
    if (p > bestPop) {
      bestPop = p;
      best = i;
    }
  });
  return best >= 0 ? best : null;
};

/** Plays the way the tutorial teaches. */
const smartBot: Bot = (m) => {
  const ph = m.phase.id;
  const can = (i: number) => m.canPlay(i).ok;
  const idx = (pred: (c: Match['hand'][number]) => boolean) => m.hand.findIndex((c, i) => can(i) && pred(c));
  if (ph === 'finish') {
    const f = idx((c) => c.id === 'finisher' || c.id === 'takefinish');
    if (f >= 0) return f;
  }
  const cover = idx((c) => c.id === 'cover');
  if (cover >= 0) return cover;
  const fire = idx((c) => c.id === 'fireup');
  if (fire >= 0) return fire;
  if (m.phase.offense === 'opponent') {
    const sell = idx((c) => c.type === 'sell' && c.id !== 'reversal' && m.sellQueued < 3);
    if (sell >= 0) return sell;
    const hope = idx((c) => c.id === 'hopespot' || c.id === 'cheapshot');
    if (hope >= 0) return hope;
    return null;
  }
  if (m.oppAttacking) {
    const sell = idx((c) => c.type === 'sell' && m.sellQueued === 0);
    if (sell >= 0) return sell;
  }
  // Setups first, then the best-scoring offense.
  const setup = idx((c) => (c.type === 'setup' || c.type === 'taunt') && m.playedThisTurn === 0);
  if (setup >= 0 && m.energy >= 2) return setup;
  let best = -1;
  let bestPop = 0;
  m.hand.forEach((c, i) => {
    if (!can(i) || c.type === 'sell') return;
    const p = m.preview(i).pop / Math.max(1, c.cost);
    if (p > bestPop) {
      bestPop = p;
      best = i;
    }
  });
  return best >= 0 ? best : null;
};

function config(seed: number, role: 'face' | 'heel', oppRole: 'face' | 'heel', winner: 'player' | 'opponent', chem = 3): MatchConfig {
  return {
    player: {
      id: 'player', name: 'Rookie', role, look: defaultLook(), style: 'brawler', chemistry: 0,
      finisherName: 'Alley Bomb', signatureName: 'Hometown Spinebuster',
      deck: [...STARTER_DECK, ...BACKGROUND_CARDS.backyard], gear: [], maxGas: 32, ringIq: 0,
    },
    opponent: { id: 'earl', name: 'Big Earl', role: oppRole, look: defaultLook(), style: 'giant', chemistry: chem, finisherName: 'Overdue Notice', signatureName: 'Chokeslam' },
    winner, venue: 'vfw', seed,
  };
}

function run(bot: Bot, cfg: MatchConfig): Match {
  const m = new Match(cfg);
  m.start();
  let guard = 0;
  while (!m.over && guard++ < 400) {
    if (m.pendingKickout) {
      m.resolveKickout(Math.random());
      continue;
    }
    const i = bot(m);
    if (i === null) m.endTurn();
    else m.playCard(i);
  }
  return m;
}

function stats(bot: Bot, role: 'face' | 'heel', oppRole: 'face' | 'heel', winner: 'player' | 'opponent', chem = 3) {
  const stars: number[] = [];
  const turns: number[] = [];
  for (let s = 1; s <= 300; s++) {
    const m = run(bot, config(s * 7919, role, oppRole, winner, chem));
    expect(m.over).toBe(true);
    expect(m.result!.winner).toBe(winner);
    stars.push(m.result!.stars);
    turns.push(m.result!.turns);
  }
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return { avgStars: +avg(stars).toFixed(2), maxStars: Math.max(...stars), minStars: Math.min(...stars), avgTurns: +avg(turns).toFixed(1), maxTurns: Math.max(...turns) };
}

describe('match simulation', () => {
  it('always reaches the booked finish and rewards good play', () => {
    const r = {
      random: stats(randomBot, 'face', 'heel', 'player'),
      greedy: stats(greedyBot, 'face', 'heel', 'player'),
      smart: stats(smartBot, 'face', 'heel', 'player'),
      smartLose: stats(smartBot, 'face', 'heel', 'opponent'),
      smartHeel: stats(smartBot, 'heel', 'face', 'player'),
      smartExhibition: stats(smartBot, 'face', 'face', 'player'),
      smartHighChem: stats(smartBot, 'face', 'heel', 'player', 9),
    };
    console.table(r);
    expect(r.smart.avgStars).toBeGreaterThan(r.random.avgStars);
    expect(r.smart.maxTurns).toBeLessThan(30);
  });
});
