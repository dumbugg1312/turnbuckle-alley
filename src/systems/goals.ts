import { G, hasItem } from '../core/state';
import { absDay, isShowDay, weekday } from '../core/time';

/** The gentle "what should I do?" ribbon under the clock. */
export function currentGoal(): string | null {
  const f = G.flags;
  if (f['prologue']) return null;
  if (!f['seen_farm']) return 'Head west down Main Street to the Dupree place.';
  if (!f['first_night'] && absDay() === 0) return "Go inside Grandma's house and get some sleep.";
  if (!f['met_birdie']) return absDay() === 0 ? 'Rest up. Tomorrow: find Birdie at the Sportatorium.' : 'Meet Birdie at the Sportatorium (Main Street, the big red barn).';
  if (!G.player.persona) return "Visit Marigold at Sew What? on Second Street. You can't wrestle in jeans.";
  if (!f['debuted']) {
    if (isShowDay() && weekday() === 2) return G.time.minutes < 19 * 60 ? 'Debut tonight! VFW Hall on Second Street. Talk to Birdie there after 5 PM.' : 'Get to the VFW Hall, the show is on!';
    return 'Your debut is Wednesday at the VFW Hall, 7 PM. Explore town and meet people!';
  }
  if (isShowDay() && G.time.minutes >= 15 * 60 && G.time.minutes < 20 * 60) {
    return weekday() === 2 ? "Show night! VFW Hall, 7 PM. Find Birdie when you're ready." : "Show night! The Sportatorium, 7 PM. Find Birdie when you're ready.";
  }
  if (f['lou_key'] && !f['dungeon_visited'] && hasItem('dungeon-key')) return 'Lou gave you the Dungeon key. Stairs in the Sportatorium locker room.';
  if (!f['yard_cleared'] && absDay() < 14) return "Clear Grandma's yard, then ask Hank about fixing the ring.";
  return null;
}
