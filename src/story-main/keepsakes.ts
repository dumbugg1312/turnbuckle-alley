import './keepsakes.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import { getLook } from '../data/looks';
import { CHAR_DENSITY, characterSprite } from '../gfx/characters';
import { liA, mkSpr, OUT, P, R, shA, toCanvas } from '../gfx/kit';
import type { Look } from '../gfx/look';
import { el, markup, uiRoot } from '../ui/dom';

/**
 * What was tucked inside Grandma's letter, shown one by one: the bus ticket,
 * the house key on its faded blue ribbon, and the Velvet Hammers Polaroid,
 * which flips over to show the handwriting on the back.
 */
export async function showEnvelopeContents(): Promise<void> {
  const unblock = block();
  const overlay = el('div', 'overlay ks-overlay');
  const table = el('div', 'ks-table');
  const caption = el('div', 'ks-caption');
  const hint = el('div', 'ks-hint label', 'Tap to continue');
  overlay.append(table, caption, hint);
  uiRoot().append(overlay);

  const tap = () =>
    new Promise<void>((res) => {
      let off = () => {};
      const go = () => {
        overlay.removeEventListener('click', go);
        off();
        res();
      };
      // A beat before taps count, so a double-tap can't skip an item unseen.
      setTimeout(() => {
        overlay.addEventListener('click', go);
        off = game.input.onKey((_k, c) => {
          if (c === 'Space' || c === 'Enter' || c === 'KeyE') go();
        });
      }, 350);
    });
  const say = (html: string) => {
    caption.innerHTML = markup(html);
    caption.classList.remove('pop');
    void caption.offsetWidth;
    caption.classList.add('pop');
  };
  const reveal = (node: HTMLElement, sfx: string) => {
    for (const n of table.children) n.classList.add('dim');
    node.classList.add('ks-item');
    table.append(node);
    audio.sfx(sfx);
  };

  reveal(ticket(), 'card-draw');
  say('Tucked inside: a **bus ticket.** One way. It leaves at seven.');
  await tap();
  reveal(keyArt(), 'pickup');
  say('An old **brass key**, with a faded blue ribbon tied through the bow.');
  await tap();
  const pol = polaroid();
  reveal(pol, 'card-draw');
  say('And a **Polaroid.** Two women in sequined ring gear, back to back, holding one championship belt between them.');
  await tap();
  pol.classList.add('flipped');
  audio.sfx('card-draw', { pitch: 1.2 });
  say('On the back, in younger handwriting:');
  await tap();
  overlay.classList.add('out');
  await new Promise((r) => setTimeout(r, 260));
  overlay.remove();
  unblock();
  game.input.clear();
}

// ---------------------------------------------------------------- the ticket

function ticket(): HTMLElement {
  const t = el('div', 'ks-ticket');
  t.append(
    el('div', 'ks-ticket-main',
      el('div', 'ks-ticket-co', 'ROUTE 9 COACH LINES'),
      el('div', 'ks-ticket-route', el('span', {}, 'THE CITY'), el('b', {}, '→'), el('span', {}, 'TURNBUCKLE ALLEY')),
      el('div', 'ks-ticket-row', el('span', {}, 'ONE WAY'), el('span', {}, 'DEPARTS 7:00 AM'), el('span', {}, 'SEAT 12')),
    ),
    el('div', 'ks-ticket-stub', el('div', {}, 'ADMIT'), el('div', { class: 'ks-ticket-one' }, 'ONE'), el('div', {}, 'No. 0981')),
  );
  return t;
}

// ---------------------------------------------------------------- the key

function keyArt(): HTMLElement {
  const brass = '#c8a04a';
  const ribbon = '#8fb0d4';
  const spr = OUT(
    mkSpr(48, 24, () => {
      // ribbon tails, then the bow loops and knot
      for (let i = 0; i < 9; i++) {
        R(7 - (i >> 1), 12 + i, 3, 1, i % 3 === 2 ? shA(ribbon, 0.25) : shA(ribbon, 0.12));
        R(11 + (i >> 2), 12 + i, 3, 1, i % 3 === 1 ? shA(ribbon, 0.3) : shA(ribbon, 0.18));
      }
      for (const [cx, sgn] of [[6, -1], [14, 1]] as const) {
        for (let y = -3; y <= 3; y++)
          for (let x = -4; x <= 4; x++) {
            const d = (x * x) / 16 + (y * y) / 9;
            if (d > 1 || d < 0.28) continue;
            P(cx + x, 9 + y, y < 0 && x * sgn < 1 ? liA(ribbon, 0.25) : y > 1 ? shA(ribbon, 0.22) : ribbon);
          }
      }
      R(9, 7, 3, 4, liA(ribbon, 0.12));
      P(10, 8, liA(ribbon, 0.4));
      // the bow of the key: a ring, lit from the top left
      for (let y = -7; y <= 7; y++)
        for (let x = -7; x <= 7; x++) {
          const d = Math.hypot(x, y);
          if (d > 6.9 || d < 3.4) continue;
          const lit = -(x + y) / (d || 1);
          P(24 + x, 11 + y, lit > 0.55 ? liA(brass, 0.45) : lit > 0 ? liA(brass, 0.12) : lit > -0.6 ? brass : shA(brass, 0.3));
        }
      P(21, 6, '#fff6d8');
      // the shaft, collar and teeth
      R(30, 9, 16, 4, brass);
      R(30, 9, 16, 1, liA(brass, 0.4));
      R(30, 12, 16, 1, shA(brass, 0.3));
      R(30, 8, 2, 6, shA(brass, 0.12));
      R(30, 8, 1, 6, liA(brass, 0.3));
      R(38, 13, 2, 3, brass);
      R(41, 13, 2, 5, brass);
      R(44, 13, 2, 2, brass);
      R(38, 15, 2, 1, shA(brass, 0.3));
      R(41, 17, 2, 1, shA(brass, 0.3));
      for (let x = 33; x < 45; x += 3) P(x, 10, shA(brass, 0.08));
    }),
  );
  const cv = toCanvas(spr);
  const k = devPx(cv.width, 210);
  cv.style.width = `${cv.width * k}px`;
  cv.style.height = `${cv.height * k}px`;
  return el('div', 'ks-key', cv);
}

