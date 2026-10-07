import { G } from './state';

/** Days run 6:00 AM to 2:00 AM: 1200 game minutes in 15 real minutes. */
export const DAY_START = 6 * 60;
export const DAY_END = 26 * 60;
export const REAL_SECONDS_PER_GAME_MINUTE = (15 * 60) / (DAY_END - DAY_START);
export const DAYS_PER_SEASON = 28;
export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export function weekday(day = G.time.day): number {
  return (day - 1) % 7;
}
export function weekdayName(day = G.time.day): string {
  return WEEKDAY_NAMES[weekday(day)];
}
export function seasonName(season = G.time.season): string {
  return SEASONS[season % 4];
}
/** 0-based count of days since the game began. */
export function absDay(t = G.time): number {
  return (t.year - 1) * 112 + t.season * 28 + (t.day - 1);
}
export function fromAbsDay(n: number): { year: number; season: number; day: number } {
  return { year: Math.floor(n / 112) + 1, season: Math.floor((n % 112) / 28), day: (n % 28) + 1 };
}
export function isWednesday(day = G.time.day): boolean {
  return weekday(day) === 2;
}
export function isSaturday(day = G.time.day): boolean {
  return weekday(day) === 5;
}
export function isShowDay(day = G.time.day): boolean {
  return isWednesday(day) || isSaturday(day);
}
/** The last Saturday of each season is the supershow. */
export function isSupershow(day = G.time.day): boolean {
  return day === 27;
}
export const SUPERSHOWS = ['Thaw Brawl', 'Fairgrounds Fury', 'Harvest Havoc', 'Homecoming'] as const;

/** Show doors open at 6 PM, bell at 7 PM. */
export const DOORS_OPEN = 18 * 60;
export const BELL_TIME = 19 * 60;

export function clockString(minutes = G.time.minutes): string {
  const m = Math.floor(minutes / 10) * 10;
  let h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mm.toString().padStart(2, '0')} ${ampm}`;
}

export function dateString(t = G.time): string {
  return `${WEEKDAYS[weekday(t.day)]} ${t.day} ${SEASONS[t.season]}`;
}

/** 0 = deep night, 1 = full day. Used for lighting. */
export function daylight(minutes = G.time.minutes): number {
  const h = minutes / 60;
  if (h < 6) return 0.15;
  if (h < 7) return 0.15 + (h - 6) * 0.85;
  if (h < 17.5) return 1;
  if (h < 20.5) return 1 - ((h - 17.5) / 3) * 0.8;
  return 0.2 - Math.min(0.05, (h - 20.5) * 0.01);
}

/** 0..1 how "golden hour" the light is. */
export function goldenHour(minutes = G.time.minutes): number {
  const h = minutes / 60;
  if (h >= 16.5 && h < 20) return Math.sin(((h - 16.5) / 3.5) * Math.PI);
  if (h >= 6 && h < 8) return Math.sin(((h - 6) / 2) * Math.PI) * 0.6;
  return 0;
}

export class Clock {
  running = true;
  private acc = 0;
  /** Callbacks fired each time the 10-minute display ticks. */
  onTick: ((minutes: number) => void)[] = [];
  onLate: (() => void)[] = [];

  update(dt: number): void {
    if (!this.running) return;
    this.acc += dt;
    while (this.acc >= REAL_SECONDS_PER_GAME_MINUTE) {
      this.acc -= REAL_SECONDS_PER_GAME_MINUTE;
      this.advance(1);
    }
  }

  advance(mins: number): void {
    for (let i = 0; i < mins; i++) {
      G.time.minutes++;
      if (G.time.minutes % 10 === 0) for (const f of this.onTick) f(G.time.minutes);
      if (G.time.minutes >= DAY_END) {
        G.time.minutes = DAY_END;
        for (const f of this.onLate) f();
        return;
      }
    }
  }
}
