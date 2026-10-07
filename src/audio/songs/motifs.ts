/**
 * The shared melodic material of Turnbuckle Alley. Every big theme lives here
 * once and is re-arranged across the soundtrack:
 *
 *  - THE TOWN HOOK: sol, up to mi, re, do (A4 F#5 E5 D5 in D). "Home."
 *    A short-LONG-short-short rhythm. Cosy in town, a fanfare at shows.
 *  - THE VELVET CELL: sol, up to do, re, mi (the same rhythm, reaching UP
 *    instead of settling down). Birdie's half of the Velvet Hammers.
 *  - THE CURTSY: Dottie's descending 4-3-2-1 with a little trill on the
 *    downbeat. Her waltz is built from it.
 *  - THE VELVET HAMMERS THEME puts the cell and the curtsy together in 6/8,
 *    where a waltz and a shuffle can finally dance.
 *
 * All pitches carry explicit octaves so they can be transposed.
 */

// ─── The town theme (D major, 4/4) ──────────────────────────────────────────

export const TOWN = {
  key: 'D',
  A1: {
    chords: 'D | G/B | Em7 A7 | D | Bm7 | G | Em7 | A7sus4 A7',
    mel: 'A4e F#5q. E5e D5e E5q | F#5e D5q. B4q A4q | B4e C#5e D5e E5e F#5q E5q | D5h re A4e B4e C#5e | D5e F#5q. E5e D5e B4q | B4e D5e G5q. F#5e E5e D5e | E5q. D5e C#5q B4q | D5q. C#5e -h',
  },
  A2: {
    chords: 'D | G/B | Em7 A7 | D | Bm7 | G Gm6 | D/A A7 | D',
    mel: 'A4e F#5q. E5e D5e E5q | F#5e D5q. B4q A4q | B4e C#5e D5e E5e F#5q E5q | D5h re A4e B4e C#5e | D5e F#5q. E5e D5e B4q | B4e D5e G5h Bb4e A4e | F#5q. E5e D5q C#5q | D5h. rq',
  },
  B: {
    chords: 'Gmaj7 | F#m7 | Em7 | A7 | Gmaj7 | F#m7 B7 | Em7 | A7sus4 A7',
    mel: 'B4q D5q F#5h | E5q. C#5e A4h | G4q B4q E5q. D5e | C#5h B4q A4q | B4q D5q F#5q. G5e | A5q F#5q D#5q. F#5e | G5h. F#5e E5e | D5h C#5h',
  },
  /** The porch interlude, usually on a flute. */
  C: {
    chords: 'Bm7 | Gmaj7 | D/F# | G A | Bm7 | Gmaj7 | Em7 | A7',
    mel: 'F#5q. D5e B4q D5q | E5q. D5e B4h | A4q. F#4e A4q D5q | C#5h B4q A4q | D5q. F#5e B5q A5q | G5q. F#5e D5h | E5q G5q F#5q E5q | C#5q. A4e -h',
  },
};

// ─── The Velvet Hammers (Bb major, 6/8 written as 3 quarter-beats) ──────────

export const VELVET = {
  key: 'Bb',
  meter: 3,
  A: {
    chords: 'Bb | Bb/D | Eb | F | Gm | Eb | Cm7 | F7 | Bb | Bb/D | Eb | Ebm | Bb/F | Gm7 C7 | Cm7 F7 | Bb',
    mel: 'F4e Bb4q. C5e D5e | F5q. D5q. | Eb5e D5e C5e Bb4e C5e Eb5e | D5q C5e -q. | D5e G5q. F5e Eb5e | D5q. Bb4q. | C5e Eb5e G5e F5e Eb5e D5e | C5h. | F4e Bb4q. C5e D5e | F5q. Bb5q. | G5e F5e Eb5e D5e Eb5e G5e | Gb5q. F5q. | F5e D5q. Bb4e C5e | D5q. E5q. | Eb5e D5e C5e A4q. | Bb4h.',
  },
  B: {
    chords: 'Gm | Dm | Ebmaj7 | Bb/D | Cm7 | Dm7 | Ebmaj7 | F7sus4 F7',
    mel: 'D5e G5e Bb5e A5q. | F5h. | G5e Bb5e D6e C6q. | Bb5h. | Eb5e G5e Bb5e G5q. | F5q. A5q. | Bb5q. G5e F5e Eb5e | F5q. Eb5q.',
  },
};

// ─── The Duchess Waltz (Dottie; F major, 3/4) ───────────────────────────────

export const DUCHESS = {
  key: 'F',
  meter: 3,
  A: {
    chords: 'F | F | Bb | F | C7 | C7 | F | F',
    mel: 'Bb5t A5t Bb5e. A5q G5q | F5h C5q | D5t C5t D5e. F5q Bb5q | A5h. | G5t F5t G5e. E5q C5q | Bb4q. C5e E5q | A5t G5t A5e. G5q F5q | F5h.',
  },
  B: {
    chords: 'F | F7 | Bb | Bbm | F/C | D7 | Gm7 C7 | F',
    mel: 'C5q F5q A5q | C6q. Bb5e A5q | D6t C6t D6e. Bb5q F5q | Db6q. C6e Bb5q | A5h C5q | F#5q. A5e C6q | Bb5q. E5e G5q | F5h.',
  },
};

// ─── Sugar's Shuffle (Birdie; G major, swung 4/4) ───────────────────────────

export const SHUFFLE = {
  key: 'G',
  A: {
    chords: 'G | G7 | C | C#dim7 | G/D | E7 | A7 D7 | G D7',
    mel: 'D4e G4q. A4e B4e D5q | F5q. D5e B4q G4q | E5e G5q. E5e C5e E5q | G5q. E5e C#5q Bb4q | B4e D5q. B4e G4e A4q | G#4q. B4e D5q E5q | C#5q E5q C5q A4q | G4e B4e D5e G5e F#5s G5s F#5s E5s D5e C5e',
  },
  B: {
    chords: 'C | C#dim7 | G/D | E7 | A7 | D7 | G E7 | A7 D7',
    mel: 'E5q. G5e A5q G5q | E5q. G5e Bb5q G5q | D5q. B4e G4q B4q | D5q. B4e G#4h | A4e C#5q. E5e G5e -q | F#5q. E5e D5q C5q | B4q G4q G#4q B4q | A4e B4e C#5e E5e D5e C5e A4e F#4e',
  },
};

// ─── The match / show material (A major) ────────────────────────────────────

export const SHOWTIME = {
  key: 'A',
  /** The festive B section of the show theme. */
  B: {
    chords: 'D | E | C#m7 F#m | Bm7 E7 | D | E | F#m D | E7sus4 E7',
    mel: 'F#5e A5e D6q A5e F#5e D5q | G#5e B5e E6q B5e G#5e E5q | E5q. G#5e A5q C#6q | D6q. C#6e B5q G#5q | F#5e A5e D6q A5e F#5e D5q | G#5e B5e E6q F#6q E6q | C#6q. B5e A5q F#5q | B5h G#5h',
  },
};
