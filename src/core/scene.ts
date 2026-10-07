/**
 * Scenes are the top-level modes of the game (title, town, match, dungeon...).
 * The manager keeps a stack so overlays like a match can be pushed on top of
 * the world and popped back off.
 */
export interface Scene {
  /** Called when the scene becomes active (pushed or uncovered). */
  enter?(): void;
  /** Called when the scene is removed. */
  exit?(): void;
  /** Called when another scene is pushed on top. */
  pause?(): void;
  /** Called when the scene above is popped. */
  resume?(): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  /** True if scenes below should still render (transparent overlays). */
  transparent?: boolean;
}

export class SceneManager {
  stack: Scene[] = [];
  private fade = 0; // 0 clear .. 1 black
  private fadeDir = 0;
  private pending: (() => void) | null = null;
  fadeColor = '#0b0712';

  get top(): Scene | undefined {
    return this.stack[this.stack.length - 1];
  }

  push(s: Scene): void {
    this.top?.pause?.();
    this.stack.push(s);
    s.enter?.();
  }

  pop(): Scene | undefined {
    const s = this.stack.pop();
    s?.exit?.();
    this.top?.resume?.();
    return s;
  }

  replace(s: Scene): void {
    const old = this.stack.pop();
    old?.exit?.();
    this.stack.push(s);
    s.enter?.();
  }

  /** Replace the whole stack. */
  reset(s: Scene): void {
    while (this.stack.length) this.stack.pop()?.exit?.();
    this.stack.push(s);
    s.enter?.();
  }

  /** Fade to black, run the change, fade back in. */
  transition(change: () => void, color = '#0b0712'): boolean {
    // Already fading out toward another change: drop this one (callers that
    // hold a flag, like a warp in progress, must use the return value).
    if (this.pending) return false;
    this.fadeColor = color;
    this.pending = change;
    this.fadeDir = 1;
    return true;
  }

  get transitioning(): boolean {
    return this.fadeDir !== 0;
  }

  update(dt: number): void {
    if (this.fadeDir !== 0) {
      this.fade += this.fadeDir * dt * 3.2;
      if (this.fadeDir > 0 && this.fade >= 1) {
        this.fade = 1;
        const p = this.pending;
        this.pending = null;
        p?.();
        this.fadeDir = -1;
      } else if (this.fadeDir < 0 && this.fade <= 0) {
        this.fade = 0;
        this.fadeDir = 0;
      }
      return;
    }
    this.top?.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Render from the lowest opaque scene upward.
    let start = this.stack.length - 1;
    while (start > 0 && this.stack[start].transparent) start--;
    for (let i = Math.max(0, start); i < this.stack.length; i++) this.stack[i].render(ctx);
    if (this.fade > 0) {
      ctx.globalAlpha = Math.min(1, this.fade);
      ctx.fillStyle = this.fadeColor;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
  }
}
