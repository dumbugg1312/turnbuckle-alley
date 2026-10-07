import type { game as Game } from '../core/game';
import { G } from '../core/state';
import { defaultLook } from '../gfx/look';
import { BACKGROUND_CARDS, rewardPool, STARTER_DECK } from '../match/cards';

/** Developer shortcuts: index.html#match etc. */
export function startRoute(route: string, g: typeof Game): void {
  if (route.startsWith('town') || route.startsWith('farm') || route.startsWith('map')) {
    void Promise.all([import('../world/scene'), import('../systems'), import('../core/state'), import('../match/cards')]).then(([w, , st, cards]) => {
      const params = new URLSearchParams(route.split('?')[1] ?? '');
      const fresh = st.newState(1234);
      fresh.player.deck = [...cards.STARTER_DECK, ...cards.BACKGROUND_CARDS.backyard];
      fresh.player.name = 'Sam';
      const map = params.get('map') ?? (route.startsWith('farm') ? 'farm' : 'town');
      fresh.player.map = map;
      fresh.player.x = Number(params.get('x') ?? (map === 'town' ? 58 : 20)) * 16 + 8;
      fresh.player.y = Number(params.get('y') ?? (map === 'town' ? 26 : 13)) * 16 + 13;
      fresh.time.minutes = Number(params.get('t') ?? 9) * 60;
      if (params.get('day')) fresh.time.day = Number(params.get('day'));
      st.setState(fresh);
      g.scenes.reset(new w.WorldScene());
    });
    return;
  }
  if (route.startsWith('gallery')) {
    void import('./gallery').then((m) => g.scenes.reset(new m.GalleryScene(new URLSearchParams(route.split('?')[1] ?? ''))));
    return;
  }
  if (route.startsWith('match')) {
    void import('../match/scene').then(({ MatchScene }) => startMatch(route, g, MatchScene));
    return;
  }
  if (route.startsWith('jukebox')) {
    const jb = Object.values(import.meta.glob<{ mountJukebox?: (el: HTMLElement) => void }>('../audio/jukebox.ts'))[0];
    void jb?.().then((m) => m.mountJukebox?.(document.getElementById('ui')!));
    return;
  }
  if (route.startsWith('creator')) {
    const mode = route.includes('ring') ? 'ring' : 'self';
    void import('../story-main/opening').then((m) => m.openCreator(mode));
    return;
  }
}

function startMatch(route: string, g: typeof Game, MatchScene: typeof import('../match/scene').MatchScene): void {
  {
    const params = new URLSearchParams(route.split('?')[1] ?? '');
    const heel = params.get('heel') === '1';
    const lose = params.get('lose') === '1';
    const venue = (params.get('venue') ?? 'sportatorium') as 'vfw' | 'sportatorium';
    const look = { ...defaultLook(), top: 'singlet', topColor: '#d8434b', bottom: 'trunks', bottomColor: '#1e1426', shoes: 'wrestling-boots', shoesColor: '#f2f2f2', hair: 'mullet', hairColor: '#a0622f' };
    const earl = { ...defaultLook(), body: 'giant' as const, height: 6, skin: '#8d5233', hair: 'bald', facial: 'beard', hairColor: '#1c1418', top: 'singlet', topColor: '#2a2a3a', bottom: 'tights', bottomColor: '#2a2a3a', shoes: 'wrestling-boots', shoesColor: '#1e1426' };
    g.scenes.reset(
      new MatchScene({
        config: {
          player: { id: 'player', name: G.player.name, role: heel ? 'heel' : 'face', look, style: 'brawler', chemistry: 0, finisherName: 'Alley Oop Bomb', signatureName: 'Hometown Spinebuster', deck: [...STARTER_DECK, ...BACKGROUND_CARDS.backyard], gear: [], maxGas: 32, ringIq: 1 },
          opponent: { id: 'earl', name: 'Big Earl', role: heel ? 'face' : 'heel', look: earl, style: 'giant', chemistry: 3, finisherName: 'The Overdue Notice', signatureName: 'Chokeslam' },
          winner: lose ? 'opponent' : 'player',
          venue,
          seed: Date.now() & 0xffff,
        },
        intro: { title: 'SATURDAY NIGHT!' },
        rewardChoices: g.scenes ? rewardPool('giant').slice(0, 3) : [],
        onDone: () => startRoute(route, g),
      }),
    );
  }
}
