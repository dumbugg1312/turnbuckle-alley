import { Rng } from '../core/rng';
import { makeCall } from './ai';
import { cardDef } from './cards';
import type { Call, CardDef, CardType, Goal, MatchConfig, MatchEvent, MatchResult, OppPos, PhaseDef, PhaseId, SelfPos } from './types';

export type HandCard = CardDef & { upgraded: boolean; entry: string; uid: number; displayName: string };

const OFFENSIVE: CardType[] = ['strike', 'grapple', 'aerial', 'submission', 'signature', 'finisher'];

const GAS_WINDED = 8;

/** Build the story phase script for this pairing. */
export function buildPhases(cfg: MatchConfig): PhaseDef[] {
  const p = cfg.player.role;
  const o = cfg.opponent.role;
  const lockup: PhaseDef = {
    id: 'lockup', name: 'Feeling Out', offense: 'both', maxTurns: 2,
    goal: { kind: 'play', types: ['grapple', 'submission'], count: 2, label: 'Play 2 Grapples or Holds' },
    hint: 'Start slow. Lock up, trade holds, let the crowd settle in.',
  };
  const stretch: PhaseDef = {
    id: 'stretch', name: 'Down the Stretch', offense: 'both', maxTurns: 4,
    goal: { kind: 'nearfalls', count: 2, label: 'Two near-falls' },
    hint: 'Big moves and close calls. Cover after a big move; kick out late when they cover you.',
  };
  const finish: PhaseDef = {
    id: 'finish', name: 'The Finish', offense: 'both', maxTurns: 2,
    goal: { kind: 'finish', label: cfg.winner === 'player' ? 'Hit your finisher' : 'Take their finisher' },
    hint: cfg.winner === 'player' ? 'Your finisher is in your hand. Bring it home.' : 'Tonight, you make them look like a star. Sell the finish.',
  };
  if (cfg.short) {
    return [
      lockup,
      { id: 'trade', name: 'Trading Blows', offense: 'both', maxTurns: 3, goal: { kind: 'crowd', amount: 40, label: 'Crowd to 40' }, hint: 'Go back and forth. Show them something.' },
      finish,
    ];
  }
  if (p === o) {
    return [
      lockup,
      { id: 'trade', name: 'Back and Forth', offense: 'both', maxTurns: 4, goal: { kind: 'crowd', amount: 55, label: 'Crowd to 55' }, hint: 'Two friends trying to top each other. Keep it moving.' },
      stretch,
      finish,
    ];
  }
  if (p === 'face') {
    return [
      lockup,
      { id: 'shine', name: 'The Shine', offense: 'player', maxTurns: 3, goal: { kind: 'crowd', amount: 35, label: 'Crowd to 35' }, hint: "You're the hero. Get your offense in and get them cheering." },
      { id: 'heat', name: 'The Heat', offense: 'opponent', maxTurns: 3, goal: { kind: 'sympathy', amount: 5, label: 'Build 5 Sympathy' }, hint: "They've cut you off. Sell! Every bump makes the comeback bigger. Don't fight back yet." },
      { id: 'comeback', name: 'The Comeback', offense: 'player', maxTurns: 2, goal: { kind: 'combo', count: 3, label: '3 moves in one turn' }, hint: 'FIRE UP! Chain your offense together. Sympathy multiplies everything.' },
      stretch,
      finish,
    ];
  }
  // Player is the heel.
  return [
    lockup,
    { id: 'shine', name: 'Their Shine', offense: 'opponent', maxTurns: 3, goal: { kind: 'play', types: ['sell'], count: 2, label: 'Sell 2 of their moves' }, hint: "They're the hero. Bump for them and make the crowd believe." },
    { id: 'heat', name: 'Your Heat', offense: 'player', maxTurns: 3, goal: { kind: 'play', types: ['strike', 'grapple', 'submission', 'taunt'], count: 4, label: 'Draw heat: 4 moves (cheats count double)' }, hint: 'Cut them off and control the match. Cheat. Gloat. Make them hate you.' },
    { id: 'comeback', name: 'Their Comeback', offense: 'opponent', maxTurns: 2, goal: { kind: 'play', types: ['sell'], count: 2, label: 'Sell the comeback' }, hint: "Here comes the hero. Feed them, bump big, let the crowd explode." },
    stretch,
    finish,
  ];
}

