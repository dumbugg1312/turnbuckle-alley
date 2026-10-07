/**
 * Ghost wrestlers: friendly echoes of everyone who ever trained down here.
 * All names are original. Ghosts are drawn by rendering a character to an
 * offscreen canvas, tinting it cool, fading the feet into a wisp and
 * compositing it translucently with a wavy offset.
 */
import { drawCharacter, renderPortrait } from '../../gfx/characters';
import { defaultLook, type Look } from '../../gfx/look';
import type { Dir } from '../../core/state';
import type { EraId } from './eras';

export interface GhostDef {
  id: string;
  name: string;
  era: EraId;
  year: string;
  style: string;
  finisher: string;
  signature: string;
  look: Look;
  /** Something they say when you walk up. */
  hello: string;
}

type Seed = [name: string, style: string, finisher: string, signature: string, hello: string];

const ROSTER: Record<EraId, Seed[]> = {
  carnival: [
    ['Professor Augustus Brawnsworth', 'technician', "The Professor's Pretzel", 'Faculty Lounge Lock', 'Ah, a new pupil! In my day we wrestled any rube with a nickel and a dare. Most of them went home with a story.'],
    ['Iron Ida Vanderpool', 'powerhouse', 'Steam Shovel Slam', 'Boxcar Bearhug', 'They billed me as the Strongest Woman in Six Counties. It was seven, but the poster ran out of room.'],
    ['Handsome Harold Hightower', 'showman', 'The Matinee Idol', 'Curtain Call Clothesline', 'Ladies and gentlemen... oh. Just you. Well! An audience of one is still an audience.'],
    ['Mighty Mabel Moxie', 'powerhouse', 'The Big Top Drop', 'Ringmaster Rack', 'Ten cents a look, a quarter to try me. You get this one for free, sugar.'],
    ['Count Bartholomew Bellows', 'heel', 'Calliope Crush', 'Cheap Seats Choke', 'I am the villain of this tent! Boo me. Go on. ...A little louder. There it is.'],
    ['Sawdust Sam Szymanski', 'brawler', 'Midway Haymaker', 'Barker Bash', 'Sweep up after yourself. The sawdust remembers every bump.'],
    ['Little Lorenzo the Leaping', 'highflyer', 'Trapeze Tumble', 'Tent Pole Dive', 'The trapeze act let me borrow their net once. Once.'],
  ],
  territory: [
    ['Pretty Percival Pomeroy', 'showman', 'The Powder Puff', 'Perfumed Piledriver', '*sprays perfume* Pardon the atomizer, darling. A gentleman must smell lovely while he cheats.'],
    ['Lovely Lavender LaRue', 'technician', 'The Lavender Lock', 'Garden Party Suplex', 'Forty minutes, two falls, and not a hair out of place. That was the job.'],
    ["Tex 'Tumbleweed' Tolliver", 'brawler', 'Dust Devil Lariat', 'Saddle Sore Slam', "Drove six hundred miles a week in a Hudson with no heater. Wouldn't trade a mile."],
    ['Golden Boy Gil Galloway', 'highflyer', 'Sunday Drive Dropkick', 'Soda Fountain Splash', 'Every Saturday the TV truck came. We had one camera and it was ALWAYS on the heel.'],
    ['Wild Bull Bramley', 'giant', 'The Stampede', 'Feed Lot Splash', 'MOOOO. Sorry. Habit. The gimmick never really leaves you.'],
    ['Doctor Dagwood Dunsmore', 'heel', 'The House Call', 'Second Opinion Elbow', 'I have a medical degree from a school I invented on the drive here.'],
    ['Sister Sadie Sweetwater', 'powerhouse', 'Church Picnic Piledriver', 'Casserole Clothesline', 'Pray before the match, apologize after. Works every time.'],
  ],
  boxing: [
    ['Funky Freddie Fontaine', 'brawler', 'The Soul Train', 'Bell-Bottom Blast', 'Hit the bag like it owes you money, baby. Then apologize to the bag.'],
    ['Lightning Lorraine Lacy', 'highflyer', 'Flash in the Pan', 'Ring Bell Rana', 'Jump rope till you can hear the gym breathe. Then jump some more.'],
    ['Knockout Nate Nightingale', 'brawler', 'Lullaby Left Hook', 'Sleepy Time Slam', 'They called it the Lullaby. Put the whole front row to sleep, figuratively.'],
    ['Bell-Bottom Benny Barker', 'showman', 'Mirror Ball Mauler', 'Platform Shoe Shuffle', 'Mirrors are for checking your form. And your hair. Mostly your hair.'],
    ['Big Mama Marguerite', 'giant', 'Sunday Gravy Splash', 'Meatball Sandwich', 'You hungry? You look hungry. Spar first, then we eat.'],
    ['Smooth Eddie Esposito', 'heel', 'The Low Down', 'Loaded Glove Jab', 'Ref never sees the glove. Ref never sees ANYTHING. I love refs.'],
    ['Iron Jaw Josephine', 'powerhouse', 'Last Round Lariat', 'Corner Man Crush', 'Fifteen rounds and they never knocked me down. I sat down once. On purpose.'],
  ],
  aerobics: [
    ['Neon Nikki Nitro', 'highflyer', 'Feel the Burn', 'Grapevine Rana', 'And FIVE, six, seven, EIGHT! Oh! Hi! Do you have your own leg warmers?'],
    ['Spandex Steve Starlight', 'showman', 'The Grapevine', 'Jazz Hands Jawbreaker', "Tights this shiny don't happen by accident. They happen by a LOT of accidents."],
    ['Leg Warmer Lisa Lamour', 'technician', 'Step-Touch Stretch', 'Cooldown Crab', 'Stretching is the secret. Also the headband. Never forget the headband.'],
    ['Max Volume', 'brawler', 'Cranked Past Ten', 'Boombox Bash', 'WHAT? SORRY. MY ENTRANCE MUSIC WAS VERY LOUD.'],
    ['Totally Tubular Tina Tremaine', 'highflyer', 'Radical Rana', 'Mall Rat Moonsault', 'This place had a juice bar. The juice was mostly carrot. It was a dark time.'],
    ['Mister Mullet McMasters', 'giant', 'Business in the Front', 'Party in the Back', 'Business in the front. You can guess the rest.'],
    ['Valerie Vogue', 'heel', 'Strike a Pose', 'Spotlight Stealer', 'Darling, the mirror is for ME. You can borrow it when I am done. I am never done.'],
  ],
  garage: [
    ['Flannel Phil Fury', 'brawler', 'Unplugged', 'Grunge Garbage Can', 'We wrestled on a mattress in this garage every Sunday. Mom made us sandwiches.'],
    ['Camcorder Cassie Kane', 'highflyer', 'Record & Rewind', 'Tracking Adjustment', 'I taped every match we ever had. Somewhere there are forty hours of us falling off a shed.'],
    ['Big Dawg Darnell', 'giant', 'The Doghouse', 'Junkyard Splash', 'Respect the garage, little dawg. The garage gave us everything.'],
    ['X-Treme Xander Xu', 'highflyer', 'The Kickflip', 'Halfpipe Hurricanrana', 'Spelled extreme with an X. Spelled Xander with an X too. Committed to the bit.'],
    ['Backyard Bobby Blitz', 'brawler', 'Trampoline Bomb', 'Patio Furniture Powerbomb', 'NO JUMPING OFF THE ROOF, the sign says. That sign is about me.'],
    ['Dial-Up Dolores', 'technician', 'The Handshake', 'Busy Signal Bridge', 'EEEE-OOOO-KSHHHH. Sorry. That means hello where I come from.'],
    ['Pager Pete Pacheco', 'showman', 'Beep Beep Bomb', 'Two-Way Takedown', '*his pager buzzes* That is my mom. She wants me home before the streetlights.'],
  ],
  haunted: [
    ['The Phantom of the Fourth Row', 'showman', 'Encore from Beyond', 'Standing Ovation', 'I have had the same seat for a very long time. Fourth row. Aisle. Best view in the house.'],
    ['Gentleman Ghoul Godfrey', 'technician', 'The Graveyard Shift', 'Midnight Mat Return', 'Charmed, truly. Mind the lockers, they have opinions.'],
    ["Wailin' Winnie Wexler", 'highflyer', 'Banshee Bulldog', 'Howling Headscissors', 'OOOOOOOOH! ...Was that too much? People say it is too much.'],
    ['Old Timer Tobias Two-Falls', 'technician', 'Best Two of Three Centuries', 'Long Count Lock', 'Best two falls out of three, son. I have been waiting on the third one for ages.'],
    ['Boo-Boo Brannigan', 'brawler', 'The Spook Spinebuster', 'Peekaboo Punch', 'BOO! Ha! Gotcha. You should see your face. Actually you can, the mirror is right there.'],
    ['Lady Lantern', 'highflyer', "Will-o'-the-Wisp", 'Candlelight Crossbody', 'Follow the light, dear. It knows the way to everything you have forgotten.'],
    ['Midnight Molly Mortimer', 'heel', 'Lights Out', 'Creaky Door Clothesline', 'I hide in the lockers and jump out at people. It is not a gimmick. It is a lifestyle.'],
  ],
};

