import { beforeAll, describe, expect, it } from 'vitest';
import type { MapDef } from '../src/world/types';

// The systems register on import and two UI modules touch window/document at load.
const g = globalThis as unknown as Record<string, unknown>;
g.window ??= { addEventListener() {} };
g.document ??= { addEventListener() {}, hidden: true };

type Mods = {
  ACTIONS: Map<string, unknown>;
  MAPS: Map<string, MapDef>;
  lore: typeof import('../src/data/lore');
  sys: typeof import('../src/systems/lore');
  festival: typeof import('../src/systems/festival');
  npcs: typeof import('../src/data/npcs');
  GameMap: typeof import('../src/world/map').GameMap;
};
let M: Mods;

beforeAll(async () => {
  const { ACTIONS } = await import('../src/world/hooks');
  const { MAPS } = await import('../src/world/maps/index');
  await import('../src/world/maps/links');
  await import('../src/systems/index');
  M = {
    ACTIONS,
    MAPS,
    lore: await import('../src/data/lore'),
    sys: await import('../src/systems/lore'),
    festival: await import('../src/systems/festival'),
    npcs: await import('../src/data/npcs'),
    GameMap: (await import('../src/world/map')).GameMap,
  };
});

/** The audit's numbers before this pass (isInteractable over every placed object). */
const BEFORE: Record<string, number> = {
  town: 16, farm: 33, fair: 5, 'grandma-house': 2, sportatorium: 5, 'birdie-office': 2, lockers: 2, diner: 4, vfw: 0, library: 0,
  taqueria: 1, bakery: 1, radio: 0, tailor: 0, pawn: 3, hardware: 1, clinic: 1, studio: 0, sunnypines: 1, 'grandma-room': 2,
  school: 0, 'birdie-house': 1, 'house-abernathy': 0, airstream: 2, gasstation: 1, salon: 0, 'maxx-office': 1, apartment: 1,
};
/** The floor this pass guarantees. */
const FLOOR: Record<string, number> = {
  town: 85, farm: 38, fair: 15, 'grandma-house': 22, diner: 30, sportatorium: 32, vfw: 35, library: 18, radio: 9, tailor: 10,
  studio: 9, school: 9, salon: 8, 'house-abernathy': 9, taqueria: 14, bakery: 11, pawn: 11, hardware: 8, clinic: 8,
  sunnypines: 18, 'grandma-room': 10, 'birdie-house': 11, airstream: 9, gasstation: 7, 'birdie-office': 12, lockers: 14,
};

/** Same rule as WorldScene.isInteractable. */
function interactive(def: MapDef): number {
  let n = 0;
  for (const o of M.sys.placedObjects(def)) {
    if (M.ACTIONS.has(String(o.props.action ?? '')) || M.ACTIONS.has(o.id) || M.ACTIONS.has(o.kind) || typeof o.props.text === 'string') n++;
  }
  return n;
}

