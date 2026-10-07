import { audio } from '../audio';
import { game } from '../core/game';
import { hasSave, loadGame, saveSummary, deleteSave } from '../core/save';
import type { Scene } from '../core/scene';
import { newState, setState, G } from '../core/state';
import { choose } from '../ui/dialog';
import { el, uiRoot } from '../ui/dom';
import { WorldScene } from '../world/scene';
import { shineFrame, titleLogo, type Logo } from './title-logo';

/** A puff of dust kicked up where the logo lands. */
interface Puff { x: number; y: number; vx: number; vy: number; t: number; life: number; r: number }

/** When the title pan is frozen: late afternoon, warm but clear enough to read the town. */
const TITLE_MINUTES = 17 * 60;

/**
 * Title screen: Main Street in late-afternoon light drifting by behind a
 * painted championship-belt logo that drops in, lands with a slam, bounces
 * once and kicks up dust. A shine runs across the gold now and then. Tap to
 * start (which also unlocks audio on iOS); the logo hops and thuds again so
 * the landing gets its sound.
 */
export class TitleScene implements Scene {
  private world: WorldScene;
  private ui: HTMLElement;
  private lower: HTMLElement;
  private started = false;
  private logo: Logo | null = null;
  /** Seconds since the scene opened. */
  private t = 0;
  /** Time of the current drop (the first, or the hop after the tap). */
  private dropAt = 0.35;
  private hop = false;
  private landed = false;
  private puffs: Puff[] = [];

  constructor() {
    const s = newState(4242);
    s.time.minutes = TITLE_MINUTES;
    s.weather.today = 'sun';
    setState(s);
    this.world = new WorldScene({ attract: { map: 'town', x0: 6, y0: 27, x1: 76, y1: 26, seconds: 64 } });
    this.ui = el('div', 'title-ui');
    // No haze over the pan: the town should read clearly behind the logo.
    this.ui.style.background = 'none';
    this.ui.style.justifyContent = 'flex-start';
    this.lower = el('div', 'title-lower');
    Object.assign(this.lower.style, { position: 'absolute', left: '50%', top: '66%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' });
  }

  enter(): void {
    const tap = el('div', 'title-tap', 'Tap to start');
    // a little plum tag so it reads over the bright sidewalk (whole-pixel frame, no pill: D-020)
    Object.assign(tap.style, {
      marginTop: '0',
      background: 'var(--plum)',
      padding: 'calc(var(--u) * 2.5) calc(var(--u) * 7) calc(var(--u) * 2)',
      boxShadow: '0 0 0 var(--px) var(--ak), 0 calc(var(--px) * 3) 0 0 var(--shade)',
    });
    this.lower.append(tap);
    this.ui.append(this.lower, el('div', 'title-credit', 'Made with love for the indies, the territories, and everyone in the front row.'));
    uiRoot().append(this.ui);
    const start = () => {
      if (this.started) return;
      this.started = true;
      audio.unlock();
      audio.music('title');
      tap.remove();
      // a little hop so the landing gets its thud now that sound is on
      if (this.landed) {
        this.hop = true;
        this.landed = false;
        this.dropAt = this.t + 0.22;
      }
      this.showButtons();
    };
    this.ui.addEventListener('pointerup', start, { once: true });
    const off = game.input.onKey(() => {
      off();
      start();
    });
  }

  private showButtons(): void {
    const box = el('div', 'title-buttons');
    box.style.marginTop = '0';
    if (hasSave()) {
      const sum = saveSummary();
      const cont = el('button', { class: 'btn primary' }, 'Continue');
      cont.addEventListener('click', () => this.continueGame());
      box.append(cont);
      if (sum) box.append(el('div', 'save-note', `${sum.name} · ${sum.date}`));
    }
    const ng = el('button', { class: `btn ${hasSave() ? '' : 'primary'}` }, 'New Game');
    ng.addEventListener('click', () => void this.newGame());
    box.append(ng);
    this.lower.append(box);
  }

  private continueGame(): void {
    audio.sfx('confirm');
    game.scenes.transition(() => {
      if (!loadGame()) return;
      this.ui.remove();
      void import('../systems').then(() => game.scenes.reset(new WorldScene()));
    });
  }

  private async newGame(): Promise<void> {
    audio.sfx('confirm');
    if (hasSave()) {
      const c = await choose(null, 'Start a brand-new game? Your current save will be replaced the next time you save.', [
        { label: 'Start fresh', value: 'yes', style: 'primary' },
        { label: 'Never mind', value: 'no' },
      ], { cancelValue: 'no' });
      if (c !== 'yes') return;
      deleteSave();
    }
    const { startNewGame } = await import('../story-main/opening');
    this.ui.remove();
    startNewGame();
  }

  exit(): void {
    this.ui.remove();
  }

