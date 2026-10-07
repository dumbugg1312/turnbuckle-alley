import { game } from './core/game';

/** Decide the first scene. Dev routes: #match, #dungeon, #tapes, #creator, #town. */
export function boot(): void {
  window.addEventListener('hashchange', () => location.reload());
  const route = location.hash.replace('#', '');
  if (!route) {
    void Promise.all([import('./scenes/title'), import('./systems')]).then(([t]) => game.scenes.reset(new t.TitleScene()));
    return;
  }
  void import('./scenes/devroutes').then((m) => m.startRoute(route, game));
}
