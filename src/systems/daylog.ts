import { G, ext } from '../core/state';
import { absDay } from '../core/time';

/**
 * The day's little ledger, for the goodnight page in Grandma's notebook:
 * money in or out, who you talked to, chairs found, a match if there was one.
 * Most of it is a snapshot taken when the day starts and compared at bedtime,
 * so the systems that change money, chairs and matches don't need to report in.
 * The slice resets itself whenever the calendar has moved on.
 */
export interface DayLog {
  /** Absolute day this log covers. */
  day: number;
  moneyStart: number;
  chairsStart: number;
  matchesStart: number;
  winsStart: number;
  /** People already met when the day started (talk.ts 'met'). */
  metStart: string[];
  /** Story flags already set when the day started (for people met in cutscenes). */
  flagsStart: string[];
  /** People spoken to in cutscenes (talk.ts only marks ordinary chats). */
  talked: string[];
  /** Small things worth a line: 'surprise:<id>', 'porch', 'drawing'... */
  notes: string[];
  /** Last goodnight line shown, so two nights never read the same. Survives the reset. */
  lastLine?: string;
}

/** Everything the log compares, read from the game state (or built by tests). */
export interface DaySnapshot {
  day: number;
  money: number;
  chairs: number;
  matches: number;
  wins: number;
  met: string[];
  flags: string[];
  /** Ids with relationships[id].talkedToday. */
  talkedToday: string[];
}

/** Story flags that mean you met someone in a cutscene today. */
export const FLAG_PEOPLE: Record<string, string[]> = {
  met_pip: ['pip'],
  met_birdie: ['birdie', 'dex'],
};

export function freshLog(s: DaySnapshot, lastLine?: string): DayLog {
  return {
    day: s.day,
    moneyStart: s.money,
    chairsStart: s.chairs,
    matchesStart: s.matches,
    winsStart: s.wins,
    metStart: [...s.met],
    flagsStart: s.flags.filter((f) => f in FLAG_PEOPLE),
    talked: [],
    notes: [],
    lastLine,
  };
}

export interface ShowToday {
  stars: number | null;
  venue: 'vfw' | 'sportatorium';
  /** The show went on without you. */
  missed: boolean;
}

export interface DaySummary {
  day: number;
  moneyDelta: number;
  chairs: number;
  matches: number;
  wins: number;
  /** Everyone you spoke with, in the order first seen. */
  talked: string[];
  /** The ones you met for the first time today. */
  newPeople: string[];
  show: ShowToday | null;
  notes: string[];
}

/** Compare the start-of-day log with the state now. */
export function summarize(log: DayLog, now: DaySnapshot, show: ShowToday | null = null): DaySummary {
  const talked: string[] = [];
  const add = (id: string) => {
    if (id && id !== 'player' && !talked.includes(id)) talked.push(id);
  };
  log.talked.forEach(add);
  now.talkedToday.forEach(add);
  const fromFlags: string[] = [];
  for (const [f, ids] of Object.entries(FLAG_PEOPLE)) {
    if (now.flags.includes(f) && !log.flagsStart.includes(f)) fromFlags.push(...ids);
  }
  fromFlags.forEach(add);
  const newPeople = talked.filter((id) => !log.metStart.includes(id) && (now.met.includes(id) || fromFlags.includes(id)));
  return {
    day: log.day,
    moneyDelta: now.money - log.moneyStart,
    chairs: Math.max(0, now.chairs - log.chairsStart),
    matches: Math.max(0, now.matches - log.matchesStart),
    wins: Math.max(0, now.wins - log.winsStart),
    talked,
    newPeople,
    show,
    notes: [...log.notes],
  };
}

// ------------------------------------------------------------------ live state

/** Read the snapshot from the live game state. */
export function snapshotNow(): DaySnapshot {
  const met = (G.ext['talk'] as { met?: string[] } | undefined)?.met ?? [];
  const chairs = (G.ext['chairs'] as { found?: number } | undefined)?.found ?? 0;
  return {
    day: absDay(),
    money: G.player.money,
    chairs,
    matches: G.player.matches,
    wins: G.player.wins,
    met: [...met],
    flags: Object.keys(G.flags).filter((k) => !!G.flags[k]),
    talkedToday: Object.entries(G.relationships).filter(([, r]) => r.talkedToday).map(([id]) => id),
  };
}

/** Today's log, started fresh if the calendar has moved on since it was made. */
export function dayLog(): DayLog {
  const s = ext<DayLog>('daylog', () => freshLog(snapshotNow()));
  if (s.day !== absDay()) {
    const fresh = freshLog(snapshotNow(), s.lastLine);
    Object.assign(s, fresh);
  }
  return s;
}

/** Start a new day's log (called right after the calendar turns). */
export function resetDayLog(): void {
  const prev = G.ext['daylog'] as DayLog | undefined;
  G.ext['daylog'] = freshLog(snapshotNow(), prev?.lastLine);
}

/** Someone you spoke with in a scripted scene. */
export function noteTalked(id: string): void {
  const l = dayLog();
  if (!l.talked.includes(id)) l.talked.push(id);
}

/** Something small that happened today, for the goodnight line. */
export function noteToday(tag: string): void {
  const l = dayLog();
  if (!l.notes.includes(tag)) l.notes.push(tag);
}

/** The show tonight, if there was one (from G.showHistory). */
export function showToday(): ShowToday | null {
  const d = absDay();
  for (let i = G.showHistory.length - 1; i >= 0; i--) {
    const h = G.showHistory[i];
    if (h.day === d) return { stars: h.playerStars, venue: h.venue, missed: h.gate === 0 && h.playerStars === null };
    if (h.day < d) break;
  }
  return null;
}

export function summarizeToday(): DaySummary {
  return summarize(dayLog(), snapshotNow(), showToday());
}
