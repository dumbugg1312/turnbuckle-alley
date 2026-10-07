import { game } from '../../core/game';
import { G, hearts } from '../../core/state';
import { absDay, weekday } from '../../core/time';
import { narrate, toast } from '../../ui/dialog';
import { ACTIONS, onEnterMap, onNewDay, onTalk, onTick, type ActionCtx } from '../../world/hooks';
import { WORLD } from '../../world/scene';
import { availableBeats, BEATS, done, type StoryCtx, type Trigger } from './beats';
import { runHomecoming } from './finale';
import { SCENES } from './scenes';

/**
 * Main story, Spring week two through Homecoming and after. Registers every
 * hook; the beat table and its unlock conditions live in beats.ts, the scripts
 * in scenes.ts and finale.ts. Loaded by story-main/index.ts.
 */

export function ctxNow(): StoryCtx {
  return {
    abs: absDay(),
    season: G.time.season,
    day: G.time.day,
    weekday: weekday(),
    minutes: G.time.minutes,
    map: G.player.map,
    flags: G.flags,
    hearts,
    clues: [1, 2, 3, 4, 5].filter((i) => G.flags[`clue_hammers_${i}`]).length,
  };
}

let busy = false;

/** Run the first open beat for this trigger. True if a scene played. */
async function fire(trigger: Trigger): Promise<boolean> {
  if (busy || !G.flags['debuted'] || !WORLD) return false;
  const beat = availableBeats(ctxNow(), trigger)[0];
  if (!beat) return false;
  const script = beat.id === 'wi_homecoming' ? runHomecoming : SCENES[beat.id];
  if (!script) return false;
  busy = true;
  try {
    const result = await script();
    if (result !== false) {
      if (!done(G.flags, beat.id)) G.flags[`ms_${beat.id}`] = absDay();
      for (const f of beat.sets ?? []) G.flags[f] = true;
    }
  } catch (e) {
    console.error(`[story] beat ${beat.id} failed`, e);
  } finally {
    busy = false;
    WORLD?.playMapMusic();
  }
  return true;
}

// ------------------------------------------------------------ hooks

onEnterMap(async (mapId) => {
  installActions();
  if (await fire({ on: 'enter', map: mapId })) return true;
  return frontRow(mapId);
});

onTalk(async (npcId) => fire({ on: 'talk', npc: npcId }));

onNewDay(async () => {
  homecomingMorning();
  await fire({ on: 'day' });
  showHints();
});

onTick(() => {
  if (game.blockers > 0 || busy) return;
  void fire({ on: 'tick' });
});

/** Story beats that start from checking an object, wrapping whatever was registered before. */
const WRAPPED = ['velvet-mural', 'dottie-locker', 'birdie-desk'];
const FALLBACK: Record<string, string> = {
  'birdie-desk': "Birdie's desk: napkins with whole storylines on them, ticket rolls, and a bottom drawer that sticks.",
};
type Wrapped = ((ctx: ActionCtx) => Promise<void>) & { __story?: true };
function installActions(): void {
  for (const id of WRAPPED) {
    const prev = ACTIONS.get(id) as Wrapped | undefined;
    if (prev?.__story) continue;
    const fn: Wrapped = async (ctx) => {
      if (await fire({ on: 'action', id })) return;
      if (prev) await prev(ctx);
      else if (FALLBACK[id]) await narrate(FALLBACK[id]);
    };
    fn.__story = true;
    ACTIONS.set(id, fn);
  }
}
installActions();

/** On Homecoming day, the reunion replaces the regular show card. */
function homecomingMorning(): void {
  if (G.time.season === 3 && G.time.day === 27 && G.flags['reunion_set'] && !G.flags['reunion_done']) {
    const s = G.ext['shows'] as { lastShowDay?: number } | undefined;
    if (s) s.lastShowDay = absDay();
    toast('🎟 HOMECOMING tonight: the Velvet Hammers, one last time. Be at the Sportatorium by 7.');
  }
}

/** A gentle nudge the first morning a beat is waiting somewhere the player might not look. */
function showHints(): void {
  const c = ctxNow();
  for (const b of BEATS) {
    if (!b.hint || done(c.flags, b.id) || G.flags[`ms_hint_${b.id}`]) continue;
    const t = b.on[0];
    const probe: StoryCtx = { ...c, minutes: 12 * 60, weekday: 0, map: t.on === 'enter' ? t.map : b.id.startsWith('mem') || b.id === 'fa_broadcast' ? 'grandma-room' : c.map };
    if (!b.when(probe)) continue;
    G.flags[`ms_hint_${b.id}`] = true;
    toast(`📌 ${b.hint}`);
    return;
  }
}

/** After the credits: every Saturday, the front row. */
async function frontRow(mapId: string): Promise<boolean> {
  if (mapId !== 'sportatorium' || !G.flags['credits_seen'] || weekday() !== 5 || G.time.minutes < 18 * 60) return false;
  if (G.flags['ms_front_last'] === absDay()) return false;
  G.flags['ms_front_last'] = absDay();
  const lines = [
    'Front row. A1 and A2. Agnes and the Duchess, Gertrude on one lap, a plum scarf on the other.',
    'Grandma waves at you with the back of her hand. Three people boo on reflex. She glows.',
    'Agnes is explaining the card to Grandma. Grandma is explaining it back to her, better. Neither one is listening. Both are happy.',
    "Grandma doesn't know what day it is. She knows where the ring is. She's saving you a wave.",
  ];
  await narrate(lines[absDay() % lines.length], 'When your music hits tonight, she will stand up. The whole row will stand with her.');
  return false;
}
