import { G } from '../core/state';
import { DAY_END } from '../core/time';
import { narrate } from '../ui/dialog';
import type { MapObject } from '../world/types';

/**
 * Old tapes: the fishing of Turnbuckle Alley. TVs call watchTapes(); tape
 * bins call digBin(). The heavy modules load on first use.
 */
export async function watchTapes(): Promise<void> {
  const { libraryTapes } = await import('./tapes/state');
  if (!libraryTapes().length) {
    await narrate("An old CRT TV and a VCR. The VCR's clock blinks 12:00, as is tradition.", "You don't have any tapes yet. The flea market has crates of them, and Fenwick keeps the good stuff in his back room.");
    return;
  }
  if (G.time.minutes > DAY_END - 60) {
    await narrate("It's way too late to start a tape. You'd be asleep before the main event.");
    return;
  }
  const { openTv } = await import('./tapes/watch');
  await openTv();
}

export async function digBin(bin: string, object: MapObject): Promise<void> {
  const { openDig } = await import('./tapes/dig');
  await openDig(bin, object);
}
