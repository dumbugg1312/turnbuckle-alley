import { Emitter } from './events';
import type { Input } from './input';
import type { SceneManager } from './scene';
import type { Screen } from './screen';
import { Clock } from './time';

export interface GameEvents extends Record<string, unknown> {
  newDay: void;
  money: number;
  toast: string;
  relationship: { id: string; delta: number };
  flag: string;
  item: { id: string; n: number };
  skill: { id: string; level: number };
}

/** Engine singletons, filled in by main.ts at boot. */
export const game = {
  screen: null as unknown as Screen,
  input: null as unknown as Input,
  scenes: null as unknown as SceneManager,
  clock: new Clock(),
  /** Real seconds since boot (for animation). */
  t: 0,
  /**
   * How far the renderer is between the last two fixed simulation steps (0..1).
   * Scenes interpolate moving things by it so motion is even on 120 Hz screens
   * and when a frame runs 0 or 2 steps.
   */
  alpha: 1,
  /** While > 0, world simulation (clock, NPCs, player control) is paused. */
  blockers: 0,
  bus: new Emitter<GameEvents>(),
  debug: false,
};

export function block(): () => void {
  game.blockers++;
  let done = false;
  return () => {
    if (!done) {
      done = true;
      game.blockers = Math.max(0, game.blockers - 1);
    }
  };
}
