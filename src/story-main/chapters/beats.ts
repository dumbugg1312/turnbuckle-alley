/**
 * The main story after week one, as pure data: every beat, where it can fire,
 * and the condition that unlocks it. No DOM, no game state imports, so the
 * whole year can be simulated in a unit test (tests/story-main-beats.test.ts).
 *
 * A beat is done once the flag `ms_<id>` exists; its value is the absolute day
 * it ran, so later beats can wait "a few days after" an earlier one.
 *
 * Calendar: 28-day seasons, absolute day 0 = Spring 1, year 1.
 *   Spring 0-27 · Summer 28-55 · Fall 56-83 · Winter 84-111. Day 27 = supershow.
 */

export type Flags = Record<string, number | string | boolean | undefined>;

export interface StoryCtx {
  abs: number;
  season: number;
  day: number;
  /** 0 Mon .. 6 Sun */
  weekday: number;
  minutes: number;
  map: string;
  flags: Flags;
  hearts: (id: string) => number;
  /** Velvet Hammers tapes watched (flags clue_hammers_1..5). */
  clues: number;
}

export type Trigger =
  | { on: 'enter'; map: string }
  | { on: 'talk'; npc: string }
  | { on: 'action'; id: string }
  | { on: 'day' }
  | { on: 'tick' };

export type Chapter = 'spring' | 'summer' | 'fall' | 'winter';

export interface BeatDef {
  id: string;
  chapter: Chapter;
  title: string;
  on: Trigger[];
  when: (c: StoryCtx) => boolean;
  /** Story flags the scene sets (besides ms_<id>). Used by the year simulation. */
  sets?: string[];
  /** Shown once as a toast the morning after the beat becomes available, so nobody gets stuck. */
  hint?: string;
  /** Only needed when something else didn't happen (e.g. the tapes system never found the 1983 tape). */
  fallback?: boolean;
}

// ------------------------------------------------------------ helpers

export const SEASON_DAYS = 28;
/** Absolute day of a season day in year 1. */
export const at = (season: number, day: number) => season * SEASON_DAYS + day - 1;
/** Grandma moves into Room 7 on Summer 22 (a Monday: the day Lou's envelope would have gone out). */
export const ARRIVAL_DAY = at(1, 22);

export const done = (f: Flags, id: string) => f[`ms_${id}`] !== undefined;
export const dayOf = (f: Flags, id: string) => Number(f[`ms_${id}`] ?? 1e9);
const since = (c: StoryCtx, id: string, n: number) => done(c.flags, id) && c.abs >= dayOf(c.flags, id) + n;
const showDay = (c: StoryCtx) => c.weekday === 2 || c.weekday === 5;
const showTime = (c: StoryCtx) => showDay(c) && c.minutes >= 17 * 60;
const afterShow = (c: StoryCtx, season: number) => c.season === season && c.day === 27 && c.minutes >= 21 * 60;

/** Flags the tapes team might set when the lost 1983 broadcast is watched. */
export const TAPE_1983_FLAGS = ['clue_1983_lean', 'clue_1983_clang', 'clue_1983_tears', 'clue_1983', 'clue_hammers_6', 'clue_broken_belt', 'clue_audible', 'tape_1983_watched'];
export const has1983 = (f: Flags) => TAPE_1983_FLAGS.some((k) => !!f[k]);

/** Grandma's tape memories: the Nth unlocks after N Hammers tapes, or on its own a week at a time. */
export function memoryReady(c: StoryCtx, n: number): boolean {
  if (!done(c.flags, 'su_room7')) return false;
  if (n > 1 && !done(c.flags, `mem_${n - 1}`)) return false;
  if (n > 1 && c.abs <= dayOf(c.flags, `mem_${n - 1}`)) return false; // one memory a day
  return c.clues >= n || c.abs >= ARRIVAL_DAY + 6 * n;
}

// ------------------------------------------------------------ the year

