import { audio } from '../audio';
import { game } from '../core/game';
import { saveGame } from '../core/save';
import { G, type Weather } from '../core/state';
import { Rng } from '../core/rng';
import { DAY_START, DAYS_PER_SEASON, isShowDay, SEASONS, WEEKDAY_NAMES, weekday } from '../core/time';
import { narrate } from '../ui/dialog';
import { DAY_HOOKS } from '../world/hooks';
import { WORLD } from '../world/scene';

/** Advance the calendar by one day and run the morning routine. */
function rollWeather(rng: Rng): Weather {
  const season = G.time.season;
  const r = rng.next();
  if (season === 3) return r < 0.3 ? 'snow' : r < 0.4 ? 'wind' : 'sun';
  if (season === 1) return r < 0.12 ? 'storm' : r < 0.2 ? 'rain' : 'sun';
  return r < 0.22 ? 'rain' : r < 0.3 ? 'wind' : 'sun';
}

export function advanceCalendar(): void {
  const t = G.time;
  t.day++;
  if (t.day > DAYS_PER_SEASON) {
    t.day = 1;
    t.season++;
    if (t.season > 3) {
      t.season = 0;
      t.year++;
    }
  }
  t.minutes = DAY_START;
  const rng = new Rng(G.seed ^ (t.year * 997 + t.season * 131 + t.day * 7));
  G.weather.today = G.weather.tomorrow;
  G.weather.tomorrow = rollWeather(rng);
  // First days of the game stay sunny so the town makes a good impression.
  if (t.year === 1 && t.season === 0 && t.day <= 3) G.weather.today = 'sun';
  for (const r of Object.values(G.relationships)) {
    r.talkedToday = false;
    r.giftedToday = false;
    if (weekday() === 0) r.giftsThisWeek = 0;
  }
}

let sleeping = false;

/**
 * Go to bed: fade out, advance the day, restore energy, save, morning
 * hooks (newspaper, letters, story beats), then wake up at home.
 */
export async function sleep(passedOut = false): Promise<void> {
  if (sleeping) return;
  sleeping = true;
  game.sleeping = true;
  const w = WORLD;
  try {
    audio.sfx('sleep');
    audio.music(null);
    await new Promise<void>((r) => {
      // If another fade already owns the screen, don't wait on one that will never run.
      if (!game.scenes.transition(() => r(), '#0b0712')) r();
    });
    const late = G.time.minutes >= 24 * 60;
    advanceCalendar();
    const restore = passedOut ? 0.6 : late ? 0.85 : 1;
    G.player.energy = Math.round(G.player.maxEnergy * restore);
    if (w) {
      // Wake up next to the bed.
      await w.warpTo('grandma-house', 13, 7, 'down', true);
    }
    for (const h of DAY_HOOKS) await h();
    saveGame();
    audio.sfx('rooster', { volume: 0.4 });
    const t = G.time;
    const lines = [`${WEEKDAY_NAMES[weekday()]}, ${SEASONS[t.season]} ${t.day}.`];
    if (passedOut) lines.unshift('You fell asleep somewhere you should not have. Birdie found you and drove you home, muttering "kids these days" the whole way.');
    if (isShowDay()) lines.push(weekday() === 2 ? "It's *Wednesday*: show night at the VFW. Doors at 6, bell at 7." : "It's *Saturday*: show night at the Sportatorium! Doors at 6, bell at 7.");
    await narrate(...lines);
  } finally {
    sleeping = false;
    game.sleeping = false;
  }
}

let lateQueued = false;

/**
 * Called when the clock hits 2 AM. Whatever pushed the clock there (a tape crate, a shop,
 * a talk) may still be open on top of the world, and passing out underneath it warps and
 * saves behind the overlay. So wait until the world is on top and idle, then pass out.
 */
export function onLate(): void {
  if (sleeping || lateQueued) return;
  lateQueued = true;
  const go = () => {
    const w = WORLD;
    if (w && (game.blockers > 0 || w.busy || game.scenes.top !== w || game.scenes.transitioning)) {
      setTimeout(go, 200);
      return;
    }
    lateQueued = false;
    void sleep(true);
  };
  go();
}
game.clock.onLate.push(onLate);
