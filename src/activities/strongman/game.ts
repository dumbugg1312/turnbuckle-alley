/**
 * The strongman tower as a small DOM panel: a painted tower with the marks
 * from PIP-WEIGHT to HALL OF FAME, a brass bell, and a swing meter. Tap
 * (or Space/E) when the marker is in the gold.
 */
import './strongman.css';
import { audio } from '../../audio';
import { block, game } from '../../core/game';
import { nextFrame } from '../../ui/dialog';
import { el, uiRoot } from '../../ui/dom';
import { heightFor, sweepAt, tierFor, TIERS, type Swing } from './logic';

export interface SwingResult {
  height: number;
  tier: number;
  rang: boolean;
}

export function playStrongman(s: Swing): Promise<SwingResult> {
  const unblock = block();
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay sm-overlay');
    const box = el('div', 'modal panel sm-box');
    const tower = el('div', 'sm-tower');
    const bell = el('div', 'sm-bell');
    tower.append(bell);
    TIERS.forEach((t, i) => {
      const mark = el('div', 'sm-mark', t);
      mark.style.bottom = `${(i / (TIERS.length - 1)) * 86 + 4}%`;
      tower.append(mark);
    });
    const puck = el('div', 'sm-puck');
    tower.append(puck);
    const meter = el('div', 'sm-meter');
    const zone = el('div', 'sm-zone');
    zone.style.left = `${(s.center - s.good) * 100}%`;
    zone.style.width = `${s.good * 200}%`;
    const sweet = el('div', 'sm-sweet');
    sweet.style.left = `${(s.center - s.perfect) * 100}%`;
    sweet.style.width = `${s.perfect * 200}%`;
    const marker = el('i');
    meter.append(zone, sweet, marker);
    const hint = el('div', 'sm-hint', 'Tap / Space when the hammer is in the gold');
    const side = el('div', 'sm-side', el('h2', {}, 'Ring the Bell'), meter, hint);
    box.append(tower, side);
    overlay.append(box);
    uiRoot().append(overlay);

    const start = performance.now();
    let done = false;
    const swing = () => {
      if (done) return;
      done = true;
      off();
      overlay.removeEventListener('pointerdown', onTap);
      const pos = sweepAt((performance.now() - start) / 1000, s.pass);
      const h = heightFor(pos, s);
      const tier = tierFor(h);
      audio.sfx('swing');
      setTimeout(() => audio.sfx('thud', { volume: 0.7 }), 90);
      puck.style.transition = `bottom ${0.35 + h * 0.45}s cubic-bezier(.2,.9,.3,1)`;
      puck.style.bottom = `${h * 86 + 4}%`;
      const top = 450 + h * 450;
      setTimeout(() => {
        if (h >= 1) {
          audio.sfx('bell');
          bell.classList.add('ring');
          box.classList.add('rang');
        }
        hint.textContent = h >= 1 ? 'DING!' : TIERS[tier];
        hint.classList.add('result');
      }, top);
      setTimeout(() => {
        puck.style.transition = 'bottom 0.5s ease-in';
        puck.style.bottom = '4%';
      }, top + 700);
      setTimeout(() => {
        overlay.remove();
        game.input.clear();
        unblock();
        resolve({ height: h, tier, rang: h >= 1 });
      }, top + 1400);
    };
    const onTap = (e: Event) => {
      e.preventDefault();
      swing();
    };
    overlay.addEventListener('pointerdown', onTap);
    const off = game.input.onKey((_k, code) => {
      if (code === 'Space' || code === 'KeyE' || code === 'Enter') swing();
    });
    const tick = () => {
      if (done) return;
      marker.style.left = `${sweepAt((performance.now() - start) / 1000, s.pass) * 100}%`;
      nextFrame(tick);
    };
    nextFrame(tick);
  });
}