export class Match {
  readonly cfg: MatchConfig;
  readonly rng: Rng;
  readonly phases: PhaseDef[];
  phaseIndex = 0;
  turn = 0;
  turnInPhase = 0;
  stretchTurn = 0;
  energy = 3;
  maxEnergy = 3;
  gas: number;
  maxGas: number;
  crowd = 8;
  peak = 8;
  sympathy = 0;
  heat = 0;
  oppPos: OppPos = 'standing';
  selfPos: SelfPos = 'standing';
  draw: HandCard[] = [];
  hand: HandCard[] = [];
  discard: HandCard[] = [];
  exhausted: HandCard[] = [];
  call: Call | null = null;
  /** Total sell multiplier queued against the opponent's move this turn. */
  sellQueued = 0;
  reversalQueued = false;
  hype = 1;
  playedThisTurn = 0;
  offenseThisTurn = 0;
  goalProgress = 0;
  nearfalls = 0;
  lastPinPop = 0;
  powers = new Set<string>();
  playCounts: Record<string, number> = {};
  typesUsed = new Set<CardType>();
  quality = 0;
  storyBreaks = 0;
  forced = 0;
  goalsMet = 0;
  botches = 0;
  comebackStartCrowd = -1;
  comebackSwing = 0;
  crowdCurve: number[] = [];
  highlights: string[] = [];
  pendingKickout: { name: string; pop: number } | null = null;
  over = false;
  result: MatchResult | null = null;
  private uid = 1;
  private lastCallName = '';
  private finisherTaken = false;
  events: MatchEvent[] = [];

  constructor(cfg: MatchConfig) {
    this.cfg = cfg;
    this.rng = new Rng(cfg.seed);
    this.phases = buildPhases(cfg);
    this.maxGas = cfg.player.maxGas;
    this.gas = this.maxGas;
    this.maxEnergy = 3 + (cfg.player.gear.includes('luckyboots') ? 0 : 0);
    if (cfg.player.gear.includes('robe')) this.crowd += 10;
    this.draw = this.rng.shuffle(cfg.player.deck.map((e) => this.makeCard(e)));
  }

  get phase(): PhaseDef {
    return this.phases[this.phaseIndex];
  }

  /** Whether the current phase wants the player on offense. */
  get playerOnOffense(): boolean {
    return this.phase.offense === 'player' || this.phase.offense === 'both';
  }

  makeCard(entry: string): HandCard {
    const d = cardDef(entry);
    let displayName = d.name;
    if (d.id === 'signature') displayName = (this.cfg.player.signatureName || 'Signature Move') + (d.upgraded ? '+' : '');
    if (d.id === 'finisher') displayName = this.cfg.player.finisherName || 'Finisher';
    return { ...d, uid: this.uid++, displayName };
  }

  private emit(e: MatchEvent): void {
    this.events.push(e);
  }

  takeEvents(): MatchEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  // ------------------------------------------------------------------ turns

  start(): void {
    this.emit({ kind: 'phase', text: this.phase.name, big: true });
    this.startTurn();
  }

  private drawCards(n: number): void {
    for (let i = 0; i < n; i++) {
      if (this.hand.length >= 10) return;
      if (this.draw.length === 0) {
        if (this.discard.length === 0) return;
        this.draw = this.rng.shuffle(this.discard);
        this.discard = [];
      }
      const c = this.draw.pop();
      if (c) this.hand.push(c);
    }
  }

  private addToHand(entry: string): void {
    const c = this.makeCard(entry);
    if (this.hand.length >= 10) this.discard.push(this.hand.shift()!);
    this.hand.push(c);
  }

