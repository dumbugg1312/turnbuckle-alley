import { describe, expect, it } from 'vitest';
import { DIALOGUE } from '../src/data/dialogue';
import type { DialogueSet, Line } from '../src/data/dialogue/types';
import { ITEMS } from '../src/data/items';

/**
 * Guards against the cast sliding back into the same handful of tics: everyone
 * saying "don't tell", everything happening eleven times, birthday thanks from
 * one template, "It's not X. It's Y.", season lines written as lists, and
 * lines that end on a moral. Also checks that memory placeholders are only
 * used where the data exists, and that every character has the per-person
 * pieces the talk flow relies on.
 *
 * Counting reads the source text of every dialogue file and the main story,
 * so heart-event scripts and phone calls count too.
 */

const CHAR_SRC = import.meta.glob<string>('../src/data/dialogue/chars/*.ts', { query: '?raw', import: 'default', eager: true });
const STORY_SRC = import.meta.glob<string>(['../src/story-main/*.ts', '../src/story-main/chapters/*.ts'], { query: '?raw', import: 'default', eager: true });

/** Every string literal in a TypeScript source file (comments skipped). */
function strings(src: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === '/' && n === '/') {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (c === '/' && n === '*') {
      i = src.indexOf('*/', i + 2);
      if (i < 0) break;
      i += 2;
    } else if (c === '"' || c === "'" || c === '`') {
      let s = '';
      i++;
      while (i < src.length && src[i] !== c) {
        if (src[i] === '\\') {
          s += src[i + 1];
          i += 2;
        } else {
          s += src[i];
          i++;
        }
      }
      out.push(s);
      i++;
    } else i++;
  }
  return out;
}

const charText: Record<string, string[]> = Object.fromEntries(Object.entries(CHAR_SRC).map(([f, src]) => [f.split('/').pop()!.replace('.ts', ''), strings(src)]));
const storyText: string[] = Object.values(STORY_SRC).flatMap(strings);
/** gossip.ts, handwritten.ts: shared tables of lines. */
const SHARED_SRC = import.meta.glob<string>('../src/data/dialogue/*.ts', { query: '?raw', import: 'default', eager: true });
const sharedText: string[] = Object.entries(SHARED_SRC).filter(([f]) => !f.endsWith('types.ts')).flatMap(([, src]) => strings(src));
const allText = [...Object.values(charText).flat(), ...storyText, ...sharedText];

const count = (texts: string[], re: RegExp) => texts.reduce((n, t) => n + (t.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))?.length ?? 0), 0);
const hits = (texts: string[], re: RegExp) => texts.filter((t) => re.test(t));

