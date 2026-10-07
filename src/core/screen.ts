/**
 * Pixel-perfect screen. The game draws into a low-resolution "native" buffer,
 * which is scaled by a whole-number factor onto the visible canvas. The native
 * size adapts to the device so phones, iPads and desktops all fill the screen
 * without stretching pixels (see DECISIONS.md D-002).
 */
export const TARGET_NATIVE_H = 220;

export class Screen {
  readonly canvas: HTMLCanvasElement;
  private readonly out: CanvasRenderingContext2D;
  readonly buffer: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  /** Native (game pixel) dimensions. */
  w = 384;
  h = 216;
  /** Device pixels per native pixel. */
  scale = 1;
  /** Device pixel ratio used for the visible canvas. */
  dpr = 1;
  private resizeHandlers: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.out = canvas.getContext('2d', { alpha: false })!;
    this.buffer = document.createElement('canvas');
    this.ctx = this.buffer.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.resize());
  }

  onResize(fn: () => void): void {
    this.resizeHandlers.push(fn);
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    // A zero-size window (page loaded in a hidden pane/iframe, iOS mid-rotation)
    // would make every buffer 0x0 and crash the first drawImage. Fall back to a
    // sane size; the next real resize event corrects it.
    const cssW = window.innerWidth > 0 ? window.innerWidth : 960;
    const cssH = window.innerHeight > 0 ? window.innerHeight : 540;
    const devW = Math.round(cssW * this.dpr);
    const devH = Math.round(cssH * this.dpr);
    this.scale = Math.max(1, Math.floor(devH / TARGET_NATIVE_H));
    // Very wide or very narrow screens: keep at least ~300 native pixels across.
    while (this.scale > 1 && devW / this.scale < 300) this.scale--;
    this.w = Math.ceil(devW / this.scale);
    this.h = Math.ceil(devH / this.scale);
    this.canvas.width = devW;
    this.canvas.height = devH;
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.buffer.width = this.w;
    this.buffer.height = this.h;
    this.ctx.imageSmoothingEnabled = false;
    this.out.imageSmoothingEnabled = false;
    document.documentElement.style.setProperty('--px', `${this.scale / this.dpr}px`);
    for (const fn of this.resizeHandlers) fn();
  }

  present(): void {
    this.out.imageSmoothingEnabled = false;
    this.out.drawImage(this.buffer, 0, 0, this.w * this.scale, this.h * this.scale);
  }

  /** Convert a client (CSS pixel) coordinate to native pixels. */
  toNative(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const px = ((clientX - rect.left) * this.dpr) / this.scale;
    const py = ((clientY - rect.top) * this.dpr) / this.scale;
    return { x: px, y: py };
  }

  /** CSS pixels per native pixel (for positioning DOM over the canvas). */
  get cssPerNative(): number {
    return this.scale / this.dpr;
  }
}
