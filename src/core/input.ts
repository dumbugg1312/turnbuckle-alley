import type { Screen } from './screen';

/**
 * Unified input: keyboard plus pointer/touch. Scenes read held directions and
 * consume one-shot presses; taps on the canvas arrive in native coordinates.
 */
export type Action = 'up' | 'down' | 'left' | 'right' | 'interact' | 'cancel' | 'menu' | 'run';

const KEYMAP: Record<string, Action> = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyE: 'interact', Space: 'interact', Enter: 'interact', KeyZ: 'interact',
  Escape: 'cancel', KeyX: 'cancel', Backspace: 'cancel',
  Tab: 'menu', KeyI: 'menu', KeyM: 'menu',
  ShiftLeft: 'run', ShiftRight: 'run',
};

export interface Tap {
  x: number; // native
  y: number;
  clientX: number;
  clientY: number;
}

export class Input {
  private held = new Set<Action>();
  private pressed = new Set<Action>();
  private taps: Tap[] = [];
  /** Native position of an active pointer drag (held finger/mouse), if any. */
  pointer: { x: number; y: number; down: boolean; startedAt: number } = { x: 0, y: 0, down: false, startedAt: 0 };
  /** Last input device used, for showing touch or keyboard hints. */
  lastDevice: 'touch' | 'keyboard' | 'mouse' = 'mouse';
  private listeners: ((key: string, code: string) => void)[] = [];
  enabled = true;

  constructor(screen: Screen) {
    window.addEventListener('keydown', (e) => {
      this.lastDevice = 'keyboard';
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      for (const l of this.listeners) l(e.key, e.code);
      const a = KEYMAP[e.code];
      if (a) {
        if (!this.held.has(a)) this.pressed.add(a);
        this.held.add(a);
        if (e.code === 'Tab' || e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      const a = KEYMAP[e.code];
      if (a) this.held.delete(a);
    });
    window.addEventListener('blur', () => this.held.clear());

    const c = screen.canvas;
    c.addEventListener('pointerdown', (e) => {
      this.lastDevice = e.pointerType === 'touch' ? 'touch' : 'mouse';
      const p = screen.toNative(e.clientX, e.clientY);
      this.pointer = { x: p.x, y: p.y, down: true, startedAt: performance.now() };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.pointer.down) return;
      const p = screen.toNative(e.clientX, e.clientY);
      this.pointer.x = p.x;
      this.pointer.y = p.y;
    });
    const end = (e: PointerEvent) => {
      if (!this.pointer.down) return;
      this.pointer.down = false;
      const p = screen.toNative(e.clientX, e.clientY);
      if (performance.now() - this.pointer.startedAt < 450) {
        this.taps.push({ x: p.x, y: p.y, clientX: e.clientX, clientY: e.clientY });
      }
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', () => (this.pointer.down = false));
    c.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Subscribe to raw key presses (for text entry style UIs). */
  onKey(fn: (key: string, code: string) => void): () => void {
    this.listeners.push(fn);
    return () => (this.listeners = this.listeners.filter((l) => l !== fn));
  }

  isHeld(a: Action): boolean {
    return this.enabled && this.held.has(a);
  }

  /** True once per key press. */
  consume(a: Action): boolean {
    if (!this.enabled) return false;
    if (this.pressed.has(a)) {
      this.pressed.delete(a);
      return true;
    }
    return false;
  }

  /** Press an action programmatically (on-screen buttons). */
  press(a: Action): void {
    this.pressed.add(a);
  }

  takeTaps(): Tap[] {
    const t = this.taps;
    this.taps = [];
    return this.enabled ? t : [];
  }

  /** Held direction as a vector from keyboard. */
  moveVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.isHeld('left')) x -= 1;
    if (this.isHeld('right')) x += 1;
    if (this.isHeld('up')) y -= 1;
    if (this.isHeld('down')) y += 1;
    if (x && y) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }

  /** Clear transient presses (call at end of frame). */
  endFrame(): void {
    this.pressed.clear();
  }

  clear(): void {
    this.pressed.clear();
    this.taps = [];
  }
}
