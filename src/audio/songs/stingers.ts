/**
 * Stingers: short one-shot musical stings. Played with audio.stinger(id);
 * the music ducks underneath them.
 */
import type { SongDef } from '../notation';

const sting = (id: string, bpm: number, meter: number, tracks: SongDef['tracks'], section: SongDef['sections'][string]): SongDef => ({
  id: `stinger:${id}`,
  title: id,
  bpm,
  meter,
  loop: false,
  tracks,
  sections: { S: section },
  form: ['S'],
});

export const STINGERS: SongDef[] = [
  // The town hook's leap, quick and bright.
  sting('heart-up', 150, 3, { lead: { inst: 'lead', echo: 0.35 }, bell: { inst: 'bell' }, pad: { inst: 'pad' } }, {
    chords: 'D',
    lead: 'A5s D6s F#6s A6s -h',
    bell: 'rq D6h',
    pad: '@pad',
  }),
  sting('item-get', 150, 3, { lead: { inst: 'lead', echo: 0.3 }, harm: { inst: 'harm' }, bass: { inst: 'bass' } }, {
    lead: 'G5s A5s B5s C6s D6e G6q.',
    harm: '(B4 D5)q re (B4 D5 G5)q.',
    bass: 'G3q re G2q.',
  }),
  sting('level-up', 150, 4, { lead: { inst: 'lead', echo: 0.3 }, harm: { inst: 'brass' }, bass: { inst: 'bass' }, drums: { inst: 'kit', vol: 0.6 } }, {
    lead: 'C5e E5e G5e C6e E6e. D6s E6q | G6h. rq',
    harm: '(C5 E5)h (G5 C6)h | (C5 E5 G5 C6)h. rq',
    bass: 'C3e G3e C4e G3e C3h | C3h. rq',
    drums: 'k.h.s.h.k...c...|c...............',
  }),
  // The Velvet cell: something from the past just moved.
  sting('story-beat', 100, 4, { lead: { inst: 'lead50', echo: 0.4 }, box: { inst: 'musicbox' }, pad: { inst: 'pad' } }, {
    chords: 'Bbmaj7',
    lead: 'F5e Bb5q. C6e D6e -q',
    box: 'rh rq D6q',
    pad: '@pad',
  }),
  // Morning: the town hook on the music box.
  sting('new-day', 120, 4, { box: { inst: 'musicbox', echo: 0.4 }, pad: { inst: 'pad' }, bass: { inst: 'bassPluck', vol: 0.6 } }, {
    chords: 'D | A7sus4 D',
    box: 'A5e F#6q. E6e D6e E6q | D6h. rq',
    pad: '@pad',
    bass: 'D3w | D3h. rq',
  }),
  // Dottie's curtsy, in minor.
  sting('sad', 70, 3, { lead: { inst: 'fiddle', echo: 0.4 }, pad: { inst: 'pad' } }, {
    chords: 'Gm | Dm',
    lead: 'Bb5t A5t Bb5e. A5q G5q | F5h.',
    pad: '@pad',
  }),
  sting('reveal', 90, 4, { brass: { inst: 'brass' }, strings: { inst: 'strings' }, arp: { inst: 'arp', center: 64 }, bass: { inst: 'bass' }, drums: { inst: 'kit', vol: 0.6 } }, {
    chords: 'C#dim7 | Dm',
    brass: 'rh (C#5 E5 G5 Bb5)h | (D5 F5 A5 D6)w',
    strings: '@pad',
    arp: '@[1s 3s 5s 7s]*4',
    bass: 'C#3w | D3w',
    drums: 'k...........ssss|c...............',
  }),
  sting('champion', 120, 4, { lead: { inst: 'trumpet', echo: 0.25 }, brass: { inst: 'brass' }, bass: { inst: 'bass' }, drums: { inst: 'kit', vol: 0.65 } }, {
    lead: 'G5e G5e G5e G5e C6q. B5e | D6h C6h',
    brass: '(C5 E5 G5)e! (C5 E5 G5)e (C5 E5 G5)e (C5 E5 G5)e (F5 A5 C6)q. (E5 G5 C6)e | (G5 B5 D6)h (E5 G5 C6)h',
    bass: 'C3e C3e C3e C3e F3q. C3e | G3h C3h',
    drums: 'k.k.k.k.k.....s.|c...............',
  }),
  // A flop: the Tattler calls it a snooze.
  sting('oops', 84, 4, { lead: { inst: 'brass', vol: 1.1 } }, {
    lead: 'D4q C#4q C4q B3q~',
  }),
  sting('spooky', 80, 4, { lead: { inst: 'theremin', echo: 0.5 }, strings: { inst: 'strings' }, drums: { inst: 'kit', vol: 0.6 } }, {
    chords: 'Em',
    lead: 'B4q G5q~ F#5h',
    strings: '@pad',
    drums: 'd.......d.......',
  }),
  sting('quest', 120, 4, { lead: { inst: 'lead', echo: 0.35 }, pad: { inst: 'pad' }, bell: { inst: 'bell' } }, {
    chords: 'D',
    lead: 'D5e F#5e A5e D6e -h',
    bell: 'rh A6q F#6q',
    pad: '@pad',
  }),
  sting('save', 140, 4, { bell: { inst: 'bell', echo: 0.3 }, pad: { inst: 'pad' } }, {
    chords: 'C',
    bell: 'C6e G5e E6e C6e G6q rq',
    pad: '@pad',
  }),
];
