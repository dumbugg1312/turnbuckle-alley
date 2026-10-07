import './match.css';
import { audio } from '../audio';
import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { G } from '../core/state';
import { ctx2d, makeCanvas, pixelText, pixelTextOutlined } from '../gfx/draw';
import { Fx } from '../gfx/fx';
import type { Look } from '../gfx/look';
import { el, markup, sleep, uiRoot } from '../ui/dom';
import { banner, nextFrame } from '../ui/dialog';
import { Crowd, drawArenaBack, drawLights, drawRopesFront, flareSprite, glowSprite, ringGeo, type RingGeo } from './arena';
import { cardArt, TYPE_COLORS, TYPE_LABEL } from './cardart';
import { cardDef } from './cards';
import { Match, type HandCard } from './engine';
import type { MatchConfig, MatchEvent, MatchResult } from './types';
import { drawWrestler, poseFrames, REF_LOOK, wrestlerSprite, type WPose } from './wrestler-art';

interface Body {
  look: Look;
  x: number;
  y: number;
  z: number;
  pose: WPose;
  facing: 'left' | 'right';
  flash: number;
  frame: number;
  jitter: number;
  /** Offsets the idle/celebrate timers so the two wrestlers don't breathe in sync. */
  seed: number;
}

interface Anim {
  dur: number;
  t: number;
  start?: () => void;
  step?: (k: number, dt: number) => void;
  end?: () => void;
}

export interface MatchSceneOpts {
  config: MatchConfig;
  intro?: { title: string; subtitle?: string };
  /** Offered after the match: pick one to add to the deck. */
  rewardChoices?: string[];
  onDone: (result: MatchResult, reward: string | null) => void;
  /** Coaching lines shown once each: 'start', 'call', 'attack', or a phase id. */
  coach?: Partial<Record<string, string>>;
  /** Who is coaching (npc id for the portrait). */
  coachId?: string;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => 1 - Math.pow(1 - k, 3);
const easeIn = (k: number) => k * k;

/** Poses whose frame comes from the clock (cycles per second). */
const TIMED: Partial<Record<WPose, number>> = { idle: 1.4, celebrate: 4, fireup: 14, taunt: 2, stagger: 3, sell: 2.2, hold: 2, grapple: 3, climb: 5, wave: 3.5 };

export class MatchScene implements Scene {
  readonly m: Match;
  private opts: MatchSceneOpts;
  private stage = makeCanvas(10, 10);
  private sctx = ctx2d(this.stage);
  private crowd = new Crowd();
  private fx = new Fx();
  private geo: RingGeo = ringGeo(400, 240);
  private p!: Body;
  private o!: Body;
  private ref!: Body;
  private queue: Anim[] = [];
  private cur: Anim | null = null;
  private shake = 0;
  private ropeShake = 0;
  private zoom = 1;
  private zoomTarget = 1;
  private zoomAt = { x: 0, y: 0 };
  private flashWhite = 0;
  private flare = 0;
  private flareAt = { x: 0, y: 0 };
  private slowmo = 1;
  private dust: { x: number; y: number; vx: number; vy: number }[] = [];
  private pyro: { x: number; y: number; t: number }[] = [];
  private warm: { look: Look; pose: WPose; frame: number; facing: 'left' | 'right' }[] = [];
  private root!: HTMLElement;
  private ui: Record<string, HTMLElement> = {};
  private busy = false;
  private finished = false;
  private refCount = '';
  private focusIdx = -1;
  private offKey: (() => void) | null = null;
  private lastTicker = 0;
  /** While true the animation queue waits (coaching lines). */
  private pauseQueue = false;
  /** Dev: draw a pose sheet over the stage (#match?sheet=1). */
  private sheet = false;
  private frameMs = 0;

  constructor(opts: MatchSceneOpts) {
    this.opts = opts;
    this.m = new Match(opts.config);
  }

  // ------------------------------------------------------------ lifecycle

  enter(): void {
    const cfg = this.opts.config;
    this.sheet = /[?&]sheet=\d/.test(location.hash);
    this.resizeStage();
    const g = this.geo;
    this.p = { look: cfg.player.look, x: g.cx - 72, y: g.matY, z: 0, pose: 'idle', facing: 'right', flash: 0, frame: 0, jitter: 0, seed: 0 };
    this.o = { look: cfg.opponent.look, x: g.cx + 72, y: g.matY, z: 0, pose: 'idle', facing: 'left', flash: 0, frame: 0, jitter: 0, seed: 0.37 };
    this.ref = { look: REF_LOOK, x: g.cx, y: g.backY + 8, z: 0, pose: 'idle', facing: 'left', flash: 0, frame: 0, jitter: 0, seed: 0.71 };
    for (let i = 0; i < 40; i++) this.dust.push({ x: Math.random() * this.stage.width, y: Math.random() * g.frontY, vx: (Math.random() - 0.5) * 3, vy: 1 + Math.random() * 3 });
    // Pre-build the common sprites one per frame (about 8 ms each) so the first strike doesn't hitch.
    for (const look of [this.p.look, this.o.look]) {
      for (const facing of ['right', 'left'] as const) {
        for (const pose of ['idle', 'walk', 'stagger', 'grapple', 'strike', 'down', 'sell', 'lifted', 'lift'] as WPose[]) {
          for (let f = 0; f < poseFrames(pose); f++) this.warm.push({ look, pose, frame: f, facing });
        }
      }
    }
    for (const pose of ['idle', 'walk', 'count'] as WPose[]) for (let f = 0; f < poseFrames(pose); f++) this.warm.push({ look: REF_LOOK, pose, frame: f, facing: 'left' });
    this.buildDom();
    audio.music('match');
    audio.crowd(0.3);
    this.offKey = game.input.onKey((_k, code) => this.onKey(code));
    void this.intro();
  }

  exit(): void {
    this.root?.remove();
    this.offKey?.();
    audio.crowd(0);
  }

  private resizeStage(): void {
    const sw = game.screen.w;
    const sh = game.screen.h;
    if (this.stage.width !== sw || this.stage.height !== sh) {
      this.stage.width = sw;
      this.stage.height = sh;
      this.sctx = ctx2d(this.stage);
      this.crowd = Object.assign(new Crowd(), { level: this.crowd.level });
    }
    const g = ringGeo(sw, sh);
    if (this.p && (g.cx !== this.geo.cx || g.matY !== this.geo.matY)) {
      const dx = g.cx - this.geo.cx;
      const dy = g.matY - this.geo.matY;
      for (const b of [this.p, this.o, this.ref]) {
        b.x += dx;
        b.y += dy;
      }
    }
    this.geo = g;
  }

  private async intro(): Promise<void> {
    this.busy = true;
    const intro = this.opts.intro;
    if (intro) {
      await banner(intro.title, 1700, 30);
    }
    this.m.start();
    this.processEvents();
    await this.waitQueue();
    await this.coachSay('start');
    await this.coachSay('call');
    this.busy = false;
    this.renderUi();
  }

  private coached = new Set<string>();
  /** Show a coaching line once (blocking until tapped). */
  private async coachSay(key: string): Promise<void> {
    const line = this.opts.coach?.[key];
    if (!line || this.coached.has(key)) return;
    this.coached.add(key);
    const { say } = await import('../ui/dialog');
    const { speakerFor } = await import('../world/talk');
    await say(speakerFor(this.opts.coachId ?? 'birdie'), line);
  }

  // ------------------------------------------------------------ DOM

