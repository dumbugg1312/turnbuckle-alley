/**
 * Object lore: what the town's things say when you poke them.
 *
 * Pure data plus a pure picker (no DOM, no audio), so tests can count and
 * lint every line. systems/lore.ts wires it into the action button.
 *
 * Lookup for an object, most specific first; the first level with a line
 * whose conditions match wins:
 *   '#<object id>'        an explicit, stable id from a map file
 *   '<map>/<kind>'        every object of that kind on that map
 *   '<kind>'              every object of that kind anywhere
 * Objects that already carry a `text` prop show that text first; a matching
 * lore line (id or map level only) is added after it as an aside.
 * Notices show their painted `lines` first ({painted} in a line places it).
 */
import type { Weather } from '../../core/state';
import { LORE_FAIR } from './fair';
import { LORE_HOME } from './home';
import { LORE_DINER } from './diner';
import { LORE_INTERIORS } from './interiors';
import { LORE_TOWN } from './town';

export interface When {
  /** 0 Spring, 1 Summer, 2 Fall, 3 Winter. */
  season?: number | number[];
  weather?: Weather | Weather[];
  /** Hour window [from, to). Hours run past 24 for after midnight. */
  from?: number;
  to?: number;
  /** Every listed flag must be truthy / falsy. */
  flag?: string | string[];
  not?: string | string[];
  /** Minimum hearts with each NPC. */
  hearts?: Record<string, number>;
  /** Hearts with each NPC still below this. */
  under?: Record<string, number>;
  /** Minimum matches won. */
  wins?: number;
  /** Minimum matches wrestled. */
  matches?: number;
  /** 0 Mon .. 6 Sun. */
  weekday?: number | number[];
  /** Wednesday or Saturday. */
  showDay?: boolean;
  /** A supershow festival day (the last Saturday of a season). */
  festival?: boolean;
  /** Only the first look at this entry / only after it. */
  first?: boolean;
  again?: boolean;
  /** The object's tile (x, y). */
  tile?: [number, number];
  /** One of the object's props equals a value. */
  prop?: [string, unknown];
  /** Minimum year. */
  year?: number;
}

export interface LoreLine {
  /** One string per dialogue box. */
  t: string | string[];
  when?: When;
  /** Flag set the first time this line is shown. */
  set?: string;
  /** Song id to play for a moment under the line (jukebox, piano). */
  song?: string;
  sfx?: string;
  /** An item handed over the first time this line is shown. */
  give?: [string, number];
}

export type LoreTable = Record<string, LoreLine[]>;

export const LORE: LoreTable = Object.assign({}, LORE_TOWN, LORE_HOME, LORE_DINER, LORE_INTERIORS, LORE_FAIR);

/** Everything the picker needs to know about the moment. */
export interface LoreCtx {
  season: number;
  weather: Weather;
  /** Minutes since midnight (can pass 24 * 60). */
  minutes: number;
  weekday: number;
  year: number;
  festival: boolean;
  flags: Record<string, unknown>;
  hearts: (id: string) => number;
  wins: number;
  matches: number;
}

/** What has been seen, per entry key. */
export interface LoreSeen {
  /** Line indices shown since the last full rotation. */
  shown: Record<string, number[]>;
  /** Total looks at the entry. */
  looks: Record<string, number>;
}

export interface ObjRef {
  id: string;
  kind: string;
  /** World pixels (anchor). */
  x: number;
  y: number;
  props: Record<string, unknown>;
}

const arr = <T>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function objTile(o: ObjRef): [number, number] {
  return [Math.floor(o.x / 16), Math.floor((o.y - 1) / 16)];
}

