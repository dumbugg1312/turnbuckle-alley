import { audio } from '../audio';
import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { circ, ell, P, R, sprite, VG } from '../gfx/kit';
import { el, markup, uiRoot } from '../ui/dom';
import { fmt } from '../ui/text';

/**
 * The ending: six warm pixel vignettes over 'ending', then the cast roll over
 * 'credits', then "the story goes on". Tap to hurry a card along; Escape skips.
 * Vignettes are drawn with the art kit at 128x72 and scaled up crisp.
 */

const W = 128;
const H = 72;
const SKIN = '#e8a982';
const PLUM = '#6a3f8a';
const CRIMSON = '#c0303a';
const GOLD = '#f4b63f';
const NIGHT = ['#1d1630', '#2b2148', '#4a3466'];

/** A tiny standing or sitting person. */
function person(x: number, y: number, coat: string, hair: string, sitting = false): void {
  const h = sitting ? 7 : 10;
  R(x - 2, y - h, 5, h, coat);
  circ(x + 0.5, y - h - 2.5, 2.5, SKIN);
  R(x - 2, y - h - 5, 5, 2, hair);
  if (!sitting) R(x - 1, y, 1, 2, '#2b2140'), R(x + 1, y, 1, 2, '#2b2140');
}

function stars(seed: number): void {
  for (let i = 0; i < 26; i++) P((seed * 37 + i * 53) % W, (i * 29 + seed) % 30, i % 3 ? '#cfc6ff' : '#fff6d8');
}

const VIGNETTES: { key: string; caption: string; draw: () => void }[] = [
  {
    key: 'porch',
    caption: "Birdie's porch. Two rocking chairs. Both of them squeak now.",
    draw: () => {
      VG(0, 0, W, 44, NIGHT);
      stars(3);
      R(10, 18, 108, 30, '#d98a8a');
      R(16, 24, 18, 14, '#ffe6a0');
      R(24, 24, 1, 14, '#a05a5a');
      R(0, 48, W, 24, '#7a4a3a');
      for (let x = 0; x < W; x += 8) R(x, 48, 1, 24, '#6a3e30');
      circ(64, 22, 2, '#fff2b0');
      for (const [dx, dy] of [[4, -3], [-5, 2], [6, 4]]) P(64 + dx, 22 + dy, '#f6f0ff');
      for (const [cx, coat, hair] of [[52, CRIMSON, '#f4f4f4'], [78, PLUM, '#d8d8e0']] as const) {
        R(cx - 5, 54, 11, 2, '#4a2a1c');
        ell(cx, 60, 7, 2, '#4a2a1c');
        R(cx - 5, 44, 2, 10, '#4a2a1c');
        person(cx + 1, 54, coat, hair, true);
      }
      R(70, 50, 14, 4, '#8aa0d8');
    },
  },
  {
    key: 'marquee',
    caption: 'The Sportatorium marquee. Every bulb. Even the north side.',
    draw: () => {
      VG(0, 0, W, H, ['#2b2148', '#5a3a6a', '#d9784a']);
      R(14, 30, 100, 42, '#8a3a2a');
      R(22, 10, 84, 22, '#1e1426');
      for (let x = 24; x < 106; x += 4) P(x, 11, GOLD), P(x, 30, GOLD);
      for (let y = 12; y < 30; y += 4) P(23, y, GOLD), P(104, y, GOLD);
      for (let i = 0; i < 10; i++) R(30 + i * 7, 15, 5, 5, i % 2 ? '#fff0c0' : '#ffd36a');
      R(38, 23, 52, 3, '#f6eadc');
      R(56, 50, 16, 22, '#4a2a1c');
      person(40, 70, PLUM, '#d8d8e0');
    },
  },
  {
    key: 'belt',
    caption: 'One belt, whole again. A red rhinestone back where it belongs.',
    draw: () => {
      VG(0, 0, W, H, ['#2b2140', '#3a2b52']);
      R(18, 14, 92, 46, '#4a3a5e');
      R(20, 16, 88, 42, '#5a4a70');
      R(24, 34, 80, 8, '#3a1e14');
      ell(64, 37, 16, 11, GOLD);
      ell(64, 37, 12, 8, '#ffe48e');
      R(63, 26, 2, 22, '#c8902a');
      circ(64, 37, 2.5, '#e2303a');
      P(63, 36, '#ffb0b0');
      ell(42, 37, 6, 5, '#e2b244');
      ell(86, 37, 6, 5, '#e2b244');
      for (let x = 22; x < 108; x += 9) P(x, 18, '#c8c0e0');
    },
  },
  {
    key: 'booth',
    caption: 'The back booth. One milkshake. Two straws.',
    draw: () => {
      R(0, 0, W, H, '#5a3a2a');
      for (let x = 0; x < W; x += 8) for (let y = 52; y < H; y += 8) R(x + ((y / 8) % 2) * 4, y, 4, 4, '#f6f0e6'), R(x + 4 - ((y / 8) % 2) * 4, y, 4, 4, '#2b2140');
      R(8, 10, 22, 42, '#c0303a');
      R(98, 10, 22, 42, '#c0303a');
      R(26, 34, 76, 6, '#e6d8c0');
      R(60, 40, 8, 12, '#8a8a9a');
      R(58, 18, 12, 16, '#f6eadc');
      R(59, 20, 10, 13, '#6a3a2a');
      R(61, 8, 1, 12, '#e2303a');
      R(66, 6, 1, 14, '#3f9a92');
      person(30, 34, CRIMSON, '#f4f4f4', true);
      person(97, 34, PLUM, '#d8d8e0', true);
    },
  },
  {
    key: 'ring',
    caption: 'Monday morning. Somebody is sweeping the ring and singing. Off-key. Somebody else is singing worse.',
    draw: () => {
      R(0, 0, W, H, '#2b2140');
      ell(64, 10, 30, 6, '#3a2f55');
      R(24, 30, 80, 26, '#e8e0d0');
      R(24, 56, 80, 8, '#3f5aa0');
      for (const x of [24, 103]) R(x, 18, 2, 40, '#b8b8c4');
      for (const y of [22, 27, 32]) R(25, y, 79, 1, '#d8434b');
      R(80, 26, 1, 14, '#a0784a');
      R(77, 39, 7, 3, '#e2b244');
      person(84, 44, CRIMSON, '#f4f4f4');
      person(50, 44, PLUM, '#d8d8e0');
      P(58, 30, '#fff6d8');
      P(60, 28, '#fff6d8');
    },
  },
  {
    key: 'frontrow',
    caption: 'Saturday night. Front row. A1 and A2. When your music hits, she stands up.',
    draw: () => {
      R(0, 0, W, H, '#1e1426');
      VG(0, 0, W, 28, ['#6a3f8a', '#1e1426']);
      for (let i = 0; i < 40; i++) P((i * 47) % W, (i * 13) % 40, ['#f4b63f', '#d8434b', '#3f9a92', '#f6f0ff'][i % 4]);
      for (let x = 4; x < W; x += 10) R(x, 56, 8, 6, '#3a2f55'), R(x, 50, 8, 2, '#4a3f65');
      person(56, 56, '#b89ad8', '#d8c8e8');
      person(68, 56, PLUM, '#d8d8e0');
      R(52, 46, 3, 4, '#1e1426');
      for (let x = 8; x < W; x += 10) if (x < 50 || x > 72) person(x + 4, 58, '#4a3f65', '#2b2140', true);
    },
  },
];

