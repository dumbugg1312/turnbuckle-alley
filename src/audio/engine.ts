/**
 * The audio engine: master chain, lookahead scheduler, song playbacks with
 * crossfades and intensity layers, stingers, previews and ambient textures.
 * Works with a live AudioContext or an OfflineAudioContext (for analysis).
 */
import { INSTRUMENTS, type InstrumentDef } from './instruments';
import type { CompiledSong, CompiledTrack, Ev, SongFx } from './notation';
import { Voices } from './voices';

const LOOKAHEAD = 0.12;
const TICK_MS = 25;
/** Events this late still play (shifted to now); later ones are skipped. */
const LATE_OK = 0.08;

class Echo {
  readonly input: GainNode;
  private readonly delay: DelayNode;
  private readonly fb: GainNode;
  private readonly out: GainNode;

  constructor(ctx: BaseAudioContext, dest: AudioNode) {
    this.input = ctx.createGain();
    this.delay = ctx.createDelay(2);
    this.fb = ctx.createGain();
    this.out = ctx.createGain();
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2600;
    tone.Q.value = 0.3;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 250;
    this.input.connect(this.delay);
    this.delay.connect(tone);
    tone.connect(hp);
    hp.connect(this.fb);
    this.fb.connect(this.delay);
    hp.connect(this.out);
    this.out.connect(dest);
    this.delay.delayTime.value = 0.32;
    this.fb.gain.value = 0.3;
    this.out.gain.value = 0.3;
  }

  set(now: number, seconds: number, feedback: number, wet: number): void {
    this.delay.delayTime.setTargetAtTime(Math.min(1.9, Math.max(0.05, seconds)), now, 0.3);
    this.fb.gain.setTargetAtTime(Math.min(0.7, feedback), now, 0.2);
    this.out.gain.setTargetAtTime(wet, now, 0.2);
  }
}

interface TrackState {
  ct: CompiledTrack;
  inst: InstrumentDef;
  gain: GainNode;
  send: GainNode | null;
  vol: number;
  on: boolean;
  offSince: number;
  list: 0 | 1;
  i: number;
  iter: number;
  done: boolean;
  lastPitch: number | null;
}

export interface PlaybackOpts {
  dest: AudioNode;
  echoDest: AudioNode | null;
  start: number;
  fadeIn: number;
  intensity: number;
  /** Start this many beats into the song. */
  offsetBeats?: number;
  /** Stop after this many beats. */
  maxBeats?: number;
}

/** One playing song. */
export class Playback {
  readonly out: GainNode;
  private readonly send: GainNode;
  private readonly filter: BiquadFilterNode | null;
  private readonly wobble: GainNode | null;
  private readonly tracks: TrackState[] = [];
  private readonly spb: number;
  private readonly offset: number;
  private readonly endBeat: number;
  private readonly sources: AudioScheduledSourceNode[] = [];
  private readonly fxNext: Record<string, number> = {};
  private stopTime = Infinity;
  private disposed = false;
  private intensity: number;

  constructor(
    private readonly v: Voices,
    readonly song: CompiledSong,
    private readonly opts: PlaybackOpts,
  ) {
    const ctx = v.ctx;
    this.spb = 60 / song.bpm;
    this.offset = opts.offsetBeats ?? 0;
    this.endBeat = opts.maxBeats !== undefined ? this.offset + opts.maxBeats : song.loop ? Infinity : song.introBeats;
    this.intensity = opts.intensity;
    this.out = ctx.createGain();
    this.send = ctx.createGain();
    const t0 = opts.start;
    for (const g of [this.out, this.send]) {
      g.gain.setValueAtTime(opts.fadeIn > 0.02 ? 0 : 1, ctx.currentTime);
      if (opts.fadeIn > 0.02) {
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(1, t0 + opts.fadeIn);
      }
    }
    const fx = song.fx;
    if (fx.lowpass || song.intensityFilter) {
      this.filter = ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.Q.value = 0.6;
      this.filter.frequency.value = this.filterFreq();
      this.out.connect(this.filter);
      this.filter.connect(opts.dest);
    } else {
      this.filter = null;
      this.out.connect(opts.dest);
    }
    if (opts.echoDest) {
      this.send.connect(opts.echoDest);
    }
    if (fx.wobble) {
      this.wobble = ctx.createGain();
      this.wobble.gain.value = fx.wobble;
      v.wobbleLfo.connect(this.wobble);
    } else this.wobble = null;

    for (const ct of song.tracks) {
      const inst = INSTRUMENTS[ct.def.inst];
      if (!inst) continue;
      const gain = ctx.createGain();
      const vol = ct.def.vol ?? 1;
      const on = this.isOn(ct);
      gain.gain.value = on ? vol : 0;
      let head: AudioNode = gain;
      if (ct.def.pan && 'createStereoPanner' in ctx) {
        const p = ctx.createStereoPanner();
        p.pan.value = ct.def.pan;
        gain.connect(p);
        head = p;
      }
      head.connect(this.out);
      let send: GainNode | null = null;
      if (ct.def.echo && opts.echoDest) {
        send = ctx.createGain();
        send.gain.value = ct.def.echo;
        head.connect(send);
        send.connect(this.send);
      }
      const st: TrackState = { ct, inst, gain, send, vol, on, offSince: on ? Infinity : -Infinity, list: 0, i: 0, iter: 0, done: false, lastPitch: null };
      this.seek(st, this.offset);
      this.tracks.push(st);
    }
    this.startTextures(fx);
  }

