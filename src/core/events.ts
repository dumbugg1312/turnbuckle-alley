type Handler<T> = (payload: T) => void;

/** Minimal typed event bus. */
export class Emitter<Events extends Record<string, unknown>> {
  private handlers: { [K in keyof Events]?: Handler<Events[K]>[] } = {};
  on<K extends keyof Events>(type: K, h: Handler<Events[K]>): () => void {
    (this.handlers[type] ??= []).push(h);
    return () => this.off(type, h);
  }
  off<K extends keyof Events>(type: K, h: Handler<Events[K]>): void {
    const list = this.handlers[type];
    if (list) this.handlers[type] = list.filter((x) => x !== h);
  }
  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    for (const h of this.handlers[type] ?? []) h(payload);
  }
}
