import type { Rng } from '../core/rng';
import type { Call, PhaseId } from './types';

/** Offensive moves an opponent can call, by style. pop = crowd value if sold. */
const OFFENSE: Record<string, { name: string; pop: number; hurt: number; anim: string }[]> = {
  powerhouse: [
    { name: 'Shoulder Tackle', pop: 7, hurt: 3, anim: 'strike' },
    { name: 'Spinebuster', pop: 11, hurt: 4, anim: 'slam' },
    { name: 'Bearhug', pop: 6, hurt: 3, anim: 'hold' },
    { name: 'Military Press Slam', pop: 13, hurt: 5, anim: 'lift' },
    { name: 'Running Powerslam', pop: 12, hurt: 5, anim: 'slam' },
  ],
  giant: [
    { name: 'Chokeslam', pop: 14, hurt: 5, anim: 'bomb' },
    { name: 'Big Boot', pop: 10, hurt: 4, anim: 'kick' },
    { name: 'Nerve Hold', pop: 5, hurt: 2, anim: 'hold' },
    { name: 'Avalanche Splash', pop: 12, hurt: 5, anim: 'strike' },
    { name: 'Two-Handed Choke', pop: 9, hurt: 4, anim: 'hold' },
  ],
  highflyer: [
    { name: 'Springboard Dropkick', pop: 10, hurt: 3, anim: 'kick' },
    { name: 'Corkscrew Plancha', pop: 13, hurt: 4, anim: 'dive' },
    { name: 'Enziguri', pop: 9, hurt: 3, anim: 'kick' },
    { name: 'Tornado DDT', pop: 12, hurt: 4, anim: 'slam' },
  ],
  luchador: [
    { name: 'Tijeras', pop: 9, hurt: 3, anim: 'aerial' },
    { name: 'Tope con Hilo', pop: 14, hurt: 4, anim: 'dive' },
    { name: 'Satellite Headscissors', pop: 11, hurt: 3, anim: 'aerial' },
    { name: 'La Mística', pop: 12, hurt: 3, anim: 'hold' },
  ],
  technician: [
    { name: 'Hammerlock', pop: 5, hurt: 2, anim: 'hold' },
    { name: 'Dragon Screw', pop: 9, hurt: 3, anim: 'slam' },
    { name: 'Bridging Suplex', pop: 12, hurt: 4, anim: 'suplex' },
    { name: 'Crossface', pop: 10, hurt: 3, anim: 'hold' },
    { name: 'European Uppercut', pop: 7, hurt: 3, anim: 'strike' },
  ],
  brawler: [
    { name: 'Haymaker', pop: 8, hurt: 3, anim: 'strike' },
    { name: 'Headbutt', pop: 7, hurt: 3, anim: 'strike' },
    { name: 'Piledriver', pop: 13, hurt: 5, anim: 'bomb' },
    { name: 'Ringside Brawl', pop: 11, hurt: 4, anim: 'strike' },
    { name: 'Corner Stomps', pop: 8, hurt: 3, anim: 'kick' },
  ],
  // Dungeon ghosts with the 'heel' style (rule-benders, matching STYLE_POOLS.heel).
  heel: [
    { name: 'Eye Rake', pop: 7, hurt: 2, anim: 'strike' },
    { name: 'Rope-Assisted Choke', pop: 8, hurt: 3, anim: 'hold' },
    { name: 'Low Blow Behind the Ref', pop: 9, hurt: 3, anim: 'kick' },
    { name: 'Snap DDT', pop: 12, hurt: 4, anim: 'slam' },
    { name: 'Feet-on-the-Ropes Cover', pop: 10, hurt: 3, anim: 'hold' },
  ],
  showman: [
    { name: 'Strut & Jab', pop: 7, hurt: 2, anim: 'strike' },
    { name: 'Sequined Elbow', pop: 10, hurt: 3, anim: 'drop' },
    { name: 'Hair-Pull Toss', pop: 8, hurt: 3, anim: 'slam' },
    { name: 'Figure-Four', pop: 11, hurt: 3, anim: 'hold' },
  ],
};

