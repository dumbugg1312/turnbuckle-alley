/**
 * Reward registries for tapes: the story cards tapes can teach (ids and names
 * copied exactly from docs/STORYLINES.md section 4), the Hammers-edition
 * printings (section 14.1), and the gear designs Marigold can sew.
 */

export type StorySlot = 'hook' | 'twist' | 'stakes' | 'payoff' | 'segment' | 'wildcard';

export interface StoryCardInfo {
  id: string;
  name: string;
  slot: StorySlot;
  rarity: 'C' | 'U' | 'R' | 'L';
  text: string;
}

/** Every story card whose "Collected from" column includes T (tapes). */
export const STORY_CARDS: Record<string, StoryCardInfo> = Object.fromEntries(
  ([
    ['HK-04', 'The Crashed Entrance', 'hook', 'C', "Someone's big entrance is interrupted mid-song, at the key change."],
    ['HK-10', 'The Mysterious Box', 'hook', 'U', 'A gift-wrapped box sits in the middle of the ring, and nobody claims it.'],
    ['HK-14', 'The Masked Stranger', 'hook', 'R', 'A masked figure appears at ringside, says nothing and leaves.'],
    ['TW-03', 'The Mystery Partner', 'twist', 'U', '"My partner tonight is..." and nobody saw it coming.'],
    ['TW-04', 'Half a Mask', 'twist', 'R', 'A mask is pulled halfway up, and then the lights cut out.'],
    ['TW-07', 'The Double Agent', 'twist', 'R', "The hero's ally was working for the villain all along."],
    ['TW-10', 'The Fake Retirement', 'twist', 'U', 'A tearful farewell speech, and then a return two weeks later.'],
    ['TW-11', 'Swerve Within a Swerve', 'twist', 'R', 'The twist everyone guessed turns out to be a decoy.'],
    ['TW-14', 'The Belt Goes Missing', 'twist', 'U', 'The title vanishes from the trophy case.'],
    ['TW-19', 'The Audible', 'twist', 'L', 'Mid-match the finish changes, and only the two people in the ring know why.'],
    ['ST-03', 'Loser Leaves Town', 'stakes', 'R', 'The loser actually leaves the map for 2 to 6 weeks.'],
    ['ST-04', 'Mask vs. Mask', 'stakes', 'L', 'Both masks hang above the ring.'],
    ['ST-05', 'Hair vs. Hair', 'stakes', 'R', 'Clippers on a velvet pillow.'],
    ['PO-03', 'Two Out of Three Falls', 'payoff', 'C', "The old-timers' favorite: a story inside a story."],
    ['PO-06', 'Ladder Match', 'payoff', 'U', 'The prize hangs from the rafters.'],
    ['PO-07', 'Lumberjack Match', 'payoff', 'U', 'The whole locker room surrounds the ring.'],
    ['PO-09', 'Last One Standing', 'payoff', 'R', 'Stay on your feet through a ten count.'],
    ['PO-13', 'Lights Out', 'payoff', 'R', 'Night only. A match in the dark with glow-stick ropes.'],
    ['PO-18', 'Iron Hour', 'payoff', 'R', 'The most falls in sixty minutes wins.'],
    ['SG-04', 'Contract Signing', 'segment', 'U', 'A table in the ring, and the table always breaks.'],
    ['SG-06', 'Sit-Down Interview', 'segment', 'U', 'Two chairs at the commentary desk, and Gus asks the hard questions.'],
    ['SG-12', 'Parking Lot Showdown', 'segment', 'C', "After the show, under the lot's one buzzing light."],
    ['WC-01', 'Let the People Decide', 'wildcard', 'U', "The crowd's cheers pick the winner. The booked finish becomes open."],
  ] as const).map(([id, name, slot, rarity, text]) => [id, { id, name, slot, rarity, text }]),
);

export interface HammersEdition {
  id: string;
  name: string;
  year: string;
  /** The standard card it's an edition of (docs/STORYLINES.md 14.1). */
  base: string;
  baseName: string;
  story: string;
}

/**
 * Hammers-edition cards: alternate printings with Dottie and Birdie on the
 * art (STORYLINES 14.1). They're stored in ext('tapes').hammers, not in the
 * story-card owned list, because the doc gives them no ids of their own. The
 * storyline engine can map them with `base`.
 */