  startTurn(): void {
    this.turn++;
    this.playedThisTurn = 0;
    this.offenseThisTurn = 0;
    this.sellQueued = 0;
    this.reversalQueued = false;
    this.hype = 1;
    const winded = this.gas <= GAS_WINDED;
    this.energy = this.maxEnergy - (winded ? 1 : 0) + (this.turn === 1 && this.cfg.player.gear.includes('luckyboots') ? 1 : 0);

    const ph = this.phase.id;
    // Special cards for story moments.
    if (this.turnInPhase === 0) {
      if (ph === 'comeback' && this.cfg.player.role === 'face') this.addToHand('fireup');
      if (ph === 'heat' && this.cfg.player.role === 'heel') this.addToHand('cheapshot');
      if (ph === 'comeback') this.comebackStartCrowd = this.crowd;
    }
    if (ph === 'finish') {
      const id = this.cfg.winner === 'player' ? 'finisher' : 'takefinish';
      if (!this.hand.some((c) => c.id === id) && !(id === 'takefinish' && this.finisherTaken)) this.addToHand(id);
    }
    this.drawCards(5);
    if (winded && !this.hand.some((c) => c.id === 'winded')) this.addToHand('winded');

    if (ph === 'stretch') this.stretchTurn++;
    const oppOffensePhase = this.phase.offense === 'opponent';
    this.call = makeCall({
      rng: this.rng,
      phase: ph,
      oppOnOffense: oppOffensePhase,
      turnInPhase: this.turnInPhase,
      style: this.cfg.opponent.style,
      finisherName: this.cfg.opponent.finisherName,
      playerWins: this.cfg.winner === 'player',
      lastCallName: this.lastCallName,
      stretchTurn: this.stretchTurn,
    });
    if (ph === 'trade' && this.turnInPhase % 2 === 1 && this.call.kind === 'setup') {
      // In back-and-forth matches the partner takes a turn on offense.
      const moves = makeCall({ rng: this.rng, phase: 'shine', oppOnOffense: true, turnInPhase: 1, style: this.cfg.opponent.style, finisherName: '', playerWins: true, lastCallName: this.lastCallName, stretchTurn: 0 });
      this.call = moves;
    }
    this.lastCallName = this.call.name;
    if (this.call.sets?.opp) this.oppPos = this.call.sets.opp;
    if (this.call.sets?.self) this.selfPos = this.call.sets.self;
    this.emit({ kind: 'whisper', text: this.call.whisper, actor: 'opponent' });
  }

  /** Whether the opponent is attacking this turn (so sells matter). */
  get oppAttacking(): boolean {
    const k = this.call?.kind;
    return k === 'offense' || k === 'cutoff' || k === 'finisher' || k === 'cover' || k === 'rest';
  }

  canPlay(i: number): { ok: boolean; reason?: string } {
    const c = this.hand[i];
    if (!c || this.over || this.pendingKickout) return { ok: false };
    if (c.cost > this.energy) return { ok: false, reason: 'Not enough energy' };
    if (c.id === 'cover' && this.phase.id !== 'stretch') return { ok: false, reason: 'Only in the Stretch' };
    return { ok: true };
  }

  /** How much crowd a card would give right now (for previews). */
  preview(i: number): { pop: number; tags: string[] } {
    const c = this.hand[i];
    if (!c) return { pop: 0, tags: [] };
    const r = this.computePop(c, false);
    return { pop: Math.round(r.pop), tags: r.tags };
  }

  private needsMet(c: CardDef): boolean {
    if (!c.needs) return true;
    if (c.needs.opp && !c.needs.opp.includes(this.oppPos)) return false;
    if (c.needs.self && !c.needs.self.includes(this.selfPos)) return false;
    return true;
  }

  private chemMult(): number {
    return 1.3 + this.cfg.opponent.chemistry * 0.04;
  }

