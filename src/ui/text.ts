import { G } from '../core/state';

const PRONOUNS: Record<string, { they: string; them: string; their: string; theirs: string; theyre: string; are: string }> = {
  they: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', theyre: "they're", are: 'are' },
  she: { they: 'she', them: 'her', their: 'her', theirs: 'hers', theyre: "she's", are: 'is' },
  he: { they: 'he', them: 'him', their: 'his', theirs: 'his', theyre: "he's", are: 'is' },
};

/**
 * Fill text placeholders: {name} real name, {ring} ring name (falls back to
 * name), {they} {them} {their} {theirs} {theyre} {are} player pronouns, with
 * capitalised variants like {They}.
 */
export function fmt(s: string): string {
  const p = PRONOUNS[G.player.pronouns] ?? PRONOUNS.they;
  const ring = G.player.persona?.ringName || G.player.name;
  return s.replace(/\{(\w+)\}/g, (m, key: string) => {
    const lower = key.toLowerCase();
    let v: string | undefined;
    if (lower === 'name') v = G.player.name;
    else if (lower === 'ring') v = ring;
    else if (lower === 'nick') v = G.player.persona?.nickname || 'kid';
    else if (lower in p) v = p[lower as keyof typeof p];
    if (v === undefined) return m;
    return key[0] === key[0].toUpperCase() && key[0] !== key[0].toLowerCase() ? v[0].toUpperCase() + v.slice(1) : v;
  });
}
