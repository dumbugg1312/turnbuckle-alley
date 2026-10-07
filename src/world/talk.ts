import { audio } from '../audio';
import { sting } from '../core/sting';
import { game } from '../core/game';
import { G, ext, hearts, rel, setFlag, addItem } from '../core/state';
import { absDay, isShowDay, weekday } from '../core/time';
import { DIALOGUE } from '../data/dialogue';
import { HANDWRITTEN } from '../data/dialogue/handwritten';
import type { Cond, DialogueSet, EventApi, Line, Place } from '../data/dialogue/types';
import { ITEMS, item } from '../data/items';
import { NPC_BY_ID } from '../data/npcs';
import { renderPortrait } from '../gfx/characters';
import { choose, narrate, say, toast, type Speaker } from '../ui/dialog';
import { iconFor } from '../gfx/icons';
import { TALK_HOOKS } from './hooks';
import { countTalk, daysSinceTalk, fillMemory, freshNews, heartNews, lastGift, lastMatch, recordGift, shortName, syncNews } from './memory';
import { lookFor, WORLD } from './scene';

const colorsMod = import.meta.glob<{ NPC_COLORS?: Record<string, string> }>('../data/looks.ts', { eager: true });
function npcColor(id: string): string {
  return Object.values(colorsMod)[0]?.NPC_COLORS?.[id] ?? '#d8434b';
}

interface TalkState {
  recent: Record<string, string[]>;
  met: string[];
  /** First mentions and once-only lines already said, as "npc|key". */
  said: string[];
  /** The item held out to give (chosen in the bag). */
  held?: string | null;
}
function talkState(): TalkState {
  const t = ext<TalkState>('talk', () => ({ recent: {}, met: [], said: [] }));
  t.said ??= [];
  return t;
}

const portraitCache = new Map<string, HTMLCanvasElement>();
export function speakerFor(id: string, mood: Line['mood'] = 'neutral'): Speaker | null {
  if (id === 'narrator') return null;
  if (id === 'player') {
    return { name: G.player.name, color: '#3f9a92', portrait: () => renderPortrait(G.player.look, mood ?? 'neutral', 48), voice: 'player' };
  }
  const def = NPC_BY_ID[id];
  const key = `${id}:${mood}`;
  return {
    name: def?.short ?? id,
    sub: def?.insider && def.wrestler ? undefined : undefined,
    color: npcColor(id),
    portrait: () => {
      let c = portraitCache.get(key);
      if (!c) {
        c = renderPortrait(lookFor(id), mood ?? 'neutral', 48);
        portraitCache.set(key, c);
      }
      return c;
    },
    voice: id,
  };
}

export function condOk(c: Cond | undefined, npc: string, place: Place): boolean {
  if (!c) return true;
  const h = hearts(npc);
  if (c.hearts && (h < c.hearts[0] || h > c.hearts[1])) return false;
  if (c.place && !c.place.includes(place)) return false;
  if (c.map && !c.map.includes(G.player.map)) return false;
  if (c.weekday && !c.weekday.includes(weekday())) return false;
  if (c.season && !c.season.includes(G.time.season)) return false;
  if (c.weather && !c.weather.includes(G.weather.today)) return false;
  if (c.time && (G.time.minutes < c.time[0] || G.time.minutes > c.time[1])) return false;
  if (c.flag && !G.flags[c.flag]) return false;
  if (c.notFlag && G.flags[c.notFlag]) return false;
  if (c.showDay !== undefined && c.showDay !== isShowDay()) return false;
  if (c.rank && !c.rank.includes(G.player.rank)) return false;
  if (c.dating !== undefined && !!rel(npc).dating !== c.dating) return false;
  if (c.married !== undefined && !!rel(npc).married !== c.married) return false;
  if (c.alignment && !c.alignment.includes(G.player.persona?.alignment ?? 'face')) return false;
  if (c.lastMatch) {
    const m = lastMatch();
    if (!m) return false;
    const lm = c.lastMatch;
    const ago = absDay() - m.day;
    if (ago > (lm.maxDaysAgo ?? 7) || ago < (lm.minDaysAgo ?? 0)) return false;
    if (lm.won !== undefined && lm.won !== m.won) return false;
    if (lm.opponent && !lm.opponent.includes(m.opponent)) return false;
    if (lm.venue && !lm.venue.includes(m.venue)) return false;
    if (lm.minStars !== undefined && m.stars < lm.minStars) return false;
    if (lm.maxStars !== undefined && m.stars > lm.maxStars) return false;
    if (lm.title !== undefined && lm.title !== !!m.title) return false;
  }
  if (c.giftedRecently) {
    const g = lastGift(npc);
    if (!g) return false;
    const ago = absDay() - g.day;
    if (ago < (c.giftedRecently.minDays ?? 1) || ago > c.giftedRecently.maxDays) return false;
    if (c.giftedRecently.item && !c.giftedRecently.item.includes(g.item)) return false;
  }
  if (c.daysSinceTalk) {
    const d = daysSinceTalk(npc);
    if (d < c.daysSinceTalk[0] || d > c.daysSinceTalk[1]) return false;
  }
  if (c.news && !freshNews(c.news, c.newsDays ?? 7)) return false;
  return true;
}

