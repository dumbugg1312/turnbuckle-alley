import './tapes.css';
import { audio } from '../../audio';
import { block, game } from '../../core/game';
import { G, skillLevel } from '../../core/state';
import { sting } from '../../core/sting';
import { absDay, isSaturday, weekday } from '../../core/time';
import { narrate, toast } from '../../ui/dialog';
import { el, markup, uiRoot } from '../../ui/dom';
import type { MapObject } from '../../world/types';
import { BINS, isWeekend } from './bins';
import { tapeDef } from './catalog';
import { sharpieLabel } from './label';
import { acquireTape, markBought, tapesState, todaysCrate } from './state';
import type { BinId, CrateSlot, TapeDef } from './types';

const RARITY_TAG: Record<TapeDef['rarity'], string> = { common: '', uncommon: 'Ooh, interesting', rare: '★ Rare find', legendary: '★★ LEGENDARY' };

const FENWICK_YES = [
  'Fenwick sighs like a deflating tire. "You drive a hard bargain. Fine. FINE."',
  '"For you? Because you have kind eyes? ...Okay. But don\'t tell the Mothman."',
  'Fenwick squints at you through his yellow aviators. "Deal. You remind me of me."',
];
const FENWICK_NO = [
  '"That one? Oh, no no no. That one\'s priced for its feelings."',
  'Fenwick hugs the tape to his vest. "Some things are worth what they cost, friend."',
  '"I knocked a dollar off in my heart. My heart is not the register."',
];

function uPx(): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u')) || 2;
}

/** A VHS spine for the crate (or the library shelf). */
export function spineEl(t: TapeDef | null, opts: { mystery?: boolean; seed?: number; short?: boolean } = {}): HTMLElement {
  const mystery = !t || opts.mystery;
  const style = mystery ? (t?.spine.kind === 'white' ? 'white' : 'bare') : t.spine.kind;
  const sp = el('div', `tp-spine k-${style}${mystery ? ' mystery' : ''}`);
  const seed = opts.seed ?? 0;
  sp.style.setProperty('--tilt', `${((seed % 7) - 3) * 0.5}deg`);
  if (t && t.spine.kind === 'retail' && !mystery) {
    sp.style.setProperty('--sp-bg', t.spine.color);
    sp.style.setProperty('--sp-ink', t.spine.ink);
  }
  if (t && t.spine.kind === 'clamshell' && !mystery) sp.style.setProperty('--sp-bg', t.spine.color);
  const lab = el('div', 'tp-spine-label');
  if (!mystery && t) {
    const u = uPx();
    const scale = Math.min(4, u * (window.devicePixelRatio || 1));
    if (t.spine.kind === 'retail') {
      lab.append(el('span', 'tp-printed', t.label.replace(/\s+/g, ' ')));
    } else {
      const paper = t.spine.kind === 'bare' ? '#f6f0e2' : t.spine.kind === 'scraped' ? '#e8dcc0' : null;
      const ink = t.spine.kind === 'clamshell' ? '#1e1426' : '#1e1426';
      lab.append(sharpieLabel(t.label, { width: opts.short ? 58 : 66, height: 15, paper, ink, lines: 2 }, scale));
    }
  } else {
    lab.append(el('span', 'tp-blank', t?.spine.kind === 'scraped' || seed % 3 === 0 ? '' : '?'));
  }
  sp.append(lab);
  const stk = !mystery && t?.stickers?.[0];
  if (stk) sp.append(el('div', `tp-stk s${seed % 3}`, stk));
  if (!mystery && t?.stickers?.includes('BE KIND REWIND')) sp.append(el('div', 'tp-stk rewind', 'BE KIND ◀◀'));
  return sp;
}

function priceTag(slot: CrateSlot, price: number): HTMLElement {
  if (slot.free) return el('div', 'tp-price free', 'FREE!');
  if (price === 0) return el('div', 'tp-price free', 'TAKE IT');
  return el('div', 'tp-price', `$${price}`);
}

