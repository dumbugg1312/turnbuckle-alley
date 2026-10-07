import { G, setState, upgradeState, type GameState } from './state';

const KEY = 'turnbuckle-alley-save-v1';

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function saveGame(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(G));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const s = JSON.parse(raw) as GameState;
    if (!s || typeof s !== 'object' || !s.player) return false;
    setState(upgradeState(s));
    return true;
  } catch {
    return false;
  }
}

export function saveSummary(): { name: string; date: string; money: number } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    return {
      name: s.player.persona?.ringName || s.player.name,
      date: `Day ${s.time.day} of ${seasons[s.time.season]}, Year ${s.time.year}`,
      money: s.player.money,
    };
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

export function exportSave(): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(G))));
}