  private computePop(c: CardDef, commit: boolean): { pop: number; tags: string[]; storyBreak: boolean; called: boolean; met: boolean } {
    const tags: string[] = [];
    let pop = c.pop;
    const offensive = OFFENSIVE.includes(c.type);
    const ph = this.phase;
    // Story fit.
    let storyBreak = false;
    if (offensive && ph.offense === 'opponent' && c.id !== 'cheapshot') {
      storyBreak = true;
      pop *= 0.4;
      tags.push('Breaks the story');
    }
    // Setup requirement.
    const met = this.needsMet(c);
    if (c.needs) {
      if (met) {
        pop *= 1.25;
        tags.push('Set up!');
      } else {
        pop *= 0.6;
        tags.push('Not set up');
      }
    }
    // The partner's call.
    const called = !!this.call?.favors?.includes(c.type) && this.call.kind === 'setup';
    if (called) {
      pop *= this.chemMult();
      tags.push('Called!');
    }
    // Venue taste.
    const taste = this.cfg.taste?.[c.type];
    if (taste && taste !== 1) {
      pop *= taste;
      if (taste > 1) tags.push('Crowd loves it');
    }
    // Repetition.
    const n = this.playCounts[c.id] ?? 0;
    if (c.type !== 'sell' && c.type !== 'special' && c.type !== 'finisher') {
      const rep = [1, 0.8, 0.55, 0.35, 0.25][Math.min(4, n)];
      if (rep < 1) tags.push(n >= 2 ? 'Repetitive' : 'Seen it');
      pop *= rep;
    }
    // Hype from taunts.
    if (this.hype > 1 && c.type !== 'taunt') {
      pop *= this.hype;
      tags.push('Hyped');
    }
    // Comeback combo and sympathy.
    if (ph.id === 'comeback' && this.cfg.player.role === 'face' && (offensive || c.id === 'fireup')) {
      pop *= 1 + this.sympathy * 0.08;
      pop *= 1 + Math.max(0, this.offenseThisTurn) * 0.15;
      if (this.offenseThisTurn > 0) tags.push(`Combo ×${this.offenseThisTurn + 1}`);
    }
    // Specific card quirks.
    if (c.id === 'woo' && this.crowd > 50) pop *= 2;
    if (c.id === 'giantswing') pop += 2 * this.playedThisTurn;
    if (c.type === 'taunt' && this.powers.has('showstopper')) pop += 3;
    if (c.cheat && this.cfg.player.role === 'heel') pop *= 1.2;
    if (c.id === 'reversal' && this.oppAttacking && this.call && (ph.id === 'comeback' || ph.id === 'stretch' || ph.id === 'trade')) {
      pop += this.call.pop;
      tags.push('Reversed!');
    }
    // Hot crowds react bigger.
    pop *= 0.8 + this.crowd / 250;
    if (commit) {
      /* no side effects here */
    }
    return { pop, tags, storyBreak, called, met };
  }

  private gainCrowd(amount: number, quality = amount): void {
    this.crowd = Math.max(0, Math.min(100, this.crowd + amount));
    this.peak = Math.max(this.peak, this.crowd);
    this.quality += Math.max(0, quality);
  }

