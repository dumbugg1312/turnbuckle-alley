import type { Dir, Weather } from '../core/state';

/**
 * Townsfolk registry: who they are, where they are, and how they wrestle.
 * Dialogue lives in src/data/dialogue/<id>.ts; looks in src/data/looks.ts.
 */
export interface DayCtx {
  weekday: number; // 0 Mon .. 6 Sun
  day: number; // 1..28
  season: number;
  weather: Weather;
  show: 'wed' | 'sat' | null;
  supershow: boolean;
  flags: Record<string, number | string | boolean>;
}

export interface Spot {
  map: string;
  x: number;
  y: number;
  /** A Dir; typed loosely so schedule literals stay terse. */
  facing?: Dir | (string & {});
  /** Idle animation flavor. */
  idle?: 'still' | 'wander' | 'sit' | 'work' | 'read' | 'fish' | 'wave' | 'stretch';
}
export interface ScheduleEntry extends Spot {
  /** Minutes from midnight when they head here. */
  at: number;
}

export interface WrestlerInfo {
  ringName: string;
  style: 'powerhouse' | 'giant' | 'highflyer' | 'luchador' | 'technician' | 'brawler' | 'showman';
  role: 'face' | 'heel';
  finisher: string;
  signature: string;
  /** Card level 1..5: how strong a partner they are. */
  level: number;
}

export interface NpcDef {
  id: string;
  name: string;
  short: string;
  pronouns: 'she' | 'he' | 'they';
  insider: boolean;
  role: string;
  romanceable?: boolean;
  voice: string;
  wrestler?: WrestlerInfo;
  schedule: (c: DayCtx) => ScheduleEntry[];
  /** Hidden from the world until a flag is set (e.g. Grandma before she moves to town). */
  appearsWhen?: (c: DayCtx) => boolean;
}

const H = (h: number, m = 0) => h * 60 + m;
const isWeekend = (c: DayCtx) => c.weekday >= 5;
const rainy = (c: DayCtx) => c.weather === 'rain' || c.weather === 'storm';

/** Where insiders go on show nights. */
function showNight(c: DayCtx, spot: Spot): ScheduleEntry[] {
  if (!c.show) return [];
  if (c.show === 'wed') {
    // The VFW hall is smaller than the Sportatorium: squeeze the spot to fit.
    const x = Math.max(1, Math.min(24, 1 + Math.round((spot.x - 1) * 0.78)));
    const y = Math.max(4, Math.min(14, 3 + Math.round((spot.y - 3) * 0.72)));
    return [{ at: H(17, 30), ...spot, map: 'vfw', x, y }];
  }
  return [{ at: H(17, 30), ...spot, map: 'sportatorium' }];
}

// Common town spots (tile coordinates).
export const SPOTS: Record<string, Spot> = {
  dinerDoor: { map: 'town', x: 7, y: 24 },
  square: { map: 'town', x: 22, y: 44 },
  gazeboBench: { map: 'town', x: 17, y: 44 },
  creekBank: { map: 'town', x: 40, y: 47, facing: 'down' },
  busStop: { map: 'town', x: 60, y: 24 },
  mainStW: { map: 'town', x: 12, y: 24 },
  mainStE: { map: 'town', x: 44, y: 24 },
  alley: { map: 'town', x: 16, y: 20 },
  backBooth: { map: 'diner', x: 16, y: 6, facing: 'left' },
  fleaMarket: { map: 'town', x: 52, y: 36 },
};

