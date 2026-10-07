/**
 * The credits: a medley that walks through every leitmotif in the town,
 * then the Velvet Hammers, then home.
 */
import type { SectionDef, SongDef } from '../notation';
import { TOWN } from './motifs';
import { MATERIAL, type Material } from './leitmotifs';

function part(mat: Material, which: 'A' | 'B', voice: string, extra: Partial<SectionDef> = {}): SectionDef {
  const meter = mat.meter ?? 4;
  const sec: SectionDef = {
    meter,
    swing: mat.swing ?? 0,
    chords: mat[which].chords,
    [voice]: mat[which].mel,
    pad: '@pad',
    bass: meter === 3 ? '@1q. 5,q.' : '@1q 5,q 1q 5,q',
    drums: meter === 3 ? '/8 k..x..' : 'k...x...k...x...',
  };
  return { ...sec, ...extra };
}

const M = MATERIAL;

export const credits: SongDef = {
  id: 'credits',
  title: 'Everybody Takes a Bow',
  bpm: 104,
  key: 'D',
  echo: { beats: 0.75, feedback: 0.34, wet: 0.32 },
  tracks: {
    lead: { inst: 'lead', echo: 0.25 },
    flute: { inst: 'lead50', echo: 0.3 },
    harp: { inst: 'lead12', echo: 0.2 },
    mallet: { inst: 'marimba', echo: 0.2 },
    box: { inst: 'musicbox', echo: 0.4 },
    keys: { inst: 'keys', echo: 0.15 },
    acc: { inst: 'accordion', echo: 0.25 },
    harpsi: { inst: 'harpsi' },
    ghost: { inst: 'theremin', echo: 0.4 },
    harm: { inst: 'harm', vol: 0.7, center: 62 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.4 },
  },
  sections: {
    I: { chords: 'Bb | Gm7 | Ebmaj7 | F7sus4', box: 'F5q Bb5q. C6e D6q | F6h. D6q | Eb6q. D6e C6q Bb5q | C6w', pad: '@pad' },
    T1: { chords: TOWN.A1.chords, lead: TOWN.A1.mel, pad: '@pad', bass: '@1q. 5,e 1q Aq', drums: 'k.z.x.z.k.z.x.z.' },
    Bd: part(M.birdie, 'A', 'keys', { bass: '@1q 3q 5q Aq' }),
    Ma: part(M.mariposa, 'A', 'mallet', { bass: '@1q 5,e 5,e 1q 5,q', drums: 'k...x.k.k...x.k.' }),
    Ea: part(M.earl, 'A', 'box', { bass: '@1q 5,q 3q 5,q' }),
    Dx: part(M.dex, 'A', 'flute', { drums: 'k...s..k..k.s...' }),
    Gi: part(M.gideon, 'A', 'flute', { bass: '@[1e 1^e]*4', drums: 'k...k...k...k...' }),
    Tw: part(M.twins, 'A', 'lead', { harm: M.twins.A.harm }),
    Hz: part(M.hazel, 'A', 'lead'),
    Cl: part(M.clint, 'A', 'harp', { bass: '@1q rq 5,q rq' }),
    Ti: part(M.tiny, 'A', 'box'),
    Pr: part(M.professor, 'A', 'harpsi', { bass: '@1e 3e 5e 3e 1e 5,e 1e 3e', pad: undefined }),
    Lo: part(M.lou, 'A', 'flute', { bass: '@1q. 1e 5,q Aq' }),
    Mo: part(M.mothman, 'A', 'ghost', { drums: 'd.......d.......' }),
    Du: part(M.grandma, 'A', 'acc', { bass: '@1q rh', drums: '/8 k.x.x.' }),
    Ve: part(M.velvet, 'A', 'lead', { harm: '@3q. 5q.' }),
    VB: part(M.velvet, 'B', 'lead'),
    T2: { chords: TOWN.A2.chords, lead: TOWN.A2.mel, harm: '@rh 5q 3q', pad: '@pad', bass: '@1q. 5,e 1q Aq', drums: '[k.z.x.z.k.z.x.z.|]*7 k.z.x.z.k.zzx.xx' },
  },
  intro: ['I'],
  form: ['T1', 'Bd', 'Ma', 'Ea', 'Dx', 'Gi', 'Tw', 'Hz', 'Cl', 'Ti', 'Pr', 'Lo', 'Mo', 'Du', 'Ve', 'VB', 'T2'],
};
