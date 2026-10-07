/**
 * Signature storylines (§12.4), scoped down: each is a hand-picked shape, cast
 * and locked napkin slots ("inked in pen") on a gold napkin, offered by its
 * character at a friendship milestone. Open slots are filled by the mode.
 */
import type { CardId } from '../types';

export interface SignatureDef {
  id: string;
  of: string;
  title: string;
  hearts: number;
  shape: string;
  /** Fixed cast; 'player' marks the player's role. */
  cast: Record<string, string>;
  locked: Partial<Record<'hook' | 'twist' | 'stakes' | 'payoff', CardId>>;
  weeks: number;
  want: string;
}

export const SIGNATURES: SignatureDef[] = [
  {
    id: 'small_cakes', of: 'tiny', title: 'Small Cakes, Big Heart', hearts: 7, shape: 'stolen_belt',
    cast: { hero: 'tiny', villain: 'player' }, locked: { hook: 'HK-05', payoff: 'PO-11', stakes: 'ST-08' }, weeks: 3,
    want: "Somebody steals my grandma's recipe card. The tiny eight-layer one. And everybody thinks it was you. Can I tell you the rest?",
  },
  {
    id: 'once_upon_a_mountain', of: 'earl', title: 'Once Upon a Mountain', hearts: 7, shape: 'gentle_monster',
    cast: { villain: 'earl', hero: 'player' }, locked: { hook: 'HK-02', stakes: 'ST-14', payoff: 'PO-09' }, weeks: 4,
    want: 'I want the monster to lose. And read to the kids after. A book nobody knows I wrote. Will you beat me, gently?',
  },
  {
    id: 'gorgeous_under_pressure', of: 'gideon', title: 'Gorgeous Under Pressure', hearts: 7, shape: 'redemption',
    cast: { villain: 'gideon', hero: 'player' }, locked: { twist: 'TW-13', payoff: 'PO-01' }, weeks: 4,
    want: "I want to walk out there once without the mirror. I want them to boo the real me. Loudly. Lovingly. Will you be across the ring?",
  },
  {
    id: 'sundown', of: 'clint', title: 'Sundown', hearts: 8, shape: 'retirement_tour',
    cast: { villain: 'clint', hero: 'player' }, locked: { hook: 'HK-03', twist: 'TW-13', stakes: 'ST-06', payoff: 'PO-24' }, weeks: 8,
    want: "I want my last match at Harvest Havoc. I want it to be you. And I want the Bulldogger, one more time, with my girl in the building.",
  },
  {
    id: 'the_proof', of: 'professor', title: 'The Proof', hearts: 7, shape: 'grudge_match',
    cast: { villain: 'professor', hero: 'player' }, locked: { payoff: 'PO-03', stakes: 'ST-02' }, weeks: 4,
    want: "I want one perfect match. Two out of three falls, against my best student. Show your work, and I'll show mine.",
  },
  {
    id: 'tres_generaciones', of: 'mariposa', title: 'Tres Generaciones', hearts: 7, shape: 'legacy',
    cast: { hero: 'mariposa', villain: 'player' }, locked: { stakes: 'ST-11', payoff: 'PO-03' }, weeks: 5,
    want: "Abuela's lineage. My mother in the third row, flying in without telling anyone. I want someone to doubt us, and I want it to be you.",
  },
  {
    id: 'bright_lights', of: 'dex', title: 'Bright Lights, Small Town', hearts: 7, shape: 'big_city_dream',
    cast: { hero: 'dex', villain: 'player' }, locked: { hook: 'HK-15', twist: 'TW-02' }, weeks: 6,
    want: "The letter came. The big one. I want to say goodbye right, and I want to come home even better. Help me tell it?",
  },
];