  private play(i: number): boolean {
    const chk = this.canPlay(i);
    if (!chk.ok) return false;
    const c = this.hand.splice(i, 1)[0];
    this.energy -= c.cost;
    this.playedThisTurn++;
    const offensive = OFFENSIVE.includes(c.type);
    const ph = this.phase;

    // Cover: pin attempt, partner kicks out late.
    if (c.id === 'cover') {
      const pop = 8 + this.lastPinPop * 0.6;
      this.gainCrowd(pop, pop * 1.2);
      this.nearfalls++;
      this.exhausted.push(c);
      this.emit({ kind: 'cover', text: `${this.cfg.player.name} covers! 1... 2... KICK OUT!`, crowd: Math.round(pop), actor: 'player', anim: 'pin', big: true });
      this.highlights.push('A near-fall that had everyone on their feet');
      this.checkGoal();
      return true;
    }

    const r = this.computePop(c, true);
    let pop = r.pop;

    // Botch check.
    let risk = (c.risk ?? 0) * (r.met ? 0.35 : 1) + (!r.met && c.needs ? 0.15 : 0);
    if (this.gas <= GAS_WINDED) risk += 0.12;
    risk -= this.cfg.player.ringIq * 0.012;
    if (c.id === 'finisher' || c.type === 'sell' || c.type === 'taunt') risk = 0;
    if (risk > 0 && this.rng.chance(risk)) {
      this.botches++;
      this.gainCrowd(-4, 0);
      this.quality -= 4;
      this.gas -= 2;
      this.discard.push(c);
      this.playCounts[c.id] = (this.playCounts[c.id] ?? 0) + 1;
      this.emit({ kind: 'botch', text: botchLine(c.displayName, this.rng), actor: 'player', anim: 'botch', card: c.displayName });
      this.hype = 1;
      if (c.sets?.self) this.selfPos = 'standing';
      return true;
    }

    // Gas.
    let gas = c.gas;
    if (this.powers.has('ironlungs') && gas > 0) gas = Math.max(0, gas - 1);
    this.gas = Math.min(this.maxGas, this.gas - gas);

    // Story-specific effects.
    if (r.storyBreak) {
      this.storyBreaks++;
      this.quality -= 4;
    }
    if (c.type === 'sell') {
      if (this.oppAttacking) {
        if (c.id === 'reversal') {
          if (ph.id === 'comeback' || ph.id === 'stretch' || ph.id === 'trade') this.reversalQueued = true;
          else {
            this.storyBreaks++;
            this.quality -= 3;
          }
        } else this.sellQueued += c.sellMult ?? 1;
        if (c.sympathy) this.sympathy = Math.min(10, this.sympathy + c.sympathy);
      } else if (c.id !== 'reversal') {
        pop *= 0.3;
      }
    } else if (c.sympathy) {
      this.sympathy = Math.min(10, this.sympathy + c.sympathy);
    }
    if (c.cheat) this.heat += 2;
    else if (offensive && this.cfg.player.role === 'heel' && ph.id === 'heat') this.heat += 1;

    if (pop > 0) this.gainCrowd(pop, pop * (r.storyBreak ? 0.3 : 1.15));
    if (c.draw) this.drawCards(c.draw);
    if (c.energy) this.energy += c.energy;
    if (c.hype) this.hype = c.hype;
    else if (c.type !== 'taunt' && c.type !== 'setup') this.hype = 1;
    if (c.power) this.powers.add(c.power);
    if (c.sets?.opp) this.oppPos = c.sets.opp;
    if (c.sets?.self) this.selfPos = c.sets.self;
    else if (offensive && this.selfPos === 'top') this.selfPos = 'standing';

    this.playCounts[c.id] = (this.playCounts[c.id] ?? 0) + 1;
    this.typesUsed.add(c.type);
    if (offensive || c.id === 'hopespot' || c.id === 'fireup') this.offenseThisTurn++;

    if (this.powers.has('workhorse') && this.playedThisTurn === 3) this.drawCards(1);

    // Pin opportunity in the stretch.
    if ((c.pin || (offensive && pop >= 10)) && ph.id === 'stretch' && !r.storyBreak) {
      this.lastPinPop = pop;
      if (!this.hand.some((h) => h.id === 'cover')) this.addToHand('cover');
    }

    if (c.exhaust) this.exhausted.push(c);
    else this.discard.push(c);

    const rep = this.playCounts[c.id] ?? 0;
    this.emit({
      kind: 'play',
      text: c.call ?? commentary(c, this.rng),
      crowd: Math.round(pop),
      actor: 'player',
      anim: c.anim,
      card: c.displayName,
      big: pop >= 14,
    });
    if (rep >= 3 && c.type !== 'sell' && c.type !== 'special') this.emit({ kind: 'chant', text: 'BOR-ING! BOR-ING!', crowd: 0 });
    else if (c.id === 'chop') this.emit({ kind: 'chant', text: 'WOOOOO!' });

    // The finisher ends it.
    if (c.id === 'finisher') {
      this.finishMatch('player');
      return true;
    }
    if (c.id === 'takefinish') this.finisherTaken = true;
    if (c.id === 'fireup') this.highlights.push('The building shook when you fired up');
    if (pop >= 22) this.highlights.push(`${c.displayName} brought the house down`);

    this.checkGoal();
    return true;
  }

  private progressFor(goal: Goal): number {
    switch (goal.kind) {
      case 'crowd':
        return this.crowd;
      case 'sympathy':
        return this.sympathy;
      case 'nearfalls':
        return this.nearfalls;
      case 'combo':
        return this.offenseThisTurn;
      case 'play':
        return this.goalProgress;
      case 'finish':
        return 0;
    }
  }

  private goalTarget(goal: Goal): number {
    switch (goal.kind) {
      case 'crowd':
        return goal.amount;
      case 'sympathy':
        return goal.amount;
      case 'nearfalls':
        return goal.count;
      case 'combo':
        return goal.count;
      case 'play':
        return goal.count;
      case 'finish':
        return 1;
    }
  }

  /** Progress shown in the UI. */
  get goalStatus(): { label: string; value: number; target: number; done: boolean } {
    const g = this.phase.goal;
    const target = this.goalTarget(g);
    const value = Math.min(target, Math.floor(this.progressFor(g)));
    return { label: g.label, value, target, done: this.goalDone };
  }

  goalDone = false;

  private checkGoal(): void {
    if (this.goalDone) return;
    const g = this.phase.goal;
    if (g.kind === 'play') {
      // Recount progress from this turn's plays is handled incrementally in countPlay.
    }
    if (this.progressFor(g) >= this.goalTarget(g) && g.kind !== 'finish') {
      this.goalDone = true;
      this.goalsMet++;
      this.quality += 10;
      this.emit({ kind: 'info', text: `Story beat landed: ${g.label}!`, big: true });
    }
  }