const CAST: [string, string][] = [
  ['Dottie "The Duchess" Dupree', 'The Velvet Hammers'],
  ['Bernadette "Birdie" Malone', 'The Velvet Hammers'],
  ['{ring}', 'Lost the best match of their life'],
  ['"Sweet Lou" Bastian', 'Two thousand and some tapes. One second verse.'],
  ['Doc Halloran', 'Counted it slow'],
  ['Gus Gravel', 'Said it out loud, finally'],
  ['Hank Szabo', 'Kept the rhinestone'],
  ['June Oyelaran', 'Kept the boots. Kept the booth.'],
  ['Agnes Pickett', 'Saved seat A2'],
  ['Sami Haddad', "Don't correct. Connect."],
  ['Marigold Iyer & Velma Ruiz', 'The robe, an inch shorter'],
  ['"Gorgeous" Gideon Price', 'The crown braid'],
  ['Mo Dizon', 'Carried the envelopes. Never asked.'],
  ['Mayor Delphine Oakes', 'Miss Homecoming, 1983'],
  ['Pip Abernathy', 'Undisputed Pip-weight champion of the world'],
  ['La Mariposa Dorada · The Mountain · Dex Delgado', 'The locker room'],
  ['The Bruiser Twins · Hurricane Huang · Cowboy Clint', 'The locker room'],
  ['Tiny Tallbridge · Professor Pinfall · Referee Mo', 'The locker room'],
  ['Clementine Beaulieu', 'Wrote the headline before the bell. No question mark.'],
  ['Sheriff Bev · Coach Patty · Fenwick · Dr. Nadia', 'The best crowd in the territory'],
  ['Farid Haddad', 'Always said she had a broken heart, not a black one'],
  ['Wanda', 'Bowed'],
  ['Jobber', 'Stole a microphone cord'],
  ['And everybody in Turnbuckle Alley', 'Who came anyway. They always come anyway.'],
];

