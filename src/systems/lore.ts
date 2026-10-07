/**
 * Wires the object lore table (data/lore) into the action button.
 *
 * Every placed object that has lore and no handler of its own is registered
 * by id with onAction, so the world's isInteractable picks it up without any
 * change to the world scene. Existing handlers always win: an object whose
 * id, kind or action prop is already handled is left alone (the diner
 * jukebox is the one deliberate takeover; it now plays a snippet).
 */
import { audio } from '../audio';
import { registerSong } from '../audio/songs';
import type { SongDef } from '../audio/notation';
import { addItem, ext, G, hearts } from '../core/state';
import { isSupershow, weekday } from '../core/time';
import { item } from '../data/items';
import { hasLore, LORE, markSeen, paintedText, pickLore, type LoreCtx, type LoreSeen, type ObjRef } from '../data/lore';
import { iconFor } from '../gfx/icons';
import { narrate, toast } from '../ui/dialog';
import { ACTIONS, onEnterMap, type ActionCtx } from '../world/hooks';
import { MAPS } from '../world/maps/index';
import '../world/maps/links';
import { OBJECTS } from '../world/registry';
import { TILE, type MapDef } from '../world/types';
import { WORLD } from '../world/scene';

export function loreSeen(): LoreSeen {
  return ext<LoreSeen>('lore', () => ({ shown: {}, looks: {} }));
}

export function loreCtx(): LoreCtx {
  return {
    season: G.time.season,
    weather: G.weather.today,
    minutes: G.time.minutes,
    weekday: weekday(),
    year: G.time.year,
    festival: isSupershow(),
    flags: G.flags,
    hearts,
    wins: G.player.wins,
    matches: G.player.matches,
  };
}

/** A map's objects with the same ids GameMap gives them at runtime. */
export function placedObjects(def: MapDef): ObjRef[] {
  let n = 0;
  return def.objects.map((p) => ({
    id: p.id ?? `${def.id}-${p.kind}-${n++}`,
    kind: p.kind,
    x: Math.round(p.x * TILE),
    y: Math.round(p.y * TILE),
    props: { ...(p.props ?? {}) },
  }));
}

/** Ids this module took over on purpose even though a handler already existed. */
const TAKEOVER = new Set(['jukebox']);
/** Our own handler functions, so a later handler for the kind can still win. */
const MINE = new Set<unknown>();

function handledElsewhere(o: ObjRef): ((c: ActionCtx) => Promise<void> | void) | undefined {
  for (const k of [String(o.props.action ?? ''), o.id, o.kind]) {
    const fn = ACTIONS.get(k);
    if (fn && !MINE.has(fn)) return fn;
  }
  return undefined;
}

/** Register lore for one object if it has some and nobody else handles it. */
export function registerLoreObject(o: ObjRef, mapId: string): boolean {
  if (!hasLore(o, mapId)) return false;
  const existing = ACTIONS.get(o.id);
  if (existing && MINE.has(existing)) return true;
  if (!TAKEOVER.has(o.id) && handledElsewhere(o)) return false;
  ACTIONS.set(o.id, loreAction);
  return true;
}

/** Register every object on every known map. Safe to call again. */
export function registerAllLore(): number {
  let n = 0;
  for (const def of MAPS.values()) for (const o of placedObjects(def)) if (registerLoreObject(o, def.id)) n++;
  return n;
}

// ---------------------------------------------------------------- snippets

const SONGS: SongDef[] = [
  {
    id: 'lore:piano-1',
    title: 'Upright, Friendly',
    bpm: 84,
    meter: 4,
    loop: false,
    echo: { beats: 0.75, feedback: 0.3, wet: 0.3 },
    tracks: { piano: { inst: 'epiano' }, low: { inst: 'keys', vol: 0.6, center: 52 } },
    sections: {
      A: {
        chords: 'F | Dm | Bb | C7',
        piano: "A5q C6e A5e G5q F5q | F5q. E5e D5h | D5q F5e D5e C5q Bb4q | C5h. rq",
        low: '@1h 5h',
      },
    },
    form: ['A'],
  },
  {
    // A tune everyone's grandmother can play with two fingers.
    id: 'lore:chopsticks',
    title: 'Chopsticks',
    bpm: 168,
    meter: 3,
    loop: false,
    tracks: { piano: { inst: 'keys' } },
    sections: {
      A: {
        piano:
          '(F4 G4)q (F4 G4) (F4 G4) | (F4 G4) (F4 G4) (F4 G4) | (E4 G4) (E4 G4) (E4 G4) | (E4 G4) (E4 G4) (E4 G4) | (D4 B4) (D4 B4) (D4 B4) | (D4 B4) (D4 B4) (D4 B4) | (C4 C5) (C4 C5) (D4 B4) | (E4 A4) (F4 G4) (C4 C5)',
      },
    },
    form: ['A'],
  },
];
for (const s of SONGS) registerSong(s);
export const LORE_SONG_IDS = SONGS.map((s) => s.id);