describe('every object has something to say', () => {
  it('raises the interactive count on every map to its floor, and by 300+ overall', () => {
    const rows: string[] = [];
    let before = 0;
    let after = 0;
    for (const def of M.MAPS.values()) {
      const n = interactive(def);
      rows.push(`${def.id.padEnd(16)} ${String(BEFORE[def.id] ?? '?').padStart(3)} -> ${String(n).padStart(3)} / ${def.objects.length}`);
      before += BEFORE[def.id] ?? 0;
      after += n;
      if (FLOOR[def.id] !== undefined) expect(n, def.id).toBeGreaterThanOrEqual(FLOOR[def.id]);
    }
    rows.push(`TOTAL            ${before} -> ${after}`);
    console.log(rows.join('\n'));
    expect(after - before).toBeGreaterThanOrEqual(300);
  });

  it('can reach what it talks about: interactive interior objects are in range of a floor tile', () => {
    const unreachable: string[] = [];
    let total = 0;
    for (const def of M.MAPS.values()) {
      if (def.id === 'maxx-office' || def.id === 'apartment') continue;
      const m = new M.GameMap(def);
      for (const o of m.objects) {
        if (!M.ACTIONS.has(o.id) && !M.ACTIONS.has(o.kind) && typeof o.props.text !== 'string') continue;
        total++;
        const hb = m.objectHit(o);
        if (!hb) continue;
        let ok = false;
        for (let ty = 0; ty < m.h && !ok; ty++)
          for (let tx = 0; tx < m.w && !ok; tx++) {
            if (m.blocked[ty * m.w + tx]) continue;
            const px = tx * 16 + 8;
            const py = ty * 16 + 13;
            for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
              const fx = px + dx * 12;
              const fy = py + dy * 12 - 3;
              if (fx - 4 < hb.x + hb.w && fx + 4 > hb.x && fy - 4 < hb.y + hb.h && fy + 4 > hb.y) ok = true;
            }
          }
        if (!ok) unreachable.push(`${def.id}:${o.id}`);
      }
    }
    console.log(`reachable by the action button: ${total - unreachable.length}/${total}; out of reach: ${unreachable.join(', ')}`);
    expect(unreachable).toEqual([]);
  });

  it('points every id, map/kind, tile and prop condition at something that exists', () => {
    const problems: string[] = [];
    const all = [...M.MAPS.values()].map((d) => ({ id: d.id, objs: M.sys.placedObjects(d) }));
    for (const [key, lines] of Object.entries(M.lore.LORE)) {
      let objs: { map: string; o: import('../src/data/lore').ObjRef }[] = [];
      if (key.startsWith('#')) objs = all.flatMap((m) => m.objs.filter((o) => o.id === key.slice(1)).map((o) => ({ map: m.id, o })));
      else if (key.includes('/')) {
        const [map, kind] = key.split('/');
        objs = (all.find((m) => m.id === map)?.objs ?? []).filter((o) => o.kind === kind).map((o) => ({ map, o }));
      } else objs = all.flatMap((m) => m.objs.filter((o) => o.kind === key).map((o) => ({ map: m.id, o })));
      if (!objs.length) problems.push(`${key}: no such object`);
      for (const l of lines) {
        const w = l.when;
        if (w?.tile && !objs.some(({ o }) => M.lore.objTile(o)[0] === w.tile![0] && M.lore.objTile(o)[1] === w.tile![1])) problems.push(`${key}: no object at tile ${w.tile}`);
        if (w?.prop && !objs.some(({ o }) => o.props[w.prop![0]] === w.prop![1])) problems.push(`${key}: no object with ${w.prop[0]}=${w.prop[1]}`);
        if (l.song && !l.song.startsWith('lore:') && !l.song.startsWith('theme:')) problems.push(`${key}: odd song ${l.song}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('rotates through every line, surfacing first looks and story lines first', () => {
    const { pickLore, markSeen } = M.lore;
    const table = {
      thing: [
        { t: 'plain one' },
        { t: 'first look', when: { first: true } },
        { t: 'after the debut', when: { flag: 'debuted' } },
        { t: 'plain two' },
      ],
    };
    const ctx = { season: 0, weather: 'sun' as const, minutes: 600, weekday: 0, year: 1, festival: false, flags: {} as Record<string, unknown>, hearts: () => 0, wins: 0, matches: 0 };
    const o = { id: 'x', kind: 'thing', x: 0, y: 16, props: {} };
    const seen = { shown: {}, looks: {} };
    const out: string[] = [];
    for (let i = 0; i < 4; i++) {
      const p = pickLore(o, 'town', ctx, seen, table)!;
      markSeen(seen, p);
      out.push(String(p.line.t));
    }
    expect(out.slice(0, 3)).toEqual(['first look', 'plain one', 'plain two']);
    expect(out[3]).toBe('plain one');
    ctx.flags.debuted = true;
    const p = pickLore(o, 'town', ctx, seen, table)!;
    expect(p.line.t).toBe('after the debut');
  });
});

// ---------------------------------------------------------------- writing style

const BANNED: [RegExp, string][] = [
  [/don['’]?t tell/i, '"Don\'t tell"'],
  [/do not tell/i, '"Do not tell"'],
  [/\beleven\b/i, '"eleven"'],
  [/you remembered/i, '"You remembered"'],
  [/i['’]m not crying/i, '"I\'m not crying"'],
  [/\bit['’]?s not [^.!?]{1,60}[.!?]\s+it['’]?s\b/i, '"It\'s not X. It\'s Y."'],
  [/\bit is not [^.!?]{1,60}[.!?]\s+it is\b/i, '"It is not X. It is Y."'],
  [/—/, 'em dash'],
];
/** Words that would let a public prop give the show away. Insider rooms are exempt. */
const KAYFABE = /\b(kayfabe|scripted|predetermined|fake match|rehearse[sd]? the finish|the finish is)\b/i;
const INSIDER = new Set(['lockers', 'birdie-office', 'birdie-house', 'airstream']);

const SOURCES = import.meta.glob(['../src/data/lore/*.ts', '../src/systems/festival.ts', '../src/systems/garden.ts', '../src/systems/garden-core.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('lore lines read like a person wrote them', () => {
  it('never uses the overused tics', () => {
    const hits: string[] = [];
    for (const { key, text } of M.lore.allLoreText()) for (const [re, name] of BANNED) if (re.test(text)) hits.push(`${key}: ${name} in "${text.slice(0, 60)}"`);
    const extra = [
      ...M.festival.FORTUNES.map((f) => f.text),
      ...Object.values(M.festival.RIDE_LINES).flat(),
    ];
    for (const text of extra) for (const [re, name] of BANNED) if (re.test(text)) hits.push(`festival: ${name} in "${text.slice(0, 60)}"`);
    for (const [file, src] of Object.entries(SOURCES)) for (const [re, name] of BANNED) if (re.test(src)) hits.push(`${file}: ${name}`);
    expect(hits).toEqual([]);
  });

  it('keeps kayfabe on every public prop', () => {
    const hits: string[] = [];
    for (const { key, text } of M.lore.allLoreText()) {
      const map = key.includes('/') ? key.split('/')[0] : null;
      if (map && INSIDER.has(map)) continue;
      if (KAYFABE.test(text)) hits.push(`${key}: "${text.slice(0, 60)}"`);
    }
    expect(hits).toEqual([]);
  });

  it('varies sentence length and has plenty of lines', () => {
    const all = M.lore.allLoreText().map((x) => x.text);
    expect(all.length).toBeGreaterThan(400);
    const short = all.filter((t) => t.split(/\s+/).length <= 9).length;
    expect(short, 'some lines should be very short').toBeGreaterThan(15);
  });
});

// ---------------------------------------------------------------- festival days

describe('festival days', () => {
  it('sends the town to the fair on supershow Saturdays and back for the show', () => {
    const { NPC_BY_ID, currentEntry } = M.npcs;
    const ctx = (supershow: boolean) => ({ weekday: 5, day: supershow ? 27 : 20, season: 0, weather: 'sun' as const, show: 'sat' as const, supershow, flags: { grandma_in_town: true } });
    for (const id of ['pip', 'agnes', 'gus', 'oakes']) {
      const n = NPC_BY_ID[id];
      expect(currentEntry(n, ctx(true), 11 * 60)?.map, id).toBe('fair');
      expect(currentEntry(n, ctx(false), 11 * 60)?.map, id).not.toBe('fair');
      expect(currentEntry(n, ctx(true), 20 * 60)?.map, `${id} at the show`).toBe(currentEntry(n, ctx(false), 20 * 60)?.map);
    }
  });

  it('puts every festival spot on open, walkable ground', () => {
    const fair = M.MAPS.get('fair')!;
    const m = new M.GameMap(fair);
    const bad = M.festival.FESTIVAL_SPOTS.filter((s) => m.blocked[s.y * m.w + s.x]).map((s) => `${s.id} ${s.x},${s.y}`);
    expect(bad).toEqual([]);
  });

  it('hands out every payoff fortune before the jokes', () => {
    const given: string[] = [];
    for (let i = 0; i < 6; i++) given.push(M.festival.nextFortune(given).id);
    expect(given.every((id) => M.festival.FORTUNES.find((f) => f.id === id)?.flag)).toBe(true);
  });
});
