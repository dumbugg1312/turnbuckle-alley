import { audio } from '../audio';
import { block, game } from '../core/game';
import { G, addItem } from '../core/state';
import { item } from '../data/items';
import { iconFor } from '../gfx/icons';
import { say, toast } from '../ui/dialog';
import { el, markup, uiRoot } from '../ui/dom';
import { speakerFor } from '../world/talk';

export interface ShopDef {
  id: string;
  name: string;
  keeper: string; // npc id
  open: [number, number]; // minutes
  days?: number[]; // weekdays open (default all)
  stock: string[];
  greeting: string;
  /** Item categories this shop buys from you (half price). */
  buys?: string[];
}

const H = (h: number) => h * 60;
export const SHOPS: Record<string, ShopDef> = {
  diner: { id: 'diner', name: 'Hot Tag Diner', keeper: 'june', open: [H(6), H(24)], stock: ['coffee', 'pie', 'hot-tag-special', 'chili-dog'], greeting: "What'll it be, sugar? Kitchen's hot." },
  taqueria: { id: 'taqueria', name: 'Taqueria Mariposa', keeper: 'mariposa', open: [H(7), H(23)], stock: ['tamales', 'horchata', 'concha'], greeting: '*La Mariposa bows silently and gestures at the menu board. The tamales smell incredible.*' },
  bakery: { id: 'bakery', name: 'Tallbridge Bakery', keeper: 'tiny', open: [H(6), H(18)], stock: ['tiny-cake', 'concha', 'sheet-cake', 'bouquet', 'honey'], greeting: 'Welcome in! Everything is very small and very delicious.' },
  gasstation: { id: 'gasstation', name: 'Gas · Bait · Snacks', keeper: 'dex', open: [H(6), H(24)], stock: ['gas-hotdog', 'bait', 'protein-shake', 'lemonade', 'trading-card'], greeting: "Gas, bait, snacks. Mostly snacks. Don't tell my boss." },
  hardware: { id: 'hardware', name: 'Steel Chair Hardware', keeper: 'bo', open: [H(8), H(18)], days: [0, 1, 2, 3, 4, 5], stock: ['plank', 'tape', 'chalk', 'blank-tee', 'foam-finger'], greeting: "Steel Chair Hardware. If it bolts, binds or folds, we got it." },
  pawn: { id: 'pawn', name: "Fenwick's Pawn & Tapes", keeper: 'fenwick', open: [H(9), H(21)], stock: ['trading-card', 'toy-wrestler', 'vinyl', 'old-program', 'mothman-figure', 'cassette'], greeting: 'Tapes in the bin, treasures on the shelf, truth out there somewhere.', buys: ['flea', 'wrestling', 'material', 'nature', 'merch'] },
  fair: { id: 'fair', name: 'Fair Stands', keeper: 'clint', open: [H(10), H(22)], stock: ['corn-dog', 'lemonade', 'funnel-cake', 'honey'], greeting: 'Corn dogs, lemonade, and the best funnel cake in three counties.' },
};

export async function openShop(id: string): Promise<void> {
  const shop = SHOPS[id];
  if (!shop) return;
  const m = G.time.minutes;
  const wd = (G.time.day - 1) % 7;
  if (m < shop.open[0] || m >= shop.open[1] || (shop.days && !shop.days.includes(wd))) {
    await say(null, `${shop.name} is closed right now. Open ${fmtTime(shop.open[0])} to ${fmtTime(shop.open[1])}${shop.days ? ', closed Sundays' : ''}.`);
    return;
  }
  await say(speakerFor(shop.keeper), shop.greeting);
  await shopUi(shop);
}

function fmtTime(m: number): string {
  const h = Math.floor(m / 60) % 24;
  return `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}`;
}

function shopUi(shop: ShopDef): Promise<void> {
  const unblock = block();
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const box = el('div', 'modal panel shop-modal');
    const money = el('div', 'shop-money');
    const list = el('div', 'shop-list');
    const refresh = () => {
      money.textContent = `Your money: $${G.player.money}`;
      [...list.querySelectorAll<HTMLButtonElement>('button.buy')].forEach((b) => (b.disabled = G.player.money < Number(b.dataset.price)));
    };
    for (const id of shop.stock) {
      const def = item(id);
      const row = el('div', 'shop-row');
      const ico = document.createElement('canvas');
      const src = iconFor(id);
      ico.width = src.width;
      ico.height = src.height;
      ico.className = 'shop-ico';
      ico.getContext('2d')!.drawImage(src, 0, 0);
      const buy = el('button', { class: 'btn small primary buy', 'data-price': def.price }, `$${def.price}`);
      buy.addEventListener('click', () => {
        if (G.player.money < def.price) return;
        G.player.money -= def.price;
        addItem(id, 1);
        audio.sfx('coin');
        toast(`Bought ${def.name}`, iconFor(id));
        refresh();
      });
      row.append(ico, el('div', 'shop-info', el('div', 'shop-name', def.name), el('div', { class: 'shop-desc', html: markup(def.desc) })), buy);
      list.append(row);
    }
    let sell: HTMLElement | null = null;
    if (shop.buys) {
      sell = el('button', { class: 'btn teal' }, 'Sell something');
      sell.addEventListener('click', async () => {
        const { pickItem } = await import('../ui/menu');
        const ids = Object.keys(G.player.inventory).filter((id) => shop.buys!.includes(item(id).cat) && G.player.inventory[id] > 0);
        if (!ids.length) {
          toast("You don't have anything Fenwick wants. (He wants everything. Just not that.)");
          return;
        }
        const id = await pickItem('Sell which item? (half price)', ids);
        if (!id) return;
        const price = Math.max(1, Math.floor(item(id).price / 2));
        addItem(id, -1);
        G.player.money += price;
        audio.sfx('coin');
        toast(`Sold ${item(id).name} for $${price}`);
        refresh();
      });
    }
    const leave = el('button', { class: 'btn' }, 'Thanks!');
    const done = () => {
      overlay.remove();
      off();
      unblock();
      game.input.clear();
      resolve();
    };
    leave.addEventListener('click', done);
    const off = game.input.onKey((_k, code) => {
      if (code === 'Escape') done();
    });
    box.append(el('h2', {}, shop.name), money, list, el('div', 'menu-actions', leave, sell));
    overlay.append(box);
    uiRoot().append(overlay);
    refresh();
  });
}