export const NPCS: NpcDef[] = [
  {
    id: 'birdie',
    name: 'Birdie Malone',
    short: 'Birdie',
    pronouns: 'she',
    insider: true,
    role: 'Runs Alley Championship Wrestling',
    voice: 'birdie',
    schedule: (c) => [
      { at: H(6), map: 'birdie-office', x: 6, y: 3, facing: 'down', idle: 'work' },
      { at: H(12), map: 'diner', x: 4, y: 7, facing: 'up', idle: 'sit' },
      { at: H(13, 30), map: 'sportatorium', x: 9, y: 15, facing: 'up', idle: 'work' },
      { at: H(15), ...SPOTS.backBooth, idle: 'sit' },
      { at: H(17), map: 'birdie-office', x: 6, y: 3, facing: 'down', idle: 'work' },
      ...showNight(c, { map: '', x: 4, y: 14, facing: 'right', idle: 'still' }),
      { at: H(22, 30), map: 'birdie-house', x: 3, y: 5, facing: 'down', idle: 'sit' },
    ],
  },
  {
    id: 'mariposa',
    name: 'Rosa Villanueva',
    short: 'Rosa',
    pronouns: 'she',
    insider: true,
    role: 'Taqueria owner and masked luchadora',
    romanceable: true,
    voice: 'mariposa',
    wrestler: { ringName: 'La Mariposa Dorada', style: 'luchador', role: 'face', finisher: 'Alas de Oro', signature: 'Tope con Hilo', level: 4 },
    schedule: (c) => [
      { at: H(7), map: 'taqueria', x: 5, y: 3, facing: 'down', idle: 'work' },
      ...(c.weekday === 6 ? [{ at: H(14), ...SPOTS.square, idle: 'wander' as const }] : []),
      { at: H(16), map: 'sportatorium', x: 15, y: 9, facing: 'down', idle: 'stretch' },
      { at: H(17, 30), map: 'taqueria', x: 5, y: 3, facing: 'down', idle: 'work' },
      ...showNight(c, { map: '', x: 6, y: 13, facing: 'right', idle: 'stretch' }),
      { at: H(23), map: 'taqueria', x: 9, y: 6, idle: 'work' },
    ],
  },
  {
    id: 'earl',
    name: 'Earl Odom',
    short: 'Earl',
    pronouns: 'he',
    insider: true,
    role: 'Town librarian; monster villain',
    romanceable: true,
    voice: 'earl',
    wrestler: { ringName: 'The Mountain', style: 'giant', role: 'heel', finisher: 'The Overdue Notice', signature: 'Chokeslam', level: 4 },
    schedule: (c) => [
      { at: H(8), map: 'library', x: 9, y: 3, facing: 'down', idle: 'read' },
      ...(c.weekday < 5 ? [{ at: H(15, 50), map: 'library', x: 4, y: 7, facing: 'down', idle: 'read' as const }] : []),
      { at: H(17), map: 'library', x: 9, y: 3, facing: 'down', idle: 'read' },
      { at: H(18, 30), ...SPOTS.gazeboBench, idle: 'read' },
      ...showNight(c, { map: '', x: 26, y: 14, facing: 'left', idle: 'still' }),
      { at: H(22), map: 'library', x: 13, y: 8, idle: 'read' },
    ],
  },
  {
    id: 'dex',
    name: 'Dex Delgado',
    short: 'Dex',
    pronouns: 'he',
    insider: true,
    role: 'Gas station attendant; high-flyer',
    romanceable: true,
    voice: 'dex',
    wrestler: { ringName: 'Dex "Dropkick" Delgado', style: 'highflyer', role: 'face', finisher: 'The Getaway', signature: 'Springboard Dropkick', level: 3 },
    schedule: (c) => [
      { at: H(6), map: 'gasstation', x: 7, y: 3, facing: 'down', idle: 'work' },
      { at: H(14), ...SPOTS.busStop, facing: 'right', idle: 'still' },
      { at: H(15), map: 'sportatorium', x: 13, y: 9, facing: 'right', idle: 'stretch' },
      { at: H(17, 30), map: 'diner', x: 6, y: 7, facing: 'up', idle: 'sit' },
      ...showNight(c, { map: '', x: 8, y: 13, facing: 'right', idle: 'stretch' }),
      { at: H(23), map: 'gasstation', x: 7, y: 3, facing: 'down', idle: 'work' },
    ],
  },
  {
    id: 'gideon',
    name: 'Gideon Price',
    short: 'Gideon',
    pronouns: 'he',
    insider: true,
    role: 'Salon owner; sequined villain',
    romanceable: true,
    voice: 'gideon',
    wrestler: { ringName: '"Gorgeous" Gideon Price', style: 'showman', role: 'heel', finisher: 'The Final Look', signature: 'Sequined Elbow', level: 3 },
    schedule: (c) => [
      { at: H(8), map: 'studio', x: 3, y: 6, facing: 'down', idle: 'stretch' },
      { at: H(9, 30), map: 'salon', x: 4, y: 5, facing: 'down', idle: 'work' },
      { at: H(16), ...SPOTS.mainStE, idle: 'wander' },
      { at: H(18), map: 'salon', x: 4, y: 5, facing: 'down', idle: 'work' },
      ...showNight(c, { map: '', x: 24, y: 14, facing: 'left', idle: 'still' }),
      { at: H(23), map: 'salon', x: 7, y: 5, idle: 'work' },
    ],
  },
  {
    id: 'bo',
    name: 'Bo Bruiser',
    short: 'Bo',
    pronouns: 'he',
    insider: true,
    role: 'Hardware store co-owner; the careful twin',
    voice: 'bo',
    wrestler: { ringName: 'Bo Bruiser', style: 'brawler', role: 'heel', finisher: 'Twin Towers', signature: 'Double Clothesline', level: 3 },
    schedule: (c) => [
      { at: H(7), map: 'hardware', x: 6, y: 3, facing: 'down', idle: 'work' },
      ...showNight(c, { map: '', x: 22, y: 14, facing: 'left', idle: 'still' }),
      { at: H(22), map: 'hardware', x: 3, y: 6, idle: 'work' },
    ],
  },
  {
    id: 'buck',
    name: 'Buck Bruiser',
    short: 'Buck',
    pronouns: 'he',
    insider: true,
    role: 'Hardware store co-owner; the chaotic twin',
    voice: 'buck',
    wrestler: { ringName: 'Buck Bruiser', style: 'brawler', role: 'heel', finisher: 'Twin Towers', signature: 'Running Knee', level: 3 },
    schedule: (c) => [
      { at: H(7), map: 'hardware', x: 8, y: 3, facing: 'down', idle: 'work' },
      { at: H(12), ...SPOTS.dinerDoor, idle: 'wander' },
      { at: H(13), map: 'hardware', x: 8, y: 3, facing: 'down', idle: 'work' },
      ...showNight(c, { map: '', x: 23, y: 15, facing: 'left', idle: 'still' }),
      { at: H(22), map: 'diner', x: 8, y: 7, facing: 'up', idle: 'sit' },
    ],
  },
  {
    id: 'hazel',
    name: 'Hazel Huang',
    short: 'Hazel',
    pronouns: 'she',
    insider: true,
    role: 'PT and yoga studio owner; former champion',
    romanceable: true,
    voice: 'hazel',
    wrestler: { ringName: 'Hazel "Hurricane" Huang', style: 'technician', role: 'face', finisher: 'Eye of the Storm', signature: 'Bridging German', level: 4 },
    schedule: (c) => [
      { at: H(6, 30), map: 'studio', x: 5, y: 6, facing: 'down', idle: 'stretch' },
      ...(rainy(c) ? [] : [{ at: H(12), ...SPOTS.creekBank, idle: 'stretch' as const }]),
      { at: H(13), map: 'studio', x: 5, y: 6, facing: 'down', idle: 'stretch' },
      ...showNight(c, { map: '', x: 7, y: 15, facing: 'right', idle: 'still' }),
      { at: H(22), map: 'studio', x: 7, y: 5, idle: 'stretch' },
    ],
  },
  {
    id: 'clint',
    name: 'Clint Ransom',
    short: 'Clint',
    pronouns: 'he',
    insider: true,
    role: "Fairgrounds caretaker and Wanda's keeper",
    voice: 'clint',
    wrestler: { ringName: 'The Dust Devil', style: 'brawler', role: 'heel', finisher: 'Tumbleweed Driver', signature: 'Bulldog', level: 3 },
    schedule: (c) => [
      { at: H(6), map: 'fair', x: 17, y: 24, facing: 'left', idle: 'work' },
      { at: H(11), map: 'diner', x: 2, y: 9, facing: 'right', idle: 'sit' },
      { at: H(12, 30), map: 'fair', x: 17, y: 24, facing: 'left', idle: 'work' },
      ...showNight(c, { map: '', x: 27, y: 16, facing: 'left', idle: 'still' }),
      { at: H(22), map: 'fair', x: 20, y: 25, idle: 'still' },
    ],
  },
  {
    id: 'tiny',
    name: 'Tiny Tallbridge',
    short: 'Tiny',
    pronouns: 'she',
    insider: true,
    role: 'Seven-foot baker of tiny cakes',
    voice: 'tiny',
    wrestler: { ringName: 'Tiny Tallbridge', style: 'giant', role: 'face', finisher: 'The Last Crumb', signature: 'Big Boot', level: 3 },
    schedule: (c) => [
      { at: H(5, 30), map: 'bakery', x: 5, y: 3, facing: 'down', idle: 'work' },
      ...(c.weekday === 5 ? [{ at: H(9), ...SPOTS.fleaMarket, idle: 'wander' as const }] : []),
      { at: H(11), map: 'bakery', x: 5, y: 3, facing: 'down', idle: 'work' },
      ...showNight(c, { map: '', x: 5, y: 16, facing: 'right', idle: 'still' }),
      { at: H(21), map: 'bakery', x: 10, y: 6, idle: 'work' },
    ],
  },
  {
    id: 'professor',
    name: 'Odessa Pruitt',
    short: 'Odessa',
    pronouns: 'she',
    insider: true,
    role: 'High school math teacher; mat-wrestling genius',
    voice: 'professor',
    wrestler: { ringName: '"Professor" Pinfall', style: 'technician', role: 'face', finisher: 'Proof by Submission', signature: 'Chain Wrestling', level: 4 },
    schedule: (c) => [
      ...(c.weekday < 5 ? [{ at: H(7, 30), map: 'school', x: 10, y: 8, facing: 'down', idle: 'work' as const }] : [{ at: H(9), map: 'library', x: 13, y: 9, facing: 'up', idle: 'read' as const }]),
      { at: H(15, 30), map: 'library', x: 12, y: 9, facing: 'up', idle: 'read' },
      ...showNight(c, { map: '', x: 9, y: 15, facing: 'right', idle: 'still' }),
      { at: H(21), map: 'library', x: 12, y: 9, facing: 'up', idle: 'read' },
    ],
  },
  {
    id: 'lou',
    name: 'Sweet Lou Bastian',
    short: 'Lou',
    pronouns: 'he',
    insider: true,
    role: '1970s legend; keeper of the Dungeon key',
    voice: 'lou',
    wrestler: { ringName: 'Sweet Lou', style: 'brawler', role: 'face', finisher: 'Sugar Drop', signature: 'Atomic Elbow', level: 5 },
    schedule: (c) => [
      { at: H(6), map: 'town', x: 41, y: 47, facing: 'down', idle: 'fish' },
      ...(rainy(c) ? [{ at: H(9), map: 'airstream', x: 3, y: 3, facing: 'down', idle: 'sit' as const }] : []),
      { at: H(12), map: 'diner', x: 10, y: 7, facing: 'up', idle: 'sit' },
      { at: H(13, 30), map: 'town', x: 41, y: 47, facing: 'down', idle: 'fish' },
      ...(c.show === 'sat' ? [{ at: H(18), map: 'sportatorium', x: 28, y: 16, facing: 'left' as Dir, idle: 'sit' as const }] : []),
      { at: H(21), map: 'airstream', x: 3, y: 3, facing: 'down', idle: 'sit' },
    ],
  },
  {
    id: 'mothman',
    name: 'The Mothman',
    short: 'The Mothman',
    pronouns: 'they',
    insider: true,
    role: 'A cryptid who only appears at night',
    voice: 'mothman',
    wrestler: { ringName: 'The Mothman', style: 'luchador', role: 'face', finisher: 'Moonlight Moth', signature: 'Wing Clutch', level: 4 },
    schedule: () => [{ at: H(22), map: 'town', x: 25, y: 54, facing: 'down', idle: 'still' }],
    appearsWhen: () => true,
  },
  {
    id: 'mo',
    name: 'Mo Dizon',
    short: 'Mo',
    pronouns: 'she',
    insider: true,
    role: 'Mail carrier; ACW senior referee',
    romanceable: true,
    voice: 'mo',
    schedule: (c) => [
      { at: H(7), map: 'town', x: 6, y: 12, idle: 'wander' },
      { at: H(9), map: 'town', x: 30, y: 12, idle: 'wander' },
      { at: H(11), ...SPOTS.mainStW, idle: 'wander' },
      { at: H(13), map: 'town', x: 30, y: 28, idle: 'wander' },
      { at: H(15), map: 'farm', x: 15, y: 12, idle: 'still' },
      { at: H(16), map: 'diner', x: 13, y: 9, facing: 'up', idle: 'sit' },
      ...showNight(c, { map: '', x: 18, y: 14, facing: 'down', idle: 'still' }),
      { at: H(22), map: 'diner', x: 13, y: 9, facing: 'up', idle: 'sit' },
    ],
  },
  {
    id: 'gus',
    name: 'Gus Gravel',
    short: 'Gus',
    pronouns: 'he',
    insider: true,
    role: 'Ring announcer; WRSL morning DJ',
    voice: 'gus',
    schedule: (c) => [
      { at: H(6), map: 'radio', x: 6, y: 6, facing: 'up', idle: 'work' },
      { at: H(12), map: 'diner', x: 4, y: 9, facing: 'up', idle: 'sit' },
      { at: H(14), map: 'radio', x: 6, y: 6, facing: 'up', idle: 'work' },
      ...showNight(c, { map: '', x: 16, y: 16, facing: 'up', idle: 'sit' }),
      { at: H(22), map: 'radio', x: 6, y: 6, facing: 'up', idle: 'work' },
    ],
  },
  {
    id: 'june',
    name: 'June Oyelaran',
    short: 'June',
    pronouns: 'she',
    insider: true,
    role: 'Owner of the Hot Tag Diner; retired manager',
    voice: 'june',
    schedule: () => [{ at: H(5, 30), map: 'diner', x: 7, y: 3, facing: 'down', idle: 'work' }],
  },
  {
    id: 'hank',
    name: 'Hank Szabo',
    short: 'Hank',
    pronouns: 'she',
    insider: true,
    role: 'Ring builder, carpenter, beltmaker',
    voice: 'hank',
    schedule: (c) => [
      { at: H(7), map: 'sportatorium', x: 22, y: 9, facing: 'left', idle: 'work' },
      { at: H(12), map: 'hardware', x: 4, y: 6, idle: 'wander' },
      { at: H(13), map: 'sportatorium', x: 22, y: 9, facing: 'left', idle: 'work' },
      ...showNight(c, { map: '', x: 28, y: 18, facing: 'left', idle: 'still' }),
      { at: H(20), map: 'diner', x: 15, y: 9, facing: 'up', idle: 'sit' },
    ],
  },
  {
    id: 'marigold',
    name: 'Marigold Iyer',
    short: 'Marigold',
    pronouns: 'they',
    insider: true,
    role: 'Seamstress; makes all the gear',
    romanceable: true,
    voice: 'marigold',
    schedule: (c) => [
      { at: H(8), map: 'tailor', x: 7, y: 3, facing: 'down', idle: 'work' },
      ...(isWeekend(c) ? [{ at: H(10), ...SPOTS.fleaMarket, idle: 'wander' as const }, { at: H(12), map: 'tailor', x: 7, y: 3, facing: 'down' as Dir, idle: 'work' as const }] : []),
      ...showNight(c, { map: '', x: 29, y: 17, facing: 'left', idle: 'still' }),
      { at: H(22), map: 'tailor', x: 10, y: 6, idle: 'work' },
    ],
  },
  {
    id: 'doc',
    name: 'Doc Halloran',
    short: 'Doc',
    pronouns: 'he',
    insider: true,
    role: 'Chiropractor; refereed the 1983 match',
    voice: 'doc',
    schedule: (c) => [
      { at: H(8), map: 'clinic', x: 3, y: 3, facing: 'down', idle: 'work' },
      { at: H(17), ...SPOTS.gazeboBench, idle: 'sit' },
      ...showNight(c, { map: '', x: 3, y: 17, facing: 'right', idle: 'still' }),
      { at: H(21, 30), map: 'clinic', x: 3, y: 3, facing: 'down', idle: 'work' },
    ],
  },
  // ---------------------------------------------------------------- marks
  {
    id: 'pip',
    name: 'Pip Abernathy',
    short: 'Pip',
    pronouns: 'he',
    insider: false,
    role: 'Superfan; undisputed Pip-weight champion',
    voice: 'pip',
    schedule: (c) => [
      { at: H(7), map: 'house-abernathy', x: 4, y: 5, idle: 'wander' },
      ...(c.weekday < 5 ? [{ at: H(8), map: 'school', x: 6, y: 9, facing: 'up' as Dir, idle: 'sit' as const }] : [{ at: H(9), ...SPOTS.fleaMarket, idle: 'wander' as const }]),
      { at: H(15), ...SPOTS.alley, facing: 'up', idle: 'still' },
      { at: H(16), map: 'library', x: 3, y: 8, facing: 'up', idle: 'sit' },
      { at: H(17), ...SPOTS.square, idle: 'wander' },
      ...(c.show ? [{ at: H(18, 30), map: c.show === 'wed' ? 'vfw' : 'sportatorium', x: c.show === 'wed' ? 10 : 12, y: c.show === 'wed' ? 13 : 17, facing: 'up' as Dir, idle: 'wave' as const }] : []),
      { at: H(21), map: 'house-abernathy', x: 3, y: 5, idle: 'still' },
    ],
  },
  {
    id: 'lacey',
    name: 'Lacey Ransom',
    short: 'Lacey',
    pronouns: 'she',
    insider: false,
    role: "Clint's daughter; amateur wrestler",
    voice: 'lacey',
    schedule: (c) => [
      ...(c.weekday < 5 ? [{ at: H(7, 30), map: 'school', x: 12, y: 9, facing: 'up' as Dir, idle: 'stretch' as const }] : [{ at: H(9), map: 'fair', x: 21, y: 25, idle: 'wander' as const }]),
      { at: H(16), map: 'school', x: 12, y: 9, facing: 'up', idle: 'stretch' },
      ...(c.show ? [{ at: H(18, 30), map: c.show === 'wed' ? 'vfw' : 'sportatorium', x: c.show === 'wed' ? 14 : 19, y: c.show === 'wed' ? 14 : 18, facing: 'up' as Dir, idle: 'still' as const }] : []),
      { at: H(21), map: 'fair', x: 21, y: 25, idle: 'still' },
    ],
  },
  {
    id: 'agnes',
    name: 'Agnes Pickett',
    short: 'Agnes',
    pronouns: 'she',
    insider: false,
    role: 'Front row since 1971',
    voice: 'agnes',
    schedule: (c) => [
      { at: H(7), map: 'sunnypines', x: 4, y: 6, facing: 'down', idle: 'sit' },
      ...(rainy(c) ? [] : [{ at: H(13), ...SPOTS.gazeboBench, idle: 'sit' as const }]),
      { at: H(16), map: 'bakery', x: 9, y: 6, facing: 'up', idle: 'sit' },
      ...(c.show ? [{ at: H(18), map: c.show === 'wed' ? 'vfw' : 'sportatorium', x: c.show === 'wed' ? 6 : 13, y: c.show === 'wed' ? 13 : 16, facing: 'up' as Dir, idle: 'sit' as const }] : []),
      { at: H(21, 30), map: 'sunnypines', x: 4, y: 6, facing: 'down', idle: 'sit' },
    ],
  },
  {
    id: 'bev',
    name: 'Sheriff Bev Kincaid',
    short: 'Bev',
    pronouns: 'she',
    insider: false,
    role: 'Sheriff',
    voice: 'bev',
    schedule: (c) => [
      { at: H(8), map: 'town', x: 20, y: 24, idle: 'wander' },
      { at: H(10), map: 'town', x: 40, y: 28, idle: 'wander' },
      { at: H(12), map: 'diner', x: 3, y: 7, facing: 'up', idle: 'sit' },
      { at: H(13), map: 'town', x: 28, y: 40, idle: 'wander' },
      { at: H(16), map: 'town', x: 50, y: 24, idle: 'wander' },
      ...(c.show ? [{ at: H(18), map: c.show === 'wed' ? 'vfw' : 'sportatorium', x: c.show === 'wed' ? 21 : 28, y: c.show === 'wed' ? 13 : 13, facing: 'left' as Dir, idle: 'still' as const }] : []),
      { at: H(21), map: 'town', x: 24, y: 28, idle: 'wander' },
    ],
  },
  {
    id: 'patty',
    name: 'Coach Patty Kowalski',
    short: 'Coach Patty',
    pronouns: 'she',
    insider: false,
    role: 'High school wrestling coach; certain it is fake',
    voice: 'patty',
    schedule: (c) => [
      { at: H(7), map: 'school', x: 9, y: 7, facing: 'down', idle: 'work' },
      ...(c.weekday >= 5 ? [{ at: H(10), map: 'town', x: 36, y: 28, idle: 'wander' as const }] : []),
      ...(c.show ? [{ at: H(18, 30), map: c.show === 'wed' ? 'vfw' : 'sportatorium', x: c.show === 'wed' ? 18 : 23, y: c.show === 'wed' ? 14 : 18, facing: 'up' as Dir, idle: 'still' as const }] : []),
      { at: H(21), map: 'school', x: 9, y: 7, facing: 'down', idle: 'work' },
    ],
  },
  {
    id: 'clementine',
    name: 'Clementine Beaulieu',
    short: 'Clementine',
    pronouns: 'she',
    insider: false,
    role: 'Editor and critic of the Turnbuckle Tattler',
    romanceable: true,
    voice: 'clementine',
    schedule: (c) => [
      { at: H(7), map: 'town', x: 10, y: 24, facing: 'down', idle: 'read' },
      { at: H(9), map: 'diner', x: 14, y: 9, facing: 'up', idle: 'work' },
      { at: H(14), map: 'library', x: 11, y: 9, facing: 'up', idle: 'read' },
      ...(c.show ? [{ at: H(18, 30), map: c.show === 'wed' ? 'vfw' : 'sportatorium', x: c.show === 'wed' ? 3 : 4, y: c.show === 'wed' ? 13 : 17, facing: 'right' as Dir, idle: 'work' as const }] : []),
      { at: H(21), map: 'diner', x: 14, y: 9, facing: 'up', idle: 'work' },
    ],
  },
  {
    id: 'fenwick',
    name: 'Fenwick Thistle',
    short: 'Fenwick',
    pronouns: 'he',
    insider: false,
    role: 'Flea market tape dealer; Mothman researcher',
    voice: 'fenwick',
    schedule: (c) => [
      ...(c.weekday >= 5 ? [{ at: H(8), map: 'town', x: 54, y: 36, facing: 'down' as Dir, idle: 'work' as const }] : [{ at: H(9), map: 'pawn', x: 5, y: 5, facing: 'down' as Dir, idle: 'work' as const }]),
      { at: H(17), map: 'pawn', x: 5, y: 5, facing: 'down', idle: 'work' },
      { at: H(21, 30), map: 'town', x: 23, y: 53, facing: 'down', idle: 'still' },
      { at: H(23, 30), map: 'pawn', x: 5, y: 5, facing: 'down', idle: 'work' },
    ],
  },
  {
    id: 'oakes',
    name: 'Mayor Delphine Oakes',
    short: 'Mayor Oakes',
    pronouns: 'she',
    insider: false,
    role: 'Mayor',
    voice: 'oakes',
    schedule: (c) => [
      { at: H(8), map: 'town', x: 24, y: 41, idle: 'wander' },
      { at: H(11), map: 'town', x: 30, y: 24, idle: 'wander' },
      { at: H(14), ...SPOTS.square, idle: 'wander' },
      ...(c.show === 'sat' ? [{ at: H(18), map: 'sportatorium', x: 3, y: 15, facing: 'right' as Dir, idle: 'still' as const }] : []),
      { at: H(20), map: 'town', x: 34, y: 12, idle: 'still' },
    ],
  },
  {
    id: 'nadia',
    name: 'Dr. Nadia Rahimi',
    short: 'Nadia',
    pronouns: 'she',
    insider: false,
    role: 'The new veterinarian',
    romanceable: true,
    voice: 'nadia',
    schedule: (c) => [
      { at: H(8), map: 'fair', x: 18, y: 25, facing: 'up', idle: 'work' },
      { at: H(11), map: 'clinic', x: 7, y: 6, idle: 'work' },
      { at: H(15), ...SPOTS.creekBank, idle: 'wander' },
      ...(c.show === 'sat' ? [{ at: H(18, 30), map: 'sportatorium', x: 21, y: 18, facing: 'up' as Dir, idle: 'still' as const }] : []),
      { at: H(19), map: 'diner', x: 5, y: 9, facing: 'up', idle: 'sit' },
      { at: H(21), map: 'town', x: 21, y: 12, idle: 'still' },
    ],
  },
  {
    id: 'sami',
    name: 'Sami Haddad',
    short: 'Sami',
    pronouns: 'he',
    insider: false,
    role: 'Nurse at the Evening Bell Residence',
    romanceable: true,
    voice: 'sami',
    schedule: () => [
      { at: H(7), map: 'sunnypines', x: 10, y: 6, idle: 'work' },
      { at: H(12, 30), map: 'bakery', x: 9, y: 6, facing: 'up', idle: 'sit' },
      { at: H(13, 30), map: 'sunnypines', x: 10, y: 6, idle: 'work' },
      { at: H(19), map: 'town', x: 34, y: 12, idle: 'still' },
    ],
  },
  {
    id: 'wanda',
    name: 'Wanda',
    short: 'Wanda',
    pronouns: 'she',
    insider: false,
    role: 'A very polite wrestling bear',
    voice: 'wanda',
    schedule: () => [{ at: H(0), map: 'fair', x: 15, y: 22, facing: 'down', idle: 'wander' }],
  },
  {
    id: 'grandma',
    name: 'Dottie Dupree',
    short: 'Grandma',
    pronouns: 'she',
    insider: true,
    role: "The player's grandmother; retired legend",
    voice: 'grandma',
    appearsWhen: (c) => !!c.flags['grandma_in_town'],
    schedule: (c) => [
      { at: H(6), map: 'grandma-room', x: 3, y: 5, facing: 'down', idle: 'sit' },
      ...(c.weather === 'sun' ? [{ at: H(14), map: 'sunnypines', x: 6, y: 6, facing: 'down' as Dir, idle: 'sit' as const }] : []),
      ...(c.show === 'sat' && c.flags['grandma_attends'] ? [{ at: H(18), map: 'sportatorium', x: 14, y: 16, facing: 'up' as Dir, idle: 'sit' as const }] : []),
      { at: H(17), map: 'grandma-room', x: 3, y: 5, facing: 'down', idle: 'sit' },
    ],
  },
  // ---------------------------------------------------------------- the city prologue
  {
    id: 'arlo',
    name: 'Arlo Finch',
    short: 'Arlo',
    pronouns: 'he',
    insider: false,
    role: 'Your MaxxMedia desk neighbor',
    romanceable: true,
    voice: 'arlo',
    appearsWhen: (c) => !!c.flags['prologue'] || !!c.flags['arlo_in_town'],
    schedule: (c) => (c.flags['prologue'] ? [{ at: 0, map: 'maxx-office', x: 11, y: 7, facing: 'up', idle: 'work' }] : [{ at: H(9), map: 'pawn', x: 9, y: 7, facing: 'down', idle: 'work' }]),
  },
  {
    id: 'royce',
    name: 'Royce Penn',
    short: 'Royce',
    pronouns: 'he',
    insider: true,
    role: 'Your MaxxMedia boss',
    voice: 'royce',
    appearsWhen: (c) => !!c.flags['prologue'],
    schedule: () => [{ at: 0, map: 'maxx-office', x: 18, y: 4, facing: 'left', idle: 'still' }],
  },
];

export const NPC_BY_ID: Record<string, NpcDef> = Object.fromEntries(NPCS.map((n) => [n.id, n]));

/** Where an NPC should be right now. */
export function currentEntry(n: NpcDef, c: DayCtx, minutes: number): ScheduleEntry | null {
  const list = n.schedule(c).sort((a, b) => a.at - b.at);
  let cur: ScheduleEntry | null = null;
  for (const e of list) if (e.at <= minutes) cur = e;
  // Before the first entry: they're at their last spot from the night before.
  return cur ?? list[list.length - 1] ?? null;
}
