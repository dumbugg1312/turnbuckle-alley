import './tapes.css';
import { audio } from '../../audio';
import { game } from '../../core/game';
import type { Scene } from '../../core/scene';
import { G, skillLevel } from '../../core/state';
import { sting } from '../../core/sting';
import { absDay, DAY_END, daylight } from '../../core/time';
import { pixelText } from '../../gfx/draw';
import { CARDS } from '../../match/cards';
import { narrate, toast } from '../../ui/dialog';
import { el, uiRoot } from '../../ui/dom';
import { WORLD } from '../../world/scene';
import { startAmbience, setHiss, stopAmbience } from './ambience';
import { openLibrary } from './library';
import { showReward } from './rewards';
import { completion, giveRingIq, libraryTapes, RARITY_XP, tapesState, watchedToday } from './state';
import { barSizeFor, difficultyFor, Tracking } from './tracking';
import { PH, PW, TvPicture, type PicMode, type PicState } from './tv';
import type { MomentDef, Spot, TapeDef } from './types';

const ANIM_SPOT: Record<string, Spot> = {
  strike: 'strike', kick: 'kick', slam: 'slam', suplex: 'suplex', grapple: 'hold', aerial: 'aerial', dive: 'dive', hold: 'hold', pin: 'pin',
  taunt: 'taunt', sell: 'sell', spin: 'spin', bomb: 'slam', lift: 'lift', drop: 'aerial', climb: 'aerial', finisher: 'slam', fireup: 'taunt',
};
const STORY_SPOT: Record<string, Spot> = { 'SG-06': 'promo', 'SG-04': 'table', 'PO-06': 'ladder', 'HK-10': 'box', 'TW-14': 'belt-missing', 'SG-12': 'parking', 'PO-13': 'lights-out', 'TW-04': 'mask', 'ST-04': 'mask' };

export function spotFor(m: MomentDef): Spot {
  if (m.spot) return m.spot;
  const r = m.reward;
  if (r.kind === 'move') return ANIM_SPOT[CARDS[r.card]?.anim ?? 'strike'] ?? 'strike';
  if (r.kind === 'story') return STORY_SPOT[r.card] ?? 'strike';
  if (r.kind === 'line') return r.line === 'chant' ? 'crowd' : 'promo';
  if (r.kind === 'design') return 'entrance';
  return 'promo';
}

const DEFAULT_DIFF: Record<TapeDef['rarity'], number> = { common: 1, uncommon: 2, rare: 3, legendary: 4 };

