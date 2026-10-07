import './dungeon.css';
import { game } from '../../core/game';
import { G } from '../../core/state';
import { clockString, dateString } from '../../core/time';
import { iconFor } from '../../gfx/icons';
import { el, uiRoot } from '../../ui/dom';
import { eraFor, GOLDEN_FLOOR, floorTitle } from './eras';

/** The Dungeon's DOM HUD: floor plate, loot tally, clock, energy, action button, hints. */
export class DungeonHud {
  root: HTMLElement;
  private num: HTMLElement;
  private era: HTMLElement;
  private loot: HTMLElement;
  private clock: HTMLElement;
  private date: HTMLElement;
  private efill: HTMLElement;
  private action: HTMLButtonElement;
  private hint: HTMLElement;
  private streak: HTMLElement;
  private lootEls = new Map<string, HTMLElement>();
  private last = '';
  private actionLabel: string | null = null;

  constructor(onAction: () => void, onMenu: () => void) {
    this.root = el('div', 'dg-hud passthrough');
    const plate = el('div', 'dg-floor panel dark');
    this.num = el('div', 'dg-num');
    this.era = el('div', 'dg-era');
    this.loot = el('div', 'dg-loot');
    plate.append(this.num, this.era, this.loot);
    const ticket = el('div', 'dg-clock panel');
    this.clock = el('div', 't');
    this.date = el('div', 'd');
    ticket.append(this.clock, this.date);
    const energy = el('div', 'dg-energy panel', el('b', {}, 'E'));
    this.efill = el('div', 'dg-efill');
    energy.append(el('div', 'dg-ebar', this.efill));
    this.action = el('button', { class: 'btn primary dg-action' }, 'Work') as HTMLButtonElement;
    this.action.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      onAction();
    });
    this.action.style.display = 'none';
    const menu = el('button', { class: 'btn dg-menu' }, '☰');
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      onMenu();
    });
    this.hint = el('div', 'dg-hint panel');
    this.streak = el('div', 'dg-streak');
    this.root.append(plate, ticket, energy, this.action, menu, this.hint, this.streak);
    uiRoot().append(this.root);
  }

  setFloor(floor: number): void {
    const { era } = eraFor(floor);
    this.num.innerHTML = `FLOOR ${floor}<small>${floor === GOLDEN_FLOOR ? '★' : era.year}</small>`;
    this.era.textContent = floorTitle(floor);
  }

  /** Show the floor title card in the middle of the screen. */
  titleCard(floor: number): void {
    const { era } = eraFor(floor);
    const card = el('div', 'dg-title', el('div', 'n', `FLOOR ${floor}`), el('div', 'e', floorTitle(floor)), el('div', 'y', floor === GOLDEN_FLOOR ? 'THE BOTTOM' : era.year));
    this.root.append(card);
    setTimeout(() => card.remove(), 2700);
  }

  addLoot(id: string, n: number): void {
    let s = this.lootEls.get(id);
    if (!s) {
      const c = document.createElement('canvas');
      const icon = iconFor(id);
      c.width = icon.width;
      c.height = icon.height;
      c.getContext('2d')!.drawImage(icon, 0, 0);
      s = el('span', {}, c, el('i', { style: 'font-style:normal' }, '0'));
      s.dataset.n = '0';
      this.lootEls.set(id, s);
      this.loot.append(s);
    }
    const total = Number(s.dataset.n) + n;
    s.dataset.n = String(total);
    (s.lastChild as HTMLElement).textContent = `×${total}`;
    s.classList.remove('bump');
    void s.offsetWidth;
    s.classList.add('bump');
  }

  setAction(label: string | null): void {
    if (label === this.actionLabel) return;
    this.actionLabel = label;
    if (!label) {
      this.action.style.display = 'none';
      return;
    }
    this.action.style.display = game.input.lastDevice === 'touch' ? '' : 'none';
    this.action.textContent = label;
  }

  setHint(text: string | null, gold = false): void {
    this.hint.style.opacity = text ? '1' : '0';
    if (text) this.hint.textContent = text;
    this.hint.classList.toggle('gold', gold);
  }

  setStreak(n: number): void {
    const t = n >= 2 ? `HOT STREAK ×${n}` : '';
    if (this.streak.textContent !== t) {
      this.streak.textContent = t;
      this.streak.classList.remove('pop');
      void this.streak.offsetWidth;
      if (t) this.streak.classList.add('pop');
    }
  }

  update(): void {
    const key = `${G.time.day}-${Math.floor(G.time.minutes / 10)}-${Math.round(G.player.energy)}`;
    if (key === this.last) return;
    this.last = key;
    this.clock.textContent = clockString();
    this.date.textContent = dateString();
    const e = Math.max(0, G.player.energy / G.player.maxEnergy);
    this.efill.style.height = `${e * 100}%`;
    this.efill.classList.toggle('low', e < 0.2);
  }

  show(on: boolean): void {
    this.root.style.display = on ? '' : 'none';
  }

  destroy(): void {
    this.root.remove();
  }
}
