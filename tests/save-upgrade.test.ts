import { describe, expect, it } from 'vitest';
import { ext, G, newState, setState, upgradeState, type GameState } from '../src/core/state';

describe('save upgrade', () => {
  it('fills fields an older save is missing and keeps the ones it has', () => {
    const s = JSON.parse(JSON.stringify(newState(7))) as GameState;
    const raw = s as unknown as Record<string, unknown>;
    delete (s.settings as unknown as Record<string, unknown>).autoKickout;
    delete (s.player as unknown as Record<string, unknown>).bestStars;
    delete raw.showHistory;
    s.player.money = 999;
    s.player.map = 'grandma-house';
    const up = upgradeState(s);
    expect(up.settings.autoKickout).toBe(false);
    expect(up.player.bestStars).toBe(0);
    expect(up.showHistory).toEqual([]);
    expect(up.player.money).toBe(999);
    expect(up.player.map).toBe('grandma-house');
  });

  it('fills missing fields in a module slice once, without clobbering saved values', () => {
    const s = newState(1);
    s.ext['demo'] = { count: 5 };
    setState(s);
    const slice = ext('demo', () => ({ count: 0, list: [] as number[] }));
    expect(slice.count).toBe(5);
    expect(slice.list).toEqual([]);
    slice.list.push(1);
    expect(ext('demo', () => ({ count: 0, list: [] as number[] })).list).toEqual([1]);
    expect(G.ext['demo']).toBe(slice);
  });
});