  private buildDom(): void {
    const isFace = this.opts.config.player.role === 'face';
    this.root = el('div', 'match-ui');
    const top = el('div', 'm-top');
    const phases = el('div', 'm-phases');
    for (const ph of this.m.phases) phases.append(el('div', 'm-phase', ph.name));
    const goal = el('div', 'm-goal');
    goal.append(el('span', 'label', 'Goal'), el('span', 'txt'), el('div', 'bar', el('i')), el('b'));
    top.append(phases, goal);

    const ticker = el('div', 'm-ticker panel dark');
    const left = el('div', 'm-left');
    const crowd = el('div', 'm-crowd', el('i'), el('div', 'marks'), el('div', 'peak'));
    const sym = el('div', 'm-sym');
    for (let i = 0; i < 10; i++) sym.append(el('span', {}, isFace ? '♥' : '♦'));
    sym.title = isFace ? 'Sympathy' : 'Heat';
    left.append(el('div', 'm-crowd-label', '0'), el('div', 'm-crowd-cap', 'Crowd'), crowd, el('div', 'm-crowd-cap', isFace ? 'Sympathy' : 'Heat'), sym);

    const call = el('div', 'm-call');
    const bottom = el('div', 'm-bottom');
    const energy = el('div', 'm-energy');
    const gas = el('div', 'm-gas', el('div', 'lbl', el('span', {}, 'Gas'), el('span', 'v')), el('div', 'bar', el('i')));
    const hand = el('div', 'm-hand');
    const side = el('div', 'm-side');
    const end = el('button', { class: 'btn primary m-end' }, 'End Turn');
    end.addEventListener('click', () => this.endTurn());
    side.append(end, el('div', 'm-piles'));
    bottom.append(energy, gas, hand, side);
    const inspect = el('div', 'm-inspect panel');
    const hint = el('div', 'm-hint panel');
    this.root.append(top, ticker, left, call, bottom, inspect, hint);
    uiRoot().append(this.root);
    this.ui = { phases, goal, ticker, crowd, sym, call, energy, gas, hand, end, piles: side.querySelector('.m-piles')!, inspect, hint, crowdLabel: left.querySelector('.m-crowd-label')! };
  }

  private renderUi(): void {
    const m = this.m;
    // Phases
    [...this.ui.phases.children].forEach((c, i) => {
      c.classList.toggle('now', i === m.phaseIndex && !m.over);
      c.classList.toggle('done', i < m.phaseIndex || m.over);
    });
    const gs = m.goalStatus;
    this.ui.goal.querySelector('.txt')!.textContent = gs.label;
    (this.ui.goal.querySelector('.bar i') as HTMLElement).style.width = `${(gs.target ? gs.value / gs.target : 0) * 100}%`;
    this.ui.goal.querySelector('b')!.textContent = m.phase.goal.kind === 'finish' ? '!' : `${gs.value}/${gs.target}`;
    this.ui.goal.classList.toggle('done', gs.done);
    // Crowd
    (this.ui.crowd.querySelector('i') as HTMLElement).style.height = `${m.crowd}%`;
    (this.ui.crowd.querySelector('.peak') as HTMLElement).style.bottom = `${m.peak}%`;
    this.ui.crowdLabel.textContent = String(Math.round(m.crowd));
    const symVal = this.opts.config.player.role === 'face' ? m.sympathy : Math.min(10, m.heat);
    [...this.ui.sym.children].forEach((c, i) => c.classList.toggle('on', i < symVal));
    // Energy & gas
    this.ui.energy.innerHTML = `${m.energy}<small>/${m.maxEnergy}</small>`;
    this.ui.energy.classList.toggle('empty', m.energy <= 0);
    (this.ui.gas.querySelector('.v') as HTMLElement).textContent = `${Math.max(0, Math.round(m.gas))}/${m.maxGas}`;
    (this.ui.gas.querySelector('.bar i') as HTMLElement).style.width = `${Math.max(0, (m.gas / m.maxGas) * 100)}%`;
    this.ui.gas.classList.toggle('low', m.gas <= 8);
    this.ui.piles.textContent = `Deck ${m.draw.length} · Discard ${m.discard.length}`;
    // Hint
    this.ui.hint.innerHTML = `<span class="label">${m.phase.name}</span>${markup(m.phase.hint)}`;
    // Hand
    this.renderHand();
    this.renderCall();
    const anyPlayable = m.hand.some((_, i) => m.canPlay(i).ok);
    this.ui.end.classList.toggle('pulse', !anyPlayable && !m.over && !this.busy);
    (this.ui.end as HTMLButtonElement).disabled = this.busy || m.over || !!m.pendingKickout;
  }

  private renderHand(): void {
    const m = this.m;
    const hand = this.ui.hand;
    hand.innerHTML = '';
    const n = m.hand.length;
    const overlap = n > 6 ? -10 : n > 4 ? -5 : -2;
    m.hand.forEach((c, i) => {
      const card = this.cardEl(c, i);
      card.style.margin = `0 calc(var(--u) * ${overlap / 2})`;
      const mid = (n - 1) / 2;
      const rot = (i - mid) * (n > 5 ? 3 : 4);
      const drop = Math.abs(i - mid) * Math.abs(i - mid) * 1.2;
      card.style.transform = `translateY(calc(var(--u) * ${drop})) rotate(${rot}deg)`;
      hand.append(card);
    });
  }

