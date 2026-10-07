import { audio } from '../audio';
import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { T, TC } from '../gfx/font';
import { AK, circ, curve, ell, hash2, liA, mixc, mkSpr, OUT, poly, R, RR, rng, selA, shA, toCanvas, VG, type Spr } from '../gfx/kit';
import { el, uiRoot } from '../ui/dom';

/**
 * The bus ride from the city to Turnbuckle Alley: a parallax montage from a
 * gray dawn skyline to golden-hour farmland, ending at the town sign.
 */
const DURATION = 24;

function strip(w: number, h: number, seed: number, fn: (r: () => number) => void): HTMLCanvasElement {
  return toCanvas(mkSpr(w, h, () => fn(rng(seed))));
}

export class BusScene implements Scene {
  private t = 0;
  private onDone: () => void;
  private layers: Record<string, HTMLCanvasElement> = {};
  private caption: HTMLElement;
  private skip: HTMLElement;
  private shown = -1;
  private done = false;
  private sign: HTMLCanvasElement;
  private frame: HTMLCanvasElement | null = null;
  private frameKey = '';

  constructor(onDone: () => void) {
    this.onDone = onDone;
    this.caption = el('div', 'bus-caption');
    this.skip = el('button', { class: 'btn small bus-skip' }, 'Skip ▸');
    this.skip.addEventListener('click', () => this.finish());
    this.sign = this.buildSign();
  }

  enter(): void {
    uiRoot().append(this.caption, this.skip);
    audio.music('bus');
    this.build();
  }

  exit(): void {
    this.caption.remove();
    this.skip.remove();
  }

  private build(): void {
    const W = 512;
    // Far city skyline.
    this.layers.city = strip(W, 90, 3, (r) => {
      let x = 0;
      while (x < W) {
        const bw = 14 + Math.floor(r() * 26);
        const bh = 24 + Math.floor(r() * 62);
        const c = mixc('#6a6a8a', '#8a8aa8', r());
        R(x, 90 - bh, bw, bh, c);
        R(x, 90 - bh, 1, bh, liA(c, 0.15));
        for (let wy = 90 - bh + 4; wy < 86; wy += 5) for (let wx = x + 2; wx < x + bw - 2; wx += 4) if (r() < 0.45) R(wx, wy, 2, 2, r() < 0.3 ? '#f6e2a0' : shA(c, 0.25));
        if (r() < 0.3) R(x + bw / 2, 90 - bh - 8, 1, 8, c);
        x += bw + Math.floor(r() * 3);
      }
    });
    // Rolling hills (two tones).
    this.layers.hills = strip(W, 70, 9, (r) => {
      for (let x = 0; x < W; x++) {
        const h = 30 + Math.sin(x / 40) * 10 + Math.sin(x / 17 + 2) * 6 + Math.sin((x / W) * Math.PI * 2) * 6;
        R(x, 70 - h, 1, h, '#7aa07a');
        R(x, 70 - h, 1, 2, '#9ac08a');
      }
      for (let i = 0; i < 40; i++) {
        const x = r() * W;
        const y = 34 + r() * 30;
        ell(x, y, 4 + r() * 4, 3 + r() * 2, '#5a8a6a');
      }
    });
    // Mid layer: trees, barns, silos, poles.
    this.layers.mid = strip(W, 80, 21, (r) => {
      let x = 4;
      while (x < W - 30) {
        const k = r();
        if (k < 0.18) {
          // Red barn
          poly([[x, 80], [x, 58], [x + 14, 48], [x + 28, 58], [x + 28, 80]], '#c0453f');
          poly([[x - 2, 59], [x + 14, 47], [x + 30, 59], [x + 28, 60], [x + 14, 50], [x, 60]], '#f2e6c9');
          R(x + 10, 66, 8, 14, '#7a2a2f');
          R(x + 11, 67, 6, 1, '#f2e6c9');
          x += 40;
        } else if (k < 0.28) {
          // Silo
          R(x, 46, 10, 34, '#c8c8d8');
          ell(x + 5, 46, 5, 4, '#9a9ab0');
          R(x, 46, 2, 34, '#e8e8f0');
          x += 20;
        } else if (k < 0.5) {
          // Telephone pole with crossbar
          R(x + 3, 30, 2, 50, '#7a5a3a');
          R(x, 34, 8, 1, '#7a5a3a');
          x += 26;
        } else {
          // Round tree
          const tr = 8 + r() * 6;
          R(x + tr - 1, 70, 3, 10, '#6a4a3a');
          ell(x + tr, 66 - tr / 2, tr, tr * 0.85, '#4a8a5a');
          ell(x + tr - 2, 63 - tr / 2, tr * 0.6, tr * 0.5, '#6aaa6a');
          x += tr * 2 + 6;
        }
      }
      // Wires between poles, gently sagging.
      curve(0, 35, W, 35, 4, '#3a3048');
    });
    // Near field with fence posts.
    this.layers.near = strip(W, 40, 33, (r) => {
      VG(0, 0, W, 40, ['#a8c068', '#88a858', '#6a8a48']);
      for (let y = 4; y < 40; y += 5) for (let x = (y * 3) % 7; x < W; x += 7) if (r() < 0.6) R(x, y, 2, 1, '#c8d888');
      for (let x = 0; x < W; x += 32) {
        R(x, 2, 3, 16, '#8a6a4a');
        R(x, 2, 3, 1, '#b08a5a');
      }
      R(0, 6, W, 1, '#8a6a4a');
      R(0, 11, W, 1, '#8a6a4a');
    });
    this.layers.cloud = strip(W, 40, 41, (r) => {
      for (let i = 0; i < 9; i++) {
        const cx = r() * W;
        const cy = 8 + r() * 24;
        for (let j = 0; j < 4; j++) ell(cx + j * 7 - 10, cy + Math.sin(j) * 2, 8 + r() * 4, 5, '#ffffff');
        R(cx - 14, cy + 2, 32, 3, '#f0eaf6');
      }
    });
  }