  private filterFreq(): number {
    const f = this.song.intensityFilter;
    const base = this.song.fx.lowpass ?? 18000;
    if (!f) return base;
    return Math.min(base, f[0] * Math.pow(f[1] / f[0], Math.max(0, Math.min(1, this.intensity))));
  }

  private isOn(ct: CompiledTrack): boolean {
    return this.intensity >= (ct.def.in ?? 0) && this.intensity < (ct.def.out ?? 2);
  }

  private seek(st: TrackState, beat: number): void {
    const s = this.song;
    if (beat < s.introBeats || !s.loop) {
      st.list = 0;
      st.i = st.ct.intro.findIndex((e) => e.t >= beat - 1e-6);
      if (st.i < 0) {
        if (!s.loop || !s.loopBeats) st.done = true;
        else {
          st.list = 1;
          st.i = 0;
        }
      }
      return;
    }
    const rel = beat - s.introBeats;
    st.list = 1;
    st.iter = Math.floor(rel / s.loopBeats);
    const within = rel - st.iter * s.loopBeats;
    st.i = st.ct.loop.findIndex((e) => e.t >= within - 1e-6);
    if (st.i < 0) {
      st.iter++;
      st.i = 0;
    }
    if (!st.ct.loop.length) st.done = true;
  }

  setIntensity(v: number, now: number): void {
    this.intensity = v;
    for (const st of this.tracks) {
      const on = this.isOn(st.ct);
      if (on === st.on) continue;
      st.on = on;
      st.offSince = on ? Infinity : now;
      st.gain.gain.setTargetAtTime(on ? st.vol : 0, now, on ? 0.22 : 0.15);
    }
    if (this.filter && this.song.intensityFilter) this.filter.frequency.setTargetAtTime(this.filterFreq(), now, 0.25);
  }

  /** Schedule everything that starts before horizon. */
  tick(now: number, horizon: number): void {
    if (this.disposed) return;
    const s = this.song;
    for (const st of this.tracks) {
      let guard = 0;
      while (!st.done && guard++ < 512) {
        const list = st.list === 0 ? st.ct.intro : st.ct.loop;
        if (st.i >= list.length) {
          if (st.list === 0) {
            if (s.loop && s.loopBeats > 0 && st.ct.loop.length) {
              st.list = 1;
              st.i = 0;
              st.iter = 0;
            } else st.done = true;
          } else {
            st.iter++;
            st.i = 0;
          }
          continue;
        }
        const ev = list[st.i];
        const beat = st.list === 0 ? ev.t : s.introBeats + st.iter * s.loopBeats + ev.t;
        if (beat >= this.endBeat - 1e-6) {
          st.done = true;
          break;
        }
        let time = this.opts.start + (beat - this.offset) * this.spb;
        if (time > horizon) break;
        st.i++;
        if (time > this.stopTime) continue;
        if (time < now - LATE_OK) continue;
        if (time < now) time = now;
        const audible = st.on || now - st.offSince < 0.6;
        if (audible) this.play(st, ev, time);
      }
    }
    this.tickTextures(now, horizon);
  }