/** Era flavor lines a ghost may share. Birdie and Dottie trained down here; ghosts drop hints. */
export const ERA_LINES: Record<EraId, string[]> = {
  carnival: [
    'Back then the athletic show traveled with the carnival. You took on all comers, and the comers were usually farmers.',
    "The trick to the high striker? Don't swing at the bell. Swing at the floor.",
    'We wrestled under canvas in July. You have never known heat until you have known canvas in July.',
  ],
  territory: [
    'Every town had its own champion and every champion had a station wagon.',
    'Two young ladies trained down here a while back. One of them took a bump like a sack of feathers. The other called every spot before it happened.',
    'Lose clean on Wednesday, win dirty on Saturday, shake hands at the diner on Sunday. That was the territory.',
  ],
  boxing: [
    'The boxers and the wrestlers shared this gym. The boxers thought we were crazy. The boxers were correct.',
    "Somebody carved V.H. into the speed bag platform in '79. Nobody's ever sanded it off. Nobody's ever wanted to.",
    'Ring the bell at the end of every round, even if nobody is fighting. The gym likes it.',
  ],
  aerobics: [
    'The aerobics girls rented this room on Tuesdays. Best cardio in the territory. Every wrestler snuck in the back row.',
    'Sequins, kid. Every sequin is a promise to the cheap seats that they will be able to see you.',
    'A tall lady in purple sequins used to stretch right where you are standing. She called everybody "sugar."',
  ],
  garage: [
    'Every great one started somewhere with a mattress and a dream. This was ours.',
    "We'd tape our matches and mail them to the big companies. Nobody wrote back. We kept taping.",
    'An old man in a fishing hat used to come by and watch. Never said a word. Just nodded when we got it right.',
  ],
  haunted: [
    'Everybody who ever loved this business leaves a little echo down here. We are just the loud ones.',
    'Locker 13 never stays shut. Something in there wants to be found.',
    'Two halves of the same thing can be apart a long time and still fit. Ask any belt.',
    "Don't be frightened, dear. Nobody down here ever wanted to scare anyone. We just never wanted to leave the gym.",
  ],
};

