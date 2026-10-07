import './paper.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import { G } from '../core/state';
import { SEASONS } from '../core/time';
import type { Paper } from '../story/api';
import { el, markup, uiRoot } from '../ui/dom';

/** The Turnbuckle Tattler: a little newspaper overlay. */
export function showPaper(p: Paper): Promise<void> {
  const unblock = block();
  audio.sfx('pickup');
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const sheet = el('div', 'tattler');
    const date = `${SEASONS[G.time.season]} ${G.time.day}, Year ${G.time.year} · 25¢`;
    sheet.append(
      el('div', 'tattler-mast', 'The Turnbuckle Tattler'),
      el('div', 'tattler-date', `"All the News That Fits, and Some That Hits" · ${date}`),
      el('div', 'tattler-head', p.headline),
    );
    const cols = el('div', 'tattler-cols');
    for (const para of p.body) cols.append(el('p', { html: markup(para) }));
    sheet.append(cols);
    if (p.review) {
      const stars = '★'.repeat(Math.floor(p.review.stars)) + (p.review.stars % 1 >= 0.5 ? '½' : '');
      sheet.append(el('div', 'tattler-review', el('div', 'tattler-review-h', `CLEMENTINE REVIEWS LAST NIGHT'S SHOW · ${stars || '½'}`), el('div', { class: 'tattler-review-b', html: markup(p.review.text) })));
    }
    const done = () => {
      overlay.remove();
      off();
      unblock();
      game.input.clear();
      resolve();
    };
    sheet.append(el('div', 'tattler-foot', 'Tap to fold the paper'));
    overlay.addEventListener('click', done);
    const off = game.input.onKey((_k, c) => {
      if (c === 'Space' || c === 'Enter' || c === 'Escape' || c === 'KeyE') done();
    });
    overlay.append(sheet);
    uiRoot().append(overlay);
  });
}