  private play(st: TrackState, ev: Ev, time: number): void {
    if (st.ct.drums) {
      if (ev.k) this.v.drum(ev.k, time, ev.v, st.gain);
      return;
    }
    const gate = ev.gate ?? st.ct.def.gate ?? st.inst.gate ?? 0.92;
    const dur = ev.d * this.spb * gate + (gate >= 1 ? 0.015 : 0);
    const from = ev.slide && st.lastPitch !== null ? st.lastPitch : null;
    this.v.note(st.inst, ev.n, time, dur, ev.v, st.gain, { from, wobble: this.wobble });
    st.lastPitch = ev.n[ev.n.length - 1];
  }

  /** Total length in seconds if it doesn't loop. */
  get length(): number {
    const beats = Math.min(this.endBeat, this.song.loop ? Infinity : this.song.introBeats) - this.offset;
    return beats * this.spb;
  }

  get start(): number {
    return this.opts.start;
  }

  get finished(): boolean {
    return this.disposed || this.tracks.every((t) => t.done);
  }

  get debugStop(): number {
    return this.stopTime;
  }

  /** Fade out and stop. */
  fadeOut(now: number, dur: number): void {
    if (this.stopTime < Infinity) {
      this.stopTime = Math.min(this.stopTime, now + dur);
      return;
    }
    this.stopTime = now + dur;
    for (const g of [this.out, this.send]) {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + Math.max(0.02, dur));
    }
  }

  /** Can this playback be thrown away? */
  isDead(now: number): boolean {
    if (this.disposed) return true;
    if (now > this.stopTime + 0.3) return true;
    if (this.finished && now > this.opts.start + this.length + 2.5) return true;
    return false;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* ignore */
      }
    }
    const nodes: (AudioNode | null)[] = [this.out, this.send, this.filter, this.wobble, ...this.tracks.flatMap((t) => [t.gain, t.send])];
    if (this.wobble) {
      try {
        this.v.wobbleLfo.disconnect(this.wobble);
      } catch {
        /* ignore */
      }
    }
    for (const n of nodes) {
      try {
        n?.disconnect();
      } catch {
        /* ignore */
      }
    }
  }

  // ─── Ambient textures ────────────────────────────────────────────────────

  private loopNoise(kind: 'white' | 'chip', level: number, setup: (src: AudioBufferSourceNode, g: GainNode) => AudioNode): void {
    const ctx = this.v.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.v.noise[kind];
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = level;
    const head = setup(src, g);
    head.connect(g);
    g.connect(this.out);
    src.start(this.opts.start);
    this.sources.push(src);
  }

  private startTextures(fx: SongFx): void {
    const ctx = this.v.ctx;
    if (fx.hiss) {
      this.loopNoise('white', fx.hiss * 0.12, (src) => {
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 5000;
        f.Q.value = 0.4;
        src.connect(f);
        return f;
      });
    }
    if (fx.rain) {
      this.loopNoise('white', fx.rain * 0.22, (src) => {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2400;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 400;
        src.connect(lp);
        lp.connect(hp);
        return hp;
      });
    }
    if (fx.wind) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 500;
      bp.Q.value = 1.4;
      this.loopNoise('white', fx.wind * 0.5, (src) => {
        src.connect(bp);
        return bp;
      });
      // Slowly moving gusts.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const depth = ctx.createGain();
      depth.gain.value = 260;
      lfo.connect(depth);
      depth.connect(bp.frequency);
      lfo.start(this.opts.start);
      this.sources.push(lfo);
    }
    if (fx.hum) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 120;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 520;
      const g = ctx.createGain();
      g.gain.value = fx.hum * 0.12;
      o.connect(lp);
      lp.connect(g);
      g.connect(this.out);
      o.start(this.opts.start);
      this.sources.push(o);
    }
    for (const k of ['crackle', 'crickets', 'birds', 'rain'] as const) if (fx[k]) this.fxNext[k] = this.opts.start + Math.random() * 0.5;
  }

  private tickTextures(now: number, horizon: number): void {
    const fx = this.song.fx;
    if (now > this.stopTime) return;
    const v = this.v;
    const dest = this.out;
    const next = this.fxNext;
    if (fx.crackle) {
      while (next.crackle < horizon) {
        const t = Math.max(now, next.crackle);
        v.noiseHit({ buf: 'white', t, dur: 0.004, vol: fx.crackle * (0.15 + Math.random() * 0.5), type: 'highpass', f: 1500, tc: 0.0015, dest });
        next.crackle += 0.04 + Math.random() * 0.25;
      }
    }
    if (fx.rain) {
      while (next.rain < horizon) {
        const t = Math.max(now, next.rain);
        v.tone({ wave: 'sine', f: 1800 + Math.random() * 2400, f2: 900 + Math.random() * 600, t, dur: 0.03, vol: fx.rain * 0.025, tc: 0.008, dest });
        next.rain += 0.05 + Math.random() * 0.22;
      }
    }
    if (fx.crickets) {
      while (next.crickets < horizon) {
        const t = Math.max(now, next.crickets);
        const f = 4300 + Math.random() * 500;
        for (let i = 0; i < 3; i++) v.tone({ wave: 'sine', f, t: t + i * 0.045, dur: 0.03, vol: fx.crickets * 0.02, a: 0.004, tc: 0.007, dest });
        next.crickets += 0.5 + Math.random() * 1.1;
      }
    }
    if (fx.birds) {
      while (next.birds < horizon) {
        const t = Math.max(now, next.birds);
        const notes = 2 + Math.floor(Math.random() * 3);
        const base = 2300 + Math.random() * 900;
        for (let i = 0; i < notes; i++) {
          const f = base * (1 + (Math.random() - 0.3) * 0.25);
          v.tone({ wave: 'tri', f, f2: f * 1.35, t: t + i * 0.11, dur: 0.07, vol: fx.birds * 0.05, a: 0.006, tc: 0.02, dest });
        }
        next.birds += 1.8 + Math.random() * 3.5;
      }
    }
  }
}

