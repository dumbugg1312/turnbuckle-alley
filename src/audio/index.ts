/**
 * Audio facade for Turnbuckle Alley. Every game module calls these; the API
 * is stable. All methods are safe to call before unlock() and never throw,
 * even with no WebAudio at all.
 *
 * Song ids: see songs/ (title, town, show, match, ...), 'theme:<character>'
 * for entrance themes and 'theme:<character>:town' for the gentle town
 * variations. Procedural entrance themes come from themeFor().
 */
import { Blips } from './blips';
import { Crowd, type CrowdReaction } from './crowd';
import { Engine } from './engine';
import { generateTheme, themeId, type SeedTheme } from './procedural';
import { Sfx } from './sfx';
import { getCompiled, getSongDef, getStingerDef, registerSong } from './songs';

export type { SeedTheme } from './procedural';
export { THEME_STYLES } from './procedural';

interface Live {
  eng: Engine;
  ctx: AudioContext;
  crowd: Crowd;
  sfx: Sfx;
  blips: Blips;
}

let live: Live | null = null;
let failed = false;
const state = {
  /** The last requested song (played on unlock if requested before it). */
  music: null as string | null,
  intensity: 0,
  vols: [0.8, 0.9] as [number, number],
};
const warned = new Set<string>();

function warnOnce(msg: string): void {
  if (warned.has(msg)) return;
  warned.add(msg);
  try {
    console.warn(`[audio] ${msg}`);
  } catch {
    /* ignore */
  }
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (e) {
    warnOnce(`error: ${(e as Error)?.message ?? e}`);
    return fallback;
  }
}

/** The running engine, or null if audio is locked, unavailable or suspended. */
function running(): Live | null {
  if (!live) return null;
  return live.ctx.state === 'running' ? live : null;
}

/** Resolve a song id to compiled data, generating fallbacks for unknown character themes. */
function resolveSong(id: string) {
  let def = getSongDef(id);
  if (!def && id.startsWith('gen:')) {
    const [, style, tempo, seed] = id.split(':');
    def = generateTheme({ style, tempo: Number(tempo), seed: Number(seed) });
    registerSong(def);
  }
  if (!def && id.startsWith('theme:')) {
    // A character without a hand-written theme still gets a stable one of their own.
    let h = 0;
    for (const ch of id) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0;
    const styles = ['rock', 'country', 'funk', 'orchestral', 'lucha', 'disco', 'synth'];
    const gen = generateTheme({ style: styles[h % styles.length], tempo: 100 + (h % 50), seed: h });
    def = { ...gen, id };
    registerSong(def);
  }
  if (!def) {
    warnOnce(`unknown song "${id}"`);
    return null;
  }
  return getCompiled(def);
}

function startMusic(l: Live, id: string | null, fade: number): void {
  if (id === null) {
    l.eng.playMusic(null, fade);
    return;
  }
  const song = resolveSong(id);
  if (song) l.eng.playMusic(song, fade);
}

function getAudioContextClass(): (new (opts?: AudioContextOptions) => AudioContext) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function create(): Live | null {
  const AC = getAudioContextClass();
  if (!AC) return null;
  const ctx = new AC({ latencyHint: 'interactive' });
  const eng = new Engine(ctx);
  const crowd = new Crowd(eng);
  eng.onTick = (now) => crowd.tick(now);
  eng.setVolumes(state.vols[0], state.vols[1]);
  eng.intensity = state.intensity;
  eng.run();
  const l: Live = { eng, ctx, crowd, sfx: new Sfx(eng), blips: new Blips(eng) };
  ctx.onstatechange = () => {
    if (ctx.state !== 'running') attachGestureListeners();
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      safe(() => {
        if (document.hidden) {
          if (ctx.state === 'running') void ctx.suspend().catch(() => undefined);
        } else if (ctx.state !== 'closed') void ctx.resume().catch(() => undefined);
      }, undefined);
    });
  }
  return l;
}

let listening = false;
function onGesture(): void {
  audio.unlock();
  if (live && live.ctx.state === 'running') detachGestureListeners();
}
function attachGestureListeners(): void {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('pointerdown', onGesture, { passive: true });
  window.addEventListener('keydown', onGesture, { passive: true });
  window.addEventListener('touchend', onGesture, { passive: true });
}
function detachGestureListeners(): void {
  if (!listening || typeof window === 'undefined') return;
  listening = false;
  window.removeEventListener('pointerdown', onGesture);
  window.removeEventListener('keydown', onGesture);
  window.removeEventListener('touchend', onGesture);
}

