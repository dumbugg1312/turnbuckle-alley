import { GOSSIP } from './gossip';
import type { DialogueSet } from './types';

/**
 * All dialogue sets, collected with Vite's glob import so new character files
 * are picked up automatically. Town talk (gossip.ts) is added to each
 * character's lines here. Handwritten lines (handwritten.ts) are read by the
 * picker in world/talk.ts, ahead of everything else.
 */
const modules = import.meta.glob<{ default: DialogueSet }>('./chars/*.ts', { eager: true });

export const DIALOGUE: Record<string, DialogueSet> = {};
for (const m of Object.values(modules)) {
  if (m.default?.npc) DIALOGUE[m.default.npc] = m.default;
}
for (const [npc, lines] of Object.entries(GOSSIP)) {
  const ds = DIALOGUE[npc];
  if (ds && !ds.lines.includes(lines[0])) ds.lines.push(...lines);
}