const TOPS: Record<EraId, Partial<Look>> = {
  carnival: { top: 'singlet', topPattern: 'stripes', bottom: 'tights', shoes: 'wrestling-boots', facial: 'handlebar' },
  territory: { top: 'none', bottom: 'trunks', shoes: 'wrestling-boots', hair: 'pompadour', extras: [{ id: 'robe', color: '#b27ae0', pattern: 'sequins' }] },
  boxing: { top: 'tank', bottom: 'shorts', shoes: 'hightops', hair: 'afro', facial: 'mustache', extras: [{ id: 'gloves', color: '#d8434b' }] },
  aerobics: { top: 'bodysuit', bottom: 'leggings', shoes: 'sneakers', hair: 'curly', extras: [{ id: 'headband', color: '#ff5d8f' }, { id: 'socks', color: '#5ed8c8' }] },
  garage: { top: 'flannel', bottom: 'cargo', shoes: 'hightops', facial: 'goatee', extras: [{ id: 'cap', color: '#3f74d8' }] },
  haunted: { top: 'singlet', bottom: 'tights', shoes: 'wrestling-boots', hair: 'side-part', extras: [{ id: 'cape', color: '#6a3fa0' }] },
};
const COLORS = ['#d8434b', '#3f74d8', '#2fa59a', '#f4b63f', '#ff5d8f', '#6a3fa0', '#e2903a', '#4c6ab2'];
const BODIES: Look['body'][] = ['lean', 'athletic', 'stocky', 'heavy', 'athletic', 'petite'];

/** Build the ghost for a spawn on a given floor. Distinct picks per floor. */
export function ghostFor(era: EraId, year: string, pick: number, taken: Set<string>): GhostDef {
  const list = ROSTER[era];
  let i = pick % list.length;
  for (let k = 0; k < list.length && taken.has(list[i][0]); k++) i = (i + 1) % list.length;
  const [name, style, finisher, signature, hello] = list[i];
  taken.add(name);
  const c = COLORS[(pick >> 3) % COLORS.length];
  const look: Look = {
    ...defaultLook(),
    ...TOPS[era],
    body: style === 'giant' ? 'giant' : style === 'powerhouse' ? 'heavy' : BODIES[(pick >> 5) % BODIES.length],
    height: style === 'giant' ? 5 : 0,
    topColor: c,
    bottomColor: COLORS[(pick >> 6) % COLORS.length],
    shoesColor: '#3a3448',
    hairColor: ['#3b2419', '#d9a35b', '#b8b8c4', '#1c1418', '#c8442e'][(pick >> 4) % 5],
    skin: ['#f6c3a0', '#e8a982', '#b06d48', '#8d5233', '#ffdbc4'][(pick >> 2) % 5],
  };
  if (style === 'highflyer' && era !== 'aerobics') {
    look.mask = 'luchador';
    look.maskColor = c;
    look.maskAccent = '#f4b63f';
  }
  return { id: `ghost-${era}-${i}`, name, era, year, style, finisher, signature, look, hello };
}