let snippetTimer: ReturnType<typeof setTimeout> | null = null;
/** Play a song under a line, then hand the room its own music back. */
export function playSnippet(song: string, linger = 3500): () => void {
  audio.music(song, { fade: 0.35 });
  if (snippetTimer) clearTimeout(snippetTimer);
  return () => {
    snippetTimer = setTimeout(() => {
      snippetTimer = null;
      if (audio.current() === song) WORLD?.playMapMusic();
    }, linger);
  };
}

// ---------------------------------------------------------------- the action

const asArr = (t: string | string[]) => (Array.isArray(t) ? t : [t]);

async function loreAction(ctx: ActionCtx): Promise<void> {
  const o = ctx.object;
  // A system registered its own handler for this kind after we loaded: defer to it.
  const other = TAKEOVER.has(o.id) ? undefined : handledElsewhere(o);
  if (other) return other(ctx);
  await showLore(o, ctx.mapId);
}

/** Show the lore for an object right now. Exported for systems that wrap an object. */
export async function showLore(o: ObjRef, mapId: string): Promise<boolean> {
  const text = typeof o.props.text === 'string' ? o.props.text : null;
  const seen = loreSeen();
  const pick = pickLore(o, mapId, loreCtx(), seen, LORE, text ? 2 : 3);
  const boxes: string[] = text ? [text] : [];
  if (!pick) {
    if (boxes.length) await narrate(...boxes);
    return boxes.length > 0;
  }
  markSeen(seen, pick);
  const line = pick.line;
  let parts = asArr(line.t);
  const painted = paintedText(o);
  if (painted) parts = parts.some((p) => p.includes('{painted}')) ? parts.map((p) => p.split('{painted}').join(painted)) : [painted, ...parts];
  boxes.push(...parts);
  const firstTime = !!line.set && !G.flags[line.set];
  if (line.set) G.flags[line.set] = true;
  if (line.sfx) audio.sfx(line.sfx);
  const release = line.song ? playSnippet(line.song) : null;
  try {
    await narrate(...boxes);
  } finally {
    release?.();
  }
  if (line.give && (firstTime || !line.set)) {
    const [id, n] = line.give;
    addItem(id, n);
    audio.sfx('coin');
    toast(`+${n} ${item(id).name}`, iconFor(id));
  }
  return true;
}

// ---------------------------------------------------------------- prompt labels

/** Action-button words for kinds that read better than "Check". */
const LABELS: Record<string, string> = {
  notice: 'Read', poster: 'Read', calendar: 'Read', 'menu-board': 'Read', 'departures-board': 'Read', 'sighting-map': 'Read',
  'injury-board': 'Read', 'spine-chart': 'Read', whiteboard: 'Read', scoreboard: 'Read', 'bingo-board': 'Read', banner: 'Read',
  piano: 'Play', jukebox: 'Play', 'record-player': 'Play', 'speed-bag': 'Hit',
  photo: 'Look', 'photo-wall': 'Look', 'trophy-case': 'Look', 'fan-case': 'Look', 'mask-wall': 'Look', ofrenda: 'Look',
  'half-belt': 'Look', 'cardboard-belt': 'Look', dollhouse: 'Look', window: 'Look', 'round-window': 'Look', watertower: 'Look',
  birdcage: 'Look', 'tiered-cake': 'Look', 'mounted-bass': 'Look', 'velvet-chair': 'Look', 'robe-form': 'Look',
  fireplace: 'Warm up',
};
function applyLabels(): void {
  for (const [kind, word] of Object.entries(LABELS)) {
    const k = OBJECTS.get(kind);
    if (k && !k.label) k.label = () => word;
  }
}

// ---------------------------------------------------------------- hooks

// Mark our handler first, so re-registration is idempotent and later handlers by other systems still win.
MINE.add(loreAction);
registerAllLore();

onEnterMap(() => {
  applyLabels();
  // Safety net: objects are registered from the live map too, with their real ids.
  const m = WORLD?.map;
  if (m) for (const o of m.objects) registerLoreObject(o, m.id);
  return false;
});
