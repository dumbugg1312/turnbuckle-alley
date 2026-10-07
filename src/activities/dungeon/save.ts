import { ext } from '../../core/state';

/** Persistent Dungeon progress (G.ext.dungeon). */
export interface DungeonSave {
  /** Deepest floor ever reached. */
  deepest: number;
  /** Highest freight-elevator checkpoint unlocked (0 = none; every multiple of 5 up to it works). */
  elevator: number;
  introSeen: boolean;
  erasSeen: string[];
  goldenBelt: boolean;
  /** Today's progress so floors don't refill if you pop up and back down. */
  today: { day: number; gone: Record<string, string[]>; revealed: number[]; sparred: string[] };
  totals: { sets: number; perfects: number; spars: number; relics: number; carried: number };
}

export function dungeonSave(): DungeonSave {
  const s = ext<DungeonSave>('dungeon', () => ({
    deepest: 0,
    elevator: 0,
    introSeen: false,
    erasSeen: [],
    goldenBelt: false,
    today: { day: -1, gone: {}, revealed: [], sparred: [] },
    totals: { sets: 0, perfects: 0, spars: 0, relics: 0, carried: 0 },
  }));
  s.today ??= { day: -1, gone: {}, revealed: [], sparred: [] };
  s.totals ??= { sets: 0, perfects: 0, spars: 0, relics: 0, carried: 0 };
  s.erasSeen ??= [];
  return s;
}

/** Reset the per-day slice when the calendar has moved on. */
export function todayState(day: number): DungeonSave['today'] {
  const s = dungeonSave();
  if (s.today.day !== day) s.today = { day, gone: {}, revealed: [], sparred: [] };
  return s.today;
}
