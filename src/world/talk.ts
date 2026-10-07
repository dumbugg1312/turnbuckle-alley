import { audio } from '../audio';
import { sting } from '../core/sting';
import { game } from '../core/game';
import { G, ext, hearts, rel, setFlag, addItem } from '../core/state';
import { isShowDay, weekday } from '../core/time';
import { DIALOGUE } from '../data/dialogue';
import type { Cond, DialogueSet, EventApi, Line, Place } from '../data/dialogue/types';
import { ITEMS, item } from '../data/items';
import { NPC_BY_ID } from '../data/npcs';
import { renderPortrait } from '../gfx/characters';
import { choose, narrate, say, toast, type Speaker } from '../ui/dialog';
import { iconFor } from '../gfx/icons';
import { TALK_HOOKS } from './hooks';
import { lookFor, WORLD } from './scene';

const colorsMod = import.meta.glob<{ NPC_COLORS?: Record<string, string> }>('../data/looks.ts', { eager: true });
function npcColor(id: string): string {
  return Object.values(colorsMod)[0]?.NPC_COLORS?.[id] ?? '#d8434b';
}

interface TalkState {
  recent: Record<string, string[]>;
  met: string[];
}
function talkState(): TalkState {
  return ext<TalkState>('talk', () => ({ recent: {}, met: [] }));
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
    say: (who, ...lines) => say(speakerFor(who), ...lines),
    sayMood: (who, mood, ...lines) => say(speakerFor(who, mood), ...lines),
    narrate: (...lines) => narrate(...lines),
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

/** The whole "press A on a townsperson" flow. */
export async function talkTo(npcId: string, place: Place): Promise<void> {
  for (const h of TALK_HOOKS) if (await h(npcId, place)) return;
  const ds: DialogueSet | undefined = DIALOGUE[npcId];
  const r = rel(npcId);
  const ts = talkState();
  const sp = speakerFor(npcId);
  const firstToday = !r.talkedToday;

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

  // Pick a line.
  const pool = (ds?.lines ?? []).map((l, i) => ({ l, i })).filter(({ l }) => condOk(l.when, npcId, place));
  let chosen: Line | null = null;
  if (pool.length) {
    const recent = (ts.recent[npcId] ??= []);
    const fresh = pool.filter(({ i }) => !recent.includes(String(i)));
    const cands = fresh.length ? fresh : pool;
    // Prefer specific lines (weighted by how many conditions they have).
    const weights = cands.map(({ l }) => (l.weight ?? 1) * (1 + specificity(l.when) * 0.8));
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
    let pick = cands[0];
    for (let k = 0; k < cands.length; k++) {
      roll -= weights[k];
      if (roll <= 0) {
        pick = cands[k];
        break;
      }
    }
    chosen = pick.l;
    recent.push(String(pick.i));
    if (recent.length > Math.min(12, Math.floor(pool.length * 0.7))) recent.shift();
  }
  const lines = chosen ? (Array.isArray(chosen.text) ? chosen.text : [chosen.text]) : [genericLine(npcId)];
  await say(speakerFor(npcId, chosen?.mood ?? 'neutral'), ...lines);
  if (firstToday) addHearts(npcId, 20);
  r.talkedToday = true;

  // Offer a gift.
  if (!r.giftedToday && r.giftsThisWeek < 2 && giftables().length) {
    const c = await choose(null, null, [
      { label: '💝 Give a gift', value: 'gift' },
      { label: 'See you around', value: 'bye' },
    ], { cancelValue: 'bye' });
    if (c === 'gift') await giveGift(npcId);
  }
}

function genericLine(id: string): string {
  const def = NPC_BY_ID[id];
  const opts = ['Nice day for it, huh?', "Can't talk long. Busy, busy.", 'You settling in okay?', 'See you at the show?'];
  if (def?.id === 'wanda') return '*Wanda gives a small, polite wave with one enormous paw.*';
  return opts[Math.floor(Math.random() * opts.length)];
}

export function giftables(): string[] {
  return Object.keys(G.player.inventory).filter((id) => ITEMS[id] && ITEMS[id].cat !== 'key' && G.player.inventory[id] > 0);
}

async function giveGift(npcId: string): Promise<void> {
  const { pickItem } = await import('../ui/menu');
  const id = await pickItem('Give which gift?', giftables());
  if (!id) return;
  const ds = DIALOGUE[npcId];
  const r = rel(npcId);
  addItem(id, -1);
  r.giftedToday = true;
  r.giftsThisWeek++;
  audio.sfx('gift');
  const bday = ds?.birthday && ds.birthday.season === G.time.season && ds.birthday.day === G.time.day;
  let tier: 'love' | 'like' | 'neutral' | 'dislike' = 'neutral';
  if (ds?.gifts.loves.includes(id)) tier = 'love';
  else if (ds?.gifts.likes.includes(id)) tier = 'like';
  else if (ds?.gifts.dislikes.includes(id)) tier = 'dislike';
  const pts = { love: 80, like: 45, neutral: 20, dislike: -20 }[tier] * (bday ? 3 : 1);
  const replies = bday && ds?.giftReplies.birthday?.length ? ds.giftReplies.birthday : ds?.giftReplies[tier] ?? ['Oh! Thank you.'];
  const mood = tier === 'love' ? 'love' : tier === 'like' ? 'happy' : tier === 'dislike' ? 'sad' : 'neutral';
  await say(speakerFor(npcId, mood), replies[Math.floor(Math.random() * replies.length)]);
  addHearts(npcId, pts);
  if (tier === 'love') WORLD?.emote(npcId, '♥');
}
