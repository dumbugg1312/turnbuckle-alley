/** Small helpers for writing song data. Pure string functions. */
import { transposeChords, transposeNotes } from '../notation';

export const tr = transposeNotes;
export const trc = transposeChords;

/** A full bar of rest in the given meter. */
export function restBar(meter: number): string {
  if (meter === 4) return 'rw';
  if (meter === 3) return 'rh.';
  if (meter === 2) return 'rh';
  return Array.from({ length: meter }, () => 'rq').join(' ');
}

/** Split a bar-lined note string into bars. */
export function barsOf(mel: string): string[] {
  return mel.split('|').map((b) => b.trim()).filter(Boolean);
}

/** Keep only the listed bars (0-based) of a melody, resting through the others. */
export function onlyBars(mel: string, keep: (i: number) => boolean, meter = 4): string {
  return barsOf(mel)
    .map((b, i) => (keep(i) ? b : restBar(meter)))
    .join(' | ');
}

/** Bars from..to (0-based, end exclusive) of a melody or chord string. */
export function slice(src: string, from: number, to?: number): string {
  return barsOf(src).slice(from, to).join(' | ');
}

/** n bars of rest. */
export function rests(n: number, meter = 4): string {
  return Array.from({ length: n }, () => restBar(meter)).join(' | ');
}

/** Join several bar-lined strings into one. */
export function join(...parts: string[]): string {
  return parts.filter(Boolean).join(' | ');
}