// ---------------------------------------------------------------- the Polaroid

function young(id: string, p: Partial<Look>): Look {
  const base = getLook(id);
  const out: Look = { ...base, ...p };
  delete out.age;
  return out;
}

function polaroid(): HTMLElement {
  const W = 48;
  const H = 46;
  const d = CHAR_DENSITY;
  const cv = document.createElement('canvas');
  cv.width = W * d;
  cv.height = H * d;
  const x = cv.getContext('2d')!;
  x.imageSmoothingEnabled = false;
  x.save();
  x.scale(d, d);
  // The Sportatorium, 1981: dark house, a spotlight, the crowd, the ropes.
  x.fillStyle = '#3a2440';
  x.fillRect(0, 0, W, H);
  const glow = x.createRadialGradient(W / 2, 12, 2, W / 2, 16, 30);
  glow.addColorStop(0, 'rgba(255,226,170,0.55)');
  glow.addColorStop(1, 'rgba(255,226,170,0)');
  x.fillStyle = glow;
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 50; i++) {
    const cx = (i * 37) % W;
    const cy = 16 + ((i * 13) % 8);
    x.fillStyle = ['#5a3a5a', '#6a4a62', '#4a3050', '#7a5a6a'][i % 4];
    x.fillRect(cx, cy, 2, 2);
  }
  for (const [y, c] of [[24, '#d8434b'], [28, '#f4ecd8'], [32, '#3f74d8']] as const) {
    x.fillStyle = c;
    x.fillRect(0, y, W, 1);
  }
  x.fillStyle = '#e8dcc0';
  x.fillRect(0, 35, W, H - 35);
  x.fillStyle = '#cdbf9e';
  x.fillRect(0, 35, W, 1);
  x.restore();
  // Dottie and Birdie, back to back, arms up.
  const dottie = young('grandma-robe', { hair: 'curly', hairColor: '#3a2632', topPattern: 'sequins', extras: [] });
  const birdie = young('birdie-ring', { hair: 'highpony', hairColor: '#c8442e', hairAccent: undefined, topPattern: 'sequins' });
  const feet = 43;
  const figs = [
    { look: birdie, facing: 'left' as const, cx: 19 },
    { look: dottie, facing: 'right' as const, cx: 29 },
  ];
  let top = H;
  for (const f of figs) {
    const s = characterSprite(f.look, { facing: f.facing, pose: 'celebrate', frame: 0 });
    x.drawImage(s.canvas, Math.round(f.cx * d - s.ax), Math.round(feet * d - s.ay));
    top = Math.min(top, feet - s.ay / d);
  }
  // The belt, held up between them.
  const by = Math.max(3, Math.round(top) - 1);
  x.save();
  x.scale(d, d);
  x.fillStyle = '#5a2a1e';
  x.fillRect(15, by + 1, 18, 3);
  x.fillStyle = '#e2b244';
  x.fillRect(20, by - 1, 8, 6);
  x.fillStyle = '#fff0b0';
  x.fillRect(21, by, 6, 1);
  x.fillStyle = '#a8742a';
  x.fillRect(20, by + 4, 8, 1);
  x.fillStyle = '#d8434b';
  x.fillRect(23, by + 1, 2, 2);
  x.restore();
  const k = devPx(W, Math.min(250, window.innerWidth * 0.55));
  cv.style.width = `${W * k}px`;
  cv.style.height = `${H * k}px`;
  const card = el('div', 'ks-polaroid');
  const front = el('div', 'ks-pol-face ks-pol-front', el('div', 'ks-pol-photo', cv));
  const back = el('div', 'ks-pol-face ks-pol-back', el('div', 'ks-pol-hand', el('div', {}, 'The Velvet Hammers.'), el('div', {}, '1981.'), el('div', { class: 'ks-pol-under' }, 'Never better.')));
  card.append(el('div', 'ks-pol-inner', front, back));
  return card;
}

/** CSS pixels per source pixel that land on whole device pixels, aiming near `targetCss` wide. */
function devPx(srcW: number, targetCss: number): number {
  const dpr = window.devicePixelRatio || 1;
  const dev = Math.max(1, Math.floor((targetCss * dpr) / srcW));
  return dev / dpr;
}
