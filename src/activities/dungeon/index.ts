/**
 * Running the Dungeon from the world: the first-visit intro, the freight
 * elevator checkpoint menu, pushing the scene, and bringing you back to the
 * locker room afterwards (whether you walked out or a ghost carried you).
 */
import { audio } from '../../audio';
import { game } from '../../core/game';
import { G } from '../../core/state';
import { DAY_END } from '../../core/time';
import { choose, narrate, say, toast } from '../../ui/dialog';
import { WORLD } from '../../world/scene';
import { eraFor } from './eras';
import { barker, ghostPortrait } from './ghosts';
import { dungeonSave } from './save';
import { DungeonScene, ensureBeltItem, type Arrival, type ExitReason } from './scene';

let running = false;

export async function runDungeon(): Promise<void> {
  if (running) return;
  ensureBeltItem();
  const save = dungeonSave();
  const firstVisit = !save.introSeen;
  // Keyed on never having reached a floor, not on the intro: a first visit turned away
  // (too late, no energy) used to mark the intro seen and lose the tutorial for good.
  const needTutorial = save.deepest === 0;
  if (firstVisit) {
    await narrate(
      'The key turns. The gate groans open, and cold air rolls up the stairs like a crowd letting out its breath.',
      'The air smells like chalk and canvas and 1938.',
      "You think of Sweet Lou pressing the key into your palm down by the creek. *\"Birdie and your grandma trained down there, back when. Tell the old-timers Lou says hi.\"* He winked like it was a joke. It didn't feel like one.",
      'Somewhere far, far below, a bell rings once.',
    );
    save.introSeen = true;
    save.erasSeen.push('carnival');
  }
  if (G.player.energy < 2) {
    await narrate("You're running on empty. The Dungeon will still be here after you've eaten something or slept.");
    return;
  }
  if (G.time.minutes >= DAY_END - 30) {
    await narrate("It's awfully late to start a workout. Even the ghosts are yawning.");
    return;
  }
  let start = 1;
  let arrival: Arrival = 'stairs';
  if (save.elevator >= 5) {
    const opts = [{ label: 'Take the stairs (Floor 1)', value: 1, hint: eraFor(1).era.name }];
    for (let f = Math.max(5, save.elevator - 15); f <= save.elevator; f += 5) opts.push({ label: `Freight elevator: Floor ${f}`, value: f, hint: f === 30 ? 'The Golden Ring' : eraFor(f).era.name });
    const c = await choose<number>(null, 'The freight elevator clanks hello. Where to?', [...opts, { label: 'Not right now', value: 0, hint: '' }], { cancelValue: 0 });
    if (!c) return;
    start = c;
    arrival = c === 1 ? 'stairs' : 'elevator';
  }
  running = true;
  audio.sfx(arrival === 'elevator' ? 'door' : 'step');
  return new Promise<void>((resolve) => {
    const scene = new DungeonScene(start, arrival, (reason, overlay) => void leave(reason, overlay, scene.floor).then(resolve));
    // If another fade owns the screen, give up cleanly instead of hanging with `running` stuck on.
    if (!game.scenes.transition(() => game.scenes.push(scene), '#0b0712')) {
      running = false;
      resolve();
      return;
    }
    if (needTutorial) void tutorial();
  });
}

async function tutorial(): Promise<void> {
  // Wait for the fade and the floor title.
  await new Promise((r) => setTimeout(r, 1900));
  const b = barker();
  const sp = { name: b.name, sub: b.year, color: '#2f8a80', portrait: () => ghostPortrait(b), portraitBg: '#1e3a3a', voice: 'ghost' };
  await say(
    sp,
    "Step right up, step right up! A live one! Welcome to the athletic show, friend. Don't mind the ghosts, we're all regulars.",
    'See the equipment? Walk up and *work it*: press E or tap it, then hit the button when the marker crosses the *gold*. Teal is good. Gold is PERFECT, and perfect form costs half the energy.',
    'Somewhere under all this gear is a *trapdoor*. Finish enough sets and you will find it. Every five floors there is a *freight elevator* that remembers you.',
    'And if you tucker yourself out, one of us will carry you upstairs. We always do. Now go on, the crowd is waiting!',
  );
}

async function leave(reason: ExitReason, overlay: HTMLElement, floor: number): Promise<void> {
  running = false;
  game.scenes.pop();
  const w = WORLD;
  if (w) await new Promise<void>((resolve) => {
    void w.warpTo('lockers', 12, 7, 'down', true);
    // The world's own fade is hidden under our black overlay; lift it once that fade is fully dark.
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
      resolve();
    }, 380);
  });
  else overlay.remove();
  if (reason === 'leave') return;
  // Cozy pass-out: nothing lost but a little time.
  const save = dungeonSave();
  save.totals.carried++;
  if (reason === 'carried') {
    if (G.time.minutes < DAY_END - 70) game.clock.advance(60);
    G.player.energy = Math.max(G.player.energy, Math.round(G.player.maxEnergy * 0.1));
  }
  const { era } = eraFor(floor);
  await new Promise((r) => setTimeout(r, 900));
  await narrate(
    reason === 'late'
      ? 'You wake up on the locker room bench with a towel folded under your head. It is very, very late.'
      : 'You wake up on the locker room bench with a towel folded under your head and a paper cup of water beside you.',
    `A note is pinned to your shirt in spidery, old-fashioned handwriting: *"Found you snoozing on Floor ${floor}. Carried you up. You're welcome. Drink some water. -A friend from ${era.year}"*`,
    'Everything you found is still in your bag.',
  );
  toast('Carried upstairs by a friendly ghost.');
}
