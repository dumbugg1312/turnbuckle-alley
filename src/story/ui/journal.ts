/**
 * Birdie's corkboard (the journal): active storylines pinned with yarn between
 * rivals, upcoming beats, waiting pitches, the Recipe Tin, the Napkin Box,
 * the career ladder and, from Assistant Booker up, the booking board.
 */
import { G, RANKS, RANK_NAMES } from '../../core/state';
import { audio } from '../../audio';
import { block } from '../../core/game';
import { el, uiRoot } from '../../ui/dom';
import { toast } from '../../ui/dialog';
import { progress } from '../career';
import { NameOf, PLAYER, alignOf, charState } from '../engine/cast';
import { CARD, SHAPES, shape as shapeOf } from '../engine/content';
import { isShowBeat } from '../engine/generate';
import { S, cal, today, type Archived, type Storyline } from '../engine/state';
import { tin } from '../engine/tin';
import { playerPitch, boardPitch, rankAtLeast } from '../engine/pitch';
import { WRESTLERS } from '../data/roster';
import { cardEl, face, portrait } from './common';
import { renderBooking } from './booking';

type Tab = 'wall' | 'pitches' | 'tin' | 'box' | 'career' | 'booking';

const INSIDER_MAPS = new Set(['birdie-office', 'lockers', 'diner', 'airstream', 'birdie-house']);

export interface JournalOpts {
  /** Opened from the corkboard in Birdie's office. */
  office?: boolean;
  tab?: Tab;
}

export function openCorkboard(opts: JournalOpts = {}): Promise<void> {
  return new Promise((resolve) => {
    const unblock = block();
    const overlay = el('div', 'overlay cork-overlay');
    const cork = el('div', 'cork');
    const tabs = el('div', 'cork-tabs');
    const body = el('div', 'cork-body');
    const close = el('button', { class: 'btn small cork-close', 'aria-label': 'Close' }, '✕');
    cork.append(tabs, body, close);
    overlay.append(cork);
    uiRoot().append(overlay);
    audio.sfx('page');
    let tab: Tab = opts.tab ?? 'wall';
    let pending: (() => Promise<void>) | null = null;

    const finish = async () => {
      overlay.remove();
      unblock();
      if (pending) {
        const p = pending;
        pending = null;
        await p();
      }
      resolve();
    };
    close.addEventListener('click', (e) => { e.stopPropagation(); void finish(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) void finish(); });

    const insider = opts.office || INSIDER_MAPS.has(G.player.map);
    const ctx: PageCtx = {
      insider,
      office: !!opts.office,
      rerender: () => draw(),
      runAfterClose: (fn) => {
        pending = fn;
        void finish();
      },
      showStory: (st) => {
        body.replaceChildren(storyDetail(st, ctx));
        body.scrollTop = 0;
      },
    };

    function draw(): void {
      const s = S();
      const list: [Tab, string, number][] = [
        ['wall', '📌 Story Wall', 0],
        ['pitches', '📝 Pitches', s.pitches.filter((p) => p.status === 'waiting').length],
        ['tin', '🗃 Recipe Tin', s.tin.filter((c) => c.isNew).length],
        ['box', '👟 Napkin Box', 0],
        ['career', '⭐ Career', s.career.pending ? 1 : 0],
      ];
      if (rankAtLeast('assistant')) list.push(['booking', '✏️ Booking', 0]);
      tabs.replaceChildren();
      for (const [id, label, n] of list) {
        const b = el('button', { class: `cork-tab${tab === id ? ' on' : ''}` }, label);
        if (n) b.append(el('span', 'dot', String(n)));
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          tab = id;
          audio.sfx('select');
          draw();
        });
        tabs.append(b);
      }
      body.replaceChildren(PAGES[tab](ctx));
      body.scrollTop = 0;
      if (tab === 'tin') for (const c of s.tin) c.isNew = false;
    }
    draw();
  });
}

interface PageCtx {
  insider: boolean;
  office: boolean;
  rerender: () => void;
  runAfterClose: (fn: () => Promise<void>) => void;
  showStory: (st: Storyline) => void;
}