  private buildSign(): HTMLCanvasElement {
    const s: Spr = mkSpr(150, 74, () => {
      R(18, 44, 4, 30, '#6a4a3a');
      R(128, 44, 4, 30, '#6a4a3a');
      RR(0, 0, 150, 50, 3, '#2f6a5a');
      RR(2, 2, 146, 46, 2, '#3f8a6a');
      R(4, 4, 142, 1, '#5aaa8a');
      TC('WELCOME TO', 75, 6, '#fbf0d9', undefined, {});
      TC('TURNBUCKLE ALLEY', 75, 16, '#f6d38a', undefined, { bold: true, shadow: AK });
      TC('Home of the Velvet Hammers', 75, 28, '#fbf0d9');
      TC('Pop. 2,814', 75, 38, '#cfe8d8');
      // A little star sticker someone added.
      circ(138, 10, 4, '#f4b63f');
      void T;
    });
    return toCanvas(OUT(s, selA));
  }

  private finish(): void {
    if (this.done) return;
    this.done = true;
    game.scenes.transition(() => this.onDone());
  }

  update(dt: number): void {
    this.t += dt;
    if (game.input.consume('interact') && this.t > 2) this.finish();
    const captions: [number, string][] = [
      [0.5, 'Route 9 · The City → Turnbuckle Alley'],
      [5, 'Mile 40. The city gives up.'],
      [10, 'Mile 120. Cows. Lots of cows.'],
      [15, "Mile 190. Something about the light changes."],
      [20, ''],
    ];
    let idx = -1;
    for (let i = 0; i < captions.length; i++) if (this.t >= captions[i][0]) idx = i;
    if (idx !== this.shown) {
      this.shown = idx;
      this.caption.textContent = idx >= 0 ? captions[idx][1] : '';
      this.caption.classList.remove('show');
      void this.caption.offsetWidth;
      if (idx >= 0 && captions[idx][1]) this.caption.classList.add('show');
    }
    if (this.t > DURATION + 1.5) this.finish();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { w, h } = game.screen;
    const k = Math.min(1, this.t / DURATION);
    // Sky: dawn gray → blue → golden hour.
    const top = k < 0.4 ? mixc('#7a84a8', '#6aa8e0', k / 0.4) : mixc('#6aa8e0', '#f08a6a', (k - 0.4) / 0.6);
    const bottom = k < 0.4 ? mixc('#c8c0c8', '#cfe8f6', k / 0.4) : mixc('#cfe8f6', '#ffd08a', (k - 0.4) / 0.6);
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    const toHex = (n: number) => '#' + [n & 255, (n >> 8) & 255, (n >> 16) & 255].map((v) => v.toString(16).padStart(2, '0')).join('');
    g.addColorStop(0, toHex(top));
    g.addColorStop(1, toHex(bottom));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Sun
    const sunX = w * (0.2 + k * 0.6);
    const sunY = h * (0.5 - Math.sin(k * Math.PI) * 0.32 + k * 0.12);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = k > 0.6 ? '#ffd890' : '#fff8e0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = k > 0.6 ? '#ffb070' : '#fffbe8';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 11, 0, Math.PI * 2);
    ctx.fill();
    const speed = this.t;
    const tile = (img: HTMLCanvasElement, y: number, rate: number, alpha = 1) => {
      ctx.globalAlpha = alpha;
      const off = Math.floor((speed * rate) % img.width);
      for (let x = -off; x < w; x += img.width) ctx.drawImage(img, x, Math.round(y));
      ctx.globalAlpha = 1;
    };
    tile(this.layers.cloud, h * 0.06, 6, 0.85);
    const horizon = h * 0.62;
    // City fades out over the first third.
    if (k < 0.45) tile(this.layers.city, horizon - 90, 10, Math.max(0, 1 - k / 0.4));
    tile(this.layers.hills, horizon - 64, 18, Math.min(1, k * 2.5));
    tile(this.layers.mid, horizon - 72, 40, Math.min(1, Math.max(0, (k - 0.15) * 3)));
    ctx.fillStyle = k < 0.3 ? '#8a8a9a' : '#7a9a5a';
    ctx.fillRect(0, horizon, w, h - horizon);
    tile(this.layers.near, horizon, 110);
    // Road
    ctx.fillStyle = '#5a5468';
    ctx.fillRect(0, horizon + 38, w, h - horizon - 38);
    ctx.fillStyle = '#f6d38a';
    const dash = Math.floor((speed * 160) % 40);
    for (let x = -dash; x < w; x += 40) ctx.fillRect(x, horizon + 50, 18, 2);
    // Golden-hour wash.
    if (k > 0.55) {
      ctx.globalAlpha = (k - 0.55) * 0.5;
      ctx.fillStyle = '#ff9a5a';
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    // The town sign slides in at the end and the bus slows.
    if (this.t > DURATION - 5) {
      const s = Math.min(1, (this.t - (DURATION - 5)) / 4);
      const ease = 1 - Math.pow(1 - s, 3);
      const sx = w + 20 - ease * (w * 0.5 + this.sign.width / 2 + 20);
      ctx.drawImage(this.sign, Math.round(sx), Math.round(horizon - this.sign.height + 24));
    }
    // Bus window frame (cached per size).
    const key = `${w}x${h}`;
    if (this.frameKey !== key) {
      this.frameKey = key;
      this.frame = this.buildFrame(w, h);
    }
    ctx.drawImage(this.frame!, 0, 0);
    // A gentle road bob.
    void hash2;
  }

  private buildFrame(w: number, h: number): HTMLCanvasElement {
    return toCanvas(
      mkSpr(w, h, () => {
        const wall = '#3a4a6a';
        const m = Math.round(Math.min(w, h) * 0.07);
        // Body of the bus around the window.
        R(0, 0, w, m, wall);
        R(0, h - m * 1.6, w, m * 1.6, wall);
        R(0, 0, m, h, wall);
        R(w - m, 0, m, h, wall);
        // Window rubber and highlight.
        R(m - 2, m - 2, w - m * 2 + 4, 2, AK);
        R(m - 2, h - m * 1.6, w - m * 2 + 4, 2, AK);
        R(m - 2, m, 2, h - m * 2.6, AK);
        R(w - m, m, 2, h - m * 2.6, AK);
        R(m + 4, m + 4, 30, 1, '#ffffff');
        R(m + 4, m + 4, 1, 12, '#ffffff');
        // Seat back in the bottom-left corner.
        RR(m - 10, h - m * 1.6 - 22, 70, 40, 4, '#b0453f');
        R(m - 8, h - m * 1.6 - 20, 66, 3, '#d0655f');
        // A duffel bag on the seat.
        RR(m + 48, h - m * 1.6 - 14, 44, 18, 4, '#2fa59a');
        R(m + 58, h - m * 1.6 - 18, 24, 5, '#1d6e6b');
        R(m + 50, h - m * 1.6 - 8, 40, 1, '#5ac8bd');
        // Wall rivets.
        for (let x = m; x < w - m; x += 24) R(x, h - m * 0.7, 2, 2, '#5a6a8a');
      }),
    );
  }
}
