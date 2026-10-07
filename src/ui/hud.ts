import './hud.css';
import { game } from '../core/game';
import { G } from '../core/state';
import { clockString, DAY_END, DAY_START, isShowDay, isSupershow, SEASONS, SUPERSHOWS, weekday, WEEKDAYS } from '../core/time';
import { el, uiRoot } from './dom';

/** The in-world HUD: date/clock ticket, money, energy, menu and action buttons. */
export class Hud {
  root: HTMLElement;
  private clock: HTMLElement;
  private date: HTMLElement;
  private money: HTMLElement;
  private weather: HTMLElement;
  private sun: HTMLElement;
  private energy: HTMLElement;
  private action: HTMLButtonElement;
  private showTag: HTMLElement;
  private ticket: HTMLElement;
  private goal: HTMLElement;
  private last = '';
  private lastGoal = '';
  goalFn: (() => string | null) | null = null;

  constructor(onMenu: () => void, onAction: () => void) {
    this.root = el('div', 'hud passthrough');
    const ticket = (this.ticket = el('div', 'hud-ticket panel'));
    this.date = el('div', 'hud-date');
    this.clock = el('div', 'hud-clock');
    this.sun = el('div', 'hud-sun');
    this.weather = el('span', 'hud-weather');
    this.money = el('div', 'hud-money');
    this.showTag = el('div', 'hud-show');
    ticket.append(el('div', 'hud-row', this.sun, el('div', {}, this.date, this.clock)), el('div', 'hud-row2', this.weather, this.money), this.showTag);
    const energyWrap = el('div', 'hud-energy panel', el('div', 'hud-e-lbl', 'E'));
    this.energy = el('div', 'hud-e-fill');
    energyWrap.append(el('div', 'hud-e-bar', this.energy));
    const menuBtn = el('button', { class: 'btn hud-menu' }, '☰');
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onMenu();
    });
    this.action = el('button', { class: 'btn primary hud-action' }, 'Talk') as HTMLButtonElement;
    this.action.addEventListener('click', (e) => {
      e.stopPropagation();
      onAction();
    });
    this.action.style.display = 'none';
    this.goal = el('div', 'hud-goal panel');
    this.goal.style.display = 'none';
    this.root.append(ticket, this.goal, energyWrap, menuBtn, this.action);
    uiRoot().append(this.root);
    window.addEventListener('resize', this.placeGoal);
  }

  /**
   * The goal slip has a fixed CSS top, but the ticket grows when the show-night banner is
   * showing; then the slip covered the banner. Push it down just enough to clear the ticket.
   */
  private placeGoal = (): void => {
    if (this.goal.style.display === 'none') return;
    this.goal.style.top = '';
    const gap = 4;
    const overlap = this.ticket.getBoundingClientRect().bottom + gap - this.goal.getBoundingClientRect().top;
    if (overlap > 0) this.goal.style.top = `${parseFloat(getComputedStyle(this.goal).top) + overlap}px`;
  };

  setAction(label: string | null): void {
    if (!label) {
      this.action.style.display = 'none';
      return;
    }
    // Keyboard players see the prompt over the world; the button is for touch.
    this.action.style.display = game.input.lastDevice === 'touch' ? '' : 'none';
    this.action.textContent = label;
  }

  update(): void {
    const g = this.goalFn?.() ?? '';
    if (g !== this.lastGoal) {
      this.lastGoal = g;
      this.goal.textContent = g ? `★ ${g}` : '';
      this.goal.style.display = g ? '' : 'none';
      this.placeGoal();
      if (g) this.goal.animate([{ transform: 'translateX(20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'ease-out' });
    }
    const t = G.time;
    const key = `${t.day}-${Math.floor(t.minutes / 10)}-${G.player.money}-${Math.round(G.player.energy)}-${G.weather.today}`;
    if (key === this.last) return;
    this.last = key;
    this.date.textContent = `${WEEKDAYS[weekday()]} ${t.day} · ${SEASONS[t.season]}`;
    this.clock.textContent = clockString();
    this.money.textContent = `$${G.player.money.toLocaleString()}`;
    this.weather.textContent = { sun: 'Fair', rain: 'Rain', storm: 'Storm', wind: 'Windy', snow: 'Snow' }[G.weather.today];
    const k = (t.minutes - DAY_START) / (DAY_END - DAY_START);
    this.sun.style.setProperty('--k', String(k));
    this.sun.classList.toggle('night', t.minutes >= 20 * 60);
    const e = G.player.energy / G.player.maxEnergy;
    this.energy.style.height = `${Math.max(0, e * 100)}%`;
    this.energy.classList.toggle('low', e < 0.25);
    if (isShowDay()) {
      const name = isSupershow() ? SUPERSHOWS[t.season] : weekday() === 2 ? 'Wed Night @ VFW' : 'Sat Night @ Sportatorium';
      this.showTag.textContent = `★ ${name} · 7PM`;
      this.showTag.style.display = '';
    } else this.showTag.style.display = 'none';
    this.placeGoal();
  }

  destroy(): void {
    window.removeEventListener('resize', this.placeGoal);
    this.root.remove();
  }
}
