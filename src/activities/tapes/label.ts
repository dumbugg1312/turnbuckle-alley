import { hashString } from '../../core/rng';

/**
 * Hand-lettered Sharpie labels: each glyph gets its own wobble, tilt and
 * weight, drawn with a chunky pixel font so it still matches the game.
 */
const cache = new Map<string, HTMLCanvasElement>();

function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface LabelOpts {
  width: number; // css-ish px of the label strip at scale 1
  height: number;
  ink?: string;
  paper?: string | null;
  /** Max lines to wrap into. */
  lines?: number;
  font?: number;
}

/** Draw a hand-written label into a fresh canvas (scale = device pixels per unit). */
export function sharpieLabel(text: string, o: LabelOpts, scale = 2): HTMLCanvasElement {
  const key = `${text}|${o.width}|${o.height}|${o.ink}|${o.paper}|${o.lines}|${o.font}|${scale}`;
  let src = cache.get(key);
  if (!src) {
    src = drawLabel(text, o, scale);
    cache.set(key, src);
  }
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  return c;
}

function drawLabel(text: string, o: LabelOpts, scale: number): HTMLCanvasElement {
  const W = Math.round(o.width * scale);
  const H = Math.round(o.height * scale);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const rnd = seeded(hashString(text));
  if (o.paper) {
    // Slightly crooked sticker with a torn edge.
    x.fillStyle = o.paper;
    x.beginPath();
    x.moveTo(1 * scale, 1.5 * scale);
    for (let i = 0; i <= 8; i++) x.lineTo((i / 8) * (W - 2 * scale) + scale, scale * (0.5 + rnd() * 1.4));
    x.lineTo(W - scale * 0.5, H - scale * (1 + rnd()));
    for (let i = 8; i >= 0; i--) x.lineTo((i / 8) * (W - 2 * scale) + scale, H - scale * (0.4 + rnd() * 1.2));
    x.closePath();
    x.fill();
    x.fillStyle = 'rgba(120, 90, 50, 0.10)';
    for (let i = 0; i < 6; i++) x.fillRect(rnd() * W, rnd() * H, scale * (2 + rnd() * 6), scale);
  }
  const ink = o.ink ?? '#1e1426';
  const maxLines = o.lines ?? 2;
  let size = (o.font ?? Math.min(o.height / (maxLines * 1.15), 11)) * scale;
  x.textBaseline = 'middle';
  const pad = 3 * scale;
  const fit = (sz: number): string[] => {
    x.font = `600 ${sz}px 'Pixelify Sans', ui-rounded, sans-serif`;
    const words = text.split(/\s+/);
    const out: string[] = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (x.measureText(t).width * 1.04 > W - pad * 2 && cur) {
        out.push(cur);
        cur = w;
      } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  };
  let lines = fit(size);
  while ((lines.length > maxLines || lines.some((l) => x.measureText(l).width * 1.04 > W - pad * 2)) && size > 5 * scale) {
    size -= 0.5 * scale;
    lines = fit(size);
  }
  const lh = size * 1.08;
  const total = lines.length * lh;
  const slant = (rnd() - 0.5) * 0.06;
  lines.forEach((line, li) => {
    const lw = x.measureText(line).width * 1.04;
    let cx = W / 2 - lw / 2 + (rnd() - 0.5) * 3 * scale;
    const cy = H / 2 - total / 2 + lh * (li + 0.5);
    for (const ch of line) {
      const w = x.measureText(ch).width;
      x.save();
      x.translate(cx + w / 2, cy + (rnd() - 0.5) * size * 0.14 + (cx - W / 2) * slant);
      x.rotate((rnd() - 0.5) * 0.16);
      const s = 0.92 + rnd() * 0.16;
      x.scale(s, s);
      x.fillStyle = ink;
      x.globalAlpha = 0.86 + rnd() * 0.14;
      // Marker weight: draw a few offset passes.
      for (const [dx, dy] of [[0, 0], [0.35, 0.2], [-0.2, 0.3]]) x.fillText(ch, -w / 2 + dx * scale, dy * scale);
      x.restore();
      cx += w * 1.04;
    }
  });
  return c;
}