function specificity(c: Cond | undefined): number {
  return c ? Object.keys(c).length : 0;
}

/** Add friendship points (with a toast on heart changes). */
export function addHearts(npc: string, points: number): void {
  const r = rel(npc);
  const before = Math.floor(r.points / 250);
  const cap = r.dating || r.married ? 3500 : 2500;
  r.points = Math.max(0, Math.min(cap, r.points + points));
  const after = Math.floor(r.points / 250);
  game.bus.emit('relationship', { id: npc, delta: points });
  if (after > before) {
    sting('heart-up');
    toast(`♥ ${NPC_BY_ID[npc]?.short ?? npc} likes you more (${after} hearts)`);
  }
}

export function makeApi(defaultWho: string): EventApi {
  return {
    // Scenes can use memory placeholders too ({opponent}, {venue}, {lastGift}...).
    say: (who, ...lines) => say(speakerFor(who), ...lines.map((l) => fillMemory(l, who))),
    sayMood: (who, mood, ...lines) => say(speakerFor(who, mood), ...lines.map((l) => fillMemory(l, who))),
    narrate: (...lines) => narrate(...lines.map((l) => fillMemory(l, defaultWho))),
    choose: async (prompt, options, who) => choose(speakerFor(who ?? defaultWho), prompt, options),
    hearts: (npc, d) => addHearts(npc, d),
    flag: (name, v = true) => setFlag(name, v),
    hasFlag: (name) => !!G.flags[name],
    give: (id, n = 1) => {
      addItem(id, n);
      sting('item-get');
      toast(`Got ${item(id).name}${n > 1 ? ` ×${n}` : ''}`, iconFor(id));
    },
    money: (d) => {
      G.player.money += d;
      game.bus.emit('money', G.player.money);
    },
    fade: () =>
      new Promise((r) => {
        if (!game.scenes.transition(() => r())) r();
      }),
    learnCard: (cardId) => {
      G.player.deck.push(cardId);
      sting('level-up');
      toast(`New move learned! (${cardId})`);
    },
    learnStoryCard: (cardId) => {
      const s = ext<{ owned: string[] }>('story-cards', () => ({ owned: [] }));
      if (!s.owned.includes(cardId)) s.owned.push(cardId);
      toast(`New story card: ${cardId}`);
    },
    playerName: G.player.name,
  };
}

// ------------------------------------------------------------------ picking a line

const textKey = (t: Line['text']): string => (Array.isArray(t) ? t[0] : t).slice(0, 48);

/** Lines about something that just happened (a match, a gift, news, a long absence). */
function memoryKey(l: Line, npc: string): string | null {
  const c = l.when;
  if (!c) return null;
  if (c.news) return `n:${c.news}@${freshNews(c.news, c.newsDays ?? 7)?.day ?? ''}`;
  if (c.lastMatch) return `m@${lastMatch()?.day ?? ''}`;
  if (c.giftedRecently) return `g@${lastGift(npc)?.day ?? ''}`;
  if (c.daysSinceTalk) return `t@${absDay()}`;
  return null;
}

function said(npc: string, key: string): boolean {
  return talkState().said.includes(`${npc}|${key}`);
}
function markSaid(npc: string, key: string): void {
  const ts = talkState();
  ts.said.push(`${npc}|${key}`);
  if (ts.said.length > 800) ts.said.splice(0, ts.said.length - 800);
}

function weightedPick<T>(items: T[], weight: (t: T) => number): T {
  const ws = items.map(weight);
  let roll = Math.random() * ws.reduce((a, b) => a + b, 0);
  for (let k = 0; k < items.length; k++) {
    roll -= ws[k];
    if (roll <= 0) return items[k];
  }
  return items[items.length - 1];
}

const lineWeight = (l: Line) => (l.weight ?? 1) * (1 + specificity(l.when) * 0.8);

/**
 * Pick what someone says. In order: a handwritten line nobody has heard yet,
 * then the first word on something that just happened (news, your last match,
 * a gift, a long absence), then everything else, weighted toward specific
 * lines and skipping recent ones.
 */
