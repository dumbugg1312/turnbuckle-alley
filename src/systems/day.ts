import { audio } from '../audio';
import { game } from '../core/game';
import { saveGame } from '../core/save';
import { G, type Weather } from '../core/state';
import { Rng } from '../core/rng';
import { absDay, DAY_START, DAYS_PER_SEASON, isShowDay, isSupershow, SEASONS, SUPERSHOWS, WEEKDAY_NAMES, weekday } from '../core/time';
import { narrate } from '../ui/dialog';
import { DAY_HOOKS } from '../world/hooks';
import { WORLD } from '../world/scene';
import { dayLog, resetDayLog, summarizeToday } from './daylog';
import { pickNightLine } from './goodnight-lines';
import { beginMorning, endMorning, morningBundle } from './morning';

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

/** The goodnight page: today in Grandma's notebook, before the lights go out. */
async function goodnight(passedOut: boolean, late: boolean): Promise<void> {
  const summary = summarizeToday();
  const log = dayLog();
  const line = pickNightLine({ summary, abs: absDay(), weekday: weekday(), season: G.time.season, weather: G.weather.today, passedOut, late }, log.lastLine);
  log.lastLine = line.text;
  const t = G.time;
  const { showGoodnight } = await import('../ui/notebook');
  await showGoodnight({ dateLine: `${WEEKDAY_NAMES[weekday()]},`, subLine: `${SEASONS[t.season]} ${t.day} · Year ${t.year}`, summary, line, passedOut });
}

/** Breakfast: the date, the sky, the paper and the mail, all on one table. */
async function breakfast(passedOut: boolean): Promise<void> {
  const t = G.time;
  const b = morningBundle();
  const lines: string[] = [];
  if (passedOut) lines.push('You fell asleep somewhere you should not have. Birdie found you and drove you home, muttering *"kids these days"* the whole way.');
  lines.push(...b.overnight);
  let showLine: string | null = null;
  if (isShowDay()) {
    if (isSupershow()) showLine = `${SUPERSHOWS[t.season]} tonight · The Sportatorium · Doors 6, bell 7`;
    else showLine = weekday() === 2 ? 'Show night · VFW Hall · Doors 6, bell 7' : 'Show night · The Sportatorium · Doors 6, bell 7';
  }
  const [{ showBreakfast }, mail, { showPaper }] = await Promise.all([import('../ui/notebook'), import('./mail'), import('./paper')]);
  await showBreakfast({
    weekday: WEEKDAY_NAMES[weekday()],
    date: `${SEASONS[t.season]} ${t.day} · Year ${t.year}`,
    today: G.weather.today,
    tomorrow: G.weather.tomorrow,
    showLine,
    lines,
    paper: b.paper,
    letters: [...mail.mailState().inbox],
    openPaper: (p) => showPaper(p),
    openLetter: (l) => mail.openLetter(l),
  });
}

/**
 * Go to bed: the goodnight page, a fade, the calendar turns, energy comes
 * back, the game saves, the morning hooks run (paper, letters, story beats,
 * surprises), and breakfast is on the table when you wake.
 */
export async function sleep(passedOut = false): Promise<void> {
  if (sleeping) return;
  sleeping = true;
  const w = WORLD;
  try {
    audio.sfx('sleep');
    audio.music(null);
    const late = G.time.minutes >= 24 * 60;
    try {
      await goodnight(passedOut, late);
    } catch (e) {
      // A page that fails to draw must never keep anyone awake.
      console.error('[day] goodnight page failed', e);
    }
    await new Promise<void>((r) => {
      // If another fade already owns the screen, don't wait on one that will never run.
      if (!game.scenes.transition(() => r(), '#0b0712')) r();
    });
    advanceCalendar();
    resetDayLog();
    const restore = passedOut ? 0.6 : late ? 0.85 : 1;
    G.player.energy = Math.round(G.player.maxEnergy * restore);
    if (w) {
      // Wake up next to the bed.
      await w.warpTo('grandma-house', 13, 7, 'down', true);
    }
    beginMorning();
    try {
      for (const h of DAY_HOOKS) await h();
    } finally {
      endMorning();
    }
    saveGame();
    audio.sfx('rooster', { volume: 0.4 });
    try {
      await breakfast(passedOut);
    } catch (e) {
      console.error('[day] breakfast failed', e);
      const t = G.time;
      await narrate(`${WEEKDAY_NAMES[weekday()]}, ${SEASONS[t.season]} ${t.day}.`);
    }
  } finally {
    sleeping = false;
  }
}

/** Called when the clock hits 2 AM. */
export function onLate(): void {
  void sleep(true);
}
game.clock.onLate.push(onLate);