const SETUPS: Call[] = [
  { kind: 'setup', name: 'Corner', whisper: 'Put me in the corner.', pop: 0, favors: ['strike'], sets: { opp: 'cornered' } },
  { kind: 'setup', name: 'Goes down hard', whisper: "I'm going down. Come get me.", pop: 0, favors: ['aerial', 'submission'], sets: { opp: 'down' } },
  { kind: 'setup', name: 'Groggy', whisper: "I'm out on my feet. Pick me up.", pop: 0, favors: ['grapple'], sets: { opp: 'groggy' } },
  { kind: 'setup', name: 'Charges in', whisper: "I'll charge. Catch me!", pop: 0, favors: ['grapple', 'strike'], sets: { opp: 'standing' } },
  { kind: 'setup', name: 'Begs off', whisper: "I'll beg. Make 'em love you.", pop: 0, favors: ['taunt'], sets: { opp: 'standing' } },
];
const OUTSIDE: Call = { kind: 'setup', name: 'Rolls outside', whisper: "I'm rolling out. Fly!", pop: 0, favors: ['aerial'], sets: { opp: 'outside' } };
const BIG_ONE: Call = { kind: 'setup', name: 'Calls for the big one', whisper: 'Hit me with the big one!', pop: 0, favors: ['signature', 'grapple', 'aerial'], sets: { opp: 'groggy' } };
const LOCKUP: Call = { kind: 'setup', name: 'Collar-and-elbow', whisper: 'Lock up. Nice and slow.', pop: 0, favors: ['grapple', 'submission'], sets: { opp: 'standing' } };

export function offenseMoves(style: string) {
  return OFFENSE[style] ?? OFFENSE.brawler;
}

/** Decide what the opponent calls this turn. */
export function makeCall(opts: {
  rng: Rng;
  phase: PhaseId;
  oppOnOffense: boolean;
  turnInPhase: number;
  style: string;
  finisherName: string;
  playerWins: boolean;
  lastCallName?: string;
  stretchTurn: number;
}): Call {
  const { rng, phase, style } = opts;
  if (phase === 'lockup') return { ...LOCKUP };
  if (phase === 'finish') {
    if (opts.playerWins)
      return { kind: 'setup', name: 'Ready for the finish', whisper: "Now. Take me home.", pop: 0, favors: ['finisher'], sets: { opp: 'groggy' } };
    return { kind: 'finisher', name: opts.finisherName, whisper: "Here it comes. Sell it big.", pop: 18, hurt: 0, favors: ['sell'], anim: 'finisher' };
  }
  if (phase === 'heat' && opts.oppOnOffense && opts.turnInPhase === 0)
    return { kind: 'cutoff', name: 'Cheap Shot!', whisper: "I'm cutting you off. Sell it.", pop: 8, hurt: 3, favors: ['sell'], anim: 'strike' };
  if (phase === 'stretch') {
    // Alternate: big move + cover on the opponent's turns, setups for the player.
    if (opts.stretchTurn % 2 === 1) {
      const m = rng.pick(offenseMoves(style).filter((x) => x.pop >= 10));
      return { kind: 'cover', name: m.name + ' + Cover', whisper: 'Big move, then I cover. Kick out late!', pop: m.pop + 2, hurt: m.hurt, favors: ['sell'], anim: m.anim };
    }
    return { ...(rng.chance(0.5) ? BIG_ONE : rng.pick(SETUPS)) };
  }
  if (opts.oppOnOffense) {
    if (rng.chance(0.18)) return { kind: 'rest', name: 'Rest Hold', whisper: 'Resting. Fight it, get them behind you.', pop: 5, hurt: 1, favors: ['sell'], anim: 'hold' };
    const pool = offenseMoves(style).filter((m) => m.name !== opts.lastCallName);
    const m = rng.pick(pool);
    const boost = phase === 'comeback' ? 3 : 0;
    return { kind: 'offense', name: m.name, whisper: rng.pick(['Sell this one.', 'Here it comes.', "Ready? Big one.", 'Take it nice.']), pop: m.pop + boost, hurt: m.hurt, favors: ['sell'], anim: m.anim };
  }
  // Player on offense: the partner sets up spots.
  const options = [...SETUPS];
  if (style === 'highflyer' || style === 'luchador' || rng.chance(0.25)) options.push(OUTSIDE);
  if (phase === 'comeback') options.push(BIG_ONE, BIG_ONE);
  let c = rng.pick(options);
  if (c.name === opts.lastCallName) c = rng.pick(options);
  return { ...c };
}
