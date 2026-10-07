/**
 * The storyline engine (docs/STORYLINES.md): pitches, three-act storylines on
 * the Wednesday/Saturday calendar, crowd-driven turns, flops and saves, the
 * career ladder, the Turnbuckle Tattler and Birdie's corkboard.
 *
 * Pure engine code lives in ./engine and ./career.ts (safe to import in tests);
 * all DOM/UI is loaded lazily from ./ui.
 */
import { G } from '../core/state';
import type { MatchResult } from '../match/types';
import { onAction, onEnterMap, onNewDay, onTalk, onTick } from '../world/hooks';
import type { Paper, ShowCard, StoryApi, Venue } from './api';
import { bookShow, findSeg, playerHired, reportNpcSegment, reportPlayerMatch, reportShowSkipped, showName, toCard } from './engine/book';
import { ensureInit, processDay } from './engine/day';
import { composePaper } from './engine/paper';
import { S, cal, today } from './engine/state';

function safe<T>(label: string, fn: () => T, fallback: () => T): T {
  try {
    return fn();
  } catch (err) {
    console.error(`[story] ${label} failed`, err);
    return fallback();
  }
}

function fallbackCard(venue: Venue, supershow: string | null): ShowCard {
  return {
    venue,
    name: showName(venue, supershow),
    segments: [
      { id: `fb${today()}a`, kind: 'match', title: 'Dex Delgado vs. Buck Bruiser', participants: ['dex', 'buck'], playerInvolved: false, summary: 'Dex flew, Buck stomped, and Dex won with a dropkick off the top.', slot: 'opener' },
      { id: `fb${today()}b`, kind: 'match', title: 'La Mariposa vs. Gorgeous Gideon', participants: ['mariposa', 'gideon'], playerInvolved: false, summary: 'La Mariposa won with a springboard crossbody. Gideon checked his hair in the ring post.', slot: 'main' },
    ],
  };
}

export const story: StoryApi = {
  bookTonight(venue: Venue, supershow: string | null): ShowCard {
    return safe('bookTonight', () => {
      processDay();
      return toCard(bookShow(today(), venue, supershow));
    }, () => fallbackCard(venue, supershow));
  },
  reportMatch(segmentId: string, result: MatchResult): void {
    safe('reportMatch', () => reportPlayerMatch(segmentId, result), () => undefined);
  },
  reportSegment(segmentId: string): void {
    safe('reportSegment', () => reportNpcSegment(segmentId), () => undefined);
  },
  reportSkipped(card: ShowCard): void {
    safe('reportSkipped', () => {
      const id = card.segments[0]?.id;
      const f = id ? findSeg(id) : null;
      const show = f?.show ?? S().shows.find((r) => r.day === today());
      if (show) reportShowSkipped(show);
    }, () => undefined);
  },
  morningPaper(): Paper | null {
    return safe('morningPaper', () => {
      processDay();
      return composePaper();
    }, () => null);
  },
  async openJournal(): Promise<void> {
    safe('processDay', () => processDay(), () => undefined);
    const { openCorkboard } = await import('./ui/journal');
    await openCorkboard({ office: G.player.map === 'birdie-office' });
    await flushNotices();
  },
};

/** Show queued engine notices as toasts. */
async function flushNotices(): Promise<void> {
  const s = S();
  if (!s.notices.length) return;
  const { toast } = await import('../ui/dialog');
  for (const n of s.notices.splice(0)) toast(n);
}

function metNpc(id: string): boolean {
  const t = G.ext['talk'] as { met?: string[] } | undefined;
  return !!t?.met?.includes(id);
}

const INSIDER_MAPS = new Set(['birdie-office', 'lockers', 'diner', 'airstream', 'birdie-house']);
let sceneRunning = false;

async function guarded(fn: () => Promise<boolean>): Promise<boolean> {
  if (sceneRunning) return false;
  sceneRunning = true;
  try {
    return await fn();
  } catch (err) {
    console.error('[story] scene failed', err);
    return false;
  } finally {
    sceneRunning = false;
    await flushNotices();
  }
}

// ------------------------------------------------------------------ world hooks

onNewDay(async () => {
  safe('newDay', () => processDay(), () => undefined);
  await flushNotices();
});

onTalk(async (npcId: string, place: string) => {
  if (!metNpc(npcId)) return false;
  safe('processDay', () => processDay(), () => undefined);
  const s = S();
  return guarded(async () => {
    const ui = await import('./ui/scenes');
    if (npcId === 'birdie' && s.career.pending) return ui.promotionScene(place);
    if (place === 'insider') {
      if (await ui.runQueuedScenes(2, npcId)) return true;
      const p = ui.waitingPitches().find((x) => x.pitcher === npcId);
      if (p) {
        const { runPitch } = await import('./ui/napkin');
        await runPitch(p);
        return true;
      }
      return false;
    }
    if (place === 'public' || place === 'show') {
      if (await ui.nudge(npcId)) return true;
      if (place === 'public' && (await ui.markReaction(npcId))) return true;
    }
    return false;
  });
});

onEnterMap(async (mapId: string) => {
  if (!playerHired()) return false;
  safe('processDay', () => processDay(), () => undefined);
  const s = S();
  return guarded(async () => {
    const ui = await import('./ui/scenes');
    if (mapId === 'birdie-office' && s.career.pending) return ui.promotionScene('insider');
    if ((mapId === 'diner' || mapId === 'lockers') && ui.boothTime() && s.flags.boothDone !== today()) {
      s.flags.boothDone = today();
      return ui.boothScene({ afterShow: true });
    }
    if (INSIDER_MAPS.has(mapId) && (s.scenes.length || ui.waitingPitches().some((p) => p.nudges > 0)) && s.flags.enterScene !== today()) {
      s.flags.enterScene = today();
      return ui.boothScene({ afterShow: false });
    }
    return false;
  });
});

/** After a show the player lands in the diner; open the booth once things settle. */
onTick(() => {
  if (sceneRunning || !playerHired()) return;
  if (G.player.map !== 'diner') return;
  const s = S();
  if (!cal.isShow(today()) || G.time.minutes < 21 * 60 + 30 || s.flags.boothDone === today()) return;
  void import('../core/game').then(async ({ game }) => {
    if (game.blockers > 0 || sceneRunning) return;
    s.flags.boothDone = today();
    await guarded(async () => (await import('./ui/scenes')).boothScene({ afterShow: true }));
  });
});

onAction('corkboard', async () => {
  safe('processDay', () => processDay(), () => undefined);
  const { openCorkboard } = await import('./ui/journal');
  await openCorkboard({ office: true });
  await flushNotices();
});

onAction('back-booth', async () => {
  safe('processDay', () => processDay(), () => undefined);
  await guarded(async () => {
    const ui = await import('./ui/scenes');
    const ran = await ui.boothScene({ afterShow: ui.boothTime() && S().flags.boothDone !== today() });
    if (ui.boothTime()) S().flags.boothDone = today();
    if (!ran) {
      const { narrate } = await import('../ui/dialog');
      await narrate('The back booth. A stack of clean napkins, a pen on a string, and nobody with an idea tonight. Yet.');
    }
    return true;
  });
});

/** Console / test helpers. */
export const storyDebug = { S, processDay, ensureInit, today };
