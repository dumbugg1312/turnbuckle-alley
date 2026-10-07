import type { MapObject } from './types';

/**
 * Extension points so game systems (story, shows, activities) can react to the
 * world without the world scene importing them. Register at module load.
 */
export interface ActionCtx {
  object: MapObject;
  mapId: string;
}

/** Object interactions by action id (object.props.action) or by kind. */
export const ACTIONS = new Map<string, (ctx: ActionCtx) => Promise<void> | void>();
export function onAction(idOrKind: string, fn: (ctx: ActionCtx) => Promise<void> | void): void {
  ACTIONS.set(idOrKind, fn);
}

/** Called after the player arrives on a map (after the fade). Return true if a cutscene ran. */
export const ENTER_HOOKS: ((mapId: string) => Promise<boolean> | boolean)[] = [];
export function onEnterMap(fn: (mapId: string) => Promise<boolean> | boolean): void {
  ENTER_HOOKS.push(fn);
}

/** Called every 10 game minutes while in the world. */
export const TICK_HOOKS: ((minutes: number) => void)[] = [];
export function onTick(fn: (minutes: number) => void): void {
  TICK_HOOKS.push(fn);
}

/**
 * Talk hooks run before normal dialogue when you talk to an NPC. Return true
 * if the hook handled the conversation (story pitches, show-night chats).
 */
export const TALK_HOOKS: ((npcId: string, place: string) => Promise<boolean> | boolean)[] = [];
export function onTalk(fn: (npcId: string, place: string) => Promise<boolean> | boolean): void {
  TALK_HOOKS.push(fn);
}

/** New-day hooks run each morning after sleeping (before the day starts). */
export const DAY_HOOKS: (() => Promise<void> | void)[] = [];
export function onNewDay(fn: () => Promise<void> | void): void {
  DAY_HOOKS.push(fn);
}

/** Extra items for the warp/door "locked" checks by destination map id. */
export const DOOR_RULES = new Map<string, () => string | null>();
export function doorRule(mapId: string, fn: () => string | null): void {
  DOOR_RULES.set(mapId, fn);
}
