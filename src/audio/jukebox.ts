/**
 * Dev jukebox (index.html#jukebox): play every song, scrub intensity, fire
 * every sfx, stinger, crowd reaction and dialogue voice, and audition
 * procedural entrance themes.
 */
import { audio, previewTheme, SFX_IDS, songIds, stingerIds, stopPreview, themeFor, THEME_STYLES } from './index';
import { BLIP_VOICES } from './blips';
import { getSongDef } from './songs';

const CSS = `
.jb{position:fixed;inset:0;overflow:auto;z-index:1000;pointer-events:auto;background:#140d1f;color:#f3e9d2;
  font:14px/1.4 system-ui,-apple-system,sans-serif;padding:16px;box-sizing:border-box;-webkit-overflow-scrolling:touch}
.jb h1{font-size:20px;margin:0 0 4px}.jb h2{font-size:15px;margin:18px 0 6px;color:#f2b84b}
.jb .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.jb button{background:#2c1f3d;color:#f3e9d2;border:1px solid #4a3666;border-radius:6px;padding:6px 10px;font:inherit;cursor:pointer;touch-action:manipulation}
.jb button:hover{background:#3d2b55}.jb button.on{background:#d8434b;border-color:#ff7a80}
.jb .now{position:sticky;top:-16px;background:#140d1f;padding:8px 0;border-bottom:1px solid #4a3666;z-index:1}
.jb label{display:flex;gap:6px;align-items:center}.jb input,.jb select{font:inherit}
.jb small{opacity:.7}
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  Object.assign(e, attrs);
  e.append(...kids);
  return e;
}

export function mountJukebox(root: HTMLElement): void {
  const style = el('style', { textContent: CSS });
  const wrap = el('div', { className: 'jb' });
  root.append(style, wrap);
  // Clicking anywhere in here counts as the unlocking gesture.
  wrap.addEventListener('pointerdown', () => audio.unlock());

  const now = el('div', { className: 'now' });
  const nowText = el('div', { textContent: 'Tap any button to start audio.' });
  const intensityVal = el('span', { textContent: '0.00' });
  const slider = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '0' });
  slider.addEventListener('input', () => {
    audio.intensity(Number(slider.value));
    intensityVal.textContent = Number(slider.value).toFixed(2);
  });
  const setI = (v: number) => {
    slider.value = String(v);
    slider.dispatchEvent(new Event('input'));
  };
  now.append(
    el('h1', { textContent: 'Turnbuckle Alley Jukebox' }),
    nowText,
    el('div', { className: 'row' }, el('label', {}, 'Intensity', slider, intensityVal), btn('0', () => setI(0)), btn('0.5', () => setI(0.5)), btn('1', () => setI(1)), btn('Stop music', () => select(null))),
  );
  wrap.append(now);

  const songButtons = new Map<string, HTMLButtonElement>();
  function select(id: string | null): void {
    audio.unlock();
    audio.music(id);
    for (const [k, b] of songButtons) b.classList.toggle('on', k === id);
    const def = id ? getSongDef(id) : null;
    nowText.textContent = def ? `Now playing: ${def.title}  (${id}, ${def.bpm} bpm)` : 'Silence';
  }

  function btn(label: string, fn: () => void, title?: string): HTMLButtonElement {
    const b = el('button', { textContent: label, title: title ?? '' });
    b.addEventListener('click', () => {
      audio.unlock();
      fn();
    });
    return b;
  }

  function section(title: string, ...kids: Node[]): void {
    wrap.append(el('h2', { textContent: title }), el('div', { className: 'row' }, ...kids));
  }

  const ids = songIds();
  const songBtn = (id: string) => {
    const b = btn(id, () => select(id), getSongDef(id)?.title);
    songButtons.set(id, b);
    return b;
  };
  section('Songs', ...ids.filter((i) => !i.startsWith('theme:')).map(songBtn));
  section('Entrance themes', ...ids.filter((i) => i.startsWith('theme:') && !/:town$|:away$/.test(i)).map(songBtn));
  section('Leitmotifs around town', ...ids.filter((i) => /^theme:.*:(town|away)$/.test(i)).map(songBtn));
  section('Stingers', ...stingerIds().map((id) => btn(id, () => audio.stinger(id))));
  section('Sound effects', ...SFX_IDS.map((id) => btn(id, () => audio.sfx(id))));

  // Crowd
  const crowdVal = el('span', { textContent: '0.00' });
  const crowdSlider = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '0' });
  crowdSlider.addEventListener('input', () => {
    audio.unlock();
    audio.crowd(Number(crowdSlider.value));
    crowdVal.textContent = Number(crowdSlider.value).toFixed(2);
  });
  const kinds = ['pop', 'boo', 'gasp', 'chant', 'laugh', 'cheer', 'count'] as const;
  section(
    'Crowd',
    el('label', {}, 'Bed level', crowdSlider, crowdVal),
    ...kinds.map((k) => btn(k, () => audio.crowdReact(k, 0.9))),
    btn('1-2-3!', () => [1, 2, 3].forEach((n, i) => setTimeout(() => {
      audio.sfx(n === 3 ? 'bell' : 'count');
      audio.crowdReact('count', 0.6 + n * 0.2);
    }, i * 800))),
  );

  // Blips
  const sample = 'Well, sugar, look who finally showed up.';
  section(
    'Dialogue voices',
    ...Object.keys(BLIP_VOICES).map((v) =>
      btn(v, () => {
        let i = 0;
        const t = setInterval(() => {
          if (i++ >= sample.length / 2) return clearInterval(t);
          audio.blip(v);
        }, 50);
      }),
    ),
  );

  // Procedural themes
  const styleSel = el('select');
  for (const s of THEME_STYLES) styleSel.append(el('option', { value: s, textContent: s }));
  const tempo = el('input', { type: 'number', min: '60', max: '200', value: '128' });
  tempo.style.width = '5em';
  const seed = el('input', { type: 'number', value: String(1 + Math.floor(Math.random() * 9999)) });
  seed.style.width = '7em';
  const theme = () => ({ style: styleSel.value, tempo: Number(tempo.value), seed: Number(seed.value) });
  section(
    'Procedural entrance themes',
    el('label', {}, 'Style', styleSel),
    el('label', {}, 'BPM', tempo),
    el('label', {}, 'Seed', seed),
    btn('Preview 6 bars', () => previewTheme(theme())),
    btn('Stop preview', () => stopPreview()),
    btn('Play full', () => {
      const id = themeFor(theme());
      select(id);
    }),
    btn('New seed', () => {
      seed.value = String(1 + Math.floor(Math.random() * 99999));
    }),
  );

  const vm = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '0.8' });
  const vs = el('input', { type: 'range', min: '0', max: '1', step: '0.01', value: '0.9' });
  const applyVol = () => audio.volumes(Number(vm.value), Number(vs.value));
  vm.addEventListener('input', applyVol);
  vs.addEventListener('input', applyVol);
  section('Volume', el('label', {}, 'Music', vm), el('label', {}, 'SFX', vs));
  wrap.append(el('p', {}, el('small', { textContent: 'Songs crossfade; the match, show, workout and dungeon respond to intensity.' })));
}