/** Everything that needs an AudioContext. */
export class Engine {
  readonly v: Voices;
  readonly master: GainNode;
  readonly pre: GainNode;
  readonly musicBus: GainNode;
  readonly musicDuck: GainNode;
  readonly previewBus: GainNode;
  readonly sfxBus: GainNode;
  readonly stingBus: GainNode;
  readonly crowdBus: GainNode;
  private readonly musicEcho: Echo;
  private readonly stingEcho: Echo;
  private current: Playback | null = null;
  private others: Playback[] = [];
  private preview: Playback | null = null;
  private duckUntil = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  intensity = 0;
  /** Called every scheduler tick (the crowd hooks in here). */
  onTick: ((now: number) => void) | null = null;

  constructor(readonly ctx: BaseAudioContext) {
    this.v = new Voices(ctx);
    this.master = ctx.createGain();
    this.master.gain.value = 0.85;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 10;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.006;
    comp.release.value = 0.22;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 11500;
    lp.Q.value = 0.5;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 30;
    this.pre = ctx.createGain();
    this.pre.connect(hp);
    hp.connect(lp);
    lp.connect(comp);
    comp.connect(this.master);
    this.master.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.connect(this.pre);
    this.musicDuck = ctx.createGain();
    this.musicDuck.connect(this.musicBus);
    this.previewBus = ctx.createGain();
    this.previewBus.connect(this.musicBus);
    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(this.pre);
    this.stingBus = ctx.createGain();
    this.stingBus.gain.value = 0.9;
    this.stingBus.connect(this.sfxBus);
    this.crowdBus = ctx.createGain();
    this.crowdBus.connect(this.sfxBus);
    this.musicEcho = new Echo(ctx, this.musicDuck);
    this.stingEcho = new Echo(ctx, this.stingBus);
    this.setVolumes(0.8, 0.9);
  }

  get now(): number {
    return this.ctx.currentTime;
  }

  /** Debug: every playback that is still alive. */
  debugState(): { id: string; stop: number; gain: number }[] {
    const all = this.current ? [this.current, ...this.others] : [...this.others];
    if (this.preview) all.push(this.preview);
    return all.map((p) => ({ id: p.song.id, stop: p.debugStop, gain: p.out.gain.value }));
  }

  get currentSong(): CompiledSong | null {
    return this.current?.song ?? null;
  }

