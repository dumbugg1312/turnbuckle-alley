/** Tiny DOM helpers for the UI layer. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | ((e: Event) => void)> | string = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (typeof attrs === 'string') e.className = attrs;
  else
    for (const [k, v] of Object.entries(attrs)) {
      if (typeof v === 'function') e.addEventListener(k.replace(/^on/, '').toLowerCase(), v as EventListener);
      else if (k === 'class') e.className = String(v);
      else if (k === 'html') e.innerHTML = String(v);
      else if (k === 'text') e.textContent = String(v);
      else if (k === 'style') e.setAttribute('style', String(v));
      else if (v === false) continue;
      else if (v === true) e.setAttribute(k, '');
      else e.setAttribute(k, String(v));
    }
  for (const c of children) if (c !== null && c !== undefined && c !== false) e.append(c);
  return e;
}

export function uiRoot(): HTMLElement {
  return document.getElementById('ui')!;
}

export function clear(node: HTMLElement): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Escape text for innerHTML. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Light markup: *red emphasis*, **bold teal**, newlines kept. */
export function markup(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Set --u from viewport size so UI stays legible on phones and huge on nothing. */
export function updateUiScale(): void {
  const h = window.innerHeight;
  const w = window.innerWidth;
  let u = Math.min(Math.max(h / 300, 1.3), 2.6);
  // Portrait phones are narrow but tall: allow a slightly larger scale so text stays legible.
  u = Math.min(u, w / (w < h ? 300 : 400));
  document.documentElement.style.setProperty('--u', `${u.toFixed(3)}px`);
}
