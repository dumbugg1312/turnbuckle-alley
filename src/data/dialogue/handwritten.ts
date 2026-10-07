import type { Line } from './types';

/**
 * YOUR LINES. Anything written here jumps the queue: the first time one of
 * these lines fits (its `when` matches), the character says it before anything
 * else. After that it joins their regular lines, with a little extra weight.
 *
 * How to add one (full guide: docs/YOUR_LINES.md):
 *
 *   birdie: [
 *     { text: "Somebody left a tomato on my desk. I'm not asking.", when: { season: [1] } },
 *     { text: ["Two boxes in a row.", "Like this."], when: { hearts: [4, 10], place: ['insider'] } },
 *   ],
 *
 * - `text` is one string (one box) or a list (several boxes in a row).
 * - `when` is optional. Leave it out and the line can come up anywhere.
 * - Keep a box under about 140 characters so it fits on a phone.
 * - Kayfabe: a wrestler in `place: ['public']` stays in character.
 *
 * Every main character has an empty list waiting. Characters not listed here
 * can be added with their id from src/data/npcs.ts.
 */
export const HANDWRITTEN: Record<string, Line[]> = {
  // Birdie Malone. The Commissioner. Calls everybody "sugar". Runs the show, sweeps the ring.
  birdie: [],

  // Grandma (Dottie Dupree, the Duchess). On the payphone until summer, then Room 7 at the Evening Bell.
  grandma: [],

  // Pip Abernathy. Ten. Front row, cardboard belt, Pip-weight champion of the world.
  pip: [],

  // Dex Delgado. Gas station by day, high flyer by night. Wants the city; loves the town.
  dex: [],

  // Sweet Lou. Fishes the creek every morning. Gave you the Dungeon key.
  lou: [],

  // June. Runs the Hot Tag Diner. Coffee, pie, the back booth, and everybody's secrets.
  june: [],

  // Agnes Pickett. Seat A1 since 1971. Her handbag is named Gertrude.
  agnes: [],

  // Rosa Villanueva, who is La Mariposa Dorada under the mask. The taqueria. Her abuela.
  mariposa: [],

  // Mo. Mail carrier and referee. Nobody ever remembers she was there.
  mo: [],

  // Hank. Fixes everything. Built your ring back.
  hank: [],

  // Earl Odom. Librarian, and Big Earl the Mountain on Saturdays. Writes about a sparrow.
  earl: [],

  // Marigold. Sew What? on Second Street. Gear, capes, opinions.
  marigold: [],

  // Sheriff Bev. Believes every match is real and would like to arrest the villains.
  bev: [],

  // Tiny Tallbridge. Seven feet tall, bakes cakes the size of a thimble.
  tiny: [],

  // Everyone else.
  gideon: [],
  hazel: [],
  bo: [],
  buck: [],
  clint: [],
  lacey: [],
  professor: [],
  gus: [],
  doc: [],
  patty: [],
  clementine: [],
  fenwick: [],
  oakes: [],
  nadia: [],
  sami: [],
  wanda: [],
  arlo: [],
  royce: [],
  jobber: [],
  mothman: [],
};