export function pickLine(npcId: string, place: Place): Line | null {
  const ts = talkState();
  const ok = (l: Line) => condOk(l.when, npcId, place) && !(l.once && said(npcId, `once:${textKey(l.text)}`));

  const mine = (HANDWRITTEN[npcId] ?? []).filter(ok);
  const firstMine = mine.find((l) => !said(npcId, `hw:${textKey(l.text)}`));
  if (firstMine) {
    markSaid(npcId, `hw:${textKey(firstMine.text)}`);
    return firstMine;
  }

  const lines = (DIALOGUE[npcId]?.lines ?? []).filter(ok);
  const fresh = lines.filter((l) => {
    const k = memoryKey(l, npcId);
    return k !== null && !said(npcId, `prio:${k}`);
  });
  if (fresh.length) {
    const l = weightedPick(fresh, lineWeight);
    markSaid(npcId, `prio:${memoryKey(l, npcId)}`);
    return l;
  }

  const pool = [...lines.map((l) => ({ l, k: `l:${textKey(l.text)}` })), ...mine.map((l) => ({ l, k: `hw:${textKey(l.text)}` }))];
  if (!pool.length) return null;
  const recent = (ts.recent[npcId] ??= []);
  const unheard = pool.filter(({ k }) => !recent.includes(k));
  const pick = weightedPick(unheard.length ? unheard : pool, ({ l, k }) => lineWeight(l) * (k.startsWith('hw:') ? 2 : 1));
  recent.push(pick.k);
  if (recent.length > Math.min(12, Math.floor(pool.length * 0.7))) recent.shift();
  return pick.l;
}

/** Fill memory placeholders ({opponent}, {lastGift}, {subject}...) in something an NPC is about to say. */
export function fillLine(text: string, npcId: string, when?: Cond): string {
  const subject = when?.news ? freshNews(when.news, when.newsDays ?? 7)?.subject : undefined;
  return fillMemory(text, npcId, subject ? { subject: shortName(subject) } : {});
}

function sayLine(npcId: string, l: Line): Promise<void> {
  if (l.once) markSaid(npcId, `once:${textKey(l.text)}`);
  const boxes = (Array.isArray(l.text) ? l.text : [l.text]).map((t) => fillLine(t, npcId, l.when));
  return say(speakerFor(npcId, l.mood ?? 'neutral'), ...boxes);
}

// ------------------------------------------------------------------ the conversation

/** The whole "press A on a townsperson" flow. */
export async function talkTo(npcId: string, place: Place): Promise<void> {
  syncNews();
  const nth = countTalk(npcId);
  for (const h of TALK_HOOKS) if (await h(npcId, place)) return;
  const ds: DialogueSet | undefined = DIALOGUE[npcId];
  const r = rel(npcId);
  const ts = talkState();
  const sp = speakerFor(npcId);
  const firstToday = !r.talkedToday;
  const holding = heldGift();

  // Heart events take priority.
  if (ds) {
    const h = hearts(npcId);
    const ev = ds.events
      .filter((e) => h >= e.hearts && !r.eventsSeen.includes(e.id) && (!e.map || e.map === G.player.map) && condOk(e.when, npcId, place))
      .sort((a, b) => a.hearts - b.hearts)[0];
    if (ev && ts.met.includes(npcId)) {
      r.eventsSeen.push(ev.id);
      r.talkedToday = true;
      await ev.script(makeApi(npcId));
      heartNews(npcId, ev.id);
      syncNews();
      return;
    }
  }

  if (!ts.met.includes(npcId)) {
    ts.met.push(npcId);
    const def = NPC_BY_ID[npcId];
    const intro = ds ? (place === 'public' && def?.insider && ds.introPublic ? ds.introPublic : ds.intro) : [`Hi there. I'm ${def?.short ?? npcId}.`];
    await say(sp, ...intro);
    if (firstToday) addHearts(npcId, 20);
    r.talkedToday = true;
    return;
  }

  // Walking back up with a gift held out: skip straight to it.
  if (holding && nth > 1) {
    await offerHeldGift(npcId, holding);
    return;
  }

  if (nth > 1 && ds?.again?.length) {
    // Talking twice in a day gets a short brush-off or a continuation, not a fresh monologue.
    const k = (absDay() * 7 + npcId.length + nth) % ds.again.length;
    await say(speakerFor(npcId, 'neutral'), fillLine(ds.again[k], npcId));
  } else {
    // Something you gave them a few days ago, brought up in passing.
    const g = lastGift(npcId);
    const later = ds?.giftReplies.later;
    const ago = g ? absDay() - g.day : 0;
    if (g && later?.length && !g.mentioned && ago >= 2 && ago <= 7 && Math.random() < 0.5) {
      g.mentioned = true;
      await say(speakerFor(npcId, 'happy'), fillLine(later[(g.day + npcId.length) % later.length], npcId));
    } else {
      const chosen = pickLine(npcId, place);
      if (chosen) await sayLine(npcId, chosen);
      else await say(speakerFor(npcId, 'neutral'), idleLine(npcId));
    }
  }
  if (firstToday) addHearts(npcId, 20);
  r.talkedToday = true;

  if (holding) await offerHeldGift(npcId, holding);
}

