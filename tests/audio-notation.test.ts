import { describe, expect, it } from 'vitest';
import { INSTRUMENTS } from '../src/audio/instruments';
import {
  compileSong,
  expandRepeats,
  noteToMidi,
  parseChord,
  parseChords,
  parseDrums,
  parseNotes,
  songSeconds,
  transposeNotes,
  voiceChord,
} from '../src/audio/notation';
import { generateTheme, THEME_STYLES } from '../src/audio/procedural';
import { allSongs, CHARACTER_IDS, STINGERS } from '../src/audio/songs';

describe('notation basics', () => {
  it('reads pitches and durations', () => {
    expect(noteToMidi('C4')).toBe(60);
    expect(noteToMidi('Bb3')).toBe(58);
    const { events, beats } = parseNotes('C4q D4e E4 F#4h | G4w', 4);
    expect(beats).toBe(8);
    expect(events.map((e) => e.n[0])).toEqual([60, 62, 64, 66, 67]);
    expect(events[2].d).toBe(0.5); // sticky duration
  });

  it('handles ties, rests, chords, dots and triplets', () => {
    const { events, beats } = parseNotes('C5q. D5e -q rq | (C4 E4 G4)h E5e3 F5e3 G5e3 rq', 4);
    expect(beats).toBeCloseTo(8);
    expect(events[1].d).toBe(1.5);
    expect(events[2].n).toEqual([60, 64, 67]);
    expect(events[3].d).toBeCloseTo(1 / 3);
  });

  it('rejects bars of the wrong length', () => {
    expect(() => parseNotes('C4q D4q E4q | F4w', 4)).toThrow(/bar 1/);
  });

  it('expands repeats', () => {
    expect(expandRepeats('[a b]*2 c*3')).toEqual(['a', 'b', 'a', 'b', 'c', 'c', 'c']);
    expect(expandRepeats('[[x]*2 y]*2')).toEqual(['x', 'x', 'y', 'x', 'x', 'y']);
  });

  it('parses chords and progressions', () => {
    expect(parseChord('G/B').bass).toBe(11);
    expect(parseChord('F#m7b5').iv).toEqual([0, 3, 6, 10]);
    const p = parseChords('C | Am F | % | G:3 G7:1', 4);
    expect(p.beats).toBe(16);
    expect(p.spans.map((s) => s.chord.sym)).toEqual(['C', 'Am', 'F', 'Am', 'F', 'G', 'G7']);
    expect(voiceChord(parseChord('Cmaj7'), 62, null).length).toBe(4);
  });

  it('parses drum grids', () => {
    expect(parseDrums('k.h.s.h.k.h.s.h.|kkkkssssmmmmtttt', 4).events.length).toBe(24);
    expect(parseDrums('/8 k.s.k.s.', 4).events.length).toBe(4);
    expect(() => parseDrums('k.h.s.h.|kkkk', 4)).toThrow(/steps/);
  });

  it('transposes explicit notes', () => {
    expect(transposeNotes('C4q E4e G4e', 2)).toBe('D4q F#4e A4e');
  });
});

describe('the soundtrack', () => {
  const songs = allSongs();

  it('has every required song id', () => {
    const ids = new Set(songs.map((s) => s.id));
    const required = [
      'title', 'city', 'bus', 'town', 'town-evening', 'night', 'home', 'diner', 'sportatorium', 'show', 'match',
      'victory', 'match-end', 'dungeon', 'workout', 'tapes', 'creator', 'fair', 'rain', 'sad', 'ending', 'credits',
    ];
    for (const id of required) expect(ids.has(id), id).toBe(true);
    for (const c of CHARACTER_IDS) {
      expect(ids.has(`theme:${c}`), `theme:${c}`).toBe(true);
      expect(ids.has(`theme:${c}:town`), `theme:${c}:town`).toBe(true);
    }
  });

  for (const song of allSongs()) {
    it(`compiles ${song.id}`, () => {
      for (const t of Object.values(song.tracks)) expect(INSTRUMENTS[t.inst], `${song.id} instrument ${t.inst}`).toBeTruthy();
      const c = compileSong(song);
      expect(c.loopBeats + c.introBeats).toBeGreaterThan(0);
      const notes = c.tracks.reduce((n, t) => n + t.intro.length + t.loop.length, 0);
      expect(notes).toBeGreaterThan(4);
      // Every pitch should be in a sane range for little speakers.
      for (const t of c.tracks) {
        if (t.drums) continue;
        for (const e of [...t.intro, ...t.loop]) {
          for (const n of e.n) {
            expect(n, `${song.id}.${t.name} pitch`).toBeGreaterThanOrEqual(28);
            expect(n, `${song.id}.${t.name} pitch`).toBeLessThanOrEqual(100);
          }
        }
      }
    });
  }

  it('loops are long enough not to grate', () => {
    const short: string[] = [];
    for (const s of songs) {
      if (s.loop === false) continue;
      if (s.id.startsWith('theme:') || s.id === 'victory') continue;
      const c = compileSong(s);
      if ((c.loopBeats * 60) / c.bpm < 55) short.push(`${s.id} ${((c.loopBeats * 60) / c.bpm).toFixed(0)}s`);
    }
    expect(short).toEqual([]);
  });

  it('stingers are short one-shots', () => {
    for (const s of STINGERS) {
      const c = compileSong(s);
      expect(c.loop).toBe(false);
      expect(songSeconds(c)).toBeLessThan(8);
    }
  });
});

describe('procedural entrance themes', () => {
  it('every style compiles across tempos and seeds', () => {
    for (const style of THEME_STYLES) {
      for (const tempo of [70, 120, 180]) {
        for (const seed of [1, 42, 9999, 123456]) {
          const def = generateTheme({ style, tempo, seed });
          const c = compileSong(def);
          expect(c.loopBeats).toBeGreaterThan(0);
        }
      }
    }
  });

  it('is deterministic per seed and varies across seeds', () => {
    const a = JSON.stringify(generateTheme({ style: 'rock', tempo: 140, seed: 7 }));
    const b = JSON.stringify(generateTheme({ style: 'rock', tempo: 140, seed: 7 }));
    const c = JSON.stringify(generateTheme({ style: 'rock', tempo: 140, seed: 8 }));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('falls back for unknown styles', () => {
    expect(() => compileSong(generateTheme({ style: 'polka?', tempo: 0, seed: -3 }))).not.toThrow();
  });
});
