import { audio } from '../audio';
import { game } from '../core/game';
import { G, setFlag, addItem, hasItem } from '../core/state';
import { sting } from '../core/sting';
import { absDay, weekday } from '../core/time';
import { NPC_BY_ID } from '../data/npcs';
import { MatchScene } from '../match/scene';
import { buildMatchConfig } from '../systems/shows';
import { sendLetter } from '../systems/mail';
import { choose, narrate, say, toast } from '../ui/dialog';
import { doorRule, onEnterMap, onNewDay, onTalk } from '../world/hooks';
import { WORLD } from '../world/scene';
import { makeApi, speakerFor } from '../world/talk';
import { apartmentScene, arrivalScene, farmArrival, firstNight, officeScene, openCreator } from './opening';
import { LETTERS } from './letters';

// Later chapters (Summer → Homecoming) register their own hooks when present.
import.meta.glob('./chapters/index.ts', { eager: true });

/**
 * The main story: the prologue, the first week (Birdie, the tryout, Marigold,
 * the debut), Lou's key, Grandma's letters and calls. Later chapters live in
 * chapters.ts.
 */
const once = (flag: string) => {
  if (G.flags[flag]) return false;
  G.flags[flag] = true;
  return true;
};

onEnterMap(async (mapId) => {
  if (mapId === 'maxx-office' && G.flags['prologue'] && once('office_done')) {
    await officeScene();
    return true;
  }
  if (mapId === 'apartment' && G.flags['prologue'] && once('apartment_done')) {
    await apartmentScene();
    return true;
  }
  if (mapId === 'town' && G.flags['arrived'] && once('met_pip')) {
    await arrivalScene();
    return true;
  }
  if (mapId === 'farm' && G.flags['arrived'] && once('seen_farm')) {
    await farmArrival();
    return true;
  }
  if (mapId === 'grandma-house' && G.flags['arrived'] && once('first_night')) {
    await firstNight();
    return true;
  }
  if (mapId === 'sportatorium' && G.flags['arrived'] && !G.flags['met_birdie'] && absDay() >= 1) {
    await meetBirdie();
    return true;
  }
  if (mapId === 'tailor' && G.flags['met_birdie'] && !G.player.persona) {
    await marigoldPersona();
    return true;
  }
  return false;
});

// Day one: the Sportatorium is locked up tight.
doorRule('sportatorium', () => {
  if (G.flags['arrived'] && absDay() === 0 && !G.flags['met_birdie']) return 'The big barn doors are chained shut. A hand-painted sign: *CLOSED TIL WEDNESDAY.* Through a crack you hear someone inside singing, very loudly and very off-key.';
  return null;
});

onNewDay(async () => {
  if (absDay() === 1 && !G.flags['met_birdie']) {
    await narrate("Someone knocked while you slept. There's a note pinned to the front door with a thumbtack shaped like a tiny boot:", '*"Sportatorium. Ten o\'clock. Don\'t be late, you\'ve got her timing. - B.M."*', "Small towns. Somebody saw the lights on at the Dupree place.");
  }
  // Grandma's letters arrive in the mailbox.
  for (const l of LETTERS) if (l.when()) sendLetter(l.letter);
  if (G.flags['debuted'] && weekday() === 0 && G.ext['mail'] && (G.ext['mail'] as { inbox: unknown[] }).inbox.length) {
    toast('📬 You have mail at home.');
  }
});

// ------------------------------------------------------------ Birdie & the tryout