export async function openDig(binArg: string, object: MapObject): Promise<void> {
  const st = tapesState();
  const crate = todaysCrate(binArg, object.id);
  const def = BINS[crate.bin];
  const day = absDay();
  const fresh = st.binSeen[crate.key] !== day;
  st.binSeen[crate.key] = day;
  if (!st.tutorial.dig) {
    st.tutorial.dig = true;
    await narrate(
      'A cardboard crate of VHS tapes, every one of them labeled in somebody\'s handwriting.',
      'Crate-digging 101: flip through the spines, read the labels, pick one. Unlabeled tapes are a gamble. Fenwick says that\'s half the fun. He\'s right.',
      'Crates restock every day. Weekends are busiest, and *rainy days are great tape days*: folks clean out their basements.',
    );
  }
  if (!crate.slots.length) {
    await narrate(fresh ? 'The crate is empty today. Just a mothball and a coupon for a video store that closed in 1998.' : "You've picked this crate clean for today. Fresh stock tomorrow.");
    return;
  }
  st.stats.dug++;
  const unblock = block();
  audio.sfx('grab');
  const result = await runDig(crate.bin, crate.key, crate.slots, def.name);
  unblock();
  game.input.clear();
  game.clock.advance(20);
  if (result) {
    const t = tapeDef(result.tape)!;
    if (result.isNew) toast(`📼 *${t.title}* added to your tape library.`);
    else toast(`📼 A spare copy of *${t.title}*. Good for trading or gifting.`);
    if (!st.tutorial.watch) toast('Pop it in any VCR to watch it.');
  }
}

interface DigResult {
  tape: string;
  isNew: boolean;
}