  /** Count plays toward 'play' goals (called from play via type checks). */
  private countPlay(c: CardDef): void {
    const g = this.phase.goal;
    if (g.kind !== 'play') return;
    if (!g.types.includes(c.type)) return;
    this.goalProgress += c.cheat && this.phase.id === 'heat' ? 2 : 1;
    if (this.powers.has('general') && (c.type === 'sell' || c.id === 'hopespot')) this.goalProgress += 1;
  }

  endTurn(): void {
    if (this.over || this.pendingKickout) return;
    const call = this.call;
    // Opponent executes their call.
    if (call && (call.kind === 'offense' || call.kind === 'cutoff' || call.kind === 'rest')) {
      if (this.reversalQueued) {
        this.emit({ kind: 'oppmove', text: `${this.cfg.player.name} reverses the ${call.name}!`, actor: 'player', anim: 'grapple' });
      } else {
        const sold = this.sellQueued > 0;
        const mult = sold ? this.sellQueued : 0.5;
        const pop = call.pop * mult * (0.8 + this.crowd / 250);
        this.gainCrowd(pop, pop * (sold ? 1.2 : 0.5));
        const hurt = Math.max(0, (call.hurt ?? 3) - (sold ? 1 : 0));
        this.gas -= hurt;
        if (!sold && this.phase.offense === 'opponent' && this.cfg.player.role === 'face') {
          this.emit({ kind: 'oppmove', text: `${this.cfg.opponent.name} hits the ${call.name}. It lands flat. Sell it next time!`, crowd: Math.round(pop), actor: 'opponent', anim: call.anim });
        } else {
          this.emit({ kind: 'oppmove', text: sold ? `${this.cfg.opponent.name} hits the ${call.name}, and you sell it like a champ!` : `${this.cfg.opponent.name} hits the ${call.name}.`, crowd: Math.round(pop), actor: 'opponent', anim: call.anim, big: sold && pop >= 14 });
        }
        if (sold && this.phase.goal.kind === 'play' && this.phase.goal.types.includes('sell')) {
          // Already counted per card.
        }
      }
    } else if (call && call.kind === 'cover') {
      const sold = this.sellQueued > 0 ? this.sellQueued : 0.6;
      const pop = call.pop * sold * (0.8 + this.crowd / 250);
      this.gainCrowd(pop, pop);
      this.gas -= call.hurt ?? 3;
      this.emit({ kind: 'oppmove', text: `${this.cfg.opponent.name} hits the ${call.name.replace(' + Cover', '')}! The cover...`, crowd: Math.round(pop), actor: 'opponent', anim: call.anim, big: true });
      this.pendingKickout = { name: call.name, pop };
      return; // UI resolves the kickout, then calls resolveKickout().
    } else if (call && call.kind === 'finisher') {
      const mult = this.finisherTaken ? 3 : 1;
      const pop = call.pop * mult * (0.8 + this.crowd / 250);
      this.gainCrowd(pop, pop * 1.4);
      this.emit({ kind: 'oppmove', text: `${this.cfg.opponent.name} hits the ${call.name}!`, crowd: Math.round(pop), actor: 'opponent', anim: 'finisher', big: true });
      this.finishMatch('opponent');
      return;
    }
    this.finishTurn();
  }

  /** t = fraction of the 3-count reached when the player kicked out (null = no input). */
  resolveKickout(t: number | null): void {
    if (!this.pendingKickout) return;
    let pop: number;
    let text: string;
    if (t === null) {
      pop = 5;
      text = 'Foot on the ropes! The ref stops the count.';
    } else if (t >= 0.9) {
      pop = 18;
      text = 'KICKED OUT AT 2.9!!!';
      this.highlights.push('A 2.9 kickout that nearly broke the building');
    } else if (t >= 0.72) {
      pop = 12;
      text = 'Kick out at two and a half!';
    } else if (t >= 0.45) {
      pop = 7;
      text = 'Kick out at two.';
    } else {
      pop = 3;
      text = 'Kick out at one? Nobody bought that.';
    }
    pop *= 0.8 + this.crowd / 250;
    this.gainCrowd(pop, pop * 1.3);
    this.nearfalls++;
    this.pendingKickout = null;
    this.emit({ kind: 'kickout', text, crowd: Math.round(pop), actor: 'player', big: t !== null && t >= 0.9 });
    this.checkGoal();
    this.finishTurn();
  }

