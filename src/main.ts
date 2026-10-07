import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/jersey-10/400.css';
import '@fontsource/silkscreen/400.css';
import './ui/styles.css';
// Shops, item pickers and the pause menu share these styles. menu.ts is loaded lazily,
// so without this a shop opened before the first menu looked completely unstyled.
import './ui/menu.css';

import { game } from './core/game';
import { Input } from './core/input';
import { SceneManager } from './core/scene';
import { Screen } from './core/screen';
import { G } from './core/state';
import { updateUiScale } from './ui/dom';
import { boot } from './boot';

const canvas = document.getElementById('game') as HTMLCanvasElement;
game.screen = new Screen(canvas);
game.input = new Input(game.screen);
game.scenes = new SceneManager();
updateUiScale();
window.addEventListener('resize', updateUiScale);

const STEP = 1 / 60;
let last = performance.now();
let acc = 0;

function step(): void {
  game.t += STEP;
  if (game.blockers === 0 && !game.scenes.transitioning) G.playMinutes += STEP / 60;
  game.scenes.update(STEP);
  game.input.endFrame();
}

function draw(): void {
  const { ctx, w, h } = game.screen;
  game.screen.resetTransform(ctx);
  ctx.imageSmoothingEnabled = false;
  game.scenes.render(ctx, w, h);
  game.screen.present();
}

const seenErrors = new Set<string>();
function frame(now: number) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  // One exception in a scene's update/render must never kill the whole loop
  // (that freezes the game with no way out). Log it once and keep running.
  try {
    while (acc >= STEP) {
      acc -= STEP;
      step();
    }
    draw();
  } catch (e) {
    acc = 0;
    const msg = e instanceof Error ? e.stack ?? e.message : String(e);
    if (!seenErrors.has(msg)) {
      seenErrors.add(msg);
      console.error('[game loop]', e);
    }
  }
  schedule();
}

// When the page is hidden, requestAnimationFrame stops; keep simulating on a
// timer so background tabs (and automated playtests) still progress.
function schedule(): void {
  if (document.hidden) setTimeout(() => frame(performance.now()), 16);
  else requestAnimationFrame(frame);
}

// Expose for debugging and automated playtests.
(window as unknown as { TA: unknown }).TA = {
  game,
  get G() {
    return G;
  },
  /** Playtest helper: click through dialogue for `secs`, picking choice index `pick`. */
  async auto(secs: number, pick = 0): Promise<string[]> {
    const end = performance.now() + secs * 1000;
    const log: string[] = [];
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    while (performance.now() < end) {
      const ch = document.querySelectorAll<HTMLButtonElement>('.choices button');
      if (ch.length) {
        log.push('CHOICE: ' + [...ch].map((b) => b.textContent).join(' | '));
        ch[Math.min(pick, ch.length - 1)].click();
        await wait(300);
        continue;
      }
      const d = document.querySelector('.dialog');
      if (d) {
        const t = d.querySelector('.text')?.textContent ?? '';
        if (t && log[log.length - 1] !== t) log.push(t);
        d.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        await wait(100);
        d.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      }
      const ov = document.querySelector('.overlay .tattler');
      if (ov) {
        (ov.parentElement as HTMLElement).click();
        log.push('[paper/letter]');
      }
      await wait(220);
    }
    return log;
  },
  /** Fast-forward the simulation by some seconds (playtest helper). */
  advance(seconds: number) {
    for (let i = 0; i < Math.round(seconds / STEP); i++) step();
    draw();
  },
};

void document.fonts.ready.then(() => {
  boot();
  schedule();
});