// ------------------------------------------------------------------ pages

function polaroid(id: string, rot: number): HTMLElement {
  const p = el('div', { class: 'polaroid', style: `--r:${rot}deg` });
  p.append(portrait(id), el('span', {}, NameOf(id)));
  const a = alignOf(id);
  p.append(el('i', `al ${a}`, a === 'hero' ? 'HERO' : a === 'villain' ? 'VILLAIN' : 'TWEENER'));
  return p;
}

function yarn(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 40');
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M 18 14 C 38 34, 62 34, 82 14');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#c1272d');
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(path);
  return svg;
}

function nextBeatText(st: Storyline): string {
  const now = today();
  const b = st.beats.find((x) => x.status === 'pending' && isShowBeat(x)) ?? st.beats.find((x) => x.status === 'pending');
  if (!b) return 'Wrapping up.';
  const label = b.purpose === 'payoff' ? `Payoff: ${CARD[st.cards.payoff]?.name ?? 'the big one'}` : b.title ?? beatLabel(st, b);
  const where = isShowBeat(b) ? (cal.isWed(b.day) ? 'VFW' : cal.isSuper(b.day) ? 'Supershow' : 'Sportatorium') : b.kind === 'wrsl' ? 'WRSL' : 'Around town';
  return `Next (${cal.relLabel(b.day, now)}, ${where}): ${label}`;
}

function beatLabel(st: Storyline, b: Storyline['beats'][number]): string {
  if (b.title) return b.title;
  if (b.src.from === 'shape') return shapeOf(st.shape).acts[b.src.act]?.[b.src.idx]?.title?.replace(/\{[^}]+\}/g, (m) => {
    const k = m.slice(1, -1).split('.')[0];
    return st.cast[k] ? NameOf(st.cast[k]) : '';
  }) ?? b.purpose;
  if (b.src.from === 'card') {
    const c = CARD[b.src.card];
    if (b.src.part === 'declare') return `Stakes: ${c?.name}`;
    if (b.src.part === 'payoff') return `Payoff: ${c?.name}`;
    if (b.purpose === 'twist' && st.secretTwist && !st.twistRevealed) return 'Twist: ??? (face down)';
    return c?.name ?? b.purpose;
  }
  return { heat: 'A dirty win', establish: 'A statement win', segment: 'Words are exchanged', gohome: 'The final face-off', town: 'Around town', epilogue: 'The booth' }[b.purpose as 'heat'] ?? b.purpose;
}

function storyPin(st: Storyline, ctx: PageCtx, i: number): HTMLElement {
  const sh = shapeOf(st.shape);
  const pin = el('div', { class: `pinned${st.playerIn ? ' mine' : ''}${st.signature ? ' sig' : ''}`, style: `--r:${((i * 37) % 5) - 2}deg` });
  pin.append(el('span', `pushpin${st.playerIn ? '' : st.scope === 'consult' ? ' gold' : ' teal'}`));
  pin.append(el('h3', {}, st.title), el('div', 'shape', `${sh.name} · ${st.playerIn ? "You're in it" : st.scope === 'consult' ? 'You consulted' : 'Around the roster'}`));
  const rv = el('div', 'rivals');
  rv.append(yarn(), polaroid(st.cast.hero, -4), el('span', 'vs-chip', 'VS'), polaroid(st.cast.villain, 3));
  pin.append(rv);
  const buzz = el('div', 'buzz');
  const bar = el('div', 'buzz-bar');
  bar.append(el('i', { class: st.status, style: `width:${st.buzz}%` }));
  buzz.append(el('span', `status-chip ${st.status}`, st.status === 'running' ? 'NEW' : st.status.toUpperCase()), bar);
  pin.append(buzz, el('div', 'next-beat', nextBeatText(st)));
  const stamps = el('div', 'stamps');
  for (const s of st.stamps) stamps.append(el('span', `stamp${s === 'saved' ? ' teal' : s === 'signature' ? ' gold' : ''}`, s.replace('_', ' ').toUpperCase()));
  if (stamps.childElementCount) pin.append(stamps);
  pin.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.sfx('select');
    ctx.showStory(st);
  });
  return pin;
}

