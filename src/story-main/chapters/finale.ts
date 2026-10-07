import { audio } from '../../audio';
import { game } from '../../core/game';
import { G, ext, hearts, skillLevel } from '../../core/state';
import { sting } from '../../core/sting';
import { absDay } from '../../core/time';
import { NPC_BY_ID } from '../../data/npcs';
import type { Look } from '../../gfx/look';
import { MatchScene } from '../../match/scene';
import type { MatchConfig } from '../../match/types';
import { banner } from '../../ui/dialog';
import { lookFor, WORLD } from '../../world/scene';
import { finaleState } from './scenes';
import { exit, heart, M, music, N, pick, S, stage } from './stage';

/**
 * Homecoming, Winter 27: the Velvet Hammers' last match. The player and a
 * partner against Dottie and Birdie. The booked winner is always the Hammers;
 * the finish is the Encore. Then the back booth, the porch, and the credits.
 */

const looksMod = import.meta.glob<{ LOOKS_ALT?: Record<string, Look> }>('../../data/looks.ts', { eager: true });
function ringLook(id: string): Look {
  return Object.values(looksMod)[0]?.LOOKS_ALT?.[`${id}-ring`] ?? lookFor(id);
}

/** The reunion match config. Pure apart from reading the save. */
export function homecomingConfig(): MatchConfig {
  const p = G.player;
  return {
    player: {
      id: 'player',
      name: p.persona?.ringName || p.name,
      role: 'face',
      look: p.persona ? p.ringLook : p.look,
      style: 'brawler',
      chemistry: Math.min(10, hearts(finaleState().partner)),
      finisherName: p.persona?.finisherName || 'Hometown Finish',
      signatureName: p.persona?.signatureName || 'Signature Slam',
      deck: [...p.deck],
      gear: [...p.gear],
      maxGas: 30 + skillLevel('strength') * 2,
      ringIq: skillLevel('ringiq'),
    },
    opponent: {
      id: 'birdie',
      name: 'The Velvet Hammers',
      role: 'face',
      look: ringLook('birdie'),
      style: 'brawler',
      chemistry: 10,
      finisherName: 'The Encore',
      signatureName: 'The Curtsy',
    },
    winner: 'opponent',
    venue: 'sportatorium',
    stipulation: 'tag',
    title: 'The Velvet Hammers Belt',
    taste: { sell: 1.25, signature: 1.15, grapple: 1.1 },
    seed: (G.seed ^ (absDay() * 7919)) >>> 0,
    storyline: 'the-last-rematch',
  };
}

/** Grandma calls the spots from across the ring. Keys match MatchScene coach keys. */
export const HOMECOMING_COACH: Record<string, string> = {
  start: "Chère. Look at me, not the crowd. I'll call it. You follow. Just like the backyard ring.",
  call: "Bird calls the big spots. I call the pretty ones. Watch her bubble. Play what she sets up.",
  lockup: "Collar and elbow, slow, like 1976. Let them remember us before you forget yourself.",
  shine: "Here comes Bird. Take it, sweetheart. Take every punch like a love letter.",
  heat: "Now you're in trouble. Good. Sell it. Every bump makes the ending sweeter.",
  comeback: "Fire up, chère! Give them hope. They know it won't last. They'll cheer anyway. That's the whole business.",
  stretch: "Hit me with your best. I'll kick out. I've been kicking out of things my whole life.",
  kickout: "Late, chère. Kick out late. Make them believe, one more time.",
  finish: 'Sell it, sweetheart. Sell it like it\'s the last time.',
};

function playMatch(): Promise<void> {
  return new Promise((resolve) => {
    game.scenes.push(
      new MatchScene({
        config: homecomingConfig(),
        intro: { title: 'HOMECOMING', subtitle: 'The Velvet Hammers · One More Time' },
        coachId: 'grandma',
        coach: HOMECOMING_COACH,
        onDone: () => {
          game.scenes.pop();
          resolve();
        },
      }),
    );
  });
}

/** Keep the regular show system from booking its own Homecoming card tonight. */
export function claimTonight(): void {
  const s = ext<{ lastShowDay: number; card: unknown; cardDay: number; worked: boolean }>('shows', () => ({ lastShowDay: -1, card: null, cardDay: -1, worked: false }));
  s.lastShowDay = absDay();
}

