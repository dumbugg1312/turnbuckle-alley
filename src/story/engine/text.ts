/**
 * Template rendering for storyline text (see the header of ../types.ts).
 */
import type { Rng } from '../../core/rng';
import { fmt } from '../../ui/text';
import { finisherOf, nameOf, pronounsOf, realOf, sideName, signatureOf } from './cast';

export interface RenderCtx {
  /** role key -> character id (or several ids for a team). */
  cast: Record<string, string | string[]>;
  globals?: Record<string, string>;
  rng: Rng;
}

const TOKEN = /\{([A-Za-z_@][A-Za-z0-9_@]*)(?:\.([A-Za-z]+))?\}/g;

function pickAlternations(tpl: string, rng: Rng): string {
  // Innermost first so nested alternations work.
  let out = tpl;
  for (let guard = 0; guard < 8 && out.includes('[['); guard++) {
    out = out.replace(/\[\[([^[\]]*)\]\]/g, (_m, body: string) => {
      const opts = body.split('|');
      return opts[Math.floor(rng.next() * opts.length)] ?? '';
    });
  }
  return out;
}

function fieldFor(ids: string[], field: string | undefined): string {
  if (!ids.length) return 'someone';
  if (!field) return sideName(ids);
  const id = ids[0];
  const multi = ids.length > 1;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const lower = field.toLowerCase();
  let v: string;
  switch (lower) {
    case 'real': v = multi ? ids.map(realOf).join(' and ') : realOf(id); break;
    case 'name': v = sideName(ids); break;
    case 'finisher': v = finisherOf(id); break;
    case 'signature': v = signatureOf(id); break;
    case 'they': v = multi ? 'they' : pronounsOf(id).they; break;
    case 'them': v = multi ? 'them' : pronounsOf(id).them; break;
    case 'their': v = multi ? 'their' : pronounsOf(id).their; break;
    case 'theirs': v = multi ? 'theirs' : pronounsOf(id).theirs; break;
    default: v = sideName(ids);
  }
  return field[0] === field[0].toUpperCase() && field[0] !== field[0].toLowerCase() ? cap(v) : v;
}

/** Capitalise the first letter of each sentence. */
export function sentenceCase(s: string): string {
  return s.replace(/(^|(?<!\b(?:vs|Dr|Mr|Mrs|Ms|St))[.!?]["”']?\s+|^["“'])([a-z])/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
}

export function render(tpl: string, ctx: RenderCtx): string {
  let out = pickAlternations(tpl, ctx.rng);
  out = out.replace(TOKEN, (m, key: string, field: string | undefined) => {
    const g = ctx.globals?.[key];
    if (g !== undefined && !field) return g;
    const v = ctx.cast[key];
    if (v === undefined || (Array.isArray(v) && !v.length)) return g ?? m;
    return fieldFor(Array.isArray(v) ? v : [v], field);
  });
  // Player-facing placeholders ({name}, {ring}) from the dialogue system.
  out = fmt(out);
  return sentenceCase(out.replace(/\s+/g, ' ').trim());
}

/** Render one of several variants. */
export function renderOne(variants: readonly string[] | undefined, ctx: RenderCtx, fallback = ''): string {
  if (!variants || !variants.length) return fallback ? render(fallback, ctx) : '';
  return render(variants[Math.floor(ctx.rng.next() * variants.length)], ctx);
}

/** Render a variant that doesn't need a result ({winner}/{loser}); used before a match happens. */
export function renderPre(variants: readonly string[] | undefined, ctx: RenderCtx, fallback = ''): string {
  const ok = (variants ?? []).filter((v) => !/\{(winner|loser)/i.test(v));
  return renderOne(ok, ctx, fallback);
}

/** Does a template reference any of these role keys? */
export function mentionsRoles(tpl: string): string[] {
  const out: string[] = [];
  for (const m of tpl.matchAll(TOKEN)) out.push(m[1]);
  return out;
}

/** Name for display, capitalised. */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { nameOf };