  /** Beat position of the current song (for the jukebox display). */
  get currentBeat(): number {
    const p = this.current;
    if (!p) return 0;
    return Math.max(0, (this.now - p.start) * (p.song.bpm / 60));
  }

  setVolumes(music: number, sfx: number): void {
    const m = Math.pow(Math.max(0, Math.min(1, music)), 1.6) * 0.8;
    const s = Math.pow(Math.max(0, Math.min(1, sfx)), 1.6);
    this.musicBus.gain.setTargetAtTime(m, this.now, 0.05);
    this.sfxBus.gain.setTargetAtTime(s, this.now, 0.05);
  }

  /** Start the scheduler loop (live contexts only). */
  run(): void {
    if (this.timer !== null) return;
    const loop = () => {
      this.tick();
      this.timer = setTimeout(loop, TICK_MS);
    };
    loop();
  }

  stop(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  tick(horizon = this.now + LOOKAHEAD): void {
    const now = this.now;
    const all = this.current ? [this.current, ...this.others] : this.others;
    if (this.preview) all.push(this.preview);
    for (const p of all) {
      try {
        p.tick(now, horizon);
      } catch (e) {
        console.warn('[audio] playback error', e);
        p.dispose();
      }
    }
    this.others = this.others.filter((p) => {
      if (p.isDead(now)) {
        p.dispose();
        return false;
      }
      return true;
    });
    if (this.current?.isDead(now)) {
      this.current.dispose();
      this.current = null;
    }
    if (this.preview?.isDead(now)) {
      this.preview.dispose();
      this.preview = null;
      this.musicDuck.gain.setTargetAtTime(1, now, 0.35);
    }
    this.onTick?.(now);
  }

  private applyEcho(echo: Echo, song: CompiledSong): void {
    echo.set(this.now, song.echo.beats * (60 / song.bpm), song.echo.feedback, song.echo.wet);
  }

  /** Crossfade to a compiled song (null = silence). */
  playMusic(song: CompiledSong | null, fade: number): void {
    const now = this.now;
    const prev = this.current;
    if (prev) {
      prev.fadeOut(now, fade);
      this.others.push(prev);
      this.current = null;
    }
    if (!song) return;
    const delay = prev ? Math.min(0.6, fade * 0.35) : 0.05;
    this.applyEcho(this.musicEcho, song);
    this.current = new Playback(this.v, song, {
      dest: this.musicDuck,
      echoDest: this.musicEcho.input,
      start: now + delay,
      fadeIn: prev ? Math.max(0.05, fade * 0.65) : 0,
      intensity: this.intensity,
    });
    this.tick();
  }

  setIntensity(v: number): void {
    this.intensity = v;
    this.current?.setIntensity(v, this.now);
  }

  /** Play a one-shot stinger over the music, ducking it. */
  stinger(song: CompiledSong): void {
    const now = this.now;
    this.applyEcho(this.stingEcho, song);
    const p = new Playback(this.v, song, { dest: this.stingBus, echoDest: this.stingEcho.input, start: now + 0.02, fadeIn: 0, intensity: 1 });
    this.others.push(p);
    const end = now + 0.02 + p.length;
    this.musicDuck.gain.setTargetAtTime(0.28, now, 0.04);
    this.duckUntil = Math.max(this.duckUntil, end);
    this.musicDuck.gain.setTargetAtTime(this.preview ? 0 : 1, this.duckUntil, 0.45);
    p.tick(now, now + LOOKAHEAD);
  }

  /** Preview a song for a few bars over a ducked current song. */
  previewSong(song: CompiledSong, bars: number): void {
    const now = this.now;
    if (this.preview) {
      this.preview.fadeOut(now, 0.15);
      this.others.push(this.preview);
      this.preview = null;
    }
    this.musicDuck.gain.setTargetAtTime(0, now, 0.12);
    const beats = bars * song.meter;
    this.preview = new Playback(this.v, song, { dest: this.previewBus, echoDest: this.musicEcho.input, start: now + 0.15, fadeIn: 0, intensity: 1, maxBeats: beats });
    this.preview.fadeOut(now + 0.15 + (beats * 60) / song.bpm - 0.7, 0.7);
    this.tick();
  }

  stopPreview(): void {
    if (!this.preview) return;
    this.preview.fadeOut(this.now, 0.3);
  }
}
