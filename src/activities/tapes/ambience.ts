import { G } from '../../core/state';

/**
 * Tiny self-contained ambience for tape nights: rain on the window and a VHS
 * hiss that swells when the tracking slips. Quiet, follows the SFX volume,
 * and fails silently if WebAudio isn't available.
 */
let ctx: AudioContext | null = null;
let rainGain: GainNode | null = null;
let hissGain: GainNode | null = null;
let nodes: AudioScheduledSourceNode[] = [];
let unlock: (() => void) | null = null;

function noiseBuffer(c: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return b;
}

export function startAmbience(rain: boolean): void {
  stopAmbience();
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const vol = Math.max(0, Math.min(1, G.settings.sfx));
    const master = ctx.createGain();
    master.gain.value = vol;
    master.connect(ctx.destination);
    // Rain: brown noise through a gentle band, with slow swells.
    rainGain = ctx.createGain();
    rainGain.gain.value = rain ? 0.16 : 0;
    const rs = ctx.createBufferSource();
    rs.buffer = noiseBuffer(ctx, 4, true);
    rs.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400;
    rs.connect(lp).connect(rainGain).connect(master);
    rs.start();
    nodes.push(rs);
    if (rain) {
      // Patter: white noise, highpassed, amplitude-modulated.
      const ps = ctx.createBufferSource();
      ps.buffer = noiseBuffer(ctx, 2, false);
      ps.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3200;
      const pg = ctx.createGain();
      pg.gain.value = 0.025;
      ps.connect(hp).connect(pg).connect(master);
      ps.start();
      nodes.push(ps);
    }
    // Hiss.
    hissGain = ctx.createGain();
    hissGain.gain.value = 0;
    const hs = ctx.createBufferSource();
    hs.buffer = noiseBuffer(ctx, 2, false);
    hs.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 5200;
    bp.Q.value = 0.6;
    hs.connect(bp).connect(hissGain).connect(master);
    hs.start();
    nodes.push(hs);
    if (ctx.state === 'suspended') {
      unlock = () => void ctx?.resume();
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      void ctx.resume().catch(() => {});
    }
  } catch {
    stopAmbience();
  }
}

/** 0..1 tracking error. */
export function setHiss(level: number): void {
  if (!ctx || !hissGain) return;
  hissGain.gain.setTargetAtTime(0.012 + level * 0.09, ctx.currentTime, 0.05);
}

export function stopAmbience(): void {
  for (const n of nodes) {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  }
  nodes = [];
  if (unlock) {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    unlock = null;
  }
  void ctx?.close().catch(() => {});
  ctx = null;
  rainGain = null;
  hissGain = null;
}