  private cardEl(c: HandCard, i: number | null): HTMLElement {
    const m = this.m;
    const [frame, deep, light] = TYPE_COLORS[c.type];
    const card = el('div', `card t-${c.type}`);
    card.style.setProperty('--frame', frame);
    card.style.setProperty('--deep', deep);
    card.style.setProperty('--light', light);
    card.append(el('div', 'cost', String(c.cost)));
    card.append(el('div', 'name', i === null ? c.name : c.displayName));
    const art = cardArt(c);
    const cv = document.createElement('canvas');
    cv.width = art.width;
    cv.height = art.height;
    cv.className = 'art';
    cv.getContext('2d')!.drawImage(art, 0, 0);
    card.append(cv, el('div', 'type', TYPE_LABEL[c.type]));
    if (i !== null) {
      const ok = m.canPlay(i).ok;
      if (!ok) card.classList.add('unplayable');
      const pv = m.preview(i);
      const pop = el('div', 'pop');
      if (c.type === 'sell') {
        pop.innerHTML = c.sellMult ? `×${c.sellMult}<small>SELL</small>` : `+${pv.pop}`;
        if (m.oppAttacking) pop.classList.add('up');
        else pop.classList.add('down');
      } else if (c.id === 'cover') pop.innerHTML = 'PIN!';
      else if (c.type === 'power' || c.type === 'setup') pop.innerHTML = c.pop ? `+${pv.pop}` : '—';
      else {
        pop.innerHTML = `+${pv.pop}`;
        if (pv.pop > c.pop * 1.05) pop.classList.add('up');
        else if (pv.pop < c.pop * 0.85) pop.classList.add('down');
      }
      card.append(pop);
      const tags = el('div', 'tags');
      for (const t of pv.tags.slice(0, 2)) {
        const bad = t === 'Not set up' || t === 'Breaks the story' || t === 'Repetitive' || t === 'Seen it';
        tags.append(el('span', bad ? 'bad' : '', t));
      }
      if (c.type === 'sell' && m.oppAttacking) tags.append(el('span', '', 'Sell it!'));
      card.append(tags);
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playCard(i, card);
      });
      card.addEventListener('pointerenter', () => this.inspect(c, i));
      card.addEventListener('pointerleave', () => this.inspect(null, -1));
      let holdTimer = 0;
      card.addEventListener('touchstart', () => {
        holdTimer = window.setTimeout(() => this.inspect(c, i), 260);
      });
      card.addEventListener('touchend', () => {
        clearTimeout(holdTimer);
        setTimeout(() => this.inspect(null, -1), 900);
      });
    } else {
      const pop = el('div', 'pop', c.type === 'sell' && c.sellMult ? `×${c.sellMult}` : c.pop ? `+${c.pop}` : '—');
      card.append(pop);
    }
    return card;
  }

  private inspect(c: HandCard | null, i: number): void {
    const box = this.ui.inspect;
    if (!c) {
      box.classList.remove('show');
      return;
    }
    const pv = this.m.preview(i);
    box.innerHTML = `<h3>${markup(c.displayName)}</h3><div class="tagline">${TYPE_LABEL[c.type]} · Cost ${c.cost} · Gas ${c.gas > 0 ? '-' + c.gas : '+' + -c.gas}</div><div>${markup(c.text)}</div>${pv.tags.length ? `<div class="tagline">${pv.tags.join(' · ')}</div>` : ''}`;
    box.classList.add('show');
  }

  /** Stage coordinates to CSS pixels, through the camera zoom. */
  private toCss(x: number, y: number): { x: number; y: number } {
    const z = this.zoom;
    const fx = this.zoomAt.x || this.stage.width / 2;
    const fy = this.zoomAt.y || this.stage.height / 2;
    const sx = (x - fx) * z + fx;
    const sy = (y - fy) * z + fy;
    const s = game.screen.cssPerNative;
    return { x: sx * s, y: sy * s };
  }

  private renderCall(): void {
    const call = this.m.call;
    const box = this.ui.call;
    if (!call || this.m.over) {
      box.style.display = 'none';
      return;
    }
    box.style.display = '';
    const chem = this.opts.config.opponent.chemistry + this.opts.config.player.ringIq;
    // Low chemistry makes calls worth less, never unreadable.
    const vague = false;
    void chem;
    const attack = call.kind !== 'setup';
    box.className = `m-call${vague ? ' vague' : ''}${attack ? ' attack' : ''}`;
    const kind = attack ? (call.kind === 'finisher' ? 'Finisher incoming' : call.kind === 'cover' ? 'Big move + cover' : 'Calling') : 'Setting you up';
    const favors = (call.favors ?? []).map((t) => `<span class="f" style="background:${TYPE_COLORS[t][0]}">${t === 'sell' ? 'Sell it' : TYPE_LABEL[t]}</span>`).join('');
    box.innerHTML = `<span class="k">${this.opts.config.opponent.name}: ${kind}</span><span class="n">${markup(call.name)}</span><span class="w">"${markup(call.whisper)}"</span>${favors}`;
    // Position over the opponent's head.
    const c = this.toCss(this.o.x, this.o.y - 70 - this.o.z);
    box.style.left = `${Math.min(window.innerWidth - 90, Math.max(90, c.x))}px`;
    box.style.top = `${Math.max(120, c.y)}px`;
  }

  private ticker(text: string, who = 'Gus'): void {
    this.ui.ticker.innerHTML = `<span class="who">${who}</span>${markup(text)}`;
    this.ui.ticker.classList.add('show');
    this.lastTicker = game.t;
  }

  // ------------------------------------------------------------ input

  private onKey(code: string): void {
    if (this.finished) return;
    if (this.m.pendingKickout) return;
    const n = this.m.hand.length;
    if (code.startsWith('Digit')) {
      const i = parseInt(code.slice(5), 10) - 1;
      if (i >= 0 && i < n) this.playCard(i, this.ui.hand.children[i] as HTMLElement);
    } else if (code === 'ArrowRight' || code === 'KeyD') {
      this.focusIdx = Math.min(n - 1, this.focusIdx + 1);
      this.paintFocus();
    } else if (code === 'ArrowLeft' || code === 'KeyA') {
      this.focusIdx = Math.max(0, this.focusIdx - 1);
      this.paintFocus();
    } else if (code === 'Space' || code === 'KeyE' || code === 'Enter') {
      if (this.focusIdx >= 0 && this.focusIdx < n) this.playCard(this.focusIdx, this.ui.hand.children[this.focusIdx] as HTMLElement);
      else this.endTurn();
    } else if (code === 'KeyQ' || code === 'Tab') {
      this.endTurn();
    }
  }

  private paintFocus(): void {
    [...this.ui.hand.children].forEach((c, i) => c.classList.toggle('focus', i === this.focusIdx));
    const c = this.m.hand[this.focusIdx];
    this.inspect(c ?? null, this.focusIdx);
  }

  private playCard(i: number, node?: HTMLElement): void {
    if (this.busy || this.m.over) return;
    if (!this.m.canPlay(i).ok) {
      audio.sfx('error');
      node?.animate([{ transform: node.style.transform + ' translateX(-4px)' }, { transform: node.style.transform + ' translateX(4px)' }, { transform: node.style.transform }], { duration: 160 });
      return;
    }
    audio.sfx('card-play');
    if (node) {
      const clone = node.cloneNode(true) as HTMLElement;
      const r = node.getBoundingClientRect();
      Object.assign(clone.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, margin: '0', transform: 'none', zIndex: '50', pointerEvents: 'none' });
      uiRoot().append(clone);
      clone.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${window.innerWidth / 2 - r.left - r.width / 2}px, ${-window.innerHeight * 0.32}px) scale(1.25)`, opacity: 0.9, offset: 0.55 },
          { transform: `translate(${window.innerWidth / 2 - r.left - r.width / 2}px, ${-window.innerHeight * 0.36}px) scale(0.6)`, opacity: 0 },
        ],
        { duration: 420, easing: 'ease-out' },
      ).onfinish = () => clone.remove();
    }
    this.inspect(null, -1);
    this.focusIdx = -1;
    this.m.playCard(i);
    this.processEvents();
    this.renderUi();
  }

  private endTurn(): void {
    if (this.busy || this.m.over || this.m.pendingKickout) return;
    audio.sfx('confirm');
    this.busy = true;
    this.inspect(null, -1);
    this.renderUi();
    this.m.endTurn();
    this.processEvents();
  }

  // ------------------------------------------------------------ events → animations

  private processEvents(): void {
    const events = this.m.takeEvents();
    for (const e of events) this.enqueueEvent(e);
    // After the queue drains, refresh UI / handle kickouts / results.
    this.queue.push({
      dur: 0.01,
      t: 0,
      end: () => {
        if (this.m.pendingKickout) void this.kickoutGame();
        else if (this.m.over) void this.showResults();
        else {
          this.busy = false;
          this.syncPositions();
          this.renderUi();
        }
      },
    });
  }

  private enqueueEvent(e: MatchEvent): void {
    switch (e.kind) {
      case 'whisper':
        this.queue.push({ dur: 0.01, t: 0, end: () => this.renderCall() });
        break;
      case 'phase':
        this.queue.push({
          dur: 0.9,
          t: 0,
          start: () => {
            void banner(e.text.toUpperCase(), 1100, 24);
            audio.sfx('phase');
            this.renderUi();
          },
          end: () => {
            const id = this.m.phase.id;
            if (this.opts.coach?.[id] && !this.coached.has(id)) {
              this.pauseQueue = true;
              void this.coachSay(id).then(() => (this.pauseQueue = false));
            }
          },
        });
        break;
      case 'info':
        this.queue.push({
          dur: 0.3,
          t: 0,
          start: () => {
            this.ticker(e.text, 'Story');
            audio.sfx('beat');
            this.fx.text('BEAT!', this.geo.cx, this.geo.matY - 96, '#7fe0a0', 1, 1.2);
          },
        });
        break;
      case 'chant':
        this.queue.push({
          dur: 0.2,
          t: 0,
          start: () => {
            this.crowd.chant = { text: e.text, t: 1.6 };
            audio.crowdReact('chant', 0.6);
          },
        });
        break;
      case 'play':
      case 'oppmove': {
        const attacker = e.actor === 'opponent' ? this.o : this.p;
        const target = e.actor === 'opponent' ? this.p : this.o;
        this.attackAnim(attacker, target, e.anim ?? 'strike', e, e.actor === 'opponent');
        break;
      }
      case 'botch':
        this.botchAnim(e);
        break;
      case 'cover':
        this.pinAnim(this.p, this.o, true, e);
        break;
      case 'kickout':
        this.queue.push({
          dur: 0.5,
          t: 0,
          start: () => {
            this.p.pose = 'stagger';
            this.o.pose = 'stagger';
            this.p.z = 8;
            this.refCount = '';
            this.popText(e);
            this.ticker(e.text);
            audio.sfx('kickout');
          },
          step: (k) => {
            this.p.z = Math.sin(k * Math.PI) * 12;
            this.o.x = lerp(this.o.x, this.p.x + 64, 0.15);
          },
        });
        break;
      case 'finish':
        this.finishAnim(e);
        break;
      default:
        break;
    }
  }

  private popText(e: MatchEvent): void {
    if (e.crowd === undefined) return;
    const strength = Math.min(1.2, (e.crowd ?? 0) / 18);
    if (e.crowd > 0) {
      this.fx.text(`+${e.crowd}`, this.geo.cx + (Math.random() - 0.5) * 60, this.geo.matY - 86, e.big ? '#f4b63f' : '#fff4dc', e.big ? 2 : 1);
      this.crowd.pop(strength);
      const heelMove = e.actor === 'opponent' && this.opts.config.opponent.role === 'heel';
      if (heelMove) this.crowd.heelHeat(strength * 0.8);
      audio.crowdReact(heelMove ? 'boo' : 'pop', strength);
    }
  }

  private dir(a: Body, b: Body): 1 | -1 {
    return b.x >= a.x ? 1 : -1;
  }

  private impact(x: number, y: number, power: number): void {
    this.shake = Math.max(this.shake, power * 4);
    this.ropeShake = Math.max(this.ropeShake, power);
    this.fx.burst(x, y, 6 + Math.round(power * 6), ['#fff4a0', '#ffffff', '#ffb070'], { kind: 'star', speed: 100 + power * 60, max: 0.35, gravity: 80 });
    // sweat
    this.fx.burst(x, y - 4, 4 + Math.round(power * 4), ['#dff6ff', '#ffffff', '#b8e8ff'], { kind: 'sweat', speed: 70 + power * 40, max: 0.5, gravity: 260, size: 1 });
    if (power >= 1) this.fx.burst(x, this.geo.matY, 10, ['#c8c0d8', '#a8a0b8'], { kind: 'dust', speed: 60, gravity: -20, max: 0.6, size: 2 });
  }

  private attackAnim(a: Body, b: Body, kind: string, e: MatchEvent, oppAttack: boolean): void {
    const big = !!e.big;
    const power = Math.min(2, (e.crowd ?? 6) / 10);
    const g = this.geo;
    let startAX = 0;
    let startBX = 0;
    const approach = (gap: number, dur = 0.24): Anim => ({
      dur,
      t: 0,
      start: () => {
        startAX = a.x;
        startBX = b.x;
        a.pose = 'walk';
        a.facing = this.dir(a, b) > 0 ? 'right' : 'left';
        b.facing = a.facing === 'right' ? 'left' : 'right';
        if (b.pose === 'down' && !['drop', 'hold', 'aerial', 'pin'].includes(kind)) b.pose = 'stagger';
        if (!oppAttack && e.card) this.ticker(`${e.card}! ${e.text}`);
        else if (oppAttack) this.ticker(e.text);
      },
      step: (k) => {
        const target = startBX - this.dir({ ...a, x: startAX }, b) * gap;
        a.x = lerp(startAX, target, ease(k));
        a.frame = Math.floor(k * 8);
      },
    });
    const windup = (pose: WPose, dur = 0.1): Anim => ({
      dur,
      t: 0,
      start: () => {
        a.pose = pose;
        a.frame = 0;
      },
    });
    const hit = (pose: WPose, dur = 0.16): Anim => ({
      dur,
      t: 0,
      start: () => {
        a.pose = pose;
        a.frame = 1;
        b.flash = 0.12;
        this.impact((a.x + b.x) / 2, b.y - 30 - b.z, power);
        this.popText(e);
        audio.sfx(power > 1.2 ? 'slam' : 'hit', { pitch: 0.9 + Math.random() * 0.2 });
      },
      step: (k) => {
        if (k > 0.55) a.frame = 2;
      },
    });
    const knock = (dist: number, fall: boolean, dur = 0.4): Anim => {
      let bx = 0;
      return {
        dur,
        t: 0,
        start: () => {
          bx = b.x;
          b.pose = fall ? 'down' : 'stagger';
          a.frame = 2;
        },
        step: (k) => {
          b.x = lerp(bx, bx + this.dir(a, b) * dist, ease(k));
          b.z = fall ? Math.sin(k * Math.PI) * 8 * (1 - k) : 0;
        },
        end: () => {
          a.pose = 'idle';
        },
      };
    };
    const lift = (height: number, dur = 0.35): Anim => {
      let bx = 0;
      return {
        dur,
        t: 0,
        start: () => {
          a.pose = 'lift';
          b.pose = 'lifted';
          bx = b.x;
          audio.sfx('whoosh');
        },
        step: (k) => {
          b.z = lerp(0, height, ease(k));
          b.x = lerp(bx, a.x + this.dir(a, b) * 6, ease(k));
        },
      };
    };
    const drop = (overHead: boolean, dur = 0.16): Anim => {
      let bx = 0;
      let bz = 0;
      return {
        dur,
        t: 0,
        start: () => {
          bx = b.x;
          bz = b.z;
        },
        step: (k) => {
          b.z = lerp(bz, 0, easeIn(k));
          if (overHead) b.x = lerp(bx, a.x - this.dir(a, { ...b, x: bx }) * 30, k);
        },
        end: () => {
          b.pose = 'down';
          b.flash = 0.15;
          a.pose = overHead ? 'down' : 'idle';
          this.impact(b.x, b.y - 4, Math.max(1, power));
          this.popText(e);
          audio.sfx('slam');
          if (big) this.flashWhite = 0.15;
        },
      };
    };
    const getUp = (who: Body, dur = 0.35): Anim => ({
      dur,
      t: 0,
      end: () => {
        if (who.pose === 'down') who.pose = 'idle';
      },
    });
    const pause = (dur: number): Anim => ({ dur, t: 0 });

    switch (kind) {
      case 'strike':
        this.queue.push(approach(30), windup('strike'), hit('strike'), knock(20, !!e.big && power > 1.1));
        break;
      case 'kick':
        this.queue.push(approach(36), windup('kick', 0.12), hit('kick'), knock(28, true), pause(0.1));
        break;
      case 'grapple':
        this.queue.push(approach(26), { dur: 0.45, t: 0, start: () => { a.pose = 'grapple'; b.pose = 'grapple'; this.popText(e); audio.sfx('grab'); }, step: (k) => { a.jitter = Math.sin(k * 30) * 1; b.jitter = -a.jitter; } }, { dur: 0.1, t: 0, end: () => { a.jitter = 0; b.jitter = 0; a.pose = 'idle'; b.pose = 'idle'; } });
        break;
      case 'slam':
      case 'bomb':
        this.queue.push(approach(18), { dur: 0.15, t: 0, start: () => { a.pose = 'grapple'; b.pose = 'grapple'; audio.sfx('grab'); } }, lift(kind === 'bomb' ? 40 : 28), pause(kind === 'bomb' ? 0.15 : 0.05), drop(false), pause(0.15));
        break;
      case 'lift':
        this.queue.push(approach(14), lift(52, 0.5), { dur: 0.35, t: 0, step: (k) => { b.z = 52 + Math.sin(k * 12) * 3; } }, drop(false, 0.2), pause(0.2));
        break;
      case 'suplex':
        this.queue.push(approach(18), { dur: 0.15, t: 0, start: () => { a.pose = 'grapple'; b.pose = 'grapple'; audio.sfx('grab'); } }, lift(36, 0.28), drop(true, 0.2), getUp(a, 0.35));
        break;
      case 'spin': {
        let ang = 0;
        this.queue.push(approach(14), {
          dur: 1.4,
          t: 0,
          start: () => {
            a.pose = 'grapple';
            b.pose = 'lifted';
          },
          step: (k, dt) => {
            ang += dt * (6 + k * 10);
            b.x = a.x + Math.cos(ang) * 34;
            b.z = 10 + Math.sin(ang) * 4;
            b.facing = Math.cos(ang) > 0 ? 'right' : 'left';
            if (Math.floor(ang / (Math.PI * 2)) !== Math.floor((ang - dt * 16) / (Math.PI * 2))) this.crowd.pop(0.2);
          },
        }, drop(false, 0.15), pause(0.2));
        break;
      }
      case 'climb':
        this.queue.push({
          dur: 0.55,
          t: 0,
          start: () => {
            a.pose = 'climb';
            startAX = a.x;
          },
          step: (k) => {
            const post = a.x < g.cx ? g.postLX + 6 : g.postRX - 6;
            a.x = lerp(startAX, post, ease(Math.min(1, k * 1.6)));
            a.z = k > 0.3 ? lerp(0, g.matY - g.postTopY - 2, ease((k - 0.3) / 0.7)) : 0;
            a.facing = a.x < g.cx ? 'left' : 'right';
          },
          end: () => {
            a.pose = 'perch';
            a.facing = a.x < g.cx ? 'right' : 'left';
            this.popText(e);
            this.ticker(`${e.card ?? 'Up top'}! ${e.text}`);
          },
        });
        break;
      case 'aerial': {
        let sx = 0;
        let sz = 0;
        this.queue.push({
          dur: a.z > 0 ? 0.1 : 0.35,
          t: 0,
          start: () => {
            sx = a.x;
            if (a.z <= 0) {
              a.pose = 'walk';
            }
            if (!oppAttack && e.card) this.ticker(`${e.card}! ${e.text}`);
          },
          step: (k) => {
            if (a.z <= 0) {
              // Run to the ropes for a springboard.
              const ropes = a.x < b.x ? g.cx - g.half + 20 : g.cx + g.half - 20;
              a.x = lerp(sx, ropes, ease(k));
            }
          },
        }, {
          dur: 0.5,
          t: 0,
          start: () => {
            sx = a.x;
            sz = Math.max(a.z, 20);
            a.pose = 'aerial';
            a.facing = b.x > sx ? 'right' : 'left';
            audio.sfx('whoosh');
            if (big) {
              this.zoomTarget = 1.4;
              this.zoomAt = { x: b.x, y: b.y - 20 };
              this.slowmo = 0.55;
            }
          },
          step: (k) => {
            a.x = lerp(sx, b.x, k);
            a.z = lerp(sz, 2, k) + Math.sin(k * Math.PI) * 40;
          },
          end: () => {
            a.z = 0;
            this.slowmo = 1;
            this.zoomTarget = 1;
            b.pose = 'down';
            a.pose = 'down';
            this.impact(b.x, b.y - 8, Math.max(1.2, power));
            this.popText(e);
            audio.sfx('slam');
            this.flashWhite = big ? 0.2 : 0;
          },
        }, pause(0.25), getUp(a, 0.3));
        break;
      }
      case 'dive':
        this.queue.push({
          dur: 0.6,
          t: 0,
          start: () => {
            startAX = a.x;
            a.pose = 'aerial';
            b.pose = 'stagger';
            audio.sfx('whoosh');
            this.ticker(`${e.card ?? 'A dive'}! ${e.text}`);
          },
          step: (k) => {
            const side = b.x > g.cx ? 1 : -1;
            const outsideX = g.cx + side * (g.half + 30);
            b.x = lerp(b.x, outsideX, 0.2);
            b.y = lerp(b.y, g.frontY + 40, 0.2);
            a.x = lerp(startAX, outsideX - side * 4, k);
            a.y = lerp(g.matY, g.frontY + 40, k);
            a.z = Math.sin(k * Math.PI) * 30;
            a.facing = side > 0 ? 'right' : 'left';
          },
          end: () => {
            a.pose = 'down';
            b.pose = 'down';
            this.impact(b.x, b.y - 8, 1.5);
            this.popText(e);
            audio.sfx('slam');
          },
        }, pause(0.5), {
          dur: 0.5,
          t: 0,
          start: () => {
            a.pose = 'walk';
            b.pose = 'walk';
          },
          step: (k) => {
            a.y = lerp(a.y, g.matY, k);
            b.y = lerp(b.y, g.matY, k);
            a.x = lerp(a.x, g.cx - 60, k * 0.3);
            b.x = lerp(b.x, g.cx + 60, k * 0.3);
          },
          end: () => {
            a.pose = 'idle';
            b.pose = 'stagger';
          },
        });
        break;
      case 'drop':
        this.queue.push(approach(10), {
          dur: 0.32,
          t: 0,
          start: () => {
            a.pose = 'aerial';
            b.pose = 'down';
          },
          step: (k) => {
            a.z = Math.sin(k * Math.PI) * 22;
            a.x = lerp(a.x, b.x, 0.2);
          },
          end: () => {
            a.z = 0;
            a.pose = 'down';
            this.impact(b.x, b.y - 4, power);
            this.popText(e);
            audio.sfx('hit');
          },
        }, getUp(a, 0.3));
        break;
      case 'hold':
        this.queue.push(approach(16), {
          dur: 0.9,
          t: 0,
          start: () => {
            a.pose = 'hold';
            b.pose = 'held';
            b.x = a.x + this.dir(a, b) * 18;
            this.popText(e);
            audio.sfx('grab');
            if (oppAttack) this.ticker(e.text);
          },
          step: (k) => {
            b.jitter = Math.sin(k * 40) * 0.8;
          },
          end: () => {
            b.jitter = 0;
            a.pose = 'idle';
            b.pose = 'down';
          },
        });
        break;
      case 'taunt':
      case 'fireup':
        this.queue.push({
          dur: kind === 'fireup' ? 1.1 : 0.6,
          t: 0,
          start: () => {
            a.pose = kind === 'fireup' ? 'fireup' : 'taunt';
            a.facing = a.x < g.cx ? 'right' : 'left';
            this.popText(e);
            this.ticker(`${e.card ?? ''} ${e.text}`);
            if (kind === 'fireup') {
              audio.sfx('fireup');
              this.crowd.pop(1.4);
              this.zoomTarget = 1.3;
              this.zoomAt = { x: a.x, y: a.y - 30 };
            } else audio.sfx('taunt');
          },
          step: (k) => {
            a.jitter = kind === 'fireup' ? Math.sin(k * 60) * (1 - k) * 1.5 : 0;
            if (kind === 'fireup' && Math.random() < 0.6) this.fx.burst(a.x + (Math.random() - 0.5) * 20, a.y - 10 - Math.random() * 30, 1, ['#f4b63f', '#ff7a3c', '#fff4a0'], { kind: 'spark', speed: 50, gravity: -140, max: 0.6 });
          },
          end: () => {
            a.jitter = 0;
            a.pose = 'idle';
            this.zoomTarget = 1;
          },
        });
        break;
      case 'sell':
        this.queue.push({
          dur: 0.5,
          t: 0,
          start: () => {
            a.pose = 'sell';
            this.ticker(`${e.card ?? 'Selling'}: ${e.text}`);
          },
          end: () => {
            a.pose = 'idle';
          },
        });
        break;
      case 'pin':
        this.queue.push(approach(10), { dur: 0.4, t: 0, start: () => { a.pose = 'pin'; b.pose = 'pinned'; this.popText(e); } }, getUp(a, 0.2));
        break;
      case 'finisher':
        this.queue.push(
          approach(18, 0.3),
          {
            dur: 0.6,
            t: 0,
            start: () => {
              this.zoomTarget = 1.6;
              this.zoomAt = { x: (a.x + b.x) / 2, y: a.y - 34 };
              this.slowmo = 0.5;
              a.pose = 'grapple';
              b.pose = 'grapple';
              audio.sfx('finisher-wind');
              this.ticker(`${e.card ?? 'The finisher'}! ${e.text}`);
            },
          },
          lift(48, 0.4),
          drop(false, 0.18),
          { dur: 0.4, t: 0, start: () => { this.slowmo = 1; this.zoomTarget = 1.15; this.flashWhite = 0.35; this.crowd.pop(1.5); this.flare = 0.7; this.flareAt = { x: b.x, y: b.y - 10 }; } },
        );
        break;
      default:
        this.queue.push(approach(26), windup('strike'), hit('strike'), knock(16, false));
    }
  }

  private botchAnim(e: MatchEvent): void {
    this.queue.push({
      dur: 0.7,
      t: 0,
      start: () => {
        this.p.pose = 'stagger';
        this.ticker(e.text, 'Uh oh');
        audio.sfx('botch');
        audio.crowdReact('gasp', 0.5);
        this.fx.text('?!', this.p.x, this.p.y - 72, '#ff9ec0', 2);
      },
      step: (k) => {
        this.p.jitter = Math.sin(k * 20) * 1.5;
        this.p.z = k > 0.5 ? 0 : Math.sin(k * 2 * Math.PI) * 6;
      },
      end: () => {
        this.p.jitter = 0;
        this.p.pose = 'down';
      },
    }, { dur: 0.4, t: 0, end: () => (this.p.pose = 'idle') });
  }

  private countAnim(n: number, dur: number, onStart?: () => void): Anim {
    return {
      dur,
      t: 0,
      start: () => {
        this.refCount = String(n);
        this.ref.pose = 'count';
        this.ref.frame = 0;
        audio.sfx(n === 3 ? 'bell' : 'count');
        audio.crowdReact('count', 0.5 + n * 0.15);
        onStart?.();
      },
      step: (k) => {
        this.ref.frame = k > 0.45 ? 1 : 0;
        if (k > 0.45 && this.ref.frame === 1 && this.ref.jitter === 0) {
          this.ref.jitter = 0.001;
          this.fx.burst(this.ref.x + (this.ref.facing === 'right' ? 10 : -10), this.ref.y - 2, 4, ['#e8e0f0', '#c8c0d8'], { kind: 'dust', speed: 30, gravity: -10, max: 0.3 });
        }
      },
      end: () => {
        this.ref.jitter = 0;
        this.ref.pose = 'idle';
      },
    };
  }

  private pinAnim(a: Body, b: Body, kickout: boolean, e: MatchEvent): void {
    let rx = 0;
    this.queue.push(
      {
        dur: 0.3,
        t: 0,
        start: () => {
          a.pose = 'pin';
          b.pose = 'pinned';
          a.x = b.x + this.dir(b, a) * 6;
          rx = this.ref.x;
          this.ticker(e.text);
          audio.sfx('slam');
        },
        step: (k) => {
          this.ref.x = lerp(rx, b.x + 34, ease(k));
          this.ref.y = lerp(this.geo.backY + 8, b.y - 3, ease(k));
          this.ref.facing = 'left';
          this.ref.pose = 'walk';
          this.ref.frame = Math.floor(k * 6);
        },
      },
      ...[1, 2].map((n) => this.countAnim(n, 0.45)),
      {
        dur: 0.4,
        t: 0,
        start: () => {
          if (kickout) {
            this.refCount = '';
            b.pose = 'stagger';
            a.pose = 'down';
            this.popText(e);
            audio.sfx('kickout');
            this.fx.text('KICK OUT!', b.x, b.y - 80, '#ff9ec0', 1);
          }
        },
        end: () => {
          a.pose = 'idle';
          this.ref.pose = 'idle';
          this.ref.y = this.geo.backY + 8;
        },
      },
    );
  }

  private finishAnim(e: MatchEvent): void {
    const winner = e.actor === 'player' ? this.p : this.o;
    const loser = e.actor === 'player' ? this.o : this.p;
    this.queue.push(
      {
        dur: 0.3,
        t: 0,
        start: () => {
          winner.pose = 'pin';
          loser.pose = 'pinned';
          winner.x = loser.x + (winner.facing === 'right' ? -4 : 4);
          this.ref.x = loser.x + 34;
          this.ref.y = loser.y - 3;
          this.ref.facing = 'left';
          this.zoomTarget = 1.25;
          this.zoomAt = { x: loser.x, y: loser.y - 16 };
        },
      },
      ...[1, 2, 3].map((n) =>
        this.countAnim(n, n === 3 ? 0.6 : 0.5, () => {
          if (n === 3) {
            this.crowd.pop(1.6);
            this.flashWhite = 0.3;
            this.fx.confetti(this.stage.width, 140);
            this.ticker(e.text);
            this.firePyro();
          }
        }),
      ),
      {
        dur: 1.6,
        t: 0,
        start: () => {
          this.refCount = '';
          winner.pose = 'celebrate';
          loser.pose = 'down';
          this.ref.pose = 'idle';
          this.zoomTarget = 1;
          audio.music(e.actor === 'player' ? 'victory' : 'match-end');
        },
        step: (k) => {
          winner.z = Math.abs(Math.sin(k * Math.PI * 3)) * 8;
          if (Math.random() < 0.15) this.fx.confetti(this.stage.width, 2);
        },
        end: () => {
          winner.z = 0;
        },
      },
    );
  }

  private firePyro(): void {
    const g = this.geo;
    for (const x of [g.postLX, g.postRX, g.cx - g.backHalf, g.cx + g.backHalf]) {
      this.pyro.push({ x, y: g.postTopY - 4, t: 0.9 });
      this.fx.burst(x, g.postTopY - 4, 18, ['#fff4a0', '#ffd36b', '#ff7a3c', '#ffffff'], { kind: 'spark', speed: 120, gravity: 220, max: 0.9, size: 1 });
    }
  }

  /** Tween bodies to match the engine's positional state. */
  private syncPositions(): void {
    const m = this.m;
    const g = this.geo;
    const o = this.o;
    const p = this.p;
    if (m.over) return;
    if (m.oppPos === 'down') o.pose = 'down';
    else if (m.oppPos === 'groggy') o.pose = 'stagger';
    else if (o.pose === 'down' || o.pose === 'stagger' || o.pose === 'held' || o.pose === 'pinned' || o.pose === 'lifted') o.pose = 'idle';
    if (p.pose === 'down' || p.pose === 'pin' || p.pose === 'lifted' || p.pose === 'pinned' || p.pose === 'held') p.pose = 'idle';
    let ox = o.x;
    if (m.oppPos === 'cornered') ox = o.x >= g.cx ? g.postRX - 22 : g.postLX + 22;
    else if (Math.abs(o.x - p.x) < 44) ox = p.x + (o.x >= p.x ? 56 : -56);
    ox = Math.max(g.cx - g.half + 16, Math.min(g.cx + g.half - 16, ox));
    let px = p.x;
    px = Math.max(g.cx - g.half + 16, Math.min(g.cx + g.half - 16, px));
    if (m.selfPos === 'top') {
      p.pose = 'perch';
    } else if (p.z > 0 && p.pose !== 'perch') p.z = 0;
    if (m.selfPos !== 'top' && p.pose === 'perch') {
      p.pose = 'idle';
      p.z = 0;
    }
    const sx = o.x;
    const spx = p.x;
    const sy = o.y;
    const spy = p.y;
    this.queue.push({
      dur: 0.25,
      t: 0,
      step: (k) => {
        o.x = lerp(sx, ox, ease(k));
        p.x = lerp(spx, px, ease(k));
        o.y = lerp(sy, g.matY, ease(k));
        p.y = lerp(spy, g.matY, ease(k));
      },
      end: () => {
        p.facing = p.x < o.x ? 'right' : 'left';
        o.facing = p.x < o.x ? 'left' : 'right';
      },
    });
  }

  // ------------------------------------------------------------ kickout & results

  private async kickoutGame(): Promise<void> {
    // Pin animation first.
    const ko = this.m.pendingKickout!;
    this.pinAnim(this.o, this.p, false, { kind: 'cover', text: `${this.opts.config.opponent.name} covers!` });
    await this.waitQueue();
    await this.coachSay('kickout');
    if (G.settings.autoKickout) {
      this.m.resolveKickout(0.9);
      this.processEvents();
      return;
    }
    const box = el('div', 'm-kick panel');
    box.innerHTML = `<h2>THE COVER!</h2><div class="count">1</div><div class="kbar"><div class="zone"></div><i></i></div><div class="tap">TAP / SPACE TO KICK OUT. Wait for it...</div>`;
    uiRoot().append(box);
    const countEl = box.querySelector('.count') as HTMLElement;
    const bar = box.querySelector('.kbar i') as HTMLElement;
    const start = performance.now();
    const dur = 2300 - Math.min(600, ko.pop * 10);
    let resolved = false;
    await new Promise<void>((resolve) => {
      const finish = (t: number | null) => {
        if (resolved) return;
        resolved = true;
        off();
        box.removeEventListener('pointerdown', tap);
        if (t !== null && t >= 0.9) {
          countEl.textContent = '2.9!!';
          this.flashWhite = 0.2;
        } else countEl.textContent = t === null ? 'ROPES!' : 'KICK!';
        setTimeout(() => {
          box.remove();
          this.m.resolveKickout(t);
          this.processEvents();
          resolve();
        }, 450);
      };
      const tap = (e: Event) => {
        e.preventDefault();
        finish(Math.min(0.995, (performance.now() - start) / dur));
      };
      box.addEventListener('pointerdown', tap);
      const off = game.input.onKey((_k, code) => {
        if (code === 'Space' || code === 'KeyE' || code === 'Enter') finish(Math.min(0.995, (performance.now() - start) / dur));
      });
      const tick = () => {
        if (resolved) return;
        const k = (performance.now() - start) / dur;
        bar.style.width = `${Math.min(100, k * 100)}%`;
        const n = k < 0.45 ? '1' : k < 0.9 ? '2' : '2...';
        if (countEl.textContent !== n) {
          countEl.textContent = n;
          this.refCount = n.replace('...', '');
          this.ref.pose = 'count';
          this.ref.frame = 1;
          audio.sfx('count');
        }
        if (k >= 1) finish(null);
        else nextFrame(tick);
      };
      nextFrame(tick);
    });
    this.ref.pose = 'idle';
  }

  private waitQueue(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => (this.queue.length === 0 && !this.cur ? resolve() : setTimeout(check, 50));
      check();
    });
  }

  private async showResults(): Promise<void> {
    if (this.finished) return;
    this.finished = true;
    this.root.classList.add('over');
    await sleep(400);
    const r = this.m.result!;
    this.ui.call.style.display = 'none';
    const overlay = el('div', 'overlay');
    const box = el('div', 'modal panel m-results');
    const full = Math.floor(r.stars);
    const half = r.stars - full >= 0.5;
    const starsEl = el('div', 'stars');
    for (let i = 0; i < 5; i++) starsEl.append(el('span', {}, '★'));
    const playerWon = r.winner === 'player';
    const headline = playerWon ? `${this.opts.config.player.name} wins!` : `${this.opts.config.opponent.name} wins. You made them look like a million bucks.`;
    box.append(el('h2', {}, `${r.stars.toFixed(2).replace(/0$/, '').replace(/\.0$/, '')} Star Match`), starsEl, el('div', 'headline', headline));
    const curve = this.curveCanvas(r.crowdCurve);
    box.append(curve);
    const rows = el('div', 'rows');
    for (const b of r.breakdown) {
      const bar = el('div', 'bar', el('i'));
      rows.append(el('span', {}, b.label), bar, el('span', 'note', b.note));
    }
    box.append(rows);
    for (const h of r.highlights) box.append(el('div', 'hl', `"${h}"`));
    const actions = el('div', 'actions');
    const cont = el('button', { class: 'btn primary' }, 'Continue');
    actions.append(cont);
    box.append(actions);
    overlay.append(box);
    uiRoot().append(overlay);
    audio.sfx('results');
    // Animate stars and bars.
    for (let i = 0; i < 5; i++) {
      await sleep(260);
      const s = starsEl.children[i] as HTMLElement;
      if (i < full) {
        s.classList.add('on');
        audio.sfx('star', { pitch: 1 + i * 0.12 });
      } else if (i === full && half) {
        s.classList.add('half');
        audio.sfx('star', { pitch: 1 + i * 0.12 });
      }
    }
    [...rows.querySelectorAll('.bar i')].forEach((b, i) => setTimeout(() => ((b as HTMLElement).style.width = `${r.breakdown[i].value * 100}%`), 100 + i * 120));
    await new Promise<void>((resolve) => {
      cont.addEventListener('click', () => resolve(), { once: true });
      const off = game.input.onKey((_k, code) => {
        if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
          off();
          resolve();
        }
      });
    });
    let reward: string | null = null;
    if (this.opts.rewardChoices?.length) {
      box.innerHTML = '';
      reward = await this.pickReward(box, this.opts.rewardChoices);
    }
    overlay.remove();
    this.opts.onDone(r, reward);
  }

  private pickReward(box: HTMLElement, choices: string[]): Promise<string | null> {
    return new Promise((resolve) => {
      box.append(el('h2', {}, 'You learned something out there'), el('div', 'm-reward-desc', 'Pick a move to add to your deck, or skip.'));
      const row = el('div', 'm-reward-cards');
      const desc = el('div', 'm-reward-desc');
      for (const entry of choices) {
        const d = cardDef(entry);
        const hc = { ...d, uid: 0, displayName: d.name } as HandCard;
        const card = this.cardEl(hc, null);
        card.addEventListener('pointerenter', () => (desc.innerHTML = `<b>${markup(d.name)}</b>: ${markup(d.text)}`));
        card.addEventListener('click', () => {
          audio.sfx('confirm');
          resolve(entry);
        });
        row.append(card);
      }
      const skip = el('button', { class: 'btn small' }, 'Skip');
      skip.addEventListener('click', () => resolve(null));
      box.append(row, desc, el('div', 'actions', skip));
      desc.innerHTML = 'Tap a card to learn it.';
    });
  }

  private curveCanvas(curve: number[]): HTMLCanvasElement {
    const W = 120;
    const H = 24;
    const c = makeCanvas(W, H);
    c.className = 'curve';
    const x = ctx2d(c);
    x.fillStyle = '#efe0c0';
    x.fillRect(0, 0, W, H);
    const n = Math.max(2, curve.length);
    let prev: [number, number] | null = null;
    curve.forEach((v, i) => {
      const px = Math.round((i / (n - 1)) * (W - 4)) + 2;
      const py = Math.round(H - 2 - (v / 100) * (H - 4));
      x.fillStyle = v > 60 ? '#d8434b' : v > 35 ? '#f4b63f' : '#3f74d8';
      x.fillRect(px - 1, py, 3, H - py);
      if (prev) {
        x.fillStyle = '#1e1426';
        const steps = Math.max(Math.abs(px - prev[0]), Math.abs(py - prev[1]));
        for (let s = 0; s <= steps; s++) x.fillRect(Math.round(prev[0] + ((px - prev[0]) * s) / steps), Math.round(prev[1] + ((py - prev[1]) * s) / steps), 1, 1);
      }
      prev = [px, py];
    });
    return c;
  }

  // ------------------------------------------------------------ frame

  update(dt: number): void {
    this.resizeStage();
    const sdt = dt * this.slowmo;
    // Animation queue.
    let budget = this.pauseQueue ? 0 : sdt;
    while (budget > 0) {
      if (!this.cur) {
        this.cur = this.queue.shift() ?? null;
        if (!this.cur) break;
        this.cur.start?.();
      }
      const a = this.cur;
      const used = Math.min(budget, a.dur - a.t);
      a.t += used;
      budget -= used;
      a.step?.(Math.min(1, a.t / a.dur), used);
      if (a.t >= a.dur) {
        a.end?.();
        this.cur = null;
      } else break;
    }
    this.crowd.update(dt, Math.min(1, this.m.crowd / 100 + (this.m.over ? 0.3 : 0)));
    audio.crowd(0.2 + this.m.crowd / 130);
    audio.intensity(Math.min(1, this.m.crowd / 90));
    this.fx.update(sdt);
    this.shake = Math.max(0, this.shake - dt * 14);
    this.ropeShake = Math.max(0, this.ropeShake - dt * 3);
    this.flashWhite = Math.max(0, this.flashWhite - dt);
    this.flare = Math.max(0, this.flare - dt);
    this.zoom += (this.zoomTarget - this.zoom) * Math.min(1, dt * 6);
    for (const b of [this.p, this.o]) {
      b.flash = Math.max(0, b.flash - dt);
      if (b.pose === 'walk') b.frame = Math.floor(game.t * 10);
    }
    // Dust drifting in the beams.
    const w = this.stage.width;
    const h = this.geo.frontY;
    for (const d of this.dust) {
      d.x += (d.vx + Math.sin(game.t + d.y * 0.1) * 1.5) * dt;
      d.y += d.vy * dt;
      if (d.y > h || d.x < 0 || d.x > w) {
        d.y = Math.random() * 10;
        d.x = Math.random() * w;
      }
    }
    for (const p of this.pyro) p.t -= dt;
    this.pyro = this.pyro.filter((p) => p.t > 0);
    const wm = this.warm.shift();
    if (wm) wrestlerSprite(wm.look, wm);
    if (game.t - this.lastTicker > 3.2) this.ui.ticker?.classList.remove('show');
    // Keep the call bubble glued to the opponent.
    if (this.ui.call && this.ui.call.style.display !== 'none') {
      const c = this.toCss(this.o.x, this.o.y - 72 - this.o.z);
      this.ui.call.style.left = `${Math.min(window.innerWidth - 100, Math.max(100, c.x))}px`;
      this.ui.call.style.top = `${Math.max(130, c.y)}px`;
    }
  }

  private frameOf(b: Body): number {
    const rate = TIMED[b.pose];
    if (rate === undefined) return b.frame;
    return Math.floor((game.t + b.seed * 10) * rate) % poseFrames(b.pose);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const t0 = performance.now();
    const s = this.sctx;
    const w = this.stage.width;
    const h = this.stage.height;
    s.setTransform(1, 0, 0, 1, 0, 0);
    s.clearRect(0, 0, w, h);
    const drama = this.m.phase?.id === 'finish' || this.m.over ? 1 : this.m.phase?.id === 'stretch' ? 0.6 : 0.2;
    const venue = this.opts.config.venue;
    const arenaOpts = { venue, t: game.t, crowd: this.crowd, drama };
    const g = drawArenaBack(s, w, h, arenaOpts);
    // Ref, then wrestlers sorted by y (the pinner draws over the pinned).
    const bodies = [this.ref, this.o, this.p].sort((a, b) => a.y + (a.pose === 'pin' ? 1 : 0) - (b.y + (b.pose === 'pin' ? 1 : 0)));
    for (const b of bodies) {
      // Soft shadow on the mat (shrinks when airborne).
      const lying = b.pose === 'down' || b.pose === 'pinned' || b.pose === 'pin' || b.pose === 'held' || b.pose === 'lifted' || b.pose === 'aerial';
      const sw = (lying ? 44 : 22) * Math.max(0.5, 1 - b.z / 80);
      s.globalAlpha = 0.3 * Math.max(0.3, 1 - b.z / 60);
      s.fillStyle = '#1e1426';
      s.beginPath();
      s.ellipse(Math.round(b.x), Math.round(b.y) + 1, sw / 2, 3, 0, 0, Math.PI * 2);
      s.fill();
      s.globalAlpha = 1;
      drawWrestler(s, b.look, b.x + b.jitter, b.y - b.z, { facing: b.facing, pose: b.pose, frame: this.frameOf(b), flash: b.flash > 0 });
    }
    drawRopesFront(s, g, game.t, this.ropeShake, w, h, venue, this.crowd);
    this.fx.render(s);
    // pyro flashes on the posts
    if (this.pyro.length) {
      s.save();
      s.globalCompositeOperation = 'lighter';
      for (const p of this.pyro) {
        s.globalAlpha = Math.min(1, p.t * 2);
        s.drawImage(glowSprite(28, '#ffd36b'), Math.round(p.x) - 28, Math.round(p.y) - 28);
        s.drawImage(glowSprite(10, '#ffffff'), Math.round(p.x) - 10, Math.round(p.y) - 10);
      }
      s.restore();
    }
    if (this.refCount) {
      const tx = this.ref.x;
      const ty = this.ref.y - 76;
      drawCount(s, this.refCount, tx, ty);
    }
    if (this.crowd.chant) {
      const ch = this.crowd.chant;
      const alpha = Math.min(1, ch.t * 2);
      s.globalAlpha = alpha;
      const bounce = Math.sin(game.t * 10) * 1.5;
      this.drawChant(s, ch.text, w / 2, 24 + bounce);
      s.globalAlpha = 1;
    }
    drawLights(s, w, h, g, arenaOpts, this.dust);
    if (this.flare > 0) {
      s.save();
      s.globalCompositeOperation = 'lighter';
      s.globalAlpha = Math.min(1, this.flare * 1.6);
      const f = flareSprite();
      s.drawImage(f, Math.round(this.flareAt.x) - f.width / 2, Math.round(this.flareAt.y) - f.height / 2);
      s.drawImage(glowSprite(40, '#fff6e0'), Math.round(this.flareAt.x) - 40, Math.round(this.flareAt.y) - 40);
      s.restore();
    }
    if (this.flashWhite > 0) {
      s.globalAlpha = Math.min(0.8, this.flashWhite * 3);
      s.fillStyle = '#fffaf0';
      s.fillRect(0, 0, w, h);
      s.globalAlpha = 1;
    }
    if (this.sheet) this.drawSheet(s, w, h);
    // Compose to the native buffer with camera shake and zoom.
    const sx = (Math.random() - 0.5) * this.shake;
    const sy = (Math.random() - 0.5) * this.shake;
    ctx.fillStyle = '#0b0712';
    ctx.fillRect(0, 0, game.screen.w, game.screen.h);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const z = this.zoom;
    const fx = this.zoomAt.x || w / 2;
    const fy = this.zoomAt.y || h / 2;
    ctx.translate(Math.round(sx), Math.round(sy));
    if (Math.abs(z - 1) > 0.01) {
      ctx.translate(fx, fy);
      ctx.scale(z, z);
      ctx.translate(-fx, -fy);
    }
    ctx.drawImage(this.stage, 0, 0);
    ctx.restore();
    this.frameMs = this.frameMs * 0.9 + (performance.now() - t0) * 0.1;
    if (game.debug) pixelTextOutlined(ctx, `${this.frameMs.toFixed(2)}MS`, 2, game.screen.h - 8, '#fff4dc', '#1e1426', 1);
  }

  /** Dev overlay: poses of both wrestlers and the referee (#match?sheet=SCALE&poses=a,b,c&who=0|1|2). */
  private drawSheet(s: CanvasRenderingContext2D, w: number, h: number): void {
    s.fillStyle = 'rgba(20,10,30,0.92)';
    s.fillRect(0, 0, w, h);
    const q = new URLSearchParams(location.hash.split('?')[1] ?? '');
    const scale = Math.max(1, Number(q.get('sheet')) || 1);
    const all: WPose[] = ['idle', 'walk', 'strike', 'kick', 'grapple', 'lift', 'lifted', 'down', 'stagger', 'taunt', 'climb', 'perch', 'aerial', 'hold', 'held', 'pin', 'pinned', 'sell', 'celebrate', 'fireup', 'count'];
    const poses = (q.get('poses')?.split(',').filter((p) => all.includes(p as WPose)) as WPose[] | undefined) ?? all;
    const whoParam = q.get('who');
    const allLooks = [this.p.look, this.o.look, REF_LOOK];
    const looks = whoParam ? [allLooks[Number(whoParam)] ?? this.p.look] : allLooks;
    const cols = scale > 1 ? Math.max(1, Math.floor(w / (70 * scale))) : 11;
    const cellW = Math.floor(w / cols);
    const cellH = scale > 1 ? 80 * scale : 110;
    s.imageSmoothingEnabled = false;
    poses.forEach((pose, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      looks.forEach((lk, j) => {
        const fr = Math.floor((game.t + j) * (TIMED[pose] ?? 3)) % poseFrames(pose);
        if (looks.length > 1 && j === 2 && !['idle', 'walk', 'count'].includes(pose)) return;
        const facing = looks.length > 1 && j === 1 ? 'left' : 'right';
        if (scale === 1) {
          drawWrestler(s, lk, col * cellW + cellW / 2, 70 + row * cellH, { facing, pose, frame: fr });
          return;
        }
        const sp = wrestlerSprite(lk, { facing, pose, frame: fr });
        const x = col * cellW + Math.floor(cellW / 2) - sp.ax * scale + (j - (looks.length - 1) / 2) * 24 * scale;
        const y = 10 + row * cellH + (72 - sp.ay) * scale;
        s.drawImage(sp.canvas, Math.round(x), Math.round(y), sp.w * scale, sp.h * scale);
      });
      pixelText(s, pose.toUpperCase(), col * cellW + 2, (scale === 1 ? 74 : 12) + row * cellH, '#f4b63f');
    });
  }

  private drawChant(s: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    const wTxt = text.length * 4 + 6;
    s.fillStyle = '#1e1426';
    s.fillRect(Math.round(x - wTxt / 2) - 1, y - 2, wTxt + 2, 10);
    s.fillStyle = '#ff5d8f';
    s.fillRect(Math.round(x - wTxt / 2), y - 1, wTxt, 8);
    drawWord(s, text, Math.round(x - wTxt / 2) + 3, y + 1, '#fff4dc');
  }
}


function drawWord(s: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): void {
  pixelText(s, text, x, y, color);
}

function drawCount(s: CanvasRenderingContext2D, n: string, x: number, y: number): void {
  pixelTextOutlined(s, n, x - 6, y - 4, '#d8434b', '#fff4dc', 3);
}
