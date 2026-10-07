import type { Paper } from '../story/api';

/**
 * While the new-day hooks run after sleeping, things that used to open one
 * modal after another (the Tattler, a line about the night) collect here
 * instead, and the breakfast table shows them together.
 */
export interface MorningBundle {
  paper: Paper | null;
  /** Things you half heard around dawn, from surprises.ts. */
  overnight: string[];
}

let collecting = false;
let bundle: MorningBundle = { paper: null, overnight: [] };

export function beginMorning(): void {
  collecting = true;
  bundle = { paper: null, overnight: [] };
}

/** True while the morning hooks run (so systems hand things over instead of showing them). */
export function morningCollecting(): boolean {
  return collecting;
}

export function morningBundle(): MorningBundle {
  return bundle;
}

export function endMorning(): void {
  collecting = false;
}

export function morningPaper(p: Paper): void {
  bundle.paper = p;
}

export function morningOvernight(line: string): void {
  if (!bundle.overnight.includes(line)) bundle.overnight.push(line);
}