export async function runHomecoming(): Promise<void> {
  claimTonight();
  const partner = finaleState().partner;
  const pName = NPC_BY_ID[partner]?.wrestler?.ringName ?? NPC_BY_ID[partner]?.short ?? 'your partner';
  if (G.player.map !== 'sportatorium') {
    await N('Pip is pounding on your door, cardboard belt and all. "It\'s HOMECOMING! Everybody\'s there! EVERYBODY!"');
  }
  if (G.time.minutes < 19 * 60) game.clock.advance(19 * 60 - G.time.minutes);
  await stage('sportatorium', 15, 18, 'up', [['agnes', 13, 16, 'up']]);
  audio.crowd(0.6);
  audio.crowdReact('cheer', 1);
  await N('Homecoming. The Sportatorium is past full. Folding chairs in the aisles. Every chair you ever found is out there with somebody in it.');
  await N("The front row: Agnes in A1, Gertrude in her lap. Beside her, A2 is empty, with a cushion on it. The Evening Bell section is already hoarse.");
  await N("At ringside, Mayor Delphine Oakes wears a tiara she has waited forty years for. Miss Homecoming, 1983. At last.");
  await banner('HOMECOMING', 1900, 30);
  await S('gus', 'Ladies and gentlemen... for the first time in forty years... a team that never lost... they only ever *stopped*...');
  await N(`Your music hits. You walk out with ${pName}, and the building gives you a roar you will hear in your sleep for years.`);
  music('theme:velvet');
  await N('Then the house lights go plum. A waltz, slow. A shuffle under it. Then both together in 6/8, finally dancing.');
  await N("The Duchess walks out in the plum robe, crown braid, white boots. In the aisle, Madame Midnight kneels and laces them herself.");
  await N('Behind her, the Commissioner, in a crimson blazer that used to be a ring robe. Two thousand people stand up without being asked.');
  await N('Doc Halloran climbs through the ropes in stripes, for the first time in forty years. Mo hands him her whistle like a torch.');
  sting('reveal');
  await playMatch();

  // ---- the finish, as the town will tell it forever
  audio.crowd(0.7);
  await N('The Encore. The Duchess sinks into a curtsy, hooks your ankle, and you go down like you practiced it for forty years.');
  await N('Birdie rolls you into the cradle. Dottie holds your legs. And across your chest, their hands find each other and hold on.');
  await N('Doc drops to the mat. And the whole town counts with him.');
  for (const n of ['ONE', 'TWO', 'THREE']) {
    audio.crowdReact('count', 1);
    await banner(n, n === 'THREE' ? 1800 : 1300, n === 'THREE' ? 40 : 34);
  }
  audio.crowdReact('cheer', 1);
  await N('The slowest three-count in the history of the territory. Nobody minds.');
  await N('Agnes stood up first. She will sit down last.');
  await N("Hank climbs in with both halves of the belt: Birdie's from the velvet sash, Dottie's from the hatbox. Marigold brings new leather.");
  await N('Into the center plate, Hank presses a red rhinestone she has kept in a jar of screws for forty years. It clicks.');
  sting('heart-up');
  await N('The belt is whole. The Duchess and the Commissioner raise it together, one side each, and the roof very nearly comes off.');
  await M('grandma', 'love', 'We won, chère. Did you see? We won.');
  const c = await pick(null, [
    { label: '"I saw."', value: 'saw' },
    { label: '"You were magnificent."', value: 'mag' },
  ]);
  if (c === 'mag') await M('grandma', 'smug', "I know. But it's nice to hear it in your voice.");
  else await M('grandma', 'love', 'Good. Somebody had to. I might forget it by Tuesday. You keep it for me.');
  await M('birdie', 'happy', 'Up off my canvas, sugar. You lost beautifully. Best loss I ever saw.');
  G.flags['reunion_done'] = true;
  G.showHistory.push({ day: absDay(), venue: 'sportatorium', attendance: 2000, gate: 20000, playerStars: 5, headline: 'Homecoming: The Velvet Hammers', review: '' });
  heart(partner, 60);
  heart('birdie', 60);
  heart('grandma', 60);
  exit('agnes');
  audio.crowd(0);
  await epilogue();
}

async function epilogue(): Promise<void> {
  game.clock.advance(Math.max(0, 22 * 60 + 30 - G.time.minutes));
  music('theme:grandma');
  await stage('diner', 14, 6, 'right', [['grandma', 16, 6, 'left'], ['birdie', 16, 7, 'left'], ['june', 15, 4, 'down']]);
  await N('The Hot Tag, after. The back booth. Two women side by side in it for the first time in forty years.');
  await N('June slides one chocolate milkshake across the table. Two straws.');
  await S('june', "Don't look at me like that. I'm not made of money.");
  await N('Grandma runs a finger along the carved initials in the tabletop. *B.M. D.D. J.O. S.L.*');
  await M('grandma', 'love', 'They held, June.');
  await S('june', "Course they held, baby. I'm furniture.");
  await N('In the corner, Lou sings the second verse of his old song, and nobody stops him.');
  await S('birdie', 'Hey, Dot. Gin?');
  await M('grandma', 'smug', 'Only if I can cheat.');
  await M('birdie', 'happy', "Wouldn't be gin otherwise.");
  await N('Later. Ropewood Lane. Birdie\'s porch, under the porch light the moths love.');
  await stage('town', 23, 14, 'up', [['birdie', 22, 13, 'down'], ['grandma', 24, 13, 'down']]);
  music('ending');
  await N('Two rocking chairs. For forty years, only one of them ever rocked.');
  await N('Tonight they both squeak. Loudest porch on the street.');
  await N('The Duchess falls asleep first, mid-sentence, in the middle of a story about a cow they won in 1979. Birdie tucks a blanket around her.');
  await S('birdie', 'Go on home, sugar. We are fine. We are more than fine.');
  await M('birdie', 'love', '...Hey. Thank you. For being five minutes early.');
  exit('grandma', 'birdie', 'june');
  const { playCredits } = await import('../../scenes/credits');
  await playCredits();
  G.flags['credits_seen'] = true;
  G.flags['grandma_attends'] = true;
  await WORLD?.warpTo('grandma-house', 13, 7, 'down');
  await N('The story goes on. Every Saturday from now on, the front row has two seats taken: A1 and A2.', 'When your music hits, Grandma stands up. She will not always know why. The whole row stands with her.');
}
