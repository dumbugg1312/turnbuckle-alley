/**
 * Song registry. Pure: no WebAudio. The engine asks here for song data by id.
 *
 * To add a song: write a SongDef (see notation.ts for the format) in one of
 * the files in this folder and add it to that file's exported list. It is
 * then playable with audio.music('<id>') and shows up in the jukebox.
 */
import { compileSong, type CompiledSong, type SongDef } from '../notation';
import { ARENA_SONGS } from './arena';
import { credits } from './credits';
import { CHARACTER_IDS, LEITMOTIF_SONGS } from './leitmotifs';
import { STINGERS } from './stingers';
import { WORLD_SONGS } from './world';

export { CHARACTER_IDS, STINGERS };

const registry = new Map<string, SongDef>();
for (const s of [...WORLD_SONGS, ...ARENA_SONGS, credits, ...LEITMOTIF_SONGS]) registry.set(s.id, s);

const stingers = new Map<string, SongDef>(STINGERS.map((s) => [s.id.replace(/^stinger:/, ''), s]));

/** Extra songs registered at runtime (procedural entrance themes). */
export function registerSong(def: SongDef): void {
  registry.set(def.id, def);
  compiled.delete(def.id);
}

export function getSongDef(id: string): SongDef | undefined {
  return registry.get(id);
}

export function getStingerDef(id: string): SongDef | undefined {
  return stingers.get(id);
}

/** Every built-in song (not stingers). */
export function allSongs(): SongDef[] {
  return [...registry.values()];
}

export function songIds(): string[] {
  return [...registry.keys()];
}

export function stingerIds(): string[] {
  return [...stingers.keys()];
}

const compiled = new Map<string, CompiledSong>();

/** Compile (and cache) a song. Returns null if it doesn't exist or fails to compile. */
export function getCompiled(def: SongDef): CompiledSong | null {
  const hit = compiled.get(def.id);
  if (hit) return hit;
  try {
    const c = compileSong(def);
    compiled.set(def.id, c);
    return c;
  } catch (e) {
    if (typeof console !== 'undefined') console.warn(`[audio] could not compile ${def.id}:`, (e as Error).message);
    return null;
  }
}