function idleLine(id: string): string {
  const ds = DIALOGUE[id];
  if (ds?.idle?.length) return fillLine(ds.idle[(absDay() + Math.floor(G.time.minutes / 60)) % ds.idle.length], id);
  return `(${NPC_BY_ID[id]?.short ?? id} nods at you, busy with something.)`;
}

// ------------------------------------------------------------------ gifts

export function giftables(): string[] {
  return Object.keys(G.player.inventory).filter((id) => ITEMS[id] && ITEMS[id].cat !== 'key' && G.player.inventory[id] > 0);
}

/** The item you took out of the bag to give someone (Bag, "Hold out to give"). */
export function heldGift(): string | null {
  const ts = talkState();
  if (ts.held && !(G.player.inventory[ts.held] > 0)) ts.held = null;
  return ts.held ?? null;
}

export function holdGift(id: string | null): void {
  talkState().held = id;
}

async function offerHeldGift(npcId: string, id: string): Promise<void> {
  const r = rel(npcId);
  const name = NPC_BY_ID[npcId]?.short ?? npcId;
  if (r.giftedToday) {
    toast(`You already gave ${name} something today.`);
    return;
  }
  if (r.giftsThisWeek >= 2) {
    toast(`You've given ${name} two things this week. Let it be a surprise next time.`);
    return;
  }
  const c = await choose(null, null, [
    { label: `Give ${name} the ${item(id).name}`, value: 'give', style: 'primary' },
    { label: 'Keep it', value: 'keep' },
  ], { cancelValue: 'keep' });
  if (c === 'give') await giveGift(npcId, id);
}

function one(v: string | string[] | undefined): string | null {
  if (!v) return null;
  if (typeof v === 'string') return v;
  return v.length ? v[Math.floor(Math.random() * v.length)] : null;
}

/** What an item is called in passing ("Polaroid", "slice of pie"). */
export function saidName(id: string): string {
  const d = item(id);
  return d.said ?? d.name.toLowerCase();
}

/** How a gift lands: tier, heart points and what they say. Pure, for tests. */
export function giftReaction(npcId: string, id: string, birthday = false): { tier: 'love' | 'like' | 'neutral' | 'dislike'; points: number; text: string; named: boolean } {
  const ds = DIALOGUE[npcId];
  let tier: 'love' | 'like' | 'neutral' | 'dislike' = 'neutral';
  if (ds?.gifts.loves.includes(id)) tier = 'love';
  else if (ds?.gifts.likes.includes(id)) tier = 'like';
  else if (ds?.gifts.dislikes.includes(id)) tier = 'dislike';
  const points = { love: 80, like: 45, neutral: 20, dislike: -20 }[tier] * (birthday ? 3 : 1);
  const gr = ds?.giftReplies;
  const cat = ITEMS[id]?.cat;
  const byItem = one(gr?.byItem?.[id]);
  const text =
    (birthday ? one(gr?.birthday) : null) ??
    byItem ??
    (tier === 'neutral' || tier === 'like' ? one(cat ? gr?.byCat?.[cat] : undefined) : null) ??
    one(gr?.[tier]) ??
    'Oh! The {item}. Thank you.';
  const named = !!byItem || text.includes('{item}') || text.includes('{Item}');
  const said = saidName(id);
  return { tier, points, text: text.replace(/\{item\}/g, said).replace(/\{Item\}/g, said[0].toUpperCase() + said.slice(1)), named };
}

async function giveGift(npcId: string, id: string): Promise<void> {
  const ds = DIALOGUE[npcId];
  const r = rel(npcId);
  addItem(id, -1);
  r.giftedToday = true;
  r.giftsThisWeek++;
  recordGift(npcId, id);
  if (!(G.player.inventory[id] > 0)) holdGift(null);
  audio.sfx('gift');
  const bday = !!ds?.birthday && ds.birthday.season === G.time.season && ds.birthday.day === G.time.day;
  const { tier, points, text, named } = giftReaction(npcId, id, bday);
  const mood = tier === 'love' ? 'love' : tier === 'like' ? 'happy' : tier === 'dislike' ? 'sad' : 'neutral';
  if (!named) await narrate(`You hand ${NPC_BY_ID[npcId]?.short ?? npcId} the ${saidName(id)}.`);
  await say(speakerFor(npcId, mood), fillLine(text, npcId));
  addHearts(npcId, points);
  if (tier === 'love') WORLD?.emote(npcId, '♥');
}

