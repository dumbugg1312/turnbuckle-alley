import type { DialogueSet } from './types';

/**
 * All dialogue sets, collected with Vite's glob import so new character files
 * are picked up automatically.
 */
const modules = import.meta.glob<{ default: DialogueSet }>('./chars/*.ts', { eager: true });

export const DIALOGUE: Record<string, DialogueSet> = {};
for (const m of Object.values(modules)) {
  if (m.default?.npc) DIALOGUE[m.default.npc] = m.default;
}
