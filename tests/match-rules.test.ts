import { describe, expect, it } from 'vitest';
import { defaultLook } from '../src/gfx/look';
import { BACKGROUND_CARDS, STARTER_DECK } from '../src/match/cards';
import { Match } from '../src/match/engine';
import type { MatchConfig } from '../src/match/types';

function config(role: 'face' | 'heel'): MatchConfig {
  return {
    player: {
      id: 'player', name: 'Rookie', role, look: defaultLook(), style: 'brawler', chemistry: 0,
      finisherName: 'Alley Bomb', signatureName: 'Hometown Spinebuster',
      deck: [...STARTER_DECK, ...BACKGROUND_CARDS.backyard], gear: [], maxGas: 32, ringIq: 0,
    },
    opponent: { id: 'earl', name: 'Big Earl', role: role === 'face' ? 'heel' : 'face', look: defaultLook(), style: 'giant', chemistry: 3, finisherName: 'Overdue Notice', signatureName: 'Chokeslam' },
    winner: 'opponent', venue: 'vfw', seed: 99,
  };
}

// Engine internals these rules touch; the tests set up a turn by hand.
type Loose = Match & { goalsMet: number; goalDone: boolean; goalProgress: number; phaseIndex: number; phases: { id: string; goal: { kind: string } }[] };

const atPhase = (m: Loose, pred: (p: Loose['phases'][number]) => boolean) => {
  m.phaseIndex = m.phases.findIndex(pred);
  m.goalDone = false;
  m.goalProgress = 0;
};

describe('match rules', () => {
  it('a reversed "X + Cover" does not also pin the player', () => {
    const m = new Match(config('face')) as Loose;
    atPhase(m, (p) => p.id === 'stretch' || p.id === 'trade');
    m.call = { kind: 'cover', name: 'Chokeslam + Cover', whisper: '', pop: 10, hurt: 3, favors: ['sell'], anim: 'slam' } as Match['call'];
    m.reversalQueued = true;
    m.endTurn();
    expect(m.pendingKickout).toBeNull();
  });

  it("a crowd goal reached on the opponent's move counts", () => {
    const m = new Match(config('face')) as Loose;
    atPhase(m, (p) => p.goal.kind === 'crowd');
    const before = m.goalsMet;
    m.crowd = 99;
    m.sellQueued = 2;
    m.call = { kind: 'offense', name: 'Chokeslam', whisper: '', pop: 12, hurt: 3, favors: ['sell'], anim: 'slam' } as Match['call'];
    m.endTurn();
    expect(m.goalsMet).toBe(before + 1);
  });
});
