import { G } from '../core/state';
import { absDay, isShowDay, weekday } from '../core/time';

/**
 * The little note under the clock. Through the first week it reads like
 * something somebody told you, in their words; after your debut it goes
 * away, except on show nights, and the town's own hints carry you.
 */
export function currentGoal(): string | null {
  const f = G.flags;
  if (f['prologue']) return null;
  // Arrival evening.
  if (!f['seen_farm']) return f['pip_tour_done'] ? 'Pip says keep going west till the road gets tired.' : 'Pip knows the way. Supposedly.';
  if (absDay() === 0) {
    if (!f['first_night']) return 'The key on the blue ribbon fits the blue house.';
    if (!f['dottie_fridge_note']) return 'Something is stuck to the fridge.';
    if (!f['porch_sat']) return "Sit a spell on the porch. Somebody ought to. - D.";
    return 'Bed. Birdie tomorrow.';
  }
  // The first week.
  if (!f['met_birdie']) return "Birdie's note: Sportatorium, ten o'clock. The big red barn on Main.";
  if (!G.player.persona) return "Birdie: see Marigold at Sew What? on Second Street. Nobody wrestles in jeans.";
  if (!f['debuted']) {
    if (isShowDay() && weekday() === 2) return G.time.minutes < 19 * 60 ? 'Debut tonight. VFW Hall, Second Street. Birdie wants you there after five.' : 'The VFW. Now. The show is on.';
    return 'Debut Wednesday, VFW Hall, seven sharp. Birdie says: go meet people.';
  }
  // After the debut: only show nights.
  if (isShowDay() && G.time.minutes >= 15 * 60 && G.time.minutes < 20 * 60) {
    return weekday() === 2 ? 'VFW tonight, bell at seven. Find Birdie when you get there.' : 'Sportatorium tonight, bell at seven. Find Birdie when you get there.';
  }
  return null;
}