  private finishTurn(): void {
    // Crowd cools a little each turn.
    const decay = 3 + this.crowd * 0.15;
    this.crowd = Math.max(0, this.crowd - decay);
    this.crowdCurve.push(Math.round(this.crowd));
    if (this.phase.id === 'comeback' && this.comebackStartCrowd >= 0) this.comebackSwing = Math.max(this.comebackSwing, this.peak - this.comebackStartCrowd);

    // Positions recover.
    const recover: Record<OppPos, OppPos> = { down: 'groggy', groggy: 'standing', cornered: 'standing', outside: 'standing', standing: 'standing' };
    this.oppPos = recover[this.oppPos];
    this.selfPos = 'standing';

    // Discard the hand.
    this.discard.push(...this.hand.filter((c) => !['fireup', 'cover', 'cheapshot', 'winded', 'finisher', 'takefinish'].includes(c.id)));
    this.hand = [];

    this.turnInPhase++;
    const ph = this.phase;
    // Combo goals reset each turn; check whether it was met this turn already.
    if (this.goalDone || this.turnInPhase >= ph.maxTurns) {
      if (!this.goalDone) {
        this.forced++;
        this.quality -= 6;
        this.emit({ kind: 'whisper', text: forcedLine(ph.id), actor: 'opponent' });
      }
      this.advancePhase();
    }
    if (this.over) return;

    if (this.gas <= 0 && this.phase.id !== 'finish') {
      this.emit({ kind: 'whisper', text: "You're running on fumes. Let's go home.", actor: 'opponent' });
      this.quality -= 8;
      this.forced++;
      this.phaseIndex = this.phases.length - 1;
      this.turnInPhase = 0;
      this.goalDone = false;
      this.goalProgress = 0;
      this.emit({ kind: 'phase', text: this.phase.name, big: true });
    }
    this.startTurn();
  }

  private advancePhase(): void {
    if (this.phaseIndex >= this.phases.length - 1) {
      // Finish phase timed out: the booked finish happens anyway.
      this.finishMatch(this.cfg.winner);
      return;
    }
    this.phaseIndex++;
    this.turnInPhase = 0;
    this.goalDone = false;
    this.goalProgress = 0;
    this.emit({ kind: 'phase', text: this.phase.name, big: true });
  }

  /** Called by play() so 'play' goals advance. Wrapped to keep play() readable. */
  playCard(i: number): boolean {
    const c = this.hand[i];
    if (!c) return false;
    const before = this.botches;
    const ok = this.play(i);
    if (ok && this.botches === before && c.id !== 'cover') {
      this.countPlay(c);
      this.checkGoal();
    }
    return ok;
  }

  private finishMatch(winner: 'player' | 'opponent'): void {
    if (this.over) return;
    this.over = true;
    if (this.phase.id === 'finish') {
      this.goalsMet++;
      this.quality += 12;
    }
    this.crowdCurve.push(Math.round(this.crowd));
    this.emit({ kind: 'finish', text: winner === 'player' ? '1... 2... 3! You win!' : `1... 2... 3! ${this.cfg.opponent.name} wins!`, big: true, actor: winner });
    this.result = this.score(winner);
  }