function storyDetail(st: Storyline, ctx: PageCtx): HTMLElement {
  const wrap = el('div');
  const back = el('button', { class: 'btn small' }, '← Back to the wall');
  back.addEventListener('click', (e) => { e.stopPropagation(); ctx.rerender(); });
  const sh = shapeOf(st.shape);
  wrap.append(back, el('h2', { class: 'cork-title', style: 'margin-top:calc(var(--u)*5)' }, st.title), el('div', 'cork-sub', `${sh.name}: ${sh.register}. ${st.weeks} weeks.`));
  const napkin = el('div', 'paper-sheet');
  napkin.append(el('h4', {}, 'The napkin'));
  const row = el('div', 'card-row');
  for (const id of [st.cards.hook, st.cards.twist, st.cards.stakes, st.cards.payoff, ...st.cards.segments]) {
    const c = id ? CARD[id] : undefined;
    if (!c) continue;
    const fd = c.slot === 'twist' && st.secretTwist && !st.twistRevealed;
    row.append(cardEl(c, { facedown: fd }));
  }
  napkin.append(row);
  const castRow = el('div', 'card-row');
  castRow.style.marginTop = 'calc(var(--u) * 5)';
  for (const [role, who] of Object.entries(st.cast)) {
    const r = sh.roles.find((x) => x.key === role);
    const p = polaroid(who, 0);
    p.querySelector('span')!.textContent = `${r?.label ?? role}: ${NameOf(who)}`;
    p.style.width = 'calc(var(--u) * 60)';
    castRow.append(p);
  }
  napkin.append(castRow);
  wrap.append(napkin);
  const tl = el('div', 'paper-sheet');
  tl.append(el('h4', {}, 'The calendar'));
  const ul = el('ul', 'timeline');
  const now = today();
  const nextIdx = st.beats.findIndex((b) => b.status === 'pending');
  st.beats.forEach((b, i) => {
    if (b.status === 'skipped') return;
    const li = el('li', b.status === 'done' ? 'done' : i === nextIdx ? 'next' : '');
    const kind = isShowBeat(b) ? (cal.isWed(b.day) ? 'VFW' : 'Sportatorium') : b.kind === 'wrsl' ? 'WRSL 1340' : b.kind === 'booth' ? 'The booth' : b.place ?? 'Around town';
    li.append(el('span', 'when', `${cal.dayLabel(b.day)}${b.day === now ? ' (today)' : ''}\n${kind}`), el('span', 'what', `${beatLabel(st, b)}${b.stars !== undefined ? `  ${'★'.repeat(Math.round(b.stars))}` : ''}`));
    ul.append(li);
  });
  tl.append(ul);
  wrap.append(tl);
  if (st.log.length) {
    const log = el('div', 'paper-sheet');
    log.append(el('h4', {}, 'So far'));
    for (const l of st.log.slice(-8).reverse()) log.append(el('p', { style: 'margin:0 0 calc(var(--u)*3);font-size:calc(var(--u)*6.5);line-height:1.4' }, `${cal.dayLabel(l.day)}: ${l.text}`));
    wrap.append(log);
  }
  return wrap;
}