function runDig(bin: BinId, key: string, slots: CrateSlot[], title: string): Promise<DigResult | null> {
  return new Promise((resolve) => {
    const st = tapesState();
    const def = BINS[bin];
    const owned = new Set(Object.keys(st.library));
    const rainy = G.weather.today === 'rain' || G.weather.today === 'storm';
    const fenwickHere = bin === 'fenwick' || (bin === 'flea' && isWeekend(weekday()) && G.time.minutes >= 7 * 60 && G.time.minutes < 17 * 60);
    const honorBox = bin === 'flea' && (G.time.minutes >= 18 * 60 || G.time.minutes < 7 * 60);
    const prices = slots.map((s) => s.price);
    let sel = 0;
    let done = false;

    const root = el('div', 'tp-dig');
    if (rainy) root.classList.add('rainy');
    const head = el('div', 'tp-dig-head');
    const sign = el('div', 'tp-sign', def.sign);
    const sub: string[] = [];
    if (bin === 'yard-sale') sub.push(isSaturday() ? 'Somebody\'s garage, emptied onto a card table.' : 'Sunday yard sale. Everything must go.');
    else if (honorBox) sub.push('The vendors have packed up. A coffee can says HONOR SYSTEM.');
    else if (bin === 'flea' && !isWeekend(weekday())) sub.push('Weekday: most stalls are closed. The good stuff comes out on weekends.');
    if (rainy) sub.push('Rainy day. Great tape weather.');
    head.append(sign, el('div', 'tp-dig-sub', el('b', {}, title), sub.length ? ` · ${sub.join(' ')}` : ''));
    const money = el('div', 'tp-money');
    const paintMoney = () => (money.textContent = `$${G.player.money}`);
    paintMoney();
    head.append(money);

    const crateWrap = el('div', 'tp-crate-wrap');
    const crateEl = el('div', `tp-crate b-${bin}`);
    const spinesRow = el('div', 'tp-spines');
    const spines = slots.map((s, i) => {
      const t = tapeDef(s.tape)!;
      const sp = spineEl(t, { mystery: s.mystery, seed: i * 7 + key.length });
      sp.style.animationDelay = `${i * 40}ms`;
      if (!s.mystery && owned.has(s.tape)) sp.classList.add('owned');
      if (s.free) sp.append(el('div', 'tp-stk free', 'FREE'));
      sp.addEventListener('click', (e) => {
        e.stopPropagation();
        if (i === sel) buy();
        else select(i);
      });
      spinesRow.append(sp);
      return sp;
    });
    crateEl.append(spinesRow, el('div', 'tp-crate-front', el('div', 'tp-crate-handle'), el('div', 'tp-crate-stencil', bin === 'fenwick' ? 'FRAGILE · F.T.' : bin === 'yard-sale' ? 'GARAGE STUFF' : 'PRODUCE')));
    crateWrap.append(crateEl);

    const detail = el('div', 'tp-detail panel');
    const hint = el('div', 'tp-hint', game.input.lastDevice === 'keyboard' ? '◀ ▶ flip · E buy · H haggle · X leave' : 'Swipe or tap to flip · tap again to pick');
    root.append(head, el('div', 'tp-dig-body', crateWrap, detail), hint);
    uiRoot().append(root);

    let bubble = '';
    const paint = () => {
      spines.forEach((sp, i) => {
        sp.classList.toggle('sel', i === sel);
        sp.classList.toggle('near', Math.abs(i - sel) === 1);
      });
      const s = slots[sel];
      const t = tapeDef(s.tape)!;
      const price = prices[sel];
      detail.innerHTML = '';
      const u = uPx();
      const scale = Math.min(4, u * (window.devicePixelRatio || 1));
      const labelBox = el('div', 'tp-big-label');
      if (s.mystery) labelBox.append(el('div', 'tp-nolabel', t.spine.kind === 'scraped' ? 'label scraped off' : 'no label'));
      else if (t.spine.kind === 'retail') labelBox.append(el('div', { class: 'tp-retail-big', style: `background:${t.spine.color};color:${t.spine.ink}` }, t.label));
      else labelBox.append(sharpieLabel(t.label, { width: 150, height: 30, paper: '#f6f0e2', lines: 2 }, scale));
      detail.append(labelBox);
      const info = el('div', 'tp-info');
      if (s.mystery) {
        info.append(el('div', 'tp-meta', 'Unlabeled. Could be anything. Could be a soap opera.'));
        info.append(el('div', 'tp-blurb', 'Mystery tapes are a flat price. You only find out what it is when you get it home.'));
      } else {
        info.append(el('div', 'tp-meta', `${t.year} · ${t.promo}`));
        const tag = RARITY_TAG[t.rarity];
        if (tag) info.append(el('div', `tp-rarity r-${t.rarity}`, tag));
        info.append(el('div', { class: 'tp-blurb', html: markup(t.blurb) }));
      }
      detail.append(info);
      if (!s.mystery && owned.has(s.tape)) detail.append(el('div', 'tp-stamp', 'ALREADY HAVE'));
      detail.append(priceTag(s, price));
      if (bubble) detail.append(el('div', 'tp-bubble', bubble));
      const actions = el('div', 'tp-actions');
      const canAfford = G.player.money >= price;
      const buyBtn = el('button', { class: 'btn primary' }, price === 0 ? 'Take it' : honorBox ? `Leave $${price} in the can` : `Buy · $${price}`) as HTMLButtonElement;
      buyBtn.disabled = !canAfford;
      buyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        buy();
      });
      actions.append(buyBtn);
      const hk = `${key}:${s.tape}`;
      if (def.haggle && fenwickHere && price > 1 && !s.free) {
        const hb = el('button', { class: 'btn teal' }, 'Haggle') as HTMLButtonElement;
        hb.disabled = st.haggled[hk] === absDay();
        hb.addEventListener('click', (e) => {
          e.stopPropagation();
          haggle();
        });
        actions.append(hb);
      }
      const leave = el('button', { class: 'btn small' }, 'Leave crate');
      leave.addEventListener('click', (e) => {
        e.stopPropagation();
        finish(null);
      });
      actions.append(leave);
      if (!canAfford) actions.append(el('div', 'tp-broke', 'Not enough cash.'));
      detail.append(actions);
    };

    const select = (i: number) => {
      const n = Math.max(0, Math.min(slots.length - 1, i));
      if (n !== sel) {
        sel = n;
        bubble = '';
        audio.sfx('select', { pitch: 0.9 + Math.random() * 0.2 });
        paint();
      }
    };

    const haggle = () => {
      const s = slots[sel];
      const hk = `${key}:${s.tape}`;
      if (st.haggled[hk] === absDay()) return;
      st.haggled[hk] = absDay();
      const chance = Math.min(0.85, 0.32 + skillLevel('charisma') * 0.06 + (G.weather.today === 'rain' ? 0.08 : 0));
      if (Math.random() < chance) {
        prices[sel] = Math.max(1, Math.round(prices[sel] * (0.62 + Math.random() * 0.12)));
        bubble = FENWICK_YES[Math.floor(Math.random() * FENWICK_YES.length)];
        audio.sfx('coin');
        G.player.skills.charisma += 4;
      } else {
        bubble = FENWICK_NO[Math.floor(Math.random() * FENWICK_NO.length)];
        audio.sfx('error');
      }
      paint();
    };

    const buy = () => {
      if (done) return;
      const s = slots[sel];
      const price = prices[sel];
      if (G.player.money < price) {
        audio.sfx('error');
        spines[sel].animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 });
        return;
      }
      done = true;
      if (price > 0) {
        G.player.money -= price;
        game.bus.emit('money', G.player.money);
      }
      paintMoney();
      markBought(key, s.tape);
      const isNew = acquireTape(s.tape);
      const t = tapeDef(s.tape)!;
      audio.sfx('pickup');
      spines[sel].classList.add('pulled');
      const big = t.rarity === 'rare' || t.rarity === 'legendary';
      setTimeout(() => {
        if (s.mystery) reveal(t, isNew);
        else {
          sting(big ? 'reveal' : 'item-get');
          setTimeout(() => finish({ tape: s.tape, isNew }), 380);
        }
      }, 420);
    };

    const reveal = (t: TapeDef, isNew: boolean) => {
      const big = t.rarity === 'rare' || t.rarity === 'legendary';
      sting(big ? 'reveal' : 'item-get');
      const box = el('div', `tp-reveal panel r-${t.rarity}`);
      box.append(el('div', 'tp-reveal-top', 'You pop it in the VCR at the stall. It\'s...'));
      const sp = spineEl(t, { seed: 3 });
      sp.classList.add('flat');
      box.append(sp, el('div', 'tp-reveal-title', t.title), el('div', 'tp-meta', `${t.year} · ${t.promo}`));
      if (RARITY_TAG[t.rarity]) box.append(el('div', `tp-rarity r-${t.rarity}`, RARITY_TAG[t.rarity]));
      if (!isNew) box.append(el('div', 'tp-meta', '(You already have this one. Spare copy!)'));
      const ok = el('button', { class: 'btn primary' }, big ? 'NO WAY.' : 'Nice.');
      ok.addEventListener('click', (e) => {
        e.stopPropagation();
        finish({ tape: t.id, isNew });
      });
      box.append(ok);
      root.append(el('div', 'tp-reveal-wrap', box));
      ok.focus();
    };

    // Swipe / drag across the crate.
    let dragX: number | null = null;
    let moved = false;
    crateWrap.addEventListener('pointerdown', (e) => {
      dragX = e.clientX;
      moved = false;
    });
    crateWrap.addEventListener('pointermove', (e) => {
      if (dragX === null || done) return;
      const step = Math.max(14, spines[0].getBoundingClientRect().width * 0.9);
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > step) {
        select(sel + (dx > 0 ? -1 : 1));
        dragX = e.clientX;
        moved = true;
      }
    });
    const endDrag = () => (dragX = null);
    crateWrap.addEventListener('pointerup', endDrag);
    crateWrap.addEventListener('pointerleave', endDrag);
    crateWrap.addEventListener('click', (e) => {
      if (moved) e.stopPropagation();
    }, true);
    crateWrap.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) + Math.abs(e.deltaX) > 8) select(sel + (e.deltaY + e.deltaX > 0 ? 1 : -1));
    }, { passive: false });

    const offKey = game.input.onKey((_k, code) => {
      if (done) {
        if (code === 'Enter' || code === 'Space' || code === 'KeyE' || code === 'Escape') {
          const ok = root.querySelector<HTMLButtonElement>('.tp-reveal .btn');
          ok?.click();
        }
        return;
      }
      if (code === 'ArrowLeft' || code === 'KeyA') select(sel - 1);
      else if (code === 'ArrowRight' || code === 'KeyD') select(sel + 1);
      else if (code === 'Enter' || code === 'Space' || code === 'KeyE' || code === 'KeyZ') buy();
      else if (code === 'KeyH') haggle();
      else if (code === 'Escape' || code === 'KeyX' || code === 'Backspace') finish(null);
    });

    function finish(r: DigResult | null) {
      offKey();
      root.classList.add('closing');
      setTimeout(() => root.remove(), 220);
      resolve(r);
    }

    paint();
  });
}
