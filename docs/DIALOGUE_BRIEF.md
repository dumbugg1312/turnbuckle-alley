# Dialogue writing brief (for the character dialogue writers)

You are writing in-game dialogue for "Turnbuckle Alley", a cozy Stardew-Valley-style life sim set in small-town pro wrestling.

## Read first
1. **docs/_context_for_writers.md:** the world, the main story, kayfabe rules and tone.
2. **docs/CAST.md:** the cast bible, your primary source. Use each character's personality, real self vs. gimmick, gift tastes, heart event outlines, storyline seeds, sample lines, relationships and their tie to 1983.
3. **docs/STORYLINES.md:** skim it for how pitches and storylines work. You're NOT writing storyline logic, just character voice. You can foreshadow storylines.
4. **src/data/dialogue/types.ts:** the exact TypeScript contract (DialogueSet, Line, Cond, HeartEvent, EventApi).
5. **src/data/items.ts:** valid item ids for gift tastes. Use only ids that exist there.
6. **src/data/npcs.ts:** where each character spends their day (map ids like 'diner', 'library', 'taqueria', 'sportatorium', 'birdie-office', 'lockers', 'vfw', 'town', 'fair', 'school', 'sunnypines' = the Evening Bell Residence, 'grandma-room', 'airstream', 'gasstation', 'salon', 'radio', 'tailor', 'pawn', 'hardware', 'clinic', 'studio', 'bakery', 'farm', 'grandma-house').

## What to produce
For each assigned character, one file: `src/data/dialogue/chars/<id>.ts`, with `export default { ... } satisfies DialogueSet`, typed. Import with: `import type { DialogueSet } from '../types';`.

### `intro`
3–6 boxes for the first meeting. Insiders who first meet the player in public should keep kayfabe; provide `introPublic` too where relevant.

### `lines`
50 or more lines per major character (Birdie, Grandma, Rosa, Earl, Dex, Gideon, Hazel, Lou, Pip, Agnes, Mo, June, Marigold) and 30 or more for everyone else. Each line is one or more boxes. Condition them with `when` so conversations feel alive:
- **Heart tiers.** Strangers [0,2], friends [3,5], close [6,8], family [9,10] or higher. Warmth deepens as hearts rise.
- **Place.** This matters a lot because of KAYFABE:
  - `place: ['public']`: on the street, in shops and diners, anywhere marks can hear. Insiders stay in character here. A villain (heel) is gruff, menacing or vain in public, and especially cold to a hero player (`alignment: ['face']`). A hero is earnest and wholesome.
  - `place: ['insider']`: the back booth at the Hot Tag, the locker room, Birdie's office. Insiders are their real selves: talking shop, planning, gossiping about matches and the business, laughing about their own public act.
  - Marks believe it's all real, always. They react to the player's matches and storylines as real events: worried about injuries, angry at villains, proud of heroes. Bev offers to arrest villains. Patty swears it's fake but can never prove it.
  - Never have any character break kayfabe in public. It's impossible in this world.
- Weekdays, seasons (0 = Spring is the most important, since the first season is what players see first), weather (rain, sun, storm), and time of day (mornings, nights).
- Show days (`showDay: true`): Wednesdays at the VFW, Saturdays at the Sportatorium. Pre-show nerves, hype, rivalry.
- Rank (`rank: ['rookie','opener']` early in the career, `['main']` later): Birdie and the wrestlers treat the player differently as they climb.
- Flags for main-story progress (use these names): 'met_birdie', 'debuted', 'lou_key' (got the Dungeon key), 'found_belt_half', 'grandma_in_town', 'truth_revealed', 'reunion_done'.
- Some lines should be little stories: hometown history, 1983 memories (only from characters who were there), a recipe, a dream, a worry.

### `gifts` and `giftReplies`
- `gifts`: loves, likes and dislikes, taken from CAST.md tastes but mapped to existing item ids.
- `giftReplies`: 2–4 options each for love, like, neutral and dislike, plus birthday. Use the character's voice.

### `birthday`
`{ season, day }`. Spread birthdays across the year, and give 2–3 characters Spring birthdays.

### `events`
Heart events at **2, 4, 6, 8 and 10 hearts**, each a short scripted scene written with the EventApi. Romanceable characters (CAST.md lists them) also get **12 and 14** (dating, then a proposal setup).
- Each event should be 6–20 boxes, with narration plus dialogue, and 1–2 meaningful player choices that change hearts ±0, +15, +30 or −10.
- The scenes CAST.md outlines are the core. Make them land emotionally, especially the "real self behind the gimmick" reveals (e.g. Rosa choosing to show her face at 10 hearts, Earl's children's book).
- `map` sets where the event can trigger, e.g. map: 'library'. Omit it if it should trigger anywhere.
- Insider reveals happen in insider places or private homes.

Example event shape:
```ts
{
  id: 'earl-4', hearts: 4, map: 'library', title: 'Story Time',
  script: async (api) => {
    await api.narrate('Four o\'clock. Six kids sit cross-legged on the story rug. Earl is wearing a paper crown.');
    await api.sayMood('earl', 'happy', 'And the dragon said, in his biggest voice... *"PLEASE return your books on time."*');
    const c = await api.choose('Earl spots you by the shelf.', [
      { label: 'Do the dragon voice with him', value: 'join' },
      { label: 'Wave and slip away', value: 'leave' },
    ]);
    if (c === 'join') { api.hearts('earl', 30); await api.say('earl', '...You did the voice. Nobody ever does the voice.'); }
    else { api.hearts('earl', 10); }
  },
},
```

## Voice and tone
Warm, funny, specific and kind. Humor never punches down. Big emotions, but **no death, ever** (not even pets or backstory). Wrestling references are layered for both lifelong fans and newcomers, with no real wrestlers' names or trademarks.

Keep boxes short: about 140 characters max per box, so it reads on a phone. Use *emphasis* and the {name}/{ring}/{they} placeholders.

## Verify
Run `npx tsc --noEmit` from the project root; your files must have zero type errors. Don't edit files outside your assigned list. When done, report the files written and a line count per character.
