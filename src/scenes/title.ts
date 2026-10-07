import { audio } from '../audio';
import { game } from '../core/game';
import { hasSave, loadGame, saveSummary } from '../core/save';
import type { Scene } from '../core/scene';
import { newState, setState, G } from '../core/state';
import { choose, toast } from '../ui/dialog';
import { el, uiRoot } from '../ui/dom';
import { WorldScene } from '../world/scene';

/**
 * Title screen: the town's Main Street at golden hour drifting by behind the
 * logo. Tap to start (which also unlocks audio on iOS).
 */
export class TitleScene implements Scene {
  private world: WorldScene;
  private ui: HTMLElement;
  private started = false;

  constructor() {
    const s = newState(4242);
    s.time.minutes = 18 * 60;
    s.weather.today = 'sun';
    setState(s);
    this.world = new WorldScene({ attract: { map: 'town', x0: 6, y0: 27, x1: 76, y1: 26, seconds: 64 } });
    this.ui = el('div', 'title-ui');
  }

  enter(): void {
    const logo = el('div', 'title-logo', 'Turnbuckle', el('br'), 'Alley', el('small', {}, 'A COZY WRESTLING LIFE'));
    const tap = el('div', 'title-tap', 'Tap to start');
    this.ui.append(logo, tap, el('div', 'title-credit', 'Made with love for the indies, the territories, and everyone in the front row.'));
    uiRoot().append(this.ui);
    const start = () => {
      if (this.started) return;
      this.started = true;
      audio.unlock();
      audio.music('title');
      tap.remove();
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
    this.ui.append(box);
  }

  private continueGame(): void {
    audio.sfx('confirm');
    game.scenes.transition(() => {
      if (!loadGame()) {
        toast("That save couldn't be read.");
        return;
      }
      audio.volumes(G.settings.music, G.settings.sfx);
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
      // Don't delete the old save here: the first save of the new game overwrites it,
      // so quitting during the prologue keeps the old one, as the prompt promises.
    }
    const { startNewGame } = await import('../story-main/opening');
    this.ui.remove();
    startNewGame();
  }

  exit(): void {
    this.ui.remove();
  }

  update(dt: number): void {
    // Keep the golden hour frozen and lovely.
    G.time.minutes = 18 * 60;
    this.world.update(dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.world.render(ctx);
    // Soft vignette behind the logo.
    const { w, h } = game.screen;
    const g = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.1, w / 2, h * 0.45, w * 0.7);
    g.addColorStop(0, 'rgba(20,10,30,0.35)');
    g.addColorStop(1, 'rgba(20,10,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}