export const audio = {
  /** Call on the first user gesture. Creates/resumes the AudioContext (iOS needs this). */
  unlock(): void {
    safe(() => {
      if (failed) return;
      if (!live) {
        live = create();
        if (!live) {
          failed = true;
          warnOnce('WebAudio is not available; running silent');
          return;
        }
        // iOS Safari: play a silent buffer inside the gesture to fully unlock.
        const ctx = live.ctx;
        const b = ctx.createBuffer(1, 1, 22050);
        const s = ctx.createBufferSource();
        s.buffer = b;
        s.connect(ctx.destination);
        s.start(0);
        if (state.music) startMusic(live, state.music, 0.4);
      }
      const l = live;
      if (l.ctx.state !== 'running' && l.ctx.state !== 'closed') void l.ctx.resume().catch(() => undefined);
    }, undefined);
  },

  /** Crossfade to a song; null = silence; the same id again is a no-op. */
  music(id: string | null, opts?: { fade?: number }): void {
    safe(() => {
      if (id === state.music) return;
      state.music = id;
      if (live) startMusic(live, id, opts?.fade ?? 1.2);
    }, undefined);
  },

  /** Adaptive intensity, 0 (calm) to 1 (spectacle), within the current song. */
  intensity(v: number): void {
    safe(() => {
      const x = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
      if (Math.abs(x - state.intensity) < 0.01 && !(x === 0 || x === 1)) return;
      if (x === state.intensity) return;
      state.intensity = x;
      live?.eng.setIntensity(x);
    }, undefined);
  },

  sfx(id: string, opts?: { pitch?: number; volume?: number }): void {
    safe(() => running()?.sfx.play(id, opts?.pitch ?? 1, opts?.volume ?? 1), undefined);
  },

  /** Dialogue text blip for a voice (character id or 'default'). Rate-limited. */
  blip(voice?: string): void {
    safe(() => running()?.blips.play(voice), undefined);
  },

  /** Ambient crowd bed level 0..1 (0 = off). Cheap; call every frame. */
  crowd(level: number): void {
    if (live) live.crowd.setLevel(Number.isFinite(level) ? level : 0);
  },

  /** One-shot crowd reactions. */
  crowdReact(kind: 'pop' | 'boo' | 'gasp' | 'chant' | 'laugh' | 'cheer' | 'count', strength?: number): void {
    safe(() => running()?.crowd.react(kind as CrowdReaction, strength ?? 0.7), undefined);
  },

  /** Music and sfx volume, 0..1 each. */
  volumes(music: number, sfx: number): void {
    safe(() => {
      state.vols = [Number.isFinite(music) ? music : 0.8, Number.isFinite(sfx) ? sfx : 0.9];
      live?.eng.setVolumes(state.vols[0], state.vols[1]);
    }, undefined);
  },

  /** A short musical sting over the music (which ducks). See stingerIds(). */
  stinger(id: string): void {
    safe(() => {
      const l = running();
      if (!l) return;
      const def = getStingerDef(id);
      if (!def) return warnOnce(`unknown stinger "${id}"`);
      const c = getCompiled(def);
      if (c) l.eng.stinger(c);
    }, undefined);
  },

  /** Debug: the live playbacks (song id, scheduled stop time, gain). */
  debugPlaying(): unknown {
    return live ? { now: live.ctx.currentTime, state: live.ctx.state, playing: live.eng.debugState() } : null;
  },

  /** The song id currently requested (may not be audible yet if locked). */
  current(): string | null {
    return state.music;
  },

  /** True once the AudioContext is running. */
  isUnlocked(): boolean {
    return running() !== null;
  },
};

/**
 * Register the procedural entrance theme for a seed and return its song id
 * (playable with audio.music). The same seed always gives the same theme.
 */
export function themeFor(seedTheme: SeedTheme): string {
  return safe(() => {
    const id = themeId(seedTheme);
    if (!getSongDef(id)) registerSong(generateTheme(seedTheme));
    return id;
  }, 'title');
}

/**
 * Play a few bars of a procedural theme (for the character creator) over the
 * current music, which ducks and comes back afterwards. Returns the song id.
 */
export function previewTheme(seedTheme: SeedTheme, opts?: { bars?: number }): string {
  const id = themeFor(seedTheme);
  safe(() => {
    const l = running();
    const def = getSongDef(id);
    if (!l || !def) return;
    const c = getCompiled(def);
    if (c) l.eng.previewSong(c, opts?.bars ?? 6);
  }, undefined);
  return id;
}

/** Stop a preview early. */
export function stopPreview(): void {
  safe(() => running()?.eng.stopPreview(), undefined);
}

export { songIds, stingerIds } from './songs';
export { SFX_IDS } from './sfx';

// Backup unlock: the game also calls audio.unlock() from its first gesture.
attachGestureListeners();