/** Does a line's condition hold right now? */
export function matches(w: When | undefined, c: LoreCtx, o: ObjRef, looks: number): boolean {
  if (!w) return true;
  if (w.season !== undefined && !arr(w.season).includes(c.season)) return false;
  if (w.weather !== undefined && !arr(w.weather).includes(c.weather)) return false;
  const h = c.minutes / 60;
  if (w.from !== undefined && h < w.from) return false;
  if (w.to !== undefined && h >= w.to) return false;
  for (const f of arr(w.flag)) if (!c.flags[f]) return false;
  for (const f of arr(w.not)) if (c.flags[f]) return false;
  if (w.hearts) for (const [id, n] of Object.entries(w.hearts)) if (c.hearts(id) < n) return false;
  if (w.under) for (const [id, n] of Object.entries(w.under)) if (c.hearts(id) >= n) return false;
  if (w.wins !== undefined && c.wins < w.wins) return false;
  if (w.matches !== undefined && c.matches < w.matches) return false;
  if (w.weekday !== undefined && !arr(w.weekday).includes(c.weekday)) return false;
  if (w.showDay !== undefined && w.showDay !== (c.weekday === 2 || c.weekday === 5)) return false;
  if (w.festival !== undefined && w.festival !== c.festival) return false;
  if (w.first && looks > 0) return false;
  if (w.again && looks === 0) return false;
  if (w.tile) {
    const [tx, ty] = objTile(o);
    if (tx !== w.tile[0] || ty !== w.tile[1]) return false;
  }
  if (w.prop && o.props[w.prop[0]] !== w.prop[1]) return false;
  if (w.year !== undefined && c.year < w.year) return false;
  return true;
}

/** How specific a line is. Story and first-look lines surface before general ones. */
export function specificity(w: When | undefined): number {
  if (!w) return 0;
  let s = 0;
  for (const k of Object.keys(w) as (keyof When)[]) {
    if (k === 'again') continue;
    if (k === 'first' || k === 'tile' || k === 'prop') s += 5;
    else if (k === 'flag' || k === 'hearts' || k === 'wins' || k === 'matches' || k === 'festival') s += 3;
    else if (k === 'not') s += 0.5;
    else s += 1;
  }
  return s;
}

/** The lookup keys for an object, most specific first. */
export function loreKeys(o: ObjRef, mapId: string): string[] {
  return [`#${o.id}`, `${mapId}/${o.kind}`, o.kind];
}

/** True when some lore level has any line at all for this object (ignores conditions). */
export function hasLore(o: ObjRef, mapId: string, table: LoreTable = LORE): boolean {
  return loreKeys(o, mapId).some((k) => (table[k]?.length ?? 0) > 0);
}

export interface Picked {
  key: string;
  index: number;
  line: LoreLine;
}

/**
 * Pick the line to show. Within the winning level: the most specific unseen
 * matching line, in authored order. When every matching line has been shown
 * the rotation starts over (never repeating the last line if there is a choice).
 * `levels` limits which lookup levels are allowed (objects with a text prop
 * only take id and map-level asides).
 */
export function pickLore(o: ObjRef, mapId: string, c: LoreCtx, seen: LoreSeen, table: LoreTable = LORE, levels = 3): Picked | null {
  for (const key of loreKeys(o, mapId).slice(0, levels)) {
    const lines = table[key];
    if (!lines?.length) continue;
    const looks = seen.looks[key] ?? 0;
    const ok = lines.map((l, i) => ({ l, i })).filter(({ l }) => matches(l.when, c, o, looks));
    if (!ok.length) continue;
    const shown = seen.shown[key] ?? [];
    let pool = ok.filter(({ i }) => !shown.includes(i));
    if (!pool.length) {
      const last = shown[shown.length - 1];
      pool = ok.length > 1 ? ok.filter(({ i }) => i !== last) : ok;
      seen.shown[key] = [];
    }
    let best = pool[0];
    for (const p of pool) if (specificity(p.l.when) > specificity(best.l.when)) best = p;
    return { key, index: best.i, line: best.l };
  }
  return null;
}

/** Record that a picked line was shown. */
export function markSeen(seen: LoreSeen, p: Picked): void {
  (seen.shown[p.key] ??= []).push(p.index);
  seen.looks[p.key] = (seen.looks[p.key] ?? 0) + 1;
}

/** The painted text of a notice, formatted for a dialogue box. */
export function paintedText(o: ObjRef): string | null {
  const raw = o.props.lines;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return `“${raw.split('|').map((s) => s.trim()).join(' / ')}”`;
}

/** Every box of every lore line, for linting. */
export function allLoreText(table: LoreTable = LORE): { key: string; text: string }[] {
  const out: { key: string; text: string }[] = [];
  for (const [key, lines] of Object.entries(table)) for (const l of lines) for (const t of arr(l.t)) out.push({ key, text: t });
  return out;
}