/** The host of the Golden Ring. */
export function timekeeper(): GhostDef {
  return {
    id: 'ghost-timekeeper',
    name: 'The Timekeeper',
    era: 'haunted',
    year: 'always',
    style: 'technician',
    finisher: 'The Final Bell',
    signature: 'Ten Count',
    hello: 'Welcome to the Golden Ring. I have rung the bell for every match ever wrestled in this building. Every single one.',
    look: { ...defaultLook(), body: 'lean', top: 'referee', topColor: '#f2f2f2', topAccent: '#2b2140', bottom: 'slacks', bottomColor: '#2b2140', hair: 'bald', facial: 'walrus', hairColor: '#dcdae6', shoes: 'loafers', shoesColor: '#2b2140', extras: [{ id: 'bowtie', color: '#d8434b' }] },
  };
}

/** Barker Bill: the floor-one greeter on your first visit. */
export function barker(): GhostDef {
  return {
    id: 'ghost-barker',
    name: 'Barker Bill Bellweather',
    era: 'carnival',
    year: '1938',
    style: 'showman',
    finisher: 'The Ballyhoo',
    signature: 'Step Right Up',
    hello: '',
    look: { ...defaultLook(), body: 'stocky', top: 'buttondown', topColor: '#d8434b', topPattern: 'stripes', bottom: 'slacks', bottomColor: '#4c4774', facial: 'handlebar', hair: 'side-part', hairColor: '#3b2419', extras: [{ id: 'hat', color: '#f2e2c4' }, { id: 'bowtie', color: '#f4b63f' }] },
  };
}

// ------------------------------------------------------------------ rendering

let scratch: HTMLCanvasElement | null = null;
const GW = 44;
const GH = 52;

/** Draw a translucent, wavy, cool-tinted ghost with feet at (x, y). */
export function drawGhost(ctx: CanvasRenderingContext2D, look: Look, x: number, y: number, facing: Dir, t: number, alpha = 0.72, pose: 'idle' | 'walk' | 'wave' | 'celebrate' | 'lift' = 'idle', tint = 'rgba(122,255,214,0.42)'): void {
  if (!scratch) {
    scratch = document.createElement('canvas');
    scratch.width = GW;
    scratch.height = GH;
  }
  const s = scratch.getContext('2d')!;
  s.globalCompositeOperation = 'source-over';
  s.clearRect(0, 0, GW, GH);
  try {
    drawCharacter(s, look, GW / 2, GH - 4, { facing, pose, frame: Math.floor(t * 6), t });
  } catch {
    // character renderer mid-upgrade: fall back to a sheet ghost
    s.fillStyle = '#e8fff6';
    s.beginPath();
    s.ellipse(GW / 2, GH - 22, 8, 12, 0, 0, Math.PI * 2);
    s.fill();
  }
  s.globalCompositeOperation = 'source-atop';
  s.fillStyle = tint;
  s.fillRect(0, 0, GW, GH);
  // the feet fade into a wisp
  s.globalCompositeOperation = 'destination-out';
  const g = s.createLinearGradient(0, GH - 16, 0, GH - 2);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,1)');
  s.fillStyle = g;
  s.fillRect(0, GH - 16, GW, 16);
  s.globalCompositeOperation = 'source-over';
  const ox = Math.round(x - GW / 2);
  const oy = Math.round(y - GH + 4);
  // glow halo
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha * 0.22;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(scratch, ox + dx, oy + dy);
  ctx.restore();
  // wavy body, row by row
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let row = 0; row < GH; row += 2) {
    const off = Math.round(Math.sin(t * 3.1 + row * 0.35) * (row > GH - 20 ? 1.5 : 0.7));
    ctx.drawImage(scratch, 0, row, GW, 2, ox + off, oy + row, GW, 2);
  }
  ctx.restore();
}

const portraits = new Map<string, HTMLCanvasElement>();
export function ghostPortrait(g: GhostDef): HTMLCanvasElement {
  const hit = portraits.get(g.id);
  if (hit) return hit;
  let base: HTMLCanvasElement;
  try {
    base = renderPortrait(g.look, 'happy', 48);
  } catch {
    base = document.createElement('canvas');
    base.width = base.height = 48;
  }
  const c = document.createElement('canvas');
  c.width = c.height = 48;
  const x = c.getContext('2d')!;
  x.fillStyle = '#1e3a3a';
  x.fillRect(0, 0, 48, 48);
  x.globalAlpha = 0.8;
  x.drawImage(base, 0, 0);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-atop';
  x.fillStyle = 'rgba(122,255,214,0.35)';
  x.fillRect(0, 0, 48, 48);
  portraits.set(g.id, c);
  return c;
}