const DONT_TELL = /\bdon'?t tell\b/i;
const ELEVEN = /\beleven\b/i;
const REMEMBERED = /\byou remembered\b/i;
const NOT_CRYING = /\bI'?m not crying\b/i;
const NOT_X_ITS_Y = /\b(It's|It is|That's|That is) not [^.!?]{1,60}[.!?]\s+(It's|It is|That's|That is)\b/;
const SEASON_LIST = /^(Spring|Summer|Fall|Autumn|Winter)[.!:]\s+[^.!?]*,[^.!?]*,/;
/** The last sentence of a line sounds like a lesson. */
const lastSentence = (t: string) => t.trim().replace(/[)"'*]+$/, '').split(/(?<=[.!?])\s+/).pop() ?? '';
const MORAL = [
  // "That's the whole job." "That's the part folks remember." "That's how you know."
  /^(and |but )?(that's|that is) (the|what|how|why|all)\b[^.!?]{0,48}[.!?]?$/i,
  /\bthe only (thing|number|score|one)s? that matters?\b/i,
  /\b(is|are) the whole (thing|business|job|point)\b/i,
  // "Every chair's a seat. Every seat's a person."
  /^every \w+('s| is) (a|an|the) \w+[.!]?$/i,
];
const isMoral = (t: string) => MORAL.some((re) => re.test(lastSentence(t)));

function lineTexts(ds: DialogueSet): { text: string; line: Line }[] {
  return ds.lines.flatMap((l) => (Array.isArray(l.text) ? l.text : [l.text]).map((text) => ({ text, line: l })));
}

describe('writing tics', () => {
  it('"don\'t tell" at most once per character', () => {
    const over = Object.entries(charText).filter(([, t]) => count(t, DONT_TELL) > 1).map(([c, t]) => `${c}: ${count(t, DONT_TELL)}`);
    expect(over, `too many "don't tell": ${over.join(', ')}`).toEqual([]);
    expect(count(storyText, DONT_TELL)).toBeLessThanOrEqual(6);
  });

  it('"eleven" is rare', () => {
    expect(count(allText, ELEVEN), hits(allText, ELEVEN).join('\n')).toBeLessThanOrEqual(6);
  });

  it('"You remembered" and "I\'m not crying" are rare', () => {
    expect(count(allText, REMEMBERED), hits(allText, REMEMBERED).join('\n')).toBeLessThanOrEqual(2);
    expect(count(allText, NOT_CRYING), hits(allText, NOT_CRYING).join('\n')).toBeLessThanOrEqual(1);
    expect(count(allText, /brain freeze/i)).toBeLessThanOrEqual(1);
  });

  it('few "It\'s not X. It\'s Y." lines', () => {
    expect(count(allText, NOT_X_ITS_Y), hits(allText, NOT_X_ITS_Y).join('\n')).toBeLessThanOrEqual(8);
  });

  it('no season lines written as lists', () => {
    const lists = Object.values(DIALOGUE).flatMap((ds) => lineTexts(ds).filter(({ text }) => SEASON_LIST.test(text)).map(({ text }) => `${ds.npc}: ${text}`));
    expect(lists).toEqual([]);
  });

  it('few lines end on a moral', () => {
    // Only the last box of a line, where a moral would land.
    const morals = Object.values(DIALOGUE).flatMap((ds) =>
      ds.lines.map((l) => (Array.isArray(l.text) ? l.text[l.text.length - 1] : l.text)).filter(isMoral).map((t) => `${ds.npc}: ${t}`),
    );
    expect(morals.length, morals.join("\n")).toBeLessThanOrEqual(3);
  });

  it('birthday replies belong to one person each', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const ds of Object.values(DIALOGUE)) {
      for (const b of ds.giftReplies.birthday ?? []) {
        const key = b.toLowerCase().replace(/[^a-z ]/g, '').slice(0, 40);
        if (seen.has(key)) dupes.push(`${ds.npc} and ${seen.get(key)}: ${b}`);
        seen.set(key, ds.npc);
      }
    }
    expect(dupes).toEqual([]);
  });
});

describe('memory and talk data', () => {
  const MATCH_KEYS = /\{(opponent|Opponent|opp|finisher|myFinisher|venue|stars)\}/;

  it('memory placeholders only appear on lines gated by the matching condition', () => {
    const bad: string[] = [];
    for (const ds of Object.values(DIALOGUE)) {
      for (const { text, line } of lineTexts(ds)) {
        if (MATCH_KEYS.test(text) && !line.when?.lastMatch) bad.push(`${ds.npc}: ${text}`);
        if (text.includes('{lastGift}') && !line.when?.giftedRecently) bad.push(`${ds.npc}: ${text}`);
        if (text.includes('{subject}') && !line.when?.news) bad.push(`${ds.npc}: ${text}`);
      }
      for (const t of [...(ds.again ?? []), ...(ds.idle ?? [])]) if (MATCH_KEYS.test(t) || t.includes('{lastGift}') || t.includes('{subject}')) bad.push(`${ds.npc} (again/idle): ${t}`);
    }
    expect(bad).toEqual([]);
  });

  it('everyone has second-talk lines and their own fallback lines', () => {
    const missing = Object.values(DIALOGUE).filter((ds) => (ds.again?.length ?? 0) < 3 || (ds.idle?.length ?? 0) < 2).map((ds) => ds.npc);
    expect(missing).toEqual([]);
  });

  it('every loved and liked gift gets its own reply', () => {
    const missing: string[] = [];
    for (const ds of Object.values(DIALOGUE)) {
      for (const id of [...ds.gifts.loves, ...ds.gifts.likes]) if (!ds.giftReplies.byItem?.[id]) missing.push(`${ds.npc}:${id}`);
    }
    expect(missing).toEqual([]);
  });

  it('gift ids exist and loves are personal', () => {
    const unknown = Object.values(DIALOGUE).flatMap((ds) => [...ds.gifts.loves, ...ds.gifts.likes, ...ds.gifts.dislikes, ...Object.keys(ds.giftReplies.byItem ?? {})].filter((id) => !ITEMS[id]).map((id) => `${ds.npc}:${id}`));
    expect(unknown).toEqual([]);
    const lovers = (id: string) => Object.values(DIALOGUE).filter((ds) => ds.gifts.loves.includes(id)).length;
    for (const id of Object.keys(ITEMS)) expect(lovers(id), `${id} is loved by too many people`).toBeLessThanOrEqual(6);
  });
});