  private score(winner: 'player' | 'opponent'): MatchResult {
    const curve = this.crowdCurve;
    const late = curve.slice(Math.floor(curve.length * 0.4));
    const avgLate = late.reduce((a, b) => a + b, 0) / Math.max(1, late.length);
    const totalPhases = this.phases.length;
    const crowdScore = clamp01(avgLate / 62);
    const peakScore = clamp01(this.peak / 92);
    const storyScore = clamp01((this.goalsMet - this.forced * 0.5 - this.storyBreaks * 0.35) / totalPhases);
    let psych = 0;
    if (this.cfg.player.role === 'face' && this.phases.some((p) => p.id === 'heat')) {
      psych = clamp01(this.sympathy / 6) * 0.5 + clamp01(this.comebackSwing / 30) * 0.3;
    } else if (this.cfg.player.role === 'heel' && this.phases.some((p) => p.id === 'heat')) {
      psych = clamp01(this.heat / 8) * 0.5 + 0.3 * clamp01(this.sympathy / 4);
    } else {
      psych = 0.4 * clamp01(this.typesUsed.size / 6) + 0.1 * clamp01(this.peak / 80);
    }
    const finalCrowd = this.crowd;
    psych += finalCrowd >= this.peak * 0.8 ? 0.2 : (finalCrowd / Math.max(1, this.peak)) * 0.15;
    const workrate = clamp01(this.typesUsed.size / 6 - this.botches * 0.12 + 0.15);
    const chem = clamp01(this.cfg.opponent.chemistry / 10);
    const sum = crowdScore * 0.3 + peakScore * 0.1 + storyScore * 0.25 + clamp01(psych) * 0.2 + workrate * 0.1 + chem * 0.05;
    let stars = 0.25 + 4.75 * sum;
    stars = Math.round(Math.max(0.25, Math.min(5, stars)) * 4) / 4;
    if (stars >= 5 && (this.botches > 0 || this.forced > 0)) stars = 4.75;
    const breakdown = [
      { label: 'Crowd', value: crowdScore, note: avgLate > 60 ? 'Molten hot' : avgLate > 40 ? 'Into it' : avgLate > 22 ? 'Polite' : 'Checking their phones' },
      { label: 'Story', value: storyScore, note: this.storyBreaks ? `${this.storyBreaks} story break${this.storyBreaks > 1 ? 's' : ''}` : this.forced ? 'A little rushed' : 'Every beat landed' },
      { label: 'Psychology', value: clamp01(psych), note: this.cfg.player.role === 'face' ? (this.sympathy >= 5 ? 'They believed in you' : 'Needed more selling') : this.heat >= 6 ? 'Pure, delicious heat' : 'Could be meaner' },
      { label: 'Workrate', value: workrate, note: this.botches ? `${this.botches} botch${this.botches > 1 ? 'es' : ''}` : `${this.typesUsed.size} kinds of offense` },
      { label: 'Chemistry', value: chem, note: chem > 0.6 ? 'Like you rehearsed it' : chem > 0.3 ? 'Getting there' : 'Still strangers' },
    ];
    return {
      stars,
      winner,
      breakdown,
      peakCrowd: Math.round(this.peak),
      finalCrowd: Math.round(finalCrowd),
      botches: this.botches,
      turns: this.turn,
      highlights: [...new Set(this.highlights)].slice(0, 3),
      crowdCurve: curve,
    };
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

const BOTCH_LINES = [
  '{c}... and it goes wrong. Agnes covers her eyes.',
  'Oof. The {c} lands somewhere between "almost" and "nope."',
  "You slip on the {c}. Somebody's dad yells \"YOU MESSED UP!\"",
  'The {c} gets lost in translation. The ref winces.',
];
function botchLine(name: string, rng: Rng): string {
  return rng.pick(BOTCH_LINES).replace('{c}', name);
}

const COMMENTARY: Record<string, string[]> = {
  strike: ['What a shot!', 'Right on the button!', 'You could hear that one in the parking lot!', 'Stiff!'],
  grapple: ['Up and OVER!', 'What a throw!', 'Picture perfect!', 'Textbook!'],
  aerial: ['HE FLIES!', 'Look out below!', 'Off the top!', 'Like a bird!'],
  submission: ['Locked in tight!', 'Will they tap?', 'Wrenching on it!'],
  taunt: ['The crowd eats it up!', 'Listen to this place!', 'What a showoff!'],
  setup: ['Setting something up...', 'Where is this going?'],
  sell: ['What a bump!', 'Somebody help that poor soul!', 'The crowd is behind them!'],
  signature: ['THERE IT IS!', 'That is their bread and butter!', 'The signature!'],
  special: ['Here we go!', 'The tide is turning!'],
  power: ['Something just clicked.', 'Watch the ring general work.'],
  finisher: ['IT IS OVER!'],
};
function commentary(c: CardDef, rng: Rng): string {
  return rng.pick(COMMENTARY[c.type] ?? COMMENTARY.strike);
}

function forcedLine(id: PhaseId): string {
  const lines: Partial<Record<PhaseId, string>> = {
    lockup: "Let's get moving, the crowd's restless.",
    shine: "Okay, I'm cutting you off now.",
    heat: 'Time for your comeback. Go!',
    comeback: "Let's hit the big stuff.",
    stretch: "Let's go home.",
    trade: "Let's take it up a notch.",
  };
  return lines[id] ?? "Let's keep it moving.";
}