export const HAMMERS_EDITIONS: Record<string, HammersEdition> = Object.fromEntries(
  ([
    ['hm-velvet-gloves', 'Velvet Gloves', '1976', 'HK-02', 'The Open Challenge', 'The Hammers\' first open challenge, answered by a team that thought two women would be easy pickings.'],
    ['hm-fairgrounds-riot', "The Fairgrounds Riot of '79", '1979', 'WC-07', 'Rain Delay', 'A thunderstorm, a collapsed tarp, and the best match either of them ever had in the mud.'],
    ['hm-duchess-crowns', 'The Duchess Crowns Herself', '1980', 'ST-01', 'The Title', "Dottie wins the territory's singles title and hands it to Birdie to hold during the celebration."],
    ['hm-original-recipe', 'Original Recipe', '1981', 'WC-06', "Birdie's Old Trick", "The first time Birdie's famous switcheroo ever worked."],
    ['hm-hot-tag', "The Hot Tag Heard 'Round the County", '1982', 'PO-02', 'Tag Team Match', 'The tag the diner was later named after.'],
    ['hm-planned-breakup', 'The Planned Breakup', '1983', 'TW-01', 'The Turn', 'The booking sheet as written: Birdie was supposed to turn on Dottie.'],
    ['hm-audible', 'The Audible', '1983', 'TW-19', 'The Audible', 'The legendary tape of the Night of the Broken Belt.'],
  ] as const).map(([id, name, year, base, baseName, story]) => [id, { id, name, year, base, baseName, story }]),
);

export type DesignPattern = 'velvet' | 'sequins' | 'snowflakes' | 'stripes' | 'wings' | 'scales' | 'fringe' | 'checker' | 'plaid' | 'moth' | 'lightning' | 'stars' | 'tux' | 'flames';

export interface DesignDef {
  id: string;
  name: string;
  /** Base, accent, highlight. */
  colors: [string, string, string];
  pattern: DesignPattern;
  note: string;
}

/** Gear designs caught on tapes. Marigold sews from these ids. */
export const DESIGNS: Record<string, DesignDef> = Object.fromEntries(
  ([
    ['velvet-81', "Velvet Hammers '81 Robes", ['#5b2a6e', '#b8243c', '#f4c64f'], 'velvet', 'Plum and crimson velvet, gold piping. Two robes made to be worn side by side.'],
    ['thaw-green', 'Thaw Brawl Green', ['#2f8a5a', '#f4c64f', '#d8f0c0'], 'sequins', 'The green Dottie wore in 1981. Everybody said it was bad luck. It wasn\'t.'],
    ['blizzard-flake', 'Blizzard Bowl Snowflakes', ['#9cc8f0', '#f6fbff', '#3f74d8'], 'snowflakes', 'Ice blue with hand-stitched snowflakes. Warmer than it looks.'],
    ['lou-lavender', "Sweet Lou's Lavender Silk", ['#a98bd0', '#fbf0d9', '#6a4a9a'], 'stripes', 'Lavender silk with cream piping, built to croon in.'],
    ['mariposa-62', "La Mariposa '62", ['#f4b63f', '#1e1426', '#e2903a'], 'wings', 'Gold with black monarch wings around the eyes. A promise, not a disguise.'],
    ['midnight-sequins', 'Madame Midnight Sequins', ['#241838', '#c8c8e0', '#7a4f86'], 'sequins', 'Black sequins and a silver moon. Bring your own jeweled fan.'],
    ['copperhead', 'Copperhead Scales', ['#c8743a', '#3f6a4a', '#f0c890'], 'scales', 'Copper and swamp green. Hisses a little when you walk.'],
    ['cowboy-fringe', 'Rookie Cowboy Fringe', ['#8a5a36', '#3fb0a0', '#f2e6c9'], 'fringe', 'Suede fringe and turquoise snaps, 1993 vintage.'],
    ['neon-90s', 'Neon Nineties', ['#ff5d8f', '#b8d86a', '#2a2236'], 'lightning', 'Hot pink and lime lightning bolts. Sunglasses mandatory.'],
    ['tux-trunks', "Gentleman Jack's Tuxedo Trunks", ['#2a2236', '#f2f2f8', '#c9404c'], 'tux', 'Black trunks with a painted bow tie. Class, in 1957.'],
    ['checker-flag', 'Checkered Racer', ['#f2f2f8', '#2a2236', '#e2544a'], 'checker', 'Checkered flags down both legs. Vroom.'],
    ['harvest-plaid', 'Harvest Plaid', ['#c8643a', '#5a3a2e', '#f4b63f'], 'plaid', 'Pumpkin plaid with a hay-bale gold stripe.'],
    ['moth-dust', 'Moth Dust', ['#7a6450', '#b8b0a0', '#f4b63f'], 'moth', 'Dusty brown with pale eye-spots. Nobody knows who wore it first.'],
    ['porch-light', 'Porch Light Amber', ['#2b2140', '#f4b63f', '#fff1c2'], 'stars', 'Night plum with one warm amber glow. Spooky, but welcoming.'],
    ['rocket-stars', 'Rocket Rodeo Stars', ['#3f74d8', '#f2f2f8', '#d8434b'], 'stars', 'Stars, stripes and a lot of rhinestones.'],
    ['flame-boots', 'Hot Rod Flames', ['#2a2236', '#e2544a', '#f4b63f'], 'flames', 'Flames licking up the boots. Very 1986.'],
  ] as const).map(([id, name, colors, pattern, note]) => [id, { id, name, colors: [...colors] as [string, string, string], pattern, note }]),
);