export const BEATS: BeatDef[] = [
  // ---------------------------------------------------------------- Spring
  {
    id: 'sp_mural', chapter: 'spring', title: 'Fresh Paint',
    on: [{ on: 'enter', map: 'town' }, { on: 'action', id: 'velvet-mural' }],
    when: (c) => !!c.flags.debuted && c.abs >= 7 && c.minutes >= 7 * 60 && c.minutes <= 17 * 60 + 30 && !showTime(c),
  },
  {
    id: 'sp_locker', chapter: 'spring', title: "Don't",
    on: [{ on: 'enter', map: 'lockers' }, { on: 'action', id: 'dottie-locker' }, { on: 'enter', map: 'sportatorium' }],
    when: (c) => done(c.flags, 'sp_mural') && c.abs >= 10 && !showTime(c) && (c.map !== 'sportatorium' || c.abs >= 13),
  },
  {
    id: 'sp_agnes', chapter: 'spring', title: 'Seat A1',
    on: [{ on: 'talk', npc: 'agnes' }, { on: 'enter', map: 'vfw' }, { on: 'enter', map: 'sportatorium' }],
    when: (c) => done(c.flags, 'sp_mural') && c.abs >= 11 && (c.map === 'vfw' || c.map === 'sportatorium' ? showTime(c) && c.minutes < 19 * 60 : true),
  },
  {
    id: 'sp_lou', chapter: 'spring', title: 'Padded Envelope',
    on: [{ on: 'talk', npc: 'lou' }, { on: 'enter', map: 'town' }],
    when: (c) => !!c.flags.lou_key && done(c.flags, 'sp_mural') && c.abs >= 14 && (c.map !== 'town' || (c.weekday === 0 && c.minutes >= 9 * 60 && c.minutes <= 12 * 60)),
    hint: 'Sweet Lou fishes Chokeslam Creek every morning. He mails something every Monday at ten.',
  },
  {
    id: 'sp_radio', chapter: 'spring', title: 'Thaw Brawl Countdown',
    on: [{ on: 'day' }],
    when: (c) => done(c.flags, 'sp_mural') && c.abs >= at(0, 20) && c.abs < SEASON_DAYS,
  },
  {
    id: 'sp_thawbrawl', chapter: 'spring', title: 'The Curtain',
    on: [{ on: 'enter', map: 'diner' }, { on: 'talk', npc: 'birdie' }],
    when: (c) => !!c.flags.debuted && c.abs < SEASON_DAYS && (afterShow(c, 0) || (c.season === 0 && c.day === 28)),
  },

  // ---------------------------------------------------------------- Summer
  {
    id: 'su_rumor', chapter: 'summer', title: 'Small Town',
    on: [{ on: 'talk', npc: 'birdie' }, { on: 'enter', map: 'birdie-office' }],
    when: (c) => !!c.flags.debuted && c.abs >= at(1, 3) && c.abs < ARRIVAL_DAY && !showTime(c),
  },
  {
    id: 'su_june', chapter: 'summer', title: 'Two Sugars',
    on: [{ on: 'talk', npc: 'june' }, { on: 'enter', map: 'diner' }],
    when: (c) => done(c.flags, 'su_rumor') && c.abs >= at(1, 10) && c.minutes >= 9 * 60 && c.minutes < 21 * 60,
  },
  {
    id: 'su_vanity', chapter: 'summer', title: 'A Ring of Bulbs',
    on: [{ on: 'talk', npc: 'hank' }, { on: 'enter', map: 'sportatorium' }],
    when: (c) => done(c.flags, 'su_june') && c.abs >= at(1, 15) && c.abs < ARRIVAL_DAY && !showTime(c),
  },
  {
    id: 'su_arrival', chapter: 'summer', title: 'Room 7',
    on: [{ on: 'day' }],
    when: (c) => !!c.flags.debuted && c.abs >= ARRIVAL_DAY,
    sets: ['grandma_in_town'],
  },
  {
    id: 'su_sami', chapter: 'summer', title: "Don't Correct. Connect.",
    on: [{ on: 'enter', map: 'sunnypines' }],
    when: (c) => !!c.flags.grandma_in_town,
    hint: 'Grandma is at the Evening Bell Residence on Ropewood Lane. Room 7.',
  },
  {
    id: 'su_room7', chapter: 'summer', title: 'There She Is',
    on: [{ on: 'enter', map: 'grandma-room' }],
    when: (c) => done(c.flags, 'su_sami'),
  },
  {
    id: 'su_corner', chapter: 'summer', title: 'The Corner',
    on: [{ on: 'enter', map: 'town' }],
    when: (c) => since(c, 'su_room7', 1) && c.minutes >= 14 * 60 && c.minutes <= 18 * 60 && !showTime(c),
  },
  {
    id: 'su_fury', chapter: 'summer', title: 'Every Bulb',
    on: [{ on: 'enter', map: 'diner' }, { on: 'talk', npc: 'birdie' }],
    when: (c) => !!c.flags.grandma_in_town && c.abs < 2 * SEASON_DAYS && (afterShow(c, 1) || (c.season === 1 && c.day === 28)),
  },
  {
    id: 'mem_1', chapter: 'summer', title: 'The Encore',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && memoryReady(c, 1),
    hint: 'Bring Grandma an old tape. Sundays are tape night at the Evening Bell.',
  },

  // ---------------------------------------------------------------- Fall
  {
    id: 'mem_2', chapter: 'fall', title: 'Not Without Dot',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && memoryReady(c, 2),
  },
  {
    id: 'fa_lou', chapter: 'fall', title: 'Forty Years of Mondays',
    on: [{ on: 'talk', npc: 'lou' }, { on: 'enter', map: 'airstream' }],
    when: (c) => done(c.flags, 'mem_1') && c.abs >= at(2, 1),
    hint: "Mo stopped by: \"Lou didn't mail his envelope Monday. First time in nine years. Go see him.\"",
  },
  {
    id: 'fa_doc', chapter: 'fall', title: 'Count It Fast',
    on: [{ on: 'talk', npc: 'doc' }],
    when: (c) => since(c, 'fa_lou', 2),
    hint: 'Doc Halloran left a butterscotch on your doorstep with a note: "When you have a minute. Slowly."',
  },
  {
    id: 'mem_3', chapter: 'fall', title: 'Two-Ten to the City',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && memoryReady(c, 3),
  },
  {
    id: 'fa_gus', chapter: 'fall', title: 'Five Minutes',
    on: [{ on: 'talk', npc: 'gus' }],
    when: (c) => since(c, 'fa_doc', 2),
    hint: 'Gus said on the air this morning: "And a special hello to a certain Dupree. Come see me after sign-off."',
  },
  {
    id: 'fa_hank', chapter: 'fall', title: 'The Only Key',
    on: [{ on: 'talk', npc: 'hank' }, { on: 'enter', map: 'lockers' }],
    when: (c) => since(c, 'fa_gus', 2) && !showTime(c),
    sets: ['tape_quest_ready'],
    hint: 'Hank wants you in the locker room. She did not say why. Hank never says why.',
  },
  {
    id: 'mem_4', chapter: 'fall', title: 'The First Envelope',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && memoryReady(c, 4),
  },
  {
    id: 'fa_lou_copy', chapter: 'fall', title: "Lou's Copy",
    on: [{ on: 'day' }],
    when: (c) => !!c.flags.tape_quest_ready && since(c, 'fa_hank', 8) && !has1983(c.flags),
    sets: ['tape_1983_lou'],
    fallback: true,
  },
  {
    id: 'fa_broadcast', chapter: 'fall', title: 'Go, Bird',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && done(c.flags, 'mem_3') && (has1983(c.flags) || !!c.flags.tape_1983_lou),
    hint: 'You have the 1983 tape. Watch it with the only other person who was in that ring: Room 7.',
  },
  {
    id: 'mem_5', chapter: 'fall', title: 'Two Words',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && memoryReady(c, 5),
  },
  {
    id: 'fa_birdie', chapter: 'fall', title: 'Furious',
    on: [{ on: 'talk', npc: 'birdie' }, { on: 'enter', map: 'birdie-office' }],
    when: (c) => since(c, 'fa_broadcast', 1) && !showTime(c),
    sets: ['truth_revealed', 'birdie_knows'],
    hint: 'You hold both halves of the truth now. Birdie is in her office most mornings.',
  },
  {
    id: 'fa_page_six', chapter: 'fall', title: 'Page Six',
    on: [{ on: 'talk', npc: 'birdie' }, { on: 'enter', map: 'birdie-office' }],
    when: (c) => since(c, 'fa_birdie', 7) && !showTime(c),
  },
  {
    id: 'fa_havoc', chapter: 'fall', title: 'Under the Window',
    on: [{ on: 'enter', map: 'diner' }, { on: 'talk', npc: 'birdie' }],
    when: (c) => !!c.flags.debuted && c.abs < 3 * SEASON_DAYS && (afterShow(c, 2) || (c.season === 2 && c.day === 28)),
  },

  // ---------------------------------------------------------------- Winter
  {
    id: 'wi_meeting', chapter: 'winter', title: 'Five Minutes Late',
    on: [{ on: 'talk', npc: 'birdie' }, { on: 'enter', map: 'birdie-office' }],
    when: (c) => !!c.flags.birdie_knows && c.abs >= at(3, 1) && since(c, 'fa_birdie', 3) && !showTime(c),
    hint: 'Birdie keeps getting as far as the corner. Maybe she needs somebody to walk her the rest of the way.',
  },
  {
    id: 'wi_last_match', chapter: 'winter', title: 'One More',
    on: [{ on: 'talk', npc: 'birdie' }, { on: 'enter', map: 'birdie-office' }, { on: 'action', id: 'birdie-desk' }],
    when: (c) => since(c, 'wi_meeting', 2) && !showTime(c),
    sets: ['reunion_set'],
  },
  {
    id: 'wi_robe', chapter: 'winter', title: 'The Robe',
    on: [{ on: 'talk', npc: 'marigold' }, { on: 'enter', map: 'tailor' }],
    when: (c) => since(c, 'wi_last_match', 3),
    hint: "Marigold left a note: \"THE ROBE. Come see. Bring tissues. Velma's here.\"",
  },
  {
    id: 'wi_contract', chapter: 'winter', title: 'The Table Holds',
    on: [{ on: 'enter', map: 'sportatorium' }, { on: 'talk', npc: 'birdie' }],
    when: (c) =>
      since(c, 'wi_robe', 2) &&
      (c.map === 'sportatorium' && c.weekday === 5 ? c.minutes >= 17 * 60 && c.minutes < 19 * 60 : since(c, 'wi_robe', 6) && !showTime(c)),
  },
  {
    id: 'wi_house', chapter: 'winter', title: 'October 1983',
    on: [{ on: 'enter', map: 'farm' }, { on: 'enter', map: 'grandma-house' }],
    when: (c) => since(c, 'wi_contract', 3) && c.minutes >= 8 * 60 && c.minutes <= 17 * 60 && !showTime(c),
  },
  {
    id: 'wi_curtsy', chapter: 'winter', title: 'Third Sunday',
    on: [{ on: 'talk', npc: 'grandma' }],
    when: (c) => c.map === 'grandma-room' && since(c, 'wi_house', 5),
  },
  {
    id: 'wi_eve', chapter: 'winter', title: 'Homecoming Eve',
    on: [{ on: 'day' }],
    when: (c) => !!c.flags.reunion_set && done(c.flags, 'wi_contract') && c.season === 3 && c.day === 26,
  },
  {
    id: 'wi_homecoming', chapter: 'winter', title: 'Homecoming',
    on: [{ on: 'enter', map: 'sportatorium' }, { on: 'tick' }],
    when: (c) =>
      !!c.flags.reunion_set && !c.flags.reunion_done && c.season === 3 && c.day === 27 &&
      (c.map === 'sportatorium' ? c.minutes >= 17 * 60 : c.minutes >= 18 * 60 + 30),
    sets: ['reunion_done', 'credits_seen', 'grandma_attends'],
  },
];

export const BEAT_BY_ID: Record<string, BeatDef> = Object.fromEntries(BEATS.map((b) => [b.id, b]));

/** Beats that could fire right now for this trigger (in story order). */
export function availableBeats(c: StoryCtx, trigger: Trigger): BeatDef[] {
  return BEATS.filter(
    (b) =>
      !done(c.flags, b.id) &&
      b.on.some((t) => t.on === trigger.on && ('map' in t ? t.map === (trigger as { map: string }).map : 'npc' in t ? t.npc === (trigger as { npc: string }).npc : 'id' in t ? t.id === (trigger as { id: string }).id : true)) &&
      b.when(c),
  );
}