const ADS: { head: string; sub: string; color: string; from: number; to: number }[] = [
  { head: "FENWICK'S TV", sub: 'WE FIX WHAT IS WRONG WITH YOUR PICTURE', color: '#2d6a76', from: 1972, to: 1999 },
  { head: 'HOT TAG DINER', sub: 'PIE. COFFEE. BOOTHS.', color: '#d8434b', from: 1983, to: 2100 },
  { head: 'STEEL CHAIR', sub: 'IF IT BOLTS, BINDS OR FOLDS', color: '#c27a1e', from: 1950, to: 2100 },
  { head: 'SATURDAY!', sub: 'LIVE AT THE SPORTATORIUM', color: '#6a3fa0', from: 1950, to: 2100 },
  { head: "MISS OPAL'S", sub: 'SET AND CURL, FOUR DOLLARS', color: '#c8307a', from: 1960, to: 2008 },
  { head: 'OAKES FEED', sub: 'FEED AND SEED SINCE 1931', color: '#518c5c', from: 1950, to: 2100 },
  { head: 'WRSL 1340', sub: 'TURN IT UP, TURNBUCKLE ALLEY', color: '#3f74d8', from: 1960, to: 2100 },
];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function dateStamp(t: TapeDef): string {
  const m = t.title.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
  if (m) return `${MONTHS[Number(m[1]) - 1]} ${Number(m[2])} 19${m[3]}`;
  let h = 0;
  for (const c of t.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `${MONTHS[h % 12]} ${1 + (h % 27)} ${t.year}`;
}

interface Layout {
  w: number;
  h: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  floor: number;
}

type Wait = { left: number; ff: boolean; resolve: () => void };

class WatchScene implements Scene {
  private root!: HTMLElement;
  private crtWrap!: HTMLElement;
  private crt!: HTMLCanvasElement;
  private cx!: CanvasRenderingContext2D;
  private chip!: HTMLElement;
  private hint!: HTMLElement;
  private ffBtn!: HTMLElement;
  private ejectBtn!: HTMLButtonElement;
  private pic = new TvPicture();
  private small = document.createElement('canvas');
  private noise = document.createElement('canvas');
  private scan: HTMLCanvasElement | null = null;
  private vign: HTMLCanvasElement | null = null;
  private room: HTMLCanvasElement | null = null;
  private layout: Layout | null = null;
  private clock = 0;
  private tvOn = 0; // 0 off .. 1 on (power-on animation)
  private powering: 'on' | 'off' | null = null;
  private state: PicState | null = null;
  private tape: TapeDef | null = null;
  private wait: Wait | null = null;
  private tracking: Tracking | null = null;
  private trackDone: (() => void) | null = null;
  private distortion = 0;
  private roll = 0;
  private osd = '';
  private osdT = 0;
  private caption = '';
  private ejected = false;
  private holdPointer = false;
  private ffPointer = false;
  private cassette = 0; // 0 out .. 1 fully in
  private cassetteTarget = 0;
  private counter = 0;
  private stamp = '';
  private offKey: (() => void) | null = null;
  private onUp = () => (this.holdPointer = this.ffPointer = false);
  private variant: 'home' | 'grandma' | 'airstream';
  private rainy: boolean;
  private drops: { x: number; y: number; v: number }[] = [];
  done!: Promise<void>;
  private finish!: () => void;

  constructor() {
    const map = WORLD?.map?.id ?? '';
    this.variant = map === 'grandma-room' || map === 'sunnypines' ? 'grandma' : map === 'airstream' ? 'airstream' : 'home';
    this.rainy = G.weather.today === 'rain' || G.weather.today === 'storm';
    this.small.width = 40;
    this.small.height = 30;
    this.noise.width = PW;
    this.noise.height = PH;
    this.done = new Promise((r) => (this.finish = r));
  }

  // ------------------------------------------------------------ lifecycle

  enter(): void {
    this.buildDom();
    audio.music('tapes');
    startAmbience(this.rainy);
    void this.session();
  }

  exit(): void {
    this.offKey?.();
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    this.root?.remove();
    stopAmbience();
  }

  private buildDom(): void {
    this.root = el('div', 'tp-watch');
    this.crtWrap = el('div', 'tp-crt');
    this.crt = document.createElement('canvas');
    this.cx = this.crt.getContext('2d')!;
    this.crtWrap.append(this.crt);
    this.chip = el('div', 'tp-w-chip');
    this.ejectBtn = el('button', { class: 'btn small tp-w-eject' }, '⏏ Eject') as HTMLButtonElement;
    this.ejectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.eject();
    });
    this.hint = el('div', 'tp-w-hint');
    this.ffBtn = el('button', { class: 'btn small tp-w-ff' }, '▶▶');
    this.ffBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.ffPointer = true;
    });
    this.root.append(this.crtWrap, el('div', 'tp-w-top', this.chip, this.ejectBtn), this.hint, this.ffBtn);
    this.root.addEventListener('pointerdown', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('button, .tp-library-wrap, .tp-reward-wrap')) return;
      this.holdPointer = true;
    });
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    this.offKey = game.input.onKey((_k, code) => {
      if ((code === 'Escape' || code === 'KeyX') && this.tape && !this.root.querySelector('.tp-reward-wrap')) this.eject();
    });
    uiRoot().append(this.root);
    this.setChrome(false);
  }

  private setChrome(playing: boolean): void {
    this.ejectBtn.style.display = playing ? '' : 'none';
    this.ffBtn.style.display = playing ? '' : 'none';
    this.chip.style.display = playing ? '' : 'none';
    this.hint.style.display = playing ? '' : 'none';
  }

  // ------------------------------------------------------------ flow

  private async session(): Promise<void> {
    const st = tapesState();
    let last: string | undefined;
    let newStars = 0;
    let first = !st.tutorial.watch;
    this.powering = 'on';
    while (true) {
      let tape: TapeDef | null = null;
      if (first) {
        first = false;
        st.tutorial.watch = true;
        await narrate(
          'You slide a tape into the VCR. It clunks, whirs, and thinks about it.',
          'Old tapes are full of good moments, if you can keep the picture steady. When it starts to *roll*, **hold** (press and hold anywhere, or Space) to adjust the tracking.',
          'Keep the bright clear spot inside the green tracking bar until the meter fills. Catch the moment and it\'s yours: moves, story ideas, promo lines, gear designs... maybe something about 1983.',
        );
        const lib = libraryTapes().filter((t) => !watchedToday(t.id));
        tape = lib.sort((a, b) => (st.library[b.id].got ?? 0) - (st.library[a.id].got ?? 0))[0] ?? null;
      } else {
        // Another tape would run past 2 AM and the player would pass out at the TV.
        if (G.time.minutes > DAY_END - 60) {
          await narrate("Your eyelids are heavier than a steel chair. That's enough tape for tonight.");
          break;
        }
        if (last && !st.tutorial.library) {
          st.tutorial.library = true;
          await narrate('This is your *TAPE LIBRARY*: every tape you own, with a star rating for the moments you\'ve caught.', 'Lost a moment to static? Rewatch the tape another day. Be kind, rewind.');
        }
        tape = await openLibrary(this.root, { justWatched: last, newStars });
      }
      if (!tape) break;
      const before = completion(tape).caught;
      await this.play(tape);
      newStars = completion(tape).caught - before;
      last = tape.id;
    }
    this.powering = 'off';
    await new Promise((r) => setTimeout(r, 380));
    game.scenes.pop();
    this.finish();
  }

  private sleep(left: number, ff = false): Promise<void> {
    return new Promise((resolve) => {
      if (this.ejected) return resolve();
      this.wait = { left, ff, resolve };
    });
  }

  private shot(mode: PicMode, extra: Partial<PicState> = {}): void {
    if (!this.tape) return;
    this.state = { tape: this.tape, mode, spot: 'strike', who: this.tape.cast, t: 0, clock: this.clock, ...extra };
  }

  private flashOsd(text: string, secs = 2.2): void {
    this.osd = text;
    this.osdT = secs;
  }

  private eject(): void {
    if (!this.tape || this.ejected) return;
    this.ejected = true;
    this.wait?.resolve();
    this.wait = null;
    if (this.tracking) {
      this.tracking = null;
      this.trackDone?.();
    }
  }

  private async play(tape: TapeDef): Promise<void> {
    const st = tapesState();
    this.tape = tape;
    this.ejected = false;
    this.counter = 0;
    this.stamp = tape.format === 'camcorder' ? dateStamp(tape) : '';
    this.chip.textContent = `📼 ${tape.title}`;
    this.setChrome(true);
    this.hint.textContent = 'Hold ▶▶ (or →) to fast-forward';
    const startMinutes = G.time.minutes;
    let progress = 0;
    const entry = st.library[tape.id];
    // Insert the cassette.
    this.cassetteTarget = 1;
    audio.sfx('tape-in');
    this.shot('black');
    await this.sleep(1.1);
    audio.sfx('equipment', { volume: 0.4 });
    this.shot('blue');
    this.flashOsd('PLAY ▶', 3);
    await this.sleep(1.3);
    this.shot('snow');
    audio.sfx('static', { volume: 0.5 });
    await this.sleep(0.35);
    if (tape.card && tape.format !== 'camcorder') {
      this.shot('card', { card: tape.card });
      await this.sleep(2.4, true);
    }
    const ads = ADS.filter((a) => tape.year >= a.from && tape.year <= a.to);
    const gotOnTape: string[] = [];
    for (let i = 0; i < tape.moments.length && !this.ejected; i++) {
      const m = tape.moments[i];
      const who = m.who ?? tape.cast;
      const spot = spotFor(m);
      // Lead-in: a little of the match before the good part.
      this.shot('show', { spot: i === 0 ? 'strike' : 'kick', who: tape.cast });
      await this.sleep(2.2 + (i === 0 ? 0.6 : 0), true);
      if (this.ejected) break;
      this.shot('show', { spot, who });
      this.caption = m.call ?? '';
      const already = entry.caught.includes(m.id);
      if (already) {
        this.flashOsd(`★ ${m.name.toUpperCase()}`, 2.4);
        await this.sleep(2.6, true);
        this.caption = '';
      } else {
        await this.sleep(0.9);
        if (this.ejected) break;
        const caught = await this.trackMoment(tape, m);
        this.caption = '';
        if (this.ejected) break;
        if (caught) {
          const perfect = this.tracking?.perfect ?? false;
          this.tracking = null;
          this.flashOsd(perfect ? 'PAUSE ❚❚  CLEAN COPY!' : 'PAUSE ❚❚', 99);
          audio.sfx('star');
          const frozen = document.createElement('canvas');
          frozen.width = this.crt.width;
          frozen.height = this.crt.height;
          frozen.getContext('2d')!.drawImage(this.crt, 0, 0);
          this.paused = true;
          await this.sleep(0.6);
          const diff = m.difficulty ?? DEFAULT_DIFF[tape.rarity];
          const xp = Math.round(RARITY_XP[tape.rarity] * (0.8 + diff * 0.1) * (perfect ? 1.5 : 1));
          entry.caught.push(m.id);
          gotOnTape.push(m.id);
          st.stats.caught++;
          if (perfect) st.stats.perfect++;
          const lvl = giveRingIq(xp);
          await showReward(this.root, tape, m, frozen, xp, perfect);
          if (lvl) toast(`📈 Ring IQ is now level ${lvl}! The tracking bar gets a little wider.`);
          this.paused = false;
          this.flashOsd('PLAY ▶', 1.5);
        } else {
          this.tracking = null;
          st.stats.lost++;
          this.shot('snow');
          this.flashOsd('LOST TO STATIC', 2);
          audio.sfx('static');
          await this.sleep(1.4);
        }
      }
      progress = (i + 1) / tape.moments.length;
      if (!this.ejected && i < tape.moments.length - 1 && ads.length && tape.format === 'broadcast' && i === 0) {
        const ad = ads[(tape.year + i) % ads.length];
        this.shot('ad', { ad: [ad.head, ad.sub, ad.color] });
        await this.sleep(2.2, true);
      }
    }
    if (!this.ejected) {
      this.shot('show', { spot: 'taunt', who: tape.cast });
      await this.sleep(1.6, true);
      this.shot('black');
      this.flashOsd('STOP ■', 1.2);
      await this.sleep(0.9);
      this.flashOsd('◀◀ REWIND', 2);
      this.rewinding = true;
      audio.sfx('whoosh');
      this.shot('show', { spot: 'strike', who: tape.cast });
      await new Promise<void>((r) => (this.wait = { left: 1.3, ff: false, resolve: r }));
      this.rewinding = false;
    }
    // Eject.
    this.ejected = false;
    this.shot('blue');
    this.flashOsd('EJECT ⏏', 1);
    this.cassetteTarget = 0;
    audio.sfx('tape-in', { pitch: 0.8 });
    await this.sleep(0.9);
    this.setChrome(false);
    // Bookkeeping: time, stats, stars.
    entry.watched = true;
    entry.day = absDay();
    st.stats.watched++;
    const mins = Math.max(15, Math.round(60 * Math.max(progress, 0.25)));
    const passed = G.time.minutes - startMinutes;
    // Never tick into 2 AM from here: that runs the pass-out sleep under the TV.
    if (mins > passed) game.clock.advance(Math.max(0, Math.min(mins - passed, DAY_END - 1 - G.time.minutes)));
    const c = completion(tape);
    if (gotOnTape.length && c.caught === c.total) {
      sting('level-up');
      toast(`★★★ *${tape.title}*: every moment caught!`);
    }
    if (this.variant === 'grandma' && tape.cast.some((id) => id.startsWith('dottie') || id === 'birdie')) {
      await narrate("Grandma watches the whole thing without blinking. Her lips move with the calls a half-second before they happen.", 'When it ends she pats your hand and says nothing at all, which from the Duchess is a standing ovation.');
    }
    this.tape = null;
    this.state = null;
  }

  private paused = false;
  private rewinding = false;

  private trackMoment(tape: TapeDef, m: MomentDef): Promise<boolean> {
    const diff = m.difficulty ?? DEFAULT_DIFF[tape.rarity];
    const seed = (absDay() * 131 + tape.id.length * 17 + m.id.charCodeAt(0) * 7 + Math.floor(Math.random() * 1000)) >>> 0;
    this.tracking = new Tracking({ barSize: barSizeFor(skillLevel('ringiq')), difficulty: difficultyFor(diff), wobble: m.wobble ?? (diff >= 4 ? 'dart' : diff >= 3 ? 'mixed' : 'smooth') }, seed);
    this.flashOsd('TRACKING', 99);
    this.hint.textContent = game.input.lastDevice === 'keyboard' ? 'Hold SPACE to raise the tracking · keep the clear spot in the green bar' : 'Press and HOLD to raise the tracking · keep the clear spot in the green bar';
    audio.sfx('tracking');
    return new Promise((resolve) => {
      this.trackDone = () => {
        this.trackDone = null;
        this.hint.textContent = 'Hold ▶▶ (or →) to fast-forward';
        this.osd = '';
        const caught = this.tracking?.done === 'caught';
        resolve(caught);
      };
    });
  }

  // ------------------------------------------------------------ frame

  update(dt: number): void {
    this.clock += dt;
    if (this.osdT > 0) this.osdT -= dt;
    // Power animation.
    if (this.powering === 'on') this.tvOn = Math.min(1, this.tvOn + dt * 2.6);
    if (this.powering === 'off') this.tvOn = Math.max(0, this.tvOn - dt * 3.5);
    this.cassette += (this.cassetteTarget - this.cassette) * Math.min(1, dt * 5);
    const holding = this.holdPointer || game.input.isHeld('interact') || game.input.isHeld('up');
    const ff = this.ffPointer || game.input.isHeld('right');
    if (this.tracking && !this.tracking.done && !this.paused) {
      this.tracking.step(dt, holding);
      this.distortion = this.tracking.distortion;
      if (this.tracking.done) this.trackDone?.();
    } else {
      this.distortion += ((this.rewinding ? 0.75 : 0.03) - this.distortion) * Math.min(1, dt * 4);
    }
    setHiss(this.tape ? this.distortion : 0);
    if (this.wait) {
      const speed = this.wait.ff && ff ? 5 : 1;
      this.wait.left -= dt * speed;
      if (this.state && !this.paused) this.state.t += dt * speed;
      if (!this.paused) this.counter += dt * speed * 24;
      if (this.wait.left <= 0) {
        const w = this.wait;
        this.wait = null;
        w.resolve();
      }
      if (this.wait?.ff && ff) this.osd = 'FF ▶▶';
    } else if (this.state && !this.paused) {
      this.state.t += dt;
      this.counter += dt * 24;
    }
    if (this.state) this.state.clock = this.clock;
    this.ffBtn.classList.toggle('on', ff);
    this.positionCrt();
    this.drawCrt();
  }

  // ------------------------------------------------------------ the room (native canvas)

  private computeLayout(): Layout {
    const w = game.screen.w;
    const h = game.screen.h;
    const sh = Math.max(84, Math.min(180, Math.floor(h * 0.54)));
    const sw = Math.round((sh * 4) / 3);
    const sx = Math.floor(w / 2 - (sw + 22) / 2);
    const sy = Math.floor(h * 0.13);
    return { w, h, sx, sy, sw, sh, floor: Math.floor(h * 0.82) };
  }

  render(ctx: CanvasRenderingContext2D): void {
    const L = this.computeLayout();
    if (!this.layout || this.layout.w !== L.w || this.layout.h !== L.h) {
      this.layout = L;
      this.room = this.drawRoom(L);
      this.scan = null;
      this.vign = null;
    }
    ctx.drawImage(this.room!, 0, 0);
    this.drawWindow(ctx, L);
    // TV glow spilling into the room.
    const on = this.tvOn * (this.state ? 1 : 0.35);
    if (on > 0.02) {
      const [r, g, b] = this.pic.avg;
      const flick = 0.85 + Math.sin(this.clock * 23) * 0.05 + Math.random() * 0.06;
      const cxp = L.sx + L.sw / 2;
      const cyp = L.sy + L.sh / 2;
      const grad = ctx.createRadialGradient(cxp, cyp, L.sh * 0.3, cxp, cyp + L.sh * 0.3, L.w * 0.62);
      const k = Math.min(1, on * flick);
      grad.addColorStop(0, `rgba(${(r * 0.8 + 50) | 0},${(g * 0.8 + 50) | 0},${(b * 0.8 + 70) | 0},${0.32 * k})`);
      grad.addColorStop(0.5, `rgba(${r | 0},${g | 0},${(b + 30) | 0},${0.1 * k})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, L.w, L.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    this.drawVcr(ctx, L);
    // Screen glass (the CRT canvas sits on top of this).
    ctx.fillStyle = '#07080c';
    ctx.fillRect(L.sx, L.sy, L.sw, L.sh);
  }

  private drawRoom(L: Layout): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = L.w;
    c.height = L.h;
    const x = c.getContext('2d')!;
    x.imageSmoothingEnabled = false;
    const pal = this.variant === 'grandma'
      ? { wall: '#2e2a48', stripe: '#36304f', trim: '#4a4068', floor: '#3a2a3a', floor2: '#44303f' }
      : this.variant === 'airstream'
        ? { wall: '#3a2a20', stripe: '#43312a', trim: '#5a4434', floor: '#2e2018', floor2: '#382820' }
        : { wall: '#2b1d3a', stripe: '#332443', trim: '#4a3254', floor: '#3a2620', floor2: '#43302a' };
    x.fillStyle = pal.wall;
    x.fillRect(0, 0, L.w, L.h);
    // Wallpaper stripes / wood paneling.
    x.fillStyle = pal.stripe;
    const step = this.variant === 'airstream' ? 9 : 12;
    for (let i = 0; i < L.w; i += step) x.fillRect(i, 0, this.variant === 'airstream' ? 1 : 5, L.floor);
    if (this.variant === 'home') {
      x.fillStyle = 'rgba(244,182,63,0.05)';
      for (let i = 6; i < L.w; i += 24) for (let j = 8; j < L.floor; j += 20) x.fillRect(i, j, 2, 2);
    }
    // Chair rail and floor.
    x.fillStyle = pal.trim;
    x.fillRect(0, L.floor - 3, L.w, 3);
    x.fillStyle = pal.floor;
    x.fillRect(0, L.floor, L.w, L.h - L.floor);
    x.fillStyle = pal.floor2;
    for (let j = L.floor + 4; j < L.h; j += 6) x.fillRect(0, j, L.w, 1);
    // A rug.
    x.fillStyle = '#5a2a40';
    x.fillRect(L.w * 0.18, L.floor + 8, L.w * 0.64, L.h - L.floor - 8);
    x.fillStyle = '#7a3a52';
    x.fillRect(L.w * 0.18 + 3, L.floor + 11, L.w * 0.64 - 6, 1);
    // Cabinet under the TV.
    const casX = L.sx - 9;
    const casY = L.sy - 8;
    const casW = L.sw + 18 + 22;
    const casH = L.sh + 16;
    const cabY = casY + casH;
    x.fillStyle = '#5a3a26';
    x.fillRect(casX - 6, cabY, casW + 12, L.floor + 6 - cabY);
    x.fillStyle = '#6e4a30';
    x.fillRect(casX - 6, cabY, casW + 12, 3);
    x.fillStyle = '#3a2418';
    x.fillRect(casX + 2, cabY + 5, casW - 4, Math.max(8, L.floor + 2 - cabY - 7));
    // Tapes stacked in the cabinet.
    const owned = libraryTapes();
    const cols = ['#1e1a24', '#f2ead8', '#2c4166', '#c9404c', '#1e1a24', '#9cc8f0'];
    let tx = casX + 4 + Math.round(casW * 0.55);
    owned.slice(0, 22).forEach((t, i) => {
      x.fillStyle = t.spine.kind === 'retail' || t.spine.kind === 'clamshell' ? t.spine.color : cols[i % 2];
      x.fillRect(tx, cabY + 7, 2, Math.max(5, L.floor - cabY - 8));
      x.fillStyle = '#f6f0e2';
      x.fillRect(tx, cabY + 9, 2, 2);
      tx += 3;
    });
    // TV casing: wood console with a speaker grille and knobs.
    x.fillStyle = '#1a120e';
    x.fillRect(casX - 1, casY - 1, casW + 2, casH + 2);
    x.fillStyle = '#7a4e2e';
    x.fillRect(casX, casY, casW, casH);
    x.fillStyle = '#8a5a36';
    for (let i = 0; i < casH; i += 3) x.fillRect(casX, casY + i, casW, 1);
    x.fillStyle = '#5a3a22';
    x.fillRect(casX, casY + casH - 2, casW, 2);
    // Bezel.
    x.fillStyle = '#2a2420';
    x.fillRect(L.sx - 4, L.sy - 4, L.sw + 8, L.sh + 8);
    x.fillStyle = '#3e3630';
    x.fillRect(L.sx - 3, L.sy - 3, L.sw + 6, 1);
    // Grille and knobs.
    const gx = L.sx + L.sw + 6;
    x.fillStyle = '#3a2a1e';
    x.fillRect(gx, L.sy, 14, L.sh * 0.55);
    x.fillStyle = '#5a4430';
    for (let j = 0; j < L.sh * 0.55; j += 3) x.fillRect(gx + 1, L.sy + j, 12, 1);
    for (let k = 0; k < 2; k++) {
      const ky = L.sy + L.sh * 0.66 + k * 16;
      x.fillStyle = '#1e1a18';
      x.fillRect(gx + 2, ky, 10, 10);
      x.fillStyle = '#c8b090';
      x.fillRect(gx + 3, ky + 1, 8, 8);
      x.fillStyle = '#5a4430';
      x.fillRect(gx + 6, ky + 1, 2, 4);
    }
    // Rabbit ears.
    x.fillStyle = '#b8b8c4';
    const ex = casX + casW / 2;
    for (let i = 0; i < 22; i++) {
      x.fillRect(Math.round(ex - 4 - i * 0.9), casY - 2 - i, 1, 1);
      x.fillRect(Math.round(ex + 4 + i * 0.7), casY - 2 - i, 1, 1);
    }
    x.fillStyle = '#2a2420';
    x.fillRect(ex - 6, casY - 4, 12, 4);
    // "Be kind, rewind" sticker on the cabinet.
    x.fillStyle = '#f4b63f';
    x.fillRect(casX + casW - 40, casY + casH - 9, 32, 7);
    pixelText(x, 'BE KIND', casX + casW - 38, casY + casH - 8, '#7a2840');
    // Lamp (left) and a shelf (right) if there's room.
    if (casX > 70) {
      const lx = Math.floor(casX * 0.25);
      x.fillStyle = '#2a2018';
      x.fillRect(lx, L.floor - 64, 2, 64);
      x.fillRect(lx - 6, L.floor - 2, 14, 2);
      x.fillStyle = '#c8a070';
      x.beginPath();
      x.moveTo(lx - 9, L.floor - 64);
      x.lineTo(lx + 11, L.floor - 64);
      x.lineTo(lx + 7, L.floor - 78);
      x.lineTo(lx - 5, L.floor - 78);
      x.fill();
      const g = x.createRadialGradient(lx + 1, L.floor - 66, 2, lx + 1, L.floor - 50, 60);
      g.addColorStop(0, 'rgba(255,214,140,0.35)');
      g.addColorStop(1, 'rgba(255,214,140,0)');
      x.fillStyle = g;
      x.fillRect(0, 0, casX, L.h);
    }
    const rx = casX + casW + 12;
    if (L.w - rx > 50) {
      const shy = L.sy + 6;
      x.fillStyle = '#4a3020';
      for (let k = 0; k < 3; k++) x.fillRect(rx, shy + k * 26 + 20, Math.min(90, L.w - rx - 10), 3);
      // Photos and trophies.
      x.fillStyle = '#e6d6b8';
      x.fillRect(rx + 4, shy + 6, 12, 14);
      x.fillStyle = '#5b2a6e';
      x.fillRect(rx + 6, shy + 8, 8, 10);
      x.fillStyle = '#f4b63f';
      x.fillRect(rx + 24, shy + 10, 6, 10);
      x.fillRect(rx + 22, shy + 18, 10, 2);
      // A row of VHS spines.
      for (let i = 0; i < 9; i++) {
        x.fillStyle = cols[i % cols.length];
        x.fillRect(rx + 4 + i * 4, shy + 32, 3, 14);
        x.fillStyle = '#f6f0e2';
        x.fillRect(rx + 4 + i * 4, shy + 35, 3, 4);
      }
      x.fillStyle = '#58b368';
      x.fillRect(rx + 50, shy + 36, 10, 10);
      x.fillStyle = '#3f8a4a';
      x.fillRect(rx + 48, shy + 30, 4, 8);
      x.fillRect(rx + 58, shy + 28, 4, 9);
    }
    // Couch back in the foreground.
    x.fillStyle = '#20141e';
    x.fillRect(L.w * 0.12, L.h - 16, L.w * 0.76, 16);
    x.fillRect(L.w * 0.1, L.h - 22, 18, 22);
    x.fillRect(L.w * 0.9 - 18, L.h - 22, 18, 22);
    x.fillStyle = '#3a2232';
    x.fillRect(L.w * 0.12, L.h - 16, L.w * 0.76, 2);
    // Crocheted blanket.
    for (let i = 0; i < 12; i++) {
      x.fillStyle = ['#d8434b', '#f4b63f', '#2fa59a', '#ff5d8f'][i % 4];
      x.fillRect(L.w * 0.6 + i * 4, L.h - 15 + (i % 2), 3, 3);
    }
    return c;
  }

  private drawWindow(x: CanvasRenderingContext2D, L: Layout): void {
    const casX = L.sx - 9;
    const wx = 14;
    const ww = Math.min(70, casX - 34);
    if (ww < 30) return;
    const wy = 14;
    const wh = Math.min(70, L.floor - 90);
    if (wh < 24) return;
    const day = daylight();
    const sky = day > 0.6 ? (this.rainy ? '#6a7a8a' : '#8ac0e8') : day > 0.3 ? '#c8705a' : this.rainy ? '#1a1e2c' : '#141a34';
    x.fillStyle = '#4a3020';
    x.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
    x.fillStyle = sky;
    x.fillRect(wx, wy, ww, wh);
    if (day <= 0.3 && !this.rainy) {
      x.fillStyle = '#f6fbff';
      for (let i = 0; i < 9; i++) x.fillRect(wx + ((i * 37) % ww), wy + ((i * 23) % wh), 1, 1);
      x.fillStyle = '#fff1c2';
      x.fillRect(wx + ww - 16, wy + 6, 6, 6);
    }
    // Water tower silhouette.
    x.fillStyle = 'rgba(20,14,30,0.55)';
    x.fillRect(wx + ww * 0.3, wy + wh - 26, 14, 8);
    x.fillRect(wx + ww * 0.3 + 3, wy + wh - 18, 1, 18);
    x.fillRect(wx + ww * 0.3 + 10, wy + wh - 18, 1, 18);
    if (this.rainy) {
      while (this.drops.length < 40) this.drops.push({ x: Math.random() * ww, y: Math.random() * wh, v: 50 + Math.random() * 60 });
      x.fillStyle = 'rgba(190,210,240,0.55)';
      for (const d of this.drops) {
        d.y += d.v / 60;
        if (d.y > wh) {
          d.y = -4;
          d.x = Math.random() * ww;
        }
        x.fillRect(wx + Math.floor(d.x), wy + Math.floor(d.y), 1, 3);
      }
      x.fillStyle = 'rgba(190,210,240,0.25)';
      for (let i = 0; i < 6; i++) x.fillRect(wx + ((i * 29 + Math.floor(this.clock * 3)) % ww), wy + ((i * 17) % wh), 2, 2);
    }
    // Mullions and curtains.
    x.fillStyle = '#4a3020';
    x.fillRect(wx + Math.floor(ww / 2), wy, 2, wh);
    x.fillRect(wx, wy + Math.floor(wh / 2), ww, 2);
    x.fillStyle = this.variant === 'grandma' ? '#6a5a9a' : '#7a2840';
    x.fillRect(wx - 8, wy - 6, 12, wh + 14);
    x.fillRect(wx + ww - 4, wy - 6, 12, wh + 14);
  }

  private drawVcr(x: CanvasRenderingContext2D, L: Layout): void {
    const casX = L.sx - 9;
    const casW = L.sw + 18 + 22;
    const cabY = L.sy - 8 + L.sh + 16;
    const vw = Math.min(90, Math.round(casW * 0.48));
    const vx = casX + 8;
    const vy = cabY + 6;
    x.fillStyle = '#16141a';
    x.fillRect(vx, vy, vw, 13);
    x.fillStyle = '#2a2830';
    x.fillRect(vx, vy, vw, 1);
    // Cassette slot.
    x.fillStyle = '#060508';
    x.fillRect(vx + 6, vy + 3, 36, 4);
    // Display.
    x.fillStyle = '#0a1a10';
    x.fillRect(vx + vw - 34, vy + 3, 28, 7);
    let txt = Math.floor(this.clock * 1.5) % 2 ? '12:00' : '';
    if (this.tape) txt = this.osd.startsWith('FF') ? 'FF' : this.paused ? 'PAUSE' : this.rewinding ? 'REW' : 'PLAY';
    if (txt) pixelText(x, txt, vx + vw - 32, vy + 4, '#58ff9a');
    x.fillStyle = this.tape ? '#ff3a3a' : '#5a1a1a';
    x.fillRect(vx + 46, vy + 4, 2, 2);
    // Cassette sliding in.
    if (this.cassette > 0.02 && this.cassette < 0.98) {
      const k = this.cassette;
      const cy = vy + 3 + (1 - k) * 40;
      x.fillStyle = '#1e1a24';
      x.fillRect(vx + 7, cy, 34, 20);
      x.fillStyle = '#f6f0e2';
      x.fillRect(vx + 10, cy + 2, 28, 6);
      x.fillStyle = '#3a3448';
      x.fillRect(vx + 12, cy + 11, 7, 5);
      x.fillRect(vx + 29, cy + 11, 7, 5);
      // Cover the part that's already inside.
      x.fillStyle = '#16141a';
      x.fillRect(vx + 6, vy - 2, 36, 5);
    }
  }

  // ------------------------------------------------------------ the CRT (DOM canvas over the screen)

  private positionCrt(): void {
    const L = this.layout ?? this.computeLayout();
    const k = game.screen.cssPerNative;
    const left = L.sx * k;
    const top = L.sy * k;
    const w = L.sw * k;
    const h = L.sh * k;
    const st = this.crtWrap.style;
    const want = `${left.toFixed(1)}px,${top.toFixed(1)}px,${w.toFixed(1)}px,${h.toFixed(1)}px`;
    if (this.crtWrap.dataset.pos !== want) {
      this.crtWrap.dataset.pos = want;
      st.left = `${left}px`;
      st.top = `${top}px`;
      st.width = `${w}px`;
      st.height = `${h}px`;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.min(1100, Math.round(w * dpr));
      this.crt.width = cw;
      this.crt.height = Math.round((cw * 3) / 4);
      this.scan = null;
      this.vign = null;
    }
  }

  private overlays(W: number, H: number): void {
    if (!this.scan) {
      const s = document.createElement('canvas');
      s.width = W;
      s.height = H;
      const x = s.getContext('2d')!;
      const rowH = H / PH;
      for (let r = 0; r < PH; r++) {
        x.fillStyle = 'rgba(43,33,64,0.42)';
        x.fillRect(0, r * rowH + rowH * 0.62, W, rowH * 0.38);
        x.fillStyle = 'rgba(255,255,255,0.025)';
        x.fillRect(0, r * rowH, W, rowH * 0.2);
      }
      // Faint aperture grille.
      x.globalAlpha = 0.05;
      for (let i = 0; i < W; i += 3) {
        x.fillStyle = ['#ff0000', '#00ff00', '#0000ff'][i % 3];
        x.fillRect(i, 0, 1, H);
      }
      this.scan = s;
    }
    if (!this.vign) {
      const v = document.createElement('canvas');
      v.width = W;
      v.height = H;
      const x = v.getContext('2d')!;
      const g = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
      g.addColorStop(0, 'rgba(43,33,64,0)');
      g.addColorStop(0.7, 'rgba(43,33,64,0.25)');
      g.addColorStop(1, 'rgba(43,33,64,0.85)');
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      // Glass glare.
      const gl = x.createLinearGradient(0, 0, W * 0.6, H * 0.6);
      gl.addColorStop(0, 'rgba(255,255,255,0.10)');
      gl.addColorStop(0.35, 'rgba(255,255,255,0.03)');
      gl.addColorStop(0.36, 'rgba(255,255,255,0)');
      x.fillStyle = gl;
      x.fillRect(0, 0, W, H);
      this.vign = v;
    }
  }

  private drawCrt(): void {
    const x = this.cx;
    const W = this.crt.width;
    const H = this.crt.height;
    if (!W || !H) return;
    this.overlays(W, H);
    if (this.tvOn <= 0.001) {
      x.fillStyle = '#07080c';
      x.fillRect(0, 0, W, H);
      x.drawImage(this.vign!, 0, 0);
      return;
    }
    const reduce = G.settings.reduceMotion ? 0.35 : 1;
    const D = this.distortion;
    // Picture.
    if (this.state && !this.paused) this.pic.render(this.state, D);
    else if (!this.state) {
      const c = this.pic.ctx;
      c.fillStyle = '#1b34c8';
      c.fillRect(0, 0, PW, PH);
      this.pic.avg = [27, 52, 200];
    }
    const src = this.pic.canvas;
    // Phosphor persistence instead of a hard clear.
    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
    x.fillStyle = 'rgba(4,4,8,0.62)';
    x.fillRect(0, 0, W, H);
    x.imageSmoothingEnabled = false;
    const rowH = H / PH;
    // Vertical roll when the tracking is way off.
    if (D > 0.55 && !this.paused) this.roll += (D - 0.55) * 140 * reduce * (1 / 60);
    else {
      const target = Math.round(this.roll / PH) * PH;
      this.roll += (target - this.roll) * 0.12;
    }
    if (this.rewinding) this.roll -= 2.2;
    const band = PH - ((this.clock * 38) % (PH + 50));
    const bandH = 4 + D * 16;
    const jitterBase = this.paused ? 0.6 : 0.25;
    for (let r = 0; r < PH; r++) {
      const srcRow = (((r + Math.floor(this.roll)) % PH) + PH) % PH;
      const ny = (r / PH - 0.5) * 2;
      const wscale = 1 - 0.035 * ny * ny;
      let wob = Math.sin(r * 0.21 + this.clock * 13) * D * 5 + Math.sin(r * 0.05 + this.clock * 3.1) * D * 4;
      wob += Math.sin(this.clock * 50 + r * 1.7) * jitterBase;
      const inBand = Math.abs(r - band) < bandH && (D > 0.2 || this.tape?.gen === 4);
      if (inBand) wob += (Math.random() - 0.5) * (6 + D * 28);
      if (this.rewinding) wob += Math.sin(r * 0.6 + this.clock * 40) * 3;
      wob *= reduce;
      const dw = W * wscale;
      const dx = (W - dw) / 2 + wob * (W / PW);
      // The vertical blanking bar shows up where the roll wraps.
      const blank = Math.floor(this.roll) % PH !== 0 && (srcRow < 3 || srcRow > PH - 3);
      if (blank) continue;
      x.drawImage(src, 0, srcRow, PW, 1, dx, r * rowH, dw, rowH + 0.6);
      if (inBand) {
        x.globalAlpha = Math.min(0.9, 0.3 + D * 0.6);
        x.drawImage(this.noise, 0, (r * 7) % PH, PW, 1, dx, r * rowH, dw, rowH + 0.6);
        x.globalAlpha = 1;
      }
    }
    // Refresh the static texture a few times a second.
    if (Math.random() < 0.5) {
      const nx = this.noise.getContext('2d')!;
      const img = nx.createImageData(PW, PH);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = n;
        d[i + 3] = 255;
      }
      nx.putImageData(img, 0, 0);
    }
    // Overall static when it's bad.
    if (D > 0.3) {
      x.globalAlpha = (D - 0.3) * 0.32 * reduce;
      x.drawImage(this.noise, 0, 0, W, H);
      x.globalAlpha = 1;
    }
    // Bloom: a tiny smoothed copy added back on.
    const sm = this.small.getContext('2d')!;
    sm.imageSmoothingEnabled = true;
    sm.drawImage(src, 0, 0, 40, 30);
    x.imageSmoothingEnabled = true;
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.2;
    x.drawImage(this.small, -W * 0.02, -H * 0.02, W * 1.04, H * 1.04);
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
    x.imageSmoothingEnabled = false;
    // OSD.
    this.drawOsd(x, W, H);
    x.drawImage(this.scan!, 0, 0);
    // Power on/off: the picture squeezes into a bright line.
    if (this.tvOn < 1) {
      const k = this.tvOn;
      const visible = Math.max(2, H * k * k);
      x.fillStyle = '#05060a';
      x.fillRect(0, 0, W, (H - visible) / 2);
      x.fillRect(0, (H + visible) / 2, W, (H - visible) / 2 + 1);
      x.fillStyle = `rgba(230,240,255,${(1 - k) * 0.9})`;
      x.fillRect(W * (0.5 - k / 2), H / 2 - 2, W * k, 4);
    }
    x.drawImage(this.vign!, 0, 0);
  }

  private osdText(x: CanvasRenderingContext2D, s: string, px: number, py: number, size: number, color = '#eaf6ff', align: CanvasTextAlign = 'left'): void {
    x.font = `${Math.round(size)}px 'Silkscreen', monospace`;
    x.textAlign = align;
    x.textBaseline = 'top';
    x.fillStyle = 'rgba(43,33,64,0.75)';
    x.fillText(s, px + size * 0.12, py + size * 0.12);
    x.fillStyle = color;
    x.fillText(s, px, py);
  }

  private drawOsd(x: CanvasRenderingContext2D, W: number, H: number): void {
    const fs = Math.max(10, H / 15);
    const m = fs * 0.9;
    if (this.osd && (this.osdT > 0 || this.tracking)) {
      const blink = this.osd === 'TRACKING' ? Math.floor(this.clock * 3) % 2 === 0 : true;
      if (blink) this.osdText(x, this.osd, m, m, fs);
    }
    if (this.tape) {
      const sp = this.tape.stickers?.find((s) => s === 'EP' || s === 'SLP' || s === 'SP') ?? 'SP';
      if (!this.tracking) this.osdText(x, sp, W - m, m, fs * 0.8, '#eaf6ff', 'right');
      const secs = Math.floor(this.counter);
      const cnt = `${Math.floor(secs / 3600)}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
      if (!this.tracking) this.osdText(x, cnt, W - m, m + fs * 1.1, fs * 0.7, '#cfe6ff', 'right');
      if (this.stamp && this.state?.mode === 'show') this.osdText(x, this.stamp, W - m, H - m - fs * 0.9, fs * 0.8, '#ffd84a', 'right');
      if (this.caption && this.state?.mode === 'show' && !this.tracking) {
        x.font = `${Math.round(fs * 0.7)}px 'Silkscreen', monospace`;
        const tw = x.measureText(this.caption).width;
        x.fillStyle = 'rgba(43,33,64,0.85)';
        x.fillRect(W / 2 - tw / 2 - fs * 0.3, H - m - fs * 1.1, tw + fs * 0.6, fs);
        this.osdText(x, this.caption, W / 2, H - m - fs * 1.0, fs * 0.7, '#ffffff', 'center');
      }
    }
    const tr = this.tracking;
    if (tr) {
      const gx = W * 0.87;
      const gw = W * 0.05;
      const gy = H * 0.17;
      const gh = H * 0.64;
      const Y = (v: number) => gy + gh * (1 - v);
      // Gauge frame.
      x.fillStyle = 'rgba(6,10,24,0.55)';
      x.fillRect(gx - 3, gy - 3, gw + 6, gh + 6);
      x.strokeStyle = '#eaf6ff';
      x.lineWidth = Math.max(1.5, W / 400);
      x.strokeRect(gx, gy, gw, gh);
      // Tick marks.
      x.fillStyle = 'rgba(234,246,255,0.4)';
      for (let i = 1; i < 10; i++) x.fillRect(gx - gw * 0.25, gy + (gh * i) / 10, gw * 0.2, 1);
      // The tracking bar.
      const on = tr.onTarget;
      const top = Y(tr.bar + tr.barSize);
      const bh = gh * tr.barSize;
      x.fillStyle = on ? 'rgba(110,255,160,0.55)' : 'rgba(90,220,140,0.32)';
      x.fillRect(gx + 2, top, gw - 4, bh);
      x.fillStyle = on ? '#b8ffcf' : '#5adc8c';
      x.fillRect(gx + 2, top, gw - 4, 2);
      x.fillRect(gx + 2, top + bh - 2, gw - 4, 2);
      // The clear zone (a little sparkling picture-perfect diamond).
      const zy = Y(tr.zone);
      const zs = gw * 0.42;
      x.save();
      x.translate(gx + gw / 2, zy);
      x.rotate(Math.PI / 4);
      x.fillStyle = '#ffffff';
      x.shadowColor = on ? '#b8ffcf' : '#ffd84a';
      x.shadowBlur = zs;
      x.fillRect(-zs / 2, -zs / 2, zs, zs);
      x.restore();
      x.shadowBlur = 0;
      // Catch meter.
      const mx = gx - gw * 0.85;
      const mw = gw * 0.38;
      x.fillStyle = 'rgba(6,10,24,0.55)';
      x.fillRect(mx - 2, gy - 2, mw + 4, gh + 4);
      const mv = tr.meter;
      x.fillStyle = mv > 0.66 ? '#5aff8c' : mv > 0.33 ? '#ffd84a' : '#ff5a5a';
      x.fillRect(mx, gy + gh * (1 - mv), mw, gh * mv);
      x.strokeStyle = '#eaf6ff';
      x.strokeRect(mx, gy, mw, gh);
      this.osdText(x, 'TRK', gx + gw / 2, gy - fs * 1.15, fs * 0.7, '#eaf6ff', 'center');
      if (tr.t < 1.6) this.osdText(x, 'HOLD ▲', gx - gw * 1.1, Y(tr.bar + tr.barSize / 2) - fs * 0.35, fs * 0.7, '#ffd84a', 'right');
    }
  }
}

/** Entry point: open the TV. */
export async function openTv(): Promise<void> {
  const scene = new WatchScene();
  game.scenes.push(scene);
  await scene.done;
}