  update(dt: number): void {
    // Keep the light frozen and lovely.
    G.time.minutes = TITLE_MINUTES;
    this.world.update(dt);
    this.t += dt;
    for (const p of this.puffs) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - dt * 3;
      p.vy = p.vy * (1 - dt * 3) - 4 * dt;
    }
    this.puffs = this.puffs.filter((p) => p.t < p.life);
  }

  /** Logo placement: y offset (logical px, negative = up) and squash (sx, sy) at time t. */
  private pose(t: number): { y: number; sx: number; sy: number; land: boolean } {
    const L = this.logo!;
    const fall = this.hop ? 0.22 : 0.42;
    const t0 = this.dropAt - fall;
    if (t < t0) return { y: this.hop ? 0 : -L.h * 2, sx: 1, sy: 1, land: false };
    if (t < this.dropAt) {
      const k = (t - t0) / fall;
      if (this.hop) {
        // up and back down
        const a = Math.sin(k * Math.PI);
        return { y: -a * 10, sx: 1 - a * 0.03, sy: 1 + a * 0.04, land: false };
      }
      return { y: -(1 - k * k) * (L.h + 60), sx: 0.96, sy: 1.07, land: false };
    }
    const a = t - this.dropAt;
    // squash on impact, then one small bounce, then rest
    if (a < 0.1) {
      const k = a / 0.1;
      const q = this.hop ? 0.06 : 0.13;
      return { y: 0, sx: 1 + q * 0.8 * (1 - k * 0.4), sy: 1 - q * (1 - k * 0.4), land: true };
    }
    if (a < 0.38 && !this.hop) {
      const k = (a - 0.1) / 0.28;
      return { y: -Math.sin(k * Math.PI) * 7, sx: 1 - Math.sin(k * Math.PI) * 0.02, sy: 1 + Math.sin(k * Math.PI) * 0.03, land: true };
    }
    if (a < 0.46 && !this.hop) {
      const k = (a - 0.38) / 0.08;
      return { y: 0, sx: 1 + 0.04 * (1 - k), sy: 1 - 0.05 * (1 - k), land: true };
    }
    return { y: 0, sx: 1, sy: 1, land: true };
  }

  private kickDust(cx: number, by: number, w: number, big: boolean): void {
    const n = big ? 22 : 10;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const u = Math.random();
      this.puffs.push({
        x: cx + side * (w * 0.25 + u * w * 0.28),
        y: by - 2 - Math.random() * 6,
        vx: side * (18 + Math.random() * (big ? 46 : 24)),
        vy: -6 - Math.random() * 10,
        t: 0,
        life: 0.5 + Math.random() * 0.6,
        r: 1.5 + Math.random() * (big ? 3 : 2),
      });
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.world.render(ctx);
    const L = (this.logo ??= titleLogo());
    const { w, h } = game.screen;
    const t = this.t;
    const p = this.pose(t);
    if (p.land && !this.landed) {
      this.landed = true;
      audio.sfx(this.hop ? 'thud' : 'slam', { volume: this.hop ? 0.7 : 0.55 });
      const cx0 = Math.round(w / 2);
      const top0 = Math.max(4, Math.round(h * 0.07));
      this.kickDust(cx0, top0 + L.h - 6, L.w, !this.hop);
    }
    const cx = Math.round(w / 2);
    const top = Math.max(4, Math.round(h * 0.07));
    const dw = Math.round(L.w * p.sx * 2) / 2;
    const dh = Math.round(L.h * p.sy * 2) / 2;
    const x = Math.round((cx - dw / 2) * 2) / 2;
    const y = Math.round((top + L.h - dh + p.y) * 2) / 2;
    // drop shadow on the street below (falls behind and a little right, grows as it lands)
    const near = Math.max(0, Math.min(1, 1 + p.y / 80));
    ctx.save();
    ctx.globalAlpha = 0.32 * near;
    ctx.drawImage(L.shadow, x + 3, top + L.h - dh + 4, dw, dh);
    ctx.restore();
    // a shine runs across the gold every few seconds once it has landed
    const since = t - this.dropAt - 0.6;
    const cyc = since > 0 ? since % 6.5 : -1;
    const img = cyc >= 0 && cyc < 0.9 ? shineFrame(L, cyc / 0.9) : L.cv;
    ctx.drawImage(img, x, y, dw, dh);
    // dust
    for (const d of this.puffs) {
      const k = d.t / d.life;
      ctx.globalAlpha = (1 - k) * 0.75;
      ctx.fillStyle = k < 0.4 ? '#fbf0d9' : '#e8d4b8';
      const r = Math.max(1, Math.round(d.r * (1 + k * 1.2) * 2) / 2);
      const px = Math.round(d.x * 2) / 2;
      const py = Math.round(d.y * 2) / 2;
      ctx.fillRect(px - r, py - r * 0.5, r * 2, r);
      ctx.fillRect(px - r * 0.5, py - r, r, r * 2);
    }
    ctx.globalAlpha = 1;
  }
}
