import { audio } from '../../audio';
import { G, type Dir } from '../../core/state';
import { absDay } from '../../core/time';
import type { Line } from '../../data/dialogue/types';
import { choose, narrate, say } from '../../ui/dialog';
import { WORLD } from '../../world/scene';
import { addHearts, cutsceneSpeaker } from '../../world/talk';

/** Tiny script vocabulary shared by every chapter scene. */
export type Mood = Line['mood'];

export const N = (...lines: string[]) => narrate(...lines);
export const S = (who: string, ...lines: string[]) => say(cutsceneSpeaker(who), ...lines);
export const M = (who: string, mood: Mood, ...lines: string[]) => say(cutsceneSpeaker(who, mood), ...lines);
export const pick = <T extends string>(prompt: string | null, options: { label: string; value: T }[], who: string | null = null): Promise<T> =>
  choose(who ? cutsceneSpeaker(who) : null, prompt, options);
export const heart = (who: string, pts: number) => addHearts(who, pts);
export const music = (id: string) => audio.music(id, { fade: 0.6 });

/** Mark a beat done from inside another beat's script (chained scenes). */
export const markDone = (id: string) => void (G.flags[`ms_${id}`] = absDay());

export type CastSpot = [id: string, tx: number, ty: number, facing: Dir];

/**
 * Put the player (and a few actors) somewhere for a scene. Warps with a fade
 * when the player is on another map or asked to move; then spawns the cast.
 */
export async function stage(map: string, tx: number, ty: number, facing: Dir, cast: CastSpot[] = [], forceWarp = true): Promise<void> {
  const w = WORLD;
  if (!w) return;
  if (forceWarp || G.player.map !== map) await w.warpTo(map, tx, ty, facing);
  for (const [id, x, y, f] of cast) w.spawnTemp(id, x, y, f);
}

/** Spawn actors on the current map without moving the player. */
export function cast(spots: CastSpot[]): void {
  for (const [id, x, y, f] of spots) WORLD?.spawnTemp(id, x, y, f);
}

export function exit(...ids: string[]): void {
  for (const id of ids) WORLD?.despawn(id);
}

/** The player's current tile. */
export function playerTile(): { x: number; y: number } {
  const p = WORLD?.player;
  return p ? { x: Math.floor(p.x / 16), y: Math.floor((p.y - 1) / 16) } : { x: 10, y: 10 };
}
