import type { DaySummary } from './daylog';

/**
 * The line on the goodnight page. The notebook is Grandma's: you write your
 * day under hers, and your eye always lands on something she wrote decades
 * ago on a day a lot like yours. Every line is hers, dated, in her voice:
 * dry, a little vain, fond of Bird, no advice.
 */
export interface NightLine {
  date: string;
  text: string;
}

export interface NightCtx {
  summary: DaySummary;
  /** 0-based absolute day. */
  abs: number;
  weekday: number;
  season: number;
  weather: string;
  passedOut: boolean;
  late: boolean;
}

type Cat = { id: string; when: (c: NightCtx) => boolean; lines: NightLine[] };
const l = (date: string, text: string): NightLine => ({ date, text });

/** Highest priority first. */
export const NIGHT_LINES: Cat[] = [
  {
    id: 'first-night',
    when: (c) => c.abs === 0,
    lines: [l("Oct. '83", 'Packed one bag. Left the porch light on. Somebody will want to find the place.')],
  },
  {
    id: 'passed-out',
    when: (c) => c.passedOut,
    lines: [
      l("Jul. '76", 'Fell asleep in the truck in my boots. Bird put her jacket over me and told everybody I snored. I do not snore. I breathe with conviction.'),
      l("Feb. '80", 'Two in the morning in a parking lot in Monroe, eating crackers out of the box like a raccoon. Glamour.'),
    ],
  },
  {
    id: 'win',
    when: (c) => !!c.summary.show && c.summary.show.stars !== null && c.summary.wins > 0,
    lines: [
      l("May '74", "Won in Lafayette. Can't remember a thing after the bell. It all comes back Thursday, in the bath."),
      l("Aug. '81", 'Hand raised in Beaumont. Ate a whole plate of something with gravy on it. That is my entire system.'),
      l("Nov. '77", 'Won tonight. My ears are still ringing. I could listen to that ringing all week.'),
    ],
  },
  {
    id: 'loss-good',
    when: (c) => !!c.summary.show && (c.summary.show.stars ?? 0) >= 3 && c.summary.wins === 0,
    lines: [
      l("Jan. '78", 'Lost in Monroe. The back row stood up anyway. Bought new boots with it.'),
      l("Sep. '80", 'Lost to the Cardinals. A lady in the front row hit one of them with her purse on my behalf. I would marry her if she asked.'),
      l("Jun. '75", 'Lost. Bird said I sold the arm so well she nearly called a doctor. She did not. Bird does not call anybody.'),
    ],
  },
  {
    id: 'loss-rough',
    when: (c) => !!c.summary.show && c.summary.show.stars !== null && c.summary.wins === 0,
    lines: [
      l("Apr. '79", 'Rough one in Baton Rouge. The ring was a mile wide and the ropes kept moving. Ice, aspirin, bath. Not watching the tape till Tuesday.'),
      l("Dec. '76", "Ugly night. Bird bought me a milkshake and didn't say one word about it, which is the nicest thing she knows how to do."),
    ],
  },
  {
    id: 'practice',
    when: (c) => c.summary.matches > 0,
    lines: [
      l("Mar. '73", 'First time in a real ring. It is louder than you would think. The mat talks back.'),
      l("Oct. '74", 'Bumped in the barn all afternoon. Hay in my hair at supper. Mama asked no questions, bless her.'),
    ],
  },
  {
    id: 'show-missed',
    when: (c) => !!c.summary.show?.missed,
    lines: [l("Jun. '79", 'Missed the show for a wedding. Spent the whole reception doing the card in my head. The bride caught me mouthing a finish.')],
  },
  {
    id: 'show-watched',
    when: (c) => !!c.summary.show && c.summary.show.stars === null,
    lines: [l("Feb. '82", 'Worked the curtain tonight. Saw everything and nobody saw me. Best seat in the house, honestly.')],
  },
  {
    id: 'new-people',
    when: (c) => c.summary.newPeople.length > 0,
    lines: [
      l("Apr. '73", 'Met a girl today who throws a punch like she is mailing a letter. Bird something. We will see.'),
      l("Aug. '79", 'Somebody new at the Hot Tag asked if I was the Duchess. I said only on weekends.'),
      l("Jun. '76", 'Met the new referee. He shook my hand like it might go off. I liked him right away.'),
    ],
  },
  {
    id: 'many-people',
    when: (c) => c.summary.talked.length >= 5,
    lines: [
      l("May '80", 'Talked to half the town between the bank and the diner. Got home with no groceries and a casserole I did not ask for.'),
      l("Jul. '82", 'Main Street took two hours today. Everybody had something to say about Saturday.'),
    ],
  },
  {
    id: 'surprise',
    when: (c) => c.summary.notes.some((n) => n.startsWith('surprise:')),
    lines: [
      l("Apr. '81", 'Somebody left a pie on the windowsill. No note. I ate a third of it standing up.'),
      l("Sep. '78", 'Found a jar of pickles on the porch with a bow on it. Still do not know who. Still thinking about those pickles.'),
    ],
  },
  {
    id: 'chairs',
    when: (c) => c.summary.chairs > 0,
    lines: [
      l("May '75", 'Found a folding chair in the ditch by the church. Hosed it off. It is a good chair. Somebody will scream in it Saturday.'),
      l("Sep. '76", 'Bird and I carried forty chairs up Main Street for the show. My arms still think it is Saturday.'),
    ],
  },
  {
    id: 'flush',
    when: (c) => c.summary.moneyDelta >= 100,
    lines: [
      l("Jun. '77", 'Payday. Put a five under the sugar bowl for later me. Later me was very grateful.'),
      l("Aug. '78", 'Got paid in cash and a ham. The ham was the better deal.'),
    ],
  },
  {
    id: 'spent',
    when: (c) => c.summary.moneyDelta <= -60,
    lines: [
      l("Mar. '80", 'Spent too much at the hardware store. You cannot be sad holding a new hammer.'),
      l("Oct. '81", 'New boots. Broke till Saturday. Worth it. They squeak on the turn.'),
    ],
  },
  {
    id: 'storm',
    when: (c) => c.weather === 'storm',
    lines: [l("Aug. '79", 'Storm took the power out. Played gin by candlelight. Bird cheated. Then I cheated. We called it even.')],
  },
  {
    id: 'rain',
    when: (c) => c.weather === 'rain',
    lines: [
      l("Apr. '78", 'Rained all day. Bird and I ran the ropes in the barn till the roof stopped leaking or we stopped caring.'),
      l("Jun. '81", 'Rain on the porch roof. Best band in the parish and it does not take requests.'),
    ],
  },
  {
    id: 'snow',
    when: (c) => c.weather === 'snow',
    lines: [l("Jan. '77", 'Snow! The whole town came out and stood in it like they had won something.')],
  },
  {
    id: 'wind',
    when: (c) => c.weather === 'wind',
    lines: [l("Mar. '82", 'Wind blew every flyer off the board on Main. Half the town showed up at the wrong church.')],
  },
  {
    id: 'late',
    when: (c) => c.late,
    lines: [l("Mar. '79", 'Home at one. Kettle on, boots off, ice on the knee. In that order or the knee complains.')],
  },
  {
    id: 'alone',
    when: (c) => c.summary.talked.length === 0,
    lines: [
      l("Jan. '81", 'Did not say ten words today. The yard and I had an understanding.'),
      l("Nov. '79", 'Quiet day. Even the radio had nothing to say.'),
    ],
  },
  {
    id: 'sunday',
    when: (c) => c.weekday === 6,
    lines: [l("Sun. '80", 'Sunday. Did nothing on purpose, which is harder than it sounds.')],
  },
  {
    id: 'season',
    when: () => true,
    lines: [],
  },
  {
    id: 'any',
    when: () => true,
    lines: [
      l("May '77", 'Nothing happened today. I would like a few more of those, please.'),
      l("Feb. '79", 'Fixed the screen door. It still bangs, but now it bangs on purpose.'),
      l("Sep. '82", 'Bird came by for supper and stayed till the radio signed off. We did not talk about work once. Well. Twice.'),
      l("Jun. '74", 'Learned a new waltz. Stepped on every foot at the VFW. They lined up for more.'),
      l("Mar. '81", 'Taught the paper boy a headlock. His mother called. I said he asked very nicely.'),
      l("Nov. '75", 'Burned the cornbread. Ate it anyway, with honey, like a queen.'),
    ],
  },
];