const PAGES: Record<Tab, (ctx: PageCtx) => HTMLElement> = {
  wall: (ctx) => {
    const s = S();
    const wrap = el('div');
    wrap.append(el('h2', 'cork-title', "Birdie's Corkboard"));
    const mine = s.stories.filter((st) => !st.done && (st.playerIn || st.scope !== 'background'));
    const others = s.stories.filter((st) => !st.done && !st.playerIn && st.scope === 'background');
    if (s.notices.length) {
      for (const n of s.notices.splice(0)) toast(n);
    }
    if (!mine.length) wrap.append(el('div', 'cork-sub', 'No storylines of your own yet. Folks bring ideas to the back booth after shows. Listen for hints around town.'));
    else {
      wrap.append(el('div', 'cork-sub', 'Your stories'));
      const g = el('div', 'pin-grid');
      mine.forEach((st, i) => g.append(storyPin(st, ctx, i)));
      wrap.append(g);
    }
    if (others.length) {
      wrap.append(el('div', { class: 'cork-sub', style: 'margin-top:calc(var(--u)*10)' }, 'Around the roster'));
      const g = el('div', 'pin-grid');
      others.forEach((st, i) => g.append(storyPin(st, ctx, i + 3)));
      wrap.append(g);
    }
    const titles = el('div', { class: 'paper-sheet', style: 'margin-top:calc(var(--u)*10)' });
    titles.append(el('h4', {}, 'Champions'));
    for (const t of Object.values(s.titles)) titles.append(el('div', { style: 'font-size:calc(var(--u)*7);margin:calc(var(--u)*1.5) 0' }, `🏆 ${t.name.replace(/^the /, 'The ')}: ${t.holders.map(NameOf).join(' & ')} (${Math.max(0, Math.floor((today() - t.since) / 7))} wks)`));
    wrap.append(titles);
    return wrap;
  },

  pitches: (ctx) => {
    const s = S();
    const wrap = el('div');
    wrap.append(el('h2', 'cork-title', 'Napkins on the table'));
    const waiting = s.pitches.filter((p) => p.status === 'waiting');
    const later = s.pitches.filter((p) => p.status === 'not_yet');
    wrap.append(el('div', 'cork-sub', ctx.insider ? 'You can hear a pitch right here. Nobody talks shop in public.' : 'Pitches happen in private: the back booth, the locker room or Birdie\'s office.'));
    if (!waiting.length && !later.length) wrap.append(el('div', 'cork-empty', 'Nobody has a napkin out right now.\nAfter shows, the back booth fills up with ideas.'));
    for (const p of waiting) {
      const sheet = el('div', 'paper-sheet');
      const row = el('div', 'pitch-row');
      const txt = el('div', 'txt');
      txt.append(el('b', {}, `${NameOf(p.pitcher)}${p.scope === 'consult' ? ' wants your help' : p.scope === 'signature' ? ' (signature story)' : ' has a story for you'}`), `"${p.want}"`);
      row.append(face(p.pitcher), txt);
      if (ctx.insider) {
        const b = el('button', { class: 'btn primary' }, 'Hear it');
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          ctx.runAfterClose(async () => {
            const { runPitch } = await import('./napkin');
            await runPitch(p);
          });
        });
        row.append(b);
      }
      sheet.append(row);
      wrap.append(sheet);
    }
    for (const p of later) {
      const sheet = el('div', 'paper-sheet');
      const row = el('div', 'pitch-row');
      row.append(face(p.pitcher), el('div', 'txt', el('b', {}, `⭐ ${NameOf(p.pitcher)}: not yet`), `${shapeOf(p.shape).name}. Gold star. It'll come back.`));
      sheet.append(row);
      wrap.append(sheet);
    }
    // Bring someone your own idea.
    if (ctx.insider) {
      const sheet = el('div', 'paper-sheet');
      sheet.append(el('h4', {}, "I've got an idea"), el('div', { style: 'font-size:calc(var(--u)*6.5);margin-bottom:calc(var(--u)*3)' }, 'Pick someone to bring a story to. They\'ll react to every card you play.'));
      const strip = el('div', 'roster-strip');
      for (const w of WRESTLERS) {
        if (w === 'mothman' || w === 'lou') continue;
        const c = el('button', 'chip');
        c.append(portrait(w), NameOf(w));
        c.addEventListener('click', (e) => {
          e.stopPropagation();
          const p = playerPitch(w);
          if (!p) {
            toast(`${NameOf(w)} is booked solid right now.`);
            return;
          }
          ctx.runAfterClose(async () => {
            const { runPitch } = await import('./napkin');
            G.settings.involvement = G.settings.involvement === 'ask' ? 'ask' : G.settings.involvement;
            await runPitch(p);
          });
        });
        strip.append(c);
      }
      sheet.append(strip);
      wrap.append(sheet);
    }
    // Settings: how much control.
    const set = el('div', 'paper-sheet');
    set.append(el('h4', {}, 'When someone brings me a story...'));
    const opts = el('div', 'settings-opts');
    const cur = s.settings.birdieHandles ? 'birdie' : G.settings.involvement;
    const choices: [string, string][] = [['ask', 'Ask me every time'], ['drive', '"You drive"'], ['together', '"Let\'s build it together"'], ['idea', '"I\'ve got an idea"'], ['birdie', 'Let Birdie handle it (stories just happen)']];
    for (const [v, label] of choices) {
      const b = el('button', { class: `btn small${cur === v ? ' on' : ''}` }, label);
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        s.settings.birdieHandles = v === 'birdie';
        if (v !== 'birdie') G.settings.involvement = v as typeof G.settings.involvement;
        ctx.rerender();
      });
      opts.append(b);
    }
    const pace = el('div', 'btn-row');
    for (const p of ['chatty', 'steady', 'quiet'] as const) {
      const b = el('button', { class: `btn small${s.settings.pace === p ? ' gold' : ''}` }, `Pitch pace: ${p}`);
      b.addEventListener('click', (e) => { e.stopPropagation(); s.settings.pace = p; ctx.rerender(); });
      pace.append(b);
    }
    set.append(opts, pace);
    wrap.append(set);
    return wrap;
  },

  tin: () => {
    const wrap = el('div');
    const cards = tin();
    wrap.append(el('h2', 'cork-title', 'The Recipe Tin'), el('div', 'cork-sub', `Grandma's old recipe tin. ${cards.length} of ${Object.keys(CARD).length} story cards.`));
    const filter = el('div', 'tin-filter');
    const grid = el('div', 'tin-grid');
    let slot = 'all';
    const draw = () => {
      grid.replaceChildren();
      for (const o of cards) {
        const c = CARD[o.id];
        if (!c || (slot !== 'all' && c.slot !== slot)) continue;
        grid.append(cardEl(c, { stars: o.stars, badge: o.isNew ? 'NEW' : o.plays ? `PLAYED ${o.plays}×` : undefined }));
      }
    };
    for (const s of ['all', 'hook', 'twist', 'stakes', 'payoff', 'segment', 'wildcard']) {
      const b = el('button', { class: 'btn small' }, s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1) + 's');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        slot = s;
        for (const x of filter.children) x.classList.toggle('gold', x === b);
        draw();
      });
      if (s === 'all') b.classList.add('gold');
      filter.append(b);
    }
    wrap.append(filter, grid);
    draw();
    return wrap;
  },

  box: () => {
    const s = S();
    const wrap = el('div');
    wrap.append(el('h2', 'cork-title', 'The Napkin Box'), el('div', 'cork-sub', 'A shoebox under your bed. Every story that ran, signatures and coffee stains included.'));
    const list = [...s.archive].reverse().filter((a) => a.playerIn || a.scope !== 'background').concat([...s.archive].reverse().filter((a) => !a.playerIn && a.scope === 'background'));
    if (!list.length) wrap.append(el('div', 'cork-empty', 'Nothing in the box yet.'));
    const g = el('div', 'pin-grid');
    list.slice(0, 40).forEach((a: Archived, i) => {
      const pin = el('div', { class: `pinned${a.playerIn ? ' mine' : ''}`, style: `--r:${((i * 29) % 5) - 2}deg` });
      pin.append(el('span', 'pushpin gold'), el('h3', {}, a.title), el('div', 'shape', `${shapeOf(a.shape).name} · ${cal.dayLabel(a.start)} to ${cal.dayLabel(a.end)}`));
      const rv = el('div', 'rivals');
      rv.append(yarn(), polaroid(a.cast.hero, -3), el('span', 'vs-chip', 'VS'), polaroid(a.cast.villain, 4));
      pin.append(rv);
      pin.append(el('div', 'next-beat', `${a.endingLabel}${a.winner ? `: ${NameOf(a.winner)} won` : ''}. Best ${a.bestStars.toFixed(2).replace(/\.?0+$/, '')}★, peak buzz ${a.peakBuzz}.`));
      if (a.headlines[0]) pin.append(el('div', 'next-beat', `"${a.headlines[a.headlines.length - 1]}"`));
      if (a.lesson) pin.append(el('div', 'next-beat', `What we learned: ${a.lesson}`));
      const stamps = el('div', 'stamps');
      for (const x of a.stamps) stamps.append(el('span', `stamp${x === 'saved' ? ' teal' : ''}`, x.replace('_', ' ').toUpperCase()));
      if (a.signatures.length) stamps.append(el('span', 'stamp gold', `SIGNED ×${a.signatures.length}`));
      pin.append(stamps);
      g.append(pin);
    });
    wrap.append(g);
    return wrap;
  },

  career: () => {
    const s = S();
    const wrap = el('div');
    wrap.append(el('h2', 'cork-title', 'The Ladder'), el('div', 'cork-sub', `${RANK_NAMES[G.player.rank]} · Respect ${G.player.respect} · Fans ${G.player.fans} · Momentum ${G.player.momentum}`));
    const lad = el('div', 'ladder');
    const cur = RANKS.indexOf(G.player.rank);
    RANKS.forEach((r, i) => {
      const row = el('div', `rung${i < cur ? ' done' : i === cur ? ' now' : ''}`);
      row.append(el('span', 'n', String(i)), el('span', {}, RANK_NAMES[r]));
      lad.append(row);
    });
    wrap.append(lad);
    const p = progress();
    const sheet = el('div', { class: 'paper-sheet', style: 'margin-top:calc(var(--u)*8)' });
    if (s.career.pending) sheet.append(el('h4', {}, `Birdie wants a word: ${RANK_NAMES[s.career.pending]} is waiting.`));
    else if (p) {
      sheet.append(el('h4', {}, `Next rung: ${RANK_NAMES[p.rank]}`));
      for (const part of p.parts) {
        const r = el('div', 'req');
        const bar = el('div', 'buzz-bar');
        bar.append(el('i', { style: `width:${Math.min(100, (part.have / part.need) * 100)}%` }));
        r.append(el('span', {}, part.label), bar, el('span', 'num', `${Math.round(part.have * 100) / 100} / ${part.need}`));
        sheet.append(r);
      }
      if (p.have.day < p.req.minDay) sheet.append(el('div', { style: 'font-size:calc(var(--u)*6);margin-top:calc(var(--u)*3)' }, 'Birdie likes to watch a while before she moves anybody up.'));
    } else sheet.append(el('h4', {}, 'The top of the ladder. The whole building is yours.'));
    wrap.append(sheet);
    const rel = el('div', 'paper-sheet');
    rel.append(el('h4', {}, 'Red lines you have learned'));
    let any = false;
    for (const w of [...WRESTLERS, 'birdie']) {
      const c = charState(w);
      if (!c.learnedRedLines.length) continue;
      any = true;
      rel.append(el('div', { style: 'font-size:calc(var(--u)*6.5);margin:calc(var(--u)*1.5) 0' }, `${NameOf(w)}: ${c.learnedRedLines.map((x) => x.split('.').pop()).join(', ')}`));
    }
    if (!any) rel.append(el('div', { style: 'font-size:calc(var(--u)*6.5)' }, 'None yet. Getting to know people is part of the job.'));
    wrap.append(rel);
    return wrap;
  },

  booking: (ctx) => renderBooking({ rerender: ctx.rerender, startStory: (hero, villain, shapeId) => {
    const p = boardPitch(hero, villain, shapeId);
    if (!p) {
      toast("Couldn't cast that one right now.");
      return;
    }
    ctx.runAfterClose(async () => {
      const { runPitch } = await import('./napkin');
      await runPitch(p);
    });
  } }),
};

export { SHAPES, PLAYER };