async function meetBirdie(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  setFlag('met_birdie');
  w.spawnTemp('birdie', 15, 15, 'up');
  w.spawnTemp('dex', 16, 9, 'down');
  const b = speakerFor('birdie');
  audio.music('sportatorium');
  await narrate('The Sportatorium. Rafters full of old banners, a ring in the middle like an altar, and the smell of popcorn that has soaked into the wood for ninety years.', 'A short woman in a crimson velvet blazer is sweeping the ring apron and singing at the top of her lungs. She stops when she sees you.');
  await say(b, '...Well. Look at that chin.', "You've got her chin, sugar. And her terrible timing. I said ten o'clock.");
  const c = await choose(b, 'She looks you over like a promoter counting a house.', [
    { label: "I'm Dottie Dupree's grandkid.", value: 'grandkid' },
    { label: "I want to learn to wrestle.", value: 'learn' },
  ]);
  if (c === 'grandkid') await say(b, "I know whose grandkid you are. Whole town knows. Mo saw your light on at midnight and called me at 12:01.", "I don't do favors for Duprees.");
  else await say(b, "Everybody wants to learn to wrestle. Nobody wants to learn to *fall.*", "I don't do favors for Duprees, by the way. Just so we're clear.");
  await say(b, "...But I'm short a body for Wednesday, and you look like you could take a bump without crying.", "*Dex!* Get in here. Let's see what the city sent us.");
  await w.walkTo('dex', 14, 9, 'down');
  await say(speakerFor('dex'), "Hey! You're the new one? Cool cool cool. Don't worry, I'll make you look good. That's literally the job.");
  await say(b, "Get in the ring. Show me something. And *listen to him*. In this business you don't beat your opponent. You dance with them.");
  // The tryout match: an exhibition with coaching.
  await new Promise<void>((resolve) => {
    const cfg = buildMatchConfig(
      { id: 'tryout', kind: 'match', title: 'Tryout', participants: ['player', 'dex'], playerInvolved: true, slot: 'opener', match: { opponent: 'dex', winner: 'player', playerRole: 'face', opponentRole: 'face' } },
      'sportatorium',
    );
    cfg.short = true;
    cfg.venue = 'sportatorium';
    game.scenes.push(
      new MatchScene({
        config: cfg,
        intro: { title: 'TRYOUT!' },
        coachId: 'birdie',
        coach: {
          start: "Alright sugar. Those cards at the bottom are your moves. Tap one to do it. The gold coin is your energy: three a turn. When you're out, hit *End Turn*.",
          call: "See Dex's speech bubble? That's him *calling the spot*. You work WITH him. Play what he's setting up and the crowd eats it up.",
          trade: 'Now go back and forth. Watch the crowd meter on the left. That is the only score that matters in this building.',
          finish: "Your finisher's in your hand now. Take it home.",
        },
        onDone: () => {
          game.scenes.pop();
          resolve();
        },
      }),
    );
  });
  G.player.matches++;
  await say(b, "...Hm.", "You *listened.* Most kids from the city don't. They come in here wanting to win. Nobody wins, sugar. The *people* win, or nobody does.");
  await say(b, "You're on Wednesday's card at the VFW. Opener. You'll be working with Big Earl. You're losing, and you're going to make him look like a million bucks.", "And go see Marigold at the sewing shop on Second Street. You can't wrestle in *jeans*.");
  await say(speakerFor('dex'), "Welcome to the Alley! Hey, sell for Earl like he's a mountain falling on you. Because he kind of is.");
  w.despawn('dex');
  w.despawn('birdie');
  sting('story-beat');
  toast('📌 New goal: visit Marigold at Sew What? on Second Street.');
}

async function marigoldPersona(): Promise<void> {
  const m = speakerFor('marigold');
  await say(m, "Oh! You're the Dupree kid. Birdie called. Birdie *never* calls, she just appears.", "Okay. Okay okay okay. Stand there. Arms out. Let's find out who you are *in the ring*.");
  await say(m, "Everybody in this town has two of themselves: the one at the grocery store and the one under the lights. Let's make yours.");
  await openCreator('ring');
  if (!G.player.persona) {
    // Creator not available: give a sensible default persona.
    G.player.persona = {
      ringName: `${G.player.name} "The Natural"`,
      nickname: 'The Natural',
      hailingFrom: 'The City',
      catchphrase: 'Ring the bell!',
      alignment: 'face',
      signatureName: 'Hometown Spinebuster',
      finisherName: 'Alley Oop Bomb',
      finisherStyle: 'power',
      entrance: { walk: 'confident', taunt: 'point', pyro: 'sparks', light: 'gold' },
      theme: { style: 'rock', tempo: 140, seed: 7 },
    };
    G.player.ringLook = { ...G.player.look, top: 'singlet', topColor: '#d8434b', bottom: 'trunks', bottomColor: '#2b2140', shoes: 'wrestling-boots', shoesColor: '#f2f2f2' };
  }
  await say(m, `*${G.player.persona.ringName}.*`, "...Yeah. Yeah, I can see it. The people are going to *love* you. Or hate you. Either way they'll buy a shirt.");
  sting('level-up');
  toast(`🎤 Introducing: ${G.player.persona.ringName}! Wednesday at the VFW, 7 PM.`);
}

// ------------------------------------------------------------ Lou and the Dungeon key

onTalk(async (npcId) => {
  if (npcId !== 'lou') return false;
  if (!G.flags['debuted'] || G.flags['lou_key'] || hasItem('dungeon-key')) return false;
  if (G.player.matches < 3 && absDay() < 9) return false;
  const l = speakerFor('lou');
  await narrate('Sweet Lou doesn\'t look up from his fishing line.');
  await say(l, "Saw your match Saturday. You sold that elbow like it owed you money.", "Your grandma used to do that. Take a shot, turn it into a story. Made the whole building lean forward.");
  await say(l, "Here.", "*(He presses a heavy iron key into your hand. It's warm, like it's been in his pocket for forty years.)*");
  addItem('dungeon-key', 1);
  setFlag('lou_key');
  sting('item-get');
  await say(l, "Under the Sportatorium. Locker room, back corner. Birdie and Dottie trained down there every morning for fifteen years.", "It goes deeper than it should. Don't ask me how. Some places just *remember* how to be gyms.", "If you see anybody down there who looks like they're from 1938... say hi. They're friendly. Mostly.");
  toast('🗝 The Dungeon is open: the stairs in the Sportatorium locker room.');
  return true;
});

// The first show sets 'debuted' (shows.ts calls this after the player's first match).
export function markDebut(): void {
  if (once('debuted')) {
    void (async () => {
      await narrate('Your first match is in the books. Somewhere, a ten-year-old with a cardboard belt has a new favorite wrestler.');
      sendLetter(LETTERS[0].letter);
    })();
  }
}

/** Expose the EventApi for chapters. */
export const api = () => makeApi('birdie');
void NPC_BY_ID;