const SEASON_LINES: NightLine[][] = [
  [l("Apr. '75", 'The pecan tree is putting out leaves like it has somewhere to be.')],
  [l("Jul. '79", 'Too hot to bump. Bumped anyway. Lay on the kitchen floor after like a hound.')],
  [l("Oct. '80", 'Fall. The Sportatorium smells like popcorn and wool coats again.')],
  [l("Dec. '78", 'Cold. Slept in my robe from the show. Velvet is warmer than you would think.')],
];

function linesFor(cat: Cat, c: NightCtx): NightLine[] {
  return cat.id === 'season' ? SEASON_LINES[c.season % 4] : cat.lines;
}

/**
 * Pick tonight's line: the most fitting category first, a line within it by
 * day, and never the same line two nights running.
 */
export function pickNightLine(c: NightCtx, last?: string): NightLine {
  const fits = NIGHT_LINES.filter((cat) => cat.when(c));
  for (const cat of fits) {
    const ls = linesFor(cat, c);
    if (!ls.length) continue;
    const start = ((c.abs * 7 + 3) >>> 0) % ls.length;
    for (let i = 0; i < ls.length; i++) {
      const pick = ls[(start + i) % ls.length];
      if (pick.text !== last) return pick;
    }
  }
  const any = NIGHT_LINES[NIGHT_LINES.length - 1].lines;
  return any.find((x) => x.text !== last) ?? any[0];
}

/** Every line, for tests and a style pass. */
export function allNightLines(): NightLine[] {
  return [...NIGHT_LINES.flatMap((c) => c.lines), ...SEASON_LINES.flat()];
}