class CreditsScene implements Scene {
  constructor(private root: HTMLElement) {}
  update(): void {}
  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0b0712';
    ctx.fillRect(0, 0, game.screen.w, game.screen.h);
  }
  exit(): void {
    this.root.remove();
  }
}

/** Play the credits. Resolves when the player taps through the last card. */
export function playCredits(): Promise<void> {
  return new Promise((resolve) => {
    const root = el('div', { style: 'position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:#0b0712;color:#f6eadc;text-align:center;font-family:"Pixelify Sans",sans-serif;overflow:hidden' });
    uiRoot().append(root);
    const scene = new CreditsScene(root);
    game.scenes.push(scene);
    let hurry: (() => void) | null = null;
    let skipAll = false;
    const onTap = () => hurry?.();
    root.addEventListener('pointerup', onTap);
    const offKey = game.input.onKey((_k, code) => {
      if (code === 'Escape') skipAll = true;
      if (code === 'Space' || code === 'Enter' || code === 'KeyE' || code === 'Escape') hurry?.();
    });
    const wait = (ms: number) =>
      new Promise<void>((r) => {
        if (skipAll) return r();
        const t = setTimeout(done, ms);
        function done() {
          clearTimeout(t);
          hurry = null;
          r();
        }
        hurry = done;
      });
    const show = async (node: HTMLElement, ms: number) => {
      root.replaceChildren(node);
      node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' });
      await wait(ms);
      await node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: skipAll ? 1 : 700, fill: 'forwards' }).finished;
    };
    const title = (big: string, small: string) =>
      el('div', {}, el('div', { style: 'font-family:"Jersey 10",sans-serif;font-size:calc(var(--u)*28);color:#f4b63f;letter-spacing:.06em' }, big), el('div', { style: 'font-size:calc(var(--u)*9);margin-top:calc(var(--u)*6);opacity:.85', html: markup(fmt(small)) }));

    void (async () => {
      audio.music('ending', { fade: 1 });
      await show(title('TURNBUCKLE ALLEY', 'The Velvet Hammers. 1970 to 1983. And one more night.'), 4200);
      for (const v of VIGNETTES) {
        const cv = sprite(`credits-${v.key}`, W, H, v.draw);
        const img = el('canvas', { width: W, height: H, style: 'width:min(86vw,calc(var(--u)*230));image-rendering:pixelated;border:calc(var(--u)*2) solid #f4b63f;box-shadow:0 0 0 calc(var(--u)*2) #2b2140' }) as HTMLCanvasElement;
        img.getContext('2d')!.drawImage(cv, 0, 0);
        const cap = el('div', { style: 'font-size:calc(var(--u)*8.5);max-width:min(86vw,calc(var(--u)*240));margin:calc(var(--u)*7) auto 0;line-height:1.4', html: markup(fmt(v.caption)) });
        await show(el('div', {}, img, cap), 5200);
      }
      audio.music('credits', { fade: 1 });
      const roll = el('div', { style: 'position:absolute;left:0;right:0;top:100%;display:flex;flex-direction:column;gap:calc(var(--u)*9)' });
      roll.append(el('div', { style: 'font-family:"Jersey 10",sans-serif;font-size:calc(var(--u)*20);color:#f4b63f' }, 'STARRING'));
      for (const [name, role] of CAST) {
        roll.append(el('div', {}, el('div', { style: 'font-size:calc(var(--u)*10);color:#ffe48e' }, fmt(name)), el('div', { style: 'font-size:calc(var(--u)*7);opacity:.8' }, role)));
      }
      roll.append(el('div', { style: 'font-size:calc(var(--u)*7);opacity:.7;margin-top:calc(var(--u)*14)' }, 'No one was harmed in the making of this match. Everybody was sold beautifully.'));
      root.replaceChildren(roll);
      const dist = roll.scrollHeight + root.clientHeight;
      const anim = roll.animate([{ transform: 'translateY(0)' }, { transform: `translateY(-${dist}px)` }], { duration: 52000, easing: 'linear', fill: 'forwards' });
      hurry = () => (anim.playbackRate = Math.min(8, anim.playbackRate * 2));
      if (skipAll) anim.finish();
      await anim.finished.catch(() => undefined);
      hurry = null;
      await show(title('THE STORY GOES ON', 'Every Saturday. Front row. A1 and A2.'), 5000);
      const end = title('', 'Tap to keep living in Turnbuckle Alley.');
      root.replaceChildren(end);
      skipAll = false;
      await new Promise<void>((r) => (hurry = r));
      offKey();
      root.removeEventListener('pointerup', onTap);
      if (game.scenes.top === scene) game.scenes.pop();
      else root.remove();
      resolve();
    })();
  });
}
