import type { CardDef } from './types';

/**
 * Every move in the game. Numbers are tuned with tests/match-sim.test.ts:
 * cost 1 ≈ 5-7 crowd, cost 2 ≈ 10-13, cost 3 ≈ 16-20.
 */
const LIST: CardDef[] = [
  // ----- Starters -----
  { id: 'chop', name: 'Knife-Edge Chop', type: 'strike', cost: 1, pop: 6, gas: 1, text: '+6 Crowd. The crowd goes WOOO.', call: 'WOOOO!', anim: 'strike', rarity: 'starter', plus: { pop: 9, text: '+9 Crowd. The whole building goes WOOO.' } },
  { id: 'forearm', name: 'Forearm Smash', type: 'strike', cost: 1, pop: 5, gas: 1, text: '+5 Crowd. Opponent is Groggy.', sets: { opp: 'groggy' }, anim: 'strike', rarity: 'starter', plus: { pop: 7, text: '+7 Crowd. Opponent is Groggy.' } },
  { id: 'bodyslam', name: 'Body Slam', type: 'grapple', cost: 1, pop: 6, gas: 2, text: '+6 Crowd. Opponent goes Down.', sets: { opp: 'down' }, anim: 'slam', rarity: 'starter', plus: { pop: 9 } },
  { id: 'snapsuplex', name: 'Snap Suplex', type: 'grapple', cost: 2, pop: 11, gas: 2, text: '+11 Crowd. Opponent goes Down.', sets: { opp: 'down' }, anim: 'suplex', rarity: 'starter', plus: { pop: 15 } },
  { id: 'whip', name: 'Irish Whip', type: 'setup', cost: 0, pop: 1, gas: 1, text: 'Send them into the Corner. Draw 1.', sets: { opp: 'cornered' }, draw: 1, anim: 'grapple', rarity: 'starter', plus: { draw: 2, text: 'Send them into the Corner. Draw 2.' } },
  { id: 'elbowdrop', name: 'Elbow Drop', type: 'strike', cost: 1, pop: 7, gas: 1, text: '+7 Crowd. Best on a Down opponent.', needs: { opp: ['down'] }, anim: 'drop', rarity: 'starter', plus: { pop: 10 } },
  { id: 'bump', name: 'Take the Bump', type: 'sell', cost: 1, pop: 0, gas: 2, sellMult: 2, sympathy: 1, text: "Sell their move this turn: its crowd value ×2. +1 Sympathy.", anim: 'sell', rarity: 'starter', plus: { sellMult: 2.5, text: 'Sell their move this turn: its crowd value ×2.5. +1 Sympathy.' } },
  { id: 'playcrowd', name: 'Play to the Crowd', type: 'taunt', cost: 1, pop: 4, gas: 0, hype: 1.5, text: '+4 Crowd. Your next move this turn gets ×1.5.', anim: 'taunt', rarity: 'starter', plus: { pop: 6, hype: 1.7, text: '+6 Crowd. Your next move this turn gets ×1.7.' } },

  // ----- Strikes -----
  { id: 'dropkick', name: 'Dropkick', type: 'strike', cost: 1, pop: 7, gas: 2, text: '+7 Crowd. Opponent goes Down.', sets: { opp: 'down' }, risk: 0.3, anim: 'kick', rarity: 'common', plus: { pop: 10 } },
  { id: 'clothesline', name: 'Running Clothesline', type: 'strike', cost: 1, pop: 7, gas: 1, text: '+7 Crowd. Opponent goes Down.', sets: { opp: 'down' }, anim: 'strike', rarity: 'common', plus: { pop: 10 } },
  { id: 'bigboot', name: 'Big Boot', type: 'strike', cost: 2, pop: 12, gas: 2, text: '+12 Crowd. Best on a Groggy opponent.', needs: { opp: ['groggy', 'standing'] }, sets: { opp: 'down' }, anim: 'kick', rarity: 'common', plus: { pop: 16 } },
  { id: 'tenpunch', name: 'Ten Punches in the Corner', type: 'strike', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. The crowd counts along. Needs Corner.', needs: { opp: ['cornered'] }, call: 'ONE! TWO! THREE!... TEN!', anim: 'strike', rarity: 'common', plus: { pop: 17 } },
  { id: 'lariat', name: 'Lariat', type: 'strike', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. Opponent goes Down.', sets: { opp: 'down' }, anim: 'strike', rarity: 'uncommon', plus: { pop: 17 } },
  { id: 'superkick', name: 'Superkick', type: 'strike', cost: 2, pop: 14, gas: 2, text: '+14 Crowd. Can pin in the Stretch.', pin: true, sets: { opp: 'down' }, risk: 0.2, anim: 'kick', rarity: 'uncommon', plus: { pop: 18 } },
  { id: 'runningknee', name: 'Running Knee', type: 'strike', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. Best in the Corner. Can pin.', needs: { opp: ['cornered', 'groggy'] }, pin: true, sets: { opp: 'down' }, anim: 'kick', rarity: 'uncommon', plus: { pop: 17 } },
  { id: 'stinger', name: 'Corner Splash', type: 'strike', cost: 1, pop: 8, gas: 2, text: '+8 Crowd. Needs Corner. Opponent is Groggy.', needs: { opp: ['cornered'] }, sets: { opp: 'groggy' }, anim: 'strike', rarity: 'common', plus: { pop: 11 } },
  { id: 'jab', name: 'Quick Jabs', type: 'strike', cost: 0, pop: 3, gas: 1, text: '+3 Crowd. Draw 1.', draw: 1, anim: 'strike', rarity: 'common', plus: { pop: 5 } },

  // ----- Grapples -----
  { id: 'chainwrestle', name: 'Chain Wrestling', type: 'grapple', cost: 1, pop: 4, gas: 1, text: '+4 Crowd. Draw 2. Great early.', draw: 2, anim: 'grapple', rarity: 'common', plus: { pop: 6, draw: 3, text: '+6 Crowd. Draw 3.' } },
  { id: 'armdrag', name: 'Arm Drag', type: 'grapple', cost: 1, pop: 6, gas: 1, text: '+6 Crowd. Opponent goes Down. Draw 1.', sets: { opp: 'down' }, draw: 1, anim: 'slam', rarity: 'common', plus: { pop: 8 } },
  { id: 'ddt', name: 'DDT', type: 'grapple', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. Best on a Groggy opponent. Can pin.', needs: { opp: ['groggy'] }, pin: true, sets: { opp: 'down' }, anim: 'slam', rarity: 'common', plus: { pop: 17 } },
  { id: 'spinebuster', name: 'Spinebuster', type: 'grapple', cost: 2, pop: 14, gas: 2, text: '+14 Crowd. Can pin.', pin: true, sets: { opp: 'down' }, anim: 'slam', rarity: 'uncommon', plus: { pop: 18 } },
  { id: 'powerbomb', name: 'Powerbomb', type: 'grapple', cost: 3, pop: 20, gas: 3, text: '+20 Crowd. Best on a Groggy opponent. Can pin.', needs: { opp: ['groggy', 'standing'] }, pin: true, sets: { opp: 'down' }, risk: 0.2, anim: 'bomb', rarity: 'uncommon', plus: { pop: 26 } },
  { id: 'germansuplex', name: 'German Suplex', type: 'grapple', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. Can pin (with a bridge!).', pin: true, sets: { opp: 'down' }, anim: 'suplex', rarity: 'uncommon', plus: { pop: 17 } },
  { id: 'gorillapress', name: 'Gorilla Press', type: 'grapple', cost: 3, pop: 19, gas: 4, text: '+19 Crowd. Lift them high, drop them hard.', sets: { opp: 'down' }, risk: 0.25, anim: 'lift', rarity: 'rare', plus: { pop: 24 } },
  { id: 'giantswing', name: 'Giant Swing', type: 'grapple', cost: 2, pop: 12, gas: 3, text: '+12 Crowd, +2 for each card played before it this turn. The crowd counts the spins!', call: 'ONE! TWO! THREE! FOUR!', anim: 'spin', rarity: 'rare', plus: { pop: 15 } },
  { id: 'superplex', name: 'Superplex', type: 'grapple', cost: 3, pop: 22, gas: 4, text: '+22 Crowd. Needs Corner. Huge risk, huge reward.', needs: { opp: ['cornered'] }, sets: { opp: 'down' }, risk: 0.45, anim: 'suplex', rarity: 'rare', plus: { pop: 28 } },
  { id: 'hiptoss', name: 'Hip Toss', type: 'grapple', cost: 0, pop: 3, gas: 1, text: '+3 Crowd. Opponent goes Down.', sets: { opp: 'down' }, anim: 'slam', rarity: 'common', plus: { pop: 5 } },
  { id: 'rollup', name: 'Schoolboy Roll-Up', type: 'grapple', cost: 1, pop: 6, gas: 1, text: '+6 Crowd. Can pin. Sneaky!', pin: true, anim: 'pin', rarity: 'common', plus: { pop: 9 } },

  // ----- Aerial -----
  { id: 'climb', name: 'Climb the Turnbuckle', type: 'setup', cost: 0, pop: 2, gas: 1, text: 'Go to the Top Rope. Your next Aerial this turn gets ×1.3.', sets: { self: 'top' }, hype: 1.3, anim: 'climb', rarity: 'common', plus: { pop: 4 } },
  { id: 'crossbody', name: 'Top Rope Crossbody', type: 'aerial', cost: 2, pop: 12, gas: 2, text: '+12 Crowd. Best from the Top Rope. Can pin.', needs: { self: ['top'] }, sets: { opp: 'down', self: 'standing' }, pin: true, risk: 0.3, anim: 'aerial', rarity: 'common', plus: { pop: 16 } },
  { id: 'moonsault', name: 'Moonsault', type: 'aerial', cost: 3, pop: 20, gas: 3, text: '+20 Crowd. Needs Top Rope and a Down opponent. Can pin.', needs: { self: ['top'], opp: ['down'] }, sets: { self: 'standing' }, pin: true, risk: 0.45, anim: 'aerial', rarity: 'uncommon', plus: { pop: 26 } },
  { id: 'frogsplash', name: 'Frog Splash', type: 'aerial', cost: 2, pop: 15, gas: 3, text: '+15 Crowd. Needs Top Rope and a Down opponent. Can pin.', needs: { self: ['top'], opp: ['down'] }, sets: { self: 'standing' }, pin: true, risk: 0.3, anim: 'aerial', rarity: 'uncommon', plus: { pop: 20 } },
  { id: 'missiledropkick', name: 'Missile Dropkick', type: 'aerial', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. Best from the Top Rope.', needs: { self: ['top'] }, sets: { opp: 'down', self: 'standing' }, risk: 0.25, anim: 'aerial', rarity: 'common', plus: { pop: 17 } },
  { id: 'tope', name: 'Tope Suicida', type: 'aerial', cost: 2, pop: 16, gas: 3, text: '+16 Crowd. Dive through the ropes! Needs opponent Outside.', needs: { opp: ['outside'] }, sets: { opp: 'groggy' }, risk: 0.35, anim: 'dive', rarity: 'uncommon', plus: { pop: 21 } },
  { id: 'hurricanrana', name: 'Hurricanrana', type: 'aerial', cost: 2, pop: 13, gas: 2, text: '+13 Crowd. Spin them down! Can pin.', pin: true, sets: { opp: 'down' }, risk: 0.3, anim: 'aerial', rarity: 'uncommon', plus: { pop: 17 } },
  { id: 'shootingstar', name: 'Shooting Star Press', type: 'aerial', cost: 3, pop: 25, gas: 4, text: '+25 Crowd. Needs Top Rope and a Down opponent. Breathtaking, and terrifying.', needs: { self: ['top'], opp: ['down'] }, sets: { self: 'standing' }, pin: true, risk: 0.55, anim: 'aerial', rarity: 'rare', plus: { pop: 32 } },
  { id: 'springboard', name: 'Springboard Anything', type: 'aerial', cost: 1, pop: 8, gas: 2, text: '+8 Crowd. Off the ropes, no setup needed.', sets: { opp: 'down' }, risk: 0.3, anim: 'aerial', rarity: 'common', plus: { pop: 11 } },

  // ----- Submissions -----
  { id: 'headlock', name: 'Side Headlock', type: 'submission', cost: 1, pop: 2, gas: -3, text: '+2 Crowd. Catch your breath: restore 3 Gas. +1 Sympathy if you are in trouble.', sympathy: 0, anim: 'hold', rarity: 'common', plus: { pop: 4, gas: -5, text: '+4 Crowd. Restore 5 Gas.' } },
  { id: 'bostoncrab', name: 'Boston Crab', type: 'submission', cost: 2, pop: 10, gas: -1, text: '+10 Crowd. Needs a Down opponent. The crowd begs them to tap.', needs: { opp: ['down'] }, anim: 'hold', rarity: 'common', plus: { pop: 14 } },
  { id: 'figurefour', name: 'Figure-Four Leglock', type: 'submission', cost: 2, pop: 12, gas: 0, text: '+12 Crowd. Needs a Down opponent. WOOO!', needs: { opp: ['down'] }, call: 'WOOOOO!', anim: 'hold', rarity: 'uncommon', plus: { pop: 16 } },
  { id: 'sleeper', name: 'Sleeper Hold', type: 'submission', cost: 1, pop: 5, gas: -2, text: '+5 Crowd. Restore 2 Gas. The arm drops once... twice...', anim: 'hold', rarity: 'common', plus: { pop: 7 } },

  // ----- Sells -----
  { id: 'bigbump', name: 'Big Bump', type: 'sell', cost: 2, pop: 0, gas: 3, sellMult: 3, sympathy: 2, text: "Sell their move this turn like it's the end of the world: ×3. +2 Sympathy.", anim: 'sell', rarity: 'common', plus: { sellMult: 3.5 } },
  { id: 'struggle', name: 'Fight the Hold', type: 'sell', cost: 1, pop: 4, gas: 1, sellMult: 1.6, sympathy: 2, text: 'Reach for the ropes. Sell ×1.6, +2 Sympathy, +4 Crowd.', anim: 'sell', rarity: 'common', plus: { sympathy: 3 } },
  { id: 'hopespot', name: 'Hope Spot', type: 'special', cost: 1, pop: 10, gas: 2, sympathy: 2, text: 'A flurry of offense before they cut you off! +10 Crowd, +2 Sympathy. Never breaks the story.', anim: 'strike', rarity: 'common', plus: { pop: 14 } },
  { id: 'reversal', name: 'Reversal', type: 'sell', cost: 1, pop: 9, gas: 1, sellMult: 0, text: "Turn their called move into yours. +9 Crowd (+their move's value) in the Comeback or Stretch.", anim: 'grapple', rarity: 'uncommon', plus: { pop: 13 } },
  { id: 'crawl', name: 'Crawl to the Corner', type: 'sell', cost: 0, pop: 2, gas: 0, sellMult: 1.3, sympathy: 1, text: 'Reach for a tag that is not there. Sell ×1.3, +1 Sympathy.', anim: 'sell', rarity: 'common', plus: { sympathy: 2 } },
  { id: 'kipup', name: 'Kip-Up', type: 'taunt', cost: 0, pop: 5, gas: 1, text: '+5 Crowd. Pop right back up. Draw 1.', draw: 1, anim: 'taunt', rarity: 'uncommon', plus: { pop: 8 } },

  // ----- Taunts / showmanship -----
  { id: 'strut', name: 'The Strut', type: 'taunt', cost: 1, pop: 6, gas: 0, hype: 1.4, text: '+6 Crowd. Next move ×1.4.', anim: 'taunt', rarity: 'common', plus: { pop: 8 } },
  { id: 'woo', name: 'Signature Pose', type: 'taunt', cost: 0, pop: 4, gas: 0, text: '+4 Crowd. Doubles if the crowd is above 50.', anim: 'taunt', rarity: 'common', plus: { pop: 6 } },
  { id: 'askcrowd', name: 'Cup Your Ear', type: 'taunt', cost: 1, pop: 3, gas: 0, energy: 1, text: '+3 Crowd. Gain 1 Energy next turn... no, NOW.', anim: 'taunt', rarity: 'uncommon', plus: { pop: 6 } },

  // ----- Heel tactics -----
  { id: 'rake', name: 'Rake the Eyes', type: 'strike', cost: 0, pop: 4, gas: 0, cheat: true, text: '+4 Crowd (boos count!). Opponent is Groggy.', sets: { opp: 'groggy' }, anim: 'strike', rarity: 'common', plus: { pop: 6 } },
  { id: 'choke', name: 'Choke on the Ropes', type: 'submission', cost: 1, pop: 8, gas: -1, cheat: true, text: '+8 Crowd of pure boos. Break at four!', call: 'ONE! TWO! THREE! FOUR!', anim: 'hold', rarity: 'common', plus: { pop: 11 } },
  { id: 'distract', name: 'Argue with the Ref', type: 'taunt', cost: 1, pop: 6, gas: 0, cheat: true, hype: 1.6, text: '+6 Crowd. Your next move ×1.6 while the ref is busy.', anim: 'taunt', rarity: 'common', plus: { pop: 8 } },
  { id: 'cheapshot', name: 'Cheap Shot', type: 'special', cost: 0, pop: 9, gas: 0, cheat: true, exhaust: true, text: 'Cut them off! +9 Crowd. Starts the Heat.', anim: 'strike', rarity: 'starter', plus: { pop: 12 } },
  { id: 'beg', name: 'Beg for Mercy', type: 'taunt', cost: 0, pop: 5, gas: 0, cheat: true, draw: 1, text: '+5 Crowd. Draw 1. They never fall for it. They always fall for it.', anim: 'sell', rarity: 'uncommon', plus: { pop: 7 } },

  // ----- Signature (renamed from the wrestler's persona) -----
  { id: 'signature', name: 'Signature Move', type: 'signature', cost: 2, pop: 16, gas: 2, text: '+16 Crowd. Your calling card. Can pin.', pin: true, sets: { opp: 'down' }, anim: 'slam', rarity: 'starter', plus: { pop: 21 } },

  // ----- Specials (created during the match) -----
  { id: 'fireup', name: 'FIRE UP!', type: 'special', cost: 0, pop: 12, gas: -6, energy: 2, exhaust: true, text: '+12 Crowd ×Sympathy. Restore 6 Gas. +2 Energy. The comeback is ON.', call: 'THE CROWD IS ON THEIR FEET!', anim: 'fireup', rarity: 'starter', plus: { pop: 16 } },
  { id: 'cover', name: 'Cover!', type: 'special', cost: 0, pop: 0, gas: 0, exhaust: true, text: 'Go for the pin. They will kick out at the last second... for a big pop.', anim: 'pin', rarity: 'starter' },
  { id: 'takefinish', name: 'Take the Finish', type: 'sell', cost: 0, pop: 0, gas: 0, sellMult: 3, exhaust: true, text: 'Sell their finisher perfectly. Make them look like a million bucks.', anim: 'sell', rarity: 'starter' },
  { id: 'finisher', name: 'FINISHER', type: 'finisher', cost: 0, pop: 30, gas: 0, exhaust: true, text: 'Hit your finisher. One, two, THREE.', anim: 'finisher', rarity: 'starter' },
  { id: 'winded', name: 'Winded', type: 'special', cost: 1, pop: 0, gas: -2, exhaust: true, text: 'Catch your breath. Restore 2 Gas.', anim: 'sell', rarity: 'starter' },

  // ----- Powers (persist for the match) -----
  { id: 'workhorse', name: 'Workhorse', type: 'power', cost: 1, pop: 2, gas: 0, power: 'workhorse', text: 'For the rest of the match: whenever you play 3 cards in a turn, draw 1.', rarity: 'uncommon', plus: { cost: 0 } },
  { id: 'storyteller', name: 'Ring General', type: 'power', cost: 2, pop: 2, gas: 0, power: 'general', text: 'For the rest of the match: story goals count double progress for Sells and Hope Spots.', rarity: 'rare', plus: { cost: 1 } },
  { id: 'showstopper', name: 'Showstopper', type: 'power', cost: 1, pop: 3, gas: 0, power: 'showstopper', text: 'For the rest of the match: Taunts give +3 Crowd more.', rarity: 'uncommon', plus: { cost: 0 } },
  { id: 'ironlungs', name: 'Iron Lungs', type: 'power', cost: 1, pop: 0, gas: -4, power: 'ironlungs', text: 'Restore 4 Gas. For the rest of the match: moves cost 1 less Gas (min 0).', rarity: 'uncommon', plus: { cost: 0 } },
];

export const CARDS: Record<string, CardDef> = Object.fromEntries(LIST.map((c) => [c.id, c]));

/** Resolve a deck entry (possibly 'id+') into a concrete card definition. */
export function cardDef(entry: string): CardDef & { upgraded: boolean; entry: string } {
  const upgraded = entry.endsWith('+');
  const base = CARDS[upgraded ? entry.slice(0, -1) : entry];
  if (!base) throw new Error(`Unknown card ${entry}`);
  if (!upgraded) return { ...base, upgraded, entry };
  return { ...base, ...base.plus, name: base.name + '+', upgraded, entry };
}

export const STARTER_DECK = ['chop', 'chop', 'forearm', 'forearm', 'bodyslam', 'snapsuplex', 'whip', 'elbowdrop', 'bump', 'bump', 'playcrowd', 'signature'];

/** Background-specific additions to the starter deck. */
export const BACKGROUND_CARDS: Record<string, string[]> = {
  backyard: ['springboard', 'climb'],
  amateur: ['chainwrestle', 'germansuplex'],
  theater: ['strut', 'bigbump'],
  gymrat: ['clothesline', 'spinebuster'],
  superfan: ['woo', 'hopespot'],
};

/** Cards that can show up as rewards, grouped by wrestler style. */
export const STYLE_POOLS: Record<string, string[]> = {
  powerhouse: ['lariat', 'spinebuster', 'powerbomb', 'gorillapress', 'bigboot', 'clothesline', 'bostoncrab', 'ironlungs', 'giantswing'],
  highflyer: ['dropkick', 'crossbody', 'moonsault', 'frogsplash', 'missiledropkick', 'hurricanrana', 'springboard', 'climb', 'kipup', 'tope', 'shootingstar'],
  technician: ['chainwrestle', 'armdrag', 'germansuplex', 'figurefour', 'bostoncrab', 'sleeper', 'reversal', 'rollup', 'storyteller', 'workhorse'],
  brawler: ['tenpunch', 'clothesline', 'runningknee', 'stinger', 'jab', 'bigboot', 'superkick', 'lariat'],
  showman: ['strut', 'woo', 'askcrowd', 'kipup', 'showstopper', 'playcrowd', 'superkick', 'figurefour'],
  luchador: ['hurricanrana', 'tope', 'armdrag', 'springboard', 'crossbody', 'dropkick', 'kipup', 'moonsault'],
  giant: ['bigboot', 'gorillapress', 'powerbomb', 'tenpunch', 'stinger', 'ironlungs', 'lariat'],
  heel: ['rake', 'choke', 'distract', 'beg', 'rollup', 'superkick', 'ddt'],
  sell: ['bigbump', 'struggle', 'hopespot', 'crawl', 'reversal'],
};

export function rewardPool(style: string): string[] {
  return [...new Set([...(STYLE_POOLS[style] ?? []), ...STYLE_POOLS.sell])];
}
